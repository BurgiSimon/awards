import * as THREE from 'three';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier, applyRendererBudget } from '../_shared/quality-tiers.js';
import { ticker, damp, clamp } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const canvas = document.querySelector('[data-gl]');
const world = document.querySelector('.world');
const readout = document.querySelector('[data-gl-readout]');
const progressEl = document.querySelector('[data-progress-readout]');
const labelsEl = document.querySelector('[data-labels]');
const chapters = [...document.querySelectorAll('[data-chapters] li h3')].map((h) => h.textContent);
const N = chapters.length;
// The float: wheel and touch move `target`; `float` chases it through two lerps (the double lerp softens starts and stops).
const state = { gl: false, tier: 'pending', target: 0, mid: 0, float: 0, velocity: 0, snapping: false, chapter: 0, idleMs: 0, keySteps: 0, wheelEvents: 0 };
const WHEEL = 0.00035;      // progress per wheel pixel
const FRICTION = 0.97;      // per-frame decay of the wheel velocity at 60 fps
const LERP_A = 0.075, LERP_B = 0.15;
const SNAP_AFTER = 900;     // ms of idle before snapping to the nearest chapter
const SNAP_DURATION = 1.4;  // s

// Input: wheel adds velocity; the float integrates it with friction, so a flick coasts and settles.
addEventListener('wheel', (e) => { if (!world.contains(e.target) && e.target !== document.body && e.target !== html) return; e.preventDefault(); state.velocity += e.deltaY * WHEEL; state.idleMs = 0; state.snapping = false; state.wheelEvents++; }, { passive: false });
let touchY = null;
addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', (e) => { if (touchY == null) return; state.velocity += (touchY - e.touches[0].clientY) * WHEEL * 2; touchY = e.touches[0].clientY; state.idleMs = 0; state.snapping = false; }, { passive: true });
addEventListener('keydown', (e) => {
  const step = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1, Home: -N, End: N }[e.key];
  if (step === undefined || e.target.closest('input, textarea')) return;
  e.preventDefault(); state.keySteps++;
  // Step from where the tour is heading, not from where it is: during a snap `target` is still
  // mid-flight, and a step taken from it asks for the chapter already on its way.
  const from = state.snapRequest ?? state.snapTarget ?? state.target;
  goToChapter(clamp(Math.round(from * (N - 1)) + step, 0, N - 1));
});
// A key step asks for the same tween the idle snap uses; the ticker owns it, so it is the ticker that
// sets `snapping` and the ticker that clears it.
function goToChapter(i) { state.velocity = 0; state.snapRequest = i / (N - 1); state.idleMs = 0; }
// The capture tool and the jury drive the float through this scroller instead of window.scrollTo.
awards.setScroller((p) => { state.target = state.mid = state.float = p; state.velocity = 0; state.snapping = false; state.snapTarget = state.snapRequest = undefined; state.idleMs = SNAP_AFTER * -10; });

async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false }); } catch { return false; }
  const profile = await detectQualityTier({ sampleMs: 300 });
  state.tier = profile.tier;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(getComputedStyle(html).getPropertyValue('--ground').trim() || '#1a1c1c');
  scene.fog = new THREE.Fog(scene.background, 8, 40);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  // Waypoints: one per chapter, plus the camera path threaded above them.
  const points = [new THREE.Vector3(-6, 0, 0), new THREE.Vector3(-2, 0.5, -6), new THREE.Vector3(3, -0.5, -12), new THREE.Vector3(8, 0.2, -18)];
  const path = new THREE.CatmullRomCurve3(points.map((p) => p.clone().add(new THREE.Vector3(0, 2.2, 6))), false, 'centripetal', 0.5);
  const accent = getComputedStyle(html).getPropertyValue('--accent').trim() || '#ffc800';
  const markers = points.map((p, i) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6 + i * 0.15, 1), new THREE.MeshStandardMaterial({ color: accent, roughness: 0.5, flatShading: true })); m.position.copy(p); scene.add(m); return m; });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80, 40, 40), new THREE.MeshStandardMaterial({ color: 0x2a2c2c, wireframe: true }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -2; scene.add(ground);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x101010, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.8); key.position.set(4, 8, 6); scene.add(key);
  const tags = chapters.map((name, i) => { const t = document.createElement('span'); t.className = 'tag'; t.textContent = `${String(i + 1).padStart(2, '0')} · ${name}`; labelsEl.appendChild(t); return t; });

  function resize() { const r = world.getBoundingClientRect(); applyRendererBudget(renderer, profile, Math.round(r.width), Math.round(r.height)); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); }
  resize(); addEventListener('resize', resize);

  let snapFrom = 0, snapT = 0;
  const v = new THREE.Vector3();
  const unsubscribe = ticker.add((dt) => {
    const full = motionTier() === 'full';
    // 1. Integrate input with friction (framerate-independent form of 0.97 per 60 fps frame).
    state.target = clamp(state.target + state.velocity, 0, 1);
    state.velocity *= Math.pow(FRICTION, dt * 60);
    if (Math.abs(state.velocity) < 1e-5) state.velocity = 0;
    // 2. Snap to the nearest chapter after idling, or to the one a key step asked for.
    state.idleMs += dt * 1000;
    if (state.snapRequest !== undefined) { snapFrom = state.target; snapT = 0; state.snapTarget = state.snapRequest; state.snapping = true; state.snapRequest = undefined; }
    if (!state.snapping && state.velocity === 0 && state.idleMs > SNAP_AFTER) {
      const nearest = Math.round(state.target * (N - 1)) / (N - 1);
      if (Math.abs(nearest - state.target) > 0.002) { state.snapping = true; snapFrom = state.target; snapT = 0; state.snapTarget = nearest; }
      else state.idleMs = 0;
    }
    if (state.snapping && state.snapTarget !== undefined) {
      snapT = Math.min(1, snapT + dt / SNAP_DURATION);
      const e = snapT < 0.5 ? 4 * snapT ** 3 : 1 - Math.pow(-2 * snapT + 2, 3) / 2; // in-out cubic, 1.4 s
      state.target = snapFrom + (state.snapTarget - snapFrom) * e;
      if (snapT >= 1) { state.snapping = false; state.snapTarget = undefined; state.idleMs = 0; }
    }
    // 3. Double lerp (or a step under reduced motion), then the camera on the spline.
    if (full) { state.mid = damp(state.mid, state.target, -Math.log(1 - LERP_A) * 60, dt); state.float = damp(state.float, state.mid, -Math.log(1 - LERP_B) * 60, dt); }
    else { state.mid = state.float = Math.round(state.target * (N - 1)) / (N - 1); }
    const p = clamp(state.float, 0, 1);
    path.getPointAt(p, camera.position);
    const look = new THREE.Vector3().lerpVectors(points[Math.floor(p * (N - 1))], points[Math.min(N - 1, Math.ceil(p * (N - 1)))], (p * (N - 1)) % 1);
    camera.lookAt(look.x, look.y, look.z);
    state.chapter = Math.round(p * (N - 1));
    progressEl.textContent = String(Math.round(p * 100)).padStart(3, '0');
    // 4. DOM labels anchored to scene points: project each marker and place its tag.
    const r = world.getBoundingClientRect();
    markers.forEach((m, i) => {
      v.copy(m.position).add(new THREE.Vector3(0, 1.1, 0)).project(camera);
      const onScreen = v.z < 1 && Math.abs(v.x) < 1 && Math.abs(v.y) < 1;
      tags[i].classList.toggle('is-visible', onScreen && Math.abs(i / (N - 1) - p) < 0.3);
      tags[i].style.left = `${(v.x * 0.5 + 0.5) * r.width}px`;
      tags[i].style.top = `${(-v.y * 0.5 + 0.5) * r.height}px`;
    });
    if (full) markers.forEach((m, i) => (m.rotation.y += dt * (0.2 + i * 0.05)));
    renderer.render(scene, camera);
  });
  html.classList.add('gl-active'); readout.textContent = `webgl · ${profile.tier}`; state.gl = true;
  const dispose = () => { unsubscribe(); markers.forEach((m) => { m.geometry.dispose(); m.material.dispose(); }); ground.geometry.dispose(); ground.material.dispose(); renderer.dispose(); html.classList.remove('gl-active'); state.gl = false; };
  addEventListener('pagehide', dispose, { once: true });
  window.__cam = () => camera.position.toArray().map((n) => Math.round(n * 100) / 100);
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (glPossible) { if (!(await start())) readout.textContent = 'dom (webgl failed)'; } else readout.textContent = 'dom (no webgl)';

awards.addState(() => ({
  motion: motionTier(),
  gl: state.gl,
  tier: state.tier,
  target: Math.round(state.target * 1000) / 1000,
  float: Math.round(state.float * 1000) / 1000,
  chapter: state.chapter,
  snapping: state.snapping,
  keySteps: state.keySteps,
  wheelEvents: state.wheelEvents,
  camera: state.gl ? window.__cam() : null,
  visibleTags: document.querySelectorAll('.tag.is-visible').length,
  documentScroll: Math.round(scrollY),
}));
awards.ready();
