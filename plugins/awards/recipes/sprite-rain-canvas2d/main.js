import { awards } from '../_shared/awards-hook.js';
import { detectQualityTier } from '../_shared/quality-tiers.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const canvas = document.querySelector('[data-rain]');
const button = document.querySelector('[data-trigger]');
const status = document.querySelector('[data-status]');
const ctx = canvas.getContext('2d');

// Live-sprite ceiling per quality tier. Canvas 2D needs no GPU, so even the low tier gets a light shower.
const BUDGET = { high: 160, mid: 80, low: 32 };
// Per-frame values authored at 60 fps (source: gravity .45 px/frame², spin ±10°/frame); scaled by dt·60 below.
const GRAVITY = 0.45;
const DRIFT = 3;              // |vx| ≤ 3 px/frame
const SPIN = (10 * Math.PI) / 180;
const RATE = 90;              // spawns per second while the emitter is open
const EMIT_MS = 1200;
const SIZE = [14, 28];        // CSS px

const profile = await detectQualityTier({ sampleMs: 300 });
const budget = BUDGET[profile.tier];
const state = { spawned: 0, removed: 0, maxLive: 0, running: false };
let sprites = [];
let nextId = 0;
let emitUntil = 0;
let carry = 0;
let unsubscribe = null;
let dpr = 1;

// The sprite: a four-point spark drawn once to an offscreen bitmap, then stamped with a rotation.
const stamp = document.createElement('canvas');
function drawStamp() {
  const s = Math.ceil(SIZE[1] * dpr);
  stamp.width = stamp.height = s;
  const g = stamp.getContext('2d');
  const r = s / 2, k = r * 0.22;
  g.fillStyle = getComputedStyle(html).getPropertyValue('--accent').trim() || '#0016cb';
  g.beginPath();
  g.moveTo(r, 0);
  g.quadraticCurveTo(r + k, r - k, s, r);
  g.quadraticCurveTo(r + k, r + k, r, s);
  g.quadraticCurveTo(r - k, r + k, 0, r);
  g.quadraticCurveTo(r - k, r - k, r, 0);
  g.fill();
}

function resize() {
  // DPR cap and absolute pixel budget from the probe, as every effect on the page should read them.
  const w = canvas.clientWidth, h = canvas.clientHeight;
  dpr = profile.dpr;
  const px = w * h * dpr * dpr;
  if (px > profile.maxPixels) dpr *= Math.sqrt(profile.maxPixels / px);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  drawStamp();
}

function spawn() {
  const size = (SIZE[0] + Math.random() * (SIZE[1] - SIZE[0])) * dpr;
  sprites.push({
    id: nextId++,
    size,
    x: Math.random() * canvas.width,
    y: -size,
    vx: (Math.random() * 2 - 1) * DRIFT * dpr,
    vy: 0,                                   // at rest: gravity alone makes it fall
    a: Math.random() * Math.PI * 2,
    va: (Math.random() * 2 - 1) * SPIN,
  });
  state.spawned++;
}

function tick(dt, t) {
  const f = dt * 60;                         // frames elapsed at 60 fps: same fall at 30, 60 or 144 Hz
  if (t < emitUntil) {
    carry += RATE * dt;
    for (; carry >= 1; carry--) if (sprites.length < budget) spawn();
  }
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const kept = [];
  for (const p of sprites) {
    p.vy += GRAVITY * dpr * f;
    p.x += p.vx * f;
    p.y += p.vy * f;
    p.a += p.va * f;
    const r = p.size / 2;
    if (p.y - r > h || p.x < -r || p.x > w + r) { state.removed++; continue; }   // off-screen: gone
    ctx.setTransform(1, 0, 0, 1, p.x, p.y);
    ctx.rotate(p.a);
    ctx.drawImage(stamp, -r, -r, p.size, p.size);
    kept.push(p);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  sprites = kept;
  state.maxLive = Math.max(state.maxLive, sprites.length);
  // Nothing left and nothing coming: release the ticker so the page burns no frames.
  if (!sprites.length && t >= emitUntil) stop();
}

function stop() {
  unsubscribe?.();
  unsubscribe = null;
  state.running = false;
}

button.addEventListener('click', () => {
  if (motionTier() !== 'full') {
    status.textContent = 'Reduced motion is on, so the rain stays off.';
    return;
  }
  status.textContent = 'It is raining sparks.';
  emitUntil = performance.now() + EMIT_MS;
  if (!unsubscribe) {
    unsubscribe = ticker.add(tick);
    state.running = true;
  }
});

addEventListener('resize', () => { resize(); });
resize();

awards.addState(() => ({
  motion: motionTier(),
  tier: profile.tier,
  budget,
  live: sprites.length,
  maxLive: state.maxLive,
  spawned: state.spawned,
  removed: state.removed,
  running: state.running,
  sprites: sprites.slice(0, 12).map((p) => ({ id: p.id, y: Math.round(p.y * 10) / 10 })),
  status: status.textContent,
}));
awards.ready();
