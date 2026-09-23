# filmstrip-index-rows

A project index where every project is one self-moving strip of frames with a caption under it. The strips are CSS keyframe loops, but each row's duration is computed from its measured width, so a row of four frames and a row of ten travel at the same px/s and the page reads as one system. One link per project; the frames are `aria-hidden` decoration.

## Why
- **Set the speed, not the duration.** `duration = one copy's width / 70 px/s`, recomputed by a `ResizeObserver`. A fixed duration makes long rows race and short rows crawl (`[site:boc]`).
- **One stop per project.** The reel sits in an `aria-hidden` wrapper with no links; the caption holds the single link. The source made every still its own link, 203 Tab stops for nine projects (`[site:boc]`).
- **Pause on hover, focus and off-screen.** `animation-play-state: paused` whenever the row has a reason to stop: pointer over it, focus inside it, or an `IntersectionObserver` reporting it out of view.
- **Late-overshoot grow.** On hover or focus the reel scales to `1.2×` over `.4 s` on `cubic-bezier(1, 0, .47, 1.25)`, a transform, so nothing reflows; the reel clips only sideways so the grow spills into the row padding.
- **Gate the hover clip.** A `<video>` mounts only when the row is on screen, the pointer matches `(hover: hover)` and the motion tier is full; it unmounts when the row leaves.

## Parameters
Speed `70 px/s` (`data-speed` on the list) · frame height `clamp(84px, 8.68vw, 150px)` · gap `15px` (as `margin-inline-end`, so two copies are exactly twice one and `-50 %` wraps cleanly) · grow `1.2×`, `.4 s`, `cubic-bezier(1, 0, .47, 1.25)`.

## Demo content
Project names, lines and frames are synthetic. Frames are coloured blocks from the tokens; the hover clip is a 160×90 canvas `captureStream` drawn on the shared ticker only while a row is hovered, marked `data-synthetic`. No media files ship. A real site swaps in stills and a short muted MP4 per project.

## Accessibility
Six projects, six Tab stops. Focus pauses and grows the row, so a keyboard reader sees it at rest. Under reduced motion or the static tier every reel is `animation: none; transform: none`, no clip mounts and nothing grows. Touch devices never mount the clip; the still stands in for it.

## Adapters
- **Eased pause:** drive each row with a GSAP 3.15 `x` tween (`ease: 'none'`, `repeat: -1`, duration from the same width formula) and tween its `timeScale` to 0 and back instead of flipping `animation-play-state`.
- **React / Vue / Svelte:** measure in a layout effect, set `--dur` on the track, and keep the `IntersectionObserver` and video mount in the same component cleanup.
- **Heavier rows:** switch to `[recipe:marquee-raf-mask]` when speed must also follow scroll velocity.

Seen in: `[site:boc]`.
