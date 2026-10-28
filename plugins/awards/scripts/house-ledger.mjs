#!/usr/bin/env node
// The house ledger: what this plugin's own finished builds have in common. The jury compares a build with its
// three corpus neighbours and never with the plugin's other builds, so a concept shape that repeats from brief
// to brief (the page as an object, a readout in the margin, code-only imagery) is invisible build by build.
// This reads each build's AWARDS.md, tags the features of its contract and counts them across builds; a value
// shared by at least three builds and at least half of them is "spent" (references/patterns/house-tells.md).
// Usage: node scripts/house-ledger.mjs [build dirs…] [--json] [--write <file.md>] [--check-file <file.md>]
//        node scripts/house-ledger.mjs [build dirs…] --against <AWARDS.md|dir>   the spent features one contract shares
//        node scripts/house-ledger.mjs [build dirs…] --fingerprints   first-viewport fingerprints through skeleton.mjs
// Without dirs it reads the repository's showcase/* and site/ when they exist beside the plugin.
// Exit: 0 · 1 usage or a stale --check-file · 2 --against shares two or more spent features · 3 browser unavailable.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, fmtTable } from './lib/report.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..', '..', '..');
const args = parseArgs(process.argv.slice(2), { json: 'boolean', fingerprints: 'boolean' });

const section = (md, name) => md.split(new RegExp(`^## ${name}`, 'm'))[1]?.split(/^## /m)[0] ?? '';
const block = (contract, name) => contract.match(new RegExp(`^- \\*\\*${name}:\\*\\*\\s*([\\s\\S]*?)(?=^- \\*\\*[A-Z][A-Z &]+:\\*\\*|^- \\*\\*Seed|$(?![\\s\\S]))`, 'm'))?.[1]?.trim() ?? '';

// Each tagger reads the contract's own words; when a value is inferred rather than declared it carries a "~".
export function features(md, name) {
  const contract = section(md, 'Direction contract');
  const thesis = block(contract, 'THESIS');
  const world = block(contract, 'WORLD');
  const signature = block(contract, 'SIGNATURE');
  const seedLine = contract.match(/^- \*\*Seed:\*\*\s*(.+)$/m)?.[1] ?? '';
  const first = thesis.split(/(?<=[.:;])\s/)[0].replace(/\*\*/g, '').slice(0, 90);
  const shape = /^(the|this) (page|site) is\b/i.test(thesis) ? 'page-is-object' : /^(the|this) (page|site)\b/i.test(thesis) ? 'page-does' : 'other';
  const selfRef = /\bof itself\b|\bits own (proof|contact|test|capture)|\bthis very page\b|\bthe page'?s own (captures|frames|screenshots)\b/i.test(thesis);
  // `ENGINE <id>` is the locked direction's engine; `ENGINES …` lists all three dealt worlds and says nothing about
  // which one was built, so a Seed line without the locked engine falls back to inference.
  const declared = seedLine.match(/\bENGINE\s+([a-z][a-z-]*)/)?.[1]?.split(/[ ,]+/) ?? null;
  let engines;
  if (declared) engines = declared;
  else {
    const inferred = [];
    if (shape === 'page-is-object') inferred.push('~artefact');
    if (/scroll/i.test(thesis + signature) && /\b(drives?|runs? through|lowers?|descends?|pays? out|pulls? into|moves? the|the visitor'?s scroll is)\b/i.test(thesis + signature)) inferred.push('~process-performed');
    engines = inferred.length ? inferred : ['~untagged'];
  }
  // The strategy WORLD names in its opening words wins; only an unnamed one is read from the rest of the block.
  const strategyOf = (text) => /palette[- ]as[- ]navigation|drenched|palette is the navigation/i.test(text) ? 'palette-as-navigation'
    : /theme[- ](per|by)[- ]|tokens? (re-?pointed|swapped) per (section|route|depth|chapter)/i.test(text) ? 'theme-per-section'
      : /committed accent/i.test(text) ? 'committed-accent'
        : /duotone|achromatic|two tokens|ground and (a |one )?(near-black )?ink/i.test(text) ? 'restrained-duotone' : null;
  const colour = strategyOf(world.slice(0, 120)) ?? (strategyOf(world) ? `~${strategyOf(world)}` : '~unnamed');
  const light = /\blight ground\b|\blight,? because\b|\bground is light\b|\blight at the surface\b|\boff-white\b|\bpaper\b|\bplaster ground\b/i.test(world);
  const dark = /\bdark ground\b|\bnear-black ground\b|\bdark,? because\b|\bblack ground\b/i.test(world) || /\bdark in between\b/i.test(world);
  const ground = light && dark ? 'mixed' : light ? 'light' : dark ? 'dark' : '~unstated';
  // "Imagery strategy: …" inside a paragraph, or an "Imagery, …:" sub-bullet of its own.
  const imageryText = world.match(/imagery[^:\n]{0,60}:\**\s*([^\n]+)/i)?.[1] ?? world;
  const refusesPhotos = /refused:?[^.]*photograph|no photograph|photography refused|without photograph/i.test(imageryText);
  // `Found pictures: off` is the user's switch (craft --no-found-pictures): WORLD may name the collections it skipped.
  const foundOff = /^- Found pictures:\s*off\b/im.test(md);
  const imagery = /open collection|openverse|wikimedia|archive photograph|licensed photograph|public[- ]domain/i.test(imageryText) && !refusesPhotos && !foundOff ? 'found'
    : /owned photograph|the client'?s photograph|commissioned photograph|documentary photograph|\ball owned\b|the work is the imagery/i.test(imageryText) ? 'owned'
      : /generat(ed|ion) (raster|plate|image)|image tool|generation tool/i.test(imageryText) && !refusesPhotos ? 'generated'
        : /procedural|code|drawn|svg|css-built|halftone|line drawing/i.test(imageryText) ? 'code-only'
          : /type (as|only)|type-only|typograph/i.test(imageryText) ? 'type-only' : '~unstated';
  // Readouts the page carries, not ones it refuses: sentences that refuse, replace or remember one do not count.
  const carried = [thesis, block(contract, 'FIRST VIEWPORT'), signature, block(contract, 'STORY')].join(' ')
    .split(/(?<=[.;])\s+/).filter((s) => /\breadouts?\b/i.test(s) && !/refus|\bold readout|instead of|no readout/i.test(s));
  const readout = carried.length >= 2 ? 'margin readout' : carried.length ? 'readout' : 'none';
  const tier = signature.match(/technique tier:?\s*(DOM-only|moments|canvas-first|100 ?% canvas)/i)?.[1]?.replace(/\s+/g, ' ') ?? (/canvas-first/i.test(signature) ? 'canvas-first' : /DOM-only/i.test(signature) ? 'DOM-only' : '~unstated');
  const juryLines = section(md, 'Jury log').split('\n').filter((l) => /^- \d{4}-\d{2}-\d{2}/.test(l) && !/· (component|baseline) /.test(l));
  const score = (l) => l && { disposition: l.match(/· (?:verdict · )?(ship|fix|rebuild|recapture) ·/)?.[1] ?? null, usability: Number(l.match(/U (\d+(?:\.\d+)?)/)?.[1] ?? NaN) || null, weighted: Number(l.match(/→ (\d+(?:\.\d+)?)/)?.[1] ?? NaN) || null, date: l.slice(2, 12) };
  return { build: name, thesis: first, shape, selfReferential: selfRef, engines, colour, ground, imagery, foundPictures: foundOff ? 'off' : 'search', readout, tier, firstJury: score(juryLines[0]), lastJury: score(juryLines.at(-1)) };
}

// The features a reader would name when they say two builds look like the same studio's work.
const KEYS = [
  ['shape', (f) => [f.shape]],
  ['self-referential', (f) => [f.selfReferential ? 'yes' : 'no']],
  ['engine', (f) => f.engines.map((e) => e.replace(/^~/, ''))],
  ['colour strategy', (f) => [f.colour.replace(/^~/, '')]],
  ['ground', (f) => [f.ground.replace(/^~/, '')]],
  ['imagery', (f) => [f.imagery.replace(/^~/, '')]],
  ['readout', (f) => [f.readout === 'none' ? 'none' : 'carried']],
  ['signature tier', (f) => [f.tier.replace(/^~/, '')]],
];
const UNINFORMATIVE = new Set(['no', 'none', 'other', 'unstated', 'unnamed', 'untagged', 'page-does']);
// Counted for the record, never spent: the dosage rung is a budget decision the contract already justifies.
const RECORD_ONLY = new Set(['signature tier']);

export function tally(rows) {
  const out = [];
  for (const [key, values] of KEYS) {
    const counts = new Map();
    for (const r of rows) for (const v of new Set(values(r))) counts.set(v, (counts.get(v) ?? 0) + 1);
    for (const [value, n] of counts) out.push({ feature: key, value, builds: n, of: rows.length, spent: !RECORD_ONLY.has(key) && !UNINFORMATIVE.has(value) && n >= 3 && n >= rows.length / 2 });
  }
  return out.sort((a, b) => b.builds - a.builds || a.feature.localeCompare(b.feature));
}

function defaultDirs() {
  const dirs = [];
  const showcase = path.join(repo, 'showcase');
  if (fs.existsSync(showcase)) for (const d of fs.readdirSync(showcase).sort()) if (fs.existsSync(path.join(showcase, d, 'AWARDS.md'))) dirs.push(path.join(showcase, d));
  if (fs.existsSync(path.join(repo, 'site', 'AWARDS.md'))) dirs.push(path.join(repo, 'site'));
  return dirs;
}

function markdown(rows, tallies) {
  const lines = [
    '# House ledger',
    '',
    '<!-- generated by plugins/awards/scripts/house-ledger.mjs from each build\'s AWARDS.md; do not edit by hand -->',
    '',
    'What the plugin\'s own finished builds share. A value carried by at least three builds and at least half of them is **spent**: concept names it as the plugin rut and avoids it unless the subject earns it (`plugins/awards/references/patterns/house-tells.md`). A `~` marks a value inferred from the contract\'s words rather than declared on its Seed line.',
    '',
    '| Build | THESIS opens | Shape | Engines | Colour | Ground | Imagery | Readout | Tier | First page jury | Last page jury |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
  ];
  const j = (s) => (s ? `${s.disposition ?? '—'} ${s.weighted ?? '—'} (U ${s.usability ?? '—'})` : '—');
  for (const r of rows) lines.push(`| \`${r.build}\` | ${r.thesis.replace(/\|/g, '/')} | ${r.shape}${r.selfReferential ? ', self-referential' : ''} | ${r.engines.join(', ')} | ${r.colour} | ${r.ground} | ${r.imagery} | ${r.readout} | ${r.tier} | ${j(r.firstJury)} | ${j(r.lastJury)} |`);
  lines.push('', '## Spent', '');
  const spent = tallies.filter((t) => t.spent);
  if (spent.length) for (const t of spent) lines.push(`- ${t.feature}: **${t.value}**, ${t.builds} of ${t.of} builds`);
  else lines.push('- nothing yet');
  lines.push('', '## Every value', '', '| Feature | Value | Builds |', '|---|---|---|');
  for (const t of tallies) lines.push(`| ${t.feature} | ${t.value} | ${t.builds} of ${t.of} |`);
  return lines.join('\n') + '\n';
}

// First-viewport fingerprints through skeleton.mjs, for builds with something renderable: a dist/ (or build/,
// out/) with an index.html, or a folder whose index.html needs no bundler. Distance adds the log ratio of the h1
// sizes, the difference in media share, the margin difference over 100 px and the column-edge difference over 5.
function fingerprints(dirs) {
  const out = [];
  for (const dir of dirs) {
    const built = ['dist', 'build', 'out'].map((d) => path.join(dir, d)).find((d) => fs.existsSync(path.join(d, 'index.html')))
      ?? (fs.existsSync(path.join(dir, 'index.html')) && !fs.existsSync(path.join(dir, 'package.json')) ? dir : null);
    if (!built) { out.push({ build: path.basename(dir), unmeasured: 'no build output; run the build first' }); continue; }
    const png = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'awards-ledger-')), 'skeleton.png');
    try {
      const fp = JSON.parse(execFileSync(process.execPath, [path.join(here, 'skeleton.mjs'), built, '--out', png], { encoding: 'utf8', timeout: 180000 }).trim().split('\n').pop());
      out.push({ build: path.basename(dir), desktop: fp.desktop, phone: fp.phone });
    } catch (e) {
      if (e.status === 3) { console.error('fingerprints need Playwright and Chromium'); process.exit(3); }
      out.push({ build: path.basename(dir), unmeasured: String(e.stderr || e.message).split('\n')[0].slice(0, 120) });
    }
  }
  const measured = out.filter((f) => f.desktop);
  const pairs = [];
  const n = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  for (let i = 0; i < measured.length; i++) for (let k = i + 1; k < measured.length; k++) {
    const a = measured[i].desktop, b = measured[k].desktop;
    let d = 0;
    if (n(a.type?.h1) && n(b.type?.h1)) d += Math.abs(Math.log(a.type.h1 / b.type.h1));
    if (n(a.mediaShareFirstViewport) !== null && n(b.mediaShareFirstViewport) !== null) d += Math.abs(a.mediaShareFirstViewport - b.mediaShareFirstViewport);
    if (n(a.margin) !== null && n(b.margin) !== null) d += Math.abs(a.margin - b.margin) / 100;
    if (n(a.columnEdges) !== null && n(b.columnEdges) !== null) d += Math.abs(a.columnEdges - b.columnEdges) / 5;
    pairs.push({ a: measured[i].build, b: measured[k].build, distance: Math.round(d * 100) / 100, close: d < 0.35 });
  }
  return { builds: out, pairs: pairs.sort((x, y) => x.distance - y.distance) };
}

const direct = (() => { try { return fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url); } catch { return false; } })();
if (direct) {
  const dirs = (args._.length ? args._.map((d) => path.resolve(d)) : defaultDirs()).filter((d) => fs.existsSync(path.join(d, 'AWARDS.md')));
  if (!dirs.length) { console.error('no build with an AWARDS.md found; pass build directories'); process.exit(1); }
  // Inside the repository a build is named by its path there; anywhere else by its folder name.
  const nameOf = (d) => { const r = path.relative(repo, d); return !r || r.startsWith('..') || path.isAbsolute(r) ? path.basename(d) : r.split(path.sep).join('/'); };
  const rows = dirs.map((d) => features(fs.readFileSync(path.join(d, 'AWARDS.md'), 'utf8'), nameOf(d)));
  if (args.against) {
    const file = fs.statSync(path.resolve(String(args.against))).isDirectory() ? path.join(path.resolve(String(args.against)), 'AWARDS.md') : path.resolve(String(args.against));
    const mine = features(fs.readFileSync(file, 'utf8'), 'this build');
    const others = rows.filter((r, i) => dirs[i] !== path.dirname(file));
    const spent = tally(others).filter((t) => t.spent);
    const sharing = spent.filter((t) => KEYS.find(([k]) => k === t.feature)[1](mine).includes(t.value));
    // With found pictures off the imagery was the user's call, not the plugin's default: reported, never counted.
    const excused = mine.foundPictures === 'off' ? sharing.filter((t) => t.feature === 'imagery') : [];
    const shared = sharing.filter((t) => !excused.includes(t));
    // Features, not values: an inferred pair of engines is one shared engine, not two.
    const sharedFeatures = new Set(shared.map((t) => t.feature)).size;
    const row = (t) => ({ feature: t.feature, value: t.value, builds: t.builds, of: t.of });
    const report = { build: mine, comparedWith: others.length, features: sharedFeatures, shared: shared.map(row), excused: excused.map(row) };
    if (args.json) console.log(JSON.stringify(report, null, 2));
    else {
      console.log(`against ${others.length} earlier build(s): ${sharedFeatures} spent feature(s) shared`);
      for (const t of report.shared) console.log(`  ${t.feature}: ${t.value} (${t.builds} of ${t.of})`);
      for (const t of report.excused) console.log(`  ${t.feature}: ${t.value} (${t.builds} of ${t.of}) — not counted: found pictures are off for this build`);
      if (sharedFeatures >= 2) console.log('Two or more: the plugin rut. Name each in THESIS with the reason this subject earns it, or change the direction.');
    }
    process.exit(sharedFeatures >= 2 ? 2 : 0);
  }
  const tallies = tally(rows);
  const md = markdown(rows, tallies);
  if (args['check-file']) {
    const file = path.resolve(String(args['check-file']));
    const ok = fs.existsSync(file) && fs.readFileSync(file, 'utf8') === md;
    console.log(ok ? `${path.relative(process.cwd(), file)} is current` : `${path.relative(process.cwd(), file)} is stale: run node scripts/house-ledger.mjs --write ${path.relative(process.cwd(), file)}`);
    process.exit(ok ? 0 : 1);
  }
  if (args.write) {
    fs.writeFileSync(path.resolve(String(args.write)), md);
    console.log(`wrote ${path.relative(process.cwd(), path.resolve(String(args.write)))} (${rows.length} builds, ${tallies.filter((t) => t.spent).length} spent values)`);
  }
  const prints = args.fingerprints ? fingerprints(dirs) : null;
  if (args.json) console.log(JSON.stringify({ builds: rows, tallies, ...(prints ? { fingerprints: prints } : {}) }, null, 2));
  else if (!args.write) {
    console.log(fmtTable(rows.map((r) => [r.build, r.shape + (r.selfReferential ? '+self' : ''), r.engines.join(','), r.colour, r.ground, r.imagery, r.readout, r.tier]), ['build', 'shape', 'engines', 'colour', 'ground', 'imagery', 'readout', 'tier']));
    const spent = tallies.filter((t) => t.spent);
    console.log(`\nspent: ${spent.length ? spent.map((t) => `${t.feature} ${t.value} (${t.builds}/${t.of})`).join(' · ') : 'nothing'}`);
    if (prints) {
      for (const b of prints.builds.filter((x) => x.unmeasured)) console.log(`fingerprint ${b.build}: unmeasured, ${b.unmeasured}`);
      for (const p of prints.pairs) console.log(`fingerprint ${p.a} ~ ${p.b}: ${p.distance}${p.close ? ' — close: the two first viewports are built the same way' : ''}`);
    }
  }
}
