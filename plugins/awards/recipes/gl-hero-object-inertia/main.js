import * as THREE from 'three';
import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier, applyRendererBudget } from '../_shared/quality-tiers.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();
const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
ticker.add((dt, t) => lenis.raf(t));
window.lenis = lenis;

const html = document.documentElement;
const canvas = document.querySelector('[data-gl]');
const stage = document.querySelector('.stage');
const readout = document.querySelector('[data-gl-readout]');
const state = { gl: false, tier: 'pending', rotY: 0, targetX: 0, targetY: 0, velX: 0, velY: 0, scrollTurn: 0, maxVel: 0, disposed: false };

// A matcap is a lit sphere baked into a texture: cheap, consistent, and no HDRI to download. This one is generated.
function makeMatcap(accent) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const base = g.createRadialGradient(96, 88, 10, 128, 128, 128);
  base.addColorStop(0, '#fff8dd'); base.addColorStop(0.35, accent); base.addColorStop(0.85, '#4a3a08'); base.addColorStop(1, '#0d0b06');
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  const rim = g.createRadialGradient(128, 128, 96, 128, 128, 128);
  rim.addColorStop(0, 'rgba(255,255,255,0)'); rim.addColorStop(1, 'rgba(255,255,255,0.35)');
  g.fillStyle = rim; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { return false; }
  const profile = await detectQualityTier({ sampleMs: 300 });
  state.tier = profile.tier;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 7);
  const detail = profile.tier === 'high' ? [200, 32] : profile.tier === 'mid' ? [120, 20] : [64, 12];
  const geometry = new THREE.TorusKnotGeometry(1.2, 0.42, detail[0], detail[1]);
  const accent = getComputedStyle(html).getPropertyValue('--accent').trim() || '#ffc800';
  const matcap = makeMatcap(accent);
  const material = new THREE.MeshMatcapMaterial({ matcap });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  function resize() {
    const r = stage.getBoundingClientRect();
    applyRendererBudget(renderer, profile, Math.round(r.width), Math.round(r.height));
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
    // Keep the object right of centre on wide viewports so the copy has room; centred on phones.
    mesh.position.x = r.width > 767 ? 1.6 : 0;
  }
  resize();
  addEventListener('resize', resize);

  // Pointer sets a target orientation; a damped spring chases it: k is the stiffness, c the damping.
  const K = 18, C = 5.5;
  addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    state.targetY = ((e.clientX - r.left) / r.width - 0.5) * 1.2;
    state.targetX = ((e.clientY - r.top) / r.height - 0.5) * 0.8;
  }, { passive: true });

  const spring = { x: 0, y: 0 };
  const unsubscribe = ticker.add((dt) => {
    const full = motionTier() === 'full';
    if (full) {
      const ax = K * (state.targetX - spring.x) - C * state.velX;
      const ay = K * (state.targetY - spring.y) - C * state.velY;
      state.velX += ax * dt; state.velY += ay * dt;
      spring.x += state.velX * dt; spring.y += state.velY * dt;
      state.maxVel = Math.max(state.maxVel, Math.hypot(state.velX, state.velY));
      // Scroll scrubs one full turn across two viewports; the spring rides on top of it.
      state.scrollTurn = Math.min(1, scrollY / (innerHeight * 2)) * Math.PI * 2;
    }
    mesh.rotation.set(spring.x + 0.4, spring.y + state.scrollTurn + 0.6, 0);
    state.rotY = mesh.rotation.y;
    renderer.render(scene, camera);
  });

  html.classList.add('gl-active');
  readout.textContent = `webgl · ${profile.tier}`;
  state.gl = true;
  const dispose = () => { unsubscribe(); geometry.dispose(); material.dispose(); matcap.dispose(); renderer.dispose(); html.classList.remove('gl-active'); state.gl = false; state.disposed = true; };
  addEventListener('pagehide', dispose, { once: true });
  window.__sample = () => { renderer.render(scene, camera); const gl = renderer.getContext(); const px = new Uint8Array(4); const r = stage.getBoundingClientRect(); const x = Math.round((r.width * (innerWidth > 767 ? 0.66 : 0.5)) * renderer.getPixelRatio()); const y = Math.round((r.height * 0.5) * renderer.getPixelRatio()); gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return Array.from(px); };
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (glPossible && motionTier() === 'full') { if (!(await start())) readout.textContent = 'dom (webgl failed)'; }
else readout.textContent = motionTier() !== 'full' ? 'dom (reduced motion)' : 'dom (no webgl)';

awards.addState(() => ({
  motion: motionTier(),
  gl: state.gl,
  tier: state.tier,
  rotY: Math.round(state.rotY * 100) / 100,
  scrollTurn: Math.round(state.scrollTurn * 100) / 100,
  maxVel: Math.round(state.maxVel * 100) / 100,
  fallbackVisibility: getComputedStyle(document.querySelector('[data-fallback]')).visibility,
  samplePixel: state.gl ? window.__sample() : null,
}));
awards.ready();
