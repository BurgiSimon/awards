// The cloud settles on each shape at rest, swirls only mid-morph, parts for the pointer, idles when settled,
// and under reduced motion never travels: two settled shapes cross-fade by opacity.
// Page arithmetic: topbar 64 px, morph section 300vh (200vh of travel), notes 100vh, footer 96 px.
// At 900 px: max scroll 2860; progress p sits at scroll (64 + p·1800) / 2860.
export const states = [
  { name: 'shape0', scroll: 0, settle: 2600 },
  { name: 'morph', scroll: 0.1797, settle: 1800 },
  { name: 'shape1', scroll: 0.337, settle: 3200 },
  { name: 'pointer', scroll: 0, settle: 2000, actions: [{ type: 'move', x: 880, y: 514, steps: 4 }, { type: 'move', x: 905, y: 524, steps: 4 }, { type: 'wait', ms: 120 }] },
  { name: 'rm-morph', scroll: 0.1797, reducedMotion: true, settle: 900 },
  { name: 'mobile', scroll: 0, viewport: 'mobile', settle: 2600 },
];
export async function probe() {
  const c = document.querySelector('[data-canvas]');
  const g = c.getContext('2d');
  const d = g.getImageData(0, 0, c.width, c.height).data;
  let lit = 0;
  for (let i = 0; i < d.length; i += 16) if (d[i] > 120) lit++;
  return { litFraction: Math.round((lit / (d.length / 16)) * 10000) / 10000 };
}
export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const out = [];
  out.push({ ok: st('shape0').ready && st('shape0').points === 5000 && st('shape0').segment === 0 && st('shape0').meanErr < 3 && (r.shape0?.probe?.litFraction ?? 0) > 0.005, message: `shape 0: 5000 points settled on their targets (mean error ${st('shape0').meanErr} px, lit ${r.shape0?.probe?.litFraction})` });
  out.push({ ok: (st('shape0').skipped ?? 0) > 5, message: `settled cloud skips its paint (${st('shape0').skipped} frames skipped)` });
  out.push({ ok: st('morph').e > 0.2 && st('morph').e < 0.8 && st('morph').w > 0.5 && st('morph').meanSpeed > 2, message: `mid-morph: blend ${st('morph').e}, swirl weight ${st('morph').w}, points moving (${st('morph').meanSpeed} px/s)` });
  out.push({ ok: st('shape1').segment === 1 && (st('shape1').e === 1 || st('shape1').e === 0) && st('shape1').meanErr < 4, message: `shape 1: holds settled (segment ${st('shape1').segment}, blend ${st('shape1').e}, error ${st('shape1').meanErr} px)` });
  out.push({ ok: (st('pointer').displaced ?? 0) > 40, message: `the pointer parts the cloud (${st('pointer').displaced} points pushed more than 20 px)` });
  out.push({ ok: st('rm-morph').motion === 'reduced' && st('rm-morph').meanErr === 0 && st('rm-morph').fade > 0.2 && st('rm-morph').fade < 0.8, message: `reduced motion: no travel, an opacity cross-fade (fade ${st('rm-morph').fade})` });
  out.push({ ok: st('mobile').points === 2500 && (r.mobile?.probe?.litFraction ?? 0) > 0.003, message: `mobile: 2500 points (lit ${r.mobile?.probe?.litFraction})` });
  return out;
}
