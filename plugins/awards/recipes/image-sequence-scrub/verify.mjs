export const states = [
  { name: 'top', scroll: 0, settle: 800 },
  { name: 'mid', scroll: 0.5, settle: 900 },
  { name: 'end', scroll: 1, settle: 900 },
  { name: 'rm', scroll: 0.5, reducedMotion: true, settle: 600 },
  { name: 'mobile', scroll: 0.5, viewport: 'mobile', settle: 900 },
];
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.ready === true && r.top.state?.loaded === 48, message: `all frames decoded before the scrub arms (${r.top.state?.loaded})` });
  out.push({ ok: r.top.state?.frame === 0, message: 'first frame at the top' });
  out.push({ ok: (r.mid.state?.frame ?? 0) > 5 && (r.mid.state?.frame ?? 99) < 45, message: `frame follows the scroll at mid (${r.mid.state?.frame})` });
  out.push({ ok: (r.end.state?.frame ?? 0) >= 44, message: `last frames at the end (${r.end.state?.frame})` });
  out.push({ ok: r.top.state?.posterInDom === true && r.top.state?.canvasAriaHidden === true, message: 'poster image with alt stays in the DOM; canvas aria-hidden' });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.frame === 24 && (r.rm.state?.progress ?? 1) === 0, message: 'reduced motion: one static frame, no scrub' });
  out.push({ ok: (r.mobile.state?.frame ?? 0) > 5, message: 'mobile scrubs' });
  return out;
}
