import { awards } from '../../_shared/awards-hook.js';
import { ticker, clamp } from '../../_shared/raf.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// The template a draft starts from: one bar filled by its section's scroll progress, written as a transform on the
// shared ticker only while the section is on screen; under reduced motion and static the bar holds its final state.

syncMotionTierAttribute();
let tier = motionTier();

const stage = document.querySelector('[data-stage]');
const bar = document.querySelector('[data-bar]');
const value = document.querySelector('[data-value]');
const state = { progress: 0, frames: 0 };

function progressOf(el) {
  const r = el.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
}
function draw() {
  const p = tier === 'full' ? progressOf(stage) : 1;
  if (p === state.progress && state.frames) return;
  state.progress = p;
  state.frames++;
  bar.style.transform = `scaleX(${p.toFixed(4)})`;
  value.textContent = String(Math.round(p * 100));
}

// The ticker runs only while the stage is in view.
let off = null;
new IntersectionObserver(([en]) => {
  if (en.isIntersecting && !off) off = ticker.add(draw);
  else if (!en.isIntersecting && off) { off(); off = null; draw(); }
}).observe(stage);
onMotionTierChange((t) => { tier = t; draw(); });
draw();

awards.addState(() => ({ motion: tier, ...state }));
awards.ready();
