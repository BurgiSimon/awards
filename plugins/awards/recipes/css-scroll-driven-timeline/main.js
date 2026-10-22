import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

// Where CSS scroll timelines exist this module only reports: the progress bar, the reveals and the sticky
// media are all in style.css and run off the main thread. The fallback below runs only where `view()` is
// unknown, or when ?engine=script forces it for comparison.
syncMotionTierAttribute();
const root = document.documentElement;
const tier = motionTier();
const supported = { scroll: CSS.supports('animation-timeline: scroll()'), view: CSS.supports('animation-timeline: view()') };
const forced = new URLSearchParams(location.search).get('engine') === 'script';
const engine = supported.view && supported.scroll && !forced ? 'css' : 'script';
root.dataset.engine = engine;

const work = { listeners: 0, observers: 0, revealed: 0 };

if (engine === 'script') {
  // The comparison link swaps sides; without support there is nothing to compare, so it goes.
  const name = document.querySelector('[data-engine-name]');
  const link = document.querySelector('[data-engine-link]');
  if (name) name.textContent = 'the script fallback';
  if (link) {
    if (supported.view && supported.scroll) { link.href = './index.html'; link.textContent = 'Back to CSS timelines'; } else link.hidden = true;
  }
  if (tier !== 'static') fallback();
}

function fallback() {
  // Progress: one passive scroll listener, coalesced to a frame. Under reduced motion it moves in tenths, like the CSS steps(10).
  const bar = document.querySelector('[data-progress]');
  let queued = false;
  const paint = () => {
    queued = false;
    const max = Math.max(1, root.scrollHeight - innerHeight);
    const p = Math.min(1, Math.max(0, scrollY / max));
    bar.style.transform = `scaleX(${tier === 'full' ? p : Math.floor(p * 10) / 10})`;
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(paint); } }, { passive: true });
  addEventListener('resize', paint, { passive: true });
  work.listeners = 2;
  paint();

  // Reduced motion: every block is already at its end state; there is nothing to reveal.
  if (tier !== 'full') return;

  // Reveals: mark only what is still below the fold (so nothing on screen blinks), then clear the mark when it is seen.
  // The top margin is effectively unbounded: anything above the viewport counts as seen, so a jump past a block
  // (Home, End, an anchor, find-in-page) never lands on a hidden one.
  const targets = [...document.querySelectorAll('.reveal'), document.querySelector('[data-rail]')].filter(Boolean);
  const below = (el) => el.getBoundingClientRect().top > innerHeight * 0.85;
  for (const el of targets) if (below(el)) el.classList.add('is-pending');
  const watch = (el) => (el.matches('[data-rail]') ? el.querySelector('[data-frame]') : el);
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target.closest('.reveal, [data-rail]');
      el.classList.remove('is-pending');
      io.unobserve(entry.target);
      work.revealed++;
    }
  }, { rootMargin: '1000000px 0px -15% 0px' });
  for (const el of targets) if (el.classList.contains('is-pending')) io.observe(watch(el));
  work.observers = 1;
}

// What a verifier or the jury reads: which path ran, and how much main-thread work it costs.
const num = (v) => Number(Number(v).toFixed(3));
function scaleOf(el) {
  const t = getComputedStyle(el).transform;
  if (!t || t === 'none') return { x: 1, y: 1, tx: 0, ty: 0 };
  const m = new DOMMatrixReadOnly(t);
  return { x: num(Math.hypot(m.a, m.b)), y: num(Math.hypot(m.c, m.d)), tx: num(m.e), ty: num(m.f) };
}
awards.addState(() => ({
  motion: tier,
  engine,
  supported,
  forced,
  mainThread: { ...work, pending: document.querySelectorAll('.is-pending').length },
  timelines: document.getAnimations().filter((a) => a.timeline && !(a.timeline instanceof DocumentTimeline)).length,
  progress: scaleOf(document.querySelector('[data-progress]')).x,
  frame: scaleOf(document.querySelector('[data-frame]')).x,
}));
awards.ready();
