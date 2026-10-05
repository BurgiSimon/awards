import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker } from '../_shared/raf.js';
import { createHandler } from './draw.js';

syncMotionTierAttribute();
const HELLO_TIMEOUT = 1000; // ms the Worker gets to answer before the same draw code runs here
const html = document.documentElement;
const stage = document.querySelector('[data-stage]');
const out = document.querySelector('[data-mode]');
let canvas = document.querySelector('[data-loader]');
const css = getComputedStyle(html);
const colors = Object.fromEntries(['ground', 'ink', 'accent'].map((k) => [k, css.getPropertyValue(`--${k}`).trim()]));
const animate = motionTier() === 'full';
const state = { mode: 'pending', reason: null, decidedMs: null, running: false, blocked: 0 };
const t0 = performance.now();
let worker = null;
let send = () => {};

const size = () => {
  const dpr = Math.min(devicePixelRatio, 2);
  return { width: Math.round(canvas.clientWidth * dpr), height: Math.round(canvas.clientHeight * dpr) };
};

function start(mode, reason) {
  state.mode = mode;
  state.reason = reason;
  state.decidedMs = Math.round(performance.now() - t0);
  html.dataset.renderMode = mode;
  out.textContent = mode === 'worker' ? 'worker thread' : `main thread (${reason})`;
  send({ type: 'init', colors, animate, ...size() });
  send({ run: visible });
  state.running = visible && animate;
  awards.ready();
}

function runOnMain(reason) {
  worker?.terminate();
  worker = null;
  if (state.mode === 'worker') {
    // The old canvas was handed to the Worker and can never give a context here again: swap in a fresh one.
    const fresh = canvas.cloneNode();
    canvas.replaceWith(fresh);
    canvas = fresh;
  }
  const handle = createHandler((fn) => ticker.add(fn));
  send = (msg) => handle(msg.type === 'init' ? { ...msg, canvas } : msg);
  start('main', reason);
}

function runInWorker() {
  const offscreen = canvas.transferControlToOffscreen();
  send = (msg) => (msg.type === 'init' ? worker.postMessage({ ...msg, canvas: offscreen }, [offscreen]) : worker.postMessage(msg));
  start('worker', 'hello');
}

// Pause whichever thread draws while the stage is off-screen.
let visible = true;
new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  send({ run: visible });
  state.running = visible && animate && state.mode !== 'pending';
}).observe(stage);
new ResizeObserver(() => state.mode !== 'pending' && send(size())).observe(stage);

if (!('transferControlToOffscreen' in canvas) || typeof Worker === 'undefined') {
  runOnMain('unsupported');
} else {
  worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  // Fixed hello handshake: the canvas is only transferred once the Worker has proved it is alive.
  const timer = setTimeout(() => runOnMain('timeout'), HELLO_TIMEOUT);
  worker.addEventListener('message', ({ data }) => {
    if (data.type === 'hello' && state.mode === 'pending') { clearTimeout(timer); runInWorker(); }
  });
  worker.addEventListener('error', () => { clearTimeout(timer); if (state.mode !== 'main') runOnMain('error'); });
  worker.postMessage({ type: 'hello' });
}

// Demo: hog the main thread. The Worker keeps drawing; the fallback freezes for the same span.
document.querySelector('[data-block]').addEventListener('click', () => {
  const end = performance.now() + 800;
  while (performance.now() < end);
  state.blocked++;
});

awards.addState(() => ({ motion: motionTier(), animate, ...state, timeout: HELLO_TIMEOUT }));
