import { awards } from '../_shared/awards-hook.js';

awards.addState(() => {
  const img = document.querySelector('.art-hero img');
  return { heroSource: img?.currentSrc ?? null, heroDecoded: !!img?.complete && !!img?.naturalWidth, heroWidth: img?.naturalWidth, heroHeight: img?.naturalHeight };
});
await Promise.all([document.fonts.ready, document.querySelector('.art-hero img')?.decode()]);
awards.ready();
