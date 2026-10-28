// The close's picture: bar width follows the footage's tone cell by cell, the key cuts clean, glyphs are a different
// weave of the same tones, the levels develop with the scroll while the picture is on screen, the footage runs through
// <video>, and the reduced tiers draw one still. Nothing is allocated at the top of the page.
const ready = { type: 'waitFor', fn: 'window.__dither?.ready === true' };
const freeze = { type: 'waitFor', fn: 'window.__dither.freeze() === true' };
const bottom = { type: 'waitFor', fn: '(window.scrollTo(0, document.body.scrollHeight), true)' };
export const states = [
  { name: 'top', scroll: 0, settle: 600 },
  { name: 'bars', scroll: 1, settle: 900, actions: [bottom, ready, freeze] },
  { name: 'glyphs', scroll: 1, settle: 900, actions: [bottom, ready, { type: 'click', selector: '[data-mode="glyphs"]' }, freeze] },
  { name: 'live', scroll: 1, settle: 2600, actions: [bottom, ready] },
  // Mid-develop with a real frame: a layer must have uploaded before the probe reads it back.
  { name: 'developing', settle: 500, actions: [bottom, ready, { type: 'waitFor', fn: 'window.__dither.seek(0.3) === true' }, { type: 'waitFor', fn: 'window.__awards.state().uploads > 0' }, { type: 'wait', ms: 400 }] },
  { name: 'paused', scroll: 1, settle: 1200, actions: [bottom, ready, { type: 'click', selector: '[data-pause]' }] },
  { name: 'reduced', reducedMotion: true, scroll: 1, settle: 900, actions: [bottom, ready] },
  // A lost context: the canvas goes and so do the controls that only act on it.
  { name: 'lost', scroll: 1, settle: 600, actions: [bottom, ready, { type: 'waitFor', fn: "(document.querySelector('[data-gl]').getContext('webgl').getExtension('WEBGL_lose_context').loseContext(), true)" }, { type: 'wait', ms: 300 }] },
  { name: 'mobile', viewport: 'mobile', scroll: 1, settle: 900, actions: [bottom, ready, freeze] },
];

export async function probe() {
  const s0 = window.__awards.state();
  if (!window.__dither?.ready || !s0.gl) return { s0 };
  const m = window.__dither.measure('ridge');
  // A clear-ground layer: part-covered pixels must take ink by their cover, with no ground colour mixed in.
  const reeds = window.__dither.measure('reeds');
  // Tokens in other CSS colour syntaxes read as the colour they name, not as the hex-only fallback.
  const scene = document.querySelector('[data-scene]');
  scene.style.setProperty('--ink', 'rgb(255 128 0)');
  scene.style.setProperty('--ground', 'hsl(120 100% 25%)');
  const parsed = window.__dither.colours();
  scene.style.removeProperty('--ink');
  scene.style.removeProperty('--ground');
  // Frames rendered across half a second: the paused and reduced pages must not keep drawing.
  const r0 = window.__awards.state().renders;
  await new Promise((r) => setTimeout(r, 500));
  return { m, reeds, parsed, r0, r1: window.__awards.state().renders };
}

export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const pr = (n) => r[n]?.probe || {};
  const out = [];
  const t = st('top');
  out.push({ ok: t.gl === false && t.renders === 0 && t.canvasShown === false && t.pauseShown === false && t.modeShown === false, message: `top: nothing allocated a page away from the close (gl ${t.gl}, ${t.renders} renders), no controls without the picture` });

  const b = pr('bars').m || {};
  out.push({ ok: st('bars').gl === true && st('bars').canvasAriaHidden && b.cells > 40 && b.correlation > 0.85, message: `bars: ink share follows the footage's tone over ${b.cells} cells (r = ${b.correlation})` });
  out.push({ ok: b.keyedCells > 10 && b.keyedClear === b.keyedCells, message: `bars: the key cuts clean (${b.keyedClear} of ${b.keyedCells} black cells transparent)` });
  out.push({ ok: b.sameRowShare > 0.95, message: `bars: each cell is one vertical bar (${b.sameRowShare} of inked cells the same in every row)` });
  const rb = pr('bars').reeds || {};
  out.push({ ok: rb.cells > 20 && rb.correlation > 0.7 && rb.partial > 100 && rb.leak <= 4, message: `bars: a clear-ground layer blends by cover (reeds: ${rb.partial} part-covered pixels, largest error ${rb.leak} of 255; r = ${rb.correlation} over ${rb.cells} cells)` });
  const pc = pr('bars').parsed || {};
  const near = (a, e) => Array.isArray(a) && a.every((v, i) => Math.abs(v - e[i]) < 0.01);
  out.push({ ok: near(pc.ink, [1, 128 / 255, 0]) && near(pc.ground, [0, 0.5, 0]), message: `bars: rgb() and hsl() tokens parse (ink ${JSON.stringify(pc.ink?.map((v) => +v.toFixed(3)))}, ground ${JSON.stringify(pc.ground?.map((v) => +v.toFixed(3)))})` });

  const g = pr('glyphs').m || {};
  out.push({ ok: st('glyphs').mode === 'glyphs' && g.cells > 40 && g.correlation > 0.6 && g.sameRowShare < 0.5 && g.rows !== b.rows, message: `glyphs: a glyph ramp of the same tones (r = ${g.correlation}, ${g.sameRowShare} of inked cells the same in every row, ${g.cols}×${g.rows} cells vs ${b.cols}×${b.rows})` });

  const lv = st('live'), lp = pr('live');
  out.push({ ok: lv.source === 'video' && lv.videoFrames > 10 && lv.running === true && lv.uploads > 6 && lp.r1 > lp.r0, message: `live: footage arrives as <video> frames (${lv.videoFrames} frames, ${lv.uploads} uploads) and the close keeps rendering (${lp.r0} → ${lp.r1})` });
  out.push({ ok: lv.develop === 1 && lv.pauseShown === true && lv.modeShown === true, message: `live: fully developed at the bottom (${lv.develop}); pause and texture controls shown` });

  // A real partial frame, on screen: drawn cells, some ink but clearly less than developed, still following the tone.
  const dv = st('developing'), dp = pr('developing').m || {};
  out.push({ ok: dv.visible === true && dv.develop > 0.05 && dv.develop < 0.6 && dp.cells > 40 && dp.inView > 0.3 && dp.meanInk > 0.02 && dp.meanInk < b.meanInk * 0.85 && dp.correlation > 0.8, message: `developing: levels part-way (${dv.develop}) with ${Math.round((dp.inView ?? 0) * 100)} % of the measured ridge cells on screen; ink ${dp.meanInk} vs ${b.meanInk} developed, r = ${dp.correlation}` });

  const pz = st('paused'), pp = pr('paused');
  out.push({ ok: pz.paused === true && pz.running === false && pp.r1 === pp.r0, message: `paused: the footage stops and nothing re-renders (${pp.r0} → ${pp.r1})` });

  const rd = st('reduced'), rp = pr('reduced');
  out.push({ ok: rd.motion === 'reduced' && rd.running === false && rd.source === 'canvas' && rd.develop === 1 && rd.pauseShown === false && rd.modeShown === true && rp.r1 === rp.r0 && (rp.m?.correlation ?? 0) > 0.85, message: `reduced: one developed still from the canvases, no clock, no pause control (${rp.r0} → ${rp.r1} renders, r = ${rp.m?.correlation})` });

  const lo = st('lost');
  out.push({ ok: lo.gl === false && lo.canvasShown === false && lo.pauseShown === false && lo.modeShown === false, message: `lost context: the canvas and its controls are gone (canvas ${lo.canvasShown}, pause ${lo.pauseShown}, texture ${lo.modeShown})` });

  const mb = pr('mobile').m || {};
  out.push({ ok: st('mobile').gl === true && mb.cells > 20 && mb.correlation > 0.8, message: `mobile: ${mb.cols}×${mb.rows} ridge cells, r = ${mb.correlation}` });
  return out;
}
