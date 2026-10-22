#!/usr/bin/env node
// Does the site's owner allow automated extraction? Reads robots.txt for the page's path (the generic group,
// and the groups for AI crawlers), the page's robots meta tags and its X-Robots-Tag header. Research runs it
// before any capture or curl; a refusal means the site is skipped, never retried (docs/handoff/decisions.md).
// Usage: node scripts/policy.mjs <url> [--json]
// Exit: 0 allowed · 2 refused by the owner's policy · 4 unreachable · 1 usage.
import { parseArgs } from './lib/report.mjs';

const args = parseArgs(process.argv.slice(2), { json: 'boolean' });
const target = args._[0];
if (!target || !/^https?:\/\//i.test(String(target))) {
  console.error('usage: node scripts/policy.mjs <https://url> [--json]');
  process.exit(1);
}
const url = new URL(String(target));
// The groups that speak for this kind of use: anything, and the crawlers named for AI training or retrieval.
const AGENTS = ['*', 'claudebot', 'claude-user', 'claude-searchbot', 'anthropic-ai', 'gptbot', 'ccbot', 'google-extended'];
const reasons = [];

const get = async (u) => {
  try {
    return await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'awards-research (policy check)' } });
  } catch (e) {
    return { error: e.cause?.code ?? e.message };
  }
};

// robots.txt: the longest matching Allow or Disallow in the groups that name these agents decides, as RFC 9309 has it.
const robots = await get(`${url.origin}/robots.txt`);
if (robots.ok) {
  const groups = [];
  let current = null;
  for (const raw of (await robots.text()).split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toLowerCase(), value = m[2].trim();
    if (key === 'user-agent') {
      if (!current || current.rules.length) groups.push((current = { agents: [], rules: [] }));
      current.agents.push(value.toLowerCase());
    } else if ((key === 'allow' || key === 'disallow') && current) current.rules.push({ allow: key === 'allow', path: value });
  }
  const pathname = url.pathname + url.search;
  const matches = (rule) => {
    if (!rule.path) return false;
    const re = new RegExp('^' + rule.path.replace(/[.+?^{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$|\$$/, '$'));
    return re.test(pathname);
  };
  for (const agent of AGENTS) {
    const own = groups.filter((g) => g.agents.includes(agent));
    if (!own.length) continue;
    const hits = own.flatMap((g) => g.rules).filter(matches).sort((a, b) => b.path.length - a.path.length || Number(b.allow) - Number(a.allow));
    if (hits[0] && !hits[0].allow) reasons.push(`robots.txt disallows ${pathname} for ${agent === '*' ? 'every crawler' : agent} (${hits[0].path})`);
  }
}

const done = (allowed) => {
  if (args.json) console.log(JSON.stringify({ url: url.href, allowed, reasons }, null, 2));
  else console.log(allowed ? `allowed: no robots.txt group, header or meta tag refuses ${url.href}` : `refused: ${reasons.join('; ')}`);
  process.exit(allowed ? 0 : 2);
};
// robots.txt already refusing is the answer, whether or not the page itself answers a script.
if (reasons.length) done(false);

const page = await get(url.href);
if (page.error || !page.ok) {
  if (args.json) console.log(JSON.stringify({ url: url.href, allowed: null, unreachable: page.error ?? page.status }));
  else console.error(`unreachable: ${url.href} ${page.error ?? page.status}`);
  process.exit(4);
}
const header = page.headers.get('x-robots-tag') ?? '';
if (/\b(noai|noimageai)\b/i.test(header)) reasons.push(`X-Robots-Tag: ${header}`);
const html = (await page.text()).slice(0, 200000);
for (const m of html.matchAll(/<meta\s[^>]*name=["']?(robots|claudebot|anthropic-ai|gptbot|ccbot)["']?[^>]*>/gi)) {
  const content = m[0].match(/content=["']([^"']*)["']/i)?.[1] ?? '';
  if (/\b(noai|noimageai)\b/i.test(content) || (m[1].toLowerCase() !== 'robots' && /\bnone|noindex\b/i.test(content))) reasons.push(`<meta name="${m[1]}" content="${content}">`);
}

done(reasons.length === 0);
