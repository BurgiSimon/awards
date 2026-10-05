import * as THREE from 'three';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier } from '../_shared/quality-tiers.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const figure = document.querySelector('[data-turn]');
const canvas = figure.querySelector('canvas');
const readout = document.querySelector('[data-gl-readout]');
const tier = motionTier();
const fine = matchMedia('(pointer: fine)');

// Profile and turn parameters: the whole object is these numbers.
const POINTS = 48, HEIGHT = 2, RADIUS = 1, WAIST = 0.62, RIPPLE = 0.035, RIPPLES = 7, BORE = 0.28;
const DWELL_MS = 250, TURN_MS = 1000, TAU = Math.PI * 2;
const state = { gl: false, quality: 'pending', segments: 0, points: POINTS, vertexCount: 0, maps: 'pending', turns: 0, turn: 0, turning: false, tinted: false, renders: 0 };

// One self-contained builder (no outer references): it is stringified into the worker, and called directly as the fallback.
// Height field: fine turning grooves along the profile (v) plus 24 flutes around it (u), so a revolution reads.
function buildMaps(w, h) {
  const height = (x, y) => {
    const u = ((x % w) + w) % w / w, v = Math.min(h - 1, Math.max(0, y)) / h;
    const groove = 0.5 + 0.5 * Math.sin(v * Math.PI * 2 * 28);
    const flute = Math.max(0, 1 - Math.abs(((u * 24) % 1) - 0.5) * 12);
    return groove * 0.25 + flute;
  };
  const normal = new Uint8Array(w * h * 4), rough = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (height(x + 1, y) - height(x - 1, y)) * 2, dy = (height(x, y + 1) - height(x, y - 1)) * 2;
    const len = Math.hypot(dx, dy, 1), i = (y * w + x) * 4;
    normal[i] = (-dx / len * 0.5 + 0.5) * 255; normal[i + 1] = (-dy / len * 0.5 + 0.5) * 255; normal[i + 2] = (1 / len * 0.5 + 0.5) * 255; normal[i + 3] = 255;
    const g = (0.55 - Math.min(1, height(x, y)) * 0.35) * 255; // flutes are polished: lower roughness in G
    rough[i] = rough[i + 1] = rough[i + 2] = g; rough[i + 3] = 255;
  }
  return { normal, rough };
}

function mapsInWorker(w, h) {
  return new Promise((resolve, reject) => {
    const src = `const buildMaps = ${buildMaps.toString()};\nonmessage = (e) => { const m = buildMaps(e.data.w, e.data.h); postMessage(m, [m.normal.buffer, m.rough.buffer]); };`;
    const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
    let worker;
    const done = (fn, arg) => { clearTimeout(timer); worker?.terminate(); URL.revokeObjectURL(url); fn(arg); };
    const timer = setTimeout(() => done(reject, new Error('worker timeout')), 1500);
    try { worker = new Worker(url); } catch (e) { return done(reject, e); }
    worker.onmessage = (e) => done(resolve, e.data);
    worker.onerror = (e) => { e.preventDefault(); done(reject, new Error('worker error')); };
    worker.postMessage({ w, h });
  });
}

async function maps(size) {
  if (new URLSearchParams(location.search).get('worker') !== '0') {
    try { const m = await mapsInWorker(size, size); state.maps = 'worker'; return m; } catch {}
  }
  state.maps = 'main';
  return buildMaps(size, size);
}

// The profile: a waist (cos 2πt is 1 at both ends) plus a cosine ripple faded by sin πt, so the ends meet the ring faces exactly.
function profile() {
  return Array.from({ length: POINTS }, (_, i) => {
    const t = i / (POINTS - 1);
    const r = RADIUS * (WAIST + (1 - WAIST) * (0.5 + 0.5 * Math.cos(TAU * t))) + RIPPLE * Math.cos(TAU * RIPPLES * t) * Math.sin(Math.PI * t);
    return new THREE.Vector2(r, (t - 0.5) * HEIGHT);
  });
}

async function start() {
  const quality = await detectQualityTier({ sampleMs: 300 });
  state.quality = quality.tier;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { return false; }
  renderer.setClearColor(0x000000, 0);
  const segments = quality.tier === 'high' ? 160 : quality.tier === 'mid' ? 112 : 72;
  const m = await maps(quality.tier === 'high' ? 512 : 256);
  const size = quality.tier === 'high' ? 512 : 256;

  const css = (n) => getComputedStyle(html).getPropertyValue(n).trim();
  const base = new THREE.Color(css('--accent') || '#ffc800');
  const tint = new THREE.Color(css('--ink') || '#f4f2ee');
  const tex = (data) => { const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat); t.wrapS = THREE.RepeatWrapping; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.needsUpdate = true; return t; };
  const normalMap = tex(m.normal), roughnessMap = tex(m.rough);
  const wall = new THREE.MeshStandardMaterial({ color: base, metalness: 0.15, roughness: 1, normalMap, roughnessMap, normalScale: new THREE.Vector2(0.6, 0.6), side: THREE.DoubleSide });
  const face = new THREE.MeshStandardMaterial({ color: base, metalness: 0.15, roughness: 0.4, side: THREE.DoubleSide });

  const outer = new THREE.LatheGeometry(profile(), segments);
  const bore = new THREE.LatheGeometry([new THREE.Vector2(BORE, HEIGHT / 2), new THREE.Vector2(BORE, -HEIGHT / 2)], segments);
  const ring = new THREE.RingGeometry(BORE, RADIUS, segments, 1);
  state.segments = segments;
  state.vertexCount = outer.attributes.position.count;

  const object = new THREE.Group();
  const top = new THREE.Mesh(ring, face); top.rotation.x = -Math.PI / 2; top.position.y = HEIGHT / 2;
  const bottom = new THREE.Mesh(ring, face); bottom.rotation.x = Math.PI / 2; bottom.position.y = -HEIGHT / 2;
  object.add(new THREE.Mesh(outer, wall), new THREE.Mesh(bore, face), top, bottom);
  const tilt = new THREE.Group(); tilt.rotation.set(0.5, 0, -0.18); tilt.add(object);

  const scene = new THREE.Scene();
  scene.add(tilt, new THREE.HemisphereLight(0xffffff, 0x333333, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2); rim.position.set(-4, 1, -3);
  scene.add(key, rim);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 7.5);

  const render = () => { object.rotation.y = state.turn; renderer.render(scene, camera); state.renders++; };
  const resize = () => {
    const r = figure.getBoundingClientRect();
    renderer.setPixelRatio(quality.dpr);
    renderer.setSize(Math.round(r.width), Math.round(r.height), false);
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
    render();
  };
  const ro = new ResizeObserver(resize); ro.observe(figure);
  resize();

  // One quantised revolution: from n·2π to (n+1)·2π, eased, and set exactly on the last frame so it always lands on a whole turn.
  let dwell = 0, turnStart = 0, stopLoop = null;
  const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
  const loop = (dt, now) => {
    if (!turnStart) turnStart = now;
    const p = Math.min(1, (now - turnStart) / TURN_MS);
    state.turn = (state.turns + ease(p)) * TAU;
    if (p === 1) { state.turns++; state.turn = state.turns * TAU; state.turning = false; stopLoop(); stopLoop = null; }
    render();
  };
  const turnOnce = () => { if (state.turning) return; state.turning = true; turnStart = 0; stopLoop = ticker.add(loop); };

  figure.addEventListener('pointerenter', (e) => {
    if (tier === 'static' || e.pointerType !== 'mouse' || !fine.matches) return;
    if (tier === 'reduced') { state.tinted = true; wall.color.copy(base).lerp(tint, 0.35); face.color.copy(wall.color); render(); return; }
    clearTimeout(dwell); dwell = setTimeout(turnOnce, DWELL_MS);
  });
  figure.addEventListener('pointerleave', () => {
    clearTimeout(dwell);
    if (state.tinted) { state.tinted = false; wall.color.copy(base); face.color.copy(base); render(); }
  });

  // Centre and corner pixels, read from the default framebuffer right after a fresh render in the same task.
  window.__lathe = {
    sample() {
      render();
      const gl = renderer.getContext(), w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
      const at = (x, y) => { const px = new Uint8Array(4); gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return Array.from(px); };
      return { centre: at(w >> 1, h >> 1), corner: at(2, 2) };
    },
  };

  addEventListener('pagehide', () => {
    stopLoop?.(); ro.disconnect();
    [outer, bore, ring, wall, face, normalMap, roughnessMap].forEach((x) => x.dispose());
    renderer.dispose();
  }, { once: true });
  html.classList.add('gl-active');
  readout.textContent = `webgl · ${quality.tier} · maps ${state.maps}`;
  state.gl = true;
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (glPossible) { if (!(await start())) readout.textContent = 'dom (webgl failed)'; }
else readout.textContent = 'dom (no webgl)';

awards.addState(() => ({
  motion: tier,
  pointerFine: fine.matches,
  ...state,
  turn: Math.round(state.turn * 1e4) / 1e4,
  pixels: state.gl ? window.__lathe.sample() : null,
}));
awards.ready();
