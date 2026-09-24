// Install and docs: read mode. One ticker, the capture hook, copy buttons; no scene.
import './styles/site.css';
import { awards } from './lib/awards-hook.js';
import { createScroll } from './lib/scroll.js';
import { syncMotionTierAttribute, motionTier } from './lib/reduced-motion.js';
import { mountCopyButtons } from './copy.js';

syncMotionTierAttribute();
createScroll();
mountCopyButtons();
await document.fonts.ready;
awards.addState(() => ({ motion: motionTier(), page: document.body.className }));
document.documentElement.classList.add('is-ready');
awards.ready();
