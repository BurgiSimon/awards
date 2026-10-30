// One jar, four slots in a picture lane. At the scroll position where slot k's centre meets the viewport's, the
// travelling element's painted box (document coordinates) must equal slot k's within 2 px, its four corners slot k's
// (eight radii, used values) and its scene slot k's alone; halfway between two stops every side and corner that
// differs must lie strictly between the two slots' and on their mean (the legs are linear), with the two scenes at
// half weight each. The flight must never cover a line of text: three states sweep every leg at 1440 × 900 and one
// more on the smallest wide screen, 1024 × 768, recording for every element with its own text the largest share of
// its box under the jar, and a control line set on the path must be found by the same sweep. After a layout change
// the timeline must be rebuilt in the same page and still fit; a motion-tier change mid-flight drops and restores it;
// right-to-left mirrors it; slots out of order give the stills; on a phone, under reduced motion and static nothing
// travels.
const stop = (k) => `(() => { const s = window.__awards.state(); if (!s.stops.length) return true; window.lenis.scrollTo(s.stops[${k}], { immediate: true, force: true }); return true; })()`;
// A point 30 % of the way from stop a to stop b: the jar has left its slot and still wears that slot's scene.
const at = (a, b, f) => `(() => { const s = window.__awards.state(); if (!s.stops.length) return true; window.lenis.scrollTo(Math.round(s.stops[${a}] + ${f} * (s.stops[${b}] - s.stops[${a}])), { immediate: true, force: true }); return true; })()`;
const mid = (a, b) => `(() => { const s = window.__awards.state(); if (!s.stops.length) return true; window.lenis.scrollTo(Math.round((s.stops[${a}] + s.stops[${b}]) / 2), { immediate: true, force: true }); return true; })()`;
const go = (fn, ms = 1400) => [{ type: 'waitFor', fn }, { type: 'wait', ms }];
const tab3 = [{ type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'wait', ms: 1400 }];
// Record the build count in the page, then change something; `rebuilt` waits for the rebuild in that same page.
const mark = (body) => `(() => { window.__b0 = window.__awards.state().builds; ${body}; return true; })()`;
const rebuilt = 'window.__awards.state().builds > window.__b0';
// Late content above the slots: an announcement bar makes the header 220 px tall and every slot moves down the page.
const grow = mark("document.querySelector('.bar').style.minHeight = '220px'");
// Snapshot of the reduced tier taken mid-flight, before the page is put back on the full tier.
const reducedSnap = `(() => { window.__reduced = { st: window.__awards.state(), flight: document.documentElement.dataset.flight, flyer: getComputedStyle(document.querySelector('[data-flyer]')).display, stills: [...document.querySelectorAll('[data-still]')].map((s) => Number(getComputedStyle(s).opacity)) }; document.documentElement.setAttribute('data-motion', 'full'); return true; })()`;
// The detail section moved above the hero (flex order) and a resize reported: slot 2 now sits above slot 1.
const reorder = mark(`window.__warns = []; const warn = console.warn; console.warn = (...a) => { window.__warns.push(a.join(' ')); warn.apply(console, a); };
  const m = document.querySelector('main'); m.style.display = 'flex'; m.style.flexDirection = 'column';
  document.querySelector('.halves').style.order = '-1'; window.dispatchEvent(new Event('resize'))`);

export const states = [
  { name: 'top', scroll: 0, settle: 600 },
  { name: 'leaving', frame: true, settle: 500, actions: go(at(0, 1, 0.3)) },
  { name: 'between', settle: 500, actions: go(mid(0, 1)) },
  { name: 'slot2', settle: 500, actions: go(stop(1)) },
  { name: 'between23', settle: 500, actions: go(mid(1, 2)) },
  { name: 'slot3', settle: 500, actions: go(stop(2)) },
  { name: 'between34', settle: 500, actions: go(mid(2, 3)) },
  { name: 'slot4', settle: 500, actions: go(stop(3)) },
  { name: 'end', scroll: 1, settle: 1400 },
  // inspect() sweeps one leg each, in 40 px steps of scroll, and waits for the scrub at every step.
  { name: 'sweep1', settle: 600 },
  { name: 'sweep2', settle: 600 },
  { name: 'sweep3', settle: 600 },
  // inspect() resizes this page to 1024 × 768, waits for the rebuild, and sweeps all three legs in 80 px steps.
  { name: 'sweep-small', settle: 600 },
  { name: 'relayout', settle: 500, actions: [{ type: 'waitFor', fn: grow }, { type: 'waitFor', fn: rebuilt }, { type: 'wait', ms: 300 }, ...go(stop(3))] },
  // Keyboard from a fresh page: skip link, brand, then the enquiry link, which the browser scrolls into view.
  { name: 'cta-focus', settle: 500, actions: tab3 },
  { name: 'tier-switch', settle: 500, actions: [...go(mid(1, 2)), { type: 'waitFor', fn: mark("document.documentElement.setAttribute('data-motion', 'reduced')") }, { type: 'wait', ms: 600 }, { type: 'waitFor', fn: reducedSnap }, { type: 'waitFor', fn: rebuilt }, { type: 'wait', ms: 300 }, ...go(stop(2))] },
  { name: 'static', settle: 500, actions: [{ type: 'waitFor', fn: mark("document.documentElement.setAttribute('data-motion', 'static')") }, { type: 'wait', ms: 600 }] },
  { name: 'rtl', settle: 500, actions: [{ type: 'waitFor', fn: mark("document.documentElement.setAttribute('dir', 'rtl')") }, { type: 'waitFor', fn: rebuilt }, { type: 'wait', ms: 300 }, ...go(mid(0, 1))] },
  { name: 'order', settle: 500, actions: [{ type: 'waitFor', fn: reorder }, { type: 'waitFor', fn: "window.__awards.state().off === 'order'" }, { type: 'wait', ms: 300 }] },
  { name: 'rm', reducedMotion: true, scroll: 0.5, settle: 800 },
  { name: 'mobile', viewport: 'mobile', scroll: 0.5, settle: 600 },
  { name: 'mobile-cta-focus', viewport: 'mobile', settle: 500, actions: tab3 },
];

export function probe() {
  const box = (el) => { const r = el.getBoundingClientRect(); return [r.left, r.top + scrollY, r.width, r.height].map((v) => Math.round(v * 10) / 10); };
  // The eight used radii (top-left, top-right, bottom-right, bottom-left; horizontal, then vertical), scaled down by one
  // factor when two on a side overflow it, as the browser paints them.
  const corners = (el) => {
    const cs = getComputedStyle(el); const w = el.offsetWidth; const h = el.offsetHeight;
    const len = (v, base) => (v.endsWith('%') ? (parseFloat(v) / 100) * base : parseFloat(v) || 0);
    const r = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map((p) => { const [a, b = a] = cs[p].split(' '); return [len(a, w), len(b, h)]; });
    const room = (side, sum) => (sum > 0 ? side / sum : Infinity);
    const f = Math.min(1, room(w, r[0][0] + r[1][0]), room(w, r[3][0] + r[2][0]), room(h, r[0][1] + r[3][1]), room(h, r[1][1] + r[2][1]));
    return [...r.map(([x]) => x * f), ...r.map(([, y]) => y * f)].map((v) => Math.round(v * 10) / 10);
  };
  const flyer = document.querySelector('[data-flyer]');
  const slots = [...document.querySelectorAll('[data-slot]')];
  const fs = getComputedStyle(flyer);
  const layer = (sel) => Number(getComputedStyle(flyer.querySelector(sel)).opacity);
  const shown = fs.display !== 'none' && fs.visibility !== 'hidden';
  const fr = flyer.getBoundingClientRect();
  // Every element with its own text, in view: the share of its box under the travelling jar.
  const texts = [...document.querySelectorAll('body *')].filter((el) => !el.closest('[data-flyer]') && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  const under = (el) => {
    const r = el.getBoundingClientRect();
    if (!shown || !r.width || !r.height) return 0;
    const ix = Math.max(0, Math.min(fr.right, r.right) - Math.max(fr.left, r.left));
    const iy = Math.max(0, Math.min(fr.bottom, r.bottom) - Math.max(fr.top, r.top));
    return (ix * iy) / (r.width * r.height);
  };
  const inView = texts.filter((el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
  const worst = inView.map((el) => [under(el), el.textContent.trim().slice(0, 32)]).sort((a, b) => b[0] - a[0])[0] || [0, null];
  const focused = document.activeElement;
  const cta = document.querySelector('.cta');
  const cr = cta.getBoundingClientRect();
  return {
    flyer: box(flyer),
    flyerCorners: corners(flyer),
    slots: slots.map(box),
    slotCorners: slots.map(corners),
    flyerShown: shown,
    flyerPointer: fs.pointerEvents,
    flyerHidden: flyer.getAttribute('aria-hidden'),
    flyerTransform: fs.transform,
    // The travelling copy's scene layers as painted: brick (kiln), straw (crate), close-up (detail).
    flyerLayers: { kiln: layer('.art__brick'), crate: layer('.art__straw'), detail: layer('.art__close') },
    flight: document.documentElement.dataset.flight ?? null,
    stills: [...document.querySelectorAll('[data-still]')].map((s) => Number(getComputedStyle(s).opacity)),
    sets: [...document.querySelectorAll('.art--set')].map((s) => Number(getComputedStyle(s).opacity)),
    stillScenes: [...document.querySelectorAll('[data-still]')].map((s) => s.dataset.scene),
    inView: inView.length,
    covered: Math.round(worst[0] * 1000) / 10,
    coveredText: worst[0] > 0 ? worst[1] : null,
    focused: focused?.matches?.('.cta') ? 'cta' : focused?.tagName?.toLowerCase() ?? null,
    ring: focused?.matches?.(':focus-visible') ? getComputedStyle(focused).outlineStyle + ' ' + getComputedStyle(focused).outlineWidth : null,
    focusedCovered: focused && focused !== document.body ? Math.round(under(focused) * 1000) / 10 : null,
    ctaInView: cr.top >= 0 && cr.bottom <= innerHeight,
    flyerViewportCentre: Math.round(fr.top + fr.height / 2),
    vw: innerWidth,
    vh: innerHeight,
    b0: window.__b0 ?? null,
    reduced: window.__reduced ?? null,
    warns: window.__warns ?? null,
    dir: document.documentElement.dir || 'ltr',
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Runs in the page: steps the scroll from `from` to `to`, waits for the scrub at every step, and records for every
// element with its own text the largest share of its box under the travelling jar (and where), plus how far the jar's
// side edges moved, so a sweep that never left a slot cannot pass for a clean one.
async function sweepLeg([from, to, step, wait]) {
  const flyer = document.querySelector('[data-flyer]');
  const texts = [...document.querySelectorAll('body *')].filter((el) => !el.closest('[data-flyer]') && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const worst = { frac: 0, text: null, y: null };
  let samples = 0, inFlight = 0, shown = 0, checked = 0;
  const lefts = [], rights = [];
  for (let y = from; y <= to + 0.5; y += step) {
    window.lenis.scrollTo(Math.round(y), { immediate: true, force: true });
    await sleep(wait);
    const f = flyer.getBoundingClientRect();
    const isShown = getComputedStyle(flyer).display !== 'none';
    samples++;
    if (isShown) shown++;
    if (window.__awards.state().docked === -1) inFlight++;
    lefts.push(f.left); rights.push(f.right);
    for (const el of texts) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || r.bottom <= 0 || r.top >= innerHeight) continue;
      checked++;
      const ix = Math.max(0, Math.min(f.right, r.right) - Math.max(f.left, r.left));
      const iy = Math.max(0, Math.min(f.bottom, r.bottom) - Math.max(f.top, r.top));
      const frac = isShown ? (ix * iy) / (r.width * r.height) : 0;
      if (frac > worst.frac) Object.assign(worst, { frac, text: el.textContent.trim().slice(0, 32), y: Math.round(scrollY) });
    }
  }
  return { samples, shown, inFlight, checked, sideways: Math.round(Math.max(Math.max(...lefts) - Math.min(...lefts), Math.max(...rights) - Math.min(...rights))), worst: Math.round(worst.frac * 1000) / 10, worstText: worst.text, worstAt: worst.y };
}

export async function inspect(page, st) {
  const legs = { sweep1: [0], sweep2: [1], sweep3: [2], 'sweep-small': [0, 1, 2] };
  if (st.name === 'top') {
    // The accessibility tree of the page while the jar flies: four named images, the travelling copy absent.
    const tree = await page.locator('main').ariaSnapshot();
    return { images: tree.split('\n').filter((l) => /^\s*- img "[^"]+"/.test(l)).map((l) => l.trim()) };
  }
  if (!legs[st.name]) return null;
  let step = 40;
  if (st.name === 'sweep-small') {
    await page.evaluate(() => { window.__b0 = window.__awards.state().builds; });
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForFunction('window.__awards.state().builds > window.__b0 && window.innerWidth === 1024', null, { timeout: 8000 });
    await page.waitForTimeout(700);
    step = 80;
  }
  const s = await page.evaluate(() => window.__awards.state());
  const out = { viewport: await page.evaluate(() => [innerWidth, innerHeight]), stops: s.stops, legs: [] };
  for (const k of legs[st.name]) out.legs.push({ leg: `${k + 1}→${k + 2}`, ...(await page.evaluate(sweepLeg, [s.stops[k], s.stops[k + 1], step, 450])) });
  if (st.name === 'sweep1') {
    // The control: a line of text set on the path, halfway between slot 1 and slot 2. The same sweep must find it.
    await page.evaluate(() => {
      const [a, b] = [...document.querySelectorAll('[data-slot]')].slice(0, 2).map((el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + scrollY + r.height / 2 }; });
      const p = document.createElement('p');
      p.id = 'sweep-control';
      p.textContent = 'Control line on the path';
      Object.assign(p.style, { position: 'absolute', left: `${(a.x + b.x) / 2 - 90}px`, top: `${(a.y + b.y) / 2 - 12}px`, width: '180px', margin: '0' });
      document.body.append(p);
    });
    out.control = await page.evaluate(sweepLeg, [s.stops[0], s.stops[1], 80, 450]);
    await page.evaluate(() => document.getElementById('sweep-control').remove());
  }
  return out;
}

export function assert(r) {
  const out = [];
  const P = (k) => r[k]?.probe || {};
  const S = (k) => r[k]?.state || {};
  const I = (k) => r[k]?.inspect || {};
  const fmt = (b) => (b || []).map((v) => Math.round(v)).join(',');
  const fits = (k, n) => {
    const p = P(k); const s = p.slots?.[n]; const c = p.slotCorners?.[n];
    return !!s && !!c && p.flyer.every((v, j) => Math.abs(v - s[j]) <= 2) && p.flyerCorners.every((v, j) => Math.abs(v - c[j]) <= 1.5);
  };
  const fitMsg = (k, n) => `${k}: the jar's box ${fmt(P(k).flyer)} corners ${fmt(P(k).flyerCorners)} match slot ${n + 1} ${fmt(P(k).slots?.[n])} corners ${fmt(P(k).slotCorners?.[n])} within 2 px and 1.5 px`;
  // Strictly between two slots on every side and corner that differs, and on their mean (the legs are linear).
  const lerps = (v, a, b, tol) => (Math.abs(a - b) <= 2 * tol ? Math.abs(v - a) <= tol : v > Math.min(a, b) + 1 && v < Math.max(a, b) - 1 && Math.abs(v - (a + b) / 2) <= tol);
  const between = (k, a, b) => {
    const p = P(k); const A = p.slots?.[a]; const B = p.slots?.[b]; const CA = p.slotCorners?.[a]; const CB = p.slotCorners?.[b];
    if (!A || !B || !CA || !CB) return false;
    const corners = p.flyerCorners.map((v, j) => [CA[j], CB[j], v]).filter(([x, y]) => Math.abs(x - y) > 4);
    return p.flyer.every((v, j) => lerps(v, A[j], B[j], 3)) && p.flyerCorners.every((v, j) => lerps(v, CA[j], CB[j], 2)) && corners.length > 0;
  };
  const midMsg = (k, a, b) => `${k}: in flight (docked ${S(k).docked}); box ${fmt(P(k).flyer)} corners ${fmt(P(k).flyerCorners)} strictly between slot ${a + 1} ${fmt(P(k).slots?.[a])} / ${fmt(P(k).slotCorners?.[a])} and slot ${b + 1} ${fmt(P(k).slots?.[b])} / ${fmt(P(k).slotCorners?.[b])}, on their mean; no text under it (${P(k).covered} % of ${P(k).inView} elements in view)`;

  const t = P('top'), ts = S('top');
  out.push({ ok: ts.motion === 'full' && ts.wide && ts.flight && t.flight === 'on' && ts.builds >= 1 && ts.stops?.length === 4 && ts.docked === 0 && ts.scene === 'studio' && fits('top', 0), message: `top: flight built (${ts.builds} builds, stops ${ts.stops?.join(' / ')}), resting in slot 1 in the ${ts.scene} scene; ${fitMsg('top', 0)}` });
  // The arch is a true arch: rounded top corners, square bottom ones.
  const arch = t.slotCorners?.[0] || [];
  out.push({ ok: arch[0] > 100 && Math.abs(arch[0] - arch[1]) < 1 && arch[2] === 0 && arch[3] === 0 && Math.abs(arch[0] - t.slots?.[0]?.[2] / 2) <= 1, message: `top: slot 1 is an arch: top corners ${arch[0]} / ${arch[1]} px (half its ${Math.round(t.slots?.[0]?.[2] ?? 0)} px width), bottom corners ${arch[2]} / ${arch[3]} px` });
  const imgs = I('top').images || [];
  out.push({ ok: t.flyerShown && t.stills.every((o) => o === 0) && t.sets.every((o) => o === 1) && t.flyerPointer === 'none' && t.flyerHidden === 'true' && imgs.length === 4, message: `top: one travelling copy shown (pointer-events ${t.flyerPointer}, aria-hidden ${t.flyerHidden}), each box shows its empty set (opacity ${t.sets.join('/')}); the accessibility tree still holds the four stills as named images (${imgs.length}: ${imgs.map((l) => l.slice(7, 40)).join(' | ')})` });
  // Scenes: pure at rest and early in a leg, an even blend halfway (the crossfade is tied to the scroll, not to a clock).
  const pure = (k, name) => { const m = S(k).mix || {}; return S(k).scene === name && Object.entries(m).every(([n, v]) => Math.abs(v - (n === name ? 1 : 0)) < 0.01); };
  const layersFor = (k, name) => { const l = P(k).flyerLayers || {}; return ['kiln', 'crate', 'detail'].every((n) => Math.abs(l[n] - (n === name ? 1 : 0)) < 0.01); };
  const blend = (k, a, b) => { const m = S(k).mix || {}; return Math.abs(m[a] - 0.5) < 0.03 && Math.abs(m[b] - 0.5) < 0.03; };
  const sceneMsg = (k) => `scene ${S(k).scene} (weights ${Object.entries(S(k).mix || {}).map(([n, v]) => `${n} ${v}`).join(', ')}; layers ${Object.entries(P(k).flyerLayers || {}).map(([n, v]) => `${n} ${v}`).join(', ')})`;
  out.push({ ok: S('leaving').docked === -1 && pure('leaving', 'studio') && layersFor('leaving', 'studio') && P('leaving').covered === 0, message: `leaving: 30 % of the way to slot 2 the jar is in flight (docked ${S('leaving').docked}) and still in the studio scene: ${sceneMsg('leaving')}; no text under it (${P('leaving').covered} %)` });
  out.push({ ok: S('between').docked === -1 && between('between', 0, 1) && P('between').covered === 0 && blend('between', 'studio', 'detail'), message: `${midMsg('between', 0, 1)}; ${sceneMsg('between')}` });
  out.push({ ok: Math.abs(P('between').flyerViewportCentre - P('between').vh / 2) <= P('between').vh * 0.12, message: `between: a leg paid in scroll distance keeps the jar near the viewport's middle (centre at ${P('between').flyerViewportCentre} of ${P('between').vh})` });
  out.push({ ok: S('slot2').docked === 1 && pure('slot2', 'detail') && layersFor('slot2', 'detail') && fits('slot2', 1), message: `${fitMsg('slot2', 1)}; ${sceneMsg('slot2')}` });
  out.push({ ok: S('between23').docked === -1 && between('between23', 1, 2) && P('between23').covered === 0 && blend('between23', 'detail', 'kiln'), message: `${midMsg('between23', 1, 2)}; ${sceneMsg('between23')}` });
  out.push({ ok: S('slot3').docked === 2 && pure('slot3', 'kiln') && layersFor('slot3', 'kiln') && fits('slot3', 2), message: `${fitMsg('slot3', 2)}; ${sceneMsg('slot3')}` });
  out.push({ ok: S('between34').docked === -1 && between('between34', 2, 3) && P('between34').covered === 0 && blend('between34', 'kiln', 'crate'), message: `${midMsg('between34', 2, 3)}; ${sceneMsg('between34')}` });
  out.push({ ok: S('slot4').docked === 3 && pure('slot4', 'crate') && layersFor('slot4', 'crate') && fits('slot4', 3), message: `${fitMsg('slot4', 3)}; ${sceneMsg('slot4')}` });
  out.push({ ok: S('end').docked === 3 && fits('end', 3), message: `end: past the last stop the jar stays in the round slot; ${fitMsg('end', 3)}` });

  // The sweeps: every leg sampled while the jar flies and moves sideways, and no element with text ever under it.
  for (const k of ['sweep1', 'sweep2', 'sweep3', 'sweep-small']) {
    const legs = I(k).legs || [];
    const ok = legs.length === (k === 'sweep-small' ? 3 : 1) && legs.every((l) => l.samples >= 6 && l.shown === l.samples && l.inFlight >= 3 && l.checked > 0 && l.sideways > 20 && l.worst === 0);
    out.push({ ok, message: `${k}: at ${(I(k).viewport || []).join(' × ')} ${legs.map((l) => `leg ${l.leg}: ${l.samples} positions (${l.inFlight} in flight, ${l.sideways} px sideways), ${l.checked} text boxes checked, most covered ${l.worst} %${l.worstText ? ` ('${l.worstText}' at ${l.worstAt})` : ''}`).join('; ') || 'no sweep'}` });
  }

  const ctl = I('sweep1').control || {};
  out.push({ ok: ctl.worst >= 50 && /^Control line/.test(ctl.worstText || ''), message: `sweep control: a line set on the path between slot 1 and slot 2 is found by the same sweep (${ctl.worst} % covered: '${ctl.worstText}' at ${ctl.worstAt})` });

  // The layout changed under the timeline: rebuilt in the same page (builds went up), and the fit is true for the new layout.
  const rl = S('relayout');
  const moved = (P('relayout').slots?.[3]?.[1] ?? 0) - (P('slot4').slots?.[3]?.[1] ?? 0);
  out.push({ ok: rl.builds > (P('relayout').b0 ?? 99) && rl.docked === 3 && Math.abs(moved) > 40 && fits('relayout', 3), message: `relayout: a 220 px header moved slot 4 by ${Math.round(moved)} px; timeline rebuilt in the same page (${P('relayout').b0} → ${rl.builds} builds); ${fitMsg('relayout', 3)}` });

  const c = P('cta-focus');
  out.push({ ok: c.focused === 'cta' && /solid 2px/.test(c.ring || '') && c.ctaInView && S('cta-focus').flight && c.focusedCovered === 0 && c.covered === 0, message: `keyboard: Tab reaches the enquiry link (${c.focused}, ring ${c.ring}), in view, with the flight on; the jar covers ${c.focusedCovered} % of it and ${c.covered} % of any text in view` });
  const mc = P('mobile-cta-focus');
  out.push({ ok: mc.focused === 'cta' && /solid 2px/.test(mc.ring || '') && mc.ctaInView && !mc.flyerShown && mc.focusedCovered === 0, message: `phone keyboard: Tab reaches the enquiry link (${mc.focused}, ring ${mc.ring}), in view, no travelling copy (shown ${mc.flyerShown}), ${mc.focusedCovered} % covered` });

  // A tier change at runtime: reduced mid-flight drops the timeline and shows the stills; full again rebuilds and fits.
  const tw = P('tier-switch'), red = tw.reduced || {};
  out.push({ ok: red.st?.motion === 'reduced' && !red.st?.flight && red.st?.triggers === 0 && red.flight === 'off' && red.flyer === 'none' && red.stills?.every((o) => o === 1), message: `tier switch: reduced mid-flight → ${red.st?.triggers} triggers, data-flight ${red.flight}, flyer display ${red.flyer}, stills ${red.stills?.join('/')}` });
  out.push({ ok: S('tier-switch').motion === 'full' && S('tier-switch').builds > (tw.b0 ?? 99) && S('tier-switch').docked === 2 && fits('tier-switch', 2), message: `tier switch: back to full → rebuilt (${tw.b0} → ${S('tier-switch').builds} builds); ${fitMsg('tier-switch', 2)}` });

  const st = P('static'), sts = S('static');
  out.push({ ok: sts.motion === 'static' && !sts.flight && sts.off === 'static' && sts.triggers === 0 && st.flight === 'off' && !st.flyerShown && st.stills.every((o) => o === 1) && st.sets.every((o) => o === 0), message: `static: no timeline (${sts.triggers} triggers, off: ${sts.off}), the travelling copy hidden, every box shows its own still (opacity ${st.stills?.join('/')})` });

  // Right to left: the lanes mirror (the pictures on the left), the flight is rebuilt for them and still linear.
  const rt = P('rtl');
  out.push({ ok: rt.dir === 'rtl' && S('rtl').builds > (rt.b0 ?? 99) && (rt.slots?.[0]?.[0] ?? 999) + (rt.slots?.[0]?.[2] ?? 0) < rt.vw / 2 && S('rtl').docked === -1 && between('rtl', 0, 1) && rt.covered === 0 && rt.overflowX <= 0, message: `rtl: lanes mirrored (slot 1 at x ${fmt(rt.slots?.[0])}), rebuilt (${rt.b0} → ${S('rtl').builds}); ${midMsg('rtl', 0, 1)}` });

  // Slots out of document order: no leg of zero or negative length, the stills instead, and a warning that says why.
  const or = P('order'), ors = S('order');
  out.push({ ok: ors.off === 'order' && !ors.flight && ors.triggers === 0 && or.flight === 'off' && !or.flyerShown && or.stills.every((o) => o === 1) && (or.warns || []).some((w) => /lower on the page/.test(w)), message: `order: slot 2 above slot 1 → flight off (${ors.off}, ${ors.triggers} triggers), stills ${or.stills?.join('/')}, warned: '${(or.warns || [])[0]?.slice(0, 60)}'` });

  const rm = P('rm'), rms = S('rm');
  out.push({ ok: rms.motion === 'reduced' && !rms.flight && rms.triggers === 0 && !rm.flyerShown && rm.stills.every((o) => o === 1) && rm.sets.every((o) => o === 0) && rm.flyerTransform === 'none', message: `reduced motion: no timeline (${rms.triggers} triggers), the travelling copy hidden, every box shows its own still (opacity ${rm.stills?.join('/')}) in its own scene (${rm.stillScenes?.join(', ')})` });

  const m = P('mobile'), ms = S('mobile');
  out.push({ ok: !ms.wide && !ms.flight && ms.off === 'narrow' && ms.triggers === 0 && m.flight === 'off' && !m.flyerShown && m.stills.every((o) => o === 1) && m.covered === 0 && m.overflowX <= 0 && (P('top').overflowX ?? 1) <= 0, message: `mobile: one column and no flight (${ms.off}, ${ms.triggers} triggers), every box shows its own still (opacity ${m.stills?.join('/')}); overflow ${m.overflowX}px` });
  return out;
}
