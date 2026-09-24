// The wind tunnel: streamlines that treat the section's real layout as the obstacle.
// Full tier: three.js hairlines, live airspeed, wake, pointer probe. Otherwise: one settled frame in canvas 2D.
import gsap from 'gsap';
import { buildField, trace, seedsFor } from './field.js';
import { rasterise, cssColor } from './obstacles.js';
import { createCanvas2D } from './canvas2d.js';
import { damp, clamp } from '../lib/raf.js';

const STEP = 8; // px between traced points
const ARRIVAL = 1.2; // s, the hero's one hero-scale moment
const IDLE_AIR = 40; // px/s: the streaks still drift when nothing scrolls

export async function mountFlow(section, { mode = 'hero', quality = { tier: 'mid', dpr: 1 }, tier = 'full', getVelocity = () => 0 } = {}) {
  await document.fonts.ready;
  let canvas = document.createElement('canvas');
  canvas.setAttribute('data-flow-canvas', '');
  canvas.setAttribute('aria-hidden', 'true');
  section.prepend(canvas);

  const live = tier === 'full' && quality.tier !== 'low';
  let renderer = null;
  if (live) {
    try {
      const { createGL } = await import('../webgl/flow-gl.js');
      renderer = createGL(canvas, quality);
    } catch {
      renderer = null; // no WebGL: fall through to the settled frame on a fresh canvas
    }
  }
  if (!renderer) {
    if (live) { const fresh = canvas.cloneNode(); canvas.replaceWith(fresh); canvas = fresh; } // a failed GL attempt may hold the context
    renderer = createCanvas2D(canvas);
  }
  const animated = renderer.kind === 'webgl';

  const probeEnabled = animated && matchMedia('(pointer: fine)').matches;
  let field = null, seeds = null, pos = null, sep = null, width = 0, height = 0, maxPts = 0;
  let air = 0, t = 0, phase = 0, born = animated && mode === 'hero' ? 0 : ARRIVAL;
  let on = true, visible = true, dirty = true;
  const probe = { x: 0, y: 0, r: 0, tx: 0, ty: 0, inside: false, moved: false };

  function layout() {
    const rect = section.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (!width || !height) return;
    const cell = Math.max(3, Math.round(width / 360));
    const r = rasterise(section, cell);
    field = buildField(r.mask, r.w, r.h, cell, { reach: r.reach, wakeLength: width * 0.3 });
    let count = quality.tier === 'high' ? 160 : 90;
    if (width < 768) count *= 0.55;
    if (mode === 'close') count *= 0.7;
    seeds = seedsFor(Math.round(count), height);
    maxPts = Math.ceil((width / STEP) * 1.5) + 4;
    pos = new Float32Array(seeds.length * maxPts * 3);
    sep = new Float32Array(seeds.length * maxPts);
    renderer.resize(width, height, pos, sep, seeds.length, maxPts);
    renderer.colors(cssColor(section, '--ink'), cssColor(section, '--accent'));
    dirty = true;
    render(0);
  }

  function render(dt) {
    if (!field) return;
    const turb = mode === 'close' ? 0 : clamp((air - 150) / 2200, 0, 1);
    const probing = probe.r > 0.5;
    if (dirty || turb > 0.001 || (probing && probe.moved)) {
      t += dt * (0.6 + turb * 1.4);
      trace(field, seeds, width, height, { t, turb, probe: probing ? probe : null }, STEP, maxPts, pos, sep);
      renderer.upload();
      dirty = false;
      probe.moved = false;
    }
    const k = Math.min(1, born / ARRIVAL);
    renderer.draw({ phase, pulse: animated ? 1 : 0, reveal: (1 - Math.pow(2, -10 * k)) * (width + STEP * 2) - STEP });
  }

  // One clock: the page's GSAP ticker already drives Lenis and ScrollTrigger.
  const tick = (_time, deltaMs) => {
    const dt = Math.min(0.1, deltaMs / 1000);
    air = damp(air, Math.abs(getVelocity() || 0), 6, dt);
    if (!animated || !on || !visible || document.hidden) return;
    born += dt;
    phase += dt * (IDLE_AIR + air * 0.25);
    if (probeEnabled) {
      const before = probe.x + probe.y + probe.r;
      probe.x = damp(probe.x, probe.tx, 12, dt);
      probe.y = damp(probe.y, probe.ty, 12, dt);
      probe.r = damp(probe.r, probe.inside ? Math.min(44, width * 0.03) : 0, 8, dt);
      if (Math.abs(probe.x + probe.y + probe.r - before) > 0.05) probe.moved = true;
    }
    render(dt);
  };
  gsap.ticker.add(tick);

  const onPointer = (e) => {
    const r = section.getBoundingClientRect();
    probe.tx = e.clientX - r.left;
    probe.ty = e.clientY - r.top;
    const inside = probe.tx >= 0 && probe.ty >= 0 && probe.tx <= r.width && probe.ty <= r.height;
    if (inside && !probe.inside && probe.r < 0.5) { probe.x = probe.tx; probe.y = probe.ty; }
    probe.inside = inside;
  };
  const onLeave = () => { probe.inside = false; };
  if (probeEnabled) {
    addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
  }

  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  io.observe(section);
  let resizeTimer = 0;
  let lastSize = '';
  const ro = new ResizeObserver(() => {
    const r = section.getBoundingClientRect();
    const size = `${Math.round(r.width)}x${Math.round(r.height)}`;
    if (size === lastSize) return;
    lastSize = size;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 150); // rebuild the obstacle field, never reload
  });
  layout();
  lastSize = `${Math.round(width)}x${Math.round(height)}`;
  ro.observe(section);

  return {
    renderer: renderer.kind,
    // Off freezes the current frame for everyone; on resumes from it.
    setAirflow(value) { on = !!value; },
    airspeed: () => air,
    // Re-read the theme's ink and accent (e.g. after a theme swap) and redraw.
    refresh() { layout(); },
    dispose() {
      gsap.ticker.remove(tick);
      clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
      removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      renderer.dispose();
      canvas.remove();
    },
  };
}
