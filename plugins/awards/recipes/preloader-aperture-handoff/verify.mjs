// __awards.ready flips only once the hero is open, so a fresh load is always judged after the hand-off. To see the
// hand-off itself, the `handoff` and `rm` states press Replay (the same intro() a first visit runs) and the probe samples
// what renders every 40 ms until the phase is open: the computed clip-path of the frame, the media's computed scale, the
// curtain's box and opacity, the root's computed overflow, scrollY, and whether the frame is what paints near the
// bottom-left corner of the viewport (hit-testing honours clip-path).
export const states = [
  { name: 'first', scroll: 0, settle: 300 },
  { name: 'handoff', settle: 0, actions: [{ type: 'click', selector: '[data-replay]' }, { type: 'wheel', dy: 600 }] },
  { name: 'unlocked', settle: 0, actions: [{ type: 'wheel', dy: 600 }, { type: 'wait', ms: 500 }] },
  { name: 'repeat', settle: 0, actions: [{ type: 'reload' }] },
  { name: 'rm', settle: 0, reducedMotion: true, actions: [{ type: 'click', selector: '[data-replay]' }] },
  { name: 'mobile', scroll: 0, viewport: 'mobile', settle: 300 },
];

export async function probe() {
  const html = document.documentElement;
  const frame = document.querySelector('[data-frame]');
  const media = document.querySelector('[data-media]');
  const curtain = document.querySelector('[data-curtain]');
  const inset = (c) => (c === 'none' ? 0 : Number((/inset\(\s*([-\d.]+)/.exec(c) || [])[1] ?? NaN));
  const read = () => {
    const clip = getComputedStyle(frame).clipPath;
    const shown = curtain.checkVisibility();
    const hit = document.elementFromPoint(8, innerHeight - 8);
    return {
      phase: window.__awards.state().phase,
      clip,
      inset: inset(clip),
      scale: Number(new DOMMatrix(getComputedStyle(media).transform).a.toFixed(3)),
      curtainBottom: shown ? Math.round(curtain.getBoundingClientRect().bottom) : null,
      curtainOpacity: shown ? Number(getComputedStyle(curtain).opacity) : 0,
      overflow: getComputedStyle(html).overflowY,
      scrollY: Math.round(scrollY),
      edgeIsFrame: !!hit && frame.contains(hit),
    };
  };
  const samples = [read()];
  const t0 = performance.now();
  while (samples.at(-1).phase !== 'open' && performance.now() - t0 < 6000) {
    await new Promise((r) => setTimeout(r, 40));
    samples.push(read());
  }
  const r = frame.getBoundingClientRect();
  return {
    samples,
    last: samples.at(-1),
    frameRect: [r.left, r.width].map(Math.round),
    vw: html.clientWidth,
    vh: innerHeight,
    overflowX: html.scrollWidth - innerWidth,
    flag: (() => { try { return sessionStorage.getItem('awards:aperture'); } catch { return null; } })(),
  };
}

export function assert(r) {
  const out = [];
  const P = (k) => r[k]?.probe || {};
  const S = (k) => r[k]?.state || {};
  // Judged on the probe's last sample: the state is read before the probe, which may still be mid-hand-off.
  const open = (k) => {
    const l = P(k).last || {};
    return l.phase === 'open' && l.inset === 0 && l.scale === 1 && l.curtainBottom === null && l.overflow !== 'hidden';
  };

  // First visit: the gate opened on its signals (not the ceiling), the aperture ran, and ready came after it.
  const f = S('first');
  out.push({ ok: f.skipped === false && f.mode === 'aperture' && f.fallback === false && ['fonts', 'hero'].every((s) => f.signals?.includes(s)) && f.gateMs < 1500 && open('first') && P('first').flag === '1', message: `first visit: gate on [${f.signals}] in ${f.gateMs} ms (fallback ${f.fallback}), mode ${f.mode}, open after ready (${P('first').last?.clip}), flag ${P('first').flag}` });

  // The verify idea: mid-hand-off the frame's computed inset is between its start (30 %) and 0, and the frame really is
  // clipped there (the viewport's corner paints something else while the curtain is already gone); after, it is 0.
  const h = P('handoff').samples || [];
  const during = h.filter((s) => s.phase !== 'open');
  const mid = during.filter((s) => s.inset > 1 && s.inset < 29);
  const clippedCorner = mid.some((s) => s.inset > 10 && s.curtainBottom !== null && s.curtainBottom < P('handoff').vh - 20 && !s.edgeIsFrame);
  const midScale = during.some((s) => s.scale > 0.62 && s.scale < 0.98);
  out.push({ ok: during.length >= 5 && Math.abs(during[0].inset - 30) < 0.5 && mid.length >= 3 && clippedCorner && midScale && open('handoff') && P('handoff').last.edgeIsFrame, message: `hand-off: start inset ${during[0]?.inset}, ${mid.length} of ${during.length} samples mid-way (${mid.map((s) => s.inset.toFixed(1)).slice(0, 6).join(', ')}…), corner clipped ${clippedCorner}, media scaling ${midScale}, after: ${P('handoff').last?.clip} / scale ${P('handoff').last?.scale}` });

  // Scroll lock: the root is overflow hidden for the whole gate and hand-off, and a wheel during it moved nothing.
  out.push({ ok: during.length > 0 && during.every((s) => s.overflow === 'hidden' && s.scrollY === 0) && P('handoff').last?.overflow !== 'hidden', message: `scroll locked during the hand-off (${during.map((s) => s.overflow).filter((o, i, a) => a.indexOf(o) === i)}, max scrollY ${Math.max(...during.map((s) => s.scrollY))}), unlocked after (${P('handoff').last?.overflow})` });
  out.push({ ok: open('unlocked') && P('unlocked').last.scrollY > 100, message: `after the hand-off a wheel scrolls the page (scrollY ${P('unlocked').last?.scrollY})` });

  // Repeat visit in the same session: no gate, no hand-off, the open hero from the first sample.
  const rp = S('repeat'), rs = P('repeat').samples || [];
  out.push({ ok: rp.skipped === true && rp.runs === 0 && rp.mode === 'none' && rs.length === 1 && open('repeat'), message: `repeat visit skips to the open hero (skipped ${rp.skipped}, runs ${rp.runs}, ${rs.length} sample, ${P('repeat').last?.clip})` });

  // Reduced motion: a fade only. The curtain's opacity passes through mid values; the frame is never clipped or scaled.
  const rm = S('rm'), rd = (P('rm').samples || []).filter((s) => s.phase !== 'open');
  out.push({ ok: rm.motion === 'reduced' && rm.mode === 'fade' && rd.length >= 3 && rd.every((s) => s.inset === 0 && s.scale === 1) && rd.some((s) => s.curtainOpacity > 0.05 && s.curtainOpacity < 0.95) && open('rm'), message: `reduced motion: mode ${rm.mode}, ${rd.length} samples, insets [${[...new Set(rd.map((s) => s.inset))]}], scales [${[...new Set(rd.map((s) => s.scale))]}], opacities ${rd.map((s) => s.curtainOpacity.toFixed(2)).slice(0, 8).join(' ')}` });

  // Mobile: the same hand-off on first load; open, full width, nothing overflows.
  const m = S('mobile'), mp = P('mobile');
  out.push({ ok: m.skipped === false && m.mode === 'aperture' && open('mobile') && mp.frameRect?.[0] === 0 && mp.frameRect?.[1] === mp.vw && mp.overflowX <= 0, message: `mobile: mode ${m.mode}, open, frame ${mp.frameRect} of ${mp.vw}, overflow ${mp.overflowX}px` });
  return out;
}
