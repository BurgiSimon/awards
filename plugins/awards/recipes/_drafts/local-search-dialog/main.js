import { awards } from '../../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// Local search over a page's own list. The index is read from the DOM once (title, section, tags, summary), so what
// search finds is exactly what the page shows and find-in-page still works. A native <dialog> holds a combobox over a
// listbox: words match as prefixes, every word must match, matches are marked, arrows move the active option through
// aria-activedescendant, Enter follows the active (lit) option, Escape closes and returns focus. The count is
// announced, debounced. The motion tier is read on every open, close and render, so a site's motion switch applies
// at once.

syncMotionTierAttribute();

const ANNOUNCE_MS = 450;                      // the polite count waits for a pause in typing
const OPEN_RISE = 12;                         // px, full tier only
const OPEN_MS = 240;                          // the dialog's fade and rise in the full tier
const FADE_MS = 160;                          // the opacity-only open in the reduced tier
const CLOSE_MS = 80;                          // the panel and backdrop fade out (full and reduced)
const RESULT_RISE = 4;                        // px, new results in the full tier only
const FOUND_MS = 1600;                        // the followed note's tint
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'; // --ease-out-expo
// The token in milliseconds, whichever unit it arrives in: a minifier rewrites `160ms` as `.16s`.
const feedbackMs = () => {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--dur-feedback').trim();
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return 0;
  return /ms$/i.test(v) ? n : /s$/i.test(v) ? n * 1000 : n;
};

const html = document.documentElement;
const dialog = document.querySelector('[data-dialog]');
const panel = dialog.querySelector('[data-panel]');
const input = dialog.querySelector('[data-q]');
const results = dialog.querySelector('[data-results]');
const empty = dialog.querySelector('[data-empty]');
const emptyText = dialog.querySelector('[data-empty-text]');
const clearBtn = dialog.querySelector('[data-clear]');
const countEl = dialog.querySelector('[data-count]');
const keys = dialog.querySelector('[data-keys]');
const status = dialog.querySelector('[data-status]');
const toggles = [...dialog.querySelectorAll('[data-filter]')];
const openBtn = document.querySelector('[data-open]');
const vv = window.visualViewport;

// ---------- The index, read from the page ----------
const WORD = /[\p{L}\p{N}]+/gu;
const fold = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const words = (s) => fold(s).match(WORD) || [];
const notes = [...document.querySelectorAll('[data-note]')].map((el, order) => {
  const part = el.closest('[data-part]');
  const title = el.querySelector('.note__title').textContent.trim();
  const summary = el.querySelector('.note__summary').textContent.trim();
  const tags = [...el.querySelectorAll('.note__tags li')].map((t) => t.textContent.trim());
  const section = part.querySelector('.part__title').textContent.trim();
  return { el, id: el.id, order, part: part.dataset.part, section, title, summary, tags, w: { title: words(title), meta: words(`${section} ${tags.join(' ')}`), summary: words(summary) } };
});
const sectionName = Object.fromEntries(notes.map((n) => [n.part, n.section]));
const hits = (list, t) => list.some((w) => w.startsWith(t));
const score = (n, terms) => terms.reduce((s, t) => s + (hits(n.w.title, t) ? 3 : hits(n.w.meta, t) ? 2 : 1), 0);

const filters = new Set();
let shown = [];
let active = -1;
let activeEl = null;
let opener = null;
let closing = false;
let pending = null;
let announceTimer = 0;
let running = [];
const state = { opens: 0, closes: 0, openedBy: null, lastOpen: null, lastClose: null, announced: '', announcements: 0, followed: null, renders: 0, built: 0 };

// ---------- Rendering ----------
// Text with every word that begins with a search term marked (the term's length of it), built as nodes, never HTML.
function marked(text, terms) {
  const frag = document.createDocumentFragment();
  let at = 0;
  if (terms.length) {
    for (const m of text.matchAll(WORD)) {
      const f = fold(m[0]);
      const t = terms.filter((x) => f.startsWith(x)).sort((a, b) => b.length - a.length)[0];
      if (!t) continue;
      let k = t.length;                                    // map the folded length back onto the original word
      while (k < m[0].length && fold(m[0].slice(0, k)).length < t.length) k++;
      frag.append(text.slice(at, m.index));
      const mark = document.createElement('mark');
      mark.textContent = m[0].slice(0, k);
      frag.append(mark);
      at = m.index + k;
    }
  }
  frag.append(text.slice(at));
  return frag;
}

// One option element per note, kept between renders: while the top result stays the same, the active option is the
// same element and a screen reader has nothing new to read. Options are named by their title alone and described by
// section and tags; the summary is for the eye.
const nodes = new Map();
function option(n, terms) {
  let o = nodes.get(n.id);
  if (!o) {
    const li = document.createElement('li');
    li.id = `opt-${n.id}`;
    li.className = 'result';
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', 'false');
    li.setAttribute('aria-labelledby', `${li.id}-t`);
    li.setAttribute('aria-describedby', `${li.id}-m`);
    const span = (cls, id) => { const s = document.createElement('span'); s.className = cls; if (id) s.id = id; return s; };
    const step = span('result__step');
    step.setAttribute('aria-hidden', 'true');
    o = { li, step, title: span('result__title', `${li.id}-t`), meta: span('result__meta', `${li.id}-m`), summary: span('result__summary'), key: null };
    li.append(o.step, o.title, o.meta, o.summary);
    nodes.set(n.id, o);
    state.built++;
  }
  const key = terms.join(' ');
  if (o.key !== key) {
    o.title.replaceChildren(marked(n.title, terms));
    o.meta.replaceChildren(marked(`${n.section} · ${n.tags.join(', ')}`, terms));
    o.summary.replaceChildren(marked(n.summary, terms));
    o.key = key;
  }
  return o;
}
// Put the wanted options in order, moving only what has to move: options that stay are never detached.
function place(lis) {
  const want = new Set(lis);
  for (const c of [...results.children]) if (!want.has(c)) c.remove();
  lis.forEach((li, i) => { if (results.children[i] !== li) results.insertBefore(li, results.children[i] || null); });
}

const listJoin = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a.at(-1)}`);
function sentence(k, q) {
  const scope = filters.size ? ` in ${listJoin([...filters].map((f) => sectionName[f]))}` : '';
  if (!k) return `No changes match “${q}”${scope}.${filters.size ? ' Clear filters to search every section.' : ''}`;
  if (!q) return `${k} ${k === 1 ? 'change' : 'changes'}${scope}.`;
  return `${k} ${k === 1 ? 'change matches' : 'changes match'} “${q}”${scope}.`;
}

// A list that runs on past its bottom edge fades out there, so a list cut on a divider never reads as complete.
const updateMore = () => results.classList.toggle('is-more', !results.hidden && results.scrollHeight - results.scrollTop - results.clientHeight > 1);
results.addEventListener('scroll', updateMore, { passive: true });

function run({ silent = false } = {}) {
  const tier = motionTier();
  const q = input.value.trim();
  const terms = [...new Set(words(q))];
  const before = new Set(shown.map((n) => n.id));
  shown = notes.filter((n) => (!filters.size || filters.has(n.part)) && terms.every((t) => hits(n.w.title, t) || hits(n.w.meta, t) || hits(n.w.summary, t)));
  if (terms.length) shown.sort((a, b) => score(b, terms) - score(a, terms) || a.order - b.order);
  const opts = shown.map((n, i) => { const o = option(n, terms); o.step.textContent = String(i + 1).padStart(2, '0'); return o.li; });
  place(opts);
  state.renders++;
  // Automatic selection once the reader has narrowed the list, so Enter opens the best match; the full list has no
  // active option and Enter does nothing there. Only a new top result moves aria-activedescendant.
  const top = shown.length && (terms.length || filters.size) ? opts[0] : null;
  if (top !== activeEl) setActive(top ? 0 : -1);
  else active = top ? 0 : -1;
  const some = shown.length > 0;
  input.setAttribute('aria-expanded', String(some));
  results.hidden = !some;
  keys.hidden = !some;
  empty.hidden = some;
  emptyText.textContent = sentence(0, q);
  clearBtn.textContent = filters.size ? 'Clear filters' : 'Clear search';
  countEl.textContent = `${shown.length} of ${notes.length}`;
  if (dialog.open) updateMore();
  // New results arrive on the feedback band with a 4 px rise in the full tier; in the reduced and static tiers they
  // simply appear, since they change on every keystroke.
  const ms = tier === 'full' ? feedbackMs() : 0;
  if (ms > 0) {
    const kf = [{ opacity: 0, transform: `translateY(${RESULT_RISE}px)` }, { opacity: 1, transform: 'none' }];
    opts.forEach((o, i) => { if (!before.has(shown[i].id)) o.animate(kf, { duration: ms, easing: EASE }); });
  }
  if (!silent) {
    clearTimeout(announceTimer);
    const text = sentence(shown.length, q);
    announceTimer = setTimeout(() => { status.textContent = text; state.announced = text; state.announcements++; }, ANNOUNCE_MS);
  }
}

// Keyboard and automatic selection keep the active option in view; a pointer never scrolls the list under itself.
function setActive(i, { scroll = true } = {}) {
  const o = results.children[i] || null;
  if (activeEl && activeEl !== o) { activeEl.setAttribute('aria-selected', 'false'); activeEl.classList.remove('is-active'); }
  active = o ? i : -1;
  if (o !== activeEl) {
    activeEl = o;
    if (!o) { input.removeAttribute('aria-activedescendant'); return; }
    o.setAttribute('aria-selected', 'true');
    o.classList.add('is-active');
    input.setAttribute('aria-activedescendant', o.id);
  }
  if (o && scroll) o.scrollIntoView({ block: 'nearest' });
}

// ---------- Opening and closing ----------
// On a phone the sheet is as tall as the visible viewport, so a soft keyboard laid over the page does not hide the
// end of the list.
const fitSheet = () => { if (vv) dialog.style.setProperty('--sheet-h', `${Math.round(vv.height)}px`); };
const cancelRunning = () => { for (const a of running) a.cancel(); running = []; };

function open(by) {
  if (dialog.open) return;
  const tier = motionTier();
  const from = document.activeElement;
  opener = from && from !== document.body && !dialog.contains(from) ? from : openBtn;
  state.openedBy = by;
  html.classList.add('search-open');
  fitSheet();
  dialog.showModal();
  vv?.addEventListener('resize', fitSheet);
  input.focus();
  input.select();
  run({ silent: true });
  state.opens++;
  cancelRunning();
  if (tier === 'static') { state.lastOpen = { tier, rise: 0, ms: 0 }; return; }
  const full = tier === 'full';
  const kf = full ? [{ opacity: 0, transform: `translateY(${OPEN_RISE}px)` }, { opacity: 1, transform: 'none' }] : [{ opacity: 0 }, { opacity: 1 }];
  const ms = full ? OPEN_MS : FADE_MS;
  running.push(panel.animate(kf, { duration: ms, easing: EASE }));
  try { running.push(dialog.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: 'linear', pseudoElement: '::backdrop' })); } catch { /* no backdrop animation */ }
  state.lastOpen = { tier, rise: full ? OPEN_RISE : 0, ms };
}

function close(to = null) {
  if (!dialog.open || closing) return;
  closing = true;
  pending = to;
  const tier = motionTier();
  if (tier === 'static') { state.lastClose = { tier, ms: 0 }; dialog.close(); return; }
  // Panel and backdrop fade together, from wherever an unfinished open left them.
  const from = Number(getComputedStyle(panel).opacity);
  const opts = { duration: CLOSE_MS, easing: 'linear', fill: 'forwards' };
  const fade = panel.animate([{ opacity: from }, { opacity: 0 }], opts);
  running.push(fade);
  try { running.push(dialog.animate([{ opacity: from }, { opacity: 0 }], { ...opts, pseudoElement: '::backdrop' })); } catch { /* no backdrop animation */ }
  state.lastClose = { tier, ms: CLOSE_MS };
  fade.finished.catch(() => {}).then(() => { if (dialog.open) dialog.close(); });
}

// Every way out ends here, including the browser closing the dialog itself.
dialog.addEventListener('close', () => {
  closing = false;
  cancelRunning();
  vv?.removeEventListener('resize', fitSheet);
  html.classList.remove('search-open');
  clearTimeout(announceTimer);
  state.closes++;
  if (pending) { go(pending); pending = null; } else (opener?.isConnected ? opener : openBtn).focus();
});
dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });   // Escape, animated
// The backdrop area closes only when the press and the release both land on it: selecting the query with the mouse
// and letting go outside the panel must not close the search.
let pressedOnBackdrop = false;
dialog.addEventListener('pointerdown', (e) => { pressedOnBackdrop = e.target === dialog; });
dialog.addEventListener('pointerup', (e) => { if (e.target !== dialog) pressedOnBackdrop = false; });
dialog.addEventListener('click', (e) => { if (pressedOnBackdrop && e.target === dialog) close(); pressedOnBackdrop = false; });
dialog.querySelector('[data-close]').addEventListener('click', () => close());

// Following a result: the dialog closes, the page goes to the note, focus lands on its heading, the note is tinted.
let foundTimer = 0;
function go(n) {
  history.pushState(null, '', `#${n.id}`);
  n.el.scrollIntoView({ block: 'start' });
  n.el.querySelector('h3').focus({ preventScroll: true });
  document.querySelectorAll('.note.is-found').forEach((el) => el.classList.remove('is-found'));
  n.el.classList.add('is-found');
  clearTimeout(foundTimer);
  foundTimer = setTimeout(() => n.el.classList.remove('is-found'), FOUND_MS);
  state.followed = n.id;
}
const follow = (i) => { if (shown[i]) close(shown[i]); };

// ---------- Input ----------
input.addEventListener('input', () => run());
input.addEventListener('keydown', (e) => {
  if (e.isComposing) return;
  const k = shown.length;
  if (e.key === 'ArrowDown' && k) { e.preventDefault(); setActive(active < 0 ? 0 : (active + 1) % k); }
  else if (e.key === 'ArrowUp' && k) { e.preventDefault(); setActive(active <= 0 ? k - 1 : active - 1); }
  else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); follow(active); }  // only the lit option
});
results.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  const o = e.target.closest('[role="option"]');
  const i = o ? [...results.children].indexOf(o) : -1;
  if (i >= 0 && i !== active) setActive(i, { scroll: false });
});
results.addEventListener('click', (e) => {
  const o = e.target.closest('[role="option"]');
  if (o) follow([...results.children].indexOf(o));
});
toggles.forEach((b) => b.addEventListener('click', () => {
  const on = b.getAttribute('aria-pressed') !== 'true';
  b.setAttribute('aria-pressed', String(on));
  if (on) filters.add(b.dataset.filter); else filters.delete(b.dataset.filter);
  run();
}));
clearBtn.addEventListener('click', () => {
  if (filters.size) { filters.clear(); toggles.forEach((b) => b.setAttribute('aria-pressed', 'false')); } else input.value = '';
  run();
  input.focus();
});

// ---------- Shortcuts: / and Ctrl/Cmd+K, never while typing in a field ----------
const typing = (el) => !!el && (el.isContentEditable || el.matches?.('textarea, select, input:not([type="button"], [type="submit"], [type="reset"], [type="checkbox"], [type="radio"], [type="range"], [type="color"], [type="file"])'));
document.addEventListener('keydown', (e) => {
  if (dialog.open || e.defaultPrevented || e.isComposing || typing(e.target)) return;
  const slash = e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey;
  const k = (e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey;
  if (!slash && !k) return;
  e.preventDefault();
  open(slash ? '/' : 'Ctrl+K');
});
openBtn.addEventListener('click', () => open('button'));

// The sign-up field is here to show the shortcuts stepping aside; it sends nothing.
const signup = document.querySelector('[data-signup]');
signup.addEventListener('submit', (e) => { e.preventDefault(); signup.querySelector('[data-signup-status]').textContent = 'Synthetic demo: nothing was sent.'; });

// Everything search needs exists only with the script, so it appears with the script.
openBtn.hidden = false;
document.querySelector('[data-how]').hidden = false;
run({ silent: true });

awards.addState(() => ({
  motion: motionTier(),
  open: dialog.open,
  opens: state.opens,
  closes: state.closes,
  openedBy: state.openedBy,
  lastOpen: state.lastOpen,
  lastClose: state.lastClose,
  query: input.value,
  filters: [...filters],
  count: shown.length,
  shownIds: shown.map((n) => n.id),
  active,
  activeDescendant: input.getAttribute('aria-activedescendant'),
  announced: state.announced,
  announcements: state.announcements,
  followed: state.followed,
  indexed: notes.length,
  optionsBuilt: state.built,
}));
awards.ready();
