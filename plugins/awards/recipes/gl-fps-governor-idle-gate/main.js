import * as THREE from 'three';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier } from '../_shared/quality-tiers.js';
import { ticker, damp, clamp } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const $ = (s) => document.querySelector(s);
const canvas = $('[data-gl]'), pulseBtn = $('[data-pulse]'), simBtn = $('[data-simulate]');
const readout = Object.fromEntries([...document.querySelectorAll('[data-r]')].map((el) => [el.dataset.r, el]));

// Parameters.
const SAMPLE_MS = 500;   // governor window
const FPS_DOWN = 45;     // below: one step down
const FPS_UP = 57;       // above: one step up; between the two it holds (hysteresis)
const STEP = 0.25;       // pixel-ratio step
const MIN_DPR = 0.5;     // floor = max(.5, cap / 2)
const IDLE_MS = 1500;    // no input for this long and nothing busy: stop drawing
const PULSE_S = 3;       // demo transition, in ticker seconds
const SIM_SLOW = 40;     // the "Simulate 25 fps" button: 40 ms synthetic frames

const state = { gl: false, tier: 'pending', dpr: 0, cap: 0, floor: 0, fps: null, windows: 0, renders: 0, idle: false, looping: false, busy: false, simulate: null, steps: [], staticFrames: 0, time: 0 };
const r3 = (n) => Math.round(n * 1000) / 1000;
let lastInput = performance.now(), lastActive = lastInput; // real input · input or busy work (the gate reads this)

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
// Synthetic field: contour lines of a few summed sines, a lens that follows the pointer, a pulse ring for the transition.
const fragment = /* glsl */ `
  uniform vec2 uRes;
  uniform float uTime, uScroll, uPulse, uReduced;
  uniform vec2 uLens;
  uniform vec3 uGround, uInk, uAccent;
  varying vec2 vUv;
  void main() {
    vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
    vec2 c = (vUv - 0.5) * aspect;
    vec2 p = c * 3.0 + vec2(0.0, uScroll);
    float f = sin(p.x * 1.3 + uTime * 0.2) * sin(p.y * 1.7 - uTime * 0.15)
            + 0.5 * sin((p.x + p.y) * 2.1 + uTime * 0.3)
            + 0.35 * sin(length(p - vec2(1.0, -0.5)) * 3.0 - uTime * 0.25);
    float g = f * 4.0;
    float d = abs(fract(g) - 0.5);
    // Line width in drawing-buffer pixels: a lower pixel ratio really draws coarser lines.
    float line = 1.0 - smoothstep(0.0, 1.2, (0.5 - d) / max(fwidth(g), 1e-5));
    float lens = smoothstep(0.55, 0.0, distance(c, (uLens - 0.5) * aspect));
    float r = length(c);
    float ring = uReduced > 0.5 ? sin(3.14159 * uPulse) * 0.35
                                : smoothstep(0.08, 0.0, abs(r - uPulse * 1.2)) * (1.0 - uPulse);
    vec3 col = mix(uGround, uInk, line * (0.16 + 0.5 * lens));
    col = mix(col, uAccent, clamp(line * lens * 0.8 + ring * step(0.001, uPulse), 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }`;

async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }); } catch { return false; }
  // The governor starts from the one-time probe: its DPR cap and pixel budget are the ceiling.
  const profile = await detectQualityTier({ sampleMs: 300 });
  state.tier = profile.tier;
  const css = getComputedStyle(html), token = (n, f) => new THREE.Color(css.getPropertyValue(n).trim() || f);
  const uniforms = {
    uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uScroll: { value: 0 }, uPulse: { value: 0 }, uReduced: { value: 0 },
    uLens: { value: new THREE.Vector2(0.5, 0.5) },
    uGround: { value: token('--ground', '#1a1c1c') }, uInk: { value: token('--ink', '#f4f2ee') }, uAccent: { value: token('--accent', '#ffc800') },
  };
  const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, depthTest: false });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(geometry, material));
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let w = 0, h = 0;
  const setDpr = (v) => { state.dpr = v; renderer.setPixelRatio(v); renderer.setSize(w, h, false); };
  function resize() {
    w = innerWidth; h = innerHeight;
    // Ceiling: the probe's DPR and its absolute pixel budget. Floor: half of that, never under .5.
    state.cap = Math.min(profile.dpr, Math.floor(Math.sqrt(profile.maxPixels / (w * h)) * 1000) / 1000);
    state.floor = Math.max(MIN_DPR, state.cap / 2);
    setDpr(clamp(state.dpr || state.cap, state.floor, state.cap));
    uniforms.uRes.value.set(w, h);
    if (motionTier() === 'static') draw(); else wake();
  }

  // Governor: frames add their time to a half-second window; the window's average fps steps the pixel ratio.
  let acc = 0, frames = 0, fresh = true;
  function govern(ms) {
    acc += state.simulate ?? ms; frames++;
    if (acc < SAMPLE_MS) return;
    const fps = (frames * 1000) / acc;
    acc = frames = 0;
    state.fps = Math.round(fps); state.windows++;
    const next = clamp(fps < FPS_DOWN ? state.dpr - STEP : fps > FPS_UP ? state.dpr + STEP : state.dpr, state.floor, state.cap);
    if (next !== state.dpr) { state.steps.push({ from: r3(state.dpr), to: r3(next), fps: state.fps }); setDpr(next); }
    paint();
  }

  // Idle gate: the loop is on the shared ticker only while something changes. The ticker itself stops on hidden tabs.
  let unsubscribe = null;
  const pointer = { x: 0.5, y: 0.5 }, lens = { x: 0.5, y: 0.5 }, pulse = { t: 0, on: false };
  function wake() {
    lastActive = performance.now();
    if (!state.gl || state.looping || motionTier() === 'static') return;
    state.looping = true; state.idle = false; fresh = true; acc = frames = 0;
    unsubscribe = ticker.add(tick);
    paint();
  }
  function sleep() {
    unsubscribe?.(); unsubscribe = null;
    state.looping = false; state.idle = true; state.busy = false;
    paint();
  }
  function draw() { renderer.render(scene, camera); state.renders++; }
  function tick(dt) {
    const now = performance.now(), tier = motionTier();
    if (fresh) fresh = false; else govern(dt * 1000); // the first frame after a wake has no real frame time
    if (tier === 'full') {
      state.time += dt;
      lens.x = damp(lens.x, pointer.x, 8, dt); lens.y = damp(lens.y, pointer.y, 8, dt);
    } else { lens.x = lens.y = 0.5; }
    if (pulse.on) { pulse.t = Math.min(1, pulse.t + dt / PULSE_S); if (pulse.t === 1) { pulse.on = false; pulse.t = 0; } }
    uniforms.uTime.value = state.time;
    uniforms.uScroll.value = tier === 'full' ? scrollY / h : 0;
    uniforms.uLens.value.set(lens.x, lens.y);
    uniforms.uPulse.value = pulse.t;
    draw();
    // Busy work keeps the gate open: a running transition, or a lens still easing toward the pointer.
    state.busy = pulse.on || Math.abs(lens.x - pointer.x) + Math.abs(lens.y - pointer.y) > 1e-3 && tier === 'full';
    if (state.busy) lastActive = now;
    else if (now - lastActive > IDLE_MS) sleep();
  }

  const onInput = (e) => {
    if (e.type === 'pointermove') { pointer.x = e.clientX / w; pointer.y = 1 - e.clientY / h; }
    lastInput = performance.now();
    wake();
  };
  for (const type of ['pointermove', 'pointerdown', 'wheel', 'scroll', 'keydown', 'touchstart']) addEventListener(type, onInput, { passive: true });
  addEventListener('resize', resize);
  pulseBtn.addEventListener('click', () => { pulse.on = true; pulse.t = 0; wake(); });
  simBtn.addEventListener('click', () => {
    const on = simBtn.getAttribute('aria-pressed') !== 'true';
    simBtn.setAttribute('aria-pressed', String(on));
    simulate(on ? SIM_SLOW : null);
  });

  // Synthetic frame times replace the measured ones in the governor only (the animation keeps real time).
  // Restarting puts the pixel ratio back at the probe's ceiling and clears the step log, so a run is deterministic.
  function simulate(ms, { restart = true } = {}) {
    state.simulate = ms == null ? null : Number(ms);
    acc = frames = 0; state.fps = null; state.windows = 0;
    if (restart) { state.steps = []; setDpr(state.cap); }
    wake();
  }

  // Motion tiers. Full: drift, lens, ring. Reduced: still field, the transition is a tint. Static: one frame, no loop.
  function applyTier() {
    const tier = motionTier();
    uniforms.uReduced.value = tier === 'full' ? 0 : 1;
    if (tier !== 'full') { state.time = 0; uniforms.uTime.value = 0; uniforms.uScroll.value = 0; uniforms.uLens.value.set(0.5, 0.5); }
    pulseBtn.disabled = tier === 'static';
    if (tier === 'static') { sleep(); pulse.on = false; uniforms.uPulse.value = 0; state.staticFrames = 0; draw(); state.staticFrames++; paint(); }
    else wake();
  }
  onMotionTierChange(applyTier);
  new MutationObserver(applyTier).observe(html, { attributes: true, attributeFilter: ['data-motion'] });

  state.gl = true;
  resize();
  applyTier();

  addEventListener('pagehide', () => { sleep(); material.dispose(); geometry.dispose(); renderer.dispose(); state.gl = false; }, { once: true });

  // Verification hooks. Renders made here are not counted: they read the canvas, they are not the loop.
  window.__governor = {
    simulate,
    readback() {
      const gl = renderer.getContext();
      renderer.render(scene, camera);
      const W = gl.drawingBufferWidth, H = gl.drawingBufferHeight, buf = new Uint8Array(W * H * 4);
      gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      const hex = uniforms.uGround.value.getHex(), ground = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
      let inked = 0, n = 0;
      for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) { const k = (y * W + x) * 4; n++; if (Math.abs(buf[k] - ground[0]) + Math.abs(buf[k + 1] - ground[1]) + Math.abs(buf[k + 2] - ground[2]) > 24) inked++; }
      return { dpr: state.dpr, pixelRatio: renderer.getPixelRatio(), buffer: [W, H], canvasAttr: [canvas.width, canvas.height], css: [w, h], inked: r3(inked / n) };
    },
  };
  return true;
}

function paint() {
  readout.tier.textContent = state.tier;
  readout.dpr.textContent = state.gl ? `${state.dpr.toFixed(2)} (${state.floor.toFixed(2)}–${state.cap.toFixed(2)})` : '—';
  readout.fps.textContent = state.fps == null ? '…' : `${state.fps}${state.simulate ? ' (simulated)' : ''}`;
  readout.renders.textContent = String(state.renders);
  readout.loop.textContent = !state.gl ? 'no webgl' : motionTier() === 'static' ? 'static · one frame' : state.looping ? (state.busy ? 'drawing · busy' : 'drawing') : 'asleep';
}

const glPossible = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
if (!glPossible || !(await start())) { canvas.hidden = true; pulseBtn.disabled = simBtn.disabled = true; }
paint();

awards.addState(() => ({
  motion: motionTier(),
  gl: state.gl,
  tier: state.tier,
  dpr: r3(state.dpr),
  cap: r3(state.cap),
  floor: r3(state.floor),
  fps: state.fps,
  windows: state.windows,
  simulate: state.simulate,
  steps: state.steps.slice(),
  renders: state.renders,
  staticFrames: state.staticFrames,
  idle: state.idle,
  looping: state.looping,
  busy: state.busy,
  sinceInput: Math.round(performance.now() - lastInput),
  time: r3(state.time),
}));
awards.ready();
