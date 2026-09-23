import gsap from 'gsap';
import Lenis from 'lenis';
import { ticker } from '../_shared/raf.js';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();

// One clock for both scrollers. Lenis 1.3 defaults to autoRaf: false, so a Lenis nobody ticks swallows the wheel.
const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
let inner = null; // the dialog's nested Lenis, alive only while the dialog is open
ticker.add((dt, t) => { lenis.raf(t); inner?.raf(t); });
window.lenis = lenis;

// Parameters. Sheet below 768 px; drag past DISMISS of the sheet height, or flick faster than FLICK px/ms, to close.
const sheetMq = matchMedia('(max-width: 767.98px)');
const OPEN = { dur: 0.66, ease: 'expo.out', rise: 48 };
const CLOSE = { dur: 0.42, ease: 'expo.in', drop: 32 };
const DISMISS = 0.25;
const FLICK = 0.6;

const html = document.documentElement;
const dialog = document.querySelector('[data-dialog]');
const panel = dialog.querySelector('[data-panel]');
const scrim = dialog.querySelector('[data-scrim]');
const handle = dialog.querySelector('[data-handle]');
const scroller = dialog.querySelector('[data-scroller]');
const content = dialog.querySelector('[data-content]');
const pane = dialog.querySelector('[data-pane]');
const opener = document.querySelector('[data-dialog-open]');
const state = { open: false, animating: false, closing: false, variant: '', opens: 0, closes: 0, lastOpenMs: -1, lastCloseMs: -1, closedBy: '' };
let tl = null;

function open() {
  if (state.open) return;
  const full = motionTier() === 'full';
  state.variant = sheetMq.matches ? 'sheet' : 'dialog';
  dialog.dataset.variant = state.variant;
  html.classList.add('dialog-open'); // overflow: hidden backs up the stopped Lenis for native scrolling
  lenis.stop();
  scroller.scrollTop = 0;
  dialog.showModal(); // top layer, the page behind inert, focus to [autofocus]
  state.open = true; state.opens++;
  // The nested Lenis: wheel inside the scroller eases here; data-lenis-prevent on the dialog keeps the page Lenis out,
  // and on the pane keeps this one out so the pane scrolls natively. Reduced and static tiers keep native scrolling.
  if (full) inner = new Lenis({ wrapper: scroller, content, autoRaf: false, duration: 1.2, easing: (x) => Math.min(1, 1.001 - 2 ** (-10 * x)) });

  const t0 = performance.now();
  if (!full) { gsap.set([panel, scrim], { clearProps: 'transform,opacity' }); state.lastOpenMs = 0; return; }
  state.animating = true;
  const from = state.variant === 'sheet' ? { y: panel.offsetHeight } : { y: OPEN.rise, opacity: 0 };
  tl = gsap.timeline({ onComplete: () => { state.animating = false; state.lastOpenMs = Math.round(performance.now() - t0); } })
    .fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power1.out' }, 0)
    .fromTo(panel, from, { y: 0, opacity: 1, duration: OPEN.dur, ease: OPEN.ease }, 0);
}

function close(by = 'button') {
  if (!state.open || state.closing) return;
  state.closing = true; state.closedBy = by;
  tl?.kill();
  const t0 = performance.now();
  if (motionTier() !== 'full') { state.lastCloseMs = 0; dialog.close(); return; }
  state.animating = true;
  const to = state.variant === 'sheet' ? { y: panel.offsetHeight } : { y: CLOSE.drop, opacity: 0 };
  tl = gsap.timeline({ onComplete: () => { state.lastCloseMs = Math.round(performance.now() - t0); dialog.close(); } })
    .to(panel, { ...to, duration: CLOSE.dur, ease: CLOSE.ease }, 0)
    .to(scrim, { opacity: 0, duration: CLOSE.dur, ease: 'power1.in' }, 0.05);
}

// Every way out ends here: our close(), or the browser closing the dialog itself (a second Escape with no activation).
dialog.addEventListener('close', () => {
  tl?.kill(); tl = null;
  inner?.destroy(); inner = null;
  gsap.set([panel, scrim], { clearProps: 'transform,opacity' });
  Object.assign(state, { open: false, animating: false, closing: false });
  state.closes++;
  html.classList.remove('dialog-open');
  lenis.start();
  opener.focus(); // showModal restores focus too; this makes it explicit for every path
});

// Escape arrives as `cancel`: take it over so the close animates instead of cutting.
dialog.addEventListener('cancel', (e) => { e.preventDefault(); close('escape'); });
opener.addEventListener('click', open);
dialog.querySelector('[data-dialog-close]').addEventListener('click', () => close('button'));
scrim.addEventListener('click', () => close('scrim'));

// Drag to dismiss, sheet only, from the header (the scroller keeps its own touch scrolling).
// Keyboard equivalent: Escape and the Close button.
let drag = null;
handle.addEventListener('pointerdown', (e) => {
  if (state.variant !== 'sheet' || !state.open || state.closing || e.button !== 0 || e.target.closest('button')) return;
  tl?.kill(); state.animating = false;
  drag = { id: e.pointerId, y0: e.clientY, y: 0, t: e.timeStamp, v: 0 };
  handle.setPointerCapture(e.pointerId);
});
handle.addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const y = Math.max(0, e.clientY - drag.y0);
  const dt = e.timeStamp - drag.t;
  if (dt > 0) drag.v = (y - drag.y) / dt;
  drag.y = y; drag.t = e.timeStamp;
  gsap.set(panel, { y });
  gsap.set(scrim, { opacity: 1 - y / panel.offsetHeight });
});
function release(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const { y, v, t } = drag;
  drag = null;
  const flick = e.type === 'pointerup' && e.timeStamp - t < 100 && v > FLICK; // velocity only counts if the finger was still moving
  if (e.type === 'pointerup' && (y > panel.offsetHeight * DISMISS || flick)) return close('drag');
  if (motionTier() !== 'full') return gsap.set([panel, scrim], { clearProps: 'transform,opacity' });
  gsap.to(panel, { y: 0, duration: 0.5, ease: 'expo.out' });
  gsap.to(scrim, { opacity: 1, duration: 0.3, ease: 'power1.out' });
}
handle.addEventListener('pointerup', release);
handle.addEventListener('pointercancel', release);

awards.addState(() => ({
  motion: motionTier(),
  open: state.open,
  animating: state.animating,
  variant: state.variant,
  opens: state.opens,
  closes: state.closes,
  closedBy: state.closedBy,
  lastOpenMs: state.lastOpenMs,
  lastCloseMs: state.lastCloseMs,
  nested: !!inner,
  pageLenisStopped: lenis.isStopped,
  pageScroll: Math.round(window.scrollY),
  dialogScroll: Math.round(scroller.scrollTop),
  paneScroll: Math.round(pane.scrollTop),
  focusOnOpener: document.activeElement === opener,
  focusInDialog: dialog.contains(document.activeElement),
  panelY: Math.round(Number(gsap.getProperty(panel, 'y')) || 0),
}));
awards.ready();
