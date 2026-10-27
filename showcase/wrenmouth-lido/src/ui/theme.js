// data-theme on <html> follows the chapter in view, so theme-color, the scrollbar and the selection
// belong to the ground the reader is looking at. Each section paints its own ground; this only follows it.
const colours = { concrete: '#E7E5DF', sea: '#22333B', pool: '#C9DDD8' };

export function initThemeFollow() {
  const meta = document.querySelector('meta[name="theme-color"]');
  const html = document.documentElement;
  const sections = [...document.querySelectorAll('main [data-theme], footer[data-theme]')];
  if (!sections.length) return;
  const apply = (theme) => {
    if (html.dataset.theme === theme) return;
    html.dataset.theme = theme;
    if (meta) meta.content = colours[theme] || colours.concrete;
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) apply(e.target.dataset.theme);
  }, { rootMargin: '-50% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
}
