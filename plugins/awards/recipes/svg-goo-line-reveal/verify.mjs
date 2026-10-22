// The headings as index.html writes them: the accessibility tree must name each one with exactly this sentence.
const SOURCE = [
  'Letters gather out of a pool of ink.',
  'Every line owns its filter, so the second can still be pooling while the first has already set.',
  'When the last line lands, the filters and the split are gone and the heading is plain text again.',
  'Under reduced motion the heading only fades in.',
];

// Bring a heading's top to 60 % of the viewport (past the `top 85%` start), then wait.
const to = (sel, ms) => [
  { type: 'waitFor', fn: `(() => { const el = document.querySelector('${sel}'); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.6); return true; })()` },
  { type: 'wait', ms },
];

export const states = [
  { name: 'top', scroll: 0, settle: 2600 },
  { name: 'mid', settle: 300, actions: to('#c1', 320) },
  { name: 'done', scroll: 1, settle: 2800 },
  { name: 'once', settle: 300, actions: [...to('#c1', 2400), { type: 'waitFor', fn: '(() => { window.scrollTo(0, 0); return true; })()' }, { type: 'wait', ms: 400 }, ...to('#c1', 400)] },
  { name: 'rm', reducedMotion: true, settle: 300, actions: to('#c2', 150) },
  { name: 'rm-done', reducedMotion: true, scroll: 1, settle: 1200 },
  { name: 'mobile', viewport: 'mobile', scroll: 0, settle: 2600 },
];

// Read what renders: the first line's filter and the blur it points at, every computed filter inside the headings,
// whether the text selects as written, and opacity for the reduced fade.
export function probe() {
  const line = document.querySelector('#c1 .goo-line');
  const f = line ? getComputedStyle(line).filter : 'none';
  const id = /#([\w-]+)/.exec(f)?.[1];
  const blur = id ? Number(document.getElementById(id)?.querySelector('feGaussianBlur')?.getAttribute('stdDeviation')) : null;
  const goo = [...document.querySelectorAll('[data-goo]')];
  const filteredIn = (h) => [h, ...h.querySelectorAll('*')].filter((el) => getComputedStyle(el).filter !== 'none').length;
  const filtered = goo.reduce((n, h) => n + filteredIn(h), 0);
  const selected = goo.map((h) => {
    const r = document.createRange();
    r.selectNodeContents(h);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    const text = sel.toString().replace(/\s+/g, ' ').trim();
    sel.removeAllRanges();
    return { text, userSelect: getComputedStyle(h).userSelect };
  });
  return {
    c1Filter: f,
    c1Blur: blur,
    filtered,
    filteredById: Object.fromEntries(goo.map((h) => [h.id, filteredIn(h)])),
    filterNodes: document.querySelectorAll('filter').length,
    selected,
    opacity: Object.fromEntries(goo.map((h) => [h.id, Number(getComputedStyle(h).opacity)])),
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  };
}

// The accessibility tree, read in Node: each heading's name as assistive tech gets it.
export async function inspect(page) {
  const yaml = await page.locator('main').ariaSnapshot();
  return { headings: [...yaml.matchAll(/- heading "([^"]+)" \[level=\d\]/g)].map((m) => m[1]) };
}

export function assert(r) {
  const out = [];
  const s = (k) => r[k]?.state ?? {};
  const p = (k) => r[k]?.probe ?? {};
  const h = (k, id) => s(k).headings?.find((x) => x.id === id) ?? {};
  const same = (a) => Array.isArray(a) && a.length === SOURCE.length && a.every((x, i) => x === SOURCE[i]);

  const t = h('top', 't');
  out.push({ ok: t.status === 'done' && t.plays === 1 && t.lines >= 2 && t.clearAtEnd === true && t.matchesSource === true && !t.split, message: `the hero condenses on load and lands as its source markup (${t.lines} lines, each filter off as it landed, split reverted)` });
  out.push({ ok: ['c1', 'c2', 'c3'].every((id) => h('top', id).status === 'armed' && h('top', id).plays === 0) && s('top').filtersLive > 0, message: `below the fold the headings wait, split and pooled (${s('top').filtersLive} line filters waiting)` });

  const m = h('mid', 'c1');
  out.push({ ok: m.status === 'playing' && m.lines >= 2 && /url\(/.test(p('mid').c1Filter) && p('mid').c1Blur > 0, message: `mid reveal: the first line of the chapter heading is filtered, stdDeviation ${p('mid').c1Blur?.toFixed?.(2)} > 0 (${m.lines} lines, ${p('mid').c1Filter})` });
  out.push({ ok: m.ariaLabel === SOURCE[1] && same(r.mid?.inspect?.headings), message: 'mid reveal: the heading is still named by its whole sentence' });

  const d = s('done');
  out.push({ ok: d.headings?.every((x) => x.status === 'done' && x.plays === 1 && x.clearAtEnd === true && x.matchesSource && !x.split && x.ariaLabel === null), message: `after the reveals every line's filter came off as it landed and every heading is its source markup again (${d.headings?.map((x) => x.status).join(', ')})` });
  out.push({ ok: p('done').filtered === 0 && p('done').filterNodes === 0 && d.filtersLive === 0 && d.filtersRemoved === d.filtersApplied, message: `nothing left behind: ${p('done').filtered} filtered elements, ${p('done').filterNodes} <filter> nodes (${d.filtersRemoved}/${d.filtersApplied} removed)` });
  out.push({ ok: same(r.done?.inspect?.headings), message: `the ARIA snapshot names each heading with its source sentence (${JSON.stringify(r.done?.inspect?.headings?.[2])})` });
  out.push({ ok: p('done').selected?.every((x, i) => x.text === SOURCE[i] && x.userSelect !== 'none'), message: 'every heading selects as its source text' });

  const o = h('once', 'c1');
  out.push({ ok: o.status === 'done' && o.plays === 1 && p('once').filteredById?.c1 === 0, message: `scrolled away and back, the heading plays once and stays plain (${o.plays} play)` });

  const rm = s('rm');
  out.push({ ok: rm.motion === 'reduced' && rm.filtersApplied === 0 && rm.filtersLive === 0 && p('rm').filterNodes === 0 && p('rm').filtered === 0 && rm.headings?.every((x) => x.lines === 0 && !x.split), message: `reduced motion: no filter applied at any time, no split (${rm.filtersApplied} filters ever)` });
  const op = p('rm').opacity?.c2;
  out.push({ ok: h('rm', 'c2').plays === 1 && op > 0 && op < 1, message: `reduced motion: the heading fades in instead (opacity ${op} mid fade)` });
  const rd = s('rm-done');
  out.push({ ok: rd.filtersApplied === 0 && rd.fades === 4 && rd.headings?.every((x) => x.status === 'done' && x.matchesSource) && Object.values(p('rm-done').opacity ?? {}).every((v) => v === 1), message: `reduced motion: every heading faded once to full opacity, never filtered (${rd.fades} fades)` });

  const mb = h('mobile', 't');
  out.push({ ok: mb.status === 'done' && mb.lines >= 2 && mb.clearAtEnd === true && p('mobile').overflow === false, message: `mobile: the hero condenses in ${mb.lines} lines and lands plain, no horizontal overflow` });
  return out;
}
