# magnetic-button

A CTA that leans toward a fine pointer inside a radius, the label leaning less than the ring so the button reads as an object with depth; an ordinary button everywhere else.

## Why
- **`quickTo`, not a tween per event.** One live tween per axis is retargeted on every `pointermove`; creating tweens per event allocates, overlaps and stutters (`[pattern:cursor-and-pointer]`).
- **Falloff keeps the edge continuous.** A smoothstep of `1 − distance / radius` means the button never snaps at the boundary; leaving releases it with the same expo-out curve.
- **Two displacements.** Ring at `0.35 ×` the pointer offset, label at `0.45 ×` that: the parallax is what makes it feel magnetic rather than dragged `[site:leo-parpeix]`.
- **Fine pointers only.** Under `(pointer: coarse)`, `(hover: none)` or reduced motion the listeners are never attached, and focus gets the ring at full strength.

## Parameters
Radius `1.6 × diagonal` · pull `0.35` · label factor `0.45` · `quickTo` duration `.6 s`, `expo.out`.

## Accessibility
A real `<a>`/`<button>`, `:focus-visible` ring drawn on the inner element so the outline is never clipped, no motion under reduced motion.

## Adapters

### React
`<MagneticButton href="#contact">Book a call</MagneticButton>` from `adapters/react.jsx` renders the ring and the label; without `href` it is a `<button type="button">`, and other props pass through. Props: `radius` (1.6), `strength` (0.45, the label's share) and `pull` (0.35).
- `gsap.matchMedia` on `(pointer: fine) and (hover: hover)` and the reduced-motion queries attaches the listeners only for the full tier on a fine pointer; when either condition flips, the `quickTo` tweens revert to rest.
- No Lenis needed. `'use client'` for Next's App Router.

### Webflow
- Designer: a Link Block with a real destination, class `magnet` and the custom attributes `data-magnet`, `data-radius="1.6"` and `data-strength="0.45"`; inside it a Div `ring` with `data-magnet-ring` and `aria-hidden="true"`, then a span `text` with `data-magnet-text` holding the label.
- The ring fill and label colour can stay a Designer hover state. The focus ring is the `:focus-visible` rule from `style.css`, in Head code, since whether the Designer offers a focus-visible state is [unverified].
- No Webflow interaction on `.magnet` or `.text`, hover or otherwise: the module writes their `x` and `y`, and an interaction would write the same transform.
- Inject: an entry in the engine loaded by the [recipe:boot-lenis-gsap] Footer-code loader, mounted on every `[data-magnet]`. It needs no Lenis, only `pointermove` and the scroll position.
- Reduced motion, coarse pointers and no hover: the listeners are never attached, so there is nothing to switch off in Webflow.

Seen in: `[site:leo-parpeix]`, `[site:lando-norris]` [inferred for the magnetic behaviour].
