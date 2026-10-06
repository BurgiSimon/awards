export const states = [
  { name: 'worker', scroll: 0, settle: 600 },
  { name: 'fallback', scroll: 0, settle: 300 },
  { name: 'rm', scroll: 0, reducedMotion: true, settle: 400 },
  { name: 'mobile', scroll: 0, viewport: 'mobile', settle: 600 },
  // The Worker answers hello, takes the canvas, then throws: the fallback takes over and the page is ready once.
  { name: 'crash', scroll: 0, settle: 300 },
  // Live tier change: the media query flips to reduce (loop stops), then back (loop resumes).
  { name: 'retier', scroll: 0, settle: 600 },
  { name: 'forced', scroll: 0, settle: 600 },
];

const CRASH = "self.onmessage = ({ data }) => { if (data.type === 'hello') self.postMessage({ type: 'hello' }); else throw new Error('worker crashed after hand-off'); };";
const motion = async (page, reducedMotion) => {
  await page.emulateMedia({ reducedMotion });
  await page.waitForTimeout(300);
  const st = await page.evaluate(() => window.__awards.state());
  const a = await shot(page);
  await page.waitForTimeout(300);
  return { animate: st.animate, running: st.running, changed: !a.equals(await shot(page)) };
};

const shot = (page) => page.locator('[data-loader]').screenshot();

// Node-side: `fallback` reloads with the Worker script held forever (never answered, so no console error),
// then every state compares two canvas screenshots 300 ms apart.
export async function inspect(page, st) {
  let state = null;
  if (st.name === 'fallback') {
    await page.context().route(/\/worker[^/]*\.js(\?.*)?$/, () => new Promise(() => {}));
    await page.reload({ waitUntil: 'load' });
    const timeout = await page.evaluate(() => window.__awards.state().timeout);
    await page.waitForTimeout(timeout + 300);
    state = await page.evaluate(() => window.__awards.state());
    await page.waitForTimeout(200);
  }
  if (st.name === 'crash') {
    await page.context().route(/\/worker[^/]*\.js(\?.*)?$/, (route) => route.fulfill({ contentType: 'text/javascript', body: CRASH }));
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(800);
    state = await page.evaluate(() => window.__awards.state());
  }
  if (st.name === 'forced') {
    const force = async (v) => { await page.evaluate((x) => document.documentElement.setAttribute('data-motion', x), v); await page.waitForTimeout(300); const s = await page.evaluate(() => window.__awards.state()); const a = await shot(page); await page.waitForTimeout(300); return { animate: s.animate, running: s.running, changed: !a.equals(await shot(page)) }; };
    return { stat: await force('static'), full: await force('full') };
  }
  if (st.name === 'retier') return { reduced: await motion(page, 'reduce'), full: await motion(page, 'no-preference') };
  const a = await shot(page);
  await page.waitForTimeout(300);
  const b = await shot(page);
  return { state, changed: !a.equals(b) };
}

export function assert(r) {
  const out = [];
  const w = r.worker.state, f = r.fallback.inspect?.state, m = r.mobile.state, rm = r.rm.state;
  out.push({ ok: w?.mode === 'worker' && w?.running === true, message: `worker: mode "${w?.mode}" (decided at ${w?.decidedMs} ms), running` });
  out.push({ ok: r.worker.inspect?.changed === true, message: 'worker: canvas pixels change between two frames' });
  out.push({ ok: f?.mode === 'main' && f?.reason === 'timeout' && f?.decidedMs <= f?.timeout + 300, message: `fallback: Worker URL held, mode "${f?.mode}" (${f?.reason}) at ${f?.decidedMs} ms ≤ ${f ? f.timeout + 300 : '?'} ms` });
  out.push({ ok: r.fallback.inspect?.changed === true, message: 'fallback: canvas pixels still change on the main thread' });
  out.push({ ok: rm?.motion === 'reduced' && rm?.animate === false && rm?.running === false && r.rm.inspect?.changed === false, message: `reduced motion: one settled frame, no loop (mode ${rm?.mode}, changed ${r.rm.inspect?.changed})` });
  out.push({ ok: ['worker', 'main'].includes(m?.mode) && r.mobile.inspect?.changed === true, message: `mobile: drawing on ${m?.mode}, pixels change` });
  const c = r.crash.inspect?.state, t = r.retier.inspect;
  out.push({ ok: c?.mode === 'main' && c?.reason === 'error' && c?.readyCalls === 1 && r.crash.inspect?.changed === true, message: `crash: Worker died after hand-off, mode "${c?.mode}" (${c?.reason}), ready() called ${c?.readyCalls} time(s) (want 1), pixels change ${r.crash.inspect?.changed}` });
  out.push({ ok: t?.reduced.animate === false && t?.reduced.running === false && t?.reduced.changed === false && t?.full.animate === true && t?.full.running === true && t?.full.changed === true, message: `retier: reduce stops the loop (${JSON.stringify(t?.reduced)}), back to full restarts it (${JSON.stringify(t?.full)})` });
  const fz = r.forced.inspect;
  out.push({ ok: fz?.stat.animate === false && fz?.stat.running === false && fz?.stat.changed === false && fz?.full.animate === true && fz?.full.running === true && fz?.full.changed === true, message: `forced: data-motion="static" at runtime stops the loop (${JSON.stringify(fz?.stat)}), "full" restarts it (${JSON.stringify(fz?.full)})` });
  return out;
}
