// States jump to a fraction of the fill section's sticky range (section top → section bottom minus one viewport),
// then wait for the .5 s scrub to catch up. Each state is a fresh page load.
const at = (f) => [
  { type: 'waitFor', fn: `(() => { const s = document.querySelector('[data-fill]'); window.scrollTo(0, s.offsetTop + (s.offsetHeight - innerHeight) * ${f}); return true; })()` },
  { type: 'wait', ms: 1400 },
];

export const states = [
  { name: 'top', scroll: 0, settle: 800 },
  { name: 'q1', settle: 400, actions: at(0.25) },
  { name: 'mid', settle: 400, actions: at(0.5) },
  { name: 'q3', settle: 400, actions: at(0.75) },
  { name: 'end', settle: 400, actions: at(1) },
  { name: 'rm', reducedMotion: true, settle: 400, actions: at(0.25) },
  { name: 'mobile', viewport: 'mobile', settle: 400, actions: at(0.5) },
];

// Read what renders: computed opacity per word, and whether the stage is actually on screen.
export function probe() {
  const text = document.querySelector('[data-fill-text]');
  const words = [...text.querySelectorAll('.word')];
  const ops = words.map((w) => Number(getComputedStyle(w).opacity));
  const r = text.getBoundingClientRect();
  return {
    words: words.length,
    full: ops.filter((o) => o >= 0.999).length,
    minOpacity: ops.length ? Math.min(...ops) : null,
    textOpacity: Number(getComputedStyle(text).opacity),
    onScreen: r.top >= 0 && r.bottom <= innerHeight && r.height > 0,
    sentence: text.textContent.replace(/\s+/g, ' ').trim(),
    overflowX: document.documentElement.scrollWidth - innerWidth,
  };
}

export function assert(r) {
  const out = [];
  const p = (k) => r[k]?.probe || {};
  const n = p('mid').words ?? 0;
  out.push({ ok: n >= 20, message: `statement split into words (${n})` });
  out.push({ ok: p('top').full === 0 && p('top').minOpacity === 0.5, message: `above the section every word rests at the floor (full ${p('top').full}, min ${p('top').minOpacity})` });
  const [a, b, c] = ['q1', 'mid', 'q3'].map((k) => p(k).full ?? -1);
  out.push({ ok: a > 0 && a < b && b < c, message: `words at full opacity rise with scroll: 25 % ${a} → 50 % ${b} → 75 % ${c} of ${n}` });
  out.push({ ok: b > 0 && b < n && p('mid').minOpacity < 0.999, message: `mid-section is part-read: ${b} of ${n} full, the rest dimmer (min ${p('mid').minOpacity})` });
  out.push({ ok: ['q1', 'mid', 'q3'].every((k) => p(k).onScreen), message: 'the statement stays on the sticky stage while it fills' });
  out.push({ ok: p('end').full === n && n > 0, message: `at the end of the section every word is full (${p('end').full} of ${n})` });
  const rm = r.rm || {};
  out.push({ ok: rm.state?.motion === 'reduced' && rm.state?.fillTier === 'reduced' && rm.probe?.words === 0 && rm.probe?.textOpacity === 1 && rm.probe?.sentence === p('top').sentence, message: `reduced motion: no split, the whole sentence at full opacity from the start (words ${rm.probe?.words}, opacity ${rm.probe?.textOpacity})` });
  const m = p('mobile');
  out.push({ ok: m.words === n && m.full > 0 && m.full < n && m.onScreen, message: `mobile fills on the same scroll (${m.full} of ${m.words} at 50 %)` });
  out.push({ ok: (m.overflowX ?? 1) <= 0, message: `mobile has no horizontal overflow (${m.overflowX}px)` });
  return out;
}
