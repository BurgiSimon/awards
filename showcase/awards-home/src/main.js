// Boot: one clock (GSAP's ticker drives Lenis, Lenis feeds ScrollTrigger), one motion tier, the registration on top,
// and the window.__awards hook the capture tools and the jury drive the page through.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';
import { awards } from './lib/awards-hook.js';
import { createScroll } from './lib/scroll.js';
import { syncMotionTierAttribute, motionTier, onMotionTierChange } from './lib/reduced-motion.js';
import { createRegister } from './register.js';
import { createInstall } from './ui/install.js';
import { createPlates } from './ui/plates.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
syncMotionTierAttribute();

const scroll = createScroll({ lerp: 0.12 });
const announcer = document.getElementById('announcer');
const announce = (text) => {
  announcer.textContent = '';
  requestAnimationFrame(() => { announcer.textContent = text; });
};

createInstall({ announce });
createPlates();
await document.fonts.ready;
const register = createRegister({ tier: motionTier(), announce });
ScrollTrigger.refresh();
window.addEventListener('load', () => { register.refresh(); ScrollTrigger.refresh(); }, { once: true });

awards.addState(() => ({ motion: motionTier(), gl: false, ...register.state() }));
const offMotion = onMotionTierChange((next) => register.setTier(next));
import.meta.hot?.dispose(() => {
  offMotion();
  register.destroy();
  scroll.destroy();
});

document.documentElement.classList.add('is-ready');
awards.ready();
