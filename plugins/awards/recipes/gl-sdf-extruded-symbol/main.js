import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();
const tier = motionTier();
const html = document.documentElement;
const canvas = document.querySelector('.gl');
const readout = document.querySelector('[data-gl-readout]');

// This recipe's own values (not a site's). Units: the mark's ring radius is .62.
const P = {
  depth: 0.16, // half-thickness of the slab
  bevel: 0.055, // edge rounding radius (0 = hard edge, no bevel ring)
  steps: 80, // raymarch budget
  hit: 5e-4, // surface threshold
  tint: [0.93, 0.94, 0.96], // Schlick F0: near-neutral metal
  exposure: 1.15,
  camDist: 3.2,
  focal: 2.6,
  introDepth: 0.9, // s: depth grows from the bevel to full
  introTurn: 1.6, // s: yaw settles from -90° to 0
  sway: 0.32, // rad, yaw swing after the intro
  swayRate: 0.55, // rad/s
};
const DPR_CAP = 2;
const PIXEL_BUDGET = 2_000_000; // raymarching is per pixel: keep the budget lower than a flat shader's

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); // one big triangle
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;
const FRAG = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_yaw, u_depth, u_bevel, u_hit, u_exposure, u_camDist, u_focal;
uniform vec3 u_tint;
uniform int u_debug; // 1: write the view-space normal instead of colour (verification only)
out vec4 color;
#define STEPS ${P.steps}

// The 2D mark: a ring and a diagonal capsule. Any 2D SDF can go here, including one sampled from a baked texture.
float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a, ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)) - r;
}
float mark(vec2 p) {
  float ring = abs(length(p) - 0.62) - 0.08;
  float bar = sdCapsule(p, vec2(-0.55, -0.55), vec2(0.55, 0.55), 0.08);
  return min(ring, bar);
}
// Extrude, then round: shrink the profile and the depth by the bevel, subtract it after.
float map(vec3 p) {
  vec2 w = vec2(mark(p.xy) + u_bevel, abs(p.z) - (u_depth - u_bevel));
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - u_bevel;
}
vec3 normalAt(vec3 p) { // tetrahedron: four taps
  const vec2 k = vec2(1.0, -1.0);
  const float h = 5e-4;
  return normalize(k.xyy * map(p + k.xyy * h) + k.yyx * map(p + k.yyx * h) + k.yxy * map(p + k.yxy * h) + k.xxx * map(p + k.xxx * h));
}
float ambientOcclusion(vec3 p, vec3 n) { // four taps along the normal
  float occ = 0.0, wgt = 1.0;
  for (int i = 1; i <= 4; i++) {
    float h = 0.02 + 0.05 * float(i);
    occ += (h - map(p + n * h)) * wgt;
    wgt *= 0.6;
  }
  return clamp(1.0 - 2.5 * occ, 0.0, 1.0);
}
// Studio environment: dark straight ahead, a bright ring at grazing angles, brighter overhead, one soft key.
vec3 env(vec3 r) {
  float ring = smoothstep(0.25, 0.85, 1.0 - abs(r.z));
  float sky = 0.55 + 0.45 * r.y;
  vec3 key = normalize(vec3(-0.45, 0.56, 0.7));
  return vec3(0.025) + vec3(1.0, 0.98, 0.95) * ring * sky * 1.6 + vec3(2.5) * pow(max(dot(r, key), 0.0), 60.0);
}
vec3 aces(vec3 x) { return clamp(x * (2.51 * x + 0.03) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / (0.5 * min(u_res.x, u_res.y));
  float c = cos(u_yaw), s = sin(u_yaw);
  mat3 rot = mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); // yaw about Y
  vec3 ro = rot * vec3(0.0, 0.0, u_camDist);
  vec3 rd = rot * normalize(vec3(uv, -u_focal));

  // Clip the ray to the mark's box: pixels that miss it never march.
  vec3 bmax = vec3(0.72, 0.72, u_depth + 0.01);
  vec3 inv = 1.0 / rd, t0 = (-bmax - ro) * inv, t1 = (bmax - ro) * inv;
  vec3 tmin = min(t0, t1), tmax = max(t0, t1);
  float tn = max(max(tmin.x, tmin.y), tmin.z), tf = min(min(tmax.x, tmax.y), tmax.z);
  if (tn > tf || tf < 0.0) { color = vec4(0.0); return; }

  float t = max(tn, 0.0);
  bool hit = false;
  for (int i = 0; i < STEPS; i++) {
    float d = map(ro + rd * t);
    if (d < u_hit) { hit = true; break; }
    t += d;
    if (t > tf) break;
  }
  if (!hit) { color = vec4(0.0); return; }

  vec3 p = ro + rd * t, n = normalAt(p);
  if (u_debug == 1) { color = vec4(transpose(rot) * n * 0.5 + 0.5, 1.0); return; } // view-space normal
  vec3 r = reflect(rd, n);
  float cosv = clamp(dot(n, -rd), 0.0, 1.0);
  vec3 F = u_tint + (1.0 - u_tint) * pow(1.0 - cosv, 5.0); // Schlick on the tint
  vec3 lin = env(r) * F * ambientOcclusion(p, n);
  vec3 srgb = pow(aces(lin * u_exposure), vec3(1.0 / 2.2)); // inline tone map + gamma, no render target
  color = vec4(srgb, 1.0);
}`;

const state = { gl: false, time: 0, frames: 0, frozen: tier !== 'full', size: null, running: false, pose: { yaw: 0, depth: 1 } };
let api = null;
const easeOut = (x) => 1 - (1 - Math.min(1, Math.max(0, x))) ** 3;

function start() {
  // Reduced and static tiers keep the SVG still: no context is created at all.
  if (tier !== 'full') return null;
  const gl = canvas.getContext('webgl2', { antialias: true, premultipliedAlpha: true });
  if (!gl) return null;
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  gl.bindVertexArray(gl.createVertexArray());
  const loc = (n) => gl.getUniformLocation(prog, n);
  gl.uniform3fv(loc('u_tint'), P.tint);
  for (const [u, v] of [['u_bevel', P.bevel], ['u_hit', P.hit], ['u_exposure', P.exposure], ['u_camDist', P.camDist], ['u_focal', P.focal]]) gl.uniform1f(loc(u), v);
  const uYaw = loc('u_yaw'), uDepth = loc('u_depth'), uRes = loc('u_res'), uDebug = loc('u_debug');

  function resize() {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, DPR_CAP, Math.sqrt(PIXEL_BUDGET / Math.max(1, cw * ch)));
    canvas.width = Math.max(1, Math.round(cw * dpr));
    canvas.height = Math.max(1, Math.round(ch * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    state.size = [canvas.width, canvas.height];
  }
  // Intro: depth grows out of the flat mark, yaw settles from -90°, then a slow sway.
  function pose(t) {
    const d = easeOut(t / P.introDepth), turn = easeOut(t / P.introTurn);
    return { yaw: -Math.PI / 2 * (1 - turn) + P.sway * turn * Math.sin(Math.max(0, t - P.introTurn) * P.swayRate), depth: d };
  }
  function draw(debug = 0) {
    if (!state.frozen) state.pose = pose(state.time);
    const minDepth = P.bevel + 0.004; // the rounding needs depth > bevel
    gl.uniform1f(uYaw, state.pose.yaw);
    gl.uniform1f(uDepth, minDepth + (P.depth - minDepth) * state.pose.depth);
    gl.uniform1i(uDebug, debug);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    state.frames++;
  }
  const read = () => {
    const px = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return px;
  };
  // Test readout, each read in the same task as a fresh draw: a normal pass classifies face and bevel pixels, the colour pass is measured.
  function samples() {
    const { width: w, height: h } = canvas;
    draw(1); const nrm = read();
    draw(0); const col = read();
    const at = (x, y) => (y * w + x) * 4;
    let face = 0, faceN = 0, bevel = 0, bevelN = 0;
    for (let i = 0; i < nrm.length; i += 4) {
      if (nrm[i + 3] !== 255) continue;
      const nz = nrm[i + 2] / 127.5 - 1;
      const lum = 0.2126 * col[i] + 0.7152 * col[i + 1] + 0.0722 * col[i + 2];
      if (nz > 0.985) { face += lum; faceN++; } else if (nz > 0.15 && nz < 0.9) { bevel += lum; bevelN++; }
    }
    return {
      centreAlpha: col[at(w >> 1, h >> 1) + 3],
      cornerAlpha: Math.max(col[at(2, 2) + 3], col[at(w - 3, h - 3) + 3]),
      faceLum: faceN ? +(face / faceN).toFixed(1) : null, faceN,
      bevelLum: bevelN ? +(bevel / bevelN).toFixed(1) : null, bevelN,
    };
  }

  html.classList.add('gl-active'); // before resize(): the canvas has no box while hidden
  resize();
  draw();

  let resizeQueued = false;
  addEventListener('resize', () => {
    if (resizeQueued || !state.gl) return;
    resizeQueued = true;
    requestAnimationFrame(() => { resizeQueued = false; if (state.gl) { resize(); draw(); } });
  });
  // Any context loss falls back to the SVG still for good.
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); html.classList.remove('gl-active'); state.gl = false; stopLoop(); readout.textContent = 'svg (context lost)'; });

  // Full tier: run on the shared ticker while the stage is on screen; the ticker itself stops on hidden tabs.
  let stop = null;
  const step = (dt) => { if (!state.gl) return; if (!state.frozen) state.time += dt; draw(); };
  const stopLoop = () => { stop?.(); stop = null; state.running = false; };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !stop && state.gl) { stop = ticker.add(step); state.running = true; } else if (!e.isIntersecting) stopLoop();
  }).observe(canvas);
  state.gl = true;
  addEventListener('pagehide', () => { stopLoop(); gl.deleteProgram(prog); gl.getExtension('WEBGL_lose_context')?.loseContext(); }, { once: true });
  // Test hooks: pin a pose so a frame is reproducible; force a context loss to prove the fallback.
  window.__symbol = {
    freeze(yaw = 0, depth = 1) { state.pose = { yaw, depth }; state.frozen = true; draw(); return true; },
    loseContext() { const ext = gl.getExtension('WEBGL_lose_context'); ext?.loseContext(); return !!ext; },
  };
  return { samples };
}

try { api = start(); } catch (e) { console.warn('sdf symbol: keeping the SVG still', e); html.classList.remove('gl-active'); }
readout.textContent = api ? `webgl2 · ${tier}` : `svg · ${tier}`;

const fallback = document.querySelector('.fallback');
awards.addState(() => ({
  motion: tier,
  gl: state.gl,
  frozen: state.frozen,
  running: state.running,
  size: state.size,
  pose: state.pose,
  samples: api && state.gl ? api.samples() : null,
  canvasDisplay: getComputedStyle(canvas).display,
  svgVisible: getComputedStyle(fallback).display !== 'none' && fallback.getBoundingClientRect().width > 0,
  canvasAriaHidden: canvas.getAttribute('aria-hidden') === 'true',
}));
awards.ready();
