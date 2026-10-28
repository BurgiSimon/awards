# character-splay-3d

A display headline split into characters that open in 3D as the hero leaves, like a fan: each character moves out along its line, drops into an arc, comes towards the viewer and turns, by an amount set by one number, its distance from the headline's centre. The letters at the pivot hardly move and the ends take almost all of it; scrolling back closes the line until, at progress 0, every inline transform is removed and the heading is plain set text again. A second heading plays the same offsets once, open to shut, when it arrives.

## Why
- **Offsets from the centre make a line open instead of stagger.** The source splits each word, gives it `perspective 1000` and sends every character to `x = ±200 × distance from the word's centre`, `rotationZ ±8 × distance`, `y = 60 × index` and `rotationY −270`, over `1.2 s` on its default curve, triggered at `center bottom` `[site:the-boyd]` [verified, chunks `CzjTch_b.js`, `Dq1AkkTS.js`]. Its card names the principle: tied to the middle, the reveal reads as the word opening, not as a stagger. The source's motion was read from its bundle, not seen moving [verified, the card's confidence table].
- **One weight drives six channels.** Every channel here is the same weight, `distance^1.6`, times its own amplitude, so the shape is one exponent to tune and depth and turn grow strictly with distance (the verifier checks that order on every character). The arc (the ends drop `.8` of a line and lean `24°` along it) and the side-signed `rotateY` are the plugin's choice: the source turns every character the same way, which reads as a spin; signed by side, the line opens symmetrically and closes back the same way.
- **The visitor holds the clock.** The source plays its splay once on entry [verified]; scrubbing it across a sticky stage is the plugin's choice, so the line opens only as fast as the hand leaves the hero and closes when it comes back (`ease: 'none'`; Lenis is the smoothing). The source's own form, played once, is kept as the closing heading.
- **Split on the real face, re-split on width.** Characters are measured after `document.fonts.ready`, the order the card's take asks for, and `autoSplit` rebuilds the timeline inside `onSplit` whenever the heading's width changes, as in `[recipe:split-text-masked-reveal]`. Distances, line height and perspective are re-read on each split, so a narrower window gives new lines that open by the same rule.
- **At rest it is text.** At progress 0 every character's inline transform is cleared: no compositing layer per letter, nothing left over from a fast scroll, and the set positions are exact to the sub-pixel (verified after opening to `.85` and scrolling back).
- **What it refuses.** The source has no reduced-motion branch anywhere [verified]; here reduced motion splits nothing. It is for one display line: running text, a heading that must be read while it moves, or a reveal that should simply arrive belongs to `[recipe:split-text-masked-reveal]`. A title that becomes a doorway into a scene is `[recipe:title-mask-tunnel]`, where one layer moves; here every character is its own object.

## Parameters
| | |
|---|---|
| Split | `SplitText.create(h1, { type: 'lines,words,chars', aria: 'auto', autoSplit: true, onSplit })`, after `document.fonts.ready` |
| Distance | `d = |character centre − headline centre| ÷ half the widest set line`, clamped to 1; side `s = ±1`; row `v` from `−1` (top line) to `1` (bottom line) |
| Weight | `w = d^1.6` |
| x | `s · w · .28 · half` |
| y | `w · .8 · line height` (the ends drop, each line bends into an arc) |
| z | `w · .7 · half`, towards the viewer |
| rotateY / rotateX / rotate | `s · w · 60°` / `−v · w · 36°` / `s · w · 24°` |
| Perspective | `2.6 × half` on each `.splay-line`, origin `50% 50%`; words `transform-style: preserve-3d` |
| Clock | one timeline, `ease: 'none'`, ScrollTrigger `top top → bottom bottom` on a `230svh` hero (`200svh` under 760 px) with a sticky `100svh` stage, `scrub: true` on Lenis `lerp .1` |
| Rest | progress 0 → `clearProps: 'transform'` on every character |
| Lede | opacity `1 → 0` over `.6–1` of the progress |
| Closing heading | `gsap.from` the same targets, `1.2 s expo.out`, at `center bottom`, once; transforms cleared on complete |
| Reduced | the hero is one screen tall with its stage released (`position: relative`), and the stage's opacity goes `1 → .12` as it scrolls away (`top top → bottom top`); the closing heading fades in over `.4 s` |

## Tiers
- **Full:** the splay, scrubbed; the closing heading closes once on entry.
- **Reduced:** no split, so the DOM keeps whole sentences and nothing moves in space. Nothing holds the scroll either: the hero drops to one screen (a CSS branch on `prefers-reduced-motion` and `html[data-motion]`) and fades as it leaves; the closing heading fades in.
- **Static:** no split, no fade, the hero one screen tall. The tier switches live (`prefers-reduced-motion` or `html[data-motion]`): the build runs inside a `gsap.context`, whose `revert()` restores the original headings.

## Accessibility
`aria: 'auto'` puts the sentence on the `h1` as its `aria-label` and hides every line, word and character wrapper, so the heading has one accessible name instead of twenty-seven letters; the verifier reads the accessibility tree and finds the sentence once, open or closed. Before the script runs and in the reduced and static tiers the heading is ordinary text. The hero's stage uses `overflow: clip`, which keeps `position: sticky` working, so characters flying towards the viewer leave the frame instead of widening the page; on a phone the ends simply exit at the sides. Nothing moves without the visitor's own scroll. Paper `#f2e4c9` on lacquer `#3f110e` is about 12.9:1 and the gilt heading about 7.3:1.

## Adapters

### React / Next
`'use client'` at the top. Inside `useGSAP(async () => { await document.fonts.ready; SplitText.create(ref.current, { …, onSplit }) }, { scope })` the split and its timeline join the hook's context and are reverted on unmount. Render the heading's text statically and change its `key` to change it. Scroll comes from the root smooth-scroll provider of `[recipe:boot-lenis-gsap]`.

### Vue / Nuxt
In `onMounted`, await the fonts, then `ctx = gsap.context(() => SplitText.create(el.value, { … }))`; `onBeforeUnmount(() => ctx.revert())`. Register GSAP's plugins in a client-only plugin file (`plugins/gsap.client.ts`), since SplitText measures layout.

### Webflow
- Designer: a section (`data-splay-hero`, height `230vh`) holding a Div with `position: sticky; top: 0; height: 100vh; overflow: clip`, and inside it the Heading with the custom attribute `data-splay="scroll"`. Add the two rules for `.splay-line` (perspective) and `.splay-word` (`preserve-3d`) in an Embed.
- Inject from Footer code after the boot of `[recipe:boot-lenis-gsap]`; SplitText is part of the `gsap` package (3.15 here), so nothing else loads.
- Never give the same heading an Interactions text animation as well.

Seen in: `[site:the-boyd]`.
