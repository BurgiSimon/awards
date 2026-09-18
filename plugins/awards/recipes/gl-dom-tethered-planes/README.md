# gl-dom-tethered-planes

HTML lays out, WebGL renders. Every image stays an `<img>` with alt text; one absolutely positioned canvas is re-offset to the scroll each frame and draws a plane exactly over each image's rectangle, bending it with the scroll velocity. Without WebGL, or under reduced motion, the images are simply images.

## Why
- **The DOM is the layout engine.** Planes read `getBoundingClientRect()` every frame and write position and scale in pixel units through a camera whose distance makes one unit one pixel at depth zero: layout, responsive rules and lazy images keep working `[site:floema]` (`[pattern:webgl-architecture#html-lays-out-webgl-renders]`).
- **Absolute canvas, re-offset per frame.** A `position: fixed` canvas drifts against a smooth scroller; translating an absolute canvas to `scrollY` keeps DOM and GL in the same coordinate space with no scroll hijack `[site:oryzo]`.
- **Velocity is the input.** The bulge is `z −= (sin(uv.y·π) + sin(uv.x·π)) · |speed| · strength`, with speed damped from `lenis.velocity` (`k = 8`), so fast scrolling bends the images and rest flattens them `[site:floema]`.
- **Budget and fallback.** DPR and mesh segments come from the quality tier; textures are drawn through a 2D canvas capped at 1024 px; everything is disposed on `pagehide`; the canvas is `aria-hidden` and the source images stay in the tree.

## Parameters
Camera distance `1000` (fov from viewport height) · segments `32 / 16 / 8` by tier · strength `0.35` · damping `k = 8` · texture cap `1024 px`.

## Accessibility
Images keep `alt`, dimensions and `loading`; `visibility: hidden` only while the planes draw; no-GL and reduced-motion paths show the plain images.

## Adapters
- **OGL:** `new Plane(gl, { widthSegments: 32, heightSegments: 32 })` + a `Program` with the same shaders; map rects to viewport units instead of pixels.
- **R3F:** keep the rect loop in `useFrame`, write into refs, never into React state.

Seen in: `[site:floema]`, `[site:oryzo]`, `[site:trevor-noah]`, `[site:leo-parpeix]`.
