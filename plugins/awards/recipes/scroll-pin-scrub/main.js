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

// The chapter is a tall section with a sticky stage inside it. The scroll consumes the section's own
// height, so no pinSpacing is injected and the scrollbar stays honest. ScrollTrigger only reads progress.
const chapter = document.querySelector('[data-pin]');
const object = document.querySelector('[data-object]');
const readout = document.querySelector('[data-readout]');
const beatEl = document.querySelector('[data-beat]');
const captions = gsap.utils.toArray('[data-caption]');
const state = { progress: 0, beat: 0 };

const tl = gsap.timeline({
  defaults: { ease: 'none' },            // scrubbed timelines are linear; Lenis' lerp is the smoothing
  scrollTrigger: {
    trigger: chapter,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.6,                            // a little catch-up so wheel steps do not stutter
    invalidateOnRefresh: true,             // re-measure on resize / font load
    onUpdate: (self) => {
      state.progress = self.progress;
      readout.textContent = String(Math.round(self.progress * 100)).padStart(3, '0');
      const beat = Math.min(2, Math.floor(self.progress * 3));
      if (beat !== state.beat) {
        state.beat = beat;
        beatEl.textContent = String(beat + 1).padStart(2, '0');
        captions.forEach((c, i) => c.classList.toggle('is-active', i === beat));
      }
    },
  },
});

const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  // Full tier: the object rotates and scales across the pin. Three beats, each a third of the scroll.
  tl.to(object, { rotation: 180, scale: 1.15, duration: 1 })
    .to(object, { rotation: 360, scale: 0.9, duration: 1 })
    .to(object, { rotation: 540, scale: 1, duration: 1 });
});
mm.add('(prefers-reduced-motion: reduce)', () => {
  // Reduced tier: no spatial movement; the beats still switch captions and the readout still counts.
  tl.to({}, { duration: 3 });
});

window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

awards.addState(() => ({
  motion: motionTier(),
  pinProgress: Number(state.progress.toFixed(3)),
  beat: state.beat + 1,
  rotation: Number(gsap.getProperty(object, 'rotation')) || 0,
}));
awards.ready();
