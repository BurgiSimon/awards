# split-text-masked-reveal

The house text move: lines rise out of an overflow mask, staggered, with an expo-out curve, after the fonts have landed. Words for short headlines; lines everywhere else; characters only for a logo.

## Why
- **Fonts first.** Line boundaries depend on the real face, so the split waits for `document.fonts.ready`; splitting earlier gives wrong lines and a visible re-split `[site:lando-norris]`.
- **`autoSplit` + `onSplit`.** The reveal is built inside `onSplit` and returned, so a resize re-splits and rebuilds without leaving a paragraph half hidden.
- **Masks, not opacity.** `mask: 'lines'` wraps each line in an `overflow: hidden` element; `yPercent: 120 → 0` reads as print emerging, the corpus's signature reveal (`y: 150 %`, stagger `.1`, expo-out `[clone:floema-jewelry]`).
- **Reduced motion means no split.** Whole elements fade for 0.4 s and the DOM keeps whole sentences for assistive technology.

## Parameters
`yPercent: 120`, `duration: 1.4`, `ease: 'expo.out'`, stagger `.1` (lines) / `.03` (words); below-the-fold reveals at `top 85%`, `once: true`; lede delayed `.5 s` after the headline.

## Accessibility
Text is visible before JS runs (no `visibility: hidden` on the source), the split is reverted under reduced motion, headings keep their ids and levels.

## Adapters
- **anime.js 4:** `const s = splitText(el, { lines: { wrap: 'clip' } }); animate(s.lines, { y: ['120%', '0%'], duration: 1400, ease: 'outExpo', delay: stagger(100) })` (re-split on `s.refresh()`).
- **split-type + CSS:** split, then toggle a class whose transition is `transform var(--dur-hero) var(--ease-out-expo)` per line with a `transition-delay` step.

### React
`<SplitReveal as="h1">…</SplitReveal>` from `adapters/react.jsx`. Props: `as` (the tag), `type` (`'lines'` or `'words'`), `delay` (seconds, above the fold), `onScroll` (reveal once at `top 85%`) and `onReveal`. It waits for `document.fonts.ready`, splits inside `useGSAP` and reverts on unmount; a split paragraph renders its visually hidden copy as a React sibling.
- The split rewrites the element's children: pass static text, and change the `key` to change it.
- Scroll comes from the root `<SmoothScroll>` ([recipe:boot-lenis-gsap]). `'use client'` heads the file for Next's App Router.

### Webflow
- Designer: the custom attribute `data-split="lines"` on each Heading or Paragraph that reveals (`data-split="words"` for a short headline), `data-split-delay="0.5"` on a lede that follows the headline, and `data-reveal` on those below the fold. No inner spans: the module splits the element itself.
- A CMS-bound Heading or Paragraph takes the attribute the same way. A Rich Text block holds several paragraphs, so let the module split each of its `p` rather than the wrapper [inferred].
- Fonts decide the lines: upload the faces in Site settings → Fonts and remove any Google Fonts entry for them (`references/stacks/webflow-export.md`). The module splits only after `document.fonts.ready`.
- Inject: an entry in the engine loaded by the [recipe:boot-lenis-gsap] Footer-code loader; it uses the boot's Lenis, not its own.
- Interactions with GSAP ships SplitText too: never give one element an Interactions text reveal and this module, and load GSAP once (the integration or the bundle).
- Reduced motion: the module does not split; whole elements fade for 0.4 s. Interactions' own reduced-motion settings do not reach the module [inferred].

Seen in: `[clone:floema-jewelry]`, `[site:leo-parpeix]`, `[site:the-line]`, `[site:lando-norris]`.
