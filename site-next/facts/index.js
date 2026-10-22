// The facts plugin: every page is a hand-written HTML file whose literals the build rebinds from the plugin
// repository and whose proof slots it fills from src/data/proof.json. Bindings (see the comment atop index.html):
//   data-fact="name"                 the element's text (or, for lists and tables, its rows) is that fact
//   data-fact-attr="attr:name …"     an attribute holds that literal; numbers replace the attribute's integers in order
//   <!-- @fact:name -->…<!-- /@fact -->  a region the build regenerates whole
//   <!-- @fact:build -->, <!-- @fact:libraries -->  one-line facts
//   <!-- @proof:slot … -->           evidence from proof.json; empty in state c
//   <html data-proof="none">         none | capture | report, from proof.json's state
// Anything unknown, or a literal that cannot be found where the markup says it is, stops the build.
import { basename, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { collectFacts, fail, siteRoot } from './collect.js';
import { elementsWith, splice, replaceRegions, replaceSlots, esc, breakCode } from './html.js';
import { simpleFacts, elementFacts, regions, assertWordedCounts, libraryRows, ENTRY_FACTS } from './render.js';
import { loadProof, proofSlots, heroRingClasses, PROOF_ATTR } from './proof.js';

const ROUTES = { 'index.html': 'home', 'install.html': 'install', 'docs.html': 'docs', 'recipes.html': 'recipes', '404.html': '404' };

export function siteBase() {
  const root = process.env.SITE_ROOT || '/';
  if (!/^\/([\w.~-]+\/)*$/.test(root)) fail(`SITE_ROOT must be an absolute path ending in "/", e.g. /awards/ (got "${root}")`);
  return root;
}

// The deployed address, for what must be absolute: canonicals, og:url, og:image, robots.txt and sitemap.xml. The
// build itself stays relative (base './'), so dist/ still serves from any folder. .github/workflows/site.yml passes
// the Pages URL; a local build names the published site.
export const DEFAULT_SITE_URL = 'https://burgisimon.github.io/awards/';
export function siteUrl() {
  const raw = process.env.SITE_URL || DEFAULT_SITE_URL;
  let u;
  try { u = new URL(raw); } catch { fail(`SITE_URL is not a URL: "${raw}"`); }
  if (!/^https?:$/.test(u.protocol) || u.search || u.hash) fail(`SITE_URL must be an http(s) address with no query or fragment (got "${raw}")`);
  if (!u.pathname.endsWith('/')) u.pathname += '/';
  return u.href;
}

// The routes a search engine should list: every page but the 404, which carries noindex.
export const INDEXED = ['index.html', 'install.html', 'docs.html', 'recipes.html'];
const pageUrl = (page) => new URL(page === 'index.html' ? './' : `./${page}`, siteUrl()).href;

// A page's own address in the head, made absolute: the canonical and og:url name the page, og:image the sheet.
function absoluteHead(html, page) {
  const base = siteUrl();
  const abs = (v) => new URL(v, base).href;
  let out = html;
  const canonical = /<link rel="canonical" href="([^"]*)"/.exec(out);
  if (!canonical) fail(`${page}: no <link rel="canonical"> in the head`);
  if (abs(canonical[1]) !== pageUrl(page)) fail(`${page}: its canonical (${canonical[1]}) does not name this page`);
  for (const prop of ['og:url', 'og:image']) {
    const re = new RegExp(`(<meta property="${prop}" content=")([^"]*)(")`);
    if (!re.test(out)) fail(`${page}: no <meta property="${prop}"> in the head`);
    out = out.replace(re, (m, a, v, z) => `${a}${esc(abs(v))}${z}`);
  }
  if (!out.includes(`<meta property="og:url" content="${esc(pageUrl(page))}"`)) fail(`${page}: og:url does not name this page`);
  return out.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${esc(pageUrl(page))}"`);
}

// The card's alt text follows the card: the proof step's screenshot card once a capture exists, else the drawing.
const DRAWN_OG_ALT = 'A black film rebate along the top of a white proof sheet, the line \u201cYour site, proofed before anyone sees it.\u201d and an install ticket ringed in red pencil.';
function ogAlt(html, page, proof) {
  const re = /(<meta property="og:image:alt" content=")[^"]*(")/;
  if (!re.test(html)) fail(`${page}: no <meta property="og:image:alt"> in the head`);
  if (proof.og && !existsSync(resolve(siteRoot, 'public', proof.og.src))) fail(`proof.json names public/${proof.og.src}, which is not on disk; run npm run proof`);
  return html.replace(re, (m, a, z) => `${a}${esc(proof.og?.alt ?? DRAWN_OG_ALT)}${z}`);
}

// Crawlers read robots.txt only at a host's root; under a project path it still says the same true thing.
export function robotsTxt() {
  const u = new URL(siteUrl());
  return `User-agent: *\nAllow: ${u.pathname}\n\nSitemap: ${new URL('sitemap.xml', u).href}\n`;
}

export function sitemapXml() {
  const urls = INDEXED.map((p) => `  <url><loc>${esc(pageUrl(p))}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function bindElements(html, simple, complex) {
  const edits = [];
  for (const el of elementsWith(html, 'data-fact')) {
    const name = el.value;
    if (ENTRY_FACTS.has(name)) continue;
    const inner = html.slice(el.innerStart, el.innerEnd);
    let text;
    if (complex[name]) text = complex[name](inner);
    else if (name in simple) {
      const v = simple[name];
      if (/<[a-z]/i.test(inner)) fail(`data-fact="${name}" holds markup; only text can be rebound`);
      if (typeof v === 'number') {
        if (!/\d+/.test(inner)) fail(`data-fact="${name}" holds no number to replace: "${inner}"`);
        text = inner.replace(/\d+/, String(v));
      } else text = esc(v);
    } else fail(`unknown fact data-fact="${name}"`);
    edits.push({ start: el.innerStart, end: el.innerEnd, text });
  }
  return splice(html, edits);
}

function bindAttributes(html, simple) {
  const edits = [];
  for (const el of elementsWith(html, 'data-fact-attr')) {
    const pairs = el.value.split(/\s+/).filter(Boolean).map((p) => p.split(':'));
    const byAttr = new Map();
    for (const [attr, name] of pairs) {
      if (!attr || !name) fail(`data-fact-attr="${el.value}" is not attr:name pairs`);
      if (ENTRY_FACTS.has(name)) continue;
      if (!(name in simple)) fail(`unknown fact data-fact-attr="${attr}:${name}"`);
      if (!byAttr.has(attr)) byAttr.set(attr, []);
      byAttr.get(attr).push(simple[name]);
    }
    let tag = el.openTag;
    for (const [attr, values] of byAttr) {
      const re = new RegExp(`(\\s${attr}=")([^"]*)(")`);
      const m = re.exec(tag);
      if (!m) fail(`data-fact-attr names ${attr}, which ${tag.slice(0, 60)} does not carry`);
      let next;
      if (values.every((v) => typeof v === 'number')) {
        const found = m[2].match(/\b\d+\b/g) ?? [];
        if (found.length !== values.length) fail(`${attr}="${m[2].slice(0, 60)}…" holds ${found.length} number(s) for ${values.length} fact(s)`);
        let i = 0;
        next = m[2].replace(/\b\d+\b/g, () => String(values[i++]));
      } else if (values.length === 1) next = esc(values[0]);
      else fail(`data-fact-attr mixes text and numbers on ${attr}`);
      tag = tag.replace(re, `$1${next}$3`);
    }
    edits.push({ start: el.start, end: el.start + el.openTag.length, text: tag });
  }
  return splice(html, edits);
}

export function transformPage(html, filename) {
  const page = basename(filename);
  const routeName = ROUTES[page];
  if (!routeName) fail(`${page} is not one of the site's routes (${Object.keys(ROUTES).join(', ')})`);
  const f = collectFacts();
  assertWordedCounts(f);
  const simple = simpleFacts(f, { siteBase: siteBase() });
  const proof = loadProof();

  // One-line facts first, so a region's lazy match can never run across them.
  let out = html
    .replace(/<!-- @fact:build\b[^]*?-->/g, `<p class="colophon__build" data-build="${esc(f.build.id)}">This is build <span class="edge">${esc(f.build.id)}</span>.</p>`)
    .replace(/<!-- @fact:libraries -->/g, libraryRows(f));
  const region = regions(f);
  out = replaceRegions(out, (name) => region[name]?.());
  const slots = proofSlots({ proof, routeName, html: out, facts: f });
  out = replaceSlots(out, 'proof', (name, params) => (slots[name] ? slots[name](params) : undefined));
  out = bindElements(out, simple, elementFacts(f));
  out = bindAttributes(out, simple);
  if (!/<html\b[^>]*\sdata-proof="none"/.test(out)) fail(`${page}: <html> has no data-proof="none" for the build to set`);
  out = out.replace(/(<html\b[^>]*\sdata-proof=")none(")/, `$1${PROOF_ATTR[proof.state]}$2`);
  const heroRing = routeName === 'home' ? heroRingClasses(proof) : [];
  if (heroRing.length) out = out.replace(/(<html\b[^>]*\sdata-proof="[a-z]+")/, `$1 data-hero-ring="${heroRing.join(' ')}"`);
  out = absoluteHead(out, page);
  out = ogAlt(out, page, proof);
  // A canonical link names a page, not an asset: Vite would otherwise try to bundle it as a file.
  out = out.replace(/<link rel="canonical"(?![^>]*vite-ignore)/g, '<link rel="canonical" vite-ignore');
  out = breakCode(out);
  if (/<!-- @(?:proof|fact):/.test(out.replace(/<!-- @fact:[a-z0-9-]+ -->[^]*?<!-- \/@fact -->/g, ''))) fail(`${page}: a slot was left unfilled`);
  return out;
}

export default function facts() {
  let build = null;
  return {
    name: 'awards-facts',
    config() {
      build = collectFacts().build;
      // window.__awards.state().build, so every capture manifest records which build it shot.
      return { define: { __AWARDS_BUILD__: JSON.stringify(build) } };
    },
    transformIndexHtml: {
      order: 'pre',
      handler: (html, ctx) => transformPage(html, ctx.filename),
    },
    // robots.txt and sitemap.xml name the deployed address, so the build writes them rather than public/.
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml() });
    },
  };
}
