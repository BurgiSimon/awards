const TAU = Math.PI * 2;
const hoverDwell = [{ type: 'hover', selector: '[data-turn]' }, { type: 'wait', ms: 1500 }];

export const states = [
  { name: 'rest', settle: 600 },
  { name: 'hover', settle: 600, actions: hoverDwell },
  { name: 'fallback', settle: 600, actions: [{ type: 'waitFor', fn: "(history.replaceState(null, '', '?worker=0'), true)" }, { type: 'reload' }, ...hoverDwell] },
  { name: 'rm', reducedMotion: true, settle: 600, actions: [{ type: 'hover', selector: '[data-turn]' }, { type: 'wait', ms: 1500 }] },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: hoverDwell },
];

const lit = (px) => Array.isArray(px) && px[3] > 200 && px[0] + px[1] + px[2] > 60;
const clear = (px) => Array.isArray(px) && px[3] === 0;

export function assert(r) {
  const out = [];
  const s = r.rest.state || {};
  out.push({ ok: s.gl === true && lit(s.pixels?.centre) && clear(s.pixels?.corner), message: `rest: object at the centre, background in the corner (centre ${s.pixels?.centre}, corner ${s.pixels?.corner})` });
  // three's LatheGeometry emits segments + 1 columns (the seam is duplicated for UVs) of `points` vertices each.
  out.push({ ok: s.segments > 0 && s.vertexCount === (s.segments + 1) * s.points, message: `rest: lathe vertex count ${s.vertexCount} = (${s.segments} + 1) × ${s.points}` });
  out.push({ ok: s.maps === 'worker' && s.turn === 0, message: `rest: maps built in the Blob worker (${s.maps}), no turn without a pointer (${s.turn})` });

  const h = r.hover.state || {};
  out.push({ ok: h.pointerFine === true && Math.abs(h.turn - TAU) < 1e-3 && h.turns === 1 && h.turning === false, message: `hover: one full quantised revolution after the dwell (turn ${h.turn}, turns ${h.turns})` });

  const f = r.fallback.state || {};
  out.push({ ok: f.gl === true && f.maps === 'main' && lit(f.pixels?.centre) && Math.abs(f.turn - TAU) < 1e-3, message: `fallback: same-thread maps render and turn (maps ${f.maps}, turn ${f.turn})` });

  const rm = r.rm.state || {};
  out.push({ ok: rm.motion === 'reduced' && rm.gl === true && lit(rm.pixels?.centre) && rm.turn === 0 && rm.tinted === true, message: `reduced motion: drawn still, hover tints without turning (turn ${rm.turn}, tinted ${rm.tinted})` });

  const m = r.mobile.state || {};
  out.push({ ok: m.gl === true && m.pointerFine === false && m.turn === 0 && lit(m.pixels?.centre), message: `mobile (coarse pointer): drawn, hover leaves rotation at 0 (fine ${m.pointerFine}, turn ${m.turn})` });
  return out;
}
