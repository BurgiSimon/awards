import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

// Every page loads this module in full; the transition itself lives in style.css and in the inline head
// script (pageswap / pagereveal), because it has to be decided before this module could run.
syncMotionTierAttribute();

// Feature check, no polyfill. Without cross-document support the links stay plain links and the browser
// navigates as it always has; nothing on the page waits for a transition that will never come.
const api = {
  crossDocument: typeof window.CSSViewTransitionRule === 'function',
  sameDocument: typeof document.startViewTransition === 'function',
  types: typeof window.ViewTransitionTypeSet === 'function',
};
document.documentElement.dataset.vt = api.crossDocument ? 'on' : 'off';

const page = location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
const folder = location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1);
const heading = document.querySelector('[data-focus]');

// After a navigation inside the recipe, focus lands on the new page's h1, so a screen reader starts at the
// heading and the next Tab continues from it. A direct visit or a reload leaves focus where the browser puts it.
let arrivals = 0;
function arrive() {
  const a = window.navigation?.activation;
  const from = a?.from?.url ?? (document.referrer || null);
  if (!from || a?.navigationType === 'reload') return;
  const u = new URL(from);
  if (u.origin !== location.origin || !u.pathname.startsWith(folder)) return;
  heading?.focus({ preventScroll: true });
  arrivals++;
}
arrive();
// A page restored from the back/forward cache does not run this module again.
addEventListener('pageshow', (e) => { if (e.persisted) arrive(); });

// Is the `@view-transition` opt-in live in this document? It sits inside the motion query, so it is not under reduced motion.
function optedIn() {
  const live = (rule) => !rule.media || matchMedia(rule.media.mediaText).matches;
  const walk = (rules, on) => [...rules].some((r) => (api.crossDocument && r instanceof window.CSSViewTransitionRule ? on && r.navigation === 'auto' : !!r.cssRules && walk(r.cssRules, on && live(r))));
  return [...document.styleSheets].some((s) => { try { return walk(s.cssRules, true); } catch { return false; } });
}

function swapRecord() {
  try { return JSON.parse(sessionStorage.getItem('vt:swap')); } catch { return null; }
}

awards.addState(() => {
  const reveal = window.__vt?.reveal ?? null;
  return {
    motion: motionTier(),
    page,
    api,
    optedIn: optedIn(),
    focused: !!heading && document.activeElement === heading,
    arrivals,
    swap: swapRecord(), // written by the page that was left, in its pageswap
    reveal, // written by this page's pagereveal
    settled: !!reveal && (reveal.finished || !reveal.transition),
  };
});
awards.ready();
