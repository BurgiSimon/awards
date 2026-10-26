#!/usr/bin/env node
// The favicon's raster fallbacks, drawn from public/favicon.svg (itself drawn from the tokens: the four verdict
// grounds in quarters, struck through by the ink): a 32 px PNG for browsers without SVG icons and the 180 px
// apple-touch-icon. Rendered in headless Chromium from the plugin's recipes, so the site installs nothing for it.
// Usage: node scripts/icons.mjs   Exit: 0 written · 3 no browser
import fs from 'node:fs';
import path from 'node:path';
import { siteRoot, openBrowser } from './lib/webp.mjs';

const svg = fs.readFileSync(path.join(siteRoot, 'public', 'favicon.svg'), 'utf8');
const OUT = [['favicon-32.png', 32], ['apple-touch-icon.png', 180]];

try {
  const browser = await openBrowser({ webgl: false });
  try {
    for (const [file, size] of OUT) {
      const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
      await page.setContent(`<!doctype html><html><body style="margin:0;background:#18130e"><img alt="" width="${size}" height="${size}" style="display:block" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></body></html>`);
      await page.evaluate(() => document.images[0].decode());
      const out = path.join(siteRoot, 'public', file);
      await page.screenshot({ path: out, clip: { x: 0, y: 0, width: size, height: size } });
      await page.close();
      console.log(`icons: ${path.relative(process.cwd(), out)} ${size} × ${size} (${fs.statSync(out).size} bytes)`);
    }
  } finally {
    await browser.close();
  }
} catch (e) {
  console.error(`icons: ${e.message}`);
  process.exit(e.exitCode ?? 1);
}
