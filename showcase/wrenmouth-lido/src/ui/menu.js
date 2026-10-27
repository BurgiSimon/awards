// The phone menu: a dialog after the page wrapper. inert on the page, focus trapped, Escape closes, focus returns.
import gsap from 'gsap';
import { motionTier } from '../lib/reduced-motion.js';

export function initMenu(scroll) {
  const menu = document.querySelector('[data-menu]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const page = document.querySelector('[data-page-wrap]');
  if (!menu || !toggle || !page) return;
  const closeBtn = menu.querySelector('[data-menu-close]');
  const items = () => [...menu.querySelectorAll('a[href], button:not([disabled])')];
  const state = { open: false, busy: false };
  let last = null;

  function open() {
    if (state.open || state.busy) return;
    state.open = true;
    last = document.activeElement;
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-open');
    page.inert = true;
    scroll?.stop();
    const links = menu.querySelectorAll('.menu__list li');
    if (motionTier() === 'full') {
      state.busy = true;
      gsap.timeline({ onComplete: () => { state.busy = false; } })
        .fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.42, ease: 'power2.inOut' })
        .fromTo(links, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.42, ease: 'power3.out', stagger: 0.05 }, '-=0.16');
    } else {
      gsap.set(menu, { clipPath: 'none' });
      gsap.set(links, { clearProps: 'all' });
    }
    closeBtn.focus();
  }

  function close({ restore = true } = {}) {
    if (!state.open) return;
    state.open = false;
    toggle.setAttribute('aria-expanded', 'false');
    const done = () => {
      menu.hidden = true;
      document.documentElement.classList.remove('menu-open');
      page.inert = false;
      scroll?.start();
      state.busy = false;
      if (restore) (last || toggle).focus();
    };
    if (motionTier() === 'full') {
      state.busy = true;
      gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.32, ease: 'power2.in', onComplete: done });
    } else done();
  }

  toggle.addEventListener('click', () => (state.open ? close() : open()));
  closeBtn.addEventListener('click', () => close());
  menu.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', () => close({ restore: false })));
  document.addEventListener('keydown', (e) => {
    if (!state.open) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const list = items();
    const i = list.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); list.at(-1).focus(); }
    else if (!e.shiftKey && i === list.length - 1) { e.preventDefault(); list[0].focus(); }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) close({ restore: false }); });
  return { state };
}
