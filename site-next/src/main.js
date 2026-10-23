// The boot (awards:stack): one ticker, the capture hook, the motion tier, and the page's few behaviours; then the
// motion score (awards:motion, AWARDS.md ## Motion score) on that same clock.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { awards } from './lib/awards-hook.js';
import { createScroll } from './lib/scroll.js';
import { syncMotionTierAttribute, motionTier } from './lib/reduced-motion.js';
import { initCopy } from './ui/copy.js';
import { initFrames } from './ui/frames.js';
import { initLoupe } from './ui/loupe.js';
import { initFilter } from './ui/filter.js';
import { initRequestedPath } from './ui/requested-path.js';
import { initMotion } from './motion/index.js';

/* global __AWARDS_BUILD__ */
const BUILD = __AWARDS_BUILD__;
const root = document.documentElement;

syncMotionTierAttribute();
const scroll = createScroll();
initRequestedPath(); // first: it repoints the 404's in-page links before anything binds to them
initCopy();
initFrames();
initLoupe(scroll);
initFilter(scroll);

// The load signal (AWARDS.md, LOAD & CLOSE): the faces, and the first frames the reader can see decoded, with a
// 1.5 s ceiling. Hidden lists are another width's frames and are never waited on.
const firstFrames = [...document.querySelectorAll('img[loading="eager"]')].filter((img) => img.offsetParent !== null);
const decoded = Promise.all(firstFrames.map((img) => img.decode().catch(() => null)));
const signal = Promise.race([
  Promise.all([document.fonts.ready, decoded]).then(() => ({ timedOut: false })),
  new Promise((r) => setTimeout(() => r({ timedOut: true }), 1500)),
]);
const motion = initMotion({ signal });
awards.addSettle(() => motion.settled());

awards.addState(() => ({
  build: BUILD.id,
  buildDirty: BUILD.dirty,
  proof: root.dataset.proof,
  motion: motionTier(),
  lenis: !!window.lenis,
  triggers: ScrollTrigger.getAll().length,
  score: motion.state(),
  transition: window.__vt ?? null,
}));

// Interactive once the signal has come and the first viewport's one moment has landed (or was shown drawn).
await signal;
root.classList.add('is-ready');
await motion.heroDone;
awards.ready();

import.meta.hot?.dispose(() => scroll.destroy());
