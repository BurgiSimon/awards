// Boot: one clock (GSAP's ticker drives Lenis, Lenis feeds ScrollTrigger), one motion tier, one quality probe,
// the borrowed day on top, and the window.__awards hook the capture tools and the jury drive the page through.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';
import { awards } from './lib/awards-hook.js';
import { createScroll } from './lib/scroll.js';
import { syncMotionTierAttribute, motionTier, onMotionTierChange } from './lib/reduced-motion.js';
import { detectQualityTier } from './lib/quality-tiers.js';
import { createDay } from './light/engine.js';
import { createCitySwitch } from './ui/city.js';
import { createPanelExplode } from './ui/panel.js';
import { createReserveForm } from './ui/form.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

syncMotionTierAttribute();
const root = document.documentElement;
const scroll = createScroll({ lerp: 0.09 });
const quality = await detectQualityTier({ sampleMs: 300 });
let tier = motionTier();

const announcer = document.getElementById('announcer');
const announce = (text) => {
  announcer.textContent = '';
  requestAnimationFrame(() => { announcer.textContent = text; });
};

// The wall is optional: WebGL2, a tier the device can carry, and a motion tier that is not static.
let wall = null;
let wallError = null;
if (tier !== 'static' && quality.probe.webgl2) {
  try {
    const { createWall } = await import('./webgl/wall.js');
    wall = createWall(document.querySelector('.wall-canvas'), quality);
  } catch (error) {
    wallError = String(error); // the CSS light stays; nothing waits on the canvas
    wall = null;
  }
}

await document.fonts.ready;
const day = createDay({ tier, wall, announce });
const cities = createCitySwitch({ onChoose: (id) => day.setCity(id) });
cities.sync(day.city.id);
let undoPanel = createPanelExplode({ tier });
createReserveForm({ announce });

if (wall) {
  // The canvas fades in over the CSS light only once it has drawn a frame.
  requestAnimationFrame(() => {
    if (wall.frames > 0 && !wall.lost) root.classList.add('has-gl');
  });
}
day.switchOn();
ScrollTrigger.refresh();
window.addEventListener('load', () => { day.refresh(); ScrollTrigger.refresh(); }, { once: true });

awards.addState(() => ({
  motion: tier,
  quality: quality.tier,
  triggers: ScrollTrigger.getAll().length,
  gl: !!wall && !wall.lost && root.classList.contains('has-gl'),
  wallError,
  ...day.state(),
}));

// A preference flipped mid-visit re-tiers the light and the drawing in place; never a reload.
const offMotion = onMotionTierChange((next) => {
  tier = next;
  undoPanel();
  undoPanel = createPanelExplode({ tier });
  day.setTier(tier);
  ScrollTrigger.refresh();
});
addEventListener('pagehide', (e) => { if (!e.persisted) wall?.dispose(); });
import.meta.hot?.dispose(() => {
  offMotion();
  undoPanel();
  day.destroy();
  wall?.dispose();
  scroll.destroy();
});

root.classList.add('is-ready');
awards.ready();
export { scroll, quality };
