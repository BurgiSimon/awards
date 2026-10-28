import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { packClip, readPack, pickCodec } from './pack.js';
import { FrameScrubber } from './scrubber.js';
import { CLIP, drawDay, clock, readEdge } from './footage.js';

// Scroll through a day, frame by frame, from one encoded clip. The page encodes the stand-in film on load (a real site
// fetches the packed file it built once); WebCodecs decodes exactly the frame the scroll asks for. Without WebCodecs
// the frames are drawn directly, the way an image sequence would be; reduced motion gets one still.

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();
const tier = motionTier();
const film = document.querySelector('[data-film]');
const screen = document.querySelector('[data-screen]');
const readout = document.querySelector('[data-readout]');
const status = document.querySelector('[data-status]');
const compareOut = document.querySelector('[data-compare]');
const params = new URLSearchParams(location.search);

// This recipe's own values.
const KEY_EVERY = 10;         // a keyframe every ten frames: a random seek decodes at most ten
const BITRATE = 500_000;      // flat drawn frames need little; photographic footage wants two to four times this
const STILL = Math.round((CLIP.count - 1) / 2);   // the frame the reduced tiers show: midday

const state = { motion: tier, mode: 'pending', codec: null, packBytes: 0, encodeMs: 0, target: 0, shown: null, compare: null, ready: false };
const source = document.createElement('canvas');
[source.width, source.height] = [CLIP.width, CLIP.height];
const sg = source.getContext('2d');
const ctx = screen.getContext('2d', { willReadFrequently: true });
let scrubber = null;

function size() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.min(CLIP.width, Math.round(screen.clientWidth * dpr));
  const h = Math.round((w * CLIP.height) / CLIP.width);
  if (screen.width !== w || screen.height !== h) { screen.width = w; screen.height = h; }
}

function paint(src, index) {
  ctx.drawImage(src, 0, 0, screen.width, screen.height);
  state.shown = index;
  readout.textContent = `${String(index + 1).padStart(3, '0')} / ${CLIP.count} · ${clock(index / (CLIP.count - 1))}`;
}

// The fallback and the reduced tiers draw the frame directly: the stand-in for an image sequence or a poster.
function drawDirect(i) { drawDay(sg, i); paint(source, i); }

function show(f) {
  const i = Math.max(0, Math.min(CLIP.count - 1, Math.round(f)));
  state.target = i;
  if (state.mode === 'webcodecs') scrubber.seek(i);
  else drawDirect(i);
}

function toFallback(reason) {
  scrubber?.destroy();
  scrubber = null;
  state.mode = 'fallback';
  state.fallbackReason = String(reason ?? '');
  status.textContent = 'Drawn frame by frame: this browser has no WebCodecs here';
  show(state.target);
}

async function encode() {
  const config = await pickCodec({ width: CLIP.width, height: CLIP.height, bitrate: BITRATE, fps: CLIP.fps });
  if (!config) throw new Error('no codec');
  const t0 = performance.now();
  const buffer = await packClip({
    count: CLIP.count, canvas: source, config, fps: CLIP.fps, keyEvery: KEY_EVERY,
    draw: (i) => drawDay(sg, i),
    onProgress: (n, of) => { if (n % 10 === 0) status.textContent = `Encoding the stand-in clip: ${n} / ${of}`; },
  });
  state.encodeMs = Math.round(performance.now() - t0);
  state.packBytes = buffer.byteLength;
  return buffer;
}

async function init() {
  size();
  // A resize clears the canvas: draw the frame on screen again.
  new ResizeObserver(() => { size(); if (scrubber) scrubber.refresh(); else if (state.shown !== null) drawDirect(state.shown); }).observe(screen);
  let forced = params.get('codecs') === 'off';
  try { forced ||= sessionStorage.getItem('webcodecs-frame-scrub:fallback') === '1'; } catch {}

  if (tier !== 'full') {
    state.mode = 'still';
    status.textContent = 'One frame: reduced motion';
    show(STILL);
  } else {
    if (!forced && 'VideoEncoder' in window && 'VideoDecoder' in window) {
      try {
        // A real site: const clip = readPack(await (await fetch('/film/day.bin')).arrayBuffer());
        const clip = readPack(await encode());
        scrubber = new FrameScrubber(clip, { draw: paint, bitmapWidth: screen.width, onError: toFallback });
        await scrubber.init();
        state.mode = 'webcodecs';
        state.codec = clip.codec;
        status.textContent = `${clip.codec.startsWith('avc') ? 'H.264' : clip.codec.startsWith('vp09') ? 'VP9' : 'VP8'} · ${Math.round(state.packBytes / 1024)} KB · a keyframe every ${KEY_EVERY} frames`;
      } catch (e) { toFallback(e); }
    } else {
      toFallback('WebCodecs unavailable');
    }
    const head = { f: 0 };
    gsap.to(head, {
      f: CLIP.count - 1, ease: 'none',
      scrollTrigger: { trigger: film, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
      onUpdate: () => show(head.f),
    });
    show(head.f);
    if (state.mode === 'webcodecs') idle(compare);
  }
  state.ready = true;
  awards.ready();
}

// In idle time: what the same frames would weigh as WebP stills, measured, beside the one stream.
const idle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 200));
async function compare() {
  const c = document.createElement('canvas');
  [c.width, c.height] = [CLIP.width, CLIP.height];
  const g = c.getContext('2d');
  let bytes = 0;
  for (let i = 0; i < CLIP.count; i++) {
    drawDay(g, i);
    bytes += (await new Promise((r) => c.toBlob(r, 'image/webp', 0.8)))?.size ?? 0;
    if (i % 6 === 5) await new Promise((r) => setTimeout(r, 0));
  }
  state.compare = { stillsBytes: bytes, packBytes: state.packBytes };
  const kb = (n) => `${Math.round(n / 1024).toLocaleString('en')} KB`;
  compareOut.querySelector('[data-stills]').textContent = kb(bytes);
  compareOut.querySelector('[data-stream]').textContent = kb(state.packBytes);
  compareOut.querySelector('[data-ratio]').textContent = `${(bytes / state.packBytes).toFixed(1)}×`;
  compareOut.hidden = false;
}

// Verification and captures.
window.__scrub = {
  get ready() { return state.ready; },
  // Scroll so the film's trigger sits at progress p.
  go(p) {
    const st = ScrollTrigger.getAll().find((s) => s.trigger === film);
    if (!st) return false;
    window.scrollTo(0, Math.round(st.start + (st.end - st.start) * p));
    ScrollTrigger.update();
    return true;
  },
  seek(i) { state.target = i; if (scrubber) scrubber.seek(i); else drawDirect(i); return true; },
  edge: () => readEdge(ctx, { x: 0, y: 0, w: screen.width, h: screen.height }),
  get stats() { return scrubber ? { ...scrubber.stats, cached: scrubber.cached.length, busy: scrubber.busy, decoderAt: scrubber.decoderAt } : null; },
};

awards.addState(() => ({
  ...state,
  canvasAriaHidden: screen.getAttribute('aria-hidden') === 'true',
  stats: window.__scrub.stats,
}));
init();
