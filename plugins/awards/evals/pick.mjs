#!/usr/bin/env node
// Which paid eval cases does a change need? Maps the files changed since a base ref to the cases that
// exercise them, so a pull request runs a handful of cases instead of a tier. Free: reads git and the
// case files only, and prints the commands; it never starts a run.
// Usage: node evals/pick.mjs [base-ref=origin/main] [--json]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from '../scripts/lib/report.mjs';

const evalsDir = path.dirname(fileURLToPath(import.meta.url));
const plugin = path.resolve(evalsDir, '..');
const args = parseArgs(process.argv.slice(2), { json: 'boolean' });
const base = args._[0] ?? 'origin/main';
const git = (...a) => execFileSync('git', a, { cwd: plugin, encoding: 'utf8' }).trim();
let changed;
try {
  const root = git('rev-parse', '--show-toplevel');
  const prefix = path.relative(root, plugin).split(path.sep).join('/') + '/';
  changed = [...new Set([...git('diff', '--name-only', `${base}...HEAD`).split('\n'), ...git('diff', '--name-only', 'HEAD').split('\n')])]
    .filter((f) => f.startsWith(prefix)).map((f) => f.slice(prefix.length));
} catch (e) {
  console.error(`git diff against ${base} failed: ${e.message.split('\n')[0]}`);
  process.exit(2);
}

// Every case: its tags, whether it stages a fixture, and which skills its Skill graders accept.
const SKILLS = fs.readdirSync(path.join(plugin, 'skills')).filter((d) => fs.existsSync(path.join(plugin, 'skills', d, 'SKILL.md')));
const cases = fs.readdirSync(evalsDir, { withFileTypes: true }).filter((d) => d.isDirectory() && fs.existsSync(path.join(evalsDir, d.name, 'case.yaml'))).map((d) => {
  const dir = path.join(evalsDir, d.name);
  const yaml = fs.readFileSync(path.join(dir, 'case.yaml'), 'utf8');
  const tags = yaml.match(/^tags:\s*\[([^\]]*)\]/m)?.[1].split(',').map((t) => t.trim()).filter(Boolean) ?? [];
  const graders = fs.existsSync(path.join(dir, 'graders')) ? fs.readdirSync(path.join(dir, 'graders')).map((g) => fs.readFileSync(path.join(dir, 'graders', g), 'utf8')) : [];
  const wants = new Set();
  for (const src of graders) {
    if (/^max: 0$/m.test(src) || /^match: not_contains$/m.test(src)) continue;
    for (const m of src.matchAll(/input_match: '([^']+)'/g)) {
      for (const s of SKILLS) if (new RegExp(m[1]).test(`"skill": "awards:${s}"`)) wants.add(s);
    }
  }
  const fixture = fs.existsSync(path.join(dir, 'fixture.sh')) ? fs.readFileSync(path.join(dir, 'fixture.sh'), 'utf8') : '';
  return { name: d.name, tags, wants, scaffold: /scaffold_script/.test(yaml), browser: /stage-browser/.test(fixture) };
});

const picked = new Map();
const pick = (c, why) => { if (!picked.has(c.name)) picked.set(c.name, { ...c, why: new Set() }); picked.get(c.name).why.add(why); };
for (const f of changed) {
  const skill = f.match(/^skills\/([^/]+)\//)?.[1];
  const evalCase = f.match(/^evals\/([^/]+)\//)?.[1];
  if (evalCase) cases.filter((c) => c.name === evalCase).forEach((c) => pick(c, f));
  if (skill) {
    // A skill's text routes the others too (descriptions compete), so the smoke tier rides along.
    cases.filter((c) => c.wants.has(skill)).forEach((c) => pick(c, f));
    cases.filter((c) => c.tags.includes('smoke')).forEach((c) => pick(c, `${f} (routing)`));
  }
  if (/^(agents\/awards-jury\.md|references\/jury\/)/.test(f)) cases.filter((c) => c.wants.has('jury')).forEach((c) => pick(c, f));
  if (/^(scripts\/route-hint\.mjs|hooks\/)/.test(f)) cases.filter((c) => c.tags.includes('smoke') || c.tags.includes('route')).forEach((c) => pick(c, f));
  if (/^scripts\/(audit|capture|doctor)\.mjs$|^scripts\/lib\//.test(f)) cases.filter((c) => c.browser).forEach((c) => pick(c, f));
  if (/^(references\/(sites|patterns)\/|assets\/templates\/|scripts\/roll\.mjs)/.test(f)) cases.filter((c) => c.tags.includes('contract')).forEach((c) => pick(c, f));
}

const list = [...picked.values()].sort((a, b) => a.name.localeCompare(b.name));
const tools = (c) => (c.tags.some((t) => ['build', 'route', 'contract', 'resume'].includes(t)) ? ' --allow-tools Write Edit WebFetch Bash' : '');
// One command per flag set; routing is sampled, so smoke keeps three runs, the expensive tiers one.
const groups = new Map();
for (const c of list) {
  const runs = c.tags.includes('smoke') || c.tags.includes('coexist') ? 3 : 1;
  const flags = `--runs ${runs} --ablation none${c.scaffold ? ' --scaffold' : ''}${tools(c)}`;
  groups.set(flags, [...(groups.get(flags) ?? []), c.name]);
}
// --case takes one glob, and a repeated --case keeps only the last, so each group is a loop.
const commands = [...groups].map(([flags, names]) => (names.length === 1 ? `claude plugin eval . --case ${names[0]} ${flags}` : `for c in ${names.join(' ')}; do claude plugin eval . --case "$c" ${flags}; done`));

if (args.json) console.log(JSON.stringify({ base, changed, cases: list.map((c) => ({ name: c.name, tags: c.tags, why: [...c.why] })), commands }, null, 2));
else if (!list.length) console.log(`${changed.length} changed file(s) since ${base}; no paid eval case exercises them.`);
else {
  console.log(`${changed.length} changed file(s) since ${base} → ${list.length} case(s):`);
  for (const c of list) console.log(`  ${c.name} [${c.tags.join(', ')}] ← ${[...c.why].slice(0, 3).join(', ')}${c.why.size > 3 ? ` +${c.why.size - 3}` : ''}`);
  console.log('\nFrom plugins/awards (each run is a real model call; add --max-cost-usd to cap it):');
  for (const cmd of commands) console.log(`  ${cmd}`);
}
