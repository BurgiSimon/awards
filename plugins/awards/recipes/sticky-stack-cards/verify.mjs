export const states = [
  { name: 'top', scroll: 0, settle: 800 },
  { name: 'mid', scroll: 0.5, settle: 900 },
  { name: 'end', scroll: 1, settle: 900 },
  { name: 'rm', scroll: 0.5, reducedMotion: true, settle: 600 },
  { name: 'mobile', scroll: 0.5, viewport: 'mobile', settle: 900 },
];
export function assert(r) {
  const out = [];
  out.push({ ok: (r.top.state?.scales || []).every((s) => s === 1), message: 'all cards at scale 1 at the top' });
  out.push({ ok: (r.mid.state?.scales?.[0] ?? 1) < 0.95 && (r.mid.state?.opacities?.[0] ?? 1) < 0.9, message: `first card settled beneath the stack at mid (scale ${r.mid.state?.scales?.[0]}, opacity ${r.mid.state?.opacities?.[0]})` });
  out.push({ ok: (r.end.state?.scales?.[2] ?? 1) < 0.95 && (r.end.state?.scales?.[3] ?? 0) === 1, message: `at the end the last card is on top, the others settled (${(r.end.state?.scales || []).join(', ')})` });
  out.push({ ok: (r.top.state?.pinned ?? 1) === 0, message: 'sticky, not pinned' });
  out.push({ ok: r.rm.state?.motion === 'reduced' && (r.rm.state?.scales || []).every((s) => s === 1) && (r.rm.state?.opacities || []).every((o) => o === 1), message: 'reduced motion: cards plain and readable' });
  out.push({ ok: (r.mobile.state?.scales?.[0] ?? 1) < 0.95, message: 'mobile stacks' });
  return out;
}
