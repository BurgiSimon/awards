import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import { awards } from '../../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// One element flown through the page's own picture boxes. Each slot is a box laid out by the grid (width),
// aspect-ratio (height) and border-radius (four corners); the flyer lives in the first one. Flip.fit measures the flyer
// against each next slot and returns a tween of x, y, width and height; the legs are chained into one scrubbed
// timeline whose unit is the scroll pixel, so a leg lasts exactly as long as the scroll between its two slots. Beside
// each leg run a tween of the four corners and a crossfade from one slot's scene to the next. The timeline is thrown
// away and rebuilt on every ScrollTrigger refresh (resize, load, a change in the page's height or a slot's size),
// because Flip.fit's numbers are only true for the layout they were measured in. The flight runs on wide screens only:
// below WIDE the page is one column, and a jar crossing one column would cross every line of it.

gsap.registerPlugin(ScrollTrigger, Flip);

const WIDE = '(min-width: 1024px)'; // style.css lays out the three lanes from the same width
const DWELL = 0.3;                  // of the viewport height: the scroll over which the jar rests in each slot and rides with it
const SCRUB = 0.6;                  // s of scrub catch-up on top of Lenis' own smoothing
const SETTLE = 120;                 // ms after a size change before the timeline is measured again
const FADE = [0.3, 0.7];            // the share of each leg over which the jar's scene crossfades to the next slot's
const CORNERS = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'];

// The four corners a box actually paints, as eight px numbers: the horizontal radii of the top-left, top-right,
// bottom-right and bottom-left corners, then their vertical radii. Percentages resolve against width and height, and
// when two radii on one side add up to more than that side, all of them shrink by one factor (the CSS rule): 999px
// and 50 % both mean fully round, and '999px 999px 0 0' on a tall box is a true arch.
function cornersOf(el) {
  const cs = getComputedStyle(el);
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const len = (v, base) => (v.endsWith('%') ? (parseFloat(v) / 100) * base : parseFloat(v) || 0);
  const r = CORNERS.map((p) => { const [a, b = a] = cs[p].split(' '); return [len(a, w), len(b, h)]; });
  const room = (side, sum) => (sum > 0 ? side / sum : Infinity);
  const f = Math.min(1, room(w, r[0][0] + r[1][0]), room(w, r[3][0] + r[2][0]), room(h, r[0][1] + r[3][1]), room(h, r[1][1] + r[2][1]));
  return [...r.map(([x]) => x * f), ...r.map(([, y]) => y * f)];
}
const radiusCss = (c) => `${c.slice(0, 4).map((v) => `${v}px`).join(' ')} / ${c.slice(4).map((v) => `${v}px`).join(' ')}`;

// Mounts the flight on the slots inside `scope` (an element or the document) and returns destroy(). It drives its own
// Lenis; an app that already runs one keeps its own boot and drops the six Lenis lines below.
export function mountFlipScrollPath(scope = document) {
  const doc = scope.ownerDocument || scope;
  const root = doc.documentElement;
  const flyer = scope.querySelector('[data-flyer]');
  const slots = gsap.utils.toArray(scope.querySelectorAll('[data-slot]'));
  const scenes = slots.map((s) => s.querySelector('[data-still]').dataset.scene);
  const wide = matchMedia(WIDE);

  syncMotionTierAttribute();
  const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (t) => lenis.raf(t * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis;

  let tl = null;
  const state = { builds: 0, stops: [], dwell: 0, off: null };
  const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;

  function setFlight(on, why = null) {
    root.dataset.flight = on ? 'on' : 'off';
    state.off = on ? null : why;
    if (!on) state.stops = [];
  }
  // The jar's scene as weights, one per scene name, written to the flyer as custom properties (--kiln: 0.4) that
  // style.css turns into the opacity of that scene's layers. The weights are tweened by the timeline, so a reader who
  // stops mid-leg sees a steady blend, and scrolling back plays it backwards.
  // (GSAP keeps its own cache on a tweened object, so the names are listed apart from it.)
  const names = [...new Set(scenes)];
  const mix = Object.fromEntries(names.map((name) => [name, 0]));
  const paintMix = () => { for (const name of names) flyer.style.setProperty(`--${name}`, mix[name].toFixed(3)); };
  const sceneNow = () => names.reduce((a, b) => (mix[b] > mix[a] ? b : a));

  function teardown() {
    if (!tl) return;
    tl.scrollTrigger?.kill();
    tl.kill();
    tl = null;
    gsap.set(flyer, { clearProps: 'all' }); // back to the first slot's own box before anything is measured
  }

  function build() {
    teardown();
    const tier = motionTier();
    if (tier !== 'full' || !wide.matches) return setFlight(false, tier !== 'full' ? tier : 'narrow');
    setFlight(true); // the flyer has to be displayed before Flip can measure it
    const vh = window.innerHeight;
    // stops[k]: the scroll position at which slot k's centre meets the viewport's centre.
    const stops = slots.map((s) => docTop(s) + s.offsetHeight / 2 - vh / 2);
    const gaps = stops.slice(1).map((y, i) => y - stops[i]);
    // Slots fly in document order, so each has to sit lower on the page than the one before it. A layout that puts two
    // in one row, or one above its predecessor, gets the stills instead of a leg of zero or negative length.
    if (!gaps.every((g) => g > 0)) {
      console.warn('flip-scroll-path: each slot must sit lower on the page than the one before it; showing the stills.', stops.map(Math.round));
      return setFlight(false, 'order');
    }
    const dwell = Math.max(0, Math.min(DWELL * vh, 0.45 * Math.min(...gaps)));
    state.stops = stops;
    state.dwell = dwell;
    // The corners tween as eight plain numbers on one object, written to the flyer as a single border-radius.
    const corners = cornersOf(slots[0]);
    const paint = () => { flyer.style.borderRadius = radiusCss(corners); };
    paint();
    let from = corners.slice();
    for (const name of names) mix[name] = name === scenes[0] ? 1 : 0;
    paintMix();

    // Time is scroll pixels: start = stops[0], end = stops[n−1], so a leg's share of the timeline is its share of the scroll.
    tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: slots[0], start: 'center center', endTrigger: slots[slots.length - 1], end: 'center center', scrub: SCRUB },
    });
    slots.slice(1).forEach((slot, i) => {
      const at = stops[i] - stops[0] + dwell / 2;   // leave slot i half a dwell after its centre passes
      const duration = Math.max(1, gaps[i] - dwell); // arrive in slot i+1 half a dwell before its centre does
      const to = cornersOf(slot);
      // Measured now, with the flyer at rest in slot 1, so every leg's x / y / width / height is absolute to that box.
      tl.add(Flip.fit(flyer, slot, { duration, ease: 'none', simple: true, scale: false }), at);
      tl.fromTo(corners, { endArray: from }, { endArray: to, duration, immediateRender: false, onUpdate: paint }, at);
      const [a, b] = [scenes[i], scenes[i + 1]];
      if (a !== b) tl.fromTo(mix, { [a]: 1, [b]: 0 }, { [a]: 0, [b]: 1, duration: duration * (FADE[1] - FADE[0]), ease: 'sine.inOut', immediateRender: false, onUpdate: paintMix }, at + duration * FADE[0]);
      from = to;
    });
    tl.set({}, {}, stops[stops.length - 1] - stops[0]); // the last dwell: the timeline ends on the last centre
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
  // when it ends. ScrollTrigger refreshes on resize and load; a change in the page's height or in a slot's size (fonts,
  // text zoom, late content), a change of direction, of motion tier or across the breakpoint asks for one below.
  const refresh = () => ScrollTrigger.refresh();
  ScrollTrigger.addEventListener('refreshInit', teardown);
  ScrollTrigger.addEventListener('refresh', build);

  let pending = 0;
  const sizes = new WeakMap();
  const ro = new ResizeObserver((entries) => {
    let changed = false;
    for (const { target, contentRect } of entries) {
      const size = `${Math.round(contentRect.width)}x${Math.round(contentRect.height)}`;
      if (sizes.has(target) && sizes.get(target) !== size) changed = true;
      sizes.set(target, size);
    }
    if (!changed) return;
    clearTimeout(pending);
    pending = setTimeout(refresh, SETTLE);
  });
  [doc.body, ...slots].forEach((el) => ro.observe(el));

  const mo = new MutationObserver(refresh);
  mo.observe(root, { attributes: true, attributeFilter: ['data-motion', 'dir'] });
  const offTier = onMotionTierChange(refresh);
  wide.addEventListener('change', refresh);
  window.addEventListener('load', refresh, { once: true });
  build();

  awards.addState(() => ({
    motion: motionTier(),
    wide: wide.matches,
    flight: !!tl,
    off: state.off,
    builds: state.builds,
    stops: state.stops.map((y) => Math.round(y)),
    dwell: Math.round(state.dwell),
    progress: tl ? Number(tl.scrollTrigger.progress.toFixed(4)) : null,
    docked: docked(),
    scene: tl ? sceneNow() : null,
    mix: tl ? Object.fromEntries(names.map((name) => [name, Number(mix[name].toFixed(3))])) : null,
    triggers: ScrollTrigger.getAll().length,
  }));

  // Everything mount() started, in reverse: a component that unmounts calls this.
  return function destroy() {
    ro.disconnect();
    mo.disconnect();
    clearTimeout(pending);
    offTier();
    wide.removeEventListener('change', refresh);
    window.removeEventListener('load', refresh);
    ScrollTrigger.removeEventListener('refreshInit', teardown);
    ScrollTrigger.removeEventListener('refresh', build);
    teardown();
    delete root.dataset.flight;
    gsap.ticker.remove(raf);
    lenis.destroy();
    if (window.lenis === lenis) delete window.lenis;
  };
}

export const destroy = mountFlipScrollPath();
awards.ready();
