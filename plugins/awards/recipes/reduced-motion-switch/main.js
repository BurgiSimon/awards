import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker } from '../_shared/raf.js';

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();

const html = document.documentElement;
const readout = document.querySelector('[data-tier-readout]');
const track = document.querySelector('[data-marquee] .track');
const panels = gsap.utils.toArray('[data-panel]');
let ctx = null;
let unsubscribe = null;
const state = { tier: 'full', tickerSubscribed: false, marqueeX: 0 };

// Every effect is created inside one function of the tier, and torn down before the next tier applies.
function apply(tier) {
  state.tier = tier;
  readout.textContent = tier;
  html.setAttribute('data-motion-tier', tier);
  if (ctx) ctx.revert();
  if (unsubscribe) { unsubscribe(); unsubscribe = null; state.tickerSubscribed = false; }
  ctx = gsap.context(() => {
    if (tier === 'full') {
      // Orbit: a loop, paused while off-screen so it never burns frames nobody sees.
      const dot = gsap.to('[data-orbit]', { rotation: 360, duration: 6, ease: 'none', repeat: -1 });
      ScrollTrigger.create({ trigger: '[data-orbit]', start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? dot.play() : dot.pause()) });
      // Marquee: rAF translate with wraparound on the shared ticker.
      let x = 0;
      const half = () => track.scrollWidth / 2;
      unsubscribe = ticker.add((dt) => { x = (x - 60 * dt) % half(); state.marqueeX = x; track.style.transform = `translate3d(${x}px,0,0)`; });
      state.tickerSubscribed = true;
      // Panels slide in on entry.
      gsap.from(panels, { yPercent: 30, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.panels', start: 'top 85%', once: true } });
    } else if (tier === 'reduced') {
      // No spatial movement: the orbit parks, the marquee is a static row, panels fade only.
      gsap.set('[data-orbit]', { rotation: 0 });
      track.style.transform = 'none';
      gsap.from(panels, { autoAlpha: 0, duration: 0.4, stagger: 0.05, scrollTrigger: { trigger: '.panels', start: 'top 85%', once: true } });
    } else {
      // Static: everything in its end state, nothing subscribed to any clock.
      gsap.set('[data-orbit]', { rotation: 0 });
      track.style.transform = 'none';
      gsap.set(panels, { clearProps: 'all' });
    }
  });
}

// User override (persisted) wins over the media query; 'auto' hands the decision back to the OS.
const saved = (() => { try { return localStorage.getItem('awards:motion'); } catch { return null; } })();
if (saved && saved !== 'auto') html.dataset.motion = saved;
document.querySelectorAll('[data-tier]').forEach((btn) => {
  btn.setAttribute('aria-pressed', String(btn.dataset.tier === (saved || 'auto')));
  btn.addEventListener('click', () => {
    const t = btn.dataset.tier;
    if (t === 'auto') delete html.dataset.motion; else html.dataset.motion = t;
    try { localStorage.setItem('awards:motion', t); } catch {}
    document.querySelectorAll('[data-tier]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    apply(motionTier());
  });
});

apply(motionTier());
onMotionTierChange(apply); // the OS setting can change while the page is open

awards.addState(() => ({
  motion: state.tier,
  override: html.dataset.motion || 'auto',
  tickerSubscribed: state.tickerSubscribed,
  marqueeX: Math.round(state.marqueeX),
  orbitRotation: Math.round(Number(gsap.getProperty('[data-orbit]', 'rotation')) || 0),
  panelOpacity: Number(getComputedStyle(panels[0]).opacity),
}));
awards.ready();
