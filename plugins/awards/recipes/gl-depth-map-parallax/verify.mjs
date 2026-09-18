export const states = [
  { name: 'top', actions: [{ type: 'move', x: 720, y: 450, steps: 1 }, { type: 'wait', ms: 900 }], settle: 100 },
  { name: 'left', actions: [{ type: 'move', x: 60, y: 450, steps: 2 }, { type: 'wait', ms: 900 }], settle: 100 },
  { name: 'right', actions: [{ type: 'move', x: 1380, y: 450, steps: 2 }, { type: 'wait', ms: 900 }], settle: 100 },
  { name: 'rm', reducedMotion: true, settle: 600 },
  { name: 'mobile', viewport: 'mobile', settle: 1200 },
];
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.gl === true && r.top.state?.stillVisibility === 'hidden', message: 'WebGL relief rendered over the still' });
  out.push({ ok: (r.left.state?.offset?.[0] ?? 0) < -0.7 && (r.right.state?.offset?.[0] ?? 0) > 0.7, message: `offset follows the pointer (${r.left.state?.offset?.[0]} → ${r.right.state?.offset?.[0]})` });
  const a = r.left.state?.edgePixel || [], b = r.right.state?.edgePixel || [];
  const diff = a.length && b.length ? Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) : 0;
  out.push({ ok: diff > 20, message: `near layer shifts over the far layer between pointer positions (Δrgb ${diff})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.gl === false && r.rm.state?.stillVisibility === 'visible', message: 'reduced motion: the still image' });
  out.push({ ok: r.mobile.state?.gl === true, message: 'mobile renders' });
  return out;
}
