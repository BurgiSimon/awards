import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();

const RATE = 90;    // px per second of ticker time: dt is clamped to 100 ms, so a stalled frame cannot jump the page
const FOREIGN = 3;  // px: the page sits this far from where we put it, so something else moved it
const NOTE_ON = 'A steady pace. Any wheel, touch, press or key takes it back.';
const NOTE_OFF = 'Unavailable: your system asks for reduced motion.';
const REASONS = {
  wheel: 'the wheel took over',
  touch: 'a touch took over',
  pointer: 'a pointer press took over',
  key: 'a key press took over',
  scroll: 'the page was scrolled another way',
  button: 'turned off',
  motion: 'reduced motion is on',
};

const toggle = document.querySelector('[data-auto]');
const stateText = document.querySelector('[data-auto-state]');
const note = document.querySelector('[data-note]');
const status = document.querySelector('[data-status]');

// One clock: the shared ticker drives Lenis (1.3 defaults to autoRaf: false; a Lenis with no clock swallows the wheel).
const lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: motionTier() === 'full' });
window.lenis = lenis;

const S = { on: false, y: 0, reason: null, starts: 0, stops: 0, startedAt: null, stoppedAt: null };
const allowed = () => motionTier() === 'full';

function render() {
  toggle.setAttribute('aria-pressed', String(S.on));
  stateText.textContent = S.on ? 'on' : 'off';
}
// One polite status line, written only on a change: nothing is announced on load.
const announce = (text) => { status.textContent = text; };

function start() {
  if (lenis.limit - scrollY < 1) { announce('Auto scroll needs room: this is already the end of the page.'); return; }
  S.on = true; S.y = scrollY; S.reason = null; S.starts++; S.startedAt = Math.round(scrollY);
  render();
  announce('Auto scroll on.');
}

function stop(reason) {
  if (!S.on) return;
  S.on = false; S.reason = reason; S.stops++; S.stoppedAt = Math.round(scrollY);
  render();
  announce(reason === 'end' ? 'Auto scroll stopped at the end of the page.' : `Auto scroll off: ${REASONS[reason]}.`);
}

// Under reduced motion (and the static tier) the toggle stays focusable, so the reason can be found, but it does nothing.
function syncAllowed() {
  const ok = allowed();
  toggle.setAttribute('aria-disabled', String(!ok));
  note.textContent = ok ? NOTE_ON : NOTE_OFF;
  lenis.options.smoothWheel = ok;
  if (!ok) stop('motion');
}

toggle.addEventListener('click', () => {
  if (!allowed()) { announce(`Auto scroll is unavailable: ${REASONS.motion}.`); return; }
  if (S.on) stop('button'); else start();
});

// Every road back. Capture phase, so the hand-back happens before anything else reads the event.
// The toggle's own press and activation keys are left to its click, or a press would stop and restart it.
const onToggle = (e) => toggle.contains(e.target);
addEventListener('wheel', () => stop('wheel'), { capture: true, passive: true });
addEventListener('touchstart', (e) => { if (!onToggle(e)) stop('touch'); }, { capture: true, passive: true });
addEventListener('pointerdown', (e) => { if (!onToggle(e)) stop(e.pointerType === 'touch' ? 'touch' : 'pointer'); }, { capture: true });
addEventListener('keydown', (e) => {
  if (onToggle(e) && (e.key === 'Enter' || e.key === ' ')) return;
  stop('key');
}, { capture: true });

ticker.add((dt, t) => {
  if (S.on) {
    // A scroll we did not write (scrollbar drag, find-in-page, a link, a focus move) hands back as well.
    if (Math.abs(scrollY - S.y) > FOREIGN) stop('scroll');
    else {
      S.y = Math.min(lenis.limit, S.y + RATE * dt);
      lenis.scrollTo(S.y, { immediate: true, force: true });
      if (S.y >= lenis.limit - 0.5) stop('end');
    }
  }
  lenis.raf(t);
});

onMotionTierChange(syncAllowed);
syncAllowed();
render();

awards.addState(() => ({
  motion: motionTier(),
  allowed: allowed(),
  on: S.on,
  pressed: toggle.getAttribute('aria-pressed'),
  disabled: toggle.getAttribute('aria-disabled'),
  reason: S.reason,
  starts: S.starts,
  stops: S.stops,
  startedAt: S.startedAt,
  stoppedAt: S.stoppedAt,
  y: Math.round(scrollY),
  limit: Math.round(lenis.limit),
  rate: RATE,
  status: status.textContent,
  note: note.textContent,
}));
awards.ready();
