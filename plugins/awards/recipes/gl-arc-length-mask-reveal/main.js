import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker, damp, clamp } from '../_shared/raf.js';

syncMotionTierAttribute();
const tier = motionTier();
const html = document.documentElement;
const canvas = document.querySelector('.gl');
const route = document.querySelector('[data-route]');
const readout = document.querySelector('[data-gl-readout]');
const progressOut = document.querySelector('[data-progress]');

// Synthetic demo geometry: four cubic Béziers in a 0..1 box (y down), from the foot of the stage to its top edge.
const BRANCHES = [
  [[0.08, 0.94], [0.26, 0.6], [0.06, 0.32], [0.3, 0.06]],
  [[0.32, 0.96], [0.46, 0.66], [0.3, 0.4], [0.54, 0.08]],
  [[0.56, 0.96], [0.7, 0.7], [0.56, 0.42], [0.78, 0.1]],
  [[0.8, 0.94], [0.94, 0.64], [0.8, 0.36], [0.95, 0.08]],
];
const N = BRANCHES.length;
const SEGMENTS = 96; // polyline steps per branch
const RADIUS = 0.034; // stroke half-width as a fraction of the stage's short side
const FEATHER = 0.12; // head length in arc-length units
const STAGGER = 0.2; // progress offset between branch starts; branch i runs over [i·S, i·S + (1 − (N−1)·S)]
const SPAN = 1 - (N - 1) * STAGGER;
const DPR_CAP = 1.5;
const PIXEL_BUDGET = 2_400_000;

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); // one big triangle
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;
const FRAG = `#version 300 es
precision highp float;
uniform highp sampler2D u_meta;
uniform float u_reveal[${N}];
uniform vec3 u_tint[${N}];
uniform float u_feather;
out vec4 color;
void main() {
  ivec2 size = textureSize(u_meta, 0);
  ivec2 px = ivec2(gl_FragCoord.xy);
  vec4 m = texelFetch(u_meta, ivec2(px.x, size.y - 1 - px.y), 0);
  int id = int(m.r * 255.0 + 0.5) - 1;
  if (id < 0) { color = vec4(0.0); return; }
  float arc = (floor(m.g * 255.0 + 0.5) * 256.0 + floor(m.b * 255.0 + 0.5)) / 65535.0; // 16-bit decode
  float edge = m.a * 255.0 / 200.0; // 0 on the centreline, 1 at the stroke side
  float cover = 1.0 - smoothstep(0.9, 1.0, edge);
  float reveal = 0.0; vec3 tint = vec3(1.0);
  for (int i = 0; i < ${N}; i++) if (i == id) { reveal = u_reveal[i]; tint = u_tint[i]; }
  float front = arc + u_feather * edge * edge; // the sides trail the centre: a rounded head
  float visible = 1.0 - smoothstep(reveal - u_feather, reveal, front);
  float shade = 0.55 + 0.45 * sqrt(max(0.0, 1.0 - edge * edge)); // tube shading from the edge field
  float a = cover * visible;
  color = vec4(tint * shade * a, a);
}`;

// Sample each Bézier into a polyline with cumulative pixel arc length, normalised to 0..1.
function polylines(w, h) {
  return BRANCHES.map(([a, b, c, d]) => {
    const pts = [];
    let len = 0;
    for (let s = 0; s <= SEGMENTS; s++) {
      const t = s / SEGMENTS, u = 1 - t;
      const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
      const x = (k[0] * a[0] + k[1] * b[0] + k[2] * c[0] + k[3] * d[0]) * w;
      const y = (k[0] * a[1] + k[1] * b[1] + k[2] * c[1] + k[3] * d[1]) * h;
      if (pts.length) len += Math.hypot(x - pts.at(-1).x, y - pts.at(-1).y);
      pts.push({ x, y, s: len });
    }
    for (const p of pts) p.s /= len;
    return pts;
  });
}

// The mask: per texel, the nearest branch segment within the stroke wins.
// R = branch id + 1 (0 = empty), G/B = arc length × 65535 (high/low byte), A = distance / radius × 200.
function buildMask(w, h, lines) {
  const data = new Uint8Array(w * h * 4);
  const best = new Float32Array(w * h).fill(Infinity);
  const r = RADIUS * Math.min(w, h), reach = r * 1.25;
  lines.forEach((pts, id) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1];
      const dx = q.x - p.x, dy = q.y - p.y, l2 = dx * dx + dy * dy || 1e-6;
      const x0 = Math.max(0, Math.floor(Math.min(p.x, q.x) - reach)), x1 = Math.min(w - 1, Math.ceil(Math.max(p.x, q.x) + reach));
      const y0 = Math.max(0, Math.floor(Math.min(p.y, q.y) - reach)), y1 = Math.min(h - 1, Math.ceil(Math.max(p.y, q.y) + reach));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const px = x + 0.5, py = y + 0.5;
        const t = clamp(((px - p.x) * dx + (py - p.y) * dy) / l2, 0, 1);
        const d = Math.hypot(px - p.x - dx * t, py - p.y - dy * t);
        const k = y * w + x;
        if (d > reach || d >= best[k]) continue;
        best[k] = d;
        const arc = Math.round((p.s + (q.s - p.s) * t) * 65535);
        data.set([id + 1, arc >> 8, arc & 255, Math.min(255, Math.round((d / r) * 200))], k * 4);
      }
    }
  });
  return data;
}

function cssColor(name) {
  const c = document.createElement('canvas').getContext('2d');
  c.fillStyle = getComputedStyle(html).getPropertyValue(name).trim() || '#fff';
  c.fillRect(0, 0, 1, 1);
  return [...c.getImageData(0, 0, 1, 1).data.slice(0, 3)].map((v) => v / 255);
}

// Global progress → per-branch progress, scaled so the feathered head fully clears the end (front max = 1 + feather).
const branchReveal = (p) => Array.from({ length: N }, (_, i) => clamp((p - i * STAGGER) / SPAN, 0, 1) * (1 + 2 * FEATHER + 0.02));
const routeProgress = () => {
  const r = route.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
};

const state = { gl: false, progress: tier === 'full' ? 0 : 1, target: 0, samples: null, size: null };
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
  const accent = cssColor('--accent'), ink = cssColor('--ink');
  gl.uniform3fv(loc('u_tint'), BRANCHES.flatMap((_, i) => accent.map((a, c) => a + (ink[c] - a) * (i / (N - 1)) * 0.6)));
  gl.uniform1f(loc('u_feather'), FEATHER);
  gl.uniform1i(loc('u_meta'), 0);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  const uReveal = loc('u_reveal');
  let lines = [];

  function build() {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, DPR_CAP, Math.sqrt(PIXEL_BUDGET / Math.max(1, cw * ch)));
    const w = Math.max(1, Math.round(cw * dpr)), h = Math.max(1, Math.round(ch * dpr));
    canvas.width = w; canvas.height = h;
    lines = polylines(w, h);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, buildMask(w, h, lines));
    gl.viewport(0, 0, w, h);
    state.size = [w, h];
  }
  function draw() {
    gl.uniform1fv(uReveal, branchReveal(state.progress));
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    progressOut.textContent = Math.round(state.progress * 100);
  }
  // Test readout: alpha on the centreline near each branch's start and end, and at 11 even steps along it, read in the same task as a fresh draw.
  function samples() {
    draw();
    const px = new Uint8Array(4);
    const at = (p) => { gl.readPixels(Math.round(p.x), canvas.height - 1 - Math.round(p.y), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return px[3]; };
    const ladder = (pts) => Array.from({ length: 11 }, (_, k) => at(pts[Math.round(((k + 1) / 12) * SEGMENTS)]));
    return lines.map((pts) => ({ start: at(pts[4]), end: at(pts[SEGMENTS - 4]), ladder: ladder(pts) }));
  }

  html.classList.add('gl-active'); // before build(): the canvas has no box while hidden
  build();
  draw();

  let resizeQueued = false;
  addEventListener('resize', () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => { resizeQueued = false; build(); draw(); });
  });
  canvas.addEventListener('webglcontextlost', () => { html.classList.remove('gl-active'); state.gl = false; });

  if (tier === 'full') {
    // The scroll sets a target; the shared ticker eases toward it and leaves once it arrives.
    const step = (dt) => {
      state.progress = damp(state.progress, state.target, 9, dt);
      if (Math.abs(state.progress - state.target) < 1e-4) { state.progress = state.target; stop(); stop = null; }
      draw();
    };
    let stop = null;
    const wake = () => { state.target = routeProgress(); if (!stop && state.target !== state.progress) stop = ticker.add(step); };
    addEventListener('scroll', wake, { passive: true });
    wake();
  }
  state.gl = true;
  addEventListener('pagehide', () => { gl.deleteTexture(tex); gl.deleteProgram(prog); gl.getExtension('WEBGL_lose_context')?.loseContext(); }, { once: true });
  return { samples };
}

try { api = start(); } catch (e) { console.warn('arc-length reveal: falling back to DOM', e); html.classList.remove('gl-active'); }
readout.textContent = api ? `webgl2 · ${tier}` : 'dom (no webgl2)';

awards.addState(() => ({
  motion: tier,
  gl: state.gl,
  progress: Number(state.progress.toFixed(3)),
  size: state.size,
  samples: api ? api.samples() : null,
  canvasAriaHidden: canvas.getAttribute('aria-hidden') === 'true',
}));
awards.ready();
