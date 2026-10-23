// SIGNATURE (AWARDS.md): the strip follows the reader. The frame column translates so the frame shot at stop k
// centres beside the viewport when page progress p equals k/100: linear in p between stops, eased to its target at
// lerp .12 on the shared ticker, positional only (nothing here reads scroll speed). The column is clamped at both
// ends so it never shows empty rebate: s00 sits under the head at the top of the page, s100 above the caption at the
// end. The frame nearest p, within .125, is current: aria-current and a 2 px ink outline. While a frame has keyboard
// focus the column shows that frame instead, so arrows and Home/End never step onto a frame cut off by the rebate.
//   full     the damped follow
//   reduced  the column jumps to the current frame's place when the current frame changes; no travel
//   static   nothing moves; the column scrolls on its own, as without script
import { damp, lerpToK, clamp } from '../lib/raf.js';

const K = lerpToK(0.12); // ≈ 7.67 per second: a .12 per-frame lerp at 60 fps, identical at any refresh rate
const WINDOW = 12.5; // a frame is current while |p − k/100| < .125

export function createStrip({ tier, onCurrent }) {
  const strip = document.querySelector('.strip');
  if (!strip) return null;
  let list = null;
  let items = [];
  let viewH = 0;
  let minY = 0;
  let y = null;
  let target = 0;
  let currentItem = null;
  let focusItem = null;
  let focusP = 0;
  const waiters = new Set();

  const visibleList = () => [...strip.querySelectorAll(':scope > .strip__list')].find((l) => l.getClientRects().length) ?? null;

  function measure() {
    const next = visibleList();
    if (next !== list) {
      if (list) list.style.transform = '';
      list = next;
      y = null;
      currentItem = null;
    }
    if (!list) { items = []; return; }
    // offsetTop is the layout position inside .strip, untouched by the column's own transform.
    items = [...list.children].filter((li) => li.matches('.strip__item[data-stop]')).map((li) => {
      const a = li.querySelector(':scope > a.frame');
      return { li, a, stop: Number(li.dataset.stop), c: a.offsetTop + a.offsetHeight / 2 };
    }).sort((p, q) => p.stop - q.stop);
    const caption = strip.querySelector(':scope > .strip__caption');
    viewH = strip.clientHeight - (caption?.offsetHeight ?? 0);
    minY = Math.min(0, viewH - (list.offsetTop + list.offsetHeight) - 12);
  }

  function centreAt(p) {
    const k = p * 100;
    if (!items.length) return 0;
    if (k <= items[0].stop) return items[0].c;
    for (let i = 1; i < items.length; i++) {
      if (k <= items[i].stop) {
        const a = items[i - 1];
        const b = items[i];
        return a.c + ((b.c - a.c) * (k - a.stop)) / Math.max(1e-6, b.stop - a.stop);
      }
    }
    return items[items.length - 1].c;
  }

  const placeFor = (c) => clamp(viewH / 2 - c, minY, 0);

  function nearest(p) {
    const k = p * 100;
    let best = null;
    for (const it of items) if (Math.abs(it.stop - k) < WINDOW && (!best || Math.abs(it.stop - k) < Math.abs(best.stop - k))) best = it;
    return best;
  }

  function setCurrent(it) {
    if (it === currentItem) return;
    currentItem?.a.removeAttribute('aria-current');
    currentItem = it;
    it?.a.setAttribute('aria-current', 'true');
    // The roving tab stop rests on the current frame while focus is outside the strip.
    if (it && !strip.contains(document.activeElement)) {
      for (const link of list.querySelectorAll('a[data-at]')) link.setAttribute('tabindex', link === it.a ? '0' : '-1');
    }
    onCurrent?.(it?.li ?? null);
  }

  function write(v) {
    if (y !== null && Math.abs(v - y) < 0.01) return;
    y = v;
    list.style.transform = `translate3d(0, ${v.toFixed(2)}px, 0)`;
  }

  // Keyboard focus inside the strip shows the focused frame; it lets go once the page itself moves.
  const onFocusIn = (e) => {
    const li = e.target.closest?.('.strip__item');
    const it = items.find((x) => x.li === li);
    if (it && e.target.matches(':focus-visible')) { focusItem = it; focusP = -1; }
  };
  const onFocusOut = (e) => { if (!strip.contains(e.relatedTarget)) focusItem = null; };
  // A focused link inside an overflow-hidden column makes the browser scroll the column; the transform owns it.
  const onScroll = () => { if (tier !== 'static' && strip.scrollTop) strip.scrollTop = 0; };
  strip.addEventListener('focusin', onFocusIn);
  strip.addEventListener('focusout', onFocusOut);
  strip.addEventListener('scroll', onScroll);

  function tick(p, dt) {
    if (!list) return;
    setCurrent(nearest(p));
    if (tier === 'static') return;
    if (focusItem) {
      if (focusP < 0) focusP = p;
      else if (Math.abs(p - focusP) > 0.02) focusItem = null;
    }
    const anchor = focusItem ?? (tier === 'reduced' ? currentItem : null);
    target = placeFor(anchor ? anchor.c : centreAt(p));
    if (tier === 'reduced' || y === null) write(target);
    else {
      let next = damp(y, target, K, dt);
      if (Math.abs(next - target) < 0.05) next = target;
      write(next);
    }
    if (waiters.size && Math.abs(y - target) < 0.5) { for (const w of waiters) w(); waiters.clear(); }
  }

  return {
    measure,
    tick,
    get list() { return list; },
    // The strip frame a picture belongs to, as it sits on screen now (the loupe grows out of it and returns to it).
    frameImage(id) {
      if (!list) return null;
      const a = id ? list.querySelector(`a.frame[data-frame="${CSS.escape(id)}"]`) : list.querySelector('.strip__item[data-stop="0"] > a.frame');
      return a?.querySelector('.frame__img') ?? null;
    },
    settled() {
      if (!list || tier !== 'full' || (y !== null && Math.abs(y - target) < 0.5)) return Promise.resolve();
      return new Promise((r) => waiters.add(r));
    },
    state() {
      return {
        current: currentItem ? `s${String(currentItem.stop).padStart(2, '0')}` : null,
        y: y === null ? null : Number(y.toFixed(1)),
        target: Number(target.toFixed(1)),
        range: [Number(minY.toFixed(1)), 0],
        focus: focusItem ? `s${String(focusItem.stop).padStart(2, '0')}` : null,
      };
    },
    destroy() {
      strip.removeEventListener('focusin', onFocusIn);
      strip.removeEventListener('focusout', onFocusOut);
      strip.removeEventListener('scroll', onScroll);
      setCurrent(null);
      if (list) list.style.transform = '';
      for (const w of waiters) w();
      waiters.clear();
    },
  };
}
