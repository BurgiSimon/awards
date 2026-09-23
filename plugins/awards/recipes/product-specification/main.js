import { awards } from '../_shared/awards-hook.js';

awards.addState(() => {
  const spec = document.querySelector('.product-spec');
  const image = spec?.querySelector('img');
  const enquiry = document.querySelector('.enquiry-action');
  return {
    specificationTerms: spec?.querySelectorAll('dt').length,
    specificationDescriptions: spec?.querySelectorAll('dd').length,
    specificationText: spec?.querySelector('dl')?.textContent ?? '',
    careOpen: document.querySelector('#care-details')?.open,
    enquiryHref: enquiry?.getAttribute('href'),
    enquiryTarget: !!document.querySelector(enquiry?.getAttribute('href') ?? ''),
    profileDecoded: !!image?.complete && !!image?.naturalWidth,
    profileWidth: image?.naturalWidth,
    profileHeight: image?.naturalHeight,
  };
});
await Promise.all([document.fonts.ready, document.querySelector('.product-spec img')?.decode()]);
awards.ready();
