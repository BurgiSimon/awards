import * as THREE from 'three';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier, applyRendererBudget } from '../_shared/quality-tiers.js';
import { ticker, clamp, mapRange } from '../_shared/raf.js';

// Three procedural scenes share one fixed canvas and one scene target. The cuts between them live in the final pass:
//   cut 1  a staged blur (full, half, quarter resolution) that ends in a flat colour; the scene swaps under it
//   cut 2  the outgoing frame is copied once and frozen; the new scene opens inside a growing diamond
//   close  the frame zooms while a diamond closes onto the footer's ground colour
// A 2D canvas draws the diamond's edge in CSS pixels, in step with the GL mask.

syncMotionTierAttribute();
const html = document.documentElement;
const canvas = document.querySelector('[data-gl]');
const outline = document.querySelector('[data-outline]');
const readout = document.querySelector('[data-gl-readout]');
const chapters = [...document.querySelectorAll('[data-scene]')];
const footer = document.querySelector('[data-footer]');
const tier = motionTier();
const state = { gl: false, scene: 0, dip: 0, iris: 0, close: 0, frozen: false, cacheCopies: 0, outlineDrawn: false, frames: 0, time: 0 };

// This recipe's own palette (sRGB), turned into linear colours for the shaders.
const PALETTE = {
  dusk: ['#3b1d2e', '#b5523b', '#f0a46a'],
  tide: ['#0d1530', '#2c4fa8', '#7fb2ff'],
  moss: ['#0c2a20', '#3e7d5a', '#b7d98a'],
  dip: '#e9e1d4',
  ground: '#10231a',
};
const IRIS_LIFT = 0.06;   // the diamonds sit a little above centre, in viewport heights
const fit = (v, a, b, c, d) => clamp(mapRange(v, a, b, c, d), Math.min(c, d), Math.max(c, d));

const vert = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

// One program draws all three scenes; uKind picks the field. Each reads as one hue family so the cuts are legible.
const sceneFrag = /* glsl */ `
  precision highp float;
  uniform float uKind; uniform float uTime; uniform float uAspect;
  uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; } return v; }
  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    vec3 col;
    if (uKind < 0.5) {            // dusk: a low sun and drifting haze
      col = mix(uA, uB, smoothstep(0.65, -0.45, p.y));
      float sun = smoothstep(0.32, 0.0, length(p - vec2(0.35 * uAspect * 0.5, -0.12)));
      col = mix(col, uC, sun * 0.8);
      col += (fbm(p * 3.0 + vec2(uTime * 0.04, 0.0)) - 0.5) * 0.08;
    } else if (uKind < 1.5) {     // tide: bent stripes moving sideways
      float f = fbm(p * 2.2 + vec2(0.0, uTime * 0.05));
      float s = sin((p.x * 7.0 + f * 4.0 - uTime * 0.35) * 3.14159);
      col = mix(uA, uB, smoothstep(-0.6, 0.9, s));
      col = mix(col, uC, smoothstep(0.92, 1.0, s) * 0.6);
    } else {                      // moss: rippled bands rising slowly
      float f = fbm(p * vec2(1.5, 6.0) + vec2(uTime * 0.03, -uTime * 0.08));
      col = mix(uA, uB, smoothstep(0.25, 0.75, f));
      col = mix(col, uC, smoothstep(0.7, 0.9, f) * 0.5);
    }
    gl_FragColor = vec4(max(col, 0.0), 1.0);
  }`;

const blurFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex; uniform vec2 uDelta; varying vec2 vUv;
  void main() {
    vec4 c = texture2D(uTex, vUv) * 0.2270270270;
    c += (texture2D(uTex, vUv + uDelta * 1.3846153846) + texture2D(uTex, vUv - uDelta * 1.3846153846)) * 0.3162162162;
    c += (texture2D(uTex, vUv + uDelta * 3.2307692308) + texture2D(uTex, vUv - uDelta * 3.2307692308)) * 0.0702702703;
    gl_FragColor = c;
  }`;

const finalFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uScene; uniform sampler2D uHalf; uniform sampler2D uQuarter; uniform sampler2D uCache;
  uniform vec2 uTexel; uniform float uAspect; uniform float uLift; uniform float uAA;
  uniform float uDip; uniform vec3 uDipColor;
  uniform float uIris; uniform float uFrozen;
  uniform float uClose; uniform float uCloseSize; uniform vec3 uGround;
  varying vec2 vUv;
  // A square rhombus (equal diagonals): signed distance in viewport heights.
  float sdDiamond(vec2 p, float halfDiag) { return (abs(p.x) + abs(p.y) - halfDiag) * 0.70710678; }
  vec3 blur4(vec2 uv, vec2 d) {
    return (texture2D(uScene, uv + vec2(d.x, d.y)).rgb + texture2D(uScene, uv + vec2(-d.x, d.y)).rgb + texture2D(uScene, uv + vec2(d.x, -d.y)).rgb + texture2D(uScene, uv - d).rgb) * 0.25;
  }
  void main() {
    // The close zooms the live frame toward the diamond as it shuts.
    float zoomT = clamp((uClose - 0.75) / 0.25, 0.0, 1.0);
    vec2 uv = (vUv - 0.5) / (1.0 + 2.0 * zoomT * zoomT) + 0.5 + vec2(0.0, 0.03 * uClose);
    vec3 col = texture2D(uScene, uv).rgb;
    // Cut 1: blur at three resolutions in turn, then a flat colour. Nothing about the scene survives the peak.
    if (uDip > 0.0) {
      col = mix(col, blur4(uv, uTexel * 3.0), smoothstep(0.0, 0.333, uDip));
      col = mix(col, texture2D(uHalf, uv).rgb, smoothstep(0.25, 0.667, uDip));
      col = mix(col, texture2D(uQuarter, uv).rgb, smoothstep(0.667, 1.0, uDip));
      col = mix(col, uDipColor, smoothstep(0.8, 1.0, uDip));
    }
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) - vec2(0.0, uLift);
    // Cut 2: inside the diamond the live scene, outside the frame frozen when the cut began.
    if (uFrozen > 0.5) {
      float inside = 1.0 - smoothstep(-uAA, uAA, sdDiamond(p, uIris));
      col = mix(texture2D(uCache, vUv).rgb, col, inside);
    }
    // The close: outside a shrinking diamond, the footer's ground.
    if (uClose > 0.0) {
      float inside = 1.0 - smoothstep(-uAA, uAA, sdDiamond(p, uCloseSize));
      col = mix(uGround, col, inside);
    }
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }`;

function lin(hex) { return new THREE.Color(hex); } // THREE.Color parses sRGB hex into the linear working space

async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false }); } catch { return false; }
  const profile = await detectQualityTier({ sampleMs: 250 });
  const rt = (w, h) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false, generateMipmaps: false });
  const sceneRT = rt(1, 1), cacheRT = rt(1, 1), halfA = rt(1, 1), halfB = rt(1, 1), quarterA = rt(1, 1), quarterB = rt(1, 1);
  const kinds = [PALETTE.dusk, PALETTE.tide, PALETTE.moss].map((c) => c.map(lin));

  const sceneMat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: sceneFrag, depthTest: false, depthWrite: false, uniforms: { uKind: { value: 0 }, uTime: { value: 0 }, uAspect: { value: 1 }, uA: { value: kinds[0][0] }, uB: { value: kinds[0][1] }, uC: { value: kinds[0][2] } } });
  const blurMat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: blurFrag, depthTest: false, depthWrite: false, uniforms: { uTex: { value: null }, uDelta: { value: new THREE.Vector2() } } });
  const finalU = {
    uScene: { value: sceneRT.texture }, uHalf: { value: halfB.texture }, uQuarter: { value: quarterB.texture }, uCache: { value: cacheRT.texture },
    uTexel: { value: new THREE.Vector2() }, uAspect: { value: 1 }, uLift: { value: IRIS_LIFT }, uAA: { value: 0.002 },
    uDip: { value: 0 }, uDipColor: { value: lin(PALETTE.dip) }, uIris: { value: 0 }, uFrozen: { value: 0 },
    uClose: { value: 0 }, uCloseSize: { value: 2 }, uGround: { value: lin(PALETTE.ground) },
  };
  const finalMat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: finalFrag, depthTest: false, depthWrite: false, uniforms: finalU });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), sceneMat); quad.frustumCulled = false;
  const scene = new THREE.Scene(); scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const pass = (mat, target) => { quad.material = mat; renderer.setRenderTarget(target); renderer.render(scene, cam); };
  const ctx = outline.getContext('2d');

  let w = 1, h = 1, dpr = 1;
  function resize() {
    w = innerWidth; h = innerHeight;
    applyRendererBudget(renderer, profile, w, h);
    dpr = renderer.getPixelRatio();
    const bw = Math.max(1, Math.round(w * dpr)), bh = Math.max(1, Math.round(h * dpr));
    sceneRT.setSize(bw, bh); cacheRT.setSize(bw, bh);
    halfA.setSize(bw >> 1, bh >> 1); halfB.setSize(bw >> 1, bh >> 1);
    quarterA.setSize(bw >> 2, bh >> 2); quarterB.setSize(bw >> 2, bh >> 2);
    finalU.uTexel.value.set(1 / bw, 1 / bh);
    finalU.uAspect.value = sceneMat.uniforms.uAspect.value = w / h;
    finalU.uAA.value = 1.5 / h;
    outline.width = Math.round(w * Math.min(2, devicePixelRatio)); outline.height = Math.round(h * Math.min(2, devicePixelRatio));
    state.frozen = false; finalU.uFrozen.value = 0; // a cached frame of another size is no longer valid
  }
  resize();
  addEventListener('resize', resize);

  // Section top as a fraction of the viewport: 1 when it enters at the bottom, 0 at the top.
  const topOf = (el) => el.getBoundingClientRect().top / innerHeight;
  function cuts() {
    const dTide = topOf(chapters[1]), dMoss = topOf(chapters[2]), dFoot = topOf(footer);
    if (tier === 'full') {
      state.dip = fit(dTide, 1.0, 0.55, 0, 1) * fit(dTide, 0.35, -0.15, 1, 0);
      state.iris = fit(dMoss, 0.9, 0.1, 0, 1);
      state.close = fit(dFoot, 0.95, 0.0, 0, 0.925);
    } else {
      // Reduced motion: the same cuts, as hard switches with no blur, no growing iris and no zoom.
      state.dip = 0;
      state.iris = dMoss < 0.5 ? 1 : 0;
      state.close = dFoot < 0.5 ? 0.925 : 0;
    }
    // The scene swaps under the flat colour of cut 1, and when cut 2 begins.
    state.scene = state.iris > 0 ? 2 : dTide < 0.45 ? 1 : 0;
  }

  function drawOutline(halfDiag, alpha) {
    const s = Math.min(2, devicePixelRatio);
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.clearRect(0, 0, w, h);
    state.outlineDrawn = alpha > 0;
    if (alpha <= 0) return;
    const cx = w / 2, cy = h / 2 - IRIS_LIFT * h, r = halfDiag * h;
    ctx.strokeStyle = `rgba(246, 241, 234, ${alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy); ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r, cy); ctx.closePath(); ctx.stroke();
  }

  let lastOutline = '';
  function render(dt) {
    if (tier === 'full') state.time += dt;
    cuts();
    const k = kinds[state.scene];
    // Cut 2 begins: render the outgoing scene (the tide) once into the cache. Rendering it, rather than copying the
    // last frame, keeps the still right when the visitor jumps straight into the cut (an anchor link, a restored scroll).
    if (state.iris > 0 && !state.frozen) {
      const out = kinds[1];
      sceneMat.uniforms.uKind.value = 1; sceneMat.uniforms.uTime.value = state.time;
      sceneMat.uniforms.uA.value = out[0]; sceneMat.uniforms.uB.value = out[1]; sceneMat.uniforms.uC.value = out[2];
      pass(sceneMat, cacheRT);
      state.frozen = true; state.cacheCopies++;
    } else if (state.iris <= 0 && state.frozen) state.frozen = false; // scrolled back: release the still
    sceneMat.uniforms.uKind.value = state.scene; sceneMat.uniforms.uTime.value = state.time;
    sceneMat.uniforms.uA.value = k[0]; sceneMat.uniforms.uB.value = k[1]; sceneMat.uniforms.uC.value = k[2];
    pass(sceneMat, sceneRT);
    if (state.dip > 0) {
      blurMat.uniforms.uTex.value = sceneRT.texture; blurMat.uniforms.uDelta.value.set(4 / halfA.width, 0); pass(blurMat, halfA);
      blurMat.uniforms.uTex.value = halfA.texture; blurMat.uniforms.uDelta.value.set(0, 4 / halfA.height); pass(blurMat, halfB);
      blurMat.uniforms.uTex.value = halfB.texture; blurMat.uniforms.uDelta.value.set(8 / quarterA.width, 0); pass(blurMat, quarterA);
      blurMat.uniforms.uTex.value = quarterA.texture; blurMat.uniforms.uDelta.value.set(0, 8 / quarterA.height); pass(blurMat, quarterB);
    }
    finalU.uDip.value = state.dip;
    finalU.uFrozen.value = state.frozen ? 1 : 0;
    finalU.uIris.value = state.iris * 1.5;
    finalU.uClose.value = state.close;
    finalU.uCloseSize.value = (1 - state.close) * 1.5;
    pass(finalMat, null);
    state.frames++;
    // The 2D edge redraws only when its geometry changes.
    const cutEdge = state.iris > 0 && state.iris < 1 && tier === 'full';
    const key = cutEdge ? `i${state.iris.toFixed(4)}` : state.close > 0 ? `c${state.close.toFixed(4)}` : 'none';
    if (key !== lastOutline) {
      lastOutline = key;
      if (cutEdge) drawOutline(state.iris * 1.5, fit(state.iris, 0, 0.15, 0, 0.9) * fit(state.iris, 0.8, 1, 1, 0));
      else if (state.close > 0) drawOutline((1 - state.close) * 1.5, fit(state.close, 0, 0.25, 0, 0.6));
      else drawOutline(0, 0);
    }
  }

  const unsubscribe = tier === 'full' ? ticker.add((dt) => render(dt)) : null;
  if (tier !== 'full') {
    // Reduced motion: no clock. Render on scroll and resize only.
    const once = () => requestAnimationFrame(() => render(0));
    addEventListener('scroll', once, { passive: true });
    addEventListener('resize', once);
    render(0);
  }

  // Test hook: render a fresh frame and read the default framebuffer in the same task.
  window.__cuts = {
    sample() {
      render(0);
      const gl = renderer.getContext();
      const px = (x, y) => { const out = new Uint8Array(4); gl.readPixels(Math.round(x * gl.drawingBufferWidth), Math.round(y * gl.drawingBufferHeight), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, out); return [...out.slice(0, 3)]; };
      // y is from the bottom in GL; the diamond sits IRIS_LIFT above centre.
      return { centre: px(0.5, 0.5 + IRIS_LIFT), corner: px(0.04, 0.96), edge: px(0.04, 0.5) };
    },
  };

  html.classList.add('gl-active');
  readout.textContent = `webgl · ${profile.tier}`;
  state.gl = true;
  function dispose() {
    unsubscribe?.();
    for (const o of [sceneRT, cacheRT, halfA, halfB, quarterA, quarterB, quad.geometry, sceneMat, blurMat, finalMat]) o.dispose();
    renderer.dispose();
    html.classList.remove('gl-active');
    state.gl = false;
  }
  addEventListener('pagehide', dispose, { once: true });
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (glPossible && tier !== 'static') {
  if (!(await start())) readout.textContent = 'dom (webgl failed)';
} else {
  readout.textContent = tier === 'static' ? 'dom (static tier)' : 'dom (no webgl)';
}

awards.addState(() => ({ motion: tier, ...state, dip: Math.round(state.dip * 1000) / 1000, iris: Math.round(state.iris * 1000) / 1000, close: Math.round(state.close * 1000) / 1000, time: Math.round(state.time * 100) / 100, canvasAriaHidden: canvas.getAttribute('aria-hidden') === 'true' && outline.getAttribute('aria-hidden') === 'true' }));
awards.ready();
