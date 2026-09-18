import gsap from 'gsap';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();
const LADDER = [0, 1, 0, 0, 1, 1];   // the opacity steps every glyph runs, in order
const STEP = 0.04;                    // seconds per glyph of stagger
const state = { elements: 0, glyphs: 0, played: 0, hovers: 0 };

// Split into glyph spans while keeping the original text readable: the source string becomes a visually
// hidden mirror and the spans are aria-hidden, so screen readers hear a word, not twenty letters.
function splitGlyphs(el) {
  const text = el.textContent;
  el.innerHTML = '';
  const mirror = document.createElement('span'); mirror.className = 'sr-only'; mirror.textContent = text; el.appendChild(mirror);
  const wrap = document.createElement('span'); wrap.setAttribute('aria-hidden', 'true'); el.appendChild(wrap);
  for (const ch of text) {
    const s = document.createElement('span');
    s.className = 'glyph' + (ch === ' ' ? ' space' : '');
    s.textContent = ch === ' ' ? ' ' : ch;
    wrap.appendChild(s);
  }
  return [...wrap.children];
}

function flicker(glyphs, { shift = 0 } = {}) {
  // Keyframes with ease 'none' produce hard steps; the ladder is the whole character of the effect.
  const tl = gsap.timeline({ onComplete: () => { state.played++; } });
  tl.fromTo(glyphs, { opacity: 0 }, { keyframes: LADDER.map((o) => ({ opacity: o, duration: 0.05 })), ease: 'none', stagger: STEP }, 0);
  if (shift) tl.fromTo(glyphs, { x: shift }, { x: 0, duration: 0.8, ease: 'expo.out', stagger: STEP * 0.5 }, 0);
  return tl;
}

await document.fonts.ready;
document.querySelectorAll('[data-flicker]').forEach((el) => {
  const glyphs = splitGlyphs(el);
  state.elements++; state.glyphs += glyphs.length;
  if (motionTier() === 'full') {
    flicker(glyphs);
    if (el.hasAttribute('data-flicker-hover')) {
      el.addEventListener('pointerenter', () => { state.hovers++; flicker(glyphs, { shift: 6 }); });
      el.addEventListener('focus', () => flicker(glyphs, { shift: 6 }));
    }
  } else {
    gsap.set(glyphs, { opacity: 1 }); // reduced motion: the glyphs are simply there
    state.played = state.elements;
  }
});

awards.addState(() => ({
  motion: motionTier(),
  elements: state.elements,
  glyphs: state.glyphs,
  played: state.played,
  hovers: state.hovers,
  headlineGlyphs: document.querySelectorAll('#t .glyph').length,
  headlineOpacityMin: Math.min(...[...document.querySelectorAll('#t .glyph')].map((g) => Number(getComputedStyle(g).opacity))),
  mirrorText: document.querySelector('#t .sr-only')?.textContent,
}));
awards.ready();
