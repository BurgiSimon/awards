import gsap from 'gsap';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

// One marker for the whole index: an aria-hidden bar under the rows' words and over their plates, blended with
// multiply. It cuts to the row under the pointer, the row holding keyboard focus, or (on touch screens) the row
// crossing a reading line; it never interpolates. Sorting re-orders the rows and steps them back in by hard sets.

syncMotionTierAttribute();
let tier = motionTier();
onMotionTierChange((t) => { tier = t; });

const list = document.querySelector('[data-list]');
const marker = document.querySelector('[data-marker]');
const status = document.querySelector('[data-status]');
const buttons = [...document.querySelectorAll('[data-sort]')];
const rows = [...list.children];

const READING_LINE = 0.4;   // touch screens: the row crossing 40 % of the viewport height is marked
const SORT_STEP = 0.03;     // s between rows stepping back in after a sort (full tier)

// The blink family as registered effects (full tier only): hard opacity steps, never a fade.
gsap.registerEffect({
  name: 'blinkOnce',
  extendTimeline: true,
  effect: (targets) => gsap.timeline().set(targets, { opacity: 0 }, 0).set(targets, { opacity: 1, clearProps: 'opacity' }, 0.06),
});

const state = { active: -1, writes: 0, blinks: 0, mode: null, sorts: 0, key: 'year', dir: -1 };
let active = null;

function place(row) {
  marker.style.transform = `translate3d(0, ${row.offsetTop}px, 0)`;
  marker.style.height = `${row.offsetHeight}px`;
  state.writes++;
}
function mark(row, mode) {
  state.mode = mode;
  if (row === active) return;
  active?.removeAttribute('data-active');
  active = row;
  row.setAttribute('data-active', '');
  state.active = [...list.children].indexOf(row);
  place(row);
  if (!marker.classList.contains('is-on')) {
    marker.classList.add('is-on');
    if (tier === 'full') { gsap.effects.blinkOnce(marker); state.blinks++; }
  }
}
function unmark() {
  active?.removeAttribute('data-active');
  active = null;
  state.active = -1;
  state.mode = null;
  marker.classList.remove('is-on');
}

// Pointer: a mouse over a row marks it; leaving the list clears the mark unless keyboard focus is still inside.
list.addEventListener('pointerover', (e) => {
  if (e.pointerType !== 'mouse') return;
  const row = e.target.closest('.row');
  if (row) mark(row, 'pointer');
});
list.addEventListener('pointerleave', (e) => {
  if (e.pointerType !== 'mouse') return;
  const focused = list.querySelector(':focus-visible')?.closest('.row');
  if (focused) mark(focused, 'focus'); else unmark();
});
// Keyboard: focus marks its row, leaving the list clears it.
list.addEventListener('focusin', (e) => {
  const row = e.target.closest('.row');
  if (row && e.target.matches(':focus-visible')) mark(row, 'focus');
});
list.addEventListener('focusout', (e) => { if (!list.contains(e.relatedTarget)) unmark(); });

// Touch screens: no hover, so the marker becomes a reading-line indicator while the list is on screen.
const coarse = matchMedia('(hover: none), (pointer: coarse)');
function readingLine() {
  if (!coarse.matches || list.contains(document.activeElement)) return;
  const y = innerHeight * READING_LINE;
  const row = rows.find((r) => { const b = r.getBoundingClientRect(); return b.top <= y && b.bottom > y; });
  if (row) mark(row, 'reading'); else if (state.mode === 'reading') unmark();
}
addEventListener('scroll', readingLine, { passive: true });
coarse.addEventListener('change', readingLine);

// Re-measure the marked row when the layout changes (fonts, a narrower window, longer text).
new ResizeObserver(() => { if (active) place(active); }).observe(list);

// Sorting: re-order the rows, keep focus on the button, announce the order, step the rows back in.
const labels = { year: 'year', title: 'project', client: 'client', type: 'type' };
const value = { year: (r) => Number(r.dataset.year), title: (r) => r.dataset.title, client: (r) => r.dataset.client, type: (r) => r.dataset.type };
const cmp = (a, b) => (typeof a === 'number' ? a - b : a.localeCompare(b));
let sortTl = null;
function sortBy(key) {
  state.dir = state.key === key ? -state.dir : key === 'year' ? -1 : 1;
  state.key = key;
  const sorted = [...rows].sort((a, b) => cmp(value[key](a), value[key](b)) * state.dir || a.dataset.title.localeCompare(b.dataset.title));
  unmark();
  list.append(...sorted);
  buttons.forEach((b) => {
    const on = b.dataset.sort === key;
    b.setAttribute('aria-pressed', String(on));
    b.querySelector('.index__dir').textContent = on ? (state.dir < 0 ? '↓' : '↑') : '';
  });
  const order = key === 'year' ? (state.dir < 0 ? 'newest first' : 'oldest first') : state.dir < 0 ? 'Z to A' : 'A to Z';
  status.textContent = `Sorted by ${labels[key]}, ${order}.`;
  state.sorts++;
  sortTl?.kill();
  if (tier === 'full') {
    sortTl = gsap.timeline();
    sortTl.set(sorted, { opacity: 0 }, 0);
    sorted.forEach((r, i) => sortTl.set(r, { opacity: 1, clearProps: 'opacity' }, 0.04 + i * SORT_STEP));
  } else {
    gsap.set(sorted, { clearProps: 'opacity' });
  }
}
buttons.forEach((b) => b.addEventListener('click', () => sortBy(b.dataset.sort)));

readingLine();

awards.addState(() => {
  const order = [...list.children].map((r) => r.dataset.title);
  const mt = new DOMMatrixReadOnly(getComputedStyle(marker).transform);
  return {
    motion: tier,
    ...state,
    on: marker.classList.contains('is-on'),
    markerY: Math.round(mt.m42),
    markerH: Math.round(marker.getBoundingClientRect().height),
    activeTop: active ? active.offsetTop : null,
    activeH: active ? active.offsetHeight : null,
    activeTitle: active?.dataset.title ?? null,
    order,
    status: status.textContent,
    pressed: buttons.find((b) => b.getAttribute('aria-pressed') === 'true')?.dataset.sort ?? null,
  };
});
awards.ready();
