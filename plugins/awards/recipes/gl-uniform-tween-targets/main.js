import * as THREE from 'three';
import gsap from 'gsap';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();
const html = document.documentElement;
const canvas = document.querySelector('[data-gl]');
const stage = document.querySelector('.stage');
const readout = document.querySelector('[data-gl-readout]');
const charge = document.querySelector('[data-charge]');
const tier = motionTier();

// Timing per motion tier. Full: entrance slower than exit, spatial swell on. Reduced: colour only, short. Static: instant.
const TIMING = {
  full: { in: { duration: 0.9, ease: 'power2.out' }, out: { duration: 0.45, ease: 'power2.in' }, preset: { duration: 0.9, ease: 'power2.inOut' }, swell: true },
  reduced: { in: { duration: 0.25, ease: 'power2.out' }, out: { duration: 0.2, ease: 'power2.in' }, preset: { duration: 0.3, ease: 'power2.inOut' }, swell: false },
  static: { in: { duration: 0 }, out: { duration: 0 }, preset: { duration: 0 }, swell: false },
}[tier];
// Scene looks: post values the timeline moves between, never a free dial.
const PRESETS = { calm: { vignette: 0.35, grain: 0.04, density: 38 }, charged: { vignette: 0.75, grain: 0.12, density: 64 } };

const css = (name, fallback) => getComputedStyle(html).getPropertyValue(name).trim() || fallback;
const ground = new THREE.Color(css('--ground', '#1a1c1c'));
const rest = ground.clone().lerp(new THREE.Color(css('--ink', '#f4f2ee')), 0.22);
const target = new THREE.Color(css('--accent', '#ffc800'));
const u = {
  uRes: { value: new THREE.Vector2(1, 1) },
  uCenter: { value: new THREE.Vector2(0, 0) },
  uGround: { value: ground },
  uRest: { value: rest },
  uTarget: { value: target },
  uHover: { value: 0 },
  uSwell: { value: 0 },
  uVignette: { value: PRESETS.calm.vignette },
  uGrain: { value: PRESETS.calm.grain },
  uDensity: { value: PRESETS.calm.density },
};
const state = { gl: false, preset: 'calm', hoverTween: null, log: [], before: null };
let dirty = true;
const markDirty = () => { dirty = true; };

// The technique: kill whatever is moving this value, then tween from wherever it is now. No fromTo, no reset.
function retarget(targets, vars) {
  gsap.killTweensOf(targets);
  return gsap.to(targets, { ...vars, onUpdate: markDirty });
}

function setCharge(on) {
  const t = on ? TIMING.in : TIMING.out;
  state.before = u.uHover.value; state.log = [];
  state.hoverTween = retarget(u.uHover, { value: on ? 1 : 0, ...t });
  if (TIMING.swell) retarget(u.uSwell, { value: on ? 1 : 0, ...t });
  markDirty();
}

function applyPreset(name) {
  const p = PRESETS[name];
  state.preset = name;
  retarget([u.uVignette, u.uGrain, u.uDensity], { value: (i) => [p.vignette, p.grain, p.density][i], ...TIMING.preset });
  document.querySelectorAll('[data-preset]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.preset === name)));
  markDirty();
}
document.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => applyPreset(b.dataset.preset)));
charge.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setCharge(true); });
charge.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') setCharge(false); });
charge.addEventListener('focus', () => setCharge(true));
charge.addEventListener('blur', () => setCharge(false));

const vertexShader = /* glsl */ `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const fragmentShader = /* glsl */ `
uniform vec2 uRes, uCenter;
uniform vec3 uGround, uRest, uTarget;
uniform float uHover, uSwell, uVignette, uGrain, uDensity;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 p = (gl_FragCoord.xy - uCenter) / uRes.y;
  float r = length(p);
  vec3 tint = mix(uRest, uTarget, uHover);
  float core = 1.0 - smoothstep(0.07, 0.075, r);
  float reach = 0.32 + 0.1 * uSwell;
  float rings = smoothstep(0.55, 0.9, 0.5 + 0.5 * cos(r * uDensity - uSwell * 4.0));
  float halo = rings * (1.0 - smoothstep(reach * 0.5, reach, r)) * (0.45 + 0.55 * uHover);
  vec3 col = mix(uGround, tint, max(core, halo));
  vec2 q = gl_FragCoord.xy / uRes - 0.5;
  col *= 1.0 - uVignette * smoothstep(0.3, 0.75, length(q));
  col += (hash(gl_FragCoord.xy) - 0.5) * uGrain * (1.0 - core);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false }); } catch { return false; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new THREE.ShaderMaterial({ uniforms: u, vertexShader, fragmentShader });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  function resize() {
    const r = stage.getBoundingClientRect();
    renderer.setSize(Math.round(r.width), Math.round(r.height), false);
    const w = renderer.domElement.width, h = renderer.domElement.height;
    u.uRes.value.set(w, h);
    // Rings sit right of the copy on wide screens, low and centred on phones.
    u.uCenter.value.set(r.width > 767 ? w * 0.72 : w * 0.5, r.width > 767 ? h * 0.5 : h * 0.16);
    markDirty();
  }
  resize(); addEventListener('resize', resize);

  // GSAP owns the clock: listeners run after tweens update, so the frame drawn shows this tick's values.
  const tick = (time, deltaTime) => {
    if (state.before !== null && state.log.length < 240) state.log.push({ v: u.uHover.value, dt: deltaTime / 1000 });
    if (!dirty) return;
    dirty = false;
    renderer.render(scene, camera);
  };
  gsap.ticker.add(tick);

  const gl = renderer.getContext();
  state.sample = () => {
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const px = new Uint8Array(4);
    gl.readPixels(Math.round(u.uCenter.value.x), Math.round(u.uCenter.value.y), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return Array.from(px);
  };
  addEventListener('pagehide', () => {
    gsap.ticker.remove(tick);
    gsap.killTweensOf(Object.values(u));
    quad.geometry.dispose(); material.dispose(); renderer.dispose();
    html.classList.remove('gl-active'); state.gl = false;
  }, { once: true });
  html.classList.add('gl-active'); state.gl = true;
  readout.textContent = `webgl · ${tier}`;
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (!glPossible || !start()) readout.textContent = 'dom (no webgl)';

// Test hook: pause the running hover tween at a progress, as a scrub would.
window.__uniformTweens = { seek(p) { state.hoverTween?.pause().progress(p); markDirty(); return true; } };
const toBytes = (c) => { const s = c.clone().convertLinearToSRGB(); return [s.r, s.g, s.b].map((v) => Math.round(v * 255)); };

awards.addState(() => {
  const t = state.hoverTween;
  return {
    motion: tier,
    gl: state.gl,
    preset: state.preset,
    uniforms: { hover: u.uHover.value, swell: u.uSwell.value, vignette: u.uVignette.value, grain: u.uGrain.value, density: u.uDensity.value },
    hoverTween: t ? { progress: t.progress(), ease: t.vars.ease ?? null, easeAtProgress: t.vars.ease ? gsap.parseEase(t.vars.ease)(t.progress()) : null, to: t.vars.value } : null,
    rest: toBytes(rest), target: toBytes(target),
    before: state.before,
    log: state.log.slice(),
    maxRate: Math.max(...Object.values(TIMING).filter((t) => t?.duration).map((t) => 3 / t.duration)),
    pixel: state.gl ? state.sample() : null,
  };
});
awards.ready();
