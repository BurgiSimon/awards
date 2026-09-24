// Rasterise the section's real layout into the obstacle grid: text elements as their glyphs, boxes as rectangles.
// `[data-obstacle]` marks glyph obstacles; `[data-obstacle="box"]` marks rectangles.

// CSS percentages the canvas font shorthand only accepts as keywords.
const STRETCH = [[62.5, 'extra-condensed'], [75, 'condensed'], [87.5, 'semi-condensed'], [100, 'normal'], [112.5, 'semi-expanded'], [125, 'expanded'], [150, 'extra-expanded']];
function stretchKeyword(value) {
  if (!value.endsWith('%')) return value || 'normal';
  const n = parseFloat(value);
  return STRETCH.reduce((a, b) => (Math.abs(b[0] - n) < Math.abs(a[0] - n) ? b : a))[1];
}

function drawGlyphs(ctx, el, origin) {
  const cs = getComputedStyle(el);
  const font = `${cs.fontStyle} ${cs.fontWeight} ${stretchKeyword(cs.fontStretch)} ${cs.fontSize} ${cs.fontFamily}`;
  ctx.font = font;
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
    for (let i = 0; i < text.length; i++) {
      if (!text[i].trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const r = range.getBoundingClientRect();
      if (!r.width) continue;
      // Per-character placement: the DOM already did kerning, tracking and wrapping; the canvas only paints shapes.
      const base = r.top - origin.top + (r.height - (asc + desc)) / 2 + asc;
      ctx.fillText(text[i], r.left - origin.left, base);
      ctx.strokeText(text[i], r.left - origin.left, base);
    }
  }
  return true;
}

// Returns { mask, w, h, cell, reach } for buildField.
export function rasterise(section, cell) {
  const origin = section.getBoundingClientRect();
  const w = Math.max(8, Math.ceil(origin.width / cell));
  const h = Math.max(8, Math.ceil(origin.height / cell));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.scale(1 / cell, 1 / cell);
  ctx.fillStyle = ctx.strokeStyle = '#fff';
  let tallest = 0;
  for (const el of section.querySelectorAll('[data-obstacle]')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    tallest = Math.max(tallest, r.height);
    if (el.dataset.obstacle === 'box' || !drawGlyphs(ctx, el, origin)) {
      ctx.fillRect(r.left - origin.left, r.top - origin.top, r.width, r.height);
    }
  }
  const px = ctx.getImageData(0, 0, w, h).data;
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < mask.length; i++) mask[i] = px[i * 4 + 3] > 110 ? 1 : 0;
  // The body bends the stream about a third of its own height ahead of it.
  return { mask, w, h, cell, reach: Math.max(24, tallest * 0.35) };
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
