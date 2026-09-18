export const states = [
  // The reveal is 1.4 s on the full tier; wait on the page's own progress, not a guess, because
  // SwiftShader can stall rAF for seconds on a first shader compile.
  { name: 'top', actions: [{ type: 'waitFor', fn: 'window.__awards.state().progress === 1 || window.__awards.state().gl === false' }], settle: 200 },
  { name: 'fallback', actions: [{ type: 'click', selector: '[data-fallback]' }, { type: 'wait', ms: 200 }], settle: 100 },
  { name: 'rm', reducedMotion: true, settle: 800 },
  { name: 'mobile', viewport: 'mobile', actions: [{ type: 'waitFor', fn: 'window.__awards.state().progress === 1 || window.__awards.state().gl === false' }], settle: 200 },
];
export function probe() {
  const h = document.querySelector('[data-mirror]');
  return { tag: h.tagName, text: h.textContent.trim(), color: getComputedStyle(h).color, canvasHidden: document.querySelector('[data-gl]').getAttribute('aria-hidden') };
}
export function assert(r) {
  const out = [];
  const top = r.top.state || {};
  out.push({ ok: top.gl === true && top.glyphs >= 14, message: `WebGL text rendered from a runtime atlas (${top.glyphs} glyphs, ${top.atlas?.px})` });
  out.push({ ok: top.atlas?.source === 'runtime' && top.atlas?.chars >= 10, message: `the atlas is built in the page from the system stack (${top.atlas?.chars} glyphs rasterised)` });
  // A band, not "> 0": a shader that renders the whole quad opaque also puts ink in the rect, and
  // that is exactly what a zero fwidth divisor did here. Text covers roughly a fifth of its own box.
  const inked = (s) => (s?.ink?.fraction ?? 0) > 0.08 && (s.ink.fraction) < 0.45;
  out.push({ ok: inked(top), message: `ink covers a line of text, not the whole quad (${top.ink?.ink}/${top.ink?.of} px, ${top.ink?.fraction})` });
  out.push({ ok: r.top.probe?.tag === 'H1' && r.top.probe?.text === top.mirror && top.canvasAriaHidden === true, message: 'the string is a real heading and the canvas is aria-hidden' });
  const fb = r.fallback.state || {};
  out.push({ ok: fb.gl === false && fb.disposed === true, message: 'the fallback button disposes WebGL' });
  out.push({ ok: r.fallback.probe?.color === 'rgb(26, 28, 28)' && r.fallback.probe?.text === fb.mirror, message: `the DOM text takes the ink back (${r.fallback.probe?.color})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.progress === 1 && inked(r.rm.state), message: 'reduced motion: the headline is drawn settled, not animated' });
  out.push({ ok: r.mobile.state?.gl === true && inked(r.mobile.state), message: 'mobile renders the headline' });
  return out;
}
