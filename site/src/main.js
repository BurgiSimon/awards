// Home: one ticker (GSAP) drives Lenis, ScrollTrigger and the flow. Text is readable before any of this runs.
import './styles/site.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { awards } from './lib/awards-hook.js';
import { createScroll } from './lib/scroll.js';
import { syncMotionTierAttribute, motionTier } from './lib/reduced-motion.js';
import { detectQualityTier } from './lib/quality-tiers.js';
import { revealHeadings } from './lib/motion.js';
import { mountCopyButtons } from './copy.js';

syncMotionTierAttribute();
const scroll = createScroll();
mountCopyButtons();
const qualityReady = detectQualityTier({ sampleMs: 300 }); // samples frames while the fonts land; gates only the flow
let quality = null;

// Scroll speed in px/s, derived per frame from the position Lenis wrote; a jump (an anchor, the capture hook)
// is a teleport, not speed. The flow damps it into airspeed.
let speed = 0;
let lastY = null;
gsap.ticker.add((_time, deltaMs) => {
  const y = window.scrollY;
  const dt = Math.max(0.001, deltaMs / 1000);
  if (lastY !== null) {
    const dy = y - lastY;
    speed = Math.abs(dy) > innerHeight * 0.9 ? 0 : dy / dt;
  }
  lastY = y;
});

// ---------- the flow (SIGNATURE) ----------
const button = document.querySelector('[data-airflow]');
const label = button?.querySelector('[data-airflow-state]');
const flows = [];
let flowError = null;
let mountGen = 0;
let live = false;
const stored = () => { try { return localStorage.getItem('awards-airflow'); } catch { return null; } };
const store = (v) => { try { localStorage.setItem('awards-airflow', v); } catch {} };

function disposeFlows() { flows.splice(0).forEach((f) => f.dispose()); }
// A device that cannot hold 25 fps keeps the settled frame everywhere, and the switch goes with the motion.
function onSlow() {
  live = false;
  flows.forEach((f) => f.still());
  syncAirflow();
}

// Mount the hero and the close. `wantLive`: animate (GL) if the device can; otherwise both draw one settled frame.
// Loaded after the text, never gating it; a missing or failing flow leaves the page whole.
async function mountFlows(wantLive) {
  const gen = ++mountGen;
  disposeFlows();
  try {
    quality ??= await qualityReady;
    live = wantLive && quality.tier !== 'low';
    const { mountFlow } = await import('./flow/index.js');
    for (const section of document.querySelectorAll('[data-flow]')) {
      const flow = await mountFlow(section, { mode: section.dataset.flow, quality, live, getVelocity: () => speed, onSlow });
      if (gen !== mountGen) { flow.dispose(); return; }
      flows.push(flow);
    }
    flowError = null;
  } catch (error) {
    flowError = String(error);
  }
  syncAirflow();
}

// Airflow switch: states its value and pauses the flow for anyone who finds it distracting (remembered per browser).
// Under reduced motion the page opens on the settled frame with the switch at "off"; pressing it is an explicit
// opt-in to the live flow. Hidden only where nothing can move (static tier, low tier, no WebGL).
function syncAirflow() {
  if (!button) return;
  const capable = quality && quality.tier !== 'low' && motionTier() !== 'static' && !flowError;
  const animated = flows.some((f) => f.animated);
  let on = animated && stored() !== 'off';
  // Nothing to switch where GL failed on a capable-looking device, or the governor found it too slow.
  button.hidden = !capable || (live && !animated) || flows.some((f) => f.state().slow);
  flows.forEach((f) => f.setAirflow(on));
  button.setAttribute('aria-pressed', String(on));
  label.textContent = on ? 'on' : 'off';
}
button?.addEventListener('click', () => {
  const on = button.getAttribute('aria-pressed') !== 'true';
  store(on ? 'on' : 'off');
  if (on && !flows.some((f) => f.animated)) { mountFlows(true); return; } // reduced tier: opt in to the live flow
  flows.forEach((f) => f.setAirflow(on));
  button.setAttribute('aria-pressed', String(on));
  label.textContent = on ? 'on' : 'off';
});

// Airspeed readout: at most ten updates a second, from the hero's own inflow.
const out = document.getElementById('airspeed');
if (out) {
  let last = 0;
  gsap.ticker.add((time) => {
    if (time - last < 0.1) return;
    last = time;
    const hero = flows[0];
    out.textContent = String(Math.round(hero ? hero.airspeed() : 0));
  });
}

// ---------- the score, by tier ----------
await document.fonts.ready;
const weights = document.querySelector('.weights');
let firstMount = null;
const mm = gsap.matchMedia();
mm.add({ full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, () => {
  const tier = motionTier(); // honours a data-motion override on <html>
  const undoReveal = revealHeadings(tier);
  // Readout: the weight bars fill as the chapter scrolls in (scrubbed, so no easing of its own).
  if (weights && tier === 'full') {
    gsap.fromTo(weights, { '--grow': 0 }, {
      '--grow': 1, ease: 'none',
      scrollTrigger: { trigger: weights, start: 'top 85%', end: 'bottom 60%', scrub: 0.5 },
    });
  }
  firstMount = mountFlows(tier === 'full' || (tier === 'reduced' && stored() === 'on'));
  return () => undoReveal();
});

// The readout is a cut to the instrument panel; the browser chrome follows it while it fills the top of the screen.
const themeMeta = document.querySelector('meta[name="theme-color"]');
const readout = document.getElementById('readout');
if (themeMeta && readout) {
  const lab = themeMeta.content;
  const panel = getComputedStyle(readout).getPropertyValue('--ground').trim() || lab;
  ScrollTrigger.create({
    trigger: readout, start: 'top top', end: 'bottom top',
    onToggle: (self) => { themeMeta.content = self.isActive ? panel : lab; },
  });
}

// Nothing outlives the page: the worker, the GL context and the ticker subscribers go on pagehide,
// and come back if the page is restored from the back/forward cache.
addEventListener('pagehide', () => { mountGen++; disposeFlows(); });
addEventListener('pageshow', (e) => { if (e.persisted) mountFlows(live); });

await firstMount;
ScrollTrigger.refresh();
awards.addState(() => ({
  motion: motionTier(),
  quality: quality?.tier ?? null,
  gl: flows.some((f) => f.renderer === 'webgl'),
  flows: flows.map((f) => f.state()),
  flowError,
  airflow: button && !button.hidden ? button.getAttribute('aria-pressed') : null,
  speed: Math.round(speed),
  triggers: ScrollTrigger.getAll().length,
}));
document.documentElement.classList.add('is-ready');
awards.ready();
export { scroll };
