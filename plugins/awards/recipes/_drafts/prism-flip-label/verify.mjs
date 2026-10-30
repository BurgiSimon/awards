// Prism labels: at rest every box is flat (no transform, no 3D context, the copy hidden) and the page holds no 3D
// compositor layer; hover and keyboard focus make the box a prism and turn it a quarter about an axis half its height
// behind the label, so the copy then sits exactly where the label was, and leaving holds the prism until the turn back
// has ended; a label wrapped to two lines turns about its own centre too; the letters variant runs a capped stagger with
// the faces shaded by the turn (read from transitions paused mid-way); the copy is aria-hidden and every link has one
// accessible name; the focus ring is real pixels above the turned face; reduced motion swaps the faces by opacity and
// static cuts; touch gets a press state and no turn; forced colours show the plain label; nothing overflows on a phone.
const cell = (n) => `.bar__nav li:nth-child(${n}) .prism`;
const film = (n) => `.films__list li:nth-child(${n}) .prism`;
const AWAY = { type: 'move', x: 1200, y: 140, steps: 4 };   // the intro's empty top padding, in either direction
const pauseAt = (ms) => ({ type: 'waitFor', fn: `(() => { const a = document.getAnimations(); a.forEach((x) => { x.pause(); x.currentTime = ${ms}; }); return a.length > 0; })()` });
// The frame: the header's transitions at 40 ms (a cell near 45°), the film title's at 260 ms (a wave across the word).
const pauseFrame = { type: 'waitFor', fn: "(() => { const a = document.getAnimations(); a.forEach((x) => { x.pause(); x.currentTime = x.effect.target.closest('.bar') ? 40 : 260; }); return a.length > 0; })()" };
const STATIC = { type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" };
// A narrow column: the first footer link held to 6em wraps "Write to the studio" to two lines.
const NARROW = { type: 'waitFor', fn: "(() => { document.querySelector('.footer__links li').style.maxWidth = '6em'; return true; })()" };

export const states = [
  { name: 'rest', settle: 600 },
  { name: 'hover', settle: 600, actions: [{ type: 'hover', selector: cell(2) }, { type: 'wait', ms: 800 }] },
  { name: 'leaving', settle: 600, actions: [{ type: 'hover', selector: cell(2) }, { type: 'wait', ms: 800 }, { ...AWAY, steps: 2 }, pauseAt(100)] },
  { name: 'leave', settle: 600, actions: [{ type: 'hover', selector: cell(2) }, { type: 'wait', ms: 300 }, AWAY, { type: 'wait', ms: 900 }] },
  { name: 'focus', settle: 600, actions: [{ type: 'focus', selector: '.bar__brand' }, { type: 'press', key: 'Tab' }, { type: 'wait', ms: 800 }] },
  { name: 'focus-hover', settle: 600, actions: [{ type: 'focus', selector: '.bar__brand' }, { type: 'press', key: 'Tab' }, { type: 'hover', selector: cell(2) }, { type: 'wait', ms: 800 }] },
  { name: 'turning', settle: 600, frame: true, actions: [{ type: 'focus', selector: film(1) }, { type: 'hover', selector: cell(2) }, { type: 'wait', ms: 30 }, pauseFrame] },
  { name: 'letters', settle: 600, actions: [{ type: 'hover', selector: film(2) }, { type: 'wait', ms: 1200 }] },
  { name: 'wrapped', settle: 600, actions: [NARROW, { type: 'wait', ms: 200 }, { type: 'hover', selector: '.footer__links li:nth-child(1) .prism' }, { type: 'wait', ms: 800 }] },
  // A right-to-left page: the letter boxes of a Latin title must still read left to right.
  { name: 'rtl', settle: 600, actions: [{ type: 'waitFor', fn: '(() => { document.documentElement.dir = "rtl"; return true; })()' }, AWAY, { type: 'wait', ms: 900 }] },
  { name: 'rm-hover', reducedMotion: true, settle: 600, actions: [{ type: 'hover', selector: cell(2) }, { type: 'wait', ms: 600 }] },
  { name: 'rm-focus', reducedMotion: true, settle: 600, actions: [{ type: 'focus', selector: '.bar__brand' }, { type: 'press', key: 'Tab' }, { type: 'wait', ms: 600 }] },
  { name: 'static', settle: 600, actions: [STATIC, { type: 'wait', ms: 100 }, { type: 'hover', selector: cell(2) }, { type: 'wait', ms: 60 }] },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: [{ type: 'hover', selector: cell(2) }, { type: 'wait', ms: 800 }] },
  { name: 'mobile-press', viewport: 'mobile', settle: 600, actions: [{ type: 'hover', selector: cell(3) }, { type: 'down' }, { type: 'wait', ms: 200 }] },
  { name: 'forced', settle: 600, actions: [{ type: 'focus', selector: '.bar__brand' }, { type: 'press', key: 'Tab' }, { type: 'wait', ms: 800 }] },
];

export function probe() {
  const turn = (el) => {
    const cs = getComputedStyle(el);
    const t = cs.transform;
    const m = new DOMMatrixReadOnly(t === 'none' ? undefined : t);
    return { none: t === 'none', deg: Math.round((Math.atan2(m.m23, m.m22) * 180) / Math.PI * 10) / 10, m22: Number(m.m22.toFixed(4)), m23: Number(m.m23.toFixed(4)), ts: cs.transformStyle, originZ: parseFloat(cs.transformOrigin.split(' ')[2] || '0') };
  };
  const box = (r) => ({ x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) });
  const prism = (a) => {
    const b = a.querySelector('.prism__box');
    const f = a.querySelector('.prism__face--front');
    const n = a.querySelector('.prism__face--next');
    const fs = getComputedStyle(f);
    const ns = getComputedStyle(n);
    return {
      ...turn(b),
      h: b.offsetHeight,
      layoutH: parseFloat(getComputedStyle(b).height),   // unrounded and untransformed
      depth: parseFloat(b.style.getPropertyValue('--depth')),
      link: box(a.getBoundingClientRect()),
      front: box(f.getBoundingClientRect()),
      next: box(n.getBoundingClientRect()),
      frontOpacity: fs.opacity, nextOpacity: ns.opacity, nextVis: ns.visibility,
      frontBg: fs.backgroundColor, nextBg: ns.backgroundColor, frontColor: fs.color, nextColor: ns.color,
      hidden: n.getAttribute('aria-hidden'),
      duration: getComputedStyle(b).transitionDuration.split(',')[0].trim(),
      property: getComputedStyle(b).transitionProperty,
      li: a.closest('li') ? { opacity: getComputedStyle(a.closest('li')).opacity, duration: getComputedStyle(a.closest('li')).transitionDuration } : null,
    };
  };
  const cells = [...document.querySelectorAll('.bar__nav .prism')].map(prism);
  const letterRow = (sel) => [...document.querySelector(sel).querySelectorAll('.prism__box')].map((b) => {
    const cs = getComputedStyle(b);
    return { ...turn(b), delay: parseFloat(cs.transitionDelay) * 1000, duration: parseFloat(cs.transitionDuration) * 1000, x: Math.round(b.getBoundingClientRect().left), frontColor: getComputedStyle(b.querySelector('.prism__face--front')).color, nextColor: getComputedStyle(b.querySelector('.prism__face--next')).color };
  });
  const a = document.activeElement;
  const all = [...document.querySelectorAll('.prism__box')];
  return {
    cells,
    footer: prism(document.querySelector('.footer__links .prism')),
    film1: letterRow('.films__list li:nth-child(1) .prism'),
    film2: letterRow('.films__list li:nth-child(2) .prism'),
    // When the last letter of each title has finished turning (delay + duration of its transform), in ms.
    filmEnds: [...document.querySelectorAll('.films__list .prism')].map((f) => { const bs = f.querySelectorAll('.prism__box'); const cs = getComputedStyle(bs[bs.length - 1]); return Math.round((parseFloat(cs.transitionDelay) + parseFloat(cs.transitionDuration)) * 1000); }),
    boxes: all.length,
    flat: all.filter((b) => getComputedStyle(b).transform === 'none' && getComputedStyle(b).transformStyle === 'flat').length,
    shownCopies: [...document.querySelectorAll('.prism__face--next')].filter((n) => getComputedStyle(n).visibility !== 'hidden').length,
    ring: a?.matches?.('.prism--cell') ? (() => { const r = getComputedStyle(a, '::after'); return { content: r.content, width: r.borderTopWidth, color: r.borderTopColor, z: r.zIndex }; })() : null,
    ground: getComputedStyle(document.body).backgroundColor,
    focused: a?.matches?.('.prism') ? (a.querySelector('.sr-only, .prism__face--front')?.textContent.trim() ?? null) : null,
    copies: document.querySelectorAll('.prism__face--next').length,
    hiddenCopies: document.querySelectorAll('.prism__face--next[aria-hidden="true"]').length,
    targets: [...document.querySelectorAll('.prism')].map((p) => Math.round(p.getBoundingClientRect().height * 10) / 10),
    filmRight: Math.round(document.querySelector('.films__list li:nth-child(1) .prism').getBoundingClientRect().right),
    listRight: Math.round(document.querySelector('.films__list').getBoundingClientRect().right),
    dir: document.documentElement.dir || 'ltr',
    navRight: Math.round(document.querySelector('.bar__nav').getBoundingClientRect().right),
    touchHandler: typeof document.ontouchstart === 'function',
    viewport: innerWidth,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side: the compositor's layers (CDP) at rest and while turning, the accessibility tree at rest, real pixels on the
// focus ring, and the forced-colours pass.
async function layers3d(page) {
  const cdp = await page.context().newCDPSession(page);
  let layers = null;
  cdp.on('LayerTree.layerTreeDidChange', (e) => { if (e.layers) layers = e.layers; });
  await cdp.send('LayerTree.enable');
  await page.evaluate(() => { document.body.style.outlineColor = document.body.style.outlineColor ? '' : 'transparent'; return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
  for (let i = 0; i < 40 && !layers; i++) await page.waitForTimeout(50);
  if (!layers) { await cdp.detach(); return { total: null }; }
  const reasons = [];
  for (const l of layers) reasons.push(...((await cdp.send('LayerTree.compositingReasons', { layerId: l.layerId })).compositingReasonIds || []));
  await cdp.send('LayerTree.disable');
  await cdp.detach();
  return { total: layers.length, threeD: reasons.filter((r) => /3D|Backface|Preserve|Perspective/i.test(r)).length, overlap: reasons.filter((r) => /Overlap/i.test(r)).length };
}
async function pixel(page, x, y) {
  const png = await page.screenshot({ clip: { x, y, width: 1, height: 1 } });
  return page.evaluate(async (b64) => {
    const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
    const cv = new OffscreenCanvas(1, 1); const g = cv.getContext('2d'); g.drawImage(bmp, 0, 0);
    return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3);
  }, png.toString('base64'));
}

export async function inspect(page, st) {
  if (st.name === 'rest') {
    return { layers: await layers3d(page), nav: await page.locator('.bar__nav').ariaSnapshot(), films: await page.locator('.films__list').ariaSnapshot(), footer: await page.locator('.footer__links').ariaSnapshot() };
  }
  if (st.name === 'hover' || st.name === 'leave') return { layers: await layers3d(page) };
  if (st.name === 'focus') {
    // On the ring's line (7 px in from the cell's left edge, 2 px wide) and 5 px further in, both at mid-height.
    const r = await page.evaluate(() => { const b = document.activeElement.getBoundingClientRect(); return { x: b.left, y: Math.floor(b.top + b.height / 2) }; });
    return { ring: await pixel(page, Math.floor(r.x + 8), r.y), face: await pixel(page, Math.floor(r.x + 13), r.y) };
  }
  if (st.name === 'forced') {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.waitForTimeout(300);
    return page.evaluate(() => {
      const a = document.activeElement;
      const b = a.querySelector('.prism__box');
      return { focused: a.querySelector('.prism__face--front').textContent.trim(), transform: getComputedStyle(b).transform, frontTransform: getComputedStyle(a.querySelector('.prism__face--front')).transform, nextDisplay: getComputedStyle(a.querySelector('.prism__face--next')).display, letters: [...document.querySelectorAll('.films__list .prism__box')].every((x) => getComputedStyle(x).transform === 'none') };
    });
  }
  return null;
}

export function assert(r) {
  const s = (n) => r[n]?.state || {};
  const p = (n) => r[n]?.probe || {};
  const near = (a, b, d = 1) => Math.abs(a - b) <= d;
  const sameBox = (a, b, d = 1) => !!(a && b && near(a.x, b.x, d) && near(a.y, b.y, d) && near(a.w, b.w, d) && near(a.h, b.h, d));
  const rgb = (c) => (String(c).match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  const close = (a, b, d = 12) => a.length === 3 && b.length === 3 && a.every((v, i) => Math.abs(v - b[i]) <= d);
  const INK = [34, 18, 26];
  const ACCENT = [163, 23, 47];
  const out = [];

  const rest = p('rest');
  const rl = r.rest?.inspect?.layers || {};
  out.push({ ok: s('rest').turn && rest.boxes === 73 && rest.flat === rest.boxes && rest.shownCopies === 0, message: `rest: every box is flat (${rest.flat}/${rest.boxes} with no transform and no 3D context), every copy hidden (${rest.shownCopies} shown)` });
  out.push({ ok: rl.total > 0 && rl.threeD === 0 && rl.overlap === 0, message: `rest: the compositor holds no 3D layer for the prisms (${rl.total} layers, ${rl.threeD} for 3D, ${rl.overlap} for overlap)` });
  out.push({ ok: rest.cells.length === 4 && rest.cells.every((c) => c.h === 64 && near(c.depth, c.layoutH / 2, 0.01) && near(c.originZ, -c.depth, 0.05)), message: `rest: each cell's axis lies half its height behind the label (origin z ${rest.cells.map((c) => c.originZ).join(', ')}; h ${rest.cells.map((c) => c.h).join(', ')})` });
  out.push({ ok: rest.cells.every((c) => sameBox(c.front, c.link)) && sameBox(rest.footer.front, rest.footer.link), message: `rest: the front face lies exactly on the link's box (${JSON.stringify(rest.cells[0].front)} vs ${JSON.stringify(rest.cells[0].link)})` });
  out.push({ ok: rest.copies > 0 && rest.hiddenCopies === rest.copies && rest.cells.every((c) => c.hidden === 'true'), message: `the copy face is aria-hidden everywhere (${rest.hiddenCopies}/${rest.copies})` });
  const aria = r.rest?.inspect || {};
  const names = (t) => [...(t || '').matchAll(/link "([^"]*)"/g)].map((m) => m[1]);
  out.push({ ok: names(aria.nav).join('|') === 'Films|Studio|Journal|Contact', message: `ARIA snapshot: each nav link has its label once (${names(aria.nav).join(', ')})` });
  out.push({ ok: names(aria.films).join('|') === 'The Lantern Keeper|Moth Season|Paper Harbour|Seven Small Winters|The Last Kiln', message: `ARIA snapshot: letter-built links read as words, not letters (${names(aria.films).join(', ')})` });
  out.push({ ok: names(aria.footer).join('|') === 'Write to the studio|Showreel|Press kit', message: `ARIA snapshot: footer links single (${names(aria.footer).join(', ')})` });

  const h = p('hover').cells || [];
  const hl = r.hover?.inspect?.layers || {};
  out.push({ ok: h[1] && near(h[1].deg, 90, 0.5) && Math.abs(h[1].m22) < 0.01 && near(h[1].m23, 1, 0.01) && h[1].ts === 'preserve-3d' && h[1].nextVis === 'visible' && h[1].duration === '0.4s', message: `hover: the second cell becomes a prism (${h[1]?.ts}, copy ${h[1]?.nextVis}) and turns a quarter about X (${h[1]?.deg}°, m22 ${h[1]?.m22}, m23 ${h[1]?.m23}) on the routine band (${h[1]?.duration})` });
  out.push({ ok: h[1] && sameBox(h[1].next, h[1].link) && h[1].front.h <= 2, message: `hover: the copy now sits exactly where the label was (${JSON.stringify(h[1]?.next)} vs ${JSON.stringify(h[1]?.link)}), the label is edge-on (${h[1]?.front.h}px)` });
  out.push({ ok: hl.threeD > 0, message: `hover: the turning prism is composited in 3D while it turns (${hl.threeD} 3D layers), so the rest count above is a real reading` });
  out.push({ ok: [0, 2, 3].every((i) => h[i]?.deg === 0 && h[i]?.none && h[i]?.li?.opacity === '0.66') && h[1]?.li?.opacity === '1', message: `hover: the other three cells stay flat and dim to .66 (${h.map((c) => c.li?.opacity).join(', ')})` });
  const lv = p('leaving').cells?.[1];
  out.push({ ok: lv && lv.deg > 0.5 && lv.deg < 45 && lv.ts === 'preserve-3d' && lv.nextVis === 'visible', message: `leaving, 100 ms into the turn back: still a prism (${lv?.ts}, copy ${lv?.nextVis}) at ${lv?.deg}°` });
  const le = p('leave');
  const ll = r.leave?.inspect?.layers || {};
  out.push({ ok: (le.cells || []).every((c) => c.none && c.ts === 'flat' && c.li?.opacity === '1') && le.shownCopies === 0 && ll.threeD === 0, message: `leave: every cell is flat again (${(le.cells || []).map((c) => c.ts).join(', ')}), undimmed (${(le.cells || []).map((c) => c.li?.opacity).join(', ')}), no copy shown, ${ll.threeD} 3D layers` });

  const f = p('focus');
  const px = r.focus?.inspect || {};
  out.push({ ok: f.focused === 'Films' && near(f.cells?.[0]?.deg, 90, 0.5) && sameBox(f.cells[0].next, f.cells[0].link), message: `keyboard: Tab to "${f.focused}" turns it like hover (${f.cells?.[0]?.deg}°)` });
  out.push({ ok: f.ring && f.ring.content !== 'none' && f.ring.width === '2px' && f.ring.color === f.ground && f.ring.z === '1', message: `keyboard: a 2 px ring in the paper colour above the box (${JSON.stringify(f.ring)})` });
  out.push({ ok: close(px.ring || [], rgb(f.ground)) && close(px.face || [], INK), message: `keyboard: the ring is painted over the turned face (pixel on the ring ${px.ring}, 5 px inside it ${px.face})` });
  const fh = p('focus-hover').cells || [];
  out.push({ ok: fh.map((c) => c.li?.opacity).join() === '1,1,0.66,0.66' && near(fh[0]?.deg, 90, 0.5) && near(fh[1]?.deg, 90, 0.5), message: `keyboard focus on Films, pointer on Studio: both turned, the focused cell never dimmed (${fh.map((c) => c.li?.opacity).join(', ')})` });

  const t = p('turning');
  const degs = (t.film1 || []).map((x) => x.deg);
  const monotone = degs.every((d, i) => i === 0 || d <= degs[i - 1] + 0.1);
  const mid = degs.filter((d) => d > 10 && d < 80).length;
  out.push({ ok: near(t.cells?.[1]?.deg, 45, 15) && degs.length === 16 && degs[0] > 80 && monotone && degs.at(-1) === 0 && mid >= 5, message: `frame: the Studio cell is at ${t.cells?.[1]?.deg}°, and the title's letters run as a wave (${degs.join(', ')}°; ${mid} between 10° and 80°)` });
  const half = (t.film1 || []).find((x) => x.deg > 30 && x.deg < 60);
  out.push({ ok: !!half && !close(rgb(half.frontColor), INK, 6) && !close(rgb(half.nextColor), ACCENT, 6) && t.cells?.[1]?.frontBg !== 'rgba(0, 0, 0, 0)', message: `frame: the faces are shaded by the turn (a letter at ${half?.deg}°: label ${half?.frontColor}, copy ${half?.nextColor}; the cell's label face ${t.cells?.[1]?.frontBg})` });
  const f1 = t.film1 || [];
  const f2 = p('letters').film2 || [];
  out.push({ ok: f1.length === 16 && f1.every((x, i) => near(x.delay, i * 400 / 15, 0.5)) && f2.length === 10 && f2.every((x, i) => near(x.delay, i * 40, 0.5)) && [...f1, ...f2].every((x) => x.duration === 300), message: `letters: 300 ms each; 40 ms apart, or less so the wave spans at most 400 ms (16 letters: ${f1[1]?.delay?.toFixed(1)} ms; 10 letters: ${f2[1]?.delay} ms)` });
  out.push({ ok: (t.filmEnds || []).length === 5 && t.filmEnds.every((e) => e <= 700), message: `letters: every title has finished turning by 700 ms (${(t.filmEnds || []).join(', ')} ms)` });
  out.push({ ok: f2.length === 10 && f2.every((x) => near(x.deg, 90, 0.5)), message: `letters: every letter ends a quarter turn over (${f2.length} letters)` });

  const w = p('wrapped').footer || {};
  // Edge-on, the label is the box's top face seen at 1000 px: a sliver of 2d·d / (1000 + 2d) px (3.8 px at d = 45.7).
  const sliver = w.h ? Math.ceil((w.h * w.h / 2) / (1000 + w.h)) + 1 : 0;
  out.push({ ok: w.h >= 80 && near(w.depth, w.layoutH / 2, 0.01) && near(w.originZ, -w.depth, 0.05) && near(w.deg, 90, 0.5) && sameBox(w.next, w.link) && w.front.h <= sliver, message: `wrapped to two lines (${w.layoutH} px, re-measured when its column narrowed): depth ${w.depth}, axis at z ${w.originZ}; after the turn the copy sits exactly on the link (${JSON.stringify(w.next)} vs ${JSON.stringify(w.link)}) and the label is edge-on (${w.front?.h} ≤ ${sliver} px)` });

  const rt = p('rtl');
  const xs = (rt.film1 || []).map((x) => x.x);
  out.push({ ok: rt.dir === 'rtl' && xs.length === 16 && xs.every((x, i) => i === 0 || x > xs[i - 1]) && near(rt.filmRight, rt.listRight, 2) && (rt.cells || []).every((c) => c.none && c.li?.opacity === '1'), message: `right-to-left page: the title's letters still run left to right (${xs.slice(0, 4).join(', ')}…), the title sits at the start edge (${rt.filmRight} vs ${rt.listRight}), the nav at rest` });
  const rh = p('rm-hover').cells || [];
  out.push({ ok: s('rm-hover').swap && !s('rm-hover').turn && rh.every((c) => c.none && c.ts === 'flat') && !/transform/.test(rh[1]?.property || ''), message: `reduced motion: no box is transformed or 3D and nothing transitions a transform (${rh.map((c) => (c.none ? 'none' : c.deg)).join(', ')})` });
  out.push({ ok: rh[1]?.frontOpacity === '0' && rh[1]?.nextOpacity === '1' && rh[1]?.nextVis === 'visible' && rh[1]?.nextBg !== rh[1]?.frontBg && sameBox(rh[1]?.next, rh[1]?.link), message: `reduced motion: hover swaps the faces in place by colour (front ${rh[1]?.frontOpacity}, copy ${rh[1]?.nextOpacity}, ${rh[1]?.nextBg} over ${rh[1]?.frontBg})` });
  const rf = p('rm-focus');
  out.push({ ok: rf.focused === 'Films' && rf.cells?.[0]?.nextOpacity === '1' && rf.cells[0].none, message: `reduced motion: keyboard focus swaps too, unturned (${rf.focused})` });
  const st = p('static').cells || [];
  out.push({ ok: s('static').motion === 'static' && s('static').swap && st[1]?.none && st[1]?.frontOpacity === '0' && st[1]?.nextOpacity === '1' && [0, 2, 3].every((i) => st[i]?.li?.opacity === '0.66' && st[i]?.li?.duration === '0s'), message: `static (data-motion set after load): 60 ms after the hover the faces have cut (front ${st[1]?.frontOpacity}, copy ${st[1]?.nextOpacity}) and the siblings are already dimmed (${st.map((c) => `${c.li?.opacity}/${c.li?.duration}`).join(', ')})` });

  const m = p('mobile');
  out.push({ ok: (m.cells || []).every((c) => c.none && c.ts === 'flat') && m.overflowX <= 0 && m.navRight <= m.viewport, message: `touch: no hover, so no turn (${(m.cells || []).map((c) => (c.none ? 'flat' : c.deg)).join(', ')}); the nav fits (${m.navRight} ≤ ${m.viewport}), no overflow` });
  out.push({ ok: (m.cells || []).every((c) => c.h === 56 && near(c.depth, c.layoutH / 2, 0.01) && near(c.depth, 28, 0.01)) && (m.targets || []).length === 12 && m.targets.every((x) => x >= 44), message: `phone: the cells re-measured at 56 px (depth ${(m.cells || []).map((c) => c.depth).join(', ')}); every prism link is at least 44 px tall (${(m.targets || []).join(', ')})` });
  const mp = p('mobile-press').cells || [];
  // Chromium applies :active on any press; iOS Safari only once a touch handler exists, so check that one is set.
  out.push({ ok: mp[2]?.none && mp[2]?.frontBg === 'rgb(34, 18, 26)' && mp[2]?.frontColor !== mp[0]?.frontColor && p('mobile-press').touchHandler === true, message: `touch: a press fills the label at once (${mp[2]?.frontBg}), still flat; a document touch handler is set for iOS Safari (${p('mobile-press').touchHandler})` });

  const fc = r.forced?.inspect || {};
  out.push({ ok: fc.focused === 'Films' && fc.transform === 'none' && fc.frontTransform === 'none' && fc.nextDisplay === 'none' && fc.letters === true, message: `forced colours: the focused cell shows its plain label (box ${fc.transform}, copy ${fc.nextDisplay}), no letter is turned` });
  return out;
}
