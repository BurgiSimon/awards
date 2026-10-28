// Pins are laid out by percentage, so each pin's centre must sit on its percentage of the map box and on the point
// the SVG draws for it (its anchor, through the SVG's own viewBox scaling) to the pixel, at desktop and phone widths.
// The card opens on hover, focus and click with the list entry's own text and never covers its own pin, its focus
// halo or its name, at 1440, 1024 and 834 px and on a landscape phone (inspect() resizes the page and sweeps every
// place by pointer and by focus); where it cannot float cleanly it docks under the map, holding one height. Arrows rove
// in reading order with one tab stop, Enter toggles, Escape closes; the focus ring changes the pixels around a pin by
// 3:1 or more in every direction; a tap selects without focus and a touch scroll keeps it; the list drives the card.
const toAtlas = { type: 'waitFor', fn: "(document.querySelector('.atlas').scrollIntoView({ block: 'start' }), true)" };
const settled = [toAtlas, { type: 'wait', ms: 1300 }];   // 7 × 70 ms + 560 ms + the hand-off, then some
const viaTab = [...settled, { type: 'focus', selector: '.bar__brand' }, { type: 'press', key: 'Tab' }];
const key = (k) => ({ type: 'press', key: k });
const pause = (ms = 300) => ({ type: 'wait', ms });
// A tap the way iOS Safari delivers one to a button: touch pointer events and a click, and no focus.
const TAP = `(sel) => { const el = document.querySelector(sel); const b = el.getBoundingClientRect();
  const o = { cancelable: true, composed: true, pointerType: 'touch', isPrimary: true, pointerId: 7, clientX: b.left + b.width / 2, clientY: b.top + b.height / 2 };
  for (const t of ['pointerover', 'pointerenter', 'pointerdown', 'pointerup']) el.dispatchEvent(new PointerEvent(t, { ...o, bubbles: t !== 'pointerenter' }));
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, detail: 1, clientX: o.clientX, clientY: o.clientY }));
  for (const t of ['pointerout', 'pointerleave']) el.dispatchEvent(new PointerEvent(t, { ...o, bubbles: t !== 'pointerleave' }));
  return true; }`;
const tap = (id) => ({ type: 'waitFor', fn: `(${TAP})('.pin[data-place="${id}"]')` });
const IDS = ['well', 'light', 'sisters', 'marsh', 'bothy', 'kelp', 'beach', 'ferry'];

export const states = [
  { name: 'top', scroll: 0 },
  { name: 'enter', settle: 300, actions: [toAtlas, pause(140)] },
  { name: 'placed', settle: 300, actions: settled },
  { name: 'hover', frame: true, settle: 300, actions: [...settled, { type: 'hover', selector: '.pin[data-place="kelp"]' }, pause(400)] },
  { name: 'keyboard', settle: 300, actions: [...viaTab, pause(800)] },
  { name: 'arrows', settle: 300, actions: [...viaTab, key('ArrowRight'), key('ArrowDown'), key('ArrowRight'), pause(800)] },
  { name: 'wrap', settle: 300, actions: [...viaTab, key('ArrowLeft'), key('ArrowLeft'), pause(800)] },
  { name: 'end', settle: 300, actions: [...viaTab, key('End'), pause(800)] },
  { name: 'escape', settle: 300, actions: [...viaTab, key('ArrowRight'), pause(600), key('Escape'), pause()] },
  { name: 'card-tab', settle: 300, actions: [...viaTab, key('ArrowRight'), key('Tab'), pause(800)] },
  { name: 'card-escape', settle: 300, actions: [...viaTab, key('ArrowRight'), key('Tab'), pause(600), key('Escape'), pause()] },
  { name: 'toggle-off', settle: 300, actions: [...viaTab, pause(600), key('Enter'), pause()] },
  { name: 'toggle-on', settle: 300, actions: [...viaTab, pause(600), key('Enter'), key('Enter'), pause()] },
  { name: 'rtl', settle: 300, actions: [...settled, { type: 'waitFor', fn: "(document.documentElement.dir = 'rtl', true)" }, { type: 'focus', selector: '.pin[data-place="well"]' }, key('ArrowRight'), pause()] },
  { name: 'click', settle: 300, actions: [...settled, { type: 'click', selector: '.pin[data-place="beach"]' }, { type: 'move', x: 8, y: 8, steps: 4 }, pause(500)] },
  { name: 'outside', settle: 300, actions: [...settled, { type: 'click', selector: '.pin[data-place="beach"]' }, { type: 'move', x: 8, y: 8, steps: 4 }, pause(), { type: 'click', selector: '.atlas__caption' }, pause(500)] },
  { name: 'grace', settle: 300, actions: [...settled, { type: 'hover', selector: '.pin[data-place="kelp"]' }, pause()] },
  { name: 'list-hover', settle: 300, actions: [...settled, { type: 'hover', selector: '.place[data-place="bothy"] .place__line' }, pause()] },
  { name: 'list-click', settle: 300, actions: [...settled, { type: 'click', selector: '[data-show="sisters"]' }, { type: 'move', x: 8, y: 8, steps: 4 }, pause(500)] },
  { name: 'rm', reducedMotion: true, settle: 300, actions: [toAtlas, pause(120), { type: 'hover', selector: '.pin[data-place="kelp"]' }, pause(250)] },
  { name: 'laptop', settle: 300, actions: settled },
  { name: 'tablet', settle: 300, actions: settled },
  { name: 'landscape', settle: 300, actions: settled },
  { name: 'mobile', viewport: 'mobile', settle: 300, actions: [...settled, tap('kelp'), pause(400)] },
  { name: 'mobile-rest', viewport: 'mobile', settle: 300, actions: [toAtlas, pause(400)] },
  { name: 'mobile-scroll', viewport: 'mobile', settle: 300, actions: [...settled, tap('kelp'), pause()] },
  { name: 'mobile-show', viewport: 'mobile', settle: 300, actions: [...settled, { type: 'click', selector: '[data-show="ferry"]' }, pause(1500)] },
];

export function probe() {
  const map = document.querySelector('[data-map]');
  const m = map.getBoundingClientRect();
  const card = document.querySelector('[data-card]');
  const c = card.getBoundingClientRect();
  const centre = (el) => { const b = el.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; };
  const hit = (a, z) => a[0] < z[2] && a[2] > z[0] && a[1] < z[3] && a[3] > z[1];
  const cardBox = card.hidden ? null : [c.left, c.top, c.right, c.bottom];
  const pins = [...document.querySelectorAll('.pin')].map((pin) => {
    const cs = getComputedStyle(pin);
    const b = pin.getBoundingClientRect();
    const x = parseFloat(cs.getPropertyValue('--x')), y = parseFloat(cs.getPropertyValue('--y'));
    const at = centre(pin);
    const top = document.elementFromPoint(at[0], at[1]);
    return {
      id: pin.dataset.place,
      i: Number(cs.getPropertyValue('--i')),
      at,
      dot: centre(pin.querySelector('.pin__dot')),
      dotSize: Math.round(pin.querySelector('.pin__dot').getBoundingClientRect().width),
      num: pin.querySelector('.pin__dot').textContent,
      want: [m.left + (x / 100) * m.width, m.top + (y / 100) * m.height],
      anchor: centre(document.querySelector(`[data-anchor="${pin.dataset.place}"]`)),
      size: [Math.round(b.width), Math.round(b.height)],
      opacity: Number(cs.opacity),
      pointer: cs.pointerEvents,
      delay: parseFloat(cs.transitionDelay) * (cs.transitionDelay.endsWith('ms') ? 0.001 : 1),
      tab: pin.tabIndex,
      expanded: pin.getAttribute('aria-expanded'),
      underCard: !!cardBox && hit([at[0] - 13, at[1] - 13, at[0] + 13, at[1] + 13], cardBox),
      reachable: top?.closest('.pin') === pin,
    };
  });
  const s = window.__awards.state();
  const shown = s.shown;
  const item = shown ? document.querySelector(`.place[data-place="${shown}"]`) : null;
  const text = (el) => el?.textContent.trim() ?? null;
  const a = document.activeElement;
  // The shown pin's own zone: its 44 px target with the 6 px focus halo, and its name when the name is visible.
  let own = null;
  if (shown) {
    const pin = document.querySelector(`.pin[data-place="${shown}"]`);
    const [x, y] = centre(pin);
    const lab = pin.querySelector('.pin__label');
    const lb = lab.getBoundingClientRect();
    const ls = getComputedStyle(lab);
    const labelShown = lb.width > 2 && ls.visibility !== 'hidden' && Number(ls.opacity) > 0;
    own = { ring: !!cardBox && hit([x - 28, y - 28, x + 28, y + 28], cardBox), label: labelShown && !!cardBox && hit([lb.left, lb.top, lb.right, lb.bottom], cardBox), labelShown, top: document.elementFromPoint(x, y)?.closest('.pin') === pin };
  }
  // Colours resolved through a canvas, so color-mix() and named colours compare as sRGB.
  const rgb = (css) => { const g = new OffscreenCanvas(1, 1).getContext('2d'); g.fillStyle = css; g.fillRect(0, 0, 1, 1); return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (p, q) => { const [hi, lo] = [lum(p), lum(q)].sort((u, v) => v - u); return (hi + 0.05) / (lo + 0.05); };
  const onShow = document.querySelector('.place.is-on .place__show');
  const show = onShow ? { ratio: ratio(rgb(getComputedStyle(onShow).color), rgb(getComputedStyle(onShow.closest('.place')).backgroundColor)), rule: rgb(getComputedStyle(onShow).textDecorationColor).join(), pin: rgb(getComputedStyle(document.documentElement).getPropertyValue('--pin').trim()).join() } : null;
  const cap = document.querySelector('.atlas__caption');
  const before = getComputedStyle(document.querySelector('.place'), '::before');
  const z = (el) => Number(getComputedStyle(el).zIndex) || 0;
  return {
    vh: innerHeight,
    map: [m.left, m.top, m.right, m.bottom],
    card: cardBox,
    cardH: card.hidden ? null : Math.round(c.height),
    captionOffset: Math.round(cap.getBoundingClientRect().top - m.top),
    cardPosition: getComputedStyle(card).position,
    cardTranslate: getComputedStyle(card).translate,
    cardOpacity: Number(getComputedStyle(card).opacity),
    figurePosition: getComputedStyle(document.querySelector('[data-atlas]')).position,
    figureH: Math.round(document.querySelector('[data-atlas]').getBoundingClientRect().height),
    stack: { pins: z(document.querySelector('[data-pins]')), card: z(card) },
    cardText: { name: text(card.querySelector('[data-card-name]')), num: text(card.querySelector('[data-card-num]')), unit: text(card.querySelector('[data-card-unit]')), line: text(card.querySelector('[data-card-line]')), link: text(card.querySelector('[data-card-link]')), linkHidden: !card.querySelector('[data-card-link]').checkVisibility(), figHidden: !card.querySelector('[data-card-fig]').checkVisibility(), lineShown: card.querySelector('[data-card-line]').checkVisibility() },
    want: item ? { name: text(item.querySelector('.place__name')), num: text(item.querySelector('.place__num')), unit: text(item.querySelector('.place__unit')), line: text(item.querySelector('.place__line')), link: text(item.querySelector('.place__link')) } : null,
    pins,
    own,
    active: a?.classList.contains('pin') ? a.dataset.place : card.contains(a) ? `card:${text(a)}` : a?.tagName.toLowerCase() ?? null,
    listOn: [...document.querySelectorAll('.place.is-on')].map((li) => li.dataset.place),
    listNumber: { content: before.content, width: parseFloat(before.width) },
    show,
    chart: Object.fromEntries([['sound', '.atlas__water--sound'], ['loch', '.atlas__water--small'], ['spot', '.atlas__spot'], ['depth', '.atlas__depth'], ['note', '.atlas__note'], ['scale', '.atlas__scale']].map(([k, sel]) => { const el = document.querySelector(sel); return [k, el ? Math.round(el.getBoundingClientRect().height * 10) / 10 : null]; })),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side. Runs in the page: what the card does to one place's pin, and to the others, right now.
function measure(id) {
  const pin = document.querySelector(`.pin[data-place="${id}"]`);
  const b = pin.getBoundingClientRect();
  const x = b.left + b.width / 2, y = b.top + b.height / 2;
  const card = document.querySelector('[data-card]');
  const c = card.hidden ? null : card.getBoundingClientRect();
  const hit = (a, z) => !!z && a[0] < z.right && a[2] > z.left && a[1] < z.bottom && a[3] > z.top;
  const lab = pin.querySelector('.pin__label').getBoundingClientRect();
  const ls = getComputedStyle(pin.querySelector('.pin__label'));
  const labelShown = lab.width > 2 && ls.visibility !== 'hidden' && Number(ls.opacity) > 0;
  const s = window.__awards.state();
  const covered = [...document.querySelectorAll('.pin')].filter((q) => q !== pin).map((q) => {
    const qb = q.getBoundingClientRect(); const qx = qb.left + qb.width / 2, qy = qb.top + qb.height / 2;
    return hit([qx - 13, qy - 13, qx + 13, qy + 13], c) ? { id: q.dataset.place, top: document.elementFromPoint(qx, qy)?.closest('.pin') === q } : null;
  }).filter(Boolean);
  return { id, shown: s.shown, side: s.side, ring: hit([x - 28, y - 28, x + 28, y + 28], c), label: labelShown && hit([lab.left, lab.top, lab.right, lab.bottom], c), top: document.elementFromPoint(x, y)?.closest('.pin') === pin, covered };
}

// Every place by pointer and by keyboard focus at the page's current size, then a pointer path across the map.
async function sweep(page, size) {
  if (size) await page.setViewportSize(size);
  await page.evaluate(() => document.querySelector('.atlas').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(400);
  const centre = (id) => page.evaluate((id) => { const pin = document.querySelector(`.pin[data-place="${id}"]`); pin.scrollIntoView({ block: 'nearest' }); const b = pin.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; }, id);
  // Between places: pointer off the map, focus dropped, Escape for whatever is still open (quicker than the grace).
  const rest = async () => { await page.mouse.move(2, 2); await page.evaluate(() => document.activeElement?.blur()); await page.keyboard.press('Escape'); await page.waitForTimeout(40); };
  const rows = [];
  for (const id of IDS) {
    await rest();
    const [x, y] = await centre(id);
    await page.mouse.move(x, y, { steps: 2 });
    await page.waitForTimeout(120);
    rows.push({ how: 'pointer', ...(await page.evaluate(measure, id)) });
    await rest();
    await page.focus(`.pin[data-place="${id}"]`);
    await page.waitForTimeout(220);
    rows.push({ how: 'focus', ...(await page.evaluate(measure, id)) });
  }
  await rest();
  await page.evaluate(() => document.querySelector('.atlas').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(200);
  const from = await centre('light'), to = await centre('kelp');
  await page.mouse.move(from[0], from[1]);
  await page.waitForTimeout(250);
  await page.mouse.move(to[0], to[1], { steps: 25 });
  await page.waitForTimeout(400);
  const path = await page.evaluate(() => window.__awards.state().shown);
  // With nothing open: which names show, whether any two (or a name and another pin's dot) touch, and the names
  // assistive technology reads, which must not depend on what shows.
  await rest();
  await page.waitForTimeout(250);
  const names = await page.evaluate(() => {
    const pins = [...document.querySelectorAll('.pin')];
    const box = (el) => { const b = el.getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom]; };
    const hit = (a, z) => a[0] < z[2] && a[2] > z[0] && a[1] < z[3] && a[3] > z[1];
    const shown = pins.filter((p) => { const l = p.querySelector('.pin__label'); const s = getComputedStyle(l); return l.getBoundingClientRect().width > 2 && Number(s.opacity) > 0 && s.visibility !== 'hidden'; });
    const clash = [];
    for (const [i, p] of shown.entries()) {
      const lb = box(p.querySelector('.pin__label'));
      for (const q of shown.slice(i + 1)) if (hit(lb, box(q.querySelector('.pin__label')))) clash.push(`${p.dataset.place}/${q.dataset.place}`);
      for (const q of pins) if (q !== p && hit(lb, box(q.querySelector('.pin__dot')))) clash.push(`${p.dataset.place}/${q.dataset.place} dot`);
    }
    return { shown: shown.map((p) => p.dataset.place), clash };
  });
  const aria = await page.locator('[data-pins]').ariaSnapshot();
  const s = await page.evaluate(() => ({ ...window.__awards.state(), mapW: Math.round(document.querySelector('[data-map]').getBoundingClientRect().width), figureH: Math.round(document.querySelector('[data-atlas]').getBoundingClientRect().height), figurePos: getComputedStyle(document.querySelector('[data-atlas]')).position, vh: innerHeight, vw: innerWidth }));
  return { size: `${s.vw}×${s.vh}`, mapW: s.mapW, dock: s.docked, tall: s.tall, figureH: s.figureH, figurePos: s.figurePos, vh: s.vh, path, rows, names, aria };
}

// The focus ring, as pixels: the pin focused, then blurred, compared along 36 rays from its centre (21 to 30 px out).
// Names are hidden for both shots (a focused name steps out of the ring's way, so it would move between them): what is
// judged is the ring against the chart around the pin, in every direction.
async function ring(page) {
  const c = await page.evaluate(() => { const b = document.activeElement.getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2), id: document.activeElement.dataset.place }; });
  const clip = { x: c.x - 36, y: c.y - 36, width: 72, height: 72 };
  const quiet = await page.addStyleTag({ content: '.pin__label { opacity: 0 !important }' });
  await page.waitForTimeout(80);
  const on = await page.screenshot({ clip });
  await page.evaluate(() => document.activeElement.blur());
  await page.waitForTimeout(80);
  const off = await page.screenshot({ clip });
  await quiet.evaluate((el) => el.remove());
  await page.focus(`.pin[data-place="${c.id}"]`);
  const rays = await page.evaluate(async ([a64, b64]) => {
    const read = async (b64) => { const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob()); const cv = new OffscreenCanvas(72, 72); const g = cv.getContext('2d'); g.drawImage(bmp, 0, 0); return g.getImageData(0, 0, 72, 72).data; };
    const [A, B] = [await read(a64), await read(b64)];
    const lum = (d, i) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(d[i]) + 0.7152 * f(d[i + 1]) + 0.0722 * f(d[i + 2]); };
    const out = [];
    for (let k = 0; k < 36; k++) {
      const t = (k / 36) * Math.PI * 2;
      let best = 1;
      for (let r = 21; r <= 30; r += 0.5) {
        const px = Math.round(36 + r * Math.cos(t)), py = Math.round(36 + r * Math.sin(t)), i = (py * 72 + px) * 4;
        const [hi, lo] = [lum(A, i), lum(B, i)].sort((u, v) => v - u);
        best = Math.max(best, (hi + 0.05) / (lo + 0.05));
      }
      out.push({ deg: k * 10, ratio: Math.round(best * 100) / 100 });
    }
    return out;
  }, [on.toString('base64'), off.toString('base64')]);
  return { id: c.id, rays };
}

export async function inspect(page, st) {
  if (st.name === 'keyboard') return { aria: await page.locator('[data-pins]').ariaSnapshot() };
  if (st.name === 'escape') return ring(page);
  if (st.name === 'placed') { const r = await sweep(page); await page.mouse.move(2, 2); await page.waitForTimeout(400); return r; }
  if (st.name === 'laptop') { const r = await sweep(page, { width: 1024, height: 768 }); await page.focus('.pin[data-place="bothy"]'); await page.waitForTimeout(200); return r; }
  if (st.name === 'tablet') { const r = await sweep(page, { width: 834, height: 1112 }); await page.focus('.pin[data-place="marsh"]'); await page.waitForTimeout(200); return r; }
  if (st.name === 'landscape') { const r = await sweep(page, { width: 844, height: 390 }); await page.focus('.pin[data-place="kelp"]'); await page.waitForTimeout(200); return r; }
  if (st.name === 'grace') {
    // The pointer is on Kelp Store: move into its card, past the 140 ms grace, then out over open water.
    const g = await page.evaluate(() => { const p = document.querySelector('.pin[data-place="kelp"]').getBoundingClientRect(); const c = document.querySelector('[data-card]').getBoundingClientRect(); const m = document.querySelector('[data-map]').getBoundingClientRect(); return { from: [p.left + p.width / 2, p.top + p.height / 2], to: [c.left + c.width / 2, c.top + c.height / 2], sea: [m.right - 8, m.bottom - 8] }; });
    await page.mouse.move(g.from[0], g.from[1]);
    await page.mouse.move(g.to[0], g.to[1], { steps: 6 });
    await page.waitForTimeout(300);
    const held = await page.evaluate(() => { const a = document.querySelector('[data-card-link]'); const b = a.getBoundingClientRect(); return { shown: window.__awards.state().shown, link: document.elementFromPoint(b.left + 8, b.top + b.height / 2) === a }; });
    await page.mouse.move(g.sea[0], g.sea[1], { steps: 4 });
    await page.waitForTimeout(450);
    const gone = await page.evaluate(() => ({ shown: window.__awards.state().shown, hidden: document.querySelector('[data-card]').hidden }));
    await page.mouse.move(g.from[0], g.from[1]);
    await page.mouse.move(g.to[0], g.to[1], { steps: 6 });
    await page.waitForTimeout(300);
    return { held, gone };
  }
  if (st.name === 'mobile-rest') {
    // Tap through every place without focus, the way iOS delivers a tap: the docked card and the caption hold still.
    const heights = [];
    for (const id of IDS) {
      await page.evaluate(([fn, sel]) => (0, eval)(fn)(sel), [TAP, `.pin[data-place="${id}"]`]);
      await page.waitForTimeout(80);
      heights.push(await page.evaluate(() => { const c = document.querySelector('[data-card]').getBoundingClientRect(); const m = document.querySelector('[data-map]').getBoundingClientRect(); return { shown: window.__awards.state().shown, card: Math.round(c.height), caption: Math.round(document.querySelector('.atlas__caption').getBoundingClientRect().top - m.top) }; }));
    }
    // A second tap on the chosen pin lets it go, back to the prompt.
    await page.evaluate(([fn, sel]) => (0, eval)(fn)(sel), [TAP, '.pin[data-place="ferry"]']);
    await page.waitForTimeout(120);
    const after = await page.evaluate(() => ({ shown: window.__awards.state().shown, selected: window.__awards.state().selected, name: document.querySelector('[data-card-name]').textContent, expanded: document.querySelector('.pin[data-place="ferry"]').getAttribute('aria-expanded') }));
    return { heights, after };
  }
  if (st.name === 'mobile-scroll') {
    // A real touch drag that starts on the map, as a scroll past it would: the chosen place must survive it.
    const pt = await page.evaluate(() => { const r = document.querySelector('[data-map]').getBoundingClientRect(); return [Math.round(r.left + r.width * 0.9), Math.round(r.top + r.height * 0.9)]; });
    const y0 = await page.evaluate(() => scrollY);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pt[0], y: pt[1] }] });
    for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: pt[0], y: pt[1] - i * 12 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(500);
    return page.evaluate((y0) => { const s = window.__awards.state(); return { selected: s.selected, shown: s.shown, focus: s.focus, name: document.querySelector('[data-card-name]').textContent, scrolled: Math.round(scrollY - y0) }; }, y0);
  }
  return null;
}

const NAMES = { well: 'North Well', light: 'Skerrow Head light', sisters: 'The Sisters', marsh: 'Marsh hide', bothy: 'West Cove bothy', kelp: 'Kelp Store', beach: 'Shell Beach', ferry: 'Ferry slip' };

export function assert(r) {
  const S = (n) => r[n]?.state || {};
  const P = (n) => r[n]?.probe || {};
  const I = (n) => r[n]?.inspect || {};
  const out = [];
  const err = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const inside = (p) => !!p.card && p.card[0] >= p.map[0] - 0.5 && p.card[1] >= p.map[1] - 0.5 && p.card[2] <= p.map[2] + 0.5 && p.card[3] <= p.map[3] + 0.5;
  const onScreen = (p) => !!p.card && p.card[1] >= -0.5 && p.card[3] <= p.vh + 0.5;
  const clear = (p) => !!p.own && !p.own.ring && !p.own.label && p.own.top;
  const sameText = (p) => !!p.want && ['name', 'num', 'unit', 'line', 'link'].every((k) => p.cardText[k] === p.want[k]);
  const fmt = (v) => v.map((n) => Math.round(n * 10) / 10).join(', ');

  // Positions at two widths: percentage of the map box, and the SVG's own point for the place, both within a pixel.
  for (const n of ['placed', 'mobile']) {
    const pins = P(n).pins || [];
    const worstPct = Math.max(...pins.map((p) => err(p.at, p.want)));
    const worstAnchor = Math.max(...pins.map((p) => err(p.at, p.anchor)));
    const worstDot = Math.max(...pins.map((p) => err(p.dot, p.at)));
    const w = P(n).map ? Math.round(P(n).map[2] - P(n).map[0]) : 0;
    out.push({ ok: pins.length === 8 && worstPct <= 1, message: `${n}: all 8 pins sit on their percentage of the ${w} px map (worst ${worstPct.toFixed(2)} px)` });
    out.push({ ok: pins.length === 8 && worstAnchor <= 1 && worstDot <= 0.5, message: `${n}: each pin is centred on the point the SVG draws for it (worst ${worstAnchor.toFixed(2)} px; dot off its pin by ${worstDot.toFixed(2)} px)` });
    out.push({ ok: pins.every((p) => p.size[0] >= 44 && p.size[1] >= 44), message: `${n}: every pin is a 44 px target or more (${[...new Set(pins.map((p) => p.size.join('×')))].join(', ')})` });
  }
  const order = S('placed').order || [];
  out.push({ ok: order.join() === 'well,light,sisters,marsh,bothy,kelp,beach,ferry' && (P('placed').pins || []).every((p, i) => p.i === i), message: `reading order: rows top to bottom, each left to right, in the DOM too (${order.join(' → ')})` });
  out.push({ ok: (S('placed').numbers || []).join() === '1,2,3,4,5,6,7,8' && (P('placed').pins || []).every((p, i) => p.num === String(i + 1)), message: `pins carry the numbers of their list entries, 1 to 8 in reading order (${(S('placed').numbers || []).join(' ')})` });

  // Entrance: staggered on the full tier, in reading order; waiting pins take no pointer.
  const top = P('top').pins || [];
  out.push({ ok: S('top').enter === 'pending' && top.every((p) => p.opacity === 0 && p.pointer === 'none'), message: `top: the map is not yet a third in view, so its pins wait, unseen and unpointable (enter ${S('top').enter}, opacities ${[...new Set(top.map((p) => p.opacity))].join(', ')}, pointer-events ${[...new Set(top.map((p) => p.pointer))].join(', ')})` });
  const en = [...(P('enter').pins || [])].sort((a, b) => a.i - b.i);
  const delays = en.map((p) => Math.round(p.delay * 1000));
  out.push({ ok: S('enter').enter === 'in' && en.length === 8 && delays.every((d, i) => d === i * 70), message: `enter: pins stagger by 70 ms in reading order (delays ${delays.join(', ')} ms)` });
  out.push({ ok: en.length === 8 && en[0].opacity > 0.05 && en[7].opacity === 0 && en[0].opacity >= en[3].opacity && en[3].opacity >= en[7].opacity, message: `enter: 140 ms in, the first pin is arriving and the last has not started (opacity ${en.map((p) => p.opacity.toFixed(2)).join(', ')})` });
  out.push({ ok: S('placed').enter === 'done' && (P('placed').pins || []).every((p) => p.opacity === 1 && p.delay === 0 && p.pointer === 'auto'), message: `placed: entrance over, every pin opaque, pointable and its delay cleared (${S('placed').enter})` });

  // Placement, swept by pointer and by focus for every place, at four sizes. The card never covers its own pin (the
  // 44 px target and its 6 px focus halo), nor its visible name, and the pin stays the topmost element at its centre.
  // Any other pin a card covers stays reachable above it. Where floating would fail, the card docks.
  const SIZES = { placed: '1440×900', laptop: '1024×768', tablet: '834×1112', landscape: '844×390' };
  for (const [n, size] of Object.entries(SIZES)) {
    const w = I(n);
    const rows = w.rows || [];
    const bad = rows.filter((x) => x.shown !== x.id || x.ring || x.label || !x.top).map((x) => `${x.id}/${x.how}${x.shown !== x.id ? ` shows ${x.shown}` : ''}${x.ring ? ' ring' : ''}${x.label ? ' name' : ''}${!x.top ? ' buried' : ''}`);
    out.push({ ok: w.size === size && rows.length === 16 && bad.length === 0, message: `${size}: every card, by pointer and by focus, leaves its own pin, halo and name uncovered (${rows.length} checks, ${w.dock ? 'docked' : 'floating'}, map ${w.mapW} px${bad.length ? `; failing ${bad.join(', ')}` : ''})` });
    const covering = rows.filter((x) => x.how === 'focus' && x.covered.length).map((x) => `${x.id}→${x.covered.map((c) => c.id)}`);
    const buried = rows.flatMap((x) => x.covered.filter((c) => !c.top).map((c) => `${c.id} under ${x.id}`));
    out.push({ ok: buried.length === 0 && covering.length <= 2 && rows.every((x) => x.covered.length <= 1), message: `${size}: other pins a card covers stay reachable above it, and at most 2 of 8 cards cover one (${covering.length ? covering.join(', ') : 'none covered'}${buried.length ? `; buried ${buried.join(', ')}` : ''})` });
    out.push({ ok: w.path === 'kelp', message: `${size}: a pointer moving from Skerrow Head light to Kelp Store in 25 steps ends on Kelp Store (${w.path})` });
    const nm = w.names || {};
    const read = Object.values(NAMES).filter((x) => (w.aria || '').includes(`button "${x}`)).length;
    out.push({ ok: !!nm.shown && (nm.clash || []).length === 0 && read === 8, message: `${size}: the names that show never touch each other or another pin (${nm.shown?.length ?? 0} of 8 shown${nm.clash?.length ? `; clash ${nm.clash.join(', ')}` : ''}), and all 8 buttons keep their names for assistive technology (${read})` });
  }
  const lap = I('laptop'), tab = I('tablet'), land = I('landscape'), wide = I('placed');
  out.push({ ok: wide.dock === false, message: `1440×900: the ${wide.mapW} px map has room, so the card floats beside its pin (${wide.dock ? 'docked' : 'floating'})` });
  out.push({ ok: lap.dock === true && tab.dock === true && land.dock === true, message: `1024, 834 and 844 px: a card that could not float cleanly docks under the map (${[lap, tab, land].map((w) => `${w.size} ${w.dock ? 'docked' : 'floating'}`).join(', ')})` });
  out.push({ ok: [lap, tab].every((w) => w.figurePos === 'sticky' && w.figureH <= w.vh - 48 + 1) && land.figurePos === 'relative' && land.tall === true, message: `docked beside the list, the sticky figure still fits the screen (${lap.figureH}/${lap.vh}, ${tab.figureH}/${tab.vh} px); on a landscape phone it scrolls instead (${land.figurePos})` });
  out.push({ ok: P('placed').stack?.pins > P('placed').stack?.card, message: `the pins layer stacks above the card, so no card can bury a pin (z ${P('placed').stack?.pins} over ${P('placed').stack?.card})` });

  // Hover: the card opens with the list entry's text, beside the pin, inside the map, without the sentence.
  const h = P('hover');
  out.push({ ok: S('hover').shown === 'kelp' && sameText(h), message: `hover: the card shows the Kelp Store from its list entry ("${h.cardText?.name}", ${h.cardText?.num} ${h.cardText?.unit}, "${h.cardText?.link}")` });
  out.push({ ok: inside(h) && clear(h) && (S('hover').covers || []).length === 0 && h.cardText?.lineShown === false, message: `hover: the card sits ${S('hover').side} its pin inside the map, clear of the pin, its name and every other pin, with name, figure and action only (card ${fmt(h.card || [])} in map ${fmt(h.map || [])})` });

  // Grace: the pointer can travel from the pin into the card and use it; leaving over open water closes it.
  const g = I('grace');
  out.push({ ok: g.held?.shown === 'kelp' && g.held?.link === true && g.gone?.shown === null && g.gone?.hidden === true, message: `grace: the card holds while the pointer crosses into it and its link is under the pointer (${g.held?.shown}, link ${g.held?.link}); over open water it closes (${g.gone?.shown}, hidden ${g.gone?.hidden})` });

  // Keyboard: Tab lands on the group's one stop, opens the card on focus and brings all of it on screen.
  const k = P('keyboard');
  out.push({ ok: k.active === 'well' && S('keyboard').shown === 'well' && sameText(k), message: `keyboard: Tab focuses the first pin and its card opens (${k.active}, "${k.cardText?.name}", ${k.cardText?.num} ${k.cardText?.unit})` });
  out.push({ ok: inside(k) && clear(k) && S('keyboard').side !== 'above' && onScreen(k), message: `keyboard: a pin near the top edge puts its card ${S('keyboard').side}, inside the map, and the whole card is on screen (card ${fmt((k.card || []).filter((_, i) => i % 2))} of ${k.vh} px)` });
  out.push({ ok: (k.pins || []).filter((p) => p.tab === 0).map((p) => p.id).join() === 'well' && (k.pins || []).filter((p) => p.expanded === 'true').length === 1, message: `keyboard: one pin in the tab order and one expanded (${(k.pins || []).filter((p) => p.tab === 0).map((p) => p.id)})` });
  const aria = r.keyboard?.inspect?.aria || '';
  const named = Object.values(NAMES).every((nm) => aria.includes(`button "${nm}`));
  out.push({ ok: /group "Places on the map"/.test(aria) && named, message: `keyboard: a group named "Places on the map" holding 8 named buttons (${named ? 'all named' : aria.slice(0, 120)})` });

  const ar = P('arrows');
  out.push({ ok: ar.active === 'marsh' && S('arrows').shown === 'marsh' && S('arrows').current === 'marsh' && sameText(ar) && inside(ar) && clear(ar) && (ar.pins || []).filter((p) => p.tab === 0).map((p) => p.id).join() === 'marsh', message: `arrows: →, ↓, → rove to the fourth pin in reading order with the tab stop and the card (${ar.active}, "${ar.cardText?.name}")` });
  out.push({ ok: P('wrap').active === 'beach' && S('wrap').shown === 'beach', message: `arrows: ← from the first pin wraps to the last, ← again steps back (${P('wrap').active})` });
  out.push({ ok: P('rtl').active === 'light' && S('rtl').shown === 'light', message: `right to left: → still moves to the next pin, because the map does not mirror (${P('rtl').active})` });
  const e = P('end');
  out.push({ ok: e.active === 'ferry' && S('end').shown === 'ferry' && inside(e) && clear(e) && S('end').side !== 'below', message: `End: the last pin, its card ${S('end').side} it (it cannot go below at the bottom edge), inside the map` });
  const esc = P('escape');
  out.push({ ok: esc.active === 'light' && S('escape').shown === null && esc.card === null && (esc.pins || []).every((p) => p.expanded === 'false'), message: `Escape: the card closes, focus stays on its pin (${esc.active}, card ${esc.card ? 'open' : 'closed'})` });
  const rays = I('escape').rays || [];
  const weakest = rays.length ? Math.min(...rays.map((x) => x.ratio)) : 0;
  out.push({ ok: I('escape').id === 'light' && rays.length === 36 && weakest >= 3, message: `focus ring: around the focused pin each of 36 directions changes by 3:1 or more against the unfocused chart (weakest ${weakest.toFixed(2)}:1 at ${rays.find((x) => x.ratio === weakest)?.deg ?? '–'}°)` });
  const ct = P('card-tab');
  out.push({ ok: ct.active === 'card:Climbing times' && S('card-tab').shown === 'light' && inside(ct), message: `Tab from a pin reaches the card's action and the card holds (${ct.active})` });
  const ce = P('card-escape');
  out.push({ ok: ce.active === 'light' && S('card-escape').shown === null && ce.card === null, message: `Escape inside the card closes it and returns focus to its pin (${ce.active})` });
  const toff = P('toggle-off'), ton = P('toggle-on');
  out.push({ ok: toff.active === 'well' && S('toggle-off').shown === null && toff.card === null && toff.pins?.find((p) => p.id === 'well')?.expanded === 'false', message: `Enter on the focused pin closes its open card: aria-expanded is false (${toff.pins?.find((p) => p.id === 'well')?.expanded})` });
  out.push({ ok: ton.active === 'well' && S('toggle-on').shown === 'well' && S('toggle-on').selected === 'well' && ton.pins?.find((p) => p.id === 'well')?.expanded === 'true', message: `Enter again opens it and keeps it chosen: aria-expanded is true (${ton.pins?.find((p) => p.id === 'well')?.expanded}, selected ${S('toggle-on').selected})` });

  // Click: the card stays for the clicked pin after the pointer has gone; a click elsewhere lets it go.
  const cl = P('click');
  out.push({ ok: S('click').selected === 'beach' && S('click').hover === null && S('click').shown === 'beach' && sameText(cl) && inside(cl) && clear(cl) && (cl.pins || []).every((p) => !p.underCard || p.reachable), message: `click: Shell Beach stays open after the pointer leaves, every pin still reachable (selected ${S('click').selected}, hover ${S('click').hover})` });
  out.push({ ok: S('outside').selected === null && S('outside').shown === null && P('outside').card === null, message: `outside: a click on the caption lets go of the chosen place and the card closes (selected ${S('outside').selected})` });

  // The list drives the map.
  const lh = P('list-hover');
  out.push({ ok: S('list-hover').shown === 'bothy' && (lh.pins || []).find((p) => p.id === 'bothy')?.expanded === 'true' && lh.listOn?.join() === 'bothy' && sameText(lh), message: `list → map: pointing at a list entry opens its pin's card (${S('list-hover').shown}, list ${lh.listOn})` });
  const lc = S('list-click'), lcp = P('list-click');
  out.push({ ok: lc.selected === 'sisters' && lc.shown === 'sisters' && lc.status === 'The Sisters shown on the map.' && sameText(lcp), message: `list → map: Show on map selects the place and says so ("${lc.status}")` });
  out.push({ ok: !!lcp.show && lcp.show.ratio >= 4.5 && lcp.show.rule === lcp.show.pin, message: `list: the open row's Show on map keeps 4.5:1 or more (${lcp.show?.ratio.toFixed(2)}:1) and is marked by a vermilion rule (${lcp.show?.rule})` });
  out.push({ ok: /counter\(place\)/.test(lcp.listNumber?.content || '') && lcp.listNumber?.width >= 20, message: `list: every entry shows its number in a disc beside the name (${lcp.listNumber?.content}, ${lcp.listNumber?.width} px)` });

  // Reduced motion: no stagger, no movement; the card still answers.
  const rm = P('rm');
  out.push({ ok: S('rm').motion === 'reduced' && S('rm').enter === 'done' && (rm.pins || []).every((p) => p.opacity === 1 && p.delay === 0), message: `reduced motion: every pin is in place at once, no stagger (enter ${S('rm').enter}, delays ${[...new Set((rm.pins || []).map((p) => p.delay))].join(', ')})` });
  out.push({ ok: S('rm').shown === 'kelp' && rm.cardTranslate === 'none' && rm.cardOpacity === 1, message: `reduced motion: the card opens without travelling (translate ${rm.cardTranslate}, opacity ${rm.cardOpacity})` });

  // Phone: a tap selects without focus or hover; the card docks under the map at its width and one reserved height.
  const mo = P('mobile'), ms = S('mobile');
  out.push({ ok: ms.docked && ms.shown === 'kelp' && ms.selected === 'kelp' && ms.hover === null && ms.focus === null && sameText(mo) && mo.cardText?.lineShown === true, message: `phone: a tap (touch pointer, no focus) selects the Kelp Store and only that holds the card (selected ${ms.selected}, hover ${ms.hover}, focus ${ms.focus}), sentence included` });
  out.push({ ok: mo.cardPosition === 'relative' && !!mo.card && mo.card[1] >= mo.map[3] - 0.5 && Math.abs(mo.card[0] - mo.map[0]) <= 0.5 && Math.abs(mo.card[2] - mo.map[2]) <= 0.5 && mo.cardH === ms.reserve, message: `phone: the card docks under the map at its width, at the reserved height (top ${Math.round(mo.card?.[1] ?? 0)} ≥ map bottom ${Math.round(mo.map?.[3] ?? 0)}; ${mo.cardH} = ${ms.reserve} px)` });
  out.push({ ok: (mo.pins || []).every((p) => /^[1-8]$/.test(p.num) && p.dotSize >= 22), message: `phone: the pins keep their numbers, keyed to the list, in ${[...new Set((mo.pins || []).map((p) => p.dotSize))].join(', ')} px discs` });
  out.push({ ok: mo.chart?.sound >= 12 && mo.chart?.loch >= 12 && mo.chart?.spot >= 12 && mo.chart?.depth === 0 && mo.chart?.note === 0 && mo.chart?.scale === 0, message: `phone: chart names render at 12 px or more (sound ${mo.chart?.sound}, loch ${mo.chart?.loch}, spot ${mo.chart?.spot}); soundings, note and scale bar give way` });
  const mr = P('mobile-rest'), taps = I('mobile-rest');
  out.push({ ok: S('mobile-rest').docked && mr.card !== null && mr.cardText?.linkHidden === true && mr.cardText?.figHidden === true && /Choose a pin/.test(mr.cardText?.name || '') && mr.cardH === S('mobile-rest').reserve && mr.card[1] >= 0 && mr.card[3] <= mr.vh, message: `phone: with nothing chosen the docked card holds its place with a prompt, on screen ("${mr.cardText?.name}", ${mr.cardH} px)` });
  const hs = taps.heights || [];
  out.push({ ok: hs.length === 8 && hs.every((x, i) => x.shown === IDS[i] && x.card === mr.cardH && x.caption === mr.captionOffset), message: `phone: tapping all 8 places never moves what is below (card ${[...new Set(hs.map((x) => x.card))].join('/')} px vs ${mr.cardH} at rest; caption ${[...new Set(hs.map((x) => x.caption))].join('/')} vs ${mr.captionOffset} px below the map top)` });
  out.push({ ok: taps.after?.shown === null && taps.after?.selected === null && taps.after?.expanded === 'false' && /Choose a pin/.test(taps.after?.name || ''), message: `phone: a second tap on the chosen pin lets it go (shown ${taps.after?.shown}, aria-expanded ${taps.after?.expanded})` });
  const sc = I('mobile-scroll');
  out.push({ ok: sc.selected === 'kelp' && sc.shown === 'kelp' && sc.focus === null && sc.name === 'Kelp Store' && sc.scrolled > 20, message: `phone: a touch scroll that starts on the map keeps the chosen place (scrolled ${sc.scrolled} px; selected ${sc.selected}, card "${sc.name}")` });
  const sh = P('mobile-show');
  out.push({ ok: S('mobile-show').selected === 'ferry' && !!sh.map && sh.map[1] >= -1 && sh.map[1] <= sh.vh * 0.6 && !!sh.card && sh.card[3] <= sh.vh + 0.5 && sameText(sh), message: `phone: Show on map from the foot of the list brings the map and its card into view (map top ${Math.round(sh.map?.[1] ?? 0)}, card bottom ${Math.round(sh.card?.[3] ?? 0)} of ${sh.vh} px)` });
  for (const n of ['mobile', 'mobile-rest', 'placed']) out.push({ ok: (P(n).overflowX ?? 1) <= 0, message: `${n}: no sideways overflow (${P(n).overflowX} px)` });
  return out;
}
