# marquee-raf-mask

A ticker driven by the shared ticker rather than a CSS keyframe loop: the position is a float, so it can pause on hover and focus, resume without a jump, take speed from scroll velocity, stop off-screen and stand still under reduced motion. Edges fade through `mask-image`; the links inside stay real.

## Why
- **Keyframes cannot pause well.** `animation-play-state` freezes mid-frame and cannot vary speed; a rAF float can do both (`[site:seasats]`, described through a third-party rebuild).
- **Velocity as an input.** Speed is `80 px/s + |lenis.velocity| × 0.6`, damped with `k = 6`, so a flick of the wheel flicks the band and decays (`[pattern:motion-vocabulary#velocity-as-an-input]`).
- **Wraparound at one copy's width.** The content is cloned until it covers twice the container; clones are `aria-hidden` and untabbable so screen readers hear the list once.
- **Off-screen and reduced-motion stop.** An IntersectionObserver unsubscribes the frame; under reduced motion the band becomes an ordinary overflow row with no mask.

## Parameters
Base `80 px/s` · velocity share `0.6` · damping `k = 6` · mask fade `8 %` each edge · clones until `2 × clientWidth`.

## Accessibility
Original items are real links; pause on `focusin` so a keyboard user can read; `overflow-x: auto` under reduced motion so nothing is unreachable.

## Adapters
- **anime.js:** `createTimer({ onUpdate: self => … })` with the same float and wrap.
- **GSAP:** the official `horizontalLoop` helper with `paused` toggles; keep `ease: 'none'`.

Seen in: `[site:seasats]`, `[site:mindmarket]`.
