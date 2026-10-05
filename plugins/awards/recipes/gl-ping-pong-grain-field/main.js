import * as THREE from 'three';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier } from '../_shared/quality-tiers.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const hero = document.querySelector('[data-field]');
const canvas = hero.querySelector('canvas');
const protectEl = document.querySelector('[data-protect]');
const resetBtn = document.querySelector('[data-reset]');
const readout = document.querySelector('[data-gl-readout]');

// This recipe's own values (px are CSS pixels, per-frame values are at 60 fps and scaled by dt).
const P = { radius: 56, maxDelta: 24, keep: 0.88, impulse: 0.5, scatter: 0.35, settle: 0.02, glideKeep: 0.88, glideMs: 1600, idleFrames: 150 };
const BUDGET = { high: 120000, mid: 60000, low: 30000 }; // grains per tier
const FORMATS = [['float', THREE.FloatType], ['half', THREE.HalfFloatType], ['byte', THREE.UnsignedByteType]];
const tier = motionTier();
const state = { gl: false, tier: 'pending', format: null, cols: 0, rows: 0, resets: 0, glideFrames: 0, glideEnd: null, gliding: false, awake: false };
const path = []; // brush segments [x0, y0, x1, y1] in canvas px (y up), kept for verification
let api = null;

// Shared codec. Float targets hold (disp.xy, vel.xy) as is. RGBA8 packs disp.x and disp.y as 16 bits each
// (range ±2048 px, step 1/16 px) and drops velocity: 8 bits per channel cannot integrate small steps.
const codec = /* glsl */ `
  uniform float uByte;
  float dec16(vec2 c) { vec2 b = floor(c * 255.0 + 0.5); return (b.x * 256.0 + b.y - 32768.0) / 32767.0 * 2048.0; }
  vec2 enc16(float v) { float u = floor(clamp(v / 2048.0, -1.0, 1.0) * 32767.0 + 32768.5); float hi = floor(u / 256.0); return vec2(hi, u - hi * 256.0) / 255.0; }
  vec4 decodeState(vec4 c) { return uByte > 0.5 ? vec4(dec16(c.rg), dec16(c.ba), 0.0, 0.0) : c; }
  vec4 encodeState(vec4 s) { return uByte > 0.5 ? vec4(enc16(s.x), enc16(s.y)) : s; }
`;
const quadVert = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const simFrag = /* glsl */ `
  precision highp float;
  ${codec}
  uniform sampler2D uState; uniform sampler2D uMask;
  uniform vec2 uSize; uniform vec2 uFrom; uniform vec2 uTo; uniform vec2 uDelta;
  uniform float uRadius, uActive, uKeep, uImpulse, uScatter, uSettle, uK, uGlide, uZero;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float segDist(vec2 p, vec2 a, vec2 b) { vec2 ab = b - a; float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0); return length(p - a - ab * t); }
  void main() {
    if (uZero > 0.5) { gl_FragColor = encodeState(vec4(0.0)); return; }
    vec4 s = decodeState(texture2D(uState, vUv));
    vec2 disp = s.xy; vec2 vel = s.zw;
    float r = segDist(vUv * uSize + disp, uFrom, uTo) / uRadius;
    float fall = r < 1.0 ? 1.0 - r * r * r : 0.0;
    float protect = 1.0 - smoothstep(0.25, 0.75, texture2D(uMask, vUv).r);  // mask white = protected
    vec2 n = vec2(hash(vUv), hash(vUv + 17.0)) * 2.0 - 1.0;
    vec2 push = (uDelta + n * uScatter * length(uDelta)) * fall * protect * uActive;
    if (uGlide < 1.0) { disp *= pow(uGlide, uK); vel = vec2(0.0); }
    else if (uByte > 0.5) { disp += push; }
    else {
      vel = vel * pow(uKeep, uK) + push * uImpulse;
      if (length(vel) < uSettle) vel = vec2(0.0);
      disp += vel * uK;
    }
    gl_FragColor = encodeState(vec4(disp, vel));
  }`;
// Test-only readout: |displacement| / 64 px in R, the protect factor in G, as bytes for every format.
const inspectFrag = /* glsl */ `
  precision highp float;
  ${codec}
  uniform sampler2D uState; uniform sampler2D uMask; varying vec2 vUv;
  void main() {
    vec4 s = decodeState(texture2D(uState, vUv));
    gl_FragColor = vec4(clamp(length(s.xy) / 64.0, 0.0, 1.0), 1.0 - smoothstep(0.25, 0.75, texture2D(uMask, vUv).r), 0.0, 1.0);
  }`;
const bgFrag = /* glsl */ `uniform sampler2D uTex; varying vec2 vUv; void main() { gl_FragColor = texture2D(uTex, vUv);
#include <colorspace_fragment>
}`;
// One points program, two passes: uHole 1 = under-layer at the home of moved grains, 0 = grains at home + displacement.
const pointVert = /* glsl */ `
  precision highp float;
  ${codec}
  attribute vec2 aRef;
  uniform sampler2D uState; uniform sampler2D uTex; uniform vec2 uSize; uniform float uPoint, uHole;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    vec4 s = decodeState(texture2D(uState, aRef));
    float m = length(s.xy);
    vec2 p = aRef * uSize + s.xy * (1.0 - uHole);
    gl_Position = vec4(p / uSize * 2.0 - 1.0, 0.0, 1.0);
    vColor = texture2D(uTex, aRef).rgb;
    vAlpha = uHole > 0.5 ? smoothstep(2.0, 12.0, m) : step(1.5, m);
    gl_PointSize = vAlpha > 0.0 ? uPoint : 0.0;
  }`;
const pointFrag = /* glsl */ `
  uniform float uRound; varying vec3 vColor; varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (uRound > 0.5 && dot(c, c) > 0.25) discard;
    gl_FragColor = vec4(vColor, vAlpha);
    #include <colorspace_fragment>
  }`;

const token = (name, fallback) => getComputedStyle(html).getPropertyValue(name).trim() || fallback;
function canvasTexture(c, filter = THREE.LinearFilter, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = t.magFilter = filter; t.generateMipmaps = false;
  return t;
}
// Generated surface: a two-tone wash with per-pixel speckle, so every grain has its own colour.
function surfaceImage(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, token('--accent', '#ffc800')); g.addColorStop(1, `color-mix(in oklab, ${token('--accent', '#ffc800')} 45%, ${token('--ground', '#1a1c1c')})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) { const n = (Math.random() - 0.5) * 46; img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n * 0.6; }
  ctx.putImageData(img, 0, 0);
  return c;
}
// Generated under-layer: dark ground with contour rings, revealed where grains have left home.
function underImage(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = token('--ground', '#1a1c1c'); ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = `color-mix(in oklab, ${token('--ink', '#f4f2ee')} 22%, transparent)`; ctx.lineWidth = Math.max(1, w / 900);
  for (let r = w * 0.02; r < Math.hypot(w, h); r += w * 0.018) { ctx.beginPath(); ctx.arc(w * 0.62, h * 0.58, r, 0, Math.PI * 2); ctx.stroke(); }
  return c;
}
// Protect mask at field resolution, drawn from the copy block's rect (+12 px); white = no force.
function maskImage(cols, rows, field) {
  const c = document.createElement('canvas'); c.width = cols; c.height = rows;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cols, rows);
  const r = protectEl.getBoundingClientRect();
  const sx = cols / field.width, sy = rows / field.height, pad = 12;
  ctx.fillStyle = '#fff';
  ctx.fillRect((r.left - field.left - pad) * sx, (r.top - field.top - pad) * sy, (r.width + pad * 2) * sx, (r.height + pad * 2) * sy);
  return c;
}

async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' }); } catch { return 'webgl failed'; }
  const profile = await detectQualityTier({ sampleMs: 300 });
  state.tier = profile.tier;
  renderer.setPixelRatio(profile.dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const gl = renderer.getContext();
  gl.getExtension('EXT_color_buffer_float'); gl.getExtension('EXT_color_buffer_half_float');

  // Storage: the first type whose framebuffer is complete. ?format=half|byte starts lower down the chain.
  const forced = new URLSearchParams(location.search).get('format');
  const rtOpts = (type) => ({ type, format: THREE.RGBAFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false, stencilBuffer: false, generateMipmaps: false });
  let format = null;
  for (const [name, type] of FORMATS.slice(Math.max(0, FORMATS.findIndex(([n]) => n === forced)))) {
    const probe = new THREE.WebGLRenderTarget(1, 1, rtOpts(type));
    renderer.setRenderTarget(probe);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    renderer.setRenderTarget(null); probe.dispose();
    if (ok) { format = { name, type }; break; }
  }
  if (!format) { renderer.dispose(); return 'no renderable state format'; }
  state.format = format.name;
  const byte = format.name === 'byte' ? 1 : 0;

  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const flat = { depthTest: false, depthWrite: false };
  const simMat = new THREE.ShaderMaterial({ ...flat, vertexShader: quadVert, fragmentShader: simFrag, uniforms: {
    uByte: { value: byte }, uState: { value: null }, uMask: { value: null }, uSize: { value: new THREE.Vector2() },
    uFrom: { value: new THREE.Vector2() }, uTo: { value: new THREE.Vector2() }, uDelta: { value: new THREE.Vector2() },
    uRadius: { value: P.radius }, uActive: { value: 0 }, uKeep: { value: P.keep }, uImpulse: { value: P.impulse }, uScatter: { value: P.scatter },
    uSettle: { value: P.settle }, uK: { value: 1 }, uGlide: { value: 1 }, uZero: { value: 0 } } });
  const inspectMat = new THREE.ShaderMaterial({ ...flat, vertexShader: quadVert, fragmentShader: inspectFrag, uniforms: { uByte: { value: byte }, uState: { value: null }, uMask: { value: null } } });
  const bgMat = new THREE.ShaderMaterial({ ...flat, vertexShader: quadVert, fragmentShader: bgFrag, uniforms: { uTex: { value: null } } });
  const pointMat = (hole) => new THREE.ShaderMaterial({ ...flat, transparent: true, vertexShader: pointVert, fragmentShader: pointFrag, uniforms: {
    uByte: { value: byte }, uState: { value: null }, uTex: { value: null }, uSize: { value: new THREE.Vector2() }, uPoint: { value: 1 }, uHole: { value: hole }, uRound: { value: 1 - hole } } });
  const holeMat = pointMat(1), grainMat = pointMat(0);
  const quad = new THREE.Mesh(quadGeo, simMat);
  const simScene = new THREE.Scene(); simScene.add(quad);
  const drawScene = new THREE.Scene();
  const bg = new THREE.Mesh(quadGeo, bgMat);
  const holes = new THREE.Points(new THREE.BufferGeometry(), holeMat);
  const grains = new THREE.Points(new THREE.BufferGeometry(), grainMat);
  bg.renderOrder = 0; holes.renderOrder = 1; grains.renderOrder = 2;
  holes.frustumCulled = grains.frustumCulled = false;
  grains.visible = tier === 'full'; // reduced: the brush reveals in place, no grain flies
  drawScene.add(bg, holes, grains);

  // Field-sized resources, rebuilt on resize (the field resets with them).
  let f = null;
  function build() {
    if (f) { f.read.dispose(); f.write.dispose(); f.inspect.dispose(); f.mask.dispose(); f.surface.dispose(); f.under.dispose(); }
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width)), h = Math.max(1, Math.round(rect.height));
    renderer.setSize(w, h, false);
    const budget = BUDGET[profile.tier] ?? BUDGET.low;
    const cols = Math.max(8, Math.round(Math.sqrt(budget * w / h))), rows = Math.max(8, Math.round(cols * h / w));
    const img = Math.min(1, 1024 / Math.max(w, h));
    f = {
      w, h, cols, rows,
      read: new THREE.WebGLRenderTarget(cols, rows, rtOpts(format.type)),
      write: new THREE.WebGLRenderTarget(cols, rows, rtOpts(format.type)),
      inspect: new THREE.WebGLRenderTarget(cols, rows, rtOpts(THREE.UnsignedByteType)),
      mask: canvasTexture(maskImage(cols, rows, rect), THREE.LinearFilter, false),
      surface: canvasTexture(surfaceImage(Math.round(w * img), Math.round(h * img))),
      under: canvasTexture(underImage(Math.round(w * img), Math.round(h * img))),
    };
    const ref = new Float32Array(cols * rows * 2);
    for (let j = 0, k = 0; j < rows; j++) for (let i = 0; i < cols; i++) { ref[k++] = (i + 0.5) / cols; ref[k++] = (j + 0.5) / rows; }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cols * rows * 3), 3));
    geo.setAttribute('aRef', new THREE.BufferAttribute(ref, 2));
    holes.geometry.dispose(); grains.geometry.dispose();
    holes.geometry = geo; grains.geometry = geo;
    const cell = w / cols * renderer.getPixelRatio();
    holeMat.uniforms.uPoint.value = cell * 1.15; grainMat.uniforms.uPoint.value = cell * 1.3;
    for (const m of [simMat, holeMat, grainMat]) m.uniforms.uSize.value.set(w, h);
    simMat.uniforms.uMask.value = inspectMat.uniforms.uMask.value = f.mask;
    bgMat.uniforms.uTex.value = f.surface; grainMat.uniforms.uTex.value = f.surface; holeMat.uniforms.uTex.value = f.under;
    Object.assign(state, { cols, rows });
    path.length = 0; last = ptr = null;
    clearField();
  }
  function simPass(zero = false) {
    simMat.uniforms.uZero.value = zero ? 1 : 0;
    simMat.uniforms.uState.value = f.read.texture;
    quad.material = simMat;
    renderer.setRenderTarget(f.write); renderer.render(simScene, ortho);
    [f.read, f.write] = [f.write, f.read];
  }
  function clearField() { simPass(true); simPass(true); }
  function draw() {
    for (const m of [holeMat, grainMat]) m.uniforms.uState.value = f.read.texture;
    renderer.setRenderTarget(null); renderer.render(drawScene, ortho);
  }

  // Pointer → capsule brush from the last applied position to the current one.
  let ptr = null, last = null;
  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = r.bottom - e.clientY;
    if (x < 0 || y < 0 || x > r.width || y > r.height) { ptr = last = null; return; }
    ptr = { x, y }; if (!last) last = { x, y };
    wake();
  }
  if (tier !== 'static') {
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointercancel', () => (ptr = last = null));
  }

  let quiet = 0, glideStart = 0, subscribed = null;
  function frame(dt) {
    const k = Math.min(3, dt * 60);
    simMat.uniforms.uK.value = k;
    simMat.uniforms.uActive.value = 0;
    if (state.gliding) {
      state.glideFrames++;
      simMat.uniforms.uGlide.value = P.glideKeep;
      if (performance.now() - glideStart >= P.glideMs) {
        state.glideEnd = stats().maxAll;
        simMat.uniforms.uGlide.value = 1;
        clearField(); state.gliding = false; quiet = 0;
      }
    } else if (ptr && last && (ptr.x !== last.x || ptr.y !== last.y)) {
      let dx = ptr.x - last.x, dy = ptr.y - last.y;
      const len = Math.hypot(dx, dy);
      if (len > P.maxDelta) { dx *= P.maxDelta / len; dy *= P.maxDelta / len; }
      simMat.uniforms.uFrom.value.set(last.x, last.y); simMat.uniforms.uTo.value.set(ptr.x, ptr.y);
      simMat.uniforms.uDelta.value.set(dx, dy); simMat.uniforms.uActive.value = 1;
      path.push([last.x, last.y, ptr.x, ptr.y]); if (path.length > 400) path.shift();
      last = { ...ptr }; quiet = 0;
    }
    simPass();
    draw();
    // Idle gate: velocities settle well inside P.idleFrames; then the loop leaves the ticker until the next input.
    if (!state.gliding && ++quiet > P.idleFrames) { subscribed?.(); subscribed = null; state.awake = false; }
  }
  function wake() { quiet = 0; if (!subscribed && tier !== 'static') { subscribed = ticker.add(frame); state.awake = true; } }

  resetBtn.addEventListener('click', () => { state.resets++; state.gliding = true; state.glideEnd = null; glideStart = performance.now(); wake(); });
  let resizeT = 0;
  addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { build(); draw(); }, 200); });

  // Reads the whole field back through the byte inspect pass and summarises it (px, CSS pixels).
  function stats() {
    inspectMat.uniforms.uState.value = f.read.texture;
    quad.material = inspectMat;
    renderer.setRenderTarget(f.inspect); renderer.render(simScene, ortho);
    const px = new Uint8Array(f.cols * f.rows * 4);
    renderer.readRenderTargetPixels(f.inspect, 0, 0, f.cols, f.rows, px);
    renderer.setRenderTarget(null);
    const near = P.radius * 0.4;
    let maxAll = 0, maxInside = 0, pathFree = 0, pathMoved = 0, pathProtected = 0;
    for (let j = 0, o = 0; j < f.rows; j++) for (let i = 0; i < f.cols; i++, o += 4) {
      const d = px[o] / 255 * 64, prot = px[o + 1];
      if (d > maxAll) maxAll = d;
      if (prot === 0 && d > maxInside) maxInside = d;
      if (!path.length) continue;
      const hx = (i + 0.5) / f.cols * f.w, hy = (j + 0.5) / f.rows * f.h;
      let onPath = false;
      for (const [ax, ay, bx, by] of path) {
        const abx = bx - ax, aby = by - ay, l2 = abx * abx + aby * aby || 1e-6;
        const t = Math.max(0, Math.min(1, ((hx - ax) * abx + (hy - ay) * aby) / l2));
        if (Math.hypot(hx - ax - abx * t, hy - ay - aby * t) < near) { onPath = true; break; }
      }
      if (!onPath) continue;
      if (prot === 0) pathProtected++;
      else if (prot === 255) { pathFree++; if (d > 3) pathMoved++; }
    }
    const r2 = (v) => Math.round(v * 100) / 100;
    return { maxAll: r2(maxAll), maxInside: r2(maxInside), pathFree, pathMoved, pathProtected };
  }

  html.classList.add('gl-active'); // before build(): the canvas has no box while hidden
  build();
  draw();
  state.gl = true;
  api = { stats, grainsDrawn: () => grains.visible };
  addEventListener('pagehide', () => {
    subscribed?.();
    for (const t of [f.read, f.write, f.inspect, f.mask, f.surface, f.under]) t.dispose();
    for (const m of [simMat, inspectMat, bgMat, holeMat, grainMat]) m.dispose();
    quadGeo.dispose(); grains.geometry.dispose(); renderer.dispose();
    html.classList.remove('gl-active'); state.gl = false;
  }, { once: true });
  return `webgl · ${profile.tier} · ${format.name} · ${state.cols}×${state.rows}`;
}

const glPossible = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
await document.fonts.ready;
readout.textContent = glPossible ? await start() : 'dom (no webgl2)';
if (tier !== 'full' && state.gl) readout.textContent += ` · ${tier}`;

awards.addState(() => ({
  motion: tier,
  ...state,
  segments: path.length,
  grainsDrawn: api?.grainsDrawn() ?? false,
  ...(api ? api.stats() : {}),
  canvasAriaHidden: canvas.getAttribute('aria-hidden') === 'true',
}));
awards.ready();
