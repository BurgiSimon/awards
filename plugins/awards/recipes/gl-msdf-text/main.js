import * as THREE from 'three';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier } from '../_shared/quality-tiers.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();

const SIZE = 64;    // the glyph em box inside the atlas, in px
const PAD = 12;     // room around each glyph for the distance ramp
const SPREAD = 12;  // px of signed distance mapped across the 0..1 channel range
const CELL = SIZE + PAD * 2;
const INF = 1e20;

const wrap = document.querySelector('[data-headline]');
const mirror = document.querySelector('[data-mirror]');
const canvas = document.querySelector('[data-gl]');
const readout = document.querySelector('[data-readout]');
const text = mirror.textContent.trim();
const state = { gl: false, glyphs: 0, tier: 'pending', disposed: false, atlas: null, ink: null };

// ---- Felzenszwalb exact Euclidean distance transform, one dimension at a time ----
function edt1d(f, d, v, z, n) {
  v[0] = 0; z[0] = -INF; z[1] = INF;
  for (let q = 1, k = 0, s = 0; q < n; q++) {
    do {
      const r = v[k];
      s = (f[q] - f[r] + q * q - r * r) / (2 * q - 2 * r);
    } while (s <= z[k] && --k > -1);
    k++;
    v[k] = q; z[k] = s; z[k + 1] = INF;
  }
  for (let q = 0, k = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k];
    d[q] = (q - r) * (q - r) + f[r];
  }
}

function edt(grid, w, h, f, d, v, z) {
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];
    edt1d(f, d, v, z, h);
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x];
    edt1d(f, d, v, z, w);
    for (let x = 0; x < w; x++) grid[y * w + x] = Math.sqrt(d[x]);
  }
}

// ---- The atlas: rasterise the glyphs this page actually uses, then measure every pixel's distance ----
function buildAtlas(chars, font) {
  const cols = Math.ceil(Math.sqrt(chars.length));
  const rows = Math.ceil(chars.length / cols);
  const w = cols * CELL, h = rows * CELL;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.font = font;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff';
  const m = ctx.measureText('Hg');
  const ascent = m.fontBoundingBoxAscent || m.actualBoundingBoxAscent || SIZE * 0.8;
  const descent = m.fontBoundingBoxDescent || m.actualBoundingBoxDescent || SIZE * 0.2;
  const base = PAD + ascent;
  const cells = new Map();
  chars.forEach((ch, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    ctx.fillText(ch, col * CELL + PAD, row * CELL + base);
    cells.set(ch, { col, row });
  });
  const advances = new Map();
  for (const ch of new Set([...text])) advances.set(ch, ctx.measureText(ch).width);

  const n = w * h;
  const px = ctx.getImageData(0, 0, w, h).data;
  const outer = new Float64Array(n), inner = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = px[i * 4 + 3] / 255;
    outer[i] = a === 1 ? 0 : a === 0 ? INF : Math.max(0, 0.5 - a) ** 2;
    inner[i] = a === 1 ? INF : a === 0 ? 0 : Math.max(0, a - 0.5) ** 2;
  }
  const len = Math.max(w, h);
  const f = new Float64Array(len), d = new Float64Array(len), v = new Int32Array(len + 1), z = new Float64Array(len + 1);
  edt(outer, w, h, f, d, v, z);
  edt(inner, w, h, f, d, v, z);

  // One channel of signed distance, copied to r, g and b: median(r,g,b) is then the field itself,
  // so a real three-channel atlas from msdf-bmfont drops into the same shader unchanged.
  const data = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) {
    const sd = outer[i] - inner[i];
    const val = Math.round(255 * Math.min(1, Math.max(0, 0.5 - sd / (2 * SPREAD))));
    data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = val;
    data[i * 4 + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return { texture, cells, advances, ascent, descent, cols, rows, w, h };
}

const vertex = /* glsl */ `
  attribute float aDelay;
  uniform float uProgress;
  uniform float uRise;
  varying vec2 vUv;
  varying float vReveal;
  void main() {
    vUv = uv;
    vReveal = clamp((uProgress - aDelay) / 0.35, 0.0, 1.0);
    vec3 p = position;
    p.y -= uRise * (1.0 - vReveal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;
const fragment = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying float vReveal;
  float median(float r, float g, float b) { return max(min(r, g), min(max(r, g), b)); }
  void main() {
    vec3 s = texture2D(uAtlas, vUv).rgb;
    float d = median(s.r, s.g, s.b) - 0.5;
    // fwidth is the edge width in screen space: one field, crisp at every scale. It is exactly zero
    // wherever the field has saturated — most of a padded atlas — and dividing by that renders the
    // whole quad opaque on some drivers, so the divisor carries a floor.
    float w = max(fwidth(d), 1e-5);
    float alpha = clamp(d / w + 0.5, 0.0, 1.0) * vReveal;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha);
    // Custom materials convert to the output colour space themselves, or the ink renders dark.
    #include <colorspace_fragment>
  }`;

let renderer = null, scene = null, camera = null, mesh = null, geometry = null, material = null, atlas = null, stop = null;
let inkRect = { x: 0, y: 0, w: 1, h: 1 };
const uniforms = { uAtlas: { value: null }, uColor: { value: new THREE.Color(1, 1, 1) }, uProgress: { value: 0 }, uRise: { value: 0 } };

function fontSpec(px) {
  const cs = getComputedStyle(mirror);
  return `${cs.fontStyle} ${cs.fontWeight} ${px}px ${cs.fontFamily}`;
}

// Lay the string out in CSS pixels: pen advances measured at atlas size and scaled, so the GL line
// lands on the DOM line the browser already drew.
function layout() {
  const cs = getComputedStyle(mirror);
  const fontPx = parseFloat(cs.fontSize);
  const s = fontPx / SIZE;
  const rect = mirror.getBoundingClientRect();
  const box = wrap.getBoundingClientRect();
  const left = rect.left - box.left;
  // line-height is 1, so the baseline is the half-leading plus the ascent.
  const half = (rect.height - (atlas.ascent + atlas.descent) * s) / 2;
  const baseline = rect.top - box.top + half + atlas.ascent * s;

  const pos = [], uvs = [], idx = [], delay = [];
  let pen = 0, drawn = 0, i = 0;
  const chars = [...text];
  for (const ch of chars) {
    const adv = (atlas.advances.get(ch) || SIZE * 0.5) * s;
    const cell = atlas.cells.get(ch);
    if (cell) {
      const x0 = left + pen - PAD * s, x1 = x0 + CELL * s;
      const yTop = -(baseline - (PAD + atlas.ascent) * s), yBot = yTop - CELL * s;
      const u0 = (cell.col * CELL) / atlas.w, u1 = u0 + CELL / atlas.w;
      const v0 = (cell.row * CELL) / atlas.h, v1 = v0 + CELL / atlas.h;
      pos.push(x0, yTop, 0, x1, yTop, 0, x1, yBot, 0, x0, yBot, 0);
      uvs.push(u0, v0, u1, v0, u1, v1, u0, v1);
      const d = (i / chars.length) * 0.6;
      delay.push(d, d, d, d);
      const o = drawn * 4;
      idx.push(o, o + 2, o + 1, o, o + 3, o + 2);
      drawn++;
    }
    pen += adv;
    i++;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setAttribute('aDelay', new THREE.Float32BufferAttribute(delay, 1));
  g.setIndex(idx);
  state.glyphs = drawn;
  inkRect = { x: left, y: baseline - atlas.ascent * s, w: pen, h: (atlas.ascent + atlas.descent) * s };
  return g;
}

function resize() {
  const box = wrap.getBoundingClientRect();
  renderer.setSize(box.width, box.height, false);
  camera.right = box.width;
  camera.bottom = -box.height;
  camera.updateProjectionMatrix();
  if (geometry) geometry.dispose();
  geometry = layout();
  mesh.geometry = geometry;
  uniforms.uColor.value.setStyle(getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#1a1c1c');
}

function sampleInk() {
  if (!renderer) return null;
  // readPixels reads the default framebuffer, so render into it in this same task first.
  renderer.render(scene, camera);
  const gl = renderer.getContext();
  const dpr = renderer.getPixelRatio();
  const x = Math.max(0, Math.round(inkRect.x * dpr));
  const w = Math.max(1, Math.min(Math.round(inkRect.w * dpr), gl.drawingBufferWidth - x));
  const h = Math.max(1, Math.round(inkRect.h * dpr));
  const y = Math.max(0, gl.drawingBufferHeight - Math.round(inkRect.y * dpr) - h);
  const buf = new Uint8Array(w * h * 4);
  gl.readPixels(x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
  let ink = 0;
  for (let i = 3; i < buf.length; i += 4) if (buf[i] > 24) ink++;
  return { ink, of: w * h, fraction: Number((ink / (w * h)).toFixed(3)) };
}

function toDom(reason) {
  mirror.removeAttribute('data-gl-on');
  canvas.style.display = 'none';
  state.gl = false;
  readout.textContent = reason;
  if (stop) { stop(); stop = null; }
  geometry?.dispose();
  material?.dispose();
  atlas?.texture.dispose();
  state.disposed = !!renderer;   // a page that never had WebGL has nothing to have disposed
  renderer?.dispose();
  renderer = null;
  state.ink = null;
}

async function start() {
  const tier = motionTier();
  if (tier === 'static') return toDom('static tier · DOM text');
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return toDom('no WebGL · DOM text');
  }
  THREE.ColorManagement.enabled = true;
  const profile = await detectQualityTier({ sampleMs: 300 });
  state.tier = profile.tier;
  renderer.setPixelRatio(profile.dpr);      // DPR from the tier, never raw devicePixelRatio
  renderer.setClearColor(0x000000, 0);

  await document.fonts?.ready;
  const chars = [...new Set([...text])].filter((ch) => ch.trim());
  atlas = buildAtlas(chars, fontSpec(SIZE));
  state.atlas = { chars: chars.length, cols: atlas.cols, rows: atlas.rows, px: `${atlas.w}×${atlas.h}`, source: 'runtime' };
  uniforms.uAtlas.value = atlas.texture;
  uniforms.uRise.value = tier === 'full' ? 18 : 0;
  uniforms.uProgress.value = tier === 'full' ? 0 : 1;

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(0, 1, 0, -1, -1, 1);
  material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true, depthTest: false, side: THREE.DoubleSide });
  geometry = new THREE.BufferGeometry();
  mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);
  resize();
  addEventListener('resize', resize);
  state.gl = true;
  mirror.setAttribute('data-gl-on', '');
  readout.textContent = `${state.glyphs} glyphs · ${state.atlas.px} atlas`;

  if (tier === 'full') {
    const started = performance.now();
    stop = ticker.add(() => {
      uniforms.uProgress.value = Math.min(1, (performance.now() - started) / 1400);
      renderer.render(scene, camera);
      if (uniforms.uProgress.value === 1) { stop(); stop = null; }   // nothing moves after the reveal
    });
  } else {
    renderer.render(scene, camera);
  }
}

document.querySelector('[data-fallback]').addEventListener('click', () => toDom('disposed · DOM text'));

await start();
awards.addState(() => ({
  motion: motionTier(),
  gl: state.gl,
  tier: state.tier,
  glyphs: state.glyphs,
  atlas: state.atlas,
  disposed: state.disposed,
  mirror: mirror.textContent.trim(),
  mirrorColor: getComputedStyle(mirror).color,
  canvasAriaHidden: canvas.getAttribute('aria-hidden') === 'true',
  progress: Number(uniforms.uProgress.value.toFixed(2)),
  ink: state.gl ? sampleInk() : null,
}));
awards.ready();
