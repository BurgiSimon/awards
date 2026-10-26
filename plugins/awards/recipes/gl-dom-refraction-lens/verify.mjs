// The glass shows the page bent through it (text and hairlines inside, colour split at the edges), travels between
// section anchors on a spring and settles there; reduced motion places it without travel or spin.
// Layout: topbar ≈ 60 px, three 110vh sections, a 100vh footer; at 900 px the second section fills the middle band at 0.36.
export const states = [
  { name: 'hero', scroll: 0, settle: 1800 },
  { name: 'travel', scroll: 0.36, settle: 120 },
  { name: 'second', scroll: 0.36, settle: 3000 },
  { name: 'close', scroll: 1, settle: 3000 },
  { name: 'rm', scroll: 0.36, reducedMotion: true, settle: 400 },
  { name: 'mobile', scroll: 0, viewport: 'mobile', settle: 1800 },
];
export async function probe() {
  return window.__lens ? { gl: true, ...window.__lens.sample() } : { gl: false };
}
export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const pr = (n) => r[n]?.probe || {};
  const out = [];
  const h = st('hero');
  out.push({ ok: h.gl === true && h.canvasAriaHidden && Math.abs(h.x - h.vw * 0.5) < 4 && h.err < 2, message: `hero: the glass sits at its anchor (x ${h.x} of ${h.vw}, error ${h.err})` });
  out.push({ ok: (pr('hero').opaque ?? 0) >= 70 && (pr('hero').lumSd ?? 0) > 12, message: `the glass shows the page through it: ${pr('hero').opaque}/81 samples opaque, luminance spread ${pr('hero').lumSd}` });
  out.push({ ok: (pr('hero').maxChroma ?? 0) > 10 && h.taps === 12, message: `dispersion splits colour at the edges (max chroma ${pr('hero').maxChroma}, ${h.taps} taps)` });
  out.push({ ok: (h.repaints ?? 0) > 0 && h.region > 2 * h.r, message: `the page is repainted around the glass (${h.repaints} repaints, region ${h.region} px for radius ${h.r})` });
  out.push({ ok: (st('travel').err ?? 0) > 20, message: `the glass travels on a spring to the next anchor (still ${st('travel').err} px away after 120 ms)` });
  const s = st('second');
  out.push({ ok: Math.abs(s.x - s.vw * 0.76) < 4 && s.err < 2, message: `second section: settled at its anchor (x ${s.x}, target ${Math.round(s.vw * 0.76)}, error ${s.err})` });
  const c = st('close');
  out.push({ ok: Math.abs(c.x - c.vw * 0.74) < 4 && c.err < 2 && (pr('close').opaque ?? 0) >= 70, message: `footer: the glass settles beside the closing line (x ${c.x})` });
  out.push({ ok: st('rm').motion === 'reduced' && st('rm').err === 0 && st('rm').rotY === 0, message: `reduced motion: placed at the anchor with no travel and no spin (error ${st('rm').err}, rotation ${st('rm').rotY})` });
  out.push({ ok: st('mobile').gl === true && st('mobile').taps === 6 && (pr('mobile').opaque ?? 0) >= 70, message: `mobile: 6 dispersion taps, the glass renders (${pr('mobile').opaque}/81 opaque)` });
  return out;
}
