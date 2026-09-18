export const states = [
  { name: 'top', scroll: 0, settle: 1200 },
  { name: 'quiet', actions: [{ type: 'click', selector: '[data-preset="quiet"]' }, { type: 'wait', ms: 400 }], settle: 100 },
  { name: 'rm', reducedMotion: true, settle: 600 },
  { name: 'mobile', viewport: 'mobile', settle: 1200 },
];
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.gl === true && ['high', 'mid', 'low'].includes(r.top.state?.tier), message: `WebGL with the composer (tier ${r.top.state?.tier}, post ${r.top.state?.post})` });
  out.push({ ok: r.top.state?.preset === 'hero' && r.top.state?.bloom === 1.5 && r.quiet.state?.preset === 'quiet' && r.quiet.state?.bloom === 0.25, message: 'presets switch between fixed intensities' });
  const a = r.top.state?.halo || [0, 0, 0, 0], b = r.quiet.state?.halo || [0, 0, 0, 0];
  const lum = (p) => p[0] * 0.3 + p[1] * 0.59 + p[2] * 0.11;
  out.push({ ok: !r.top.state?.post || lum(a) > lum(b) + 4, message: `hero preset blooms brighter than quiet at the halo (${lum(a).toFixed(0)} vs ${lum(b).toFixed(0)})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.gl === false, message: 'reduced motion: still image, no post' });
  out.push({ ok: r.mobile.state?.gl === true, message: 'mobile renders' });
  return out;
}
