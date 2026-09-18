import gsap from 'gsap';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();
const html = document.documentElement;
const pre = document.querySelector('[data-preloader]');
const countEl = document.querySelector('[data-count]');
const signalEls = [...document.querySelectorAll('[data-signal]')];
const KEY = 'awards:preloaded';
const state = { skipped: false, exited: false, holdMs: 0, totalMs: 0, finalCount: '', real: 0, shown: 0, flag: false };
const t0 = performance.now();
const full = () => motionTier() === 'full';
const seen = (() => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } })();

function revealHero() {
  html.classList.remove('is-loading');
  if (!full()) return;
  gsap.from('.hero .line', { yPercent: 120, duration: 1.4, ease: 'expo.out', stagger: 0.09, clearProps: 'transform' });
}

function finish({ skipped }) {
  state.exited = true;
  state.skipped = skipped;
  state.totalMs = Math.round(performance.now() - t0);
  pre.hidden = true;                     // out of the a11y tree and out of the layout
  pre.setAttribute('aria-hidden', 'true');
  try { sessionStorage.setItem(KEY, '1'); state.flag = true; } catch {}
  revealHero();
  awards.ready();
}

if (seen) {
  // Repeat visit: no gate at all. The choreography is for the first impression only.
  finish({ skipped: true });
} else {
  html.classList.add('is-loading');
  // 1. Real signals. Add a scene/asset promise here when WebGL assets stream in.
  const signals = {
    fonts: document.fonts.ready,
    images: Promise.all([...document.images].map((img) => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()))),
    scene: new Promise((r) => setTimeout(r, 700)),   // stand-in for a scene/asset loader
  };
  const total = Object.keys(signals).length;
  let done = 0;
  for (const [name, p] of Object.entries(signals)) {
    p.then(() => { done++; state.real = done / total; signalEls.find((el) => el.dataset.signal === name)?.classList.add('is-done'); });
  }

  // 2. The displayed number chases the real progress in uneven jumps but never overtakes it.
  const tick = setInterval(() => {
    const ceiling = Math.floor(state.real * 100);
    if (state.shown < ceiling) {
      const jump = Math.min(ceiling - state.shown, 3 + Math.floor(Math.random() * 12));
      state.shown += jump;
      countEl.textContent = String(state.shown).padStart(3, '0');
    }
  }, 90);

  // 3. At 100: hold for a beat, then exit by lines.
  Promise.all(Object.values(signals)).then(() => {
    const finishCount = () => {
      clearInterval(tick);
      state.shown = 100;
      countEl.textContent = '100';
      state.finalCount = countEl.textContent;
      const holdStart = performance.now();
      const hold = full() ? 450 : 300;
      setTimeout(() => {
        state.holdMs = Math.round(performance.now() - holdStart);
        if (!full()) return finish({ skipped: false });
        gsap.timeline({ onComplete: () => finish({ skipped: false }) })
          .to('[data-count]', { yPercent: -120, duration: 0.8, ease: 'expo.in' })
          .to('[data-signals] li', { autoAlpha: 0, duration: 0.3, stagger: 0.05 }, '<')
          .to(pre, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.2');
      }, hold);
    };
    // Let the counter reach the ceiling naturally, but never wait more than 600 ms for it.
    const wait = setInterval(() => { if (state.shown >= 97 || performance.now() - t0 > 4000) { clearInterval(wait); finishCount(); } }, 60);
  });

  document.querySelector('[data-skip]').addEventListener('click', () => { clearInterval(tick); gsap.killTweensOf([pre, '[data-count]']); finish({ skipped: true }); });
}

document.querySelector('[data-reload]')?.addEventListener('click', () => location.reload());

awards.addState(() => ({ motion: motionTier(), ...state, preloaderHidden: pre.hidden, isLoading: html.classList.contains('is-loading') }));
