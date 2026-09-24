// What renders is judged from getBoundingClientRect (the painted box, transforms included) against offsetWidth/Height
// (the layout box, transforms ignored): the card shrinks and grows on screen while its layout never changes, which is
// what "transform only" means. elementFromPoint confirms the docked card is what paints in the corner.
const at = (f) => `(() => { const g = window.__awards.state().grow; if (!g) return true; window.lenis.scrollTo(Math.round(g[0] + (g[1] - g[0]) * ${f}), { immediate: true, force: true }); return true; })()`;
const past = (px) => `(() => { const g = window.__awards.state().grow; if (!g) return true; window.lenis.scrollTo(g[1] + ${px}, { immediate: true, force: true }); return true; })()`;
const go = (fn) => [{ type: 'waitFor', fn }, { type: 'wait', ms: 600 }];

export const states = [
  { name: 'dock', scroll: 0, settle: 500 },
  { name: 'start', settle: 300, actions: go(at(0)) },
  { name: 'mid', settle: 300, actions: go(at(0.5)) },
  { name: 'end', settle: 300, actions: go(at(1)) },
  { name: 'after', settle: 300, actions: go(past(320)) },
  { name: 'rm', scroll: 0, reducedMotion: true, settle: 500 },
  { name: 'static', settle: 300, actions: [{ type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" }, { type: 'wait', ms: 400 }] },
  { name: 'mobile', scroll: 0, viewport: 'mobile', settle: 500 },
];

export async function probe() {
  const reel = document.querySelector('[data-reel]');
  const section = document.querySelector('[data-reel-section]');
  const cue = document.querySelector('[data-cue]');
  const film = reel.querySelector('.reel__film');
  const r = reel.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const hit = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
  const films = [];
  for (let i = 0; i < 6; i++) {
    films.push(getComputedStyle(film).transform);
    await new Promise((res) => setTimeout(res, 120));
  }
  return {
    rect: [r.left, r.top, r.width, r.height].map((v) => Math.round(v)),
    layout: [reel.offsetWidth, reel.offsetHeight],
    vw,
    vh: innerHeight,
    gutter: parseFloat(getComputedStyle(section).paddingLeft),
    sectionTop: Math.round(section.getBoundingClientRect().top),
    position: getComputedStyle(reel).position,
    inlineProps: [...reel.style],
    reelPaints: !!hit && reel.contains(hit),
    cueShown: cue.checkVisibility({ opacityProperty: true, visibilityProperty: true }),
    filmAnimation: getComputedStyle(film).animationName,
    filmDistinct: new Set(films).size,
    overflowX: document.documentElement.scrollWidth - innerWidth,
  };
}

const TRANSFORM_PROPS = new Set(['transform', 'translate', 'rotate', 'scale']);

export function assert(r) {
  const out = [];
  const P = (k) => r[k]?.probe || {};
  const S = (k) => r[k]?.state || {};
  const w = (k) => P(k).rect?.[2] ?? NaN;
  const full = (k) => {
    const p = P(k), [x, y, wd, ht] = p.rect || [];
    const g = p.gutter + 2;
    return Math.abs(x - p.gutter) <= 2 && Math.abs(wd - (p.vw - 2 * p.gutter)) <= g && Math.abs(ht - (p.vh - 2 * p.gutter)) <= g && y >= -2;
  };

  // Docked from the first frame: a small card at the bottom-right gutter corner that actually paints there.
  const d = P('dock'), [dx, dy, dw, dh] = d.rect || [];
  out.push({ ok: S('dock').mode === 'dock' && dw < 0.3 * d.vw && Math.abs(dx + dw - (d.vw - d.gutter)) <= 2 && Math.abs(dy + dh - (d.vh - d.gutter)) <= 2 && d.reelPaints && d.cueShown, message: `dock: card ${dw}×${dh} at ${dx},${dy} (< 30 % of ${d.vw}, corner at gutter ${d.gutter}), paints ${d.reelPaints}, cue ${d.cueShown}` });

  // The verify idea: at section start under 30 % of the viewport width, at the end within the gutter of full.
  out.push({ ok: S('start').progress <= 0.02 && w('start') < 0.3 * P('start').vw, message: `start: progress ${S('start').progress}, card ${w('start')} px < 30 % of ${P('start').vw}` });
  out.push({ ok: w('mid') > w('start') + 200 && w('mid') < w('end') - 200 && S('mid').mode === 'dock', message: `mid: card ${w('mid')} px between start ${w('start')} and end ${w('end')}, still docked` });
  out.push({ ok: S('end').progress >= 0.98 && full('end') && P('end').cueShown === false, message: `end: progress ${S('end').progress}, card ${P('end').rect} within the gutter (${P('end').gutter}) of ${P('end').vw}×${P('end').vh}, cue hidden` });

  // Transform only: the layout box is identical in every full-tier state while the painted box changes, and the
  // only inline properties GSAP ever wrote are transform ones.
  const fullStates = ['dock', 'start', 'mid', 'end', 'after'];
  const layouts = new Set(fullStates.map((k) => (P(k).layout || []).join('×')));
  const inline = [...new Set(fullStates.flatMap((k) => P(k).inlineProps || []))];
  out.push({ ok: layouts.size === 1 && inline.every((p) => TRANSFORM_PROPS.has(p)) && inline.includes('transform'), message: `transform only: layout box ${[...layouts]} in all states, inline props [${inline}]` });

  // Hand-off: past the end the reel is in the section's flow and scrolls away with it.
  const a = P('after');
  out.push({ ok: S('after').mode === 'flow' && a.position !== 'fixed' && Math.abs(a.rect[1] - (a.sectionTop + a.gutter)) <= 2 && a.rect[1] < a.gutter - 200 && Math.abs(a.rect[2] - (a.vw - 2 * a.gutter)) <= 2, message: `after: mode ${S('after').mode}, position ${a.position}, card top ${a.rect?.[1]} follows the section (${a.sectionTop} + ${a.gutter})` });

  // Full tier: the placeholder film moves (sampled six times over 0.6 s).
  out.push({ ok: P('dock').filmAnimation === 'reel-drift' && P('dock').filmDistinct >= 3, message: `full: film animates (${P('dock').filmAnimation}, ${P('dock').filmDistinct} distinct transforms in 6 samples)` });

  // Reduced and static: no dock, full-size in its section below the fold, still film, no cue.
  for (const k of ['rm', 'static']) {
    const p = P(k);
    out.push({ ok: S(k).motion === (k === 'rm' ? 'reduced' : 'static') && S(k).mode === 'flow' && p.position !== 'fixed' && p.rect[1] >= p.vh && full(k) && S(k).scale === 1 && !p.cueShown && p.filmAnimation === 'none' && p.filmDistinct === 1, message: `${k}: tier ${S(k).motion}, mode ${S(k).mode}, card ${p.rect} in flow (top ≥ ${p.vh}), scale ${S(k).scale}, film ${p.filmAnimation}, cue ${p.cueShown}` });
  }

  // Mobile: no dock under 1024 px; the reel is full-width in its section and nothing overflows.
  const m = P('mobile');
  out.push({ ok: S('mobile').mode === 'flow' && m.position !== 'fixed' && full('mobile') && m.rect[1] >= m.vh && !m.cueShown && m.overflowX <= 0 && (P('dock').overflowX ?? 1) <= 0, message: `mobile: mode ${S('mobile').mode}, card ${m.rect} in flow, cue ${m.cueShown}, overflow ${m.overflowX}px` });
  return out;
}
