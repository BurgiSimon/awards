// The purchase path, checked as behaviour: a quick add answers in words and a number, the bag opens as a modal
// with focus on its heading and the page behind unreachable, the steppers keep focus at their limits, every way out
// returns focus to the bag button, the subtotal is Intl-formatted from minor units, and the drawer slides in full,
// fades under reduced motion and simply appears in the static tier. inspect() reads the accessibility tree from Node.

const STATIC = { type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" };
const pick = (product, size) => ({ type: 'click', selector: `input[name="size-${product}"][value="${size}"]` });
const add = (product) => ({ type: 'click', selector: `[data-product="${product}"] [data-add]` });
const OPEN = { type: 'click', selector: '[data-bag-open]' };
const wait = (ms) => ({ type: 'wait', ms });
const TWO = [pick('low-sun', 'A2'), add('low-sun'), add('night-ferry')]; // £38 + £26

export const states = [
  { name: 'desktop', settle: 300 },
  { name: 'added', settle: 300, actions: TWO },
  { name: 'open', settle: 300, actions: [...TWO, OPEN] },
  // Six stops in the bag (close, −, quantity, +, remove, checkout); the seventh Tab leaves for the browser's own UI,
  // the eighth comes back in. Native modal dialogs do not trap: nothing behind them can take focus instead.
  { name: 'tab-cycle', settle: 300, actions: [add('low-sun'), OPEN, wait(400), ...Array.from({ length: 8 }, () => ({ type: 'press', key: 'Tab' }))] },
  { name: 'stepper-up', settle: 300, actions: [add('low-sun'), OPEN, wait(400), { type: 'click', selector: '[data-step="1"]' }, { type: 'click', selector: '[data-step="1"]' }] },
  // Keyboard, not clicks: an aria-disabled button is still focusable and pressable, which is the point.
  { name: 'stepper-floor', settle: 300, actions: [add('low-sun'), add('low-sun'), OPEN, wait(400), { type: 'focus', selector: '[data-step="-1"]' }, ...Array.from({ length: 3 }, () => ({ type: 'press', key: 'Enter' }))] },
  { name: 'keyboard', settle: 300, actions: [
    { type: 'focus', selector: 'input[name="size-low-sun"][value="A3"]' }, { type: 'press', key: 'ArrowRight' }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Enter' },
    { type: 'focus', selector: '[data-bag-open]' }, { type: 'press', key: 'Enter' }, wait(400),
    { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Tab' }, { type: 'press', key: 'Enter' },
    { type: 'press', key: 'Escape' }, wait(500),
  ] },
  { name: 'escape', settle: 300, actions: [...TWO, OPEN, wait(400), { type: 'press', key: 'Escape' }, wait(500)] },
  { name: 'close-button', settle: 300, actions: [OPEN, wait(400), { type: 'click', selector: '.bag__close' }, wait(500)] },
  { name: 'scrim', settle: 300, actions: [OPEN, wait(400), { type: 'move', x: 300, y: 450, steps: 2 }, { type: 'down' }, { type: 'up' }, wait(500)] },
  { name: 'remove', settle: 300, actions: [...TWO, OPEN, wait(400), { type: 'click', selector: '[data-key="low-sun:A2"] [data-remove]' }, { type: 'click', selector: '[data-key="night-ferry:A3"] [data-remove]' }] },
  { name: 'sold-out', settle: 300, actions: [pick('three-pears', 'A1'), add('three-pears')] },
  { name: 'checkout', settle: 300, actions: [add('night-ferry'), OPEN, wait(400), { type: 'click', selector: '[data-checkout]' }] },
  { name: 'rm', reducedMotion: true, settle: 300, actions: [...TWO, OPEN] },
  { name: 'rm-close', reducedMotion: true, settle: 300, actions: [add('low-sun'), OPEN, wait(400), { type: 'press', key: 'Escape' }, wait(400)] },
  { name: 'static', settle: 300, actions: [STATIC, ...TWO, OPEN] },
  { name: 'static-close', settle: 300, actions: [STATIC, add('low-sun'), OPEN, wait(100), { type: 'press', key: 'Escape' }] },
  { name: 'mobile', viewport: 'mobile', settle: 300 },
  { name: 'mobile-open', viewport: 'mobile', settle: 300, actions: [...TWO, add('three-pears'), OPEN] },
];

export async function probe() {
  const $ = (s) => document.querySelector(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const panel = $('[data-panel]');
  const rect = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) }; };
  // The drawer as it arrives: position and opacity every 35 ms for ~600 ms from the end of the actions.
  const samples = [];
  const t0 = performance.now();
  for (let i = 0; i < 17; i++) {
    const r = panel.getBoundingClientRect();
    samples.push({ t: Math.round(performance.now() - t0), x: Math.round(r.x), y: Math.round(r.y), opacity: Math.round(Number(getComputedStyle(panel).opacity) * 100) / 100 });
    await sleep(35);
  }
  const s = window.__awards.state();
  const dialog = $('[data-bag]');
  // Is the page behind reachable by pointer while the bag is open? Hit-test the first quick-add button's centre.
  const addRect = $('[data-add]').getBoundingClientRect();
  const hit = document.elementFromPoint(addRect.x + addRect.width / 2, addRect.y + addRect.height / 2);
  const checkoutEl = $('[data-checkout]');
  const a = document.activeElement;
  const cs = a && getComputedStyle(a);
  return {
    samples,
    final: s,
    dialogOpen: dialog.open,
    modal: dialog.matches(':modal'),
    behindReachable: dialog.open ? !dialog.contains(hit) : null,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    panel: rect(panel),
    checkout: dialog.open && getComputedStyle(checkoutEl).display !== 'none' ? rect(checkoutEl) : null,
    emptyShown: !$('[data-empty]').hidden,
    lineCount: document.querySelectorAll('[data-lines] > li').length,
    lineQty: [...document.querySelectorAll('[data-qty]')].map((i) => i.value),
    minusDisabled: [...document.querySelectorAll('[data-step="-1"]')].map((b) => b.getAttribute('aria-disabled')),
    cardPrices: [...document.querySelectorAll('[data-price-label]')].map((p) => p.textContent),
    cardNotes: [...document.querySelectorAll('[data-card-note]')].map((p) => p.textContent),
    addNames: [...document.querySelectorAll('[data-add]')].map((b) => b.getAttribute('aria-label')),
    addedShown: [...document.querySelectorAll('[data-add]')].map((b) => b.hasAttribute('data-added')),
    cards: [...document.querySelectorAll('.print')].map((c) => ({ ...rect(c), art: rect(c.querySelector('.print__art')), name: rect(c.querySelector('.print__name')) })),
    active: a && { tag: a.tagName, data: a.getAttribute('data-step') ?? a.getAttribute('data-bag-open') ?? null, outline: cs.outlineStyle, outlineWidth: parseFloat(cs.outlineWidth), focusVisible: a.matches(':focus-visible') },
    innerWidth, innerHeight,
    overflowX: document.documentElement.scrollWidth - innerWidth,
    panelOverflowX: panel.scrollWidth - panel.clientWidth,
  };
}

// Node-side: names as the accessibility tree has them, and whether the page behind the modal is out of the tree.
export async function inspect(page, st) {
  const count = (role, name) => page.getByRole(role, { name, exact: true }).count();
  if (st.name === 'desktop') {
    const group = page.getByRole('group', { name: 'Size of Low Sun', exact: true });
    return {
      bag: await count('button', 'Bag (0)'),
      add: await count('button', 'Add to bag, Low Sun, A3'),
      group: await group.count(),
      radios: await Promise.all(['A3', 'A2'].map((name) => group.getByRole('radio', { name, exact: true }).count())),
      soldOut: await count('radio', 'A1 sold out'),
      productLink: await page.getByRole('link', { name: /^A pink sun half under a blue sea\s*Low Sun\s*£24$/ }).count(),
    };
  }
  if (st.name !== 'open') return null;
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  const exposed = (name) => nodes.some((n) => !n.ignored && n.name?.value === name);
  return {
    dialog: await count('dialog', 'Your bag'),
    names: {
      decrease: await count('button', 'Decrease quantity of Low Sun, A2'),
      increase: await count('button', 'Increase quantity of Low Sun, A2'),
      quantity: await count('spinbutton', 'Quantity of Low Sun, A2'),
      remove: await count('button', 'Remove Low Sun, A2'),
      close: await count('button', 'Close the bag'),
      checkout: await count('button', 'Checkout'),
    },
    behindExposed: exposed('Add to bag, Night Ferry, A3') || exposed('Bag (2)'),
    insideExposed: exposed('Checkout'),
  };
}

export function assert(r) {
  const out = [];
  const P = (k) => r[k]?.probe || {};
  const S = (k) => r[k]?.probe?.final || r[k]?.state || {};
  const range = (a) => (a.length ? `${Math.min(...a)}–${Math.max(...a)}` : 'none');

  // At rest: closed, nothing in the bag, prices formatted per variant.
  const d = P('desktop'), ds = S('desktop');
  out.push({ ok: !d.dialogOpen && ds.count === 0 && ds.countText === 'Bag (0)' && ds.expanded === 'false' && d.cardPrices?.join() === '£24,£26,£22', message: `at rest: bag closed, "${ds.countText}", card prices ${d.cardPrices?.join(' ')}` });

  // Quick add: the count, a polite message, the price of the chosen size and the button's own state.
  const ad = P('added'), as = S('added');
  out.push({ ok: as.count === 2 && as.countText === 'Bag (2)' && as.subtotal === 6400 && as.subtotalText === '£64.00' && !ad.dialogOpen, message: `add: count ${as.countText}, subtotal ${as.subtotalText} (£38 + £26), bag stays closed` });
  out.push({ ok: as.announce === 'Added Night Ferry, A3 to the bag. 2 prints in the bag.' && ad.cardPrices?.[0] === '£38' && ad.addNames?.[0] === 'Add to bag, Low Sun, A2' && ad.addedShown?.[1] === true, message: `add: announced "${as.announce}", card shows £38 for A2, button reads "Added"` });

  // Open: modal, focus on the heading, page locked and unreachable, lines and subtotal rendered, slid from the edge.
  const op = P('open'), os = op.final || {};
  const xs = (op.samples || []).map((s) => s.x);
  out.push({ ok: op.dialogOpen && op.modal && os.focused === 'bag-title' && os.focusInDialog && os.expanded === 'true' && op.htmlOverflow === 'hidden' && op.behindReachable === false, message: `open: modal dialog, focus on "${os.focused}", aria-expanded ${os.expanded}, page overflow ${op.htmlOverflow}, page behind not hit-testable` });
  out.push({ ok: op.lineCount === 2 && os.subtotalText === '£64.00' && op.panel?.right >= op.innerWidth - 20 && op.panel?.h === op.innerHeight, message: `open: ${op.lineCount} lines, subtotal ${os.subtotalText}, panel docked to the right edge (${op.panel?.x}–${op.panel?.right})` });
  out.push({ ok: os.motion === 'full' && os.variant === 'drawer' && os.openProps?.join() === 'transform' && Math.max(...xs) > op.panel?.x + 40 && xs.at(-1) === op.panel?.x && xs.every((x, i) => i === 0 || x <= xs[i - 1]) && os.lastOpenMs >= 200 && os.lastOpenMs <= 600, message: `full: slides in from the edge (x ${range(xs)} → ${op.panel?.x}) in ${os.lastOpenMs} ms` });

  // Tab stays inside the modal.
  const tc = S('tab-cycle');
  out.push({ ok: tc.open && tc.focusInDialog && tc.focusOutside === 0, message: `eight Tabs: focus never landed behind the bag (${tc.focusOutside} times) and is back inside it (${tc.focused})` });

  // Steppers: totals follow; at 1 the minus is aria-disabled and keeps focus.
  const su = S('stepper-up'), sf = S('stepper-floor'), sfp = P('stepper-floor');
  out.push({ ok: su.lines?.[0]?.qty === 3 && su.subtotalText === '£72.00' && su.count === 3 && su.bagAnnounce === 'Low Sun, A3: 3. Subtotal £72.00.' && su.focused === 'Increase quantity of Low Sun, A3', message: `stepper: + twice gives 3 × £24 = ${su.subtotalText}, focus stays on "${su.focused}", announced "${su.bagAnnounce}"` });
  out.push({ ok: sf.lines?.[0]?.qty === 1 && sf.subtotalText === '£24.00' && sfp.minusDisabled?.[0] === 'true' && sf.focused === 'Decrease quantity of Low Sun, A3' && sf.focusInDialog && /1 is the fewest/.test(sf.bagAnnounce), message: `stepper: floor at 1 (aria-disabled ${sfp.minusDisabled?.[0]}), focus kept on "${sf.focused}", says "${sf.bagAnnounce}"` });

  // Keyboard only: arrow to A2, add, open, Tab to +, Enter, Escape.
  const kb = S('keyboard'), kbp = P('keyboard');
  out.push({ ok: kb.count === 2 && kb.lines?.[0]?.key === 'low-sun:A2' && kb.subtotalText === '£76.00' && !kb.open && kb.closedBy === 'escape' && kb.focusOnOpener && kb.expanded === 'false' && kbp.active?.focusVisible, message: `keyboard: arrow, Tab, Enter adds A2; Tab ×4 and Enter steps to 2 (${kb.subtotalText}); Escape returns focus to the bag button (focus-visible ${kbp.active?.focusVisible})` });

  // Every way out returns focus to the bag button and unlocks the page.
  for (const [k, by] of [['escape', 'escape'], ['close-button', 'button'], ['scrim', 'scrim']]) {
    const s = S(k), p = P(k);
    out.push({ ok: !s.open && !p.dialogOpen && s.closedBy === by && s.focusOnOpener && s.expanded === 'false' && !s.pageLocked && p.htmlOverflow !== 'hidden' && s.closes === 1, message: `${k}: closed by ${s.closedBy}, focus on the bag button, page unlocked` });
  }
  const es = S('escape');
  out.push({ ok: es.lastCloseMs >= 150 && es.lastCloseMs <= 500, message: `full: Escape plays the exit (${es.lastCloseMs} ms) instead of cutting` });

  // Remove: lines go, focus lands on the heading, the empty state shows.
  const rm = S('remove'), rmp = P('remove');
  out.push({ ok: rm.count === 0 && rm.countText === 'Bag (0)' && rmp.lineCount === 0 && rmp.emptyShown && rm.focused === 'bag-title' && rm.focusInDialog && rm.bagAnnounce === 'Removed Night Ferry, A3. Your bag is empty.' && rmp.checkout === null, message: `remove: empty state shown, focus on the heading, "${rm.bagAnnounce}", no checkout button on an empty bag` });

  // Sold out: nothing added, said in words next to the control.
  const so = S('sold-out'), sop = P('sold-out');
  out.push({ ok: so.count === 0 && /^Not added\. Three Pears: A1 is sold out\. A3 and A2 are in stock\.$/.test(so.announce) && sop.cardNotes?.[2] === 'A1 is sold out. A3 and A2 are in stock.' && sop.addNames?.[2]?.endsWith('Three Pears, A1, sold out'), message: `sold out: nothing added, card note "${sop.cardNotes?.[2]}"` });

  // Checkout: demo note, no navigation.
  const co = S('checkout');
  out.push({ ok: co.checkouts === 1 && co.open && co.path === '/cart-drawer-quick-add/index.html' && /^Demo only: .*Nothing was charged\.$/.test(co.demoNote) && co.bagAnnounce === co.demoNote, message: `checkout: "${co.demoNote}", page unchanged (${co.path})` });

  // Reduced: no travel, opacity only; Escape fades out and returns focus.
  const rp = P('rm'), rs = rp.final || {};
  const rx = (rp.samples || []).map((s) => s.x), ro = (rp.samples || []).map((s) => s.opacity);
  out.push({ ok: rs.motion === 'reduced' && rs.openProps?.join() === 'opacity' && rx.every((x) => x === rp.panel?.x) && ro.at(-1) === 1 && rs.lastOpenMs >= 120 && rs.lastOpenMs <= 400 && rs.focused === 'bag-title', message: `reduced: no travel (x ${range(rx)}), opacity ${range(ro)}, fade ${rs.lastOpenMs} ms, focus on the heading` });
  const rc = S('rm-close');
  out.push({ ok: !rc.open && rc.closedBy === 'escape' && rc.focusOnOpener && rc.lastCloseMs >= 120 && rc.lastCloseMs <= 400, message: `reduced: Escape fades out (${rc.lastCloseMs} ms), focus back on the bag button` });

  // Static: there at once, gone at once.
  const sp = P('static'), ss = sp.final || {};
  out.push({ ok: ss.motion === 'static' && ss.lastOpenMs === 0 && ss.openProps?.length === 0 && (sp.samples || []).every((s) => s.x === sp.panel?.x && s.opacity === 1) && ss.subtotalText === '£64.00', message: `static: open at once (first sample x ${sp.samples?.[0]?.x}, opacity ${sp.samples?.[0]?.opacity}), ${ss.subtotalText}` });
  const sc = S('static-close');
  out.push({ ok: !sc.open && sc.lastCloseMs === 0 && sc.focusOnOpener, message: `static: Escape closes at once (${sc.lastCloseMs} ms), focus on the bag button` });

  // Phone: no overflow on the page or in the sheet; the sheet docks to the bottom with the checkout in view.
  const m = P('mobile');
  const c = m.cards || [];
  out.push({ ok: m.overflowX <= 0 && c.length === 3 && c.every((k, i) => i === 0 || k.y >= c[i - 1].bottom - 1) && c.every((k) => k.art.right <= k.name.x), message: `mobile: no overflow (${m.overflowX}px), prints stacked, art beside each name` });
  const mo = P('mobile-open'), ms = mo.final || {};
  const ys = (mo.samples || []).map((s) => s.y);
  out.push({ ok: ms.variant === 'sheet' && mo.panel?.bottom === mo.innerHeight && mo.panel?.w === mo.innerWidth && mo.panel?.y > 60 && ys[0] > mo.panel?.y && ys.at(-1) === mo.panel?.y, message: `mobile: bottom sheet (${mo.panel?.y}–${mo.panel?.bottom} of ${mo.innerHeight}), slid up from the bottom edge (y ${range(ys)})` });
  out.push({ ok: mo.checkout && mo.checkout.bottom <= mo.innerHeight && mo.checkout.y >= mo.panel?.y && mo.checkout.h >= 44 && mo.overflowX <= 0 && mo.panelOverflowX <= 0 && mo.lineCount === 3, message: `mobile: checkout in view (${mo.checkout?.y}–${mo.checkout?.bottom}), three lines, no overflow in the page (${mo.overflowX}) or the sheet (${mo.panelOverflowX})` });

  // Accessibility tree.
  const ax = r.desktop?.inspect || {}, ox = r.open?.inspect || {};
  out.push({ ok: ax.bag === 1 && ax.add === 1 && ax.group === 1 && ax.radios?.every((n) => n === 1) && ax.soldOut === 1 && ax.productLink === 1, message: `a11y: "Bag (0)", "Add to bag, Low Sun, A3", group "Size of Low Sun" with radios ${JSON.stringify(ax.radios)}, "A1 sold out", one product link holding art, name and price` });
  out.push({ ok: ox.dialog === 1 && Object.values(ox.names || {}).every((n) => n === 1), message: `a11y: dialog "Your bag" with named controls ${JSON.stringify(ox.names)}` });
  out.push({ ok: ox.behindExposed === false && ox.insideExposed === true, message: `a11y: while open, the page behind is out of the tree (exposed ${ox.behindExposed}) and the bag is in it` });
  return out;
}
