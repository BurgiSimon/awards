import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, BloomEffect, NoiseEffect, SMAAEffect, BlendFunction } from 'postprocessing';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier, applyRendererBudget } from '../_shared/quality-tiers.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const canvas = document.querySelector('[data-gl]');
const stage = document.querySelector('.stage');
const readout = document.querySelector('[data-gl-readout]');
// Fixed presets: the three intensities a multi-scene site needs. Never expose a free dial.
const PRESETS = { hero: { bloom: 1.5, grain: 0.18 }, chapter: { bloom: 0.5, grain: 0.12 }, quiet: { bloom: 0.25, grain: 0.06 } };
const state = { gl: false, tier: 'pending', preset: 'hero', post: false, bloom: 0 };

async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' }); } catch { return false; }
  const profile = await detectQualityTier({ sampleMs: 300 });
  state.tier = profile.tier;
  state.post = profile.postprocessing;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(getComputedStyle(html).getPropertyValue('--ground').trim() || '#1a1c1c');
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50); camera.position.z = 6;
  const accent = new THREE.Color(getComputedStyle(html).getPropertyValue('--accent').trim() || '#ffc800');
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshBasicMaterial({ color: accent }));
  scene.add(sphere);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.04, 12, 96), new THREE.MeshBasicMaterial({ color: accent }));
  scene.add(ring);

  // Composer: render → bloom + grain (one EffectPass) → SMAA. Half-float buffers on capable devices; SMAA over MSAA on mobile.
  const composer = new EffectComposer(renderer, { frameBufferType: profile.tier === 'low' ? THREE.UnsignedByteType : THREE.HalfFloatType, multisampling: 0 });
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new BloomEffect({ intensity: PRESETS.hero.bloom, luminanceThreshold: 0.35, luminanceSmoothing: 0.25, mipmapBlur: true });
  const grain = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: true });
  grain.blendMode.opacity.value = PRESETS.hero.grain;
  const effects = new EffectPass(camera, bloom, grain);
  composer.addPass(effects);
  composer.addPass(new EffectPass(camera, new SMAAEffect()));

  function applyPreset(name) {
    state.preset = name; state.bloom = PRESETS[name].bloom;
    bloom.intensity = PRESETS[name].bloom;
    grain.blendMode.opacity.value = PRESETS[name].grain;
    document.querySelectorAll('[data-preset]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.preset === name)));
  }
  document.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => applyPreset(b.dataset.preset)));
  applyPreset('hero');

  function resize() {
    const r = stage.getBoundingClientRect();
    applyRendererBudget(renderer, profile, Math.round(r.width), Math.round(r.height));
    composer.setSize(Math.round(r.width), Math.round(r.height));
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
    sphere.position.x = ring.position.x = r.width > 767 ? 1.4 : 0;
  }
  resize(); addEventListener('resize', resize);

  let t = 0;
  const unsubscribe = ticker.add((dt) => {
    if (motionTier() === 'full') { t += dt; ring.rotation.x = t * 0.4; ring.rotation.y = t * 0.25; }
    if (state.post) composer.render(dt); else renderer.render(scene, camera);
  });
  html.classList.add('gl-active'); readout.textContent = `webgl · ${profile.tier} · ${state.post ? 'post' : 'no post'}`; state.gl = true;
  const dispose = () => { unsubscribe(); composer.dispose(); sphere.geometry.dispose(); sphere.material.dispose(); ring.geometry.dispose(); ring.material.dispose(); renderer.dispose(); html.classList.remove('gl-active'); state.gl = false; };
  addEventListener('pagehide', dispose, { once: true });
  // Sample just outside the sphere's edge: bloom brightens it; the raw render leaves it near the ground colour.
  // Sample just above the sphere's top edge, where the bloom halo lands: bright with the hero preset, near the ground colour with quiet.
  window.__sample = () => {
    if (state.post) composer.render(1 / 60); else renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    const gl = renderer.getContext();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const w = renderer.domElement.width, h = renderer.domElement.height;
    const k = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;   // world units spanning the viewport height
    const cx = 0.5 + sphere.position.x / (k * camera.aspect);
    const ry = 1 / k;                                                          // sphere radius as a fraction of the height
    const px = new Uint8Array(4);
    gl.readPixels(Math.round(w * cx), Math.round(h * (0.5 + ry * 1.12)), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return Array.from(px);
  };
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (glPossible && motionTier() === 'full') { if (!(await start())) readout.textContent = 'dom (webgl failed)'; }
else readout.textContent = motionTier() !== 'full' ? 'dom (reduced motion)' : 'dom (no webgl)';

awards.addState(() => ({
  motion: motionTier(),
  gl: state.gl,
  tier: state.tier,
  post: state.post,
  preset: state.preset,
  bloom: state.bloom,
  halo: state.gl ? window.__sample() : null,
}));
awards.ready();
