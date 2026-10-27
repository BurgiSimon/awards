import 'lenis/dist/lenis.css';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { awards } from './lib/awards-hook.js';
import { createScroll } from './lib/scroll.js';
import { syncMotionTierAttribute, motionTier } from './lib/reduced-motion.js';
import { initMenu } from './ui/menu.js';
import { initFrames } from './ui/frame.js';
import { initMonths } from './ui/months.js';
import { initForms } from './ui/forms.js';
import { initThemeFollow } from './ui/theme.js';
import { initHead } from './ui/head.js';
import { pencilName } from './ui/name.js';

syncMotionTierAttribute();
const scroll = createScroll();
pencilName();
const menu = initMenu(scroll);
const frames = initFrames();
initMonths();
initThemeFollow();
initHead();
// The score (SplitText and every chapter beat) is its own chunk, fetched after first paint so it never blocks the page.
const score = { tier: motionTier(), mod: null };
const scoreReady = import('./motion/score.js').then((mod) => { score.mod = mod; mod.initScore(); return mod; })
  .catch(() => document.documentElement.classList.remove('hero-pending'));
initForms({
  // The ballot's payoff: the confirmation's own little print gets the name pencilled on, and the page's frame turns.
  onBallot: () => {
    scoreReady.then((mod) => mod?.writeName?.(document.querySelector('[data-pencil-write]')));
    return frames[0] && !frames[0].state.turned ? frames[0].turn(true, { announce: false }) : null;
  },
});

awards.addState(() => ({
  motion: motionTier(),
  scoreTier: score.tier,
  lenis: !!scroll.lenis,
  triggers: ScrollTrigger.getAll().length,
  menuOpen: !!menu?.state.open,
  framesTurned: frames.filter((f) => f.state.turned).length,
}));

Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(() => {
  document.documentElement.classList.add('is-ready');
  awards.ready();
});

export { scroll, frames };
