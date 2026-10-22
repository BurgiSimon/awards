'use client'; // Next App Router: the signals (fonts, decodes, sessionStorage) exist only in the browser.
// React 19 port of preloader-counter-hold. Render it first in the root layout: the server paints the overlay, the
// browser counts what is really loading, holds at 100, exits by lines and skips repeat visits. No Lenis needed.
// Styles: the recipe's .preloader rules, plus html.is-loading .hero .line for the hero it hands over to.
import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const QUERIES = { full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' };
const tierOf = (c) => {
  const forced = document.documentElement.dataset.motion; // html[data-motion] beats the OS, as in _shared/reduced-motion.js
  return forced === 'full' || forced === 'reduced' || forced === 'static' ? forced : c.reduced ? 'reduced' : 'full';
};
// Real signals only. Pass your scene or asset loader as another entry: { scene: () => loadScene() }.
const DEFAULT_SIGNALS = {
  fonts: () => document.fonts.ready,
  images: () => Promise.all([...document.images].map((img) => (img.decode ? img.decode().catch(() => {}) : null))),
};

// signals: { name: () => Promise } (or a promise) · reveal: selector whose lines rise after the exit (null to skip)
// · onExit({ skipped }): hand-off · awardsHook: resolve window.__awards.ready on exit (pair with SmoothScroll awardsHook="manual").
export default function Preloader({ signals = DEFAULT_SIGNALS, storageKey = 'awards:preloaded', reveal = '.hero .line', onExit, awardsHook = false }) {
  const root = useRef(null);
  const count = useRef(null);
  const skip = useRef(null);
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState([]);
  const [exited, setExited] = useState(false);
  const names = Object.keys(signals);

  useGSAP((context, contextSafe) => {
    const html = document.documentElement;
    const timers = [];
    let over = false;
    let full = true;
    gsap.matchMedia().add(QUERIES, (ctx) => { full = tierOf(ctx.conditions) === 'full'; });

    const finish = contextSafe((skipped) => {
      if (over) return;
      over = true;
      timers.forEach((t) => clearInterval(t)); // clears intervals and timeouts alike
      setExited(true); // hidden + aria-hidden: out of the accessibility tree and the layout
      try { sessionStorage.setItem(storageKey, '1'); } catch {}
      html.classList.remove('is-loading');
      const lines = reveal ? document.querySelectorAll(reveal) : [];
      if (full && lines.length) gsap.from(lines, { yPercent: 120, duration: 1.4, ease: 'expo.out', stagger: 0.09, clearProps: 'transform' });
      onExit?.({ skipped });
      if (awardsHook) import('../../_shared/awards-hook.js').then(({ awards }) => awards.ready());
    });

    // Repeat visit: no gate at all. The choreography is for the first impression only.
    const seen = (() => { try { return sessionStorage.getItem(storageKey) === '1'; } catch { return false; } })();
    if (seen) { finish(true); return undefined; }

    html.classList.add('is-loading');
    const t0 = performance.now();
    const pending = names.map((name) => {
      const signal = signals[name];
      return Promise.resolve(typeof signal === 'function' ? signal() : signal).then(() => name);
    });
    let real = 0;
    let value = 0;
    pending.forEach((p) => p.then((name) => { real += 1 / names.length; setDone((d) => [...d, name]); }));

    // The number chases the real progress in uneven jumps of 3–14 but never overtakes it.
    timers.push(setInterval(() => {
      const ceiling = Math.floor(real * 100);
      if (value < ceiling) { value += Math.min(ceiling - value, 3 + Math.floor(Math.random() * 12)); setShown(value); }
    }, 90));

    // At 100: hold for a beat, then exit by lines. Let the count reach the ceiling, never wait past 4 s for it.
    Promise.all(pending).then(() => {
      if (over) return;
      const wait = setInterval(() => {
        if (value < 97 && performance.now() - t0 <= 4000) return;
        timers.forEach((t) => clearInterval(t));
        value = 100;
        setShown(100);
        timers.push(setTimeout(contextSafe(() => {
          if (!full) { finish(false); return; }
          gsap.timeline({ onComplete: () => finish(false) })
            .to(count.current, { yPercent: -120, duration: 0.8, ease: 'expo.in' })
            .to(root.current.querySelectorAll('.preloader__signals li'), { autoAlpha: 0, duration: 0.3, stagger: 0.05 }, '<')
            .to(root.current, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.2');
        }), full ? 450 : 300));
      }, 60);
      timers.push(wait);
    });

    skip.current = () => { gsap.killTweensOf([root.current, count.current]); finish(true); };
    return () => { over = true; timers.forEach((t) => clearInterval(t)); html.classList.remove('is-loading'); };
  }, { scope: root });

  return (
    <div ref={root} className="preloader" data-preloader role="status" aria-live="polite" hidden={exited} aria-hidden={exited || undefined}>
      <p className="preloader__count display"><span className="mask"><span className="line" ref={count}>{String(shown).padStart(3, '0')}</span></span></p>
      <ol className="preloader__signals label" aria-label="Loading">
        {names.map((name) => <li key={name} className={done.includes(name) ? 'is-done' : undefined}>{name}</li>)}
      </ol>
      <button type="button" className="preloader__skip label" onClick={() => skip.current?.()}>Skip</button>
    </div>
  );
}
