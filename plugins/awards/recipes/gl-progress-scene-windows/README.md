# gl-progress-scene-windows

One value owns the film. The scroll position inside a tall track is a raw 0–1; a piecewise-linear map turns raw into progress so that two **stretch bands** cost more scroll; a **clock** follows that target at no more than `K × dt / FILM_SECONDS` per frame, so a flick cannot skip a beat; and five **scene windows** read the clock, each switched on half-way into the one before and switched off half-way into the next. Windows toggle `visible`, they are never destroyed. All scenes are generated geometry; the demo copy and beat names are synthetic.

## Why
- **Spend scroll where the beat is dense.** A band that costs 2× the scroll gives a beat time without re-timing its scene: the camera, windows and HUD still read plain progress `[site:edolus]`. Overlapping bands are discarded, not merged, so the table stays readable.
- **Switch scenes on ahead, off behind.** A neighbour is live before the camera reaches it (shaders compiled, buffers uploaded, no pop) and dropped once it is well behind; a per-window `dropPrevAt` / `preloadNextAt` override keeps one hand-off live longer `[site:edolus]`. Mount-and-dispose policy for whole routes stays in `[pattern:webgl-architecture#scene-windows-and-disposal]`.
- **A speed limit on the clock.** The target may jump, the clock may not: a cap of `K × dt / duration` per frame means the fastest flick still plays every beat, at `duration / K` for the whole film `[site:cutobot-byholm]` (`[pattern:webgl-3d-scenes#scroll-driven-scenes]`).
- **One clock.** Lenis 1.3 has `autoRaf: false`; the shared ticker calls `lenis.raf(t)` first, then reads `scrollY`, maps it and steps the clock in the same frame.

## Parameters
`SEGMENTS` five windows of `.2` · default switch-on at the previous window's half, switch-off at the next window's half · `Fold.dropPrevAt .75` · `BANDS` `.24–.36 × 2`, `.62–.72 × 1.5` · `FILM_SECONDS 14`, `K 4` (fastest full run 3.5 s) · track `900svh` (`700svh` under 768 px) · Lenis `lerp .1`.

## Accessibility
- Reduced motion and static: Lenis wheel smoothing off, no spin, no glide; the stage shows one settled frame per beat (the centre of the window the scroll is in) and draws only when the beat or the size changes.
- The canvas is `aria-hidden`; the beats are real headings in the list after the film, reachable through a skip link in the HUD.
- Without WebGL the HUD and rail still run on the same clock.

## Adapters
- **React / R3F:** keep the map, windows and clock in a module; read the clock in `useFrame` and set `group.visible` from `windowsAt(p)`. Do not unmount windowed scenes, that disposes them.
- **GSAP:** drive Lenis from `gsap.ticker` instead of the shared ticker; scrub a paused master timeline with `tl.progress(clock)`, not with ScrollTrigger, or the cap is bypassed.

Seen in: `[site:edolus]`, `[site:cutobot-byholm]`. Overlap: `[recipe:gl-virtual-scroll-camera]` maps a virtual float to a spline; this recipe is the progress line beneath any such camera.
