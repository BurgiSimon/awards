import { assertLayout } from '../_shared/verify-layout.mjs';
export { probeLayout as probe } from '../_shared/verify-layout.mjs';

const focus = [
  { type: 'focus', selector: '.designed-close__primary' },
  { type: 'press', key: 'Shift+Tab' },
  { type: 'press', key: 'Tab' },
];

export const states = [
  { name: 'desktop-top', scroll: 0 },
  { name: 'desktop-context', scroll: .5 },
  { name: 'desktop-end', scroll: 1 },
  { name: 'mobile-top', viewport: 'mobile', scroll: 0 },
  { name: 'mobile-context', viewport: 'mobile', scroll: .5 },
  { name: 'mobile-end', viewport: 'mobile', scroll: 1 },
  { name: 'desktop-focus', actions: focus },
  { name: 'mobile-focus', viewport: 'mobile', actions: focus },
];

export function assert(results) {
  return [...assertLayout(results), ...Object.entries(results).flatMap(([name, { state, probe }]) => {
    const link = state?.primary;
    const focused = name.endsWith('focus');
    const close = probe?.boxes?.close;
    return [
      { ok: !state?.stateError && state?.heading === 'Make room for something lasting.' && state?.footerLandmarks === 1,
        message: `${name}: one authored close with the requested heading` },
      { ok: !state?.stateError && state?.sectionLinks?.join('|') === '#materials|#specifications|#care' && state?.backToTop === '#top',
        message: `${name}: section links and native back-to-top action` },
      { ok: !state?.stateError && link?.href === 'mailto:studio@alder.example' && !!link?.accessibleName,
        message: `${name}: enquiry link has the real mailto destination and a name` },
      { ok: !state?.stateError && link?.rect?.width >= 44 && link?.rect?.height >= 44,
        message: `${name}: enquiry target is at least 44 × 44 CSS pixels` },
      { ok: !focused || (!state?.stateError && link?.focused === true && link?.focusVisible === true && link?.outline?.style !== 'none' && link?.outline?.width >= 2),
        message: `${name}: keyboard focus has a visible computed outline` },
      { ok: !name.endsWith('-end') || (!!close && close.y >= -1 && close.y + close.height <= state?.viewportHeight + 1),
        message: `${name}: complete close fits the final viewport` },
    ];
  })];
}
