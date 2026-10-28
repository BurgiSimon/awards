import { awards } from '../../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// Prism labels. Each [data-prism] link is written as its plain label; this module turns it into a CSS 3D box with the
// label on its front face and an aria-hidden copy on the face below, so a quarter turn about X (CSS, on hover and on
// keyboard focus) rolls the copy into view. The box sits back by half its height, so it turns about its own centre and
// the front face rests exactly in the page plane. `letters` builds one box per letter with a stagger. The only script
// work is building the faces and measuring each box's half-height; every state change is CSS.

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
    a.append(row);
  } else {
    a.append(box(label));
  }
}

// Depth = half the box's own height, measured, so a label that wraps to two lines still turns about its centre.
const boxes = [...document.querySelectorAll('.prism__box')];
function measure() {
  for (const b of boxes) b.style.setProperty('--depth', `${(b.offsetHeight / 2).toFixed(2)}px`);
}
measure();
new ResizeObserver(measure).observe(document.body);
document.fonts.ready.then(measure);

awards.addState(() => ({
  motion: tier,
  prisms: links.length,
  boxes: boxes.length,
  hiddenCopies: document.querySelectorAll('.prism__face--next[aria-hidden="true"]').length,
  turn: html.classList.contains('prisms-turn'),
  swap: html.classList.contains('prisms-swap'),
}));
awards.ready();
