# word-cycle-hero

One word in a fixed hero headline turns through a short list, driven one of three ways: a timed slot roll with a small overshoot, typed and erased per character, or stepped by the first wheel inputs before the page starts to move. Where `scramble-decode-text` resolves one string into itself, this rotates one slot through several words and never lets the line reflow.

## Why
- **One slot, many verbs.** A single turning word states a range (set, proof, bind, ship) without a list, and the rest of the headline stays put so the sentence still reads `[site:zainabkabira]` `[site:mensch]`.
- **Width from the grid, not from measuring.** Every word sits in the same `inline-grid` cell, so the slot is as wide as its widest word from the first paint, before JS and after a font swap. The words after it never jump, and the headline never re-wraps.
- **Clip one axis.** `overflow: visible clip` hides the roll above and below the slot but lets the typed caret overhang the widest word. Keep the slot's vertical padding just past the ascenders and descenders (`.04em` at `line-height .95`): with tight leading, a deeper clip shows the rolling word over the next line.
- **Wheel steps spend the first inputs, then let go.** At `scrollY 0` the first wheel inputs step the word (|Δy| ≥ 18, one step per 760 ms, inertia swallowed during the lock); past the last word the wheel scrolls the page as usual `[site:christoph-nagel]`. Keyboard and touch are never intercepted, so nobody is stuck on the hero.
- **Paused off-screen.** An IntersectionObserver pauses the running cycle once the hero leaves the viewport.

## Parameters
Timed: rest `900 ms`, roll `560 ms`, in on `back.out(1.7)` from `yPercent 130`, the current word out to `−130` on the same tween, so both move as one reel (130 clears the descenders under the clip) `[site:zainabkabira]` · Typed: `115 ms` per character in, `58 ms` out, hold `2.2 s`, gap `400 ms`; the first paint is already a whole word `[site:mensch]` · Wheel: threshold `18`, lock `760 ms` `[site:christoph-nagel]`. Christoph Nagel's own roll is `yPercent ±118` on `power4.inOut`, `.72 s` / `.78 s`, a stiffer alternative to the overshoot.

## Motion tiers
- **Full:** the chosen driver. The demo's radio group switches drivers live; a real hero picks one.
- **Reduced:** the first word, still. No roll, no typing, no wheel interception; the driver switch is hidden. The CSS rest state (first word only) holds before `main.js` runs.
- **Static:** as reduced. `onMotionTierChange` re-runs `start()`, which kills the loop and clears every inline style.

## Accessibility
- The visible slot is `aria-hidden`. Beside it a visually hidden label holds the current word with `aria-live="off"`, so the heading reads as one sentence ("We set books for small presses.") and a change is never announced.
- Reading order and heading level are unchanged by the cycle; the slot adds no focus stops.
- The wheel driver only acts at the very top and releases the wheel after the last word or when scrolling back before the first.

## Demo content
The bindery, the headline and all copy are synthetic demo text. No media or font files ship.

## Adapters
- **Lenis:** Lenis listens for `wheel` on the window too. Register this handler with `{ capture: true, passive: false }` and call `e.stopImmediatePropagation()` alongside `preventDefault()` while a step is taken, or `lenis.stop()` until the last word lands, then `lenis.start()`. Drive `lenis.raf` from the GSAP ticker as in `boot-lenis-gsap`.
- **Per-letter roll:** split the words into letters (`SplitText`, `type: 'chars'`) and stagger the same `yPercent` tween by `.02 s`; keep the grid cell so the width still holds.
- **React / Vue / Svelte:** render the words once in the grid cell, run `start()` in an effect after `document.fonts.ready` (`useGSAP` in React) and kill the loop in the cleanup; attach the wheel listener in the same effect.

Seen in: `[site:zainabkabira]`, `[site:mensch]`, `[site:christoph-nagel]`.
