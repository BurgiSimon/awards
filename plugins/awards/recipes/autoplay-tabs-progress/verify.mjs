// The tab set sits below a 100svh hero. States reach it through the page's own anchor link, then park the pointer
// in the section gutter (outside [data-tabs]) so hover does not hold the clock unless a state asks for it.
const JUMP = { type: 'click', selector: '[data-jump]' };
const AWAY = { type: 'move', x: 2, y: 2, steps: 1 };
const until = (cond, timeout = 12000) => ({ type: 'waitFor', fn: `(() => { const s = window.__awards.state(); return ${cond}; })()`, timeout });

export const states = [
  { name: 'top', settle: 1500 },
  { name: 'advance', settle: 300, actions: [JUMP, AWAY, until('s.advances >= 1')] },
  { name: 'hover', settle: 300, actions: [JUMP, { type: 'hover', selector: '[data-tabs] [role="tablist"]' }, { type: 'wait', ms: 6500 }] },
  { name: 'click', settle: 300, actions: [JUMP, AWAY, until('s.progress > 0.4'), { type: 'click', selector: '#tab-3' }, AWAY, { type: 'wait', ms: 1000 }] },
  { name: 'rm', reducedMotion: true, settle: 300, actions: [JUMP, AWAY, { type: 'wait', ms: 6000 }, { type: 'focus', selector: '#tab-1' }, { type: 'press', key: 'ArrowRight' }, { type: 'press', key: 'ArrowRight' }, { type: 'press', key: 'ArrowRight' }, { type: 'wait', ms: 400 }] },
  { name: 'mobile', viewport: 'mobile', settle: 300, actions: [JUMP, AWAY, until('s.advances >= 1')] },
];

export function probe() {
  return {
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    toggleHidden: document.querySelector('[data-autoplay-toggle]').hidden,
    rendered: [...document.querySelectorAll('[role="tabpanel"]')].filter((p) => p.checkVisibility()).map((p) => p.id),
  };
}

export function assert(r) {
  const out = [];
  const t = r.top.state || {};
  out.push({ ok: t.started === false && t.index === 0 && t.progress === 0 && t.autoplay === true, message: `below the fold the clock has not started (started ${t.started}, progress ${t.progress})` });
  const a = r.advance.state || {};
  out.push({ ok: a.advances === 1 && a.index === 1 && a.lastAdvanceProgress === 1 && a.lastSelect?.via === 'auto', message: `the bar filling to 1 advanced the set to tab 2 (index ${a.index}, bar at advance ${a.lastAdvanceProgress})` });
  out.push({ ok: a.progress < 0.2 && a.bars?.[0] === 0 && a.running === true, message: `the new bar restarted from 0 and runs (progress ${a.progress}, previous bar ${a.bars?.[0]})` });
  const h = r.hover.state || {};
  out.push({ ok: h.started === true && h.index === 0 && h.advances === 0 && h.holds?.includes('hover') && h.running === false && h.progress < 1, message: `hover holds the index past the delay (index ${h.index}, holds ${h.holds}, progress ${h.progress})` });
  const c = r.click.state || {};
  out.push({ ok: c.index === 2 && c.lastSelect?.via === 'click' && c.lastSelect?.progressBefore > 0.4 && c.progress > 0.05 && c.progress < 0.4 && c.bars?.[0] === 0 && c.advances === 0, message: `a click resets the timer (tab 1 at ${c.lastSelect?.progressBefore} → tab 3 restarted, now ${c.progress})` });
  out.push({ ok: c.visiblePanel === 'panel-3' && r.click.probe?.rendered?.join() === 'panel-3', message: `only the clicked tab's panel renders (${r.click.probe?.rendered})` });
  const m = r.rm.state || {};
  out.push({ ok: m.motion === 'reduced' && m.autoplay === false && m.advances === 0 && (m.bars || []).every((b) => b === 0) && r.rm.probe?.toggleHidden === true, message: `reduced motion: no auto-advance, no bar, no pause control (advances ${m.advances})` });
  out.push({ ok: m.index === 3 && m.focused === 'tab-4' && m.visiblePanel === 'panel-4' && r.rm.probe?.rendered?.join() === 'panel-4' && m.lastSelect?.via === 'key', message: `reduced motion: arrow keys reach every tab (focused ${m.focused}, panel ${m.visiblePanel})` });
  const mo = r.mobile.state || {};
  out.push({ ok: mo.index === 1 && mo.advances === 1 && mo.progress < 0.2 && r.mobile.probe?.rendered?.join() === 'panel-2', message: `mobile auto-advances (index ${mo.index})` });
  out.push({ ok: (r.mobile.probe?.overflowX ?? 1) <= 0, message: `mobile has no horizontal overflow (${r.mobile.probe?.overflowX}px)` });
  return out;
}
