import * as THREE from 'three';
import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier, applyRendererBudget } from '../_shared/quality-tiers.js';
import { ticker, clamp } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const film = document.querySelector('[data-film]');
const canvas = document.querySelector('[data-gl]');
const readout = document.querySelector('[data-gl-readout]');
const beatEl = document.querySelector('[data-beat]');
const progressEl = document.querySelector('[data-progress]');
const rail = document.querySelector('[data-rail]');
const fill = document.querySelector('[data-fill]');

// ── The progress line ────────────────────────────────────────────────────────────────────────────────
// Scene windows: each owns a range of progress. A neighbour is switched on half-way into the window before it
// and the one behind is switched off half-way into the next, unless a window overrides the threshold
// (`dropPrevAt` below keeps the Core → Fold hand-off live a little longer).
const SEGMENTS = [
  { name: 'Orbit', from: 0, to: 0.2 },
  { name: 'Lattice', from: 0.2, to: 0.4 },
  { name: 'Core', from: 0.4, to: 0.6 },
  { name: 'Fold', from: 0.6, to: 0.8, dropPrevAt: 0.75 },
  { name: 'Arrival', from: 0.8, to: 1 },
];
// Stretch bands: progress ranges that cost `factor` × the scroll. Overlapping bands are discarded, not merged.
const BANDS = [
  { from: 0.24, to: 0.36, factor: 2 },
  { from: 0.62, to: 0.72, factor: 1.5 },
];
const FILM_SECONDS = 14; // the film's length at full speed
const K = 4;             // the clock may move at most K × dt / FILM_SECONDS per frame
const N = SEGMENTS.length;

// Fold the bands into one piecewise-linear map: knots {p (progress), r (raw)}, r normalised to 0..1.
function buildMap(bands) {
  const kept = [];
  for (const b of [...bands].sort((a, c) => a.from - c.from)) if (!kept.some((k) => b.from < k.to && b.to > k.from)) kept.push(b);
  const cuts = [0, ...kept.flatMap((b) => [b.from, b.to]), 1];
  const factorAt = (p) => kept.find((b) => p >= b.from && p < b.to)?.factor ?? 1;
  const knots = [{ p: 0, r: 0 }];
  for (let i = 1; i < cuts.length; i++) knots.push({ p: cuts[i], r: knots[i - 1].r + (cuts[i] - cuts[i - 1]) * factorAt(cuts[i - 1]) });
  const total = knots.at(-1).r;
  knots.forEach((k) => (k.r /= total));
  return { kept, knots };
}
const { kept, knots } = buildMap(BANDS);
function interp(x, from, to) {
  for (let i = 1; i < knots.length; i++) {
    const a = knots[i - 1], b = knots[i];
    if (x <= b[from] || i === knots.length - 1) {
      const span = b[from] - a[from];
      return span > 0 ? a[to] + (b[to] - a[to]) * clamp((x - a[from]) / span, 0, 1) : b[to];
    }
  }
  return x;
}
const rawToProgress = (r) => interp(clamp(r, 0, 1), 'r', 'p');
const progressToRaw = (p) => interp(clamp(p, 0, 1), 'p', 'r');

const mid = (i) => (SEGMENTS[i].from + SEGMENTS[i].to) / 2;
const preloadAt = (i) => (i === 0 ? -Infinity : SEGMENTS[i - 1].preloadNextAt ?? mid(i - 1));
const dropAt = (i) => (i === N - 1 ? Infinity : SEGMENTS[i + 1].dropPrevAt ?? mid(i + 1));
const windowsAt = (p) => SEGMENTS.map((_, i) => p >= preloadAt(i) && p < dropAt(i));
const segmentAt = (p) => { const i = SEGMENTS.findIndex((s) => p < s.to); return i < 0 ? N - 1 : i; };

// Rail: band blocks and window ticks drawn from the same tables.
for (const b of kept) { const el = document.createElement('span'); el.className = 'rail__band'; el.style.left = `${b.from * 100}%`; el.style.width = `${(b.to - b.from) * 100}%`; rail.appendChild(el); }
for (const s of SEGMENTS.slice(1)) { const el = document.createElement('span'); el.className = 'rail__tick'; el.style.left = `${s.from * 100}%`; rail.appendChild(el); }

// ── Scroll → raw → target → clock ──────────────────────────────────────────────────────────────────
// Lenis 1.3 has autoRaf off by default: the shared ticker drives it, first thing in the frame.
const lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: motionTier() === 'full' });
window.lenis = lenis;
const S = { gl: false, tier: 'pending', raw: 0, target: 0, clock: 0, shown: -1, maxRatio: 0, frames: 0, enabled: windowsAt(0) };
const trackPx = () => Math.max(1, film.offsetHeight - innerHeight);
const readRaw = () => clamp((scrollY - film.offsetTop) / trackPx(), 0, 1);
// A wheel starts a new measurement of how hard the cap had to work.
addEventListener('wheel', () => { S.maxRatio = 0; }, { passive: true });

let renderScene = null;
let dirty = true;
function update(p) {
  // Windows are toggled, never destroyed: a scene switched off keeps its GPU resources for the way back.
  const enabled = windowsAt(p);
  if (enabled.some((e, i) => e !== S.enabled[i])) { S.enabled = enabled; dirty = true; }
  const seg = segmentAt(p);
  beatEl.textContent = `${String(seg + 1).padStart(2, '0')} · ${SEGMENTS[seg].name}`;
  progressEl.textContent = String(Math.round(p * 100)).padStart(3, '0');
  fill.style.transform = `scaleX(${p})`;
}

function seek(p) {
  p = clamp(p, 0, 1);
  lenis.scrollTo(film.offsetTop + progressToRaw(p) * trackPx(), { immediate: true, force: true });
  S.raw = readRaw(); S.target = rawToProgress(S.raw); S.clock = S.target; S.maxRatio = 0;
  dirty = true;
}
awards.setScroller(async (p) => { seek(p); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });

ticker.add((dt, t) => {
  lenis.raf(t);
  const tier = motionTier();
  S.raw = readRaw();
  S.target = rawToProgress(S.raw);
  // The speed limit: however far the target jumps, the clock moves at most K × dt / FILM_SECONDS this frame.
  const cap = (K * dt) / FILM_SECONDS;
  const step = clamp(S.target - S.clock, -cap, cap);
  S.clock += step;
  if (cap > 0 && step !== 0) S.maxRatio = Math.max(S.maxRatio, Math.abs(step) / cap);
  // Reduced and static: one settled frame per beat, the middle of the window the scroll is in. No glide.
  const p = tier === 'full' ? S.clock : mid(segmentAt(S.target));
  if (p !== S.shown) { S.shown = p; dirty = true; update(p); }
  S.frames++;
  renderScene?.(dt, tier, p);
});

// ── The scenes: generated geometry only, one group per window ─────────────────────────────────────────
async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false }); } catch { return false; }
  const profile = await detectQualityTier({ sampleMs: 300 });
  S.tier = profile.tier;
  const css = getComputedStyle(html);
  const ground = new THREE.Color(css.getPropertyValue('--ground').trim() || '#1a1c1c');
  const ink = new THREE.Color(css.getPropertyValue('--ink').trim() || '#f4f2ee');
  const accent = new THREE.Color(css.getPropertyValue('--accent').trim() || '#ffc800');
  const scene = new THREE.Scene();
  scene.background = ground;
  scene.fog = new THREE.Fog(ground, 6, 22);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x202020, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(3, 6, 5); scene.add(key);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 60);

  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.1, flatShading: true, ...extra });
  const builders = [
    () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.08, 12, 96), mat(ink))); const moon = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 16), mat(accent)); moon.position.set(1.8, 0, 0); g.add(moon); g.rotation.x = 1.1; return g; },
    () => { const geo = new THREE.BoxGeometry(0.34, 0.34, 0.34); const m = new THREE.InstancedMesh(geo, mat(ink), 49); const o = new THREE.Object3D(); let n = 0; for (let x = -3; x <= 3; x++) for (let y = -3; y <= 3; y++) { o.position.set(x * 0.55, y * 0.55, Math.sin(x * 1.3 + y) * 0.4); o.updateMatrix(); m.setMatrixAt(n++, o.matrix); } const g = new THREE.Group(); g.add(m); return g; },
    () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), mat(accent))); return g; },
    () => { const geo = new THREE.PlaneGeometry(3.6, 2.4, 12, 8); const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.abs(Math.sin(pos.getX(i) * 1.7)) * 0.5); geo.computeVertexNormals(); const g = new THREE.Group(); g.add(new THREE.Mesh(geo, mat(ink, { side: THREE.DoubleSide }))); return g; },
    () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.3, 160, 16), mat(accent))); return g; },
  ];
  const SPACING = 12;
  const groups = builders.map((build, i) => { const g = build(); g.position.set(i % 2 ? 0.9 : -0.9, 0, -i * SPACING); g.visible = false; scene.add(g); return g; });

  const resize = () => { const w = innerWidth, h = innerHeight; applyRendererBudget(renderer, profile, w, h); camera.aspect = w / h; camera.fov = w < h ? 60 : 45; camera.updateProjectionMatrix(); dirty = true; };
  resize(); addEventListener('resize', resize);

  renderScene = (dt, tier, p) => {
    const spin = tier === 'full';
    groups.forEach((g, i) => { g.visible = S.enabled[i]; if (spin && g.visible) g.rotation.y += dt * 0.25; });
    if (!spin && !dirty) return; // reduced and static: draw only when the beat or the size changed
    // One value drives the camera: the window centres sit SPACING apart, the camera 6 units in front.
    const beat = (p - mid(0)) / (mid(1) - mid(0));
    camera.position.set(Math.sin(beat * 1.3) * 0.6, 0.4, 6 - beat * SPACING);
    camera.lookAt(0, 0, -beat * SPACING - 4);
    renderer.render(scene, camera);
    dirty = false;
  };
  html.classList.add('gl-active'); readout.textContent = `webgl · ${profile.tier}`; S.gl = true;
  addEventListener('pagehide', () => {
    renderScene = null;
    scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
    renderer.dispose(); html.classList.remove('gl-active'); S.gl = false;
  }, { once: true });
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (glPossible) { if (!(await start())) readout.textContent = 'dom (webgl failed)'; } else readout.textContent = 'dom (no webgl)';

// Read-only handles for the verify script and for tuning in the console.
window.__film = { SEGMENTS, BANDS: kept, FILM_SECONDS, K, rawToProgress, progressToRaw, preloadAt, dropAt, windowsAt, seek, trackPx, filmTop: () => film.offsetTop, read: () => ({ ...S }) };
const r3 = (n) => Math.round(n * 1000) / 1000;
awards.addState(() => ({
  motion: motionTier(),
  gl: S.gl,
  tier: S.tier,
  raw: r3(S.raw),
  target: r3(S.target),
  clock: r3(S.clock),
  shown: r3(S.shown),
  lead: r3(S.target - S.clock),
  maxRatio: Math.round(S.maxRatio * 1000) / 1000,
  enabled: S.enabled.map((e, i) => (e ? i : -1)).filter((i) => i >= 0),
  frames: S.frames,
}));
awards.ready();
