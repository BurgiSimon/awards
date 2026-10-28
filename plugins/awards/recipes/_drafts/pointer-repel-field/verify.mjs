// The field: with a mouse resting on it, every item inside R sits displaced straight away from the pointer by
// ((R − d) / R)^1.6 × push (to the pixel), every item outside R carries no transform, and the ticker has stopped
// while the pointer is still there; the pointer leaving brings every item home (transform removed) and stops the
// ticker; Tab + Enter on the nudge sends a wave, Space too, the field settles after it and Escape stills it at once;
// on a phone a press and drag pushes by the same rule and the lift lets go; reduced motion and the static tier hold a
// still field with the nudge hidden; the field is aria-hidden and the heading, copy and controls stay in the
// accessibility tree.
const tabToNudge = [{ type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }];
const wait = (ms) => ({ type: 'wait', ms });
const intoView = { type: 'waitFor', fn: "(() => { document.querySelector('[data-field]').scrollIntoView({ block: 'center' }); return true; })()" };
// Synthetic touch input (Playwright's mouse is never a touch pointer): press at 30 % / 35 % of the field, drag to the middle.
const press = { type: 'waitFor', fn: `(() => {
  const f = document.querySelector('[data-field]'); const r = f.getBoundingClientRect();
  const ev = (type, fx, fy) => f.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: Math.round(r.left + r.width * fx), clientY: Math.round(r.top + r.height * fy) }));
  ev('pointerdown', 0.3, 0.35); ev('pointermove', 0.4, 0.42); ev('pointermove', 0.5, 0.5);
  return true; })()` };
const lift = { type: 'waitFor', fn: `(() => {
  const f = document.querySelector('[data-field]'); const r = f.getBoundingClientRect();
  f.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, clientX: Math.round(r.left + r.width * 0.5), clientY: Math.round(r.top + r.height * 0.5) }));
  return true; })()` };

export const states = [
  { name: 'rest', scroll: 0, settle: 600 },
  { name: 'push', settle: 600, actions: [{ type: 'hover', selector: '[data-field]' }, wait(1600)] },
  { name: 'sweep', frame: true, settle: 600, actions: [{ type: 'move', x: 720, y: 280, steps: 2 }, wait(150), { type: 'move', x: 1130, y: 600, steps: 10 }, wait(160)] },
  { name: 'leave', settle: 600, actions: [{ type: 'hover', selector: '[data-field]' }, wait(1000), { type: 'move', x: 20, y: 20, steps: 2 }, wait(3600)] },
  { name: 'nudge', settle: 600, actions: [...tabToNudge, { type: 'press', key: 'Enter' }, wait(600)] },
  { name: 'nudge-settled', settle: 600, actions: [...tabToNudge, { type: 'press', key: 'Space' }, wait(4200)] },
  { name: 'escape', settle: 600, actions: [...tabToNudge, { type: 'press', key: 'Enter' }, wait(400), { type: 'press', key: 'Escape' }, wait(200)] },
  { name: 'touch', viewport: 'mobile', settle: 600, actions: [intoView, wait(400), press, wait(1600)] },
  { name: 'touch-lift', viewport: 'mobile', settle: 600, actions: [intoView, wait(400), press, wait(900), lift, wait(3600)] },
  { name: 'rm', reducedMotion: true, settle: 600, actions: [{ type: 'hover', selector: '[data-field]' }, wait(900)] },
  { name: 'static', settle: 600, actions: [{ type: 'hover', selector: '[data-field]' }, wait(900), { type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" }, wait(400)] },
  { name: 'mobile', viewport: 'mobile', scroll: 0, settle: 600 },
];

export async function probe() {
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
    return { rx, ry, dx: b.left + b.width / 2 - rx, dy: b.top + b.height / 2 - ry, t: ts[i] };
  });
  // Against the pointer: items inside R (away from its centre and edge) vs items outside R.
  let near = 0, worstCos = 1, worstErr = 0, inside = 0, outside = 0, outsideMoved = 0;
  if (st.pointer) {
    for (const it of items) {
      const ex = it.rx - st.pointer.x, ey = it.ry - st.pointer.y, d = Math.hypot(ex, ey);
      if (d < st.radius) inside++;
      if (d > 8 && d < st.radius - 8) {
        near++;
        const mag = Math.hypot(it.dx, it.dy);
        const want = ((st.radius - d) / st.radius) ** 1.6 * st.push;
        worstCos = Math.min(worstCos, mag ? (it.dx * ex + it.dy * ey) / (mag * d) : 0);
        worstErr = Math.max(worstErr, Math.abs(mag - want));
      } else if (d > st.radius + 1) {
        outside++;
        if (it.t || Math.hypot(it.dx, it.dy) > 0.01) outsideMoved++;
      }
    }
  }
  const maxShift = Math.max(0, ...items.map((it) => Math.hypot(it.dx, it.dy)));
  const f0 = st.frames;
  await new Promise((r) => setTimeout(r, 400));
  const f1 = window.__awards.state().frames;
  const nudge = document.querySelector('[data-nudge]');
  const nb = nudge.getBoundingClientRect();
  const h1 = document.querySelector('h1').getBoundingClientRect();
  return {
    near, worstCos: Number(worstCos.toFixed(4)), worstErr: Number(worstErr.toFixed(3)), inside, outside, outsideMoved,
    transformed: items.filter((it) => it.t).length,
    maxShift: Number(maxShift.toFixed(3)),
    framesIn400ms: f1 - f0,
    ariaHidden: field.getAttribute('aria-hidden'),
    focusNudge: document.activeElement === nudge && nudge.matches(':focus-visible'),
    nudgeDisplay: getComputedStyle(nudge).display,
    nudgeH: Math.round(nb.height),
    fieldBelowHeading: fr.top >= h1.bottom,
    fieldW: Math.round(fr.width),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side, at rest: the accessibility tree of <main> holds the copy and the controls and nothing of the field.
export async function inspect(page, st) {
  if (!['rest', 'rm'].includes(st.name)) return null;
  return { snap: await page.locator('main').ariaSnapshot() };
}

export function assert(r) {
  const s = (n) => r[n]?.state ?? {};
  const p = (n) => r[n]?.probe ?? {};
  const out = [];

  const rest = s('rest'), rp = p('rest');
  out.push({ ok: rest.motion === 'full' && rest.items === 144 && rp.transformed === 0 && rest.ticking === false && rest.frames === 0, message: `rest: ${rest.items} items laid out by the grid, none transformed (${rp.transformed}), no ticker and no frame spent (${rest.frames})` });
  const snap = r.rest?.inspect?.snap ?? '';
  out.push({ ok: rp.ariaHidden === 'true' && /heading "A gross of buttons, sorted by hand\." \[level=1\]/.test(snap) && /button "Nudge the tray"/.test(snap) && /link "How the tray behaves"/.test(snap), message: 'the field is aria-hidden; the heading, the nudge button and the link are in the accessibility tree' });

  const pu = s('push'), pp = p('push');
  out.push({ ok: pu.pointer?.type === 'mouse' && pp.near >= 12 && pp.worstCos > 0.995 && pp.worstErr < 0.5, message: `push: ${pp.near} items inside R = ${pu.radius} px sit pushed straight away from the pointer (worst cos ${pp.worstCos}) by ((R − d)/R)^1.6 × ${pu.push} px (worst error ${pp.worstErr} px)` });
  out.push({ ok: pp.outside > 80 && pp.outsideMoved === 0 && pp.transformed === pp.inside, message: `push: ${pp.outside} items outside R carry no transform and have not moved (${pp.outsideMoved}); transformed = inside R (${pp.transformed} = ${pp.inside})` });
  out.push({ ok: pu.maxWrites <= pp.inside && pu.ticking === false && pp.framesIn400ms === 0, message: `push: at most ${pu.maxWrites} writes in a frame (≤ ${pp.inside} inside R), and with the pointer resting the ticker has left (${pp.framesIn400ms} frames in 400 ms)` });

  const sw = s('sweep'), swp = p('sweep');
  out.push({ ok: sw.pointer?.type === 'mouse' && sw.active > 0 && swp.transformed > 10 && swp.transformed < sw.items * 0.8, message: `sweep: mid-drag ${swp.transformed} of ${sw.items} items are pushed or still settling along the path; the rest of the tray is untouched` });

  const lv = s('leave'), lp = p('leave');
  out.push({ ok: lv.pointer === null && lp.transformed === 0 && lp.maxShift < 0.01 && lv.active === 0, message: `leave: after the pointer leaves, every item is home (transform removed, largest offset ${lp.maxShift} px, active ${lv.active})` });
  out.push({ ok: lv.ticking === false && lp.framesIn400ms === 0 && lv.settleMs > 300 && lv.settleMs < 3600, message: `leave: the springs settled ${lv.settleMs} ms after the pointer left, then the ticker stopped (${lp.framesIn400ms} frames in 400 ms)` });

  const nu = s('nudge'), np = p('nudge');
  out.push({ ok: np.focusNudge && nu.waves === 1 && np.transformed > 30 && nu.pointer === null, message: `keyboard: Tab reaches the nudge (focus-visible ${np.focusNudge}), Enter sends a wave with no pointer at all (${np.transformed} items moving)` });
  const ns = s('nudge-settled'), nsp = p('nudge-settled');
  out.push({ ok: ns.waves === 1 && nsp.transformed === 0 && ns.ticking === false && nsp.framesIn400ms === 0, message: `keyboard: Space works too, and the tray settles after the wave (${nsp.transformed} transformed, ticker ${ns.ticking ? 'running' : 'stopped'})` });

  const es = s('escape'), esp = p('escape');
  out.push({ ok: es.waves === 1 && es.stilled === 1 && esp.transformed === 0 && esp.maxShift < 0.01 && es.ticking === false, message: `keyboard: Escape mid-wave stills the tray at once (${esp.transformed} transformed, largest offset ${esp.maxShift} px, ticker ${es.ticking ? 'running' : 'stopped'})` });

  const tc = s('touch'), tp = p('touch');
  out.push({ ok: tc.pointer?.type === 'touch' && tc.radius < pu.radius && tp.near >= 6 && tp.worstCos > 0.995 && tp.worstErr < 0.5 && tp.outsideMoved === 0, message: `touch: a press and drag pushes by the same rule with the phone's smaller circle (R ${tc.radius} px, push ${tc.push} px; ${tp.near} items, worst cos ${tp.worstCos}, worst error ${tp.worstErr} px, ${tp.outsideMoved} moved outside)` });
  const tl = s('touch-lift'), tlp = p('touch-lift');
  out.push({ ok: tl.pointer === null && tlp.transformed === 0 && tl.ticking === false, message: `touch: lifting the finger lets go; every item home (${tlp.transformed} transformed) and the ticker stopped` });

  const rm = s('rm'), rmp = p('rm');
  const rmSnap = r.rm?.inspect?.snap ?? 'Nudge the tray';
  out.push({ ok: rm.motion === 'reduced' && rmp.transformed === 0 && rm.frames === 0 && rm.ticking === false && rm.nudgeHidden && rmp.nudgeDisplay === 'none' && !/Nudge the tray/.test(rmSnap) && /holds still/.test(rmSnap), message: `reduced motion: a hovered field stays still (${rmp.transformed} transformed, ${rm.frames} frames), the nudge is hidden from sight and from the accessibility tree, and a line says why` });
  const sc = s('static'), scp = p('static');
  out.push({ ok: sc.motion === 'static' && scp.transformed === 0 && sc.ticking === false && sc.nudgeHidden, message: `static: switched live under a hovering pointer, every item is released home (${scp.transformed} transformed) and the nudge hidden` });

  const mb = s('mobile'), mp = p('mobile');
  out.push({ ok: mb.items === 64 && mp.fieldBelowHeading && mp.fieldW <= 390 && mp.nudgeH >= 44 && (mp.overflowX ?? 1) <= 0, message: `mobile: an 8 × 8 tray (${mb.items} items, ${mp.fieldW} px wide) under the copy, nudge ${mp.nudgeH} px tall, no sideways overflow (${mp.overflowX})` });
  return out;
}
