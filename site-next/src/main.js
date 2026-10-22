// The boot (awards:stack): one ticker, the capture hook, the motion tier, and the page's few behaviours.
// No choreography lives here; the motion phase adds the score on top of this clock (AWARDS.md ## Motion score).
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { awards } from './lib/awards-hook.js';
import { createScroll } from './lib/scroll.js';
import { syncMotionTierAttribute, motionTier } from './lib/reduced-motion.js';
import { initCopy } from './ui/copy.js';
import { initFrames } from './ui/frames.js';
import { initLoupe } from './ui/loupe.js';
import { initFilter } from './ui/filter.js';
import { initRequestedPath } from './ui/requested-path.js';

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

awards.addState(() => ({
  build: BUILD.id,
  buildDirty: BUILD.dirty,
  proof: root.dataset.proof,
  motion: motionTier(),
  lenis: !!window.lenis,
  triggers: ScrollTrigger.getAll().length,
}));

// Interactive once the faces are in and the first frames the reader can see are decoded, with a 1.5 s ceiling
// (AWARDS.md, LOAD & CLOSE). Hidden lists are another width's frames and are never waited on.
const firstFrames = [...document.querySelectorAll('img[loading="eager"]')].filter((img) => img.offsetParent !== null);
const decoded = Promise.all(firstFrames.map((img) => img.decode().catch(() => null)));
await Promise.race([Promise.all([document.fonts.ready, decoded]), new Promise((r) => setTimeout(r, 1500))]);
root.classList.add('is-ready');
awards.ready();

import.meta.hot?.dispose(() => scroll.destroy());
