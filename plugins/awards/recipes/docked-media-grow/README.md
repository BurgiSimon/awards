# docked-media-grow

The reel is on screen from the first frame as a small card docked in the bottom-right corner. As its section arrives, a scrubbed scale grows the card to the viewport minus the gutter. At the moment the section's top reaches the viewport's, the card leaves `position: fixed` and scrolls away with the section like any other block. Where `scroll-pin-scrub` holds a stage while a timeline plays `[recipe:scroll-pin-scrub]`, this moves a piece of media from the page's chrome into its content.

## Why
- **The dock earns its full screen.** The reel is present without taking the hero, and it arrives full-bleed exactly where the page is ready for it `[site:wearedirect]`.
- **Transform, not width and height.** The reel is laid out at its final box: in the section, or while docked a fixed box at the same inset. Docking is only `scale` around the bottom-right corner (`transform-origin: 100% 100%`), so that corner stays at the gutter corner at every scale and nothing needs a translate. The source sites tween width and height, which relays out every frame `[site:wearedirect]` `[site:noth]`. Because the scale is uniform, the docked card keeps the viewport's aspect.
- **The hand-off costs nothing.** The fixed box (`inset: var(--gutter)`) and the in-flow box (the section's content box, `100svh` with the gutter as padding) coincide when the section's top reaches the viewport's top. The scrub's `end` is that point, and `onLeave` / `onEnterBack` swap the class. `scrub: true` (no catch-up) makes sure the tween is already at scale 1 when the swap happens. The section's height is explicit, so taking the reel out of flow never moves anything below.
- **The scrub is linear.** `ease: 'none'`; the smoothing is Lenis', on the GSAP ticker.
- **The label is not scaled.** The *Watch the reel* link is a sibling pinned over the dock, not a child of the reel, so its text stays at full size. It fades out over the first 15 % of the grow and becomes `visibility: hidden`, which also takes it out of the tab order. Clicking it scrolls to the section over 1.2 s.

## Parameters
Dock width `300 px`, capped at `0.24` of the final box · trigger `top 85%` → `top top` of the section · `scrub: true`, `ease: 'none'` · cue fade `0 → .15` of the scrub · dock only at `min-width: 1024px` · placeholder film: bands with a period of one reel width, drifted `translateX(-50%)` over 18 s.

## Motion tiers
- **Full, ≥ 1024 px:** dock, grow and hand-off; the film drifts.
- **Full, under 1024 px:** no dock (a fixed card would cover a phone's content). The reel sits in the flow, as on the source site.
- **Reduced / static:** no dock, the reel sits full-size in its section, the film is still, and there is no cue. Tiers follow the media query and `data-motion` on `<html>`. `gsap.matchMedia` reverts the timeline, its ScrollTrigger and the inline transform on every tier or breakpoint change.
- **No JavaScript:** the reel is in the flow and the cue stays `hidden`.

## Accessibility
The section has a real heading. The placeholder is `role="img"` with a label. A real reel needs a `<video>` with a visible play / pause control and captions if it carries speech. The cue is a real link to `#reel`, so it works without JavaScript. The native scrollbar and keyboard scrolling are untouched.

## Demo content
The studio, the "Reel ’26" frame and its colours are synthetic demo content. The film is a CSS-animated gradient, so the recipe ships no media or font files. All type uses system font stacks.

## Adapters
- **Video reel:** put a muted `playsinline loop` `<video>` with a `poster` in `.reel` in place of `.reel__film`. Pause it on the poster under reduced motion, and pause it when the section and the dock are both out of view.
- **Reverse (noth):** scrub `scale` from 1 down to the frame's size as the section leaves (`start: 'bottom bottom'`). Use the frame's rect for the `transform-origin` and add a translate if the frame is not at a corner.
- **Non-viewport aspect:** if the dock must be square while the final box is wide, keep the uniform scale and crop the dock with `clip-path: inset()` tweened in the same timeline, never `scaleX` ≠ `scaleY`, which squashes the media and the corner radius.
- **React / Vue / Svelte:** create the timeline in `useGSAP` / a mount effect with `gsap.matchMedia()`, and revert it on unmount.

Seen in: `[site:wearedirect]`, `[site:noth]`.
