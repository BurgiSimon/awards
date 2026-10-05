import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();
const tier = motionTier();
const html = document.documentElement;
const canvas = document.querySelector('.gl');
const readout = document.querySelector('[data-gl-readout]');

// This recipe's own values (not a site's). Phase units: one stripe period = 1.
const P = {
  repetition: 5, // stripes across the stage's short side
  angle: 0.35, // ramp rotation, radians (0 = vertical stripes)
  shiftRed: 0.06, // red reads the stripe this far ahead in phase…
  shiftBlue: 0.05, // …blue this far behind: the dispersion
  bump: 0.22, // radial bend at the centre, in short-side units
  distortion: 0.12, // simplex bend amplitude
  blur: 4, // edge width as a multiple of fwidth (1 = hairline AA)
  speed: 0.18, // phase drift per second (full tier only)
  exposure: 1.1,
  half: [0.44, 0.34], // slab half-size as a fraction of the stage
  radius: 0.08, // slab corner radius, short-side units
};
const STILL_TIME = 1.5; // the frame shown in the reduced and static tiers
const DPR_CAP = 2;
const PIXEL_BUDGET = 4_000_000;

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); // one big triangle
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;
const FRAG = `#version 300 es
precision highp float;
uniform vec2 u_res, u_half, u_shift;
uniform float u_time, u_rep, u_angle, u_bump, u_distort, u_blur, u_exposure, u_radius;
uniform vec3 u_light, u_dark; // linear
out vec4 color;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}
// 2D simplex noise, roughly -1..1.
float simplex(vec2 p) {
  const float K1 = 0.366025404, K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  vec2 o = a.x > a.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 b = a - o + K2, c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash2(i)), dot(b, hash2(i + o)), dot(c, hash2(i + 1.0)));
  return dot(n, vec3(70.0));
}
vec3 aces(vec3 x) { return clamp(x * (2.51 * x + 0.03) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }

void main() {
  vec2 frag = gl_FragCoord.xy;
  float s = min(u_res.x, u_res.y);
  vec2 uv = (frag - 0.5 * u_res) / s; // centred, short side = 1

  // Slab silhouette: rounded-box distance in pixels, one-pixel edge.
  vec2 q = abs(frag - 0.5 * u_res) - u_half * u_res + u_radius * s;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - u_radius * s;
  float shape = clamp(0.5 - d, 0.0, 1.0);

  // Phase: rotated ramp + radial bump + simplex bend, drifting with time.
  float ramp = cos(u_angle) * uv.x + sin(u_angle) * uv.y;
  float bend = u_bump * exp(-dot(uv, uv) * 4.0) + u_distort * simplex(uv * 1.6 + vec2(0.0, u_time * 0.4));
  float phase = (ramp + bend) * u_rep - u_time;
  vec3 ph = phase + vec3(u_shift.x, 0.0, -u_shift.y); // per-channel phase: the dispersion

  // Triangle wave per channel, then coverage re-thresholded from the phase's own screen derivative.
  // max(…, 1e-5): where g is flat fwidth is exactly 0 and the division would blow the edge open.
  vec3 g = abs(fract(ph) - 0.5) * 2.0;
  vec3 w = max(fwidth(g) * u_blur, vec3(1e-5));
  vec3 cov = clamp((g - 0.5) / w + 0.5, 0.0, 1.0);

  vec3 lin = mix(u_dark, u_light, cov) * (0.8 + 0.3 * smoothstep(-0.5, 0.5, uv.y)); // light from above
  vec3 srgb = pow(aces(lin * u_exposure), vec3(1.0 / 2.2)); // inline tone map + gamma, no render target
  float ign = fract(52.9829189 * fract(dot(frag, vec2(0.06711056, 0.00583715)))); // interleaved gradient noise
  srgb += (ign - 0.5) / 255.0;
  color = vec4(srgb * shape, shape); // premultiplied
}`;

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function cssLinear(name) {
  const c = document.createElement('canvas').getContext('2d');
  c.fillStyle = getComputedStyle(html).getPropertyValue(name).trim() || '#fff';
  c.fillRect(0, 0, 1, 1);
  return [...c.getImageData(0, 0, 1, 1).data.slice(0, 3)].map((v) => toLinear(v / 255));
}

const state = { gl: false, time: STILL_TIME, frames: 0, frozen: tier !== 'full', size: null, running: false };
let api = null;

function start() {
  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: true });
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
  const ground = cssLinear('--ground'), ink = cssLinear('--ink');
  gl.uniform3fv(loc('u_light'), ink);
  gl.uniform3fv(loc('u_dark'), ground.map((g, i) => g + (ink[i] - g) * 0.04));
  gl.uniform2f(loc('u_shift'), P.shiftRed, P.shiftBlue);
  gl.uniform2fv(loc('u_half'), P.half);
  for (const [u, v] of [['u_rep', P.repetition], ['u_angle', P.angle], ['u_bump', P.bump], ['u_distort', P.distortion], ['u_blur', P.blur], ['u_exposure', P.exposure], ['u_radius', P.radius]]) gl.uniform1f(loc(u), v);
  const uTime = loc('u_time'), uRes = loc('u_res');

  function resize() {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, DPR_CAP, Math.sqrt(PIXEL_BUDGET / Math.max(1, cw * ch)));
    canvas.width = Math.max(1, Math.round(cw * dpr));
    canvas.height = Math.max(1, Math.round(ch * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    state.size = [canvas.width, canvas.height];
  }
  function draw() {
    gl.uniform1f(uTime, state.time * P.speed); // seconds → phase drift
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    state.frames++;
  }
  // Test readout, read in the same task as a fresh draw: the middle row's R and B, and how many rows are fully opaque.
  function samples() {
    draw();
    const { width: w, height: h } = canvas;
    const px = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const mid = Math.floor(h / 2) * w * 4;
    const r = [], b = [];
    for (let x = 0; x < w; x++) { r.push(px[mid + x * 4]); b.push(px[mid + x * 4 + 2]); }
    let opaqueRows = 0;
    for (let y = 0; y < h; y++) {
      let all = true;
      for (let x = 0; x < w && all; x++) all = px[(y * w + x) * 4 + 3] === 255;
      if (all) opaqueRows++;
    }
    return { r, b, opaqueRows, midAlpha: px[mid + Math.floor(w / 2) * 4 + 3] };
  }

  html.classList.add('gl-active'); // before resize(): the canvas has no box while hidden
  resize();
  draw();

  let resizeQueued = false;
  addEventListener('resize', () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => { resizeQueued = false; resize(); draw(); });
  });
  canvas.addEventListener('webglcontextlost', () => { html.classList.remove('gl-active'); state.gl = false; stopLoop(); });

  // Full tier: drift on the shared ticker while the stage is on screen; the ticker itself stops on hidden tabs.
  let stop = null;
  const step = (dt) => { if (!state.frozen) state.time += dt; draw(); };
  const stopLoop = () => { stop?.(); stop = null; state.running = false; };
  if (tier === 'full') {
    state.time = 0;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !stop) { stop = ticker.add(step); state.running = true; } else if (!e.isIntersecting) stopLoop();
    }).observe(canvas);
  }
  state.gl = true;
  addEventListener('pagehide', () => { stopLoop(); gl.deleteProgram(prog); gl.getExtension('WEBGL_lose_context')?.loseContext(); }, { once: true });
  // Test hook: pin the clock so a frame is reproducible.
  window.__stripes = { freeze(t) { state.time = t; state.frozen = true; draw(); return true; }, time: () => state.time };
  return { samples };
}

try { api = start(); } catch (e) { console.warn('dispersion stripes: falling back to DOM', e); html.classList.remove('gl-active'); }
readout.textContent = api ? `webgl2 · ${tier}` : 'dom (no webgl2)';

awards.addState(() => ({
  motion: tier,
  gl: state.gl,
  time: Number(state.time.toFixed(4)),
  frozen: state.frozen,
  running: state.running,
  size: state.size,
  samples: api ? api.samples() : null,
  canvasAriaHidden: canvas.getAttribute('aria-hidden') === 'true',
}));
awards.ready();
