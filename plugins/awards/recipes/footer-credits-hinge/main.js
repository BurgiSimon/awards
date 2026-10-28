import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

// The close: a closing sheet (the page's ground and the wordmark) slides off a footer stage that sticks inside a rail
// starting half a viewport above it, tipping on its top-left corner as it goes. The credits live under the stage;
// opening them scrolls to the end and lifts and tilts the stage on one CSS transition. Escape, the close button or a
// scroll after the arming delay puts the sheet back down.

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();
const tier = motionTier();
const full = tier === 'full';

const close = document.querySelector('[data-close]');
const sheet = document.querySelector('[data-sheet]');
const content = document.querySelector('[data-content]');
const trigger = document.querySelector('[data-credits]');
const panel = document.querySelector('[data-panel]');
const title = panel.querySelector('h2');
const closeBtn = panel.querySelector('[data-credits-close]');

const OPEN_SCROLL = 0.8;   // s: the scroll to the end, run alongside the lift
const ARM = full ? 0.85 : 0.3; // s: after this, a scroll of more than SCROLL_CLOSE px closes the credits
const SCROLL_CLOSE = 24;   // px
const expoOut = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

// One clock: GSAP's ticker drives Lenis, Lenis feeds ScrollTrigger. Smooth scroll only in the full tier.
let lenis = null;
if (full) {
  lenis = new Lenis({ lerp: 0.12, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis;
}

// The blink family, registered once and composed by name: hard opacity steps, never a fade. Hover and keyboard
// focus get one step; a press gets the full ladder. Nothing blinks outside the full tier.
gsap.registerEffect({
  name: 'blink',
  extendTimeline: true,
  effect: (targets) => gsap.timeline().set(targets, { opacity: 0 }, 0).set(targets, { opacity: 1 }, 0.06).set(targets, { opacity: 0 }, 0.12).set(targets, { opacity: 1, clearProps: 'opacity' }, 0.18),
});
gsap.registerEffect({
  name: 'blinkOnce',
  extendTimeline: true,
  effect: (targets) => gsap.timeline().set(targets, { opacity: 0 }, 0).set(targets, { opacity: 1, clearProps: 'opacity' }, 0.06),
});
let blinks = 0;
const blink = (el, kind = 'blinkOnce') => {
  if (!full) return;
  gsap.killTweensOf(el);
  gsap.effects[kind](el);
  blinks++;
};
document.querySelectorAll('[data-blink]').forEach((el) => {
  el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') blink(el); });
  el.addEventListener('focus', () => { if (el.matches(':focus-visible')) blink(el); });
});

// The footer's height: the sheet plus the stage's content. The lift: the credits' own height, plus a margin, plus
// what the tilt takes back at the corner that drops (half the stage's width × sin |tilt|). Both re-measured whenever
// the content or the credits reflow (a longer translation, a narrower window).
const stage = document.querySelector('[data-stage]');
const measure = () => {
  close.style.setProperty('--content-h', `${Math.ceil(content.offsetHeight)}px`);
  const tilt = Math.abs(parseFloat(getComputedStyle(close).getPropertyValue('--tilt')) || 0) * (Math.PI / 180);
  close.style.setProperty('--lift', `${Math.ceil(panel.offsetHeight + 24 + (stage.offsetWidth / 2) * Math.sin(tilt))}px`);
  ScrollTrigger.refresh();
};
const ro = new ResizeObserver(measure);
ro.observe(content);
ro.observe(panel);

// Scrubs (full tier only): the sheet tips on its top-left corner from the moment the stage sticks to the last
// pixel; the stage's content rises the last few percent as the sheet's foot clears the viewport.
const mm = gsap.matchMedia();
if (full) {
  mm.add({ wide: '(min-width: 761px)', narrow: '(max-width: 760px)' }, (ctx) => {
    const { wide } = ctx.conditions;
    gsap.timeline({ scrollTrigger: { trigger: sheet, start: 'top center', end: 'max', scrub: true, invalidateOnRefresh: true } })
      .to(sheet, wide ? { xPercent: -6, rotation: -5, ease: 'none' } : { xPercent: -10, yPercent: -24, rotation: -5, ease: 'none' }, 0);
    gsap.timeline({ scrollTrigger: { trigger: sheet, start: 'bottom bottom', end: 'max', scrub: true, invalidateOnRefresh: true } })
      .fromTo(content, { yPercent: 12 }, { yPercent: 0, ease: 'none' }, 0);
  });
}

// Open and close.
let open = false;
let armedAt = null;
let armTimer = null;
let movingFocus = false;
const focusQuietly = (el) => { movingFocus = true; el.focus({ preventScroll: true }); movingFocus = false; };
const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);

function setOpen(next, { restoreFocus = true } = {}) {
  if (next === open) return;
  open = next;
  close.classList.toggle('is-open', open);
  trigger.setAttribute('aria-expanded', String(open));
  panel.inert = !open;
  armTimer?.kill();
  armedAt = null;
  if (open) {
    const max = maxScroll();
    if (scrollY < max - 2) {
      if (lenis) lenis.scrollTo(max, { duration: OPEN_SCROLL, easing: expoOut, force: true });
      else window.scrollTo(0, max);
    }
    focusQuietly(title);
    armTimer = gsap.delayedCall(ARM, () => { armedAt = scrollY; });
  } else if (restoreFocus) {
    focusQuietly(trigger);
  }
}

trigger.addEventListener('click', () => { blink(trigger, 'blink'); setOpen(!open); });
closeBtn.addEventListener('click', () => setOpen(false));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && open) { e.preventDefault(); setOpen(false); }
});
// Any deliberate scroll after the arming delay closes the credits; focus goes back to the trigger only when it was
// inside the panel (a closed panel is inert, so focus would otherwise fall to the body).
addEventListener('scroll', () => {
  if (!open || armedAt === null || Math.abs(scrollY - armedAt) <= SCROLL_CLOSE) return;
  setOpen(false, { restoreFocus: panel.contains(document.activeElement) });
}, { passive: true });

// Keyboard focus never lands under the closing sheet or the open credits. Once the stage sticks, its links count as
// "in view" to the browser even while the sheet still covers them, so keyboard focus on anything in the stage jumps to
// the end first; while the credits are open (the page is already at the end, but the lifted stage tucks its first
// links under the sheet, and the reduced tier's panel covers its base row) it puts the credits away first.
// Pointer focus (a press on the trigger) and the focus this script moves itself are left alone: a jump between
// pointerdown and click would move the button out from under the press.
content.addEventListener('focusin', (e) => {
  if (movingFocus || !e.target.matches(':focus-visible')) return;
  if (open) { setOpen(false, { restoreFocus: false }); return; }
  const max = maxScroll();
  if (scrollY >= max - 2) return;
  if (lenis) lenis.scrollTo(max, { immediate: true, force: true });
  else window.scrollTo(0, max);
});

addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

const angle = (el) => {
  const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
  return Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI * 100) / 100;
};
awards.addState(() => {
  const max = maxScroll();
  const st = new DOMMatrixReadOnly(getComputedStyle(stage).transform);
  const a = document.activeElement;
  return {
    motion: tier,
    open,
    expanded: trigger.getAttribute('aria-expanded'),
    panelInert: panel.inert,
    panelVisibility: getComputedStyle(panel).visibility,
    panelOpacity: Number(getComputedStyle(panel).opacity),
    armed: armedAt !== null,
    sheetAngle: angle(sheet),
    stageAngle: angle(stage),
    stageLift: Math.round(-st.m42),
    contentShift: Math.round(Number(gsap.getProperty(content, 'yPercent')) * 100) / 100,
    scrollY: Math.round(scrollY),
    max: Math.round(max),
    atEnd: scrollY >= max - 2,
    focus: a === title ? 'credits-title' : a === trigger ? 'trigger' : a === closeBtn ? 'close' : a?.tagName?.toLowerCase() ?? null,
    blinks,
    lenis: !!lenis,
  };
});
awards.ready();
