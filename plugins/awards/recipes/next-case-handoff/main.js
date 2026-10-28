import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker } from '../_shared/raf.js';

// Each case closes on the next case's hero: the same geometry, clipped under a "Next case" label, its card hinged on
// a scrub. Following it (full tier) lifts that frame to the top of the viewport while the card unwinds, then swaps the
// page's <main> for the next page's and moves the frame's live media node (a canvas standing in for a film) into the
// new hero, so the picture never restarts. Every link is a real link: reduced motion, static, a failed fetch or a
// browser without the History API simply navigate.

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();
const tier = motionTier();
const full = tier === 'full';

const RISE = 1;              // s, the lift and the unwind, expo out
const ENTER_DELAY = 0.25;    // s, the hero card's own entrance on a normal load (full tier)

// ---- Plates: a canvas per hero and per footer frame, painting slow bands in its own hue. The painter lives on the
// element, so a moved canvas keeps its frame count and pixels. ----------------------------------------------------
let plateSeq = 0;
const painters = new Set();
function painter(canvas) {
  if (canvas.__painter) return canvas.__painter;
  const p = { id: ++plateSeq, canvas, ctx: canvas.getContext('2d'), hue: Number(canvas.dataset.hue) || 0, frame: 0, visible: true, w: 0, h: 0 };
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (w !== p.w || h !== p.h) { canvas.width = p.w = w; canvas.height = p.h = h; draw(p); }
  };
  new ResizeObserver(size).observe(canvas);
  new IntersectionObserver(([e]) => { p.visible = e.isIntersecting; }).observe(canvas);
  canvas.__painter = p;
  painters.add(p);
  size();
  return p;
}
function draw(p) {
  const { ctx, w, h, hue } = p;
  if (!w || !h) return;
  const t = p.frame * 0.004;
  ctx.fillStyle = `hsl(${hue} 30% 12%)`;
  ctx.fillRect(0, 0, w, h);
  const bands = 9;
  for (let i = 0; i < bands; i++) {
    const x = ((i / bands + t) % 1) * w * 1.6 - w * 0.3;
    ctx.fillStyle = `hsl(${hue + i * 5} ${36 + (i % 3) * 8}% ${24 + (i % 4) * 9}% / .85)`;
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x + w * 0.12, 0); ctx.lineTo(x - w * 0.18, h); ctx.lineTo(x - w * 0.3, h);
    ctx.fill();
  }
}
if (full) {
  ticker.add(() => {
    for (const p of painters) {
      if (!p.canvas.isConnected) { painters.delete(p); continue; } // a swapped-out page's plates
      if (!p.visible) continue;
      p.frame++;
      draw(p);
    }
  });
}

// ---- Per-page set-up and teardown (the module outlives every swapped <main>). -------------------------------------
let page = null;
function initPage({ seamless = false } = {}) {
  const main = document.querySelector('main');
  const ctx = gsap.context(() => {}, main);
  main.querySelectorAll('[data-plate]').forEach(painter);
  const heroCard = main.querySelector('[data-hero] [data-card]');
  const frame = main.querySelector('[data-next-frame]');
  const card = frame.querySelector('[data-card]');
  const link = main.querySelector('[data-next]');
  ctx.add(() => {
    if (!full) return;
    // The hero's own entrance only when the page did not arrive already in place.
    if (!seamless) gsap.from(heroCard, { yPercent: 30, rotation: 4, duration: 1, ease: 'expo.out', delay: ENTER_DELAY, clearProps: 'transform' });
    // The next case's card hinges on its top-right corner as the close scrolls in.
    gsap.fromTo(card, { rotation: -10, xPercent: -12, yPercent: 24 }, {
      rotation: -5, xPercent: -6, yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: frame, start: 'top bottom', end: 'max', scrub: 0.5, invalidateOnRefresh: true },
    });
  });
  const prefetchOnIntent = () => prefetch(link.href);
  link.addEventListener('pointerenter', prefetchOnIntent);
  link.addEventListener('focus', prefetchOnIntent);
  link.addEventListener('click', onNext);
  page = { main, ctx, frame, card, link, destroy() { ctx.revert(); link.removeEventListener('click', onNext); } };
  ScrollTrigger.refresh();
}

// ---- Fetching the next document (HTML only; its scripts never run, this module serves every page). ---------------
const cache = new Map();
function prefetch(href) {
  if (!cache.has(href)) cache.set(href, fetch(href).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); }).then((t) => new DOMParser().parseFromString(t, 'text/html')));
  return cache.get(href);
}

const state = { mode: 'load', handoffs: 0, liveId: null, frameAtClick: null, riseFrom: null, endRect: null, busy: false };
// The page on screen (path and query; a fragment is the same page), and a token per navigation: the newest wins, so a
// Back pressed during a lift cancels the hand-off instead of racing it.
let shown = location.pathname + location.search;
let nav = 0;

// Replace <main> with the next document's, optionally moving a live node into its hero, then reset scroll and focus.
function swap(doc, href, { live = null, push = true } = {}) {
  const next = document.importNode(doc.querySelector('main'), true);
  if (live) next.querySelector('[data-hero] [data-plate]').replaceWith(live);
  page?.destroy();
  window.scrollTo(0, 0);
  document.querySelector('main').replaceWith(next);
  document.title = doc.title;
  if (push) history.pushState({ href }, '', href);
  const u = new URL(href, location.href);
  shown = u.pathname + u.search;
  initPage({ seamless: !!live });
  next.querySelector('h1').focus({ preventScroll: true });
}

async function onNext(e) {
  if (!full || !('pushState' in history) || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  if (state.busy) return;
  state.busy = true;
  const my = ++nav;
  const href = page.link.href;
  const doc = prefetch(href);
  const { frame, card } = page;
  const plate = frame.querySelector('[data-plate]');
  state.liveId = painter(plate).id;
  state.frameAtClick = painter(plate).frame;
  // Lift the frame out of the clip: fixed at its own rect, above everything, then rise to the top while the card
  // unwinds on the same clock.
  ScrollTrigger.getAll().forEach((t) => t.trigger === frame && t.kill(false));
  const r = frame.getBoundingClientRect();
  state.riseFrom = Math.round(r.top);
  gsap.set(frame, { position: 'fixed', top: r.top, left: r.left, width: r.width, height: r.height, margin: 0 });
  frame.classList.add('is-lifting');
  try {
    await Promise.all([
      gsap.timeline()
        .to(frame, { y: -r.top, duration: RISE, ease: 'expo.out' }, 0)
        .to(card, { rotation: 0, xPercent: 0, yPercent: 0, duration: RISE, ease: 'expo.out' }, 0)
        .then(),
      doc,
    ]);
    if (my !== nav) return; // Back or Forward during the lift: that page is (being) swapped in instead
    const c = card.getBoundingClientRect();
    state.endRect = { x: Math.round(c.left), y: Math.round(c.top), w: Math.round(c.width) };
    swap(await doc, href, { live: plate });
    gsap.set(plate, { clearProps: 'all' });
    state.mode = 'handoff';
    state.handoffs++;
  } catch {
    if (my === nav) location.href = href; // a failed fetch still gets the reader there
  } finally {
    state.busy = false;
  }
}

// Back and forward after a hand-off: the plain swap, no lift. Only the full tier ever pushes an entry, so only it
// listens; and a traversal that keeps the page (the skip link's #main, any other fragment) is left to the browser,
// unless a pop or a lift is still in flight: then it takes a token too, so the stale one cannot land, and the page the
// URL names is swapped in again.
let popping = 0;
if (full) {
  addEventListener('popstate', async () => {
    if (location.pathname + location.search === shown && !popping && !state.busy) return;
    const my = ++nav;
    popping++;
    try {
      const doc = await prefetch(location.href.split('#')[0]);
      if (my !== nav) return;
      swap(doc, location.href, { push: false });
      state.mode = 'pop';
    } catch { if (my === nav) location.reload(); } finally { popping--; }
  });
  history.replaceState({ href: location.href }, '', location.href);
}

initPage();
if (!full) painters.forEach(draw); // one still frame per plate outside the full tier

awards.addState(() => {
  const main = document.querySelector('main');
  const hero = main.querySelector('[data-hero]');
  const heroPlate = hero.querySelector('[data-plate]');
  const nextCard = main.querySelector('[data-next-frame] [data-card]');
  const hc = hero.querySelector('[data-card]').getBoundingClientRect();
  const angle = (el) => { const m = new DOMMatrixReadOnly(getComputedStyle(el).transform); return Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI * 100) / 100; };
  return {
    motion: tier,
    ...state,
    page: main.dataset.page,
    path: location.pathname.split('/').pop() || 'index.html',
    h1: main.querySelector('h1')?.textContent ?? null,
    title: document.title,
    mains: document.querySelectorAll('main').length,
    heroes: document.querySelectorAll('[data-hero]').length,
    heroPlateId: heroPlate.__painter?.id ?? null,
    heroPlateFrame: heroPlate.__painter?.frame ?? null,
    heroCardRect: { x: Math.round(hc.left), y: Math.round(hc.top), w: Math.round(hc.width) },
    nextAngle: angle(nextCard),
    nextHref: main.querySelector('[data-next]').getAttribute('href'),
    focus: document.activeElement?.tagName?.toLowerCase() ?? null,
    scrollY: Math.round(scrollY),
  };
});
awards.ready();
