// The rail marks the chapter whose midpoint is nearest the viewport centre (checked against an independent measure at
// three scroll positions), fills each rule with the reading position, answers a jump at its start and never passes
// through the chapters in between, lands with focus on the heading and one polite announcement, and never announces on
// a plain scroll. Reduced motion jumps instantly and keeps every state change. Phones get a sticky ticket that opens
// the same list as a disclosure, closes on Escape and on a jump, and never covers the heading it lands on.
const scrollTo = (p) => ({ type: 'waitFor', fn: `(() => { window.__awards.scrollTo(${p}); return true; })()` });
const midJump = (i) => ({ type: 'waitFor', fn: `window.__awards.state().jumping === ${i} && window.__awards.state().current === ${i}`, timeout: 3000 });

export const states = [
  { name: 'top', scroll: 0, settle: 800 },
  { name: 's25', scroll: 0.25, settle: 800 },
  { name: 's50', scroll: 0.5, settle: 800 },
  { name: 's80', scroll: 0.8, settle: 800 },
  // Keyboard: focus the fifth link, Enter; mid-glide the rail already marks the destination.
  { name: 'jump-key', settle: 600, frame: true, actions: [{ type: 'focus', selector: '.rail__link[href="#stage-5"]' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 150 }, midJump(4), { type: 'wait', ms: 1800 }] },
  // A "continue" link inside a chapter uses the same jump.
  { name: 'jump-next', settle: 600, actions: [scrollTo(0.25), { type: 'wait', ms: 400 }, { type: 'click', selector: '#stage-2 .stage__next a' }, { type: 'wait', ms: 1900 }] },
  { name: 'rm-scroll', reducedMotion: true, scroll: 0.5, settle: 600 },
  { name: 'rm-jump', reducedMotion: true, settle: 600, actions: [{ type: 'focus', selector: '.rail__link[href="#stage-3"]' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 300 }] },
  { name: 'mobile', viewport: 'mobile', scroll: 0.5, settle: 800 },
  { name: 'mobile-open', viewport: 'mobile', settle: 600, actions: [scrollTo(0.5), { type: 'wait', ms: 500 }, { type: 'click', selector: '[data-ticket]' }, { type: 'wait', ms: 600 }] },
  { name: 'mobile-jump', viewport: 'mobile', settle: 600, actions: [scrollTo(0.5), { type: 'wait', ms: 500 }, { type: 'click', selector: '[data-ticket]' }, { type: 'wait', ms: 300 }, { type: 'click', selector: '.rail__link[href="#stage-6"]' }, { type: 'wait', ms: 1900 }] },
  { name: 'mobile-escape', viewport: 'mobile', settle: 600, actions: [scrollTo(0.5), { type: 'wait', ms: 500 }, { type: 'click', selector: '[data-ticket]' }, { type: 'wait', ms: 300 }, { type: 'press', key: 'Escape' }, { type: 'wait', ms: 300 }] },
];

export function probe() {
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const links = [...document.querySelectorAll('[data-link]')];
  const body = document.querySelector('[data-rail-body]');
  const marker = document.querySelector('[data-marker]');
  const ticket = document.querySelector('[data-ticket]');
  const centre = innerHeight / 2;
  // The nearest-midpoint rule measured independently of the page's cached geometry.
  const rects = chapters.map((c) => c.getBoundingClientRect());
  let expected = -1;
  if (centre >= rects[0].top && centre <= rects.at(-1).bottom) {
    let d = Infinity;
    rects.forEach((r, i) => { const di = Math.abs(r.top + r.height / 2 - centre); if (di < d) { d = di; expected = i; } });
  } else if (centre > rects.at(-1).bottom) expected = chapters.length;
  const er = rects[expected];
  const expectedProgress = er ? Math.min(1, Math.max(0, (centre - er.top) / er.height)) : null;
  const cur = links.findIndex((a) => a.getAttribute('aria-current') === 'true');
  const curLink = links[cur];
  const mt = new DOMMatrixReadOnly(getComputedStyle(marker).transform);
  const ms = getComputedStyle(marker);
  const ts = getComputedStyle(ticket);
  const tr = ticket.getBoundingClientRect();
  const bs = getComputedStyle(body);
  const a = document.activeElement;
  const heading = a?.matches?.('h2') ? a.getBoundingClientRect() : null;
  return {
    expected,
    expectedProgress,
    currents: links.filter((l) => l.hasAttribute('aria-current')).length,
    cur,
    hrefsResolve: links.every((l) => !!document.querySelector(l.getAttribute('href'))),
    fills: [...document.querySelectorAll('[data-fill]')].map((f) => Number(new DOMMatrixReadOnly(getComputedStyle(f).transform).a.toFixed(4))),
    markerOn: ms.opacity === '1',
    markerY: Number(mt.m42.toFixed(1)),
    markerH: Math.round(marker.getBoundingClientRect().height),
    markerTransition: ms.transitionProperty,
    linkTop: curLink ? Number((curLink.getBoundingClientRect().top - body.getBoundingClientRect().top).toFixed(1)) : null,
    linkH: curLink ? Math.round(curLink.getBoundingClientRect().height) : null,
    ticketShown: ts.display !== 'none',
    ticketPosition: getComputedStyle(ticket.closest('nav')).position,
    ticketTop: Math.round(tr.top),
    ticketBottom: Math.round(tr.bottom),
    ticketText: ticket.textContent.replace(/\s+/g, ' ').trim(),
    expanded: ticket.getAttribute('aria-expanded'),
    listShown: bs.display !== 'none',
    visibleLinks: links.filter((l) => l.getBoundingClientRect().height > 0).length,
    curLinkInView: curLink ? (() => { const r = curLink.getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; })() : false,
    activeId: a?.id || null,
    activeIsTicket: a === ticket,
    headingTop: heading ? Math.round(heading.top) : null,
    announcer: document.querySelector('[data-announcer]').textContent,
    hash: location.hash,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

export function assert(r) {
  const s = (n) => r[n]?.state || {};
  const p = (n) => r[n]?.probe || {};
  const out = [];
  const t = s('top'), tp = p('top');
  out.push({ ok: t.current === -1 && tp.currents === 0 && tp.expected === -1 && tp.markerOn === false && tp.hrefsResolve, message: `top: above the first chapter nothing is current and the marker is off (current ${t.current}, ${tp.currents} aria-current); every rail href resolves` });
  for (const n of ['s25', 's50', 's80']) {
    const st = s(n), pr = p(n);
    out.push({ ok: st.current === pr.expected && pr.cur === pr.expected && pr.currents === 1 && st.current >= 0, message: `${n}: the current chapter is the one whose midpoint is nearest the centre (state ${st.current}, aria-current ${pr.cur}, measured ${pr.expected})` });
    const fills = pr.fills || [];
    const fillsOk = fills.every((f, j) => (j < pr.expected ? f === 1 : j > pr.expected ? f === 0 : Math.abs(f - pr.expectedProgress) < 0.02));
    out.push({ ok: fillsOk && pr.expectedProgress > 0 && pr.expectedProgress < 1, message: `${n}: the rules read done / ${pr.expectedProgress?.toFixed(2)} / to come (${fills.join(', ')})` });
    out.push({ ok: pr.markerOn && Math.abs(pr.markerY - pr.linkTop) <= 1 && Math.abs(pr.markerH - pr.linkH) <= 1, message: `${n}: the marker sits on the current link (y ${pr.markerY} vs ${pr.linkTop}, h ${pr.markerH} vs ${pr.linkH})` });
    out.push({ ok: st.announcements === 0 && pr.announcer === '', message: `${n}: a plain scroll announces nothing (${st.announcements} announcements)` });
  }
  const chaptersSeen = new Set(['s25', 's50', 's80'].map((n) => s(n).current));
  out.push({ ok: chaptersSeen.size === 3, message: `scroll: three positions, three different chapters (${[...chaptersSeen].join(', ')})` });
  out.push({ ok: /transform/.test(p('s50').markerTransition), message: `full tier: the marker travels (transition ${p('s50').markerTransition})` });

  const j = s('jump-key'), jp = p('jump-key');
  out.push({ ok: j.current === 4 && jp.cur === 4 && j.landed === 1 && j.jumping === null, message: `keyboard: Enter on the fifth link lands on stage 5 (current ${j.current}, landed ${j.landed})` });
  out.push({ ok: JSON.stringify(j.changes) === '[4]', message: `keyboard: the rail marked the destination at the start and passed through nothing on the way (changes ${JSON.stringify(j.changes)})` });
  out.push({ ok: jp.activeId === 'stage-5-t' && jp.headingTop >= 0 && jp.headingTop < 300, message: `keyboard: focus moved to the stage heading, in view at ${jp.headingTop}px` });
  out.push({ ok: j.announcements === 1 && jp.announcer === 'Stage 5 of 6: Along the weirs to Callow Bridge', message: `keyboard: one polite announcement ("${jp.announcer}")` });
  out.push({ ok: j.lastJumpMs >= 900 && j.lastJumpMs <= 1700 && jp.hash === '#stage-5', message: `keyboard: a glide in the full tier (${j.lastJumpMs} ms), hash ${jp.hash}` });
  const jn = s('jump-next'), jnp = p('jump-next');
  out.push({ ok: jn.current === 2 && jnp.activeId === 'stage-3-t' && /^Stage 3 of 6/.test(jnp.announcer), message: `continue link: the in-chapter link jumps the same way (current ${jn.current}, focus ${jnp.activeId})` });

  const rs = s('rm-scroll'), rsp = p('rm-scroll');
  out.push({ ok: rs.motion === 'reduced' && rs.current === rsp.expected && rsp.currents === 1 && rsp.markerTransition === 'opacity' && Math.abs(rsp.markerY - rsp.linkTop) <= 1, message: `reduced motion: the current chapter and the marker still follow the scroll, the marker cuts (transition ${rsp.markerTransition})` });
  const rj = s('rm-jump'), rjp = p('rm-jump');
  out.push({ ok: rj.current === 2 && rj.landed === 1 && rj.lastJumpMs >= 0 && rj.lastJumpMs < 100 && rjp.activeId === 'stage-3-t' && /^Stage 3 of 6/.test(rjp.announcer), message: `reduced motion: the jump is instant (${rj.lastJumpMs} ms), focus and announcement kept (${rjp.activeId}, "${rjp.announcer}")` });

  const m = s('mobile'), mp = p('mobile');
  out.push({ ok: m.narrow && mp.ticketShown && mp.ticketPosition === 'sticky' && mp.ticketTop === 0 && !mp.listShown && mp.expanded === 'false', message: `phone: the rail becomes a sticky ticket at the top (${mp.ticketPosition}, top ${mp.ticketTop}), list collapsed` });
  out.push({ ok: m.current === mp.expected && mp.ticketText.startsWith(`${m.current + 1} of 6`), message: `phone: the ticket names the current chapter ("${mp.ticketText}")` });
  const mo = s('mobile-open'), mop = p('mobile-open');
  out.push({ ok: mo.open && mop.expanded === 'true' && mop.listShown && mop.visibleLinks === 6 && mop.currents === 1 && mop.curLinkInView && mop.activeIsTicket, message: `phone: the ticket opens the same six links as a disclosure, current one in view, focus on the ticket (${mop.visibleLinks} links)` });
  const mj = s('mobile-jump'), mjp = p('mobile-jump');
  out.push({ ok: !mj.open && mjp.expanded === 'false' && mj.current === 5 && mjp.activeId === 'stage-6-t' && mjp.headingTop >= mjp.ticketBottom, message: `phone: choosing a stage closes the list and lands below the ticket (heading at ${mjp.headingTop}, ticket ends ${mjp.ticketBottom})` });
  out.push({ ok: /^Stage 6 of 6/.test(mjp.announcer) && mjp.ticketText.startsWith('6 of 6'), message: `phone: announced and the ticket follows ("${mjp.ticketText}")` });
  const me = s('mobile-escape'), mep = p('mobile-escape');
  out.push({ ok: !me.open && mep.expanded === 'false' && mep.activeIsTicket && !mep.listShown, message: 'phone: Escape closes the list and returns focus to the ticket' });
  for (const n of ['top', 's50', 'mobile', 'mobile-open', 'mobile-jump']) out.push({ ok: (p(n).overflowX ?? 1) <= 0, message: `${n}: no sideways overflow (${p(n).overflowX})` });
  return out;
}
