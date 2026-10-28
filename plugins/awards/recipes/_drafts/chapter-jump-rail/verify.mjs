// The rail marks the chapter whose midpoint is nearest the viewport centre (checked against an independent measure at
// three scroll positions), fills each rule with the reading position, answers a jump at its start and never passes
// through the chapters in between, and lands with focus on the heading (no live region speaks it a second time). A key
// or a drag mid-glide stops the glide where it is, with no landing and no flicker; a plain tap does not; a glide late
// for want of frames still lands, and one that something else replaced is let go. Reduced motion jumps instantly and
// keeps every state change. Phones get a sticky ticket that docks before its list opens, opens the same list as a
// disclosure, closes on Escape (from inside the list), an outside tap, Tab out and a jump, keeps focus on itself
// during a jump from the list, and never covers the heading it lands on.
const scrollTo = (p) => ({ type: 'waitFor', fn: `(() => { window.__awards.scrollTo(${p}); return true; })()` });
const midJump = (i) => ({ type: 'waitFor', fn: `window.__awards.state().jumping === ${i} && window.__awards.state().current === ${i}`, timeout: 3000 });
const gliding = (i) => ({ type: 'waitFor', fn: `window.__awards.state().jumping === ${i} && window.__awards.state().glideRunning`, timeout: 3000 });
// The scroll position at the moment the key goes down (capture phase, ahead of the page's own listener).
const markKey = { type: 'waitFor', fn: `(() => { addEventListener('keydown', () => { window.__keyY ??= Math.round(scrollY); }, { capture: true, once: true }); return true; })()` };
// Every frame of the next glide: how many times the page's update ran, against how many frames passed.
const sampleGlide = { type: 'waitFor', fn: `(() => { const w = window; w.__glide = { frames: 0, updates: 0 }; let last = w.__awards.state().updates; let seen = false; const f = () => { const s = w.__awards.state(); if (s.jumping !== null) { seen = true; w.__glide.frames++; w.__glide.updates += s.updates - last; } last = s.updates; if (!seen || s.jumping !== null) requestAnimationFrame(f); }; requestAnimationFrame(f); return true; })()` };
const tab = { type: 'press', key: 'Tab' };
const openTicket = [scrollTo(0.5), { type: 'wait', ms: 500 }, { type: 'click', selector: '[data-ticket]' }, { type: 'wait', ms: 400 }];
const forceTier = (t) => ({ type: 'waitFor', fn: `(() => { document.documentElement.dataset.motion = '${t}'; return true; })()` });

export const states = [
  { name: 'top', scroll: 0, settle: 800 },
  { name: 's25', scroll: 0.25, settle: 800 },
  // The explorer's frame: two stages done, the third three quarters along its rule beside its climb, three to come.
  { name: 's50', scroll: 0.5, settle: 800, frame: true },
  { name: 's80', scroll: 0.8, settle: 800 },
  // Keyboard: focus the fifth link, Enter; mid-glide the rail already marks the destination.
  { name: 'jump-key', settle: 600, actions: [{ type: 'focus', selector: '.rail__link[href="#stage-5"]' }, sampleGlide, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 150 }, midJump(4), { type: 'wait', ms: 1800 }] },
  // A scrolling key early in the glide (the expo-out curve covers most of the way in its first 400 ms) stops it there.
  { name: 'jump-cancel', settle: 600, actions: [{ type: 'focus', selector: '.rail__link[href="#stage-5"]' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 150 }, gliding(4), markKey, { type: 'press', key: 'ArrowDown' }, { type: 'wait', ms: 1800 }] },
  // Home 250 ms into a glide: the page goes to the top and the rail does not flip back and forth on the way.
  { name: 'jump-home', settle: 600, actions: [{ type: 'focus', selector: '.rail__link[href="#stage-2"]' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 250 }, gliding(1), { type: 'press', key: 'Home' }, { type: 'wait', ms: 1800 }] },
  // Frames stop mid-glide for 2.4 s (as in a background tab: Lenis' clock is frozen, timers run): the 1.8 s check
  // waits for the glide instead of letting go, and the jump still lands when frames resume.
  { name: 'jump-stall', settle: 600, actions: [{ type: 'focus', selector: '.rail__link[href="#stage-4"]' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 200 }, { type: 'waitFor', fn: `(() => { window.__raf = window.lenis.raf; window.lenis.raf = () => {}; return true; })()` }, { type: 'wait', ms: 2400 }, { type: 'waitFor', fn: `(() => { const s = window.__awards.state(); window.__stall = { jumping: s.jumping, released: s.released }; window.lenis.raf = window.__raf; return true; })()` }, { type: 'wait', ms: 800 }] },
  // Something else replaces the glide (here the test driver's own scroll): no input to cancel on, so the check lets go.
  { name: 'jump-replaced', settle: 600, actions: [{ type: 'focus', selector: '.rail__link[href="#stage-2"]' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 200 }, scrollTo(0.9), { type: 'wait', ms: 2200 }] },
  // A "continue" link inside a chapter uses the same jump.
  { name: 'jump-next', settle: 600, actions: [scrollTo(0.25), { type: 'wait', ms: 400 }, { type: 'click', selector: '#stage-2 .stage__next a' }, { type: 'wait', ms: 1900 }] },
  { name: 'rm-scroll', reducedMotion: true, scroll: 0.5, settle: 600 },
  { name: 'rm-jump', reducedMotion: true, settle: 600, actions: [{ type: 'focus', selector: '.rail__link[href="#stage-3"]' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 300 }] },
  { name: 'mobile', viewport: 'mobile', scroll: 0.5, settle: 800 },
  // On the first screen the ticket sits at the foot of the viewport: opening it docks it first.
  { name: 'mobile-top-open', viewport: 'mobile', settle: 600, actions: [{ type: 'click', selector: '[data-ticket]' }, { type: 'wait', ms: 900 }] },
  { name: 'mobile-open', viewport: 'mobile', settle: 600, actions: [...openTicket, { type: 'wait', ms: 200 }] },
  // Keyboard on the phone: Enter opens, Tab to the sixth stage, Enter; focus waits on the ticket during the glide.
  { name: 'mobile-jump', viewport: 'mobile', settle: 600, actions: [scrollTo(0.5), { type: 'wait', ms: 500 }, { type: 'focus', selector: '[data-ticket]' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 300 }, tab, tab, tab, tab, tab, tab, { type: 'press', key: 'Enter' }, { type: 'waitFor', fn: `(() => { if (window.__awards.state().jumping !== 5) return false; const a = document.activeElement; window.__glideFocus = a?.hasAttribute?.('data-ticket') ? 'ticket' : (a?.id || a?.tagName || null); return true; })()`, timeout: 3000 }, { type: 'wait', ms: 1900 }] },
  // A tap on a stage starts a glide; inspect() then drags (cancel) or taps (no cancel) with real touch events.
  { name: 'mobile-cancel', viewport: 'mobile', settle: 600, actions: [scrollTo(0.2), { type: 'wait', ms: 500 }, { type: 'click', selector: '[data-ticket]' }, { type: 'wait', ms: 400 }, { type: 'click', selector: '.rail__link[href="#stage-6"]' }, { type: 'wait', ms: 120 }] },
  { name: 'mobile-tap', viewport: 'mobile', settle: 600, actions: [scrollTo(0.2), { type: 'wait', ms: 500 }, { type: 'click', selector: '[data-ticket]' }, { type: 'wait', ms: 400 }, { type: 'click', selector: '.rail__link[href="#stage-6"]' }, { type: 'wait', ms: 120 }] },
  // Escape from inside the list (focus on the first link), not from the ticket the click left focused.
  { name: 'mobile-escape', viewport: 'mobile', settle: 600, actions: [...openTicket, tab, { type: 'waitFor', fn: `(() => { const a = document.activeElement; window.__escFrom = a?.matches?.('[data-link]') ? a.getAttribute('href') : (a?.tagName || null); return true; })()` }, { type: 'press', key: 'Escape' }, { type: 'wait', ms: 300 }] },
  { name: 'mobile-outside', viewport: 'mobile', settle: 600, actions: [...openTicket, { type: 'move', x: 378, y: 800, steps: 2 }, { type: 'down' }, { type: 'up' }, { type: 'wait', ms: 300 }] },
  { name: 'mobile-tabout', viewport: 'mobile', settle: 600, actions: [...openTicket, tab, tab, tab, tab, tab, tab, tab, { type: 'wait', ms: 400 }] },
  // A tier forced on <html> (no OS preference): the chevron and the opening list follow it too.
  { name: 'mobile-forced-reduced', viewport: 'mobile', settle: 600, actions: [forceTier('reduced'), ...openTicket.slice(0, 3), { type: 'wait', ms: 60 }] },
  { name: 'mobile-forced-static', viewport: 'mobile', settle: 600, actions: [forceTier('static'), ...openTicket.slice(0, 3), { type: 'wait', ms: 60 }] },
];

export function probe() {
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const links = [...document.querySelectorAll('[data-link]')];
  const nav = document.querySelector('[data-rail]');
  const body = document.querySelector('[data-rail-body]');
  const list = document.querySelector('[data-rail-body] ol');
  const marker = document.querySelector('[data-marker]');
  const ticket = document.querySelector('[data-ticket]');
  const chevron = ticket.querySelector('.rail__chevron');
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
  const mr = marker.getBoundingClientRect();
  const lr = list.getBoundingClientRect();
  const rtl = getComputedStyle(list).direction === 'rtl';
  const ts = getComputedStyle(ticket);
  const tr = ticket.getBoundingClientRect();
  const bs = getComputedStyle(body);
  const br = body.getBoundingClientRect();
  const cs = getComputedStyle(chevron);
  const a = document.activeElement;
  const heading = a?.matches?.('h2') ? a.getBoundingClientRect() : null;
  const hint = document.getElementById(ticket.getAttribute('aria-describedby') || '');
  return {
    expected,
    expectedProgress,
    currents: links.filter((l) => l.hasAttribute('aria-current')).length,
    cur,
    hrefsResolve: links.every((l) => !!document.querySelector(l.getAttribute('href'))),
    linkTexts: links.map((l) => l.textContent.replace(/\s+/g, ' ').trim()),
    fills: [...document.querySelectorAll('[data-fill]')].map((f) => Number(new DOMMatrixReadOnly(getComputedStyle(f).transform).a.toFixed(4))),
    markerOn: ms.opacity === '1',
    markerY: Number(mt.m42.toFixed(1)),
    markerH: Math.round(mr.height),
    markerTransition: ms.transitionProperty,
    // The marker's centre against the list's 1 px track (its inline-start border).
    markerToTrack: Number(((mr.left + mr.right) / 2 - (rtl ? lr.right - 0.5 : lr.left + 0.5)).toFixed(1)),
    linkTop: curLink ? Number((curLink.getBoundingClientRect().top - br.top).toFixed(1)) : null,
    linkH: curLink ? Math.round(curLink.getBoundingClientRect().height) : null,
    ticketShown: ts.display !== 'none',
    ticketPosition: getComputedStyle(nav).position,
    ticketTop: Math.round(tr.top),
    ticketBottom: Math.round(tr.bottom),
    ticketText: ticket.textContent.replace(/\s+/g, ' ').trim(),
    ticketHint: hint ? hint.textContent.trim() : null,
    expanded: ticket.getAttribute('aria-expanded'),
    listShown: bs.display !== 'none',
    listBottom: Math.round(br.bottom),
    listTransition: `${bs.transitionProperty} / ${bs.transitionDuration}`,
    listTranslate: bs.translate,
    chevronTransition: `${cs.transitionProperty} / ${cs.transitionDuration}`,
    visibleLinks: links.filter((l) => l.getBoundingClientRect().height > 0).length,
    linksInView: links.filter((l) => { const r = l.getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; }).length,
    curLinkInView: curLink ? (() => { const r = curLink.getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; })() : false,
    activeId: a?.id || null,
    activeHref: a?.getAttribute?.('href') ?? null,
    activeIsTicket: a === ticket,
    activeInNav: nav.contains(a),
    headingTop: heading ? Math.round(heading.top) : null,
    headingText: heading ? a.textContent.replace(/\s+/g, ' ').trim() : null,
    stageTops: rects.map((r) => Math.round(r.top)),
    liveRegions: document.querySelectorAll('[aria-live], [role="status"], [role="alert"], [role="log"]').length,
    y: Math.round(scrollY),
    keyY: window.__keyY ?? null,
    glide: window.__glide ?? null,
    glideFocus: window.__glideFocus ?? null,
    escFrom: window.__escFrom ?? null,
    stall: window.__stall ?? null,
    hash: location.hash,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Real touch input on the phone through CDP (the action list has mouse events only): a short upward drag, or a tap,
// while the glide started by the state's actions is still running.
export async function inspect(page, st) {
  if (st.name === 'mobile-cancel' || st.name === 'mobile-tap') {
    const read = () => page.evaluate(() => {
      const s = window.__awards.state();
      const a = document.activeElement;
      return {
        jumping: s.jumping, glideRunning: s.glideRunning, landed: s.landed, cancelled: s.cancelled, released: s.released, changes: s.changes,
        y: Math.round(scrollY),
        stage6Top: Math.round(document.getElementById('stage-6').getBoundingClientRect().top),
        ticketBottom: Math.round(document.querySelector('[data-ticket]').getBoundingClientRect().bottom),
        active: a?.hasAttribute?.('data-ticket') ? 'ticket' : (a?.id || a?.tagName || null),
      };
    });
    const before = await read();
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
    // x 378 is the page's right gutter: no link under the finger whatever the glide has reached.
    await touch('touchStart', [{ x: 378, y: 600 }]);
    if (st.name === 'mobile-cancel') for (let k = 1; k <= 6; k++) await touch('touchMove', [{ x: 378, y: 600 - 16 * k }]);
    await touch('touchEnd', []);
    const gesture = await read();
    await page.waitForTimeout(1900);
    const after = await read();
    await cdp.detach().catch(() => {});
    return { before, gesture, after };
  }
  if (st.name === 's25' || st.name === 'mobile') return { aria: await page.locator('[data-rail]').ariaSnapshot() };
  return null;
}

export function assert(r) {
  const s = (n) => r[n]?.state || {};
  const p = (n) => r[n]?.probe || {};
  const ins = (n) => r[n]?.inspect || {};
  const flips = (c = []) => c.some((v, k) => k >= 2 && v === c[k - 2]);
  const out = [];
  const t = s('top'), tp = p('top');
  out.push({ ok: t.current === -1 && tp.currents === 0 && tp.expected === -1 && tp.markerOn === false && tp.hrefsResolve, message: `top: above the first chapter nothing is current and the marker is off (current ${t.current}, ${tp.currents} aria-current); every rail href resolves` });
  out.push({ ok: (tp.linkTexts || []).length === 6 && tp.linkTexts.every((x, i) => new RegExp(`^Stage ${i + 1} [A-Z][a-z]+ [A-Z][a-z]+$`).test(x)), message: `no CSS: the links read as "Stage n Name" (${(tp.linkTexts || []).join(' | ')})` });
  const aria = ins('s25').aria || '';
  const ariaLinks = [...aria.matchAll(/link "([^"]+)"/g)].map((m) => m[1]);
  out.push({ ok: ariaLinks.length === 6 && ariaLinks.every((x, i) => x === tp.linkTexts?.[i]), message: `accessibility tree: the six link names match the text ("${ariaLinks.join('", "')}")` });
  for (const n of ['s25', 's50', 's80']) {
    const st = s(n), pr = p(n);
    out.push({ ok: st.current === pr.expected && pr.cur === pr.expected && pr.currents === 1 && st.current >= 0, message: `${n}: the current chapter is the one whose midpoint is nearest the centre (state ${st.current}, aria-current ${pr.cur}, measured ${pr.expected})` });
    const fills = pr.fills || [];
    const fillsOk = fills.every((f, j) => (j < pr.expected ? f === 1 : j > pr.expected ? f === 0 : Math.abs(f - pr.expectedProgress) < 0.02));
    out.push({ ok: fillsOk && pr.expectedProgress > 0 && pr.expectedProgress < 1, message: `${n}: the rules read done / ${pr.expectedProgress?.toFixed(2)} / to come (${fills.join(', ')})` });
    out.push({ ok: pr.markerOn && Math.abs(pr.markerY - pr.linkTop) <= 1 && Math.abs(pr.markerH - pr.linkH) <= 1 && Math.abs(pr.markerToTrack) <= 1.5, message: `${n}: the marker sits on the current link and on the track (y ${pr.markerY} vs ${pr.linkTop}, h ${pr.markerH} vs ${pr.linkH}, ${pr.markerToTrack} px off the track)` });
    out.push({ ok: pr.liveRegions === 0 && st.ticketWrites === 0, message: `${n}: no live region on the page (${pr.liveRegions}); the hidden ticket's rule is never written on desktop (${st.ticketWrites} writes)` });
  }
  const chaptersSeen = new Set(['s25', 's50', 's80'].map((n) => s(n).current));
  out.push({ ok: chaptersSeen.size === 3, message: `scroll: three positions, three different chapters (${[...chaptersSeen].join(', ')})` });
  out.push({ ok: /transform/.test(p('s50').markerTransition), message: `full tier: the marker travels (transition ${p('s50').markerTransition})` });

  const j = s('jump-key'), jp = p('jump-key');
  out.push({ ok: j.current === 4 && jp.cur === 4 && j.landed === 1 && j.cancelled === 0 && j.jumping === null, message: `keyboard: Enter on the fifth link lands on stage 5 (current ${j.current}, landed ${j.landed}, cancelled ${j.cancelled})` });
  out.push({ ok: JSON.stringify(j.changes) === '[4]', message: `keyboard: the rail marked the destination at the start and passed through nothing on the way (changes ${JSON.stringify(j.changes)})` });
  out.push({ ok: jp.activeId === 'stage-5-t' && jp.headingTop >= 0 && jp.headingTop < 300 && jp.headingText === 'Stage 5 Along the weirs to Callow Bridge', message: `keyboard: focus moved to the stage heading, in view at ${jp.headingTop}px ("${jp.headingText}")` });
  out.push({ ok: jp.liveRegions === 0, message: `keyboard: the focus move is the only announcement; no live region repeats it (${jp.liveRegions} live regions)` });
  out.push({ ok: j.lastJumpMs >= 900 && j.lastJumpMs <= 1700 && jp.hash === '#stage-5', message: `keyboard: a glide in the full tier (${j.lastJumpMs} ms), hash ${jp.hash}` });
  const g = jp.glide || {};
  out.push({ ok: g.frames >= 20 && g.updates / g.frames <= 1.25, message: `one update per frame during the glide (${g.updates} updates over ${g.frames} frames)` });

  const c = s('jump-cancel'), cp = p('jump-cancel');
  const s5 = cp.stageTops?.[4];
  const dest = cp.y + s5;   // where the glide was going (stage 5's top at scroll-margin 0)
  out.push({ ok: c.cancelled === 1 && c.landed === 0 && c.jumping === null && cp.hash === '', message: `cancel: ArrowDown mid-glide drops the landing (cancelled ${c.cancelled}, landed ${c.landed}, hash "${cp.hash}")` });
  // Discriminating only while the key came well before arrival: a glide left running would end at dest, 250+ px on.
  out.push({ ok: typeof cp.keyY === 'number' && dest - cp.keyY >= 250 && Math.abs(cp.y - cp.keyY) <= 120 && s5 > 100, message: `cancel: the glide stopped where the key was pressed (key at ${cp.keyY}, ${dest - cp.keyY}px short of stage 5; now ${cp.y}, stage 5 still ${s5}px down)` });
  out.push({ ok: cp.activeHref === '#stage-5' && c.changes?.[0] === 4 && !flips(c.changes) && c.changes.length <= 3, message: `cancel: focus stays on the link, the rail follows the page without flicker (changes ${JSON.stringify(c.changes)})` });
  const h = s('jump-home'), hp = p('jump-home');
  out.push({ ok: h.cancelled === 1 && h.landed === 0 && hp.y <= 2 && !flips(h.changes) && h.changes.length <= 4, message: `cancel: Home mid-glide reaches the top without the glide pulling back (y ${hp.y}, changes ${JSON.stringify(h.changes)})` });
  const sj = s('jump-stall'), sjp = p('jump-stall');
  out.push({ ok: sjp.stall?.jumping === 3 && sjp.stall?.released === 0 && sj.landed === 1 && sj.released === 0 && sj.lastJumpMs > 2400 && sjp.activeId === 'stage-4-t', message: `late glide: 2.4 s without frames the jump is still held (jumping ${sjp.stall?.jumping}, released ${sjp.stall?.released}), then lands after ${sj.lastJumpMs} ms with focus on ${sjp.activeId}` });
  const rp = s('jump-replaced'), rpp = p('jump-replaced');
  out.push({ ok: rp.released === 1 && rp.landed === 0 && rp.jumping === null && rp.current === rpp.expected && rpp.hash === '', message: `replaced glide: the check lets go and the rail follows the page again (released ${rp.released}, current ${rp.current} vs measured ${rpp.expected})` });
  const jn = s('jump-next'), jnp = p('jump-next');
  out.push({ ok: jn.current === 2 && jnp.activeId === 'stage-3-t' && jnp.hash === '#stage-3', message: `continue link: the in-chapter link jumps the same way (current ${jn.current}, focus ${jnp.activeId})` });

  const rs = s('rm-scroll'), rsp = p('rm-scroll');
  out.push({ ok: rs.motion === 'reduced' && rs.current === rsp.expected && rsp.currents === 1 && rsp.markerTransition === 'opacity' && Math.abs(rsp.markerY - rsp.linkTop) <= 1, message: `reduced motion: the current chapter and the marker still follow the scroll, the marker cuts (transition ${rsp.markerTransition})` });
  const rj = s('rm-jump'), rjp = p('rm-jump');
  out.push({ ok: rj.current === 2 && rj.landed === 1 && rj.lastJumpMs >= 0 && rj.lastJumpMs < 100 && rjp.activeId === 'stage-3-t' && rjp.hash === '#stage-3', message: `reduced motion: the jump is instant (${rj.lastJumpMs} ms), focus kept (${rjp.activeId})` });

  const m = s('mobile'), mp = p('mobile');
  out.push({ ok: m.narrow && mp.ticketShown && mp.ticketPosition === 'sticky' && mp.ticketTop === 0 && !mp.listShown && mp.expanded === 'false', message: `phone: the rail becomes a sticky ticket at the top (${mp.ticketPosition}, top ${mp.ticketTop}), list collapsed` });
  out.push({ ok: m.current === mp.expected && mp.ticketText.startsWith(`Stage ${m.current + 1} of 6`) && Math.abs(m.ticketFill - m.fills[m.current]) < 0.002, message: `phone: the ticket names the current chapter and repeats its rule ("${mp.ticketText}", ${m.ticketFill} vs ${m.fills?.[m.current]})` });
  const ticketName = (ins('mobile').aria || '').match(/button "([^"]+)"/)?.[1];
  out.push({ ok: ticketName === `Stage ${m.current + 1} of 6 ${['Harbour Gate', 'Salt Flats', 'Kestrel Ridge', 'Lowmoor Wood', 'The Weirs', 'Orrin Cairn'][m.current]}` && mp.ticketHint === 'Shows the list of all six stages', message: `phone: the ticket's name says which stage, its description what it opens ("${ticketName}", "${mp.ticketHint}")` });
  const mt = s('mobile-top-open'), mtp = p('mobile-top-open');
  out.push({ ok: mt.open && mt.docked === 1 && Math.abs(mtp.ticketTop) <= 1 && mtp.listShown && mtp.listBottom <= 844 && mtp.linksInView === 6, message: `phone, first screen: opening the ticket docks it first (top ${mtp.ticketTop}, scrolled to ${mtp.y}), the whole list on screen (ends ${mtp.listBottom}, ${mtp.linksInView} links in view)` });
  const mo = s('mobile-open'), mop = p('mobile-open');
  out.push({ ok: mo.open && mo.docked === 0 && mop.expanded === 'true' && mop.listShown && mop.visibleLinks === 6 && mop.currents === 1 && mop.curLinkInView && mop.activeIsTicket, message: `phone: the docked ticket opens the same six links as a disclosure, current one in view, focus on the ticket (${mop.visibleLinks} links)` });
  out.push({ ok: mop.markerOn && Math.abs(mop.markerToTrack) <= 1.5 && Math.abs(mop.markerY - mop.linkTop) <= 1, message: `phone: in the open list the marker rides the track (${mop.markerToTrack} px off it)` });
  out.push({ ok: /transform/.test(mop.chevronTransition) && /translate/.test(mop.listTransition), message: `phone, full tier: the chevron turns and the list drops (${mop.chevronTransition}; ${mop.listTransition})` });
  const mj = s('mobile-jump'), mjp = p('mobile-jump');
  out.push({ ok: mjp.glideFocus === 'ticket', message: `phone keyboard: during the glide from the list focus waits on the ticket, not on the page (${mjp.glideFocus})` });
  out.push({ ok: !mj.open && mjp.expanded === 'false' && mj.current === 5 && mj.landed === 1 && mjp.activeId === 'stage-6-t' && mjp.headingTop >= mjp.ticketBottom, message: `phone keyboard: Enter on a stage closes the list and lands below the ticket (heading at ${mjp.headingTop}, ticket ends ${mjp.ticketBottom})` });
  out.push({ ok: mjp.ticketText.startsWith('Stage 6 of 6'), message: `phone: the ticket follows ("${mjp.ticketText}")` });
  const mc = ins('mobile-cancel');
  out.push({ ok: mc.before?.jumping === 5 && mc.before?.glideRunning === true && p('mobile-cancel').ticketText?.startsWith('Stage 6 of 6'), message: `phone: mid-glide the ticket already names the destination ("${p('mobile-cancel').ticketText}"; glide running ${mc.before?.glideRunning})` });
  out.push({ ok: mc.after?.cancelled === 1 && mc.after?.landed === 0 && mc.after?.active === 'ticket' && mc.after?.stage6Top > mc.after?.ticketBottom + 100 && !flips(mc.after?.changes), message: `phone: a drag mid-glide hands the page back, focus on the ticket (cancelled ${mc.after?.cancelled}, landed ${mc.after?.landed}, focus ${mc.after?.active}, stage 6 at ${mc.after?.stage6Top}px, changes ${JSON.stringify(mc.after?.changes)})` });
  const mtap = ins('mobile-tap');
  out.push({ ok: mtap.before?.glideRunning === true && mtap.after?.landed === 1 && mtap.after?.cancelled === 0 && mtap.after?.active === 'stage-6-t' && JSON.stringify(mtap.after?.changes?.slice(-1)) === '[5]' && !flips(mtap.after?.changes), message: `phone: a plain tap mid-glide is not a scroll; the jump still lands (landed ${mtap.after?.landed}, focus ${mtap.after?.active}, changes ${JSON.stringify(mtap.after?.changes)})` });
  const me = s('mobile-escape'), mep = p('mobile-escape');
  out.push({ ok: mep.escFrom === '#stage-1' && !me.open && mep.expanded === 'false' && mep.activeIsTicket && !mep.listShown, message: `phone: Escape from inside the list (focus was on ${mep.escFrom}) closes it and returns focus to the ticket` });
  const mx = s('mobile-outside'), mxp = p('mobile-outside');
  out.push({ ok: !mx.open && mxp.expanded === 'false' && !mxp.listShown, message: `phone: a tap outside the list closes it (expanded ${mxp.expanded})` });
  const mtb = s('mobile-tabout'), mtbp = p('mobile-tabout');
  out.push({ ok: !mtb.open && mtbp.expanded === 'false' && !mtbp.activeInNav && !!mtbp.activeHref, message: `phone: Tab out of the list closes it (focus on ${mtbp.activeHref})` });
  const fr = p('mobile-forced-reduced'), fs = p('mobile-forced-static');
  out.push({ ok: s('mobile-forced-reduced').open && /^all \/ 0s$|^none/.test(fr.chevronTransition) && /^opacity \//.test(fr.listTransition) && fr.listTranslate === 'none', message: `forced reduced tier: the chevron cuts and the list only fades (${fr.chevronTransition}; ${fr.listTransition}; translate ${fr.listTranslate})` });
  out.push({ ok: s('mobile-forced-static').open && /\/ 0s$/.test(fs.chevronTransition) && /\/ 0s$/.test(fs.listTransition) && fs.listTranslate === 'none', message: `forced static tier: nothing in the ticket moves or fades (${fs.chevronTransition}; ${fs.listTransition}; translate ${fs.listTranslate})` });
  for (const n of ['top', 's50', 'mobile', 'mobile-top-open', 'mobile-open', 'mobile-jump']) out.push({ ok: (p(n).overflowX ?? 1) <= 0, message: `${n}: no sideways overflow (${p(n).overflowX})` });
  return out;
}
