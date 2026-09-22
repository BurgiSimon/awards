import './styles/base.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { awards } from './lib/awards-hook.js';
import { createScroll } from './lib/scroll.js';
import { syncMotionTierAttribute, motionTier, onMotionTierChange } from './lib/reduced-motion.js';
import { detectQualityTier } from './lib/quality-tiers.js';
import { revealLines, mm } from './lib/motion.js';

syncMotionTierAttribute();
const scroll = createScroll();
const quality = await detectQualityTier({ sampleMs: 300 });

// Sections reveal once as they enter; the hero reveals on load. One vocabulary, not a fade-up on everything.
await document.fonts.ready;
revealLines('.hero .line');
gsap.utils.toArray('[data-reveal]').forEach((el) => {
  ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: () => el.classList.add('is-inview') });
});

// WebGL is optional and lazy: only when the concept needs it and the device can carry it.
const loadScene = import.meta.glob('./webgl/scene.js')['./webgl/scene.js'];
const host = document.querySelector('[data-scene]');
let scene = null;
let sceneError = null;
let active = true;
async function syncScene() {
  if (motionTier() !== 'full') {
    scene?.dispose();
    scene = null;
    return;
  }
  if (!loadScene || !host || quality.tier === 'low' || scene) return;
  try {
    const { mountScene } = await loadScene();
    if (active && !scene && motionTier() === 'full') scene = mountScene(host, quality);
  } catch (error) {
    sceneError = String(error); // Optional graphics cannot block the readable DOM or readiness.
  }
}
const offMotion = onMotionTierChange(syncScene);
await syncScene();
awards.addState(() => ({ motion: motionTier(), quality: quality.tier, triggers: ScrollTrigger.getAll().length, gl: !!scene, sceneError }));
import.meta.hot?.dispose(() => {
  active = false;
  offMotion();
  scene?.dispose();
  mm.revert();
  scroll.destroy();
});

document.documentElement.classList.add('is-ready');
awards.ready();
export { scroll, quality };
