'use client'; // Next App Router: pointer listeners and quickTo are browser-only.
// React 19 port of magnetic-button. A real <a> (with href) or <button>; it leans toward a fine pointer inside a
// radius and is an ordinary control everywhere else. No Lenis needed. Styles: the recipe's .magnet rules.
import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const QUERIES = {
  fine: '(pointer: fine) and (hover: hover)',
  full: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
};
const tierOf = (c) => {
  const forced = document.documentElement.dataset.motion; // html[data-motion] beats the OS, as in _shared/reduced-motion.js
  return forced === 'full' || forced === 'reduced' || forced === 'static' ? forced : c.reduced ? 'reduced' : 'full';
};

// radius: × the button's diagonal · strength: the label's share of the ring's displacement · pull: share of the pointer offset.
export default function MagneticButton({ href, radius = 1.6, strength = 0.45, pull = 0.35, className = 'magnet', children, ...rest }) {
  const el = useRef(null);
  const text = useRef(null);

  useGSAP(() => {
    gsap.matchMedia().add(QUERIES, (ctx) => {
      // Coarse pointers, no hover, reduced or static: no listeners at all; focus still gets the full-strength ring (CSS).
      if (!ctx.conditions.fine || tierOf(ctx.conditions) !== 'full') return;
      const node = el.current;
      // One quickTo per axis, retargeted on every move: cheaper and smoother than a tween per pointermove.
      const toX = gsap.quickTo(node, 'x', { duration: 0.6, ease: 'expo.out' });
      const toY = gsap.quickTo(node, 'y', { duration: 0.6, ease: 'expo.out' });
      const textX = gsap.quickTo(text.current, 'x', { duration: 0.6, ease: 'expo.out' });
      const textY = gsap.quickTo(text.current, 'y', { duration: 0.6, ease: 'expo.out' });
      let rect = node.getBoundingClientRect();
      let reach = Math.hypot(rect.width, rect.height) * radius;
      let inside = false;
      let lastScroll = -1;

      const measure = () => { rect = node.getBoundingClientRect(); reach = Math.hypot(rect.width, rect.height) * radius; };
      const release = () => { inside = false; toX(0); toY(0); textX(0); textY(0); };
      const onMove = (e) => {
        if (window.scrollY !== lastScroll) { measure(); lastScroll = window.scrollY; } // scroll events arrive a frame late
        // The rect includes our own translation; subtract the live x/y to find the resting centre.
        const cx = rect.left + rect.width / 2 - (Number(gsap.getProperty(node, 'x')) || 0);
        const cy = rect.top + rect.height / 2 - (Number(gsap.getProperty(node, 'y')) || 0);
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > reach) { if (inside) release(); return; }
        const t = 1 - dist / reach;          // full pull at the centre, zero at the edge;
        const falloff = t * t * (3 - 2 * t); // smoothstep keeps the boundary continuous
        const x = dx * pull * falloff;
        const y = dy * pull * falloff;
        inside = true;
        toX(x); toY(y);
        textX(x * strength); textY(y * strength);
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('resize', measure);
      window.addEventListener('scroll', measure, { passive: true });
      document.addEventListener('pointerleave', release);
      return () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('resize', measure);
        window.removeEventListener('scroll', measure);
        document.removeEventListener('pointerleave', release);
      };
    });
  }, { scope: el });

  const inner = (
    <>
      <span className="ring" aria-hidden="true" />
      <span className="text" ref={text}>{children}</span>
    </>
  );
  return href
    ? <a ref={el} className={className} href={href} data-magnet {...rest}>{inner}</a>
    : <button ref={el} type="button" className={className} data-magnet {...rest}>{inner}</button>;
}
