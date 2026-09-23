import * as THREE from 'three';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier, applyRendererBudget } from '../_shared/quality-tiers.js';
import { ticker, damp, clamp } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const $ = (s) => document.querySelector(s);
const canvas = $('[data-gl]'), readout = $('[data-gl-readout]'), counter = $('[data-counter]');
const buttons = [...document.querySelectorAll('[data-work]')];
const works = buttons.map((b) => ({ title: b.querySelector('.works__t').textContent, meta: b.querySelector('.works__m').textContent }));
const N = works.length;
// Synthetic card art: one field colour per work (the centre of every card is pure field, which the verifier reads back).
const FIELDS = ['#c97164', '#0016cb', '#f4f2ee', '#619785', '#a89474', '#ff9bb4', '#ffc800', '#bf5114'];
const INKS = ['#1a1c1c', '#f4f2ee', '#1a1c1c', '#1a1c1c', '#1a1c1c', '#1d2440', '#1a1c1c', '#f4f2ee'];

// Parameters. Offsets are in items (1 = one card pitch), so a resize never loses the place.
const WHEEL = 1.25;         // wheel px multiplier; deltaMode lines × 16
const BURST = { min: 40, gap: 30, cooldown: 500, gain: 2, k: 0.22, maxFrames: 4 };
const K_FOLLOW = 6;         // damping of the drawn offset toward the target
const SNAP_AFTER = 200;     // ms without input before the target rounds to the nearest card
const VMAX = 4;             // items per second at which the bend saturates
const TWIST = 0.55, WAVE = 0.16; // radians across half a sheet; fold depth as a fraction of half the sheet
const STEP_COOLDOWN = 350;  // reduced tier: one step per wheel gesture

const state = { gl: false, tier: 'pending', target: 0, offset: 0, pending: 0, velocity: 0, bend: 0, index: 0, bursts: 0, wheelEvents: 0, keySteps: 0, axis: 'x' };
let lastInput = 0, lastWheel = 0, lastBurst = -1e9, lastStep = -1e9, touch = null;
const full = () => motionTier() === 'full';
const mod = (a, n) => ((a % n) + n) % n;
const isMoving = () => state.pending !== 0 || state.offset !== state.target || state.velocity !== 0;

// Input only ever writes `target` (or the burst reservoir). Full tier: bursts ease in, the drawn offset follows.
function onWheel(e) {
  if (!state.gl) return;
  e.preventDefault();
  let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  d *= e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
  d *= WHEEL;
  const now = performance.now();
  state.wheelEvents++; lastInput = now;
  if (!full()) { if (Math.abs(d) >= 4 && now - lastStep > STEP_COOLDOWN) { lastStep = now; step(Math.sign(d)); } return; }
  // A burst is a discrete flick (a mouse notch after a pause), not a trackpad stream: amplify it and spread it over frames.
  const burst = Math.abs(d) >= BURST.min && now - lastWheel >= BURST.gap && now - lastBurst >= BURST.cooldown;
  lastWheel = now;
  if (burst) { lastBurst = now; state.bursts++; state.pending += (d * BURST.gain) / pitch(); }
  else state.target += d / pitch();
}
function step(dir) {
  state.pending = 0;
  state.target = Math.round(state.target) + dir;
  if (!full()) state.offset = state.target; // reduced / static: the step lands now, no easing
  lastInput = performance.now();
}
// Go to work i by the shortest way round the loop.
function goTo(i) {
  const d = mod(i - Math.round(state.target) + N / 2, N) - N / 2;
  step(d);
}
addEventListener('wheel', onWheel, { passive: false });
addEventListener('touchstart', (e) => { touch = e.touches[0][state.axis === 'x' ? 'clientX' : 'clientY']; }, { passive: true });
addEventListener('touchmove', (e) => {
  if (touch == null || !state.gl) return;
  const c = e.touches[0][state.axis === 'x' ? 'clientX' : 'clientY'];
  if (full()) state.target += ((touch - c) * 1.5) / pitch();
  touch = full() ? c : touch;
  lastInput = performance.now();
}, { passive: true });
addEventListener('touchend', (e) => {
  if (touch == null || !state.gl) return;
  const c = e.changedTouches[0][state.axis === 'x' ? 'clientX' : 'clientY'];
  if (!full() && Math.abs(touch - c) > 40) step(Math.sign(touch - c)); // reduced: one swipe, one step
  touch = null;
});
addEventListener('keydown', (e) => {
  if (!state.gl || e.ctrlKey || e.altKey || e.metaKey || e.target.closest?.('input, textarea, select')) return;
  const onControl = e.target.closest?.('button, a');
  const dir = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1, ' ': e.shiftKey ? -1 : 1 }[e.key];
  if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); state.keySteps++; goTo(e.key === 'Home' ? 0 : N - 1); return; }
  if (dir === undefined || (e.key === ' ' && onControl)) return; // Space on a button presses the button
  e.preventDefault(); state.keySteps++; step(dir);
});
buttons.forEach((b, i) => { b.addEventListener('click', () => goTo(i)); b.addEventListener('focus', () => { if (state.gl && mod(Math.round(state.target), N) !== i) goTo(i); }); });
// The capture tool and the jury step the reel through this: progress 0..1 → work 1..N, instantly.
awards.setScroller((p) => { state.target = state.offset = Math.round(p * (N - 1)); state.pending = state.velocity = 0; lastInput = -1e9; });

let pitch = () => 1;
let announced = 0;
function announce(i) {
  buttons.forEach((b, j) => (j === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
  counter.textContent = `${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')} · ${works[i].title}`;
  announced = i;
}

const vertex = /* glsl */ `
  uniform vec2 uSize;      // sheet size in px
  uniform float uVertical; // 0: the reel runs along x, 1: along y
  uniform float uBend;     // signed; |velocity| / VMAX · sin(π·p), zero at rest
  uniform float uTwist;
  uniform float uWave;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec2 q = position.xy * uSize;
    float along = mix(q.x, q.y, uVertical);
    float across = mix(q.y, q.x, uVertical);
    float half_ = mix(uSize.x, uSize.y, uVertical) * 0.5;
    float t = along / half_;                       // -1 … 1 along the direction of travel
    float a = uBend * uTwist * t;                  // twist about the travel axis, growing toward the ends
    float z = across * sin(a) + sin(t * 3.14159) * uBend * uWave * half_; // plus one fold along the sheet
    across *= cos(a);
    vec3 p = vec3(mix(along, across, uVertical), mix(across, along, uVertical), z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;
const fragment = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(uMap, vUv);
    if (gl_FragColor.a < 0.01) discard;
    #include <colorspace_fragment>
  }`;

// Card art drawn at runtime on a 2D canvas: no image files. Rounded corners are transparent pixels in the texture.
function cardTexture(i) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 586;
  const g = c.getContext('2d'), css = getComputedStyle(html);
  const display = css.getPropertyValue('--font-display').trim(), mono = css.getPropertyValue('--font-mono').trim();
  g.beginPath(); g.roundRect(0, 0, c.width, c.height, 28); g.clip();
  g.fillStyle = FIELDS[i]; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = g.strokeStyle = INKS[i];
  g.font = `500 168px ${display}`; g.textBaseline = 'top'; g.fillText(String(i + 1).padStart(2, '0'), 44, 36);
  g.font = `500 60px ${display}`; g.textBaseline = 'alphabetic'; g.fillText(works[i].title, 48, 540);
  g.font = `22px ${mono}`; g.textAlign = 'right'; g.fillText(works[i].meta.toUpperCase(), 976, 540);
  g.lineWidth = 3; g.beginPath(); g.arc(900, 124, 72 + (i % 3) * 10, 0, Math.PI * 2); g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); } catch { return false; }
  const profile = await detectQualityTier({ sampleMs: 300 });
  state.tier = profile.tier;
  renderer.setClearColor(new THREE.Color(getComputedStyle(html).getPropertyValue('--ground').trim() || '#1a1c1c'));
  const scene = new THREE.Scene();
  // One world unit is one CSS pixel at z = 0, as in gl-dom-tethered-planes.
  const camera = new THREE.PerspectiveCamera(45, 1, 10, 5000);
  const DIST = 1200;
  const [sx, sy] = profile.tier === 'high' ? [48, 24] : profile.tier === 'mid' ? [32, 12] : [24, 8];
  const geometry = new THREE.PlaneGeometry(1, 1, sx, sy);
  const sheets = works.map((_, i) => {
    const texture = cardTexture(i);
    const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, side: THREE.DoubleSide, uniforms: { uMap: { value: texture }, uSize: { value: new THREE.Vector2() }, uVertical: { value: 0 }, uBend: { value: 0 }, uTwist: { value: TWIST }, uWave: { value: WAVE } } });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return { mesh, material, texture, pos: 0 };
  });

  let w = 0, h = 0, card = { w: 0, h: 0, pitch: 1 };
  function resize() {
    w = innerWidth; h = innerHeight;
    applyRendererBudget(renderer, profile, w, h);
    camera.aspect = w / h; camera.fov = 2 * Math.atan(h / 2 / DIST) * (180 / Math.PI); camera.position.z = DIST; camera.updateProjectionMatrix();
    // Landscape: a horizontal belt of cards 43.5 % of the viewport tall. Portrait: a vertical stack of full-width cards.
    state.axis = w > h * 0.9 ? 'x' : 'y';
    const aspect = 1024 / 586;
    if (state.axis === 'x') { card.h = Math.min(h * 0.435, 880); card.w = card.h * aspect; card.pitch = card.w + Math.max(24, w * 0.03); }
    else { card.w = w - 32; card.h = card.w / aspect; card.pitch = card.h + 24; }
    for (const s of sheets) { s.material.uniforms.uSize.value.set(card.w, card.h); s.material.uniforms.uVertical.value = state.axis === 'y' ? 1 : 0; }
  }
  pitch = () => card.pitch;
  resize();
  addEventListener('resize', resize);

  const layout = () => {
    const span = (state.axis === 'x' ? w + card.w : h + card.h); // one full transit: enters at p = 0, centred at .5, gone at 1
    const vNorm = full() ? clamp(state.velocity / VMAX, -1, 1) : 0;
    let maxBend = 0;
    sheets.forEach((s, i) => {
      // The modulo wrap: every card sits within half a loop of the offset, so the first follows the last.
      const d = mod(i - state.offset + N / 2, N) - N / 2;
      s.pos = d * card.pitch;
      const p = clamp((s.pos + span / 2) / span, 0, 1);
      s.mesh.visible = p > 0 && p < 1;
      s.mesh.position.set(state.axis === 'x' ? s.pos : 0, state.axis === 'x' ? 0 : -s.pos, 0);
      const bend = vNorm * Math.sin(Math.PI * p);
      s.material.uniforms.uBend.value = bend;
      if (s.mesh.visible) maxBend = Math.max(maxBend, Math.abs(bend));
    });
    state.bend = maxBend;
  };

  const unsubscribe = ticker.add((dt) => {
    const now = performance.now();
    if (full()) {
      // 1. Release the burst reservoir at 1 − (1 − k)^frames, at most four frames' worth per tick.
      if (state.pending) {
        const r = state.pending * (1 - Math.pow(1 - BURST.k, Math.min(BURST.maxFrames, dt * 60)));
        state.target += r; state.pending -= r;
        if (Math.abs(state.pending) < 1e-4) { state.target += state.pending; state.pending = 0; }
        lastInput = now;
      }
      // 2. Snap to the nearest card once input stops.
      if (!state.pending && now - lastInput > SNAP_AFTER) state.target = Math.round(state.target);
      // 3. The drawn offset follows; its velocity (items / s) drives the bend.
      const prev = state.offset;
      state.offset = damp(state.offset, state.target, K_FOLLOW, dt);
      if (Math.abs(state.offset - state.target) < 1e-4) state.offset = state.target;
      state.velocity = damp(state.velocity, (state.offset - prev) / Math.max(dt, 1e-3), 12, dt);
      if (Math.abs(state.velocity) < 0.01 && state.offset === state.target) state.velocity = 0;
    } else { state.offset = state.target; state.velocity = 0; state.pending = 0; }
    layout();
    state.index = mod(Math.round(state.offset), N);
    if (!isMoving() && state.index !== announced) announce(state.index);
    renderer.render(scene, camera);
  });

  html.classList.add('reel-gl');
  readout.textContent = `webgl · ${profile.tier}`;
  state.gl = true;

  addEventListener('pagehide', () => {
    unsubscribe();
    for (const s of sheets) { s.texture.dispose(); s.material.dispose(); }
    geometry.dispose(); renderer.dispose();
    html.classList.remove('reel-gl'); state.gl = false;
  }, { once: true });

  // Verification hooks: a fresh render and readPixels in the same task, on the default framebuffer.
  const read = (x, y) => { const px = new Uint8Array(4), ctx = renderer.getContext(), r = renderer.getPixelRatio(); ctx.readPixels(Math.round(x * r), Math.round((h - y) * r), 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, px); return [px[0], px[1], px[2]]; };
  window.__glCentre = () => { layout(); renderer.render(scene, camera); return read(w / 2, h / 2); };
  // Force a bend on every visible sheet, read the whole frame back (every 8th pixel), then restore the uniforms.
  window.__glBendGrid = (v) => {
    layout();
    for (const s of sheets) s.material.uniforms.uBend.value = v;
    renderer.render(scene, camera);
    const ctx = renderer.getContext(), W = ctx.drawingBufferWidth, H = ctx.drawingBufferHeight, buf = new Uint8Array(W * H * 4), out = [];
    ctx.readPixels(0, 0, W, H, ctx.RGBA, ctx.UNSIGNED_BYTE, buf);
    for (let y = 0; y < H; y += 8) for (let x = 0; x < W; x += 8) { const k = (y * W + x) * 4; out.push([buf[k], buf[k + 1], buf[k + 2]]); }
    layout();
    return out;
  };
  window.__sheets = () => sheets.map((s) => ({ pos: Math.round(s.pos), visible: s.mesh.visible, bend: Math.round(s.material.uniforms.uBend.value * 1e4) / 1e4 }));
  window.__card = () => ({ w: Math.round(card.w), h: Math.round(card.h), pitch: Math.round(card.pitch) });
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
// Static tier or no WebGL: the page stays a plain list of works; nothing draws, nothing listens.
if (glPossible && motionTier() !== 'static') { if (!(await start())) readout.textContent = 'dom (webgl failed)'; }
else { readout.textContent = glPossible ? 'dom (static)' : 'dom (no webgl)'; buttons.forEach((b) => (b.disabled = true)); }

const r4 = (n) => Math.round(n * 1e4) / 1e4;
awards.addState(() => ({
  motion: motionTier(),
  gl: state.gl,
  tier: state.tier,
  axis: state.axis,
  target: r4(state.target),
  offset: r4(state.offset),
  pending: r4(state.pending),
  velocity: r4(state.velocity),
  bend: r4(state.bend),
  index: mod(Math.round(state.offset), N),
  moving: isMoving(),
  bursts: state.bursts,
  wheelEvents: state.wheelEvents,
  keySteps: state.keySteps,
  field: FIELDS[mod(Math.round(state.offset), N)],
  current: buttons.findIndex((b) => b.getAttribute('aria-current') === 'true'),
  counter: counter.textContent,
  documentScroll: Math.round(scrollY),
}));
awards.ready();
