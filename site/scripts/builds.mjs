// npm run builds: the record's pictures. Each build's first viewport, as this site's build captured it with the
// plugin's capture.mjs (desktop 1440 × 900, s00), re-encoded to WebP at 960 × 600 in public/builds/<id>-desktop.webp.
// The captures are evidence in .awards/ (gitignored); the WebP files are committed, so the deploy builds without them.
//
//   showcase builds:  .awards/builds/<id>/desktop-s00.png  (each built in a scratch copy outside the repository,
//                     then `capture.mjs <copy>/dist --out .awards/builds/<id> --scroll 0,50 --no-tablet`)
//   the contact sheet: .awards/redesign-2/baseline/home/desktop-s00.png  (the redesign's baseline capture)
//   the Museum at 2×:  .awards/builds/extinct/desktop-s00@2x.png  (the same first screen at device pixel ratio 2,
//                     2880 × 1800), encoded at 1920 × 1200 for the one frame the home page shows at scale
import fs from 'node:fs';
import path from 'node:path';
import { openBrowser, encodeWebp, pngSize, siteRoot } from './lib/webp.mjs';

const SOURCES = {
  'awards-home': '.awards/builds/awards-home/desktop-s00.png',
  ekvator: '.awards/builds/ekvator/desktop-s00.png',
  extinct: '.awards/builds/extinct/desktop-s00.png',
  petrel: '.awards/builds/petrel/desktop-s00.png',
  'contact-sheet': '.awards/redesign-2/baseline/home/desktop-s00.png',
};
const OUT = { width: 960, height: 600, quality: 0.86 };

const browser = await openBrowser();
const page = await browser.newPage();
fs.mkdirSync(path.join(siteRoot, 'public/builds'), { recursive: true });
let failed = 0;
for (const [id, rel] of Object.entries(SOURCES)) {
  const src = path.join(siteRoot, rel);
  if (!fs.existsSync(src)) { console.error(`missing ${rel}`); failed++; continue; }
  const { width, height } = pngSize(src);
  if (width * 10 !== height * 16) { console.error(`${rel} is ${width} × ${height}, not 16:10`); failed++; continue; }
  const [buf] = await encodeWebp(page, fs.readFileSync(src), [OUT]);
  const out = path.join(siteRoot, `public/builds/${id}-desktop.webp`);
  fs.writeFileSync(out, buf);
  console.log(`public/builds/${id}-desktop.webp  ${(buf.length / 1024).toFixed(1)} KB  from ${rel}`);
}
// The one frame shown at scale (home, chapter 3) also ships at 1920 × 1200 for 2× screens (jury 2026-10-26, craft 5).
const hidpi = path.join(siteRoot, '.awards/builds/extinct/desktop-s00@2x.png');
if (fs.existsSync(hidpi)) {
  const [buf] = await encodeWebp(page, fs.readFileSync(hidpi), [{ width: 1920, height: 1200, quality: 0.82 }]);
  fs.writeFileSync(path.join(siteRoot, 'public/builds/extinct-desktop-2x.webp'), buf);
  console.log(`public/builds/extinct-desktop-2x.webp  ${(buf.length / 1024).toFixed(1)} KB  from .awards/builds/extinct/desktop-s00@2x.png`);
} else { console.error('missing .awards/builds/extinct/desktop-s00@2x.png'); failed++; }
await browser.close();
process.exit(failed ? 1 : 0);
