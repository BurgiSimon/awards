#!/usr/bin/env node
// The jury's and ship's only way into AWARDS.md: append lines to one log section, or set one Status line.
// Narrow on purpose: the forked juror may not edit the build, and with this it never needs an editor for the
// contract file. Everything else in AWARDS.md is left byte for byte.
// Usage:
//   node awards-log.mjs <AWARDS.md> --append "Jury log" --line "<text>" [--line "<text>"]
//   node awards-log.mjs <AWARDS.md> --status "Jury disposition" --value "fix · 2026-10-22" [--tick]
//   node awards-log.mjs <AWARDS.md> --status "Shipped" --tick
// Exit: 0 written · 1 usage, a missing file or a missing section/line.
import fs from 'node:fs';

const argv = process.argv.slice(2);
const file = argv[0];
const opt = (name) => { const i = argv.indexOf(`--${name}`); return i > 0 ? argv[i + 1] : undefined; };
const lines = argv.flatMap((a, i) => (a === '--line' && argv[i + 1] !== undefined ? [argv[i + 1]] : []));
const fail = (message) => { console.error(message); process.exit(1); };
if (!file || !fs.existsSync(file)) fail('usage: node awards-log.mjs <AWARDS.md> --append <section> --line <text> | --status <label> [--value <text>] [--tick]');
const text = fs.readFileSync(file, 'utf8');
const eol = text.includes('\r\n') ? '\r\n' : '\n';
const rows = text.split(/\r?\n/);

if (opt('append') !== undefined) {
  if (!lines.length) fail('--append needs at least one --line');
  if (lines.some((l) => /[\r\n]/.test(l))) fail('a --line is one line; pass one --line per line');
  const heading = rows.findIndex((r) => r.trim() === `## ${opt('append')}`);
  if (heading < 0) fail(`no "## ${opt('append')}" section in ${file}`);
  let end = rows.findIndex((r, i) => i > heading && /^## /.test(r));
  if (end < 0) end = rows.length;
  // After the section's last non-blank line (its comment or the previous entry), before the blank lines that close it.
  let at = end;
  while (at - 1 > heading && rows[at - 1].trim() === '') at--;
  rows.splice(at, 0, ...lines);
} else if (opt('status') !== undefined) {
  const label = opt('status');
  const i = rows.findIndex((r) => /^- \[[ xX]\] /.test(r) && r.replace(/^- \[[ xX]\] /, '').startsWith(label));
  if (i < 0) fail(`no Status line starting "${label}" in ${file}`);
  const box = argv.includes('--tick') ? '- [x] ' : rows[i].slice(0, 6);
  const value = opt('value');
  const body = value === undefined ? rows[i].slice(6) : label.endsWith(':') ? `${label} ${value}` : `${label}: ${value}`;
  rows[i] = box + body;
} else fail('pass --append <section> --line <text>, or --status <label>');

fs.writeFileSync(file, rows.join(eol));
console.log(`updated ${file}`);
