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
await document.fonts.ready;
ScrollTrigger.refresh();

awards.addState(() => ({ motion: motionTier(), gl: false, crossing, band: where.theme, chapter: where.chapter }));
document.documentElement.classList.add('is-ready');
awards.ready();
