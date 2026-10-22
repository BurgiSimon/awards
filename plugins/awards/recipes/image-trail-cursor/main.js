import { awards } from '../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker, clamp } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const hero = document.querySelector('[data-trail-hero]');
const layer = hero.querySelector('[data-trail]');
const protectEls = [...hero.querySelectorAll('[data-trail-protect]')];
const stills = [...hero.querySelectorAll('[data-stills] .still')];

// Parameters.
const SPACING = 80;          // px of pointer travel between pictures, measured along the path
const MAX_PER_EVENT = 4;     // a teleporting pointer (tab switch, a jump) lays at most four, then drops the rest
const ARTS = 6;              // picture designs, cycled
const IN = 0.32;             // s: scale-in, expo-out, from SCALE_FROM of the target size
const SCALE_FROM = 0.6;
const FADE_IN = 0.12;        // s: opacity 0 → 1
const LIFE = 0.5;            // s after birth before a picture starts to fade
const STAGGER = 0.06;        // s: pictures fade at least this far apart, in the order they came
const OUT = 0.45;            // s: fade out, ease-in, shrinking to .86
const SCALE_MIN = 0.8, SCALE_MAX = 1.25, V_REF = 2;   // size from smoothed speed: 0 → .8×, ≥ 2 px/ms → 1.25×
const ROT_K = 6, ROT_MAX = 8;                          // tilt: horizontal speed (px/ms) × 6°, clamped to ±8°
const SWAY = [-3, 2, -1, 3];                           // degrees added in turn after the clamp (so |tilt| ≤ 11°): a steady stroke is not a rigid belt
const VEL_TAU = 50;          // ms: time constant of the speed smoothing
const PROTECT_PAD = 12;      // px kept clear around every protected element

const fine = matchMedia('(pointer: fine) and (hover: hover)');
const pool = [...layer.querySelectorAll('[data-trail-item]')].map((el) => ({ el, alive: false, x: 0, y: 0, s: 1, rot: 0, born: 0, fadeAt: 0 }));
const POOL = pool.length;
const S = { spawns: 0, skipped: 0, recycled: 0, live: 0, maxLive: 0, log: [] };
let tier = motionTier();
let armed = false, onScreen = true;
let clock = 0, lastFade = -1, z = 0, trailing = false;
let last = null, travel = 0;
const vel = { x: 0, y: 0 };
let protects = [];
let pic = { w: 0, h: 0 };
let origin = { x: 0, y: 0 }; // the hero's top-left in page coordinates, so a move needs no layout read

// Protected areas in hero coordinates: the heading's text box (a Range, so a short last line does not protect the
// whole width) and the copy beside it, each padded.
function measure() {
  const hr = hero.getBoundingClientRect();
  origin = { x: hr.left + scrollX, y: hr.top + scrollY };
  protects = protectEls.map((el) => {
    let r = el.getBoundingClientRect();
    if (/^H[1-6]$/.test(el.tagName)) { const range = document.createRange(); range.selectNodeContents(el); r = range.getBoundingClientRect(); }
    return { l: r.left - hr.left - PROTECT_PAD, t: r.top - hr.top - PROTECT_PAD, r: r.right - hr.left + PROTECT_PAD, b: r.bottom - hr.top + PROTECT_PAD };
  });
  pic = { w: pool[0].el.offsetWidth, h: pool[0].el.offsetHeight };
}

// One clock: the shared ticker, subscribed only while a picture is alive.
let unsubscribe = null;
const wake = () => { if (!unsubscribe) unsubscribe = ticker.add(frame); };
const sleep = () => { unsubscribe?.(); unsubscribe = null; };
function hide(it) { it.alive = false; it.el.style.visibility = 'hidden'; it.el.style.opacity = '0'; }
function frame(dt) {
  clock += dt;
  let live = 0;
  for (const it of pool) {
    if (!it.alive) continue;
    if (clock >= it.fadeAt + OUT) { hide(it); continue; } // back to the pool
    const age = clock - it.born;
    const p = clamp(age / IN, 0, 1);
    let scale = it.s * (SCALE_FROM + (1 - SCALE_FROM) * (p === 1 ? 1 : 1 - Math.pow(2, -10 * p)));
    let opacity = clamp(age / FADE_IN, 0, 1);
    if (clock > it.fadeAt) {
      const q = clamp((clock - it.fadeAt) / OUT, 0, 1), e = q * q;
      opacity *= 1 - e; scale *= 1 - 0.14 * e;
    }
    it.el.style.opacity = opacity.toFixed(3);
    it.el.style.transform = `translate3d(${it.x.toFixed(1)}px, ${it.y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${it.rot.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
    live++;
  }
  S.live = live;
  if (!live) { setTrailing(false); sleep(); }
}
// The stills step aside while any picture is alive (CSS fades them), and come back once the last has gone.
function setTrailing(on) { if (trailing !== on) { trailing = on; hero.classList.toggle('is-trailing', on); } }

function spawn(x, y) {
  const speed = Math.hypot(vel.x, vel.y);
  const s = SCALE_MIN + (SCALE_MAX - SCALE_MIN) * clamp(speed / V_REF, 0, 1);
  const rot = clamp(vel.x * ROT_K, -ROT_MAX, ROT_MAX) + SWAY[S.spawns % SWAY.length];
  // The picture's box at full size, widened for the tilt: if it would touch a protected area, skip this mark.
  const hw = (pic.w * s) / 2 + 8, hh = (pic.h * s) / 2 + 8;
  if (protects.some((p) => x + hw > p.l && x - hw < p.r && y + hh > p.t && y - hh < p.b)) { S.skipped++; return; }
  const slot = S.spawns % POOL;
  const it = pool[slot];
  if (it.alive) S.recycled++;
  Object.assign(it, { alive: true, x, y, s, rot, born: clock });
  // Fade in the order of arrival, at least STAGGER apart, so a burst dissolves from its tail.
  it.fadeAt = Math.max(clock + LIFE, lastFade + STAGGER);
  lastFade = it.fadeAt;
  it.el.dataset.art = String(S.spawns % ARTS);
  it.el.style.zIndex = String(++z);
  it.el.style.visibility = 'visible';
  it.el.style.opacity = '0';
  it.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${rot.toFixed(2)}deg) scale(${(s * SCALE_FROM).toFixed(4)})`;
  S.spawns++;
  S.log.push({ x: Math.round(x), y: Math.round(y), s: Math.round(s * 1000) / 1000, rot: Math.round(rot * 100) / 100, slot, born: Math.round(clock * 1000), fadeAt: Math.round(it.fadeAt * 1000) });
  if (S.log.length > 48) S.log.shift();
  S.live = pool.filter((p) => p.alive).length;
  S.maxLive = Math.max(S.maxLive, S.live);
  setTrailing(true);
  wake();
}

// Distance, not time: travel accumulates along the path and a picture lands at every SPACING mark, placed on the
// segment between pointer events, so a fast hand and a slow one leave the same density.
function onMove(e) {
  if (e.pointerType === 'touch') return; // a hybrid device's finger never draws a trail
  const x = e.pageX - origin.x, y = e.pageY - origin.y;
  if (!last) { last = { x, y, t: e.timeStamp }; return; }
  const dx = x - last.x, dy = y - last.y, d = Math.hypot(dx, dy), dt = Math.max(1, e.timeStamp - last.t);
  const k = 1 - Math.exp(-dt / VEL_TAU);
  vel.x += (dx / dt - vel.x) * k; vel.y += (dy / dt - vel.y) * k;
  last = { x, y, t: e.timeStamp };
  if (!d) return;
  travel += d;
  let n = 0;
  while (travel >= SPACING && n < MAX_PER_EVENT) {
    travel -= SPACING;
    const back = travel / d; // the mark lies `travel` px behind the current point on this segment
    spawn(x - dx * back, y - dy * back);
    n++;
  }
  if (travel >= SPACING) travel %= SPACING;
}
function onLeave() { last = null; travel = 0; vel.x = vel.y = 0; }

function releaseAll() { for (const it of pool) hide(it); S.live = 0; setTrailing(false); sleep(); onLeave(); }

// Armed only for a fine pointer with hover, in the full tier, while the hero is on screen.
function sync() {
  tier = motionTier();
  const on = fine.matches && tier === 'full' && onScreen;
  if (on && !armed) {
    measure();
    hero.addEventListener('pointermove', onMove, { passive: true });
    hero.addEventListener('pointerleave', onLeave);
    armed = true;
  } else if (!on && armed) {
    hero.removeEventListener('pointermove', onMove);
    hero.removeEventListener('pointerleave', onLeave);
    armed = false;
    releaseAll();
  }
}
sync();
fine.addEventListener('change', sync);
onMotionTierChange(sync);
new MutationObserver(sync).observe(html, { attributes: true, attributeFilter: ['data-motion'] });
new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); }).observe(hero);
new ResizeObserver(() => { if (armed) measure(); }).observe(hero);
document.fonts?.ready.then(() => { if (armed) measure(); });

awards.addState(() => {
  const shown = stills.filter((el) => el.getBoundingClientRect().width > 0).length;
  return {
    motion: tier,
    finePointer: fine.matches,
    armed,
    paused: fine.matches && tier === 'full' && !onScreen,
    onScreen,
    ticking: !!unsubscribe,
    pool: POOL,
    domItems: layer.children.length,
    live: pool.filter((p) => p.alive).length,
    maxLive: S.maxLive,
    spawns: S.spawns,
    skipped: S.skipped,
    recycled: S.recycled,
    spacing: SPACING,
    pic,
    protect: protects.map((p) => ({ l: Math.round(p.l), t: Math.round(p.t), r: Math.round(p.r), b: Math.round(p.b) })),
    log: S.log,
    stills: shown,
    trailing,
    stillsOpacity: Number(getComputedStyle(stills[0].parentElement).opacity),
    focused: document.activeElement?.className || document.activeElement?.tagName,
  };
});
awards.ready();
