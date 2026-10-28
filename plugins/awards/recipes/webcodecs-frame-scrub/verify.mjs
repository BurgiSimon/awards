// Every check reads the frame number the film edge carries, off the screen canvas: the frame shown is the frame asked
// for. A jump decodes from the keyframe and no further; a step forward is one decode; a step back through frames just
// decoded is a cache hit; a burst of requests runs only the newest; a real scroll sweep keeps showing frames; no
// decoded frame is left open. A resize during a decode keeps the newest request and redraws the cache at the new width;
// a main thread blocked past the watchdog does not wedge the decoder. Without WebCodecs the frames are still right;
// reduced motion is one still, also when it is turned on while the page is open.
const ready = { type: 'waitFor', fn: 'window.__scrub?.ready === true' };
const plan = (name) => ({ type: 'waitFor', fn: `(window.__plan = '${name}', true)` });

export const states = [
  { name: 'top', scroll: 0, settle: 400, actions: [ready] },
  { name: 'mid', settle: 300, actions: [ready, plan('mid')] },
  // For the explorer's frame: the film part-way through the day, drawn by the actions alone.
  { name: 'frame', settle: 400, actions: [ready, { type: 'waitFor', fn: '(window.__scrub.go(0.84), true)' }, { type: 'wait', ms: 700 }, { type: 'waitFor', fn: 'window.__awards.state().shown === window.__awards.state().target && !window.__scrub.stats?.busy' }] },
  { name: 'jump', settle: 200, actions: [ready, plan('jump')] },
  { name: 'steps', settle: 200, actions: [ready, plan('steps')] },
  { name: 'burst', settle: 200, actions: [ready, plan('burst')] },
  { name: 'sweep', settle: 200, actions: [ready, plan('sweep')] },
  { name: 'compare', settle: 200, actions: [ready, plan('compare')] },
  { name: 'resize', settle: 200, actions: [ready, plan('resize')] },
  { name: 'stall', settle: 200, actions: [ready, plan('stall')] },
  { name: 'retier', settle: 200, actions: [ready] },
  { name: 'fallback', settle: 300, actions: [ready, { type: 'waitFor', fn: "(sessionStorage.setItem('webcodecs-frame-scrub:fallback', '1'), true)" }, { type: 'reload' }, ready, plan('mid')] },
  { name: 'reduced', reducedMotion: true, scroll: 1, settle: 600, actions: [ready] },
  { name: 'mobile', viewport: 'mobile', settle: 300, actions: [ready, plan('mid')] },
];

// Runs in the page: the plan the state named, then a reading of the screen.
export async function probe() {
  const S = window.__scrub;
  if (!S?.ready) return { error: 'not ready' };
  const st = () => window.__awards.state();
  const until = async (fn, ms = 8000) => { const t0 = performance.now(); while (!fn()) { if (performance.now() - t0 > ms) return false; await new Promise((r) => setTimeout(r, 16)); } return true; };
  const settled = (i) => until(() => st().shown === i && !S.stats?.busy);
  const shownAt = async (i) => { S.seek(i); return settled(i); };
  const out = { plan: window.__plan ?? 'none' };
  if (out.plan === 'mid') {
    S.go(0.5);
    // The scrub eases for 0.3 s: wait until the target stops moving and the decoder has caught up.
    let last = -1;
    await until(() => { const t = st().target; const same = t === last; last = t; return same && st().shown === t && !S.stats?.busy; }, 8000);
  } else if (out.plan === 'jump') {
    out.okA = await shownAt(95);
    const d0 = S.stats.decodes, k0 = S.stats.keySeeks;
    out.okB = await shownAt(33);
    out.decodes = S.stats.decodes - d0;
    out.keySeeks = S.stats.keySeeks - k0;
  } else if (out.plan === 'steps') {
    await shownAt(40);
    const s0 = { ...S.stats };
    let ok = true;
    for (let i = 41; i <= 50; i++) ok = (await shownAt(i)) && ok;
    const s1 = { ...S.stats };
    for (let i = 49; i >= 41; i--) ok = (await shownAt(i)) && ok;
    const s2 = { ...S.stats };
    out.ok = ok;
    out.forward = { decodes: s1.decodes - s0.decodes, sequential: s1.sequential - s0.sequential };
    out.back = { decodes: s2.decodes - s1.decodes, cacheHits: s2.cacheHits - s1.cacheHits };
  } else if (out.plan === 'burst') {
    await shownAt(0);
    const d0 = S.stats.decodes, x0 = S.stats.superseded;
    for (let i = 1; i < 120; i++) S.seek(i);   // one task, 119 requests
    out.ok = await settled(119);
    out.decodes = S.stats.decodes - d0;
    out.superseded = S.stats.superseded - x0;
  } else if (out.plan === 'sweep') {
    const c0 = S.stats.shownCount;
    for (let k = 1; k <= 30; k++) { S.go(k / 30); await new Promise((r) => requestAnimationFrame(r)); }
    out.during = S.stats.shownCount - c0;
    let last = -1;
    await until(() => { const t = st().target; const same = t === last; last = t; return same && st().shown === t && !S.stats?.busy; }, 8000);
  } else if (out.plan === 'resize') {
    // A resize while a run decodes: the run's frame lands at the new size, not the frame shown before it.
    const screen = document.querySelector('[data-screen]');
    const wrap = document.querySelector('.screen-wrap');
    await shownAt(20);
    const w0 = screen.width;
    let busyAtResize = null;
    const ro = new ResizeObserver(() => { busyAtResize ??= S.stats.busy; });
    ro.observe(screen);
    wrap.style.width = '50%';
    S.seek(39);                                   // ten decodes from the keyframe at 30
    out.ok = await settled(39);
    out.landedEdge = S.edge();
    ro.disconnect();
    out.busyAtResize = busyAtResize;
    out.widths = { before: w0, canvas: screen.width, bitmaps: S.stats.bitmapWidth };
    const h0 = S.stats.cacheHits;
    out.back = await shownAt(37);                 // decoded after the resize: a cache hit at the new width
    out.backHit = S.stats.cacheHits - h0;
  } else if (out.plan === 'stall') {
    // The main thread blocked past the 1 s watchdog while a run decodes: the watchdog flushes the decoder, after which
    // it takes a keyframe first. The film must keep stepping forward through the same group afterwards.
    await shownAt(0);
    const s0 = S.stats.stalls;
    out.tries = 0;
    for (const t of [15, 45, 75, 105]) {
      out.tries++;
      S.seek(t);
      const t0 = performance.now();
      while (performance.now() - t0 < 1200) {}    // a long task: the timer comes due before the outputs are handled
      out.landed = await settled(t);
      if (S.stats.stalls > s0) {
        out.at = t;
        out.next = await shownAt(t + 1);
        out.after = await shownAt(t + 3);
        break;
      }
    }
    out.stalls = S.stats.stalls - s0;
  } else if (out.plan === 'compare') {
    await until(() => st().compare !== null, 20000);
  }
  await new Promise((r) => setTimeout(r, 300));
  const s = st();
  return { ...out, edge: S.edge(), shown: s.shown, target: s.target, mode: s.mode, openFrames: S.stats?.openFrames ?? 0, compare: s.compare };
}

// Runs in Node after the probe: reduced motion turned on and off while the page is open.
export async function inspect(page, state) {
  if (state.name !== 'retier') return null;
  const read = () => page.evaluate(async () => {
    const film = document.querySelector('[data-film]');
    window.scrollTo(0, film.offsetTop + film.offsetHeight * 0.75);
    const st = () => window.__awards.state();
    let last = -1;
    const t0 = performance.now();
    await new Promise((r) => setTimeout(r, 400));
    while (performance.now() - t0 < 8000) {
      const s = st();
      if (s.target === last && s.shown === s.target && !window.__scrub.stats?.busy) break;
      last = s.target;
      await new Promise((r) => setTimeout(r, 50));
    }
    const s = st();
    return { motion: s.motion, mode: s.mode, shown: s.shown, target: s.target, edge: window.__scrub.edge() };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(300);
  const reduced = await read();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(() => window.__awards.state().mode === 'webcodecs', null, { timeout: 15000 }).catch(() => {});
  const full = await read();
  return { reduced, full };
}

export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const pr = (n) => r[n]?.probe || {};
  const out = [];
  const t = st('top'), tp = pr('top');
  out.push({ ok: t.mode === 'webcodecs' && !!t.codec && t.packBytes > 10_000 && tp.edge === 0 && t.canvasAriaHidden, message: `top: ${t.codec} stream of ${Math.round((t.packBytes ?? 0) / 1024)} KB encoded in ${t.encodeMs} ms; the screen shows frame ${tp.edge}` });
  const m = pr('mid');
  out.push({ ok: m.edge === m.target && m.target >= 57 && m.target <= 62 && m.openFrames === 0, message: `mid: frame ${m.edge} on screen for target ${m.target} at half the film; ${m.openFrames} frames left open` });
  const j = pr('jump');
  out.push({ ok: j.okA && j.okB && j.edge === 33 && j.decodes === 4 && j.keySeeks === 1, message: `jump back 95 → 33: frame ${j.edge}, ${j.decodes} decodes from the keyframe at 30 (one seek)` });
  const s = pr('steps');
  out.push({ ok: s.ok && s.edge === 41 && s.forward?.decodes === 10 && s.forward?.sequential === 10, message: `step forward 40 → 50: ${s.forward?.decodes} decodes for 10 frames, ${s.forward?.sequential} sequential` });
  out.push({ ok: s.back?.cacheHits === 9 && s.back?.decodes === 0, message: `step back 50 → 41: ${s.back?.cacheHits} cache hits, ${s.back?.decodes} decodes; frame ${s.edge} on screen` });
  const b = pr('burst');
  out.push({ ok: b.ok && b.edge === 119 && b.decodes <= 12 && b.superseded >= 100, message: `burst of 119 requests in one task: frame ${b.edge}, ${b.decodes} decodes, ${b.superseded} requests superseded` });
  const w = pr('sweep');
  out.push({ ok: w.during >= 5 && w.edge === w.target && w.target === 119 && w.openFrames === 0, message: `scroll sweep over 30 frames of scrolling: ${w.during} frames shown on the way, frame ${w.edge} at the end` });
  const c = pr('compare').compare;
  out.push({ ok: !!c && c.packBytes * 2.5 < c.stillsBytes, message: `the same 120 frames: ${Math.round((c?.stillsBytes ?? 0) / 1024)} KB as WebP stills, ${Math.round((c?.packBytes ?? 0) / 1024)} KB as one stream` });
  const z = pr('resize');
  out.push({ ok: z.ok && z.landedEdge === 39 && z.busyAtResize === true && z.widths?.canvas < z.widths?.before && z.widths?.bitmaps === z.widths?.canvas, message: `resize during a run (busy: ${z.busyAtResize}): frame ${z.landedEdge} for request 39; canvas ${z.widths?.before} → ${z.widths?.canvas} px, bitmaps ${z.widths?.bitmaps} px` });
  out.push({ ok: z.back && z.backHit === 1, message: `after the resize, back to 37: ${z.backHit} cache hit at the new width` });
  const k = pr('stall');
  out.push({ ok: k.stalls >= 1 && k.landed && k.next && k.after && k.edge === k.at + 3 && k.openFrames === 0, message: `main thread blocked 1.2 s during a run (${k.tries} tries): ${k.stalls} watchdog flushes, frame ${k.at} shown, then ${k.next ? 'steps on' : 'stuck'} to ${k.edge}` });
  const rt = r.retier?.inspect || {};
  out.push({ ok: rt.reduced?.motion === 'reduced' && rt.reduced?.mode === 'still' && rt.reduced?.edge === 60, message: `reduced motion turned on while open: ${rt.reduced?.mode}, frame ${rt.reduced?.edge} after scrolling` });
  out.push({ ok: rt.full?.motion === 'full' && rt.full?.mode === 'webcodecs' && rt.full?.edge === rt.full?.target && rt.full?.target > 80, message: `and off again: ${rt.full?.mode}, frame ${rt.full?.edge} for target ${rt.full?.target}` });
  const f = pr('fallback');
  out.push({ ok: st('fallback').mode === 'fallback' && f.edge === f.target && f.target >= 57 && f.target <= 62, message: `no WebCodecs: drawn directly, frame ${f.edge} for target ${f.target}` });
  const rd = st('reduced'), rp = pr('reduced');
  out.push({ ok: rd.motion === 'reduced' && rd.mode === 'still' && rp.edge === 60 && rd.shown === 60, message: `reduced: one still at midday (frame ${rp.edge}) after scrolling to the end` });
  const mb = pr('mobile');
  out.push({ ok: st('mobile').mode === 'webcodecs' && mb.edge === mb.target && mb.target >= 57 && mb.target <= 62, message: `mobile: frame ${mb.edge} for target ${mb.target}` });
  return out;
}
