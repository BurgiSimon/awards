// Palette as navigation (DESIGN.md ## Colors): one ground on screen at a time. <html data-theme> follows the chapter
// whose box holds the viewport's middle line; inside it, a part that carries its own ground (the Judge run of
// "How a build goes") takes over once its top has passed the line and holds to the chapter's end. The band, the
// scrollbar and theme-color follow; the swap itself is the CSS transition on <html>'s background. On home the band's
// chapter row marks the chapter being read (walk 6: a depth cue by name). Read on the one ticker.
import { ticker } from '../lib/raf.js';

const GROUND = {
  ship: '#5cb973',
  fix: '#d1942b',
  rebuild: '#eb7357',
  recapture: '#76a1ef',
};

export function initTheme() {
  const root = document.documentElement;
  const chapters = [...document.querySelectorAll('main .chapter[data-theme]')];
  const links = new Map([...document.querySelectorAll('.band__chapters a[data-chapter]')].map((a) => [a.dataset.chapter, a]));
  const meta = document.querySelector('meta[name="theme-color"]');
  let current = null;
  const set = (theme) => {
    if (!theme || root.dataset.theme === theme) return;
    root.dataset.theme = theme;
    if (meta && GROUND[theme]) meta.setAttribute('content', GROUND[theme]);
  };
  const mark = (id) => {
    if (id === current) return;
    current = id;
    for (const [key, a] of links) {
      if (key === id) {
        a.setAttribute('aria-current', 'true');
        // Keep the current name in view on a phone, where the row scrolls sideways.
        const row = a.closest('ol');
        if (row && row.scrollWidth > row.clientWidth) row.scrollTo({ left: a.offsetLeft - 16, behavior: 'auto' });
      } else a.removeAttribute('aria-current');
    }
  };
  if (!chapters.length) return { current: () => root.dataset.theme };
  let lastY = -1;
  let lastH = -1;
  const update = () => {
    const y = window.scrollY;
    const h = window.innerHeight;
    if (y === lastY && h === lastH) return;
    lastY = y;
    lastH = h;
    const mid = h / 2;
    let chapter = chapters[0];
    for (const el of chapters) if (el.getBoundingClientRect().top <= mid) chapter = el;
    const parts = [...chapter.querySelectorAll('[data-theme]')].filter((el) => el.getBoundingClientRect().top <= mid);
    set(parts.at(-1)?.dataset.theme ?? chapter.dataset.theme);
    mark(chapter.id);
  };
  ticker.add(update);
  update();
  return { current: () => root.dataset.theme, chapter: () => current, update };
}
