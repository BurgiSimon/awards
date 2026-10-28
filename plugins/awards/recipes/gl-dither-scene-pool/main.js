import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { createPool, tokenColours } from './pool.js';
import { createClip } from './footage.js';

// The weave on every picture of a page, from one WebGL context. Five scenes (hero, two chapters, a glyph interlude,
// the close) share four pooled clips. A scene draws only while it is on screen and only when one of its clips has a
// new frame or one of its settings moved; a clip plays only while a visible scene shows it.

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();
const html = document.documentElement;
const tier = motionTier();
const readout = document.querySelector('[data-gl-readout]');
const seasonBtns = [...document.querySelectorAll('[data-season]')];
const pauseBtn = document.querySelector('[data-pause]');
// Optional controls: a page may ship without them; both stay hidden until the pool exists, since only then do they act.
const seasonGroup = document.querySelector('[data-season-group]');
const params = new URLSearchParams(location.search);
const state = { gl: false, motion: tier, contexts: 0, source: 'none', season: 'summer', paused: false, frozen: false, ready: false, videoFrames: 0 };

// Count WebGL contexts: the claim is exactly one for the whole page, so measure it.
{
  const original = HTMLCanvasElement.prototype.getContext;
  const seen = new WeakSet();
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const ctx = original.call(this, type, ...rest);
    if (ctx && /webgl/.test(type) && !seen.has(this)) { seen.add(this); state.contexts++; }
    return ctx;
  };
}

// This recipe's own values. Light sections take normal levels (dark tones get the widest ink bars); dark sections
// invert them (black point above white point), so a light subject reads positive in light ink.
const FPS_CAP = 30, CLIP_FPS = 24, STILL_TIME = 6.2;
const NORMAL = { black: 20, white: 235 }, INVERTED = { black: 225, white: 35 };
const SCENES = {
  hero: { develop: 'arrival', layers: [
    ['ridge', { x: 0, y: 0.26, w: 1, cols: 170, rows: 60, ...NORMAL, groundAlpha: 1 }],
    ['flock', { x: 0.52, y: 0.02, w: 0.26, cols: 80, rows: 46, black: 0, white: 255, groundAlpha: 0 }],
  ] },
  weather: { layers: [
    ['reeds', { x: 0.02, y: 0.02, w: 0.96, cols: 120, rows: 80, ...INVERTED, bar: [0.04, 0.9], groundAlpha: 0, keyEdge: false }],
  ] },
  // Winter's layers sit under summer's: a season with no ink draws nothing over the other.
  seasons: { layers: [
    ['ridge', { x: 0, y: 0.3, w: 1, cols: 170, rows: 60, ...NORMAL, groundAlpha: 0, season: 'winter' }],
    ['snow', { x: 0, y: 0, w: 1, cols: 150, rows: 84, black: 0, white: 255, groundAlpha: 0, keyEdge: false, season: 'winter' }],
    ['reeds', { x: 0.3, y: 0.06, w: 0.66, cols: 120, rows: 80, ...NORMAL, bar: [0.04, 0.9], groundAlpha: 0, keyEdge: false, season: 'summer' }],
    ['flock', { x: 0.04, y: 0.04, w: 0.34, cols: 80, rows: 46, black: 0, white: 255, groundAlpha: 0, season: 'summer' }],
  ] },
  // Glyph cells are coarse: thin subjects read their key at the cell centre only, or they vanish.
  interlude: { mode: 'glyphs', layers: [
    ['ridge', { x: 0, y: 0.38, w: 1, cols: 170, rows: 60, ...INVERTED, groundAlpha: 0 }],
    ['snow', { x: 0, y: 0, w: 1, cols: 150, rows: 84, ...INVERTED, groundAlpha: 0, keyEdge: false }],
    ['flock', { x: 0.3, y: 0.08, w: 0.44, cols: 80, rows: 46, black: 255, white: 0, groundAlpha: 0, keyEdge: false }],
  ] },
  close: { layers: [
    ['ridge', { x: 0, y: 0.32, w: 1, cols: 170, rows: 60, ...INVERTED, groundAlpha: 1 }],
    ['flock', { x: 0.1, y: 0.04, w: 0.3, cols: 80, rows: 46, black: 255, white: 0, groundAlpha: 0 }],
  ] },
};
const SEASON_SWAP = 1.2;   // seconds; the outgoing season's layers fade to no ink, the incoming develop

let pool = null, clips = null;
const scenes = [];
const loops = [];          // the flock crossings, held so the pause can stop them
let clipTime = STILL_TIME, lastFrame = 0;

const setReadout = () => { if (readout) readout.textContent = state.gl ? `webgl · ${state.contexts} context · ${scenes.length} scenes · ${state.source}` : 'dom'; };

function videoSource(clip) {
  const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.setAttribute('playsinline', '');
  video.srcObject = clip.canvas.captureStream(CLIP_FPS);
  let version = 0;
  const rvfc = 'requestVideoFrameCallback' in video;
  const onFrame = () => { version++; state.videoFrames++; video.requestVideoFrameCallback(onFrame); };
  if (rvfc) video.requestVideoFrameCallback(onFrame);
  return { el: video, kind: 'video', version: rvfc ? () => version : () => video.currentTime };
}
const canvasSource = (clip) => ({ el: clip.canvas, kind: 'canvas', version: clip.version });

function useSources(kind) {
  for (const [name, clip] of Object.entries(clips)) {
    const prev = pool.clips.get(name).source;
    if (prev?.kind === 'video') { prev.el.pause(); prev.el.srcObject = null; }
    pool.setSource(name, kind === 'video' ? videoSource(clip) : canvasSource(clip));
  }
  state.source = kind;
  syncClips();
  setReadout();
}

// A clip plays while at least one visible scene shows it; the rest hold their frame and their decoder.
function syncClips() {
  const wanted = new Set(scenes.filter((s) => s.visible).flatMap((s) => s.layers.map((l) => l.clip)));
  const run = tier === 'full' && !state.frozen && !state.paused;
  for (const [name, c] of pool.clips) {
    const on = run && wanted.has(name);
    c.running = on;
    if (c.source.kind === 'video') on ? c.source.el.play().catch(() => {}) : c.source.el.pause();
  }
}

function sig(s) {
  let out = `${s.W}x${s.H}|${s.mode}|${s.colourKey}|${s.develop.toFixed(4)}|`;
  for (const l of s.layers) out += `${pool.clips.get(l.clip).source.version()}:${l.cfg.develop.toFixed(4)}:${l.cfg.x.toFixed(4)}|`;
  return out;
}

function drawScene(s, force = false) {
  if (!s.W || !s.H) return;
  const k = sig(s);
  if (!force && k === s.sig) return;
  s.sig = k;
  pool.draw(s);
  s.draws++;
}

function tick(time, dt) {
  if (!state.frozen && !state.paused && tier === 'full') {
    clipTime += dt;
    for (const [name, c] of pool.clips) if (c.running) clips[name].at(clipTime);
  }
  const now = performance.now();
  if (now - lastFrame < 1000 / FPS_CAP - 2) return;
  lastFrame = now;
  for (const s of scenes) if (s.visible) drawScene(s);
}

function measure(s) {
  const dpr = Math.min(window.devicePixelRatio || 1, pool.dprCap);
  s.dpr = dpr;
  s.W = Math.max(1, Math.round(s.canvas.clientWidth * dpr));
  s.H = Math.max(1, Math.round(s.canvas.clientHeight * dpr));
  if (s.canvas.width !== s.W || s.canvas.height !== s.H) { s.canvas.width = s.W; s.canvas.height = s.H; }
}

function refreshColours(s) {
  s.colours = tokenColours(s.el);
  s.colourKey = s.colours.ground.concat(s.colours.ink).map((v) => v.toFixed(3)).join(',');
}

function setSeason(name, instant = tier !== 'full') {
  state.season = name;
  for (const b of seasonBtns) b.setAttribute('aria-pressed', String(b.dataset.season === name));
  const s = scenes.find((x) => x.name === 'seasons');
  if (!s) return;
  for (const l of s.layers) {
    const to = l.cfg.season === name ? 1 : 0;
    if (instant) { gsap.killTweensOf(l.cfg); l.cfg.develop = to; } else gsap.to(l.cfg, { develop: to, duration: SEASON_SWAP, ease: 'power2.inOut', overwrite: true });
  }
  if (instant) drawScene(s, true);
}

function init() {
  try { pool = createPool(); } catch (e) { console.warn('dither pool: falling back to the DOM texture', e); pool = null; }
  if (!pool) return;
  state.gl = true;
  html.classList.add('gl-active');
  if (seasonGroup) seasonGroup.hidden = false;      // the switch acts on a scene, so it shows only once the pool can draw one
  clips = { ridge: createClip('ridge', CLIP_FPS), reeds: createClip('reeds', CLIP_FPS), flock: createClip('flock', CLIP_FPS), snow: createClip('snow', CLIP_FPS) };
  for (const [name, clip] of Object.entries(clips)) { clip.at(clipTime); pool.addClip(name, canvasSource(clip)); }

  for (const el of document.querySelectorAll('[data-scene]')) {
    const name = el.dataset.scene, def = SCENES[name];
    const canvas = el.querySelector('canvas');
    const s = {
      name, el, canvas, ctx: canvas.getContext('2d'), mode: def.mode ?? 'bars', visible: false, draws: 0, sig: '',
      develop: tier === 'full' ? 0 : 1, dpr: 1, W: 0, H: 0,
      layers: def.layers.map(([clip, cfg]) => ({ clip, cfg: { develop: 1, ...cfg } })),
    };
    for (const l of s.layers) if (l.cfg.season) l.cfg.develop = l.cfg.season === state.season ? 1 : 0;
    refreshColours(s);
    measure(s);
    scenes.push(s);
    new ResizeObserver(() => { measure(s); if (s.visible) drawScene(s); }).observe(canvas);
    new IntersectionObserver(([e]) => {
      s.visible = e.isIntersecting;
      syncClips();
      if (s.visible) drawScene(s);
    }, { rootMargin: '10% 0px 10% 0px' }).observe(el);
    if (tier === 'full') {
      if (def.develop === 'arrival') gsap.to(s, { develop: 1, duration: 1.6, ease: 'power2.out', delay: 0.2 });
      else gsap.fromTo(s, { develop: 0 }, { develop: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'center 60%', scrub: true } });
    }
  }
  if (tier === 'full') {
    // The flocks cross on a loop, each scene on its own phase.
    for (const s of scenes) {
      const flock = s.layers.find((l) => l.clip === 'flock');
      if (flock && s.name !== 'interlude') loops.push(gsap.fromTo(flock.cfg, { x: -flock.cfg.w - 0.05 }, { x: 1.02, duration: 8, ease: 'none', repeat: -1, repeatDelay: 2, delay: scenes.indexOf(s) * 1.3 }));
    }
    useSources(typeof HTMLCanvasElement.prototype.captureStream === 'function' && params.get('source') !== 'canvas' ? 'video' : 'canvas');
    if (state.source === 'video') setTimeout(() => { if (!state.videoFrames && !state.frozen) useSources('canvas'); }, 2500);
    gsap.ticker.add((time, deltaMs) => tick(time, Math.min(0.1, deltaMs / 1000)));
    // Footage and flocks loop for longer than five seconds, so the page offers a way to stop them (WCAG 2.2.2). The
    // reduced tiers draw stills and loop nothing, so they get no button.
    if (pauseBtn) pauseBtn.hidden = false;
  } else {
    state.source = 'canvas';
  }
  const watch = new MutationObserver(() => { for (const s of scenes) { refreshColours(s); if (s.visible) drawScene(s); } });
  watch.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
  pool.canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); state.gl = false; html.classList.remove('gl-active'); if (pauseBtn) pauseBtn.hidden = true; if (seasonGroup) seasonGroup.hidden = true; setReadout(); });
  state.ready = true;
  setReadout();
}

for (const b of seasonBtns) b.addEventListener('click', () => setSeason(b.dataset.season));
// A toggle keeps its label; aria-pressed carries the state ("Pause footage, pressed" while paused). Clips hold their
// frame, the flocks stop where they are, and with nothing changing no scene redraws.
pauseBtn?.addEventListener('click', () => {
  state.paused = !state.paused;
  pauseBtn.setAttribute('aria-pressed', String(state.paused));
  for (const t of loops) state.paused ? t.pause() : t.resume();
  if (pool) syncClips();
});
init();

// Verification: pin every clip, park the flocks and develop every scene fully.
function freeze(t = STILL_TIME) {
  if (!pool) return false;
  state.frozen = true;
  ScrollTrigger.getAll().forEach((st) => st.disable(false));
  for (const s of scenes) { gsap.killTweensOf(s); s.develop = 1; }
  for (const s of scenes) for (const l of s.layers) if (l.clip === 'flock') { gsap.killTweensOf(l.cfg, 'x'); l.cfg.x = s.name === 'interlude' ? 0.3 : 0.4; }
  loops.length = 0;
  if (state.source !== 'canvas') useSources('canvas');
  syncClips();
  clipTime = t;
  for (const c of Object.values(clips)) c.at(t);
  for (const s of scenes) if (s.visible) drawScene(s, true);
  return true;
}

// Share of a scene's pixels in its ink, overall and on a 6 × 3 grid (a coarse picture signature).
function inkShare(name) {
  const s = scenes.find((x) => x.name === name);
  const { data, width, height } = s.ctx.getImageData(0, 0, s.W, s.H);
  const ink = s.colours.ink.map((v) => v * 255);
  const grid = new Array(18).fill(0), tot = new Array(18).fill(0);
  let n = 0, k = 0;
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const i = (y * width + x) * 4;
      const on = data[i + 3] > 200 && Math.abs(data[i] - ink[0]) + Math.abs(data[i + 1] - ink[1]) + Math.abs(data[i + 2] - ink[2]) < 90;
      const g = Math.min(2, Math.floor(y / height * 3)) * 6 + Math.min(5, Math.floor(x / width * 6));
      tot[g]++; n++;
      if (on) { grid[g]++; k++; }
    }
  }
  // A part-covered pixel over the clear sky of a scene is ink at part opacity: read back un-premultiplied, its colour is
  // the ink and nothing else (no ground mixed in). The largest channel error over every such pixel.
  let partial = 0, leak = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 64 || data[i + 3] > 250) continue;
    partial++;
    for (let c = 0; c < 3; c++) leak = Math.max(leak, Math.abs(data[i + c] - ink[c]));
  }
  return { share: Number((k / n).toFixed(4)), grid: grid.map((v, i) => Number((v / tot[i]).toFixed(3))), partial, leak: Number(leak.toFixed(1)) };
}

window.__pool = { freeze, inkShare, setSeason, colours: (el) => tokenColours(el), get ready() { return state.ready; } };

awards.addState(() => ({
  ...state,
  scenes: scenes.length,
  textures: pool?.clips.size ?? 0,
  layerSlots: scenes.reduce((n, s) => n + s.layers.length, 0),
  draws: Object.fromEntries(scenes.map((s) => [s.name, s.draws])),
  visible: scenes.filter((s) => s.visible).map((s) => s.name),
  running: pool ? [...pool.clips].filter(([, c]) => c.running).map(([n]) => n) : [],
  uploads: pool ? Object.fromEntries([...pool.clips].map(([n, c]) => [n, c.uploads])) : {},
  versions: clips ? Object.fromEntries(Object.entries(clips).map(([n, c]) => [n, c.version()])) : {},
  copies: pool?.stats.copies ?? 0,
  pauseShown: !!pauseBtn && !pauseBtn.hidden,
  seasonShown: !!seasonGroup && !seasonGroup.hidden,
  canvasesAriaHidden: [...document.querySelectorAll('[data-scene] canvas')].every((c) => c.getAttribute('aria-hidden') === 'true'),
}));
setReadout();
awards.ready();
