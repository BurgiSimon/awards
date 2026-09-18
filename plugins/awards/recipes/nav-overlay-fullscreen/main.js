import gsap from 'gsap';
import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();
const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

const html = document.documentElement;
const menu = document.querySelector('[data-menu]');
const page = document.querySelector('[data-page]');
const toggle = document.querySelector('[data-menu-toggle]');
const label = document.querySelector('[data-menu-label]');
const closeBtn = document.querySelector('[data-menu-close]');
const words = gsap.utils.toArray('.menu__word');
const focusables = () => [...menu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')];
const state = { open: false, animating: false, opens: 0 };
let lastFocus = null;

function open() {
  if (state.open || state.animating) return;
  state.open = true; state.opens++;
  lastFocus = document.activeElement;
  menu.hidden = false;
  toggle.setAttribute('aria-expanded', 'true');
  label.textContent = 'Close';
  html.classList.add('menu-open');
  page.inert = true;                 // the page behind cannot be reached by focus or assistive tech
  lenis.stop();                      // and cannot scroll
  const full = motionTier() === 'full';
  state.animating = true;
  const tl = gsap.timeline({ onComplete: () => { state.animating = false; focusables()[0]?.focus(); } });
  if (full) {
    tl.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut' })
      .from(words, { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.07 }, '-=0.45');
  } else {
    tl.set(menu, { clipPath: 'inset(0 0 0% 0)' }).set(words, { yPercent: 0 });
  }
}

function close({ restoreFocus = true } = {}) {
  if (!state.open || state.animating) return;
  state.open = false;
  toggle.setAttribute('aria-expanded', 'false');
  label.textContent = 'Menu';
  const full = motionTier() === 'full';
  state.animating = true;
  const done = () => {
    menu.hidden = true;
    html.classList.remove('menu-open');
    page.inert = false;
    lenis.start();
    state.animating = false;
    if (restoreFocus) (lastFocus || toggle).focus();
  };
  if (full) {
    gsap.timeline({ onComplete: done })
      .to(words, { yPercent: -110, duration: 0.5, ease: 'expo.in', stagger: 0.04 })
      .to(menu, { clipPath: 'inset(100% 0 0 0)', duration: 0.7, ease: 'expo.inOut' }, '-=0.2');
  } else {
    done();
  }
}

toggle.addEventListener('click', () => (state.open ? close() : open()));
closeBtn.addEventListener('click', () => close());
menu.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', () => close()));
document.addEventListener('keydown', (e) => {
  if (!state.open) return;
  if (e.key === 'Escape') { e.preventDefault(); close(); return; }
  if (e.key !== 'Tab') return;
  // Focus trap: wrap at both ends, including the toggle button which stays visible above the overlay.
  const items = [toggle, ...focusables()];
  const i = items.indexOf(document.activeElement);
  if (e.shiftKey && (i <= 0)) { e.preventDefault(); items.at(-1).focus(); }
  else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
});

awards.addState(() => ({
  motion: motionTier(),
  open: state.open,
  animating: state.animating,
  pageInert: page.inert === true,
  menuHidden: menu.hidden,
  focusInMenu: !!(document.activeElement && (menu.contains(document.activeElement) || document.activeElement === toggle)),
  activeText: document.activeElement?.textContent?.trim().slice(0, 20) || '',
  expanded: toggle.getAttribute('aria-expanded'),
}));
awards.ready();
