// The probe samples what renders every 50 ms for 2 s: the page's index, the ring's computed stroke-dashoffset
// (1 = empty, 0 = full), which panel sits under the viewport centre, the active panel's top edge and scrollY.
const wheel = (dy, ms = 60) => [{ type: 'wheel', dx: 0, dy }, { type: 'wait', ms }];
const settled = { type: 'waitFor', fn: '!window.__awards.state().transitioning' };
const keys = (key, n, ms) => Array.from({ length: n }, () => [{ type: 'press', key }, { type: 'wait', ms }]).flat();
// A synthetic finger drag on the deck (touch events, as Observer listens for them on a touch device).
const swipe = (dy) => ({
  type: 'waitFor',
  fn: `((dy) => {
    const t = document.querySelector('[data-deck]');
    const at = (y) => new Touch({ identifier: 1, target: t, clientX: innerWidth / 2, clientY: y });
    const fire = (el, type, y, list) => el.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: list ? [at(y)] : [], changedTouches: [at(y)] }));
    const y0 = innerHeight * 0.6;
    fire(t, 'touchstart', y0, true);
    for (let i = 1; i <= 6; i++) fire(t, 'touchmove', y0 + (dy * i) / 6, true);
    fire(t, 'touchend', y0 + dy, false);
    return true;
  })(${dy})`,
});

export const states = [
  // Three inputs of 100 px: 300 of 500. The ring fills partly, the index holds, then the ring drains after 1 s idle.
  { name: 'partial', settle: 300, actions: [...wheel(100), ...wheel(100), ...wheel(100, 0)] },
  // Six inputs of 200 px: 1200 px, enough for two steps, but the lock after the first commit swallows the rest.
  { name: 'commit', settle: 300, actions: [...wheel(200, 40), ...wheel(200, 40), ...wheel(200, 40), ...wheel(200, 40), ...wheel(200, 40), ...wheel(200, 0)] },
  // At the first panel, backwards never fills; reversing drops the forward sum.
  { name: 'edge', settle: 300, actions: [...wheel(300), ...wheel(-300, 0)] },
  // Keyboard reaches every panel with the full travel.
  { name: 'keys', settle: 300, actions: [...keys('ArrowDown', 4, 150), settled] },
  { name: 'home', settle: 300, actions: [{ type: 'press', key: 'End' }, settled, { type: 'press', key: 'Home' }, settled] },
  // The capture hook steps panels without travel: scrollTo(.5) and (1).
  { name: 'hook-mid', scroll: 0.5, settle: 200 },
  { name: 'hook-end', scroll: 1, settle: 200 },
  // Reduced motion: a wheel commit and three key presses, sampled at once: panels change in place.
  { name: 'rm', reducedMotion: true, settle: 300, actions: [...wheel(200, 20), ...wheel(200, 20), ...wheel(200, 20), ...keys('ArrowDown', 3, 20)] },
  { name: 'mobile', viewport: 'mobile', settle: 300, actions: [swipe(-140), { type: 'wait', ms: 100 }, settled, { type: 'click', selector: '[data-next]' }, { type: 'wait', ms: 20 }] },
];

export async function probe() {
  const panels = [...document.querySelectorAll('.panel')];
  const arc = document.querySelector('[data-arc]');
  const ring = document.querySelector('[data-ring]');
  const t0 = performance.now();
  const read = () => {
    const s = window.__awards.state();
    const hit = document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest('.panel');
    return {
      t: Math.round(performance.now() - t0),
      index: s.index,
      transitioning: s.transitioning,
      dash: Math.round(parseFloat(getComputedStyle(arc).strokeDashoffset) * 1000) / 1000,
      now: Number(ring.getAttribute('aria-valuenow')),
      centre: panels.indexOf(hit),
      top: Math.round(panels[s.index].getBoundingClientRect().top),
      y: Math.round(scrollY),
    };
  };
  const samples = [];
  for (let i = 0; i < 40; i++) { samples.push(read()); await new Promise((r) => setTimeout(r, 50)); }
  const ctl = document.querySelector('[data-controls]').getBoundingClientRect();
  return {
    samples,
    scrollable: document.documentElement.scrollHeight - innerHeight,
    overflowX: document.documentElement.scrollWidth - innerWidth,
    controlsInView: ctl.top >= 0 && ctl.bottom <= innerHeight + 1 && ctl.height > 0,
    reachable: panels.filter((p) => !p.inert).length,
    keyHeights: [...document.querySelectorAll('.key')].map((k) => Math.round(k.getBoundingClientRect().height)),
  };
}

export function assert(r) {
  const out = [];
  const S = (k) => r[k]?.probe?.samples || [];
  const range = (a) => (a.length ? `${Math.min(...a)}–${Math.max(...a)}` : 'none');
  const errs = Object.entries(r).flatMap(([k, v]) => (v.errors || []).map((e) => `${k}: ${e}`));
  out.push({ ok: errs.length === 0, message: `no page errors${errs.length ? ` (${errs.slice(0, 3).join('; ')})` : ''}` });

  // Below the threshold: index unchanged, ring partly full (rendered), then back to 0 after the idle window.
  const p = S('partial');
  const early = p.filter((s) => s.t > 250 && s.t < 700), late = p.filter((s) => s.t > 1500);
  out.push({ ok: p.length > 0 && p.every((s) => s.index === 0 && s.centre === 0 && s.y === 0), message: `below threshold: panel index stays 0 (${range(p.map((s) => s.index))})` });
  out.push({ ok: early.length > 0 && early.every((s) => s.dash > 0.3 && s.dash < 0.5 && s.now === 60), message: `below threshold: the ring renders part-full before idle (dashoffset ${range(early.map((s) => s.dash))}, aria-valuenow ${range(early.map((s) => s.now))})` });
  out.push({ ok: late.length > 0 && late.every((s) => s.dash > 0.99 && s.now === 0), message: `after the 1 s idle window the ring is back at 0 (dashoffset ${range(late.map((s) => s.dash))})` });

  // Crossing the threshold: exactly one step, however much wheel follows inside the lock.
  const c = S('commit');
  const last = c.at(-1) || {};
  out.push({ ok: c.length > 0 && c.every((s) => s.index === 1) && r.commit?.state?.commits === 1 && r.commit?.state?.switches === 1, message: `1200 px of wheel commits exactly one step (index ${range(c.map((s) => s.index))}, commits ${r.commit?.state?.commits})` });
  out.push({ ok: c.some((s) => s.transitioning && s.top > 0) && last.top === 0 && last.centre === 1 && !last.transitioning, message: `panel 2 travels in (top ${range(c.map((s) => s.top))} px) and ends under the viewport centre` });
  out.push({ ok: last.dash > 0.99 && c.every((s) => s.y === 0) && r.commit?.probe?.scrollable <= 0, message: `the ring resets after the commit; the document never scrolls (scrollY ${range(c.map((s) => s.y))}, scrollable ${r.commit?.probe?.scrollable} px)` });

  const e = S('edge').filter((s) => s.t > 300);
  out.push({ ok: e.length > 0 && e.every((s) => s.index === 0 && s.dash > 0.99), message: `reversing at the first panel drops the sum and never fills backwards (dashoffset ${range(e.map((s) => s.dash))})` });

  // Keyboard reaches every panel; the capture hook steps without travel.
  const k = r.keys?.state || {};
  out.push({ ok: k.index === 4 && k.visited?.join() === '0,1,2,3,4' && S('keys').at(-1)?.centre === 4 && r.keys?.probe?.reachable === 1, message: `ArrowDown ×4 visits every panel (${k.visited?.join(' → ')}); only the active one is reachable` });
  out.push({ ok: r.home?.state?.index === 0 && S('home').at(-1)?.centre === 0 && r.home?.state?.visited?.includes(4), message: 'End jumps to the last panel, Home back to the first' });
  out.push({ ok: /Panel 1 of 5/.test(r.home?.state?.live || '') && /Panel 5 of 5/.test(k.live || ''), message: `each change is announced in the live region ("${k.live}")` });
  out.push({ ok: S('hook-mid').at(-1)?.centre === 2 && S('hook-end').at(-1)?.centre === 4 && S('hook-end')[0]?.top === 0, message: `__awards.scrollTo(.5 / 1) shows panels 3 and 5 (centre ${S('hook-mid').at(-1)?.centre}, ${S('hook-end').at(-1)?.centre})` });

  // Reduced motion: the wheel still commits, and every change lands in place on the first sample.
  const rm = S('rm');
  out.push({ ok: r.rm?.state?.motion === 'reduced' && rm[0]?.index === 4 && rm[0]?.top === 0 && rm[0]?.centre === 4 && !rm[0]?.transitioning && r.rm?.state?.commits === 1, message: `reduced motion: wheel commit + 3 keys land on panel 5 instantly (first sample top ${rm[0]?.top}, centre ${rm[0]?.centre}, commits ${r.rm?.state?.commits})` });

  // Mobile: a swipe steps once, the Next key steps again; controls fit, no overflow.
  const m = r.mobile || {};
  out.push({ ok: m.state?.index === 2 && m.state?.switches === 2 && S('mobile').at(-1)?.centre === 2, message: `mobile: swipe then Next reach panel 3 (index ${m.state?.index})` });
  out.push({ ok: m.probe?.controlsInView && (m.probe?.overflowX ?? 1) <= 0 && m.probe?.keyHeights?.every((h) => h >= 44), message: `mobile: controls in view, keys ${m.probe?.keyHeights?.join('/')} px tall, overflow ${m.probe?.overflowX}px` });
  return out;
}
