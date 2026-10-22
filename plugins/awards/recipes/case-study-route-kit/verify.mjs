// Real navigations between the two pages: click, then wait for the other page's body (selector waits survive a page load).
const toCase = [{ type: 'click', selector: '.work__link[href="./case.html"]' }, { type: 'waitFor', selector: 'body[data-page="case"]', state: 'attached' }, { type: 'wait', ms: 500 }];
const toNext = [{ type: 'click', selector: '[data-next]' }, { type: 'waitFor', selector: 'body[data-page="index"]', state: 'attached' }, { type: 'wait', ms: 500 }];
// The --pseudo pass only loads index.html, so the case page gets the same stress here: every word about 40 % longer, right-to-left.
const lengthen = {
  type: 'waitFor',
  fn: `(() => {
    if (window.__long) return true;
    window.__long = true;
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest('script,style,svg') || !n.textContent.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    for (const n of nodes) n.textContent = n.textContent.replace(/[A-Za-z]{2,}/g, (w) => w + 'ẍ'.repeat(Math.ceil(w.length * 0.4)));
    document.documentElement.dir = 'rtl';
    return true;
  })()`,
};

export const states = [
  { name: 'index', settle: 300 },
  { name: 'case', actions: toCase, settle: 300 },
  { name: 'case-mid', actions: toCase, scroll: 0.5, settle: 1300 },
  { name: 'case-end', actions: toCase, scroll: 1, settle: 1300 },
  { name: 'next', actions: [...toCase, ...toNext], settle: 300 },
  { name: 'rm', reducedMotion: true, actions: toCase, scroll: 0.5, settle: 700 },
  { name: 'mobile-index', viewport: 'mobile', settle: 300 },
  { name: 'mobile-case', viewport: 'mobile', actions: toCase, settle: 300 },
  { name: 'mobile-case-end', viewport: 'mobile', actions: toCase, scroll: 1, settle: 1300 },
  { name: 'mobile-case-long', viewport: 'mobile', actions: [...toCase, lengthen, { type: 'wait', ms: 400 }], settle: 300 },
];

export async function probe() {
  const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  const px = (el) => (el ? parseFloat(getComputedStyle(el).fontSize) : 0);
  const text = (el) => el?.textContent.replace(/\s+/g, ' ').trim() ?? '';
  // Layout shift since navigation start, read from the buffered entries (shifts right after input do not count).
  const shiftSupported = PerformanceObserver.supportedEntryTypes?.includes('layout-shift') ?? false;
  const cls = await new Promise((resolve) => {
    let sum = 0, entries = 0;
    try {
      const po = new PerformanceObserver((list) => { for (const e of list.getEntries()) { entries++; if (!e.hadRecentInput) sum += e.value; } });
      po.observe({ type: 'layout-shift', buffered: true });
      setTimeout(() => { po.disconnect(); resolve({ sum: Number(sum.toFixed(4)), entries }); }, 300);
    } catch (e) { resolve({ sum: null, error: String(e) }); }
  });
  const vw = document.documentElement.clientWidth;
  const next = document.querySelector('[data-next]');
  const h1 = document.querySelector('h1');
  const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
  const bodyP = document.querySelector('.case-text__body p');
  return {
    page: document.body.dataset.page,
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content ?? '',
    h1Count: document.querySelectorAll('h1').length,
    h1Px: px(h1),
    articles: document.querySelectorAll('article').length,
    meta: [...document.querySelectorAll('.case-head .case-meta > div > dt')].map(text),
    credits: [...document.querySelectorAll('.case-head dl.credits > div')].map((d) => [text(d.querySelector('dt')), text(d.querySelector('dd'))]),
    figures: [...document.querySelectorAll('article figure')].map((f) => {
      const m = f.querySelector('.media');
      return { caption: text(f.querySelector('figcaption')).length > 20, ratio: m ? getComputedStyle(m).aspectRatio : 'none', h: m?.getBoundingClientRect().height ?? 0, label: f.querySelector('svg')?.getAttribute('aria-label')?.length ?? 0 };
    }),
    rows: [...document.querySelectorAll('[data-row]')].map((el) => ({ row: el.dataset.row, family: el.dataset.family, ...rect(el) })),
    open: rect(document.querySelector('.plate--open .media')),
    numerals: rect(document.querySelector('.plate--type .media')),
    pairA: rect(document.querySelector('.pair__a')),
    pairB: rect(document.querySelector('.pair__b')),
    leadCaption: rect(document.querySelector('.lead__caption')),
    leadMedia: rect(document.querySelector('.lead .media')),
    // Characters per line, estimated at half an em per character (the audit's L07 measure).
    measure: bodyP ? Math.round(bodyP.getBoundingClientRect().width / (px(bodyP) * 0.5)) : null,
    facts: document.querySelectorAll('.facts__list > div').length,
    next: next ? { href: next.getAttribute('href'), url: next.href, titlePx: px(next.querySelector('.next__title')), media: rect(next.querySelector('.next__media')), ...rect(next) } : null,
    caseLink: document.querySelector('.work__link')?.getAttribute('href') ?? null,
    works: document.querySelectorAll('.works > li').length,
    target: location.hash ? { id: location.hash.slice(1), exists: !!target, matches: !!target?.matches(':target'), top: target?.getBoundingClientRect().top ?? null } : null,
    reveals: [...document.querySelectorAll('[data-reveal]')].map((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { pending: el.classList.contains('is-pending'), inView: r.top < innerHeight && r.bottom > 0, opacity: Number(cs.opacity), transform: cs.transform }; }),
    cls: { ...cls, supported: shiftSupported },
    vw,
    vh: innerHeight,
    overflow: document.documentElement.scrollWidth > vw + 1,
  };
}

export function assert(r) {
  const out = [];
  const P = (n) => r[n]?.probe ?? {};
  const S = (n) => r[n]?.state ?? {};
  const c = P('case');
  const ident = /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/;

  // Both routes load, each with its own head.
  out.push({ ok: P('index').page === 'index' && P('index').h1Count === 1 && P('index').works === 4 && P('index').caseLink === './case.html', message: `index: one h1, four works, a link to case.html (${P('index').caseLink})` });
  out.push({ ok: c.page === 'case' && S('case').page === 'case' && c.title !== P('index').title && /Kestrel Yard/.test(c.title) && c.description.length > 60 && P('index').description.length > 60, message: `case: loaded by a real navigation; its own <title> ("${c.title}") and description, distinct from the index` });

  // The title block.
  out.push({ ok: c.h1Count === 1 && c.articles === 1 && ['Client', 'Year', 'Role', 'Credits'].every((t) => c.meta?.includes(t)), message: `case: one h1 in one article; title block lists ${c.meta?.join(', ')}` });
  out.push({ ok: c.credits?.length >= 5 && c.credits.every(([dt, dd]) => dt && dd), message: `case: credits as a definition list, ${c.credits?.length} role / name pairs` });

  // Media: every figure captioned, labelled, sized by an aspect ratio before paint; nothing shifted.
  out.push({ ok: c.figures?.length === 5 && c.figures.every((f) => f.caption && f.label > 30 && f.ratio !== 'auto' && f.h > 100), message: `case: five figures, each with a figcaption, a labelled drawing and a set aspect ratio (${c.figures?.map((f) => f.ratio).join(' · ')})` });
  for (const n of ['index', 'case', 'mobile-case', 'next']) {
    out.push({ ok: P(n).cls?.supported === true && typeof P(n).cls?.sum === 'number' && P(n).cls.sum < 0.05, message: `${n}: layout shift ${P(n).cls?.sum} (< 0.05) over ${P(n).cls?.entries} entries, layout-shift observed: ${P(n).cls?.supported}` });
  }

  // The rhythm: rows in order, no two neighbours share a layout family, the title family returns only as the bookend.
  const rows = c.rows ?? [];
  const fam = rows.map((x) => x.family);
  out.push({ ok: rows.map((x) => x.row).join() === 'title,opening,brief,pair,map,numerals,facts,next' && fam.every((f, i) => i === 0 || f !== fam[i - 1]) && new Set(fam).size >= 4 && fam.filter((f) => f === fam[0]).length === 2 && fam.at(-1) === fam[0], message: `case: ${fam.join(' → ')}; neighbours differ, ${new Set(fam).size} families, the title's family only as the bookend` });
  out.push({ ok: c.open?.w >= c.vw - 1 && c.numerals?.w >= c.vw - 1 && c.open.x <= 0.5, message: `case: both plates run to the glass (${c.open?.w?.toFixed(0)} and ${c.numerals?.w?.toFixed(0)} of ${c.vw})` });
  const A = c.pairA ?? {}, B = c.pairB ?? {};
  out.push({ ok: B.x >= A.x + A.w && B.y - A.y > 40 && Math.abs(A.w - B.w) > 40, message: `case: offset pair side by side at two sizes, the second dropped ${(B.y - A.y)?.toFixed?.(0)} px` });
  const L = c.leadCaption ?? {}, M = c.leadMedia ?? {};
  out.push({ ok: L.x + L.w <= M.x + 1 && M.x + M.w >= c.vw - 1 && L.x > 0, message: `case: caption-led figure, caption left of the drawing, drawing bled right (to ${(M.x + M.w)?.toFixed?.(0)} of ${c.vw})` });
  out.push({ ok: c.measure > 30 && c.measure <= 75, message: `case: prose column at about ${c.measure} characters a line` });
  out.push({ ok: c.facts >= 4, message: `case: result as ${c.facts} ruled rows with units` });

  // The close: one link, its own image, the next title at display scale, pointing at a page that exists.
  out.push({ ok: c.next?.href === './index.html#harbour-almanac' && c.next.media?.h > 100 && c.next.titlePx >= 0.95 * c.h1Px, message: `case: next project with its own image, title at ${c.next?.titlePx}px against the h1's ${c.h1Px}px` });
  const t = P('next').target ?? {};
  out.push({ ok: P('next').page === 'index' && t.id === 'harbour-almanac' && t.exists && t.matches && t.top >= 0 && t.top < P('next').vh, message: `next: the close lands on a real page and row (${P('next').page}#${t.id}, :target ${t.matches}, top ${t.top?.toFixed?.(0)})` });

  // Motion: reveals only below the fold, faded in when reached; no travel under reduced motion.
  const mid = P('case-mid').reveals ?? [];
  out.push({ ok: S('case').pending > 0 && mid.filter((x) => x.inView).every((x) => !x.pending && x.opacity > 0.99), message: `case-mid: held-back reveals (${S('case').pending} at load) are in place once reached` });
  out.push({ ok: (P('case').reveals ?? []).filter((x) => x.inView).every((x) => !x.pending && x.opacity === 1), message: 'case: nothing in the first viewport is hidden' });
  const rm = P('rm').reveals ?? [];
  out.push({ ok: S('rm').motion === 'reduced' && rm.every((x) => ident.test(x.transform)) && rm.filter((x) => x.inView).every((x) => !x.pending && x.opacity > 0.99), message: 'rm: reveals fade without travel (no transform at any point)' });

  // Phone.
  for (const n of ['index', 'case', 'case-end', 'mobile-index', 'mobile-case', 'mobile-case-end', 'mobile-case-long', 'next']) {
    if (P(n).overflow) out.push({ ok: false, message: `${n}: horizontal overflow` });
  }
  out.push({ ok: ['mobile-index', 'mobile-case', 'mobile-case-end'].every((n) => P(n).vw === 390 && P(n).overflow === false), message: 'mobile: no horizontal overflow at 390 px on either page' });
  out.push({ ok: P('mobile-case-long').page === 'case' && P('mobile-case-long').overflow === false, message: 'mobile-case-long: the case page with every word 40 % longer, right-to-left, still fits 390 px' });
  const m = P('mobile-case');
  out.push({ ok: m.open?.w >= m.vw - 1 && m.open.h > m.open.w && m.leadMedia?.w >= m.vw - 1 && m.pairB?.x > m.pairA?.x + 20 && m.pairB.y > m.pairA.y + m.pairA.h, message: `mobile-case: opening plate recropped to portrait (${m.open?.w?.toFixed(0)}×${m.open?.h?.toFixed(0)}), figures stacked, the pair keeps one offset step` });
  const me = P('mobile-case-end');
  out.push({ ok: me.next?.y < me.vh && me.next?.y + me.next?.h > 0 && me.next.w <= me.vw, message: 'mobile-case-end: the next-project close is on screen at the end' });
  return out;
}
