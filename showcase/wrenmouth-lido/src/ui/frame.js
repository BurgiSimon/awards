// SIGNATURE — the empty frame you can turn over. A paper with its caption pencilled on the back.
// full: a 0.7 s turn on the house in-out curve, the print lifting 8 px and its shadow lengthening while it turns.
// reduced: the faces cross-fade in 200 ms. static: no turn; the back is printed beneath the front (CSS default).
import gsap from 'gsap';
import { motionTier } from '../lib/reduced-motion.js';

export function initFrames() {
  const frames = [];
  document.querySelectorAll('[data-frame]').forEach((frame) => {
    const host = frame.parentElement;
    const button = host.querySelector('[data-frame-turn]');
    const card = frame.querySelector('[data-frame-card]');
    const front = frame.querySelector('.frame__face--front');
    const back = frame.querySelector('[data-frame-back]');
    if (!button || !card || !back) return;
    const tier = motionTier();
    if (tier === 'static') return; // the static tier keeps both faces readable, one under the other
    frame.dataset.turnable = tier;
    button.hidden = false;
    back.setAttribute('aria-hidden', 'true');
    const live = document.createElement('p');
    live.className = 'sr-only';
    live.setAttribute('aria-live', 'polite');
    host.append(live);

    const state = { turned: false, busy: false };
    function set(turned, { announce = true } = {}) {
      state.turned = turned;
      button.setAttribute('aria-pressed', String(turned));
      button.textContent = turned ? 'Turn it back' : 'Turn it over';
      back.setAttribute('aria-hidden', String(!turned));
      frame.classList.toggle('is-turned', turned);
      if (announce) live.textContent = turned ? `On the back, in pencil: ${back.textContent.trim()}` : 'The front: not taken yet.';
    }
    function turn(to = !state.turned, opts) {
      if (state.busy) return Promise.resolve();
      const t = motionTier();
      set(to, opts);
      return new Promise((resolve) => {
        if (t === 'full') {
          state.busy = true;
          gsap.timeline({ onComplete: () => { state.busy = false; resolve(); } })
            .to(card, { rotationY: to ? 180 : 0, duration: 0.7, ease: 'sine.inOut' }, 0)
            .to(card, { y: -8, '--lift': 14, duration: 0.35, ease: 'sine.out', yoyo: true, repeat: 1 }, 0);
        } else {
          gsap.set(card, { rotationY: 0 });
          gsap.fromTo(to ? back : front, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'none' });
          gsap.set(to ? front : back, { autoAlpha: 0 });
          resolve();
        }
      });
    }
    if (tier === 'reduced') { frame.dataset.turnable = 'fade'; gsap.set(back, { autoAlpha: 0 }); }
    button.addEventListener('click', () => turn());
    frames.push({ frame, turn, state });
  });
  return frames;
}
