// Boot: one clock (GSAP's ticker drives Lenis, Lenis feeds ScrollTrigger), one motion tier, and the
// window.__awards hook the capture tools and the jury drive the page through.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';
import { awards } from './lib/awards-hook.js';
import { createScroll } from './lib/scroll.js';
import { syncMotionTierAttribute, motionTier } from './lib/reduced-motion.js';
import { createMenu } from './ui/menu.js';
import { createBooking } from './ui/booking.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
syncMotionTierAttribute();

const scroll = createScroll({ lerp: 0.1 });
const announcer = document.getElementById('announcer');
const announce = (text) => {
  announcer.textContent = '';
  requestAnimationFrame(() => { announcer.textContent = text; });
};

createMenu();
createBooking({ announce });
await document.fonts.ready;
ScrollTrigger.refresh();

awards.addState(() => ({ motion: motionTier(), gl: false }));
document.documentElement.classList.add('is-ready');
awards.ready();
