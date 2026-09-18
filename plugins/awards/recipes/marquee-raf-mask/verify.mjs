// States scroll ≈ 20 % so the band is well inside the viewport on every device; at the very end of the page it is off-screen and must stop.
export const states = [
  { name: 'top', scroll: 0.2, settle: 1200 },
  // Scroll by wheel inside the actions so no scroll happens after the hover (a scroll under the pointer would re-enter the band).
  { name: 'hover', actions: [{ type: 'wheel', dy: 600 }, { type: 'wait', ms: 1200 }, { type: 'hover', selector: '[data-marquee]' }, { type: 'wait', ms: 1500 }], settle: 100 },
  { name: 'focus', scroll: 0.2, actions: [{ type: 'focus', selector: '[data-track] a' }, { type: 'wait', ms: 900 }], settle: 100 },
  { name: 'offscreen', scroll: 1, settle: 900 },
  { name: 'rm', scroll: 0.2, reducedMotion: true, settle: 900 },
  { name: 'mobile', scroll: 0.2, viewport: 'mobile', settle: 1200 },
];
export function probe() {
  const track = document.querySelector('[data-track]');
  return { transform: getComputedStyle(track).transform, clones: track.querySelectorAll('[data-clone]').length, overflow: getComputedStyle(document.querySelector('[data-marquee]')).overflowX, focusedInside: !!document.activeElement?.closest('[data-marquee]') };
}
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.running === true && (r.top.state?.movedLast500 ?? 0) > 20, message: `marquee moving (${r.top.state?.movedLast500} px in 500 ms)` });
  out.push({ ok: (r.top.probe?.clones ?? 0) >= 6, message: `track duplicated to cover the viewport (${r.top.probe?.clones} clones)` });
  out.push({ ok: r.hover.state?.paused === true && (r.hover.state?.movedLast500 ?? 99) < 3, message: `paused on hover (${r.hover.state?.movedLast500} px in 500 ms)` });
  out.push({ ok: r.offscreen.state?.running === false, message: 'stops while off-screen' });
  out.push({ ok: r.focus.probe?.focusedInside === true && r.focus.state?.paused === true, message: 'paused when a link inside receives focus' });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.running === false && r.rm.probe?.transform === 'none' && r.rm.probe?.overflow === 'auto', message: 'reduced motion: static, hand-scrollable row' });
  out.push({ ok: (r.mobile.state?.movedLast500 ?? 0) > 20, message: `mobile marquee moving (${r.mobile.state?.movedLast500} px)` });
  return out;
}
