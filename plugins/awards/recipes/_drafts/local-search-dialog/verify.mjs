// Local search over the page's own list: `/` and Ctrl+K open a native dialog (never from inside a text field), typing
// filters to exactly what an independent matcher finds in the DOM, matched word starts are marked, the polite count is
// announced once per pause, arrows move aria-activedescendant, Enter follows the active option to its note and focuses
// its heading, Escape returns focus to whatever opened the dialog, section toggles narrow and an empty result offers
// to clear them. Every note is in the served HTML. Reduced motion opens with opacity only; phones get a full sheet.
const type = (word) => [...word].map((key) => ({ type: 'press', key }));
const slash = { type: 'press', key: '/' };

export const states = [
  { name: 'top', settle: 500 },
  { name: 'slash', settle: 500, actions: [slash, { type: 'wait', ms: 400 }] },
  { name: 'ctrl-k', settle: 500, actions: [{ type: 'press', key: 'Control+k' }, { type: 'wait', ms: 400 }] },
  { name: 'field', settle: 500, actions: [{ type: 'focus', selector: '#signup-email' }, slash, { type: 'press', key: 'Control+k' }, { type: 'wait', ms: 300 }] },
  { name: 'type', settle: 500, frame: true, actions: [slash, { type: 'wait', ms: 300 }, ...type('step'), { type: 'wait', ms: 900 }] },
  { name: 'arrows', settle: 500, actions: [slash, { type: 'wait', ms: 300 }, ...type('sync'), { type: 'press', key: 'ArrowDown' }, { type: 'press', key: 'ArrowDown' }, { type: 'wait', ms: 300 }] },
  { name: 'wrap', settle: 500, actions: [slash, { type: 'wait', ms: 300 }, ...type('sync'), { type: 'press', key: 'ArrowUp' }, { type: 'wait', ms: 300 }] },
  { name: 'enter', settle: 500, actions: [slash, { type: 'wait', ms: 300 }, ...type('ladder'), { type: 'press', key: 'Enter' }, { type: 'wait', ms: 600 }] },
  { name: 'escape', settle: 500, actions: [{ type: 'click', selector: '[data-open]' }, { type: 'wait', ms: 400 }, ...type('fx'), { type: 'press', key: 'Escape' }, { type: 'wait', ms: 400 }] },
  { name: 'escape-opener', settle: 500, actions: [{ type: 'focus', selector: '.bar__brand' }, slash, { type: 'wait', ms: 400 }, { type: 'press', key: 'Escape' }, { type: 'wait', ms: 400 }] },
  { name: 'filters', settle: 500, actions: [slash, { type: 'wait', ms: 300 }, ...type('step'), { type: 'click', selector: '[data-filter="interface"]' }, { type: 'wait', ms: 900 }] },
  { name: 'empty', settle: 500, actions: [slash, { type: 'wait', ms: 300 }, ...type('step'), { type: 'click', selector: '[data-filter="effects"]' }, { type: 'wait', ms: 900 }] },
  { name: 'cleared', settle: 500, actions: [slash, { type: 'wait', ms: 300 }, ...type('step'), { type: 'click', selector: '[data-filter="effects"]' }, { type: 'wait', ms: 300 }, { type: 'click', selector: '[data-clear]' }, { type: 'wait', ms: 900 }] },
  { name: 'rm', reducedMotion: true, settle: 500, actions: [{ type: 'click', selector: '[data-open]' }, { type: 'wait', ms: 400 }, ...type('pads'), { type: 'wait', ms: 300 }] },
  { name: 'mobile', viewport: 'mobile', settle: 500 },
  { name: 'mobile-open', viewport: 'mobile', settle: 500, actions: [{ type: 'click', selector: '[data-open]' }, { type: 'wait', ms: 400 }, ...type('midi'), { type: 'wait', ms: 900 }] },
];

export function probe() {
  const dialog = document.querySelector('[data-dialog]');
  const input = document.querySelector('[data-q]');
  const panel = document.querySelector('[data-panel]');
  const results = document.querySelector('[data-results]');
  const opts = [...results.querySelectorAll('[role="option"]')];
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
  const pr = panel.getBoundingClientRect();
  const empty = document.querySelector('[data-empty]');
  return {
    open: dialog.open,
    role: input.getAttribute('role'),
    controls: input.getAttribute('aria-controls'),
    listboxRole: results.getAttribute('role'),
    expanded: input.getAttribute('aria-expanded'),
    activeDescendant: input.getAttribute('aria-activedescendant'),
    selected: opts.filter((o) => o.getAttribute('aria-selected') === 'true').map((o) => o.id),
    optionIds: opts.map((o) => o.id.replace(/^opt-/, '')),
    expected,
    marks: opts.map((o) => [...o.querySelectorAll('mark')].map((m) => m.textContent)),
    count: document.querySelector('[data-count]').textContent,
    status: document.querySelector('[data-status]').textContent,
    emptyShown: !empty.hidden && getComputedStyle(empty).display !== 'none',
    emptyText: document.querySelector('[data-empty-text]').textContent,
    clearText: document.querySelector('[data-clear]').textContent,
    pressed,
    focusInInput: a === input,
    focusOnOpenBtn: a === document.querySelector('[data-open]'),
    focusOnBrand: a === document.querySelector('.bar__brand'),
    activeId: a?.id || null,
    hash: location.hash,
    found: [...document.querySelectorAll('.note.is-found')].map((n) => n.id),
    targetTop: target ? Math.round(target.getBoundingClientRect().top) : null,
    barBottom: Math.round(document.querySelector('.bar').getBoundingClientRect().bottom),
    panel: { x: Math.round(pr.left), y: Math.round(pr.top), w: Math.round(pr.width), h: Math.round(pr.height) },
    panelTransform: getComputedStyle(panel).transform,
    panelOpacity: getComputedStyle(panel).opacity,
    notes: document.querySelectorAll('[data-note]').length,
    openShown: getComputedStyle(document.querySelector('[data-open]')).display !== 'none',
    kbdShown: getComputedStyle(document.querySelector('.bar__kbd')).display !== 'none',
    fieldValue: document.querySelector('#signup-email').value,
    viewport: [innerWidth, innerHeight],
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side, at rest: the notes are in the served HTML, not written by the script.
export async function inspect(page, st) {
  if (st.name !== 'top') return null;
  const src = await page.evaluate(() => fetch(location.href).then((r) => r.text()));
  return { notesInSource: (src.match(/data-note\b/g) || []).length, headingsInSource: (src.match(/<h3\b/g) || []).length, openHiddenInSource: /<button[^>]*data-open[^>]*hidden/.test(src) };
}

export function assert(r) {
  const s = (n) => r[n]?.state || {};
  const p = (n) => r[n]?.probe || {};
  const same = (a = [], b = []) => a.length === b.length && a.every((x, i) => x === b[i]);
  const sameSet = (a = [], b = []) => a.length === b.length && a.every((x) => b.includes(x));
  const out = [];
  const t = p('top'), ti = r.top?.inspect || {};
  out.push({ ok: !t.open && t.notes === 48 && s('top').indexed === 48 && t.openShown, message: `top: closed, 48 notes in the page and in the index, search button shown (${t.notes})` });
  out.push({ ok: ti.notesInSource === 48 && ti.headingsInSource === 48 && ti.openHiddenInSource, message: `no JS: all ${ti.notesInSource} notes and headings are in the served HTML; the search button ships hidden until the script runs` });
  out.push({ ok: t.role === 'combobox' && t.controls === 'search-results' && t.listboxRole === 'listbox', message: 'semantics: the input is a combobox controlling a listbox' });

  const sl = p('slash');
  out.push({ ok: sl.open && s('slash').openedBy === '/' && sl.focusInInput && sl.expanded === 'true' && sl.optionIds.length === 48 && sl.activeDescendant === null, message: `/ opens the dialog with focus in the combobox, all ${sl.optionIds.length} notes listed, none active yet` });
  out.push({ ok: s('slash').lastOpen?.rise === 12 && s('slash').lastOpen?.ms === 240, message: `full tier: the dialog fades and rises (${JSON.stringify(s('slash').lastOpen)})` });
  out.push({ ok: p('ctrl-k').open && s('ctrl-k').openedBy === 'Ctrl+K' && p('ctrl-k').focusInInput, message: 'Ctrl+K opens it too' });
  out.push({ ok: !p('field').open && s('field').opens === 0 && p('field').fieldValue === '/', message: `inside a text field the shortcuts are ignored (field holds "${p('field').fieldValue}", ${s('field').opens} opens)` });

  const ty = p('type'), tys = s('type');
  out.push({ ok: same(ty.optionIds.slice().sort(), ty.expected.slice().sort()) && ty.optionIds.length === 8 && ty.count === '8 of 48', message: `typing "step" lists exactly what the DOM holds (${ty.optionIds.length} options, ${ty.expected.length} expected, count "${ty.count}")` });
  out.push({ ok: ty.marks.length === 8 && ty.marks.every((m) => m.length && m.every((x) => /^step$/i.test(x))), message: `every result marks the matched word starts (${ty.marks.map((m) => m.length).join(', ')} marks)` });
  out.push({ ok: tys.announcements === 1 && ty.status === '8 changes match “step”.', message: `four keystrokes, one polite announcement ("${ty.status}", ${tys.announcements})` });
  out.push({ ok: ty.activeDescendant === `opt-${ty.optionIds[0]}` && same(ty.selected, [`opt-${ty.optionIds[0]}`]), message: `a narrowed list makes its first option active (${ty.activeDescendant})` });

  const ar = p('arrows');
  out.push({ ok: same(ar.optionIds, ['u-clock-out-over-usb', 'u-follow-start-and-stop', 'u-clock-drift-at-fast-tempos', 'u-tape-delay-with-wow']), message: `ranking: tag matches before a summary match (${ar.optionIds.join(', ')})` });
  out.push({ ok: ar.activeDescendant === 'opt-u-clock-drift-at-fast-tempos' && same(ar.selected, ['opt-u-clock-drift-at-fast-tempos']) && s('arrows').active === 2 && ar.focusInInput, message: `two ArrowDowns move aria-activedescendant to the third option, focus stays in the input (${ar.activeDescendant})` });
  out.push({ ok: p('wrap').activeDescendant === 'opt-u-tape-delay-with-wow', message: `ArrowUp from the first option wraps to the last (${p('wrap').activeDescendant})` });

  const en = p('enter'), ens = s('enter');
  out.push({ ok: !en.open && en.hash === '#u-ladder-filter-model' && ens.followed === 'u-ladder-filter-model', message: `Enter follows the active option to its note (${en.hash})` });
  out.push({ ok: en.activeId === 'u-ladder-filter-model-t' && en.targetTop >= en.barBottom - 1 && en.targetTop < 400 && same(en.found, ['u-ladder-filter-model']), message: `focus lands on the note's heading, in view below the bar (top ${en.targetTop}, bar ends ${en.barBottom}), the note tinted` });

  out.push({ ok: !p('escape').open && p('escape').focusOnOpenBtn && s('escape').closes === 1, message: 'Escape closes and returns focus to the search button' });
  out.push({ ok: !p('escape-opener').open && p('escape-opener').focusOnBrand, message: 'opened by a shortcut, Escape returns focus to the element that had it' });

  const fi = p('filters');
  out.push({ ok: same(fi.pressed, ['interface']) && sameSet(fi.optionIds, fi.expected) && fi.optionIds.length === 2 && fi.status === '2 changes match “step” in Interface.', message: `a section toggle narrows the results (${fi.optionIds.length}: ${fi.optionIds.join(', ')}; "${fi.status}")` });
  const em = p('empty');
  out.push({ ok: em.optionIds.length === 0 && em.expected.length === 0 && em.expanded === 'false' && em.emptyShown && em.clearText === 'Clear filters' && /No changes match “step” in Effects\. Clear filters/.test(em.status), message: `no results: the combobox collapses and offers to clear filters ("${em.status}")` });
  const cl = p('cleared');
  out.push({ ok: cl.pressed.length === 0 && cl.optionIds.length === 8 && cl.focusInInput && !cl.emptyShown, message: `Clear filters restores the results and returns focus to the input (${cl.optionIds.length})` });

  const rm = p('rm'), rms = s('rm');
  out.push({ ok: rms.motion === 'reduced' && rms.lastOpen?.rise === 0 && rms.lastOpen?.ms === 160 && rm.panelTransform === 'none' && rm.panelOpacity === '1', message: `reduced motion: opacity only (${JSON.stringify(rms.lastOpen)}), no transform at rest` });
  out.push({ ok: sameSet(rm.optionIds, rm.expected) && rm.optionIds.length === 5, message: `reduced motion: search works the same (${rm.optionIds.length} for "pads")` });

  const mo = p('mobile');
  out.push({ ok: mo.openShown && !mo.kbdShown && mo.overflowX <= 0, message: `phone: search button shown without the key hint, no sideways overflow (${mo.overflowX})` });
  const mop = p('mobile-open');
  out.push({ ok: mop.open && mop.panel.x === 0 && mop.panel.y === 0 && mop.panel.w === mop.viewport[0] && mop.panel.h === mop.viewport[1], message: `phone: the dialog is a full sheet (${JSON.stringify(mop.panel)})` });
  out.push({ ok: sameSet(mop.optionIds, mop.expected) && mop.optionIds.length === 10 && mop.overflowX <= 0, message: `phone: "midi" lists ${mop.optionIds.length} notes, no overflow` });
  return out;
}
