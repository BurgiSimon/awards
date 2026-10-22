// Rasterise the section's real layout into the obstacle grid: text elements as their glyphs, boxes as rectangles.
// `[data-obstacle]` marks glyph obstacles; `[data-obstacle="box"]` marks rectangles.
// `[data-veil]` marks text the air passes behind: the smoke dims there so the words stay readable.
import { blur, chamfer } from './field.js';

// CSS percentages the canvas font shorthand only accepts as keywords.
const STRETCH = [[62.5, 'extra-condensed'], [75, 'condensed'], [87.5, 'semi-condensed'], [100, 'normal'], [112.5, 'semi-expanded'], [125, 'expanded'], [150, 'extra-expanded']];
function stretchKeyword(value) {
  if (!value.endsWith('%')) return value || 'normal';
  const n = parseFloat(value);
  return STRETCH.reduce((a, b) => (Math.abs(b[0] - n) < Math.abs(a[0] - n) ? b : a))[1];
}

function drawGlyphs(ctx, el, origin) {
  const cs = getComputedStyle(el);
  // Only the first family: `check` fails on any unloaded face in the stack, and the metric fallbacks never load.
  const family = cs.fontFamily.split(',')[0].trim();
  const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${family}`;
  ctx.font = font;
  ctx.fontStretch = stretchKeyword(cs.fontStretch); // the font shorthand setter drops the stretch
  // A face the canvas cannot match would rasterise the fallback's shapes; the element's box is the honest fallback.
  if (!document.fonts.check(font)) return false;
  const size = parseFloat(cs.fontSize);
  ctx.lineWidth = size * 0.05; // closes hairline gaps between heavy letters so the body reads as one shape
  ctx.textBaseline = 'alphabetic';
  const m = ctx.measureText('Hg');
  const asc = m.fontBoundingBoxAscent ?? size * 0.9;
  const desc = m.fontBoundingBoxDescent ?? size * 0.25;
  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent;
    // Measure the settled layout: undo translations an entrance (e.g. a masked line reveal) has applied for now.
    let dx = 0, dy = 0;
    for (let a = node.parentElement; a && a !== el.parentElement; a = a.parentElement) {
      const t = getComputedStyle(a).transform;
      if (t && t !== 'none') { const m = new DOMMatrixReadOnly(t); dx += m.e; dy += m.f; }
    }
    for (let i = 0; i < text.length; i++) {
      if (!text[i].trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const r = range.getBoundingClientRect();
      if (!r.width) continue;
      // Per-character placement: the DOM already did kerning, tracking and wrapping; the canvas only paints shapes.
      const base = r.top - dy - origin.top + (r.height - (asc + desc)) / 2 + asc;
      ctx.fillText(text[i], r.left - dx - origin.left, base);
      ctx.strokeText(text[i], r.left - dx - origin.left, base);
    }
  }
  return true;
}

// Returns { mask, veil, w, h, cell } for createTunnel. `slot` (px): gaps narrower than this are closed, because the
// air grid cannot resolve them; left open, the smoke would slip into passages where the air stands still and jitter.
export function rasterise(section, cell, { slot = 0 } = {}) {
  const origin = section.getBoundingClientRect();
  const w = Math.max(8, Math.ceil(origin.width / cell));
  const h = Math.max(8, Math.ceil(origin.height / cell));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.scale(1 / cell, 1 / cell);
  ctx.fillStyle = ctx.strokeStyle = '#fff';
  for (const el of section.querySelectorAll('[data-obstacle]')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if (el.dataset.obstacle === 'box' || !drawGlyphs(ctx, el, origin)) {
      ctx.fillRect(r.left - origin.left, r.top - origin.top, r.width, r.height);
    }
  }
  const px = ctx.getImageData(0, 0, w, h).data;
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < mask.length; i++) mask[i] = px[i * 4 + 3] > 110 ? 1 : 0;
  // Air cannot reach a closed counter (the bowl of an a, the eye of an e): fill every pocket the open edges of the
  // section cannot reach, so no smoke is born, pushed or trapped inside a letter.
  const reached = new Uint8Array(w * h), stack = [];
  const visit = (i) => { if (!mask[i] && !reached[i]) { reached[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { visit(x); visit((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { visit(y * w); visit(y * w + w - 1); }
  while (stack.length) {
    const i = stack.pop(), x = i % w;
    if (x > 0) visit(i - 1);
    if (x < w - 1) visit(i + 1);
    if (i >= w) visit(i - w);
    if (i < w * (h - 1)) visit(i + w);
  }
  for (let i = 0; i < mask.length; i++) if (!reached[i]) mask[i] = 1;
  // Morphological closing (dilate, then erode, by half the slot): fills slots and notches the air cannot resolve,
  // keeps every outer contour where it was.
  const r = slot / 2 / cell;
  if (r >= 1) {
    const toBody = chamfer(mask, w, h);
    const grown = new Uint8Array(w * h);
    for (let i = 0; i < grown.length; i++) grown[i] = toBody[i] <= r ? 1 : 0;
    const open = new Uint8Array(w * h);
    for (let i = 0; i < open.length; i++) open[i] = 1 - grown[i];
    const toAir = chamfer(open, w, h);
    for (let i = 0; i < mask.length; i++) if (grown[i] && toAir[i] > r) mask[i] = 1;
  }
  const veil = new Float32Array(w * h);
  const pad = 14;
  for (const el of document.querySelectorAll('[data-veil]')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const x0 = Math.max(0, Math.floor((r.left - origin.left - pad) / cell)), x1 = Math.min(w - 1, Math.ceil((r.right - origin.left + pad) / cell));
    const y0 = Math.max(0, Math.floor((r.top - origin.top - pad) / cell)), y1 = Math.min(h - 1, Math.ceil((r.bottom - origin.top + pad) / cell));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) veil[y * w + x] = 1;
  }
  blur(veil, w, h, Math.max(1, Math.round(18 / cell)));
  return { mask, veil, w, h, cell };
}

// Resolve any CSS colour (hex, rgb, display-p3 …) to sRGB bytes by letting the canvas parse and paint it.
export function cssColor(el, prop) {
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = getComputedStyle(el).getPropertyValue(prop).trim() || '#000';
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}
