import { awards } from '../_shared/awards-hook.js';

awards.addState(() => {
  const image = document.querySelector('.editorial-feature img');
  const caption = document.querySelector('.editorial-feature figcaption');
  return {
    imageDecoded: !!image?.complete && !!image?.naturalWidth,
    imageWidth: image?.naturalWidth,
    imageHeight: image?.naturalHeight,
    imageLoading: image?.loading,
    belowFirstViewport: !!image && image.getBoundingClientRect().top + scrollY > innerHeight,
    captionBelowImage: !!caption && !!image && caption.getBoundingClientRect().top >= image.getBoundingClientRect().bottom,
  };
});
await document.fonts.ready;
awards.ready();
