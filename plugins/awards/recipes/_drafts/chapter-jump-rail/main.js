import gsap from 'gsap';
import Lenis from 'lenis';
import { awards } from '../../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// A chapter jump rail that is also a scrollspy. One <nav> of real chapter links: the current one (aria-current) is the
// chapter whose midpoint is nearest the viewport centre, a rule under each name fills with the reading position, and a
// jump glides with lenis.scrollTo and lands with focus on the chapter heading, which is what a screen reader then reads.
// Below 900 px the same list sits behind a sticky ticket naming the current chapter, opened as a disclosure.

syncMotionTierAttribute();
let tier = motionTier();

// One clock: Lenis 1.3 has autoRaf: false, so the GSAP ticker drives it (as in boot-lenis-gsap).
const lenis = new Lenis({ lerp: 0.1, autoRaf: false, smoothWheel: tier === 'full' });
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

const JUMP_S = 1.2;            // s, a jump's glide in the full tier (Lenis' default expo-out curve)
const CHECK_S = 1.8;           // s after the start, then again every 1.8 s: a jump that has not landed is looked at
const DOCK_S = 0.5;            // s, the glide that docks the phone ticket at the top before its list opens
const NARROW = matchMedia('(max-width: 899.98px)');   // below this the rail becomes the ticket
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

const nav = document.querySelector('[data-rail]');
const body = nav.querySelector('[data-rail-body]');
const links = [...nav.querySelectorAll('[data-link]')];
const fills = links.map((a) => a.querySelector('[data-fill]'));
const marker = nav.querySelector('[data-marker]');
const ticket = nav.querySelector('[data-ticket]');
const ticketPre = nav.querySelector('[data-ticket-pre]');
const ticketCount = nav.querySelector('[data-ticket-count]');
const ticketName = nav.querySelector('[data-ticket-name]');
const ticketFill = nav.querySelector('[data-ticket-fill]');
const chapters = [...document.querySelectorAll('[data-chapter]')];
const n = chapters.length;

const state = {
  current: -1, scrollIndex: -1, progress: 0, jumping: null, jumps: 0, landed: 0, cancelled: 0, released: 0,
  lastJumpMs: -1, changes: [], open: false, docked: 0, markerWrites: 0, updates: 0, ticketWrites: 0,
};
let geo = [];          // each chapter's document top and height, measured on layout changes only
const fillValue = links.map(() => -1);
let ticketValue = -1;
let glide = null;      // the userData object of the jump's own Lenis glide, so it can be told from any other scroll

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
// The ticket's rule repeats the current chapter's fill; it is written only while the ticket shows, and only on change.
function setTicketFill(v) {
  if (!NARROW.matches || Math.abs(ticketValue - v) < 0.001) return;
  ticketValue = v;
  state.ticketWrites++;
  ticketFill.style.transform = `scaleX(${v.toFixed(4)})`;
}

// Fills follow the scroll position always; the current chapter follows it too, except during a jump, when it is
// already the destination (the rail answers at the start of the jump, not the end). One source calls this: Lenis'
// scroll event, which it emits for its own frames and for native scrolls alike.
function update() {
  state.updates++;
  const y = window.scrollY;
  const idx = pick(y);
  state.scrollIndex = idx;
  state.progress = idx >= 0 && idx < n ? progressIn(idx, y) : idx === n ? 1 : 0;
  links.forEach((_, j) => setFill(j, j < idx ? 1 : j === idx ? state.progress : 0));
  if (state.jumping === null) setCurrent(idx >= 0 && idx < n ? idx : -1);
  const cur = state.current;
  setTicketFill(cur >= 0 ? fillValue[cur] : idx === n ? 1 : 0);
}

function setCurrent(i) {
  if (i === state.current) return;
  const from = state.current;
  state.current = i;
  state.changes.push(i);
  if (state.changes.length > 40) state.changes.shift();
  links.forEach((a, j) => (j === i ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  ticketPre.hidden = i < 0;
  ticketCount.textContent = i >= 0 ? `${i + 1} of ${n}` : `${n} stages`;
  ticketName.textContent = i >= 0 ? chapters[i].dataset.short : 'Contents';
  placeMarker(from < 0);
}

// The marker is one bar on the list's track, moved by a written transform; CSS gives it the routine band (.4 s) in
// the full tier and no transition under reduced motion. Appearing from nothing it cuts, then fades in.
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

// True while Lenis is still running this jump's own glide (a wheel step or another scrollTo replaces its userData).
const glideRunning = () => glide !== null && lenis.isScrolling === 'smooth' && lenis.userData === glide;

let checkTimer = 0;
function jump(i) {
  const target = chapters[i];
  // A jump from the open phone list hides the focused link; focus waits on the ticket for the glide, not on <body>.
  closePanel(state.open && nav.contains(document.activeElement));
  clearTimeout(checkTimer);
  // Adopt a native scroll Lenis has not heard about yet (focus scrolling a link into view, find-in-page, a test
  // driver): Lenis measures the target from its own scroll value, which would otherwise be stale by that distance.
  if (lenis.isScrolling !== 'smooth') lenis.resize();
  state.jumping = i;
  state.jumps++;
  setCurrent(i);
  const t0 = performance.now();
  const own = { chapter: i };
  glide = own;
  const land = () => {
    if (state.jumping !== i || glide !== own) return;
    clearTimeout(checkTimer);
    state.jumping = null;
    glide = null;
    state.landed++;
    state.lastJumpMs = Math.round(performance.now() - t0);
    update();
    // The focus move is the announcement: a screen reader reads "Stage 5, Along the weirs…, heading level 2".
    target.querySelector('h2').focus({ preventScroll: true });
    // Replaced, not pushed: the address names the chapter the reader is on, and Back leaves the guide rather than
    // replaying every jump (a pushed hash written after the glide would also restore the destination, not the start).
    history.replaceState(null, '', `#${target.id}`);
  };
  // Lenis reads the target's scroll-margin-top, so the phone's sticky ticket never covers the heading.
  lenis.scrollTo(target, { duration: JUMP_S, immediate: tier !== 'full', force: true, onComplete: land, userData: own });
  if (state.jumping === i) check(i, own);
}

// A jump that has not landed by the check is waited for while its glide still runs (a stalled main thread, a
// background tab where frames pause and timers do not); one whose glide something else replaced is let go.
function check(i, own) {
  checkTimer = setTimeout(() => {
    if (state.jumping !== i || glide !== own) return;
    if (glideRunning()) { check(i, own); return; }
    state.jumping = null;
    glide = null;
    state.released++;
    update();
  }, CHECK_S * 1000);
}

// A drag, a wheel or a scrolling key during a glide hands the page back to the reader: the glide stops where it is,
// with no focus move and no hash. A plain tap does not count. Lenis has already taken a wheel step over (its own
// listener runs first), so only a glide that is still running is stopped here.
function cancelJump() {
  if (state.jumping === null) return;
  if (glideRunning()) { lenis.stop(); lenis.start(); }   // both reset Lenis, which ends the glide's animation
  state.jumping = null;
  glide = null;
  state.cancelled++;
  clearTimeout(checkTimer);
  update();
}
addEventListener('wheel', cancelJump, { passive: true });
addEventListener('touchmove', cancelJump, { passive: true });
addEventListener('keydown', (e) => {
  if (!SCROLL_KEYS.has(e.key) || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target instanceof Element ? e.target : null;
  if (t?.closest('input, textarea, select, [contenteditable]') || (e.key === ' ' && t?.closest('button'))) return;
  cancelJump();
});

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
  cancelJump();   // asking for the list mid-glide stops the glide, so the landing does not take focus out of the list
  // Not docked yet (on the first screen, or pushed up by the page's end): dock it first, or the list opens off-screen.
  const offset = nav.getBoundingClientRect().top;
  if (Math.abs(offset) > 0.5) {
    if (lenis.isScrolling !== 'smooth') lenis.resize();
    lenis.scrollTo(nav, { duration: DOCK_S, immediate: tier !== 'full', force: true });
    state.docked++;
  }
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
NARROW.addEventListener('change', () => { closePanel(false); ticketValue = -1; measure(); });

lenis.on('scroll', update);
addEventListener('resize', measure);
new ResizeObserver(measure).observe(document.querySelector('.guide'));
onMotionTierChange((t) => { tier = t; lenis.options.smoothWheel = t === 'full'; });

await document.fonts.ready;
measure();
// A deep link lands on its chapter without a glide and without moving focus (nothing was asked of the page yet).
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
  ticketFill: Number(Math.max(0, ticketValue).toFixed(4)),
  jumping: state.jumping,
  glideRunning: glideRunning(),
  jumps: state.jumps,
  landed: state.landed,
  cancelled: state.cancelled,
  released: state.released,
  lastJumpMs: state.lastJumpMs,
  changes: [...state.changes],
  open: state.open,
  docked: state.docked,
  markerWrites: state.markerWrites,
  updates: state.updates,
  ticketWrites: state.ticketWrites,
}));
awards.ready();
