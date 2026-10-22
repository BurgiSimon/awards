// What a not-found page owes, checked in the browser: the head says what it is (title, noindex), the way back is
// first and never waits for the moment, every link is root-absolute (the page is served at any depth), the scene
// is out of the accessibility tree, and the moment plays once per tier: the zero travels in full, fades in place
// under reduced motion, and is simply there in the static tier, including when the tier flips mid-moment.

const STATIC = { type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" };
const type = (text) => [...text].map((key) => ({ type: 'press', key }));

export const states = [
  { name: 'desktop', settle: 0 },
  { name: 'settled', settle: 2800 },
  { name: 'rm', reducedMotion: true, settle: 0 },
  { name: 'static', settle: 0, actions: [STATIC] },
  { name: 'mobile', viewport: 'mobile', settle: 2800 },
  { name: 'mobile-early', viewport: 'mobile', settle: 0 },
  { name: 'skip', settle: 2600, actions: [{ type: 'press', key: 'Tab' }] },
  { name: 'keyboard', settle: 2600, actions: [{ type: 'press', key: 'Tab' }, { type: 'press', key: 'Enter' }, { type: 'press', key: 'Tab' }] },
  { name: 'search', settle: 2600, actions: [{ type: 'click', selector: '#q' }, ...type('Mallaig'), { type: 'press', key: 'Enter' }] },
];

export async function probe() {
  const $ = (s) => document.querySelector(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const sun = $('[data-sun]'), glint = $('.scene__glint'), home = $('[data-home]');
  const matrix = (el) => { const t = getComputedStyle(el).transform; return new DOMMatrix(t === 'none' ? undefined : t); };
  const inView = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; };
  // The moment as it plays: the sun's top edge (viewBox units), its opacity, the first glint's scale, and the
  // home link, which must be readable from the first sample.
  const t0 = performance.now();
  const samples = [];
  for (let i = 0; i < 20; i++) {
    const s = window.__awards.state();
    samples.push({ t: Math.round(performance.now() - t0), sunTop: s.sunTop, sunOpacity: Number(getComputedStyle(sun).opacity), glint: Math.round(matrix(glint).a * 100) / 100, home: Number(getComputedStyle(home).opacity), homeInView: inView(home) });
    await sleep(70);
  }
  const keyframeProps = (el) => [...new Set(el.getAnimations().flatMap((a) => a.effect.getKeyframes().flatMap((k) => Object.keys(k).filter((p) => !['offset', 'computedOffset', 'easing', 'composite'].includes(p)))))];
  const scene = $('[data-scene]');
  const links = [...document.querySelectorAll('main a')];
  const box = (el) => { const r = el.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) }; };
  const a = document.activeElement, cs = a && getComputedStyle(a);
  return {
    samples,
    sunProps: keyframeProps(sun),
    glintProps: keyframeProps(glint),
    animations: sun.getAnimations().length,
    title: document.title,
    robots: $('meta[name="robots"]')?.getAttribute('content'),
    h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
    mains: document.querySelectorAll('main').length,
    sceneHidden: scene.getAttribute('aria-hidden'),
    sceneAfterLinks: links.every((l) => l.compareDocumentPosition(scene) & Node.DOCUMENT_POSITION_FOLLOWING),
    mainLinks: links.map((l) => ({ href: l.getAttribute('href'), text: l.textContent.replace(/\s+/g, ' ').trim() })),
    hrefs: [...document.querySelectorAll('a[href]')].map((l) => l.getAttribute('href')),
    formAction: $('[data-search]').getAttribute('action'),
    note: $('[data-search-note]').textContent,
    home: box(home), scene: box(scene), title1: box($('h1')), lead: box($('.lost__lead')), routes: box($('.routes')), find: box($('[data-search] .find__row')),
    homeInView: inView(home),
    active: a && { tag: a.tagName, href: a.getAttribute('href'), cls: a.className, inView: inView(a), outline: cs.outlineStyle, outlineWidth: parseFloat(cs.outlineWidth), focusVisible: a.matches(':focus-visible') },
    innerWidth, innerHeight,
    overflowX: document.documentElement.scrollWidth - innerWidth,
  };
}

// Node-side, on the same page: the accessibility tree as the browser exposes it.
export async function inspect(page, st) {
  if (st.name !== 'settled') return null;
  const count = (role, opts) => page.getByRole(role, { exact: true, ...opts }).count();
  return {
    h1: await count('heading', { level: 1, name: 'No such page on this chart.' }),
    home: await count('link', { name: 'Back to the front page' }),
    routes: await Promise.all(['Tide tables', 'Harbour notes', 'The sky this month'].map((name) => count('link', { name }))),
    nav: await count('navigation', { name: 'Or set a course for' }),
    search: await count('search', { name: 'Search the almanac' }),
    searchbox: await count('searchbox', { name: 'Search the almanac' }),
    snapshot: await page.locator('body').ariaSnapshot(),
  };
}

export function assert(r) {
  const out = [];
  const P = (k) => r[k]?.probe || {};
  const S = (k) => r[k]?.state || {};
  const range = (a) => (a.length ? `${Math.min(...a)}–${Math.max(...a)}` : 'none');

  // Head and landmarks.
  const d = P('settled');
  out.push({ ok: /not found/i.test(d.title) && /noindex/.test(d.robots || ''), message: `head: title "${d.title}", robots "${d.robots}"` });
  out.push({ ok: d.h1?.length === 1 && d.mains === 1, message: `one h1 ("${d.h1?.[0]}") and one main (${d.mains})` });
  out.push({ ok: d.mainLinks?.[0]?.href === '/' && /front page/.test(d.mainLinks[0].text) && d.mainLinks.length === 4, message: `the way back first in main: ${d.mainLinks?.map((l) => l.href).join(' ')}` });
  out.push({ ok: d.hrefs?.length > 0 && d.hrefs.every((h) => h.startsWith('/') || h.startsWith('#')) && d.formAction?.startsWith('/'), message: `every link and the search action are root-absolute (${d.hrefs?.join(', ')}; ${d.formAction})` });
  out.push({ ok: d.sceneHidden === 'true' && d.sceneAfterLinks === true, message: 'the scene is aria-hidden and follows every link in DOM order' });

  // Full tier: the zero sinks; the links are there from the first sample.
  const fs = P('desktop').samples || [];
  const tops = fs.map((s) => s.sunTop);
  out.push({ ok: S('desktop').motion === 'full' && P('desktop').sunProps?.join() === 'transform' && Math.max(...tops) - Math.min(...tops) >= 40 && tops.every((v, i) => i === 0 || v >= tops[i - 1]), message: `full: the sun travels down only (top ${range(tops)} of 120–260), keyframes ${P('desktop').sunProps}` });
  out.push({ ok: fs.length && fs.every((s) => s.home === 1 && s.homeInView), message: `full: the home link is opaque and on screen in every sample while the moment plays (${fs.length})` });
  const st = S('settled'), sp = P('settled').samples || [];
  out.push({ ok: st.momentRunning === 0 && st.sunTop === 260 && sp.every((s) => s.glint === 1 && s.sunOpacity === 1), message: `settled: played once and stopped (running ${st.momentRunning}), sun half set (top ${st.sunTop}), glints open` });

  // Reduced tier: nothing travels; the sun and glints fade in where they rest.
  const rs = P('rm').samples || [];
  out.push({ ok: S('rm').motion === 'reduced' && P('rm').sunProps?.join() === 'opacity' && P('rm').glintProps?.join() === 'opacity' && rs.every((s) => s.sunTop === 260 && s.glint === 1), message: `reduced: opacity-only keyframes (${P('rm').sunProps}), sun fixed at ${range(rs.map((s) => s.sunTop))}, glints at full width` });
  out.push({ ok: rs.length && rs.at(-1).sunOpacity === 1 && rs.every((s) => s.home === 1), message: `reduced: fades to ${rs.at(-1)?.sunOpacity}, home link opaque throughout` });

  // Static tier, set after load: the moment is cut to its last frame at once.
  const ss = P('static').samples || [];
  out.push({ ok: S('static').motion === 'static' && P('static').animations === 0 && ss.every((s) => s.sunTop === 260 && s.sunOpacity === 1 && s.glint === 1), message: `static: no animation (${P('static').animations}), final frame from the first sample (top ${range(ss.map((s) => s.sunTop))})` });

  // Phone: no overflow, the scene as a band above, the way back within the first viewport.
  for (const k of ['mobile', 'settled']) {
    const p = P(k);
    out.push({ ok: p.overflowX <= 0, message: `${k}: no horizontal overflow (${p.overflowX}px at ${p.innerWidth}px)` });
  }
  const m = P('mobile');
  out.push({ ok: m.scene?.bottom <= m.title1?.top && m.homeInView && m.home?.bottom <= m.innerHeight && m.scene?.bottom - m.scene?.top <= 320, message: `mobile: scene band (${m.scene?.top}–${m.scene?.bottom}) above the h1, home link in the first viewport (bottom ${m.home?.bottom} of ${m.innerHeight})` });
  out.push({ ok: (P('mobile-early').samples || []).every((s) => s.home === 1 && s.homeInView), message: 'mobile: the home link is readable while the moment plays' });
  const dk = P('settled');
  out.push({ ok: dk.scene?.left >= dk.lead?.right && dk.routes?.top >= dk.scene?.bottom && dk.homeInView && dk.routes?.bottom <= dk.innerHeight && dk.find?.bottom <= dk.innerHeight, message: `desktop: lead left of the scene (${dk.lead?.right} → ${dk.scene?.left}), routes and search docked under them and inside the first viewport (search row bottom ${dk.find?.bottom} of ${dk.innerHeight})` });

  // Keyboard: the skip link shows itself; through it, the next stop is the way home, with a visible ring.
  const sk = P('skip').active || {};
  out.push({ ok: sk.href === '#main' && sk.inView && sk.focusVisible && sk.outline !== 'none' && sk.outlineWidth >= 2, message: `first Tab: the skip link, on screen with a ${sk.outlineWidth}px ${sk.outline} ring` });
  const kb = P('keyboard').active || {};
  out.push({ ok: kb.href === '/' && /lost__home/.test(kb.cls) && kb.focusVisible && kb.outline !== 'none' && kb.outlineWidth >= 2, message: `skip, then Tab: focus on the home link (${kb.href}, ${kb.cls}) with a ${kb.outlineWidth}px ring` });

  // Demo search: stays on the page and names the GET it would make.
  const se = S('search');
  out.push({ ok: se.searches === 1 && se.wouldOpen === '/search?q=Mallaig' && se.path === '/designed-404/index.html' && P('search').note?.includes('/search?q=Mallaig'), message: `search: demo keeps the page (${se.path}), would open ${se.wouldOpen}` });

  // Accessibility tree.
  const ax = r.settled?.inspect || {};
  out.push({ ok: ax.h1 === 1 && ax.home === 1 && ax.routes?.every((n) => n === 1) && ax.nav === 1 && ax.search === 1 && ax.searchbox === 1, message: `a11y: h1, home link, three named routes ${JSON.stringify(ax.routes)}, a named nav, search landmark and searchbox` });
  out.push({ ok: !!ax.snapshot && !/LW 04:04|img/.test(ax.snapshot), message: 'a11y: nothing from the scene reaches the tree' });
  return out;
}
