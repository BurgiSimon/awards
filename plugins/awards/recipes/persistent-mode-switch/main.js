import gsap from 'gsap';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();

const html = document.documentElement;
const KEYS = { theme: 'psm:theme', grid: 'psm:grid' }; // the inline head script reads the same keys before first paint
// localStorage throws in some private windows: a switch that cannot remember still has to switch.
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* not persisted */ } },
};

const meta = document.querySelector('meta[name="theme-color"]');
const gridBtn = document.querySelector('[data-grid-toggle]');
const gridState = document.querySelector('[data-grid-state]');
const themeState = document.querySelector('[data-theme-state]');
const live = document.querySelector('[data-live]');
const dock = document.querySelector('[data-dock]');
const large = document.querySelector('[data-switch="close"]');
const switches = [...document.querySelectorAll('[data-switch]')];

const SWITCH_DUR = 0.4;          // indicator slide and the dock / close cross-scale
const SWITCH_EASE = 'power3.out'; // ≈ cubic-bezier(.06,.58,.3,1), the softer switch curve
const OUT_SCALE = 1.75;           // the leaving copy grows as it fades; the arriving one grows in from .5
const IN_SCALE = 0.5;

// The head script has already applied any stored value to <html>; read the page state back from there.
const restored = { theme: store.get(KEYS.theme), grid: store.get(KEYS.grid) };
const state = { theme: html.dataset.theme === 'dark' ? 'dark' : 'default', grid: html.dataset.grid === 'on', at: 'dock', hotkeys: 0, ignored: 0 };
const animate = () => motionTier() === 'full';

function placeIndicator(sw, dur) {
  const opt = sw.querySelector('input:checked').closest('.switch__opt');
  const ind = sw.querySelector('.switch__ind');
  const to = { x: opt.offsetLeft, width: opt.offsetWidth };
  if (dur) gsap.to(ind, { ...to, duration: dur, ease: SWITCH_EASE, overwrite: true });
  else { gsap.killTweensOf(ind); gsap.set(ind, to); }
}

// Render the current state into every surface that shows it. Only the copy the visitor can see slides.
function renderTheme(slide) {
  html.dataset.theme = state.theme;
  for (const sw of switches) {
    sw.querySelector(`input[value="${state.theme}"]`).checked = true;
    placeIndicator(sw, slide && sw.dataset.switch === state.at ? SWITCH_DUR : 0);
  }
  themeState.textContent = state.theme === 'dark' ? '[D]' : '[L]';
  meta.content = getComputedStyle(html).getPropertyValue('--ground').trim();
}
function renderGrid() {
  html.dataset.grid = state.grid ? 'on' : 'off';
  gridBtn.setAttribute('aria-pressed', String(state.grid));
  gridState.textContent = state.grid ? '[on]' : '[off]';
}

function setTheme(theme) {
  if (theme === state.theme) return;
  state.theme = theme;
  store.set(KEYS.theme, theme);
  renderTheme(animate()); // reduced / static: the state changes, nothing tweens
  live.textContent = `Theme: ${theme === 'dark' ? 'dark' : 'light'}`;
}
function setGrid(on) {
  state.grid = on;
  store.set(KEYS.grid, on ? 'on' : 'off');
  renderGrid();
  live.textContent = `Grid overlay ${on ? 'on' : 'off'}`;
}

for (const sw of switches) sw.addEventListener('change', (e) => setTheme(e.target.value));
gridBtn.addEventListener('click', () => setGrid(!state.grid));
document.querySelector('[data-guard-form]').addEventListener('submit', (e) => e.preventDefault());

// Single-key hotkeys. They stand down while the visitor types (text fields, not radios or buttons),
// for any Ctrl / Alt / Meta chord (browser and OS shortcuts win), for held-key repeats and during IME composition.
const TYPING = 'textarea, select, [contenteditable]:not([contenteditable="false"]), input:not([type="radio"], [type="checkbox"], [type="button"], [type="submit"], [type="reset"], [type="range"], [type="color"])';
addEventListener('keydown', (e) => {
  const k = e.key?.toLowerCase();
  if (k !== 'l' && k !== 'd' && k !== 'g') return;
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || e.isComposing || e.target.closest?.(TYPING)) { state.ignored++; return; }
  state.hotkeys++;
  if (k === 'g') setGrid(!state.grid);
  else setTheme(k === 'd' ? 'dark' : 'default');
});

// The close: the docked switch cross-scales out while a large centred copy arrives. One copy is reachable at a time,
// and a keyboard user on the leaving copy is handed to the arriving one.
function handoff(toClose) {
  const at = toClose ? 'close' : 'dock';
  if (at === state.at) return;
  state.at = at;
  const [out, into] = toClose ? [dock, large] : [large, dock];
  const hadFocus = out.contains(document.activeElement);
  out.inert = true;
  into.inert = false;
  const duration = animate() ? SWITCH_DUR : 0;
  gsap.to(out, { autoAlpha: 0, scale: toClose ? OUT_SCALE : IN_SCALE, duration, ease: SWITCH_EASE, overwrite: true });
  gsap.fromTo(into, { autoAlpha: 0, scale: toClose ? IN_SCALE : OUT_SCALE }, { autoAlpha: 1, scale: 1, duration, ease: SWITCH_EASE, overwrite: true });
  if (hadFocus) into.querySelector('input:checked').focus({ preventScroll: true });
}
gsap.set(large, { autoAlpha: 0, scale: IN_SCALE });
new IntersectionObserver(([entry]) => handoff(entry.isIntersecting), { threshold: 0.6 }).observe(document.querySelector('[data-close]'));

renderTheme(false);
renderGrid();
addEventListener('resize', () => switches.forEach((sw) => placeIndicator(sw, 0)));

awards.addState(() => ({
  motion: motionTier(),
  theme: state.theme,
  grid: state.grid,
  at: state.at,
  rootTheme: html.dataset.theme,
  rootGrid: html.dataset.grid,
  stored: { theme: store.get(KEYS.theme), grid: store.get(KEYS.grid) },
  restored,
  hotkeys: state.hotkeys,
  ignored: state.ignored,
  labels: { theme: themeState.textContent, grid: gridState.textContent, pressed: gridBtn.getAttribute('aria-pressed') },
}));
awards.ready();
