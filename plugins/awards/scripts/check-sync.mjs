#!/usr/bin/env node
// Catch the drift that CLAUDE.md asks maintainers to prevent by hand: the three manifest versions,
// pinned versions against references/stacks/versions.md, the scaffold's shared modules against
// recipes/_shared, the root and plugin LICENSE/NOTICE copies, and the counts the descriptions quote.
// Also: the Codex manifest declares no hooks, and the recipes README catalogue matches recipe.json.
// Usage: node scripts/check-sync.mjs [--json]   Exit: 0 in sync · 1 drift found.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib/report.mjs';
import { catalogue } from './build-catalogue.mjs';

const plugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(plugin, '..', '..');
const args = parseArgs(process.argv.slice(2), { json: 'boolean' });
const read = (p) => fs.readFileSync(p, 'utf8');
const json = (p) => JSON.parse(read(p));
const rel = (p) => path.relative(repo, p);
const checks = [];
const check = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail: ok ? '' : detail });

// ---------- versions ----------
const manifests = {
  [rel(path.join(plugin, '.claude-plugin/plugin.json'))]: json(path.join(plugin, '.claude-plugin/plugin.json')).version,
  [rel(path.join(plugin, '.codex-plugin/plugin.json'))]: json(path.join(plugin, '.codex-plugin/plugin.json')).version,
  '.claude-plugin/marketplace.json': json(path.join(repo, '.claude-plugin/marketplace.json')).plugins.find((p) => p.name === 'awards')?.version,
};
// The hooks are Claude Code hooks; an empty inline object is what stops Codex discovering hooks/hooks.json
// (an empty array reads as unset there), and plugins with lifecycle hooks miss Codex's public directory.
const codexHooks = json(path.join(plugin, '.codex-plugin/plugin.json')).hooks;
check('Codex manifest ships no hooks', codexHooks && typeof codexHooks === 'object' && !Array.isArray(codexHooks) && !Object.keys(codexHooks).length, `hooks is ${JSON.stringify(codexHooks)}, expected {}`);
check('manifest versions agree', new Set(Object.values(manifests)).size === 1, Object.entries(manifests).map(([f, v]) => `${f} ${v}`).join(', '));
const version = Object.values(manifests)[0];
for (const [file, pattern] of [['README.md', /^Version ([\d.]+)\.$/m], ['plugins/awards/README.md', /^Version \*\*([\d.]+)\*\*/m], ['CHANGELOG.md', /^## ([\d.]+) — /m]]) {
  const quoted = read(path.join(repo, file)).match(pattern)?.[1];
  check(`${file} names version ${version}`, quoted === version, `it says ${quoted ?? 'no version'}`);
}

// ---------- pins ----------
const pins = {};
for (const row of read(path.join(plugin, 'references/stacks/versions.md')).split('\n')) {
  const cells = row.split('|').map((c) => c.trim());
  if (cells.length < 4 || !/^\d/.test(cells[2] ?? '')) continue;
  const names = cells[1].split(' / ');
  const versions = cells[2].split(' / ');
  names.forEach((n, i) => { pins[n] = versions[i] ?? versions[0]; });
}
const pinned = (where, name, version) => check(`${where}: ${name}`, pins[name] === version, `${version}, versions.md says ${pins[name] ?? 'nothing'}`);
for (const pkg of ['recipes/package.json', 'assets/scaffold/vite-vanilla/package.json']) {
  const p = json(path.join(plugin, pkg));
  for (const [name, version] of Object.entries({ ...p.dependencies, ...p.devDependencies })) pinned(pkg, name, version);
}
const recipes = fs.readdirSync(path.join(plugin, 'recipes'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(plugin, 'recipes', d.name, 'recipe.json')))
  .map((d) => d.name);
for (const id of recipes) {
  for (const dep of json(path.join(plugin, 'recipes', id, 'recipe.json')).deps ?? []) {
    const at = dep.lastIndexOf('@');
    if (at > 0) pinned(`recipes/${id}`, dep.slice(0, at), dep.slice(at + 1));
  }
}

// ---------- copies ----------
const lib = path.join(plugin, 'assets/scaffold/vite-vanilla/src/lib');
const shared = path.join(plugin, 'recipes/_shared');
for (const f of fs.readdirSync(lib).filter((f) => fs.existsSync(path.join(shared, f)))) {
  check(`scaffold src/lib/${f} equals recipes/_shared/${f}`, read(path.join(lib, f)) === read(path.join(shared, f)), 'the two copies differ');
}
for (const f of ['LICENSE', 'NOTICE.md']) check(`${f} copies agree`, read(path.join(repo, f)) === read(path.join(plugin, f)), `${f} and plugins/awards/${f} differ`);

// ---------- counts ----------
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const num = (s) => (/^\d+$/.test(s) ? Number(s) : WORDS.indexOf(s.toLowerCase()));
const skills = fs.readdirSync(path.join(plugin, 'skills')).filter((d) => fs.existsSync(path.join(plugin, 'skills', d, 'SKILL.md'))).length;
const compositions = recipes.filter((id) => id.startsWith('complete-')).length;
const rules = Object.keys(json(path.join(plugin, 'scripts/data/rules.json'))).length;
// Release notes are history, so only the current descriptions are held to the file system.
const described = [
  path.join(repo, 'CLAUDE.md'),
  path.join(plugin, 'README.md'),
  path.join(plugin, '.claude-plugin/plugin.json'),
  path.join(plugin, '.codex-plugin/plugin.json'),
  path.join(repo, '.claude-plugin/marketplace.json'),
];
const intro = read(path.join(repo, 'README.md')).split(/^## /m)[0];
for (const [file, text] of [...described.map((f) => [rel(f), read(f)]), ['README.md (intro)', intro]]) {
  for (const m of text.matchAll(/\b(\d+|[a-z]+) skills\b/gi)) {
    if (num(m[1]) >= 0) check(`${file}: "${m[0]}"`, num(m[1]) === skills, `${skills} skills exist`);
  }
  for (const m of text.matchAll(/\b(\d+) focused recipes (?:plus|and) (one|\d+) complete compositions?\W+(\d+) (?:browser-)?verifiable entries/gi)) {
    check(`${file}: "${m[0]}"`, Number(m[1]) === recipes.length - compositions && num(m[2]) === compositions && Number(m[3]) === recipes.length, `${recipes.length - compositions} focused + ${compositions} composition = ${recipes.length} entries`);
  }
  for (const m of text.matchAll(/\ball (\d+) entries\b/gi)) check(`${file}: "${m[0]}"`, Number(m[1]) === recipes.length, `${recipes.length} entries exist`);
  for (const m of text.matchAll(/\b(\d+) rules, prefixes\b/gi)) check(`${file}: "${m[0]}"`, Number(m[1]) === rules, `rules.json has ${rules}`);
}

// ---------- generated catalogue ----------
const built = catalogue();
check('recipes/README.md catalogue matches recipe.json', read(path.join(plugin, 'recipes/README.md')).includes(built.body), 'stale: run node scripts/build-catalogue.mjs');
for (const p of built.problems) check(`recipe vocabulary: ${p}`, false, 'see scripts/data/recipe-tags.json');

const drift = checks.filter((c) => !c.ok);
if (args.json) console.log(JSON.stringify({ checks: checks.length, drift }, null, 2));
else {
  for (const c of drift) console.log(`DRIFT ${c.name} — ${c.detail}`);
  console.log(`${checks.length} sync check(s) · ${drift.length} drift`);
}
process.exit(drift.length ? 1 : 0);
