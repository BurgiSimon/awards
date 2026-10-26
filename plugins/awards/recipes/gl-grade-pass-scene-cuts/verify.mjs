// Cuts in the grade pass: the dip reaches a flat colour, the iris shows the new scene inside and the frozen still outside,
// the close fills the ground colour, scrolling back releases the still, and reduced motion keeps the cuts as hard switches.
export const states = [
  { name: 'dusk', scroll: 0, settle: 1200 },
  { name: 'dip', scroll: 0.27, settle: 900 },
  { name: 'tide', scroll: 0.44, settle: 900 },
  { name: 'iris', scroll: 0.5879, settle: 900 },
  { name: 'back', scroll: 0.44, settle: 900, actions: [{ type: 'wheel', dy: 3300 }, { type: 'wait', ms: 1800 }] },
  { name: 'close', scroll: 1, settle: 900 },
  { name: 'rm', scroll: 0.27, reducedMotion: true, settle: 900 },
  { name: 'rm-iris', scroll: 0.5879, reducedMotion: true, settle: 900 },
  { name: 'mobile', scroll: 0.588, viewport: 'mobile', settle: 1200 },
];

export async function probe() {
  if (!window.__cuts) return { gl: false };
  return { gl: true, ...window.__cuts.sample() };
}

const near = (a, b, tol) => Array.isArray(a) && a.every((v, i) => Math.abs(v - b[i]) <= tol);
const blue = (c) => Array.isArray(c) && c[2] > c[0] && c[2] > c[1];
const green = (c) => Array.isArray(c) && c[1] > c[0] && c[1] > c[2];
const warm = (c) => Array.isArray(c) && c[0] > c[2];

export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const pr = (n) => r[n]?.probe || {};
  const out = [];
  out.push({ ok: st('dusk').gl === true && st('dusk').scene === 0 && st('dusk').canvasAriaHidden && warm(pr('dusk').centre), message: `dusk: scene 0, warm centre ${pr('dusk').centre}, both canvases aria-hidden` });
  out.push({ ok: (st('dip').dip ?? 0) > 0.9 && st('dip').scene === 1 && near(pr('dip').centre, [233, 225, 212], 14), message: `cut 1 at its peak is the flat dip colour (dip ${st('dip').dip}, centre ${pr('dip').centre}) and the scene swapped under it (scene ${st('dip').scene})` });
  out.push({ ok: st('tide').scene === 1 && st('tide').dip === 0 && blue(pr('tide').centre), message: `tide: scene 1, blue centre ${pr('tide').centre}` });
  out.push({ ok: st('iris').frozen === true && st('iris').scene === 2 && green(pr('iris').centre) && blue(pr('iris').corner), message: `cut 2: live moss inside the diamond (${pr('iris').centre}), frozen tide outside (${pr('iris').corner})` });
  out.push({ ok: st('iris').outlineDrawn === true && (st('iris').cacheCopies ?? 0) === 1, message: `cut 2: the 2D edge is drawn and the still was copied once (${st('iris').cacheCopies})` });
  out.push({ ok: st('back').frozen === false && st('back').scene === 1 && (st('back').cacheCopies ?? 0) >= 1 && blue(pr('back').corner), message: `scrolling back releases the still (frozen ${st('back').frozen}, copies ${st('back').cacheCopies})` });
  out.push({ ok: (st('close').close ?? 0) > 0.9 && near(pr('close').corner, [16, 35, 26], 10) && green(pr('close').centre), message: `the close fills the ground colour outside a small window (corner ${pr('close').corner}, centre ${pr('close').centre})` });
  out.push({ ok: st('rm').motion === 'reduced' && st('rm').dip === 0 && st('rm').time === 0 && st('rm').scene === 1 && !near(pr('rm').centre, [233, 225, 212], 30), message: `reduced motion: no dip, no clock, hard switch to scene 1 (centre ${pr('rm').centre})` });
  out.push({ ok: st('rm-iris').scene === 2 && st('rm-iris').outlineDrawn === false && green(pr('rm-iris').corner), message: `reduced motion: the iris is a hard cut, no edge drawn (corner ${pr('rm-iris').corner})` });
  out.push({ ok: st('mobile').frozen === true && green(pr('mobile').centre) && blue(pr('mobile').corner), message: `mobile: the diamond iris holds on a portrait frame (${pr('mobile').centre} / ${pr('mobile').corner})` });
  return out;
}
