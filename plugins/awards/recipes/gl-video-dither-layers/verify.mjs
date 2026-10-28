// The close's picture: bar width follows the footage's tone cell by cell, the key cuts clean, glyphs are a different
// weave of the same tones, the levels develop with the scroll, the footage runs through <video>, and the reduced
// tiers draw one still. Nothing is allocated at the top of the page.
const ready = { type: 'waitFor', fn: 'window.__dither?.ready === true' };
const freeze = { type: 'waitFor', fn: 'window.__dither.freeze() === true' };
export const states = [
  { name: 'top', scroll: 0, settle: 600 },
  { name: 'bars', scroll: 1, settle: 900, actions: [{ type: 'waitFor', fn: '(window.scrollTo(0, document.body.scrollHeight), true)' }, ready, freeze] },
  { name: 'glyphs', scroll: 1, settle: 900, actions: [{ type: 'waitFor', fn: '(window.scrollTo(0, document.body.scrollHeight), true)' }, ready, { type: 'click', selector: '[data-mode="glyphs"]' }, freeze] },
  { name: 'live', scroll: 1, settle: 2600, actions: [{ type: 'waitFor', fn: '(window.scrollTo(0, document.body.scrollHeight), true)' }, ready] },
  { name: 'developing', settle: 500, actions: [{ type: 'waitFor', fn: '(window.scrollTo(0, document.body.scrollHeight), true)' }, ready, { type: 'waitFor', fn: 'window.__dither.seek(0.3) === true' }, { type: 'wait', ms: 400 }] },
  { name: 'paused', scroll: 1, settle: 1200, actions: [{ type: 'waitFor', fn: '(window.scrollTo(0, document.body.scrollHeight), true)' }, ready, { type: 'click', selector: '[data-pause]' }] },
  { name: 'reduced', reducedMotion: true, scroll: 1, settle: 900, actions: [{ type: 'waitFor', fn: '(window.scrollTo(0, document.body.scrollHeight), true)' }, ready] },
  { name: 'mobile', viewport: 'mobile', scroll: 1, settle: 900, actions: [{ type: 'waitFor', fn: '(window.scrollTo(0, document.body.scrollHeight), true)' }, ready, freeze] },
];

export async function probe() {
  const s0 = window.__awards.state();
  if (!window.__dither?.ready || !s0.gl) return { s0 };
  const m = window.__dither.measure('ridge');
  // Frames rendered across half a second: the paused and reduced pages must not keep drawing.
  const r0 = window.__awards.state().renders;
  await new Promise((r) => setTimeout(r, 500));
  return { m, r0, r1: window.__awards.state().renders };
}

export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const pr = (n) => r[n]?.probe || {};
  const out = [];
  out.push({ ok: st('top').gl === false && st('top').renders === 0 && st('top').canvasShown === false, message: `top: nothing allocated a page away from the close (gl ${st('top').gl}, ${st('top').renders} renders)` });

  const b = pr('bars').m || {};
  out.push({ ok: st('bars').gl === true && st('bars').canvasAriaHidden && b.cells > 40 && b.correlation > 0.85, message: `bars: ink share follows the footage's tone over ${b.cells} cells (r = ${b.correlation})` });
  out.push({ ok: b.keyedCells > 10 && b.keyedClear === b.keyedCells, message: `bars: the key cuts clean (${b.keyedClear} of ${b.keyedCells} black cells transparent)` });
  out.push({ ok: b.sameRowShare > 0.95, message: `bars: each cell is one vertical bar (${b.sameRowShare} of inked cells the same in every row)` });

  const g = pr('glyphs').m || {};
  out.push({ ok: st('glyphs').mode === 'glyphs' && g.cells > 40 && g.correlation > 0.6 && g.sameRowShare < 0.5 && g.rows !== b.rows, message: `glyphs: a glyph ramp of the same tones (r = ${g.correlation}, ${g.sameRowShare} of inked cells the same in every row, ${g.cols}×${g.rows} cells vs ${b.cols}×${b.rows})` });

  const lv = st('live'), lp = pr('live');
  out.push({ ok: lv.source === 'video' && lv.videoFrames > 10 && lv.running === true && lv.uploads > 6 && lp.r1 > lp.r0, message: `live: footage arrives as <video> frames (${lv.videoFrames} frames, ${lv.uploads} uploads) and the close keeps rendering (${lp.r0} → ${lp.r1})` });
  out.push({ ok: lv.develop === 1 && lv.pauseShown === true, message: `live: fully developed at the bottom (${lv.develop}); pause control shown` });

  const dv = st('developing'), dp = pr('developing').m || {};
  out.push({ ok: dv.develop > 0.05 && dv.develop < 0.6 && dp.meanInk < b.meanInk * 0.85, message: `developing: levels part-way (${dv.develop}), less ink than the developed frame (${dp.meanInk} vs ${b.meanInk})` });

  const pz = st('paused'), pp = pr('paused');
  out.push({ ok: pz.paused === true && pz.running === false && pp.r1 === pp.r0, message: `paused: the footage stops and nothing re-renders (${pp.r0} → ${pp.r1})` });

  const rd = st('reduced'), rp = pr('reduced');
  out.push({ ok: rd.motion === 'reduced' && rd.running === false && rd.source === 'canvas' && rd.develop === 1 && rd.pauseShown === false && rp.r1 === rp.r0 && (rp.m?.correlation ?? 0) > 0.85, message: `reduced: one developed still from the canvases, no clock, no pause control (${rp.r0} → ${rp.r1} renders, r = ${rp.m?.correlation})` });

  const mb = pr('mobile').m || {};
  out.push({ ok: st('mobile').gl === true && mb.cells > 20 && mb.correlation > 0.8, message: `mobile: ${mb.cols}×${mb.rows} ridge cells, r = ${mb.correlation}` });
  return out;
}
