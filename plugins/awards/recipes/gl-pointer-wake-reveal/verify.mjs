// The wake opens the paper only where and while the pointer passes; nothing renders at rest; touch and reduced
// motion get the paper alone.
const sweep = [{ type: 'move', x: 240, y: 380, steps: 2 }, { type: 'wait', ms: 60 }, { type: 'move', x: 1180, y: 470, steps: 26 }];
export const states = [
  { name: 'rest', scroll: 0, settle: 1600 },
  { name: 'wake', settle: 30, actions: [...sweep] },
  { name: 'closed', settle: 30, actions: [...sweep, { type: 'wait', ms: 1600 }] },
  { name: 'rm', reducedMotion: true, settle: 900, actions: [...sweep] },
  { name: 'mobile', viewport: 'mobile', settle: 900, actions: [{ type: 'move', x: 60, y: 300, steps: 2 }, { type: 'move', x: 330, y: 420, steps: 12 }] },
];
export async function probe() {
  if (!window.__wake) return { gl: false };
  const hero = document.querySelector('[data-hero]').getBoundingClientRect();
  // A point on the sweep's path (viewport 1150, 468) and one far from it (bottom-left corner of the hero).
  return { gl: true, onPath: window.__wake.alphaAt(1150 - hero.left, 468 - hero.top), offPath: window.__wake.alphaAt(20, hero.height - 20) };
}
export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const pr = (n) => r[n]?.probe || {};
  const out = [];
  out.push({ ok: st('rest').gl === true && st('rest').canvasAriaHidden && st('rest').points === 0 && st('rest').worldFrames === 0 && st('rest').compositeFrames === 0, message: `rest: GL ready, nothing rendered (${st('rest').worldFrames} world, ${st('rest').compositeFrames} composite frames)` });
  out.push({ ok: (st('wake').points ?? 0) > 5 && (pr('wake').onPath ?? 0) > 60 && (pr('wake').offPath ?? 255) === 0, message: `wake: the paper opens on the path (alpha ${pr('wake').onPath}) and stays shut elsewhere (${pr('wake').offPath}); ${st('wake').points} live points` });
  out.push({ ok: (st('wake').worldFrames ?? 0) < (st('wake').compositeFrames ?? 0) || (st('wake').compositeFrames ?? 0) <= 2, message: `the world renders less often than the composite (${st('wake').worldFrames} vs ${st('wake').compositeFrames})` });
  out.push({ ok: st('closed').points === 0 && st('closed').cleared === true && (pr('closed').onPath ?? 255) === 0, message: `closed: the wake has expired and the canvas is clear (alpha ${pr('closed').onPath})` });
  out.push({ ok: st('rm').gl === false && st('rm').canvasShown === false && st('rm').motion === 'reduced', message: 'reduced motion: paper only, no canvas' });
  out.push({ ok: st('mobile').gl === false && st('mobile').fine === false && st('mobile').canvasShown === false, message: 'touch: paper only, no wake' });
  return out;
}
