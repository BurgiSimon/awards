// Shared by proof.mjs and recipe-frames.mjs: headless Chromium from the plugin's recipes, and WebP through the
// browser's own canvas encoder, so the site needs no image dependency of its own.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolvePlaywright, launchChromium, MISSING_MESSAGE } from '../../../plugins/awards/scripts/lib/playwright.mjs';

export const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const pluginRoot = path.resolve(siteRoot, '../plugins/awards');
export const recipesDir = path.join(pluginRoot, 'recipes');

// Playwright resolves from the recipes' pinned node_modules; the site installs nothing for this step.
export async function openBrowser({ webgl = false } = {}) {
  const found = resolvePlaywright(recipesDir);
  if (!found) {
    const error = new Error(MISSING_MESSAGE);
    error.exitCode = 3;
    throw error;
  }
  try {
    return await launchChromium(found.module, { webgl });
  } catch (e) {
    const error = new Error(`browser launch failed: ${String(e.message ?? e).split('\n')[0]}`);
    error.exitCode = 3;
    throw error;
  }
}

// Width and height from a PNG's IHDR chunk, without decoding it.
export function pngSize(file) {
  const fd = fs.openSync(file, 'r');
  const head = Buffer.alloc(24);
  fs.readSync(fd, head, 0, 24, 0);
  fs.closeSync(fd);
  if (head.readUInt32BE(0) !== 0x89504e47 || head.toString('ascii', 12, 16) !== 'IHDR') throw new Error(`not a PNG: ${file}`);
  return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
}

// Runs in the page: decode once, then one WebP per requested size.
async function encodeInPage({ src, outputs }) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const out = [];
  for (const { width, height, quality } of outputs) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    const url = canvas.toDataURL('image/webp', quality);
    if (!url.startsWith('data:image/webp')) throw new Error('this Chromium has no WebP encoder');
    out.push(url.slice(url.indexOf(',') + 1));
  }
  return out;
}

// png: a Buffer. outputs: [{ width, height, quality }]. Returns one Buffer per output.
export async function encodeWebp(page, png, outputs) {
  const data = await page.evaluate(encodeInPage, { src: `data:image/png;base64,${png.toString('base64')}`, outputs });
  return data.map((b64) => Buffer.from(b64, 'base64'));
}

// Removes every file under dir that is not in keep (absolute paths), then the folders left empty.
export function prune(dir, keep) {
  if (!fs.existsSync(dir)) return 0;
  let removed = 0;
  (function walk(d) {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) {
        walk(p);
        if (!fs.readdirSync(p).length) fs.rmdirSync(p);
      } else if (!keep.has(p)) {
        fs.rmSync(p);
        removed++;
      }
    }
  })(dir);
  if (!fs.readdirSync(dir).length) fs.rmdirSync(dir);
  return removed;
}

export const posix = (p) => p.split(path.sep).join('/');
