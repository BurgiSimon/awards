// The wind tunnel: smoke streaklines in a real (coarse) airflow that treats the section's layout as the obstacle.
// Full tier: three.js hairlines (one shared context), live air, wake, a pointer or finger probe.
// Otherwise: one settled frame in canvas 2D. The physics runs in a worker (worker.js); this side measures the
// layout, feeds it airspeed and draws its frames.
import gsap from 'gsap';
import { rasterise, cssColor } from './obstacles.js';
import { createCanvas2D } from './canvas2d.js';
import { damp, clamp } from '../lib/raf.js';

const ARRIVAL = 1.2; // s, the hero's one hero-scale moment
const IDLE = { hero: 150, close: 110 }; // px/s: the tunnel still blows when nothing scrolls
const EPS = 3; // 1/s, vorticity confinement at full turbulence: how hard the wake rolls up
// Scroll speed (px/s) where the flow starts to separate, and the span over which it becomes fully turbulent.
const SEPARATES = 200, TURBULENT = 1400;
// 1/s, the straightener at rest: how fast laminar flow comes back once the scrolling stops. The close is the calm
// bookend and holds its air nearly at the settled flow, so no bubble forms behind the plates even when they stack.
const CALM = { hero: 2, close: 6 };

// Governor: the first live frames after the arrival decide whether this device can carry the flow. When the median
// frame takes longer than SLOW ms (under 25 fps), the smoke settles where it is and the page keeps that still.
const SAMPLE = 90, SLOW = 40;

export async function mountFlow(section, { mode = 'hero', quality = { tier: 'mid', dpr: 1, maxPixels: 2e6 }, live = false, getVelocity = () => 0, onSlow = null } = {}) {
  await document.fonts.ready;
  // The settled frame draws to this section's own 2D canvas; the live flow borrows the page's one GL canvas.
  let canvas = null;
  const still = () => {
    canvas = document.createElement('canvas');
    canvas.setAttribute('data-flow-canvas', '');
    canvas.setAttribute('aria-hidden', 'true');
    section.prepend(canvas);
    return createCanvas2D(canvas);
  };

  let renderer = null;
  if (live) {
    try {
      const { createGL } = await import('../webgl/flow-gl.js');
      renderer = createGL(section, quality);
    } catch {
      renderer = null; // no WebGL: fall through to the settled frame
    }
  }
  if (!renderer) renderer = still();
  let animated = renderer.kind === 'webgl';
  const idle = IDLE[mode] ?? IDLE.hero;

  // The probe is a solid the visitor moves through the air: the mouse on fine pointers, a finger on touch.
  const fine = matchMedia('(pointer: fine)').matches;
  const probeEnabled = animated;
  let pos = null, sep = null, width = 0, height = 0;
  let air = 0, U = idle, turb = 0, born = animated && mode === 'hero' ? 0 : ARRIVAL;
  let on = true, visible = true, steps = 0, slow = false;
  const frames = [];
  const probe = { x: 0, y: 0, r: 0, tx: 0, ty: 0, vx: 0, vy: 0, inside: false };

  const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  // gen drops replies from before the last layout; busy keeps one step in flight; owed is sim time not yet sent.
  let gen = 0, busy = false, owed = 0, spare = null, arrived = null, lines = 0;
  worker.onmessage = ({ data }) => {
    if (data.gen !== gen) return;
    busy = false;
    if (!pos || pos.length !== data.pos.length) {
      pos = new Float32Array(data.pos.length);
      sep = new Float32Array(data.sep.length);
      lines = data.lines;
      renderer.resize(width, height, pos, sep, data.lines, data.cap);
    }
    pos.set(data.pos);
    sep.set(data.sep);
    spare = data; // lend the buffers back with the next step
    renderer.upload();
    draw();
    arrived?.();
    arrived = null;
  };

  // A lost GL context (or a device too slow for it) drops to the settled 2D frame of the same smoke; the page
  // never goes blank.
  const toStill = () => {
    if (!animated) return;
    animated = false;
    if (renderer.kind === 'webgl') renderer.dispose();
    renderer = still();
    renderer.colors(cssColor(section, '--ink'), cssColor(section, '--accent'));
    if (pos) { renderer.resize(width, height, pos, sep, lines, pos.length / 3 / lines); renderer.draw(); }
  };
  if (renderer.kind === 'webgl') renderer.onLost = toStill;

  function layout() {
    const rect = section.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (!width || !height) return Promise.resolve();
    // The smoke collides with a fine raster of the layout (≈ 4 px); the air runs on ≈ 10k cells at any aspect.
    const cell = Math.max(3, Math.round(width / 360));
    const airCell = Math.sqrt((width * height) / (quality.tier === 'high' ? 12000 : 9000));
    const scale = Math.max(1, Math.round(airCell / cell));
    const r = rasterise(section, cell, { slot: airCell * 2.5 });
    let gap = quality.tier === 'high' ? 9 : 11;
    if (width < 768) gap = 9;
    if (mode === 'close') gap *= 1.25;
    renderer.colors(cssColor(section, '--ink'), cssColor(section, '--accent'));
    gen++;
    busy = true;
    pos = null;
    spare = null;
    // The rake sits upstream of the section: about a tenth of its width of open tunnel, unseen, before the left edge.
    const upstream = Math.min(200, Math.max(64, width * 0.12));
    const config = { ...r, scale, width, height, gap, spacing: 6, life: (width / idle) * 1.4, upstream };
    worker.postMessage({ type: 'init', gen, idle, config }, [r.mask.buffer, r.veil.buffer]);
    return new Promise((resolve) => { arrived = resolve; });
  }

  function draw() {
    const k = Math.min(1, born / ARRIVAL);
    renderer.draw({ reveal: (1 - Math.pow(2, -10 * k)) * (width + 16) - 8 }); // expo-out from the left edge
  }

  // One clock: the page's GSAP ticker already drives Lenis and ScrollTrigger.
  const tick = (_time, deltaMs) => {
    const dt = Math.min(0.1, deltaMs / 1000);
    air = damp(air, Math.abs(getVelocity() || 0), 6, dt);
    // One GL canvas for the page: a flow steps only while it may draw to it (see webgl/flow-gl.js).
    if (!animated || !on || !visible || document.hidden || !pos || !renderer.active()) return;
    // Airspeed is the Reynolds number: slow air stays laminar (viscous), fast scrolling separates it into a wake.
    // Separation sets in fast and dies slowly, so stopping lets the wake wash downstream and the flow settle.
    const target = mode === 'close' ? 0 : clamp((air - SEPARATES) / TURBULENT, 0, 1);
    turb = damp(turb, target, target > turb ? 10 : 0.8, dt);
    U = idle + (mode === 'close' ? Math.min(120, air * 0.08) : Math.min(650, air * 0.3));
    if (born > ARRIVAL && frames.length < SAMPLE) {
      frames.push(deltaMs);
      if (frames.length === SAMPLE && [...frames].sort((a, b) => a - b)[SAMPLE >> 1] > SLOW) {
        slow = true;
        toStill();
        onSlow?.();
        return;
      }
    }
    born += dt;
    owed += dt;
    if (born < ARRIVAL + dt) draw(); // the arrival advances every frame, new smoke or not
    if (busy) return;
    if (probeEnabled) {
      const x = probe.x, y = probe.y;
      probe.x = damp(probe.x, probe.tx, 14, dt);
      probe.y = damp(probe.y, probe.ty, 14, dt);
      probe.vx = clamp((probe.x - x) / dt, -1500, 1500);
      probe.vy = clamp((probe.y - y) / dt, -1500, 1500);
      probe.r = damp(probe.r, probe.inside ? Math.min(fine ? 40 : 48, width * 0.028) : 0, 8, dt);
    }
    const params = {
      U, eps: turb * EPS, visc: 0.12 + 0.33 * (1 - turb), turb, calm: (CALM[mode] ?? CALM.hero) * (1 - turb) ** 2,
      probe: probe.r > 2 ? { x: probe.x, y: probe.y, r: probe.r, vx: probe.vx, vy: probe.vy } : null,
    };
    const lend = spare ? [spare.pos.buffer, spare.sep.buffer] : [];
    worker.postMessage({ type: 'step', gen, dt: Math.min(owed, 0.1), params, pos: spare?.pos, sep: spare?.sep }, lend);
    busy = true;
    owed = 0;
    spare = null;
    steps++;
  };
  gsap.ticker.add(tick);

  const place = (clientX, clientY) => {
    const r = section.getBoundingClientRect();
    probe.tx = clientX - r.left;
    probe.ty = clientY - r.top;
    const inside = probe.tx >= 0 && probe.ty >= 0 && probe.tx <= r.width && probe.ty <= r.height;
    if (inside && !probe.inside && probe.r < 0.5) { probe.x = probe.tx; probe.y = probe.ty; }
    probe.inside = inside;
  };
  const onPointer = (e) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') place(e.clientX, e.clientY); };
  // Touch: a finger dragged across the section is the probe; the listeners are passive, so scrolling is untouched.
  const onTouch = (e) => { const t = e.touches[0]; if (t) place(t.clientX, t.clientY); };
  // Keyboard: a control focused inside the section is a solid in the air as well, so tabbing through the hero sheds
  // a wake behind each control in turn. Nothing needs operating; the flow only answers the layout, focus included.
  const onFocus = (e) => {
    if (!e.target.matches?.(':focus-visible')) return;
    const r = e.target.getBoundingClientRect();
    place(r.left + r.width / 2, r.top + r.height / 2);
  };
  const onLeave = () => { probe.inside = false; };
  if (probeEnabled) {
    addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    addEventListener('touchmove', onTouch, { passive: true });
    addEventListener('touchend', onLeave, { passive: true });
    addEventListener('touchcancel', onLeave, { passive: true });
    section.addEventListener('focusin', onFocus);
    section.addEventListener('focusout', onLeave);
  }

  // Sections away from the screen stop stepping. "Near" reaches half a viewport past each edge, so the one GL canvas
  // changes hands, and draws its first frame, before the section scrolls into view.
  const io = new IntersectionObserver(([entry]) => {
    const was = visible;
    visible = entry.isIntersecting;
    renderer.visible = visible;
    if (visible && !was && pos) draw();
  }, { rootMargin: '50% 0px' });
  io.observe(section);
  // The field is stale when the section resizes or anything inside it moves the obstacles (a control appearing,
  // a line re-wrapping). Children are observed too: their resizes are what move the obstacles.
  const signature = () => {
    const o = section.getBoundingClientRect();
    return [o.width, o.height, ...[...section.querySelectorAll('[data-obstacle]')].flatMap((el) => {
      const r = el.getBoundingClientRect();
      return [r.left - o.left, r.top - o.top, r.width];
    })].map(Math.round).join();
  };
  let resizeTimer = 0;
  let lastSig = '';
  const ro = new ResizeObserver(() => {
    const sig = signature();
    if (sig === lastSig) return;
    lastSig = sig;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 150); // rebuild the obstacle field, never reload
  });
  lastSig = signature();
  await layout();
  ro.observe(section);
  for (const child of section.children) ro.observe(child);

  return {
    get renderer() { return renderer.kind; },
    get animated() { return animated; },
    // Off freezes the current frame for everyone (an arrival in progress completes at once); on resumes from it.
    setAirflow(value) {
      on = !!value;
      if (!on && born < ARRIVAL) { born = ARRIVAL; if (pos) draw(); }
    },
    // The tunnel's inflow in px/s: what the smoke is actually doing. Zero with the fan off; the settled value at rest.
    airspeed: () => (animated ? (on ? U : 0) : idle),
    // Settle every flow on the page when one of them finds the device too slow.
    still() { toStill(); },
    state: () => ({
      renderer: renderer.kind,
      slow,
      frameMs: frames.length ? Math.round([...frames].sort((a, b) => a - b)[frames.length >> 1]) : null,
      lines,
      airspeed: Math.round(animated ? (on ? U : 0) : idle),
      turbulence: Number(turb.toFixed(2)),
      probe: probe.r > 2,
      steps,
      ...(renderer.info ? { gl: renderer.info() } : {}),
    }),
    // Re-read the theme's ink and accent (e.g. after a theme swap) and redraw.
    refresh() { layout(); },
    dispose() {
      gsap.ticker.remove(tick);
      clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
      removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      removeEventListener('touchmove', onTouch);
      section.removeEventListener('focusin', onFocus);
      section.removeEventListener('focusout', onLeave);
      removeEventListener('touchend', onLeave);
      removeEventListener('touchcancel', onLeave);
      worker.terminate();
      renderer.dispose();
      canvas?.remove();
    },
  };
}
