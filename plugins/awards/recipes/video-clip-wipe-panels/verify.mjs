// The probe samples what renders on every animation frame until the change has settled: each layer's computed
// visibility, opacity and clip-path inset, the seam's rendered left edge and opacity, and which layer the hit test
// finds at five x positions (clip-path clips hit testing, so this reads the painted split, not an attribute).
const settled = { type: 'waitFor', fn: '!window.__awards.state().transitioning' };
const wheel = (dy, ms = 40) => [{ type: 'wheel', dx: 0, dy }, { type: 'wait', ms }];
// A synthetic finger drag on the deck (touch events, as Observer listens for them on a touch device).
const swipe = (dy) => ({
  type: 'waitFor',
  fn: `((dy) => {
    const t = document.querySelector('[data-deck]');
    const at = (y) => new Touch({ identifier: 1, target: t, clientX: innerWidth / 2, clientY: y });
    const fire = (type, y, list) => t.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: list ? [at(y)] : [], changedTouches: [at(y)] }));
    const y0 = innerHeight * 0.6;
    fire('touchstart', y0, true);
    for (let i = 1; i <= 6; i++) fire('touchmove', y0 + (dy * i) / 6, true);
    fire('touchend', y0 + dy, false);
    return true;
  })(${dy})`,
});

export const states = [
  { name: 'rest', settle: 400 },
  // Forward: the probe starts sampling right after the key, so it sees the whole wipe.
  { name: 'wipe', settle: 300, actions: [{ type: 'press', key: 'ArrowRight' }] },
  // Backwards from panel 2: the gate opens right → left.
  { name: 'back', settle: 300, actions: [{ type: 'press', key: 'ArrowRight' }, settled, { type: 'wait', ms: 100 }, { type: 'press', key: 'ArrowLeft' }] },
  // Four wheel inputs inside the lock: exactly one step.
  { name: 'wheel', settle: 300, actions: [...wheel(120), ...wheel(120), ...wheel(120), ...wheel(120, 0), settled] },
  { name: 'keys', settle: 300, actions: [{ type: 'press', key: 'End' }, settled] },
  { name: 'hook', scroll: 1, settle: 200 },
  { name: 'rm', reducedMotion: true, settle: 300, actions: [{ type: 'click', selector: '[data-next]' }] },
  { name: 'mobile', viewport: 'mobile', settle: 300, actions: [swipe(-140)] },
];

export async function probe() {
  const layers = [...document.querySelectorAll('[data-layer]')];
  const seam = document.querySelector('[data-seam]');
  const W = innerWidth, y = Math.round(innerHeight * 0.3);
  const xs = [0.1, 0.3, 0.5, 0.7, 0.9].map((f) => Math.round(W * f));
  // Computed clip-path "inset(a b c d)" in % of the width (1–4 values, px converted); null when none.
  const inset = (el) => {
    const m = getComputedStyle(el).clipPath.match(/^inset\(([^)]*)\)$/);
    if (!m) return null;
    const v = m[1].split(/\s+/).map((tok) => (tok.endsWith('%') ? parseFloat(tok) : (parseFloat(tok) / W) * 100));
    const [t, r = t, b = t, l = r] = v;
    return [t, r, b, l].map((n) => Math.round(n * 1000) / 1000);
  };
  const read = (t0) => {
    const s = window.__awards.state();
    const out = { t: Math.round(performance.now() - t0), index: s.index, tr: s.transitioning, front: s.front };
    for (const el of layers) {
      const cs = getComputedStyle(el);
      out[el.dataset.layer] = { vis: cs.visibility === 'visible', op: Math.round(parseFloat(cs.opacity) * 1000) / 1000, inset: inset(el), src: el.dataset.src };
    }
    out.seamX = Math.round(seam.getBoundingClientRect().left * 100) / 100;
    out.seamOp = Math.round(parseFloat(getComputedStyle(seam).opacity) * 1000) / 1000;
    out.hits = xs.map((x) => document.elementsFromPoint(x, y).find((el) => el.matches('[data-layer]'))?.dataset.layer ?? null);
    out.frames = s.layers.map((l) => l.frames);
    return out;
  };
  const samples = [];
  const t0 = performance.now();
  let calm = 0;
  while (performance.now() - t0 < 8000) {
    samples.push(read(t0));
    calm = window.__awards.state().transitioning ? 0 : calm + 1;
    if (calm > 8) break;
    await new Promise((r) => requestAnimationFrame(r));
  }
  const ctl = document.querySelector('[data-controls]').getBoundingClientRect();
  return {
    W, xs, samples,
    overflowX: document.documentElement.scrollWidth - innerWidth,
    scrollable: document.documentElement.scrollHeight - innerHeight,
    controlsInView: ctl.top >= 0 && ctl.bottom <= innerHeight + 1 && ctl.height > 0,
    reachable: [...document.querySelectorAll('.panel')].filter((p) => !p.inert).length,
    keyHeights: [...document.querySelectorAll('.key')].map((k) => Math.round(k.getBoundingClientRect().height)),
  };
}

// Mid-wipe frames of one change: the incoming layer (the one that is not front on the first sample) is painted
// and its opening inset sits strictly between 100 % and 0.
function wipeFrames(p, forward) {
  const s = p?.samples || [];
  const inc = s[0]?.front === 'a' ? 'b' : 'a', out = inc === 'a' ? 'b' : 'a';
  const side = forward ? 1 : 3;   // right inset going forward, left inset going back
  const mid = s.filter((x) => x[inc].vis && x[inc].inset && x[inc].inset[side] > 0.5 && x[inc].inset[side] < 99.5);
  const edge = (x) => (forward ? p.W * (1 - x[inc].inset[1] / 100) : (p.W * x[inc].inset[3]) / 100);
  return { s, mid, inc, out, side, edge };
}

function wipeChecks(label, p, forward, minMid, last) {
  const out = [];
  const { s, mid, inc, out: old, side, edge } = wipeFrames(p, forward);
  const insets = mid.map((x) => x[inc].inset[side]);
  const monotonic = insets.every((v, i) => i === 0 || v <= insets[i - 1] + 1e-6);
  const other = mid.every((x) => x[inc].inset[forward ? 3 : 1] === 0);
  out.push({ ok: mid.length >= minMid && monotonic && other, message: `${label}: ${mid.length} mid-wipe frames with the incoming ${forward ? 'right' : 'left'} inset between 100 % and 0, only closing (${insets.length ? `${insets[0]} → ${insets.at(-1)} %` : 'none'})` });
  const drift = mid.map((x) => Math.abs(x.seamX - edge(x)));
  const core = mid.filter((x) => x[inc].inset[side] > 10 && x[inc].inset[side] < 90);
  out.push({ ok: mid.length > 0 && Math.max(...drift) <= 1.5 && core.length > 0 && core.every((x) => x.seamOp > 0.5), message: `${label}: the seam's left edge tracks the clip edge (max drift ${drift.length ? Math.max(...drift).toFixed(2) : '–'} px) and glows mid-wipe (opacity ${core.length ? Math.min(...core.map((x) => x.seamOp)) : '–'})` });
  // Hit test either side of the edge: the opened side is the incoming layer, the rest is still the outgoing one.
  let bad = 0, tested = 0;
  for (const x of mid) p.xs.forEach((px, i) => {
    const e = edge(x);
    if (Math.abs(px - e) < 4) return;
    const opened = forward ? px < e : px > e;
    tested++; if (x.hits[i] !== (opened ? inc : old)) bad++;
  });
  out.push({ ok: tested > 0 && bad === 0, message: `${label}: elementsFromPoint finds the incoming layer on the opened side and the outgoing one beyond the edge (${tested - bad}/${tested} points)` });
  const end = s.at(-1) || {};
  out.push({ ok: !end.tr && end.index === last.index && end.hits?.every((h) => h === inc) && end[old] && !end[old].vis && end[inc]?.inset === null && end.seamOp === 0, message: `${label}: after the wipe only layer ${inc} paints (hits ${end.hits?.join('')}), ${old} is hidden, no clip left, seam out` });
  out.push({ ok: end[old]?.src === last.preload, message: `${label}: the hidden layer already holds the next clip (${end[old]?.src}, want ${last.preload})` });
  return out;
}

export function assert(r) {
  const out = [];
  const P = (k) => r[k]?.probe;
  const errs = Object.entries(r).flatMap(([k, v]) => (v.errors || []).map((e) => `${k}: ${e}`));
  out.push({ ok: errs.length === 0, message: `no page errors${errs.length ? ` (${errs.slice(0, 3).join('; ')})` : ''}` });

  // At rest: one layer paints everywhere, the other is hidden with panel 2's clip already loaded; the front clip plays.
  const rest = P('rest')?.samples || [];
  const r0 = rest.at(-1) || {};
  out.push({ ok: rest.length > 0 && r0.hits?.every((h) => h === 'a') && r0.b && !r0.b.vis && r0.a.src === '01' && r0.b.src === '02', message: `rest: layer a paints clip ${r0.a?.src} at every point, layer b is hidden holding ${r0.b?.src}` });
  out.push({ ok: rest.length > 1 && rest.at(-1).frames[0] > rest[0].frames[0] && rest.at(-1).frames[1] === 0, message: `rest: the front clip plays (frames ${rest[0]?.frames?.[0]} → ${r0.frames?.[0]}), the hidden one stays parked` });

  out.push(...wipeChecks('forward', P('wipe'), true, 5, { index: 1, preload: '03' }));
  out.push({ ok: r.wipe?.state?.hits === 1 && r.wipe?.state?.misses === 0, message: `forward: the incoming clip was preloaded before the wipe (hits ${r.wipe?.state?.hits}, misses ${r.wipe?.state?.misses})` });
  out.push(...wipeChecks('back', P('back'), false, 5, { index: 0, preload: '02' }));

  out.push({ ok: r.wheel?.state?.index === 1 && r.wheel?.state?.switches === 1, message: `four wheel inputs inside the lock step exactly once (index ${r.wheel?.state?.index}, switches ${r.wheel?.state?.switches})` });
  const k = r.keys?.state || {}, kEnd = P('keys')?.samples?.at(-1) || {};
  out.push({ ok: k.index === 3 && P('keys')?.reachable === 1 && kEnd.hits?.every((h) => h === kEnd.front) && kEnd[kEnd.front]?.src === '04' && /Panel 4 of 4/.test(k.live || ''), message: `End reaches panel 4 (clip ${kEnd[kEnd.front]?.src}); only it is reachable; announced "${k.live}"` });
  const h = P('hook')?.samples || [];
  out.push({ ok: h.length > 0 && h.every((x) => !x.tr && x.index === 3) && h[0][h[0].front]?.src === '04', message: '__awards.scrollTo(1) shows panel 4 with no wipe' });

  // Reduced motion: no clip, no seam, a short cross-fade, clips parked on their first frame.
  const rm = P('rm')?.samples || [];
  const rmEnd = rm.at(-1) || {};
  const inc = rm[0]?.front === 'a' ? 'b' : 'a';
  const fading = rm.filter((x) => x[inc].vis && x[inc].op > 0.02 && x[inc].op < 0.98);
  out.push({ ok: r.rm?.state?.motion === 'reduced' && rm.length > 0 && rm.every((x) => x.a.inset === null && x.b.inset === null && x.seamOp === 0), message: 'reduced motion: no clip-path and no seam on any frame' });
  out.push({ ok: fading.length >= 1 && rmEnd.index === 1 && rmEnd.hits?.every((h2) => h2 === inc) && !rmEnd[inc === 'a' ? 'b' : 'a'].vis, message: `reduced motion: the incoming layer cross-fades (${fading.length} frames between 0 and 1) and ends alone` });
  out.push({ ok: (r.rm?.state?.layers || []).every((l) => l.frames === 0), message: 'reduced motion: the clips rest on their first frame (no playback frames)' });

  // Mobile: a swipe runs the same wipe; controls fit, no overflow.
  out.push(...wipeChecks('mobile', P('mobile'), true, 3, { index: 1, preload: '03' }));
  const m = P('mobile') || {};
  out.push({ ok: m.controlsInView && (m.overflowX ?? 1) <= 0 && m.scrollable <= 0 && m.keyHeights?.every((x) => x >= 44), message: `mobile: controls in view, keys ${m.keyHeights?.join('/')} px tall, overflow ${m.overflowX} px` });
  return out;
}
