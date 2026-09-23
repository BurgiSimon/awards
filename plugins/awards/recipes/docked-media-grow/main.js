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

const section = document.querySelector('[data-reel-section]');
const reel = document.querySelector('[data-reel]');
const cue = document.querySelector('[data-cue]');

const DOCK_PX = 300;       // docked card width on desktop
const DOCK_MAX = 0.24;     // never more than this fraction of the final box
const BREAKPOINT = '(min-width: 1024px)'; // below it the reel sits in the flow, as on the source site
const state = { mode: 'flow', progress: 0, grow: null };
let mm = null;

// reel.offsetWidth is the layout box, which ignores transforms, so this is safe at any point of the scrub.
const dockScale = () => Math.min(DOCK_MAX, DOCK_PX / Math.max(1, reel.offsetWidth));
const setDocked = (on) => { reel.classList.toggle('is-docked', on); state.mode = on ? 'dock' : 'flow'; };

function dock() {
  cue.hidden = false;
  setDocked(true);
  const tl = gsap.timeline({
    defaults: { ease: 'none' },            // scrubbed: linear, the smoothing is Lenis'
    scrollTrigger: {
      trigger: section,
      start: 'top 85%',
      end: 'top top',                      // the section's top reaches the viewport's: fixed box = section box
      scrub: true,                         // no catch-up lag, so the hand-off at `end` lands on scale 1 exactly
      invalidateOnRefresh: true,
      onUpdate: (self) => { state.progress = self.progress; },
      onRefresh: (self) => { state.grow = [Math.round(self.start), Math.round(self.end)]; state.progress = self.progress; setDocked(self.progress < 1); },
      onLeave: () => setDocked(false),     // hand the reel to the section's flow; the two boxes coincide here
      onEnterBack: () => setDocked(true),
    },
  });
  // The grow is transform only: layout stays the final box throughout.
  tl.fromTo(reel, { scale: dockScale }, { scale: 1, duration: 1 }, 0)
    .to(cue, { autoAlpha: 0, duration: 0.15 }, 0);

  const go = (e) => { e.preventDefault(); lenis.scrollTo(section, { duration: 1.2 }); };
  cue.addEventListener('click', go);
  return () => {
    cue.removeEventListener('click', go);
    cue.hidden = true;
    setDocked(false);
    state.grow = null;
    state.progress = 0;
  };
}

// Full tier on a wide screen: the dock. Reduced and static tiers, and narrow screens: the reel sits full-size in its section.
function applyTier() {
  mm?.revert();
  mm = gsap.matchMedia();
  if (motionTier() === 'full') mm.add(BREAKPOINT, dock);
  ScrollTrigger.refresh();
}
applyTier();
onMotionTierChange(applyTier);
new MutationObserver(applyTier).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

awards.addState(() => ({
  motion: motionTier(),
  mode: state.mode,
  progress: Number(state.progress.toFixed(3)),
  grow: state.grow,
  scale: Number(Number(gsap.getProperty(reel, 'scale')).toFixed(4)),
}));
awards.ready();
