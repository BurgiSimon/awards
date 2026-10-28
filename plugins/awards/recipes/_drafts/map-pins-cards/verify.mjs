// Pins are laid out by percentage, so each pin's centre must sit on its percentage of the map box and on the point
// the SVG draws for it (its anchor, through the SVG's own viewBox scaling) to the pixel, at desktop and phone widths.
// The card opens on hover, focus and click with the list entry's own text and stays inside the map; arrows rove in
// reading order with one tab stop; Escape closes from a pin or from inside the card; the list drives the same card;
// the entrance staggers in reading order on the full tier only; phones dock the card under the map.
const toAtlas = { type: 'waitFor', fn: "(document.querySelector('.atlas').scrollIntoView({ block: 'start' }), true)" };
const settled = [toAtlas, { type: 'wait', ms: 1300 }];   // 7 × 70 ms + 560 ms + the hand-off, then some
const viaTab = [...settled, { type: 'focus', selector: '.bar__brand' }, { type: 'press', key: 'Tab' }];
const key = (k) => ({ type: 'press', key: k });
const pause = (ms = 300) => ({ type: 'wait', ms });

export const states = [
  { name: 'top', scroll: 0 },
  { name: 'enter', settle: 300, actions: [toAtlas, pause(140)] },
  { name: 'placed', settle: 300, actions: settled },
  { name: 'hover', frame: true, settle: 300, actions: [...settled, { type: 'hover', selector: '.pin[data-place="kelp"]' }, pause(400)] },
  { name: 'keyboard', settle: 300, actions: [...viaTab, pause()] },
  { name: 'arrows', settle: 300, actions: [...viaTab, key('ArrowRight'), key('ArrowDown'), key('ArrowRight'), pause()] },
  { name: 'wrap', settle: 300, actions: [...viaTab, key('ArrowLeft'), key('ArrowLeft'), pause()] },
  { name: 'end', settle: 300, actions: [...viaTab, key('End'), pause()] },
  { name: 'escape', settle: 300, actions: [...viaTab, key('ArrowRight'), pause(200), key('Escape'), pause()] },
  { name: 'card-tab', settle: 300, actions: [...viaTab, key('ArrowRight'), key('Tab'), pause()] },
  { name: 'card-escape', settle: 300, actions: [...viaTab, key('ArrowRight'), key('Tab'), pause(200), key('Escape'), pause()] },
  { name: 'click', settle: 300, actions: [...settled, { type: 'click', selector: '.pin[data-place="beach"]' }, { type: 'move', x: 8, y: 8, steps: 4 }, pause(500)] },
  { name: 'list-hover', settle: 300, actions: [...settled, { type: 'hover', selector: '.place[data-place="bothy"] .place__line' }, pause()] },
  { name: 'list-click', settle: 300, actions: [...settled, { type: 'click', selector: '[data-show="sisters"]' }, { type: 'move', x: 8, y: 8, steps: 4 }, pause(500)] },
  { name: 'rm', reducedMotion: true, settle: 300, actions: [toAtlas, pause(120), { type: 'hover', selector: '.pin[data-place="kelp"]' }, pause(250)] },
  { name: 'mobile', viewport: 'mobile', settle: 300, actions: [...settled, { type: 'click', selector: '.pin[data-place="kelp"]' }, pause(400)] },
  { name: 'mobile-rest', viewport: 'mobile', scroll: 0.5 },
];

export function probe() {
  const map = document.querySelector('[data-map]');
  const m = map.getBoundingClientRect();
  const card = document.querySelector('[data-card]');
  const c = card.getBoundingClientRect();
  const centre = (el) => { const b = el.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; };
  const pins = [...document.querySelectorAll('.pin')].map((pin) => {
    const cs = getComputedStyle(pin);
    const b = pin.getBoundingClientRect();
    const x = parseFloat(cs.getPropertyValue('--x')), y = parseFloat(cs.getPropertyValue('--y'));
    return {
      id: pin.dataset.place,
      i: Number(cs.getPropertyValue('--i')),
      at: centre(pin),
      dot: centre(pin.querySelector('.pin__dot')),
      want: [m.left + (x / 100) * m.width, m.top + (y / 100) * m.height],
      anchor: centre(document.querySelector(`[data-anchor="${pin.dataset.place}"]`)),
      size: [Math.round(b.width), Math.round(b.height)],
      opacity: Number(cs.opacity),
      delay: parseFloat(cs.transitionDelay) * (cs.transitionDelay.endsWith('ms') ? 0.001 : 1),
      tab: pin.tabIndex,
      expanded: pin.getAttribute('aria-expanded'),
    };
  });
  const shown = window.__awards.state().shown;
  const item = shown ? document.querySelector(`.place[data-place="${shown}"]`) : null;
  const text = (el) => el?.textContent.trim() ?? null;
  const a = document.activeElement;
  return {
    map: [m.left, m.top, m.right, m.bottom],
    card: card.hidden ? null : [c.left, c.top, c.right, c.bottom],
    cardPosition: getComputedStyle(card).position,
    cardTranslate: getComputedStyle(card).translate,
    cardOpacity: Number(getComputedStyle(card).opacity),
    cardText: { name: text(card.querySelector('[data-card-name]')), num: text(card.querySelector('[data-card-num]')), unit: text(card.querySelector('[data-card-unit]')), line: text(card.querySelector('[data-card-line]')), link: text(card.querySelector('[data-card-link]')), linkHidden: !card.querySelector('[data-card-link]').checkVisibility(), figHidden: !card.querySelector('[data-card-fig]').checkVisibility() },
    want: item ? { name: text(item.querySelector('.place__name')), num: text(item.querySelector('.place__num')), unit: text(item.querySelector('.place__unit')), line: text(item.querySelector('.place__line')), link: text(item.querySelector('.place__link')) } : null,
    pins,
    pinCentre: shown ? pins.find((p) => p.id === shown).at : null,
    active: a?.classList.contains('pin') ? a.dataset.place : card.contains(a) ? `card:${text(a)}` : a?.tagName.toLowerCase() ?? null,
    listOn: [...document.querySelectorAll('.place.is-on')].map((li) => li.dataset.place),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side, once: the pins group as assistive technology reads it (a named group of named buttons).
export async function inspect(page, st) {
  if (st.name !== 'keyboard') return null;
  return { aria: await page.locator('[data-pins]').ariaSnapshot() };
}

const NAMES = { well: 'North Well', light: 'Skerrow Head light', sisters: 'The Sisters', marsh: 'Marsh hide', bothy: 'West Cove bothy', kelp: 'Kelp Store', beach: 'Shell Beach', ferry: 'Ferry slip' };

export function assert(r) {
  const S = (n) => r[n]?.state || {};
  const P = (n) => r[n]?.probe || {};
  const out = [];
  const err = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const inside = (p) => !!p.card && p.card[0] >= p.map[0] - 0.5 && p.card[1] >= p.map[1] - 0.5 && p.card[2] <= p.map[2] + 0.5 && p.card[3] <= p.map[3] + 0.5;
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
  out.push({ ok: order.join() === 'well,light,sisters,marsh,bothy,kelp,beach,ferry' && (P('placed').pins || []).every((p, i) => p.i === i), message: `reading order: top to bottom, then left to right, in the DOM too (${order.join(' → ')})` });

  // Entrance: staggered on the full tier, in reading order.
  const top = P('top').pins || [];
  out.push({ ok: S('top').enter === 'pending' && top.every((p) => p.opacity === 0), message: `top: the map is not yet a third in view, so its pins wait (enter ${S('top').enter}, opacities ${[...new Set(top.map((p) => p.opacity))].join(', ')})` });
  const en = [...(P('enter').pins || [])].sort((a, b) => a.i - b.i);
  const delays = en.map((p) => Math.round(p.delay * 1000));
  out.push({ ok: S('enter').enter === 'in' && en.length === 8 && delays.every((d, i) => d === i * 70), message: `enter: pins stagger by 70 ms in reading order (delays ${delays.join(', ')} ms)` });
  out.push({ ok: en.length === 8 && en[0].opacity > 0.05 && en[7].opacity === 0 && en[0].opacity >= en[3].opacity && en[3].opacity >= en[7].opacity, message: `enter: 140 ms in, the first pin is arriving and the last has not started (opacity ${en.map((p) => p.opacity.toFixed(2)).join(', ')})` });
  out.push({ ok: S('placed').enter === 'done' && (P('placed').pins || []).every((p) => p.opacity === 1 && p.delay === 0), message: `placed: entrance over, every pin opaque and its delay cleared (${S('placed').enter})` });

  // Hover: the card opens with the list entry's text, above the pin, inside the map.
  const h = P('hover');
  out.push({ ok: S('hover').shown === 'kelp' && sameText(h), message: `hover: the card shows the Kelp Store from its list entry ("${h.cardText?.name}", ${h.cardText?.num} ${h.cardText?.unit}, "${h.cardText?.link}")` });
  out.push({ ok: inside(h) && S('hover').side === 'above' && h.card[3] <= h.pinCentre[1] - 10, message: `hover: the card sits above its pin and inside the map (card ${fmt(h.card || [])} in map ${fmt(h.map || [])})` });

  // Keyboard: Tab lands on the group's one stop and opens the card on focus.
  const k = P('keyboard');
  out.push({ ok: k.active === 'well' && S('keyboard').shown === 'well' && sameText(k), message: `keyboard: Tab focuses the first pin and its card opens (${k.active}, "${k.cardText?.name}", ${k.cardText?.num} ${k.cardText?.unit})` });
  out.push({ ok: inside(k) && S('keyboard').side === 'below', message: `keyboard: a pin near the top edge puts its card below, still inside the map (${S('keyboard').side})` });
  out.push({ ok: (k.pins || []).filter((p) => p.tab === 0).map((p) => p.id).join() === 'well' && (k.pins || []).filter((p) => p.expanded === 'true').length === 1, message: `keyboard: one pin in the tab order and one expanded (${(k.pins || []).filter((p) => p.tab === 0).map((p) => p.id)})` });
  const aria = r.keyboard?.inspect?.aria || '';
  const named = Object.values(NAMES).every((nm) => aria.includes(`button "${nm}`));
  out.push({ ok: /group "Places on the map"/.test(aria) && named, message: `keyboard: a group named "Places on the map" holding 8 named buttons (${named ? 'all named' : aria.slice(0, 120)})` });

  const ar = P('arrows');
  out.push({ ok: ar.active === 'marsh' && S('arrows').shown === 'marsh' && S('arrows').current === 'marsh' && sameText(ar) && inside(ar) && (ar.pins || []).filter((p) => p.tab === 0).map((p) => p.id).join() === 'marsh', message: `arrows: →, ↓, → rove to the fourth pin in reading order with the tab stop and the card (${ar.active}, "${ar.cardText?.name}")` });
  out.push({ ok: P('wrap').active === 'beach' && S('wrap').shown === 'beach', message: `arrows: ← from the first pin wraps to the last, ← again steps back (${P('wrap').active})` });
  const e = P('end');
  out.push({ ok: e.active === 'ferry' && S('end').shown === 'ferry' && inside(e) && S('end').side === 'above', message: `End: the last pin, its card above it inside the map (${e.active}, ${S('end').side})` });
  const esc = P('escape');
  out.push({ ok: esc.active === 'light' && S('escape').shown === null && esc.card === null && (esc.pins || []).every((p) => p.expanded === 'false'), message: `Escape: the card closes, focus stays on its pin (${esc.active}, card ${esc.card ? 'open' : 'closed'})` });
  const ct = P('card-tab');
  out.push({ ok: ct.active === 'card:Climbing times' && S('card-tab').shown === 'light' && inside(ct), message: `Tab from a pin reaches the card's action and the card holds (${ct.active})` });
  const ce = P('card-escape');
  out.push({ ok: ce.active === 'light' && S('card-escape').shown === null && ce.card === null, message: `Escape inside the card closes it and returns focus to its pin (${ce.active})` });

  // Click: the card stays for the clicked pin after the pointer has gone.
  const cl = P('click');
  out.push({ ok: S('click').selected === 'beach' && S('click').hover === null && S('click').shown === 'beach' && sameText(cl) && inside(cl), message: `click: Shell Beach stays open after the pointer leaves (selected ${S('click').selected}, hover ${S('click').hover})` });

  // The list drives the map.
  const lh = P('list-hover');
  out.push({ ok: S('list-hover').shown === 'bothy' && (lh.pins || []).find((p) => p.id === 'bothy')?.expanded === 'true' && lh.listOn?.join() === 'bothy' && sameText(lh), message: `list → map: pointing at a list entry opens its pin's card (${S('list-hover').shown}, list ${lh.listOn})` });
  const lc = S('list-click');
  out.push({ ok: lc.selected === 'sisters' && lc.shown === 'sisters' && lc.status === 'The Sisters shown on the map.' && sameText(P('list-click')), message: `list → map: Show on map selects the place and says so ("${lc.status}")` });

  // Reduced motion: no stagger, no movement; the card still answers.
  const rm = P('rm');
  out.push({ ok: S('rm').motion === 'reduced' && S('rm').enter === 'done' && (rm.pins || []).every((p) => p.opacity === 1 && p.delay === 0), message: `reduced motion: every pin is in place at once, no stagger (enter ${S('rm').enter}, delays ${[...new Set((rm.pins || []).map((p) => p.delay))].join(', ')})` });
  out.push({ ok: S('rm').shown === 'kelp' && rm.cardTranslate === 'none' && rm.cardOpacity === 1, message: `reduced motion: the card opens without travelling (translate ${rm.cardTranslate}, opacity ${rm.cardOpacity})` });

  // Phone: the card docks under the map, full width, in the flow.
  const mo = P('mobile');
  out.push({ ok: S('mobile').docked && S('mobile').shown === 'kelp' && mo.cardPosition === 'relative' && mo.card && mo.card[1] >= mo.map[3] - 0.5 && Math.abs(mo.card[0] - mo.map[0]) <= 0.5 && Math.abs(mo.card[2] - mo.map[2]) <= 0.5 && sameText(mo), message: `phone: the card docks under the map at its width (card top ${Math.round(mo.card?.[1] ?? 0)} ≥ map bottom ${Math.round(mo.map?.[3] ?? 0)}, "${mo.cardText?.name}")` });
  const mr = P('mobile-rest');
  out.push({ ok: S('mobile-rest').docked && mr.card !== null && mr.cardText?.linkHidden === true && mr.cardText?.figHidden === true && /Choose a pin/.test(mr.cardText?.name || ''), message: `phone: with nothing chosen the docked card holds its place with a prompt ("${mr.cardText?.name}")` });
  for (const n of ['mobile', 'mobile-rest', 'placed']) out.push({ ok: (P(n).overflowX ?? 1) <= 0, message: `${n}: no sideways overflow (${P(n).overflowX} px)` });
  return out;
}
