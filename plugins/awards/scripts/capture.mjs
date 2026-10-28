#!/usr/bin/env node
// Capture desktop / tablet / mobile / scroll-state / reduced-motion screenshots of a page or component for review.
// Usage: node capture.mjs <url|file|dir> [--out .awards/captures] [--desktop 1440x900] [--tablet 834x1194 | --no-tablet]
//   [--mobile 390x844] [--only desktop|tablet|mobile] [--scroll 0,50,100] [--reduced-motion] [--full-page]
//   [--selector <css>] [--hover <css>] [--wait <ms>] [--wait-for <css>] [--no-webgl] [--json] [--name <prefix>]
//   [--timeout <ms>] [--wheel <px>] [--states <json-file>] — additional named checkpoints: [{ name, actions, selector? }]
//   [--timeline 0,400,1200] desktop frames at those milliseconds of page time, the page clock held still between them
//   [--video] a webm of a real-time desktop scroll pass · [--throttle] phone pass at 4x CPU and slow 4G
//   [--gpu [--headed]] a hardware-GPU run that refuses SwiftShader and records frame times
//   [--baseline <earlier capture dir>] per-frame pixel difference against an earlier round
//   [--lock <path>] wait for and hold a lock, so captures never run side by side (portable stand-in for flock)
//   [--routes /,/work,/work/x] one full capture per route of the same site into <out>/<route>/, plus <out>/routes.json
//   [--walk] a keyboard walk on desktop (every Tab stop, each disclosure's Enter, Shift+Tab and Escape, each button's
//   Enter) and a thumb walk on the phone (each button and disclosure tapped), written to walk.json (scripts/lib/walk.mjs)
// Without --hover or --states, desktop also records hover and focus-visible frames for the first three visible links and buttons.
// Every scroll viewport also records metrics.<viewport>.pictures: how much of each frame is picture, and the page's photographs, clips and drawings.
// Every viewport also writes its accessibility tree as <viewport>-aria.yml. Tablet is skipped for --selector runs unless named.
// A page whose load event never fires within --timeout (a stalled frame queue, a retrying challenge iframe) is captured
// after DOMContentLoaded and listed under manifest.loadTimeouts, not reported unreachable.
// Exit codes: 0 ok · 2 page/action errors · 3 browser unavailable · 4 target unreachable · 5 --gpu got a software renderer · 1 usage.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, now } from './lib/report.mjs';
import { acquireLock } from './lib/lock.mjs';
import { resolvePlaywright, launchChromium, isSoftwareRenderer, MISSING_MESSAGE } from './lib/playwright.mjs';
import { serveDirectory } from './lib/server.mjs';
import { validateActions, runActions } from './lib/actions.mjs';
import { walkPage } from './lib/walk.mjs';

const args = parseArgs(process.argv.slice(2), { 'reduced-motion': 'boolean', 'full-page': 'boolean', json: 'boolean', webgl: 'boolean', video: 'boolean', throttle: 'boolean', gpu: 'boolean', headed: 'boolean', walk: 'boolean' });
const target = args._[0];
if (!target) {
  console.error('usage: node capture.mjs <url|file|dir> [options]');
  process.exit(1);
}
// A relative --out belongs to the project (the nearest folder with AWARDS.md above the target, or above the shell
// for a URL), not to wherever the shell stands: run from dist/ or public/, captures would otherwise ship with the site.
const projectRoot = (() => {
  const local = !/^https?:\/\//i.test(target) && fs.existsSync(path.resolve(target));
  let d = local ? path.resolve(target) : process.cwd();
  if (local && !fs.statSync(d).isDirectory()) d = path.dirname(d);
  for (const start = d; ; d = path.dirname(d)) {
    if (fs.existsSync(path.join(d, 'AWARDS.md'))) return d;
    if (d === path.dirname(d)) return local ? process.cwd() : start;
  }
})();
const outDir = path.resolve(projectRoot, args.out ?? '.awards/captures');

// Several routes of one site: each gets its own capture (same flags) in <out>/<route>/, and routes.json lists
// them with their manifests and exit codes, so the jury reads every page the page map names, not only the home.
if (args.routes) {
  const { spawn } = await import('node:child_process');
  // A bare --routes parses as true; capturing a route named "true" would 404 and exit 4 with no hint why.
  if (args.routes === true || !String(args.routes).trim()) { console.error('--routes needs the routes to capture, e.g. --routes /,/about.html,/work/'); process.exit(1); }
  const routes = String(args.routes).split(',').map((r) => r.trim()).filter(Boolean);
  const remote = /^https?:\/\//i.test(target);
  // A local site is served once from its root, so absolute asset paths resolve on every route.
  const site = remote ? null : await serveDirectory(fs.statSync(path.resolve(target)).isDirectory() ? path.resolve(target) : path.dirname(path.resolve(target)));
  const base = remote ? target : site.url;
  const rest = process.argv.slice(2).filter((a, i, all) => a !== target && !['--routes', '--out'].includes(a) && !['--routes', '--out'].includes(all[i - 1]));
  const results = [];
  for (const route of routes) {
    const slug = route.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'home';
    const routeTarget = new URL(route.replace(/^\//, ''), base.endsWith('/') ? base : base + '/').href;
    const out = path.join(outDir, slug);
    const exit = await new Promise((resolve) => {
      const child = spawn(process.execPath, [fileURLToPath(import.meta.url), routeTarget, '--out', out, ...rest], { stdio: args.json ? 'ignore' : 'inherit' });
      child.on('exit', (code) => resolve(code ?? 1));
    });
    results.push({ route, slug, url: remote ? routeTarget : route, out: path.relative(projectRoot, out), manifest: path.relative(projectRoot, path.join(out, 'manifest.json')), exit });
  }
  if (site) await site.close();
  fs.mkdirSync(outDir, { recursive: true });
  const index = { at: now(), target, routes: results };
  fs.writeFileSync(path.join(outDir, 'routes.json'), JSON.stringify(index, null, 2) + '\n');
  if (args.json) console.log(JSON.stringify(index, null, 2));
  else console.log(`${results.length} route(s): ${results.map((r) => `${r.route} exit ${r.exit}`).join(' · ')} → ${path.relative(process.cwd(), path.join(outDir, 'routes.json'))}`);
  process.exit(results.some((r) => r.exit === 1) ? 1 : Math.max(0, ...results.map((r) => r.exit)));
}
const name = args.name ? String(args.name) + '-' : '';
const parseVp = (s, d) => {
  const [w, h] = String(s ?? d).split('x').map(Number);
  return { width: w || d.split('x')[0] * 1, height: h || d.split('x')[1] * 1 };
};
const desktop = parseVp(args.desktop, '1440x900');
const mobile = parseVp(args.mobile, '390x844');
// Tablet is the third responsive width the jury judges; a component run adds it only when asked by name.
const tablet = args.tablet === false || (args.selector && args.tablet === undefined) ? null : parseVp(args.tablet, '834x1194');
const timeline = args.timeline === undefined ? [] : String(args.timeline).split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n >= 0).sort((a, b) => a - b);
if (args.timeline !== undefined && !timeline.length) {
  console.error('--timeline needs comma-separated milliseconds, e.g. 0,400,1200');
  process.exit(1);
}
const states = String(args.scroll ?? '0,50,100').split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
const settle = Number(args.wait ?? 600);
const timeout = Number(args.timeout ?? 30000);
const webgl = args.webgl !== false;
const only = args.only ? String(args.only) : null;
// Virtual-scroll sites (hijacked wheel, no document scroll height) ignore window.scrollTo.
// wheelPx is the pixel budget a 0 → 100 pass spends through the wheel; 0 turns the fallback off.
const wheelPx = Number(args.wheel ?? 8000);

let interactiveStates = [];
if (args.states !== undefined) {
  try {
    if (typeof args.states !== 'string') throw new Error('--states needs a JSON file');
    interactiveStates = JSON.parse(fs.readFileSync(args.states, 'utf8'));
    if (!Array.isArray(interactiveStates) || !interactiveStates.length) throw new Error('states must be a nonempty array');
    const names = new Set();
    for (const state of interactiveStates) {
      if (!state || typeof state.name !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(state.name)) throw new Error('each state needs a lowercase slug name (1–64 characters)');
      if (names.has(state.name)) throw new Error('duplicate state name: ' + state.name);
      names.add(state.name);
      for (const key of Object.keys(state)) if (!['name', 'actions', 'selector'].includes(key)) throw new Error('unknown state field: ' + key);
      if (state.selector !== undefined && (typeof state.selector !== 'string' || !state.selector.trim())) throw new Error('state selector must be a nonempty string');
      validateActions(state.actions, { allowFunctions: false });
    }
  } catch (error) {
    console.error('invalid capture states: ' + error.message);
    process.exit(1);
  }
}

const found = resolvePlaywright();
if (!found) {
  console.error(MISSING_MESSAGE);
  process.exit(3);
}

// One capture at a time per lock (scripts/lib/lock.mjs).
if (args.lock) await acquireLock(path.resolve(projectRoot, String(args.lock)), 'capture lock');
const pw = found.module;

let server = null;
let url = target;
if (!/^https?:\/\//i.test(target)) {
  const abs = path.resolve(target);
  if (!fs.existsSync(abs)) {
    console.error(`target not found: ${abs}`);
    process.exit(4);
  }
  const isDir = fs.statSync(abs).isDirectory();
  server = await serveDirectory(isDir ? abs : path.dirname(abs));
  url = server.url + (isDir ? '' : path.basename(abs));
}

fs.mkdirSync(outDir, { recursive: true });
const manifest = {
  target,
  url,
  createdAt: now(),
  playwright: found.source,
  webglRequested: webgl,
  viewports: { desktop, ...(tablet ? { tablet } : {}), mobile },
  scrollStates: states,
  interactiveStates,
  captures: [],
  consoleErrors: [],
  pageErrors: [],
  failedRequests: [],
  metrics: {},
};

// LCP; CLS as the largest session window (gaps under 1 s, at most 5 s), as the metric is defined; main-thread
// long tasks and their blocking time past 50 ms; and the slowest interaction this capture itself performs
// (keyboard and pointer events carrying an interactionId), which is a lab stand-in for INP, not field INP.
const INIT = `
(() => {
  const m = window.__awardsMetrics = { lcp: 0, cls: 0, longTasks: 0, longTaskMs: 0, blockingMs: 0, inpLab: 0, interactions: 0 };
  let session = 0, first = 0, last = 0;
  const seen = new Map();
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        if (e.hadRecentInput) continue;
        if (session && e.startTime - last < 1000 && e.startTime - first < 5000) session += e.value;
        else { session = e.value; first = e.startTime; }
        last = e.startTime;
        m.cls = Math.max(m.cls, session);
      }
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { m.longTasks++; m.longTaskMs += e.duration; m.blockingMs += Math.max(0, e.duration - 50); } }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        if (!e.interactionId) continue;
        const d = Math.max(seen.get(e.interactionId) ?? 0, e.duration);
        seen.set(e.interactionId, d);
        m.interactions = seen.size;
        m.inpLab = Math.max(m.inpLab, d);
      }
    }).observe({ type: 'event', durationThreshold: 16, buffered: true });
  } catch {}
  ${webgl ? '' : `const gc = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...r) { return /webgl|webgpu/i.test(String(t)) ? null : gc.call(this, t, ...r); };`}
})();`;

// Navigates and waits for `load`. A page whose load event never fires inside the timeout (a long frame or video
// queue, a challenge iframe that keeps retrying) is still captured once its document has parsed: the manifest lists
// the viewport under `loadTimeouts` instead of calling a page that rendered unreachable.
async function gotoLoaded(page, url, label) {
  const resp = await page.goto(url, { waitUntil: 'commit', timeout });
  if (!resp || resp.status() >= 400) return resp;
  try {
    await page.waitForLoadState('load', { timeout });
  } catch (e) {
    if (!/timeout/i.test(e.message)) throw e;
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    (manifest.loadTimeouts ??= []).push(label);
    console.error(`warning: ${label}: no load event within ${timeout} ms; captured after DOMContentLoaded`);
  }
  return resp;
}

async function settlePage(page) {
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.evaluate(() => Promise.race([window.__awards?.ready, new Promise((r) => setTimeout(r, 8000))])).catch(() => {});
  if (args['wait-for']) await page.waitForSelector(String(args['wait-for']), { timeout }).catch(() => {});
  await page.waitForTimeout(settle);
}

// Returns the mode it used: 'hook', 'native' or 'wheel'.
async function scrollTo(page, percent, previous) {
  const mode = await page.evaluate(async ({ p, wheel }) => {
    const f = p / 100;
    if (window.__awards && typeof window.__awards.scrollTo === 'function') {
      await window.__awards.scrollTo(f);
      window.ScrollTrigger?.update?.();
      return 'hook';
    }
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    if (wheel > 0 && max < window.innerHeight * 0.25) return 'wheel';
    window.scrollTo(0, Math.round(max * f));
    window.dispatchEvent(new Event('scroll'));
    window.ScrollTrigger?.update?.();
    return 'native';
  }, { p: percent, wheel: wheelPx });

  if (mode === 'wheel') {
    const vp = page.viewportSize() ?? desktop;
    await page.mouse.move(Math.round(vp.width / 2), Math.round(vp.height / 2));
    const step = (((percent - previous) / 100) * wheelPx) / 10;
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, step);
      await page.waitForTimeout(80);
    }
  }
  await page.waitForTimeout(settle);
  return mode;
}

// Hover and focus-visible evidence for the first three visible controls (inside --selector when given).
// Best effort: a page without controls, or a control that will not take the state, records nothing.
async function interactionFrames(page) {
  const scope = args.selector ? page.locator(String(args.selector)).first() : page.locator(':root');
  const controls = scope.locator('a[href], button:not([disabled]), [role="button"]');
  const picked = [];
  for (let i = 0, n = await controls.count().catch(() => 0); i < n && picked.length < 3; i++) {
    // Visible, opaque, at least 4 px and inside the document: sr-only, unrevealed and off-canvas controls are not the ones on show.
    const shown = await controls.nth(i).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return el.checkVisibility({ visibilityProperty: true, opacityProperty: true }) && r.width >= 4 && r.height >= 4 && r.right + scrollX > 0 && r.bottom + scrollY > 0 && r.left + scrollX < document.documentElement.scrollWidth;
    }).catch(() => false);
    if (shown) picked.push(controls.nth(i));
  }
  for (const [i, control] of picked.entries()) {
    for (const kind of ['hover', 'focus-visible']) {
      try {
        if (kind === 'hover') {
          await page.evaluate(() => document.activeElement?.blur()); // the previous control's focus ring stays out of this frame
          await control.hover({ timeout: 2000 });
        }
        else {
          await page.mouse.move(0, 0);
          await page.keyboard.press('Shift'); // keyboard modality, so programmatic focus shows :focus-visible
          await control.focus({ timeout: 2000 });
        }
        await page.waitForTimeout(settle);
        const box = await control.boundingBox();
        const vp = page.viewportSize() ?? desktop;
        if (!box) continue;
        const x = Math.max(0, box.x - 24), y = Math.max(0, box.y - 24);
        const clip = { x, y, width: Math.min(vp.width, box.x + box.width + 24) - x, height: Math.min(vp.height, box.y + box.height + 24) - y };
        if (clip.width <= 0 || clip.height <= 0) continue;
        const file = path.join(outDir, `${name}desktop-${kind === 'hover' ? 'hover' : 'focus'}-${i + 1}.png`);
        await page.screenshot({ path: file, clip, timeout });
        const element = await control.evaluate((el, k) => ({ tag: el.tagName.toLowerCase(), text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40), matched: el.matches(k === 'hover' ? ':hover' : ':focus-visible') }), kind);
        manifest.captures.push({ label: 'desktop', kind, index: i + 1, element, file });
      } catch {}
    }
  }
  await page.mouse.move(0, 0).catch(() => {});
}

// The unmasked WebGL renderer: "SwiftShader" or "llvmpipe" means software, anything else names a GPU.
function rendererString() {
  const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
  if (!gl) return null;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
}

// How much of the viewport is picture, split in two: `picture` is photographs, clips and other raster images (an
// img, a video, a picture element, an iframe, a box painted with a url() background); `made` is canvases and large
// SVG drawings. A 24 × 15 grid of points, each counted when it falls inside such a box, so text over a photograph
// still counts as photograph. Boxes, not hit-testing, because canvases and backdrops usually take no pointer events.
// The shares the jury reads beside each frame; not a rule.
function pictureShare() {
  const boxes = { picture: [], made: [] };
  for (const el of document.body.querySelectorAll('*')) {
    const tag = el.tagName.toUpperCase();
    const s = getComputedStyle(el);
    const kind = ['IMG', 'VIDEO', 'PICTURE', 'IFRAME'].includes(tag) || /url\(/.test(s.backgroundImage) ? 'picture' : ['CANVAS', 'SVG'].includes(tag) ? 'made' : null;
    if (!kind || s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) < 0.05) continue;
    const b = el.getBoundingClientRect();
    if (b.width < 24 || b.height < 24 || b.bottom <= 0 || b.top >= innerHeight || b.right <= 0 || b.left >= innerWidth) continue;
    if (tag === 'SVG' && (b.width < innerWidth * 0.25 || b.height < innerHeight * 0.2)) continue;
    boxes[kind].push(b);
  }
  const share = (list) => {
    let hit = 0;
    for (let i = 0; i < 24; i++) for (let k = 0; k < 15; k++) {
      const x = (i + 0.5) * (innerWidth / 24), y = (k + 0.5) * (innerHeight / 15);
      if (list.some((b) => x >= b.left && x <= b.right && y >= b.top && y <= b.bottom)) hit++;
    }
    return Math.round((hit / 360) * 100) / 100;
  };
  return { picture: share(boxes.picture), made: share(boxes.made) };
}

// The page's pictures as a whole: photographs and other raster images (at least 300 px of their own, drawn at 120 px
// or more), clips, large drawings, canvases, and how many sections carry a picture a third of the viewport wide.
function pictureInventory() {
  const big = (el) => { const b = el.getBoundingClientRect(); return b.width >= 120 && b.height >= 80; };
  const raster = new Set();
  for (const img of document.querySelectorAll('img')) if (img.naturalWidth >= 300 && big(img) && !/\.svg(\?|$)/i.test(img.currentSrc || img.src)) raster.add(img.currentSrc || img.src);
  for (const el of document.body.querySelectorAll('*')) {
    const bg = getComputedStyle(el).backgroundImage;
    if (/url\(/.test(bg) && !/\.svg/i.test(bg) && big(el)) raster.add(bg);
  }
  const videos = [...document.querySelectorAll('video')].filter(big).length;
  const drawings = [...document.querySelectorAll('svg')].filter((el) => { const b = el.getBoundingClientRect(); return b.width >= 300 && b.height >= 200; }).length;
  const canvases = [...document.querySelectorAll('canvas')].filter(big).length;
  const root = document.querySelector('main') ?? document.body;
  const sections = [...root.children].filter((el) => el.getBoundingClientRect().height > 80);
  const carries = (sec) => [...sec.querySelectorAll('img,video,canvas,picture,svg,*')].some((el) => {
    const b = el.getBoundingClientRect();
    if (b.width < innerWidth / 3 || b.height < 120) return false;
    const tag = el.tagName.toUpperCase();
    return ['IMG', 'VIDEO', 'CANVAS', 'PICTURE', 'SVG'].includes(tag) || /url\(/.test(getComputedStyle(el).backgroundImage);
  });
  return { raster: raster.size, videos, drawings, canvases, sections: sections.length, sectionsWithPictures: sections.filter(carries).length };
}

// Frame times on a hardware GPU: three seconds at rest, then three seconds scrolling from the top to the
// middle through the page's own hook. p50 and p95 of the rAF deltas, and the share of frames over 1.5x p50.
async function sampleFrames() {
  const run = (ms, during) => new Promise((resolve) => {
    const deltas = [];
    let prev = performance.now();
    const start = prev;
    const tick = (t) => {
      deltas.push(t - prev);
      prev = t;
      during?.((t - start) / ms);
      if (t - start < ms) requestAnimationFrame(tick);
      else resolve(deltas.slice(1));
    };
    requestAnimationFrame(tick);
  });
  const stats = (d) => {
    const s = [...d].sort((a, b) => a - b);
    const q = (p) => Math.round(s[Math.min(s.length - 1, Math.floor(p * s.length))] * 10) / 10;
    const p50 = q(0.5);
    return { frames: s.length, p50, p95: q(0.95), slow: Math.round((s.filter((x) => x > p50 * 1.5).length / Math.max(1, s.length)) * 100) / 100 };
  };
  const idle = await run(3000);
  const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const scroll = await run(3000, (f) => {
    const p = Math.min(0.5, f * 0.5);
    if (window.__awards?.scrollTo) window.__awards.scrollTo(p);
    else window.scrollTo(0, Math.round(max * p));
  });
  if (window.__awards?.scrollTo) await window.__awards.scrollTo(0); else window.scrollTo(0, 0);
  return { idle: stats(idle), scroll: stats(scroll) };
}

const dataUrl = (file) => `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`;

// Runs in a blank page: decodes both PNGs and counts the pixels whose summed channel difference exceeds 48
// (antialiasing noise stays under it). Returns the changed share, the box around the changes and, when
// anything changed, a map: changed pixels in red over a faded copy of the new frame.
async function pixelDiff({ a, b }) {
  const load = (src) => new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error('image decode failed')); img.src = src; });
  const [before, after] = await Promise.all([load(a), load(b)]);
  if (before.width !== after.width || before.height !== after.height) return { changed: 1, sizeChanged: `${before.width}×${before.height} → ${after.width}×${after.height}` };
  const { width: w, height: h } = after;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(before, 0, 0);
  const pa = ctx.getImageData(0, 0, w, h).data;
  ctx.drawImage(after, 0, 0);
  const out = ctx.getImageData(0, 0, w, h);
  const pb = out.data;
  let changed = 0, x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let i = 0; i < pb.length; i += 4) {
    const d = Math.abs(pa[i] - pb[i]) + Math.abs(pa[i + 1] - pb[i + 1]) + Math.abs(pa[i + 2] - pb[i + 2]);
    if (d > 48) {
      changed++;
      const p = i / 4, x = p % w, y = (p - x) / w;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      pb[i] = 230; pb[i + 1] = 20; pb[i + 2] = 60;
    } else {
      const g = 255 - (255 - (pb[i] * 0.3 + pb[i + 1] * 0.59 + pb[i + 2] * 0.11)) * 0.2;
      pb[i] = pb[i + 1] = pb[i + 2] = g;
    }
  }
  const share = Math.round((changed / (w * h)) * 10000) / 10000;
  if (!changed) return { changed: 0 };
  ctx.putImageData(out, 0, 0);
  return { changed: share, box: { x: x0, y: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }, png: canvas.toDataURL('image/png') };
}

// Tiles frames three to a row at 480 px wide, each captioned, onto one PNG.
async function contactSheet(browser, frames, out) {
  const page = await browser.newPage();
  try {
    const png = await page.evaluate(async (items) => {
      const imgs = await Promise.all(items.map((f) => new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = f.src; })));
      const cols = Math.min(3, imgs.length), tw = 480, th = Math.round((tw * imgs[0].height) / imgs[0].width), pad = 12, cap = 22;
      const canvas = document.createElement('canvas');
      canvas.width = cols * tw + (cols + 1) * pad;
      canvas.height = Math.ceil(imgs.length / cols) * (th + cap + pad) + pad;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '14px system-ui, sans-serif';
      imgs.forEach((img, i) => {
        const x = pad + (i % cols) * (tw + pad), y = pad + Math.floor(i / cols) * (th + cap + pad);
        ctx.fillStyle = '#111111';
        ctx.fillText(items[i].caption, x, y + 15);
        ctx.drawImage(img, x, y + cap, tw, th);
        ctx.strokeStyle = '#cccccc';
        ctx.strokeRect(x + 0.5, y + cap + 0.5, tw - 1, th - 1);
      });
      return canvas.toDataURL('image/png');
    }, frames.map((f) => ({ src: dataUrl(f.file), caption: f.caption })));
    fs.writeFileSync(out, Buffer.from(png.split(',')[1], 'base64'));
  } finally {
    await page.close();
  }
}

let browser;
let exitCode = 0;
const pictureShares = {};
try {
  browser = await launchChromium(pw, { webgl, gpu: !!args.gpu, headed: !!args.headed, sandbox: /^https?:\/\//i.test(target) });
  // The GPU lane exists to measure real frames; a software rasteriser would make every number in it fiction.
  if (args.gpu) {
    const probe = await browser.newPage();
    manifest.renderer = await probe.evaluate(rendererString).catch(() => null);
    await probe.close();
    if (!manifest.renderer || isSoftwareRenderer(manifest.renderer)) {
      console.error(`--gpu reached ${manifest.renderer ?? 'no WebGL at all'}, not a hardware GPU. Run on a machine with a GPU, add --headed, or drop --gpu.`);
      await browser.close();
      if (server) await server.close();
      process.exit(5);
    }
  }
  const UA = {
    mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    tablet: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  };
  const plans = [['desktop', desktop, null], ['tablet', tablet, 'tablet'], ['mobile', mobile, 'mobile']]
    .filter(([label, viewport]) => viewport && (!only || only === label));
  if (args['reduced-motion']) plans.push(['desktop-rm', desktop, null, true]);

  for (const [label, viewport, device, reducedMotion] of plans) {
    const isMobile = !!device;
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: device === 'mobile' ? 2 : 1,
      isMobile,
      hasTouch: isMobile,
      reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
      userAgent: UA[device],
    });
    await context.addInitScript(INIT);
    const page = await context.newPage();
    // Lighthouse's mobile profile: 4x CPU slowdown, 150 ms round trip, 1.6 Mbps down, 750 Kbps up.
    if (args.throttle && device === 'mobile') {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      manifest.throttle = { viewport: 'mobile', cpu: 4, rttMs: 150, downMbps: 1.6, upKbps: 750 };
    }
    page.on('console', (m) => { if (m.type() === 'error') manifest.consoleErrors.push(`[${label}] ${m.text()}`); });
    page.on('pageerror', (e) => manifest.pageErrors.push(`[${label}] ${e.message}`));
    page.on('requestfailed', (r) => manifest.failedRequests.push(`[${label}] ${r.url()} ${r.failure()?.errorText ?? ''}`));
    const resp = await gotoLoaded(page, url, label).catch((e) => ({ error: e.message }));
    if (!resp || resp.error || (resp.status && resp.status() >= 400)) {
      console.error(`unreachable: ${url} ${resp?.error ?? resp?.status?.()}`);
      exitCode = 4;
      await context.close();
      break;
    }
    await settlePage(page);
    let scrollMode = null;

    if (args.selector) {
      const sel = String(args.selector);
      const el = await page.$(sel);
      if (!el) {
        manifest.pageErrors.push(`[${label}] selector not found: ${sel}`);
      } else {
        await el.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(settle);
        const slug = sel.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40) || 'component';
        const file = path.join(outDir, `${name}${label}-component-${slug}.png`);
        await el.screenshot({ path: file }).catch(async () => page.screenshot({ path: file }));
        manifest.captures.push({ label, kind: 'component', selector: sel, file });
        if (args.hover && !isMobile) {
          const hov = await page.$(String(args.hover));
          if (hov) {
            await hov.hover().catch(() => {});
            await page.waitForTimeout(settle);
            const hfile = path.join(outDir, `${name}${label}-component-${slug}-hover.png`);
            await el.screenshot({ path: hfile }).catch(async () => page.screenshot({ path: hfile }));
            manifest.captures.push({ label, kind: 'component-hover', selector: String(args.hover), file: hfile });
          }
        }
      }
    } else {
      let previous = 0;
      for (const s of states) {
        scrollMode = await scrollTo(page, s, previous);
        previous = s;
        const share = await page.evaluate(pictureShare).catch(() => null);
        if (share !== null) ((pictureShares[label] ??= {})[`s${String(s).padStart(2, '0')}`] = share);
        const file = path.join(outDir, `${name}${label}-s${String(s).padStart(2, '0')}.png`);
        try {
          await page.screenshot({ path: file, fullPage: !!args['full-page'] && s === states[0], timeout });
          manifest.captures.push({ label, kind: 'scroll', scroll: s, file });
        } catch {
          // A heavy GL page can miss the compositor deadline; lose the frame, never the manifest.
          manifest.pageErrors.push(`[${label}] screenshot timeout at s${String(s).padStart(2, '0')}`);
        }
      }
    }

    // The accessibility tree as the page exposes it at this width: the Semantics / SEO evidence.
    if (!args.selector) {
      try {
        const aria = await page.locator('body').ariaSnapshot({ timeout });
        const file = path.join(outDir, `${name}${label}-aria.yml`);
        fs.writeFileSync(file, aria + '\n');
        manifest.captures.push({ label, kind: 'aria', file });
      } catch (e) {
        manifest.pageErrors.push(`[${label}] aria snapshot failed: ${e.message.split('\n')[0]}`);
      }
    }
    if (args.gpu && !args.selector) {
      manifest.frames ??= {};
      manifest.frames[label] = await page.evaluate(sampleFrames).catch((e) => ({ error: e.message }));
    }

    manifest.metrics[label] = await page.evaluate(() => {
      const c = document.createElement('canvas');
      let gl = false;
      try { gl = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch {}
      const m = window.__awardsMetrics ?? {};
      return {
        title: document.title,
        lang: document.documentElement.lang || null,
        domNodes: document.getElementsByTagName('*').length,
        webgl: gl,
        canvases: document.querySelectorAll('canvas').length,
        // Headless, cold cache, software GL: an asset-weight signal, never a field LCP.
        lcpColdSynthetic: Math.round(m.lcp ?? 0),
        cls: Number((m.cls ?? 0).toFixed(4)),
        longTasks: m.longTasks ?? 0,
        blockingMs: Math.round(m.blockingMs ?? 0),
        inpLab: m.interactions ? Math.round(m.inpLab) : null,
        interactions: m.interactions ?? 0,
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        awardsHook: !!window.__awards,
        awardsState: (() => { try { return window.__awards?.state?.() ?? null; } catch { return null; } })(),
      };
    });
    manifest.metrics[label].scrollMode = scrollMode;
    if (!args.selector) {
      const inventory = await page.evaluate(pictureInventory).catch(() => null);
      if (inventory) manifest.metrics[label].pictures = { ...inventory, shareByScroll: pictureShares[label] ?? {} };
    }
    if (label === 'desktop' && !args.hover && !args.states) await interactionFrames(page);
    // Three keyboard steps give the lab INP something real to time on every page, then the figure is re-read.
    if (label === 'desktop') {
      for (let i = 0; i < 3; i++) await page.keyboard.press('Tab').catch(() => {});
      await page.waitForTimeout(300);
      const m = await page.evaluate(() => window.__awardsMetrics ?? null).catch(() => null);
      if (m) Object.assign(manifest.metrics[label], { inpLab: m.interactions ? Math.round(m.inpLab) : null, interactions: m.interactions, longTasks: m.longTasks, blockingMs: Math.round(m.blockingMs) });
    }
    // Each checkpoint starts at the requested URL; storage persists within this viewport.
    // A failed action cannot contaminate the next checkpoint or erase earlier evidence.
    for (const state of interactiveStates) {
      try {
        await page.mouse.up();
        const response = await gotoLoaded(page, url, `${label}:${state.name}`);
        if (!response || response.status() >= 400) throw new Error('target unreachable: ' + response?.status());
        await settlePage(page);
        await runActions(page, state.actions, { timeout });
        await page.waitForTimeout(settle);
        const file = path.join(outDir, name + label + '-state-' + state.name + '.png');
        const selector = state.selector ?? args.selector;
        if (selector) await page.locator(String(selector)).screenshot({ path: file, timeout });
        else await page.screenshot({ path: file, timeout });
        const awardsState = await page.evaluate(() => {
          try { return window.__awards?.state?.() ?? null; } catch { return null; }
        });
        manifest.captures.push({ label, kind: 'state', name: state.name, actions: state.actions, selector: selector ?? null, awardsState, file });
      } catch (error) {
        manifest.pageErrors.push('[' + label + ' state ' + state.name + '] ' + error.message);
      }
    }
    await context.close().catch(() => {});
  }

  // Page time, held still: the clock is paused before navigation, so timers, rAF and GSAP advance only by
  // the steps below and two runs of the same page give the same frames. CSS animations and transitions run
  // on the browser's own clock and are not held. The frames also land on one contact sheet the jury can read.
  if (timeline.length && exitCode !== 4) {
    const context = await browser.newContext({ viewport: desktop, reducedMotion: 'no-preference' });
    await context.addInitScript(INIT);
    const page = await context.newPage();
    page.on('pageerror', (e) => manifest.pageErrors.push(`[timeline] ${e.message}`));
    try {
      const start = Date.now();
      await page.clock.install({ time: start });
      await page.clock.pauseAt(start + 1);
      await page.goto(url, { waitUntil: 'load', timeout });
      const frames = [];
      let at = 0;
      for (const t of timeline) {
        if (t > at) await page.clock.runFor(t - at);
        at = t;
        const file = path.join(outDir, `${name}desktop-t${String(t).padStart(5, '0')}.png`);
        await page.screenshot({ path: file, timeout });
        manifest.captures.push({ label: 'desktop', kind: 'timeline', ms: t, file });
        frames.push({ file, caption: `${t} ms` });
      }
      const sheet = path.join(outDir, `${name}desktop-timeline.png`);
      await contactSheet(browser, frames, sheet);
      manifest.captures.push({ label: 'desktop', kind: 'timeline-sheet', file: sheet });
    } catch (e) {
      manifest.pageErrors.push(`[timeline] ${e.message.split('\n')[0]}`);
    }
    await context.close().catch(() => {});
  }

  // A real-time desktop pass for people to watch: load, settle, wheel from top to bottom over about six seconds.
  // Playwright 1.59+ records through page.screencast; older releases through the context's recordVideo.
  if (args.video && exitCode !== 4) {
    const size = { width: 1280, height: Math.round((1280 * desktop.height) / desktop.width) };
    const file = path.join(outDir, `${name}desktop-scroll.webm`);
    const probe = await browser.newPage();
    const screencast = typeof probe.screencast?.start === 'function';
    await probe.close();
    const context = await browser.newContext({ viewport: desktop, ...(screencast ? {} : { recordVideo: { dir: path.join(outDir, '.video'), size } }) });
    const page = await context.newPage();
    try {
      if (screencast) await page.screencast.start({ path: file, size });
      await gotoLoaded(page, url, 'video');
      await settlePage(page);
      await page.mouse.move(Math.round(desktop.width / 2), Math.round(desktop.height / 2));
      const height = await page.evaluate(() => Math.max(document.documentElement.scrollHeight - innerHeight, innerHeight * 4));
      for (let i = 0; i < 60; i++) {
        await page.mouse.wheel(0, height / 60);
        await page.waitForTimeout(100);
      }
      await page.waitForTimeout(1000);
      if (screencast) await page.screencast.stop();
    } catch (e) {
      manifest.pageErrors.push(`[video] ${e.message.split('\n')[0]}`);
    }
    const video = screencast ? null : page.video();
    await context.close().catch(() => {});
    if (video) {
      await video.saveAs(file).catch((e) => manifest.pageErrors.push(`[video] ${e.message}`));
      await video.delete().catch(() => {});
      fs.rmSync(path.join(outDir, '.video'), { recursive: true, force: true });
    }
    if (fs.existsSync(file)) manifest.captures.push({ label: 'desktop', kind: 'video', file });
  }

  // The keyboard and thumb walk: evidence for the jury's usability walk, read before its steps.
  if (args.walk && exitCode !== 4) {
    try {
      const report = await walkPage(browser, url, { outDir, name, desktop, mobile, timeout, settle, settlePage, manifest });
      const file = path.join(outDir, `${name}walk.json`);
      fs.writeFileSync(file, JSON.stringify({ at: now(), url, ...report }, null, 2) + '\n');
      manifest.walk = { file, desktopStops: report.desktop.stops.length, findings: report.desktop.findings.length + report.mobile.findings.length, ...(report.desktop.error || report.mobile.error ? { errors: [report.desktop.error, report.mobile.error].filter(Boolean) } : {}) };
      manifest.captures.push({ label: 'desktop', kind: 'walk-report', file });
    } catch (e) {
      manifest.pageErrors.push(`[walk] ${e.message.split('\n')[0]}`);
    }
  }

  // Against an earlier round: the share of pixels that changed per frame, and a map of where.
  if (args.baseline && exitCode !== 4) {
    const base = path.resolve(String(args.baseline));
    manifest.baseline = base;
    manifest.diff = [];
    const page = await browser.newPage();
    for (const c of manifest.captures.filter((c) => c.file.endsWith('.png') && c.kind !== 'timeline-sheet')) {
      const earlier = path.join(base, path.basename(c.file));
      if (!fs.existsSync(earlier)) continue;
      try {
        const r = await page.evaluate(pixelDiff, { a: dataUrl(earlier), b: dataUrl(c.file) });
        const entry = { file: c.file, baseline: earlier, ...r, png: undefined };
        if (r.png) {
          fs.mkdirSync(path.join(outDir, 'diff'), { recursive: true });
          entry.map = path.join(outDir, 'diff', path.basename(c.file));
          fs.writeFileSync(entry.map, Buffer.from(r.png.split(',')[1], 'base64'));
        }
        delete entry.png;
        manifest.diff.push(entry);
      } catch (e) {
        manifest.pageErrors.push(`[baseline] ${path.basename(c.file)}: ${e.message.split('\n')[0]}`);
      }
    }
    await page.close();
  }
} catch (e) {
  if (!browser) exitCode = 3;
  manifest.pageErrors.push(`[capture] ${e.message}`);
} finally {
  if (browser) await browser.close();
  if (server) await server.close();
}

if (exitCode === 0 && (manifest.consoleErrors.length || manifest.pageErrors.length)) exitCode = 2;
const manifestPath = path.join(outDir, `${name}manifest.json`);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
if (args.json) {
  console.log(JSON.stringify(manifest, null, 2));
} else {
  console.log(`captured ${manifest.captures.length} file(s) → ${outDir}`);
  for (const c of manifest.captures) console.log(`  ${path.basename(c.file)}`);
  if (manifest.consoleErrors.length) console.log(`console errors: ${manifest.consoleErrors.length}`);
  if (manifest.pageErrors.length) console.log(`page errors: ${manifest.pageErrors.length}`);
  if (manifest.walk) console.log(`walk: ${manifest.walk.desktopStops} focus stop(s), ${manifest.walk.findings} finding(s) → ${path.basename(manifest.walk.file)}`);
  if (manifest.failedRequests.length) console.log(`failed requests: ${manifest.failedRequests.length}`);
  if (manifest.diff) {
    const moved = manifest.diff.filter((d) => d.changed > 0.01);
    console.log(`against ${manifest.baseline}: ${manifest.diff.length} frame(s) compared, ${moved.length} changed by more than 1 %${moved.length ? ': ' + moved.map((d) => `${path.basename(d.file)} ${(d.changed * 100).toFixed(1)} %`).join(', ') : ''}`);
  }
  console.log(`manifest: ${manifestPath}`);
}
process.exit(exitCode);
