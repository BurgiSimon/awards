import { awards } from '../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const stage = document.querySelector('[data-stage]');
const list = stage.querySelector('[data-tiles]');
const items = [...list.querySelectorAll('[data-tile]')];
const links = items.map((li) => li.querySelector('a'));
const names = links.map((a) => a.querySelector('.tile__name').textContent);
const readout = document.querySelector('[data-readout]');

// Parameters.
const COLS = 6, ROWS = 4;      // the logical sheet; COLS stays even so the column stagger meets itself across the wrap
const STAGGER = 0.5;           // odd columns sit half a row pitch lower
const DRAG_THRESHOLD = 6;      // px before a press becomes a drag; a shorter press stays a click on the link
const VELOCITY_WINDOW = 100;   // ms of pointer samples that set the release velocity
const REST_GAP = 60;           // ms: a pointer held still this long before release has no velocity
const V_MAX = 4000;            // px/s clamp on the release velocity
const DECAY = 4;               // 1/s: v(t) = v0·e^(−DECAY·t), so a flick coasts v0 / DECAY px
const V_STOP = 8;              // px/s: the coast ends below this
const WHEEL_K = 16;            // 1/s: a wheel notch eases in over ≈ 150 ms (trackpad streams look direct)
const GLIDE = 0.42;            // s: arrow, Home and focus glides, expo-out
const EDGE = 32;               // px a focused tile keeps from the stage edge

const N = items.length;
const mod = (a, n) => ((a % n) + n) % n;
// The nearest offset equivalent to zero lies `residue` away: the shortest way back round the wrap.
const residue = (v, span) => mod(v + span / 2, span) - span / 2;
const S = { ox: 0, oy: 0, vx: 0, vy: 0, drags: 0, wheelEvents: 0, glides: 0, steps: 0, release: null, coast: null, centre: 0 };
const G = { w: 0, h: 0, tw: 0, th: 0, px: 0, py: 0, sx: 1, sy: 1, x0: 0, y0: 0, hx: 0, hy: 0 };
let tier = motionTier();
let live = false;
let glide = null;              // { fx, fy, tx, ty, t } in offset px, t 0 → 1
const wheel = { x: 0, y: 0 };  // wheel delta still to be applied (full tier)
let drag = null;               // { id, x, y, ox, oy, moved, samples: [[t, x, y]] }
let pressing = false, suppressClick = false;

function measure() {
  const before = { px: G.px, py: G.py };
  G.w = stage.clientWidth; G.h = stage.clientHeight;
  G.tw = items[0].offsetWidth; G.th = items[0].offsetHeight;
  const gap = parseFloat(getComputedStyle(stage).getPropertyValue('--gap')) || 24;
  // The pitch never drops below stage / (count − 1): the sheet then spans the stage plus one tile in each axis,
  // so every tile can wrap one pitch past an edge and a hole can never open, at any stage size.
  G.px = Math.max(G.tw + gap, G.w / (COLS - 1));
  G.py = Math.max(G.th + gap, G.h / (ROWS - 1));
  G.sx = COLS * G.px; G.sy = ROWS * G.py;
  G.x0 = (G.w - G.tw) / 2; G.y0 = (G.h - G.th) / 2; // offset 0 centres the first project
  // The scroll content is one sheet plus a pitch; the stage is parked a whole-pixel pitch in on each axis, its home.
  G.hx = Math.round(G.px); G.hy = Math.round(G.py);
  list.style.width = `${Math.ceil(G.sx + G.px)}px`; list.style.height = `${Math.ceil(G.sy + G.py)}px`;
  park();
  // Offsets are kept in tiles across a resize, so the plane does not lose its place.
  if (before.px && before.py && (before.px !== G.px || before.py !== G.py)) {
    const kx = G.px / before.px, ky = G.py / before.py;
    S.ox *= kx; S.oy *= ky;
    if (glide) { glide.fx *= kx; glide.tx *= kx; glide.fy *= ky; glide.ty *= ky; }
  }
}

// The modulo wrap: every tile lives in [−pitch, span − pitch) on each axis, so the pool never drifts away from the
// stage and a tile leaving one side re-enters on the other. Nothing is created or destroyed.
function place(i, ox, oy) {
  const c = i % COLS, r = (i - c) / COLS;
  return [
    mod(c * G.px + G.x0 + ox + G.px, G.sx) - G.px,
    mod((r + (c % 2) * STAGGER) * G.py + G.y0 + oy + G.py, G.sy) - G.py,
  ];
}
// Transform writes only, no layout reads: the pool moves on the compositor. Layout coordinates are the stage's
// coordinates plus its home scroll, so every tile sits at a positive place the browser can scroll to.
function render(ox = S.ox, oy = S.oy, rest = false) {
  for (let i = 0; i < N; i++) {
    let [x, y] = place(i, ox, oy);
    x += G.hx; y += G.hy;
    if (rest) { x = Math.round(x); y = Math.round(y); }
    else { x = Math.round(x * 100) / 100; y = Math.round(y * 100) / 100; }
    items[i].style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }
}
const park = () => { stage.scrollLeft = G.hx; stage.scrollTop = G.hy; };
// What the browser scrolled the stage by since it was parked; the stage goes straight back home, before any paint.
function takeScroll() {
  const dx = stage.scrollLeft - G.hx, dy = stage.scrollTop - G.hy;
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return null;
  park();
  return [dx, dy];
}
// The offset that puts tile i fully inside the stage, EDGE px from every side, moving as little as possible.
function keepInside(i, ox, oy) {
  const [x, y] = place(i, ox, oy);
  const dx = x < EDGE ? EDGE - x : x + G.tw > G.w - EDGE ? G.w - EDGE - (x + G.tw) : 0;
  const dy = y < EDGE ? EDGE - y : y + G.th > G.h - EDGE ? G.h - EDGE - (y + G.th) : 0;
  return [ox + dx, oy + dy];
}
const base = () => (glide ? { x: glide.tx, y: glide.ty } : { x: S.ox, y: S.oy });
const moving = () => !!glide || S.vx !== 0 || S.vy !== 0 || wheel.x !== 0 || wheel.y !== 0;
const mode = () => (drag?.moved ? 'drag' : glide ? 'glide' : S.vx || S.vy ? 'inertia' : wheel.x || wheel.y ? 'wheel' : 'idle');

// At rest: name the project nearest the middle of the stage.
function settle() {
  let best = 0, d = Infinity;
  for (let i = 0; i < N; i++) {
    const [x, y] = place(i, S.ox, S.oy);
    const e = Math.hypot(x + G.tw / 2 - G.w / 2, y + G.th / 2 - G.h / 2);
    if (e < d) { d = e; best = i; }
  }
  S.centre = best;
  const text = `At the centre: ${names[best]}`;
  if (readout.textContent !== text) readout.textContent = text;
}

// One clock: the shared ticker, subscribed only while something moves.
let unsubscribe = null;
const wake = () => { if (live && !unsubscribe) unsubscribe = ticker.add(frame); };
const sleep = () => { unsubscribe?.(); unsubscribe = null; };
function frame(dt) {
  if (glide) {
    glide.t = Math.min(1, glide.t + dt / GLIDE);
    const e = glide.t === 1 ? 1 : 1 - Math.pow(2, -10 * glide.t);
    S.ox = glide.fx + (glide.tx - glide.fx) * e;
    S.oy = glide.fy + (glide.ty - glide.fy) * e;
    if (glide.t === 1) glide = null;
  }
  if (S.vx || S.vy) {
    // Exact integral of v·e^(−kt) over the frame: the coast covers the same distance at 30, 60 or 144 Hz.
    const f = Math.exp(-DECAY * dt);
    S.ox += (S.vx * (1 - f)) / DECAY; S.oy += (S.vy * (1 - f)) / DECAY;
    S.vx *= f; S.vy *= f;
    if (Math.hypot(S.vx, S.vy) < V_STOP) endCoast();
  }
  if (wheel.x || wheel.y) {
    const f = 1 - Math.exp(-WHEEL_K * dt);
    let ax = wheel.x * f, ay = wheel.y * f;
    if (Math.abs(wheel.x - ax) < 0.5 && Math.abs(wheel.y - ay) < 0.5) { ax = wheel.x; ay = wheel.y; }
    S.ox -= ax; S.oy -= ay; wheel.x -= ax; wheel.y -= ay;
  }
  const busy = moving() || !!drag;
  render(S.ox, S.oy, !busy);
  if (!busy) { settle(); sleep(); }
}
function endCoast() {
  if (S.release) S.coast = { speed: Math.round(S.release.speed), travel: Math.round(Math.hypot(S.ox - S.release.ox, S.oy - S.release.oy) * 10) / 10, expected: Math.round((S.release.speed / DECAY) * 10) / 10 };
  S.vx = S.vy = 0;
}
// Stop where it is: a press, a wheel or a tier change ends a coast or a glide in place.
function halt({ keepWheel = false } = {}) {
  glide = null; S.vx = S.vy = 0;
  if (!keepWheel) { wheel.x = wheel.y = 0; }
}
function glideTo(tx, ty) {
  S.vx = S.vy = 0; wheel.x = wheel.y = 0;
  if (tier !== 'full') { glide = null; S.ox = tx; S.oy = ty; render(S.ox, S.oy, true); settle(); return; }
  glide = { fx: S.ox, fy: S.oy, tx, ty, t: 0 };
  S.glides++;
  wake();
}

// Drag: direct manipulation in every live tier; the release velocity coasts only in the full tier.
stage.addEventListener('pointerdown', (e) => {
  if (!live || drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
  pressing = true; suppressClick = false;
  halt();
  drag = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: S.ox, oy: S.oy, moved: false, samples: [[e.timeStamp, e.clientX, e.clientY]] };
});
stage.addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.samples.push([e.timeStamp, e.clientX, e.clientY]);
  while (drag.samples.length > 2 && drag.samples[0][0] < e.timeStamp - VELOCITY_WINDOW) drag.samples.shift();
  if (!drag.moved) {
    if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    // Capture only once it is a drag, so a plain click still lands on the link under the pointer.
    drag.moved = true; S.drags++;
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('is-dragging');
  }
  S.ox = drag.ox + dx; S.oy = drag.oy + dy;
  wake();
});
function endDrag(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const d = drag;
  drag = null; pressing = false;
  stage.classList.remove('is-dragging');
  if (!d.moved) return;
  suppressClick = true;
  // Velocity from the samples of the last 100 ms; a pointer that rested before letting go throws nothing.
  const now = e.timeStamp;
  const recent = d.samples.filter(([t]) => t >= now - VELOCITY_WINDOW);
  const [t0, x0, y0] = recent[0] ?? d.samples.at(-1);
  const [t1, x1, y1] = recent.at(-1) ?? d.samples.at(-1);
  let vx = 0, vy = 0;
  if (e.type === 'pointerup' && t1 > t0 && now - t1 < REST_GAP) { vx = ((x1 - x0) / (t1 - t0)) * 1000; vy = ((y1 - y0) / (t1 - t0)) * 1000; }
  const speed = Math.hypot(vx, vy);
  if (speed > V_MAX) { vx *= V_MAX / speed; vy *= V_MAX / speed; }
  S.release = { speed: Math.hypot(vx, vy), ox: S.ox, oy: S.oy };
  S.coast = null;
  if (tier === 'full' && S.release.speed >= V_STOP) { S.vx = vx; S.vy = vy; }
  wake();
}
stage.addEventListener('pointerup', endDrag);
stage.addEventListener('pointercancel', endDrag);
// A drag that ends over a link must not follow it; links must not start the browser's own drag-and-drop.
stage.addEventListener('click', (e) => { if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; } }, true);
stage.addEventListener('dragstart', (e) => e.preventDefault());

// Wheel in both axes. Until the stage sits wholly in the window a vertical wheel scrolls the page instead, so the plane
// cannot trap a reader on the way to it; Ctrl + wheel stays the browser's zoom.
stage.addEventListener('wheel', (e) => {
  if (!live || e.ctrlKey) return;
  const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? G.h : 1;
  let dx = e.deltaX * unit, dy = e.deltaY * unit;
  if (e.shiftKey && !dx) { dx = dy; dy = 0; }
  const r = stage.getBoundingClientRect();
  const framed = (r.top >= -1 && r.bottom <= innerHeight + 1) || (r.top <= 0 && r.bottom >= innerHeight);
  if (!framed && Math.abs(dy) >= Math.abs(dx)) return;
  e.preventDefault();
  S.wheelEvents++;
  halt({ keepWheel: true });
  if (tier === 'full') { wheel.x += dx; wheel.y += dy; } else { S.ox -= dx; S.oy -= dy; }
  wake();
}, { passive: false });

// Keys. Arrows move focus to the neighbouring tile and the plane by exactly one pitch (plus the half-pitch stagger
// between columns), so the neighbour lands where the focused tile was. Home and End centre the first and last project.
stage.addEventListener('keydown', (e) => {
  if (!live || e.altKey || e.ctrlKey || e.metaKey) return;
  const i = links.indexOf(e.target);
  if (i < 0) return;
  const b = base();
  if (e.key === 'Home' || e.key === 'End') {
    // Home: the origin, where the first project is centred. End: the last project centred. Both the short way round.
    e.preventDefault(); S.steps++;
    const j = e.key === 'Home' ? 0 : N - 1;
    const [x, y] = place(j, b.x, b.y);
    const ex = e.key === 'Home' ? residue(b.x, G.sx) : x - G.x0, ey = e.key === 'Home' ? residue(b.y, G.sy) : y - G.y0;
    glideTo(b.x - ex, b.y - ey);
    links[j].focus({ preventScroll: true });
    return;
  }
  const d = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[e.key];
  if (!d) return;
  e.preventDefault(); S.steps++;
  const c = i % COLS, r = (i - c) / COLS;
  const nc = mod(c + d[0], COLS), nr = mod(r + d[1], ROWS);
  const lift = ((nc % 2) - (c % 2)) * STAGGER * G.py;
  glideTo(b.x - d[0] * G.px, b.y - d[1] * G.py - lift);
  links[nr * COLS + nc].focus({ preventScroll: true });
});

// Focus brings the tile into the window. Tab, find-in-page and a screen reader's cursor make the browser scroll the
// focused or found element into view; here that scrolls the parked stage (never the page, while the stage is on
// screen). The scroll is taken back at once and becomes a glide of the plane by the same amount, plus the EDGE margin.
// On focus the target layout is also applied in this task, so a browser that scrolls after the focus event finds the
// tile already inside; the next frame draws the glide from where the plane was, so nothing jumps.
function reveal(i, scrolled) {
  const b = base();
  const [tx, ty] = keepInside(i, b.x - (scrolled?.[0] ?? 0), b.y - (scrolled?.[1] ?? 0));
  if (Math.abs(tx - b.x) < 0.01 && Math.abs(ty - b.y) < 0.01) return;
  glideTo(tx, ty);
}
stage.addEventListener('focusin', (e) => {
  const i = links.indexOf(e.target);
  if (i < 0 || !live) return;
  const scrolled = takeScroll();
  if (pressing) return; // a press focuses the link it lands on; the drag, not a reveal, decides where the plane goes
  reveal(i, scrolled);
  if (glide) render(glide.tx, glide.ty);
});
stage.addEventListener('scroll', () => {
  if (!live) return;
  // Any other scroll of the stage (find-in-page, a script calling scrollIntoView) moves the plane by as much.
  const scrolled = takeScroll();
  if (!scrolled || pressing) return;
  const b = base();
  glideTo(b.x - scrolled[0], b.y - scrolled[1]);
}, { passive: true });

// Tiers: full (drag, inertia, eased wheel, glides), reduced (drag and keys, no inertia, instant moves), static (the
// plain grid, nothing listens). data-motion on <html> switches live.
function applyTier() {
  tier = motionTier();
  if (tier === 'static') {
    halt(); drag = null; pressing = false; sleep();
    live = false;
    stage.classList.remove('is-dragging');
    for (const li of items) li.style.transform = '';
    list.style.width = list.style.height = '';
    html.classList.remove('plane-live', 'plane-ready');
    return;
  }
  html.classList.add('plane-live');
  live = true;
  if (tier !== 'full') {
    if (glide) { S.ox = glide.tx; S.oy = glide.ty; }
    S.ox -= wheel.x; S.oy -= wheel.y;
    halt();
  }
  measure();
  render(S.ox, S.oy, !moving());
  html.classList.add('plane-ready');
  settle();
  if (moving()) wake();
}
applyTier();
onMotionTierChange(applyTier);
new MutationObserver(applyTier).observe(html, { attributes: true, attributeFilter: ['data-motion'] });
// Stage size, fonts and longer translated names all change the pitch.
new ResizeObserver(() => { if (live) { measure(); render(S.ox, S.oy, !moving()); settle(); } }).observe(stage);
new ResizeObserver(() => { if (live) { measure(); render(S.ox, S.oy, !moving()); } }).observe(items[0]);

// Verification and capture hooks.
window.__plane = { place: (i) => place(i, S.ox, S.oy) };
const r1 = (n) => Math.round(n * 10) / 10;
awards.addState(() => {
  const pos = live ? items.map((_, i) => place(i, S.ox, S.oy)) : [];
  const xs = pos.map((p) => p[0]), ys = pos.map((p) => p[1]);
  return {
    motion: tier,
    live,
    mode: mode(),
    moving: moving(),
    offset: { x: r1(S.ox), y: r1(S.oy) },
    wrapped: { x: r1(mod(S.ox, G.sx)), y: r1(mod(S.oy, G.sy)) },
    velocity: { x: r1(S.vx), y: r1(S.vy) },
    pool: items.length,
    links: stage.querySelectorAll('a[href]').length,
    pitch: { x: r1(G.px), y: r1(G.py) },
    span: { x: r1(G.sx), y: r1(G.sy) },
    tile: { w: G.tw, h: G.th },
    stage: { w: G.w, h: G.h },
    bounds: pos.length ? { minX: r1(Math.min(...xs)), maxX: r1(Math.max(...xs)), minY: r1(Math.min(...ys)), maxY: r1(Math.max(...ys)) } : null,
    focused: links.indexOf(document.activeElement),
    centre: S.centre,
    readout: readout.textContent,
    drags: S.drags,
    wheelEvents: S.wheelEvents,
    glides: S.glides,
    steps: S.steps,
    release: S.release && { speed: Math.round(S.release.speed), x: r1(S.release.ox), y: r1(S.release.oy) },
    coast: S.coast,
  };
});
awards.ready();
