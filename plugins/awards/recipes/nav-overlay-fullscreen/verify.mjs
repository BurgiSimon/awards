export const states = [
  { name: 'top', scroll: 0, settle: 500 },
  { name: 'open', actions: [{ type: 'click', selector: '[data-menu-toggle]' }, { type: 'wait', ms: 1800 }], settle: 100 },
  { name: 'trap', actions: [{ type: 'click', selector: '[data-menu-toggle]' }, { type: 'wait', ms: 1800 }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }], settle: 100 },
  { name: 'escape', actions: [{ type: 'click', selector: '[data-menu-toggle]' }, { type: 'wait', ms: 1800 }, { type: 'press', key: 'Escape' }, { type: 'wait', ms: 1500 }], settle: 100 },
  { name: 'rm', reducedMotion: true, actions: [{ type: 'click', selector: '[data-menu-toggle]' }, { type: 'wait', ms: 300 }], settle: 100 },
  { name: 'mobile', viewport: 'mobile', actions: [{ type: 'click', selector: '[data-menu-toggle]' }, { type: 'wait', ms: 1800 }], settle: 100 },
];
export function probe() {
  const menu = document.querySelector('[data-menu]');
  const word = document.querySelector('.menu__word');
  return { menuDisplay: getComputedStyle(menu).display, clip: getComputedStyle(menu).clipPath, wordTransform: getComputedStyle(word).transform, bodyOverflow: getComputedStyle(document.documentElement).overflow, active: document.activeElement?.tagName + ':' + (document.activeElement?.textContent?.trim().slice(0, 12) || '') };
}
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.open === false && r.top.state?.menuHidden === true && r.top.state?.pageInert === false, message: 'closed at rest, page not inert' });
  out.push({ ok: r.open.state?.open === true && r.open.state?.pageInert === true && r.open.state?.expanded === 'true' && r.open.probe?.menuDisplay !== 'none', message: 'open: overlay shown, aria-expanded, page inert' });
  out.push({ ok: r.open.state?.focusInMenu === true, message: `focus moved into the menu (${r.open.probe?.active})` });
  out.push({ ok: /matrix\(1, 0, 0, 1, 0, 0\)|none/.test(r.open.probe?.wordTransform || ''), message: `menu words settled (${r.open.probe?.wordTransform})` });
  out.push({ ok: r.trap.state?.focusInMenu === true, message: `focus stays trapped after seven Tabs (${r.trap.probe?.active})` });
  out.push({ ok: r.escape.state?.open === false && r.escape.state?.pageInert === false && r.escape.state?.menuHidden === true && /BUTTON/.test(r.escape.probe?.active || ''), message: `Escape closes and returns focus to the button (${r.escape.probe?.active})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.open === true && r.rm.state?.animating === false && r.rm.probe?.menuDisplay !== 'none', message: 'reduced motion: opens immediately' });
  out.push({ ok: r.mobile.state?.open === true && r.mobile.state?.pageInert === true, message: 'mobile: opens and locks the page' });
  return out;
}
