import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { awards } from '../../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// One sticky stage (a tall section and a sticky child, never a pin). Each featured run is a pair of sheets, a ticket
// and a print, and each sheet has its own rail through one scrubbed timeline: the ticket is dealt from the lower left
// about its top-left corner, the print from the lower right about its centre, a little later and from further away.
// As the next pair lands the previous one is swept up and off (print first, ticket after). The last pair does not
// leave: it drifts into a resting pose and stays there while the stage scrolls away.
// The timeline's unit is one viewport of scroll; the section's CSS height is the same sum, so the first pair is dealt
// exactly while the stage scrolls into place.

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();

const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

const root = document.documentElement;
const section = document.querySelector('[data-deal]');
const pairs = gsap.utils.toArray('[data-pair]');
const status = document.querySelector('[data-status]');
const sheets = pairs.map((p) => ({ caption: p.querySelector('[data-caption]'), media: p.querySelector('[data-media]'), title: p.querySelector('.sheet__title').textContent, client: p.querySelector('.sheet__client').textContent }));
const N = pairs.length;

// The score, in viewports of scroll. Keep in step with `.deal { height }` in style.css: (n − 1) × 140svh + 160svh.
const IN = 1;          // a pair is dealt over one viewport
const HOLD = 0.4;      // and rests for 0.4 before the next one starts
const CYCLE = IN + HOLD;
const LAG = 0.12;      // the second sheet of a pair trails the first by this much
const SETTLE = 0.6;    // the last pair's drift into its resting pose
const T = CYCLE * (N - 1) + IN + SETTLE;

// Two rails per pair: opposite sides, different turns, and different distances. Sideways travel is a share of the
// sheet's own width. Vertically a sheet waits with its top just under the stage and leaves with its bottom just over
// it, so each starts entering the frame the moment its rail starts and the tall print, set higher, travels further
// than the ticket. Functions of the layout, re-read on every refresh.
const GAP = 0.08;   // of the viewport: the margin past the stage's edge, enough to hide a turned corner
const below = (i, el) => window.innerHeight * (1 + GAP) - el.offsetTop;
const above = (i, el) => -(el.offsetTop + el.offsetHeight + window.innerHeight * GAP);
const FROM = { caption: { xPercent: -42, y: below, rotation: -9 }, media: { xPercent: 34, y: below, rotation: 7 } };
const OUT = { caption: { xPercent: -20, y: above, rotation: -5 }, media: { xPercent: 22, y: above, rotation: 6 } };
const REST = { caption: { xPercent: 3, y: () => window.innerHeight * 0.03, rotation: -2.5 }, media: { xPercent: -2, y: 0, rotation: 1.5 } };
const ZERO = { xPercent: 0, y: 0, rotation: 0 };

let tier = motionTier();
let ctx = null;
let trigger = null;
const state = { active: -1, announcements: 0, focusScrolls: 0 };

// Which pair holds the stage at score time t: none until the first is half dealt, then each from halfway through its deal.
const activeAt = (t) => (t < IN / 2 ? -1 : Math.min(N - 1, Math.floor((t - IN / 2) / CYCLE)));
// Where each pair rests: the middle of its hold; the last one at the end of the stage.
const restAt = (i) => (i === N - 1 ? T : i * CYCLE + IN + HOLD / 2);

function setActive(i) {
  if (i === state.active) return;
  pairs[state.active]?.removeAttribute('data-active');
  state.active = i;
  if (i < 0) return;
  pairs[i].setAttribute('data-active', '');
  status.textContent = `Run ${i + 1} of ${N}: ${sheets[i].title}, ${sheets[i].client.toLowerCase()}.`;
  state.announcements++;
}
const onUpdate = (self) => setActive(activeAt(self.progress * T));

function full() {
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true, onUpdate, onRefresh: onUpdate },
  });
  sheets.forEach(({ caption, media }, i) => {
    const tIn = i * CYCLE;
    tl.fromTo(caption, FROM.caption, { ...ZERO, duration: IN }, tIn)
      .fromTo(media, FROM.media, { ...ZERO, duration: IN - LAG }, tIn + LAG);
    if (i < N - 1) {
      const tOut = (i + 1) * CYCLE;           // swept off while the next pair is dealt over it
      tl.to(media, { ...OUT.media, duration: IN - LAG }, tOut)
        .to(caption, { ...OUT.caption, duration: IN - LAG }, tOut + LAG);
    } else {
      tl.to(caption, { ...REST.caption, duration: SETTLE }, tIn + IN)
        .to(media, { ...REST.media, duration: SETTLE }, tIn + IN);
    }
  });
  return tl.scrollTrigger;
}

// Reduced: the same score read as an index only; CSS cross-fades the active pair in place.
const reduced = () => ScrollTrigger.create({ trigger: section, start: 'top bottom', end: 'bottom bottom', onUpdate, onRefresh: onUpdate });

function applyTier() {
  tier = motionTier();
  ctx?.revert();
  trigger = null;
  setActive(-1);
  const mode = tier === 'full' ? 'full' : tier === 'reduced' ? 'fade' : 'list';
  root.dataset.deal = mode;
  root.toggleAttribute('data-staged', mode !== 'list');
  if (mode !== 'list') ctx = gsap.context(() => { trigger = mode === 'full' ? full() : reduced(); });
  ScrollTrigger.refresh();
}

// Keyboard: a ticket that takes focus brings its pair to rest on the stage. The scroll is set on the next frame, after
// the browser's own scroll-into-view, and it is immediate: in the full tier the scrub deals the sheets on the way.
sheets.forEach(({ caption }, i) => caption.addEventListener('focus', () => requestAnimationFrame(() => {
  if (!trigger || !caption.matches(':focus-visible')) return;
  const y = trigger.start + (restAt(i) / T) * (trigger.end - trigger.start);
  if (Math.abs(window.scrollY - y) < 2) return;
  lenis.scrollTo(Math.round(y), { immediate: true, force: true });
  state.focusScrolls++;
})));

onMotionTierChange(applyTier);
new MutationObserver(applyTier).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
applyTier();

const round = (v) => Math.round(Number(v) * 100) / 100;
awards.addState(() => ({
  motion: tier,
  mode: root.dataset.deal,
  n: N,
  T,
  active: state.active,
  activeTitle: sheets[state.active]?.title ?? null,
  status: status.textContent,
  announcements: state.announcements,
  focusScrolls: state.focusScrolls,
  start: trigger ? Math.round(trigger.start) : null,
  unit: trigger ? (trigger.end - trigger.start) / T : null,
  t: trigger ? round(trigger.progress * T) : null,
  rests: trigger ? sheets.map((_, i) => restAt(i)) : [],
  sheets: sheets.map(({ caption, media }) => [caption, media].map((el) => ({ xPercent: round(gsap.getProperty(el, 'xPercent')), y: round(gsap.getProperty(el, 'y')), r: round(gsap.getProperty(el, 'rotation')) }))),
}));
awards.ready();
