// One place that answers "how much motion may this page use?". Three tiers, never a blanket kill:
//   full     — the authored score
//   reduced  — no spatial movement; opacity, colour and state changes stay
//   static   — everything settled on load (very low-end devices or an explicit data-motion="static")
const mq = matchMedia('(prefers-reduced-motion: reduce)');

export function prefersReducedMotion() {
  return mq.matches;
}

export function motionTier() {
  const forced = document.documentElement.dataset.motion;
  if (forced === 'static' || forced === 'reduced' || forced === 'full') return forced;
  if (mq.matches) return 'reduced';
  return 'full';
}

export function onMotionTierChange(cb) {
  const handler = () => cb(motionTier());
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}

// Reflect the tier on <html> so CSS can branch: html[data-motion="reduced"] .marquee { animation: none }
export function syncMotionTierAttribute() {
  const apply = () => {
    if (!document.documentElement.dataset.motion || document.documentElement.dataset.motion === 'auto') {
      document.documentElement.setAttribute('data-motion-tier', motionTier());
    }
  };
  apply();
  mq.addEventListener('change', apply);
}
