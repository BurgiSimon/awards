// The facts plugin: every page is a hand-written HTML file whose literals the build rebinds from the plugin
// repository and whose proof slots it fills from src/data/proof.json. Bindings (see the comment atop index.html):
//   data-fact="name"                 the element's text (or, for lists and tables, its rows) is that fact
//   data-fact-attr="attr:name …"     an attribute holds that literal; numbers replace the attribute's integers in order
//   <!-- @fact:name -->…<!-- /@fact -->  a region the build regenerates whole
//   <!-- @fact:build -->, <!-- @fact:libraries -->  one-line facts
//   <!-- @proof:slot … -->           evidence from proof.json; empty in state c
//   <html data-proof="none">         none | capture | report, from proof.json's state
// Anything unknown, or a literal that cannot be found where the markup says it is, stops the build.
import { basename } from 'node:path';
import { collectFacts, fail } from './collect.js';
import { elementsWith, splice, replaceRegions, replaceSlots, esc } from './html.js';
import { simpleFacts, elementFacts, regions, assertWordedCounts, libraryRows, ENTRY_FACTS } from './render.js';
import { loadProof, proofSlots, PROOF_ATTR } from './proof.js';

const ROUTES = { 'index.html': 'home', 'install.html': 'install', 'docs.html': 'docs', 'recipes.html': 'recipes', '404.html': '404' };

export function siteBase() {
  const root = process.env.SITE_ROOT || '/';
  if (!/^\/([\w.~-]+\/)*$/.test(root)) fail(`SITE_ROOT must be an absolute path ending in "/", e.g. /awards/ (got "${root}")`);
  return root;
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
  // A canonical link names a page, not an asset: Vite would otherwise try to bundle "./" as a file.
  out = out.replace(/<link rel="canonical"(?![^>]*vite-ignore)/g, '<link rel="canonical" vite-ignore');
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
  };
}
