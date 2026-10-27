// The boot (awards:stack): one ticker, the capture hook, the motion tier and the page's few behaviours; then the
// motion score (awards:motion, AWARDS.md ## Motion score) on that same clock.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { awards } from './lib/awards-hook.js';
import { createScroll } from './lib/scroll.js';
import { syncMotionTierAttribute, motionTier } from './lib/reduced-motion.js';
import { initCopy } from './ui/copy.js';
import { initMenu } from './ui/menu.js';
import { initTheme } from './ui/theme.js';
import { initFilter } from './ui/filter.js';
import { initRequestedPath } from './ui/requested-path.js';
import { initClients } from './ui/clients.js';
import { initMotion } from './motion/index.js';

/* global __AWARDS_BUILD__ */
const BUILD = __AWARDS_BUILD__;
const root = document.documentElement;

syncMotionTierAttribute();
const scroll = createScroll();
initRequestedPath(); // first: it repoints the 404's in-page links before anything binds to them
initCopy();
initMenu();
// The band's real height (two rows on home) for the sticky stage and the scroll padding.
const band = document.querySelector('.band');
if (band) new ResizeObserver(() => root.style.setProperty('--band-h', `${band.offsetHeight}px`)).observe(band);
const theme = initTheme();
initFilter(scroll);
initClients();

// The load signal (AWARDS.md, LOAD & CLOSE): the faces, and the first two frames of the gathering decoded, with a
// 1.5 s ceiling, after which the first screen shows settled.
const firstFrames = [...document.querySelectorAll('[data-record] img')].slice(0, 2);
const decoded = Promise.all(firstFrames.map((img) => img.decode().catch(() => null)));
const signal = Promise.race([
  Promise.all([document.fonts.ready, decoded]).then(() => ({ timedOut: false })),
  new Promise((r) => setTimeout(() => r({ timedOut: true }), 1500)),
]);
const motion = initMotion({ signal });
awards.addSettle(() => motion.settled());

awards.addState(() => ({
  build: BUILD.id,
  motion: motionTier(),
  theme: theme.current(),
  lenis: !!window.lenis,
  triggers: ScrollTrigger.getAll().length,
  score: motion.state(),
  transition: window.__vt ?? null,
}));

// Interactive once the signal has come and the first screen's one moment has landed (or was shown settled).
await signal;
root.classList.add('is-ready');
await motion.heroDone;
awards.ready();

import.meta.hot?.dispose(() => scroll.destroy());
