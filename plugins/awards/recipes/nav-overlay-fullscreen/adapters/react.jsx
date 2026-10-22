'use client'; // Next App Router: focus, inert and Lenis live in the browser.
// React 19 port of nav-overlay-fullscreen: the toggle and the overlay together. Put it in the site header, outside
// the page it makes inert and outside any transformed ancestor (the overlay is position: fixed). Stops the root
// Lenis from boot-lenis-gsap's <SmoothScroll> while open. Styles: the recipe's .menu-btn and .menu rules.
import { useEffect, useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useLenis } from '../../boot-lenis-gsap/adapters/react.jsx';

gsap.registerPlugin(useGSAP);

const QUERIES = { full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' };
const tierOf = (c) => {
  const forced = document.documentElement.dataset.motion; // html[data-motion] beats the OS, as in _shared/reduced-motion.js
  return forced === 'full' || forced === 'reduced' || forced === 'static' ? forced : c.reduced ? 'reduced' : 'full';
};
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// links: [{ href, label }] · pageRef: the content made inert while open (default: [data-page], else <main>)
// · Link: e.g. next/link · meta: the small line under the list · label: the dialog's accessible name.
export default function NavOverlay({ links, pageRef, Link = 'a', meta, label = 'Site menu' }) {
  const root = useRef(null);
  const toggle = useRef(null);
  const menu = useRef(null);
  const tier = useRef('full');
  const isOpen = useRef(false);
  const busy = useRef(false);
  const lastFocus = useRef(null);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const menuId = useId();
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => { lenisRef.current = lenis; }, [lenis]);

  const page = () => pageRef?.current ?? document.querySelector('[data-page]') ?? document.querySelector('main');
  const lock = (on) => {
    document.documentElement.classList.toggle('menu-open', on); // recolours the toggle; overflow: hidden backs up native scroll
    const p = page();
    if (p) p.inert = on;                                       // unreachable by focus and assistive technology
    if (on) lenisRef.current?.stop(); else lenisRef.current?.start();
  };

  const { contextSafe } = useGSAP(() => {
    gsap.matchMedia().add(QUERIES, (ctx) => { tier.current = tierOf(ctx.conditions); });
    return () => { if (isOpen.current) lock(false); }; // unmounted while open: give the page back
  }, { scope: root });

  const openMenu = contextSafe(() => {
    if (isOpen.current || busy.current) return;
    isOpen.current = true;
    busy.current = true;
    lastFocus.current = document.activeElement;
    flushSync(() => { setOpen(true); setShown(true); }); // the overlay must be in the layout before it animates
    lock(true);
    const words = menu.current.querySelectorAll('.menu__word');
    const tl = gsap.timeline({ onComplete: () => { busy.current = false; menu.current.querySelector(FOCUSABLE)?.focus(); } });
    if (tier.current === 'full') {
      tl.fromTo(menu.current, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut' })
        .fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.07 }, '-=0.45'); // fromTo: a reopen starts below the mask again
    } else {
      tl.set(menu.current, { clipPath: 'inset(0 0 0% 0)' }).set(words, { yPercent: 0 });
    }
  });

  const closeMenu = contextSafe(({ restoreFocus = true } = {}) => {
    if (!isOpen.current || busy.current) return;
    isOpen.current = false;
    busy.current = true;
    setOpen(false);
    const done = () => {
      setShown(false);
      lock(false);
      busy.current = false;
      if (restoreFocus) (lastFocus.current || toggle.current)?.focus();
    };
    if (tier.current !== 'full') { done(); return; }
    gsap.timeline({ onComplete: done })
      .to(menu.current.querySelectorAll('.menu__word'), { yPercent: -110, duration: 0.5, ease: 'expo.in', stagger: 0.04 })
      .to(menu.current, { clipPath: 'inset(100% 0 0 0)', duration: 0.7, ease: 'expo.inOut' }, '-=0.2');
  });

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
      if (e.key !== 'Tab') return;
      // Focus trap: wrap at both ends, including the toggle, which stays visible above the overlay.
      const items = [toggle.current, ...menu.current.querySelectorAll(FOCUSABLE)];
      const i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items.at(-1).focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeMenu]);

  return (
    <div ref={root} style={{ display: 'contents' }}>
      <button
        ref={toggle}
        type="button"
        className="menu-btn"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="dialog"
        onClick={() => (isOpen.current ? closeMenu() : openMenu())}
      >
        <span className="menu-btn__bars" aria-hidden="true"><i /><i /></span>
        <span className="label">{open ? 'Close' : 'Menu'}</span>
      </button>
      <div ref={menu} className="menu" id={menuId} data-theme="dark" role="dialog" aria-modal="true" aria-label={label} hidden={!shown}>
        <div className="menu__inner wrap">
          <button type="button" className="menu__close label" onClick={() => closeMenu()}>Close</button>
          <nav aria-label="Primary">
            <ol className="menu__list">
              {links.map(({ href, label: text }) => (
                <li key={href}><Link href={href} onClick={() => closeMenu()}><span className="menu__word">{text}</span></Link></li>
              ))}
            </ol>
          </nav>
          {meta && <p className="menu__meta label">{meta}</p>}
        </div>
      </div>
    </div>
  );
}
