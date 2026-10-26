import * as THREE from 'three';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier } from '../_shared/quality-tiers.js';
import { ticker } from '../_shared/raf.js';

// A paper hero with a world under it. The pointer leaves a wake of short-lived points, painted as radial gradients
// into a small 2D canvas; the GL composite shows the world only where that mask is open. The world renders into its
// own target at a reduced scale and every second frame; with no wake, nothing renders at all.

syncMotionTierAttribute();
const html = document.documentElement;
const hero = document.querySelector('[data-hero]');
const canvas = document.querySelector('[data-gl]');
const readout = document.querySelector('[data-gl-readout]');
const tier = motionTier();
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const state = { gl: false, fine, points: 0, added: 0, worldFrames: 0, compositeFrames: 0, cleared: true, motion: tier };

// This recipe's own values.
const WAKE = { max: 140, life: 750, radiusK: 0.095, speedRef: 1600, minStep: 6, maskW: 320, maskH: 200 };
const WORLD_SCALE = 0.62;   // the world's render scale, separate from the canvas's own pixel ratio

const vert = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const worldFrag = /* glsl */ `
  precision highp float;
  uniform float uTime; uniform float uAspect; uniform vec3 uDeep; uniform vec3 uHigh; uniform vec3 uRibbonA; uniform vec3 uRibbonB;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.02 + 11.0; a *= 0.5; } return v; }
  void main() {
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    vec3 col = mix(uDeep, uHigh, smoothstep(0.0, 1.0, vUv.y));
    // A ribbon of light whose centre line wanders with a domain-warped noise.
    float warp = fbm(p * 1.6 + vec2(uTime * 0.05, -uTime * 0.02));
    float band = exp(-pow((vUv.y - 0.55 - (warp - 0.5) * 0.5) * 6.0, 2.0));
    col += mix(uRibbonA, uRibbonB, fbm(p * 3.0 - uTime * 0.04)) * band * 0.9;
    // Stars on a grid of cells, each twinkling on its own phase.
    vec2 cell = floor(p * 90.0); vec2 f = fract(p * 90.0) - 0.5;
    float h = hash(cell);
    float star = step(0.985, h) * smoothstep(0.18, 0.0, length(f)) * (0.6 + 0.4 * sin(uTime * 2.0 + h * 40.0));
    col += vec3(star);
    gl_FragColor = vec4(col, 1.0);
  }`;
const compositeFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uWorld; uniform sampler2D uMask; varying vec2 vUv;
  void main() {
    float m = smoothstep(0.05, 0.6, texture2D(uMask, vUv).r);
    gl_FragColor = vec4(texture2D(uWorld, vUv).rgb, 1.0);
    #include <colorspace_fragment>
    gl_FragColor = vec4(gl_FragColor.rgb * m, m); // premultiplied: the paper shows wherever the mask is shut
  }`;

async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, premultipliedAlpha: true }); } catch { return false; }
  const profile = await detectQualityTier({ sampleMs: 250 });
  renderer.setPixelRatio(Math.min(profile.dpr, 1.5));
  renderer.setClearColor(0x000000, 0);

  // The wake mask: a small 2D canvas, cleared and repainted from the live points each frame.
  const mask = document.createElement('canvas');
  mask.width = WAKE.maskW; mask.height = WAKE.maskH;
  const mctx = mask.getContext('2d');
  const maskTex = new THREE.CanvasTexture(mask);
  maskTex.minFilter = THREE.LinearFilter; maskTex.generateMipmaps = false;

  const worldRT = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, generateMipmaps: false });
  const worldMat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: worldFrag, depthTest: false, depthWrite: false, uniforms: {
    uTime: { value: 0 }, uAspect: { value: 1 },
    uDeep: { value: new THREE.Color('#070a1f') }, uHigh: { value: new THREE.Color('#231a4d') }, uRibbonA: { value: new THREE.Color('#2fd1c5') }, uRibbonB: { value: new THREE.Color('#9b6bff') } } });
  const compMat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: compositeFrag, depthTest: false, depthWrite: false, transparent: true, uniforms: { uWorld: { value: worldRT.texture }, uMask: { value: maskTex } } });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), worldMat); quad.frustumCulled = false;
  const scene = new THREE.Scene(); scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let w = 1, h = 1;
  function resize() {
    const r = hero.getBoundingClientRect();
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    const s = renderer.getPixelRatio() * WORLD_SCALE;
    worldRT.setSize(Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s)));
    worldMat.uniforms.uAspect.value = w / h;
  }
  resize();
  addEventListener('resize', resize);

  // Wake points in hero-local CSS px: x, y, birth time, radius.
  const pts = [];
  let last = null;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = hero.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (x < 0 || y < 0 || x > r.width || y > r.height) { last = null; return; }
    const now = performance.now();
    if (last && Math.hypot(x - last.x, y - last.y) < WAKE.minStep) return;
    const speed = last ? Math.hypot(x - last.x, y - last.y) / Math.max(0.008, (now - last.t) / 1000) : 0;
    const radius = WAKE.radiusK * Math.min(w, h) * (0.6 + 0.6 * Math.min(1.5, speed / WAKE.speedRef));
    pts.push({ x, y, t: now, r: radius });
    if (pts.length > WAKE.max) pts.shift();
    last = { x, y, t: now };
    state.added++;
  }, { passive: true });

  let time = 0, frame = 0;
  function paintMask(now) {
    while (pts.length && now - pts[0].t > WAKE.life) pts.shift();
    state.points = pts.length;
    mctx.clearRect(0, 0, WAKE.maskW, WAKE.maskH);
    const sx = WAKE.maskW / w, sy = WAKE.maskH / h;
    for (const p of pts) {
      const a = 1 - (now - p.t) / WAKE.life;
      const x = p.x * sx, y = p.y * sy, r = p.r * sx;
      const g = mctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,255,255,${(a * a).toFixed(3)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      mctx.fillStyle = g;
      mctx.beginPath(); mctx.ellipse(x, y, r, r * (sy / sx), 0, 0, Math.PI * 2); mctx.fill();
    }
    maskTex.needsUpdate = true;
  }
  function render(now, force = false) {
    paintMask(now);
    if (!pts.length) {
      if (!state.cleared) { renderer.setRenderTarget(null); renderer.clear(); state.cleared = true; }
      return;
    }
    // The world: reduced scale, every second frame (or when forced by a test).
    if (force || frame % 2 === 0 || state.worldFrames === 0) {
      quad.material = worldMat; renderer.setRenderTarget(worldRT); renderer.render(scene, cam); state.worldFrames++;
    }
    quad.material = compMat; renderer.setRenderTarget(null); renderer.render(scene, cam);
    state.compositeFrames++; state.cleared = false;
  }
  const unsubscribe = ticker.add((dt) => { time += dt; frame++; worldMat.uniforms.uTime.value = time; render(performance.now()); });

  // Test hook: render now and read the canvas's alpha at a hero-local CSS point, in the same task.
  window.__wake = {
    alphaAt(x, y) {
      render(performance.now(), true);
      const gl = renderer.getContext(), pr = renderer.getPixelRatio(), out = new Uint8Array(4);
      gl.readPixels(Math.round(x * pr), Math.round((h - y) * pr), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, out);
      return out[3];
    },
  };

  html.classList.add('gl-active');
  readout.textContent = `webgl · ${profile.tier} · world ×${WORLD_SCALE}`;
  state.gl = true;
  addEventListener('pagehide', () => {
    unsubscribe();
    for (const o of [worldRT, maskTex, worldMat, compMat, quad.geometry]) o.dispose();
    renderer.dispose(); html.classList.remove('gl-active'); state.gl = false;
  }, { once: true });
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (!fine) readout.textContent = 'paper (touch: no wake)';
else if (tier !== 'full') readout.textContent = 'paper (reduced motion)';
else if (!glPossible) readout.textContent = 'paper (no webgl)';
else if (!(await start())) readout.textContent = 'paper (webgl failed)';

awards.addState(() => ({ ...state, canvasAriaHidden: canvas.getAttribute('aria-hidden') === 'true', canvasShown: getComputedStyle(canvas).display !== 'none' }));
awards.ready();
