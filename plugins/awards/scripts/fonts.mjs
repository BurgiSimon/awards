#!/usr/bin/env node
// Character-first face selection: candidates from Fontsource's catalogue (about 2,100 open-licence families),
// a rendered specimen of the project's real headline in each, and the chosen files fetched with their licence.
// The alternatives table in references/reflex-lists.md is a floor, not the shortlist; a seeded pull keeps two
// builds in the same class from landing on the same five faces. Pattern: references/patterns/typography.md.
// Usage:
//   node fonts.mjs search --category serif|sans-serif|display|monospace|handwriting [--variable] [--axis wdth]
//        [--subset latin-ext] [--weights 300,800] [--pull 5] [--seed <key>] [--json]
//   node fonts.mjs specimen --fonts <id,id,…> --text "<headline>" [--body "<paragraph>"] [--weight 700]
//        [--out .awards/type/specimen.png]
//   node fonts.mjs fetch --font <id> [--weights 400,700] [--subset latin] [--out public/fonts]
// Exit: 0 done · 1 usage · 3 browser unavailable · 4 Fontsource unreachable.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib/report.mjs';
import { resolvePlaywright, launchChromium, MISSING_MESSAGE } from './lib/playwright.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const API = 'https://api.fontsource.org/v1';
const CDN = 'https://cdn.jsdelivr.net/fontsource/fonts';
const args = parseArgs(process.argv.slice(2), { variable: 'boolean', json: 'boolean' });
const [command] = args._;
const list = (v) => (v === undefined || v === true ? [] : String(v).split(',').map((s) => s.trim()).filter(Boolean));

const get = async (url) => {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) return null;
    return /json/.test(res.headers.get('content-type') ?? '') ? res.json() : Buffer.from(await res.arrayBuffer());
  } catch { return null; }
};
const unreachable = () => { console.error(`Fontsource unreachable (${API}); choose from references/reflex-lists.md and check the licence by hand.`); process.exit(4); };

// The plugin's own reflex list, and the alternatives it has recommended so often they became a second reflex.
const reflex = JSON.parse(fs.readFileSync(path.join(here, 'data/reflex-fonts.json'), 'utf8'));
const banned = new Set(reflex.display.map((f) => f.toLowerCase()));
const worn = new Set(Object.values(reflex.verifiedOpenAlternatives).flat().filter((f) => typeof f === 'string' && !f.startsWith('Open')).map((f) => f.replace(/\s*\(.*$/, '').toLowerCase()));

// Seeded shuffle (mulberry32, as in roll.mjs, over an FNV-1a hash of the seed), so a pull is reproducible.
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// A family named after a non-Latin script (Noto Serif Ethiopic, Anek Bangla, Shippori Mincho) is built for
// that script; it leaves the pool unless --subset asks for one.
const SCRIPT_WORDS = { bengali: ['bangla'], japanese: ['jp', 'mincho', 'maru'], korean: ['kr'], 'chinese-simplified': ['sc'], 'chinese-traditional': ['tc'], 'chinese-hongkong': ['hk'], devanagari: ['hindi'], arabic: ['kufi', 'naskh', 'nastaliq'] };
const scriptNamed = (f) => {
  const words = f.family.toLowerCase().split(/\s+/);
  return f.subsets.filter((s) => !/^(latin|latin-ext|vietnamese|cyrillic|cyrillic-ext|greek|greek-ext|math|symbols|menu)$/.test(s))
    .some((s) => [s, ...(SCRIPT_WORDS[s] ?? [])].some((w) => words.includes(w)));
};

if (command === 'search') {
  if (!args.category) { console.error('usage: node fonts.mjs search --category serif|sans-serif|display|monospace|handwriting [--variable] [--axis wdth] [--pull 5] [--seed <key>]'); process.exit(1); }
  const all = await get(`${API}/fonts?category=${encodeURIComponent(args.category)}`);
  if (!Array.isArray(all)) unreachable();
  const subsets = list(args.subset ?? 'latin'), weights = list(args.weights).map(Number);
  let pool = all.filter((f) => !banned.has(f.family.toLowerCase()) && !/^(icons|other)$/.test(f.category)
    && (!args.variable || f.variable) && (args.subset || f.defSubset === 'latin') && subsets.every((s) => f.subsets.includes(s))
    && weights.every((w) => f.weights.includes(w)) && /OFL|Apache|UFL|CC0|MIT|Unlicense/i.test(f.license));
  if (!args.subset) pool = pool.filter((f) => !scriptNamed(f));
  if (args.axis) {
    // Axis data lives on a per-family endpoint; read it for the variable families only.
    const withAxes = await Promise.all(pool.filter((f) => f.variable).map(async (f) => ({ f, axes: (await get(`${API}/variable/${f.id}`))?.axes ?? {} })));
    pool = withAxes.filter(({ axes }) => list(args.axis).every((a) => a in axes)).map(({ f, axes }) => ({ ...f, axes: Object.keys(axes) }));
  }
  const random = rng(hash(String(args.seed ?? path.basename(process.cwd()))));
  const shuffled = pool.map((f) => [random(), f]).sort((a, b) => a[0] - b[0]).map(([, f]) => f);
  // Worn faces go last: still allowed, never the first thing a build reaches for.
  const ordered = [...shuffled.filter((f) => !worn.has(f.family.toLowerCase())), ...shuffled.filter((f) => worn.has(f.family.toLowerCase()))];
  const pull = ordered.slice(0, Number(args.pull ?? 5));
  const rows = pull.map((f) => ({ id: f.id, family: f.family, weights: f.weights, variable: f.variable, axes: f.axes, subsets: f.subsets, license: f.license, worn: worn.has(f.family.toLowerCase()) }));
  if (args.json) console.log(JSON.stringify({ category: args.category, pool: pool.length, seed: args.seed ?? null, candidates: rows }, null, 2));
  else {
    console.log(`${pool.length} ${args.category} famil${pool.length === 1 ? 'y' : 'ies'} after the reflex list and filters; pulled ${rows.length}:`);
    for (const r of rows) console.log(`  ${r.id.padEnd(28)} ${r.family} · ${r.variable ? `variable${r.axes ? ` (${r.axes.join(', ')})` : ''}` : r.weights.join('/')} · ${r.license}${r.worn ? ' · worn by this plugin' : ''}`);
    console.log('Render them with: node fonts.mjs specimen --fonts ' + rows.map((r) => r.id).join(',') + ' --text "<the real headline>"');
  }
} else if (command === 'specimen') {
  const ids = list(args.fonts);
  if (!ids.length || !args.text) { console.error('usage: node fonts.mjs specimen --fonts <id,id,…> --text "<headline>" [--body "<paragraph>"] [--weight 700] [--out file.png]'); process.exit(1); }
  const found = resolvePlaywright();
  if (!found) { console.error(MISSING_MESSAGE); process.exit(3); }
  const weight = Number(args.weight ?? 700);
  const meta = await Promise.all(ids.map(async (id) => ({ id, m: await get(`${API}/fonts/${id}`) })));
  if (meta.every(({ m }) => !m)) unreachable();
  const faces = meta.map(({ id, m }) => {
    if (!m) return { id, missing: true };
    const w = m.weights.includes(weight) ? weight : m.weights.reduce((a, b) => (Math.abs(b - weight) < Math.abs(a - weight) ? b : a));
    const sub = m.defSubset ?? 'latin';
    const display = m.variable ? `${CDN}/${id}:vf@latest/${sub}-wght-normal.woff2` : `${CDN}/${id}@latest/${sub}-${w}-normal.woff2`;
    const body = m.weights.includes(400) ? `${CDN}/${id}@latest/${sub}-400-normal.woff2` : display;
    return { id, family: m.family, license: m.license, variable: m.variable, w, display, body };
  });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const html = `<!doctype html><meta charset="utf-8"><style>
${faces.filter((f) => !f.missing).map((f, i) => `@font-face{font-family:"c${i}d";src:url(${f.display}) format("woff2");font-weight:100 900}@font-face{font-family:"c${i}b";src:url(${f.body}) format("woff2");font-weight:400}`).join('\n')}
body{margin:0;background:#f4f3ef;color:#151513;font:12px/1.4 ui-monospace,monospace}
section{padding:28px 48px 36px;border-bottom:1px solid #d5d3cc}
.meta{color:#55534d;margin-bottom:10px}
.h{font-size:88px;line-height:.95;letter-spacing:-0.02em;margin:0 0 18px;max-width:1300px}
.b{font-size:18px;line-height:1.5;max-width:640px;margin:0}
.phone{display:grid;grid-template-columns:1fr 330px;gap:48px;align-items:end}
.p{font-size:40px;line-height:1;letter-spacing:-0.02em;margin:0}
</style>
${faces.map((f, i) => f.missing ? `<section><div class="meta">${esc(f.id)} — not in Fontsource</div></section>` : `<section><div class="meta">${esc(f.family)} · ${f.variable ? 'variable' : f.w} · ${esc(f.license)} · ${esc(f.id)}</div>
<div class="phone"><div><p class="h" style="font-family:c${i}d;font-weight:${weight}">${esc(args.text)}</p>${args.body ? `<p class="b" style="font-family:c${i}b">${esc(args.body)}</p>` : ''}</div>
<p class="p" style="font-family:c${i}d;font-weight:${weight}">${esc(args.text)}</p></div></section>`).join('\n')}`;
  const browser = await launchChromium(found.module, { sandbox: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.setContent(html, { waitUntil: 'load', timeout: 60000 });
    const loaded = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].map((f) => [f.family, f.status]); });
    const failed = loaded.filter(([, s]) => s !== 'loaded').map(([f]) => f);
    const out = String(args.out ?? '.awards/type/specimen.png');
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
    await page.screenshot({ path: out, fullPage: true });
    console.log(`specimen: ${faces.length} face(s) → ${out}${failed.length ? ` · ${failed.length} file(s) failed to load` : ''}`);
    console.log('Record the choice and one reason per reject under DESIGN.md ## Typography.');
  } finally { await browser.close(); }
} else if (command === 'fetch') {
  if (!args.font) { console.error('usage: node fonts.mjs fetch --font <id> [--weights 400,700] [--subset latin] [--out public/fonts]'); process.exit(1); }
  const m = await get(`${API}/fonts/${args.font}`);
  if (!m) unreachable();
  const out = path.resolve(String(args.out ?? 'public/fonts'));
  const sub = String(args.subset ?? m.defSubset ?? 'latin');
  const wanted = list(args.weights).map(Number);
  const files = [];
  if (m.variable && !wanted.length) files.push([`${m.id}-${sub}-wght.woff2`, `${CDN}/${m.id}:vf@latest/${sub}-wght-normal.woff2`, '100 900']);
  else for (const w of wanted.length ? wanted : [400]) {
    if (!m.weights.includes(w)) { console.error(`${m.family} has no weight ${w} (has ${m.weights.join(', ')})`); process.exit(1); }
    files.push([`${m.id}-${sub}-${w}.woff2`, `${CDN}/${m.id}@latest/${sub}-${w}-normal.woff2`, String(w)]);
  }
  fs.mkdirSync(out, { recursive: true });
  for (const [name, url] of files) {
    const buf = await get(url);
    if (!buf) unreachable();
    fs.writeFileSync(path.join(out, name), buf);
  }
  const rel = path.relative(process.cwd(), out).split(path.sep).join('/') || '.';
  const publicPath = /^public(\/|$)/.test(rel) ? '/' + rel.replace(/^public\/?/, '') : rel;
  console.log(`${m.family} · ${m.license} · source ${m.source ?? 'unknown'} → ${files.length} file(s) in ${rel}`);
  console.log(files.map(([name, , w]) => `@font-face { font-family: "${m.family}"; src: url("${publicPath.replace(/\/$/, '')}/${name}") format("woff2"); font-weight: ${w}; font-display: swap; }`).join('\n'));
  console.log(`Record in DESIGN.md: ${m.family}, licence ${m.license}; keep the licence text with the files (${m.source ?? 'the family source'}).`);
} else {
  console.error('usage: node fonts.mjs search|specimen|fetch …');
  process.exit(1);
}
