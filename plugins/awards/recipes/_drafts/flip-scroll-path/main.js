import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import { awards } from '../../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// One element flown through the page's own picture boxes. Each slot is an empty box laid out by the grid (width),
// aspect-ratio (height) and border-radius (corner); the flyer lives in the first one. Flip.fit measures the flyer
// against each next slot and returns a tween of x, y, width and height; the legs are chained into one scrubbed
// timeline whose unit is the scroll pixel, so a leg lasts exactly as long as the scroll between its two slots, and a
// radius tween runs beside each leg. The timeline is thrown away and rebuilt on every ScrollTrigger refresh (resize,
// load, a change in the page's height), because Flip.fit's numbers are only true for the layout they were measured in.

gsap.registerPlugin(ScrollTrigger, Flip);
syncMotionTierAttribute();

const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

const root = document.documentElement;
const main = document.querySelector('main');
const flyer = document.querySelector('[data-flyer]');
const slots = gsap.utils.toArray('[data-slot]');

const DWELL = 0.3;   // of the viewport height: the scroll over which the jar rests in each slot and rides with it
const SCRUB = 0.6;   // s of scrub catch-up on top of Lenis' own smoothing

let tier = motionTier();
let tl = null;
const state = { builds: 0, stops: [], dwell: 0 };

const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;
// The slot's own corner, in px, clamped to half its shorter side (999px and 50 % both mean "fully round").
function radiusOf(slot) {
  const v = getComputedStyle(slot).borderTopLeftRadius;
  const short = Math.min(slot.offsetWidth, slot.offsetHeight);
  const px = v.endsWith('%') ? (parseFloat(v) / 100) * short : parseFloat(v) || 0;
  return Math.min(px, short / 2);
}

function teardown() {
  if (!tl) return;
  tl.scrollTrigger?.kill();
  tl.kill();
  tl = null;
  gsap.set(flyer, { clearProps: 'all' }); // back to the first slot's own box before anything is measured
}

function build() {
  teardown();
  if (tier !== 'full') { state.stops = []; return; }
  const vh = window.innerHeight;
  // stops[k]: the scroll position at which slot k's centre meets the viewport's centre.
  const stops = slots.map((s) => docTop(s) + s.offsetHeight / 2 - vh / 2);
  const gaps = stops.slice(1).map((y, i) => y - stops[i]);
  const dwell = Math.min(DWELL * vh, 0.45 * Math.min(...gaps));
  gsap.set(flyer, { borderRadius: radiusOf(slots[0]) });

  // Time is scroll pixels: start = stops[0], end = stops[n−1], so a leg's share of the timeline is its share of the scroll.
  tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: slots[0], start: 'center center', endTrigger: slots[slots.length - 1], end: 'center center', scrub: SCRUB },
  });
  slots.slice(1).forEach((slot, i) => {
    const at = stops[i] - stops[0] + dwell / 2;     // leave slot i half a dwell after its centre passes
    const duration = gaps[i] - dwell;              // arrive in slot i+1 half a dwell before its centre does
    // Measured now, with the flyer at rest in slot 1, so every leg's x / y / width / height is absolute to that box.
    tl.add(Flip.fit(flyer, slot, { duration, ease: 'none', simple: true, scale: false }), at);
    tl.to(flyer, { borderRadius: radiusOf(slot), duration }, at);
  });
  tl.set({}, {}, stops[stops.length - 1] - stops[0]); // the last dwell: the timeline ends on the last centre

  state.stops = stops;
  state.dwell = dwell;
  state.builds++;
}

// Which slot the jar is resting in (its dwell window on the timeline), or -1 in flight.
function docked() {
  if (!tl) return -1;
  const t = tl.time();
  const s = state.stops;
  const half = state.dwell / 2 + 0.5;
  for (let k = 0; k < s.length; k++) {
    const c = s[k] - s[0];
    if ((k === 0 && t <= half) || (k === s.length - 1 && t >= c - half) || Math.abs(t - c) <= half) return k;
  }
  return -1;
}

// Every refresh measures afresh: teardown when it starts (so nothing is measured with a transformed flyer), build
// when it ends. ScrollTrigger refreshes on resize and load; a change in the page's height (fonts, text zoom, content)
// asks for one through the observer below.
ScrollTrigger.addEventListener('refreshInit', teardown);
ScrollTrigger.addEventListener('refresh', build);

let lastHeight = 0;
let pending = 0;
new ResizeObserver(([entry]) => {
  const h = Math.round(entry.contentRect.height);
  if (!lastHeight) { lastHeight = h; return; }
  if (h === lastHeight) return;
  lastHeight = h;
  clearTimeout(pending);
  pending = setTimeout(() => ScrollTrigger.refresh(), 120);
}).observe(main);

function applyTier() {
  tier = motionTier();
  root.dataset.flight = tier === 'full' ? 'on' : 'off';
  if (tier === 'full') ScrollTrigger.refresh();
  else { teardown(); state.stops = []; }
}
onMotionTierChange(applyTier);
new MutationObserver(applyTier).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
applyTier();

awards.addState(() => ({
  motion: tier,
  flight: !!tl,
  builds: state.builds,
  stops: state.stops.map((y) => Math.round(y)),
  dwell: Math.round(state.dwell),
  progress: tl ? Number(tl.scrollTrigger.progress.toFixed(4)) : null,
  docked: docked(),
  radius: Number((parseFloat(getComputedStyle(flyer).borderTopLeftRadius) || 0).toFixed(1)),
  triggers: ScrollTrigger.getAll().length,
}));
awards.ready();
