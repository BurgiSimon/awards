import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

// The moment itself is CSS (style.css keys on the media query, html[data-motion] and html[data-motion-tier]),
// so it plays with no script at all; this module mirrors the tier, keeps the demo search on the page and reports.
syncMotionTierAttribute();

const sun = document.querySelector('[data-sun]');
const svg = sun.ownerSVGElement;
const form = document.querySelector('[data-search]');
const note = document.querySelector('[data-search-note]');
const state = { searches: 0, query: null, wouldOpen: null };

// Demo only: the form is a plain GET to /search on a real site. Here it says what it would open instead of
// leaving the recipe. Remove data-demo from the form (or this listener) when the site has a search route.
form.addEventListener('submit', (e) => {
  if (!form.hasAttribute('data-demo')) return;
  e.preventDefault();
  const q = String(new FormData(form).get('q') ?? '').trim();
  state.searches++;
  state.query = q;
  state.wouldOpen = q ? `${form.getAttribute('action')}?${new URLSearchParams({ q })}` : null;
  note.textContent = q ? `Demo: a real almanac would open ${state.wouldOpen} here.` : 'Type a harbour, a date or a tide first.';
});

// The sun's top edge in viewBox units: 120 while the zero stands on the horizon, 260 once half set.
function sunTop() {
  const s = sun.getBoundingClientRect(), v = svg.getBoundingClientRect();
  return v.height ? Math.round(((s.top - v.top) * svg.viewBox.baseVal.height) / v.height) : null;
}

awards.addState(() => {
  const running = svg.getAnimations({ subtree: true }).filter((a) => a.playState === 'running' || a.playState === 'pending');
  const active = document.activeElement;
  return {
    motion: motionTier(),
    sunTop: sunTop(),
    momentRunning: running.length,
    focused: active === document.body ? 'body' : active?.getAttribute('href') ?? active?.id ?? active?.className ?? active?.tagName,
    searches: state.searches,
    query: state.query,
    wouldOpen: state.wouldOpen,
    path: location.pathname + location.search,
  };
});
awards.ready();
