# chapter-jump-rail

A chaptered long read with one fixed `<nav>` of real chapter links that is both a jump rail and a scrollspy. The current link follows the chapter whose midpoint is nearest the viewport centre, a rule under each name fills with the reading position, and a jump glides with Lenis, marks its destination at once, then lands with focus on the chapter heading and one polite announcement. Below 900 px the same list sits behind a sticky ticket that names the current chapter and opens as a disclosure, so the navigation model is the same on every device.

## Why
- **The rail must be links, and it must say where you are.** The jump rail that works is a real `<nav>` of anchors, one per chapter, with a progress bar scrubbed by the scroll `[site:mont-fort]` [verified]; the same card loses points for labels revealed on `mouseenter` only and a rail that is `pointer-events: none` outside the chapters, so here every name is always visible and every link always works. A four-anchor nav whose underline tracks the chapter, plus a fixed pill naming it, shows how little the wayfinding needs to cost `[site:oryzo]` [verified].
- **Answer at the start of the jump.** The page that announces its chapters also moves its nav highlight when a chapter change begins, not when it ends `[site:christoph-nagel]` [verified, `script.js`]. Here the destination is marked the moment the glide starts and held until it lands, so the rail never flickers through the chapters the glide passes over; the fills keep following the real position, which is what makes the trip read as travel.
- **Move focus and say it once.** Numbered chapter controls, a progress bar and a polite live region naming each chapter come from the same card `[site:christoph-nagel]` [verified]. Without the focus move a keyboard reader who jumps is still in the rail; without the announcement a screen reader hears nothing change. Announcing only on landing, never on a plain scroll, is the plugin's own rule: a status that talks on every scroll is noise.
- **One nav model per device.** The scrollspy pattern hides its index below about 900 px `[pattern:components-catalog#scrollspy-side-index]`, and the site cited for it ships none at all while opening its menu by hover on desktop and by button on phones, with Usability its lowest axis at 7.17 `[site:seasats]` [verified]. The phone version here is the same list behind a ticket, whose label is the current chapter's number and a shortened title, the device the header of an archive uses on phones `[site:gehry-getty]` [verified].
- **Bind the mark to the scroll number, not to a guess.** A rail that marks one chapter while another fills the screen is a recorded weakness `[site:shopify-editions-w26]` [verified]. The current chapter, the fills and the ticket here all read one measurement per scroll event: the viewport centre against cached chapter offsets. The nearest-midpoint rule, and switching it off above the first chapter and below the last, are the plugin's choice.

## Parameters
| | |
|---|---|
| Current chapter | the chapter whose midpoint is nearest `scrollY + innerHeight / 2`; none while the centre is above chapter 1's top or below chapter 6's bottom; offsets measured on load, resize, fonts and a `ResizeObserver`, never per frame |
| Reading progress | `(centre − top) / height`, clamped 0–1; earlier chapters `1`, later `0`; written as `scaleX` on a 2 px rule only when it changes by `.001` |
| Marker | one 3 px bar on a 1 px track; `translate3d(0, link top, 0)` and the link's height; `transform var(--dur-routine)` (`400 ms`) `var(--ease-out-expo)`; cuts when it first appears, then fades in |
| Jump | `lenis.scrollTo(section, { duration: 1.2, force: true })` with Lenis' default expo-out curve; `scroll-margin-top` honoured; Lenis re-synced first if the page moved natively; released `0.6 s` past the glide if it never completes |
| Landing | `h2[tabindex="-1"].focus({ preventScroll: true })`, `history.replaceState` to `#stage-n`, then `Stage n of 6: title` in a polite `role="status"` (cleared, rewritten after `60 ms`) |
| Cancel | `wheel`, `touchstart`, or an arrow, Page, Home, End or Space key during the glide: no focus move, no announcement |
| Ticket | below `900 px`; `position: sticky; top: 0`, `60 px` tall; `n of 6` + the chapter's `data-short`; its own 2 px progress rule; a disclosure closed by Escape (focus back to the ticket), a pointer outside, Tab out of the nav, or a jump |
| Lenis | `lerp: .1`, `autoRaf: false`, driven by `gsap.ticker`, `lagSmoothing(0)`; `smoothWheel` in the full tier only |

## Tiers
- **Full:** the marker travels on the routine band, jumps glide for 1.2 s, the open ticket list fades and drops 8 px.
- **Reduced:** jumps are instant (`immediate: true`, which Lenis also forces for programmatic scrolls under the media query), the marker cuts, the list only fades; the current link, its colour, the fills, the focus move and the announcement all stay.
- **Static:** as reduced, with no colour transitions.
- **Forced colours:** the marker and the fills' backgrounds are dropped by the browser, so the current link carries a `Highlight` outline and the rules are painted with `forced-color-adjust: none`.
- **No JavaScript:** the links are plain anchors to the chapters, the headings carry `scroll-margin-top`, and on a phone the list sits in the flow as a contents list (the ticket only collapses it once the script has run).

## Accessibility
The rail is a `<nav aria-label="Stages of the walk">` of links in an ordered list; the current one carries `aria-current="true"`, which a screen reader reads with the link. The visible numerals are `aria-hidden` and each name starts with a visually hidden "Stage n:", so the links read as words, not as stray digits. Chapter headings are focus targets (`tabindex="-1"`), so after a jump the next Tab continues inside the chapter rather than back in the rail. The phone ticket is a `<button aria-expanded aria-controls>` over the same list, and Escape returns focus to it. The only live region speaks once per landed jump. Links are 52 px tall (56 px in the phone list), the ticket 60 px; focus is a 2 px accent outline. The marker, the track and the rules are decoration; each height profile is an `<svg role="img">` with a sentence for a label.

## Adapters

### React / Next
Keep the current index in a ref updated from a `useLenis` scroll callback and call `setState` only when the index changes, so a scroll does not re-render the page; write the fills' `transform` through refs. Do the jump in the click handler with `lenis.scrollTo(ref.current, { onComplete })`, focusing the heading's ref in `onComplete`. In Next, render the links as plain `<a href="#…">` (not `next/link`), so the router does not try its own scroll.

### Vue / Nuxt
A composable that owns the Lenis instance (or reads Nuxt's) and exposes `current`, `progress` and `jump(i)`; bind `:aria-current="i === current ? 'true' : null"` in the template and write the fills and the marker's transform in a watcher with template refs. Measure in `onMounted` and after `document.fonts.ready`.

### Webflow
- Designer: a Nav Bar or Div Block set to `position: fixed` holding a list of Link Blocks to the sections' IDs, each with a number, a name and a 2 px Div for the rule; one more Div for the marker. Give each section an ID, `data-chapter` and `data-short`, and each heading `tabindex="-1"` through custom attributes.
- Inject from Footer code, after Lenis: the module only measures, writes attributes and transforms, and calls `lenis.scrollTo`.
- Build the phone ticket as a Button inside the same nav, hidden above the breakpoint; Webflow's own Dropdown component would put a second list on the page.

Seen in: `[site:christoph-nagel]`, `[site:gehry-getty]`, `[site:oryzo]`, `[site:mont-fort]`, `[site:seasats]`.
