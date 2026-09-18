#!/usr/bin/env node
// Build the recipes (Vite MPA), serve dist/, drive every recipe through its declared states in headless Chromium
// (WebGL via SwiftShader), run the recipe's probe/assert, capture screenshots, write a report and stamp recipe.json.
// Usage: node verify-recipes.mjs [--only id,id] [--out <dir>] [--no-build] [--json]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs, fmtTable, now } from './lib/report.mjs';
import { resolvePlaywright, launchChromium, MISSING_MESSAGE } from './lib/playwright.mjs';
import { serveDirectory } from './lib/server.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const recipesDir = path.resolve(here, '../recipes');
const args = parseArgs(process.argv.slice(2), { build: 'boolean', json: 'boolean' });
const only = args.only ? new Set(String(args.only).split(',').map((s) => s.trim())) : null;
const outDir = path.resolve(args.out ?? path.join(recipesDir, '_verify'));
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };

const ids = fs.readdirSync(recipesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !['node_modules', 'dist'].includes(d.name) && fs.existsSync(path.join(recipesDir, d.name, 'index.html')))
  .map((d) => d.name)
  .filter((id) => !only || only.has(id));
if (!ids.length) {
  console.error('no recipes found');
  process.exit(1);
}

// Regenerate the gallery index from recipe.json files.
{
  const cards = ids.map((id) => {
    const meta = safeJson(path.join(recipesDir, id, 'recipe.json')) || {};
    return `<li><a href="./${id}/index.html"><strong>${meta.title || id}</strong></a> <span class="label">${(meta.tags || []).join(' · ')}${meta.tier ? ' · ' + meta.tier : ''}</span></li>`;
  });
  const html = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><title>awards recipes</title><link rel="stylesheet" href="./_shared/base.css"><style>ul{list-style:none;padding:0;margin:0}li{padding:.6rem 0;border-bottom:1px solid var(--line)}</style></head>\n<body><main class="wrap section"><p class="label">awards · recipes</p><h1 class="display" style="font-size:clamp(2rem,6vw,5rem)">Recipes</h1><ul>\n${cards.join('\n')}\n</ul></main></body></html>\n`;
  fs.writeFileSync(path.join(recipesDir, 'index.html'), html);
}

if (args.build !== false) {
  if (!fs.existsSync(path.join(recipesDir, 'node_modules'))) {
    console.log('installing recipe dependencies…');
    const i = spawnSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: recipesDir, stdio: 'inherit' });
    if (i.status !== 0) process.exit(1);
  }
  const b = spawnSync('npx', ['vite', 'build'], { cwd: recipesDir, stdio: 'pipe', encoding: 'utf8' });
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
const browser = await launchChromium(found.module);
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
      for (const action of st.actions || []) {
        if (action.type === 'hover') await page.hover(action.selector).catch((e) => errors.push(`hover failed: ${e.message}`));
        if (action.type === 'click') await page.click(action.selector).catch((e) => errors.push(`click failed: ${e.message}`));
        if (action.type === 'press') await page.keyboard.press(action.key);
        if (action.type === 'move') await page.mouse.move(action.x, action.y, { steps: action.steps || 8 });
        if (action.type === 'down') await page.mouse.down();
        if (action.type === 'up') await page.mouse.up();
        if (action.type === 'wheel') await page.mouse.wheel(action.dx || 0, action.dy || 0);
        if (action.type === 'wait') await page.waitForTimeout(action.ms || 300);
        if (action.type === 'focus') await page.focus(action.selector).catch((e) => errors.push(`focus failed: ${e.message}`));
      }
      if (typeof st.scroll === 'number') {
        await page.evaluate(async (p) => { await window.__awards?.scrollTo?.(p); window.ScrollTrigger?.update?.(); }, st.scroll);
        await page.waitForTimeout(st.settle ?? 500);
      }
      if (st.hover) await page.hover(st.hover).catch((e) => errors.push(`hover failed: ${e.message}`));
      if (st.hover) await page.waitForTimeout(400);
      const state = await page.evaluate(() => { try { return window.__awards?.state?.() ?? null; } catch (e) { return { error: String(e) }; } });
      const probe = verify.probe ? await page.evaluate(verify.probe).catch((e) => ({ probeError: String(e) })) : null;
      const shot = path.join(rdir, `${st.name}.png`);
      await page.screenshot({ path: shot });
      results[st.name] = { state, probe, errors, screenshot: shot, hook: !!(await page.evaluate(() => !!window.__awards)) };
    } catch (e) {
      results[st.name] = { state: null, probe: null, errors: [...errors, `state failed: ${e.message}`], screenshot: null, hook: false };
    } finally {
      await context.close();
    }
  }
  const checks = [];
  for (const [name, r] of Object.entries(results)) {
    checks.push({ ok: r.errors.length === 0, message: `${name}: no page/console errors${r.errors.length ? ` — ${r.errors[0].slice(0, 140)}` : ''}` });
    checks.push({ ok: r.hook, message: `${name}: window.__awards hook present` });
  }
  if (verify.assert) {
    try {
      const extra = await verify.assert(results);
      for (const c of extra || []) checks.push(c);
    } catch (e) {
      checks.push({ ok: false, message: `assert threw: ${e.message}` });
    }
  }
  const pass = checks.every((c) => c.ok);
  if (!pass) failed++;
  report.recipes[id] = { pass, checks, states: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, { state: v.state, probe: v.probe, errors: v.errors, screenshot: v.screenshot }])) };
  if (pass) {
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

function safeJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}
