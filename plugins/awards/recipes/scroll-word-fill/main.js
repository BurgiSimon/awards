import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute, onMotionTierChange } from '../_shared/reduced-motion.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
syncMotionTierAttribute();

const section = document.querySelector('[data-fill]');
const text = section.querySelector('[data-fill-text]');
// Resting opacity of an unread word. .5 keeps display-size ink at about 3.3:1 on the ground; goats' .15 and
// primesec's .36 read better as a fill but fail WCAG's 3:1 for large text before the reader gets there.
const FLOOR = Number(section.dataset.floor ?? 0.5);

let split = null;
let tl = null;

// Word boundaries depend on the real face, so split after the fonts land.
await document.fonts.ready;

function build(tier) {
  tl?.scrollTrigger?.kill();
  tl?.kill();
  split?.revert(); // restores the original sentence, so a tier change leaves no word spans behind
  split = tl = null;
  section.dataset.fillTier = tier;
  // Reduced and static: no split, no fill. The statement rests at full ink as one sentence.
  if (tier !== 'full') return;
  split = SplitText.create(text, {
    type: 'words',
    wordsClass: 'word',
    autoSplit: true, // re-split on width change; the returned timeline is rebuilt at the same progress
    onSplit(self) {
      // One scrubbed timeline: each word goes FLOOR → 1 over 1 unit, the next starts half a unit later,
      // so about two words are mid-fill at any moment. Linear: the scroll is the easing.
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',        // the stage has just stuck
          end: 'bottom 130%',      // done 30 vh before the stage releases: a short hold at full ink
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
      // Set the floor explicitly: a staggered fromTo inside a paused, scrubbed timeline only renders the
      // from-state of children the playhead has reached, so every later word would sit at full ink.
      gsap.set(self.words, { opacity: FLOOR });
      tl.to(self.words, { opacity: 1, duration: 1, stagger: 0.5, ease: 'none' });
      return tl;
    },
  });
}

build(motionTier());
onMotionTierChange(build);
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

awards.addState(() => {
  const words = [...text.querySelectorAll('.word')];
  return {
    motion: motionTier(),
    fillTier: section.dataset.fillTier,
    words: words.length,
    filled: words.filter((w) => Number(getComputedStyle(w).opacity) >= 0.999).length,
    fillProgress: Number((tl?.scrollTrigger?.progress ?? 0).toFixed(3)),
  };
});
awards.ready();
