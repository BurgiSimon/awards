import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { CustomEase } from 'gsap/CustomEase';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

gsap.registerPlugin(Flip, CustomEase);
syncMotionTierAttribute();

const root = document.documentElement;
const list = document.querySelector('[data-works]');
const items = [...list.querySelectorAll('[data-work]')];
const viewButtons = [...document.querySelectorAll('[data-view]')].filter((b) => b.tagName === 'BUTTON');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const status = document.querySelector('[data-status]');
const dialog = document.querySelector('[data-detail]');
const ground = dialog.querySelector('[data-detail-ground]');
const slot = dialog.querySelector('[data-detail-frame]');
const copy = dialog.querySelector('[data-detail-copy]');
const where = dialog.querySelector('[data-detail-where]');
const detailTitle = dialog.querySelector('[data-detail-title]');
const detailFacts = dialog.querySelector('[data-detail-facts]');
const detailText = dialog.querySelector('[data-detail-text]');

// Tokens live in style.css; this reads them into seconds and registers the curve once under the name "flip".
const seconds = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? (/ms\s*$/.test(v) ? n / 1000 : n) : 0; };
function readTokens() {
  const cs = getComputedStyle(root);
  const pts = (cs.getPropertyValue('--flip-ease').match(/-?\d*\.?\d+/g) || []).map(Number);
  const ease = pts.length === 4 ? (CustomEase.create('flip', pts.join(',')), 'flip') : 'power3.inOut';
  return { dur: seconds(cs.getPropertyValue('--flip-dur')), fade: seconds(cs.getPropertyValue('--flip-fade')), stagger: seconds(cs.getPropertyValue('--flip-stagger')), ease };
}
let T = readTokens();
onMotionTierChange(() => { T = readTokens(); });

const ui = { view: 'grid', filter: 'all', open: null };
const animations = new Set();
const log = [];
const animate = () => motionTier() === 'full';
const visible = () => items.filter((li) => !li.hidden);
const busy = () => { for (const a of animations) { if (a.progress() < 1) return true; animations.delete(a); } return false; };

// Every change is logged with whether it tweened, and the first frame after it records whether the page was already
// settled: in the reduced and static tiers it must be, in the full tier it must not.
function commit(kind, ...anims) {
  const entry = { kind, tier: motionTier(), tweened: anims.some(Boolean), duration: Math.max(0, ...anims.filter(Boolean).map((a) => a.duration())), settledNextFrame: null };
  anims.filter(Boolean).forEach((a) => animations.add(a));
  log.push(entry);
  if (log.length > 24) log.shift();
  requestAnimationFrame(() => { entry.settledNextFrame = !busy(); });
}

function press(buttons, key, value) {
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset[key] === value)));
}
function announce() {
  status.textContent = `${visible().length} of ${items.length} works, as a ${ui.view}`;
}
// Stagger by item, not by Flip target: a card and its parts share one delay, so the parts never trail their parent.
const byItem = (order) => (i, el) => (order.get(el.closest('[data-work]')) ?? 0) * T.stagger;

// 1 · Grid ↔ list. The item and its parts (frame, title, meta) are flipped together, so `nested` lets Flip account for
// the parent's travel when it places the children. A card that becomes a row changes aspect, so this Flip keeps scale off
// (width / height move instead, and text never squashes) and goes `absolute`, so one item's changing size cannot push its
// neighbours while they travel. With every item absolute the list would collapse: its end height is pinned until done.
function setView(next) {
  if (next === ui.view || ui.open) return;
  const shown = visible();
  const state = animate() ? Flip.getState(shown.flatMap((li) => [li, ...li.querySelectorAll('[data-part]')]), { props: 'borderTopColor' }) : null;
  ui.view = next;
  list.dataset.view = next;
  press(viewButtons, 'view', next);
  announce();
  if (!state) return commit('view', null);
  list.style.height = '';
  list.style.height = `${list.offsetHeight}px`;
  const tl = Flip.from(state, {
    duration: T.dur, ease: T.ease, nested: true, absolute: true,
    stagger: byItem(new Map(shown.map((li, i) => [li, i]))),
    onComplete: () => { list.style.height = ''; },
  });
  commit('view', tl);
}

// 2 · Filter. Items keep their size, so this Flip scales (transforms only). Leavers go absolute so the rest can take
// their places at once; they shrink and fade in onLeave while arrivals grow back in onEnter.
function setFilter(next) {
  if (next === ui.filter || ui.open) return;
  const state = animate() ? Flip.getState(items) : null;
  ui.filter = next;
  items.forEach((li) => { li.hidden = !(next === 'all' || li.dataset.discipline === next); });
  press(filterButtons, 'filter', next);
  announce();
  if (!state) { gsap.set(items, { clearProps: 'opacity,scale,transform' }); return commit('filter', null); }
  const tl = Flip.from(state, {
    duration: T.dur, ease: T.ease, scale: true, absoluteOnLeave: true,
    stagger: byItem(new Map(visible().map((li, i) => [li, i]))),
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: T.dur, ease: T.ease, stagger: T.stagger }),
    onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: T.fade, ease: 'power1.in' }),
    // Leavers are display: none again by now; clear what onLeave wrote so a later instant change shows them whole.
    onComplete: () => gsap.set(items.filter((li) => li.hidden), { clearProps: 'opacity,scale,transform' }),
  });
  commit('filter', tl);
}

// 3 · Detail. The plate itself moves: recorded in its card, reparented into the dialog's frame, flown there at
// `scale: true` (both frames are 4:3, so the scale is uniform). Closing fades the copy and the ground first, then
// puts the plate back in its card and flies it home over the page.
function fill(li) {
  const more = li.querySelector('[data-more]');
  where.textContent = li.querySelector('.work__meta').textContent;
  detailTitle.textContent = li.querySelector('.work__open').textContent;
  detailFacts.replaceChildren(...more.querySelector('dl').cloneNode(true).children);
  detailText.textContent = more.querySelector('p').textContent;
}

function openDetail(li, opener) {
  if (ui.open) return;
  const plate = li.querySelector('[data-plate]');
  ui.open = { id: li.dataset.work, li, opener, plate, home: plate.parentElement, closing: false };
  fill(li);
  const state = animate() ? Flip.getState(plate) : null;
  slot.append(plate);
  li.classList.add('is-open');
  dialog.showModal(); // focus moves to the dialog's first control
  if (!state) return commit('open', null);
  dialog.classList.add('is-flying');
  const tl = gsap.timeline({ onComplete: () => dialog.classList.remove('is-flying') });
  tl.fromTo(ground, { opacity: 0 }, { opacity: 1, duration: T.fade, ease: 'none' }, 0)
    .add(Flip.from(state, { duration: T.dur, ease: T.ease, scale: true }), 0)
    .from([...copy.children], { opacity: 0, y: 16, duration: T.dur * 0.6, ease: T.ease, stagger: T.stagger * 2 }, T.dur * 0.45);
  commit('open', tl);
}

function land() {
  const o = ui.open;
  const state = animate() && dialog.open ? Flip.getState(o.plate) : null;
  o.home.append(o.plate);
  if (dialog.open) dialog.close();
  gsap.set([ground, ...copy.children], { clearProps: 'opacity,transform' });
  dialog.classList.remove('is-flying');
  o.li.classList.remove('is-open');
  ui.open = null;
  o.opener.focus({ preventScroll: true }); // back on the button that opened it
  return state ? Flip.from(state, { duration: T.dur, ease: T.ease, scale: true, zIndex: 3 }) : null;
}

function closeDetail() {
  const o = ui.open;
  if (!o || o.closing) return;
  o.closing = true;
  if (!animate()) { land(); return commit('close', null); }
  dialog.classList.add('is-flying');
  const out = gsap.timeline();
  out.to([...copy.children], { opacity: 0, duration: T.fade, ease: 'power1.in' }, 0)
    .to(ground, { opacity: 0, duration: T.fade, ease: 'none' }, T.fade * 0.5);
  // The flight home is its own Flip, measured only once the plate is back in its card.
  out.eventCallback('onComplete', () => { const home = land(); if (home) animations.add(home); });
  commit('close', out);
}

viewButtons.forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
filterButtons.forEach((b) => b.addEventListener('click', () => setFilter(b.dataset.filter)));
items.forEach((li) => {
  const opener = li.querySelector('[data-open]');
  opener.addEventListener('click', () => openDetail(li, opener));
});
dialog.querySelector('[data-close]').addEventListener('click', closeDetail);
// Escape runs the authored close instead of the dialog's instant one.
dialog.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closeDetail(); } });
dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeDetail(); });
// Closed some other way (a form, the browser): settle at once so the plate is never left in the dialog.
dialog.addEventListener('close', () => { if (ui.open && !ui.open.closing) { ui.open.closing = true; land(); commit('close', null); } });

const describe = (el) => {
  if (!el || el === document.body) return 'body';
  if (el.matches('[data-open]')) return `work:${el.closest('[data-work]').dataset.work}`;
  if (el.matches('[data-close]')) return 'close';
  if (el.dataset.view) return `view:${el.dataset.view}`;
  if (el.dataset.filter) return `filter:${el.dataset.filter}`;
  return el.tagName.toLowerCase();
};

awards.addState(() => ({
  motion: motionTier(),
  view: ui.view,
  filter: ui.filter,
  shown: visible().length,
  total: items.length,
  open: dialog.open ? ui.open?.id ?? null : null,
  busy: busy(),
  focus: describe(document.activeElement),
  pressed: {
    view: viewButtons.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.view),
    filter: filterButtons.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.filter),
  },
  status: status.textContent,
  tokens: { ...T },
  log: log.map((e) => ({ ...e })),
}));

await document.fonts?.ready;
awards.ready();
