// Pin the clock so the frame is reproducible, then let one frame settle.
const freeze = (t) => [{ type: 'waitFor', fn: `window.__stripes?.freeze(${t}) === true` }, { type: 'wait', ms: 150 }];

export const states = [
  { name: 'still', settle: 400, actions: freeze(2) },
  { name: 'live', settle: 600 },
  { name: 'reduced', reducedMotion: true, settle: 400 },
  { name: 'mobile', viewport: 'mobile', settle: 400, actions: freeze(2) },
];

// In-page: the clock read two frames apart.
export async function probe() {
  const t0 = window.__stripes?.time?.();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));
  return { t0, t1: window.__stripes?.time?.() };
}

// Sub-pixel positions where a channel crosses the midpoint of its own range, inside the slab (central 70 % of the row).
function crossings(row) {
  const a = Math.floor(row.length * 0.15), z = Math.floor(row.length * 0.85);
  const seg = row.slice(a, z);
  const lo = Math.min(...seg), hi = Math.max(...seg), mid = (lo + hi) / 2;
  const xs = [];
  for (let i = a; i < z - 1; i++) if ((row[i] - mid) * (row[i + 1] - mid) < 0) xs.push(i + (mid - row[i]) / (row[i + 1] - row[i]));
  return { xs, lo, hi };
}

// The key check: R and B edges sit apart (dispersion), each edge is a ramp not a step (fwidth AA), no row is solid (zero guard + silhouette).
function stripes(s) {
  if (!s?.r?.length) return { ok: false, msg: 'no samples' };
  const R = crossings(s.r), B = crossings(s.b);
  const offsets = R.xs.map((x) => Math.min(...B.xs.map((y) => Math.abs(x - y))));
  const minOffset = offsets.length ? Math.min(...offsets) : 0;
  const x0 = Math.round(R.xs[0] ?? 0), band = (R.hi - R.lo) * 0.1;
  const ramp = s.r.slice(Math.max(0, x0 - 10), x0 + 11).filter((v) => v > R.lo + band && v < R.hi - band).length;
  const ok = R.xs.length >= 2 && B.xs.length >= 2 && minOffset >= 1 && ramp >= 3 && R.hi - R.lo > 80 && s.opaqueRows === 0 && s.midAlpha === 255;
  return { ok, msg: `${R.xs.length} R / ${B.xs.length} B edges, min R→B offset ${minOffset.toFixed(2)} px, ${ramp} intermediate values at the first edge, R range ${R.lo}–${R.hi}, ${s.opaqueRows} fully opaque rows, centre alpha ${s.midAlpha}` };
}

export function assert(r) {
  const out = [];
  const st = r.still.state || {};
  const a = stripes(st.samples);
  out.push({ ok: st.gl === true && st.canvasAriaHidden === true && st.frozen === true && a.ok, message: `still: ${a.msg}` });
  const lv = r.live.state || {}, lp = r.live.probe || {};
  out.push({ ok: lv.motion === 'full' && lv.running === true && lp.t1 > lp.t0, message: `live: clock runs on the ticker (${lp.t0} → ${lp.t1})` });
  const rm = r.reduced.state || {}, rp = r.reduced.probe || {};
  const rs = stripes(rm.samples);
  out.push({ ok: rm.motion === 'reduced' && rm.running === false && rp.t0 === rp.t1 && rs.ok, message: `reduced: time frozen across frames (${rp.t0} → ${rp.t1}), still frame valid: ${rs.msg}` });
  const m = r.mobile.state || {};
  const ms = stripes(m.samples);
  out.push({ ok: m.gl === true && m.size?.[1] > m.size?.[0] * 0.9 && ms.ok, message: `mobile: ${m.size?.join('×')} stage, ${ms.msg}` });
  return out;
}
