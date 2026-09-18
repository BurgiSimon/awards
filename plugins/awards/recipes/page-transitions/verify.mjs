export const states = [
  { name: 'top', scroll: 0, settle: 1500 },
  { name: 'nav', actions: [{ type: 'click', selector: '[data-nav]' }, { type: 'wait', ms: 2500 }], settle: 100 },
  { name: 'roundtrip', actions: [{ type: 'click', selector: '[data-nav]' }, { type: 'wait', ms: 2500 }, { type: 'click', selector: '[data-nav]' }, { type: 'wait', ms: 2500 }], settle: 100 },
  { name: 'rm', reducedMotion: true, actions: [{ type: 'click', selector: '[data-nav]' }, { type: 'wait', ms: 600 }], settle: 100 },
  { name: 'mobile', viewport: 'mobile', actions: [{ type: 'click', selector: '[data-nav]' }, { type: 'wait', ms: 2500 }], settle: 100 },
];
export function probe() {
  return { h1: document.querySelector('[data-page-title]')?.textContent.trim(), views: document.querySelectorAll('[data-taxi-view]').length, wipe: getComputedStyle(document.querySelector('[data-wipe]')).transform };
}
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.view === 'index' && r.top.state?.enters === 1 && r.top.probe?.h1 === 'Work', message: 'initial view rendered through the renderer' });
  out.push({ ok: r.nav.state?.path === 'about.html' && r.nav.probe?.h1 === 'About' && r.nav.state?.title === 'About', message: `navigated to about without a reload (${r.nav.state?.path}, "${r.nav.probe?.h1}")` });
  out.push({ ok: r.nav.state?.loads === 1 && r.nav.state?.enters === 2 && r.nav.state?.leaves === 1, message: `module ran once, renderer entered twice and left once (${r.nav.state?.loads}/${r.nav.state?.enters}/${r.nav.state?.leaves})` });
  out.push({ ok: r.nav.probe?.views === 1 && r.nav.state?.contexts === 1 && r.nav.state?.transitioning === false, message: 'old view removed, one live context, transition finished' });
  out.push({ ok: r.roundtrip.state?.path === 'index.html' && r.roundtrip.probe?.h1 === 'Work' && r.roundtrip.state?.loads === 1 && r.roundtrip.state?.contexts === 1, message: 'round trip returns to the first view with no leaks' });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.path === 'about.html' && r.rm.state?.transitioning === false, message: 'reduced motion: instant swap' });
  out.push({ ok: r.mobile.state?.path === 'about.html', message: 'mobile navigation works' });
  return out;
}
