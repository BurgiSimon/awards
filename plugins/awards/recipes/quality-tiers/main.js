import { awards } from '../_shared/awards-hook.js';
import { detectQualityTier } from '../_shared/quality-tiers.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const canvas = document.querySelector('[data-field]');
const still = document.querySelector('[data-still]');
const out = document.querySelector('[data-tier]');
const profileEl = document.querySelector('[data-profile]');
const ctx = canvas.getContext('2d');
const COUNT = { high: 600, mid: 240, low: 0 };
const state = { tier: 'pending', forced: 'auto', particles: 0, running: false, profile: null };
let unsubscribe = null;
let dots = [];

function render(profile) {
  // Every effect reads the profile; none of them re-probe.
  const tier = state.forced === 'auto' ? profile.tier : state.forced;
  state.tier = tier;
  html.setAttribute('data-quality', tier);
  out.textContent = tier;
  profileEl.innerHTML = Object.entries({ tier, dpr: profile.dpr, maxPixels: profile.maxPixels, post: profile.postprocessing, particles: profile.particles, blurSamples: profile.blurSamples, fps: profile.probe.fps, gpu: profile.probe.renderer.slice(0, 48) })
    .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');

  // Resolution: DPR cap and absolute pixel budget from the profile (mobile GPUs die on pixel count).
  const dpr = tier === 'high' ? Math.min(devicePixelRatio, 2) : tier === 'mid' ? Math.min(devicePixelRatio, 1.5) : 1;
  const w = 960, h = 540;
  const px = w * h * dpr * dpr;
  const scale = px > profile.maxPixels ? Math.sqrt(profile.maxPixels / px) : 1;
  canvas.width = Math.round(w * dpr * scale); canvas.height = Math.round(h * dpr * scale);

  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
  state.particles = motionTier() === 'full' ? COUNT[tier] : 0;
  const staticTier = state.particles === 0;
  canvas.hidden = staticTier; still.hidden = !staticTier;   // low tier (or reduced motion) shows a still, never a stutter
  state.running = !staticTier;
  if (staticTier) return;

  const ink = getComputedStyle(html).getPropertyValue('--accent').trim() || '#0016cb';
  dots = Array.from({ length: state.particles }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40, r: 1 + Math.random() * 2 }));
  unsubscribe = ticker.add((dt) => {
    ctx.fillStyle = getComputedStyle(html).getPropertyValue('--ground').trim() || '#f4f2ee';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = ink;
    for (const d of dots) {
      d.x = (d.x + d.vx * dt * dpr + canvas.width) % canvas.width;
      d.y = (d.y + d.vy * dt * dpr + canvas.height) % canvas.height;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r * dpr, 0, Math.PI * 2); ctx.fill();
    }
  });
}

const profile = await detectQualityTier({ sampleMs: 500 });
state.profile = profile;
render(profile);
document.querySelectorAll('[data-force]').forEach((btn) => btn.addEventListener('click', () => {
  state.forced = btn.dataset.force;
  document.querySelectorAll('[data-force]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  render(profile);
}));

awards.addState(() => ({
  motion: motionTier(),
  tier: state.tier,
  detected: state.profile?.tier,
  forced: state.forced,
  particles: state.particles,
  running: state.running,
  canvasHidden: canvas.hidden,
  stillHidden: still.hidden,
  canvasSize: [canvas.width, canvas.height],
  fps: state.profile?.probe.fps,
  renderer: state.profile?.probe.renderer?.slice(0, 40),
  attr: html.getAttribute('data-quality'),
}));
awards.ready();
