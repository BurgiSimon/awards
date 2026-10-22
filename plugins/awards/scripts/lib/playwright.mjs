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

// A browser staged inside the project (`.awards/browsers/<playwright browser dir>`), for sandboxes
// that hide the user's Playwright cache; `evals/stage-browser.sh` puts one there.
function localChromium(cwd = process.cwd()) {
  const root = path.join(cwd, '.awards', 'browsers');
  if (!fs.existsSync(root)) return null;
  for (const dir of fs.readdirSync(root).sort().reverse()) {
    for (const rel of ['chrome-headless-shell-linux64/chrome-headless-shell', 'chrome-linux64/chrome', 'chrome-linux/chrome']) {
      const exe = path.join(root, dir, rel);
      if (fs.existsSync(exe)) return exe;
    }
  }
  return null;
}

// A hardware-GPU launch: ANGLE on the platform's native backend instead of SwiftShader. These are the
// usual flags, not ones verified on every machine, so AWARDS_GPU_ARGS replaces them (space-separated) and
// capture.mjs --gpu refuses to measure when the renderer still turns out to be software.
export function gpuArgs(platform = process.platform) {
  if (process.env.AWARDS_GPU_ARGS) return process.env.AWARDS_GPU_ARGS.split(/\s+/).filter(Boolean);
  const angle = { darwin: 'metal', win32: 'd3d11' }[platform] ?? 'vulkan';
  return ['--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle', `--use-angle=${angle}`, ...(angle === 'vulkan' ? ['--enable-features=Vulkan'] : [])];
}

export const isSoftwareRenderer = (renderer) => /swiftshader|llvmpipe|softpipe|software|basic render/i.test(String(renderer));

export async function launchChromium(pw, { webgl = true, gpu = false, headed = false } = {}) {
  const launchOptions = { headless: !headed, args: gpu ? gpuArgs() : webgl ? GL_ARGS : ['--disable-gpu'] };
  // A pinned Playwright without downloaded browsers can still use a system Chromium.
  const exe = process.env.AWARDS_CHROMIUM || process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || localChromium();
  if (exe) {
    if (!fs.existsSync(exe)) throw new Error('Chromium executable not found: ' + exe);
    launchOptions.executablePath = exe;
  }
  try {
    return await pw.chromium.launch(launchOptions);
  } catch (err) {
    // Claude Code cloud containers preinstall one Chromium here (PLAYWRIGHT_BROWSERS_PATH); a project whose
    // Playwright expects another build still launches it instead of failing. Tried only after a failed launch.
    const fallback = path.join(process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers', 'chromium');
    if (!launchOptions.executablePath && fs.existsSync(fallback)) {
      return pw.chromium.launch({ ...launchOptions, executablePath: fallback });
    }
    throw err;
  }
}
