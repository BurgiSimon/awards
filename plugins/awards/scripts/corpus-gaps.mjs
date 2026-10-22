#!/usr/bin/env node
// Where the corpus is thin: card counts by class, industry, visitor mode, WebGL dosage and routes read, set
// against the floors in scripts/data/corpus-vocab.json, with the award programmes that fill each kind of gap.
// A wave is gap-driven when its queue names at least two of the gaps this prints (expand-corpus Setup).
// Usage: node scripts/corpus-gaps.mjs [--json]   Exit: 0 always.
import { parseArgs } from './lib/report.mjs';
import { cardFiles, parseCard, canonicalClass, firstClause, vocab } from './lib/cards.mjs';

const args = parseArgs(process.argv.slice(2), { json: 'boolean' });
const cards = cardFiles().map(parseCard).filter((c) => !/^clone/i.test(c.header.Confidence ?? ''));
const count = (values, key) => {
  const m = new Map(values.map((v) => [v, 0]));
  for (const c of cards) { const v = key(c); if (v) m.set(v, (m.get(v) ?? 0) + 1); }
  return [...m].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
};
const DOSAGES = ['none', 'moments', 'canvas-first', '100 % canvas'];
const dosage = (c) => { const v = firstClause(c.header['WebGL dosage']).toLowerCase(); return DOSAGES.find((d) => v.startsWith(d)) ?? null; };
const mode = (c) => ['persuade', 'experience', 'read'].find((m) => firstClause(c.header['Visitor mode']).toLowerCase().startsWith(m)) ?? null;
const q = vocab.quotas;
const tables = {
  class: count(vocab.classes, (c) => canonicalClass(c.header.Class)),
  industry: count(Object.keys(vocab.industries), (c) => c.header.Industry),
  visitorMode: count(['persuade', 'experience', 'read'], mode),
  webglDosage: count(DOSAGES, dosage),
};
const floors = { class: q.class, industry: q.industry, visitorMode: q.visitorMode, webglDosage: q.webglDosage };
const gaps = Object.entries(tables).flatMap(([axis, rows]) => rows.filter(([, n]) => n < floors[axis]).map(([value, n]) => ({ axis, value, cards: n, floor: floors[axis] })));
const inner = cards.filter((c) => c.route !== 'home').length;
const innerShare = Math.round((inner / cards.length) * 100) / 100;
if (innerShare < q.innerRouteShare) gaps.push({ axis: 'routes', value: 'inner routes (case, product, article, pricing)', cards: inner, floor: Math.ceil(q.innerRouteShare * cards.length) });

if (args.json) console.log(JSON.stringify({ cards: cards.length, tables: Object.fromEntries(Object.entries(tables).map(([k, v]) => [k, Object.fromEntries(v)])), innerRoutes: inner, gaps, sources: vocab.sources }, null, 2));
else {
  console.log(`${cards.length} award cards (clone-level excluded)\n`);
  for (const [axis, rows] of Object.entries(tables)) console.log(`${axis}: ${rows.map(([v, n]) => `${v} ${n}`).join(' · ')}`);
  console.log(`routes: ${inner} of ${cards.length} cards read an inner route\n`);
  console.log(`${gaps.length} gap(s) under the floors in scripts/data/corpus-vocab.json:`);
  for (const g of gaps) console.log(`  ${g.axis.padEnd(12)} ${g.value} — ${g.cards} of ${g.floor}`);
  console.log('\nWhere to look:');
  for (const s of vocab.sources) console.log(`  ${s.name} (${s.url}): ${s.use}`);
}
