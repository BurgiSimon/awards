// The wind tunnel: smoke streaklines in a real (coarse) airflow that treats the section's layout as the obstacle.
// Full tier: three.js hairlines, live air, wake, pointer probe. Otherwise: one settled frame in canvas 2D.
// The physics runs in a worker (worker.js); this side measures the layout, feeds it airspeed and draws its frames.
import gsap from 'gsap';
import { rasterise, cssColor } from './obstacles.js';
import { createCanvas2D } from './canvas2d.js';
import { damp, clamp } from '../lib/raf.js';

const ARRIVAL = 1.2; // s, the hero's one hero-scale moment
const IDLE = { hero: 150, close: 110 }; // px/s: the tunnel still blows when nothing scrolls
const EPS = 3; // 1/s, vorticity confinement at full turbulence: how hard the wake rolls up

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
  const idle = IDLE[mode] ?? IDLE.hero;

  const probeEnabled = animated && matchMedia('(pointer: fine)').matches;
  let pos = null, sep = null, width = 0, height = 0;
  let air = 0, born = animated && mode === 'hero' ? 0 : ARRIVAL;
  let on = true, visible = true;
  const probe = { x: 0, y: 0, r: 0, tx: 0, ty: 0, vx: 0, vy: 0, inside: false };

  const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  // gen drops replies from before the last layout; busy keeps one step in flight; owed is sim time not yet sent.
  let gen = 0, busy = false, owed = 0, spare = null, arrived = null;
  worker.onmessage = ({ data }) => {
    if (data.gen !== gen) return;
    busy = false;
    if (!pos || pos.length !== data.pos.length) {
      pos = new Float32Array(data.pos.length);
      sep = new Float32Array(data.sep.length);
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

  function layout() {
    const rect = section.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (!width || !height) return Promise.resolve();
    // The smoke collides with a fine raster of the layout (≈ 4 px); the air runs on ≈ 10k cells at any aspect.
    const fine = Math.max(3, Math.round(width / 360));
    const airCell = Math.sqrt((width * height) / (quality.tier === 'high' ? 12000 : 9000));
    const scale = Math.max(1, Math.round(airCell / fine));
    const r = rasterise(section, fine);
    let gap = quality.tier === 'high' ? 9 : 11;
    if (width < 768) gap = 9;
    if (mode === 'close') gap *= 1.25;
    renderer.colors(cssColor(section, '--ink'), cssColor(section, '--accent'));
    gen++;
    busy = true;
    pos = null;
    spare = null;
    const config = { ...r, scale, width, height, gap, spacing: 6, life: (width / idle) * 1.4 };
    worker.postMessage({ type: 'init', gen, idle, config }, [r.mask.buffer, r.veil.buffer]);
    return new Promise((resolve) => { arrived = resolve; });
  }

  function draw() {
    const k = Math.min(1, born / ARRIVAL);
    renderer.draw({ reveal: (1 - Math.pow(2, -10 * k)) * (width + 16) - 8 });
  }

  // One clock: the page's GSAP ticker already drives Lenis and ScrollTrigger.
  const tick = (_time, deltaMs) => {
    const dt = Math.min(0.1, deltaMs / 1000);
    air = damp(air, Math.abs(getVelocity() || 0), 6, dt);
    if (!animated || !on || !visible || document.hidden || !pos) return;
    born += dt;
    owed += dt;
    if (born < ARRIVAL + dt) draw(); // the reveal advances every frame, new smoke or not
    if (busy) return;
    // Airspeed is the Reynolds number: slow air stays laminar (viscous), fast scrolling separates it into a wake.
    const turb = mode === 'close' ? 0 : clamp((air - 150) / 1800, 0, 1);
    const U = idle + (mode === 'close' ? Math.min(120, air * 0.08) : Math.min(650, air * 0.3));
    if (probeEnabled) {
      const x = probe.x, y = probe.y;
      probe.x = damp(probe.x, probe.tx, 14, dt);
      probe.y = damp(probe.y, probe.ty, 14, dt);
      probe.vx = clamp((probe.x - x) / dt, -1500, 1500);
      probe.vy = clamp((probe.y - y) / dt, -1500, 1500);
      probe.r = damp(probe.r, probe.inside ? Math.min(40, width * 0.028) : 0, 8, dt);
    }
    const params = {
      U, eps: turb * EPS, visc: 0.12 + 0.33 * (1 - turb), turb,
      probe: probe.r > 2 ? { x: probe.x, y: probe.y, r: probe.r, vx: probe.vx, vy: probe.vy } : null,
    };
    const lend = spare ? [spare.pos.buffer, spare.sep.buffer] : [];
    worker.postMessage({ type: 'step', gen, dt: Math.min(owed, 0.1), params, pos: spare?.pos, sep: spare?.sep }, lend);
    busy = true;
    owed = 0;
    spare = null;
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
      worker.terminate();
      renderer.dispose();
      canvas.remove();
    },
  };
}
