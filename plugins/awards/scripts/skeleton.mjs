#!/usr/bin/env node
// A composition skeleton and a measured fingerprint for one page: where the type, the media and the headings
// sit at the top, middle and close on desktop and at the top on a phone, as grey blocks with no pixels, words
// or colours of the site in them; plus the numbers a layout is made of (type ramp, columns, gutter, margin,
// image-area share). Measurements, not expression: the legal visual bar concept and system can read for a
// corpus card without ever seeing its imagery. Runs the owner-policy check first for remote pages.
// Usage: node scripts/skeleton.mjs <url|file|dir> --out <file.png> [--json <file.json>] [--slug <name>]
// Exit: 0 written · 2 refused by the owner's policy · 3 browser unavailable · 4 unreachable · 1 usage.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, now } from './lib/report.mjs';
import { resolvePlaywright, launchChromium, MISSING_MESSAGE } from './lib/playwright.mjs';
import { serveDirectory } from './lib/server.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2));
const target = args._[0];
if (!target || !args.out) {
  console.error('usage: node scripts/skeleton.mjs <url|file|dir> --out <file.png> [--json <file.json>] [--slug <name>]');
  process.exit(1);
}
const remote = /^https?:\/\//i.test(target);
if (remote) {
  try { execFileSync(process.execPath, [path.join(here, 'policy.mjs'), target], { stdio: 'pipe', timeout: 60000 }); }
  catch (e) {
    if (e.status === 2) { console.error(`refused by the owner's policy: ${String(e.stdout).trim()}`); process.exit(2); }
    if (e.status === 4) { console.error(`unreachable: ${target}`); process.exit(4); }
  }
}
const found = resolvePlaywright();
if (!found) { console.error(MISSING_MESSAGE); process.exit(3); }

let server = null, url = target;
if (!remote) {
  const abs = path.resolve(target);
  const dir = fs.statSync(abs).isDirectory() ? abs : path.dirname(abs);
  server = await serveDirectory(dir);
  url = server.url + (fs.statSync(abs).isDirectory() ? '' : path.basename(abs));
}

// In the page: every visible box that carries its own text, media or a heading, as rectangles in viewport
// coordinates, plus the computed numbers. Consent and cookie layers are dropped so they do not read as layout.
function measure() {
  const vw = document.documentElement.clientWidth, vh = innerHeight;
  const blocked = (el) => el.closest('[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],[aria-modal="true"],[hidden],template,script,style,noscript');
  const MEDIA = new Set(['IMG', 'PICTURE', 'VIDEO', 'CANVAS', 'svg', 'IFRAME']);
  const boxes = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (blocked(el)) continue;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) < 0.05) continue;
    const b = el.getBoundingClientRect();
    if (b.width < 4 || b.height < 4 || b.bottom <= 0 || b.top >= vh || b.right <= 0 || b.left >= vw) continue;
    const heading = /^H[1-3]$/.test(el.tagName);
    const media = MEDIA.has(el.tagName) || (s.backgroundImage !== 'none' && !/gradient/.test(s.backgroundImage) && b.width * b.height > 4000);
    const text = !heading && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!heading && !media && !text) continue;
    if (media && el.closest('picture') && el.tagName === 'IMG') continue;
    boxes.push({ kind: heading ? 'heading' : media ? 'media' : 'text', x: Math.max(0, b.left), y: Math.max(0, b.top), w: Math.min(vw, b.right) - Math.max(0, b.left), h: Math.min(vh, b.bottom) - Math.max(0, b.top) });
  }
  const px = (sel) => { const el = [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().width > 0 && !blocked(e)); return el ? Math.round(parseFloat(getComputedStyle(el).fontSize)) : null; };
  const body = [...document.querySelectorAll('p')].find((p) => p.textContent.trim().length > 60 && !blocked(p));
  const mediaArea = boxes.filter((b) => b.kind === 'media').reduce((n, b) => n + b.w * b.h, 0);
  // Columns: left edges of text and heading blocks, clustered within 8 px, counting edges used at least twice.
  const lefts = boxes.filter((b) => b.kind !== 'media' && b.w < vw * 0.9).map((b) => Math.round(b.x / 8) * 8);
  const counts = new Map(); for (const l of lefts) counts.set(l, (counts.get(l) ?? 0) + 1);
  const edges = [...counts].filter(([, n]) => n >= 2).map(([l]) => l).sort((a, b) => a - b);
  return {
    vw, vh,
    boxes,
    type: { h1: px('h1'), h2: px('h2'), body: body ? Math.round(parseFloat(getComputedStyle(body).fontSize)) : null },
    margin: edges.length ? edges[0] : null,
    columnEdges: edges.length,
    mediaShare: Math.round((Math.min(mediaArea, vw * vh) / (vw * vh)) * 100) / 100,
    height: document.documentElement.scrollHeight,
  };
}

const browser = await launchChromium(found.module, { sandbox: remote });
const panels = [];
const fingerprint = { target, slug: args.slug ?? null, at: now(), desktop: {}, phone: {} };
try {
  for (const [label, viewport, positions] of [['desktop', { width: 1440, height: 900 }, [0, 0.5, 1]], ['phone', { width: 390, height: 844 }, [0]]]) {
    const context = await browser.newContext({ viewport, isMobile: label === 'phone', hasTouch: label === 'phone', reducedMotion: 'reduce' });
    const page = await context.newPage();
    const ok = await page.goto(url, { waitUntil: 'load', timeout: 45000 }).then(() => true, () => false);
    if (!ok) { await context.close(); if (!panels.length) { console.error(`unreachable: ${url}`); process.exit(4); } continue; }
    await page.waitForTimeout(3000);
    // A page with no document height scrolls virtually (wheel-driven); reach its middle and close the way
    // capture.mjs does, through the wheel, with an 8,000 px budget from top to bottom.
    let wheeled = 0;
    for (const p of positions) {
      const mode = await page.evaluate(async (p) => {
        const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
        if (window.__awards?.scrollTo) { await window.__awards.scrollTo(p); return 'hook'; }
        if (max < innerHeight * 0.25) return 'wheel';
        window.scrollTo(0, Math.round(max * p));
        return 'native';
      }, p).catch(() => 'native');
      if (mode === 'wheel' && p > 0) {
        await page.mouse.move(viewport.width / 2, viewport.height / 2);
        const goal = 8000 * p;
        for (let i = 0; i < 10; i++) { await page.mouse.wheel(0, (goal - wheeled) / (10 - i)); wheeled += (goal - wheeled) / (10 - i); await page.waitForTimeout(80); }
      }
      await page.waitForTimeout(1200);
      const m = await page.evaluate(measure).catch(() => null);
      if (!m) continue;
      panels.push({ label: `${label} ${Math.round(p * 100)} %`, ...m });
      if (p === 0) fingerprint[label] = { type: m.type, margin: m.margin, columnEdges: m.columnEdges, mediaShareFirstViewport: m.mediaShare, pageHeightViewports: Math.round((m.height / m.vh) * 10) / 10 };
    }
    await context.close();
  }
  // Draw the block maps side by side: light ground, text grey, headings dark, media hatched mid-grey.
  const sheet = await browser.newPage();
  const png = await sheet.evaluate((panels) => {
    const scale = (p) => 220 / p.vw;
    const pad = 16, cap = 18, legend = 20, w = panels.reduce((n, p) => n + p.vw * scale(p) + pad, pad), h = Math.max(...panels.map((p) => p.vh * scale(p))) + cap + legend + pad * 2;
    const c = document.createElement('canvas');
    c.width = Math.ceil(w); c.height = Math.ceil(h);
    const x = c.getContext('2d');
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, c.width, c.height);
    x.font = '11px sans-serif';
    let left = pad;
    for (const p of panels) {
      const k = scale(p), pw = p.vw * k, ph = p.vh * k, top = pad + cap;
      x.fillStyle = '#222'; x.fillText(p.label, left, pad + 11);
      x.fillStyle = '#f1f1ee'; x.fillRect(left, top, pw, ph);
      for (const b of p.boxes.filter((b) => b.kind === 'media')) { x.fillStyle = '#b9b9b4'; x.fillRect(left + b.x * k, top + b.y * k, b.w * k, b.h * k); }
      for (const b of p.boxes.filter((b) => b.kind === 'text')) { x.fillStyle = '#7d7d78'; x.fillRect(left + b.x * k, top + b.y * k, b.w * k, Math.max(1, b.h * k)); }
      for (const b of p.boxes.filter((b) => b.kind === 'heading')) { x.fillStyle = '#1d1d1b'; x.fillRect(left + b.x * k, top + b.y * k, b.w * k, Math.max(1, b.h * k)); }
      x.strokeStyle = '#999'; x.strokeRect(left + 0.5, top + 0.5, pw - 1, ph - 1);
      left += pw + pad;
    }
    // Legend under the panels.
    const ly = c.height - pad - 6;
    [['#1d1d1b', 'heading'], ['#7d7d78', 'text'], ['#b9b9b4', 'media'], ['#f1f1ee', 'ground']].forEach(([fill, name], i) => {
      x.fillStyle = fill; x.fillRect(pad + i * 90, ly - 9, 12, 10); x.strokeStyle = '#999'; x.strokeRect(pad + i * 90 + 0.5, ly - 8.5, 11, 9);
      x.fillStyle = '#222'; x.fillText(name, pad + i * 90 + 18, ly);
    });
    return c.toDataURL('image/png');
  }, panels.map(({ boxes, vw, vh, label }) => ({ boxes, vw, vh, label })));
  fs.mkdirSync(path.dirname(path.resolve(String(args.out))), { recursive: true });
  fs.writeFileSync(String(args.out), Buffer.from(png.split(',')[1], 'base64'));
  if (args.json) fs.writeFileSync(String(args.json), JSON.stringify(fingerprint, null, 2) + '\n');
  console.log(JSON.stringify(fingerprint));
} finally {
  await browser.close();
  if (server) await server.close();
}
