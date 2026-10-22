// Install and docs: read mode. One ticker, the capture hook, heading reveals, copy buttons; no scene.
import './styles/site.css';
import gsap from 'gsap';
import { awards } from './lib/awards-hook.js';
import { createScroll } from './lib/scroll.js';
import { syncMotionTierAttribute, motionTier } from './lib/reduced-motion.js';
import { revealHeadings } from './lib/motion.js';
import { mountCopyButtons } from './copy.js';

syncMotionTierAttribute();
createScroll();
mountCopyButtons();
await document.fonts.ready;
// One tier decision, re-run and reverted by gsap.matchMedia when the preference flips.
gsap.matchMedia().add({ full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, () => {
  const undo = revealHeadings(motionTier());
  return () => undo();
});
awards.addState(() => ({ motion: motionTier(), page: document.body.className }));
document.documentElement.classList.add('is-ready');
awards.ready();
