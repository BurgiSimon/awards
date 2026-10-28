import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { createDither, tokenColours } from './dither.js';
import { createClip } from './footage.js';

// A footer whose picture is footage woven into the section's own ink. Three keyed clips (a ridge in mist, reeds, a
// crossing flock) are composited on one canvas, each with its own cell grid and levels. The levels develop from blank
// as the close scrolls in; the flock crosses on a loop; bars can switch to an ASCII glyph ramp. Nothing is allocated
// until the close is a viewport away, nothing renders off screen, and a frame renders only when something changed.

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();
const html = document.documentElement;
const tier = motionTier();
const close = document.querySelector('[data-close]');
const scene = document.querySelector('[data-scene]');
const canvas = document.querySelector('[data-gl]');
const readout = document.querySelector('[data-gl-readout]');
const pauseBtn = document.querySelector('[data-pause]');
const modeBtns = [...document.querySelectorAll('[data-mode]')];
const params = new URLSearchParams(location.search);

// This recipe's own values, not a site's. Positions are fractions of the canvas; heights follow each clip's aspect.
const FPS_CAP = 30;               // the compositor never renders faster than this
const CLIP_FPS = 24;
const STILL_TIME = 6.2;           // the frame shown in the reduced and static tiers
const LAYERS = {
  // Inverted levels (black point above white point): on a dark ground the light parts of the footage get the
  // widest bars of light ink, so the picture reads positive.
  ridge: { cols: 180, rows: 64, black: 225, white: 35, bar: [-0.02, 1.02], groundAlpha: 1, inkAlpha: 1, develop: 0 },
  // Thin stalks: the key is read at the cell centre only, or a coarse grid would drop them whole.
  reeds: { cols: 110, rows: 72, black: 230, white: 25, bar: [0.04, 0.9], groundAlpha: 0, inkAlpha: 1, keyEdge: false, develop: 0 },
  flock: { cols: 84, rows: 48, black: 255, white: 0, bar: [0, 1], groundAlpha: 0, inkAlpha: 1, develop: 0 },
};
// Placement is art-directed per canvas shape, not scaled: on a tall phone canvas the ridge is cropped wider and the
// reeds and the flock grow, so the picture still fills the frame.
const PLACE = {
  wide: { ridge: { x: 0, y: 0.3, w: 1 }, reeds: { x: 0.56, y: 0.34, w: 0.4 }, flock: { y: 0.02, w: 0.28 } },
  tall: { ridge: { x: -0.45, y: 0.42, w: 1.9 }, reeds: { x: 0.3, y: 0.36, w: 0.78 }, flock: { y: 0.08, w: 0.62 } },
};
const FLOCK = { from: -0.65, to: 1.02, duration: 7, repeatDelay: 3 };

const state = { gl: false, motion: tier, mode: 'bars', paused: false, running: false, visible: false, source: 'none', videoFrames: 0, develop: 0, frozen: false, ready: false };
let dither = null, clips = null, layers = null, flockTl = null, developTl = null;
let clipTime = STILL_TIME, lastRender = 0, signature = '';

const setReadout = () => { if (readout) readout.textContent = state.gl ? `webgl · ${state.mode} · ${state.source}` : 'dom'; };

// Footage as <video>: each clip canvas streams into a muted inline video, which is exactly the path a filed clip takes
// (README, "Real footage"). A video frame bumps the version through requestVideoFrameCallback, so the compositor
// uploads each decoded frame once. With no captureStream, or in the reduced tiers, the canvases are read directly.
function videoSource(clip) {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.srcObject = clip.canvas.captureStream(CLIP_FPS);
  let version = 0;
  const onFrame = () => { version++; state.videoFrames++; video.requestVideoFrameCallback(onFrame); };
  if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(onFrame);
  video.play().catch(() => {});
  return { el: video, kind: 'video', version: 'requestVideoFrameCallback' in video ? () => version : () => video.currentTime };
}
const canvasSource = (clip) => ({ el: clip.canvas, kind: 'canvas', version: clip.version });

function useSources(kind) {
  for (const l of layers) {
    if (l.source.kind === 'video') { l.source.el.pause(); l.source.el.srcObject = null; }
    l.source = kind === 'video' ? videoSource(l.clip) : canvasSource(l.clip);
    l.uploaded = -1;
    l.size = null;                            // a new source reallocates the texture on its first upload
  }
  state.source = kind;
  setReadout();
}

function place() {
  const { W, H } = dither.size;
  const p = PLACE[W / H < 1.2 ? 'tall' : 'wide'];
  for (const l of layers) Object.assign(l.cfg, p[l.name]);
}

function refreshColours() { if (dither) { dither.setColours(tokenColours(scene)); signature = ''; frame(0, 0); } }

function sig() {
  let s = `${dither.mode}|${dither.size.W}x${dither.size.H}|`;
  for (const l of layers) s += `${l.source.version()}:${l.cfg.x.toFixed(4)}:${l.cfg.develop.toFixed(4)}|`;
  return s;
}

// Render only when a frame, a tween value, the size, the theme or the mode changed, and never above FPS_CAP.
function frame(time, dt) {
  if (!dither || !state.visible) return;
  if (state.running) {
    clipTime += dt;
    for (const c of Object.values(clips)) c.at(clipTime);
  }
  const now = performance.now();
  if (now - lastRender < 1000 / FPS_CAP - 2) return;
  const s = sig();
  if (s === signature) return;
  signature = s;
  lastRender = now;
  dither.render();
}

function setRunning() {
  const run = tier === 'full' && state.visible && !state.paused && !state.frozen;
  if (run === state.running) return;
  state.running = run;
  if (flockTl) run ? flockTl.play() : flockTl.pause();
  for (const l of layers ?? []) if (l.source.kind === 'video') run ? l.source.el.play().catch(() => {}) : l.source.el.pause();
}

function init() {
  try { dither = createDither(canvas); } catch (e) { console.warn('dither: falling back to the DOM texture', e); dither = null; }
  if (!dither) return;
  html.classList.add('gl-active');
  dither.resize();
  state.gl = true;
  clips = { ridge: createClip('ridge', CLIP_FPS), reeds: createClip('reeds', CLIP_FPS), flock: createClip('flock', CLIP_FPS) };
  layers = Object.entries(LAYERS).map(([name, cfg]) => ({ name, clip: clips[name], cfg: { x: 0, y: 0, w: 1, ...cfg, aspect: clips[name].aspect }, source: null }));
  for (const c of Object.values(clips)) c.at(clipTime);
  dither.setLayers(layers);
  layers = dither.layers;
  for (const l of layers) l.source = canvasSource(l.clip);
  refreshColours();
  place();

  const flockCfg = layers.find((l) => l.name === 'flock').cfg;
  if (tier === 'full') {
    useSources(typeof HTMLCanvasElement.prototype.captureStream === 'function' && params.get('source') !== 'canvas' ? 'video' : 'canvas');
    // A stream that never delivers a frame (a browser without canvas capture to video) falls back to the canvases.
    if (state.source === 'video') setTimeout(() => { if (!state.videoFrames && !state.frozen) useSources('canvas'); }, 2500);
    flockTl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: FLOCK.repeatDelay })
      .fromTo(flockCfg, { x: FLOCK.from }, { x: FLOCK.to, duration: FLOCK.duration, ease: 'none' });
    // The levels develop as the close arrives: ridge first, then reeds, then the flock, like a print in a tray.
    developTl = gsap.timeline({ scrollTrigger: { trigger: close, start: 'top bottom', end: 'top 25%', scrub: true } })
      .fromTo(layers[0].cfg, { develop: 0 }, { develop: 1, duration: 1, ease: 'none' }, 0)
      .fromTo(layers[1].cfg, { develop: 0 }, { develop: 1, duration: 0.8, ease: 'none' }, 0.2)
      .fromTo(layers[2].cfg, { develop: 0 }, { develop: 1, duration: 0.6, ease: 'none' }, 0.4);
  } else {
    // Reduced and static: one developed still, the flock parked in frame, no clock, no loop.
    useSources('canvas');
    flockCfg.x = 0.36;
    for (const l of layers) l.cfg.develop = 1;
  }

  new ResizeObserver(() => { dither.resize(); place(); signature = ''; frame(0, 0); }).observe(canvas);
  new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; setRunning(); if (state.visible) frame(0, 0); }, { rootMargin: '20% 0px 20% 0px' }).observe(scene);
  const themeWatch = new MutationObserver(refreshColours);
  themeWatch.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
  themeWatch.observe(close, { attributes: true, attributeFilter: ['data-theme'] });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); html.classList.remove('gl-active'); state.gl = false; setReadout(); });
  // Only the full tier needs a clock; the reduced tiers render on resize, visibility, theme and mode alone.
  if (tier === 'full') gsap.ticker.add((time, deltaMs) => frame(time, Math.min(0.1, deltaMs / 1000)));
  state.ready = true;
  setReadout();
}

// Nothing is created until the close is within a viewport of the screen.
const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { near.disconnect(); init(); } }, { rootMargin: '60% 0px 60% 0px' });
near.observe(close);

for (const b of modeBtns) {
  b.addEventListener('click', () => {
    state.mode = b.dataset.mode;
    for (const o of modeBtns) o.setAttribute('aria-pressed', String(o === b));
    scene.dataset.texture = state.mode;
    dither?.setMode(state.mode);
    signature = '';
    if (dither) frame(0, 0);
    setReadout();
  });
}
// Moving footage that plays for more than five seconds needs a way to stop it (WCAG 2.2.2).
pauseBtn.hidden = tier !== 'full';
pauseBtn.addEventListener('click', () => {
  state.paused = !state.paused;
  pauseBtn.setAttribute('aria-pressed', String(state.paused));
  pauseBtn.textContent = state.paused ? 'Play footage' : 'Pause footage';
  if (layers) setRunning();
});

// Verification and captures: pin the footage clock, park the flock, develop fully and render from the canvases.
function freeze(t = STILL_TIME, flockX = 0.36) {
  if (!dither) return false;
  state.frozen = true;
  setRunning();
  developTl?.scrollTrigger?.disable(false);
  if (layers[0].source.kind !== 'canvas') useSources('canvas');
  clipTime = t;
  for (const c of Object.values(clips)) c.at(t);
  layers.find((l) => l.name === 'flock').cfg.x = flockX;
  for (const l of layers) l.cfg.develop = 1;
  signature = '';
  dither.render();
  return true;
}

// Measures what the shader drew against what the footage holds. For every sampled cell of a layer, the CPU repeats
// the shader's reads on the clip (bilinear, at the centre and the four key points) to get the tone the levels give,
// then the GL frame is read back and the cell's ink share measured on an 8 × 8 lattice.
function measure(layerName = 'ridge') {
  const l = layers.find((x) => x.name === layerName);
  const { W, H } = dither.size;
  const r = dither.rect(l.cfg);
  const [cols, rows, cw, ch] = dither.grid(l.cfg, r);
  const x0 = Math.max(0, Math.floor(r[0])), y0 = Math.max(0, Math.floor(r[1])), x1 = Math.min(W, Math.ceil(r[2])), y1 = Math.min(H, Math.ceil(r[3]));
  const px = dither.read(x0, y0, x1 - x0, y1 - y0, l);
  dither.render();                            // put every layer back on screen
  signature = sig();
  const pw = x1 - x0;
  const at = (x, y) => { const i = ((y1 - 1 - y) * pw + (x - x0)) * 4; return [px[i], px[i + 1], px[i + 2], px[i + 3]]; };
  const { ink, ground } = tokenColours(scene);
  const d = ink.map((v, i) => (v - ground[i]) * 255);
  const dd = d.reduce((s, v) => s + v * v, 0);
  // 0 where the pixel is the ground (or transparent), 1 where it is the ink.
  const inkness = (p) => Math.min(1, Math.max(0, (p[3] / 255) * d.reduce((s, v, i) => s + v * (p[i] - ground[i] * 255), 0) / dd));
  const img = l.clip.canvas.getContext('2d').getImageData(0, 0, l.clip.canvas.width, l.clip.canvas.height);
  const texel = (ix, iy) => {
    const x = Math.min(img.width - 1, Math.max(0, ix)), y = Math.min(img.height - 1, Math.max(0, iy));
    const i = (y * img.width + x) * 4;
    return [img.data[i] / 255, img.data[i + 1] / 255, img.data[i + 2] / 255];
  };
  const bilinear = (u, v) => {
    const fx = u * img.width - 0.5, fy = v * img.height - 0.5;
    const ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
    const a = texel(ix, iy), b = texel(ix + 1, iy), c = texel(ix, iy + 1), e = texel(ix + 1, iy + 1);
    return a.map((_, k) => (a[k] * (1 - tx) + b[k] * tx) * (1 - ty) + (c[k] * (1 - tx) + e[k] * tx) * ty);
  };
  const key = l.cfg.key ?? 0.04;
  const keyed = (u, v) => Math.max(...bilinear(u, v)) <= key;
  const black = l.cfg.black / 255, white = l.cfg.white / 255;
  const pairs = [];
  let keyedCells = 0, keyedClear = 0, uniformCells = 0, inkedCells = 0;
  for (let cy = 0; cy < rows; cy += 2) {
    for (let cx = 0; cx < cols; cx += 2) {
      const left = r[0] + cx * cw, top = r[1] + cy * ch;
      if (left < x0 || top < y0 || left + cw > x1 || top + ch > y1) continue;
      const u = (cx + 0.5) / cols, v = (cy + 0.5) / rows, qu = 0.35 / cols, qv = 0.35 / rows;
      const corners = [[u, v], [u - qu, v - qv], [u + qu, v + qv], [u + qu, v - qv], [u - qu, v + qv]];
      const k = corners.filter(([a, b]) => keyed(a, b)).length;
      const lattice = [];
      for (let j = 0; j < 8; j++) {
        const row = [];
        for (let i = 0; i < 8; i++) row.push(at(Math.floor(left + ((i + 0.5) / 8) * cw), Math.floor(top + ((j + 0.5) / 8) * ch)));
        lattice.push(row);
      }
      if (k === 5) {
        keyedCells++;
        if (lattice.every((row) => row.every((p) => p[3] === 0))) keyedClear++;
        continue;
      }
      if (k) continue;                       // a cell on the matte edge: dropped by the shader, not measured here
      const rgb = bilinear(u, v);
      const lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
      const tone = Math.min(1, Math.max(0, (lum - black) / (white - black)));
      pairs.push([1 - tone, lattice.flat().reduce((s, p) => s + inkness(p), 0) / 64]);
      // A bar is the same in every row of its cell; a glyph is not.
      const sigs = lattice.map((row) => row.map((p) => (inkness(p) > 0.5 ? 1 : 0)).join(''));
      if (sigs.some((x) => x.includes('1'))) { inkedCells++; if (sigs.every((x) => x === sigs[0])) uniformCells++; }
    }
  }
  const mean = (a) => a.reduce((s, x) => s + x, 0) / (a.length || 1);
  const xs = pairs.map((p) => p[0]), ys = pairs.map((p) => p[1]);
  const mx = mean(xs), my = mean(ys);
  const cov = mean(pairs.map(([x, y]) => (x - mx) * (y - my)));
  const sx = Math.sqrt(mean(xs.map((x) => (x - mx) ** 2))), sy = Math.sqrt(mean(ys.map((y) => (y - my) ** 2)));
  return {
    cells: pairs.length, correlation: sx && sy ? Number((cov / (sx * sy)).toFixed(3)) : 0, meanInk: Number(my.toFixed(3)),
    keyedCells, keyedClear, sameRowShare: Number((uniformCells / (inkedCells || 1)).toFixed(3)), cols, rows, ramp: dither.ramp.join(''),
  };
}

// Scrolls so the develop trigger sits at progress p (0..1), for the mid-develop check.
function seek(p) {
  const st = developTl?.scrollTrigger;
  if (!st) return false;
  window.scrollTo(0, Math.round(st.start + (st.end - st.start) * p));
  ScrollTrigger.update();
  return true;
}

window.__dither = { freeze, measure, seek, get ready() { return state.ready; } };

awards.addState(() => ({
  ...state,
  develop: layers ? Number(layers[0].cfg.develop.toFixed(3)) : 0,
  renders: dither?.stats.renders ?? 0,
  uploads: dither?.stats.uploads ?? 0,
  layers: layers?.length ?? 0,
  canvasAriaHidden: canvas.getAttribute('aria-hidden') === 'true',
  canvasShown: getComputedStyle(canvas).display !== 'none',
  pauseShown: !pauseBtn.hidden,
}));
setReadout();
awards.ready();
