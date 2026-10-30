// One sticky stage, five pairs of sheets. Positions are read from the computed matrices (translation in px against the
// sheet's own size, rotation from atan2(b, a)), never from the script's own numbers, and checked against rails rebuilt
// here from the layout. The score is addressed in its own units (stage heights of scroll from t = 0), which the page
// publishes as `start`, `unit` and the pairs' rest times `rests`; the unit itself is checked against the stage.
const at = (t) => `(() => { const s = window.__awards.state(); if (s.start == null) return true; window.lenis.scrollTo(Math.round(s.start + ${t} * s.unit), { immediate: true, force: true }); return true; })()`;
const atRest = (k) => `(() => { const s = window.__awards.state(); if (s.start == null) return true; window.lenis.scrollTo(Math.round(s.start + s.rests[${k}] * s.unit), { immediate: true, force: true }); return true; })()`;
const atEnd = (extra) => `(() => { const s = window.__awards.state(); if (s.start == null) return true; window.lenis.scrollTo(Math.round(s.start + (s.T + ${extra}) * s.unit), { immediate: true, force: true }); return true; })()`;
const mark = "(() => { const s = window.__awards.state(); window.__mark = { t: s.t, active: s.active, announcements: s.announcements }; return true; })()";
const go = (fn, ms = 1300) => [{ type: 'waitFor', fn }, { type: 'wait', ms }];
const caption = (n) => `.pair:nth-child(${n}) [data-caption]`;

export const states = [
  { name: 'top', scroll: 0, settle: 600 },
  { name: 'first', settle: 500, actions: go(atRest(0)) },
  // t = 2.1: the second pair is 60 % into its deal and already lies over the first, which has not moved yet.
  { name: 'cover', settle: 500, actions: go(at(2.1)) },
  // t = 2.3: the second ticket lands on the first, and the second print on the first print as it is pulled out to the right.
  { name: 'deal', frame: true, settle: 500, actions: go(at(2.3)) },
  { name: 'third', settle: 500, actions: go(atRest(2)) },
  { name: 'last', settle: 500, actions: go(atEnd(0)) },
  { name: 'release', settle: 500, actions: go(atEnd(0.45)) },
  // Real input: ten wheel notches from the first pair's rest, through Lenis on the GSAP ticker, ScrollTrigger and the scrub.
  { name: 'wheel', settle: 500, actions: [...go(atRest(0), 1200), { type: 'waitFor', fn: mark }, { type: 'move', x: 720, y: 300 }, ...Array.from({ length: 10 }, () => ({ type: 'wheel', dx: 0, dy: 120 })), { type: 'wait', ms: 1600 }] },
  // Keyboard: focus the second ticket, then Tab to the third. Read 100 ms after the Tab, so a pair still being scrubbed in shows.
  { name: 'focus', settle: 500, actions: [{ type: 'focus', selector: caption(2) }, { type: 'wait', ms: 700 }, { type: 'press', key: 'Tab' }, { type: 'wait', ms: 100 }] },
  { name: 'rm', reducedMotion: true, settle: 500, actions: go(atRest(2), 1000) },
  // Reduced, keyboard: faded pairs keep their tickets in the tab order; Tab to the fourth brings it back in place.
  { name: 'rm-focus', reducedMotion: true, settle: 500, actions: [...go(atRest(2), 600), { type: 'focus', selector: caption(3) }, { type: 'wait', ms: 400 }, { type: 'press', key: 'Tab' }, { type: 'wait', ms: 1000 }] },
  { name: 'static', settle: 500, actions: [...go(atRest(2), 900), { type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" }, { type: 'wait', ms: 600 }] },
  // Sizes the two named viewports miss: inspect() resizes the page and brings the third pair to rest (the shot is taken after).
  { name: 'tablet', settle: 500 },
  { name: 'landscape', settle: 500 },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: go(atRest(2)) },
  { name: 'mobile-deal', viewport: 'mobile', settle: 600, actions: go(at(2.15)) },
];

export function probe() {
  const stage = document.querySelector('.deal__stage');
  const section = document.querySelector('section[data-deal]');
  const narrow = matchMedia('(max-width: 760px)').matches;
  const m = (el) => {
    const cs = getComputedStyle(el);
    const t = new DOMMatrixReadOnly(cs.transform);
    return { x: Math.round(t.m41 * 10) / 10, y: Math.round(t.m42 * 10) / 10, r: Math.round((Math.atan2(t.b, t.a) * 18000) / Math.PI) / 100, w: el.offsetWidth, h: el.offsetHeight, top: el.offsetTop, left: el.offsetLeft, stageH: stage.clientHeight, stageW: stage.clientWidth, narrow, none: cs.transform === 'none' };
  };
  const box = (el) => el.getBoundingClientRect();
  const rect = (el) => { const b = box(el); return [b.left, b.top, b.right, b.bottom].map((v) => Math.round(v)); };
  const pairs = [...document.querySelectorAll('[data-pair]')];
  const index = (el) => pairs.findIndex((p) => p.contains(el));
  // How much of the earlier pair's sheet the later pair's sheet covers (bounding boxes), and whose sheet is on top there.
  const cover = (a, b) => {
    const A = box(a), B = box(b);
    const w = Math.min(A.right, B.right) - Math.max(A.left, B.left), h = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
    if (w <= 0 || h <= 0) return { frac: 0, top: null };
    const cx = Math.max(A.left, B.left) + w / 2, cy = Math.max(A.top, B.top) + h / 2;
    const inView = cx >= 0 && cy >= 0 && cx <= innerWidth && cy <= innerHeight;
    return { frac: Math.round(((w * h) / (A.width * A.height)) * 100) / 100, top: inView ? index(document.elementFromPoint(cx, cy)) : null };
  };
  const focused = document.activeElement;
  const fcs = focused ? getComputedStyle(focused) : null;
  return {
    pairs: pairs.map((p) => {
      const c = p.querySelector('[data-caption]'); const md = p.querySelector('[data-media]');
      return { opacity: Number(getComputedStyle(p).opacity), pointer: getComputedStyle(c).pointerEvents, caption: m(c), media: m(md), cRect: rect(c), mRect: rect(md), tRect: rect(c.querySelector('.sheet__title')) };
    }),
    // Each later pair over the one before it: [print over print, ticket over ticket].
    covers: pairs.slice(1).map((p, k) => [cover(pairs[k].querySelector('[data-media]'), p.querySelector('[data-media]')), cover(pairs[k].querySelector('[data-caption]'), p.querySelector('[data-caption]'))]),
    links: pairs.map((p) => {
      const c = p.querySelector('[data-caption]'); const md = p.querySelector('[data-media]');
      const named = document.getElementById(c.getAttribute('aria-labelledby') || '-');
      const described = (c.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean).map((id) => document.getElementById(id));
      return c.tagName === 'A' && md.tagName === 'A' && c.getAttribute('href') === md.getAttribute('href') && !!document.getElementById(c.getAttribute('href').slice(1)) && md.getAttribute('tabindex') === '-1' && md.getAttribute('aria-hidden') === 'true' && c.tabIndex === 0
        && named?.tagName === 'H3' && c.contains(named) && described.length === 2 && described.every((d) => d && c.contains(d) && d !== named);
    }),
    head: rect(document.querySelector('.deal__head')),
    noteShown: getComputedStyle(document.querySelector('.deal__note')).display !== 'none',
    stageTop: Math.round(box(stage).top),
    stageH: stage.clientHeight,
    stagePosition: getComputedStyle(stage).position,
    sectionHeight: Math.round(box(section).height),
    sectionTop: Math.round(box(section).top + scrollY),
    sectionInline: section.style.height,
    focusedPair: index(focused),
    focusedIsCaption: !!focused?.matches?.('[data-caption]'),
    ring: focused?.matches?.(':focus-visible') ? `${fcs.outlineStyle} ${fcs.outlineWidth} ${fcs.outlineColor}` : null,
    ringShadow: focused?.matches?.(':focus-visible') ? fcs.boxShadow : null,
    focusedRect: focused && focused !== document.body ? rect(focused) : null,
    statusRole: document.querySelector('[data-status]').getAttribute('role'),
    mark: window.__mark ?? null,
    vw: document.documentElement.clientWidth,
    vh: innerHeight,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Viewports the two named ones miss: a portrait tablet (the print is sized by height and would run off the right edge)
// and a phone on its side (wider than the phone breakpoint, so it gets the desktop stage in 390 px of height).
const SIZES = { tablet: { width: 834, height: 1112 }, landscape: { width: 844, height: 390 } };
export async function inspect(page, state) {
  const size = SIZES[state.name];
  if (!size) return null;
  await page.setViewportSize(size);
  await page.waitForTimeout(900);   // ScrollTrigger's resize refresh and Lenis's own
  await page.evaluate((k) => { const s = window.__awards.state(); window.lenis.scrollTo(Math.round(s.start + s.rests[k] * s.unit), { immediate: true, force: true }); }, 2);
  await page.waitForTimeout(1300);
  return { size, state: await page.evaluate(() => window.__awards.state()), probe: await page.evaluate(probe) };
}

// The authored rails, rebuilt from the layout: [xPercent, y px, degrees] as functions of a sheet's measures. Sideways
// travel is a share of the sheet's width; a sheet waits with its top under the stage and leaves past its side edge,
// each by a margin of 24 px plus what its turn swings the far corner out (the other side's length × sin θ).
const sin = (d) => Math.sin((Math.abs(d) * Math.PI) / 180);
const clearY = (s, d) => s.w * sin(d) + 24;
const clearX = (s, d) => s.h * sin(d) + 24;
const FROM = {
  caption: [(s) => (s.narrow ? -14 : -42), (s) => s.stageH - s.top + clearY(s, -12), -12],
  media: [(s) => (s.narrow ? 14 : 34), (s) => s.stageH - s.top + clearY(s, 9), 9],
};
const FIRST = { caption: [FROM.caption[0], (s) => s.h * 0.3, -12], media: [FROM.media[0], (s) => s.h * 0.3, 9] };
const OUT = {
  caption: [(s) => (-(s.left + s.w + clearX(s, -10)) / s.w) * 100, (s) => s.h * 0.15, -10],
  media: [(s) => ((s.stageW - s.left + clearX(s, 8)) / s.w) * 100, (s) => -s.h * 0.08, 8],
};
const POSES = [[-2, -1.5, 1, 0.8], [3, 2, -1.5, -1], [-3, -2.5, 0.5, 1.2], [2, 1.5, -1, -0.6], [-1, -1, 1.5, 0.5]];
const REST = (i) => ({ caption: [() => POSES[i][0], () => 0, POSES[i][1]], media: [() => POSES[i][2], () => 0, POSES[i][3]] });
const SETTLED = { caption: [() => 3, (s) => s.stageH * 0.03, -2.5], media: [() => -2, () => 0, 1.5] };

export function assert(r) {
  const out = [];
  const P = (k) => r[k]?.probe || {};
  const S = (k) => r[k]?.state || {};
  const I = (k) => r[k]?.inspect || {};
  const pct = (s) => [(s.x / s.w) * 100, s.y, s.r];   // a sheet's pose as authored: x %, y px, degrees
  const pose = (s) => (s?.w ? pct(s).map((v) => v.toFixed(1)).join('/') : '?');
  const near = (s, want, tol = [0.6, 4, 0.3]) => !!s?.w && pct(s).every((v, j) => Math.abs(v - (j === 2 ? want[2] : want[j](s))) <= tol[j]);
  const pairAt = (s, i, rail) => near(s.caption, rail.caption) && near(s.media, rail.media);
  const inside = (q, vw, vh) => !!q && q[0] >= 0 && q[1] >= 0 && q[2] <= vw && q[3] <= vh;
  const meets = (a, b) => !!a && !!b && a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
  const pair = (k, i) => P(k).pairs?.[i] || {};

  // Top: the first pair waits on its rails, the stage below; the score's unit is the stage, and the height is the score.
  const tp = P('top'), ts = S('top');
  out.push({ ok: ts.active === -1 && ts.status === '' && pairAt(pair('top', 0), 0, FIRST) && pairAt(pair('top', 1), 1, FROM) && tp.links?.every(Boolean) && ts.tweens > 0, message: `top: nothing active or announced before the stage (${ts.active}); the first pair waits on its short rail (ticket ${pose(pair('top', 0).caption)}, print ${pose(pair('top', 0).media)}), the second wholly below (${pose(pair('top', 1).caption)}); every ticket is a link named by its h3 and described by its details, the print a duplicate at tabindex -1; ${ts.tweens} tweens own the sheets` });
  out.push({ ok: Math.abs(ts.unit - tp.stageH) <= 1 && tp.stageH === tp.vh && Math.abs(tp.sectionHeight - ts.T * tp.stageH) <= 2 && tp.sectionInline === `${ts.T * 100}svh` && Math.abs(ts.start - (tp.sectionTop - tp.stageH)) <= 1, message: `score: one unit is one stage height (${ts.unit} px against a ${tp.stageH} px stage), the section is the score long (${tp.sectionHeight} px = ${ts.T} × ${tp.stageH}, written inline as ${tp.sectionInline}), and t = 0 when the section's top is one stage height down (start ${ts.start}, section at ${tp.sectionTop})` });

  const f = pair('first', 0), fp = P('first');
  out.push({ ok: S('first').active === 0 && pairAt(f, 0, REST(0)) && pairAt(pair('first', 1), 1, FROM) && inside(f.cRect, fp.vw, fp.vh) && inside(f.mRect, fp.vw, fp.vh) && /^Run 1 of 5: Tidal Assembly/.test(S('first').status) && S('first').announcements === 1 && fp.statusRole === 'status' && Math.abs(fp.stageTop) <= 1, message: `first (t ${S('first').t}): pair 1 at its own rest (ticket ${pose(f.caption)}, print ${pose(f.media)}), wholly in view (${f.cRect?.join(',')} / ${f.mRect?.join(',')} in ${fp.vw}×${fp.vh}), announced once ("${S('first').status}")` });

  // The deal lands on top: the second pair covers the first before the first moves, and is drawn above it.
  const cv = P('cover').covers?.[0] || [];
  out.push({ ok: pairAt(pair('cover', 0), 0, REST(0)) && cv[0]?.frac >= 0.2 && cv[0]?.top === 1 && S('cover').active === 0 && S('cover').announcements === 1, message: `cover (t ${S('cover').t}): the first pair still at rest (${pose(pair('cover', 0).caption)}, ${pose(pair('cover', 0).media)}) while the second print already lies over ${Math.round((cv[0]?.frac ?? 0) * 100)} % of the first print, drawn on top of it (pair ${(cv[0]?.top ?? -2) + 1} at the overlap's centre); still pair ${S('cover').active + 1} on the stage` });

  // Mid-hand-over: the second pair landing at different points of its two rails, from opposite sides, on top of the
  // first, which is being pulled out from under to the right (print) while its ticket has not left yet.
  const d1 = pair('deal', 1), d0 = pair('deal', 0), dc = P('deal').covers?.[0] || [];
  const frac = (s, from, to) => { const a = from[1](s), b = to[1](s); return (a - s.y) / (a - b); };
  const out0 = d0.media?.w ? (pct(d0.media)[0] - POSES[0][2]) / (OUT.media[0](d0.media) - POSES[0][2]) : NaN;
  const fc = d1.caption?.w ? frac(d1.caption, FROM.caption, REST(1).caption) : NaN, fm = d1.media?.w ? frac(d1.media, FROM.media, REST(1).media) : NaN;
  out.push({ ok: fc > 0.6 && fc < 0.98 && fm > 0.5 && fm < 0.95 && fc - fm >= 0.015 && d1.caption.x < 0 && d1.media.x > 0 && d1.caption.r < 0 && d1.media.r > 0 && out0 > 0.05 && out0 < 0.6 && near(d0.caption, REST(0).caption) && dc[0]?.frac >= 0.2 && dc[0]?.top === 1 && dc[1]?.frac > 0 && dc[1]?.top === 1, message: `deal (t ${S('deal').t}): ticket ${(fc * 100).toFixed(0)} % in from the left (${pose(d1.caption)}), print ${(fm * 100).toFixed(0)} % in from the right (${pose(d1.media)}); the first print ${(out0 * 100).toFixed(0)} % of the way out to the right from under the second (${Math.round((dc[0]?.frac ?? 0) * 100)} % covered), the first ticket still at rest under the second (${Math.round((dc[1]?.frac ?? 0) * 100)} % covered)` });
  out.push({ ok: S('deal').active === 1 && /^Run 2 of 5: Lantern Market/.test(S('deal').status) && S('deal').announcements === 1, message: `deal: pair 2 takes the stage once it covers pair 1, announced once ("${S('deal').status}", ${S('deal').announcements})` });

  const tr = P('third'), th = tr.pairs || [];
  out.push({ ok: S('third').active === 2 && pairAt(th[2], 2, REST(2)) && inside(th[2]?.cRect, tr.vw, tr.vh) && inside(th[2]?.mRect, tr.vw, tr.vh) && th.slice(0, 2).every((p, i) => pairAt(p, i, OUT) && p.cRect[2] <= 0 && p.mRect[0] >= tr.vw) && th.slice(3).every((p, i) => pairAt(p, i + 3, FROM) && p.cRect[1] >= tr.vh && p.mRect[1] >= tr.vh), message: `third (t ${S('third').t}): pair 3 at its own rest and wholly in view (${th[2]?.cRect?.join(',')} / ${th[2]?.mRect?.join(',')}), pairs 1–2 pulled off past the sides (tickets end at ${th.slice(0, 2).map((p) => p.cRect[2]).join('/')}, prints start at ${th.slice(0, 2).map((p) => p.mRect[0]).join('/')}), pairs 4–5 waiting wholly under the stage (tops ${th.slice(3).map((p) => p.cRect[1]).join('/')})` });
  out.push({ ok: !!f.mRect && !!th[2]?.mRect && f.mRect.some((v, j) => Math.abs(v - th[2].mRect[j]) >= 3) && Math.abs(f.caption.r - th[2].caption.r) >= 0.5, message: `holds differ: pair 1 rests at ${pose(pair('first', 0).caption)} / ${pose(pair('first', 0).media)}, pair 3 at ${pose(th[2]?.caption)} / ${pose(th[2]?.media)}` });

  const l = pair('last', 4), rl = pair('release', 4);
  out.push({ ok: S('last').active === 4 && pairAt(l, 4, SETTLED) && pairAt(pair('last', 3), 3, OUT) && Math.abs(P('last').stageTop) <= 1, message: `last: the fifth pair settles instead of leaving (ticket ${pose(l.caption)}, print ${pose(l.media)}), the fourth is gone, stage still held (top ${P('last').stageTop})` });
  out.push({ ok: S('release').active === 4 && pairAt(rl, 4, SETTLED) && P('release').stageTop < -100 && rl.mRect?.[3] > 0, message: `release: the stage lets go (top ${P('release').stageTop}) and the last pair rides away at rest (${pose(rl.caption)}, ${pose(rl.media)})` });

  // Real wheel input crosses exactly one pair and announces it once.
  const wp = P('wheel'), ws = S('wheel'), wm = wp.mark || {};
  out.push({ ok: wm.active === 0 && ws.t - wm.t >= 1 && ws.active === 1 && ws.announcements - wm.announcements === 1 && /^Run 2 of 5/.test(ws.status), message: `wheel: ten real notches move the score from t ${wm.t} to ${ws.t}, pair ${(wm.active ?? -2) + 1} → ${ws.active + 1}, announced ${ws.announcements - wm.announcements} time(s) ("${ws.status}")` });

  const fo = P('focus'), fs = S('focus'), fq = fo.pairs?.[2] || {};
  const fr = fo.focusedRect || [];
  out.push({ ok: fo.focusedIsCaption && fo.focusedPair === 2 && /^solid 3px rgb\(255, 210, 63\)/.test(fo.ring || '') && /rgb\(29, 28, 25\) 0px 0px 0px 3px/.test(fo.ringShadow || '') && /rgb\(29, 28, 25\) 0px 0px 0px 8px/.test(fo.ringShadow || '') && fs.active === 2 && Math.abs(fs.t - fs.rests?.[2]) < 0.05 && pairAt(fq, 2, REST(2)) && inside(fr, fo.vw, fo.vh) && fs.focusScrolls >= 2, message: `keyboard: Tab to the third ticket (ring ${fo.ring}, inside two ink bands) scrolls the stage to its rest (t ${fs.t} vs ${fs.rests?.[2]}, ${fs.focusScrolls} focus scrolls); 100 ms later the pair is already at rest (${pose(fq.caption)}) and the ring wholly in view (${fr.join(',')})` });
  out.push({ ok: fs.status === '' && fs.announcements === 0, message: `keyboard: a focus scroll stays quiet in the status, because the focused link names the run itself (status "${fs.status}", ${fs.announcements} announcements)` });

  const rm = P('rm'), rms = S('rm');
  out.push({ ok: rms.motion === 'reduced' && rms.mode === 'fade' && rms.active === 2 && rms.tweens === 0 && rms.sheets?.flat().every((v) => v.xPercent === 0 && v.y === 0 && v.r === 0) && rm.pairs?.every((p) => p.caption.none && p.media.none) && rm.pairs.every((p, i) => (i === 2 ? p.opacity === 1 && p.pointer === 'auto' : p.opacity === 0 && p.pointer === 'none')) && /^Run 3 of 5/.test(rms.status), message: `reduced motion: no tween owns a sheet (${rms.tweens}) and GSAP holds no offset or turn on any; pair 3 alone is shown and takes the pointer (opacity ${rm.pairs?.map((p) => p.opacity).join('/')}), the change still announced` });
  const rf = P('rm-focus'), rfs = S('rm-focus');
  out.push({ ok: rf.focusedIsCaption && rf.focusedPair === 3 && rfs.active === 3 && rf.pairs?.[3]?.opacity === 1 && rf.pairs.every((p) => p.caption.none && p.media.none) && rfs.tweens === 0 && rfs.status === '' && rfs.announcements === 1, message: `reduced motion, keyboard: Tab from a faded ticket reaches the fourth (${rf.focusedPair + 1}), which fades in in place (opacity ${rf.pairs?.[3]?.opacity}); the status, which had said run 3, is emptied rather than repeating the link ("${rfs.status}")` });

  const st = P('static');
  const tops = (st.pairs || []).map((p) => p.cRect[1]);
  out.push({ ok: S('static').mode === 'list' && S('static').status === '' && S('static').tweens === 0 && st.sectionInline === '' && st.stagePosition !== 'sticky' && st.pairs?.every((p) => p.caption.none && p.media.none && p.opacity === 1) && tops.every((t, i) => i === 0 || t > tops[i - 1]), message: `static: the stage becomes a plain list, every pair shown in order (${tops.join(' < ')}), the status emptied ("${S('static').status}") and the script's height removed` });

  for (const k of ['tablet', 'landscape']) {
    const ip = I(k).probe || {}, is = I(k).state || {}, ps = ip.pairs || [], rp = ps[2] || {};
    out.push({ ok: is.active === 2 && pairAt(rp, 2, REST(2)) && inside(rp.cRect, ip.vw, ip.vh) && inside(rp.mRect, ip.vw, ip.vh) && !meets(ip.head, rp.cRect) && !meets(ip.head, rp.mRect) && ps.slice(3).every((p) => p.cRect[1] >= ip.vh && p.mRect[1] >= ip.vh) && ip.overflowX <= 0 && (k !== 'landscape' || !ip.noteShown), message: `${k} ${I(k).size?.width}×${I(k).size?.height}: the resting pair wholly in view (ticket ${rp.cRect?.join(',')}, print ${rp.mRect?.join(',')}), clear of the heading (${ip.head?.join(',')}${k === 'landscape' ? `, note ${ip.noteShown ? 'shown' : 'hidden'}` : ''}); the waiting pairs' turned corners stay under the stage (tops ${ps.slice(3).map((p) => p.cRect[1]).join('/')} ≥ ${ip.vh})` });
  }

  const mo = P('mobile'), mp = mo.pairs?.[2] || {};
  const mpw = mp.mRect ? mp.mRect[2] - mp.mRect[0] : 0;
  out.push({ ok: S('mobile').active === 2 && pairAt(mp, 2, REST(2)) && mpw >= 0.75 * mo.vw && mp.cRect[1] < mp.mRect[3] - 8 && mp.cRect[3] > mp.mRect[3] && mp.cRect[0] < mp.mRect[0] && inside(mp.cRect, mo.vw, mo.vh) && inside(mp.mRect, mo.vw, mo.vh) && mo.overflowX <= 0, message: `mobile: the print carries the frame (${mpw} of ${mo.vw} px wide) and the ticket is laid across its foot (ticket ${mp.cRect?.join(',')} over print ${mp.mRect?.join(',')}), both in view, no sideways overflow (${mo.overflowX}px)` });
  const md = P('mobile-deal'), mt = md.pairs?.[1]?.tRect || [], mtc = md.pairs?.[1]?.cRect || [];
  const seen = (q, vw) => (q.length ? (Math.min(q[2], vw) - Math.max(q[0], 0)) / (q[2] - q[0]) : 0);
  // On its phone rail: at the share of the way it has risen, its sideways offset is where a −14 % start puts it.
  const mk = md.pairs?.[1]?.caption, mf = mk?.w ? frac(mk, FROM.caption, REST(1).caption) : NaN;
  const mx = mk?.w ? FROM.caption[0](mk) + (POSES[1][0] - FROM.caption[0](mk)) * mf : NaN;
  out.push({ ok: mk?.narrow && mf > 0.3 && mf < 0.95 && Math.abs(pct(mk)[0] - mx) <= 0.6 && seen(mtc, md.vw) >= 0.8 && seen(mt, md.vw) >= 0.95 && (md.covers?.[0]?.[0]?.frac ?? 0) > 0 && md.overflowX <= 0, message: `mobile mid-deal: the incoming ticket is ${(mf * 100).toFixed(0)} % in on its phone rail (${pose(mk)}, x expected ${mx.toFixed(1)} % from a −14 % start), ${Math.round(seen(mtc, md.vw) * 100)} % of it and ${Math.round(seen(mt, md.vw) * 100)} % of its title on screen, landing over the resting print (${Math.round((md.covers?.[0]?.[0]?.frac ?? 0) * 100)} % covered)` });
  return out;
}
