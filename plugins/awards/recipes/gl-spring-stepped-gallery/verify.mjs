// `key` focuses the stage and presses ArrowRight twice; the spring must settle the float index on 2 and the announcer
// must name plate 3. `wheel` rests the mouse on the stage and sends one trackpad-like burst of 20 small, decaying wheel
// deltas (78 px in all, 13× the threshold): exactly one step. `edge` jumps to the last plate and wheels on: the gallery
// lets the wheel through and the page scrolls. `rm` presses once under reduced motion: the index is whole on the next
// frame. `mobile` taps Next on a phone. The probe reads state one frame after the actions.
const BURST = [12, 10, 9, 8, 7, 6, 5, 4, 3, 3, 2, 2, 1, 1, 1, 1, 1, 0.6, 0.4, 0.2];
const STAGE = '[data-stage]';

export const states = [
  { name: 'top', settle: 600 },
  { name: 'key', settle: 400, actions: [{ type: 'focus', selector: STAGE }, { type: 'press', key: 'ArrowRight' }, { type: 'press', key: 'ArrowRight' }, { type: 'wait', ms: 1800 }] },
  { name: 'wheel', settle: 400, actions: [{ type: 'hover', selector: STAGE }, { type: 'wait', ms: 150 }, ...BURST.map((dy) => ({ type: 'wheel', dy })), { type: 'wait', ms: 1800 }] },
  { name: 'edge', settle: 400, actions: [{ type: 'focus', selector: STAGE }, { type: 'press', key: 'End' }, { type: 'wait', ms: 300 }, { type: 'hover', selector: STAGE }, { type: 'wheel', dy: 200 }, { type: 'wait', ms: 600 }] },
  { name: 'rm', settle: 400, reducedMotion: true, actions: [{ type: 'focus', selector: STAGE }, { type: 'press', key: 'ArrowRight' }] },
  { name: 'mobile', settle: 400, viewport: 'mobile', actions: [{ type: 'click', selector: '[data-next]' }, { type: 'wait', ms: 1800 }] },
];

export async function probe() {
  await new Promise((r) => requestAnimationFrame(r));
  const next = document.querySelector('[data-next]').getBoundingClientRect();
  return {
    nextFrame: window.__awards.state(),
    scrollY: Math.round(scrollY),
    overflowX: document.documentElement.scrollWidth - innerWidth,
    nextBottom: Math.round(next.bottom + scrollY), vh: innerHeight,
    roledescription: document.querySelector('[data-gallery]').getAttribute('aria-roledescription'),
  };
}

const lit = (px) => Array.isArray(px) && px[3] > 200;
const clear = (px) => Array.isArray(px) && px[3] === 0;

export function assert(r) {
  const out = [];
  const S = (n) => r[n]?.state || {};
  const P = (n) => r[n]?.probe || {};

  const t = S('top');
  out.push({ ok: t.gl === true && t.pos === 0 && t.count === '01 / 08' && lit(t.pixels?.centre) && clear(t.pixels?.corner) && P('top').roledescription === 'carousel', message: `top: drawn (centre ${t.pixels?.centre}, corner ${t.pixels?.corner}), index ${t.pos}, "${t.count}", carousel role ${P('top').roledescription}` });

  const k = S('key');
  out.push({ ok: k.target === 2 && Math.abs(k.pos - 2) <= 0.01 && k.mode === 'rest' && /Plate 3 of 8: Pale Celadon/.test(k.live) && k.count === '03 / 08', message: `key: two ArrowRight presses settle the spring on ${k.pos} (target ${k.target}, ${k.mode}); live "${k.live}"` });

  const w = S('wheel');
  out.push({ ok: w.wheelEvents === BURST.length && w.wheelSteps === 1 && w.target === 1 && Math.abs(w.pos - 1) <= 0.01, message: `wheel: a burst of ${w.wheelEvents} events moved exactly ${w.wheelSteps} step (index ${w.pos}, target ${w.target})` });

  const e = S('edge');
  out.push({ ok: e.target === 7 && e.wheelPassed >= 1 && e.wheelSteps === 0 && P('edge').scrollY > 0, message: `edge: at the last plate the wheel passes to the page (passed ${e.wheelPassed}, steps ${e.wheelSteps}, scrollY ${P('edge').scrollY})` });

  const rm = P('rm').nextFrame || {};
  out.push({ ok: rm.motion === 'reduced' && rm.target === 1 && rm.pos === 1 && rm.mode === 'rest' && lit(rm.pixels?.centre), message: `reduced motion: whole index on the next frame (pos ${rm.pos}, ${rm.mode}), still drawn` });

  const m = S('mobile'), mp = P('mobile');
  out.push({ ok: m.gl === true && m.target === 1 && Math.abs(m.pos - 1) <= 0.01 && lit(m.pixels?.centre) && mp.overflowX <= 0, message: `mobile: Next steps (index ${m.pos}), drawn, no sideways overflow (${mp.overflowX})` });
  out.push({ ok: [P('top'), mp].every((p) => p.nextBottom > 0 && p.nextBottom <= p.vh), message: `stage, caption and Next fit the first viewport: ${P('top').nextBottom}/${P('top').vh} desktop, ${mp.nextBottom}/${mp.vh} phone` });
  return out;
}
