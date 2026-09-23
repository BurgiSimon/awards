const third = '.rows li:nth-child(3) [data-row]';
const onCase = { type: 'waitFor', fn: "location.pathname.endsWith('case.html')", timeout: 8000 };

export const states = [
  { name: 'top', settle: 800 },
  // Mid-exit: sample while the rise is running and before the push.
  { name: 'mid', actions: [{ type: 'click', selector: third }, { type: 'waitFor', fn: 'window.__awards.state().exit.time >= 0.6' }] },
  { name: 'done', actions: [{ type: 'click', selector: third }, onCase, { type: 'wait', ms: 800 }] },
  { name: 'rm', reducedMotion: true, actions: [{ type: 'click', selector: third }, onCase, { type: 'wait', ms: 300 }] },
  { name: 'mobile', viewport: 'mobile', actions: [{ type: 'click', selector: third }, onCase, { type: 'wait', ms: 800 }] },
];

export function probe() {
  return {
    h1: document.querySelector('h1')?.textContent.trim(),
    focused: document.activeElement?.hasAttribute('data-focus') ?? false,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    rows: [...document.querySelectorAll('[data-row]')].map((r) => ({ top: r.getBoundingClientRect().top, opacity: Number(getComputedStyle(r).opacity), chosen: r.hasAttribute('data-chosen') })),
  };
}

export function assert(r) {
  const out = [];
  const mid = r.mid, ex = mid.state?.exit ?? {};
  const rows = mid.probe?.rows ?? [];
  const chosen = rows.findIndex((x) => x.chosen);

  out.push({ ok: r.top.state?.view === 'index' && r.top.probe?.rows?.length === 6 && r.top.probe.rows.every((x) => x.opacity === 1), message: 'index renders six visible rows' });

  // The chosen row rises; the route has not changed yet.
  out.push({ ok: chosen === 2 && ex.chosen === 2, message: `third row marked as chosen (${chosen})` });
  out.push({ ok: chosen === 2 && rows[2].top < ex.startTop - 40, message: `mid-exit: chosen row above its start (${rows[2]?.top?.toFixed(0)} < ${ex.startTop?.toFixed?.(0)})` });
  out.push({ ok: mid.state?.path === 'index.html' && ex.time < ex.rise, message: `mid-exit: route unchanged during the rise (${mid.state?.path}, t ${ex.time?.toFixed?.(2)})` });

  // Siblings fade in order of distance: nearer rows are further gone.
  const byDist = new Map();
  rows.forEach((x, i) => { if (i !== 2) { const d = Math.abs(i - 2); byDist.set(d, Math.max(byDist.get(d) ?? 0, x.opacity)); } });
  const ops = [1, 2, 3].map((d) => byDist.get(d));
  const ordered = ops.every((o) => typeof o === 'number') && ops[0] <= ops[1] && ops[1] <= ops[2] && ops[2] - ops[0] > 0.15;
  out.push({ ok: ordered, message: `mid-exit: sibling opacity rises with distance from the chosen row (d1..d3 ${ops.map((o) => o?.toFixed(2)).join(' / ')})` });

  // The route changes after the rise, at the scheduled push.
  const d = r.done.state ?? {}, de = d.exit ?? {};
  out.push({ ok: d.path === 'case.html' && d.search === '?p=3' && r.done.probe?.h1 === 'Northlight Observatory', message: `done: case 03 loaded (${d.path}${d.search}, "${r.done.probe?.h1}")` });
  out.push({ ok: de.timing === 'desktop' && de.leftAt >= de.rise && de.leftAt >= de.push - 0.05, message: `done: route pushed after the rise (${de.leftAt?.toFixed?.(2)} s ≥ rise ${de.rise}, push ${de.push})` });
  out.push({ ok: d.loads === 1 && d.enters === 2 && r.done.probe?.focused, message: 'done: no reload, renderer entered twice, focus on the new heading' });

  // Reduced motion: the route changes at once with no tween.
  const rm = r.rm.state ?? {};
  out.push({ ok: rm.motion === 'reduced' && rm.path === 'case.html' && rm.exit?.tweened === false && rm.exit?.leftAt < 0.05 && rm.tweens === 0, message: `rm: immediate route change, no tween (${rm.exit?.leftAt?.toFixed?.(3)} s, ${rm.tweens} tweens)` });

  // Phone timing set.
  const m = r.mobile.state ?? {}, me = m.exit ?? {};
  out.push({ ok: m.path === 'case.html' && me.timing === 'phone' && me.rise === 0.8 && me.push === 1.15 && me.leftAt >= 1.1 && me.leftAt < 1.6, message: `mobile: phone timing set, route pushed at ${me.leftAt?.toFixed?.(2)} s` });
  out.push({ ok: [r.top, r.done, r.mobile].every((s) => s.probe?.overflow === false), message: 'no horizontal overflow' });
  return out;
}
