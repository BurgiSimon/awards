import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute, onMotionTierChange } from '../_shared/reduced-motion.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();
const list = document.querySelector('[data-rows]');
const SPEED = Number(list.dataset.speed || 70); // px/s: one token for every row, whatever its length
const canHover = matchMedia('(hover: hover)');
const rows = [...list.querySelectorAll('[data-row]')].map(build);

// Synthetic demo stills: a coloured frame per aspect ratio in data-frames, then the copy is duplicated once.
// The whole reel is aria-hidden, so the duplicate needs no extra treatment; the caption link is the only stop.
function build(li, i) {
  const track = li.querySelector('[data-track]');
  const copy = document.createDocumentFragment();
  li.dataset.frames.trim().split(/\s+/).forEach((r, j) => {
    const s = document.createElement('span');
    s.className = 'still';
    s.style.setProperty('--r', r);
    s.style.setProperty('--m', 25 + ((i * 3 + j * 5) % 7) * 10);
    s.textContent = `${String(i + 1).padStart(2, '0')}.${j + 1}`;
    copy.append(s);
  });
  track.append(copy.cloneNode(true), copy);
  return { li, track, reel: li.querySelector('.grow'), reasons: new Set(), copyWidth: 0, dur: 0, visible: false, video: null };
}

// Set the speed, not the duration: duration = one copy's measured width / px per second.
function measure(row) {
  row.copyWidth = row.track.offsetWidth / 2; // offsetWidth ignores the hover scale
  row.dur = row.copyWidth / SPEED;
  row.track.style.setProperty('--dur', `${row.dur}s`);
}
rows.forEach(measure);
new ResizeObserver(() => rows.forEach(measure)).observe(list);

function pause(row, reason, on) {
  on ? row.reasons.add(reason) : row.reasons.delete(reason);
  row.li.toggleAttribute('data-paused', row.reasons.size > 0); // CSS: animation-play-state: paused
}

// Hover clip: one tiny canvas stream shared by every row, drawn only while a row is hovered. No media files ship.
let stream = null, drawing = null, hovered = 0;
const canvas = document.createElement('canvas');
canvas.width = 160; canvas.height = 90;
const g = canvas.getContext('2d');
function draw(dt, t = 0) {
  const css = getComputedStyle(document.documentElement);
  g.fillStyle = css.getPropertyValue('--ink'); g.fillRect(0, 0, 160, 90);
  g.fillStyle = css.getPropertyValue('--accent'); g.fillRect(((t / 8) % 200) - 40, 0, 40, 90);
}
function clip() {
  if (!stream) { draw(); stream = canvas.captureStream(24); }
  return stream;
}

// Mount the video only where it can be used: a hover-capable pointer, full motion, an on-screen row.
function syncVideo(row) {
  const want = row.visible && canHover.matches && motionTier() === 'full';
  if (want && !row.video) {
    const v = document.createElement('video');
    Object.assign(v, { muted: true, playsInline: true, srcObject: clip() });
    v.dataset.synthetic = 'canvas-stream';
    row.reel.append(v);
    row.video = v;
  } else if (!want && row.video) {
    row.video.remove();
    row.video = null;
  }
}

for (const row of rows) {
  row.li.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'touch') return;
    pause(row, 'hover', true);
    if (!row.video) return;
    row.video.play().catch(() => {});
    if (hovered++ === 0) drawing = ticker.add(draw);
  });
  row.li.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'touch') return;
    pause(row, 'hover', false);
    if (!row.video) return;
    row.video.pause();
    if (--hovered <= 0) { hovered = 0; drawing?.(); drawing = null; }
  });
  row.li.addEventListener('focusin', () => pause(row, 'focus', true));
  row.li.addEventListener('focusout', () => pause(row, 'focus', false));
}

// Off-screen rows stop: no compositor work for reels nobody sees.
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    const row = rows.find((r) => r.li === e.target);
    row.visible = e.isIntersecting;
    pause(row, 'offscreen', !e.isIntersecting);
    syncVideo(row);
  }
});
rows.forEach((r) => io.observe(r.li));
onMotionTierChange(() => rows.forEach(syncVideo));
canHover.addEventListener('change', () => rows.forEach(syncVideo));

awards.addState(() => ({
  motion: motionTier(),
  speed: SPEED,
  hover: canHover.matches,
  rows: rows.map((r) => ({ paused: [...r.reasons], copyWidth: Math.round(r.copyWidth), dur: Number(r.dur.toFixed(2)), video: !!r.video })),
}));
awards.ready();
