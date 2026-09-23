# blur-peek-snap-carousel

A centred carousel in which one card is sharp and its neighbours are dimmed and blurred at the edges. The spacing is computed so that a fixed slice of each neighbour always shows. A drag snaps to the next card, and the release speed sets the duration and the curve of that snap. Past either end the drag resists like a rubber band, and a critically damped spring returns it. Where `[recipe:horizontal-rail]` moves a rail with vertical scroll, this is a snapping carousel you drag, step with the keys or press through.

## Why
- **Focus by subtraction.** Every card is the same size. The neighbours drop to opacity `.2` with `filter: blur(6px)`, and the centred card sits at `1` and no blur. Both properties change together over `.5 s` `[site:robbietilton]`.
- **Size the peek, not the gap.** `gap = max(20, W/2 − card/2 − peek)`, with `peek = 10 %` of the carousel width on desktop and `14 %` at 920 px and below. The "there is more" cue stays the same whatever the card width `[site:robbietilton]`.
- **The gesture sets the duration.** Release speed is measured over the last `100 ms` of pointer samples. A speed above `1.2 px/ms` snaps in `320 ms`, and `.6–1.2` in `400 → 320 ms`, both on the crisp `cubic-bezier(.25,.46,.45,.94)`. A slower advance takes `450–600 ms` by the distance left, and a snap back `350–550 ms`, both on the softer `cubic-bezier(.32,.72,.37,1)`. A fast flick feels obeyed, a slow drag feels placed `[site:robbietilton]` (`[pattern:motion-vocabulary#easing]`).
- **Rubber band, then a spring that reads `dt`.** Past an end the track moves `d·(1 − 1/(x·k/d + 1))` for a pull of `x`, where `d` is the carousel width and `k = .55`. On release, a critically damped spring (stiffness `170`, damping `2√170 ≈ 26.1`) returns it to the edge. The pointer's speed is handed over through the band's slope. The spring is stepped with its exact solution `x(t) = (x₀ + (v₀ + ωx₀)t)·e^(−ωt)` using the shared ticker's `dt`, so it is the same at 60 Hz and 144 Hz and it never oscillates. The source ran a fixed `dt = 1/60` `[site:robbietilton]`, `[pattern:motion-vocabulary#damping-math]`.
- **One clock.** The snap tween and the spring both run on `_shared/raf.js`. The ticker stops when nothing moves.
- **A press is a click until it moves 8 px.** Pointer capture starts only when a drag begins, so a plain click still reaches the link. A click on a peeking neighbour brings it to the centre instead of following it. The click that ends a drag is swallowed.

## Parameters
Card `min(62vw, 880px, 66svh)`, the svh cap keeping the card and its controls in the first viewport (`60vw` at 920 px and below) · peek `10 %` / `14 %` · minimum gap `20 px` · neighbour opacity `.2` + blur `6px` (`.1`, no blur, at 920 px and below) · focus transition `.5 s` on `--ease-theme` · drag threshold `8 px` · velocity window `100 ms` · snap bands as above · key and button step `450 ms` soft curve · band `k = .55` (robbietilton used `.2` for a whole-page overscroll) · spring stiffness `170`, rest at `|x| < .5 px` and `|v| < 5 px/s`.

## Motion tiers
- **Full:** blur and opacity transitions, velocity-graded snaps and the spring.
- **Reduced:** the focus state is kept (the neighbours are still dimmed and blurred) but changes with no transition, and every snap and spring return is instant. A drag still follows the pointer, since that is direct manipulation.
- **Static** (`data-motion="static"`): the same as reduced.

## Accessibility
The cards are real links in a `<ul>` inside a region with `aria-roledescription="carousel"`. Only the centred link is in the Tab order (roving `tabindex`). Arrow keys step one card, Home and End jump to the ends, and focus follows the centred card. A polite live region shows the position ("2 of 6"). Previous and Next are real buttons with 44 px targets. The viewport uses `overflow: clip`, so focus can never scroll it out of step with the transform. `touch-action: pan-y` leaves vertical page scrolling to the browser on touch.

## Demo content
The six prototypes ("Pocket Loom" to "Low Lantern"), their years and their card art are synthetic demo content. The art is CSS gradients, so the recipe ships no image or font files. All type uses system font stacks.

## Adapters
- **Coverflow ring (zainabkabira):** keep the index, keys and snap, but place the cards on a ring instead of in a row: `translateX(54 % × offset)`, `translateZ(−300px × |offset|)`, `rotateY(−38° × offset)` (60 %, 250 px and 32° on phones). Show two neighbours each side at opacity `.55` and `.22` and hide the rest. Only the centred clip plays `[site:zainabkabira]`.
- **Media:** play a card's video only while it is centred, and swap GIFs to a still when inactive `[site:robbietilton]`.
- **With GSAP:** replace the hand-written tween with `gsap.to(state, { x, duration, ease: CustomEase.create('flick', '.25,.46,.45,.94') })`. Keep the spring on one ticker by driving `gsap.ticker` and reading its `deltaTime`.
- **React / Vue / Svelte:** create the listeners in an effect or `onMount` and remove them, plus the ticker subscription, in the cleanup.

Seen in: `[site:robbietilton]`, `[site:zainabkabira]`.
