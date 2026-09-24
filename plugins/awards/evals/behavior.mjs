#!/usr/bin/env node
// Real tool/browser regressions; no model calls. Run serially, never beside verify-recipes.
// Usage: node evals/behavior.mjs [--only server,audit,ticker,capture,doctor,starter,menu]
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execFile } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { serveDirectory } from '../scripts/lib/server.mjs';
import { resolvePlaywright, launchChromium } from '../scripts/lib/playwright.mjs';
import { parseArgs } from '../scripts/lib/report.mjs';

const plugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = parseArgs(process.argv.slice(2));
const only = args.only ? new Set(String(args.only).split(',')) : null;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'awards behavior '));
const project = path.join(tmp, 'project');
fs.mkdirSync(project);
fs.writeFileSync(path.join(project, 'AWARDS.md'), '# Awards\n');
const tests = [];
const test = (group, name, run) => { if (!only || only.has(group)) tests.push({ name: group + ': ' + name, run }); };
const json = (file, value) => fs.writeFileSync(file, JSON.stringify(value));
const run = (script, argv = [], env = {}) => new Promise((resolve, reject) => {
  execFile(process.execPath, [path.join(plugin, script), ...argv], {
    cwd: project, env: { ...process.env, CLAUDE_PROJECT_DIR: '', AWARDS_HOOK: '', ...env },
    timeout: 60000, maxBuffer: 2 * 1024 * 1024,
  }, (error, stdout, stderr) => {
    if (error && (typeof error.code !== 'number' || error.killed)) return reject(error);
    resolve({ code: error?.code ?? 0, stdout, stderr });
  });
});
let browser;
const servers = [];
const serve = async (dir) => { const server = await serveDirectory(dir); servers.push(server); return server.url; };
const getBrowser = async () => {
  if (!browser) {
    const found = resolvePlaywright();
    assert.ok(found, 'Install Playwright/Chromium or set AWARDS_PLAYWRIGHT before browser checks');
    browser = await launchChromium(found.module);
  }
  return browser;
};

test('server', 'blocks sibling-prefix traversal and escaping symlinks', async () => {
  const sibling = project + '-other';
  fs.mkdirSync(sibling);
  fs.writeFileSync(path.join(sibling, 'marker.txt'), 'outside');
  fs.writeFileSync(path.join(project, 'inside.txt'), 'inside');
  fs.symlinkSync(sibling, path.join(project, 'link'), 'junction');
  const url = await serve(project);
  assert.equal(await (await fetch(url + 'inside.txt')).text(), 'inside');
  for (const route of ['%2e%2e%2fproject-other/marker.txt', 'link/marker.txt']) {
    assert.equal((await fetch(url + route)).status, 403, 'must not serve ' + route);
  }
});

test('audit', 'quick directory audit actually finds broken markup', async () => {
  fs.writeFileSync(path.join(project, 'index.html'), '<html><body><h1>Example</h1><script>gsap.to("h1", {x:20})</script></body></html>');
  const result = await run('scripts/audit.mjs', [project, '--quick']);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /L03/, 'directory quick audit must report the missing viewport');
  assert.match(result.stdout, /M01/, 'directory quick audit must report missing reduced motion');
});
test('audit', 'URL and missing-browser audits cannot report a clean unmeasured result', async () => {
  const result = await run('scripts/audit.mjs', ['http://127.0.0.1:1/unreachable', '--json']);
  assert.equal(result.code, 1, 'a URL requires rendered checks');
  assert.match(result.stderr, /--render/);
  const missing = await run('scripts/audit.mjs', [project, '--render', '--no-write'], { PATH: '', AWARDS_PLAYWRIGHT: '' });
  assert.equal(missing.code, 3, 'requested rendered checks must fail when Playwright is missing');
});
const auditIds = async (dir, argv = []) => {
  const result = await run('scripts/audit.mjs', [dir, '--json', '--no-write', ...argv]);
  return new Set(JSON.parse(result.stdout).findings.map((f) => f.rule));
};
const SLOP_IDS = ['T07', 'X01', 'X02', 'X06', 'X08', 'X09', 'X10', 'X11', 'X12', 'X13', 'X14', 'X15', 'X16', 'X17', 'X18', 'X19', 'L04', 'L05'];
test('audit', 'slop rules fire on generated habits and stay quiet on a considered page', async () => {
  const slop = path.join(tmp, 'slop');
  const clean = path.join(tmp, 'clean');
  fs.mkdirSync(slop);
  fs.mkdirSync(clean);
  const tile = (n) => `<div class="feature"><div class="feature-icon"><svg></svg></div><h3>Feature ${n}</h3><p>Copy.</p></div>`;
  fs.writeFileSync(path.join(slop, 'index.html'), `<html lang="en"><head><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="s.css"></head><body><main>
<span class="badge">New</span><h1>Supercharge your workflow</h1>
<p>Not a tool. A platform. Not a feature. A promise. Seamless sync — elevate your team — unlock insight — every day — no setup — no limits — anywhere. It works. It ships. It scales. It lasts.</p>
<a href="#">Get started free</a><img src="https://placehold.co/600x400" alt="" width="600" height="400">
<div class="metrics"><div>10k</div><div>99%</div><div>24/7</div></div>${tile(1)}${tile(2)}${tile(3)}
<script>gsap.to('.x', { y: 10, ease: 'elastic.out(1, 0.3)' })</script></main></body></html>`);
  fs.writeFileSync(path.join(slop, 's.css'), `body { background: repeating-linear-gradient(90deg, #222 0 1px, transparent 1px 40px); }
.hero::before { background: radial-gradient(circle, #7c3aed, transparent 60%); }
.btn { background: linear-gradient(90deg, #8b5cf6, #ec4899); box-shadow: 0 0 24px #a855f7; transition: transform .3s cubic-bezier(.34, 1.56, .64, 1); }
.dot { animation: pulse 2s infinite; }
.card:hover img { transform: scale(1.08); }
.panel { border: 1px solid #eee; box-shadow: 0 20px 60px rgba(0,0,0,.12); }
.note { border-top: 4px solid #0a0; border-radius: 16px; }
p { text-align: justify; line-height: 1.1; }`);
  fs.writeFileSync(path.join(clean, 'index.html'), `<html lang="en"><head><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="s.css"></head><body><main>
<h1>Tide tables for the Menai Strait</h1><p>High water at Caernarfon falls 38 minutes after Holyhead. The table below lists both, in local time.</p>
<a href="/tables">Read the September tables</a><img src="/strait.avif" alt="The strait at low water" width="600" height="400">
<script>gsap.to('.x', { y: 10, ease: 'expo.out' })</script></main></body></html>`);
  fs.writeFileSync(path.join(clean, 's.css'), `body { background: #f4f2ee; color: #1a1c1c; }
.btn { transition: transform .3s cubic-bezier(.16, 1, .3, 1); box-shadow: 0 1px 2px rgba(0,0,0,.2); }
p { line-height: 1.5; max-width: 65ch; }`);
  const hit = await auditIds(slop);
  const missed = SLOP_IDS.filter((id) => !hit.has(id));
  assert.deepEqual(missed, [], 'slop fixture must trip every rule');
  const quiet = await auditIds(clean);
  assert.deepEqual(SLOP_IDS.filter((id) => quiet.has(id)), [], 'a considered page must not trip slop rules');
});
test('audit', 'rendered checks see stuck content, long lines, edges, flat hierarchy and nested cards', async () => {
  const dir = path.join(tmp, 'rendered');
  fs.mkdirSync(dir);
  const long = 'The paragraph runs the full width of a desktop window so its lines are far longer than anyone can track back across. '.repeat(3);
  fs.writeFileSync(path.join(dir, 'index.html'), `<html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body { margin: 0; font: 16px/1.5 sans-serif; } h1 { font-size: 18px; } p { margin: 0; }
.card { border: 1px solid #ccc; padding: 8px; }</style></head><body><main>
<h1>Almost body sized</h1><p>${long}</p><p style="opacity:0">This entrance never ran, so the paragraph stays invisible.</p>
<div class="card"><div class="card">A card inside a card, both boxed.</div></div></main></body></html>`);
  const hit = await auditIds(dir, ['--render']);
  for (const id of ['L06', 'L07', 'L08', 'T08', 'X20']) assert.ok(hit.has(id), `rendered audit must report ${id}`);
  // Earned shapes stay quiet: a GL mirror under its canvas, an SVG wordmark as the h1, a padded caption.
  const quiet = path.join(tmp, 'rendered-quiet');
  fs.mkdirSync(quiet);
  fs.writeFileSync(path.join(quiet, 'index.html'), `<html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body { margin: 0; font: 16px/1.5 sans-serif; } canvas { position: fixed; inset: 0; width: 100%; height: 100%; }
.mirror { visibility: hidden; font-size: 64px; } .caption { margin: 0; padding: 0 20px; max-width: 60ch; }</style></head><body><main>
<canvas aria-hidden="true"></canvas><h1><span style="position:absolute;clip:rect(0 0 0 0)">Field</span><svg viewBox="0 0 10 2" width="300" aria-hidden="true"><rect width="10" height="2"/></svg></h1>
<h2 class="mirror">The whole page ripples in your wake.</h2>
<p class="caption">Saltmarsh Ferry, wayfinding for a tidal crossing that keeps its text inset from both edges of a phone screen.</p></main></body></html>`);
  const calm = await auditIds(quiet, ['--render']);
  assert.deepEqual(['L06', 'L08', 'T08'].filter((id) => calm.has(id)), [], 'earned shapes must not trip rendered rules');
});

test('ticker', 'pause/resume never duplicates callbacks and teardown stops scheduling', () => {
  for (const file of ['recipes/_shared/raf.js', 'assets/scaffold/vite-vanilla/src/lib/raf.js']) {
    const callbacks = new Map();
    let id = 0;
    const context = {
      document: { hidden: false, addEventListener() {} },
      requestAnimationFrame: (fn) => { callbacks.set(++id, fn); return id; },
      cancelAnimationFrame: (key) => callbacks.delete(key),
    };
    vm.runInNewContext(fs.readFileSync(path.join(plugin, file), 'utf8').replaceAll('export ', '') + '\nglobalThis.clock = ticker;', context);
    let ticks = 0;
    const stop = context.clock.add(() => ticks++);
    context.clock.pause();
    context.clock.resume();
    assert.equal(callbacks.size, 1, file + ': one scheduled frame after resume');
    const pending = [...callbacks.values()];
    callbacks.clear();
    pending.forEach((fn) => fn(16));
    assert.equal(ticks, 1);
    stop();
    assert.equal(callbacks.size, 0, file + ': last unsubscribe cancels the clock');
    context.clock.resume();
    assert.equal(callbacks.size, 0, file + ': empty ticker stays idle');
  }
});

test('capture', 'invalid plans fail before browser discovery or output writes', async () => {
  const plan = path.join(tmp, 'invalid.json');
  const out = path.join(tmp, 'invalid-output');
  const invalid = [
    [{ name: '../escape', actions: [] }],
    [{ name: 'same', actions: [] }, { name: 'same', actions: [] }],
    [{ name: 'bad-action', actions: [{ type: 'unknown' }] }],
    [{ name: 'bad-wait', actions: [{ type: 'wait', ms: -1 }] }],
    [{ name: 'code', actions: [{ type: 'waitFor', fn: 'fetch("/mutate")' }] }],
  ];
  for (const states of invalid) {
    json(plan, states);
    const result = await run('scripts/capture.mjs', [project, '--states', plan, '--out', out], { PATH: '', AWARDS_PLAYWRIGHT: '' });
    assert.equal(result.code, 1, 'invalid capture plan must be rejected: ' + JSON.stringify(states));
    assert.equal(fs.existsSync(out), false);
  }
});

test('capture', 'named states perform clicks, keyboard input, drag and reload; failures preserve evidence', async () => {
  fs.writeFileSync(path.join(project, 'index.html'), [
    '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width"><link rel="icon" href="data:,"><title>Behavior fixture</title></head><body>',
    '<button id="open">Open</button><dialog id="menu"><button id="first" autofocus>First</button><button id="last">Last</button></dialog>',
    '<input id="range" type="range" value="20" style="position:absolute;top:200px;left:20px;width:200px;height:30px">',
    '<button id="count">Count</button><script>',
    'const menu=document.querySelector("#menu");document.querySelector("#open").onclick=()=>menu.showModal();',
    'document.querySelector("#count").onclick=()=>sessionStorage.setItem("count","1");',
    'window.__awards={ready:Promise.resolve(true),scrollTo:()=>{},state:()=>({open:menu.open,active:document.activeElement.id,value:Number(document.querySelector("#range").value),count:sessionStorage.getItem("count")})};',
    '</script></body></html>',
  ].join('\n'));
  const plan = path.join(tmp, 'states.json');
  json(plan, [
    { name: 'menu-open', actions: [{ type: 'click', selector: '#open' }, { type: 'waitFor', selector: '#menu', state: 'visible' }], selector: '#menu' },
    { name: 'keyboard', actions: [{ type: 'focus', selector: '#open' }, { type: 'press', key: 'Enter' }, { type: 'press', key: 'Tab' }] },
    { name: 'escape', actions: [{ type: 'click', selector: '#open' }, { type: 'press', key: 'Escape' }, { type: 'waitFor', selector: '#menu', state: 'hidden' }] },
    { name: 'drag', actions: [{ type: 'move', x: 65, y: 215 }, { type: 'down' }, { type: 'move', x: 205, y: 215 }, { type: 'up' }] },
    { name: 'reload', actions: [{ type: 'click', selector: '#count' }, { type: 'reload' }] },
    { name: 'missing', actions: [{ type: 'click', selector: '#missing', timeout: 50 }] },
    { name: 'after-failure', actions: [{ type: 'click', selector: '#open' }] },
  ]);
  const out = path.join(tmp, 'captures');
  const result = await run('scripts/capture.mjs', [project, '--states', plan, '--out', out, '--only', 'desktop', '--scroll', '0', '--reduced-motion', '--wait', '20', '--json']);
  assert.equal(result.code, 2, result.stderr || 'the missing action must fail the capture pass');
  const manifest = JSON.parse(fs.readFileSync(path.join(out, 'manifest.json')));
  assert.equal(manifest.consoleErrors.length, 0);
  assert.equal(manifest.pageErrors.length, 2, 'one missing action in each viewport');
  for (const label of ['desktop', 'desktop-rm']) {
    assert.ok(manifest.captures.some((shot) => shot.label === label && shot.kind === 'scroll'));
    const state = (name) => manifest.captures.find((shot) => shot.label === label && shot.name === name);
    assert.equal(state('menu-open')?.awardsState.open, true);
    assert.equal(state('keyboard')?.awardsState.active, 'last');
    assert.equal(state('escape')?.awardsState.open, false);
    assert.equal(state('escape')?.awardsState.active, 'open');
    assert.ok(state('drag')?.awardsState.value > 70, 'pointer drag changes the real slider');
    assert.equal(state('reload')?.awardsState.count, '1');
    assert.equal(state('missing'), undefined);
    assert.equal(state('after-failure')?.awardsState.open, true);
    assert.equal(fs.readFileSync(state('menu-open').file).subarray(1, 4).toString(), 'PNG');
    assert.ok(fs.readFileSync(state('menu-open').file).readUInt32BE(16) < 1440, 'selector capture crops the dialog');
  }
});

test('doctor', 'reports real capabilities and leaves project configuration untouched', async () => {
  const result = await run('scripts/doctor.mjs', [project, '--json']);
  assert.equal(result.code, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.ready, true);
  for (const id of ['node', 'npm', 'outputs', 'playwright', 'chromium']) {
    assert.equal(report.checks.find((check) => check.id === id)?.status, 'pass', id);
  }
  assert.equal(fs.readFileSync(path.join(project, 'AWARDS.md'), 'utf8'), '# Awards\n');
  assert.equal(fs.existsSync(path.join(project, '.awards')), false, 'no output directories created by doctor');
  assert.equal(fs.readdirSync(project).some((file) => file.startsWith('.awards-check-')), false);
});
test('doctor', 'missing tools, dependencies and blocked output paths are actionable failures', async () => {
  const missing = await run('scripts/doctor.mjs', [project, '--json'], { PATH: '', AWARDS_PLAYWRIGHT: '' });
  assert.equal(missing.code, 2);
  const report = JSON.parse(missing.stdout);
  assert.equal(report.ready, false);
  assert.equal(report.checks.find((check) => check.id === 'playwright')?.status, 'fail');
  fs.writeFileSync(path.join(project, '.awards'), 'must survive');
  json(path.join(project, 'package.json'), { scripts: { build: 'vite build' }, devDependencies: { 'awards-missing-package': '1.0.0' } });
  try {
    const blocked = await run('scripts/doctor.mjs', [project, '--json']);
    assert.equal(blocked.code, 2);
    const checks = JSON.parse(blocked.stdout).checks;
    for (const id of ['dependencies', 'outputs']) assert.equal(checks.find((check) => check.id === id)?.status, 'fail');
    assert.equal(fs.readFileSync(path.join(project, '.awards'), 'utf8'), 'must survive');
    json(path.join(project, 'package.json'), []);
    const invalid = await run('scripts/doctor.mjs', [project, '--json'], { PATH: '', AWARDS_PLAYWRIGHT: '' });
    assert.equal(JSON.parse(invalid.stdout).checks.find((check) => check.id === 'dependencies')?.status, 'fail');
  } finally {
    fs.unlinkSync(path.join(project, '.awards'));
    fs.unlinkSync(path.join(project, 'package.json'));
  }
});
test('doctor', 'a broken explicit browser path fails preflight and preserves a capture manifest', async () => {
  const env = { AWARDS_CHROMIUM: path.join(tmp, 'missing-chromium') };
  const result = await run('scripts/doctor.mjs', [project, '--json'], env);
  assert.equal(result.code, 2, 'an invalid explicit executable must not fall back silently');
  assert.equal(JSON.parse(result.stdout).checks.find((check) => check.id === 'chromium')?.status, 'fail');
  const out = path.join(tmp, 'browser-failure');
  const capture = await run('scripts/capture.mjs', [project, '--out', out, '--only', 'desktop'], env);
  assert.equal(capture.code, 3);
  assert.match(JSON.parse(fs.readFileSync(path.join(out, 'manifest.json'))).pageErrors.join('\n'), /missing-chromium/);
});

let starterUrl;
test('starter', 'optional WebGL cannot block readiness or animate under reduced motion', async () => {
  const starter = path.join(tmp, 'starter');
  fs.cpSync(path.join(plugin, 'assets/scaffold/vite-vanilla'), starter, { recursive: true });
  const deps = path.join(plugin, 'recipes/node_modules');
  assert.ok(fs.existsSync(path.join(deps, 'vite')), 'Run npm ci in recipes first');
  fs.symlinkSync(deps, path.join(starter, 'node_modules'), 'junction');
  const { build } = await import(pathToFileURL(path.join(deps, 'vite/dist/node/index.js')));
  await build({ root: starter, logLevel: 'silent' });
  starterUrl = await serve(path.join(starter, 'dist'));
  const b = await getBrowser();
  for (const mode of ['no-webgl', 'reduced-motion', 'normal']) {
    const context = await b.newContext({ reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference' });
    await context.addInitScript(({ mode }) => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
      if (mode === 'no-webgl') {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) { return /webgl/i.test(type) ? null : original.call(this, type, ...args); };
      }
    }, { mode });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
      await page.goto(starterUrl);
      const ready = await page.evaluate(() => Promise.race([window.__awards.ready, new Promise((resolve) => setTimeout(() => resolve(false), 4000))]));
      assert.equal(ready, true, mode + ': fallback must become ready');
      if (mode !== 'normal') assert.equal(await page.locator('canvas').count(), 0, mode + ': no animated GL scene');
      else {
        assert.equal(await page.locator('canvas').count(), 1, 'full-motion scene actually mounts');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(() => document.querySelectorAll('canvas').length === 0, null, { timeout: 3000 });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.waitForFunction(() => document.querySelectorAll('canvas').length === 1, null, { timeout: 3000 });
      }
      assert.deepEqual(errors, [], mode + ': no uncaught runtime errors');
    } finally { await context.close(); }
  }
});

test('menu', 'the shipped overlay traps focus and Escape restores its trigger', async () => {
  const { build } = await import(pathToFileURL(path.join(plugin, 'recipes/node_modules/vite/dist/node/index.js')));
  const out = path.join(tmp, 'recipes');
  await build({ root: path.join(plugin, 'recipes'), build: { outDir: out }, logLevel: 'silent' });
  const url = await serve(out);
  const context = await (await getBrowser()).newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await page.goto(url + 'nav-overlay-fullscreen/index.html');
    await page.locator('[data-menu-toggle]').focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__awards.state().open && !window.__awards.state().animating);
    assert.equal(await page.locator('[data-page]').evaluate((el) => el.inert), true);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press(i < 6 ? 'Tab' : 'Shift+Tab');
      assert.equal(await page.evaluate(() => document.querySelector('[data-menu]').contains(document.activeElement) || document.activeElement.matches('[data-menu-toggle]')), true);
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-menu]').evaluate((el) => el.hidden), true);
    assert.equal(await page.evaluate(() => document.activeElement.matches('[data-menu-toggle]')), true);
  } finally { await context.close(); }
});

let failures = 0;
try {
  assert.ok(tests.length, 'No matching behavior checks');
  for (const { name, run } of tests) {
    try { await run(); console.log('PASS ' + name); }
    catch (error) { failures++; console.error('FAIL ' + name + '\n  ' + error.message); }
  }
} finally {
  if (browser) await browser.close();
  for (const server of servers) await server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log((tests.length - failures) + '/' + tests.length + ' behavior checks pass');
process.exitCode = failures ? 1 : 0;
