import { assertLayout } from '../_shared/verify-layout.mjs';
export { probeLayout as probe } from '../_shared/verify-layout.mjs';

const careActions = [{ type: 'focus', selector: '#care-summary' }, { type: 'press', key: 'Enter' }];
export const states = [
  { name: 'desktop-top', scroll: 0 },
  { name: 'desktop-middle', scroll: .5 },
  { name: 'desktop-end', scroll: 1 },
  { name: 'mobile-top', viewport: 'mobile', scroll: 0 },
  { name: 'mobile-middle', viewport: 'mobile', scroll: .5 },
  { name: 'mobile-end', viewport: 'mobile', scroll: 1 },
  { name: 'reduced-motion', reducedMotion: true, scroll: .5 },
  { name: 'care-open', actions: careActions },
  { name: 'care-open-mobile', viewport: 'mobile', actions: careActions },
];
export function assert(results) {
  return [...assertLayout(results), ...Object.entries(results).flatMap(([name, { state, probe }]) => [
    { ok: !state?.stateError && state?.sections?.join('|') === 'hero|materials|specification|care|enquire', message: `${name}: five component sections retain their reading order` },
    { ok: state?.mainCount === 1 && state?.headerCount === 1 && state?.footerCount === 1 && state?.skipHref === '#main', message: `${name}: document landmarks and working skip target` },
    { ok: state?.imageCount === 3 && state?.completeAlt === true, message: `${name}: three product views have complete alt text` },
    { ok: state?.facts?.join('|') === '140 cm|38 cm|45 cm|White oak|Repairable mechanical joints|Hardwax-oil finish', message: `${name}: semantic specifications retain units` },
    { ok: state?.careOpen === name.startsWith('care-open') && (!name.startsWith('care-open') || state?.summaryFocused === true), message: `${name}: native care disclosure opens from the keyboard` },
    { ok: new RegExp(`${name.includes('mobile') ? 'hero-portrait' : 'hero-wide'}(?:-[^/]*)?\\.webp`).test(state?.heroSource ?? ''), message: `${name}: art-directed hero source matches the viewport` },
    { ok: ['hero', 'materials', 'specification', 'care', 'enquire'].every(id => probe?.boxes?.[id]?.height > 0), message: `${name}: all five components render` },
  ])];
}
