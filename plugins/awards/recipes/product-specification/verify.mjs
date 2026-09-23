import { assertLayout } from '../_shared/verify-layout.mjs';
export { probeLayout as probe } from '../_shared/verify-layout.mjs';

const careActions = [
  { type: 'focus', selector: '#care-summary' },
  { type: 'press', key: 'Enter' },
];

export const states = [
  { name: 'desktop', scroll: .25 },
  { name: 'mobile', viewport: 'mobile', scroll: .35 },
  { name: 'care-keyboard', actions: careActions },
  { name: 'care-keyboard-mobile', viewport: 'mobile', actions: careActions },
];

export function assert(results) {
  return [...assertLayout(results), ...Object.entries(results).flatMap(([name, { state, probe }]) => {
    const figure = probe?.boxes?.['spec-figure'];
    const facts = probe?.boxes?.['spec-facts'];
    const mobile = name.includes('mobile');
    const opened = name.startsWith('care-keyboard');
    const text = state?.specificationText ?? '';
    return [
      { ok: !!figure && !!facts && (mobile
        ? facts.y >= figure.y + figure.height - 1
        : facts.x >= figure.x + figure.width - 1 && facts.y < figure.y + figure.height),
        message: `${name}: profile and facts use ${mobile ? 'ordered rows' : 'adjacent columns'}` },
      { ok: !state?.stateError && state?.specificationTerms === 6 && state?.specificationDescriptions === 6,
        message: `${name}: six specification terms and descriptions` },
      { ok: ['140 cm', '38 cm', '45 cm', 'White oak', 'Repairable mechanical joints', 'Hardwax-oil finish'].every(value => text.includes(value)),
        message: `${name}: fictional facts and measurement units appear in DOM text` },
      { ok: !state?.stateError && state?.careOpen === opened,
        message: `${name}: care disclosure ${opened ? 'opens with Enter' : 'starts closed'}` },
      { ok: !state?.stateError && state?.enquiryHref === '#enquiry' && state?.enquiryTarget === true,
        message: `${name}: primary enquiry fragment resolves` },
      { ok: !state?.stateError && state?.profileDecoded === true && state?.profileWidth === 1536 && state?.profileHeight === 1024,
        message: `${name}: product profile decodes at intrinsic size` },
    ];
  })];
}
