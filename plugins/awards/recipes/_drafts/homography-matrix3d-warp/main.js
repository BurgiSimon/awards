import { awards } from '../../_shared/awards-hook.js';
import { clamp } from '../../_shared/raf.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// A live DOM screen warped onto a drawn quadrilateral. The target is four points of an SVG polygon, read through the
// drawing's own viewBox, slice crop and position (getScreenCTM), so they follow the art at any size. The scroll lerps
// each corner from the flat rectangle to its target; the 2D homography from the rectangle to those four points is
// solved (8 × 8, Gaussian elimination) and written as one matrix3d with the origin at the element's top left. The
// app inside stays DOM: selectable, focusable, clickable through the same matrix.

syncMotionTierAttribute();
let tier = motionTier();

const stage = document.querySelector('[data-stage]');
const scene = document.querySelector('[data-scene]');
const art = scene.querySelector('[data-scene-art]');
const quad = art.querySelector('[data-screen-quad]');
const glass = scene.querySelector('[data-glass]');
const screen = document.querySelector('[data-screen]');
const app = screen.querySelector('[data-app]');
const toggle = app.querySelector('[data-loop-toggle]');

const WINDOW = [0.12, 0.78];   // the part of the stage's scroll that does the warp; flat before, placed after
const MAX_W = 640;             // px, the flat screen's widest
const FILL = 0.86;             // of the scene's width at most
const TALL = 0.62;             // of the scene's height at most
const ASPECT = 1.6;            // the app's 16:10

const smoothstep = (t) => t * t * (3 - 2 * t);
const state = { progress: 0, eased: -1, writes: 0, measures: 0, W: 0, H: 0, origin: [0, 0], corners: null, target: null, playing: false };
let target = null;   // the four target corners in the element's local px, TL, TR, BR, BL
let dirty = true;

// The homography H (h33 = 1) sending src[i] to dst[i]: eight equations, eight unknowns.
function homography(src, dst) {
  const A = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }
  for (let c = 0; c < 8; c++) {
    let p = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    if (Math.abs(A[p][c]) < 1e-12) return null;   // three corners in a line: no projective map
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < 8; r++) {
      if (r === c || !A[r][c]) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k];
    }
  }
  return A.map((row, i) => row[8] / row[i]);
}
// [a b c; d e f; g h 1] as a column-major 4 × 4: x and y rows carry the 2D map, z passes through, w takes g and h.
const toMatrix3d = ([a, b, c, d, e, f, g, h]) => `matrix3d(${[a, d, 0, g, b, e, 0, h, 0, 0, 1, 0, c, f, 0, 1].map((n) => +n.toFixed(10)).join(',')})`;

// Size and place the flat screen, then read the target through the drawing's current scale and crop.
function measure() {
  const sw = scene.clientWidth, sh = scene.clientHeight;
  const W = Math.round(Math.min(MAX_W, sw * FILL, sh * TALL * ASPECT));
  const H = Math.round(W / ASPECT);
  const cx = sw >= 900 ? sw * 0.6 : sw / 2;   // wide: flat to the right of the caption; narrow: centred
  const left = Math.round(cx - W / 2), top = Math.round((sh - H) / 2);
  Object.assign(screen.style, { inset: 'auto', margin: '0', aspectRatio: 'auto', width: `${W}px`, height: `${H}px`, left: `${left}px`, top: `${top}px` });
  const ctm = art.getScreenCTM();
  const box = scene.getBoundingClientRect();
  const pts = [];
  for (let i = 0; i < quad.points.numberOfItems; i++) {
    const q = new DOMPoint(quad.points.getItem(i).x, quad.points.getItem(i).y).matrixTransform(ctm);
    pts.push([q.x - box.left - left, q.y - box.top - top]);
  }
  target = pts;
  Object.assign(state, { W, H, origin: [left, top], target: pts });
  state.measures++;
  dirty = true;
}

function progress() {
  const r = stage.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
}

function draw() {
  const p = tier === 'full' ? progress() : 1;
  const e = tier === 'full' ? smoothstep(clamp((p - WINDOW[0]) / (WINDOW[1] - WINDOW[0]), 0, 1)) : 1;
  state.progress = p;
  if (e === state.eased && !dirty) return;
  dirty = false;
  state.eased = e;
  const { W, H } = state;
  const src = [[0, 0], [W, 0], [W, H], [0, H]];
  // Interpolate the corners, not the matrix: every in-between frame is a true projection of the rectangle.
  const dst = src.map(([x, y], i) => [x + (target[i][0] - x) * e, y + (target[i][1] - y) * e]);
  const h = e > 0 ? homography(src, dst) : null;
  screen.style.transform = h ? toMatrix3d(h) : 'none';
  screen.style.setProperty('--lift', String(+(1 - e).toFixed(4)));
  glass.style.opacity = String(+e.toFixed(4));
  state.corners = dst;
  state.writes++;
}

// One scroll listener and one frame: read the stage's rect at the top of the frame, then write.
let queued = 0;
const schedule = () => { if (!queued) queued = requestAnimationFrame(() => { queued = 0; draw(); }); };
addEventListener('scroll', schedule, { passive: true });
new ResizeObserver(() => { measure(); draw(); }).observe(scene);

// The recording: a CSS loop on the app, running only while it plays and the stage is on screen. Its button is the
// app's own control and the page's pause; under reduced motion and static it starts paused.
function play(on) {
  state.playing = on;
  app.dataset.playing = String(on);
  toggle.textContent = on ? 'Pause the loop' : 'Play the loop';
}
toggle.addEventListener('click', () => play(!state.playing));
new IntersectionObserver(([en]) => { if (en.isIntersecting) delete app.dataset.offscreen; else app.dataset.offscreen = ''; }).observe(stage);
document.addEventListener('visibilitychange', () => { if (document.hidden) app.dataset.offscreen = ''; else if (stage.getBoundingClientRect().bottom > 0) delete app.dataset.offscreen; });

function applyTier(t) {
  tier = t;
  dirty = true;
  if (t !== 'full') play(false);
  draw();
}
onMotionTierChange(applyTier);
// The static tier can also be set on <html> after load (data-motion="static"); follow it.
new MutationObserver(() => applyTier(motionTier())).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });

measure();
play(tier === 'full');
draw();

awards.addState(() => {
  const r = stage.getBoundingClientRect();
  const start = Math.round(r.top + scrollY);
  return {
    motion: tier,
    progress: +state.progress.toFixed(4),
    eased: +state.eased.toFixed(4),
    window: WINDOW,
    range: [start, start + Math.max(0, Math.round(r.height - innerHeight))],
    size: [state.W, state.H],
    origin: state.origin,
    corners: state.corners,
    target: state.target,
    writes: state.writes,
    measures: state.measures,
    playing: state.playing,
    offscreen: 'offscreen' in app.dataset,
  };
});
awards.ready();
