// Five scenes, four pooled clips, one WebGL context. A scene draws only on screen; a clip uploads at most once per new
// frame however many scenes show it; seasons swap by levels; the interlude is glyphs; reduced motion draws stills.
const ready = { type: 'waitFor', fn: 'window.__pool?.ready === true' };
const freeze = { type: 'waitFor', fn: 'window.__pool.freeze() === true' };
const to = (name) => ({ type: 'waitFor', fn: `(document.querySelector('[data-scene="${name}"]').scrollIntoView({ block: 'center' }), true)` });
const wait = (ms) => ({ type: 'wait', ms });

export const states = [
  { name: 'top', settle: 900, actions: [ready, wait(400), freeze] },
  { name: 'tour', settle: 900, actions: [ready, to('weather'), wait(900), to('seasons'), wait(900), to('interlude'), wait(900), to('close'), wait(1200)] },
  { name: 'seasons', settle: 600, actions: [ready, to('seasons'), wait(700), freeze, { type: 'click', selector: '[data-season="winter"]' }, wait(1700)] },
  { name: 'interlude', settle: 600, actions: [ready, to('interlude'), wait(700), freeze] },
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
  const d0 = window.__awards.state().draws;
  await new Promise((r) => setTimeout(r, 700));
  out.d0 = d0;
  out.d1 = window.__awards.state().draws;
  return out;
}

export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const pr = (n) => r[n]?.probe || {};
  const out = [];
  const t = st('top');
  out.push({ ok: t.gl === true && t.contexts === 1 && t.canvasesAriaHidden && t.draws?.hero >= 1 && t.draws?.close === 0 && (pr('top').hero?.share ?? 0) > 0.03, message: `top: one context (${t.contexts}); the hero drawn (${t.draws?.hero}, ink ${pr('top').hero?.share}), the close not yet (${t.draws?.close})` });

  const tr = st('tour'), tp = pr('tour');
  const all = tr.draws && Object.values(tr.draws).every((n) => n >= 1);
  out.push({ ok: tr.contexts === 1 && all && tr.scenes === 5 && tr.textures === 4 && tr.layerSlots === 12, message: `tour: every scene drawn (${JSON.stringify(tr.draws)}) from one context, ${tr.textures} pooled textures for ${tr.layerSlots} layer slots` });
  const over = Object.keys(tr.uploads || {}).filter((c) => tr.uploads[c] > (tr.versions?.[c] ?? 0) + 2);
  out.push({ ok: !over.length && Object.values(tr.uploads || {}).some((n) => n > 3), message: `tour: no clip uploaded more often than it has frames (${JSON.stringify(tr.uploads)} vs ${JSON.stringify(tr.versions)})` });
  out.push({ ok: tp.d1?.hero === tp.d0?.hero && tp.d1?.close > tp.d0?.close && !tr.running?.includes('reeds') && tr.running?.includes('ridge'), message: `tour: off-screen scenes hold (hero ${tp.d0?.hero} → ${tp.d1?.hero}) while the close plays (${tp.d0?.close} → ${tp.d1?.close}); running clips ${JSON.stringify(tr.running)}` });

  const sp = pr('seasons');
  const changed = sp.summer && sp.winter ? sp.summer.grid.filter((v, i) => Math.abs(v - sp.winter.grid[i]) > 0.04).length : 0;
  out.push({ ok: st('seasons').season === 'winter' && changed >= 4 && sp.winter.share > 0.02 && sp.summer.share > 0.02, message: `seasons: the button swaps the picture by levels (${changed} of 18 regions changed; ink ${sp.summer?.share} summer, ${sp.winter?.share} winter)` });

  out.push({ ok: (pr('interlude').interlude?.share ?? 0) > 0.01, message: `interlude: the glyph scene carries ink (${pr('interlude').interlude?.share})` });

  const rd = st('reduced'), rp = pr('reduced');
  out.push({ ok: rd.motion === 'reduced' && rd.contexts === 1 && rd.running?.length === 0 && rd.draws?.hero >= 1 && rd.draws?.hero <= 2 && rp.d1?.hero === rp.d0?.hero && (rp.hero?.share ?? 0) > 0.03, message: `reduced: one still per scene (hero ${rp.d0?.hero} → ${rp.d1?.hero}), no clip running` });

  const mb = st('mobile');
  out.push({ ok: mb.contexts === 1 && (pr('mobile').hero?.share ?? 0) > 0.02, message: `mobile: one context, the hero drawn (ink ${pr('mobile').hero?.share})` });
  return out;
}
