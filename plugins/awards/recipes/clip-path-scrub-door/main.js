import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { syncMotionTierAttribute, motionTier, onMotionTierChange } from '../_shared/reduced-motion.js';

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();

const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

const door = document.querySelector('[data-door]');
const veil = document.querySelector('[data-veil]');
const labels = [document.querySelector('[data-label-l]'), document.querySelector('[data-label-r]')];
const circle = document.querySelector('[data-circle]');

// Hole at progress 0: 20 % × 24 % of the stage, centred. At 1 it is the whole frame, so the veil paints nothing.
const HOLE0 = { w: 20, h: 24 };
const CIRCLE_MAX = 150; // % of the box's reference radius; centre at 50 % 120 % so 150 % clears the top corners
const state = { door: null, circle: null, doorP: 0, circleP: 0 };
let mm = null;

const r = (v) => Math.round(v * 100) / 100;
// Outer ring first, then the hole, as one polygon: with evenodd the inner ring is subtracted.
function holePath(p) {
  const w = HOLE0.w + (100 - HOLE0.w) * p, h = HOLE0.h + (100 - HOLE0.h) * p;
  const L = r(50 - w / 2), R = r(50 + w / 2), T = r(50 - h / 2), B = r(50 + h / 2);
  return `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${L}% ${T}%, ${R}% ${T}%, ${R}% ${B}%, ${L}% ${B}%, ${L}% ${T}%)`;
}
const circlePath = (p) => `circle(${r(p * CIRCLE_MAX)}% at 50% 120%)`;
const win = (st) => [Math.round(st.start), Math.round(st.end)];

function full(ctx) {
  const { phone } = ctx.conditions;
  document.documentElement.classList.add('has-door');
  veil.classList.add('is-closed');

  // A plain progress proxy keeps the clip-path string ours: GSAP never has to interpolate two polygons.
  const d = { p: 0 };
  const paintDoor = () => {
    veil.style.clipPath = holePath(d.p);
    state.doorP = d.p;
  };
  gsap.timeline({
    defaults: { ease: 'none' }, // scrubbed: linear, the smoothing is Lenis'
    scrollTrigger: {
      trigger: door, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true,
      onRefresh: (self) => { state.door = win(self); },
    },
  })
    .to(d, { p: 1, duration: 1, onUpdate: paintDoor }, 0)
    .to(labels[0], { x: '-50vw', duration: 1 }, 0)
    .to(labels[1], { x: '50vw', duration: 1 }, 0);
  paintDoor();

  const c = { p: 0 };
  const paintCircle = () => { circle.style.clipPath = circlePath(c.p); state.circleP = c.p; };
  gsap.to(c, {
    p: 1, ease: 'none', onUpdate: paintCircle,
    scrollTrigger: {
      trigger: circle,
      // The phone gets a longer, later window: the box is narrow, so the same arc needs more scroll to read.
      start: phone ? 'top 95%' : 'top 70%', end: phone ? 'bottom 90%' : 'center center',
      scrub: true, invalidateOnRefresh: true,
      onRefresh: (self) => { state.circle = win(self); },
    },
  });
  paintCircle();

  return () => {
    document.documentElement.classList.remove('has-door');
    veil.classList.remove('is-closed');
    veil.style.clipPath = '';
    circle.style.clipPath = '';
    Object.assign(state, { door: null, circle: null, doorP: 0, circleP: 0 });
  };
}

// Full tier: the door and the circle scrub. Reduced and static: no clip at all, the door stands open and the
// statement is plain text. matchMedia reverts the tweens, triggers and inline styles on every change.
function applyTier() {
  mm?.revert();
  mm = gsap.matchMedia();
  if (motionTier() === 'full') mm.add({ phone: '(max-width: 767px)', desk: '(min-width: 768px)' }, full);
  ScrollTrigger.refresh();
}
applyTier();
onMotionTierChange(applyTier);
new MutationObserver(applyTier).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

awards.addState(() => ({
  motion: motionTier(),
  door: state.door,
  circle: state.circle,
  doorP: Number(state.doorP.toFixed(3)),
  circleP: Number(state.circleP.toFixed(3)),
}));
awards.ready();
