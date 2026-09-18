export const states = [
  { name: 'top', scroll: 0, settle: 600 },
  { name: 'pull', actions: [{ type: 'hover', selector: '[data-magnet]' }, { type: 'wait', ms: 200 }, { type: 'move', x: 790, y: 500, steps: 4 }, { type: 'wait', ms: 500 }], settle: 100 },
  { name: 'focus', actions: [{ type: 'focus', selector: '[data-magnet]' }, { type: 'wait', ms: 500 }], settle: 100 },
  { name: 'rm', reducedMotion: true, actions: [{ type: 'hover', selector: '[data-magnet]' }, { type: 'wait', ms: 300 }], settle: 100 },
  { name: 'mobile', viewport: 'mobile', actions: [{ type: 'hover', selector: '[data-magnet]' }, { type: 'wait', ms: 300 }], settle: 100 },
];
// 'pull' hovers the centre (Playwright centres the element in the viewport, so the centre is ≈ (720, 450)),
// then moves ≈ 85 px down-right, well inside the 1.6 × diagonal radius, and waits for the quickTo tween.
export function probe() {
  const el = document.querySelector('[data-magnet]');
  const r = el.getBoundingClientRect();
  const t = getComputedStyle(el).transform;
  const m = /matrix\(([^)]*)\)/.exec(t);
  const parts = m ? m[1].split(',').map(Number) : [1, 0, 0, 1, 0, 0];
  const text = document.querySelector('[data-magnet-text]');
  const tm = /matrix\(([^)]*)\)/.exec(getComputedStyle(text).transform);
  const tp = tm ? tm[1].split(',').map(Number) : [1, 0, 0, 1, 0, 0];
  return { tx: parts[4], ty: parts[5], textTx: tp[4], textTy: tp[5], focused: document.activeElement === el, rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) }, coarse: matchMedia('(pointer: coarse)').matches };
}
export function assert(r) {
  const out = [];
  out.push({ ok: Math.abs(r.top.probe?.tx ?? 1) < 0.5 && Math.abs(r.top.probe?.ty ?? 1) < 0.5, message: 'at rest the button has no offset' });
  const pulled = Math.hypot(r.pull.probe?.tx ?? 0, r.pull.probe?.ty ?? 0);
  out.push({ ok: pulled > 3 || r.pull.state?.engaged > 0, message: `button pulled toward the pointer (${pulled.toFixed(1)} px, engaged ${r.pull.state?.engaged ?? 0})` });
  const textPull = Math.hypot(r.pull.probe?.textTx ?? 0, r.pull.probe?.textTy ?? 0);
  out.push({ ok: pulled === 0 || textPull < pulled, message: `label moves less than the ring (${textPull.toFixed(1)} < ${pulled.toFixed(1)})` });
  out.push({ ok: r.focus.probe?.focused === true, message: 'button is keyboard-focusable' });
  out.push({ ok: r.rm.state?.motion === 'reduced' && Math.abs(r.rm.probe?.tx ?? 1) < 0.5, message: 'no pull under reduced motion' });
  out.push({ ok: !r.mobile.probe?.coarse || Math.abs(r.mobile.probe?.tx ?? 1) < 0.5, message: `no pull on a coarse pointer (coarse emulated: ${r.mobile.probe?.coarse})` });
  return out;
}
