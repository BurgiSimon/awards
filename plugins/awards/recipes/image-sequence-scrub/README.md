# image-sequence-scrub

Author the object offline (Cinema 4D, Blender), export a frame sequence, decode it up front and draw the frame the scroll selects. The "3D site" read for a fraction of the runtime cost and none of the WebGL fallback burden.

## Why
- **Pre-rendered beats real-time when the object is the point.** Lighting and materials come from the renderer, not the GPU budget `[site:seasats]` (`[pattern:webgl-architecture#the-depth-ladder]`).
- **Decode before you scrub.** Frames are loaded and counted before the trigger arms, so the sequence never stutters on first scroll and the count feeds the preloader's real signal (`[recipe:preloader-counter-hold]`).
- **Poster in the DOM.** A real `<img>` with alt text stays for no-JS, no-canvas and reduced-motion visitors, who get one chosen frame.

## Parameters
`48` frames · section `300svh` · `scrub: 0.5` · reduced motion shows frame `24`.

## Replacing the stand-in
Swap `makeFrame` for `fetch(`frames/${String(i + 1).padStart(4, '0')}.jpg`).then(r => r.blob()).then(createImageBitmap)`; keep frames at 1280 px wide and under 60 KB each (AVIF or WebP), and load lazily beyond the first 12 if the sequence is long.

Seen in: `[site:seasats]`.
