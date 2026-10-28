# dealt-sheets-stage

Featured work dealt like cards onto one held stage. Each project is a pair of sheets, a ticket that names it and a print that shows it, and each sheet has its own rail through one scrubbed timeline: the ticket comes in from the lower left, turning about its corner, and the print comes from the lower right a beat later and from further away. Both are swept off as the next pair lands on top of them, and the last pair does not leave: it settles into a resting pose and rides away with the stage.

## Why
- **A sticky stage on a tall section, never a pin.** The section is as tall as the score, and a `position: sticky` child is the stage, so the document keeps its native scroll and no spacer is ever inserted. The source site builds its featured work exactly so, with one invisible rail per case `[site:the-line]` [verified, B6MUFv6g.js] `[pattern:motion-vocabulary#sticky-stages-and-hinges]`.
- **Two rails per item read as handling, not as a slide.** The source deals each case as a title sheet and a media sheet, the second `.06` later, from different offsets and turns, on `ease: 'none'` scrubs `[site:the-line]` [verified] `[pattern:gsap-choreography#scrolltrigger-configurations]`. The values here are this recipe's own: opposite sides (`xPercent −42` against `34`), opposite turns (`−9°` about the ticket's top-left corner, `7°` about the print's centre), a `.12` lag, and vertical rails measured from the stage's edges, so the tall print travels further than the short ticket and each sheet starts entering the frame the moment its rail starts.
- **The last item settles instead of leaving.** The source's last case drifts down rather than going off `[site:the-line]` [verified]. Here the fifth pair turns into a slightly askew resting pose over `.6` of a viewport, and the stage lets go with it still on the mat, so the set-piece ends on a composed frame rather than an empty one.
- **One timeline, counted in viewports.** Every beat sits on one scrubbed timeline whose unit is one viewport of scroll from the section's `top bottom`, and the section's CSS height is the same sum. The first pair is therefore dealt exactly while the stage scrolls into place, and adding a project is one more `<li>` and `--n`. This differs from `[recipe:sticky-stages-rails]`, where three cards rise and fall on one rail with opacity: here every item is a pair, each sheet has its own path, and items replace one another. The single timeline is the plugin's choice; the source gives each case its own triggers.
- **The motion has a keyboard and a voice.** The source deals its sheets whatever the motion setting and ships no `keydown` handler at all `[site:the-line]` [verified, card §6]. Here the tickets are real links in the tab order, focusing one scrolls the stage to its pair's rest, the active pair is announced in a polite status, and reduced motion cross-fades the pairs in place.

## Parameters
| | |
|---|---|
| Section | `height: calc((n − 1) × 140svh + 160svh)`, sticky stage `100svh`, `overflow: clip` |
| Timeline | `trigger: section, start: 'top bottom', end: 'bottom bottom'`, `scrub: 0.5`, `ease: 'none'`, `invalidateOnRefresh`; unit = one viewport |
| Score | pair i dealt over `[1.4 i, 1.4 i + 1]`, rests `.4`; pair i swept off over `[1.4 (i+1), 1.4 (i+1) + .88]` (print) and `+ .12` (ticket); the last pair settles over `.6` after its deal |
| Ticket rail | from `xPercent −42, y: just under the stage, −9°` (origin top left) → `0` → `−20, just over the stage, −5°` |
| Print rail | from `34, just under, 7°` (origin centre), `.12` later, `.88` long → `0` → `22, just over, 6°` |
| Stage edges | under: `innerHeight × 1.08 − offsetTop`; over: `−(offsetTop + offsetHeight + innerHeight × .08)` |
| Rest of the last pair | ticket `3 %, 3 % of the viewport, −2.5°`; print `−2 %, 0, 1.5°` |
| Active pair | from halfway through its deal: `floor((t − .5) / 1.4)`, announced as "Run i of n: title, client." |
| Focus | a ticket's `focus` (when `:focus-visible`) sets the scroll to its pair's rest on the next frame, immediately; the scrub deals the sheets on the way |
| Phone (≤ 760 px) | ticket at `22svh` across the column, print `62 %` wide anchored `7svh` from the bottom |

## Tiers
- **Full:** the deal, the sweep and the settle, all scrubbed.
- **Reduced:** the same stage and the same score read as an index only. No sheet is translated or turned; the active pair fades in over `.32 s` and the others fade out, with `visibility` following so hidden pairs leave the accessibility tree. The status still announces each change.
- **Static:** the stage is dropped and the runs are a plain list of pairs, as without JavaScript.
- **No JavaScript:** a list of pairs in reading order, ticket then print.

## Accessibility
Each pair is a list item; the ticket is a link with an `h3` and the run's details, and the print is the same link again at `tabindex="-1"` with `aria-hidden`, so a pointer can click the picture while the keyboard and the reader meet each project once. Tabbing to a ticket brings its pair to rest on the stage, so focus never lands on a sheet that is off the mat, and the ring (3 px, the yellow ink, offset 4 px onto the green) is drawn on a sheet at rest. A polite `role="status"` names the run that takes the stage. The prints are drawn in CSS with `mix-blend-mode: multiply`; forced colours drop the blends and draw each sheet's edge.

## Adapters

### React / Next
Render the pairs from data and build the timeline in `useGSAP(() => { … }, { scope: sectionRef })`; the `gsap.context` it creates reverts the `fromTo` starting poses on unmount. Keep the active index in a ref and write the status text directly, or keep it in state but set it only when the index changes, never from `onUpdate` on every frame.

### Svelte
Build in `onMount` inside `gsap.context` and return `ctx.revert`. Set `--n` from the array's length on the section, so the CSS height follows the data.

### Webflow
- Designer: a Section with `--n` as a custom property and the height formula in custom code, a sticky Div inside it, and a Collection List whose items hold two Link Blocks: the ticket, then the print with `tabindex -1` and `aria-hidden` as custom attributes.
- Inject from Footer code: the module above, with GSAP and ScrollTrigger from the project's scripts. Add the status paragraph by hand; Webflow has no live-region element.

Seen in: `[site:the-line]`.
