import * as THREE from 'three';
import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier } from '../_shared/quality-tiers.js';
import { ticker, damp } from '../_shared/raf.js';

syncMotionTierAttribute();
// Lenis 1.3 defaults to autoRaf: false; without a clock it swallows wheel events and never scrolls. Ride the shared ticker.
const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
ticker.add((dt, t) => lenis.raf(t));
window.lenis = lenis;

const html = document.documentElement;
const canvas = document.querySelector('[data-gl]');
const readout = document.querySelector('[data-gl-readout]');
const images = [...document.querySelectorAll('[data-gl-plane]')];
const state = { gl: false, planes: 0, speed: 0, maxSpeed: 0, canvasOffset: 0, tier: 'pending', firstPlane: null, disposed: false };

const vertex = /* glsl */ `
  uniform float uSpeed;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // Floema's bulge: both axes read as a sine hump, scaled by the scroll speed. z is in pixels here.
    p.z -= (sin(uv.y * 3.14159) + sin(uv.x * 3.14159)) * abs(uSpeed) * uStrength;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;
const fragment = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(uMap, vUv);
    // Custom materials must convert to the output colour space themselves, or sRGB textures render dark.
    #include <colorspace_fragment>
  }`;

async function start() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch { return false; }
  const profile = await detectQualityTier({ sampleMs: 300 });
  state.tier = profile.tier;
  const segments = profile.tier === 'high' ? 32 : profile.tier === 'mid' ? 16 : 8;
  renderer.setPixelRatio(profile.dpr);       // DPR cap from the tier, never raw devicePixelRatio
  renderer.setClearColor(0x000000, 0);
  THREE.ColorManagement.enabled = true;

  const scene = new THREE.Scene();
  // Perspective camera whose distance makes one world unit equal one CSS pixel at z = 0, so DOM rects map 1:1.
  const camera = new THREE.PerspectiveCamera(45, 1, 10, 4000);
  const DIST = 1000;
  const geometry = new THREE.PlaneGeometry(1, 1, segments, segments);
  const planes = images.map((img) => {
    const texture = textureFromImage(img);
    const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: { uMap: { value: texture }, uSpeed: { value: 0 }, uStrength: { value: 0.35 } } });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return { img, mesh, material, texture };
  });
  state.planes = planes.length;

  let w = 0, h = 0;
  function resize() {
    w = innerWidth; h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = 2 * Math.atan(h / 2 / DIST) * (180 / Math.PI);
    camera.position.z = DIST;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  const unsubscribe = ticker.add((dt) => {
    // 1. Keep the absolute canvas under the viewport: translate it to the current scroll every frame.
    const y = window.scrollY;
    canvas.style.transform = `translate3d(0, ${y}px, 0)`;
    state.canvasOffset = y;
    // 2. Speed is the damped scroll velocity (Lenis reports px per frame-ish units); reduced motion keeps it at 0.
    const target = motionTier() === 'full' ? (lenis.velocity || 0) : 0;
    state.speed = damp(state.speed, target, 8, dt);
    state.maxSpeed = Math.max(state.maxSpeed, Math.abs(state.speed));
    // 3. Map every visible image rect to its plane.
    for (const p of planes) {
      const r = p.img.getBoundingClientRect();
      const visible = r.bottom > -100 && r.top < h + 100;
      p.mesh.visible = visible;
      if (!visible) continue;
      p.mesh.position.set(r.left + r.width / 2 - w / 2, -(r.top + r.height / 2) + h / 2, 0);
      p.mesh.scale.set(r.width, r.height, 1);
      p.material.uniforms.uSpeed.value = state.speed;
    }
    const first = planes[0];
    const r0 = first.img.getBoundingClientRect();
    state.firstPlane = { rectW: Math.round(r0.width), scaleX: Math.round(first.mesh.scale.x), rectCx: Math.round(r0.left + r0.width / 2), meshCx: Math.round(first.mesh.position.x + w / 2), visible: first.mesh.visible };
    renderer.render(scene, camera);
  });

  html.classList.add('gl-active');
  readout.textContent = `webgl · ${profile.tier}`;
  state.gl = true;

  function dispose() {
    unsubscribe();
    for (const p of planes) { p.texture.dispose(); p.material.dispose(); }
    geometry.dispose();
    renderer.dispose();
    html.classList.remove('gl-active');
    state.gl = false; state.disposed = true;
  }
  addEventListener('pagehide', dispose, { once: true });
  window.__glSample = () => {
    // Read one pixel at the centre of the first plane, right after a render, so the buffer is still valid.
    renderer.render(scene, camera);
    const gl = renderer.getContext();
    const r = planes[0].img.getBoundingClientRect();
    const px = new Uint8Array(4);
    const x = Math.round((r.left + r.width / 2) * renderer.getPixelRatio());
    const yPx = Math.round((h - (r.top + r.height / 2)) * renderer.getPixelRatio());
    gl.readPixels(x, yPx, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return Array.from(px);
  };
  return true;
}

// Draw the <img> onto a 2D canvas first: works for SVG sources and keeps the texture size within budget.
function textureFromImage(img) {
  const c = document.createElement('canvas');
  const max = 1024;
  const s = Math.min(1, max / Math.max(img.naturalWidth || 800, img.naturalHeight || 1000));
  c.width = Math.round((img.naturalWidth || 800) * s); c.height = Math.round((img.naturalHeight || 1000) * s);
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, c.width, c.height);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
await Promise.all(images.map((img) => (img.decode ? img.decode().catch(() => {}) : Promise.resolve())));
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
  planes: state.planes,
  speed: Math.round(state.speed * 100) / 100,
  maxSpeed: Math.round(state.maxSpeed * 100) / 100,
  canvasOffset: state.canvasOffset,
  scrollY: Math.round(window.scrollY),
  firstPlane: state.firstPlane,
  imagesInDom: document.querySelectorAll('[data-gl-plane][alt]').length,
  imgVisibility: getComputedStyle(images[0]).visibility,
  canvasAriaHidden: canvas.getAttribute('aria-hidden') === 'true',
  samplePixel: state.gl ? window.__glSample() : null,
}));
awards.ready();
