import * as THREE from 'three';
import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier } from '../_shared/quality-tiers.js';
import { ticker, damp } from '../_shared/raf.js';

syncMotionTierAttribute();
const html = document.documentElement;
const readout = document.querySelector('[data-gl-readout]');
const buttons = [...document.querySelectorAll('[data-item]')];
const tier = motionTier();
// One pixel budget shared by every item canvas (device pixels), not one per canvas.
const PIXEL_BUDGET = 2_000_000;
const state = { gl: false, quality: 'pending', dpr: 0, contexts: 0, contexts2d: 0, lost: null, disposed: false };

// Count WebGL contexts the recipe opens: the claim is "exactly one", so measure it. Installed after the quality probe,
// whose throwaway canvas is not part of the technique.
function countContexts() {
  const original = HTMLCanvasElement.prototype.getContext;
  const seen = new WeakSet();
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const ctx = original.call(this, type, ...rest);
    if (ctx && !seen.has(this)) {
      seen.add(this);
      if (/webgl/.test(type)) state.contexts++;
      else if (type === '2d') state.contexts2d++;
    }
    return ctx;
  };
}

// Generated geometry only: no model files.
const GEOMETRY = {
  knot: () => new THREE.TorusKnotGeometry(0.62, 0.2, 160, 24),
  ring: () => new THREE.TorusGeometry(0.8, 0.28, 32, 96),
  facet: () => new THREE.IcosahedronGeometry(1, 0),
  spindle: () => new THREE.LatheGeometry(Array.from({ length: 24 }, (_, i) => new THREE.Vector2(Math.sin((i / 23) * Math.PI) * 0.7 + 0.04, (i / 23) * 2.2 - 1.1)), 64),
  drum: () => new THREE.CylinderGeometry(0.8, 0.8, 0.9, 64, 1),
  prism: () => new THREE.CylinderGeometry(0.85, 0.85, 1.4, 3, 1),
};

async function start() {
  const profile = await detectQualityTier({ sampleMs: 300 });
  state.quality = profile.tier;
  countContexts();
  let renderer;
  try {
    // No canvas passed: three creates a detached one. It is never in the DOM; only the item canvases are.
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch { return false; }
  renderer.setPixelRatio(1); // sizes below are already device pixels
  renderer.setClearColor(0x000000, 0);
  const gl = renderer.getContext();

  const css = (name) => getComputedStyle(html).getPropertyValue(name).trim();
  const accent = new THREE.Color(css('--accent') || '#0016cb');
  const ink = new THREE.Color(css('--ink') || '#1a1c1c');

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(2, 3, 4);
  scene.add(key);
  const camera = new THREE.PerspectiveCamera(30, 4 / 3, 0.1, 50);
  camera.position.set(0, 0, 6);

  const items = buttons.map((button, i) => {
    const canvas = button.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const color = accent.clone().offsetHSL(i * 0.035, -0.1 * (i % 2), 0.06 * (i % 3));
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.1 });
    const mesh = new THREE.Mesh(GEOMETRY[button.dataset.item](), material);
    mesh.rotation.x = 0.35;
    mesh.visible = false;
    scene.add(mesh);
    return { button, canvas, ctx, mesh, material, color, angle: 0, target: 0, near: false, dirty: true, renders: 0, w: 0, h: 0 };
  });

  // Size every canvas under one budget, and the shared drawing buffer to the largest of them.
  function resize() {
    const boxes = items.map((it) => it.canvas.getBoundingClientRect());
    const area = boxes.reduce((s, r) => s + r.width * r.height, 0);
    state.dpr = Math.min(profile.dpr, Math.sqrt(PIXEL_BUDGET / Math.max(1, area)));
    let maxW = 1, maxH = 1;
    items.forEach((it, i) => {
      it.w = Math.max(1, Math.floor(boxes[i].width * state.dpr));
      it.h = Math.max(1, Math.floor(boxes[i].height * state.dpr));
      if (it.canvas.width !== it.w || it.canvas.height !== it.h) { it.canvas.width = it.w; it.canvas.height = it.h; }
      maxW = Math.max(maxW, it.w); maxH = Math.max(maxH, it.h);
      it.dirty = true;
    });
    renderer.setSize(maxW, maxH, false);
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(document.querySelector('.items'));

  // Near = within half a viewport of the screen. Off-screen items keep their last frame and cost nothing.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) { const it = items.find((x) => x.canvas === e.target); it.near = e.isIntersecting; }
  }, { rootMargin: '50% 0px' });
  items.forEach((it) => io.observe(it.canvas));

  function draw(it) {
    const H = renderer.domElement.height;
    camera.aspect = it.w / it.h;
    camera.updateProjectionMatrix();
    for (const o of items) o.mesh.visible = o === it;
    it.mesh.rotation.y = it.angle;
    // GL viewports start bottom left; drawImage reads from the top left. Put the slice at the top of the buffer.
    renderer.setViewport(0, H - it.h, it.w, it.h);
    renderer.render(scene, camera);
    // Same task as the render, so the drawing buffer is still valid without preserveDrawingBuffer.
    it.ctx.clearRect(0, 0, it.w, it.h);
    it.ctx.drawImage(renderer.domElement, 0, 0, it.w, it.h, 0, 0, it.w, it.h);
    it.renders++;
    it.dirty = false;
  }

  const unsubscribe = ticker.add((dt) => {
    for (const it of items) {
      if (it.angle !== it.target) {
        it.angle = damp(it.angle, it.target, 5, dt);
        if (Math.abs(it.target - it.angle) < 1e-3) it.angle = it.target; // settle exactly, so the item goes quiet
        it.dirty = true;
      }
      if (it.dirty && it.near) draw(it);
    }
  });

  // One revolution per hover or press in the full tier; a colour change only under reduced motion; nothing in static.
  function turn(it) {
    if (tier === 'full') it.target += Math.PI * 2;
    else if (tier === 'reduced') { it.material.color.copy(it.color).lerp(ink, it.material.color.equals(it.color) ? 0.35 : 0); it.dirty = true; }
  }
  const off = [];
  for (const it of items) {
    const onEnter = (e) => { if (e.pointerType === 'mouse') turn(it); };
    const onTurn = () => turn(it);
    it.button.addEventListener('pointerenter', onEnter);
    it.button.addEventListener('click', onTurn); // Enter and Space land here too
    off.push(() => { it.button.removeEventListener('pointerenter', onEnter); it.button.removeEventListener('click', onTurn); });
  }

  function teardown() {
    if (state.disposed) return;
    unsubscribe(); ro.disconnect(); io.disconnect(); off.forEach((f) => f());
    for (const it of items) { it.mesh.geometry.dispose(); it.material.dispose(); }
    renderer.dispose();
    renderer.forceContextLoss(); // release the context now instead of waiting for GC; the 2D canvases keep their pixels
    state.lost = gl.isContextLost();
    state.gl = false; state.disposed = true;
    readout.textContent = 'webgl released';
  }
  addEventListener('pagehide', teardown, { once: true });

  state.items = items;
  state.teardown = teardown;
  html.classList.add('gl-active');
  readout.textContent = `webgl · ${profile.tier} · one context`;
  state.gl = true;
  return true;
}

const ok = await start().catch(() => false);
if (!ok) readout.textContent = 'dom (no webgl)';

window.__oneContext = { teardown: () => (state.teardown?.(), true) };

// Centre region of each item canvas (the middle 30 %), read from its 2D context: the share of pixels with alpha > 0.
// A region, not one pixel, because a ring or a knot is hollow at its exact centre.
const centre = (it) => {
  if (!it.w) return null;
  const w = Math.max(1, Math.floor(it.w * 0.3)), h = Math.max(1, Math.floor(it.h * 0.3));
  const d = it.ctx.getImageData(Math.floor((it.w - w) / 2), Math.floor((it.h - h) / 2), w, h).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
  return Math.round((n / (w * h)) * 1000) / 1000;
};
awards.addState(() => {
  const items = state.items || [];
  return {
    motion: tier,
    gl: state.gl,
    quality: state.quality,
    contexts: state.contexts,
    contexts2d: state.contexts2d,
    budget: PIXEL_BUDGET,
    dpr: Math.round(state.dpr * 1000) / 1000,
    backingPixels: items.reduce((s, it) => s + it.canvas.width * it.canvas.height, 0),
    canvasesInDom: document.querySelectorAll('canvas').length,
    contextLost: state.lost,
    disposed: state.disposed,
    items: items.map((it) => ({ name: it.button.dataset.item, near: it.near, renders: it.renders, angle: Math.round(it.angle * 1e4) / 1e4, target: Math.round(it.target * 1e4) / 1e4, centre: centre(it) })),
  };
});
awards.ready();
