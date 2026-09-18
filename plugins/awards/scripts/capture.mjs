#!/usr/bin/env node
// Capture desktop / mobile / scroll-state / reduced-motion screenshots of a page or component for review.
// Usage: node capture.mjs <url|file|dir> [--out .awards/captures] [--desktop 1440x900] [--mobile 390x844]
//   [--only desktop|mobile] [--scroll 0,50,100] [--reduced-motion] [--full-page] [--selector <css>] [--hover <css>]
//   [--wait <ms>] [--wait-for <css>] [--no-webgl] [--json] [--name <prefix>] [--timeout <ms>]
// Exit codes: 0 ok · 2 page/console errors · 3 Playwright missing · 4 target unreachable · 1 usage.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, now } from './lib/report.mjs';
import { resolvePlaywright, launchChromium, MISSING_MESSAGE } from './lib/playwright.mjs';
import { serveDirectory } from './lib/server.mjs';

const args = parseArgs(process.argv.slice(2), { 'reduced-motion': 'boolean', 'full-page': 'boolean', json: 'boolean', webgl: 'boolean' });
const target = args._[0];
if (!target) {
  console.error('usage: node capture.mjs <url|file|dir> [options]');
  process.exit(1);
}
const outDir = path.resolve(args.out ?? '.awards/captures');
const name = args.name ? String(args.name) + '-' : '';
const parseVp = (s, d) => {
  const [w, h] = String(s ?? d).split('x').map(Number);
  return { width: w || d.split('x')[0] * 1, height: h || d.split('x')[1] * 1 };
};
const desktop = parseVp(args.desktop, '1440x900');
const mobile = parseVp(args.mobile, '390x844');
const states = String(args.scroll ?? '0,50,100').split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
const settle = Number(args.wait ?? 600);
const timeout = Number(args.timeout ?? 30000);
const webgl = args.webgl !== false;
const only = args.only ? String(args.only) : null;

const found = resolvePlaywright();
if (!found) {
  console.error(MISSING_MESSAGE);
  process.exit(3);
}
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
  viewports: { desktop, mobile },
  scrollStates: states,
  captures: [],
  consoleErrors: [],
  pageErrors: [],
  failedRequests: [],
  metrics: {},
};

const INIT = `
(() => {
  window.__awardsMetrics = { lcp: 0, cls: 0 };
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__awardsMetrics.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__awardsMetrics.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
  ${webgl ? '' : `const gc = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...r) { return /webgl|webgpu/i.test(String(t)) ? null : gc.call(this, t, ...r); };`}
})();`;

async function settlePage(page) {
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.evaluate(() => Promise.race([window.__awards?.ready, new Promise((r) => setTimeout(r, 8000))])).catch(() => {});
  if (args['wait-for']) await page.waitForSelector(String(args['wait-for']), { timeout }).catch(() => {});
  await page.waitForTimeout(settle);
}

async function scrollTo(page, percent) {
  await page.evaluate(async (p) => {
    const f = p / 100;
    if (window.__awards && typeof window.__awards.scrollTo === 'function') {
      await window.__awards.scrollTo(f);
    } else {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo(0, Math.round(max * f));
      window.dispatchEvent(new Event('scroll'));
    }
    window.ScrollTrigger?.update?.();
  }, percent);
  await page.waitForTimeout(settle);
}

const browser = await launchChromium(pw, { webgl });
let exitCode = 0;
try {
  const plans = [['desktop', desktop, false]];
  if (!only || only === 'mobile') plans.push(['mobile', mobile, true]);
  if (only === 'mobile') plans.shift();
  if (args['reduced-motion']) plans.push(['desktop-rm', desktop, false, true]);

  for (const [label, viewport, isMobile, reducedMotion] of plans) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: isMobile ? 2 : 1,
      isMobile,
      hasTouch: isMobile,
      reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
      userAgent: isMobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
    });
    await context.addInitScript(INIT);
    const page = await context.newPage();
    page.on('console', (m) => { if (m.type() === 'error') manifest.consoleErrors.push(`[${label}] ${m.text()}`); });
    page.on('pageerror', (e) => manifest.pageErrors.push(`[${label}] ${e.message}`));
    page.on('requestfailed', (r) => manifest.failedRequests.push(`[${label}] ${r.url()} ${r.failure()?.errorText ?? ''}`));
    const resp = await page.goto(url, { waitUntil: 'load', timeout }).catch((e) => ({ error: e.message }));
    if (!resp || resp.error || (resp.status && resp.status() >= 400)) {
      console.error(`unreachable: ${url} ${resp?.error ?? resp?.status?.()}`);
      exitCode = 4;
      await context.close();
      break;
    }
    await settlePage(page);

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
      for (const s of states) {
        await scrollTo(page, s);
        const file = path.join(outDir, `${name}${label}-s${String(s).padStart(2, '0')}.png`);
        await page.screenshot({ path: file, fullPage: !!args['full-page'] && s === states[0] });
        manifest.captures.push({ label, kind: 'scroll', scroll: s, file });
      }
    }

    manifest.metrics[label] = await page.evaluate(() => {
      const c = document.createElement('canvas');
      let gl = false;
      try { gl = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch {}
      return {
        title: document.title,
        lang: document.documentElement.lang || null,
        domNodes: document.getElementsByTagName('*').length,
        webgl: gl,
        canvases: document.querySelectorAll('canvas').length,
        lcp: Math.round(window.__awardsMetrics?.lcp ?? 0),
        cls: Number((window.__awardsMetrics?.cls ?? 0).toFixed(4)),
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        awardsHook: !!window.__awards,
        awardsState: (() => { try { return window.__awards?.state?.() ?? null; } catch { return null; } })(),
      };
    });
    await context.close();
  }
} finally {
  await browser.close();
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
  if (manifest.failedRequests.length) console.log(`failed requests: ${manifest.failedRequests.length}`);
  console.log(`manifest: ${manifestPath}`);
}
process.exit(exitCode);
