import { gsap } from 'gsap';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ROUTES } from './routes.js';

// One curtain for the arrival and every route: a grid of cells that grow from hairlines into solid bars, swept from
// the far corner, so the page seems to weave shut and open again. The arrival gate waits for real loads but never
// past a ceiling; a route change saves the scroll of the page it leaves, restores it only on back and forward, moves
// focus to the new heading and names the page in the title.

syncMotionTierAttribute();
const tier = motionTier();
const curtain = document.querySelector('[data-curtain]');
const grid = curtain.querySelector('[data-cells]');
const readout = curtain.querySelector('[data-gate-readout]');
const status = document.querySelector('[data-route-status]');
const container = document.querySelector('[data-container]');
const PAGES = { home: { title: 'Valley', html: container.innerHTML }, ...ROUTES };
const params = new URLSearchParams(location.search);
const KEY = 'dither-cell-transition:visited';

// This recipe's own values, not a site's.
const CELL = { w: 72, h: 75 };                          // target cell size in CSS px; the grid is rebuilt to fit
const SWEEP = { cell: 0.4, each: 0.02, ease: 'power3.inOut' };   // about 0.8 s a half on a desktop grid
const GATE = { minFirst: 900, minRepeat: 250, ceiling: 4000 };
const FADE = 0.2;                                       // reduced motion: the cover fades instead of weaving

const state = { motion: tier, route: 'home', phase: 'arrival', gate: null, cols: 0, rows: 0, transitions: 0, restored: null, repeat: false, coveredAtSwap: null, lastMs: null };

function build() {
  const cols = Math.max(4, Math.round(innerWidth / CELL.w));
  const rows = Math.max(4, Math.round(innerHeight / CELL.h));
  if (cols === state.cols && rows === state.rows) return;
  state.cols = cols; state.rows = rows;
  grid.style.setProperty('--cols', cols);
  grid.style.setProperty('--rows', rows);
  grid.replaceChildren(...Array.from({ length: cols * rows }, () => document.createElement('i')));
}
build();
addEventListener('resize', () => { if (state.phase === 'idle') build(); });

const cells = () => grid.children;

// Covering: every cell grows from a hairline to its full width, swept from the bottom-right corner (DOM order is
// row by row, so GSAP's grid is [rows, cols]). Uncovering runs the same sweep the other way.
function cover() {
  curtain.hidden = false;
  if (tier !== 'full') return gsap.fromTo(curtain, { opacity: 0 }, { opacity: 1, duration: tier === 'static' ? 0 : FADE });
  gsap.set(curtain, { opacity: 1 });
  return gsap.fromTo(cells(), { scaleX: 0 }, { scaleX: 1, duration: SWEEP.cell, ease: SWEEP.ease, stagger: { each: SWEEP.each, from: 'end', grid: [state.rows, state.cols] } });
}
function uncover() {
  const done = () => { curtain.hidden = true; };
  if (tier !== 'full') return gsap.to(curtain, { opacity: 0, duration: tier === 'static' ? 0 : FADE, onComplete: done });
  return gsap.to(cells(), { scaleX: 0, duration: SWEEP.cell, ease: SWEEP.ease, stagger: { each: SWEEP.each, from: 'end', grid: [state.rows, state.cols] }, onComplete: done });
}

// The arrival gate: real promises (fonts, the decode of every image on the page), a minimum hold so the curtain
// reads, and a ceiling so a stalled request can never keep the page shut.
async function gate() {
  let repeat = false;
  try { repeat = sessionStorage.getItem(KEY) === '1'; sessionStorage.setItem(KEY, '1'); } catch {}
  state.repeat = repeat;
  const t0 = performance.now();
  const loads = [document.fonts?.ready ?? Promise.resolve(), ...[...document.images].map((img) => img.decode().catch(() => {}))];
  let hang = params.has('hang');
  try { hang ||= sessionStorage.getItem('dither-cell-transition:hang') === '1'; } catch {}
  if (hang) loads.push(new Promise(() => {}));               // verification: a request that never answers
  let done = 0;
  const show = () => { readout.textContent = `${Math.round((done / loads.length) * 100)}%`; };
  show();
  loads.forEach((p) => p.then(() => { done++; show(); }));
  const all = Promise.all(loads).then(() => 'loaded');
  const ceiling = new Promise((r) => setTimeout(() => r('ceiling'), GATE.ceiling));
  const min = new Promise((r) => setTimeout(r, repeat ? GATE.minRepeat : GATE.minFirst));
  const outcome = await Promise.race([all, ceiling]);
  await min;
  state.gate = { outcome, ms: Math.round(performance.now() - t0), loads: loads.length, done };
}

// Only the current page is in the document: the next one replaces it while the curtain is shut.
function show(route, { restore = false } = {}) {
  const key = PAGES[route] ? route : 'home';
  if (key !== state.route) container.innerHTML = PAGES[key].html;
  state.route = key;
  document.title = `${PAGES[key].title} — dither-cell-transition`;
  for (const a of document.querySelectorAll('[data-nav]')) { if (a.getAttribute('href') === `#/${key}`) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }
  let saved = null;
  if (restore) { try { saved = Number(sessionStorage.getItem(`scroll:${key}`)); } catch {} }
  state.restored = restore && saved ? saved : null;
  window.scrollTo(0, restore && saved ? saved : 0);
}

let busy = Promise.resolve();
function go(route, { restore = false } = {}) {
  busy = busy.then(async () => {
    if (route === state.route) return;
    const t0 = performance.now();
    state.phase = 'leaving';
    try { sessionStorage.setItem(`scroll:${state.route}`, String(Math.round(scrollY))); } catch {}
    await cover();
    // The swap happens only behind a shut curtain: record how much of it was shut at that moment.
    state.coveredAtSwap = tier === 'full' ? [...cells()].filter((c) => Number(gsap.getProperty(c, 'scaleX')) > 0.99).length / cells().length : Number(gsap.getProperty(curtain, 'opacity'));
    show(route, { restore });
    state.phase = 'entering';
    await uncover();
    state.phase = 'idle';
    state.transitions++;
    state.lastMs = Math.round(performance.now() - t0);
    const h = container.querySelector('h1');
    h.focus({ preventScroll: true });
    status.textContent = `${document.title.split(' — ')[0]} page`;
  });
  return busy;
}

const routeOf = () => (location.hash.replace(/^#\/?/, '') || 'home');
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-nav]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  e.preventDefault();
  const route = a.getAttribute('href').replace(/^#\/?/, '');
  if (route === state.route) return;
  history.pushState(null, '', `#/${route}`);
  go(route);
});
// Back and forward restore the scroll the page was left at; a fresh visit to a route starts at the top.
addEventListener('popstate', () => go(routeOf(), { restore: true }));

async function arrive() {
  if (tier === 'full') gsap.set(cells(), { scaleX: 1 });
  curtain.hidden = false;
  curtain.dataset.ready = '';
  show(routeOf());
  await gate();
  readout.hidden = true;                                // the percentage belongs to the arrival only
  state.phase = 'entering';
  await uncover();
  state.phase = 'idle';
  awards.ready();
}

window.__curtain = { go: (r) => go(r), get phase() { return state.phase; } };
awards.addState(() => ({
  ...state,
  curtainHidden: curtain.hidden,
  cells: cells().length,
  focused: document.activeElement?.tagName?.toLowerCase() ?? null,
  title: document.title,
  scrollY: Math.round(scrollY),
}));
arrive();
