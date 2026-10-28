# nav-overlay-fullscreen

A menu that takes the whole screen on its own theme: a clip-path wipe, links rising out of masks with a stagger, the page behind made `inert` and stopped, focus trapped, Escape closing, focus returning to the toggle. Under reduced motion it appears and disappears without choreography.

## Why
- **Overlays are where keyboard users get lost.** `inert` on the page, a trap that includes the always-visible toggle, and restored focus are the difference between a menu and a wall (`[pattern:accessibility-and-reduced-motion]`).
- **The theme swap is part of the move.** The overlay carries `data-theme="dark"`, so the tokens flip with it and the toggle recolours through a class on `<html>` (`[recipe:theme-swap-tokens]`).
- **Scroll stops with Lenis, not with a hack.** `lenis.stop()` while open, `start()` on close; `overflow: hidden` on `<html>` backs it up for native scrolling.
- **Display-scale words, nothing else.** The links carry no numbers by default. `01 – 04` beside the words is the corpus's menu vocabulary `[site:son-daven]` `[site:leo-parpeix]`, and copied by default it became every build's menu; add it as the numbered variant only when WORLD is an index or a catalogue, the same test L05 applies to labels.

## Parameters
Wipe `clip-path: inset(0 0 100% 0 → 0)`, `.9 s`, `expo.inOut` · words `yPercent 110 → 0`, `1 s`, `expo.out`, stagger `.07` · close: words `−110 %`, `.5 s`, `expo.in`, then wipe `.7 s`.

## Accessibility
`role="dialog"` with `aria-modal`, `aria-expanded` and `aria-controls` on the toggle, `hidden` while closed, first link focused on open, Escape and Close button, trap on Tab / Shift+Tab, link activation closes the menu.

## Adapters
Use a native `<dialog>` with `showModal()` where the overlay does not need a custom entrance layer order; keep the same timeline on `dialog::backdrop` and the words.

### React
`<NavOverlay links={[{ href: '/work', label: 'Work' }, …]} pageRef={mainRef} Link={Link} meta="London, England · 51.5072° N" />` from `adapters/react.jsx`, in the site header, renders the toggle and the overlay. `pageRef` is the content made `inert` (default `[data-page]`, else the `main` element); `Link` takes `next/link`.
- It stops and starts the root Lenis through `useLenis()`, so it needs `<SmoothScroll>` from [recipe:boot-lenis-gsap]. The words enter with `fromTo`, so a second open rises from below the mask again.
- Place it outside transformed ancestors (the overlay is `position: fixed`). `'use client'` for Next's App Router.

### Webflow
- Not the Navbar component: Webflow's nav sets `overflow: hidden` on `body` when open (`references/stacks/webflow-export.md`). Build from plain elements, and give the main wrapper Tag **Main** with the custom attribute `data-page`.
- Toggle, in the header: a button with the custom attributes `data-menu-toggle`, `aria-expanded="false"`, `aria-controls="menu"` and `aria-haspopup="dialog"`, holding the two-bar icon (`aria-hidden="true"`) and a span `data-menu-label`. It has to publish as a `<button>`; if the Designer's Button element renders a link, a Code Embed holds the toggle [unverified].
- Overlay: a Div with id `menu`, class `menu` and the custom attributes `data-menu`, `data-theme="dark"`, `role="dialog"`, `aria-modal="true"`, `aria-label="Site menu"` and `data-lenis-prevent`. Inside: a Close button `data-menu-close`, an element with Tag **Nav** and `aria-label="Primary"` holding an ordered list of Links with `data-menu-link`, each wrapping a span `menu__word`, and the meta line. Keep it visible while styling and let the module set `hidden` on boot, since whether `hidden` survives as a custom attribute is [unverified].
- No Webflow click interaction on the toggle, the links or the overlay: the module owns the wipe, `inert`, the focus trap and Escape.
- Inject: an entry in the engine loaded by the [recipe:boot-lenis-gsap] Footer-code loader; it stops and starts the boot's Lenis rather than creating one. Port the word entrance as `fromTo(…, { yPercent: 110 }, { yPercent: 0 })`: the recipe's `from` would read the −110 % the close leaves behind, so a second open would end above the mask.
- Reduced motion: no wipe and no stagger. The overlay appears and disappears with the same focus handling.

Seen in: `[site:son-daven]`, `[site:leo-parpeix]`, `[site:mont-fort]`, `[site:the-line]`.
