# two-phase-interruptible-timeline

Open and close as one paused GSAP timeline: the open half, then `addPause()` at its duration `I` (the hinge), then the close half. Close calls `tl.time() < I ? tl.reverse() : tl.play()`. A close that arrives mid-open rewinds what has already played from where it is, instead of starting a separate exit tween from a half-built state; a close after the hinge plays the authored exit forward. The demo is a disclosure menu panel; the links and copy are synthetic.

## Why
- **One object owns both directions.** Two independent tweens (open, close) fight when a visitor double-clicks: the exit starts from whatever the entrance left, or the entrance is killed and the panel jumps. With one timeline the playhead is the state, so there is nothing to reconcile `[pattern:gsap-choreography#timeline-architecture]`.
- **The exit is still its own choreography.** Past the hinge the close half plays forward, so the exit can differ from the entrance (faster, staggered from the end, different ease) and only an interrupted open falls back to rewinding.
- **Reopen during the close half** calls `tl.reverse()`; the `addPause()` callback fires in reverse too, so the playhead stops back at the hinge, fully open.
- **Back to rest on completion.** `onComplete` calls `tl.pause(0)`, so the next open starts the open half from the beginning.

## Parameters
Full tier, open half: panel `clip-path: inset(0% 0% 100% 0% round 20px) → inset(0%…)`, `.7 s` `expo.inOut` at 0; burger bars `y ±4.25, rotation ±45`, `.45 s` `power3.out` at `.05`; links `yPercent 100 → 0, autoAlpha 0 → 1`, `.6 s` `power3.out`, stagger `.04` at `.12`. `I ≈ .88 s` for five links. Close half: links `yPercent −40, autoAlpha 0`, `.28 s` `power2.in`, stagger `{ each: .02, from: 'end' }`; bars home `.35 s`; panel closed `.5 s` `power3.inOut` at `'<.08'`; `autoAlpha 0` at the end.

The panel's `autoAlpha: 1` set sits at `.001`, not at 0: a zero-duration set at time 0 stays applied when `pause(0)` lands on it, and the closed panel would stay `visibility: visible`.

## Motion tiers
- **full**: as above.
- **reduced**: the same hinge structure, opacity only (panel and links fade, bars switch instantly); no translate or clip movement.
- **static**: `tl.pause(I)` to open, `tl.pause(0)` to close, with no tween.
The timeline is rebuilt if the tier changes, landing on the current state.

## Accessibility
A disclosure, not a dialog: `aria-expanded` and `aria-controls` on the toggle, `inert` on the panel the moment a close is requested (keyboard focus cannot land in a panel that is leaving), `visibility: hidden` at rest from the stylesheet and from the timeline, Escape closes and returns focus to the toggle, link activation closes. For a full-screen modal menu with a focus trap see `[recipe:nav-overlay-fullscreen]`.

## Verify
`interrupt` closes at 40 % of `I` and samples the first link's `translateY` every frame: it must move monotonically back toward rest with no step above half the travel, and `tl.time()` must reach 0 without passing the hinge. `full` closes at the hinge and must see the playhead pass `I` and return to 0. `reopen` reopens during the close half and must hold at the hinge. Replacing the close with a plain `tl.play()` fails `interrupt`.

## Adapters
React: build the timeline in `useGSAP` keyed on nothing and keep it in a ref; the toggle handler reads `tl.time()` against the hinge. Vue / Svelte: build in `onMounted` / `onMount`, `tl.kill()` on unmount. The pattern applies to any open/close pair: sheets, drawers, accordions, modals.

Seen in: `[site:why-zero]`.
