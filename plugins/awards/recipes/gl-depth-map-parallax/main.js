import * as THREE from 'three';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier, applyRendererBudget } from '../_shared/quality-tiers.js';
import { ticker, damp } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const canvas = document.querySelector('[data-gl]');
const frame = document.querySelector('.frame');
const colorImg = document.querySelector('[data-color]');
const depthImg = document.querySelector('[data-depth]');
const readout = document.querySelector('[data-gl-readout]');
const state = { gl: false, tier: 'pending', offset: [0, 0], maxOffset: 0 };

const frag = /* glsl */ `
  precision highp float;
  uniform sampler2D uColor; uniform sampler2D uDepth; uniform vec2 uOffset; uniform float uStrength;
  varying vec2 vUv;
  void main() {
    // Near texels (bright in the depth map) shift most; the offset is the pointer's distance from centre.
    float depth = texture2D(uDepth, vUv).r;
    vec2 uv = vUv + uOffset * uStrength * (depth - 0.5);
    gl_FragColor = texture2D(uColor, uv);
    #include <colorspace_fragment>
  }`;
const vert = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

function tex(img) {
  const c = document.createElement('canvas'); c.width = 1200; c.height = 800;
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; return t;
}

async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false }); } catch { return false; }
  const profile = await detectQualityTier({ sampleMs: 300 });
  state.tier = profile.tier;
  await Promise.all([colorImg.decode?.().catch(() => {}), depthImg.decode?.().catch(() => {})]);
  const color = tex(colorImg); color.colorSpace = THREE.SRGBColorSpace;
  const depth = tex(depthImg);
  const material = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: { uColor: { value: color }, uDepth: { value: depth }, uOffset: { value: new THREE.Vector2() }, uStrength: { value: 0.06 } } });
  const scene = new THREE.Scene(); scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const resize = () => { const r = frame.getBoundingClientRect(); applyRendererBudget(renderer, profile, Math.round(r.width), Math.round(r.height)); };
  resize(); addEventListener('resize', resize);

  const target = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => { target.x = (e.clientX / innerWidth - 0.5) * 2; target.y = -(e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
  const unsubscribe = ticker.add((dt) => {
    const u = material.uniforms.uOffset.value;
    const scroll = (scrollY / Math.max(1, innerHeight)) * 0.3; // scroll adds a gentle vertical drift
    u.x = damp(u.x, target.x, 6, dt); u.y = damp(u.y, target.y + scroll, 6, dt);
    state.offset = [Math.round(u.x * 100) / 100, Math.round(u.y * 100) / 100];
    state.maxOffset = Math.max(state.maxOffset, Math.hypot(u.x, u.y));
    renderer.render(scene, camera);
  });
  html.classList.add('gl-active'); readout.textContent = `webgl · ${profile.tier}`; state.gl = true;
  const dispose = () => { unsubscribe(); color.dispose(); depth.dispose(); material.dispose(); renderer.dispose(); html.classList.remove('gl-active'); state.gl = false; };
  addEventListener('pagehide', dispose, { once: true });
  window.__sample = (fx, fy) => { renderer.render(scene, camera); renderer.setRenderTarget(null); const gl = renderer.getContext(); gl.bindFramebuffer(gl.FRAMEBUFFER, null); const px = new Uint8Array(4); const w = renderer.domElement.width, h = renderer.domElement.height; gl.readPixels(Math.round(w * fx), Math.round(h * fy), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return Array.from(px); };
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (glPossible && motionTier() === 'full') { if (!(await start())) readout.textContent = 'dom (webgl failed)'; }
else readout.textContent = motionTier() !== 'full' ? 'dom (reduced motion)' : 'dom (no webgl)';

awards.addState(() => ({
  motion: motionTier(),
  gl: state.gl,
  tier: state.tier,
  offset: state.offset,
  maxOffset: Math.round(state.maxOffset * 100) / 100,
  stillVisibility: getComputedStyle(colorImg).visibility,
  // A pixel just outside the sun's right edge (a far layer): the parallax slides the sun across it as the pointer moves.
  edgePixel: state.gl ? window.__sample(0.86, 0.7) : null,
}));
awards.ready();
