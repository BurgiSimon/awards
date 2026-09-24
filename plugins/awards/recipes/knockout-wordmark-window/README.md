# knockout-wordmark-window

The hero's wordmark is a hole. The page around it is one solid SVG rect with the letter paths cut out of it by a `<mask>`, and a fixed canvas behind the page moves inside the letters. The page is still and the name is where the motion shows through. Nothing is video: the ground is a small canvas-2D drawing, so the recipe ships no media. Where `title-mask-tunnel` scales a capsule mask into a tunnel `[recipe:title-mask-tunnel]`, this cuts the letters out of a mask that never moves.

## Why
- **The layout reveals the ground.** One living surface sits under the page, and the cut-out letters are its window. The page needs no other decoration `[site:bethebuzz]`.
- **Subtract the glyphs, do not clip to them.** The `<mask>` is a white rect with black letter paths, applied to a rect filled with `--ground`. What reads as the wordmark is the absence of paint. Clipping the ground *to* the letters would need the ground inside the SVG. Subtracting from the page leaves the ground free to be any layer: canvas, video or a WebGL scene `[site:noth]`.
- **The rect overflows the word, the hero clips it.** The SVG's box is exactly the word's box (`viewBox 0 0 1000 240`, `width: 100%`), so CSS grid places the word like any other block. The masked rect runs 5000 units past it on every side (`overflow: visible`), and the hero's `overflow: clip` trims it to the hero. That gives one continuous paint with no seams between rows, and no JavaScript layout.
- **Fixed ground, moving letters.** The canvas is `position: fixed; z-index: -1`. The hero has no background, and every later section paints `--ground`, so the canvas is only visible through the letters. As the page scrolls, the letters slide over a ground that stays put.
- **A cheap ground.** The backing store is a sixth of the viewport (`SCALE 1/6`), and the browser's bilinear upscale supplies the softness. Four radial blobs on Lissajous paths plus three light/shade folds are drawn by the shared ticker (`_shared/raf.js`). The loop is removed from the ticker when the hero leaves the viewport, and the ticker already pauses on a hidden tab.

## Parameters
Word `viewBox 0 0 1000 240`, 56-unit strokes, letters 180 wide with 25 gaps · rect and mask region `−5000 … 6000` · ground `SCALE 1/6`, base `#0016cb`, blobs `#ff5a36 / #ffc800 / #7a5cff / #00b3a4` at 0.30–0.66 rad/s, folds `3` at `0.9` rad/s and `±0.16` alpha · still frame at `t = 7.5 s`.

## Motion tiers
- **Full:** the ground moves while the hero is on screen.
- **Reduced / static:** the loop is off and the ground is one still frame (the `t = 7.5 s` composition the full loop also starts from). A live switch to reduced motion freezes the current frame instead of jumping. Tiers follow the media query and `data-motion` on `<html>`.
- **No JavaScript:** the canvas's CSS background (two radial gradients on the base blue) is the still, so the letters are never empty.

## Accessibility
The heading is `<h1>` with a visually hidden text twin (`<span class="sr-only">Field</span>`), and the SVG is `aria-hidden="true" focusable="false"`. The canvas is `aria-hidden`. Keep the ground's darkest and lightest values far enough from `--ground` that the letters read at their edges: the verify requires a sum-of-channels distance above 90 from the paper at every letter sample. Text never sits over the ground, only over the solid rect.

## Demo content
The studio name "Field", its line and the ground palette are synthetic demo content. The letterforms are hand-drawn SVG paths, not a font, and the recipe ships no font or media files. All type uses system font stacks.

## Adapters
- **Your own wordmark:** outline the logotype to paths in the design tool and paste them into the mask's `<g fill="#000">`. Set the `viewBox` to the outlines' bounds. Letters with counters need `fill-rule="evenodd"` or correctly wound subpaths. SVG `<text>` in a system face also works, with `textLength` + `lengthAdjust="spacingAndGlyphs"` to pin its width, but the glyph shapes then vary per OS.
- **Video ground:** replace the canvas with a fixed muted `playsinline loop` `<video>` with a `poster`. Under reduced motion, pause it on the poster frame, and pause it when the hero leaves the viewport.
- **WebGL ground:** a full-screen `three@0.186.0` shader plane in the same fixed slot, with DPR capped by `_shared/quality-tiers.js` and `#include <colorspace_fragment>` in a custom `ShaderMaterial`.
- **More windows:** gutters and section seams can be holes in the same mask (extra rects in black), which is how the ground can appear between cards.
- **React / Vue / Svelte:** render the SVG in markup (a unique mask `id` per instance, via `useId`), and start the canvas loop in a mount effect. Remove it from the ticker and disconnect both observers on unmount.

Seen in: `[site:bethebuzz]`, `[site:noth]`.
