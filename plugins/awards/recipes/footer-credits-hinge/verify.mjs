// The closing sheet tips on its corner by the end of the page; the credits button scrolls to the end and lifts and tilts
// the stage so the credits are uncovered (a hit test lands inside the panel); Escape, the close button, the keyboard and
// a scroll all put it back with focus on the trigger; reduced motion opens the credits over a stage that never moves.
const openCredits = { type: 'click', selector: '[data-credits]' };
// Records whether the link is covered by the sheet before it is focused, so the focus check proves a real fix.
const coveredBefore = `(() => {
  const a = document.querySelector('a[href^="mailto"]'); const b = a.getBoundingClientRect();
  const at = document.elementFromPoint(b.left + b.width / 2, Math.min(innerHeight - 1, b.top + b.height / 2));
  window.__coveredBefore = !(at && (at === a || a.contains(at))); return true;
})()`;
export const states = [
  { name: 'top', scroll: 0, settle: 600 },
  { name: 'end', scroll: 1, settle: 900 },
  { name: 'hover', scroll: 1, settle: 700, hover: 'a[href^="mailto"]' },
  { name: 'open', settle: 600, actions: [openCredits, { type: 'wait', ms: 1700 }] },
  { name: 'escape', settle: 600, actions: [openCredits, { type: 'wait', ms: 1500 }, { type: 'press', key: 'Escape' }, { type: 'wait', ms: 1300 }] },
  { name: 'close-button', settle: 600, actions: [openCredits, { type: 'wait', ms: 1600 }, { type: 'click', selector: '[data-credits-close]' }, { type: 'wait', ms: 1300 }] },
  { name: 'scroll-close', settle: 600, actions: [openCredits, { type: 'wait', ms: 1700 }, { type: 'wheel', dy: -600 }, { type: 'wait', ms: 1300 }] },
  { name: 'keys', settle: 600, actions: [{ type: 'focus', selector: '[data-credits]' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 1600 }] },
  { name: 'keys-close', settle: 600, actions: [{ type: 'focus', selector: '[data-credits]' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 1600 }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 1300 }] },
  // Part-way into the footer, where the sheet still covers the stage's links: focus one, it must end up uncovered.
  { name: 'focus-footer', settle: 600, actions: [{ type: 'waitFor', fn: '(() => { window.__awards.scrollTo(0.85); return true; })()' }, { type: 'wait', ms: 500 }, { type: 'waitFor', fn: coveredBefore }, { type: 'focus', selector: 'a[href^="mailto"]' }, { type: 'wait', ms: 500 }] },
  { name: 'rm-end', scroll: 1, reducedMotion: true, settle: 700 },
  { name: 'rm-open', reducedMotion: true, settle: 600, actions: [openCredits, { type: 'wait', ms: 800 }] },
  { name: 'mobile-open', viewport: 'mobile', settle: 600, actions: [openCredits, { type: 'wait', ms: 1700 }] },
];

export function probe() {
  const panel = document.querySelector('[data-panel]');
  const hit = (el) => {
    const b = el.getBoundingClientRect();
    const x = b.left + b.width / 2, y = b.top + b.height / 2;
    const at = document.elementFromPoint(x, y);
    return { x: Math.round(x), y: Math.round(y), inPanel: !!at && panel.contains(at), inView: y > 0 && y < innerHeight };
  };
  return {
    titleHit: hit(panel.querySelector('h2')),
    copyHit: hit(panel.querySelector('.credits__copy strong')),
    closeHit: hit(panel.querySelector('[data-credits-close]')),
    coveredBefore: window.__coveredBefore ?? null,
    focusHit: (() => {
      const a = document.activeElement;
      if (!a || a === document.body) return null;
      const b = a.getBoundingClientRect();
      const at = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      return { tag: a.tagName.toLowerCase(), uncovered: !!at && (at === a || a.contains(at)) };
    })(),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

const near = (a, b, tol) => typeof a === 'number' && Math.abs(a - b) <= tol;
export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const pr = (n) => r[n]?.probe || {};
  const out = [];
  const t = st('top');
  out.push({ ok: t.open === false && t.panelInert === true && t.panelVisibility === 'hidden' && near(t.sheetAngle, 0, 0.05), message: `top: credits closed, inert and hidden; the sheet flat (${t.sheetAngle}°)` });
  const e = st('end');
  out.push({ ok: e.atEnd && near(e.sheetAngle, -5, 0.6) && near(e.contentShift, 0, 0.5), message: `end: the sheet has tipped to −5° on its corner (${e.sheetAngle}°) and the stage's content has landed (${e.contentShift} %)` });
  out.push({ ok: e.open === false && e.panelVisibility === 'hidden', message: 'end: the credits stay hidden under the stage until asked for' });
  out.push({ ok: (st('hover').blinks ?? 0) >= 1, message: `hover: a footer link blinks by registered effect (${st('hover').blinks})` });
  const o = st('open'), op = pr('open');
  out.push({ ok: o.open && o.expanded === 'true' && o.panelInert === false && o.panelVisibility === 'visible' && o.atEnd, message: `open: scrolled to the end (${o.scrollY}/${o.max}), expanded, panel visible and not inert` });
  out.push({ ok: near(o.stageAngle, -5, 0.3) && (o.stageLift ?? 0) > 120 && (o.stageLift ?? 0) < 420, message: `open: the stage lifted ${o.stageLift} px and tilted ${o.stageAngle}°` });
  out.push({ ok: op.titleHit?.inPanel && op.copyHit?.inPanel && op.closeHit?.inPanel, message: `open: title, copy and close button are uncovered (hit tests ${JSON.stringify([op.titleHit, op.copyHit, op.closeHit].map((h) => h?.inPanel))})` });
  out.push({ ok: o.focus === 'credits-title', message: `open: focus moved to the credits heading (${o.focus})` });
  const esc = st('escape');
  out.push({ ok: esc.open === false && esc.focus === 'trigger' && esc.panelInert === true && esc.panelVisibility === 'hidden' && near(esc.stageAngle, 0, 0.05), message: `escape: closed, stage back down, focus on the trigger (${esc.focus})` });
  const cb = st('close-button');
  out.push({ ok: cb.open === false && cb.focus === 'trigger', message: `close button: reachable in the gap and closes, focus on the trigger (${cb.focus})` });
  const sc = st('scroll-close');
  out.push({ ok: sc.open === false && sc.expanded === 'false' && !sc.atEnd, message: `scroll: a scroll after the arming delay closes the credits (scrollY ${sc.scrollY}/${sc.max})` });
  out.push({ ok: st('keys').open === true && st('keys').focus === 'credits-title', message: `keyboard: Enter on the trigger opens and focuses the heading (${st('keys').focus})` });
  out.push({ ok: st('keys-close').open === false && st('keys-close').focus === 'trigger', message: `keyboard: Tab reaches the close button, Enter closes, focus returns (${st('keys-close').focus})` });
  const ff = st('focus-footer'), ffp = pr('focus-footer');
  out.push({ ok: ffp.coveredBefore === true && ff.atEnd && ffp.focusHit?.uncovered === true, message: `keyboard: a footer link focused under the sheet (covered before: ${ffp.coveredBefore}) jumps the page to the end and is uncovered (${ff.scrollY}/${ff.max}, ${JSON.stringify(ffp.focusHit)})` });
  const rme = st('rm-end');
  out.push({ ok: rme.motion === 'reduced' && near(rme.sheetAngle, 0, 0.05) && rme.lenis === false, message: `reduced motion: the sheet never tips (${rme.sheetAngle}°), native scroll` });
  const rmo = st('rm-open'), rmop = pr('rm-open');
  out.push({ ok: rmo.open && near(rmo.stageAngle, 0, 0.05) && rmo.stageLift === 0 && rmo.panelOpacity === 1 && rmop.closeHit?.inPanel && rmo.blinks === 0, message: `reduced motion: the credits come up over a stage that never moves (angle ${rmo.stageAngle}°, opacity ${rmo.panelOpacity}, blinks ${rmo.blinks})` });
  const mo = st('mobile-open'), mop = pr('mobile-open');
  out.push({ ok: mo.open && near(mo.stageAngle, -3, 0.3) && mop.closeHit?.inPanel && mop.titleHit?.inPanel && (mop.overflowX ?? 1) <= 0, message: `mobile: a smaller tilt (${mo.stageAngle}°), the close button uncovered, no sideways overflow (${mop.overflowX})` });
  return out;
}
