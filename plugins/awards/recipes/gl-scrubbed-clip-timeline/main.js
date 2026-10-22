import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier, applyRendererBudget } from '../_shared/quality-tiers.js';

gsap.registerPlugin(ScrollTrigger);
syncMotionTierAttribute();

const html = document.documentElement;
const track = document.querySelector('[data-track]');
const canvas = document.querySelector('[data-gl]');
const glReadout = document.querySelector('[data-gl-readout]');
const clipReadout = document.querySelector('[data-clip-readout]');
const links = [...document.querySelectorAll('[data-seek]')];
const tier = motionTier();
const coarse = matchMedia('(pointer: coarse)').matches;

// ── The score: one timeline of nine units, a slot of three per form ─────────────────────────────────────
// Each slot is three sub-tweens, placed relative to the slot's start s = SLOT × i:
//   hand-off  the rail slides the previous form out and this one in; it straddles the slot boundary
//   growth    a 0–1 proxy that becomes mixer.setTime(proxy × clip.duration)
//   tone      the material warms from the rest grey to the accent
// Everything is done by s + SETTLE, the pose shown under reduced motion; the next hand-off starts at s + SLOT − .5.
const UNITS = 9, SLOT = 3, SETTLE = 2.25, GAP = 7;
const HANDOFF = { at: -0.5, dur: 1, ease: 'power2.inOut' };
const GROW = { at: 0.25, dur: 1.75, ease: 'sine.inOut' };
const TONE = { at: 1, dur: 1.25, ease: 'sine.inOut' };
const SCRUB = coarse ? 0.3 : 0.8; // s the playhead takes to catch the scroll: shorter under a finger
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const slotAt = (time) => clamp(Math.floor(time / SLOT), 0, 2);

// Lenis on the GSAP ticker (1.3 defaults to autoRaf: false; a Lenis with no clock swallows the wheel).
const lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: tier === 'full' });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;

// ── Clips built in code: keyframe tracks on named children of procedural groups ─────────────────────────
const Y = new THREE.Vector3(0, 1, 0), X = new THREE.Vector3(1, 0, 0);
const quat = (yaw, pitch = 0) => new THREE.Quaternion().setFromAxisAngle(Y, yaw).multiply(new THREE.Quaternion().setFromAxisAngle(X, pitch)).toArray();
// Hold the rest value until `from`, move to the end value by `to`, hold to the clip's end. Times stay strictly increasing.
function hold(D, from, to, a, b) {
  const times = [0], values = [...a];
  if (from > 0) { times.push(from); values.push(...a); }
  times.push(to); values.push(...b);
  if (to < D) { times.push(D); values.push(...b); }
  return [times, values];
}

function buildForms(segments, mats) {
  const forms = [];
  const plinth = new THREE.RingGeometry(1.05, 1.12, segments);
  plinth.rotateX(-Math.PI / 2);
  const add = (name, D, root, tracks) => {
    const ring = new THREE.Mesh(plinth, mats.line);
    ring.position.y = 0.002;
    root.add(ring);
    root.name = name;
    forms.push({ name, root, clip: new THREE.AnimationClip(`${name}-growth`, D, tracks) });
  };

  // Bloom: a bud of eight petals on pivots that open outward, a heart that swells, a quarter turn on the root.
  {
    const D = 2.4, root = new THREE.Group(), tracks = [];
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.6, 12), mats.rest);
    stem.position.y = 0.3;
    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.3, segments, segments / 2), mats.tone);
    heart.name = 'heart'; heart.position.y = 0.72;
    root.add(stem, heart);
    const petal = new THREE.SphereGeometry(1, segments, segments / 2);
    petal.scale(0.24, 0.68, 0.07); petal.translate(0, 0.66, 0);
    for (let k = 0; k < 8; k++) {
      const pivot = new THREE.Group();
      pivot.name = `petal${k}`; pivot.position.y = 0.62;
      pivot.add(new THREE.Mesh(petal, mats.tone));
      root.add(pivot);
      const yaw = (k * Math.PI) / 4, open = 1.1 + (k % 2) * 0.14;
      tracks.push(new THREE.QuaternionKeyframeTrack(`petal${k}.quaternion`, ...hold(D, D * (0.06 + 0.03 * k), D * (0.6 + 0.03 * k), quat(yaw, 0.16), quat(yaw, open))));
    }
    tracks.push(new THREE.VectorKeyframeTrack('heart.scale', [0, D * 0.45, D], [0.3, 0.3, 0.3, 0.78, 0.78, 0.78, 1, 1, 1]));
    tracks.push(new THREE.QuaternionKeyframeTrack('.quaternion', [0, D], [...quat(0), ...quat(Math.PI / 4)]));
    add('bloom', D, root, tracks);
  }

  // Stack: seven discs that rise from the plinth and twist, each a little later and smaller; a cap that grows on top.
  {
    const D = 2.8, root = new THREE.Group(), tracks = [];
    for (let k = 0; k < 7; k++) {
      const r = 0.95 - k * 0.1;
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.13, segments), k % 2 ? mats.rest : mats.tone);
      disc.name = `disc${k}`; disc.position.y = 0.065;
      root.add(disc);
      const from = D * 0.06 * k, to = from + D * 0.5;
      tracks.push(new THREE.VectorKeyframeTrack(`disc${k}.position`, ...hold(D, from, to, [0, 0.065, 0], [0, 0.065 + k * 0.2, 0])));
      tracks.push(new THREE.QuaternionKeyframeTrack(`disc${k}.quaternion`, ...hold(D, from, to, quat(0), quat(k * 0.28))));
    }
    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.22, segments, segments / 2), mats.tone);
    heart.name = 'heart';
    root.add(heart);
    tracks.push(new THREE.VectorKeyframeTrack('heart.position', [0, D], [0, 0.3, 0, 0, 1.55, 0]));
    tracks.push(new THREE.VectorKeyframeTrack('heart.scale', [0, D * 0.3, D], [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 1, 1, 1]));
    add('stack', D, root, tracks);
  }

  // Coil: fourteen beads leave the centre for a helix one after another; a ring at the centre swells and turns.
  {
    const D = 3, root = new THREE.Group(), tracks = [];
    const bead = new THREE.IcosahedronGeometry(0.13, 1);
    for (let k = 0; k < 14; k++) {
      const m = new THREE.Mesh(bead, k % 3 ? mats.tone : mats.rest);
      m.name = `bead${k}`; m.position.set(0, 0.95, 0);
      root.add(m);
      const a = k * 0.9, from = D * 0.04 * k;
      tracks.push(new THREE.VectorKeyframeTrack(`bead${k}.position`, ...hold(D, from, from + D * 0.4, [0, 0.95, 0], [0.78 * Math.sin(a), 0.15 + k * 0.125, 0.78 * Math.cos(a)])));
    }
    const ring = new THREE.TorusGeometry(0.42, 0.06, segments / 4, segments);
    ring.rotateX(Math.PI / 2);
    const heart = new THREE.Mesh(ring, mats.tone);
    heart.name = 'heart'; heart.position.y = 0.95;
    root.add(heart);
    tracks.push(new THREE.VectorKeyframeTrack('heart.scale', [0, D * 0.3, D], [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 1, 1, 1]));
    tracks.push(new THREE.QuaternionKeyframeTrack('heart.quaternion', [0, D], [...quat(0, 0), ...quat(Math.PI, 0.35)]));
    add('coil', D, root, tracks);
  }
  return forms;
}

// One mixer per form, never played on a clock: the timeline sets its time. LoopOnce + clampWhenFinished holds the last
// pose at the end; the action is unpaused before every set, or a clamp at the end would freeze it on the way back.
function rig(form) {
  form.mixer = new THREE.AnimationMixer(form.root);
  form.action = form.mixer.clipAction(form.clip);
  form.action.setLoop(THREE.LoopOnce, 1);
  form.action.clampWhenFinished = true;
  form.action.play();
  form.grow = { t: 0 };
  form.tone = { c: 0 };
  form.mixer.setTime(0);
}
function setClip(form, time) {
  form.action.paused = false;
  form.mixer.setTime(time);
}

// ── Scene (the clips and the scene graph exist without WebGL too: the timeline and the beats still run) ──
const css = getComputedStyle(html);
const ground = new THREE.Color(css.getPropertyValue('--ground').trim() || '#1a1c1c');
const ink = new THREE.Color(css.getPropertyValue('--ink').trim() || '#f4f2ee');
const accent = new THREE.Color(css.getPropertyValue('--accent').trim() || '#ffc800');
const restTone = ground.clone().lerp(ink, 0.55);

const S = { gl: false, tier: 'pending', renders: 0, cutSlot: -1, slot: 0 };
const FORCE_NO_GL = new URLSearchParams(location.search).get('gl') === '0';
const webgl2 = !FORCE_NO_GL && (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
const profile = webgl2 ? await detectQualityTier({ sampleMs: 300 }) : null;
S.tier = profile?.tier ?? 'none';
const segments = S.tier === 'high' ? 48 : S.tier === 'mid' ? 32 : 20;

const flat = { flatShading: true, roughness: 0.42, metalness: 0.08 };
const mats = {
  tone: new THREE.MeshStandardMaterial({ color: restTone.clone(), ...flat }),
  rest: new THREE.MeshStandardMaterial({ color: restTone.clone().lerp(ground, 0.25), ...flat }),
  line: new THREE.MeshBasicMaterial({ color: ground.clone().lerp(ink, 0.3) }),
};
const forms = buildForms(segments, mats);
// Each form tints its own copy of the tone material.
for (const f of forms) {
  f.mat = mats.tone.clone();
  f.root.traverse((o) => { if (o.material === mats.tone) o.material = f.mat; });
  rig(f);
}
const rail = new THREE.Group();
forms.forEach((f, i) => { f.root.position.x = i * GAP; rail.add(f.root); });
const view = { x: 0 };

let dirty = true;
let renderFrame = null;
function apply() {
  for (const f of forms) {
    setClip(f, f.grow.t * f.clip.duration);
    f.mat.color.lerpColors(restTone, accent, f.tone.c);
  }
  rail.position.x = view.x;
  forms.forEach((f, i) => { f.root.visible = Math.abs(i * GAP + view.x) < GAP * 0.9; });
  syncBeats();
  dirty = true; // the only invalidation besides a resize
}

// The DOM mirror: the active form's link carries aria-current, its line of copy is shown; the readout is decoration.
function syncBeats() {
  const slot = slotAt(tl.time());
  if (slot !== S.slot || !links[slot].hasAttribute('aria-current')) {
    S.slot = slot;
    links.forEach((a, i) => {
      if (i === slot) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
      a.closest('.beat').toggleAttribute('data-active', i === slot);
    });
  }
  const f = forms[slot];
  clipReadout.textContent = `${f.name} · clip ${f.mixer.time.toFixed(2)} / ${f.clip.duration.toFixed(2)} s`;
}

const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' }, onUpdate: apply });
forms.forEach((f, i) => {
  const s = i * SLOT;
  if (i > 0) tl.fromTo(view, { x: -(i - 1) * GAP }, { x: -i * GAP, duration: HANDOFF.dur, ease: HANDOFF.ease, immediateRender: false }, s + HANDOFF.at);
  tl.fromTo(f.grow, { t: 0 }, { t: 1, duration: GROW.dur, ease: GROW.ease, immediateRender: false }, s + GROW.at);
  tl.fromTo(f.tone, { c: 0 }, { c: 1, duration: TONE.dur, ease: TONE.ease, immediateRender: false }, s + TONE.at);
});
tl.set({}, {}, UNITS); // pad to nine units: the last form holds, settled, to the end of the track

// ── Scroll → timeline ────────────────────────────────────────────────────────────────────────────────────
// Full: the trigger scrubs the timeline. Reduced and static: no scrub; the slot the scroll is in is cut to its settled pose.
let st;
function cut(progress) {
  const slot = slotAt(progress * UNITS);
  if (slot === S.cutSlot) return;
  S.cutSlot = slot;
  tl.seek(slot * SLOT + SETTLE, false);
}
if (tier === 'full') st = scrubbed();
else st = ScrollTrigger.create({ trigger: track, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true, onUpdate: (self) => cut(self.progress), onRefresh: (self) => cut(self.progress) });
function scrubbed() {
  return ScrollTrigger.create({ trigger: track, start: 'top top', end: 'bottom bottom', scrub: SCRUB, animation: tl, invalidateOnRefresh: true });
}
if (tier !== 'full') cut(st.progress);
apply();
addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

const yAt = (p) => st.start + clamp(p, 0, 1) * (st.end - st.start);
function seek(p, smooth = false) {
  if (smooth && tier === 'full') lenis.scrollTo(yAt(p), { duration: 1.2 });
  else { lenis.scrollTo(yAt(p), { immediate: true, force: true }); ScrollTrigger.update(); }
  return true;
}
// The links jump to each form's settled pose; without JS they are plain anchors to markers at the same scroll positions.
links.forEach((a, i) => a.addEventListener('click', (e) => { e.preventDefault(); seek((i * SLOT + SETTLE) / UNITS, true); }));

// ── Renderer: drawn on demand ────────────────────────────────────────────────────────────────────────────
function startGL() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: S.tier !== 'low', alpha: false, powerPreference: 'high-performance' }); } catch { return false; }
  const scene = new THREE.Scene();
  scene.background = ground;
  scene.add(rail, new THREE.HemisphereLight(0xffffff, 0x2a2a2a, 1.25));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 5, 4);
  const rim = new THREE.DirectionalLight(0xffffff, 1.1); rim.position.set(-4, 2, -3);
  scene.add(key, rim);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);

  // Desktop: the form sits right of centre, beside the beats, as far right as its widest pose (the open bloom,
  // radius about 1.5 on screen) allows. Portrait: centred, above them.
  const resize = () => {
    const w = innerWidth, h = innerHeight, portrait = w < h;
    applyRendererBudget(renderer, profile, w, h);
    camera.aspect = w / h;
    camera.fov = portrait ? 42 : 30;
    const z = portrait ? 8.4 : 7;
    const halfW = z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
    const dx = portrait ? 0 : -clamp(halfW - 1.75, 0, 1.5);
    camera.position.set(dx, portrait ? 1.5 : 1.75, z);
    camera.lookAt(dx, portrait ? 0.45 : 0.95, 0);
    camera.updateProjectionMatrix();
    dirty = true;
  };
  resize();
  addEventListener('resize', resize);

  renderFrame = () => { renderer.render(scene, camera); S.renders++; dirty = false; };
  gsap.ticker.add(() => { if (dirty && renderFrame) renderFrame(); });

  // Test hook: a pixel at the active form's heart and one in the corner, read right after a fresh render in the same task.
  window.__clips.sample = () => {
    renderFrame();
    const f = forms[slotAt(tl.time())];
    const v = f.root.getObjectByName('heart').getWorldPosition(new THREE.Vector3()).project(camera);
    const c = renderer.getContext(), w = c.drawingBufferWidth, h = c.drawingBufferHeight;
    const at = (x, y) => { const px = new Uint8Array(4); c.readPixels(clamp(x, 0, w - 1), clamp(y, 0, h - 1), 1, 1, c.RGBA, c.UNSIGNED_BYTE, px); return Array.from(px); };
    return { heart: at(Math.round((v.x * 0.5 + 0.5) * w), Math.round((v.y * 0.5 + 0.5) * h)), corner: at(2, h - 3) };
  };

  addEventListener('pagehide', () => {
    renderFrame = null;
    for (const f of forms) { f.mixer.stopAllAction(); f.mixer.uncacheRoot(f.root); }
    scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
    renderer.dispose();
  }, { once: true });
  html.classList.add('gl-active');
  glReadout.textContent = `webgl2 · ${S.tier}`;
  S.gl = true;
  return true;
}

window.__clips = { seek, UNITS, SLOT, SETTLE, GROW, HANDOFF, TONE, GAP, lag: SCRUB, sample: () => null };
if (!webgl2 || !startGL()) {
  html.classList.add('no-gl');
  glReadout.textContent = FORCE_NO_GL ? 'css still (?gl=0)' : 'css still (no webgl2)';
}

const r3 = (n) => Math.round(n * 1000) / 1000;
awards.addState(() => {
  const heart = (f) => f.root.getObjectByName('heart');
  const track0 = (f) => f.clip.tracks.find((t) => t.name === 'heart.scale');
  return {
    motion: tier,
    gl: S.gl,
    tier: S.tier,
    lag: SCRUB,
    progress: r3(clamp((scrollY - st.start) / Math.max(1, st.end - st.start), 0, 1)),
    tlTime: r3(tl.time()),
    slot: S.slot,
    cutSlot: S.cutSlot,
    railX: r3(rail.position.x),
    durations: forms.map((f) => f.clip.duration),
    mixerTime: forms.map((f) => r3(f.mixer.time)),
    heartScale: forms.map((f) => r3(heart(f).scale.x)),
    heartTrack: forms.map((f) => ({ times: Array.from(track0(f).times), x: Array.from(track0(f).values).filter((_, i) => i % 3 === 0) })),
    visible: forms.map((f) => f.root.visible),
    // One petal's pivot as the scene holds it, and the last keyframe of its track.
    petal0: forms[0].root.getObjectByName('petal0').quaternion.toArray().map(r3),
    petal0End: Array.from(forms[0].clip.tracks.find((t) => t.name === 'petal0.quaternion').values.slice(-4)).map(r3),
    current: links.findIndex((a) => a.getAttribute('aria-current') === 'step'),
    renders: S.renders,
  };
});
awards.ready();
