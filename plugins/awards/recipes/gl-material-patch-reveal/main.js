import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier, applyRendererBudget } from '../_shared/quality-tiers.js';
import { ticker, clamp } from '../_shared/raf.js';

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();

// Lenis on the shared ticker (autoRaf is off by default in 1.3: without a clock it swallows the wheel).
const lenis = new Lenis({ lerp: 0.1 });
lenis.on('scroll', ScrollTrigger.update);
ticker.add((dt, t) => lenis.raf(t));
window.lenis = lenis;

const html = document.documentElement;
const canvas = document.querySelector('[data-gl]');
const stage = canvas.parentElement;
const anchor = document.querySelector('[data-anchor]');
const dial = document.querySelector('[data-dial]');
const readout = document.querySelector('[data-gl-readout]');
const WOBBLE = new URLSearchParams(location.search).has('wobble');
const state = { gl: false, tier: 'pending', p: 0, window: null, radius: 0, rMax: 0, center: [0, 0] };

// One scrubbed proxy, ease none: the scroll supplies the smoothing, the radius curve is applied in render().
const proxy = { p: 0 };
gsap.to(proxy, {
  p: 1, ease: 'none',
  scrollTrigger: {
    trigger: '[data-scene]', start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true,
    onRefresh: (self) => { state.window = [Math.round(self.start), Math.round(self.end)]; },
  },
  onUpdate: () => { state.p = proxy.p; dial.textContent = String(Math.round(proxy.p * 100)).padStart(2, '0'); },
});
addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

// Shared uniforms: both layers read the same circle. Per-layer: uColor (0 grey … 1 colour) and uSide (which half survives).
const shared = {
  uCenter: { value: new THREE.Vector2() }, uRadius: { value: 0 }, uSoft: { value: 16 }, uMask: { value: 1 },
  uSat: { value: 1.35 }, uGain: { value: 1.0 }, uTime: { value: 0 }, uWobble: { value: WOBBLE ? 0.035 : 0 },
};

// The patch. Two chunk replacements; each throws if its include is missing, so a three upgrade fails loudly, not grey.
function patch(material, own) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared, own);
    const swap = (src, chunk, code) => {
      if (!src.includes(chunk)) throw new Error(`patch: ${chunk} not found`);
      return src.replace(chunk, code);
    };
    const head = /* glsl */ `
      uniform vec2 uCenter; uniform float uRadius, uSoft, uMask, uColor, uSide, uSat, uGain, uTime, uWobble;
      float grain(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {`;
    let f = swap(shader.fragmentShader, 'void main() {', head);
    // Grained circular discard in drawing-buffer pixels: k < 0 inside, k > 1 outside, the band between is dithered.
    // The incoming layer keeps the inside, the outgoing the outside; one hash, so the two are exact complements.
    f = swap(f, '#include <clipping_planes_fragment>', /* glsl */ `
      #include <clipping_planes_fragment>
      if (uMask > 0.5) {
        float k = (length(gl_FragCoord.xy - uCenter) - (uRadius - uSoft)) / uSoft;
        bool inside = k < grain(gl_FragCoord.xy);
        if (inside != (uSide > 0.5)) discard;
      }`);
    // Luma mix after the map is sampled: grey at 0, saturation-boosted colour at 1.
    f = swap(f, '#include <map_fragment>', /* glsl */ `
      #include <map_fragment>
      float luma = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
      vec3 boosted = max(mix(vec3(luma), diffuseColor.rgb, uSat) * uGain, 0.0);
      diffuseColor.rgb = mix(vec3(luma), boosted, uColor);`);
    // Variant: a two-sine normal wobble so the light ripples across the surface.
    f = swap(f, '#include <normal_fragment_begin>', /* glsl */ `
      #include <normal_fragment_begin>
      normal = normalize(normal + uWobble * vec3(sin(vViewPosition.y * 3.0 + uTime), sin(vViewPosition.x * 2.4 - uTime * 0.8), 0.0));`);
    shader.fragmentShader = f;
  };
}

// Synthetic pattern: saturated hue bands crossed by diagonal stripes, drawn once. No file is loaded.
function makeTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d');
  for (let i = 0; i < 8; i++) { g.fillStyle = `hsl(${i * 45 + 10} 80% 50%)`; g.fillRect(0, i * 64, 512, 64); }
  g.globalAlpha = 0.5;
  for (let i = -8; i < 16; i += 2) { g.fillStyle = `hsl(${(i * 70 + 200) % 360} 85% 45%)`; g.beginPath(); g.moveTo(i * 48, 0); g.lineTo(i * 48 + 24, 0); g.lineTo(i * 48 + 536, 512); g.lineTo(i * 48 + 512, 512); g.fill(); }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 2);
  return tex;
}

// A rippled cloth: plane displaced once in JS, normals recomputed. Scaled on resize to overfill the view.
function makeGeometry() {
  const geo = new THREE.PlaneGeometry(1, 1, 120, 80);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, 0.18 * Math.sin(x * 9 + y * 3) + 0.1 * Math.cos(y * 11 - x * 2));
  }
  geo.computeVertexNormals();
  return geo;
}

async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); } catch { return false; }
  const profile = await detectQualityTier({ sampleMs: 300 });
  state.tier = profile.tier;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x4a4a4a);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50); camera.position.z = 6;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x404040, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.8); key.position.set(-3, 4, 5); scene.add(key);

  const geo = makeGeometry();
  const map = makeTexture();
  const mk = (color, side) => {
    const m = new THREE.MeshStandardMaterial({ map, roughness: 0.62, metalness: 0 });
    const own = { uColor: { value: color }, uSide: { value: side } };
    patch(m, own);
    return { m, own };
  };
  const outgoing = mk(0, 0), incoming = mk(1, 1);
  const group = new THREE.Group();
  const meshOut = new THREE.Mesh(geo, outgoing.m), meshIn = new THREE.Mesh(geo, incoming.m);
  group.add(meshOut, meshIn); group.rotation.x = -0.18;
  scene.add(group);

  let dpr = 1;
  function resize() {
    const r = stage.getBoundingClientRect();
    applyRendererBudget(renderer, profile, Math.round(r.width), Math.round(r.height));
    dpr = renderer.domElement.width / Math.max(1, r.width);
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
    const vh = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    group.scale.set(vh * camera.aspect * 1.6, vh * 1.6, 1);
    shared.uSoft.value = clamp(Math.min(r.width, r.height) * 0.03, 10, 32) * dpr;
  }
  resize(); addEventListener('resize', resize);

  function render(t = 0) {
    const tier = motionTier();
    const c = stage.getBoundingClientRect(), a = anchor.getBoundingClientRect();
    const cx = a.left + a.width / 2 - c.left, cy = a.top + a.height / 2 - c.top;
    const r0 = a.width / 2;
    // Farthest canvas corner from the anchor, plus 2 px, so p = 1 leaves nothing grey.
    const rMax = Math.max(Math.hypot(cx, cy), Math.hypot(c.width - cx, cy), Math.hypot(cx, c.height - cy), Math.hypot(c.width - cx, c.height - cy)) + 2;
    const p = state.p;
    shared.uCenter.value.set(cx * dpr, (c.height - cy) * dpr);
    if (tier === 'full') {
      // Circle hand-off: the grey layer keeps the outside, the colour layer the inside.
      shared.uMask.value = 1; meshIn.visible = true; outgoing.own.uColor.value = 0;
      state.radius = r0 + (rMax - r0) * p * p;
      shared.uTime.value = t * 0.001;
      group.rotation.y = Math.sin(t * 0.0002) * 0.04;
    } else {
      // Reduced: no spreading shape and no sway; colour still follows the scroll, evenly. Static: settled colour.
      shared.uMask.value = 0; meshIn.visible = false;
      outgoing.own.uColor.value = tier === 'static' ? 1 : p;
      state.radius = rMax;
      shared.uTime.value = 0; group.rotation.y = 0;
    }
    shared.uRadius.value = state.radius * dpr;
    state.rMax = Math.round(rMax); state.center = [Math.round(cx), Math.round(cy)];
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  }
  const unsubscribe = ticker.add((dt, t) => render(t));

  // Read one pixel at a CSS point of the stage: fresh render, default framebuffer, same task.
  window.__sample = (x, y) => {
    render(performance.now());
    const gl = renderer.getContext();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const px = new Uint8Array(4);
    gl.readPixels(Math.round(x * dpr), Math.round(renderer.domElement.height - y * dpr), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return Array.from(px);
  };

  html.classList.add('gl-active'); readout.textContent = `webgl · ${profile.tier}${WOBBLE ? ' · wobble' : ''}`; state.gl = true;
  addEventListener('pagehide', () => { unsubscribe(); geo.dispose(); map.dispose(); outgoing.m.dispose(); incoming.m.dispose(); renderer.dispose(); }, { once: true });
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (glPossible) { if (!(await start())) readout.textContent = 'dom (webgl failed)'; } else readout.textContent = 'dom (no webgl)';

// HSV saturation of a sampled pixel: 0 for grey.
const sat = (px) => (px ? Number(((Math.max(px[0], px[1], px[2]) - Math.min(px[0], px[1], px[2])) / Math.max(1, Math.max(px[0], px[1], px[2]))).toFixed(3)) : null);
awards.addState(() => {
  const inner = state.gl ? window.__sample(state.center[0], state.center[1]) : null;
  const w = stage.clientWidth, h = stage.clientHeight;
  const outer = state.gl ? window.__sample(w * 0.88, h * 0.14) : null;
  return {
    motion: motionTier(), gl: state.gl, tier: state.tier, window: state.window,
    p: Number(state.p.toFixed(3)), radius: Math.round(state.radius), rMax: state.rMax, center: state.center,
    inner, outer, innerSat: sat(inner), outerSat: sat(outer),
  };
});
awards.ready();
