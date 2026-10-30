# news-read-state

A dated site diary that remembers this visitor. Unread entries carry a New mark in their heading text, a bold title and a rust bar in the margin; the menu link reads "News 3 new", and an entry becomes read when it is opened or when it sits wholly in view below the sticky masthead for a moment after the visitor has scrolled. The state is one checked localStorage record behind try/catch: entries published since the last visit arrive quietly, and when the browser refuses storage or a write fails, the page keeps working from memory and says so.

## Why
- **A reason to come back needs a memory.** The source's header carries a news link with a count badge (`data-total-count="27"` on an element classed `counter no-unread`) and its bundle ships a `visitedNews` chunk `[site:mont-fort]` [verified, index.html + chunk list]. The card does not record how read state is kept; local storage with a try/catch is the catalogue's anatomy for it `[pattern:components-catalog#living-utility-pages]`, and the plugin's own choice here.
- **Progress, dated, is evidence.** The source runs a construction timeline and a news chapter on its long page, with progress and news routes of their own `[site:son-daven]` [verified, index.html section order; the routes recalled medium], and the card draws the lesson that a progress log turns renders into evidence. Each entry here states the works' completion at its date in words, in its meta line, and carries a small plan of the baths with the part it is about filled in: the plugin's choice, so the diary has a drawn image of its own subject instead of a figure in the margin.
- **The count is words.** A dot says something changed, not what or how much, and disappears in forced colours. "3 new" is part of the link's accessible name, so it is announced wherever the link is. The card does not record how the source badge renders; text rather than a dot is the plugin's choice.
- **The mark belongs to its entry.** The bar runs down the entry's inline-start edge in the margin, like a change bar in a revised drawing, so it cannot read as the border of the entry above; the New mark is glued to the title's last word, so it never wraps onto a line alone. The plugin's choice.
- **Read means read.** Opening an entry reads it; so does an entry wholly visible below the sticky masthead for `1.2 s`, but only once the visitor has scrolled, so whatever happens to be on screen at load is not read on their behalf. The status speaks for the visitor's own acts, each on its own; reads from dwelling are inferred, so they stay silent and the menu link's name carries them. The plugin's choice.
- **Arrivals without a clock.** What counts as new since the last visit is decided by dates on the entries, never by the visitor's clock: the record keeps the newest entry seen, and a later entry arrives. A first visit has no last visit, so nothing arrives; the 21 days before the newest entry are simply marked new. The plugin's choice, made so the demo behaves the same whenever it is opened.

## Parameters
| | |
|---|---|
| Record | one key, `mlb-diary`: `{ v: 1, since, seen, read[] }`; storage probed once with a write and a remove, every access in try/catch; a loaded record must have `v` 1, `read` an array of strings and `since`/`seen` as dates or empty, and anything else (an older schema, another script on the key, a hand edit) counts as a first visit and is overwritten |
| Storage failure | refused at boot, or a write that throws mid-visit: memory for the rest of the visit, a sentence under the list's count, and every `[data-needs-storage]` control `aria-disabled` and described by that sentence |
| First visit | `since` = the newest entry's date minus `21` days; entries on or after it and not read are new |
| Arrival | a return visit's new entries dated after `seen` (the newest entry seen last time); `seen` is then moved on |
| Unread marks | the text `New` inside the `<h2>` (with a screen-reader comma), inline, bidi-isolated and glued to the last word; the title at `700`; a `4 px` rust bar down the entry's inline-start edge, set into the margin by half the gutter plus `2 px` (at most `26 px`) |
| Read on open | the native `<details>` `toggle` event, open only |
| Read on dwell | IntersectionObserver at thresholds `0` and `1`, top margin minus the masthead's measured height, rebuilt by a ResizeObserver whenever that height changes; `1200 ms` wholly in view; armed by the first scroll at least `600 ms` after boot (a restored position or a jump to a fragment on load cannot arm it) |
| Masthead | sticky, `64 px`; below `760 px` one `56 px` row with the brand and News, the other links in the footer; its measured height sets `--masthead-h`, and `scroll-padding-top` is that plus `12 px` |
| Count | the menu link's `News <n> new` (the count hidden at zero), the list's `<n> new of <total> entries`; Mark all as read is `aria-disabled` at zero |
| Status | polite `role="status"`: `Marked as read. <n> new left.`, `All <n> marked as read. Nothing new left.`; silent on load and for dwell reads |
| Arrival motion | the bar `scaleY 0 → 1` from the top over `900 ms` expo-out, arrivals `140 ms` apart; a rust wash fading over `2.4 s`; the mark fading in over `400 ms`, starting `500 ms` into the bar's `900 ms`; each fills backwards only, and the bar and mark animate only while the entry is unread, so a read arrival loses both like any other entry |
| Read motion | the mark fades over `400 ms` (`--dur-routine`) and leaves the accessibility tree at `420 ms`; the bar eases back up on the same band |
| Plan | one `<symbol>` (`viewBox 0 0 160 104`) drawn by every entry's `<use>`; `data-area` sets a custom property that fills that part: `gallery`, `tank`, `lantern`, `small`, `slipper`, `boiler`, `chimney` or `entrance` |
| Demo hooks | the two blocks fenced `demo only` in `main.js`: `?storage=blocked` makes `localStorage` throw on access; Publish the next entry adds a held `<template>` entry under its own key, `mlb-diary:demo`, and reloads; Forget my visits clears both keys |

## Tiers
- **Full:** as above, and an opened entry's body rises `6 px` as it fades in.
- **Reduced:** the wash and every fade stay, since they move nothing; an arrival's bar is drawn already, a read entry's bar goes at once, and an opened body only fades.
- **Static** (`data-motion="static"`): no animation or transition at all; marks and bars appear and go at once.
- **Forced colours:** the bar takes `CanvasText`; the mark and the count keep a border, since their fills drop; `aria-disabled` controls turn `GrayText`.

## Accessibility
The diary is an ordered list of `<article>` elements, each named by its `<h2>` and dated by a `<time datetime>`. The New mark is text inside the heading, so heading navigation and the article's name both carry it, and it leaves the tree when the entry is read. Entries open with the native `<details>` and `<summary>` (`Read the entry: the roof lantern`); the `+` and `−` are generated content with empty alternative text, so they stay out of the name. The count lives in the menu link's name. The polite status is silent on load, speaks once per act and never for a dwell read. Mark all as read stays focusable at zero with `aria-disabled`, so focus never falls to the body. The sticky masthead's measured height is reserved through `scroll-padding-top`, so neither the News anchor nor a control reached by Shift+Tab lands under it, and the skip link shows on focus. Without script the entries still open, and Mark all, the storage sentence and the demo ship `hidden`, since only the script makes them true. With storage refused or failing, the page says in words that it cannot remember. The plans and the tiled dado are `aria-hidden`; the meta line names the part of the building in words. Every control is at least 44 px tall.

## Adapters

### React / Next
Keep the record in a small store read through `useSyncExternalStore`, with the try/catch and the shape check inside the store; add a `storage` event listener there if two tabs should stay in step. The server cannot know what this browser has read, so render the list with no marks and apply them after hydration; never let the server's HTML disagree with the first client render. Measure the masthead in an effect with a `ResizeObserver`, set `--masthead-h` and rebuild the dwell observer from the same value.

### Vue / Nuxt
A composable owning the record (load, check and save in try/catch) and a computed unread list; wrap the count and the marks in `<ClientOnly>`. Watch `details` toggles through `@toggle` on each entry; create the dwell `IntersectionObserver` and the masthead's `ResizeObserver` in `onMounted` and disconnect both in `onBeforeUnmount`.

### Webflow
- Designer: a Collection List of articles; each item gets `data-id` (the slug) and a `<time>` whose `datetime` is bound to the date field through a custom attribute; the New mark is a hidden text span inside the heading, with no space before it.
- The plan: the `<symbol>` once in an Embed in the page, and per item an Embed with `<svg data-area><use href="#plan"/></svg>`, `data-area` bound to an Option field.
- Navbar: the count is a text span inside the News link, hidden by default. Inject from Footer code: the module reads `data-entry`, `data-id`, `data-flag`, `data-more` and `data-masthead`; Webflow's own interactions are not involved.

Seen in: `[site:mont-fort]`, `[site:son-daven]`.
