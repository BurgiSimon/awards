'use client'; // Next App Router: measuring, observing and ticking happen in the browser.
// React 19 port of marquee-raf-mask. A float on gsap.ticker (the clock Lenis already rides) instead of a keyframe
// loop, so it can pause, resume without a jump, take speed from scroll velocity and stop off-screen.
// Reads the root Lenis from boot-lenis-gsap's <SmoothScroll>; without one it runs at the base speed.
// Styles: the recipe's .marquee and .track rules (the mask fade lives there).
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useLenis } from '../../boot-lenis-gsap/adapters/react.jsx';

gsap.registerPlugin(useGSAP);

const QUERIES = { full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' };
const tierOf = (c) => {
  const forced = document.documentElement.dataset.motion; // html[data-motion] beats the OS, as in _shared/reduced-motion.js
  return forced === 'full' || forced === 'reduced' || forced === 'static' ? forced : c.reduced ? 'reduced' : 'full';
};
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
// Reduced or static: an ordinary row that scrolls by hand, no mask, so nothing is cut off or unreachable.
const STILL = { overflowX: 'auto', maskImage: 'none', WebkitMaskImage: 'none' };

// items: [{ href, label }] · speed: px/s at rest · velocityShare: share of |lenis.velocity| added · Link: e.g. next/link.
export default function Marquee({ items, speed = 80, velocityShare = 0.6, Link = 'a' }) {
  const el = useRef(null);
  const track = useRef(null);
  const paused = useRef(false);
  const [copies, setCopies] = useState(1);
  const [still, setStill] = useState(false); // the reduced or static tier, known only in the browser
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => { lenisRef.current = lenis; }, [lenis]);

  useGSAP(() => {
    gsap.matchMedia().add(QUERIES, (ctx) => {
      const full = tierOf(ctx.conditions) === 'full';
      setStill(!full);
      if (!full) return;
      const node = el.current;
      const list = track.current;
      let copyWidth = 0;
      let x = 0;
      let v = 0;
      let ticking = false;

      // Measure one copy (the originals) and render clones until the band covers twice its width.
      const fill = () => {
        const gap = parseFloat(getComputedStyle(list).gap) || 0;
        copyWidth = [...list.children].slice(0, items.length).reduce((w, li) => w + li.getBoundingClientRect().width + gap, 0);
        if (copyWidth) setCopies(Math.max(2, Math.ceil((node.clientWidth * 2) / copyWidth) + 1));
      };
      const frame = (time, deltaMs) => {
        const dt = Math.min(0.1, deltaMs / 1000);
        const goal = paused.current ? 0 : speed + Math.abs(lenisRef.current?.velocity || 0) * velocityShare;
        v = damp(v, goal, paused.current ? 14 : 6, dt); // stop faster than you start
        x -= v * dt;
        if (x <= -copyWidth) x += copyWidth;            // wrap at one copy's width
        list.style.transform = `translate3d(${x}px,0,0)`;
      };
      const start = () => { if (ticking) return; fill(); gsap.ticker.add(frame); ticking = true; };
      const stop = () => { if (!ticking) return; gsap.ticker.remove(frame); ticking = false; list.style.transform = ''; setCopies(1); };
      const onResize = () => { if (ticking) fill(); };

      // Never burn frames off-screen.
      const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { rootMargin: '10%' });
      io.observe(node);
      window.addEventListener('resize', onResize);
      return () => { io.disconnect(); window.removeEventListener('resize', onResize); stop(); };
    });
  }, { scope: el });

  const hold = (on) => () => { paused.current = on; };
  const row = (copy) => items.map(({ href, label }) => (
    // Clones are hidden from assistive tech and untabbable, so the list is heard and tabbed once; they stay clickable.
    <li key={`${copy}-${href}-${label}`} data-clone={copy ? '' : undefined} aria-hidden={copy ? true : undefined}>
      <Link href={href} tabIndex={copy ? -1 : undefined}>{label}</Link>
    </li>
  ));

  return (
    <div
      ref={el}
      className="marquee"
      data-marquee
      tabIndex={-1}
      style={still ? STILL : undefined}
      onPointerEnter={hold(true)}
      onPointerLeave={hold(false)}
      onFocus={hold(true)}  // React's focus events bubble like focusin / focusout: a keyboard user can read
      onBlur={hold(false)}
    >
      <ul className="track" ref={track}>
        {Array.from({ length: copies }, (_, copy) => row(copy))}
      </ul>
    </div>
  );
}
