import gsap from 'gsap';
import { Core, Renderer, Transition } from '@unseenco/taxi';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

// This module runs once per hard load; taxi swaps views without re-executing it.
window.__loads = (window.__loads || 0) + 1;
syncMotionTierAttribute();

// Synthetic demo projects. case.html?p=N reads its heading from here, so a hard load of any case URL works.
const CASES = [
  ['Saltmarsh Ferry', 'Wayfinding for a tidal crossing'],
  ['Kiln Row Ceramics', 'Packaging for a shared studio'],
  ['Northlight Observatory', 'A night-sky visitor guide'],
  ['Ossa Running Club', 'Identity for a dawn league'],
  ['Pellmell Radio', 'Schedules for a pirate station'],
  ['Verdigris Hotel', 'Signage for a copper-roofed inn'],
];

// Seconds. rise = chosen row travels to the slot; push = route change (the row fades between the two);
// stagger = per step of distance from the chosen row; fade = each sibling's exit; chrome = the intro block.
const TIMING = {
  desktop: { rise: 1.15, push: 1.6, stagger: 0.09, fade: 0.65, chrome: 0.45 },
  phone: { rise: 0.8, push: 1.15, stagger: 0.06, fade: 0.65, chrome: 0.45 },
};
const phone = matchMedia('(max-width: 48rem)');

const state = { view: '', enters: 0 };
const exit = { chosen: -1, timing: '', rise: 0, push: 0, startTop: null, tweened: false, leftAt: null, clickAt: 0 };
let tl = null;

class PageRenderer extends Renderer {
  onEnter() {
    state.view = this.content.dataset.view;
    state.enters++;
    if (state.view !== 'case') return;
    const n = Math.min(CASES.length, Math.max(1, parseInt(new URLSearchParams(location.search).get('p'), 10) || 1));
    const [name, line] = CASES[n - 1];
    this.content.querySelector('[data-case-n]').textContent = String(n).padStart(2, '0');
    this.content.querySelector('[data-case-name]').textContent = name;
    this.content.querySelector('[data-case-line]').textContent = line;
    document.title = `${name} — transition-promote-chosen — awards recipe`;
  }
}

class PromoteChosen extends Transition {
  onLeave({ from, trigger, done }) {
    exit.clickAt = performance.now();
    const finish = () => { exit.leftAt = (performance.now() - exit.clickAt) / 1000; done(); }; // taxi pushes the route right after this
    const rows = [...from.querySelectorAll('[data-row]')];
    exit.chosen = trigger instanceof Element ? rows.indexOf(trigger.closest('[data-row]')) : -1;
    exit.tweened = false;
    // Reduced and static tiers: the route changes at once, nothing moves.
    if (motionTier() !== 'full') return finish();

    const t = TIMING[phone.matches ? 'phone' : 'desktop'];
    Object.assign(exit, { timing: phone.matches ? 'phone' : 'desktop', rise: t.rise, push: t.push, tweened: true });
    tl = gsap.timeline();
    tl.to(from.querySelectorAll('[data-chrome]'), { opacity: 0, duration: t.chrome, ease: 'power2.in' }, 0);

    // Back link or history navigation: no chosen row, a plain fade.
    if (exit.chosen < 0) {
      tl.to(rows, { opacity: 0, duration: t.chrome, ease: 'power2.in' }, 0).call(finish, null, t.chrome);
      return;
    }

    const row = rows[exit.chosen];
    exit.startTop = row.getBoundingClientRect().top;
    row.setAttribute('data-chosen', '');
    const slot = parseFloat(getComputedStyle(from).paddingTop); // the fixed bar + gap: where the next page's heading sits
    rows.forEach((r, i) => {
      if (i === exit.chosen) return;
      const b = r.getBoundingClientRect();
      if (b.bottom < 0 || b.top > innerHeight) return gsap.set(r, { opacity: 0 }); // off-screen rows leave at once
      tl.to(r, { opacity: 0, y: 18, duration: t.fade, ease: 'power2.in' }, t.stagger * Math.abs(i - exit.chosen));
    });
    tl.to(row, { y: slot - exit.startTop, duration: t.rise, ease: 'power2.inOut' }, 0)
      .to(row, { opacity: 0, duration: t.push - t.rise, ease: 'power1.out' }, t.rise)
      .call(finish, null, t.push);
  }

  onEnter({ to, done }) {
    tl?.kill();
    tl = null;
    window.scrollTo(0, 0);
    if (motionTier() === 'full') gsap.from(to, { opacity: 0, duration: 0.45, ease: 'power1.out', clearProps: 'opacity' });
    done();
  }
}

const taxi = new Core({ renderers: { default: PageRenderer }, transitions: { default: PromoteChosen }, allowInterruption: false });
taxi.on('NAVIGATE_END', () => document.querySelector('[data-focus]')?.focus({ preventScroll: true }));

awards.addState(() => ({
  motion: motionTier(),
  loads: window.__loads,
  view: state.view,
  enters: state.enters,
  path: location.pathname.split('/').pop(),
  search: location.search,
  exit: { ...exit, time: tl ? tl.time() : null },
  tweens: gsap.globalTimeline.getChildren(true, true, true).length,
}));
awards.ready();
