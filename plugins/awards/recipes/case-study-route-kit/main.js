import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

// One module for both routes. The only motion is a reveal for what starts below the fold: full tier rises and
// fades (style.css tokens), reduced fades only, static holds nothing back. Nothing in the first viewport is ever
// hidden, so the page paints complete and a failed script leaves every word visible.
syncMotionTierAttribute();
const tier = motionTier();
const reveals = [...document.querySelectorAll('[data-reveal]')];
let shown = 0;

if (tier !== 'static' && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.remove('is-pending');
      io.unobserve(e.target);
      shown++;
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  for (const el of reveals) {
    if (el.getBoundingClientRect().top < innerHeight) continue;
    el.classList.add('is-pending');
    io.observe(el);
  }
}

awards.addState(() => ({
  page: document.body.dataset.page,
  motion: tier,
  reveals: reveals.length,
  pending: document.querySelectorAll('.is-pending').length,
  shown,
}));
awards.ready();
