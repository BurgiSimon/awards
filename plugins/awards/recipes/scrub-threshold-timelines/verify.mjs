// The verify idea: scroll to a fraction of the scene's scrub window and wait. A copy timeline played at a threshold
// has finished on its own clock (progress exactly 1); past the next threshold, or back below the first, it has
// reversed to 0. A copy timeline that was scrubbed by mistake reads a fractional progress and fails.
const at = (f) => `(() => { const g = window.__awards.state().window; if (!g) return false; window.lenis.scrollTo(Math.round(g[0] + (g[1] - g[0]) * ${f}), { immediate: true, force: true }); return true; })()`;
const go = (f, ms = 1000) => [{ type: 'waitFor', fn: at(f) }, { type: 'wait', ms }];
const staticTier = { type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" };

export const states = [
  { name: 'top', settle: 300, actions: go(0.1, 600) },
  { name: 'a', settle: 300, actions: go(0.45) },
  { name: 'b', settle: 300, actions: [...go(0.45), ...go(0.7)] },
  { name: 'back', settle: 300, actions: [...go(0.45), ...go(0.15)] },
  { name: 'final', settle: 300, actions: go(0.9) },
  // Mid-flight: 100 ms after crossing the threshold the entrance is under way, not jumped to the end.
  { name: 'flight', settle: 0, actions: [...go(0.2, 400), ...go(0.45, 100)] },
  { name: 'rm', reducedMotion: true, settle: 300, actions: go(0.45) },
  { name: 'static', settle: 0, actions: [staticTier, { type: 'wait', ms: 300 }, ...go(0.45, 60)] },
  { name: 'mobile', viewport: 'mobile', settle: 300, actions: go(0.45) },
  // One tier change, one rebuild: the attribute path and the media-query path, each measured in inspect().
  { name: 'retier', settle: 300, actions: go(0.45) },
];

const builds = (page) => page.evaluate(() => window.__awards.state().builds);
export async function inspect(page, st) {
  if (st.name !== 'retier') return null;
  const b0 = await builds(page);
  await page.evaluate(() => { document.documentElement.dataset.motion = 'reduced'; });
  await page.waitForTimeout(300);
  const b1 = await builds(page);
  await page.evaluate(() => { delete document.documentElement.dataset.motion; });
  await page.waitForTimeout(300);
  const b2 = await builds(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(300);
  const b3 = await builds(page);
  // A forced tier outranks the media query: flipping the query under it changes nothing, so nothing rebuilds.
  await page.evaluate(() => { document.documentElement.dataset.motion = 'static'; });
  await page.waitForTimeout(300);
  const b4 = await builds(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForTimeout(300);
  const b5 = await builds(page);
  return { attr: b1 - b0, attrBack: b2 - b1, media: b3 - b2, forced: b4 - b3, mediaUnderForced: b5 - b4, motion: await page.evaluate(() => window.__awards.state().motion) };
}

export function probe() {
  const op = (sel) => Number(getComputedStyle(document.querySelector(sel)).opacity);
  const line = document.querySelector('[data-copy] .copy__line');
  return {
    closed: op('[data-step="closed"]'),
    open: op('[data-step="open"]'),
    copyOpacity: op('[data-copy] .copy__line'),
    copyTransform: getComputedStyle(line).transform,
    overflowX: document.documentElement.scrollWidth - innerWidth,
  };
}

export function assert(r) {
  const out = [];
  const S = (k) => r[k]?.state || {};
  const P = (k) => r[k]?.probe || {};
  const near = (v, x, e = 0.03) => Math.abs((v ?? NaN) - x) <= e;

  out.push({ ok: S('top').copyP === 0 && S('top').finalP === 0, message: `top: no copy before the first threshold (copy ${S('top').copyP}, final ${S('top').finalP})` });
  // The key assertion: progress is exactly 1 at a, not the fraction of the scrub.
  out.push({ ok: near(S('a').scrubP, 0.45) && S('a').copyP === 1 && P('a').copyOpacity === 1, message: `a: scrub ${S('a').scrubP}, copy timeline progress ${S('a').copyP} (want 1), opacity ${P('a').copyOpacity}` });
  out.push({ ok: near(S('b').scrubP, 0.7) && S('b').copyP === 0 && P('b').copyOpacity === 0, message: `b: past the second threshold the copy reversed to ${S('b').copyP} (want 0)` });
  out.push({ ok: near(S('back').scrubP, 0.15) && S('back').copyP === 0, message: `back: below the first threshold the copy reversed to ${S('back').copyP} (want 0)` });
  out.push({ ok: S('final').finalP === 1 && S('final').copyP === 0, message: `final: last line ${S('final').finalP} (want 1), copy ${S('final').copyP} (want 0)` });
  out.push({ ok: S('flight').copyP > 0 && S('flight').copyP < 1, message: `flight: 100 ms after the threshold the entrance is playing (${S('flight').copyP})` });

  // The step change inside the scrub: two .001 s tweens at .5, so the label is fully one or the other.
  out.push({ ok: P('a').closed === 1 && P('a').open === 0 && P('b').closed === 0 && P('b').open === 1, message: `step: closed/open ${P('a').closed}/${P('a').open} at .45, ${P('b').closed}/${P('b').open} at .7` });
  out.push({ ok: S('a').open > 0.3 && S('a').frame > 40 && S('a').frame < 70, message: `scrub: bloom open ${S('a').open}, frame ${S('a').frame} at .45` });

  out.push({ ok: S('rm').motion === 'reduced' && S('rm').copyP === 1 && S('rm').open === 0 && ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(P('rm').copyTransform) && P('rm').open === 0, message: `rm: copy fades in (${S('rm').copyP}, transform ${P('rm').copyTransform}), bloom still (${S('rm').open}), step closed` });
  out.push({ ok: S('static').motion === 'static' && S('static').copyP === 1, message: `static: copy snapped to ${S('static').copyP} within 60 ms` });
  out.push({ ok: S('mobile').copyP === 1 && P('mobile').copyOpacity === 1 && P('mobile').overflowX <= 0 && P('a').overflowX <= 0, message: `mobile: copy ${S('mobile').copyP}, overflow ${P('mobile').overflowX}px` });
  const t = r.retier?.inspect || {};
  out.push({ ok: t.attr === 1 && t.attrBack === 1 && t.media === 1 && t.forced === 1 && t.mediaUnderForced === 0 && t.motion === 'static', message: `retier: one rebuild per tier change (attribute ${t.attr}, back ${t.attrBack}, media query ${t.media}, forced ${t.forced}; want 1 each), none when the query flips under a forced tier (${t.mediaUnderForced}, want 0; tier ${t.motion})` });
  return out;
}
