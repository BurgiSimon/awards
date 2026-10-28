// Every state opens a fresh browser context, so localStorage starts empty (a first visit); `reload` keeps it within a
// state (a return visit). Checked: the first visit's count in the menu and on the entries, no read and no announcement
// on load, opening (by keyboard) reads and decrements, a reload keeps it, mark all, the dwell (not before 1.2 s, not
// for an entry cut by the masthead or the bottom edge, not from a restored scroll position, and with the masthead's
// measured height), a published entry arriving on the return visit and then being read, storage that throws, fails
// mid-visit or holds a broken record, the anchor and focus below the sticky masthead, the skip link, the reduced and
// static tiers, and the phone.
const entry = (n) => `[data-entry]:nth-child(${n})`;
const toggle = (n) => `${entry(n)} summary`;
const ARRIVAL = '2026-10-27-small-pool';
const LANTERN = '2026-10-24-lantern';
const TILES = '2026-10-17-tiles';
const CHIMNEY = '2026-10-09-chimney';
const FRESH = [LANTERN, TILES, CHIMNEY];

// Positioning without arming: scroll there, reload (the browser restores the position inside the first 600 ms, which
// must not arm the dwell), then a real wheel of 120 px arms it. `top` is where the first entry's top should end up,
// relative to the masthead's bottom, after the wheel.
const WHEEL = 120;
const placeFirstEntry = (top) => [
  { type: 'waitFor', fn: `(() => { const l = document.querySelector('[data-entry]'); const hb = document.querySelector('[data-masthead]').getBoundingClientRect().bottom; scrollTo(0, Math.round(l.getBoundingClientRect().top + scrollY - hb - (${top}) - ${WHEEL})); return true; })()` },
  { type: 'reload' },
  { type: 'wait', ms: 700 },
];
const wheel = { type: 'wheel', dx: 0, dy: WHEEL };
const blocked = [{ type: 'waitFor', fn: "(history.replaceState(null, '', '?storage=blocked'), true)" }, { type: 'reload' }, { type: 'wait', ms: 400 }];
const publish = [{ type: 'click', selector: '[data-publish]' }, { type: 'waitFor', selector: '[data-arrival]', state: 'attached' }];
// Holds every animation of the arrival at 90 ms (of the bar's 900 ms), so the drawing can be measured, not raced.
const holdArrival = { type: 'waitFor', fn: "(() => { const li = document.querySelector('[data-arrival]'); const all = li?.getAnimations({ subtree: true }) || []; if (!all.some((a) => a.animationName === 'rule-in')) return false; all.forEach((a) => { a.pause(); a.currentTime = 90; }); return true; })()" };
const logFocus = { type: 'waitFor', fn: "(window.__focusLog = [], addEventListener('focusin', (ev) => requestAnimationFrame(() => { const b = ev.target.getBoundingClientRect(); window.__focusLog.push({ tag: ev.target.tagName.toLowerCase(), top: Math.round(b.top), bottom: Math.round(b.bottom), hb: Math.round(document.querySelector('[data-masthead]').getBoundingClientRect().bottom) }); })), true)" };

export const states = [
  { name: 'top', settle: 2400 },
  // The explorer's frame: the list just under the menu, the second entry opened and read, the first and third still new.
  { name: 'scene', frame: true, settle: 600, actions: [{ type: 'waitFor', fn: "(() => { const l = document.querySelector('[data-diary]'); scrollTo(0, l.getBoundingClientRect().top + scrollY - document.querySelector('[data-masthead]').offsetHeight - 76); return true; })()" }, { type: 'click', selector: toggle(2) }, { type: 'wait', ms: 450 }] },
  { name: 'open', settle: 600, actions: [{ type: 'focus', selector: toggle(2) }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 600 }] },
  { name: 'reload', settle: 600, actions: [{ type: 'click', selector: toggle(1) }, { type: 'wait', ms: 400 }, { type: 'reload' }, { type: 'wait', ms: 600 }] },
  { name: 'mark-all', settle: 600, actions: [{ type: 'click', selector: '[data-mark-all]' }, { type: 'wait', ms: 700 }] },
  { name: 'mark-all-reload', settle: 600, actions: [{ type: 'click', selector: '[data-mark-all]' }, { type: 'wait', ms: 300 }, { type: 'reload' }, { type: 'wait', ms: 600 }] },
  // A restored scroll position, then a scripted scroll a moment after boot (as a late restoration or a fragment jump
  // would be), no wheel: nothing armed, nothing read.
  { name: 'restore', settle: 700, actions: [...placeFirstEntry(0).slice(0, 2), { type: 'waitFor', fn: '(scrollBy(0, 40), true)' }, { type: 'wait', ms: 2400 }] },
  // 800 ms after a real wheel, with three unread entries wholly in view: nothing read yet.
  { name: 'dwell-early', settle: 700, actions: [...placeFirstEntry(16), wheel, { type: 'wait', ms: 800 }] },
  // The first entry 40 px under the masthead, the next two wholly in view: only those two are read.
  { name: 'dwell', settle: 700, actions: [...placeFirstEntry(-40), wheel, { type: 'wait', ms: 2400 }] },
  // Scrolling back up to where the first two entries are wholly in view and the third runs 110 px past the bottom edge:
  // only the first two are read.
  { name: 'dwell-edge', settle: 700, actions: [{ type: 'waitFor', fn: `(() => { const c = document.querySelector('${entry(3)}'); scrollTo(0, Math.round(c.getBoundingClientRect().bottom + scrollY - innerHeight - 110 + ${WHEEL})); return true; })()` }, { type: 'reload' }, { type: 'wait', ms: 700 }, { type: 'wheel', dx: 0, dy: -WHEEL }, { type: 'wait', ms: 2400 }] },
  // The masthead grows to 120 px after load (a rotation, a wrapped nav); the first entry sits 30 px under its new edge.
  { name: 'dwell-masthead', settle: 700, actions: [...placeFirstEntry(-30 + 56), { type: 'waitFor', fn: "(document.querySelector('.masthead__inner').style.minHeight = '120px', true)" }, { type: 'wait', ms: 200 }, wheel, { type: 'wait', ms: 2400 }] },
  { name: 'publish', settle: 600, actions: [...publish, { type: 'wait', ms: 1500 }] },
  { name: 'arrive-draw', settle: 600, actions: [...publish, holdArrival] },
  { name: 'publish-read', settle: 600, actions: [...publish, { type: 'wait', ms: 1600 }, { type: 'click', selector: toggle(1) }, { type: 'wait', ms: 700 }] },
  { name: 'blocked', settle: 600, actions: [...blocked, { type: 'click', selector: toggle(1) }, { type: 'wait', ms: 600 }] },
  { name: 'quota', settle: 600, actions: [{ type: 'waitFor', fn: "(Storage.prototype.setItem = function () { throw new DOMException('The quota has been exceeded.', 'QuotaExceededError'); }, true)" }, { type: 'click', selector: toggle(1) }, { type: 'wait', ms: 600 }] },
  { name: 'corrupt', settle: 600, actions: [{ type: 'waitFor', fn: "(localStorage.setItem('mlb-diary', JSON.stringify({ v: 1, published: null, read: 5 })), true)" }, { type: 'reload' }, { type: 'wait', ms: 400 }] },
  { name: 'anchor', settle: 600, actions: [{ type: 'click', selector: '[data-news-link]' }, { type: 'wait', ms: 500 }] },
  { name: 'focus-back', settle: 600, actions: [logFocus, { type: 'focus', selector: '[data-publish]' }, { type: 'press', key: 'Shift+Tab' }, { type: 'press', key: 'Shift+Tab' }, { type: 'press', key: 'Shift+Tab' }, { type: 'press', key: 'Shift+Tab' }, { type: 'press', key: 'Shift+Tab' }, { type: 'wait', ms: 300 }] },
  { name: 'rm', reducedMotion: true, settle: 600, actions: [...publish, { type: 'wait', ms: 300 }, { type: 'click', selector: toggle(3) }, { type: 'wait', ms: 300 }] },
  { name: 'static', settle: 600, actions: [...publish, { type: 'wait', ms: 1600 }, { type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" }, { type: 'click', selector: toggle(1) }, { type: 'wait', ms: 60 }] },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: [{ type: 'click', selector: toggle(1) }, { type: 'wait', ms: 600 }] },
  { name: 'skip', viewport: 'mobile', settle: 600, actions: [{ type: 'press', key: 'Tab' }, { type: 'wait', ms: 100 }] },
];

export function probe() {
  const header = document.querySelector('[data-masthead]');
  const hb = header.getBoundingClientRect().bottom;
  const entries = [...document.querySelectorAll('[data-entry]')].map((li) => {
    const b = li.getBoundingClientRect();
    const flag = li.querySelector('[data-flag]');
    const title = li.querySelector('.entry__title');
    const rule = getComputedStyle(li, '::before');
    const body = li.querySelector('.entry__body');
    // Is the mark on the same line as the title's last word? (A mark alone on a line reads as nobody's.)
    let flagAlone = null;
    if (flag.checkVisibility()) {
      const text = title.firstChild;
      const r = document.createRange();
      r.setStart(text, text.length - 1); r.setEnd(text, text.length);
      const last = r.getClientRects();
      const word = last[last.length - 1];
      const f = flag.getClientRects()[0];
      flagAlone = !(word && f && f.top < word.bottom && f.bottom > word.top);
    }
    return {
      id: li.dataset.id,
      unreadStyle: li.classList.contains('is-unread'),
      flag: flag.checkVisibility({ opacityProperty: true }),
      flagText: flag.checkVisibility() ? flag.textContent.trim() : null,
      flagOpacity: getComputedStyle(flag).opacity,
      flagAlone,
      titleWeight: getComputedStyle(title).fontWeight,
      open: li.querySelector('details').open,
      arrival: li.hasAttribute('data-arrival'),
      readBy: li.dataset.readBy ?? null,
      ruleAnim: rule.animationName,
      ruleTransition: rule.transitionProperty,
      ruleScale: Math.round(new DOMMatrixReadOnly(rule.transform === 'none' ? undefined : rule.transform).d * 1000) / 1000,
      ruleLeft: Math.round(b.left + parseFloat(rule.left)),
      wash: getComputedStyle(li).animationName,
      bodyAnim: li.querySelector('details').open ? getComputedStyle(body).animationName : null,
      plan: li.querySelector('.entry__plan')?.dataset.area ?? null,
      planFill: (() => { const u = li.querySelector('.entry__plan'); return u ? getComputedStyle(u).getPropertyValue(`--${u.dataset.area}`).trim() : null; })(),
      top: b.top, bottom: b.bottom, left: b.left,
      datetime: li.querySelector('time').getAttribute('datetime'),
      isArticle: !!li.querySelector(':scope > article[aria-labelledby] h2'),
    };
  });
  let stored = null;
  try { stored = JSON.parse(localStorage.getItem('mlb-diary')); } catch (e) { stored = `throws ${e.name}`; }
  const a = document.activeElement;
  const box = (sel) => { const el = document.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, left: b.left, width: b.width, height: b.height }; };
  const publishBtn = document.querySelector('[data-publish]');
  return {
    entries,
    nav: document.querySelector('[data-news-link]').innerText.replace(/\s+/g, ' ').trim(),
    navLinksShown: [...document.querySelectorAll('.masthead__nav a')].filter((l) => l.checkVisibility()).map((l) => l.textContent.replace(/\s+/g, ' ').trim()),
    countHidden: document.querySelector('[data-count]').hidden,
    summary: document.querySelector('[data-summary]').textContent,
    markAllDisabled: document.querySelector('[data-mark-all]').getAttribute('aria-disabled'),
    markAllShown: document.querySelector('[data-mark-all]').checkVisibility(),
    status: document.querySelector('[data-status]').textContent,
    statusRole: document.querySelector('[data-status]').getAttribute('role'),
    note: document.querySelector('[data-storage-note]').checkVisibility() ? document.querySelector('[data-storage-note]').textContent : null,
    demoShown: document.querySelector('[data-demo]').checkVisibility(),
    publishDisabled: publishBtn.getAttribute('aria-disabled'),
    publishDescribedBy: publishBtn.getAttribute('aria-describedby'),
    resetDisabled: document.querySelector('[data-reset]').getAttribute('aria-disabled'),
    stored,
    demoStored: (() => { try { return JSON.parse(localStorage.getItem('mlb-diary:demo')); } catch { return 'throws'; } })(),
    search: location.search,
    scrollY: Math.round(scrollY),
    active: a?.matches?.('summary') ? a.closest('[data-entry]').dataset.id : a?.className || a?.tagName.toLowerCase() || null,
    activeBox: a && a !== document.body ? (() => { const b = a.getBoundingClientRect(); const s = getComputedStyle(a); return { top: b.top, left: b.left, width: b.width, height: b.height, clip: s.clip, position: s.position }; })() : null,
    bar: box('.diary__bar'),
    markAll: box('[data-mark-all]'),
    scrollPadding: getComputedStyle(document.documentElement).scrollPaddingTop,
    mastheadH: getComputedStyle(document.documentElement).getPropertyValue('--masthead-h').trim(),
    focusLog: window.__focusLog || null,
    headerBottom: hb,
    headerHeight: header.getBoundingClientRect().height,
    vh: innerHeight,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side: the menu link and the list as assistive technology reads them.
export async function inspect(page, st) {
  if (!['top', 'open'].includes(st.name)) return null;
  return { nav: await page.locator('[data-masthead] nav').ariaSnapshot(), list: st.name === 'top' ? await page.locator('[data-diary]').ariaSnapshot() : null };
}

export function assert(r) {
  const S = (n) => r[n]?.state || {};
  const P = (n) => r[n]?.probe || {};
  const out = [];
  const flagged = (n) => (P(n).entries || []).filter((e) => e.flag).map((e) => e.id);
  const styled = (n) => (P(n).entries || []).filter((e) => e.unreadStyle).map((e) => e.id);
  const ids = (a) => (a || []).join(', ');
  const E = (n, id) => (P(n).entries || []).find((e) => e.id === id) || {};
  const dwelt = (n) => Object.entries(S(n).readBy || {}).filter(([, how]) => how === 'dwell').map(([id]) => id).sort();
  const sorted = (a) => [...a].sort().join(', ');

  // First visit.
  const t = P('top'), ts = S('top');
  out.push({ ok: ts.firstVisit && ts.unread === 3 && ids(ts.unreadIds) === ids(FRESH), message: `first visit: the 3 entries from the 21 days before the newest are new (${ids(ts.unreadIds)})` });
  out.push({ ok: t.nav === 'News 3 new' && t.countHidden === false && /^3 new of 9/.test(t.summary), message: `first visit: the menu reads "${t.nav}" and the list "${t.summary}"` });
  out.push({ ok: ids(flagged('top')) === ids(FRESH) && ids(styled('top')) === ids(FRESH) && (t.entries || []).every((e) => (e.flag ? e.flagText === ', New' && e.titleWeight === '700' && e.ruleScale === 1 : e.titleWeight === '400' && e.ruleScale === 0)), message: `first visit: each new entry carries the text mark, the bold title and its bar drawn (scale 1), the others none (${flagged('top').length} marks; bars ${(t.entries || []).map((e) => e.ruleScale).join(' ')})` });
  const bars = (t.entries || []).filter((e) => e.unreadStyle);
  out.push({ ok: bars.length === 3 && bars.every((e) => e.ruleLeft < e.left && e.ruleLeft > 0), message: `first visit: each bar sits in the margin on the entry's inline-start edge, beside it rather than on a border (bar x ${bars.map((e) => e.ruleLeft).join(', ')}; entry x ${Math.round(bars[0]?.left)})` });
  out.push({ ok: (t.entries || []).filter((e) => e.flag).every((e) => e.flagAlone === false), message: `first visit: no New mark sits alone on a line (${(t.entries || []).filter((e) => e.flag).map((e) => e.flagAlone).join(', ')})` });
  out.push({ ok: (t.entries || []).length === 9 && t.entries.every((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.datetime) && e.isArticle && e.plan && e.planFill), message: 'first visit: nine list items, each an <article> named by its <h2>, with <time datetime="YYYY-MM-DD"> and a plan with its area filled' });
  out.push({ ok: ts.dwellReads === 0 && ts.armed === false && t.status === '' && ts.announced === 0 && t.statusRole === 'status', message: `on load: nothing is read for the visitor and nothing is announced after 2.4 s (dwell reads ${ts.dwellReads}, status "${t.status}")` });
  out.push({ ok: ts.arrivals?.length === 0 && (t.entries || []).every((e) => !e.arrival), message: 'first visit: no arrival, since there is no last visit to compare with' });
  out.push({ ok: t.stored?.v === 1 && t.stored?.seen === '2026-10-24' && t.stored?.since === '2026-10-03' && Array.isArray(t.stored?.read) && !('published' in (t.stored || {})), message: `first visit: the record holds the horizon and the newest entry seen, and no demo state (${JSON.stringify(t.stored)})` });
  out.push({ ok: t.note === 'Read marks are kept in this browser, on this device only.' && t.markAllShown && t.demoShown, message: `with script: the storage note ("${t.note}"), Mark all and the demo are shown (they ship hidden)` });
  const nav = r.top?.inspect?.nav || '';
  out.push({ ok: /link "News 3 new"/.test(nav), message: `menu: the link's accessible name carries the count (${(nav.match(/link "News[^"]*"/) || ['none'])[0]})` });
  const list = r.top?.inspect?.list || '';
  out.push({ ok: /- list/.test(list) && (list.match(/- listitem/g) || []).length === 9 && /article "The roof lantern goes back on ?, New"/.test(list), message: 'list: nine list items read as articles whose names carry the New mark' });
  const groups = list.match(/group: "[^"]*"/g) || [];
  out.push({ ok: groups.length === 9 && groups.every((g) => /^group: "Read the entry ?: [^+−]*[a-z]"$/.test(g)), message: `list: each toggle's name is its words, without the + glyph (${groups[0]})` });

  // Opening by keyboard.
  const o = P('open'), os = S('open');
  const opened = (o.entries || [])[1] || {};
  out.push({ ok: opened.open && os.readBy?.[TILES] === 'open' && os.unread === 2 && !opened.flag && !opened.unreadStyle && o.active === TILES, message: `keyboard: Enter on the second entry opens it, reads it, keeps focus there (open ${opened.open}, unread ${os.unread}, focus ${o.active})` });
  out.push({ ok: opened.ruleScale === 0 && opened.titleWeight === '400', message: `keyboard: the read entry's bar is gone (scale ${opened.ruleScale}) and its title is regular (${opened.titleWeight})` });
  out.push({ ok: o.nav === 'News 2 new' && /^2 new of 9/.test(o.summary) && o.status === 'Marked as read. 2 new left.', message: `open: the menu reads "${o.nav}" and the status says "${o.status}"` });
  out.push({ ok: /link "News 2 new"/.test(r.open?.inspect?.nav || ''), message: 'open: the menu link\'s accessible name follows the count' });
  out.push({ ok: o.stored?.read?.includes(TILES), message: `open: the read mark is stored (${JSON.stringify(o.stored?.read)})` });

  // Return visit.
  const rl = S('reload');
  out.push({ ok: !rl.firstVisit && rl.unread === 2 && !rl.unreadIds?.includes(LANTERN) && P('reload').nav === 'News 2 new' && !flagged('reload').includes(LANTERN), message: `reload: the entry read before it stays read (unread ${ids(rl.unreadIds)}, menu "${P('reload').nav}")` });
  out.push({ ok: rl.arrivals?.length === 0 && P('reload').status === '', message: 'reload: nothing new arrived since the last visit, and nothing is announced on load' });

  // Mark all.
  const m = P('mark-all');
  out.push({ ok: S('mark-all').unread === 0 && m.nav === 'News' && m.countHidden && flagged('mark-all').length === 0 && styled('mark-all').length === 0 && (m.entries || []).every((e) => e.ruleScale === 0), message: `mark all: no marks and no bars left (scales ${(m.entries || []).map((e) => e.ruleScale).join(' ')}), the menu reads "${m.nav}"` });
  out.push({ ok: m.status === 'All 3 marked as read. Nothing new left.' && m.markAllDisabled === 'true' && /^All 9 entries read/.test(m.summary), message: `mark all: announced ("${m.status}"), the button now aria-disabled, "${m.summary}"` });
  out.push({ ok: S('mark-all-reload').unread === 0 && P('mark-all-reload').nav === 'News', message: 'mark all: still all read after a reload' });

  // Dwell. Each state reaches its position by a restored scroll and a real 120 px wheel.
  const rs = S('restore'), rp = P('restore');
  out.push({ ok: rp.scrollY > 0 && rs.armed === false && rs.earlyScrolls >= 1 && rs.dwellReads === 0 && rs.unread === 3, message: `restored position: the restore and a scroll inside the first 600 ms (${rs.earlyScrolls} seen early) arm nothing (scrollY ${rp.scrollY}, armed ${rs.armed}, ${rs.unread} new after 2.4 s)` });
  const de = S('dwell-early'), dep = P('dwell-early');
  const inView = (n, id) => { const e = E(n, id); return e.top >= P(n).headerBottom - 0.5 && e.bottom <= P(n).vh + 0.5; };
  out.push({ ok: de.armed && de.dwellReads === 0 && de.unread === 3 && FRESH.every((id) => inView('dwell-early', id)), message: `dwell: 800 ms after the wheel, three new entries wholly in view and none read yet (armed ${de.armed}, ${de.unread} new; tops ${FRESH.map((id) => Math.round(E('dwell-early', id).top)).join(', ')} below ${dep.headerBottom})` });
  const d = P('dwell'), ds = S('dwell'), lantern = E('dwell', LANTERN);
  out.push({ ok: ds.armed && sorted(dwelt('dwell')) === sorted([TILES, CHIMNEY]) && inView('dwell', TILES) && inView('dwell', CHIMNEY) && ds.dwellReads === 2, message: `dwell: the two entries wholly in view below the masthead are read, exactly (${ids(dwelt('dwell'))})` });
  out.push({ ok: lantern.top < d.headerBottom && lantern.bottom > d.headerBottom && ds.unreadIds?.includes(LANTERN) && lantern.flag, message: `dwell: the entry ${Math.round(d.headerBottom - lantern.top)} px under the masthead stays new (top ${Math.round(lantern.top)}, masthead ${d.headerBottom})` });
  out.push({ ok: d.status === '' && ds.announced === 0 && d.nav === 'News 1 new', message: `dwell: reads from dwelling are silent; the menu link's name carries them ("${d.nav}", status "${d.status}")` });
  const ee = P('dwell-edge'), es = S('dwell-edge'), cut = E('dwell-edge', CHIMNEY);
  out.push({ ok: es.armed && sorted(dwelt('dwell-edge')) === sorted([LANTERN, TILES]) && inView('dwell-edge', LANTERN) && inView('dwell-edge', TILES), message: `dwell: scrolled back up with the third entry cut by the bottom edge, only the two above it are read (${ids(dwelt('dwell-edge'))})` });
  out.push({ ok: cut.top < ee.vh && cut.bottom > ee.vh && es.unreadIds?.includes(CHIMNEY), message: `dwell: an entry ${Math.round(cut.bottom - ee.vh)} px past the bottom edge, mostly in view, stays new` });
  const dm = P('dwell-masthead'), dms = S('dwell-masthead'), grown = E('dwell-masthead', LANTERN);
  out.push({ ok: dms.inset === 120 && dm.headerHeight === 120 && dm.mastheadH === '120px' && dm.scrollPadding === '132px', message: `masthead resize: the observer and the anchors follow the measured height (inset ${dms.inset}, --masthead-h ${dm.mastheadH}, scroll-padding-top ${dm.scrollPadding})` });
  out.push({ ok: grown.top > 64 && grown.top < dm.headerBottom && dms.unreadIds?.includes(LANTERN) && dms.armed, message: `masthead resize: an entry under the grown masthead (top ${Math.round(grown.top)}, masthead ${dm.headerBottom}), which the boot-time 64 px would call wholly in view, stays new (dwell reads ${ids(dwelt('dwell-masthead'))})` });

  // A published entry arrives on the return visit.
  const p = P('publish'), ps = S('publish');
  const first = (p.entries || [])[0] || {};
  out.push({ ok: ps.unread === 4 && ids(ps.arrivals) === ARRIVAL && first.id === ARRIVAL && first.arrival && (p.entries || []).filter((e) => e.arrival).length === 1, message: `return visit: the entry published since arrives at the top, alone (${ids(ps.arrivals)}; ${ps.unread} new)` });
  out.push({ ok: first.ruleAnim === 'rule-in' && first.ruleScale === 1 && first.flag && first.wash === 'wash' && p.nav === 'News 4 new' && p.status === '', message: `return visit: a quiet arrival, settled after 1.5 s (bar ${first.ruleAnim} at scale ${first.ruleScale}, wash ${first.wash}), the menu reads "${p.nav}", nothing announced` });
  out.push({ ok: p.publishDisabled === 'true' && first.top > 0 && first.bottom < p.vh && p.demoStored?.published?.includes(ARRIVAL) && !('published' in (p.stored || {})), message: `return visit: it starts at the top with the arrival in view (${Math.round(first.top)}–${Math.round(first.bottom)} of ${p.vh}); the demo keeps its own key and cannot publish twice` });
  const ad = (P('arrive-draw').entries || [])[0] || {};
  out.push({ ok: ad.arrival && ad.ruleScale > 0.05 && ad.ruleScale < 0.95 && ad.flagOpacity === '0', message: `arrival: 90 ms in, the bar is drawing down (scale ${ad.ruleScale}) and the mark has not faded in yet (opacity ${ad.flagOpacity})` });
  const pr = P('publish-read'), prs = S('publish-read'), readArrival = (pr.entries || [])[0] || {};
  out.push({ ok: readArrival.id === ARRIVAL && prs.readBy?.[ARRIVAL] === 'open' && !readArrival.unreadStyle && readArrival.ruleScale === 0 && !readArrival.flag && readArrival.ruleAnim === 'none' && readArrival.titleWeight === '400', message: `arrival, then read: no bar (scale ${readArrival.ruleScale}, animation ${readArrival.ruleAnim}), no mark, regular title, like any read entry` });
  out.push({ ok: pr.nav === 'News 3 new' && pr.status === 'Marked as read. 3 new left.', message: `arrival, then read: "${pr.nav}", "${pr.status}"` });

  // Storage that throws, fails mid-visit, or holds a broken record.
  const b = P('blocked'), bs = S('blocked');
  out.push({ ok: b.search === '?storage=blocked' && /^throws/.test(String(b.stored)) && bs.storage === 'memory', message: `blocked storage: localStorage throws (${b.stored}) and the page runs from memory` });
  out.push({ ok: bs.initialUnread === 3 && bs.unread === 2 && b.nav === 'News 2 new' && b.status === 'Marked as read. 2 new left.' && !(r.blocked?.errors || []).length, message: `blocked storage: it still counts 3, reads on open and announces ("${b.nav}", "${b.status}")` });
  out.push({ ok: /refusing site storage/.test(b.note || '') && b.publishDisabled === 'true' && b.resetDisabled === 'true' && b.publishDescribedBy === 'storage-note', message: `blocked storage: the page says it cannot remember ("${b.note}"), and the controls that need storage are aria-disabled and described by that sentence` });
  const q = P('quota'), qs = S('quota');
  out.push({ ok: qs.storage === 'memory' && /stopped saving/.test(q.note || '') && q.publishDisabled === 'true' && q.resetDisabled === 'true', message: `write fails mid-visit: memory from then on, and the page says so ("${q.note}")` });
  out.push({ ok: qs.unread === 2 && q.nav === 'News 2 new' && q.status === 'Marked as read. 2 new left.', message: `write fails mid-visit: the read still counts ("${q.nav}", "${q.status}")` });
  const c = P('corrupt'), cs = S('corrupt');
  out.push({ ok: cs.firstVisit === true && cs.discarded === true && cs.unread === 3 && c.nav === 'News 3 new' && !(r.corrupt?.errors || []).length, message: `broken record ({ published: null, read: 5 }): treated as a first visit, no error (${cs.unread} new, "${c.nav}")` });
  out.push({ ok: c.stored?.v === 1 && Array.isArray(c.stored?.read) && c.stored?.seen === '2026-10-24' && !('published' in (c.stored || {})), message: `broken record: overwritten with a valid one (${JSON.stringify(c.stored)})` });

  // The sticky masthead covers neither an anchor's target nor focus.
  const an = P('anchor');
  out.push({ ok: an.bar && an.bar.top >= an.headerBottom && an.markAll.top >= an.headerBottom && an.scrollPadding === `${an.headerHeight + 12}px`, message: `anchor: News lands the list's bar below the masthead (bar top ${Math.round(an.bar?.top)}, Mark all ${Math.round(an.markAll?.top)}, masthead ${an.headerBottom}; scroll-padding-top ${an.scrollPadding})` });
  const fl = (P('focus-back').focusLog || []).filter((f) => f.tag === 'summary');
  out.push({ ok: fl.length === 5 && fl.every((f) => f.top >= f.hb - 0.5 && f.bottom > f.top), message: `focus: Shift+Tab back through the entries keeps every stop clear of the masthead (${fl.map((f) => `${f.tag} ${f.top}`).join(', ')}; masthead ${fl[0]?.hb})` });

  // Reduced motion.
  const rm = P('rm'), rmFirst = (rm.entries || [])[0] || {};
  const rmOpen = (rm.entries || []).find((e) => e.open) || {};
  out.push({ ok: S('rm').motion === 'reduced' && rmFirst.arrival && rmFirst.ruleAnim === 'none' && rmFirst.ruleScale === 1 && rmFirst.wash === 'wash', message: `reduced motion: the arrival keeps its colour wash but its bar is drawn already (bar ${rmFirst.ruleAnim}, scale ${rmFirst.ruleScale})` });
  out.push({ ok: rmOpen.bodyAnim === 'body-fade' && P('open').entries?.[1]?.bodyAnim === 'body-in' && rmOpen.ruleTransition === 'none' && rmOpen.ruleScale === 0, message: `reduced motion: an opened entry fades in without rising (${rmOpen.bodyAnim}; full tier ${P('open').entries?.[1]?.bodyAnim}), and its bar goes without easing (${rmOpen.ruleTransition})` });

  // Static.
  const sp = P('static'), sArr = (sp.entries || [])[0] || {}, sLantern = (sp.entries || [])[1] || {};
  out.push({ ok: S('static').motion === 'static' && sArr.readBy === 'open' && !sArr.flag && sArr.flagText === null && sArr.ruleScale === 0 && sArr.wash === 'none' && sArr.bodyAnim === 'none', message: `static: 60 ms after the arrival is opened its mark is gone and its bar with it, at once (scale ${sArr.ruleScale}, body ${sArr.bodyAnim}, wash ${sArr.wash})` });
  out.push({ ok: sLantern.unreadStyle && sLantern.ruleScale === 1 && sLantern.ruleAnim === 'none' && sLantern.flag, message: `static: an unread entry keeps its bar and mark, unanimated (${sLantern.ruleAnim}, scale ${sLantern.ruleScale})` });

  // Phone.
  const mo = P('mobile');
  out.push({ ok: (mo.overflowX ?? 1) <= 0 && mo.nav === 'News 2 new' && S('mobile').unread === 2 && mo.entries?.[0]?.open, message: `phone: no sideways overflow (${mo.overflowX} px); the menu still reads "${mo.nav}" after opening an entry` });
  out.push({ ok: mo.headerHeight <= 60 && ids(mo.navLinksShown) === 'News 2 new' && S('mobile').inset === mo.headerHeight, message: `phone: the masthead is one row, ${mo.headerHeight} px, the brand and the count (${ids(mo.navLinksShown)}); the other links are in the footer` });
  out.push({ ok: (mo.entries || []).filter((e) => e.flag).every((e) => e.flagAlone === false && e.ruleLeft >= 4), message: `phone: no New mark alone on a line, and every bar inside the screen (x ${(mo.entries || []).filter((e) => e.flag).map((e) => e.ruleLeft).join(', ')})` });
  const sk = P('skip'), skb = sk.activeBox || {};
  out.push({ ok: sk.active === 'skip-link' && skb.height >= 44 && skb.width > 100 && skb.top >= 0 && skb.clip === 'auto' && skb.position === 'fixed', message: `skip link: the first Tab shows it, ${Math.round(skb.width)} × ${Math.round(skb.height)} px at the top (${sk.active})` });
  return out;
}
