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

const cards = gsap.utils.toArray('[data-card]');
const state = { scales: [] };
const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  // Card n settles (scale down, dim) while card n+1 travels from the bottom of the viewport to its sticky top.
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, {
      scale: 0.92 - i * 0.02,
      opacity: 0.6,
      ease: 'none',
      scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 12%', scrub: 0.4, invalidateOnRefresh: true },
    });
  });
});
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

awards.addState(() => ({
  motion: motionTier(),
  scales: cards.map((c) => Number(gsap.getProperty(c, 'scale')) || 1).map((v) => Math.round(v * 1000) / 1000),
  opacities: cards.map((c) => Number(getComputedStyle(c).opacity)),
  pinned: ScrollTrigger.getAll().filter((t) => t.pin).length,
}));
awards.ready();
