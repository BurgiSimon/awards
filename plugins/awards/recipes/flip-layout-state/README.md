# flip-layout-state

One list of nine works, rearranged three ways with GSAP Flip: a grid that becomes a list, a discipline filter that re-flows what is left, and a work whose plate travels from its card into a detail view and back. Every change follows the same three steps: `Flip.getState()` records where things are, a class, a `hidden` attribute or a parent changes, and `Flip.from()` animates from the record to the new layout. The DOM is never rebuilt, so listeners, focus and the accessibility tree survive each change.

## Why
- **Two layouts read as one object** when the same elements travel between them (`[pattern:gsap-choreography#flip-and-layout-state]`). The corpus records Flip in use as a scrubbed reparent of the letters of a word [site:noth], chained `Flip.fit` legs paid in scroll distance [site:abatable] and a Flip-driven preloader [site:son-daven].
- **The archive pattern this serves**: names as a list, a grid/list toggle, filters as `aria-pressed` buttons with counts (`[pattern:inner-pages#index-and-archive]`). The cards show a grid/list toggle over ruled rows [site:spasoje], an "index" pill that switches the same work to a list view [site:alectear] and discipline filter buttons with "Filter by …" labels [site:boc]. None of those cards records how the switch animates. This recipe shows one way to animate it.
- **Each Flip uses the options its change needs**, so the recipe sets them per change rather than once for all three.

## The three changes
| Change | Targets | Options | Why |
|---|---|---|---|
| Grid ↔ list | each visible item and its parts (frame, title, meta) | `nested: true`, `absolute: true`, scale off, `props: 'borderTopColor'` | A card that becomes a row changes aspect. With `scale: true` its text would squash, so width and height move instead. `absolute` stops one item's changing size from pushing its neighbours mid-flight. `nested` lets Flip account for the item's own travel when it places the parts. The list's end height is pinned while everything is absolute, because otherwise the list would collapse. The row rules fade in through `borderTopColor`. |
| Filter | every item | `scale: true`, `absoluteOnLeave: true`, `onEnter`, `onLeave` | Items keep their size, so transforms are enough. Leavers go absolute so the rest take their places at once. `onLeave` takes them to `scale .85, opacity 0` over `--flip-fade`, and `onEnter` grows arrivals back over `--flip-dur`. The inline values `onLeave` wrote are cleared in `onComplete`. |
| Detail | the work's plate | `scale: true` (open), `scale: true, zIndex: 3` (close) | The plate is recorded in its card, reparented into the dialog's frame and flown there. Both frames are 4:3, so the scale is uniform. The empty card frame keeps its slot and tone. On close, the copy fades out first, then the ground. Then the plate goes back to its card and a second Flip flies it home over the page. |

## Parameters
Tokens in `style.css`, read by `main.js` on load and whenever the motion tier changes: `--flip-ease: cubic-bezier(.76, 0, .24, 1)` (registered as the CustomEase `flip`), `--flip-dur: .75s`, `--flip-fade: .3s` and `--flip-stagger: .025s`. The stagger is a function of the item, `(i, el) => order(el.closest('[data-work]')) × stagger`. Flip orders its targets by DOM depth, so an index-based stagger would start every part after every item, and a title would trail its own card. The open timeline fades the dialog ground in over `--flip-fade` while the plate flies, and brings the copy up from `y 16` at `.45 × --flip-dur`, staggered `2 × --flip-stagger`. The close fades the copy over `--flip-fade` and the ground from half of it; the flight home follows.

Interrupting is safe. `Flip.getState()` on targets that are still in flight completes the running Flip and records where the targets are at that moment, so a second filter click mid-change starts from what is on screen.

## Motion tiers
- **full**: the three Flips as above.
- **reduced** and **static**: no Flip and no fade. The class, the `hidden` attribute or the parent changes, and the next frame is the end state. The dialog opens and closes at once, with the plate already in place. The CSS zeroes the tokens under `prefers-reduced-motion` and `data-motion-tier="static"` as well.

## Accessibility
- The list is a `<ul>` of `<li>`, and each work's name is a `<button>` inside its `<h3>`. A stretched `::after` makes the whole item the hit area while the button stays the one focus stop and the one accessible name.
- View and filter controls are `<button aria-pressed>` in two labelled groups, 44 px high, and each filter shows its count. A `role="status"` line announces "3 of 9 works, as a grid" after each change.
- Focus stays on the control you pressed. Filtering never moves it, because no node is replaced. A filtered-out work is `hidden`, so it leaves the Tab order and the accessibility tree; verify reads the ARIA snapshot to check this.
- The detail is a native `<dialog>` opened with `showModal()`. The page behind it is inert, and focus moves to the dialog's first control ("Back to the index"). Escape and that button run the authored close. On close, focus returns to the button of the work that opened it. If the dialog is closed some other way, the plate is put back at once. The page scroll is locked while it is open, and `scrollbar-gutter: stable` keeps the cards from shifting under it.

## Verify
`list-mid` samples the grid → list change while it runs, and it must be a live Flip with items in flight. `list` checks that the items stand in one column at the list's width, at rest, and that the first frame after the click was not yet settled. `filter` checks three works left with six `display: none`, no overlaps, three list items in the ARIA snapshot and focus still on Print. `filter-back` checks that All returns every work at opacity 1 with no transform. `detail` opens a work with Enter and checks focus on the dialog's button and the plate inside the detail frame within 2 px. `detail-closed` presses Escape and checks focus back on the same work's button and the plate home in its card. `rm` runs the four changes under reduced motion, and each must be untweened and settled on the next frame. The phone states check one column, rows, the detail plate inside the viewport and no overflow.

## Adapters
- **React**: record `Flip.getState()` in the event handler before `setState`, then run `Flip.from()` in a layout effect after the commit (`useGSAP` with the view and filter as dependencies). Keep keys stable so React reuses the nodes. Do not reparent a node React owns. Render the plate in the card and in the dialog with one shared `data-flip-id` and call `Flip.from(state, { targets: dialogPlate })`, because Flip matches elements by that id.
- **Vue / Nuxt**: `getState` before the reactive change, `await nextTick()`, then `Flip.from`. `<TransitionGroup>` covers the filter alone, but it cannot do the nested grid-to-list parts.
- **Svelte**: `animate:flip` from `svelte/animate` handles a keyed list re-flow. For nested parts and the dialog, call GSAP Flip after `await tick()`.
- **Astro**: ship the module as an island script, as it is. A same-document `document.startViewTransition()` with a `view-transition-name` per item is the no-library alternative. It loses the per-item stagger and the nested parts.

Synthetic content: the nine works, their clients, roles and descriptions are invented for this demo, and the plates are CSS-drawn stand-ins for project images.
