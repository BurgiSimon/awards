const sweep = [{ type: 'move', x: 200, y: 400, steps: 2 }, { type: 'wait', ms: 60 }, { type: 'move', x: 1100, y: 500, steps: 24 }, { type: 'wait', ms: 60 }, { type: 'move', x: 300, y: 650, steps: 24 }];
export const states = [
  { name: 'top', scroll: 0, settle: 1200 },
  { name: 'wake', actions: [...sweep, { type: 'wait', ms: 40 }], settle: 40 },
  { name: 'decay', actions: [...sweep, { type: 'wait', ms: 2500 }], settle: 40 },
  { name: 'rm', reducedMotion: true, settle: 600 },
  { name: 'mobile', viewport: 'mobile', settle: 1200 },
];
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.gl === true && r.top.state?.canvasAriaHidden === true && r.top.state?.titleInDom === true && r.top.state?.titleVisibility === 'hidden', message: `WebGL active (${r.top.state?.halfFloat ? 'half-float' : 'byte'} targets), canvas aria-hidden, DOM headline mirrored` });
  out.push({ ok: (r.top.state?.energy ?? 1) < 0.01, message: `field at rest before any pointer (energy ${r.top.state?.energy})` });
  out.push({ ok: (r.wake.state?.splats ?? 0) > 5 && (r.wake.state?.energy ?? 0) > 0.02, message: `pointer sweep splats the field (splats ${r.wake.state?.splats}, energy ${r.wake.state?.energy})` });
  out.push({ ok: (r.decay.state?.energy ?? 1) < (r.wake.state?.energy ?? 0) * 0.5, message: `wake dissipates after 2.5 s (${r.decay.state?.energy} < ${r.wake.state?.energy})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.gl === false && r.rm.state?.titleVisibility === 'visible', message: 'reduced motion: no simulation, plain DOM hero' });
  out.push({ ok: r.mobile.state?.gl === true, message: 'mobile: renders' });
  return out;
}
