// The splay: at progress 0 every character carries no transform and sits exactly where it was set. Part-way, each
// character's distance and side are recomputed here from the layout itself (every transform switched off for one
// synchronous read) and must match what the script used; depth follows w = d^1.6 of that distance to the pixel, depth
// and turn never fall as distance grows, the character nearest the centre moves least, and the two sides balance.
// Scrolling back lands every letter on its set position, by scroll or by keyboard (PageDown, the "Back to the top"
// link); opening again repeats the same values; a narrower heading re-splits without leaking triggers; a right-to-left
// page keeps the heading's letter order; the heading keeps one accessible name. The closing heading waits open, shuts
// on entry and never replays. Reduced motion dims the headline without any 3D, static does nothing, and neither holds
// the scroll, smooths the wheel or leaves a perspective behind.
const heroAt = (p) => ({ type: 'waitFor', fn: `(() => { const h = document.querySelector('[data-splay-hero]'); const max = document.documentElement.scrollHeight - innerHeight; window.__awards.scrollTo((h.offsetTop + (h.offsetHeight - innerHeight) * ${p}) / max); return true; })()` });
// Scroll so the point `frac` of the way down the closing heading sits `at` of the way down the viewport.
const closeAt = (frac, at) => ({ type: 'waitFor', fn: `(() => { const c = document.querySelector('#close-t'); const r = c.getBoundingClientRect(); const max = document.documentElement.scrollHeight - innerHeight; window.__awards.scrollTo((scrollY + r.top + r.height * ${frac} - innerHeight * ${at}) / max); return true; })()` });
const toEnd = { type: 'waitFor', fn: '(window.__awards.scrollTo(1), true)' };
const wait = (ms) => ({ type: 'wait', ms });
// Reduced and static: the hero is one screen tall and not held, so scroll it half-way off.
const heroHalfGone = { type: 'waitFor', fn: "(() => { const h = document.querySelector('[data-splay-hero]'); const max = document.documentElement.scrollHeight - innerHeight; window.__awards.scrollTo((h.offsetTop + h.offsetHeight * 0.5) / max); return true; })()" };
const rtl = { type: 'waitFor', fn: "(() => { document.documentElement.dir = 'rtl'; dispatchEvent(new Event('resize')); return true; })()" };

export const states = [
  { name: 'top', scroll: 0, settle: 700 },
  { name: 'early', settle: 700, actions: [heroAt(0.22), wait(700)] },
  { name: 'open', frame: true, settle: 700, actions: [heroAt(0.5), wait(700)] },
  { name: 'back', settle: 700, actions: [heroAt(0.85), wait(500), heroAt(0), wait(700)] },
  { name: 'reopen', settle: 700, actions: [heroAt(0.85), wait(400), heroAt(0), wait(500), heroAt(0.5), wait(700)] },
  { name: 'resplit', settle: 700, actions: [{ type: 'waitFor', fn: "(() => { document.querySelector('#hero-t').style.maxWidth = '6ch'; return true; })()" }, wait(900), heroAt(0.5), wait(700)] },
  { name: 'keys', settle: 700, actions: [{ type: 'press', key: 'PageDown' }, wait(1000)] },
  { name: 'toplink', settle: 700, actions: [{ type: 'focus', selector: '.close__link' }, wait(1800), { type: 'press', key: 'Enter' }, wait(1000)] },
  { name: 'before', settle: 700, actions: [closeAt(0.2, 1), wait(700)] },
  { name: 'end', scroll: 1, settle: 2200 },
  { name: 'once', settle: 700, actions: [toEnd, wait(1800), heroAt(0.3), wait(500), closeAt(0.5, 0.6), wait(300)] },
  { name: 'rm', reducedMotion: true, settle: 700, actions: [heroHalfGone, wait(600)] },
  { name: 'rm-end', reducedMotion: true, scroll: 1, settle: 1000 },
  { name: 'static', settle: 700, actions: [heroAt(0.5), wait(500), { type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" }, wait(300), heroHalfGone, wait(600)] },
  { name: 'mobile', viewport: 'mobile', settle: 700, actions: [heroAt(0.5), wait(700)] },
  { name: 'rtl', viewport: 'mobile', settle: 700, actions: [rtl, wait(900), heroAt(0.5), wait(700)] },
];

export function probe() {
  const h1 = document.querySelector('#hero-t');
  const h2 = document.querySelector('#close-t');
  const lede = document.querySelector('.hero__lede');
  const box = h1.getBoundingClientRect();
  const chars = [...h1.querySelectorAll('.splay-char')];
  const closeChars = [...h2.querySelectorAll('.splay-char')];
  const mat = (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform);
  const ident = (m) => [m.m11 - 1, m.m12, m.m13, m.m14, m.m21, m.m22 - 1, m.m23, m.m24, m.m31, m.m32, m.m33 - 1, m.m34, m.m41, m.m42, m.m43, m.m44 - 1].every((v) => Math.abs(v) < 1e-6);
  const ms = chars.map(mat);
  const cms = closeChars.map(mat);
  const line = h1.querySelector('.splay-line');
  const lr = lede.getBoundingClientRect();
  const overLede = chars.filter((c) => { const b = c.getBoundingClientRect(); return b.bottom > lr.top && b.top < lr.bottom && b.right > lr.left && b.left < lr.right; }).length;
  const pos = chars.map((c) => { const r = c.getBoundingClientRect(); return [Number((r.left - box.left).toFixed(2)), Number((r.top - box.top).toFixed(2))]; });
  // The layout as set, independent of anything the script recorded: every character's transform switched off for one
  // synchronous read (no frame is painted in between), then restored.
  const off = document.createElement('style');
  off.textContent = '.splay-char { transform: none !important; }';
  document.head.append(off);
  const geo = (el, list) => {
    const b = el.getBoundingClientRect();
    const spans = [...el.querySelectorAll('.splay-line')].map((ln) => [...ln.querySelectorAll('.splay-char')].map((c) => c.getBoundingClientRect())).filter((rs) => rs.length).map((rs) => [Math.min(...rs.map((r) => r.left)), Math.max(...rs.map((r) => r.right))]);
    const words = [...el.querySelectorAll('.splay-word')];
    const lines = [...el.querySelectorAll('.splay-line')];
    return {
      centre: b.left + b.width / 2,
      half: Math.max(1, ...spans.map(([l, r]) => (r - l) / 2)),
      cx: list.map((c) => { const r = c.getBoundingClientRect(); return r.left + r.width / 2; }),
      word: list.map((c) => words.indexOf(c.closest('.splay-word'))),
      line: list.map((c) => lines.indexOf(c.closest('.splay-line'))),
    };
  };
  const g = geo(h1, chars), cg = geo(h2, closeChars);
  off.remove();
  const ribs = [...document.querySelectorAll('.fan__rib')];
  const ribAngle = (r) => { const t = r.transform.baseVal.consolidate(); return t ? Math.atan2(t.matrix.b, t.matrix.a) * 180 / Math.PI : 0; };
  const shown = (el) => getComputedStyle(el).display !== 'none';
  const op = (el) => Number(getComputedStyle(el).opacity);
  return {
    chars: chars.length,
    identity: ms.filter(ident).length,
    inline: chars.filter((c) => c.style.transform).length,
    z: ms.map((m) => Number(m.m43.toFixed(2))),
    pos,
    geo: g,
    // Any element of the hero carrying a 3D transform (reduced and static must have none).
    threeD: [...document.querySelectorAll('[data-splay-hero], [data-splay-hero] *')].filter((el) => !(el instanceof SVGElement) && !mat(el).is2D).length,
    heroHeight: Math.round(document.querySelector('[data-splay-hero]').getBoundingClientRect().height),
    stagePosition: getComputedStyle(document.querySelector('[data-splay-stage]')).position,
    splayOn: document.documentElement.classList.contains('splay-on'),
    headingStyles: [h1, h2].map((h) => (h.getAttribute('style') ?? '').replace(/max-width:[^;]*;?/, '').trim()).join(''),
    text: h1.textContent.replace(/\s+/g, ' ').trim(),
    parts: h1.querySelectorAll('.splay-line, .splay-word, .splay-char').length,
    hiddenParts: h1.querySelectorAll('.splay-line[aria-hidden="true"], .splay-word[aria-hidden="true"], .splay-char[aria-hidden="true"]').length,
    linePerspective: line ? getComputedStyle(line).perspective : null,
    titleOpacity: op(h1),
    titleBottom: Math.round(box.bottom),
    labelOpacity: op(document.querySelector('.hero__label')),
    ledeOpacity: op(lede),
    ledeShown: shown(lede.querySelector('.lede-still')) ? 'still' : shown(lede.querySelector('.lede-moving')) ? 'moving' : 'none',
    overLede,
    ribsOpacity: op(document.querySelector('.fan__ribs')),
    ribTurn: Number(Math.max(...ribs.map((r) => Math.abs(ribAngle(r)))).toFixed(2)),
    ribsOrdered: ribs.every((r, i) => i === 0 || ribAngle(r) >= ribAngle(ribs[i - 1]) - 1e-6),
    pin: (() => { const b = document.querySelector('.fan__pin').getBoundingClientRect(); return b.width > 4 && getComputedStyle(document.querySelector('.fan__pin')).visibility === 'visible'; })(),
    closeChars: closeChars.length,
    closeIdentity: cms.filter(ident).length,
    closeInline: closeChars.filter((c) => c.style.transform).length,
    closeZ: cms.map((m) => Number(m.m43.toFixed(2))),
    closeGeo: cg,
    closeOpacity: op(h2),
    scrollY: Math.round(scrollY),
    hash: location.hash,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side: the accessibility tree of <main>, to count how the heading is named.
export async function inspect(page, st) {
  if (!['top', 'open', 'resplit', 'rm', 'mobile', 'rtl'].includes(st.name)) return null;
  return { snap: await page.locator('main').ariaSnapshot() };
}

const SENTENCE = 'Every fan opens from its centre.';
// The numbers the README's Parameters table states; the checks recompute the offsets from them and the layout.
const SHAPE = 1.6;
const DEPTH = { desktop: 0.7, mobile: 0.5 };
const PERSPECTIVE = 2.6;
const RIBS = { open: 64, opacity: 0.7 };
const LEDE = { from: 0.08, to: 0.36 };

export function assert(r) {
  const s = (n) => r[n]?.state ?? {};
  const p = (n) => r[n]?.probe ?? {};
  const out = [];
  const near = (a, b, tol) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol;

  // Distance and side from the layout (not from the script), then what the script did with them.
  const layout = (g) => {
    const cx = g?.cx ?? [];
    return { d: cx.map((x) => Math.min(1, Math.abs(x - g.centre) / g.half)), side: cx.map((x) => Math.sign(x - g.centre)) };
  };
  const fan = (n, depth, progress = s(n).progress) => {
    const S = s(n).samples ?? [], P = p(n), g = P.geo, zs = P.z ?? [];
    const { d, side } = layout(g);
    const same = S.length > 0 && S.length === d.length && zs.length === d.length;
    const dErr = same ? Math.max(...S.map((c, i) => Math.abs(c.d - d[i]))) : Infinity;
    const sides = same && S.every((c, i) => c.s === side[i]);
    const left = side.filter((v) => v < 0).length, right = side.filter((v) => v > 0).length;
    // Every set line is centred, so each line (of two or more letters) has letters on both sides, and about as many.
    const rows = [...new Set(g?.line ?? [])].map((ln) => side.filter((_, i) => g.line[i] === ln));
    const balanced = rows.every((row) => row.length < 2 || (row.some((v) => v < 0) && row.some((v) => v > 0) && Math.abs(row.filter((v) => v < 0).length - row.filter((v) => v > 0).length) <= 2));
    const order = d.map((_, i) => i).sort((a, b) => d[a] - d[b]);
    const mono = (val) => order.every((k, j) => j === 0 || Math.abs(val(k)) >= Math.abs(val(order[j - 1])) - 0.05);
    const zErr = same ? Math.max(...zs.map((z, i) => Math.abs(z - progress * depth * g.half * d[i] ** SHAPE))) : Infinity;
    const pivotLeast = same && zs.every((z) => Math.abs(z) >= Math.abs(zs[order[0]]) - 0.01);
    const signs = same && S.every((c, i) => d[i] <= 0.05 || (Math.sign(c.x) === side[i] && Math.sign(c.ry) === side[i] && (c.v === 0 ? c.rx === 0 : Math.sign(c.rx) === -Math.sign(c.v))));
    const mean = (k, sel) => { const ix = d.map((_, i) => i).filter(sel); return ix.reduce((t, i) => t + Math.abs(k === 'z' ? zs[i] : S[i]?.ry ?? 0), 0) / Math.max(1, ix.length); };
    const centre = d.filter((v) => v < 0.2).length, outer = d.filter((v) => v > 0.6).length;
    const rendered = same && S.every((c, i) => Math.abs(zs[i] - c.z) < 0.5);
    return {
      n: d.length, same, dErr, sides, left, right, balanced, lines: rows.length, zErr, pivotLeast, signs, rendered,
      mono: same && mono((k) => zs[k]) && mono((k) => S[k].ry), centre, outer,
      cz: mean('z', (i) => d[i] < 0.2), oz: mean('z', (i) => d[i] > 0.6), cry: mean('ry', (i) => d[i] < 0.2), ory: mean('ry', (i) => d[i] > 0.6),
    };
  };
  const fanMsg = (n, f) => `${n}: ${f.n} characters; distance and side recomputed from the layout match the script's (max |Δd| ${f.dErr.toFixed(4)}, sides ${f.sides ? 'all equal' : 'differ'}; ${f.left} left / ${f.right} right, both sides of every one of ${f.lines} lines within 2: ${f.balanced}); depth = progress × depth × half × d^1.6 within ${f.zErr.toFixed(2)} px; |z| and |rotateY| never fall with distance; the character nearest the centre moves least (${f.pivotLeast})`;
  const fanOk = (f) => f.same && f.dErr < 0.01 && f.sides && f.balanced && f.zErr < 1 && f.mono && f.pivotLeast && f.centre > 0 && f.outer > 0;
  // The hero section is labelled by its heading, so its region line repeats the name; every other line must not.
  const named = (n) => {
    const lines = (r[n]?.inspect?.snap ?? '').split('\n').filter((l) => !/^\s*- region /.test(l)).join('\n');
    return lines.split(SENTENCE).length - 1 === 1 && lines.includes(`heading "${SENTENCE}" [level=1]`);
  };

  const t = s('top'), tp = p('top'), th = layout(tp.geo);
  out.push({ ok: t.motion === 'full' && t.chars > 20 && t.lines >= 2 && tp.identity === tp.chars && tp.inline === 0 && t.rest === true && t.progress === 0 && tp.splayOn && t.smoothWheel === true, message: `top: ${t.chars} characters on ${t.lines} lines, every transform identity (${tp.identity}/${tp.chars}), none written inline (${tp.inline}), progress ${t.progress}; splay-on set, wheel smoothing ${t.smoothWheel}` });
  out.push({ ok: named('top') && t.label === SENTENCE && tp.text === SENTENCE && tp.hiddenParts === tp.parts && tp.parts > t.chars, message: `top: the h1 is named once by the full sentence (aria-label "${t.label}"), its ${tp.parts} split parts all aria-hidden (${tp.hiddenParts})` });
  const wantPersp = Math.round(PERSPECTIVE * (tp.geo?.half ?? NaN));
  out.push({ ok: tp.linePerspective === t.perspective && near(parseFloat(t.perspective), wantPersp, 1), message: `top: each line's perspective is ${PERSPECTIVE} × half the widest line measured from the layout (${tp.linePerspective}; expected ${wantPersp}px)` });
  out.push({ ok: tp.ledeShown === 'moving' && tp.ledeOpacity === 1 && tp.ribsOpacity === 0 && tp.ribTurn < 0.01 && tp.pin && th.d.length === t.chars, message: `top: the lede promises the motion and is fully shown (${tp.ledeShown}, opacity ${tp.ledeOpacity}); the ribs are folded and hidden (turn ${tp.ribTurn}°, opacity ${tp.ribsOpacity}), the pin is drawn (${tp.pin})` });

  const ea = s('early'), ep0 = p('early');
  const ledeWant = 1 - Math.min(1, Math.max(0, (ea.progress - LEDE.from) / (LEDE.to - LEDE.from)));
  out.push({ ok: ea.progress > 0.15 && ea.progress < 0.3 && near(ep0.ledeOpacity, ledeWant, 0.05) && ep0.overLede === 0, message: `early: at progress ${ea.progress} the lede is fading on schedule (opacity ${ep0.ledeOpacity}, expected ${ledeWant.toFixed(2)} for ${LEDE.from}–${LEDE.to}) and no character has reached it yet (${ep0.overLede} over it)` });

  const o = s('open'), op = p('open'), of = fan('open', DEPTH.desktop);
  out.push({ ok: o.progress > 0.4 && o.progress < 0.6 && o.rest === false && op.identity < 3, message: `open: part-way through the hero (progress ${o.progress}), ${op.chars - op.identity} of ${op.chars} characters transformed` });
  out.push({ ok: fanOk(of), message: fanMsg('open', of) });
  out.push({ ok: of.oz > 5 * of.cz && of.oz > 40 && of.ory > 5 * of.cry, message: `open: outer characters come ${of.oz.toFixed(1)} px forward and turn ${of.ory.toFixed(1)}°, central ones ${of.cz.toFixed(1)} px and ${of.cry.toFixed(1)}°` });
  out.push({ ok: of.signs, message: 'open: each character spreads and turns towards its own side of the layout (x and rotateY signed by the recomputed side), rows tip by their place above or below the middle (rotateX)' });
  out.push({ ok: of.rendered, message: 'open: the rendered matrices carry the depth GSAP wrote (m43 = z within 0.5 px for every character)' });
  out.push({ ok: near(op.ribTurn, o.progress * RIBS.open, 1) && near(op.ribsOpacity, o.progress * RIBS.opacity, 0.03) && op.ribsOrdered && op.ledeOpacity === 0, message: `open: the ribs open on the same clock (outermost ${op.ribTurn}° for ${(o.progress * RIBS.open).toFixed(1)}°, opacity ${op.ribsOpacity}, in order left to right); the lede has gone (${op.ledeOpacity})` });
  out.push({ ok: named('open'), message: 'open: mid-splay, the heading is still named once by the full sentence' });

  const b = s('back'), bp = p('back');
  const laid = (b.samples ?? []).map((c) => c.laid);
  const dev = Math.max(...(bp.pos ?? []).map((q, i) => Math.hypot(q[0] - (laid[i]?.[0] ?? 1e9), q[1] - (laid[i]?.[1] ?? 1e9))));
  out.push({ ok: b.progress === 0 && bp.identity === bp.chars && bp.inline === 0 && dev < 0.5 && bp.ribsOpacity === 0, message: `back: after opening to 0.85 and scrolling back, every transform is identity (${bp.identity}/${bp.chars}), cleared inline, every letter within ${dev.toFixed(3)} px of its set position, ribs hidden (${bp.ribsOpacity})` });

  const ro = s('reopen').samples ?? [], os = o.samples ?? [];
  const reDiff = Math.max(...ro.map((c, i) => Math.max(Math.abs(c.z - (os[i]?.z ?? 1e9)), Math.abs(c.ry - (os[i]?.ry ?? 1e9)))));
  out.push({ ok: ro.length === os.length && reDiff < 0.5, message: `reopen: opening again after a full close repeats the same values (max difference ${reDiff.toFixed(3)})` });

  const rs = s('resplit'), rf = fan('resplit', DEPTH.desktop);
  out.push({ ok: rs.splits > t.splits && rs.lines > t.lines && rs.chars === t.chars && rs.triggers === t.triggers && rs.label === SENTENCE && named('resplit'), message: `resplit: a narrower heading re-splits (${t.splits} → ${rs.splits} splits, ${t.lines} → ${rs.lines} lines, ${rs.chars} characters), triggers unchanged (${t.triggers} → ${rs.triggers}), one accessible name` });
  out.push({ ok: fanOk(rf) && rf.oz > 5 * rf.cz && rf.rendered && near(parseFloat(rs.perspective), Math.round(PERSPECTIVE * p('resplit').geo.half), 1), message: `${fanMsg('resplit', rf)}; perspective re-read (${rs.perspective})` });

  const k = s('keys'), kp = p('keys');
  out.push({ ok: k.progress > 0.3 && k.progress < 1 && k.rest === false && kp.identity < 3, message: `keys: one PageDown scrolls the page through Lenis and opens the line (progress ${k.progress}, ${kp.chars - kp.identity} of ${kp.chars} characters transformed)` });
  const tl = s('toplink'), tlp = p('toplink');
  const tlLaid = (tl.samples ?? []).map((c) => c.laid);
  const tlDev = Math.max(...(tlp.pos ?? []).map((q, i) => Math.hypot(q[0] - (tlLaid[i]?.[0] ?? 1e9), q[1] - (tlLaid[i]?.[1] ?? 1e9))));
  out.push({ ok: tlp.scrollY === 0 && tlp.hash === '#top' && tl.progress === 0 && tl.rest === true && tlp.inline === 0 && tlp.identity === tlp.chars && tlDev < 0.5, message: `toplink: focusing "Back to the top" (the page scrolls to it, the line opens) and pressing Enter returns to the top (scrollY ${tlp.scrollY}, ${tlp.hash}); progress ${tl.progress}, ${tlp.inline} inline, every letter within ${tlDev.toFixed(3)} px of its set position` });

  const bf = s('before'), bfp = p('before');
  const cl = layout(bfp.closeGeo);
  const corder = cl.d.map((_, i) => i).sort((a, b2) => cl.d[a] - cl.d[b2]);
  const cz = bfp.closeZ ?? [];
  const cmono = cz.length === cl.d.length && corder.every((i, j) => j === 0 || Math.abs(cz[i]) >= Math.abs(cz[corder[j - 1]]) - 0.05);
  const czErr = cz.length && cz.length === cl.d.length ? Math.max(...cz.map((z, i) => Math.abs(z - DEPTH.desktop * bfp.closeGeo.half * cl.d[i] ** SHAPE))) : Infinity;
  out.push({ ok: bf.enterDone === false && bfp.closeChars > 10 && bfp.closeInline === bfp.closeChars && cmono && czErr < 1 && Math.max(...cz) > 40, message: `before: with a fifth of the closing heading on screen it waits open (${bfp.closeInline}/${bfp.closeChars} characters transformed, not yet played); its depth is the same rule from its own centre (|z| never falls with distance, within ${czErr.toFixed(2)} px of ${DEPTH.desktop} × half × d^1.6, up to ${Math.max(...cz).toFixed(1)} px)` });

  const e = s('end'), ep = p('end');
  out.push({ ok: e.progress === 1 && e.enterDone === true && ep.closeChars > 10 && ep.closeIdentity === ep.closeChars && ep.closeInline === 0 && ep.ledeOpacity === 0 && near(ep.ribTurn, RIBS.open, 0.5), message: `end: the hero is fully open (progress ${e.progress}, ribs at ${ep.ribTurn}°, lede ${ep.ledeOpacity}); the closing heading has played shut (${ep.closeIdentity}/${ep.closeChars} identity, ${ep.closeInline} inline)` });
  const on = s('once'), onp = p('once');
  out.push({ ok: on.enterDone === true && onp.closeInline === 0 && onp.closeIdentity === onp.closeChars && onp.closeChars > 10, message: `once: after leaving it and coming back past its trigger, the closing heading does not replay (${onp.closeInline} inline, ${onp.closeIdentity}/${onp.closeChars} identity, 300 ms after re-entry)` });

  const rm = s('rm'), rmp = p('rm');
  out.push({ ok: rm.motion === 'reduced' && rmp.chars === 0 && rmp.threeD === 0 && rm.progress > 0.3 && rm.progress < 0.7 && rmp.titleOpacity > 0.2 && rmp.titleOpacity < 0.8 && rmp.labelOpacity === 1 && rmp.ledeOpacity === 1 && named('rm'), message: `reduced motion: no split (${rmp.chars} characters), no 3D transform anywhere in the hero (${rmp.threeD}); only the headline dims as the hero leaves (opacity ${rmp.titleOpacity?.toFixed(2)} at ${rm.progress}), label and lede untouched (${rmp.labelOpacity}, ${rmp.ledeOpacity}); heading named once` });
  // Paper on lacquer is 3:1 at about 0.39 opacity: large text either keeps that or has left the screen.
  out.push({ ok: rmp.titleOpacity >= 0.39 || rmp.titleBottom <= 0, message: `reduced motion: the dimmed headline keeps 3:1 while any of it is on screen (opacity ${rmp.titleOpacity?.toFixed(2)}, bottom at ${rmp.titleBottom} px)` });
  out.push({ ok: rmp.stagePosition === 'relative' && !rmp.splayOn && rmp.heroHeight <= 900 && (tp.heroHeight ?? 0) > 2000 && rm.smoothWheel === false && rmp.ledeShown === 'still' && rmp.ribsOpacity === 0 && rmp.closeOpacity === 0, message: `reduced motion: nothing holds the scroll (hero ${rmp.heroHeight} px, stage ${rmp.stagePosition}; ${tp.heroHeight} px with a sticky stage in the full tier), no wheel smoothing (${rm.smoothWheel}), the lede says the line stays still (${rmp.ledeShown}), no ribs; the closing heading waits hidden (${rmp.closeOpacity})` });
  const rme = s('rm-end'), rmep = p('rm-end');
  out.push({ ok: rme.motion === 'reduced' && rme.enterDone === true && rmep.closeOpacity === 1 && rmep.closeChars === 0, message: `reduced motion: the closing heading fades in whole when it arrives (opacity ${rmep.closeOpacity}, ${rmep.closeChars} split characters)` });

  const st = s('static'), stp = p('static');
  out.push({ ok: st.motion === 'static' && stp.chars === 0 && stp.closeChars === 0 && stp.threeD === 0 && stp.titleOpacity === 1 && stp.closeOpacity === 1 && stp.stagePosition === 'relative' && !stp.splayOn && stp.heroHeight <= 900, message: `static: switched live from mid-splay, the split is reverted (${stp.chars} + ${stp.closeChars} characters), no 3D, no fade (headline ${stp.titleOpacity}, closing heading ${stp.closeOpacity}), the hero one screen (${stp.heroHeight} px, stage ${stp.stagePosition})` });
  out.push({ ok: stp.headingStyles === '' && st.perspective === null && st.smoothWheel === false && stp.ledeShown === 'still' && stp.ribsOpacity === 0, message: `static: nothing left behind on the headings (inline style "${stp.headingStyles}", perspective ${st.perspective}), no wheel smoothing (${st.smoothWheel}), the still lede (${stp.ledeShown}), no ribs` });

  const m = s('mobile'), mf = fan('mobile', DEPTH.mobile);
  out.push({ ok: m.chars > 20 && fanOk(mf) && mf.oz > 5 * mf.cz && (p('mobile').overflowX ?? 1) <= 0 && named('mobile'), message: `${fanMsg('mobile', mf)}; outer ${mf.oz.toFixed(1)} px vs centre ${mf.cz.toFixed(1)} px; no sideways overflow (${p('mobile').overflowX})` });
  const rt = s('rtl'), rtp = p('rtl'), rtf = fan('rtl', DEPTH.mobile);
  const words = rtp.geo?.word ?? [], cxs = rtp.geo?.cx ?? [];
  const ordered = cxs.length > 0 && cxs.every((x, i) => i === 0 || words[i] !== words[i - 1] || x > cxs[i - 1]);
  out.push({ ok: fanOk(rtf) && ordered && rt.splits === m.splits && named('rtl') && (rtp.overflowX ?? 1) <= 0, message: `rtl: on a right-to-left page the Latin heading keeps its letter order (dir="auto"; ${ordered}) and splits once (${rt.splits}); ${fanMsg('rtl', rtf)}` });
  out.push({ ok: ['top', 'open', 'end', 'rm', 'keys'].every((n) => (p(n).overflowX ?? 1) <= 0), message: 'desktop and reduced motion: no sideways overflow while open, closed or fading' });
  return out;
}
