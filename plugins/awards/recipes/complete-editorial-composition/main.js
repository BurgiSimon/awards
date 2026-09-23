import { awards } from '../_shared/awards-hook.js';

awards.addState(() => ({
  sections: [...document.querySelectorAll('main > section, footer')].map(el => el.id),
  mainCount: document.querySelectorAll('main').length,
  headerCount: document.querySelectorAll('header').length,
  footerCount: document.querySelectorAll('footer').length,
  skipHref: document.querySelector('.composition-skip')?.getAttribute('href'),
  imageCount: document.images.length,
  completeAlt: [...document.images].every(img => img.alt.trim().length > 20),
  facts: [...document.querySelectorAll('.product-spec dd')].map(el => el.textContent.trim()),
  careOpen: document.querySelector('#care-details')?.open,
  summaryFocused: document.activeElement === document.querySelector('#care-summary'),
  heroSource: document.querySelector('.art-hero img')?.currentSrc,
}));
await Promise.all([document.fonts.ready, document.querySelector('.art-hero img')?.decode()]);
awards.ready();
