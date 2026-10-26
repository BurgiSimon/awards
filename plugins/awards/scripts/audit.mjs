#!/usr/bin/env node
// Deterministic craft-floor audit for award-level front-ends, including the slop habits in references/anti-patterns.md.
// Static by default; --render adds in-page checks (text and focus contrast against what is behind them, overflow, rendered fonts, stuck content, measure, edges, hierarchy, nested cards, ground vs DESIGN.md, the frame: covered text, margins, lopsided and untitled sections, near-empty screens, the first screen's title).
// Usage: node audit.mjs <dir|file|url> [--json] [--quick] [--changed-file <path|->] [--render]
//   [--scope fonts,contrast,motion,a11y,layout,perf,surfaces,slop] [--ignore T01,…] [--config .awards/audit.json] [--no-write]
// Exit: 0 clean (no P0/P1) · 2 P0/P1 findings · 3 missing browser · 1 error. Quick mode exits 0 and prints hook JSON.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { parseArgs, fmtTable, now } from './lib/report.mjs';
import { contrastRatio, parseColor, hueOf } from './lib/contrast.mjs';
import { tags, attr, hasAttr, headings, stripTags, classNames, lineOf } from './lib/html.mjs';
import { stripComments, declarations, customProperties, blocks, ruleBlocks, firstFamily } from './lib/css.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const RULES = JSON.parse(fs.readFileSync(path.join(here, 'data/rules.json'), 'utf8'));
const REFLEX = JSON.parse(fs.readFileSync(path.join(here, 'data/reflex-fonts.json'), 'utf8'));
const COPY = JSON.parse(fs.readFileSync(path.join(here, 'data/reflex-copy.json'), 'utf8'));
const args = parseArgs(process.argv.slice(2), { json: 'boolean', quick: 'boolean', render: 'boolean', write: 'boolean' });

const SCAN_EXT = new Set(['.html', '.htm', '.css', '.scss', '.js', '.mjs', '.ts', '.jsx', '.tsx', '.vue', '.svelte', '.astro']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.awards', '.next', '.nuxt', '.output', '.svelte-kit', 'coverage', '_verify']);
const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif']);
const FONT_EXT = new Set(['.woff2', '.woff', '.ttf', '.otf']);

const findings = [];
// Only the plugin's own catalogue is judged at recipe severity, not any folder that happens to be called recipes.
const PLUGIN_RECIPES = path.join(here, '..', 'recipes') + path.sep;
const ignoredRules = new Set(String(args.ignore ?? '').split(',').map((s) => s.trim()).filter(Boolean));
const scopes = args.scope ? new Set(String(args.scope).split(',').map((s) => s.trim())) : null;

function add(rule, file, line, detail, weight) {
  if (ignoredRules.has(rule)) return;
  const r = RULES[rule];
  if (!r) return;
  if (scopes && !scopes.has(r.scope)) return;
  // A rule may judge the shipped catalogue harder than a user build: recipes are what gets copied.
  // An explicit weight (axe-core's impact) overrides both.
  const severity = weight ?? (r.recipeSeverity && path.resolve(String(file)).startsWith(PLUGIN_RECIPES) ? r.recipeSeverity : r.severity);
  findings.push({ rule, severity, scope: r.scope, file, line: line ?? null, message: detail ? `${r.message}: ${detail}` : r.message, fix: r.fix });
}

// ---------- target resolution ----------
let target = args._[0];
let hookInput = null;
if (args.quick && args['changed-file'] === '-') {
  try {
    hookInput = JSON.parse(fs.readFileSync(0, 'utf8'));
    target = hookInput?.tool_input?.file_path;
  } catch {
    process.exit(0);
  }
} else if (args['changed-file']) {
  target = String(args['changed-file']);
}
if (!target) {
  console.error('usage: node audit.mjs <dir|file|url> [options]');
  process.exit(args.quick ? 0 : 1);
}

const isUrl = /^https?:\/\//i.test(String(target));
if (isUrl && !args.render) {
  console.error('URL audits require --render; static audits need local source files.');
  process.exit(1);
}

// `.awards/` and the `## Exceptions` list belong beside AWARDS.md, never beside the shell. Walking
// up from the target instead of trusting cwd is what keeps a run from inside `public/` from writing
// its report there — Vite copies `public/` into `dist/`, so that report shipped.
// The nearest AWARDS.md wins over CLAUDE_PROJECT_DIR, so a build in a subfolder of the open
// project is still audited; the walk stops at that folder when the target lies inside it.
const ownerOf = (from, stop) => {
  for (let d = from; ; d = path.dirname(d)) {
    if (fs.existsSync(path.join(d, 'AWARDS.md'))) return d;
    if (d === stop || d === path.dirname(d)) return null;
  }
};
const targetDir = isUrl ? null : (() => {
  const abs = path.resolve(String(target));
  return fs.existsSync(abs) && fs.statSync(abs).isDirectory() ? abs : path.dirname(abs);
})();
const envProject = process.env.CLAUDE_PROJECT_DIR ? path.resolve(process.env.CLAUDE_PROJECT_DIR) : null;
const within = (dir, root) => { const r = path.relative(root, dir); return !r.startsWith('..') && !path.isAbsolute(r); };
const projectDir = (targetDir && ownerOf(targetDir, envProject && within(targetDir, envProject) ? envProject : null)) || envProject || process.cwd();
if (args.quick) {
  // The hook is inert outside award-level projects and for non-UI files.
  // AWARDS_HOOK=0 or the plugin's `hooks_enabled` setting turned off (CLAUDE_PLUGIN_OPTION_HOOKS_ENABLED) silences it.
  if (!fs.existsSync(path.join(projectDir, 'AWARDS.md')) || process.env.AWARDS_HOOK === '0' || /^(false|0)$/.test(process.env.CLAUDE_PLUGIN_OPTION_HOOKS_ENABLED ?? '')) process.exit(0);
  const directory = !isUrl && fs.existsSync(target) && fs.statSync(target).isDirectory();
  if (!directory && !SCAN_EXT.has(path.extname(String(target)).toLowerCase())) process.exit(0);
}

const files = [];
if (!isUrl) {
  const abs = path.resolve(String(target));
  if (!fs.existsSync(abs)) {
    if (args.quick) process.exit(0);
    console.error(`not found: ${abs}`);
    process.exit(1);
  }
  if (fs.statSync(abs).isDirectory()) walk(abs);
  else files.push(abs);
}
function walk(dir, out = files, depth = 0) {
  if (depth > 8) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      if (!SKIP_DIRS.has(ent.name) && !ent.name.startsWith('.')) walk(path.join(dir, ent.name), out, depth + 1);
    } else {
      out.push(path.join(dir, ent.name));
    }
  }
}

// ---------- exceptions ----------
// `C02 — reason` accepts a rule everywhere; `C01@src/night.html — reason` or `L10@mobile — reason` only where the
// finding's file or viewport label contains that scope. The template's own comment example is not an exception.
const exceptions = new Set();
const scoped = [];
const awardsMd = [...new Set([path.join(projectDir, 'AWARDS.md'), !isUrl && fs.statSync(path.resolve(String(target))).isDirectory() ? path.join(path.resolve(String(target)), 'AWARDS.md') : null].filter(Boolean))];
for (const p of awardsMd) {
  if (!fs.existsSync(p)) continue;
  const md = fs.readFileSync(p, 'utf8');
  const sec = md.split(/^## Exceptions/m)[1]?.split(/^## /m)[0]?.replace(/<!--[\s\S]*?-->/g, '');
  if (!sec) continue;
  for (const m of sec.matchAll(/\b([A-Z]\d{2})(?:@([^\s—–,;]+))?/g)) {
    if (m[2]) scoped.push({ rule: m[1], scope: m[2].replace(/^\.\//, '') });
    else exceptions.add(m[1]);
  }
}
if (args.config && fs.existsSync(String(args.config))) {
  try {
    const cfg = JSON.parse(fs.readFileSync(String(args.config), 'utf8'));
    for (const r of cfg.ignore || []) exceptions.add(r);
  } catch {}
}

// ---------- read sources ----------
const sources = [];
for (const f of files) {
  const ext = path.extname(f).toLowerCase();
  if (SCAN_EXT.has(ext)) {
    let text = fs.readFileSync(f, 'utf8');
    // `audit-ignore: T01` covers the file; `audit-ignore-next-line: T01` only the line below it.
    for (const m of text.matchAll(/audit-ignore(-next-line)?:\s*([A-Z]\d{2}(?:\s*,\s*[A-Z]\d{2})*)/g)) {
      const at = m[1] ? `:${lineOf(text, m.index) + 1}` : '';
      for (const id of m[2].split(',')) exceptions.add(`${id.trim()}@${f}${at}`);
    }
    sources.push({ file: f, ext, text });
  }
}
const rel = (f) => { if (isUrl || !path.isAbsolute(f)) return f; const r = path.relative(process.cwd(), f); return r.startsWith('..') ? f : r || f; };
const htmlSources = sources.filter((s) => ['.html', '.htm', '.vue', '.svelte', '.astro', '.jsx', '.tsx'].includes(s.ext));
const cssSources = sources.filter((s) => ['.css', '.scss'].includes(s.ext));
const jsSources = sources.filter((s) => ['.js', '.mjs', '.ts', '.jsx', '.tsx', '.vue', '.svelte', '.astro'].includes(s.ext));
const allText = sources.map((s) => s.text).join('\n');
// CSS embedded in HTML/framework files counts as CSS too.
const cssText = stripComments(cssSources.map((s) => s.text).join('\n') + '\n' + htmlSources.map((s) => (s.text.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || []).join('\n')).join('\n'));
const jsText = jsSources.map((s) => s.text).join('\n') + '\n' + htmlSources.map((s) => (s.text.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || []).join('\n')).join('\n');

// The edit hook sees one file, but "is this handled anywhere?" is a project question: the
// reduced-motion branch, :focus-visible or the keydown handler usually lives in another module.
// Those conditions read the whole project; findings are still reported for the edited file only.
let projectAll = allText;
let projectCss = cssText;
let projectJs = jsText;
if ((args.quick || args['changed-file']) && !isUrl && files.length === 1 && fs.existsSync(path.join(projectDir, 'AWARDS.md'))) try {
  const around = [];
  walk(projectDir, around);
  const texts = { all: [], css: [], js: [] };
  let bytes = 0;
  for (const f of around) {
    const ext = path.extname(f).toLowerCase();
    if (!SCAN_EXT.has(ext)) continue;
    const size = fs.statSync(f).size;
    if (bytes + size > 16 * 1024 * 1024) break;
    bytes += size;
    const text = fs.readFileSync(f, 'utf8');
    texts.all.push(text);
    if (['.css', '.scss'].includes(ext)) texts.css.push(text);
    if (['.html', '.htm', '.vue', '.svelte', '.astro', '.jsx', '.tsx'].includes(ext)) texts.css.push(...(text.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || []));
    if (['.js', '.mjs', '.ts', '.jsx', '.tsx', '.vue', '.svelte', '.astro'].includes(ext)) texts.js.push(text);
    else if (['.html', '.htm'].includes(ext)) texts.js.push(...(text.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || []));
  }
  projectAll = allText + '\n' + texts.all.join('\n');
  projectCss = cssText + '\n' + stripComments(texts.css.join('\n'));
  projectJs = jsText + '\n' + texts.js.join('\n');
} catch {
  // An unreadable corner of the project leaves the edited file's own context in place.
}

function eachCss(fn) {
  for (const s of cssSources) fn(s.file, stripComments(s.text));
  for (const s of htmlSources) {
    for (const m of s.text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) fn(s.file, stripComments(m[1]), lineOf(s.text, m.index) - 1);
  }
}
function eachJs(fn) {
  for (const s of jsSources) fn(s.file, s.text);
  for (const s of htmlSources) {
    for (const m of s.text.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)) fn(s.file, m[1], lineOf(s.text, m.index) - 1);
  }
}

// ---------- slop helpers ----------
// Tailwind's indigo/violet/purple/fuchsia/cyan 400–600: the palette a generator reaches for when nobody chose one.
const FRAMEWORK_HUES = ['#818cf8', '#6366f1', '#4f46e5', '#a78bfa', '#8b5cf6', '#7c3aed', '#c084fc', '#a855f7', '#9333ea', '#d946ef', '#22d3ee', '#06b6d4'];
// cubic-bezier with a y control point outside 0..1 overshoots, which is bounce by another name.
const BEZIER = /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/gi;
const overshoots = (text) => [...text.matchAll(BEZIER)].filter((m) => [m[2], m[4]].some((y) => Number(y) > 1 || Number(y) < 0));
let tokenProps = null;
function colorsIn(value) {
  tokenProps ??= customProperties(projectCss);
  const out = [];
  for (const m of String(value).matchAll(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|var\(--([\w-]+)\)/gi)) {
    const c = parseColor(m[1] ? tokenProps[m[1]] : m[0]);
    if (c) out.push(hueOf(c));
  }
  return out;
}

// ---------- rules: fonts ----------
const reflex = new Set(REFLEX.display.map((f) => f.toLowerCase()));
eachCss((file, css, off = 0) => {
  for (const d of declarations(css, 'font-family')) {
    const fam = firstFamily(d.value);
    if (reflex.has(fam.toLowerCase())) add('T01', file, lineOf(css, d.index) + off, fam);
  }
  for (const d of declarations(css, 'font-size')) {
    const m = d.value.match(/(\d+(?:\.\d+)?)vw/);
    if (m && Number(m[1]) > 12) add('T03', file, lineOf(css, d.index) + off, `${m[1]}vw`);
    else if (m && !/clamp\(/.test(d.value) && Number(m[1]) >= 6) add('T03', file, lineOf(css, d.index) + off, `unclamped ${m[1]}vw`);
  }
  for (const d of declarations(css, 'letter-spacing')) {
    const m = d.value.match(/(-\d*\.?\d+)em/);
    if (m && Number(m[1]) < -0.06) add('T04', file, lineOf(css, d.index) + off, d.value);
  }
  for (const b of blocks(css, /@font-face/)) {
    if (!/font-display\s*:/i.test(b.body)) add('T05', file, lineOf(css, b.index) + off);
  }
  if (/@font-face/.test(css) && !/size-adjust\s*:/i.test(css)) add('T06', file, null);
  if (/scroll-behavior\s*:\s*smooth/i.test(css) && /new\s+Lenis|from\s+['"]lenis|lenis\/react|lenis\/vue/i.test(projectJs)) add('M05', file, lineOf(css, css.search(/scroll-behavior/i)) + off);
  const wc = declarations(css, 'will-change').filter((d) => !/auto/i.test(d.value));
  if (/\*\s*\{[^}]*will-change/.test(css)) add('M04', file, null, 'on *');
  else if (wc.length > 5) add('M04', file, null, `${wc.length} declarations`);
  for (const b of blocks(css, /@media[^{]*prefers-reduced-motion/)) {
    if (/animation-duration\s*:\s*0?\.0*1ms\s*!important/i.test(b.body) && /\*/.test(b.body)) add('M02', file, lineOf(css, b.index) + off);
  }
  for (const d of declarations(css, 'transition')) {
    if (/^(all|width|height|top|left|margin)\b/i.test(d.value)) add('M07', file, lineOf(css, d.index) + off, `transition: ${d.value.slice(0, 40)}`);
  }
  for (const d of declarations(css, 'background-clip|-webkit-background-clip')) {
    if (/text/i.test(d.value)) add('C04', file, lineOf(css, d.index) + off);
  }
  for (const d of declarations(css, 'width')) {
    const m = d.value.match(/^(\d+)px$/);
    if (m && Number(m[1]) > 600) add('L01', file, lineOf(css, d.index) + off, d.value);
    if (/^100vw$/.test(d.value) && !/overflow(-x)?\s*:\s*(hidden|clip)/i.test(css)) add('L02', file, lineOf(css, d.index) + off);
  }
  for (const d of declarations(css, 'outline')) {
    if (/^(none|0)$/i.test(d.value) && !/:focus-visible/.test(projectCss)) add('A07', file, lineOf(css, d.index) + off);
  }
  const bf = declarations(css, 'backdrop-filter|-webkit-backdrop-filter').filter((d) => !/none/i.test(d.value));
  if (bf.length > 3) add('X04', file, null, `${bf.length} declarations`);
  for (const d of declarations(css, 'box-shadow')) {
    if (/^-?\d+px\s+-?\d+px\s+0(px)?(\s|$)/.test(d.value) && !/^0px\s+0px/.test(d.value)) add('X05', file, lineOf(css, d.index) + off, d.value.slice(0, 30));
  }
  for (const d of declarations(css, 'border-left|border-right')) {
    const m = d.value.match(/^(\d+)px/);
    if (m && Number(m[1]) >= 3) add('X06', file, lineOf(css, d.index) + off, d.value.slice(0, 30));
  }
  for (const m of css.matchAll(new RegExp(`(${FRAMEWORK_HUES.join('|')})\\b`, 'gi'))) {
    add('X12', file, lineOf(css, m.index) + off, m[1]);
    break;
  }
  for (const m of overshoots(css)) add('X13', file, lineOf(css, m.index) + off, m[0]);
  for (const r of ruleBlocks(css)) {
    const line = lineOf(css, r.index) + off;
    const bg = declarations(r.body, 'background|background-image').map((d) => d.value).join(' ');
    // Hairlines (1–2px stops) tiled by a repeat or a background-size: graph paper as texture. Wider bands are drawn art.
    const hairlines = [...bg.matchAll(/(repeating-)?linear-gradient\((?:[^()]|\([^()]*\))*\)/gi)].some((g) => /[\s(,][12]px\b/.test(g[0]) && (g[1] || /background-size\s*:/i.test(r.body)));
    if (hairlines) add('X09', file, line);
    const ground = /(^|[\s,>])(html|body|main|section|header|\.hero[\w-]*)\s*$|::?(before|after)\s*$/i.test(r.selector);
    if (ground && /radial-gradient/i.test(bg) && colorsIn(bg).some((c) => c.sat > 0.4)) add('X10', file, line);
    for (const g of bg.matchAll(/(linear|radial|conic)-gradient\((?:[^()]|\([^()]*\))*\)/gi)) {
      const hues = colorsIn(g[0]).filter((c) => c.sat > 0.4 && c.hue >= 230 && c.hue <= 330).map((c) => c.hue);
      if (hues.length >= 2 && Math.max(...hues) - Math.min(...hues) >= 20) add('X12', file, line, 'purple/violet/pink gradient');
    }
    for (const d of declarations(r.body, 'box-shadow|text-shadow')) {
      for (const s of d.value.matchAll(/(?:^|,)\s*0(?:px)?\s+0(?:px)?\s+(\d+)px(?:\s+-?\d+px)?\s+(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|var\(--[\w-]+\))/gi)) {
        if (Number(s[1]) >= 12 && colorsIn(s[2]).some((c) => c.sat > 0.4)) add('X11', file, line, d.value.slice(0, 40));
      }
    }
    if (/\binfinite\b/.test(r.body) && /animation(-name)?\s*:[^;]*\b[\w-]*(pulse|ping|blink|caret|glow|float|bob|breathe)[\w-]*/i.test(r.body)) add('X14', file, line, r.selector.slice(0, 40));
    if (/:hover[^,]*\b(img|picture|video)\b|\b(img|picture)\b[^,]*:hover/i.test(r.selector) && /(^|[;\s])(transform\s*:[^;]*(scale|rotate)|scale\s*:|rotate\s*:)/i.test(r.body)) add('X15', file, line, r.selector.slice(0, 40));
    const wide = [...r.body.matchAll(/box-shadow\s*:[^;]*?-?\d+(?:px)?\s+-?\d+(?:px)?\s+(\d+)px/gi)].some((s) => Number(s[1]) >= 24);
    if (/(^|[;\s])border\s*:\s*1px\b/i.test(r.body) && wide) add('X19', file, line, r.selector.slice(0, 40));
    const topBottom = declarations(r.body, 'border-top|border-bottom').find((d) => Number((d.value.match(/^(\d+)px/) || [])[1]) >= 3);
    if (topBottom && declarations(r.body, 'border-radius').some((d) => !/^0(px)?$/.test(d.value))) add('X06', file, line, `${topBottom.prop}: ${topBottom.value.slice(0, 24)} on a rounded box`);
    if (r.selector.split(',').some((s) => /(^|[\s>])(body|p|li)$/i.test(s.trim()))) {
      const why = [];
      if (/text-align\s*:\s*justify/i.test(r.body)) why.push('justified');
      if (/text-transform\s*:\s*uppercase/i.test(r.body)) why.push('capitals');
      const lh = declarations(r.body, 'line-height').map((d) => d.value.match(/^([\d.]+)(em)?$/)).find(Boolean);
      if (lh && Number(lh[1]) < 1.3) why.push(`line-height ${lh[0]}`);
      const ls = declarations(r.body, 'letter-spacing').map((d) => d.value.match(/^([\d.]+)em$/)).find(Boolean);
      if (ls && Number(ls[1]) > 0.05) why.push(`letter-spacing ${ls[0]}`);
      const size = declarations(r.body, 'font-size').map((d) => d.value.match(/^([\d.]+)(px|rem)$/)).find(Boolean);
      if (size && Number(size[1]) < (size[2] === 'px' ? 14 : 0.875)) why.push(`font-size ${size[0]}`);
      if (why.length) add('T07', file, line, `${r.selector.slice(0, 30)}: ${why.join(', ')}`);
    }
  }
});

// ---------- rules: colour ----------
{
  const props = customProperties(cssText);
  const groundKeys = Object.keys(props).filter((k) => /^(ground|bg|background|surface|paper|canvas|color-bg|color-background)/.test(k));
  const inkKeys = Object.keys(props).filter((k) => /^(ink|text|fg|foreground|color-text|color-ink)/.test(k));
  for (const g of groundKeys) for (const i of inkKeys) {
    const ratio = contrastRatio(props[g], props[i]);
    if (ratio !== null && ratio < 4.5) add('C01', 'tokens', null, `--${i} on --${g} = ${ratio}:1`);
  }
  // The body selector itself, not .body, tbody or #body.
  const bodyBg = cssText.match(/(?:^|[\s,}])body\s*\{[^}]*background(?:-color)?\s*:\s*([^;}]+)/i);
  const bodyFg = cssText.match(/(?:^|[\s,}])body\s*\{[^}]*[^-]color\s*:\s*([^;}]+)/i);
  if (bodyBg && bodyFg) {
    const ratio = contrastRatio(bodyBg[1].trim(), bodyFg[1].trim());
    if (ratio !== null && ratio < 4.5) add('C01', 'body', null, `${bodyFg[1].trim()} on ${bodyBg[1].trim()} = ${ratio}:1`);
  }
  for (const g of groundKeys) {
    const v = props[g].toLowerCase().replace(/\s/g, '');
    if (/^#(000|000000|fff|ffffff)$/.test(v)) add('C02', 'tokens', null, `--${g}: ${props[g]}`);
  }
  const hues = new Set();
  for (const v of Object.values(props)) {
    const c = parseColor(v);
    if (!c) continue;
    const { hue, sat } = hueOf(c);
    if (hue !== null && sat > 0.15) hues.add(Math.round(hue / 15));
  }
  if (hues.size > 6) add('C03', 'tokens', null, `${hues.size} hue families`);
}

// ---------- rules: motion (JS) ----------
{
  const animates = /gsap\.|animate\(|createTimeline|@keyframes|transition\s*:|animation\s*:|new\s+Lenis|ScrollTrigger/i.test(allText);
  // A comment that mentions the query is not a reduced-motion branch.
  const hasRM = /prefers-reduced-motion/i.test(projectAll.replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g, '').replace(/(^|[^:'"\\])\/\/.*$/gm, '$1'));
  if (animates && !hasRM) add('M01', 'project', null);
  eachJs((file, js, off = 0) => {
    for (const m of js.matchAll(/scrub\s*:/g)) {
      // Judge only the tween or trigger that owns this scrub: from the nearest enclosing call to the next call.
      const before = js.slice(0, m.index);
      const callStart = Math.max(...['gsap.to(', 'gsap.from(', 'gsap.fromTo(', 'gsap.timeline(', 'animate(', 'ScrollTrigger.create(', 'onScroll('].map((k) => before.lastIndexOf(k)));
      const start = callStart >= 0 ? callStart : Math.max(0, m.index - 300);
      const nextCall = js.slice(m.index).search(/gsap\.(?:to|from|fromTo|timeline|set)\(|ScrollTrigger\.create\(/);
      const win = js.slice(start, m.index + (nextCall > 0 ? Math.min(nextCall, 500) : 500));
      const eases = [...win.matchAll(/ease\s*:\s*['"]([^'"]+)['"]/g)].map((e) => e[1]);
      if (eases.length && !eases.every((e) => /^(none|linear)$/i.test(e))) add('M03', file, lineOf(js, m.index) + off, eases.join(', '));
    }
    for (const m of js.matchAll(/(gsap\.(?:to|from|fromTo)|animate)\(([\s\S]{0,300}?)\)/g)) {
      if (/[{,]\s*(width|height|top|left|marginTop|marginLeft|margin)\s*:/.test(m[2])) add('M07', file, lineOf(js, m.index) + off, 'tween on a layout property');
    }
    if (/repeat\s*:\s*-1/.test(js) && !/visibilitychange|IntersectionObserver|onEnter|onLeave|pause\(/.test(js)) add('M08', file, lineOf(js, js.search(/repeat\s*:\s*-1/)) + off);
    for (const m of js.matchAll(/\b(?:ease|easing)\s*:\s*['"`]([^'"`]*(?:elastic|bounce|back|spring)[^'"`]*)['"`]/gi)) add('X13', file, lineOf(js, m.index) + off, m[1]);
    for (const m of overshoots(js)) add('X13', file, lineOf(js, m.index) + off, m[0]);
    if (/pin\s*:\s*true/.test(js) && /position\s*:\s*sticky/i.test(projectCss)) add('M06', file, lineOf(js, js.search(/pin\s*:\s*true/)) + off);
    if (/setPixelRatio\(\s*(window\.)?devicePixelRatio\s*\)/.test(js)) add('P06', file, lineOf(js, js.search(/setPixelRatio/)) + off);
    if (/new\s+(THREE\.)?WebGLRenderer|new\s+Renderer\(/.test(js) && !/\.dispose\(/.test(projectJs)) add('P07', file, lineOf(js, js.search(/WebGLRenderer|new\s+Renderer\(/)) + off);
    if (/GLTFLoader|\.glb['"]|\.gltf['"]/.test(js) && !/DRACOLoader|MeshoptDecoder|KTX2Loader|draco|meshopt/i.test(projectJs)) add('P03', file, null);
    const pointerOnly = /addEventListener\(\s*['"](pointerdown|mousedown|touchstart|dragstart)['"]/.test(js);
    if (pointerOnly && !/addEventListener\(\s*['"]keydown['"]|onkeydown|@keydown|on:keydown/.test(projectJs)) add('A11', file, lineOf(js, js.search(/pointerdown|mousedown|touchstart|dragstart/)) + off);
  });
  const customCursor = /data-cursor|\.cursor\b|cursor\s*:\s*none|customCursor|class(Name)?=["'][^"']*\bcursor\b/i.test(allText);
  if (customCursor && !/pointer\s*:\s*coarse|pointer\s*:\s*fine|hover\s*:\s*none|hover\s*:\s*hover/i.test(projectAll)) add('A08', 'project', null);
}

// ---------- rules: HTML ----------
for (const s of htmlSources) {
  const t = s.text;
  // A component file is a page only when its markup, not a comment, holds the root element (a Next root layout does).
  const markup = ['.jsx', '.tsx', '.astro'].includes(s.ext) ? t.replace(/\/\*[\s\S]*?\*\/|(^|[^:])\/\/[^\n]*|\{\/\*[\s\S]*?\*\/\}/g, '$1') : t;
  const isPage = /<html[\s>]/i.test(markup);
  const file = s.file;
  if (isPage) {
    const html = tags(t, 'html')[0];
    if (html && !hasAttr(html.attrs, 'lang')) add('A09', file, html.line);
    if (!/<meta[^>]+name=["']viewport["']/i.test(t)) add('L03', file, null);
    // Zoom locked by the viewport meta: user-scalable=no/0 or a maximum-scale under 2 (WCAG 1.4.4 asks for 200 %).
    for (const m of t.matchAll(/<meta[^>]+name=["']viewport["'][^>]*>/gi)) {
      const content = m[0].match(/content=["']([^"']*)["']/i)?.[1] ?? '';
      const max = content.match(/maximum-scale\s*=\s*([\d.]+)/i);
      if (/user-scalable\s*=\s*(no|0)\b/i.test(content) || (max && Number(max[1]) < 2)) add('A17', file, lineOf(t, m.index), content);
    }
    if (!/<main\b/i.test(t)) add('A01', file, null);
    if (!/<meta[^>]+name=["']theme-color["']/i.test(t)) add('S03', file, null);
    if (!/<meta[^>]+name=["']color-scheme["']/i.test(t) && !/color-scheme\s*:/i.test(projectCss)) add('S04', file, null);
    if (!/<link[^>]+rel=["'][^"']*icon[^"']*["']/i.test(t)) add('S05', file, null);
    if (!/property=["']og:image["']/i.test(t)) add('S06', file, null);
    // Semantics / SEO and meta-data: what a crawler and a link preview read first.
    const metas = tags(t, 'meta');
    const meta = (key, value) => metas.some((m) => (attr(m.attrs, key) ?? '').toLowerCase() === value && (attr(m.attrs, 'content') ?? '').trim());
    if (!/<title\b[^>]*>\s*[^<\s][^<]*<\/title>/i.test(t)) add('S07', file, null);
    if (!meta('name', 'description')) add('S08', file, null);
    if (!meta('property', 'og:title') || !meta('property', 'og:description')) add('S09', file, null);
    if (!tags(t, 'link').some((l) => /(^|\s)canonical(\s|$)/i.test(attr(l.attrs, 'rel') ?? '') && attr(l.attrs, 'href'))) add('S10', file, null);
    // A page with navigation needs a way past it: a same-page link that says it skips, first in the tab order.
    const skip = [...t.matchAll(/<a\b([^>]*)>([\s\S]{0,160}?)<\/a>/gi)].some((m) => /^#./.test(attr(m[1], 'href') ?? '') && (/skip|zum inhalt|contenu|contenido|contenuto/i.test(stripTags(m[2])) || /skip/i.test(attr(m[1], 'class') ?? '')));
    if (/<nav\b/i.test(t) && !skip) add('A13', file, null);
    const hs = headings(t);
    const h1s = hs.filter((h) => h.level === 1);
    if (!h1s.length) add('A03', file, null, 'no h1');
    else if (h1s.length > 1) add('A03', file, h1s[1].line, `${h1s.length} h1 elements`);
    for (let i = 1; i < hs.length; i++) if (hs[i].level > hs[i - 1].level + 1) add('A03', file, hs[i].line, `h${hs[i - 1].level} → h${hs[i].level}`);
  }
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(t)) add('T02', file, lineOf(t, t.search(/fonts\.g/i)));
  const imgs = tags(t, 'img');
  imgs.forEach((img, i) => {
    if (!hasAttr(img.attrs, 'alt')) add('A02', file, img.line, (attr(img.attrs, 'src') || '').slice(-40));
    const sized = (hasAttr(img.attrs, 'width') && hasAttr(img.attrs, 'height')) || /aspect-ratio/.test(img.attrs);
    if (!sized) add('P01', file, img.line, 'no width/height');
    else if (i > 0 && !hasAttr(img.attrs, 'loading')) add('P01', file, img.line, 'no loading attribute');
  });
  for (const c of tags(t, 'canvas')) {
    if (!hasAttr(c.attrs, 'aria-hidden') && !hasAttr(c.attrs, 'role') && !hasAttr(c.attrs, 'aria-label')) add('A04', file, c.line);
  }
  for (const v of tags(t, 'video')) {
    if (hasAttr(v.attrs, 'autoplay') && (!hasAttr(v.attrs, 'muted') || !hasAttr(v.attrs, 'playsinline'))) add('A10', file, v.line);
  }
  for (const m of t.matchAll(/<(div|span)\b[^>]*\bonclick=/gi)) add('A05', file, lineOf(t, m.index));
  const cls = classNames(t);
  for (const c of cls) if (c.classes.some((k) => /(^|__|-)(eyebrow|kicker|overline|pre-?heading)$/i.test(k))) add('L05', file, c.line);
  for (const m of t.matchAll(/<(\w+)\b[^>]*class(?:Name)?=["'][^"']*\b(badge|pill|chip)\b[^"']*["'][^>]*>[^<]{0,80}<\/\1>\s*<h[12]\b/gi)) add('L05', file, lineOf(t, m.index), `.${m[2]} above a headline`);
  const cardCount = cls.filter((c) => c.classes.some((k) => /^card$/i.test(k))).length;
  if (cardCount >= 4 && (t.match(/<h3\b/gi) || []).length >= 4) add('L04', file, null, `${cardCount} .card blocks`);
  const iconTiles = [...t.matchAll(/<(div|span|i|figure)\b[^>]*class(?:Name)?=["'][^"']*\bicon[\w-]*[^"']*["'][^>]*>[\s\S]{0,400}?<\/\1>\s*<h[23]\b/gi)];
  if (iconTiles.length >= 3) add('L04', file, lineOf(t, iconTiles[0].index), `${iconTiles.length} icon tiles above headings`);
  // Copy checks read visible text only: no comments, and in JSX/Astro no script either.
  let copy = t.replace(/<!--[\s\S]*?-->/g, ' ');
  if (['.jsx', '.tsx', '.astro'].includes(s.ext)) copy = copy.replace(/\/\*[\s\S]*?\*\/|(^|[^:])\/\/[^\n]*/g, '$1');
  const text = stripTags(t);
  const prose = stripTags(copy).replace(/\s+/g, ' ');
  if (/lorem ipsum/i.test(text)) add('X02', file, lineOf(t, t.search(/lorem ipsum/i)));
  for (const img of imgs) {
    const src = attr(img.attrs, 'src');
    if (src === '' || /placehold|picsum\.photos|dummyimage|source\.unsplash\.com|placekitten|fakeimg/i.test(src ?? '')) add('X02', file, img.line, src ? src.slice(0, 40) : 'empty src');
  }
  const cta = new RegExp(`>\\s*(${COPY.cta.join('|')})\\b[^<]{0,24}<`, 'gi');
  for (const m of t.matchAll(cta)) add('X01', file, lineOf(t, m.index), m[1]);
  const slogans = (prose.match(/\bNot (?:just |only |merely )?[^.!?]{1,40}[.!?] (?:An?|The|It's|Just) [^.!?]{1,40}[.!?]/g) || []).concat(prose.match(/\bit'?s not [^.,;]{1,40}, it'?s\b/gi) || []);
  if (slogans.length >= 2) add('X16', file, null, `${slogans.length}×, e.g. “${slogans[0].slice(0, 50)}”`);
  const claims = prose.match(new RegExp(`\\b(${COPY.claims.join('|')})\\b`, 'gi')) || [];
  if (claims.length >= 2) add('X17', file, null, [...new Set(claims.map((c) => c.toLowerCase()))].slice(0, 5).join(', '));
  const dashes = (prose.match(/—/g) || []).length;
  const sentences = (prose.match(/[.!?](\s|$)/g) || []).length + 1;
  if (dashes >= 6 && sentences >= 6 && dashes / sentences > 0.3) add('X18', file, null, `${dashes} em dashes in ${sentences} sentences`);
  const emoji = text.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu);
  if (emoji && emoji.length >= 3) add('X03', file, null, `${emoji.length} emoji`);
  // Micro-meta (`/ 01`, `No. 01`) is the habit even once; a bare `01 /` only as a run of three.
  // Tags become \u0001 so a word in the previous element (a nav link) does not read as `12/03` or `01 / 08`.
  const nodes = copy.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/gi, '\u0001');
  const meta = nodes.match(/(?<!\w\s*)\/\s*0[1-9]\b|\bNo\.\s*0[1-9]\b/);
  const at = meta ? t.indexOf(meta[0].trim()) : -1;
  if (meta) add('X07', file, at >= 0 ? lineOf(t, at) : null, meta[0].trim());
  else if ((text.match(/\b0[1-9]\s*[\/·—-]/g) || []).length >= 3) add('X07', file, null);
  const statEls = cls.filter((c) => c.classes.some((k) => /^(stat|metric|counter|kpi)s?$/i.test(k)));
  const statRow = cls.find((c) => c.classes.some((k) => /^(stats|metrics|numbers|kpis|stat-row|stats-row)$/i.test(k)));
  if (statEls.length >= 3) add('X08', file, null);
  else if (statRow) add('X08', file, statRow.line, `.${statRow.classes.join('.')}`);
  if (['.html', '.htm'].includes(s.ext)) {
    // Ids written into scripts or templates are blanked first (same length, so line numbers hold).
    const markup = t.replace(/<(script|template)\b[\s\S]*?<\/\1>/gi, (m) => m.replace(/[^\n]/g, ' '));
    const ids = new Map();
    let dupes = 0;
    for (const m of markup.matchAll(/\sid\s*=\s*["']([^"'\s]+)["']/gi)) {
      if (ids.has(m[1]) && ids.get(m[1]) === 1 && dupes++ < 3) add('A15', file, lineOf(t, m.index), `#${m[1]}`);
      ids.set(m[1], (ids.get(m[1]) ?? 0) + 1);
    }
  }
  if (isPage && /<(button|a)\b/i.test(t) && !/:focus-visible/.test(projectCss)) add('A06', file, null);
  if (isPage && !/::selection/.test(projectCss)) add('S01', file, null);
  if (isPage && !/scrollbar/.test(projectCss)) add('S02', file, null);
}

// ---------- rules: assets & bundles ----------
if (!isUrl) {
  let fontFiles = 0;
  let fontBytes = 0;
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    const size = fs.statSync(f).size;
    if (IMG_EXT.has(ext) && size > 1024 * 1024) add('P02', f, null, `${(size / 1048576).toFixed(1)} MB`);
    if (FONT_EXT.has(ext)) { fontFiles++; fontBytes += size; }
    if (ext === '.glb' && size > 5 * 1024 * 1024) add('P02', f, null, `${(size / 1048576).toFixed(1)} MB glb`);
  }
  if (fontFiles > 4 || fontBytes > 400 * 1024) add('P05', 'assets', null, `${fontFiles} files, ${Math.round(fontBytes / 1024)} KB`);
  const root = fs.statSync(path.resolve(String(target))).isDirectory() ? path.resolve(String(target)) : path.dirname(path.resolve(String(target)));
  const dist = ['dist', 'build', '.output/public', 'out'].map((d) => path.join(root, d)).find((d) => fs.existsSync(d));
  if (dist) {
    const jsFiles = [];
    (function w(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) w(p); else if (/\.m?js$/.test(e.name)) jsFiles.push(p); } })(dist);
    for (const f of jsFiles) {
      const gz = zlib.gzipSync(fs.readFileSync(f)).length;
      if (gz > 300 * 1024 && !/three|gl|webgl|scene/i.test(path.basename(f))) add('P04', f, null, `${Math.round(gz / 1024)} KB gz`);
    }
  }
}

// ---------- rendered checks ----------
let axeReport = null;
const renderedCoverage = {};
// In-page contrast helpers, installed once per page. Every visible text node is measured against what is
// actually behind it: the fills under its centre (elementsFromPoint, so a positioned panel counts) or,
// off screen, its ancestors' fills, composited until one is opaque. Text over an image, a gradient, a
// video or a canvas is unmeasured rather than guessed, and colours go through a canvas so oklch, lab,
// color-mix and alpha all resolve to sRGB bytes.
function installContrast() {
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgba = (c) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data]; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100; };
  const over = (top, under) => { const t = top[3] / 255; return [0, 1, 2].map((i) => top[i] * t + under[i] * (1 - t)).concat(255); };
  const css = (c) => `rgb(${c.slice(0, 3).map(Math.round).join(' ')})`;
  const media = new Set(['IMG', 'VIDEO', 'CANVAS', 'PICTURE', 'IFRAME', 'SVG', 'OBJECT', 'EMBED']);
  const say = (el) => `<${el.tagName.toLowerCase()}> “${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)}”`;
  const imagery = (n) => { const s = getComputedStyle(n); return media.has(n.tagName.toUpperCase()) || s.backgroundImage !== 'none' || (s.backdropFilter && s.backdropFilter !== 'none'); };
  // An unpainted root shows the browser canvas: white, or #121212 under a dark-only colour scheme.
  const canvasDefault = /^(only\s+)?dark$/.test(getComputedStyle(document.documentElement).colorScheme.trim()) ? [18, 18, 18, 255] : [255, 255, 255, 255];
  const composite = (fills) => { let out = canvasDefault; for (const fill of fills.reverse()) out = over(fill, out); return out; };
  // Ancestors only: what sits behind a box when it is off screen (or behind its ring, with self = false).
  function behind(el, self = true) {
    const fills = [];
    for (let n = self ? el : el.parentElement; n; n = n.parentElement) {
      if (imagery(n)) return null;
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3]) { fills.push(c); if (c[3] === 255) break; }
    }
    return composite(fills);
  }
  // On screen: the paint stack under the text's centre; 'covered' when something unrelated sits on top.
  function under(el) {
    const b = el.getBoundingClientRect();
    const x = b.left + b.width / 2, y = b.top + Math.min(b.height / 2, 12);
    if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return behind(el);
    const stack = document.elementsFromPoint(x, y);
    const related = (n) => n === el || el.contains(n) || n.contains(el);
    if (!stack.length || !related(stack[0])) return 'covered';
    const fills = [];
    for (const n of stack) {
      if (el.contains(n) && n !== el) continue;
      if (imagery(n)) return null;
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3]) { fills.push(c); if (c[3] === 255) break; }
    }
    return composite(fills);
  }
  // What a ring is drawn over: the paint stack at a point on the ring, minus the control itself, so a
  // header floating over a dark hero is judged against the hero, not the page ground under both.
  function ringGround(el, x, y) {
    if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return behind(el, false);
    const fills = [];
    for (const n of document.elementsFromPoint(x, y)) {
      if (n === el || el.contains(n)) continue;
      if (imagery(n)) return null;
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3]) { fills.push(c); if (c[3] === 255) break; }
    }
    return composite(fills);
  }
  // One element's own text: its colour times the opacity it inherits, over what is behind it.
  function measure(el) {
    const s = getComputedStyle(el);
    const b = el.getBoundingClientRect();
    if (b.width <= 2 || b.height <= 2 || s.visibility !== 'visible' || /transparent|rgba\(.*,\s*0\)$/.test(s.webkitTextFillColor || '') || (s.mixBlendMode && s.mixBlendMode !== 'normal')) return null;
    let opacity = 1;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const ns = getComputedStyle(n);
      opacity *= Number(ns.opacity);
      if ((ns.clip && ns.clip !== 'auto') || /inset\(50%/.test(ns.clipPath || '') || /blur\(/.test(ns.filter || '')) return null;
    }
    // Blurred or ghosted text (under a quarter opacity) is a state, such as a carousel's dimmed neighbours,
    // not text offered for reading; a stuck entrance is L06's job.
    if (opacity < 0.25) return null;
    const back = under(el);
    if (back === 'covered') return null;
    if (!back) return { unmeasured: true };
    const fg = rgba(s.color);
    const text = over([fg[0], fg[1], fg[2], fg[3] * opacity], back);
    const size = parseFloat(s.fontSize), weight = Number(s.fontWeight) || 400;
    const need = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
    return { say: say(el), fg: css(text), bg: css(back), ratio: ratio(text, back), need };
  }
  function scan(limit = 600) {
    const seen = new Set();
    const fails = [];
    let measured = 0, unmeasured = 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t && seen.size < limit; t = walker.nextNode()) {
      const el = t.parentElement;
      if (!t.nodeValue.trim() || !el || seen.has(el)) continue;
      seen.add(el);
      if (el.closest('script,style,noscript,template,option,svg,[hidden],[inert],[aria-hidden="true"],[aria-disabled="true"],dialog:not([open]),:disabled')) continue;
      const m = measure(el);
      if (!m) continue;
      if (m.unmeasured) { unmeasured++; continue; }
      measured++;
      if (m.ratio < m.need) fails.push(m);
    }
    const pairs = new Set();
    return { measured, unmeasured, fails: fails.sort((p, q) => p.ratio - q.ratio).filter((f) => !pairs.has(f.fg + f.bg) && pairs.add(f.fg + f.bg)) };
  }
  // The focused control: its label in the focus state, and its outline against what surrounds it.
  function focused() {
    const el = document.activeElement;
    if (!el || el === document.body || el === document.documentElement) return null;
    if (el.closest('[aria-disabled="true"]')) return { key: `${el.tagName}|${el.id}|disabled`, say: say(el) };
    const out = { key: `${el.tagName}|${el.id}|${el.getAttribute('href') ?? ''}|${el.textContent.trim().slice(0, 30)}`, say: say(el) };
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      if (t.nodeValue.trim() && t.parentElement) { out.text = measure(t.parentElement); break; }
    }
    const s = getComputedStyle(el);
    if (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) {
      const ring = rgba(s.outlineColor);
      const offset = parseFloat(s.outlineOffset) || 0, width = parseFloat(s.outlineWidth);
      const b = el.getBoundingClientRect();
      const around = offset < 0 ? behind(el) : ringGround(el, b.left - offset - width / 2, b.top + b.height / 2);
      if (around && ring[3]) out.ring = { color: css(ring), bg: css(around), ratio: ratio(over(ring, around), around) };
    }
    return out;
  }
  window.__awardsContrast = { scan, focused };
}

// What a bundler's source looks like when it is served raw instead of built.
const MODULE_ERROR = /Failed to resolve module specifier|Failed to load module script|Failed to fetch dynamically imported module|does not provide an export named/i;

// Layout shift, installed before the page's own scripts: the largest session window (gaps under 1 s, at
// most 5 s), the way CLS is defined, plus the node that moved most. Shifts right after input do not count.
function installShift() {
  const state = { value: 0, top: null };
  let session = 0, first = 0, last = 0, topShift = 0;
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        if (session && (e.startTime - last < 1000) && (e.startTime - first < 5000)) session += e.value;
        else { session = e.value; first = e.startTime; }
        last = e.startTime;
        state.value = Math.max(state.value, session);
        const node = e.sources?.find((s) => s.node?.nodeType === 1)?.node;
        if (node && e.value > topShift) {
          topShift = e.value;
          state.top = `<${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : node.classList[0] ? `.${node.classList[0]}` : ''}>`;
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
  window.__awardsShift = state;
}

// Scrolls the page top to bottom in half-viewport steps (through the page's own hook when it has one,
// so Lenis and virtual scrollers move too) and reports what a stranger names first when a page looks wrong:
// a viewport with no content in it (L09); a section whose content keeps to one narrow side with nothing on the
// other (L10 on tablet and phone, L13 on desktop); text, a heading or an action covered by something painted
// over it at every scroll position where it is in view, so a visitor can never read it (L11); outer margins that differ left and right (L12, desktop); a section of
// running text with no heading (L14, desktop); and screens that are mostly plain ground (L15). Content is any
// visible box with its own text, media, a background image or a drawn edge, at any opacity: a reveal still waiting
// for its trigger counts. Small fixed or sticky bars (a header) do not, or they would fill every viewport.
async function sweepPage(desktop) {
  // The layout viewport: under phone emulation a page that overflows widens innerWidth to its own width.
  const vh = innerHeight, vw = document.documentElement.clientWidth;
  const MEDIA = new Set(['IMG', 'PICTURE', 'VIDEO', 'CANVAS', 'SVG', 'svg', 'IFRAME', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'OBJECT', 'EMBED']);
  const PICTURE = new Set(['IMG', 'PICTURE', 'VIDEO', 'CANVAS', 'SVG', 'svg', 'IFRAME']);
  // The nearest fixed or sticky box an element rides in, if any.
  const pinned = new Map();
  const pinOf = (el) => {
    if (!el || el === document.body) return null;
    if (pinned.has(el)) return pinned.get(el);
    const p = getComputedStyle(el).position;
    const v = p === 'fixed' || p === 'sticky' ? el : pinOf(el.parentElement);
    pinned.set(el, v);
    return v;
  };
  const bar = (el) => { const pin = pinOf(el); return !!pin && pin.getBoundingClientRect().height < vh * 0.35; };
  const tucked = (el) => !!el.closest('[hidden],[inert],[aria-hidden="true"],dialog:not([open]),template,noscript');
  const say = (el) => `<${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : el.classList[0] ? `.${el.classList[0]}` : ''}>${el.textContent.trim() ? ` “${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 32)}”` : ''}`;
  const content = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (el.closest('[hidden],template,dialog:not([open]),noscript,script,style')) continue;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    // A drawn box counts too: a border, a shadow, or a filled panel smaller than the viewport (a wrapper
    // painted the page colour would otherwise fill every viewport).
    const drawn = (parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none') || (parseFloat(s.borderLeftWidth) > 0 && s.borderLeftStyle !== 'none') || s.boxShadow !== 'none'
      || (!/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor) && el.getBoundingClientRect().height < vh);
    if (!own && !drawn && !MEDIA.has(el.tagName) && s.backgroundImage === 'none') continue;
    if ((s.clip && s.clip !== 'auto') || /inset\(50%/.test(s.clipPath || '')) continue;
    content.push(el);
  }
  // Where an element's own text actually sits (a block box spans the column; its words may not).
  const textRect = (el) => { const r = document.createRange(); r.selectNodeContents(el); const b = r.getBoundingClientRect(); return b.width && b.height ? b : el.getBoundingClientRect(); };
  const opacityOf = (el) => { let o = 1; for (let n = el; n && n !== document.documentElement; n = n.parentElement) o *= Number(getComputedStyle(n).opacity); return o; };
  // Whether an element paints over what is under it at (x, y). A gradient's alpha at one point is unknown, so a
  // gradient alone (a fade, a scrim) never counts; a hit outside the element's own box came from ::before or
  // ::after, which are judged on their own fill.
  const solid = (c) => { const v = c.match(/rgba?\(([^)]+)\)/)?.[1].split(/[ ,/]+/).filter(Boolean).map(Number); return !!v && (v.length < 4 || v[3] >= 0.5); };
  const paints = (el, x, y) => {
    const b = el.getBoundingClientRect();
    if (x < b.left || x > b.right || y < b.top || y > b.bottom) {
      return ['::before', '::after'].some((pseudo) => { const ps = getComputedStyle(el, pseudo); return ps.content !== 'none' && (solid(ps.backgroundColor) || /url\(/.test(ps.backgroundImage)); });
    }
    const s = getComputedStyle(el);
    if (PICTURE.has(el.tagName) || /url\(/.test(s.backgroundImage) || solid(s.backgroundColor)) return true;
    if ((parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none') || s.boxShadow !== 'none' || s.textShadow !== 'none') return true;
    return [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  };
  // Readers' text: headings, statements and paragraphs, and actions drawn as buttons.
  const readable = [...document.querySelectorAll('h1,h2,h3,p,blockquote,li,a[href],button,[role="button"]')].filter((el) => {
    if (tucked(el) || bar(el)) return false;
    const t = el.textContent.trim();
    if (!t) return false;
    if (/^(A|BUTTON)$/.test(el.tagName) || el.getAttribute('role') === 'button') {
      const s = getComputedStyle(el);
      return !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor) || (parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none');
    }
    return /^H[1-3]$/.test(el.tagName) || t.length >= 30;
  });
  const ups = (x, k) => { const a = []; for (let i = 0; x && i < k; i++, x = x.parentElement) a.push(x); return a; };
  const first = (x) => (typeof x.className === 'string' ? x.className.trim().split(/\s+/)[0] : '') || '';
  const deck = (el, n) => ups(el, 5).some((a) => ups(n, 3).some((b) => a !== b && a.parentElement && a.parentElement === b.parentElement && first(a) && first(a) === first(b)));
  const coverStyle = document.createElement('style');
  coverStyle.textContent = '*, *::before, *::after { pointer-events: auto !important; }';
  // Only text covered at every stop where it is in view counts: winners pass clouds, curtain reveals and stacked
  // panels over their own titles on purpose, and the contrast set (references/sites/_prevalence.md) showed a rule
  // that fired on any covered stop catching six of seven winners. Text that is clear at one stop can be read.
  const covered = new Map(), clear = new Set();
  const coveredAt = (p) => {
    // Hit-testing ignores pointer-events: none, which is exactly how canvases and decorative layers sit; with it
    // forced on, elementsFromPoint returns the real paint stack. Nothing is dispatched, so no handler runs.
    document.head.appendChild(coverStyle);
    try {
      for (const el of readable) {
        if (clear.has(el)) continue;
        const b = textRect(el);
        if (b.width < 4 || b.height < 4 || b.right <= 0 || b.left >= vw) continue;
        // In view: the whole text, or for text taller than most of the screen, its middle in the central band.
        if (b.height <= vh * 0.8 ? b.top < 0 || b.bottom > vh : b.top + b.height / 2 < vh * 0.1 || b.top + b.height / 2 > vh * 0.9) continue;
        if (getComputedStyle(el).visibility !== 'visible' || opacityOf(el) < 0.25) continue;
        const y = b.top + b.height / 2;
        let hits = 0, by = null;
        for (const fx of [0.15, 0.5, 0.85]) {
          const x = b.left + b.width * fx;
          if (x < 0 || x >= vw || y < 0 || y >= vh) continue;
          for (const n of document.elementsFromPoint(x, y)) {
            if (n === el || el.contains(n) || n.contains(el)) break;
            if (n === document.body || n === document.documentElement) break;
            const nb = n.getBoundingClientRect();
            // A full-viewport canvas over text is usually the GL layer drawing that text (the DOM mirror), and a smaller
            // one (a globe, a scene island) is transparent wherever it draws nothing; a hit test cannot see its pixels,
            // so text under a canvas is the jury's to read from the frames, not this rule's.
            if (n.tagName === 'CANVAS' && nb.width >= vw * 0.9 && nb.height >= vh * 0.9) break;
            if (n.tagName === 'CANVAS') continue;
            // A small pinned bar passing over text as the page scrolls is the header doing its job.
            if (bar(n)) break;
            // A full-viewport texture (film grain, a vignette, a blended wash) sits over everything and hides nothing,
            // and a faint layer leaves the text readable; look under both.
            if (getComputedStyle(n).visibility !== 'visible' || opacityOf(n) < 0.5) continue;
            if (nb.width >= vw * 0.9 && nb.height >= vh * 0.9 && (!solid(getComputedStyle(n).backgroundColor) || getComputedStyle(n).mixBlendMode !== 'normal')) continue;
            // Text over text of the same kind is a reveal on purpose: a heading set twice for a masked fill, step cards
            // stacked to cross-fade. Only a different element's text, or a fill, counts as a cover.
            const sameText = !!n.textContent.trim() && n.textContent.trim() === el.textContent.trim();
            const ownText = [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
            const s2 = getComputedStyle(n);
            const filled = PICTURE.has(n.tagName) || /url\(/.test(s2.backgroundImage) || solid(s2.backgroundColor);
            if (!filled && ownText && (sameText || n.tagName === el.tagName)) continue;
            // A deck: the cover is a sibling of the same repeated component (stacked cards, slides), shown one at a time.
            if (deck(el, n)) continue;
            if (paints(n, x, y)) { hits++; by = n; break; }
          }
        }
        if (hits >= 2) {
          if (!covered.has(el)) {
            // Tagged so the pixel check after the sweep can find the text and its cover again.
            const id = String(covered.size);
            el.setAttribute('data-awards-l11', id);
            by.setAttribute('data-awards-l11-by', id);
            covered.set(el, { id, p, say: `${say(el)} under ${say(by)} at every stop where it is in view (first at ${Math.round(p * 100)} % down the page)` });
          }
        } else clear.add(el);
      }
    } finally {
      coverStyle.remove();
    }
  };
  // How much of a viewport holds something: the share of a 24 × 15 grid of points inside a content box (the text's
  // own extent, a picture, a drawn panel), plus the words in view.
  const fillOf = () => {
    const boxes = [];
    let words = 0;
    for (const el of content) {
      if (bar(el)) continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      const b = own ? textRect(el) : el.getBoundingClientRect();
      if (b.width < 2 || b.height < 2 || b.bottom <= 0 || b.top >= vh || b.right <= 0 || b.left >= vw) continue;
      // A box the size of the viewport (a section ground) says nothing about whether the screen is full.
      if (!own && b.width >= vw * 0.98 && b.height >= vh * 0.98 && !PICTURE.has(el.tagName) && !/url\(/.test(getComputedStyle(el).backgroundImage)) continue;
      boxes.push(b);
      if (own) words += [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim().split(/\s+/).filter(Boolean).length).reduce((a, c) => a + c, 0);
    }
    let hit = 0;
    for (let i = 0; i < 24; i++) for (let k = 0; k < 15; k++) {
      const x = (i + 0.5) * (vw / 24), y = (k + 0.5) * (vh / 15);
      if (boxes.some((b) => x >= b.left && x <= b.right && y >= b.top && y <= b.bottom)) hit++;
    }
    return { fill: hit / 360, words };
  };
  const hook = window.__awards?.scrollTo;
  const height = () => document.documentElement.scrollHeight;
  const steps = Math.min(80, Math.max(hook ? 12 : 2, Math.ceil((2 * height()) / vh)));
  const go = async (p) => {
    if (hook) await hook(p);
    else window.scrollTo(0, Math.round(Math.max(0, height() - vh) * p));
    await new Promise((r) => setTimeout(r, 120));
  };
  const empty = [], thin = [], wordsSeen = [];
  for (let i = 0; i < steps; i++) {
    const p = steps === 1 ? 0 : i / (steps - 1);
    await go(p);
    const filled = content.some((el) => {
      const b = el.getBoundingClientRect();
      if (b.width < 2 || b.height < 2 || b.bottom <= 0 || b.top >= vh || b.right <= 0 || b.left >= vw) return false;
      return !bar(el);
    });
    if (!filled) { empty.push(p); continue; }
    const f = fillOf();
    wordsSeen.push(f.words);
    if (f.fill < 0.08) thin.push({ p, fill: f.fill });
    coveredAt(p);
  }
  const runs = (list) => {
    const out = [];
    for (let i = 0; i < list.length; i++) {
      let j = i;
      while (j + 1 < list.length && list[j + 1] - list[j] <= 1.01 / (steps - 1)) j++;
      out.push([list[i], list[j]]);
      i = j;
    }
    return out;
  };
  const blank = runs(empty).map(([a, b]) => `a full viewport with nothing in it, ${Math.round(a * 100)}–${Math.round(b * 100)} % down the page`);
  // A near-empty screen: under 8 % of the viewport holds anything. One is a rest; two or more is an underbuilt page.
  const thinRuns = runs(thin.map((t) => t.p));
  const nearEmpty = thinRuns.length >= 2 ? [`${thinRuns.length} screens that are mostly plain ground, at ${thinRuns.map(([a, b]) => a === b ? `${Math.round(a * 100)} %` : `${Math.round(a * 100)}–${Math.round(b * 100)} %`).join(', ')} down the page`] : [];
  await go(0);
  const sy = () => window.scrollY;
  // Pictures that hold a side of a section: fixed ones hold it at every scroll position.
  const pictures = [...document.querySelectorAll('img,picture,video,canvas,svg,iframe,*')].filter((el) => {
    if (tucked(el)) return false;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    if (!(PICTURE.has(el.tagName) || /url\(/.test(s.backgroundImage))) return false;
    const b = el.getBoundingClientRect();
    return b.width >= 40 && b.height >= 40;
  }).map((el) => { const b = el.getBoundingClientRect(); const fixed = pinOf(el) && getComputedStyle(pinOf(el)).position === 'fixed'; return { left: b.left, right: b.right, top: fixed ? -Infinity : b.top + sy(), bottom: fixed ? Infinity : b.bottom + sy() }; });
  const lopsided = [], untitled = [];
  const root = document.querySelector('main') ?? document.body;
  const sections = [...root.children].filter((el) => !tucked(el));
  for (const section of sections) {
    const sb = section.getBoundingClientRect();
    if (sb.height < vh * 0.3 || pinOf(section)) continue;
    const inside = content.filter((el) => section.contains(el) && el !== section);
    const text = inside.reduce((n, el) => n + [...el.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent.trim().length).reduce((a, c) => a + c, 0), 0);
    const name = section.id ? `#${section.id}` : section.classList[0] ? `.${section.classList[0]}` : section.tagName.toLowerCase();
    if (desktop && text >= 200 && ![...section.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"]')].some((h) => !tucked(h) && getComputedStyle(h).display !== 'none' && h.textContent.trim())) {
      untitled.push(`${name}: ${text} characters of running text and no heading naming the section`);
    }
    if (inside.length < 2 || text < 120) continue;
    let left = Infinity, right = -Infinity, wide = false;
    for (const el of inside) {
      // Words where they sit: a heading's block box spans the column even when its words take a third of it.
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      const b = own ? textRect(el) : el.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) continue;
      if (b.width >= vw * 0.9) wide = true;
      left = Math.min(left, Math.max(0, b.left));
      right = Math.max(right, Math.min(vw, b.right));
    }
    if (wide || right <= left) continue;
    const span = (right - left) / vw, offset = ((left + right) / 2 - vw / 2) / vw;
    if (span < 0.5 && Math.abs(offset) > 0.15) {
      // The other side is closed when a picture (the section's own, a backdrop, a fixed canvas) holds it.
      const [x0, x1] = offset < 0 ? [right, vw] : [0, left];
      const top = sb.top + sy(), bottom = sb.bottom + sy();
      const closed = pictures.some((m) => Math.min(m.right, x1) - Math.max(m.left, x0) >= (x1 - x0) * 0.4 && Math.min(m.bottom, bottom) - Math.max(m.top, top) >= Math.min(sb.height, vh) * 0.3);
      if (!closed) lopsided.push(`${name}: content spans ${Math.round(span * 100)} % of the width, all on the ${offset < 0 ? 'left' : 'right'}, the other side empty`);
    }
  }
  // Outer margins, desktop: the nearest text edge to each side of the screen over the whole page, header included,
  // ignoring text that touches an edge (a bleed). Asymmetry inside the grid is fine; the frame's two margins match.
  let margins = null;
  if (desktop) {
    let l = Infinity, r = Infinity;
    for (const el of content) {
      // Labels inside a drawing or a decorative figure belong to the picture, which may bleed; they are not the frame.
      // The header counts: it is part of the frame, and its inset should match the page's.
      if (el.closest('svg,[aria-hidden="true"]') || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      // A control drawn as a box (a filled or outlined button) shows its box as the edge; plain text shows its words.
      const control = el.closest('a,button,[role="button"]');
      const st = control ? getComputedStyle(control) : null;
      const boxed = !!control && (solid(st.backgroundColor) || (parseFloat(st.borderTopWidth) > 0 && st.borderTopStyle !== 'none'));
      const b = boxed ? control.getBoundingClientRect() : textRect(el);
      if (b.width < 8 || b.height < 4) continue;
      if (b.left > 1) l = Math.min(l, b.left);
      if (vw - b.right > 1) r = Math.min(r, vw - b.right);
    }
    if (Number.isFinite(l) && Number.isFinite(r)) margins = { left: Math.round(l), right: Math.round(r) };
  }
  const words = wordsSeen.length ? [...wordsSeen].sort((a, b) => a - b)[Math.floor(wordsSeen.length / 2)] : 0;
  return { steps, blank, lopsided, covered: [...covered].filter(([el]) => !clear.has(el)).map(([, c]) => c), nearEmpty, untitled, margins, wordsPerScreen: words };
}

// Text the sweep found under a cover at every stop where it is in view, checked with pixels: back at that stop, the
// text's box is shot twice with the cover shown (a box that changes on its own is moving, a ticker or a reveal,
// and is not judged here), then once with the cover hidden. The text is covered when hiding the cover changes a
// quarter of the box by more than antialiasing does.
async function coveredByPixels(page, candidates) {
  const out = [];
  if (!candidates.length) return out;
  // A blank page of its own decodes the shots, out of reach of the audited page's content security policy.
  const scratch = await page.context().browser().newPage();
  try {
    for (const c of candidates) {
      await page.evaluate(async (p) => {
        const hook = window.__awards?.scrollTo;
        if (hook) await hook(p);
        else window.scrollTo(0, Math.round(Math.max(0, document.documentElement.scrollHeight - innerHeight) * p));
      }, c.p);
      await page.waitForTimeout(600);
      const box = await page.evaluate((id) => {
        const el = document.querySelector(`[data-awards-l11="${id}"]`);
        if (!el) return null;
        const r = document.createRange(); r.selectNodeContents(el);
        const b = r.getBoundingClientRect().width ? r.getBoundingClientRect() : el.getBoundingClientRect();
        const x = Math.max(0, b.left), y = Math.max(0, b.top), w = Math.min(document.documentElement.clientWidth, b.right) - x, h = Math.min(innerHeight, b.bottom) - y;
        return w >= 4 && h >= 4 ? { x, y, width: w, height: h } : null;
      }, c.id);
      if (!box) continue;
      const shot = async () => `data:image/png;base64,${(await page.screenshot({ clip: box, animations: 'disabled' })).toString('base64')}`;
      const a1 = await shot();
      await page.waitForTimeout(150);
      const a2 = await shot();
      const hidden = await page.evaluate((id) => { const by = document.querySelector(`[data-awards-l11-by="${id}"]`); if (!by) return false; by.style.setProperty('visibility', 'hidden', 'important'); return true; }, c.id);
      if (!hidden) continue;
      await page.waitForTimeout(100);
      const b = await shot();
      await page.evaluate((id) => document.querySelector(`[data-awards-l11-by="${id}"]`)?.style.removeProperty('visibility'), c.id);
      const [still, hides] = await scratch.evaluate(async ({ a1, a2, b }) => {
        const load = (src) => new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = src; });
        const [x, y, z] = await Promise.all([load(a1), load(a2), load(b)]);
        const canvas = document.createElement('canvas');
        canvas.width = x.width; canvas.height = x.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const px = (img) => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); return ctx.getImageData(0, 0, canvas.width, canvas.height).data; };
        const share = (p, q) => { let n = 0; for (let i = 0; i < p.length; i += 4) if (Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]) > 96) n++; return n / (p.length / 4); };
        const p1 = px(x), p2 = px(y), p3 = px(z);
        return [share(p1, p2), share(p1, p3)];
      }, { a1, a2, b });
      if (still < 0.05 && hides >= 0.25) out.push(c);
    }
  } finally {
    await scratch.close().catch(() => {});
  }
  return out;
}

// The first screen 1.2 s after load: an h1 in view, visible and not under a loader or an entrance, that says in
// words what this is. Measured before the ready wait, on purpose: a visitor does not wait for the page's signal.
function firstScreenTitle() {
  const tucked = (el) => !!el.closest('[hidden],[inert],[aria-hidden="true"],dialog:not([open]),template,noscript');
  const h1s = [...document.querySelectorAll('h1')].filter((el) => !tucked(el));
  if (!h1s.length) return { ok: false, why: 'no h1 on the page' };
  const opacityOf = (el) => { let o = 1; for (let n = el; n && n !== document.documentElement; n = n.parentElement) o *= Number(getComputedStyle(n).opacity); return o; };
  for (const h1 of h1s) {
    const b = h1.getBoundingClientRect();
    if (!h1.textContent.trim() && !h1.querySelector('img[alt],svg[aria-label],[aria-label]')) continue;
    if (b.width < 2 || b.bottom <= 0 || b.top >= innerHeight) continue;
    // A GL mirror: a canvas painted over the h1 draws the title. A canvas behind it (a hero scene) proves nothing.
    const force = document.createElement('style');
    force.textContent = '*, *::before, *::after { pointer-events: auto !important; }';
    document.head.appendChild(force);
    const stack = document.elementsFromPoint(Math.min(innerWidth - 1, Math.max(0, b.left + b.width / 2)), Math.min(innerHeight - 1, Math.max(0, b.top + b.height / 2)));
    force.remove();
    const own = stack.findIndex((n) => n === h1 || h1.contains(n));
    if (stack.slice(0, own === -1 ? stack.length : own).some((n) => n.tagName === 'CANVAS')) return { ok: true, mirrored: true };
    if (getComputedStyle(h1).visibility !== 'visible' || opacityOf(h1) < 0.5) return { ok: false, why: `the h1 “${h1.textContent.trim().slice(0, 40)}” is still hidden or faded 1.2 s after load (opacity ${opacityOf(h1).toFixed(2)})` };
    const x = Math.min(innerWidth - 1, Math.max(0, b.left + Math.min(b.width / 2, 40))), y = Math.min(innerHeight - 1, Math.max(0, b.top + b.height / 2));
    const top = document.elementFromPoint(x, y);
    // A consent banner is the host's law, not the page's design.
    const consent = (n) => { for (; n && n !== document.body; n = n.parentElement) if (/cookie|consent|gdpr|onetrust|didomi|cookiebot|usercentrics|\bcmp/i.test(`${n.id} ${n.className?.baseVal ?? n.className} ${n.getAttribute('aria-label') ?? ''}`)) return true; return false; };
    if (top && top !== h1 && !h1.contains(top) && !top.contains(h1) && !consent(top)) {
      const s = getComputedStyle(top);
      if (!/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor) && Number(s.opacity) > 0.5) return { ok: false, why: `the h1 is under <${top.tagName.toLowerCase()}${top.classList[0] ? `.${top.classList[0]}` : ''}> 1.2 s after load, a loader or a gate` };
    }
    return { ok: true };
  }
  return { ok: false, why: 'the h1 is not in the first viewport' };
}

// A bundler project's index.html imports /src modules and bare package names, which only its dev server
// or its build resolves. Render the build output when there is one, and say when it is older than src/.
const BUILD_DIRS = ['dist', 'build', 'out', '.output/public'];
function renderRoot(abs) {
  if (!fs.statSync(abs).isDirectory() || !fs.existsSync(path.join(abs, 'package.json'))) return { dir: abs, from: 'target' };
  const built = BUILD_DIRS.map((d) => path.join(abs, d)).find((d) => fs.existsSync(path.join(d, 'index.html')));
  const newest = (dir, depth = 0) => {
    let t = 0;
    if (!fs.existsSync(dir) || depth > 6) return t;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      t = Math.max(t, ent.isDirectory() ? newest(p, depth + 1) : fs.statSync(p).mtimeMs);
    }
    return t;
  };
  if (built) {
    const stale = newest(path.join(abs, 'src')) > fs.statSync(path.join(built, 'index.html')).mtimeMs;
    return { dir: built, from: path.relative(abs, built), ...(stale ? { warning: `${path.relative(abs, built)}/ is older than src/; rebuild before trusting the rendered checks` } : {}) };
  }
  const html = fs.existsSync(path.join(abs, 'index.html')) ? fs.readFileSync(path.join(abs, 'index.html'), 'utf8') : '';
  const pkg = (() => { try { return JSON.parse(fs.readFileSync(path.join(abs, 'package.json'), 'utf8')); } catch { return {}; } })();
  const bundler = /\b(vite|astro|next|nuxt|@sveltejs\/kit|parcel|webpack)\b/.test(Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).join(' '));
  if (bundler || /<script[^>]+type=["']module["'][^>]+src=["']\/src\//i.test(html)) {
    return { dir: abs, from: 'source', warning: 'no build output found, so the source is rendered as is; build first (npm run build) or pass the dev server URL' };
  }
  return { dir: abs, from: 'target' };
}
let renderedFrom = null;

if (args.render) {
  const { resolvePlaywright, launchChromium, MISSING_MESSAGE } = await import('./lib/playwright.mjs');
  const { serveDirectory } = await import('./lib/server.mjs');
  const found = resolvePlaywright();
  if (!found) {
    console.error(MISSING_MESSAGE);
    process.exit(3);
  } else {
    let server = null;
    let url = String(target);
    if (!isUrl) {
      const abs = path.resolve(String(target));
      renderedFrom = renderRoot(abs);
      if (renderedFrom.warning && !args.json) console.error(`render: ${renderedFrom.warning}`);
      const dir = fs.statSync(abs).isDirectory() ? renderedFrom.dir : path.dirname(abs);
      server = await serveDirectory(dir);
      url = server.url + (fs.statSync(abs).isDirectory() ? '' : path.basename(abs));
    }
    // C05: the DESIGN.md frontmatter ground token, when one is declared; the page resolves and compares it.
    const designMd = [projectDir, targetDir].filter(Boolean).map((d) => path.join(d, 'DESIGN.md')).find((p) => fs.existsSync(p));
    const colorsBlock = designMd && fs.readFileSync(designMd, 'utf8').split(/^---\s*$/m)[1]?.match(/^colors:\s*\n((?:[ \t]+.*\n?)*)/m)?.[1];
    const groundToken = colorsBlock?.match(/^[ \t]+(?:ground|background|bg)[ \t]*:[ \t]*["']?([^"'\n]+?)["']?[ \t]*$/m)?.[1] ?? null;
    // axe-core runs when the project (or the plugin's recipes) installs it; otherwise the scan is unmeasured.
    const axe = (() => {
      for (const base of [projectDir, process.env.AWARDS_PLAYWRIGHT, path.join(here, '..', 'recipes')].filter(Boolean)) {
        try {
          const file = createRequire(path.join(base, 'package.json')).resolve('axe-core/axe.min.js');
          return { file, version: JSON.parse(fs.readFileSync(path.join(path.dirname(file), 'package.json'), 'utf8')).version };
        } catch {}
      }
      return null;
    })();
    axeReport = axe ? `axe-core ${axe.version}` : 'unmeasured: axe-core not installed (npm i -D axe-core)';
    let browser;
    try {
      browser = await launchChromium(found.module, { sandbox: isUrl });
    } catch (e) {
      console.error(`browser launch failed: ${String(e.message ?? e).split('\n')[0]}`);
      if (server) await server.close();
      process.exit(3);
    }
    try {
      for (const [label, width, height] of [['desktop', 1440, 900], ['tablet', 834, 1194], ['mobile', 390, 844]]) {
        const page = await browser.newPage({ viewport: { width, height }, isMobile: label !== 'desktop', hasTouch: label !== 'desktop' });
        const errors = [];
        // Every in-page step reports its own failure: a check that throws or hangs is an ERR finding, never
        // a clean read. After a hang the viewport is abandoned, since every later step would hang as well.
        let dead = false;
        const step = async (stage, run, ms = 20000) => {
          if (dead) return undefined;
          let timer;
          try {
            return await Promise.race([run(), new Promise((_, no) => { timer = setTimeout(() => { dead = true; no(new Error(`no answer after ${ms / 1000} s`)); }, ms); })]);
          } catch (e) {
            findings.push({ rule: 'ERR', severity: 'P1', scope: 'render', file: label, line: null, message: `rendered check did not run (${stage}): ${String(e.message ?? e).split('\n')[0].slice(0, 120)}`, fix: 'Fix the page error or rerun; until this step runs, the viewport is unaudited for it' });
            return undefined;
          } finally {
            clearTimeout(timer);
          }
        };
        page.on('pageerror', (e) => errors.push(e.message));
        // A bundler's source served raw: bare imports and /src paths do not resolve, and every later rule reads a broken page.
        page.on('console', (m) => { if (m.type() === 'error' && MODULE_ERROR.test(m.text())) errors.push(`${m.text()} (render the build output, or pass the dev server URL)`); });
        await page.addInitScript(installShift).catch(() => {});
        const loaded = await page.goto(url, { waitUntil: 'load', timeout: 30000 }).then(() => true, (e) => { errors.push(e.message); return false; });
        if (!loaded) dead = true;
        // S11 reads the first screen as a visitor gets it, 1.2 s after load and before any ready signal.
        if (!dead && label !== 'tablet') {
          await page.waitForTimeout(1200);
          const title = await step('first-screen title', () => page.evaluate(firstScreenTitle));
          if (title && !title.ok) add('S11', `${label} (rendered)`, null, title.why);
        }
        // Give entrances a fair chance: the page's own ready signal (capped), then two seconds.
        await step('ready', () => page.evaluate(() => Promise.race([window.__awards?.ready, new Promise((res) => setTimeout(res, 8000))])), 12000);
        if (!dead) await page.waitForTimeout(2000);
        await step('contrast helpers', () => page.evaluate(installContrast));
        const contrast = await step('text contrast', () => page.evaluate(() => window.__awardsContrast.scan()));
        const r = await step('first viewport', () => page.evaluate((groundToken) => {
          const cs = getComputedStyle(document.body);
          const fams = new Set();
          for (const el of document.querySelectorAll('h1,h2,h3,p,a,button,li,span')) fams.add(getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim());
          // Hidden, inert, or clipped to nothing (a screen-reader-only copy): not text anyone sees.
          const clipped = (el) => { for (let n = el; n && n !== document.body; n = n.parentElement) { const s = getComputedStyle(n); if ((s.clip && s.clip !== 'auto') || /inset\(50%/.test(s.clipPath || '')) return true; } return false; };
          const tucked = (el) => el.closest('[hidden],[inert],[aria-hidden="true"],dialog:not([open]),template') || clipped(el);
          const say = (el) => `<${el.tagName.toLowerCase()}> “${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)}”`;
          const px = (el) => parseFloat(getComputedStyle(el).fontSize);
          const stuck = [], long = [], edge = [], nested = [];
          // Text under a canvas is usually a WebGL mirror, hidden on purpose while the GL copy is drawn
          // (references/patterns/webgl-architecture.md); a stuck entrance under a full-page canvas goes unseen.
          const canvases = [...document.querySelectorAll('canvas')].map((c) => c.getBoundingClientRect()).filter((c) => c.width && c.height);
          const underCanvas = (b) => canvases.some((c) => b.left + b.width / 2 >= c.left && b.left + b.width / 2 <= c.right && b.top + b.height / 2 >= c.top && b.top + b.height / 2 <= c.bottom);
          const textBox = (el) => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect(); };
          for (const el of document.querySelectorAll('h1,h2,h3,p')) {
            if (!el.textContent.trim() || tucked(el)) continue;
            const b = el.getBoundingClientRect();
            if (b.width === 0 || b.bottom <= 0 || b.top >= innerHeight || underCanvas(b)) continue;
            let opacity = 1;
            for (let n = el; n && n !== document.documentElement; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
            if (opacity < 0.05 || getComputedStyle(el).visibility === 'hidden') stuck.push(say(el));
          }
          for (const el of document.querySelectorAll('p')) {
            if (tucked(el)) continue;
            const b = el.getBoundingClientRect();
            if (b.width === 0 || getComputedStyle(el).visibility === 'hidden') continue;
            if (el.textContent.trim().length >= 200 && b.width / (px(el) * 0.5) > 90) long.push(`${say(el)} ≈ ${Math.round(b.width / (px(el) * 0.5))}ch`);
            const tb = textBox(el);
            if (el.textContent.trim().length >= 40 && tb.width && (tb.left < 12 || document.documentElement.clientWidth - tb.right < 12)) edge.push(say(el));
          }
          const boxed = (el) => { const s = getComputedStyle(el); return (parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none') || s.boxShadow !== 'none'; };
          for (const el of document.querySelectorAll('[class*="card"]')) {
            const outer = el.parentElement?.closest('[class*="card"]');
            if (outer && boxed(el) && boxed(outer)) nested.push(`.${[...el.classList].join('.')} inside .${[...outer.classList].join('.')}`);
          }
          // Eyebrows by computed style, whatever the class name: short, small, tracked caps right above a heading.
          // One per three sections is a system; more is the template habit L05 catches lexically.
          const eyebrows = [];
          for (const el of document.querySelectorAll('p,span,div,small,strong,em,a')) {
            const t = el.textContent.trim();
            if (t.length < 2 || t.length > 40 || el.children.length || tucked(el)) continue;
            const next = el.nextElementSibling ?? (el.parentElement?.children.length === 1 ? el.parentElement.nextElementSibling : null);
            if (!next?.matches('h1,h2,h3')) continue;
            const s = getComputedStyle(el), size = parseFloat(s.fontSize), track = parseFloat(s.letterSpacing) || 0;
            const caps = s.textTransform === 'uppercase' || (/[A-Za-z]/.test(t) && t === t.toUpperCase());
            if (size <= 15 && caps && track / size >= 0.05) eyebrows.push(say(el));
          }
          const sectionCount = Math.max(1, document.querySelectorAll('main > section, main > article, body > section').length);
          // Images delivered below 1.5x the width they are drawn at go soft on every high-density screen.
          const soft = [];
          for (const img of document.querySelectorAll('img')) {
            const b = img.getBoundingClientRect();
            if (!img.complete || !img.naturalWidth || b.width < 200 || tucked(img) || /\.svg(\?|$)/i.test(img.currentSrc || img.src)) continue;
            if (img.naturalWidth < b.width * 1.5) soft.push(`${(img.currentSrc || img.src).split('/').pop().slice(0, 40)} ${img.naturalWidth} px drawn at ${Math.round(b.width)} px`);
          }
          const h1 = [...document.querySelectorAll('h1')].find((el) => !tucked(el) && !el.querySelector('svg,img,picture,canvas'));
          const body = [...document.querySelectorAll('p')].find((el) => !tucked(el) && el.textContent.trim().length >= 40);
          const ratioH1 = h1 && body ? px(h1) / px(body) : null;
          // Canvas resolves any CSS colour (hex, oklch, color-mix) to sRGB bytes, so token and computed value compare alike.
          const rgba = (c) => { const x = document.createElement('canvas').getContext('2d'); x.fillStyle = c; x.fillRect(0, 0, 1, 1); return [...x.getImageData(0, 0, 1, 1).data]; };
          const grounds = [];
          if (groundToken && CSS.supports('color', groundToken)) {
            const want = rgba(groundToken);
            const html = getComputedStyle(document.documentElement).backgroundColor;
            const painted = [['body', rgba(cs.backgroundColor)[3] ? cs.backgroundColor : rgba(html)[3] ? html : null]];
            const main = document.querySelector('main');
            if (main && rgba(getComputedStyle(main).backgroundColor)[3]) painted.push(['main', getComputedStyle(main).backgroundColor]);
            for (const [el, c] of painted) {
              if (!c) grounds.push(`${el} unpainted (browser default) vs ground ${groundToken}`);
              else if (rgba(c).slice(0, 3).some((v, i) => Math.abs(v - want[i]) > 3)) grounds.push(`${el} ${c} vs ground ${groundToken}`);
            }
          }
          return { bg: cs.backgroundColor, fg: cs.color, families: [...fams], overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ? (() => { const cw = document.documentElement.clientWidth; const el = [...document.body.querySelectorAll('*')].filter((e) => e.getBoundingClientRect().right > cw + 1).sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right).find((e) => !e.parentElement || e.parentElement.getBoundingClientRect().right <= cw + 1) ?? null; return `page is ${document.documentElement.scrollWidth} px wide in a ${cw} px viewport${el ? `, from <${el.tagName.toLowerCase()}${el.classList[0] ? `.${el.classList[0]}` : ''}>` : ''}`; })() : null, title: document.title, lang: document.documentElement.lang, stuck, long, edge, nested, ratioH1, grounds, eyebrows, sectionCount, soft };
        }, groundToken));
        // Measured for the jury, never a rule (headline length and the action's place are judged by decision): how many
        // lines each h1–h3 takes at this width, and which actions drawn as buttons sit in the first viewport.
        const lines = await step('headline lines', () => page.evaluate(() => {
          const tucked = (el) => !!el.closest('[hidden],[inert],[aria-hidden="true"],dialog:not([open]),template');
          // Visible words only: a split heading often carries a clipped screen-reader copy beside its drawn lines.
          const hidden = (n, stop) => { for (let e = n.parentElement; e && e !== stop.parentElement; e = e.parentElement) { const st = getComputedStyle(e); if (e.getAttribute('aria-hidden') === 'true' && e !== stop) continue; if ((st.clip && st.clip !== 'auto') || /inset\(50%/.test(st.clipPath || '') || st.display === 'none' || st.visibility === 'hidden') return true; const b = e.getBoundingClientRect(); if (b.width <= 1 || b.height <= 1) return true; } return false; };
          const visibleText = (el) => { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const out = []; for (let t = w.nextNode(); t; t = w.nextNode()) if (t.nodeValue.trim() && !hidden(t, el)) out.push(t); return out; };
          const count = (nodes) => { const tops = new Set(); for (const t of nodes) { const r = document.createRange(); r.selectNodeContents(t); for (const b of r.getClientRects()) if (b.width > 1 && b.height > 1) tops.add(Math.round(b.top / 4)); } return tops.size; };
          const headlines = [...document.querySelectorAll('h1,h2,h3')].filter((el) => !tucked(el) && el.textContent.trim() && el.getBoundingClientRect().width > 0)
            .slice(0, 12).map((el) => { const nodes = visibleText(el); return { tag: el.tagName.toLowerCase(), text: (nodes.filter((t) => !t.parentElement.closest('[aria-hidden="true"]')).map((t) => t.nodeValue).join('') || nodes.map((t) => t.nodeValue).join('')).trim().replace(/\s+/g, ' ').slice(0, 48), lines: count(nodes), px: Math.round(parseFloat(getComputedStyle(el).fontSize)) }; });
          const actions = [...document.querySelectorAll('a[href],button,[role="button"]')].filter((el) => {
            if (tucked(el) || el.closest('nav,header')) return false;
            const b = el.getBoundingClientRect(), st = getComputedStyle(el);
            const drawn = !/rgba\(0, 0, 0, 0\)|transparent/.test(st.backgroundColor) || (parseFloat(st.borderTopWidth) > 0 && st.borderTopStyle !== 'none');
            return drawn && b.width > 24 && b.height > 20 && b.top >= 0 && b.bottom <= innerHeight && st.visibility === 'visible';
          }).map((el) => el.textContent.trim().replace(/\s+/g, ' ').slice(0, 32));
          return { headlines, firstViewportActions: actions };
        }));
        // Layout shift during load (P08), read before any scroll: the sweep jumps between positions, and a
        // pinned element handing off between fixed and in-flow at a jump would count as a shift no reader sees.
        const shift = await step('layout shift', () => page.evaluate(() => window.__awardsShift ?? null));
        if (shift && shift.value > 0.1) add('P08', `${label} (rendered)`, null, `CLS ${shift.value.toFixed(3)} during load${shift.top ? `, largest from ${shift.top}` : ''}`, shift.value > 0.25 ? 'P1' : undefined);
        if (r) {
          const where = `${label} (rendered)`;
          renderedCoverage[label] = { textsMeasured: contrast?.measured ?? 'unmeasured', textsOverImagery: contrast?.unmeasured ?? 0, ...(shift ? { clsLoad: Number(shift.value.toFixed(4)) } : {}), ...(lines ?? {}) };
          for (const f of contrast?.fails.slice(0, 4) ?? []) add('C01', where, null, `${f.say} ${f.fg} on ${f.bg} = ${f.ratio}:1, needs ${f.need}:1`);
          if (r.overflow) add('L02', where, null, `horizontal overflow: ${r.overflow}`);
          for (const f of r.families) if (reflex.has(f.toLowerCase())) add('T01', where, null, f);
          for (const s of r.stuck.slice(0, 3)) add('L06', where, null, s);
          if (r.long.length) add('L07', where, null, r.long[0]);
          if (label === 'mobile') for (const s of r.edge.slice(0, 3)) add('L08', where, null, s);
          if (label === 'desktop' && r.ratioH1 !== null && r.ratioH1 < 1.5) add('T08', where, null, `h1 is ${r.ratioH1.toFixed(2)}× the body size`);
          for (const s of r.nested.slice(0, 3)) add('X20', where, null, s);
          if (label === 'desktop' && r.eyebrows.length > Math.ceil(r.sectionCount / 3)) add('X21', where, null, `${r.eyebrows.length} across ${r.sectionCount} section(s), at most ${Math.ceil(r.sectionCount / 3)}: ${r.eyebrows.slice(0, 3).join(', ')}`);
          if (label === 'desktop') for (const s of r.soft.slice(0, 3)) add('P09', where, null, s);
          if (label === 'desktop') for (const s of r.grounds) add('C05', where, null, s);
        }
        // Target size, phone: controls under 24 × 24 px whose 24 px circle meets another target's (WCAG 2.2,
        // 2.5.8), A14; and any other control under 44 × 44 px, the floor the jury's usability walk holds (A18).
        // Links inside running text are exempt from both, as the criterion allows.
        if (label === 'mobile') {
          const targets = await step('target size', () => page.evaluate(() => {
            const all = [...document.querySelectorAll('a[href],button,input:not([type="hidden"]),select,textarea,summary,[role="button"],[tabindex="0"]')].filter((el) => {
              if (el.closest('[hidden],[inert],[aria-hidden="true"],dialog:not([open])')) return false;
              const b = el.getBoundingClientRect(), s = getComputedStyle(el);
              return b.width > 2 && b.height > 2 && s.visibility === 'visible' && Number(s.opacity) > 0;
            });
            const centre = (el) => { const b = el.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; };
            const out = { small: [], under44: [] };
            for (const el of all) {
              const b = el.getBoundingClientRect();
              if ((b.width >= 44 && b.height >= 44) || b.right <= 0 || b.left >= innerWidth) continue;
              const block = el.parentElement?.closest('p,li,dd,td,figcaption,blockquote');
              if (el.tagName === 'A' && block && block.textContent.trim().length > el.textContent.trim().length + 10) continue;
              const name = `<${el.tagName.toLowerCase()}> “${(el.textContent.trim() || el.getAttribute('aria-label') || '').slice(0, 30)}” ${Math.round(b.width)}×${Math.round(b.height)} px`;
              const [x, y] = centre(el);
              if ((b.width < 24 || b.height < 24) && all.some((o) => o !== el && Math.hypot(centre(o)[0] - x, centre(o)[1] - y) < 24)) out.small.push(name);
              else out.under44.push(name);
            }
            return out;
          }));
          for (const s of targets?.small.slice(0, 3) ?? []) add('A14', `${label} (rendered)`, null, s);
          if (targets?.under44.length) add('A18', `${label} (rendered)`, null, `${targets.under44.length} control(s), e.g. ${targets.under44.slice(0, 3).join(', ')}`);
        }
        if (label === 'desktop' && axe) {
          await step('axe-core load', () => page.addScriptTag({ path: axe.file }));
          const found = await step('axe-core', () => page.evaluate(async () => {
            if (!window.axe) throw new Error('axe-core did not load into the page');
            // Contrast and target size are measured by C01, A12 and A14 above; axe covers the rest of WCAG 2.2 A/AA.
            const run = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, rules: { 'color-contrast': { enabled: false }, 'target-size': { enabled: false } }, resultTypes: ['violations'] });
            return run.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, target: v.nodes[0]?.target?.join(' ') ?? '' }));
          }), 45000);
          for (const v of found?.slice(0, 6) ?? []) add('A16', `${label} (rendered)`, null, `${v.id} (${v.impact}, ${v.n}×): ${v.help} — ${v.target}`, /critical|serious/.test(v.impact ?? '') ? 'P1' : 'P2');
        }
        // Keyboard focus, desktop: Tab through the first controls and measure each in its focus state, where
        // a label can lose its contrast against the focus fill and a ring can vanish into the ground.
        if (label === 'desktop' && contrast) {
          const visited = new Set();
          const labels = [], rings = [];
          for (let i = 0; i < 12 && !dead; i++) {
            if ((await step('focus', () => page.keyboard.press('Tab').then(() => true))) === undefined) break;
            await page.waitForTimeout(200);
            const f = await step('focus contrast', () => page.evaluate(() => window.__awardsContrast.focused()));
            if (!f || visited.has(f.key)) break;
            visited.add(f.key);
            if (f.text && !f.text.unmeasured && f.text.ratio < f.text.need) labels.push(`${f.say} focused: ${f.text.fg} on ${f.text.bg} = ${f.text.ratio}:1, needs ${f.text.need}:1`);
            if (f.ring && f.ring.ratio < 3) rings.push(`${f.say} ring ${f.ring.color} on ${f.ring.bg} = ${f.ring.ratio}:1`);
          }
          if (renderedCoverage[label]) renderedCoverage[label].focusStops = visited.size;
          for (const s of labels.slice(0, 4)) add('C01', `${label} (rendered, focus)`, null, s);
          for (const s of rings.slice(0, 4)) add('A12', `${label} (rendered, focus)`, null, s);
        }
        // The whole page, scrolled through: blank viewports (L09), lopsided sections (L10, L13), covered text (L11),
        // unequal margins (L12), untitled sections (L14) and near-empty screens (L15).
        const sweep = await step('scroll sweep', () => page.evaluate(sweepPage, label === 'desktop'), 60000);
        if (sweep) {
          const where = `${label} (rendered)`;
          for (const s of sweep.blank.slice(0, 2)) add('L09', where, null, s);
          for (const s of sweep.lopsided.slice(0, 2)) add(label === 'desktop' ? 'L13' : 'L10', where, null, s);
          // The hit test proposes, the pixels decide: a transparent cut-out, a glass sheen or a canvas that draws
          // nothing over the text is hit but hides nothing.
          const confirmed = await step('covered text, by pixels', () => coveredByPixels(page, sweep.covered.slice(0, 5)), 60000);
          for (const c of (confirmed ?? []).slice(0, 3)) add('L11', where, null, c.say);
          if (sweep.margins && Math.abs(sweep.margins.left - sweep.margins.right) > Math.max(16, 0.5 * Math.min(sweep.margins.left, sweep.margins.right))) add('L12', where, null, `nearest text ${sweep.margins.left} px from the left edge and ${sweep.margins.right} px from the right`);
          for (const s of sweep.untitled.slice(0, 3)) add('L14', where, null, s);
          for (const s of sweep.nearEmpty) add('L15', where, null, s);
          if (renderedCoverage[label]) Object.assign(renderedCoverage[label], { sweepSteps: sweep.steps, wordsPerScreen: sweep.wordsPerScreen, ...(sweep.margins ? { margins: sweep.margins } : {}) });
        }
        for (const e of errors) findings.push({ rule: 'ERR', severity: 'P1', scope: 'render', file: label, line: null, message: `page error: ${e.slice(0, 160)}`, fix: 'Fix runtime errors before review' });
        await page.close().catch(() => {});
      }
    } finally {
      await browser.close().catch(() => {});
      if (server) await server.close();
    }
  }
}

// ---------- apply exceptions, dedupe, output ----------
const seen = new Set();
const final = findings.filter((f) => {
  if (exceptions.has(f.rule) || exceptions.has(`${f.rule}@${f.file}`) || exceptions.has(`${f.rule}@${f.file}:${f.line}`)) return false;
  const where = rel(f.file).split(path.sep).join('/');
  if (scoped.some((x) => x.rule === f.rule && where.includes(x.scope))) return false;
  const key = `${f.rule}|${f.file}|${f.line}|${f.message}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
const order = { P0: 0, P1: 1, P2: 2, P3: 3 };
final.sort((a, b) => order[a.severity] - order[b.severity] || a.rule.localeCompare(b.rule));
const summary = { P0: 0, P1: 0, P2: 0, P3: 0 };
for (const f of final) summary[f.severity]++;
const result = { target: String(target), scannedFiles: sources.length, at: now(), summary, exceptions: [...new Set([...exceptions, ...scoped.map((x) => `${x.rule}@${x.scope}`)])], ...(axeReport ? { axe: axeReport, rendered: renderedCoverage } : {}), ...(renderedFrom ? { renderedFrom: { ...renderedFrom, dir: rel(renderedFrom.dir) } } : {}), findings: final.map((f) => ({ ...f, file: rel(f.file) })) };

if (args.quick) {
  const material = final.filter((f) => f.severity === 'P0' || f.severity === 'P1' || f.severity === 'P2').slice(0, 8);
  if (material.length) {
    const lines = material.map((f) => `- ${f.rule} (${f.severity}) ${f.message}${f.line ? ` [line ${f.line}]` : ''} → ${f.fix}`);
    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: `awards craft-floor audit for ${rel(String(target))}:\n${lines.join('\n')}\nRun \`node "${path.relative(projectDir, path.join(here, 'audit.mjs'))}" <dir>\` for the full report, or record a deliberate exception under AWARDS.md ## Exceptions.` } }));
  }
  process.exit(0);
}

if (args.write !== false && !isUrl) {
  const outDir = path.join(projectDir, '.awards');
  try {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'audit.json'), JSON.stringify(result, null, 2));
  } catch {}
}
if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`audit of ${result.target} — ${sources.length} file(s) — P0 ${summary.P0} · P1 ${summary.P1} · P2 ${summary.P2} · P3 ${summary.P3}`);
  if (final.length) console.log(fmtTable(final.map((f) => [f.severity, f.rule, `${rel(f.file)}${f.line ? ':' + f.line : ''}`, f.message]), ['sev', 'rule', 'where', 'finding']));
  else console.log('clean');
}
// exitCode, not exit(): a piped stdout drains asynchronously, and exit() cut a large --json report at 64 KB.
process.exitCode = summary.P0 + summary.P1 > 0 ? 2 : 0;
