// One master timeline for the scroll model (gsap-choreography: one master per scroll model, a label per chapter).
// It is paused, its duration is 1, and its progress is the page's scroll progress, set on the one ticker; every
// scrubbed value on the page is a tween on it, on ease 'none' (the smoothing is Lenis'). Today one value rides it:
// the gathering's p (`master@record`), as a proxy the record's frames read.
import gsap from 'gsap';
import { ticker, clamp } from '../lib/raf.js';

export function createMaster() {
  const proxy = { gather: 0 };
  const labels = {};
  let tl = null;
  let max = 1;
  let lastY = -1;
  let windowFn = null;
  const listeners = new Set();

  const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;

  function build() {
    tl?.kill();
    max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    tl.set({}, {}, 1);
    for (const el of document.querySelectorAll('main > .chapter[id]')) {
      const at = clamp(docTop(el) / max, 0, 1);
      tl.addLabel(el.id, at);
      labels[el.id] = Number(at.toFixed(4));
    }
    if (windowFn) {
      const [a, b] = windowFn();
      const from = clamp(a / max, 0, 1);
      const to = clamp(b / max, from + 0.0001, 1);
      proxy.gather = 0;
      tl.fromTo(proxy, { gather: 0 }, { gather: 1, duration: to - from, immediateRender: false }, from);
      labels['record:gathered'] = Number(from.toFixed(4));
      labels['record:sorted'] = Number(to.toFixed(4));
    }
    lastY = -1;
    update();
  }

  function update() {
    const y = window.scrollY;
    if (y === lastY || !tl) return false;
    lastY = y;
    tl.progress(clamp(y / max, 0, 1));
    listeners.forEach((fn) => fn());
    return true;
  }

  ticker.add(update);
  return {
    proxy,
    labels,
    // [start, end] of the gathering in scroll pixels, re-read on every rebuild.
    setGatherWindow(fn) { windowFn = fn; build(); },
    onUpdate(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    refresh: build,
    // The scroll position of a label, for a control that needs the page at a known state.
    scrollYFor: (label) => (label in labels ? Math.round(labels[label] * max) + 2 : null),
    state: () => ({ progress: tl ? Number(tl.progress().toFixed(3)) : 0, labels: { ...labels } }),
    kill() { ticker.remove(update); tl?.kill(); listeners.clear(); },
  };
}
