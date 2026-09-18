import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { syncMotionTierAttribute, motionTier } from '../_shared/reduced-motion.js';

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();

const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

const state = { hero: 0, stages: 0 };
const mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference)', () => {
  // Hero hinge: the panel swings on its bottom-left corner across the rail; the child rotates harder
  // and lags a little, which is what makes the panel read as a physical object rather than a tween.
  const hero = document.querySelector('[data-rail="hero"]');
  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true, onUpdate: (s) => (state.hero = s.progress) },
  })
    .to('[data-hinge]', { xPercent: -10, rotation: -15, duration: 1 }, 0)
    .to('[data-hinge-child]', { rotation: -22, xPercent: 12, duration: 0.9 }, 0.1);

  // Stages: three cards rise, hold and fall in turn as the rail scrolls. Each card owns a third.
  const rail = document.querySelector('[data-rail="stages"]');
  const cards = gsap.utils.toArray('[data-stage]');
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: rail, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true, onUpdate: (s) => (state.stages = s.progress) },
  });
  gsap.set(cards, { yPercent: 40, opacity: 0.2 });
  cards.forEach((card, i) => {
    tl.to(card, { yPercent: 0, opacity: 1, duration: 1 }, i)
      .to(card, { yPercent: -8, duration: 1 }, i + 1);
  });
});

mm.add('(prefers-reduced-motion: reduce)', () => {
  // Reduced tier: nothing moves; progress is still tracked so wayfinding elsewhere can use it.
  ScrollTrigger.create({ trigger: '[data-rail="hero"]', start: 'top top', end: 'bottom bottom', onUpdate: (s) => (state.hero = s.progress) });
  ScrollTrigger.create({ trigger: '[data-rail="stages"]', start: 'top top', end: 'bottom bottom', onUpdate: (s) => (state.stages = s.progress) });
});

window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

awards.addState(() => ({
  motion: motionTier(),
  hero: Number(state.hero.toFixed(3)),
  stages: Number(state.stages.toFixed(3)),
  panelRotation: Number(gsap.getProperty('[data-hinge]', 'rotation')) || 0,
  childRotation: Number(gsap.getProperty('[data-hinge-child]', 'rotation')) || 0,
  pinned: ScrollTrigger.getAll().filter((t) => t.pin).length,
}));
awards.ready();
