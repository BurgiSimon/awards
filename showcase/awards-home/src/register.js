// Registration. Every element on the spot plate (data-plate="y") moves as one layer: out of register on the first
// screen, pulled in phase by phase, meeting the key at the press check, where the stamp prints. The key plate (every
// word) never moves. One paused master timeline holds the choreography with a label per chapter; the scroll position
// is mapped onto it through the chapters' measured positions, so layout changes never re-time the moves. Nothing
// here writes to the scroll.
import gsap from 'gsap';

const MM = 3.78;                    // CSS px per millimetre
const START = { mm: 4.2, deg: 0.8 }; // the proof as it lands
const ANGLE = (-35 * Math.PI) / 180; // the direction the plate is off: up and to the right
const LABELS = ['sheet', 'run', 'floor', 'check'];
const PHASES = { sheet: 'Brief', floor: 'Audit', check: 'Jury', case: 'Recipes', ok: 'Ship' };
const OUT = 'cubic-bezier(0.25, 1, 0.5, 1)'; // --ease-out-expo, the mechanical register

const fmt = (mm) => `${mm < 0.005 ? '0.00' : `+${mm.toFixed(2)}`} mm`;

export function createRegister({ announce = () => {} }) {
  const root = document.documentElement;
  const out = document.querySelector('[data-register-error]');
  const phaseOut = document.querySelector('[data-register-phase]');
  const links = [...document.querySelectorAll('.slug__plates a')];
  const rows = [...document.querySelectorAll('.run__row')];
  const stamp = document.querySelector('[data-stamp]');
  const chapters = Object.fromEntries([...document.querySelectorAll('[data-chapter-at]')].map((el) => [el.dataset.chapterAt, el]));
  const plate = { mm: START.mm };
  let scale = 1;
  let vh = innerHeight;
  let anchors = [];
  let lastY = -1;
  let current = null;
  let stamped = false;
  let reduced = false;
  let master = null;
  let stampTl = null;
  let state = {};

  function apply() {
    const k = plate.mm / START.mm;
    const px = plate.mm * MM * scale;
    root.style.setProperty('--reg-x', `${(Math.cos(ANGLE) * px).toFixed(2)}px`);
    root.style.setProperty('--reg-y', `${(Math.sin(ANGLE) * px).toFixed(2)}px`);
    root.style.setProperty('--reg-r', `${(START.deg * k * scale).toFixed(3)}deg`);
    const text = fmt(plate.mm);
    if (out && out.textContent !== text) out.textContent = text; // plain text: read on demand, never announced per frame
  }

  const mm = gsap.matchMedia();
  mm.add({ full: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
    reduced = ctx.conditions.reduce;
    // master@sheet 4.20 mm → master@run 2.90 → master@floor 1.40 → master@check 0.00; scrubbed, so linear.
    master = gsap.timeline({ paused: true, defaults: { ease: 'none', duration: 1 } })
      .addLabel('sheet')
      .to(plate, { mm: 2.9 })
      .addLabel('run')
      .to(plate, { mm: 1.4 })
      .addLabel('floor')
      .to(plate, { mm: 0 })
      .addLabel('check');
    stampTl = stamp ? gsap.timeline({ paused: true }).fromTo(stamp,
      reduced ? { autoAlpha: 0 } : { autoAlpha: 0, scale: 1.25 },
      reduced ? { autoAlpha: 1, duration: 0.2, ease: 'none' } : { autoAlpha: 1, scale: 1, duration: 0.8, ease: OUT }) : null;
    if (stamped) stampTl?.progress(1);
    lastY = -1;
    return () => { master = null; stampTl = null; };
  });

  const top = (el) => el.getBoundingClientRect().top + scrollY;

  function measure() {
    vh = innerHeight;
    scale = parseFloat(getComputedStyle(root).getPropertyValue('--reg-scale')) || 1;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    const check = chapters.check;
    const meet = top(check) + Math.max(0, check.offsetHeight - vh) * 0.45; // halfway down the press check's rail
    anchors = LABELS.map((name, t) => ({ name, t, y: name === 'sheet' ? 0 : name === 'check' ? meet : top(chapters[name]) - vh * 0.45 }));
    for (let i = 1; i < anchors.length; i += 1) anchors[i].y = Math.min(max, Math.max(anchors[i].y, anchors[i - 1].y + 1));
    lastY = -1;
  }

  // Scroll position → time on the master timeline (its labels sit at whole seconds).
  function timeAt(y) {
    if (reduced) {
      let t = 0;
      for (const a of anchors) if (y >= a.y - vh * 0.1) t = a.t;
      return t;
    }
    for (let i = 1; i < anchors.length; i += 1) {
      const a = anchors[i - 1];
      const b = anchors[i];
      if (y <= b.y) return a.t + Math.max(0, (y - a.y) / Math.max(1, b.y - a.y));
    }
    return anchors[anchors.length - 1].t;
  }

  function phaseAt(y, chapter) {
    if (chapter === 'run') {
      const mid = vh * 0.5;
      let best = null;
      for (const r of rows) if (r.getBoundingClientRect().top <= mid) best = r;
      return best ? best.querySelector('.run__phase')?.textContent : 'Brief';
    }
    if (chapter === 'check' && stamped) return stamp?.querySelector('.stamp__word')?.textContent === 'OK to print' ? 'Press OK' : 'Proofed';
    return PHASES[chapter] || 'Brief';
  }

  function chapterAt(y) {
    let name = 'sheet';
    for (const [n, el] of Object.entries(chapters)) if (top(el) - vh * 0.5 <= y) name = n;
    return name;
  }

  function frame() {
    const y = window.lenis ? window.lenis.scroll : scrollY;
    if (y === lastY || !master) return; // nothing moved: nothing to print
    lastY = y;
    const t = timeAt(y);
    master.seek(t, false);
    apply(); // a seek that lands where it already is fires no update, so the plate is written every time
    if (!stamped && t >= 3) {
      stamped = true;
      stampTl?.play();
      const parts = stamp ? [...stamp.children].map((el) => el.textContent.trim()).filter(Boolean) : [];
      announce(`Plates in register. ${parts.join(', ')}.`);
    }
    const ch = chapterAt(y);
    if (ch !== current) {
      current = ch;
      for (const a of links) {
        if (a.dataset.chapter === ch) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      }
    }
    const ph = phaseAt(y, ch);
    if (phaseOut && phaseOut.textContent !== ph) phaseOut.textContent = ph;
    state = { register: Number(plate.mm.toFixed(2)), phase: ph, chapter: ch, stamped, label: master.currentLabel?.() ?? null };
  }

  measure();
  root.classList.add('is-live');
  const ro = new ResizeObserver(() => measure());
  ro.observe(document.body);
  gsap.ticker.add(frame);
  frame();

  return {
    state: () => state,
    refresh: measure,
    destroy() { gsap.ticker.remove(frame); ro.disconnect(); mm.revert(); },
  };
}
