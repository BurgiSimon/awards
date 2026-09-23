# dialog-nested-lenis-sheet

A long-content dialog (studio info, credits, terms) that scrolls on its own: a native `<dialog>` opened with `showModal()`, a second Lenis bound to the dialog's scroller and ticked by the same clock as the page Lenis, `data-lenis-prevent` keeping the two apart, and an inner pane that keeps native scrolling. Under 768 px the same markup docks to the bottom as a sheet you can drag away. The content is in the HTML from the start, not injected on open.

Demo content is synthetic: the studio, its clients and the address are invented.

## Why
- **A long dialog needs the same scroll feel as the page.** Without a nested Lenis, the page glides and the dialog jumps. With one, both ease identically, and the page stays put behind the dialog `[site:boc]`.
- **Two Lenis instances, one clock.** Lenis 1.3 defaults to `autoRaf: false`, so the nested instance is created on open and ticked from the shared ticker (`_shared/raf.js`) next to the page instance, then destroyed on close. A Lenis nobody ticks swallows the wheel and the dialog looks frozen.
- **`data-lenis-prevent` works at two levels.** On the `<dialog>` it keeps the page Lenis out of every event that starts inside. On the inner pane it keeps the nested Lenis out, so the pane scrolls natively with `overscroll-behavior: contain`.
- **Native `<dialog>` does the hard accessibility parts.** `showModal()` puts the dialog in the top layer, makes the page inert, focuses `[autofocus]` and turns Escape into a `cancel` event. The recipe cancels that event only to animate the close, and every close path ends in one `close` handler that restores focus to the opener.
- **Server-rendered content.** Crawlers, find-in-page and no-JS readers get the text, and nothing is fetched when the dialog opens (`[site:boc]` §8).

## Parameters
Open: panel `y 48 → 0`, `opacity 0 → 1`, `.66 s`, `expo.out`; scrim `.4 s`. Close: `y → 32`, `opacity → 0`, `.42 s`, `expo.in`. Sheet: `y` from the sheet height to 0 and back on the same eases. Nested Lenis: `duration 1.2`, expo easing. Dismiss: drag past `DISMISS = .25` of the sheet height, or release while flicking faster than `FLICK = .6 px/ms`. A shorter drag springs back over `.5 s`. The breakpoint is `max-width: 767.98px`.

## Motion tiers
- **full**: animated open and close, nested Lenis.
- **reduced / static**: open and close are instant and the scroller scrolls natively (no nested Lenis). Dragging still works, because it follows the finger rather than moving on its own. Snap-back and dismissal are instant.

## Accessibility
`aria-labelledby` on the dialog, `aria-haspopup="dialog"` on the opener, a focusable scroll region and a focusable pane with names, Escape and the Close button as keyboard equivalents of the drag, a scrim click to close, and 44 px targets. Dragging starts only from the sheet's header, so touch scrolling in the content is never taken over.

## Adapters
- **React / Next**: create the nested Lenis in an effect when the dialog opens and destroy it in the cleanup. Keep `data-lenis-prevent` on the dialog root. Tick the nested instance from the same clock as the root Lenis, never from its own `autoRaf`.
- **Vue / Nuxt, Svelte**: same lifecycle, using `onMounted` / `onMount` for the instance and the `close` event for teardown.
- **Astro**: render the dialog in the page and hydrate only the script.

Seen in: `[site:boc]`.
