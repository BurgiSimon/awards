#!/usr/bin/env node
// public/og.png, the sharing card (1200 × 630): the home page's display line in Gloock, ink on the ship ground, with
// the five builds' first screens (public/builds/) gathered along its foot, as the first screen shows them. Rendered
// in headless Chromium from the plugin's recipes, so the site installs nothing for it.
// Usage: node scripts/og.mjs   Exit: 0 written · 3 no browser
import fs from 'node:fs';
import path from 'node:path';
import { siteRoot, openBrowser } from './lib/webp.mjs';

const file = (rel) => `data:${rel.endsWith('.woff2') ? 'font/woff2' : 'image/webp'};base64,${fs.readFileSync(path.join(siteRoot, 'public', rel)).toString('base64')}`;
const builds = ['awards-home', 'extinct', 'ekvator', 'contact-sheet', 'petrel'];
const place = [[40, 352, 400, -0.6], [330, 392, 360, 0.5], [610, 362, 330, -0.3], [860, 404, 300, 0.8], [180, 470, 300, -0.5]];
const html = `<!doctype html><html><head><style>
@font-face { font-family: G; src: url(${file('fonts/gloock-latin-400.woff2')}); }
@font-face { font-family: F; src: url(${file('fonts/familjen-grotesk-latin-600.woff2')}); }
body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #5cb973; color: #18130e; position: relative; }
h1 { font: 400 104px/0.95 G; letter-spacing: -0.02em; margin: 0; position: absolute; left: 40px; top: 44px; }
p { font: 600 22px/1.2 F; position: absolute; right: 40px; top: 52px; margin: 0; }
img { position: absolute; outline: 2px solid #18130e; outline-offset: -2px; }
</style></head><body><h1>Done when a jury<br>says ship.</h1><p>awards</p>
${builds.map((b, i) => { const [x, y, w, r] = place[i]; return `<img src="${file(`builds/${b}-desktop.webp`)}" style="left:${x}px;top:${y}px;width:${w}px;transform:rotate(${r}deg)">`; }).join('')}
</body></html>`;

try {
  const browser = await openBrowser({ webgl: false });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.setContent(html);
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode())); });
    const out = path.join(siteRoot, 'public', 'og.png');
    await page.screenshot({ path: out });
    console.log(`og: ${path.relative(process.cwd(), out)} 1200 × 630 (${fs.statSync(out).size} bytes)`);
  } finally {
    await browser.close();
  }
} catch (e) {
  console.error(`og: ${e.message}`);
  process.exit(e.exitCode ?? 1);
}
