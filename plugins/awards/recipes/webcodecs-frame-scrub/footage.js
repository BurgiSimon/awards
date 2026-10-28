// The stand-in film, drawn in code so the recipe ships no media: one day passing over a standing stone, dawn to dusk
// in `count` frames. The film edge carries its frame number as an edge code (a start block and seven bits, big enough
// to survive compression), which is how the verifier proves the frame on screen is the frame asked for.

export const CLIP = { width: 960, height: 540, fps: 30, count: 120 };
export const EDGE = { strip: 44, x: 24, w: 40, h: 26, gap: 8, bits: 7 };

const mix = (a, b, t) => a.map((v, k) => Math.round(v + (b[k] - v) * t));
const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
// Sky colours at dawn, noon and dusk: top and horizon.
const SKY = {
  dawn: [[38, 44, 92], [236, 150, 112]],
  noon: [[96, 150, 206], [206, 226, 236]],
  dusk: [[46, 34, 82], [226, 112, 74]],
};
const sky = (t) => {
  const [a, b, u] = t < 0.5 ? [SKY.dawn, SKY.noon, t / 0.5] : [SKY.noon, SKY.dusk, (t - 0.5) / 0.5];
  const e = u * u * (3 - 2 * u);
  return [mix(a[0], b[0], e), mix(a[1], b[1], e)];
};

export function drawDay(g, i, { width: W, height: H, count } = CLIP) {
  const t = i / (count - 1);
  const ground = H - EDGE.strip - 150;
  const [top, horizon] = sky(t);
  const sk = g.createLinearGradient(0, 0, 0, ground);
  sk.addColorStop(0, rgb(top));
  sk.addColorStop(1, rgb(horizon));
  g.fillStyle = sk;
  g.fillRect(0, 0, W, ground);

  // The sun on its arc, low at both ends of the day.
  const elev = Math.sin(Math.PI * t);
  const sx = W * (0.08 + 0.84 * t), sy = ground - (ground - 70) * elev;
  const glow = g.createRadialGradient(sx, sy, 0, sx, sy, 120);
  glow.addColorStop(0, 'rgba(255,240,200,0.55)');
  glow.addColorStop(1, 'rgba(255,240,200,0)');
  g.fillStyle = glow;
  g.fillRect(sx - 120, sy - 120, 240, 240);
  g.beginPath();
  g.arc(sx, sy, 22, 0, Math.PI * 2);
  g.fillStyle = rgb(mix([255, 196, 140], [255, 248, 222], elev));
  g.fill();

  // Far hills, then the field.
  g.beginPath();
  g.moveTo(0, ground);
  for (let x = 0; x <= W; x += 8) g.lineTo(x, ground - 34 - 18 * Math.sin(x / 140) - 10 * Math.sin(x / 47 + 1));
  g.lineTo(W, ground);
  g.closePath();
  g.fillStyle = rgb(mix([58, 64, 88], [92, 116, 104], elev));
  g.fill();
  g.fillStyle = rgb(mix([70, 66, 64], [150, 156, 112], elev));
  g.fillRect(0, ground, W, H - EDGE.strip - ground);

  // The stone and its shadow, which swings from west to east and is longest at either end of the day.
  const bx = W / 2, by = ground + 96;
  const len = Math.min(420, 60 / Math.max(0.14, elev));
  const dir = (0.5 - t) * Math.PI * 0.9;               // away from the sun
  g.beginPath();
  g.moveTo(bx - 14, by);
  g.lineTo(bx + 14, by);
  g.lineTo(bx + 14 + Math.sin(dir) * len, by + 30 * Math.cos(dir) * Math.min(1, len / 200));
  g.lineTo(bx - 14 + Math.sin(dir) * len, by + 30 * Math.cos(dir) * Math.min(1, len / 200));
  g.closePath();
  g.fillStyle = 'rgba(20,18,30,0.38)';
  g.fill();
  g.fillStyle = rgb(mix([46, 44, 52], [118, 112, 104], elev));
  g.fillRect(bx - 14, by - 120, 28, 120);
  g.beginPath();
  g.moveTo(bx - 14, by - 120); g.lineTo(bx, by - 136); g.lineTo(bx + 14, by - 120);
  g.fill();
  // Hour stones on an arc around it.
  for (let h = 0; h <= 12; h++) {
    const a = Math.PI * (h / 12);
    g.fillStyle = 'rgba(240,236,224,0.7)';
    g.fillRect(bx - Math.cos(a) * 300 - 3, by + Math.sin(a) * 34 - 6, 6, 8);
  }

  // The film edge: a black strip, a start block, then the frame number in seven bits, white for 1.
  const y = H - EDGE.strip;
  g.fillStyle = '#000';
  g.fillRect(0, y, W, EDGE.strip);
  const by0 = y + (EDGE.strip - EDGE.h) / 2;
  g.fillStyle = '#fff';
  g.fillRect(EDGE.x, by0, EDGE.w, EDGE.h);
  for (let b = 0; b < EDGE.bits; b++) {
    if ((i >> b) & 1) g.fillRect(EDGE.x + (b + 1) * (EDGE.w + EDGE.gap), by0, EDGE.w, EDGE.h);
  }
  g.font = '600 18px ui-monospace, "SFMono-Regular", Menlo, monospace';
  g.textBaseline = 'middle';
  g.fillStyle = '#d8d2c4';
  g.fillText(`${String(i + 1).padStart(3, '0')}  ${clock(t)}`, EDGE.x + (EDGE.bits + 1) * (EDGE.w + EDGE.gap) + 16, y + EDGE.strip / 2 + 1);
}

// The time of day a frame shows: 05:30 to 21:00.
export function clock(t) {
  const m = Math.round(330 + t * (1260 - 330));
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

// Reads the edge code back from any 2D context holding a frame drawn over `box` (x, y, w, h in that context's pixels).
export function readEdge(ctx, box = { x: 0, y: 0, w: CLIP.width, h: CLIP.height }) {
  const sx = box.w / CLIP.width, sy = box.h / CLIP.height;
  const cy = box.y + (CLIP.height - EDGE.strip / 2) * sy;
  const lum = (x) => { const d = ctx.getImageData(Math.round(box.x + x * sx), Math.round(cy), 1, 1).data; return (d[0] + d[1] + d[2]) / 3; };
  if (lum(EDGE.x + EDGE.w / 2) < 128) return null;   // no start block: not a frame of this clip
  let n = 0;
  for (let b = 0; b < EDGE.bits; b++) if (lum(EDGE.x + (b + 1) * (EDGE.w + EDGE.gap) + EDGE.w / 2) >= 128) n |= 1 << b;
  return n;
}
