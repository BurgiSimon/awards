// A pressed drag across the middle of the hero, through the protected copy block.
const drag = (y, x0, x1) => [
  { type: 'move', x: x0, y, steps: 2 }, { type: 'down' },
  { type: 'move', x: x1, y, steps: 40 }, { type: 'up' },
  { type: 'wait', ms: 1500 },
];
const desk = drag(500, 40, 1400);
const forceFormat = (f) => [{ type: 'waitFor', fn: `(history.replaceState(null, '', '?format=${f}'), true)` }, { type: 'reload' }, { type: 'wait', ms: 400 }];

export const states = [
  { name: 'rest', settle: 600 },
  { name: 'drag', settle: 600, actions: desk },
  { name: 'half', settle: 600, actions: [...forceFormat('half'), ...desk] },
  { name: 'byte', settle: 600, actions: [...forceFormat('byte'), ...desk] },
  { name: 'reset', settle: 600, actions: [...desk, { type: 'click', selector: '[data-reset]' }, { type: 'wait', ms: 2400 }] },
  { name: 'rm', reducedMotion: true, settle: 600, actions: desk },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: drag(200, 4, 386) },
];

// The key check: texels along the path moved, texels inside the protect mask did not.
const brushed = (s, label) => ({
  ok: s.gl === true && s.pathFree > 40 && s.pathMoved / s.pathFree >= 0.9 && s.pathProtected > 20 && s.maxInside < 1,
  message: `${label}: ${s.pathMoved}/${s.pathFree} path texels moved > 3 px, ${s.pathProtected} protected path texels below 1 px (max ${s.maxInside}) [${s.format}]`,
});

export function assert(r) {
  const out = [];
  const s = r.rest.state || {};
  out.push({ ok: s.gl === true && s.format === 'float' && s.maxAll === 0 && s.grainsDrawn === true && s.canvasAriaHidden === true && s.awake === false, message: `rest: float targets, field at zero (${s.maxAll}), loop idle, canvas aria-hidden` });
  out.push(brushed(r.drag.state || {}, 'drag (RGBA32F)'));
  const h = r.half.state || {};
  out.push({ ...brushed(h, 'half fallback (RGBA16F)'), ok: h.format === 'half' && brushed(h, '').ok });
  const b = r.byte.state || {};
  out.push({ ...brushed(b, 'byte fallback (RGBA8, 16-bit packed)'), ok: b.format === 'byte' && brushed(b, '').ok });
  const z = r.reset.state || {};
  out.push({ ok: z.resets === 1 && z.gliding === false && z.glideFrames > 10 && z.glideEnd !== null && z.glideEnd < 1 && z.maxAll < 0.5, message: `reset: glided home over ${z.glideFrames} frames (max ${z.glideEnd} px at the end of the glide), field cleared (max ${z.maxAll} px)` });
  const rm = r.rm.state || {};
  out.push({ ok: rm.motion === 'reduced' && rm.grainsDrawn === false && brushed(rm, '').ok, message: `reduced motion: no grain pass, the brush reveals the under-layer in place (${rm.pathMoved}/${rm.pathFree})` });
  const m = r.mobile.state || {};
  out.push({ ok: m.gl === true && m.cols * m.rows <= 120000 && m.rows > m.cols && m.pathFree > 20 && m.pathMoved / m.pathFree >= 0.9 && m.maxInside < 1, message: `mobile: ${m.cols}×${m.rows} portrait field brushed (${m.pathMoved}/${m.pathFree}), protected max ${m.maxInside}` });
  return out;
}
