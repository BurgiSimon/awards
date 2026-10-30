# character-splay-3d

A display headline split into characters that open in 3D as the hero leaves, like a fan: each character moves out along its line, drops into an arc, comes towards the viewer and turns, by an amount set by one number, its distance from the headline's centre, while hairline ribs open behind it from a gilt pin under that centre. The letters at the pivot hardly move and the ends take almost all of it; scrolling back closes the line until, at progress 0, every inline transform is removed and the heading is plain set text again. A second heading plays the same offsets once, open to shut, when it arrives.

## Why
- **Offsets from the centre make a line open instead of stagger.** The source splits each word, gives it `perspective 1000` and sends every character to `x = ±200 × distance from the word's centre`, `rotationZ ±8 × distance`, `y = 60 × index` and `rotationY −270`, over `1.2 s` on its default curve, triggered at `center bottom` `[site:the-boyd]` [verified, chunks `CzjTch_b.js`, `Dq1AkkTS.js`]. Its card names the principle: tied to the middle, a reveal reads as the word opening, not as a stagger. The source's motion was read from its bundle, never seen moving [verified, the card's confidence table].
- **One weight drives six channels.** Every channel here is the same weight, `distance^1.6`, times its own amplitude, so the shape is one exponent to tune, and depth and turn never decrease as distance grows (the verifier recomputes every distance from the layout itself, checks that order and checks the depth to the pixel). The arc, the rows parting as they open (lower rows drop further, so the ends of neighbouring rows never close on each other) and the side-signed `rotateY` are the plugin's choices. The source turns every character the same way, which on a whole line would read as a spin [inferred: the card records `rotationY −270` for every character and never saw it move]; signed by side, the line opens symmetrically and closes back the same way.
- **The pivot is drawn.** A gilt pin sits under the headline's centre and fifteen hairline ribs open from it on the same clock as the letters, to `±64°`, so "from its centre" is seen rather than read. This is the plugin's choice: the ribs are an `aria-hidden` SVG under the type, and each fades along its length so it never competes with a letter.
- **The visitor holds the clock.** The source plays its splay on entry, at `center bottom` [verified]; the card does not record whether it repeats. Scrubbing it across a sticky stage is the plugin's choice, so the line opens only as fast as the hand leaves the hero and closes when it comes back (`ease: 'none'`; Lenis is the smoothing). The source's form, played on entry, is kept as the closing heading, open to shut. That direction is the plugin's reading of the card [inferred: `rotationY −270` ends edge-on, and the card calls the move a reveal, so it has to start from the offsets]; playing it only once is the plugin's choice.
- **Split on the real face, re-split on width.** Characters are measured after `document.fonts.ready`, the order the card's take asks for, and `autoSplit` rebuilds the timeline inside `onSplit` whenever the heading's width changes, as in `[recipe:split-text-masked-reveal]`. Distances, line height and perspective are re-read on each split, so a narrower window gives new lines that open by the same rule.
- **At rest it is text.** At progress 0 every character's inline transform is cleared: no compositing layer per letter, nothing left over from a fast scroll, and the set positions are exact to the sub-pixel (verified after opening to `.85` and scrolling back, and after the "Back to the top" link).
- **What it refuses.** The source has no reduced-motion branch anywhere [verified]; here reduced motion splits nothing. It is for one display line: running text, a heading that must be read while it moves, or a reveal that should simply arrive belongs to `[recipe:split-text-masked-reveal]`. A title that becomes a doorway into a scene is `[recipe:title-mask-tunnel]`, where one layer moves; here every character is its own object.

## Parameters
| | |
|---|---|
| Split | `SplitText.create(h1, { type: 'lines,words,chars', aria: 'auto', autoSplit: true, onSplit })`, after `document.fonts.ready`; both headings carry `dir="auto"` |
| Distance | `d = |character centre − headline centre| ÷ half the widest set line`, clamped to 1; side `s = ±1`; row `v` from `−1` (top line) to `1` (bottom line) |
| Weight | `w = d^1.6` |
| x | `s · w · .28 · half` (`.1` under 760 px, where the headline fills the width) |
| y | `w · (.8 + .35 · v) · line height`: each line bends into an arc, and lower rows drop further so the rows part |
| z | `w · .7 · half` (`.5` under 760 px), towards the viewer |
| rotateY / rotateX / rotate | `s · w · 60°` / `−v · w · 36°` / `s · w · 24°` |
| Perspective | `2.6 × half`, written on each `.splay-line` (so the split's revert takes it away), origin `50% 50%`; words `transform-style: preserve-3d` |
| Clock | one timeline, `ease: 'none'`, ScrollTrigger `top top → bottom bottom`, `scrub: true`, on a hero `230svh` tall (`200svh` under 760 px) with a sticky `100svh` stage, both only under `html.splay-on`, which the full tier sets; Lenis `lerp .1`, wheel smoothing only in the full tier |
| Rest | progress 0 → `clearProps: 'transform'` on every character |
| Ribs | 15 SVG lines from a pin at the stage's bottom centre, `rotation 0 → −64°…64°` evenly spread, group opacity `0 → .7`, both linear over the whole progress; each rib fades along its length (a gradient in its own user space, so it turns with the rib) |
| Lede | opacity `1 → 0` over `.08–.36` of the progress, gone before the lowest row's ends reach it; where the line stays still, a second sentence says so instead |
| Closing heading | `gsap.from` the same targets measured from its own centre, `1.2 s expo.out`, at `center bottom`, once; transforms cleared on complete |
| Reduced | the hero one screen, its stage not sticky; only the headline's opacity goes `1 → .12` as the hero scrolls away (`top top → bottom top`); the closing heading fades in over `.4 s` |

## Tiers
- **Full:** the splay and the ribs, scrubbed; the closing heading closes once on entry.
- **Reduced:** no split, so the DOM keeps whole sentences and nothing moves in space, and no wheel smoothing, so nothing coasts on after the hand stops. Nothing holds the scroll either: the hero is one screen and only the headline dims as it leaves (large text keeps 3:1 until it has gone; the label and lede, which need 4.5:1, never fade). The lede says the line stays still; the closing heading fades in.
- **Static:** no split, no fade, no ribs, the hero one screen. The tier switches live (`prefers-reduced-motion` or `html[data-motion]`): the build runs inside a `gsap.context`, whose `revert()` restores the original headings and takes the line perspectives with them, and `html.splay-on` comes off.

## Accessibility
`aria: 'auto'` puts the sentence on the `h1` as its `aria-label` and hides every line, word and character wrapper, so the heading has one accessible name instead of twenty-seven letters; the verifier reads the accessibility tree and finds the sentence once, open or closed. Without the script, before it runs and in the reduced and static tiers, the heading is ordinary text in a one-screen hero; without the script and in those two tiers the lede also says the line stays as set (a `noscript` rule and the same media query and `html[data-motion]` branches the tiers use). The headings carry `dir="auto"`: split characters are inline blocks, which a right-to-left page would otherwise set in reverse order. The hero's stage uses `overflow: clip`, which, unlike `hidden`, makes no scroll container that focus or a script could scroll, so characters flying towards the viewer leave the frame instead of widening the page. Keyboard scrolling drives the same scrub (Lenis follows the native scroll; the verifier presses PageDown), and "Back to the top" returns the heading to plain text. Nothing moves without the visitor's own scroll. Paper `#f2e4c9` on lacquer `#3f110e` is about 12.9:1 and the gilt heading about 7.3:1.

## Adapters

### React / Next
`'use client'`. `useGSAP` records only what is created while its callback runs, so a split made after an `await` inside it would never be reverted, and StrictMode's second mount would split the heading twice. Follow the adapter of `[recipe:split-text-masked-reveal]`: inside `useGSAP(() => { let live = true; const mm = gsap.matchMedia(); document.fonts.ready.then(() => live && mm.add('(prefers-reduced-motion: no-preference)', () => { const s = SplitText.create(ref.current, { …, onSplit }); return () => s.revert(); })); return () => { live = false; }; }, { scope })`. The `matchMedia` is created in time, so the hook reverts it, and it reverts whatever its `add` callback made. Toggle `splay-on` in the same callback, render the heading's text statically and change its `key` to change it. Scroll comes from the root smooth-scroll provider of `[recipe:boot-lenis-gsap]`.

### Vue / Nuxt
`onMounted(async () => { await document.fonts.ready; if (gone) return; ctx = gsap.context(() => SplitText.create(el.value, { … })); })`: here the context is created after the `await`, so it records the split. `onBeforeUnmount(() => { gone = true; ctx?.revert(); })`. Register GSAP's plugins in a client-only plugin file (`plugins/gsap.client.ts`), since SplitText measures layout.

### Webflow
- Designer: a section (`data-splay-hero`) holding a Div one screen tall with `overflow: clip`, and inside it the Heading with the custom attributes `data-splay="scroll"` and `dir="auto"`. In an Embed, the rules for `html.splay-on` (the section `230vh`, the Div `position: sticky; top: 0`), `.splay-line` (perspective origin) and `.splay-word` (`preserve-3d`); the ribs and pin are one SVG Embed behind the Heading.
- Inject from Footer code after the boot of `[recipe:boot-lenis-gsap]`; SplitText is part of the `gsap` package (3.15 here), so nothing else loads.
- Never give the same heading an Interactions text animation as well.

Seen in: `[site:the-boyd]`.
