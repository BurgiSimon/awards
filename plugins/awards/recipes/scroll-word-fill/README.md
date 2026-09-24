# scroll-word-fill

A statement held on a sticky stage whose words fill in one after another as the page scrolls: each word goes from a dim resting opacity to full ink on one scrubbed timeline, so the sentence reads at the speed of the reader's hand. Where `split-text-masked-reveal` plays a timed entrance once, this ties every word to scroll progress and plays backwards when the reader scrolls back.

## Why
- **Scroll is the reading clock.** A 300 svh section with a 100 svh sticky stage gives the fill two viewports of travel without `pin` or an injected spacer; the timeline runs from `top top` to `bottom 130%`, so the last word lands 30 vh before the stage releases and the full sentence holds briefly at rest `[site:goats]` `[site:mensch]`.
- **One timeline, staggered windows.** `gsap.set(words, { opacity: floor })` then `tl.to(words, { opacity: 1, duration: 1, stagger: .5, ease: 'none' })`: each word's window overlaps the next by half, so about two words are mid-fill at any moment and the front edge reads as a soft cursor, not a hard step `[site:goats]`. Linear, because the scrub is the easing.
- **A resting state that already reads.** The unread words sit at `.5`, about 3.3:1 on the ground at display size. The sources start lower (goats `.15`, primesec `.36`), which looks sharper but leaves most of the statement below WCAG's 3:1 for large text until it is scrolled `[site:goats]` `[site:primesec]`.
- **Split after fonts, re-split on resize.** `SplitText.create(..., { type: 'words', autoSplit: true, onSplit })` waits for `document.fonts.ready`; the timeline is built and returned inside `onSplit`, so a width change rebuilds it at the same progress. SplitText labels the element with the whole sentence and hides the word spans from assistive technology.

## Parameters
`data-floor="0.5"` resting opacity · per word `duration 1`, `stagger .5` (raise the stagger for a harder front edge, lower it to fill in waves) · `scrub: .5` · section `300svh`, stage `100svh` · `end: 'bottom 130%'` (the hold at full ink before release).

## Motion tiers
- **Full:** the scrubbed per-word fill.
- **Reduced:** no split, no fill; the statement is one sentence at full ink from the first frame. The CSS repeats this under `prefers-reduced-motion` so it holds before `main.js` runs.
- **Static:** as reduced. The tier is re-read live through `onMotionTierChange`, which kills the timeline and reverts the split.

## Accessibility
- Text is fully visible before JS runs; only the split sets the floor.
- The statement is a paragraph under a short visible heading, not a 36-word `h2`.
- Scrubbed opacity carries no spatial movement, but the proposal's rule stands: under reduced motion the sentence is simply there to read.

## Demo content
The type foundry, its statement and all copy are synthetic demo text. No media or font files ship.

## Adapters
- **Colour fill (mensch):** tween `color` from a muted token to ink instead of opacity, or drive it by hand in `onUpdate`: word `i` of `N` takes `clamp(progress × (N + k) − i, 0, 1)` with `k ≈ 6` as its mix, which is the same overlapping window written out.
- **Two-layer clip fill (primesec):** split into lines, stack a dim copy and a full copy of each line, and scrub the full copy's `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)` per line in sequence. Mark the copy `aria-hidden`.
- **Lenis:** add it on the GSAP ticker as in `boot-lenis-gsap` and call `ScrollTrigger.update` from its `scroll` event; nothing else changes.
- **React / Vue / Svelte:** create the split in an effect after fonts load (`useGSAP` in React) and revert it in the cleanup; `autoSplit` handles resizes.

Seen in: `[site:goats]`, `[site:mensch]`, `[site:primesec]`.
