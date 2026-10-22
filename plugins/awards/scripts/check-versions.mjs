#!/usr/bin/env node
// Compare every pin in references/stacks/versions.md with the npm registry's latest release, without
// installing anything: the upkeep step that notices a new major before a generated project does.
// Usage: node scripts/check-versions.mjs [--json] [--only gsap,astro] [--strict]
// Exit: 0 report printed · 1 registry unreachable for every package · 2 with --strict, a major drift found.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, fmtTable, now } from './lib/report.mjs';
import { drift, satisfies } from './lib/semver.mjs';

const plugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = parseArgs(process.argv.slice(2), { json: 'boolean', strict: 'boolean' });
const only = args.only ? new Set(String(args.only).split(',').map((s) => s.trim())) : null;

const pins = [];
for (const row of fs.readFileSync(path.join(plugin, 'references/stacks/versions.md'), 'utf8').split('\n')) {
  const cells = row.split('|').map((c) => c.trim());
  if (cells.length < 4 || !/^\d/.test(cells[2] ?? '')) continue;
  const names = cells[1].split(' / '), versions = cells[2].split(' / ');
  names.forEach((name, i) => { if (!only || only.has(name)) pins.push({ name, pinned: versions[i] ?? versions[0] }); });
}

// The registry's latest manifest is one small document per package. Without global fetch access
// (a proxy Node does not read), npm itself answers, since it honours the user's npm config.
const registry = (process.env.npm_config_registry || 'https://registry.npmjs.org/').replace(/\/?$/, '/');
async function latest(name) {
  try {
    const res = await fetch(`${registry}${name.replace('/', '%2F')}/latest`, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const j = await res.json();
      return { version: j.version, node: j.engines?.node ?? null };
    }
  } catch {}
  return new Promise((resolve) => {
    const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['view', `${name}@latest`, 'version', 'engines', '--json'], { shell: process.platform === 'win32', timeout: 20000 });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.on('error', () => resolve(null));
    child.on('close', () => {
      try {
        const j = JSON.parse(out);
        resolve({ version: j.version, node: j.engines?.node ?? null });
      } catch { resolve(null); }
    });
  });
}

const rows = [];
for (let i = 0; i < pins.length; i += 8) {
  const batch = pins.slice(i, i + 8);
  const found = await Promise.all(batch.map((p) => latest(p.name)));
  batch.forEach((p, j) => {
    const l = found[j];
    rows.push({ ...p, latest: l?.version ?? null, drift: l?.version ? drift(p.pinned, l.version) : 'unreachable', latestNode: l?.node ?? null, nodeOk: l?.node ? satisfies(process.versions.node, l.node) : null });
  });
}

const order = { major: 0, minor: 1, patch: 2, unreachable: 3, ahead: 4, unknown: 5, same: 6 };
rows.sort((a, b) => order[a.drift] - order[b.drift] || a.name.localeCompare(b.name));
const count = (d) => rows.filter((r) => r.drift === d).length;
const summary = { checked: rows.length, major: count('major'), minor: count('minor'), patch: count('patch'), same: count('same'), unreachable: count('unreachable') };

if (args.json) console.log(JSON.stringify({ at: now(), registry, node: process.versions.node, summary, packages: rows }, null, 2));
else {
  const moved = rows.filter((r) => r.drift !== 'same');
  if (moved.length) console.log(fmtTable(moved.map((r) => [r.drift, r.name, r.pinned, r.latest ?? '—', r.latestNode ? `${r.latestNode}${r.nodeOk === false ? `  (this Node ${process.versions.node} is below it)` : ''}` : '']), ['drift', 'package', 'pinned', 'latest', 'latest needs node']));
  console.log(`${summary.checked} pins · ${summary.major} major · ${summary.minor} minor · ${summary.patch} patch · ${summary.same} current${summary.unreachable ? ` · ${summary.unreachable} unreachable` : ''}`);
  if (summary.major) console.log('A major drift is a decision, not a bump: read the changelog, move one library at a time, update versions.md, recipes/package.json and check-sync, then re-run verify-recipes.');
}
process.exitCode = rows.length && summary.unreachable === rows.length ? 1 : args.strict && summary.major ? 2 : 0;
