// Prism labels: at rest each box is only pushed back by half its height (no rotation) with its front face exactly in
// the page plane; hover and keyboard focus turn it a quarter about X on the routine band, and the copy then sits exactly
// where the label was; the letters variant staggers the turn (read from transitions paused mid-way); the copy is
// aria-hidden and every link has one accessible name; reduced motion swaps the faces by opacity with no rotation;
// touch gets a press state and no turn; forced colours show the plain label; nothing overflows on a phone.
const cell = (n) => `.bar__nav li:nth-child(${n}) .prism`;
const film = (n) => `.films__list li:nth-child(${n}) .prism`;
const pauseAt = (ms) => ({ type: 'waitFor', fn: `(() => { const a = document.getAnimations(); a.forEach((x) => { x.pause(); x.currentTime = ${ms}; }); return a.length > 0; })()` });

export const states = [
  { name: 'rest', settle: 600 },
  { name: 'hover', settle: 600, actions: [{ type: 'hover', selector: cell(2) }, { type: 'wait', ms: 800 }] },
  { name: 'leave', settle: 600, actions: [{ type: 'hover', selector: cell(2) }, { type: 'wait', ms: 300 }, { type: 'move', x: 700, y: 520, steps: 4 }, { type: 'wait', ms: 900 }] },
  { name: 'focus', settle: 600, actions: [{ type: 'focus', selector: '.bar__brand' }, { type: 'press', key: 'Tab' }, { type: 'wait', ms: 800 }] },
  { name: 'turning', settle: 600, frame: true, actions: [{ type: 'hover', selector: film(1) }, { type: 'wait', ms: 40 }, pauseAt(150)] },
  { name: 'letters', settle: 600, actions: [{ type: 'hover', selector: film(2) }, { type: 'wait', ms: 1200 }] },
  { name: 'rm-hover', reducedMotion: true, settle: 600, actions: [{ type: 'hover', selector: cell(2) }, { type: 'wait', ms: 600 }] },
  { name: 'rm-focus', reducedMotion: true, settle: 600, actions: [{ type: 'focus', selector: '.bar__brand' }, { type: 'press', key: 'Tab' }, { type: 'wait', ms: 600 }] },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: [{ type: 'hover', selector: cell(2) }, { type: 'wait', ms: 800 }] },
  { name: 'mobile-press', viewport: 'mobile', settle: 600, actions: [{ type: 'hover', selector: cell(3) }, { type: 'down' }, { type: 'wait', ms: 200 }] },
  { name: 'forced', settle: 600, actions: [{ type: 'focus', selector: '.bar__brand' }, { type: 'press', key: 'Tab' }, { type: 'wait', ms: 800 }] },
];

export function probe() {
  const turn = (el) => {
    const t = getComputedStyle(el).transform;
    const m = new DOMMatrixReadOnly(t === 'none' ? undefined : t);
    return { none: t === 'none', deg: Math.round((Math.atan2(m.m23, m.m22) * 180) / Math.PI * 10) / 10, m22: Number(m.m22.toFixed(4)), m23: Number(m.m23.toFixed(4)), m43: Number(m.m43.toFixed(2)) };
  };
  const box = (r) => ({ x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) });
  const cells = [...document.querySelectorAll('.bar__nav .prism')].map((a) => {
    const b = a.querySelector('.prism__box');
    const f = a.querySelector('.prism__face--front');
    const n = a.querySelector('.prism__face--next');
    const fs = getComputedStyle(f);
    const ns = getComputedStyle(n);
    return {
      ...turn(b),
      h: b.offsetHeight,
      depth: parseFloat(b.style.getPropertyValue('--depth')),
      link: box(a.getBoundingClientRect()),
      front: box(f.getBoundingClientRect()),
      next: box(n.getBoundingClientRect()),
      frontOpacity: fs.opacity, nextOpacity: ns.opacity,
      frontBg: fs.backgroundColor, nextBg: ns.backgroundColor, frontColor: fs.color, nextColor: ns.color,
      nextDisplay: ns.display,
      hidden: n.getAttribute('aria-hidden'),
      duration: getComputedStyle(b).transitionDuration,
      property: getComputedStyle(b).transitionProperty,
      liOpacity: getComputedStyle(a.closest('li')).opacity,
    };
  });
  const letterRow = (sel) => [...document.querySelector(sel).querySelectorAll('.prism__box')].map((b) => ({ ...turn(b), delay: getComputedStyle(b).transitionDelay }));
  const a = document.activeElement;
  return {
    cells,
    film1: letterRow('.films__list li:nth-child(1) .prism'),
    film2: letterRow('.films__list li:nth-child(2) .prism'),
    focused: a?.matches?.('.prism') ? (a.querySelector('.sr-only, .prism__face--front')?.textContent.trim() ?? null) : null,
    copies: document.querySelectorAll('.prism__face--next').length,
    hiddenCopies: document.querySelectorAll('.prism__face--next[aria-hidden="true"]').length,
    navRight: Math.round(document.querySelector('.bar__nav').getBoundingClientRect().right),
    viewport: innerWidth,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side: the accessibility tree at rest, and the forced-colours pass.
export async function inspect(page, st) {
  if (st.name === 'rest') {
    return { nav: await page.locator('.bar__nav').ariaSnapshot(), films: await page.locator('.films__list').ariaSnapshot(), footer: await page.locator('.footer__links').ariaSnapshot() };
  }
  if (st.name === 'forced') {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.waitForTimeout(300);
    return page.evaluate(() => {
      const a = document.activeElement;
      const b = a.querySelector('.prism__box');
      return { focused: a.querySelector('.prism__face--front').textContent.trim(), transform: getComputedStyle(b).transform, frontTransform: getComputedStyle(a.querySelector('.prism__face--front')).transform, nextDisplay: getComputedStyle(a.querySelector('.prism__face--next')).display, letters: [...document.querySelectorAll('.films__list .prism__box')].every((x) => getComputedStyle(x).transform === 'none') };
    });
  }
  return null;
}

export function assert(r) {
  const s = (n) => r[n]?.state || {};
  const p = (n) => r[n]?.probe || {};
  const near = (a, b, d = 1) => Math.abs(a - b) <= d;
  const sameBox = (a, b, d = 1) => a && b && near(a.x, b.x, d) && near(a.y, b.y, d) && near(a.w, b.w, d) && near(a.h, b.h, d);
  const out = [];
  const rest = p('rest');
  out.push({ ok: s('rest').turn && rest.cells.length === 4 && rest.cells.every((c) => c.deg === 0 && c.m22 === 1 && near(c.depth, c.h / 2, 0.5) && near(c.m43, -c.depth, 0.05)), message: `rest: every cell box is turned 0° and pushed back by half its height (m43 ${rest.cells.map((c) => c.m43).join(', ')}; h ${rest.cells.map((c) => c.h).join(', ')})` });
  out.push({ ok: rest.cells.every((c) => sameBox(c.front, c.link)), message: `rest: the front face lies exactly on the link's box (${JSON.stringify(rest.cells[0].front)} vs ${JSON.stringify(rest.cells[0].link)})` });
  out.push({ ok: rest.copies > 0 && rest.hiddenCopies === rest.copies && rest.cells.every((c) => c.hidden === 'true'), message: `the copy face is aria-hidden everywhere (${rest.hiddenCopies}/${rest.copies})` });
  const aria = r.rest?.inspect || {};
  const navNames = [...(aria.nav || '').matchAll(/link "([^"]*)"/g)].map((m) => m[1]);
  const filmNames = [...(aria.films || '').matchAll(/link "([^"]*)"/g)].map((m) => m[1]);
  const footNames = [...(aria.footer || '').matchAll(/link "([^"]*)"/g)].map((m) => m[1]);
  out.push({ ok: navNames.join('|') === 'Films|Studio|Journal|Contact', message: `ARIA snapshot: each nav link has its label once (${navNames.join(', ')})` });
  out.push({ ok: filmNames.join('|') === 'The Lantern Keeper|Moth Season|Paper Harbour|Seven Small Winters|The Last Kiln', message: `ARIA snapshot: letter-built links read as words, not letters (${filmNames.join(', ')})` });
  out.push({ ok: footNames.join('|') === 'Write to the studio|Showreel|Press kit', message: `ARIA snapshot: footer links single (${footNames.join(', ')})` });

  const h = p('hover').cells || [];
  out.push({ ok: h[1] && near(h[1].deg, 90, 0.5) && Math.abs(h[1].m22) < 0.01 && near(h[1].m23, 1, 0.01) && h[1].duration === '0.4s', message: `hover: the second cell's box turns a quarter about X (${h[1]?.deg}°, m22 ${h[1]?.m22}, m23 ${h[1]?.m23}) on the routine band (${h[1]?.duration})` });
  out.push({ ok: h[1] && sameBox(h[1].next, h[1].link) && h[1].front.h <= 2, message: `hover: the copy now sits exactly where the label was (${JSON.stringify(h[1]?.next)} vs ${JSON.stringify(h[1]?.link)}), the label is edge-on (${h[1]?.front.h}px)` });
  out.push({ ok: h[0]?.deg === 0 && h[0]?.liOpacity === '0.55' && h[1]?.liOpacity === '1', message: `hover: the other cells stay still and dim (${h.map((c) => c.liOpacity).join(', ')})` });
  out.push({ ok: (p('leave').cells || []).every((c) => c.deg === 0), message: `leave: the cell turns back (${(p('leave').cells || []).map((c) => c.deg).join(', ')}°)` });
  const f = p('focus');
  out.push({ ok: f.focused === 'Films' && near(f.cells?.[0]?.deg, 90, 0.5) && sameBox(f.cells[0].next, f.cells[0].link), message: `keyboard: Tab to "${f.focused}" turns it like hover (${f.cells?.[0]?.deg}°)` });

  const t = p('turning').film1 || [];
  const degs = t.map((x) => x.deg);
  const monotone = degs.every((d, i) => i === 0 || d <= degs[i - 1] + 0.1);
  out.push({ ok: degs.length === 16 && degs[0] > 20 && degs[0] < 89 && monotone && degs.at(-1) === 0 && degs.filter((d) => d > 0 && d < 89).length >= 3, message: `letters, paused at 150 ms: the turn runs across the word (${degs.join(', ')}°)` });
  out.push({ ok: t[0]?.delay === '0s' && t[1]?.delay === '0.024s' && t[5]?.delay === '0.12s', message: `letters: a 24 ms stagger per letter (${t.slice(0, 6).map((x) => x.delay).join(', ')})` });
  const l2 = p('letters').film2 || [];
  out.push({ ok: l2.length === 10 && l2.every((x) => near(x.deg, 90, 0.5)), message: `letters: every letter ends a quarter turn over (${l2.length} letters)` });

  const rh = p('rm-hover').cells || [];
  out.push({ ok: s('rm-hover').swap && !s('rm-hover').turn && rh.every((c) => c.none) && !/transform/.test(rh[1]?.property || ''), message: `reduced motion: no box is transformed and nothing transitions a transform (${rh.map((c) => (c.none ? 'none' : c.deg)).join(', ')})` });
  out.push({ ok: rh[1]?.frontOpacity === '0' && rh[1]?.nextOpacity === '1' && rh[1]?.nextBg !== rh[1]?.frontBg && sameBox(rh[1]?.next, rh[1]?.link), message: `reduced motion: hover swaps the faces in place by colour (front ${rh[1]?.frontOpacity}, copy ${rh[1]?.nextOpacity}, ${rh[1]?.nextBg} over ${rh[1]?.frontBg})` });
  const rf = p('rm-focus');
  out.push({ ok: rf.focused === 'Films' && rf.cells?.[0]?.nextOpacity === '1' && rf.cells[0].none, message: `reduced motion: keyboard focus swaps too, unturned (${rf.focused})` });

  const m = p('mobile');
  out.push({ ok: (m.cells || []).every((c) => c.deg === 0) && m.overflowX <= 0 && m.navRight <= m.viewport, message: `touch: no hover, so no turn (${(m.cells || []).map((c) => c.deg).join(', ')}°); the nav fits (${m.navRight} ≤ ${m.viewport}), no overflow` });
  const mp = p('mobile-press').cells || [];
  out.push({ ok: mp[2]?.deg === 0 && mp[2]?.frontBg === 'rgb(34, 18, 26)' && mp[2]?.frontColor !== mp[0]?.frontColor, message: `touch: a press fills the label instead (${mp[2]?.frontBg}), still unturned` });

  const fc = r.forced?.inspect || {};
  out.push({ ok: fc.focused === 'Films' && fc.transform === 'none' && fc.frontTransform === 'none' && fc.nextDisplay === 'none' && fc.letters === true, message: `forced colours: the focused cell shows its plain label (box ${fc.transform}, copy ${fc.nextDisplay}), no letter is turned` });
  return out;
}
