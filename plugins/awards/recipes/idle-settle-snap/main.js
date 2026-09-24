import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker, clamp } from '../_shared/raf.js';

syncMotionTierAttribute();

// mensch: 160 ms of quiet, a 6 % dead zone at each end, the nearer end over .7 s, a 900 ms guard (longer than the tween).
const QUIET = 160;     // ms of ticker time with no scroll movement and no input before a settle is judged
const DEAD = 0.06;     // fraction of the zone at each end where a resting position is left alone
const GUARD = 900;     // ms of ticker time after a settle starts before another may start
const DURATION = 0.7;  // s
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar']);

const zone = document.querySelector('[data-settle-zone]');
const dot = document.querySelector('[data-dot]');
const status = document.querySelector('[data-status]');
const fine = matchMedia('(pointer: fine)');

// One clock: the shared ticker drives Lenis (1.3 defaults to autoRaf: false; a Lenis with no clock swallows wheel events).
// Under reduced motion Lenis itself turns the wheel instant (respectReducedMotion); the static tier gets the same by option.
const lenis = new Lenis({ lerp: 0.1, autoRaf: false, smoothWheel: motionTier() === 'full' });
window.lenis = lenis;

const S = { armed: false, held: false, snapping: false, source: 'none', quiet: 0, guard: 0, lastY: scrollY, snaps: 0, last: null };
const enabled = () => fine.matches && motionTier() === 'full';

// Only a wheel arms the settle. Touch never does (hybrid laptops), and a native scroll (keyboard, find-in-page,
// a focus scroll, the scrollbar, an anchor jump) disarms it: the visitor chose that position deliberately.
lenis.on('virtual-scroll', ({ event }) => {
  S.quiet = 0;
  S.snapping = false; // a wheel during a settle takes over; Lenis retargets from where the tween is
  const wheel = event.type === 'wheel' && !event.ctrlKey;
  S.armed = wheel;
  S.source = wheel ? 'wheel' : 'touch';
});
lenis.on('scroll', () => { if (lenis.isScrolling === 'native') { S.armed = false; S.source = 'native'; } });
addEventListener('keydown', (e) => { if (SCROLL_KEYS.has(e.key)) { S.armed = false; S.source = 'key'; } });

// Held: nothing runs while a pointer or touch is down, and a press stops a settle in place.
addEventListener('pointerdown', () => {
  S.held = true;
  if (S.snapping) { lenis.reset(); S.snapping = false; }
});
const release = () => { S.held = false; S.quiet = 0; }; // the quiet window restarts from the release
addEventListener('pointerup', release);
addEventListener('pointercancel', release);

function settle(y) {
  S.armed = false;
  const start = zone.offsetTop, end = start + zone.offsetHeight, span = end - start;
  const p = (y - start) / span;
  if (p <= DEAD || p >= 1 - DEAD) return; // outside the zone, or close enough to an end: leave it
  const to = p < 0.5 ? start : end;
  S.snapping = true;
  S.guard = GUARD;
  S.snaps++;
  S.last = { from: Math.round(y), to, quiet: Math.round(S.quiet), done: false };
  const last = S.last;
  lenis.scrollTo(to, { duration: DURATION, easing: easeOutCubic, onComplete: () => { S.snapping = false; last.done = true; } });
}

ticker.add((dt, t) => {
  lenis.raf(t);
  const y = scrollY, ms = dt * 1000;
  // Quiet is counted in ticker time (dt is clamped to 100 ms), so a stalled frame never fakes a long pause.
  if (Math.abs(y - S.lastY) > 0.5) { S.quiet = 0; S.lastY = y; } else S.quiet += ms;
  S.guard = Math.max(0, S.guard - ms);
  if (S.armed && !S.held && !S.snapping && !S.guard && S.quiet >= QUIET) {
    if (enabled()) settle(y); else S.armed = false;
  }
  // Demo readout: where the rest sits inside the zone.
  const p = clamp((y - zone.offsetTop) / zone.offsetHeight, 0, 1);
  dot.style.transform = `translate3d(0, ${(p * 100).toFixed(2)}cqh, 0)`;
  status.textContent = `${String(Math.round(p * 100)).padStart(3, '0')} · ${S.held ? 'held' : S.snapping ? 'settling' : S.armed ? 'armed' : enabled() ? 'idle' : 'off'}`;
});

onMotionTierChange((tier) => {
  lenis.options.smoothWheel = tier === 'full';
  if (tier !== 'full' && S.snapping) { lenis.reset(); S.snapping = false; }
});

awards.addState(() => ({
  motion: motionTier(), fine: fine.matches, enabled: enabled(), armed: S.armed, held: S.held, snapping: S.snapping,
  source: S.source, guard: Math.round(S.guard), snaps: S.snaps, last: S.last, zone: zone.offsetHeight, y: Math.round(scrollY),
}));
awards.ready();
