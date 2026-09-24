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
const quality = await detectQualityTier({ sampleMs: 300 });
await document.fonts.ready;

const tier = motionTier();
revealHeadings();

// Readout: the weight bars fill as the chapter scrolls in (scrubbed, so no easing of its own).
const weights = document.querySelector('.weights');
if (weights && tier === 'full') {
  gsap.fromTo(weights, { '--grow': 0 }, {
    '--grow': 1, ease: 'none',
    scrollTrigger: { trigger: weights, start: 'top 85%', end: 'bottom 60%', scrub: 0.5 },
  });
}

// The signature. Loaded after the text, never gating it; a missing or failing flow leaves the page whole.
const loadFlow = import.meta.glob('./flow/index.js')['./flow/index.js'];
const flows = [];
let flowError = null;
const velocity = () => scroll.lenis.velocity * 60; // Lenis reports px per frame at 60 fps
if (loadFlow) {
  try {
    const { mountFlow } = await loadFlow();
    for (const section of document.querySelectorAll('[data-flow]')) {
      flows.push(await mountFlow(section, { mode: section.dataset.flow, quality, tier, getVelocity: velocity }));
    }
  } catch (error) {
    flowError = String(error);
  }
}

// Airflow switch: pauses the flow for anyone who finds it distracting; remembered per browser.
const button = document.querySelector('[data-airflow]');
const hero = flows[0];
if (button && hero && tier === 'full') {
  const label = button.querySelector('[data-airflow-state]');
  const set = (on) => {
    flows.forEach((f) => f.setAirflow(on));
    button.setAttribute('aria-pressed', String(on));
    label.textContent = on ? 'on' : 'off';
    try { localStorage.setItem('awards-airflow', on ? 'on' : 'off'); } catch {}
  };
  let stored = null;
  try { stored = localStorage.getItem('awards-airflow'); } catch {}
  if (stored === 'off') set(false);
  button.hidden = false;
  button.addEventListener('click', () => set(button.getAttribute('aria-pressed') !== 'true'));
}

// Airspeed readout: at most ten updates a second, from the flow's own damped value.
const out = document.getElementById('airspeed');
if (out) {
  let last = 0;
  gsap.ticker.add((time) => {
    if (time - last < 0.1) return;
    last = time;
    const v = hero ? hero.airspeed() : Math.abs(velocity());
    out.textContent = String(Math.round(v));
  });
}

ScrollTrigger.refresh();
awards.addState(() => ({
  motion: tier,
  quality: quality.tier,
  flows: flows.map((f) => f.renderer),
  flowError,
  airflow: button?.getAttribute('aria-pressed') ?? null,
  triggers: ScrollTrigger.getAll().length,
}));
document.documentElement.classList.add('is-ready');
awards.ready();
export { scroll, quality };
