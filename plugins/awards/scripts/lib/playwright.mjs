// Resolve Playwright without making it a hard dependency of the plugin.
// Order: project node_modules → playwright-core → $AWARDS_PLAYWRIGHT → global npm root.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const NAMES = ['playwright', 'playwright-core'];

function tryRequire(fromDir, name) {
  try {
    const req = createRequire(path.join(fromDir, 'package.json'));
    const resolved = req.resolve(name);
    return { module: req(resolved), source: resolved };
  } catch {
    return null;
  }
}

export function resolvePlaywright(cwd = process.cwd()) {
  for (const name of NAMES) {
    const hit = tryRequire(cwd, name);
    if (hit) return hit;
  }
  if (process.env.AWARDS_PLAYWRIGHT) {
    const dir = process.env.AWARDS_PLAYWRIGHT;
    for (const name of NAMES) {
      const hit = tryRequire(dir, name) || tryRequire(path.dirname(dir), path.basename(dir));
      if (hit) return hit;
    }
  }
  try {
    const root = execSync('npm root -g', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    for (const name of NAMES) {
      if (fs.existsSync(path.join(root, name))) {
        const hit = tryRequire(path.join(root, name), name);
        if (hit) return hit;
      }
    }
  } catch {
    /* npm not available */
  }
  return null;
}

export const MISSING_MESSAGE =
  'Playwright not found. Install it with `npm i -D playwright && npx playwright install chromium`, ' +
  'set AWARDS_PLAYWRIGHT=<dir containing node_modules/playwright>, or pass screenshots manually.';

// Chromium flags that make WebGL work in headless/CI (SwiftShader via ANGLE).
export const GL_ARGS = [
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist',
];

export async function launchChromium(pw, { webgl = true } = {}) {
  const launchOptions = { headless: true, args: webgl ? GL_ARGS : ['--disable-gpu'] };
  // A pinned Playwright without downloaded browsers can still use a system Chromium.
  const exe = process.env.AWARDS_CHROMIUM || process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  if (exe) {
    if (!fs.existsSync(exe)) throw new Error('Chromium executable not found: ' + exe);
    launchOptions.executablePath = exe;
  }
  try {
    return await pw.chromium.launch(launchOptions);
  } catch (err) {
    const fallback = '/opt/pw-browsers/chromium';
    if (!launchOptions.executablePath && fs.existsSync(fallback)) {
      return pw.chromium.launch({ ...launchOptions, executablePath: fallback });
    }
    throw err;
  }
}
