// Boot: one clock (GSAP's ticker drives Lenis, Lenis feeds ScrollTrigger), one motion tier, one quality probe,
// and the window.__awards hook the capture tools and the jury drive the page through.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';
import { awards } from './lib/awards-hook.js';
import { createScroll } from './lib/scroll.js';
import { syncMotionTierAttribute, motionTier, onMotionTierChange } from './lib/reduced-motion.js';
import { detectQualityTier } from './lib/quality-tiers.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

syncMotionTierAttribute();
const scroll = createScroll({ lerp: 0.09 });
const quality = await detectQualityTier({ sampleMs: 300 });

await document.fonts.ready;
ScrollTrigger.refresh();

awards.addState(() => ({ motion: motionTier(), quality: quality.tier, triggers: ScrollTrigger.getAll().length, gl: false }));
const offMotion = onMotionTierChange(() => ScrollTrigger.refresh());
import.meta.hot?.dispose(() => {
  offMotion();
  scroll.destroy();
});

document.documentElement.classList.add('is-ready');
awards.ready();
export { scroll, quality };
