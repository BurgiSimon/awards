import gsap from 'gsap';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute, onMotionTierChange } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();

const root = document.querySelector('[data-tabs]');
const list = root.querySelector('[role="tablist"]');
const tabs = [...list.querySelectorAll('[role="tab"]')];
const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
const bars = tabs.map((t) => t.querySelector('[data-bar]'));
const toggle = document.querySelector('[data-autoplay-toggle]');
const DELAY = Number(root.dataset.delay || 5000) / 1000;
const round = (v) => Math.round(v * 1000) / 1000;
const progressOf = (i) => Number(gsap.getProperty(bars[i], 'scaleX')) || 0;

const holds = new Set(); // why the clock is stopped: hover, focus, offscreen, user
let index = 0;
let clock = null;
let autoplay = false;
let seen = false;
const log = { advances: 0, lastAdvanceProgress: null, lastSelect: null };

// The bar IS the timer: a linear scaleX 0 → 1 over the delay; its completion advances the set.
function run() {
  clock?.kill();
  clock = null;
  if (!autoplay || !seen) return;
  clock = gsap.fromTo(bars[index], { scaleX: 0 }, {
    scaleX: 1, duration: DELAY, ease: 'none', paused: holds.size > 0,
    onComplete: () => {
      log.advances++;
      log.lastAdvanceProgress = round(progressOf(index));
      select((index + 1) % tabs.length, 'auto');
    },
  });
}

function hold(reason, on) {
  if (on) holds.add(reason); else holds.delete(reason);
  if (clock) holds.size ? clock.pause() : clock.resume();
}

function reveal(panel) {
  const tier = motionTier();
  if (tier === 'static') return;
  // Reduced keeps the crossfade (a state change) and drops the rise (movement).
  gsap.fromTo(panel, { autoAlpha: 0, y: tier === 'full' ? 16 : 0 }, { autoAlpha: 1, y: 0, duration: tier === 'full' ? 0.6 : 0.3, ease: 'expo.out', overwrite: true });
}

// Any choice (click, key, or the clock itself) restarts the timer from 0 on the new tab.
function select(next, via, focus = false) {
  log.lastSelect = { from: index, to: next, via, progressBefore: round(progressOf(index)) };
  gsap.set(bars[index], { scaleX: 0 });
  tabs[index].setAttribute('aria-selected', 'false');
  tabs[index].tabIndex = -1;
  panels[index].hidden = true;
  index = next;
  tabs[index].setAttribute('aria-selected', 'true');
  tabs[index].tabIndex = 0;
  panels[index].hidden = false;
  if (focus) tabs[index].focus();
  reveal(panels[index]);
  run();
}

tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i, 'click')));

// Roving tabindex with automatic activation; both axes so the same list works stacked or in a row.
const STEP = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
list.addEventListener('keydown', (e) => {
  const from = Math.max(0, tabs.indexOf(document.activeElement));
  let next;
  if (e.key in STEP) next = (from + STEP[e.key] + tabs.length) % tabs.length;
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = tabs.length - 1;
  else return;
  e.preventDefault();
  select(next, 'key', true);
});

root.addEventListener('pointerenter', () => hold('hover', true));
root.addEventListener('pointerleave', () => hold('hover', false));
// Keyboard focus holds the clock; a mouse click's focus does not, or the set would stall after every click.
root.addEventListener('focusin', (e) => hold('focus', e.target.matches(':focus-visible')));
root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) hold('focus', false); });

toggle.addEventListener('click', () => {
  const paused = !holds.has('user');
  hold('user', paused);
  toggle.setAttribute('aria-pressed', String(paused));
});

// Start only once in view; stop off screen and resume where it was.
new IntersectionObserver(([entry]) => {
  hold('offscreen', !entry.isIntersecting);
  if (entry.isIntersecting && !seen) { seen = true; run(); }
}, { rootMargin: '0px 0px -25% 0px' }).observe(root);

// Reduced and static tiers: no auto-advance, no bar, no pause control; the tabs stay fully usable.
function applyTier(tier) {
  autoplay = tier === 'full';
  root.dataset.autoplay = autoplay ? 'on' : 'off';
  toggle.hidden = !autoplay;
  if (!autoplay) gsap.set(bars, { scaleX: 0 });
  run();
}
applyTier(motionTier());
onMotionTierChange(applyTier);

awards.addState(() => ({
  motion: motionTier(),
  autoplay,
  started: seen,
  index,
  progress: round(progressOf(index)),
  bars: bars.map((_, i) => round(progressOf(i))),
  running: !!clock && !clock.paused(),
  holds: [...holds],
  ...log,
  visiblePanel: panels.find((p) => !p.hidden)?.id ?? null,
  focused: document.activeElement?.id || null,
}));
awards.ready();
