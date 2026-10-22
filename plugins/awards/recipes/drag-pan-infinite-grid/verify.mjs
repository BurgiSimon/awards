// Desktop 1440 × 900: the stage spans the width inside the gutter and roughly y 200–860, so every pointer path below
// stays on it. The probe samples state() every frame until the plane has been at rest for three frames (4 s cap), then
// reads the rendered tiles back: each li's transformed box against the stage, the pitch cells they cover on a 40 px
// lattice (a hole means the wrap failed), the focused element's ring and the page's own scroll and overflow.
const AT = (x, y) => ({ type: 'move', x, y, steps: 1 });
const DOWN = { type: 'down' }, UP = { type: 'up' };
const STATIC = { type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" };
const FOCUS0 = { type: 'focus', selector: '[data-tile="0"] a' };
const key = (k) => ({ type: 'press', key: k });

// A flick: five 60 × 24 px moves about 16 ms apart, released while still moving.
const flick = [];
for (let k = 1; k <= 5; k++) flick.push(AT(1000 - 60 * k, 560 - 24 * k), { type: 'wait', ms: 16 });
flick.pop();
// A long drag: four slow strokes of 1100 px left and 280 px up, each resting before release (no throw): 4400 px in x,
// more than two sheet widths, and 1120 px in y.
const strokes = [];
for (let k = 0; k < 4; k++) strokes.push(AT(1250, 700), DOWN, { type: 'move', x: 150, y: 420, steps: 14 }, { type: 'wait', ms: 120 }, UP);

export const states = [
  { name: 'top', settle: 600 },
  { name: 'drag', settle: 300, actions: [AT(900, 600), DOWN, { type: 'move', x: 660, y: 480, steps: 12 }, { type: 'wait', ms: 150 }, UP] },
  { name: 'fling', settle: 300, actions: [AT(1000, 560), DOWN, ...flick, UP] },
  { name: 'wrap', settle: 300, actions: strokes },
  { name: 'keys', settle: 300, actions: [FOCUS0, { type: 'wait', ms: 100 }, key('ArrowRight'), { type: 'wait', ms: 700 }] },
  { name: 'home', settle: 300, actions: [FOCUS0, key('ArrowRight'), key('ArrowDown'), key('ArrowDown'), key('ArrowLeft'), key('ArrowLeft'), key('ArrowLeft'), { type: 'wait', ms: 300 }, key('Home'), { type: 'wait', ms: 800 }] },
  { name: 'end', settle: 300, actions: [FOCUS0, key('End'), { type: 'wait', ms: 800 }] },
  { name: 'tab', settle: 300, actions: [FOCUS0, key('Tab'), key('Tab'), key('Tab'), { type: 'wait', ms: 800 }] },
  { name: 'wheel', settle: 300, actions: [AT(720, 520), { type: 'wheel', dx: 0, dy: 300 }, { type: 'wheel', dx: 200, dy: 0 }, { type: 'wait', ms: 700 }] },
  { name: 'rm', reducedMotion: true, settle: 300, actions: [AT(1000, 560), DOWN, ...flick, UP] },
  { name: 'rm-keys', reducedMotion: true, settle: 300, actions: [FOCUS0, key('ArrowRight')] },
  { name: 'static', settle: 300, actions: [STATIC, { type: 'wait', ms: 200 }, AT(700, 500), DOWN, { type: 'move', x: 400, y: 400, steps: 6 }, UP] },
  { name: 'mobile', viewport: 'mobile', settle: 500, actions: [AT(300, 560), DOWN, { type: 'move', x: 120, y: 470, steps: 8 }, { type: 'wait', ms: 120 }, UP] },
];

export async function probe() {
  const s = () => window.__awards.state();
  const samples = [];
  await new Promise((done) => {
    let still = 0;
    const t0 = performance.now();
    const f = () => {
      const st = s();
      samples.push({ x: st.offset.x, y: st.offset.y, moving: st.moving, speed: Math.round(Math.hypot(st.velocity.x, st.velocity.y)) });
      still = st.moving ? 0 : still + 1;
      if (still < 3 && performance.now() - t0 < 4000) requestAnimationFrame(f); else done();
    };
    requestAnimationFrame(f);
  });
  const st = s();
  const stage = document.querySelector('[data-stage]'), sr = stage.getBoundingClientRect();
  const items = [...stage.querySelectorAll('[data-tile]')];
  const ox = sr.left + stage.clientLeft, oy = sr.top + stage.clientTop;
  const rects = items.map((li) => { const r = li.getBoundingClientRect(); return { x: Math.round((r.left - ox) * 10) / 10, y: Math.round((r.top - oy) * 10) / 10, w: Math.round(r.width), h: Math.round(r.height) }; });
  // Rendered against logical: each li's box against place() for the current offset.
  const drift = st.live ? Math.max(...items.map((_, i) => { const [x, y] = window.__plane.place(i); return Math.max(Math.abs(rects[i].x - x), Math.abs(rects[i].y - y)); })) : null;
  let holes = 0, points = 0;
  if (st.live) {
    for (let y = 2; y < st.stage.h - 2; y += 40) for (let x = 2; x < st.stage.w - 2; x += 40) {
      points++;
      if (!rects.some((r) => x >= r.x && x < r.x + st.pitch.x && y >= r.y && y < r.y + st.pitch.y)) holes++;
    }
  }
  const a = document.activeElement, ar = a?.getBoundingClientRect(), acs = a ? getComputedStyle(a) : null;
  return {
    samples,
    first: samples[0], last: samples.at(-1),
    rects, drift, holes, points,
    stageRect: { x: Math.round(sr.left), y: Math.round(sr.top), w: Math.round(sr.width), h: Math.round(sr.height) },
    active: a && a !== document.body ? { tile: a.closest('[data-tile]')?.dataset.tile ?? null, x: Math.round(ar.left - ox), y: Math.round(ar.top - oy), w: Math.round(ar.width), h: Math.round(ar.height), outline: `${acs.outlineStyle} ${acs.outlineWidth} ${acs.outlineColor}`, focusVisible: a.matches(':focus-visible') } : null,
    accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    scrollY: Math.round(scrollY),
    overflowX: document.documentElement.scrollWidth - innerWidth,
    touchAction: { stage: getComputedStyle(stage).touchAction, body: getComputedStyle(document.body).touchAction, html: getComputedStyle(document.documentElement).touchAction },
    list: { display: getComputedStyle(stage.querySelector('[data-tiles]')).display, transforms: items.filter((li) => getComputedStyle(li).transform !== 'none').length, positions: [...new Set(items.map((li) => getComputedStyle(li).position))], rows: new Set(items.map((li) => Math.round(li.getBoundingClientRect().top))).size },
    lis: items.length,
    coast: st.coast,
  };
}

export function assert(r) {
  const out = [];
  const S = (k) => r[k]?.state || {};
  const P = (k) => r[k]?.probe || {};
  const near = (a, b, e = 0.6) => Math.abs((a ?? NaN) - b) <= e;
  // Every tile inside the wrap window on both axes: [−pitch, span − pitch).
  const inPool = (st) => !!st.bounds && st.bounds.minX >= -st.pitch.x - 0.1 && st.bounds.maxX < st.span.x - st.pitch.x + 0.1 && st.bounds.minY >= -st.pitch.y - 0.1 && st.bounds.maxY < st.span.y - st.pitch.y + 0.1;

  // At rest: the pool is the 24 links, placed with no hole, the first project centred.
  const t = S('top'), tp = P('top'), t0 = tp.rects?.[0];
  out.push({ ok: t.live === true && t.motion === 'full' && t.pool === 24 && t.links === 24 && tp.lis === 24 && t.moving === false, message: `plane live: a pool of ${t.pool} tiles for ${t.links} links, at rest` });
  out.push({ ok: !!t0 && near(t0.x + t0.w / 2, t.stage.w / 2, 1) && near(t0.y + t0.h / 2, t.stage.h / 2, 1) && /Salt Ledger/.test(t.readout), message: `offset 0 centres the first project (${t0?.x}, ${t0?.y} in a ${t.stage?.w} × ${t.stage?.h} stage; "${t.readout}")` });
  out.push({ ok: tp.points > 100 && tp.holes === 0 && tp.drift !== null && tp.drift < 1 && inPool(t), message: `no hole in the plane (${tp.holes} of ${tp.points} lattice points uncovered), rendered boxes match the wrap (${tp.drift} px)` });

  // A slow drag is direct manipulation: the offset is the pointer's travel, and a rested release throws nothing.
  const d = S('drag'), dp = P('drag');
  out.push({ ok: d.drags === 1 && near(d.offset?.x, -240) && near(d.offset?.y, -120) && d.release?.speed === 0 && d.moving === false && dp.samples?.every((x) => x.x === d.offset.x && x.y === d.offset.y), message: `drag moves the plane by the pointer's travel (${d.offset?.x}, ${d.offset?.y}), rested release stays put` });
  out.push({ ok: dp.holes === 0 && dp.drift < 1, message: `after the drag: ${dp.holes} holes, drift ${dp.drift} px` });

  // A flick keeps going after release, slows exponentially and stops; the coast equals v0 / DECAY whatever the frames.
  const f = S('fling'), fp = P('fling'), fs = fp.samples || [];
  const speeds = fs.map((x) => x.speed);
  out.push({ ok: f.mode === 'inertia' && f.release?.speed > 1000 && fs.length > 5 && (fs.at(-1).x !== f.release.x || fs.at(-1).y !== f.release.y) && fp.last?.moving === false && speeds.every((v, i) => i === 0 || v <= speeds[i - 1] + 1), message: `release at ${f.release?.speed} px/s keeps moving (${f.release?.x}, ${f.release?.y} → ${fp.last?.x}, ${fp.last?.y}), slowing every frame, then stops` });
  const travel = Math.hypot((fp.last?.x ?? 0) - (f.release?.x ?? 0), (fp.last?.y ?? 0) - (f.release?.y ?? 0));
  const expected = (f.release?.speed ?? 0) / 4;
  out.push({ ok: expected > 200 && travel <= expected + 0.5 && expected - travel <= 8 / 4 + 1 && fp.coast?.expected > 0 && Math.abs(fp.coast.travel - travel) < 1, message: `coast ${travel.toFixed(1)} px for an expected v0 / DECAY = ${expected.toFixed(1)} px, frame-rate independent (page's own record ${fp.coast?.travel} / ${fp.coast?.expected})` });
  out.push({ ok: fp.holes === 0 && fp.drift < 1 && inPool(f), message: `after the coast: ${fp.holes} holes, every tile in the pool` });

  // A long drag wraps: the offset passes two sheet widths and every tile is still inside the pool, nothing cloned.
  const w = S('wrap'), wp = P('wrap');
  out.push({ ok: w.drags === 4 && Math.abs(w.offset?.x) > 2 * w.span?.x && Math.abs(w.offset?.y) > w.span?.y * 0.5 && w.pool === 24 && wp.lis === 24 && w.links === 24 && inPool(w), message: `long drag to (${w.offset?.x}, ${w.offset?.y}) over a ${w.span?.x} × ${w.span?.y} sheet: bounds x ${w.bounds?.minX}…${w.bounds?.maxX}, y ${w.bounds?.minY}…${w.bounds?.maxY}, still 24 tiles` });
  out.push({ ok: wp.holes === 0 && wp.drift < 1, message: `after the wrap: ${wp.holes} holes, drift ${wp.drift} px` });

  // ArrowRight: focus on the neighbour, the plane exactly one pitch left, the neighbour where the first tile was.
  const k = S('keys'), kp = P('keys'), k1 = kp.rects?.[1];
  out.push({ ok: k.focused === 1 && near(k.offset?.x, -k.pitch?.x, 0.11) && k.glides === 1 && k.moving === false && !!t0 && !!k1 && near(k1.x, t0.x, 1) && near(k1.y, t0.y, 1), message: `ArrowRight moves exactly one tile: offset x ${k.offset?.x} for a pitch of ${k.pitch?.x}; tile 2 now at (${k1?.x}, ${k1?.y}), where tile 1 was (${t0?.x}, ${t0?.y})` });
  out.push({ ok: kp.active?.tile === '1' && kp.active?.focusVisible === true && /^solid 2px/.test(kp.active?.outline || '') && kp.active.x >= 0 && kp.active.x + kp.active.w <= k.stage.w, message: `focused tile shows a ring (${kp.active?.outline}) inside the stage` });

  // Home: back to an origin-equivalent offset, the first project centred and focused.
  const h = S('home'), hp = P('home'), h0 = hp.rects?.[0];
  out.push({ ok: h.focused === 0 && h.steps === 7 && (near(h.wrapped?.x, 0, 0.2) || near(h.wrapped?.x, h.span?.x, 0.2)) && (near(h.wrapped?.y, 0, 0.2) || near(h.wrapped?.y, h.span?.y, 0.2)) && !!h0 && near(h0.x, t0?.x, 1) && near(h0.y, t0?.y, 1), message: `Home recentres: offset (${h.offset?.x}, ${h.offset?.y}) ≡ origin, tile 1 back at (${h0?.x}, ${h0?.y})` });

  const en = S('end'), enp = P('end'), e23 = enp.rects?.[23];
  out.push({ ok: en.focused === 23 && !!e23 && !!t0 && near(e23.x, t0.x, 1) && near(e23.y, t0.y, 1) && /Dry Dock/.test(en.readout), message: `End centres the last project (${e23?.x}, ${e23?.y}; "${en.readout}")` });

  // Tab: focus reaches a tile that began off the stage; the plane glides it into the window, the page does not scroll.
  const tb = S('tab'), tbp = P('tab'), a = tbp.active;
  out.push({ ok: tb.focused === 3 && tb.glides >= 1 && !!a && a.x >= 31 && a.y >= 31 && a.x + a.w <= tb.stage.w - 31 && a.y + a.h <= tb.stage.h - 31 && tbp.scrollY === 0, message: `Tab to tile 4 glides it into the stage (${a?.x}, ${a?.y}, ${a?.w} × ${a?.h}); page scrollY ${tbp.scrollY}` });

  // Wheel pans both axes, eased in, and leaves the page where it is.
  const wh = S('wheel'), whp = P('wheel');
  out.push({ ok: wh.wheelEvents === 2 && near(wh.offset?.x, -200) && near(wh.offset?.y, -300) && whp.scrollY === 0 && whp.holes === 0, message: `wheel pans to (${wh.offset?.x}, ${wh.offset?.y}); page scrollY ${whp.scrollY}` });

  // Reduced motion: drag still works, the release does not coast; keys move instantly.
  const m = S('rm'), mp = P('rm');
  out.push({ ok: m.motion === 'reduced' && m.drags === 1 && m.release?.speed > 1000 && m.moving === false && mp.samples?.every((x) => x.x === m.offset.x && x.y === m.offset.y) && near(m.offset?.x, -300) && near(m.offset?.y, -120), message: `reduced motion: drag moves the plane (${m.offset?.x}, ${m.offset?.y}), a ${m.release?.speed} px/s release does not coast` });
  const mk = S('rm-keys'), mkp = P('rm-keys');
  out.push({ ok: mk.focused === 1 && mk.glides === 0 && near(mk.offset?.x, -mk.pitch?.x, 0.11) && mkp.first?.x === mk.offset?.x && mkp.first?.moving === false, message: `reduced motion: ArrowRight lands at once (offset x ${mk.offset?.x}, no glide)` });

  // Static: the plain wrapped grid of the same links; nothing pans.
  const st = S('static'), sp = P('static');
  out.push({ ok: st.motion === 'static' && st.live === false && st.drags === 0 && sp.list?.display === 'grid' && sp.list?.transforms === 0 && sp.list?.positions?.join() === 'static' && sp.list?.rows >= 3 && st.links === 24 && sp.touchAction?.stage === 'auto', message: `static tier: a ${sp.list?.display} of ${st.links} links in ${sp.list?.rows} rows, ${sp.list?.transforms} transforms, touch-action ${sp.touchAction?.stage}` });

  // Phone: no page overflow at 390 px, touch-action none on the stage only, the plane still drags.
  const mb = S('mobile'), mbp = P('mobile');
  out.push({ ok: mbp.overflowX <= 0 && mbp.touchAction?.stage === 'none' && mbp.touchAction?.body === 'auto' && mbp.touchAction?.html === 'auto', message: `phone: overflow ${mbp.overflowX} px; touch-action stage ${mbp.touchAction?.stage}, body ${mbp.touchAction?.body}` });
  out.push({ ok: mb.drags === 1 && near(mb.offset?.x, -180) && near(mb.offset?.y, -90) && mbp.holes === 0 && mb.tile?.w >= 180, message: `phone: drag pans (${mb.offset?.x}, ${mb.offset?.y}), ${mbp.holes} holes, tiles ${mb.tile?.w} px` });
  return out;
}
