import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute, onMotionTierChange } from '../_shared/reduced-motion.js';
import { ticker, clamp } from '../_shared/raf.js';

syncMotionTierAttribute();

const hero = document.querySelector('[data-hero]');
const svg = document.querySelector('[data-field]');
const fine = matchMedia('(hover: hover) and (pointer: fine)');

// Wave: angle = noise(x, y drifting in time) × 12 rad; the offset is an ellipse, wider than tall.
const WAVE = { turns: 12, ax: 32, ay: 16, driftX: 0.0125, driftY: 0.005, scaleX: 0.002, scaleY: 0.0015 };
// Push: radius max(175, pointer speed) px, spring .005 and damping .925 per 60 Hz frame, offset capped.
const PUSH = { radius: 175, maxRadius: 400, gain: 0.08, spring: 0.005, damping: 0.925, cap: 120 };
// Intro: each line grows from its end back to its start, 3 s expo-out, edges first, .5 s spread to the centre.
const INTRO = { duration: 3, spread: 0.5 };
const PAD = 48; // lines run past the edges so a displaced end never shows

// Seeded 2D Perlin noise (improved-Perlin gradients and fade), output roughly -1..1.
function perlin2(seed) {
  const base = Array.from({ length: 256 }, (_, i) => i);
  let s = seed >>> 0;
  const rand = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [base[i], base[j]] = [base[j], base[i]]; }
  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i++) p[i] = base[i & 255];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const mix = (a, b, t) => a + (b - a) * t;
  const grad = (h, x, y) => {
    switch (h & 7) {
      case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y;
      case 4: return x; case 5: return -x; case 6: return y; default: return -y;
    }
  };
  return (x, y) => {
    const xf = Math.floor(x), yf = Math.floor(y);
    const X = xf & 255, Y = yf & 255;
    x -= xf; y -= yf;
    const u = fade(x), v = fade(y);
    const a = p[X] + Y, b = p[X + 1] + Y;
    return mix(mix(grad(p[a], x, y), grad(p[b], x - 1, y), u), mix(grad(p[a + 1], x, y - 1), grad(p[b + 1], x - 1, y - 1), u), v);
  };
}
const noise = perlin2(7);
const expoOut = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

// One <path> holds every line as a subpath: one draw per frame instead of one per line.
const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
svg.append(path);

let W = 0, H = 0, gapY = 0, stepX = 0, rows = 0, cols = 0;
let bx, by, cx, cy, vx, vy, lx, ly; // base position, pointer offset, pointer velocity (px per 60 Hz frame), one line's points
let time = 0, introTime = INTRO.duration + INTRO.spread, active = false, pushOn = false, visible = true, unsub = null;
const pointer = { x: 0, y: 0, lastX: 0, lastY: 0, seen: false };

// Coarse pointers get a sparser grid: fewer points to move, and no push to spend them on.
function build() {
  const r = hero.getBoundingClientRect();
  W = Math.round(r.width); H = Math.round(r.height);
  gapY = fine.matches ? 18 : 24;
  stepX = fine.matches ? 16 : 22;
  rows = Math.ceil((H + 2 * PAD) / gapY) + 1;
  cols = Math.ceil((W + 2 * PAD) / stepX) + 1;
  const n = rows * cols;
  bx = new Float32Array(n); by = new Float32Array(n);
  cx = new Float32Array(n); cy = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n);
  lx = new Float32Array(cols); ly = new Float32Array(cols);
  for (let i = 0; i < n; i++) { bx[i] = -PAD + (i % cols) * stepX; by[i] = -PAD + Math.floor(i / cols) * gapY; }
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  active = false;
  render();
}

// Share of line r drawn so far (0..1).
function reveal(r) {
  const edge = Math.min(r, rows - 1 - r) / Math.max(1, (rows - 1) / 2);
  return expoOut(clamp((introTime - edge * INTRO.spread) / INTRO.duration, 0, 1));
}

function render() {
  const { turns, ax, ay, driftX, driftY, scaleX, scaleY } = WAVE;
  const tx = time * driftX, ty = time * driftY, last = cols - 1;
  let d = '';
  for (let r = 0, k = 0; r < rows; r++, k += cols) {
    const shown = reveal(r);
    if (shown <= 0) continue;
    for (let c = 0; c < cols; c++) {
      const i = k + c, a = noise((bx[i] + tx) * scaleX, (by[i] + ty) * scaleY) * turns;
      lx[c] = bx[i] + Math.cos(a) * ax + cx[i];
      ly[c] = by[i] + Math.sin(a) * ay + cy[i];
    }
    // Drawn from the line's end back towards its start, the "100% 100%" → "0% 100%" shape.
    const start = (1 - shown) * last, c0 = Math.floor(start), f = start - c0;
    const c1 = Math.min(c0 + 1, last);
    d += 'M' + (lx[c0] + (lx[c1] - lx[c0]) * f).toFixed(1) + ' ' + (ly[c0] + (ly[c1] - ly[c0]) * f).toFixed(1);
    for (let c = c1; c <= last; c++) d += 'L' + lx[c].toFixed(1) + ' ' + ly[c].toFixed(1);
  }
  path.setAttribute('d', d);
}

// Semi-implicit spring scaled by n = dt × 60, so 60 Hz and 144 Hz screens settle alike.
// The impulse is linear in the pointer's travel this frame, so its total is framerate-independent too.
function spring(dt) {
  const n = dt * 60;
  let dx = 0, dy = 0, px = 0, py = 0;
  if (pointer.seen) {
    dx = pointer.x - pointer.lastX; dy = pointer.y - pointer.lastY;
    pointer.lastX = pointer.x; pointer.lastY = pointer.y;
  }
  const moved = pushOn && (dx !== 0 || dy !== 0);
  if (!moved && !active) return;
  const R = clamp(Math.hypot(dx, dy) / n, PUSH.radius, PUSH.maxRadius);
  if (moved) { const rect = svg.getBoundingClientRect(); px = pointer.x - rect.left; py = pointer.y - rect.top; }
  const damping = Math.pow(PUSH.damping, n), k = PUSH.spring * n, cap = PUSH.cap;
  let energy = 0;
  for (let i = 0; i < bx.length; i++) {
    if (moved) {
      const ex = bx[i] + cx[i] - px, ey = by[i] + cy[i] - py, d2 = ex * ex + ey * ey;
      if (d2 < R * R) { const s = 1 - Math.sqrt(d2) / R, f = s * s * PUSH.gain; vx[i] += dx * f; vy[i] += dy * f; }
    }
    vx[i] = (vx[i] - cx[i] * k) * damping;
    vy[i] = (vy[i] - cy[i] * k) * damping;
    cx[i] = clamp(cx[i] + vx[i] * n, -cap, cap);
    cy[i] = clamp(cy[i] + vy[i] * n, -cap, cap);
    energy = Math.max(energy, Math.abs(cx[i]) + Math.abs(cy[i]) + Math.abs(vx[i]) + Math.abs(vy[i]));
  }
  active = energy > 0.01;
  if (!active) { cx.fill(0); cy.fill(0); vx.fill(0); vy.fill(0); }
}

function tick(dt) {
  time += dt * 1000;
  introTime += dt;
  spring(dt);
  render();
}

// Full: ticker while the hero is on screen, push for fine pointers. Reduced and static: one still, fully drawn frame, no ticker.
function sync() {
  const full = motionTier() === 'full';
  const want = full && visible;
  if (want && !unsub) unsub = ticker.add(tick);
  if (!want && unsub) { unsub(); unsub = null; }
  pushOn = full && fine.matches;
  if (!full) {
    introTime = INTRO.duration + INTRO.spread;
    cx.fill(0); cy.fill(0); vx.fill(0); vy.fill(0); active = false;
    render();
  }
}

addEventListener('pointermove', (e) => {
  if (!pushOn || e.pointerType === 'touch') return;
  pointer.x = e.clientX; pointer.y = e.clientY;
  if (!pointer.seen) { pointer.lastX = pointer.x; pointer.lastY = pointer.y; pointer.seen = true; }
}, { passive: true });
document.documentElement.addEventListener('pointerleave', () => { pointer.seen = false; });

if (motionTier() === 'full') introTime = 0;
build();
sync();

new ResizeObserver(() => {
  const r = hero.getBoundingClientRect();
  if (Math.round(r.width) !== W || Math.abs(r.height - H) > 120) { build(); sync(); }
}).observe(hero);
new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(hero);
onMotionTierChange(sync);
// data-motion on <html> ("static" | "reduced" | "full") switches the tier live.
new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });

awards.addState(() => {
  let max = 0;
  const bands = Array.from({ length: Math.ceil(H / 100) }, () => 0);
  for (let i = 0; i < bx.length; i++) {
    const m = Math.hypot(cx[i], cy[i]);
    max = Math.max(max, m);
    const b = Math.floor(by[i] / 100);
    if (b >= 0 && b < bands.length) bands[b] = Math.max(bands[b], m);
  }
  return {
    motion: motionTier(),
    ticking: !!unsub,
    pointerPush: pushOn,
    lines: rows,
    pointsPerLine: cols,
    gapY, stepX,
    drawn: introTime >= INTRO.duration + INTRO.spread,
    fieldTop: Math.round(svg.getBoundingClientRect().top),
    push: { max: Number(max.toFixed(2)), bands: bands.map((v) => Number(v.toFixed(1))) },
  };
});
awards.ready();
