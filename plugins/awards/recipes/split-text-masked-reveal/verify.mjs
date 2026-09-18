export const states = [
  { name: 'top', scroll: 0, settle: 2600 },
  { name: 'end', scroll: 1, settle: 2200 },
  { name: 'rm', scroll: 0, reducedMotion: true, settle: 900 },
  { name: 'mobile', scroll: 0, viewport: 'mobile', settle: 2600 },
];
export function probe() {
  const first = document.querySelector('#t .line') || document.querySelector('#t');
  const cs = getComputedStyle(first);
  const h1 = document.querySelector('#t');
  return { firstLineOpacity: Number(cs.opacity), firstLineTransform: cs.transform, h1Text: h1.textContent.trim().length, h1Lines: h1.querySelectorAll('.line').length, hasMask: !!h1.querySelector('[style*="overflow"], .line-mask') };
}
const ty = (t) => { const m = /matrix\([^)]*,\s*([-\d.]+)\)$/.exec(t || ''); return m ? Math.abs(Number(m[1])) : 0; };
export function assert(r) {
  const out = [];
  out.push({ ok: (r.top.state?.splitCount ?? 0) >= 4, message: `text elements split after fonts (${r.top.state?.splitCount})` });
  out.push({ ok: (r.top.probe?.h1Lines ?? 0) >= 2, message: `headline split into lines (${r.top.probe?.h1Lines})` });
  out.push({ ok: r.top.probe?.hasMask === true, message: 'lines are wrapped in overflow masks' });
  out.push({ ok: r.top.probe?.firstLineOpacity === 1 && ty(r.top.probe?.firstLineTransform) < 1, message: `first line settled after the reveal (${r.top.probe?.firstLineTransform})` });
  out.push({ ok: (r.top.state?.revealed ?? 0) >= 2, message: `above-the-fold reveals completed (${r.top.state?.revealed})` });
  out.push({ ok: (r.end.state?.revealed ?? 0) >= 4, message: `below-the-fold reveals fired on entry (${r.end.state?.revealed})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && (r.rm.probe?.h1Lines ?? 1) === 0 && r.rm.probe?.firstLineOpacity === 1, message: 'reduced motion: no split, text visible' });
  out.push({ ok: (r.mobile.probe?.h1Lines ?? 0) >= 2 && r.mobile.probe?.firstLineOpacity === 1, message: `mobile split and settled (${r.mobile.probe?.h1Lines} lines)` });
  return out;
}
