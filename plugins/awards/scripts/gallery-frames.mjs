#!/usr/bin/env node
// One frame per recipe for the gallery page (recipes/index.html): each entry rendered from the recipes' own Vite
// build in headless Chromium (SwiftShader WebGL, as verify-recipes runs them) at the verifier's desktop size,
// encoded to WebP through the browser's canvas encoder, written to recipes/_gallery/frames/<id>.webp and listed
// with the state it shows in recipes/_gallery/frames.json. The frames are the plugin's own MIT work.
//
// Which state is shown: from the recipe's verify.mjs states, keep those a visitor would see on a desktop at full
// motion (no `viewport: 'mobile'`, no `reducedMotion`, none named for a degraded tier or a teardown check), then take
// the first with a scroll fraction strictly between 0 and 1 (the effect under way), else the first of those, else the
// first state. OVERRIDES names the recipes whose resting state shows only their heading; a state marked `frame: true`
// in verify.mjs wins over both.
// Every run also redraws recipes/_gallery/sheet.webp, all frames as small tiles in one image, for the index's overview.
//
// Usage: node scripts/gallery-frames.mjs [--only id,…] [--drafts] [--no-build] [--json]
//   --only      render just these entries (the others keep their frames)
//   --drafts    render the drafts instead (recipes/_drafts/<id>/frame.webp, listed under `drafts` in frames.json; the
//               contact sheet is left alone, since a draft is not in the catalogue)
//   --no-build  use recipes/dist as it is
// Exit: 0 written · 1 usage or build failure · 2 some frames failed (the rest are written) · 3 no browser
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from './lib/report.mjs';
import { serveDirectory } from './lib/server.mjs';
import { runActions } from './lib/actions.mjs';
import { resolvePlaywright, launchChromium, MISSING_MESSAGE } from './lib/playwright.mjs';
import { draftIds, draftDir } from './lib/drafts.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const recipesDir = path.resolve(here, '../recipes');
const outDir = path.join(recipesDir, '_gallery', 'frames');
const dataFile = path.join(recipesDir, '_gallery', 'frames.json');
const distDir = path.join(recipesDir, 'dist');

export const VIEWPORT = { width: 1440, height: 900 };
const FRAME = { width: 800, height: 500 };
const MAX_BYTES = 40 * 1024;
const TILE = { width: 160, height: 100 };
const SHEET_COLS = 15;
const QUALITIES = [0.8, 0.72, 0.64, 0.56, 0.48, 0.4, 0.32];
const PER_RECIPE_MS = 60000;
const DEGRADED = /^(rm|reduced|static|fallback|nogl|offscreen|hidden|teardown|crash|forced|retier)(-|$)/;
const OVERRIDES = {
  'designed-footer': 'desktop-end',
  'hover-preview-list': 'follow',
  'magnetic-button': 'pull',
  'physics-pile-matter': 'settled',
  'gl-arc-length-mask-reveal': 'half',
  'svg-goo-line-reveal': 'mid',
  'title-mask-tunnel': 'mid',
  'clip-path-scrub-door': 'mid',
  'cursor-two-speed': 'hover',
  'custom-ease-house-defaults': 'played',
  'gl-swarm-light-field': 'footer',
  'gl-screen-paint-distortion': 'paint',
  'gl-grade-pass-scene-cuts': 'iris',
  'gl-dom-refraction-lens': 'hero',
  'gl-pointer-wake-reveal': 'wake',
  'point-cloud-shape-morph': 'shape1',
  'gl-video-dither-layers': 'glyphs',
  'gl-dither-scene-pool': 'seasons',
  'dither-cell-transition': 'sweep',
  'footer-credits-hinge': 'open',
  'overprint-marker-index': 'hover',
  'next-case-handoff': 'footer',
  'webcodecs-frame-scrub': 'frame',
};

export function pickState(id, states) {
  // A verifier can name its own frame with `frame: true` on one state (drafts use this; OVERRIDES predates it).
  const flagged = states.find((s) => s.frame === true);
  if (flagged) return flagged;
  if (OVERRIDES[id]) {
    const named = states.find((s) => s.name === OVERRIDES[id]);
    if (named) return named;
  }
  const desktop = states.filter((s) => (!s.viewport || s.viewport === 'desktop') && !s.reducedMotion && !DEGRADED.test(s.name));
  return desktop.find((s) => typeof s.scroll === 'number' && s.scroll > 0 && s.scroll < 1) ?? desktop[0] ?? states[0];
}

// Runs in the page: decode the PNG once, then one WebP per quality.
async function encodeInPage({ src, width, height, qualities }) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);
  return qualities.map((q) => {
    const url = canvas.toDataURL('image/webp', q);
    if (!url.startsWith('data:image/webp')) throw new Error('this Chromium has no WebP encoder');
    return url.slice(url.indexOf(',') + 1);
  });
}

async function encode(page, png) {
  const out = await page.evaluate(encodeInPage, { src: `data:image/png;base64,${png.toString('base64')}`, ...FRAME, qualities: QUALITIES });
  const bufs = out.map((b) => Buffer.from(b, 'base64'));
  const i = bufs.findIndex((b) => b.length <= MAX_BYTES);
  return i === -1 ? { buf: bufs.at(-1), over: true } : { buf: bufs[i], over: false };
}

// Runs in the page: every frame drawn small, left to right and top to bottom, into one image.
async function sheetInPage({ srcs, tile, cols, quality }) {
  const rows = Math.ceil(srcs.length / cols);
  const canvas = document.createElement('canvas');
  canvas.width = tile.width * cols;
  canvas.height = tile.height * rows;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  for (const [i, src] of srcs.entries()) {
    const img = new Image();
    img.src = src;
    await img.decode();
    ctx.drawImage(img, (i % cols) * tile.width, Math.floor(i / cols) * tile.height, tile.width, tile.height);
  }
  const url = canvas.toDataURL('image/webp', quality);
  return url.slice(url.indexOf(',') + 1);
}

async function shoot(browser, server, page_, st) {
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  let timer;
  try {
    const run = (async () => {
      await page.goto(`${server.url}${page_}`, { waitUntil: 'load', timeout: 30000 });
      await page.evaluate(() => document.fonts?.ready).catch(() => {});
      await page.evaluate(() => Promise.race([Promise.resolve(window.__awards?.ready), new Promise((r) => setTimeout(r, 8000))])).catch(() => {});
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
      return page.screenshot();
    })();
    run.catch(() => {});
    const png = await Promise.race([run, new Promise((_, no) => { timer = setTimeout(() => no(new Error(`no frame in ${PER_RECIPE_MS / 1000} s`)), PER_RECIPE_MS); })]);
    return { png, errors };
  } finally {
    clearTimeout(timer);
    await context.close().catch(() => {});
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2), { json: 'boolean', build: 'boolean', drafts: 'boolean' });
  const drafts = Boolean(args.drafts);
  const allIds = drafts ? draftIds() : fs.readdirSync(recipesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !['node_modules', 'dist'].includes(d.name) && fs.existsSync(path.join(recipesDir, d.name, 'recipe.json')))
    .map((d) => d.name).sort();
  const only = args.only ? String(args.only).split(',').map((s) => s.trim()).filter(Boolean) : null;
  const unknown = (only ?? []).filter((id) => !allIds.includes(id));
  if (unknown.length) { console.error(`unknown ${drafts ? 'draft' : 'recipe'}(s): ${unknown.join(', ')}`); process.exit(1); }
  const ids = only ?? allIds;
  if (!ids.length) { console.error(drafts ? 'no drafts in recipes/_drafts' : 'no recipes'); process.exit(1); }
  const dirOf = (id) => (drafts ? draftDir(id) : path.join(recipesDir, id));
  const pageOf = (id) => (drafts ? `_drafts/${id}/index.html` : `${id}/index.html`);
  const fileOf = (id) => (drafts ? path.join(draftDir(id), 'frame.webp') : path.join(outDir, `${id}.webp`));
  const log = (s) => { if (!args.json) console.log(s); };

  if (args.build !== false) {
    log('building the recipes…');
    const win = process.platform === 'win32';
    const env = only || drafts ? { ...process.env, AWARDS_RECIPES_ONLY: ids.join(',') } : process.env;
    const b = spawnSync(win ? 'npx.cmd' : 'npx', ['vite', 'build'], { cwd: recipesDir, stdio: 'pipe', encoding: 'utf8', shell: win, env });
    if (b.status !== 0) { console.error(b.stdout, b.stderr); process.exit(1); }
  }
  const found = resolvePlaywright(recipesDir);
  if (!found) { console.error(MISSING_MESSAGE); process.exit(3); }

  const previous = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : { frames: {} };
  const frames = { ...(drafts ? previous.drafts : previous.frames) };
  const failed = [];
  fs.mkdirSync(outDir, { recursive: true });
  const server = await serveDirectory(distDir);
  let browser;
  try {
    browser = await launchChromium(found.module, { webgl: true });
  } catch (e) {
    console.error(`browser launch failed: ${String(e.message ?? e).split('\n')[0]}`);
    await server.close();
    process.exit(3);
  }
  const encoder = await browser.newPage();
  const today = new Date().toISOString().slice(0, 10);
  for (const id of ids) {
    const verify = await import(pathToFileURL(path.join(dirOf(id), 'verify.mjs')).href).catch(() => ({}));
    const states = verify.states?.length ? verify.states : [{ name: 'top', scroll: 0 }];
    const st = pickState(id, states);
    try {
      const shot = await shoot(browser, server, pageOf(id), st);
      const { buf, over } = await encode(encoder, shot.png);
      fs.writeFileSync(fileOf(id), buf);
      frames[id] = { state: st.name, scroll: typeof st.scroll === 'number' ? st.scroll : null, captured: today, bytes: buf.length };
      log(`${over ? 'OVER' : 'ok  '}  ${id.padEnd(34)} ${st.name.padEnd(14)} ${(buf.length / 1024).toFixed(1).padStart(5)} KB${shot.errors.length ? `  ${shot.errors.length} page error(s): ${shot.errors[0].slice(0, 80)}` : ''}`);
    } catch (e) {
      failed.push(id);
      log(`FAIL  ${id.padEnd(34)} ${st.name.padEnd(14)} ${String(e.message).split('\n')[0]}`);
    }
  }
  if (drafts) {
    await browser.close();
    await server.close();
    for (const id of Object.keys(frames)) if (!allIds.includes(id)) delete frames[id];
    const sorted = Object.fromEntries(Object.keys(frames).sort().map((id) => [id, frames[id]]));
    fs.writeFileSync(dataFile, JSON.stringify({ ...previous, drafts: sorted }, null, 2) + '\n');
    if (args.json) console.log(JSON.stringify({ rendered: ids.length - failed.length, failed }));
    else log(`\n${ids.length - failed.length}/${ids.length} draft frame(s) rendered${failed.length ? ` · failed: ${failed.join(', ')}` : ''}`);
    process.exit(failed.length ? 2 : 0);
  }
  const sheetIds = Object.keys(frames).filter((id) => allIds.includes(id) && fs.existsSync(path.join(outDir, `${id}.webp`))).sort();
  const srcs = sheetIds.map((id) => `data:image/webp;base64,${fs.readFileSync(path.join(outDir, `${id}.webp`)).toString('base64')}`);
  const sheet = Buffer.from(await encoder.evaluate(sheetInPage, { srcs, tile: TILE, cols: SHEET_COLS, quality: 0.72 }), 'base64');
  fs.writeFileSync(path.join(recipesDir, '_gallery', 'sheet.webp'), sheet);
  log(`sheet: ${sheetIds.length} tiles, ${(sheet.length / 1024).toFixed(0)} KB`);
  await browser.close();
  await server.close();

  // Frames of recipes that no longer exist go with their entries.
  for (const id of Object.keys(frames)) if (!allIds.includes(id)) delete frames[id];
  for (const f of fs.readdirSync(outDir)) if (f.endsWith('.webp') && !allIds.includes(f.slice(0, -5))) fs.rmSync(path.join(outDir, f));
  const sorted = Object.fromEntries(Object.keys(frames).sort().map((id) => [id, frames[id]]));
  const total = Object.values(sorted).reduce((n, f) => n + f.bytes, 0);
  const sheetInfo = { file: 'sheet.webp', tile: TILE, cols: SHEET_COLS, rows: Math.ceil(sheetIds.length / SHEET_COLS), ids: sheetIds };
  fs.writeFileSync(dataFile, JSON.stringify({ generator: 'scripts/gallery-frames.mjs', viewport: VIEWPORT, frame: FRAME, total, sheet: sheetInfo, frames: sorted, ...(previous.drafts ? { drafts: previous.drafts } : {}) }, null, 2) + '\n');
  if (args.json) console.log(JSON.stringify({ rendered: ids.length - failed.length, failed, total }));
  else log(`\n${ids.length - failed.length}/${ids.length} rendered · ${Object.keys(sorted).length} frames · ${(total / 1024).toFixed(0)} KB in all${failed.length ? ` · failed: ${failed.join(', ')}` : ''}`);
  process.exit(failed.length ? 2 : 0);
}
