#!/usr/bin/env node
// Re-grade a finished run's workspace with the case's current graders, without a model call: the way
// to try a grader fix against a run already paid for. Keep workspaces with `claude plugin eval … --keep-temp`
// (it prints each run's sandbox path), then point this at one.
// Graders it can judge offline: file_exists (against files present in the workspace, which also counts
// files a scaffold wrote, so read those results with that in mind) and regex on a workspace file. regex on
// trace or last_message, tool_used and tool_order need the session transcript: pass it with
// --transcript <file.jsonl>, or the newest *.jsonl under the workspace is used when one exists.
// llm and baseline graders are never run here; they cost money.
// Usage: node evals/regrade.mjs <case> <workspace-dir> [--transcript <file.jsonl>] [--json]
// Exit: 0 every judged grader passes · 1 a judged grader fails · 2 usage error.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from '../scripts/lib/report.mjs';

const evalsDir = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2), { json: 'boolean' });
const [caseName, workspace] = args._;
if (!caseName || !workspace || !fs.existsSync(path.join(evalsDir, caseName, 'graders')) || !fs.existsSync(workspace)) {
  console.error('usage: node evals/regrade.mjs <case> <workspace-dir> [--transcript <file.jsonl>] [--json]');
  process.exit(2);
}
const ws = path.resolve(workspace);

// Frontmatter: flat keys, plus the one-line { tool, input_match } and { source: file, path } maps the suite uses.
const unquote = (s) => (s && /^(['"]).*\1$/s.test(s) ? s.slice(1, -1).replace(/''/g, "'") : s);
function frontmatter(text) {
  const fm = {};
  for (const line of (text.split(/^---$/m)[1] ?? '').split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    const value = m[2].trim();
    const map = value.match(/^\{(.*)\}$/);
    fm[m[1]] = map
      ? Object.fromEntries([...map[1].matchAll(/(\w+):\s*('(?:[^']|'')*'|"[^"]*"|[^,}]+)/g)].map((x) => [x[1], unquote(x[2].trim())]))
      : unquote(value);
  }
  return fm;
}

function walk(dir, out = [], depth = 0) {
  if (depth > 12 || !fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) { if (ent.name !== 'node_modules') walk(p, out, depth + 1); }
    else out.push(p);
  }
  return out;
}
const files = walk(ws);
const transcriptFile = args.transcript ? path.resolve(String(args.transcript))
  : files.filter((f) => f.endsWith('.jsonl')).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
const transcript = transcriptFile && fs.existsSync(transcriptFile)
  ? fs.readFileSync(transcriptFile, 'utf8').split('\n').filter(Boolean).flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } })
  : null;
const toolCalls = transcript?.flatMap((e) => (Array.isArray(e.message?.content) ? e.message.content : []).filter((c) => c.type === 'tool_use').map((c) => ({ name: c.name, input: JSON.stringify(c.input ?? {}) }))) ?? null;
const lastMessage = transcript ? [...transcript].reverse().find((e) => e.type === 'assistant' && (Array.isArray(e.message?.content) ? e.message.content : []).some((c) => c.type === 'text'))?.message.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n') ?? '' : null;

// Simple globs: ** spans directories, * stays within one.
const globRe = (g) => new RegExp('^' + g.split('**/').map((part) => part.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')).join('(?:.*/)?') + '$');
const callMatches = (want, call) => want && call.name === want.tool && (!want.input_match || new RegExp(want.input_match).test(call.input));

const rows = [];
for (const g of fs.readdirSync(path.join(evalsDir, caseName, 'graders')).filter((f) => f.endsWith('.md')).sort()) {
  const fm = frontmatter(fs.readFileSync(path.join(evalsDir, caseName, 'graders', g), 'utf8'));
  const name = g.replace(/\.md$/, '');
  const row = (verdict, why) => rows.push({ grader: name, type: fm.type, verdict, why });
  if (fm.type === 'llm' || fm.type === 'baseline') { row('skip', 'model-judged; not re-run offline'); continue; }
  if (fm.type === 'file_exists') {
    const re = globRe(fm.path);
    const hit = files.map((f) => path.relative(ws, f).split(path.sep).join('/')).find((f) => re.test(f));
    const want = fm.exists !== 'false';
    row(Boolean(hit) === want ? 'pass' : 'fail', hit ? `found ${hit}` : `no file matches ${fm.path}`);
    continue;
  }
  if (fm.type === 'regex') {
    const target = typeof fm.target === 'object' ? fm.target : { kind: fm.target || 'last_message' };
    let text = null;
    if (target.source === 'file') {
      const file = path.join(ws, target.path);
      text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
      if (text === null) { row('fail', `${target.path} missing`); continue; }
    } else if (target.kind === 'trace') text = transcript?.map((e) => JSON.stringify(e)).join('\n') ?? null;
    else if (target.kind === 'last_message') text = lastMessage;
    if (text === null) { row('skip', `needs the transcript for ${target.kind}`); continue; }
    const re = new RegExp(fm.pattern, fm.flags ?? '');
    const n = (text.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')) ?? []).length;
    const count = String(fm.match ?? '').match(/^count:(\d+)$/)?.[1];
    const ok = fm.match === 'not_contains' ? n === 0 : count !== undefined ? n === Number(count) : n > 0;
    row(ok ? 'pass' : 'fail', `${n} match(es)`);
    continue;
  }
  if (fm.type === 'tool_used' || fm.type === 'tool_order') {
    if (!toolCalls) { row('skip', 'needs the transcript'); continue; }
    if (fm.type === 'tool_used') {
      const n = toolCalls.filter((c) => callMatches({ tool: fm.tool, input_match: fm.input_match }, c)).length;
      const min = fm.min === undefined ? 1 : Number(fm.min), max = fm.max === undefined ? Infinity : Number(fm.max);
      row(n >= min && n <= max ? 'pass' : 'fail', `${n} matching call(s), wanted ${min}–${max === Infinity ? '∞' : max}`);
    } else {
      const before = toolCalls.findIndex((c) => callMatches(fm.before, c));
      const after = toolCalls.findIndex((c) => callMatches(fm.after, c));
      row(before >= 0 && after >= 0 && before < after ? 'pass' : 'fail', `first before at call ${before}, first after at call ${after}`);
    }
    continue;
  }
  row('skip', `unknown grader type ${fm.type}`);
}

const judged = rows.filter((r) => r.verdict !== 'skip');
const failed = judged.filter((r) => r.verdict === 'fail');
if (args.json) console.log(JSON.stringify({ case: caseName, workspace: ws, transcript: transcriptFile ?? null, graders: rows }, null, 2));
else {
  for (const r of rows) console.log(`${r.verdict.padEnd(4)} ${r.grader} (${r.type}) — ${r.why}`);
  console.log(`${caseName}: ${judged.length - failed.length} / ${judged.length} judged graders pass · ${rows.length - judged.length} skipped${transcriptFile ? ` · transcript ${transcriptFile}` : ' · no transcript'}`);
}
process.exit(failed.length ? 1 : 0);
