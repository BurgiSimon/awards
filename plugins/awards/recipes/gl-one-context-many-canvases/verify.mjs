const toGrid = { type: 'waitFor', fn: "(document.querySelector('.items').scrollIntoView({ block: 'center' }), true)" };

export const states = [
  { name: 'grid', settle: 600, actions: [toGrid, { type: 'wait', ms: 1200 }] },
  { name: 'hover', settle: 600, actions: [toGrid, { type: 'wait', ms: 1000 }, { type: 'hover', selector: '[data-item="ring"]' }, { type: 'wait', ms: 2500 }] },
  { name: 'teardown', settle: 600, actions: [toGrid, { type: 'wait', ms: 1000 }, { type: 'waitFor', fn: 'window.__oneContext.teardown()' }, { type: 'wait', ms: 200 }] },
  { name: 'rm', reducedMotion: true, settle: 600, actions: [toGrid, { type: 'wait', ms: 1000 }, { type: 'hover', selector: '[data-item="ring"]' }, { type: 'wait', ms: 800 }] },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: [toGrid, { type: 'wait', ms: 1500 }] },
];

// Share of painted pixels in the item's centre region; an empty canvas reads 0.
const drawn = (it) => typeof it?.centre === 'number' && it.centre > 0.05;

export function assert(r) {
  const out = [];
  const g = r.grid.state || {};
  const gi = g.items || [];
  out.push({ ok: g.gl === true && g.canvasesInDom === 6 && gi.length === 6, message: `six item canvases in the DOM, none for the renderer (${g.canvasesInDom})` });
  out.push({ ok: gi.length === 6 && gi.every(drawn), message: `every item canvas has the object at its centre (painted share ${gi.map((i) => i.centre).join(',')})` });
  out.push({ ok: g.contexts === 1 && g.contexts2d === 6, message: `exactly one WebGL context for six canvases (webgl ${g.contexts}, 2d ${g.contexts2d})` });
  out.push({ ok: g.backingPixels > 0 && g.backingPixels <= g.budget, message: `backing pixels ${g.backingPixels} within the shared budget ${g.budget} (dpr ${g.dpr})` });
  out.push({ ok: gi.every((i) => i.renders === 1), message: `at rest each item rendered once and then went quiet (renders ${gi.map((i) => i.renders).join(',')})` });

  const h = r.hover.state || {};
  const ring = (h.items || []).find((i) => i.name === 'ring');
  const others = (h.items || []).filter((i) => i.name !== 'ring');
  out.push({ ok: ring && Math.abs(ring.angle - 2 * Math.PI) < 1e-3 && ring.renders > 5 && others.every((i) => i.renders === 1), message: `hover turns only the hovered item one revolution (angle ${ring?.angle}, renders ${ring?.renders}; others ${others.map((i) => i.renders).join(',')})` });

  const t = r.teardown.state || {};
  out.push({ ok: t.disposed === true && t.contextLost === true, message: `teardown: dispose() + forceContextLoss() leaves isContextLost() true (${t.contextLost})` });
  out.push({ ok: (t.items || []).length === 6 && t.items.every(drawn), message: 'teardown: item canvases keep their last frame after the context is gone' });

  const rm = r.rm.state || {};
  const rring = (rm.items || []).find((i) => i.name === 'ring');
  out.push({ ok: rm.motion === 'reduced' && rm.gl === true && rring && rring.angle === 0 && rring.renders === 2 && (rm.items || []).every(drawn), message: `reduced motion: drawn, hover recolours without turning (angle ${rring?.angle}, renders ${rring?.renders})` });

  const m = r.mobile.state || {};
  const mn = (m.items || []).filter((i) => i.near);
  out.push({ ok: m.gl === true && m.contexts === 1 && mn.length > 0 && mn.every(drawn) && m.backingPixels <= m.budget, message: `mobile: one context, ${mn.length} near items drawn, ${m.backingPixels} px within budget` });
  return out;
}
