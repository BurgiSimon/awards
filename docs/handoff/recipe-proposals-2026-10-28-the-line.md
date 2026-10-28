# Recipe proposals — wave 6b, The Line motion lens (2026-10-28)

Wave 6b re-reads one existing card, `the-line` (Awwwards Site of the Day, Animations/Transitions 9.00, DOM, CSS and SVG only), with a motion and interaction lens: the home route, `/work` and one case study. The maintainer asked to "make the awards skill better with it", so the selection gate was answered in advance.

Candidates come from `### Techniques and stacks` under `## Wave 6b` in `docs/handoff/corpus-ledger.md`. A candidate is listed only when no title or tag in `recipes/*/recipe.json` or `recipes/README.md` covers it; thirteen recipes already cited the card (`sticky-stages-rails` for the rails and the hero hinge, `flicker-text`, `preloader-counter-hold` with an fps variant, `hover-preview-list`, `cursor-two-speed`, `designed-404` and the Alder Workshop compositions among them), and `scrollbar-thumb-drag` already covers the drawn scrollbar. Each entry generalises its technique; none copies the site's palette, copy, assets, safe-area guide or signature values. All three build under the recipe contract: headless SwiftShader, system fonts, CSS and canvas-2D drawing only, and the pinned `gsap@3.15.0` (plus `lenis@1.3.26` for the first). No new pin is needed.

## 1. `footer-credits-hinge` — Closing sheet over a held footer, with credits under a lifting stage (the close)
- Seen in: the-line
- Tier: P1 · Deps: gsap@3.15.0, lenis@1.3.26
- Overlap:
  - `designed-footer` is a static close.
  - `sticky-stages-rails` holds a hero and stages on rails, not a footer.
  - `two-phase-interruptible-timeline` and `nav-overlay-fullscreen` are panels over the page.
  - This recipe holds the footer on a rail that starts `50svh` early, tips the page's last sheet on its corner on a scrub to `max`, and keeps the credits under the stage; opening scrolls to the end and lifts and tilts the stage on one CSS transition. It adds what the source lacks: the panel `inert` while closed, focus moved in and back, Escape and a real close button, and keyboard focus that jumps to the end so it never lands under the sheet.
- Verify idea:
  - At the end the sheet has tipped to −5° and the content has landed.
  - Open: scrolled to the end, panel visible and not inert, the stage lifted and tilted, title, copy and close button uncovered (hit tests), focus on the heading.
  - Escape, the close button, Enter / Tab / Enter and a scroll after the arming delay each close it, focus on the trigger.
  - A footer link focused while the sheet covers it (checked before the focus) ends up uncovered.
  - Reduced motion: nothing tips or lifts; the credits fade up over the stage.
- Lens: motion (DOM)

## 2. `overprint-marker-index` — One multiply marker cut between rows (galleries and lists)
- Seen in: the-line
- Tier: P1 · Deps: gsap@3.15.0
- Overlap:
  - `hover-preview-list` follows the pointer with a preview image.
  - `filmstrip-index-rows` moves rows themselves.
  - `wordmark-header-handoff` eases an underline.
  - This recipe marks the row with one `mix-blend-mode: multiply` bar in an isolated stacking context, between the plates and the words, written to the row's own offset with no transition. It follows the mouse, keyboard focus and, on touch screens, a reading line; sort buttons re-order, announce and step the rows back in by hard sets.
- Verify idea:
  - The marker covers exactly the hovered row; blend multiply, no transition, plate < marker < words.
  - Pixels: the plate under the marker is overprinted (red channel near 0), a plate outside it keeps its colour.
  - A per-frame sampler across a jump finds only row offsets, never a value between rows.
  - Tab moves the mark; sorting by project and flipping the year order re-order and announce.
  - A phone marks the row crossing 40 % of the viewport; reduced motion keeps the cut and drops the blink.
- Lens: motion (DOM)

## 3. `next-case-handoff` — A close that becomes the next page's hero, the live media node reparented (routes)
- Seen in: the-line
- Tier: P1 · Deps: gsap@3.15.0
- Overlap:
  - `transition-promote-chosen` raises the clicked row into the header slot and pushes the route.
  - `page-transitions` swaps with taxi; `view-transitions-mpa` morphs snapshots across documents.
  - `case-study-route-kit` ends on a static next-project link.
  - This recipe gives the close the hero's own geometry, hinges its card on a scrub, and on click lifts the frame out of its clip (fixed at its own rect) to the top while the card unwinds, then swaps `<main>` and moves the frame's canvas, a stand-in for a playing film, into the new hero, so the picture never restarts. The arriving page brings its own `h1` to the exact place the lifted card ended and takes focus; every link is real, so reduced motion and failures navigate.
- Verify idea:
  - The close hinges to −5° by the end; the link is a real URL.
  - Mid-flight the frame is fixed, travelling, the card unwinding, the page not yet swapped.
  - After the hand-off: the next page's URL, title and `h1`; one `<main>`; the hero's canvas is the same node (painter id) and its frame count kept climbing; the new card sits within 2 px of where the lifted card ended; scroll 0 and focus on the `h1`.
  - A second hand-off from the arrived page; Back restores the previous case; reduced motion navigates for real; the same on a phone.
- Lens: motion (routes)

## Not built (candidates left in this file)
- `dealt-sheets-stage`:
  - One sticky stage where each item is a pair of sheets (caption and media) dealt in and out on its own rail, the last one settling instead of leaving (the-line featured work).
  - It overlaps `sticky-stages-rails` (one rail, three cards rising and falling) closely enough to be a variant; add it there if a brief needs paired sheets.
- `registered-blink-chrome`:
  - The four blink effects as a whole chrome grammar: header arrival cascade at .04 s, nav hover and press, a path-stepped icon swap, stepped list entry.
  - Two of the three new recipes already register and use the effect; `flicker-text` keeps the per-glyph version. Build it only if a site's whole chrome speaks in steps.
- `measured-frame-guides`:
  - Nested safe-area frames with live pixel readouts measured on resize, as chrome in a film studio's dialect.
  - It is one site's signature; the pattern line in `copy-and-content.md` records it, and a recipe would invite the copy the card refuses.
