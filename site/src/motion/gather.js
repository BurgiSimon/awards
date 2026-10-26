// The signature, first half (AWARDS.md SIGNATURE, "The sort"): the five builds' frames lie gathered under the first
// screen's sentence and travel into their rows of the record as the record arrives. One value drives it, p from 0
// (gathered) to 1 (in its row): a tween on the master timeline (`master@record`, ease 'none', the smoothing is
// Lenis'), so every state is reproducible from a scroll position. Transform only.
//
// Where each frame lies in the pile, as fractions of the pile's width (x, y, w) and a sub-degree turn; frame i of the
// record (its ranked order) takes place i.
import { clamp, lerp } from '../lib/raf.js';

const PILE = {
  wide: [
    { x: 0.0, y: 0.0, w: 0.62, r: -0.6 },
    { x: 0.44, y: 0.1, w: 0.54, r: 0.5 },
    { x: 0.08, y: 0.33, w: 0.5, r: -0.3 },
    { x: 0.52, y: 0.4, w: 0.46, r: 0.8 },
    { x: 0.27, y: 0.56, w: 0.42, r: -0.5 },
  ],
  narrow: [
    { x: 0.0, y: 0.0, w: 0.7, r: -0.6 },
    { x: 0.34, y: 0.12, w: 0.66, r: 0.6 },
    { x: 0.06, y: 0.3, w: 0.6, r: -0.4 },
    { x: 0.4, y: 0.42, w: 0.58, r: 0.7 },
    { x: 0.16, y: 0.56, w: 0.54, r: -0.5 },
  ],
};

// The spread: where the five lie while the stage holds, as fractions of the record list's box (x and w of its width,
// y of its height), looser than the pile so together they cover most of the rows' columns, about half the stage.
// Without a sticky stage (tablet, phone) the spread is laid in the viewport instead, so it stays on screen.
const SPREAD = [
  { x: 0.0, y: 0.0, w: 0.6, r: -0.4 },
  { x: 0.44, y: 0.05, w: 0.56, r: 0.3 },
  { x: 0.02, y: 0.4, w: 0.52, r: 0.2 },
  { x: 0.48, y: 0.43, w: 0.52, r: -0.3 },
  { x: 0.2, y: 0.66, w: 0.56, r: 0.4 },
];
// p: 0 → .35 the pile travels to the spread, .35 → .62 the spread holds, .62 → 1 the frames sort into their rows.
const TO_SPREAD = 0.35;
const TO_ROWS = 0.62;

export function initGather({ tier, master }) {
  const stage = document.querySelector('.record__stage');
  const run = document.querySelector('.record__run');
  const list = document.querySelector('[data-record]');
  const pile = document.querySelector('.claim__pile');
  if (!stage || !list || !pile) return null;
  const rows = () => [...list.children];
  // Full: the frames travel. Reduced: they rest in the pile, then change place in one step (no spatial travel).
  const travel = tier === 'full' || tier === 'reduced';
  const stepped = tier === 'reduced';
  let slots = new Map(); // figure → its natural box, relative to the stage
  let p = travel ? 0 : 1;
  let dirty = true;

  // The frames' own boxes in their rows, measured with every transform cleared.
  function measure() {
    const figures = rows().map((li) => li.querySelector('[data-gather]'));
    figures.forEach((f) => { f.style.transform = ''; });
    const s = stage.getBoundingClientRect();
    slots = new Map(figures.map((f) => {
      const r = f.getBoundingClientRect();
      return [f, { x: r.left - s.left, y: r.top - s.top, w: r.width }];
    }));
    dirty = true;
  }

  // The window on the master timeline: from when the first screen starts to leave, to a little over half a screen
  // after the stage holds (or, with no sticky stage, until the record's top is a quarter down the screen).
  function gatherWindow() {
    const vh = window.innerHeight;
    const pinned = getComputedStyle(stage).position === 'sticky';
    const top = (run ?? stage).getBoundingClientRect().top + window.scrollY;
    const band = document.querySelector('.band')?.offsetHeight ?? 64;
    const start = Math.max(0, top - band - vh * 0.85);
    const end = pinned ? top - band + vh * 0.95 : top + vh * 0.35;
    return [start, Math.max(start + 1, end)];
  }
  const progress = () => clamp(master.proxy.gather, 0, 1);

  // Three places per frame: the pile under the first screen's sentence, the spread over the record's rows (held
  // while the stage holds, so the work fills the stage before it sorts), and its own row.
  function apply() {
    const s = stage.getBoundingClientRect();
    const a = pile.getBoundingClientRect();
    const pinned = getComputedStyle(stage).position === 'sticky';
    const l = list.getBoundingClientRect();
    const places = a.width < 700 ? PILE.narrow : PILE.wide;
    rows().forEach((li, i) => {
      const fig = li.querySelector('[data-gather]');
      const slot = slots.get(fig);
      if (!slot) return;
      // Row text arrives at its own threshold, in ranked order, as the spread sorts; every rank reaches 1 by p = 1.
      const t = stepped || p >= 1 ? p : clamp((p - 0.68 - i * 0.04) / 0.16, 0, 1);
      li.style.setProperty('--t', t.toFixed(3));
      if (p >= 1) { fig.style.transform = ''; return; }
      const place = places[i % places.length];
      const sp = SPREAD[i % SPREAD.length];
      const from = { x: a.left + place.x * a.width, y: a.top + place.y * a.width, w: place.w * a.width, r: place.r };
      const mid = { x: l.left + sp.x * l.width, y: l.top + sp.y * l.height, w: Math.min(sp.w * l.width, 1.6 * sp.w * l.height), r: sp.r };
      const to = { x: s.left + slot.x, y: s.top + slot.y, w: slot.w, r: 0 };
      // Without a sticky stage (tablet, phone) the record's head stacks between the pile and the rows, so the frames
      // travel straight to their rows and pass behind the head, which takes the ground while they do.
      const [A, B, q] = !pinned ? [from, to, p]
        : p < TO_SPREAD ? [from, mid, p / TO_SPREAD] : p < TO_ROWS ? [mid, mid, 0] : [mid, to, (p - TO_ROWS) / (1 - TO_ROWS)];
      const x = lerp(A.x, B.x, q) - to.x;
      const y = lerp(A.y, B.y, q) - to.y;
      const k = lerp(A.w, B.w, q) / to.w;
      const r = lerp(A.r, B.r, q);
      fig.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${r.toFixed(2)}deg) scale(${k.toFixed(4)})`;
    });
    stage.classList.toggle('is-gathered', p < 1);
  }

  // Re-applied whenever the page moves: while gathered, the pile scrolls with the first screen.
  let lastY = -1;
  let swapping = Promise.resolve();
  let unsubscribe = () => {};
  function tick() {
    if (!travel) return;
    const y = window.scrollY;
    if (!dirty && y === lastY) return;
    let next = progress();
    if (stepped) next = next < 0.5 ? 0 : 1;
    if (!dirty && next >= 1 && p >= 1) { lastY = y; return; }
    lastY = y;
    const swapped = stepped && next !== p;
    p = next;
    dirty = false;
    if (swapped) {
      // Fade out where they are, move while unseen, fade in at the new place.
      const figs = rows().map((li) => li.querySelector('[data-gather]'));
      figs.forEach((f) => f.classList.add('is-swapping'));
      swapping = new Promise((resolve) => setTimeout(() => {
        apply();
        requestAnimationFrame(() => { figs.forEach((f) => f.classList.remove('is-swapping')); setTimeout(resolve, 180); });
      }, 170));
      return;
    }
    apply();
  }

  measure();
  if (travel) {
    stage.classList.add('is-travel');
    stage.classList.toggle('is-stepped', stepped);
    master.setGatherWindow(gatherWindow);
    unsubscribe = master.onUpdate(tick);
    dirty = true;
    tick();
  } else {
    rows().forEach((li) => li.style.setProperty('--t', '1'));
  }
  const onResize = () => { measure(); if (travel) master.refresh(); tick(); };
  addEventListener('resize', onResize);
  document.fonts?.ready.then(onResize);
  addEventListener('load', onResize, { once: true });

  return {
    refresh: onResize,
    // capture.mjs and __awards.scrollTo wait on this, so a frame is never shot halfway through a step.
    settled: () => { tick(); return swapping; },
    state: () => ({ p: Number(p.toFixed(3)), travel }),
    gathered: () => travel && p < 1,
    destroy() {
      unsubscribe();
      removeEventListener('resize', onResize);
      rows().forEach((li) => { li.style.removeProperty('--t'); li.querySelector('[data-gather]').style.transform = ''; });
      stage.classList.remove('is-travel', 'is-gathered', 'is-stepped');
    },
  };
}
