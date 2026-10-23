// STORY's interruption (AWARDS.md; Page map row 3): chapter 3's frame grows out of the strip to the content
// column, scrubbed on the chapter's window, holds in the paper while the figures read beside it, and returns into
// the strip at exit. [recipe:docked-media-grow]'s mechanism: the plate is laid out at its final box and only ever
// transformed (uniform scale from its top-left corner plus a sideways translate), so nothing relayouts. The dock is
// the strip column itself: at g = 0 the plate sits under the rebate at the width of the strip's own frames, in its
// own row, so it slides out from under the strip and grows into the paper, and slides back under at exit. It stays
// in its own row the whole way, so it never passes over a line of text. Scrubbed, so linear: g is the master
// timeline's proxy, 0 under the strip, 1 in the paper.
//   desktop and tablet, full tier only; reduced and static: placed (no transform); phone: inline at full width.

export function createLoupe({ strip }) {
  const box = document.querySelector('.proof__loupe');
  if (!box || !strip) return null;
  const proxy = { g: 0 };
  let plate = null;
  let link = null;
  let applied = false;
  let win = null;

  const visibleLink = () => [...box.querySelectorAll('.loupe-frame__link')].find((a) => a.getClientRects().length) ?? null;

  // The windows in page pixels. Grow while the plate's top travels up from the viewport's foot, done by the time the
  // whole plate is on screen (its foot at the viewport's foot; never later than its top at 15 % down). Hold at the
  // laid-out box, where the reduced tier places it, for as long as the figures beside it are read: until the figures
  // column's foot reaches the viewport's top (ship, jury 2026-10-22 craft 1). Return as the plate leaves through the
  // top; when the figures run longer than the plate, it has already scrolled away at full size by then.
  function measure() {
    plate = box.querySelector('.loupe-frame__plate');
    link = visibleLink();
    clear();
    if (!plate || !link) { win = null; return null; }
    const top = box.getBoundingClientRect().top + scrollY + plate.offsetTop;
    const h = plate.offsetHeight;
    const vh = innerHeight;
    const enter = top - vh;
    const held = Math.min(top - vh * 0.15, Math.max(top + h - vh, enter + vh * 0.25));
    const figures = document.getElementById('proof-figures');
    const read = figures?.getClientRects().length ? figures.getBoundingClientRect().bottom + scrollY : top;
    const out = Math.max(top, held + 1, read);
    win = { in: enter, held, out, gone: Math.max(top + h, out + 1) };
    return win;
  }

  function clear() {
    if (!applied || !plate) return;
    plate.style.transform = '';
    plate.classList.remove('is-flying');
    applied = false;
  }

  // Called every tick after the master timeline has set proxy.g for this scroll position.
  function render() {
    if (!win || !plate || !link) return;
    const sy = scrollY;
    const g = proxy.g;
    if (sy <= win.in || sy >= win.gone || g >= 1) { clear(); return; }
    const img = link.querySelector('img');
    const dock = strip.frameImage(link.dataset.frame);
    if (!img || !dock) { clear(); return; }
    // Layout boxes, never the transformed ones: the plate's from its offsets, the picture's inset inside it.
    const b = box.getBoundingClientRect();
    const px = b.left + plate.offsetLeft;
    const ix = img.offsetLeft;
    const a = dock.getBoundingClientRect();
    const s0 = a.width / Math.max(1, img.offsetWidth);
    const s = s0 + (1 - s0) * g;
    // At g = 0 the plate's picture lines up with the strip's pictures, under the rebate; at g = 1 it is in its box.
    const tx = (a.left - (px + ix * s0)) * (1 - g);
    plate.style.transform = `translate3d(${tx.toFixed(2)}px, 0, 0) scale(${s.toFixed(4)})`;
    if (!applied) { plate.classList.add('is-flying'); applied = true; }
  }

  return {
    proxy,
    measure,
    render,
    state: () => ({ g: Number(proxy.g.toFixed(3)), flying: applied, window: win && Object.fromEntries(Object.entries(win).map(([k, v]) => [k, Math.round(v)])) }),
    destroy() { clear(); proxy.g = 0; win = null; },
  };
}
