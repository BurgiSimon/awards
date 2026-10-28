// One jar, four slots. At the scroll position where slot k's centre meets the viewport's, the travelling element's
// painted box (getBoundingClientRect, in document coordinates) must equal slot k's box within 2 px and its corner
// radius slot k's; halfway between two stops every side must lie strictly between the two slots' (and on their mean,
// since the legs are linear); after the page's text grows the timeline must have been rebuilt and still fit; on a
// phone it fits its own column; under reduced motion nothing travels and every slot shows its own still.
const stop = (k) => `(() => { const s = window.__awards.state(); if (!s.stops.length) return true; window.lenis.scrollTo(s.stops[${k}], { immediate: true, force: true }); return true; })()`;
const mid = (a, b) => `(() => { const s = window.__awards.state(); if (!s.stops.length) return true; window.lenis.scrollTo(Math.round((s.stops[${a}] + s.stops[${b}]) / 2), { immediate: true, force: true }); return true; })()`;
const go = (fn, ms = 1400) => [{ type: 'waitFor', fn }, { type: 'wait', ms }];
// Text zoom: the root size goes from 16 to 24 px, the paragraphs grow, and the slots below them move down the page.
const grow = "(() => { window.__b0 = window.__awards.state().builds; document.documentElement.style.fontSize = '150%'; return true; })()";
const rebuilt = 'window.__awards.state().builds > window.__b0';

export const states = [
  { name: 'top', scroll: 0, settle: 600 },
  { name: 'between', frame: true, settle: 500, actions: go(mid(0, 1)) },
  { name: 'slot2', settle: 500, actions: go(stop(1)) },
  { name: 'between23', settle: 500, actions: go(mid(1, 2)) },
  { name: 'slot3', settle: 500, actions: go(stop(2)) },
  { name: 'slot4', settle: 500, actions: go(stop(3)) },
  { name: 'end', scroll: 1, settle: 1400 },
  { name: 'relayout', settle: 500, actions: [{ type: 'waitFor', fn: grow }, { type: 'waitFor', fn: rebuilt }, { type: 'wait', ms: 300 }, ...go(stop(3))] },
  // Keyboard: Tab past the skip link and the brand to the enquiry link; the jar resting nearby must not cover it.
  { name: 'cta-focus', settle: 500, actions: [...go(stop(3), 600), { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'wait', ms: 1400 }] },
  { name: 'rm', reducedMotion: true, scroll: 0.5, settle: 800 },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: go(stop(1)) },
  { name: 'mobile-between', viewport: 'mobile', settle: 600, actions: go(mid(2, 3)) },
];

export function probe() {
  const box = (el) => { const r = el.getBoundingClientRect(); return [r.left, r.top + scrollY, r.width, r.height].map((v) => Math.round(v * 10) / 10); };
  const radius = (slot) => {
    const v = getComputedStyle(slot).borderTopLeftRadius;
    const short = Math.min(slot.offsetWidth, slot.offsetHeight);
    const px = v.endsWith('%') ? (parseFloat(v) / 100) * short : parseFloat(v) || 0;
    return Math.round(Math.min(px, short / 2) * 10) / 10;
  };
  const flyer = document.querySelector('[data-flyer]');
  const slots = [...document.querySelectorAll('[data-slot]')];
  const fs = getComputedStyle(flyer);
  const cta = document.querySelector('.cta');
  const focused = document.activeElement;
  const fr = flyer.getBoundingClientRect();
  const cr = cta.getBoundingClientRect();
  const overlap = Math.max(0, Math.min(fr.right, cr.right) - Math.max(fr.left, cr.left)) * Math.max(0, Math.min(fr.bottom, cr.bottom) - Math.max(fr.top, cr.top));
  return {
    flyer: box(flyer),
    slots: slots.map(box),
    radius: Math.round((parseFloat(fs.borderTopLeftRadius) || 0) * 10) / 10,
    slotRadii: slots.map(radius),
    flyerShown: fs.display !== 'none' && fs.visibility !== 'hidden',
    flyerPointer: fs.pointerEvents,
    flyerTransform: fs.transform,
    stills: [...document.querySelectorAll('[data-still]')].map((s) => Number(getComputedStyle(s).opacity)),
    stillNames: [...document.querySelectorAll('[data-still]')].map((s) => s.getAttribute('aria-label') ? s.getAttribute('role') : null),
    flyerHidden: flyer.getAttribute('aria-hidden'),
    focused: focused?.matches?.('.cta') ? 'cta' : focused?.tagName?.toLowerCase() ?? null,
    ring: focused?.matches?.(':focus-visible') ? getComputedStyle(focused).outlineStyle + ' ' + getComputedStyle(focused).outlineWidth : null,
    ctaInView: cr.top >= 0 && cr.bottom <= innerHeight,
    ctaOverlap: Math.round(overlap),
    flyerViewportCentre: Math.round(fr.top + fr.height / 2),
    vh: innerHeight,
    scrollY: Math.round(scrollY),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

export function assert(r) {
  const out = [];
  const P = (k) => r[k]?.probe || {};
  const S = (k) => r[k]?.state || {};
  const fmt = (b) => (b || []).map((v) => Math.round(v)).join(',');
  const fits = (k, n) => { const p = P(k); const s = p.slots?.[n]; return !!s && p.flyer.every((v, j) => Math.abs(v - s[j]) <= 2) && Math.abs(p.radius - p.slotRadii[n]) <= 1.5; };
  const fitMsg = (k, n) => `${k}: the jar's box ${fmt(P(k).flyer)} r ${P(k).radius} matches slot ${n + 1} ${fmt(P(k).slots?.[n])} r ${P(k).slotRadii?.[n]} within 2 px`;
  // Strictly between two slots on every side that differs, and on their mean (the legs are linear, `ease: 'none'`).
  const between = (k, a, b) => {
    const p = P(k); const A = p.slots?.[a]; const B = p.slots?.[b];
    if (!A || !B) return false;
    const sides = p.flyer.every((v, j) => (Math.abs(A[j] - B[j]) <= 4 ? Math.abs(v - A[j]) <= 3 : v > Math.min(A[j], B[j]) + 1 && v < Math.max(A[j], B[j]) - 1 && Math.abs(v - (A[j] + B[j]) / 2) <= 3));
    const ra = p.slotRadii[a], rb = p.slotRadii[b];
    return sides && p.radius > Math.min(ra, rb) && p.radius < Math.max(ra, rb);
  };

  const t = P('top'), ts = S('top');
  out.push({ ok: ts.motion === 'full' && ts.flight && ts.builds >= 1 && ts.stops?.length === 4 && ts.docked === 0 && fits('top', 0), message: `top: flight built (${ts.builds} builds, stops ${ts.stops?.join(' / ')}), resting in slot 1; ${fitMsg('top', 0)}` });
  out.push({ ok: t.flyerShown && t.stills.every((o) => o === 0) && t.flyerPointer === 'none' && t.flyerHidden === 'true' && t.stillNames.every((n) => n === 'img'), message: `top: one travelling copy shown (pointer-events ${t.flyerPointer}, aria-hidden ${t.flyerHidden}); the four stills stay in the tree as named images at opacity ${t.stills.join('/')}` });
  out.push({ ok: S('between').docked === -1 && between('between', 0, 1), message: `between: in flight (docked ${S('between').docked}); box ${fmt(P('between').flyer)} r ${P('between').radius} strictly between slot 1 ${fmt(P('between').slots?.[0])} and slot 2 ${fmt(P('between').slots?.[1])}, on their mean` });
  out.push({ ok: Math.abs(P('between').flyerViewportCentre - P('between').vh / 2) <= P('between').vh * 0.12, message: `between: a leg paid in scroll distance keeps the jar near the viewport's middle (centre at ${P('between').flyerViewportCentre} of ${P('between').vh})` });
  out.push({ ok: S('slot2').docked === 1 && fits('slot2', 1), message: fitMsg('slot2', 1) });
  out.push({ ok: S('between23').docked === -1 && between('between23', 1, 2), message: `between23: box ${fmt(P('between23').flyer)} r ${P('between23').radius} strictly between slot 2 and slot 3 (${fmt(P('between23').slots?.[2])})` });
  out.push({ ok: S('slot3').docked === 2 && fits('slot3', 2), message: fitMsg('slot3', 2) });
  out.push({ ok: S('slot4').docked === 3 && fits('slot4', 3), message: fitMsg('slot4', 3) });
  out.push({ ok: S('end').docked === 3 && fits('end', 3), message: `end: past the last stop the jar stays in the round slot; ${fitMsg('end', 3)}` });

  // The layout changed under the timeline: rebuilt (builds went up), and the fit is true for the new layout.
  const rl = S('relayout');
  const moved = (P('relayout').slots?.[3]?.[1] ?? 0) - (P('slot4').slots?.[3]?.[1] ?? 0);
  out.push({ ok: rl.builds > (S('slot4').builds ?? 99) && rl.docked === 3 && Math.abs(moved) > 40 && fits('relayout', 3), message: `relayout: text at 150 % moved slot 4 by ${Math.round(moved)} px; timeline rebuilt (${S('slot4').builds} → ${rl.builds} builds); ${fitMsg('relayout', 3)}` });

  const c = P('cta-focus');
  out.push({ ok: c.focused === 'cta' && /solid 2px/.test(c.ring || '') && c.ctaInView && c.ctaOverlap === 0, message: `keyboard: Tab reaches the enquiry link (${c.focused}, ring ${c.ring}), in view, and the resting jar covers none of it (${c.ctaOverlap} px² overlap)` });

  const rm = P('rm'), rms = S('rm');
  out.push({ ok: rms.motion === 'reduced' && !rms.flight && rms.triggers === 0 && !rm.flyerShown && rm.stills.every((o) => o === 1) && rm.flyerTransform === 'none', message: `reduced motion: no timeline (${rms.triggers} triggers), the travelling copy hidden, every slot shows its own still (opacity ${rm.stills?.join('/')})` });

  const m = P('mobile'), ms = S('mobile');
  out.push({ ok: ms.flight && ms.docked === 1 && fits('mobile', 1) && m.overflowX <= 0, message: `mobile: the phone layout gets its own stops (${ms.stops?.join(' / ')}); ${fitMsg('mobile', 1)}; overflow ${m.overflowX}px` });
  out.push({ ok: between('mobile-between', 2, 3) && P('mobile-between').overflowX <= 0 && (P('top').overflowX ?? 1) <= 0, message: `mobile: mid-flight between the shelf and the round window (${fmt(P('mobile-between').flyer)}), no sideways overflow (${P('mobile-between').overflowX}px)` });
  return out;
}
