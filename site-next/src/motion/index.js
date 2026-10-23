// The motion score (AWARDS.md ## Motion score), on the one clock: GSAP's ticker, which already drives Lenis and
// ScrollTrigger. One progress value p (0–1, the page's scroll) is cut into windows (SCROLL MODEL): the strip follows
// it, and the paused master timeline is set to it every tick, so chapter 3's growth is a stretch of that one
// timeline between labels and every state is reproducible from a number through window.__awards.scrollTo(p).
// Tiers come from one gsap.context rebuilt on the motion preference, the width class and the data-motion override on
// <html>, and every tier is torn down before the next applies.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ticker, clamp } from '../lib/raf.js';
import { motionTier } from '../lib/reduced-motion.js';
import { readTokens, DUR, hideStroke, showStroke } from '../lib/motion.js';
import { createStrip } from './strip.js';
import { createMarks, markUnits, session } from './marks.js';
import { createLoupe } from './loupe.js';
import { createCloseRing, ringPaths, drawRing } from './rings.js';

const HERO_KEY = 'awards:hero';

const progress = () => {
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  return clamp(scrollY / max, 0, 1);
};

// signal: resolves { timedOut } once the faces are in and the first visible frames have decoded, with the
// contract's 1.5 s ceiling (LOAD & CLOSE). Returns { heroDone, settled, state }.
export function initMotion({ signal }) {
  const root = document.documentElement;
  const home = !!document.getElementById('sheet');
  const proof = root.dataset.proof ?? 'none';
  const marks = createMarks({ units: markUnits() });
  const heroSeen = !!session.get(HERO_KEY);
  const selectOpen = ringPaths('#select-open');
  const hero = { kind: null, state: 'none' };
  let gateOpen = false;
  const queue = new Set();
  let live = null; // the current tier's pieces

  // The first viewport's one moment, for the width the reader has now: the jury's memory ring on the s00 frame
  // when a report exists and that frame carries it (state a), otherwise the grease ring around the first ticket.
  const visibleHeroUnit = () => {
    if (proof !== 'report') return null;
    const li = [...document.querySelectorAll('.strip__list .strip__item[data-stop="0"]')].find((el) => el.getClientRects().length);
    const u = li ? marks.unitOf(li) : null;
    return u && u.paths.some((p) => p.dataset.mark === 'ring' && p.dataset.source === 'memory') ? u : null;
  };
  const phoneHero = () => root.matches('[data-hero-ring~="mobile"]') && matchMedia('(max-width: 767px)').matches;
  const animateFor = (tier) => home && tier === 'full';

  // Before the pre-paint classes go: hide exactly what is still to be drawn, show the rest.
  function takeover(tier) {
    const animate = animateFor(tier);
    marks.prepare(animate);
    const selectHero = animate && !heroSeen && !visibleHeroUnit() && !phoneHero();
    selectOpen.forEach(selectHero && hero.state === 'none' ? hideStroke : showStroke);
    root.classList.remove('draw-hero', 'draw-marks');
  }

  // Everything that animates is created inside the current tier's gsap.context, even when it starts
  // later (a frame becoming current, a trigger, the load signal), so a tier change reverts it with the rest.
  const inScope = (fn) => (live?.ctx ? live.ctx.add(fn) : fn());

  function request(unit) {
    if (!unit || !marks.pending(unit.el)) return;
    if (!gateOpen) { queue.add(unit); return; }
    inScope(() => marks.draw(unit));
  }

  function build(ctx) {
    const tier = motionTier();
    readTokens();
    takeover(tier);
    const animate = animateFor(tier);
    const strip = createStrip({ tier, onCurrent: (li) => { if (animate) { marks.passed(li); request(marks.unitOf(li)); } } });
    const wide = matchMedia('(min-width: 768px)').matches;
    const loupe = tier === 'full' && wide ? createLoupe({ strip }) : null;
    const close = home ? createCloseRing({ animate, scope: (fn) => ctx.add(fn) }) : null;
    let master = null;

    // Phone and the close: a chapter's own frames draw their marks when the chapter enters.
    const triggers = [];
    if (animate) {
      for (const el of document.querySelectorAll('.chapter__frames .strip__item, figure.chapter__frames, .select__frame')) {
        const unit = marks.unitOf(el);
        if (!unit || unit.state !== 'pending') continue;
        triggers.push(ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => request(unit) }));
      }
    }

    // The master timeline: duration 1 = the page's progress, a label at every chapter's top and at the four edges
    // of chapter 3's window, and the loupe's growth and return as the only tweens on it (scrubbed, so ease none).
    function buildMaster() {
      master?.kill();
      master = null;
      if (!loupe) return;
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const P = (y) => clamp(y / max, 0, 1);
      master = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
      master.set({}, {}, 1);
      for (const s of document.querySelectorAll('main > section.chapter[id]')) master.addLabel(s.id, P(s.getBoundingClientRect().top + scrollY));
      const w = loupe.measure();
      if (w) {
        master.addLabel('proof:in', P(w.in)).addLabel('proof:held', P(w.held)).addLabel('proof:out', P(w.out)).addLabel('proof:gone', P(w.gone));
        master.fromTo(loupe.proxy, { g: 0 }, { g: 1, duration: Math.max(1e-4, P(w.held) - P(w.in)), immediateRender: false }, 'proof:in');
        master.fromTo(loupe.proxy, { g: 1 }, { g: 0, duration: Math.max(1e-4, P(w.gone) - P(w.out)), immediateRender: false }, 'proof:out');
      }
      master.progress(progress());
    }

    const refresh = () => { strip?.measure(); ctx.add(buildMaster); };
    refresh();
    ScrollTrigger.addEventListener('refresh', refresh);
    const ro = new ResizeObserver(() => refresh());
    for (const el of [document.querySelector('.strip'), document.querySelector('main')]) if (el) ro.observe(el);

    const tick = (dt) => {
      const p = progress();
      strip?.tick(p, dt);
      if (master) {
        master.progress(p);
        loupe.render();
      }
    };
    ticker.add(tick);

    live = {
      ctx,
      tier,
      strip,
      loupe,
      close,
      master: () => master,
      settled: () => Promise.all([strip?.settled(), marks.settled(), close?.settled()]),
    };
    return () => {
      ticker.remove(tick);
      ScrollTrigger.removeEventListener('refresh', refresh);
      ro.disconnect();
      triggers.forEach((t) => t.kill());
      master?.kill();
      loupe?.destroy();
      strip?.destroy();
      close?.destroy();
      marks.finish();
      live = null;
    };
  }

  // One gsap.context for every tier, reverted and rebuilt when the motion preference or the width class flips (the
  // three width classes are the strip's: desktop, tablet and phone frames), and when the data-motion override on
  // <html> changes. A plain context with its own media listeners rather than gsap.matchMedia: ScrollTrigger refreshes
  // a matchMedia change without recording the scroll first and restored the page to the top (measured, 1440 → 600).
  let scope = null;
  let queued = false;
  const install = () => {
    queued = false;
    scope?.revert();
    scope = gsap.context((ctx) => build(ctx));
  };
  const reinstall = () => { if (!queued) { queued = true; requestAnimationFrame(install); } };
  install();
  for (const q of ['(prefers-reduced-motion: reduce)', '(min-width: 1024px)', '(min-width: 768px)']) matchMedia(q).addEventListener('change', reinstall);
  new MutationObserver(reinstall).observe(root, { attributes: true, attributeFilter: ['data-motion'] });

  // The load moment, once: after the signal, or shown drawn when the 1.5 s ceiling won or this session saw it.
  const heroDone = signal.then(async ({ timedOut }) => {
    const animate = !!live && animateFor(live.tier);
    const unit = visibleHeroUnit();
    hero.kind = unit ? 'memory-ring' : phoneHero() ? 'memory-ring-on-entry' : home ? 'select-ring' : null;
    const atTop = live?.strip?.state()?.current === 's00';
    let tl = null;
    if (!hero.kind) hero.state = 'none';
    else if (!animate) hero.state = 'static';
    else if (heroSeen) hero.state = 'session';
    else if (timedOut) {
      // The ceiling won: the moment is shown already drawn, never late.
      hero.state = 'ceiling';
      session.set(HERO_KEY, '1');
      if (unit && atTop) marks.reveal(unit);
    } else if (hero.kind === 'select-ring') {
      session.set(HERO_KEY, '1');
      hero.state = 'drawing';
      tl = inScope(() => drawRing(selectOpen, DUR.hero));
    } else if (hero.kind === 'memory-ring' && atTop) {
      session.set(HERO_KEY, '1');
      hero.state = 'drawing';
      queue.delete(unit);
      tl = inScope(() => marks.draw(unit));
    } else hero.state = 'on-entry';
    if (hero.kind !== 'select-ring' || hero.state !== 'drawing') selectOpen.forEach(showStroke);
    gateOpen = true;
    for (const u of queue) inScope(() => marks.draw(u));
    queue.clear();
    // A timeline is thenable; its own onComplete (which settles the marks) is left alone.
    if (tl) await new Promise((r) => { tl.then(() => r()); setTimeout(r, (DUR.hero + 1) * 1000); });
    if (hero.state === 'drawing') hero.state = 'drawn';
  });

  return {
    heroDone,
    settled: () => live?.settled() ?? Promise.resolve(),
    state: () => ({
      tier: live?.tier ?? motionTier(),
      hero: { ...hero },
      strip: live?.strip?.state() ?? null,
      marks: marks.state(),
      loupe: live?.loupe?.state() ?? null,
      close: live?.close?.state() ?? null,
      master: (() => { const m = live?.master(); return m ? { progress: Number(m.progress().toFixed(3)), labels: Object.fromEntries(Object.entries(m.labels).map(([k, v]) => [k, Number(v.toFixed(3))])) } : null; })(),
    }),
  };
}
