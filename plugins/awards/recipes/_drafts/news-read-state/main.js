import { awards } from '../../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// A dated diary that remembers what this visitor has read. Read state lives in one localStorage record behind
// try/catch; when the browser refuses storage, or a write fails mid-visit, the page still counts and marks, from
// memory, and says so in words. Entries are read when opened (a native <details>, so they open without script too) or
// when one sits wholly in view below the sticky masthead for 1.2 s after the visitor has scrolled. The count is text
// in the menu link; a polite status speaks for the visitor's own acts (open, mark all) and stays silent for the rest.

// --- demo only: start. This block and the one at the end of the file are the demo's controls; delete both. ---
// ?storage=blocked makes localStorage throw on access, as a browser that blocks site data does.
if (new URLSearchParams(location.search).get('storage') === 'blocked') {
  try {
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Site storage is blocked.', 'SecurityError'); } });
  } catch { /* the property could not be replaced: the page simply keeps storage */ }
}
// A later entry held in a <template> until the demo publishes it. Its own key, never part of the visitor's record.
const DEMO_KEY = 'mlb-diary:demo';
const demo = (() => {
  try { const d = JSON.parse(localStorage.getItem(DEMO_KEY) || 'null'); return d && Array.isArray(d.published) ? d : { published: [] }; } catch { return { published: [] }; }
})();
const held = document.querySelector('template[data-held]');
const heldId = held.content.querySelector('[data-entry]').dataset.id;
if (demo.published.includes(heldId)) document.querySelector('[data-diary]').prepend(held.content.firstElementChild.cloneNode(true));
// --- demo only: end ---

syncMotionTierAttribute();

const KEY = 'mlb-diary';
const FRESH_DAYS = 21;    // a first visit treats entries from the 21 days before the newest one as new
const DWELL_MS = 1200;    // wholly in view this long, after a scroll, counts as read
const ARM_AFTER = 600;    // ms after boot before a scroll can arm the dwell (a restored scroll position cannot)
const FADE_MS = 420;      // the New mark's fade (--dur-routine, 400 ms) before it leaves the accessibility tree

const list = document.querySelector('[data-diary]');
const navCount = document.querySelector('[data-count]');
const summary = document.querySelector('[data-summary]');
const markAll = document.querySelector('[data-mark-all]');
const status = document.querySelector('[data-status]');
const note = document.querySelector('[data-storage-note]');
const header = document.querySelector('[data-masthead]');

// Storage: probe once with a write and a remove; every access is guarded. A write that fails later (a full or revoked
// store) drops to memory for the rest of the visit, and the page says so.
function openStore() {
  try {
    const ls = window.localStorage;
    ls.setItem(`${KEY}:probe`, '1');
    ls.removeItem(`${KEY}:probe`);
    return ls;
  } catch { return null; }
}
const ls = openStore();
const store = {
  mode: ls ? 'local' : 'memory',
  failed: false,
  load() { if (!ls) return null; try { return JSON.parse(ls.getItem(KEY) || 'null'); } catch { return 'unreadable'; } },
  save(d) {
    if (store.mode !== 'local') return false;
    try { ls.setItem(KEY, JSON.stringify(d)); return true; } catch { store.mode = 'memory'; store.failed = true; reflectStorage(); return false; }
  },
  clear() { try { ls?.removeItem(KEY); } catch { /* nothing to clear */ } },
};
function reflectStorage() {
  note.hidden = false;
  note.textContent = store.mode === 'local'
    ? 'Read marks are kept in this browser, on this device only.'
    : store.failed
      ? 'This browser stopped saving site storage, so read marks from now on last only until you leave the page.'
      : 'This browser is refusing site storage, so read marks last only until you leave the page.';
  if (store.mode === 'local') return;
  // Anything that needs storage to do its job says why it cannot, and stays focusable.
  for (const el of document.querySelectorAll('[data-needs-storage]')) {
    el.setAttribute('aria-disabled', 'true');
    el.setAttribute('aria-describedby', note.id);
  }
}

// The record is checked, not trusted: an older schema, another script on the same key or a hand edit is treated as no
// record at all (a first visit) and overwritten.
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const dateOrNull = (v) => v == null || (typeof v === 'string' && ISO.test(v));
const valid = (r) => !!r && typeof r === 'object' && r.v === 1 && Array.isArray(r.read) && r.read.every((id) => typeof id === 'string') && dateOrNull(r.since) && dateOrNull(r.seen);
const loaded = store.load();
const saved = valid(loaded) ? loaded : null;
const firstVisit = !saved;
const data = { v: 1, since: saved?.since ?? null, seen: saved?.seen ?? null, read: saved ? [...saved.read] : [] };

const entries = [...list.querySelectorAll('[data-entry]')].map((li) => ({
  li,
  id: li.dataset.id,
  date: li.querySelector('time').dateTime,
  flag: li.querySelector('[data-flag]'),
  more: li.querySelector('[data-more]'),
  unread: false,
  readBy: null,
}));
const newest = entries.map((e) => e.date).sort().at(-1);
const minusDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) - n * 864e5).toISOString().slice(0, 10);
if (!data.since) data.since = minusDays(newest, FRESH_DAYS);
const read = new Set(data.read);
const prevSeen = data.seen;
for (const e of entries) e.unread = e.date >= data.since && !read.has(e.id);
// Arrivals: entries dated after the newest one this visitor saw last time. A first visit has no last time.
const arrivals = firstVisit || !prevSeen ? [] : entries.filter((e) => e.unread && e.date > prevSeen);
data.seen = newest;
reflectStorage();
store.save(data);

const state = { initialUnread: 0, announced: 0, armed: false, dwellReads: 0, earlyScrolls: 0, inset: 0, discarded: loaded !== null && !saved, arrivals: arrivals.map((e) => e.id) };

function paint(e, leaving = false) {
  e.li.classList.toggle('is-unread', e.unread);
  if (e.unread) { e.flag.hidden = false; e.flag.classList.remove('is-gone'); return; }
  if (!leaving || motionTier() === 'static') { e.flag.hidden = true; return; }
  // The mark fades, then leaves the accessibility tree with the element.
  e.flag.classList.add('is-gone');
  setTimeout(() => { if (!e.unread) e.flag.hidden = true; }, FADE_MS);
}
const unreadCount = () => entries.filter((e) => e.unread).length;
function count() {
  const n = unreadCount();
  navCount.hidden = n === 0;
  navCount.textContent = `${n} new`;
  summary.textContent = n ? `${n} new of ${entries.length} entries, newest first` : `All ${entries.length} entries read`;
  markAll.setAttribute('aria-disabled', String(n === 0));
  return n;
}

// The status speaks for the visitor's own acts, each counted on its own. Reads from dwelling are inferred, not acts,
// so they stay silent: the heading loses its New and the menu link's name carries the new count.
function announce(how, n) {
  const left = unreadCount();
  const what = how === 'all' ? `All ${n} marked as read.` : 'Marked as read.';
  status.textContent = `${what} ${left ? `${left} new left.` : 'Nothing new left.'}`;
  state.announced++;
}

function markRead(some, how) {
  const fresh = some.filter((e) => e.unread);
  if (!fresh.length) return;
  for (const e of fresh) {
    e.unread = false;
    e.readBy = how;
    e.li.dataset.readBy = how;
    read.add(e.id);
    unwatch(e);
    paint(e, true);
  }
  data.read = [...read];
  store.save(data);
  count();
  if (how === 'dwell') state.dwellReads += fresh.length;
  else announce(how, fresh.length);
}

for (const e of entries) {
  paint(e);
  e.more.addEventListener('toggle', () => { if (e.more.open) markRead([e], 'open'); });
}
state.initialUnread = count();
arrivals.forEach((e, k) => { e.li.dataset.arrival = ''; e.li.style.setProperty('--k', String(k)); });
markAll.hidden = false;
markAll.addEventListener('click', () => { if (markAll.getAttribute('aria-disabled') !== 'true') markRead(entries, 'all'); });

// Dwell: an unread entry wholly visible below the sticky masthead for DWELL_MS is read, but only once the visitor has
// scrolled; what happens to be in view on load is not read for them.
const visible = new Set();
const timers = new Map();
function watch(e) {
  if (!state.armed || !e.unread || timers.has(e)) return;
  timers.set(e, setTimeout(() => { timers.delete(e); if (visible.has(e) && e.unread) markRead([e], 'dwell'); }, DWELL_MS));
}
function unwatch(e) { clearTimeout(timers.get(e)); timers.delete(e); }
const byLi = new Map(entries.map((e) => [e.li, e]));
// The masthead's height is measured, not assumed: a rotation, a resize or a wrapped nav changes it. Each change
// rebuilds the observer with the new top margin and moves --masthead-h, which scroll-padding-top uses for anchors.
let io = null;
function observe() {
  const h = Math.round(header.getBoundingClientRect().height);
  if (h === state.inset && io) return;
  state.inset = h;
  document.documentElement.style.setProperty('--masthead-h', `${h}px`);
  io?.disconnect();
  visible.clear();
  for (const e of [...timers.keys()]) unwatch(e);
  io = new IntersectionObserver((records) => {
    for (const r of records) {
      const e = byLi.get(r.target);
      if (r.isIntersecting && r.intersectionRatio >= 0.999) { visible.add(e); watch(e); } else { visible.delete(e); unwatch(e); }
    }
  }, { threshold: [0, 1], rootMargin: `-${h}px 0px 0px 0px` });
  entries.forEach((e) => io.observe(e.li));
}
observe();
new ResizeObserver(observe).observe(header);
const born = performance.now();
function arm() {
  if (state.armed) return;
  if (performance.now() - born < ARM_AFTER) { state.earlyScrolls++; return; }
  state.armed = true;
  removeEventListener('scroll', arm);
  visible.forEach(watch);
}
addEventListener('scroll', arm, { passive: true });

awards.addState(() => ({
  motion: motionTier(),
  storage: store.mode,
  firstVisit,
  discarded: state.discarded,
  unread: unreadCount(),
  initialUnread: state.initialUnread,
  unreadIds: entries.filter((e) => e.unread).map((e) => e.id),
  readBy: Object.fromEntries(entries.filter((e) => e.readBy).map((e) => [e.id, e.readBy])),
  arrivals: state.arrivals,
  armed: state.armed,
  dwellReads: state.dwellReads,
  earlyScrolls: state.earlyScrolls,
  announced: state.announced,
  inset: state.inset,
  since: data.since,
  seen: data.seen,
  order: entries.map((e) => e.id),
}));

// --- demo only: start. Publish the held entry and come back (a reload is a return visit), or forget everything. ---
// A return visit starts at the top, as arriving from elsewhere would, not at the restored position of the demo strip.
const demoSection = document.querySelector('[data-demo]');
const publishBtn = document.querySelector('[data-publish]');
const resetBtn = document.querySelector('[data-reset]');
function revisit() {
  history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  location.reload();
}
demoSection.hidden = false;
if (demo.published.includes(heldId) && store.mode === 'local') {
  publishBtn.setAttribute('aria-disabled', 'true');
  publishBtn.textContent = 'The next entry is published';
}
publishBtn.addEventListener('click', () => {
  if (publishBtn.getAttribute('aria-disabled') === 'true') return;
  try { localStorage.setItem(DEMO_KEY, JSON.stringify({ published: [...new Set([...demo.published, heldId])] })); } catch { return; }
  revisit();
});
resetBtn.addEventListener('click', () => {
  if (resetBtn.getAttribute('aria-disabled') === 'true') return;
  store.clear();
  try { localStorage.removeItem(DEMO_KEY); } catch { /* nothing to clear */ }
  revisit();
});
// --- demo only: end ---

awards.ready();
