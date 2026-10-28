// One curtain for the arrival and every route. The swap happens only behind a fully shut curtain, with the page behind
// it inert; focus, title and the live region follow the route; the scroll comes back on back and forward only, from
// the router, not the browser; a route asked for mid-arrival queues; the skip link is not a route; the arrival gate
// releases at its ceiling when a load never answers, and a CSS failsafe when the module never runs; reduced motion fades.
const idle = (route) => ({ type: 'waitFor', fn: `window.__awards.state().phase === 'idle' && window.__awards.state().route === '${route}'` });
const nav = (route) => ({ type: 'click', selector: `.nav a[href="#/${route}"]` });
const toJournalAt600 = [idle('home'), nav('stay'), idle('stay'), { type: 'waitFor', fn: '(window.scrollTo(0, 600), true)' }, { type: 'wait', ms: 200 }, nav('journal'), idle('journal')];
const skip = [idle('home'), nav('stay'), idle('stay'), { type: 'focus', selector: '.skip-link' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 1200 }];

export const states = [
  { name: 'arrival', settle: 300, actions: [idle('home')] },
  { name: 'route', settle: 200, actions: [idle('home'), nav('stay'), idle('stay')] },
  { name: 'back', settle: 200, actions: [...toJournalAt600, { type: 'waitFor', fn: '(history.back(), true)' }, idle('stay')] },
  // Just after back, while the curtain is still closing over Journal: the browser must not have jumped it to Stay's offset.
  { name: 'backMid', settle: 200, actions: [...toJournalAt600, { type: 'waitFor', fn: '(history.back(), true)' }, { type: 'wait', ms: 250 }] },
  // A route asked for while the arrival is still shut waits for it, then runs its own full cover.
  { name: 'early', settle: 200, actions: [idle('home'), { type: 'waitFor', fn: "(sessionStorage.setItem('dither-cell-transition:early', 'stay'), true)" }, { type: 'reload' }, idle('stay')] },
  // The skip link's #main is an in-page target: no transition, and a reload stays on the page it was used on.
  { name: 'skip', settle: 200, actions: skip },
  { name: 'skipReload', settle: 200, actions: [...skip, { type: 'reload' }, idle('stay')] },
  { name: 'repeat', settle: 200, actions: [idle('home'), { type: 'reload' }, idle('home')] },
  { name: 'ceiling', settle: 200, actions: [idle('home'), { type: 'waitFor', fn: "(sessionStorage.setItem('dither-cell-transition:hang', '1'), sessionStorage.removeItem('dither-cell-transition:visited'), true)" }, { type: 'reload' }, idle('home')] },
  // Mid-sweep, for the explorer's frame: the curtain half shut over the page it is leaving.
  { name: 'sweep', settle: 0, actions: [idle('home'), nav('stay'), { type: 'wait', ms: 420 }] },
  { name: 'reduced', reducedMotion: true, settle: 200, actions: [idle('home'), nav('journal'), idle('journal')] },
  // A curtain the module never marks ready (a module that failed to load) hides itself 5 s after it is first styled.
  { name: 'late', settle: 200, actions: [idle('home'), { type: 'waitFor', fn: "(sessionStorage.setItem('dither-cell-transition:late', '1'), true)" }, { type: 'reload' }, { type: 'waitFor', timeout: 12000, fn: "window.__awards.state().phase === 'idle'" }] },
  { name: 'failsafe', settle: 200, actions: [idle('home'),
    { type: 'waitFor', fn: "(window.__failsafeT0 = performance.now(), document.body.append(Object.assign(document.createElement('div'), { className: 'curtain', id: 'failsafe-probe' })), true)" },
    { type: 'waitFor', timeout: 9000, fn: "getComputedStyle(document.getElementById('failsafe-probe')).visibility === 'hidden' && (window.__failsafeMs ??= Math.round(performance.now() - window.__failsafeT0)) > 0" }] },
  { name: 'mobile', viewport: 'mobile', settle: 200, actions: [idle('home'), { type: 'click', selector: '.next a' }, idle('stay')] },
];

export async function probe() {
  return { failsafeMs: window.__failsafeMs ?? null };
}

export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const out = [];
  const a = st('arrival');
  out.push({ ok: a.gate?.outcome === 'loaded' && a.gate.ms >= 900 && a.gate.ms < 4000 && a.gate.done === a.gate.loads && a.curtainHidden && a.repeat === false, message: `arrival: the gate waited for ${a.gate?.loads} real loads, held ${a.gate?.ms} ms (≥ 900, < 4,000), then opened` });
  out.push({ ok: a.cells === a.cols * a.rows && a.cols >= 18 && a.cols <= 22 && a.rows >= 10 && a.rows <= 14, message: `arrival: a ${a.cols} × ${a.rows} grid of ${a.cells} cells for the desktop viewport` });
  const rt = st('route');
  out.push({ ok: rt.coveredAtSwap === 1 && rt.route === 'stay' && rt.curtainHidden, message: `route: the swap happened behind a fully shut curtain (${rt.coveredAtSwap}), then it opened (${rt.lastMs} ms)` });
  out.push({ ok: rt.focused === 'h1' && /^Stay/.test(rt.title) && rt.scrollY === 0 && rt.behindInert === false, message: `route: focus on the new heading (${rt.focused}), title "${rt.title}", scroll at the top (${rt.scrollY}), the page live again` });
  const sw = st('sweep');
  out.push({ ok: sw.phase === 'leaving' && sw.curtainHidden === false && sw.behindInert === true, message: `sweep: mid-cover the page behind the curtain is inert (${sw.behindInert}), so a key press cannot route under it` });
  const bk = st('back');
  out.push({ ok: bk.route === 'stay' && Math.abs((bk.scrollY ?? 0) - 600) < 4 && bk.transitions === 3, message: `back: Stay comes back where it was left (${bk.scrollY} px, saved 600)` });
  const bm = st('backMid');
  out.push({ ok: bm.phase === 'leaving' && bm.route === 'journal' && bm.scrollY === 0, message: `back: while the curtain closes, Journal holds its scroll (${bm.scrollY} px); the browser's own restore is off` });
  const ea = st('early');
  out.push({ ok: ea.route === 'stay' && ea.transitions === 1 && ea.coveredAtSwap === 1 && ea.curtainHidden && ea.focused === 'h1' && ea.behindInert === false, message: `early: a route asked for mid-arrival queued behind it, then swapped behind a fully shut curtain (${ea.coveredAtSwap}, ${ea.transitions} transition)` });
  const sk = st('skip'), sr = st('skipReload');
  out.push({ ok: sk.route === 'stay' && sk.transitions === 1 && sk.hash === '#/stay' && sk.curtainHidden, message: `skip link: no route change (${sk.route}, ${sk.transitions} transition), its entry rewritten to ${sk.hash}` });
  out.push({ ok: sr.route === 'stay' && sr.hash === '#/stay', message: `skip link: a reload afterwards stays on Stay (${sr.route})` });
  const rp = st('repeat');
  out.push({ ok: rp.repeat === true && rp.gate?.outcome === 'loaded' && rp.gate.ms < 900, message: `repeat visit: the short hold (${rp.gate?.ms} ms)` });
  const cl = st('ceiling');
  out.push({ ok: cl.gate?.outcome === 'ceiling' && cl.gate.ms >= 4000 && cl.gate.ms < 4600 && cl.curtainHidden, message: `ceiling: a load that never answers keeps the page shut ${cl.gate?.ms} ms, no longer (${cl.gate?.done} of ${cl.gate?.loads} loads)` });
  const rd = st('reduced');
  out.push({ ok: rd.motion === 'reduced' && rd.route === 'journal' && rd.coveredAtSwap === 1 && rd.lastMs < 700 && rd.focused === 'h1', message: `reduced: a fade, not a weave (${rd.lastMs} ms), shut at the swap (${rd.coveredAtSwap})` });
  const lt = st('late');
  out.push({ ok: lt.late === true && lt.curtainHidden === true && lt.behindInert === false && lt.transitions === 0, message: `late module: the failsafe had released the page, and the arrival did not shut it again (late ${lt.late}, curtain hidden ${lt.curtainHidden}, page live ${lt.behindInert === false})` });
  const fs = r.failsafe?.probe?.failsafeMs;
  out.push({ ok: fs >= 4900 && fs < 6500, message: `failsafe: a curtain never marked ready hides itself after ${fs} ms (5 s in CSS)` });
  const mb = st('mobile');
  out.push({ ok: mb.cols >= 4 && mb.cols <= 6 && mb.rows >= 10 && mb.rows <= 12 && mb.route === 'stay' && mb.coveredAtSwap === 1, message: `mobile: a ${mb.cols} × ${mb.rows} grid; the in-page link routes behind the curtain` });
  return out;
}
