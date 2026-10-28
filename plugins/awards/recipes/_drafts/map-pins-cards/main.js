import { awards } from '../../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// A drawn map with named pins. Each pin is a <button> laid out at its place's percentage of the map box, so it rides
// any width the map is drawn at. One card shows the place under the pointer, the keyboard or the last click; the list
// below the map is the same places in the same order and drives the same card. Arrow keys rove between pins in reading
// order inside one labelled group (one tab stop); Escape closes the card. Phones dock the card under the map.

syncMotionTierAttribute();
let tier = motionTier();

const figure = document.querySelector('[data-atlas]');
const map = document.querySelector('[data-map]');
const group = document.querySelector('[data-pins]');
const card = document.querySelector('[data-card]');
const status = document.querySelector('[data-status]');
const slot = (k) => card.querySelector(`[data-card-${k}]`);

const GAP = 22;          // px between the pin's centre and the card's near edge (the tick sits in it)
const PAD = 12;          // px the card keeps from the map's edges
const GRACE = 140;       // ms a hover survives the pointer leaving its pin, so the card can be reached
const STEP = 70;         // ms between pins in the entrance (matches --enter-step)
const ENTER_MS = 560;    // the longest pin transition
const docked = matchMedia('(max-width: 720px)');

// One record per place: its pin, its list entry, its point, and the card's text read from the list (the only copy).
const places = new Map();
for (const pin of group.querySelectorAll('.pin')) {
  const id = pin.dataset.place;
  const item = document.querySelector(`.place[data-place="${id}"]`);
  const cs = getComputedStyle(pin);
  places.set(id, {
    id, pin, item,
    x: parseFloat(cs.getPropertyValue('--x')), y: parseFloat(cs.getPropertyValue('--y')),
    name: item.querySelector('.place__name').textContent.trim(),
    num: item.querySelector('.place__num').textContent.trim(),
    unit: item.querySelector('.place__unit').textContent.trim(),
    what: item.querySelector('.place__what').textContent.trim(),
    line: item.querySelector('.place__line').textContent.trim(),
    link: item.querySelector('.place__link'),
  });
}
// Reading order: top to bottom, and left to right for pins within 6 % of the map's height of each other.
const order = [...places.values()].sort((a, b) => (Math.abs(a.y - b.y) < 6 ? a.x - b.x : a.y - b.y));
order.forEach((p, i) => { p.pin.style.setProperty('--i', String(i)); group.append(p.pin); });

// Roving tabindex: the group is one tab stop, the last pin used.
let current = order[0];
function setCurrent(p) {
  current = p;
  for (const q of order) q.pin.tabIndex = q === p ? 0 : -1;
}
setCurrent(current);

// Three sources can ask for the card; the pointer wins while it is there, then keyboard focus, then the last click.
const src = { hover: null, focus: null, selected: null };
let suppressed = null;   // a place Escape closed while focus stays on its pin
let hoverTimer = 0;
let hideTimer = 0;
const state = { shown: null, side: null, opens: 0, entered: 0 };

function shownId() {
  // Focus inside the card holds it on its place, whatever the pointer does elsewhere.
  if (card.contains(document.activeElement) && state.shown) return state.shown;
  for (const k of ['hover', 'focus', 'selected']) if (src[k] && src[k] !== suppressed) return src[k];
  return null;
}

function fill(p) {
  delete card.dataset.empty;
  slot('name').textContent = p.name;
  slot('num').textContent = p.num;
  slot('unit').textContent = p.unit;
  slot('what').textContent = p.what;
  slot('line').textContent = p.line;
  const a = slot('link');
  a.textContent = p.link.textContent;
  a.href = p.link.getAttribute('href');
  for (const k of ['fig', 'line', 'link']) slot(k).hidden = false;
}
function empty() {
  card.dataset.empty = '';
  slot('name').textContent = 'Choose a pin or a place below';
  for (const k of ['fig', 'line', 'link']) slot(k).hidden = true;
}

// Float the card beside its pin, inside the map: above the pin when it fits, otherwise below, clamped to the edges.
function position(p) {
  if (docked.matches) { card.style.transform = ''; delete card.dataset.side; return; }
  const W = map.clientWidth, H = map.clientHeight;
  const px = (p.x / 100) * W, py = (p.y / 100) * H;
  const cw = card.offsetWidth, ch = card.offsetHeight;
  let side = 'above';
  let top = py - GAP - ch;
  if (top < PAD) { side = 'below'; top = py + GAP; }
  top = Math.min(Math.max(PAD, top), H - PAD - ch);
  const left = Math.min(Math.max(PAD, px - cw / 2), W - PAD - cw);
  card.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
  card.style.setProperty('--tick', `${Math.round(Math.min(Math.max(px - left, 18), cw - 18))}px`);
  card.dataset.side = side;
  state.side = side;
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
    if (docked.matches) { empty(); card.hidden = false; card.dataset.state = 'open'; return; }
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

// Pointer: a mouse over a pin or a list entry asks for its place; leaving it lets go after a short grace.
function hoverOn(id) { clearTimeout(hoverTimer); if (src.hover !== id) { src.hover = id; suppressed = null; render(); } }
function hoverOff() { clearTimeout(hoverTimer); hoverTimer = setTimeout(() => { src.hover = null; render(); }, GRACE); }
const mouse = (e) => e.pointerType === 'mouse';
for (const p of places.values()) {
  p.pin.addEventListener('pointerenter', (e) => { if (mouse(e)) hoverOn(p.id); });
  p.pin.addEventListener('pointerleave', (e) => { if (mouse(e)) hoverOff(); });
  p.item.addEventListener('pointerenter', (e) => { if (mouse(e)) hoverOn(p.id); });
  p.item.addEventListener('pointerleave', (e) => { if (mouse(e)) hoverOff(); });
  p.pin.addEventListener('click', () => { src.selected = p.id; suppressed = null; render(); });
}
card.addEventListener('pointerenter', (e) => { if (mouse(e)) clearTimeout(hoverTimer); });
card.addEventListener('pointerleave', (e) => { if (mouse(e) && src.hover) hoverOff(); });

// The list's own control selects its place, says so, and brings the map into view when it is off screen.
for (const btn of document.querySelectorAll('[data-show]')) {
  btn.addEventListener('click', () => {
    const p = places.get(btn.dataset.show);
    src.selected = p.id;
    suppressed = null;
    render();
    status.textContent = `${p.name} shown on the map.`;
    const r = map.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight * 0.6) figure.scrollIntoView({ block: 'start', behavior: tier === 'full' ? 'smooth' : 'auto' });
  });
}
// A press anywhere else lets go of the last click.
document.addEventListener('pointerdown', (e) => {
  if (src.selected && !e.target.closest('.pin, [data-card], [data-show]')) { src.selected = null; render(); }
});

// Keyboard focus: a pin or a list entry holding focus asks for its place; the card keeps what it shows.
document.addEventListener('focusin', (e) => {
  const t = e.target;
  if (card.contains(t)) return;
  const pin = t.closest?.('.pin');
  const item = pin ? null : t.closest?.('.place');
  const id = pin?.dataset.place ?? item?.dataset.place ?? null;
  if (pin) setCurrent(places.get(id));
  if (id !== suppressed) suppressed = null;
  src.focus = id;
  render();
});
document.addEventListener('focusout', (e) => { if (!e.relatedTarget) { src.focus = null; render(); } });

// Arrow keys rove in reading order (wrapping), Home and End jump; Escape closes the card, from a pin or from inside it.
const KEYS = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
group.addEventListener('keydown', (e) => {
  let to = null;
  const i = order.indexOf(current);
  const rtl = getComputedStyle(group).direction === 'rtl' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight');
  if (e.key in KEYS) to = order[(i + KEYS[e.key] * (rtl ? -1 : 1) + order.length) % order.length];
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
  src.hover = null;
  src.selected = null;
  if (fromCard) { setCurrent(p); p.pin.focus(); }
  suppressed = src.focus;
  render();
});

// Entrance: pins drop in one by one, in reading order, the first time the map is a third in view (full tier only).
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

// Layout changes (a narrower window, the phone breakpoint, longer text) re-place or re-dock the card.
new ResizeObserver(() => { if (state.shown) position(places.get(state.shown)); }).observe(map);
docked.addEventListener('change', () => { card.style.transform = ''; render(); });
render();

awards.addState(() => ({
  motion: tier,
  enter: figure.dataset.enter ?? null,
  shown: state.shown,
  side: state.side,
  opens: state.opens,
  docked: docked.matches,
  hover: src.hover,
  focus: src.focus,
  selected: src.selected,
  current: current.id,
  order: order.map((p) => p.id),
  cardHidden: card.hidden,
  cardState: card.dataset.state ?? null,
  status: status.textContent,
}));
awards.ready();
