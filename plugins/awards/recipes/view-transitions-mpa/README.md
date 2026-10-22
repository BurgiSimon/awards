# view-transitions-mpa

Page transitions between real documents with the browser's View Transitions API and no router. An index of three works and one static page per work: click a tile and its picture and name travel into the next page's hero while the rest of the page slides on; go back and they return to the tile. Every page loads in full, so the address bar, history, reload and open-in-new-tab stay the browser's own.

The recipe ships four pages (the index and one per work) rather than a single detail template filled by script: the hero has to be in the HTML before the new page's first frame, which is when the transition captures it.

## Why
- **The corpus moves between routes with this API.** Route changes on Astro's `ClientRouter`, with the canvas, cursor and header persisted so they never re-mount [site:mont-fort]; `next-view-transitions` in a Next App Router [site:pensatori-irrazionali]; a hand-written tile → hero shared-element morph [site:zainabkabira]; `::view-transition-*` rules switched off under reduced motion [site:shopify-editions-w26]. The pages here use the cross-document form, where each URL is a static document and the opt-in is one CSS rule (`[pattern:preloaders-and-transitions#route-transition-mechanics]`).
- **Name only the chosen tile.** A `view-transition-name` repeated within one snapshot aborts the transition, so no tile carries a name at rest. `pageswap` (the page being left) names the destination's tile; `pagereveal` (the page arriving) names the tile being returned to and clears it once captured (`ready`), so a page restored from the back/forward cache has no stale names. The detail hero keeps its two names in CSS, since there is only one hero per page.
- **The opt-in is inline in the head.** `@view-transition { navigation: auto; }` sits in a `<style>` ahead of every external file. In this recipe's own verification runs (headless Chromium 141) an opt-in that lived only in the bundled stylesheet skipped the transition on about half the navigations; inline, every one ran.
- **The events need a classic head script.** `pagereveal` fires before the new page's first frame, which a deferred module can miss, and Vite drops `blocking="render"` from the module tag. The same inline block sits on every page (a layout partial on a real site). `<link rel="expect" href="#hero" blocking="render">` holds the first frame until the hero (on the index, the list) is parsed.
- **Direction is a transition type.** `pagereveal` compares the page order (`index`, then each work) and adds `forward` or `back` to `viewTransition.types`; `:active-view-transition-type(back)` mirrors the slide. History traversal gets the right direction for free.
- **Choose the router recipes when the exit must be authored.** Once `pageswap` returns, the old page is a picture; nothing can play on it. A rise, a stagger or a wipe that has to finish before the URL changes belongs in `[recipe:transition-promote-chosen]` or `[recipe:page-transitions]`.

## Parameters
| | value |
|---|---|
| opt-in | `@view-transition { navigation: auto; }` inside `(prefers-reduced-motion: no-preference)`, inline in each head |
| shared names | `media`, `title` (one tile at a time); `bar` held still with `animation: none` |
| morph (picture and name) | `.7 s`, `--ease-in-out-expo`; snapshots `height: 100%; object-fit: cover; overflow: clip` so a square tile crops into a wide hero instead of stretching or spilling past the moving box |
| page body (`root`) | out `.4 s` `--ease-in-out-expo`, in `.6 s` `--ease-out-expo` after `.12 s`; travel `6 %` along the reading direction |
| direction | `forward` / `back` type from the page order, mirrored by `:active-view-transition-type(back)` |
| first frame | `<link rel="expect" blocking="render">` on `#hero` (detail) and `#works` (index) |

The page is a still picture while a transition runs and input goes nowhere, so the whole move stays under `.75 s`.

## Accessibility
- Links are plain links with nothing intercepted, so modified clicks, middle clicks and Enter behave as everywhere else.
- After a navigation inside the recipe, focus lands on the new page's `h1` (`tabindex="-1"`, a reading start point, so it draws no ring); a direct visit or a reload leaves focus alone; a page restored from the back/forward cache re-runs the same step on `pageshow` (`[pattern:accessibility-and-reduced-motion#overlays-and-focus]`).
- Each page has its own `<title>`, one `h1`, a skip link that shows on focus, and the drawn pictures are `aria-hidden`; the work's name is the link text.

## Reduced motion
The opt-in sits inside the motion query, so under `prefers-reduced-motion: reduce` neither page opts in: no transition object exists, the browser navigates as it would without the API, and focus still moves. A forced `data-motion="reduced"` or `"static"` on `<html>` (`_shared/reduced-motion.js`) calls `skipTransition()` from both events.

## Without the API
Feature-checked, never polyfilled: `main.js` reads `CSSViewTransitionRule` and `document.startViewTransition`, records them in `state().api` and sets `data-vt="on|off"` on `<html>`. A browser without cross-document support ignores the at-rule, never fires the two events and navigates normally; nothing waits on a transition that will not come.

## Adapters
- **React / Next:** in the App Router use `next-view-transitions` (`Link`, `useTransitionRouter`) or React's `<ViewTransition>`; the same `::view-transition-*` CSS applies, and the name goes on the clicked card in its `onClick` (`references/stacks/next-view-transitions-0.3.md`, `references/stacks/next.md`).
- **Vue / Nuxt:** `experimental.viewTransition: true` wraps route changes in `document.startViewTransition` and respects reduced motion; set the clicked card's name in the click handler and clear it in `onMounted` of the next page (`references/stacks/nuxt.md`).
- **Svelte:** `onNavigate` with `document.startViewTransition` in the root layout; names and CSS as here (`references/stacks/sveltekit.md`).
- **Astro:** static output can ship these pages unchanged (cross-document, no client router). With `<ClientRouter />`, swap the head script for `transition:name` on the tile and hero and run page setup on `astro:page-load` (`references/stacks/astro.md`).

Synthetic content: the three works, their descriptions and figures are invented for the demo.

Seen in: `[site:mont-fort]`, `[site:pensatori-irrazionali]`, `[site:zainabkabira]`, `[site:shopify-editions-w26]`.
