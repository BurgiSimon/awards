import { assertLayout } from '../_shared/verify-layout.mjs';
export { probeLayout as probe } from '../_shared/verify-layout.mjs';

export const states = [
  { name: 'desktop', scroll: .60 },
  { name: 'mobile', viewport: 'mobile', scroll: .50 },
  { name: 'reduced-motion', reducedMotion: true, scroll: .60 },
];

export function assert(results) {
  return [...assertLayout(results), ...Object.entries(results).flatMap(([name, { state, probe }]) => {
    const figure = probe?.boxes?.['editorial-figure'];
    const copy = probe?.boxes?.['editorial-copy'];
    const mobile = name === 'mobile';
    return [
      { ok: !!figure && !!copy && (mobile
        ? copy.y >= figure.y + figure.height + 16
        : copy.x >= figure.x + figure.width + 16 && copy.y < figure.y + figure.height),
        message: `${name}: figure and copy occupy ${mobile ? 'ordered, non-overlapping rows' : 'separate, adjacent columns'}` },
      { ok: !state?.stateError && state?.imageDecoded === true && state?.imageWidth === 1536 && state?.imageHeight === 1024 && state?.imageLoading === 'lazy',
        message: `${name}: lazy joinery image decodes at its intrinsic size` },
      { ok: !state?.stateError && state?.belowFirstViewport === true,
        message: `${name}: lazy image begins below the opening viewport` },
      { ok: !state?.stateError && state?.captionBelowImage === true,
        message: `${name}: caption follows the image inside the figure` },
    ];
  })];
}
