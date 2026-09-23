# title-mask-tunnel

A section title set in a capsule works as a doorway. As you scroll, the capsule grows until it fills the screen, the title fades as it passes you, and the projects inside come towards you in CSS 3D. Everything is DOM: the heading stays a real `<h2>`, and the works stay a real `<ol>` of links. There is no canvas and no WebGL.

## Why
- **Mask scales, scene does not.** The capsule (`overflow: clip`, `border-radius: 999px`) is scaled; the viewport-sized scene inside it is counter-scaled by `1 / s`, so the works stay at 1:1 while more of them shows through the growing doorway. The title is not counter-scaled, so its letters grow past the viewer.
- **Linear scrub, exponential zoom.** The timeline is `ease: 'none'` throughout (`[pattern:motion-vocabulary#scrub-and-refresh-rules]`). The zoom tweens an exponent `k` from 0 to 1 and applies `scale = cover^k`, so the doorway approaches at a constant perceived speed. `[site:wodniack]` gets a similar curve from `power4.in` on the scrubbed scale; this recipe keeps the ease linear and puts the curve in the mapping instead.
- **Cover scale is computed, not guessed.** `cover = 1.02 × max(stageW / (W − H), stageH / H)`: at that scale the capsule's straight section alone spans the stage. It is re-measured `onRefresh`, and `offsetWidth` ignores transforms, so reading it mid-scrub is safe.
- **One moving 3D layer.** Each work has a fixed `translate3d(x, y, −i × 700px)` set in CSS, and only the `<ol>` (`preserve-3d`, under a `900px` perspective) moves in z. The compositor gets one animated transform instead of one per item, which keeps headless software rendering at frame rate.
- **Sticky, not pinned.** The section is `500svh` tall with a sticky stage, the same structure as `[recipe:scroll-pin-scrub]`, so the scrollbar stays honest.

## Parameters
Section `500svh` · `scrub: 0.6` · start `top top`, end `bottom bottom` · timeline: zoom `0 → 1` (k), title fade `.35 → .85`, flight `.8 → 3.2` · capsule `min(56cqw, 52rem) × clamp(6rem, 20cqh, 12rem)` (phone `80cqw × 14cqh`) · perspective `900px` · gap `700px` · flight ends with the last work at z 0 · a focused work is brought to z `−300` (0.75×).

## Motion tiers
- **Full:** the tunnel (`data-mode="deep"`).
- **Reduced / static:** `data-mode="flat"`: the heading and a plain responsive grid of works, with no 3D transform and no scrub. The page uses this mode before `main.js` runs and whenever JavaScript is off. Tiers switch live on the media query or `data-motion` on `<html>`. The timeline and its ScrollTrigger are killed and inline transforms cleared.

## Accessibility
The heading precedes the list in DOM order. Links are keyboard-reachable in both modes. In the tunnel, focusing a work scrolls (Lenis, 0.8 s) to the point where that work is in front, so the focus ring is never on a speck at the far end. `overflow: clip` rather than `hidden` on the mask and stage means focus cannot scroll their content sideways. The capsule and scene are decorative wrappers with no roles.

## Demo content
The project names, years, disciplines and gradient "posters" are synthetic demo content. The links point back to the section heading. There are no media or font files. The recipe uses system font stacks.

## Adapters
- **Video posters:** put muted `playsinline` `<video>`s in `.art` and lazy-load them through an IntersectionObserver rooted on the stage. Keep the count modest, since each video is its own composited layer.
- **No title scaling:** a viewport-sized scene with `clip-path: inset(a b c d round r)` tweened open. There is no counter-scale then, but the letters no longer fly past.
- **React / Vue / Svelte:** build the timeline in a mount effect (`useGSAP` / `onMounted`) and put `tl.scrollTrigger.kill(); tl.kill()`, the MutationObserver's `disconnect()` and the focus listener in its cleanup.

Seen in: `[site:wodniack]`.
