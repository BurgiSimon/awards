#!/usr/bin/env node
// Deterministic craft-floor audit for award-level front-ends, including the slop habits in references/anti-patterns.md.
// Static by default; --render adds in-page checks (contrast, overflow, rendered fonts, stuck content, measure, edges, hierarchy, nested cards).
// Usage: node audit.mjs <dir|file|url> [--json] [--quick] [--changed-file <path|->] [--render]
//   [--scope fonts,contrast,motion,a11y,layout,perf,surfaces,slop] [--ignore T01,…] [--config .awards/audit.json] [--no-write]
// Exit: 0 clean (no P0/P1) · 2 P0/P1 findings · 3 missing browser · 1 error. Quick mode exits 0 and prints hook JSON.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
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
const ignoredRules = new Set(String(args.ignore ?? '').split(',').map((s) => s.trim()).filter(Boolean));
const scopes = args.scope ? new Set(String(args.scope).split(',').map((s) => s.trim())) : null;

function add(rule, file, line, detail) {
  if (ignoredRules.has(rule)) return;
  const r = RULES[rule];
  if (!r) return;
  if (scopes && !scopes.has(r.scope)) return;
  findings.push({ rule, severity: r.severity, scope: r.scope, file, line: line ?? null, message: detail ? `${r.message}: ${detail}` : r.message, fix: r.fix });
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
const ownerOf = (from) => {
  for (let d = from; ; d = path.dirname(d)) {
    if (fs.existsSync(path.join(d, 'AWARDS.md'))) return d;
    if (d === path.dirname(d)) return null;
  }
};
const targetDir = isUrl ? null : (() => {
  const abs = path.resolve(String(target));
  return fs.existsSync(abs) && fs.statSync(abs).isDirectory() ? abs : path.dirname(abs);
})();
const projectDir = process.env.CLAUDE_PROJECT_DIR || (targetDir && ownerOf(targetDir)) || process.cwd();
if (args.quick) {
  // The hook is inert outside award-level projects and for non-UI files.
  if (!fs.existsSync(path.join(projectDir, 'AWARDS.md')) || process.env.AWARDS_HOOK === '0') process.exit(0);
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
function walk(dir, depth = 0) {
  if (depth > 8) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      if (!SKIP_DIRS.has(ent.name) && !ent.name.startsWith('.')) walk(path.join(dir, ent.name), depth + 1);
    } else {
      files.push(path.join(dir, ent.name));
    }
  }
}

// ---------- exceptions ----------
const exceptions = new Set();
const awardsMd = [path.join(projectDir, 'AWARDS.md'), !isUrl && fs.statSync(path.resolve(String(target))).isDirectory() ? path.join(path.resolve(String(target)), 'AWARDS.md') : null].filter(Boolean);
for (const p of awardsMd) {
  if (!fs.existsSync(p)) continue;
  const md = fs.readFileSync(p, 'utf8');
  const sec = md.split(/^## Exceptions/m)[1];
  if (!sec) continue;
  for (const m of sec.matchAll(/\b([A-Z]\d{2})\b/g)) exceptions.add(m[1]);
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
    for (const m of text.matchAll(/audit-ignore:\s*([A-Z]\d{2}(?:\s*,\s*[A-Z]\d{2})*)/g)) {
      for (const id of m[1].split(',')) exceptions.add(`${id.trim()}@${f}`);
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

function eachCss(fn) {
  for (const s of cssSources) fn(s.file, stripComments(s.text));
  for (const s of htmlSources) {
    for (const m of s.text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) fn(s.file, stripComments(m[1]), s.text.slice(0, m.index).split('\n').length - 1);
  }
}
function eachJs(fn) {
  for (const s of jsSources) fn(s.file, s.text);
  for (const s of htmlSources) {
    for (const m of s.text.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)) fn(s.file, m[1], s.text.slice(0, m.index).split('\n').length - 1);
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
  tokenProps ??= customProperties(cssText);
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
  if (/scroll-behavior\s*:\s*smooth/i.test(css) && /new\s+Lenis|from\s+['"]lenis|lenis\/react|lenis\/vue/i.test(jsText)) add('M05', file, lineOf(css, css.search(/scroll-behavior/i)) + off);
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
    if (/^(none|0)$/i.test(d.value) && !/:focus-visible/.test(cssText)) add('A07', file, lineOf(css, d.index) + off);
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
  const bodyBg = cssText.match(/body\s*\{[^}]*background(?:-color)?\s*:\s*([^;}]+)/i);
  const bodyFg = cssText.match(/body\s*\{[^}]*[^-]color\s*:\s*([^;}]+)/i);
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
  const hasRM = /prefers-reduced-motion/i.test(allText);
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
    if (/pin\s*:\s*true/.test(js) && /position\s*:\s*sticky/i.test(cssText)) add('M06', file, lineOf(js, js.search(/pin\s*:\s*true/)) + off);
    if (/setPixelRatio\(\s*(window\.)?devicePixelRatio\s*\)/.test(js)) add('P06', file, lineOf(js, js.search(/setPixelRatio/)) + off);
    if (/new\s+(THREE\.)?WebGLRenderer|new\s+Renderer\(/.test(js) && !/\.dispose\(/.test(jsText)) add('P07', file, lineOf(js, js.search(/WebGLRenderer|new\s+Renderer\(/)) + off);
    if (/GLTFLoader|\.glb['"]|\.gltf['"]/.test(js) && !/DRACOLoader|MeshoptDecoder|KTX2Loader|draco|meshopt/i.test(jsText)) add('P03', file, null);
    const pointerOnly = /addEventListener\(\s*['"](pointerdown|mousedown|touchstart|dragstart)['"]/.test(js);
    if (pointerOnly && !/addEventListener\(\s*['"]keydown['"]|onkeydown|@keydown|on:keydown/.test(jsText)) add('A11', file, lineOf(js, js.search(/pointerdown|mousedown|touchstart|dragstart/)) + off);
  });
  const customCursor = /data-cursor|\.cursor\b|cursor\s*:\s*none|customCursor|class(Name)?=["'][^"']*\bcursor\b/i.test(allText);
  if (customCursor && !/pointer\s*:\s*coarse|pointer\s*:\s*fine|hover\s*:\s*none|hover\s*:\s*hover/i.test(allText)) add('A08', 'project', null);
}

// ---------- rules: HTML ----------
for (const s of htmlSources) {
  const t = s.text;
  const isPage = /<html/i.test(t);
  const file = s.file;
  if (isPage) {
    const html = tags(t, 'html')[0];
    if (html && !hasAttr(html.attrs, 'lang')) add('A09', file, html.line);
    if (!/<meta[^>]+name=["']viewport["']/i.test(t)) add('L03', file, null);
    if (!/<main\b/i.test(t)) add('A01', file, null);
    if (!/<meta[^>]+name=["']theme-color["']/i.test(t)) add('S03', file, null);
    if (!/<meta[^>]+name=["']color-scheme["']/i.test(t) && !/color-scheme\s*:/i.test(cssText)) add('S04', file, null);
    if (!/<link[^>]+rel=["'][^"']*icon[^"']*["']/i.test(t)) add('S05', file, null);
    if (!/property=["']og:image["']/i.test(t)) add('S06', file, null);
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
  for (const c of cls) if (c.classes.some((k) => /^(eyebrow|kicker|overline|pre-?heading)$/i.test(k))) add('L05', file, c.line);
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
  if ((text.match(/\b0[1-9]\s*[\/·—-]/g) || []).length >= 3) add('X07', file, null);
  const statEls = cls.filter((c) => c.classes.some((k) => /^(stat|metric|counter|kpi)s?$/i.test(k)));
  const statRow = cls.find((c) => c.classes.some((k) => /^(stats|metrics|numbers|kpis|stat-row|stats-row)$/i.test(k)));
  if (statEls.length >= 3) add('X08', file, null);
  else if (statRow) add('X08', file, statRow.line, `.${statRow.classes.join('.')}`);
  if (isPage && /<(button|a)\b/i.test(t) && !/:focus-visible/.test(cssText)) add('A06', file, null);
  if (isPage && !/::selection/.test(cssText)) add('S01', file, null);
  if (isPage && !/scrollbar/.test(cssText)) add('S02', file, null);
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
      const dir = fs.statSync(abs).isDirectory() ? abs : path.dirname(abs);
      server = await serveDirectory(dir);
      url = server.url + (fs.statSync(abs).isDirectory() ? '' : path.basename(abs));
    }
    const browser = await launchChromium(found.module);
    try {
      for (const [label, width] of [['desktop', 1440], ['mobile', 390]]) {
        const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 } });
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await page.goto(url, { waitUntil: 'load', timeout: 30000 }).catch((e) => errors.push(e.message));
        // Give entrances a fair chance: the page's own ready signal (capped), then two seconds.
        await page.evaluate(() => Promise.race([window.__awards?.ready, new Promise((res) => setTimeout(res, 8000))])).catch(() => {});
        await page.waitForTimeout(2000);
        const r = await page.evaluate(() => {
          const cs = getComputedStyle(document.body);
          const fams = new Set();
          for (const el of document.querySelectorAll('h1,h2,h3,p,a,button,li,span')) fams.add(getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim());
          const tucked = (el) => el.closest('[hidden],[inert],[aria-hidden="true"],dialog:not([open]),template');
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
            if (el.textContent.trim().length >= 40 && tb.width && (tb.left < 12 || innerWidth - tb.right < 12)) edge.push(say(el));
          }
          const boxed = (el) => { const s = getComputedStyle(el); return (parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none') || s.boxShadow !== 'none'; };
          for (const el of document.querySelectorAll('[class*="card"]')) {
            const outer = el.parentElement?.closest('[class*="card"]');
            if (outer && boxed(el) && boxed(outer)) nested.push(`.${[...el.classList].join('.')} inside .${[...outer.classList].join('.')}`);
          }
          const h1 = [...document.querySelectorAll('h1')].find((el) => !tucked(el) && !el.querySelector('svg,img,picture,canvas'));
          const body = [...document.querySelectorAll('p')].find((el) => !tucked(el) && el.textContent.trim().length >= 40);
          const ratioH1 = h1 && body ? px(h1) / px(body) : null;
          return { bg: cs.backgroundColor, fg: cs.color, families: [...fams], overflow: document.documentElement.scrollWidth > window.innerWidth + 1, title: document.title, lang: document.documentElement.lang, stuck, long, edge, nested, ratioH1 };
        }).catch(() => null);
        if (r) {
          const where = `${label} (rendered)`;
          const ratio = contrastRatio(r.bg, r.fg);
          if (ratio !== null && ratio < 4.5) add('C01', where, null, `${r.fg} on ${r.bg} = ${ratio}:1`);
          if (r.overflow) add('L02', where, null, 'horizontal overflow');
          for (const f of r.families) if (reflex.has(f.toLowerCase())) add('T01', where, null, f);
          for (const s of r.stuck.slice(0, 3)) add('L06', where, null, s);
          if (r.long.length) add('L07', where, null, r.long[0]);
          if (label === 'mobile') for (const s of r.edge.slice(0, 3)) add('L08', where, null, s);
          if (label === 'desktop' && r.ratioH1 !== null && r.ratioH1 < 1.5) add('T08', where, null, `h1 is ${r.ratioH1.toFixed(2)}× the body size`);
          for (const s of r.nested.slice(0, 3)) add('X20', where, null, s);
        }
        for (const e of errors) findings.push({ rule: 'ERR', severity: 'P1', scope: 'render', file: label, line: null, message: `page error: ${e.slice(0, 120)}`, fix: 'Fix runtime errors before review' });
        await page.close();
      }
    } finally {
      await browser.close();
      if (server) await server.close();
    }
  }
}

// ---------- apply exceptions, dedupe, output ----------
const seen = new Set();
const final = findings.filter((f) => {
  if (exceptions.has(f.rule) || exceptions.has(`${f.rule}@${f.file}`)) return false;
  const key = `${f.rule}|${f.file}|${f.line}|${f.message}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
const order = { P0: 0, P1: 1, P2: 2, P3: 3 };
final.sort((a, b) => order[a.severity] - order[b.severity] || a.rule.localeCompare(b.rule));
const summary = { P0: 0, P1: 0, P2: 0, P3: 0 };
for (const f of final) summary[f.severity]++;
const result = { target: String(target), scannedFiles: sources.length, at: now(), summary, exceptions: [...exceptions], findings: final.map((f) => ({ ...f, file: rel(f.file) })) };

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
process.exit(summary.P0 + summary.P1 > 0 ? 2 : 0);
