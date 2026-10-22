#!/usr/bin/env node
// Real tool/browser regressions; no model calls. Run serially, never beside verify-recipes.
// Usage: node evals/behavior.mjs [--only server,audit,tools,ticker,capture,doctor,starter,menu]
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
// A host without Playwright: an empty NODE_PATH too, or a global install would still resolve through it.
const NO_BROWSER = { PATH: '', AWARDS_PLAYWRIGHT: '', NODE_PATH: '' };
const run = (script, argv = [], env = {}) => new Promise((resolve, reject) => {
  execFile(process.execPath, [path.join(plugin, script), ...argv], {
    cwd: project, env: { ...process.env, CLAUDE_PROJECT_DIR: '', AWARDS_HOOK: '', ...env },
    timeout: 180000, maxBuffer: 8 * 1024 * 1024,
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

test('server', 'dot-paths are refused and no cross-origin header is sent', async () => {
  const dir = path.join(tmp, 'dots');
  fs.mkdirSync(path.join(dir, '.git'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.env'), 'SECRET=1');
  fs.writeFileSync(path.join(dir, '.git', 'config'), '[core]');
  fs.writeFileSync(path.join(dir, 'index.html'), 'ok');
  const url = await serve(dir);
  const page = await fetch(url);
  assert.equal(page.status, 200);
  assert.equal(page.headers.get('access-control-allow-origin'), null);
  for (const route of ['.env', '.git/config', '%2eenv']) assert.equal((await fetch(url + route)).status, 403, 'must not serve ' + route);
});
test('audit', 'scoped exceptions, line ignores and comment-proof checks', async () => {
  const dir = path.join(tmp, 'scoped');
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'AWARDS.md'), '# A\n\n## Exceptions\n<!-- one per line: `C02 — pure black is diegetic` -->\n- T01@src/a.css — the wordmark face\n');
  fs.writeFileSync(path.join(dir, 'src', 'a.css'), 'h1 { font-family: Inter, sans-serif; }\n');
  fs.writeFileSync(path.join(dir, 'src', 'b.css'), 'h2 { font-family: Inter, sans-serif; color: #000; }\n/* prefers-reduced-motion is handled later */\n.x { transition: opacity .3s; }\n.tbody { background: #000; }\n');
  const report = JSON.parse((await run('scripts/audit.mjs', [dir, '--json', '--no-write'])).stdout);
  const t01 = report.findings.filter((f) => f.rule === 'T01').map((f) => path.basename(f.file));
  assert.deepEqual(t01, ['b.css'], 'the scoped exception covers a.css only');
  assert.equal(report.exceptions.includes('C02'), false, "the template's comment example is not an exception");
  assert.ok(report.findings.some((f) => f.rule === 'M01'), 'a comment naming the query is not a reduced-motion branch');
});
test('tools', 'owner policy, the AWARDS.md log writer and the jury reply check', async () => {
  const site = path.join(tmp, 'policy');
  fs.mkdirSync(path.join(site, 'work'), { recursive: true });
  fs.writeFileSync(path.join(site, 'robots.txt'), 'User-agent: *\nAllow: /\n\nUser-agent: ClaudeBot\nDisallow: /work/\n');
  fs.writeFileSync(path.join(site, 'index.html'), '<html><head><meta name="robots" content="index, noai"></head><body>x</body></html>');
  fs.writeFileSync(path.join(site, 'work', 'index.html'), 'w');
  fs.mkdirSync(path.join(site, 'open'));
  fs.writeFileSync(path.join(site, 'open', 'index.html'), '<html><head></head><body>open</body></html>');
  const url = await serve(site);
  const policy = async (route) => (await run('scripts/policy.mjs', [url + route])).code;
  assert.deepEqual([await policy(''), await policy('work/'), await policy('open/')], [2, 2, 0], 'meta noai and a ClaudeBot disallow refuse; an open page passes');
  const md = path.join(tmp, 'log-AWARDS.md');
  fs.copyFileSync(path.join(plugin, 'assets/templates/AWARDS.md'), md);
  await run('scripts/awards-log.mjs', [md, '--append', 'Jury log', '--line', '- 2026-10-22 · fix · test', '--line', '  top fixes: 1) a']);
  await run('scripts/awards-log.mjs', [md, '--status', 'Jury disposition', '--value', 'fix · 2026-10-22', '--tick']);
  const after = fs.readFileSync(md, 'utf8'), before = fs.readFileSync(path.join(plugin, 'assets/templates/AWARDS.md'), 'utf8');
  assert.match(after, /^- \[x\] Jury disposition: fix · 2026-10-22$/m);
  assert.match(after, /## Jury log\n<!--[^\n]*-->\n- 2026-10-22 · fix · test\n  top fixes: 1\) a\n/);
  assert.equal(after.split('\n').length, before.split('\n').length + 2, 'nothing else in the file moved');
  const { check } = await import(pathToFileURL(path.join(plugin, 'scripts/jury-reply-check.mjs')).href);
  assert.equal(check({ agent_type: 'awards:awards-jury', last_assistant_message: 'Scores follow.' })?.decision, 'block');
  assert.equal(check({ agent_type: 'awards:awards-jury', last_assistant_message: 'x\ndisposition: fix\nDesign 6' }), null);
  assert.equal(check({ agent_type: 'awards:awards-jury', stop_hook_active: true, last_assistant_message: '' }), null, 'never loops');
  assert.equal(check({ agent_type: 'Explore', last_assistant_message: '' }), null, 'other subagents pass');
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
  const missing = await run('scripts/audit.mjs', [project, '--render', '--no-write'], NO_BROWSER);
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
test('audit', 'BEM eyebrows, micro-meta and a bounded Exceptions section', async () => {
  const dir = path.join(tmp, 'holes');
  const recipe = path.join(tmp, 'catalogue', 'recipes', 'demo');
  fs.mkdirSync(dir);
  fs.mkdirSync(recipe, { recursive: true });
  const page = (body) => `<html lang="en"><head><meta name="viewport" content="width=device-width"></head><body><main>${body}</main></body></html>`;
  // The scaffold hero as it shipped through 0.5.0: one `/ 01` label above the thesis.
  fs.writeFileSync(path.join(dir, 'scaffold.html'), page('<header><nav><a href="/">__PROJECT_NAME__</a></nav></header><section class="section hero wrap"><p class="label">/ 01</p><h1 class="display">Replace this with the thesis.</h1></section>'));
  fs.writeFileSync(path.join(dir, 'bem.html'), page('<p class="hero__eyebrow">Field notes</p><h1>Tides</h1>\n<p class="card-kicker">Vol. 2</p><h2>Ebb</h2>'));
  fs.writeFileSync(path.join(dir, 'issue.html'), page('<p>Field notes No. 01</p><h1>Tides</h1>'));
  fs.writeFileSync(path.join(dir, 'quiet.html'), page('<h1>Tides</h1><p>High water 12/03 at 06:10, slide 01 / 08, ratio 3 / 4.</p>'));
  const report = async (target, argv = []) => JSON.parse((await run('scripts/audit.mjs', [target, '--json', '--no-write', ...argv])).stdout).findings;
  const where = (findings, rule) => findings.filter((f) => f.rule === rule).map((f) => path.basename(f.file)).sort();
  let found = await report(dir);
  assert.deepEqual(where(found, 'L05'), ['bem.html', 'bem.html'], 'hero__eyebrow and card-kicker are eyebrows');
  assert.deepEqual(where(found, 'X07'), ['issue.html', 'scaffold.html'], 'the old scaffold hero and No. 01 flag; dates and counters do not');
  assert.ok(found.filter((f) => f.rule === 'X07').every((f) => f.severity === 'P3'), 'X07 stays P3 in a user build');
  // Recipe severity is for the plugin's own catalogue, not for any folder a user happens to call recipes.
  fs.writeFileSync(path.join(recipe, 'index.html'), page('<p class="label">/ 01</p><h1>Demo</h1>'));
  found = await report(recipe);
  assert.equal(found.find((f) => f.rule === 'X07')?.severity, 'P3', 'X07 stays P3 in a user folder named recipes/');
  const own = path.join(plugin, 'recipes', `_behavior-${process.pid}`);
  fs.mkdirSync(own);
  try {
    fs.writeFileSync(path.join(own, 'index.html'), page('<p class="label">/ 01</p><h1>Demo</h1>'));
    found = await report(own);
    assert.equal(found.find((f) => f.rule === 'X07')?.severity, 'P2', 'X07 is P2 inside the plugin catalogue');
  } finally { fs.rmSync(own, { recursive: true, force: true }); }
  // Exceptions stop at the next level-2 heading: X07 listed there is waived, L05 under ## Log is not.
  fs.writeFileSync(path.join(dir, 'AWARDS.md'), '# Awards\n\n## Exceptions\n\n- X07: issue numbers are the archive\n\n## Log\n\n- L05 removed from the hero\n');
  found = await report(dir);
  assert.deepEqual(where(found, 'X07'), [], 'X07 is excepted');
  assert.equal(where(found, 'L05').length, 2, 'a rule id after the Exceptions section is not an exception');
});
test('audit', 'the edit hook answers project questions from the whole project, finds nested builds and stays fast', async () => {
  const dir = path.join(tmp, 'hooked');
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'AWARDS.md'), '# Awards\n');
  fs.writeFileSync(path.join(dir, 'src', 'main.js'), "gsap.to('.hero', { opacity: 1 });\nel.addEventListener('pointerdown', grab);\n");
  fs.writeFileSync(path.join(dir, 'src', 'button.css'), '.btn:focus { outline: none; }\n');
  fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width"></head><body><main><button class="btn">Open</button></main></body></html>');
  const hook = async (file, env) => {
    const out = (await run('scripts/audit.mjs', ['--quick', '--changed-file', path.join(dir, file)], env)).stdout.trim();
    return out ? JSON.parse(out).hookSpecificOutput.additionalContext : '';
  };
  const says = (text, id) => text.includes(`- ${id} `);
  assert.ok(says(await hook('src/main.js'), 'M01') && says(await hook('src/main.js'), 'A11'), 'control: nothing handles reduced motion or keys yet');
  assert.ok(says(await hook('src/button.css'), 'A07'), 'control: no focus-visible style yet');
  // The answers live in other modules, as they do in the scaffold.
  fs.writeFileSync(path.join(dir, 'src', 'base.css'), 'a:focus-visible, button:focus-visible { outline: 2px solid currentColor; }\n');
  fs.writeFileSync(path.join(dir, 'src', 'reduced-motion.js'), "export const reduced = matchMedia('(prefers-reduced-motion: reduce)');\n");
  fs.writeFileSync(path.join(dir, 'src', 'keys.js'), "addEventListener('keydown', (e) => e.key);\n");
  for (const file of ['src/main.js', 'src/button.css', 'index.html']) {
    const said = await hook(file);
    for (const id of ['M01', 'A06', 'A07', 'A11']) assert.ok(!says(said, id), `${file}: ${id} is handled elsewhere in the project`);
  }
  // A build in a subfolder of the open project is still audited.
  fs.writeFileSync(path.join(dir, 'src', 'tight.css'), '.title { letter-spacing: -0.08em; }\n');
  assert.ok(says(await hook('src/tight.css', { CLAUDE_PROJECT_DIR: tmp }), 'T04'), 'AWARDS.md below CLAUDE_PROJECT_DIR is found');
  // Line numbers are indexed, not rescanned: a 1.2 MB stylesheet took over a minute before.
  fs.writeFileSync(path.join(dir, 'src', 'big.css'), Array.from({ length: 20000 }, (_, i) => `.b${i} {\n  letter-spacing: -0.08em;\n}\n`).join(''));
  const started = Date.now();
  const big = await hook('src/big.css');
  assert.ok(Date.now() - started < 4000, `the hook must stay inside its 5 s budget (${Date.now() - started} ms)`);
  assert.match(big, /T04 \(P2\)[^\n]*\[line 2\]/, 'line numbers stay exact');
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
  assert.equal(hit.has('C05'), false, 'no DESIGN.md, no ground check');
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
test('audit', 'rendered contrast measures each text against what is behind it, focus states included', async () => {
  const report = async (dir) => JSON.parse((await run('scripts/audit.mjs', [dir, '--render', '--json', '--no-write'])).stdout);
  const page = (style, body) => `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
html { background: #f4f2ee; } body { margin: 0; color: #1a1c1c; font: 16px/1.5 sans-serif; } ${style}</style></head><body><main>${body}</main></body></html>`;
  const quiet = path.join(tmp, 'contrast-quiet');
  fs.mkdirSync(quiet);
  // The ground sits on html, not body (the old check read the transparent body as black); text over an
  // image is unmeasured; large text needs 3:1; a translucent card composites over the ground.
  fs.writeFileSync(path.join(quiet, 'index.html'), page(`.hero { height: 200px; background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4" fill="%23333"/></svg>'); color: #eee; }
.big { font-size: 32px; color: #8a8580; } .card { background: rgba(255,255,255,.6); padding: 8px; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); color: #f4f2ee; }
a, button { color: #1a1c1c; } a:focus-visible, button:focus-visible { outline: 2px solid #1a1c1c; outline-offset: 2px; }`,
  `<section class="hero"><h1>Text over a photograph</h1></section><p>Ink on a ground painted on html.</p><p class="big">Large grey text at about 3.3:1</p>
<div class="card"><p>Ink on a translucent card.</p></div><span class="sr">Screen-reader only</span><a href="#a">A link</a> <button>A button</button>`));
  const calm = (await report(quiet)).findings.filter((f) => ['C01', 'A12'].includes(f.rule));
  assert.deepEqual(calm.map((f) => `${f.rule} ${f.message}`), [], 'measured text that passes must stay quiet');
  const loud = path.join(tmp, 'contrast-loud');
  fs.mkdirSync(loud);
  fs.writeFileSync(path.join(loud, 'index.html'), page(`.washed { color: #c9c6c0; } .ok { color: oklch(0.85 0 0); }
.panel { position: relative; height: 80px; } .under { position: absolute; inset: 0; background: #222; } .over { position: relative; color: #444; }
button { color: #1a1c1c; background: #f4f2ee; border: 1px solid; } button:focus-visible { background: #1a1c1c; color: #2a2a2a; outline: none; }
a { color: #1a1c1c; } a:focus-visible { outline: 2px solid #e8e6e2; outline-offset: 2px; }`,
  `<h1>Fails</h1><p class="washed">A washed paragraph.</p><p class="ok">An oklch grey.</p>
<div class="panel"><div class="under"></div><p class="over">Dark text on a positioned dark panel.</p></div><a href="#a">A faint ring</a> <button>A vanishing label</button>`));
  const found = (await report(loud)).findings;
  const said = (rule, text) => found.some((f) => f.rule === rule && f.message.includes(text));
  for (const text of ['A washed paragraph', 'An oklch grey', 'positioned dark panel']) assert.ok(said('C01', text), `C01 must name “${text}”`);
  assert.ok(found.some((f) => f.rule === 'C01' && f.file.includes('focus') && f.message.includes('A vanishing label')), 'a label that vanishes in its focus state is C01');
  assert.ok(said('A12', 'A faint ring'), 'a ring at 1.1:1 against the ground is A12');
});
test('audit', 'semantics, skip links, ids, touch targets and axe-core', async () => {
  const dir = path.join(tmp, 'semantics');
  const good = path.join(tmp, 'semantics-good');
  fs.mkdirSync(dir);
  fs.mkdirSync(good);
  fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title></title><style>
body { margin: 0; font: 16px/1.5 sans-serif; } .dots button { width: 14px; height: 14px; padding: 0; margin: 0 2px; }</style></head><body>
<header><nav><a href="/">Home</a> <a href="/work">Work</a></nav></header><main><h1 id="title">Semantics</h1><p id="title">A second element with the same id.</p>
<div class="dots"><button aria-label="Slide 1"></button><button aria-label="Slide 2"></button></div><button></button></main></body></html>`);
  fs.writeFileSync(path.join(good, 'index.html'), `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tide tables — Saltmarsh Ferry</title>
<meta name="description" content="Crossing times for the ferry, by tide."><meta property="og:title" content="Tide tables"><meta property="og:description" content="Crossing times, by tide.">
<link rel="canonical" href="https://example.org/tides/"></head><body><a class="skip" href="#main">Skip to content</a><header><nav><a href="/">Home</a></nav></header>
<main id="main"><h1>Tide tables</h1><p>Crossings follow the tide, so the times move every day.</p></main></body></html>`);
  const report = async (target, argv = []) => JSON.parse((await run('scripts/audit.mjs', [target, '--json', '--no-write', ...argv])).stdout);
  const ids = (r) => new Set(r.findings.map((f) => f.rule));
  const bad = ids(await report(dir));
  for (const id of ['S07', 'S08', 'S09', 'S10', 'A13', 'A15']) assert.ok(bad.has(id), `${id} must fire`);
  const fine = ids(await report(good));
  assert.deepEqual(['S07', 'S08', 'S09', 'S10', 'A13', 'A15'].filter((id) => fine.has(id)), [], 'a complete head and a skip link stay quiet');
  const rendered = await report(dir, ['--render']);
  assert.ok(rendered.findings.some((f) => f.rule === 'A14' && /Slide/.test(f.message)), 'two 14 px dots side by side are A14');
  const a18 = rendered.findings.find((f) => f.rule === 'A18');
  assert.ok(a18 && /Home/.test(a18.message) && !/Slide/.test(a18.message), 'a nav link one line tall is A18; what A14 reports is not counted twice');
  assert.match(rendered.axe ?? '', /^axe-core \d/, 'axe-core resolves from the plugin recipes');
  assert.ok(rendered.findings.some((f) => f.rule === 'A16' && /button-name/.test(f.message) && f.severity === 'P1'), 'an unnamed button is a critical axe finding');
});
test('audit', 'rendered ground must match the DESIGN.md ground token', async () => {
  const dir = path.join(tmp, 'ground');
  fs.mkdirSync(dir);
  const page = (css) => fs.writeFileSync(path.join(dir, 'index.html'), `<html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><main><h1>Tides</h1></main></body></html>`);
  fs.writeFileSync(path.join(dir, 'DESIGN.md'), '---\nname: tides\ncolors:\n  ground: "oklch(0.96 0.01 80)"\n  ink: "#1a1c1c"\n---\n');
  page('html { background: oklch(0.96 0.01 80); }');
  assert.equal((await auditIds(dir, ['--render'])).has('C05'), false, 'html fill carries the ground, in any colour syntax');
  page('body { background: #ffffff; }');
  assert.ok((await auditIds(dir, ['--render'])).has('C05'), 'a body fill off the token is reported');
  page('body { background: oklch(0.96 0.01 80); } main { background: #202020; }');
  assert.ok((await auditIds(dir, ['--render'])).has('C05'), 'a main fill off the token is reported');
  page('');
  assert.ok((await auditIds(dir, ['--render'])).has('C05'), 'an unpainted ground is reported');
  fs.writeFileSync(path.join(dir, 'DESIGN.md'), '---\ncolors:\n  ground: "<derive: from the use scene>"\n---\n');
  assert.equal((await auditIds(dir, ['--render'])).has('C05'), false, 'an unfilled template token is silent');
});

test('audit', 'a rendered step that throws is an ERR finding, and a bundler project renders its build output', async () => {
  const broken = path.join(tmp, 'rendered-broken');
  fs.mkdirSync(broken);
  fs.writeFileSync(path.join(broken, 'index.html'), `<html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main><h1>Breaks its own styles</h1><p>The page replaces getComputedStyle once it has loaded.</p></main>
<script>addEventListener('load', () => { window.getComputedStyle = () => { throw new Error('styles unavailable'); }; });</script></body></html>`);
  const report = JSON.parse((await run('scripts/audit.mjs', [broken, '--render', '--json', '--no-write'])).stdout);
  assert.ok(report.findings.some((f) => f.rule === 'ERR' && f.severity === 'P1' && /rendered check did not run/.test(f.message)), 'a thrown in-page check must surface, not read clean');
  const app = path.join(tmp, 'bundled');
  fs.mkdirSync(path.join(app, 'src'), { recursive: true });
  json(path.join(app, 'package.json'), { name: 'bundled', type: 'module', scripts: { build: 'vite build' }, devDependencies: { vite: '8.3.0' } });
  fs.writeFileSync(path.join(app, 'index.html'), '<html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main><h1>Source</h1></main><script type="module" src="/src/main.js"></script></body></html>');
  fs.writeFileSync(path.join(app, 'src', 'main.js'), "import gsap from 'gsap';\ngsap.to('h1', { x: 10 });\n");
  const raw = JSON.parse((await run('scripts/audit.mjs', [app, '--render', '--json', '--no-write'])).stdout);
  assert.equal(raw.renderedFrom.from, 'source');
  assert.match(raw.renderedFrom.warning, /no build output/);
  assert.ok(raw.findings.some((f) => f.rule === 'ERR' && /module specifier/i.test(f.message)), 'an unresolved bare import names itself');
  fs.mkdirSync(path.join(app, 'dist'));
  fs.writeFileSync(path.join(app, 'dist', 'index.html'), '<html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main><h1>Built</h1><p>The build output resolves every import it needs.</p></main></body></html>');
  const built = JSON.parse((await run('scripts/audit.mjs', [app, '--render', '--json', '--no-write'])).stdout);
  assert.equal(built.renderedFrom.from, 'dist');
  assert.equal(built.findings.some((f) => f.rule === 'ERR'), false, 'the built page renders without module errors');
});
test('audit', 'blank viewports, lopsided phone sections, phone overflow and load-time layout shift', async () => {
  const dir = path.join(tmp, 'rendered-layout');
  fs.mkdirSync(dir);
  const words = 'A column of running text long enough to count as a section, set in one narrow strip on the left of a phone. ';
  fs.writeFileSync(path.join(dir, 'index.html'), `<html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body { margin: 0; font: 16px/1.5 sans-serif; } section { min-height: 60vh; padding: 20px; } .gap { height: 250vh; padding: 0; }
.narrow p { width: 30%; } .wide { width: 1400px; height: 10px; background: #ddd; }</style></head><body><main>
<section><h1>Top of the page</h1><p>${words}</p></section><section class="gap" aria-hidden="true"></section>
<section class="narrow"><p>${words}</p><p>${words}</p></section><section><div class="wide"></div><p>${words}</p></section></main>
<script>setTimeout(() => { const b = document.createElement('div'); b.style.height = '400px'; document.querySelector('main').prepend(b); }, 400);</script></body></html>`);
  const hit = await auditIds(dir, ['--render']);
  for (const id of ['L09', 'L10', 'L02', 'P08']) assert.ok(hit.has(id), `rendered audit must report ${id}`);
  const quiet = await auditIds(path.join(tmp, 'rendered-quiet'), ['--render']);
  assert.deepEqual(['L09', 'L10', 'L02', 'P08'].filter((id) => quiet.has(id)), [], 'a page with no gaps, no strip and no late block stays quiet');
});
test('tools', 'engine ranges, the calibration count and an offline regrade', async () => {
  const { satisfies, drift } = await import(pathToFileURL(path.join(plugin, 'scripts/lib/semver.mjs')).href);
  assert.equal(satisfies('22.22.0', '^22.22.3 || ^24.15.0 || >=26.0.0'), false);
  assert.equal(satisfies('24.15.0', '^22.22.3 || ^24.15.0 || >=26.0.0'), true);
  assert.equal(satisfies('20.19.0', '^20.19.0 || >=22.12.0'), true);
  assert.deepEqual([drift('2.70.3', '3.1.0'), drift('0.0.35', '0.0.36'), drift('8.3.0', '8.3.5'), drift('1.9.1', '1.9.1')], ['major', 'major', 'patch', 'same']);
  const proj = path.join(tmp, 'engines');
  fs.mkdirSync(path.join(proj, 'node_modules', 'fakefw'), { recursive: true });
  json(path.join(proj, 'package.json'), { name: 'engines', dependencies: { fakefw: '1.0.0' } });
  json(path.join(proj, 'node_modules', 'fakefw', 'package.json'), { name: 'fakefw', version: '1.0.0', engines: { node: '>=99' } });
  const doctor = JSON.parse((await run('scripts/doctor.mjs', [proj, '--json'])).stdout);
  const engines = doctor.checks.find((c) => c.id === 'node-engines');
  assert.equal(engines.status, 'fail');
  assert.match(engines.detail, /fakefw 1\.0\.0 \(>=99\)/);
  const cal = JSON.parse((await run('scripts/calibration.mjs', ['--json', '--since', '2021'])).stdout);
  assert.ok(cal.entries.length >= 30 && cal.developer.accessibility.max <= 10, 'every scored card parses');
  const ws = path.join(tmp, 'regrade');
  fs.mkdirSync(ws);
  fs.copyFileSync(path.join(plugin, 'evals/resume-after-system/fixture/AWARDS.md'), path.join(ws, 'AWARDS.md'));
  fs.writeFileSync(path.join(ws, 'session.jsonl'), [{ type: 'assistant', message: { role: 'assistant', content: [{ type: 'tool_use', name: 'Skill', input: { skill: 'awards:craft' } }] } }].map((e) => JSON.stringify(e)).join('\n') + '\n');
  const regrade = await run('evals/regrade.mjs', ['resume-after-system', ws, '--json']);
  const verdicts = Object.fromEntries(JSON.parse(regrade.stdout).graders.map((g) => [g.grader, g.verdict]));
  assert.deepEqual(verdicts, { 'contract-seed-kept': 'pass', 'no-second-deal': 'pass', 'page-map-filled': 'fail', 'resumed-through-craft': 'pass' });
  assert.equal(regrade.code, 1, 'a failing judged grader fails the regrade');
});
test('tools', 'the deal leads with a seeded dealt card and the route hint matches every eval grader', async () => {
  const roll = await run('scripts/roll.mjs', ['--deal', '3', '--of', '7', '--seed', 'a']);
  assert.match(roll.stdout, /^DEALT 1 2 7 of 7$/m, 'existing seeds keep their deal');
  assert.match(roll.stdout, /^LEAD 7$/m);
  const leads = new Set();
  for (const seed of 'abcdefghij') {
    const out = (await run('scripts/roll.mjs', ['--seed', seed])).stdout;
    const dealt = out.match(/^DEALT ([\d ]+) of/m)[1].split(' ').map(Number);
    const lead = Number(out.match(/^LEAD (\d+)$/m)[1]);
    assert.ok(dealt.includes(lead), `seed ${seed}: LEAD ${lead} is one of DEALT ${dealt}`);
    leads.add(lead === Math.min(...dealt));
  }
  assert.ok(leads.has(false), 'LEAD is not always the lowest dealt index');
  const hint = await run('scripts/route-hint.mjs', ['--selftest']);
  assert.equal(hint.code, 0, hint.stdout + hint.stderr);
});

test('tools', 'the scaffold adds only the missing files to a project the earlier phases started', async () => {
  const dir = path.join(tmp, 'started');
  fs.mkdirSync(path.join(dir, 'src', 'styles'), { recursive: true });
  const filled = {
    'AWARDS.md': '# Awards\n\n## Brief\n\nTide tables for the strait.\n',
    'DESIGN.md': '---\nname: tides\n---\n',
    'src/styles/tokens.css': ':root { --ground: #eef1f2; }\n',
    'index.html': '<!doctype html><title>Tides</title><main><h1>Tides</h1></main>',
  };
  for (const [file, text] of Object.entries(filled)) fs.writeFileSync(path.join(dir, file), text);
  const scaffold = (...extra) => run('scripts/new-project.mjs', ['--stack', 'vite', '--name', dir, ...extra]);
  assert.equal((await scaffold()).code, 1, 'a started project is refused without --keep-existing');
  const dry = await scaffold('--dry-run');
  assert.equal(dry.code, 0, 'a dry run lists a started project instead of refusing');
  assert.match(dry.stdout, /would keep \S*AWARDS\.md/);
  assert.match(dry.stdout, /would write \S*main\.js/);
  assert.equal(fs.existsSync(path.join(dir, 'src', 'main.js')), false, 'a dry run writes nothing');
  const kept = await scaffold('--keep-existing');
  assert.equal(kept.code, 0, kept.stderr);
  for (const [file, text] of Object.entries(filled)) assert.equal(fs.readFileSync(path.join(dir, file), 'utf8'), text, file + ' must stay as the earlier phase wrote it');
  assert.ok(fs.existsSync(path.join(dir, 'src', 'main.js')) && fs.existsSync(path.join(dir, 'src', 'lib', 'awards-hook.js')), 'the boot and shared modules are added');
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).dependencies.three, undefined, 'a written package.json is still trimmed without --webgl');
  assert.match(kept.stdout, /does not load the boot/, 'a kept index.html without the boot script is called out');
});
test('tools', 'after compaction the state card names the next phase and stays silent when there is nothing to resume', async () => {
  const dir = path.join(tmp, 'compacted');
  fs.mkdirSync(dir);
  const card = async () => (await run('scripts/state-card.mjs', ['--project', dir])).stdout.trim();
  assert.equal(await card(), '', 'silent without AWARDS.md');
  let md = fs.readFileSync(path.join(plugin, 'assets', 'templates', 'AWARDS.md'), 'utf8');
  for (const line of ['Brief captured', 'Direction contract locked (concept)', 'Visual system written', 'Page map and skeleton built (structure)']) md = md.replace('- [ ] ' + line, '- [x] ' + line);
  md = md.replace(/^- Deep modes:.*$/m, '- Deep modes: motion gsap · webgl none — declined');
  fs.writeFileSync(path.join(dir, 'AWARDS.md'), md);
  const said = JSON.parse(await card()).hookSpecificOutput;
  assert.equal(said.hookEventName, 'SessionStart');
  assert.match(said.additionalContext, /4 of 9 done; next "Stack booted \(stack\)" → awards:stack/);
  assert.match(said.additionalContext, /Deep modes: motion gsap/);
  fs.writeFileSync(path.join(dir, 'AWARDS.md'), md.replaceAll('- [ ]', '- [x]'));
  assert.equal(await card(), '', 'silent once every Status line is checked');
  fs.writeFileSync(path.join(dir, 'AWARDS.md'), md);
  assert.equal((await run('scripts/state-card.mjs', ['--project', dir], { AWARDS_HOOK: '0' })).stdout.trim(), '', 'AWARDS_HOOK=0 silences it');
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
    const result = await run('scripts/capture.mjs', [project, '--states', plan, '--out', out], NO_BROWSER);
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
  assert.equal(manifest.captures.some((shot) => shot.kind === 'hover'), false, 'a state plan replaces the default control frames');
});
test('capture', 'default hover and focus-visible frames for the first three visible controls', async () => {
  const dir = path.join(tmp, 'controls');
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width"><link rel="icon" href="data:,"><style>
a, button { display: block; margin: 8px; } a:hover, button:hover { background: #c00; } :focus-visible { outline: 3px solid #00c; } .low { margin-top: 1400px; }</style></head><body>
<a href="#hidden" style="display:none">Hidden</a><a href="#one">One</a><button>Two</button><button disabled>Off</button><a href="#three" class="low">Three</a><a href="#four">Four</a></body></html>`);
  const out = path.join(tmp, 'controls-out');
  const result = await run('scripts/capture.mjs', [dir, '--out', out, '--scroll', '0', '--wait', '20']);
  assert.equal(result.code, 0, result.stderr || result.stdout);
  const shots = JSON.parse(fs.readFileSync(path.join(out, 'manifest.json'))).captures.filter((shot) => ['hover', 'focus-visible'].includes(shot.kind));
  for (const kind of ['hover', 'focus-visible']) {
    const frames = shots.filter((shot) => shot.kind === kind);
    assert.deepEqual(frames.map((shot) => shot.element.text), ['One', 'Two', 'Three'], kind + ': first three visible, enabled controls');
    assert.ok(frames.every((shot) => shot.label === 'desktop' && shot.element.matched), kind + ': the control really took the state');
    assert.ok(frames.every((shot) => fs.readFileSync(shot.file).subarray(1, 4).toString() === 'PNG'));
  }
  fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><html lang="en"><head><link rel="icon" href="data:,"></head><body><p>No controls.</p></body></html>');
  const bare = await run('scripts/capture.mjs', [dir, '--out', path.join(tmp, 'controls-bare'), '--scroll', '0', '--wait', '20']);
  assert.equal(bare.code, 0, 'a page without controls still captures cleanly');
});

test('capture', 'tablet frames, accessibility trees, held-clock timeline frames and a per-frame baseline diff', async () => {
  const dir = path.join(tmp, 'timeline');
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>
body { margin: 0; font: 20px sans-serif; } #bar { height: 40px; background: #234; width: 0; }</style></head><body><main><h1>A bar that grows with page time</h1><div id="bar"></div></main>
<script>const t0 = performance.now(); const bar = document.getElementById('bar'); (function f(t) { bar.style.width = Math.min(100, (t - t0) / 20) + '%'; requestAnimationFrame(f); })(t0);</script></body></html>`);
  const first = path.join(tmp, 'timeline-a'), second = path.join(tmp, 'timeline-b');
  const a = await run('scripts/capture.mjs', [dir, '--out', first, '--scroll', '0', '--wait', '20', '--timeline', '0,600,1500']);
  assert.equal(a.code, 0, a.stderr || a.stdout);
  const m = JSON.parse(fs.readFileSync(path.join(first, 'manifest.json')));
  for (const f of ['tablet-s00.png', 'desktop-aria.yml', 'mobile-aria.yml', 'desktop-t00600.png', 'desktop-timeline.png']) assert.ok(fs.existsSync(path.join(first, f)), f + ' written');
  assert.match(fs.readFileSync(path.join(first, 'desktop-aria.yml'), 'utf8'), /heading "A bar that grows with page time" \[level=1\]/);
  assert.ok(['longTasks', 'blockingMs', 'inpLab', 'cls'].every((k) => k in m.metrics.desktop), 'main-thread and interaction metrics recorded');
  const b = await run('scripts/capture.mjs', [dir, '--out', second, '--scroll', '0', '--wait', '20', '--timeline', '0,600,1500', '--baseline', first]);
  assert.equal(b.code, 0, b.stderr || b.stdout);
  const diff = JSON.parse(fs.readFileSync(path.join(second, 'manifest.json'))).diff;
  const frames = diff.filter((d) => /desktop-t\d+\.png$/.test(d.file));
  assert.equal(frames.length, 3, 'every timeline frame compared');
  assert.ok(frames.every((d) => d.changed === 0), 'page time held still: the same frames on every run');
  const gpu = await run('scripts/capture.mjs', [dir, '--out', path.join(tmp, 'timeline-gpu'), '--scroll', '0', '--only', 'desktop', '--gpu']);
  assert.ok(gpu.code === 5 || (gpu.code === 0 && JSON.parse(fs.readFileSync(path.join(tmp, 'timeline-gpu', 'manifest.json'))).frames), '--gpu measures a hardware renderer or refuses with exit 5');
});

test('capture', 'a held lock makes the next capture wait, and relative output lands in the project', async () => {
  const proj = path.join(tmp, 'lockproj');
  fs.mkdirSync(path.join(proj, 'public'), { recursive: true });
  fs.writeFileSync(path.join(proj, 'AWARDS.md'), '# A\n');
  fs.writeFileSync(path.join(proj, 'public', 'index.html'), '<!doctype html><html lang="en"><head><link rel="icon" href="data:,"></head><body><p>Locked.</p></body></html>');
  fs.mkdirSync(path.join(proj, '.awards', 'capture.lock'), { recursive: true });
  const started = Date.now();
  setTimeout(() => fs.rmSync(path.join(proj, '.awards', 'capture.lock'), { recursive: true, force: true }), 1500);
  const result = await new Promise((resolve) => execFile(process.execPath, [path.join(plugin, 'scripts/capture.mjs'), 'index.html', '--out', '.awards/captures/locked', '--lock', '.awards/capture.lock', '--scroll', '0', '--only', 'desktop', '--wait', '20'], { cwd: path.join(proj, 'public'), env: { ...process.env, CLAUDE_PROJECT_DIR: '' }, timeout: 120000 }, (e, so, se) => resolve({ code: e?.code ?? 0, out: so + se })));
  assert.equal(result.code, 0, result.out);
  assert.ok(Date.now() - started >= 1400, 'waited for the held lock');
  assert.ok(fs.existsSync(path.join(proj, '.awards', 'captures', 'locked', 'manifest.json')), 'output beside AWARDS.md, not under public/');
  assert.equal(fs.existsSync(path.join(proj, 'public', '.awards')), false, 'nothing written where the shell stood');
  assert.equal(fs.existsSync(path.join(proj, '.awards', 'capture.lock')), false, 'the lock is released');
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
  const missing = await run('scripts/doctor.mjs', [project, '--json'], NO_BROWSER);
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
    const invalid = await run('scripts/doctor.mjs', [project, '--json'], NO_BROWSER);
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

test('audit', 'rendered eyebrow counter and soft images (X21, P09)', async () => {
  const dir = path.join(tmp, 'eyebrows');
  fs.mkdirSync(dir);
  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const sections = (labelled) => Array.from({ length: 6 }, (_, i) => `<section>${i < labelled ? '<p class="k">Chapter note</p>' : ''}<h2>Heading ${i + 1}</h2><p>Body copy for this chapter of the page.</p></section>`).join('');
  const page = (labelled, img) => `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body { margin: 0; font: 16px/1.5 sans-serif; } section { min-height: 40vh; padding: 24px; } .k { font-size: 12px; text-transform: uppercase; letter-spacing: .12em; margin: 0; }
img { width: 400px; height: 200px; display: block; }</style></head><body><main>${img ? `<img alt="A plate" src="data:image/png;base64,${png}">` : ''}${sections(labelled)}</main></body></html>`;
  fs.writeFileSync(path.join(dir, 'index.html'), page(6, true));
  const hit = await auditIds(dir, ['--render']);
  assert.ok(hit.has('X21'), 'six eyebrows over six sections must report X21');
  assert.ok(hit.has('P09'), 'a 1 px image drawn 400 px wide must report P09');
  const quiet = path.join(tmp, 'eyebrows-quiet');
  fs.mkdirSync(quiet);
  fs.writeFileSync(path.join(quiet, 'index.html'), page(2, false));
  const calm = await auditIds(quiet, ['--render']);
  assert.deepEqual(['X21', 'P09'].filter((id) => calm.has(id)), [], 'one eyebrow per three sections and no upscaled image stay quiet');
  const locked = path.join(tmp, 'zoom-locked');
  fs.mkdirSync(locked);
  fs.writeFileSync(path.join(locked, 'index.html'), '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></head><body><main><h1>Locked</h1></main></body></html>');
  assert.ok((await auditIds(locked)).has('A17'), 'a viewport meta with maximum-scale=1 must report A17');
});

test('tools', 'the asset log, card checks and the generated corpus index', async () => {
  const proj = path.join(tmp, 'assets-proj');
  fs.mkdirSync(path.join(proj, 'public'), { recursive: true });
  fs.mkdirSync(path.join(proj, 'dist', 'assets'), { recursive: true });
  fs.writeFileSync(path.join(proj, 'AWARDS.md'), '# A\n');
  for (const f of ['public/hero.jpg', 'dist/assets/hero-AbC123xy.jpg', 'public/plate.png']) fs.writeFileSync(path.join(proj, f), 'x');
  const assets = (argv) => run('scripts/assets.mjs', [...argv, '--project', proj]);
  assert.equal((await assets(['add', '--file', path.join(proj, 'public/hero.jpg'), '--kind', 'licensed'])).code, 1, 'a licensed asset needs a source and a licence');
  assert.equal((await assets(['add', '--file', path.join(proj, 'public/hero.jpg'), '--kind', 'licensed', '--source', 'https://example.org/item', '--licence', 'CC0', '--licence-url', 'https://creativecommons.org/publicdomain/zero/1.0/'])).code, 0);
  assert.equal((await assets(['add', '--file', path.join(proj, 'public/plate.png'), '--kind', 'placeholder'])).code, 0);
  const report = JSON.parse((await run('scripts/assets.mjs', ['check', proj, '--json'])).stdout);
  assert.deepEqual(report.missing, [], 'the hashed build copy matches its logged source by stem');
  assert.deepEqual(report.placeholders, ['public/plate.png']);
  const log = JSON.parse(fs.readFileSync(path.join(proj, '.awards/assets.json'), 'utf8'));
  assert.equal(log.assets.find((a) => a.file === 'public/plate.png').synthetic, true);

  const sites = path.join(tmp, 'sites');
  fs.mkdirSync(sites);
  fs.copyFileSync(path.join(plugin, 'references/sites/leo-parpeix.md'), path.join(sites, 'leo-parpeix.md'));
  fs.writeFileSync(path.join(sites, 'bare.md'), '# Bare — https://example.org/\n\n| Field | Value |\n|---|---|\n| Class | luxury travel |\n');
  const bad = await run('scripts/check-card.mjs', [path.join(sites, 'bare.md')]);
  assert.equal(bad.code, 1);
  for (const want of ['missing header row: Industry', 'Class must start with', 'missing section ## 9.']) assert.ok(bad.stdout.includes(want), `check-card must say: ${want}`);
  assert.equal((await run('scripts/check-card.mjs', [path.join(sites, 'leo-parpeix.md')])).code, 0);
  fs.rmSync(path.join(sites, 'bare.md'));
  assert.equal((await run('scripts/build-index.mjs', ['--dir', sites])).code, 0);
  assert.match(fs.readFileSync(path.join(sites, '_index.md'), 'utf8'), /^\| `leo-parpeix` \| Léo Parpeix \| portfolio \| creative-practice \| home \|/m);
  assert.equal((await run('scripts/build-index.mjs', ['--dir', sites, '--check'])).code, 0);
});

test('tools', 'a composition skeleton measures a local page without its pixels', async () => {
  const dir = path.join(tmp, 'skeleton');
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body { margin: 0; padding: 0 48px; font: 18px/1.5 sans-serif; } h1 { font-size: 64px; margin: 40px 0; } h2 { font-size: 32px; } .media { width: 600px; height: 300px; background: #888 url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==') }</style></head><body><main>
<h1>Tidal crossing</h1><p>A ferry that only runs when the sand allows it, with a timetable printed on the slipway and nowhere else.</p><p>Second paragraph, set in the same column.</p><div class="media"></div><h2>Timetable</h2></main></body></html>`);
  const out = path.join(tmp, 'skeleton.png');
  const result = await run('scripts/skeleton.mjs', [dir, '--out', out]);
  assert.equal(result.code, 0, result.stderr);
  assert.ok(fs.statSync(out).size > 1000, 'the block map is written');
  const fp = JSON.parse(result.stdout.trim().split('\n').pop());
  assert.equal(fp.desktop.type.h1, 64);
  assert.equal(fp.desktop.type.body, 18);
  assert.ok(fp.desktop.mediaShareFirstViewport > 0, 'the media block counts toward the image share');
});

test('capture', 'several routes of one local site are captured from its root into one routes.json', async () => {
  const site = path.join(tmp, 'routes-site');
  fs.mkdirSync(path.join(site, 'work'), { recursive: true });
  fs.writeFileSync(path.join(site, 'style.css'), 'body { margin: 0; padding: 40px; font: 18px/1.5 sans-serif; background: #f4f2ee; color: #1a1c1c; }');
  const page = (title) => `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"><title>${title}</title></head><body><main><h1>${title}</h1></main></body></html>`;
  fs.writeFileSync(path.join(site, 'index.html'), page('Home'));
  fs.writeFileSync(path.join(site, 'work', 'index.html'), page('Work'));
  const out = path.join(tmp, 'routes-out');
  const result = await run('scripts/capture.mjs', [site, '--routes', '/,/work/', '--out', out, '--scroll', '0', '--only', 'desktop', '--wait', '20']);
  assert.equal(result.code, 0, result.stderr);
  const index = JSON.parse(fs.readFileSync(path.join(out, 'routes.json'), 'utf8'));
  assert.deepEqual(index.routes.map((r) => [r.slug, r.exit]), [['home', 0], ['work', 0]]);
  const work = JSON.parse(fs.readFileSync(path.join(out, 'work', 'manifest.json'), 'utf8'));
  assert.deepEqual(work.failedRequests, [], 'the inner route loads the root stylesheet');
  assert.ok(fs.existsSync(path.join(out, 'work', 'desktop-s00.png')));
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
