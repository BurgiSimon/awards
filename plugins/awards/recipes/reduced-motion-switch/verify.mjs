export const states = [
  { name: 'top', scroll: 0, settle: 1200 },
  { name: 'end', scroll: 1, settle: 1600 },
  { name: 'rm', scroll: 1, reducedMotion: true, settle: 900 },
  { name: 'static', scroll: 1, actions: [{ type: 'click', selector: '[data-tier="static"]' }, { type: 'wait', ms: 400 }], settle: 600 },
  { name: 'override-full', scroll: 0, reducedMotion: true, actions: [{ type: 'click', selector: '[data-tier="full"]' }, { type: 'wait', ms: 600 }], settle: 400 },
  { name: 'mobile', scroll: 1, viewport: 'mobile', settle: 1600 },
];
export function probe() {
  return { marqueeTransform: getComputedStyle(document.querySelector('[data-marquee] .track')).transform };
}
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.motion === 'full' && r.top.state?.tickerSubscribed === true, message: 'full tier by default with the marquee on the ticker' });
  out.push({ ok: (r.top.state?.marqueeX ?? 0) < -5, message: `marquee advanced (${r.top.state?.marqueeX})` });
  out.push({ ok: (r.end.state?.panelOpacity ?? 0) === 1, message: 'panels revealed at the end' });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.tickerSubscribed === false && r.rm.probe?.marqueeTransform === 'none' && (r.rm.state?.orbitRotation ?? 1) === 0, message: 'reduced tier: no ticker, marquee static, orbit parked' });
  out.push({ ok: (r.rm.state?.panelOpacity ?? 0) === 1, message: 'reduced tier keeps panels readable' });
  out.push({ ok: r.static.state?.motion === 'static' && r.static.state?.override === 'static' && r.static.state?.tickerSubscribed === false && (r.static.state?.panelOpacity ?? 0) === 1, message: 'static override: everything settled, no ticker' });
  out.push({ ok: r['override-full'].state?.motion === 'full' && r['override-full'].state?.reducedMotion === true, message: 'user override to full beats the OS reduce setting' });
  out.push({ ok: (r.mobile.state?.panelOpacity ?? 0) === 1, message: 'mobile panels revealed' });
  return out;
}
