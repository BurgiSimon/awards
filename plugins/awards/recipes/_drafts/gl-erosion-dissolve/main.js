import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { awards } from '../../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';
import { detectQualityTier, applyRendererBudget } from '../../_shared/quality-tiers.js';
import { clamp } from '../../_shared/raf.js';

// A resin cone turned from a lathe profile wears one stock MeshStandardMaterial patched by onBeforeCompile: a 3D value
// noise that sticks to the cone, leaned along a world-space axis, is compared with uProgress; fragments under the
// threshold are discarded, a pixel-fine hashed feather leaves an ash crust, and a thin ember band burns just above it.
// Back faces seen through the opening are shaded as the cut itself, so the cone reads solid, not as a hollow shell.
// One ScrollTrigger maps the sticky stage to a progress; the renderer draws only when that progress (or the size)
// changes. Reduced motion: no scrub, each chapter cuts to its own still. Static tier: the whole SVG still. ?nogl, no
// WebGL2 or a lost context: the SVG still, burnt to the same level along a wavy clip.

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();

const html = document.documentElement;
const stage = document.querySelector('[data-stage]');
const figure = document.querySelector('[data-figure]');
const canvas = document.querySelector('[data-gl]');
const still = document.querySelector('[data-still]');
const stillLabel = document.querySelector('[data-still-title]');
const burnEdge = [...document.querySelectorAll('[data-still-burn]')];
const chapters = [...document.querySelectorAll('[data-chapter]')];
const steps = [...document.querySelectorAll('[data-goto]')];
const status = document.querySelector('[data-status]');
const NO_GL = new URLSearchParams(location.search).has('nogl');
// WebGL2 is asked for once, and the test context is released at once: one throwaway context per tier change would
// push the live renderer's out of the browser's budget (Chromium keeps 16) and leave a dead canvas behind.
const HAS_GL2 = !NO_GL && (() => {
  try { const t = document.createElement('canvas').getContext('webgl2'); if (!t) return false; t.getExtension('WEBGL_lose_context')?.loseContext(); return true; } catch { return false; }
})();

// The whole effect is these numbers.
const ERODE = [0.12, 0.88];          // stage progress over which uProgress runs 0 → 1 (held whole before, gone after)
const CHAPTER_AT = [0.3, 0.7];       // chapter boundaries in stage progress
const STILLS = [0, 0.5, 1];          // reduced motion: the still each chapter cuts to
const GOTO = [0.06, 0.5, 0.94];      // where the chapter buttons land
const TURN = 0.8;                    // radians the cone turns across the stage (full tier only)
const SEAM = 2.02;                   // object-space angle of the mould seam: left of centre at turn 0, right of it at .8
const GLOW = 9;                      // peak intensity of the ember's point light, at uProgress .5 (decay 1.5)
const FIELD = { amp: 0.14, freq: 2.6, feather: 0.025, edge: 0.03, grain: 22 };
// The front runs from below every field value (char included) to above every value, so 0 is untouched and 1 is gone.
const FRONT = [-(FIELD.amp + FIELD.feather + 4 * FIELD.edge) - 0.01, 1 + FIELD.amp + 0.01];
const CONE = { base: 0.08, top: 2.68, radius: 0.96 };
const VIEW = { fov: 30, pitch: THREE.MathUtils.degToRad(10), targetY: 1.12 };
// The SVG still is this camera's projection of the same lathe: 200 SVG units per world unit on the target plane, the
// target at 0,0; `rows` is the near face's screen row at h = 0, .1 … 1, `top` and `low` the axis at 75 % and 40 %.
const STILL = { k: 200, rows: [-317.6, -262.9, -207.4, -151.6, -94.8, -37.1, 20.7, 80.2, 139.6, 201.2, 262.4], top: [0, -182.7], low: [0, 0] };
const LABELS = ['Cone No. 7, whole, standing on a glazed dish', 'Cone No. 7, burning down from the tip, an ember at its edge', 'The glazed dish, empty: the cone has burnt away'];

const state = { tier: motionTier(), mode: 'pending', quality: 'pending', p: 0, chapter: 0, level: -1, uProgress: 0, turn: 0, renders: 0, window: null, glCreated: false, lost: 0, label: 0, burnY: 0, points: null };
let gl = null;

// The frame on the target plane: 4.1 × 3.05 units (dish and cone with a margin) on a wide figure; a narrower one trades
// the dish's rim for a larger cone, down to 3 units across at aspect .7 and below. The camera and the still share it.
function frame(aspect) {
  const w = aspect >= 4.1 / 3.05 ? 3.05 * aspect : clamp(3 + ((aspect - 0.7) / 0.2) * 1.1, 3, 4.1);
  return { w, h: w / aspect };
}
function fitStill() {
  const r = figure.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const { w, h } = frame(r.width / r.height), k = STILL.k;
  still.setAttribute('viewBox', [-w / 2 * k, -h / 2 * k, w * k, h * k].map((n) => n.toFixed(1)).join(' '));
}
new ResizeObserver(fitStill).observe(figure);
fitStill();
// The still's row for a front at field value f (linear between the projected rows, extended past both ends).
function stillRow(f) {
  const n = STILL.rows.length - 1, i = clamp(Math.floor(f * n), 0, n - 1);
  return STILL.rows[i] + (STILL.rows[i + 1] - STILL.rows[i]) * (f * n - i);
}

// Lenis smooths the wheel in the full tier only, on GSAP's ticker (autoRaf is off by default in 1.3).
let lenis = null;
const lenisRaf = (time) => lenis?.raf(time * 1000);
function setLenis(on) {
  if (on && !lenis) {
    lenis = new Lenis({ lerp: 0.1, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(lenisRaf);
    window.lenis = lenis;
  } else if (!on && lenis) {
    gsap.ticker.remove(lenisRaf); lenis.destroy(); lenis = null; window.lenis = undefined;
  }
}
gsap.ticker.lagSmoothing(0);

// Stage progress → chapter and erosion level. Full: the level is the scroll (ease none: the scroll is the smoothing).
// Reduced: the chapter's still, so a scroll inside one chapter changes nothing and the next chapter is a cut.
// Static: the whole cone, settled, beside all three chapters.
function update(p) {
  state.p = p;
  const chapter = p < CHAPTER_AT[0] ? 0 : p < CHAPTER_AT[1] ? 1 : 2;
  const level = state.tier === 'full' ? clamp((p - ERODE[0]) / (ERODE[1] - ERODE[0]), 0, 1) : state.tier === 'reduced' ? STILLS[chapter] : 0;
  const turn = state.tier === 'full' ? p * TURN : 0;
  if (chapter !== state.chapter || !chapters.some((c) => c.hasAttribute('data-active'))) {
    state.chapter = chapter;
    chapters.forEach((c, i) => c.toggleAttribute('data-active', i === chapter));
    steps.forEach((b, i) => (i === chapter ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
  }
  if (level !== state.level || turn !== state.turn) {
    state.level = level; state.turn = turn;
    // The still burns too: its wavy clip and ember line sit on the row the GL front reaches at this level.
    state.burnY = Math.round(stillRow(FRONT[0] + (FRONT[1] - FRONT[0]) * level));
    burnEdge.forEach((el) => el.setAttribute('transform', `translate(0 ${state.burnY})`));
    // The image's name follows what it shows (whole, burning, gone), in both modes: the still stays in the tree.
    const label = level <= 0 ? 0 : level >= 1 ? 2 : 1;
    if (label !== state.label) { state.label = label; stillLabel.textContent = LABELS[label]; }
    gl?.invalidate();
  }
}

const trigger = ScrollTrigger.create({
  trigger: stage, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true,
  onUpdate: (self) => update(self.progress),
  onRefresh: (self) => { state.window = [Math.round(self.start), Math.round(self.end)]; update(self.progress); },
});
addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

// Chapter buttons scroll to their chapter: a 1.2 s Lenis glide in the full tier, an instant jump otherwise. The swap of
// copy and figure is silent to a screen reader, so the button's own result is said once, politely (never on scroll).
steps.forEach((b, i) => b.addEventListener('click', () => {
  const y = trigger.start + (trigger.end - trigger.start) * GOTO[i];
  if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else window.scrollTo({ top: y, behavior: 'instant' });
  status.textContent = '';
  requestAnimationFrame(() => { status.textContent = `Chapter ${i + 1} of ${chapters.length}: ${chapters[i].querySelector('.chapter__title').textContent}`; });
}));

// The patch rewrites seven sites (two in the vertex shader, five in the fragment shader); each throws if its chunk is
// missing, so a three upgrade fails loudly instead of drawing a whole cone.
function patch(material, uniforms) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    const swap = (src, chunk, code) => {
      if (!src.includes(chunk)) throw new Error(`erosion patch: ${chunk} not found`);
      return src.replace(chunk, code);
    };
    let v = swap(shader.vertexShader, 'void main() {', 'varying vec3 vErodeObj;\nvarying vec3 vErodeWorld;\nvoid main() {');
    v = swap(v, '#include <project_vertex>', `#include <project_vertex>
      vErodeObj = transformed;
      vErodeWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
    shader.vertexShader = v;

    let f = swap(shader.fragmentShader, 'void main() {', /* glsl */ `
      uniform float uProgress, uEdge, uAmp, uFreq, uFeather, uGrain, uMin, uMax, uSeam;
      uniform vec2 uFront;
      uniform vec3 uAxis, uEmber, uHot, uAsh;
      varying vec3 vErodeObj;
      varying vec3 vErodeWorld;
      // Hash without sine, then trilinear value noise and three octaves summed to 0..1.
      float eHash(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
      float eNoise(vec3 p) {
        vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(eHash(i), eHash(i + vec3(1, 0, 0)), f.x), mix(eHash(i + vec3(0, 1, 0)), eHash(i + vec3(1, 1, 0)), f.x), f.y),
                   mix(mix(eHash(i + vec3(0, 0, 1)), eHash(i + vec3(1, 0, 1)), f.x), mix(eHash(i + vec3(0, 1, 1)), eHash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
      }
      float eFbm(vec3 p) { return 0.5 * eNoise(p) + 0.3 * eNoise(p * 2.03 + 11.0) + 0.2 * eNoise(p * 4.01 + 23.0); }
      void main() {`);
    // The threshold. h runs 0 → 1 along the world axis from the side that goes first; the noise sticks to the cone.
    // Every derivative is taken before the first discard.
    f = swap(f, '#include <clipping_planes_fragment>', /* glsl */ `
      #include <clipping_planes_fragment>
      float eH = (dot(vErodeWorld, uAxis) - uMin) / (uMax - uMin);
      float eN = eFbm(vErodeObj * uFreq);
      float eD = eH + (eN - 0.5) * 2.0 * uAmp;
      float eAA = max(fwidth(eD), 1e-5);
      vec3 eFw = fwidth(vErodeObj);
      float ePx = max(max(eFw.x, eFw.y), max(eFw.z, 1e-5));
      float eX = eD - mix(uFront.x, uFront.y, uProgress);
      if (eX < 0.0) discard;
      // The feather: hashed cells of 1/72 unit, or of one pixel where that is smaller, so a speck is never a block.
      float eSpeck = eHash(floor(vErodeObj / min(1.0 / 72.0, ePx)));
      if (eX < uFeather * eSpeck) discard;
      float eAsh = 1.0 - step(uFeather, eX);
      // Band, core and char widths are in field units or pixels, whichever is wider: none vanishes on a phone.
      float eBand = 1.0 - clamp((eX - uFeather) / max(uEdge, 1.5 * eAA), 0.0, 1.0);
      float eCore = 1.0 - clamp((eX - uFeather) / max(0.3 * uEdge, eAA), 0.0, 1.0);
      float eChar = 1.0 - clamp((eX - uFeather) / max(4.0 * uEdge, 1.5 * eAA), 0.0, 1.0);
      float eGrain = eNoise(vErodeObj * uGrain);`);
    // Pressed-powder grain and a mould seam on the outside, charring just above the band, grey ash in the feather;
    // a back face is the cut seen through the opening: ash, lit as one face.
    f = swap(f, '#include <color_fragment>', /* glsl */ `
      #include <color_fragment>
      float eArc = abs(mod(atan(vErodeObj.z, vErodeObj.x) - uSeam + PI, 2.0 * PI) - PI) * length(vErodeObj.xz);
      float eSeam = 1.0 - smoothstep(0.0, max(0.014, 1.5 * ePx), eArc);
      vec3 eResin = diffuseColor.rgb * (0.82 + 0.36 * eN) * (0.86 + 0.28 * eGrain) * (1.0 - 0.5 * eSeam) * mix(1.0, 0.12, eChar * eChar);
      diffuseColor.rgb = gl_FrontFacing ? mix(eResin, uAsh * (0.7 + 0.6 * eGrain), eAsh) : uAsh * (0.5 + 0.4 * eGrain);`);
    f = swap(f, '#include <normal_fragment_maps>', /* glsl */ `
      #include <normal_fragment_maps>
      if (!gl_FrontFacing) normal = normalize((viewMatrix * vec4(-uAxis, 0.0)).xyz);`);
    // The ember: a thin hot core at the edge of what is left, deep orange over the band; the cut smoulders in patches.
    f = swap(f, '#include <emissivemap_fragment>', /* glsl */ `
      #include <emissivemap_fragment>
      vec3 eGlow = (1.0 - eAsh) * (uEmber * eBand * 1.6 + uHot * eCore * 1.4) + eAsh * uEmber * 0.5 * eSpeck;
      totalEmissiveRadiance += gl_FrontFacing ? eGlow : eGlow + uEmber * 0.9 * smoothstep(0.35, 0.85, eNoise(vErodeObj * 9.0));`);
    shader.fragmentShader = f;
  };
}

// The cone: a lathe profile with a bevelled foot and a rounded tip, sides very slightly concave.
function coneProfile() {
  const pts = [new THREE.Vector2(0, CONE.base), new THREE.Vector2(CONE.radius - 0.02, CONE.base), new THREE.Vector2(CONE.radius, CONE.base + 0.03)];
  const n = 44, tip = CONE.top - 0.07;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    pts.push(new THREE.Vector2(CONE.radius * Math.pow(1 - t, 1.06) * (1 - 0.06 * t) + 0.05 * t, CONE.base + 0.03 + (tip - CONE.base - 0.03) * t));
  }
  pts.push(new THREE.Vector2(0.03, CONE.top - 0.015), new THREE.Vector2(0, CONE.top));
  return pts;
}
const coneRadius = (y) => CONE.radius * clamp((CONE.top - y) / (CONE.top - CONE.base), 0, 1);
// The dish: underside, rim and floor in one profile.
const DISH = [[0, -0.02], [1.15, -0.02], [1.2, 0.02], [1.6, 0.1], [1.85, 0.24], [1.88, 0.275], [1.83, 0.285], [1.6, 0.17], [1.2, 0.09], [0, 0.08]].map(([x, y]) => new THREE.Vector2(x, y));

function shadowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.7)'); grad.addColorStop(0.55, 'rgba(0,0,0,0.35)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

let profile = null;
async function createGL() {
  profile ??= await detectQualityTier({ sampleMs: 300 });
  state.quality = profile.tier;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: profile.tier !== 'low' || devicePixelRatio < 2, alpha: true }); } catch { return null; }
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  // Environment built in code: three's room baked through PMREM once, then thrown away. Two lights for shape.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04);
  room.dispose?.(); pmrem.dispose();
  scene.environment = env.texture; scene.environmentIntensity = 0.35;
  const key = new THREE.DirectionalLight(0xffd9b0, 2.6); key.position.set(-4, 5, 4);
  const rim = new THREE.DirectionalLight(0x9fb4ff, 1.5); rim.position.set(4, 3, -4);
  // The ember's own light: a warm point just in front of the burning front, strongest half-way, so the dish catches it.
  const glow = new THREE.PointLight(0xff5a1a, 0, 0, 1.5);
  scene.add(key, rim, glow, new THREE.HemisphereLight(0xf4e6d8, 0x1a1210, 0.35));

  const segments = profile.tier === 'high' ? 128 : profile.tier === 'mid' ? 96 : 72;
  const coneGeo = new THREE.LatheGeometry(coneProfile(), segments);
  const dishGeo = new THREE.LatheGeometry(DISH, segments);
  const shadowGeo = new THREE.PlaneGeometry(4.8, 4.8).rotateX(-Math.PI / 2);
  const shadowMap = shadowTexture();
  const uniforms = {
    uProgress: { value: 0 }, uEdge: { value: FIELD.edge }, uAmp: { value: FIELD.amp }, uFreq: { value: FIELD.freq }, uFeather: { value: FIELD.feather }, uGrain: { value: FIELD.grain },
    uFront: { value: new THREE.Vector2(...FRONT) }, uSeam: { value: SEAM },
    uAxis: { value: new THREE.Vector3(0, -1, 0) }, uMin: { value: -CONE.top }, uMax: { value: -CONE.base },
    uEmber: { value: new THREE.Color(0.95, 0.12, 0.01) }, uHot: { value: new THREE.Color(1.0, 0.25, 0.03) }, uAsh: { value: new THREE.Color(0.2, 0.19, 0.18) },
  };
  const resin = new THREE.MeshStandardMaterial({ color: 0x8a5a3c, roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
  patch(resin, uniforms);
  const glaze = new THREE.MeshStandardMaterial({ color: 0x4d5f55, roughness: 0.3, metalness: 0 });
  const shade = new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false });
  const cone = new THREE.Mesh(coneGeo, resin);
  const dish = new THREE.Mesh(dishGeo, glaze);
  const shadow = new THREE.Mesh(shadowGeo, shade); shadow.position.y = -0.025;
  scene.add(cone, dish, shadow);

  const camera = new THREE.PerspectiveCamera(VIEW.fov, 1, 0.1, 60);
  const target = new THREE.Vector3(0, VIEW.targetY, 0);
  function resize() {
    const r = figure.getBoundingClientRect();
    if (!r.width || !r.height) return;
    applyRendererBudget(renderer, profile, Math.round(r.width), Math.round(r.height));
    camera.aspect = r.width / r.height;
    const dist = frame(camera.aspect).h / 2 / Math.tan(THREE.MathUtils.degToRad(VIEW.fov / 2));
    camera.position.set(0, target.y + Math.sin(VIEW.pitch) * dist, Math.cos(VIEW.pitch) * dist);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  }

  // Render on demand: one draw on the next tick after something changed, none while the stage is off screen.
  let queued = false, onScreen = true, dirty = true;
  function draw() {
    queued = false;
    if (!onScreen || state.mode !== 'gl') { dirty = true; return; }
    dirty = false;
    uniforms.uProgress.value = state.level;
    cone.rotation.y = state.turn;
    const y = CONE.top - (CONE.top - CONE.base) * clamp(FRONT[0] + (FRONT[1] - FRONT[0]) * state.level, 0, 1);
    glow.position.set(0, y, coneRadius(y) + 0.3);
    glow.intensity = GLOW * Math.sin(Math.PI * state.level);
    renderer.render(scene, camera);
    state.renders++;
    state.uProgress = uniforms.uProgress.value;
  }
  function invalidate() { if (!queued) { queued = true; gsap.ticker.add(draw, true); } }
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen && dirty) invalidate(); });
  io.observe(figure);
  const ro = new ResizeObserver(() => { resize(); invalidate(); });
  ro.observe(figure);
  resize();
  // Compile the patched program before the first scroll, so the stage never stalls on it mid-scrub.
  try { await renderer.compileAsync(scene, camera); } catch { dispose(); return null; }

  // Screen points for the verifier: on the cone's axis at 75 % and 40 % of its height (the side that goes first and
  // the side that goes last), the figure's left edge on the same rows (backdrop only: the gradient is vertical), and
  // the dish floor in front of the cone, where the ember's light lands.
  const v = new THREE.Vector3();
  function points() {
    const r = figure.getBoundingClientRect();
    const at = (x, y, z) => { v.set(x, y, z).project(camera); return [Math.round(r.left + ((v.x + 1) / 2) * r.width), Math.round(r.top + ((1 - v.y) / 2) * r.height)]; };
    const span = CONE.top - CONE.base;
    const top = at(0, CONE.base + span * 0.75, 0), low = at(0, CONE.base + span * 0.4, 0);
    return { top, low, bgTop: [Math.round(r.left + 6), top[1]], bgLow: [Math.round(r.left + 6), low[1]], dish: at(0, 0.14, 1.45) };
  }
  // After a context loss the GPU objects are already gone: only the observers, the ticker and three's listeners go.
  function dispose() {
    io.disconnect(); ro.disconnect(); gsap.ticker.remove(draw);
    [coneGeo, dishGeo, shadowGeo, shadowMap, resin, glaze, shade, env].forEach((x) => x.dispose());
    renderer.dispose();
  }
  return { invalidate, points, dispose };
}

// The still's own sample points, from the SVG's screen matrix (the still is in the tree in every mode).
function stillPoints() {
  const m = still.getScreenCTM(), r = figure.getBoundingClientRect();
  if (!m || !r.width) return null;
  const at = ([x, y]) => { const q = new DOMPoint(x, y).matrixTransform(m); return [Math.round(q.x), Math.round(q.y)]; };
  const top = at(STILL.top), low = at(STILL.low);
  return { top, low, bgTop: [Math.round(r.left + 6), top[1]], bgLow: [Math.round(r.left + 6), low[1]], dish: null };
}

// Mode: gl (canvas) or still (the SVG). Static tier, ?nogl, no WebGL2, a failed renderer or a lost context give the still.
// Calls are chained, so a tier change that lands while the renderer starts is applied after it, never lost or overwritten.
let lost = false, glFailed = false, queue = Promise.resolve();
function setTier() {
  state.tier = motionTier();
  html.classList.toggle('is-staged', state.tier !== 'static');
  setLenis(state.tier === 'full');
}
async function runTier() {
  setTier();
  if (state.tier !== 'static' && HAS_GL2 && !gl && !glFailed && !lost) {
    state.glCreated = true;
    gl = await createGL();
    if (!gl) glFailed = true;
    else if (lost) { gl.dispose(); gl = null; } // lost while it started: the restore builds a fresh one
    setTier();
  }
  state.mode = state.tier !== 'static' && gl && !lost ? 'gl' : 'still';
  html.classList.toggle('gl-active', state.mode === 'gl');
  ScrollTrigger.refresh();
  update(trigger.progress);
  gl?.invalidate();
}
const applyTier = () => (queue = queue.then(runTier, runTier));

// A lost context hands the figure to the still at once; a restored one is rebuilt from scratch.
canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); lost = true; state.lost++; gl?.dispose(); gl = null; applyTier(); });
canvas.addEventListener('webglcontextrestored', () => { lost = false; applyTier(); });
// Listen before the first await: a change while the renderer starts is queued behind it.
onMotionTierChange(() => applyTier());
new MutationObserver(() => applyTier()).observe(html, { attributes: true, attributeFilter: ['data-motion'] });
addEventListener('pagehide', () => { gl?.dispose(); trigger.kill(); setLenis(false); }, { once: true });

awards.addState(() => {
  const s = { ...state, p: Number(state.p.toFixed(3)), level: Number(state.level.toFixed(4)), uProgress: Number(state.uProgress.toFixed(4)), turn: Number(state.turn.toFixed(4)) };
  s.points = state.mode === 'gl' ? gl.points() : state.mode === 'still' ? stillPoints() : null;
  s.lenis = !!lenis;
  return s;
});
// Ready once the queue is empty, including any change that arrived while the first renderer started.
for (let q = applyTier(); ; ) { await q; if (q === queue) break; q = queue; }
awards.ready();
