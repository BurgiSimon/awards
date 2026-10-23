// The microscope's field, in one fullscreen shader: the paint cross-section magnified, seven layers of pigment grains
// in their binder, the stage moved by the scroll. Raw WebGL2: the scene is one triangle, so a library would only add
// weight. The canvas is aria-hidden; every word stays in the DOM.

import { LAYERS } from '../data/pigments.js';

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;        // drawing-buffer px
uniform float uPx;        // buffer px per css px
uniform float uDepth;     // µm at the vertical centre of the viewport
uniform float uUmPerPx;   // µm per css px (the magnification)
uniform float uIR;        // 0 visible light … 1 infrared luminescence
uniform vec3 uColor[7];   // linear rgb per layer
uniform float uTop[8];    // layer boundaries, µm (7 tops + the last bottom)
uniform float uGrain[7];  // grain size per layer, µm
out vec4 outColor;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 hash2(vec2 p) { float n = hash(p); return vec2(n, hash(p + n + 17.17)); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }

// Cellular grains: distance to the nearest grain centre (f1), to the second (f2), the cell's id, and the vector
// from the point to the nearest centre (for shading a grain as a lit dome or a flat facet).
vec4 cells(vec2 p, float jitter, out vec2 rel) {
  vec2 i = floor(p), f = fract(p);
  float f1 = 8.0, f2 = 8.0; vec2 id = vec2(0.0); rel = vec2(0.0);
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = 0.5 + (hash2(i + g) - 0.5) * jitter;
    vec2 r = g + o - f;
    float d = dot(r, r);
    if (d < f1) { f2 = f1; f1 = d; id = i + g; rel = r; } else if (d < f2) { f2 = d; }
  }
  return vec4(sqrt(f1), sqrt(f2), id);
}

// The boundary between two layers wanders: paint was brushed, not poured.
float boundary(int k, float xum) {
  if (k == 0 || k == 7) return uTop[k] + (fbm(vec2(xum * 0.012, float(k) * 3.1)) - 0.5) * 10.0;
  return uTop[k] + (fbm(vec2(xum * 0.018, float(k) * 7.3)) - 0.5) * 18.0 + (vnoise(vec2(xum * 0.09, float(k))) - 0.5) * 4.0;
}

const vec2 LIGHT = vec2(-0.6, -0.8); // reflected light from the upper left (µm y runs down the section)

// Rounded grains of one size class in their binder, edges warped so no two grains are polygons of the same kind.
vec3 grains(vec2 um, float g, vec3 base, float vMin, float vMax, float fill, float seed) {
  vec2 w = um + (vec2(fbm(um / g * 0.35 + seed), fbm(um / g * 0.35 + seed + 5.2)) - 0.5) * g * 0.9;
  vec2 rel;
  vec4 c = cells(w / g + seed, 0.95, rel);
  float rnd = hash(c.zw + seed);
  float size = fill + 0.18 * hash(c.zw + seed + 1.0);
  float body = smoothstep(size, size - 0.14, c.x) * smoothstep(0.0, 0.07, c.y - c.x);
  vec3 col = base * 0.3; // the binder between grains, oil darkened by the pigment it carries
  vec3 grain = base * mix(vMin, vMax, rnd) * (1.0 + 0.5 * dot(-rel, LIGHT));
  col = mix(col, grain, body);
  // A finer generation of the same pigment fills the binder.
  vec2 rel2;
  vec4 c2 = cells(w / (g * 0.42) + seed + 31.0, 0.95, rel2);
  float body2 = smoothstep(0.4, 0.28, c2.x) * (1.0 - body);
  vec3 grain2 = base * mix(vMin, vMax, hash(c2.zw)) * 0.85 * (1.0 + 0.4 * dot(-rel2, LIGHT));
  return mix(col, grain2, body2 * 0.9);
}

// One layer's paint at a point, as a reflected-light microscope sees it.
vec3 paint(int k, vec2 um, out float glow) {
  glow = 0.0;
  vec3 base = uColor[k];
  float g = uGrain[k];
  vec3 col;
  if (k == 0) {
    // Mummy brown: a translucent glaze, cloudy in depth, with specks of bitumen, amber resin and a few fibres.
    float cloud = fbm(um * 0.02 + 3.0) * 0.6 + fbm(um * 0.08 + 9.0) * 0.4;
    col = base * (0.55 + 0.8 * cloud);
    vec2 rel;
    vec4 c = cells(um / g, 0.95, rel);
    float rnd = hash(c.zw);
    float speck = smoothstep(0.24, 0.14, c.x + 0.12 * vnoise(um * 0.6)) * step(0.72, rnd);
    col = mix(col, base * 0.18, speck * 0.85);
    vec2 relA;
    vec2 wa = um + (vec2(fbm(um * 0.05 + 2.0), fbm(um * 0.05 + 8.0)) - 0.5) * 14.0;
    vec4 a = cells(wa / (g * 2.2) + 7.0, 0.9, relA);
    float amber = smoothstep(0.34, 0.27, a.x) * step(0.93, hash(a.zw));
    col = mix(col, vec3(0.36, 0.17, 0.05) * (1.0 + 0.4 * dot(-relA, LIGHT)), amber * 0.5);
    float t = um.y * 0.06 + fbm(um * 0.015) * 7.0;
    float fibre = smoothstep(0.08, 0.0, abs(fract(t) - 0.5) - 0.42) * smoothstep(0.66, 0.74, fbm(um * 0.008 + 21.0));
    col = mix(col, base * 1.9, fibre * 0.5);
  } else if (k == 1) {
    // Uranium red: a ceramic glaze, glassy and even, with a few bubbles caught in it.
    col = base * (0.85 + 0.3 * fbm(um * 0.03 + 7.0));
    vec2 rel;
    vec4 b = cells(um / 11.0 + 5.0, 1.0, rel);
    float r = 0.16 + 0.16 * hash(b.zw);
    float bub = step(0.8, hash(b.zw + 3.0));
    float inside = smoothstep(r, r - 0.03, b.x);
    float rim = inside - smoothstep(r - 0.04, r - 0.09, b.x);
    float lit = 0.5 + 0.5 * dot(normalize(-rel + 1e-5), LIGHT);
    col = mix(col, base * 0.72, inside * bub * 0.35);
    col = mix(col, base * 1.5 + 0.04, rim * lit * bub * 0.6);
  } else if (k == 2) {
    // Indian yellow: deep and translucent, soft rounded lumps that let the light through.
    vec2 w = um + (vec2(fbm(um * 0.04), fbm(um * 0.04 + 5.2)) - 0.5) * g * 0.8;
    vec2 rel;
    vec4 c = cells(w / g, 0.98, rel);
    float lump = smoothstep(0.85, 0.1, c.x) * (0.75 + 0.25 * hash(c.zw));
    col = base * (0.55 + 0.6 * lump) * (1.0 + 0.25 * dot(-rel, LIGHT)) + vec3(0.05, 0.03, 0.0) * lump;
  } else if (k == 6) {
    // Egyptian blue: angular glassy crystals of every size, blue to turquoise, each face lit flat, with shards and a
    // few colourless quartz grains in a dark binder. The edges break a little but stay straight: this is ground glass.
    vec2 w = um + (vec2(vnoise(um * 0.12), vnoise(um * 0.12 + 3.0)) - 0.5) * 2.5;
    vec2 rel;
    vec4 c = cells(w / g, 0.95, rel);
    float rnd = hash(c.zw);
    float gap = 0.05 + 0.16 * hash(c.zw + 4.0);
    float facet = smoothstep(gap, gap + 0.05, c.y - c.x);
    vec2 dir = normalize(hash2(c.zw + 7.0) - 0.5 + 1e-4);
    vec3 tint = mix(base, vec3(0.04, 0.4, 0.6), rnd * 0.6);
    float face = 0.6 + 0.45 * hash(c.zw + 9.0) + 0.35 * dot(-rel, dir);
    float quartz = step(0.93, hash(c.zw + 13.0));
    vec3 crystal = mix(tint * face, vec3(0.3, 0.34, 0.38) * face, quartz);
    col = mix(base * 0.12, crystal, facet);
    vec2 rel2;
    vec4 c2 = cells(w / (g * 0.3) + 17.0, 0.95, rel2);
    float shard = smoothstep(0.04, 0.09, c2.y - c2.x) * step(0.5, hash(c2.zw)) * (1.0 - facet);
    col = mix(col, mix(base, vec3(0.04, 0.4, 0.6), hash(c2.zw + 2.0) * 0.5) * (0.45 + 0.5 * hash(c2.zw + 1.0)), shard);
    // In infrared only the copper silicate answers; the binder and the quartz stay dark.
    glow = facet * (1.0 - quartz) * (0.3 + 0.7 * hash(c.zw + 2.0)) * (0.65 + 0.35 * smoothstep(0.6, 0.0, c.x)) + shard * 0.35;
  } else if (k == 3) {
    col = grains(um, g, base, 0.7, 1.25, 0.5, 3.0);       // Scheele's green: fine, bright, uneven
  } else if (k == 4) {
    col = grains(um, g, base, 0.92, 1.1, 0.58, 11.0);     // lead-tin yellow: opaque, rounded, packed
  } else {
    col = grains(um, g, base, 0.55, 1.2, 0.56, 19.0);     // Tyrian purple: dense and dark
    col += vec3(0.03, 0.0, 0.01) * hash(floor(um / g));
  }
  return col;
}

void main() {
  vec2 css = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uPx;
  vec2 view = uRes / uPx;
  vec2 um = (css - view * 0.5) * uUmPerPx + vec2(0.0, uDepth);

  // Which layer: the straight boundaries give a first guess; only the two wandering boundaries around it are
  // evaluated (their wander, under 12 µm, is less than half the thinnest layer).
  int k0 = -1;
  for (int i = 0; i < 8; i++) { if (um.y >= uTop[i]) k0 = i; }
  int k = k0;
  float bTop = k0 >= 0 ? boundary(k0, um.x) : -1e4;
  float bBot = k0 < 7 ? boundary(k0 + 1, um.x) : 1e4;
  if (um.y < bTop) { k = k0 - 1; bBot = bTop; bTop = k >= 0 ? boundary(k, um.x) : -1e4; }
  else if (um.y >= bBot) { k = k0 + 1; bTop = bBot; bBot = k < 7 ? boundary(k + 1, um.x) : 1e4; }
  vec3 col;
  float glow = 0.0;
  if (k < 0 || k > 6) {
    // The mounting resin, the same pale cast epoxy as the block in the first screen, so the hero's ground runs into it:
    // faintly mottled, with the fine scratches the polishing left.
    col = vec3(0.6, 0.615, 0.6) * (0.94 + 0.08 * fbm(um * 0.012));
    float scratch = smoothstep(0.035, 0.0, abs(fract((um.x * 0.82 + um.y * 0.57) * 0.045 + fbm(um * 0.004) * 3.0) - 0.5) - 0.465);
    col *= 1.0 - 0.04 * scratch * smoothstep(0.45, 0.7, fbm(um * 0.006 + 4.0));
  } else {
    col = paint(k, um, glow);
  }
  // A thin dark seam where one material lies on another.
  float seam = min(abs(um.y - bTop), abs(um.y - bBot)) / uUmPerPx;
  col *= mix(0.45, 1.0, smoothstep(0.0, 3.0, seam));

  // Focus falls off toward the edges of the field, as a lens does.
  vec2 v = (css / view - 0.5) * vec2(view.x / view.y, 1.0);
  col *= 1.0 - 0.28 * dot(v, v);

  // Infrared: the visible light goes out; the binder and every other layer sink to near-black, Egyptian blue glows.
  vec3 ir = vec3(0.012) + vec3(0.95, 0.93, 0.97) * pow(glow, 1.4) * 1.05;
  col = mix(col, ir, uIR);

  vec3 srgb = mix(col * 12.92, 1.055 * pow(max(col, 0.0), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, col));
  srgb += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  outColor = vec4(clamp(srgb, 0.0, 1.0), 1.0);
}`;

const toLinear = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
};

export function createField(canvas, { pixelRatio = 1 } = {}) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) return null;
  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(prog);

  const u = Object.fromEntries(['uRes', 'uPx', 'uDepth', 'uUmPerPx', 'uIR', 'uColor', 'uTop', 'uGrain'].map((n) => [n, gl.getUniformLocation(prog, n)]));
  gl.uniform3fv(u.uColor, new Float32Array(LAYERS.flatMap((l) => toLinear(l.hex))));
  gl.uniform1fv(u.uTop, new Float32Array([...LAYERS.map((l) => l.top), LAYERS[LAYERS.length - 1].bottom]));
  gl.uniform1fv(u.uGrain, new Float32Array(LAYERS.map((l) => l.grain)));

  let px = pixelRatio;
  let lost = false;
  const onLost = (e) => { e.preventDefault(); lost = true; };
  canvas.addEventListener('webglcontextlost', onLost);

  function resize() {
    const w = Math.max(1, Math.round(canvas.clientWidth * px));
    const h = Math.max(1, Math.round(canvas.clientHeight * px));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(u.uRes, w, h);
    gl.uniform1f(u.uPx, px);
  }

  return {
    render({ depth, umPerPx, ir }) {
      if (lost) return false;
      resize();
      gl.uniform1f(u.uDepth, depth);
      gl.uniform1f(u.uUmPerPx, umPerPx);
      gl.uniform1f(u.uIR, ir);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return true;
    },
    setPixelRatio(p) { px = p; },
    dispose() {
      canvas.removeEventListener('webglcontextlost', onLost);
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(prog);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
