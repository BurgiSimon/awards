import gsap from 'gsap';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute, onMotionTierChange } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();

const slot = document.querySelector('[data-slot]');
const words = [...slot.querySelectorAll('.slot__word')];
const typeLayer = slot.querySelector('[data-type]');
const label = document.querySelector('[data-slot-label]');
const drivers = document.querySelector('[data-drivers]');
const rmNote = document.querySelector('[data-rm-note]');
const texts = words.map((w) => w.textContent);

const ROLL = 0.56, REST = 0.9;                             // timed: 900 ms rest, 560 ms roll with a small overshoot
const TYPE = 0.115, ERASE = 0.058, HOLD = 2.2, GAP = 0.4;  // typed: per character in, per character out, hold, gap
const WHEEL_MIN = 18, WHEEL_LOCK = 760;                    // wheel: ignore tiny deltas, one step per 760 ms

let driver = drivers.querySelector(':checked').value;
let idx = 0;
let loop = null;      // the running delayedCall (timed) or timeline (typed)
let lockUntil = 0;
let onScreen = true;

// The label is the accessible word: updated once per change, never announced (aria-live="off").
function show(i) { idx = i; label.textContent = texts[i]; }

// Keep whatever runs the cycle paused while the hero is off-screen.
function own(t) { loop = t; if (!onScreen) t.pause(); return t; }

// One reel: the next word up from below and the current word out the top on the same ease, so they move as
// neighbours with one shared overshoot. dir -1 reverses (wheel back). OFF clears the descenders.
// audit-ignore: X13 the overshoot is the reel settling, the one signature this recipe demonstrates
const OFF = 130;
function roll(to, dir = 1) {
  if (to === idx) return;
  gsap.fromTo(words[to], { yPercent: OFF * dir }, { yPercent: 0, duration: ROLL, ease: 'back.out(1.7)', overwrite: true });
  gsap.fromTo(words[idx], { yPercent: 0 }, { yPercent: -OFF * dir, duration: ROLL, ease: 'back.out(1.7)', overwrite: true });
  show(to);
}

function timed() {
  own(gsap.delayedCall(ROLL + REST, () => { roll((idx + 1) % texts.length); timed(); }));
}

// First paint is already a whole word: hold it, erase it, pause, type the next, repeat.
function typed() {
  const next = (idx + 1) % texts.length;
  const out = texts[idx], into = texts[next];
  const put = (s) => { typeLayer.textContent = s; };
  const tl = gsap.timeline({ onComplete: () => { show(next); typed(); } });
  let t = HOLD;
  for (let i = out.length - 1; i >= 0; i--) tl.call(put, [out.slice(0, i)], (t += ERASE));
  t += GAP;
  for (let i = 1; i <= into.length; i++) tl.call(put, [into.slice(0, i)], (t += TYPE));
  own(tl);
}

function start() {
  const tier = motionTier();
  loop?.kill();
  loop = null;
  gsap.killTweensOf(words);
  gsap.set([...words, typeLayer], { clearProps: 'all' }); // back to the CSS rest state: first word only
  typeLayer.textContent = '';
  show(0);
  drivers.hidden = tier !== 'full';
  rmNote.hidden = tier === 'full';
  slot.dataset.driver = tier === 'full' ? driver : 'static';
  if (tier !== 'full') return; // reduced and static: the first word, still
  if (driver === 'typed') {
    gsap.set(words, { visibility: 'hidden' });
    gsap.set(typeLayer, { visibility: 'visible' });
    typeLayer.textContent = texts[0];
    typed();
    return;
  }
  gsap.set(words, { yPercent: (i) => (i ? OFF : 0), visibility: 'visible' });
  if (driver === 'timed') timed();
}

// Wheel-stepped: at the top of the page the first wheel inputs step the word instead of scrolling.
// Past the last word (or back before the first) the wheel is left alone and the page scrolls.
window.addEventListener('wheel', (e) => {
  if (slot.dataset.driver !== 'wheel' || window.scrollY > 0) return;
  if (performance.now() < lockUntil) { e.preventDefault(); return; } // swallow trackpad inertia after a step
  const dir = Math.sign(e.deltaY);
  const to = idx + dir;
  if (!dir || to < 0 || to >= texts.length) return;
  e.preventDefault();
  if (Math.abs(e.deltaY) < WHEEL_MIN) return;
  lockUntil = performance.now() + WHEEL_LOCK;
  roll(to, dir);
}, { passive: false });

drivers.addEventListener('change', (e) => { driver = e.target.value; start(); });
onMotionTierChange(start);
new IntersectionObserver(([entry]) => {
  onScreen = entry.isIntersecting;
  if (loop) loop.paused(!onScreen);
}).observe(slot);

await document.fonts.ready;
start();

awards.addState(() => ({
  motion: motionTier(),
  driver: slot.dataset.driver,
  index: idx,
  word: texts[idx],
  label: label.textContent,
  words: texts,
}));
awards.ready();
