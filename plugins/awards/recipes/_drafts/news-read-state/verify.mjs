// Every state opens a fresh browser context, so localStorage starts empty (a first visit); `reload` keeps it within a
// state (a return visit). Checked: the first visit's count in the menu and on the entries, no read and no announcement
// on load, opening (by keyboard) reads and decrements, a reload keeps it, mark all, reads from dwelling after a
// scroll, a published entry arriving on the return visit, storage that throws, reduced motion, and the phone.
const entry = (n) => `[data-entry]:nth-child(${n})`;
const toggle = (n) => `${entry(n)} summary`;
const toList = { type: 'waitFor', fn: "(() => { const l = document.querySelector('[data-diary]'); scrollTo(0, l.getBoundingClientRect().top + scrollY - document.querySelector('[data-masthead]').offsetHeight - 16); return true; })()" };
const blocked = [{ type: 'waitFor', fn: "(history.replaceState(null, '', '?storage=blocked'), true)" }, { type: 'reload' }, { type: 'wait', ms: 400 }];
const publish = [{ type: 'click', selector: '[data-publish]' }, { type: 'wait', ms: 1200 }, { type: 'waitFor', selector: '[data-arrival]', state: 'attached' }, { type: 'wait', ms: 500 }];

export const states = [
  { name: 'top', settle: 2400 },
  // The explorer's frame: the list just under the menu, the second entry opened, the first still marked new.
  { name: 'scene', frame: true, settle: 600, actions: [{ type: 'waitFor', fn: "(() => { const l = document.querySelector('[data-diary]'); scrollTo(0, l.getBoundingClientRect().top + scrollY - document.querySelector('[data-masthead]').offsetHeight - 76); return true; })()" }, { type: 'click', selector: toggle(2) }, { type: 'wait', ms: 450 }] },
  { name: 'open', settle: 600, actions: [{ type: 'focus', selector: toggle(2) }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 600 }] },
  { name: 'reload', settle: 600, actions: [{ type: 'click', selector: toggle(1) }, { type: 'wait', ms: 400 }, { type: 'reload' }, { type: 'wait', ms: 600 }] },
  { name: 'mark-all', settle: 600, actions: [{ type: 'click', selector: '[data-mark-all]' }, { type: 'wait', ms: 600 }] },
  { name: 'mark-all-reload', settle: 600, actions: [{ type: 'click', selector: '[data-mark-all]' }, { type: 'wait', ms: 300 }, { type: 'reload' }, { type: 'wait', ms: 600 }] },
  { name: 'dwell', settle: 900, actions: [toList, { type: 'wait', ms: 2400 }] },
  { name: 'publish', settle: 600, actions: publish },
  { name: 'blocked', settle: 600, actions: [...blocked, { type: 'click', selector: toggle(1) }, { type: 'wait', ms: 600 }] },
  { name: 'rm', reducedMotion: true, settle: 600, actions: [...publish, { type: 'click', selector: toggle(3) }, { type: 'wait', ms: 300 }] },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: [{ type: 'click', selector: toggle(1) }, { type: 'wait', ms: 600 }] },
];

export function probe() {
  const header = document.querySelector('[data-masthead]');
  const hb = header.getBoundingClientRect().bottom;
  const entries = [...document.querySelectorAll('[data-entry]')].map((li) => {
    const b = li.getBoundingClientRect();
    const flag = li.querySelector('[data-flag]');
    const rule = getComputedStyle(li, '::before');
    const body = li.querySelector('.entry__body');
    return {
      id: li.dataset.id,
      unreadStyle: li.classList.contains('is-unread'),
      flag: flag.checkVisibility({ opacityProperty: true }),
      flagText: flag.checkVisibility() ? flag.textContent.trim() : null,
      titleWeight: getComputedStyle(li.querySelector('.entry__title')).fontWeight,
      open: li.querySelector('details').open,
      arrival: li.hasAttribute('data-arrival'),
      ruleAnim: rule.animationName,
      ruleScale: new DOMMatrixReadOnly(rule.transform === 'none' ? undefined : rule.transform).a,
      wash: getComputedStyle(li).animationName,
      bodyAnim: li.querySelector('details').open ? getComputedStyle(body).animationName : null,
      top: b.top, bottom: b.bottom,
      datetime: li.querySelector('time').getAttribute('datetime'),
      isArticle: !!li.querySelector(':scope > article[aria-labelledby] h2'),
    };
  });
  let stored = null;
  try { stored = JSON.parse(localStorage.getItem('mlb-diary')); } catch (e) { stored = `throws ${e.name}`; }
  const a = document.activeElement;
  return {
    entries,
    nav: document.querySelector('[data-news-link]').innerText.replace(/\s+/g, ' ').trim(),
    countHidden: document.querySelector('[data-count]').hidden,
    summary: document.querySelector('[data-summary]').textContent,
    markAllDisabled: document.querySelector('[data-mark-all]').getAttribute('aria-disabled'),
    status: document.querySelector('[data-status]').textContent,
    statusRole: document.querySelector('[data-status]').getAttribute('role'),
    note: document.querySelector('[data-storage-note]').textContent,
    publishDisabled: document.querySelector('[data-publish]').getAttribute('aria-disabled'),
    stored,
    search: location.search,
    active: a?.matches?.('summary') ? a.closest('[data-entry]').dataset.id : a?.tagName.toLowerCase() ?? null,
    headerBottom: hb,
    vh: innerHeight,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side: the menu link and the list as assistive technology reads them.
export async function inspect(page, st) {
  if (!['top', 'open'].includes(st.name)) return null;
  return { nav: await page.locator('[data-masthead] nav').ariaSnapshot(), list: st.name === 'top' ? await page.locator('[data-diary]').ariaSnapshot() : null };
}

const FRESH = ['2026-10-24-lantern', '2026-10-17-tiles', '2026-10-09-chimney'];

export function assert(r) {
  const S = (n) => r[n]?.state || {};
  const P = (n) => r[n]?.probe || {};
  const out = [];
  const flagged = (n) => (P(n).entries || []).filter((e) => e.flag).map((e) => e.id);
  const styled = (n) => (P(n).entries || []).filter((e) => e.unreadStyle).map((e) => e.id);
  const ids = (a) => (a || []).join(', ');

  // First visit.
  const t = P('top');
  out.push({ ok: S('top').firstVisit && S('top').unread === 3 && ids(S('top').unreadIds) === ids(FRESH), message: `first visit: the 3 entries from the 21 days before the newest are new (${ids(S('top').unreadIds)})` });
  out.push({ ok: t.nav === 'News 3 new' && t.countHidden === false && /^3 new of 9/.test(t.summary), message: `first visit: the menu reads "${t.nav}" and the list "${t.summary}"` });
  out.push({ ok: ids(flagged('top')) === ids(FRESH) && ids(styled('top')) === ids(FRESH) && (t.entries || []).every((e) => (e.flag ? e.flagText === ', New' && e.titleWeight === '700' : e.titleWeight === '400')), message: `first visit: each new entry carries the text mark and the style, the others neither (${flagged('top').length} marks)` });
  out.push({ ok: (t.entries || []).length === 9 && t.entries.every((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.datetime) && e.isArticle), message: 'first visit: nine list items, each an <article> named by its <h2>, each with <time datetime="YYYY-MM-DD">' });
  out.push({ ok: S('top').dwellReads === 0 && S('top').armed === false && t.status === '' && S('top').announced === 0 && t.statusRole === 'status', message: `on load: nothing is read for the visitor and nothing is announced after 2.4 s (dwell reads ${S('top').dwellReads}, status "${t.status}")` });
  out.push({ ok: S('top').arrivals?.length === 0 && (t.entries || []).every((e) => !e.arrival), message: 'first visit: no arrival, since there is no last visit to compare with' });
  out.push({ ok: t.stored?.seen === '2026-10-24' && t.stored?.since === '2026-10-03' && Array.isArray(t.stored?.read), message: `first visit: storage holds the horizon and the newest entry seen (${JSON.stringify(t.stored)})` });
  const nav = r.top?.inspect?.nav || '';
  out.push({ ok: /link "News 3 new"/.test(nav), message: `menu: the link's accessible name carries the count (${(nav.match(/link "News[^"]*"/) || ['none'])[0]})` });
  out.push({ ok: /- list/.test(r.top?.inspect?.list || '') && (r.top?.inspect?.list.match(/- listitem/g) || []).length === 9 && /article "The roof lantern goes back on , New"|article "The roof lantern goes back on, New"/.test(r.top?.inspect?.list || ''), message: 'list: nine list items read as articles whose names carry the New mark' });

  // Opening by keyboard.
  const o = P('open'), os = S('open');
  const opened = (o.entries || [])[1] || {};
  out.push({ ok: opened.open && os.readBy?.['2026-10-17-tiles'] === 'open' && os.unread === 2 && !opened.flag && !opened.unreadStyle && o.active === '2026-10-17-tiles', message: `keyboard: Enter on the second entry opens it, reads it, keeps focus there (open ${opened.open}, unread ${os.unread}, focus ${o.active})` });
  out.push({ ok: o.nav === 'News 2 new' && /^2 new of 9/.test(o.summary) && o.status === 'Marked as read. 2 new left.', message: `open: the menu reads "${o.nav}" and the status says "${o.status}"` });
  out.push({ ok: /link "News 2 new"/.test(r.open?.inspect?.nav || ''), message: 'open: the menu link\'s accessible name follows the count' });
  out.push({ ok: o.stored?.read?.includes('2026-10-17-tiles'), message: `open: the read mark is stored (${JSON.stringify(o.stored?.read)})` });

  // Return visit.
  const rl = S('reload');
  out.push({ ok: !rl.firstVisit && rl.unread === 2 && !rl.unreadIds?.includes('2026-10-24-lantern') && P('reload').nav === 'News 2 new' && !flagged('reload').includes('2026-10-24-lantern'), message: `reload: the entry read before it stays read (unread ${ids(rl.unreadIds)}, menu "${P('reload').nav}")` });
  out.push({ ok: rl.arrivals?.length === 0 && P('reload').status === '', message: 'reload: nothing new arrived since the last visit, and nothing is announced on load' });

  // Mark all.
  const m = P('mark-all');
  out.push({ ok: S('mark-all').unread === 0 && m.nav === 'News' && m.countHidden && flagged('mark-all').length === 0 && styled('mark-all').length === 0, message: `mark all: no marks left, the menu reads "${m.nav}"` });
  out.push({ ok: m.status === 'All 3 marked as read. Nothing new left.' && m.markAllDisabled === 'true' && /^All 9 entries read/.test(m.summary), message: `mark all: announced ("${m.status}"), the button now aria-disabled, "${m.summary}"` });
  out.push({ ok: S('mark-all-reload').unread === 0 && P('mark-all-reload').nav === 'News', message: 'mark all: still all read after a reload' });

  // Dwell after a scroll.
  const d = P('dwell'), ds = S('dwell');
  const dwelt = Object.entries(ds.readBy || {}).filter(([, how]) => how === 'dwell').map(([id]) => id);
  const box = (id) => (d.entries || []).find((e) => e.id === id) || {};
  out.push({ ok: ds.armed && dwelt.length >= 1 && dwelt.every((id) => box(id).top >= d.headerBottom - 1 && box(id).bottom <= d.vh + 1) && ds.unread === 3 - dwelt.length, message: `dwell: after a scroll, entries wholly in view below the header for 1.2 s are read (${ids(dwelt)}; ${ds.unread} new left)` });
  out.push({ ok: new RegExp(`^${dwelt.length} entr(y|ies) marked as read as you scrolled\\.`).test(d.status), message: `dwell: one announcement for the batch ("${d.status}")` });

  // A published entry arrives on the return visit.
  const p = P('publish'), ps = S('publish');
  const first = (p.entries || [])[0] || {};
  out.push({ ok: ps.unread === 4 && ids(ps.arrivals) === '2026-10-27-small-pool' && first.id === '2026-10-27-small-pool' && first.arrival && (p.entries || []).filter((e) => e.arrival).length === 1, message: `return visit: the entry published since arrives at the top, alone (${ids(ps.arrivals)}; ${ps.unread} new)` });
  out.push({ ok: first.ruleAnim === 'rule-in' && first.wash === 'wash' && p.nav === 'News 4 new' && p.status === '', message: `return visit: a quiet arrival (rule ${first.ruleAnim}, wash ${first.wash}), the menu reads "${p.nav}", nothing announced` });
  out.push({ ok: p.publishDisabled === 'true' && first.top > 0 && first.bottom < p.vh, message: `return visit: it starts at the top with the arrival in view (${Math.round(first.top)}–${Math.round(first.bottom)} of ${p.vh}), and the demo cannot publish the same entry twice` });

  // Storage that throws.
  const b = P('blocked'), bs = S('blocked');
  out.push({ ok: b.search === '?storage=blocked' && /^throws/.test(String(b.stored)) && bs.storage === 'memory', message: `blocked storage: localStorage throws (${b.stored}) and the page runs from memory` });
  out.push({ ok: bs.initialUnread === 3 && bs.unread === 2 && b.nav === 'News 2 new' && b.status === 'Marked as read. 2 new left.' && !(r.blocked?.errors || []).length, message: `blocked storage: it still counts 3, reads on open and announces ("${b.nav}", "${b.status}")` });
  out.push({ ok: /refusing site storage/.test(b.note) && b.publishDisabled === 'true', message: 'blocked storage: the page says it cannot remember, and the demo controls that need storage are aria-disabled' });

  // Reduced motion.
  const rm = P('rm'), rmFirst = (rm.entries || [])[0] || {};
  const rmOpen = (rm.entries || []).find((e) => e.open) || {};
  out.push({ ok: S('rm').motion === 'reduced' && rmFirst.arrival && rmFirst.ruleAnim === 'none' && rmFirst.ruleScale === 1 && rmFirst.wash === 'wash', message: `reduced motion: the arrival keeps its colour wash but its rule is drawn already (rule ${rmFirst.ruleAnim}, scale ${rmFirst.ruleScale})` });
  out.push({ ok: rmOpen.bodyAnim === 'body-fade' && P('open').entries?.[1]?.bodyAnim === 'body-in', message: `reduced motion: an opened entry fades in without rising (${rmOpen.bodyAnim}; full tier ${P('open').entries?.[1]?.bodyAnim})` });

  // Phone.
  const mo = P('mobile');
  out.push({ ok: (mo.overflowX ?? 1) <= 0 && mo.nav === 'News 2 new' && S('mobile').unread === 2 && mo.entries?.[0]?.open, message: `phone: no sideways overflow (${mo.overflowX} px); the menu still reads "${mo.nav}" after opening an entry` });
  return out;
}
