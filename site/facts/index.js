// The facts plugin: every page is a hand-written HTML file whose literals the build rebinds from the plugin
// repository. Bindings (see the comment atop index.html):
//   data-fact="name"                 the element's text (or, for lists and tables, its rows) is that fact
//   data-fact-attr="attr:name …"     an attribute holds that literal; numbers replace the attribute's integers in order
//   <!-- @fact:name -->…<!-- /@fact -->  a region the build regenerates whole (the band, the record, the colophon …)
// The recipes' frames are read from plugins/awards/recipes/_gallery/frames/ and served at ./recipes/<id>.webp.
// Anything unknown, or a literal that cannot be found where the markup says it is, stops the build.
import { basename, resolve } from 'node:path';
import { existsSync, readFileSync, createReadStream } from 'node:fs';
import { collectFacts, fail, siteRoot } from './collect.js';
import { elementsWith, splice, replaceRegions, esc, breakCode } from './html.js';
import { simpleFacts, elementFacts, regions, assertWordedCounts } from './render.js';

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

// A page's own address in the head, made absolute: the canonical and og:url name the page, og:image the card.
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
  const region = regions(f, routeName);
  let out = replaceRegions(html, (name) => region[name]?.());
  out = bindElements(out, simple, elementFacts(f));
  out = bindAttributes(out, simple);
  out = absoluteHead(out, page);
  // A canonical link names a page, not an asset: Vite would otherwise try to bundle it as a file.
  out = out.replace(/<link rel="canonical"(?![^>]*vite-ignore)/g, '<link rel="canonical" vite-ignore');
  out = breakCode(out);
  if (/<!-- @fact:/.test(out.replace(/<!-- @fact:[a-z0-9-]+ -->[^]*?<!-- \/@fact -->/g, ''))) fail(`${page}: a region was left unfilled`);
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
    // Dev: the recipes' frames straight from the plugin, at the address the build gives them.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = /^\/recipes\/([a-z0-9-]+)\.webp$/.exec(req.url?.split('?')[0] ?? '');
        if (!m) return next();
        const file = resolve(collectFacts().framesDir, `${m[1]}.webp`);
        if (!existsSync(file)) return next();
        res.setHeader('Content-Type', 'image/webp');
        createReadStream(file).pipe(res);
      });
    },
    transformIndexHtml: {
      order: 'pre',
      handler: (html, ctx) => transformPage(html, ctx.filename),
    },
    // robots.txt and sitemap.xml name the deployed address, so the build writes them rather than public/; the
    // recipes' frames are copied from the plugin, one per recipe that has one.
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml() });
      const f = collectFacts();
      for (const r of f.recipes) {
        const file = resolve(f.framesDir, `${r.id}.webp`);
        if (f.frames.has(r.id) && existsSync(file)) this.emitFile({ type: 'asset', fileName: `recipes/${r.id}.webp`, source: readFileSync(file) });
      }
    },
  };
}

export { siteRoot };
