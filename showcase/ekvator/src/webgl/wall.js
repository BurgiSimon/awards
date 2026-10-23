// The wall, in one fullscreen shader: procedural plaster relief lit by the borrowed sun's direction and the window
// patch with its mullion. Raw WebGL2: the scene is one triangle,
// so a library would only add weight. The canvas is aria-hidden; every word stays in the DOM.

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;          // drawing-buffer size in px
uniform float uPx;          // buffer px per css px
uniform float uScroll;      // css px the wall has scrolled under the window
uniform vec3 uAmbient;      // linear rgb of the unlit plaster
uniform vec3 uLight;        // linear rgb × intensity of the window light
uniform vec4 uPatch;        // cx, top, width, height (css px)
uniform vec2 uShape;        // slope, softness (css px)
uniform vec3 uDir;          // light direction in wall space (x right, y up, z out)
uniform float uGrazing;     // 0 frontal … 1 raking
uniform float uNight;       // 0 day … 1 night: how much relief the sky still shows
out vec4 outColor;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
// Gradient noise with a quintic fade: smooth slopes, so raking light shows trowel marks, not a pixel grid.
vec2 grad(vec2 i) { float a = hash(i) * 6.2831853; return vec2(cos(a), sin(a)); }
float gnoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(grad(i), f);
  float b = dot(grad(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(grad(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(grad(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// Plaster: broad trowel sweeps bent by a slower field, a mid swirl and a soft fine layer.
float plaster(vec2 p) {
  vec2 q = p * 0.0034;
  vec2 warp = vec2(gnoise(q * 0.6 + 1.7), gnoise(q * 0.6 + 9.2)) * 1.1;
  float h = 0.6 * gnoise(q + warp);
  h += 0.27 * gnoise(p * 0.0105 + 7.1);
  h += 0.13 * gnoise(p * 0.028 + 3.3);
  return h;
}
float grain(vec2 p) { return gnoise(p * 0.45) * 0.5 + 0.5; }

float bandIn(float v, float a, float b, float s) { return smoothstep(a - s, a + s, v) * (1.0 - smoothstep(b - s, b + s, v)); }

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uPx; // css px, y down
  vec2 wp = vec2(frag.x, frag.y + uScroll);

  // Relief normal from the height field.
  float e = 2.5;
  float h0 = plaster(wp);
  float hx = plaster(wp + vec2(e, 0.0));
  float hy = plaster(wp + vec2(0.0, e));
  float strength = mix(0.5, 1.3, uGrazing) * mix(1.0, 0.35, uNight) * 46.0 / e;
  vec3 n = normalize(vec3(-(hx - h0) * strength, (hy - h0) * strength, 1.0));

  // The window patch: a parallelogram with soft edges and a cross-shaped mullion shadow.
  float x0 = uPatch.x - uPatch.z * 0.5;
  float u = (frag.x - x0) / uPatch.z;
  float yTop = uPatch.y + (uPatch.x - frag.x) * uShape.x;
  float v = (frag.y - yTop) / uPatch.w;
  float su = uShape.y / uPatch.z;
  float sv = uShape.y / uPatch.w;
  float inside = bandIn(u, 0.0, 1.0, su) * bandIn(v, 0.0, 1.0, sv);
  float mullion = 1.0 - bandIn(u, 0.478, 0.522, su * 0.6) * 0.92;
  mullion *= 1.0 - bandIn(v, 0.452, 0.478, sv * 0.6) * 0.92;
  float win = inside * mullion;

  // Lambert against the flat wall, so relief modulates the light rather than dimming it.
  float flatLit = max(uDir.z, 0.08);
  float lit = clamp(mix(1.0, dot(n, uDir) / flatLit, 0.5), 0.65, 1.45);
  float sky = mix(1.0 + (n.y * 0.05), 1.0, uNight);
  float sand = 1.0 + (grain(wp) - 0.5) * 0.035;

  vec3 col = uAmbient * sky * sand;
  col += uLight * win * lit * 0.9;
  // A faint bounce around the patch: light scattered off the floor and the room.
  float halo = bandIn(u, -0.35, 1.35, 0.35) * bandIn(v, -0.25, 1.25, 0.3);
  col += uLight * 0.05 * halo;

  // Linear → sRGB, with a little dither so the long gradients never band.
  vec3 srgb = mix(col * 12.92, 1.055 * pow(col, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, col));
  srgb += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  outColor = vec4(clamp(srgb, 0.0, 1.0), 1.0);
}`;

export function createWall(canvas, profile) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) return null;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
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

  const U = {};
  for (const name of ['uRes', 'uPx', 'uScroll', 'uAmbient', 'uLight', 'uPatch', 'uShape', 'uDir', 'uGrazing', 'uNight']) U[name] = gl.getUniformLocation(prog, name);

  // Resolution budget: the light is soft, so the wall renders under the device pixel ratio on every tier.
  const scaleByTier = { high: 1, mid: 0.75, low: 0.5 };
  let px = 1;
  function resize() {
    const w = innerWidth;
    const h = innerHeight;
    let ratio = Math.min(profile.dpr, 1.5) * (scaleByTier[profile.tier] ?? 0.75);
    const pixels = w * h * ratio * ratio;
    if (pixels > profile.maxPixels) ratio *= Math.sqrt(profile.maxPixels / pixels);
    px = ratio;
    canvas.width = Math.max(1, Math.round(w * ratio));
    canvas.height = Math.max(1, Math.round(h * ratio));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();

  const api = {
    lost: false,
    frames: 0,
    render({ ambient, light, scroll, night }) {
      if (api.lost) return;
      if (canvas.width !== Math.round(innerWidth * px) || canvas.height !== Math.round(innerHeight * px)) resize();
      const L = light;
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uPx, px);
      gl.uniform1f(U.uScroll, scroll);
      gl.uniform3fv(U.uAmbient, ambient);
      gl.uniform3fv(U.uLight, L.colour.map((c) => c * L.intensity * 1.15));
      gl.uniform4f(U.uPatch, L.patch.cx, L.patch.top, L.patch.pw, L.patch.ph);
      gl.uniform2f(U.uShape, L.patch.slope, L.soft);
      gl.uniform3fv(U.uDir, L.dir);
      gl.uniform1f(U.uGrazing, Math.min(1, L.grazing * 1.3));
      gl.uniform1f(U.uNight, night);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      api.frames += 1;
    },
    resize,
    dispose() {
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    api.lost = true;
    document.documentElement.classList.remove('has-gl');
  });
  return api;
}
