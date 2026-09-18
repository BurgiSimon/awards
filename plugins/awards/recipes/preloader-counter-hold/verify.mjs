export const states = [
  { name: 'top', scroll: 0, settle: 1600 },
  { name: 'rm', scroll: 0, reducedMotion: true, settle: 600 },
  { name: 'repeat', actions: [{ type: 'click', selector: '[data-reload]' }, { type: 'wait', ms: 1500 }], settle: 300 },
  { name: 'mobile', scroll: 0, viewport: 'mobile', settle: 1600 },
];
export function probe() {
  const line = document.querySelector('.hero .line');
  return { heroTransform: getComputedStyle(line).transform, flag: (() => { try { return sessionStorage.getItem('awards:preloaded'); } catch { return null; } })(), preloaderInTree: !document.querySelector('[data-preloader]').hidden, countText: document.querySelector('[data-count]').textContent };
}
const ty = (t) => { const m = /matrix\([^)]*,\s*([-\d.]+)\)$/.exec(t || ''); return m ? Math.abs(Number(m[1])) : 0; };
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.exited === true && r.top.state?.skipped === false, message: 'first visit: preloader ran and exited' });
  out.push({ ok: r.top.state?.finalCount === '100' && (r.top.state?.holdMs ?? 0) >= 400, message: `counter reached 100 and held (${r.top.state?.holdMs} ms)` });
  out.push({ ok: (r.top.state?.totalMs ?? 9999) < 4500, message: `first load under 4.5 s (${r.top.state?.totalMs} ms)` });
  out.push({ ok: r.top.probe?.preloaderInTree === false && r.top.probe?.flag === '1', message: 'preloader hidden after exit and repeat flag set' });
  out.push({ ok: ty(r.top.probe?.heroTransform) < 1, message: `hero lines revealed after the exit (${r.top.probe?.heroTransform})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.exited === true && (r.rm.state?.holdMs ?? 0) >= 250 && ty(r.rm.probe?.heroTransform) < 1, message: 'reduced motion: counter, hold, no choreography, hero visible' });
  out.push({ ok: r.repeat.state?.skipped === true && r.repeat.state?.exited === true && (r.repeat.state?.totalMs ?? 9999) < 400, message: `repeat visit skips the preloader (${r.repeat.state?.totalMs} ms)` });
  out.push({ ok: r.mobile.state?.exited === true, message: 'mobile: exited' });
  return out;
}
