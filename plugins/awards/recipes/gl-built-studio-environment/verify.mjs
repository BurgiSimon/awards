// Lit: the chrome knot shows a spread of tones and at least one highlight near white, from the baked environment alone.
// no-env: the same scene with scene.environment = null must lose at least half its mean luminance (there are no lamps).
export const states = [
  { name: 'lit', settle: 900 },
  { name: 'noEnv', settle: 900, actions: [{ type: 'waitFor', fn: 'window.__studio?.setEnv(false)' }, { type: 'wait', ms: 200 }] },
  { name: 'painted', settle: 900, actions: [{ type: 'click', selector: '[data-variant="painted"]' }, { type: 'wait', ms: 300 }] },
  { name: 'turning', settle: 1500 },
  { name: 'rm', reducedMotion: true, settle: 1500 },
  { name: 'mobile', viewport: 'mobile', settle: 900 },
];

const lit = (c) => !!c && c.n > 500 && c.std > 0.08 && c.max > 0.85;
const fmt = (c) => (c ? `mean ${c.mean}, std ${c.std}, max ${c.max}, n ${c.n}` : 'no sample');

export function assert(r) {
  const out = [];
  const a = r.lit.state || {}, z = r.noEnv.state || {}, p = r.painted.state || {};
  out.push({ ok: a.gl === true && a.variant === 'panels' && typeof a.bakeMs?.panels === 'number', message: `panel studio baked through PMREM (${a.bakeMs?.panels} ms)` });
  out.push({ ok: lit(a.chrome), message: `panels light the chrome: tonal spread and a highlight (${fmt(a.chrome)})` });
  out.push({ ok: z.envOn === false && !!z.chrome && !!a.chrome && z.chrome.mean <= a.chrome.mean * 0.5, message: `without the environment the chrome goes dark (${a.chrome?.mean} → ${z.chrome?.mean})` });
  out.push({ ok: p.variant === 'painted' && typeof p.bakeMs?.painted === 'number' && lit(p.chrome), message: `painted canvas studio lights the chrome too (${fmt(p.chrome)})` });
  const t = r.turning.state || {};
  out.push({ ok: t.motion === 'full' && t.turn > 0.05, message: `full tier turns the knot (${t.turn} rad)` });
  const rm = r.rm.state || {};
  out.push({ ok: rm.motion === 'reduced' && rm.gl === true && rm.turn === 0 && lit(rm.chrome), message: `reduced motion: lit and still (turn ${rm.turn}, ${fmt(rm.chrome)})` });
  const m = r.mobile.state || {};
  out.push({ ok: m.gl === true && lit(m.chrome), message: `mobile renders the lit chrome (${fmt(m.chrome)})` });
  return out;
}
