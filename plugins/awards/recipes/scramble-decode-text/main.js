import { animate, scrambleText } from 'animejs';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();
const state = { readouts: 0, runs: 0, done: 0 };

// Each readout keeps its final text in a screen-reader mirror; the scramble plays in an aria-hidden live span.
const items = [...document.querySelectorAll('[data-scramble]')].map((el) => {
  const text = el.textContent.trim();
  el.innerHTML = `<span class="sr-only">${text}</span><span class="live" aria-hidden="true">${text}</span>`;
  return { el, text, live: el.querySelector('.live'), chars: el.dataset.chars || 'uppercase' };
});
state.readouts = items.length;

function decode() {
  state.runs++;
  if (motionTier() !== 'full') { items.forEach((i) => (i.live.textContent = i.text)); state.done += items.length; return; }
  items.forEach((i, n) => {
    animate(i.live, {
      innerHTML: scrambleText({ chars: i.chars, cursor: '░▒▓█', revealRate: 60, settleRate: 30, text: i.text }),
      duration: 1400 + n * 200,
      delay: n * 180,
      ease: 'linear',
      onComplete: () => { i.live.textContent = i.text; state.done++; },
    });
  });
}

document.querySelector('[data-replay]').addEventListener('click', decode);
await document.fonts.ready;
decode();

awards.addState(() => ({
  motion: motionTier(),
  readouts: state.readouts,
  runs: state.runs,
  done: state.done,
  finalTexts: items.map((i) => i.live.textContent),
  sources: items.map((i) => i.text),
}));
awards.ready();
