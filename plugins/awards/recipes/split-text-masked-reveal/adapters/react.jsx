'use client'; // Next App Router: SplitText measures real lines, so this runs in the browser only.
// React 19 port of split-text-masked-reveal. Scrolling assumes <SmoothScroll> from boot-lenis-gsap at the app root.
// The split rewrites this element's children, so keep them static text; to change the text, change the `key`.
import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const QUERIES = { full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' };
const tierOf = (c) => {
  const forced = document.documentElement.dataset.motion; // html[data-motion] beats the OS, as in _shared/reduced-motion.js
  return forced === 'full' || forced === 'reduced' || forced === 'static' ? forced : c.reduced ? 'reduced' : 'full';
};

// type: 'lines' (the house move) | 'words' (short headlines) · delay: seconds, above the fold only
// · onScroll: reveal once at top 85% instead of on load · onReveal: called when a reveal completes.
export default function SplitReveal({ as: Tag = 'p', type = 'lines', delay = 0, onScroll = false, onReveal, className, children, ...rest }) {
  const ref = useRef(null);
  const [split, setSplit] = useState(false);
  const named = /^h[1-6]$/.test(Tag);

  useGSAP(() => {
    const el = ref.current;
    let live = true;
    const mm = gsap.matchMedia();
    const trigger = onScroll ? { trigger: el, start: 'top 85%', once: true } : undefined;

    // Fonts first: line boundaries depend on the real face; an earlier split re-splits visibly when it swaps in.
    document.fonts.ready.then(() => {
      if (!live) return;
      mm.add(QUERIES, (ctx) => {
        const tier = tierOf(ctx.conditions);
        if (tier === 'static') return; // settled on load: no split, no fade
        if (tier === 'reduced') {
          // Whole elements fade; no split, so the DOM keeps whole sentences for assistive technology.
          gsap.from(el, { autoAlpha: 0, duration: 0.4, onComplete: onReveal, scrollTrigger: trigger });
          return;
        }
        // A heading keeps the aria-label SplitText adds; ARIA forbids naming a paragraph, so a split paragraph
        // is hidden and a visually hidden copy (rendered below) carries it instead.
        if (!named) setSplit(true);
        const s = SplitText.create(el, {
          aria: named ? 'auto' : 'hidden',
          type: type === 'lines' ? 'lines' : 'words,lines',
          mask: type === 'lines' ? 'lines' : 'words', // an overflow:hidden wrapper per unit
          autoSplit: true,                            // re-split when the width changes
          linesClass: 'line',
          wordsClass: 'word',
          onSplit(self) {
            // Rebuilt on every (re)split and returned, so a resize never leaves half a paragraph hidden.
            return gsap.from(type === 'lines' ? self.lines : self.words, {
              yPercent: 120,
              duration: 1.4,
              ease: 'expo.out',
              stagger: type === 'lines' ? 0.1 : 0.03,
              delay: onScroll ? 0 : delay,
              onComplete: onReveal,
              scrollTrigger: trigger,
            });
          },
        });
        el.classList.add('is-split');
        return () => { s.revert(); el.classList.remove('is-split'); setSplit(false); };
      });
    });
    return () => { live = false; };
  }, { scope: ref });

  return (
    <>
      {split && <Tag className="sr-only">{children}</Tag>}
      <Tag ref={ref} className={className} data-split={type} {...rest}>{children}</Tag>
    </>
  );
}
