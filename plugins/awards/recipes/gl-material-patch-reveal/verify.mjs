// The verify idea: at .5 of the scrub window, the pixel at the DOM anchor (inside the circle) is coloured and a pixel
// in the far corner (outside) is grey; at the end the corner is coloured too. A patch that fails to compile, or a
// chunk replacement that misses its include, leaves both pixels grey (or the page throws), so the assertions fail.
const at = (f) => `(() => { const g = window.__awards.state().window; if (!g || !window.__awards.state().gl) return false; window.lenis.scrollTo(Math.round(g[0] + (g[1] - g[0]) * ${f}), { immediate: true, force: true }); return true; })()`;
const go = (f, ms = 600) => [{ type: 'waitFor', fn: at(f) }, { type: 'wait', ms }];
const staticTier = { type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" };

export const states = [
  { name: 'start', settle: 300, actions: go(0) },
  { name: 'mid', settle: 300, actions: go(0.5) },
  { name: 'end', settle: 300, actions: go(1) },
  { name: 'rm', reducedMotion: true, settle: 300, actions: go(0.5) },
  { name: 'static', settle: 300, actions: [staticTier, ...go(0.2)] },
  { name: 'mobile', viewport: 'mobile', settle: 300, actions: go(0.5) },
];

export function probe() {
  return { overflowX: document.documentElement.scrollWidth - innerWidth };
}

export function assert(r) {
  const out = [];
  const S = (k) => r[k]?.state || {};
  const near = (v, x, e = 0.03) => Math.abs((v ?? NaN) - x) <= e;
  out.push({ ok: S('start').gl === true && S('start').outerSat < 0.05, message: `start: webgl on, corner grey (sat ${S('start').outerSat})` });
  // The key assertion.
  out.push({ ok: near(S('mid').p, 0.5) && S('mid').innerSat > 0.2 && S('mid').outerSat < 0.05, message: `mid: inside the circle sat ${S('mid').innerSat} (> .2), outside ${S('mid').outerSat} (< .05), p ${S('mid').p}` });
  out.push({ ok: S('mid').radius > 0 && S('mid').radius < S('mid').rMax, message: `mid: radius ${S('mid').radius} between the anchor and ${S('mid').rMax}` });
  out.push({ ok: near(S('end').p, 1) && S('end').innerSat > 0.2 && S('end').outerSat > 0.2, message: `end: corner coloured too (sat ${S('end').outerSat})` });
  // Reduced: no circle; the whole surface is part-way to colour, so both pixels sit between grey and their end value.
  const part = (k) => S('rm')[k] > 0.05 && S('rm')[k] < S('end')[k] - 0.05;
  out.push({ ok: S('rm').motion === 'reduced' && near(S('rm').p, 0.5) && S('rm').radius === S('rm').rMax && part('innerSat') && part('outerSat'), message: `rm: no circle, even partial colour (inner ${S('rm').innerSat}, outer ${S('rm').outerSat})` });
  out.push({ ok: S('static').motion === 'static' && S('static').outerSat > 0.2, message: `static: settled colour at p ${S('static').p} (sat ${S('static').outerSat})` });
  out.push({ ok: S('mobile').gl === true && S('mobile').innerSat > 0.2 && S('mobile').outerSat < 0.05 && r.mobile?.probe?.overflowX <= 0, message: `mobile: inner ${S('mobile').innerSat}, outer ${S('mobile').outerSat}, overflow ${r.mobile?.probe?.overflowX}px` });
  return out;
}
