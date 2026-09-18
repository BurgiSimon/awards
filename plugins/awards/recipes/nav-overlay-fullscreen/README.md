# nav-overlay-fullscreen

A menu that takes the whole screen on its own theme: a clip-path wipe, numbered links rising out of masks with a stagger, the page behind made `inert` and stopped, focus trapped, Escape closing, focus returning to the toggle. Under reduced motion it appears and disappears without choreography.

## Why
- **Overlays are where keyboard users get lost.** `inert` on the page, a trap that includes the always-visible toggle, and restored focus are the difference between a menu and a wall (`[pattern:accessibility-and-reduced-motion]`).
- **The theme swap is part of the move.** The overlay carries `data-theme="dark"`, so the tokens flip with it and the toggle recolours through a class on `<html>` (`[recipe:theme-swap-tokens]`).
- **Scroll stops with Lenis, not with a hack.** `lenis.stop()` while open, `start()` on close; `overflow: hidden` on `<html>` backs it up for native scrolling.
- **Numbered links as texture.** `01 – 04` labels beside display-scale words: the corpus's menu vocabulary `[site:son-daven]` `[site:leo-parpeix]`.

## Parameters
Wipe `clip-path: inset(0 0 100% 0 → 0)`, `.9 s`, `expo.inOut` · words `yPercent 110 → 0`, `1 s`, `expo.out`, stagger `.07` · close: words `−110 %`, `.5 s`, `expo.in`, then wipe `.7 s`.

## Accessibility
`role="dialog"` with `aria-modal`, `aria-expanded` and `aria-controls` on the toggle, `hidden` while closed, first link focused on open, Escape and Close button, trap on Tab / Shift+Tab, link activation closes the menu.

## Adapters
Use a native `<dialog>` with `showModal()` where the overlay does not need a custom entrance layer order; keep the same timeline on `dialog::backdrop` and the words.

Seen in: `[site:son-daven]`, `[site:leo-parpeix]`, `[site:mont-fort]`.
