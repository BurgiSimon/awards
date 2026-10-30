import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { awards } from '../../_shared/awards-hook.js';
import { ticker, damp, clamp } from '../../_shared/raf.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// Screens that lean back as they leave. Each screen's lean is the product of two things: where it is (its exit
// progress, 0 while its top is below the viewport's top, 1 when its bottom has passed it) and how hard the page is
// moving (the scroll speed, as an energy that rises fast and relaxes slowly). Both are followed with framerate-
// independent damping on the shared ticker. The curl's callback is on that ticker only while something moves: a
// scroll adds it and it takes itself off once the page is quiet and every screen is flat. (GSAP's ticker keeps
// driving Lenis at rest, as on every Lenis page; the curl adds no work to it.) A parked half-gone screen is flat; a
// focused one is flat.

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();

const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

const MAX = 34;          // degrees: the furthest a screen ever leans, whatever the speed
const FULL_AT = 0.65;    // exit progress at which a screen's share of the lean is complete (smoothstep from 0)
const V_FULL = 1400;     // px/s of scroll that gives the full lean; faster is clamped
const K_RISE = 12;       // energy damping while the scroll speeds up (≈ a .18 lerp at 60 fps)
const K_FALL = 3.2;      // and while it slows: the relax, under 2° a second after the scroll stops, flat within about two
const K_ANGLE = 14;      // each screen's angle following its target
const QUIET = 90;        // ms without a scroll event after which the speed counts as zero
const MIN_DT = 6;        // ms: the shortest interval a speed is measured over
const V_CLAMP = 6000;    // px/s: the most any one measurement may read
const SCALE = 0.05;      // scale given up at the full lean
const SHADE = 0.5;       // shade opacity at the full lean
const EPS = 0.05;        // degrees: flat enough to write no transform and, once the energy is spent, to stop
const SPENT = 0.003;     // energy below which the page counts as quiet
const JUMP_START = 250;  // ms after Home or End for the browser's own scroll to begin

let tier = motionTier();
const list = document.querySelector('[data-screens]');
const items = [...document.querySelectorAll('[data-screen]')].map((el) => ({
  el,
  shade: el.querySelector('.screen__shade'),
  st: ScrollTrigger.create({ trigger: el.parentElement, start: 'top top', end: 'bottom top' }), // the untransformed item
  angle: 0,
}));
const state = { running: false, frames: 0, wakes: 0, energy: 0, velocity: 0, focused: -1 };

// Speed from Lenis' own scroll events (one per frame while it moves, native scrolls included), timed by the clock.
// The first event after a quiet spell has nothing to measure against and counts as zero, so an instant jump (an
// anchor, a programmatic scroll with `immediate`) never fakes a fling; the next event, a frame later, carries the real
// speed. Home and End are jumps too, but Chromium animates them natively at several thousand px/s, so the speed is
// ignored from the key press until that scroll has been quiet for QUIET ms. PageDown, Space and the arrows are
// scrolling, and lean like any scroll of their speed. A wheel or a touch ends the exemption at once. Two events closer
// than MIN_DT (a touch drag can deliver two in one frame, 1 ms apart) are too close to time: the later one is left
// for the next event to measure, so a 25 px step over 1 ms never reads as 25,000 px/s.
let lastY = window.scrollY;
let lastAt = -Infinity;
let jumpUntil = -Infinity;
function onScroll() {
  const now = performance.now();
  const y = window.scrollY;
  const jumping = now < jumpUntil;
  if (jumping) jumpUntil = now + QUIET; // the jump lasts as long as the scroll it started keeps moving
  const dt = now - lastAt;
  if (dt < MIN_DT && !jumping) { wake(); return; }
  state.velocity = jumping || dt > QUIET ? 0 : clamp((y - lastY) / (dt / 1000), -V_CLAMP, V_CLAMP);
  lastY = y;
  lastAt = now;
  wake();
}
window.addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.target.closest?.('input, textarea, select, [contenteditable]')) return;
  jumpUntil = e.key === 'Home' || e.key === 'End' ? performance.now() + JUMP_START : -Infinity;
});
const endJump = () => { jumpUntil = -Infinity; };
window.addEventListener('wheel', endJump, { passive: true });
window.addEventListener('touchstart', endJump, { passive: true });

const smoothstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

function write(it) {
  if (it.angle < EPS) {
    it.el.style.transform = '';
    it.shade.style.opacity = '';
    return;
  }
  const k = it.angle / MAX;
  it.el.style.transform = `rotateX(${it.angle.toFixed(3)}deg) scale(${(1 - SCALE * k).toFixed(4)})`;
  it.shade.style.opacity = (SHADE * k).toFixed(3);
}

function tick(dt) {
  state.frames++;
  if (performance.now() - lastAt > QUIET) state.velocity = 0;
  const target = Math.min(1, Math.abs(state.velocity) / V_FULL);
  state.energy = damp(state.energy, target, target > state.energy ? K_RISE : K_FALL, dt);
  let moving = state.energy > SPENT;
  items.forEach((it, i) => {
    if (i === state.focused) { it.angle = 0; write(it); return; }
    const goal = MAX * smoothstep(0, FULL_AT, it.st.progress) * state.energy;
    it.angle = Math.min(MAX, damp(it.angle, goal, K_ANGLE, dt));
    if (it.angle >= EPS) moving = true;
    write(it);
  });
  if (!moving && state.velocity === 0) sleep();
}

let off = null;
function wake() {
  if (tier !== 'full' || off) return;
  off = ticker.add(tick);
  state.running = true;
  state.wakes++;
}
function sleep() {
  off?.();
  off = null;
  state.running = false;
  state.energy = 0;
  items.forEach((it) => { it.angle = 0; write(it); });
}

// A focused screen is flat at once and stays flat while it holds focus, so its ring is never drawn on a slant.
list.addEventListener('focusin', (e) => {
  const i = items.findIndex((it) => it.el.contains(e.target));
  state.focused = i;
  if (i >= 0) { items[i].angle = 0; write(items[i]); }
});
list.addEventListener('focusout', () => { state.focused = -1; });

lenis.on('scroll', onScroll);
function applyTier() {
  tier = motionTier();
  if (tier !== 'full') sleep();
}
onMotionTierChange(applyTier);
new MutationObserver(applyTier).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

awards.addState(() => ({
  motion: tier,
  running: state.running,
  frames: state.frames,
  wakes: state.wakes,
  energy: Number(state.energy.toFixed(3)),
  velocity: Math.round(state.velocity),
  focused: state.focused,
  angles: items.map((it) => Number(it.angle.toFixed(2))),
  progress: items.map((it) => Number(it.st.progress.toFixed(3))),
}));
awards.ready();
