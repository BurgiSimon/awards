export const states = [
  { name: 'top', settle: 1200 },
  // Sampling a frame mid-transition is inherently wall-clock bound; it cannot be awaited on state,
  // because the value it is looking for stops existing the moment a stalled rAF resumes past it.
  { name: 'mid', actions: [{ type: 'click', selector: '[data-next]' }, { type: 'wait', ms: 350 }], settle: 50 },
  { name: 'after', actions: [{ type: 'click', selector: '[data-next]' }, { type: 'waitFor', fn: 'window.__awards.state().section === 1 && !window.__awards.state().transitioning' }], settle: 100 },
  // The second press lands mid-transition on purpose: a relative step taken from the outgoing
  // section queues the section already on its way and is swallowed. Both switches are then awaited
  // on the page's own state, because SwiftShader can stall rAF for seconds on a first shader compile.
  { name: 'keys', actions: [{ type: 'press', key: 'ArrowRight' }, { type: 'wait', ms: 120 }, { type: 'press', key: 'ArrowRight' }, { type: 'waitFor', fn: 'window.__awards.state().section === 2 && !window.__awards.state().transitioning' }], settle: 100 },
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
  out.push({ ok: r.keys.state?.section === 2 && r.keys.state?.switches === 2, message: `arrow keys switch sections, the mid-transition press included (section ${r.keys.state?.section}, switches ${r.keys.state?.switches})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.section === 1 && r.rm.state?.transitioning === false, message: 'reduced motion: instant swap' });
  out.push({ ok: r.mobile.state?.gl === true, message: 'mobile renders' });
  return out;
}
