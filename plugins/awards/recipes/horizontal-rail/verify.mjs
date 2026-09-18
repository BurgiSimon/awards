export const states = [
  { name: 'top', scroll: 0, settle: 800 },
  { name: 'mid', scroll: 0.5, settle: 900 },
  { name: 'keyboard', scroll: 0.3, actions: [], settle: 600 },
  { name: 'keyed', actions: [{ type: 'focus', selector: '[data-rail]' }, { type: 'press', key: 'ArrowRight' }, { type: 'wait', ms: 900 }], settle: 100 },
  { name: 'rm', scroll: 0.5, reducedMotion: true, settle: 600 },
  { name: 'mobile', scroll: 0.5, viewport: 'mobile', settle: 800 },
];
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.native === false && (r.top.state?.x ?? -1) === 0, message: 'desktop: rail armed, track at x 0 at the top' });
  out.push({ ok: (r.mid.state?.x ?? 0) < -100 && (r.mid.state?.progress ?? 0) > 0.05, message: `vertical scroll drives the track sideways (x ${r.mid.state?.x}, progress ${r.mid.state?.progress})` });
  out.push({ ok: (r.top.state?.pinned ?? 1) === 0, message: 'sticky stage, no pin' });
  out.push({ ok: r.keyed.state?.keySteps === 1 && (r.keyed.state?.scrollY ?? 0) > 100, message: `ArrowRight on the focused rail scrolls the page (${r.keyed.state?.scrollY}px)` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.native === true && r.rm.state?.stageOverflow === 'auto', message: 'reduced motion: native horizontal scroller' });
  out.push({ ok: r.mobile.state?.native === true && r.mobile.state?.stageOverflow === 'auto' && (r.mobile.state?.x ?? 1) === 0, message: `touch: native overflow, no transform (native ${r.mobile.state?.native})` });
  return out;
}
