#!/usr/bin/env node
// Field data for a live site from the Chrome UX Report API: p75 LCP, INP, CLS, FCP and TTFB per form factor.
// What real visitors on real devices got, which no headless capture can stand in for. Needs an API key
// (CRUX_API_KEY) and a site with enough Chrome traffic to be in the dataset.
// Usage: node scripts/crux.mjs <url|origin> [--origin] [--json]
//   A URL is queried as that page first; with --origin, or when the page has no record, the whole origin.
// Exit: 0 record found · 3 no CRUX_API_KEY · 4 not in the dataset · 1 usage or request error.
import { parseArgs, fmtTable, now } from './lib/report.mjs';

const args = parseArgs(process.argv.slice(2), { json: 'boolean', origin: 'boolean' });
const target = args._[0];
if (!target || !/^https?:\/\//i.test(String(target))) {
  console.error('usage: node scripts/crux.mjs <https://url-or-origin> [--origin] [--json]');
  process.exit(1);
}
const key = process.env.CRUX_API_KEY;
if (!key) {
  console.error('CRUX_API_KEY is not set. Create a key for the Chrome UX Report API in a Google Cloud project, then export CRUX_API_KEY=<key>.');
  process.exit(3);
}

const METRICS = {
  largest_contentful_paint: { label: 'LCP', good: 2500, poor: 4000, unit: 'ms' },
  interaction_to_next_paint: { label: 'INP', good: 200, poor: 500, unit: 'ms' },
  cumulative_layout_shift: { label: 'CLS', good: 0.1, poor: 0.25, unit: '' },
  first_contentful_paint: { label: 'FCP', good: 1800, poor: 3000, unit: 'ms' },
  experimental_time_to_first_byte: { label: 'TTFB', good: 800, poor: 1800, unit: 'ms' },
};
const origin = new URL(String(target)).origin;

async function query(scope, formFactor) {
  const res = await fetch(`https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...scope, formFactor, metrics: Object.keys(METRICS) }),
    signal: AbortSignal.timeout(15000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`CrUX API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).record ?? null;
}

const rows = [];
let scopeUsed = null;
try {
  for (const scope of args.origin ? [{ origin }] : [{ url: String(target) }, { origin }]) {
    for (const formFactor of ['PHONE', 'DESKTOP']) {
      const record = await query(scope, formFactor);
      if (!record) continue;
      scopeUsed = scope;
      for (const [name, m] of Object.entries(METRICS)) {
        const p75 = record.metrics?.[name]?.percentiles?.p75;
        if (p75 === undefined) continue;
        const value = Number(p75);
        rows.push({ formFactor, metric: m.label, p75: value, unit: m.unit, rating: value <= m.good ? 'good' : value <= m.poor ? 'needs improvement' : 'poor', period: record.collectionPeriod ?? null });
      }
    }
    if (rows.length) break;
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

if (!rows.length) {
  console.error(`${origin} is not in the Chrome UX Report dataset (too little Chrome traffic, or not public).`);
  process.exit(4);
}
const scope = scopeUsed.url ? `page ${scopeUsed.url}` : `origin ${scopeUsed.origin}`;
if (args.json) console.log(JSON.stringify({ at: now(), scope, rows }, null, 2));
else {
  console.log(`Chrome UX Report, ${scope}: the 75th percentile of real visits over the last 28 days`);
  console.log(fmtTable(rows.map((r) => [r.formFactor.toLowerCase(), r.metric, `${r.unit === 'ms' ? Math.round(r.p75) : r.p75}${r.unit}`, r.rating]), ['device', 'metric', 'p75', 'rating']));
}
