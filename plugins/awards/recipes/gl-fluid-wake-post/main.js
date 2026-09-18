import * as THREE from 'three';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier } from '../_shared/quality-tiers.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const canvas = document.querySelector('[data-gl]');
const hero = document.querySelector('.hero');
const title = document.querySelector('[data-hero-title]');
const readout = document.querySelector('[data-gl-readout]');
const state = { gl: false, tier: 'pending', halfFloat: false, splats: 0, energy: 0, pointer: null, disposed: false };

const SIM = 128;
const quadVert = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
// Advection + dissipation + one Gaussian splat, in a single pass. No pressure solve: a wake, not water.
const simFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uVelocity; uniform vec2 uPoint; uniform vec2 uForce; uniform float uRadius; uniform float uDissipation; uniform float uAspect; uniform float uByteMode;
  varying vec2 vUv;
  vec2 decode(vec4 c) { return uByteMode > 0.5 ? (c.xy - 0.5) * 2.0 : c.xy; }
  vec4 encode(vec2 v) { return uByteMode > 0.5 ? vec4(v * 0.5 + 0.5, 0.0, 1.0) : vec4(v, 0.0, 1.0); }
  void main() {
    vec2 vel = decode(texture2D(uVelocity, vUv));
    vec2 back = vUv - vel * 0.02;                      // advect: look upstream
    vel = decode(texture2D(uVelocity, back)) * uDissipation;
    vec2 d = vUv - uPoint; d.x *= uAspect;
    vel += uForce * exp(-dot(d, d) / uRadius);        // Gaussian splat
    if (uByteMode > 0.5 && length(vel) < 0.012) vel = vec2(0.0); // dead zone: 8-bit storage cannot hold true zero
    gl_FragColor = encode(vel);
  }`;
// The unifier: distort the rendered hero by the velocity, fringe R and B along it.
const postFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uScene; uniform sampler2D uVelocity; uniform float uDistortion; uniform float uChroma; uniform float uByteMode;
  varying vec2 vUv;
  vec2 decode(vec4 c) { return uByteMode > 0.5 ? (c.xy - 0.5) * 2.0 : c.xy; }
  void main() {
    vec2 vel = decode(texture2D(uVelocity, vUv));
    vec2 uv = vUv + vel * uDistortion;
    float r = texture2D(uScene, uv + vel * uChroma).r;
    float g = texture2D(uScene, uv).g;
    float b = texture2D(uScene, uv - vel * uChroma).b;
    gl_FragColor = vec4(r, g, b, 1.0);
  }`;
// Energy probe: average |velocity| over a coarse grid into one byte, so tests can read the field without float readback.
const energyFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uVelocity; uniform float uByteMode;
  vec2 decode(vec4 c) { return uByteMode > 0.5 ? (c.xy - 0.5) * 2.0 : c.xy; }
  void main() {
    float sum = 0.0;
    for (int y = 0; y < 8; y++) for (int x = 0; x < 8; x++) sum += length(decode(texture2D(uVelocity, (vec2(float(x), float(y)) + 0.5) / 8.0)));
    gl_FragColor = vec4(vec3(min(1.0, sum / 64.0 * 4.0)), 1.0);
  }`;

function titleTexture(w, h) {
  // Draw the DOM headline into a canvas with the same font, so the GL hero is the DOM hero.
  const c = document.createElement('canvas');
  const scale = Math.min(1, 2048 / Math.max(w, h));
  c.width = Math.round(w * scale); c.height = Math.round(h * scale);
  const ctx = c.getContext('2d');
  const cs = getComputedStyle(html);
  ctx.fillStyle = cs.getPropertyValue('--ground').trim() || '#1a1c1c';
  ctx.fillRect(0, 0, c.width, c.height);
  const accent = cs.getPropertyValue('--accent').trim() || '#ffc800';
  const grad = ctx.createRadialGradient(c.width * 0.75, c.height * 0.35, 0, c.width * 0.75, c.height * 0.35, c.width * 0.55);
  grad.addColorStop(0, accent); grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, c.width, c.height);
  const r = title.getBoundingClientRect();
  const hr = hero.getBoundingClientRect();
  const ts = getComputedStyle(title);
  ctx.font = `${ts.fontWeight} ${parseFloat(ts.fontSize) * scale}px ${ts.fontFamily}`;
  ctx.fillStyle = cs.getPropertyValue('--ink').trim() || '#f4f2ee';
  ctx.textBaseline = 'top';
  const lh = parseFloat(ts.lineHeight) * scale;
  title.innerText.split('\n').forEach((line, i) => ctx.fillText(line, (r.left - hr.left) * scale, (r.top - hr.top) * scale + i * lh));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
  return t;
}

async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' }); } catch { return false; }
  const profile = await detectQualityTier({ sampleMs: 300 });
  state.tier = profile.tier;
  renderer.setPixelRatio(profile.dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const gl = renderer.getContext();
  const halfFloat = !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
  state.halfFloat = halfFloat;
  const rtOpts = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false, type: halfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType };
  let read = new THREE.WebGLRenderTarget(SIM, SIM, rtOpts);
  let write = new THREE.WebGLRenderTarget(SIM, SIM, rtOpts);
  const energyRT = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
  const byteMode = halfFloat ? 0 : 1;

  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const simMat = new THREE.ShaderMaterial({ vertexShader: quadVert, fragmentShader: simFrag, depthTest: false, depthWrite: false, uniforms: { uVelocity: { value: null }, uPoint: { value: new THREE.Vector2(-10, -10) }, uForce: { value: new THREE.Vector2() }, uRadius: { value: 0.0015 }, uDissipation: { value: 0.96 }, uAspect: { value: 1 }, uByteMode: { value: byteMode } } });
  const postMat = new THREE.ShaderMaterial({ vertexShader: quadVert, fragmentShader: postFrag + '\n', depthTest: false, depthWrite: false, uniforms: { uScene: { value: null }, uVelocity: { value: null }, uDistortion: { value: 0.09 }, uChroma: { value: 0.02 }, uByteMode: { value: byteMode } } });
  const energyMat = new THREE.ShaderMaterial({ vertexShader: quadVert, fragmentShader: energyFrag, depthTest: false, depthWrite: false, uniforms: { uVelocity: { value: null }, uByteMode: { value: byteMode } } });
  const quad = new THREE.Mesh(quadGeo, simMat);
  const quadScene = new THREE.Scene(); quadScene.add(quad);
  const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // The "scene" is the hero drawn into a texture; a real site renders its 3D scene into sceneRT instead.
  let w = 0, h = 0, sceneRT, sceneTex;
  function resize() {
    const r = hero.getBoundingClientRect();
    w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false);
    simMat.uniforms.uAspect.value = w / h;
    if (sceneTex) sceneTex.dispose();
    sceneTex = titleTexture(w, h);
    postMat.uniforms.uScene.value = sceneTex;
  }
  resize();
  addEventListener('resize', resize);

  // Pointer → splat. Force is the delta in UV units × 10; the variance widens while moving.
  let last = null;
  const pending = { has: false, x: 0, y: 0, fx: 0, fy: 0 };
  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
    if (last) { pending.fx = (x - last.x) * 10; pending.fy = (y - last.y) * 10; pending.has = true; pending.x = x; pending.y = y; }
    last = { x, y };
  }
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerleave', () => (last = null));

  const unsubscribe = ticker.add(() => {
    // 1. Simulation step (ping-pong).
    simMat.uniforms.uVelocity.value = read.texture;
    if (pending.has) {
      simMat.uniforms.uPoint.value.set(pending.x, pending.y);
      simMat.uniforms.uForce.value.set(Math.max(-1, Math.min(1, pending.fx)), Math.max(-1, Math.min(1, pending.fy)));
      simMat.uniforms.uRadius.value = 0.002;
      pending.has = false; state.splats++;
    } else {
      simMat.uniforms.uForce.value.set(0, 0);
      simMat.uniforms.uRadius.value = 0.0015;
    }
    quad.material = simMat;
    renderer.setRenderTarget(write); renderer.render(quadScene, ortho);
    [read, write] = [write, read];
    // 2. Composite to screen.
    postMat.uniforms.uVelocity.value = read.texture;
    quad.material = postMat;
    renderer.setRenderTarget(null); renderer.render(quadScene, ortho);
  });

  window.__fluidEnergy = () => {
    energyMat.uniforms.uVelocity.value = read.texture;
    quad.material = energyMat;
    renderer.setRenderTarget(energyRT); renderer.render(quadScene, ortho);
    const px = new Uint8Array(4);
    renderer.readRenderTargetPixels(energyRT, 0, 0, 1, 1, px);
    renderer.setRenderTarget(null);
    return px[0] / 255;
  };

  html.classList.add('gl-active');
  readout.textContent = `webgl · ${profile.tier} · ${halfFloat ? 'half-float' : 'bytes'}`;
  state.gl = true;
  function dispose() {
    unsubscribe();
    read.dispose(); write.dispose(); energyRT.dispose(); quadGeo.dispose(); simMat.dispose(); postMat.dispose(); energyMat.dispose(); sceneTex?.dispose();
    renderer.dispose();
    html.classList.remove('gl-active');
    state.gl = false; state.disposed = true;
  }
  addEventListener('pagehide', dispose, { once: true });
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
await document.fonts.ready;
if (glPossible && motionTier() === 'full') {
  const ok = await start();
  if (!ok) readout.textContent = 'dom (webgl failed)';
} else {
  readout.textContent = motionTier() !== 'full' ? 'dom (reduced motion)' : 'dom (no webgl)';
}

awards.addState(() => ({
  motion: motionTier(),
  gl: state.gl,
  tier: state.tier,
  halfFloat: state.halfFloat,
  splats: state.splats,
  energy: state.gl ? Math.round(window.__fluidEnergy() * 1000) / 1000 : 0,
  titleVisibility: getComputedStyle(title).visibility,
  titleInDom: !!document.querySelector('[data-hero-title]')?.textContent,
  canvasAriaHidden: canvas.getAttribute('aria-hidden') === 'true',
}));
awards.ready();
