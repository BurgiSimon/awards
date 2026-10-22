# svg-goo-line-reveal

Headings that condense out of a dark pool, line by line. Each SplitText line gets its own SVG `<filter>`: a `feGaussianBlur` whose `stdDeviation` is tweened to 0, followed by an `feColorMatrix` whose alpha row starts as a hard threshold and is relaxed back to identity in the blur's tail. Blurred letters fall below the threshold and vanish; as the blur tightens they cross it as merging blobs, then set into crisp, antialiased type. Each line's filter is taken off the moment it lands, and when the last line lands the split is reverted, so the heading is its authored markup again: selectable, unfiltered, one accessible name.

Where `split-text-masked-reveal` moves lines out of a mask, this one keeps every letter in place and changes what the edge is.

Synthetic content: the journal, its headings and all copy are invented for the recipe. None of the source's copy, palette or timing is reused.

## Why
- **One filter per line, not one per heading.** Bleibtgleich gives each SplitText line its own filter with a blur into an alpha threshold, tweens the blur to 0 and relaxes the matrix in the blur's tail, then clears the filter on complete `[site:bleibtgleich]` `[pattern:gsap-choreography#splittext-choreography]`. Separate filters let the lines run a beat apart, so the second line can still be pooling while the first has set.
- **The threshold is what makes it goo.** `alpha' = amp × alpha + off`, starting at `18 × alpha − 7`, cuts at about `.39` alpha: the heavily blurred text sits below it and is invisible, the tightening blur pushes letter cores over it first, and neighbouring letters fuse while they cross. Relaxing to `1 × alpha + 0` over the last `.45 s` brings antialiasing back before the filter goes.
- **Nothing stays on the text.** A filter left on a heading costs a filter pass every time it repaints and rasterises it differently from its neighbours; split line wrappers make a screen reader and a selection step through fragments. The line's filter is removed on its own completion, its `<filter>` node deleted, and the split reverted once the heading has landed.
- **Blur scaled to the type.** The starting `stdDeviation` is `.32 em` of the heading's computed font size, so a phone headline pools as fully as a desktop one.
- **A reduced tier the source lacks.** Bleibtgleich ships no reduced branch, and its reduced-motion capture shows headings frozen as black blobs `[site:bleibtgleich]` `[pattern:motion-vocabulary#masked-line-reveals]`. Here reduced motion never splits and never filters; a CSS guard under `prefers-reduced-motion` backs that up even before the script runs.

## Parameters
Start `stdDeviation .32 em` → `0` over `1.1 s` `power3.out` · lines `.12 s` apart · threshold `amp 18 → 1`, `off −7 → 0` over the last `.45 s` of each line, linear · filter region `x −20 %`, `y −60 %`, `140 % × 220 %`, `color-interpolation-filters: sRGB` · `ScrollTrigger` `start: 'top 85%'`, `once: true` per heading · SplitText `type: 'lines'`, `aria: 'auto'`, `autoSplit: true` (a re-split before or during the reveal rebuilds the filters and carries on from the same time) · reduced fade `.4 s` `power1.out`. A head script holds the goo headings at opacity 0 for at most `2.5 s` until they are armed, so the text never shows, vanishes and then condenses; without the module the timeout lets plain text through.

## Motion tiers
- **full**: split after `document.fonts.ready`, filters armed at their pooled values (the waiting lines are invisible), each heading condenses once on entering the viewport.
- **reduced**: no split, no filter at any moment. Each heading fades in (`opacity 0 → 1`, `.4 s`) once on entry.
- **static**: no animation; the headings are plain text from the first frame.

A tier change mid-page leaves landed headings alone and re-arms the rest under the new tier.

## Accessibility
- Headings keep their level and id. While split, SplitText names the heading with its whole sentence and hides the line wrappers; after the reveal the split is reverted, so the name comes from the text itself.
- The text is selectable throughout and plain after landing; no `visibility: hidden` holds it.
- Filters never sit on body copy, links or controls.

## Adapters
- **React / Next**: create the split and timeline in `useGSAP` after fonts load; keep the `<svg><defs>` in the component and let the effect add and remove `<filter>` nodes; revert the split and remove the filters in the cleanup.
- **Vue / Nuxt, Svelte**: same lifecycle in `onMounted` / `onMount`, with `gsap.matchMedia()` for the reduced branch if the page already uses it.
- **Lenis**: drive Lenis from the GSAP ticker and call `ScrollTrigger.update` on its `scroll` event, as in `[recipe:boot-lenis-gsap]`; nothing else changes.
- **Hide on exit**: to condense out again, run the same per-line timeline backwards with the threshold restored first and a shorter blur ramp (`In` curve); re-split first, since the landed heading is plain text.

Related: `[recipe:split-text-masked-reveal]` (masked lines), `[recipe:scroll-word-fill]` (scrubbed words).

Seen in: `[site:bleibtgleich]`.
