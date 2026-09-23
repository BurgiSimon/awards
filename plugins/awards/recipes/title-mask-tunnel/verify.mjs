// Jump to the tunnel section's midpoint (half of its scrubbed range), then let the 0.6 s scrub catch up.
const toMid = [
  { type: 'waitFor', fn: "(() => { const s = document.querySelector('[data-tunnel]'); window.lenis.scrollTo(s.offsetTop + (s.offsetHeight - innerHeight) / 2, { immediate: true, force: true }); return true; })()" },
  { type: 'wait', ms: 1400 },
];

export const states = [
  { name: 'top', scroll: 0, settle: 800 },
  { name: 'mid', settle: 600, actions: toMid },
  { name: 'focus', settle: 600, actions: [{ type: 'focus', selector: '[data-scene] li:nth-child(4) a' }, { type: 'wait', ms: 2200 }] },
  { name: 'rm', scroll: 0.5, reducedMotion: true, settle: 800 },
  { name: 'static', scroll: 0.5, settle: 800, actions: [{ type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" }, { type: 'wait', ms: 300 }] },
  { name: 'mobile', viewport: 'mobile', settle: 600, actions: toMid },
];

export function probe() {
  const m = document.querySelector('[data-mask]').getBoundingClientRect();
  const lis = [...document.querySelectorAll('[data-scene] li')];
  const a = document.activeElement;
  const ar = a?.getBoundingClientRect();
  return {
    covers: m.left <= 0 && m.top <= 0 && m.right >= innerWidth && m.bottom >= innerHeight,
    mask: [m.left, m.top, m.width, m.height].map(Math.round),
    firstWidth: Math.round(lis[0].getBoundingClientRect().width),
    liTransforms: lis.map((el) => getComputedStyle(el).transform),
    links: document.querySelectorAll('ol[data-scene] > li > a[href]').length,
    heading: document.querySelector('[data-title]').tagName,
    titleOpacity: Number(getComputedStyle(document.querySelector('[data-title]')).opacity),
    focusIndex: lis.findIndex((el) => el.contains(a)),
    focusInView: !!ar && ar.width > 0 && ar.left >= 0 && ar.right <= innerWidth && ar.top >= 0 && ar.bottom <= innerHeight,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  };
}

export function assert(r) {
  const out = [];
  const s = (k) => r[k].state ?? {};
  const p = (k) => r[k].probe ?? {};

  out.push({ ok: s('top').mode === 'deep' && s('top').maskScale === 1 && p('top').covers === false, message: `before the section the doorway is at scale 1 (${s('top').maskScale}, rect ${p('top').mask})` });
  out.push({ ok: Math.abs((s('mid').progress ?? 0) - 0.5) < 0.05 && p('mid').covers === true && s('mid').maskScale > 1.5, message: `at the section midpoint the mask covers the viewport (progress ${s('mid').progress}, scale ${s('mid').maskScale}, rect ${p('mid').mask})` });
  out.push({ ok: s('mid').sceneZ > s('top').sceneZ + 500 && p('mid').firstWidth > p('top').firstWidth * 1.5, message: `works moved in z (scene z ${s('top').sceneZ} → ${s('mid').sceneZ}, first work ${p('top').firstWidth} → ${p('mid').firstWidth} px wide)` });
  out.push({ ok: p('top').titleOpacity === 1 && p('mid').titleOpacity === 0 && p('mid').heading === 'H2', message: `title is a real <h2>, readable at the door and faded inside (${p('top').titleOpacity} → ${p('mid').titleOpacity})` });

  const want = 4 * 700 - 300;
  out.push({ ok: p('focus').focusIndex === 3 && Math.abs((s('focus').sceneZ ?? 0) - want) < 150 && p('focus').focusInView, message: `keyboard focus on work 4 flies it to the front (scene z ${s('focus').sceneZ}, want ≈${want}; in view ${p('focus').focusInView})` });

  for (const k of ['rm', 'static']) {
    out.push({ ok: s(k).motion === (k === 'rm' ? 'reduced' : 'static') && s(k).mode === 'flat' && p(k).liTransforms?.every((t) => t === 'none') && s(k).maskScale === 1 && p(k).links === 6 && p(k).titleOpacity === 1, message: `${k}: works render as a plain list of ${p(k).links} links, no 3D transform (${[...new Set(p(k).liTransforms ?? [])]}), mask scale ${s(k).maskScale}` });
  }

  out.push({ ok: p('mobile').covers === true && s('mobile').sceneZ > 500 && p('mobile').overflow === false, message: `mobile: mask covers at midpoint (rect ${p('mobile').mask}), scene z ${s('mobile').sceneZ}, no horizontal overflow` });
  out.push({ ok: ['top', 'mid', 'rm'].every((k) => p(k).overflow === false), message: 'no horizontal overflow' });
  return out;
}
