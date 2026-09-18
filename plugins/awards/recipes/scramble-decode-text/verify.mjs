export const states = [
  { name: 'top', scroll: 0, settle: 2800 },
  { name: 'replay', actions: [{ type: 'wait', ms: 2600 }, { type: 'click', selector: '[data-replay]' }, { type: 'wait', ms: 200 }], settle: 100 },
  { name: 'rm', scroll: 0, reducedMotion: true, settle: 400 },
  { name: 'mobile', scroll: 0, viewport: 'mobile', settle: 2800 },
];
export function probe() { return { mirror: document.querySelector('[data-scramble] .sr-only')?.textContent, ariaHidden: document.querySelector('[data-scramble] .live')?.getAttribute('aria-hidden') }; }
export function assert(r) {
  const out = [];
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  out.push({ ok: (r.top.state?.done ?? 0) === 3 && eq(r.top.state?.finalTexts, r.top.state?.sources), message: `all readouts decoded to their source text (${(r.top.state?.finalTexts || []).join(' / ')})` });
  out.push({ ok: r.top.probe?.mirror === '64.8378° S' && r.top.probe?.ariaHidden === 'true', message: 'screen-reader mirror kept, live span hidden from AT' });
  out.push({ ok: (r.replay.state?.runs ?? 0) === 2 && !eq(r.replay.state?.finalTexts, r.replay.state?.sources), message: 'replay is mid-scramble 200 ms after the click' });
  out.push({ ok: r.rm.state?.motion === 'reduced' && eq(r.rm.state?.finalTexts, r.rm.state?.sources), message: 'reduced motion: final text immediately' });
  out.push({ ok: eq(r.mobile.state?.finalTexts, r.mobile.state?.sources), message: 'mobile decoded' });
  return out;
}
