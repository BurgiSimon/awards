// The verify idea: uProgress is the stage's scroll mapped through the erosion window, and real pixels agree with it.
// At 0 both sample points on the cone's axis show the cone; half-way the point near the tip shows the backdrop (the
// same colour as the figure's edge on that row) while the point low on the cone still shows resin; at the end both
// show the backdrop; scrolling back re-forms it. Nothing renders while the page is idle. Reduced motion cuts each
// chapter to its still (two scroll positions in one chapter give the same uProgress); static and ?nogl show the SVG.
const at = (f) => `(() => { const s = window.__awards.state(); if (!s.window || s.mode === 'pending') return false;
  const y = Math.round(s.window[0] + (s.window[1] - s.window[0]) * ${f});
  if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
  return true; })()`;
const go = (f, ms = 700) => [{ type: 'waitFor', fn: at(f) }, { type: 'wait', ms }];
const mark = { type: 'waitFor', fn: '(window.__r0 = window.__awards.state().renders, true)' };
const staticTier = { type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" };
const noGl = [{ type: 'waitFor', fn: "(history.replaceState(null, '', '?nogl'), true)" }, { type: 'reload' }];

export const states = [
  { name: 'start', settle: 400, actions: go(0) },
  { name: 'mid', frame: true, settle: 400, actions: go(0.5) },
  { name: 'end', settle: 400, actions: go(1) },
  { name: 'back', settle: 400, actions: [...go(1, 400), ...go(0.04)] },
  { name: 'idle', settle: 400, actions: [...go(0.5, 900), mark, { type: 'wait', ms: 1500 }] },
  // Keyboard: Tab to the third chapter button and press Enter; the stage glides to the end of the window.
  { name: 'keys', settle: 400, actions: [...go(0.2), { type: 'focus', selector: '[data-goto="1"]' }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 2000 }] },
  { name: 'rm', reducedMotion: true, settle: 400, actions: go(0.38) },
  { name: 'rm-late', reducedMotion: true, settle: 400, actions: go(0.62) },
  { name: 'static', settle: 400, actions: [...go(0.5), staticTier, { type: 'wait', ms: 600 }, mark, { type: 'wait', ms: 600 }] },
  { name: 'nogl', settle: 400, actions: [...noGl, ...go(0.5)] },
  { name: 'mobile', viewport: 'mobile', settle: 400, actions: go(0.5) },
];

export function probe() {
  const $ = (q) => document.querySelector(q);
  const stage = $('[data-stage]').getBoundingClientRect();
  const figure = $('[data-figure]').getBoundingClientRect();
  const copy = $('.stage__copy').getBoundingClientRect();
  const active = $('[data-chapter][data-active]');
  return {
    renders0: window.__r0 ?? null,
    stageH: Math.round(stage.height),
    vh: innerHeight,
    activeChapter: active ? Number(active.dataset.chapter) : null,
    opacities: [...document.querySelectorAll('[data-chapter]')].map((c) => Number(getComputedStyle(c).opacity)),
    current: [...document.querySelectorAll('[data-goto]')].map((b) => b.getAttribute('aria-current')),
    focused: document.activeElement?.dataset?.goto ?? document.activeElement?.tagName,
    canvasShown: getComputedStyle($('[data-gl]')).display !== 'none',
    stillShown: getComputedStyle($('[data-still]')).visibility === 'visible',
    figureAboveCopy: figure.bottom <= copy.top + 1,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side: 5 × 5 px screenshot crops at the page's own projected points, averaged.
export async function inspect(page) {
  const pts = await page.evaluate(() => window.__awards.state().points);
  if (!pts) return null;
  const read = async ([x, y]) => {
    const png = await page.screenshot({ clip: { x: x - 2, y: y - 2, width: 5, height: 5 } });
    return page.evaluate(async (b64) => {
      const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
      const cv = new OffscreenCanvas(bmp.width, bmp.height); const g = cv.getContext('2d'); g.drawImage(bmp, 0, 0);
      const d = g.getImageData(0, 0, bmp.width, bmp.height).data, n = d.length / 4, avg = [0, 0, 0];
      for (let i = 0; i < d.length; i += 4) { avg[0] += d[i]; avg[1] += d[i + 1]; avg[2] += d[i + 2]; }
      return avg.map((c) => Math.round(c / n));
    }, png.toString('base64'));
  };
  return { top: await read(pts.top), low: await read(pts.low), bgTop: await read(pts.bgTop), bgLow: await read(pts.bgLow) };
}

const diff = (a, b) => (a && b ? Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) : NaN);
const map = (p) => Math.min(1, Math.max(0, (p - 0.12) / 0.76));

export function assert(r) {
  const out = [];
  const S = (k) => r[k]?.state || {};
  const P = (k) => r[k]?.probe || {};
  const I = (k) => r[k]?.inspect || {};
  const near = (v, x, e = 0.01) => Math.abs((v ?? NaN) - x) <= e;
  const mesh = (k, pt) => diff(I(k)[pt], I(k)[pt === 'top' ? 'bgTop' : 'bgLow']) > 40;
  const bg = (k, pt) => diff(I(k)[pt], I(k)[pt === 'top' ? 'bgTop' : 'bgLow']) <= 12;
  const px = (k) => `top ${I(k).top} vs ${I(k).bgTop}, low ${I(k).low} vs ${I(k).bgLow}`;

  // uProgress is the scroll through the erosion window, read back from the uniform after the render.
  for (const [k, f] of [['start', 0], ['mid', 0.5], ['end', 1]]) {
    out.push({ ok: S(k).mode === 'gl' && near(S(k).p, f, 0.01) && near(S(k).uProgress, map(S(k).p), 0.002), message: `${k}: stage progress ${S(k).p} (asked ${f}), uProgress ${S(k).uProgress} = clamp((p − .12) / .76) ${map(S(k).p).toFixed(3)}` });
  }
  out.push({ ok: mesh('start', 'top') && mesh('start', 'low'), message: `start: the whole cone is drawn (${px('start')})` });
  // The key assertion: half-way, the side the axis starts from is backdrop and the far side is still resin.
  out.push({ ok: bg('mid', 'top') && mesh('mid', 'low'), message: `mid: near the tip is backdrop, low on the cone is resin (${px('mid')})` });
  out.push({ ok: bg('end', 'top') && bg('end', 'low'), message: `end: the cone is gone (${px('end')})` });
  out.push({ ok: near(S('back').uProgress, 0, 0.001) && mesh('back', 'top') && mesh('back', 'low'), message: `back: scrolled up after the end, uProgress ${S('back').uProgress} and the cone re-forms (${px('back')})` });
  out.push({ ok: S('mid').chapter === 1 && P('mid').activeChapter === 1 && P('mid').current?.[1] === 'step' && P('mid').opacities?.[1] === 1 && P('mid').opacities?.[0] === 0, message: `mid: chapter 2 of 3 shown and current (opacities ${P('mid').opacities}, aria-current ${P('mid').current})` });
  out.push({ ok: S('start').turn === 0 && near(S('mid').turn, S('mid').p * 0.8, 0.002) && near(S('end').turn, 0.8, 0.002), message: `full: the cone turns with the scroll, 0 → ${S('mid').turn} → ${S('end').turn} rad` });

  // Render on demand: no draw while nothing changes.
  const idle = P('idle');
  out.push({ ok: Number.isFinite(idle.renders0) && S('idle').renders === idle.renders0 && idle.renders0 > 0, message: `idle: ${idle.renders0} renders before a 1.5 s wait, ${S('idle').renders} after` });

  const k = S('keys'), kp = P('keys');
  out.push({ ok: kp.focused === '2' && k.chapter === 2 && kp.current?.[2] === 'step' && near(k.uProgress, 1, 0.001), message: `keys: Tab to "Gone", Enter glides to the last chapter (focus on ${kp.focused}, chapter ${k.chapter}, uProgress ${k.uProgress})` });

  // Reduced motion: no scrub. Two positions inside chapter 2 give the same still, and the cone does not turn.
  const a = S('rm'), b = S('rm-late');
  out.push({ ok: a.tier === 'reduced' && a.lenis === false && a.chapter === 1 && b.chapter === 1 && a.uProgress === 0.5 && b.uProgress === 0.5 && a.p !== b.p && a.turn === 0, message: `reduced: p ${a.p} and ${b.p} both show the chapter's still at uProgress ${a.uProgress} / ${b.uProgress}, no turn (${a.turn}), no Lenis` });
  out.push({ ok: bg('rm', 'top') && mesh('rm', 'low'), message: `reduced: the still is really drawn (${px('rm')})` });

  const st = S('static'), sp = P('static');
  out.push({ ok: st.tier === 'static' && st.mode === 'still' && st.burnY === 0 && sp.stillShown && !sp.canvasShown && sp.stageH < sp.vh * 2 && sp.opacities?.every((o) => o === 1) && st.renders === sp.renders0, message: `static: the whole SVG still (burn ${st.burnY}), the stage in flow (${sp.stageH}px), all three chapters shown (${sp.opacities}), no draws after the switch (${sp.renders0} → ${st.renders})` });

  const n = S('nogl'), np = P('nogl');
  out.push({ ok: n.glCreated === false && n.mode === 'still' && np.stillShown && !np.canvasShown && n.chapter === 1 && n.burnY === Math.round(n.level * 480) && n.level > 0.4 && n.level < 0.6, message: `?nogl: no renderer, the SVG still burns to the same level (${n.level}, burn edge moved ${n.burnY} of 480 SVG units), chapter ${n.chapter + 1}` });

  const m = S('mobile'), mp = P('mobile');
  out.push({ ok: m.mode === 'gl' && bg('mobile', 'top') && mesh('mobile', 'low') && mp.figureAboveCopy && (mp.overflowX ?? 1) <= 0, message: `mobile: cone above the copy, half eroded (${px('mobile')}), overflow ${mp.overflowX}px` });
  return out;
}
