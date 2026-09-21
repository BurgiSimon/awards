#!/usr/bin/env node
// Check the file-target regex graders against untouched input: a grader that already passes before
// the agent has done anything measures nothing. Runs in about a second and costs nothing.
// Guards are the deliberate exceptions — graders whose job is to fail when something is *removed*.
// Usage: node evals/selftest.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const evalsDir = path.dirname(fileURLToPath(import.meta.url));
const templates = path.join(evalsDir, '..', 'assets', 'templates');
const GUARDS = new Set(['pin-kept', 'no-eased-scrub-after', 'contract-blocks', 'images-remain', 'hero-and-work-kept', 'footer-kept']);

const field = (fm, key) => fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1].trim();
const unquote = (s) => (s && /^['"].*['"]$/s.test(s) ? s.slice(1, -1) : s);

const rows = [];
for (const c of fs.readdirSync(evalsDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const gdir = path.join(evalsDir, c.name, 'graders');
  if (!fs.existsSync(gdir)) continue;
  for (const g of fs.readdirSync(gdir).filter((f) => f.endsWith('.md'))) {
    const fm = fs.readFileSync(path.join(gdir, g), 'utf8').split(/^---$/m)[1] ?? '';
    if (field(fm, 'type') !== 'regex') continue;
    const target = field(fm, 'target') ?? '';
    const file = target.match(/path:\s*([^\s},]+)/)?.[1];
    if (!file) continue; // last_message and trace targets have no untouched input to check
    const name = g.replace(/\.md$/, '');
    const fixture = path.join(evalsDir, c.name, 'fixture', file);
    const source = fs.existsSync(fixture) ? fixture : path.join(templates, file);
    if (!fs.existsSync(source)) { rows.push({ case: c.name, name, verdict: 'skip', why: `no untouched ${file}` }); continue; }

    const re = new RegExp(unquote(field(fm, 'pattern')), field(fm, 'flags') ?? '');
    const found = re.test(fs.readFileSync(source, 'utf8'));
    const graderPasses = field(fm, 'match') === 'not_contains' ? !found : found;
    const ok = GUARDS.has(name) ? graderPasses : !graderPasses;
    rows.push({
      case: c.name, name, verdict: ok ? 'ok' : 'BAD',
      why: GUARDS.has(name)
        ? (graderPasses ? `guard holds on ${path.basename(source)}` : `guard already fails on ${path.basename(source)}`)
        : (graderPasses ? `passes on untouched ${path.basename(source)}` : `fails on untouched ${path.basename(source)}`),
    });
  }
}

const bad = rows.filter((r) => r.verdict === 'BAD');
for (const r of rows.sort((a, b) => a.case.localeCompare(b.case))) {
  console.log(`${r.verdict.padEnd(4)} ${r.case}/${r.name} — ${r.why}`);
}
console.log(`\n${rows.length} file-target grader(s) · ${bad.length} defective · ${rows.filter((r) => r.verdict === 'skip').length} skipped`);
process.exit(bad.length ? 1 : 0);
