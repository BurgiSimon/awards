// Behaviour probe for the flow: serves dist/, drives the page in headless Chromium and prints what it measured.
// Run through .awards/locked.mjs so it never overlaps another browser job.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import * as pw from 'playwright';
import { launchChromium } from '../../plugins/awards/scripts/lib/playwright.mjs';

const root = resolve(import.meta.dirname, '../dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  try { const body = await readFile(join(root, p)); res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const url = `http://127.0.0.1:${server.address().port}/`;
const browser = await launchChromium(pw.default ?? pw, { webgl: true });
const out = {};
const domCanvases = (p) => p.evaluate(() => [...document.querySelectorAll("canvas")].map((c) => c.dataset.flowCanvas + "@" + c.parentElement.id));
const countContexts = () => {
  window.__contexts = 0;
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const c = orig.call(this, type, ...rest);
    if (/webgl/.test(type) && c && !this.__counted && this.width !== 1) { this.__counted = true; window.__contexts++; }
    return c;
  };
};

async function page(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await p.addInitScript(countContexts);
  await p.goto(url);
  await p.evaluate(() => window.__awards.ready);
  await p.waitForTimeout(1500);
  return { p, ctx, errors };
}

{
  const { p, ctx, errors } = await page();
  out.h1aria = await p.locator('h1').ariaSnapshot();
  out.full = await p.evaluate(() => ({ state: window.__awards.state(), contexts: window.__contexts, canvases: document.querySelectorAll('canvas').length, airspeed: document.getElementById('airspeed').textContent, button: document.querySelector('[data-airflow]').outerHTML }));
  // Fast scroll back up into the hero: the wake should be visible behind the letters.
  await p.evaluate(() => window.scrollTo(0, 700));
  await p.waitForTimeout(400);
  for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, -140); await p.waitForTimeout(16); }
  await p.waitForTimeout(250);
  out.wake = await p.evaluate(() => ({ hero: window.__awards.state().flows[0], scrollY, airspeed: document.getElementById('airspeed').textContent }));
  await p.screenshot({ path: resolve(import.meta.dirname, 'probe-wake.png') });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: resolve(import.meta.dirname, 'probe-wake-after.png') });
  await p.waitForTimeout(1800);
  await p.screenshot({ path: resolve(import.meta.dirname, 'probe-wake-3s.png') });
  out.settled = await p.evaluate(() => window.__awards.state().flows[0]);
  // Close: scroll to the end, the close flow draws through the same context.
  await p.evaluate(() => window.__awards.scrollTo(1));
  await p.waitForTimeout(800);
  out.close = await p.evaluate(() => ({ flows: window.__awards.state().flows, contexts: window.__contexts }));
  out.closeCanvases = await domCanvases(p);
  await p.screenshot({ path: resolve(import.meta.dirname, 'probe-close.png') });
  await p.evaluate(() => window.__awards.scrollTo(0));
  await p.waitForTimeout(300);
  await p.screenshot({ path: resolve(import.meta.dirname, 'probe-back.png') });
  out.backCanvases = await domCanvases(p);
  // Airflow off freezes the frame and zeroes the readout.
  if (await p.isVisible('[data-airflow]')) await p.click('[data-airflow]');
  await p.waitForTimeout(400);
  out.off = await p.evaluate(() => ({ airflow: window.__awards.state().airflow, airspeed: document.getElementById('airspeed').textContent, steps: window.__awards.state().flows[0].steps }));
  await p.waitForTimeout(400);
  out.offSteps = await p.evaluate(() => window.__awards.state().flows[0].steps);
  out.fullErrors = errors;
  await ctx.close();
}
{
  const { p, ctx, errors } = await page({ reducedMotion: 'reduce' });
  out.reduced = await p.evaluate(() => ({ state: window.__awards.state(), contexts: window.__contexts, airspeed: document.getElementById('airspeed').textContent, hidden: document.querySelector('[data-airflow]').hidden, pressed: document.querySelector('[data-airflow]').getAttribute('aria-pressed'), h1: document.querySelector('h1').textContent.replace(/\s+/g, ' ') }));
  if (!out.reduced.hidden) await p.click('[data-airflow]');
  await p.waitForTimeout(2000);
  out.reducedOptIn = await p.evaluate(() => ({ state: window.__awards.state(), contexts: window.__contexts }));
  out.reducedErrors = errors;
  out.reducedCanvases = await domCanvases(p);
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  await p.addInitScript(countContexts);
  await p.goto(url);
  await p.evaluate(() => window.__awards.ready);
  await p.waitForTimeout(1200);
  out.mobile = await p.evaluate(() => ({ state: window.__awards.state(), contexts: window.__contexts }));
  out.mobileErrors = errors;
  await ctx.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.close();
