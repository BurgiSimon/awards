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

const rail = document.querySelector('[data-rail]');
const track = document.querySelector('[data-track]');
const coarse = matchMedia('(pointer: coarse)');
const state = { native: false, x: 0, progress: 0, keySteps: 0 };
let trigger = null;

function distance() { return Math.max(0, track.scrollWidth + parseFloat(getComputedStyle(track).paddingLeft) * 2 - innerWidth); }

function build() {
  if (trigger) { trigger.kill(); trigger = null; }
  gsap.set(track, { clearProps: 'transform' });
  state.native = coarse.matches || motionTier() !== 'full';
  rail.classList.toggle('is-native', state.native);
  rail.style.height = '';
  if (state.native) return;
  // The rail's height is the track's overflow plus one viewport: vertical travel equals horizontal travel.
  rail.style.height = `${innerHeight + distance()}px`;
  trigger = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: { trigger: rail, start: 'top top', end: 'bottom bottom', scrub: 0.3, invalidateOnRefresh: true, onUpdate: (s) => { state.progress = s.progress; } },
  }).scrollTrigger;
}
build();
window.addEventListener('resize', () => { build(); ScrollTrigger.refresh(); });
coarse.addEventListener('change', build);

// Keyboard: with the rail focused, left / right move one panel's worth of scroll (page scroll drives the track).
rail.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  e.preventDefault();
  state.keySteps++;
  const step = (document.querySelector('.panel').offsetWidth + 24) * (e.key === 'ArrowRight' ? 1 : -1);
  if (state.native) rail.querySelector('.rail__stage').scrollBy({ left: step, behavior: 'smooth' });
  else lenis.scrollTo(window.scrollY + step, { duration: 0.6 });
});
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

awards.addState(() => ({
  motion: motionTier(),
  native: state.native,
  progress: Number(state.progress.toFixed(3)),
  x: Math.round(Number(gsap.getProperty(track, 'x')) || 0),
  keySteps: state.keySteps,
  scrollY: Math.round(scrollY),
  stageOverflow: getComputedStyle(rail.querySelector('.rail__stage')).overflowX,
  pinned: ScrollTrigger.getAll().filter((t) => t.pin).length,
}));
awards.ready();
