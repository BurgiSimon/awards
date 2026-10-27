// One clock for the whole page: GSAP's ticker drives Lenis, Lenis feeds ScrollTrigger.
// Lenis only smooths the wheel on fine pointers; touch stays native and reduced motion gets no Lenis at all.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { motionTier } from './reduced-motion.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
gsap.ticker.lagSmoothing(0);

export function createScroll({ lerp = 0.12 } = {}) {
  const fine = matchMedia('(pointer: fine)').matches && !matchMedia('(any-pointer: coarse)').matches;
  let lenis = null;
  let tick = null;
  if (fine && motionTier() === 'full') {
    lenis = new Lenis({ lerp, autoRaf: false, smoothWheel: true, syncTouch: false, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    window.lenis = lenis; // lets capture.mjs and the awards hook drive the page
  }
  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  window.addEventListener('load', refresh, { once: true });
  return {
    lenis,
    stop: () => lenis?.stop(),
    start: () => lenis?.start(),
    scrollTo(target, opts = {}) {
      if (lenis) return lenis.scrollTo(target, opts);
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (typeof el === 'number') return window.scrollTo(0, el);
      el?.scrollIntoView({ block: 'start' });
    },
    destroy() {
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      delete window.lenis;
    },
  };
}
