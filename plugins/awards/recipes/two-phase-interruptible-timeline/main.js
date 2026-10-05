import gsap from 'gsap';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();

const toggle = document.querySelector('[data-nav-toggle]');
const panel = document.querySelector('[data-nav-panel]');
const links = gsap.utils.toArray('[data-nav-link]');
const bars = gsap.utils.toArray('[data-bar]');
const label = toggle.querySelector('.nav__label');

let tl;
let hinge = 0; // I: the time of the addPause() between the open half and the close half
let wantOpen = false;

// One paused timeline: open half → addPause() at I → close half. Both directions live in one object.
function build(tier) {
  const t = gsap.timeline({ paused: true, onComplete: () => tl.pause(0) }); // close half done: back to rest, ready to reopen
  if (tier === 'full') {
    t.set(panel, { autoAlpha: 1 }, 0.001) // not at 0: a set at 0 stays applied when pause(0) lands on it
      .fromTo(panel, { clipPath: 'inset(0% 0% 100% 0% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 0.7, ease: 'expo.inOut' }, 0)
      .to(bars[0], { y: 4.25, rotation: 45, duration: 0.45, ease: 'power3.out' }, 0.05)
      .to(bars[1], { y: -4.25, rotation: -45, duration: 0.45, ease: 'power3.out' }, 0.05)
      .fromTo(links, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', stagger: 0.04 }, 0.12);
    hinge = t.duration();
    t.addPause(hinge)
      .to(links, { yPercent: -40, autoAlpha: 0, duration: 0.28, ease: 'power2.in', stagger: { each: 0.02, from: 'end' } }, hinge)
      .to(bars, { y: 0, rotation: 0, duration: 0.35, ease: 'power2.inOut' }, '<')
      .to(panel, { clipPath: 'inset(0% 0% 100% 0% round 20px)', duration: 0.5, ease: 'power3.inOut' }, '<0.08')
      .set(panel, { autoAlpha: 0 });
  } else {
    // reduced and static: the same hinge, opacity only — no spatial movement.
    t.set(panel, { clipPath: 'inset(0% 0% 0% 0% round 20px)' }, 0)
      .fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: 'none' }, 0)
      .set(bars[0], { y: 4.25, rotation: 45 }, 0)
      .set(bars[1], { y: -4.25, rotation: -45 }, 0)
      .fromTo(links, { yPercent: 0, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: 'none', stagger: 0.03 }, 0.05);
    hinge = t.duration();
    t.addPause(hinge)
      .to(panel, { autoAlpha: 0, duration: 0.2, ease: 'none' }, hinge)
      .set(bars, { y: 0, rotation: 0 })
      .set(links, { autoAlpha: 0 });
  }
  return t;
}

function setOpen(open) {
  wantOpen = open;
  toggle.setAttribute('aria-expanded', String(open));
  label.textContent = open ? 'Close' : 'Menu';
  panel.inert = !open;
  if (motionTier() === 'static') { tl.pause(open ? hinge : 0); return; }
  if (open) {
    // From rest or from a rewind: play forward to the hinge. From inside the close half: rewind back to the hinge
    // (the addPause callback fires in reverse too and holds it there).
    tl.time() > hinge ? tl.reverse() : tl.play();
  } else {
    // The move: before the hinge, rewind what has played; at the hinge, play the close half forward.
    tl.time() < hinge ? tl.reverse() : tl.play();
  }
}

tl = build(motionTier());
onMotionTierChange((tier) => { tl.kill(); tl = build(tier); tl.pause(wantOpen ? hinge : 0); });
panel.inert = true;

toggle.addEventListener('click', () => setOpen(!wantOpen));
links.forEach((a) => a.addEventListener('click', () => setOpen(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && wantOpen) { setOpen(false); toggle.focus(); }
});

awards.addState(() => ({
  motion: motionTier(),
  open: wantOpen,
  expanded: toggle.getAttribute('aria-expanded'),
  time: Number(tl.time().toFixed(4)),
  hinge: Number(hinge.toFixed(4)),
  paused: tl.paused(),
  reversed: tl.reversed(),
  linkY: Number(gsap.getProperty(links[0], 'yPercent')),
}));
awards.ready();
