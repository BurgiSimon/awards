import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker, clamp, lerp } from '../_shared/raf.js';

// A 3D point cloud with no GPU: points sampled from three SVG shapes, projected in JavaScript with a horizontal fov,
// drawn far to near as squares on a 2D canvas. The hero's scroll picks the pair of shapes and the blend; each shape
// holds at both ends of its segment; a swirl weighted by sin²(πe) moves the cloud only mid-morph; the pointer parts it.

syncMotionTierAttribute();
const tier = motionTier();
const section = document.querySelector('[data-morph]');
const canvas = document.querySelector('[data-canvas]');
const ctx = canvas.getContext('2d');
const items = [...document.querySelectorAll('[data-item]')];
const count = document.querySelector('[data-count]');
const readout = document.querySelector('[data-readout]');
const coarse = matchMedia('(pointer: coarse)').matches;

// This recipe's own shapes (24 × 24 artboards), drawn in the page's ink.
const SHAPES = [
  // a ring with a notch
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4.2a5.8 5.8 0 1 1 0 11.6 5.8 5.8 0 0 1 0-11.6Z"/><rect x="11" y="0" width="2" height="7" fill="#000"/></svg>',
  // eight rays
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="#fff">' + Array.from({ length: 8 }, (_, i) => `<rect x="11" y="1" width="2" height="9.5" rx="1" transform="rotate(${i * 45} 12 12)"/>`).join('') + '<circle cx="12" cy="12" r="2.2"/></g></svg>',
  // a three-by-three field of squares
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="#fff">' + [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => `<rect x="${2 + c * 7.2}" y="${2 + r * 7.2}" width="5.6" height="5.6" rx="0.8"/>`)).join('') + '</g></svg>',
];
const P = {
  hold: 0.18,                 // each shape holds for the first and last 18 % of its segment
  follow: 2.45,               // scroll progress smoothing, per second (≈ 0.04 a frame at 60 fps)
  stiffness: 42, damping: 8,  // the spring from each point to its target, per second
  swirl: 260,                 // mid-morph swirl, px/s at w = 1
  burst: 520,                 // outward kick when the segment changes, px/s, decaying over 260 ms
  radius: coarse ? 200 : 100, repel: 900, repelFalloff: 3, tangential: 1.5,
  fov: coarse ? 40 : 45, cameraZ: coarse ? 600 : 800, depth: 60, buckets: 16, dot: 1.6,
};
const N = coarse || innerWidth < 760 ? 2500 : 5000;

const state = { ready: false, progress: 0, smooth: 0, segment: 0, e: 0, w: 0, fade: 0, points: N, meanErr: 0, meanSpeed: 0, displaced: 0, frames: 0, skipped: 0, motion: tier };

function rasterise(svg, size) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0, size, size);
      const data = g.getImageData(0, 0, size, size).data;
      const pts = [];
      for (let y = 0; y < size; y += 2) for (let x = 0; x < size; x += 2) if (data[(y * size + x) * 4 + 3] > 200 && data[(y * size + x) * 4] > 128) pts.push(x / size - 0.5, y / size - 0.5);
      resolve(pts);
    };
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

// Per-point state, in shape space (px, centred), plus a target per shape.
const pos = new Float32Array(N * 3), vel = new Float32Array(N * 3), seed = new Float32Array(N);
const targets = SHAPES.map(() => new Float32Array(N * 3));
let w = 1, h = 1, dpr = 1, box = 1;

function resize() {
  const r = canvas.getBoundingClientRect();
  w = Math.max(1, r.width); h = Math.max(1, r.height); dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  box = Math.min(w, h) * (w < 760 ? 0.82 : 0.62);
}

async function build() {
  const sampled = await Promise.all(SHAPES.map((s) => rasterise(s, 512)));
  for (let k = 0; k < SHAPES.length; k++) {
    const pts = sampled[k], t = targets[k], n = pts.length / 2;
    for (let i = 0; i < N; i++) {
      const j = Math.floor(Math.random() * n);
      t[i * 3] = pts[j * 2] + (Math.random() - 0.5) * 0.004;
      t[i * 3 + 1] = pts[j * 2 + 1] + (Math.random() - 0.5) * 0.004;
      t[i * 3 + 2] = (Math.random() - 0.5) * 2;   // depth in units of P.depth
    }
  }
  for (let i = 0; i < N; i++) { seed[i] = Math.random() * 1000; }
}

// Scroll → progress across the section's travel (its height minus one viewport).
function progress() {
  const r = section.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
}
const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
function blend(p) {
  const f = p * (SHAPES.length - 1);
  const k = Math.min(SHAPES.length - 2, Math.floor(f));
  const u = f - k;
  const e = u < P.hold ? 0 : u > 1 - P.hold ? 1 : easeInOutQuad((u - P.hold) / (1 - 2 * P.hold));
  return { k, e };
}

// Target in pixels for point i at blend (k, e).
function target(i, k, e, out) {
  const a = targets[k], b = targets[k + 1];
  out[0] = lerp(a[i * 3], b[i * 3], e) * box;
  out[1] = lerp(a[i * 3 + 1], b[i * 3 + 1], e) * box;
  out[2] = lerp(a[i * 3 + 2], b[i * 3 + 2], e) * P.depth;
  return out;
}

const pointer = { x: 0, y: 0, vx: 0, vy: 0, inside: false };
canvas.addEventListener('pointermove', (ev) => {
  const r = canvas.getBoundingClientRect();
  const x = ev.clientX - r.left - w / 2, y = ev.clientY - r.top - h / 2;
  pointer.vx = x - pointer.x; pointer.vy = y - pointer.y; pointer.x = x; pointer.y = y; pointer.inside = true;
}, { passive: true });
canvas.addEventListener('pointerleave', () => { pointer.inside = false; });

let lastSegment = 0, burstT = 0, time = 0;
const tmp = [0, 0, 0];
function step(dt) {
  time += dt;
  state.progress = progress();
  state.smooth = lerp(state.smooth, state.progress, 1 - Math.exp(-P.follow * dt));
  if (Math.abs(state.smooth - state.progress) < 1e-4) state.smooth = state.progress;
  const { k, e } = blend(state.smooth);
  const segShown = e > 0.5 ? k + 1 : k;
  if (segShown !== lastSegment) { burstT = 0.26; lastSegment = segShown; }
  burstT = Math.max(0, burstT - dt);
  state.segment = segShown; state.e = Math.round(e * 1000) / 1000;
  const wSwirl = Math.sin(Math.PI * e) ** 2; state.w = Math.round(wSwirl * 1000) / 1000;
  const spring = P.stiffness * dt, keep = Math.exp(-P.damping * dt), burst = (burstT / 0.26) * P.burst * dt;
  let err = 0, speed = 0, displaced = 0;
  for (let i = 0; i < N; i++) {
    const o = i * 3;
    target(i, k, e, tmp);
    let vx = vel[o], vy = vel[o + 1], vz = vel[o + 2];
    vx += (tmp[0] - pos[o]) * spring; vy += (tmp[1] - pos[o + 1]) * spring; vz += (tmp[2] - pos[o + 2]) * spring;
    if (wSwirl > 0) {
      const s = seed[i];
      vx += Math.cos(s * 0.9 + time * 1.3) * P.swirl * wSwirl * dt;
      vy += Math.sin(s * 1.3 + time * 1.1) * P.swirl * wSwirl * dt;
      vz += Math.sin(s * 0.7 + time * 0.9) * P.swirl * 0.5 * wSwirl * dt;
    }
    if (burst > 0) { const len = Math.hypot(pos[o], pos[o + 1]) || 1; vx += (pos[o] / len) * burst; vy += (pos[o + 1] / len) * burst; }
    if (pointer.inside) {
      const dx = pos[o] - pointer.x, dy = pos[o + 1] - pointer.y, d = Math.hypot(dx, dy);
      if (d < P.radius && d > 0.001) {
        const f = Math.pow(1 - d / P.radius, P.repelFalloff) * P.repel * dt;
        vx += (dx / d) * f - (dy / d) * f * P.tangential * 0.5;
        vy += (dy / d) * f + (dx / d) * f * P.tangential * 0.5;
      }
    }
    vx *= keep; vy *= keep; vz *= keep;
    pos[o] += vx * dt; pos[o + 1] += vy * dt; pos[o + 2] += vz * dt;
    vel[o] = vx; vel[o + 1] = vy; vel[o + 2] = vz;
    const d = Math.hypot(tmp[0] - pos[o], tmp[1] - pos[o + 1]);
    err += d; speed += Math.hypot(vx, vy); if (d > 20) displaced++;
  }
  state.meanErr = Math.round((err / N) * 100) / 100;
  state.meanSpeed = Math.round((speed / N) * 100) / 100;
  state.displaced = displaced;
}

// Draw: project with a horizontal fov, bucket by depth, paint far to near.
const buckets = Array.from({ length: P.buckets }, () => []);
let ink = '#f4f2ee', ground = '#1a1c1c';
function draw(alphaA = 1, alphaB = 0, k = 0) {
  const focal = (w * 0.5) / Math.tan((P.fov * Math.PI) / 360);
  const base = focal / P.cameraZ;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = ground; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = ink;
  const drawSet = (getter, alpha) => {
    for (const b of buckets) b.length = 0;
    for (let i = 0; i < N; i++) {
      const p = getter(i);
      const zc = p[2] + P.cameraZ;
      const t = clamp(Math.floor(((zc - P.cameraZ + P.depth * 1.5) / (P.depth * 3)) * P.buckets), 0, P.buckets - 1);
      buckets[P.buckets - 1 - t].push(p[0], p[1], zc);
    }
    for (const b of buckets) {
      for (let j = 0; j < b.length; j += 3) {
        const s = (focal / b[j + 2]) / base;             // 1 at z = 0
        ctx.globalAlpha = alpha * clamp((s - 0.85) * 3.3, 0.25, 1);
        const size = P.dot * s;
        ctx.fillRect(w / 2 + b[j] * s - size / 2, h / 2 + b[j + 1] * s - size / 2, size, size);
      }
    }
  };
  const live = [0, 0, 0];
  if (alphaB === 0 && tier === 'full') drawSet((i) => { live[0] = pos[i * 3]; live[1] = pos[i * 3 + 1]; live[2] = pos[i * 3 + 2]; return live; }, alphaA);
  else {
    // Reduced motion: two settled shapes, cross-faded by opacity only.
    if (alphaA > 0) drawSet((i) => target(i, k, 0, live), alphaA);
    if (alphaB > 0) drawSet((i) => target(i, k, 1, live), alphaB);
  }
  ctx.globalAlpha = 1;
  state.frames++;
}

function syncList() {
  items.forEach((li, i) => (i === state.segment ? li.setAttribute('aria-current', 'true') : li.removeAttribute('aria-current')));
  count.textContent = String(state.segment + 1);
}

await build();
resize();
const cs = getComputedStyle(document.documentElement);
ink = cs.getPropertyValue('--ink').trim() || ink;
ground = cs.getPropertyValue('--ground').trim() || ground;
// Start settled on the first shape.
{ const { k, e } = blend(progress()); state.smooth = progress(); for (let i = 0; i < N; i++) { target(i, k, e, tmp); pos.set(tmp, i * 3); } }

let visible = true, unsubscribe = null;
if (tier === 'full') {
  const frame = (dt) => {
    step(Math.min(dt, 1 / 20));
    // Settled, unmoved and unpointed: skip the paint.
    if (state.meanSpeed < 0.5 && (state.e === 0 || state.e === 1) && !pointer.inside && burstT === 0 && state.frames > 2) { state.skipped++; return; }
    draw();
    syncList();
  };
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible && !unsubscribe) unsubscribe = ticker.add(frame);
    else if (!visible && unsubscribe) { unsubscribe(); unsubscribe = null; }
  }).observe(section);
  draw();
} else {
  // Reduced motion and static: render on scroll only, as an opacity cross-fade between the two settled shapes.
  const render = () => {
    state.progress = state.smooth = progress();
    const { k, e } = blend(state.progress);
    state.segment = e > 0.5 ? k + 1 : k; state.e = Math.round(e * 1000) / 1000; state.fade = state.e; state.meanErr = 0;
    draw(1 - e, e, k);
    syncList();
  };
  addEventListener('scroll', () => requestAnimationFrame(render), { passive: true });
  render();
}
addEventListener('resize', () => { resize(); if (tier !== 'full') { const { k, e } = blend(progress()); draw(1 - e, e, k); } });
readout.textContent = `canvas 2d · ${N} points`;
state.ready = true;

awards.addState(() => ({ ...state }));
awards.ready();
