# next-case-handoff

Each case study closes on the next case's hero, drawn in the hero's own geometry and clipped under a Next case label, its title card hinged on a corner. Following the link lifts that frame to the top of the screen while the card unwinds, then swaps in the next page with the frame's live media node moved into its hero. The picture never restarts, because it is the same element.

## Why
- **The close is the next opening.** A next-project link that is already the next hero turns the end of a case into a doorway instead of a list of links, and the scrubbed hinge makes it read as the next sheet waiting on the stack `[pattern:motion-vocabulary#sticky-stages-and-hinges]`.
- **Move the node, not a copy.** The source site's case-to-case route transition lifts the footer block by `y: −rect.top` over `1 s` (expo out) while the hinged content and its overprint unwind to `rotate: 0`, scrolls to 0 and stops the smooth scroller, then appends the very same figure, content and overprint elements into the incoming page's hero, whose own entrance is skipped `[site:the-line]` [verified, `B_ZYxxOZ.js` `appendChild` in the `case-next` transition's `onEnter`; `Ds9jNxuD.js` `isSeamlessTransition`, 2026-10-28]. A moved `<video>` keeps playing and keeps its time; a moved canvas keeps its pixels; a clone would restart both.
- **What this recipe changes.** In the source, the moved title was rendered as a non-main title for the footer, so the arriving page's heading is the footer's markup [inferred from `is-main-title: false` on the footer's hero content]. Here only the media node moves: the arriving page brings its own `h1`, laid out exactly where the lifted card ended, and focus goes to it. Every Next link is a real URL, so reduced motion, a failed fetch, a modified click or a browser without the History API simply navigate.

## Parameters
| | |
|---|---|
| Geometry | hero and footer frame share `height: 100svh` and one card position, so a lifted, unwound frame is pixel-identical to the next hero |
| Close | `.next { height: 72svh; overflow: clip }` (64 svh on phones): a label, then the frame clipped under it |
| Hinge | card `rotation −10° → −5°`, `xPercent −12 → −6`, `yPercent 24 → −4`, origin top right; trigger the frame, `top bottom` → `max`, `scrub: .5`, `ease: 'none'` |
| Lift | on click: the frame's scrub killed, the frame set `position: fixed` at its own rect (out of the clip), then `y: −rect.top` and the card to `0°`, both `1 s expo.out` |
| Swap | fetch the next document (prefetched on `pointerenter` and `focus`), `importNode` its `<main>`, `replaceWith` the live canvas into its hero, `scrollTo(0, 0)`, replace `<main>`, `document.title`, `pushState`, focus the new `h1` with `preventScroll` |
| Arrival | no hero entrance after a hand-off; after a normal load the card rises from `yPercent 30, rotation 4` over `1 s` expo out after `.25 s` |
| Back | `popstate` fetches and swaps without the lift |

## Tiers
- **Full:** as above; the plates paint on the shared ticker while on screen.
- **Reduced and static:** no hinge, no entrance, no interception: the link navigates; each plate shows one still frame.

## Accessibility
The close is a `<nav aria-label="Next case">` holding one link whose name starts with its visible label ("Next case: …"). After a hand-off the document has one `<main>`, its own `h1` and title, and focus on that heading, which is what a screen reader expects of a new page. The plates are `aria-hidden`. The swap never runs scripts from the fetched page; this module re-initialises the arrived page and tears down the old page's triggers and tweens with `gsap.context().revert()`.

## Adapters

### Vue / Nuxt
Use a named JavaScript transition (`<NuxtPage :transition="{ name: 'case-next', css: false, mode: 'out-in', onLeave, onEnter }">` set from route middleware when the Next link was the source): `onLeave` lifts the frame and keeps references to its media node; `onEnter` appends that node into the incoming hero before calling `done`. Render the incoming hero with an empty media slot when it arrives that way.

### Webflow
- Designer: a CMS template page whose last section is the next item's hero (a Collection List limited to the next item, or Webflow's next-item reference), built with the same classes as the template's hero and clipped by its section.
- Inject from Footer code: the module fetches the next item's URL, swaps `<main>` and moves the media element. Webflow interactions on the swapped page are not re-initialised by a client swap; keep the template free of them, or fall back to a full navigation.

Seen in: `[site:the-line]`.
