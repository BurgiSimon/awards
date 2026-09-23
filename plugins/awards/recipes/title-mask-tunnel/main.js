import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { syncMotionTierAttribute, motionTier, onMotionTierChange } from '../_shared/reduced-motion.js';

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();

const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

const section = document.querySelector('[data-tunnel]');
const stage = section.querySelector('.stage');
const mask = document.querySelector('[data-mask]');
const inner = document.querySelector('[data-inner]');
const scene = document.querySelector('[data-scene]');
const title = document.querySelector('[data-title]');
const items = gsap.utils.toArray('[data-scene] li');

const GAP = 700;          // px between works along z (CSS reads it as --gap)
const FRONT = -300;       // effective z at which a work reads as "in front" (perspective 900px → 0.75×)
const ZOOM = 1;           // timeline seconds for the doorway to cover the stage
const TRAVEL_AT = 0.8;    // the flight starts just before the doorway has covered the stage
const TRAVEL = 2.4;       // timeline seconds for the flight; scrub maps all of it onto the section's scroll
const DEPTH = items.length * GAP;   // the flight ends with the last work at z = 0

const state = { mode: 'flat', progress: 0 };
let tl = null;

// Smallest scale at which the capsule's straight part covers the stage: (W − H)·s ≥ stage width, H·s ≥ stage height.
// offsetWidth/Height ignore transforms, so this is safe to call at any point of the scrub.
const coverScale = () => 1.02 * Math.max(stage.clientWidth / Math.max(1, mask.offsetWidth - mask.offsetHeight), stage.clientHeight / mask.offsetHeight);

function deep() {
  section.dataset.mode = 'deep';
  scene.style.setProperty('--gap', `${GAP}px`);
  let cover = coverScale();
  // Zoom is exponential in progress (scale = cover^k), so the doorway approaches at a constant perceived speed
  // while the scrub itself stays linear. The inner scene is counter-scaled and stays at 1:1 behind the growing mask.
  const zoom = { k: 0 };
  const applyZoom = () => {
    const s = cover ** zoom.k;
    gsap.set(mask, { scale: s });
    gsap.set(inner, { scale: 1 / s });
  };
  tl = gsap.timeline({
    defaults: { ease: 'none' },            // scrubbed timelines are linear; Lenis' lerp is the smoothing
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      invalidateOnRefresh: true,
      onRefresh: () => { cover = coverScale(); applyZoom(); },
      onUpdate: (self) => { state.progress = self.progress; },
    },
  });
  tl.to(zoom, { k: 1, duration: ZOOM, onUpdate: applyZoom }, 0)
    .to(title, { opacity: 0, duration: 0.5 }, 0.35)
    .fromTo(scene, { z: 0 }, { z: DEPTH, duration: TRAVEL }, TRAVEL_AT);
}

function flat() {
  if (tl) { tl.scrollTrigger.kill(); tl.kill(); tl = null; }
  section.dataset.mode = 'flat';
  gsap.set([mask, inner, scene, title], { clearProps: 'all' });
  state.progress = 0;
}

// Full tier: the tunnel. Reduced and static tiers: the same heading and list, flat, no 3D transform.
function applyTier() {
  const want = motionTier() === 'full' ? 'deep' : 'flat';
  if (want === state.mode) return;
  state.mode = want;
  if (want === 'deep') deep(); else flat();
  ScrollTrigger.refresh();
}
applyTier();
onMotionTierChange(applyTier);
new MutationObserver(applyTier).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });

// Keyboard: focusing a work scrolls to the point of the flight where that work is in front.
scene.addEventListener('focusin', (e) => {
  if (!tl) return;
  const i = items.findIndex((li) => li.contains(e.target));
  const t = TRAVEL_AT + TRAVEL * ((i + 1) * GAP + FRONT) / DEPTH;
  const st = tl.scrollTrigger;
  lenis.scrollTo(st.start + (st.end - st.start) * Math.min(1, t / tl.duration()), { duration: 0.8 });
});

window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

awards.addState(() => ({
  motion: motionTier(),
  mode: state.mode,
  progress: Number(state.progress.toFixed(3)),
  maskScale: Number(Number(gsap.getProperty(mask, 'scale')).toFixed(3)),
  sceneZ: Math.round(Number(gsap.getProperty(scene, 'z')) || 0),
}));
awards.ready();
