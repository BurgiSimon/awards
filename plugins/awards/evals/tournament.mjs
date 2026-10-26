#!/usr/bin/env node
// The blind tournament: the same briefs built by different arms (no plugin, awards, another skill), captured the same
// way, judged from frames alone under shuffled letters, and only then revealed. It is the one measure of whether a
// change to the plugin makes better pages, and it also asks the question no single jury can: which builds look made
// by the same tool? Building the arms is the costly part and happens outside this script (evals/visual/tournament.md).
// Usage:
//   node evals/tournament.mjs prepare --out <dir> --arm <brief>/<arm>=<build dir|url> [--arm …] [--seed <key>]
//   node evals/tournament.mjs reveal --out <dir> [--json]
// prepare captures every arm into <out>/.private/<brief>/<arm>/, copies only the frames into <out>/blind/<letter>/
// with the brief's name beside them, and writes <out>/review.md for people. Judges write <out>/judgements/<who>.json.
// Exit: 0 · 1 usage · 2 a capture failed or a judgement is missing its reasons · 3 browser unavailable.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, fmtTable } from '../scripts/lib/report.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const plugin = path.resolve(here, '..');
const argv = process.argv.slice(2);
const command = argv[0];
const args = parseArgs(argv.slice(1), { json: 'boolean' });
const arms = argv.flatMap((a, i) => (a === '--arm' && argv[i + 1] ? [argv[i + 1]] : []));
const fail = (msg, code = 1) => { console.error(msg); process.exit(code); };
if (!args.out || args.out === true) fail('usage: node evals/tournament.mjs prepare|reveal --out <dir> …');
const out = path.resolve(String(args.out));
const WEIGHTS = { design: 0.4, usability: 0.3, creativity: 0.2, content: 0.1 };

function seeded(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

if (command === 'prepare') {
  if (!arms.length) fail('prepare needs at least one --arm <brief>/<arm>=<build dir|url>');
  const entries = arms.map((spec) => {
    const m = spec.match(/^([a-z0-9-]+)\/([a-z0-9-]+)=(.+)$/i);
    if (!m) fail(`--arm ${spec}: expected <brief>/<arm>=<build dir|url>`);
    const target = /^https?:\/\//i.test(m[3]) ? m[3] : path.resolve(m[3]);
    if (!/^https?:\/\//i.test(target) && !fs.existsSync(target)) fail(`--arm ${spec}: ${target} does not exist`);
    return { brief: m[1], arm: m[2], target };
  });
  const seed = args.seed && args.seed !== true ? String(args.seed) : Math.random().toString(36).slice(2, 10);
  const rand = seeded(seed);
  const order = entries.map((e) => ({ e, r: rand() })).sort((a, b) => a.r - b.r).map((x) => x.e);
  const letters = order.map((_, i) => (i < 26 ? String.fromCharCode(65 + i) : `Z${i - 25}`));
  fs.mkdirSync(path.join(out, '.private'), { recursive: true });
  fs.mkdirSync(path.join(out, 'judgements'), { recursive: true });
  const key = { seed, at: new Date().toISOString(), letters: {} };
  let failed = 0;
  for (const [i, e] of order.entries()) {
    const letter = letters[i];
    const priv = path.join(out, '.private', e.brief, e.arm);
    // The same capture for every arm: five scroll stops at three widths, plus reduced motion on desktop.
    const r = spawnSync(process.execPath, [path.join(plugin, 'scripts/capture.mjs'), e.target, '--out', priv, '--scroll', '0,25,50,75,100', '--reduced-motion'], { encoding: 'utf8', timeout: 900000 });
    if (r.status === 3) fail('the captures need Playwright and Chromium (scripts/doctor.mjs)', 3);
    const blind = path.join(out, 'blind', letter);
    fs.mkdirSync(blind, { recursive: true });
    const frames = fs.existsSync(priv) ? fs.readdirSync(priv).filter((f) => /^(desktop|tablet|mobile|desktop-rm)-s\d{2,3}\.png$/.test(f)) : [];
    for (const f of frames) fs.copyFileSync(path.join(priv, f), path.join(blind, f));
    fs.writeFileSync(path.join(blind, 'BRIEF.md'), `# ${letter}\n\nBrief: ${e.brief}\n`);
    if (!frames.length) failed++;
    key.letters[letter] = { brief: e.brief, arm: e.arm, target: e.target, captureExit: r.status, frames: frames.length };
  }
  fs.writeFileSync(path.join(out, '.private', 'key.json'), JSON.stringify(key, null, 2) + '\n');
  const byBrief = {};
  for (const [letter, v] of Object.entries(key.letters)) (byBrief[v.brief] ??= []).push(letter);
  const review = [
    '# Blind review',
    '',
    `Seed ${seed}. Judge from the frames in \`blind/<letter>/\` only: \`desktop-s00\` to \`s100\`, \`tablet-\`, \`mobile-\` and \`desktop-rm-s00\` (reduced motion). Never open \`.private/\` before the reveal.`,
    '',
    'For every letter: Design, Usability, Creativity and Content from 0 to 10 (`references/jury/rubric.md` anchors), and a reason for each choice. A score or a ranking without its reason is not counted.',
    '',
    ...Object.entries(byBrief).flatMap(([brief, ls]) => [`## Brief ${brief}: ${ls.join(', ')}`, '', '| Letter | Design | Usability | Creativity | Content | Reason (required) |', '|---|---|---|---|---|---|', ...ls.map((l) => `| ${l} | | | | | |`), '', `Ranking, best first, with the reason: `, '']),
    '## Same tool',
    '',
    'Across all letters: which look made by the same tool or the same studio? Group them and say what gives it away (a layout, a device, a type habit, a way of using pictures). "None" is an answer.',
    '',
    'Write the judgement as `judgements/<your name>.json`: `{ "judge": "…", "scores": { "A": { "design": 7, "usability": 7, "creativity": 7, "content": 7, "reason": "…" } }, "ranking": { "<brief>": ["B", "A"] }, "rankingReason": { "<brief>": "…" }, "sameTool": [["A", "D"]], "sameToolReason": "…" }`.',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(out, 'review.md'), review);
  console.log(`${order.length} build(s) captured into ${path.relative(process.cwd(), path.join(out, 'blind'))}/ as ${letters.join(', ')}; key in .private/key.json; review sheet in review.md`);
  process.exit(failed ? 2 : 0);
}

if (command === 'reveal') {
  const keyFile = path.join(out, '.private', 'key.json');
  if (!fs.existsSync(keyFile)) fail(`no key at ${keyFile}; run prepare first`);
  const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  const dir = path.join(out, 'judgements');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
  if (!files.length) fail(`no judgements in ${dir}`);
  const problems = [];
  const perArm = {};
  const wins = {};
  const sameTool = { pairs: 0, sameArm: 0, byArm: {} };
  const reasons = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const who = j.judge ?? f.replace(/\.json$/, '');
    for (const [letter, s] of Object.entries(j.scores ?? {})) {
      const k = key.letters[letter];
      if (!k) { problems.push(`${who}: unknown letter ${letter}`); continue; }
      if (!String(s.reason ?? '').trim()) { problems.push(`${who}: ${letter} has no reason, not counted`); continue; }
      const weighted = Object.entries(WEIGHTS).reduce((sum, [axis, w]) => sum + Number(s[axis]) * w, 0);
      if (!Number.isFinite(weighted)) { problems.push(`${who}: ${letter} is missing an axis`); continue; }
      (perArm[k.arm] ??= []).push({ brief: k.brief, weighted, ...s });
      reasons.push({ judge: who, letter, brief: k.brief, arm: k.arm, reason: s.reason });
    }
    for (const [brief, ranking] of Object.entries(j.ranking ?? {})) {
      if (!String(j.rankingReason?.[brief] ?? '').trim()) { problems.push(`${who}: the ranking for ${brief} has no reason, not counted`); continue; }
      const first = key.letters[ranking[0]];
      if (first) wins[first.arm] = (wins[first.arm] ?? 0) + 1;
    }
    for (const group of j.sameTool ?? []) for (let a = 0; a < group.length; a++) for (let b = a + 1; b < group.length; b++) {
      const x = key.letters[group[a]], y = key.letters[group[b]];
      if (!x || !y) continue;
      sameTool.pairs++;
      if (x.arm === y.arm) { sameTool.sameArm++; sameTool.byArm[x.arm] = (sameTool.byArm[x.arm] ?? 0) + 1; }
    }
  }
  const mean = (xs) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100 : null);
  const table = Object.entries(perArm).map(([arm, xs]) => ({ arm, judgements: xs.length, weighted: mean(xs.map((x) => x.weighted)), design: mean(xs.map((x) => Number(x.design))), usability: mean(xs.map((x) => Number(x.usability))), creativity: mean(xs.map((x) => Number(x.creativity))), content: mean(xs.map((x) => Number(x.content))), wins: wins[arm] ?? 0, groupedWithItself: sameTool.byArm[arm] ?? 0 }))
    .sort((a, b) => b.weighted - a.weighted);
  const report = { seed: key.seed, judges: files.length, arms: table, sameTool: { ...sameTool, precision: sameTool.pairs ? Math.round((sameTool.sameArm / sameTool.pairs) * 100) / 100 : null }, problems, reasons };
  fs.writeFileSync(path.join(out, 'reveal.json'), JSON.stringify(report, null, 2) + '\n');
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(fmtTable(table.map((r) => [r.arm, r.weighted, r.design, r.usability, r.creativity, r.content, r.wins, r.groupedWithItself, r.judgements]), ['arm', 'weighted', 'D', 'U', 'C', 'Co', 'wins', 'same-tool pairs', 'n']));
    console.log(`\nsame tool: ${sameTool.pairs} pair(s) grouped, ${sameTool.sameArm} of them one arm's builds${sameTool.pairs ? ` (precision ${report.sameTool.precision})` : ''}. An arm whose builds judges keep grouping has a house style a juror can name.`);
    for (const p of problems) console.log(`  ${p}`);
    console.log(`reasons, verbatim, in ${path.relative(process.cwd(), path.join(out, 'reveal.json'))}: turn every reason that repeats into a rule, a recipe change or a house-tells row`);
  }
  process.exit(problems.some((p) => /no reason/.test(p)) ? 2 : 0);
}

fail('usage: node evals/tournament.mjs prepare|reveal --out <dir> …');
