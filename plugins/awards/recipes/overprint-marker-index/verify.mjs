// One multiply marker per index: it lands exactly on the hovered, focused or read row, never between two rows; the
// plate under it is overprinted (pixels), the words over it turn to the paper colour; sorting re-orders, announces
// and steps the rows back in; the focus ring stays visible when the mouse moves the marker off the focused row; touch
// screens get a reading-line marker that a tapped link does not freeze; reduced motion keeps the cut, drops the blink.
const row = (n) => `.row:nth-child(${n}) .row__link`;
// Installed before a second hover: logs the marker's offset on every frame, so a slide would leave in-between values.
const sampler = `(() => {
  const m = document.querySelector('[data-marker]'); const ys = window.__ys = [];
  const tick = () => { ys.push(Math.round(new DOMMatrixReadOnly(getComputedStyle(m).transform).m42)); if (ys.length < 45) requestAnimationFrame(tick); };
  requestAnimationFrame(tick); return true;
})()`;
export const states = [
  { name: 'top', scroll: 0, settle: 500 },
  { name: 'hover', settle: 500, actions: [{ type: 'hover', selector: row(3) }, { type: 'wait', ms: 400 }] },
  { name: 'jump', settle: 500, actions: [{ type: 'hover', selector: row(2) }, { type: 'wait', ms: 200 }, { type: 'waitFor', fn: sampler }, { type: 'hover', selector: row(11) }, { type: 'wait', ms: 900 }] },
  { name: 'leave', settle: 500, actions: [{ type: 'hover', selector: row(3) }, { type: 'wait', ms: 200 }, { type: 'move', x: 6, y: 6, steps: 2 }, { type: 'wait', ms: 300 }] },
  { name: 'focus', settle: 500, actions: [{ type: 'focus', selector: row(1) }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'wait', ms: 300 }] },
  // Keyboard focus on the third row, then the mouse moves the marker to the sixth: the ring must stay visible off it.
  { name: 'focus-hover', settle: 500, actions: [{ type: 'focus', selector: row(1) }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'wait', ms: 200 }, { type: 'hover', selector: row(6) }, { type: 'wait', ms: 300 }] },
  { name: 'sort-title', settle: 500, actions: [{ type: 'click', selector: '[data-sort="title"]' }, { type: 'wait', ms: 900 }] },
  { name: 'sort-oldest', settle: 500, actions: [{ type: 'click', selector: '[data-sort="year"]' }, { type: 'wait', ms: 900 }] },
  { name: 'rm-hover', reducedMotion: true, settle: 500, actions: [{ type: 'hover', selector: row(4) }, { type: 'wait', ms: 300 }] },
  { name: 'mobile', viewport: 'mobile', scroll: 0.45, settle: 600 },
  // A tap leaves focus on the row's link (not :focus-visible); the reading line must keep marking rows as the page scrolls.
  { name: 'mobile-tap', viewport: 'mobile', settle: 600, actions: [{ type: 'waitFor', fn: '(() => { window.__awards.scrollTo(0.45); return true; })()' }, { type: 'wait', ms: 400 }, { type: 'click', selector: '.row[data-active] .row__link' }, { type: 'wait', ms: 200 }, { type: 'waitFor', fn: '(() => { window.__awards.scrollTo(0.6); return true; })()' }, { type: 'wait', ms: 500 }] },
];

export function probe() {
  const marker = document.querySelector('[data-marker]');
  const rows = [...document.querySelectorAll('.row')];
  const active = document.querySelector('.row[data-active]');
  const line = innerHeight * 0.4;
  const atLine = rows.find((r) => { const b = r.getBoundingClientRect(); return b.top <= line && b.bottom > line; });
  const ms = getComputedStyle(marker);
  return {
    blend: ms.mixBlendMode,
    transition: ms.transitionDuration,
    markerZ: Number(ms.zIndex),
    plateZ: active ? Number(getComputedStyle(active.querySelector('.row__plate')).zIndex) : null,
    textZ: active ? Number(getComputedStyle(active.querySelector('.row__title')).zIndex) : null,
    activeColour: active ? getComputedStyle(active.querySelector('.row__title')).color : null,
    ground: getComputedStyle(document.body).backgroundColor,
    rowTops: rows.map((r) => r.offsetTop),
    ys: window.__ys || null,
    opacities: rows.map((r) => Number(getComputedStyle(r).opacity)),
    atLine: atLine?.dataset.title ?? null,
    focusedTitle: document.activeElement?.closest?.('.row')?.dataset.title ?? null,
    // The focused row's ring (drawn by ::after) and the ink, to tell a paper ring from an ink one.
    ring: document.activeElement?.matches?.('.row__link:focus-visible') ? getComputedStyle(document.activeElement, '::after').borderTopColor : null,
    ink: getComputedStyle(document.body).color,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side, on the hover state only: read two real pixels, the plate under the marker and a plate that is not.
export async function inspect(page, st) {
  if (st.name !== 'hover') return null;
  const pts = await page.evaluate(() => {
    const c = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) }; };
    return { on: c(document.querySelector('.row[data-active] .row__plate')), off: c(document.querySelector('.row:not([data-active]) .row__plate')) };
  });
  const read = async ({ x, y }) => {
    const png = await page.screenshot({ clip: { x, y, width: 1, height: 1 } });
    return page.evaluate(async (b64) => {
      const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
      const cv = new OffscreenCanvas(1, 1); const g = cv.getContext('2d'); g.drawImage(bmp, 0, 0);
      return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3);
    }, png.toString('base64'));
  };
  return { on: await read(pts.on), off: await read(pts.off) };
}

export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const pr = (n) => r[n]?.probe || {};
  const out = [];
  out.push({ ok: st('top').on === false && st('top').active === -1, message: 'top: no row marked before anything points at the list' });
  const h = st('hover'), hp = pr('hover'), px = r.hover?.inspect || {};
  out.push({ ok: h.on && h.activeTitle === 'Orchard Reading Room' && h.markerY === h.activeTop && Math.abs(h.markerH - h.activeH) <= 1, message: `hover: the marker covers exactly the third row (y ${h.markerY} = ${h.activeTop}, h ${h.markerH} ≈ ${h.activeH})` });
  out.push({ ok: hp.blend === 'multiply' && hp.transition === '0s' && hp.plateZ < hp.markerZ && hp.markerZ < hp.textZ, message: `hover: multiply, no transition, plate (${hp.plateZ}) < marker (${hp.markerZ}) < words (${hp.textZ})` });
  out.push({ ok: hp.activeColour === hp.ground, message: `hover: the active row's words turn to the paper colour (${hp.activeColour} vs ${hp.ground})` });
  out.push({ ok: Array.isArray(px.on) && px.on[0] < 12 && px.on[2] > px.on[1] && px.off?.[0] > 60, message: `hover: the plate under the marker is overprinted (rgb ${px.on}) while a plate outside it keeps its colour (rgb ${px.off})` });
  const j = st('jump'), jp = pr('jump');
  const tops = new Set(jp.rowTops || []);
  out.push({ ok: j.activeTitle === 'Signal Box Cafe' && (jp.ys?.length ?? 0) > 20 && jp.ys.every((y) => tops.has(y)), message: `jump: every sampled frame sits exactly on a row (${[...new Set(jp.ys || [])].join(', ')}), ending on the eleventh` });
  out.push({ ok: (j.writes ?? 99) <= 6, message: `jump: the marker is written only when the row changes (${j.writes} writes)` });
  out.push({ ok: st('leave').on === false && st('leave').active === -1, message: 'leave: the mark clears when the pointer leaves the list' });
  const f = st('focus'), fp = pr('focus');
  out.push({ ok: f.mode === 'focus' && f.activeTitle === 'Orchard Reading Room' && fp.focusedTitle === f.activeTitle, message: `keyboard: Tab moves the mark with focus (${f.activeTitle})` });
  out.push({ ok: fp.ring === fp.ground, message: `keyboard: on the marked row the ring is in the paper colour (${fp.ring})` });
  const fh = st('focus-hover'), fhp = pr('focus-hover');
  out.push({ ok: fh.mode === 'pointer' && fh.activeTitle !== fhp.focusedTitle && fhp.focusedTitle === 'Orchard Reading Room' && fhp.ring === fhp.ink && fhp.ring !== fhp.ground, message: `keyboard + mouse: with the marker moved to ${fh.activeTitle}, the focused row (${fhp.focusedTitle}) keeps an ink ring (${fhp.ring} vs ground ${fhp.ground})` });
  const sorted = [...(st('sort-title').order || [])];
  out.push({ ok: sorted.length === 14 && sorted.every((t, i) => i === 0 || sorted[i - 1].localeCompare(t) <= 0) && st('sort-title').pressed === 'title' && /project, A to Z/.test(st('sort-title').status), message: `sort: by project A to Z, pressed and announced ("${st('sort-title').status}")` });
  out.push({ ok: (pr('sort-title').opacities || []).every((o) => o === 1), message: 'sort: every row stepped back in' });
  const yrs = st('sort-oldest').order || [];
  out.push({ ok: yrs[0] === 'Chapel Yard' && yrs[13] === 'Saltings Boathouse' && /oldest first/.test(st('sort-oldest').status), message: `sort: the year button pressed again flips to oldest first (${yrs[0]} … ${yrs[13]})` });
  const rm = st('rm-hover');
  out.push({ ok: rm.motion === 'reduced' && rm.on && rm.activeTitle === 'Weir Pavilion' && rm.blinks === 0, message: `reduced motion: the marker still cuts to the row, with no blink (${rm.activeTitle}, blinks ${rm.blinks})` });
  const m = st('mobile'), mp = pr('mobile');
  out.push({ ok: m.mode === 'reading' && m.on && m.activeTitle === mp.atLine && (mp.overflowX ?? 1) <= 0, message: `touch: the row crossing the reading line is marked (${m.activeTitle} / ${mp.atLine}), no sideways overflow` });
  const mt = st('mobile-tap'), mtp = pr('mobile-tap');
  out.push({ ok: mt.mode === 'reading' && mtp.atLine !== null && mt.activeTitle === mtp.atLine && mtp.focusedTitle !== null && mtp.focusedTitle !== mt.activeTitle, message: `touch: after a tap leaves focus on ${mtp.focusedTitle}, the reading line still marks the row it crosses (${mt.activeTitle} / ${mtp.atLine})` });
  return out;
}
