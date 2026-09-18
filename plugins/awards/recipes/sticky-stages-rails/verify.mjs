export const states = [
  { name: 'top', scroll: 0, settle: 800 },
  { name: 'hinge', scroll: 0.12, settle: 900 },
  { name: 'mid', scroll: 0.5, settle: 900 },
  { name: 'end', scroll: 1, settle: 900 },
  { name: 'rm', scroll: 0.12, reducedMotion: true, settle: 900 },
  { name: 'mobile', scroll: 0.5, viewport: 'mobile', settle: 900 },
];
export function probe() {
  const cards = [...document.querySelectorAll('[data-stage]')].map((c) => ({ opacity: Number(getComputedStyle(c).opacity), transform: getComputedStyle(c).transform }));
  return { cards };
}
export function assert(r) {
  const out = [];
  out.push({ ok: Math.abs(r.top.state?.panelRotation ?? 1) < 0.5, message: `panel flat at top (${r.top.state?.panelRotation})` });
  out.push({ ok: (r.hinge.state?.panelRotation ?? 0) < -2, message: `panel hinged part-way through the hero rail (${r.hinge.state?.panelRotation})` });
  out.push({ ok: Math.abs(r.hinge.state?.childRotation ?? 0) > Math.abs(r.hinge.state?.panelRotation ?? 0), message: `child rotates harder than the panel (${r.hinge.state?.childRotation} vs ${r.hinge.state?.panelRotation})` });
  out.push({ ok: (r.end.state?.panelRotation ?? 0) <= -14.5, message: `panel reaches −15° by the end of its rail (${r.end.state?.panelRotation})` });
  out.push({ ok: (r.mid.state?.stages ?? 0) > 0.05 && (r.mid.state?.stages ?? 0) < 0.95, message: `stages rail mid-way at mid (${r.mid.state?.stages})` });
  const midOpac = r.mid.probe?.cards?.map((c) => c.opacity) || [];
  out.push({ ok: midOpac.some((o) => o > 0.9) && midOpac.some((o) => o < 0.5), message: `one stage active, others faded at mid (${midOpac.map((o) => o.toFixed(2)).join(', ')})` });
  out.push({ ok: (r.top.state?.pinned ?? 1) === 0, message: 'no ScrollTrigger uses pin: true' });
  out.push({ ok: r.rm.state?.motion === 'reduced' && Math.abs(r.rm.state?.panelRotation ?? 1) < 0.01 && (r.rm.probe?.cards || []).every((c) => c.opacity === 1), message: 'reduced motion: no hinge, all stages readable' });
  out.push({ ok: (r.mobile.state?.stages ?? 0) > 0.05, message: `mobile stages rail tracks progress (${r.mobile.state?.stages})` });
  return out;
}
