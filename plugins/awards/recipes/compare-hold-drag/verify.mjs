// The compare block sits below a ~100svh hero; states scroll it into view before interacting via the hover action (which scrolls into view).
export const states = [
  { name: 'top', actions: [{ type: 'hover', selector: '[data-compare-handle]' }], settle: 300 },
  { name: 'drag', actions: [{ type: 'hover', selector: '[data-compare-handle]' }, { type: 'down' }, { type: 'move', x: 1100, y: 500, steps: 8 }, { type: 'wait', ms: 200 }], settle: 100 },
  { name: 'released', actions: [{ type: 'hover', selector: '[data-compare-handle]' }, { type: 'down' }, { type: 'move', x: 1100, y: 500, steps: 8 }, { type: 'up' }, { type: 'wait', ms: 200 }], settle: 100 },
  { name: 'hold', actions: [{ type: 'hover', selector: '[data-compare]' }, { type: 'move', x: 300, y: 500, steps: 3 }, { type: 'down' }, { type: 'wait', ms: 300 }], settle: 100 },
  { name: 'keyboard', actions: [{ type: 'focus', selector: '[data-compare-handle]' }, { type: 'press', key: 'ArrowRight' }, { type: 'press', key: 'ArrowRight' }, { type: 'press', key: 'Shift+ArrowLeft' }, { type: 'wait', ms: 300 }], settle: 100 },
  { name: 'mobile', viewport: 'mobile', actions: [{ type: 'hover', selector: '[data-compare-handle]' }], settle: 300 },
];
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.split === 50 && r.top.state?.valueNow === '50', message: 'starts at 50 / 50 with the slider value announced' });
  out.push({ ok: r.drag.state?.dragging === true && (r.drag.state?.split ?? 0) > 60, message: `dragging the handle moves the divider (${r.drag.state?.split}%)` });
  out.push({ ok: r.released.state?.dragging === false && (r.released.state?.split ?? 0) > 60 && r.released.state?.valueNow === String(r.released.state?.split), message: `release keeps the position and the aria value (${r.released.state?.valueNow})` });
  out.push({ ok: r.hold.state?.holding === true && (r.hold.state?.split === 100 || r.hold.state?.split === 0), message: `holding on the image peeks at the other side (${r.hold.state?.split}%)` });
  out.push({ ok: r.keyboard.state?.keyMoves === 3 && r.keyboard.state?.split === 40 && r.keyboard.state?.valueNow === '40', message: `arrow keys move the divider (${r.keyboard.state?.split}%)` });
  out.push({ ok: r.mobile.state?.split === 50, message: 'mobile renders' });
  return out;
}
