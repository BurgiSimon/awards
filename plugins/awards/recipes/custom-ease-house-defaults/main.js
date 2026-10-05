import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, onMotionTierChange } from '../_shared/reduced-motion.js';

gsap.registerPlugin(CustomEase);

const root = document.documentElement;
const CURVES = ['house', 'out', 'in', 'in-out', 'write'];
const DURATIONS = ['xs', 's', 'm', 'l', 'fade'];
const lanes = document.querySelector('[data-lanes]');
const playBtn = document.querySelector('[data-play]');
const probe = document.querySelector('[data-probe]');
let tokens = null;
let on = false;

// Read the tokens from CSS, the single source. Returns { ease: { house: [x1,y1,x2,y2], … }, dur: { m: .55, … }, stagger }.
function readTokens() {
  const cs = getComputedStyle(root);
  const seconds = (v) => { const n = parseFloat(v) || 0; return /ms\s*$/.test(v) ? n / 1000 : n; };
  const ease = {};
  for (const name of CURVES) {
    const pts = (cs.getPropertyValue(`--ease-${name}`).match(/-?\d*\.?\d+/g) || []).map(Number);
    if (pts.length !== 4) throw new Error(`--ease-${name} is not a cubic-bezier()`);
    ease[name] = pts;
  }
  const dur = Object.fromEntries(DURATIONS.map((k) => [k, seconds(cs.getPropertyValue(`--dur-${k}`))]));
  return { ease, dur, stagger: seconds(cs.getPropertyValue('--stagger')) };
}

// Register every curve once under its token name and make the house pair the default for every tween.
function apply(tier) {
  root.setAttribute('data-motion-tier', tier);
  document.querySelector('[data-tier-readout]').textContent = tier;
  tokens = readTokens();
  for (const [name, pts] of Object.entries(tokens.ease)) CustomEase.create(name, pts.join(','));
  gsap.defaults({ ease: 'house', duration: tokens.dur.m });
  document.querySelectorAll('[data-plot]').forEach((p) => {
    const [x1, y1, x2, y2] = tokens.ease[p.dataset.plot];
    p.setAttribute('d', `M0,1 C${x1},${1 - y1} ${x2},${1 - y2} 1,0`);
  });
  document.querySelector('[data-durations]').innerHTML = DURATIONS.map((k) => `<div><dt>--dur-${k}</dt><dd>${tokens.dur[k]} s</dd></div>`).join('');
  gsap.set(lanes.querySelectorAll('.dot:not([data-css-dot])'), { x: on ? travel() : 0 });
}

const travel = () => { const t = probe.parentElement; return t.clientWidth - probe.offsetWidth; };

function play(forward) {
  on = forward;
  playBtn.setAttribute('aria-pressed', String(forward));
  const x = forward ? travel() : 0;
  lanes.style.setProperty('--travel', `${travel()}px`);
  lanes.classList.toggle('is-on', forward);
  gsap.killTweensOf(lanes.querySelectorAll('.dot'));
  // The house lane names nothing: it is the proof that the defaults carry the curve and the tempo.
  gsap.to(probe, { x });
  for (const name of ['out', 'in', 'in-out', 'write']) {
    gsap.to(lanes.querySelector(`[data-lane="${name}"] .dot`), { x, ease: name });
  }
}

playBtn.addEventListener('click', () => play(!on));
addEventListener('resize', () => { if (on) { gsap.set(lanes.querySelectorAll('.dot:not([data-css-dot])'), { x: travel() }); lanes.style.setProperty('--travel', `${travel()}px`); } });

apply(motionTier());
onMotionTierChange(apply);

// Debug seam for verification and tuning: an unannotated, paused tween seeked to a fraction of its default duration.
window.__houseEase = {
  sampleDefault(p) {
    const el = document.createElement('div');
    document.body.append(el);
    const tw = gsap.to(el, { x: 1000, paused: true });
    tw.progress(p);
    const x = Number(gsap.getProperty(el, 'x'));
    const out = { x: x / 1000, ease: gsap.parseEase(gsap.defaults().ease)(p), duration: tw.duration() };
    tw.kill(); el.remove();
    return out;
  },
};

awards.addState(() => ({
  motion: root.getAttribute('data-motion-tier'),
  // gsap stores the default ease parsed (a function), so compare against parseEase('house').
  defaults: { ease: gsap.defaults().ease === gsap.parseEase('house') ? 'house' : 'other', duration: gsap.defaults().duration },
  tokens,
  playing: on,
  probeX: Math.round(Number(gsap.getProperty(probe, 'x')) || 0),
}));

awards.ready();
if (motionTier() === 'full') play(true);
