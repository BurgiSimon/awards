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

Seen in: `[site:leo-parpeix]`, `[site:lando-norris]` [inferred for the magnetic behaviour].
