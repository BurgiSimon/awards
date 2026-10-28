// The dither compositor: one WebGL1 context, any number of keyed media layers, each drawn as its own quad and woven
// into cells. In every cell the layer's footage is read once at the cell centre; near-black reads as the key and the
// cell is dropped, so footage shot or graded on black composites as a cut-out. The rest becomes a bar whose width
// follows the cell's tone (bars mode) or a glyph picked from a tone ramp (glyphs mode), in the section's own ink.

const VERT = `
attribute vec2 a_unit;
uniform vec4 u_rect;        // layer box in device px, y down: x0, y0, x1, y1
uniform vec2 u_canvas;      // canvas size in device px
varying vec2 v_uv;          // 0..1 across the layer, y down (rows uploaded top first)
void main() {
  vec2 px = mix(u_rect.xy, u_rect.zw, a_unit);
  gl_Position = vec4(px.x / u_canvas.x * 2.0 - 1.0, 1.0 - px.y / u_canvas.y * 2.0, 0.0, 1.0);
  v_uv = a_unit;
}`;

const FRAG = `
precision highp float;
uniform sampler2D u_tex;
uniform sampler2D u_glyphs;
uniform vec2 u_grid;        // columns, rows
uniform vec2 u_cellPx;      // one cell in device px
uniform vec4 u_levels;      // black point, white point (0..1; black > white inverts), gamma, threshold
uniform vec2 u_bar;         // bar width at no ink and at full ink, as a fraction of the cell (may pass 0 and 1)
uniform vec2 u_alpha;       // ground opacity, ink opacity
uniform vec3 u_ground;
uniform vec3 u_ink;
uniform float u_key;        // a sample at or below this value counts as the key
uniform float u_keyEdge;    // 1: also test four points inside the cell; 0: the centre alone (keeps thin strokes)
uniform float u_develop;    // 0: no ink anywhere; 1: the authored levels
uniform float u_mode;       // 0 bars, 1 glyphs
uniform float u_glyphCount;
varying vec2 v_uv;

bool keyed(vec2 uv) {
  vec4 t = texture2D(u_tex, uv);
  return t.a < 0.01 || max(t.r, max(t.g, t.b)) <= u_key;
}

void main() {
  vec2 cell = floor(v_uv * u_grid);
  vec2 c = (cell + 0.5) / u_grid;
  // The key is tested at the centre and four points inside the cell, so a cell the matte only half covers is dropped
  // too: silhouettes end on whole cells instead of a fringe of thin bars.
  vec2 q = 0.35 / u_grid;
  if (keyed(c)) discard;
  if (u_keyEdge > 0.5 && (keyed(c - q) || keyed(c + q) || keyed(c + vec2(q.x, -q.y)) || keyed(c + vec2(-q.x, q.y)))) discard;

  vec3 rgb = pow(texture2D(u_tex, c).rgb, vec3(u_levels.z));
  float tone = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
  tone = clamp((tone - u_levels.x) / (u_levels.y - u_levels.x), 0.0, 1.0);
  tone = mix(1.0, tone, u_develop);
  float ink = tone > u_levels.w ? 0.0 : 1.0 - tone;

  vec2 f = fract(v_uv * u_grid);
  float cover;
  if (u_mode < 0.5) {
    // Box-filtered coverage over one device pixel: edges ramp, a bar thinner than a pixel draws at its share of
    // one, and a bar of zero or negative width draws nothing at all.
    float half_w = 0.5 * mix(u_bar.x, u_bar.y, ink);
    float px = 1.0 / u_cellPx.x;
    cover = clamp((half_w - abs(f.x - 0.5)) / px + 0.5, 0.0, 1.0) * clamp(2.0 * half_w / px, 0.0, 1.0);
  } else {
    float index = floor(ink * (u_glyphCount - 1.0) + 0.5);
    cover = texture2D(u_glyphs, vec2((index + f.x) / u_glyphCount, f.y)).a;
  }
  vec4 col = mix(vec4(u_ground, u_alpha.x), vec4(u_ink, u_alpha.y), cover);
  gl_FragColor = vec4(col.rgb * col.a, col.a);      // premultiplied
}`;

// Glyph candidates. The order is not trusted: the system monospace face differs per platform, so the atlas measures
// each glyph's ink and sorts the ramp from light to heavy before it is uploaded.
export const GLYPHS = [' ', '.', ':', '-', '=', '+', '*', '%', '#', '@'];
const GLYPH_CELL = { w: 36, h: 60 };

function drawGlyphs(ramp) {
  const c = document.createElement('canvas');
  c.width = GLYPH_CELL.w * ramp.length;
  c.height = GLYPH_CELL.h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(GLYPH_CELL.h * 0.78)}px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`;
  ramp.forEach((ch, i) => g.fillText(ch, GLYPH_CELL.w * (i + 0.5), GLYPH_CELL.h * 0.54));
  return { c, g };
}

export function glyphAtlas(candidates = GLYPHS) {
  const { g } = drawGlyphs(candidates);
  const ink = candidates.map((ch, i) => {
    const d = g.getImageData(i * GLYPH_CELL.w, 0, GLYPH_CELL.w, GLYPH_CELL.h).data;
    let a = 0;
    for (let k = 3; k < d.length; k += 4) a += d[k];
    return { ch, ink: a / (255 * GLYPH_CELL.w * GLYPH_CELL.h) };
  }).sort((p, q) => p.ink - q.ink);
  const ramp = ink.map((x) => x.ch);
  return { canvas: drawGlyphs(ramp).c, ramp, ink: ink.map((x) => Number(x.ink.toFixed(3))) };
}

const hex = (s) => {
  const m = String(s).trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};

// Reads the section's own tokens, so a scene inside a dark section weaves in that section's ink.
export function tokenColours(el) {
  const cs = getComputedStyle(el);
  return { ground: hex(cs.getPropertyValue('--ground')) ?? [1, 1, 1], ink: hex(cs.getPropertyValue('--ink')) ?? [0, 0, 0] };
}

// Cells never get smaller than this many CSS px, whatever the authored column count: on a phone the grid coarsens
// instead of collapsing into sub-pixel bars. Glyphs need more room than bars to stay glyphs.
const MIN_CELL = { bars: 5, glyphs: 9 };

export function createDither(canvas, { dprCap = 1.5 } = {}) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false });
  if (!gl) return null;

  const shader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader compile failed');
    return s;
  };
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'link failed');
  gl.useProgram(program);

  const u = {};
  for (const name of ['u_rect', 'u_canvas', 'u_tex', 'u_glyphs', 'u_grid', 'u_cellPx', 'u_levels', 'u_bar', 'u_alpha', 'u_ground', 'u_ink', 'u_key', 'u_keyEdge', 'u_develop', 'u_mode', 'u_glyphCount']) u[name] = gl.getUniformLocation(program, name);

  const unit = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, unit);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  const aUnit = gl.getAttribLocation(program, 'a_unit');
  gl.enableVertexAttribArray(aUnit);
  gl.vertexAttribPointer(aUnit, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

  const texture = () => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  };

  const atlas = glyphAtlas();
  const glyphTex = texture();
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
  gl.useProgram(program);
  gl.uniform1i(u.u_tex, 0);
  gl.uniform1i(u.u_glyphs, 1);
  gl.uniform1f(u.u_glyphCount, atlas.ramp.length);

  const stats = { draws: 0, renders: 0, uploads: 0 };
  let layers = [];
  let colours = { ground: [1, 1, 1], ink: [0, 0, 0] };
  let mode = 'bars';
  let W = 1, H = 1, cssW = 1, cssH = 1, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    cssW = Math.max(1, canvas.clientWidth);
    cssH = Math.max(1, canvas.clientHeight);
    W = Math.max(1, Math.round(cssW * dpr));
    H = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    gl.viewport(0, 0, W, H);
  }

  // A layer: { source: { el, version() }, cfg }. The texture is uploaded only when the source says its frame changed.
  function setLayers(list) {
    for (const l of layers) if (l.tex) gl.deleteTexture(l.tex);
    layers = list.map((l) => ({ ...l, tex: texture(), uploaded: -1, size: null }));
  }

  function upload(l) {
    const v = l.source.version();
    if (v === l.uploaded) return;
    const el = l.source.el;
    // A video can report its size before it has a frame; uploading then leaves level 0 undefined and every later
    // texSubImage2D fails. Wait for a current frame.
    if (el instanceof HTMLVideoElement && el.readyState < el.HAVE_CURRENT_DATA) return;
    const w = el.videoWidth ?? el.width, h = el.videoHeight ?? el.height;
    if (!w || !h) return;
    gl.bindTexture(gl.TEXTURE_2D, l.tex);
    if (l.size && l.size[0] === w && l.size[1] === h) gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, el);
    else { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el); l.size = [w, h]; }
    l.uploaded = v;
    stats.uploads++;
  }

  // Layer geometry in device px. x, y and w are fractions of the canvas; the height comes from the footage aspect, so
  // a layer never stretches when the canvas changes shape.
  function rect(cfg) {
    const x0 = cfg.x * W, y0 = cfg.y * H, w = cfg.w * W;
    const h = cfg.h != null ? cfg.h * H : w / cfg.aspect;
    return [x0, y0, x0 + w, y0 + h];
  }

  function grid(cfg, r) {
    const wPx = r[2] - r[0], hPx = r[3] - r[1];
    const fit = Math.max(1, Math.floor(wPx / dpr / MIN_CELL[mode]));
    if (mode === 'glyphs') {
      // Glyph cells are about 0.6 as wide as they are tall, and coarser than the bar grid.
      const cols = Math.max(1, Math.min(Math.round(cfg.cols * 0.6), fit));
      const rows = Math.max(1, Math.round(hPx / ((wPx / cols) / 0.6)));
      return [cols, rows, wPx / cols, hPx / rows];
    }
    const cols = Math.max(1, Math.min(Math.round(cfg.cols), fit));
    const rows = Math.max(1, Math.round(cfg.rows * cols / Math.round(cfg.cols)));
    return [cols, rows, wPx / cols, hPx / rows];
  }

  // `only`: draw that one layer alone (verification reads a layer without the ones over it).
  function render(only) {
    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(u.u_canvas, W, H);
    gl.uniform3fv(u.u_ground, colours.ground);
    gl.uniform3fv(u.u_ink, colours.ink);
    gl.uniform1f(u.u_mode, mode === 'glyphs' ? 1 : 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, glyphTex);
    gl.activeTexture(gl.TEXTURE0);
    for (const l of layers) {
      const cfg = l.cfg;
      if (cfg.hidden || (only && l !== only)) continue;
      upload(l);
      if (!l.size) continue;
      const r = rect(cfg);
      if (r[2] <= 0 || r[0] >= W || r[3] <= 0 || r[1] >= H) continue;   // off canvas: no draw
      const [cols, rows, cw, ch] = grid(cfg, r);
      gl.bindTexture(gl.TEXTURE_2D, l.tex);
      gl.uniform4f(u.u_rect, r[0], r[1], r[2], r[3]);
      gl.uniform2f(u.u_grid, cols, rows);
      gl.uniform2f(u.u_cellPx, cw, ch);
      // Keep the levels range away from zero: equal black and white points would divide by zero.
      let black = cfg.black / 255, white = cfg.white / 255;
      if (Math.abs(white - black) < 1 / 255) white = black + (white >= black ? 1 : -1) / 255;
      gl.uniform4f(u.u_levels, black, white, cfg.gamma ?? 1, (cfg.threshold ?? 255) / 255);
      gl.uniform2f(u.u_bar, cfg.bar?.[0] ?? -0.02, cfg.bar?.[1] ?? 1.02);
      gl.uniform2f(u.u_alpha, cfg.groundAlpha ?? 1, cfg.inkAlpha ?? 1);
      gl.uniform1f(u.u_key, cfg.key ?? 0.04);
      gl.uniform1f(u.u_keyEdge, cfg.keyEdge === false ? 0 : 1);
      gl.uniform1f(u.u_develop, cfg.develop ?? 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      stats.draws++;
    }
    stats.renders++;
  }

  // Renders and reads back in the same task (the drawing buffer is not preserved), for verification only.
  function read(x, y, w, h, only) {
    render(only);
    const out = new Uint8Array(w * h * 4);
    gl.readPixels(x, H - y - h, w, h, gl.RGBA, gl.UNSIGNED_BYTE, out);
    return out;
  }

  function destroy() {
    for (const l of layers) gl.deleteTexture(l.tex);
    gl.deleteTexture(glyphTex);
    gl.deleteBuffer(unit);
    gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  resize();
  return {
    gl, stats, resize, render, read, destroy, setLayers, rect, grid, ramp: atlas.ramp, rampInk: atlas.ink,
    get layers() { return layers; },
    get size() { return { W, H, cssW, cssH, dpr }; },
    setColours(c) { colours = c; },
    setMode(m) { mode = m === 'glyphs' ? 'glyphs' : 'bars'; },
    get mode() { return mode; },
  };
}
