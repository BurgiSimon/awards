# dealt-sheets-stage

Featured work dealt like cards onto one held stage. Each project is a pair of sheets, a ticket that names it and a print that shows it, and each sheet has its own rail through one scrubbed timeline: the ticket comes in from the lower left, turning about its corner, and the print comes from the lower right a beat later and from further away. The next pair lands on top of the resting one before that one moves; only then is the old pair pulled out from under it, past the side edges, and the last pair does not leave: it settles into a resting pose and rides away with the stage.

## Why
- **A sticky stage on a tall section, never a pin.** The section is as tall as the score, and a `position: sticky` child is the stage, so the document keeps its native scroll and no spacer is ever inserted. The source site builds its featured work exactly so, with one invisible rail per case `[site:the-line]` [verified, B6MUFv6g.js] `[pattern:motion-vocabulary#sticky-stages-and-hinges]`.
- **Two rails per item read as handling, not as a slide.** The source deals each case as a title sheet and a media sheet, the second `.06` later, from different offsets at the same 15° turn (title `yPercent 110, xPercent 15`, media `130 / 20`), and sends them out at −7° and −5°, on `ease: 'none'` scrubs `[site:the-line]` [verified] `[pattern:gsap-choreography#scrolltrigger-configurations]`. The values here are this recipe's own: opposite sides (`xPercent −42` against `34`, `−14` and `14` on a phone), opposite turns (`−12°` about the ticket's top-left corner, `9°` about the print's centre), a `.12` lag, and vertical rails measured from the stage's edge, so the tall print travels further than the short ticket and each sheet starts entering the frame the moment its rail starts.
- **A deal lands on top of something.** The resting pair is left in place until the next pair is `.7` into its deal and already lies over it; only then is it pulled out from under, print first, past the side edges rather than up. The source's sheets leave upward while their own section scrolls away; a held stage has no section scroll to carry them, so the sideways sweep and the overlap are this recipe's choice, and they keep the hand-over from reading as one list sliding past.
- **The last item settles instead of leaving.** The source's last case drifts down rather than going off `[site:the-line]` [verified]. Here every pair lands a little askew in its own way, and the fifth then drifts on into a resting pose over `.6` of a stage height, so the set-piece ends on a composed frame rather than an empty one.
- **One timeline, counted in stage heights.** Every beat sits on one scrubbed timeline whose unit is one stage height of scroll, from the moment the section's top is one stage height down the viewport, and the script writes the section's height from the same score (`T × 100svh`), so the two cannot drift apart. The first pair is dealt exactly while the stage scrolls into place, and adding a project is one more `<li>`. This differs from `[recipe:sticky-stages-rails]`, where three cards rise and fall on one rail with opacity: here every item is a pair, each sheet has its own path, and items replace one another. The single timeline is the plugin's choice; the source gives each case its own triggers.
- **The motion has a keyboard and a voice.** The source deals its sheets whatever the motion setting and ships no `keydown` handler at all `[site:the-line]` [verified, card §6]. Here the tickets are real links in the tab order, focusing one brings its pair to rest on the stage, the active pair is announced in a polite status, and reduced motion cross-fades the pairs in place.

## Parameters
| | |
|---|---|
| Section | `height: T × 100svh`, written by the script in the full and reduced tiers; sticky stage `100svh`, `overflow: clip` |
| Timeline | `trigger: section, start: 'top <stage>px', end: 'bottom <stage>px'`, `scrub: 0.5`, `ease: 'none'`, `invalidateOnRefresh`; unit = one stage height (`stage.clientHeight`, not `innerHeight`) |
| Score | pair i dealt over `[1.5 i, 1.5 i + 1]` (print from `+ .12`); the pair before it pulled out from `1.5 i + .7` (print) and `+ .82` (ticket), `.45` each; the last pair settles over `.6`; `T = 1.5 (n − 1) + 1.6`, `7.6` for five |
| Ticket rail | from `xPercent −42` (phone `−14`), its top `24px + width × sin 12°` under the stage, `−12°`, origin top left → its pose → past the left edge by `24px + height × sin 10°`, `y +15 %` of its height, `−10°` |
| Print rail | from `34` (phone `14`), under the stage the same way with `9°`, origin centre, `.12` later and `.88` long → its pose → past the right edge the same way, `y −8 %`, `8°` |
| First pair | rides in on the stage itself: the same sideways offset and turn, but only `y +30 %` of its own height |
| Poses (ticket %, °; print %, °) | `−2, −1.5; 1, .8` · `3, 2; −1.5, −1` · `−3, −2.5; .5, 1.2` · `2, 1.5; −1, −.6` · `−1, −1; 1.5, .5` |
| Settle | the last pair drifts to ticket `3 %, 3 % of the stage, −2.5°`; print `−2 %, 0, 1.5°` |
| Active pair | the first from `t .8`; each later one from `.7` into its deal: `floor((t − .7) / 1.5)`, announced as "Run i of n: title, client." |
| Focus | a ticket's `focus` (when `:focus-visible`) hushes the status for `600 ms`, sets the scroll to its pair's rest on the next frame, immediately, and finishes the scrub tween (`getTween().progress(1)`) |
| Print size | `width: min(59.2svh, 50vw − gutter)`, `aspect-ratio: 4 / 5`, centred on the stage's height; the ticket's top `7 %` of that width above the centre |
| Short window | `max-height: 520px` above the phone width: the note gives way, the ticket sits on `bottom: 6svh` |
| Phone (≤ 760 px) | print `min(82vw, 40svh)` wide at `20svh` from the top, on the right gutter; ticket across its foot, `28px` over it |

## Tiers
- **Full:** the deal, the sweep from under, the settle, all scrubbed.
- **Reduced:** the same stage and the same score read as an index only. No tween owns a sheet, and none is translated or turned; the active pair fades in over `.32 s` and the others fade out. A faded pair takes no pointer but keeps its ticket in the tab order, and focusing it brings the pair back. The status still announces each change.
- **Static:** the stage is dropped, the script's height removed and the status emptied; the runs are a plain list of pairs, as without JavaScript.
- **No JavaScript:** a list of pairs in reading order, ticket then print.

## Accessibility
Each pair is a list item; the ticket is a link named by its `h3` (`aria-labelledby`) and described by the client and the run (`aria-describedby`), and the print is the same link again at `tabindex="-1"` with `aria-hidden`, so a pointer can click the picture while the keyboard and the reader meet each project once, by a short name. Tabbing to a ticket brings its pair to rest on the stage before the ring is painted, so focus never lands on a sheet that is still being dealt. The ring is 3 px of the yellow ink between two bands of the sheets' black, so it holds both on the green mat and where the ticket overlaps a cream print. A polite `role="status"` names the run that takes the stage as you scroll; it stays quiet when a focused ticket brought the run in (the link has just said its name) and is emptied whenever no pair holds the stage, so it never keeps a stale run. The prints are drawn in CSS with `mix-blend-mode: multiply`; forced colours drop the blends and draw each sheet's edge.

## Adapters

### React / Next
Render the pairs from data and build the timeline in `useGSAP(() => { … }, { scope: sectionRef })`; the `gsap.context` it creates reverts the `fromTo` starting poses on unmount. Take the app's Lenis from `[recipe:boot-lenis-gsap]` rather than creating one here; if this component must own it, keep the ticker callback in a const and on cleanup call `gsap.ticker.remove(raf)` and `lenis.destroy()`, or a remount leaves a second Lenis and a second callback running. Keep the active index in a ref and write the status text directly, never from state set on every `onUpdate`.

### Svelte
Build in `onMount` inside `gsap.context` and return `() => { ctx.revert(); gsap.ticker.remove(raf); lenis.destroy(); }` (or only `ctx.revert()` when the layout owns Lenis). The section's height comes from the score in the script, so a longer array needs no CSS change.

### Webflow
- Designer: a Section, a sticky Div inside it, and a Collection List whose items hold two Link Blocks: the ticket (with `aria-labelledby` and `aria-describedby` pointing at its heading and details as custom attributes), then the print with `tabindex -1` and `aria-hidden`.
- Inject from Footer code: the module above, with GSAP and ScrollTrigger from the project's scripts. The module creates its own Lenis on the GSAP ticker and the focus scroll goes through it; if the site already runs a smooth-scroll script, pass that Lenis in instead, since two on one page fight over the wheel. Add the status paragraph by hand; Webflow has no live-region element.

Seen in: `[site:the-line]`.
