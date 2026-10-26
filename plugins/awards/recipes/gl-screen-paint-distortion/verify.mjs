// Screen paint: a moving pointer paints, a resting one does not, the field returns to zero, phones paint only while pressed.
const sweep = [{ type: 'move', x: 200, y: 420, steps: 2 }, { type: 'wait', ms: 80 }, { type: 'move', x: 1150, y: 520, steps: 30 }, { type: 'wait', ms: 40 }, { type: 'move', x: 320, y: 660, steps: 30 }];
export const states = [
  { name: 'top', scroll: 0, settle: 1200 },
  { name: 'rest', scroll: 0, settle: 1200, actions: [{ type: 'move', x: 700, y: 450, steps: 1 }, { type: 'wait', ms: 1200 }] },
  { name: 'paint', settle: 30, actions: [...sweep, { type: 'wait', ms: 30 }] },
  { name: 'decay', settle: 30, actions: [...sweep, { type: 'wait', ms: 9000 }] },
  { name: 'rm', reducedMotion: true, settle: 600 },
  { name: 'mobile-hover', viewport: 'mobile', settle: 1200, actions: [{ type: 'move', x: 60, y: 300, steps: 2 }, { type: 'move', x: 330, y: 520, steps: 20 }] },
  { name: 'mobile-press', viewport: 'mobile', settle: 30, actions: [{ type: 'move', x: 60, y: 300, steps: 2 }, { type: 'down' }, { type: 'move', x: 330, y: 520, steps: 20 }, { type: 'wait', ms: 30 }] },
];
export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const out = [];
  out.push({ ok: st('top').gl === true && st('top').canvasAriaHidden && st('top').titleInDom && st('top').titleVisibility === 'hidden', message: 'WebGL active, canvas aria-hidden, DOM hero mirrored behind the canvas' });
  out.push({ ok: (st('top').energy ?? 1) === 0, message: `field empty before any pointer (energy ${st('top').energy})` });
  out.push({ ok: (st('rest').energy ?? 1) === 0, message: `a resting pointer paints nothing (energy ${st('rest').energy})` });
  out.push({ ok: (st('paint').strokes ?? 0) > 5 && (st('paint').energy ?? 0) > 0.02, message: `a sweep paints the field (strokes ${st('paint').strokes}, energy ${st('paint').energy})` });
  out.push({ ok: (st('decay').energy ?? 1) === 0, message: `the field returns to exactly zero after 9 s (energy ${st('decay').energy})` });
  out.push({ ok: st('rm').motion === 'reduced' && st('rm').gl === false && st('rm').titleVisibility === 'visible', message: 'reduced motion: no field, plain DOM hero' });
  out.push({ ok: st('mobile-hover').gl === true && st('mobile-hover').coarse === true && (st('mobile-hover').strokes ?? 1) === 0, message: `phone: moving without a press paints nothing (strokes ${st('mobile-hover').strokes})` });
  out.push({ ok: (st('mobile-press').strokes ?? 0) > 0 && (st('mobile-press').energy ?? 0) > 0, message: `phone: a pressed drag paints (strokes ${st('mobile-press').strokes}, energy ${st('mobile-press').energy})` });
  return out;
}
