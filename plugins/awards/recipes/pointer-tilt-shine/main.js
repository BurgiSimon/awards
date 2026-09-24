import gsap from 'gsap';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();

const MAX_TILT = 7;     // degrees on each axis at the card's edge
const UNLOCK_MS = 140;  // quiet period after the last scroll event before a pointer move may unlock the cards
const root = document.documentElement;
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const state = { armed: false, locked: false, active: -1, pointer: null, heldMoves: 0 };

// One quickTo per property: a live tween retargeted on every pointermove, never a new tween per event.
// The quickTo tweens are created paused and write nothing until the first retarget, so a flat card stays untouched.
const cards = [...document.querySelectorAll('[data-tilt]')].map((el) => {
  const face = el.querySelector('[data-tilt-face]');
  const shine = el.querySelector('[data-tilt-shine]');
  const shade = el.querySelector('[data-tilt-shade]');
  const q = (target, prop) => gsap.quickTo(target, prop, { duration: 0.6, ease: 'power3.out' });
  const set = { rx: q(face, 'rotationX'), ry: q(face, 'rotationY'), sx: q(shine, 'x'), sy: q(shine, 'y'), so: q(shine, 'opacity'), hx: q(shade, 'x'), hy: q(shade, 'y'), ho: q(shade, 'opacity') };
  return { el, set };
});

function aim(card, clientX, clientY) {
  // Measure the link, which never transforms, so the rotated face cannot skew its own input.
  const r = card.el.getBoundingClientRect();
  const nx = gsap.utils.clamp(-1, 1, ((clientX - r.left) / r.width) * 2 - 1);
  const ny = gsap.utils.clamp(-1, 1, ((clientY - r.top) / r.height) * 2 - 1);
  const { set } = card;
  // The face turns toward the pointer: the corner under it sinks. Top-left gives rotateY < 0 and rotateX > 0.
  set.ry(MAX_TILT * nx);
  set.rx(-MAX_TILT * ny);
  // The shine layer is twice the face and centred, so a translate of half the face puts its hot spot under the pointer.
  set.sx(nx * r.width * 0.5); set.sy(ny * r.height * 0.5); set.so(1);
  // The shade gathers on the raised side, opposite the pointer, as strong as the tilt.
  set.hx(-nx * r.width * 0.5); set.hy(-ny * r.height * 0.5); set.ho(Math.min(1, Math.hypot(nx, ny)) * 0.6);
  state.pointer = [Number(nx.toFixed(2)), Number(ny.toFixed(2))];
}

function release(card) {
  const { set } = card;
  set.rx(0); set.ry(0); set.sx(0); set.sy(0); set.so(0); set.hx(0); set.hy(0); set.ho(0);
}

function flat(card) {
  for (const f of Object.values(card.set)) { f(0); f.tween.progress(1); }
}

let quiet = true;
let lockTimer = 0;
function onScroll() {
  // A card sliding under a still pointer is not the visitor aiming at it: hold every card as it is until the scroll settles.
  state.locked = true;
  quiet = false;
  root.classList.add('is-interaction-locked');
  clearTimeout(lockTimer);
  lockTimer = setTimeout(() => { quiet = true; }, UNLOCK_MS);
}

function onMove(e) {
  if (e.pointerType !== 'mouse') return;
  if (state.locked) {
    if (!quiet) { state.heldMoves++; return; }
    // The first move after the quiet period unlocks, and is handled like any other move.
    state.locked = false;
    root.classList.remove('is-interaction-locked');
  }
  const i = cards.findIndex((c) => c.el.contains(e.target));
  if (i !== state.active && state.active >= 0) release(cards[state.active]);
  state.active = i;
  if (i < 0) { state.pointer = null; return; }
  aim(cards[i], e.clientX, e.clientY);
}

function onLeave() {
  if (state.locked || state.active < 0) return;
  release(cards[state.active]);
  state.active = -1;
  state.pointer = null;
}

function sync() {
  const on = fine.matches && motionTier() === 'full';
  if (on === state.armed) return;
  const was = state.armed;
  state.armed = on;
  const m = on ? 'addEventListener' : 'removeEventListener';
  window[m]('pointermove', onMove, { passive: true });
  window[m]('scroll', onScroll, { passive: true });
  root[m]('pointerleave', onLeave);
  if (!on) {
    clearTimeout(lockTimer);
    Object.assign(state, { locked: false, active: -1, pointer: null });
    root.classList.remove('is-interaction-locked');
    if (was) cards.forEach(flat);
  }
}

sync();
fine.addEventListener('change', sync);
onMotionTierChange(sync);

awards.addState(() => ({ motion: motionTier(), finePointer: fine.matches, ...state }));
awards.ready();
