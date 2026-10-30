// The warp is judged where it lands: the element's four corners are projected through its computed matrix3d (with
// the perspective divide) and compared with the drawn screen quad read through the SVG's own getScreenCTM, within a
// pixel; that target is checked once more by plain arithmetic from the drawing's box, viewBox and slice rule, so a CTM
// that lost the crop cannot move the page and the check together. The browser's own bounding box of the warped element
// must match the quad's; hit tests just inside and just outside each corner confirm the box the browser hit-tests is
// that quad. Flat is the untransformed layout box; a mid-scroll frame lies on the corner lerp between the two, with its
// glare inside the screen; a resize re-measures; the app stays selectable (a real double-click); a Tab walk from the
// top reaches both loop buttons with a visible ring; the page's own control is 44 px everywhere; the loop pauses when
// the stage leaves the screen; reduced motion and static sit placed with no rail, and a forced full tier gets its rail.
const at = (p) => ({ type: 'waitFor', fn: `(() => { const [a, b] = window.__awards.state().range; scrollTo(0, Math.round(a + (b - a) * ${p})); dispatchEvent(new Event('scroll')); return true; })()` });
const rest = { type: 'wait', ms: 400 };
// Records what has focus at this point of a keyboard walk, for the probe to read at the end.
const note = (key) => ({ type: 'waitFor', fn: `(() => { const a = document.activeElement, cs = getComputedStyle(a), r = a.getBoundingClientRect(), s = window.__awards.state(); (window.__walk ||= {})['${key}'] = { hook: a.hasAttribute('data-loop-toggle') ? 'toggle' : a.hasAttribute('data-loop-control') ? 'control' : a.tagName.toLowerCase(), focusVisible: a.matches(':focus-visible'), outline: cs.outlineStyle + ' ' + cs.outlineWidth, label: a.textContent.trim(), inView: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth, eased: s.eased, playing: s.playing, status: s.status }; return true; })()` });

export const states = [
  { name: 'flat', settle: 600, actions: [at(0), rest] },
  { name: 'mid', frame: true, settle: 600, actions: [at(0.45), rest] },
  { name: 'placed', settle: 600, actions: [at(0.9), rest] },
  // The actions schema has no viewport change, so the scene itself is narrowed; the ResizeObserver watches the scene.
  { name: 'resized', settle: 600, actions: [at(0.9), rest, { type: 'waitFor', fn: "(document.querySelector('[data-scene]').style.marginRight = '22%', true)" }, { type: 'wait', ms: 500 }] },
  { name: 'keyboard', settle: 600, actions: [{ type: 'press', key: 'Tab' }, rest, note('first'), { type: 'press', key: 'Enter' }, { type: 'wait', ms: 300 }, note('entered'), { type: 'press', key: 'Tab' }, rest, note('second')] },
  { name: 'rm', reducedMotion: true, settle: 600, actions: [at(0.5), rest] },
  { name: 'rm-full', reducedMotion: true, settle: 600, actions: [{ type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'full') === 'full'" }, rest, at(0.45), rest] },
  { name: 'static', settle: 600, actions: [{ type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" }, rest, at(0), rest] },
  { name: 'mobile-flat', viewport: 'mobile', settle: 600, actions: [at(0), rest] },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: [at(0.9), rest] },
  { name: 'mobile-away', viewport: 'mobile', settle: 600, actions: [at(0.9), rest, { type: 'click', selector: '[data-loop-control]' }, { type: 'wait', ms: 200 }, { type: 'click', selector: '[data-loop-control]' }, { type: 'wait', ms: 200 }, { type: 'waitFor', fn: '(scrollTo(0, document.documentElement.scrollHeight), dispatchEvent(new Event(\'scroll\')), true)' }, { type: 'wait', ms: 500 }] },
];

export function probe() {
  const screen = document.querySelector('[data-screen]');
  const scene = document.querySelector('[data-scene]');
  const art = scene.querySelector('[data-scene-art]');
  const poly = art.querySelector('[data-screen-quad]');
  const app = screen.querySelector('[data-app]');
  const box = scene.getBoundingClientRect();
  const cs = getComputedStyle(screen);
  const ox = box.left + parseFloat(cs.left), oy = box.top + parseFloat(cs.top);
  const W = screen.offsetWidth, H = screen.offsetHeight;
  const m = cs.transform === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(cs.transform);
  const local = (x, y) => { const q = m.transformPoint(new DOMPoint(x, y, 0, 1)); return [q.x / q.w, q.y / q.w]; };
  const project = (x, y) => { const [u, v] = local(x, y); return [ox + u, oy + v]; };
  const corners = [[0, 0], [W, 0], [W, H], [0, H]].map(([x, y]) => project(x, y));
  const flat = [[ox, oy], [ox + W, oy], [ox + W, oy + H], [ox, oy + H]];
  const pts = [];
  for (let i = 0; i < poly.points.numberOfItems; i++) pts.push([poly.points.getItem(i).x, poly.points.getItem(i).y]);
  const ctm = art.getScreenCTM();
  const target = pts.map(([x, y]) => { const q = new DOMPoint(x, y).matrixTransform(ctm); return [q.x, q.y]; });
  // The same points by arithmetic: the drawing's CSS box, its viewBox and the xMidYMid slice rule, no CTM involved.
  const ar = art.getBoundingClientRect(), vb = art.viewBox.baseVal;
  const k = Math.max(ar.width / vb.width, ar.height / vb.height);
  const tx = ar.left + (ar.width - vb.width * k) / 2 - vb.x * k, ty = ar.top + (ar.height - vb.height * k) / 2 - vb.y * k;
  const arith = pts.map(([x, y]) => [tx + x * k, ty + y * k]);
  const b = screen.getBoundingClientRect();
  const c = corners.reduce((s, p) => [s[0] + p[0] / 4, s[1] + p[1] / 4], [0, 0]);
  const toward = (p, d) => { const dx = c[0] - p[0], dy = c[1] - p[1], l = Math.hypot(dx, dy); return [p[0] + (dx / l) * d, p[1] + (dy / l) * d]; };
  const hits = ([x, y]) => { const el = document.elementFromPoint(x, y); return !!el && screen.contains(el); };
  // The in-screen button as it is drawn: its layout box projected through the same matrix, shortest edges reported.
  const btn = screen.querySelector('[data-loop-toggle]');
  const bx = btn.offsetLeft + app.offsetLeft, by = btn.offsetTop + app.offsetTop, bw = btn.offsetWidth, bh = btn.offsetHeight;
  const [p0, p1, p2, p3] = [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]].map(([x, y]) => local(x, y));
  const len = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const bb = btn.getBoundingClientRect();
  const ctl = document.querySelector('[data-loop-control]');
  const cr = ctl.getBoundingClientRect();
  const glare = screen.querySelector('[data-glare]'), lift = screen.querySelector('[data-lift]');
  return {
    transform: cs.transform,
    origin: cs.transformOrigin,
    corners, flat, target, arith,
    scene: [box.left, box.top, box.right, box.bottom],
    bbox: [b.left, b.top, b.right, b.bottom],
    inside: corners.map((p) => hits(toward(p, 6))),
    outside: corners.map((p) => hits(toward(p, -6))),
    buttonHit: document.elementFromPoint(bb.left + bb.width / 2, bb.top + bb.height / 2) === btn,
    button: { label: btn.textContent.trim(), hidden: btn.hidden, w: +Math.min(len(p0, p1), len(p3, p2)).toFixed(1), h: +Math.min(len(p0, p3), len(p1, p2)).toFixed(1) },
    control: { label: ctl.textContent.trim(), hidden: ctl.hidden, w: cr.width, h: cr.height, controls: ctl.getAttribute('aria-controls'), controlsApp: document.getElementById(ctl.getAttribute('aria-controls')) === app },
    userSelect: getComputedStyle(screen.querySelector('[data-app-name]')).userSelect,
    playState: getComputedStyle(screen.querySelector('.app__playhead')).animationPlayState,
    glare: { opacity: Number(getComputedStyle(glare).opacity), inScreen: screen.contains(glare) },
    lift: Number(getComputedStyle(lift).opacity),
    radius: getComputedStyle(app).borderTopLeftRadius,
    status: document.querySelector('[data-loop-status]').textContent,
    walk: window.__walk ?? null,
    stageHeight: document.querySelector('[data-stage]').offsetHeight,
    vh: innerHeight,
    vw: document.documentElement.clientWidth,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side, placed: the screen as assistive technology reads it, and a real double-click selecting a word through
// the matrix (the selection is cleared again before the screenshot).
export async function inspect(page, st) {
  if (st.name !== 'placed') return null;
  const aria = await page.locator('[data-screen]').ariaSnapshot();
  const [x, y] = await page.evaluate(() => { const b = document.querySelector('[data-app-name]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
  await page.mouse.dblclick(x, y);
  const selected = await page.evaluate(() => { const s = getSelection().toString().trim(); getSelection().removeAllRanges(); return s; });
  return { aria, selected };
}

export function assert(r) {
  const S = (n) => r[n]?.state || {};
  const P = (n) => r[n]?.probe || {};
  const out = [];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const worst = (a = [], b = []) => (a?.length === 4 && b?.length === 4 ? Math.max(...a.map((p, i) => dist(p, b[i]))) : Infinity);
  const bboxOf = (q = []) => [Math.min(...q.map((p) => p[0])), Math.min(...q.map((p) => p[1])), Math.max(...q.map((p) => p[0])), Math.max(...q.map((p) => p[1]))];
  const bboxErr = (p) => Math.max(...bboxOf(p.target).map((v, i) => Math.abs(v - (p.bbox?.[i] ?? Infinity))));
  const inScene = (p) => (p.target || []).length === 4 && p.target.every(([x, y]) => x >= p.scene[0] && x <= p.scene[2] && y >= p.scene[1] && y <= p.scene[3]);
  const px = (v) => (Number.isFinite(v) ? v.toFixed(2) : String(v));

  const f = P('flat');
  out.push({ ok: S('flat').eased === 0 && f.transform === 'none' && worst(f.corners, f.flat) <= 0.5 && Math.max(...bboxOf(f.flat).map((v, i) => Math.abs(v - (f.bbox?.[i] ?? Infinity)))) <= 1, message: `flat: no transform at the start, the screen is its own layout box (corner error ${px(worst(f.corners, f.flat))} px)` });
  out.push({ ok: f.inside?.every(Boolean) && f.outside?.every((v) => !v), message: `flat: hit tests 6 px inside each corner land on the screen, 6 px outside do not (${f.inside}, ${f.outside})` });
  out.push({ ok: f.lift === 1 && f.glare?.opacity === 0 && f.radius === '12px', message: `flat: the screen floats (shadow ${f.lift}, glare ${f.glare?.opacity}, radius ${f.radius})` });

  const pl = P('placed');
  out.push({ ok: S('placed').eased === 1 && worst(pl.corners, pl.target) <= 1, message: `placed: the four projected corners sit on the drawn screen's corners (worst ${px(worst(pl.corners, pl.target))} px)` });
  for (const n of ['placed', 'resized', 'mobile', 'rm']) {
    const p = P(n);
    out.push({ ok: worst(p.target, p.arith) <= 1 && inScene(p), message: `${n}: the target read through getScreenCTM agrees with the viewBox and slice arithmetic (worst ${px(worst(p.target, p.arith))} px) and lies inside the scene` });
  }
  out.push({ ok: bboxErr(pl) <= 1 && pl.origin === '0px 0px' && /^matrix3d\(/.test(pl.transform), message: `placed: the browser's own box of the warped element matches the quad's (worst edge ${px(bboxErr(pl))} px), one matrix3d from 0 0` });
  out.push({ ok: pl.inside?.every(Boolean) && pl.outside?.every((v) => !v), message: `placed: hit tests follow the quad, not the layout box (inside ${pl.inside}, outside ${pl.outside})` });
  out.push({ ok: pl.glare?.opacity === 1 && pl.glare?.inScreen && pl.lift === 0 && pl.radius === '0px', message: `placed: the glare is fully on and carried inside the screen, the shadow off, square corners (glare ${pl.glare?.opacity}, shadow ${pl.lift}, radius ${pl.radius})` });
  // The drawing earns the projective solve: the far edge of the screen is clearly shorter than the near one.
  const T = pl.target || [], ratio = T.length === 4 ? dist(T[1], T[2]) / dist(T[0], T[3]) : 1;
  out.push({ ok: ratio <= 0.75, message: `placed: the drawn screen is in strong perspective, far edge ${px(ratio)} of the near edge (no scale or skew could fit it)` });

  const md = P('mid'), e = S('mid').eased;
  const lerped = (md.flat || []).map((p, i) => [p[0] + (md.target[i][0] - p[0]) * e, p[1] + (md.target[i][1] - p[1]) * e]);
  const between = (md.corners || []).every((p, i) => dist(p, md.flat[i]) > 4 && dist(p, md.target[i]) > 4);
  out.push({ ok: e > 0.3 && e < 0.7 && worst(md.corners, lerped) <= 1 && between, message: `mid-scroll: every corner lies on its own line from flat to placed at ${e} (worst ${px(worst(md.corners, lerped))} px), clear of both ends` });
  out.push({ ok: md.inside?.every(Boolean) && md.outside?.every((v) => !v), message: 'mid-scroll: the in-between quad hit-tests as drawn' });
  out.push({ ok: md.glare?.inScreen && Math.abs((md.glare?.opacity ?? -1) - e) < 0.01 && Math.abs((md.lift ?? -1) - (1 - e)) < 0.01, message: `mid-scroll: glare ${md.glare?.opacity} and shadow ${md.lift} follow e = ${e} on layers inside the screen, so neither can hang off it` });

  const rs = P('resized');
  const moved = worst(rs.target, pl.target);
  out.push({ ok: S('resized').measures > S('placed').measures && moved > 20 && worst(rs.corners, rs.target) <= 1, message: `resize: a narrower scene re-measures (${S('placed').measures} → ${S('resized').measures} measures), the target moves ${px(moved)} px and the screen follows it (worst ${px(worst(rs.corners, rs.target))} px)` });

  const ins = r.placed?.inspect || {};
  out.push({ ok: ins.selected === 'Loomtone' && pl.userSelect !== 'none', message: `placed: a double-click through the warp selects the app's name ("${ins.selected}")` });
  out.push({ ok: pl.buttonHit && /group "Loomtone, a demo sequencer on the laptop"/.test(ins.aria || '') && /button "Pause the loop"/.test(ins.aria || ''), message: 'placed: the in-screen button is hit where it is drawn and keeps its name inside the named group' });

  const w = P('keyboard').walk || {}, k1 = w.first || {}, k2 = w.entered || {}, k3 = w.second || {};
  out.push({ ok: k1.hook === 'toggle' && k1.focusVisible && !/^none/.test(k1.outline || 'none') && k1.inView, message: `keyboard: the first Tab from the top lands on the in-screen button, in view, ring ${k1.outline}` });
  out.push({ ok: k2.playing === false && k2.label === 'Play the loop' && k2.status === 'Loop paused' && P('keyboard').control?.label === 'Play the loop' && P('keyboard').playState === 'paused', message: `keyboard: Enter pauses the loop; both buttons now say "${k2.label}", the status says "${k2.status}"` });
  out.push({ ok: k3.hook === 'control' && k3.focusVisible && !/^none/.test(k3.outline || 'none') && k3.inView, message: `keyboard: the next Tab reaches the page's own control, in view, ring ${k3.outline}` });

  out.push({ ok: S('placed').playing === true && pl.playState === 'running' && pl.status === '', message: `full tier: the loop plays while the screen is in view (${pl.playState}), with nothing announced on load` });
  const ma = P('mobile-away');
  out.push({ ok: S('mobile-away').playing === true && S('mobile-away').status === 'Loop playing' && S('mobile-away').offscreen === true && ma.playState === 'paused', message: `off screen: a tap pauses and a tap plays (status "${S('mobile-away').status}"), then with the screen scrolled away (the caption still in view on a phone) the loop holds (offscreen ${S('mobile-away').offscreen}, ${ma.playState})` });

  for (const n of ['rm', 'static']) {
    const p = P(n);
    out.push({ ok: S(n).motion === (n === 'rm' ? 'reduced' : 'static') && S(n).eased === 1 && S(n).rail === false && worst(p.corners, p.target) <= 1 && p.stageHeight === p.vh, message: `${n}: placed from the start with no scrub and no rail (corner error ${px(worst(p.corners, p.target))} px, stage ${p.stageHeight} px of ${p.vh})` });
    out.push({ ok: S(n).playing === false && p.button?.label === 'Play the loop' && p.control?.label === 'Play the loop' && p.playState === 'paused' && p.status === '', message: `${n}: the loop waits for a button ("${p.control?.label}", ${p.playState})` });
  }
  const rf = P('rm-full'), ef = S('rm-full').eased;
  out.push({ ok: S('rm-full').motion === 'full' && S('rm-full').rail === true && rf.stageHeight > 2 * rf.vh && ef > 0.3 && ef < 0.7 && worst(rf.corners, (rf.flat || []).map((p, i) => [p[0] + (rf.target[i][0] - p[0]) * ef, p[1] + (rf.target[i][1] - p[1]) * ef])) <= 1, message: `forced full over an OS reduce: the script gives the stage its rail (${rf.stageHeight} px) and the scrub runs (e ${ef})` });

  // Targets: the page's own control is the one every visitor can rely on; the in-screen one is part of the picture.
  for (const n of ['flat', 'placed', 'rm', 'static', 'mobile-flat', 'mobile']) {
    const c = P(n).control || {};
    out.push({ ok: !c.hidden && c.w >= 44 && c.h >= 44 && c.controlsApp, message: `${n}: the page's loop control is ${Math.round(c.w)} × ${Math.round(c.h)} px and controls #${c.controls}` });
  }
  out.push({ ok: (f.button?.h ?? 0) >= 44, message: `flat on desktop: the in-screen button is drawn ${f.button?.h} px tall` });
  out.push({ ok: (P('mobile-flat').button?.h ?? 0) >= 30 && (P('mobile').button?.h ?? 0) >= 24, message: `phone: the in-screen button is drawn ${P('mobile-flat').button?.h} px tall flat and ${P('mobile').button?.h} px placed (the README's minimums, 30 and 24)` });

  const mf = P('mobile-flat'), mo = P('mobile');
  out.push({ ok: worst(mf.corners, mf.flat) <= 0.5 && mf.flat?.every(([x]) => x >= 0 && x <= mf.vw), message: `phone: flat at the start and inside the width (x ${Math.round(mf.flat?.[0]?.[0] ?? -1)}–${Math.round(mf.flat?.[1]?.[0] ?? -1)} of ${mf.vw})` });
  const near = mo.target?.length === 4 ? dist(mo.target[0], mo.target[1]) : 0;
  out.push({ ok: S('mobile').eased === 1 && worst(mo.corners, mo.target) <= 1 && mo.inside?.every(Boolean) && near >= 0.75 * mo.vw, message: `phone: placed on the cropped drawing's screen (worst ${px(worst(mo.corners, mo.target))} px), its top edge ${Math.round(near)} px of ${mo.vw}` });
  for (const n of ['mobile', 'mobile-flat', 'mobile-away', 'placed']) out.push({ ok: (P(n).overflowX ?? 1) <= 0, message: `${n}: no sideways overflow (${P(n).overflowX} px)` });
  return out;
}
