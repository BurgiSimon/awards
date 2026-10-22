// Every state opens a fresh context, so sessionStorage starts empty; `reload` keeps it within one state.
// The probe reads the cover's own pixels (GL) right after a fresh render, and what the page shows beneath it.
const TOGGLE = '[data-mode]';

export const states = [
  // Idle: default ground, nothing stored, the cover compiled ahead but hidden and never drawn.
  { name: 'fresh', settle: 800 },
  // Press, then hold the wipe at uProgress .5: new colour at the press point, nothing over the far corner, tokens not flipped.
  { name: 'cover', settle: 800, actions: [{ type: 'click', selector: TOGGLE }, { type: 'waitFor', fn: 'window.__wipe.seek(0.5)' }] },
  // Let it finish: tokens flipped under full cover, canvas hidden again, ground = the new token.
  { name: 'done', settle: 800, actions: [{ type: 'click', selector: TOGGLE }, { type: 'wait', ms: 1800 }] },
  // A second press mid-cover turns the same edge around: nothing flips.
  { name: 'reverse', settle: 800, actions: [{ type: 'click', selector: TOGGLE }, { type: 'wait', ms: 250 }, { type: 'click', selector: TOGGLE }, { type: 'wait', ms: 1500 }] },
  // Keyboard: Enter starts from the button's centre, Space swaps back.
  { name: 'keyboard', settle: 800, actions: [{ type: 'focus', selector: TOGGLE }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 1700 }, { type: 'press', key: 'Space' }, { type: 'wait', ms: 1700 }] },
  // Stored for the visit: the reload starts dark, with no wipe.
  { name: 'reload', settle: 800, actions: [{ type: 'click', selector: TOGGLE }, { type: 'wait', ms: 1700 }, { type: 'reload' }, { type: 'wait', ms: 300 }] },
  // Reduced motion: instant swap, no canvas frame, no context at all.
  { name: 'reduced', reducedMotion: true, settle: 600, actions: [{ type: 'click', selector: TOGGLE }, { type: 'wait', ms: 100 }] },
  // No WebGL (forced): the same driver draws a plain CSS circle cover.
  { name: 'nogl', settle: 600, actions: [{ type: 'waitFor', fn: "(history.replaceState(null, '', '?gl=0'), true)" }, { type: 'reload' }, { type: 'click', selector: TOGGLE }, { type: 'waitFor', fn: 'window.__wipe.seek(0.5)' }] },
  { name: 'mobile', viewport: 'mobile', settle: 800, actions: [{ type: 'click', selector: TOGGLE }, { type: 'wait', ms: 1800 }] },
];

export function probe() {
  const s = window.__awards.state();
  const out = {
    bodyBg: getComputedStyle(document.body).backgroundColor,
    canvasDisplay: getComputedStyle(document.querySelector('[data-wipe]')).display,
    cssClip: getComputedStyle(document.querySelector('[data-cover-css]')).clipPath,
    cssDisplay: getComputedStyle(document.querySelector('[data-cover-css]')).display,
    tokens: window.__wipe.tokens,
    toggle: (() => { const b = document.querySelector('[data-mode]').getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2), h: Math.round(b.height) }; })(),
    overflowX: document.documentElement.scrollWidth - innerWidth,
  };
  if (s.phase === 'cover' && s.surface === 'gl') {
    const o = s.origin;
    const far = [o.x < innerWidth / 2 ? innerWidth - 3 : 3, o.y < innerHeight / 2 ? innerHeight - 3 : 3];
    out.half = { centre: window.__wipe.sample(o.x, o.y), far: window.__wipe.sample(...far), root: document.documentElement.dataset.theme };
    // At 1 every corner is covered; the tokens still wait for the tween itself to complete.
    window.__wipe.seek(1);
    out.full = { corners: [[3, 3], [innerWidth - 3, 3], [3, innerHeight - 3], [innerWidth - 3, innerHeight - 3]].map(([x, y]) => window.__wipe.sample(x, y)), root: document.documentElement.dataset.theme };
    window.__wipe.seek(0.5);
  }
  return out;
}

const rgb = (hex) => { const n = parseInt(String(hex).replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const css = (hex) => `rgb(${rgb(hex).join(', ')})`;
const near = (px, hex, tol = 2) => Array.isArray(px) && px[3] === 255 && rgb(hex).every((v, i) => Math.abs(v - px[i]) <= tol);

export function assert(r) {
  const out = [];
  const S = (n) => r[n]?.state || {};
  const P = (n) => r[n]?.probe || {};
  const T = P('fresh').tokens || {};
  const light = T.default?.ground, dark = T.dark?.ground;

  const f = S('fresh');
  out.push({ ok: f.theme === 'default' && f.pressed === 'false' && f.stored === null && f.glCreated === true && f.renders === 0 && f.canvasHidden === true && P('fresh').canvasDisplay === 'none' && P('fresh').bodyBg === css(light), message: `idle: default ground ${P('fresh').bodyBg}, cover compiled (${f.glCreated}) but hidden and never drawn (${f.renders} frames)` });

  // The verify idea: held at .5, the press point is the new colour and the far corner still shows the old page.
  const c = S('cover'), h = P('cover').half || {}, full = P('cover').full || {};
  out.push({ ok: c.surface === 'gl' && c.phase === 'cover' && c.p === 0.5 && near(h.centre, dark), message: `cover at .5: press point (${c.origin?.x}, ${c.origin?.y}) is the new ground (${h.centre} vs ${dark})` });
  out.push({ ok: Array.isArray(h.far) && h.far[3] === 0 && h.root === 'default' && P('cover').bodyBg === css(light), message: `cover at .5: far corner uncovered (alpha ${h.far?.[3]}), so it shows the old ground ${P('cover').bodyBg}; tokens still ${h.root}` });
  out.push({ ok: (full.corners || []).length === 4 && full.corners.every((px) => near(px, dark)) && full.root === 'default', message: `cover at 1: all four corners covered (${(full.corners || []).map((p) => p?.[3]).join('/')}) and the tokens still wait for the tween to complete (${full.root})` });

  const d = S('done');
  out.push({ ok: d.theme === 'dark' && d.rootTheme === 'dark' && d.flips === 1 && d.flipAt === 1 && d.renders > 5, message: `done: data-theme ${d.rootTheme}, flipped once at uProgress ${d.flipAt} after ${d.renders} frames` });
  out.push({ ok: d.canvasHidden === true && P('done').canvasDisplay === 'none' && d.phase === 'idle' && P('done').bodyBg === css(dark) && d.themeColor === dark, message: `done: canvas hidden again, body ground ${P('done').bodyBg} = dark token ${dark}, theme-color ${d.themeColor}` });
  out.push({ ok: d.pressed === 'true' && d.stored === 'dark', message: `done: aria-pressed ${d.pressed}, sessionStorage ${d.stored}` });

  const rv = S('reverse');
  out.push({ ok: rv.theme === 'default' && rv.flips === 0 && rv.wipes === 1 && rv.pressed === 'false' && rv.canvasHidden === true && rv.stored === null && P('reverse').bodyBg === css(light), message: `second press mid-cover: the edge shrinks back, nothing flipped (flips ${rv.flips}, theme ${rv.theme}, aria-pressed ${rv.pressed})` });

  const k = S('keyboard'), tg = P('keyboard').toggle || {};
  out.push({ ok: k.wipes === 2 && k.flips === 2 && k.theme === 'default' && k.canvasHidden === true && Math.abs(k.origin?.x - tg.x) <= 1 && Math.abs(k.origin?.y - tg.y) <= 1, message: `keyboard: Enter then Space swap and swap back (${k.flips} flips), the wipe grown from the button's centre (${k.origin?.x}, ${k.origin?.y} vs ${tg.x}, ${tg.y})` });

  const rl = S('reload');
  out.push({ ok: rl.restored === 'dark' && rl.rootTheme === 'dark' && rl.pressed === 'true' && rl.renders === 0 && rl.wipes === 0 && P('reload').bodyBg === css(dark), message: `reload: restored ${rl.restored} before paint, aria-pressed ${rl.pressed}, no wipe (${rl.renders} frames)` });

  const rm = S('reduced');
  out.push({ ok: rm.motion === 'reduced' && rm.theme === 'dark' && rm.flips === 1 && rm.renders === 0 && rm.shown === false && rm.glCreated === false && P('reduced').bodyBg === css(dark), message: `reduced motion: instant swap to ${P('reduced').bodyBg}, no canvas frame (${rm.renders}), no context created (${rm.glCreated})` });

  const ng = S('nogl');
  out.push({ ok: ng.surface === 'css' && ng.glCreated === false && ng.phase === 'cover' && P('nogl').cssDisplay === 'block' && /circle/.test(P('nogl').cssClip || '') && ng.rootTheme === 'default', message: `no WebGL: the same driver draws a CSS circle (${P('nogl').cssClip}), tokens not yet flipped` });

  const m = S('mobile');
  out.push({ ok: m.theme === 'dark' && P('mobile').bodyBg === css(dark) && m.canvasHidden === true && P('mobile').toggle?.h >= 44 && (P('mobile').overflowX ?? 1) <= 0, message: `phone: tap swaps to ${P('mobile').bodyBg}, toggle ${P('mobile').toggle?.h} px tall, overflow ${P('mobile').overflowX} px` });
  return out;
}
