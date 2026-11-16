import { awards } from '../_shared/awards-hook.js';
import { ticker } from '../_shared/raf.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import sky from './sky.js';
import lawn from './lawn.js';
import pond from './pond.js';

// A living scene at the foot of the page: one 2D canvas, one harness, interchangeable scenes.
// The harness owns what every scene needs and nothing a scene decides:
//   size       the backing store follows the box at min(dpr, 2); the scene reseeds from hashes on every resize
//   clock      the shared ticker, subscribed only while the scene is on screen and the motion tier is full
//   input      pointermove from a mouse or a pen (a finger only scrolls), click for the one thing a click leaves
//   stillness  reduced and static draw one settled frame, and one more per input, with no loop
//   keyboard   the cue button performs the scene's click at a spot the scene names
// A scene is a factory: (env) => { cue, resize(W, H), frame(dt, now), point(p), click(p, now), spot(), state() }.

const SCENES = { sky, lawn, pond };
const DPR_CAP = 2;

syncMotionTierAttribute();
const host = document.querySelector('.scene');
const canvas = host.querySelector('canvas');
const g = canvas.getContext('2d');
const cue = document.querySelector('[data-cue]');
const status = document.querySelector('[data-status]');
const picks = [...document.querySelectorAll('[data-pick]')];
const probe = document.querySelector('.scene-probe');
const state = { scene: '', running: false, frames: 0 };
let scene = null;
let W = 0, H = 0;
let off = null;        // the ticker subscription, while the loop runs
let visible = false;
let again = 0;         // a pending still redraw (a held constellation letting go)

const still = () => motionTier() !== 'full';

// Tokens → canvas paints. A custom property resolves through the probe (so color-mix() arrives as one colour), and the
// canvas itself normalises it, which also proves it parsed.
function paint(name) {
  probe.style.color = `var(${name})`;
  g.fillStyle = getComputedStyle(probe).color;
  return g.fillStyle;
}
const paints = () => ({ ink: paint('--ink'), muted: paint('--muted'), line: paint('--line'), ground: paint('--ground'), tints: [paint('--scene-1'), paint('--scene-2'), paint('--scene-3')] });

function size() {
  const dpr = Math.min(devicePixelRatio || 1, DPR_CAP);
  W = host.clientWidth; H = host.clientHeight;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  scene.resize(W, H);
  once();
}

// One frame outside the loop: the settled still, and each redraw an input asks for when nothing is ticking.
function once() { scene.frame(0, performance.now()); state.frames++; }
function tick(dt, now) { scene.frame(dt, now); state.frames++; }

// The loop exists only while someone can see it and may be shown motion.
function sync() {
  const run = visible && !still();
  if (run && !off) off = ticker.add(tick);
  else if (!run && off) { off(); off = null; }
  state.running = Boolean(off);
}

const at = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: e.timeStamp }; };

function act(p) {
  const out = scene.click(p, performance.now()) || {};
  status.textContent = out.say || '';
  clearTimeout(again);
  if (off) return;
  once();
  if (out.again) again = setTimeout(once, out.again);
}

host.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  scene.point(at(e));
  if (!off) once();
});
for (const type of ['pointerleave', 'pointercancel']) host.addEventListener(type, () => { scene.point(null); if (!off) once(); });
// click, not pointerdown: a touch scroll that starts on the scene must leave nothing behind.
host.addEventListener('click', (e) => act(at(e)));
cue.addEventListener('click', () => act(scene.spot()));

function mount(name) {
  clearTimeout(again);
  state.scene = name;
  host.dataset.scene = name;                      // the stylesheet sizes the band per scene
  for (const b of picks) b.setAttribute('aria-pressed', String(b.dataset.pick === name));
  scene = SCENES[name]({ g, col: paints(), still });
  cue.textContent = scene.cue;
  status.textContent = '';
  size();
}

picks.forEach((b) => b.addEventListener('click', () => mount(b.dataset.pick)));
new ResizeObserver(() => { if (host.clientWidth !== W || host.clientHeight !== H) size(); }).observe(host);
new IntersectionObserver(([en]) => { visible = en.isIntersecting; sync(); }).observe(host);
onMotionTierChange(() => { sync(); size(); });

// ?scene=sky|lawn|pond picks the scene; a real footer would hard-code one, or pick one per load.
const asked = new URLSearchParams(location.search).get('scene');
mount(Object.hasOwn(SCENES, asked) ? asked : 'lawn');

awards.addState(() => ({ motion: motionTier(), ...state, status: status.textContent, ...scene.state() }));
awards.ready();
