'use client'; // Next App Router: ScrollTrigger reads the browser's scroll.
// React 19 port of sticky-stages-rails. Two rails and no ScrollTrigger pin: the rail's height is the hold, the sticky child
// is the stage, ScrollTrigger only reads progress. Assumes <SmoothScroll> from boot-lenis-gsap at the app root.
// Styles: the recipe's .rail, .hero-rail, .stages-rail, .stage, .panel, .logo and .card rules.
import { useId, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const QUERIES = { full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' };
const tierOf = (c) => {
  const forced = document.documentElement.dataset.motion; // html[data-motion] beats the OS, as in _shared/reduced-motion.js
  return forced === 'full' || forced === 'reduced' || forced === 'static' ? forced : c.reduced ? 'reduced' : 'full';
};
const RAIL = { start: 'top top', end: 'bottom bottom' };

// The hero panel swings on its bottom-left corner across the rail; the child rotates harder and a beat later,
// which is what makes the panel read as a physical object rather than a tween.
export function HingeRail({ label, title, titleAs: Title = 'h1', onProgress }) {
  const rail = useRef(null);
  const titleId = useId();
  useGSAP(() => {
    const track = { trigger: rail.current, ...RAIL, onUpdate: (s) => onProgress?.(s.progress) };
    gsap.matchMedia().add(QUERIES, (ctx) => {
      if (tierOf(ctx.conditions) !== 'full') { ScrollTrigger.create(track); return; } // nothing moves; progress still tracked
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { ...track, scrub: 0.5, invalidateOnRefresh: true } })
        .to('[data-hinge]', { xPercent: -10, rotation: -15, duration: 1 }, 0)
        .to('[data-hinge-child]', { rotation: -22, xPercent: 12, duration: 0.9 }, 0.1);
    });
  }, { scope: rail });

  return (
    <section ref={rail} className="rail hero-rail" data-rail="hero" aria-labelledby={titleId}>
      <div className="stage wrap">
        <div className="panel" data-hinge>
          {label && <p className="label">{label}</p>}
          <Title className="display" id={titleId}>{title}</Title>
          <div className="logo" data-hinge-child aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

// Cards rise, hold and fall in turn; each owns one share of the rail. Reduced and static: all cards readable.
export function StagesRail({ heading = 'Stages', stages, onProgress }) {
  const rail = useRef(null);
  const headingId = useId();
  useGSAP(() => {
    const track = { trigger: rail.current, ...RAIL, onUpdate: (s) => onProgress?.(s.progress) };
    gsap.matchMedia().add(QUERIES, (ctx) => {
      if (tierOf(ctx.conditions) !== 'full') { ScrollTrigger.create(track); return; }
      const cards = gsap.utils.toArray('[data-stage]');
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { ...track, scrub: 0.5, invalidateOnRefresh: true } });
      gsap.set(cards, { yPercent: 40, opacity: 0.2 });
      cards.forEach((card, i) => {
        tl.to(card, { yPercent: 0, opacity: 1, duration: 1 }, i)
          .to(card, { yPercent: -8, duration: 1 }, i + 1);
      });
    });
  }, { scope: rail });

  return (
    <section ref={rail} className="rail stages-rail" data-rail="stages" aria-labelledby={headingId}>
      <div className="stage wrap stages">
        <h2 id={headingId} className="sr-only">{heading}</h2>
        {stages.map(({ label, caption }, i) => (
          <figure className="card" data-stage={i} key={label}>
            <figcaption><span className="label">{label}</span> {caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// The recipe's sequence: the hinge, then the stages. stages: [{ label: 'Stage I', caption: '…' }, …]
export default function StickyStagesRails({ hero, stages, heading, onProgress }) {
  return (
    <>
      <HingeRail {...hero} onProgress={(p) => onProgress?.('hero', p)} />
      <StagesRail heading={heading} stages={stages} onProgress={(p) => onProgress?.('stages', p)} />
    </>
  );
}
