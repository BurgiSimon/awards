// The warp is judged where it lands: the element's four corners are projected through its computed matrix3d (with
// the perspective divide) and compared with the drawn screen quad read through the SVG's own getScreenCTM, within a
// pixel; the browser's own bounding box of the warped element must match the quad's; hit tests just inside and just
// outside each corner confirm the box the browser hit-tests is that quad. Flat is the untransformed layout box; a
// mid-scroll frame lies on the corner lerp between the two; a resize re-measures; the app stays selectable (a real
// double-click), its button focusable and named; reduced motion and static sit placed with no rail; phones too.
const at = (p) => ({ type: 'waitFor', fn: `(() => { const [a, b] = window.__awards.state().range; scrollTo(0, Math.round(a + (b - a) * ${p})); dispatchEvent(new Event('scroll')); return true; })()` });
const rest = { type: 'wait', ms: 400 };

export const states = [
  { name: 'flat', settle: 600, actions: [at(0), rest] },
  { name: 'mid', frame: true, settle: 600, actions: [at(0.45), rest] },
  { name: 'placed', settle: 600, actions: [at(0.9), rest] },
  { name: 'resized', settle: 600, actions: [at(0.9), rest, { type: 'waitFor', fn: "(document.querySelector('[data-scene]').style.right = '22%', true)" }, { type: 'wait', ms: 500 }] },
  { name: 'focus', settle: 600, actions: [at(0.9), rest, { type: 'focus', selector: '[data-loop-toggle]' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 300 }] },
  { name: 'rm', reducedMotion: true, settle: 600, actions: [at(0.5), rest] },
  { name: 'static', settle: 600, actions: [{ type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" }, rest, at(0), rest] },
  { name: 'mobile-flat', viewport: 'mobile', settle: 600, actions: [at(0), rest] },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: [at(0.9), rest] },
];

export function probe() {
  const screen = document.querySelector('[data-screen]');
  const scene = document.querySelector('[data-scene]');
  const art = scene.querySelector('[data-scene-art]');
  const poly = art.querySelector('[data-screen-quad]');
  const box = scene.getBoundingClientRect();
  const cs = getComputedStyle(screen);
  const ox = box.left + parseFloat(cs.left), oy = box.top + parseFloat(cs.top);
  const W = screen.offsetWidth, H = screen.offsetHeight;
  const m = cs.transform === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(cs.transform);
  const project = (x, y) => { const q = m.transformPoint(new DOMPoint(x, y, 0, 1)); return [ox + q.x / q.w, oy + q.y / q.w]; };
  const corners = [[0, 0], [W, 0], [W, H], [0, H]].map(([x, y]) => project(x, y));
  const flat = [[ox, oy], [ox + W, oy], [ox + W, oy + H], [ox, oy + H]];
  const ctm = art.getScreenCTM();
  const target = [];
  for (let i = 0; i < poly.points.numberOfItems; i++) {
    const q = new DOMPoint(poly.points.getItem(i).x, poly.points.getItem(i).y).matrixTransform(ctm);
    target.push([q.x, q.y]);
  }
  const b = screen.getBoundingClientRect();
  const c = corners.reduce((s, p) => [s[0] + p[0] / 4, s[1] + p[1] / 4], [0, 0]);
  const toward = (p, d) => { const dx = c[0] - p[0], dy = c[1] - p[1], l = Math.hypot(dx, dy); return [p[0] + (dx / l) * d, p[1] + (dy / l) * d]; };
  const hits = ([x, y]) => { const el = document.elementFromPoint(x, y); return !!el && screen.contains(el); };
  const btn = screen.querySelector('[data-loop-toggle]');
  const bb = btn.getBoundingClientRect();
  return {
    transform: cs.transform,
    origin: cs.transformOrigin,
    corners, flat, target,
    bbox: [b.left, b.top, b.right, b.bottom],
    inside: corners.map((p) => hits(toward(p, 6))),
    outside: corners.map((p) => hits(toward(p, -6))),
    buttonHit: document.elementFromPoint(bb.left + bb.width / 2, bb.top + bb.height / 2) === btn,
    buttonName: btn.textContent.trim(),
    userSelect: getComputedStyle(screen.querySelector('[data-app-name]')).userSelect,
    active: document.activeElement === btn ? 'toggle' : document.activeElement?.tagName.toLowerCase() ?? null,
    playState: getComputedStyle(screen.querySelector('.app__playhead')).animationPlayState,
    glass: Number(getComputedStyle(scene.querySelector('[data-glass]')).opacity),
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
  const worst = (a = [], b = []) => (a.length === 4 && b.length === 4 ? Math.max(...a.map((p, i) => dist(p, b[i]))) : Infinity);
  const bboxOf = (q = []) => [Math.min(...q.map((p) => p[0])), Math.min(...q.map((p) => p[1])), Math.max(...q.map((p) => p[0])), Math.max(...q.map((p) => p[1]))];
  const bboxErr = (p) => Math.max(...bboxOf(p.target).map((v, i) => Math.abs(v - (p.bbox?.[i] ?? Infinity))));
  const px = (v) => (Number.isFinite(v) ? v.toFixed(2) : String(v));

  const f = P('flat');
  out.push({ ok: S('flat').eased === 0 && f.transform === 'none' && worst(f.corners, f.flat) <= 0.5 && Math.max(...bboxOf(f.flat).map((v, i) => Math.abs(v - (f.bbox?.[i] ?? Infinity)))) <= 1, message: `flat: no transform at the start, the screen is its own layout box (corner error ${px(worst(f.corners, f.flat))} px)` });
  out.push({ ok: f.inside?.every(Boolean) && f.outside?.every((v) => !v), message: `flat: hit tests 6 px inside each corner land on the screen, 6 px outside do not (${f.inside}, ${f.outside})` });

  const pl = P('placed');
  out.push({ ok: S('placed').eased === 1 && worst(pl.corners, pl.target) <= 1, message: `placed: the four projected corners sit on the drawn screen's corners (worst ${px(worst(pl.corners, pl.target))} px)` });
  out.push({ ok: bboxErr(pl) <= 1 && pl.origin === '0px 0px' && /^matrix3d\(/.test(pl.transform), message: `placed: the browser's own box of the warped element matches the quad's (worst edge ${px(bboxErr(pl))} px), one matrix3d from 0 0` });
  out.push({ ok: pl.inside?.every(Boolean) && pl.outside?.every((v) => !v), message: `placed: hit tests follow the quad, not the layout box (inside ${pl.inside}, outside ${pl.outside})` });
  out.push({ ok: pl.glass === 1, message: `placed: the glass over the screen is fully on (${pl.glass})` });

  const md = P('mid'), e = S('mid').eased;
  const lerped = (md.flat || []).map((p, i) => [p[0] + (md.target[i][0] - p[0]) * e, p[1] + (md.target[i][1] - p[1]) * e]);
  const between = (md.corners || []).every((p, i) => dist(p, md.flat[i]) > 4 && dist(p, md.target[i]) > 4);
  out.push({ ok: e > 0.3 && e < 0.7 && worst(md.corners, lerped) <= 1 && between, message: `mid-scroll: every corner lies on its own line from flat to placed at ${e} (worst ${px(worst(md.corners, lerped))} px), clear of both ends` });
  out.push({ ok: md.inside?.every(Boolean) && md.outside?.every((v) => !v), message: 'mid-scroll: the in-between quad hit-tests as drawn' });

  const rs = P('resized');
  const moved = worst(rs.target, pl.target);
  out.push({ ok: S('resized').measures >= 2 && moved > 20 && worst(rs.corners, rs.target) <= 1, message: `resize: a narrower scene re-measures the target (moved ${px(moved)} px) and the screen follows it (worst ${px(worst(rs.corners, rs.target))} px)` });

  const ins = r.placed?.inspect || {};
  out.push({ ok: ins.selected === 'Loomtone' && pl.userSelect !== 'none', message: `placed: a double-click through the warp selects the app's name ("${ins.selected}")` });
  out.push({ ok: pl.buttonHit && /group "Loomtone, a demo sequencer on the laptop"/.test(ins.aria || '') && /button "Pause the loop"/.test(ins.aria || ''), message: 'placed: the button is hit where it is drawn and keeps its name inside the named group' });
  const fo = P('focus');
  out.push({ ok: fo.active === 'toggle' && fo.buttonName === 'Play the loop' && S('focus').playing === false && fo.playState === 'paused', message: `keyboard: the warped button takes focus and Enter pauses the recording ("${fo.buttonName}", ${fo.playState})` });
  out.push({ ok: S('placed').playing === true && pl.playState === 'running', message: `full tier: the recording plays while the stage is on screen (${pl.playState})` });

  for (const n of ['rm', 'static']) {
    const p = P(n);
    out.push({ ok: S(n).motion === (n === 'rm' ? 'reduced' : 'static') && S(n).eased === 1 && worst(p.corners, p.target) <= 1 && p.stageHeight === p.vh, message: `${n}: placed from the start with no scrub and no rail (corner error ${px(worst(p.corners, p.target))} px, stage ${p.stageHeight} px of ${p.vh})` });
    out.push({ ok: S(n).playing === false && p.buttonName === 'Play the loop' && p.playState === 'paused', message: `${n}: the recording waits for the button ("${p.buttonName}")` });
  }

  const mf = P('mobile-flat'), mo = P('mobile');
  out.push({ ok: worst(mf.corners, mf.flat) <= 0.5 && mf.flat?.every(([x]) => x >= 0 && x <= mf.vw), message: `phone: flat at the start and inside the width (x ${Math.round(mf.flat?.[0]?.[0] ?? -1)}–${Math.round(mf.flat?.[1]?.[0] ?? -1)} of ${mf.vw})` });
  out.push({ ok: S('mobile').eased === 1 && worst(mo.corners, mo.target) <= 1 && mo.inside?.every(Boolean), message: `phone: placed on the cropped drawing's screen (worst ${px(worst(mo.corners, mo.target))} px)` });
  for (const n of ['mobile', 'mobile-flat', 'placed']) out.push({ ok: (P(n).overflowX ?? 1) <= 0, message: `${n}: no sideways overflow (${P(n).overflowX} px)` });
  return out;
}
