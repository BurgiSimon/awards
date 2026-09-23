import gsap from 'gsap';
import { awards } from '../_shared/awards-hook.js';
import { ticker } from '../_shared/raf.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();
const html = document.documentElement;
const $ = (s) => document.querySelector(s);
const curtain = $('[data-curtain]');
const frame = $('[data-frame]');
const media = $('[data-media]');
const copy = $('[data-copy]');
const canvas = $('[data-canvas]');
const main = $('#main');
const behind = [$('.topbar'), main, $('footer')];

const KEY = 'awards:aperture';            // same key as the inline head script
const MAX_GATE_MS = 4000;                 // ceiling only: the gate normally opens on its signals
const APERTURE = 'inset(30% round 12px)'; // closed: a rounded window in the middle of the viewport
const OPEN = 'inset(0% round 0px)';       // same number of values, so GSAP interpolates the string
const state = { phase: 'open', mode: 'none', skipped: true, fallback: false, signals: [], gateMs: 0, totalMs: 0, runs: 0 };
let tl = null;
let runStart = performance.now();

// ---- Placeholder film: canvas 2D at 1/6 resolution, scaled up soft by CSS. Its first frame is the hero's ready signal,
// the stand-in for a video's first decoded frame (requestVideoFrameCallback / 'loadeddata') or a poster's decode().
const ctx = canvas.getContext('2d');
let heroReadyResolve;
const heroReady = new Promise((r) => (heroReadyResolve = r));
const BLOOMS = ['#0016cb', '#ff5a36', '#ffc800'];
function draw(t) {
  const { width: w, height: h } = canvas;
  const s = t / 1000;
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#0b0c24';
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 0.75;
  BLOOMS.forEach((c, i) => {
    const x = w * (0.5 + 0.32 * Math.sin(s * 0.21 + i * 2.1));
    const y = h * (0.45 + 0.25 * Math.cos(s * 0.17 + i * 1.7));
    const r = Math.max(w, h) * (0.32 + 0.06 * Math.sin(s * 0.3 + i));
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, c);
    g.addColorStop(1, c + '00');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
  heroReadyResolve();
}
const tick = (dt, t) => draw(t);
let heroVisible = false;
const film = () => (heroVisible && motionTier() === 'full' ? ticker.add(tick) : ticker.remove(tick));
new ResizeObserver(() => {
  // clientWidth is the layout box, unaffected by the media's scale tween.
  canvas.width = Math.max(1, Math.ceil(media.clientWidth / 6));
  canvas.height = Math.max(1, Math.ceil(media.clientHeight / 6));
  draw(performance.now());
}).observe(media);
new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; film(); }).observe(frame);
onMotionTierChange(film);

// ---- The load gate: real signals raced against a ceiling. No minimum hold.
function gate() {
  const t0 = performance.now();
  const mark = (name, p) => p.then(() => {
    state.signals.push(name);
    curtain.querySelector(`[data-signal="${name}"]`)?.classList.add('is-done');
  });
  let timer;
  const ceiling = new Promise((r) => { timer = setTimeout(() => { state.fallback = true; r(); }, MAX_GATE_MS); });
  const signals = Promise.all([mark('fonts', document.fonts.ready), mark('hero', heroReady)]);
  return Promise.race([signals, ceiling]).then(() => { clearTimeout(timer); state.gateMs = Math.round(performance.now() - t0); });
}

function lock(on) {
  html.classList.toggle('is-gated', on);  // overflow: hidden on the root: wheel, touch and keys cannot scroll
  for (const el of behind) el.inert = on; // nothing behind the curtain takes focus
}

function intro() {
  runStart = performance.now();
  Object.assign(state, { phase: 'gate', skipped: false, fallback: false, signals: [], gateMs: 0, totalMs: 0, runs: state.runs + 1 });
  lock(true);
  curtain.hidden = false;
  const tier = motionTier();
  // The aperture only plays from the top of the page with full motion; otherwise the curtain fades (reduced) or cuts (static).
  state.mode = tier === 'static' ? 'cut' : tier === 'full' && scrollY < 2 ? 'aperture' : 'fade';
  if (state.mode === 'aperture') {
    // Set under the curtain, so the closed aperture is never seen before the lift.
    gsap.set(frame, { clipPath: APERTURE });
    gsap.set(media, { scale: 0.6 });
    gsap.set(copy, { autoAlpha: 0, y: 24 });
  }
  gate().then(() => {
    if (state.phase !== 'gate') return;     // skipped while waiting
    state.phase = 'handoff';
    tl = gsap.timeline({ onComplete: () => finish(false) });
    if (state.mode === 'aperture') {
      tl.to(curtain, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' })
        .to(frame, { clipPath: OPEN, duration: 1.4, ease: 'expo.inOut' }, 0.3)
        .to(media, { scale: 1, duration: 1.4, ease: 'expo.inOut' }, 0.3)
        .to(copy, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out' }, 1.1);
    } else if (state.mode === 'fade') {
      tl.to(curtain, { autoAlpha: 0, duration: 0.6, ease: 'power1.out' });
    }
  });
}

function finish(skipped) {
  tl?.kill();
  tl = null;
  const hadFocus = curtain.contains(document.activeElement);
  gsap.set([curtain, frame, media, copy], { clearProps: 'all' });
  curtain.hidden = true;                    // out of the layout and the accessibility tree
  lock(false);
  if (hadFocus) main.focus({ preventScroll: true });
  Object.assign(state, { phase: 'open', skipped, totalMs: Math.round(performance.now() - runStart) });
  try { sessionStorage.setItem(KEY, '1'); } catch {}
  awards.ready();                           // capture waits for the open hero, not for the curtain
}

if (html.classList.contains('is-gated')) intro();
else finish(true);                          // repeat visit in this session: no gate at all

$('[data-skip]').addEventListener('click', () => finish(true));
$('[data-replay]').addEventListener('click', () => {
  if (state.phase !== 'open') return;
  scrollTo(0, 0);
  intro();
  $('[data-skip]').focus();
});

awards.addState(() => ({ motion: motionTier(), ...state, signals: [...state.signals] }));
