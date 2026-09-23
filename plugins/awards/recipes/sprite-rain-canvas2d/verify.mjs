const trigger = (ms) => [{ type: 'click', selector: '[data-trigger]' }, { type: 'wait', ms }];

export const states = [
  { name: 'top', settle: 400 },
  { name: 'rain', settle: 50, actions: trigger(500) },
  { name: 'after', settle: 50, actions: trigger(4500) },
  { name: 'rm', reducedMotion: true, settle: 50, actions: trigger(500) },
  { name: 'mobile', viewport: 'mobile', settle: 50, actions: trigger(500) },
];

// Sample the same sprites two frames apart: every one still on screen must have moved down.
export async function probe() {
  const a = window.__awards.state();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const b = window.__awards.state();
  const pairs = a.sprites.map((s) => [s, b.sprites.find((q) => q.id === s.id)]).filter(([, q]) => q);
  const c = document.querySelector('[data-rain]');
  return {
    pairs: pairs.length,
    falling: pairs.filter(([s, q]) => q.y > s.y).length,
    canvasHidden: c.getAttribute('aria-hidden') === 'true' && getComputedStyle(c).pointerEvents === 'none',
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  };
}

export function assert(r) {
  const out = [];
  const s = (k) => r[k].state ?? {};
  const p = (k) => r[k].probe ?? {};

  out.push({ ok: s('top').spawned === 0 && s('top').running === false && [32, 80, 160].includes(s('top').budget), message: `idle until triggered, ticker off (tier ${s('top').tier}, budget ${s('top').budget})` });
  out.push({ ok: p('top').canvasHidden === true, message: 'canvas is aria-hidden and ignores the pointer' });

  const rain = s('rain');
  out.push({ ok: p('rain').pairs >= 3 && p('rain').falling === p('rain').pairs, message: `after the trigger every tracked sprite's y increases frame to frame (${p('rain').falling}/${p('rain').pairs})` });
  out.push({ ok: rain.running === true && rain.live > 0 && rain.maxLive <= rain.budget, message: `live count stays under the tier budget (live ${rain.live}, peak ${rain.maxLive}, budget ${rain.budget})` });

  const after = s('after');
  out.push({ ok: after.live === 0 && after.spawned > 0 && after.removed === after.spawned && after.maxLive <= after.budget, message: `sprites are removed once off-screen (${after.removed}/${after.spawned} removed, peak ${after.maxLive})` });
  out.push({ ok: after.running === false, message: 'the ticker callback stops once no sprites remain' });

  const rm = s('rm');
  out.push({ ok: rm.motion === 'reduced' && rm.spawned === 0 && rm.running === false && /reduced motion/i.test(rm.status ?? ''), message: `reduced motion: nothing spawns, the trigger says why ("${rm.status}")` });

  const mb = s('mobile');
  out.push({ ok: p('mobile').pairs >= 1 && p('mobile').falling === p('mobile').pairs && mb.maxLive <= mb.budget && p('mobile').overflow === false, message: `mobile: rain falls within budget (peak ${mb.maxLive}/${mb.budget}), no horizontal overflow` });
  return out;
}
