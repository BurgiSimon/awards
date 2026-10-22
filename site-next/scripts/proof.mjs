#!/usr/bin/env node
// The contact sheet's data step (AWARDS.md, LOAD & CLOSE → Bootstrapping). What the strip shows depends only on
// what exists on disk, and this script is the one place that reads it. It writes src/data/proof.json and the
// re-encoded frames under public/proof/<capture>/<route>/, both committed, because .awards/ is gitignored and
// the deploy builds without it. `npm run build` only reads them.
//   (a) the newest page-round jury report → the frames of the capture runs its Evidence names, and its marks
//   (b) else the newest valid `capture.mjs --routes` run → dated, unmarked frames and what that capture measured
//   (c) else no strip
// Usage: node scripts/proof.mjs [--project <dir>] [--out <dir>] [--json] [--check] [--state b|c]
//   --project  the site whose .awards/ is read (default: this site)
//   --out      the root that receives src/data/proof.json and public/proof/ (default: the project)
//   --json     print proof.json instead of the summary
//   --check    parse and select only: no browser, nothing written (a report's shape, before a real run)
//   --state    testing only: b ignores every jury report, c ignores the captures as well
// Exit: 0 written · 1 usage, a report whose shape is not the expected one, or evidence missing on disk · 3 no browser
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from '../../plugins/awards/scripts/lib/report.mjs';
import { siteRoot, openBrowser, pngSize, encodeWebp, prune, posix } from './lib/webp.mjs';

const STOPS = [0, 25, 50, 75, 100];
const CLASSES = ['desktop', 'tablet', 'mobile'];
// Strip files at about twice the width the page draws them: desktop 300 px, tablet and phone under 200 px.
const STRIP_WIDTH = { desktop: 600, tablet: 360, mobile: 360 };
const FULL_MAX = 1440;
const QUALITY = { strip: 0.8, full: 0.82 };
const DASH = '[—–]';

const args = parseArgs(process.argv.slice(2), { json: 'boolean', check: 'boolean' });
if (args.help) {
  console.log('usage: node scripts/proof.mjs [--project <dir>] [--out <dir>] [--json] [--check] [--state b|c]');
  process.exit(0);
}
if (args.state !== undefined && !['b', 'c'].includes(String(args.state))) fail('--state takes b or c (testing only)');
const project = path.resolve(String(args.project ?? siteRoot));
const outRoot = path.resolve(String(args.out ?? project));
if (!fs.existsSync(project)) fail(`project not found: ${project}`);
const capturesDir = path.join(project, '.awards', 'captures');
const juryDir = path.join(project, '.awards', 'jury');
const dataFile = path.join(outRoot, 'src', 'data', 'proof.json');
const publicDir = path.join(outRoot, 'public');
const proofDir = path.join(publicDir, 'proof');
const projRel = (p) => posix(path.relative(project, p));

class ShapeError extends Error {
  constructor(file, section, message) {
    super(`${file} — section "${section}": ${message}`);
  }
}

function fail(message) {
  console.error(`proof: ${message}`);
  process.exit(1);
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const slugOf = (route) => route.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'home';
// "install-html", "install" and "/install/" all name the same page.
const routeName = (slug) => {
  const n = slug.replace(/-html?$/, '');
  return n === 'index' || n === '' ? 'home' : n;
};
const stageOf = (dir) => /^\d{8}[-T]?\d{6}Z?-(.+)$/.exec(dir)?.[1] ?? null;
const stopLabel = (s) => `s${String(s).padStart(2, '0')}`;
// window.__awards.state().build as the page exposes it: a string, or { id } / { version, hash }.
const buildId = (b) => {
  if (b === null || b === undefined || b === '') return null;
  if (typeof b !== 'object') return String(b);
  return b.id ?? ([b.version, b.hash ?? b.commit].filter(Boolean).join('+') || JSON.stringify(b));
};

// ---------------------------------------------------------------------------------------------------------------
// Capture manifests → frames

// One capture.mjs manifest, normalised: its frames with route, width class, variant and placement.
function loadManifest(file, { route, slug } = {}) {
  const m = readJson(file);
  const dir = path.dirname(file);
  const relDir = posix(path.relative(capturesDir, dir));
  if (relDir.startsWith('..')) throw new Error(`${file} is not under .awards/captures/`);
  const segs = relDir === '' ? [] : relDir.split('/');
  const run = segs[0] ?? `capture-${String(m.createdAt ?? '').replace(/[-:]/g, '').slice(0, 15)}`;
  const prefix = path.basename(file).replace(/-?manifest\.json$/, '');
  const urlPath = (() => { try { return new URL(m.url).pathname; } catch { return '/'; } })();
  const routePath = route ?? urlPath;
  const routeSlug = slug ?? slugOf(routePath);
  const variantsOf = (label) => [
    ...(label === 'desktop-rm' ? ['reduced-motion'] : []),
    ...(prefix ? [m.webglRequested === false ? 'no-webgl' : prefix] : []),
  ];
  const buildOf = (c) => buildId(c.awardsState?.build ?? m.metrics?.[c.label]?.awardsState?.build);
  const frames = [];
  for (const c of m.captures ?? []) {
    if (!String(c.file).endsWith('.png') || !['scroll', 'state', 'hover', 'focus-visible'].includes(c.kind)) continue;
    const cls = c.label === 'desktop-rm' ? 'desktop' : c.label;
    if (!CLASSES.includes(cls)) continue;
    const base = path.basename(c.file, '.png');
    // Absolute paths in an old manifest may predate a move; the frame always sits beside its manifest.
    const png = path.join(dir, path.basename(c.file));
    const kind = c.kind === 'focus-visible' ? 'focus' : c.kind;
    const at = typeof c.awardsState?.scroll === 'number' ? c.awardsState.scroll : null;
    frames.push({
      id: [...segs, base].join('/') || base,
      dir: segs.join('/'),
      dirSegs: segs,
      base,
      png,
      run,
      capDir: segs.slice(1).join('/'),
      manifest: projRel(file),
      route: routeSlug,
      routePath,
      class: cls,
      variants: variantsOf(c.label),
      kind,
      stop: kind === 'scroll' ? c.scroll : null,
      state: kind === 'state' ? c.name : kind === 'scroll' ? null : `${kind}-${c.index}`,
      element: c.element ? { tag: c.element.tag, text: c.element.text, matched: c.element.matched } : undefined,
      at: kind === 'scroll' ? c.scroll / 100 : at,
      viewport: m.viewports?.[cls] ?? null,
      capturedAt: m.createdAt ?? null,
      build: buildOf(c),
    });
  }
  return {
    file,
    rel: projRel(file),
    run,
    route: routeSlug,
    routePath,
    createdAt: m.createdAt ?? null,
    pageErrors: (m.pageErrors ?? []).length,
    consoleErrors: (m.consoleErrors ?? []).length,
    failedRequests: (m.failedRequests ?? []).length,
    metrics: m.metrics ?? {},
    builds: [...new Set(Object.values(m.metrics ?? {}).map((x) => buildId(x?.awardsState?.build)).filter(Boolean))],
    frames,
    inRoutes: !!route,
  };
}

// A routes.json run: every route's manifest, in the order the capture took them.
function loadRoutesRun(file) {
  const index = readJson(file);
  const manifests = [];
  for (const r of index.routes ?? []) {
    const mf = path.resolve(project, r.manifest);
    manifests.push({ entry: r, file: mf, exists: fs.existsSync(mf) });
  }
  return { file, at: index.at ?? null, target: index.target ?? null, manifests };
}

// ---------------------------------------------------------------------------------------------------------------
// Report parsing. Every shape check names the section it failed in; nothing is inferred around a missing piece.

function sectionsOf(text) {
  // Template comments stay out of the content; their newlines stay, so line numbers match the file.
  const clean = text.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ''));
  const raw = text.split(/\r?\n/);
  const lines = clean.split(/\r?\n/);
  const head = { title: 'header', lines: [] };
  const sections = [head];
  let current = head;
  lines.forEach((t, i) => {
    const h = /^## (.+?)\s*$/.exec(t);
    if (h) {
      current = { title: h[1], lines: [] };
      sections.push(current);
      return;
    }
    current.lines.push({ no: i + 1, text: t, raw: raw[i] });
  });
  return sections;
}

const content = (s) => s.lines.filter((l) => l.text.trim());

function splitRow(line) {
  const s = line.trim();
  if (!s.startsWith('|')) return null;
  const cells = [];
  let cur = '';
  let tick = false;
  for (let i = 1; i < s.length; i++) {
    const ch = s[i];
    if (ch === '\\' && s[i + 1] === '|') { cur += '|'; i++; continue; }
    if (ch === '`') tick = !tick;
    if (ch === '|' && !tick) { cells.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) cells.push(cur.trim());
  return cells;
}

// Tables in a section, each with the ### subsection it sits under.
function tablesOf(section) {
  const tables = [];
  let sub = null;
  let table = null;
  for (const l of section.lines) {
    const h = /^### (.+?)\s*$/.exec(l.text);
    if (h) { sub = h[1]; table = null; continue; }
    const cells = splitRow(l.text);
    if (!cells) { table = null; continue; }
    if (!table) { table = { sub, header: cells, headerLine: l, rows: [] }; tables.push(table); continue; }
    if (cells.every((c) => /^:?-{3,}:?$/.test(c))) continue;
    table.rows.push({ no: l.no, raw: l.raw, cells, byHeader: Object.fromEntries(table.header.map((h, i) => [h, cells[i] ?? ''])) });
  }
  return tables;
}

const NUM = '(\\d+(?:\\.\\d+)?|unmeasured)';
const SITE_SCORES = new RegExp(`^Design ${NUM} · Usability ${NUM} · Creativity ${NUM} · Content ${NUM} ${DASH} weighted ${NUM}$`);
const COMPONENT_SCORES = new RegExp(`^Design ${NUM} · Usability ${NUM} · Creativity ${NUM} ${DASH} mean ${NUM}$`);
const DISPOSITION = /^disposition: (ship|fix|rebuild|recapture)\s*$/;

// The disposition line and the scores line under it.
function headOf(sections, file, where) {
  const lines = where === 'header' ? sections[0].lines : sections.flatMap((s) => s.lines);
  const at = lines.map((l, i) => [l, i]).filter(([l]) => DISPOSITION.test(l.text));
  if (!at.length) throw new ShapeError(file, where, 'no `disposition: ship|fix|rebuild|recapture` line');
  const dispositions = [...new Set(at.map(([l]) => DISPOSITION.exec(l.text)[1]))];
  if (dispositions.length > 1) throw new ShapeError(file, where, `disposition lines disagree: ${dispositions.join(', ')}`);
  let scores = null;
  for (const [l, i] of at) {
    const next = lines.slice(i + 1).find((x) => x.text.trim());
    if (next && (SITE_SCORES.test(next.text.trim()) || COMPONENT_SCORES.test(next.text.trim()))) { scores = next; break; }
  }
  const [dl] = at[0];
  return { disposition: dispositions[0], dispositionLine: dl.raw.trim(), scoresLine: scores?.raw.trim() ?? null, scoresAt: scores?.no ?? null };
}

function parseScoresLine(line) {
  const site = SITE_SCORES.exec(line);
  if (site) return { kind: 'site', design: site[1], usability: site[2], creativity: site[3], content: site[4], weighted: site[5] };
  const comp = COMPONENT_SCORES.exec(line);
  if (comp) return { kind: 'component', design: comp[1], usability: comp[2], creativity: comp[3], mean: comp[4] };
  return null;
}

// --- citations of frames inside a line or a table cell -----------------------------------------------------------

// capture.mjs file names: [prefix-]<desktop|tablet|mobile|desktop-rm>-<s00|state-name|hover-n|focus-n>
const FRAME_BASE = /^(?:[a-z0-9]+(?:-[a-z0-9]+)*-)?(?:desktop-rm|desktop|tablet|mobile)-(?:s\d{2,3}|state-[a-z0-9]+(?:-[a-z0-9]+)*|hover-\d+|focus-\d+)$/;
const FRAME_BARE = /(?<![\w./*{-])(?:[\w.-]+\/)*(?:[a-z0-9]+-)*(?:desktop|tablet|mobile)(?:-rm)?-(?:s\d{2,3}|state-[a-z0-9]+(?:-[a-z0-9]+)*|hover-\d+|focus-\d+)(?:\.png)?(?![\w/-])/g;
const RANGE = /^(.*?)(\d+)(?:\.\.|…)([a-z]*)(\d+)(.*)$/;

function expandBraces(t) {
  const m = /\{([^{}]*)\}/.exec(t);
  if (!m) return [t];
  return m[1].split(',').flatMap((alt) => expandBraces(t.slice(0, m.index) + alt.trim() + t.slice(m.index + m[0].length)));
}

// `nogl-desktop-s00/s50/s100`: the later segments are alternatives of the first one's stop.
function expandStopList(t) {
  const segs = t.split('/');
  for (let i = 0; i < segs.length - 1; i++) {
    if (/-s\d{2,3}(\.png)?$/.test(segs[i]) && segs.slice(i + 1).every((s) => /^s\d{2,3}(\.png)?$/.test(s))) {
      const stem = segs[i].replace(/s\d{2,3}(\.png)?$/, '');
      return [segs[i], ...segs.slice(i + 1)].map((s) => [...segs.slice(0, i), s.startsWith(stem) ? s : stem + s].join('/'));
    }
  }
  return [t];
}

const globRe = (g) => new RegExp('^' + g.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*') + '$');

// A pattern for one file name: exact, a glob, or a numeric range (desktop-focus-1..3, desktop-rm-s00…s100).
function baseMatcher(last) {
  const name = last.replace(/\.png$/, '');
  const r = RANGE.exec(name);
  if (r && !name.includes('*')) {
    const [, pre, a, mid, b, post] = r;
    const re = new RegExp('^' + pre.replace(/[.+?^${}()|[\]\\]/g, '\\$&') + '(\\d+)' + post.replace(/[.+?^${}()|[\]\\]/g, '\\$&') + '$');
    const lo = Number(a), hi = Number(b);
    if (mid && !pre.endsWith(mid)) return null;
    return { wild: true, test: (base) => { const x = re.exec(base); return !!x && Number(x[1]) >= lo && Number(x[1]) <= hi; }, sample: pre + a + post };
  }
  if (name.includes('*')) return { wild: true, test: (base) => globRe(name).test(base), sample: name.replace(/\*/g, 'desktop') };
  return { wild: false, test: (base) => base === name, sample: name };
}

function dirMatches(pattern, segs) {
  if (pattern.length > segs.length) return false;
  for (let i = 1; i <= pattern.length; i++) {
    const p = pattern[pattern.length - i];
    const f = segs[segs.length - i];
    if (!(p === f || (p.includes('*') && globRe(p).test(f)) || stageOf(f) === p)) return false;
  }
  return true;
}

// A folder under .awards/captures/ on disk (a run, or a run's stage name), whether or not Evidence lists it.
function underCaptures(dirPart) {
  if (!dirPart.length || !fs.existsSync(capturesDir)) return false;
  if (fs.existsSync(path.join(capturesDir, ...dirPart))) return true;
  return fs.readdirSync(capturesDir).some((r) => r === dirPart[0] || stageOf(r) === dirPart[0]);
}

const maskTicks = (text) => text.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length));
const isFrameName = (name) => FRAME_BASE.test(path.basename(name).replace(/\.png$/, ''));

// Resolves every frame a piece of report text names against the frames of the cited capture runs. A bare file
// name belongs to the folder or manifest named just before it in the same text ("`run/manifest.json` + `a.png`").
// Every frame-like citation comes back with its position in the text, resolved or not.
function citations(text, frames) {
  const tokens = [];
  const masked = text.replace(/`([^`]*)`/g, (m, inner, off) => {
    const pieces = inner.replace(/\{[^}]*\}/g, (b) => b.replace(/\s+/g, '')).split(/\s+/).filter(Boolean);
    pieces.forEach((t, i) => tokens.push({ at: off + i / 100, t }));
    return ' '.repeat(m.length);
  });
  for (const m of masked.matchAll(FRAME_BARE)) tokens.push({ at: m.index, t: m[0] });
  tokens.sort((a, b) => a.at - b.at);

  // kind: 'frame' (hits), 'unresolved', 'ambiguous', or 'foreign' (a frame of a page outside .awards/captures/).
  const entries = [];
  // null: no folder named yet · 'foreign': a folder outside .awards/captures/ (dist/, a neighbour) · 'uncited': a
  // capture folder Evidence does not list · otherwise the folder pattern (segments) bare names belong to.
  let ctx = null;
  for (const { at, t: rawToken } of tokens) {
    let token = rawToken.trim().replace(/^[(]+|[),;:.]+$/g, '').replace(/^\.\//, '');
    if (!token) continue;
    if (path.isAbsolute(token)) {
      const rel = posix(path.relative(capturesDir, token));
      if (rel.startsWith('..')) { ctx = 'foreign'; if (isFrameName(token)) entries.push({ at, token, kind: 'foreign' }); continue; }
      token = rel;
    } else if (token.startsWith('.awards/captures/')) token = token.slice('.awards/captures/'.length);
    else if (token.startsWith('.awards/') || token.startsWith('../')) { ctx = 'foreign'; if (isFrameName(token)) entries.push({ at, token, kind: 'foreign' }); continue; }
    for (const e of expandBraces(token).flatMap(expandStopList)) {
      const segs = e.split('/').filter(Boolean);
      const last = segs.at(-1) ?? '';
      const dirPart = segs.slice(0, -1);
      if (/(?:^|-)manifest\.json$|^routes\.json$/.test(last) || e.endsWith('/')) {
        const dir = e.endsWith('/') ? segs : dirPart;
        ctx = frames.some((f) => dirMatches(dir, f.dirSegs)) ? dir : underCaptures(dir) ? 'uncited' : 'foreign';
        continue;
      }
      const matcher = baseMatcher(last);
      if (!matcher || !(last === '*' || FRAME_BASE.test(matcher.sample.replace(/\.png$/, '')))) continue;
      const wild = matcher.wild || dirPart.some((s) => s.includes('*')) || e !== token;
      let hits;
      if (dirPart.length) {
        if (!frames.some((f) => dirMatches(dirPart, f.dirSegs))) {
          ctx = underCaptures(dirPart) ? 'uncited' : 'foreign';
          entries.push({ at, token: e, kind: ctx === 'uncited' ? 'unresolved' : 'foreign' });
          continue;
        }
        ctx = dirPart;
        hits = frames.filter((f) => dirMatches(dirPart, f.dirSegs) && matcher.test(f.base));
      } else if (ctx === 'foreign') {
        entries.push({ at, token: e, kind: 'foreign' });
        continue;
      } else if (ctx === 'uncited') {
        entries.push({ at, token: e, kind: 'unresolved' });
        continue;
      } else {
        hits = ctx ? frames.filter((f) => dirMatches(ctx, f.dirSegs) && matcher.test(f.base)) : [];
        if (!hits.length) hits = frames.filter((f) => matcher.test(f.base));
      }
      if (!hits.length) entries.push({ at, token: e, kind: 'unresolved' });
      else if (!wild && hits.length > 1) entries.push({ at, token: e, kind: 'ambiguous', matches: hits.map((f) => f.id) });
      else entries.push({ at, token: e, kind: 'frame', frames: hits });
    }
  }
  return entries;
}

// Clauses of a line: split at ';' and at a full stop that ends a sentence (not "vs.", "e.g.", "i.e.", "cf.").
function clauses(masked) {
  const out = [];
  let start = 0;
  for (let i = 0; i < masked.length; i++) {
    const ch = masked[i];
    const stop = ch === ';' || (ch === '.' && /\s/.test(masked[i + 1] ?? ' ') && !/\b(?:vs|e\.g|i\.e|cf)$/i.test(masked.slice(Math.max(0, i - 4), i)));
    if (stop) { out.push([start, i]); start = i + 1; }
  }
  out.push([start, masked.length]);
  return out;
}

// Comparisons ("A vs B", "A against B", "A versus B"): in a clause that cites a frame before the word, every
// frame cited after it is the reference that shows how it should look, and carries no mark.
function referenceSpans(text, entries) {
  const masked = maskTicks(text);
  const spans = [];
  for (const [a, b] of clauses(masked)) {
    const m = /\b(?:vs\.?|versus|against)(?=\s|$)/i.exec(masked.slice(a, b));
    if (!m) continue;
    const at = a + m.index;
    if (entries.some((e) => e.at >= a && e.at < at)) spans.push([at, b]);
  }
  return spans;
}

// Top-level parentheses of a line, outside backticks: [open, close] positions.
function parentheticals(masked, from = 0) {
  const out = [];
  let depth = 0;
  let open = -1;
  for (let i = from; i < masked.length; i++) {
    if (masked[i] === '(') { if (depth++ === 0) open = i; }
    else if (masked[i] === ')' && depth > 0 && --depth === 0) out.push([open, i]);
  }
  return out;
}

// Frames named by one mark source, minus comparison references and anything outside `scope` ([start, end) in the
// text). A kept citation that names no frame of the cited runs, or several, stops the run.
function framesOf(text, frames, file, section, what, { scope = null } = {}) {
  const entries = citations(text, frames);
  const refs = referenceSpans(text, entries);
  const kept = entries.filter((e) => (!scope || (e.at >= scope[0] && e.at < scope[1])) && !refs.some(([a, b]) => e.at >= a && e.at < b));
  const unresolved = kept.filter((e) => e.kind === 'unresolved');
  const ambiguous = kept.filter((e) => e.kind === 'ambiguous');
  if (unresolved.length) throw new ShapeError(file, section, `${what} cites ${unresolved.map((e) => `\`${e.token}\``).join(', ')}, which no capture run listed under Evidence holds`);
  if (ambiguous.length) throw new ShapeError(file, section, `${what} cites ${ambiguous.map((e) => `\`${e.token}\` (${e.matches.join(', ')})`).join('; ')}: more than one frame fits`);
  const seen = new Set();
  return kept.filter((e) => e.kind === 'frame').flatMap((e) => e.frames).filter((f) => !seen.has(f.id) && seen.add(f.id));
}

// A slop family line is `<family> — <evidence>`. The family is seen where the evidence's first frame citation
// points: the parenthetical that holds it, or, when it stands outside parentheses (the template's bare form), its
// clause. Frames cited later in the line refer to other places and carry no mark.
function slopScope(text, frames) {
  const masked = maskTicks(text);
  const dash = new RegExp(`\\s${DASH}\\s`).exec(masked);
  if (!dash) return null;
  const from = dash.index + dash[0].length;
  const first = citations(text, frames).map((e) => e.at).filter((p) => p >= from).sort((a, b) => a - b)[0];
  if (first === undefined) return [from, masked.length];
  const group = parentheticals(masked, from).find(([a, b]) => first > a && first < b);
  if (group) return [group[0], group[1] + 1];
  const clause = clauses(masked).find(([a, b]) => first >= a && first < b);
  return [Math.max(from, clause[0]), clause[1]];
}

function requireSection(sections, title, file) {
  const s = sections.find((x) => x.title.toLowerCase() === title.toLowerCase());
  if (!s) throw new ShapeError(file, title, 'missing');
  return s;
}

// Evidence: every backticked manifest or routes.json under .awards/captures/ (neighbour and research captures are
// third-party pages and never part of the sheet).
function evidenceManifests(section, file) {
  const out = [];
  for (const l of section.lines) {
    let ctxDir = null;
    for (const m of l.text.matchAll(/`([^`]*?(?:manifest\.json|routes\.json))`/g)) {
      const t = m[1].trim();
      let abs;
      if (path.isAbsolute(t)) abs = t;
      else if (t.startsWith('.awards/')) abs = path.join(project, t);
      else abs = path.join(ctxDir ?? capturesDir, t);
      if (path.relative(capturesDir, abs).startsWith('..')) continue;
      if (t.startsWith('.awards/') || path.isAbsolute(t)) ctxDir = path.dirname(abs);
      out.push({ path: abs, cited: t, line: l.no });
    }
  }
  if (!out.length) throw new ShapeError(file, section.title, 'names no capture manifest or routes.json under .awards/captures/');
  return out;
}

function parseReport(file) {
  const rel = projRel(file);
  const text = fs.readFileSync(file, 'utf8');
  const sections = sectionsOf(text);
  const title = content(sections[0]).find((l) => /^# /.test(l.text))?.text.replace(/^# /, '') ?? null;
  const head = headOf(sections, rel, 'header');
  if (!head.scoresLine) throw new ShapeError(rel, 'header', 'no scores line under the disposition line (`Design x.x · Usability x.x · Creativity x.x · Content x.x — weighted w.ww`)');
  const scores = parseScoresLine(head.scoresLine);
  return { rel, file, text, sections, title, ...head, scores };
}

function cellOf(row, name) {
  const key = Object.keys(row.byHeader).find((h) => h.toLowerCase() === name.toLowerCase());
  return key === undefined ? undefined : row.byHeader[key];
}

const strip = (s) => String(s ?? '').replace(/\*\*/g, '').trim();

// Everything chapter 3 and the marks need from one page-round report.
function extract(report, frames) {
  const { rel, sections } = report;
  const measured = report.scores.kind === 'site' && report.scores.design !== 'unmeasured';
  const marks = [];
  const undrawn = [];
  const count = { ring: 0, cross: 0 };
  const add = (type, list, base) => {
    for (const f of list) marks.push({ id: `${type}-${++count[type]}`, type, frame: f.id, ...base, report: rel, date: report.date });
  };

  // Scores: the axis and developer tables, verbatim, and they must agree with the scores line.
  const scoresSection = requireSection(sections, 'Scores', rel);
  const tables = tablesOf(scoresSection);
  const axisTable = tables.find((t) => /axis/i.test(t.header[0] ?? ''));
  const devTable = tables.find((t) => /developer/i.test(t.header[0] ?? ''));
  const rowsOf = (t) => t?.rows.map((r) => ({ name: strip(r.cells[0]), score: strip(r.cells[1]), reason: r.cells[2] ?? '' })) ?? null;
  const axes = rowsOf(axisTable);
  if (measured) {
    if (!axes) throw new ShapeError(rel, 'Scores', 'no axis table (`| Axis (weight) | Score /10 | One-line reason |`)');
    for (const [key, label] of [['design', 'Design'], ['usability', 'Usability'], ['creativity', 'Creativity'], ['content', 'Content'], ['weighted', 'Weighted']]) {
      const row = axes.find((r) => r.name.toLowerCase().startsWith(label.toLowerCase()));
      if (!row) throw new ShapeError(rel, 'Scores', `the axis table has no ${label} row`);
      if (row.score !== report.scores[key]) throw new ShapeError(rel, 'Scores', `${label} is ${row.score} in the table and ${report.scores[key]} on the scores line`);
    }
  }
  const lineStarting = (s, prefix) => content(s).find((l) => l.text.trim().startsWith(prefix))?.raw.trim() ?? null;

  // Memory test: the quoted sentence; its source frame takes a ring.
  const memorySection = requireSection(sections, 'Memory test', rel);
  const memLines = content(memorySection);
  let memory = null;
  if (!memLines.length) throw new ShapeError(rel, 'Memory test', 'empty');
  if (!(memLines.length === 1 && /^unmeasured\b/i.test(memLines[0].text.trim()))) {
    const quoted = memLines.find((l) => /"[^"]+"|“[^”]+”/.test(l.text));
    if (!quoted) throw new ShapeError(rel, 'Memory test', 'no quoted memory sentence');
    const q = /"([^"]+)"|“([^”]+)”/.exec(quoted.text);
    const source = framesOf(memLines.map((l) => l.text).join('\n'), frames, rel, 'Memory test', 'the memory test');
    memory = { sentence: q[1] ?? q[2], line: quoted.raw.trim(), lineNo: quoted.no, frames: source.map((f) => f.id) };
    add('ring', source, { section: 'Memory test', source: 'memory', line: quoted.raw.trim(), lineNo: quoted.no, sentence: memory.sentence });
    if (!source.length) undrawn.push({ section: 'Memory test', line: quoted.raw.trim() });
  } else if (measured) throw new ShapeError(rel, 'Memory test', '`unmeasured` in a measured report');

  // Keep: frames it cites take a ring.
  const keepSection = requireSection(sections, 'Keep', rel);
  const keepLines = content(keepSection);
  if (!keepLines.length) throw new ShapeError(rel, 'Keep', 'empty');
  const keep = keepLines.map((l) => l.raw.trim()).join('\n');
  keepLines.forEach((l, i) => {
    const list = framesOf(l.text, frames, rel, 'Keep', 'the Keep line');
    add('ring', list, { section: 'Keep', source: `keep-${i + 1}`, line: l.raw.trim(), lineNo: l.no });
    if (!list.length) undrawn.push({ section: 'Keep', line: l.raw.trim() });
  });

  // Material fixes: each row's Before evidence takes a cross.
  const fixesSection = requireSection(sections, 'Material fixes', rel);
  const fixTables = tablesOf(fixesSection);
  if (!fixTables.length) throw new ShapeError(rel, 'Material fixes', 'no fix table');
  const fixRows = [];
  for (const t of fixTables) {
    const sub = t.sub ? t.sub.replace(/\s*\(.*$/, '') : null;
    const label = sub ? `Material fixes · ${sub}` : 'Material fixes';
    if (!t.header.some((h) => /^before evidence$/i.test(h))) throw new ShapeError(rel, label, 'table has no "Before evidence" column');
    if (!t.header.some((h) => /^location$/i.test(h))) throw new ShapeError(rel, label, 'table has no "Location" column');
    t.rows.forEach((row, i) => {
      if (!strip(cellOf(row, 'Location')) && !strip(cellOf(row, 'Change'))) return; // the template's blank row
      const list = framesOf(cellOf(row, 'Before evidence'), frames, rel, label, `row ${i + 1}'s Before evidence`);
      const source = `${(sub ?? 'fixes').toLowerCase()}-${i + 1}`;
      const ids = marks.length;
      add('cross', list, { section: label, source, line: row.raw.trim(), lineNo: row.no, cells: row.byHeader });
      fixRows.push({ source, section: label, location: strip(cellOf(row, 'Location')), change: strip(cellOf(row, 'Change')), marks: marks.slice(ids) });
      if (!list.length) undrawn.push({ section: label, line: row.raw.trim() });
    });
  }

  // Usability walk: every `walk n — fail — …` line, wherever the report keeps it (its own section, the Usability
  // reason or the fix list), takes a cross on the frames it cites.
  const walkRe = new RegExp(`\\bwalk (\\d+) ${DASH} (pass|fail) ${DASH} `);
  const walks = [];
  for (const s of sections) {
    for (const l of s.lines) {
      const m = walkRe.exec(l.text);
      if (!m) {
        if (/^\s*-\s*walk\s+\d/.test(l.text)) throw new ShapeError(rel, s.title, `line ${l.no} starts like a walk line but is not \`walk n — pass | fail — note\``);
        continue;
      }
      let body = l.text.slice(m.index);
      if (l.text.trim().startsWith('|')) body = splitRow('|' + body)[0];
      walks.push({ step: Number(m[1]), result: m[2], section: s.title, text: body, line: l.raw.trim(), lineNo: l.no });
    }
  }
  if (measured && !walks.length) throw new ShapeError(rel, 'Usability walk', 'no `walk n — pass | fail — note` lines');
  for (const w of walks.filter((x) => x.result === 'fail')) {
    const list = framesOf(w.text, frames, rel, w.section, `walk ${w.step}`);
    add('cross', list, { section: w.section, source: `walk-${w.step}`, line: w.line, lineNo: w.lineNo, step: w.step });
    if (!list.length) undrawn.push({ section: w.section, line: w.line });
  }

  // Slop scan: each family line (`<family> — <evidence>`) takes a cross; their count must match the header.
  const slopSection = requireSection(sections, 'Slop scan', rel);
  const slopLines = content(slopSection);
  const presentLine = slopLines.find((l) => /^families present:\s*\d+/.test(l.text.trim()));
  if (!presentLine) throw new ShapeError(rel, 'Slop scan', 'no `families present: n` line');
  const present = Number(/^families present:\s*(\d+)/.exec(presentLine.text.trim())[1]);
  const nameable = slopLines.find((l) => /^generator nameable:/.test(l.text.trim()));
  if (!nameable) throw new ShapeError(rel, 'Slop scan', 'no `generator nameable: yes | no` line');
  const familyLines = slopLines.filter((l) => l !== presentLine && l !== nameable && new RegExp(` ${DASH} `).test(l.text));
  if (familyLines.length !== present) throw new ShapeError(rel, 'Slop scan', `\`families present: ${present}\` but ${familyLines.length} family line(s) of the form \`<family> — <evidence>\``);
  familyLines.forEach((l, i) => {
    const list = framesOf(l.text, frames, rel, 'Slop scan', `family line ${i + 1}`, { scope: slopScope(l.text, frames) });
    add('cross', list, { section: 'Slop scan', source: `slop-${i + 1}`, line: l.raw.trim(), lineNo: l.no, family: l.text.replace(/^\s*-\s*/, '').split(new RegExp(` ${DASH} `))[0] });
    if (!list.length) undrawn.push({ section: 'Slop scan', line: l.raw.trim() });
  });

  return {
    marks,
    undrawn,
    fixRows,
    summary: {
      axes,
      developer: rowsOf(devTable),
      caps: lineStarting(scoresSection, 'Caps applied'),
      target: lineStarting(scoresSection, 'Target line'),
      memory,
      keep,
      slop: { present, nameable: nameable.raw.trim() },
      walks: walks.map(({ step, result, section, line }) => ({ step, result, section, line })),
      ceiling: (() => { const s = sections.find((x) => x.title === 'Ceiling'); return s ? content(s).map((l) => l.raw.trim()).join('\n') : null; })(),
    },
  };
}

// A verdict on the report: arrows on the crosses of every row it marks resolved or partial.
function extractVerdict(verdict, fixRows, crossMarks) {
  const { rel, sections } = verdict;
  const section = requireSection(sections, 'Verdict', rel);
  const tables = tablesOf(section);
  if (!tables.length) throw new ShapeError(rel, 'Verdict', 'no table');
  const arrows = [];
  const rows = [];
  let n = 0;
  for (const t of tables) {
    if (!t.header.some((h) => /^status$/i.test(h)) || !t.header.some((h) => /^location$/i.test(h))) throw new ShapeError(rel, 'Verdict', 'table needs "Location" and "Status" columns');
    t.rows.forEach((row, i) => {
      const location = strip(cellOf(row, 'Location'));
      const change = strip(cellOf(row, 'Change'));
      if (!location && !change) return;
      const status = /^(resolved|partial|unresolved)\b/i.exec(strip(cellOf(row, 'Status')))?.[1]?.toLowerCase();
      if (!status) throw new ShapeError(rel, 'Verdict', `row ${i + 1}: Status is "${strip(cellOf(row, 'Status'))}", not resolved, partial or unresolved`);
      let match = fixRows.filter((r) => r.location === location && r.change === change);
      if (!match.length) match = fixRows.filter((r) => r.location === location);
      if (match.length !== 1) throw new ShapeError(rel, 'Verdict', `row ${i + 1} (\`${location}\`) matches ${match.length} rows of the report's Material fixes, not one`);
      rows.push({ status, location, line: row.raw.trim(), lineNo: row.no, fix: match[0].source });
      if (status === 'unresolved') return;
      for (const cross of match[0].marks.filter((m) => crossMarks.has(m.id))) {
        arrows.push({
          id: `arrow-${++n}`, type: 'arrow', frame: cross.frame, from: cross.id, status,
          label: status === 'resolved' ? `resolved, verdict ${verdict.date}` : 'partial',
          section: 'Verdict', source: match[0].source, line: row.raw.trim(), lineNo: row.no, report: rel, date: verdict.date,
        });
      }
    });
  }
  const remaining = sections.find((s) => s.title === 'Remaining');
  return { arrows, rows, remaining: remaining ? content(remaining).map((l) => l.raw.trim()).join('\n') : null };
}

// ---------------------------------------------------------------------------------------------------------------
// Which report, which captures

const PAGE_ROUND = /^(\d{4}-\d{2}-\d{2})(?:-(\d+))?\.md$/;
const VERDICT = /^(\d{4}-\d{2}-\d{2})-verdict(?:-(\d+))?\.md$/;

// Report files AWARDS.md's Jury log marks as component passes (never a page round).
function componentFiles() {
  const awards = path.join(project, 'AWARDS.md');
  if (!fs.existsSync(awards)) return new Set();
  const out = new Set();
  for (const line of fs.readFileSync(awards, 'utf8').split(/\r?\n/)) {
    if (/^- \d{4}-\d{2}-\d{2} · component\b/.test(line)) for (const m of line.matchAll(/\.awards\/jury\/([^\s·`]+\.md)/g)) out.add(m[1]);
  }
  return out;
}

function pickReport() {
  const skipped = [];
  if (!fs.existsSync(juryDir)) return { report: null, verdict: null, skipped };
  const files = fs.readdirSync(juryDir);
  const components = componentFiles();
  const rounds = files.map((f) => ({ f, m: PAGE_ROUND.exec(f) })).filter((x) => x.m)
    .map(({ f, m }) => ({ f, date: m[1], round: Number(m[2] ?? 1) }))
    .sort((a, b) => b.date.localeCompare(a.date) || b.round - a.round);
  for (const r of rounds) {
    const parsed = parseReport(path.join(juryDir, r.f));
    if (components.has(r.f) || parsed.scores?.kind === 'component') { skipped.push({ file: parsed.rel, reason: 'component pass' }); continue; }
    if (!parsed.scores) throw new ShapeError(parsed.rel, 'header', `the scores line is not in the site form: ${parsed.scoresLine}`);
    Object.assign(parsed, { date: r.date, round: r.round });
    // A verdict dated after the report applies; one dated the same day applies when it names the report, or when
    // the report is that day's only round. Anything else is ambiguous and stops the run.
    const sameDay = rounds.filter((x) => x.date === r.date).length;
    const verdicts = files.map((f) => ({ f, m: VERDICT.exec(f) })).filter((x) => x.m && x.m[1] >= r.date)
      .map(({ f, m }) => ({ f, date: m[1], n: Number(m[2] ?? 1) }))
      .sort((a, b) => b.date.localeCompare(a.date) || b.n - a.n);
    let verdict = null;
    for (const v of verdicts) {
      const text = fs.readFileSync(path.join(juryDir, v.f), 'utf8');
      if (v.date > r.date || text.includes(r.f) || sameDay === 1) { verdict = v; break; }
      throw new ShapeError(projRel(path.join(juryDir, v.f)), 'header', `dated the same day as ${sameDay} page rounds and names none of them`);
    }
    if (verdict) {
      const vfile = path.join(juryDir, verdict.f);
      const sections = sectionsOf(fs.readFileSync(vfile, 'utf8'));
      const head = headOf(sections, projRel(vfile), 'whole file');
      verdict = { rel: projRel(vfile), file: vfile, date: verdict.date, sections, ...head, scores: head.scoresLine ? parseScoresLine(head.scoresLine) : null };
    }
    for (const f of files.filter((x) => /-baseline\.md$/.test(x))) skipped.push({ file: projRel(path.join(juryDir, f)), reason: 'baseline (never a page round)' });
    return { report: parsed, verdict, skipped };
  }
  for (const f of files.filter((x) => /-baseline\.md$/.test(x))) skipped.push({ file: projRel(path.join(juryDir, f)), reason: 'baseline (never a page round)' });
  return { report: null, verdict: null, skipped };
}

// Routes the Page map names (Home plus every /route), when AWARDS.md has one.
function expectedRoutes() {
  const awards = path.join(project, 'AWARDS.md');
  if (!fs.existsSync(awards)) return null;
  const text = fs.readFileSync(awards, 'utf8');
  const map = sectionsOf(text).find((s) => s.title === 'Page map');
  if (!map) return null;
  const names = new Set();
  for (const t of tablesOf(map)) {
    for (const row of t.rows) {
      const cell = strip(row.cells[1]);
      if (/^home\b/i.test(cell)) names.add('home');
      const r = /^\/([^\s·]*)/.exec(cell);
      if (r) names.add(routeName(slugOf(r[1])));
    }
  }
  return names.size ? names : null;
}

// The newest routes.json run with every route present and no page errors.
function pickCaptureRun() {
  const skipped = [];
  if (!fs.existsSync(capturesDir)) return { run: null, skipped };
  const expected = expectedRoutes();
  const runs = fs.readdirSync(capturesDir, { withFileTypes: true }).filter((d) => d.isDirectory() && fs.existsSync(path.join(capturesDir, d.name, 'routes.json')))
    .map((d) => { const file = path.join(capturesDir, d.name, 'routes.json'); return { dir: d.name, file, at: readJson(file).at ?? '' }; })
    .sort((a, b) => String(b.at).localeCompare(String(a.at)) || b.dir.localeCompare(a.dir));
  for (const r of runs) {
    const run = loadRoutesRun(r.file);
    const problems = [];
    const manifests = [];
    for (const m of run.manifests) {
      if (!m.exists) { problems.push(`${m.entry.route}: no manifest on disk`); continue; }
      if (m.entry.exit !== 0) problems.push(`${m.entry.route}: capture exit ${m.entry.exit}`);
      const loaded = loadManifest(m.file, { route: m.entry.route, slug: m.entry.slug });
      if (loaded.pageErrors) problems.push(`${m.entry.route}: ${loaded.pageErrors} page error(s)`);
      manifests.push(loaded);
    }
    const have = new Set(run.manifests.map((m) => routeName(m.entry.slug)));
    if (expected) for (const e of expected) if (!have.has(e)) problems.push(`route ${e} (Page map) not captured`);
    if (!run.manifests.length) problems.push('lists no routes');
    if (problems.length) { skipped.push({ file: projRel(r.file), reason: problems.join('; ') }); continue; }
    return { run: { ...run, rel: projRel(r.file), dir: r.dir, manifests }, skipped, expected };
  }
  return { run: null, skipped, expected };
}

// ---------------------------------------------------------------------------------------------------------------
// Selection: per route and width class, the five scroll stops of the route's primary capture, plus every frame
// that carries a mark (an extra stop joins at its own depth; a state, hover or focus frame sits beside its stop).

function primaryOf(manifests) {
  const score = (m) => m.frames.filter((f) => f.kind === 'scroll' && !f.variants.length && STOPS.includes(f.stop)).length;
  return [...manifests].sort((a, b) => score(b) - score(a) || Number(b.inRoutes) - Number(a.inRoutes) || String(b.createdAt).localeCompare(String(a.createdAt)))[0];
}

function select(manifests, marks) {
  const byRoute = new Map();
  for (const m of manifests) {
    if (!byRoute.has(m.route)) byRoute.set(m.route, []);
    byRoute.get(m.route).push(m);
  }
  const marked = new Map();
  for (const mk of marks) {
    if (!marked.has(mk.frame)) marked.set(mk.frame, []);
    marked.get(mk.frame).push(mk);
  }
  const all = new Map(manifests.flatMap((m) => m.frames).map((f) => [f.id, f]));
  const chosen = new Map();
  const primary = new Map();
  for (const [, list] of byRoute) {
    for (const f of primaryOf(list).frames) {
      if (f.kind === 'scroll' && !f.variants.length && STOPS.includes(f.stop)) {
        chosen.set(f.id, f);
        primary.set(`${f.route}|${f.class}|${f.stop}`, f.id);
      }
    }
  }
  for (const id of marked.keys()) chosen.set(id, all.get(id));
  for (const f of chosen.values()) {
    // Drawn in this order on one frame (120 ms apart): rings, then crosses, then arrows, each in report order.
    const rank = { ring: 0, cross: 1, arrow: 2 };
    f.marks = (marked.get(f.id) ?? []).map(({ frame, ...rest }) => rest)
      .sort((a, b) => rank[a.type] - rank[b.type] || (a.type === 'arrow' ? 0 : a.lineNo - b.lineNo));
    // A marked stop from another run than the route's primary capture, at a depth the primary also shot.
    const twin = f.kind === 'scroll' && !f.variants.length ? primary.get(`${f.route}|${f.class}|${f.stop}`) : null;
    if (twin && twin !== f.id) f.duplicateOf = twin;
  }
  // Placement: a frame that is not a plain scroll stop sits beside the nearest stop of its strip.
  for (const f of chosen.values()) {
    const stops = [...chosen.values()].filter((g) => g.route === f.route && g.class === f.class && g.kind === 'scroll' && !g.variants.length).map((g) => g.stop);
    if (f.kind === 'scroll' && !f.variants.length) f.near = null;
    else if (f.at === null || !stops.length) f.near = null;
    else f.near = stops.reduce((best, s) => (Math.abs(s - f.at * 100) < Math.abs(best - f.at * 100) ? s : best), stops[0]);
  }
  return [...chosen.values()];
}

// ---------------------------------------------------------------------------------------------------------------
// Output

const CLASS_LABEL = { desktop: 'desktop', tablet: 'tablet', mobile: 'phone' };
const VARIANT_LABEL = { 'reduced-motion': 'reduced motion', 'no-webgl': 'WebGL off' };

function labelOf(f) {
  const what = f.kind === 'scroll' ? stopLabel(f.stop)
    : f.kind === 'state' ? f.state
      : `${f.kind} ${f.state.split('-').pop()}`;
  return [what, ...f.variants.map((v) => VARIANT_LABEL[v] ?? v)].join(' · ');
}

function altOf(f) {
  const page = f.route === 'home' ? 'the home page' : `the ${f.routePath} page`;
  const size = f.viewport ? ` (${f.viewport.width} × ${f.viewport.height})` : '';
  const what = f.kind === 'scroll' ? `at scroll stop ${stopLabel(f.stop)}, ${f.stop} % down`
    : f.kind === 'state' ? `in the state "${f.state}"${f.at !== null ? `, ${Math.round(f.at * 100)} % down` : ''}`
      : `cropped around ${f.kind === 'hover' ? 'the hovered' : 'the keyboard-focused'} ${f.element?.tag === 'button' ? 'button' : 'link'}${f.element?.text ? ` "${f.element.text}"` : ''}`;
  const variants = f.variants.length ? `, ${f.variants.map((v) => VARIANT_LABEL[v] ?? v).join(', ')}` : '';
  return `Screenshot of ${page} at ${CLASS_LABEL[f.class]} width${size}, ${what}${variants}; capture ${f.run}.`;
}

function routeOrder(manifests) {
  const order = [];
  for (const m of [...manifests].sort((a, b) => Number(b.inRoutes) - Number(a.inRoutes))) if (!order.includes(m.route)) order.push(m.route);
  return order;
}

// Full-size files only where the page draws a frame large: chapter 3's loupe and its 1:1 viewer, which show home
// at the memory sentence's source frame (state a) or s00 (state b), at every width class. Everywhere else a frame is
// drawn at strip size or smaller, so its full-size file would ship and never be fetched.
function loupeIds(frames, memoryIds = []) {
  const source = frames.find((f) => memoryIds.includes(f.id));
  const stop = source?.kind === 'scroll' ? source.stop : 0;
  return new Set(frames.filter((f) => f.id === source?.id || (f.route === 'home' && f.kind === 'scroll' && !f.variants.length && !f.duplicateOf && f.stop === stop)).map((f) => f.id));
}

async function encodeAll(frames, full = new Set()) {
  const written = new Set();
  if (!frames.length) return written;
  if (args.check) {
    for (const f of frames) {
      const { width, height } = fs.existsSync(f.png) ? pngSize(f.png) : { width: null, height: null };
      f.native = { width, height };
      f.strip = f.full = { src: null, width, height, bytes: 0 };
    }
    return written;
  }
  const browser = await openBrowser({ webgl: false });
  try {
    const page = await browser.newPage();
    for (const f of frames) {
      if (!fs.existsSync(f.png)) throw new Error(`frame missing on disk: ${projRel(f.png)} (listed in ${f.manifest})`);
      const { width: W, height: H } = pngSize(f.png);
      const size = (w) => ({ width: w, height: Math.round((H * w) / W) });
      const stripSize = size(Math.min(STRIP_WIDTH[f.class], W));
      const fullSize = size(Math.min(FULL_MAX, W));
      const routeDir = path.join(proofDir, f.run, f.route);
      const stem = (f.capDir && f.capDir !== f.route ? `${f.capDir.replace(/\//g, '-')}-` : '') + f.base;
      const outputs = [{ ...stripSize, quality: QUALITY.strip, file: path.join(routeDir, `${stem}-${stripSize.width}.webp`) }];
      if (fullSize.width !== stripSize.width && full.has(f.id)) outputs.push({ ...fullSize, quality: QUALITY.full, file: path.join(routeDir, `${stem}-${fullSize.width}.webp`) });
      const bufs = await encodeWebp(page, fs.readFileSync(f.png), outputs);
      fs.mkdirSync(routeDir, { recursive: true });
      const files = outputs.map((o, i) => {
        fs.writeFileSync(o.file, bufs[i]);
        written.add(o.file);
        return { src: posix(path.relative(publicDir, o.file)), width: o.width, height: o.height, bytes: bufs[i].length };
      });
      f.native = { width: W, height: H };
      f.strip = files[0];
      f.full = files[1] ?? files[0];
    }
  } finally {
    await browser.close();
  }
  return written;
}

function frameRecord(f) {
  return {
    id: f.id,
    kind: f.kind,
    stop: f.stop,
    state: f.state,
    variants: f.variants,
    near: f.near,
    at: f.at,
    label: labelOf(f),
    ...(f.element ? { element: f.element } : {}),
    ...(f.duplicateOf ? { duplicateOf: f.duplicateOf } : {}),
    capture: f.run,
    capturedAt: f.capturedAt,
    build: f.build,
    source: projRel(f.png),
    manifest: f.manifest,
    viewport: f.viewport,
    eager: f.kind === 'scroll' && !f.variants.length && (f.stop === 0 || f.stop === 25),
    strip: f.strip,
    full: f.full,
    alt: altOf(f),
    marks: f.marks,
  };
}

function sortKey(f) {
  if (f.kind === 'scroll' && !f.variants.length) return [f.stop, 0, ''];
  return [f.near ?? (f.kind === 'scroll' ? f.stop : 1000), 1, `${f.kind}:${f.state ?? ''}:${f.variants.join()}`];
}

function routesOut(frames, manifests, report) {
  return routeOrder(manifests).map((slug) => {
    const list = frames.filter((f) => f.route === slug);
    const stamps = [...new Set(list.map((f) => f.run))];
    const builds = [...new Set(list.map((f) => f.build).filter(Boolean))];
    const byClass = {};
    for (const cls of CLASSES) {
      byClass[cls] = list.filter((f) => f.class === cls).sort((a, b) => {
        const [x1, x2, x3] = sortKey(a), [y1, y2, y3] = sortKey(b);
        return x1 - y1 || x2 - y2 || x3.localeCompare(y3);
      }).map(frameRecord);
    }
    const routePath = manifests.find((m) => m.route === slug && m.inRoutes)?.routePath ?? manifests.find((m) => m.route === slug).routePath;
    return {
      slug,
      name: routeName(slug),
      path: routePath,
      captures: stamps,
      builds,
      caption: `Frames: capture${stamps.length > 1 ? 's' : ''} ${stamps.join(', ')}${builds.length ? `, build ${builds.join(', ')}` : ''}${report ? ` · Marks: report ${report.date}` : ''}`,
      frames: byClass,
    };
  }).filter((r) => CLASSES.some((c) => r.frames[c].length));
}

function metricsOut(manifests) {
  const routes = manifests.filter((m) => m.inRoutes || manifests.filter((x) => x.route === m.route).length === 1).map((m) => ({
    route: m.route,
    path: m.routePath,
    manifest: m.rel,
    capturedAt: m.createdAt,
    pageErrors: m.pageErrors,
    consoleErrors: m.consoleErrors,
    failedRequests: m.failedRequests,
    viewports: Object.fromEntries(Object.entries(m.metrics).map(([label, x]) => [label, { cls: x.cls ?? null, blockingMs: x.blockingMs ?? null, longTasks: x.longTasks ?? null }])),
  }));
  const values = (k) => routes.flatMap((r) => Object.values(r.viewports).map((v) => v[k])).filter((v) => typeof v === 'number');
  return {
    note: 'lab figures from headless Chromium (capture.mjs); never field Core Web Vitals',
    routes,
    max: { cls: values('cls').length ? Math.max(...values('cls')) : null, blockingMs: values('blockingMs').length ? Math.max(...values('blockingMs')) : null },
    pageErrors: routes.reduce((n, r) => n + r.pageErrors, 0),
  };
}

function auditOut() {
  const file = path.join(project, '.awards', 'audit.json');
  if (!fs.existsSync(file)) return null;
  const a = readJson(file);
  return {
    file: projRel(file),
    date: a.at ?? null,
    target: a.target ?? null,
    scannedFiles: a.scannedFiles ?? null,
    summary: a.summary ?? null,
    exceptions: Array.isArray(a.exceptions) ? a.exceptions.length : 0,
    rendered: a.rendered ? { axe: a.axe ?? null, viewports: a.rendered } : null,
    ...(a.renderedFrom?.warning ? { renderedWarning: a.renderedFrom.warning } : {}),
  };
}

function captureSources(manifests) {
  return manifests.map((m) => ({
    capture: m.run,
    stage: stageOf(m.run),
    route: m.route,
    manifest: m.rel,
    capturedAt: m.createdAt,
    builds: m.builds,
    pageErrors: m.pageErrors,
    consoleErrors: m.consoleErrors,
  }));
}

function writeOut(proof, written) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(proof, null, 2) + '\n');
  const removed = prune(proofDir, written);
  return removed;
}

function summarise(proof, removed) {
  const lines = [`proof: state ${proof.state} — ${proof.why}`];
  if (proof.report) lines.push(`  report ${proof.report.file} (${proof.report.date}) · disposition ${proof.report.disposition} · ${proof.report.scoresLine}`);
  if (proof.verdict) lines.push(`  verdict ${proof.verdict.file} (${proof.verdict.date}) · disposition ${proof.verdict.disposition}`);
  for (const r of proof.routes ?? []) {
    lines.push(`  ${r.slug}: ${CLASSES.map((c) => `${c} ${r.frames[c].length}`).join(' · ')} — ${r.caption}`);
  }
  if (proof.summary) {
    const m = proof.summary.marks;
    lines.push(`  frames ${proof.summary.frames} · files ${proof.summary.files} (${(proof.summary.bytes / 1024).toFixed(0)} KB) · marks: ring ${m.ring} · cross ${m.cross} · arrow ${m.arrow}${proof.report ? ` · rows not drawn ${proof.report.undrawn.length}` : ''}`);
  }
  if (proof.audit) lines.push(`  audit ${proof.audit.file} (${proof.audit.date}) · P0 ${proof.audit.summary?.P0} · P1 ${proof.audit.summary?.P1} · P2 ${proof.audit.summary?.P2} · P3 ${proof.audit.summary?.P3}`);
  for (const s of proof.skipped ?? []) lines.push(`  skipped ${s.file}: ${s.reason}`);
  lines.push(args.check ? '  --check: nothing written' : `  wrote ${posix(path.relative(process.cwd(), dataFile)) || dataFile}${removed ? ` · removed ${removed} stale frame file(s)` : ''}`);
  return lines.join('\n');
}

// ---------------------------------------------------------------------------------------------------------------

async function main() {
  const base = { schema: 1, generator: 'scripts/proof.mjs', project: path.basename(project), publicBase: 'paths are relative to public/' };
  const forced = args.state ? String(args.state) : null;
  const picked = forced ? { report: null, verdict: null, skipped: [{ file: '.awards/jury/', reason: `ignored (--state ${forced})` }] } : pickReport();

  // (a) a page-round report
  if (picked.report) {
    const report = picked.report;
    const evidence = evidenceManifests(requireSection(report.sections, 'Evidence', report.rel), report.rel);
    const manifests = [];
    const seen = new Set();
    for (const e of evidence) {
      if (!fs.existsSync(e.path)) throw new Error(`${report.rel}: Evidence (line ${e.line}) cites \`${e.cited}\`, which is not on disk; .awards/captures/ is gitignored, so restore that capture run before refreshing the proof`);
      if (path.basename(e.path) === 'routes.json') {
        for (const m of loadRoutesRun(e.path).manifests) {
          if (!m.exists) throw new Error(`${projRel(e.path)} lists ${m.entry.manifest}, which is not on disk`);
          if (!seen.has(m.file)) { seen.add(m.file); manifests.push(loadManifest(m.file, { route: m.entry.route, slug: m.entry.slug })); }
        }
      } else if (!seen.has(e.path)) {
        seen.add(e.path);
        // A manifest inside a routes.json run keeps that run's route name.
        const routesFile = path.join(capturesDir, posix(path.relative(capturesDir, e.path)).split('/')[0], 'routes.json');
        const entry = fs.existsSync(routesFile) ? readJson(routesFile).routes?.find((r) => path.resolve(project, r.manifest) === e.path) : null;
        manifests.push(loadManifest(e.path, entry ? { route: entry.route, slug: entry.slug } : {}));
      }
    }
    const allFrames = manifests.flatMap((m) => m.frames);
    const ex = extract(report, allFrames);
    let marks = ex.marks;
    let verdictOut = null;
    if (picked.verdict) {
      const v = extractVerdict(picked.verdict, ex.fixRows, new Set(marks.filter((m) => m.type === 'cross').map((m) => m.id)));
      marks = [...marks, ...v.arrows];
      verdictOut = {
        file: picked.verdict.rel, date: picked.verdict.date, disposition: picked.verdict.disposition, dispositionLine: picked.verdict.dispositionLine,
        scoresLine: picked.verdict.scoresLine, scores: picked.verdict.scores, rows: v.rows, remaining: v.remaining,
      };
    }
    const frames = select(manifests, marks);
    const written = await encodeAll(frames, loupeIds(frames, ex.summary.memory?.frames));
    const routes = routesOut(frames, manifests, report);
    const proof = {
      ...base,
      state: 'a',
      strip: true,
      why: `page-round report ${report.rel}`,
      report: {
        file: report.rel, date: report.date, round: report.round, title: report.title,
        disposition: report.disposition, dispositionLine: report.dispositionLine, scoresLine: report.scoresLine, scores: report.scores,
        ...ex.summary,
        evidence: evidence.map((e) => projRel(e.path)),
        undrawn: ex.undrawn,
      },
      verdict: verdictOut,
      captures: captureSources(manifests),
      routes,
      metrics: metricsOut(manifests.filter((m) => m.inRoutes || !manifests.some((x) => x.inRoutes))),
      audit: auditOut(),
      summary: summaryOf(frames, marks),
      skipped: picked.skipped,
    };
    return { proof, written };
  }

  // (b) the newest valid routes.json capture run
  const cap = forced === 'c' ? { run: null, skipped: [{ file: '.awards/captures/', reason: 'ignored (--state c)' }] } : pickCaptureRun();
  const skipped = [...picked.skipped, ...cap.skipped];
  if (cap.run) {
    const manifests = cap.run.manifests;
    const frames = select(manifests, []);
    const written = await encodeAll(frames, loupeIds(frames));
    const proof = {
      ...base,
      state: 'b',
      strip: true,
      why: `no page-round report; newest valid capture run ${cap.run.rel}`,
      report: null,
      verdict: null,
      captures: captureSources(manifests),
      routes: routesOut(frames, manifests, null),
      metrics: metricsOut(manifests),
      audit: auditOut(),
      summary: summaryOf(frames, []),
      skipped,
    };
    return { proof, written };
  }

  // (c) nothing captured: no strip, and the paper takes the full width
  const proof = {
    ...base,
    state: 'c',
    strip: false,
    why: fs.existsSync(capturesDir) ? 'no page-round report and no valid routes.json capture run' : 'no page-round report and no .awards/captures/',
    report: null,
    verdict: null,
    captures: [],
    routes: [],
    metrics: null,
    audit: auditOut(),
    summary: null,
    skipped,
  };
  return { proof, written: new Set() };
}

function summaryOf(frames, marks) {
  const files = new Set(frames.flatMap((f) => [f.strip.src, f.full.src]).filter(Boolean));
  const bytes = [...new Map(frames.flatMap((f) => [[f.strip.src, f.strip.bytes], [f.full.src, f.full.bytes]])).values()].reduce((a, b) => a + b, 0);
  return {
    frames: frames.length,
    files: files.size,
    bytes,
    marks: { ring: marks.filter((m) => m.type === 'ring').length, cross: marks.filter((m) => m.type === 'cross').length, arrow: marks.filter((m) => m.type === 'arrow').length },
  };
}

try {
  const { proof, written } = await main();
  const removed = args.check ? 0 : writeOut(proof, written);
  console.log(args.json ? JSON.stringify(proof, null, 2) : summarise(proof, removed));
} catch (e) {
  console.error(`proof: ${e.message}`);
  process.exit(e.exitCode ?? 1);
}
