// The motion score (AWARDS.md ## Motion score). One beat per chapter, all on GSAP's ticker,
// inside one gsap.matchMedia scope so the reduced tier rebuilds itself when the preference flips.
// Organic register: arrivals on 'power3.out' (≈ cubic-bezier(.33, 1, .68, 1)), travel on 'sine.inOut',
// scrubs on 'none'. Nothing loops; there is nothing to pause off-screen.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { motionTier } from '../lib/reduced-motion.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const EASE = { out: 'power3.out', inOut: 'sine.inOut', none: 'none' };
export const DUR = { feedback: 0.18, routine: 0.42, hero: 1.2 };
const SEEN = 'wrenmouth:hero-seen';

const seen = () => { try { return sessionStorage.getItem(SEEN) === '1'; } catch { return false; } };
const markSeen = () => { try { sessionStorage.setItem(SEEN, '1'); } catch { /* fine */ } };
const settle = () => document.documentElement.classList.remove('hero-pending');

// Masked line reveal for a heading; split only after fonts, re-split on resize (autoSplit).
function revealHeading(el, { delay = 0, trigger = el, start = 'top 85%' } = {}) {
  let tween;
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    linesClass: 'split-line',
    onSplit(self) {
      tween?.kill();
      tween = gsap.from(self.lines, {
        yPercent: 125,
        duration: DUR.hero * 0.85,
        ease: EASE.out,
        stagger: 0.08,
        delay,
        scrollTrigger: trigger ? { trigger, start, once: true } : undefined,
      });
      return tween;
    },
  });
}

// 1 · Dawn: the hero's one moment. h1 lines unmask; the empty frame lands on the concrete
// beside the 1937 print, its shadow shortening as it settles. The print itself never waits (it is the LCP).
function heroEntrance() {
  const hero = document.querySelector('.hero, .page-hero');
  if (!hero) return settle();
  const title = hero.querySelector('[data-split]');
  const frame = hero.querySelector('.frame__card');
  const act = hero.querySelectorAll('.hero__act > *, .page-hero__lede, .page-hero__act');
  if (seen()) return settle();
  markSeen();
  const tl = gsap.timeline({ defaults: { ease: EASE.out }, onComplete: settle });
  if (title) {
    SplitText.create(title, {
      type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'split-line',
      onSplit(self) {
        // the hidden-before-JS class lifts the moment the lines are masked, so nothing flashes.
        // A standalone tween, returned, so a late re-split (fonts, resize) keeps its progress instead of
        // being appended to a finished timeline and left masked.
        settle();
        return gsap.from(self.lines, { yPercent: 125, duration: DUR.hero, stagger: 0.08, ease: EASE.out });
      },
    });
  }
  if (frame) {
    tl.fromTo(frame,
      { y: -36, rotation: 3.2, autoAlpha: 0, '--lift': 16 },
      { y: 0, rotation: 0, autoAlpha: 1, '--lift': 0, duration: 1.0, ease: EASE.out, clearProps: 'transform,visibility,opacity' }, 0.3);
  }
  if (act.length) tl.from(act, { autoAlpha: 0, duration: 0.5, stagger: 0.06, ease: 'none' }, 0.55);
}

// 2 · The sea comes in: the plate fills from its lower edge as the chapter arrives, scrubbed by the scroll.
function seaComesIn() {
  const img = document.querySelector('.sea__print .print__paper');
  if (!img) return;
  gsap.fromTo(img,
    { clipPath: 'inset(62% 0% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', ease: EASE.none,
      scrollTrigger: { trigger: '.sea', start: 'top 92%', end: 'top 18%', scrub: 0.5, invalidateOnRefresh: true } });
}

// 4 · Twenty-eight years: the rule under each year draws across, like a tide line, once.
function yearRules() {
  document.querySelectorAll('.years').forEach((list) => {
    const rows = list.querySelectorAll('.years__row');
    gsap.fromTo(rows, { '--draw': 0 }, { '--draw': 1, duration: 0.9, ease: EASE.inOut, stagger: 0.12,
      scrollTrigger: { trigger: list, start: 'top 80%', once: true } });
  });
}

// 5 · What's on the wall: three prints laid down on the concrete, each shadow landing with it.
function printsLaidDown() {
  const items = gsap.utils.toArray('.wall__item .print__paper');
  if (!items.length) return;
  const turns = [-2.4, 1.8, -1.2];
  items.forEach((el, i) => {
    gsap.fromTo(el,
      { y: -18, rotation: turns[i % 3], '--print-lift': 14 },
      { y: 0, rotation: 0, '--print-lift': 0, duration: 0.9, ease: EASE.out, clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
}

// 7 · The close: the caption on the back of the photograph is pencilled in, line by line.
function pencilIn(root, { start = 'top 75%', trigger = root } = {}) {
  const pencils = root.querySelectorAll('.pencil');
  pencils.forEach((p, n) => {
    SplitText.create(p, {
      type: 'lines', autoSplit: true, linesClass: 'pencil-line', aria: 'none', // a <p> may not carry aria-label; the lines stay plain readable text
      onSplit(self) {
        return gsap.fromTo(self.lines,
          { clipPath: 'inset(-20% 100% -20% 0%)' },
          { clipPath: 'inset(-20% 0% -20% 0%)', duration: 0.9, ease: 'power1.inOut', stagger: 0.55, delay: n * 0.4,
            scrollTrigger: trigger ? { trigger, start, once: true } : undefined });
      },
    });
  });
}

export function initScore() {
  const mm = gsap.matchMedia();
  const tier = motionTier();
  if (tier === 'static') { settle(); return { mm, tier }; }
  mm.add({ full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, (ctx) => {
    if (ctx.conditions.reduced || tier !== 'full') {
      // reduced: no travel, no scrub; every state is already on the page
      settle();
      return;
    }
    heroEntrance();
    // the chapter beats are below the fold: set them up in idle slices so the first screen never waits on them
    const later = [
      () => seaComesIn(),
      () => {
        // chapter headings unmask on the home page only, where each chapter is a beat; inner pages are documents
        if (document.body.dataset.page === 'home') {
          document.querySelectorAll('main h2:not(.sr-only):not(.back__title)').forEach((h) => revealHeading(h));
        }
      },
      () => yearRules(),
      () => printsLaidDown(),
      () => { const back = document.querySelector('.back'); if (back) pencilIn(back); },
    ];
    const idle = window.requestIdleCallback || ((fn) => setTimeout(() => fn({ timeRemaining: () => 8 }), 120));
    const step = () => { const job = later.shift(); if (!job) return ScrollTrigger.refresh(); ctx.add(job); idle(step, { timeout: 1200 }); };
    idle(step, { timeout: 1200 });
  });
  return { mm, tier };
}

// The ballot's payoff: the visitor's name is pencilled onto the back, after the rest of the caption.
export function writeName(host) {
  const el = host?.querySelector('.pencil-name');
  if (!el || motionTier() !== 'full') return;
  // word by word, so the line wraps where words do and the pencil writes each one in turn
  const words = el.textContent.split(' ');
  el.textContent = '';
  const spans = words.map((w, i) => {
    const span = document.createElement('span');
    span.className = 'pencil-word';
    span.textContent = w;
    el.append(span);
    if (i < words.length - 1) el.append(' ');
    return span;
  });
  const tl = gsap.timeline({ delay: 0.3 });
  spans.forEach((span) => {
    tl.fromTo(span, { clipPath: 'inset(-30% 100% -30% 0%)' }, { clipPath: 'inset(-30% 0% -30% 0%)', duration: 0.12 + span.textContent.length * 0.05, ease: 'none' }, '+=0.04');
  });
}
