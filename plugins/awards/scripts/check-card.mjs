#!/usr/bin/env node
// One corpus card against the template: the header rows the index is built from (class and industry from
// scripts/data/corpus-vocab.json), the nine sections, the length cap, labelled hexes and quote length.
// Clone-level cards (Confidence starts with "clone") need only the header. A hex on a Don't take line refuses
// a value already labelled where the card records it, so it needs no second label.
// Usage: node scripts/check-card.mjs <card.md …> | --all [--dir <sites dir>] [--json]
// Exit: 0 clean · 1 a card has errors · 2 usage.
import path from 'node:path';
import { parseArgs } from './lib/report.mjs';
import { cardFiles, parseCard, canonicalClass, vocab, pluginSites } from './lib/cards.mjs';

const args = parseArgs(process.argv.slice(2), { all: 'boolean', json: 'boolean' });
const files = args.all ? cardFiles(path.resolve(String(args.dir ?? pluginSites))) : args._.map((f) => path.resolve(f));
if (!files.length) { console.error('usage: node scripts/check-card.mjs <card.md …> | --all [--dir <sites dir>] [--json]'); process.exit(2); }

const REQUIRED = ['Class', 'Industry', 'Visitor mode', 'Awards', 'Palette', 'Type', 'WebGL dosage', 'Scroll model', 'Narrative model', 'Palette strategy', 'Type contract', 'Awards / score', 'Confidence', 'Last verified'];
const LABEL = /\[(verified|recalled|inferred|unknown)/;

export function checkCard(card) {
  const errors = [];
  const h = card.header;
  const clone = /^clone/i.test(h.Confidence ?? '');
  const need = clone ? ['Class', 'Industry', 'Palette strategy', 'Type contract', 'Awards / score', 'Confidence', 'Last verified'] : REQUIRED;
  for (const key of need) if (!h[key]) errors.push(`missing header row: ${key}`);
  if (h.Class && !canonicalClass(h.Class)) errors.push(`Class must start with one of: ${vocab.classes.join(', ')}`);
  if (h.Industry && !(h.Industry in vocab.industries)) errors.push(`Industry "${h.Industry}" is not in scripts/data/corpus-vocab.json`);
  if (!clone && h['Last verified'] && !/^\d{4}-\d{2}-\d{2}$/.test(h['Last verified'])) errors.push('Last verified must be YYYY-MM-DD');
  if (h['Routes read']) for (const part of h['Routes read'].split(/\s*[,·]\s*/)) {
    const kind = part.replace(/`/g, '').split(/\s+/)[0];
    if (!vocab.routeKinds.includes(kind)) errors.push(`Routes read: "${kind}" is not one of ${vocab.routeKinds.join(', ')}`);
  }
  if (!clone) {
    if (!card.url) errors.push('the first line names no URL');
    for (let n = 1; n <= 9; n++) if (!card.sections.includes(n)) errors.push(`missing section ## ${n}.`);
  }
  if (card.lines.length >= 200) errors.push(`${card.lines.length} lines (keep under 200)`);
  card.lines.forEach((line, i) => {
    if (/#[0-9a-fA-F]{3,8}\b/.test(line) && !LABEL.test(line) && !/^\| (Palette strategy|Type contract|Awards \/ score) \|/.test(line) && !/^```|^\s{2,}|^- \*\*Don't take/.test(line)) errors.push(`line ${i + 1}: a hex with no label on its line`);
    for (const m of line.replace(/`[^`]*`/g, "").matchAll(/“([^”]*)”|"([^"]*)"/g)) {
      if ((m[1] ?? m[2]).trim().split(/\s+/).length > 25) errors.push(`line ${i + 1}: a quote over 25 words`);
    }
  });
  return { slug: card.slug, clone, errors };
}

const results = files.map((f) => checkCard(parseCard(f)));
const bad = results.filter((r) => r.errors.length);
if (args.json) console.log(JSON.stringify({ cards: results.length, failing: bad.length, results: bad }, null, 2));
else {
  for (const r of bad) for (const e of r.errors) console.log(`${r.slug}: ${e}`);
  console.log(`${results.length} card(s) · ${bad.length} with errors`);
}
process.exit(bad.length ? 1 : 0);
