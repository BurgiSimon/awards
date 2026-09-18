// A single ticker for the whole page plus framerate-independent damping helpers.
// If GSAP is present we ride gsap.ticker (so Lenis, ScrollTrigger and our loops share one clock).
const subscribers = new Set();
let running = false;
let last = 0;

function frame(t) {
  const dt = last ? Math.min(0.1, (t - last) / 1000) : 1 / 60;
  last = t;
  for (const fn of subscribers) fn(dt, t);
  if (running) requestAnimationFrame(frame);
}

export const ticker = {
  add(fn) {
    subscribers.add(fn);
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
    return () => subscribers.delete(fn);
  },
  remove(fn) {
    subscribers.delete(fn);
  },
  pause() { running = false; last = 0; },
  resume() { if (!running) { running = true; requestAnimationFrame(frame); } },
};

// Pause loops when the tab is hidden: nothing should burn frames nobody sees.
document.addEventListener('visibilitychange', () => (document.hidden ? ticker.pause() : ticker.resume()));

export const lerp = (a, b, t) => a + (b - a) * t;
// Exponential damping: identical feel at 60 Hz and 144 Hz. k ≈ 6–10 feels like a 0.1 lerp at 60 fps.
export const damp = (current, target, k, dt) => lerp(current, target, 1 - Math.exp(-k * dt));
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const mapRange = (v, inMin, inMax, outMin, outMax) => outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);
