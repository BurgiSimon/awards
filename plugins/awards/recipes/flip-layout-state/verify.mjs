const click = (selector) => ({ type: 'click', selector });
const wait = (ms) => ({ type: 'wait', ms });
const list = click('button[data-view="list"]');
const filter = (name) => click(`button[data-filter="${name}"]`);
// Keyboard only: focus the work's button and press Enter.
const openByKey = (id) => [{ type: 'focus', selector: `[data-work="${id}"] [data-open]` }, { type: 'press', key: 'Enter' }];

export const states = [
  { name: 'desktop', settle: 400 },
  // Sampled while the grid → list Flip is still running: it must be a tween, not a cut.
  { name: 'list-mid', actions: [list, { type: 'waitFor', fn: 'window.__awards.state().busy === true' }, wait(200)] },
  { name: 'list', actions: [list, wait(1600)] },
  { name: 'filter', actions: [filter('print'), wait(1600)] },
  { name: 'filter-list', actions: [list, wait(1500), filter('digital'), wait(1600)] },
  { name: 'filter-back', actions: [filter('print'), wait(1500), filter('all'), wait(1800)] },
  { name: 'detail', actions: [...openByKey('quarry-lane'), wait(1500)] },
  { name: 'detail-closed', actions: [...openByKey('quarry-lane'), wait(1500), { type: 'press', key: 'Escape' }, wait(1800)] },
  // Reduced motion: four changes, each must be complete on the first frame after it.
  { name: 'rm', reducedMotion: true, actions: [list, wait(150), filter('identity'), wait(150), ...openByKey('cobble-street'), wait(150), { type: 'press', key: 'Escape' }, wait(150)] },
  { name: 'mobile', viewport: 'mobile', settle: 400 },
  { name: 'mobile-list', viewport: 'mobile', actions: [list, wait(1600)] },
  { name: 'mobile-detail', viewport: 'mobile', actions: [click('[data-work="fennel-rye"] [data-open]'), wait(1500)] },
];

export function probe() {
  const items = [...document.querySelectorAll('[data-work]')];
  const shown = items.filter((li) => getComputedStyle(li).display !== 'none');
  const rects = shown.map((li) => {
    const r = li.getBoundingClientRect();
    const cs = getComputedStyle(li);
    return { id: li.dataset.work, x: r.left, y: r.top, w: r.width, h: r.height, opacity: Number(cs.opacity), transform: cs.transform, position: cs.position };
  });
  let overlaps = 0;
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const a = rects[i], b = rects[j];
    const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    const iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (ix > 1 && iy > 1) overlaps++;
  }
  const plates = [...document.querySelectorAll('[data-plate]')].map((p) => {
    const r = p.getBoundingClientRect(), f = p.parentElement.getBoundingClientRect();
    return { id: p.dataset.plate, inDetail: !!p.closest('[data-detail]'), off: Math.abs(r.left - f.left) + Math.abs(r.top - f.top) + Math.abs(r.width - f.width) + Math.abs(r.height - f.height), left: r.left, right: r.right };
  });
  const listEl = document.querySelector('[data-works]');
  return {
    rects,
    overlaps,
    columns: new Set(rects.map((r) => Math.round(r.x))).size,
    listWidth: listEl.getBoundingClientRect().width,
    hiddenIds: items.filter((li) => li.hidden && getComputedStyle(li).display === 'none').map((li) => li.dataset.work),
    inFlight: rects.filter((r) => r.position === 'absolute' || !/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/.test(r.transform)).length,
    plates,
    dialogOpen: document.querySelector('[data-detail]').open,
    detailTitle: document.querySelector('[data-detail-title]').textContent.trim(),
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    vw: innerWidth,
  };
}

// The accessibility tree of the list: a filtered-out work must not be in it.
export async function inspect(page) {
  const aria = await page.locator('[data-works]').ariaSnapshot();
  return { listitems: (aria.match(/^\s*- listitem/gm) || []).length, aria };
}

export function assert(r) {
  const out = [];
  const S = (n) => r[n]?.state ?? {};
  const P = (n) => r[n]?.probe ?? {};
  const ids = (n) => (P(n).rects ?? []).map((x) => x.id).join(',');
  const oneColumn = (n) => {
    const rs = P(n).rects ?? [];
    return rs.length > 0 && P(n).columns === 1 && rs.every((x, i) => i === 0 || x.y > rs[i - 1].y) && rs.every((x) => Math.abs(x.w - rs[0].w) < 1 && x.w > 0.9 * P(n).listWidth);
  };
  const atRest = (n) => S(n).busy === false && P(n).inFlight === 0 && (P(n).rects ?? []).every((x) => x.opacity === 1);
  const last = (n) => (S(n).log ?? []).at(-1) ?? {};

  out.push({ ok: S('desktop').view === 'grid' && S('desktop').shown === 9 && P('desktop').columns === 3 && P('desktop').overlaps === 0, message: `desktop: nine works in a three-column grid (${P('desktop').columns} columns, ${P('desktop').overlaps} overlaps)` });
  out.push({ ok: S('desktop').pressed?.view?.join() === 'grid' && S('desktop').pressed?.filter?.join() === 'all' && S('desktop').tokens?.dur === 0.75 && S('desktop').tokens?.stagger === 0.025, message: `desktop: aria-pressed on Grid and All; tokens read from CSS (${S('desktop').tokens?.dur} s, stagger ${S('desktop').tokens?.stagger})` });

  out.push({ ok: S('list-mid').busy === true && last('list-mid').kind === 'view' && last('list-mid').tweened === true && P('list-mid').inFlight > 0, message: `list-mid: the grid → list change is a running Flip (${P('list-mid').inFlight} items in flight)` });
  out.push({ ok: S('list').view === 'list' && oneColumn('list') && P('list').overlaps === 0 && atRest('list'), message: `list: items stacked in one column at full width, at rest (${P('list').columns} column)` });
  out.push({ ok: last('list').settledNextFrame === false && S('list').focus === 'view:list' && /as a list/.test(S('list').status ?? '') && S('list').pressed?.view?.join() === 'list', message: `list: animated (not settled on the next frame), focus kept on the List button, status "${S('list').status}"` });

  out.push({ ok: S('filter').shown === 3 && ids('filter') === 'fennel-rye,marram,stone-fruit' && P('filter').hiddenIds?.length === 6, message: `filter: Print leaves three works (${ids('filter')}), six display: none` });
  out.push({ ok: P('filter').overlaps === 0 && atRest('filter') && P('filter').columns === 3, message: `filter: no item overlaps another after the Flip (${P('filter').overlaps})` });
  out.push({ ok: r.filter?.inspect?.listitems === 3 && S('filter').focus === 'filter:print' && /^3 of 9/.test(S('filter').status ?? ''), message: `filter: three list items in the accessibility tree (${r.filter?.inspect?.listitems}), focus on Print, count announced` });
  out.push({ ok: S('filter-list').view === 'list' && ids('filter-list') === 'halden-ferry,weir-house' && oneColumn('filter-list') && P('filter-list').overlaps === 0 && atRest('filter-list'), message: `filter-list: Digital in the list view, two rows (${ids('filter-list')})` });
  out.push({ ok: S('filter-back').shown === 9 && atRest('filter-back') && P('filter-back').overlaps === 0 && P('filter-back').columns === 3, message: 'filter-back: All brings the six back whole (opacity 1, no transform left by onLeave)' });

  const dp = (P('detail').plates ?? []).find((p) => p.id === 'quarry-lane') ?? {};
  out.push({ ok: S('detail').open === 'quarry-lane' && P('detail').dialogOpen && P('detail').detailTitle === 'Quarry Lane Library', message: `detail: Enter on a work opens its detail (${S('detail').open})` });
  out.push({ ok: S('detail').focus === 'close' && dp.inDetail === true && dp.off < 2 && S('detail').busy === false, message: `detail: focus moved into the dialog (${S('detail').focus}); the plate landed in the detail frame (off by ${dp.off?.toFixed?.(1)} px)` });
  const cp = (P('detail-closed').plates ?? []).find((p) => p.id === 'quarry-lane') ?? {};
  out.push({ ok: S('detail-closed').open === null && !P('detail-closed').dialogOpen && S('detail-closed').focus === 'work:quarry-lane', message: `detail-closed: Escape closes and focus returns to the work's button (${S('detail-closed').focus})` });
  out.push({ ok: cp.inDetail === false && cp.off < 2 && S('detail-closed').busy === false && (S('detail-closed').log ?? []).filter((e) => ['open', 'close'].includes(e.kind)).every((e) => e.tweened), message: `detail-closed: the plate flew home into its card (off by ${cp.off?.toFixed?.(1)} px)` });

  const rmLog = S('rm').log ?? [];
  out.push({ ok: S('rm').motion === 'reduced' && rmLog.map((e) => e.kind).join() === 'view,filter,open,close' && rmLog.every((e) => e.tweened === false && e.settledNextFrame === true), message: `rm: four changes, none tweened, each settled on the next frame (${rmLog.map((e) => `${e.kind}:${e.settledNextFrame}`).join(' ')})` });
  out.push({ ok: S('rm').view === 'list' && ids('rm') === 'tidewater,cobble-street' && oneColumn('rm') && S('rm').open === null && S('rm').focus === 'work:cobble-street', message: `rm: same end state as the full tier, focus back on the work (${S('rm').focus})` });

  out.push({ ok: P('mobile').columns === 1 && S('mobile').shown === 9 && !P('mobile').overflow, message: 'mobile: one column at 390 px, no horizontal overflow' });
  out.push({ ok: oneColumn('mobile-list') && P('mobile-list').overlaps === 0 && !P('mobile-list').overflow && atRest('mobile-list'), message: 'mobile-list: rows stacked, no overflow' });
  const mp = (P('mobile-detail').plates ?? []).find((p) => p.id === 'fennel-rye') ?? {};
  out.push({ ok: S('mobile-detail').open === 'fennel-rye' && mp.inDetail && mp.off < 2 && mp.left >= 0 && mp.right <= P('mobile-detail').vw && !P('mobile-detail').overflow, message: `mobile-detail: tap opens the detail, plate inside the viewport (${mp.left?.toFixed?.(0)}–${mp.right?.toFixed?.(0)} of ${P('mobile-detail').vw})` });
  return out;
}
