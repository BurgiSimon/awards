// The recipe explorer. The page (index.html, written by scripts/build-gallery.mjs) is a complete, linked catalogue
// without this script; this adds search, facets and two layouts over the same plates, a plate that turns live
// under a resting pointer, and a stage that runs one recipe beside its README and source, scrubbed from outside
// through the page's own window.__awards hook. A Drafts tab lists the proposals in _drafts/ (read from
// _drafts/drafts.json) and runs each in the same stage, with a form for the maintainer's decision.
import { esc, markdown, highlight, numbered, languageOf } from './text.js';

const root = document.documentElement;
const data = JSON.parse(document.getElementById('gallery-data').textContent);
// Every entry has a key that is also its folder under recipes/: the id for a recipe, _drafts/<id> for a draft.
for (const r of data.recipes) r.key = r.id;
const byId = new Map(data.recipes.map((r) => [r.key, r]));
const groupTitle = Object.fromEntries(data.groups.map((g) => [g.id, g.title]));
const sites = new Set(data.sites);
const repoFile = (p) => `${data.repo}/blob/main/plugins/awards/${p}`;
const plates = new Map([...document.querySelectorAll('.plate')].map((el) => [el.dataset.id, el]));
const order = [...plates.keys()];
const draftPlates = new Map();
let draftOrder = [];
const plateOf = (key) => plates.get(key) ?? draftPlates.get(key);
const sections = [...document.querySelectorAll('.group')];
const mosaic = document.querySelector('.mosaic');
const tiles = new Map([...document.querySelectorAll('.tile')].map((el) => [el.dataset.id, el]));
const results = document.getElementById('recipes');
const toolbar = document.getElementById('toolbar');
const search = document.getElementById('q');
const facetsEl = document.getElementById('facets');
const statusEl = toolbar.querySelector('[data-status]');
const emptyEl = results.querySelector('[data-empty]');

const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
const fineQuery = matchMedia('(hover: hover) and (pointer: fine)');
const motionOK = () => !reduceQuery.matches;
const FACETS = { group: 'Group', library: 'Library', input: 'Input', technique: 'Technique', webgl: 'WebGL', component: 'Component', concern: 'Concern' };
const facetOf = new Map(Object.entries(data.facets).flatMap(([f, tags]) => tags.map((t) => [t, f])));
const VIEWPORTS = { desktop: { w: 1440, h: 900 }, phone: { w: 390, h: 844 } };
const pct = (p) => `${Math.round(p * 100)} %`;
const frameSrc = (key) => plateOf(key)?.querySelector('.plate__frame img')?.currentSrc || plateOf(key)?.querySelector('.plate__frame img')?.src || '';
const baseTitle = document.title;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// A recipe signals readiness through __awards.ready; a page that never does is shown after a few seconds anyway.
const ready = (win, ms = 6000) => Promise.race([Promise.resolve(win?.__awards?.ready).catch(() => {}), wait(ms)]);

// ---------- state and URL ----------

const state = { q: '', tier: '', view: 'plates', tags: new Set(), groups: new Set(), tab: 'catalogue', status: '' };

// Returns the key of the entry the URL opens, if it is loaded yet (drafts arrive after boot).
function readURL() {
  const p = new URLSearchParams(location.search);
  state.q = p.get('q') ?? '';
  state.tier = ['P0', 'P1', 'P2'].includes(p.get('tier')) ? p.get('tier') : '';
  state.view = p.get('view') === 'index' ? 'index' : 'plates';
  state.tags = new Set((p.get('tags') ?? '').split(',').filter((t) => facetOf.has(t)));
  state.groups = new Set((p.get('groups') ?? '').split(',').filter((g) => groupTitle[g]));
  state.tab = p.get('tab') === 'drafts' || p.has('draft') ? 'drafts' : 'catalogue';
  state.status = p.get('status') ?? '';
  if (p.has('draft')) return byId.has(`_drafts/${p.get('draft')}`) ? `_drafts/${p.get('draft')}` : null;
  return byId.has(p.get('recipe')) ? p.get('recipe') : null;
}

function urlFor(key) {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.tags.size) p.set('tags', [...state.tags].join(','));
  if (state.groups.size) p.set('groups', [...state.groups].join(','));
  if (state.tier) p.set('tier', state.tier);
  if (state.view !== 'plates') p.set('view', state.view);
  if (state.tab === 'drafts') p.set('tab', 'drafts');
  if (state.tab === 'drafts' && state.status) p.set('status', state.status);
  const r = key && byId.get(key);
  if (r) p.set(r.draft ? 'draft' : 'recipe', r.id);
  const qs = p.toString().replace(/%2C/g, ',');
  return `${location.pathname}${qs ? `?${qs}` : ''}${key ? '' : location.hash}`;
}

let urlTimer;
const writeURL = () => {
  clearTimeout(urlTimer);
  urlTimer = setTimeout(() => history.replaceState(history.state, '', urlFor(detail.current?.key)), 150);
};

// ---------- filtering ----------

const haystack = new Map(data.recipes.map((r) => [r.id, [
  r.id, r.title, r.intent, r.summary, groupTitle[r.group], r.tier, r.isNew ? 'new' : '', ...r.tags, ...r.deps, ...r.seenIn, ...r.variants,
].join(' ').toLowerCase().replace(/`/g, '')]));

function matches(r, skip) {
  if (state.tier && r.tier !== state.tier) return false;
  if (state.q) for (const word of state.q.toLowerCase().split(/\s+/).filter(Boolean)) if (!haystack.get(r.id).includes(word)) return false;
  if (skip !== 'group' && state.groups.size && !state.groups.has(r.group)) return false;
  // Within a facet any chosen tag will do; across facets every facet must match.
  for (const [facet, tags] of Object.entries(data.facets)) {
    if (facet === skip) continue;
    const chosen = tags.filter((t) => state.tags.has(t));
    if (chosen.length && !chosen.some((t) => r.tags.includes(t))) return false;
  }
  return true;
}

const visibleIds = () => order.filter((id) => matches(byId.get(id)));
const filterCount = () => state.tags.size + state.groups.size;

// ---------- facets panel ----------

function buildFacets() {
  const html = Object.entries(FACETS).map(([facet, title]) => {
    const tags = facet === 'group' ? data.groups.map((g) => g.id) : data.facets[facet];
    const chips = tags.map((t) => `<button type="button" class="chip" data-facet="${facet}" data-tag="${t}" aria-pressed="false">${esc(facet === 'group' ? groupTitle[t] : t)} <span></span></button>`).join('');
    return `<fieldset><legend>${title}</legend><div class="facets__tags">${chips}</div></fieldset>`;
  }).join('');
  facetsEl.innerHTML = `${html}<div class="facets__foot"><button type="button" class="ghost" data-clear>Clear all</button><button type="button" class="ghost" data-facets-close>Done</button></div>`;
  const active = document.createElement('div');
  active.className = 'active';
  active.setAttribute('aria-label', 'Active filters');
  active.dataset.active = '';
  facetsEl.before(active);
}

function renderFacets() {
  const counts = {};
  for (const facet of Object.keys(FACETS)) {
    const pool = data.recipes.filter((r) => matches(r, facet));
    counts[facet] = new Map();
    for (const r of pool) for (const t of facet === 'group' ? [r.group] : r.tags) counts[facet].set(t, (counts[facet].get(t) ?? 0) + 1);
  }
  for (const chip of facetsEl.querySelectorAll('.chip')) {
    const { facet, tag } = chip.dataset;
    const on = facet === 'group' ? state.groups.has(tag) : state.tags.has(tag);
    const n = counts[facet === 'group' ? 'group' : facetOf.get(tag)].get(tag) ?? 0;
    chip.setAttribute('aria-pressed', String(on));
    chip.lastElementChild.textContent = n;
    chip.toggleAttribute('data-empty', !n && !on);
  }
  const badge = toolbar.querySelector('[data-filter-count]');
  badge.hidden = !filterCount();
  badge.textContent = filterCount();
  const active = toolbar.querySelector('[data-active]');
  const chips = [
    ...[...state.groups].map((g) => ({ facet: 'group', tag: g, label: groupTitle[g] })),
    ...[...state.tags].map((t) => ({ facet: facetOf.get(t), tag: t, label: t })),
  ];
  active.innerHTML = chips.map((c) => `<button type="button" class="chip" data-remove-facet="${c.facet}" data-tag="${c.tag}" aria-label="Remove filter ${esc(c.label)}">${esc(c.label)}</button>`).join('')
    + (chips.length > 1 ? '<button type="button" class="chip" data-clear aria-label="Clear all filters">Clear all</button>' : '');
  active.hidden = !chips.length;
}

// ---------- applying ----------

let vtGeneration = 0;
const vtOwner = new WeakMap();
const canTransition = () => Boolean(document.startViewTransition) && motionOK();
// Plates are named for a view transition only while one runs: a name left on would lift every plate above the
// dialog during the stage's own transition. The page itself cross-fades only when asked (the stage, the theme);
// a filter moves the plates and leaves the rest still.
function transition(update, names = [], { fade = false } = {}) {
  if (!canTransition()) return update();
  const gen = ++vtGeneration;
  for (const [el, name] of names) { el.style.viewTransitionName = name; vtOwner.set(el, gen); }
  if (fade) root.classList.add('vt-root');
  const vt = document.startViewTransition(update);
  // A newer transition may have skipped this one: clear only the names this one still owns.
  vt.finished.finally(() => {
    for (const [el] of names) if (vtOwner.get(el) === gen) el.style.viewTransitionName = '';
    if (gen === vtGeneration) root.classList.remove('vt-root');
  });
  return vt;
}

function inView(el) {
  const r = el.getBoundingClientRect();
  return r.bottom > -200 && r.top < innerHeight + 200;
}

function apply({ animate = false, scroll = true } = {}) {
  const ids = new Set(visibleIds());
  const update = () => {
    root.dataset.view = state.view;
    for (const [id, el] of plates) el.hidden = !ids.has(id);
    for (const [id, el] of tiles) el.classList.toggle('is-out', !ids.has(id));
    for (const sec of sections) {
      const own = [...sec.querySelectorAll('.plate')];
      const n = own.filter((el) => !el.hidden).length;
      const count = sec.querySelector('[data-group-count]');
      const total = Number(count.dataset.total);
      sec.hidden = !n;
      count.textContent = n === total ? `${total} recipe${total === 1 ? '' : 's'}` : `${n} of ${total}`;
    }
    emptyEl.hidden = ids.size > 0;
    statusEl.textContent = ids.size === data.count ? `${data.count} recipes` : `${ids.size} of ${data.count} recipes`;
    for (const seg of toolbar.querySelectorAll('[data-tier] > button')) seg.setAttribute('aria-pressed', String(seg.dataset.value === state.tier));
    for (const seg of toolbar.querySelectorAll('[data-view] > button')) seg.setAttribute('aria-pressed', String(seg.dataset.value === state.view));
    if (search.value !== state.q) search.value = state.q;
    renderFacets();
  };
  // Only what is on screen (or about to be) morphs; the rest simply moves with the page.
  const names = animate ? [...plates].filter(([id, el]) => (!el.hidden || ids.has(id)) && (el.hidden || inView(el))).slice(0, 60).map(([id, el]) => [el, `p-${id}`]) : [];
  if (animate) transition(update, names); else update();
  writeURL();
  if (scroll) {
    const top = results.getBoundingClientRect().top - toolbar.offsetHeight;
    if (top < 0) scrollTo({ top: scrollY + top, behavior: 'instant' });
  }
}

function setFilter(facet, tag, on) {
  const set = facet === 'group' ? state.groups : state.tags;
  if (on ?? !set.has(tag)) set.add(tag); else set.delete(tag);
  apply({ animate: true });
}

function clearAll() {
  state.q = '';
  state.tier = '';
  state.tags.clear();
  state.groups.clear();
  apply({ animate: true });
}

// ---------- toolbar wiring ----------

function wireToolbar() {
  search.addEventListener('input', () => { state.q = search.value.trim(); apply(); });
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && search.value) { e.preventDefault(); search.value = ''; state.q = ''; apply(); }
    if (e.key === 'Enter') { e.preventDefault(); results.querySelector('.plate:not([hidden]) a')?.focus(); }
  });
  const facetsToggle = toolbar.querySelector('[data-facets-toggle]');
  const showFacets = (open) => {
    facetsEl.hidden = !open;
    facetsToggle.setAttribute('aria-expanded', String(open));
  };
  facetsToggle.addEventListener('click', () => showFacets(facetsEl.hidden));
  toolbar.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.matches('[data-tier] > button')) { state.tier = t.dataset.value; apply({ animate: true }); }
    else if (t.matches('[data-view] > button')) { state.view = t.dataset.value; apply({ animate: true, scroll: false }); }
    else if (t.matches('.chip[data-facet]')) setFilter(t.dataset.facet, t.dataset.tag);
    else if (t.matches('[data-remove-facet]')) { setFilter(t.dataset.removeFacet, t.dataset.tag, false); search.focus({ preventScroll: true }); }
    else if (t.matches('[data-clear]')) clearAll();
    else if (t.matches('[data-facets-close]')) { showFacets(false); facetsToggle.focus(); }
    else if (t.matches('[data-random]')) {
      const pool = visibleIds();
      if (pool.length) detail.open(pool[Math.floor(Math.random() * pool.length)]);
    }
  });
  facetsEl.addEventListener('keydown', (e) => { if (e.key === 'Escape') { showFacets(false); facetsToggle.focus(); } });
  emptyEl.querySelector('[data-clear]').addEventListener('click', clearAll);

  // A table-of-contents jump to a group the filters hide clears them first.
  document.querySelector('.toc')?.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#group-"]');
    const sec = a && document.querySelector(a.getAttribute('href'));
    if (sec?.hidden) { clearAll(); requestAnimationFrame(() => sec.scrollIntoView()); e.preventDefault(); history.replaceState(history.state, '', urlFor() + a.getAttribute('href')); }
  });

  addEventListener('keydown', (e) => {
    if (detail.dialog.open || state.tab !== 'catalogue' || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key === '/') { e.preventDefault(); search.focus(); search.select(); }
  });

  // The toolbar draws its rule only once it is stuck.
  const sentinel = document.createElement('div');
  toolbar.before(sentinel);
  new IntersectionObserver(([en]) => toolbar.classList.toggle('is-stuck', !en.isIntersecting)).observe(sentinel);
}

// ---------- theme ----------

function wireTheme() {
  const btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return;
  const metas = [...document.querySelectorAll('meta[name="theme-color"]')];
  const original = metas.map((m) => [m.content, m.media]);
  const show = () => {
    const t = root.dataset.theme ?? 'system';
    btn.textContent = { system: 'System', light: 'Light', dark: 'Dark' }[t];
    btn.setAttribute('aria-label', `Colour theme: ${t}. Change`);
    metas.forEach((m, i) => {
      if (t === 'system') { m.content = original[i][0]; m.media = original[i][1]; }
      else { m.content = t === 'dark' ? '#141312' : '#f1eee7'; m.removeAttribute('media'); }
    });
  };
  btn.addEventListener('click', () => {
    const next = { system: 'light', light: 'dark', dark: 'system' }[root.dataset.theme ?? 'system'];
    const change = () => {
      if (next === 'system') delete root.dataset.theme; else root.dataset.theme = next;
      show();
    };
    transition(change, [], { fade: true });
    try { localStorage.setItem('awards-gallery-theme', next); } catch {}
  });
  show();
}

// ---------- plates: open on click, live under a resting pointer, a peek in the index layout ----------

function wirePlates() {
  results.addEventListener('click', (e) => {
    const a = e.target.closest('.plate__title a');
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    detail.open(a.closest('.plate').dataset.id);
  });

  let timer = 0;
  let live = null;
  const canLive = () => fineQuery.matches && motionOK() && !navigator.connection?.saveData && state.view === 'plates' && !detail.dialog.open;
  const stop = () => {
    clearTimeout(timer);
    if (!live) return;
    const { frame, iframe, flag } = live;
    live = null;
    iframe.classList.remove('is-on');
    flag.classList.remove('is-on');
    setTimeout(() => { iframe.remove(); flag.remove(); }, 450);
  };
  const start = (plate) => {
    const r = byId.get(plate.dataset.id);
    const frame = plate.querySelector('.plate__frame');
    if (!frame) return;
    const iframe = document.createElement('iframe');
    iframe.className = 'plate__live';
    iframe.title = '';
    iframe.tabIndex = -1;
    iframe.inert = true;
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.width = `${VIEWPORTS.desktop.w}px`;
    iframe.style.height = `${VIEWPORTS.desktop.h}px`;
    iframe.style.transform = `scale(${frame.clientWidth / VIEWPORTS.desktop.w})`;
    const flag = document.createElement('span');
    flag.className = 'plate__flag';
    flag.setAttribute('aria-hidden', 'true');
    flag.textContent = 'Live';
    live = { frame, iframe, flag, id: r.id };
    const mine = live;
    iframe.addEventListener('load', async () => {
      const win = iframe.contentWindow;
      await ready(win, 4000);
      if (live !== mine) return;
      if (typeof r.frame?.scroll === 'number' && r.frame.scroll > 0) await win.__awards?.scrollTo?.(r.frame.scroll)?.catch?.(() => {});
      await wait(120);
      if (live !== mine) return;
      iframe.classList.add('is-on');
      flag.classList.add('is-on');
    }, { once: true });
    iframe.src = `./${r.id}/index.html`;
    frame.append(iframe, flag);
  };
  results.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const plate = e.target.closest('.plate');
    if (!plate || plate.contains(e.relatedTarget) || !canLive()) return;
    stop();
    timer = setTimeout(() => start(plate), 650);
  });
  results.addEventListener('pointerout', (e) => {
    const plate = e.target.closest('.plate');
    if (plate && !plate.contains(e.relatedTarget)) stop();
  });
  addEventListener('scroll', () => { if (live && !inView(live.frame)) stop(); }, { passive: true });
  detail.onOpen = stop;

  // Index layout: the hovered row's frame follows the pointer.
  const peek = document.createElement('div');
  peek.className = 'peek';
  peek.setAttribute('aria-hidden', 'true');
  peek.innerHTML = '<img alt="" width="800" height="500">';
  document.body.append(peek);
  const img = peek.firstElementChild;
  let shown = null;
  let raf = 0;
  let x = 0;
  let y = 0;
  const place = () => {
    raf = 0;
    const w = peek.offsetWidth;
    const h = peek.offsetHeight;
    const left = x + 28 + w > innerWidth - 12 ? x - 28 - w : x + 28;
    const top = Math.min(innerHeight - h - 12, Math.max(12, y - h / 2));
    peek.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  };
  results.addEventListener('pointermove', (e) => {
    if (state.view !== 'index' || e.pointerType !== 'mouse') return;
    const plate = e.target.closest('.plate');
    const src = plate && frameSrc(plate.dataset.id);
    if (!src) { peek.classList.remove('is-on'); shown = null; return; }
    if (shown !== plate) { img.src = src; shown = plate; }
    x = e.clientX;
    y = e.clientY;
    peek.classList.add('is-on');
    if (!raf) raf = requestAnimationFrame(place);
  });
  results.addEventListener('pointerleave', () => { peek.classList.remove('is-on'); shown = null; });
}

// ---------- the overview mosaic: a title under the pointer, a click opens the stage ----------

function wireMosaic() {
  if (!mosaic) return;
  const tip = document.createElement('div');
  tip.className = 'tip';
  tip.setAttribute('aria-hidden', 'true');
  document.body.append(tip);
  let raf = 0;
  let x = 0;
  let y = 0;
  const place = () => {
    raf = 0;
    const w = tip.offsetWidth;
    const left = Math.min(innerWidth - w - 12, Math.max(12, x - w / 2));
    const top = y - tip.offsetHeight - 14 < 8 ? y + 22 : y - tip.offsetHeight - 14;
    tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  };
  mosaic.addEventListener('pointermove', (e) => {
    const t = e.target.closest('.tile');
    if (!t || e.pointerType !== 'mouse') { tip.classList.remove('is-on'); return; }
    if (tip.dataset.id !== t.dataset.id) {
      const r = byId.get(t.dataset.id);
      tip.dataset.id = r.id;
      tip.innerHTML = `${esc(r.title)}<small>${esc(groupTitle[r.group])} · ${r.tier}</small>`;
    }
    x = e.clientX;
    y = e.clientY;
    tip.classList.add('is-on');
    if (!raf) raf = requestAnimationFrame(place);
  });
  mosaic.addEventListener('pointerleave', () => tip.classList.remove('is-on'));
  mosaic.addEventListener('click', (e) => {
    const t = e.target.closest('.tile');
    if (!t) return;
    tip.classList.remove('is-on');
    detail.open(t.dataset.id);
  });
  // Pointing at a group in the contents picks its tiles out of the sheet.
  const toc = document.querySelector('.toc');
  const focus = (g) => {
    if (g) mosaic.dataset.focus = g; else delete mosaic.dataset.focus;
    for (const t of tiles.values()) t.classList.toggle('is-focus', t.dataset.group === g);
  };
  toc?.addEventListener('pointerover', (e) => focus(e.target.closest('a')?.getAttribute('href')?.replace('#group-', '') ?? null));
  toc?.addEventListener('pointerleave', () => focus(null));
  toc?.addEventListener('focusin', (e) => focus(e.target.getAttribute('href')?.replace('#group-', '') ?? null));
  toc?.addEventListener('focusout', () => focus(null));
}

// ---------- the stage ----------

const detail = {
  dialog: null,
  current: null,
  pushed: false,
  onOpen: null,
  mode: innerWidth < 720 ? 'fit' : 'desktop',
  iframe: null,
  playing: 0,
  sources: new Map(),

  build() {
    const d = document.createElement('dialog');
    d.className = 'detail';
    d.setAttribute('aria-labelledby', 'detail-title');
    const arrow = (dir) => `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${dir === 'l' ? 'M10 3 5 8l5 5' : 'm6 3 5 5-5 5'}"/></svg>`;
    d.innerHTML = `
      <div class="detail__bar">
        <button type="button" class="ghost" data-close><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 3.5 9 9m0-9-9 9"/></svg><span>Index</span></button>
        <nav class="detail__nav" aria-label="Neighbouring recipes">
          <button type="button" class="ghost" data-step="-1">${arrow('l')}<span data-prev-title></span></button>
          <span class="detail__pos" data-pos></span>
          <button type="button" class="ghost" data-step="1"><span data-next-title></span>${arrow('r')}</button>
        </nav>
        <a class="ghost detail__open" data-open-page target="_blank" rel="noopener"><span>Open the page</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3h7v7M13 3 4 12"/></svg></a>
      </div>
      <div class="detail__body">
        <div class="stage-col">
          <div class="stage" data-stage><div class="device" data-device><img class="device__poster" alt="" data-poster><span class="device__load" aria-hidden="true"></span></div></div>
          <div class="controls">
            <div class="segmented" role="group" aria-label="Viewport" data-modes></div>
            <div class="scrub">
              <label for="scrub">Scroll</label>
              <div class="scrub__track"><div class="scrub__marks" data-marks></div><input id="scrub" type="range" min="0" max="1000" step="1" value="0" data-scrub></div>
              <output for="scrub" data-scrub-out>0 %</output>
            </div>
            <button type="button" class="ghost" data-play aria-pressed="false">Play through</button>
            <button type="button" class="ghost" data-reload>Reload</button>
            <div class="positions" data-positions></div>
          </div>
        </div>
        <section class="info" data-info></section>
      </div>`;
    document.body.append(d);
    this.dialog = d;
    this.q = (s) => d.querySelector(s);
    this.device = this.q('[data-device]');
    this.poster = this.q('[data-poster]');
    this.stage = this.q('[data-stage]');
    this.scrub = this.q('[data-scrub]');
    this.scrubOut = this.q('[data-scrub-out]');
    this.info = this.q('[data-info]');

    d.addEventListener('cancel', (e) => { e.preventDefault(); this.close(); });
    d.addEventListener('click', (e) => {
      const t = e.target.closest('button, a');
      if (!t) return;
      if (t.matches('[data-close]')) this.close();
      else if (t.matches('[data-step]')) this.step(Number(t.dataset.step));
      else if (t.matches('[data-mode]')) { this.mode = t.dataset.mode; this.layoutModes(); this.load(); }
      else if (t.matches('[data-play]')) this.togglePlay();
      else if (t.matches('[data-reload]')) this.load();
      else if (t.matches('[data-goto]')) { this.stopPlay(); this.scrollTo(Number(t.dataset.goto)); }
      else if (t.matches('[data-tab]')) this.showFile(t.dataset.tab);
      else if (t.matches('[data-copy]')) this.copy(t);
      else if (t.matches('[data-recipe]')) this.open(t.dataset.recipe, { push: false });
      else if (t.matches('[data-filter-group], [data-filter-tag]')) {
        const facet = t.dataset.filterGroup ? 'group' : facetOf.get(t.dataset.filterTag);
        const tag = t.dataset.filterGroup ?? t.dataset.filterTag;
        this.close({ then: () => {
          state.q = '';
          state.tags.clear();
          state.groups.clear();
          state.tier = '';
          setFilter(facet, tag, true);
        } });
      }
    });
    d.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea, [role="tab"], iframe') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); this.step(e.key === 'ArrowLeft' ? -1 : 1); }
    });
    this.scrub.addEventListener('input', () => { this.stopPlay(); this.scrollTo(this.scrub.value / 1000, { fromInput: true }); });
    new ResizeObserver(() => this.layout()).observe(this.stage);
    addEventListener('popstate', () => {
      const id = readURL();
      apply({ scroll: false });
      draftsView.show(state.tab, { write: false });
      if (id && id !== this.current?.key) this.open(id, { push: false, fromHistory: true });
      else if (!id && this.dialog.open && !this.closing) this.close({ fromHistory: true });
    });
  },

  // Desktop and phone on a wide screen; on a narrow one the page simply fills the stage, or shows its desktop layout scaled.
  modes() { return innerWidth < 720 ? [['fit', 'Fit'], ['desktop', 'Desktop']] : [['desktop', 'Desktop'], ['phone', 'Phone']]; },
  layoutModes() {
    const modes = this.modes();
    if (!modes.some(([m]) => m === this.mode)) this.mode = modes[0][0];
    const host = this.q('[data-modes]');
    const key = modes.map(([m]) => m).join();
    if (host.dataset.key !== key) {
      host.dataset.key = key;
      host.innerHTML = modes.map(([m, label]) => `<button type="button" data-mode="${m}">${label}</button>`).join('');
    }
    for (const b of host.children) b.setAttribute('aria-pressed', String(b.dataset.mode === this.mode));
  },

  layout() {
    if (!this.dialog?.open) return;
    const cs = getComputedStyle(this.stage);
    const w = this.stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const h = this.stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const pad = this.mode === 'phone' ? 20 : 0;
    let vw, vh, s;
    if (this.mode === 'fit') { vw = Math.max(320, w); vh = h; s = w / vw; }
    else {
      ({ w: vw, h: vh } = VIEWPORTS[this.mode]);
      s = Math.min((w - pad) / vw, (h - pad) / vh);
    }
    this.device.dataset.mode = this.mode;
    this.device.style.width = `${Math.round(vw * s)}px`;
    this.device.style.height = `${Math.round(vh * s)}px`;
    for (const el of [this.iframe, this.poster]) {
      if (!el) continue;
      el.style.width = `${vw}px`;
      el.style.height = `${vh}px`;
      el.style.transform = `scale(${s})`;
    }
  },

  open(id, { push = true, fromHistory = false } = {}) {
    const r = byId.get(id);
    if (!r) return;
    this.onOpen?.();
    const first = !this.dialog.open;
    const plate = plateOf(id);
    const frame = plate?.querySelector('.plate__frame');
    const show = () => {
      if (first) {
        this.layoutModes();
        this.dialog.showModal();
        root.classList.add('has-detail');
      }
      this.render(r);
    };
    if (first && canTransition() && frame && !plate.hidden && inView(frame) && this.mode === 'desktop') {
      transition(() => { frame.style.viewTransitionName = ''; show(); this.device.style.viewTransitionName = 'stage'; }, [[frame, 'stage']], { fade: true })
        .finished.finally(() => { this.device.style.viewTransitionName = ''; });
    } else if (first) transition(show, [], { fade: true });
    else show();
    if (!fromHistory) {
      if (first && push) { history.pushState({ recipe: id }, '', urlFor(id)); this.pushed = true; }
      else history.replaceState(history.state, '', urlFor(id));
    }
    if (first) this.q('[data-close]').focus();
  },

  close({ fromHistory = false, then } = {}) {
    if (!this.dialog.open || this.closing) return;
    this.closing = true;
    const id = this.current?.key;
    const wasDraft = this.current?.draft;
    this.stopPlay();
    const finish = () => {
      this.dialog.close();
      this.closing = false;
      document.title = baseTitle;
      root.classList.remove('has-detail');
      this.unload();
      this.current = null;
      // A draft opened from a link inside a recipe's README may not be in the tab that is showing.
      if (wasDraft && state.tab !== 'drafts') draftsView.show('drafts');
      const plate = plateOf(id);
      const link = plate && !plate.hidden ? plate.querySelector('.plate__title a') : null;
      if (link) {
        const r = plate.getBoundingClientRect();
        if (r.top < (wasDraft ? 0 : toolbar.offsetHeight) || r.bottom > innerHeight) plate.scrollIntoView({ block: 'center' });
        link.focus({ preventScroll: true });
      } else if (state.tab === 'catalogue') search.focus({ preventScroll: true });
      else draftsView.heading()?.focus({ preventScroll: true });
      if (then) setTimeout(then, 0);
    };
    const frame = plateOf(id)?.querySelector('.plate__frame');
    if (!then && canTransition() && frame && this.device.dataset.mode === 'desktop' && !plateOf(id).hidden && inView(frame)) {
      transition(() => { this.device.style.viewTransitionName = ''; finish(); frame.style.viewTransitionName = 'stage'; }, [[this.device, 'stage']], { fade: true })
        .finished.finally(() => { frame.style.viewTransitionName = ''; });
    } else if (!then) transition(finish, [], { fade: true });
    else finish();
    // Closing steps back over the entry opening pushed; a close that refilters the index replaces it instead.
    if (!fromHistory) {
      if (this.pushed && !then) history.back();
      else history.replaceState(history.state, '', urlFor());
    }
    this.pushed = false;
  },

  // The neighbours of an entry: the filtered list it belongs to (recipes or drafts), or the whole of it.
  neighbours(key) {
    const draft = byId.get(key)?.draft;
    const pool = draft ? draftsView.visible() : visibleIds();
    return pool.includes(key) ? pool : draft ? draftOrder : order;
  },

  step(dir) {
    const list = this.neighbours(this.current?.key);
    const i = list.indexOf(this.current?.key);
    const next = list[(i + dir + list.length) % list.length];
    if (next) this.open(next, { push: false });
  },

  render(r) {
    this.current = r;
    const list = this.neighbours(r.key);
    const i = list.indexOf(r.key);
    const prev = byId.get(list[(i - 1 + list.length) % list.length]);
    const next = byId.get(list[(i + 1) % list.length]);
    this.q('[data-prev-title]').textContent = prev.title;
    this.q('[data-next-title]').textContent = next.title;
    this.q('[data-step="-1"]').setAttribute('aria-label', `Previous: ${prev.title}`);
    this.q('[data-step="1"]').setAttribute('aria-label', `Next: ${next.title}`);
    this.q('[data-pos]').textContent = `${i + 1} / ${list.length}`;
    this.q('[data-open-page]').href = `./${r.key}/index.html`;
    document.title = `${r.title} · ${r.draft ? 'Drafts' : 'Recipes'} · awards`;

    // Scrub marks and jump buttons for the positions the verifier checks.
    this.q('[data-marks]').innerHTML = r.states.map((s) => `<i style="left:${s.scroll * 100}%"></i>`).join('');
    this.q('[data-positions]').innerHTML = r.states.length > 1
      ? r.states.map((s) => `<button type="button" class="chip" data-goto="${s.scroll}" aria-label="Scroll to the verifier's “${esc(s.name)}” position, ${pct(s.scroll)}">${esc(s.name)}</button>`).join('')
      : '';

    const libs = r.deps.length ? r.deps.map((d) => `<code>${esc(d)}</code>`).join(' ') : 'None: the platform alone';
    const seen = r.seenIn.length
      ? r.seenIn.map((s) => (sites.has(s) ? `<a href="${repoFile(`references/sites/${s}.md`)}" target="_blank" rel="noopener">${esc(s)}</a>` : esc(s))).join(', ')
      : '—';
    const verified = r.verified ? `${esc(r.verified.date)}${r.verified.chromium ? ` · Chromium ${esc(r.verified.chromium.split('.')[0])}` : ''}` : 'No recorded pass yet';
    // A draft is not in the catalogue yet: its group and tags are plain text, and its checks stand where a recipe's
    // verification does.
    const group = groupTitle[r.group] ?? r.group;
    const kicker = r.draft
      ? `<span>${esc(group)}</span><span class="tier" title="Tier ${r.tier}">${r.tier}</span><span data-kicker-status>${draftsView.chip(r)}</span>`
      : `<button type="button" data-filter-group="${r.group}" aria-label="Show every recipe in ${esc(group)}">${esc(group)}</button><span class="tier" title="Tier ${r.tier}">${r.tier}</span>${r.isNew ? `<span class="new" title="Added ${esc(r.added)}">New</span>` : ''}`;
    const checks = r.draft
      ? (r.problems.length ? `<ul class="checks">${r.problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : 'Nothing missing: ready to promote')
      : '';
    this.info.innerHTML = `
      <p class="info__kicker">${kicker}</p>
      <h2 id="detail-title">${esc(r.title)}</h2>
      <p class="info__intent">${esc(r.intent)}</p>
      <p class="info__summary">${esc(r.summary).replace(/`([^`]+)`/g, '<code>$1</code>')}</p>
      ${r.draft ? draftsView.reviewForm(r) : ''}
      <dl class="facts">
        <dt>Libraries</dt><dd>${libs}</dd>
        <dt>Seen in</dt><dd>${seen}</dd>
        ${r.added ? `<dt>Added</dt><dd>${esc(r.added)}</dd>` : ''}
        ${r.draft && r.drafted ? `<dt>Drafted</dt><dd>${esc(draftsView.day(r.drafted))}</dd>` : ''}
        ${r.draft ? `<dt>Checks</dt><dd>${checks}</dd>` : `<dt>Verified</dt><dd>${verified}</dd>`}
        <dt>Folder</dt><dd><a class="mono" href="${data.repo}/tree/main/plugins/awards/recipes/${r.key}" target="_blank" rel="noopener">recipes/${r.key}</a></dd>
      </dl>
      <h3>Tags</h3>
      <div class="tags">${r.tags.map((t) => (r.draft ? `<span class="chip chip--plain">${esc(t)}</span>` : `<button type="button" class="chip" data-filter-tag="${t}" aria-label="Show every recipe tagged ${esc(t)}">${esc(t)}</button>`)).join('')}</div>
      ${r.variants.length ? `<h3>Variants</h3><ul class="variants">${r.variants.map((v) => `<li>${esc(v).replace(/`([^`]+)`/g, '<code>$1</code>')}</li>`).join('')}</ul>` : ''}
      <div class="files">
        <div class="tabs" role="tablist" aria-label="Files">${r.files.map((f, k) => `<button type="button" role="tab" id="tab-${k}" data-tab="${esc(f)}" aria-selected="false" aria-controls="file-panel" tabindex="-1">${esc(f)}</button>`).join('')}</div>
        <div class="file__bar"><button type="button" class="ghost" data-copy hidden>Copy</button><a class="ghost" data-file-link target="_blank" rel="noopener">GitHub</a></div>
        <div class="file__panel" id="file-panel" role="tabpanel" tabindex="0"></div>
      </div>`;
    this.info.scrollTop = 0;
    this.q('.detail__body').scrollTop = 0;
    const tabs = this.info.querySelector('.tabs');
    tabs.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const all = [...tabs.children];
      const k = all.indexOf(document.activeElement);
      const to = e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1 : (k + (e.key === 'ArrowLeft' ? -1 : 1) + all.length) % all.length;
      all[to].focus();
      this.showFile(all[to].dataset.tab);
    });
    if (r.files.length) this.showFile(r.files[0]);
    if (r.draft) draftsView.wireForm(r, this.info.querySelector('[data-review]'));
    this.load();
  },

  // A fresh iframe per load: changing an iframe's src would add entries to the page's own history.
  load() {
    const r = this.current;
    this.unload();
    this.layoutModes();
    this.device.classList.remove('is-live');
    const desktop = this.mode === 'desktop';
    this.poster.hidden = !(desktop && r.frame);
    if (desktop && r.frame) this.poster.src = frameSrc(r.key);
    const iframe = document.createElement('iframe');
    iframe.title = `${r.title}, running live`;
    iframe.setAttribute('allow', 'autoplay; fullscreen');
    this.iframe = iframe;
    this.layout();
    const start = desktop && typeof r.frame?.scroll === 'number' ? r.frame.scroll : 0;
    this.setScrub(start);
    iframe.addEventListener('load', async () => {
      const win = iframe.contentWindow;
      // The recipe's own "back to recipes" link leads here: take it as closing the stage.
      try {
        const at = new URL(win.location.href);
        const home = new URL('./', location.href);
        if (at.pathname === home.pathname || at.pathname === `${home.pathname}index.html`) { this.close(); return; }
      } catch {}
      await ready(win);
      if (this.iframe !== iframe) return;
      if (start > 0) await Promise.resolve(win.__awards?.scrollTo?.(start)).catch(() => {});
      if (this.iframe !== iframe) return;
      this.device.classList.add('is-live');
      win.addEventListener('scroll', () => this.syncScrub(), { passive: true });
      this.syncScrub();
    });
    iframe.src = `./${r.key}/index.html`;
    this.device.append(iframe);
  },

  unload() {
    this.stopPlay();
    if (this.iframe) { this.iframe.src = 'about:blank'; this.iframe.remove(); this.iframe = null; }
  },

  setScrub(p) {
    this.scrub.value = String(Math.round(p * 1000));
    this.scrubOut.textContent = pct(p);
  },
  syncScrub() {
    if (this.playing || this.dragging) return;
    const s = this.iframe?.contentWindow?.__awards?.state?.();
    if (typeof s?.scroll === 'number') this.setScrub(s.scroll);
  },
  scrollTo(p, { fromInput = false } = {}) {
    if (!fromInput) this.setScrub(p);
    else this.scrubOut.textContent = pct(p);
    this.dragging = fromInput;
    clearTimeout(this.dragTimer);
    this.dragTimer = setTimeout(() => { this.dragging = false; }, 200);
    Promise.resolve(this.iframe?.contentWindow?.__awards?.scrollTo?.(p)).catch(() => {});
  },

  // Play through: the scroll driven from here, about ten seconds for the whole page.
  togglePlay() { if (this.playing) this.stopPlay(); else this.play(); },
  play() {
    const btn = this.q('[data-play]');
    let p = Number(this.scrub.value) / 1000;
    if (p >= 0.999) p = 0;
    let last = performance.now();
    btn.setAttribute('aria-pressed', 'true');
    btn.textContent = 'Stop';
    const tick = (now) => {
      p = Math.min(1, p + (now - last) / 10000);
      last = now;
      this.setScrub(p);
      Promise.resolve(this.iframe?.contentWindow?.__awards?.scrollTo?.(p)).catch(() => {});
      this.playing = p < 1 ? requestAnimationFrame(tick) : 0;
      if (!this.playing) this.stopPlay();
    };
    this.playing = requestAnimationFrame(tick);
  },
  stopPlay() {
    if (this.playing) cancelAnimationFrame(this.playing);
    this.playing = 0;
    const btn = this.q?.('[data-play]');
    if (btn) { btn.setAttribute('aria-pressed', 'false'); btn.textContent = 'Play through'; }
  },

  // Drafts change while they are reviewed, so their files are fetched fresh rather than kept for the session.
  async source(entry, file) {
    const key = `${entry.key}/${file}`;
    if (entry.draft || !this.sources.has(key)) {
      this.sources.set(key, fetch(`./_gallery/src/${entry.key}/${file}.txt`, { cache: entry.draft ? 'no-store' : 'default' }).then((res) => {
        if (!res.ok || !(res.headers.get('content-type') ?? 'text/plain').startsWith('text/plain')) throw new Error(res.status);
        return res.text();
      }));
    }
    return this.sources.get(key);
  },

  async showFile(file) {
    const r = this.current;
    const panel = this.info.querySelector('.file__panel');
    for (const t of this.info.querySelectorAll('[data-tab]')) {
      const on = t.dataset.tab === file;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) panel.setAttribute('aria-labelledby', t.id);
    }
    const link = this.info.querySelector('[data-file-link]');
    link.href = repoFile(`recipes/${r.key}/${file}`);
    link.setAttribute('aria-label', `${file} on GitHub`);
    const copy = this.info.querySelector('[data-copy]');
    copy.hidden = true;
    panel.innerHTML = '<p class="file__msg">Loading…</p>';
    let text;
    try { text = await this.source(r, file); }
    catch {
      if (this.current === r) panel.innerHTML = `<p class="file__msg">This file could not be loaded here. <a href="${esc(link.href)}" target="_blank" rel="noopener">Read it on GitHub</a>.</p>`;
      return;
    }
    if (this.current !== r || this.info.querySelector('[aria-selected="true"]')?.dataset.tab !== file) return;
    this.raw = text;
    copy.hidden = !navigator.clipboard;
    copy.textContent = 'Copy';
    if (file.endsWith('.md')) {
      const base = `${data.repo}/blob/main/plugins/awards/recipes/${r.key}/`;
      // The README's own title repeats the dialog's heading.
      panel.innerHTML = `<div class="md">${markdown(text.replace(/^#\s.*\n+/, ''), {
        ref: (kind, target) => {
          if (kind === 'recipe') return byId.has(target) ? `<button type="button" class="ref" data-recipe="${esc(target)}">${esc(target)}</button>` : `<code>${esc(target)}</code>`;
          if (kind === 'pattern') {
            const [f, anchor] = target.split('#');
            return `<a href="${repoFile(`references/patterns/${esc(f)}.md`)}${anchor ? `#${esc(anchor)}` : ''}" target="_blank" rel="noopener">${esc(target)}</a>`;
          }
          return sites.has(target) || kind === 'clone' ? `<a href="${repoFile(`references/sites/${esc(target)}.md`)}" target="_blank" rel="noopener">${esc(target)}</a>` : esc(target);
        },
        href: (url) => { try { return new URL(url, base).href; } catch { return url; } },
      })}</div>`;
      for (const a of panel.querySelectorAll('a[href^="http"]')) { a.target = '_blank'; a.rel = 'noopener'; }
    } else {
      panel.innerHTML = `<pre class="code" tabindex="0" aria-label="${esc(file)}"><code>${numbered(highlight(text, languageOf(file)))}</code></pre>`;
    }
  },

  async copy(btn) {
    try {
      await navigator.clipboard.writeText(this.raw ?? '');
      btn.textContent = 'Copied';
    } catch {
      btn.textContent = 'Copy failed';
    }
    setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
  },
};

// ---------- drafts: proposals waiting for the maintainer's decision ----------

const LIBS = { gsap: 'GSAP', lenis: 'Lenis', three: 'three.js', animejs: 'anime.js', '@unseenco/taxi': 'Taxi', 'matter-js': 'matter.js', ogl: 'OGL', postprocessing: 'postprocessing' };
const libName = (dep) => LIBS[dep.replace(/@[^@]*$/, '')] ?? dep.replace(/@[^@]*$/, '');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Waiting on the maintainer first, then what waits on the builder, then the settled ones.
const STATUS_ORDER = ['new', 'revised', 'improve', 'accept', 'reject'];
const DECISIONS = { accept: 'Accept', improve: 'Improve', reject: 'Reject' };

const draftsView = {
  loaded: false,
  writable: false,
  statuses: {},
  unsaved: new Map(),
  tabs: document.querySelector('[data-views]'),
  catalogue: document.getElementById('catalogue'),
  panel: null,

  day(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
    return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : '';
  },
  chip(r) { return `<span class="status" data-status="${r.review.status}">${esc(this.statuses[r.review.status] ?? r.review.status)}</span>`; },
  heading() { return this.panel?.querySelector('#drafts-title'); },
  list() { return draftOrder.map((k) => byId.get(k)); },
  visible() { return draftOrder.filter((k) => !state.status || byId.get(k).review.status === state.status); },

  // Outside the dev server nothing can write review.json, so a decision is kept in this browser until it is copied.
  local(id) { try { return JSON.parse(localStorage.getItem(`awards-draft-review:${id}`) ?? 'null'); } catch { return null; } },
  keepLocal(id, review) { try { localStorage.setItem(`awards-draft-review:${id}`, JSON.stringify(review)); return true; } catch { return false; } },

  async load() {
    let json;
    try {
      const res = await fetch('./_drafts/drafts.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      json = await res.json();
    } catch { return; } // No drafts.json (an older build, a page opened from disk): the tab stays hidden.
    if (!this.tabs || !this.catalogue || !Array.isArray(json?.drafts)) return;
    this.loaded = true;
    this.writable = Boolean(json.writable);
    this.statuses = json.statuses ?? {};
    for (const d of json.drafts) {
      const r = { ...d, key: `_drafts/${d.id}`, draft: true };
      const local = this.writable ? null : this.local(d.id);
      if (local) r.review = { ...r.review, ...local, local: true };
      byId.set(r.key, r);
    }
    draftOrder = json.drafts.map((d) => `_drafts/${d.id}`)
      .sort((a, b) => STATUS_ORDER.indexOf(byId.get(a).review.status) - STATUS_ORDER.indexOf(byId.get(b).review.status) || a.localeCompare(b));
    this.build();
    this.tabs.hidden = false;
    this.catalogue.setAttribute('role', 'tabpanel');
    this.catalogue.setAttribute('aria-labelledby', 'tab-catalogue');
    this.wireTabs();
    const key = readURL();
    this.show(state.tab, { write: false });
    if (key?.startsWith('_drafts/') && !detail.dialog.open) detail.open(key, { push: false, fromHistory: true });
  },

  build() {
    const count = draftOrder.length;
    this.tabs.querySelector('[data-drafts-count]').textContent = count;
    const badge = document.createElement('span');
    badge.className = 'views__badge';
    badge.dataset.draftsWaiting = '';
    this.tabs.querySelector('#tab-drafts').append(badge);
    const panel = document.createElement('section');
    panel.className = 'drafts';
    panel.id = 'drafts';
    panel.hidden = true;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', 'tab-drafts');
    const saving = this.writable
      ? 'Your decision is saved to the draft’s <code>review.json</code>.'
      : 'This copy of the explorer cannot write files, so a decision stays in this browser: copy it as text, or run <code>npm run dev</code> in <code>plugins/awards/recipes</code> to save it to the draft.';
    panel.innerHTML = `
      <div class="drafts__head">
        <h2 class="drafts__title" id="drafts-title" tabindex="-1">Drafts <span class="intro__count">${count}</span></h2>
        <div class="drafts__text">
          <p class="lede">Proposed recipes waiting for your decision.</p>
          <p>Open one to run it beside its README and source, then accept it into the catalogue, ask for changes or reject it. ${saving}</p>
          <p>Then ask Claude to <em>work the draft reviews</em>. Accepted drafts are promoted, and drafts you marked Improve come back to you as Revised, with a note on what changed.</p>
        </div>
      </div>
      <div class="drafts__bar">
        <div class="segmented" role="group" aria-label="Status" data-status-filter></div>
        <p class="toolbar__status" role="status" data-drafts-status></p>
      </div>
      <ol class="plates drafts__plates" role="list">${this.list().map((r) => this.plate(r)).join('')}</ol>
      <p class="empty" data-drafts-empty hidden>${count ? 'No draft has this status. <button type="button" data-status-value="">Show all drafts</button>' : 'No drafts yet. Start one with <code>node scripts/drafts.mjs new &lt;id&gt;</code>, or ask Claude to draft a recipe.'}</p>`;
    this.catalogue.after(panel);
    this.panel = panel;
    for (const el of panel.querySelectorAll('.plate')) draftPlates.set(el.dataset.id, el);
    panel.addEventListener('click', (e) => {
      const a = e.target.closest('.plate__title a');
      if (a && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); detail.open(a.closest('.plate').dataset.id); return; }
      const f = e.target.closest('[data-status-value]');
      if (f) { state.status = f.dataset.statusValue; this.update(); writeURL(); }
    });
    this.update();
  },

  plate(r) {
    const libs = [...new Set(r.deps.map(libName))];
    const img = r.frame
      ? `<img src="./${r.key}/frame.webp" width="800" height="500" alt="" loading="lazy" decoding="async">`
      : `<span class="plate__blank" aria-hidden="true">${esc(r.intent)}</span>`;
    return `<li class="plate plate--draft" data-id="${r.key}">
          <div class="plate__frame">${img}</div>
          <h3 class="plate__title"><a href="./${r.key}/index.html">${esc(r.title)}</a></h3>
          <p class="plate__intent">${esc(r.intent)}</p>
          <p class="plate__meta"><span data-plate-status>${this.chip(r)}</span><span class="tier" title="Tier ${r.tier}">${r.tier}</span> <span class="plate__libs">${esc(libs.join(' · ') || 'no library')}</span></p>
          <p class="plate__notes" data-plate-notes>${this.excerpt(r)}</p>
          ${r.problems.length ? `<p class="plate__checks">${r.problems.length} check${r.problems.length === 1 ? '' : 's'} open</p>` : ''}
        </li>`;
  },
  excerpt(r) {
    const rv = r.review;
    if (rv.status === 'revised' && rv.reply) return `<span class="plate__who">Changed:</span> ${esc(rv.reply)}`;
    return rv.notes ? `<span class="plate__who">Your notes:</span> ${esc(rv.notes)}` : '';
  },

  // Counts per status, the filter's pressed state and which plates show.
  update() {
    const all = this.list();
    const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, all.filter((r) => r.review.status === s).length]));
    if (state.status && !counts[state.status]) state.status = '';
    const filter = this.panel.querySelector('[data-status-filter]');
    filter.innerHTML = [['', 'All', all.length], ...STATUS_ORDER.filter((s) => counts[s]).map((s) => [s, this.statuses[s] ?? s, counts[s]])]
      .map(([v, label, n]) => `<button type="button" data-status-value="${v}" aria-pressed="${state.status === v}">${esc(label)} <span>${n}</span></button>`).join('');
    filter.hidden = !all.length;
    const shown = new Set(this.visible());
    for (const [key, el] of draftPlates) {
      const r = byId.get(key);
      el.hidden = !shown.has(key);
      el.querySelector('[data-plate-status]').innerHTML = this.chip(r);
      const notes = el.querySelector('[data-plate-notes]');
      notes.innerHTML = this.excerpt(r);
      notes.hidden = !notes.innerHTML;
    }
    const waiting = counts.new + counts.revised;
    this.panel.querySelector('[data-drafts-status]').textContent = `${shown.size} of ${all.length} drafts · ${waiting} waiting for you`;
    this.panel.querySelector('[data-drafts-empty]').hidden = shown.size > 0;
    const badge = this.tabs.querySelector('[data-drafts-waiting]');
    badge.hidden = !waiting;
    badge.textContent = `${waiting} to review`;
  },

  wireTabs() {
    const tabs = [...this.tabs.querySelectorAll('[role="tab"]')];
    this.tabs.addEventListener('click', (e) => {
      const t = e.target.closest('[role="tab"]');
      if (t) this.show(t.id === 'tab-drafts' ? 'drafts' : 'catalogue');
    });
    this.tabs.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const k = tabs.indexOf(document.activeElement);
      const to = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (k + (e.key === 'ArrowLeft' ? -1 : 1) + tabs.length) % tabs.length;
      tabs[to].focus();
      this.show(tabs[to].id === 'tab-drafts' ? 'drafts' : 'catalogue');
    });
  },

  show(tab, { write = true } = {}) {
    if (!this.loaded) return;
    state.tab = tab === 'drafts' ? 'drafts' : 'catalogue';
    const drafts = state.tab === 'drafts';
    this.catalogue.hidden = drafts;
    this.panel.hidden = !drafts;
    for (const t of this.tabs.querySelectorAll('[role="tab"]')) {
      const on = (t.id === 'tab-drafts') === drafts;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    }
    if (drafts) this.update();
    // Written at once, not on the debounce: an entry opened right after the switch must find the tab in the URL.
    if (write) { clearTimeout(urlTimer); history.replaceState(history.state, '', urlFor(detail.current?.key)); }
  },

  // The decision form at the top of a draft's panel in the stage.
  reviewForm(r) {
    const rv = r.review;
    const kept = this.unsaved.get(r.id);
    const decided = DECISIONS[rv.status] ? rv.status : '';
    const choice = kept?.decision ?? decided;
    const notes = kept?.notes ?? (decided ? rv.notes : '');
    const when = rv.date ? `Reviewed ${this.day(rv.date)}${rv.local ? ' · kept in this browser only' : ''}` : 'Not reviewed yet';
    const earlier = rv.status === 'revised' && rv.notes
      ? `<div class="review__note"><p class="review__label">Your notes</p><p>${esc(rv.notes)}</p></div>` : '';
    const reply = rv.status === 'revised' && rv.reply
      ? `<div class="review__note review__note--reply"><p class="review__label">What changed</p><p>${esc(rv.reply)}</p></div>` : '';
    const history = rv.history?.length
      ? `<details class="review__history"><summary>Earlier rounds (${rv.history.length})</summary><ol>${rv.history.map((h) => `<li><p><strong>${esc(this.statuses[h.status] ?? h.status)}</strong>${h.date ? ` · ${esc(this.day(h.date))}` : ''}</p>${h.notes ? `<p>${esc(h.notes)}</p>` : ''}${h.reply ? `<p class="review__label">What changed</p><p>${esc(h.reply)}</p>` : ''}</li>`).join('')}</ol></details>` : '';
    return `
      <section class="review" aria-labelledby="review-title" data-review>
        <div class="review__head"><h3 id="review-title">Your decision</h3><span data-review-chip>${this.chip(r)}</span></div>
        <p class="review__when" data-review-when>${esc(when)}</p>
        ${earlier}${reply}
        <form class="review__form" novalidate>
          <fieldset class="review__choices">
            <legend class="sr-only">Decision</legend>
            ${Object.entries(DECISIONS).map(([v, label]) => `<label class="choice choice--${v}"><input type="radio" name="decision" value="${v}"${choice === v ? ' checked' : ''}><span>${label}</span></label>`).join('')}
          </fieldset>
          <label class="review__label" for="review-notes">Notes <span>what to change, or why</span></label>
          <textarea id="review-notes" name="notes" rows="5" spellcheck="true">${esc(notes)}</textarea>
          <div class="review__actions">
            <button type="submit" class="review__save">Save decision</button>
            <button type="button" class="ghost" data-copy-review>Copy as text</button>
          </div>
          <p class="review__msg" role="status" data-review-msg></p>
        </form>
        ${history}
      </section>`;
  },

  wireForm(r, section) {
    if (!section) return;
    const form = section.querySelector('form');
    const msg = section.querySelector('[data-review-msg]');
    const notes = form.elements.notes;
    const decision = () => form.querySelector('input[name="decision"]:checked')?.value ?? '';
    const keep = () => this.unsaved.set(r.id, { decision: decision(), notes: notes.value });
    form.addEventListener('input', keep);
    form.addEventListener('change', keep);
    const text = () => `Draft review: ${r.id} (recipes/_drafts/${r.id})\nDecision: ${DECISIONS[decision()] ?? 'none yet'}\n${notes.value.trim() ? `Notes: ${notes.value.trim()}\n` : ''}`;
    section.querySelector('[data-copy-review]').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      try { await navigator.clipboard.writeText(text()); btn.textContent = 'Copied'; }
      catch { btn.textContent = 'Copy failed'; }
      setTimeout(() => { btn.textContent = 'Copy as text'; }, 1600);
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = decision();
      if (!status) { msg.textContent = 'Choose Accept, Improve or Reject first.'; form.querySelector('input[name="decision"]').focus(); return; }
      if (status === 'improve' && !notes.value.trim()) { msg.textContent = 'Say what to change in the notes.'; notes.focus(); return; }
      const save = form.querySelector('.review__save');
      save.disabled = true;
      msg.textContent = 'Saving…';
      try {
        if (this.writable) {
          const res = await fetch(`./_drafts/${r.id}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, notes: notes.value }) });
          const body = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(body.error ?? `the server answered ${res.status}`);
          r.review = body.review;
          msg.innerHTML = `Saved to <code>recipes/_drafts/${esc(r.id)}/review.json</code>.`;
        } else {
          const review = { ...r.review, status, notes: notes.value, date: new Date().toISOString().slice(0, 10) };
          if (!this.keepLocal(r.id, { status, notes: notes.value, date: review.date })) throw new Error('this browser refused to store it; copy it as text instead');
          r.review = { ...review, local: true };
          msg.textContent = 'Kept in this browser. Copy it as text to hand it over.';
        }
        this.unsaved.delete(r.id);
        for (const el of detail.info.querySelectorAll('[data-review-chip], [data-kicker-status]')) el.innerHTML = this.chip(r);
        section.querySelector('[data-review-when]').textContent = `Reviewed ${this.day(r.review.date)}${r.review.local ? ' · kept in this browser only' : ''}`;
        this.update();
        if (draftOrder.length > 1) msg.insertAdjacentHTML('beforeend', ' <button type="button" class="review__next" data-step="1">Next draft</button>');
      } catch (err) {
        msg.textContent = `Not saved: ${err.message}.`;
      } finally {
        save.disabled = false;
      }
    });
  },
};

// ---------- boot ----------

detail.build();
buildFacets();
const initial = readURL();
wireToolbar();
wireTheme();
wirePlates();
wireMosaic();
apply({ scroll: false });
if (initial) detail.open(initial, { push: false, fromHistory: true });
draftsView.load();
addEventListener('resize', () => { if (detail.dialog.open) { const before = detail.mode; detail.layoutModes(); if (detail.mode !== before) detail.load(); } });
