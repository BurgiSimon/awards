# dither-cell-transition

One curtain for the arrival and every route change: a fixed grid of cells that grow from hairlines into solid bars, swept from the far corner, so the page seems to weave shut, change behind the weave, and weave open again. On a site whose pictures are woven (`[recipe:gl-video-dither-layers]`), the transition speaks the same language without a WebGL context.

The routes, copy and the one drawn plate are synthetic demo content; nothing is downloaded.

## Why
- **The identity, cheaply.** A woven page needs a transition in the same weave, and 240 transformed `<i>` elements cost nothing a GPU notices. `[site:son-daven]` covers every Barba route change with a grid of 20 × 12 cells scaling on X from `0` to `1`, staggered from the end across the grid, under a black overlay fading in, and keeps the scroll per path in `sessionStorage` for back and forward [verified, `slater-55210.js` and `webflow-shared.css`, 2026-10-28] (`[pattern:preloaders-and-transitions]`).
- **A gate with a ceiling.** An arrival that waits for every load is only as fast as the slowest request. Son Daven's gate, on the first visit and the repeat path alike, is `Promise.all` over every scene's media, the fonts and, from 992 px, 120 hero frames, with no ceiling; on 2026-10-28, from this container, 17 of the frames were still pending after 40 s and the preloader never lifted [verified, live]. Here the gate is a race between the real loads and a 4 s ceiling, after a minimum hold so the curtain reads.
- **Swap only when shut.** Only the current page is in the document; the next one replaces it after the whole grid has closed, the way a transition library swaps containers, and the recipe measures it (`coveredAtSwap`).
- **A route change is a page change.** Focus moves to the new `h1` (`tabindex="-1"`), the title names the page, a polite live region announces it, and while the curtain is shown it blocks clicks and the page behind it is `inert`, so no Tab stop hides under the cells and no key press routes mid-sweep. The arrival sits on the same queue as the routes, so a route asked for while it is still shut waits for it to open. Back and forward restore the scroll the page was left at (the browser's own restore is off, `history.scrollRestoration = 'manual'`); a link opens the page at the top.

## Parameters
| | |
|---|---|
| Grid | `round(innerWidth / 72)` × `round(innerHeight / 75)`, at least 4 × 4; 20 × 12 at 1440 × 900, 5 × 11 at 390 × 844; rebuilt on resize while idle |
| Sweep | each cell `scaleX` 0 → 1 (cover) or 1 → 0 (uncover) in 0.4 s `power3.inOut`, staggered 0.02 s by grid distance from the bottom-right cell; about 0.8 s a half on a desktop grid |
| Seams | cells overlap by half a pixel (`margin: -0.5px`), so fractional widths never leave a hairline when shut |
| Gate | fonts plus every image's `decode()`; minimum hold 0.9 s first visit, 0.25 s repeat (`sessionStorage`); ceiling 4 s |
| Reduced motion | the curtain fades in 0.2 s; static: no fade |

These are this recipe's own values. Son Daven runs 0.4 s cells at 0.03 s steps with 1.2 s holds on each side of the swap, about 2.4 s a route.

## Tiers
- **Full:** the weave, both ways.
- **Reduced:** a 0.2 s fade of the shut grid; the swap, focus, title and scroll rules are unchanged.
- **Static:** an instant cover and uncover.
- **No script:** a `<noscript>` stylesheet removes the curtain and the home page reads; the other pages need the script here, where a real site has real URLs behind the same links.
- **Script that fails to load:** the curtain is shut by CSS from first paint and the 4 s ceiling only starts once the module runs, so a CSS failsafe hides the shut curtain 5 s after first paint if the module never marks it ready.

`window.__curtain.go(route)` drives a change; `state.coveredAtSwap`, `state.lastMs` and `state.gate` report what happened. A `dither-cell-transition:hang` key in `sessionStorage` adds a load that never answers, to prove the ceiling; a `dither-cell-transition:early` key holding a route asks for it while the arrival is still shut, to prove it queues.

## Accessibility
The curtain is `aria-hidden` and lasts under a second a half, and the page behind it is `inert` while it is up. The nav marks the current page with `aria-current="page"`; every target is at least 44 px tall. Focus never stays on a link that no longer exists. Only `#/…` hashes are routes: the skip link's `#main` stays an in-page target, and its history entry is rewritten to the current route, so a reload or back and forward never lands on another page.

## Adapters

### Webflow (with Barba, as Son Daven ships it)
- Designer: a fixed Div `curtain` with a grid child; let the module fill the cells, so the Designer never holds 240 elements.
- Barba: `leave` → save `scrollY` under the path, `await cover()`; `beforeEnter` → restore only when the navigation came from `popstate`; `enter` → `await uncover()`, then focus the new `h1` and re-init the page's scripts (Webflow's `Webflow.destroy()` / `ready()` / `ix2.init()`).
- Set `history.scrollRestoration = 'manual'` once, as here: left on `auto`, the browser restores its own saved offset on `popstate`, against the page being left, before the curtain has shut.

### Taxi or another router
The same two calls in the transition's `onLeave` and `onEnter`; see `[recipe:page-transitions]` for the renderer lifecycle.

Seen in: `[site:son-daven]` (the Barba transition named `dither`: a 20 × 12 grid of cells scaling on X, staggered from the end).
