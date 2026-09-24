// What renders is judged from the screenshots: assert() decodes each state's PNG and samples pixels inside the letters
// (stem centres) and on the solid band (gaps between letters, inside the E, above the word), mapped from the SVG's
// viewBox (0 0 1000 240) through its on-screen rect. The probe also samples the ground canvas itself every 50 ms for
// 1 s, so "the ground moves" is judged over a run of frames, not one pair.
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const LETTERS = [[28, 200], [295, 120], [438, 120], [643, 100], [848, 120]]; // F, I, E, L, D stems
const BAND = [[192, 120], [530, 74], [602, 120], [500, -60]];                 // F–I gap, inside E, E–L gap, above

export const states = [
  { name: 'full', settle: 300 },
  { name: 'later', settle: 1800 },
  { name: 'rm', reducedMotion: true, settle: 300 },
  { name: 'rm-later', reducedMotion: true, settle: 1800 },
  { name: 'static', settle: 300, actions: [{ type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" }, { type: 'wait', ms: 200 }] },
  { name: 'scrolled', scroll: 1, settle: 400 },
  { name: 'mobile', viewport: 'mobile', settle: 300 },
];

export async function probe() {
  const LETTERS = [[28, 200], [295, 120], [438, 120], [643, 100], [848, 120]];
  const BAND = [[192, 120], [530, 74], [602, 120], [500, -60]];
  const svg = document.querySelector('[data-mark]');
  const r = svg.getBoundingClientRect();
  const map = ([u, v]) => [Math.round(r.left + (u * r.width) / 1000), Math.round(r.top + (v * r.height) / 240)];
  const canvas = document.querySelector('[data-ground]');
  const ctx = canvas.getContext('2d');
  const k = canvas.width / innerWidth;
  const groundAt = ([x, y]) => [...ctx.getImageData(Math.min(canvas.width - 1, Math.floor(x * k)), Math.min(canvas.height - 1, Math.floor(y * k)), 1, 1).data.slice(0, 3)];
  const letters = LETTERS.map(map);
  const samples = [];
  for (let i = 0; i < 20; i++) {
    samples.push({ ground: letters.map(groundAt).map((c) => c.join()).join('|'), frames: window.__awards.state().frames });
    await new Promise((res) => setTimeout(res, 50));
  }
  const h1 = document.querySelector('h1');
  return {
    letters,
    band: BAND.map(map),
    markRect: [r.left, r.top, r.width, r.height].map(Math.round),
    samples,
    heading: h1.textContent.trim().replace(/\s+/g, ' '),
    svgHidden: svg.getAttribute('aria-hidden'),
    canvasHidden: canvas.getAttribute('aria-hidden'),
    masked: document.querySelector('[data-solid]').getAttribute('mask'),
    overflowX: document.documentElement.scrollWidth - innerWidth,
  };
}

// Minimal PNG reader for Playwright screenshots: 8-bit RGB or RGBA, not interlaced.
function readPng(file) {
  const buf = readFileSync(file);
  let i = 8, w = 0, h = 0, bpp = 0;
  const idat = [];
  while (i < buf.length) {
    const len = buf.readUInt32BE(i), type = buf.toString('ascii', i + 4, i + 8), data = buf.subarray(i + 8, i + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      if (data[8] !== 8 || data[12] !== 0 || ![2, 6].includes(data[9])) throw new Error('unsupported PNG');
      bpp = data[9] === 6 ? 4 : 3;
    } else if (type === 'IDAT') idat.push(data);
    i += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat)), stride = w * bpp, px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0, b = y ? px[(y - 1) * stride + x] : 0, c = x >= bpp && y ? px[(y - 1) * stride + x - bpp] : 0;
      let v = raw[y * (stride + 1) + 1 + x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[y * stride + x] = v & 255;
    }
  }
  return ([x, y]) => (x < 0 || y < 0 || x >= w || y >= h ? null : [px[(y * w + x) * bpp], px[(y * w + x) * bpp + 1], px[(y * w + x) * bpp + 2]]);
}

const PAPER = [244, 242, 238];
const dist = (a, b) => (a && b ? Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) : Infinity);

export function assert(r) {
  const out = [];
  const P = (k) => r[k]?.probe || {};
  const st = (k) => r[k]?.state || {};
  const shot = {};
  for (const k of Object.keys(r)) {
    try { const at = readPng(r[k].screenshot); shot[k] = { letters: (P(k).letters || []).map(at), band: (P(k).band || []).map(at) }; } catch (e) { shot[k] = { letters: [], band: [], error: e.message }; }
  }
  const fmt = (c) => (c ? `rgb(${c.join(',')})` : 'n/a');

  // The knockout: every letter sample shows the ground, every band sample is the solid paper.
  for (const k of ['full', 'later', 'rm', 'rm-later', 'static', 'mobile']) {
    const s = shot[k];
    const bandOk = s.band.length === BAND.length && s.band.every((c) => dist(c, PAPER) <= 6);
    const holeOk = s.letters.length === LETTERS.length && s.letters.every((c) => dist(c, PAPER) > 90);
    out.push({ ok: bandOk && holeOk, message: `${k}: letters show the ground (${s.letters.map(fmt).join(' ')}) while the band is solid (${s.band.map(fmt).join(' ')})${s.error ? ` — ${s.error}` : ''}` });
  }

  // Full tier: the ground moves inside the letters, the band does not.
  const moved = LETTERS.map((_, i) => dist(shot.full.letters[i], shot.later.letters[i]));
  const bandMoved = BAND.map((_, i) => dist(shot.full.band[i], shot.later.band[i]));
  out.push({ ok: moved.filter((d) => d > 24).length >= 3 && bandMoved.every((d) => d <= 6), message: `full: letter pixels change as the ground moves (Δ ${moved.join(' / ')}), band pixels hold (Δ ${bandMoved.join(' / ')})` });
  const distinct = (k) => new Set((P(k).samples || []).map((s) => s.ground)).size;
  const frames = (k) => (P(k).samples || []).map((s) => s.frames);
  out.push({ ok: st('full').running === true && distinct('full') >= 8 && frames('full').at(-1) > frames('full')[0], message: `full: loop running, ${distinct('full')} distinct ground readings in 20 samples over 1 s (frames ${frames('full')[0]} → ${frames('full').at(-1)})` });

  // Reduced and static: one still frame.
  const still = LETTERS.map((_, i) => dist(shot.rm.letters[i], shot['rm-later'].letters[i]));
  out.push({ ok: still.every((d) => d <= 3), message: `reduced: letter pixels identical 1.5 s apart (Δ ${still.join(' / ')})` });
  for (const k of ['rm', 'rm-later', 'static']) {
    out.push({ ok: st(k).motion === (k === 'static' ? 'static' : 'reduced') && st(k).running === false && distinct(k) === 1 && new Set(frames(k)).size === 1, message: `${k}: tier ${st(k).motion}, loop off, ground still (${distinct(k)} reading, frames ${[...new Set(frames(k))]})` });
  }

  // Off-screen stop.
  out.push({ ok: st('scrolled').running === false && new Set(frames('scrolled')).size === 1, message: `scrolled past the hero: loop off (frames ${[...new Set(frames('scrolled'))]})` });

  // Text alternative and structure.
  out.push({ ok: P('full').heading === 'Field' && P('full').svgHidden === 'true' && P('full').canvasHidden === 'true' && P('full').masked === 'url(#knockout)', message: `h1 reads "${P('full').heading}", SVG and canvas aria-hidden (${P('full').svgHidden}/${P('full').canvasHidden})` });

  // Mobile: the word spans the width, no horizontal overflow.
  const m = P('mobile');
  out.push({ ok: (m.markRect?.[2] ?? 0) >= 300 && (m.overflowX ?? 1) <= 0 && (P('full').overflowX ?? 1) <= 0, message: `mobile: word ${m.markRect?.[2]}×${m.markRect?.[3]} px, overflow ${m.overflowX}px` });
  return out;
}
