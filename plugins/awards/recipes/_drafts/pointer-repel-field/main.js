import { awards } from '../../_shared/awards-hook.js';
import { ticker } from '../../_shared/raf.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// A field of small items that a pointer pushes away, turns and lifts with a smooth falloff of radius R, each returning
// to its place on a spring. Places are read once into typed arrays (again only on resize); each frame does arithmetic
// over the cache, steps the springs at a fixed 120 Hz, and writes transforms only for items inside R or still
// settling. The shared ticker is left as soon as everything has settled. A mouse hovers; a finger parts the tray where
// it lands and drags the circle sideways, while a vertical swipe still scrolls the page (touch-action: pan-y, full tier
// only); a keyboard presses Nudge, which sends one wave out from the centre, and Escape stills everything at once.
// Reduced motion and static: a still field that leaves every touch to the page.

syncMotionTierAttribute();

const field = document.querySelector('[data-field]');
const nudgeButton = document.querySelector('[data-nudge]');
const stillNote = document.querySelector('[data-still-note]');
const all = [...field.children];
const narrow = matchMedia('(max-width: 760px)');

// One weight w = ((R − d) / R) ^ 1.6 drives the push (along the away vector), the turn and the lift. R and the push are
// counted in cells of the tray's own grid (its pitch, read on measure), so the parting covers the same few buttons on
// a 420 px tray and a 920 px one; the phone's 8 × 8 tray gets a smaller circle and gentler amplitudes.
// push < R / 1.6 keeps the order of items along any ray from the pointer.
const SHAPE = {
  wide: { radius: 3.3, push: 1.25, turn: 38, lift: 0.28 },   // radius and push in cells; a tray of more than 8 columns
  narrow: { radius: 2.7, push: 1.0, turn: 26, lift: 0.18 },  // 8 columns or fewer
  falloff: 1.6,
  edge: 0.45, // a pushed centre stays this many cells inside the tray's edge (the push is shortened along its own ray)
};
// Two springs, as the source has two curves: a near-critical one that follows the pointer (ζ ≈ 0.98, no wobble) and
// an under-damped one for the way home (ζ ≈ 0.45: past the place by about a fifth, back, and still in 1.2–1.4 s).
const FOLLOW = { k: 300, c: 34 };
const HOME = { k: 130, c: 10.3 };
const STEP = 1 / 120;     // s per spring step, whatever the display's rate
const MAX_STEPS = 24;     // at most 0.2 s of catch-up in one frame
const REST = { x: 0.05, v: 0.5, r: 0.05, vr: 0.5, s: 0.0005, vs: 0.005 }; // px, px/s, °, °/s, scale, /s: below all of these an item is at rest
// The nudge: a ring from the centre at 15.8 cells/s (900 px/s on a 57 px pitch); each item it passes is kicked outward
// at 12.5 cells/s (about half a cell of travel at the centre), spun and lifted, then springs home.
const WAVE = { speed: 15.8, kick: 12.5, spin: 320, lift: 2 };

let n = 0;                 // items laid out (a phone hides part of the markup)
let items = [];
let rx, ry, ox, oy, vx, vy, or, vr, os, vs, tx, ty, tr, ts, spin, inside, resting;
const active = new Set();  // items displaced, or with a target: the only ones the frame touches
const page = { x: 0, y: 0, w: 0, h: 0 };          // the field's page offset and size, read on measure
const geo = { pitch: 0, cols: 0, radius: 0, push: 0, turn: 0, lift: 0, edge: 0 }; // the shape in px, set on measure
const pointer = { on: false, id: null, type: null, cx: 0, cy: 0, x: 0, y: 0 };
const wave = { on: false, r: 0, next: 0, order: [], cx: 0, cy: 0, max: 0 };
const state = { frames: 0, writes: 0, lastWrites: 0, maxWrites: 0, waves: 0, stilled: 0, measures: 0, leftAt: 0, settledAt: 0, simT: 0, simLeft: 0, simSettled: 0 };
let tier = motionTier();
let visible = true;
let off = null;
let acc = 0;

// A fixed spin direction and strength per item (seeded), so the tray turns like loose buttons, not like a wheel.
const hash = (i) => { let h = Math.imul(i + 1, 2654435761) >>> 0; h = (h ^ (h >>> 15)) >>> 0; return (h % 1000) / 1000; }; // unsigned: u in [0, 1)

// The only layout reads: on start, on resize and when the copy above the field reflows.
function measure() {
  release();
  items = all.filter((el) => el.offsetParent !== null);
  n = items.length;
  const f32 = () => new Float32Array(n);
  [rx, ry, ox, oy, vx, vy, or, vr, os, vs, tx, ty, tr, ts, spin] = Array.from({ length: 15 }, f32);
  inside = new Uint8Array(n); resting = new Uint8Array(n);
  // release() has just removed every transform, so these rects are the places the grid gave (sub-pixel exact,
  // where offsetLeft would round to whole pixels).
  const r = field.getBoundingClientRect();
  Object.assign(page, { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height });
  for (let i = 0; i < n; i++) {
    const b = items[i].getBoundingClientRect();
    rx[i] = b.left - r.left + b.width / 2;
    ry[i] = b.top - r.top + b.height / 2;
    const u = hash(i);
    spin[i] = (u < 0.5 ? -1 : 1) * (0.6 + 0.8 * Math.abs(u - 0.5));
  }
  // The pitch and the column count from the first row: the shape follows the tray, not the viewport.
  let cols = 1;
  while (cols < n && Math.abs(ry[cols] - ry[0]) < 0.5) cols++;
  const pitch = cols > 1 ? rx[1] - rx[0] : page.w;
  const s = cols > 8 ? SHAPE.wide : SHAPE.narrow;
  Object.assign(geo, { pitch, cols, radius: s.radius * pitch, push: s.push * pitch, turn: s.turn, lift: s.lift, edge: SHAPE.edge * pitch });
  // The wave's order: nearest the centre first.
  wave.cx = page.w / 2; wave.cy = page.h / 2;
  wave.order = [...Array(n).keys()].map((i) => [i, Math.hypot(rx[i] - wave.cx, ry[i] - wave.cy)]).sort((a, b) => a[1] - b[1]);
  wave.max = wave.order.at(-1)?.[1] ?? 0;
  state.measures++;
  // A re-measure mid-hover or mid-drag (rotation, the breakpoint) released everything: part the tray again at once.
  if (pointer.on) { locate(); wake(); }
}

// Everything home at once: transforms removed, springs zeroed (tier change, off screen, re-measure).
function release() {
  for (const i of active) { items[i].style.transform = ''; ox[i] = oy[i] = vx[i] = vy[i] = or[i] = vr[i] = os[i] = vs[i] = 0; inside[i] = resting[i] = 0; }
  active.clear();
  wave.on = false;
  stop();
}

const live = () => tier === 'full' && visible;
function wake() { if (live() && !off) { acc = 0; off = ticker.add(frame); } }
function stop() { if (off) { off(); off = null; state.settledAt = performance.now(); state.simSettled = state.simT; } }

// Pointer → field coordinates from the cached page offset and the current scroll: no layout read per event.
function locate() {
  pointer.x = pointer.cx - (page.x - scrollX);
  pointer.y = pointer.cy - (page.y - scrollY);
}

// Targets: arithmetic over the cache for every item, writes for none. Inside R an item gets a target and joins the
// active set; an item that leaves R aims home.
function aim() {
  const { radius: R, push, turn, lift, edge } = geo;
  const R2 = R * R, hiX = page.w - edge, hiY = page.h - edge;
  for (let i = 0; i < n; i++) {
    const dx = rx[i] - pointer.x, dy = ry[i] - pointer.y, d2 = dx * dx + dy * dy;
    if (pointer.on && d2 < R2) {
      const d = Math.sqrt(d2);
      const w = ((R - d) / R) ** SHAPE.falloff;
      const ux = d > 1e-3 ? dx / d : 0, uy = d > 1e-3 ? dy / d : 0;
      // Keep the centre on the felt: near the rim the push is shortened along the same ray, never bent.
      let t = w * push;
      if (ux > 0) t = Math.min(t, (hiX - rx[i]) / ux); else if (ux < 0) t = Math.min(t, (edge - rx[i]) / ux);
      if (uy > 0) t = Math.min(t, (hiY - ry[i]) / uy); else if (uy < 0) t = Math.min(t, (edge - ry[i]) / uy);
      t = Math.max(0, t);
      const nx = ux * t, ny = uy * t, nr = spin[i] * w * turn, ns = w * lift;
      if (!inside[i] || Math.abs(nx - tx[i]) + Math.abs(ny - ty[i]) > 0.01) resting[i] = 0;
      tx[i] = nx; ty[i] = ny; tr[i] = nr; ts[i] = ns;
      inside[i] = 1;
      active.add(i);
    } else if (inside[i]) {
      tx[i] = ty[i] = tr[i] = ts[i] = 0;
      inside[i] = 0; resting[i] = 0;
    }
  }
}

// One fixed spring step for one item: semi-implicit Euler, follow spring inside R, home spring outside.
function spring(i, h) {
  const { k, c } = inside[i] ? FOLLOW : HOME;
  vx[i] += (-k * (ox[i] - tx[i]) - c * vx[i]) * h; ox[i] += vx[i] * h;
  vy[i] += (-k * (oy[i] - ty[i]) - c * vy[i]) * h; oy[i] += vy[i] * h;
  vr[i] += (-k * (or[i] - tr[i]) - c * vr[i]) * h; or[i] += vr[i] * h;
  vs[i] += (-k * (os[i] - ts[i]) - c * vs[i]) * h; os[i] += vs[i] * h;
}
function settled(i) {
  return Math.abs(ox[i] - tx[i]) < REST.x && Math.abs(oy[i] - ty[i]) < REST.x && Math.abs(vx[i]) < REST.v && Math.abs(vy[i]) < REST.v
    && Math.abs(or[i] - tr[i]) < REST.r && Math.abs(vr[i]) < REST.vr && Math.abs(os[i] - ts[i]) < REST.s && Math.abs(vs[i]) < REST.vs;
}

// The wave front moves at a fixed speed; every item it passes gets an outward kick and a spin, then springs home.
function advanceWave(h) {
  wave.r += WAVE.speed * geo.pitch * h;
  while (wave.next < wave.order.length && wave.order[wave.next][1] <= wave.r) {
    const [i, d] = wave.order[wave.next++];
    const f = 1 - 0.5 * (d / Math.max(1, wave.max));
    const ux = d > 1e-3 ? (rx[i] - wave.cx) / d : 0, uy = d > 1e-3 ? (ry[i] - wave.cy) / d : 0;
    vx[i] += ux * WAVE.kick * geo.pitch * f; vy[i] += uy * WAVE.kick * geo.pitch * f;
    vr[i] += spin[i] * WAVE.spin * f; vs[i] += WAVE.lift * f;
    resting[i] = 0;
    active.add(i);
  }
  if (wave.next >= wave.order.length) wave.on = false;
}

function frame(dt) {
  state.frames++;
  aim();
  acc += dt;
  let steps = 0;
  while (acc >= STEP && steps < MAX_STEPS) {
    if (wave.on) advanceWave(STEP);
    for (const i of active) if (!resting[i]) spring(i, STEP);
    acc -= STEP; steps++;
  }
  state.simT += steps * STEP; // the springs' own clock: stepped time, whatever the frame rate
  if (steps === MAX_STEPS) acc = 0;
  let writes = 0;
  let moving = wave.on;
  for (const i of active) {
    if (resting[i]) continue;
    if (settled(i)) {
      ox[i] = tx[i]; oy[i] = ty[i]; or[i] = tr[i]; os[i] = ts[i]; vx[i] = vy[i] = vr[i] = vs[i] = 0;
      if (!inside[i]) { items[i].style.transform = ''; active.delete(i); writes++; continue; }
      resting[i] = 1;
    } else moving = true;
    items[i].style.transform = `translate3d(${ox[i].toFixed(2)}px, ${oy[i].toFixed(2)}px, 0) rotate(${or[i].toFixed(2)}deg) scale(${(1 + os[i]).toFixed(4)})`;
    writes++;
  }
  state.writes += writes; state.lastWrites = writes; state.maxWrites = Math.max(state.maxWrites, writes);
  // Nothing moving: leave the ticker. Items resting at a target inside R keep their transform until the pointer moves.
  if (!moving) stop();
}

// Mouse and pen: hovering is enough. Touch: a finger on the field takes the pointer where it lands, a sideways drag
// moves it, a lift lets go. The live tray is touch-action: pan-y, so a vertical swipe is the browser's: it scrolls
// the page and sends pointercancel, which lets the tray go like a lift.
function take(e) { pointer.on = true; pointer.id = e.pointerId; pointer.type = e.pointerType; pointer.cx = e.clientX; pointer.cy = e.clientY; locate(); wake(); }
function leave(e) {
  if (!pointer.on || (e && e.pointerId !== pointer.id)) return;
  pointer.on = false; pointer.id = null;
  state.leftAt = performance.now(); state.simLeft = state.simT;
  wake();
}
field.addEventListener('pointerdown', (e) => {
  if (!live() || e.pointerType !== 'touch') return;
  try { field.setPointerCapture(e.pointerId); } catch { /* a synthetic or already-ended pointer has nothing to capture */ }
  take(e);
});
field.addEventListener('pointermove', (e) => {
  if (!live()) return;
  if (e.pointerType === 'touch') { if (pointer.on && e.pointerId === pointer.id) take(e); return; }
  take(e);
});
field.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') leave(e); });
field.addEventListener('pointerup', (e) => { if (e.pointerType === 'touch') leave(e); });
field.addEventListener('pointercancel', leave);
// A wheel scroll under a still mouse moves the field under the pointer: re-locate from the last client position.
addEventListener('scroll', () => { if (pointer.on) { locate(); wake(); } }, { passive: true });

function nudge() {
  if (!live()) return;
  Object.assign(wave, { on: true, r: 0, next: 0 });
  state.waves++;
  wake();
}
nudgeButton.addEventListener('click', nudge);
// Escape, anywhere, stills the tray at once: every item home, the wave stopped (the How list says so). Every motion
// here also ends on its own, within about two seconds.
addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || e.defaultPrevented || !active.size) return;
  pointer.on = false;
  release();
  state.stilled++;
});

// Tiers: only the full tier moves anything; reduced and static hold a still field, hide the nudge (hidden in the
// markup too, so a page without script never shows a button that does nothing) and hand every touch on the tray back
// to the page: only .is-live gives it touch-action: pan-y, and style.css resets that for the still tiers besides.
function applyTier() {
  tier = motionTier();
  field.classList.toggle('is-live', tier === 'full');
  nudgeButton.hidden = tier !== 'full';
  stillNote.hidden = tier === 'full';
  if (tier !== 'full') { pointer.on = false; release(); }
}
onMotionTierChange(applyTier);
new MutationObserver(applyTier).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });

// Off screen: release everything and stop; the field wakes again on the next input.
new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) { pointer.on = false; release(); } }).observe(field);
// The field's size or its place on the page changed: read the places again.
let raf = 0;
const remeasure = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
const ro = new ResizeObserver(remeasure);
ro.observe(field);
ro.observe(document.querySelector('.hero'));
narrow.addEventListener('change', remeasure);

applyTier(); // first, so the nudge is shown before the places are read
await document.fonts.ready; // the copy beside or above the field sets its place
measure();

awards.addState(() => {
  const { radius, push, turn, lift, pitch, cols, edge } = geo;
  return {
    motion: tier,
    ticking: !!off,
    frames: state.frames,
    items: n,
    active: active.size,
    displaced: items.filter((el) => el.style.transform).length,
    writes: state.writes,
    lastWrites: state.lastWrites,
    maxWrites: state.maxWrites,
    waves: state.waves,
    waveOn: wave.on,
    stilled: state.stilled,
    measures: state.measures,
    radius, push, turn, lift, pitch, cols, edge,
    waveR: wave.on ? wave.r : null,
    waveSpeed: WAVE.speed * pitch,
    pointer: pointer.on ? { x: Math.round(pointer.cx), y: Math.round(pointer.cy), type: pointer.type } : null,
    // ms from the pointer leaving to the ticker stopping (0 until both have happened, in that order)
    settleMs: state.settledAt > state.leftAt && state.leftAt ? Math.round(state.settledAt - state.leftAt) : 0,
    // the same on the springs' clock (s of stepped time), which a slow or loaded machine cannot stretch
    settleSim: state.settledAt > state.leftAt && state.leftAt ? Number((state.simSettled - state.simLeft).toFixed(3)) : 0,
    simT: Number(state.simT.toFixed(4)),
    nudgeHidden: nudgeButton.hidden,
  };
});
awards.ready();
