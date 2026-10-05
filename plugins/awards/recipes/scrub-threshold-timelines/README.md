# scrub-threshold-timelines

A scrubbed scene whose copy is not scrubbed. One linear timeline drives the picture (a generated twelve-petal bloom and a frame counter) across a `400svh` sticky stage. Two paused timelines carry the copy; the scrub's `onUpdate` only checks which side of a threshold its progress is on, and on a change of side plays or reverses them. The copy then runs on its own clock, so it arrives whole, at its own ease, however fast or slowly the visitor scrolls. The bloom, its copy and the frame count are synthetic demo content.

## Why
- **Legible copy over a free scrub.** Scrubbed text sits half-faded wherever the visitor stops. A timeline that is played at a threshold always finishes (`[pattern:gsap-choreography#timeline-architecture]`).
- **Leave faster than you arrive.** Each window has an entrance `timeScale` and a faster exit one (here `1.5` in, `3.5` out), so the outgoing line never holds up the picture. One timeline per line means a reverse mid-entrance turns around from where it is, with no jump.
- **One crossing, one call.** The gate remembers the side it last saw; `play()` / `reverse()` fire once per crossing, not on every scroll frame.
- **Steps inside a scrub.** The `closed` / `open` label flips with two `duration: .001` tweens at position `.5`. A step on a continuous timeline flips back exactly when the scrub crosses back, which a `call()` or a class toggle would not guarantee.

## Parameters
Scene `400svh`, `top top` → `bottom bottom`, `scrub: true`, `ease: 'none'` · copy window `[.3, .6)`, in `timeScale(1.5)`, out `timeScale(3.5)` · final line `≥ .81`, in `1.25`, out `3.5` · copy tween `autoAlpha 0 → 1`, `yPercent 60 → 0`, `.7 s power3.out`, stagger `.12` · step tweens `.001 s` at `.5` · 120 frames. On refresh (resize, load, a reload mid-page) the gate snaps each timeline to its side with `progress(0|1)` instead of playing it.

## Motion tiers
- **Full:** the bloom opens and turns with the scrub; copy rises and fades in.
- **Reduced:** the bloom stays closed; the counter and the step label still follow the scroll; copy fades only (no `yPercent`), on the same thresholds.
- **Static** (`data-motion="static"`): the scrub still counts; copy is set with `progress(0|1)` at each crossing, no tween.

## Accessibility
The copy is real text in the DOM and readable without JavaScript. The scene has a heading. Nothing hijacks the scroll; keyboard scrolling is untouched. The bloom is `aria-hidden`.

## Adapters
- **React:** build the paused timelines and the scrub in one `useGSAP` scope; keep the side flags in a ref, not state, so a crossing does not re-render.
- **Image sequence:** replace the bloom tween with a frame index on a `{ f }` proxy (see `[recipe:image-sequence-scrub]`); the gate does not change.
- **Gated component:** in place of `play()` / `reverse()`, build the component when the window is entered and reset and destroy it when it is left.

Seen in: `[site:aardvarkbookclub]`, `[site:stanzza]`.
