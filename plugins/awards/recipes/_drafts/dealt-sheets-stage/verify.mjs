// One sticky stage, five pairs of sheets. Positions are read from the computed matrices (translation in px against the
// sheet's own size, rotation from atan2(b, a)), never from the script's own numbers. The score is addressed in its
// own units (viewports of scroll from the section's `top bottom`), which the page publishes as `start` and `unit`.
const at = (t) => `(() => { const s = window.__awards.state(); if (s.start == null) return true; window.lenis.scrollTo(Math.round(s.start + ${t} * s.unit), { immediate: true, force: true }); return true; })()`;
const atEnd = (extra) => `(() => { const s = window.__awards.state(); if (s.start == null) return true; window.lenis.scrollTo(Math.round(s.start + (s.T + ${extra}) * s.unit), { immediate: true, force: true }); return true; })()`;
const go = (fn, ms = 1300) => [{ type: 'waitFor', fn }, { type: 'wait', ms }];
const caption = (n) => `.pair:nth-child(${n}) [data-caption]`;

export const states = [
  { name: 'top', scroll: 0, settle: 600 },
  { name: 'first', settle: 500, actions: go(at(1.2)) },
  // t = 1.85: the second pair is mid-deal (ticket 45 %, print 38 % of the way) while the first is being swept off.
  { name: 'deal', frame: true, settle: 500, actions: go(at(1.85)) },
  { name: 'switch', settle: 500, actions: go(at(2.0)) },
  { name: 'third', settle: 500, actions: go(at(4.0)) },
  { name: 'last', settle: 500, actions: go(atEnd(0)) },
  { name: 'release', settle: 500, actions: go(atEnd(0.45)) },
  // Keyboard: focus the second ticket, then Tab to the third; each focus brings its pair to rest on the stage.
  { name: 'focus', settle: 500, actions: [{ type: 'focus', selector: caption(2) }, { type: 'wait', ms: 700 }, { type: 'press', key: 'Tab' }, { type: 'wait', ms: 1500 }] },
  { name: 'rm', reducedMotion: true, settle: 500, actions: go(at(4.0), 1000) },
  { name: 'static', settle: 500, actions: [{ type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" }, { type: 'wait', ms: 600 }] },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: go(at(4.0)) },
  { name: 'mobile-deal', viewport: 'mobile', settle: 600, actions: go(at(1.85)) },
];

export function probe() {
  const m = (el) => {
    const cs = getComputedStyle(el);
    const t = new DOMMatrixReadOnly(cs.transform);
    return { x: Math.round(t.m41 * 10) / 10, y: Math.round(t.m42 * 10) / 10, r: Math.round((Math.atan2(t.b, t.a) * 18000) / Math.PI) / 100, w: el.offsetWidth, h: el.offsetHeight, top: el.offsetTop, vh: innerHeight, none: cs.transform === 'none' };
  };
  const rect = (el) => { const b = el.getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom].map((v) => Math.round(v)); };
  const pairs = [...document.querySelectorAll('[data-pair]')];
  const stage = document.querySelector('.deal__stage');
  const focused = document.activeElement;
  return {
    pairs: pairs.map((p) => {
      const c = p.querySelector('[data-caption]'); const md = p.querySelector('[data-media]');
      return { opacity: Number(getComputedStyle(p).opacity), visibility: getComputedStyle(p).visibility, caption: m(c), media: m(md), cRect: rect(c), mRect: rect(md) };
    }),
    links: pairs.map((p) => {
      const c = p.querySelector('[data-caption]'); const md = p.querySelector('[data-media]');
      return c.tagName === 'A' && md.tagName === 'A' && c.getAttribute('href') === md.getAttribute('href') && !!document.getElementById(c.getAttribute('href').slice(1)) && md.getAttribute('tabindex') === '-1' && md.getAttribute('aria-hidden') === 'true' && c.tabIndex === 0;
    }),
    stageTop: Math.round(stage.getBoundingClientRect().top),
    stagePosition: getComputedStyle(stage).position,
    sectionHeight: Math.round(document.querySelector('[data-deal]').getBoundingClientRect().height),
    focusedPair: pairs.findIndex((p) => p.contains(focused)),
    focusedIsCaption: !!focused?.matches?.('[data-caption]'),
    ring: focused?.matches?.(':focus-visible') ? `${getComputedStyle(focused).outlineStyle} ${getComputedStyle(focused).outlineWidth}` : null,
    focusedRect: focused && focused !== document.body ? rect(focused) : null,
    statusRole: document.querySelector('[data-status]').getAttribute('role'),
    vw: document.documentElement.clientWidth,
    vh: innerHeight,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// The authored rails, mirrored from main.js: x in % of the sheet's own width, y in px from the sheet's layout box
// (a function of the stage: waiting with its top 8 % of a viewport under the stage, leaving with its bottom 8 % over
// it), turn in degrees.
const GAP = 0.08;
const below = (s) => s.vh * (1 + GAP) - s.top;
const above = (s) => -(s.top + s.h + s.vh * GAP);
const FROM = { caption: [-42, below, -9], media: [34, below, 7] };
const OUT = { caption: [-20, above, -5], media: [22, above, 6] };
const REST = { caption: [3, (s) => s.vh * 0.03, -2.5], media: [-2, () => 0, 1.5] };

export function assert(r) {
  const out = [];
  const P = (k) => r[k]?.probe || {};
  const S = (k) => r[k]?.state || {};
  const pct = (s) => [(s.x / s.w) * 100, s.y, s.r];   // a sheet's pose as authored: x %, y px, degrees
  const pose = (s) => (s?.w ? pct(s).map((v) => v.toFixed(1)).join('/') : '?');
  const near = (s, want, tol = [0.6, 4, 0.3]) => !!s?.w && pct(s).every((v, j) => Math.abs(v - (j === 1 ? want[1](s) : want[j])) <= tol[j]);
  const atRest = (s) => !!s && Math.abs(s.x) < 1 && Math.abs(s.y) < 1 && Math.abs(s.r) < 0.1;
  const pair = (k, i) => P(k).pairs?.[i] || {};

  out.push({ ok: S('top').active === -1 && near(pair('top', 0).caption, FROM.caption) && near(pair('top', 0).media, FROM.media) && P('top').links?.every(Boolean), message: `top: nothing active before the stage (${S('top').active}); the first pair waits on its two rails (ticket ${pose(pair('top', 0).caption)}, print ${pose(pair('top', 0).media)}); every sheet is a link (the ticket in the tab order, the print a duplicate at tabindex -1)` });

  const f = pair('first', 0);
  out.push({ ok: S('first').active === 0 && atRest(f.caption) && atRest(f.media) && near(pair('first', 1).caption, FROM.caption) && /^Run 1 of 5: Tidal Assembly/.test(S('first').status) && P('first').statusRole === 'status', message: `first (t ${S('first').t}): pair 1 at rest (ticket ${pose(f.caption)}, print ${pose(f.media)}), announced politely ("${S('first').status}")` });

  // Mid-deal: both incoming sheets strictly between their start and rest, at different fractions of their own rails,
  // from opposite sides; the outgoing pair is on its way up.
  const d1 = pair('deal', 1), d0 = pair('deal', 0);
  const frac = (s, from) => 1 - s.y / from[1](s);
  const fc = d1.caption ? frac(d1.caption, FROM.caption) : NaN, fm = d1.media ? frac(d1.media, FROM.media) : NaN;
  out.push({ ok: fc > 0.05 && fc < 0.95 && fm > 0.05 && fm < 0.95 && fc - fm >= 0.05 && d1.caption.x < -2 && d1.media.x > 2 && d1.caption.r < -0.5 && d1.media.r > 0.5, message: `deal (t ${S('deal').t}): both rails moving at different offsets: ticket ${(fc * 100).toFixed(0)} % in from the left (${pose(d1.caption)}), print ${(fm * 100).toFixed(0)} % in from the right (${pose(d1.media)})` });
  out.push({ ok: !!d0.caption && d0.caption.y < -20 && d0.media.y / above(d0.media) > d0.caption.y / above(d0.caption) && S('deal').active === 0, message: `deal: the first pair is swept up as the second lands, print ahead of ticket (${d0.media ? Math.round((d0.media.y / above(d0.media)) * 100) : '?'} % vs ${d0.caption ? Math.round((d0.caption.y / above(d0.caption)) * 100) : '?'} % of the way off); still pair ${S('deal').active + 1} until halfway` });
  out.push({ ok: S('switch').active === 1 && /^Run 2 of 5: Lantern Market/.test(S('switch').status) && S('switch').announcements >= 1, message: `switch (t ${S('switch').t}): pair 2 takes the stage halfway through its deal, announced ("${S('switch').status}")` });

  const th = P('third').pairs || [];
  out.push({ ok: S('third').active === 2 && atRest(th[2].caption) && atRest(th[2].media) && th.slice(0, 2).every((p) => near(p.caption, OUT.caption) && near(p.media, OUT.media) && p.cRect[3] < 0 && p.mRect[3] < 0) && th.slice(3).every((p) => near(p.caption, FROM.caption) && near(p.media, FROM.media) && p.cRect[1] > P('third').vh && p.mRect[1] > P('third').vh), message: `third (t ${S('third').t}): pair 3 at rest, pairs 1–2 dealt off above the stage, pairs 4–5 waiting wholly below it` });

  const l = pair('last', 4), rl = pair('release', 4);
  out.push({ ok: S('last').active === 4 && near(l.caption, REST.caption) && near(l.media, REST.media) && Math.abs(P('last').stageTop) <= 1, message: `last: the fifth pair settles instead of leaving (ticket ${pose(l.caption)}, print ${pose(l.media)}), stage still held (top ${P('last').stageTop})` });
  out.push({ ok: S('release').active === 4 && near(rl.caption, REST.caption) && near(rl.media, REST.media) && P('release').stageTop < -100 && rl.mRect?.[3] > 0, message: `release: the stage lets go (top ${P('release').stageTop}) and the last pair rides away at rest (${pose(rl.caption)}, ${pose(rl.media)})` });

  const fo = P('focus'), fs = S('focus'), fp = fo.pairs?.[2] || {};
  const fr = fo.focusedRect || [];
  out.push({ ok: fo.focusedIsCaption && fo.focusedPair === 2 && /solid 3px/.test(fo.ring || '') && fs.active === 2 && Math.abs(fs.t - fs.rests?.[2]) < 0.05 && atRest(fp.caption) && atRest(fp.media) && fr[1] >= 0 && fr[3] <= fo.vh && fs.focusScrolls >= 2 && /^Run 3 of 5/.test(fs.status), message: `keyboard: Tab to the third ticket (ring ${fo.ring}) scrolls the stage to its rest (t ${fs.t} vs ${fs.rests?.[2]}, ${fs.focusScrolls} focus scrolls); pair 3 at rest and in view (${fr.join(',')}), announced` });

  const rm = P('rm'), rms = S('rm');
  out.push({ ok: rms.motion === 'reduced' && rms.mode === 'fade' && rms.active === 2 && rm.pairs?.every((p) => p.caption.none && p.media.none) && rm.pairs.every((p, i) => (i === 2 ? p.opacity === 1 && p.visibility === 'visible' : p.opacity === 0 && p.visibility === 'hidden')) && /^Run 3 of 5/.test(rms.status), message: `reduced motion: no sheet is translated or turned; pair 3 alone is shown (opacity ${rm.pairs?.map((p) => p.opacity).join('/')}), the change still announced` });

  const st = P('static');
  const tops = (st.pairs || []).map((p) => p.cRect[1]);
  out.push({ ok: S('static').mode === 'list' && st.stagePosition !== 'sticky' && st.pairs?.every((p) => p.caption.none && p.media.none && p.opacity === 1) && tops.every((t, i) => i === 0 || t > tops[i - 1]), message: `static: the stage becomes a plain list, every pair shown in order (${tops.join(' < ')})` });

  const mo = P('mobile'), mp = mo.pairs?.[2] || {};
  out.push({ ok: S('mobile').active === 2 && atRest(mp.caption) && atRest(mp.media) && mp.cRect[1] < mp.mRect[1] && mp.cRect[3] <= mp.mRect[1] + 8 && mp.cRect[0] >= 0 && mp.mRect[2] <= mo.vw && mo.overflowX <= 0, message: `mobile: the pair stacks, ticket over print (${mp.cRect?.join(',')} above ${mp.mRect?.join(',')}), no sideways overflow (${mo.overflowX}px)` });
  out.push({ ok: (P('mobile-deal').overflowX ?? 1) <= 0 && (P('deal').overflowX ?? 1) <= 0, message: `mid-deal on a phone and a desktop the sheets travel inside the stage's clip (overflow ${P('mobile-deal').overflowX}px / ${P('deal').overflowX}px)` });
  return out;
}
