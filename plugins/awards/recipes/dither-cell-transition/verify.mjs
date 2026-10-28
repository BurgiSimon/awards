// One curtain for the arrival and every route. The swap happens only behind a fully shut curtain; focus, title and
// the live region follow the route; the scroll comes back on back and forward only; the arrival gate releases at
// its ceiling when a load never answers; reduced motion fades.
const idle = (route) => ({ type: 'waitFor', fn: `window.__awards.state().phase === 'idle' && window.__awards.state().route === '${route}'` });
const nav = (route) => ({ type: 'click', selector: `.nav a[href="#/${route}"]` });

export const states = [
  { name: 'arrival', settle: 300, actions: [idle('home')] },
  { name: 'route', settle: 200, actions: [idle('home'), nav('stay'), idle('stay')] },
  { name: 'back', settle: 200, actions: [idle('home'), nav('stay'), idle('stay'), { type: 'waitFor', fn: '(window.scrollTo(0, 600), true)' }, { type: 'wait', ms: 200 }, nav('journal'), idle('journal'), { type: 'waitFor', fn: '(history.back(), true)' }, idle('stay')] },
  { name: 'repeat', settle: 200, actions: [idle('home'), { type: 'reload' }, idle('home')] },
  { name: 'ceiling', settle: 200, actions: [idle('home'), { type: 'waitFor', fn: "(sessionStorage.setItem('dither-cell-transition:hang', '1'), sessionStorage.removeItem('dither-cell-transition:visited'), true)" }, { type: 'reload' }, idle('home')] },
  // Mid-sweep, for the explorer's frame: the curtain half shut over the page it is leaving.
  { name: 'sweep', settle: 0, actions: [idle('home'), nav('stay'), { type: 'wait', ms: 420 }] },
  { name: 'reduced', reducedMotion: true, settle: 200, actions: [idle('home'), nav('journal'), idle('journal')] },
  { name: 'mobile', viewport: 'mobile', settle: 200, actions: [idle('home'), { type: 'click', selector: '.next a' }, idle('stay')] },
];

export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const out = [];
  const a = st('arrival');
  out.push({ ok: a.gate?.outcome === 'loaded' && a.gate.ms >= 900 && a.gate.ms < 4000 && a.gate.done === a.gate.loads && a.curtainHidden && a.repeat === false, message: `arrival: the gate waited for ${a.gate?.loads} real loads, held ${a.gate?.ms} ms (≥ 900, < 4,000), then opened` });
  out.push({ ok: a.cells === a.cols * a.rows && a.cols >= 18 && a.cols <= 22 && a.rows >= 10 && a.rows <= 14, message: `arrival: a ${a.cols} × ${a.rows} grid of ${a.cells} cells for the desktop viewport` });
  const rt = st('route');
  out.push({ ok: rt.coveredAtSwap === 1 && rt.route === 'stay' && rt.curtainHidden, message: `route: the swap happened behind a fully shut curtain (${rt.coveredAtSwap}), then it opened (${rt.lastMs} ms)` });
  out.push({ ok: rt.focused === 'h1' && /^Stay/.test(rt.title) && rt.scrollY === 0, message: `route: focus on the new heading (${rt.focused}), title "${rt.title}", scroll at the top (${rt.scrollY})` });
  const bk = st('back');
  out.push({ ok: bk.route === 'stay' && Math.abs((bk.scrollY ?? 0) - 600) < 4 && bk.transitions === 3, message: `back: Stay comes back where it was left (${bk.scrollY} px, saved 600)` });
  const rp = st('repeat');
  out.push({ ok: rp.repeat === true && rp.gate?.outcome === 'loaded' && rp.gate.ms < 900, message: `repeat visit: the short hold (${rp.gate?.ms} ms)` });
  const cl = st('ceiling');
  out.push({ ok: cl.gate?.outcome === 'ceiling' && cl.gate.ms >= 4000 && cl.gate.ms < 4600 && cl.curtainHidden, message: `ceiling: a load that never answers keeps the page shut ${cl.gate?.ms} ms, no longer (${cl.gate?.done} of ${cl.gate?.loads} loads)` });
  const rd = st('reduced');
  out.push({ ok: rd.motion === 'reduced' && rd.route === 'journal' && rd.coveredAtSwap === 1 && rd.lastMs < 700 && rd.focused === 'h1', message: `reduced: a fade, not a weave (${rd.lastMs} ms), shut at the swap (${rd.coveredAtSwap})` });
  const mb = st('mobile');
  out.push({ ok: mb.cols >= 4 && mb.cols <= 6 && mb.rows >= 10 && mb.rows <= 12 && mb.route === 'stay' && mb.coveredAtSwap === 1, message: `mobile: a ${mb.cols} × ${mb.rows} grid; the in-page link routes behind the curtain` });
  return out;
}
