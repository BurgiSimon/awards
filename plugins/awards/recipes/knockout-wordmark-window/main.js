import { ticker } from '../_shared/raf.js';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();

const canvas = document.querySelector('[data-ground]');
const ctx = canvas.getContext('2d', { alpha: false });
const hero = document.querySelector('[data-hero]');

const SCALE = 1 / 6;   // backing store is a sixth of the CSS size; the browser's bilinear upscale is the softness, for free
const STILL_T = 7.5;   // seconds: the composed frame the loop starts from, and the one the reduced and static tiers keep
const BASE = '#0016cb';
// colour, radius (× long side), x / y amplitude (× size), x / y angular speed (rad/s), phase
const BLOBS = [
  ['#ff5a36', 0.62, 0.34, 0.30, 0.50, 0.37, 0.0],
  ['#ffc800', 0.48, 0.38, 0.26, 0.35, 0.59, 2.1],
  ['#7a5cff', 0.55, 0.30, 0.34, 0.66, 0.30, 4.0],
  ['#00b3a4', 0.40, 0.36, 0.28, 0.43, 0.53, 5.3],
];
const FOLDS = 3;        // light / shade bands sliding across the ground, like cloth
const FOLD_SPEED = 0.9; // rad/s

let clock = STILL_T;
const state = { running: false, visible: true, frames: 0 };

function resize() {
  canvas.width = Math.max(1, Math.round(innerWidth * SCALE));
  canvas.height = Math.max(1, Math.round(innerHeight * SCALE));
}

function draw(t) {
  const { width: w, height: h } = canvas;
  const long = Math.max(w, h);
  ctx.fillStyle = BASE;
  ctx.fillRect(0, 0, w, h);
  for (const [colour, r, ax, ay, wx, wy, p] of BLOBS) {
    const x = w * (0.5 + ax * Math.sin(t * wx + p));
    const y = h * (0.5 + ay * Math.cos(t * wy + p * 1.7));
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * long);
    g.addColorStop(0, colour);
    g.addColorStop(1, `${colour}00`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  const folds = ctx.createLinearGradient(0, 0, w, h);
  for (let i = 0; i <= 16; i++) {
    const a = 0.16 * Math.sin((i / 16) * FOLDS * Math.PI * 2 - t * FOLD_SPEED);
    folds.addColorStop(i / 16, a > 0 ? `rgba(255,255,255,${a.toFixed(3)})` : `rgba(0,0,40,${(-a).toFixed(3)})`);
  }
  ctx.fillStyle = folds;
  ctx.fillRect(0, 0, w, h);
  state.frames++;
}

const loop = (dt) => { clock += dt; draw(clock); };

// Full tier: the ground moves while the hero (the only window onto it) is on screen; the shared ticker also pauses
// on a hidden tab. Reduced and static: one still frame, no loop.
function sync() {
  const run = motionTier() === 'full' && state.visible;
  if (run && !state.running) ticker.add(loop);
  if (!run && state.running) ticker.remove(loop);
  state.running = run;
  if (!run) draw(clock);
}

resize();
draw(clock);
sync();
onMotionTierChange(sync);
new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; sync(); }).observe(hero);
addEventListener('resize', () => { resize(); draw(clock); });

awards.addState(() => ({
  motion: motionTier(),
  running: state.running,
  frames: state.frames,
  clock: Number(clock.toFixed(3)),
  ground: [canvas.width, canvas.height],
}));
awards.ready();
