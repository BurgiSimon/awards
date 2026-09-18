// Motion vocabulary shared by every section: one easing family, expo-out arrivals, faster exits, tiered by reduced motion.
import gsap from 'gsap';

export const EASE = {
  out: 'expo.out',
  inOut: 'expo.inOut',
  theme: 'power2.inOut',
  none: 'none',
};
export const DUR = { feedback: 0.16, routine: 0.4, hero: 1.4 };

// gsap.matchMedia lets every animation declare its reduced-motion tier once.
export const mm = gsap.matchMedia();

// Masked line reveal used for headings across the site (call after document.fonts.ready).
export function revealLines(target, { stagger = 0.08, delay = 0 } = {}) {
  mm.add({ full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, (ctx) => {
    const { full } = ctx.conditions;
    return gsap.from(target, full
      ? { yPercent: 120, duration: DUR.hero, ease: EASE.out, stagger, delay }
      : { autoAlpha: 0, duration: 0.3, stagger: 0.02, delay });
  });
}
