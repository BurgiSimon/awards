export const states = [
  { name: 'worker', scroll: 0, settle: 600 },
  { name: 'fallback', scroll: 0, settle: 300 },
  { name: 'rm', scroll: 0, reducedMotion: true, settle: 400 },
  { name: 'mobile', scroll: 0, viewport: 'mobile', settle: 600 },
];

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
  return out;
}
