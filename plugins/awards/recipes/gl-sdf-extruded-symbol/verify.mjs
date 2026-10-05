// Pin a front-on, full-depth pose so the frame is reproducible.
const freeze = [{ type: 'waitFor', fn: 'window.__symbol?.freeze(0, 1) === true' }, { type: 'wait', ms: 150 }];

export const states = [
  { name: 'lit', settle: 400, actions: freeze },
  { name: 'fallback', settle: 300, actions: [{ type: 'waitFor', fn: 'window.__symbol?.loseContext() === true' }, { type: 'wait', ms: 300 }] },
  { name: 'reduced', reducedMotion: true, settle: 400 },
  { name: 'mobile', viewport: 'mobile', settle: 400, actions: freeze },
];

// The key check: the mark covers the centre, the corners are clear, and the bevel ring is a real band (a quarter of the face or more) and outshines the face.
function lit(s) {
  if (!s) return { ok: false, msg: 'no samples' };
  const ok = s.centreAlpha === 255 && s.cornerAlpha === 0 && s.faceN > 200 && s.bevelN > s.faceN * 0.25 && s.bevelLum > s.faceLum + 20;
  return { ok, msg: `centre alpha ${s.centreAlpha}, corner alpha ${s.cornerAlpha}, face ${s.faceLum} lum (${s.faceN} px), bevel ${s.bevelLum} lum (${s.bevelN} px)` };
}

export function assert(r) {
  const out = [];
  const l = r.lit.state || {};
  const a = lit(l.samples);
  out.push({ ok: l.gl === true && l.canvasAriaHidden === true && l.svgVisible === false && a.ok, message: `lit: ${a.msg}` });
  const f = r.fallback.state || {};
  out.push({ ok: f.gl === false && f.svgVisible === true && f.canvasDisplay === 'none', message: `fallback: context lost → svg visible ${f.svgVisible}, canvas ${f.canvasDisplay}` });
  const rm = r.reduced.state || {};
  out.push({ ok: rm.motion === 'reduced' && rm.gl === false && rm.svgVisible === true && rm.canvasDisplay === 'none', message: `reduced: no context, svg visible ${rm.svgVisible}, canvas ${rm.canvasDisplay}` });
  const m = r.mobile.state || {};
  const ms = lit(m.samples);
  out.push({ ok: m.gl === true && m.size?.[1] > m.size?.[0] * 0.9 && ms.ok, message: `mobile: ${m.size?.join('×')} stage, ${ms.msg}` });
  return out;
}
