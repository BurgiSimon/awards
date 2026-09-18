import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { syncMotionTierAttribute, motionTier } from '../_shared/reduced-motion.js';

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();

// 1. One clock: GSAP's ticker drives Lenis, Lenis feeds ScrollTrigger. Never two smooth-scroll libraries, never CSS scroll-behavior: smooth.
const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

// 2. Reduced motion decides the vocabulary once, through gsap.matchMedia.
const mm = gsap.matchMedia();
await document.fonts.ready; // split or measure text only after the real faces are in
mm.add({ full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, (ctx) => {
  const full = ctx.conditions.full;
  gsap.from('.hero .line', full
    ? { yPercent: 120, duration: 1.4, ease: 'expo.out', stagger: 0.09 }
    : { autoAlpha: 0, duration: 0.4, stagger: 0.03 });
});

// 3. Scrubbed values use ease: 'none'; the smoothing already lives in Lenis.
const progressEl = document.querySelector('[data-progress]');
const progress = { v: 0 };
gsap.to(progress, {
  v: 100,
  ease: 'none',
  scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.4 },
  onUpdate: () => { progressEl.textContent = String(Math.round(progress.v)).padStart(3, '0'); },
});

// 4. Chapters reveal once on entry (a class toggle so CSS owns the reduced-motion variant).
gsap.utils.toArray('[data-reveal]').forEach((el) => {
  ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: () => el.classList.add('is-inview') });
});

// 5. Refresh measurements after everything that can change layout has landed.
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

awards.addState(() => ({
  motion: motionTier(),
  lenis: !!window.lenis,
  triggers: ScrollTrigger.getAll().length,
  progress: Math.round(progress.v),
  revealed: document.querySelectorAll('.is-inview').length,
}));
awards.ready();
