// The verify idea: a choice is proved in four places at once. The scene's own material reaches the swatch's value and
// the shader's uniforms (read back from three through the state hook), real pixels on the shade land within ΔE2000 5 of
// the swatch in every finish, the summary, price and spec say it in the same task as the click (before the tween has
// drawn a frame), and the URL carries it so a reload restores it. A second choice mid-tween turns the first around from
// the exact colour it had reached (every frame after lies on the line from there to the new swatch). The arrival turn
// is measured from its first drawn frame; reduced motion draws its first frame at rest. Keys, a mouse drag and a touch
// drag turn the view; Enter on a radio never bags; forced colours keep focus apart from checked; a lost context hands
// the page to the CSS lamp and a restored one comes back with its room re-baked; ?nogl and the static tier (switched at
// run time or from load) keep every control on the CSS lamp, which never shows before the WebGL lamp on a full load.
const pick = (name, value) => ({ type: 'click', selector: `label:has(> input[name="${name}"][value="${value}"])` });
const fn = (f, timeout) => ({ type: 'waitFor', fn: f, ...(timeout ? { timeout } : {}) });
const mark = fn('(window.__r0 = window.__awards.state().renders, true)');
const query = (q) => [fn(`(history.replaceState(null, '', '${q}'), true)`), { type: 'reload' }];
// Wait until a mode is known and the render loop has stopped: the view has settled and no tween runs.
const settled = fn("(() => { const s = window.__awards.state(); return (s.mode === 'gl' || s.mode === 'css') && !(s.scene && s.scene.running); })()", 20000);
// One in-page poll, run every frame: it chooses Ink, then, on the first frame the lacquer is at least 15 % of the way
// from Clay (linear red below .39), notes the exact colour and chooses Saffron in the same task. Clicking from inside
// the poll means no frame of the tween goes unobserved, and the turn-around point is known, not guessed.
const TURN = fn(`(() => {
  const w = window;
  if (!w.__phase) { w.__phase = 1; document.querySelector('input[name="colour"][value="ink"]').click(); return false; }
  const c = w.__awards.state().scene.colour;
  if (c === '#262a33') { w.__missed = true; return true; }
  const r = parseInt(c.slice(1, 3), 16) / 255, lin = r <= 0.04045 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4;
  if (lin > 0.39) return false;
  w.__pre = c;
  document.querySelector('input[name="colour"][value="saffron"]').click();
  w.__tweens = w.__awards.state().scene.colourTweens;
  w.__trail = [];
  return true;
})()`);
// Every colour the lacquer passes through until it reaches Saffron.
const TRAIL = fn("(() => { const c = window.__awards.state().scene.colour; if (c !== window.__pre && c !== window.__trail.at(-1)) window.__trail.push(c); return c === '#d7a032'; })()", 20000);
// Choose Drum and read the words in the same task, before the morph has drawn a single frame.
const SYNC = fn(`(() => {
  document.querySelector('label:has(> input[name="shade"][value="drum"])').click();
  const s = window.__awards.state();
  window.__sync = { price: s.price, summary: s.summary, spec: s.spec, legend: s.config.shade, morph: s.scene.morph };
  return true;
})()`);
const KV = fn("((window.__kv ||= []).push(window.__awards.state().slider.now), true)");
const MIDDRAG = fn("(window.__midDrag = { now: window.__awards.state().slider.now, goal: window.__awards.state().goal.theta }, true)");
const LOSE = [fn("(window.__lc = document.querySelector('[data-gl]').getContext('webgl2').getExtension('WEBGL_lose_context'), window.__lc.loseContext(), true)"), fn("window.__awards.state().mode === 'css'", 10000)];
const RESTORE = [fn('(window.__lc.restoreContext(), true)'), fn("window.__awards.state().mode === 'gl'", 20000)];
const BLUR = fn('(document.activeElement?.blur(), true)');
const DRAG = [{ type: 'move', x: 500, y: 420, steps: 2 }, { type: 'down' }, { type: 'move', x: 1400, y: 880, steps: 18 }];

export const states = [
  { name: 'rest', settle: 600, actions: [settled] },
  { name: 'load', settle: 300, actions: [settled] },
  { name: 'matte', settle: 600, actions: [settled, pick('finish', 'matte'), { type: 'wait', ms: 100 }, settled] },
  { name: 'finish', settle: 600, actions: [settled, pick('finish', 'gloss'), { type: 'wait', ms: 100 }, settled] },
  { name: 'swatch', settle: 600, actions: [settled, fn('(window.__h0 = history.length, true)'), pick('colour', 'moss'), { type: 'wait', ms: 100 }, settled, { type: 'click', selector: '[data-share]' }, fn("document.querySelector('[data-status]').textContent !== ''", 5000)] },
  // On a phone: a fifth of the desktop's pixels, so software-rendered frames come fast enough to see the first one turn.
  { name: 'interrupt', viewport: 'mobile', settle: 600, actions: [settled, TURN, TRAIL, settled] },
  { name: 'shade', settle: 600, actions: [settled, SYNC, settled] },
  { name: 'restore', settle: 600, actions: [...query('?colour=teal&finish=matte&shade=cone&utm_source=demo'), settled] },
  { name: 'keys-radio', settle: 600, actions: [settled, { type: 'focus', selector: 'input[name="colour"]:checked' }, { type: 'press', key: 'ArrowRight' }, { type: 'wait', ms: 100 }, settled, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 300 }] },
  { name: 'keys-view', settle: 600, actions: [settled, { type: 'focus', selector: '[data-view]' }, { type: 'press', key: 'ArrowLeft' }, { type: 'press', key: 'ArrowLeft' }, { type: 'press', key: 'ArrowLeft' }, KV, { type: 'press', key: 'Home' }, KV, { type: 'press', key: 'PageUp' }, KV, { type: 'press', key: 'End' }, KV, { type: 'wait', ms: 100 }, settled] },
  { name: 'drag', settle: 600, actions: [settled, ...DRAG, MIDDRAG, { type: 'up' }, { type: 'wait', ms: 100 }, settled] },
  { name: 'reset', settle: 600, actions: [settled, ...DRAG, { type: 'up' }, { type: 'wait', ms: 300 }, { type: 'click', selector: '[data-reset]' }, { type: 'wait', ms: 100 }, settled] },
  { name: 'idle', settle: 600, actions: [settled, mark, { type: 'wait', ms: 1500 }] },
  // The explorer's frame: the range at a glance, another colour, finish and shade seen from the other side.
  { name: 'configured', frame: true, settle: 600, actions: [settled, pick('colour', 'saffron'), pick('finish', 'gloss'), pick('shade', 'cone'), { type: 'focus', selector: '[data-view]' }, ...Array(4).fill({ type: 'press', key: 'ArrowLeft' }), BLUR, { type: 'wait', ms: 100 }, settled] },
  { name: 'forced', settle: 600, actions: [settled, { type: 'focus', selector: 'input[name="colour"]:checked' }, { type: 'press', key: 'Tab' }] },
  { name: 'lost', settle: 600, actions: [settled, ...LOSE, pick('colour', 'moss'), { type: 'wait', ms: 600 }] },
  { name: 'restored', settle: 600, actions: [settled, ...LOSE, ...RESTORE, { type: 'wait', ms: 100 }, settled] },
  { name: 'rm', reducedMotion: true, settle: 900, actions: [pick('colour', 'moss'), { type: 'wait', ms: 50 }] },
  { name: 'nogl', settle: 600, actions: [...query('?nogl'), pick('colour', 'moss'), pick('shade', 'cone'), { type: 'wait', ms: 600 }] },
  { name: 'static', settle: 1200, actions: [settled, fn("(document.documentElement.dataset.motion = 'static') === 'static'"), { type: 'wait', ms: 300 }, mark, pick('finish', 'gloss'), { type: 'wait', ms: 600 }] },
  { name: 'static-load', settle: 300, actions: [settled] },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: [settled, pick('colour', 'saffron'), { type: 'wait', ms: 100 }, settled, pick('shade', 'drum'), { type: 'wait', ms: 100 }, settled] },
];

export function probe() {
  const $ = (q) => document.querySelector(q);
  const rect = (el) => { const r = el.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; };
  const cs = getComputedStyle($('[data-gl]'));
  const a = document.activeElement;
  return {
    pre: window.__pre ?? null, missed: !!window.__missed, tweensAfter: window.__tweens ?? null, trail: window.__trail ?? null,
    sync: window.__sync ?? null, h0: window.__h0 ?? null, kv: window.__kv ?? null, midDrag: window.__midDrag ?? null,
    renders0: window.__r0 ?? null,
    checked: Object.fromEntries(['colour', 'finish', 'shade'].map((n) => [n, document.querySelector(`input[name="${n}"]:checked`)?.value ?? null])),
    focused: a?.matches?.('input') ? `${a.name}:${a.value}` : a?.dataset && 'view' in a.dataset ? 'view' : a?.tagName,
    canvas: { visibility: cs.visibility, opacity: Number(cs.opacity), transition: cs.transitionDuration },
    previewShown: getComputedStyle($('[data-preview]')).visibility === 'visible',
    hintShown: !$('[data-hint]').hidden, resetShown: !$('[data-reset]').hidden,
    live: [$('[data-summary]').getAttribute('aria-live'), $('[data-summary]').getAttribute('aria-atomic')],
    bag: $('[data-bag]').textContent,
    stage: rect($('[data-stage]')), form: rect($('[data-form]')), drum: rect($('label:has(> input[value="drum"])')),
    vh: innerHeight, scrollY: Math.round(scrollY),
    targets: [...document.querySelectorAll('.swatch, .pill, .buy, .share, [data-reset]:not([hidden])')].map((el) => Math.round(el.getBoundingClientRect().height)).filter((h) => h > 0),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side. Pixels come from one viewport screenshot decoded in the page: a 5 × 5 px average on the shade's front
// and, for the finishes, luminance statistics over a 200 × 90 px band of the shade above it.
async function pixels(page, pt, band) {
  const png = await page.screenshot();
  return page.evaluate(async ({ b64, pt, band }) => {
    const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
    const cv = new OffscreenCanvas(bmp.width, bmp.height); const g = cv.getContext('2d'); g.drawImage(bmp, 0, 0);
    const d = g.getImageData(pt[0] - 2, pt[1] - 2, 5, 5).data, avg = [0, 0, 0];
    for (let i = 0; i < d.length; i += 4) { avg[0] += d[i]; avg[1] += d[i + 1]; avg[2] += d[i + 2]; }
    const out = { px: avg.map((c) => Math.round(c / 25)) };
    if (band) {
      const b = g.getImageData(pt[0] - 100, pt[1] - 95, 200, 90).data, L = [];
      for (let i = 0; i < b.length; i += 4) L.push(0.2126 * b[i] + 0.7152 * b[i + 1] + 0.0722 * b[i + 2]);
      L.sort((x, y) => x - y);
      out.band = { p50: Math.round(L[L.length >> 1]), p99: Math.round(L[Math.floor(L.length * 0.99)]) };
    }
    return out;
  }, { b64: png.toString('base64'), pt, band });
}
const ready = (page) => page.waitForFunction(() => { const s = window.__awards?.state?.(); return s && (s.mode === 'gl' || s.mode === 'css') && !(s.scene && s.scene.running); }, null, { timeout: 30000 });

export async function inspect(page, st) {
  if (st.name === 'forced') {
    // Forced colours on the same page, with keyboard focus on Satin (Finish) while Dome (Shade) is checked.
    await page.emulateMedia({ forcedColors: 'active' });
    return page.evaluate(() => {
      const look = (v) => { const el = document.querySelector(`label:has(> input[value="${v}"])`), cs = getComputedStyle(el); return { outline: cs.outlineStyle, width: parseFloat(cs.outlineWidth), bg: cs.backgroundColor, focus: el.querySelector('input').matches(':focus-visible'), checked: el.querySelector('input').checked }; };
      const buy = getComputedStyle(document.querySelector('.buy'));
      return { satin: look('satin'), dome: look('dome'), matte: look('matte'), buy: { style: buy.borderTopStyle, width: parseFloat(buy.borderTopWidth), colour: buy.borderTopColor } };
    });
  }
  if (st.name === 'static-load' || st.name === 'load') {
    // A fresh load, watched frame by frame from the first one: the static tier set before the module runs, or a full
    // load recording whether the CSS lamp ever showed before the WebGL lamp took over.
    await page.addInitScript((isStatic) => {
      if (isStatic) document.addEventListener('readystatechange', () => { if (document.readyState === 'interactive') document.documentElement.dataset.motion = 'static'; });
      window.__frames = [];
      const tick = () => {
        const p = document.querySelector('[data-preview]'), c = document.querySelector('[data-gl]');
        if (p && c) window.__frames.push([getComputedStyle(p).visibility === 'visible' ? 1 : 0, Number(getComputedStyle(c).opacity), document.documentElement.classList.contains('gl-active') ? 1 : 0]);
        if (window.__frames.length < 600) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, st.name === 'static-load');
    await page.reload({ waitUntil: 'load' });
    await ready(page);
    await page.waitForTimeout(400);
    return page.evaluate(() => {
      const s = window.__awards.state(), f = window.__frames;
      const firstGl = f.findIndex((x) => x[2] === 1);
      return {
        tier: s.tier, mode: s.mode, glCreated: s.glCreated, renders: s.renders, firstTheta: s.firstTheta,
        frames: f.length, previewFramesBeforeGl: f.slice(0, firstGl < 0 ? f.length : firstGl).filter((x) => x[0]).length,
        fadeFrames: f.filter((x) => x[2] && x[1] > 0 && x[1] < 1).length,
        previewShown: getComputedStyle(document.querySelector('[data-preview]')).visibility === 'visible',
        canvasShown: getComputedStyle(document.querySelector('[data-gl]')).visibility === 'visible',
      };
    });
  }
  if (st.name === 'idle') {
    // A short laptop (1280 × 720): the resize redraws, and once scrolled the stage still fills the screen under the bar.
    const r0 = await page.evaluate(() => window.__awards.state().renders);
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(400);
    // 200 px: the panel (taller than the screen) still runs on below, so the stage is held, not leaving with its section.
    await page.evaluate(() => scrollTo(0, 200));
    await page.waitForTimeout(400);
    return page.evaluate((r0) => {
      const st = document.querySelector('[data-stage]').getBoundingClientRect(), bar = document.querySelector('.bar').getBoundingClientRect(), form = document.querySelector('[data-form]').getBoundingClientRect();
      return { r0, r1: window.__awards.state().renders, vh: innerHeight, y: scrollY, stage: [Math.round(st.top), Math.round(st.bottom)], bar: [Math.round(bar.top), Math.round(bar.bottom)], panel: Math.round(form.height) };
    }, r0);
  }
  if (st.name === 'keys-view') {
    // Right to left the arrows follow the reading direction: from Home (−50°), ← is the next step up.
    await page.keyboard.press('Home');
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    await page.keyboard.press('ArrowLeft');
    const rtl = await page.evaluate(() => window.__awards.state().slider.now);
    await page.evaluate(() => { document.documentElement.dir = 'ltr'; });
    return { rtl };
  }
  if (st.name === 'keys-radio') {
    // The skip link is the page's first focusable element, and it is visible when focused.
    await page.evaluate(() => scrollTo(0, 0));
    await page.focus('.skip-link');
    return page.evaluate(() => { const a = document.activeElement, r = a.getBoundingClientRect(); return { skip: a.classList.contains('skip-link') && document.querySelector('a[href], button, input, [tabindex]') === a, w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) }; });
  }
  if (!['rest', 'matte', 'finish', 'swatch', 'interrupt', 'restored', 'mobile'].includes(st.name)) return null;
  const pt = await page.evaluate(() => window.__awards.state().shadePoint);
  if (!pt) return null;
  const out = { at: pt, ...(await pixels(page, pt, ['rest', 'matte', 'finish'].includes(st.name))) };
  if (st.name === 'mobile') {
    // A one-finger drag across the stage, through the touch pipeline (not a mouse): the turn takes it, the page does not scroll.
    const before = await page.evaluate(() => ({ drags: window.__awards.state().drags, theta: window.__awards.state().goal.theta, y: scrollY }));
    const cdp = await page.context().newCDPSession(page);
    const x0 = 300, y0 = Math.round(pt[1] + 60);
    const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
    await touch('touchStart', x0, y0);
    for (let i = 1; i <= 10; i++) { await touch('touchMove', x0 - i * 12, y0 + i); await page.waitForTimeout(16); }
    await touch('touchEnd');
    await page.waitForTimeout(150);
    const after = await page.evaluate(() => ({ drags: window.__awards.state().drags, theta: window.__awards.state().goal.theta, y: scrollY, now: window.__awards.state().slider.now }));
    out.touch = { before, after };
  }
  return out;
}

// ΔE2000 between two sRGB triplets.
function lab(rgb) {
  const [R, G, B] = rgb.map((c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047, Y = 0.2126 * R + 0.7152 * G + 0.0722 * B, Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
function dE(p, q) {
  if (!p || !q) return NaN;
  const [L1, a1, b1] = lab(p), [L2, a2, b2] = lab(q), rad = Math.PI / 180;
  const Cm = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2, G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const a1p = a1 * (1 + G), a2p = a2 * (1 + G), C1 = Math.hypot(a1p, b1), C2 = Math.hypot(a2p, b2);
  const hue = (x, y) => { const v = Math.atan2(y, x) / rad; return v < 0 ? v + 360 : v; };
  const h1 = hue(a1p, b1), h2 = hue(a2p, b2);
  let dh = h2 - h1; if (C1 * C2 === 0) dh = 0; else if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
  const dL = L2 - L1, dC = C2 - C1, dH = 2 * Math.sqrt(C1 * C2) * Math.sin((dh / 2) * rad);
  const Lm = (L1 + L2) / 2, Cmp = (C1 + C2) / 2;
  const hm = C1 * C2 === 0 ? h1 + h2 : Math.abs(h1 - h2) > 180 ? (h1 + h2 + (h1 + h2 < 360 ? 360 : -360)) / 2 : (h1 + h2) / 2;
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
  const Rc = 2 * Math.sqrt(Cmp ** 7 / (Cmp ** 7 + 25 ** 7)), Rt = -Math.sin(2 * 30 * Math.exp(-(((hm - 275) / 25) ** 2)) * rad) * Rc;
  const Sl = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2), Sc = 1 + 0.045 * Cmp, Sh = 1 + 0.015 * Cmp * T;
  return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh));
}
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (h) => hex(h).map((c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
// Where a colour sits on the line from a to b in linear RGB: its fraction along it and its distance off it.
function onLine(c, a, b) {
  const [C, A, B] = [lin(c), lin(a), lin(b)], d = B.map((x, i) => x - A[i]), v = C.map((x, i) => x - A[i]);
  const t = v.reduce((s, x, i) => s + x * d[i], 0) / d.reduce((s, x) => s + x * x, 0);
  return { t, off: Math.hypot(...v.map((x, i) => x - t * d[i])) };
}
const CLAY = '#b4613f', MOSS = '#5f6e47', INK = '#262a33', SAFFRON = '#d7a032';
const f1 = (n) => (Number.isFinite(n) ? n.toFixed(1) : String(n));

const DEG = Math.PI / 180;
export function assert(r) {
  const out = [];
  const S = (k) => r[k]?.state || {};
  const P = (k) => r[k]?.probe || {};
  const I = (k) => r[k]?.inspect || {};
  const near = (v, x, e = 1e-3) => Math.abs((v ?? NaN) - x) <= e;
  const sc = (k) => S(k).scene || {};
  const u = (k) => sc(k).uniforms || {};

  const rest = S('rest'), rp = P('rest');
  out.push({ ok: rest.mode === 'gl' && sc('rest').colour === CLAY && sc('rest').roughness === 0.48 && sc('rest').morph?.join() === '0,0' && sc('rest').cap === 1 && rest.price === '£255' && rest.url === '' && rp.live?.join() === 'polite,true', message: `rest: Clay, satin, dome from the defaults (scene ${sc('rest').colour}, roughness ${sc('rest').roughness}, morph ${sc('rest').morph}, crown cap ${sc('rest').cap}), ${rest.price}, URL untouched ("${rest.url}"), summary aria-live ${rp.live}` });
  out.push({ ok: near(rest.firstTheta, -25 * DEG, 0.01) && near(rest.cam?.theta, 20 * DEG) && rest.renders >= 3 && rest.slider?.role === 'slider' && rest.slider?.now === '20' && rest.slider?.text === 'Viewed 20° right of front', message: `rest: the arrival turn drew its first frame at ${f1(rest.firstTheta / DEG)}° and settled on ${f1(rest.cam?.theta / DEG)}° over ${rest.renders} frames; the view is a slider at ${rest.slider?.now} ("${rest.slider?.text}")` });
  out.push({ ok: rp.canvas?.visibility === 'visible' && rp.canvas?.opacity === 1 && rp.canvas?.transition === '0.3s' && !rp.previewShown && rp.hintShown && rp.resetShown, message: `rest: the canvas is shown (opacity ${rp.canvas?.opacity}, fades in over ${rp.canvas?.transition}), the CSS lamp hidden (${!rp.previewShown}), hint and reset shown` });
  const ld = I('load');
  out.push({ ok: ld.mode === 'gl' && ld.frames > 0 && ld.previewFramesBeforeGl === 0 && ld.canvasShown && !ld.previewShown, message: `load: over ${ld.frames} frames watched from the first, the CSS lamp showed in ${ld.previewFramesBeforeGl} before the WebGL lamp took over (the sweep alone until then; ${ld.fadeFrames} frames caught the canvas mid-fade)` });

  // Colour fidelity: the shade's lit front against its swatch, in every finish.
  const dRest = dE(I('rest').px, hex(CLAY)), dMatte = dE(I('matte').px, hex(CLAY)), dGloss = dE(I('finish').px, hex(CLAY));
  out.push({ ok: dRest <= 5 && dMatte <= 5 && dGloss <= 5, message: `colour: Clay renders within ΔE2000 5 of its swatch in satin ${f1(dRest)} (rgb ${I('rest').px}), matte ${f1(dMatte)} (rgb ${I('matte').px}) and gloss ${f1(dGloss)} (rgb ${I('finish').px})` });

  // The finishes: what the shader was given, and what it drew.
  const ma = S('matte'), fi = S('finish');
  out.push({ ok: u('matte').roughness === 0.82 && u('matte').clearcoat === 0.02 && u('matte').clearcoatRoughness === 0.8 && ma.price === '£240' && /matte lacquer/.test(ma.spec) && u('finish').roughness === 0.3 && u('finish').clearcoat === 1 && u('finish').clearcoatRoughness === 0.06 && fi.price === '£270' && /gloss lacquer/.test(fi.spec) && /finish=gloss/.test(fi.url) && u('finish').envMapIntensity === u('rest').envMapIntensity, message: `finish: the shader's uniforms read matte ${u('matte').roughness} / ${u('matte').clearcoat} / ${u('matte').clearcoatRoughness} (${ma.price}) and gloss ${u('finish').roughness} / ${u('finish').clearcoat} / ${u('finish').clearcoatRoughness} (${fi.price}); the room's light stays ${u('finish').envMapIntensity} for every finish` });
  const bm = I('matte').band || {}, bs = I('rest').band || {}, bg = I('finish').band || {};
  out.push({ ok: bg.p99 - bm.p99 >= 40 && bs.p99 > bm.p99 && bs.p99 < bg.p99 && Math.abs(bg.p50 - bm.p50) <= 12, message: `finish: the shade's highlights climb matte ${bm.p99} → satin ${bs.p99} → gloss ${bg.p99} (99th-percentile luminance) while its mid-tone holds (median ${bm.p50} / ${bs.p50} / ${bg.p50})` });

  // The key assertion: the swatch reaches the scene's material, the pixels, the words and the URL, with no history entry.
  const sw = S('swatch'), sp = P('swatch');
  out.push({ ok: sc('swatch').colour === MOSS && sc('swatch').colour === sw.swatch && sw.summary === 'Ostra in Moss, satin, dome shade: £255.' && sw.url === '?colour=moss&finish=satin&shade=dome' && sw.share === sw.url && sp.h0 === sw.history, message: `swatch: Moss reaches the material (${sc('swatch').colour} = ${sw.swatch}), the polite summary ("${sw.summary}") and the URL (${sw.url}) with replaceState (history ${sp.h0} → ${sw.history})` });
  const dMoss = dE(I('swatch').px, hex(MOSS)), dMossClay = dE(I('swatch').px, hex(CLAY));
  out.push({ ok: dMoss <= 5 && dMossClay >= 15, message: `swatch: the shade's pixels turn to moss (rgb ${I('swatch').px}, ΔE2000 ${f1(dMoss)} from the swatch, ${f1(dMossClay)} from Clay)` });
  out.push({ ok: /^Link copied: http:\/\/\S+\?colour=moss&finish=satin&shade=dome$/.test(sw.status ?? '') || sw.status === 'Could not copy. The address bar holds the link to this lamp.', message: `share: the link copies the configuration instead of reloading the page ("${sw.status}"), the page stayed (history mark ${sp.h0})` });

  // Interrupted: every frame after the second choice lies on the line from the colour the first had reached to Saffron.
  const ip = P('interrupt'), trail = ip.trail || [];
  const q = ip.pre ? onLine(ip.pre, CLAY, INK) : {};
  const first = trail.find((c) => c !== SAFFRON) ?? null;
  const turn = first ? onLine(first, ip.pre, SAFFRON) : {}, restart = first ? onLine(first, CLAY, SAFFRON) : {};
  const along = trail.map((c) => onLine(c, ip.pre, SAFFRON));
  out.push({ ok: !ip.missed && q.t >= 0.15 && q.t < 0.99 && ip.tweensAfter === 1, message: `interrupt: Saffron was chosen with the lacquer ${f1(q.t * 100)}% of the way from Clay to Ink (${ip.pre}), and one colour tween was left running (${ip.tweensAfter})` });
  out.push({ ok: !!first && turn.t > 0 && turn.t < 1 && turn.off <= 0.008 && restart.off >= 0.02 && restart.off >= 3 * turn.off && along.every((a, i) => i === 0 || a.t >= along[i - 1].t - 0.01) && trail.at(-1) === SAFFRON, message: `interrupt: the first new frame (${first}) sits ${f1((turn.t ?? NaN) * 100)}% along the line from ${ip.pre} to Saffron, ${(turn.off ?? NaN).toFixed(4)} off it (a restart from Clay would be ${(restart.off ?? NaN).toFixed(4)} off), and ${trail.length} frames run on to ${trail.at(-1)} without turning back` });
  const dInt = dE(I('interrupt').px, hex(SAFFRON));
  out.push({ ok: sc('interrupt').colour === SAFFRON && S('interrupt').config?.colour === 'saffron' && /colour=saffron/.test(S('interrupt').url) && dInt <= 5, message: `interrupt: it ends on ${sc('interrupt').colour}, drawn at rgb ${I('interrupt').px} (ΔE2000 ${f1(dInt)})` });

  // The price is never late: read in the same task as the click, before the morph has drawn a frame.
  const sh = S('shade'), sy = P('shade').sync || {};
  out.push({ ok: sy.price === '£275' && /drum shade: £275\.$/.test(sy.summary ?? '') && /^Drum shade, Ø 30 cm/.test(sy.spec ?? '') && sy.morph?.join() === '0,0' && sc('shade').morph?.join() === '0,1' && sc('shade').cap === 0 && sh.price === '£275' && /shade=drum/.test(sh.url), message: `shade: in the click's own task the price reads ${sy.price} and the summary "${sy.summary}" while the morph is still ${sy.morph}; it then reaches ${sc('shade').morph} (crown cap ${sc('shade').cap})` });

  const re = S('restore'), rr = P('restore');
  out.push({ ok: rr.checked?.colour === 'clay' && rr.checked?.finish === 'matte' && rr.checked?.shade === 'cone' && sc('restore').colour === CLAY && sc('restore').roughness === 0.82 && sc('restore').morph?.join() === '1,0' && re.price === '£225' && re.summary === 'Ostra in Clay, matte, cone shade: £225.' && re.url === '?colour=clay&finish=matte&shade=cone&utm_source=demo' && re.share === '?colour=clay&finish=matte&shade=cone', message: `restore: a reload of ?colour=teal&finish=matte&shade=cone&utm_source=demo falls back to Clay for the unknown colour (${JSON.stringify(rr.checked)}, scene ${sc('restore').colour}, morph ${sc('restore').morph}, ${re.price}); the address bar now reads ${re.url}, the share link only ${re.share}` });

  const kr = S('keys-radio'), krp = P('keys-radio');
  out.push({ ok: krp.focused === 'colour:moss' && kr.config?.colour === 'moss' && sc('keys-radio').colour === MOSS && /colour=moss/.test(kr.url), message: `keys: ArrowRight in the colour group moves focus and choice to ${krp.focused} (${sc('keys-radio').colour})` });
  out.push({ ok: kr.adds === 0 && kr.status === '' && krp.bag === 'Bag (0)' && krp.focused === 'colour:moss', message: `keys: Enter on the focused swatch confirms nothing into the bag (adds ${kr.adds}, "${krp.bag}", status "${kr.status}")` });
  const sk = I('keys-radio');
  out.push({ ok: sk.skip && sk.w > 40 && sk.h > 20 && sk.top >= 0, message: `skip link: the page's first focusable element, shown ${sk.w} × ${sk.h} px at ${sk.top} px from the top` });
  const kv = S('keys-view'), kvp = P('keys-view');
  out.push({ ok: kvp.focused === 'view' && kv.keys === 6 && kvp.kv?.join() === '-10,-50,-25,50' && near(kv.cam?.theta, 50 * DEG) && kv.slider?.text === 'Viewed 50° right of front', message: `keys: on the focused view three ArrowLefts, Home, PageUp and End read ${kvp.kv?.join(' → ')}°; it settles at θ ${f1(kv.cam?.theta / DEG)}° ("${kv.slider?.text}")` });
  out.push({ ok: I('keys-view').rtl === '-40', message: `keys: right to left, ← from Home steps the view up to ${I('keys-view').rtl}°` });

  // The clamp: a drag far right and down stops at −50° and the lowest polar angle; the value is spoken once, on release.
  const dr = S('drag'), md = P('drag').midDrag || {};
  out.push({ ok: dr.drags === 1 && near(dr.goal?.theta, dr.clamp?.theta?.[0]) && near(dr.cam?.theta, dr.clamp?.theta?.[0]) && near(dr.cam?.phi, dr.clamp?.phi?.[0]) && dr.slider?.now === '-50' && md.now === '20' && md.goal < 0, message: `drag: 900 px right and 460 px down stops at the clamp (θ ${dr.cam?.theta} of ${dr.clamp?.theta?.[0]}, φ ${dr.cam?.phi} of ${dr.clamp?.phi?.[0]}); mid-drag the slider still said ${md.now} with the goal at ${md.goal}, then ${dr.slider?.now} on release` });
  const rs = S('reset');
  out.push({ ok: near(rs.cam?.theta, 20 * DEG) && near(rs.cam?.phi, 1.32) && rs.slider?.now === '20', message: `reset: the button brings the view back to 20° (θ ${rs.cam?.theta}, φ ${rs.cam?.phi})` });

  const id = S('idle'), sh7 = I('idle');
  out.push({ ok: Number.isFinite(P('idle').renders0) && P('idle').renders0 > 0 && id.renders === P('idle').renders0 && id.scene?.running === false, message: `idle: ${P('idle').renders0} renders before a 1.5 s wait, ${id.renders} after, loop ${id.scene?.running ? 'running' : 'stopped'}` });
  out.push({ ok: sh7.r1 > sh7.r0 && sh7.y === 200 && sh7.bar?.[0] === 0 && Math.abs(sh7.stage?.[1] - sh7.vh) <= 1 && sh7.stage?.[0] <= sh7.bar?.[1] && sh7.panel > sh7.vh, message: `short laptop: resizing to 1280 × ${sh7.vh} redraws (${sh7.r0} → ${sh7.r1} renders); scrolled ${sh7.y} px along a ${sh7.panel} px panel, the bar holds ${sh7.bar?.join('–')} and the stage ${sh7.stage?.join('–')}, down to the screen's foot` });

  const cf = S('configured');
  out.push({ ok: sc('configured').colour === SAFFRON && u('configured').clearcoat === 1 && sc('configured').morph?.join() === '1,0' && cf.slider?.now === '-20' && near(cf.cam?.theta, -20 * DEG) && cf.price === '£255', message: `configured: Saffron, gloss, cone seen from −20° (scene ${sc('configured').colour}, clearcoat ${u('configured').clearcoat}, morph ${sc('configured').morph}, θ ${f1(cf.cam?.theta / DEG)}°), ${cf.price}` });

  const fc = I('forced');
  out.push({ ok: fc.satin?.focus && fc.satin?.checked && fc.satin.outline === 'solid' && fc.satin.width >= 2 && fc.dome?.checked && !fc.dome.focus && fc.dome.outline === 'none' && fc.dome.bg === fc.satin.bg && fc.matte?.bg !== fc.dome.bg, message: `forced colours: the focused Satin pill has a ${fc.satin?.outline} ${fc.satin?.width}px ring, the checked Dome pill none (${fc.dome?.outline}); both checked pills fill with ${fc.dome?.bg}, the unchecked Matte with ${fc.matte?.bg}` });
  out.push({ ok: fc.buy?.style === 'solid' && fc.buy.width >= 1 && fc.buy.colour !== 'rgba(0, 0, 0, 0)', message: `forced colours: Add to bag keeps a ${fc.buy?.style} ${fc.buy?.width}px ${fc.buy?.colour} boundary` });

  const lo = S('lost'), lp = P('lost');
  out.push({ ok: lo.lost && lo.losses === 1 && lo.mode === 'css' && lp.previewShown && lp.canvas?.visibility === 'hidden' && !lp.hintShown && !lp.resetShown && lo.slider?.role === null && lo.preview?.colour === 'rgb(95, 110, 71)' && lo.price === '£255', message: `lost: a lost context hands the page to the CSS lamp (mode ${lo.mode}, CSS lamp ${lp.previewShown}, canvas ${lp.canvas?.visibility}, slider role ${lo.slider?.role}, hint and reset hidden), which still takes Moss (${lo.preview?.colour}), ${lo.price}` });
  const rd = S('restored'), dRd = dE(I('restored').px, hex(CLAY));
  out.push({ ok: rd.mode === 'gl' && rd.restores === 1 && !rd.lost && rd.slider?.role === 'slider' && P('restored').canvas?.visibility === 'visible' && dRd <= 5, message: `restored: the context comes back to WebGL (mode ${rd.mode}, slider ${rd.slider?.role}) with its room re-baked: Clay draws at rgb ${I('restored').px}, ΔE2000 ${f1(dRd)}` });

  const rm = S('rm'), rmp = P('rm');
  out.push({ ok: rm.tier === 'reduced' && sc('rm').colour === MOSS && sc('rm').tweening === false && near(rm.firstTheta, 20 * DEG) && near(rm.cam?.theta, 20 * DEG) && rm.renders <= 3 && rmp.canvas?.transition === '0s', message: `reduced: 50 ms after the click the material is already Moss (${sc('rm').colour}, tweening ${sc('rm').tweening}); no arrival turn (first frame at ${f1(rm.firstTheta / DEG)}°, ${rm.renders} frames in all) and no canvas fade (${rmp.canvas?.transition})` });

  const ng = S('nogl'), np = P('nogl');
  out.push({ ok: ng.glCreated === false && ng.mode === 'css' && np.previewShown && np.canvas?.visibility === 'hidden' && !np.resetShown && ng.slider?.role === null && ng.preview?.colour === 'rgb(95, 110, 71)' && ng.preview?.shade === 'cone' && ng.price === '£240' && /nogl/.test(ng.url) && ng.share === '?colour=moss&finish=satin&shade=cone', message: `?nogl: the CSS lamp (${ng.preview?.colour}, ${ng.preview?.shade}) with the same controls, ${ng.price}; the address bar keeps ${ng.url}, the share link carries only ${ng.share}` });

  const st = S('static'), stp = P('static');
  out.push({ ok: st.mode === 'css' && stp.previewShown && stp.canvas?.visibility === 'hidden' && st.preview?.sheen === '0.6' && st.price === '£270' && st.renders === stp.renders0, message: `static: switched at run time, the CSS lamp takes the gloss sheen (${st.preview?.sheen}) and ${st.price}, no draws after the switch (${stp.renders0} → ${st.renders})` });
  const sl = I('static-load');
  out.push({ ok: sl.tier === 'static' && sl.mode === 'css' && sl.glCreated === false && sl.renders === 0 && sl.previewShown && !sl.canvasShown, message: `static from load: tier ${sl.tier}, mode ${sl.mode}, WebGL never created (${sl.glCreated}, ${sl.renders} renders), the CSS lamp shown` });

  const m = S('mobile'), mp = P('mobile'), mi = I('mobile');
  out.push({ ok: m.mode === 'gl' && sc('mobile').colour === SAFFRON && sc('mobile').morph?.join() === '0,1' && mp.scrollY > 0 && mp.stage?.top >= -1 && mp.stage?.bottom <= mp.vh + 1 && mp.drum?.top >= mp.stage?.bottom - 1 && mp.drum?.bottom <= mp.vh && (mp.overflowX ?? 1) <= 0, message: `mobile: scrolled ${mp.scrollY} px down to the shade row, the stage stays on screen (${mp.stage?.top}–${mp.stage?.bottom} of ${mp.vh}) with the tapped Drum pill in view under it (${mp.drum?.top}–${mp.drum?.bottom}); overflow ${mp.overflowX}px` });
  const dMob = dE(mi.px, hex(SAFFRON)), dMobClay = dE(mi.px, hex(CLAY));
  out.push({ ok: dMob <= 6 && dMobClay >= 15, message: `mobile: the tap on Saffron is drawn without scrolling back (rgb ${mi.px}, ΔE2000 ${f1(dMob)} from Saffron, ${f1(dMobClay)} from Clay)` });
  const tb = mi.touch?.before || {}, ta = mi.touch?.after || {};
  out.push({ ok: ta.drags === tb.drags + 1 && Math.abs(ta.theta - tb.theta) >= 20 * DEG && ta.y === tb.y && ta.now === String(Math.round(ta.theta / DEG)), message: `mobile: a one-finger drag of 120 px turns the view from ${f1(tb.theta / DEG)}° to ${f1(ta.theta / DEG)}° (slider ${ta.now}) and the page stays at ${ta.y} px (was ${tb.y})` });
  out.push({ ok: (mp.targets || []).length > 10 && mp.targets.every((h) => h >= 44), message: `mobile: every option, the reset and the actions are at least 44 px tall (min ${Math.min(...(mp.targets || [0]))})` });
  return out;
}
