export const states = [
  { name: 'top', scroll: 0, settle: 800 },
  { name: 'band', settle: 600 },
  { name: 'window', settle: 600 },
  // One large wheel delta: Lenis carries the raw scroll far ahead, the clock may only follow at the cap.
  { name: 'flick', actions: [{ type: 'move', x: 700, y: 450, steps: 1 }, { type: 'wheel', dy: 4000 }, { type: 'wait', ms: 400 }], settle: 600 },
  { name: 'rm', scroll: 0.33, reducedMotion: true, settle: 600 },
  { name: 'mobile', scroll: 0.7, viewport: 'mobile', settle: 800 },
];

// Node-side, on the live page: real scrolls through Lenis, read back after the ticker has run.
export async function inspect(page, st) {
  if (st.name === 'band') {
    return page.evaluate(async () => {
      const f = window.__film;
      const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const at = async (y) => { window.lenis.scrollTo(y, { immediate: true, force: true }); await frames(); return f.read().target; };
      // Progress change per 100 px of scroll, around a progress point (± 200 px, divided by 4).
      const per100 = async (p) => { const y = f.filmTop() + f.progressToRaw(p) * f.trackPx(); return ((await at(y + 200)) - (await at(y - 200))) / 4; };
      const band = f.BANDS[0];
      const inside = await per100((band.from + band.to) / 2);
      const outside = await per100(0.1);
      return { inside, outside, factor: band.factor, ratio: outside / inside };
    });
  }
  if (st.name === 'window') {
    return page.evaluate(async () => {
      const f = window.__film;
      const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const enabledAt = async (p) => { f.seek(p); await frames(); return f.read().enabled; };
      const rows = [];
      for (let n = 0; n < f.SEGMENTS.length - 1; n++) {
        const s = f.SEGMENTS[n], half = (s.from + s.to) / 2;
        const before = await enabledAt(half - 0.01), after = await enabledAt(half + 0.01);
        rows.push({ n, half, preloadAt: f.preloadAt(n + 1), nextBefore: before[n + 1], nextAfter: after[n + 1], count: after.filter(Boolean).length });
      }
      // The override: Core (2) stays on until .75, a quarter past where the default would drop it.
      const keep = await enabledAt(0.74), gone = await enabledAt(0.76);
      return { rows, overrideKept: keep[2], overrideDropped: !gone[2] };
    });
  }
  return null;
}

export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.gl === true && r.top.state?.shown === 0 && r.top.state?.enabled?.join() === '0', message: `film at 0 with only the first window on (${r.top.state?.enabled})` });
  const b = r.band.inspect || {};
  out.push({ ok: Math.abs((b.ratio ?? 0) / (b.factor ?? 1) - 1) <= 0.05, message: `stretch band: progress per 100 px outside / inside = ${b.ratio?.toFixed(3)} against factor ${b.factor} (± 5 %)` });
  const w = r.window.inspect || {};
  const rows = w.rows || [];
  out.push({ ok: rows.length === 4 && rows.every((x) => x.preloadAt === x.half && x.nextBefore === false && x.nextAfter === true), message: `segment n+1 switches on only past half of n (${rows.map((x) => `${x.n}:${x.nextBefore ? 1 : 0}${x.nextAfter ? 1 : 0}`).join(' ')})` });
  out.push({ ok: rows.every((x) => x.count <= 3), message: 'never more than three windows on at once' });
  out.push({ ok: w.overrideKept === true && w.overrideDropped === true, message: 'per-window dropPrevAt override holds the Core window to .75' });
  const f = r.flick.state || {};
  // ≤ 1: the clock never moved more than K × dt / duration in any frame. ≈ 1 and a lead: the cap was what held it.
  out.push({ ok: f.maxRatio <= 1.0001 && f.maxRatio > 0.99 && f.lead > 0.05, message: `flick: clock step / cap max ${f.maxRatio}, target leads the clock by ${f.lead}` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.shown === 0.3, message: `reduced motion: one settled frame per beat (shown ${r.rm.state?.shown} for target ${r.rm.state?.target})` });
  out.push({ ok: r.mobile.state?.gl === true && Math.abs((r.mobile.state?.shown ?? 0) - 0.7) < 0.01 && r.mobile.state?.enabled?.includes(3), message: `mobile renders the Fold window (${r.mobile.state?.enabled})` });
  return out;
}
