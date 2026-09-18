import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Core, Renderer, Transition } from '@unseenco/taxi';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

// This module runs once per hard load; taxi swaps views without re-executing it.
window.__loads = (window.__loads || 0) + 1;
gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();
const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

const wipe = document.querySelector('[data-wipe]');
gsap.set(wipe, { yPercent: 100 }); // GSAP owns the wipe transform from the start
const state = { view: '', enters: 0, leaves: 0, contexts: 0, transitioning: false };
let pageCtx = null;

// Renderer: everything a view needs is created inside a gsap.context on enter and reverted on leave,
// so ScrollTriggers, tweens and listeners never leak from one page to the next.
class PageRenderer extends Renderer {
  onEnter() {
    state.view = this.content.dataset.view;
    state.enters++;
    // Chrome outside the wrapper is not swapped by taxi, so the header link is retargeted per view.
    const nav = document.querySelector('[data-nav]');
    if (nav) { nav.href = state.view === 'index' ? './about.html' : './index.html'; nav.textContent = state.view === 'index' ? 'About →' : '← Work'; }
    pageCtx = gsap.context(() => {
      if (motionTier() === 'full') gsap.from(this.content.querySelectorAll('.line'), { yPercent: 120, duration: 1.2, ease: 'expo.out', stagger: 0.08, clearProps: 'transform' });
    }, this.content);
    state.contexts++;
    ScrollTrigger.refresh();
  }
  onLeave() {
    state.leaves++;
    if (pageCtx) { pageCtx.revert(); pageCtx = null; state.contexts--; }
  }
}

// Transition: a wipe covers the old view, the new view is swapped in underneath, the wipe leaves.
class Wipe extends Transition {
  onLeave({ done }) {
    state.transitioning = true;
    if (motionTier() !== 'full') { gsap.set(wipe, { yPercent: 0 }); return done(); }
    gsap.fromTo(wipe, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'expo.inOut', onComplete: done });
  }
  onEnter({ done }) {
    lenis.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    const finish = () => { state.transitioning = false; done(); };
    if (motionTier() !== 'full') { gsap.set(wipe, { yPercent: 100 }); return finish(); }
    gsap.to(wipe, { yPercent: -100, duration: 0.7, ease: 'expo.inOut', delay: 0.1, onComplete: () => { gsap.set(wipe, { yPercent: 100 }); finish(); } });
  }
}

const taxi = new Core({ renderers: { default: PageRenderer }, transitions: { default: Wipe }, allowInterruption: false });
taxi.on('NAVIGATE_END', () => { document.querySelector('[data-nav]')?.focus?.({ preventScroll: true }); });

awards.addState(() => ({
  motion: motionTier(),
  loads: window.__loads,
  view: state.view,
  enters: state.enters,
  leaves: state.leaves,
  contexts: state.contexts,
  transitioning: state.transitioning,
  path: location.pathname.split('/').pop(),
  title: document.title.split(' — ')[0],
  triggers: ScrollTrigger.getAll().length,
}));
awards.ready();
