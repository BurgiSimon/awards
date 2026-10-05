import * as THREE from 'three';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier } from '../_shared/quality-tiers.js';
import { ticker, clamp } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const root = document.querySelector('[data-gallery]');
const stage = root.querySelector('[data-stage]');
const canvas = stage.querySelector('canvas');
const fallback = root.querySelector('[data-fallback]');
const readout = document.querySelector('[data-gl-readout]');
const live = root.querySelector('[data-live]');
const count = root.querySelector('[data-count]');
const capTitle = root.querySelector('[data-caption-title]');
const capMeta = root.querySelector('[data-caption-meta]');
const items = [...root.querySelectorAll('[data-items] li')].map((li) => ({
  title: li.querySelector('[data-title]').textContent, meta: li.querySelector('[data-meta]').textContent, hue: li.dataset.hue,
}));
const N = items.length;
const instant = () => motionTier() !== 'full';

// Spring on the float index: a = ω²·(target − pos) − c·v. ω 9.5, c 12 → ζ ≈ .63, one small overshoot, settled in ~.7 s.
const SPRING = { freq: 9.5, damping: 12, step: 1 / 240 };
// Drag: items per stage-width-fraction, velocity smoothing and cap, friction per 60 Hz frame while coasting.
const DRAG = { threshold: 6, sensitivity: 0.95, smoothing: 0.32, maxV: 30, friction: 0.89, handoff: 2, overshoot: 0.3 };
// Wheel step detector. Deltas in px (line mode × 16). Quiet gap re-arms; a held gesture repeats only while its delta
// is not decaying against an envelope (peak follower, time constant 550 ms), so a trackpad's inertia tail never steps.
const WHEEL = { floor: 0.3, cap: 24, threshold: 6, quiet: 130, sustain: 480, envelope: 550 };
// Layout in world units: plate size, spacing, depth per step, inactive scale, yaw per step.
const ROW = { w: 1.5, h: 1.9, gap: 2.1, depth: 1, inactive: 0.8, yaw: 0.22 };

const S = { pos: 0, v: 0, target: 0, mode: 'rest', wheelSteps: 0, wheelEvents: 0, wheelPassed: 0, renders: 0, gl: false, quality: 'pending' };
let render = () => {};
let pxPerItem = () => stage.clientWidth * 0.35; // replaced by the projected plate spacing once the camera exists
let drag = null;

// --- position and announcements -------------------------------------------------------------------------------
const pad = (n) => String(n).padStart(2, '0');
function announce(i) {
  const it = items[i];
  count.textContent = `${pad(i + 1)} / ${pad(N)}`;
  capTitle.textContent = it.title;
  capMeta.textContent = it.meta;
  fallback.style.background = it.hue;
  live.textContent = `Plate ${i + 1} of ${N}: ${it.title}`;
}

function go(i) {
  i = clamp(i, 0, N - 1);
  const changed = i !== S.target;
  S.target = i;
  if (changed) announce(i);
  if (instant()) { S.pos = i; S.v = 0; S.mode = 'rest'; render(); return; }
  S.mode = 'spring';
  ticker.add(tick);
}

// One ticker: spring (fixed substeps, stable for any dt), coast (friction), then render. Leaves the ticker at rest.
function tick(dt) {
  if (S.mode === 'coast') {
    S.v *= DRAG.friction ** (dt * 60);
    S.pos = clamp(S.pos + S.v * dt, -DRAG.overshoot, N - 1 + DRAG.overshoot);
    if (Math.abs(S.v) < DRAG.handoff) go(Math.round(S.pos));
  } else if (S.mode === 'spring') {
    const w2 = SPRING.freq ** 2;
    for (let t = dt; t > 1e-6; t -= SPRING.step) {
      const h = Math.min(SPRING.step, t);
      S.v += (w2 * (S.target - S.pos) - SPRING.damping * S.v) * h;
      S.pos += S.v * h;
    }
    if (Math.abs(S.target - S.pos) < 1e-4 && Math.abs(S.v) < 1e-3) { S.pos = S.target; S.v = 0; S.mode = 'rest'; }
  }
  render();
  if (S.mode === 'rest' || S.mode === 'drag') ticker.remove(tick);
}

// --- input -----------------------------------------------------------------------------------------------------
const W = { acc: 0, last: 0, lastStep: 0, armed: true, env: 0 };
stage.addEventListener('wheel', (e) => {
  if (e.ctrlKey) return; // pinch-zoom stays the browser's
  let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  if (e.deltaMode === 1) d *= 16;
  const dir = Math.sign(d);
  // At an end, a wheel that points outward belongs to the page: the gallery never traps the scroll.
  if ((dir < 0 && S.target === 0) || (dir > 0 && S.target === N - 1)) { S.wheelPassed++; return; }
  e.preventDefault();
  S.wheelEvents++;
  const now = e.timeStamp, mag = Math.abs(d);
  if (mag < WHEEL.floor) return;
  if (now - W.last > WHEEL.quiet) { W.acc = 0; W.armed = true; W.env = 0; } // a new gesture
  W.env = Math.max(mag, W.env * Math.exp(-(now - W.last) / WHEEL.envelope));
  W.last = now;
  // Held, not decaying: re-arm once per sustain period. A decaying tail sits below its own envelope and never does.
  if (!W.armed && now - W.lastStep >= WHEEL.sustain && mag >= W.env * 0.95) { W.armed = true; W.acc = 0; }
  if (!W.armed) return;
  W.acc += clamp(d, -WHEEL.cap, WHEEL.cap);
  if (Math.abs(W.acc) >= WHEEL.threshold) {
    W.armed = false; W.acc = 0; W.lastStep = now; S.wheelSteps++;
    go(S.target + dir);
  }
}, { passive: false });

stage.addEventListener('keydown', (e) => {
  const to = { ArrowRight: S.target + 1, ArrowDown: S.target + 1, ArrowLeft: S.target - 1, ArrowUp: S.target - 1, Home: 0, End: N - 1 }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  go(to);
});
root.querySelector('[data-prev]').addEventListener('click', () => go(S.target - 1));
root.querySelector('[data-next]').addEventListener('click', () => go(S.target + 1));

stage.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 || drag) return;
  drag = { id: e.pointerId, x: e.clientX, t: e.timeStamp, start: S.pos, moved: false, v: 0 };
});
stage.addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  if (!drag.moved) {
    if (Math.abs(e.clientX - drag.x) < DRAG.threshold) return;
    drag.moved = true; drag.x0 = e.clientX; drag.start = S.pos;
    stage.setPointerCapture(e.pointerId);
    S.mode = 'drag'; S.v = 0;
  }
  // The row follows the pointer: pxPerItem is the on-screen spacing of two plates, so a plate stays under the finger.
  const moved = -((e.clientX - drag.x0) / pxPerItem()) * DRAG.sensitivity;
  const prev = S.pos;
  S.pos = clamp(drag.start + moved, -DRAG.overshoot, N - 1 + DRAG.overshoot);
  const dt = Math.max(1, e.timeStamp - drag.t) / 1000;
  const inst = clamp((S.pos - prev) / dt, -DRAG.maxV, DRAG.maxV);
  drag.v += (inst - drag.v) * DRAG.smoothing;
  drag.t = e.timeStamp;
  render();
});
function endDrag(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const d = drag; drag = null;
  if (!d.moved) return;
  if (instant()) return go(Math.round(S.pos));
  S.v = e.timeStamp - d.t > 100 ? 0 : d.v; // a pointer that rested before release has no speed
  S.mode = 'coast';
  ticker.add(tick);
}
stage.addEventListener('pointerup', endDrag);
stage.addEventListener('pointercancel', endDrag);

// --- WebGL row ---------------------------------------------------------------------------------------------------
// Plate faces drawn in 2D: a ground in the item's hue, a thrown disc, the number. Synthetic, no image files.
function plateTexture(it, i) {
  const c = document.createElement('canvas');
  c.width = 384; c.height = 486;
  const g = c.getContext('2d');
  g.beginPath(); g.roundRect(0, 0, c.width, c.height, 28); g.fillStyle = it.hue; g.fill();
  const r = 120, cx = c.width / 2, cy = c.height * 0.44;
  const grad = g.createRadialGradient(cx - 40, cy - 50, 10, cx, cy, r);
  grad.addColorStop(0, 'rgba(255,255,255,.55)'); grad.addColorStop(1, 'rgba(0,0,0,.25)');
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = grad; g.fill();
  g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.18)';
  for (let k = 1; k < 4; k++) { g.beginPath(); g.arc(cx, cy, r * k / 4, 0, Math.PI * 2); g.stroke(); }
  const light = new THREE.Color(it.hue).getHSL({}).l > 0.5;
  g.fillStyle = light ? 'rgba(26,28,28,.85)' : 'rgba(244,242,238,.9)';
  g.font = '500 44px "Helvetica Neue", Helvetica, Arial, sans-serif';
  g.fillText(pad(i + 1), 28, c.height - 32);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

async function start() {
  const quality = await detectQualityTier({ sampleMs: 300 });
  S.quality = quality.tier;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { return false; }
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 7);
  const row = new THREE.Group();
  row.rotation.set(0.1, -0.12, -0.05); // a gentle tilt so depth reads; retune per direction
  scene.add(row);
  const geo = new THREE.PlaneGeometry(ROW.w, ROW.h);
  const plates = items.map((it, i) => {
    const mat = new THREE.MeshBasicMaterial({ map: plateTexture(it, i), transparent: true });
    const m = new THREE.Mesh(geo, mat);
    row.add(m);
    return m;
  });

  // Every plate's transform is a function of its distance to the float index; nothing else is animated.
  render = () => {
    plates.forEach((m, i) => {
      const d = i - S.pos, a = Math.min(1, Math.abs(d));
      m.position.set(d * ROW.gap, 0.12 * (1 - a), -Math.abs(d) * ROW.depth);
      m.scale.setScalar(1 + (ROW.inactive - 1) * a);
      m.rotation.y = -clamp(d, -2, 2) * ROW.yaw;
      m.material.opacity = 1 - 0.35 * Math.min(1, Math.max(0, Math.abs(d) - 1));
    });
    renderer.render(scene, camera);
    S.renders++;
  };
  const resize = () => {
    const r = stage.getBoundingClientRect();
    renderer.setPixelRatio(quality.dpr);
    renderer.setSize(Math.round(r.width), Math.round(r.height), false);
    camera.aspect = r.width / r.height;
    // Narrow stages pull the camera back so the active plate keeps about 60 % of the width.
    camera.position.z = camera.aspect < 1 ? 7 / Math.max(0.55, camera.aspect) * 0.6 : 7;
    camera.updateProjectionMatrix();
    const visibleW = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
    pxPerItem = () => (ROW.gap / visibleW) * stage.clientWidth;
    render();
  };
  const ro = new ResizeObserver(resize); ro.observe(stage);
  resize();

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); html.classList.remove('gl-active'); readout.textContent = 'dom (context lost)'; S.gl = false; render = () => {}; });
  addEventListener('pagehide', () => {
    ro.disconnect(); ticker.remove(tick);
    plates.forEach((m) => { m.material.map.dispose(); m.material.dispose(); });
    geo.dispose(); renderer.dispose();
  }, { once: true });

  // Centre and corner pixels, read from the default framebuffer right after a fresh render in the same task.
  window.__gallery = {
    sample() {
      render();
      const gl = renderer.getContext(), w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
      const at = (x, y) => { const px = new Uint8Array(4); gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return Array.from(px); };
      return { centre: at(w >> 1, h >> 1), corner: at(2, 2) };
    },
  };
  html.classList.add('gl-active');
  readout.textContent = `webgl · ${quality.tier}`;
  S.gl = true;
  return true;
}

announce(0);
live.textContent = ''; // announce changes, not the initial state
const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (glPossible) { if (!(await start())) readout.textContent = 'dom (webgl failed)'; }
else readout.textContent = 'dom (no webgl)';

awards.addState(() => ({
  motion: motionTier(), pos: Math.round(S.pos * 1e4) / 1e4, target: S.target, mode: S.mode,
  live: live.textContent, count: count.textContent,
  wheelSteps: S.wheelSteps, wheelEvents: S.wheelEvents, wheelPassed: S.wheelPassed,
  gl: S.gl, quality: S.quality, renders: S.renders,
  pixels: S.gl ? window.__gallery.sample() : null,
}));
awards.ready();
