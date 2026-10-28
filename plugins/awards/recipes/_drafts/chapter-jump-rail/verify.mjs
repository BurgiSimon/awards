// The template's verifier: the bar follows the stage's scroll progress, holds full afterwards, and is full and still
// under reduced motion. Replace the states and checks with the draft's own.
export const states = [
  { name: 'top', scroll: 0 },
  { name: 'mid', scroll: 0.45 },
  { name: 'end', scroll: 1 },
  { name: 'rm', scroll: 0.45, reducedMotion: true },
  { name: 'mobile', viewport: 'mobile', scroll: 0.45 },
];

export function probe() {
  const bar = document.querySelector('[data-bar]');
  return {
    scaleX: new DOMMatrixReadOnly(getComputedStyle(bar).transform).a,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

export function assert(r) {
  const p = (n) => r[n]?.probe ?? {};
  const s = (n) => r[n]?.state ?? {};
  return [
    { ok: p('top').scaleX === 0, message: `top: the bar is empty before the stage (${p('top').scaleX})` },
    { ok: p('mid').scaleX > 0.1 && p('mid').scaleX < 0.9 && Math.abs(p('mid').scaleX - s('mid').progress) < 0.01, message: `mid: the bar shows the stage's progress (${p('mid').scaleX?.toFixed(2)})` },
    { ok: p('end').scaleX === 1, message: `end: the bar holds full (${p('end').scaleX})` },
    { ok: s('rm').motion === 'reduced' && p('rm').scaleX === 1, message: `reduced motion: the bar is full and still (${p('rm').scaleX})` },
    { ok: (p('mobile').overflowX ?? 1) <= 0, message: 'mobile: no sideways overflow' },
  ];
}
