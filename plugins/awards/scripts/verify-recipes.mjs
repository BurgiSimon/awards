#!/usr/bin/env node
// Build the recipes (Vite MPA), serve dist/, drive every recipe through its declared states in headless Chromium
// (WebGL via SwiftShader), run the recipe's probe/assert, capture screenshots and write a report; --stamp also
// records the pass in each recipe.json (a release step: it rewrites tracked files).
// Usage: node verify-recipes.mjs [--only id,id] [--out <dir>] [--no-build] [--json] [--stamp] [--lock <path>] [--pseudo]
// --only also builds only those entries (dist/ then holds just them); --lock serialises runs that share dist/.
// --pseudo adds two phone passes per recipe: every text lengthened by about 40 % with accented letters, then the
// same page right-to-left; each fails on horizontal overflow or a control whose label is cut off.
import { acquireLock } from './lib/lock.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs, fmtTable, now } from './lib/report.mjs';
import { resolvePlaywright, launchChromium, MISSING_MESSAGE } from './lib/playwright.mjs';
import { serveDirectory } from './lib/server.mjs';
import { runActions } from './lib/actions.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const recipesDir = path.resolve(here, '../recipes');
const args = parseArgs(process.argv.slice(2), { build: 'boolean', json: 'boolean', stamp: 'boolean', pseudo: 'boolean' });
const only = args.only ? new Set(String(args.only).split(',').map((s) => s.trim())) : null;
const outDir = path.resolve(args.out ?? path.join(recipesDir, '_verify'));
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };

const allIds = fs.readdirSync(recipesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !['node_modules', 'dist'].includes(d.name) && fs.existsSync(path.join(recipesDir, d.name, 'index.html')))
  .map((d) => d.name);
const ids = allIds.filter((id) => !only || only.has(id));
if (!ids.length) {
  console.error('no recipes found');
  process.exit(1);
}

// Regenerate the gallery index from recipe.json files — from every recipe, never the --only subset,
// which would otherwise rewrite the committed page down to the few that were run.
{
  const cards = allIds.map((id) => {
    const meta = safeJson(path.join(recipesDir, id, 'recipe.json')) || {};
    return `<li><a href="./${id}/index.html"><strong>${meta.title || id}</strong></a> <span class="label">${(meta.tags || []).join(' · ')}${meta.tier ? ' · ' + meta.tier : ''}</span></li>`;
  });
  const html = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="theme-color" content="#f4f2ee"><title>awards recipes</title><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%231a1c1c'/%3E%3C/svg%3E"><link rel="stylesheet" href="./_shared/base.css"><style>ul{list-style:none;padding:0;margin:0}li{padding:.6rem 0;border-bottom:1px solid var(--line)}</style></head>\n<body><main class="wrap section"><p class="label">awards · recipes</p><h1 class="display" style="font-size:clamp(2rem,6vw,5rem)">Recipes</h1><ul>\n${cards.join('\n')}\n</ul></main></body></html>\n`;
  fs.writeFileSync(path.join(recipesDir, 'index.html'), html);
}

if (args.lock) await acquireLock(String(args.lock), 'verify lock');

// Windows runs npm and npx through .cmd shims, which Node (since 20.12.2) only spawns through a shell.
const win = process.platform === 'win32';
if (args.build !== false) {
  if (!fs.existsSync(path.join(recipesDir, 'node_modules'))) {
    console.log('installing recipe dependencies…');
    const i = spawnSync(win ? 'npm.cmd' : 'npm', ['install', '--no-audit', '--no-fund'], { cwd: recipesDir, stdio: 'inherit', shell: win });
    if (i.status !== 0) process.exit(1);
  }
  const env = only ? { ...process.env, AWARDS_RECIPES_ONLY: ids.join(',') } : process.env;
  const b = spawnSync(win ? 'npx.cmd' : 'npx', ['vite', 'build'], { cwd: recipesDir, stdio: 'pipe', encoding: 'utf8', shell: win, env });
  if (b.status !== 0) {
    console.error(b.stdout, b.stderr);
    process.exit(1);
  }
}

const found = resolvePlaywright();
if (!found) {
  console.error(MISSING_MESSAGE);
  process.exit(3);
}
const server = await serveDirectory(path.join(recipesDir, 'dist'));
const browser = await launchChromium(found.module).catch(async (e) => {
  console.error(`browser launch failed: ${String(e.message ?? e).split('\n')[0]}`);
  await server.close();
  process.exit(3);
});
// A probe that never answers (a page stuck in a loop) fails its state instead of hanging the whole run.
const within = (promise, ms, what) => {
  let timer;
  return Promise.race([promise, new Promise((_, no) => { timer = setTimeout(() => no(new Error(`${what} gave no answer in ${ms / 1000} s`)), ms); })]).finally(() => clearTimeout(timer));
};
const chromium = browser.version();
fs.mkdirSync(outDir, { recursive: true });
const report = { at: now(), chromium, recipes: {} };
let failed = 0;

const DEFAULT_STATES = [
  { name: 'top', scroll: 0 },
  { name: 'mid', scroll: 0.5 },
  { name: 'end', scroll: 1 },
  { name: 'rm', scroll: 0, reducedMotion: true },
  { name: 'mobile', scroll: 0, viewport: 'mobile' },
];

for (const id of ids) {
  const dir = path.join(recipesDir, id);
  let verify = {};
  if (fs.existsSync(path.join(dir, 'verify.mjs'))) verify = await import(pathToFileURL(path.join(dir, 'verify.mjs')).href);
  const states = verify.states || DEFAULT_STATES;
  const results = {};
  const rdir = path.join(outDir, id);
  fs.mkdirSync(rdir, { recursive: true });
  for (const st of states) {
    const vp = VIEWPORTS[st.viewport || 'desktop'];
    const isMobile = st.viewport === 'mobile';
    const context = await browser.newContext({ viewport: vp, isMobile, hasTouch: isMobile, deviceScaleFactor: 1, reducedMotion: st.reducedMotion ? 'reduce' : 'no-preference' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    try {
      await page.goto(`${server.url}${id}/index.html`, { waitUntil: 'load', timeout: 30000 });
      await page.evaluate(() => document.fonts?.ready).catch(() => {});
      await page.evaluate(() => Promise.race([window.__awards?.ready, new Promise((r) => setTimeout(r, 8000))])).catch(() => {});
      await page.waitForTimeout(st.settle ?? 500);
      await runActions(page, st.actions || []);
      if (typeof st.scroll === 'number') {
        await page.evaluate(async (p) => { await window.__awards?.scrollTo?.(p); window.ScrollTrigger?.update?.(); }, st.scroll);
        await page.waitForTimeout(st.settle ?? 500);
      }
      if (st.hover) await page.hover(st.hover).catch((e) => errors.push(`hover failed: ${e.message}`));
      if (st.hover) await page.waitForTimeout(400);
      const state = await page.evaluate(() => { try { return window.__awards?.state?.() ?? null; } catch (e) { return { error: String(e) }; } });
      const probe = verify.probe ? await within(page.evaluate(verify.probe), 30000, 'probe').catch((e) => ({ probeError: String(e) })) : null;
      // Optional Node-side look at the same page (accessibility tree, ARIA snapshot, CDP), after the in-page probe.
      const inspect = verify.inspect ? await within(verify.inspect(page, st), 30000, 'inspect').catch((e) => ({ inspectError: String(e) })) : null;
      // A probe or inspect that threw fails the state outright, whatever the recipe's assert checks.
      if (probe?.probeError) errors.push(`probe failed: ${probe.probeError}`);
      if (inspect?.inspectError) errors.push(`inspect failed: ${inspect.inspectError}`);
      const shot = path.join(rdir, `${st.name}.png`);
      await page.screenshot({ path: shot });
      results[st.name] = { state, probe, inspect, errors, screenshot: shot, hook: !!(await page.evaluate(() => !!window.__awards)) };
    } catch (e) {
      results[st.name] = { state: null, probe: null, inspect: null, errors: [...errors, `state failed: ${e.message}`], screenshot: null, hook: false };
    } finally {
      // A crashed page can make close() throw; that must fail this state, not abort the remaining recipes.
      await context.close().catch((e) => results[st.name]?.errors.push(`context close failed: ${e.message}`));
    }
  }
  // Pseudo-locale stress: German-length strings and a right-to-left page, on a phone, where overflow shows first.
  if (args.pseudo) {
    for (const dir of ['ltr', 'rtl']) {
      const name = `pseudo-${dir}`;
      const context = await browser.newContext({ viewport: VIEWPORTS.mobile, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      try {
        await page.goto(`${server.url}${id}/index.html`, { waitUntil: 'load', timeout: 30000 });
        await page.evaluate(() => Promise.race([window.__awards?.ready, new Promise((r) => setTimeout(r, 8000))])).catch(() => {});
        await page.waitForTimeout(500);
        const probe = await within(page.evaluate(pseudoLocalise, dir), 30000, 'pseudo').catch((e) => ({ error: String(e) }));
        await page.screenshot({ path: path.join(rdir, `${name}.png`) });
        results[name] = { state: null, probe, inspect: null, errors, screenshot: path.join(rdir, `${name}.png`), hook: true, pseudo: true };
      } catch (e) {
        results[name] = { state: null, probe: null, inspect: null, errors: [...errors, `state failed: ${e.message}`], screenshot: null, hook: true, pseudo: true };
      } finally { await context.close().catch(() => {}); }
    }
  }
  const checks = [];
  for (const [name, r] of Object.entries(results).filter(([, r]) => r.pseudo)) {
    const p = r.probe ?? {};
    checks.push({ ok: !p.error && !r.errors.length, message: `${name}: page survives lengthened text${p.error || r.errors.length ? ` — ${(p.error ?? r.errors[0]).slice(0, 120)}` : ''}` });
    checks.push({ ok: !p.overflow, message: `${name}: no horizontal overflow${p.overflow ? ` (${p.overflow} px wider than the viewport)` : ''}` });
    checks.push({ ok: !p.clipped?.length, message: `${name}: no control label cut off${p.clipped?.length ? ` — ${p.clipped.join(', ')}` : ''}` });
  }
  for (const [name, r] of Object.entries(results).filter(([, r]) => !r.pseudo)) {
    checks.push({ ok: r.errors.length === 0, message: `${name}: no page/console errors${r.errors.length ? ` — ${r.errors[0].slice(0, 140)}` : ''}` });
    checks.push({ ok: r.hook, message: `${name}: window.__awards hook present` });
  }
  if (verify.assert) {
    try {
      const extra = await verify.assert(Object.fromEntries(Object.entries(results).filter(([, r]) => !r.pseudo)));
      for (const c of extra || []) checks.push(c);
    } catch (e) {
      checks.push({ ok: false, message: `assert threw: ${e.message}` });
    }
  }
  const pass = checks.every((c) => c.ok);
  if (!pass) failed++;
  report.recipes[id] = { pass, checks, states: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, { state: v.state, probe: v.probe, inspect: v.inspect, errors: v.errors, screenshot: v.screenshot }])) };
  // Stamping rewrites tracked files, so it happens only when asked: a release pass, not every local run.
  if (pass && args.stamp) {
    const metaPath = path.join(dir, 'recipe.json');
    const meta = safeJson(metaPath) || { id };
    meta.verified = { date: now().slice(0, 10), chromium };
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
  }
  if (!args.json) {
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${id}`);
    for (const c of checks.filter((c) => !c.ok)) console.log(`      ✗ ${c.message}`);
  }
}

await browser.close();
await server.close();
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
if (args.json) console.log(JSON.stringify(report, null, 2));
else console.log(`\n${ids.length - failed}/${ids.length} recipes pass · report: ${path.join(outDir, 'report.json')}`);
process.exit(failed ? 2 : 0);

// Runs in the page: every text node lengthened by about 40 % with accented letters (words keep their breaks,
// so wrapping still works), the direction set, then the overflow the result causes.
function pseudoLocalise(dir) {
  const map = { a: 'á', e: 'ë', i: 'ï', o: 'ö', u: 'ü', c: 'ç', n: 'ñ', A: 'Å', E: 'É', O: 'Ø', U: 'Û' };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement?.closest('script,style,noscript,svg,canvas,[aria-hidden="true"] canvas') ? NodeFilter.FILTER_REJECT : n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) n.textContent = n.textContent.replace(/[A-Za-z]{2,}/g, (w) => w.replace(/[aeioucnAEOU]/g, (c) => map[c] ?? c) + 'ẍ'.repeat(Math.ceil(w.length * 0.4)));
  document.documentElement.dir = dir;
  window.dispatchEvent(new Event('resize'));
  return new Promise((resolve) => setTimeout(() => {
    const doc = document.documentElement;
    const overflow = Math.max(0, doc.scrollWidth - doc.clientWidth - 1);
    const clipped = [...document.querySelectorAll('button, a, label, [role="tab"], summary')]
      .filter((el) => { const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return b.width > 2 && b.height > 2 && s.visibility !== 'hidden' && s.clip === 'auto' && s.clipPath === 'none' && (s.overflow !== 'visible' || s.textOverflow === 'ellipsis' || s.whiteSpace === 'nowrap') && el.scrollWidth > el.clientWidth + 1; })
      .slice(0, 5).map((el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.split(/\s+/)[0] : ''}`);
    resolve({ overflow, clipped, texts: nodes.length });
  }, 800));
}

function safeJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}
