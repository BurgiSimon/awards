import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker, damp } from '../_shared/raf.js';

syncMotionTierAttribute();
const preview = document.querySelector('[data-preview-el]');
const swatch = document.querySelector('[data-preview-swatch]');
const rows = [...document.querySelectorAll('[data-row]')];
const fine = matchMedia('(pointer: fine) and (hover: hover)');
const LERP = 0.25; const k = -Math.log(1 - LERP) * 60;
const target = { x: 0, y: 0 }; const pos = { x: 0, y: 0 };
const state = { visible: false, mode: 'none', current: '', shows: 0 };

ticker.add((dt) => {
  if (!state.visible || state.mode !== 'pointer') return;
  const d = motionTier() === 'full' ? dt : 1;
  pos.x = damp(pos.x, target.x, k, d); pos.y = damp(pos.y, target.y, k, d);
  preview.style.left = `${pos.x}px`; preview.style.top = `${pos.y}px`;
});

function show(row, mode) {
  swatch.style.background = row.dataset.preview;
  state.visible = true; state.mode = mode; state.current = row.querySelector('.row__name').textContent; state.shows++;
  preview.classList.add('is-visible');
  preview.classList.toggle('is-anchored', mode === 'keyboard');
  if (mode === 'keyboard') {
    // Anchor beside the focused row: no pointer to follow, so the preview sits at the row's right edge.
    const r = row.getBoundingClientRect();
    preview.style.left = `${Math.min(innerWidth - preview.offsetWidth - 16, r.right - preview.offsetWidth)}px`;
    preview.style.top = `${r.top + r.height / 2}px`;
  }
}
function hide() { state.visible = false; state.mode = 'none'; state.current = ''; preview.classList.remove('is-visible', 'is-anchored'); }

rows.forEach((row) => {
  row.addEventListener('pointerenter', (e) => { if (!fine.matches) return; pos.x = target.x = e.clientX; pos.y = target.y = e.clientY; show(row, 'pointer'); });
  row.addEventListener('pointermove', (e) => { target.x = e.clientX; target.y = e.clientY; });
  row.addEventListener('pointerleave', hide);
  row.addEventListener('focus', () => show(row, 'keyboard'));
  row.addEventListener('blur', hide);
});

awards.addState(() => ({
  motion: motionTier(),
  finePointer: fine.matches,
  visible: state.visible,
  mode: state.mode,
  current: state.current,
  shows: state.shows,
  previewLeft: Math.round(parseFloat(preview.style.left) || 0),
  previewTop: Math.round(parseFloat(preview.style.top) || 0),
  previewDisplay: getComputedStyle(preview).display,
  previewOpacity: Number(getComputedStyle(preview).opacity),
}));
awards.ready();
