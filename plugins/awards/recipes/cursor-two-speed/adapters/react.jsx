'use client'; // Next App Router: the cursor layer exists only for a fine pointer, in the browser.
// React 19 port of cursor-two-speed. Mount once at the app root, outside any transformed ancestor (the layer is
// position: fixed). It rides gsap.ticker, the same clock as Lenis, instead of a second rAF. Styles: the recipe's .cursor rules.
import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const QUERIES = { fine: '(pointer: fine) and (hover: hover)', reduced: '(prefers-reduced-motion: reduce)' };
const tierOf = (c) => {
  const forced = document.documentElement.dataset.motion; // html[data-motion] beats the OS, as in _shared/reduced-motion.js
  return forced === 'full' || forced === 'reduced' || forced === 'static' ? forced : c.reduced ? 'reduced' : 'full';
};
const INTERACTIVE = 'a, button, [role="button"], [data-cursor], input, select, textarea, summary';
// Lerp factors are per 60 fps frame; k() turns them into framerate-independent damping rates.
const k = (lerp) => -Math.log(1 - lerp) * 60;
const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));

// dotLerp / ringLerp: the two speeds whose gap reads as mass. Tag targets with data-cursor="drag|play|view|copy".
export default function Cursor({ dotLerp = 0.75, ringLerp = 0.22 }) {
  const root = useRef(null);
  const dot = useRef(null);
  const ring = useRef(null);
  const badge = useRef(null);

  useGSAP(() => {
    gsap.matchMedia().add(QUERIES, (ctx) => {
      if (!ctx.conditions.fine) return; // touch keeps the OS behaviour; the layer stays display: none
      const snap = tierOf(ctx.conditions) !== 'full'; // reduced motion removes the lag, not the cursor
      const html = document.documentElement;
      const layer = root.current;
      const target = { x: innerWidth / 2, y: innerHeight / 2 };
      const pos = { dot: { ...target }, ring: { ...target } };
      const look = { ring: 1, dot: 1, badge: '' };

      const frame = (time, deltaMs) => {
        const dt = snap ? 1 : Math.min(0.1, deltaMs / 1000);
        pos.dot.x = damp(pos.dot.x, target.x, k(dotLerp), dt);
        pos.dot.y = damp(pos.dot.y, target.y, k(dotLerp), dt);
        pos.ring.x = damp(pos.ring.x, target.x, k(ringLerp), dt);
        pos.ring.y = damp(pos.ring.y, target.y, k(ringLerp), dt);
        dot.current.style.transform = `translate3d(${pos.dot.x}px, ${pos.dot.y}px, 0) scale(${look.dot})`;
        ring.current.style.transform = `translate3d(${pos.ring.x}px, ${pos.ring.y}px, 0) scale(${look.ring})`;
        badge.current.style.transform = `translate3d(${pos.dot.x}px, ${pos.dot.y}px, 0) scale(${look.badge ? 1 : 0.8})`;
      };
      const show = () => layer.classList.add('is-visible');
      const hide = () => layer.classList.remove('is-visible');
      const onMove = (e) => { target.x = e.clientX; target.y = e.clientY; show(); };
      const onOver = (e) => {
        const hit = e.target.closest?.(INTERACTIVE);
        look.badge = hit?.closest('[data-cursor]')?.dataset.cursor || '';
        look.ring = hit ? 1.35 : 1;
        look.dot = hit ? 0.7 : 1;
        layer.classList.toggle('is-hover', !!hit);
        layer.classList.toggle('has-badge', !!look.badge);
        if (look.badge) badge.current.textContent = look.badge;
      };

      html.classList.add('has-cursor'); // cursor: none only while the module runs, so the OS cursor returns on teardown
      gsap.ticker.add(frame);
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerover', onOver);
      document.addEventListener('pointerleave', hide);
      document.addEventListener('pointerenter', show);
      window.addEventListener('blur', hide);
      return () => {
        html.classList.remove('has-cursor');
        gsap.ticker.remove(frame);
        window.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerover', onOver);
        document.removeEventListener('pointerleave', hide);
        document.removeEventListener('pointerenter', show);
        window.removeEventListener('blur', hide);
        layer.classList.remove('is-visible', 'is-hover', 'has-badge');
      };
    });
  }, { scope: root });

  // aria-hidden and pointer-events: none (CSS): keyboard and assistive technology never meet it.
  return (
    <div className="cursor" ref={root} aria-hidden="true">
      <div className="cursor__ring" ref={ring} />
      <div className="cursor__dot" ref={dot} />
      <div className="cursor__badge" ref={badge} />
    </div>
  );
}
