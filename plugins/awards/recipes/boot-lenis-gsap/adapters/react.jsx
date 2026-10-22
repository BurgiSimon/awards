'use client'; // Next App Router: Lenis, GSAP and the DOM exist only in the browser. Harmless elsewhere.
// React 19 port of boot-lenis-gsap. <SmoothScroll> is mounted once at the app root: one Lenis, ticked by
// gsap.ticker, feeding ScrollTrigger. Every other adapter assumes it and reads the instance through useLenis().
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LenisContext = createContext(null);
const QUERIES = { full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' };
let stateRegistered = false;

// html[data-motion] (full | reduced | static) beats the OS setting, as recipes/_shared/reduced-motion.js does.
export function motionTier(conditions) {
  const forced = document.documentElement.dataset.motion;
  if (forced === 'full' || forced === 'reduced' || forced === 'static') return forced;
  const reduced = conditions ? conditions.reduced : matchMedia(QUERIES.reduced).matches;
  return reduced ? 'reduced' : 'full';
}

// awardsHook: false (default) · true installs window.__awards and resolves ready after fonts ·
// 'manual' installs it and leaves ready to a preloader. Needs recipes/_shared/awards-hook.js copied beside this file.
export default function SmoothScroll({ children, lerp = 0.1, options, awardsHook = false }) {
  const [lenis, setLenis] = useState(null);

  useGSAP(() => {
    // 1. One clock: GSAP's ticker drives Lenis, Lenis feeds ScrollTrigger. Never autoRaf, never a second scroller.
    const instance = new Lenis({ lerp, ...options, autoRaf: false });
    const offScroll = instance.on('scroll', ScrollTrigger.update);
    const tick = (time) => instance.raf(time * 1000); // ticker seconds → Lenis milliseconds
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.config({ ignoreMobileResize: true });
    window.lenis = instance; // capture contract: the awards hook scrolls through it
    setLenis(instance);

    // 2. The tier on the root element so recipe CSS can branch on html[data-motion-tier]; re-runs when the OS setting flips.
    gsap.matchMedia().add(QUERIES, (ctx) => {
      document.documentElement.setAttribute('data-motion-tier', motionTier(ctx.conditions));
    });

    // 3. Measure after everything that can move layout has landed: the real faces, then the load event.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    if (document.readyState === 'complete') refresh();
    else window.addEventListener('load', refresh, { once: true });

    if (awardsHook) {
      import('../../_shared/awards-hook.js').then(({ awards }) => {
        if (!stateRegistered) {
          stateRegistered = true;
          awards.addState(() => ({
            motion: document.documentElement.getAttribute('data-motion-tier'),
            lenis: !!window.lenis,
            triggers: ScrollTrigger.getAll().length,
          }));
        }
        if (awardsHook !== 'manual') document.fonts.ready.then(() => awards.ready());
      });
    }

    return () => {
      gsap.ticker.remove(tick);
      offScroll();
      window.removeEventListener('load', refresh);
      instance.destroy();
      if (window.lenis === instance) delete window.lenis;
      setLenis(null);
    };
  });

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

// The root instance (null until mounted, or without a provider). With a callback, it also runs on every scroll.
export function useLenis(callback) {
  const lenis = useContext(LenisContext);
  const saved = useRef(callback);
  useEffect(() => { saved.current = callback; });
  const listening = typeof callback === 'function';
  useEffect(() => {
    if (!lenis || !listening) return undefined;
    return lenis.on('scroll', (l) => saved.current?.(l));
  }, [lenis, listening]);
  return lenis;
}

// Hero lines rise out of their masks once the real faces are in; under reduced motion they fade, under static they sit.
export function HeroLines({ lines, as: Tag = 'h1', className = 'display', ...rest }) {
  const ref = useRef(null);
  useGSAP(() => {
    let live = true;
    const mm = gsap.matchMedia();
    document.fonts.ready.then(() => {
      if (!live) return;
      mm.add(QUERIES, (ctx) => {
        const tier = motionTier(ctx.conditions);
        if (tier === 'static') return;
        const targets = ref.current.querySelectorAll('.line');
        gsap.from(targets, tier === 'full'
          ? { yPercent: 120, duration: 1.4, ease: 'expo.out', stagger: 0.09 }
          : { autoAlpha: 0, duration: 0.4, stagger: 0.03 });
      });
    });
    return () => { live = false; };
  }, { scope: ref });

  return (
    <Tag ref={ref} className={className} {...rest}>
      {lines.map((line) => <span className="mask" key={line}><span className="line">{line}</span></span>)}
    </Tag>
  );
}

// Scrubbed readout of document progress. ease: 'none'; the smoothing already lives in Lenis.
export function ScrollProgress({ className = 'label' }) {
  const ref = useRef(null);
  useGSAP(() => {
    const out = ref.current;
    const progress = { v: 0 };
    gsap.to(progress, {
      v: 100,
      ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.4 },
      onUpdate: () => { out.textContent = String(Math.round(progress.v)).padStart(3, '0'); }, // a DOM write, not React state
    });
  });
  return <p className={className} aria-live="polite"><span ref={ref}>000</span> / 100</p>;
}

// A chapter that reveals once at top 80%. The class flip leaves the reduced-motion variant to CSS.
export function Reveal({ as: Tag = 'section', className = 'section wrap chapter', children, ...rest }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useGSAP(() => {
    ScrollTrigger.create({ trigger: ref.current, start: 'top 80%', once: true, onEnter: () => setInView(true) });
  }, { scope: ref });
  return <Tag ref={ref} className={inView ? `${className} is-inview` : className} data-reveal {...rest}>{children}</Tag>;
}
