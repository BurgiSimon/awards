# cursor-two-speed

A dot that follows the pointer almost instantly and a ring that lags: two damping rates on one input give the cursor mass. Over interactive elements the ring grows to `1.35×` and the dot shrinks to `0.7×`; over elements tagged `data-cursor="drag|play|view|copy"` a badge names the affordance. On coarse pointers, or when hover does not exist, the whole thing is never created.

## Why
- **Mass from two rates.** Dot lerp `.75`, ring lerp `.22` (per 60 fps frame), converted through `damp()` so the feel is identical at 60 and 144 Hz. These are this recipe's own tuned values: the figures were once attributed to `[site:leo-parpeix]`, whose live build ships a contextual text label rather than a dot and ring [verified, live bundle 2026-09-18].
- **Cursor as affordance system.** The badge tells the visitor what a gesture will do before they commit; it replaces tooltips on drag surfaces and media (`[pattern:cursor-and-pointer]`).
- **Feature-gated, not hidden.** `(pointer: fine) and (hover: hover)` decides whether the module even attaches; `cursor: none` is applied through a class so the OS cursor comes back the moment the module is disabled or the pointer leaves the window.
- **Reduced motion removes the lag**, not the cursor: both parts snap to the pointer, so nothing trails.

## Parameters
`DOT_LERP .75` · `RING_LERP .22` · hover ring `1.35×`, dot `0.7×`, ring opacity `.35 → .8` · badge offset `14 px`.

## Accessibility
`aria-hidden` cursor layer, `pointer-events: none`, keyboard users never see it; every tagged element is a real link, button or focusable group.

## Adapters

### React
`<Cursor />` from `adapters/react.jsx`, mounted once after `{children}` in the root layout and outside any transformed ancestor (the layer is `position: fixed`). Props: `dotLerp` (.75) and `ringLerp` (.22). Tag targets with `data-cursor="view|play|drag|copy"` as in the recipe, and copy the `.cursor` rules from `style.css`.
- It ticks on `gsap.ticker`, the clock the root Lenis already rides, instead of the shared rAF; `gsap.matchMedia` on `(pointer: fine) and (hover: hover)` decides whether it exists at all.
- `'use client'` for Next's App Router.

### Webflow
- Designer: nothing to build for the layer. The module appends the `aria-hidden` root with ring, dot and badge to `body`, the way the engine appends its WebGL canvas (`references/stacks/webflow-export.md`), so it exists once per page with no element repeated on every page. Tag targets with the custom attribute `data-cursor="view"`, `"play"`, `"drag"` or `"copy"` on links, buttons and focusable Divs.
- Never set `cursor: none` in the Designer. The module adds `has-cursor` to `html`, and the `.cursor` rules from `style.css`, inside their `(pointer: fine) and (hover: hover)` query, go in Head code; the OS cursor then returns whenever the module is off.
- Inject: an entry in the engine loaded by the [recipe:boot-lenis-gsap] Footer-code loader, its frame moved onto `gsap.ticker` so the cursor and Lenis share one clock. Skip it in Webflow's editing surfaces with a `wf-design-mode` guard, as [site:a24-raviklaassens] guards its engine.
- Reduced motion: the lag goes and both parts snap to the pointer; there is nothing to configure.

Seen in: `[site:leo-parpeix]`, `[site:the-line]`, `[site:why-zero]`.
