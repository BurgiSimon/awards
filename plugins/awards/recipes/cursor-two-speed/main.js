import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker, damp } from '../_shared/raf.js';

syncMotionTierAttribute();

const root = document.querySelector('[data-cursor-root]');
const dot = document.querySelector('[data-cursor-dot]');
const ring = document.querySelector('[data-cursor-ring]');
const badgeEl = document.querySelector('[data-cursor-badge]');
const fine = matchMedia('(pointer: fine) and (hover: hover)');

// Lerp factors are per 60 fps frame; damp() converts them to framerate-independent rates.
const DOT_LERP = 0.75, RING_LERP = 0.22;
const k = (lerp) => -Math.log(1 - lerp) * 60;
const target = { x: innerWidth / 2, y: innerHeight / 2 };
const pos = { dot: { x: target.x, y: target.y }, ring: { x: target.x, y: target.y } };
const state = { enabled: false, visible: false, hover: false, badge: '', maxLag: 0, ringScale: 1, dotScale: 1 };
let unsubscribe = null;

function frame(dt) {
  const d = motionTier() === 'full' ? dt : 1; // reduced motion: no lag, both snap
  pos.dot.x = damp(pos.dot.x, target.x, k(DOT_LERP), d);
  pos.dot.y = damp(pos.dot.y, target.y, k(DOT_LERP), d);
  pos.ring.x = damp(pos.ring.x, target.x, k(RING_LERP), d);
  pos.ring.y = damp(pos.ring.y, target.y, k(RING_LERP), d);
  state.maxLag = Math.max(state.maxLag, Math.hypot(pos.dot.x - pos.ring.x, pos.dot.y - pos.ring.y));
  dot.style.transform = `translate3d(${pos.dot.x}px, ${pos.dot.y}px, 0) scale(${state.dotScale})`;
  ring.style.transform = `translate3d(${pos.ring.x}px, ${pos.ring.y}px, 0) scale(${state.ringScale})`;
  badgeEl.style.transform = `translate3d(${pos.dot.x}px, ${pos.dot.y}px, 0) scale(${state.badge ? 1 : 0.8})`;
}

function setHover(el) {
  const interactive = el?.closest('a, button, [role="button"], [data-cursor], input, select, textarea, summary');
  const badge = interactive?.closest('[data-cursor]')?.dataset.cursor || '';
  state.hover = !!interactive;
  state.badge = badge;
  state.ringScale = interactive ? 1.35 : 1;
  state.dotScale = interactive ? 0.7 : 1;
  root.classList.toggle('is-hover', state.hover);
  root.classList.toggle('has-badge', !!badge);
  if (badge) badgeEl.textContent = badge;
}

function enable() {
  if (state.enabled) return;
  state.enabled = true;
  document.documentElement.classList.add('has-cursor');
  unsubscribe = ticker.add(frame);
  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerover', (e) => setHover(e.target));
  document.addEventListener('pointerleave', hide);
  document.addEventListener('pointerenter', show);
  window.addEventListener('blur', hide);
}
function disable() {
  if (!state.enabled) return;
  state.enabled = false;
  document.documentElement.classList.remove('has-cursor');
  if (unsubscribe) unsubscribe();
  window.removeEventListener('pointermove', onMove);
  hide();
}
function onMove(e) { target.x = e.clientX; target.y = e.clientY; if (!state.visible) show(); }
function show() { state.visible = true; root.classList.add('is-visible'); }
function hide() { state.visible = false; root.classList.remove('is-visible'); }

// Only for fine pointers with hover. Touch devices keep the OS behaviour; the class flip removes cursor: none.
if (fine.matches) enable();
fine.addEventListener('change', () => (fine.matches ? enable() : disable()));

awards.addState(() => ({
  motion: motionTier(),
  cursorEnabled: state.enabled,
  cursorVisible: state.visible,
  hover: state.hover,
  badge: state.badge,
  maxLag: Math.round(state.maxLag),
  ringScale: state.ringScale,
  dotScale: state.dotScale,
  finePointer: fine.matches,
}));
awards.ready();
