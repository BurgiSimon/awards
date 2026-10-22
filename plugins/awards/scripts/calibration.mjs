#!/usr/bin/env node
// Recompute the score claims the references quote (which axis is lowest, how high Accessibility goes)
// from the site cards themselves, so a quarterly refresh is one command instead of a re-read of 60 cards.
// Reads the first score set in each card's `| Awards |` row: the four axes and the six developer criteria.
// Usage: node scripts/calibration.mjs [--json] [--since <year>]   (--since drops entries awarded before that year)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, fmtTable, now } from './lib/report.mjs';

const plugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = parseArgs(process.argv.slice(2), { json: 'boolean' });
const sites = path.join(plugin, 'references/sites');
const AXES = ['design', 'usability', 'creativity', 'content'];
const DEV = ['semantics', 'animations', 'accessibility', 'wpo', 'responsive', 'markup'];
const N = '(\\d(?:\\.\\d{1,2})?)';
const axesRe = new RegExp(`\\b(?:Design|D)\\s*${N}\\D{1,8}(?:Usability|U)\\s*${N}\\D{1,8}(?:Creativity|C)\\s*${N}\\D{1,8}(?:Content|Co)\\s*${N}`);
const devRe = new RegExp(`Semantics[^\\d]{0,14}${N}\\D{1,6}Animations[^\\d]{0,26}${N}\\D{1,6}Accessibility\\s*${N}\\D{1,6}WPO\\s*${N}\\D{1,6}Responsive[^\\d]{0,14}${N}\\D{1,6}Markup[^\\d]{0,18}${N}`, 'i');

const entries = [];
for (const file of fs.readdirSync(sites).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort()) {
  const row = fs.readFileSync(path.join(sites, file), 'utf8').split('\n').find((l) => /^\|\s*Awards\s*\|/.test(l));
  if (!row) continue;
  const text = row.replace(/\*\*/g, '');
  const a = text.match(axesRe), d = text.match(devRe);
  if (!a && !d) continue;
  // The award year: the first four-digit year in the row (the current entry is listed first).
  const year = Number(text.match(/\b(20\d\d)\b/)?.[1]) || null;
  if (args.since && year && year < Number(args.since)) continue;
  entries.push({
    site: file.replace(/\.md$/, ''),
    year,
    axes: a ? Object.fromEntries(AXES.map((k, i) => [k, Number(a[i + 1])])) : null,
    dev: d ? Object.fromEntries(DEV.map((k, i) => [k, Number(d[i + 1])])) : null,
  });
}

const stat = (values) => {
  const v = values.filter((x) => typeof x === 'number').sort((x, y) => x - y);
  if (!v.length) return null;
  return { n: v.length, min: v[0], median: v[Math.floor((v.length - 1) / 2)], max: v[v.length - 1] };
};
const withAxes = entries.filter((e) => e.axes);
const withDev = entries.filter((e) => e.dev);
const lowest = {};
for (const e of withAxes) {
  const min = Math.min(...AXES.map((k) => e.axes[k]));
  for (const k of AXES) if (e.axes[k] === min) (lowest[k] ??= []).push(e.site);
}
const top = (k) => withDev.filter((e) => e.dev[k] === Math.max(...withDev.map((x) => x.dev[k]))).map((e) => e.site);
// The published overall is the 40/30/20/10 weighting of the axes; the developer score is the mean of the six.
for (const e of withAxes) e.overall = Math.round((e.axes.design * 0.4 + e.axes.usability * 0.3 + e.axes.creativity * 0.2 + e.axes.content * 0.1) * 100) / 100;
for (const e of withDev) e.developer = Math.round((DEV.reduce((n, k) => n + e.dev[k], 0) / DEV.length) * 100) / 100;
const report = {
  at: now(),
  cards: entries.length,
  overall: stat(withAxes.map((e) => e.overall)),
  developerScore: stat(withDev.map((e) => e.developer)),
  lowestAxisScore: withAxes.map((e) => ({ site: e.site, min: Math.min(...AXES.map((k) => e.axes[k])) })).sort((a, b) => a.min - b.min).slice(0, 3),
  axes: Object.fromEntries(AXES.map((k) => [k, stat(withAxes.map((e) => e.axes[k]))])),
  developer: Object.fromEntries(DEV.map((k) => [k, { ...stat(withDev.map((e) => e.dev[k])), best: top(k) }])),
  lowestAxis: Object.fromEntries(AXES.map((k) => [k, lowest[k]?.length ?? 0])),
  notUsabilityLowest: withAxes.filter((e) => !lowest.usability?.includes(e.site)).map((e) => e.site),
  entries,
};

if (args.json) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`${entries.length} cards with scores${args.since ? ` (awarded ${args.since} or later)` : ''} · ${withAxes.length} with the four axes · ${withDev.length} with the six developer criteria`);
  console.log(fmtTable([...AXES.map((k) => [k, report.axes[k]?.min, report.axes[k]?.median, report.axes[k]?.max, report.lowestAxis[k]]), ['overall', report.overall?.min, report.overall?.median, report.overall?.max, ''], ['developer score', report.developerScore?.min, report.developerScore?.median, report.developerScore?.max, '']], ['axis', 'min', 'median', 'max', 'lowest on']));
  console.log(`Lowest single axis scores: ${report.lowestAxisScore.map((e) => `${e.site} ${e.min}`).join(', ')}`);
  console.log(fmtTable(DEV.map((k) => [k, report.developer[k].min, report.developer[k].median, report.developer[k].max, report.developer[k].best.join(', ')]), ['developer', 'min', 'median', 'max', 'best']));
  if (report.notUsabilityLowest.length) console.log(`Usability is not the lowest axis on: ${report.notUsabilityLowest.join(', ')}`);
}
