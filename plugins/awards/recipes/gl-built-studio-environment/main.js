import * as THREE from 'three';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier, applyRendererBudget } from '../_shared/quality-tiers.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const canvas = document.querySelector('[data-gl]');
const frame = canvas.parentElement;
const readout = document.querySelector('[data-gl-readout]');
const buttons = [...document.querySelectorAll('[data-variant]')];
const css = (name, fallback) => getComputedStyle(html).getPropertyValue(name).trim() || fallback;
const state = { gl: false, variant: 'panels', envOn: true, bakeMs: {}, turn: 0, disposed: false };

// Variant "panels": a room of emissive cards rendered once into a cube map. Values above 1 are the point:
// the bake target is half-float, so a strip at 8 stays a hard highlight after PMREM blurs the rough mips.
// Each entry: [width, height, position, value, tint]. Placement is the lighting design; tune it like a photo studio.
const PANELS = [
  [7, 3.5, [0, 6, 1], 2.4, [1, 1, 1]],            // overhead softbox: the broad top highlight
  [0.7, 6, [-6, 0.5, 1.5], 6, [1, 0.97, 0.92]],   // key strip, warm, camera left
  [0.35, 6, [5.5, 0.5, -2.5], 4.5, [0.85, 0.92, 1]], // rim strip, cool, behind right
  [0.08, 2.2, [-3, 2.5, 4], 9, [1, 1, 1]],          // sparkle strips: thin and hot, they make the glints
  [0.08, 2.2, [3.5, -1, 4.5], 8, [1, 1, 1]],
  [5, 2.5, [0, -0.5, 7], 0.5, [0.8, 0.85, 1]],     // front fill, low, so the faces toward camera are not black
  [12, 12, [0, -5, 0], 0.015, [1, 1, 1]],           // dark floor flag: chrome needs black to read as chrome
];

function panelScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0.05, 0.052, 0.06); // the room's walls, between the panels
  const geo = new THREE.PlaneGeometry(1, 1);
  for (const [w, h, pos, value, tint] of PANELS) {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(...tint).multiplyScalar(value), side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat);
    m.scale.set(w, h, 1); m.position.set(...pos); m.lookAt(0, 0, 0);
    scene.add(m);
  }
  return { scene, dispose() { geo.dispose(); scene.traverse((o) => o.material?.dispose()); } };
}

// Variant "painted": an equirectangular 2:1 canvas (top row = straight up). A dark vertical gradient plus soft white bands.
// 8-bit, so nothing exceeds 1: the scene's environmentIntensity carries the extra punch instead.
function paintedTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, 'rgb(70,72,80)'); sky.addColorStop(0.5, 'rgb(22,23,26)'); sky.addColorStop(1, 'rgb(4,4,5)');
  g.fillStyle = sky; g.fillRect(0, 0, 1024, 512);
  const band = (x, y, w, h, alpha, vertical) => {
    const grad = vertical ? g.createLinearGradient(x, 0, x + w, 0) : g.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, 'rgba(255,255,255,0)'); grad.addColorStop(0.5, `rgba(255,255,255,${alpha})`); grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(x, y, w, h);
  };
  band(0, 40, 1024, 70, 1, false);        // overhead band
  band(150, 120, 60, 260, 1, true);       // key strip
  band(690, 140, 30, 220, 0.9, true);     // rim strip
  band(470, 170, 10, 120, 1, true);       // sparkle
  band(0, 250, 1024, 40, 0.25, false);    // horizon wash
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { return false; }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);
  const profile = await detectQualityTier({ sampleMs: 300 });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 4 / 3, 0.1, 50);
  camera.position.set(0, 0.4, 9); camera.lookAt(0, 0, 0);

  // No lights in this scene: the environment is the only light source.
  const seg = profile.tier === 'high' ? [220, 36] : profile.tier === 'mid' ? [160, 24] : [96, 16];
  const knotGeo = new THREE.TorusKnotGeometry(0.72, 0.26, seg[0], seg[1]);
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.1, clearcoat: 0.25, clearcoatRoughness: 0.3 });
  const knot = new THREE.Mesh(knotGeo, chrome);
  knot.position.x = -1.1;
  const ballGeo = new THREE.SphereGeometry(0.75, 64, 32);
  const coat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(css('--accent', '#ffc800')), metalness: 0, roughness: 0.5, clearcoat: 1, clearcoatRoughness: 0.04 });
  const ball = new THREE.Mesh(ballGeo, coat);
  ball.position.x = 1.5;
  scene.add(knot, ball);

  // Bake on demand, once per variant, then keep the target. One PMREMGenerator per bake, disposed straight after.
  const size = profile.tier === 'high' ? 512 : 256;
  const baked = {};
  const BAKES = {
    panels: () => { const s = panelScene(); const pm = new THREE.PMREMGenerator(renderer); const rt = pm.fromScene(s.scene, 0.02, 0.1, 50, { size }); pm.dispose(); s.dispose(); return { rt, intensity: 1 }; },
    painted: () => { const t = paintedTexture(); const pm = new THREE.PMREMGenerator(renderer); const rt = pm.fromEquirectangular(t); pm.dispose(); t.dispose(); return { rt, intensity: 2.2 }; },
  };
  let dirty = true;
  function applyEnv() {
    const name = state.variant;
    if (!baked[name]) { const t0 = performance.now(); baked[name] = BAKES[name](); state.bakeMs[name] = Math.round(performance.now() - t0); }
    scene.environment = state.envOn ? baked[name].rt.texture : null;
    scene.environmentIntensity = baked[name].intensity;
    dirty = true;
  }
  applyEnv();

  function resize() {
    const r = frame.getBoundingClientRect();
    applyRendererBudget(renderer, profile, Math.round(r.width), Math.round(r.height));
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
    dirty = true;
  }
  resize();
  addEventListener('resize', resize);

  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(frame);
  const animate = motionTier() === 'full'; // lighting is not motion: reduced and static still render, they just hold still
  const unsubscribe = ticker.add((dt) => {
    if (!visible) return;
    if (animate) { state.turn += dt * 0.35; knot.rotation.set(0.3 + Math.sin(state.turn * 0.6) * 0.15, state.turn, 0); dirty = true; }
    if (dirty) { renderer.render(scene, camera); dirty = false; }
  });
  if (!animate) knot.rotation.set(0.3, 0.6, 0);

  for (const b of buttons) b.addEventListener('click', () => {
    state.variant = b.dataset.variant;
    for (const o of buttons) o.setAttribute('aria-pressed', String(o === b));
    readout.textContent = `webgl · ${state.variant}`;
    applyEnv();
  });

  // Luminance stats over the chrome object's covered pixels. Render and read in the same task (no preserveDrawingBuffer).
  const box = new THREE.Box3(), v = new THREE.Vector3();
  function measure() {
    renderer.render(scene, camera);
    const gl = renderer.getContext();
    const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
    box.setFromObject(knot);
    let x0 = w, x1 = 0, y0 = h, y1 = 0;
    for (let i = 0; i < 8; i++) {
      v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(camera);
      const px = (v.x * 0.5 + 0.5) * w, py = (v.y * 0.5 + 0.5) * h;
      x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
    }
    x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(w, Math.ceil(x1)); y1 = Math.min(h, Math.ceil(y1));
    const rw = x1 - x0, rh = y1 - y0;
    if (rw <= 0 || rh <= 0) return null;
    const px = new Uint8Array(rw * rh * 4);
    gl.readPixels(x0, y0, rw, rh, gl.RGBA, gl.UNSIGNED_BYTE, px);
    let n = 0, sum = 0, sq = 0, max = 0;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] < 250) continue; // only pixels fully covered by an object
      const l = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
      n++; sum += l; sq += l * l; if (l > max) max = l;
    }
    const mean = n ? sum / n : 0;
    const r3 = (x) => Math.round(x * 1000) / 1000;
    return { n, mean: r3(mean), std: r3(n ? Math.sqrt(Math.max(0, sq / n - mean * mean)) : 0), max: r3(max) };
  }

  window.__studio = {
    setEnv(on) { state.envOn = !!on; applyEnv(); return true; },
    measure,
  };
  html.classList.add('gl-active');
  readout.textContent = `webgl · ${state.variant}`;
  state.gl = true;
  state.tier = profile.tier;
  addEventListener('pagehide', () => {
    unsubscribe(); io.disconnect();
    for (const b of Object.values(baked)) b.rt.dispose();
    knotGeo.dispose(); ballGeo.dispose(); chrome.dispose(); coat.dispose(); renderer.dispose();
    html.classList.remove('gl-active'); state.gl = false; state.disposed = true;
  }, { once: true });
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (!glPossible) readout.textContent = 'dom (no webgl)';
else if (!(await start())) readout.textContent = 'dom (webgl failed)';

awards.addState(() => ({
  motion: motionTier(),
  gl: state.gl,
  tier: state.tier ?? null,
  variant: state.variant,
  envOn: state.envOn,
  bakeMs: state.bakeMs,
  turn: Math.round(state.turn * 1000) / 1000,
  chrome: state.gl ? window.__studio.measure() : null,
}));
awards.ready();
