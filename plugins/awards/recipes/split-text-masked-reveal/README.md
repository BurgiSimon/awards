# split-text-masked-reveal

The house text move: lines rise out of an overflow mask, staggered, with an expo-out curve, after the fonts have landed. Words for short headlines; lines everywhere else; characters only for a logo.

## Why
- **Fonts first.** Line boundaries depend on the real face, so the split waits for `document.fonts.ready`; splitting earlier gives wrong lines and a visible re-split `[site:lando-norris]`.
- **`autoSplit` + `onSplit`.** The reveal is built inside `onSplit` and returned, so a resize re-splits and rebuilds without leaving a paragraph half hidden.
- **Masks, not opacity.** `mask: 'lines'` wraps each line in an `overflow: hidden` element; `yPercent: 120 → 0` reads as print emerging, the corpus's signature reveal (`y: 150 %`, stagger `.1`, expo-out `[site:floema-jewelry]`).
- **Reduced motion means no split.** Whole elements fade for 0.4 s and the DOM keeps whole sentences for assistive technology.

## Parameters
`yPercent: 120`, `duration: 1.4`, `ease: 'expo.out'`, stagger `.1` (lines) / `.03` (words); below-the-fold reveals at `top 85%`, `once: true`; lede delayed `.5 s` after the headline.

## Accessibility
Text is visible before JS runs (no `visibility: hidden` on the source), the split is reverted under reduced motion, headings keep their ids and levels.

## Adapters
- **anime.js 4:** `const s = splitText(el, { lines: { wrap: 'clip' } }); animate(s.lines, { y: ['120%', '0%'], duration: 1400, ease: 'outExpo', delay: stagger(100) })` (re-split on `s.refresh()`).
- **split-type + CSS:** split, then toggle a class whose transition is `transform var(--dur-hero) var(--ease-out-expo)` per line with a `transition-delay` step.

Seen in: `[site:floema-jewelry]`, `[site:leo-parpeix]`, `[site:the-line]`, `[site:lando-norris]`.
