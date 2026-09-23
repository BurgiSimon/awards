const OPEN = [{ type: 'click', selector: '[data-dialog-open]' }, { type: 'wait', ms: 900 }];
// Mobile 390×844: the sheet is 88dvh tall, so its header spans roughly y 101–185.
const GRAB = { type: 'move', x: 195, y: 130, steps: 2 };

export const states = [
  { name: 'top', scroll: 0, settle: 500 },
  { name: 'wheel', actions: [...OPEN, { type: 'move', x: 720, y: 450 }, { type: 'wheel', dx: 0, dy: 600 }, { type: 'wait', ms: 1600 }], settle: 100 },
  { name: 'pane', actions: [...OPEN, { type: 'hover', selector: '[data-pane]' }, { type: 'wait', ms: 300 }, { type: 'wheel', dx: 0, dy: 200 }, { type: 'wait', ms: 800 }], settle: 100 },
  { name: 'escape', actions: [...OPEN, { type: 'press', key: 'Escape' }, { type: 'wait', ms: 900 }], settle: 100 },
  { name: 'rm', reducedMotion: true, actions: [{ type: 'click', selector: '[data-dialog-open]' }, { type: 'wait', ms: 60 }], settle: 100 },
  { name: 'rm-close', reducedMotion: true, actions: [{ type: 'click', selector: '[data-dialog-open]' }, { type: 'wait', ms: 60 }, { type: 'press', key: 'Escape' }, { type: 'wait', ms: 60 }], settle: 100 },
  { name: 'mobile', viewport: 'mobile', actions: OPEN, settle: 100 },
  { name: 'mobile-nudge', viewport: 'mobile', actions: [...OPEN, GRAB, { type: 'down' }, { type: 'move', x: 195, y: 170, steps: 4 }, { type: 'wait', ms: 300 }, { type: 'up' }, { type: 'wait', ms: 800 }], settle: 100 },
  { name: 'mobile-drag', viewport: 'mobile', actions: [...OPEN, GRAB, { type: 'down' }, { type: 'move', x: 195, y: 470, steps: 12 }, { type: 'up' }, { type: 'wait', ms: 900 }], settle: 100 },
];

export function probe() {
  const dialog = document.querySelector('[data-dialog]');
  const r = document.querySelector('[data-panel]').getBoundingClientRect();
  return {
    dialogOpen: dialog.open,
    panelTop: Math.round(r.top),
    panelBottom: Math.round(r.bottom),
    panelOpacity: getComputedStyle(document.querySelector('[data-panel]')).opacity,
    panelTransform: getComputedStyle(document.querySelector('[data-panel]')).transform,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    active: document.activeElement?.tagName + ':' + (document.activeElement?.textContent?.trim().slice(0, 12) || ''),
  };
}

export function assert(r) {
  const s = (n) => r[n]?.state || {};
  const p = (n) => r[n]?.probe || {};
  const out = [];
  out.push({ ok: s('top').open === false && p('top').dialogOpen === false && s('top').pageLenisStopped === false, message: 'closed at rest, page Lenis running' });
  out.push({ ok: s('wheel').open === true && p('wheel').dialogOpen === true && s('wheel').variant === 'dialog' && s('wheel').nested === true && s('wheel').pageLenisStopped === true && s('wheel').focusInDialog === true, message: 'open: modal dialog, nested Lenis alive, page Lenis stopped, focus inside' });
  out.push({ ok: s('wheel').dialogScroll > 300 && s('wheel').pageScroll === 0, message: `wheel over the dialog moves its scroller, not the page (dialog ${s('wheel').dialogScroll}px, page ${s('wheel').pageScroll}px)` });
  out.push({ ok: s('pane').paneScroll > 0 && s('pane').pageScroll === 0, message: `data-lenis-prevent pane scrolls natively (pane ${s('pane').paneScroll}px, page ${s('pane').pageScroll}px)` });
  out.push({ ok: s('escape').open === false && p('escape').dialogOpen === false && s('escape').closedBy === 'escape' && s('escape').lastCloseMs > 200 && s('escape').focusOnOpener === true && s('escape').pageLenisStopped === false && s('escape').nested === false, message: `Escape closes with the animation (${s('escape').lastCloseMs} ms), focus back on the opener (${p('escape').active}), page Lenis restarted` });
  out.push({ ok: s('rm').motion === 'reduced' && s('rm').open === true && s('rm').animating === false && s('rm').lastOpenMs === 0 && s('rm').nested === false && p('rm').panelOpacity === '1' && p('rm').panelTransform === 'none', message: 'reduced motion: opens instantly, native scrolling, no transform' });
  out.push({ ok: s('rm-close').open === false && s('rm-close').lastCloseMs === 0 && s('rm-close').focusOnOpener === true, message: 'reduced motion: Escape closes instantly and returns focus' });
  out.push({ ok: s('mobile').variant === 'sheet' && p('mobile').dialogOpen === true && Math.abs(p('mobile').panelBottom - 844) <= 2 && p('mobile').panelTop > 60, message: `mobile: bottom sheet docked to the bottom edge (${p('mobile').panelTop}–${p('mobile').panelBottom})` });
  out.push({ ok: s('mobile-nudge').open === true && Math.abs(s('mobile-nudge').panelY) <= 1, message: `mobile: a short drag springs back (y ${s('mobile-nudge').panelY})` });
  out.push({ ok: s('mobile-drag').open === false && p('mobile-drag').dialogOpen === false && s('mobile-drag').closedBy === 'drag' && s('mobile-drag').focusOnOpener === true, message: `mobile: dragging past the threshold dismisses the sheet (closedBy ${s('mobile-drag').closedBy})` });
  return out;
}
