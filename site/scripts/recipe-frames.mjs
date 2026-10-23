#!/usr/bin/env node
// One representative frame per plugin recipe, for /recipes: each entry of plugins/awards/recipes/*/recipe.json
// rendered from the recipes' own Vite build in headless Chromium (SwiftShader WebGL, as verify-recipes runs them),
// encoded to WebP through the browser's canvas encoder, and listed with its catalogue facts in src/data/recipes.json.
// The frames are the plugin's own MIT work (logged as owned in .awards/assets.json).
//
// Which state is shown (the rule): from the recipe's verify.mjs states, keep those a visitor would see on a
// desktop at full motion — no `viewport: 'mobile'`, no `reducedMotion`, and none named for a degraded tier or a
// teardown check (rm, reduced…, static…, fallback, nogl, offscreen, hidden, teardown, crash, forced, retier).
// Take the first of those with a scroll fraction strictly between 0 and 1 (the effect under way; a state at 1 is
// usually the page's empty tail), else the first of those, else the recipe's first state. RULE_OVERRIDES below
// names the few recipes whose resting first state shows only their heading, with the state that shows the effect.
//
// Usage: node scripts/recipe-frames.mjs [--only id,…] [--no-build] [--json]
//   --only      render just these entries (the rest keep their earlier frames in recipes.json)
//   --no-build  use recipes/dist as it is, even when it is missing entries or older than the sources
// Exit: 0 written · 1 usage or build failure · 2 some frames failed (the rest are written) · 3 no browser
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { parseArgs } from '../../plugins/awards/scripts/lib/report.mjs';
import { serveDirectory } from '../../plugins/awards/scripts/lib/server.mjs';
import { runActions } from '../../plugins/awards/scripts/lib/actions.mjs';
import { siteRoot, pluginRoot, recipesDir, openBrowser, encodeWebp, posix } from './lib/webp.mjs';

const VIEWPORT = { width: 1280, height: 800 };
const FRAME = { width: 640, height: 400 };
const MAX_BYTES = 40 * 1024;
const TOTAL_BUDGET = 3 * 1024 * 1024;
const QUALITIES = [0.82, 0.74, 0.66, 0.58, 0.5, 0.42, 0.34];
const PER_RECIPE_MS = 60000;
const DEGRADED = /^(rm|reduced|static|fallback|nogl|offscreen|hidden|teardown|crash|forced|retier)(-|$)/;
// Recipes where the rule above lands on a frame that does not show the recipe: state name and why.
const RULE_OVERRIDES = {
  'designed-footer': { state: 'desktop-end', why: 'the footer is the recipe; mid-page shows the content above it' },
  'hover-preview-list': { state: 'follow', why: 'at rest the list shows no preview' },
  'magnetic-button': { state: 'pull', why: 'at rest the button sits still' },
  'physics-pile-matter': { state: 'settled', why: 'at load the drawer has not tipped out yet' },
  'gl-arc-length-mask-reveal': { state: 'half', why: 'at load no branch is drawn' },
  'svg-goo-line-reveal': { state: 'mid', why: 'the reveal under way' },
  'title-mask-tunnel': { state: 'mid', why: 'at rest the title has not entered the tunnel' },
  'clip-path-scrub-door': { state: 'mid', why: 'the door half open' },
  'cursor-two-speed': { state: 'hover', why: 'the badge only shows over a target' },
  'custom-ease-house-defaults': { state: 'played', why: 'the curves only draw once played' },
};

const args = parseArgs(process.argv.slice(2), { json: 'boolean', build: 'boolean' });
const outPublic = path.join(siteRoot, 'public', 'recipes');
const dataFile = path.join(siteRoot, 'src', 'data', 'recipes.json');
const distDir = path.join(recipesDir, 'dist');

const allIds = fs.readdirSync(recipesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !['node_modules', 'dist'].includes(d.name) && fs.existsSync(path.join(recipesDir, d.name, 'recipe.json')))
  .map((d) => d.name)
  .sort();
const only = args.only ? String(args.only).split(',').map((s) => s.trim()).filter(Boolean) : null;
if (only) {
  const unknown = only.filter((id) => !allIds.includes(id));
  if (unknown.length) { console.error(`unknown recipe(s): ${unknown.join(', ')}`); process.exit(1); }
}
const ids = only ?? allIds;
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const log = (s) => { if (!args.json) console.log(s); };

function pickState(states) {
  const desktop = states.filter((s) => (!s.viewport || s.viewport === 'desktop') && !s.reducedMotion && !DEGRADED.test(s.name));
  return desktop.find((s) => typeof s.scroll === 'number' && s.scroll > 0 && s.scroll < 1) ?? desktop[0] ?? states[0];
}

// --- build -------------------------------------------------------------------------------------------------------

function newest(dir, skip = () => false) {
  let t = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (skip(ent.name)) continue;
    t = Math.max(t, ent.isDirectory() ? newest(p, skip) : fs.statSync(p).mtimeMs);
  }
  return t;
}

// The build is stale when an entry is missing from dist/ or a file it is built from changed after it.
function staleBuild() {
  const built = ids.map((id) => path.join(distDir, id, 'index.html'));
  const missing = ids.filter((id, i) => !fs.existsSync(built[i]));
  if (missing.length) return `${missing.length} entr${missing.length === 1 ? 'y' : 'ies'} missing from recipes/dist`;
  const builtAt = Math.min(...built.map((f) => fs.statSync(f).mtimeMs));
  const notBuilt = new Set(['README.md', 'recipe.json', 'verify.mjs']);
  const sources = Math.max(
    ...ids.map((id) => newest(path.join(recipesDir, id), (n) => notBuilt.has(n))),
    newest(path.join(recipesDir, '_shared')),
    ...['vite.config.mjs', 'package-lock.json'].map((f) => fs.statSync(path.join(recipesDir, f)).mtimeMs),
  );
  return sources > builtAt ? 'recipe sources are newer than recipes/dist' : null;
}

function build() {
  const reason = staleBuild();
  if (!reason) return log('recipes/dist is current');
  if (args.build === false) return log(`warning: ${reason}; --no-build keeps it`);
  log(`building the recipes (${reason})…`);
  const win = process.platform === 'win32';
  // The same build verify-recipes runs; with --only, dist/ then holds just those entries.
  const env = only ? { ...process.env, AWARDS_RECIPES_ONLY: ids.join(',') } : process.env;
  const b = spawnSync(win ? 'npx.cmd' : 'npx', ['vite', 'build'], { cwd: recipesDir, stdio: 'pipe', encoding: 'utf8', shell: win, env });
  if (b.status !== 0) {
    console.error(b.stdout, b.stderr);
    process.exit(1);
  }
  const still = staleBuild();
  if (still) { console.error(`after the build: ${still}`); process.exit(1); }
}

// --- render ------------------------------------------------------------------------------------------------------

// Runs in the page: how flat a frame is, from a 64 × 40 copy (luminance spread and the share of the commonest colour).
async function flatness(src) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = 64; c.height = 40;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, 64, 40);
  const d = ctx.getImageData(0, 0, 64, 40).data;
  const lum = [];
  const counts = new Map();
  for (let i = 0; i < d.length; i += 4) {
    lum.push(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]);
    const key = (d[i] >> 3) << 10 | (d[i + 1] >> 3) << 5 | (d[i + 2] >> 3);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const mean = lum.reduce((a, b) => a + b, 0) / lum.length;
  const sd = Math.sqrt(lum.reduce((a, b) => a + (b - mean) ** 2, 0) / lum.length);
  return { sd: Math.round(sd * 10) / 10, dominant: Math.round((Math.max(...counts.values()) / lum.length) * 100) / 100 };
}

async function shoot(browser, server, id, st) {
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, reducedMotion: st.reducedMotion ? 'reduce' : 'no-preference', ...(st.viewport === 'mobile' ? { isMobile: true, hasTouch: true } : {}) });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  let timer;
  try {
    const run = (async () => {
      await page.goto(`${server.url}${id}/index.html`, { waitUntil: 'load', timeout: 30000 });
      await page.evaluate(() => document.fonts?.ready).catch(() => {});
      const ready = await page.evaluate(() => Promise.race([Promise.resolve(window.__awards?.ready).then(() => !!window.__awards), new Promise((r) => setTimeout(() => r(false), 8000))])).catch(() => false);
      await page.waitForTimeout(st.settle ?? 500);
      await runActions(page, st.actions || []);
      if (typeof st.scroll === 'number') {
        await page.evaluate(async (p) => { await window.__awards?.scrollTo?.(p); window.ScrollTrigger?.update?.(); }, st.scroll);
        await page.waitForTimeout(st.settle ?? 500);
      }
      if (st.hover) {
        await page.hover(st.hover).catch((e) => errors.push(`hover failed: ${e.message}`));
        await page.waitForTimeout(400);
      }
      return { png: await page.screenshot(), ready };
    })();
    run.catch(() => {}); // a run abandoned at the timeout rejects when its context closes
    const out = await Promise.race([run, new Promise((_, no) => { timer = setTimeout(() => no(new Error(`no frame in ${PER_RECIPE_MS / 1000} s`)), PER_RECIPE_MS); })]);
    return { ...out, errors };
  } finally {
    clearTimeout(timer);
    await context.close().catch(() => {});
  }
}

// The best quality that fits the per-frame budget.
async function encode(page, png) {
  const bufs = await encodeWebp(page, png, QUALITIES.map((quality) => ({ ...FRAME, quality })));
  const i = bufs.findIndex((b) => b.length <= MAX_BYTES);
  return i === -1 ? { buf: bufs.at(-1), quality: QUALITIES.at(-1), over: true } : { buf: bufs[i], quality: QUALITIES[i], over: false };
}

// --- main --------------------------------------------------------------------------------------------------------

const recipeFacts = (id) => {
  const r = readJson(path.join(recipesDir, id, 'recipe.json'));
  return { id, title: r.title ?? id, group: r.group ?? null, summary: r.summary ?? null, tags: r.tags ?? [], tier: r.tier ?? null, verified: r.verified?.date ?? null };
};

build();
const previous = fs.existsSync(dataFile) ? readJson(dataFile) : null;
const earlier = new Map((previous?.recipes ?? []).map((r) => [r.id, r]));
fs.mkdirSync(outPublic, { recursive: true });

let browser;
const server = await serveDirectory(distDir);
const rendered = new Map();
const failed = [];
const flat = [];
const today = new Date().toISOString().slice(0, 10);
try {
  browser = await openBrowser({ webgl: true });
  const encoder = await browser.newPage();
  for (const id of ids) {
    const verify = await import(pathToFileURL(path.join(recipesDir, id, 'verify.mjs')).href).catch(() => ({}));
    const states = verify.states?.length ? verify.states : [{ name: 'top', scroll: 0 }];
    const override = RULE_OVERRIDES[id] ? states.find((s) => s.name === RULE_OVERRIDES[id].state) : null;
    if (RULE_OVERRIDES[id] && !override) log(`warning: ${id} has no state "${RULE_OVERRIDES[id].state}" any more; the rule picks instead`);
    const st = override ?? pickState(states);
    try {
      const shot = await shoot(browser, server, id, st);
      const { buf, quality, over } = await encode(encoder, shot.png);
      const stats = await encoder.evaluate(flatness, `data:image/png;base64,${shot.png.toString('base64')}`);
      fs.writeFileSync(path.join(outPublic, `${id}.webp`), buf);
      rendered.set(id, { state: st.name, quality, bytes: buf.length, over, errors: shot.errors, ready: shot.ready, stats });
      if (stats.sd < 6 || stats.dominant > 0.9) flat.push(`${id} (${st.name}: sd ${stats.sd}, ${Math.round(stats.dominant * 100)} % one colour)`);
      log(`${over ? 'OVER' : 'ok  '}  ${id.padEnd(34)} ${st.name.padEnd(14)} q${quality} ${(buf.length / 1024).toFixed(1).padStart(5)} KB${shot.errors.length ? `  ${shot.errors.length} page error(s): ${shot.errors[0].slice(0, 80)}` : ''}${shot.ready ? '' : '  (no __awards.ready)'}`);
    } catch (e) {
      failed.push({ id, state: st.name, error: String(e.message).split('\n')[0] });
      log(`FAIL  ${id.padEnd(34)} ${st.name.padEnd(14)} ${String(e.message).split('\n')[0]}`);
    }
  }
} catch (e) {
  console.error(e.message);
  await server.close();
  process.exit(e.exitCode ?? 1);
} finally {
  if (browser) await browser.close();
}
await server.close();

// Every catalogue entry is listed; an entry not rendered this run keeps the frame it had, when that file still exists.
const groupsVocab = readJson(path.join(pluginRoot, 'scripts', 'data', 'recipe-tags.json')).groups ?? {};
const recipes = allIds.map((id) => {
  const facts = recipeFacts(id);
  const r = rendered.get(id);
  const prev = earlier.get(id);
  const file = path.join(outPublic, `${id}.webp`);
  const frame = r
    ? { src: posix(path.relative(path.join(siteRoot, 'public'), file)), width: FRAME.width, height: FRAME.height, bytes: r.bytes }
    : prev?.frame && fs.existsSync(path.join(siteRoot, 'public', prev.frame.src)) ? prev.frame : null;
  const state = r ? r.state : frame ? prev.state : null;
  return {
    ...facts,
    frame,
    state,
    capturedAt: r ? today : frame ? prev.capturedAt : null,
    alt: frame ? `Frame of the recipe "${facts.title}" in headless Chromium at ${VIEWPORT.width} × ${VIEWPORT.height}, state "${state}".` : null,
  };
});
const total = recipes.reduce((n, r) => n + (r.frame?.bytes ?? 0), 0);
const data = {
  schema: 1,
  generator: 'scripts/recipe-frames.mjs',
  source: 'plugins/awards/recipes/*/recipe.json',
  publicBase: 'paths are relative to public/',
  count: recipes.length,
  verified: recipes.filter((r) => r.verified).length,
  groups: Object.entries(groupsVocab).map(([id, g]) => ({ id, title: g.title ?? id, count: recipes.filter((r) => r.group === id).length })),
  capture: { viewport: VIEWPORT, frame: FRAME, maxBytes: MAX_BYTES, rule: 'first desktop full-motion state with a scroll fraction strictly between 0 and 1, else the first such state, else the first state; degraded tiers and teardown checks are skipped', overrides: RULE_OVERRIDES },
  totalBytes: total,
  recipes,
};
fs.mkdirSync(path.dirname(dataFile), { recursive: true });
fs.writeFileSync(dataFile, JSON.stringify(data, null, 2) + '\n');

// Frames of recipes that no longer exist.
if (!only) for (const f of fs.readdirSync(outPublic)) if (f.endsWith('.webp') && !allIds.includes(f.replace(/\.webp$/, ''))) fs.rmSync(path.join(outPublic, f));

if (args.json) console.log(JSON.stringify({ ...data, rendered: Object.fromEntries(rendered), failed, flat }, null, 2));
else {
  console.log(`\n${rendered.size}/${ids.length} rendered · ${recipes.filter((r) => r.frame).length}/${recipes.length} with a frame · ${(total / 1024).toFixed(0)} KB in all${total > TOTAL_BUDGET ? ` — over the ${TOTAL_BUDGET / 1024 / 1024} MB budget` : ''}`);
  if (flat.length) console.log(`nearly flat (look at these): ${flat.join('; ')}`);
  const over = [...rendered].filter(([, r]) => r.over).map(([id]) => id);
  if (over.length) console.log(`over ${MAX_BYTES / 1024} KB at the lowest quality: ${over.join(', ')}`);
  for (const f of failed) console.log(`failed: ${f.id} (${f.state}): ${f.error}`);
  console.log(`wrote ${posix(path.relative(process.cwd(), dataFile))} and ${posix(path.relative(process.cwd(), outPublic))}/`);
}
process.exit(failed.length ? 2 : 0);
