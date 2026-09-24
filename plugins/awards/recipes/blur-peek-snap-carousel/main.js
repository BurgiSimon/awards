import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker, clamp } from '../_shared/raf.js';

syncMotionTierAttribute();

// Peek: the visible slice of each neighbour, as a fraction of the carousel width (robbietilton: 10 % desktop, 14 % phone).
const PEEK = { wide: 0.1, narrow: 0.14, minGap: 20 };
// Snap bands by release speed (px/ms). Fast flicks get the crisp curve, slow drags and snap-backs the soft one.
const SNAP = { fast: 1.2, mid: 0.6, commit: 0.3, commitDrag: 0.15, key: 450 };
// Rubber band: over = d·(1 − 1/(x·k/d + 1)), d the carousel width. Return: critically damped, stiffness 170.
const BAND = { k: 0.55, stiffness: 170 };
const OMEGA = Math.sqrt(BAND.stiffness); // damping 2√stiffness ≈ 26.1 is critical: the return never oscillates
const DRAG_THRESHOLD = 8;                // px before a press becomes a drag (a shorter press stays a click)
const VELOCITY_WINDOW = 100;             // ms of pointer samples that set the release speed

// cubic-bezier(x1, y1, x2, y2) as a function of progress: Newton on x(t), then y(t).
function bezier(x1, y1, x2, y2) {
  const poly = (a1, a2) => [1 - 3 * a2 + 3 * a1, 3 * a2 - 6 * a1, 3 * a1];
  const [ax, bx, cx] = poly(x1, x2), [ay, by, cy] = poly(y1, y2);
  return (p) => {
    if (p <= 0 || p >= 1) return clamp(p, 0, 1);
    let t = p;
    for (let i = 0; i < 8; i++) {
      const err = ((ax * t + bx) * t + cx) * t - p;
      const slope = (3 * ax * t + 2 * bx) * t + cx;
      if (Math.abs(err) < 1e-5 || Math.abs(slope) < 1e-6) break;
      t = clamp(t - err / slope, 0, 1);
    }
    return ((ay * t + by) * t + cy) * t;
  };
}
const CURVES = { flick: bezier(0.25, 0.46, 0.45, 0.94), placed: bezier(0.32, 0.72, 0.37, 1) };

const root = document.querySelector('[data-carousel]');
const viewport = root.querySelector('[data-viewport]');
const track = root.querySelector('[data-track]');
const items = [...track.children];
const links = items.map((li) => li.querySelector('a'));
const count = root.querySelector('[data-count]');
const narrow = matchMedia('(max-width: 920px)');
const N = items.length;

const S = { index: 0, x: 0, mode: 'rest', v: 0, gap: 0, peek: 0, step: 0, x0: 0, width: 0, last: null };
let snap = null;       // { from, to, ms, elapsed, ease }
let drag = null;       // { id, startX, base, moved, samples }
let suppressClick = false;

const instant = () => motionTier() !== 'full';
const xFor = (i) => S.x0 - i * S.step;
const band = (o) => S.width * (1 - 1 / ((o * BAND.k) / S.width + 1));
const unband = (b) => (S.width / BAND.k) * (b / (S.width - b)); // inverse of band(), so grabbing mid-return does not jump
const render = () => { track.style.transform = `translate3d(${S.x.toFixed(2)}px, 0, 0)`; };

function layout() {
  S.width = viewport.clientWidth;
  const w = items[0].offsetWidth;
  S.peek = S.width * (narrow.matches ? PEEK.narrow : PEEK.wide);
  // Size the peek, not the gap: whatever the card width, exactly `peek` px of each neighbour shows.
  S.gap = Math.max(PEEK.minGap, S.width / 2 - w / 2 - S.peek);
  track.style.gap = `${S.gap}px`;
  S.step = w + S.gap;
  S.x0 = S.width / 2 - w / 2;
  if (!drag?.moved) { snap = null; S.mode = 'rest'; S.x = xFor(S.index); render(); }
}

function setActive(i) {
  S.index = i;
  items.forEach((li, k) => li.classList.toggle('is-active', k === i));
  links.forEach((a, k) => { a.tabIndex = k === i ? 0 : -1; }); // roving tabindex: one Tab stop for the whole carousel
  count.textContent = `${i + 1} of ${N}`;
}

// One ticker drives the snap tween and the spring; both read dt from it, so they run the same at 60 and 144 Hz.
function tick(dt) {
  if (S.mode === 'snap') {
    snap.elapsed += dt * 1000;
    const p = Math.min(1, snap.elapsed / snap.ms);
    S.x = snap.from + (snap.to - snap.from) * snap.ease(p);
    if (p >= 1) settle();
  } else if (S.mode === 'spring') {
    // Exact step of a critically damped spring: x(t) = (x0 + (v0 + ωx0)t)·e^(−ωt). Stable for any dt.
    const edge = xFor(S.index), d = S.x - edge, c = S.v + OMEGA * d, e = Math.exp(-OMEGA * dt);
    const nd = (d + c * dt) * e;
    S.v = (S.v - OMEGA * c * dt) * e;
    S.x = edge + nd;
    if (Math.abs(nd) < 0.5 && Math.abs(S.v) < 5) settle();
  }
  render();
  if (S.mode === 'rest' || S.mode === 'drag') ticker.remove(tick);
}

function settle() {
  S.mode = 'rest'; S.v = 0; S.x = xFor(S.index); snap = null;
  if (S.last && S.last.settledMs == null) S.last.settledMs = Math.round(performance.now() - S.last.at);
}

function snapTo(i, ms, curve, v = 0) {
  setActive(i);
  S.last = { to: i, ms: instant() ? 0 : Math.round(ms), curve, v: Number(Math.abs(v).toFixed(2)), at: performance.now(), settledMs: null };
  if (instant()) { settle(); render(); return; }
  snap = { from: S.x, to: xFor(i), ms, elapsed: 0, ease: CURVES[curve] };
  S.mode = 'snap';
  ticker.add(tick);
}

function go(i, focus = false) {
  i = clamp(i, 0, N - 1);
  if (i !== S.index || S.x !== xFor(i)) snapTo(i, SNAP.key, 'placed');
  if (focus) links[i].focus({ preventScroll: true });
}

// Release: past an end the spring takes over; otherwise the release speed picks the target, the duration and the curve.
function release(v, dx, startIndex) {
  if (S.x > xFor(0) || S.x < xFor(N - 1)) {
    const i = S.x > xFor(0) ? 0 : N - 1;
    setActive(i);
    const over = Math.abs(S.x - xFor(i));
    // Hand the pointer's speed to the spring through the band's slope at the release point.
    const slope = BAND.k / ((unband(over) * BAND.k) / S.width + 1) ** 2;
    S.last = { to: i, ms: 0, curve: 'spring', v: Number(Math.abs(v).toFixed(2)), at: performance.now(), settledMs: null };
    if (instant()) { settle(); render(); return; }
    S.v = v * 1000 * slope;
    S.mode = 'spring';
    ticker.add(tick);
    return;
  }
  const speed = Math.abs(v);
  let target = Math.round((S.x0 - S.x) / S.step);
  const dir = speed > SNAP.commit ? Math.sign(v) : Math.abs(dx) > SNAP.commitDrag * S.step ? Math.sign(dx) : 0;
  if (target === startIndex && dir) target = startIndex - dir; // dragging right (+x) moves toward the previous card
  target = clamp(target, 0, N - 1);
  const dist = clamp(Math.abs(xFor(target) - S.x) / S.step, 0, 1);
  if (target === startIndex) return snapTo(target, 350 + 200 * dist, 'placed', v);                 // snap-back 350–550 ms
  if (speed > SNAP.fast) return snapTo(target, 320, 'flick', v);                                    // flick 320 ms
  if (speed > SNAP.mid) return snapTo(target, 400 - 80 * ((speed - SNAP.mid) / (SNAP.fast - SNAP.mid)), 'flick', v); // 400 → 320 ms
  return snapTo(target, 450 + 150 * dist, 'placed', v);                                             // placed 450–600 ms
}

viewport.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 || drag) return;
  suppressClick = false;
  drag = { id: e.pointerId, startX: e.clientX, base: 0, moved: false, startIndex: S.index, samples: [[performance.now(), e.clientX]] };
});

viewport.addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.startX;
  const now = performance.now();
  drag.samples.push([now, e.clientX]);
  while (drag.samples.length > 2 && drag.samples[0][0] < now - 150) drag.samples.shift();
  if (!drag.moved) {
    if (Math.abs(dx) < DRAG_THRESHOLD) return;
    // Capture only once it is a drag, so a plain click still lands on the link under the pointer.
    drag.moved = true;
    viewport.setPointerCapture(e.pointerId);
    S.mode = 'drag'; snap = null; S.v = 0;
    const lo = xFor(N - 1), hi = xFor(0);
    const raw = S.x > hi ? hi + unband(S.x - hi) : S.x < lo ? lo - unband(lo - S.x) : S.x;
    drag.base = raw - dx;
  }
  const raw = drag.base + dx, lo = xFor(N - 1), hi = xFor(0);
  S.x = raw > hi ? hi + band(raw - hi) : raw < lo ? lo - band(lo - raw) : raw;
  render();
});

function endDrag(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const d = drag;
  drag = null;
  if (!d.moved) return;
  suppressClick = true;
  const now = performance.now();
  const recent = d.samples.filter(([t]) => t >= now - VELOCITY_WINDOW);
  const [t0, x0] = recent[0] || [now, 0], [t1, x1] = recent.at(-1) || [now, 0];
  const v = t1 - t0 > 0 ? (x1 - x0) / (t1 - t0) : 0; // px/ms; a pointer that rested before release has no speed
  release(v, e.clientX - d.startX, d.startIndex);
}
viewport.addEventListener('pointerup', endDrag);
viewport.addEventListener('pointercancel', endDrag);
track.addEventListener('dragstart', (e) => e.preventDefault());

track.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (suppressClick) { e.preventDefault(); suppressClick = false; return; }
  const i = links.indexOf(a);
  if (i >= 0 && i !== S.index) { e.preventDefault(); go(i, true); } // a peeking neighbour is chosen, not followed
}, true);

track.addEventListener('focusin', (e) => {
  const i = links.indexOf(e.target);
  if (!drag && i >= 0 && i !== S.index) go(i);
});

root.addEventListener('keydown', (e) => {
  const to = { ArrowRight: S.index + 1, ArrowLeft: S.index - 1, Home: 0, End: N - 1 }[e.key];
  if (to === undefined || !track.contains(e.target)) return;
  e.preventDefault();
  go(to, true);
});
root.querySelector('[data-prev]').addEventListener('click', () => go(S.index - 1));
root.querySelector('[data-next]').addEventListener('click', () => go(S.index + 1));

setActive(0);
layout();
addEventListener('resize', layout);
narrow.addEventListener('change', layout);

awards.addState(() => ({
  motion: motionTier(), index: S.index, count: count.textContent, mode: S.mode,
  x: Number(S.x.toFixed(1)), target: Number(xFor(S.index).toFixed(1)),
  gap: Math.round(S.gap), peek: Math.round(S.peek), width: S.width, last: S.last,
}));
awards.ready();
