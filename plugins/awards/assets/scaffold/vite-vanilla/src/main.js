import './styles/base.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { awards } from './lib/awards-hook.js';
import { createScroll } from './lib/scroll.js';
import { syncMotionTierAttribute, motionTier } from './lib/reduced-motion.js';
import { detectQualityTier } from './lib/quality-tiers.js';
import { revealLines } from './lib/motion.js';

syncMotionTierAttribute();
const scroll = createScroll();
const quality = await detectQualityTier({ sampleMs: 300 });
awards.addState(() => ({ motion: motionTier(), quality: quality.tier, triggers: ScrollTrigger.getAll().length }));

// Sections reveal once as they enter; the hero reveals on load. One vocabulary, not a fade-up on everything.
await document.fonts.ready;
revealLines('.hero .line');
gsap.utils.toArray('[data-reveal]').forEach((el) => {
  ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: () => el.classList.add('is-inview') });
});

// WebGL is optional and lazy: only when the concept needs it and the device can carry it.
const loadScene = import.meta.glob('./webgl/scene.js')['./webgl/scene.js'];
if (loadScene && document.querySelector('[data-scene]') && quality.tier !== 'low') {
  const { mountScene } = await loadScene();
  mountScene(document.querySelector('[data-scene]'), quality);
}

document.documentElement.classList.add('is-ready');
awards.ready();
export { scroll, quality };
