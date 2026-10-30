import { awards } from '../../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// A drawn map with named, numbered pins. Each pin is a <button> laid out at its place's percentage of the map box, so
// it rides any width the map is drawn at. One card shows the place under the pointer, the keyboard or the last click;
// the list beside the map is the same places in the same order and drives the same card. Arrow keys rove between pins
// in reading order inside one labelled group (one tab stop); Enter toggles a card, Escape closes it. The card floats
// beside its pin on a side that never covers it; where the map is too small for that, the card docks under the map.

syncMotionTierAttribute();
let tier = motionTier();

const figure = document.querySelector('[data-atlas]');
const map = document.querySelector('[data-map]');
const group = document.querySelector('[data-pins]');
const card = document.querySelector('[data-card]');
const status = document.querySelector('[data-status]');
const slot = (k) => card.querySelector(`[data-card-${k}]`);

const GAP = 36;            // px from the pin's centre to the card's near edge: clears the 28 px focus halo and the 7 px tick
const PAD = 12;            // px the card keeps from the map's edges
const TICK_MIN = 20;       // px the tick keeps from the card's corners
const DOT = 13;            // px from a pin's centre to the edge of its dot and rings, for what a card covers
const SLIDE = 8;           // px between the card positions tried along each side
const ROW = 6;             // % of the map's height: pins this close to a row's first pin share its row
const MAX_COVERING = 0.25; // share of places whose card may cover one other pin before the card docks instead
const GRACE = 140;         // ms a hover survives the pointer leaving its pin, so the card can be reached
const INTENT = 160;        // ms the pointer rests on a pin under the open card before that pin takes over
const STEP = 70;           // ms between pins in the entrance (matches --enter-step)
const ENTER_MS = 560;      // the longest pin transition
const phone = matchMedia('(max-width: 720px)');
const labelGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-gap')) || 16;

// One record per place: its pin, its list entry and its point. The card's text is read from the list entry each time
// it is filled, so the list is the only copy.
const places = new Map();
const items = [...document.querySelectorAll('.place')];
for (const pin of group.querySelectorAll('.pin')) {
  const id = pin.dataset.place;
  const item = document.querySelector(`.place[data-place="${id}"]`);
  const cs = getComputedStyle(pin);
  places.set(id, {
    id, pin, item, label: pin.querySelector('.pin__label'),
    x: parseFloat(cs.getPropertyValue('--x')), y: parseFloat(cs.getPropertyValue('--y')),
    labelLeft: pin.dataset.label === 'start', under: false, unnamed: false,
  });
  // The pin's number is its entry's number in the list, so the two stay keyed whatever order the markup is in.
  pin.querySelector('.pin__dot').textContent = String(items.indexOf(item) + 1);
}
// Reading order: rows top to bottom (a pin within 6 % of a row's first pin joins that row), each row left to right.
// Grouping first keeps the order well defined; a pairwise "close enough" comparison is not transitive.
const rows = [];
for (const p of [...places.values()].sort((a, b) => a.y - b.y)) {
  const row = rows.at(-1);
  if (row && p.y - row[0].y < ROW) row.push(p); else rows.push([p]);
}
const order = rows.flatMap((row) => row.sort((a, b) => a.x - b.x));
order.forEach((p, i) => { p.pin.style.setProperty('--i', String(i)); group.append(p.pin); });

// Roving tabindex: the group is one tab stop, the last pin used.
let current = order[0];
function setCurrent(p) {
  current = p;
  for (const q of order) q.pin.tabIndex = q === p ? 0 : -1;
}
setCurrent(current);

// Three sources can ask for the card; the pointer wins while it is there, then keyboard focus, then the last click.
// A key press hands the pointer's claim back until the pointer moves again.
const src = { hover: null, focus: null, selected: null };
let suppressed = null;   // a place Escape (or a second activation) closed while focus or the pointer stays on its pin
let pending = null;      // a pin under the open card the pointer is resting on
let hoverTimer = 0;
let hideTimer = 0;
let laying = false;
const state = { shown: null, side: null, covers: [], opens: 0, entered: 0, dock: false, tall: false, reserve: 0, layouts: 0, unnamed: [] };

function shownId() {
  // Focus inside the card holds it on its place, whatever the pointer does elsewhere.
  if (card.contains(document.activeElement) && state.shown) return state.shown;
  for (const k of ['hover', 'focus', 'selected']) if (src[k] && src[k] !== suppressed) return src[k];
  return null;
}

function fill(p) {
  const q = (s) => p.item.querySelector(s).textContent.trim();
  delete card.dataset.empty;
  slot('name').textContent = q('.place__name');
  slot('num').textContent = q('.place__num');
  slot('unit').textContent = q('.place__unit');
  slot('what').textContent = q('.place__what');
  slot('line').textContent = q('.place__line');
  const a = slot('link');
  const link = p.item.querySelector('.place__link');
  a.textContent = link.textContent;
  a.href = link.getAttribute('href');
  for (const k of ['fig', 'line', 'link']) slot(k).hidden = false;
}
function empty() {
  card.dataset.empty = '';
  slot('name').textContent = 'Choose a pin or a place from the list';
  for (const k of ['fig', 'line', 'link']) slot(k).hidden = true;
}

// Where the card can float for a place, in map pixels: above or below the pin, or beside it on the side away from its
// label, slid along that side in 8 px steps. A position must stay 12 px inside the map; it costs 10 for every other
// pin's dot it covers and 1 for every other label, plus a small preference for above, below, then the side, centred.
// The own pin, its focus halo and its label are never under the card: every side starts 36 px from the pin's centre.
const hit = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
const NONE = [0, 0, 0, 0];
function geometry(p, W, H, named = !p.unnamed) {
  const px = (p.x / 100) * W, py = (p.y / 100) * H;
  const lw = p.label.offsetWidth, lh = p.label.offsetHeight;
  const label = !named ? NONE : p.labelLeft ? [px - labelGap - lw, py - lh / 2, px - labelGap, py + lh / 2] : [px + labelGap, py - lh / 2, px + labelGap + lw, py + lh / 2];
  return { px, py, dot: [px - DOT, py - DOT, px + DOT, py + DOT], label };
}
// Names that fit: in reading order, a name stays when it is inside the map and clear of every earlier name and every
// other pin's dot (4 px apart), counting the 14 px a focused name steps out; the rest fall back to their numbers.
// Phones show numbers only (style.css).
const FOCUS_STEP = 14;
function names() {
  const W = map.clientWidth, H = map.clientHeight, kept = [];
  const dots = order.map((q) => geometry(q, W, H, false));
  const grow = (b) => [b[0] - 4, b[1] - 4, b[2] + 4, b[3] + 4];
  for (const [i, p] of order.entries()) {
    const b = geometry(p, W, H, true).label;
    const box = p.labelLeft ? [b[0] - FOCUS_STEP, b[1], b[2], b[3]] : [b[0], b[1], b[2] + FOCUS_STEP, b[3]];
    const fits = !phone.matches && box[0] >= 0 && box[2] <= W && !kept.some((k) => hit(grow(k), box)) && !dots.some((d, j) => j !== i && hit(grow(d.dot), box));
    p.unnamed = !fits;
    p.pin.toggleAttribute('data-unnamed', p.unnamed);
    if (fits) kept.push(box);
  }
  state.unnamed = order.filter((p) => p.unnamed).map((p) => p.id);
}
function place(p) {
  const W = map.clientWidth, H = map.clientHeight, cw = card.offsetWidth, ch = card.offsetHeight;
  const me = geometry(p, W, H);
  const others = order.filter((q) => q !== p).map((q) => ({ id: q.id, ...geometry(q, W, H) }));
  let best = null;
  const consider = (side, left, top, pref) => {
    if (left < PAD - 0.5 || top < PAD - 0.5 || left + cw > W - PAD + 0.5 || top + ch > H - PAD + 0.5) return;
    const box = [left, top, left + cw, top + ch];
    const dots = [], labels = [];
    for (const o of others) { if (hit(o.dot, box)) dots.push(o.id); if (hit(o.label, box)) labels.push(o.id); }
    const cost = pref + dots.length * 10 + labels.length;
    if (!best || cost < best.cost) best = { side, left, top, cost, dots, labels, tick: side === 'above' || side === 'below' ? me.px - left : me.py - top, span: side === 'above' || side === 'below' ? cw : ch };
  };
  const along = (lo, hi, centre) => { const v = [Math.min(Math.max(centre, lo), hi)]; for (let t = lo; t < hi; t += SLIDE) v.push(t); v.push(hi); return v; };
  const lo = Math.max(PAD, me.px - cw + TICK_MIN), hi = Math.min(W - PAD - cw, me.px - TICK_MIN), mid = me.px - cw / 2;
  if (lo <= hi) {
    for (const l of along(lo, hi, mid)) consider('above', l, me.py - GAP - ch, Math.abs(l - mid) / cw * 0.5);
    for (const l of along(lo, hi, mid)) consider('below', l, me.py + GAP, 0.1 + Math.abs(l - mid) / cw * 0.5);
  }
  const tlo = Math.max(PAD, me.py - ch + TICK_MIN), thi = Math.min(H - PAD - ch, me.py - TICK_MIN), tmid = me.py - ch / 2;
  if (tlo <= thi) {
    const side = p.labelLeft ? 'right' : 'left';
    const left = p.labelLeft ? me.px + GAP : me.px - GAP - cw;
    for (const t of along(tlo, thi, tmid)) consider(side, left, t, 0.6 + Math.abs(t - tmid) / ch * 0.5);
  }
  return best;
}

function clearUnder() {
  for (const q of places.values()) { q.under = false; q.pin.removeAttribute('data-under'); }
  state.covers = [];
}
function position(p) {
  if (state.dock) { card.style.transform = ''; delete card.dataset.side; state.side = null; clearUnder(); return; }
  const best = place(p);
  if (!best) { if (!laying) { layout(); } return; }   // the text grew since the last layout: decide the dock again
  card.style.transform = `translate3d(${Math.round(best.left)}px, ${Math.round(best.top)}px, 0)`;
  card.style.setProperty('--tick', `${Math.round(Math.min(Math.max(best.tick, TICK_MIN), best.span - TICK_MIN))}px`);
  card.dataset.side = best.side;
  state.side = best.side;
  state.covers = best.dots;
  // Pins stay above the card, so a covered pin can still be pointed at and clicked; its name hides while it is under.
  for (const q of places.values()) {
    q.under = best.dots.includes(q.id);
    q.pin.toggleAttribute('data-under', q.under || best.labels.includes(q.id));
  }
}

// Decide floating or docked for the current map size, from every place's own card: dock on a phone, when some card
// cannot clear its own pin, when one would cover two other pins, or when more than a quarter would cover one. Docked,
// the card reserves the height of its tallest place, so choosing a place never moves what is below it.
function tallest() {
  empty();
  let h = card.offsetHeight;
  for (const p of order) { fill(p); h = Math.max(h, card.offsetHeight); }
  return Math.ceil(h);
}
function layout() {
  laying = true;
  state.layouts++;
  const wasHidden = card.hidden;
  card.hidden = false;
  card.style.minHeight = '';
  figure.removeAttribute('data-dock');
  figure.removeAttribute('data-tall');
  figure.style.removeProperty('--dock-room');
  const free = map.clientWidth;
  names();
  let dock = phone.matches;
  if (!dock) {
    let covering = 0;
    for (const p of order) {
      fill(p);
      const best = place(p);
      if (!best || best.dots.length > 1) { dock = true; break; }
      if (best.dots.length) covering++;
    }
    if (covering > order.length * MAX_COVERING) dock = true;
  }
  state.dock = dock;
  state.reserve = 0;
  state.tall = false;
  if (dock) {
    figure.setAttribute('data-dock', '');
    state.reserve = tallest();
    if (!phone.matches) {
      // Beside the list the figure is sticky, so it must fit the screen: the map shrinks by the card's room (the card
      // takes the map's width, so its height is measured again until it settles). Under 60 % of its free width, or
      // 320 px, the map keeps its size and the figure scrolls with the page instead.
      const cap = figure.querySelector('figcaption');
      const capH = cap.offsetHeight + parseFloat(getComputedStyle(cap).marginTop);
      for (let i = 0; i < 3; i++) {
        figure.style.setProperty('--dock-room', `${12 + state.reserve + capH}px`);
        const h = tallest();
        if (h === state.reserve) break;
        state.reserve = h;
      }
      state.tall = map.clientWidth < Math.max(320, free * 0.6);
      if (state.tall) { figure.setAttribute('data-tall', ''); figure.style.removeProperty('--dock-room'); state.reserve = tallest(); }
    }
    card.style.minHeight = `${state.reserve}px`;
    names();
  }
  card.hidden = dock ? false : wasHidden || !state.shown;
  laying = false;
  render();
}

function render() {
  const id = shownId();
  const p = id ? places.get(id) : null;
  for (const q of places.values()) {
    const on = q === p;
    q.pin.setAttribute('aria-expanded', String(on));
    q.pin.classList.toggle('is-on', on);
    q.item.classList.toggle('is-on', on);
  }
  clearTimeout(hideTimer);
  if (!p) {
    state.shown = null;
    state.side = null;
    clearUnder();
    if (state.dock) { empty(); card.hidden = false; card.dataset.state = 'open'; return; }
    if (!card.hidden) {
      card.dataset.state = 'closed';
      hideTimer = setTimeout(() => { if (card.dataset.state === 'closed') card.hidden = true; }, 180);
    }
    return;
  }
  if (state.shown !== p.id) state.opens++;
  state.shown = p.id;
  fill(p);
  if (card.hidden) { card.hidden = false; card.dataset.state = 'enter'; position(p); void card.offsetWidth; }
  else position(p);
  card.dataset.state = 'open';
}

// Bring the open card into view when it has left the screen (a pin focused near the bottom edge, a tap on a phone),
// but never so far that the pin it belongs to leaves the screen: on a short landscape phone the pin wins.
function reveal(p) {
  if (!state.shown || card.hidden) return;
  const c = card.getBoundingClientRect(), b = p.pin.getBoundingClientRect();
  let dy = 0;
  if (c.bottom > innerHeight) dy = Math.max(0, Math.min(c.bottom - innerHeight + 8, b.top - 8));
  else if (c.top < 0) dy = Math.min(0, Math.max(c.top - 8, b.bottom + 8 - innerHeight));
  if (dy) scrollBy({ top: dy, behavior: tier === 'full' ? 'smooth' : 'auto' });
}

// Pointer: a mouse over a pin or a list entry asks for its place; leaving it lets go after a short grace. A pin under
// the open card takes over only once the pointer has rested on it, so crossing the card on the way to its action
// does not swap it; a pin clear of the card takes over at once.
function setHover(id) {
  pending = null;
  if (src.hover === id) return;
  src.hover = id;
  if (id) suppressed = null;
  render();
}
function hoverOn(id, fromMap) {
  if (src.hover === id) { clearTimeout(hoverTimer); pending = null; return; }
  if (pending === id) return;
  clearTimeout(hoverTimer);
  if (fromMap && places.get(id).under && state.shown && state.shown !== id) { pending = id; hoverTimer = setTimeout(() => setHover(id), INTENT); }
  else setHover(id);
}
function hoverOff() { clearTimeout(hoverTimer); pending = null; hoverTimer = setTimeout(() => setHover(null), GRACE); }
const mouse = (e) => e.pointerType === 'mouse';
for (const p of places.values()) {
  p.pin.addEventListener('pointerenter', (e) => { if (mouse(e)) hoverOn(p.id, true); });
  p.pin.addEventListener('pointermove', (e) => { if (mouse(e) && src.hover !== p.id) hoverOn(p.id, true); });
  p.pin.addEventListener('pointerleave', (e) => { if (mouse(e)) hoverOff(); });
  p.item.addEventListener('pointerenter', (e) => { if (mouse(e)) hoverOn(p.id, false); });
  p.item.addEventListener('pointerleave', (e) => { if (mouse(e)) hoverOff(); });
  // Activation toggles. From the keyboard (detail 0) the card is already open from focus, so Enter or Space closes it
  // and opens it again; a click or tap selects, and a second one on the selected pin lets go.
  p.pin.addEventListener('click', (e) => {
    const keyboard = e.detail === 0;
    if (keyboard) src.hover = null;
    if (keyboard ? shownId() === p.id : src.selected === p.id) { src.selected = null; suppressed = p.id; }
    else { src.selected = p.id; suppressed = null; }
    render();
    if (state.dock || keyboard) reveal(p);
  });
}
card.addEventListener('pointerenter', (e) => { if (mouse(e) && src.hover) { clearTimeout(hoverTimer); pending = null; } });
card.addEventListener('pointerleave', (e) => { if (mouse(e) && src.hover) hoverOff(); });
map.addEventListener('pointerenter', () => enterNow());

// The list's own control selects its place, says so, and brings the map into view when it is off screen.
for (const btn of document.querySelectorAll('[data-show]')) {
  btn.addEventListener('click', () => {
    const p = places.get(btn.dataset.show);
    src.selected = p.id;
    suppressed = null;
    render();
    status.textContent = `${p.item.querySelector('.place__name').textContent.trim()} shown on the map.`;
    const r = map.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight * 0.6) figure.scrollIntoView({ block: 'start', behavior: tier === 'full' ? 'smooth' : 'auto' });
  });
}
// A click anywhere else lets go of the last click. A click, not a press: the press that starts a touch scroll is
// followed by no click, so scrolling past the map on a phone keeps the chosen place.
document.addEventListener('click', (e) => {
  if (src.selected && !e.target.closest('.pin, [data-card], [data-show]')) { src.selected = null; render(); }
});

// Keyboard focus: a pin or a list entry holding focus asks for its place; the card keeps what it shows.
document.addEventListener('focusin', (e) => {
  const t = e.target;
  if (card.contains(t)) return;
  const pin = t.closest?.('.pin');
  const item = pin ? null : t.closest?.('.place');
  const id = pin?.dataset.place ?? item?.dataset.place ?? null;
  const keyboard = !!id && t.matches(':focus-visible');
  if (pin) setCurrent(places.get(id));
  if (id !== suppressed) suppressed = null;
  if (keyboard) { clearTimeout(hoverTimer); pending = null; src.hover = null; }
  src.focus = id;
  render();
  if (keyboard && pin) reveal(places.get(id));
});
document.addEventListener('focusout', (e) => { if (!e.relatedTarget) { src.focus = null; render(); } });

// Arrow keys rove in reading order (wrapping), Home and End jump; Escape closes the card, from a pin or from inside it.
// ← and → keep their physical sense in a right-to-left page too, because the map does not mirror.
const KEYS = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
group.addEventListener('keydown', (e) => {
  let to = null;
  const i = order.indexOf(current);
  if (e.key in KEYS) to = order[(i + KEYS[e.key] + order.length) % order.length];
  else if (e.key === 'Home') to = order[0];
  else if (e.key === 'End') to = order[order.length - 1];
  if (!to) return;
  e.preventDefault();
  setCurrent(to);
  to.pin.focus();
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !state.shown) return;
  const p = places.get(state.shown);
  const fromCard = card.contains(document.activeElement);
  clearTimeout(hoverTimer);
  pending = null;
  src.hover = null;
  src.selected = null;
  if (fromCard) { setCurrent(p); p.pin.focus(); }
  suppressed = src.focus;
  render();
});

// Entrance: pins drop in one by one, in reading order, the first time the map is a third in view (full tier only),
// or as soon as a pin takes focus or the pointer reaches the map. Waiting pins take no pointer.
function enterNow() {
  if (figure.dataset.enter !== 'pending') return;
  figure.dataset.enter = 'in';
  state.entered = performance.now();
  setTimeout(() => { figure.dataset.enter = 'done'; }, (order.length - 1) * STEP + ENTER_MS + 60);
}
if (tier === 'full') {
  figure.dataset.enter = 'pending';
  const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); enterNow(); } }, { threshold: 0.35 });
  io.observe(map);
  group.addEventListener('focusin', enterNow);
} else {
  figure.dataset.enter = 'done';
}
onMotionTierChange((t) => { tier = t; if (t !== 'full') figure.dataset.enter = 'done'; });

// Layout changes (a narrower window, the phone breakpoint, longer text) decide the dock again and re-place the card.
let queued = 0;
const relayout = () => { cancelAnimationFrame(queued); queued = requestAnimationFrame(layout); };
new ResizeObserver(relayout).observe(map);
addEventListener('resize', relayout);
phone.addEventListener('change', relayout);
layout();

awards.addState(() => ({
  motion: tier,
  enter: figure.dataset.enter ?? null,
  shown: state.shown,
  side: state.side,
  covers: state.covers,
  opens: state.opens,
  docked: state.dock,
  tall: state.tall,
  unnamed: state.unnamed,
  reserve: state.reserve,
  layouts: state.layouts,
  hover: src.hover,
  focus: src.focus,
  selected: src.selected,
  pending,
  current: current.id,
  order: order.map((p) => p.id),
  numbers: order.map((p) => p.pin.querySelector('.pin__dot').textContent),
  cardHidden: card.hidden,
  cardState: card.dataset.state ?? null,
  status: status.textContent,
}));
awards.ready();
