import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { awards } from '../../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// A display headline split into characters that splay apart in 3D as the hero leaves. One number per character, its
// distance from the headline's centre (0 at the pivot, 1 at the end of the widest line), sets all six channels, so
// the pivot hardly moves and the ends take most of it. The scroll is the only clock: at progress 0 every transform is
// removed and the heading is plain text in its own layout again. Behind it, the fan's ribs open from a pin under the
// centre on the same clock. A second heading plays the same offsets once, open to shut, on entry. Reduced motion: no
// split, the headline dims as the hero leaves. Static: no split, no fade.

gsap.registerPlugin(ScrollTrigger, SplitText);
syncMotionTierAttribute();

// The boot every Lenis recipe follows: Lenis 1.3 has no clock of its own (autoRaf false), so GSAP's ticker drives it.
// Wheel smoothing only in the full tier: in reduced and static nothing coasts on after the hand stops.
const lenis = new Lenis({ lerp: 0.1, autoRaf: false, smoothWheel: motionTier() === 'full' });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

// Lengths are fractions of half the widest set line (or of the line height), so the fan has one shape at any width.
const SPLAY = {
  shape: 1.6,        // weight = distance ** 1.6
  spread: 0.28,      // × half width, outward along the line
  spreadNarrow: 0.1, // the same under 760 px, where the headline fills the width: a phone keeps the ends in frame
  drop: 0.8,         // × line height, the ends fall away so each line bends into an arc, like a fan's leaf
  rows: 0.35,        // × line height, by row: lower rows fall further and upper rows less, so the rows part like ribs
  depth: 0.7,        // × half width, towards the viewer
  depthNarrow: 0.5,  // the same under 760 px
  turn: 60,          // ° about Y at the ends, the faces turning outward
  tip: 36,           // ° about X at the ends, by row: rows above the middle tip back, rows below tip forward
  roll: 24,          // ° about Z at the ends, each letter leaning along its arc like a rib
  perspective: 2.6,  // × half width, set on each line (perspective-origin at the line's centre)
};
const RIBS = { open: 64, opacity: 0.7, pivot: '600 770' }; // outermost rib at ±64° when fully open; pivot in SVG units
const LEDE = { from: 0.08, to: 0.36 };                        // the lede has gone before the lowest row's ends reach it
const ENTER = { duration: 1.2, ease: 'expo.out', start: 'center bottom' }; // the source's length and trigger
const SPLIT = { type: 'lines,words,chars', linesClass: 'splay-line', wordsClass: 'splay-word', charsClass: 'splay-char', aria: 'auto', autoSplit: true };
const narrow = matchMedia('(max-width: 760px)');

const root = document.documentElement;
const hero = document.querySelector('[data-splay-hero]');
const stage = document.querySelector('[data-splay-stage]');
const title = document.querySelector('[data-splay="scroll"]');
const lede = stage.querySelector('.hero__lede');
const ribGroup = stage.querySelector('.fan__ribs');
const ribs = [...stage.querySelectorAll('.fan__rib')];
const ribAngle = (i) => RIBS.open * ((2 * i) / (ribs.length - 1) - 1);
const closer = document.querySelector('[data-splay="enter"]');

const state = { splits: 0, progress: 0, rest: true, enterDone: false, enterSplits: 0 };
let heroTargets = [];

// Read once per split, while every character is fresh and untransformed: the only layout reads in the recipe.
function splayTargets(split, el) {
  const box = el.getBoundingClientRect();
  const centre = box.left + box.width / 2;
  const rows = split.lines.map((line) => [...line.querySelectorAll('.splay-char')]);
  const rects = new Map();
  let half = 1;
  for (const row of rows) {
    for (const ch of row) rects.set(ch, ch.getBoundingClientRect());
    if (row.length) half = Math.max(half, (rects.get(row.at(-1)).right - rects.get(row[0]).left) / 2);
  }
  const lineH = split.lines.length > 1 ? split.lines[1].offsetTop - split.lines[0].offsetTop : box.height;
  const mid = (rows.length - 1) / 2;
  const [spread, depth] = narrow.matches ? [SPLAY.spreadNarrow, SPLAY.depthNarrow] : [SPLAY.spread, SPLAY.depth];
  // On the line elements SplitText made, so its revert takes the perspective away with them.
  for (const line of split.lines) line.style.perspective = `${Math.round(SPLAY.perspective * half)}px`;
  return rows.flatMap((row, r) => row.map((ch) => {
    const b = rects.get(ch);
    const dx = (b.left + b.width / 2 - centre) / half;
    const s = Math.sign(dx);
    const d = Math.min(1, Math.abs(dx));
    const v = mid ? (r - mid) / mid : 0;
    const f = d ** SPLAY.shape;
    return {
      el: ch, d, s, v,
      x: s * f * spread * half,
      y: f * (SPLAY.drop + v * SPLAY.rows) * lineH,
      z: f * depth * half,
      rotationY: s * f * SPLAY.turn,
      rotationX: -v * f * SPLAY.tip,
      rotation: s * f * SPLAY.roll,
      laid: [Number((b.left - box.left).toFixed(2)), Number((b.top - box.top).toFixed(2))],
    };
  }));
}
const channels = (targets) => ({
  x: (i) => targets[i].x, y: (i) => targets[i].y, z: (i) => targets[i].z,
  rotationY: (i) => targets[i].rotationY, rotationX: (i) => targets[i].rotationX, rotation: (i) => targets[i].rotation,
});
// At rest the characters carry no transform at all: no layer per letter, nothing left over from the scrub.
function settle(chars) {
  gsap.set(chars, { clearProps: 'transform' });
}

function full() {
  // The hero: scrubbed by the scroll across the sticky stage's travel (hero top at the viewport top → hero bottom at
  // the viewport bottom). Built inside onSplit and returned, so autoSplit kills and rebuilds it on every re-split.
  SplitText.create(title, {
    ...SPLIT,
    onSplit(self) {
      state.splits++;
      const targets = heroTargets = splayTargets(self, title);
      const chars = targets.map((t) => t.el);
      const tl = gsap.timeline({
        defaults: { ease: 'none', duration: 1 },
        scrollTrigger: {
          trigger: hero, start: 'top top', end: 'bottom bottom', scrub: true,
          onUpdate: (st) => { state.progress = st.progress; },
        },
        onUpdate() {
          const atRest = this.progress() === 0;
          if (atRest && !state.rest) settle(chars);
          state.rest = atRest;
        },
      });
      tl.to(chars, { ...channels(targets), force3D: true }, 0)
        // The ribs open on the same linear clock as the letters, so the pivot the offsets are measured from is drawn.
        .fromTo(ribs, { rotation: 0, svgOrigin: RIBS.pivot }, { rotation: ribAngle, svgOrigin: RIBS.pivot }, 0)
        .fromTo(ribGroup, { opacity: 0 }, { opacity: RIBS.opacity }, 0)
        .to(lede, { opacity: 0, duration: LEDE.to - LEDE.from }, LEDE.from);
      state.progress = tl.scrollTrigger.progress;
      if (state.progress === 0) { settle(chars); state.rest = true; }
      return tl;
    },
  });

  // The closing heading: the same offsets as a from-tween, open → shut once (the plugin's reading of the source:
  // its rotationY −270 ends edge-on, so a reveal on entry has to start from the offsets).
  SplitText.create(closer, {
    ...SPLIT,
    onSplit(self) {
      state.enterSplits++;
      if (state.enterDone) return undefined; // already shut: a re-split leaves the fresh characters where they are set
      const targets = splayTargets(self, closer);
      const chars = targets.map((t) => t.el);
      return gsap.from(chars, {
        ...channels(targets), duration: ENTER.duration, ease: ENTER.ease, force3D: true,
        scrollTrigger: { trigger: closer, start: ENTER.start, once: true },
        onComplete: () => { settle(chars); state.enterDone = true; },
      });
    },
  });
}

function reduced() {
  // No split, so the headings keep whole sentences. The hero is one screen tall here (no splay-on class) and only the
  // headline dims as it leaves: large text keeps 3:1 until it has scrolled off, and the small label and lede, which
  // need 4.5:1, are never faded.
  gsap.to(title, { opacity: 0.12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, onUpdate: (st) => { state.progress = st.progress; } } });
  gsap.from(closer, { opacity: 0, duration: 0.4, scrollTrigger: { trigger: closer, start: ENTER.start, once: true }, onComplete: () => { state.enterDone = true; } });
}

// Tiers: full, reduced and static, switched live by the media query or by data-motion on <html>.
let tier = null;
let ctx = null;
function applyTier() {
  const next = motionTier();
  if (next === tier) return;
  tier = next;
  ctx?.revert();
  heroTargets = [];
  Object.assign(state, { progress: 0, rest: true, enterDone: false });
  lenis.options.smoothWheel = tier === 'full';
  // The tall track and the sticky stage exist only while the splay is built (style.css): without the script, and in
  // the reduced and static tiers, the hero is one screen that simply scrolls away.
  root.classList.toggle('splay-on', tier === 'full');
  ctx = gsap.context(() => {
    if (tier === 'full') full();
    else if (tier === 'reduced') reduced();
    // static: the page as written, no split and no scroll effect
  });
  ScrollTrigger.refresh();
}

await document.fonts.ready; // characters are measured on the real face, never on a fallback that swaps later
applyTier();
onMotionTierChange(applyTier);
new MutationObserver(applyTier).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

const round = (n) => Number(Number(n).toFixed(2));
awards.addState(() => ({
  motion: tier,
  splits: state.splits,
  enterSplits: state.enterSplits,
  progress: Number(state.progress.toFixed(3)),
  rest: state.rest,
  enterDone: state.enterDone,
  lines: title.querySelectorAll('.splay-line').length,
  chars: title.querySelectorAll('.splay-char').length,
  triggers: ScrollTrigger.getAll().length,
  smoothWheel: lenis.options.smoothWheel,
  label: title.getAttribute('aria-label'),
  perspective: title.querySelector('.splay-line')?.style.perspective || null,
  // Per character, in reading order: its distance, side and row, the channels GSAP last wrote, and its set position.
  samples: heroTargets.filter((t) => t.el.isConnected).map((t) => ({
    d: Number(t.d.toFixed(4)), s: t.s, v: round(t.v),
    x: round(gsap.getProperty(t.el, 'x')), z: round(gsap.getProperty(t.el, 'z')),
    ry: round(gsap.getProperty(t.el, 'rotationY')), rx: round(gsap.getProperty(t.el, 'rotationX')),
    laid: t.laid,
  })),
}));
awards.ready();
