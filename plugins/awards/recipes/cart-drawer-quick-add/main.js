import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

syncMotionTierAttribute();

// Parameters. Money is held in minor units (pence) and only formatted for display, so sums never drift.
const LOCALE = 'en-GB';
const CURRENCY = 'GBP';
const MAX_QTY = 9; // per line: small editions
const SLIDE = { open: 280, close: 200, easeIn: 'cubic-bezier(0.16, 1, 0.3, 1)', easeOut: 'cubic-bezier(0.7, 0, 0.84, 0)' };
const FADE = 180; // reduced tier: opacity only
const ADDED_MS = 1400; // how long a quick-add button shows "Added"

const money = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });
const tag = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY, trailingZeroDisplay: 'stripIfInteger' });
const fmt = (minor) => money.format(minor / 100); // bag: £38.00
const fmtTag = (minor) => tag.format(minor / 100); // card: £38

const html = document.documentElement;
const opener = document.querySelector('[data-bag-open]');
const countEl = document.querySelector('[data-count]');
const announce = document.querySelector('[data-announce]');
const dialog = document.querySelector('[data-bag]');
const panel = dialog.querySelector('[data-panel]');
const scrim = dialog.querySelector('[data-scrim]');
const title = dialog.querySelector('#bag-title');
const list = dialog.querySelector('[data-lines]');
const empty = dialog.querySelector('[data-empty]');
const subtotalEl = dialog.querySelector('[data-subtotal]');
const bagCount = dialog.querySelector('[data-bag-count]');
const bagAnnounce = dialog.querySelector('[data-bag-announce]');
const demoNote = dialog.querySelector('[data-demo-note]');
const sheetMq = matchMedia('(max-width: 767.98px)');

// The cart, keyed "product:size". A real shop keeps it on the commerce backend behind a cart id, so it survives a
// reload and a route change; this demo keeps it in memory only.
const cart = new Map();
const state = { closing: false, focusOutside: 0, opens: 0, closes: 0, closedBy: '', variant: '', openProps: [], lastOpenMs: -1, lastCloseMs: -1, checkouts: 0 };
let running = [];

const lines = () => [...cart.values()];
const count = () => lines().reduce((n, l) => n + l.qty, 0);
const subtotal = () => lines().reduce((s, l) => s + l.qty * l.unit, 0);
const prints = (n) => `${n} ${n === 1 ? 'print' : 'prints'}`;
const named = (l) => `${l.name}, ${l.size}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const say = (region, message) => { region.textContent = message; };

// ---------- Product cards: a size radio group, a price that follows it, and a quick add that names its product.
for (const card of document.querySelectorAll('[data-product]')) {
  const name = card.dataset.name;
  const priceLabel = card.querySelector('[data-price-label]');
  const note = card.querySelector('[data-card-note]');
  const button = card.querySelector('[data-add]');
  const chosen = () => card.querySelector('input[type="radio"]:checked');
  const inStock = () => [...card.querySelectorAll('input[type="radio"]:not([data-sold-out])')].map((r) => r.value);
  const soldOutText = (r) => `${r.value} is sold out. ${inStock().join(' and ')} ${inStock().length === 1 ? 'is' : 'are'} in stock.`;
  let timer = 0;

  // A variant change updates the price and the button's name at once; nothing animates before the price is right.
  // The name is an aria-label that starts with the visible "Add to bag", so voice control still finds it.
  const sync = () => {
    const r = chosen();
    const out = r.hasAttribute('data-sold-out');
    priceLabel.textContent = fmtTag(Number(r.dataset.price));
    button.setAttribute('aria-label', `Add to bag, ${name}, ${r.value}${out ? ', sold out' : ''}`);
    note.textContent = out ? soldOutText(r) : '';
  };
  card.addEventListener('change', sync);
  sync();

  button.addEventListener('click', () => {
    const r = chosen();
    if (r.hasAttribute('data-sold-out')) return say(announce, `Not added. ${name}: ${soldOutText(r)}`);
    const key = `${card.dataset.product}:${r.value}`;
    const line = cart.get(key) ?? { key, art: card.dataset.product, name, size: r.value, unit: Number(r.dataset.price), qty: 0 };
    if (line.qty >= MAX_QTY) {
      note.textContent = `${MAX_QTY} is the most per order for ${r.value}.`;
      return say(announce, `Not added. ${named(line)}: ${note.textContent}`);
    }
    line.qty += 1;
    cart.set(key, line);
    render();
    // The answer is words and a number, never only an animation: a polite message and the count in the bag button.
    say(announce, `Added ${named(line)} to the bag. ${prints(count())} in the bag.`);
    button.dataset.added = '';
    opener.classList.add('is-bumped');
    clearTimeout(timer);
    timer = setTimeout(() => { delete button.dataset.added; opener.classList.remove('is-bumped'); }, ADDED_MS);
  });
}

// ---------- The bag's contents: keyed, updated in place, so a focused stepper button survives a re-render.
function lineHTML(l) {
  const n = esc(named(l));
  return `<li class="line" data-key="${esc(l.key)}">
    <svg class="line__art" viewBox="0 0 400 500" aria-hidden="true" focusable="false"><use href="#art-${esc(l.art)}"/></svg>
    <div class="line__info"><p class="line__name">${esc(l.name)}</p><p class="line__meta">${esc(l.size)} · ${fmt(l.unit)} each</p></div>
    <p class="line__total" data-line-total></p>
    <div class="stepper" role="group" aria-label="Quantity of ${n}">
      <button class="stepper__btn" type="button" data-step="-1" aria-label="Decrease quantity of ${n}"><span aria-hidden="true">−</span></button>
      <input class="stepper__qty" type="number" inputmode="numeric" min="1" max="${MAX_QTY}" step="1" aria-label="Quantity of ${n}" data-qty>
      <button class="stepper__btn" type="button" data-step="1" aria-label="Increase quantity of ${n}"><span aria-hidden="true">+</span></button>
    </div>
    <button class="line__remove" type="button" data-remove>Remove<span class="sr-only"> ${n}</span></button>
  </li>`;
}

function render() {
  const n = count();
  countEl.textContent = String(n);
  bagCount.textContent = prints(n);
  subtotalEl.textContent = fmt(subtotal());
  panel.toggleAttribute('data-empty', n === 0);
  empty.hidden = n > 0;
  const keep = new Set();
  for (const l of lines()) {
    keep.add(l.key);
    let li = list.querySelector(`[data-key="${CSS.escape(l.key)}"]`);
    if (!li) { list.insertAdjacentHTML('beforeend', lineHTML(l)); li = list.lastElementChild; }
    const qty = li.querySelector('[data-qty]');
    if (qty.value !== String(l.qty)) qty.value = String(l.qty);
    li.querySelector('[data-line-total]').textContent = fmt(l.qty * l.unit);
    // aria-disabled, not disabled: a disabled button drops focus to <body> the moment it reaches the limit.
    li.querySelector('[data-step="-1"]').setAttribute('aria-disabled', String(l.qty <= 1));
    li.querySelector('[data-step="1"]').setAttribute('aria-disabled', String(l.qty >= MAX_QTY));
  }
  for (const li of list.querySelectorAll('[data-key]')) if (!keep.has(li.dataset.key)) li.remove();
}

list.addEventListener('click', (e) => {
  const li = e.target.closest('[data-key]');
  const line = li && cart.get(li.dataset.key);
  if (!line) return;
  const step = e.target.closest('[data-step]');
  if (step) {
    if (step.getAttribute('aria-disabled') === 'true') {
      return say(bagAnnounce, line.qty <= 1 ? `${named(line)}: 1 is the fewest. Use Remove to take it out.` : `${named(line)}: ${MAX_QTY} is the most per order.`);
    }
    line.qty += Number(step.dataset.step);
    render();
    return say(bagAnnounce, `${named(line)}: ${line.qty}. Subtotal ${fmt(subtotal())}.`);
  }
  if (e.target.closest('[data-remove]')) {
    cart.delete(line.key);
    render();
    title.focus(); // the focused button has just been removed; the heading is the stable place to land
    say(bagAnnounce, cart.size ? `Removed ${named(line)}. Subtotal ${fmt(subtotal())}.` : `Removed ${named(line)}. Your bag is empty.`);
  }
});

list.addEventListener('change', (e) => {
  const input = e.target.closest('[data-qty]');
  const line = input && cart.get(input.closest('[data-key]').dataset.key);
  if (!line) return;
  const v = Math.round(Number(input.value));
  line.qty = Number.isFinite(v) && v > 0 ? Math.min(MAX_QTY, v) : line.qty;
  render();
  say(bagAnnounce, `${named(line)}: ${line.qty}. Subtotal ${fmt(subtotal())}.`);
});

dialog.querySelector('[data-checkout]').addEventListener('click', () => {
  state.checkouts++;
  demoNote.textContent = 'Demo only: a real shop hands you to its hosted checkout here. Nothing was charged.';
  say(bagAnnounce, demoNote.textContent);
});

// ---------- The drawer: from the inline-end edge on wide screens, the bottom edge on phones. Full tier slides,
// reduced fades, static appears. Every way out ends in the dialog's close event.
const edge = () => {
  if (sheetMq.matches) return 'translateY(100%)';
  return getComputedStyle(panel).direction === 'rtl' ? 'translateX(-100%)' : 'translateX(100%)';
};
const cancelRunning = () => { for (const a of running) a.cancel(); running = []; };

function open() {
  if (dialog.open) return;
  render();
  state.variant = sheetMq.matches ? 'sheet' : 'drawer';
  state.closing = false;
  html.classList.add('bag-open'); // the modal dialog does not stop the page behind it from scrolling
  dialog.showModal(); // top layer; everything else inert
  opener.setAttribute('aria-expanded', 'true');
  title.focus();
  state.opens++;
  cancelRunning();
  const tier = motionTier();
  const t0 = performance.now();
  if (tier === 'static') { state.openProps = []; state.lastOpenMs = 0; return; }
  const slide = tier === 'full';
  const opts = { duration: slide ? SLIDE.open : FADE, easing: slide ? SLIDE.easeIn : 'linear', fill: 'both' };
  state.openProps = slide ? ['transform'] : ['opacity'];
  running = [
    panel.animate(slide ? [{ transform: edge() }, { transform: 'none' }] : [{ opacity: 0 }, { opacity: 1 }], opts),
    scrim.animate([{ opacity: 0 }, { opacity: 1 }], { ...opts, easing: 'linear' }),
  ];
  running[0].finished.then(() => { state.lastOpenMs = Math.round(performance.now() - t0); }, () => {});
}

function close(by) {
  if (!dialog.open || state.closing) return;
  state.closing = true;
  state.closedBy = by;
  const t0 = performance.now();
  const done = () => { state.lastCloseMs = Math.round(performance.now() - t0); dialog.close(); };
  const tier = motionTier();
  if (tier === 'static') return done();
  // Closed while still opening: run the same animations backwards from where they are, no jump.
  const opening = running.find((a) => a.playState === 'running');
  if (opening) { for (const a of running) a.reverse(); return opening.finished.then(done, () => {}); }
  cancelRunning();
  const slide = tier === 'full';
  const opts = { duration: slide ? SLIDE.close : FADE, easing: slide ? SLIDE.easeOut : 'linear', fill: 'forwards' };
  running = [
    panel.animate(slide ? [{ transform: 'none' }, { transform: edge() }] : [{ opacity: 1 }, { opacity: 0 }], opts),
    scrim.animate([{ opacity: 1 }, { opacity: 0 }], { ...opts, easing: 'linear' }),
  ];
  running[0].finished.then(done, () => {});
}

dialog.addEventListener('close', () => {
  cancelRunning();
  state.closing = false;
  state.closes++;
  html.classList.remove('bag-open');
  opener.setAttribute('aria-expanded', 'false');
  opener.focus(); // showModal restores focus as well; explicit so every path agrees
});
// Diagnostic for the capture hook: focus should never land on the page behind an open bag.
document.addEventListener('focusin', (e) => { if (dialog.open && !dialog.contains(e.target)) state.focusOutside++; });
// Escape arrives as cancel: take it over so the close plays its tier instead of cutting.
dialog.addEventListener('cancel', (e) => { e.preventDefault(); close('escape'); });
opener.addEventListener('click', open);
scrim.addEventListener('click', () => close('scrim'));
for (const b of dialog.querySelectorAll('[data-bag-close]')) b.addEventListener('click', () => close(b.classList.contains('bag__back') ? 'empty-state' : 'button'));

render();

const describe = (el) => {
  if (!el || el === document.body) return 'body';
  return el.getAttribute('aria-label') || el.id || el.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) || el.tagName;
};
awards.addState(() => {
  const a = document.activeElement;
  return {
    motion: motionTier(),
    open: dialog.open,
    animating: running.some((x) => x.playState === 'running'),
    variant: state.variant,
    opens: state.opens,
    closes: state.closes,
    closedBy: state.closedBy,
    openProps: state.openProps,
    lastOpenMs: state.lastOpenMs,
    lastCloseMs: state.lastCloseMs,
    count: count(),
    countText: opener.textContent.replace(/\s+/g, ' ').trim(),
    expanded: opener.getAttribute('aria-expanded'),
    subtotal: subtotal(),
    subtotalText: subtotalEl.textContent,
    lines: lines().map((l) => ({ key: l.key, qty: l.qty })),
    announce: announce.textContent,
    bagAnnounce: bagAnnounce.textContent,
    demoNote: demoNote.textContent,
    checkouts: state.checkouts,
    focused: describe(a),
    focusInDialog: dialog.contains(a),
    focusOnOpener: a === opener,
    focusOutside: state.focusOutside,
    pageLocked: html.classList.contains('bag-open'),
    path: location.pathname + location.search,
  };
});
awards.ready();
