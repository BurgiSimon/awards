import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { syncMotionTierAttribute, motionTier } from '../_shared/reduced-motion.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
syncMotionTierAttribute();

const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

const splits = [];
const state = { revealed: 0, splitCount: 0 };

// Fonts first: line boundaries depend on the real face. Splitting before that produces wrong lines
// and a second, visible re-split when the font swaps in.
await document.fonts.ready;

const mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference)', () => {
  document.querySelectorAll('[data-split]').forEach((el) => {
    const type = el.dataset.split === 'words' ? 'words' : 'lines';
    const delay = Number(el.dataset.splitDelay || 0);
    const below = el.hasAttribute('data-reveal');
    const split = SplitText.create(el, {
      type: type === 'lines' ? 'lines' : 'words,lines',
      mask: type === 'lines' ? 'lines' : 'words',   // an overflow:hidden wrapper per unit
      autoSplit: true,                              // re-split when the width changes
      linesClass: 'line',
      wordsClass: 'word',
      onSplit(self) {
        // Rebuild the reveal on every (re)split so a resize never leaves text hidden.
        el.classList.add('is-split');
        const targets = type === 'lines' ? self.lines : self.words;
        const tween = gsap.from(targets, {
          yPercent: 120,
          duration: 1.4,
          ease: 'expo.out',
          stagger: type === 'lines' ? 0.1 : 0.03,
          delay: below ? 0 : delay,
          onComplete: () => { state.revealed++; },
          scrollTrigger: below ? { trigger: el, start: 'top 85%', once: true } : undefined,
        });
        return tween; // returned animations are killed and rebuilt by autoSplit
      },
    });
    splits.push(split);
    state.splitCount++;
  });
  return () => { splits.splice(0).forEach((s) => s.revert()); };
});

mm.add('(prefers-reduced-motion: reduce)', () => {
  // Reduced tier: whole elements fade in briefly; no split, so the DOM keeps whole sentences.
  document.querySelectorAll('[data-split]').forEach((el) => {
    const below = el.hasAttribute('data-reveal');
    gsap.from(el, { autoAlpha: 0, duration: 0.4, onComplete: () => { state.revealed++; }, scrollTrigger: below ? { trigger: el, start: 'top 85%', once: true } : undefined });
  });
});

window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

awards.addState(() => ({
  motion: motionTier(),
  splitCount: state.splitCount,
  revealed: state.revealed,
  lines: document.querySelectorAll('.line').length,
  masks: document.querySelectorAll('[data-split] > div[style*="overflow"]').length || document.querySelectorAll('.line-mask, .word-mask').length,
}));
awards.ready();
