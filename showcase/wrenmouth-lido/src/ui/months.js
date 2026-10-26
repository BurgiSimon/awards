// The interruption: twelve months as a native radio group. Arrows move between months; the answer swaps in place.
import gsap from 'gsap';
import { motionTier } from '../lib/reduced-motion.js';

export function initMonths() {
  const root = document.querySelector('[data-months]');
  if (!root) return;
  const answers = [...root.querySelectorAll('.months__answer')];
  const current = new Date().getMonth();
  const show = (i, animate = true) => {
    answers.forEach((a) => { a.hidden = Number(a.dataset.month) !== i; });
    const panel = answers[i];
    if (animate && motionTier() === 'full') {
      gsap.fromTo(panel.querySelector('.months__temp'), { yPercent: 18, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.42, ease: 'power3.out' });
      gsap.fromTo(panel.querySelector('.months__copy'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'none', delay: 0.06 });
    }
  };
  root.addEventListener('change', (e) => { if (e.target.name === 'month') show(Number(e.target.value)); });
  // Open on this month, so the first answer is the honest one for today.
  const radio = root.querySelector(`input[name="month"][value="${current}"]`);
  if (radio) { radio.checked = true; show(current, false); }
}
