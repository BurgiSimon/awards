// The verify idea: uProgress is the stage's scroll mapped through the erosion window, and real pixels agree with it.
// At 0 both sample points on the cone's axis show the cone; half-way the point near the tip shows the backdrop (the
// same colour as the figure's edge on that row) while the point low on the cone still shows resin, and the first thing
// under the cleared tip is a hot ember band; at the end both show the backdrop; scrolling back re-forms it pixel for
// pixel. Nothing renders while idle or off screen. Reduced motion cuts each chapter to its still; static, ?nogl and a
// lost context show the SVG still, measured the same way at points it projects itself. Tier changes during start-up or
// twenty in a row never lose the tier or the context.
const at = (f) => `(() => { const s = window.__awards.state(); if (!s.window || s.mode === 'pending') return false;
  const y = Math.round(s.window[0] + (s.window[1] - s.window[0]) * ${f});
  if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
  return true; })()`;
const go = (f, ms = 700) => [{ type: 'waitFor', fn: at(f) }, { type: 'wait', ms }];
const mark = { type: 'waitFor', fn: '(window.__r0 = window.__awards.state().renders, true)' };
const motion = (m) => ({ type: 'waitFor', fn: `(document.documentElement.dataset.motion = '${m}') === '${m}'` });
const figureInView = { type: 'waitFor', fn: "(document.querySelector('[data-figure]').scrollIntoView({ block: 'center' }), true)" };
const noGl = [{ type: 'waitFor', fn: "(history.replaceState(null, '', '?nogl'), true)" }, { type: 'reload' }];
// Half a viewport below the stage: the figure is off screen and the progress stays at 1.
const below = { type: 'waitFor', fn: "(() => { const r = document.querySelector('[data-stage]').getBoundingClientRect(); const y = Math.round(scrollY + r.bottom + innerHeight * 0.5); if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); return true; })()" };
// Reload and set the static tier as soon as the module runs, while the renderer is still starting (mode 'pending').
const flipDuringInit = [
  { type: 'waitFor', fn: '(window.__old = true, setTimeout(() => location.reload(), 0), true)' },
  { type: 'waitFor', timeout: 20000, fn: "!window.__old && !!window.__awards && (window.__flipAt = window.__awards.state().mode, document.documentElement.dataset.motion = 'static', true)" },
  { type: 'waitFor', timeout: 20000, fn: "!window.__old && window.__awards.state().mode === 'still'" },
  { type: 'wait', ms: 800 },
];
// Twenty tier changes 80 ms apart, ending on full: each one used to open a throwaway WebGL2 context.
const flips = [
  { type: 'waitFor', fn: "(window.__flips = 0, (function f() { document.documentElement.dataset.motion = window.__flips % 2 ? 'full' : 'reduced'; if (++window.__flips < 20) setTimeout(f, 80); })(), true)" },
  { type: 'waitFor', timeout: 20000, fn: 'window.__flips >= 20' },
  { type: 'wait', ms: 1200 },
];
const lose = [
  { type: 'waitFor', fn: "(window.__lose = document.querySelector('[data-gl]').getContext('webgl2').getExtension('WEBGL_lose_context'), window.__lose.loseContext(), true)" },
  { type: 'waitFor', fn: "window.__awards.state().mode === 'still'" },
  { type: 'wait', ms: 500 },
];
const restore = [
  { type: 'waitFor', fn: '(window.__lose.restoreContext(), true)' },
  { type: 'waitFor', timeout: 20000, fn: "window.__awards.state().mode === 'gl'" },
  { type: 'wait', ms: 900 },
];

export const states = [
  { name: 'start', settle: 400, actions: go(0) },
  { name: 'turned', settle: 400, actions: go(0.1) },
  { name: 'mid', frame: true, settle: 400, actions: go(0.5) },
  { name: 'end', settle: 400, actions: go(1) },
  { name: 'back', settle: 400, actions: [...go(1, 400), ...go(0.04)] },
  { name: 'return', settle: 400, actions: [...go(1, 400), ...go(0.5)] },
  { name: 'idle', settle: 400, actions: [...go(0.5, 900), mark, { type: 'wait', ms: 1500 }] },
  { name: 'offscreen', settle: 400, actions: [...go(0.5, 500), below, { type: 'wait', ms: 700 }, mark, motion('reduced'), { type: 'wait', ms: 900 }] },
  // Keyboard: Tab to the third chapter button and press Enter; the stage glides to the end of the window.
  { name: 'keys', settle: 400, actions: [...go(0.2), { type: 'focus', selector: '[data-goto="1"]' }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 2000 }] },
  { name: 'rm', reducedMotion: true, settle: 400, actions: go(0.38) },
  { name: 'rm-late', reducedMotion: true, settle: 400, actions: go(0.62) },
  { name: 'static', settle: 400, actions: [...go(0.5), motion('static'), { type: 'wait', ms: 600 }, figureInView, mark, { type: 'wait', ms: 600 }] },
  { name: 'init-static', settle: 200, actions: [...flipDuringInit, figureInView, { type: 'wait', ms: 300 }] },
  { name: 'toggles', settle: 400, actions: [...go(0.5, 400), ...flips] },
  { name: 'lost', settle: 400, actions: [...go(0.5, 500), ...lose] },
  { name: 'restored', settle: 400, actions: [...go(0.5, 500), ...lose, ...restore] },
  { name: 'nogl', settle: 400, actions: [...noGl, ...go(0.5)] },
  { name: 'mobile', viewport: 'mobile', settle: 400, actions: go(0.5) },
];

export function probe() {
  const $ = (q) => document.querySelector(q);
  const stage = $('[data-stage]').getBoundingClientRect();
  const figure = $('[data-figure]').getBoundingClientRect();
  const copy = $('.stage__copy').getBoundingClientRect();
  const active = $('[data-chapter][data-active]');
  const still = getComputedStyle($('[data-still]'));
  return {
    renders0: window.__r0 ?? null,
    flipAt: window.__flipAt ?? null,
    stageH: Math.round(stage.height),
    vh: innerHeight,
    activeChapter: active ? Number(active.dataset.chapter) : null,
    opacities: [...document.querySelectorAll('[data-chapter]')].map((c) => Number(getComputedStyle(c).opacity)),
    current: [...document.querySelectorAll('[data-goto]')].map((b) => b.getAttribute('aria-current')),
    focused: document.activeElement?.dataset?.goto ?? document.activeElement?.tagName,
    status: $('[data-status]').textContent,
    label: $('[data-still-title]').textContent,
    canvasShown: getComputedStyle($('[data-gl]')).display !== 'none',
    stillShown: still.visibility === 'visible' && still.opacity === '1',
    staged: document.documentElement.classList.contains('is-staged'),
    figureInView: figure.bottom > 0 && figure.top < innerHeight,
    figureAboveCopy: figure.bottom <= copy.top + 1,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side: one screenshot of the figure, read in the page. 5 × 5 px averages at the page's own projected points; a
// walk down the axis column from the top point to the low point for the band; and a 96 × 48 px luminance signature
// half-way between the two points (wide enough to hold the mould seam), to compare frames pixel for pixel.
export async function inspect(page) {
  const pts = await page.evaluate(() => window.__awards.state().points);
  if (!pts) return null;
  const aria = await page.locator('[data-figure]').ariaSnapshot();
  const box = await page.evaluate(() => {
    const r = document.querySelector('[data-figure]').getBoundingClientRect();
    const x = Math.max(0, Math.floor(r.left)), y = Math.max(0, Math.floor(r.top));
    return { x, y, width: Math.min(innerWidth, Math.ceil(r.right)) - x, height: Math.min(innerHeight, Math.ceil(r.bottom)) - y };
  });
  if (box.width < 8 || box.height < 8) return { aria, offscreen: true };
  const png = await page.screenshot({ clip: box });
  const px = await page.evaluate(async ({ b64, pts, box }) => {
    const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
    const cv = new OffscreenCanvas(bmp.width, bmp.height), g = cv.getContext('2d'); g.drawImage(bmp, 0, 0);
    const d = g.getImageData(0, 0, bmp.width, bmp.height).data, W = bmp.width, H = bmp.height;
    const get = (x, y) => { x = Math.round(x - box.x); y = Math.round(y - box.y); if (x < 0 || y < 0 || x >= W || y >= H) return null; const i = (y * W + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
    const avg = ([x, y]) => { const s = [0, 0, 0]; let n = 0; for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { const c = get(x + i, y + j); if (c) { s[0] += c[0]; s[1] += c[1]; s[2] += c[2]; n++; } } return n ? s.map((v) => Math.round(v / n)) : null; };
    const diff = (a, b) => (a && b ? Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) : NaN);
    const out = { top: avg(pts.top), low: avg(pts.low), bgTop: avg(pts.bgTop), bgLow: avg(pts.bgLow), dish: pts.dish ? avg(pts.dish) : null };
    // The band: the first pixel down the axis that is not backdrop, then the longest run of hot pixels (R ≥ 200,
    // R > G > B, brighter than the resin at the low point) in the 14 px below it, and the brightest of them.
    const lowSum = out.low ? out.low[0] + out.low[1] + out.low[2] : 765;
    const hot = (c) => !!c && c[0] >= 200 && c[0] > c[1] && c[1] > c[2] && c[0] + c[1] + c[2] > lowSum;
    let edge = null;
    for (let y = pts.top[1]; y <= pts.low[1]; y++) if (diff(get(pts.top[0], y), get(pts.bgTop[0], y)) > 40) { edge = y; break; }
    if (edge !== null) {
      let run = 0, best = 0, peak = null;
      for (let y = edge; y < edge + 14; y++) {
        const c = get(pts.top[0], y);
        run = hot(c) ? run + 1 : 0; best = Math.max(best, run);
        if (c && (!peak || c[0] + c[1] + c[2] > peak[0] + peak[1] + peak[2])) peak = c;
      }
      out.band = { from: edge - pts.top[1], run: best, peak };
    }
    const cx = pts.top[0], cy = Math.round((pts.top[1] + pts.low[1]) / 2);
    let s = '';
    for (let y = cy - 24; y < cy + 24; y++) for (let x = cx - 48; x < cx + 48; x++) { const c = get(x, y) || [0, 0, 0]; s += String.fromCharCode(Math.round(0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2])); }
    out.sig = btoa(s);
    return out;
  }, { b64: png.toString('base64'), pts, box });
  return { aria, ...px };
}

const diff = (a, b) => (a && b ? Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) : NaN);
const map = (p) => Math.min(1, Math.max(0, (p - 0.12) / 0.76));
// Mean absolute luminance difference of two signatures, 0–255.
const sigDiff = (a, b) => {
  if (!a || !b) return NaN;
  const x = Buffer.from(a, 'base64'), y = Buffer.from(b, 'base64');
  if (x.length !== y.length) return NaN;
  let s = 0; for (let i = 0; i < x.length; i++) s += Math.abs(x[i] - y[i]);
  return Number((s / x.length).toFixed(2));
};

export function assert(r) {
  const out = [];
  const S = (k) => r[k]?.state || {};
  const P = (k) => r[k]?.probe || {};
  const I = (k) => r[k]?.inspect || {};
  const near = (v, x, e = 0.01) => Math.abs((v ?? NaN) - x) <= e;
  const mesh = (k, pt) => diff(I(k)[pt], I(k)[pt === 'top' ? 'bgTop' : 'bgLow']) > 40;
  const bg = (k, pt) => diff(I(k)[pt], I(k)[pt === 'top' ? 'bgTop' : 'bgLow']) <= 12;
  const px = (k) => `top ${I(k).top} vs ${I(k).bgTop}, low ${I(k).low} vs ${I(k).bgLow}`;
  const half = (k) => bg(k, 'top') && mesh(k, 'low');
  const whole = (k) => mesh(k, 'top') && mesh(k, 'low');
  const band = (k, run = 2) => (I(k).band?.run ?? 0) >= run;
  const bandMsg = (k) => `first non-backdrop pixel ${I(k).band?.from ?? '–'} px under the top point, hot run ${I(k).band?.run ?? 0} px, brightest ${I(k).band?.peak} (resin at low ${I(k).low})`;

  // uProgress is the scroll through the erosion window, read back from the uniform after the render.
  for (const [k, f] of [['start', 0], ['mid', 0.5], ['end', 1]]) {
    out.push({ ok: S(k).mode === 'gl' && near(S(k).p, f, 0.01) && near(S(k).uProgress, map(S(k).p), 0.002), message: `${k}: stage progress ${S(k).p} (asked ${f}), uProgress ${S(k).uProgress} = clamp((p − .12) / .76) ${map(S(k).p).toFixed(3)}` });
  }
  out.push({ ok: whole('start'), message: `start: the whole cone is drawn (${px('start')})` });
  // The key assertion: half-way, the side the axis starts from is backdrop and the far side is still resin.
  out.push({ ok: half('mid'), message: `mid: near the tip is backdrop, low on the cone is resin (${px('mid')})` });
  out.push({ ok: band('mid'), message: `mid: the edge burns: ${bandMsg('mid')}` });
  out.push({ ok: bg('end', 'top') && bg('end', 'low'), message: `end: the cone is gone (${px('end')})` });
  out.push({ ok: near(S('back').uProgress, 0, 0.001) && whole('back'), message: `back: scrolled up after the end, uProgress ${S('back').uProgress} and the cone re-forms (${px('back')})` });
  // Grain for grain: the same progress reached after a trip to the end draws the same pixels; the signature square
  // has content (it differs from the empty end frame).
  const ret = sigDiff(I('mid').sig, I('return').sig), content = sigDiff(I('mid').sig, I('end').sig);
  out.push({ ok: S('return').p === S('mid').p && ret <= 1.5 && content >= 8, message: `return: mid → end → mid redraws the front within ${ret} levels of 255 (the square differs from the empty frame by ${content})` });
  out.push({ ok: S('mid').chapter === 1 && P('mid').activeChapter === 1 && P('mid').current?.[1] === 'step' && P('mid').opacities?.[1] === 1 && P('mid').opacities?.[0] === 0, message: `mid: chapter 2 of 3 shown and current (opacities ${P('mid').opacities}, aria-current ${P('mid').current})` });
  out.push({ ok: S('start').turn === 0 && near(S('mid').turn, S('mid').p * 0.8, 0.002) && near(S('end').turn, 0.8, 0.002), message: `full: the cone turns with the scroll, 0 → ${S('mid').turn} → ${S('end').turn} rad` });
  // The turn is drawn: at p .1 the cone is still whole (uProgress 0) but turned, and its grain and seam have moved.
  const turned = sigDiff(I('start').sig, I('turned').sig);
  out.push({ ok: S('turned').uProgress === 0 && near(S('turned').turn, 0.08, 0.002) && turned >= 2.5, message: `turned: uProgress ${S('turned').uProgress}, turn ${S('turned').turn} rad moves the surface by ${turned} levels against the unturned start` });
  // The ember's light lands on the dish at mid (sin π·.5 = 1) and not at the start (sin 0).
  out.push({ ok: (I('mid').dish?.[0] ?? 0) - (I('start').dish?.[0] ?? 255) >= 15, message: `glow: the dish floor in front of the cone reads ${I('mid').dish} at mid against ${I('start').dish} at the start` });
  // The image's name follows the burn, and the still keeps it in the tree while the canvas draws.
  const aMid = I('mid').aria ?? '', aEnd = I('end').aria ?? '';
  out.push({ ok: /img "Cone No\. 7, burning/.test(aMid) && /img "The glazed dish, empty/.test(aEnd) && S('mid').mode === 'gl', message: `aria: in GL mode the figure's image is named for what it shows (mid: ${aMid.split('\n').find((l) => l.includes('img'))?.trim()}; end: ${aEnd.split('\n').find((l) => l.includes('img'))?.trim()})` });

  // Render on demand: no draw while nothing changes, none while the figure is off screen even when something does.
  const idle = P('idle');
  out.push({ ok: Number.isFinite(idle.renders0) && S('idle').renders === idle.renders0 && idle.renders0 > 0, message: `idle: ${idle.renders0} renders before a 1.5 s wait, ${S('idle').renders} after` });
  const off = S('offscreen'), op = P('offscreen');
  out.push({ ok: !op.figureInView && off.tier === 'reduced' && off.turn === 0 && Number.isFinite(op.renders0) && off.renders === op.renders0, message: `offscreen: below the stage a tier change sets the turn to ${off.turn}, and renders stay at ${off.renders} (were ${op.renders0}; figure in view: ${op.figureInView})` });

  const k = S('keys'), kp = P('keys');
  out.push({ ok: kp.focused === '2' && k.chapter === 2 && kp.current?.[2] === 'step' && near(k.uProgress, 1, 0.001), message: `keys: Tab to "Gone", Enter glides to the last chapter (focus on ${kp.focused}, chapter ${k.chapter}, uProgress ${k.uProgress})` });
  out.push({ ok: kp.status === 'Chapter 3 of 3: What stays is the room.' && P('mid').status === '', message: `status: the button says "${kp.status}"; a plain scroll says nothing ("${P('mid').status}")` });

  // Reduced motion: no scrub. Two positions inside chapter 2 give the same still, and the cone does not turn.
  const a = S('rm'), b = S('rm-late');
  out.push({ ok: a.tier === 'reduced' && a.lenis === false && a.chapter === 1 && b.chapter === 1 && a.uProgress === 0.5 && b.uProgress === 0.5 && a.p !== b.p && a.turn === 0, message: `reduced: p ${a.p} and ${b.p} both show the chapter's still at uProgress ${a.uProgress} / ${b.uProgress}, no turn (${a.turn}), no Lenis` });
  out.push({ ok: half('rm'), message: `reduced: the still is really drawn (${px('rm')})` });

  const st = S('static'), sp = P('static');
  out.push({ ok: st.tier === 'static' && st.mode === 'still' && sp.stillShown && !sp.canvasShown && sp.stageH < sp.vh * 2 && sp.opacities?.every((o) => o === 1) && st.renders === sp.renders0 && whole('static'), message: `static: the whole SVG still (${px('static')}), the stage in flow (${sp.stageH}px), all three chapters shown (${sp.opacities}), no draws after the switch (${sp.renders0} → ${st.renders})` });
  const is = S('init-static'), ip = P('init-static');
  out.push({ ok: ip.flipAt === 'pending' && is.tier === 'static' && is.mode === 'still' && !ip.canvasShown && ip.stillShown && !ip.staged && is.lenis === false && whole('init-static'), message: `init-static: data-motion set to static while the renderer started (mode was ${ip.flipAt}) ends static: tier ${is.tier}, mode ${is.mode}, canvas shown ${ip.canvasShown}, staged ${ip.staged}, Lenis ${is.lenis}, still whole (${px('init-static')})` });
  const tg = S('toggles');
  out.push({ ok: tg.tier === 'full' && tg.mode === 'gl' && tg.lost === 0 && P('toggles').canvasShown && near(tg.p, 0.5, 0.01) && half('toggles') && band('toggles'), message: `toggles: after 20 tier changes the tier is ${tg.tier}, mode ${tg.mode}, contexts lost ${tg.lost}, and the canvas still draws (${px('toggles')}; band run ${I('toggles').band?.run})` });

  const ls = S('lost'), lp = P('lost');
  out.push({ ok: ls.lost === 1 && ls.mode === 'still' && lp.stillShown && !lp.canvasShown && half('lost'), message: `lost: a lost context hands the figure to the still, burnt to the same level (mode ${ls.mode}, ${px('lost')})` });
  const rs = S('restored'), rp = P('restored');
  out.push({ ok: rs.lost === 1 && rs.mode === 'gl' && rp.canvasShown && !rp.stillShown && half('restored') && band('restored'), message: `restored: the restored context is rebuilt and draws again (mode ${rs.mode}, ${px('restored')}, band run ${I('restored').band?.run})` });

  const n = S('nogl'), np = P('nogl');
  out.push({ ok: n.glCreated === false && n.mode === 'still' && np.stillShown && !np.canvasShown && n.chapter === 1 && n.level > 0.4 && n.level < 0.6 && half('nogl') && band('nogl'), message: `?nogl: no renderer; the SVG still burns to the same level (${n.level}): ${px('nogl')}; ${bandMsg('nogl')}` });

  const m = S('mobile'), mp = P('mobile');
  out.push({ ok: m.mode === 'gl' && half('mobile') && band('mobile') && mp.figureAboveCopy && (mp.overflowX ?? 1) <= 0, message: `mobile: cone above the copy, half eroded (${px('mobile')}), ${bandMsg('mobile')}, overflow ${mp.overflowX}px` });
  return out;
}
