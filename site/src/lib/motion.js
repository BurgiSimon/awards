// Motion vocabulary shared by every page: one easing family, expo-out arrivals, tiered by reduced motion.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { motionTier } from './reduced-motion.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const EASE = {
  out: 'expo.out',
  inOut: 'expo.inOut',
  theme: 'power2.inOut',
  none: 'none',
};
export const DUR = { feedback: 0.16, routine: 0.4, reveal: 0.9, hero: 1.2 };

// Masked line reveal for [data-split] headings (adapted from recipe split-text-masked-reveal).
// Call after document.fonts.ready: line breaks depend on the real face. Headings in the first viewport
// play at once; the rest wait for their chapter. Returns a cleanup.
export function revealHeadings(root = document) {
  const tier = motionTier();
  if (tier === 'static') return () => {};
  const els = [...root.querySelectorAll('[data-split]')];
  if (tier === 'reduced') {
    const tweens = els.map((el) => gsap.from(el, {
      autoAlpha: 0, duration: 0.3,
      scrollTrigger: el.getBoundingClientRect().top < innerHeight ? undefined : { trigger: el, start: 'top 85%', once: true },
    }));
    return () => tweens.forEach((t) => t.revert());
  }
  const splits = els.map((el) => SplitText.create(el, {
    type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'line',
    onSplit(self) {
      const above = el.getBoundingClientRect().top < innerHeight;
      return gsap.from(self.lines, {
        yPercent: 120, duration: DUR.reveal, ease: EASE.out, stagger: 0.08,
        scrollTrigger: above ? undefined : { trigger: el, start: 'top 85%', once: true },
      });
    },
  }));
  return () => splits.forEach((s) => s.revert());
}
