# footer-credits-hinge

The page ends on a closing sheet: the ground colour carrying the wordmark. It slides off a footer that is already there, a sticky stage held inside a rail that starts half a viewport above the footer, and it tips on its top-left corner as it goes. The site's credits live under that stage. The credits button scrolls to the end while it lifts and tilts the whole stage on one transition, so the colophon shows in the gap like a sheet raised on a press bed.

## Why
- **A footer that waits.** The rail (`top: -50svh`) makes the stage stick while the footer's top is still in the middle of the screen, so the last sheet slides off something that holds still rather than two layers scrolling together. No `pin`, no spacer: the stage is `position: sticky` and the footer's height is the sheet plus the stage's measured content `[site:the-line]` [verified, `Footer.1fXw1gXD.css` `.footer__scroller{top:-50vh}`, 2026-10-28].
- **The last move is a hinge, not a fade.** The sheet turns on a named corner (`transform-origin: 0 0`) on a scrub that runs from the moment the stage sticks to `max`, so the page's final gesture belongs to the same paper vocabulary as the rest of a hinged site `[pattern:motion-vocabulary#sticky-stages-and-hinges]`.
- **Credits in place, not on a route.** A colophon is something a visitor checks once; putting it under the footer keeps it one press away and makes the reveal itself the credit. The source site opens it by scrolling to the end over `.8 s` and lifting the stage on a `1 s` expo-out transition, and closes it on any later scroll [verified, `CYc7OJsQ.js`, `Footer.1fXw1gXD.css`].
- **What this recipe adds.** The source leaves the closed panel in the tab order and the accessibility tree, and footer links take focus while the closing sheet still covers them (17 of 58 tab stops in a `capture.mjs --walk`, 2026-10-28). Here the panel is `inert` and hidden while closed, focus moves to its heading on open and back to the trigger on close, Escape and a real close button work, and keyboard focus on anything in the stage jumps to the end first, or puts the credits away when they are open, so it never lands under the sheet or the panel.

## Parameters
| | |
|---|---|
| Rail | `top: -50svh` to the footer's foot; stage `position: sticky; top: 0; height: 100svh` |
| Footer height | sheet + `--content-h` (the stage's content, measured with a `ResizeObserver`) + 8 px |
| Sheet scrub | trigger the sheet, `top center` → `max`, `scrub: true`; wide `xPercent −6, rotation −5°`; narrow `xPercent −10, yPercent −24, rotation −5°`; origin top left; `ease: 'none'` (the source eases this scrub with `power1.inOut`; audit rule M03 keeps scrubs linear, so the scroll is the only curve) |
| Content rise | `yPercent 12 → 0`, `bottom bottom` → `max`, `ease: 'none'` |
| Open | scroll to `max` over `.8 s` (expo out, Lenis) if not there; stage `translate(4%, −lift) rotate(−5°)` (−3° under 760 px), `1 s cubic-bezier(.16, 1, .3, 1)` |
| Lift | the credits' own height + 24 px + (stage width / 2) × sin \|tilt\|, so the corner that drops still clears the panel; re-measured on reflow |
| Close | Escape, the close button, the trigger again, or a scroll of more than `24 px` once `.85 s` have passed (`.3 s` outside the full tier) |
| Blink | registered GSAP effects: `blinkOnce` (0 → 1 at `.06 s`) on hover and keyboard focus, `blink` (0, 1, 0, 1 at `.06 s` steps) on press; `extendTimeline: true` |

## Tiers
- **Full:** as above, with Lenis (`lerp .12`) on GSAP's ticker.
- **Reduced:** native scroll; the sheet never tips and the stage never lifts; the credits fade up over the stage's foot in `.2 s`; no blink.
- **Static:** the same as reduced, with the panel shown and hidden by a cut.

## Accessibility
The trigger is a `<button aria-expanded aria-controls>`. The panel is a labelled `<section>`, `inert` and `visibility: hidden` while closed (the visibility waits `1 s` before hiding, so the panel never vanishes under a stage still in motion). On open, focus moves to the panel's heading (`tabindex="-1"`, `preventScroll`); on close it returns to the trigger. Shift+Tab out of the panel into the stage closes the credits and leaves focus where it went. The paper-coloured focus ring is scoped to the blue stage; the credits keep the accent ring on their light ground. The blink is a two-step opacity flash on a small label, well under the WCAG 2.3.1 area threshold, and it does not run outside the full tier. Footer links are 44 px tall.

## Adapters

### Vue / Nuxt
Keep the scrubs in one `gsap.matchMedia()` created in `onMounted` and reverted in `onBeforeUnmount`; read Lenis from the app's plugin rather than creating a second one. The open flag is a `ref` bound to the footer's class and to `aria-expanded`; `inert` binds as an attribute. Route changes should close the credits and drop focus to the new page's `h1`.

### Webflow
- Designer: a Footer section with a first Div `close__sheet` (page ground, the wordmark as a Text Block with `aria-hidden="true"`), an absolutely positioned Div `close__scroller` (`top: -50vh`, bottom 0) holding the sticky Div `close__stage`, and a Section `credits` positioned at the footer's foot with a lower z-index than the stage.
- Inject from Footer code: the module measures `--content-h` and `--lift`, runs the two scrubs and the open, close and focus logic. Give the credits Section the `inert` attribute in the Designer so it starts closed without script.
- Do not attach a Webflow interaction to the stage or the sheet; one owner per property.

Seen in: `[site:the-line]`.
