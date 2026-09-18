export const states = [
  { name: 'top', actions: [{ type: 'move', x: 200, y: 200, steps: 2 }, { type: 'wait', ms: 200 }, { type: 'move', x: 900, y: 600, steps: 3 }, { type: 'wait', ms: 700 }], settle: 100 },
  { name: 'hover', scroll: 1, actions: [{ type: 'move', x: 200, y: 200, steps: 2 }, { type: 'wait', ms: 200 }], hover: '[data-cursor="play"]', settle: 300 },
  { name: 'rm', reducedMotion: true, actions: [{ type: 'move', x: 200, y: 200, steps: 2 }, { type: 'wait', ms: 100 }, { type: 'move', x: 900, y: 600, steps: 3 }, { type: 'wait', ms: 400 }], settle: 100 },
  { name: 'mobile', viewport: 'mobile', scroll: 0, settle: 500 },
];
export function probe() {
  const root = document.querySelector('[data-cursor-root]');
  const ring = document.querySelector('[data-cursor-ring]');
  const dot = document.querySelector('[data-cursor-dot]');
  const xy = (el) => { const m = /matrix\(([^)]*)\)/.exec(getComputedStyle(el).transform); const p = m ? m[1].split(',').map(Number) : [1,0,0,1,0,0]; return { x: p[4], y: p[5], s: p[0] }; };
  return { display: getComputedStyle(root).display, opacity: Number(getComputedStyle(root).opacity), ring: xy(ring), dot: xy(dot), osCursor: getComputedStyle(document.body).cursor, coarse: matchMedia('(pointer: coarse)').matches, badge: document.querySelector('[data-cursor-badge]').textContent };
}
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.cursorEnabled === true && r.top.probe?.display === 'block', message: 'custom cursor enabled on a fine pointer' });
  out.push({ ok: (r.top.state?.maxLag ?? 0) > 20, message: `ring lagged behind the dot during the move (max ${r.top.state?.maxLag} px)` });
  const conv = Math.hypot((r.top.probe?.dot.x ?? 0) - 900, (r.top.probe?.dot.y ?? 0) - 600);
  out.push({ ok: conv < 4, message: `dot converged on the pointer after settling (${conv.toFixed(1)} px off)` });
  out.push({ ok: r.hover.state?.hover === true && r.hover.state?.badge === 'play' && (r.hover.probe?.ring.s ?? 1) > 1.2 && (r.hover.probe?.dot.s ?? 1) < 0.8, message: `hover: ring grows, dot shrinks, badge "${r.hover.state?.badge}"` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && (r.rm.state?.maxLag ?? 99) < 2, message: `reduced motion: no lag between dot and ring (${r.rm.state?.maxLag} px)` });
  out.push({ ok: !r.mobile.probe?.coarse || (r.mobile.state?.cursorEnabled === false && r.mobile.probe?.display === 'none'), message: `coarse pointer: custom cursor absent (coarse emulated: ${r.mobile.probe?.coarse})` });
  return out;
}
