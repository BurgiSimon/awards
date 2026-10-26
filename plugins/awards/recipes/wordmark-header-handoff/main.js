import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker, clamp, lerp } from '../_shared/raf.js';

// The hero wordmark and the header logo are one link. It is laid out in the header slot (position: fixed) and drawn
// into the hero by a transform that follows the hero's reference box; as the hero leaves, the transform unwinds to
// identity. The nav underline eases both edges toward the active chapter and snaps the last 0.05 px.

syncMotionTierAttribute();
const tier = motionTier();
const mark = document.querySelector('[data-mark]');
const slot = document.querySelector('[data-slot]');
const ref = document.querySelector('[data-ref]');
const hero = document.querySelector('[data-hero]');
const copy = document.querySelector('[data-copy]');
const nav = document.querySelector('[data-nav]');
const line = document.querySelector('[data-line]');
const links = [...nav.querySelectorAll('a')];
const chapters = [...document.querySelectorAll('[data-chapter]')];
const state = { p: 0, scale: 1, active: 'intro', lineLeft: 0, lineWidth: 0, styleWrites: 0, settledFrames: 0 };

const cubicInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const HANDOFF = 0.6;        // the mark reaches the bar when the hero has scrolled 60 % of its height
const LINE_K = 10;          // underline easing, per second: 1 − e^(−10·dt)

let geo = null;
function measure() {
  // Slot and reference in document coordinates at the current scroll (the slot is fixed, so it does not move).
  const s = slot.getBoundingClientRect(), r = ref.getBoundingClientRect();
  geo = { sx: s.left, sy: s.top, sw: s.width, rx: r.left, ry: r.top + scrollY, rw: r.width, heroH: hero.offsetHeight };
  copy.style.setProperty('--big', (r.width / s.width).toFixed(4)); // the reduced-motion copy, at the mark's hero size
  // Each link's box relative to the list, for the underline targets.
  const n = nav.getBoundingClientRect();
  geo.items = links.map((a) => { const b = a.getBoundingClientRect(); return { left: b.left - n.left, width: b.width }; });
}

let lastTransform = '';
function placeMark() {
  const y = scrollY;
  const raw = clamp(y / (geo.heroH * HANDOFF), 0, 1);
  state.p = Math.round(raw * 1000) / 1000;
  let transform = 'none';
  if (tier === 'full') {
    const e = cubicInOut(raw);
    const big = geo.rw / geo.sw;
    // At the top the mark sits on the hero's reference box, scrolling with it; at the hand-off it is back in the slot.
    const tx = lerp(geo.rx - geo.sx, 0, e), ty = lerp(geo.ry - y - geo.sy, 0, e), sc = lerp(big, 1, e);
    state.scale = Math.round(sc * 1000) / 1000;
    transform = e >= 1 ? 'none' : `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${sc.toFixed(4)})`;
  } else {
    state.scale = 1;
    copy.classList.toggle('is-gone', raw > 0.5);
  }
  if (transform !== lastTransform) { mark.style.transform = transform; lastTransform = transform; state.styleWrites++; }
}

function activeChapter() {
  const mid = innerHeight * 0.5;
  let id = 'intro';
  for (const c of chapters) { const r = c.getBoundingClientRect(); if (r.top <= mid) id = c.dataset.chapter; }
  return id;
}

let left = 0, right = 0;
function placeLine(dt, snap = false) {
  const id = activeChapter();
  if (id !== state.active) {
    state.active = id;
    links.forEach((a) => (a.dataset.id === id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  }
  const t = geo.items[links.findIndex((a) => a.dataset.id === id)];
  const k = snap || tier !== 'full' ? 1 : 1 - Math.exp(-LINE_K * dt);
  const nl = lerp(left, t.left, k), nr = lerp(right, t.left + t.width, k);
  const settledL = Math.abs(nl - t.left) < 0.05, settledR = Math.abs(nr - (t.left + t.width)) < 0.05;
  const L = settledL ? t.left : nl, R = settledR ? t.left + t.width : nr;
  if (L !== left || R !== right) {
    left = L; right = R;
    line.style.transform = `translate3d(${left.toFixed(2)}px, 0, 0)`;
    line.style.width = `${(right - left).toFixed(2)}px`;
    state.styleWrites++;
    state.settledFrames = 0;
  } else state.settledFrames++;
  state.lineLeft = Math.round(left * 100) / 100; state.lineWidth = Math.round((right - left) * 100) / 100;
}

measure();
links.find((a) => a.dataset.id === 'intro').setAttribute('aria-current', 'true');
placeMark();
placeLine(0, true);
addEventListener('resize', () => { measure(); lastTransform = ''; placeMark(); placeLine(0, true); });
ticker.add((dt) => { placeMark(); placeLine(dt); });

awards.addState(() => {
  const m = mark.getBoundingClientRect(), s = slot.getBoundingClientRect(), r = ref.getBoundingClientRect();
  const act = links.find((a) => a.dataset.id === state.active).getBoundingClientRect();
  return {
    motion: tier, ...state,
    mark: { x: Math.round(m.left), y: Math.round(m.top), w: Math.round(m.width) },
    slot: { x: Math.round(s.left), y: Math.round(s.top), w: Math.round(s.width) },
    ref: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width) },
    activeLink: { x: Math.round(act.left), w: Math.round(act.width) },
    lineBox: (() => { const b = line.getBoundingClientRect(); return { x: Math.round(b.left), w: Math.round(b.width) }; })(),
    markName: mark.getAttribute('aria-label'),
    copyGone: copy.classList.contains('is-gone'),
  };
});
awards.ready();
