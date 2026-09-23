import { assertLayout } from '../_shared/verify-layout.mjs';
export { probeLayout as probe } from '../_shared/verify-layout.mjs';

export const states = [
  { name: 'desktop', scroll: 0 },
  { name: 'mobile', viewport: 'mobile', scroll: 0 },
  { name: 'reduced-motion', reducedMotion: true, scroll: 0 },
];

export function assert(results) {
  return [...assertLayout(results), ...Object.entries(results).flatMap(([name, { state, probe }]) => {
    const portrait = name === 'mobile';
    const file = portrait ? 'hero-portrait' : 'hero-wide';
    return [
      { ok: !state?.stateError && new RegExp(`${file}(?:-[^/]*)?\\.webp(?:\\?|$)`).test(state?.heroSource ?? ''), message: `${name}: ${file} image is selected` },
      { ok: !state?.stateError && state?.heroDecoded === true && state?.heroWidth === (portrait ? 1024 : 1586) && state?.heroHeight === (portrait ? 1536 : 992), message: `${name}: selected image decodes at its intrinsic size` },
      { ok: !!probe?.boxes?.['hero-copy'] && !!probe?.boxes?.['hero-media'] &&
        (portrait ? probe.boxes['hero-copy'].y < probe.boxes['hero-media'].y : probe.boxes['hero-copy'].x < probe.boxes['hero-media'].x),
        message: `${name}: headline and action precede media` },
      { ok: !!probe?.boxes?.['hero-media'] && Math.abs(probe.boxes['hero-media'].width / probe.boxes['hero-media'].height - (portrait ? 4 / 5 : 8 / 5)) < .01,
        message: `${name}: media reserves the intended aspect ratio` },
    ];
  })];
}
