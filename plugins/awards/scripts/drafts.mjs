#!/usr/bin/env node
// Draft recipes in recipes/_drafts/: list them with their review, start a new one, answer a review, promote an
// accepted draft into the catalogue or drop a rejected one. The decisions themselves are made in the explorer's
// Drafts tab (npm run dev in recipes/), which writes each draft's review.json.
//
// Usage:
//   node scripts/drafts.mjs list [--json]                     every draft, its status, the latest notes and problems
//   node scripts/drafts.mjs new <id> [--from <recipe-id>]     a new draft from _drafts/_template (or a copy of a recipe)
//   node scripts/drafts.mjs reply <id> "<what changed>"       after working an `improve`: back to the maintainer as revised
//   node scripts/drafts.mjs promote <id> [--force]            move the draft into recipes/<id>, restate catalogue and counts
//   node scripts/drafts.mjs drop <id>                          delete a draft (git keeps its history)
// Exit: 0 done · 1 usage or a refused step.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, fmtTable } from './lib/report.mjs';
import {
  STATUSES, TEXT_EXT, draftsDir, recipesDir, draftDir, draftIds, isDraftId, readManifest, readReview, writeReply,
  draftProblems, framesData, framesFile, rebase,
} from './lib/drafts.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const plugin = path.resolve(here, '..');
const repo = path.resolve(plugin, '../..');
const args = parseArgs(process.argv.slice(2), { json: 'boolean', force: 'boolean' });
const [command, id, ...rest] = args._;
const today = new Date().toISOString().slice(0, 10);
const fail = (msg) => { console.error(msg); process.exit(1); };

function needDraft(id) {
  if (!isDraftId(id)) fail('give a draft id: lower-case words joined by hyphens');
  if (!fs.existsSync(path.join(draftDir(id), 'recipe.json'))) fail(`no draft ${id} (recipes/_drafts/${id}/recipe.json)`);
}

// Copy a folder's files, rebasing the relative paths of the text files one level out of ('out') or into ('in') _drafts/.
function copyTree(from, to, direction, skip = new Set()) {
  fs.mkdirSync(to, { recursive: true });
  for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
    if (skip.has(ent.name)) continue;
    const a = path.join(from, ent.name);
    const b = path.join(to, ent.name);
    if (ent.isDirectory()) copyTree(a, b, direction);
    else if (direction && TEXT_EXT.has(path.extname(ent.name))) fs.writeFileSync(b, rebase(fs.readFileSync(a, 'utf8'), direction));
    else fs.copyFileSync(a, b);
  }
}

const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const run = (script, ...argv) => spawnSync(process.execPath, [path.join(here, script), ...argv], { encoding: 'utf8' });

// The counts the descriptions quote, restated from the catalogue as it now stands (the phrases check-sync holds).
function restateCounts() {
  const ids = fs.readdirSync(recipesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(recipesDir, d.name, 'recipe.json'))).map((d) => d.name);
  const total = ids.length;
  const compositions = ids.filter((i) => i.startsWith('complete-')).length;
  const focused = total - compositions;
  const word = (n) => (n === 1 ? 'one' : String(n));
  const files = ['CLAUDE.md', 'README.md', 'plugins/awards/README.md', 'plugins/awards/.claude-plugin/plugin.json', 'plugins/awards/.codex-plugin/plugin.json', '.claude-plugin/marketplace.json'];
  const changed = [];
  for (const f of files) {
    const file = path.join(repo, f);
    if (!fs.existsSync(file)) continue;
    const before = fs.readFileSync(file, 'utf8');
    const after = before
      .replace(/\b\d+ focused recipes (plus|and) (?:one|\d+) complete (compositions?)(\W+)\d+ ((?:browser-)?verifiable entries)/gi,
        (m, join, c, sep, tail) => `${focused} focused recipes ${join} ${word(compositions)} complete ${compositions === 1 ? 'composition' : 'compositions'}${sep}${total} ${tail}`)
      .replace(/\b\d+ focused recipes (plus|and) (?:one|\d+) complete compositions?(?!\W+\d+ (?:browser-)?verifiable entries)/gi,
        (m, join) => `${focused} focused recipes ${join} ${word(compositions)} complete ${compositions === 1 ? 'composition' : 'compositions'}`)
      .replace(/\b(all|has) \d+ entries\b/gi, (m, w) => `${w} ${total} entries`);
    if (after !== before) { fs.writeFileSync(file, after); changed.push(f); }
  }
  return { total, changed };
}

if (command === 'list') {
  const rows = draftIds().map((d) => {
    const m = readManifest(d) ?? {};
    const r = readReview(d);
    return { id: d, title: m.title ?? '', tier: m.tier ?? '', group: m.group ?? '', status: r.status, date: r.date, notes: r.notes, reply: r.reply, problems: draftProblems(d, m) };
  });
  if (args.json) { console.log(JSON.stringify({ drafts: rows }, null, 2)); process.exit(0); }
  if (!rows.length) { console.log('no drafts in recipes/_drafts'); process.exit(0); }
  const cut = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
  console.log(fmtTable(rows.map((r) => [r.id, STATUSES[r.status], r.tier, r.date ?? '', r.problems.length || '', cut(r.notes.replace(/\s+/g, ' '), 60)]), ['draft', 'status', 'tier', 'reviewed', 'problems', 'notes']));
  const by = Object.fromEntries(Object.keys(STATUSES).map((s) => [s, rows.filter((r) => r.status === s).length]));
  console.log(`\n${rows.length} draft(s) · ${Object.entries(by).filter(([, n]) => n).map(([s, n]) => `${n} ${STATUSES[s].toLowerCase()}`).join(' · ')}`);
  for (const r of rows.filter((x) => x.problems.length)) console.log(`  ${r.id}: ${r.problems.join('; ')}`);
} else if (command === 'new') {
  if (!isDraftId(id)) fail('usage: drafts.mjs new <id> [--from <recipe-id>]   (id: lower-case words joined by hyphens)');
  if (fs.existsSync(draftDir(id))) fail(`recipes/_drafts/${id} already exists`);
  if (fs.existsSync(path.join(recipesDir, id))) fail(`recipes/${id} is already a recipe: pick another id`);
  if (args.from) {
    const src = path.join(recipesDir, String(args.from));
    if (!fs.existsSync(path.join(src, 'recipe.json'))) fail(`no recipe ${args.from}`);
    copyTree(src, draftDir(id), 'in');
    const m = readManifest(id);
    delete m.verified;
    delete m.added;
    writeJson(path.join(draftDir(id), 'recipe.json'), { ...m, id, title: `${m.title} (draft from ${args.from})`, drafted: today });
  } else {
    copyTree(path.join(draftsDir, '_template'), draftDir(id), null);
    for (const f of fs.readdirSync(draftDir(id))) {
      if (!TEXT_EXT.has(path.extname(f)) && f !== 'recipe.json') continue;
      const p = path.join(draftDir(id), f);
      fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replaceAll('draft-template', id).replaceAll('2026-01-01', today));
    }
  }
  console.log(`recipes/_drafts/${id}/ created. Open the explorer (npm run dev in recipes/), Drafts tab, to see it live.`);
} else if (command === 'reply') {
  needDraft(id);
  const text = rest.join(' ').trim();
  if (!text) fail('usage: drafts.mjs reply <id> "<what changed since the review>"');
  const prev = readReview(id);
  if (prev.status !== 'improve') console.warn(`note: ${id} was ${STATUSES[prev.status].toLowerCase()}, not waiting on changes`);
  writeReply(id, text);
  console.log(`${id}: revised, back to the maintainer for review`);
} else if (command === 'promote') {
  needDraft(id);
  const problems = draftProblems(id);
  if (problems.length && !args.force) fail(`${id} cannot be promoted yet:\n  ${problems.join('\n  ')}\n(--force promotes anyway, except over an existing recipe)`);
  const dest = path.join(recipesDir, id);
  if (fs.existsSync(dest)) fail(`recipes/${id} already exists`);
  const review = readReview(id);
  if (review.status !== 'accept') console.warn(`note: ${id} is ${STATUSES[review.status].toLowerCase()}, not accepted`);
  copyTree(draftDir(id), dest, 'out', new Set(['review.json', 'frame.webp']));
  const m = readManifest(id);
  delete m.drafted;
  delete m.added;
  writeJson(path.join(dest, 'recipe.json'), { ...m, added: today });
  // The draft's frame becomes the catalogue's frame (the contact sheet catches up on the next gallery-frames run).
  const frames = framesData();
  const frame = path.join(draftDir(id), 'frame.webp');
  if (fs.existsSync(frame)) {
    fs.copyFileSync(frame, path.join(recipesDir, '_gallery/frames', `${id}.webp`));
    const entry = frames.drafts?.[id];
    if (entry) frames.frames = Object.fromEntries(Object.entries({ ...frames.frames, [id]: entry }).sort(([a], [b]) => a.localeCompare(b)));
  }
  if (frames.drafts?.[id]) { delete frames.drafts[id]; writeJson(framesFile, frames); }
  else if (fs.existsSync(frame)) writeJson(framesFile, frames);
  fs.rmSync(draftDir(id), { recursive: true, force: true });
  const cat = run('build-catalogue.mjs');
  const gal = run('build-gallery.mjs');
  const { total, changed } = restateCounts();
  console.log(`recipes/${id}/ promoted (added ${today}); catalogue ${cat.status === 0 ? 'rebuilt' : 'has problems'}, explorer ${gal.status === 0 ? 'rebuilt' : 'failed'}; ${total} entries${changed.length ? `, counts restated in ${changed.join(', ')}` : ''}.`);
  if (cat.status !== 0) console.log((cat.stdout + cat.stderr).trim());
  console.log(`Next, from plugins/awards:
  node scripts/verify-recipes.mjs --only ${id} --pseudo
  node scripts/gallery-frames.mjs --only ${id}      # the frame and the contact sheet
  node scripts/check-sync.mjs && node scripts/lint-refs.mjs`);
} else if (command === 'drop') {
  needDraft(id);
  fs.rmSync(draftDir(id), { recursive: true, force: true });
  const frames = framesData();
  if (frames.drafts?.[id]) { delete frames.drafts[id]; writeJson(framesFile, frames); }
  console.log(`recipes/_drafts/${id} deleted`);
} else {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 12).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(command ? 1 : 0);
}
