// Desktop 1440×900 (headless overlay scrollbars, clientWidth 1440): track x 1408–1428, y 16–884; thumb 140 px tall,
// so its free travel is 728 px. Grabbing at y 80 and moving 364 px drags it to half its travel.
const X = 1418;
const HALF = 364;

export const states = [
  { name: 'top', scroll: 0, settle: 600 },
  { name: 'drag', settle: 400, actions: [{ type: 'move', x: X, y: 80, steps: 2 }, { type: 'down' }, { type: 'move', x: X, y: 80 + HALF, steps: 12 }, { type: 'up' }, { type: 'wait', ms: 500 }] },
  { name: 'keys', settle: 400, actions: [{ type: 'press', key: 'PageDown' }, { type: 'press', key: 'PageDown' }, { type: 'press', key: 'PageDown' }, { type: 'wait', ms: 1500 }] },
  { name: 'eased', scroll: 0.5, settle: 60 },
  { name: 'rm', reducedMotion: true, scroll: 0.5, settle: 60 },
  { name: 'mobile', viewport: 'mobile', scroll: 0.5, settle: 600 },
];

export function probe() {
  const t = document.querySelector('[data-track]').getBoundingClientRect();
  const h = document.querySelector('[data-thumb]').getBoundingClientRect();
  return {
    trackDisplay: getComputedStyle(document.querySelector('[data-track]')).display,
    nativeBar: getComputedStyle(document.documentElement).scrollbarWidth,
    thumbFraction: t.height > h.height ? Number(((h.top - t.top) / (t.height - h.height)).toFixed(3)) : null,
    travel: Math.round(t.height - h.height),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

export function assert(r) {
  const s = (n) => r[n]?.state || {};
  const p = (n) => r[n]?.probe || {};
  const near = (a, b, tol) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol;
  const out = [];
  out.push({ ok: s('top').lenis === true && s('top').thumbActive === true && p('top').trackDisplay === 'block' && p('top').thumbFraction === 0, message: `desktop: Lenis on the shared ticker, thumb drawn at the top of its track (${p('top').thumbFraction})` });
  out.push({ ok: p('top').nativeBar !== 'none', message: `native scrollbar kept (scrollbar-width ${p('top').nativeBar})` });
  const expected = HALF / (p('drag').travel || 1);
  out.push({ ok: s('drag').drags === 1 && s('drag').dragging === false && near(s('drag').scroll, 0.5, 0.05) && near(s('drag').scroll, expected, 0.02), message: `dragging the thumb half its travel scrolls to ≈ half the page (${s('drag').scroll}, expected ${expected.toFixed(3)})` });
  out.push({ ok: near(p('drag').thumbFraction, s('drag').scroll, 0.02), message: `thumb stays under the pointer after the drag (${p('drag').thumbFraction})` });
  out.push({ ok: s('keys').drags === 0 && s('keys').scroll > 0.2 && near(p('keys').thumbFraction, s('keys').scroll, 0.02), message: `Page Down scrolls natively and the thumb follows (scroll ${s('keys').scroll}, thumb ${p('keys').thumbFraction})` });
  out.push({ ok: s('eased').motion === 'full' && s('eased').lag > 0.02, message: `full tier: the thumb eases towards a jump (lag ${s('eased').lag} after 60 ms)` });
  out.push({ ok: s('rm').motion === 'reduced' && s('rm').lenis === false && near(s('rm').scroll, 0.5, 0.02) && s('rm').lag === 0 && near(p('rm').thumbFraction, s('rm').scroll, 0.01), message: `reduced motion: native scroll without Lenis, thumb exactly on the scroll after 60 ms (lag ${s('rm').lag}, thumb ${p('rm').thumbFraction})` });
  out.push({ ok: p('mobile').trackDisplay === 'none' && s('mobile').thumbActive === false && near(s('mobile').scroll, 0.5, 0.03) && p('mobile').overflowX <= 0, message: `mobile: drawn track hidden on the coarse pointer, page still scrolls (${s('mobile').scroll}), no sideways overflow` });
  return out;
}
