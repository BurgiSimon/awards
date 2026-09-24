import * as THREE from 'three';
import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier, applyRendererBudget } from '../_shared/quality-tiers.js';
import { ticker, clamp, lerp } from '../_shared/raf.js';

syncMotionTierAttribute();
// Lenis only in the full tier; stopped while the dialog is open, and data-lenis-prevent keeps it off the dialog's wheel.
const lenis = motionTier() === 'full' ? new Lenis({ lerp: 0.1, autoRaf: false }) : null;
if (lenis) { ticker.add((dt, t) => lenis.raf(t)); window.lenis = lenis; }

const $ = (s) => document.querySelector(s);
const dialog = $('[data-viewer]'), stage = $('[data-stage]'), canvas = $('[data-gl]'), readout = $('[data-gl-readout]');
const buttons = [...document.querySelectorAll('[data-zone]')];

// Parameters. Polar angle is measured from straight up; the band keeps every view a composed three-quarter one.
const POLAR = [0.85, 1.3], RADIUS = [7, 15];
// Damping as the fraction of the remaining distance left after one second: x += (goal − x)·(1 − k^dt).
const K_DRAG = 0.0004, K_FLY = 0.02;
const HOME = { target: [0, 0.6, 0], theta: 0.55, phi: 1.05, radius: 12.5 };
// Synthetic zones: a target on the model, the azimuth to view it from and how close to come.
const ZONES = {
  offices: { figure: '18,400 m²', text: 'Three office blocks on the west edge, floor plates from 900 m².', target: [-2.3, 1.1, -0.2], theta: -0.7, radius: 8 },
  tower: { figure: '16 floors', text: 'A round tower on the north-east corner with a public top floor.', target: [2.4, 2.2, -1.8], theta: 0.45, radius: 9.5 },
  courtyard: { figure: '4,100 m²', text: 'A planted courtyard between every entrance, open to the street.', target: [0.3, 0, 1.1], theta: 0.1, radius: 7.5 },
  parking: { figure: '240 spaces', text: 'Two low decks to the south-east, 40 of them with chargers.', target: [3.1, 0.3, 1.6], theta: 1.1, radius: 7.5 },
};

const goal = { target: new THREE.Vector3(...HOME.target), theta: HOME.theta, phi: HOME.phi, radius: HOME.radius };
const cam = { target: goal.target.clone(), theta: goal.theta, phi: goal.phi, radius: goal.radius };
const state = { open: false, mode: 'none', tier: 'pending', zone: null, k: K_FLY, drags: 0, keys: 0, disposed: false };
let gl = null; // { renderer, scene, camera, zoneMaterials, render, resize, dispose }
let unsubscribe = null;

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
const profilePromise = glPossible ? detectQualityTier({ sampleMs: 300 }) : null;

function buildScene(profile) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: profile.tier !== 'low' }); } catch { return null; }
  const css = getComputedStyle(document.documentElement);
  const token = (n, f) => css.getPropertyValue(n).trim() || f;
  const ground = new THREE.Color(token('--ground', '#1a1c1c')), accent = new THREE.Color(token('--accent', '#ffc800'));
  renderer.setClearColor(ground);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x303030, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(-4, 8, 5); scene.add(sun);

  // The whole model is three primitives: a plane, a box and a cylinder, scaled and placed.
  const plane = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const cyl = new THREE.CylinderGeometry(1, 1, 1, profile.tier === 'low' ? 24 : 48).translate(0, 0.5, 0);
  const base = { offices: '#a8a49c', tower: '#d9d5cc', courtyard: '#556b4a', parking: '#605c56' };
  const zoneMaterials = {};
  for (const [id, c] of Object.entries(base)) zoneMaterials[id] = Object.assign(new THREE.MeshLambertMaterial({ color: c }), { userData: { base: new THREE.Color(c) } });
  const groundMat = new THREE.MeshLambertMaterial({ color: '#2a2c2c' });
  const add = (geo, mat, [x, y, z], [sx, sy, sz]) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); scene.add(m); };
  add(plane, groundMat, [0, 0, 0], [12, 1, 8]);
  add(box, zoneMaterials.offices, [-3.2, 0, -1], [1.6, 2.4, 2.2]);
  add(box, zoneMaterials.offices, [-1.3, 0, -1.4], [1.6, 1.6, 1.4]);
  add(box, zoneMaterials.offices, [-3.2, 0, 1.3], [1.6, 1.4, 1.4]);
  add(cyl, zoneMaterials.tower, [2.4, 0, -1.8], [0.9, 4.4, 0.9]);
  add(plane, zoneMaterials.courtyard, [0.3, 0.01, 1.1], [3.4, 1, 2]);
  add(box, zoneMaterials.parking, [2.8, 0, 1.6], [0.7, 0.35, 1.8]);
  add(box, zoneMaterials.parking, [3.6, 0, 1.6], [0.7, 0.35, 1.8]);

  const v = new THREE.Vector3();
  let widths = [];
  const resize = () => {
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    applyRendererBudget(renderer, profile, Math.round(r.width), Math.round(r.height));
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
    widths = buttons.map((b) => b.offsetWidth);
  };
  const render = () => {
    const s = Math.sin(cam.phi);
    camera.position.set(cam.target.x + cam.radius * s * Math.sin(cam.theta), cam.target.y + cam.radius * Math.cos(cam.phi), cam.target.z + cam.radius * s * Math.cos(cam.theta));
    camera.lookAt(cam.target);
    camera.updateMatrixWorld();
    for (const [id, m] of Object.entries(zoneMaterials)) m.color.copy(id === state.zone ? accent : m.userData.base);
    renderer.render(scene, camera);
    // Hotspot labels are DOM buttons pinned to their projected target: real focus, real text, no canvas hit-testing.
    const w = stage.clientWidth, h = stage.clientHeight;
    // Off-screen zones park on the stage edge, so every button stays visible when it takes focus.
    buttons.forEach((b, i) => {
      v.fromArray(ZONES[b.dataset.zone].target).project(camera);
      const x = clamp(((v.x + 1) / 2) * w - 12, 4, w - (widths[i] || 0) - 4), y = clamp(((1 - v.y) / 2) * h, 26, h - 26);
      b.style.transform = `translate(${x}px, ${y}px) translate(0, -50%)`;
    });
  };
  const dispose = () => {
    [plane, box, cyl, groundMat, ...Object.values(zoneMaterials)].forEach((o) => o.dispose());
    renderer.dispose();
  };
  return { renderer, camera, render, resize, dispose };
}

// Each frame: ease the camera toward the clamped goal. Reduced motion jumps straight there (no fly, no glide).
function frame(dt) {
  const f = motionTier() === 'full' ? 1 - Math.pow(state.k, dt) : 1;
  cam.target.lerp(goal.target, f);
  cam.theta = lerp(cam.theta, goal.theta, f);
  cam.phi = lerp(cam.phi, goal.phi, f);
  cam.radius = lerp(cam.radius, goal.radius, f);
  gl.render();
}

function setGoal({ target, theta, phi, radius }, k) {
  if (target) goal.target.fromArray(target);
  // Take the short way round: the new azimuth is expressed relative to the current goal.
  if (theta !== undefined) goal.theta += Math.atan2(Math.sin(theta - goal.theta), Math.cos(theta - goal.theta));
  if (phi !== undefined) goal.phi = clamp(phi, POLAR[0], POLAR[1]);
  if (radius !== undefined) goal.radius = clamp(radius, RADIUS[0], RADIUS[1]);
  state.k = k;
  // Reduced motion: the camera is there now, not on the next frame.
  if (motionTier() !== 'full') { cam.target.copy(goal.target); Object.assign(cam, { theta: goal.theta, phi: goal.phi, radius: goal.radius }); }
}

function select(id) {
  state.zone = id;
  for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.zone === id));
  const z = ZONES[id];
  $('[data-detail-name]').textContent = id ? buttons.find((b) => b.dataset.zone === id).textContent : 'Whole site';
  $('[data-detail-figure]').textContent = z ? z.figure : '3.2 ha';
  $('[data-detail-text]').textContent = z ? z.text : 'Choose a zone, or drag to turn the model.';
  if (state.mode === 'gl') setGoal(z || HOME, K_FLY);
}

async function open() {
  if (lenis) lenis.stop();
  dialog.showModal();
  state.open = true;
  // Static tier or no WebGL: the poster with the same zone list. Otherwise build the scene once, on first open.
  if (motionTier() === 'static' || !glPossible) state.mode = 'poster';
  else if (!gl) { const profile = await profilePromise; state.tier = profile.tier; gl = buildScene(profile); state.mode = gl ? 'gl' : 'poster'; }
  else state.mode = 'gl';
  dialog.dataset.mode = state.mode;
  readout.textContent = state.mode === 'gl' ? `webgl · ${state.tier}` : `poster (${glPossible ? motionTier() : 'no webgl'})`;
  if (state.mode !== 'gl' || !state.open) return;
  gl.resize();
  // Full tier: the camera settles in from a little further out on every open.
  if (motionTier() === 'full') { cam.radius = goal.radius + 4; state.k = K_FLY; }
  unsubscribe = ticker.add(frame);
}

dialog.addEventListener('close', () => {
  state.open = false;
  unsubscribe?.(); unsubscribe = null;
  lenis?.start();
});
$('[data-open]').addEventListener('click', open);
$('[data-close]').addEventListener('click', () => dialog.close());
$('[data-reset]').addEventListener('click', () => select(null));
for (const b of buttons) b.addEventListener('click', () => select(b.dataset.zone));
// The stage changes size with the window and with the detail text below it on phones.
new ResizeObserver(() => gl?.resize()).observe(stage);

// Drag orbits (pointer capture keeps it alive outside the canvas); drag down lifts the camera, as with a real model.
let drag = null;
canvas.addEventListener('pointerdown', (e) => { if (state.mode !== 'gl') return; drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); stage.focus({ preventScroll: true }); state.drags++; });
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const r = stage.getBoundingClientRect();
  setGoal({ theta: goal.theta - ((e.clientX - drag.x) / r.width) * Math.PI * 1.5, phi: goal.phi - ((e.clientY - drag.y) / r.height) * Math.PI }, K_DRAG);
  drag = { x: e.clientX, y: e.clientY };
});
const endDrag = () => { drag = null; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
stage.addEventListener('wheel', (e) => { if (state.mode !== 'gl') return; e.preventDefault(); setGoal({ radius: goal.radius * (1 + e.deltaY * 0.001) }, K_DRAG); }, { passive: false });

// Keyboard path: the stage is focusable; arrows orbit, + / − zoom, Home resets. Tab reaches the hotspot buttons.
stage.addEventListener('keydown', (e) => {
  if (state.mode !== 'gl' || e.target !== stage) return;
  const step = { ArrowLeft: [0.2, 0, 1], ArrowRight: [-0.2, 0, 1], ArrowUp: [0, -0.1, 1], ArrowDown: [0, 0.1, 1], '+': [0, 0, 0.9], '=': [0, 0, 0.9], '-': [0, 0, 1.1] }[e.key];
  if (e.key === 'Home') { e.preventDefault(); select(null); return; }
  if (!step) return;
  e.preventDefault();
  state.keys++;
  setGoal({ theta: goal.theta + step[0], phi: goal.phi + step[1], radius: goal.radius * step[2] }, K_FLY);
});

addEventListener('pagehide', () => { unsubscribe?.(); gl?.dispose(); state.disposed = true; }, { once: true });

// Verification hook: a fresh render and a readPixels in the same task, sampled on a coarse grid.
window.__glSample = () => {
  if (!gl) return null;
  gl.render();
  const ctx = gl.renderer.getContext(), w = ctx.drawingBufferWidth, h = ctx.drawingBufferHeight, px = new Uint8Array(4), out = [];
  for (let j = 1; j < 8; j++) for (let i = 1; i < 12; i++) { ctx.readPixels(Math.round((w * i) / 12), Math.round((h * j) / 8), 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, px); out.push([px[0], px[1], px[2]]); }
  return out;
};

const r3 = (n) => Math.round(n * 1000) / 1000;
awards.addState(() => ({
  motion: motionTier(),
  open: state.open,
  mode: state.mode,
  gl: !!gl && state.mode === 'gl',
  tier: state.tier,
  zone: state.zone,
  drags: state.drags,
  keys: state.keys,
  clamp: { polar: POLAR, radius: RADIUS },
  cam: { theta: r3(cam.theta), phi: r3(cam.phi), radius: r3(cam.radius), target: cam.target.toArray().map(r3) },
  goal: { theta: r3(goal.theta), phi: r3(goal.phi), radius: r3(goal.radius), target: goal.target.toArray().map(r3) },
  zones: Object.fromEntries(Object.entries(ZONES).map(([k, z]) => [k, z.target])),
}));
awards.ready();
