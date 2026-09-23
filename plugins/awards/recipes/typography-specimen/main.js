import { awards } from '../_shared/awards-hook.js';

awards.addState(() => {
  const specimens = [...document.querySelectorAll('.type-specimen')];
  const clippedAncestors = new Set();
  const hiddenText = new Set();
  for (const specimen of specimens) {
    for (const el of [specimen, ...specimen.querySelectorAll('*')]) {
      if (![...el.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())) continue;
      for (let ancestor = el; ancestor; ancestor = ancestor.parentElement) {
        const css = getComputedStyle(ancestor);
        const name = ancestor.className || ancestor.tagName;
        if (['hidden', 'clip'].includes(css.overflowX) || ['hidden', 'clip'].includes(css.overflowY)
          || css.clipPath !== 'none' || css.maskImage !== 'none' || css.clip !== 'auto') clippedAncestors.add(name);
        if (css.display === 'none' || css.visibility !== 'visible' || Number(css.opacity) === 0) hiddenText.add(name);
      }
    }
  }
  return {
    specimens: specimens.map(el => ({
      copy: el.textContent.replace(/\s+/g, ' ').trim(),
      title: el.querySelector('h2')?.textContent.trim(),
      lead: el.querySelector('.type-specimen__lead')?.textContent.trim(),
      diagnostic: el.querySelector('.type-specimen__glyphs')?.textContent.trim(),
      intermediate: el.querySelector('h3')?.textContent.trim(),
      paragraph: el.querySelector('.type-specimen__copy')?.textContent.trim(),
      listItems: el.querySelectorAll('li').length,
      facts: [...el.querySelectorAll('dd')].map(dd => dd.textContent.trim()),
      caption: el.querySelector('figcaption')?.textContent.trim(),
    })),
    clippedAncestors: [...clippedAncestors],
    hiddenText: [...hiddenText],
  };
});
await document.fonts.ready;
awards.ready();
