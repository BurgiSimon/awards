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

const path = document.querySelector('[data-path]');
const length = path.getTotalLength();
path.style.strokeDasharray = `${length}`;
const state = { length: Math.round(length), progress: 0 };
const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  path.style.strokeDashoffset = `${length}`;
  gsap.to(path, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: { trigger: '[data-route]', start: 'top 70%', end: 'bottom bottom', scrub: 0.3, onUpdate: (s) => { state.progress = s.progress; } },
  });
});
mm.add('(prefers-reduced-motion: reduce)', () => { path.style.strokeDashoffset = '0'; state.progress = 1; });
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

awards.addState(() => ({
  motion: motionTier(),
  length: state.length,
  dashoffset: Math.round(parseFloat(getComputedStyle(path).strokeDashoffset)),
  progress: Number(state.progress.toFixed(3)),
}));
awards.ready();
