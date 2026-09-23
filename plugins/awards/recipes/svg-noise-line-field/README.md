# svg-noise-line-field

A hero field of hairline SVG lines. Every point takes its angle from one Perlin sample that drifts in time, so the whole field breathes; a fine pointer pushes the points it passes and a spring brings them back. On load the lines grow in from their ends, outer lines first. The field is `aria-hidden` decoration behind a real `<h1>`.

## Why
- **One sample, one angle.** `angle = perlin2((x + t·.0125)·.002, (y + t·.005)·.0015) × 12`, offset `(cos × 32, sin × 16)` px. One noise call per point per frame is the whole wave; neighbouring lines move together, so they never tangle (`[site:wodniack]`).
- **Push, then spring.** Points inside `max(175, pointer speed)` px of the pointer take an impulse along the pointer's travel, weighted by `(1 − d/R)²`; a spring of `.005` and damping `.925` per 60 Hz frame return them. Both are scaled by `n = dt × 60` (`damping^n`, `spring × n`), and the impulse is linear in the pointer's travel, so a 144 Hz screen settles like a 60 Hz one.
- **One path, one draw.** Every line is a subpath of a single `<path>`. Rasterising one path per line cost seconds per frame in software-GL headless Chromium at 57 lines; one merged path runs at frame rate there and costs a real GPU nothing.
- **Draw-in without a plugin.** A merged path cannot take DrawSVG per line, so the intro is computed in the same loop: line `r` shows its last `expoOut((t − delay_r) / 3 s)` share, `delay_r = .5 s × distance from the nearest edge`. It reproduces DrawSVG's `"100% 100%" → "0% 100%"` with `stagger: { amount: .5, from: 'edges' }`.
- **Idle costs nothing extra.** The spring loop skips when the pointer has not moved and every point is at rest; the ticker stops when the hero leaves the viewport.

## Parameters
Wave `12` rad · `32 × 16` px · drift `.0125 / .005` px per ms · scale `.002 / .0015` · push radius `175–400` px, gain `.08`, spring `.005`, damping `.925`, offset cap `120` px · intro `3 s` expo-out, `.5 s` spread · grid `18 × 16` px (fine pointer), `24 × 22` px (coarse) · lines overrun each edge by `48` px · stroke `1px`, ink at 22 % over ground.

## Motion tiers
- **Full:** intro, drift and (fine pointers only) push, all on `_shared/raf.js`'s ticker.
- **Reduced:** the field is drawn complete at `t = 0` and holds still. No ticker callback, no push.
- **Static:** same still frame. Setting `data-motion` on `<html>` switches tiers live; the ticker callback is removed.

## Demo content
The heading, lede and rules are synthetic demo copy. The noise function is hand-written (seeded improved-Perlin gradients); no media or font files ship.

## Accessibility
The SVG is `aria-hidden="true"` and `pointer-events: none`; the heading and lede are real text above it, and the lede sits on a ground-coloured block so contrast never depends on the lines. Touch and coarse pointers get a sparser grid and no push.

## Adapters
- **Few lines, GSAP already loaded:** one `<path>` per line and `gsap.fromTo(paths, { drawSVG: '100% 100%' }, { drawSVG: '0% 100%', duration: 3, ease: 'expo.out', stagger: { amount: .5, from: 'edges' } })` (DrawSVGPlugin ships in GSAP 3.15). Clear the dash on complete, or the push will lengthen paths past the cached length.
- **Denser grids (above ~10k points):** the same loop into a canvas 2D `stroke()`.
- **React / Vue / Svelte:** build in a mount effect, keep the ticker unsubscribe, observers and pointer listener in its cleanup.

Seen in: `[site:wodniack]`.
