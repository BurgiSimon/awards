// One clock for the whole page: GSAP's ticker drives Lenis, Lenis feeds ScrollTrigger (AWARDS.md, SCROLL MODEL).
// Desktop and tablet wheel scrolling is smoothed at a near-native lerp; touch stays native (syncTouch off), and
// Lenis turns smoothing off by itself under prefers-reduced-motion. Anchors, find-in-page and selection stay native.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { prefersReducedMotion } from './reduced-motion.js';

gsap.registerPlugin(ScrollTrigger);

export function createScroll({ lerp = 0.14 } = {}) {
  // The address bar showing and hiding on a phone is a height change, never a reason to rebuild the page.
  ScrollTrigger.config({ ignoreMobileResize: true });
  const lenis = new Lenis({ lerp, autoRaf: false, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time) => lenis.raf(time * 1000); // the ticker hands over seconds; Lenis wants milliseconds
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0); // a tab switch never fast-forwards a scrubbed value
  window.lenis = lenis; // capture.mjs and window.__awards.scrollTo drive the page through it
  // Measure after the page is real: the faces, then every image.
  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  if (document.readyState === 'complete') refresh();
  else window.addEventListener('load', refresh, { once: true });
  return {
    lenis,
    stop: () => lenis.stop(),
    start: () => lenis.start(),
    resize: () => { lenis.resize(); refresh(); },
    scrollTo: (target, opts = {}) => lenis.scrollTo(target, { immediate: prefersReducedMotion(), ...opts }),
    destroy() {
      gsap.ticker.remove(tick);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      delete window.lenis;
    },
  };
}
