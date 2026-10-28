// Five scenes, four pooled clips, one WebGL context. A scene draws only on screen; a clip uploads at most once per new
// frame however many scenes show it; seasons swap by levels; the interlude is glyphs; the pause stops every clip and
// loop; reduced motion draws stills.
const ready = { type: 'waitFor', fn: 'window.__pool?.ready === true' };
const freeze = { type: 'waitFor', fn: 'window.__pool.freeze() === true' };
const to = (name) => ({ type: 'waitFor', fn: `(document.querySelector('[data-scene="${name}"]').scrollIntoView({ block: 'center' }), true)` });
const wait = (ms) => ({ type: 'wait', ms });

export const states = [
  { name: 'top', settle: 900, actions: [ready, wait(400), freeze] },
  { name: 'tour', settle: 900, actions: [ready, to('weather'), wait(900), to('seasons'), wait(900), to('interlude'), wait(900), to('close'), wait(1200)] },
  { name: 'seasons', settle: 600, actions: [ready, to('seasons'), wait(700), freeze, { type: 'click', selector: '[data-season="winter"]' }, wait(1700)] },
  { name: 'interlude', settle: 600, actions: [ready, to('interlude'), wait(700), freeze] },
  // After the hero's arrival has developed, so only the clips and the flock loop are moving when the pause lands.
  { name: 'paused', settle: 900, actions: [ready, wait(1200), { type: 'click', selector: '[data-pause]' }, wait(300)] },
  { name: 'reduced', reducedMotion: true, settle: 900, actions: [ready] },
  { name: 'mobile', viewport: 'mobile', settle: 900, actions: [ready, wait(400), freeze] },
];

export async function probe() {
  const st = window.__awards.state();
  if (!window.__pool?.ready || !st.gl) return { st };
  const out = { hero: window.__pool.inkShare('hero') };
  if (st.visible.includes('seasons')) {
    out.winter = window.__pool.inkShare('seasons');
    window.__pool.setSeason('summer', true);
    out.summer = window.__pool.inkShare('seasons');
  }
  if (st.visible.includes('interlude')) out.interlude = window.__pool.inkShare('interlude');
  // Tokens in other CSS colour syntaxes read as the colour they name, not as the hex-only fallback.
  const el = document.querySelector('[data-scene="hero"]');
  el.style.setProperty('--ink', 'rgb(255 128 0)');
  el.style.setProperty('--ground', 'hsl(120 100% 25%)');
  out.parsed = window.__pool.colours(el);
  el.style.removeProperty('--ink');
  el.style.removeProperty('--ground');
  // Draws and clip frames across 700 ms; a paused page then resumes for another 700 ms.
  const d0 = window.__awards.state().draws, v0 = window.__awards.state().versions;
  await new Promise((r) => setTimeout(r, 700));
  Object.assign(out, { d0, v0, d1: window.__awards.state().draws, v1: window.__awards.state().versions });
  if (st.paused) {
    document.querySelector('[data-pause]').click();
    await new Promise((r) => setTimeout(r, 700));
    out.d2 = window.__awards.state().draws;
    out.resumed = window.__awards.state().running;
  }
  return out;
}

export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const pr = (n) => r[n]?.probe || {};
  const out = [];
  const t = st('top');
  out.push({ ok: t.gl === true && t.contexts === 1 && t.canvasesAriaHidden && t.draws?.hero >= 1 && t.draws?.close === 0 && (pr('top').hero?.share ?? 0) > 0.03, message: `top: one context (${t.contexts}); the hero drawn (${t.draws?.hero}, ink ${pr('top').hero?.share}), the close not yet (${t.draws?.close})` });
  const pc = pr('top').parsed || {};
  const near = (a, e) => Array.isArray(a) && a.every((v, i) => Math.abs(v - e[i]) < 0.01);
  out.push({ ok: near(pc.ink, [1, 128 / 255, 0]) && near(pc.ground, [0, 0.5, 0]), message: `top: rgb() and hsl() tokens parse (ink ${JSON.stringify(pc.ink?.map((v) => +v.toFixed(3)))}, ground ${JSON.stringify(pc.ground?.map((v) => +v.toFixed(3)))})` });
  out.push({ ok: t.pauseShown === true, message: `top: a pause control is shown in the full tier (${t.pauseShown})` });

  const tr = st('tour'), tp = pr('tour');
  const all = tr.draws && Object.values(tr.draws).every((n) => n >= 1);
  out.push({ ok: tr.contexts === 1 && all && tr.scenes === 5 && tr.textures === 4 && tr.layerSlots === 12, message: `tour: every scene drawn (${JSON.stringify(tr.draws)}) from one context, ${tr.textures} pooled textures for ${tr.layerSlots} layer slots` });
  const over = Object.keys(tr.uploads || {}).filter((c) => tr.uploads[c] > (tr.versions?.[c] ?? 0) + 2);
  out.push({ ok: !over.length && Object.values(tr.uploads || {}).some((n) => n > 3), message: `tour: no clip uploaded more often than it has frames (${JSON.stringify(tr.uploads)} vs ${JSON.stringify(tr.versions)})` });
  out.push({ ok: tp.d1?.hero === tp.d0?.hero && tp.d1?.close > tp.d0?.close && !tr.running?.includes('reeds') && tr.running?.includes('ridge'), message: `tour: off-screen scenes hold (hero ${tp.d0?.hero} → ${tp.d1?.hero}) while the close plays (${tp.d0?.close} → ${tp.d1?.close}); running clips ${JSON.stringify(tr.running)}` });

  const sp = pr('seasons');
  const changed = sp.summer && sp.winter ? sp.summer.grid.filter((v, i) => Math.abs(v - sp.winter.grid[i]) > 0.04).length : 0;
  out.push({ ok: st('seasons').season === 'winter' && changed >= 4 && sp.winter.share > 0.02 && sp.summer.share > 0.02, message: `seasons: the button swaps the picture by levels (${changed} of 18 regions changed; ink ${sp.summer?.share} summer, ${sp.winter?.share} winter)` });
  // Clear-ground bars: a part-covered pixel is ink at part opacity, never ink mixed with the ground colour.
  out.push({ ok: sp.winter?.partial > 1000 && sp.winter.leak <= 8, message: `seasons: part-covered bar pixels on a clear ground are pure ink (${sp.winter?.partial} pixels, largest error ${sp.winter?.leak} of 255)` });

  const il = pr('interlude').interlude || {};
  out.push({ ok: (il.share ?? 0) > 0.01 && il.partial > 50 && il.leak <= 8, message: `interlude: the glyph scene carries ink (${il.share}), its glyph edges pure ink (${il.partial} part-covered pixels, largest error ${il.leak})` });

  // Paused: no clip advances, no scene redraws; clicked again, the clips run and the hero redraws.
  const pz = st('paused'), pp = pr('paused');
  const held = pp.v0 && JSON.stringify(pp.v0) === JSON.stringify(pp.v1);
  out.push({ ok: pz.paused === true && pz.running?.length === 0 && (pz.versions?.ridge ?? 0) > 5 && held && pp.d1?.hero === pp.d0?.hero, message: `paused: clips stop (running ${JSON.stringify(pz.running)}, ridge frame ${pp.v0?.ridge} → ${pp.v1?.ridge}) and the hero stops drawing (${pp.d0?.hero} → ${pp.d1?.hero})` });
  out.push({ ok: pp.resumed?.includes('ridge') && pp.d2?.hero > pp.d1?.hero, message: `paused: pressed again, the clips run (${JSON.stringify(pp.resumed)}) and the hero redraws (${pp.d1?.hero} → ${pp.d2?.hero})` });

  const rd = st('reduced'), rp = pr('reduced');
  out.push({ ok: rd.motion === 'reduced' && rd.contexts === 1 && rd.running?.length === 0 && rd.draws?.hero >= 1 && rd.draws?.hero <= 2 && rp.d1?.hero === rp.d0?.hero && (rp.hero?.share ?? 0) > 0.03 && rd.pauseShown === false, message: `reduced: one still per scene (hero ${rp.d0?.hero} → ${rp.d1?.hero}), no clip running, no pause control (${rd.pauseShown})` });

  const mb = st('mobile');
  out.push({ ok: mb.contexts === 1 && (pr('mobile').hero?.share ?? 0) > 0.02, message: `mobile: one context, the hero drawn (ink ${pr('mobile').hero?.share})` });
  return out;
}
