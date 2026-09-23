import Lenis from 'lenis';
import { ticker, damp, clamp } from '../_shared/raf.js';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();

// Parameters.
const MIN_THUMB = 48; // px: never thinner to grab than this
const FOLLOW = 14; // damping rate of the thumb towards the scroll position in the full tier (≈ .2 lerp at 60 fps)

// Smooth scroll only in the full tier. Lenis 1.3 defaults to autoRaf: false: the shared ticker drives it below.
const lenis = motionTier() === 'full' ? new Lenis({ lerp: 0.1, autoRaf: false }) : null;
window.lenis = lenis ?? undefined;

const html = document.documentElement;
const track = document.querySelector('[data-track]');
const thumb = document.querySelector('[data-thumb]');
const s = { shown: 0, target: 0, dragging: false, drags: 0, grab: 0 };
let trackTop = 0, trackH = 0, thumbH = MIN_THUMB, maxScroll = 1, active = false;

function measure() {
  active = getComputedStyle(track).display !== 'none'; // hidden on coarse pointers by CSS
  if (!active) return;
  const r = track.getBoundingClientRect();
  trackTop = r.top; trackH = r.height;
  maxScroll = Math.max(1, html.scrollHeight - innerHeight);
  thumbH = Math.max(MIN_THUMB, Math.round(trackH * innerHeight / html.scrollHeight));
  thumb.style.setProperty('--thumb-h', thumbH + 'px');
}
const travel = () => Math.max(1, trackH - thumbH);

// Drag: the thumb's offset over its free travel is the scroll fraction. Pressing the track centres the thumb on the pointer first.
function scrollToFraction(f) {
  const y = clamp(f, 0, 1) * maxScroll;
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}
function dragTo(clientY) { scrollToFraction((clientY - trackTop - s.grab) / travel()); }
track.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  e.preventDefault();
  measure();
  const thumbTop = trackTop + s.shown * travel();
  s.grab = e.target === thumb ? e.clientY - thumbTop : thumbH / 2;
  s.dragging = true; s.drags++;
  track.setPointerCapture(e.pointerId);
  track.classList.add('is-dragging'); html.classList.add('is-dragging-thumb');
  dragTo(e.clientY);
});
track.addEventListener('pointermove', (e) => { if (s.dragging) dragTo(e.clientY); });
const end = () => { s.dragging = false; track.classList.remove('is-dragging'); html.classList.remove('is-dragging-thumb'); };
track.addEventListener('pointerup', end);
track.addEventListener('pointercancel', end);

// One clock: Lenis, then the thumb. The thumb only mirrors window.scrollY, so keys, anchors and find-in-page move it too.
let written = -1;
ticker.add((dt, t) => {
  lenis?.raf(t);
  if (!active) return;
  s.target = window.scrollY / maxScroll;
  // Full tier eases native jumps (Page Down, Home, anchors); reduced and static tiers, and a live drag, sit exactly on the scroll.
  s.shown = motionTier() === 'full' && !s.dragging ? damp(s.shown, s.target, FOLLOW, dt) : s.target;
  if (Math.abs(s.shown - s.target) < 1e-4) s.shown = s.target;
  const y = Math.round(s.shown * travel() * 10) / 10;
  if (y !== written) { thumb.style.transform = `translate3d(0, ${y}px, 0)`; written = y; }
});

measure();
new ResizeObserver(measure).observe(document.body);
addEventListener('resize', measure);

awards.addState(() => ({
  motion: motionTier(),
  lenis: !!lenis,
  thumbActive: active,
  dragging: s.dragging,
  drags: s.drags,
  thumb: Number(s.shown.toFixed(3)),
  target: Number(s.target.toFixed(3)),
  lag: Number(Math.abs(s.shown - s.target).toFixed(4)),
}));
awards.ready();
