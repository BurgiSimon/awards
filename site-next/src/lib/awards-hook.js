// Page-side contract used by scripts/capture.mjs and by the jury: window.__awards = { ready, scrollTo(progress), state() }.
// Call awards.ready() once the page is interactive (fonts loaded, assets decoded, preloader gone).
let resolveReady;
const readyPromise = new Promise((r) => (resolveReady = r));
const stateFns = [];
const settlers = [];
let scroller = null;

export const awards = {
  ready() { resolveReady(true); },
  // Register a custom scroller for virtual-scroll pages: (progress 0..1) => Promise|void
  setScroller(fn) { scroller = fn; },
  // Register a function contributing to state(): () => object
  addState(fn) { stateFns.push(fn); },
  // Register a function scrollTo waits on after moving, so a capture never shoots a value still easing toward its
  // target (the strip's follow, a mark being drawn): () => Promise
  addSettle(fn) { settlers.push(fn); },
};

const settle = () => Promise.race([
  Promise.all(settlers.map((fn) => Promise.resolve().then(fn).catch(() => null))),
  new Promise((r) => setTimeout(r, 2500)),
]);

window.__awards = {
  ready: readyPromise,
  async scrollTo(progress) {
    const p = Math.min(1, Math.max(0, Number(progress) || 0));
    if (scroller) return scroller(p);
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const y = Math.round(max * p);
    if (window.lenis?.scrollTo) {
      window.lenis.scrollTo(y, { immediate: true, force: true });
    } else {
      window.scrollTo(0, y);
    }
    window.dispatchEvent(new Event('scroll'));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await settle();
  },
  state() {
    const base = {
      scroll: (() => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        return Number((window.scrollY / max).toFixed(3));
      })(),
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
    for (const fn of stateFns) {
      try { Object.assign(base, fn()); } catch (e) { base.stateError = String(e); }
    }
    return base;
  },
};
