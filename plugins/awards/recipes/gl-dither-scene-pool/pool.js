// One dither compositor for every scene on a page. A single WebGL context on a detached canvas draws one scene at a
// time into the top-left slice of its buffer and copies that slice into the scene's own 2D canvas, in the page flow,
// so pictures scroll natively with their sections and stack under their text. Clips are pooled: a clip shown by three
// scenes is one texture, uploaded once per new frame.

const VERT = `
attribute vec2 a_unit;
uniform vec4 u_rect;        // layer box in the scene's device px, y down
uniform vec2 u_size;        // the scene's size in device px
varying vec2 v_uv;
void main() {
  vec2 px = mix(u_rect.xy, u_rect.zw, a_unit);
  gl_Position = vec4(px.x / u_size.x * 2.0 - 1.0, 1.0 - px.y / u_size.y * 2.0, 0.0, 1.0);
  v_uv = a_unit;
}`;

const FRAG = `
precision highp float;
uniform sampler2D u_tex;
uniform sampler2D u_glyphs;
uniform vec2 u_grid;
uniform vec2 u_cellPx;
uniform vec4 u_levels;      // black, white (0..1; black > white inverts), gamma, threshold
uniform vec2 u_bar;
uniform vec2 u_alpha;       // ground, ink opacity
uniform vec3 u_ground;
uniform vec3 u_ink;
uniform float u_key;
uniform float u_keyEdge;
uniform float u_develop;
uniform float u_mode;
uniform float u_glyphCount;
varying vec2 v_uv;
bool keyed(vec2 uv) { vec4 t = texture2D(u_tex, uv); return t.a < 0.01 || max(t.r, max(t.g, t.b)) <= u_key; }
void main() {
  vec2 cell = floor(v_uv * u_grid);
  vec2 c = (cell + 0.5) / u_grid;
  vec2 q = 0.35 / u_grid;
  if (keyed(c)) discard;
  if (u_keyEdge > 0.5 && (keyed(c - q) || keyed(c + q) || keyed(c + vec2(q.x, -q.y)) || keyed(c + vec2(-q.x, q.y)))) discard;
  vec3 rgb = pow(texture2D(u_tex, c).rgb, vec3(u_levels.z));
  float tone = clamp((dot(rgb, vec3(0.2126, 0.7152, 0.0722)) - u_levels.x) / (u_levels.y - u_levels.x), 0.0, 1.0);
  tone = mix(1.0, tone, u_develop);
  float ink = tone > u_levels.w ? 0.0 : 1.0 - tone;
  vec2 f = fract(v_uv * u_grid);
  float cover;
  if (u_mode < 0.5) {
    float half_w = 0.5 * mix(u_bar.x, u_bar.y, ink);
    float px = 1.0 / u_cellPx.x;                    // box-filtered over a device pixel; zero width draws nothing
    cover = clamp((half_w - abs(f.x - 0.5)) / px + 0.5, 0.0, 1.0) * clamp(2.0 * half_w / px, 0.0, 1.0);
  } else {
    cover = texture2D(u_glyphs, vec2((floor(ink * (u_glyphCount - 1.0) + 0.5) + f.x) / u_glyphCount, f.y)).a;
  }
  // Mixed premultiplied: a part-covered pixel on a clear ground takes ink in proportion to its cover, no ground colour.
  gl_FragColor = mix(vec4(u_ground * u_alpha.x, u_alpha.x), vec4(u_ink * u_alpha.y, u_alpha.y), cover);
}`;

const GLYPHS = [' ', '.', ':', '-', '=', '+', '*', '%', '#', '@'];
const GCELL = { w: 36, h: 60 };
// The ramp is sorted by each glyph's measured ink in the face the platform actually has.
function glyphAtlas() {
  const draw = (ramp) => {
    const c = document.createElement('canvas');
    c.width = GCELL.w * ramp.length; c.height = GCELL.h;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `600 ${Math.round(GCELL.h * 0.78)}px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`;
    ramp.forEach((ch, i) => g.fillText(ch, GCELL.w * (i + 0.5), GCELL.h * 0.54));
    return { c, g };
  };
  const { g } = draw(GLYPHS);
  const ramp = GLYPHS.map((ch, i) => {
    const d = g.getImageData(i * GCELL.w, 0, GCELL.w, GCELL.h).data;
    let a = 0; for (let k = 3; k < d.length; k += 4) a += d[k];
    return [ch, a];
  }).sort((p, q) => p[1] - q[1]).map((x) => x[0]);
  return { canvas: draw(ramp).c, count: ramp.length };
}

const MIN_CELL = { bars: 5, glyphs: 9 };
const hex = (s) => {
  const m = String(s).trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};
// Any other CSS colour (rgb(), hsl(), oklch(), named) is painted into one pixel and read back; an invalid one leaves
// each of two different sentinels in place, so it is rejected instead of read as a sentinel.
let swatch = null;
const cssColour = (s) => {
  s = String(s).trim();
  if (!s) return null;
  swatch ??= Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
  swatch.fillStyle = '#000'; swatch.fillStyle = s; const a = swatch.fillStyle;
  swatch.fillStyle = '#fff'; swatch.fillStyle = s;
  if (swatch.fillStyle !== a) return null;
  swatch.clearRect(0, 0, 1, 1); swatch.fillRect(0, 0, 1, 1);
  const d = swatch.getImageData(0, 0, 1, 1).data;
  return d[3] ? [d[0] / 255, d[1] / 255, d[2] / 255] : null;
};
const colour = (s) => hex(s) ?? cssColour(s);
export function tokenColours(el) {
  const cs = getComputedStyle(el);
  return { ground: colour(cs.getPropertyValue('--ground')) ?? [1, 1, 1], ink: colour(cs.getPropertyValue('--ink')) ?? [0, 0, 0] };
}

export function createPool({ dprCap = 1.5 } = {}) {
  const canvas = document.createElement('canvas');             // detached: never in the DOM
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false });
  if (!gl) return null;
  const sh = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'compile failed');
    return s;
  };
  const program = gl.createProgram();
  gl.attachShader(program, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'link failed');
  gl.useProgram(program);
  const u = {};
  for (const n of ['u_rect', 'u_size', 'u_tex', 'u_glyphs', 'u_grid', 'u_cellPx', 'u_levels', 'u_bar', 'u_alpha', 'u_ground', 'u_ink', 'u_key', 'u_keyEdge', 'u_develop', 'u_mode', 'u_glyphCount']) u[n] = gl.getUniformLocation(program, n);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(program, 'a_unit');
  gl.enableVertexAttribArray(a);
  gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  const tex = () => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  };
  const atlas = glyphAtlas();
  const glyphTex = tex();
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
  gl.uniform1i(u.u_tex, 0);
  gl.uniform1i(u.u_glyphs, 1);
  gl.uniform1f(u.u_glyphCount, atlas.count);

  const stats = { uploads: 0, draws: 0, copies: 0 };
  const clips = new Map();     // name → { source, tex, uploaded, size, uploads }

  function addClip(name, source) { clips.set(name, { source, tex: tex(), uploaded: -1, size: null, uploads: 0 }); }
  // A new source reallocates the texture on its first upload, whatever its size.
  function setSource(name, source) { const c = clips.get(name); c.source = source; c.uploaded = -1; c.size = null; }

  // Once per clip per new frame, however many scenes show it.
  function upload(c) {
    const v = c.source.version();
    if (v === c.uploaded) return;
    const el = c.source.el;
    // A video can report its size before it has a frame; uploading then leaves level 0 undefined and every later
    // texSubImage2D fails. Wait for a current frame.
    if (el instanceof HTMLVideoElement && el.readyState < el.HAVE_CURRENT_DATA) return;
    const w = el.videoWidth ?? el.width, h = el.videoHeight ?? el.height;
    if (!w || !h) return;
    gl.bindTexture(gl.TEXTURE_2D, c.tex);
    if (c.size && c.size[0] === w && c.size[1] === h) gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, el);
    else { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el); c.size = [w, h]; }
    c.uploaded = v; c.uploads++; stats.uploads++;
  }

  // Grows the shared buffer to the largest scene seen; never shrinks it, so scenes of different sizes don't reallocate.
  function ensure(w, h) {
    if (canvas.width < w || canvas.height < h) { canvas.width = Math.max(canvas.width, w); canvas.height = Math.max(canvas.height, h); }
  }

  // A scene: { ctx (its 2D context), W, H (device px), dpr, mode, colours, layers: [{ clip, cfg }] }.
  function draw(scene) {
    const { W, H } = scene;
    ensure(W, H);
    gl.viewport(0, canvas.height - H, W, H);           // the top-left slice, which drawImage reads from (0, 0)
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(0, canvas.height - H, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);
    gl.useProgram(program);
    gl.uniform2f(u.u_size, W, H);
    gl.uniform3fv(u.u_ground, scene.colours.ground);
    gl.uniform3fv(u.u_ink, scene.colours.ink);
    gl.uniform1f(u.u_mode, scene.mode === 'glyphs' ? 1 : 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, glyphTex);
    gl.activeTexture(gl.TEXTURE0);
    for (const l of scene.layers) {
      const c = clips.get(l.clip), cfg = l.cfg;
      upload(c);
      if (!c.size || cfg.hidden) continue;
      const x0 = cfg.x * W, y0 = cfg.y * H, w = cfg.w * W, h = w / (c.size[0] / c.size[1]);
      if (x0 + w <= 0 || x0 >= W || y0 + h <= 0 || y0 >= H) continue;
      const fit = Math.max(1, Math.floor(w / scene.dpr / MIN_CELL[scene.mode]));
      let cols, rows;
      if (scene.mode === 'glyphs') { cols = Math.max(1, Math.min(Math.round(cfg.cols * 0.6), fit)); rows = Math.max(1, Math.round(h / ((w / cols) / 0.6))); }
      else { cols = Math.max(1, Math.min(cfg.cols, fit)); rows = Math.max(1, Math.round(cfg.rows * cols / cfg.cols)); }
      let black = cfg.black / 255, white = cfg.white / 255;
      if (Math.abs(white - black) < 1 / 255) white = black + (white >= black ? 1 : -1) / 255;
      gl.bindTexture(gl.TEXTURE_2D, c.tex);
      gl.uniform4f(u.u_rect, x0, y0, x0 + w, y0 + h);
      gl.uniform2f(u.u_grid, cols, rows);
      gl.uniform2f(u.u_cellPx, w / cols, h / rows);
      gl.uniform4f(u.u_levels, black, white, cfg.gamma ?? 1, (cfg.threshold ?? 255) / 255);
      gl.uniform2f(u.u_bar, cfg.bar?.[0] ?? -0.02, cfg.bar?.[1] ?? 1.02);
      gl.uniform2f(u.u_alpha, cfg.groundAlpha ?? 1, cfg.inkAlpha ?? 1);
      gl.uniform1f(u.u_key, cfg.key ?? 0.04);
      gl.uniform1f(u.u_keyEdge, cfg.keyEdge === false ? 0 : 1);
      gl.uniform1f(u.u_develop, (cfg.develop ?? 1) * (scene.develop ?? 1));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      stats.draws++;
    }
    // Same task as the draw: the drawing buffer is still valid without preserveDrawingBuffer.
    scene.ctx.clearRect(0, 0, W, H);
    scene.ctx.drawImage(canvas, 0, 0, W, H, 0, 0, W, H);
    stats.copies++;
  }

  return {
    canvas, gl, stats, clips, addClip, setSource, draw, dprCap,
    lose() { gl.getExtension('WEBGL_lose_context')?.loseContext(); },
  };
}
