export const states = [
  { name: 'top', scroll: 0, settle: 500 },
  // No `scroll` on the interaction states: the hover action scrolls the row into view, and a scroll after the hover would move the row out from under the pointer.
  { name: 'follow', actions: [{ type: 'hover', selector: '.rows li:nth-child(2) a' }, { type: 'wait', ms: 200 }, { type: 'move', x: 600, y: 500, steps: 6 }, { type: 'wait', ms: 700 }], settle: 100 },
  { name: 'keyboard', actions: [{ type: 'focus', selector: '.rows li:nth-child(3) a' }, { type: 'wait', ms: 600 }], settle: 100 },
  { name: 'rm', reducedMotion: true, actions: [{ type: 'hover', selector: '.rows li:nth-child(2) a' }, { type: 'wait', ms: 500 }], settle: 100 },
  { name: 'mobile', scroll: 0.5, viewport: 'mobile', settle: 500 },
];
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.visible === false && r.top.state?.previewOpacity === 0, message: 'no preview at rest' });
  out.push({ ok: r.follow.state?.visible === true && r.follow.state?.mode === 'pointer' && r.follow.state?.current === 'Meridian', message: `hover shows the row's preview (${r.follow.state?.current})` });
  out.push({ ok: Math.abs((r.follow.state?.previewLeft ?? 0) - 600) < 6 && Math.abs((r.follow.state?.previewTop ?? 0) - 500) < 6, message: `preview converged on the pointer (${r.follow.state?.previewLeft}, ${r.follow.state?.previewTop})` });
  out.push({ ok: r.keyboard.state?.visible === true && r.keyboard.state?.mode === 'keyboard' && r.keyboard.state?.current === 'Sea State', message: 'keyboard focus shows the preview, anchored to the row' });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.visible === true, message: 'reduced motion: preview still appears (no chase)' });
  out.push({ ok: !r.mobile.state?.finePointer ? r.mobile.state?.previewDisplay === 'none' : true, message: `coarse pointer: preview hidden (fine: ${r.mobile.state?.finePointer})` });
  return out;
}
