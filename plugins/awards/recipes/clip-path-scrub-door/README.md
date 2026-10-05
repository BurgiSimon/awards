# clip-path-scrub-door

A veil over a section is cut by a hole that grows with the scroll, so the reader walks through a door into the next chapter. A second variant reveals a statement through a circle whose centre sits below the box. Both write `clip-path` from a scrubbed progress value. Where `title-mask-tunnel` builds its tunnel in CSS 3D `[recipe:title-mask-tunnel]` and `preloader-aperture-handoff` opens an aperture once on load `[recipe:preloader-aperture-handoff]`, this one is a scroll-scrubbed mask on content.

## Why
- **One polygon, two rings.** `polygon(evenodd, outer…, hole…)` lists the frame and then the hole; with the even-odd rule the inner ring is subtracted. The seam between the rings has zero area, so nothing paints along it `[site:bleibtgleich]`.
- **Progress, not polygon tweening.** GSAP scrubs a plain `{ p }` proxy and `onUpdate` writes the string. Two polygons never have to share a point count, and the hole is a function you can reshape freely.
- **Sticky, not pinned.** The door section is `200svh` with a `100svh` sticky stage, so there is no pin spacer and no reflow; the trigger window is `top top` → `bottom bottom`.
- **The labels make the door legible.** Two words on the veil part `±50vw` while the hole opens, which tells the hand what the scroll is doing `[site:bleibtgleich]`.
- **The circle rises.** `circle(p × 150% at 50% 120%)`: the centre below the box makes the copy surface from the bottom edge; 150 % clears the top corners. The phone gets `top 95%` → `bottom 90%` instead of `top 70%` → `center center` `[site:abatable]`.

## Parameters
Hole at progress 0: `20% × 24%`, centred, growing linearly to `100% × 100%` · door window `top top` → `bottom bottom` of a `200svh` section · labels `x ∓50vw` · circle radius `0 → 150%` at `50% 120%` · `scrub: true`, `ease: 'none'` (Lenis on the GSAP ticker does the smoothing) · phone breakpoint `max-width: 767px`.

## Motion tiers
- **Full:** both masks scrub; the labels part.
- **Reduced / static:** no clip-path anywhere. The veil is hidden, so the door stands open and the statement is plain text. Tiers follow the media query and `data-motion` on `<html>`; `gsap.matchMedia` reverts tweens, triggers and inline styles on every change.
- **No JavaScript:** same as reduced: the veil is hidden unless `html.has-door` is set.

## Accessibility
The veil is `aria-hidden` and `pointer-events: none`; its labels are decoration, the room carries the real heading. A clip-path never removes content from the accessibility tree, so the statement is read whatever its radius.

## Demo content
The studio, "Index of work", the statement and the colours are synthetic demo content. Backgrounds are CSS gradients; no media or font files ship, and type uses system font stacks.

## Adapters
- **Rounded hole:** use `path(evenodd, 'M… Z M… Z')` with the hole as an arc-cornered subpath, built in the same `onUpdate`.
- **Softer hand:** `scrub: 1` gives a one-second catch-up; keep `scrub: true` if something hands off at the window's end.
- **React / Vue / Svelte:** create the triggers in `useGSAP` / a mount effect inside `gsap.matchMedia()` and revert on unmount.

Seen in: `[site:bleibtgleich]`, `[site:abatable]`.
