import { awards } from '../../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// Prism labels. Each [data-prism] link is written as its plain label; this module turns it into a box with the label
// on its front face and an aria-hidden copy on the face below, so a quarter turn about X (CSS, on hover and on keyboard
// focus) rolls the copy into view. The box turns about an axis half its own height behind the label, so the copy ends
// exactly where the label was. `letters` builds one box per letter with a stagger. The only script work is building
// the faces and measuring each box's half-height; every state change, and the 3D itself, is CSS.

syncMotionTierAttribute();
let tier = motionTier();
const html = document.documentElement;
const applyTier = () => {
  html.classList.toggle('prisms-turn', tier === 'full');        // the 3D turn
  html.classList.toggle('prisms-swap', tier !== 'full');        // reduced and static: the faces swap in place
  html.classList.toggle('prisms-still', tier === 'static');     // static: and without a fade
};
applyTier();
onMotionTierChange((t) => { tier = t; applyTier(); });
// A site's own motion setting writes data-motion on <html>; follow it as well as the system preference.
new MutationObserver(() => { tier = motionTier(); applyTier(); }).observe(html, { attributes: true, attributeFilter: ['data-motion'] });
// iOS Safari applies :active (the press state touch gets instead of a turn) only once the page has a touch listener;
// an empty handler on the document is enough (it does nothing, so it cannot block scrolling).
document.ontouchstart = () => {};

const links = [...document.querySelectorAll('[data-prism]')];
// Letters are split by grapheme, and their row keeps the label's own direction: separate boxes would otherwise be laid
// out in the page's direction and spell a Latin title backwards on a right-to-left page.
const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
const graphemes = (w) => (segmenter ? [...segmenter.segment(w)].map((g) => g.segment) : [...w]);
const RTL = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const span = (cls, text) => {
  const s = document.createElement('span');
  s.className = cls;
  if (text != null) s.textContent = text;
  return s;
};
// One box: the real label in front, its copy (hidden from assistive technology) on the face that turns in.
function box(label) {
  const b = span('prism__box');
  const next = span('prism__face prism__face--next', label);
  next.setAttribute('aria-hidden', 'true');
  b.append(span('prism__face prism__face--front', label), next);
  return b;
}

for (const a of links) {
  const label = a.textContent.trim();
  a.textContent = '';
  if (a.dataset.prism === 'letters') {
    // The accessible name stays one word-shaped string: a visually hidden label, with the letter boxes aria-hidden.
    a.append(span('sr-only', label));
    const row = span('prism__row');
    row.setAttribute('aria-hidden', 'true');
    row.dir = RTL.test(label) ? 'rtl' : 'ltr';
    let i = 0;
    for (const part of label.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { row.append(' '); continue; }
      const word = span('prism__word');          // words wrap as units; letters never break apart
      for (const ch of graphemes(part)) {
        const b = box(ch);
        b.style.setProperty('--i', String(i++));
        word.append(b);
      }
      row.append(word);
    }
    row.style.setProperty('--steps', String(Math.max(1, i - 1)));   // the stagger is capped per title in CSS
    a.append(row);
  } else {
    a.append(box(label));
  }
}

// Depth = half the box's own height, so a label that wraps to two lines still turns about its centre. Each box is
// observed, so a font swap, a resize or a narrower column re-measures it; the observer hands over the sizes, so nothing
// is read back from layout, and only a changed value is written.
const boxes = [...document.querySelectorAll('.prism__box')];
const depths = new WeakMap();
const sizes = new ResizeObserver((entries) => {
  for (const e of entries) {
    const h = e.borderBoxSize?.[0]?.blockSize ?? e.target.offsetHeight;
    const d = `${(h / 2).toFixed(2)}px`;
    if (depths.get(e.target) !== d) { depths.set(e.target, d); e.target.style.setProperty('--depth', d); }
  }
});
for (const b of boxes) sizes.observe(b);

awards.addState(() => ({
  motion: tier,
  prisms: links.length,
  boxes: boxes.length,
  hiddenCopies: document.querySelectorAll('.prism__face--next[aria-hidden="true"]').length,
  turn: html.classList.contains('prisms-turn'),
  swap: html.classList.contains('prisms-swap'),
}));
awards.ready();
