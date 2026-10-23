// The grease rings around the select (AWARDS.md, LOAD & CLOSE). The close's ring draws once as the close enters,
// over --dur-mark on the house expo-out: the accent's own motion. The first ticket's ring is printed, except in the
// states with no jury report, where it is the first viewport's one moment (see ## Motion score: in state b nothing
// may draw a jury mark, so the hand that rings the select is the one that moves).
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DUR, addStroke, hideStroke, showStroke } from '../lib/motion.js';

export function ringPaths(selector) {
  return [...document.querySelectorAll(`${selector} .ticket__ring path`)];
}

export function drawRing(paths, duration) {
  const tl = gsap.timeline();
  paths.forEach((p, i) => addStroke(tl, p, { duration, at: i * DUR.stagger }));
  return tl;
}

// Full tier: hidden until the close's ticket is 70 % of the way up the viewport, then drawn once per page view.
export function createCloseRing({ animate, scope = (fn) => fn() }) {
  const ticket = document.querySelector('#select-close');
  const paths = ringPaths('#select-close');
  if (!ticket || !paths.length) return null;
  let state = 'drawn';
  let tl = null;
  let trigger = null;
  let resolve = null;
  if (animate && !createCloseRing.done) {
    paths.forEach(hideStroke);
    state = 'pending';
    trigger = ScrollTrigger.create({
      trigger: ticket,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        createCloseRing.done = true;
        state = 'drawing';
        tl = scope(() => drawRing(paths, DUR.mark)).eventCallback('onComplete', () => { state = 'drawn'; resolve?.(); });
      },
    });
  } else paths.forEach(showStroke);
  return {
    state: () => state,
    settled: () => (state === 'drawing' ? new Promise((r) => { resolve = r; }) : Promise.resolve()),
    destroy() {
      trigger?.kill();
      tl?.kill();
      paths.forEach(showStroke);
      if (state === 'drawing') createCloseRing.done = true;
      resolve?.();
    },
  };
}
createCloseRing.done = false;
