export const states = [
  { name: 'top', scroll: 0, settle: 800 },
  { name: 'mid', scroll: 0.5, settle: 900 },
  { name: 'end', scroll: 1, settle: 900 },
  { name: 'rm', scroll: 0, reducedMotion: true, settle: 500 },
  { name: 'mobile', scroll: 1, viewport: 'mobile', settle: 900 },
];
export function assert(r) {
  const out = [];
  const L = r.top.state?.length ?? 0;
  out.push({ ok: L > 1000 && Math.abs((r.top.state?.dashoffset ?? 0) - L) < 5, message: `undrawn at the top (offset ${r.top.state?.dashoffset} of ${L})` });
  out.push({ ok: (r.mid.state?.dashoffset ?? 0) > 50 && (r.mid.state?.dashoffset ?? L) < L - 50, message: `partly drawn at mid (offset ${r.mid.state?.dashoffset})` });
  out.push({ ok: Math.abs(r.end.state?.dashoffset ?? 99) < 3, message: `fully drawn at the end (offset ${r.end.state?.dashoffset})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && Math.abs(r.rm.state?.dashoffset ?? 99) < 1, message: 'reduced motion: complete from the start' });
  out.push({ ok: Math.abs(r.mobile.state?.dashoffset ?? 99) < 3, message: 'mobile: drawn at the end' });
  return out;
}
