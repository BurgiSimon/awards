import * as THREE from 'three';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier } from '../_shared/quality-tiers.js';
import { ticker } from '../_shared/raf.js';

// Pointer paint without a fluid solver. Three passes a frame:
//   1. paint   — quarter-resolution ping-pong: a capsule stroke, self-advection along a blurred copy, curl from gradient noise
//   2. low     — a sixteenth-resolution blurred copy of the paint, which the next frame advects along
//   3. smear   — the hero is sampled nine times along the paint's velocity and fringed where the stroke thins out

syncMotionTierAttribute();
const html = document.documentElement;
const canvas = document.querySelector('[data-gl]');
const hero = document.querySelector('[data-hero]');
const readout = document.querySelector('[data-gl-readout]');
const state = { gl: false, tier: 'pending', strokes: 0, energy: 0, pressed: false, coarse: matchMedia('(pointer: coarse)').matches, disposed: false };

// This recipe's own values (the corpus card records where the architecture comes from).
const P = {
  maxRadius: 100, radiusRange: 100,           // CSS px: radius grows 0 → 100 as the pointer moves 0 → 100 px in a frame
  push: 25,                                    // self-advection along the blurred copy, in paint texels
  curlScale: 0.06, curlStrength: 1.75,
  velocityKeep: 0.985, weightSlowKeep: 0.985, weightFastKeep: 0.75, accelKeep: 0.8,
  amount: 20, multiplier: 5, rgbShift: 0.5, colorMul: 10, shade: 1.25,
};

const vert = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const paintFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uPrev; uniform sampler2D uLow; uniform vec2 uTexel;
  uniform vec4 uFrom; uniform vec4 uTo; uniform vec2 uVel; uniform vec3 uKeep;
  uniform float uPush; uniform float uCurlScale; uniform float uCurlStrength;
  varying vec2 vUv;
  vec2 sdSegment(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0); return vec2(length(pa - ba * h), h); }
  vec2 hash2(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0; }
  // Gradient noise with its analytic derivative (value in x, gradient in yz): the gradient is the curl source.
  vec3 noised(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
    vec2 ga = hash2(i), gb = hash2(i + vec2(1.0, 0.0)), gc = hash2(i + vec2(0.0, 1.0)), gd = hash2(i + vec2(1.0, 1.0));
    float va = dot(ga, f), vb = dot(gb, f - vec2(1.0, 0.0)), vc = dot(gc, f - vec2(0.0, 1.0)), vd = dot(gd, f - vec2(1.0, 1.0));
    return vec3(va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * (va - vb - vc + vd),
      ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) + du * (u.yx * (va - vb - vc + vd) + vec2(vb, vc) - va));
  }
  void main() {
    vec2 seg = sdSegment(gl_FragCoord.xy, uFrom.xy, uTo.xy);
    vec2 rw = mix(uFrom.zw, uTo.zw, seg.y);
    float inside = 1.0 - smoothstep(-0.01, rw.x, seg.x);
    vec4 low = texture2D(uLow, vUv);
    vec2 back = (0.5 - low.xy) * uPush;
    vec3 n1 = noised(gl_FragCoord.xy * uCurlScale * (1.0 - low.xy));
    vec2 curl = noised(gl_FragCoord.xy * uCurlScale * (2.0 - low.xy * (0.5 + n1.x)) + n1.yz * 0.1).yz;
    back += curl * (low.z + low.w) * uCurlStrength;
    vec4 data = texture2D(uPrev, vUv + back * uTexel);
    data.xy -= 0.5;
    vec4 delta = (uKeep.xxyz - 1.0) * data;
    delta += vec4(uVel * inside, rw.yy * inside);
    delta.zw = sign(delta.zw) * max(vec2(0.004), abs(delta.zw)); // 8-bit storage: never stall a hair above zero
    data += delta;
    data.xy += 0.5;
    gl_FragColor = clamp(data, 0.0, 1.0);
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

const smearFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uScene; uniform sampler2D uPaint; uniform vec2 uPaintTexel;
  uniform float uAmount; uniform float uMultiplier; uniform float uRgbShift; uniform float uColorMul; uniform float uShade;
  varying vec2 vUv;
  void main() {
    vec4 data = texture2D(uPaint, vUv);
    float weight = (data.z + data.w) * 0.5;
    vec2 vel = (0.5 - data.xy - 0.001) * 2.0 * weight;
    vec2 step = vel * uAmount / 4.0 * uPaintTexel * uMultiplier;
    float jitter = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))); // interleaved gradient noise
    vec2 uv = vUv + jitter * step;
    vec4 color = vec4(0.0);
    for (int i = 0; i < 9; i++) { color += texture2D(uScene, uv); uv += step; }
    color /= 9.0;
    // An oil-film fringe that shows where the stroke is thinning, scaled by how fast it moves there.
    color.rgb += sin(vec3(vel.x + vel.y) * 40.0 + vec3(0.0, 2.0, 4.0) * uRgbShift) * smoothstep(0.4, -0.9, weight) * uShade * max(abs(vel.x), abs(vel.y)) * uColorMul;
    gl_FragColor = vec4(max(color.rgb, 0.0), 1.0);
    #include <colorspace_fragment>
  }`;

// Tests read the field through a byte: mean weight over an 8 × 8 grid of the paint target.
const energyFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uPaint;
  void main() {
    float s = 0.0;
    for (int y = 0; y < 8; y++) for (int x = 0; x < 8; x++) { vec4 d = texture2D(uPaint, (vec2(float(x), float(y)) + 0.5) / 8.0); s += (d.z + d.w) * 0.5; }
    gl_FragColor = vec4(vec3(min(1.0, s / 64.0 * 8.0)), 1.0);
  }`;

function heroTexture(w, h) {
  // Draw the DOM hero into a canvas with the same fonts, so the GL hero is the DOM hero; a faint grid shows the smear.
  const c = document.createElement('canvas');
  const scale = Math.min(1, 2048 / Math.max(w, h));
  c.width = Math.round(w * scale); c.height = Math.round(h * scale);
  const ctx = c.getContext('2d');
  const cs = getComputedStyle(html);
  const ground = cs.getPropertyValue('--ground').trim() || '#1a1c1c';
  const ink = cs.getPropertyValue('--ink').trim() || '#f4f2ee';
  const accent = cs.getPropertyValue('--accent').trim() || '#ffc800';
  ctx.fillStyle = ground; ctx.fillRect(0, 0, c.width, c.height);
  const g = ctx.createRadialGradient(c.width * 0.72, c.height * 0.38, 0, c.width * 0.72, c.height * 0.38, c.width * 0.5);
  g.addColorStop(0, accent); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.55; ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height); ctx.globalAlpha = 1;
  ctx.strokeStyle = ink; ctx.globalAlpha = 0.07; ctx.lineWidth = 1;
  const stepPx = 48 * scale;
  for (let x = 0; x < c.width; x += stepPx) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke(); }
  for (let y = 0; y < c.height; y += stepPx) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke(); }
  ctx.globalAlpha = 1;
  const hr = hero.getBoundingClientRect();
  const draw = (el, color) => {
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    ctx.font = `${st.fontWeight} ${parseFloat(st.fontSize) * scale}px ${st.fontFamily}`;
    ctx.fillStyle = color; ctx.textBaseline = 'top';
    const lh = (parseFloat(st.lineHeight) || parseFloat(st.fontSize) * 1.2) * scale;
    const x = (r.left - hr.left) * scale, max = r.width * scale + 1;
    let y = (r.top - hr.top) * scale;
    // Hard breaks (<br>) are kept; inside each line, words wrap at the element's own width, as the DOM wraps them.
    for (const hard of el.innerText.split('\n')) {
      let line = '';
      for (const word of hard.split(/\s+/).filter(Boolean)) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > max && line) { ctx.fillText(line, x, y); y += lh; line = word; } else line = test;
      }
      if (line) { ctx.fillText(line, x, y); y += lh; }
    }
  };
  draw(hero.querySelector('.label'), cs.getPropertyValue('--muted').trim() || ink);
  draw(hero.querySelector('[data-hero-title]'), ink);
  draw(hero.querySelector('.lede'), ink);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
  return t;
}

async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false }); } catch { return false; }
  const profile = await detectQualityTier({ sampleMs: 300 });
  state.tier = profile.tier;
  renderer.setPixelRatio(profile.dpr);
  const byte = { type: THREE.UnsignedByteType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false, generateMipmaps: false };
  let paintA = new THREE.WebGLRenderTarget(1, 1, byte), paintB = new THREE.WebGLRenderTarget(1, 1, byte);
  const lowA = new THREE.WebGLRenderTarget(1, 1, byte), lowB = new THREE.WebGLRenderTarget(1, 1, byte);
  const energyRT = new THREE.WebGLRenderTarget(1, 1, byte);

  const paintMat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: paintFrag, depthTest: false, depthWrite: false, uniforms: {
    uPrev: { value: null }, uLow: { value: lowB.texture }, uTexel: { value: new THREE.Vector2() },
    uFrom: { value: new THREE.Vector4() }, uTo: { value: new THREE.Vector4() }, uVel: { value: new THREE.Vector2() },
    uKeep: { value: new THREE.Vector3(P.velocityKeep, P.weightSlowKeep, P.weightFastKeep) },
    uPush: { value: P.push }, uCurlScale: { value: P.curlScale }, uCurlStrength: { value: P.curlStrength } } });
  const blurMat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: blurFrag, depthTest: false, depthWrite: false, uniforms: { uTex: { value: null }, uDelta: { value: new THREE.Vector2() } } });
  const smearMat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: smearFrag, depthTest: false, depthWrite: false, uniforms: {
    uScene: { value: null }, uPaint: { value: null }, uPaintTexel: { value: new THREE.Vector2() },
    uAmount: { value: P.amount }, uMultiplier: { value: P.multiplier }, uRgbShift: { value: P.rgbShift }, uColorMul: { value: P.colorMul }, uShade: { value: P.shade } } });
  const energyMat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: energyFrag, depthTest: false, depthWrite: false, uniforms: { uPaint: { value: null } } });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), paintMat);
  quad.frustumCulled = false;
  const scene = new THREE.Scene(); scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const pass = (mat, target) => { quad.material = mat; renderer.setRenderTarget(target); renderer.render(scene, cam); };
  const clearTo = (rt) => { renderer.setRenderTarget(rt); renderer.setClearColor(new THREE.Color(0.5, 0.5, 0), 0); renderer.clear(); };

  let w = 1, h = 1, sceneTex;
  function resize() {
    const r = hero.getBoundingClientRect();
    w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false);
    const pw = Math.max(1, w >> 2), ph = Math.max(1, h >> 2);
    for (const rt of [paintA, paintB]) rt.setSize(pw, ph);
    for (const rt of [lowA, lowB]) rt.setSize(Math.max(1, w >> 4), Math.max(1, h >> 4));
    for (const rt of [paintA, paintB, lowA, lowB]) clearTo(rt);
    renderer.setRenderTarget(null);
    paintMat.uniforms.uTexel.value.set(1 / pw, 1 / ph);
    smearMat.uniforms.uPaintTexel.value.set(1 / pw, 1 / ph);
    sceneTex?.dispose();
    sceneTex = heroTexture(w, h);
    smearMat.uniforms.uScene.value = sceneTex;
  }
  resize();
  addEventListener('resize', resize);

  // Pointer, in hero-local CSS px. `moved` is reset each frame so a resting pointer paints nothing.
  const ptr = { x: -1, y: -1, px: -1, py: -1, seen: false, moved: false, down: false };
  const onMove = (e) => {
    const r = hero.getBoundingClientRect();
    ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
    if (!ptr.seen) { ptr.px = ptr.x; ptr.py = ptr.y; ptr.seen = true; }
    ptr.moved = true;
  };
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', (e) => { ptr.down = true; state.pressed = true; onMove(e); ptr.px = ptr.x; ptr.py = ptr.y; }, { passive: true });
  addEventListener('pointerup', () => { ptr.down = false; state.pressed = false; }, { passive: true });

  const from = paintMat.uniforms.uFrom.value, to = paintMat.uniforms.uTo.value, vel = paintMat.uniforms.uVel.value, push = new THREE.Vector2();
  const unsubscribe = ticker.add((dt) => {
    const pw = paintA.width, ph = paintA.height;
    // Stroke: a capsule from the last pointer position to this one, radius from the distance moved.
    const dist = Math.hypot(ptr.x - ptr.px, ptr.y - ptr.py);
    let radius = Math.min(P.maxRadius, (dist / P.radiusRange) * P.maxRadius);
    const mayPaint = ptr.seen && ptr.moved && (!state.coarse || ptr.down);
    if (!mayPaint) radius = 0;
    radius = (radius / h) * ph;
    from.copy(to);
    to.set((ptr.x / w) * pw, (1 - ptr.y / h) * ph, radius, 1);
    if (radius > 0) state.strokes++;
    // The input is a velocity in paint texels: clamp the frame time (a slow frame must not saturate it) and keep it inside
    // the ±0.5 an 8-bit channel centred on 0.5 can hold, or the self-advection throws the paint off the screen.
    vel.multiplyScalar(P.accelKeep).add(push.set(to.x - from.x, to.y - from.y).multiplyScalar(Math.min(dt, 1 / 30) * 0.8));
    vel.clampLength(0, 0.45);
    ptr.px = ptr.x; ptr.py = ptr.y; ptr.moved = false;

    paintMat.uniforms.uPrev.value = paintA.texture;
    paintMat.uniforms.uLow.value = lowB.texture;
    pass(paintMat, paintB);
    [paintA, paintB] = [paintB, paintA];
    // Low copy: downsample with a horizontal blur, then a vertical one.
    blurMat.uniforms.uTex.value = paintA.texture; blurMat.uniforms.uDelta.value.set(4 / lowA.width * 0.25, 0); pass(blurMat, lowA);
    blurMat.uniforms.uTex.value = lowA.texture; blurMat.uniforms.uDelta.value.set(0, 4 / lowB.height * 0.25); pass(blurMat, lowB);
    smearMat.uniforms.uPaint.value = paintA.texture;
    pass(smearMat, null);
  });

  window.__paintEnergy = () => {
    energyMat.uniforms.uPaint.value = paintA.texture;
    pass(energyMat, energyRT);
    const px = new Uint8Array(4);
    renderer.readRenderTargetPixels(energyRT, 0, 0, 1, 1, px);
    renderer.setRenderTarget(null);
    return px[0] / 255;
  };

  html.classList.add('gl-active');
  readout.textContent = `webgl · ${profile.tier} · paint ${paintA.width}×${paintA.height}`;
  state.gl = true;
  function dispose() {
    unsubscribe();
    for (const o of [paintA, paintB, lowA, lowB, energyRT, quad.geometry, paintMat, blurMat, smearMat, energyMat, sceneTex]) o?.dispose();
    renderer.dispose();
    html.classList.remove('gl-active');
    state.gl = false; state.disposed = true;
  }
  addEventListener('pagehide', dispose, { once: true });
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
await document.fonts.ready;
if (glPossible && motionTier() === 'full') {
  const ok = await start();
  if (!ok) readout.textContent = 'dom (webgl failed)';
} else {
  readout.textContent = motionTier() !== 'full' ? 'dom (reduced motion)' : 'dom (no webgl)';
}

awards.addState(() => ({
  motion: motionTier(),
  gl: state.gl,
  tier: state.tier,
  coarse: state.coarse,
  strokes: state.strokes,
  energy: state.gl ? Math.round(window.__paintEnergy() * 1000) / 1000 : 0,
  titleVisibility: getComputedStyle(document.querySelector('[data-hero-title]')).visibility,
  titleInDom: !!document.querySelector('[data-hero-title]')?.textContent,
  canvasAriaHidden: canvas.getAttribute('aria-hidden') === 'true',
}));
awards.ready();
