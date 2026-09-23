// Keep all browser dependencies inside this function: Playwright serializes it.
export function probeLayout() {
  const visible = el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
  };
  return {
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    h1Count: document.querySelectorAll('h1').length,
    brokenVisibleImages: [...document.images]
      .filter(img => visible(img) && (!img.complete || !img.naturalWidth))
      .map(img => img.getAttribute('src')),
    unresolvedFragments: [...document.querySelectorAll('a[href^="#"]')]
      .map(a => a.getAttribute('href').slice(1))
      .filter(id => id && !document.getElementById(id)),
    boxes: Object.fromEntries([...document.querySelectorAll('[data-layout]')].map(el => {
      const r = el.getBoundingClientRect();
      return [el.dataset.layout, { x: r.x, y: r.y, width: r.width, height: r.height }];
    })),
  };
}

export function assertLayout(results) {
  return Object.entries(results).flatMap(([name, { probe }]) => [
    { ok: !!probe && !probe.overflow, message: `${name}: no horizontal overflow` },
    { ok: probe?.h1Count === 1, message: `${name}: one h1` },
    { ok: probe?.brokenVisibleImages?.length === 0, message: `${name}: visible images loaded` },
    { ok: probe?.unresolvedFragments?.length === 0, message: `${name}: local links resolve` },
  ]);
}
