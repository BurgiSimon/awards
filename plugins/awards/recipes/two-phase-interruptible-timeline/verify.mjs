// Sampler installed in the page: records { t, y } (timeline time, first link's translateY in px) on every frame,
// starting with the frame on which the toggle is clicked. `at` is the fraction of the hinge I to wait for.
const clickAt = (at) => ({
  type: 'waitFor',
  timeout: 8000,
  fn: `(() => {
    const s = window.__awards.state();
    if (!(s.open && s.time >= ${at} * s.hinge)) return false;
    const link = document.querySelector('[data-nav-link]');
    const y = () => new DOMMatrixReadOnly(getComputedStyle(link).transform).m42;
    const trace = window.__trace = [{ t: s.time, y: y() }];
    const tick = () => { const st = window.__awards.state(); trace.push({ t: st.time, y: y(), open: st.open }); if (trace.length < 240) requestAnimationFrame(tick); };
    document.querySelector('[data-nav-toggle]').click();
    requestAnimationFrame(tick);
    return true;
  })()`,
});
const open = { type: 'click', selector: '[data-nav-toggle]' };

export const states = [
  { name: 'rest', settle: 400 },
  { name: 'interrupt', actions: [open, clickAt(0.4), { type: 'wait', ms: 1500 }], settle: 100 },
  { name: 'full', actions: [open, { type: 'wait', ms: 1500 }, clickAt(1), { type: 'wait', ms: 2000 }], settle: 100 },
  { name: 'reopen', actions: [open, { type: 'wait', ms: 1500 }, open, { type: 'wait', ms: 150 }, open, { type: 'wait', ms: 1200 }], settle: 100 },
  { name: 'opened', actions: [open, { type: 'wait', ms: 1500 }], settle: 100 },
  { name: 'escape', actions: [open, { type: 'wait', ms: 1500 }, { type: 'press', key: 'Escape' }, { type: 'wait', ms: 1500 }], settle: 100 },
  { name: 'rm', reducedMotion: true, actions: [open, { type: 'wait', ms: 1000 }], settle: 100 },
  { name: 'mobile', viewport: 'mobile', actions: [open, { type: 'wait', ms: 1500 }], settle: 100 },
];

export function probe() {
  const panel = document.querySelector('[data-nav-panel]');
  const link = document.querySelector('[data-nav-link]');
  const rect = panel.getBoundingClientRect();
  return {
    trace: window.__trace || null,
    panelVisibility: getComputedStyle(panel).visibility,
    panelInert: panel.inert,
    panelLeft: rect.left, panelRight: rect.right, vw: innerWidth,
    linkTransform: getComputedStyle(link).transform,
    linkOpacity: getComputedStyle(link).opacity,
    linkHeight: link.getBoundingClientRect().height,
    active: document.activeElement?.tagName || '',
  };
}

export function assert(r) {
  const out = [];
  const rest = r.rest, it = r.interrupt, fu = r.full;
  out.push({ ok: rest.state?.open === false && rest.probe?.panelVisibility === 'hidden' && rest.probe?.panelInert === true && rest.state?.hinge > 0.5, message: `rest: panel hidden and inert, hinge I = ${rest.state?.hinge}` });

  // interrupt: close at ~40 % of I rewinds. The link moves monotonically back toward rest (translateY grows to +100 %),
  // with no step larger than half the travel, and the timeline reaches 0.
  const tr = it.probe?.trace || [];
  const h = it.probe?.linkHeight || 1;
  const until = tr.findIndex((p, i) => i > 0 && p.t === 0);
  const seg = tr.slice(0, until > 0 ? until + 1 : tr.length);
  const steps = seg.slice(1).map((p, i) => p.y - seg[i].y);
  const mono = steps.length >= 6 && steps.every((d) => d >= -0.5);
  const maxStep = Math.max(0, ...steps.map(Math.abs));
  out.push({ ok: tr.length > 6 && tr[0].t < 0.6 * (it.state?.hinge || 1), message: `interrupt: close requested before the hinge (t ${tr[0]?.t} of I ${it.state?.hinge})` });
  out.push({ ok: mono && maxStep < 0.5 * h, message: `interrupt: link returns monotonically, no jump (${steps.length} steps, max ${maxStep.toFixed(1)}px of ${h.toFixed(1)}px)` });
  out.push({ ok: tr.every((p) => p.t <= tr[0].t + 1e-3) && until > 0 && it.state?.time === 0 && it.state?.open === false && it.probe?.panelVisibility === 'hidden', message: `interrupt: timeline rewound to 0 without passing the hinge, panel hidden (end t ${it.state?.time})` });

  // full: a close at the hinge plays the close half forward past I, then returns to rest.
  const ft = fu.probe?.trace || [];
  const maxT = Math.max(0, ...ft.map((p) => p.t));
  out.push({ ok: ft[0]?.t === fu.state?.hinge && maxT > fu.state?.hinge + 0.2 && fu.state?.time === 0 && fu.probe?.panelVisibility === 'hidden', message: `full: close after the hinge plays forward (max t ${maxT} > I ${fu.state?.hinge}) and rests at 0` });

  out.push({ ok: r.opened.state?.paused === true && r.opened.state?.time === r.opened.state?.hinge && r.opened.state?.expanded === 'true' && r.opened.probe?.panelInert === false && /matrix\(1, 0, 0, 1, 0, 0\)|none/.test(r.opened.probe?.linkTransform || ''), message: `opened: held at the hinge, links settled (${r.opened.probe?.linkTransform})` });
  out.push({ ok: r.reopen.state?.open === true && r.reopen.state?.paused === true && r.reopen.state?.time === r.reopen.state?.hinge && r.reopen.probe?.linkOpacity === '1', message: `reopen during the close half rewinds to the hinge and holds (t ${r.reopen.state?.time})` });
  out.push({ ok: r.escape.state?.open === false && r.escape.state?.time === 0 && r.escape.probe?.active === 'BUTTON', message: `escape closes and returns focus to the toggle (${r.escape.probe?.active})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.open === true && r.rm.state?.time === r.rm.state?.hinge && r.rm.state?.linkY === 0 && /matrix\(1, 0, 0, 1, 0, 0\)|none/.test(r.rm.probe?.linkTransform || '') && r.rm.probe?.linkOpacity === '1', message: `reduced: opacity-only open, held at the hinge, no translate (${r.rm.probe?.linkTransform})` });
  out.push({ ok: r.mobile.state?.open === true && r.mobile.probe?.panelLeft >= 0 && r.mobile.probe?.panelRight <= r.mobile.probe?.vw && r.mobile.probe?.panelVisibility === 'visible', message: `mobile: panel opens inside the viewport (${r.mobile.probe?.panelLeft?.toFixed(0)}–${r.mobile.probe?.panelRight?.toFixed(0)} of ${r.mobile.probe?.vw})` });
  return out;
}
