# css-scroll-driven-timeline

Scroll-driven motion written in CSS. One long read carries three moves: a reading-progress bar on the document's own scroll, paragraphs that rise into place as they enter, and a sticky figure that grows while its rail scrolls past and uncovers a week of tide trace. Where the browser has scroll timelines, `main.js` registers nothing and only reports which path ran; where it does not, a scroll listener and an IntersectionObserver set the same end states.

## Why
- **The corpus already lets CSS draw the scroll.** Locomotive's `data-scroll-css-progress` writes `--progress`, and CSS derives `--t`, then translate, scale and rotation from start / end pairs [site:mindmarket]; stage motion runs through `--progress` and `--hero-scale` [site:seasats]; 219 attribute-authored keyframes write `--progress` and CSS does the drawing [site:likova]. Each of them still publishes the number from script on every frame. Scroll and view timelines remove that step: the browser computes the progress and, for transform and opacity, the compositor applies it. No card in the corpus ships `animation-timeline` yet.
- **The scroll is the clock, so the keyframes are linear.** No easing fights the scroll (`[pattern:motion-vocabulary#scrub-and-refresh-rules]`); where smoothing is wanted it belongs to the scroll itself.
- **Ranges replace trigger arithmetic.** `entry 10% cover 35%` starts a block as it enters and finishes it before its top reaches the middle of the screen; `contain` on a rail is exactly the stretch in which its sticky stage holds (rail top at the viewport top until rail bottom at the viewport bottom), with nothing measured on resize; `exit` covers the hero as it leaves.
- **Name the timeline when the measured box is not the moving one.** A sticky stage never moves relative to the viewport, so its own `view()` would not advance; the rail declares `view-timeline: --rail block` and the figure, the trace cover and the caption all read it. The hero copy reads `--hero` from its section for the same reason. Sticky stages over tall rails are the house hold (`[pattern:motion-vocabulary#sticky-stages-and-hinges]`, `[recipe:sticky-stages-rails]`).
- **Transform and opacity only.** Chromium runs those on the compositor, so the page scrolls with no work on the main thread; the trace is uncovered by a sliding panel rather than a `stroke-dashoffset`, and the bar scales rather than changing `width` (`[pattern:motion-vocabulary#refuse]`).
- **A fallback that cannot strand a block.** The IntersectionObserver's top margin is effectively unbounded (`1000000px`), so anything above the viewport counts as seen: Home, End, an anchor or find-in-page can jump past a block without leaving it hidden, the failure `[pattern:accessibility-and-reduced-motion#refuse]` names.

## Parameters
| | timeline | range | keyframes |
|---|---|---|---|
| progress bar | `scroll(root block)` | whole document | `scaleX 0 → 1`, origin inline-start |
| reveals (`.reveal`) | `view()` | `entry 10% cover 35%`; the paragraph after a heading `entry 25% cover 42%` | `opacity 0 → 1`, `translateY 3rem → 0` |
| hero copy | `--hero` (`view-timeline` on the hero) | `exit 0% exit 100%` | `opacity 1 → .15`, `translateY 0 → −8svh` |
| sticky figure | `--rail` (`view-timeline` on a `280svh` rail) | `contain 0% contain 45%` | `scale .55 → 1` |
| trace cover | `--rail` | `contain 15% contain 70%` | `translateX 0 → 101%` |
| figure caption | `--rail` | `contain 50% contain 68%` | as the reveals |

Every full-tier animation is `auto linear both`: the shorthand first, then `animation-timeline`, then `animation-range`, since the shorthand resets both. The whole block sits inside `@supports (animation-timeline: view())`. `?engine=script` forces the fallback on a browser that has timelines, for comparison; the footer link does the same.

## Fallback
`main.js` checks `CSS.supports('animation-timeline: view()')` and `scroll()`. Without them it sets `data-engine="script"` on `<html>`, draws the bar from one passive, frame-coalesced scroll listener, marks only the blocks still below the fold (so nothing on screen blinks) and clears each mark through the observer, where a `.6–1.2 s` CSS transition carries it to the same end state. `state()` reports `engine`, `supported`, the listeners and observers it created (`0` and `0` on the CSS path) and the number of running scroll-driven animations.

## Accessibility
No scroll hijack: native scroll, keys and the scrollbar are untouched. All text is in the DOM in reading order under one `h1` and five `h2`s; the trace is a captioned figure and its drawing is `aria-hidden`. The progress bar is `aria-hidden`, since the native scrollbar already says the same. Find-in-page and anchors centre their target, by which point a block has finished rising.

## Reduced motion
Under `prefers-reduced-motion: reduce` none of the reveal, hero or figure rules apply, so every block, the open figure, the uncovered trace and the caption sit at their end states from scroll 0. The one thing still tied to the scroll is the bar, in ten cuts (`steps(10)`): a readout of position, not travel. A forced `data-motion="reduced"` does the same; `data-motion="static"` also removes the bar. The fallback follows the same tiers.

## Adapters
- **React:** the CSS ships unchanged with the component; the fallback is one `useEffect` that returns the observer's `disconnect`. Keep Motion's `useScroll` for values that must reach JavaScript, and do not run it beside these timelines on the same element.
- **Vue / Nuxt:** the rules go in the component's `<style>` (timeline names are not scoped by `scoped`, so keep them unique per page); the fallback in `onMounted`, disconnected in `onBeforeUnmount`.
- **Svelte:** the same CSS in the component; the fallback as an action (`use:reveal`) whose `destroy` disconnects the observer.
- **Astro:** the CSS path is static HTML and ships no JavaScript at all; include the fallback as a small `<script>` only if the browsers you support need it.
- **With Lenis or GSAP:** Lenis moves the native scroll position, so the timelines follow the smoothed scroll with no wiring [inferred]; the smoothing then runs on the main thread, the animations still do not. Use ScrollTrigger when the progress has to reach script (a canvas, a counter, a GL uniform): a CSS timeline cannot hand its value back (`[recipe:scroll-pin-scrub]`).

Synthetic content: the harbour, its gauge and the essay are written for the demo; the tidal figures (two tides a day, about fifty minutes later each day, spring and neap ranges) are general knowledge.

Seen in: `[site:mindmarket]`, `[site:seasats]`, `[site:likova]` (scroll progress published into CSS custom properties; this recipe is the native form of the same idea).
