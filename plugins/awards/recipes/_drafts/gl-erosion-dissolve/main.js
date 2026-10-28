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
// threshold are discarded, a hashed feather grains the edge, and an emissive band of width uEdge burns just above it.
// One ScrollTrigger maps the sticky stage to a progress; the renderer draws only when that progress (or the size)
// changes. Reduced motion: no scrub, each chapter cuts to its own still. Static tier or no WebGL2: the SVG still.

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();

const html = document.documentElement;
const stage = document.querySelector('[data-stage]');
const figure = document.querySelector('[data-figure]');
const canvas = document.querySelector('[data-gl]');
const burnEdge = [...document.querySelectorAll('[data-still-burn]')];
const chapters = [...document.querySelectorAll('[data-chapter]')];
const steps = [...document.querySelectorAll('[data-goto]')];
const NO_GL = new URLSearchParams(location.search).has('nogl');

// The whole effect is these numbers.
const ERODE = [0.12, 0.88];          // stage progress over which uProgress runs 0 → 1 (held whole before, gone after)
const CHAPTER_AT = [0.3, 0.7];       // chapter boundaries in stage progress
const STILLS = [0, 0.5, 1];          // reduced motion: the still each chapter cuts to
const GOTO = [0.06, 0.5, 0.94];      // where the chapter buttons land
const TURN = 0.8;                    // radians the cone turns across the stage (full tier only)
const GLOW = 2.5;                    // peak intensity of the ember's point light, at uProgress .5
const FIELD = { amp: 0.14, freq: 2.6, feather: 0.025, edge: 0.03, grain: 22 };
const CONE = { base: 0.08, top: 2.68, radius: 0.96 };
const STILL_TRAVEL = 480;           // SVG units the still's burn edge travels, from above its tip to below its foot

const state = { tier: motionTier(), mode: 'pending', quality: 'pending', p: 0, chapter: 0, level: 0, uProgress: 0, turn: 0, renders: 0, window: null, glCreated: false, points: null, burnY: 0 };
let gl = null;

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
  if (level !== state.level || turn !== state.turn || state.renders === 0) {
    state.level = level; state.turn = turn;
    // The still burns too: its wavy clip and ember line move down the cone by the same level.
    state.burnY = Math.round(level * STILL_TRAVEL);
    burnEdge.forEach((el) => el.setAttribute('transform', `translate(0 ${state.burnY})`));
    gl?.invalidate();
  }
}

const trigger = ScrollTrigger.create({
  trigger: stage, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true,
  onUpdate: (self) => update(self.progress),
  onRefresh: (self) => { state.window = [Math.round(self.start), Math.round(self.end)]; update(self.progress); },
});
addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

// Chapter buttons scroll to their chapter: a 1.2 s Lenis glide in the full tier, an instant jump otherwise.
steps.forEach((b, i) => b.addEventListener('click', () => {
  const y = trigger.start + (trigger.end - trigger.start) * GOTO[i];
  if (lenis) lenis.scrollTo(y, { duration: 1.2 });
  else window.scrollTo({ top: y, behavior: 'instant' });
}));

// The patch: three chunk insertions; each throws if its include is missing, so a three upgrade fails loudly.
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
      uniform float uProgress, uEdge, uAmp, uFreq, uFeather, uGrain, uMin, uMax;
      uniform vec3 uAxis, uEmber, uHot;
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
    // The front starts below every value at uProgress 0 and ends above every value at 1, so 0 is whole and 1 is gone.
    f = swap(f, '#include <clipping_planes_fragment>', /* glsl */ `
      #include <clipping_planes_fragment>
      float eH = (dot(vErodeWorld, uAxis) - uMin) / (uMax - uMin);
      float eN = eFbm(vErodeObj * uFreq);
      float eD = eH + (eN - 0.5) * 2.0 * uAmp;
      float eAA = max(fwidth(eD), 1e-5);
      float eFront = mix(-(uAmp + uFeather + uEdge) - 0.01, 1.0 + uAmp + 0.01, uProgress);
      float eX = eD - eFront;
      if (eX < 0.0) discard;
      if (eX < uFeather * eHash(floor(vErodeObj * 72.0))) discard;
      // The band never thins below 1.5 px, whatever the screen size: its width is in field units or pixels, whichever is wider.
      float eBand = 1.0 - clamp((eX - uFeather) / max(uEdge, 1.5 * eAA), 0.0, 1.0);
      float eChar = 1.0 - clamp((eX - uFeather) / max(4.0 * uEdge, 1.5 * eAA), 0.0, 1.0);
      float eGrain = eNoise(vErodeObj * uGrain);`);
    // Pressed-powder grain from the same noise, charring just above the band, the hollow inside darker.
    f = swap(f, '#include <color_fragment>', /* glsl */ `
      #include <color_fragment>
      diffuseColor.rgb *= (0.82 + 0.36 * eN) * (0.86 + 0.28 * eGrain) * mix(1.0, 0.12, eChar * eChar) * (gl_FrontFacing ? 1.0 : 0.3);`);
    f = swap(f, '#include <emissivemap_fragment>', /* glsl */ `
      #include <emissivemap_fragment>
      totalEmissiveRadiance += mix(uEmber, uHot, pow(eBand, 4.0)) * eBand * (gl_FrontFacing ? 1.5 : 2.0);`);
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

async function createGL() {
  const profile = await detectQualityTier({ sampleMs: 300 });
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
  // The ember's own light: a warm point at the burning front, strongest half-way, so the dish catches the glow.
  const glow = new THREE.PointLight(0xff6a2a, 0, 4, 2);
  scene.add(key, rim, glow, new THREE.HemisphereLight(0xf4e6d8, 0x1a1210, 0.35));

  const segments = profile.tier === 'high' ? 128 : profile.tier === 'mid' ? 96 : 72;
  const coneGeo = new THREE.LatheGeometry(coneProfile(), segments);
  const dishGeo = new THREE.LatheGeometry(DISH, segments);
  const shadowGeo = new THREE.PlaneGeometry(4.8, 4.8).rotateX(-Math.PI / 2);
  const shadowMap = shadowTexture();
  const uniforms = {
    uProgress: { value: 0 }, uEdge: { value: FIELD.edge }, uAmp: { value: FIELD.amp }, uFreq: { value: FIELD.freq }, uFeather: { value: FIELD.feather }, uGrain: { value: FIELD.grain },
    uAxis: { value: new THREE.Vector3(0, -1, 0) }, uMin: { value: -CONE.top }, uMax: { value: -CONE.base },
    uEmber: { value: new THREE.Color(1.0, 0.14, 0.015) }, uHot: { value: new THREE.Color(1.0, 0.42, 0.08) },
  };
  const resin = new THREE.MeshStandardMaterial({ color: 0x8a5a3c, roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
  patch(resin, uniforms);
  const glaze = new THREE.MeshStandardMaterial({ color: 0x8aa596, roughness: 0.22, metalness: 0 });
  const shade = new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false });
  const cone = new THREE.Mesh(coneGeo, resin);
  const dish = new THREE.Mesh(dishGeo, glaze);
  const shadow = new THREE.Mesh(shadowGeo, shade); shadow.position.y = -0.025;
  scene.add(cone, dish, shadow);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const target = new THREE.Vector3(0, 1.12, 0);
  const PITCH = THREE.MathUtils.degToRad(10);
  let rect = figure.getBoundingClientRect();
  function resize() {
    rect = figure.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    applyRendererBudget(renderer, profile, Math.round(rect.width), Math.round(rect.height));
    camera.aspect = rect.width / rect.height;
    // Fit 4.1 × 3.05 units (dish and cone with a margin) whatever the shape of the figure.
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max(3.05 / 2 / t, 4.1 / 2 / (t * camera.aspect));
    camera.position.set(0, target.y + Math.sin(PITCH) * dist, Math.cos(PITCH) * dist);
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
    glow.position.set(0, CONE.top - (CONE.top - CONE.base) * state.level, 0.35);
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
  await renderer.compileAsync(scene, camera);

  // Screen points for the verifier: on the cone's axis at 75 % and 40 % of its height (the side that goes first and
  // the side that goes last), and the figure's left edge on the same rows (backdrop only: the gradient is vertical).
  const v = new THREE.Vector3();
  function points() {
    const r = figure.getBoundingClientRect();
    const at = (y) => { v.set(0, y, 0).project(camera); return [Math.round(r.left + ((v.x + 1) / 2) * r.width), Math.round(r.top + ((1 - v.y) / 2) * r.height)]; };
    const span = CONE.top - CONE.base;
    const top = at(CONE.base + span * 0.75), low = at(CONE.base + span * 0.4);
    return { top, low, bgTop: [Math.round(r.left + 6), top[1]], bgLow: [Math.round(r.left + 6), low[1]] };
  }
  function dispose() {
    io.disconnect(); ro.disconnect();
    [coneGeo, dishGeo, shadowGeo, shadowMap, resin, glaze, shade, env].forEach((x) => x.dispose());
    renderer.dispose();
  }
  return { invalidate, points, dispose };
}

// Mode: gl (canvas) or still (the SVG). Static tier, ?nogl, no WebGL2 or a failed renderer all give the still.
async function applyTier() {
  state.tier = motionTier();
  html.classList.toggle('is-staged', state.tier !== 'static');
  setLenis(state.tier === 'full');
  const glPossible = !NO_GL && (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
  if (state.tier !== 'static' && glPossible && !gl && !state.glCreated) { state.glCreated = true; gl = await createGL(); }
  state.mode = state.tier !== 'static' && gl ? 'gl' : 'still';
  html.classList.toggle('gl-active', state.mode === 'gl');
  ScrollTrigger.refresh();
  update(trigger.progress);
  gl?.invalidate();
}
await applyTier();
onMotionTierChange(() => applyTier());
new MutationObserver(() => applyTier()).observe(html, { attributes: true, attributeFilter: ['data-motion'] });
addEventListener('pagehide', () => { gl?.dispose(); trigger.kill(); setLenis(false); }, { once: true });

awards.addState(() => {
  const s = { ...state, p: Number(state.p.toFixed(3)), level: Number(state.level.toFixed(4)), uProgress: Number(state.uProgress.toFixed(4)), turn: Number(state.turn.toFixed(4)) };
  s.points = state.mode === 'gl' ? gl.points() : null;
  s.lenis = !!lenis;
  return s;
});
awards.ready();
