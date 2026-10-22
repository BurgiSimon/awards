'use client'; // Next App Router: ScrollTrigger reads the browser's scroll.
// React 19 port of scroll-pin-scrub. A tall section with a sticky stage: the scroll consumes the section's own
// height and ScrollTrigger only reads progress (no pin, no spacer). Assumes <SmoothScroll> from boot-lenis-gsap.
// Styles: the recipe's .chapter (300svh), .stage (sticky, 100svh), .object, .caption rules.
import { useId, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const QUERIES = { full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' };
const tierOf = (c) => {
  const forced = document.documentElement.dataset.motion; // html[data-motion] beats the OS, as in _shared/reduced-motion.js
  return forced === 'full' || forced === 'reduced' || forced === 'static' ? forced : c.reduced ? 'reduced' : 'full';
};
const pad = (n, w) => String(n).padStart(w, '0');

// beats: one caption per beat (the recipe's three) · onProgress(progress, beat): for wayfinding elsewhere.
export default function PinnedChapter({ beats = ['Approach.', 'Turn.', 'Land.'], note, onProgress }) {
  const chapter = useRef(null);
  const object = useRef(null);
  const readout = useRef(null);
  const [beat, setBeat] = useState(0);
  const titleId = useId();

  useGSAP(() => {
    const count = beats.length;
    let current = 0;
    const scrollTrigger = {
      trigger: chapter.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,               // a little catch-up so wheel steps do not stutter
      invalidateOnRefresh: true, // re-measure on resize and font load
      onUpdate: (self) => {
        readout.current.textContent = pad(Math.round(self.progress * 100), 3); // per frame: a DOM write, not state
        const next = Math.min(count - 1, Math.floor(self.progress * count));
        if (next !== current) { current = next; setBeat(next); }               // per beat: state, three times a pass
        onProgress?.(self.progress, next);
      },
    };
    gsap.matchMedia().add(QUERIES, (ctx) => {
      // Scrubbed timelines are linear; Lenis' lerp is the smoothing.
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { ...scrollTrigger } });
      if (tierOf(ctx.conditions) === 'full') {
        // Each beat a third of the scroll: the object turns 540° and breathes in scale.
        tl.to(object.current, { rotation: 180, scale: 1.15, duration: 1 })
          .to(object.current, { rotation: 360, scale: 0.9, duration: 1 })
          .to(object.current, { rotation: 540, scale: 1, duration: 1 });
      } else {
        // Reduced and static: no spatial movement; captions and the readout still follow the scroll.
        tl.to({}, { duration: count });
      }
    });
  }, { scope: chapter });

  return (
    <section ref={chapter} className="chapter" data-pin aria-labelledby={titleId}>
      <div className="stage wrap">
        <p className="label"><span>{pad(beat + 1, 2)}</span> / {pad(beats.length, 2)} · <span ref={readout}>000</span></p>
        <div className="object" ref={object} aria-hidden="true"><span /><span /><span /></div>
        <h2 id={titleId} className="caption">
          {beats.map((text, i) => <span key={text} data-caption={i} className={i === beat ? 'is-active' : undefined}>{text}</span>)}
        </h2>
        {note && <p className="note">{note}</p>}
      </div>
    </section>
  );
}
