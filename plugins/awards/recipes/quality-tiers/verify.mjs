export const states = [
  { name: 'top', scroll: 0, settle: 600 },
  { name: 'high', actions: [{ type: 'click', selector: '[data-force="high"]' }, { type: 'wait', ms: 400 }], settle: 100 },
  { name: 'low', actions: [{ type: 'click', selector: '[data-force="low"]' }, { type: 'wait', ms: 400 }], settle: 100 },
  { name: 'rm', reducedMotion: true, actions: [{ type: 'click', selector: '[data-force="high"]' }, { type: 'wait', ms: 400 }], settle: 100 },
  { name: 'mobile', viewport: 'mobile', settle: 600 },
];
export function assert(r) {
  const out = [];
  const tiers = ['high', 'mid', 'low'];
  out.push({ ok: tiers.includes(r.top.state?.detected) && r.top.state?.attr === r.top.state?.tier, message: `detected tier "${r.top.state?.detected}" written to data-quality (fps ${r.top.state?.fps}, gpu ${r.top.state?.renderer})` });
  const expected = { high: 600, mid: 240, low: 0 };
  out.push({ ok: r.top.state?.particles === expected[r.top.state?.tier], message: `particle budget follows the tier (${r.top.state?.particles} for ${r.top.state?.tier})` });
  out.push({ ok: r.high.state?.tier === 'high' && r.high.state?.particles === 600 && r.high.state?.running === true && r.high.state?.canvasHidden === false, message: 'forced high: full particle field on the canvas' });
  out.push({ ok: r.low.state?.tier === 'low' && r.low.state?.particles === 0 && r.low.state?.running === false && r.low.state?.stillHidden === false && r.low.state?.canvasHidden === true, message: 'forced low: still image instead of a stuttering field' });
  out.push({ ok: (r.high.state?.canvasSize?.[0] ?? 0) <= 1920, message: `pixel budget capped (${r.high.state?.canvasSize})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.particles === 0 && r.rm.state?.running === false, message: 'reduced motion overrides even a forced high tier' });
  out.push({ ok: tiers.includes(r.mobile.state?.tier), message: `mobile probe resolves a tier (${r.mobile.state?.tier})` });
  return out;
}
