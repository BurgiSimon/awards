import { awards } from '../_shared/awards-hook.js';

awards.addState(() => {
  const footer = document.querySelector('.designed-close');
  const link = footer?.querySelector('.designed-close__primary');
  const rect = link?.getBoundingClientRect();
  const outline = link && getComputedStyle(link);
  return {
    viewportHeight: innerHeight,
    heading: footer?.querySelector('h2')?.textContent.trim(),
    footerLandmarks: document.querySelectorAll('footer').length,
    sectionLinks: [...(footer?.querySelectorAll('nav a') ?? [])].map(a => a.getAttribute('href')),
    backToTop: footer?.querySelector('.designed-close__top')?.getAttribute('href'),
    primary: {
      href: link?.getAttribute('href'),
      accessibleName: link?.getAttribute('aria-label')?.trim() || link?.textContent.trim(),
      focused: document.activeElement === link,
      focusVisible: !!link?.matches(':focus-visible'),
      rect: rect && { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      outline: outline && { style: outline.outlineStyle, width: parseFloat(outline.outlineWidth), color: outline.outlineColor },
    },
  };
});
await document.fonts.ready;
awards.ready();
