#!/usr/bin/env node
// The model-free half of a corpus wave: for each queued URL, does the host resolve, does the owner allow it,
// does the page answer, which stack signatures does its served text carry, does a card already exist, and
// (with --capture) the research capture set, taken here one site at a time so the analysis subagents never
// queue on the capture lock. Sites that fail, refuse or answer with an error never reach a model call.
// Usage: node scripts/corpus-prepass.mjs [<url> …] [--queue <awardsworthysites.md>] [--capture]
//        [--out <dir, default REPO/.awards/research>] [--json]
// Writes <out>/<slug>/prepass.json per site and prints one line each. Exit: 0 done · 1 usage.
import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns/promises';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, now } from './lib/report.mjs';
import { cardFiles, parseCard } from './lib/cards.mjs';

const plugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(plugin, '..', '..');
const args = parseArgs(process.argv.slice(2), { capture: 'boolean', json: 'boolean' });
const out = path.resolve(String(args.out ?? path.join(repo, '.awards/research')));
const run = (cmd, argv, timeout) => new Promise((resolve) => execFile(cmd, argv, { timeout, maxBuffer: 8 << 20 }, (e, so, se) => resolve({ code: e ? (typeof e.code === 'number' ? e.code : 1) : 0, so: String(so), se: String(se) })));

// The queue: bullets under every "# not reviewed…" heading of awardsworthysites.md, as expand-corpus reads it.
let urls = args._.map(String);
if (args.queue) {
  let open = false;
  for (const line of fs.readFileSync(String(args.queue), 'utf8').split('\n')) {
    if (/^# /.test(line)) open = /^# not reviewed/i.test(line);
    else if (open) { const u = line.match(/^- (https?:\/\/\S+)/)?.[1]; if (u && !urls.includes(u)) urls.push(u); }
  }
}
if (!urls.length) { console.error('usage: node scripts/corpus-prepass.mjs [<url> …] [--queue awardsworthysites.md] [--capture] [--json]'); process.exit(1); }

// Signatures research §4 reads, matched against served HTML and first-party scripts; each maps to the stack
// note that would cover it (null: no note expected, as for a CMS or a framework with its own adapter note).
const SIGNATURES = [
  ['gsap', /\bgsap\b|ScrollTrigger|SplitText/, 'gsap'], ['lenis', /\blenis\b|data-lenis-prevent/i, 'lenis'],
  ['three', /WebGLRenderer|ShaderMaterial|three\.module/, 'three'], ['ogl', /\bogl\b|new Renderer\(\{[^}]*dpr/, 'ogl'],
  ['react-three-fiber', /@react-three/, 'react-three-fiber'], ['rive', /\brive\b|\.riv\b/i, 'rive'], ['animejs', /animejs|anime\.timeline/, 'animejs'],
  ['barba', /\bbarba\b/i, 'barba'], ['taxi', /@unseenco\/taxi|\btaxi\b/i, 'taxi'], ['swup', /\bswup\b/i, null], ['highway', /@dogstudio\/highway/, 'highway'],
  ['motion', /framer-motion|motion\/react/, 'motion'], ['lottie', /lottie/i, 'lottie-web'], ['spline', /@splinetool|spline-viewer/i, 'spline-viewer'],
  ['playcanvas', /playcanvas/i, 'playcanvas'], ['swiper', /\bswiper\b/i, 'swiper'], ['locomotive-scroll', /locomotive-scroll|data-scroll-container/, 'locomotive-scroll'],
  ['matter-js', /matter-js|Matter\.Engine/, 'matter-js'], ['webgpu', /navigator\.gpu|WebGPURenderer/, 'webgpu-tsl'], ['babylon', /babylonjs|BABYLON\./, null],
  ['webflow', /webflow\.js|\bw-nav\b/, 'webflow-export'], ['next', /\/_next\//, 'next'], ['nuxt', /\/_nuxt\//, 'nuxt'], ['astro', /astro-island|\/_astro\//, 'astro'],
  ['sveltekit', /\/_app\/immutable\//, 'sveltekit'], ['vite', /\/assets\/index-[\w-]+\.js/, 'vite-vanilla'],
];
const notes = fs.readdirSync(path.join(plugin, 'references/stacks')).map((f) => f.replace(/(-\d[\d.]*)?\.md$/, ''));
const cards = cardFiles().map(parseCard);
const slugOf = (u) => new URL(u).host.replace(/^www\./, '').replace(/\.[a-z]+$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
const get = async (u) => {
  try {
    const res = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'Mozilla/5.0 (awards corpus pre-pass)' } });
    return { status: res.status, url: res.url, text: res.ok ? (await res.text()).slice(0, 2 << 20) : '' };
  } catch (e) { return { status: 0, error: e.cause?.code ?? e.message }; }
};

const results = [];
for (const u of urls) {
  const host = new URL(u).host;
  const existing = cards.find((c) => c.url && new URL(c.url).host.replace(/^www\./, '') === host.replace(/^www\./, '') && new URL(c.url).pathname.replace(/\/$/, '') === new URL(u).pathname.replace(/\/$/, ''));
  const slug = existing?.slug ?? slugOf(u);
  const r = { url: u, slug, at: now(), existingCard: existing ? path.relative(repo, existing.file) : null, status: 'ready', reason: '', signatures: [], newStacks: [], capture: null };
  try { await dns.lookup(host); } catch { Object.assign(r, { status: 'failed', reason: 'host does not resolve' }); }
  if (r.status === 'ready') {
    const p = await run(process.execPath, [path.join(plugin, 'scripts/policy.mjs'), u], 60000);
    if (p.code === 2) Object.assign(r, { status: 'skipped', reason: `owner policy: ${p.so.trim().split('\n').pop()}` });
    else if (p.code === 4) Object.assign(r, { status: 'blocked', reason: 'unreachable at the policy check' });
  }
  if (r.status === 'ready') {
    const page = await get(u);
    if (page.status >= 400 || page.status === 0) Object.assign(r, { status: 'blocked', reason: `HTTP ${page.status || page.error}` });
    else {
      // First-party scripts only, at most four, at most 2 MB each, the way research §4 bounds its fetches.
      const base = new URL(page.url);
      const srcs = [...page.text.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => new URL(m[1], base)).filter((s) => s.host === base.host).slice(0, 4);
      let text = page.text;
      for (const s of srcs) text += '\n' + ((await get(s.href)).text ?? '');
      r.signatures = SIGNATURES.filter(([, re]) => re.test(text)).map(([name]) => name);
      r.newStacks = SIGNATURES.filter(([name, , note]) => r.signatures.includes(name) && note && !notes.includes(note)).map(([name]) => name);
    }
  }
  if (r.status === 'ready' && args.capture) {
    const dir = path.join(out, slug);
    fs.mkdirSync(path.join(repo, '.awards'), { recursive: true });
    const c = await run(process.execPath, [path.join(plugin, 'scripts/capture.mjs'), u, '--out', dir, '--scroll', '0,25,50,75,100', '--mobile', '--reduced-motion', '--json', '--lock', path.join(repo, '.awards/capture.lock')], 300000);
    r.capture = { dir: path.relative(repo, dir), exit: c.code };
    if (c.code === 3) Object.assign(r, { status: 'blocked', reason: 'environment: browser unavailable' });
    else if (c.code === 4) Object.assign(r, { status: 'blocked', reason: 'unreachable at capture' });
  }
  fs.mkdirSync(path.join(out, slug), { recursive: true });
  fs.writeFileSync(path.join(out, slug, 'prepass.json'), JSON.stringify(r, null, 2) + '\n');
  results.push(r);
  if (!args.json) console.log(`${r.status.padEnd(8)} ${slug.padEnd(28)} ${r.reason || `signatures ${r.signatures.join(', ') || 'none'}${r.newStacks.length ? ` · no stack note: ${r.newStacks.join(', ')}` : ''}${r.existingCard ? ' · existing card' : ''}${r.capture ? ` · capture exit ${r.capture.exit}` : ''}`}`);
}
if (args.json) console.log(JSON.stringify(results, null, 2));
