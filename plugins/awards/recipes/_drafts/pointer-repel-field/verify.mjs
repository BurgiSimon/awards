// The field: with a mouse resting on it, every item inside R (3.3 cells of the tray's own grid) sits displaced straight
// away from the pointer by ((R − d) / R)^1.6 × push (to the pixel, shortened along the same ray near the rim), turned
// and lifted by the same weight, every item outside R carries no transform, nothing is measured again, and the ticker
// has stopped while the pointer is still there; the pointer leaving brings every item home past its place (the
// under-damped spring) and stops the ticker; Tab + Enter on the nudge sends a ring out from the centre, Space too, the
// centre moving first and the corner later by the ring's travel, and Escape stills it at once; on a phone a real touch
// drag sideways pushes by the same rule while the page holds still, a vertical swipe on the tray scrolls the page and
// lets the tray go, and a lift lets go; reduced motion and the static tier hold a still field, hide the nudge, say why
// and give every touch on the tray back to the page; off screen everything is released at once; the field is
// aria-hidden and the heading, copy and controls stay in the accessibility tree.
const tabToNudge = [{ type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }];
const wait = (ms) => ({ type: 'wait', ms });
// A trusted page function as a waitFor action (stringified: it must not close over this module).
const run = (fn) => ({ type: 'waitFor', fn: `(${fn.toString()})()` });
const intoView = run(() => { document.querySelector('[data-field]').scrollIntoView({ block: 'center' }); return true; });
// Wait on the engine, not the clock: until the ticker has left (everything settled or resting), or until the tray
// holds a given number of displaced items. A loaded software renderer can stretch frames past the 0.1 s a frame may
// step, so fixed waits would read a slow machine as a broken spring; these poll every frame, with a bound.
const untilStill = { ...run(() => !window.__awards.state().ticking), timeout: 20000 };
const untilDisplaced = (k) => ({ type: 'waitFor', fn: `window.__awards.state().displaced >= ${k}`, timeout: 20000 });
// Before an interaction: the measure count so far, and a counter on every getBoundingClientRect from here on.
const mark = run(() => {
  window.__m0 = window.__awards.state().measures;
  window.__gbcr = 0;
  const own = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function counted() { window.__gbcr++; return own.call(this); };
  return true;
});
// Before the pointer leaves: the most displaced item's offset along its own push direction, every frame for 2.5 s.
const returnSampler = run(() => {
  const off = (el) => { const m = el.style.transform.match(/translate3d\((-?[\d.]+)px, (-?[\d.]+)px/); return m ? [Number(m[1]), Number(m[2])] : [0, 0]; };
  const items = [...document.querySelector('[data-field]').children];
  let best = null, start = 0;
  for (const el of items) { const m = Math.hypot(...off(el)); if (m > start) { start = m; best = el; } }
  const ret = window.__ret = { start, min: start, frames: 0 };
  if (!best) return true;
  const [ux, uy] = off(best).map((v) => v / start);
  const tick = () => { const [x, y] = off(best); ret.min = Math.min(ret.min, x * ux + y * uy); if (++ret.frames < 150) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  return true;
});
// After Enter, in the first frame the ring has passed 3 cells: every item's place and transform, so the ring is judged
// at a moment of the wave's own choosing rather than whenever the probe happens to run.
const ringSnapshot = { ...run(() => {
  const st = window.__awards.state();
  if (st.waveR === null || st.waveR < 3 * st.pitch) return false;
  const f = document.querySelector('[data-field]'); const fr = f.getBoundingClientRect();
  const items = [...f.children].filter((el) => el.offsetParent !== null);
  const ts = items.map((el) => el.style.transform);
  items.forEach((el) => { el.style.transform = ''; });
  const homes = items.map((el) => el.getBoundingClientRect());
  items.forEach((el, i) => { el.style.transform = ts[i]; });
  const cx = fr.left + fr.width / 2, cy = fr.top + fr.height / 2;
  const ring = window.__ring = { r: Math.round(st.waveR), total: items.length, passed: 0, behind: 0, ahead: 0 };
  homes.forEach((h, i) => {
    const d = Math.hypot(h.left + h.width / 2 - cx, h.top + h.height / 2 - cy);
    if (d <= st.waveR - 0.5) { ring.passed++; if (ts[i]) ring.behind++; }
    if (ts[i] && d > st.waveR + 0.5) ring.ahead++;
  });
  return true;
}), timeout: 20000 };
// Before the nudge: the item nearest the tray's centre and the farthest (a corner); per frame, when each first moves
// and how far it gets, and the longest frame while the ring travels between them. The sampler runs before the ticker
// in each frame, so it sees a write one frame late; a loaded software renderer stretches those frames, hence `gap`.
const waveSampler = run(() => {
  const f = document.querySelector('[data-field]'); const fr = f.getBoundingClientRect();
  const items = [...f.children].filter((el) => el.offsetParent !== null);
  const cx = fr.left + fr.width / 2, cy = fr.top + fr.height / 2;
  const ds = items.map((el) => { const b = el.getBoundingClientRect(); return Math.hypot(b.left + b.width / 2 - cx, b.top + b.height / 2 - cy); });
  const track = (i) => ({ i, d: ds[i], start: null, peak: 0 });
  const w = window.__wave = { centre: track(ds.indexOf(Math.min(...ds))), corner: track(ds.indexOf(Math.max(...ds))), frames: 0, gap: 0, last: 0 };
  const off = (el) => { const m = el.style.transform.match(/translate3d\((-?[\d.]+)px, (-?[\d.]+)px/); return m ? Math.hypot(Number(m[1]), Number(m[2])) : 0; };
  const tick = (t) => {
    for (const k of [w.centre, w.corner]) { const m = off(items[k.i]); if (k.start === null && m > 0.5) k.start = t; k.peak = Math.max(k.peak, m); }
    if (w.centre.start !== null && (w.corner.start === null || w.corner.start === t) && w.last) w.gap = Math.max(w.gap, t - w.last);
    w.last = t;
    if (++w.frames < 180) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return true;
});

export const states = [
  { name: 'rest', scroll: 0, settle: 600 },
  { name: 'push', settle: 600, actions: [mark, { type: 'hover', selector: '[data-field]' }, wait(300), untilStill] },
  // The pointer 1.6 cells in from the left rim (moved in inspect, where the tray's rect is known).
  { name: 'edge', settle: 600 },
  { name: 'sweep', frame: true, settle: 600, actions: [mark, { type: 'move', x: 720, y: 170, steps: 2 }, wait(150), { type: 'move', x: 1015, y: 470, steps: 10 }, wait(160), untilDisplaced(20)] },
  { name: 'leave', settle: 600, actions: [mark, { type: 'hover', selector: '[data-field]' }, wait(300), untilStill, returnSampler, { type: 'move', x: 20, y: 20, steps: 2 }, wait(300), untilStill] },
  { name: 'nudge', settle: 600, actions: [...tabToNudge, { type: 'press', key: 'Enter' }, ringSnapshot] },
  { name: 'nudge-settled', settle: 600, actions: [...tabToNudge, waveSampler, { type: 'press', key: 'Space' }, wait(300), untilStill] },
  { name: 'escape', settle: 600, actions: [...tabToNudge, { type: 'press', key: 'Enter' }, untilDisplaced(20), { type: 'press', key: 'Escape' }, wait(200)] },
  // Pushed and resting, then scrolled away: the stepped clock at the scroll, and a wait until nothing is active.
  { name: 'offscreen', settle: 600, actions: [{ type: 'hover', selector: '[data-field]' }, wait(300), untilStill, run(() => { const st = window.__awards.state(); window.__before = st.displaced; window.__sim0 = st.simT; window.scrollTo(0, document.documentElement.scrollHeight); return true; }), { ...run(() => window.__awards.state().active === 0), timeout: 20000 }] },
  // Real touch input through CDP in inspect (Playwright's mouse is never a touch pointer).
  { name: 'touch', viewport: 'mobile', settle: 600, actions: [intoView, wait(400)] },
  { name: 'touch-lift', viewport: 'mobile', settle: 600, actions: [intoView, wait(400)] },
  { name: 'touch-scroll', viewport: 'mobile', settle: 600, actions: [intoView, wait(400)] },
  { name: 'rm', reducedMotion: true, settle: 600, actions: [{ type: 'hover', selector: '[data-field]' }, wait(900)] },
  { name: 'rm-touch', viewport: 'mobile', reducedMotion: true, settle: 600, actions: [intoView, wait(400)] },
  { name: 'static', settle: 600, actions: [{ type: 'hover', selector: '[data-field]' }, untilDisplaced(1), run(() => { window.__before = window.__awards.state().displaced; document.documentElement.dataset.motion = 'static'; return true; }), wait(400)] },
  { name: 'mobile', viewport: 'mobile', scroll: 0, settle: 600 },
];

export async function probe() {
  const gbcr = window.__gbcr ?? null; // read before this probe makes its own calls
  const field = document.querySelector('[data-field]');
  const fr = field.getBoundingClientRect();
  const st = window.__awards.state();
  const live = [...field.children].filter((el) => el.offsetParent !== null);
  // Each item's place: its rect with the transform lifted for one synchronous read (no frame paints in between).
  const ts = live.map((el) => el.style.transform);
  live.forEach((el) => { el.style.transform = ''; });
  const homes = live.map((el) => el.getBoundingClientRect());
  live.forEach((el, i) => { el.style.transform = ts[i]; });
  const items = live.map((el, i) => {
    const b = el.getBoundingClientRect(), h = homes[i];
    const rx = h.left + h.width / 2, ry = h.top + h.height / 2;
    const rot = /rotate\((-?[\d.]+)deg\)/.exec(ts[i]), sc = /scale\(([\d.]+)\)/.exec(ts[i]);
    return { rx, ry, dx: b.left + b.width / 2 - rx, dy: b.top + b.height / 2 - ry, t: ts[i], rot: rot ? Number(rot[1]) : 0, scale: sc ? Number(sc[1]) : 1 };
  });
  // Against the pointer: items inside R (away from its centre and edge) vs items outside R. The expected push is the
  // weight's, shortened along the same ray where it would carry the centre closer than `edge` to the tray's rim.
  let near = 0, worstCos = 1, worstErr = 0, inside = 0, outside = 0, outsideMoved = 0, clamped = 0, worstScale = 0, rotLo = Infinity, rotHi = 0;
  if (st.pointer) {
    for (const it of items) {
      const ex = it.rx - st.pointer.x, ey = it.ry - st.pointer.y, d = Math.hypot(ex, ey);
      if (d < st.radius) inside++;
      if (d > 8 && d < st.radius - 8) {
        near++;
        const w = ((st.radius - d) / st.radius) ** 1.6;
        const ux = ex / d, uy = ey / d, hx = it.rx - fr.left, hy = it.ry - fr.top;
        let tmax = Infinity;
        if (ux > 0) tmax = Math.min(tmax, (fr.width - st.edge - hx) / ux); else if (ux < 0) tmax = Math.min(tmax, (st.edge - hx) / ux);
        if (uy > 0) tmax = Math.min(tmax, (fr.height - st.edge - hy) / uy); else if (uy < 0) tmax = Math.min(tmax, (st.edge - hy) / uy);
        const want = Math.max(0, Math.min(w * st.push, tmax));
        if (w * st.push > tmax + 0.5) clamped++;
        const mag = Math.hypot(it.dx, it.dy);
        if (want > 0.05) worstCos = Math.min(worstCos, mag ? (it.dx * ex + it.dy * ey) / (mag * d) : 0);
        worstErr = Math.max(worstErr, Math.abs(mag - want));
        worstScale = Math.max(worstScale, Math.abs(it.scale - (1 + w * st.lift)));
        if (w > 0.05) { const k = Math.abs(it.rot) / (w * st.turn); rotLo = Math.min(rotLo, k); rotHi = Math.max(rotHi, k); }
      } else if (d > st.radius + 1) {
        outside++;
        if (it.t || Math.hypot(it.dx, it.dy) > 0.01) outsideMoved++;
      }
    }
  }
  // Every rendered centre against the rim margin.
  const outOfBounds = items.filter((it) => {
    const x = it.rx + it.dx - fr.left, y = it.ry + it.dy - fr.top;
    return x < st.edge - 0.5 || y < st.edge - 0.5 || x > fr.width - st.edge + 0.5 || y > fr.height - st.edge + 0.5;
  }).length;
  const maxShift = Math.max(0, ...items.map((it) => Math.hypot(it.dx, it.dy)));
  // The idle claim (no frames while nothing moves) is tested only when the ticker has left; a moving tray is caught
  // at once, so the screenshot that follows shows the moment, not its aftermath.
  let framesIn400ms = null;
  if (!st.ticking) {
    const f0 = st.frames;
    await new Promise((r) => setTimeout(r, 400));
    framesIn400ms = window.__awards.state().frames - f0;
  }
  const nudge = document.querySelector('[data-nudge]');
  const nb = nudge.getBoundingClientRect();
  const h1 = document.querySelector('h1').getBoundingClientRect();
  const note = document.querySelector('[data-still-note]');
  const w = window.__wave;
  return {
    near, worstCos: Number(worstCos.toFixed(4)), worstErr: Number(worstErr.toFixed(3)), inside, outside, outsideMoved, clamped,
    worstScale: Number(worstScale.toFixed(4)), rotLo: Number((rotLo === Infinity ? 0 : rotLo).toFixed(3)), rotHi: Number(rotHi.toFixed(3)),
    ring: window.__ring ?? null, outOfBounds,
    simSince: window.__sim0 === undefined ? null : Number((st.simT - window.__sim0).toFixed(3)),
    transformed: items.filter((it) => it.t).length,
    maxShift: Number(maxShift.toFixed(3)),
    framesIn400ms,
    measuresSince: window.__m0 === undefined ? null : st.measures - window.__m0,
    gbcr,
    before: window.__before ?? null,
    ret: window.__ret ? { start: Number(window.__ret.start.toFixed(2)), min: Number(window.__ret.min.toFixed(2)), frames: window.__ret.frames } : null,
    wave: w ? {
      centreStart: w.centre.start, cornerStart: w.corner.start,
      delay: w.centre.start !== null && w.corner.start !== null ? Number(((w.corner.start - w.centre.start) / 1000).toFixed(3)) : null,
      expected: Number(((w.corner.d - w.centre.d) / st.waveSpeed).toFixed(3)),
      centrePeak: Number(w.centre.peak.toFixed(1)), cornerPeak: Number(w.corner.peak.toFixed(1)),
      gap: Number((w.gap / 1000).toFixed(3)),
    } : null,
    touchAction: getComputedStyle(field).touchAction,
    noteShown: !note.hidden && getComputedStyle(note).display !== 'none',
    ariaHidden: field.getAttribute('aria-hidden'),
    focusNudge: document.activeElement === nudge && nudge.matches(':focus-visible'),
    nudgeDisplay: getComputedStyle(nudge).display,
    nudgeH: Math.round(nb.height),
    fieldTop: Math.round(fr.top), fieldBottom: Math.round(fr.bottom), innerH: innerHeight,
    fieldBelowHeading: fr.top >= h1.bottom,
    fieldW: Math.round(fr.width),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

const trayRect = (page) => page.evaluate(() => {
  const b = document.querySelector('[data-field]').getBoundingClientRect();
  return { l: b.left, t: b.top, w: b.width, h: b.height };
});
// A real finger through CDP: touchStart, ten touchMoves a frame apart, and touchEnd unless the finger stays down.
async function touchDrag(page, cdp, [x0, y0], [x1, y1], { end = true } = {}) {
  const at = (x, y) => [{ x: Math.round(x), y: Math.round(y) }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: at(x0, y0) });
  for (let i = 1; i <= 10; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: at(x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10) });
    await page.waitForTimeout(16);
  }
  if (end) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
const still = (page) => page.waitForFunction(() => !window.__awards.state().ticking, null, { timeout: 20000 });
const read = (page) => page.evaluate(() => ({ st: window.__awards.state(), y: scrollY, ta: getComputedStyle(document.querySelector('[data-field]')).touchAction }));

// Node side: the accessibility tree at rest and under reduced motion; the rim test with a real mouse; real touch
// drags (CDP) on the phone, each read mid-gesture and after, with the page's scroll position.
export async function inspect(page, st) {
  if (['rest', 'rm'].includes(st.name)) return { snap: await page.locator('main').ariaSnapshot() };
  if (st.name === 'edge') {
    const g = await page.evaluate(() => {
      const f = document.querySelector('[data-field]'); const r = f.getBoundingClientRect(); const a = f.children[0].getBoundingClientRect();
      return { x: a.left + a.width / 2 + 1.1 * window.__awards.state().pitch, y: r.top + r.height / 2 };
    });
    await page.mouse.move(g.x, g.y, { steps: 6 });
    await page.waitForTimeout(300);
    await still(page);
    return { probe: await page.evaluate(probe), st: (await read(page)).st };
  }
  if (!['touch', 'touch-lift', 'touch-scroll', 'rm-touch'].includes(st.name)) return null;
  const cdp = await page.context().newCDPSession(page);
  const r = await trayRect(page);
  const before = await read(page);
  if (st.name === 'touch' || st.name === 'touch-lift') {
    // Sideways across the middle row, from a fifth of the way in to just past the centre.
    await touchDrag(page, cdp, [r.l + r.w * 0.2, r.t + r.h * 0.5], [r.l + r.w * 0.55, r.t + r.h * 0.5], { end: false });
    await page.waitForTimeout(300);
    await still(page); // the finger rests: the circle has caught up and the ticker has left
    const mid = await read(page);
    if (st.name === 'touch') return { before, mid, probe: await page.evaluate(probe) };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(300);
    await still(page);
    return { before, mid, after: await read(page), probe: await page.evaluate(probe) };
  }
  // Vertical on the tray: the browser takes the swipe (pan-y), scrolls, and cancels the tray's pointer.
  await touchDrag(page, cdp, [r.l + r.w * 0.5, r.t + r.h * 0.75], [r.l + r.w * 0.5, r.t + r.h * 0.3], { end: false });
  await page.waitForTimeout(200);
  const mid = await read(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(600);
  await still(page);
  // The fling may still carry the page: read once its scroll position holds for 200 ms.
  await page.waitForFunction(() => new Promise((ok) => { const y = scrollY; setTimeout(() => ok(scrollY === y), 200); }), null, { timeout: 20000 });
  const after = await read(page);
  let sideways = null;
  if (st.name === 'rm-touch') {
    // And sideways across the tray, where the full tier would part it: nothing moves.
    const r2 = await trayRect(page);
    await touchDrag(page, cdp, [r2.l + r2.w * 0.2, r2.t + r2.h * 0.5], [r2.l + r2.w * 0.6, r2.t + r2.h * 0.5], { end: false });
    await page.waitForTimeout(400);
    sideways = await read(page);
  }
  return { before, mid, after, sideways, probe: await page.evaluate(probe) };
}

export function assert(r) {
  const s = (n) => r[n]?.state ?? {};
  const p = (n) => r[n]?.probe ?? {};
  const ins = (n) => r[n]?.inspect ?? {};
  const out = [];

  const rest = s('rest'), rp = p('rest');
  out.push({ ok: rest.motion === 'full' && rest.items === 144 && rp.transformed === 0 && rest.ticking === false && rest.frames === 0, message: `rest: ${rest.items} items laid out by the grid, none transformed (${rp.transformed}), no ticker and no frame spent (${rest.frames})` });
  out.push({ ok: rp.touchAction === 'pan-y pinch-zoom' && rp.noteShown === false && rp.nudgeDisplay !== 'none', message: `rest: the live tray keeps only sideways drags (touch-action ${rp.touchAction}), the nudge is shown (${rp.nudgeDisplay}) and the still note hidden (${rp.noteShown})` });
  const snap = ins('rest').snap ?? '';
  out.push({ ok: rp.ariaHidden === 'true' && /heading "A gross of buttons, sorted by hand\." \[level=1\]/.test(snap) && /button "Nudge the tray"/.test(snap) && /link "How the tray behaves"/.test(snap), message: 'the field is aria-hidden; the heading, the nudge button and the link are in the accessibility tree' });

  const pu = s('push'), pp = p('push');
  out.push({ ok: pu.cols === 12 && Math.abs(pu.radius - 3.3 * pu.pitch) < 0.01 && Math.abs(pu.push - 1.25 * pu.pitch) < 0.01, message: `push: R and the push follow the tray's own grid (${pu.cols} columns, pitch ${pu.pitch?.toFixed(1)} px: R ${pu.radius?.toFixed(1)} px = 3.3 cells, push ${pu.push?.toFixed(1)} px = 1.25 cells)` });
  out.push({ ok: pu.pointer?.type === 'mouse' && pp.near >= 12 && pp.worstCos > 0.995 && pp.worstErr < 0.5, message: `push: ${pp.near} items inside R sit pushed straight away from the pointer (worst cos ${pp.worstCos}) by ((R − d)/R)^1.6 × push (worst error ${pp.worstErr} px)` });
  out.push({ ok: pp.near >= 12 && pp.worstScale < 0.002 && pp.rotLo >= 0.59 && pp.rotHi <= 1.01, message: `push: the same weight lifts (scale 1 + w × ${pu.lift}, worst error ${pp.worstScale}) and turns them (|rotation| / (w × ${pu.turn}°) from ${pp.rotLo} to ${pp.rotHi}, inside the seeded .6–1.0)` });
  out.push({ ok: pp.outside > 80 && pp.outsideMoved === 0 && pp.transformed === pp.inside, message: `push: ${pp.outside} items outside R carry no transform and have not moved (${pp.outsideMoved}); transformed = inside R (${pp.transformed} = ${pp.inside})` });
  out.push({ ok: pu.maxWrites <= pp.inside && pu.ticking === false && pp.framesIn400ms === 0, message: `push: at most ${pu.maxWrites} writes in a frame (≤ ${pp.inside} inside R), and with the pointer resting the ticker has left (${pp.framesIn400ms} frames in 400 ms)` });
  out.push({ ok: pp.measuresSince === 0 && pp.gbcr === 0, message: `push: places are not read again while the pointer arrives and rests (${pp.measuresSince} measures, ${pp.gbcr} getBoundingClientRect calls)` });

  const ed = ins('edge'), ep = ed.probe ?? {};
  out.push({ ok: ed.st?.pointer?.type === 'mouse' && ep.clamped >= 2 && ep.outOfBounds === 0 && ep.worstCos > 0.995 && ep.worstErr < 0.5, message: `edge: with the pointer 1.6 cells in from the rim, ${ep.clamped} pushes are shortened along their own ray (worst cos ${ep.worstCos}, worst error ${ep.worstErr} px) and no centre comes closer than ${ed.st?.edge?.toFixed(1)} px to the tray's edge (${ep.outOfBounds} out)` });

  const sw = s('sweep'), swp = p('sweep');
  out.push({ ok: sw.pointer?.type === 'mouse' && sw.ticking && swp.transformed > 10 && swp.transformed < sw.items * 0.8 && swp.outsideMoved >= 4, message: `sweep: mid-drag ${swp.transformed} of ${sw.items} items are pushed or still settling, ${swp.outsideMoved} of them already outside R on the way home along the path; the rest of the tray is untouched` });
  out.push({ ok: swp.measuresSince === 0 && swp.gbcr === 0 && sw.frames > 10, message: `sweep: each of ${sw.frames} frames is arithmetic over the cache (${swp.gbcr} getBoundingClientRect calls and ${swp.measuresSince} measures during the sweep)` });

  const lv = s('leave'), lp = p('leave');
  out.push({ ok: lv.pointer === null && lp.transformed === 0 && lp.maxShift < 0.01 && lv.active === 0, message: `leave: after the pointer leaves, every item is home (transform removed, largest offset ${lp.maxShift} px, active ${lv.active})` });
  // On the springs' own clock: k 130, c 10.3 bring a 48 px push home in about 1.2 s of stepped time, at any frame rate.
  out.push({ ok: lv.ticking === false && lp.framesIn400ms === 0 && lv.settleSim > 0.9 && lv.settleSim < 1.8 && lp.measuresSince === 0 && lp.gbcr === 0, message: `leave: the springs settled ${lv.settleSim} s of stepped time (${lv.settleMs} ms on this machine) after the pointer left, then the ticker stopped (${lp.framesIn400ms} frames in 400 ms; ${lp.gbcr} layout reads)` });
  const ret = lp.ret ?? {};
  out.push({ ok: ret.start > 20 && ret.min < -0.1 * ret.start && ret.min > -0.4 * ret.start, message: `leave: the way home is under-damped: an item pushed ${ret.start} px swings ${-ret.min} px past its place (${ret.start ? Math.round((-100 * ret.min) / ret.start) : '?'} %, between 10 and 40 %) before it settles` });

  const nu = s('nudge'), np = p('nudge'), ring = np.ring ?? {};
  out.push({ ok: np.focusNudge && nu.waves === 1 && nu.pointer === null && ring.ahead === 0 && ring.behind >= 12 && ring.behind === ring.passed && ring.total - ring.passed >= 40, message: `keyboard: Tab reaches the nudge (focus-visible ${np.focusNudge}) and Enter sends a ring with no pointer at all: with its front at ${ring.r} px, all ${ring.behind} of the ${ring.passed} items it has passed are moving and none of the ${ring.total - ring.passed} beyond it (${ring.ahead})` });
  const ns = s('nudge-settled'), nsp = p('nudge-settled'), wv = nsp.wave ?? {};
  // Not all at once (≥ .75 of the travel time) and not slower than the stated speed allows (≤ the travel time plus two
  // of the longest frames seen meanwhile: one for the sampler's read-before-write, one for the frame grid).
  out.push({ ok: wv.centreStart !== null && wv.delay >= 0.75 * wv.expected && wv.delay <= wv.expected + 2 * wv.gap + 0.034 && wv.centrePeak >= 0.4 * ns.pitch && wv.cornerPeak < wv.centrePeak, message: `keyboard: the ring travels out: the corner starts ${wv.delay} s after the centre (its travel at ${ns.waveSpeed?.toFixed(0)} px/s: ${wv.expected} s, longest frame meanwhile ${wv.gap} s), the centre peaks at ${wv.centrePeak} px (≥ .4 cell) and the corner at ${wv.cornerPeak} px` });
  out.push({ ok: ns.waves === 1 && nsp.transformed === 0 && ns.ticking === false && nsp.framesIn400ms === 0, message: `keyboard: Space works too, and the tray settles after the wave (${nsp.transformed} transformed, ticker ${ns.ticking ? 'running' : 'stopped'})` });

  const es = s('escape'), esp = p('escape');
  out.push({ ok: es.waves === 1 && es.stilled === 1 && esp.transformed === 0 && esp.maxShift < 0.01 && es.ticking === false, message: `keyboard: Escape mid-wave stills the tray at once (${esp.transformed} transformed, largest offset ${esp.maxShift} px, ticker ${es.ticking ? 'running' : 'stopped'})` });

  const of = s('offscreen'), ofp = p('offscreen');
  out.push({ ok: ofp.before > 0 && ofp.fieldBottom < 0 && ofp.transformed === 0 && of.active === 0 && of.ticking === false && ofp.simSince < 0.3, message: `off screen: ${ofp.before} pushed items are released at once when the tray leaves the viewport (bottom at ${ofp.fieldBottom} px; ${ofp.transformed} transformed after ${ofp.simSince} s of stepped time, where the home spring needs more than 0.9 s)` });

  const tc = ins('touch'), tp = tc.probe ?? {}, tm = tc.mid?.st ?? {};
  out.push({ ok: tm.pointer?.type === 'touch' && tm.cols === 8 && Math.abs(tm.radius - 2.7 * tm.pitch) < 0.01 && tp.near >= 6 && tp.worstCos > 0.995 && tp.worstErr < 0.5 && tp.outsideMoved === 0, message: `touch: a real finger dragged sideways pushes by the same rule with the 8 × 8 tray's circle (R ${tm.radius?.toFixed(1)} px = 2.7 cells; ${tp.near} items, worst cos ${tp.worstCos}, worst error ${tp.worstErr} px, ${tp.outsideMoved} moved outside)` });
  out.push({ ok: tc.before?.ta === 'pan-y pinch-zoom' && tc.mid?.y === tc.before?.y, message: `touch: the sideways drag is the tray's and the page holds still (scrollY ${tc.before?.y} → ${tc.mid?.y})` });
  const tl = ins('touch-lift'), tlp = tl.probe ?? {};
  out.push({ ok: tl.mid?.st?.pointer?.type === 'touch' && tl.mid?.st?.displaced > 0 && tl.after?.st?.pointer === null && tlp.transformed === 0 && tl.after?.st?.ticking === false, message: `touch: lifting the finger lets go: ${tl.mid?.st?.displaced} displaced under it, then every item home (${tlp.transformed} transformed) and the ticker stopped` });
  const ts = ins('touch-scroll'), tsp = ts.probe ?? {};
  out.push({ ok: ts.after?.y - ts.before?.y > 60 && ts.mid?.st?.pointer === null && tsp.transformed === 0 && ts.after?.st?.ticking === false, message: `touch: a vertical swipe on the tray scrolls the page (scrollY ${ts.before?.y} → ${ts.after?.y}), the browser's cancel lets the tray go (pointer ${JSON.stringify(ts.mid?.st?.pointer)}) and it settles home (${tsp.transformed} transformed)` });

  const rm = s('rm'), rmp = p('rm');
  const rmSnap = ins('rm').snap ?? 'Nudge the tray';
  out.push({ ok: rm.motion === 'reduced' && rmp.transformed === 0 && rm.frames === 0 && rm.ticking === false && rm.nudgeHidden && rmp.nudgeDisplay === 'none' && !/Nudge the tray/.test(rmSnap) && /holds still/.test(rmSnap) && rmp.noteShown, message: `reduced motion: a hovered field stays still (${rmp.transformed} transformed, ${rm.frames} frames), the nudge is hidden from sight and from the accessibility tree, and a line says why (shown ${rmp.noteShown})` });
  const rt = ins('rm-touch');
  out.push({ ok: rt.before?.ta === 'auto' && rt.after?.y - rt.before?.y > 60 && rt.sideways?.st?.displaced === 0 && rt.sideways?.st?.frames === 0 && rt.after?.st?.motion === 'reduced', message: `reduced motion on a phone: the still tray gives every touch to the page (touch-action ${rt.before?.ta}; a swipe on it scrolls ${rt.before?.y} → ${rt.after?.y}), and a sideways drag moves nothing (${rt.sideways?.st?.displaced} displaced, ${rt.sideways?.st?.frames} frames)` });
  const sc = s('static'), scp = p('static');
  out.push({ ok: scp.before > 0 && sc.motion === 'static' && scp.transformed === 0 && sc.ticking === false && sc.nudgeHidden && scp.noteShown && scp.touchAction === 'auto', message: `static: switched live under a hovering pointer with ${scp.before} items pushed, every item is released home (${scp.transformed} transformed), the nudge hidden, the still note shown and touch-action back to ${scp.touchAction}` });

  const mb = s('mobile'), mp = p('mobile');
  out.push({ ok: mb.items === 64 && mp.fieldBelowHeading && mp.fieldW <= 390 && mp.fieldBottom <= mp.innerH && mp.nudgeH >= 44 && (mp.overflowX ?? 1) <= 0, message: `mobile: an 8 × 8 tray (${mb.items} items, ${mp.fieldW} px wide) under the copy and whole in the first screen (bottom ${mp.fieldBottom} of ${mp.innerH} px), nudge ${mp.nudgeH} px tall, no sideways overflow (${mp.overflowX})` });
  return out;
}
