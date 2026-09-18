import * as THREE from 'three';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier, applyRendererBudget } from '../_shared/quality-tiers.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const canvas = document.querySelector('[data-gl]');
const stage = document.querySelector('.stage');
const readout = document.querySelector('[data-gl-readout]');
const sectionReadout = document.querySelector('[data-section-readout]');
const SECTIONS = [
  { name: 'Ember', ground: '#3a160c', accent: '#bf5114', make: () => new THREE.SphereGeometry(1.1, 48, 32) },
  { name: 'Tide', ground: '#0f2a26', accent: '#619785', make: () => new THREE.TorusGeometry(1.1, 0.35, 24, 96) },
  { name: 'Brass', ground: '#2c2824', accent: '#a89474', make: () => new THREE.TorusKnotGeometry(0.9, 0.3, 160, 24) },
];
const state = { gl: false, tier: 'pending', section: 0, from: 0, to: 0, progress: 1, transitioning: false, switches: 0 };
const DURATION = 1.0;
// The theme ease: cubic-bezier(.645,.045,.355,1) ≈ ease-in-out quad; sampled here without GSAP.
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const compositeFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uA; uniform sampler2D uB; uniform float uProgress; uniform float uAspect;
  varying vec2 vUv;
  void main() {
    // A soft diagonal wipe: the edge sweeps from the bottom-left to the top-right, with a zoom on the incoming scene.
    float edge = (vUv.x * uAspect + vUv.y) / (uAspect + 1.0);
    float feather = 0.18;
    float m = smoothstep(uProgress * (1.0 + feather) - feather, uProgress * (1.0 + feather), edge);
    vec2 zoomA = (vUv - 0.5) * (1.0 + 0.08 * uProgress) + 0.5;
    vec2 zoomB = (vUv - 0.5) * (1.0 - 0.08 * (1.0 - uProgress)) + 0.5;
    vec4 a = texture2D(uA, zoomA);
    vec4 b = texture2D(uB, zoomB);
    gl_FragColor = mix(b, a, m);
    #include <colorspace_fragment>   // the targets hold linear colour; the screen wants sRGB
  }`;
const quadVert = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false }); } catch { return false; }
  const profile = await detectQualityTier({ sampleMs: 300 });
  state.tier = profile.tier;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50); camera.position.z = 6;
  // One scene per section, built once; only the two involved in a transition are rendered per frame.
  const scenes = SECTIONS.map((s) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(s.ground);
    const mesh = new THREE.Mesh(s.make(), new THREE.MeshStandardMaterial({ color: s.accent, roughness: 0.4, metalness: 0.1 }));
    scene.add(mesh);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5); scene.add(key);
    return { scene, mesh };
  });
  const rtOpts = { type: profile.tier === 'low' ? THREE.UnsignedByteType : THREE.HalfFloatType, samples: profile.tier === 'high' ? 4 : 0 };
  const targets = [new THREE.WebGLRenderTarget(1, 1, rtOpts), new THREE.WebGLRenderTarget(1, 1, rtOpts)];
  const composite = new THREE.ShaderMaterial({ vertexShader: quadVert, fragmentShader: compositeFrag + '\n', uniforms: { uA: { value: null }, uB: { value: null }, uProgress: { value: 1 }, uAspect: { value: 1 } }, depthTest: false, depthWrite: false });
  const quadScene = new THREE.Scene(); quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), composite));
  const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  function resize() {
    const r = stage.getBoundingClientRect();
    applyRendererBudget(renderer, profile, Math.round(r.width), Math.round(r.height));
    const w = renderer.domElement.width, h = renderer.domElement.height;
    targets.forEach((t) => t.setSize(w, h));
    camera.aspect = w / h; camera.updateProjectionMatrix();
    composite.uniforms.uAspect.value = w / h;
    scenes.forEach((s) => (s.mesh.position.x = r.width > 767 ? 1.4 : 0));
  }
  resize(); addEventListener('resize', resize);

  let t = 0, tStart = 0, queued = null;
  function go(index) {
    const next = (index + SECTIONS.length) % SECTIONS.length;
    if (next === state.section) return;
    if (state.transitioning) { queued = next; return; }   // a request during a switch runs right after it
    state.from = state.section; state.to = next; state.switches++;
    if (motionTier() !== 'full') { state.section = next; state.progress = 1; announce(); return; }
    state.transitioning = true; state.progress = 0; tStart = performance.now(); // wall clock: the duration holds at any frame rate
  }
  function announce() { sectionReadout.textContent = `${String(state.section + 1).padStart(2, '0')} / ${String(SECTIONS.length).padStart(2, '0')} · ${SECTIONS[state.section].name}`; }
  document.querySelector('[data-next]').addEventListener('click', () => go(state.section + 1));
  document.querySelector('[data-prev]').addEventListener('click', () => go(state.section - 1));
  addEventListener('keydown', (e) => { if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); go(state.section + 1); } if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(state.section - 1); } });

  const unsubscribe = ticker.add((dt) => {
    t += dt;
    if (state.transitioning) {
      const raw = Math.min(1, (performance.now() - tStart) / (DURATION * 1000));
      state.progress = ease(raw);
      if (raw >= 1) { state.transitioning = false; state.section = state.to; state.progress = 1; announce(); if (queued !== null) { const q = queued; queued = null; go(q); } }
    }
    scenes.forEach((s) => { if (motionTier() === 'full') s.mesh.rotation.y += dt * 0.35; });
    // Render only the scenes on screen: the incoming one to target A, the outgoing to target B.
    const a = state.transitioning ? state.to : state.section;
    const b = state.transitioning ? state.from : state.section;
    renderer.setRenderTarget(targets[0]); renderer.render(scenes[a].scene, camera);
    if (state.transitioning) { renderer.setRenderTarget(targets[1]); renderer.render(scenes[b].scene, camera); }
    composite.uniforms.uA.value = targets[0].texture;
    composite.uniforms.uB.value = state.transitioning ? targets[1].texture : targets[0].texture;
    composite.uniforms.uProgress.value = state.transitioning ? state.progress : 1;
    renderer.setRenderTarget(null); renderer.render(quadScene, ortho);
  });
  announce();
  html.classList.add('gl-active'); readout.textContent = `webgl · ${profile.tier}`; state.gl = true;
  const dispose = () => { unsubscribe(); targets.forEach((x) => x.dispose()); scenes.forEach((s) => { s.mesh.geometry.dispose(); s.mesh.material.dispose(); }); composite.dispose(); renderer.dispose(); html.classList.remove('gl-active'); state.gl = false; };
  addEventListener('pagehide', dispose, { once: true });
  window.__sample = () => { renderer.setRenderTarget(null); renderer.render(quadScene, ortho); const gl = renderer.getContext(); gl.bindFramebuffer(gl.FRAMEBUFFER, null); const px = new Uint8Array(4); gl.readPixels(Math.round(renderer.domElement.width * 0.08), Math.round(renderer.domElement.height * 0.08), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return Array.from(px); };
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (glPossible) { if (!(await start())) readout.textContent = 'dom (webgl failed)'; } else readout.textContent = 'dom (no webgl)';

awards.addState(() => ({
  motion: motionTier(),
  gl: state.gl,
  tier: state.tier,
  section: state.section,
  from: state.from, to: state.to,
  progress: Math.round(state.progress * 1000) / 1000,
  transitioning: state.transitioning,
  switches: state.switches,
  readout: sectionReadout.textContent,
  cornerPixel: state.gl ? window.__sample() : null,
}));
awards.ready();
