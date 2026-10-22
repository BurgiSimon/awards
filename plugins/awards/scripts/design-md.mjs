#!/usr/bin/env node
// DESIGN.md interop through Google's design.md CLI (pinned, alpha): lint the file, export its tokens to DTCG or
// Tailwind, and keep one snapshot per jury round so the next round can say which tokens moved. The CLI runs
// through npx at the pinned version; with no network or no npx every command says `unmeasured` and exits 0, so a
// build never stops on it. Pattern: references/stacks/versions.md (pin), skills/system (when to run it).
// Usage:
//   node design-md.mjs lint [DESIGN.md] [--json]
//   node design-md.mjs export --format dtcg|css-tailwind|json-tailwind [DESIGN.md] [--out <file>]
//   node design-md.mjs snapshot --label <jury-round> [DESIGN.md]      copy to .awards/design/<date>-<label>.md
//   node design-md.mjs diff [DESIGN.md] [--against <snapshot>] [--json]  tokens changed since the last snapshot
// Exit: 0 done or unmeasured · 2 lint errors or a diff regression · 1 usage.
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { parseArgs, now } from './lib/report.mjs';

export const CLI = '@google/design.md@0.4.0';
const args = parseArgs(process.argv.slice(2), { json: 'boolean' });
const [command, fileArg] = args._;
const file = path.resolve(String(fileArg ?? 'DESIGN.md'));
const project = path.dirname(file);
const snapDir = path.join(project, '.awards', 'design');
const win = process.platform === 'win32';

const cli = (argv) => new Promise((resolve) => execFile(win ? 'npx.cmd' : 'npx', ['--yes', CLI, ...argv], { timeout: 120000, maxBuffer: 8 << 20, shell: win }, (e, so, se) => resolve({ code: e ? (typeof e.code === 'number' ? e.code : -1) : 0, out: String(so), err: String(se) })));
const unmeasured = (why) => { console.log(`design.md: unmeasured (${why})`); process.exit(0); };
const parse = (r) => { try { return JSON.parse(r.out); } catch { return null; } };

if (!['lint', 'export', 'snapshot', 'diff'].includes(command)) {
  console.error('usage: node design-md.mjs lint|export|snapshot|diff [DESIGN.md] [options]');
  process.exit(1);
}
if (!fs.existsSync(file)) { console.error(`no ${path.relative(process.cwd(), file) || file}`); process.exit(1); }

if (command === 'lint') {
  const r = await cli(['lint', '--format', 'json', file]);
  const report = parse(r);
  if (!report) unmeasured(r.err.split('\n').find(Boolean)?.slice(0, 120) ?? 'the CLI gave no JSON');
  // `missing-primary` asks for a token named primary; in the plugin's schema the accent plays that role, so it is
  // reported as information, not as a warning to fix.
  for (const f of report.findings) if (f.rule === 'missing-primary') { f.severity = 'info'; f.message += ' (the accent token plays primary here)'; }
  report.summary.warnings = report.findings.filter((f) => f.severity === 'warning').length;
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else {
    for (const f of report.findings.filter((f) => f.severity !== 'info')) console.log(`${f.severity.padEnd(7)} ${f.rule}${f.path ? ` (${f.path})` : ''}: ${f.message}`);
    console.log(`design.md lint: ${report.summary.errors} error(s), ${report.summary.warnings} warning(s)`);
  }
  process.exit(report.summary.errors ? 2 : 0);
}

if (command === 'export') {
  const format = String(args.format ?? '');
  if (!['dtcg', 'css-tailwind', 'json-tailwind'].includes(format)) { console.error('--format dtcg|css-tailwind|json-tailwind'); process.exit(1); }
  const r = await cli(['export', '--format', format, file]);
  if (r.code !== 0 || !r.out.trim()) unmeasured(r.err.split('\n').find(Boolean)?.slice(0, 120) ?? 'export failed');
  // The 0.4.0 Tailwind CSS export quotes a whole font stack as one family name; split it back into a list.
  const out = format === 'css-tailwind' ? r.out.replace(/(--font-[\w-]+:\s*)"([^"]+)";/g, (m, k, stack) => `${k}${stack.split(',').map((f) => f.trim()).map((f) => (/\s/.test(f) && !/^["']/.test(f) ? `"${f}"` : f)).join(', ')};`) : r.out;
  if (args.out) { fs.mkdirSync(path.dirname(path.resolve(String(args.out))), { recursive: true }); fs.writeFileSync(String(args.out), out); console.log(`${format} → ${args.out}`); }
  else process.stdout.write(out);
  process.exit(0);
}

if (command === 'snapshot') {
  if (!args.label) { console.error('--label <jury round, e.g. round-1>'); process.exit(1); }
  fs.mkdirSync(snapDir, { recursive: true });
  const target = path.join(snapDir, `${now().slice(0, 10)}-${String(args.label).replace(/[^\w-]+/g, '-')}.md`);
  fs.copyFileSync(file, target);
  console.log(`snapshot → ${path.relative(process.cwd(), target)}`);
  process.exit(0);
}

// diff: against --against, else the newest snapshot.
const snaps = fs.existsSync(snapDir) ? fs.readdirSync(snapDir).filter((f) => f.endsWith('.md')).sort() : [];
const against = args.against ? path.resolve(String(args.against)) : snaps.length ? path.join(snapDir, snaps.at(-1)) : null;
if (!against) { console.log('design.md diff: no snapshot yet (run snapshot at the first jury round)'); process.exit(0); }
const r = await cli(['diff', '--format', 'json', against, file]);
const d = parse(r);
if (!d) unmeasured(r.err.split('\n').find(Boolean)?.slice(0, 120) ?? 'the CLI gave no JSON');
if (args.json) console.log(JSON.stringify({ against: path.relative(project, against), ...d }, null, 2));
else {
  const moved = Object.entries(d.tokens).flatMap(([group, c]) => [...c.added.map((t) => `+${group}.${t}`), ...c.removed.map((t) => `-${group}.${t}`), ...c.modified.map((t) => `~${group}.${t}`)]);
  console.log(`since ${path.relative(project, against)}: ${moved.length ? moved.join(' ') : 'no token changed'}${d.regression ? ' · lint regression' : ''}`);
}
process.exit(d.regression ? 2 : 0);
