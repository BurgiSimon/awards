#!/usr/bin/env node
// Check prerequisites before a build. No installs, network probes or configuration edits.
// Usage: node doctor.mjs [project-dir] [--json]
// Exit: 0 ready · 2 prerequisite failed · 1 invalid target/arguments.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { parseArgs, now } from './lib/report.mjs';
import { resolvePlaywright, launchChromium, MISSING_MESSAGE } from './lib/playwright.mjs';

const args = parseArgs(process.argv.slice(2), { json: 'boolean' });
const project = path.resolve(args._[0] ?? '.');
if (args._.length > 1 || Object.keys(args).some((key) => !['_', 'json'].includes(key)) || !fs.existsSync(project) || !fs.statSync(project).isDirectory()) {
  console.error('usage: node doctor.mjs [existing-project-dir] [--json]');
  process.exit(1);
}
const checks = [];
const add = (id, status, detail, fix) => checks.push({ id, status, detail, ...(fix ? { fix } : {}) });
const [major, minor] = process.versions.node.split('.').map(Number);
const supported = (major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major > 22;
add('node', supported ? 'pass' : 'fail', process.version, supported ? null : 'Use Node 20.19+ on 20.x, or 22.12+.');
const npm = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['--version'], { encoding: 'utf8', timeout: 5000 });
add('npm', !npm.error && npm.status === 0 ? 'pass' : 'fail', npm.stdout?.trim() || npm.error?.message || 'npm unavailable', !npm.error && npm.status === 0 ? null : 'Install npm with Node, or make it available on PATH.');

const packageFile = path.join(project, 'package.json');
if (!fs.existsSync(packageFile)) {
  add('dependencies', 'warn', 'No package.json yet; check again after scaffolding and installing dependencies.');
  add('build', 'warn', 'No build configured yet. Static HTML can still be captured.');
} else {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    if (!pkg || typeof pkg !== 'object' || Array.isArray(pkg)) throw new Error('package.json must contain an object');
    const require = createRequire(packageFile);
    const declared = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter((name) => !Object.hasOwn(pkg.optionalDependencies ?? {}, name));
    const missing = declared.filter((name) => !(require.resolve.paths(name) ?? []).some((dir) => fs.existsSync(path.join(dir, name, 'package.json'))));
    add('dependencies', missing.length ? 'fail' : 'pass', missing.length ? 'Missing: ' + missing.join(', ') : declared.length + ' declared packages found', missing.length ? 'Run the project package manager install command, then rerun doctor.' : null);
    add('build', pkg.scripts?.build ? 'pass' : 'warn', pkg.scripts?.build || 'No build script; capture static HTML or the running dev server.');
  } catch (error) {
    add('dependencies', 'fail', error.message, 'Repair package.json before installing or building.');
  }
}

try {
  const parents = new Set();
  for (const relative of ['', '.awards', '.awards/captures', '.awards/jury', '.awards/ship']) {
    let dir = path.join(project, relative);
    while (!fs.existsSync(dir)) dir = path.dirname(dir);
    if (!fs.statSync(dir).isDirectory()) throw new Error(dir + ' must be a directory');
    parents.add(dir);
  }
  for (const dir of parents) {
    const probe = fs.mkdtempSync(path.join(dir, '.awards-check-'));
    try { fs.writeFileSync(path.join(probe, 'probe'), 'ok'); }
    finally { fs.rmSync(probe, { recursive: true, force: true }); }
  }
  for (const file of ['AWARDS.md', 'DESIGN.md']) {
    const target = path.join(project, file);
    if (fs.existsSync(target)) fs.accessSync(target, fs.constants.W_OK);
  }
  add('outputs', 'pass', 'Project and .awards output locations are writable.');
} catch (error) {
  add('outputs', 'fail', error.message, 'Choose a writable project/output directory or correct its permissions.');
}

const found = resolvePlaywright(project);
if (!found) {
  add('playwright', 'fail', 'Playwright could not be resolved from the project, AWARDS_PLAYWRIGHT or global npm.', MISSING_MESSAGE);
  add('chromium', 'skip', 'Browser check requires Playwright.');
} else {
  add('playwright', 'pass', found.source);
  let browser;
  try {
    browser = await launchChromium(found.module);
    const page = await browser.newPage();
    await page.setContent('<!doctype html><html lang="en"><body><h1>Capture check</h1></body></html>');
    const png = await page.screenshot({ timeout: 10000 });
    if (!png.length) throw new Error('Chromium produced an empty screenshot');
    add('chromium', 'pass', browser.version() + ': screenshot produced.');
    const gl = await page.evaluate(() => !!document.createElement('canvas').getContext('webgl2'));
    add('webgl', gl ? 'pass' : 'warn', gl ? 'WebGL2 available in the headless capture browser; this does not measure real-device frame rate.' : 'WebGL2 unavailable; use the DOM fallback.');
  } catch (error) {
    add('chromium', 'fail', error.message.split('\n')[0], 'Run npx playwright install chromium (Linux may need --with-deps), check browser permissions, or set AWARDS_CHROMIUM to a working executable.');
  } finally {
    if (browser) await browser.close();
  }
}

const report = { target: project, at: now(), ready: !checks.some((check) => check.status === 'fail'), checks };
if (args.json) console.log(JSON.stringify(report, null, 2));
else {
  for (const check of checks) console.log(check.status.toUpperCase() + ' ' + check.id + ': ' + check.detail + (check.fix ? '\n  ' + check.fix : ''));
  console.log(report.ready ? 'Environment ready; warnings name setup still needed.' : 'Prerequisites missing. Independent design/static source work can continue; captures and final verification remain pending.');
}
process.exitCode = report.ready ? 0 : 2;
