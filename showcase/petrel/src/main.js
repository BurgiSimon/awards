// Boot: one clock (GSAP's ticker drives Lenis, Lenis feeds ScrollTrigger), one motion tier, the bridge line that
// follows the band under it, and the window.__awards hook the capture tools and the jury drive the page through.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';
import { awards } from './lib/awards-hook.js';
import { createScroll } from './lib/scroll.js';
import { syncMotionTierAttribute, motionTier } from './lib/reduced-motion.js';
import { createMenu } from './ui/menu.js';
import { createDesk } from './ui/desk.js';
import { createBridge } from './ui/bridge.js';
import { writeCrossing } from './ui/crossing.js';
import { createScore } from './motion/score.js';
import { createCable } from './motion/cable.js';
import { detectQualityTier } from './lib/quality-tiers.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
syncMotionTierAttribute();

const scroll = createScroll({ lerp: 0.12 });
const announcer = document.getElementById('announcer');
const announce = (text) => {
  announcer.textContent = '';
  requestAnimationFrame(() => { announcer.textContent = text; });
};

createMenu();
createDesk({ announce });
const crossing = writeCrossing(document.querySelector('[data-crossing]'));
const bridge = createBridge();
let where = {};
ScrollTrigger.addEventListener('refresh', bridge.measure);
bridge.measure();
gsap.ticker.add(() => { where = bridge.update(); });
const score = createScore();
const cable = createCable({ score, awards });
await document.fonts.ready;
ScrollTrigger.refresh();

awards.addState(() => ({ motion: motionTier(), crossing, band: where.theme, chapter: where.chapter }));
document.documentElement.classList.add('is-ready');
awards.ready();

// The GL cable is not needed for first paint: Three loads after the page is ready, and the drawn cable stays until the
// GL one has drawn its first frame. No WebGL2, a failed probe or a lost context leave the drawn tier in place.
async function startGL() {
  if (!('WebGL2RenderingContext' in window)) return;
  const quality = await detectQualityTier({ sampleMs: 400 });
  awards.addState(() => ({ quality: quality.tier }));
  try {
    const { mountScene } = await import('./webgl/scene.js');
    cable.attach(mountScene(document.querySelector('.cable__gl'), quality));
  } catch (err) {
    console.warn('[cable] staying on the drawn tier:', err);
  }
}
requestAnimationFrame(() => requestAnimationFrame(startGL));
addEventListener('pagehide', () => cable.destroy(), { once: true });
