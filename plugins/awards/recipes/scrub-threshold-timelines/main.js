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

const scene = document.querySelector('[data-scene]');
const bloom = document.querySelector('[data-bloom]');
const frameEl = document.querySelector('[data-frame]');
const steps = { closed: document.querySelector('[data-step="closed"]'), open: document.querySelector('[data-step="open"]') };
const copyLines = gsap.utils.toArray('[data-copy] .copy__line');
const finalLines = gsap.utils.toArray('[data-final] .copy__line');

// Generated geometry: twelve petals, each told its index. Nothing is downloaded.
for (let i = 0; i < 12; i++) {
  const s = document.createElement('span');
  s.style.setProperty('--i', i);
  bloom.append(s);
}

const FRAMES = 120;
// Each copy timeline owns a window [in, out) of the scrub's progress, an entrance speed and an exit speed.
// The exit runs 2–3× faster than the entrance, so leaving never holds up the picture.
const BEATS = [
  { key: 'copy', lines: copyLines, from: 0.3, to: 0.6, inSpeed: 1.5, outSpeed: 3.5 },
  { key: 'final', lines: finalLines, from: 0.81, to: Infinity, inSpeed: 1.25, outSpeed: 3.5 },
];
const state = { window: null, progress: 0, frame: 1, builds: 0 };
let mm = null;
let live = []; // the current tier's copy timelines, read by the verifier hook

function build(tier) {
  state.builds++;
  const spatial = tier === 'full';

  // The copy: paused timelines, never attached to the scroll. Reduced keeps the fade and drops the rise.
  const tls = BEATS.map((b) => {
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(b.lines,
      { autoAlpha: 0, yPercent: spatial ? 60 : 0 },
      { autoAlpha: 1, yPercent: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' });
    return tl;
  });
  live = tls;

  // Called with the scrub's progress on every update. Only a change of side does anything, so a timeline is played
  // or reversed once per crossing and keeps running on its own clock while the scrub moves on.
  const inside = BEATS.map(() => false);
  const gate = (p, instant) => {
    BEATS.forEach((b, i) => {
      const now = p >= b.from && p < b.to;
      if (now === inside[i] && !instant) return;
      inside[i] = now;
      const tl = tls[i];
      if (tier === 'static' || instant) tl.progress(now ? 1 : 0).pause();
      else if (now) tl.timeScale(b.inSpeed).play();
      else tl.timeScale(b.outSpeed).reverse();
    });
  };

  // The picture: one linear scrub. Inside it, the step label flips with two .001 s tweens at the half-way mark:
  // a step change on a continuous timeline, so scrubbing back across .5 flips it back exactly.
  const prog = { f: 0 };
  const scrub = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: scene, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true,
      onRefresh: (self) => { state.window = [Math.round(self.start), Math.round(self.end)]; gate(self.progress, true); },
      onUpdate: (self) => { state.progress = self.progress; gate(self.progress, false); },
    },
  });
  scrub.to(prog, {
    f: 1, duration: 1,
    onUpdate: () => {
      state.frame = 1 + Math.round(prog.f * (FRAMES - 1));
      frameEl.textContent = String(state.frame).padStart(3, '0');
    },
  }, 0);
  if (spatial) scrub.to(bloom, { '--open': 1, rotation: 90, duration: 1 }, 0);
  scrub
    .to(steps.closed, { autoAlpha: 0, duration: 0.001 }, 0.5)
    .to(steps.open, { autoAlpha: 1, duration: 0.001 }, 0.5);

  return () => {
    tls.forEach((tl) => tl.kill());
    gsap.set([...copyLines, ...finalLines], { clearProps: 'all' });
    Object.assign(state, { window: null, progress: 0 });
    live = [];
  };
}

// Full: bloom opens and turns, copy rises in. Reduced: no spatial movement (the bloom stays closed, the counter and
// the step label still follow the scroll), copy fades. Static: copy snaps to its state at each threshold.
// Two triggers, two disjoint paths: the shared callback hears the media query, the observer hears data-motion.
// Either can fire without the resolved tier changing (the query flips under a forced tier), so compare first.
let built = null;
function applyTier() {
  const tier = motionTier();
  if (tier === built) return;
  built = tier;
  mm?.revert();
  mm = gsap.matchMedia();
  mm.add('all', () => build(tier));
  ScrollTrigger.refresh();
}
applyTier();
onMotionTierChange(applyTier);
new MutationObserver(applyTier).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

// copyP / finalP are the copy timelines' own progress: 0 or 1 at rest. A scrubbed copy would read fractional.
const tlP = (i) => (live[i] ? Number(live[i].progress().toFixed(3)) : null);
awards.addState(() => ({
  motion: motionTier(),
  window: state.window,
  scrubP: Number(state.progress.toFixed(3)),
  frame: state.frame,
  builds: state.builds,
  copyP: tlP(0),
  finalP: tlP(1),
  open: Number(gsap.getProperty(bloom, '--open')) || 0,
}));
awards.ready();
