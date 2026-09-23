# section-switcher-wheel-commit

A DOM deck where the document never scrolls. Wheel input is summed into a visible ring that commits one step at a threshold and drains back after an idle second; swipe, arrow and Page keys, Home / End and prev / next buttons step the same index, and every change is announced once. Where `gl-rtt-composite-transition` switches sections by compositing WebGL targets, this is the plain-DOM switcher with the gesture made visible `[recipe:gl-rtt-composite-transition]`.

## Why
- **Show the cost of a hijacked gesture.** Converting scroll into discrete steps hides how much wheel a step costs. A ring that fills with the sum and empties when you stop turns that cost into a visible, reversible commitment `[site:nodeck]`.
- **Commit once, then lock.** At the threshold the index moves by exactly one and the wheel is swallowed for the travel plus inertia, so a trackpad flick cannot spend two steps `[site:christoph-nagel]`.
- **Every road in.** The wheel is one input among several: keys, buttons and a swipe reach every panel, and only the active panel is reachable (`inert` on the rest) `[site:areebali]` `[site:christoph-nagel]`.
- **Better than the source on reduced motion.** Nodeck disconnects the wheel under reduced motion; here it still commits, the panel just swaps in place (`[recipe:reduced-motion-switch]`: drop the travel, keep the state change).
- **Built on Observer.** GSAP's Observer sums one frame's wheel deltas with `deltaMode` normalised and times the idle rollback with `onStopDelay`; a second Observer on the stage reads the finger travel on release.

## Parameters
Threshold `500` px of summed `|deltaY|` `[site:nodeck]` · ring `.2 s power2.out` per input, `.12 s` to full on commit, drains over `.4 s` · idle rollback after `1 s` · reversing direction starts a fresh sum · the blocked direction at the first or last panel never fills · lock `900 ms` after a commit · swipe `> 55 px` on release `[site:christoph-nagel]` · travel `.9 s expo.inOut`, incoming panel `yPercent ±100 → 0`, outgoing to `∓30`, copy rises `y 42 → 0` over `.72 s power3.out`, stagger `.065` from `.45 s`.

Keys: `↓ → PageDown` next, `↑ ← PageUp` previous, `Home` / `End`, `Space` / `Shift+Space` only when the page itself has focus (on a focused button Space presses the button).

The ring uses `pathLength="1"`, so the whole fill lives between `0` and `1` px of `stroke-dashoffset`. Tween it with `autoRound: false`: GSAP rounds px values by default and the ring snaps to empty or full.

## Motion tiers
- **Full:** the ring eases, panels travel.
- **Reduced:** the wheel, keys, swipe and buttons all still step; panels swap in place and the ring jumps to its value instead of easing.
- **Static:** as reduced.

## Accessibility
- Without JS the panels are ordinary sections on a scrolling page. `main.js` adds `html.deck`, which stops the document scrolling; the controls appear only then.
- Inactive panels are `inert`, so Tab never lands on a hidden link.
- A polite live region announces "Panel n of 5: title" on each change, not on load. The visible counter is `aria-hidden`.
- The ring is `role="progressbar"` with `aria-valuenow`; its label names the direction.
- Prev / Next use `aria-disabled` at the ends rather than `disabled`, so a focused key keeps focus.
- A visible hint names the keys beside the ring; on touch devices (`hover: none`) the ring hides and the hint says swipe.
- `touch-action: pinch-zoom` on the stage: panning is ours, zoom stays with the visitor.

## Capture hook
The document has no scroll height, so `__awards.scrollTo(p)` is routed through `awards.setScroller` to panel `round(p × 4)` with no travel: `capture.mjs` and the jury get one deterministic panel per scroll position. `__awards.state()` reports `index`, `progress`, `fill`, `commits`, `transitioning` and `visited`.

## When not to use it
Panels whose copy needs scrolling inside a box fight the wheel lock; keep copy short enough to fit, or use sticky stages over a native document (`[recipe:sticky-stages-rails]`). Every step costs a deliberate gesture, a tax on long reads.

## Demo content
The five panels and all copy are synthetic demo text describing the technique. No media or font files ship.

## Adapters
- **Lenis:** not needed; the document never scrolls. If the deck sits inside a Lenis page, `lenis.stop()` while the deck owns the viewport and `lenis.start()` when it releases.
- **Dialogs:** while a modal is open, `observer.disable()` both Observers and drop the sum, as Nodeck does.
- **React / Vue / Svelte:** create both Observers and the key listener in one effect (`useGSAP` in React) and `kill()` them in the cleanup; keep the index in a ref, not state, so a wheel frame does not re-render.

Seen in: `[site:nodeck]`, `[site:areebali]`, `[site:christoph-nagel]`.
