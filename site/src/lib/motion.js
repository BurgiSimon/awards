// Motion vocabulary shared by every page: one easing family, expo-out arrivals, tiered by reduced motion.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const EASE = {
  out: 'expo.out',
  inOut: 'expo.inOut',
  theme: 'power2.inOut',
  none: 'none',
};
export const DUR = { feedback: 0.16, routine: 0.4, reveal: 0.9, hero: 1.2, reduced: 0.12 }; // reduced = --dur-routine under reduce
export const REVEAL_START = 'top 80%';

// Masked line reveal for [data-split] (adapted from recipe split-text-masked-reveal: keep the masked lines and
// autoSplit; change the travel to 120 % at 0.9 s, stagger .08, trigger at the chapter's top 80 %; pair it with
// each chapter's entrance). Call after document.fonts.ready: line breaks depend on the real face. Elements in
// the first viewport play at once; the rest wait for their chapter, once. Returns a cleanup for the tier switch.
export function revealHeadings(tier, root = document) {
  if (tier === 'static') return () => {};
  const els = [...root.querySelectorAll('[data-split]')];
  const trigger = (el) => (el.getBoundingClientRect().top < innerHeight ? undefined : { trigger: el, start: REVEAL_START, once: true });
  if (tier === 'reduced') {
    // No split and no travel: whole elements fade, so the DOM keeps whole sentences.
    const tweens = els.map((el) => gsap.from(el, { autoAlpha: 0, duration: DUR.reduced, ease: EASE.out, scrollTrigger: trigger(el) }));
    return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.revert(); });
  }
  const copies = [];
  const splits = els.map((el) => {
    // A heading may carry the label SplitText adds; ARIA forbids naming a span or paragraph, so a split
    // non-heading is hidden from assistive tech and a visually hidden copy carries its words instead.
    const named = /^H[1-6]$/.test(el.tagName);
    if (!named) {
      const copy = el.cloneNode(true);
      copy.className = 'sr-only';
      copy.removeAttribute('id');
      for (const key of Object.keys(copy.dataset)) delete copy.dataset[key];
      el.before(copy);
      copies.push(copy);
    }
    return SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'line', aria: named ? 'auto' : 'hidden',
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 120, duration: DUR.reveal, ease: EASE.out, stagger: 0.08, scrollTrigger: trigger(el),
        });
      },
    });
  });
  return () => { splits.forEach((s) => s.revert()); copies.forEach((c) => c.remove()); };
}
