export const states = [
  { name: 'top', scroll: 0, settle: 800 },
  // Hover starts the charge tween; the test hook pauses it at progress .5, as a scrub would.
  { name: 'hover', settle: 600, actions: [{ type: 'hover', selector: '[data-charge]' }, { type: 'wait', ms: 120 }, { type: 'waitFor', fn: 'window.__uniformTweens.seek(.5)' }, { type: 'wait', ms: 150 }] },
  // Leave mid-tween: the exit must start from where the entrance was, and the entrance must not resume after it.
  { name: 'interrupt', settle: 600, actions: [{ type: 'hover', selector: '[data-charge]' }, { type: 'wait', ms: 200 }, { type: 'move', x: 4, y: 4, steps: 1 }, { type: 'wait', ms: 1400 }] },
  { name: 'preset', settle: 600, actions: [{ type: 'click', selector: '[data-preset="charged"]' }, { type: 'wait', ms: 1300 }] },
  { name: 'rm', reducedMotion: true, settle: 600, actions: [{ type: 'hover', selector: '[data-charge]' }, { type: 'wait', ms: 700 }] },
  { name: 'mobile', viewport: 'mobile', settle: 800, actions: [{ type: 'click', selector: '[data-preset="charged"]' }, { type: 'wait', ms: 1300 }] },
];

const near = (a, b, eps) => typeof a === 'number' && Math.abs(a - b) <= eps;

export function assert(r) {
  const out = [];
  const top = r.top.state || {};
  out.push({ ok: top.gl === true && top.uniforms?.hover === 0, message: `WebGL renders at rest (gl ${top.gl}, uHover ${top.uniforms?.hover})` });

  const h = r.hover.state || {};
  const ht = h.hoverTween || {};
  out.push({ ok: near(ht.progress, 0.5, 1e-6) && near(h.uniforms?.hover, ht.easeAtProgress, 1e-6) && !near(h.uniforms?.hover, 0.5, 0.05), message: `uHover at progress .5 equals ${ht.ease}(.5) = ${ht.easeAtProgress} (got ${h.uniforms?.hover})` });
  const px = h.pixel || [], a = h.rest || [], b = h.target || [];
  const between = px.length && [0, 1, 2].every((i) => px[i] >= Math.min(a[i], b[i]) - 3 && px[i] <= Math.max(a[i], b[i]) + 3);
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  out.push({ ok: between && dist(px, a) > 12 && dist(px, b) > 12, message: `read-back tint [${px.slice(0, 3)}] lies between rest [${a}] and target [${b}]` });

  const it = r.interrupt.state || {};
  const log = it.log || [];
  let prev = it.before, worst = 0, first = null;
  for (const { v, dt } of log) {
    const allowed = it.maxRate * Math.max(dt, 1 / 60) * 1.25 + 0.01;
    const excess = Math.abs(v - prev) / allowed;
    if (first === null) first = excess;
    worst = Math.max(worst, excess);
    prev = v;
  }
  out.push({ ok: typeof it.before === 'number' && it.before > 0.05 && it.before < 0.95, message: `retarget happened mid-tween (uHover ${it.before?.toFixed?.(3)})` });
  out.push({ ok: log.length > 3 && first !== null && first <= 1, message: `first frame after the retarget moves less than one ease step (${first?.toFixed(2)} of the bound)` });
  out.push({ ok: log.length > 3 && worst <= 1 && near(it.uniforms?.hover, 0, 1e-6), message: `no jump anywhere after the retarget (worst ${worst.toFixed(2)} of the bound), settles at 0 (${it.uniforms?.hover})` });

  const p = r.preset.state || {};
  out.push({ ok: p.preset === 'charged' && near(p.uniforms?.vignette, 0.75, 1e-6) && near(p.uniforms?.density, 64, 1e-6), message: 'post preset values tween to the charged look' });

  const rm = r.rm.state || {};
  out.push({ ok: rm.motion === 'reduced' && rm.gl === true && near(rm.uniforms?.hover, 1, 1e-6) && rm.uniforms?.swell === 0, message: `reduced motion: colour charge kept, spatial swell off (hover ${rm.uniforms?.hover}, swell ${rm.uniforms?.swell})` });
  const m = r.mobile.state || {};
  out.push({ ok: m.gl === true && m.preset === 'charged' && near(m.uniforms?.grain, 0.12, 1e-6), message: 'mobile renders and switches presets' });
  return out;
}
