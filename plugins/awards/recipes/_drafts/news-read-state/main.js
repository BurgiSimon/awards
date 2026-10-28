import { awards } from '../../_shared/awards-hook.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../../_shared/reduced-motion.js';

// A dated diary that remembers what this visitor has read. Read state lives in localStorage behind try/catch; when
// the browser refuses storage the page still counts, marks and announces, for as long as it stays open. Entries are
// read when opened (a native <details>, so they open without script too) or when one sits fully in view for 1.2 s
// after the visitor has scrolled. The count is text in the menu; a polite status speaks only when the visitor acts.

// Demo hook: ?storage=blocked makes localStorage throw on access, as a browser that blocks site data does.
if (new URLSearchParams(location.search).get('storage') === 'blocked') {
  try {
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Site storage is blocked.', 'SecurityError'); } });
  } catch { /* the property could not be replaced: the page simply keeps storage */ }
}

syncMotionTierAttribute();
let tier = motionTier();
onMotionTierChange((t) => { tier = t; });

const KEY = 'mlb-diary';
const FRESH_DAYS = 21;    // a first visit treats entries from the 21 days before the newest one as new
const DWELL_MS = 1200;    // fully in view this long, after a scroll, counts as read
const ARM_AFTER = 600;    // ms after boot before a scroll can arm the dwell (a restored scroll position cannot)

// Storage: probe once; every read and write is guarded, so a full or revoked store degrades to memory mid-visit too.
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
  load() { if (!ls) return null; try { return JSON.parse(ls.getItem(KEY) || 'null'); } catch { return null; } },
  save(d) { if (!ls) return false; try { ls.setItem(KEY, JSON.stringify(d)); return true; } catch { store.mode = 'memory'; return false; } },
  clear() { try { ls?.removeItem(KEY); } catch { /* nothing to clear */ } },
};

const list = document.querySelector('[data-diary]');
const held = document.querySelector('template[data-held]');
const heldId = held.content.querySelector('[data-entry]').dataset.id;
const navCount = document.querySelector('[data-count]');
const summary = document.querySelector('[data-summary]');
const markAll = document.querySelector('[data-mark-all]');
const status = document.querySelector('[data-status]');
const note = document.querySelector('[data-storage-note]');
const publishBtn = document.querySelector('[data-publish]');
const resetBtn = document.querySelector('[data-reset]');
const header = document.querySelector('[data-masthead]');

const saved = store.load();
const firstVisit = !saved;
const data = { v: 1, since: null, seen: null, read: [], published: [], ...(saved && typeof saved === 'object' ? saved : {}) };
if (data.published.includes(heldId)) list.prepend(held.content.firstElementChild.cloneNode(true));

const entries = [...list.querySelectorAll('[data-entry]')].map((li) => ({
  li,
  id: li.dataset.id,
  date: li.querySelector('time').dateTime,
  title: li.querySelector('.entry__title').firstChild.textContent.trim(),
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
store.save(data);

const state = { initialUnread: 0, announced: 0, armed: false, dwellReads: 0, arrivals: arrivals.map((e) => e.id) };

function paint(e, leaving = false) {
  e.li.classList.toggle('is-unread', e.unread);
  if (e.unread) { e.flag.hidden = false; e.flag.classList.remove('is-gone'); return; }
  if (!leaving || tier === 'static') { e.flag.hidden = true; return; }
  // The mark fades, then leaves the accessibility tree with the element.
  e.flag.classList.add('is-gone');
  setTimeout(() => { if (!e.unread) e.flag.hidden = true; }, 420);
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

// The status speaks only for the visitor's own acts; reads from scrolling are gathered for a moment and said once.
let say = { n: 0, how: null, t: 0 };
function announce(how, n) {
  say.n += n;
  say.how = how;
  clearTimeout(say.t);
  const speak = () => {
    const left = unreadCount();
    const rest = left ? `${left} new left.` : 'Nothing new left.';
    const what = say.how === 'all' ? `All ${say.n} marked as read.` : say.how === 'dwell' ? `${say.n} ${say.n === 1 ? 'entry' : 'entries'} marked as read as you scrolled.` : 'Marked as read.';
    status.textContent = `${what} ${rest}`;
    state.announced++;
    say = { n: 0, how: null, t: 0 };
  };
  if (how === 'dwell') say.t = setTimeout(speak, 600); else speak();
}

function markRead(list, how) {
  const fresh = list.filter((e) => e.unread);
  if (!fresh.length) return;
  for (const e of fresh) {
    e.unread = false;
    e.readBy = how;
    e.li.dataset.readBy = how;
    read.add(e.id);
    paint(e, true);
  }
  data.read = [...read];
  store.save(data);
  count();
  announce(how, fresh.length);
}

for (const e of entries) {
  paint(e);
  e.more.addEventListener('toggle', () => { if (e.more.open) markRead([e], 'open'); });
}
state.initialUnread = count();
arrivals.forEach((e, k) => { e.li.dataset.arrival = ''; e.li.style.setProperty('--k', String(k)); });

markAll.addEventListener('click', () => { if (markAll.getAttribute('aria-disabled') !== 'true') markRead(entries, 'all'); });

// Dwell: an unread entry wholly visible below the sticky header for DWELL_MS is read, but only once the visitor has
// scrolled; what happens to be in view on load is not read for them.
const visible = new Set();
const timers = new Map();
function watch(e) {
  if (!state.armed || !e.unread || timers.has(e)) return;
  timers.set(e, setTimeout(() => { timers.delete(e); if (visible.has(e)) { state.dwellReads++; markRead([e], 'dwell'); } }, DWELL_MS));
}
function unwatch(e) { clearTimeout(timers.get(e)); timers.delete(e); }
const byLi = new Map(entries.map((e) => [e.li, e]));
const io = new IntersectionObserver((records) => {
  for (const r of records) {
    const e = byLi.get(r.target);
    if (r.intersectionRatio >= 0.999) { visible.add(e); watch(e); } else { visible.delete(e); unwatch(e); }
  }
}, { threshold: [0, 1], rootMargin: `-${header.offsetHeight}px 0px 0px 0px` });
entries.forEach((e) => io.observe(e.li));
const born = performance.now();
function arm() {
  if (state.armed || performance.now() - born < ARM_AFTER) return;
  state.armed = true;
  removeEventListener('scroll', arm);
  visible.forEach(watch);
}
addEventListener('scroll', arm, { passive: true });

// Demo controls: publish the held entry and come back (a reload is a return visit), or forget everything.
if (store.mode === 'local') {
  note.textContent = 'This page keeps your read marks in this browser, on this device only.';
  if (data.published.includes(heldId)) {
    publishBtn.setAttribute('aria-disabled', 'true');
    publishBtn.textContent = 'The next entry is published';
  }
  publishBtn.addEventListener('click', () => {
    if (publishBtn.getAttribute('aria-disabled') === 'true') return;
    data.published = [...new Set([...data.published, heldId])];
    store.save(data);
    location.reload();
  });
  resetBtn.addEventListener('click', () => { store.clear(); location.reload(); });
} else {
  note.textContent = 'This browser is refusing site storage, so your read marks last only until you leave the page.';
  for (const b of [publishBtn, resetBtn]) {
    b.setAttribute('aria-disabled', 'true');
    b.setAttribute('aria-describedby', 'storage-note');
  }
  note.id = 'storage-note';
}

awards.addState(() => ({
  motion: tier,
  storage: store.mode,
  firstVisit,
  unread: unreadCount(),
  initialUnread: state.initialUnread,
  unreadIds: entries.filter((e) => e.unread).map((e) => e.id),
  readBy: Object.fromEntries(entries.filter((e) => e.readBy).map((e) => [e.id, e.readBy])),
  arrivals: state.arrivals,
  armed: state.armed,
  dwellReads: state.dwellReads,
  announced: state.announced,
  since: data.since,
  seen: data.seen,
  order: entries.map((e) => e.id),
}));
awards.ready();
