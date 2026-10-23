// Every loop on the page subscribes here, and here is GSAP's ticker: the same clock that drives Lenis and
// ScrollTrigger, so no private requestAnimationFrame ever gives a scroll-linked value a second opinion.
// Callbacks receive dt in seconds (clamped to 0.1, so a long frame never overshoots) and the ticker time.
import gsap from 'gsap';

const wrapped = new Map();

export const ticker = {
  add(fn) {
    if (wrapped.has(fn)) return () => ticker.remove(fn);
    const wrap = (time, deltaTime) => fn(Math.min(0.1, deltaTime / 1000), time);
    wrapped.set(fn, wrap);
    gsap.ticker.add(wrap);
    return () => ticker.remove(fn);
  },
  remove(fn) {
    const wrap = wrapped.get(fn);
    if (wrap) gsap.ticker.remove(wrap);
    wrapped.delete(fn);
  },
};

export const lerp = (a, b, t) => a + (b - a) * t;
// Exponential damping, identical at 60 Hz and 144 Hz: a per-frame lerp l at 60 fps is k = -ln(1 - l) * 60.
export const damp = (current, target, k, dt) => lerp(current, target, 1 - Math.exp(-k * dt));
export const lerpToK = (l) => -Math.log(1 - l) * 60;
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const mapRange = (v, inMin, inMax, outMin, outMax) => outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);
