import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();
const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

const html = document.documentElement;
const readout = document.querySelector('[data-theme-readout]');
const meta = document.querySelector('meta[name="theme-color"]');
const canvas = document.querySelector('[data-canvas]');
const ctx = canvas.getContext('2d');
const TOKENS = ['--ground', '--ink', '--accent'];
const state = { theme: 'default', swaps: 0, tweening: false };

// Read each theme's token values from the stylesheet once, by probing an element that carries the attribute.
const themes = {};
for (const name of ['default', 'dark', 'accent']) {
  const probe = document.createElement('div');
  probe.setAttribute('data-theme', name);
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  themes[name] = Object.fromEntries(TOKENS.map((t) => [t, cs.getPropertyValue(t).trim()]));
  probe.remove();
}
html.removeAttribute('data-theme'); // the inline tokens on <html> take over from here
const live = { ...themes.default };
Object.assign(html.style, {}); TOKENS.forEach((t) => html.style.setProperty(t, live[t]));

function paint() {
  // The canvas clear colour is the same value the DOM is showing, read from the tween's live object.
  ctx.fillStyle = live['--ground'];
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = live['--accent'];
  ctx.beginPath(); ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = live['--ink']; ctx.lineWidth = 2; ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);
}

let tween = null;
function setTheme(name) {
  if (name === state.theme) return;
  state.theme = name; state.swaps++;
  readout.textContent = name;
  html.setAttribute('data-theme-live', name);
  if (tween) tween.kill(); // retarget: never stack tweens
  const target = themes[name];
  const duration = motionTier() === 'full' ? 1 : 0;
  state.tweening = duration > 0;
  tween = gsap.to(live, {
    ...target,
    duration,
    ease: 'power2.inOut', // the theme ease: cubic-bezier(.645,.045,.355,1) ≈ power2.inOut
    onUpdate() {
      TOKENS.forEach((t) => html.style.setProperty(t, live[t]));
      paint();
    },
    onComplete() { state.tweening = false; meta.setAttribute('content', live['--ground']); },
  });
}

gsap.utils.toArray('[data-swap]').forEach((section) => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top 50%',
    end: 'bottom 50%',
    onEnter: () => setTheme(section.dataset.swap),
    onEnterBack: () => setTheme(section.dataset.swap),
  });
});
paint();
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

awards.addState(() => ({
  motion: motionTier(),
  theme: state.theme,
  swaps: state.swaps,
  tweening: state.tweening,
  ground: html.style.getPropertyValue('--ground'),
  themeColor: meta.getAttribute('content'),
  canvasPixel: (() => { const d = ctx.getImageData(2, 2, 1, 1).data; return `rgb(${d[0]}, ${d[1]}, ${d[2]})`; })(),
}));
awards.ready();
