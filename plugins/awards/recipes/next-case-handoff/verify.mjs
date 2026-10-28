// The close hinges on a scrub; following it lifts the frame out of its clip while the card unwinds, then the next page
// arrives with the very same canvas node in its hero (same painter id, frame count still climbing), the card exactly
// where the lifted one ended, scroll at 0 and focus on the new h1; Back restores the previous case, and wins over a lift
// still in flight; the skip link's fragment never refetches the page; reduced motion navigates for real.
const next = { type: 'click', selector: '[data-next-label]' };
// The skip link's #main is a same-page traversal that still fires popstate; the counter proves it did.
const countPops = { type: 'waitFor', fn: '(() => { window.__pops = 0; addEventListener("popstate", () => { window.__pops++; }); return true; })()' };
const skip = [countPops, { type: 'focus', selector: '.skip-link' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 800 }];
export const states = [
  { name: 'top', scroll: 0, settle: 1600 },
  { name: 'footer', scroll: 1, settle: 1200 },
  { name: 'rising', settle: 1500, actions: [next, { type: 'wait', ms: 150 }] },
  { name: 'handoff', settle: 1500, actions: [next, { type: 'wait', ms: 2200 }] },
  { name: 'chain', settle: 1500, actions: [next, { type: 'wait', ms: 2200 }, next, { type: 'wait', ms: 2200 }] },
  { name: 'back', settle: 1500, actions: [next, { type: 'wait', ms: 2200 }, { type: 'waitFor', fn: '(() => { history.back(); return true; })()' }, { type: 'wait', ms: 1500 }] },
  // After a hand-off, the skip link must keep the arrived page and its moved plate.
  { name: 'skip', settle: 1500, actions: [next, { type: 'wait', ms: 2200 }, ...skip] },
  // Back pressed a quarter of the way through a second lift: Back wins, the hand-off is dropped.
  { name: 'back-during-lift', settle: 1500, actions: [next, { type: 'wait', ms: 2200 }, next, { type: 'wait', ms: 250 }, { type: 'waitFor', fn: '(() => { history.back(); return true; })()' }, { type: 'wait', ms: 2200 }] },
  { name: 'rm-footer', scroll: 1, reducedMotion: true, settle: 800 },
  { name: 'rm-next', reducedMotion: true, settle: 800, actions: [next, { type: 'wait', ms: 1500 }] },
  { name: 'rm-skip', reducedMotion: true, settle: 800, actions: skip },
  { name: 'mobile', viewport: 'mobile', scroll: 1, settle: 1200 },
  { name: 'mobile-handoff', viewport: 'mobile', settle: 1500, actions: [next, { type: 'wait', ms: 2200 }] },
];

export function probe() {
  const f = document.querySelector('[data-next-frame].is-lifting');
  const c = f?.querySelector('[data-card]');
  const angle = (el) => { const m = new DOMMatrixReadOnly(getComputedStyle(el).transform); return Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI * 100) / 100; };
  return {
    lifted: !!f,
    framePosition: f ? getComputedStyle(f).position : null,
    frameTop: f ? Math.round(f.getBoundingClientRect().top) : null,
    cardAngle: c ? angle(c) : null,
    pops: window.__pops ?? null,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

const near = (a, b, tol) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
export function assert(r) {
  const st = (n) => r[n]?.state || {};
  const pr = (n) => r[n]?.probe || {};
  const out = [];
  const t = st('top');
  out.push({ ok: t.h1 === 'The Harbour Lamps' && t.mode === 'load' && (t.heroPlateFrame ?? 0) > 0, message: `top: the first case, its plate painting (${t.heroPlateFrame} frames)` });
  out.push({ ok: near(st('footer').nextAngle, -5, 0.6) && st('footer').nextHref === 'case-2.html', message: `footer: the next case's card has hinged to −5° by the end (${st('footer').nextAngle}°), and the link is a real URL (${st('footer').nextHref})` });
  const ri = st('rising'), rip = pr('rising');
  out.push({ ok: ri.busy === true && ri.h1 === 'The Harbour Lamps' && rip.lifted && rip.framePosition === 'fixed' && rip.frameTop < ri.riseFrom && rip.frameTop >= -1 && rip.cardAngle > -5 && rip.cardAngle <= 0, message: `rising: the frame is lifted out of its clip and travelling (top ${rip.frameTop} from ${ri.riseFrom}), the card unwinding (${rip.cardAngle}°), the page not yet swapped` });
  const h = st('handoff');
  out.push({ ok: h.mode === 'handoff' && h.path === 'case-2.html' && h.h1 === 'A Window for Hale Chapel' && /^A Window for Hale Chapel/.test(h.title) && h.mains === 1 && h.heroes === 1, message: `handoff: the next case is in place (${h.path}, "${h.h1}"), one main, one hero` });
  out.push({ ok: h.liveId !== null && h.heroPlateId === h.liveId && h.heroPlateFrame > h.frameAtClick, message: `handoff: the hero's plate is the same node the footer was painting (id ${h.heroPlateId} = ${h.liveId}) and it kept running (${h.frameAtClick} → ${h.heroPlateFrame} frames)` });
  out.push({ ok: near(h.endRect?.x, h.heroCardRect?.x, 2) && near(h.endRect?.y, h.heroCardRect?.y, 2) && near(h.endRect?.w, h.heroCardRect?.w, 2), message: `handoff: the new hero's card is exactly where the lifted card ended (${JSON.stringify(h.endRect)} vs ${JSON.stringify(h.heroCardRect)})` });
  out.push({ ok: h.scrollY === 0 && h.focus === 'h1' && h.nextHref === 'case-3.html', message: `handoff: scroll at 0, focus on the new h1, the new close points on (${h.nextHref})` });
  const c = st('chain');
  out.push({ ok: c.handoffs === 2 && c.path === 'case-3.html' && c.h1 === 'Tidewater Bottles' && c.heroPlateId === c.liveId, message: `chain: a second hand-off from the arrived page (${c.h1}, ${c.handoffs} hand-offs)` });
  const b = st('back');
  out.push({ ok: b.mode === 'pop' && b.path === 'index.html' && b.h1 === 'The Harbour Lamps' && b.mains === 1, message: `back: the browser's Back restores the previous case (${b.path}, "${b.h1}")` });
  const sk = st('skip'), skp = pr('skip');
  out.push({ ok: skp.pops >= 1 && sk.mode === 'handoff' && sk.handoffs === 1 && sk.path === 'case-2.html' && sk.heroPlateId === sk.liveId && sk.heroPlateFrame > sk.frameAtClick, message: `skip link: a same-page traversal (${skp.pops} popstate) keeps the arrived page and its moved plate (mode ${sk.mode}, plate ${sk.heroPlateId} = ${sk.liveId})` });
  const bl = st('back-during-lift'), blp = pr('back-during-lift');
  out.push({ ok: bl.mode === 'pop' && bl.path === 'index.html' && bl.h1 === 'The Harbour Lamps' && /^The Harbour Lamps/.test(bl.title) && bl.handoffs === 1 && bl.mains === 1 && !blp.lifted && bl.busy === false, message: `back during a lift: Back wins and the hand-off is dropped (${bl.path}, "${bl.h1}", ${bl.handoffs} hand-off, mode ${bl.mode})` });
  const rs = st('rm-skip'), rsp = pr('rm-skip');
  out.push({ ok: rsp.pops >= 1 && rs.mode === 'load' && rs.mains === 1 && rs.h1 === 'The Harbour Lamps', message: `reduced motion: the skip link (${rsp.pops} popstate) fetches and swaps nothing (mode ${rs.mode})` });
  out.push({ ok: st('rm-footer').motion === 'reduced' && near(st('rm-footer').nextAngle, 0, 0.01), message: `reduced motion: the close stays flat (${st('rm-footer').nextAngle}°)` });
  const rn = st('rm-next');
  out.push({ ok: rn.path === 'case-2.html' && rn.h1 === 'A Window for Hale Chapel' && rn.mode === 'load' && rn.handoffs === 0, message: `reduced motion: the link navigates for real (${rn.path}, mode ${rn.mode})` });
  out.push({ ok: (pr('mobile').overflowX ?? 1) <= 0 && near(st('mobile').nextAngle, -5, 0.6), message: `mobile: the close hinges with no sideways overflow (${pr('mobile').overflowX})` });
  const mh = st('mobile-handoff');
  out.push({ ok: mh.h1 === 'A Window for Hale Chapel' && mh.heroPlateId === mh.liveId && near(mh.endRect?.y, mh.heroCardRect?.y, 2), message: `mobile: the hand-off lands seamlessly on a phone (${JSON.stringify(mh.endRect)} vs ${JSON.stringify(mh.heroCardRect)})` });
  return out;
}
