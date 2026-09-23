import { assertLayout } from '../_shared/verify-layout.mjs';
export { probeLayout as probe } from '../_shared/verify-layout.mjs';

export const states = [
  { name: 'desktop-top', scroll: 0 },
  { name: 'desktop-quarter', scroll: 0.25 },
  { name: 'desktop-middle', scroll: 0.5 },
  { name: 'desktop-three-quarter', scroll: 0.75 },
  { name: 'desktop-end', scroll: 1 },
  { name: 'mobile-top', viewport: 'mobile', scroll: 0 },
  { name: 'mobile-quarter', viewport: 'mobile', scroll: 0.25 },
  { name: 'mobile-middle', viewport: 'mobile', scroll: 0.5 },
  { name: 'mobile-three-quarter', viewport: 'mobile', scroll: 0.75 },
  { name: 'mobile-end', viewport: 'mobile', scroll: 1 },
  { name: 'reduced-motion', reducedMotion: true, scroll: 0.5 },
];

export function assert(results) {
  return [...assertLayout(results), ...Object.entries(results).flatMap(([name, { state }]) => {
    const specimens = state?.specimens;
    return [
      { ok: !state?.stateError && specimens?.length === 3 && specimens.every(s =>
        s.title === 'Made to stay in use.'
        && s.lead === 'A clear form, a repairable joint, and a surface that records daily life.'
        && s.intermediate === 'Typography, paying attention'
        && s.diagnostic === 'gypqj ÅÉ'
        && s.paragraph?.length > 100
        && s.listItems === 3 && s.facts.join('|') === '1,400 mm|380 mm|450 mm'
        && !!s.caption && s.copy === specimens[0].copy),
      message: `${name}: three complete specimens retain identical copy, diagnostic glyphs and units` },
      { ok: !state?.stateError && state?.clippedAncestors?.length === 0 && state?.hiddenText?.length === 0,
        message: `${name}: resting specimen text has no clipping/masking ancestors or hidden styles` },
    ];
  })];
}
