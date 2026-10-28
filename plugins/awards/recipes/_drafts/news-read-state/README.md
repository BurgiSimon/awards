# news-read-state

A dated site diary that remembers this visitor. Unread entries carry a New mark in their heading text as well as a style, the menu link reads "News 3 new", and an entry becomes read when it is opened or when it sits wholly in view for a moment after the visitor has scrolled. Entries published since the last visit arrive quietly; the state lives in one localStorage record behind try/catch, and the page keeps working, from memory, when the browser refuses storage.

## Why
- **A reason to come back needs a memory.** The source's header carries a news link with a count badge (`data-total-count="27"` on an element classed `counter no-unread`) and its bundle ships a `visitedNews` chunk `[site:mont-fort]` [verified, index.html + chunk list]. The card does not record how read state is kept; local storage with a try/catch is the catalogue's anatomy for it `[pattern:components-catalog#living-utility-pages]`, and the plugin's own choice here.
- **Progress, dated, is evidence.** The source runs a construction timeline and a news chapter on its long page, with progress and news routes of their own `[site:son-daven]` [verified, index.html section order; the routes recalled medium], and its own principle is that a progress log turns renders into evidence. Each entry here carries the works' completion at its date as a figure with its unit, in text, over a bar that repeats it.
- **The count is words.** A dot says something changed, not what or how much, and disappears in forced colours. "3 new" is part of the link's accessible name, so it is announced wherever the link is. The plugin's choice; the source badge's rendering is [unknown] on its card.
- **Read means read.** Opening an entry reads it; so does an entry wholly visible below the sticky header for `1.2 s`, but only once the visitor has scrolled, so whatever happens to be on screen at load is not read on their behalf. The status speaks for the visitor's own acts only and gathers reads from scrolling into one sentence. The plugin's choice.
- **Arrivals without a clock.** What counts as new since the last visit is decided by dates on the entries, never by the visitor's clock: the record keeps the newest entry seen, and a later entry arrives. A first visit has no last visit, so nothing arrives; the 21 days before the newest entry are simply marked new. The plugin's choice, made so the demo behaves the same whenever it is opened.

## Parameters
| | |
|---|---|
| Record | one key, `mlb-diary`: `{ v, since, seen, read[], published[] }`; storage probed once with a write and a remove, every access in try/catch; a write that fails mid-visit drops to memory |
| First visit | `since` = the newest entry's date minus `21` days; entries on or after it and not read are new |
| Arrival | a return visit's new entries dated after `seen` (the newest entry seen last time); `seen` is then moved on |
| Unread marks | the text `New` inside the `<h2>` (with a screen-reader comma), the title at `700`, a `3 px` rust rule over the entry |
| Read on open | the native `<details>` `toggle` event, open only |
| Read on dwell | IntersectionObserver at thresholds `0` and `1`, top margin minus the header's height; `1200 ms` wholly in view; armed by the first scroll at least `600 ms` after boot (a restored scroll position cannot arm it) |
| Count | the menu link's `News <n> new` (the count hidden at zero), the list's `<n> new of <total> entries`; Mark all as read is `aria-disabled` at zero |
| Status | polite `role="status"`: `Marked as read. <n> new left.`, `All <n> marked as read.`, `<n> entries marked as read as you scrolled.` (gathered for `600 ms`); never on load |
| Arrival motion | rule `scaleX 0 → 1` over `900 ms` expo-out, arrivals `140 ms` apart; a rust wash fading over `2.4 s`; the mark fading in `500 ms` after its rule |
| Read motion | the mark fades over `400 ms` and leaves the accessibility tree; the rule eases back on the routine band |
| Demo hooks | `?storage=blocked` makes `localStorage` throw on access; Publish the next entry adds a held `<template>` entry to `published` and reloads; Forget my visits clears the record |

## Tiers
- **Full:** as above, and an opened entry's body rises `6 px` as it fades in.
- **Reduced:** the wash and every fade stay, since they move nothing; the arrival's rule is drawn already and an opened body only fades.
- **Static:** no animation or transition at all; marks appear and disappear at once.
- **Forced colours:** the rule takes `CanvasText`; the mark and the count keep a border, since their fills drop.

## Accessibility
The diary is an ordered list of `<article>` elements, each named by its `<h2>` and dated by a `<time datetime>`. The New mark is text inside the heading, so heading navigation and the article's name both carry it, and it leaves the tree when the entry is read. Entries open with the native `<details>` and `<summary>` (`Read the entry: the roof lantern`), so they work without script and from the keyboard. The count lives in the menu link's name. The polite status is silent on load and speaks once per act. Mark all as read stays focusable at zero with `aria-disabled`, so focus never falls to the body. With storage refused, the page says in words that it cannot remember, and the demo controls that need storage are `aria-disabled` with that sentence as their description. Every control is at least 44 px tall.

## Adapters

### React / Next
Keep the record in a small store read through `useSyncExternalStore`, with the try/catch inside the store; add a `storage` event listener there if two tabs should stay in step. The server cannot know what this browser has read, so render the list with no marks and apply them after hydration (or mark the count and the marks client-only); never let the server's HTML disagree with the first client render.

### Vue / Nuxt
A composable owning the record (load and save in try/catch) and a computed unread list; wrap the count and the marks in `<ClientOnly>`. Watch `details` toggles through `@toggle` on each entry and the dwell through one `IntersectionObserver` created in `onMounted`.

### Webflow
- Designer: a Collection List of articles; each item gets `data-id` (the slug) and a `<time>` whose `datetime` is bound to the date field through a custom attribute; the New mark is a hidden text span inside the heading.
- Navbar: the count is a text span inside the News link, hidden by default.
- Inject from Footer code: the module reads `data-entry`, `data-id`, `data-flag` and `data-more`; Webflow's own interactions are not involved.

Seen in: `[site:mont-fort]`, `[site:son-daven]`.
