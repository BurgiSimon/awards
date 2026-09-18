// One clock for the whole page: GSAP's ticker drives Lenis, Lenis feeds ScrollTrigger.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { prefersReducedMotion } from './reduced-motion.js';

gsap.registerPlugin(ScrollTrigger);

export function createScroll({ lerp = 0.1 } = {}) {
  const lenis = new Lenis({ lerp, autoRaf: false, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis; // lets capture.mjs and the awards hook drive the page
  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  window.addEventListener('load', refresh, { once: true });
  return {
    lenis,
    stop: () => lenis.stop(),
    start: () => lenis.start(),
    scrollTo: (target, opts = {}) => lenis.scrollTo(target, { immediate: prefersReducedMotion(), ...opts }),
    destroy() {
      gsap.ticker.remove(tick);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      delete window.lenis;
    },
  };
}
