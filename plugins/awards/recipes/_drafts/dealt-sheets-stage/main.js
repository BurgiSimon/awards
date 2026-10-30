import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { awards } from '../../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// One sticky stage (a tall section and a sticky child, never a pin). Each featured run is a pair of sheets, a ticket
// and a print, and each sheet has its own rail through one scrubbed timeline: the ticket is dealt from the lower left
// about its top-left corner, the print from the lower right about its centre, a little later and from further away.
// The resting pair stays put until the next one is most of the way in on top of it, and only then is pulled out from
// under it sideways (print to the right, ticket to the left). The last pair does not leave: it drifts into a resting
// pose and stays there while the stage scrolls away.
// The timeline's unit is one stage height of scroll, and the script writes the section's height from the same score,
// so the two cannot drift apart and the first pair is dealt exactly while the stage scrolls into place.

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();

const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
const raf = (time) => lenis.raf(time * 1000);   // named, so an adapter can gsap.ticker.remove(raf) on unmount
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(raf);
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

const root = document.documentElement;
const section = document.querySelector('section[data-deal]');   // not '[data-deal]': the root carries data-deal too
const stage = section.querySelector('.deal__stage');
const pairs = gsap.utils.toArray('[data-pair]');
const status = document.querySelector('[data-status]');
const sheets = pairs.map((p) => ({ caption: p.querySelector('[data-caption]'), media: p.querySelector('[data-media]'), title: p.querySelector('.sheet__title').textContent, client: p.querySelector('.sheet__client').textContent }));
const sheetEls = sheets.flatMap(({ caption, media }) => [caption, media]);
const N = pairs.length;

// The score, in stage heights of scroll (the stage is 100svh).
const IN = 1;          // a pair is dealt over one stage height (the print over the last .88 of it)
const LAG = 0.12;      // the print trails the ticket by this much, in and out
const COVER = 0.7;     // the resting pair is swept only once the next pair is this far into its deal, so it lands on top
const SWEEP = 0.45;    // each sheet of the old pair is pulled out from under in this long
const CYCLE = 1.5;     // from one pair's deal to the next
const SETTLE = 0.6;    // the last pair's drift into its resting pose
const FIRST = 0.8;     // the first pair takes the stage once the stage has nearly docked
const CLEAR = COVER + LAG + SWEEP;   // after a deal starts, the pair before it is wholly off by then
const T = CYCLE * (N - 1) + IN + SETTLE;

// Rails, all functions of the layout, re-read on every refresh. Sideways travel is a share of the sheet's own width;
// vertical travel is in px from the sheet's place on the stage, so a sheet waits with its top just under the stage.
// The margin past an edge is the sheet's own: turned by θ, its far corner swings out by the other side's length × sin θ.
const MARGIN = 24;
const sin = (deg) => Math.sin((Math.abs(deg) * Math.PI) / 180);
const clearY = (el, deg) => el.offsetWidth * sin(deg) + MARGIN;    // past the top or bottom edge
const clearX = (el, deg) => el.offsetHeight * sin(deg) + MARGIN;   // past the left or right edge
const narrow = () => matchMedia('(max-width: 760px)').matches;     // a phone column has no room to come in sideways
const TURN = { caption: [-12, -10], media: [9, 8] };              // degrees: dealt in, swept out
const FROM = {
  caption: { xPercent: () => (narrow() ? -14 : -42), y: (_, el) => stage.clientHeight - el.offsetTop + clearY(el, TURN.caption[0]), rotation: TURN.caption[0] },
  media: { xPercent: () => (narrow() ? 14 : 34), y: (_, el) => stage.clientHeight - el.offsetTop + clearY(el, TURN.media[0]), rotation: TURN.media[0] },
};
// The first pair rides in on the stage itself: the stage's own scroll is its vertical travel, so its rail keeps the
// turn and the sideways offset and only 30 % of its height, and it moves on screen like the pairs after it.
const FIRST_FROM = { caption: { ...FROM.caption, y: (_, el) => el.offsetHeight * 0.3 }, media: { ...FROM.media, y: (_, el) => el.offsetHeight * 0.3 } };
const OUT = {
  caption: { xPercent: (_, el) => (-(el.offsetLeft + el.offsetWidth + clearX(el, TURN.caption[1])) / el.offsetWidth) * 100, y: (_, el) => el.offsetHeight * 0.15, rotation: TURN.caption[1] },
  media: { xPercent: (_, el) => ((stage.clientWidth - el.offsetLeft + clearX(el, TURN.media[1])) / el.offsetWidth) * 100, y: (_, el) => -el.offsetHeight * 0.08, rotation: TURN.media[1] },
};
// Every pair lands a little askew in its own way ([xPercent, degrees] for the ticket, then the print), so no two holds
// are the same frame; the last pair then drifts on into SETTLED.
const POSES = [
  { caption: [-2, -1.5], media: [1, 0.8] },
  { caption: [3, 2], media: [-1.5, -1] },
  { caption: [-3, -2.5], media: [0.5, 1.2] },
  { caption: [2, 1.5], media: [-1, -0.6] },
  { caption: [-1, -1], media: [1.5, 0.5] },
];
const rest = (i, kind) => { const [xPercent, rotation] = POSES[i % POSES.length][kind]; return { xPercent, y: 0, rotation }; };
const SETTLED = { caption: { xPercent: 3, y: () => stage.clientHeight * 0.03, rotation: -2.5 }, media: { xPercent: -2, y: 0, rotation: 1.5 } };

let tier = motionTier();
let ctx = null;
let trigger = null;
let hushUntil = 0;       // while a focused ticket brings its pair in, the link names the run itself: the status stays quiet
const state = { active: -1, announcements: 0, focusScrolls: 0 };

// Which pair holds the stage at score time t: the first once the stage has nearly docked, each later one from the
// moment it covers the pair before (when the sweep starts).
const activeAt = (t) => (t < FIRST ? -1 : Math.max(0, Math.min(N - 1, Math.floor((t - COVER) / CYCLE))));
// Where each pair rests: the middle of the window after the pair before it is gone; the last one at the end of the stage.
const restAt = (i) => (i === N - 1 ? T : i * CYCLE + (CLEAR + CYCLE) / 2);

function setActive(i) {
  if (i === state.active) return;
  pairs[state.active]?.removeAttribute('data-active');
  state.active = i;
  if (i >= 0) pairs[i].setAttribute('data-active', '');
  // Off the stage, or reached by focus: empty the region, so it never holds a stale run and the next one is new text.
  if (i < 0 || performance.now() < hushUntil) { status.textContent = ''; return; }
  status.textContent = `Run ${i + 1} of ${N}: ${sheets[i].title}, ${sheets[i].client.toLowerCase()}.`;
  state.announcements++;
}
const onUpdate = (self) => setActive(activeAt(self.progress * T));
// t = 0 when the section's top is one stage height from the top of the viewport, t = T when the stage lets go. Both
// are measured from the stage, not from innerHeight, so a phone's collapsing toolbar cannot stretch the unit.
const span = () => ({ trigger: section, start: () => `top ${stage.clientHeight}px`, end: () => `bottom ${stage.clientHeight}px`, invalidateOnRefresh: true, onUpdate, onRefresh: onUpdate });

function full() {
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { ...span(), scrub: 0.5 } });
  sheets.forEach(({ caption, media }, i) => {
    const tIn = i * CYCLE;
    const from = i === 0 ? FIRST_FROM : FROM;
    tl.fromTo(caption, from.caption, { ...rest(i, 'caption'), duration: IN }, tIn)
      .fromTo(media, from.media, { ...rest(i, 'media'), duration: IN - LAG }, tIn + LAG);
    if (i < N - 1) {
      const tOut = (i + 1) * CYCLE + COVER;   // the next pair is 70 % in, on top of this one: pull this one out from under
      tl.to(media, { ...OUT.media, duration: SWEEP }, tOut)
        .to(caption, { ...OUT.caption, duration: SWEEP }, tOut + LAG);
    } else {
      tl.to(caption, { ...SETTLED.caption, duration: SETTLE }, tIn + IN)
        .to(media, { ...SETTLED.media, duration: SETTLE }, tIn + IN);
    }
  });
  return tl.scrollTrigger;
}

// Reduced: the same score read as an index only; CSS cross-fades the active pair in place.
const reduced = () => ScrollTrigger.create(span());

function applyTier() {
  tier = motionTier();
  ctx?.revert();
  ctx = null;
  trigger = null;
  setActive(-1);
  const mode = tier === 'full' ? 'full' : tier === 'reduced' ? 'fade' : 'list';
  root.dataset.deal = mode;
  root.toggleAttribute('data-staged', mode !== 'list');
  section.style.height = mode === 'list' ? '' : `${T * 100}svh`;   // the score's length, written by the score
  if (mode !== 'list') ctx = gsap.context(() => { trigger = mode === 'full' ? full() : reduced(); });
  ScrollTrigger.refresh();
}

// Keyboard: a ticket that takes focus brings its pair to rest on the stage. The status is hushed from the focus event
// on, through the browser's own scroll-into-view and ours, because the focused link already says which run it is. Our
// scroll is set on the next frame, after the browser's, and it is immediate; the scrub is then finished at once, so the
// ring is drawn on a sheet already at rest rather than one still being dealt.
sheets.forEach(({ caption }, i) => caption.addEventListener('focus', () => {
  if (!trigger || !caption.matches(':focus-visible')) return;
  hushUntil = performance.now() + 600;
  requestAnimationFrame(() => {
    if (!trigger || document.activeElement !== caption) return;
    const y = Math.round(trigger.start + (restAt(i) / T) * (trigger.end - trigger.start));
    if (Math.abs(window.scrollY - y) < 2) return;
    lenis.scrollTo(y, { immediate: true, force: true });
    ScrollTrigger.update();
    trigger.getTween?.()?.progress(1);
    state.focusScrolls++;
  });
}));

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
  tweens: gsap.getTweensOf(sheetEls).length,
  start: trigger ? Math.round(trigger.start) : null,
  unit: trigger ? (trigger.end - trigger.start) / T : null,
  t: trigger ? round(trigger.progress * T) : null,
  rests: trigger ? sheets.map((_, i) => restAt(i)) : [],
  sheets: sheets.map(({ caption, media }) => [caption, media].map((el) => ({ xPercent: round(gsap.getProperty(el, 'xPercent')), y: round(gsap.getProperty(el, 'y')), r: round(gsap.getProperty(el, 'rotation')) }))),
}));
awards.ready();
