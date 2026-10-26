import * as THREE from 'three';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier } from '../_shared/quality-tiers.js';
import { ticker, clamp } from '../_shared/raf.js';

// One faceted glass object over the page, refracting the page itself:
//   1. the words and hairlines around the glass are painted again into a square 2D canvas (the "back" texture)
//   2. a back-face pass writes the glass's exit normals into a small target
//   3. the front face refracts through both normals, sampling the back texture at 12 wavelengths (6 on touch),
//      weighted into red, green and blue, then adds a Fresnel reflection of an analytic studio of soft boxes
// Each section names an anchor; the glass follows their weighted mean on a stiff spring.

syncMotionTierAttribute();
const html = document.documentElement;
const canvas = document.querySelector('[data-gl]');
const readout = document.querySelector('[data-gl-readout]');
const tier = motionTier();
const coarse = matchMedia('(pointer: coarse)').matches;
const sections = [...document.querySelectorAll('[data-anchor]')];
const state = { gl: false, x: 0, y: 0, r: 0, tx: 0, ty: 0, tr: 0, err: 0, rotY: 0, repaints: 0, region: 0, taps: coarse ? 6 : 12, frames: 0, motion: tier };

// This recipe's own values.
const SPRING = 46, DAMP = 2 * Math.sqrt(46) * 0.94;   // stiff and just under critical: it arrives without drifting past
const BAND = [0.25, 0.75];                              // sections are weighted by their overlap with this band of the viewport
const GLASS = { ior: 1.31, spread: 0.06, thickness: 0.45, spin: 0.25 };
const BACK_SIZE = coarse ? 512 : 1024;

const vertFront = /* glsl */ `
  varying vec3 vN; varying vec3 vViewPos;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz; vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }`;
const fragBackNormal = /* glsl */ `
  varying vec3 vN; varying vec3 vViewPos;
  void main() { gl_FragColor = vec4(normalize(vN) * 0.5 + 0.5, 1.0); }`;
const fragFront = (taps) => /* glsl */ `
  #define TAPS ${taps}
  uniform sampler2D tBack; uniform sampler2D tBackN; uniform vec2 uBufInv; uniform vec2 uView; uniform float uDpr;
  uniform vec3 uReg; uniform float uIor; uniform float uSpread; uniform float uThick; uniform float uTime;
  varying vec3 vN; varying vec3 vViewPos;
  float softBox(vec3 R, vec3 dir, vec2 size, float soft) {
    float facing = dot(R, dir);
    if (facing <= 0.0) return 0.0;
    vec3 up = abs(dir.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    vec3 u = normalize(cross(up, dir)), v = cross(dir, u);
    vec2 q = vec2(dot(R, u), dot(R, v)) / facing;
    vec2 d = abs(q) - size;
    return 1.0 - smoothstep(-soft, soft, length(max(d, 0.0)) + min(max(d.x, d.y), 0.0));
  }
  vec3 studio(vec3 R) {
    vec3 c = mix(vec3(0.08), vec3(0.97), smoothstep(-0.4, 0.9, R.y)) * 0.3;
    // the key drifts slowly, so highlights travel over the facets even when the glass is still
    c += 4.0 * softBox(R, normalize(vec3(-0.45 + 0.12 * sin(uTime * 0.21), 0.62, 0.65 + 0.1 * cos(uTime * 0.17))), vec2(0.3, 0.12), 0.05);
    c += 7.0 * softBox(R, normalize(vec3(0.7, 0.15, 0.7)), vec2(0.03, 0.85), 0.02);
    c += 4.0 * softBox(R, normalize(vec3(0.1, -0.6, 0.8)), vec2(0.4, 0.05), 0.04);
    return c;
  }
  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(-vViewPos);
    float ndv = clamp(dot(N, V), 0.0, 1.0);
    vec2 css = vec2(gl_FragCoord.x / uDpr, uView.y - gl_FragCoord.y / uDpr);
    vec3 Nb = normalize(texture2D(tBackN, gl_FragCoord.xy * uBufInv).xyz * 2.0 - 1.0);
    vec3 acc = vec3(0.0), wsum = vec3(0.0);
    for (int i = 0; i < TAPS; i++) {
      float t = float(i) / float(TAPS - 1);
      float ior = uIor - (t - 0.5) * uSpread;              // red (t high) bends least
      vec3 r1 = refract(-V, N, 1.0 / ior);
      vec3 r2 = refract(r1, -Nb, ior);
      if (dot(r2, r2) < 1e-4) r2 = r1;                      // total internal reflection: keep the entry bend
      vec2 bend = r2.xy + V.xy;                               // deviation from the straight-through ray
      vec2 p = css + vec2(bend.x, -bend.y) * uThick;
      vec2 uv = (p - uReg.xy) / uReg.z;
      vec3 s = texture2D(tBack, vec2(uv.x, 1.0 - uv.y)).rgb;
      vec3 wv = exp(-pow(vec3(t) - vec3(0.8, 0.5, 0.2), vec3(2.0)) / (2.0 * 0.19 * 0.19));
      acc += s * wv; wsum += wv;
    }
    vec3 refr = acc / wsum;
    refr = mix(refr, vec3(0.96), 0.03 + 0.14 * pow(1.0 - ndv, 2.0));   // a little frost toward the rims
    float F = 0.06 + 0.94 * pow(1.0 - ndv, 4.0);
    gl_FragColor = vec4(mix(refr, studio(reflect(-V, N)), F), 1.0);
    #include <colorspace_fragment>
  }`;

function crystal() {
  // Seeded points on an elongated ellipsoid plus two tips: a carved, irregular gem with flat facets.
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pts = [new THREE.Vector3(0, 1.3, 0.05), new THREE.Vector3(0.05, -1.25, -0.05)];
  for (let i = 0; i < 18; i++) {
    const u = rnd() * Math.PI * 2, v = Math.acos(2 * rnd() - 1);
    pts.push(new THREE.Vector3(Math.sin(v) * Math.cos(u) * 0.8, Math.cos(v) * 1.05, Math.sin(v) * Math.sin(u) * 0.66).multiplyScalar(0.9 + rnd() * 0.15));
  }
  return new ConvexGeometry(pts);
}

async function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { return false; }
  const profile = await detectQualityTier({ sampleMs: 250 });
  renderer.setPixelRatio(profile.dpr);
  renderer.setClearColor(0x000000, 0);

  // The back texture: a square 2D canvas repainted with the page around the glass.
  const back = document.createElement('canvas'); back.width = back.height = BACK_SIZE;
  const bctx = back.getContext('2d');
  const backTex = new THREE.CanvasTexture(back);
  backTex.colorSpace = THREE.SRGBColorSpace; backTex.minFilter = THREE.LinearFilter; backTex.generateMipmaps = false;
  const normalRT = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: true, generateMipmaps: false });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 5000);
  camera.position.z = 1600;
  const geo = crystal();
  const backMat = new THREE.ShaderMaterial({ vertexShader: vertFront, fragmentShader: fragBackNormal, side: THREE.BackSide });
  const frontU = { tBack: { value: backTex }, tBackN: { value: normalRT.texture }, uBufInv: { value: new THREE.Vector2() }, uView: { value: new THREE.Vector2() }, uDpr: { value: 1 }, uReg: { value: new THREE.Vector3() }, uIor: { value: GLASS.ior }, uSpread: { value: GLASS.spread }, uThick: { value: 100 }, uTime: { value: 0 } };
  const frontMat = new THREE.ShaderMaterial({ vertexShader: vertFront, fragmentShader: fragFront(state.taps), uniforms: frontU });
  const mesh = new THREE.Mesh(geo, frontMat);
  scene.add(mesh);

  // Page geometry the back texture needs: every word's box (document coordinates) and the hairlines' x.
  let words = [], cols = [], W = 1, H = 1, ground = '#ecebe6', rule = 'rgba(18,18,18,0.14)';
  function measurePage() {
    words = [];
    const cs = getComputedStyle(html);
    ground = cs.getPropertyValue('--ground').trim() || ground;
    rule = cs.getPropertyValue('--rule').trim() || rule;
    cols = [...document.querySelectorAll('.cols i')].filter((i) => i.offsetParent !== null).flatMap((i, n, all) => { const r = i.getBoundingClientRect(); return n === all.length - 1 ? [r.left, r.right - 1] : [r.left]; });
    const range = document.createRange();
    for (const el of document.querySelectorAll('[data-paint]')) {
      const st = getComputedStyle(el);
      const font = `${st.fontStyle} ${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const re = /\S+/g; let m;
        while ((m = re.exec(node.data))) {
          range.setStart(node, m.index); range.setEnd(node, m.index + m[0].length);
          const r = range.getBoundingClientRect();
          if (!r.width) continue;
          words.push({ text: m[0], x: r.left, y: r.top + scrollY, w: r.width, h: r.height, font, color: st.color, ls: st.letterSpacing });
        }
      }
    }
  }
  function paintBack(rx, ry, rs) {
    const k = BACK_SIZE / rs;
    bctx.setTransform(k, 0, 0, k, -rx * k, -ry * k);
    bctx.fillStyle = ground; bctx.fillRect(rx, ry, rs, rs);
    bctx.fillStyle = rule;
    for (const x of cols) if (x >= rx - 1 && x <= rx + rs) bctx.fillRect(x, ry, 1, rs);
    bctx.textBaseline = 'middle';
    for (const wd of words) {
      const y = wd.y - scrollY;
      if (wd.x > rx + rs || wd.x + wd.w < rx || y > ry + rs || y + wd.h < ry) continue;
      bctx.font = wd.font; bctx.fillStyle = wd.color;
      if ('letterSpacing' in bctx) bctx.letterSpacing = wd.ls === 'normal' ? '0px' : wd.ls;
      bctx.fillText(wd.text, wd.x, y + wd.h / 2);
    }
    backTex.needsUpdate = true;
    state.repaints++;
  }

  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.fov = (2 * Math.atan(H / 2 / camera.position.z) * 180) / Math.PI;   // 1 unit = 1 CSS px at z = 0
    camera.updateProjectionMatrix();
    const pr = renderer.getPixelRatio();
    normalRT.setSize(Math.max(1, Math.round(W * pr * 0.6)), Math.max(1, Math.round(H * pr * 0.6)));
    frontU.uBufInv.value.set(1 / (W * pr), 1 / (H * pr));
    frontU.uView.value.set(W, H); frontU.uDpr.value = pr;
    measurePage();
    lastPaint = '';
  }

  // Anchors: weighted by each section's overlap with the middle band of the viewport.
  function targetFromAnchors() {
    let sw = 0, tx = 0, ty = 0, tr = 0;
    const lo = BAND[0] * H, hi = BAND[1] * H, short = Math.min(W, H);
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      const wgt = Math.max(0, Math.min(r.bottom, hi) - Math.max(r.top, lo)) / (hi - lo);
      if (wgt <= 0) continue;
      const [ax, ay, as] = s.dataset.anchor.split(',').map(Number);
      sw += wgt; tx += wgt * ax * W; ty += wgt * ay * H; tr += wgt * as * short * 0.5 * (W < 760 ? 1.35 : 1);
    }
    if (sw > 0) { state.tx = tx / sw; state.ty = ty / sw; state.tr = tr / sw; }
  }

  const v = { x: 0, y: 0, r: 0 };
  const pointer = { x: 0, y: 0, tiltX: 0, tiltY: 0 };
  if (!coarse) addEventListener('pointermove', (e) => { pointer.x = e.clientX / W - 0.5; pointer.y = e.clientY / H - 0.5; }, { passive: true });
  let lastScroll = scrollY, scrollVel = 0, time = 0, lastPaint = '', lastPaintAt = 0;

  resize();
  targetFromAnchors();
  state.x = state.tx; state.y = state.ty; state.r = state.tr;
  addEventListener('resize', () => { resize(); targetFromAnchors(); });

  function render(now) {
    // Region: a square around the glass, big enough for the refracted offsets, snapped to 48 px steps.
    const rs = Math.min(0.75 * Math.max(W, H), Math.ceil((2 * (state.r * 2 + 8)) / 48) * 48);
    const rx = Math.round(state.x - rs / 2), ry = Math.round(state.y - rs / 2);
    const key = `${rx},${ry},${rs},${Math.round(scrollY)}`;
    if (key !== lastPaint && now - lastPaintAt > (Math.abs(scrollVel) > 250 ? 12 : 30)) { paintBack(rx, ry, rs); lastPaint = key; lastPaintAt = now; }
    frontU.uReg.value.set(rx, ry, rs);
    frontU.uThick.value = state.r * GLASS.thickness;
    state.region = rs;
    mesh.position.set(state.x - W / 2, H / 2 - state.y, 0);
    mesh.scale.setScalar(state.r);
    mesh.rotation.set(0.35 + pointer.tiltY, state.rotY, 0.12 + pointer.tiltX);
    mesh.material = backMat; renderer.setRenderTarget(normalRT); renderer.render(scene, camera);
    mesh.material = frontMat; renderer.setRenderTarget(null); renderer.render(scene, camera);
    state.frames++;
  }

  const unsubscribe = ticker.add((dt, now) => {
    time += dt; frontU.uTime.value = tier === 'full' ? time : 0;
    scrollVel = (scrollY - lastScroll) / Math.max(dt, 1e-3); lastScroll = scrollY;
    targetFromAnchors();
    if (tier === 'full') {
      // The spring integrates real time in fixed 1/120 s steps, so a slow frame neither slows it down nor blows it up.
      const steps = Math.max(1, Math.ceil(dt * 120)), h = dt / steps;
      for (let n = 0; n < steps; n++) for (const k of ['x', 'y', 'r']) {
        const t = state['t' + k];
        v[k] += (SPRING * (t - state[k]) - DAMP * v[k]) * h;
        state[k] += v[k] * h;
      }
      state.rotY += (GLASS.spin + clamp(scrollVel * 8e-4, -1.6, 1.6)) * dt;
      pointer.tiltX += (pointer.x * 0.5 - pointer.tiltX) * (1 - Math.exp(-4 * dt));
      pointer.tiltY += (pointer.y * 0.45 - pointer.tiltY) * (1 - Math.exp(-4 * dt));
    } else {
      // Reduced motion: the glass is placed at its anchor, never travels, never spins.
      state.x = state.tx; state.y = state.ty; state.r = state.tr;
    }
    state.err = Math.round(Math.hypot(state.tx - state.x, state.ty - state.y) * 100) / 100;
    render(now);
  });

  // Test hook: a fresh frame, then a grid of pixels inside the glass read in the same task.
  window.__lens = {
    back,
    sample() {
      render(performance.now() + 1000);
      const gl = renderer.getContext(), pr = renderer.getPixelRatio(), px = new Uint8Array(4);
      const lum = [], chroma = [];
      let opaque = 0;
      for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) {
        const x = state.x + (i / 4) * state.r * 0.45, y = state.y + (j / 4) * state.r * 0.45;
        gl.readPixels(Math.round(x * pr), Math.round((H - y) * pr), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        if (px[3] > 250) opaque++;
        lum.push(0.2126 * px[0] + 0.7152 * px[1] + 0.0722 * px[2]);
        chroma.push(Math.max(px[0], px[1], px[2]) - Math.min(px[0], px[1], px[2]));
      }
      const mean = lum.reduce((a, b) => a + b, 0) / lum.length;
      const sd = Math.sqrt(lum.reduce((a, b) => a + (b - mean) ** 2, 0) / lum.length);
      return { opaque, lumSd: Math.round(sd * 10) / 10, maxChroma: Math.max(...chroma) };
    },
  };

  html.classList.add('gl-active');
  readout.textContent = `webgl · ${profile.tier} · ${state.taps} taps`;
  state.gl = true;
  addEventListener('pagehide', () => {
    unsubscribe();
    for (const o of [geo, backMat, frontMat, backTex, normalRT]) o.dispose();
    renderer.dispose(); html.classList.remove('gl-active'); state.gl = false;
  }, { once: true });
  return true;
}

const glPossible = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
await document.fonts.ready;
if (glPossible && tier !== 'static') { if (!(await start())) readout.textContent = 'dom (webgl failed)'; }
else readout.textContent = tier === 'static' ? 'dom (static tier)' : 'dom (no webgl)';

awards.addState(() => {
  const round = (n) => Math.round(n * 10) / 10;
  return { ...state, x: round(state.x), y: round(state.y), r: round(state.r), tx: round(state.tx), ty: round(state.ty), tr: round(state.tr), rotY: Math.round(state.rotY * 1000) / 1000, vw: innerWidth, vh: innerHeight, canvasAriaHidden: canvas.getAttribute('aria-hidden') === 'true' };
});
awards.ready();
