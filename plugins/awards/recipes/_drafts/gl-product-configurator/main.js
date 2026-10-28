import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { awards } from '../../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';
import { detectQualityTier, applyRendererBudget } from '../../_shared/quality-tiers.js';
import { clamp } from '../../_shared/raf.js';

// A product configurator. A table lamp built in code sits on a clamped, damped orbit (drag, or arrow keys on the
// focused view, which is a slider for the turn). Three native radio groups choose colour, finish and shade; each change
// tweens the lacquer or the shade's morph targets from their current values (.4 s, interruptible), updates the price,
// the spec line and a polite summary at once, and writes the configuration to the URL, which restores it on load.
// The renderer draws only while the view settles or a tween runs. Static tier, ?nogl or no WebGL2: a CSS lamp.

syncMotionTierAttribute();
const html = document.documentElement;
const $ = (q) => document.querySelector(q);
const form = $('[data-form]'), view = $('[data-view]'), canvas = $('[data-gl]'), preview = $('[data-preview]');
const resetBtn = $('[data-reset]'), hint = $('[data-hint]');
const out = { price: $('[data-price]'), spec: $('[data-spec]'), summary: $('[data-summary]'), share: $('[data-share]'), status: $('[data-status]'), bag: $('[data-bag]'), legend: $('[data-legend="colour"]') };
const NO_GL = new URLSearchParams(location.search).has('nogl');

// The catalogue: every option's look, price and words in one place. Prices are whole pounds, formatted by Intl.
const OPTIONS = {
  colour: {
    chalk: { label: 'Chalk', hex: '#e6e1d6' },
    clay: { label: 'Clay', hex: '#b4613f' },
    moss: { label: 'Moss', hex: '#5f6e47' },
    ink: { label: 'Ink', hex: '#262a33' },
    saffron: { label: 'Saffron', hex: '#d7a032' },
  },
  // Clearcoat never reaches 0: crossing 0 recompiles the physical material's program mid-tween.
  finish: {
    matte: { label: 'Matte', price: 0, roughness: 0.82, clearcoat: 0.02, clearcoatRoughness: 0.8, envMapIntensity: 0.6, sheen: 0.06 },
    satin: { label: 'Satin', price: 15, roughness: 0.48, clearcoat: 0.25, clearcoatRoughness: 0.35, envMapIntensity: 0.9, sheen: 0.28 },
    gloss: { label: 'Gloss', price: 30, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.2, sheen: 0.6 },
  },
  shade: {
    dome: { label: 'Dome', price: 240, size: 'Ø 38 cm, 52 cm tall', morph: [0, 0] },
    cone: { label: 'Cone', price: 225, size: 'Ø 34 cm, 55 cm tall', morph: [1, 0] },
    drum: { label: 'Drum', price: 260, size: 'Ø 30 cm, 50 cm tall', morph: [0, 1] },
  },
};
const DEFAULTS = { colour: 'clay', finish: 'satin', shade: 'dome' };
const money = new Intl.NumberFormat(html.lang || 'en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const TWEEN = { duration: 0.4, ease: 'power2.out' };

// The orbit: azimuth θ (0 = front, positive = the camera to the right) and polar φ from straight up, both clamped.
const DEG = Math.PI / 180;
const THETA = [-50 * DEG, 50 * DEG], PHI = [1.1, 1.5];
const HOME = { theta: 20 * DEG, phi: 1.32 };
const ARRIVAL = -45 * DEG;           // full tier: the view turns in from 25° left of front on first draw
const K = 0.002;                     // damping: the share of the remaining distance left after one second
const STEP = 10 * DEG, PAGE = 25 * DEG;
const goal = { ...HOME }, cam = { ...HOME };

const state = { tier: motionTier(), mode: 'pending', quality: 'pending', config: { ...DEFAULTS }, renders: 0, drags: 0, keys: 0, glCreated: false, adds: 0 };
let gl = null;

// One configuration in, everything that shows it out: radios, price, spec, summary, legend, share link and URL.
function readConfig(params) {
  const c = {};
  for (const key of Object.keys(OPTIONS)) c[key] = Object.hasOwn(OPTIONS[key], params.get(key) ?? '') ? params.get(key) : DEFAULTS[key];
  return c;
}
function priceOf(c) { return OPTIONS.shade[c.shade].price + OPTIONS.finish[c.finish].price; }
function words(c) {
  const col = OPTIONS.colour[c.colour].label, fin = OPTIONS.finish[c.finish].label.toLowerCase(), sh = OPTIONS.shade[c.shade];
  return {
    spec: `${sh.label} shade, ${sh.size} · ${fin} lacquer in ${col} · E27 lamp holder, 2.7 m braided cable`,
    summary: `Ostra in ${col}, ${fin}, ${sh.label.toLowerCase()} shade: ${money.format(priceOf(c))}.`,
  };
}
function query(c) {
  const q = new URLSearchParams(location.search);
  for (const [k, v] of Object.entries(c)) q.set(k, v);
  return `?${q}`;
}
function showConfig(c, { writeUrl }) {
  for (const [k, v] of Object.entries(c)) { const input = form.querySelector(`input[name="${k}"][value="${v}"]`); if (input && !input.checked) input.checked = true; }
  const w = words(c);
  out.price.textContent = money.format(priceOf(c));
  out.spec.textContent = w.spec;
  if (out.summary.textContent !== w.summary) out.summary.textContent = w.summary;
  out.legend.textContent = OPTIONS.colour[c.colour].label;
  out.share.href = query(c);
  if (writeUrl) history.replaceState(history.state, '', query(c) + location.hash);
  // The CSS lamp follows the same configuration in every tier.
  preview.dataset.shade = c.shade;
  preview.style.setProperty('--lamp', OPTIONS.colour[c.colour].hex);
  preview.style.setProperty('--sheen', String(OPTIONS.finish[c.finish].sheen));
}
// Option prices as text, through the same formatter as the total.
for (const el of document.querySelectorAll('[data-delta]')) {
  const [group, id] = el.dataset.delta.split(':');
  const p = OPTIONS[group][id].price;
  el.textContent = group === 'shade' ? money.format(p) : p ? `+ ${money.format(p)}` : 'included';
}

// ---------- WebGL: the lamp ----------
const N = 28; // points per shade profile; every shade has the same count so they can be morph targets of one another
// Each profile runs from the shade's top (t 0) to its rim (t 1), in units below the top.
const SHADES = {
  dome: (t) => [0.07 + 0.55 * Math.sin(t * Math.PI / 2), -0.5 * (1 - Math.cos(t * Math.PI / 2))],
  cone: (t) => [0.2 + 0.42 * t, -0.6 * t],
  drum: (t) => [0.5 + 0.02 * t, -0.56 * t],
};
const SHADE_TOP = 1.72;
function shadeGeometry(segments) {
  // Points are fed rim first, so the lathe's front faces (and normals) point out of the shade.
  const make = (fn) => new THREE.LatheGeometry(Array.from({ length: N }, (_, i) => new THREE.Vector2(...fn(1 - i / (N - 1)))), segments);
  const dome = make(SHADES.dome), cone = make(SHADES.cone), drum = make(SHADES.drum);
  dome.morphAttributes.position = [cone.attributes.position, drum.attributes.position];
  dome.morphAttributes.normal = [cone.attributes.normal, drum.attributes.normal];
  return dome;
}
const FOOT = [[0, 0], [0.32, 0], [0.355, 0.012], [0.362, 0.04], [0.33, 0.075], [0.19, 0.095], [0.05, 0.105], [0, 0.108]].map(([x, y]) => new THREE.Vector2(x, y));

function floorShadow() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.42)'); grad.addColorStop(0.5, 'rgba(0,0,0,0.16)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

async function createGL() {
  const profile = await detectQualityTier({ sampleMs: 300 });
  state.quality = profile.tier;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { return null; }
  renderer.setClearColor(0x000000, 0);
  // Khronos PBR Neutral: built for product colour, so the lacquer reads as its swatch.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.03);
  room.dispose?.(); pmrem.dispose();
  scene.environment = env.texture; scene.environmentIntensity = 0.62;
  const key = new THREE.DirectionalLight(0xfff4e6, 1.4); key.position.set(-3, 5, 4);
  const fill = new THREE.DirectionalLight(0xe6eeff, 0.5); fill.position.set(4, 2, 3);
  scene.add(key, fill);

  const segments = profile.tier === 'high' ? 128 : profile.tier === 'mid' ? 96 : 72;
  const start = OPTIONS.finish[state.config.finish];
  const lacquer = new THREE.MeshPhysicalMaterial({ color: OPTIONS.colour[state.config.colour].hex, metalness: 0, roughness: start.roughness, clearcoat: start.clearcoat, clearcoatRoughness: start.clearcoatRoughness, envMapIntensity: start.envMapIntensity });
  const lining = new THREE.MeshStandardMaterial({ color: 0xfff3df, emissive: 0xffd8a0, emissiveIntensity: 0.5, roughness: 0.9, side: THREE.BackSide });
  const brass = new THREE.MeshStandardMaterial({ color: 0xdcbc78, metalness: 1, roughness: 0.26 });
  const ash = new THREE.MeshStandardMaterial({ color: 0xb59c7a, roughness: 0.62 });
  const cord = new THREE.MeshStandardMaterial({ color: 0x2e2c29, roughness: 0.9 });
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfff1d6 });
  const shadowMat = new THREE.MeshBasicMaterial({ map: floorShadow(), transparent: true, depthWrite: false });

  const shadeGeo = shadeGeometry(segments);
  const footGeo = new THREE.LatheGeometry(FOOT, segments);
  const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.4, 20).translate(0, 0.1 + 0.7, 0);
  const bulbGeo = new THREE.SphereGeometry(0.085, 24, 16).translate(0, 1.5, 0);
  const shadowGeo = new THREE.PlaneGeometry(1.9, 1.9).rotateX(-Math.PI / 2);
  // Two details that are not round, so the turn reads: a braided cord leaving the foot and a switch knob on it.
  const cordGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-0.06, 0.03, -0.3], [-0.16, 0.012, -0.52], [-0.5, 0.012, -0.72], [-1.05, 0.012, -0.62], [-1.9, 0.012, -0.95]].map((p) => new THREE.Vector3(...p))), 64, 0.012, 8);
  const knobGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.045, 20).translate(0.2, 0.1, 0.16);
  const outer = new THREE.Mesh(shadeGeo, lacquer), inner = new THREE.Mesh(shadeGeo, lining);
  outer.position.y = inner.position.y = SHADE_TOP;
  const shadow = new THREE.Mesh(shadowGeo, shadowMat); shadow.position.y = 0.002;
  scene.add(outer, inner, new THREE.Mesh(footGeo, ash), new THREE.Mesh(stemGeo, brass), new THREE.Mesh(bulbGeo, bulbMat), new THREE.Mesh(cordGeo, cord), new THREE.Mesh(knobGeo, brass), shadow);
  const shape = { cone: OPTIONS.shade[state.config.shade].morph[0], drum: OPTIONS.shade[state.config.shade].morph[1] };

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  const target = new THREE.Vector3(0, 0.9, 0);
  let radius = 6;
  function resize() {
    const r = view.getBoundingClientRect();
    if (!r.width || !r.height) return;
    applyRendererBudget(renderer, profile, Math.round(r.width), Math.round(r.height));
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
    // Fit 2.0 × 2.35 units (the widest shade and the whole height, with air) in either direction.
    const t = Math.tan((camera.fov / 2) * DEG);
    radius = Math.max(2.35 / 2 / t, 2.0 / 2 / (t * camera.aspect));
  }
  function render() {
    const s = Math.sin(cam.phi);
    camera.position.set(target.x + radius * s * Math.sin(cam.theta), target.y + radius * Math.cos(cam.phi), target.z + radius * s * Math.cos(cam.theta));
    camera.lookAt(target);
    outer.morphTargetInfluences[0] = inner.morphTargetInfluences[0] = shape.cone;
    outer.morphTargetInfluences[1] = inner.morphTargetInfluences[1] = shape.drum;
    renderer.render(scene, camera);
    state.renders++;
  }

  // Render on demand: a GSAP ticker listener that exists only while the view settles or a tween runs.
  let running = false;
  const tweening = () => gsap.isTweening(lacquer.color) || gsap.isTweening(lacquer) || gsap.isTweening(shape);
  function frame(time, deltaTime) {
    if (state.mode !== 'gl') { stop(); return; }
    const f = 1 - Math.pow(K, Math.min(0.5, deltaTime / 1000));
    let settled = true;
    for (const k of ['theta', 'phi']) {
      cam[k] += (goal[k] - cam[k]) * f;
      if (Math.abs(goal[k] - cam[k]) < 1e-4) cam[k] = goal[k]; else settled = false;
    }
    render();
    if (settled && !tweening()) stop();
  }
  function stop() { running = false; gsap.ticker.remove(frame); }
  function invalidate() { if (!running && state.mode === 'gl') { running = true; gsap.ticker.add(frame); } }

  // Material and shape changes: from the current value, or a set under reduced motion.
  function apply(c, animate) {
    const col = new THREE.Color(OPTIONS.colour[c.colour].hex);
    const { roughness, clearcoat, clearcoatRoughness, envMapIntensity } = OPTIONS.finish[c.finish];
    const [coneW, drumW] = OPTIONS.shade[c.shade].morph;
    const go = (target, vars) => (animate ? gsap.to(target, { ...vars, ...TWEEN, overwrite: true, onUpdate: invalidate }) : (gsap.killTweensOf(target), gsap.set(target, vars)));
    go(lacquer.color, { r: col.r, g: col.g, b: col.b });
    go(lacquer, { roughness, clearcoat, clearcoatRoughness, envMapIntensity });
    go(shape, { cone: coneW, drum: drumW });
    invalidate();
  }

  const ro = new ResizeObserver(() => { resize(); invalidate(); });
  ro.observe(view);
  resize();
  // Compile every program (morph targets and clearcoat included) before the first frame, so no choice compiles later.
  await renderer.compileAsync(scene, camera);

  const v = new THREE.Vector3();
  return {
    apply, invalidate,
    read: () => ({
      colour: `#${lacquer.color.getHexString()}`,
      roughness: Number(lacquer.roughness.toFixed(4)), clearcoat: Number(lacquer.clearcoat.toFixed(4)),
      clearcoatRoughness: Number(lacquer.clearcoatRoughness.toFixed(4)), envMapIntensity: Number(lacquer.envMapIntensity.toFixed(4)),
      morph: [Number(shape.cone.toFixed(4)), Number(shape.drum.toFixed(4))], running, tweening: tweening(),
    }),
    // A point on the shade's front, in page pixels, for the verifier's pixel read.
    shadePoint: () => {
      const r = view.getBoundingClientRect();
      v.set(Math.sin(cam.theta) * 0.5, SHADE_TOP - 0.3, Math.cos(cam.theta) * 0.5).project(camera);
      return [Math.round(r.left + ((v.x + 1) / 2) * r.width), Math.round(r.top + ((1 - v.y) / 2) * r.height)];
    },
    dispose() {
      stop(); ro.disconnect();
      gsap.killTweensOf([lacquer.color, lacquer, shape]);
      [shadeGeo, footGeo, stemGeo, bulbGeo, shadowGeo, cordGeo, knobGeo, lacquer, lining, brass, ash, cord, bulbMat, shadowMat, shadowMat.map, env].forEach((x) => x.dispose());
      renderer.dispose();
    },
  };
}

// ---------- the orbit: drag, keys, reset ----------
const fmtTurn = (rad) => { const d = Math.round(rad / DEG); return d === 0 ? 'front on' : `${Math.abs(d)}° ${d > 0 ? 'right' : 'left'} of front`; };
function setGoal(theta, phi = goal.phi) {
  goal.theta = clamp(theta, THETA[0], THETA[1]);
  goal.phi = clamp(phi, PHI[0], PHI[1]);
  if (state.tier !== 'full') { cam.theta = goal.theta; cam.phi = goal.phi; }
  view.setAttribute('aria-valuenow', String(Math.round(goal.theta / DEG)));
  view.setAttribute('aria-valuetext', `Viewed ${fmtTurn(goal.theta)}`);
  gl?.invalidate();
}
let drag = null;
view.addEventListener('pointerdown', (e) => {
  if (state.mode !== 'gl' || !e.isPrimary || e.button !== 0) return;
  drag = { x: e.clientX, y: e.clientY };
  view.setPointerCapture(e.pointerId);
  state.drags++;
});
view.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const r = view.getBoundingClientRect();
  setGoal(goal.theta - ((e.clientX - drag.x) / r.width) * 2.4, goal.phi - ((e.clientY - drag.y) / r.height) * 1.6);
  drag = { x: e.clientX, y: e.clientY };
});
const endDrag = () => { drag = null; };
view.addEventListener('pointerup', endDrag);
view.addEventListener('pointercancel', endDrag);
view.addEventListener('keydown', (e) => {
  if (state.mode !== 'gl') return;
  const to = { ArrowRight: goal.theta + STEP, ArrowUp: goal.theta + STEP, ArrowLeft: goal.theta - STEP, ArrowDown: goal.theta - STEP, PageUp: goal.theta + PAGE, PageDown: goal.theta - PAGE, Home: THETA[0], End: THETA[1] }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  state.keys++;
  setGoal(to);
});
resetBtn.addEventListener('click', () => setGoal(HOME.theta, HOME.phi));

// ---------- the options ----------
form.addEventListener('change', (e) => {
  if (!e.target.matches('input[type="radio"]')) return;
  state.config = { ...state.config, [e.target.name]: e.target.value };
  showConfig(state.config, { writeUrl: true });
  gl?.apply(state.config, state.tier === 'full');
});
form.addEventListener('submit', (e) => {
  e.preventDefault();
  state.adds++;
  out.bag.textContent = `Bag (${state.adds})`;
  out.status.textContent = `Added ${words(state.config).summary.replace(/\.$/, '')}. Bag: ${state.adds}. A demo: nothing is charged.`;
});

// ---------- modes and tiers ----------
// gl: the canvas, the view is a slider. css: the CSS lamp, the same form, no orbit.
async function applyTier() {
  state.tier = motionTier();
  const glPossible = !NO_GL && (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
  if (state.tier !== 'static' && glPossible && !state.glCreated) {
    state.glCreated = true;
    // Full tier: the first frames turn the view in from the left (the one automatic turn); reduced starts at rest.
    if (state.tier === 'full') cam.theta = ARRIVAL + HOME.theta;
    gl = await createGL();
  }
  state.mode = state.tier !== 'static' && gl ? 'gl' : 'css';
  const on = state.mode === 'gl';
  html.classList.toggle('gl-active', on);
  hint.hidden = resetBtn.hidden = !on;
  const a11y = { tabindex: '0', role: 'slider', 'aria-label': 'Turn the lamp', 'aria-orientation': 'horizontal', 'aria-valuemin': String(THETA[0] / DEG), 'aria-valuemax': String(THETA[1] / DEG), 'aria-describedby': 'stage-hint' };
  for (const [k, val] of Object.entries(a11y)) (on ? view.setAttribute(k, val) : view.removeAttribute(k));
  if (on) setGoal(goal.theta, goal.phi); else { view.removeAttribute('aria-valuenow'); view.removeAttribute('aria-valuetext'); }
  if (state.tier !== 'full') { cam.theta = goal.theta; cam.phi = goal.phi; }
  gl?.invalidate();
}

state.config = readConfig(new URLSearchParams(location.search));
showConfig(state.config, { writeUrl: false });
await applyTier();
gl?.apply(state.config, false);
onMotionTierChange(() => applyTier());
new MutationObserver(() => applyTier()).observe(html, { attributes: true, attributeFilter: ['data-motion'] });
addEventListener('pagehide', () => gl?.dispose(), { once: true });

const r4 = (n) => Math.round(n * 1e4) / 1e4;
awards.addState(() => {
  const s = getComputedStyle(preview.querySelector('.preview__shade'));
  return {
    tier: state.tier, mode: state.mode, quality: state.quality, glCreated: state.glCreated,
    config: { ...state.config }, renders: state.renders, drags: state.drags, keys: state.keys, adds: state.adds,
    price: out.price.textContent, spec: out.spec.textContent, summary: out.summary.textContent, status: out.status.textContent,
    url: location.search, share: out.share.getAttribute('href'),
    scene: state.mode === 'gl' ? gl.read() : null,
    swatch: OPTIONS.colour[state.config.colour].hex,
    clamp: { theta: THETA.map(r4), phi: PHI },
    cam: { theta: r4(cam.theta), phi: r4(cam.phi) }, goal: { theta: r4(goal.theta), phi: r4(goal.phi) },
    slider: { role: view.getAttribute('role'), now: view.getAttribute('aria-valuenow'), text: view.getAttribute('aria-valuetext') },
    shadePoint: state.mode === 'gl' ? gl.shadePoint() : null,
    preview: { colour: s.backgroundColor, shade: preview.dataset.shade, sheen: preview.style.getPropertyValue('--sheen') },
  };
});
awards.ready();
