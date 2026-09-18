export const states = [
  { name: 'top', scroll: 0, settle: 1200 },
  { name: 'pointer', actions: [{ type: 'move', x: 300, y: 300, steps: 2 }, { type: 'wait', ms: 100 }, { type: 'move', x: 1200, y: 700, steps: 6 }, { type: 'wait', ms: 250 }], settle: 50 },
  { name: 'scrolled', scroll: 0.5, settle: 900 },
  { name: 'rm', scroll: 0, reducedMotion: true, settle: 600 },
  { name: 'mobile', scroll: 0, viewport: 'mobile', settle: 1200 },
];
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.gl === true && r.top.state?.fallbackVisibility === 'hidden', message: 'WebGL object rendered; still image kept in the DOM and hidden' });
  const px = r.top.state?.samplePixel || [0, 0, 0, 0];
  out.push({ ok: px[3] > 0 && (px[0] + px[1] + px[2]) > 60, message: `the object is lit at the sample point (rgba ${px.join(',')})` });
  out.push({ ok: (r.pointer.state?.maxVel ?? 0) > 0.3, message: `pointer moves the object through the spring (max velocity ${r.pointer.state?.maxVel})` });
  out.push({ ok: (r.scrolled.state?.scrollTurn ?? 0) > 1, message: `scroll turns the object (${r.scrolled.state?.scrollTurn} rad)` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.gl === false && r.rm.state?.fallbackVisibility === 'visible', message: 'reduced motion: the still, no WebGL' });
  out.push({ ok: r.mobile.state?.gl === true, message: 'mobile renders' });
  return out;
}
