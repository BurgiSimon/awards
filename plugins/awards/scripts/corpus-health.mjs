#!/usr/bin/env node
// Quarterly health of the corpus: for every card's URL, whether the host resolves, what the page answers, and
// a hash of its first-party script and stylesheet URLs. A changed hash since the last run means the site was
// rebuilt and the card's [verified] facts may be stale; a dead host or an error means the card describes a
// site that no longer exists as recorded. Results go to references/sites/_health.json (kept in git, so each
// run diffs against the last one). Reads one HTML document per site, nothing else.
// Usage: node scripts/corpus-health.mjs [--only slug,…] [--json] [--no-write]
// Exit: 0 every site answers as before · 2 something changed or failed · 1 usage.
import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns/promises';
import crypto from 'node:crypto';
import { parseArgs, now } from './lib/report.mjs';
import { cardFiles, parseCard, pluginSites } from './lib/cards.mjs';

const args = parseArgs(process.argv.slice(2), { json: 'boolean', 'no-write': 'boolean' });
const only = args.only ? new Set(String(args.only).split(',')) : null;
const file = path.join(pluginSites, '_health.json');
const before = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { sites: {} };
const after = { checked: now().slice(0, 10), sites: { ...before.sites } };
const changes = [];

for (const card of cardFiles().map(parseCard)) {
  if (only && !only.has(card.slug)) continue;
  if (!card.url) continue;
  const host = new URL(card.url).host;
  const r = { url: card.url, at: now().slice(0, 10), dns: 'ok', http: null, assets: null, hash: null };
  try { await dns.lookup(host); } catch (e) { r.dns = e.code ?? 'failed'; }
  if (r.dns === 'ok') {
    try {
      const res = await fetch(card.url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'Mozilla/5.0 (awards corpus health)' } });
      r.http = res.status;
      if (res.ok) {
        const html = (await res.text()).slice(0, 2 << 20);
        const base = new URL(res.url);
        // Bundled asset names carry content hashes, so the sorted list changes when the build does.
        const assets = [...html.matchAll(/<(?:script[^>]+src|link[^>]+href)=["']([^"']+\.(?:js|mjs|css)(?:\?[^"']*)?)["']/gi)]
          .map((m) => new URL(m[1], base)).filter((u) => u.host === base.host || /cdn|static|assets/.test(u.host)).map((u) => u.pathname).sort();
        r.assets = assets.length;
        r.hash = crypto.createHash('sha256').update(assets.join('\n')).digest('hex').slice(0, 16);
      }
    } catch (e) { r.http = e.cause?.code ?? 'timeout'; }
  }
  const last = before.sites[card.slug];
  const verdict = r.dns !== 'ok' ? `host does not resolve (${r.dns})`
    : typeof r.http !== 'number' || r.http >= 400 ? `answers ${r.http}`
    : last?.hash && r.hash && last.hash !== r.hash ? `rebuilt since ${last.at} (asset list changed)`
    : !r.assets ? 'answers, but lists no first-party scripts or styles (client-rendered or gated)' : null;
  if (verdict) changes.push({ slug: card.slug, verdict, lastVerified: card.header['Last verified'] ?? null });
  after.sites[card.slug] = r;
  if (!args.json) console.log(`${card.slug.padEnd(26)} ${verdict ?? 'unchanged'}`);
}
if (!args['no-write']) fs.writeFileSync(file, JSON.stringify(after, null, 2) + '\n');
if (args.json) console.log(JSON.stringify({ checked: after.checked, changes }, null, 2));
else console.log(`${Object.keys(after.sites).length} site(s) · ${changes.length} to look at${changes.length ? ': re-verify each card (research, --to plugin) or mark what no longer holds' : ''}`);
process.exitCode = changes.length ? 2 : 0;
