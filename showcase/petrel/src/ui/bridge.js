// The bridge line follows the band under it: its theme is the depth band at its lower edge, its height is written
// for scroll-padding, and the chapter at 40 % of the viewport is marked current in the bridge nav and the phone list.
export function createBridge() {
  const root = document.documentElement;
  const bridge = document.querySelector('.bridge');
  const bands = [...document.querySelectorAll('main [data-theme], .plate')];
  const chapters = [...document.querySelectorAll('[data-chapter-at]')];
  const links = [...document.querySelectorAll('.bridge__nav a[href^="#"], .chapters a[href^="#"]')];
  let tops = [];
  let starts = [];
  let gap = 0;
  let shown = { theme: null, current: null };

  function measure() {
    root.style.setProperty('--bridge-h', `${Math.round(bridge.offsetHeight)}px`);
    tops = bands.map((el) => ({ top: el.getBoundingClientRect().top + scrollY, theme: el.dataset.theme || 'dark' }));
    starts = chapters.map((el) => ({ top: el.getBoundingClientRect().top + scrollY, id: el.id }));
    gap = innerHeight * 0.11; // half a thermocline: the band changes where the gradient is half way
    shown = { theme: null, current: null };
  }

  function update() {
    const edge = scrollY + bridge.offsetHeight + gap;
    let theme = tops[0]?.theme || 'surface';
    for (const b of tops) if (b.top <= edge) theme = b.theme;
    if (theme !== shown.theme) bridge.dataset.theme = shown.theme = theme;
    const probe = scrollY + innerHeight * 0.4;
    let current = starts[0]?.id;
    for (const c of starts) if (c.top <= probe) current = c.id;
    if (current !== shown.current) {
      shown.current = current;
      for (const a of links) {
        if (a.getAttribute('href') === `#${current}`) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      }
    }
    return { theme, chapter: current };
  }

  return { measure, update };
}
