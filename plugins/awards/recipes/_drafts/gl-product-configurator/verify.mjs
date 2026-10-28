// The verify idea: a choice is proved in four places at once. The scene's own material reaches the swatch's value
// (read back from three through the state hook), real pixels on the shade change hue, the summary, price and spec say
// it, and the URL carries it so a reload restores it. A second choice mid-tween turns the first around from where it
// was. The radio groups move with arrow keys; the view's slider turns with arrow keys and a drag stops at the clamp;
// nothing is drawn while idle; reduced motion swaps instantly; ?nogl and the static tier keep every control on a CSS lamp.
const pick = (name, value) => ({ type: 'click', selector: `label:has(> input[name="${name}"][value="${value}"])` });
const mark = { type: 'waitFor', fn: '(window.__r0 = window.__awards.state().renders, true)' };
const query = (q) => [{ type: 'waitFor', fn: `(history.replaceState(null, '', '${q}'), true)` }, { type: 'reload' }];
// Wait until the render loop has stopped: the view has settled and no tween runs (the CSS mode has no loop).
const settled = { type: 'waitFor', timeout: 20000, fn: "(() => { const s = window.__awards.state(); return s.mode !== 'pending' && !(s.scene && s.scene.running); })()" };
// Polled every frame: true (and the colour kept) once the lacquer is neither the old Clay nor the new Ink.
const MIDWAY = "(() => { const c = window.__awards.state().scene.colour; if (c === '#b4613f' || c === '#262a33') return false; window.__mid = c; return true; })()";
const DRAG = [{ type: 'move', x: 500, y: 420, steps: 2 }, { type: 'down' }, { type: 'move', x: 1400, y: 880, steps: 18 }, { type: 'up' }];

export const states = [
  { name: 'rest', settle: 600, actions: [settled] },
  { name: 'swatch', frame: true, settle: 600, actions: [settled, pick('colour', 'moss'), { type: 'wait', ms: 100 }, settled] },
  { name: 'interrupt', settle: 600, actions: [settled, pick('colour', 'ink'), { type: 'waitFor', fn: MIDWAY }, pick('colour', 'saffron'), { type: 'wait', ms: 100 }, settled] },
  { name: 'finish', settle: 600, actions: [settled, pick('finish', 'gloss'), { type: 'wait', ms: 100 }, settled] },
  { name: 'shade', settle: 600, actions: [settled, pick('shade', 'drum'), { type: 'wait', ms: 100 }, settled] },
  { name: 'restore', settle: 600, actions: [...query('?colour=ink&finish=matte&shade=cone'), settled] },
  { name: 'keys-radio', settle: 600, actions: [settled, { type: 'focus', selector: 'input[name="colour"]:checked' }, { type: 'press', key: 'ArrowRight' }, { type: 'wait', ms: 100 }, settled] },
  { name: 'keys-view', settle: 600, actions: [settled, { type: 'focus', selector: '[data-view]' }, { type: 'press', key: 'ArrowLeft' }, { type: 'press', key: 'ArrowLeft' }, { type: 'press', key: 'ArrowLeft' }, { type: 'wait', ms: 100 }, settled] },
  { name: 'drag', settle: 600, actions: [settled, ...DRAG, { type: 'wait', ms: 100 }, settled] },
  { name: 'reset', settle: 600, actions: [settled, ...DRAG, { type: 'wait', ms: 300 }, { type: 'click', selector: '[data-reset]' }, { type: 'wait', ms: 100 }, settled] },
  { name: 'idle', settle: 600, actions: [settled, mark, { type: 'wait', ms: 1500 }] },
  { name: 'rm', reducedMotion: true, settle: 900, actions: [pick('colour', 'moss'), { type: 'wait', ms: 50 }] },
  { name: 'nogl', settle: 600, actions: [...query('?nogl'), pick('colour', 'moss'), pick('shade', 'cone'), { type: 'wait', ms: 600 }] },
  { name: 'static', settle: 1200, actions: [{ type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" }, { type: 'wait', ms: 300 }, mark, pick('finish', 'gloss'), { type: 'wait', ms: 600 }] },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: [settled, pick('colour', 'saffron'), { type: 'wait', ms: 100 }, settled] },
];

export function probe() {
  const $ = (q) => document.querySelector(q);
  const stage = $('[data-stage]').getBoundingClientRect(), form = $('[data-form]').getBoundingClientRect();
  return {
    mid: window.__mid ?? null,
    renders0: window.__r0 ?? null,
    checked: Object.fromEntries(['colour', 'finish', 'shade'].map((n) => [n, document.querySelector(`input[name="${n}"]:checked`)?.value ?? null])),
    focused: document.activeElement?.matches?.('input') ? `${document.activeElement.name}:${document.activeElement.value}` : document.activeElement?.dataset && 'view' in document.activeElement.dataset ? 'view' : document.activeElement?.tagName,
    canvasShown: getComputedStyle($('[data-gl]')).display !== 'none',
    previewShown: getComputedStyle($('[data-preview]')).visibility === 'visible',
    resetShown: !$('[data-reset]').hidden,
    live: $('[data-summary]').getAttribute('aria-live'),
    stageAboveForm: stage.bottom <= form.top + 1,
    targets: [...document.querySelectorAll('.swatch, .pill, .buy, .share, [data-reset]:not([hidden])')].map((el) => Math.round(el.getBoundingClientRect().height)).filter((h) => h > 0),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side: a 5 × 5 px screenshot crop on the shade's front, averaged, on the states where its colour matters.
export async function inspect(page, st) {
  if (!['rest', 'swatch', 'interrupt', 'mobile'].includes(st.name)) return null;
  // A tap may have scrolled the phone's stage up; bring it back (the canvas keeps its last frame, nothing re-renders).
  const pt = await page.evaluate(async () => { scrollTo(0, 0); await new Promise((r) => setTimeout(r, 150)); return window.__awards.state().shadePoint; });
  if (!pt) return null;
  const png = await page.screenshot({ clip: { x: pt[0] - 2, y: pt[1] - 2, width: 5, height: 5 } });
  const px = await page.evaluate(async (b64) => {
    const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
    const cv = new OffscreenCanvas(bmp.width, bmp.height); const g = cv.getContext('2d'); g.drawImage(bmp, 0, 0);
    const d = g.getImageData(0, 0, bmp.width, bmp.height).data, n = d.length / 4, avg = [0, 0, 0];
    for (let i = 0; i < d.length; i += 4) { avg[0] += d[i]; avg[1] += d[i + 1]; avg[2] += d[i + 2]; }
    return avg.map((c) => Math.round(c / n));
  }, png.toString('base64'));
  return { px, at: pt };
}

const DEG = Math.PI / 180;
export function assert(r) {
  const out = [];
  const S = (k) => r[k]?.state || {};
  const P = (k) => r[k]?.probe || {};
  const I = (k) => r[k]?.inspect || {};
  const near = (v, x, e = 1e-3) => Math.abs((v ?? NaN) - x) <= e;
  const sc = (k) => S(k).scene || {};

  const rest = S('rest');
  out.push({ ok: rest.mode === 'gl' && sc('rest').colour === '#b4613f' && sc('rest').roughness === 0.48 && sc('rest').morph?.join() === '0,0' && rest.price === '£255' && rest.url === '', message: `rest: Clay, satin, dome from the defaults (scene ${sc('rest').colour}, roughness ${sc('rest').roughness}, morph ${sc('rest').morph}), ${rest.price}, URL untouched ("${rest.url}")` });
  out.push({ ok: near(rest.cam?.theta, 20 * DEG) && rest.slider?.role === 'slider' && rest.slider?.now === '20' && rest.slider?.text === 'Viewed 20° right of front', message: `rest: the arrival turn settled on 20° (θ ${rest.cam?.theta}); the view is a slider at ${rest.slider?.now} ("${rest.slider?.text}")` });

  // The key assertion: the swatch reaches the scene's material, the pixels, the words and the URL.
  const sw = S('swatch');
  out.push({ ok: sc('swatch').colour === '#5f6e47' && sc('swatch').colour === sw.swatch && sw.summary === 'Ostra in Moss, satin, dome shade: £255.' && sw.url === '?colour=moss&finish=satin&shade=dome' && sw.share === sw.url && P('swatch').live === 'polite', message: `swatch: Moss reaches the material (${sc('swatch').colour} = ${sw.swatch}), the polite summary ("${sw.summary}") and the URL (${sw.url})` });
  const pr = I('rest').px, ps = I('swatch').px;
  out.push({ ok: !!pr && !!ps && pr[0] > pr[1] + 25 && ps[1] > ps[0] && ps[1] > ps[2], message: `swatch: the shade's pixels turn from clay (rgb ${pr}) to moss (rgb ${ps})` });

  const it = S('interrupt'), mid = P('interrupt').mid;
  out.push({ ok: !!mid && mid !== '#b4613f' && mid !== '#262a33' && sc('interrupt').colour === '#d7a032' && it.config?.colour === 'saffron' && /colour=saffron/.test(it.url), message: `interrupt: Ink was mid-way (${mid}) when Saffron was chosen; the tween turned from there and ends on ${sc('interrupt').colour}` });

  const fi = S('finish');
  out.push({ ok: sc('finish').roughness === 0.3 && sc('finish').clearcoat === 1 && sc('finish').clearcoatRoughness === 0.06 && sc('finish').envMapIntensity === 1.2 && fi.price === '£270' && /gloss lacquer/.test(fi.spec) && /finish=gloss/.test(fi.url), message: `finish: Gloss sets roughness ${sc('finish').roughness}, clearcoat ${sc('finish').clearcoat}, env ${sc('finish').envMapIntensity}; ${fi.price}; "${fi.spec}"` });

  const sh = S('shade');
  out.push({ ok: sc('shade').morph?.join() === '0,1' && sh.price === '£275' && /^Drum shade, Ø 30 cm/.test(sh.spec) && /shade=drum/.test(sh.url), message: `shade: Drum morphs the shade to target 2 (${sc('shade').morph}), ${sh.price}, "${sh.spec.slice(0, 32)}…"` });

  const re = S('restore'), rp = P('restore');
  out.push({ ok: rp.checked?.colour === 'ink' && rp.checked?.finish === 'matte' && rp.checked?.shade === 'cone' && sc('restore').colour === '#262a33' && sc('restore').roughness === 0.82 && sc('restore').morph?.join() === '1,0' && re.price === '£225' && re.summary === 'Ostra in Ink, matte, cone shade: £225.', message: `restore: a reload of ?colour=ink&finish=matte&shade=cone checks ${JSON.stringify(rp.checked)}, draws ${sc('restore').colour} at roughness ${sc('restore').roughness} with morph ${sc('restore').morph}, ${re.price}` });

  const kr = S('keys-radio');
  out.push({ ok: P('keys-radio').focused === 'colour:moss' && kr.config?.colour === 'moss' && sc('keys-radio').colour === '#5f6e47' && /colour=moss/.test(kr.url), message: `keys: ArrowRight in the colour group moves focus and choice to ${P('keys-radio').focused} (${sc('keys-radio').colour})` });
  const kv = S('keys-view');
  out.push({ ok: P('keys-view').focused === 'view' && kv.keys === 3 && near(kv.goal?.theta, -10 * DEG) && near(kv.cam?.theta, -10 * DEG) && kv.slider?.now === '-10', message: `keys: three ArrowLefts on the focused view turn it 30° to ${kv.slider?.now}° (θ ${kv.cam?.theta}, "${kv.slider?.text}")` });

  // The clamp: a drag far right and down stops at −50° and the lowest polar angle, and the view settles there.
  const dr = S('drag');
  out.push({ ok: dr.drags === 1 && near(dr.goal?.theta, dr.clamp?.theta?.[0]) && near(dr.cam?.theta, dr.clamp?.theta?.[0]) && near(dr.cam?.phi, dr.clamp?.phi?.[0]) && dr.slider?.now === '-50', message: `drag: 900 px right and 460 px down stops at the clamp (θ ${dr.cam?.theta} of ${dr.clamp?.theta?.[0]}, φ ${dr.cam?.phi} of ${dr.clamp?.phi?.[0]}), slider ${dr.slider?.now}` });
  const rs = S('reset');
  out.push({ ok: near(rs.cam?.theta, 20 * DEG) && near(rs.cam?.phi, 1.32) && rs.slider?.now === '20', message: `reset: the button brings the view back to 20° (θ ${rs.cam?.theta}, φ ${rs.cam?.phi})` });

  const id = S('idle');
  out.push({ ok: Number.isFinite(P('idle').renders0) && P('idle').renders0 > 0 && id.renders === P('idle').renders0 && id.scene?.running === false, message: `idle: ${P('idle').renders0} renders before a 1.5 s wait, ${id.renders} after, loop ${id.scene?.running ? 'running' : 'stopped'}` });

  const rm = S('rm');
  out.push({ ok: rm.tier === 'reduced' && sc('rm').colour === '#5f6e47' && sc('rm').tweening === false && near(rm.cam?.theta, 20 * DEG), message: `reduced: 50 ms after the click the material is already Moss (${sc('rm').colour}, tweening ${sc('rm').tweening}); no arrival turn (θ ${rm.cam?.theta})` });

  const ng = S('nogl'), np = P('nogl');
  out.push({ ok: ng.glCreated === false && ng.mode === 'css' && np.previewShown && !np.canvasShown && !np.resetShown && ng.slider?.role === null && ng.preview?.colour === 'rgb(95, 110, 71)' && ng.preview?.shade === 'cone' && ng.price === '£240' && /nogl/.test(ng.url) && /colour=moss/.test(ng.url) && /shade=cone/.test(ng.url), message: `?nogl: the CSS lamp (${ng.preview?.colour}, ${ng.preview?.shade}) with the same controls, ${ng.price}, URL ${ng.url}, no slider role` });

  const st = S('static'), sp = P('static');
  out.push({ ok: st.mode === 'css' && sp.previewShown && !sp.canvasShown && st.preview?.sheen === '0.6' && st.price === '£270' && st.renders === sp.renders0, message: `static: the CSS lamp takes the gloss sheen (${st.preview?.sheen}) and ${st.price}, no draws after the switch (${sp.renders0} → ${st.renders})` });

  const m = S('mobile'), mp = P('mobile');
  out.push({ ok: m.mode === 'gl' && sc('mobile').colour === '#d7a032' && mp.stageAboveForm && (mp.overflowX ?? 1) <= 0 && (I('mobile').px?.[0] ?? 0) > (I('mobile').px?.[2] ?? 255) + 40, message: `mobile: the controls sit under the stage, a tap on Saffron reaches the material (${sc('mobile').colour}, pixels ${I('mobile').px}), overflow ${mp.overflowX}px` });
  out.push({ ok: (mp.targets || []).length > 10 && mp.targets.every((h) => h >= 44), message: `mobile: every option, the reset and the actions are at least 44 px tall (min ${Math.min(...(mp.targets || [0]))})` });
  return out;
}
