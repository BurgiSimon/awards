#!/usr/bin/env node
// Composition skeletons for the corpus: runs skeleton.mjs on each card's live URL (the one on its first line),
// one site at a time, writes references/sites/skeletons/<slug>.png, and rebuilds the fingerprint table
// references/sites/_fingerprints.md (and .json) from every result so far. Sites the owner refuses, or that no
// longer answer, are recorded as such and keep any earlier skeleton.
// Usage: node scripts/corpus-skeletons.mjs [--only slug,slug] [--missing] [--table-only]
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, now } from './lib/report.mjs';

const plugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sites = path.join(plugin, 'references/sites');
const outDir = path.join(sites, 'skeletons');
const jsonFile = path.join(sites, '_fingerprints.json');
const args = parseArgs(process.argv.slice(2), { missing: 'boolean', 'table-only': 'boolean' });
const only = args.only ? new Set(String(args.only).split(',')) : null;
const data = fs.existsSync(jsonFile) ? JSON.parse(fs.readFileSync(jsonFile, 'utf8')) : { sites: {} };

// Clone-level cards describe course clones, not a live site, so they get no skeleton.
const cards = fs.readdirSync(sites).filter((f) => f.endsWith('.md') && !f.startsWith('_')).map((f) => {
  const text = fs.readFileSync(path.join(sites, f), 'utf8');
  return { slug: f.replace(/\.md$/, ''), url: text.split('\n')[0].match(/https?:\/\/[^\s)`>|]+/)?.[0] ?? null, clone: /^\| Confidence \| clone/im.test(text) };
}).filter((c) => !c.clone);

if (!args['table-only']) {
  for (const card of cards) {
    if (only && !only.has(card.slug)) continue;
    if (args.missing && fs.existsSync(path.join(outDir, `${card.slug}.png`))) continue;
    if (!card.url) { data.sites[card.slug] = { ...data.sites[card.slug], status: 'no URL on the card' }; continue; }
    const result = await new Promise((resolve) => execFile(process.execPath, [path.join(plugin, 'scripts/skeleton.mjs'), card.url, '--out', path.join(outDir, `${card.slug}.png`), '--slug', card.slug], { timeout: 360000, maxBuffer: 4 << 20 }, (e, so, se) => resolve({ code: e?.killed ? 'timeout' : e?.code ?? (e ? 1 : 0), so, se })));
    const reason = String(result.se).split('\n').filter((l) => l.trim() && !/^warning:/.test(l)).pop()?.slice(0, 100);
    const status = { 0: 'measured', 2: 'refused by the owner\'s policy', 3: 'no browser', 4: 'unreachable', timeout: 'timed out after 6 minutes' }[result.code] ?? `failed: ${reason ?? 'unknown'}`;
    let fp = null;
    try { fp = JSON.parse(String(result.so).trim().split('\n').pop()); } catch {}
    data.sites[card.slug] = { url: card.url, status, at: now().slice(0, 10), ...(fp ? { desktop: fp.desktop, phone: fp.phone } : { desktop: data.sites[card.slug]?.desktop, phone: data.sites[card.slug]?.phone }) };
    console.log(`${card.slug}: ${status}`);
    fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2) + '\n');
  }
}

// The table concept and system read: one row per card, the numbers a layout is made of.
const cell = (v) => (v === null || v === undefined ? '—' : String(v));
const rows = Object.entries(data.sites).sort(([a], [b]) => a.localeCompare(b)).map(([slug, s]) => {
  const d = s.desktop ?? {}, p = s.phone ?? {};
  const ramp = (t) => (t ? `${cell(t.h1)} / ${cell(t.h2)} / ${cell(t.body)}` : '—');
  return `| [site:${slug}] | ${s.status} ${s.at ?? ''} | ${ramp(d.type)} | ${ramp(p.type)} | ${cell(d.margin)} / ${cell(p.margin)} | ${cell(d.columnEdges)} | ${d.mediaShareFirstViewport === undefined ? '—' : Math.round(d.mediaShareFirstViewport * 100) + ' %'} | ${cell(d.pageHeightViewports)} |`;
});
fs.writeFileSync(path.join(sites, '_fingerprints.md'), `# Composition fingerprints

Measured, not described: \`node scripts/corpus-skeletons.mjs\` loads each card's live URL at 1440 × 900 and 390 × 844 with reduced motion, drops consent layers, and records what the first viewport is made of. The block maps are in \`skeletons/<slug>.png\` (top, middle and close on desktop, top on a phone; headings dark, text grey, media light grey). They carry no pixels, words or colours of the sites, only where things sit, so concept and system can read a neighbour's composition without copying its imagery. Every figure is \`[verified]\` against the live page on the date in its row; the live site may have changed since the card was written.

Columns: type ramp is the computed h1 / h2 / body size in px; margin is the leftmost text edge in px (desktop / phone); edges counts distinct left edges used at least twice in the first desktop viewport (a rough column count: 2–4 is a simple grid, 10+ a dense one); media is the share of the first desktop viewport covered by images, video or canvas; height is the page length in viewports (1 means a virtual scroller or a single screen).

| Card | Status | Type ramp, desktop | Type ramp, phone | Margin | Edges | Media | Height |
|---|---|---|---|---|---|---|---|
${rows.join('\n')}
`);
console.log(`fingerprints: ${rows.length} row(s) → references/sites/_fingerprints.md`);
