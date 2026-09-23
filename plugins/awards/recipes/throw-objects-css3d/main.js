import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

gsap.registerPlugin(Draggable, InertiaPlugin);
syncMotionTierAttribute();

const REST = { rotationX: -18, rotationY: 24 }; // resting pose that shows the extrusion
const TILT = 0.018; // degrees of tilt per px/s of velocity
const MAX_TILT = 40;

const stage = document.querySelector('[data-stage]');
const catcher = document.querySelector('[data-catcher]');
const objs = [...document.querySelectorAll('[data-obj]')];
const bodies = objs.map((el) => el.querySelector('[data-body]'));
const slots = [...document.querySelectorAll('[data-slot]')];
const status = document.querySelector('[data-status]');
const caught = new Set();
const stats = { throwFrames: 0, releasedAt: null, landedAt: null, lastPath: null };

gsap.set(bodies, REST);
const tiltTo = bodies.map((b) => ({
  x: gsap.quickTo(b, 'rotationX', { duration: 0.35, ease: 'power3.out' }),
  y: gsap.quickTo(b, 'rotationY', { duration: 0.35, ease: 'power3.out' }),
}));

const pos = (el) => ({ x: Number(gsap.getProperty(el, 'x')), y: Number(gsap.getProperty(el, 'y')) });
const round = (p) => ({ x: Math.round(p.x), y: Math.round(p.y) });

// Centre of block i at x = y = 0 (the rect includes the live translation, so remove it).
function home(i) {
  const r = objs[i].getBoundingClientRect();
  const p = pos(objs[i]);
  return { x: r.left + r.width / 2 - p.x, y: r.top + r.height / 2 - p.y };
}
// Translation that puts block i's centre on slot i's centre.
function slotOffset(i) {
  const h = home(i);
  const s = slots[i].getBoundingClientRect();
  return { x: s.left + s.width / 2 - h.x, y: s.top + s.height / 2 - h.y };
}
function inCatcher(i, p) {
  const h = home(i);
  const c = catcher.getBoundingClientRect();
  const x = h.x + p.x;
  const y = h.y + p.y;
  return x >= c.left && x <= c.right && y >= c.top && y <= c.bottom;
}

function settle(i, isCaught) {
  if (isCaught) caught.add(i); else caught.delete(i);
  objs[i].dataset.caught = String(isCaught);
  status.textContent = `${caught.size} of ${objs.length} in the tray`;
}

function tiltFromVelocity(i) {
  const vx = InertiaPlugin.getVelocity(objs[i], 'x') || 0;
  const vy = InertiaPlugin.getVelocity(objs[i], 'y') || 0;
  tiltTo[i].y(REST.rotationY + gsap.utils.clamp(-MAX_TILT, MAX_TILT, vx * TILT));
  tiltTo[i].x(REST.rotationX - gsap.utils.clamp(-MAX_TILT, MAX_TILT, vy * TILT));
}
function restTilt(i) { tiltTo[i].x(REST.rotationX); tiltTo[i].y(REST.rotationY); }

let drags = [];
function build() {
  drags.forEach((d) => d.kill());
  const full = motionTier() === 'full';
  drags = objs.map((el, i) => Draggable.create(el, {
    type: 'x,y',
    bounds: stage,
    zIndexBoost: true,
    // Full tier only: the release velocity keeps the block moving after pointerup.
    inertia: full,
    // Where a throw lands: in the tray means "go to your slot", anywhere else stays put.
    // InertiaPlugin hands over the unbounded natural end, so clamp it to the bounds before asking.
    snap: { points: (p) => {
      const d = drags[i];
      const q = { x: gsap.utils.clamp(d.minX, d.maxX, p.x), y: gsap.utils.clamp(d.minY, d.maxY, p.y) };
      return inCatcher(i, q) ? slotOffset(i) : p;
    } },
    onDragStart() { settle(i, false); },
    onDrag() { if (full) tiltFromVelocity(i); },
    onRelease() {
      stats.lastPath = 'drag';
      stats.releasedAt = pos(el);
      stats.throwFrames = 0;
      stats.landedAt = null;
      if (full) return; // the throw tween takes over; onThrowComplete settles it
      // Reduced / static: no inertia, the block lands where it is let go (or in its slot if that is the tray).
      const p = pos(el);
      const inside = inCatcher(i, p);
      if (inside) gsap.set(el, slotOffset(i));
      this.update();
      stats.landedAt = pos(el);
      settle(i, inside);
    },
    onThrowUpdate() { stats.throwFrames++; tiltFromVelocity(i); },
    onThrowComplete() {
      stats.landedAt = pos(el);
      restTilt(i);
      settle(i, inCatcher(i, pos(el)));
    },
  })[0]);
}

// Keyboard path: one button per block, same end state as a successful throw (block in its slot).
function throwToSlot(i) {
  const to = slotOffset(i);
  stats.lastPath = 'button';
  gsap.killTweensOf(objs[i]);
  if (motionTier() !== 'full') {
    gsap.set(objs[i], to);
    gsap.set(bodies[i], REST);
    drags[i].update();
    settle(i, true);
    return;
  }
  gsap.to(objs[i], { x: to.x, y: to.y, duration: 0.9, ease: 'expo.out', onComplete: () => { drags[i].update(); settle(i, true); } });
  gsap.fromTo(bodies[i], { rotationY: REST.rotationY - 200 }, { ...REST, duration: 0.9, ease: 'expo.out' });
}

function reset() {
  objs.forEach((el, i) => {
    gsap.killTweensOf(el);
    if (motionTier() === 'full') gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'expo.out', onComplete: () => drags[i].update() });
    else { gsap.set(el, { x: 0, y: 0 }); drags[i].update(); }
    settle(i, false);
  });
}

document.querySelectorAll('[data-throw]').forEach((b) => b.addEventListener('click', () => throwToSlot(Number(b.dataset.throw))));
document.querySelector('[data-reset]').addEventListener('click', reset);

// Layout changes move the slots: caught blocks follow them, loose blocks go back to the shelf.
let resizeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => objs.forEach((el, i) => {
    gsap.killTweensOf(el);
    gsap.set(el, caught.has(i) ? slotOffset(i) : { x: 0, y: 0 });
    drags[i].update();
  }), 150);
});

build();
onMotionTierChange(build);

awards.addState(() => ({
  motion: motionTier(),
  inertia: !!drags[0]?.vars.inertia,
  caught: [...caught].sort(),
  objects: objs.map((el, i) => ({ ...round(pos(el)), caught: caught.has(i) })),
  slots: objs.map((_, i) => round(slotOffset(i))),
  ...stats,
}));
awards.ready();
