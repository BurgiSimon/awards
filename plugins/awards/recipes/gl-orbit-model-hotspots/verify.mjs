// Every state opens the dialog first. The probe samples the camera every 60 ms for ~1.8 s (a fly-to is judged on the
// whole curve, not one pair of frames), then reads a fresh render back with readPixels on a 7 × 11 grid, and the
// laid-out hotspot buttons, poster and canvas.
const OPEN = [{ type: 'click', selector: '[data-open]' }, { type: 'wait', ms: 1400 }];

export const states = [
  { name: 'open', settle: 300, actions: OPEN },
  // Drag right and far down: azimuth turns, the polar angle would leave the band without the clamp.
  { name: 'drag', settle: 300, actions: [...OPEN, { type: 'move', x: 200, y: 200, steps: 2 }, { type: 'down' }, { type: 'move', x: 500, y: 650, steps: 12 }, { type: 'up' }, { type: 'wait', ms: 1200 }] },
  { name: 'hotspot', settle: 300, actions: [...OPEN, { type: 'click', selector: '[data-zone="tower"]' }] },
  // Keyboard path: arrows on the focused stage, then Tab to the first hotspot and Enter.
  { name: 'keys', settle: 300, actions: [...OPEN, { type: 'focus', selector: '[data-stage]' }, ...Array(3).fill({ type: 'press', key: 'ArrowLeft' }), ...Array(8).fill({ type: 'press', key: 'ArrowUp' }), { type: 'wait', ms: 1200 }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 1600 }] },
  { name: 'close', settle: 300, actions: [...OPEN, { type: 'press', key: 'Escape' }, { type: 'wait', ms: 200 }] },
  { name: 'rm', reducedMotion: true, settle: 300, actions: [...OPEN, { type: 'click', selector: '[data-zone="tower"]' }] },
  { name: 'static', settle: 300, actions: [{ type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" }, ...OPEN, { type: 'click', selector: '[data-zone="tower"]' }] },
  { name: 'mobile', viewport: 'mobile', settle: 300, actions: [...OPEN, { type: 'click', selector: '[data-zone="courtyard"]' }] },
];

export async function probe() {
  const s = () => window.__awards.state();
  const zone = s().zone;
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const samples = [];
  for (let i = 0; i < 30; i++) {
    const st = s();
    samples.push({ d: zone ? Math.round(dist(st.cam.target, st.zones[zone]) * 1000) / 1000 : null, phi: st.cam.phi, theta: st.cam.theta, radius: st.cam.radius });
    await new Promise((r) => setTimeout(r, 60));
  }
  const $ = (q) => document.querySelector(q);
  const stage = $('[data-stage]').getBoundingClientRect();
  const hs = [...document.querySelectorAll('[data-zone]')].map((b) => {
    const r = b.getBoundingClientRect();
    return { zone: b.dataset.zone, pressed: b.getAttribute('aria-pressed'), h: Math.round(r.height), shown: getComputedStyle(b).display !== 'none' && r.width > 0, inStage: r.left >= stage.left - 1 && r.right <= stage.right + 1 && r.top >= stage.top - 1 && r.bottom <= stage.bottom + 1, transform: getComputedStyle(b).transform };
  });
  const poster = $('[data-poster]');
  return {
    samples,
    px: window.__glSample?.() ?? null,
    hs,
    stage: { w: Math.round(stage.width), h: Math.round(stage.height) },
    posterDisplay: getComputedStyle(poster).display,
    posterLoaded: poster.complete && poster.naturalWidth > 0,
    canvasDisplay: getComputedStyle($('[data-gl]')).display,
    dialogOpen: $('[data-viewer]').open,
    focused: document.activeElement?.dataset?.zone || (document.activeElement?.hasAttribute('data-open') ? 'opener' : document.activeElement?.tagName),
    lenisStopped: window.lenis?.isStopped ?? null,
    figure: $('[data-detail-figure]').textContent,
    overflowX: document.documentElement.scrollWidth - innerWidth,
  };
}

const GROUND = [26, 28, 28];
const drawn = (px) => (px || []).filter((p) => Math.abs(p[0] - GROUND[0]) + Math.abs(p[1] - GROUND[1]) + Math.abs(p[2] - GROUND[2]) > 30).length;
const accent = (px) => (px || []).filter(([r, g, b]) => r > 140 && g > 100 && r - b > 90).length;
const changed = (a, b) => (a || []).filter((p, i) => b?.[i] && Math.abs(p[0] - b[i][0]) + Math.abs(p[1] - b[i][1]) + Math.abs(p[2] - b[i][2]) > 30).length;

export function assert(r) {
  const out = [];
  const st = (k) => r[k]?.state || {};
  const P = (k) => r[k]?.probe || {};
  const S = (k) => P(k).samples || [];
  const [pMin, pMax] = st('open').clamp?.polar || [0, 0];
  const inBand = (phi) => phi >= pMin - 1e-3 && phi <= pMax + 1e-3;
  const range = (a) => (a.length ? `${Math.min(...a)}–${Math.max(...a)}` : 'none');

  const o = st('open');
  out.push({ ok: o.open === true && o.gl === true && P('open').canvasDisplay === 'block' && P('open').posterDisplay === 'none' && drawn(P('open').px) >= 15, message: `dialog open with WebGL: model drawn on ${drawn(P('open').px)} / 77 read-back pixels, poster hidden` });
  out.push({ ok: P('open').hs?.every((h) => h.shown && h.inStage && h.h >= 44 && h.transform !== 'none'), message: `four hotspot buttons pinned over the canvas, inside the stage, ${P('open').hs?.map((h) => h.h).join('/')} px tall` });

  // Drag: azimuth turns, polar pinned to the band, the rendered view changes.
  const d = st('drag'), dTheta = Math.abs((d.cam?.theta ?? 0) - (o.cam?.theta ?? 0));
  out.push({ ok: d.drags === 1 && dTheta > 0.8 && Math.abs(d.cam?.theta - d.goal?.theta) < 0.01, message: `drag turns the azimuth by ${dTheta.toFixed(2)} rad and settles on the goal` });
  out.push({ ok: Math.abs(d.cam?.phi - pMin) < 0.005 && S('drag').every((s) => inBand(s.phi)) && inBand(d.cam?.phi), message: `polar angle held at the clamp (${d.cam?.phi}, band ${pMin}–${pMax}) through a drag that would carry it past` });
  out.push({ ok: changed(P('open').px, P('drag').px) >= 10 && drawn(P('drag').px) >= 15, message: `the rendered view moved: ${changed(P('open').px, P('drag').px)} / 77 pixels changed` });

  // Hotspot: the camera flies (in flight on the first samples) and lands on the zone; the zone renders in the accent.
  const h = S('hotspot'), hl = h.at(-1) || {}, hp = P('hotspot');
  out.push({ ok: st('hotspot').zone === 'tower' && hp.hs?.find((x) => x.zone === 'tower')?.pressed === 'true' && hp.figure === '16 floors', message: `tower button selects the zone (aria-pressed, detail ${hp.figure})` });
  out.push({ ok: h[0]?.d > 0.3 && h.some((s) => s.d > 0.05 && s.d < h[0].d) && hl.d < 0.05, message: `full motion: the camera target flies to the hotspot (distance ${h[0]?.d} → ${hl.d})` });
  out.push({ ok: h.every((s) => inBand(s.phi)), message: `fly-to stays inside the polar band (${range(h.map((s) => s.phi))})` });
  out.push({ ok: accent(hp.px) >= 3, message: `the selected zone renders in the accent (${accent(hp.px)} read-back pixels)` });

  // Keyboard.
  const k = st('keys');
  out.push({ ok: k.keys === 11 && Math.abs(k.goal?.phi - pMin) < 0.005 && inBand(k.cam?.phi) && k.zone === 'offices' && P('keys').focused === 'offices' && S('keys').at(-1)?.d < 0.05, message: `keyboard: arrows orbit (${k.keys} keys, polar goal ${k.goal?.phi} at the clamp), Tab + Enter flies to ${k.zone} (distance ${S('keys').at(-1)?.d})` });

  // Close: Escape, focus back on the opener, Lenis running again.
  out.push({ ok: st('close').open === false && P('close').dialogOpen === false && P('close').focused === 'opener' && P('close').lenisStopped === false, message: `Escape closes; focus back on ${P('close').focused}; Lenis stopped ${P('close').lenisStopped}` });

  // Reduced motion: GL stays, the fly-to is instant.
  const m = S('rm');
  out.push({ ok: st('rm').motion === 'reduced' && st('rm').gl === true && m.length > 0 && m.every((s) => s.d < 0.01) && drawn(P('rm').px) >= 15, message: `reduced motion: WebGL kept, fly-to instant (distance ${range(m.map((s) => s.d))} from the first sample)` });

  // Static: poster plus the same list; no canvas.
  const sp = P('static');
  out.push({ ok: st('static').motion === 'static' && st('static').mode === 'poster' && st('static').gl === false && sp.posterDisplay === 'block' && sp.posterLoaded && sp.canvasDisplay === 'none' && sp.px === null, message: 'static: poster shown, no canvas, no renderer' });
  out.push({ ok: sp.hs?.length === 4 && sp.hs.every((x) => x.shown && x.transform === 'none' && x.h >= 44) && sp.figure === '16 floors', message: `static: the hotspot list still selects zones (detail ${sp.figure})` });

  // Mobile.
  const mb = P('mobile'), ms = S('mobile');
  out.push({ ok: st('mobile').gl === true && drawn(mb.px) >= 15 && st('mobile').zone === 'courtyard' && ms.at(-1)?.d < 0.05 && mb.stage?.h >= 300, message: `mobile: model drawn, tap flies to courtyard (distance ${ms.at(-1)?.d}), stage ${mb.stage?.w}×${mb.stage?.h}` });
  out.push({ ok: mb.hs?.every((x) => x.h >= 44) && (mb.overflowX ?? 1) <= 0, message: `mobile: hotspot targets ${mb.hs?.map((x) => x.h).join('/')} px, overflow ${mb.overflowX}px` });
  return out;
}
