import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { awards } from '../_shared/awards-hook.js';
import { ticker } from '../_shared/raf.js';
import { motionTier, syncMotionTierAttribute, onMotionTierChange } from '../_shared/reduced-motion.js';

gsap.registerPlugin(Observer);
syncMotionTierAttribute();

const html = document.documentElement;
const deck = document.querySelector('[data-deck]');
const panels = [...deck.querySelectorAll('.panel')];
const seam = document.querySelector('[data-seam]');
const controls = document.querySelector('[data-controls]');
const prevBtn = controls.querySelector('[data-prev]');
const nextBtn = controls.querySelector('[data-next]');
const counter = controls.querySelector('[data-counter]');
const live = document.querySelector('[data-live]');
const titles = panels.map((p) => p.querySelector('.panel__title').textContent.trim());
const N = panels.length;

const WIPE = 1.0;       // s, clip and seam on one expo.inOut tween
const SEAM_AT = 0.12;   // s into the change: copy leaves first, then the gate opens
const FADE = 0.2;       // s cross-fade under reduced motion
const WHEEL_MIN = 18;   // |deltaY| px for one step (stepped wheel)
const LOCK = 1000;      // ms minimum the wheel is swallowed after a step
const TAIL = 300;       // ms more after the change settles, for trackpad inertia
const SWIPE = 55;       // px of vertical finger travel for one step
const SCALE = 0.5;      // canvas backing store per CSS px: the stand-in clips are soft like a streamed video

// Synthetic clips standing in for <video src>: a graded ground with drifting light bands.
const CLIPS = {
  '01': { from: '#3a3733', to: '#0d0d0c', band: '#e8e1d2', angle: -0.5, speed: 0.045 },
  '02': { from: '#1d3431', to: '#0a0f0e', band: '#bfe0d6', angle: 0.35, speed: 0.06 },
  '03': { from: '#3d2418', to: '#110b08', band: '#f0c7a6', angle: -0.2, speed: 0.035 },
  '04': { from: '#262a3a', to: '#0b0c10', band: '#cfd6f2', angle: 0.6, speed: 0.05 },
};

// One object per buffer. With real media `el` is a <video>; see README "Swap in <video>".
const layers = [...document.querySelectorAll('[data-layer]')].map((el) => ({ el, id: el.dataset.layer, ctx: el.getContext('2d'), src: null, t: 0, frames: 0 }));

let index = 0, front = 0, tl = null, wipe = 0, dir = 0, lockUntil = 0;
let switches = 0, loads = 0, hits = 0, misses = 0;
const visited = new Set([0]);
const pad = (n) => String(n).padStart(2, '0');

function paint(layer) {
  const { ctx, el } = layer, c = CLIPS[layer.src], w = el.width, h = el.height;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, c.from); g.addColorStop(1, c.to);
  ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2); ctx.rotate(c.angle);
  const span = Math.hypot(w, h);
  for (let i = 0; i < 5; i++) {
    const x = (((i / 5 + layer.t * c.speed) % 1) - 0.5) * span;
    const b = ctx.createLinearGradient(x - span * 0.08, 0, x + span * 0.08, 0);
    b.addColorStop(0, 'rgb(0 0 0 / 0)'); b.addColorStop(0.5, c.band); b.addColorStop(1, 'rgb(0 0 0 / 0)');
    ctx.globalAlpha = 0.16 + 0.05 * Math.sin(layer.t * 0.8 + i);
    ctx.fillStyle = b; ctx.fillRect(x - span * 0.08, -span / 2, span * 0.16, span);
  }
  ctx.restore();
  ctx.globalAlpha = 0.5; ctx.fillStyle = c.band;
  ctx.font = `${Math.max(6, Math.round(Math.min(w, h) * 0.02))}px ui-monospace, Menlo, monospace`;
  ctx.textAlign = 'right';
  ctx.fillText(`SYNTHETIC CLIP ${layer.src} · ${layer.t.toFixed(1)} s`, w - Math.min(w, h) * 0.05, h * 0.13);
}

// "Load" a source into a buffer. A <video> does: el.src = url; el.preload = 'auto'; el.load(). Here the poster frame is drawn.
function load(layer, src) {
  if (layer.src === src) return false;
  layer.src = src; layer.t = 0; layer.el.dataset.src = src; loads++;
  paint(layer);
  return true;
}

function resize() {
  for (const l of layers) {
    l.el.width = Math.max(1, Math.round(innerWidth * SCALE));
    l.el.height = Math.max(1, Math.round(innerHeight * SCALE));
    if (l.src) paint(l);
  }
}

// Playback: only visible buffers advance, and only on the full tier (reduced / static rest on the first frame).
ticker.add((dt) => {
  if (motionTier() !== 'full') return;
  for (const l of layers) {
    if (!l.el.classList.contains('is-front') && !l.el.classList.contains('is-incoming')) continue;
    l.t += dt; l.frames++; paint(l);
  }
});

function sync() {
  counter.textContent = `${pad(index + 1)} / ${pad(N)}`;
  live.textContent = `Panel ${index + 1} of ${N}: ${titles[index]}`;
  prevBtn.setAttribute('aria-disabled', String(index === 0));   // aria-disabled, not disabled: focus stays on the key
  nextBtn.setAttribute('aria-disabled', String(index === N - 1));
}

// Clip and seam from one number: forward the gate opens left → right, backwards right → left.
function setWipe(inc, p) {
  wipe = p;
  const rest = `${((1 - p) * 100).toFixed(3)}%`;
  inc.el.style.clipPath = dir > 0 ? `inset(0 ${rest} 0 0)` : `inset(0 0 0 ${rest})`;
  seam.style.transform = `translate3d(${((dir > 0 ? p : 1 - p) * 100).toFixed(3)}%, 0, 0)`;
}

function settle(from, inc, out) {
  tl = null; wipe = 0;
  lockUntil = Math.max(lockUntil, performance.now() + TAIL);
  inc.el.classList.replace('is-incoming', 'is-front');
  out.el.classList.remove('is-front');
  front = layers.indexOf(inc);
  inc.el.style.clipPath = '';
  gsap.set(inc.el, { clearProps: 'opacity' });
  gsap.set(seam, { opacity: 0 });
  panels[from].classList.remove('is-leaving');
  gsap.set([...panels[from].querySelectorAll('[data-rise]'), ...panels[index].querySelectorAll('[data-rise]')], { clearProps: 'transform,opacity' });
  // The outgoing buffer is now hidden: park it and preload the likely next panel (a <video>: pause(), then new src).
  load(out, panels[index + (index < N - 1 ? 1 : -1)].dataset.clip);
}

function goTo(to, { instant = false } = {}) {
  to = Math.max(0, Math.min(N - 1, to));
  if (to === index) return false;
  tl?.progress(1);                       // a new request settles any running change first
  const from = index, out = layers[front], inc = layers[1 - front];
  dir = Math.sign(to - from);
  if (load(inc, panels[to].dataset.clip)) misses++; else hits++;   // a hit: the preload was right, nothing to wait for
  index = to; switches++; visited.add(to);
  panels.forEach((p, i) => { p.inert = i !== to; });
  sync();
  panels[from].classList.replace('is-active', 'is-leaving');
  panels[to].classList.add('is-active');
  inc.el.classList.add('is-incoming');
  const tier = instant ? 'static' : motionTier();
  if (tier === 'static') { settle(from, inc, out); return true; }
  if (tier === 'reduced') {
    tl = gsap.timeline({ onComplete: () => settle(from, inc, out) })
      .fromTo(inc.el, { opacity: 0 }, { opacity: 1, duration: FADE, ease: 'none' });
    return true;
  }
  const copyOut = panels[from].querySelectorAll('[data-rise]');
  const copyIn = panels[to].querySelectorAll('[data-rise]');
  const proxy = { p: 0 };
  setWipe(inc, 0);
  gsap.set(copyIn, { y: 42, opacity: 0 });
  tl = gsap.timeline({ onComplete: () => settle(from, inc, out) })
    .to(copyOut, { y: -24, opacity: 0, duration: 0.34, ease: 'power2.in', stagger: 0.025 }, 0)
    .set(seam, { opacity: 0.76 }, SEAM_AT)
    // A plain-object tween is not rounded, so the clip and the seam move by sub-pixels on the same clock.
    .to(proxy, { p: 1, duration: WIPE, ease: 'expo.inOut', onUpdate: () => setWipe(inc, proxy.p) }, SEAM_AT)
    .to(seam, { opacity: 0, duration: 0.2, ease: 'none' }, 1.0)
    .to(copyIn, { y: 0, opacity: 1, duration: 0.72, ease: 'power3.out', stagger: 0.065 }, 0.66);
  return true;
}

// Deck mode: the document stops scrolling; only the active panel is visible and reachable.
html.classList.add('deck');
controls.hidden = false;
panels.forEach((p, i) => { p.classList.toggle('is-active', i === 0); p.inert = i !== 0; });
resize();
addEventListener('resize', resize);
load(layers[0], panels[0].dataset.clip);
layers[0].el.classList.add('is-front');
load(layers[1], panels[1].dataset.clip);   // the hidden buffer starts with panel 2's clip

// Navigation: the stepped-wheel variant of section-switcher-wheel-commit.
Observer.create({
  target: window,
  type: 'wheel',
  preventDefault: true,
  onChangeY(self) {
    // Locked while a change runs (its own clock, however slow the frames) and for the minimum / tail after it.
    if (tl || performance.now() < lockUntil || Math.abs(self.deltaY) < WHEEL_MIN) return;
    if (goTo(index + Math.sign(self.deltaY))) lockUntil = performance.now() + LOCK;
  },
});
Observer.create({
  target: deck,
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
onMotionTierChange(() => { tl?.progress(1); layers.forEach((l) => { l.t = 0; paint(l); }); });

// capture.mjs and the jury step through the panels with scrollTo(progress): no wipe, deterministic frames.
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
  front: layers[front].id,
  dir,
  wipe: Number(wipe.toFixed(4)),
  transitioning: !!tl,
  layers: layers.map((l) => ({ id: l.id, src: l.src, frames: l.frames })),
  clips: panels.map((p) => p.dataset.clip),
  switches, loads, hits, misses,
  visited: [...visited].sort((a, b) => a - b),
  live: live.textContent,
}));
awards.ready();
