import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();
const root = document.querySelector('[data-compare]');
const handle = document.querySelector('[data-compare-handle]');
const state = { split: 50, dragging: false, holding: false, keyMoves: 0, restSplit: 50 };

function setSplit(v, { announce = true } = {}) {
  state.split = Math.max(0, Math.min(100, v));
  root.style.setProperty('--split', `${state.split}%`);
  if (announce) {
    handle.setAttribute('aria-valuenow', String(Math.round(state.split)));
    handle.setAttribute('aria-valuetext', `${Math.round(state.split)}% winter`);
  }
}
const pct = (clientX) => { const r = root.getBoundingClientRect(); return ((clientX - r.left) / r.width) * 100; };

// Drag: pointer capture on the handle so the gesture survives leaving the element; cancel/blur always release.
handle.addEventListener('pointerdown', (e) => { e.preventDefault(); try { handle.setPointerCapture(e.pointerId); } catch {} state.dragging = true; root.classList.add('is-dragging'); setSplit(pct(e.clientX)); });
// Moves are read on the window while dragging, so the gesture survives the handle moving under the pointer.
window.addEventListener('pointermove', (e) => { if (state.dragging) setSplit(pct(e.clientX)); });
const release = () => { if (!state.dragging) return; state.dragging = false; root.classList.remove('is-dragging'); };
window.addEventListener('pointerup', release); window.addEventListener('pointercancel', release); window.addEventListener('blur', release);

// Hold: press anywhere on the image to peek at the other side; release returns to the resting split.
root.addEventListener('pointerdown', (e) => {
  if (e.target.closest('[data-compare-handle]')) return;
  state.holding = true; state.restSplit = state.split;
  setSplit(state.split > 50 ? 0 : 100, { announce: false });
});
const endHold = () => { if (!state.holding) return; state.holding = false; setSplit(state.restSplit); };
root.addEventListener('pointerup', endHold); root.addEventListener('pointercancel', endHold); root.addEventListener('pointerleave', endHold);

// Keyboard: the handle is a slider; arrows step 5, Shift+arrows step 20, Home / End go to the ends, Space peeks.
handle.addEventListener('keydown', (e) => {
  const step = e.shiftKey ? 20 : 5;
  const map = { ArrowLeft: -step, ArrowRight: step, ArrowDown: -step, ArrowUp: step };
  if (e.key in map) { e.preventDefault(); state.keyMoves++; setSplit(state.split + map[e.key]); }
  else if (e.key === 'Home') { e.preventDefault(); setSplit(0); }
  else if (e.key === 'End') { e.preventDefault(); setSplit(100); }
  else if (e.key === ' ') { e.preventDefault(); state.restSplit = state.split; state.holding = true; setSplit(state.split > 50 ? 0 : 100, { announce: false }); }
});
handle.addEventListener('keyup', (e) => { if (e.key === ' ') endHold(); });
handle.addEventListener('blur', endHold);

awards.addState(() => ({
  motion: motionTier(),
  split: Math.round(state.split),
  dragging: state.dragging,
  holding: state.holding,
  keyMoves: state.keyMoves,
  valueNow: handle.getAttribute('aria-valuenow'),
  clip: getComputedStyle(document.querySelector('[data-compare-b]')).clipPath,
}));
awards.ready();
