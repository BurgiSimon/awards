import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute, onMotionTierChange } from '../_shared/reduced-motion.js';

gsap.registerPlugin(Observer);
syncMotionTierAttribute();

const html = document.documentElement;
const stage = document.querySelector('[data-deck]');
const panels = [...stage.querySelectorAll('.panel')];
const controls = document.querySelector('[data-controls]');
const prevBtn = controls.querySelector('[data-prev]');
const nextBtn = controls.querySelector('[data-next]');
const ring = controls.querySelector('[data-ring]');
const arc = controls.querySelector('[data-arc]');
const counter = controls.querySelector('[data-counter]');
const live = document.querySelector('[data-live]');
const titles = panels.map((p) => p.querySelector('.panel__title').textContent.trim());
const N = panels.length;

const THRESHOLD = 500;  // summed |deltaY| px for one step
const IDLE = 1;         // s without wheel input before the ring drains
const LOCK = 900;       // ms the wheel is swallowed after a commit (covers the travel and trackpad inertia)
const SWIPE = 55;       // px of vertical finger travel for one step
const DUR = 0.9;        // s panel travel, expo.inOut

let index = 0;
let acc = 0, accDir = 0, fill = 0, lockUntil = 0;
let commits = 0, switches = 0;
let tl = null;
const visited = new Set([0]);
const pad = (n) => String(n).padStart(2, '0');

// Deck mode: the document stops scrolling; only the active panel is visible and reachable.
html.classList.add('deck');
controls.hidden = false;
panels.forEach((p, i) => { p.classList.toggle('is-active', i === 0); p.inert = i !== 0; });

function paintRing(f, dur) {
  fill = f;
  ring.setAttribute('aria-valuenow', String(Math.round(f * 100)));
  ring.setAttribute('aria-label', accDir < 0 ? 'Wheel toward previous panel' : 'Wheel toward next panel');
  // pathLength 1 puts the whole ring between 0 and 1 px of offset: autoRound off, or GSAP snaps it to empty / full.
  // Reduced / static: the ring still reports the sum, it just jumps instead of easing.
  if (motionTier() === 'full') gsap.to(arc, { strokeDashoffset: 1 - f, duration: dur, ease: 'power2.out', overwrite: true, autoRound: false });
  else { gsap.killTweensOf(arc); gsap.set(arc, { strokeDashoffset: 1 - f, autoRound: false }); }
}

function sync() {
  counter.textContent = `${pad(index + 1)} / ${pad(N)}`;
  live.textContent = `Panel ${index + 1} of ${N}: ${titles[index]}`;
  prevBtn.setAttribute('aria-disabled', String(index === 0));   // aria-disabled, not disabled: focus stays on the key
  nextBtn.setAttribute('aria-disabled', String(index === N - 1));
  html.dataset.theme = panels[index].dataset.theme;               // chrome follows the panel's ground
}

function goTo(to, { instant = false } = {}) {
  to = Math.max(0, Math.min(N - 1, to));
  if (to === index) return false;
  tl?.progress(1).kill();              // a new request settles any running travel first
  const from = index, dir = Math.sign(to - from);
  index = to; switches++; visited.add(to);
  panels.forEach((p, i) => { p.inert = i !== to; });
  sync();
  if (instant || motionTier() !== 'full') {
    panels[from].classList.remove('is-active', 'is-leaving');
    panels[to].classList.add('is-active');
    gsap.set([panels[from], panels[to], ...panels[to].querySelectorAll('[data-rise]')], { clearProps: 'transform,opacity' });
    return true;
  }
  panels[from].classList.replace('is-active', 'is-leaving');
  panels[to].classList.add('is-active');
  const rise = panels[to].querySelectorAll('[data-rise]');
  gsap.set(rise, { y: 42 * dir, opacity: 0 });
  tl = gsap.timeline({
    onComplete() {
      panels[from].classList.remove('is-leaving');
      gsap.set([panels[from], panels[to]], { clearProps: 'transform' });
      tl = null;
    },
  })
    .fromTo(panels[to], { yPercent: 100 * dir }, { yPercent: 0, duration: DUR, ease: 'expo.inOut' }, 0)
    .fromTo(panels[from], { yPercent: 0 }, { yPercent: -30 * dir, duration: DUR, ease: 'expo.inOut' }, 0)
    .to(rise, { y: 0, opacity: 1, duration: 0.72, ease: 'power3.out', stagger: 0.065 }, 0.45);
  return true;
}

// Wheel: Observer sums the deltas of one frame (deltaMode normalised); we sum frames toward THRESHOLD.
Observer.create({
  target: window,
  type: 'wheel',
  preventDefault: true,
  onStopDelay: IDLE,
  onChangeY(self) {
    if (performance.now() < lockUntil) { acc = 0; return; }
    const dir = Math.sign(self.deltaY);
    if (!dir) return;
    if (dir !== accDir) { acc = 0; accDir = dir; }        // reversing starts a fresh sum the other way
    if (index + dir < 0 || index + dir >= N) { acc = 0; if (fill) paintRing(0, 0.2); return; }
    acc += Math.abs(self.deltaY);
    if (acc < THRESHOLD) { paintRing(acc / THRESHOLD, 0.2); return; }
    acc = 0; commits++;
    lockUntil = performance.now() + LOCK;
    paintRing(1, 0.12);
    gsap.delayedCall(0.25, () => { if (!acc) paintRing(0, 0.4); });
    goTo(index + dir);
  },
  onStop() { if (acc) { acc = 0; paintRing(0, 0.4); } },   // idle rollback
});

// Swipe: one step per release past SWIPE px; a finger moving up means next.
Observer.create({
  target: stage,
  type: 'touch',
  onRelease(self) {
    const dy = self.y - self.startY;
    if (Math.abs(dy) > SWIPE) goTo(index + (dy < 0 ? 1 : -1));
  },
});

addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.('input, textarea, select, [contenteditable]')) return;
  const onPage = e.target === document.body || e.target === html;  // Space belongs to a focused button
  const map = { ArrowDown: 1, ArrowRight: 1, PageDown: 1, ArrowUp: -1, ArrowLeft: -1, PageUp: -1 };
  let to = null;
  if (e.key in map) to = index + map[e.key];
  else if (e.key === 'Home') to = 0;
  else if (e.key === 'End') to = N - 1;
  else if (e.key === ' ' && onPage) to = index + (e.shiftKey ? -1 : 1);
  if (to === null) return;
  e.preventDefault();
  goTo(to);
});
prevBtn.addEventListener('click', () => goTo(index - 1));
nextBtn.addEventListener('click', () => goTo(index + 1));
onMotionTierChange(() => tl?.progress(1));

// capture.mjs and the jury step through the panels with scrollTo(progress): no travel, deterministic frames.
awards.setScroller(async (p) => {
  goTo(Math.round(p * (N - 1)), { instant: true });
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
});

sync();
live.textContent = '';   // announce changes, not the first panel on load
awards.addState(() => ({
  motion: motionTier(),
  index,
  count: N,
  title: titles[index],
  progress: Number((index / (N - 1)).toFixed(3)),
  fill: Number(fill.toFixed(3)),
  commits,
  switches,
  transitioning: !!tl,
  locked: performance.now() < lockUntil,
  visited: [...visited].sort((a, b) => a - b),
  live: live.textContent,
}));
awards.ready();
