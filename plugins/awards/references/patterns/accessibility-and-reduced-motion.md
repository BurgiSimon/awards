# Accessibility and reduced motion

What this file is for: the part of the plugin that is deliberately better than its references. The Site of the Year scored 6.6 on accessibility with an empty DOM [site:igloo] [recalled medium, cross-corroborated]; usability is the lowest axis on every scored card; and no card documents a reduced-motion path — Floema and the Anime.js source verifiably have none [site:floema] [site:animejs], Léo Parpeix appears to have none [site:leo-parpeix], the rest are unknown. Everything below is therefore plugin policy, checked by the audit rules in brackets, and it is where new work beats the corpus instead of copying it. Cite as `[pattern:accessibility-and-reduced-motion#section]`.

## The improvement over the corpus

Why: the jury weights usability at 30 % and it is the axis the winners lose on — Seasats 7.17 [site:seasats] [verified], Son Daven 7.16 [site:son-daven] [verified], Oryzo 7.51 [site:oryzo] [recalled high]. The gaps repeat card after card: no reduced-motion tier, no keyboard path through a gate, canvas text with no DOM twin, a loader with no skip, a gesture as the only entrance. Closing them costs a day and moves the one score the effects cannot.

## Motion tiers

Why: `prefers-reduced-motion` is a preference for less movement, not for a dead page. A visitor who set it still needs to see a menu open, a theme change, a hover state and where the page went.

Mechanism: `_shared/reduced-motion.js` answers `motionTier()` once — `full`, `reduced` or `static` — from the media query and an optional `data-motion` override on `<html>`, and mirrors it as `data-motion-tier` so CSS can branch. The score reads the same answer through `gsap.matchMedia()` with both conditions in one block (the reduce query and the breakpoint), so the setup re-runs and reverts itself when the preference flips (`[recipe:reduced-motion-switch]`; Anime's `createScope({ mediaQueries })` is the equivalent [site:animejs] [verified]). `_shared/base.css` shortens the tokens under the query (`--dur-feedback` 0, `--dur-routine` 120 ms, `--dur-hero` 200 ms) and kills animation only inside `[data-motion="spatial"]`.

What reduced keeps: state changes, hierarchy, opacity and colour steps, instant scroll positions, the theme swap as a ≤ 300 ms repaint. What reduced drops: spatial travel, parallax, velocity uniforms, marquees, autoplaying loops, the cursor lag, the fluid wake. What static removes: everything — the page is its final frame, one still per chapter.

Never a global kill — `* { animation: none !important }` or a 0.01 ms duration on everything [M01] [M02]: it also removes the state changes the reduced tier depends on, and a menu that appears with no transition at all is harder to follow than one that fades.

## Reduced-motion tiers

| Effect family | full | reduced | static |
|---|---|---|---|
| Masked line reveals | travel + stagger | opacity only, ≤ .4 s | text visible on load |
| Scroll-scrubbed choreography, pins, hinges | as authored | a cut between states at the trigger; no transform scrub | final frame per chapter |
| Virtual scroll / camera rig | eased float, snap | stepped sections, instant camera per step — the stepped tier Igloo lacks [site:igloo] | one still per chapter, native scroll between them |
| Fluid wake, chromatic aberration, particles | on | off; the scene renders one settled frame | poster still |
| Theme swap | 1–1.5 s tween | ≤ 300 ms or instant | instant |
| Two-speed cursor | dot + lagging ring | ring at the dot's rate | native cursor |
| Marquee, flicker, scramble | running | marquee stopped and scrollable; flicker one opacity step; scramble shows the final text | final text |
| Preloader | counter, hold, exit | counter, no exit travel, ≤ 1 s | skipped |
| Sound visualiser | live bars | frozen "on" pose | text state |
| Hover previews | chase the pointer | appear in place | appear in place |

## The DOM mirror

Why: a screen reader, a search crawler, find-in-page, translation and the `--no-webgl` capture all read the DOM. Igloo's DOM is a shell around a loader [site:igloo] [verified], which is the whole story of its 6.6.

Rules [A04]:
- Every string and image the canvas draws exists in the DOM first. Floema's `<img alt>` placeholders and Trevor Noah's photo planes over real images are the model [site:floema] [verified] [site:trevor-noah] [take]; Shopify's update cards are real content under the scenes [site:shopify-editions-w26] [recalled medium-low]; MindMarket gets the mirror free by having no canvas [site:mindmarket] [inferred high].
- The canvas is `aria-hidden="true"`; if it is interactive (a map, a gallery), the interaction has DOM controls — `<button>`s or `<a>`s — and the canvas is decoration over them [A05].
- MSDF or shader text carries a visible or `.sr-only` twin (`[pattern:webgl-architecture#text-in-webgl]`); split spans are not readable text and need an `aria-label` or a hidden original (`[pattern:motion-vocabulary#masked-line-reveals]`).
- Rive and Lottie canvases carry an accessible name or hidden text [site:mindmarket] [inferred].

## Keyboard paths for gates

Why: drag, hold and draw gestures have no keyboard evidence anywhere in the corpus, and Why Zero's five gates plus game-style map controls are the clearest case of a story a keyboard user cannot finish [site:why-zero] [inferred high]. The audit fails a pointer-only handler [A11].

| Gesture | Keyboard path | Also |
|---|---|---|
| Hold to proceed | Enter or Space held, or pressed once with a visible countdown | a `Skip` button beside every gate |
| Draw a shape | a `Skip` button; the gesture is never the only way in | announce completion in a live region |
| Drag a field, rail or carousel | arrow keys move one item; Home/End; items are links in a list (Floema's are not [site:floema] [verified]) | touch = native overflow |
| Compare reveal | arrow keys in 5 % steps; Home/End to each condition | `[recipe:compare-hold-drag]` |
| Intro interaction | Enter/Space triggers it; the reduced tier completes it instantly | [site:oryzo] (skill) |
| Scrollspy or chapter rail | a real `<nav>` of links with `aria-current` | [site:mont-fort] (skill); [site:seasats] |

Every control is a `<button>` or `<a>`; a `div` with a click handler is refused [A05].

## Overlays and focus

Why: a fullscreen nav, an age gate or a consent panel that leaves focus behind it strands keyboard and screen-reader users on an invisible page.

Rules (`[recipe:nav-overlay-fullscreen]`):
- On open: `inert` on everything behind, focus moved to the first item or the close button, Lenis stopped, `data-lenis-prevent` on the overlay's own scroller.
- While open: focus trapped; Escape closes — Léo Parpeix's overlay closes on Escape and on route change [site:leo-parpeix] [recalled medium].
- On close: `inert` removed, focus returned to the toggle, Lenis started.
- An age gate is a dialog under the same contract, and its answer is remembered [site:slosh-seltzer] (skill).
- After a route change, focus moves to the new `<main>` or `<h1>` (`[pattern:preloaders-and-transitions#route-transition-mechanics]`).

## Preloader and live regions

- The loader announces progress in a `role="status"` (`aria-live="polite"`) region — a number every 25 %, not every tick — and leaves the accessibility tree once gone; a visible skip control is focusable from the first frame; repeat visits skip it (`[recipe:preloader-counter-hold]`).
- Other live regions: the sound state on toggle, the chapter name under a virtual scroll, a "copied" confirmation after a copy badge, form errors. One polite region per page; assertive only for errors.

## Skip link, landmarks and focus styles

- A skip link as the first focusable element, visible on focus, targeting `<main>`; Lenis `anchors: true` keeps it working.
- One `<main>`, one `<h1>`, `<nav>`, `<header>`, `<footer>`, an unbroken heading order, `lang` on `<html>` [A01] [A03] [A09]. Mont-fort's Astro build keeps every division and paragraph in static HTML under its island — the cheapest mirror there is [site:mont-fort] [verified].
- `:focus-visible` styled from the tokens — `outline: 2px solid var(--accent); outline-offset: 4px` in `_shared/base.css` — and never `outline: none` without a replacement [A06] [A07]. The ring belongs to the world the way `::selection` does (The Line's selection is its flare red [site:the-line] [verified]) [S01]: the accent colour, the same offset everywhere, visible on both grounds of a theme swap.
- Every hover state is also a focus-visible state (`[pattern:cursor-and-pointer#keyboard-equivalents]`).

## Contrast

Why: warm near-blacks are the corpus norm and they pass. Son Daven's brass-and-near-black duotone on a light ground is documented at ≈ 5.0:1 by three token extractors [site:son-daven] [verified], though the card does not say which pair was measured — measure your own pairs [C01]. Risks the corpus carries: white at .8 opacity over snow [site:mont-fort] [unknown]; mid-tone HUD labels on a fog gradient [site:igloo] [unknown]; 9 px micro-labels at weight 440 [site:the-line] [verified size] — a label that small needs ≥ 4.5:1 and a real weight.

Rules: body and labels ≥ 4.5:1, display ≥ 3:1, on every theme of a swap and at both ends of a tweened repaint; the focus ring ≥ 3:1 against both grounds; `scripts/audit.mjs` measures the token pairs, and the photographic pairs are checked by hand.

## Scroll-jacking rules

Why: a virtual scroll (models c and d in `[pattern:motion-vocabulary#scroll-philosophies]`) replaces the browser's own scrolling, and with it keyboard scrolling, scroll restoration, deep links and find-in-page anchoring — Floema's `translateY` wrapper and Igloo's viewport-height document both pay this [site:floema] [verified] [site:igloo] [verified].

- Keys: ArrowDown/Up, PageDown/Up, Space, Home and End move the target by line, page and whole; Tab moving focus to an off-screen item scrolls the float to it.
- Progress is exposed: `awards.setScroller()` and `state()` from `_shared/awards-hook.js`, so `capture.mjs` and the jury can drive it; a chapter rail or index shows position and jumps [site:mont-fort] [verified rail].
- Restoration and deep links: the float reads `location.hash` and `history.state` on load and writes them on settle.
- Reduced tier: stepped sections, no eased float; static: native scroll.
- Under Lenis on the document none of this is needed, which is why it is the default (`[recipe:boot-lenis-gsap]`); a custom scrollbar drawn beside a working native scroll is fine, a native one removed is not [site:the-line] [verified pattern, behaviour unknown].

## Sound and breakpoints

Sound is opt-in behind a visible, keyboard-operable switch (`[pattern:sound#opt-in-only]`); nothing reloads at a breakpoint, because a reload throws away focus, scroll position and every live region (`[pattern:responsive-strategy#never-reload-at-a-breakpoint]`).

## Verify

- [ ] `motionTier()` is the single switch; `data-motion-tier` on `<html>`; `capture.mjs --reduced-motion` shows every state with no residual transforms.
- [ ] Reduced keeps state changes; static shows the final frame; no global animation kill in any stylesheet.
- [ ] Every canvas string and image has a DOM twin; canvases `aria-hidden`; the `--no-webgl` capture reads as a full page.
- [ ] Every gate, drag and hold has a keyboard path and a skip; every control is a button or link.
- [ ] Overlays: `inert`, trap, Escape, focus return, Lenis stopped and restarted.
- [ ] Preloader has a live region and a skip; other live regions are polite and singular.
- [ ] Skip link, landmarks, one h1, `lang`; focus ring from the tokens on both grounds.
- [ ] Contrast ≥ 4.5:1 for text on every theme; the measured pairs listed in `AWARDS.md`.
- [ ] Virtual scroll answers keys, exposes progress, restores position and steps under reduced motion.

## Refuse

- A global animation kill as the reduced-motion path; no branch at all.
- Canvas-only text, canvas-only images, an empty DOM behind a loader.
- Pointer-only gates, drags or holds; a `div` with a click handler; a custom cursor with no coarse guard.
- Overlays without `inert`, trap or focus return; loaders with no skip or live region.
- `outline: none`; a focus ring only on the light theme; tiny labels below 4.5:1.
- Virtual scroll that ignores PageDown, Space or Home/End, or hides its progress.
- A breakpoint reload; a sound-on gate; a boot sequence with no static variant.
