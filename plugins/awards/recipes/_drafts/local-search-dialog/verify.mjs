// Local search over the page's own list: `/` and Ctrl+K open a native dialog (never from inside a text field), typing
// filters to exactly what an independent matcher finds in the DOM, matched word starts are marked, the polite count is
// announced once per pause (counted from the status element's own mutations), arrows move aria-activedescendant,
// Enter follows only the lit option, a click follows the clicked one, Escape and the backdrop return focus to whatever
// opened the dialog, section toggles narrow and an empty result offers to clear them. The tiers are measured, not
// read from the recipe: a recorder installed before the open samples the panel's transform and opacity every frame
// and reads the keyframes of the panel, the backdrop and every newly shown option. Every note is in the served HTML.
const type = (word) => [...word].map((key) => ({ type: 'press', key }));
const slash = { type: 'press', key: '/' };
const wait = (ms) => ({ type: 'wait', ms });
const backspaces = (n) => Array.from({ length: n }, () => ({ type: 'press', key: 'Backspace' }));
const STATIC = { type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" };

// Installed in the page by a waitFor before the dialog opens. Plain data only lands in window.__rec.
function recorder() {
  if (window.__rec) return true;
  const rec = { opens: [], samples: [], added: [], status: [], ad: [], closing: null, focusBeforeOpen: null, downs: [], clicks: [] };
  window.__rec = rec;
  window.__recAdNodes = [];
  const dialog = document.querySelector('[data-dialog]');
  const panel = dialog.querySelector('[data-panel]');
  const results = dialog.querySelector('[data-results]');
  const status = dialog.querySelector('[data-status]');
  const input = dialog.querySelector('[data-q]');
  const anims = (list) => list.map((a) => ({ ms: a.effect.getTiming().duration, kf: a.effect.getKeyframes().map((k) => ({ o: k.opacity === undefined ? null : Number(k.opacity), t: k.transform ?? null })) }));
  const backdrop = () => anims(dialog.getAnimations({ subtree: true }).filter((a) => a.effect.pseudoElement === '::backdrop'));
  const ty = (s) => (s === 'none' ? 0 : new DOMMatrixReadOnly(s).m42);
  const sample = (t0) => {
    const cs = getComputedStyle(panel);
    rec.samples.push({ t: Math.round(performance.now() - t0), y: Math.round(ty(cs.transform) * 100) / 100, o: Math.round(Number(cs.opacity) * 1000) / 1000 });
    if (performance.now() - t0 < 420 && rec.samples.length < 90) requestAnimationFrame(() => sample(t0));
  };
  const what = (el) => (el === dialog ? 'dialog' : el === input ? 'input' : el?.closest?.('[role="option"]')?.id || el?.className || el?.tagName || null);
  window.addEventListener('keydown', () => { if (!dialog.open && rec.focusBeforeOpen === null) rec.focusBeforeOpen = document.activeElement === document.body ? 'body' : what(document.activeElement); }, true);
  document.addEventListener('pointerdown', (e) => rec.downs.push(what(e.target)), true);
  document.addEventListener('click', (e) => rec.clicks.push(what(e.target)), true);
  // The open: keyframes as created, then the computed panel every frame from that moment.
  new MutationObserver(() => {
    if (dialog.open && !rec.opens.length) { rec.opens.push({ panel: anims(panel.getAnimations()), backdrop: backdrop() }); sample(performance.now()); }
  }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  // Escape: the recipe's cancel listener has run by now, so its close animations (if any) exist.
  dialog.addEventListener('cancel', () => { rec.closing = { open: dialog.open, panel: anims(panel.getAnimations()), backdrop: backdrop() }; });
  // Options that were not in the list before this render, with whatever animations they were given.
  let current = new Set([...results.children].map((c) => c.id));
  new MutationObserver(() => {
    const now = [...results.children];
    for (const n of now) if (!current.has(n.id)) rec.added.push({ id: n.id, anims: anims(n.getAnimations()) });
    current = new Set(now.map((c) => c.id));
  }).observe(results, { childList: true });
  new MutationObserver(() => rec.status.push(status.textContent)).observe(status, { childList: true, characterData: true, subtree: true });
  new MutationObserver((list) => {
    for (const m of list) { const v = input.getAttribute('aria-activedescendant'); rec.ad.push(v); window.__recAdNodes.push(v && document.getElementById(v)); }
  }).observe(input, { attributes: true, attributeFilter: ['aria-activedescendant'] });
  return true;
}
const REC = { type: 'waitFor', fn: `(${recorder.toString()})()` };

export const states = [
  { name: 'top', settle: 500 },
  { name: 'slash', settle: 500, actions: [REC, slash, wait(450)] },
  { name: 'ctrl-k', settle: 500, actions: [{ type: 'press', key: 'Control+k' }, wait(400)] },
  { name: 'field', settle: 500, actions: [{ type: 'focus', selector: '#signup-email' }, slash, { type: 'press', key: 'Control+k' }, wait(300)] },
  { name: 'type', settle: 500, frame: true, actions: [REC, slash, wait(300), ...type('step'), wait(900)] },
  { name: 'widen', settle: 500, actions: [REC, slash, wait(300), ...type('step'), wait(300), ...backspaces(4), wait(400)] },
  { name: 'arrows', settle: 500, actions: [slash, wait(300), ...type('sync'), { type: 'press', key: 'ArrowDown' }, { type: 'press', key: 'ArrowDown' }, wait(300)] },
  { name: 'wrap', settle: 500, actions: [slash, wait(300), ...type('sync'), { type: 'press', key: 'ArrowUp' }, wait(300)] },
  { name: 'enter', settle: 500, actions: [slash, wait(300), ...type('ladder'), { type: 'press', key: 'Enter' }, wait(600)] },
  { name: 'enter-unlit', settle: 500, actions: [slash, wait(300), { type: 'press', key: 'Enter' }, wait(400)] },
  { name: 'click-option', settle: 500, actions: [slash, wait(300), ...type('sync'), wait(200), { type: 'click', selector: '#opt-u-tape-delay-with-wow' }, wait(600)] },
  { name: 'escape', settle: 500, actions: [REC, { type: 'click', selector: '[data-open]' }, wait(400), ...type('fx'), { type: 'press', key: 'Escape' }, wait(400)] },
  { name: 'escape-opener', settle: 500, actions: [{ type: 'focus', selector: '.bar__brand' }, slash, wait(400), { type: 'press', key: 'Escape' }, wait(400)] },
  { name: 'escape-body', settle: 500, actions: [REC, slash, wait(400), { type: 'press', key: 'Escape' }, wait(400)] },
  { name: 'backdrop', settle: 500, actions: [REC, slash, wait(400), { type: 'move', x: 20, y: 450, steps: 2 }, { type: 'down' }, { type: 'up' }, wait(400)] },
  { name: 'drag', settle: 500, actions: [REC, slash, wait(300), ...type('midi'), wait(300)] },
  { name: 'hover', settle: 500, actions: [slash, wait(400)] },
  { name: 'filters', settle: 500, actions: [slash, wait(300), ...type('step'), { type: 'click', selector: '[data-filter="interface"]' }, wait(900)] },
  { name: 'empty', settle: 500, actions: [slash, wait(300), ...type('step'), { type: 'click', selector: '[data-filter="effects"]' }, wait(900)] },
  { name: 'cleared', settle: 500, actions: [slash, wait(300), ...type('step'), { type: 'click', selector: '[data-filter="effects"]' }, wait(300), { type: 'click', selector: '[data-clear]' }, wait(900)] },
  { name: 'back', settle: 500, actions: [{ type: 'waitFor', fn: '(scrollTo(0, 1200), Math.abs(scrollY - 1200) < 2)' }, slash, wait(300), ...type('ladder'), { type: 'press', key: 'Enter' }, wait(500), { type: 'waitFor', fn: '(history.back(), true)' }, wait(600)] },
  { name: 'rm', reducedMotion: true, settle: 500, actions: [{ type: 'click', selector: '[data-open]' }, wait(400), ...type('pads'), wait(300)] },
  { name: 'rm-widen', reducedMotion: true, settle: 500, actions: [REC, slash, wait(400), ...type('step'), wait(200), ...backspaces(4), wait(300), { type: 'press', key: 'Escape' }, wait(400)] },
  { name: 'static', settle: 500, actions: [STATIC, REC, slash, wait(300), ...type('step'), wait(200), ...backspaces(4), wait(300)] },
  { name: 'static-close', settle: 500, actions: [STATIC, REC, slash, wait(200), { type: 'press', key: 'Escape' }] },
  { name: 'mobile', viewport: 'mobile', settle: 500 },
  { name: 'mobile-open', viewport: 'mobile', settle: 500, actions: [{ type: 'click', selector: '[data-open]' }, wait(400), ...type('midi'), wait(900)] },
];

export function probe() {
  const $ = (s) => document.querySelector(s);
  const dialog = $('[data-dialog]');
  const input = $('[data-q]');
  const panel = $('[data-panel]');
  const results = $('[data-results]');
  const opts = [...results.querySelectorAll('[role="option"]')];
  const box = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom), right: Math.round(r.right) }; };
  // An independent matcher over the DOM's own text: every word of the query starts a word of the note.
  const W = /[\p{L}\p{N}]+/gu;
  const fold = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const words = (s) => fold(s).match(W) || [];
  const terms = words(input.value);
  const pressed = [...document.querySelectorAll('[data-filter][aria-pressed="true"]')].map((b) => b.dataset.filter);
  const expected = [...document.querySelectorAll('[data-note]')].filter((n) => {
    const part = n.closest('[data-part]');
    const text = [...n.querySelectorAll('h3, p, li'), part.querySelector('h2')].map((e) => e.textContent).join(' ');
    return (!pressed.length || pressed.includes(part.dataset.part)) && terms.every((t) => words(text).some((x) => x.startsWith(t)));
  }).map((n) => n.id);
  const a = document.activeElement;
  const target = location.hash ? document.querySelector(location.hash) : null;
  const empty = $('[data-empty]');
  const shown = (el) => !!el && getComputedStyle(el).display !== 'none' && !el.closest('[hidden]');
  const ad = input.getAttribute('aria-activedescendant');
  const rec = window.__rec || null;
  const visibleOpts = opts.filter((o) => { const r = o.getBoundingClientRect(); const lr = results.getBoundingClientRect(); return r.bottom > lr.top && r.top < lr.bottom; });
  return {
    open: dialog.open,
    role: input.getAttribute('role'),
    controls: input.getAttribute('aria-controls'),
    listboxRole: results.getAttribute('role'),
    expanded: input.getAttribute('aria-expanded'),
    activeDescendant: ad,
    adSameNode: rec && window.__recAdNodes.length ? window.__recAdNodes.at(-1) === document.getElementById(ad) : null,
    selected: opts.filter((o) => o.getAttribute('aria-selected') === 'true').map((o) => o.id),
    labelledBy: opts.map((o) => document.getElementById(o.getAttribute('aria-labelledby'))?.className || null),
    describedBy: opts.map((o) => document.getElementById(o.getAttribute('aria-describedby'))?.className || null),
    optionIds: opts.map((o) => o.id.replace(/^opt-/, '')),
    expected,
    marks: opts.map((o) => [...o.querySelectorAll('mark')].map((m) => m.textContent)),
    count: $('[data-count]').textContent,
    countInBar: $('.search__bar').contains($('[data-count]')),
    status: $('[data-status]').textContent,
    emptyShown: !empty.hidden && getComputedStyle(empty).display !== 'none',
    emptyText: $('[data-empty-text]').textContent,
    keysShown: shown($('[data-keys]')),
    clearText: $('[data-clear]').textContent,
    pressed,
    focusInInput: a === input,
    focusOnOpenBtn: a === $('[data-open]'),
    focusOnBrand: a === $('.bar__brand'),
    activeId: a?.id || null,
    activeTag: a === document.body ? 'body' : a?.tagName || null,
    hash: location.hash,
    scrollY: Math.round(scrollY),
    found: [...document.querySelectorAll('.note.is-found')].map((n) => n.id),
    targetTop: target ? Math.round(target.getBoundingClientRect().top) : null,
    barBottom: Math.round($('.bar').getBoundingClientRect().bottom),
    bodyW: Math.round(document.body.getBoundingClientRect().width),
    panel: box(panel),
    resultsBox: dialog.open && !results.hidden ? box(results) : null,
    bar: dialog.open ? box($('.search__bar')) : null,
    countBox: dialog.open ? box($('[data-count]')) : null,
    scrollable: results.scrollHeight > results.clientHeight + 1,
    more: results.classList.contains('is-more'),
    mask: getComputedStyle(results).maskImage,
    sheetH: dialog.style.getPropertyValue('--sheet-h'),
    filterBoxes: dialog.open ? [...document.querySelectorAll('.filter')].map(box) : [],
    togglesScroll: (() => { const t = $('.search__toggles'); return { sw: t.scrollWidth, cw: t.clientWidth }; })(),
    closeBox: dialog.open ? box($('.search__close')) : null,
    closeLabel: { x: shown($('.search__x')), esc: shown($('.search__esc')) },
    optionBoxes: visibleOpts.map(box),
    notes: document.querySelectorAll('[data-note]').length,
    perPart: [...document.querySelectorAll('[data-part]')].map((p) => [p.dataset.part, p.querySelectorAll('[data-note]').length, p.querySelector('.part__count').textContent, $(`.intro__parts a[href="#${p.id}"] .intro__n`).textContent]),
    openShown: getComputedStyle($('[data-open]')).display !== 'none',
    kbdShown: getComputedStyle($('.bar__kbd')).display !== 'none',
    fieldValue: $('#signup-email').value,
    viewport: [innerWidth, innerHeight],
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    rec,
  };
}

// Node side: the served source, the options' accessible names, the forced-colours field, and two pointer paths
// whose coordinates come from the layout (a drag-select that ends outside the panel, a hover at the list's edge).
export async function inspect(page, st) {
  if (st.name === 'top') {
    const src = await page.evaluate(() => fetch(location.href).then((r) => r.text()));
    return { notesInSource: (src.match(/data-note\b/g) || []).length, headingsInSource: (src.match(/<h3\b/g) || []).length, openHiddenInSource: /<button[^>]*data-open[^>]*hidden/.test(src) };
  }
  if (st.name === 'type') {
    const snap = await page.locator('[data-results]').ariaSnapshot();
    const names = [...snap.matchAll(/^\s*- option (?:"((?:[^"\\]|\\.)*)"|([^\n[:]+?))(?= \[|:|$)/gm)].map((m) => (m[1] ?? m[2]).trim());
    const titles = await page.evaluate(() => [...document.querySelectorAll('[data-results] [role="option"]')].map((o) => document.querySelector(`#${o.id.replace(/^opt-/, '')} h3`).textContent.trim()));
    return { names, titles };
  }
  if (st.name === 'slash') {
    await page.emulateMedia({ forcedColors: 'active' });
    const fc = await page.evaluate(() => { const bar = document.querySelector('.search__bar'); const cs = getComputedStyle(bar); return { focusWithin: bar.matches(':focus-within'), style: cs.outlineStyle, width: cs.outlineWidth }; });
    await page.emulateMedia({ forcedColors: 'none' });
    return { forced: fc };
  }
  if (st.name === 'drag') {
    const q = await page.locator('[data-q]').boundingBox();
    const p = await page.locator('[data-panel]').boundingBox();
    const y = q.y + q.height / 2;
    await page.mouse.move(q.x + 120, y);
    await page.mouse.down();
    await page.mouse.move(p.x - 120, y, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    return page.evaluate(() => { const i = document.querySelector('[data-q]'); return { open: document.querySelector('[data-dialog]').open, selection: i.value.slice(i.selectionStart, i.selectionEnd), downs: window.__rec.downs, clicks: window.__rec.clicks }; });
  }
  if (st.name === 'hover') {
    const lb = await page.locator('[data-results]').boundingBox();
    const x = lb.x + lb.width / 2;
    const y = lb.y + lb.height - 6;
    const before = await page.evaluate(() => document.querySelector('[data-results]').scrollTop);
    await page.mouse.move(x, y - 30);
    await page.mouse.move(x, y, { steps: 4 });
    await page.waitForTimeout(250);
    return page.evaluate(([x, y, before]) => {
      const r = document.querySelector('[data-results]');
      return { before, after: r.scrollTop, scrollable: r.scrollHeight > r.clientHeight, under: document.elementFromPoint(x, y)?.closest('[role="option"]')?.id || null, active: document.querySelector('.result.is-active')?.id || null };
    }, [x, y, before]);
  }
  return null;
}

export function assert(r) {
  const s = (n) => r[n]?.state || {};
  const p = (n) => r[n]?.probe || {};
  const ins = (n) => r[n]?.inspect || {};
  const same = (a = [], b = []) => a.length === b.length && a.every((x, i) => x === b[i]);
  const sameSet = (a = [], b = []) => a.length === b.length && a.every((x) => b.includes(x));
  const last = (a = []) => a[a.length - 1];
  const out = [];

  // ---------- Rest, source, semantics ----------
  const t = p('top'), ti = ins('top');
  out.push({ ok: !t.open && t.notes === 48 && s('top').indexed === 48 && t.openShown, message: `top: closed, ${t.notes} notes in the page and ${s('top').indexed} in the index, search button shown` });
  out.push({ ok: ti.notesInSource === 48 && ti.headingsInSource === 48 && ti.openHiddenInSource, message: `no JS: all ${ti.notesInSource} notes and ${ti.headingsInSource} headings are in the served HTML; the search button ships hidden until the script runs` });
  const pp = t.perPart || [];
  const sizes = pp.map((x) => x[1]);
  out.push({ ok: same(sizes, [11, 7, 9, 6, 5, 10]) && pp.every(([, k, c, n]) => c === `${k} changes` && n === `${k} changes`), message: `sections hold different numbers of notes, and the heads and nav say so (${pp.map(([id, k, c, n]) => `${id} ${k}/"${c}"/"${n}"`).join(', ')})` });
  out.push({ ok: t.role === 'combobox' && t.controls === 'search-results' && t.listboxRole === 'listbox', message: 'semantics: the input is a combobox controlling a listbox' });

  // ---------- Opening (full tier), measured ----------
  const sl = p('slash'), slr = sl.rec || {};
  out.push({ ok: sl.open && s('slash').openedBy === '/' && sl.focusInInput && sl.expanded === 'true' && sl.optionIds.length === 48 && sl.activeDescendant === null && same(sl.selected, []), message: `/ opens the dialog with focus in the combobox, all ${sl.optionIds?.length} notes listed, none lit` });
  const op = slr.opens?.[0] || {}, smp = slr.samples || [];
  const opk = op.panel?.[0];
  out.push({ ok: op.panel?.length === 1 && opk.ms === 240 && opk.kf[0].o === 0 && opk.kf[0].t === 'translateY(12px)' && last(opk.kf).o === 1 && last(opk.kf).t === 'none' && op.backdrop?.length === 1 && op.backdrop[0].ms === 240, message: `full tier, as created: the panel fades and rises 12 px over 240 ms, the backdrop fades with it (${JSON.stringify(op)})` });
  const mid = smp.filter((x) => x.y > 0 && x.y < 12 && x.o > 0 && x.o < 1);
  out.push({ ok: smp.length >= 5 && smp.every((x) => x.y >= 0 && x.y <= 12) && mid.length >= 1 && last(smp).y === 0 && last(smp).o === 1, message: `full tier, as painted: ${smp.length} frames, ${mid.length} mid-rise (first ${JSON.stringify(smp[0])}, a middle one ${JSON.stringify(mid[0])}, last ${JSON.stringify(last(smp))})` });
  out.push({ ok: sl.countInBar && sl.countBox && sl.bar && sl.countBox.y >= sl.bar.y && sl.countBox.bottom <= sl.bar.bottom && sl.count === '48 of 48', message: `the count "${sl.count}" sits in the search bar (count ${JSON.stringify(sl.countBox)}, bar ${JSON.stringify(sl.bar)})` });
  out.push({ ok: sl.scrollable && sl.more && /gradient/.test(sl.mask), message: `a list that runs past its edge fades out there (scrollable ${sl.scrollable}, mask ${sl.mask?.slice(0, 40)})` });
  out.push({ ok: t.bodyW === sl.bodyW, message: `opening keeps the page's width: the scroll lock leaves the scrollbar's room (body ${t.bodyW} px at rest, ${sl.bodyW} px open)` });
  const fc = ins('slash').forced || {};
  out.push({ ok: fc.focusWithin && fc.style === 'solid' && fc.width === '2px', message: `forced colours: the focused field carries a ${fc.width} ${fc.style} outline` });
  out.push({ ok: p('ctrl-k').open && s('ctrl-k').openedBy === 'Ctrl+K' && p('ctrl-k').focusInInput, message: 'Ctrl+K opens it too' });
  out.push({ ok: !p('field').open && s('field').opens === 0 && p('field').fieldValue === '/', message: `inside a text field the shortcuts are ignored (field holds "${p('field').fieldValue}", ${s('field').opens} opens)` });

  // ---------- Typing ----------
  const ty = p('type'), tyr = ty.rec || {}, tyi = ins('type');
  out.push({ ok: same(ty.optionIds.slice().sort(), ty.expected.slice().sort()) && ty.optionIds.length === 8 && ty.count === '8 of 48', message: `typing "step" lists exactly what the DOM holds (${ty.optionIds?.length} options, ${ty.expected?.length} expected, count "${ty.count}")` });
  out.push({ ok: ty.marks.length === 8 && ty.marks.every((m) => m.length && m.every((x) => /^step$/i.test(x))), message: `every result marks the matched word starts (${ty.marks?.map((m) => m.length).join(', ')} marks)` });
  out.push({ ok: same(tyr.status, ['8 changes match “step”.']) && ty.status === '8 changes match “step”.', message: `four keystrokes, one polite announcement, counted from the status element's mutations (${JSON.stringify(tyr.status)})` });
  out.push({ ok: ty.activeDescendant === `opt-${ty.optionIds[0]}` && same(ty.selected, [`opt-${ty.optionIds[0]}`]), message: `a narrowed list lights its first option (${ty.activeDescendant})` });
  out.push({ ok: same(tyr.ad, [`opt-${ty.optionIds[0]}`]) && ty.adSameNode === true && s('type').optionsBuilt === 48, message: `the top result never changed, so aria-activedescendant was written once in four keystrokes (${JSON.stringify(tyr.ad)}) and still names the same element (${ty.adSameNode}); ${s('type').optionsBuilt} option elements built in all` });
  out.push({ ok: tyi.names?.length === 8 && same(tyi.names, tyi.titles) && ty.labelledBy.every((c) => c === 'result__title') && ty.describedBy.every((c) => c === 'result__meta'), message: `options are named by their titles alone, described by section and tags (${JSON.stringify(tyi.names?.slice(0, 3))} …)` });
  out.push({ ok: ty.resultsBox && sl.resultsBox && ty.resultsBox.y === sl.resultsBox.y, message: `the list's top edge does not depend on the count's digits (${sl.resultsBox?.y} px at "48 of 48", ${ty.resultsBox?.y} px at "8 of 48")` });

  // ---------- New results by tier ----------
  const wd = p('widen'), wdr = wd.rec || {};
  const riseOk = (x) => x.anims.length === 1 && x.anims[0].ms === 160 && x.anims[0].kf[0].o === 0 && x.anims[0].kf[0].t === 'translateY(4px)' && last(x.anims[0].kf).o === 1 && last(x.anims[0].kf).t === 'none';
  out.push({ ok: wd.optionIds.length === 48 && wdr.added?.length === 40 && wdr.added.every(riseOk), message: `full tier: the 40 options that come back on Backspace fade and rise 4 px over 160 ms (${wdr.added?.length} new, ${wdr.added?.filter(riseOk).length} with that animation; ${JSON.stringify(wdr.added?.[0]?.anims)})` });

  // ---------- Arrows, Enter, click ----------
  const ar = p('arrows');
  out.push({ ok: same(ar.optionIds, ['u-clock-out-over-usb', 'u-follow-start-and-stop', 'u-clock-drift-at-fast-tempos', 'u-tape-delay-with-wow']), message: `ranking: tag matches before a summary match (${ar.optionIds?.join(', ')})` });
  out.push({ ok: ar.activeDescendant === 'opt-u-clock-drift-at-fast-tempos' && same(ar.selected, ['opt-u-clock-drift-at-fast-tempos']) && s('arrows').active === 2 && ar.focusInInput, message: `two ArrowDowns move aria-activedescendant to the third option, focus stays in the input (${ar.activeDescendant})` });
  out.push({ ok: p('wrap').activeDescendant === 'opt-u-tape-delay-with-wow', message: `ArrowUp from the first option wraps to the last (${p('wrap').activeDescendant})` });
  const en = p('enter'), ens = s('enter');
  out.push({ ok: !en.open && en.hash === '#u-ladder-filter-model' && ens.followed === 'u-ladder-filter-model', message: `Enter follows the lit option to its note (${en.hash})` });
  out.push({ ok: en.activeId === 'u-ladder-filter-model-t' && en.targetTop >= en.barBottom - 1 && en.targetTop < 400 && same(en.found, ['u-ladder-filter-model']), message: `focus lands on the note's heading, in view below the bar (top ${en.targetTop}, bar ends ${en.barBottom}), the note tinted` });
  const eu = p('enter-unlit');
  out.push({ ok: eu.open && eu.hash === '' && s('enter-unlit').followed === null && eu.activeDescendant === null && eu.focusInInput, message: `on the un-narrowed list nothing is lit, and Enter goes nowhere (open ${eu.open}, hash "${eu.hash}")` });
  const co = p('click-option');
  out.push({ ok: !co.open && co.hash === '#u-tape-delay-with-wow' && co.activeId === 'u-tape-delay-with-wow-t', message: `a click follows the option clicked, not the lit one (${co.hash}, focus on #${co.activeId})` });
  const bk = p('back');
  out.push({ ok: !bk.open && bk.hash === '' && Math.abs(bk.scrollY - 1200) <= 2, message: `Back after following a note returns to where search began (scrollY ${bk.scrollY}, hash "${bk.hash}")` });

  // ---------- Every way out ----------
  const es = p('escape'), esr = es.rec || {};
  out.push({ ok: !es.open && es.focusOnOpenBtn && s('escape').closes === 1, message: 'Escape closes and returns focus to the search button' });
  const cl = esr.closing || {};
  const fadeOut = (list) => list?.some((a) => a.ms === 80 && last(a.kf).o === 0 && a.kf.every((k) => k.t === null));
  out.push({ ok: cl.open === true && fadeOut(cl.panel) && fadeOut(cl.backdrop), message: `full tier: Escape fades the panel and the backdrop together over 80 ms (${JSON.stringify({ panel: cl.panel, backdrop: cl.backdrop })})` });
  out.push({ ok: !p('escape-opener').open && p('escape-opener').focusOnBrand, message: 'opened by a shortcut, Escape returns focus to the element that had it' });
  const eb = p('escape-body');
  out.push({ ok: eb.rec?.focusBeforeOpen === 'body' && !eb.open && eb.focusOnOpenBtn, message: `opened with nothing focused, Escape lands on the search button, not on the page body the browser would restore (before: ${eb.rec?.focusBeforeOpen}, after: ${eb.activeTag})` });
  const bd = p('backdrop');
  out.push({ ok: !bd.open && last(bd.rec?.downs) === 'dialog' && last(bd.rec?.clicks) === 'dialog' && bd.focusOnOpenBtn, message: `a press and release on the backdrop closes and returns focus (down on ${last(bd.rec?.downs)}, click on ${last(bd.rec?.clicks)})` });
  const dg = ins('drag');
  out.push({ ok: dg.open === true && dg.selection?.length > 0 && last(dg.downs) === 'input' && last(dg.clicks) === 'dialog', message: `selecting the query with the mouse and letting go outside the panel keeps the search open (down on ${last(dg.downs)}, click on ${last(dg.clicks)}, "${dg.selection}" selected, open ${dg.open})` });
  const hv = ins('hover');
  out.push({ ok: hv.scrollable && hv.before === 0 && hv.after === 0 && hv.under && hv.under === hv.active, message: `a pointer at the list's lower edge lights the row under it without scrolling the list (scrollTop ${hv.before} → ${hv.after}, under ${hv.under}, lit ${hv.active})` });

  // ---------- Filters, empty, clear ----------
  const fi = p('filters');
  out.push({ ok: same(fi.pressed, ['interface']) && sameSet(fi.optionIds, fi.expected) && fi.optionIds.length === 2 && fi.status === '2 changes match “step” in Interface.' && !fi.more, message: `a section toggle narrows the results (${fi.optionIds?.length}: ${fi.optionIds?.join(', ')}; "${fi.status}"), a short list has no fade` });
  const em = p('empty');
  out.push({ ok: em.optionIds.length === 0 && em.expected.length === 0 && em.expanded === 'false' && em.emptyShown && !em.keysShown && em.clearText === 'Clear filters' && /No changes match “step” in Effects\. Clear filters/.test(em.status), message: `no results: the combobox collapses, the arrow hint goes, and it offers to clear filters ("${em.status}")` });
  const cr = p('cleared');
  out.push({ ok: cr.pressed.length === 0 && cr.optionIds.length === 8 && cr.focusInInput && !cr.emptyShown && cr.keysShown, message: `Clear filters restores the results and returns focus to the input (${cr.optionIds?.length})` });

  // ---------- Reduced motion, measured ----------
  const rm = p('rm'), rms = s('rm');
  out.push({ ok: rms.motion === 'reduced' && sameSet(rm.optionIds, rm.expected) && rm.optionIds.length === 4, message: `reduced motion: search works the same (${rm.optionIds?.length} for "pads")` });
  out.push({ ok: same(rm.optionIds.slice(0, 2), ['u-pads-dim-when-idle', 'u-velocity-curves']), message: `ranking: a title match comes before a tag match from an earlier section (${rm.optionIds?.slice(0, 2).join(', ')})` });
  const rw = p('rm-widen'), rwr = rw.rec || {};
  const rwo = rwr.opens?.[0]?.panel?.[0];
  out.push({ ok: rwo && rwo.ms === 160 && rwo.kf.every((k) => k.t === null) && rwo.kf[0].o === 0 && rwr.opens[0].backdrop?.[0]?.ms === 160, message: `reduced tier, as created: an opacity-only open over 160 ms, no transform keyframe (${JSON.stringify(rwr.opens?.[0])})` });
  const rsm = rwr.samples || [];
  out.push({ ok: rsm.length >= 5 && rsm.every((x) => x.y === 0) && rsm.some((x) => x.o > 0 && x.o < 1), message: `reduced tier, as painted: ${rsm.length} frames, every one at translateY 0, the opacity in between (${JSON.stringify(rsm.slice(0, 3))} …)` });
  out.push({ ok: rwr.added?.length === 40 && rwr.added.every((x) => x.anims.length === 0), message: `reduced tier: the options that come back simply appear (${rwr.added?.length} new, ${rwr.added?.filter((x) => x.anims.length).length} animated)` });
  out.push({ ok: !rw.open && fadeOut(rwr.closing?.panel) && fadeOut(rwr.closing?.backdrop), message: 'reduced tier: the close still fades panel and backdrop, without movement' });

  // ---------- Static, measured ----------
  const st = p('static'), str = st.rec || {}, sts = s('static');
  out.push({ ok: sts.motion === 'static' && sts.lastOpen?.ms === 0 && str.opens?.[0]?.panel?.length === 0 && str.opens[0].backdrop?.length === 0 && str.samples?.[0]?.o === 1 && str.samples.every((x) => x.y === 0 && x.o === 1), message: `static tier (set after load): the dialog opens as a cut, opaque from its first frame (${JSON.stringify(str.samples?.[0])}, ${str.opens?.[0]?.panel?.length} animations)` });
  out.push({ ok: str.added?.length === 40 && str.added.every((x) => x.anims.length === 0), message: `static tier: the options that come back are not faded (${str.added?.length} new, ${str.added?.filter((x) => x.anims.length).length} animated)` });
  const sc = p('static-close'), scr = sc.rec || {};
  out.push({ ok: !sc.open && scr.closing?.open === false && scr.closing.panel.length === 0 && scr.closing.backdrop.length === 0, message: `static tier: Escape closes at once, nothing animated (${JSON.stringify(scr.closing)})` });

  // ---------- Phone ----------
  const mo = p('mobile');
  out.push({ ok: mo.openShown && !mo.kbdShown && mo.overflowX <= 0, message: `phone: search button shown without the key hint, no sideways overflow (${mo.overflowX})` });
  const mop = p('mobile-open');
  out.push({ ok: mop.open && mop.panel.x === 0 && mop.panel.y === 0 && mop.panel.w === mop.viewport[0] && mop.panel.h === mop.viewport[1] && mop.sheetH === `${mop.viewport[1]}px`, message: `phone: a full sheet sized from the visual viewport (${JSON.stringify(mop.panel)}, --sheet-h ${mop.sheetH})` });
  out.push({ ok: sameSet(mop.optionIds, mop.expected) && mop.optionIds.length === 8 && mop.overflowX <= 0, message: `phone: "midi" lists ${mop.optionIds?.length} notes, no overflow` });
  const fb = mop.filterBoxes || [];
  const tg = [...fb.map((b) => Math.min(b.w, b.h)), mop.closeBox?.h ?? 0, mop.closeBox?.w ?? 0, ...(mop.optionBoxes || []).map((b) => b.h)];
  out.push({ ok: fb.length === 6 && tg.every((v) => v >= 44), message: `phone: toggles, the close button and the options are all at least 44 px (smallest ${Math.min(...tg)})` });
  out.push({ ok: new Set(fb.map((b) => b.y)).size === 1 && mop.togglesScroll.sw > mop.togglesScroll.cw && mop.countInBar && mop.resultsBox?.y < 160, message: `phone: the toggles are one row that scrolls sideways (${mop.togglesScroll.sw} in ${mop.togglesScroll.cw}), the count is in the bar, results start at ${mop.resultsBox?.y} px` });
  out.push({ ok: mop.closeLabel.x && !mop.closeLabel.esc, message: `touch: the close button reads Close, not Esc (${JSON.stringify(mop.closeLabel)})` });
  return out;
}
