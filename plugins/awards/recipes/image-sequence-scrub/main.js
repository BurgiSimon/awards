import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();
const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

const FRAMES = 48;
const canvas = document.querySelector('[data-canvas]');
const ctx = canvas.getContext('2d');
const frameEl = document.querySelector('[data-frame]');
const state = { frame: -1, loaded: 0, ready: false, progress: 0 };
const frames = new Array(FRAMES);

// Stand-in for `frames/0001.jpg … 0048.jpg`: render each frame once into its own canvas. Replace `makeFrame`
// with `fetch` + `createImageBitmap` for real sequences; keep the same load-count signal for the preloader.
function makeFrame(i) {
  const c = document.createElement('canvas'); c.width = 1280; c.height = 720;
  const g = c.getContext('2d');
  g.fillStyle = '#1a1c1c'; g.fillRect(0, 0, 1280, 720);
  const a = (i / FRAMES) * Math.PI * 2;
  g.save(); g.translate(640, 360); g.rotate(a);
  g.fillStyle = '#619785'; g.beginPath(); g.ellipse(0, 0, 300, 120, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#bf5114'; g.fillRect(-16, -160, 32, 320);
  g.restore();
  return c;
}
async function load() {
  for (let i = 0; i < FRAMES; i++) {
    frames[i] = makeFrame(i);
    state.loaded = i + 1;
    if (i % 8 === 7) await new Promise((r) => setTimeout(r)); // yield so the preloader can paint progress
  }
}
function draw(i) {
  const idx = Math.max(0, Math.min(FRAMES - 1, Math.round(i)));
  if (idx === state.frame) return;
  state.frame = idx;
  ctx.drawImage(frames[idx], 0, 0, canvas.width, canvas.height);
  frameEl.textContent = String(idx + 1).padStart(2, '0');
}

await load();
document.documentElement.classList.add('seq-ready');
state.ready = true;
if (motionTier() === 'full') {
  const obj = { f: 0 };
  gsap.to(obj, {
    f: FRAMES - 1,
    ease: 'none',
    onUpdate: () => draw(obj.f), // the tween's own update: the scrubbed value keeps easing after the scroll event
    scrollTrigger: { trigger: '[data-seq]', start: 'top top', end: 'bottom bottom', scrub: 0.5, onUpdate: (s) => { state.progress = s.progress; } },
  });
  draw(0);
} else {
  draw(Math.floor(FRAMES / 2)); // reduced motion: one chosen frame, no scrub
}
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

awards.addState(() => ({
  motion: motionTier(),
  ready: state.ready,
  loaded: state.loaded,
  frame: state.frame,
  progress: Number(state.progress.toFixed(3)),
  posterInDom: !!document.querySelector('[data-poster][alt]'),
  canvasAriaHidden: canvas.getAttribute('aria-hidden') === 'true',
}));
awards.ready();
