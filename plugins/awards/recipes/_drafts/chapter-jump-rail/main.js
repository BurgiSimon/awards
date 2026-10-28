import gsap from 'gsap';
import Lenis from 'lenis';
import { awards } from '../../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// A chapter jump rail that is also a scrollspy. One <nav> of real chapter links: the current one (aria-current) is the
// chapter whose midpoint is nearest the viewport centre, a rule under each name fills with the reading position, a jump
// glides with lenis.scrollTo and lands with focus on the chapter heading and one polite announcement. Below 900 px the
// same list sits behind a sticky ticket naming the current chapter, opened as a disclosure.

syncMotionTierAttribute();
let tier = motionTier();

// One clock: Lenis 1.3 has autoRaf: false, so the GSAP ticker drives it (as in boot-lenis-gsap).
const lenis = new Lenis({ lerp: 0.1, autoRaf: false, smoothWheel: tier === 'full' });
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

const JUMP_S = 1.2;            // s, a jump's glide in the full tier (Lenis' default expo-out curve)
const RELEASE_PAD = 0.6;       // s past the glide after which a jump that never completed lets go
const NARROW = matchMedia('(max-width: 899.98px)');   // below this the rail becomes the ticket

const nav = document.querySelector('[data-rail]');
const body = nav.querySelector('[data-rail-body]');
const links = [...nav.querySelectorAll('[data-link]')];
const fills = links.map((a) => a.querySelector('[data-fill]'));
const marker = nav.querySelector('[data-marker]');
const ticket = nav.querySelector('[data-ticket]');
const ticketNum = nav.querySelector('[data-ticket-num]');
const ticketName = nav.querySelector('[data-ticket-name]');
const ticketFill = nav.querySelector('[data-ticket-fill]');
const announcer = document.querySelector('[data-announcer]');
const chapters = [...document.querySelectorAll('[data-chapter]')];
const n = chapters.length;

const state = {
  current: -1, scrollIndex: -1, progress: 0, jumping: null, jumps: 0, landed: 0, cancelled: 0,
  lastJumpMs: -1, announced: '', announcements: 0, changes: [], open: false, markerWrites: 0,
};
let geo = [];          // each chapter's document top and height, measured on layout changes only
const fillValue = links.map(() => -1);

nav.dataset.enhanced = '';   // CSS collapses the list behind the ticket only once this script runs

function measure() {
  const y = window.scrollY;
  geo = chapters.map((c) => { const r = c.getBoundingClientRect(); return { top: r.top + y, height: r.height }; });
  update();
  placeMarker(true);
}

// The chapter whose midpoint is nearest the viewport centre; -1 above the first chapter, n below the last.
function pick(y) {
  const centre = y + innerHeight / 2;
  if (!geo.length || centre < geo[0].top) return -1;
  const last = geo[n - 1];
  if (centre > last.top + last.height) return n;
  let best = 0;
  let bestD = Infinity;
  geo.forEach((g, i) => { const d = Math.abs(g.top + g.height / 2 - centre); if (d < bestD) { bestD = d; best = i; } });
  return best;
}
const progressIn = (i, y) => {
  const g = geo[i];
  return g ? Math.min(1, Math.max(0, (y + innerHeight / 2 - g.top) / g.height)) : 0;
};

function setFill(j, v) {
  if (Math.abs(fillValue[j] - v) < 0.001) return;
  fillValue[j] = v;
  fills[j].style.transform = `scaleX(${v.toFixed(4)})`;
}

// Fills follow the scroll position always; the current chapter follows it too, except during a jump, when it is
// already the destination (the rail answers at the start of the jump, not the end).
function update() {
  const y = window.scrollY;
  const idx = pick(y);
  state.scrollIndex = idx;
  state.progress = idx >= 0 && idx < n ? progressIn(idx, y) : idx === n ? 1 : 0;
  links.forEach((_, j) => setFill(j, j < idx ? 1 : j === idx ? state.progress : 0));
  if (state.jumping === null) setCurrent(idx >= 0 && idx < n ? idx : -1);
  const cur = state.current;
  ticketFill.style.transform = `scaleX(${(cur >= 0 ? fillValue[cur] : idx === n ? 1 : 0).toFixed(4)})`;
}

function setCurrent(i) {
  if (i === state.current) return;
  const from = state.current;
  state.current = i;
  state.changes.push(i);
  if (state.changes.length > 40) state.changes.shift();
  links.forEach((a, j) => (j === i ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  ticketNum.textContent = i >= 0 ? `${i + 1} of ${n}` : `${n} stages`;
  ticketName.textContent = i >= 0 ? chapters[i].dataset.short : 'Contents';
  placeMarker(from < 0);
}

// The marker is one bar beside the list, moved by a written transform; CSS gives it the routine band (.4 s) in the
// full tier and no transition under reduced motion. Appearing from nothing it cuts, then fades in.
function placeMarker(cut) {
  const a = links[state.current];
  if (!a || !a.offsetParent) { marker.classList.remove('is-on'); return; }
  const top = a.getBoundingClientRect().top - body.getBoundingClientRect().top;
  if (cut) marker.classList.add('is-cut');
  marker.style.height = `${a.offsetHeight}px`;
  marker.style.transform = `translate3d(0, ${top.toFixed(1)}px, 0)`;
  marker.classList.add('is-on');
  state.markerWrites++;
  if (cut) { void marker.offsetWidth; marker.classList.remove('is-cut'); }
}

function announce(text) {
  state.announced = text;
  state.announcements++;
  announcer.textContent = '';
  setTimeout(() => { announcer.textContent = text; }, 60); // a fresh node change, so the same chapter twice is read twice
}

let releaseTimer = 0;
function jump(i) {
  const target = chapters[i];
  closePanel(false);
  clearTimeout(releaseTimer);
  // Adopt a native scroll Lenis has not heard about yet (focus scrolling a link into view, find-in-page, a test
  // driver): Lenis measures the target from its own scroll value, which would otherwise be stale by that distance.
  if (lenis.isScrolling !== 'smooth') lenis.resize();
  state.jumping = i;
  state.jumps++;
  setCurrent(i);
  const t0 = performance.now();
  const land = () => {
    if (state.jumping !== i) return;
    clearTimeout(releaseTimer);
    state.jumping = null;
    state.landed++;
    state.lastJumpMs = Math.round(performance.now() - t0);
    update();
    target.querySelector('h2').focus({ preventScroll: true });
    announce(`Stage ${i + 1} of ${n}: ${target.querySelector('h2').textContent.replace(/^Stage \d+\s*/, '')}`);
    history.replaceState(null, '', `#${target.id}`);
  };
  const instant = tier !== 'full';
  // Lenis reads the target's scroll-margin-top, so the phone's sticky ticket never covers the heading.
  lenis.scrollTo(target, { duration: JUMP_S, immediate: instant, force: true, onComplete: land });
  if (state.jumping === i) releaseTimer = setTimeout(() => { if (state.jumping === i) { state.jumping = null; update(); } }, (JUMP_S + RELEASE_PAD) * 1000);
}

// A wheel, a touch or a scrolling key during a glide hands the page back to the reader: no focus move, no announcement.
function cancelJump() {
  if (state.jumping === null) return;
  state.jumping = null;
  state.cancelled++;
  clearTimeout(releaseTimer);
  update();
}
addEventListener('wheel', cancelJump, { passive: true });
addEventListener('touchstart', cancelJump, { passive: true });
addEventListener('keydown', (e) => { if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) cancelJump(); });

// Every in-page link to a chapter (the rail, the "continue" links) jumps the same way; modified clicks stay native.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#stage-"]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const i = chapters.findIndex((c) => `#${c.id}` === a.getAttribute('href'));
  if (i < 0) return;
  e.preventDefault();
  jump(i);
});

// The phone ticket: a disclosure over the same list, so the nav model is one model on every device.
function openPanel() {
  nav.dataset.open = '';
  body.setAttribute('data-lenis-prevent', '');   // the open list scrolls natively, the page stays put
  ticket.setAttribute('aria-expanded', 'true');
  state.open = true;
  placeMarker(true);
}
function closePanel(returnFocus) {
  if (!state.open) return;
  delete nav.dataset.open;
  body.removeAttribute('data-lenis-prevent');
  ticket.setAttribute('aria-expanded', 'false');
  state.open = false;
  if (returnFocus) ticket.focus();
}
ticket.addEventListener('click', () => (state.open ? closePanel(false) : openPanel()));
nav.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.open) { e.preventDefault(); closePanel(true); } });
nav.addEventListener('focusout', (e) => { if (state.open && e.relatedTarget && !nav.contains(e.relatedTarget)) closePanel(false); });
document.addEventListener('pointerdown', (e) => { if (state.open && !nav.contains(e.target)) closePanel(false); });
NARROW.addEventListener('change', () => { closePanel(false); measure(); });

lenis.on('scroll', update);
addEventListener('scroll', update, { passive: true });
addEventListener('resize', measure);
new ResizeObserver(measure).observe(document.querySelector('.guide'));
onMotionTierChange((t) => { tier = t; lenis.options.smoothWheel = t === 'full'; });

await document.fonts.ready;
measure();
// A deep link lands on its chapter without a glide and without an announcement (nothing was asked of the page yet).
const deep = chapters.findIndex((c) => `#${c.id}` === location.hash);
if (deep >= 0) { lenis.scrollTo(chapters[deep], { immediate: true, force: true }); update(); }

awards.addState(() => ({
  motion: tier,
  narrow: NARROW.matches,
  current: state.current,
  currentId: chapters[state.current]?.id ?? null,
  scrollIndex: state.scrollIndex,
  progress: Number(state.progress.toFixed(4)),
  fills: fillValue.map((v) => Number(Math.max(0, v).toFixed(4))),
  jumping: state.jumping,
  jumps: state.jumps,
  landed: state.landed,
  cancelled: state.cancelled,
  lastJumpMs: state.lastJumpMs,
  announced: state.announced,
  announcements: state.announcements,
  changes: [...state.changes],
  open: state.open,
  markerWrites: state.markerWrites,
}));
awards.ready();
