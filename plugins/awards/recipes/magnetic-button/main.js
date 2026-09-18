import gsap from 'gsap';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();

const state = { active: false, x: 0, y: 0, engaged: 0 };
const fine = matchMedia('(pointer: fine) and (hover: hover)');

function magnetise(el) {
  const ring = el.querySelector('[data-magnet-ring]');
  const text = el.querySelector('[data-magnet-text]');
  const radiusFactor = Number(el.dataset.radius || 1.5);
  const textFactor = Number(el.dataset.strength || 0.4);
  // One quickTo per axis: retargeting a live tween is cheaper and smoother than a tween per pointermove.
  const toX = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'expo.out' });
  const toY = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'expo.out' });
  const textX = gsap.quickTo(text, 'x', { duration: 0.6, ease: 'expo.out' });
  const textY = gsap.quickTo(text, 'y', { duration: 0.6, ease: 'expo.out' });
  let rect = el.getBoundingClientRect();
  let radius = Math.hypot(rect.width, rect.height) * radiusFactor;
  let inside = false;

  const measure = () => { rect = el.getBoundingClientRect(); radius = Math.hypot(rect.width, rect.height) * radiusFactor; };
  const release = () => { inside = false; state.active = false; toX(0); toY(0); textX(0); textY(0); ring.style.transform = ''; };

  let lastScroll = -1;
  const onMove = (e) => {
    // Scroll events arrive a frame late; if the page moved since the last measure, measure now.
    if (window.scrollY !== lastScroll) { measure(); lastScroll = window.scrollY; }
    // The rect includes our own translation, so subtract the live x/y to find the resting centre.
    const cx = rect.left + rect.width / 2 - (Number(gsap.getProperty(el, 'x')) || 0);
    const cy = rect.top + rect.height / 2 - (Number(gsap.getProperty(el, 'y')) || 0);
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > radius) { if (inside) release(); return; }
    // Falloff: full pull at the centre, zero at the radius edge (smoothstep keeps the edge continuous).
    const t = 1 - dist / radius;
    const pull = t * t * (3 - 2 * t);
    const x = dx * 0.35 * pull;
    const y = dy * 0.35 * pull;
    inside = true;
    state.active = true; state.x = x; state.y = y; state.engaged++;
    toX(x); toY(y);
    textX(x * textFactor); textY(y * textFactor);
  };

  const arm = () => {
    if (!fine.matches || motionTier() !== 'full') { release(); return; }
    measure();
    window.addEventListener('pointermove', onMove, { passive: true });
  };
  const disarm = () => { window.removeEventListener('pointermove', onMove); release(); };

  arm();
  fine.addEventListener('change', () => (fine.matches ? arm() : disarm()));
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => (motionTier() === 'full' ? arm() : disarm()));
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', measure, { passive: true });
  document.addEventListener('pointerleave', release);
  return { measure };
}

document.querySelectorAll('[data-magnet]').forEach(magnetise);

awards.addState(() => ({
  motion: motionTier(),
  finePointer: fine.matches,
  magnetActive: state.active,
  offset: [Math.round(state.x), Math.round(state.y)],
  buttonTransform: getComputedStyle(document.querySelector('[data-magnet]')).transform,
}));
awards.ready();
