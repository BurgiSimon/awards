export const states = [
  { name: 'top', settle: 1200 },
  { name: 'mid', actions: [{ type: 'click', selector: '[data-next]' }, { type: 'wait', ms: 350 }], settle: 50 },
  { name: 'after', actions: [{ type: 'click', selector: '[data-next]' }, { type: 'wait', ms: 1600 }], settle: 100 },
  { name: 'keys', actions: [{ type: 'press', key: 'ArrowRight' }, { type: 'wait', ms: 1500 }, { type: 'press', key: 'ArrowRight' }, { type: 'wait', ms: 1500 }], settle: 100 },
  { name: 'rm', reducedMotion: true, actions: [{ type: 'click', selector: '[data-next]' }, { type: 'wait', ms: 150 }], settle: 50 },
  { name: 'mobile', viewport: 'mobile', settle: 1200 },
];
const dist = (a, b) => (a && b ? Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) : 0);
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.gl === true && r.top.state?.section === 0 && /Ember/.test(r.top.state?.readout || ''), message: 'section 1 rendered at rest' });
  out.push({ ok: r.mid.state?.transitioning === true && (r.mid.state?.progress ?? 1) > 0.05 && (r.mid.state?.progress ?? 1) < 0.95, message: `mid-transition frame captured (progress ${r.mid.state?.progress})` });
  out.push({ ok: r.after.state?.section === 1 && r.after.state?.transitioning === false && /Tide/.test(r.after.state?.readout || ''), message: 'transition completes on the next section' });
  out.push({ ok: dist(r.top.state?.cornerPixel, r.after.state?.cornerPixel) > 30, message: `the corner changes ground colour between sections (Δ ${dist(r.top.state?.cornerPixel, r.after.state?.cornerPixel)})` });
  out.push({ ok: dist(r.top.state?.cornerPixel, r.mid.state?.cornerPixel) > 5 || dist(r.after.state?.cornerPixel, r.mid.state?.cornerPixel) > 5, message: 'the mid frame is a blend, not a cut' });
  out.push({ ok: r.keys.state?.section === 2, message: `arrow keys switch sections (${r.keys.state?.section})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.section === 1 && r.rm.state?.transitioning === false, message: 'reduced motion: instant swap' });
  out.push({ ok: r.mobile.state?.gl === true, message: 'mobile renders' });
  return out;
}
