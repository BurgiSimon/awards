import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
syncMotionTierAttribute();

const SVG = 'http://www.w3.org/2000/svg';
// blur: starting stdDeviation as a fraction of the heading's font size, so a phone headline pools as much as a
// desktop one. amp / off: the alpha row of the threshold (alpha' = amp × alpha + off), relaxed to 1 / 0.
const GOO = { blur: 0.32, amp: 18, off: -7, duration: 1.1, stagger: 0.12, settle: 0.45, ease: 'power3.out', start: 'top 85%' };
const FADE = 0.4;   // reduced tier: opacity only

const defs = document.querySelector('[data-goo-defs]');
const root = document.documentElement;
const headings = [...document.querySelectorAll('[data-goo]')].map((el, i) => ({
  el, i, source: el.innerHTML, status: 'idle', plays: 0, lines: 0, filters: [], tl: null, split: null, st: null, clearAtEnd: null,
}));
const stats = { filtersApplied: 0, filtersRemoved: 0, fades: 0 };
let uid = 0;
let tier = motionTier();

const matrix = (amp, off) => `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${amp.toFixed(3)} ${off.toFixed(3)}`;

// One filter per line: blur → alpha threshold. The region is generous so the pooled blur is not cut square.
function makeFilter(px) {
  const id = `goo-${++uid}`;
  const f = document.createElementNS(SVG, 'filter');
  for (const [k, v] of [['id', id], ['x', '-20%'], ['y', '-60%'], ['width', '140%'], ['height', '220%'], ['color-interpolation-filters', 'sRGB']]) f.setAttribute(k, v);
  const blur = document.createElementNS(SVG, 'feGaussianBlur');
  blur.setAttribute('in', 'SourceGraphic');
  blur.setAttribute('stdDeviation', String(px));
  blur.setAttribute('result', 'pool');
  const alpha = document.createElementNS(SVG, 'feColorMatrix');
  alpha.setAttribute('in', 'pool');
  alpha.setAttribute('type', 'matrix');
  alpha.setAttribute('values', matrix(GOO.amp, GOO.off));
  f.append(blur, alpha);
  defs.append(f);
  return { id, f, blur, alpha };
}

// Take one line's filter off and delete its node: after this the line is ordinary text.
function release(h, fx) {
  if (fx.released) return;
  fx.line.style.removeProperty('filter');
  fx.f.remove();
  fx.released = true;
  stats.filtersRemoved++;
}

// Build (or rebuild, after an autoSplit re-split) the filters and the paused timeline for the current lines.
// A rebuild mid-reveal carries on from the same moment.
function arm(h, lines) {
  const time = h.tl ? h.tl.time() : 0;
  h.tl?.kill();
  h.filters.forEach((fx) => release(h, fx));
  h.filters = [];
  const px = parseFloat(getComputedStyle(h.el).fontSize) * GOO.blur;
  const tl = gsap.timeline({ paused: true, onComplete: () => finish(h) });
  lines.forEach((line, i) => {
    const fx = { ...makeFilter(px), line, released: false };
    line.style.filter = `url(#${fx.id})`;
    stats.filtersApplied++;
    h.filters.push(fx);
    const at = i * GOO.stagger;
    const t = { amp: GOO.amp, off: GOO.off };
    tl.fromTo(fx.blur, { attr: { stdDeviation: px } }, { attr: { stdDeviation: 0 }, duration: GOO.duration, ease: GOO.ease }, at)
      // The threshold relaxes in the blur's tail, so the edges soften back into antialiased type as it ends.
      .fromTo(t, { amp: GOO.amp, off: GOO.off }, { amp: 1, off: 0, duration: GOO.settle, ease: 'none', onUpdate: () => fx.alpha.setAttribute('values', matrix(t.amp, t.off)) }, at + GOO.duration - GOO.settle)
      .call(() => release(h, fx), null, at + GOO.duration);
  });
  h.tl = tl;
  h.lines = lines.length;
  if (time > 0) tl.time(time, false);
  if (h.status === 'playing') tl.play();
}

// The heading has landed: every line's filter is off, so revert the split to the authored markup.
function finish(h) {
  // Each line's own call has already taken its filter off; record that before the sweep that guards a re-split.
  h.clearAtEnd = h.filters.every((fx) => fx.released && getComputedStyle(fx.line).filter === 'none');
  h.filters.forEach((fx) => release(h, fx));
  h.filters = [];
  h.split?.revert();   // also stops autoSplit watching this heading
  h.split = null;
  h.tl = null;
  h.status = 'done';
}

function armFull(h) {
  h.status = 'armed';
  h.split = SplitText.create(h.el, {
    type: 'lines',
    linesClass: 'goo-line',
    aria: 'auto',        // the heading keeps its whole sentence as its name; the line wrappers are hidden
    autoSplit: true,     // a width change before or during the reveal re-splits and rebuilds the filters
    onSplit: (self) => arm(h, self.lines),   // nothing returned: this module owns the timeline's life
  });
  h.st = ScrollTrigger.create({
    trigger: h.el,
    start: GOO.start,
    once: true,
    onEnter: () => {
      if (h.status !== 'armed') return;
      h.status = 'playing';
      h.plays++;
      h.tl.play();
    },
  });
}

function armReduced(h) {
  h.status = 'armed';
  gsap.set(h.el, { opacity: 0 });
  h.st = ScrollTrigger.create({
    trigger: h.el,
    start: GOO.start,
    once: true,
    onEnter: () => {
      h.status = 'playing';
      h.plays++;
      stats.fades++;
      h.tl = gsap.to(h.el, { opacity: 1, duration: FADE, ease: 'power1.out', onComplete: () => { gsap.set(h.el, { clearProps: 'opacity' }); h.tl = null; h.status = 'done'; } });
    },
  });
}

// Undo whatever a tier set up on the headings that have not landed yet; landed headings stay as they are.
function teardown() {
  for (const h of headings) {
    h.st?.kill();
    h.st = null;
    if (h.status === 'done') continue;
    h.tl?.kill();
    h.tl = null;
    h.filters.forEach((fx) => release(h, fx));
    h.filters = [];
    h.split?.revert();
    h.split = null;
    gsap.set(h.el, { clearProps: 'opacity' });
    h.status = 'idle';
  }
}

function build(next) {
  tier = next;
  teardown();
  for (const h of headings) {
    if (h.status === 'done') continue;
    if (tier === 'full') armFull(h);
    else if (tier === 'reduced') armReduced(h);
    else h.status = 'done';   // static: the text is simply there
  }
  root.classList.remove('goo-wait');
}

await document.fonts.ready;   // line breaks depend on the real face
build(tier);
onMotionTierChange(build);
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

awards.addState(() => ({
  motion: motionTier(),
  tier,
  headings: headings.map((h) => ({
    id: h.el.id,
    status: h.status,
    plays: h.plays,
    lines: h.lines,
    split: !!h.split,
    matchesSource: h.el.innerHTML === h.source,
    ariaLabel: h.el.getAttribute('aria-label'),
    clearAtEnd: h.clearAtEnd,
  })),
  filtersApplied: stats.filtersApplied,
  filtersRemoved: stats.filtersRemoved,
  filtersLive: defs.children.length,
  fades: stats.fades,
}));
awards.ready();
