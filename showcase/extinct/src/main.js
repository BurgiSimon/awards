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
import { createMicroscope } from './motion/microscope.js';

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
// The museum line is fixed: its measured height places the colours list under it and keeps anchor jumps clear of it.
const museum = document.querySelector('.museum');
const writeMuseumHeight = () => document.documentElement.style.setProperty('--museum-h', `${Math.round(museum.offsetHeight)}px`);
writeMuseumHeight();
new ResizeObserver(writeMuseumHeight).observe(museum);
createBooking({ announce });
const microscope = createMicroscope({ awards, announce, tier: motionTier });
await document.fonts.ready;
ScrollTrigger.refresh();

// The one hero-scale moment: the resin block turns 8° and settles. Reduced and static tiers leave it at rest.
if (motionTier() === 'full') {
  gsap.fromTo('.chapter--block .resin', { '--turn': '5deg' }, { '--turn': '-3deg', duration: 1.2, ease: 'expo.out' });
}

awards.addState(() => ({ motion: motionTier() }));
document.documentElement.classList.add('is-ready');
awards.ready();
// The field is not needed for first paint: it starts after the page is ready and shows after its own first frame.
requestAnimationFrame(() => requestAnimationFrame(() => microscope.start()));
