import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute, onMotionTierChange } from '../_shared/reduced-motion.js';
import { ticker, damp } from '../_shared/raf.js';

syncMotionTierAttribute();
// Lenis 1.3 defaults to autoRaf: false; without a clock it swallows wheel events and never scrolls. Ride the shared ticker.
const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
ticker.add((dt, t) => lenis.raf(t));
window.lenis = lenis;

const state = { x: 0, speed: 0, paused: false, running: false, movedLast500: 0, copies: 1 };

function marquee(el) {
  const track = el.querySelector('[data-track]');
  const base = Number(el.dataset.speed || 80);
  const items = [...track.children];
  let copyWidth = 0;
  let unsubscribe = null;
  const samples = [];

  // Duplicate the content until it covers at least twice the container so the wrap is never visible.
  function fill() {
    track.querySelectorAll('[data-clone]').forEach((n) => n.remove());
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    copyWidth = items.reduce((w, li) => w + li.getBoundingClientRect().width + gap, 0);
    const need = Math.max(2, Math.ceil((el.clientWidth * 2) / copyWidth) + 1);
    state.copies = need;
    for (let c = 1; c < need; c++) {
      for (const li of items) {
        const clone = li.cloneNode(true);
        clone.setAttribute('data-clone', '');
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('a, button').forEach((a) => a.setAttribute('tabindex', '-1'));
        track.appendChild(clone);
      }
    }
  }

  function frame(dt, t) {
    // Speed = base + a share of the scroll velocity, damped so a flick decays instead of snapping.
    const target = state.paused ? 0 : base + Math.abs(lenis.velocity || 0) * 0.6;
    state.speed = damp(state.speed, target, state.paused ? 14 : 6, dt); // stop faster than you start
    state.x -= state.speed * dt;
    if (state.x <= -copyWidth) state.x += copyWidth;   // wraparound at one copy's width
    track.style.transform = `translate3d(${state.x}px,0,0)`;
    samples.push([t, state.x]);
    while (samples.length && t - samples[0][0] > 500) samples.shift();
    state.movedLast500 = samples.length > 1 ? Math.abs(samples.at(-1)[1] - samples[0][1]) : 0;
  }

  function start() {
    if (unsubscribe) return;
    fill();
    unsubscribe = ticker.add(frame);
    state.running = true;
  }
  function stop() {
    if (unsubscribe) unsubscribe();
    unsubscribe = null;
    state.running = false;
    state.movedLast500 = 0;
    track.querySelectorAll('[data-clone]').forEach((n) => n.remove());
    track.style.transform = '';
  }

  el.addEventListener('pointerenter', () => (state.paused = true));
  el.addEventListener('pointerleave', () => (state.paused = false));
  el.addEventListener('focusin', () => (state.paused = true));
  el.addEventListener('focusout', () => (state.paused = false));
  window.addEventListener('resize', () => { if (unsubscribe) fill(); });

  // Never burn frames off-screen.
  new IntersectionObserver(([entry]) => {
    if (motionTier() !== 'full') return;
    entry.isIntersecting ? start() : stop();
  }, { rootMargin: '10%' }).observe(el);

  const applyTier = (tier) => (tier === 'full' ? start() : stop());
  applyTier(motionTier());
  onMotionTierChange(applyTier);
}

document.querySelectorAll('[data-marquee]').forEach(marquee);

awards.addState(() => ({
  motion: motionTier(),
  running: state.running,
  paused: state.paused,
  speed: Math.round(state.speed),
  movedLast500: Math.round(state.movedLast500),
  copies: state.copies,
}));
awards.ready();
