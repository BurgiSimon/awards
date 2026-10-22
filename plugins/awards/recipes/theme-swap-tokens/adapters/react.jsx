'use client'; // Next App Router: tokens are read from the live stylesheet and written to the root element.
// React 19 port of theme-swap-tokens. Wrap the chapters; each child section names its theme with data-swap.
// Crossing a chapter's midpoint tweens --ground, --ink and --accent on the root element in one beat, and onUpdate hands the
// same live object to a canvas or a renderer. Assumes <SmoothScroll> from boot-lenis-gsap for the scroll.
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const QUERIES = { full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' };
const tierOf = (c) => {
  const forced = document.documentElement.dataset.motion; // html[data-motion] beats the OS, as in _shared/reduced-motion.js
  return forced === 'full' || forced === 'reduced' || forced === 'static' ? forced : c.reduced ? 'reduced' : 'full';
};
const TOKENS = ['--ground', '--ink', '--accent'];

// themes: names defined as [data-theme="…"] blocks in your CSS · onUpdate(live): every tween frame (canvas, uniforms)
// · onTheme(name): when a chapter takes over (readouts, wayfinding).
export default function ThemeSwap({ themes = ['default', 'dark', 'accent'], onUpdate, onTheme, as: Tag = 'div', children, ...rest }) {
  const root = useRef(null);

  useGSAP(() => {
    const html = document.documentElement;
    const meta = document.querySelector('meta[name="theme-color"]');
    const before = { theme: html.getAttribute('data-theme'), meta: meta?.getAttribute('content') };

    // Read each theme's values from the stylesheet once, by probing an element that carries the attribute.
    const values = {};
    for (const name of themes) {
      const probe = document.createElement('div');
      probe.setAttribute('data-theme', name);
      document.body.appendChild(probe);
      const cs = getComputedStyle(probe);
      values[name] = Object.fromEntries(TOKENS.map((t) => [t, cs.getPropertyValue(t).trim()]));
      probe.remove();
    }
    const first = themes[0];
    const live = { ...values[first] };
    const write = () => TOKENS.forEach((t) => html.style.setProperty(t, live[t]));
    html.removeAttribute('data-theme'); // the inline tokens on the root take over from here
    write();
    onUpdate?.(live);

    let full = true;
    gsap.matchMedia().add(QUERIES, (ctx) => { full = tierOf(ctx.conditions) === 'full'; });

    let current = first;
    let tween = null;
    const setTheme = (name) => {
      if (name === current || !values[name]) return;
      current = name;
      onTheme?.(name);
      html.setAttribute('data-theme-live', name);
      tween?.kill(); // retarget from wherever the colour is; never stack
      tween = gsap.to(live, {
        ...values[name],
        duration: full ? 1 : 0, // reduced: instant, but the swap still happens because it carries wayfinding
        ease: 'power2.inOut',    // ≈ cubic-bezier(.645,.045,.355,1)
        onUpdate() { write(); onUpdate?.(live); },
        onComplete() { meta?.setAttribute('content', live['--ground']); },
      });
    };

    gsap.utils.toArray('[data-swap]').forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => setTheme(section.dataset.swap),
        onEnterBack: () => setTheme(section.dataset.swap),
      });
    });

    return () => {
      tween?.kill();
      TOKENS.forEach((t) => html.style.removeProperty(t));
      html.removeAttribute('data-theme-live');
      if (before.theme !== null) html.setAttribute('data-theme', before.theme);
      if (meta && before.meta) meta.setAttribute('content', before.meta);
    };
  }, { scope: root });

  return <Tag ref={root} {...rest}>{children}</Tag>;
}

// The recipe's swatch: a 2D canvas painted from the same live object the DOM is showing.
// <ThemeSwap onUpdate={(live) => paintSwatch(canvasRef.current, live)}>. For Three: renderer.setClearColor(live['--ground']).
export function paintSwatch(canvas, live) {
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = live['--ground'];
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = live['--accent'];
  ctx.beginPath(); ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = live['--ink']; ctx.lineWidth = 2; ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);
}
