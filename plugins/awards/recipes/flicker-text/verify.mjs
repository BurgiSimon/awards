export const states = [
  { name: 'top', scroll: 0, settle: 2200 },
  { name: 'hover', actions: [{ type: 'wait', ms: 2000 }, { type: 'hover', selector: '.links a' }, { type: 'wait', ms: 1200 }], settle: 100 },
  { name: 'rm', scroll: 0, reducedMotion: true, settle: 500 },
  { name: 'mobile', scroll: 0, viewport: 'mobile', settle: 2200 },
];
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.headlineGlyphs === 'Letters flicker in.'.length, message: `one span per glyph (${r.top.state?.headlineGlyphs})` });
  out.push({ ok: r.top.state?.mirrorText === 'Letters flicker in.', message: 'source text kept as a screen-reader mirror' });
  out.push({ ok: (r.top.state?.played ?? 0) >= 4 && r.top.state?.headlineOpacityMin === 1, message: `ladders complete with every glyph at opacity 1 (played ${r.top.state?.played})` });
  out.push({ ok: (r.hover.state?.hovers ?? 0) >= 1, message: 'hover replays the ladder' });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.headlineOpacityMin === 1, message: 'reduced motion: glyphs visible without the ladder' });
  out.push({ ok: r.mobile.state?.headlineOpacityMin === 1, message: 'mobile: settled' });
  return out;
}
