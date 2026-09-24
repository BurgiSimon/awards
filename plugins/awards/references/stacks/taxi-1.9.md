# Taxi 1.9

<!-- Labels: [verified: docs/<page>] = taxi.js.org documentation read through Context7 (`/craftedbygc/taxi`: how-to-use, renderers, transitions, navigation-lifecycle, routing, api-events, reloading-js, reloading-css), 2026-09 · [verified: src <file>] = the published `@unseenco/taxi@1.9.1` in `recipes/node_modules/@unseenco/taxi/src/*.js` (package `main` is `src/taxi.js`), 2026-09 · [inferred: src] = a consequence of that source's order, not documented · [recalled] · [unverified]. Version from `npm view @unseenco/taxi version` → 1.9.1 (dist-tag `latest`; registry last modified 2025-11-01), the same as `versions.md` and `recipes/package.json`. -->

## What it is for in this skill set
The default transition router for multi-page sites that ship one server-rendered HTML file per URL: a Vite multi-page build, a Webflow shell with an injected engine, a hand-written or CMS-templated site. It intercepts same-origin links, fetches the next page, swaps the `[data-taxi-view]` element inside the persistent `[data-taxi]` wrapper, updates history and `document.title`, and runs a `Renderer` (per-page lifecycle) and a `Transition` (the animation) around the swap [verified: src Core.js, Renderer.js]. It exists so the engine (one Lenis, one GSAP ticker, one WebGL renderer) survives route changes and the transition can be the money moment [recipe:page-transitions]. Framework routers (Next, Nuxt, SvelteKit, Astro View Transitions) own this job; do not add taxi there. The alternative is Barba (`barba-2.10.md`): pick it when the site already runs it, when a crossfade needs both pages mounted by default, or when many route pairs need their own rules. Wiring and route-change rules sit in [pattern:preloaders-and-transitions#route-transition-mechanics].

## Install (pinned)
```sh
npm i @unseenco/taxi@1.9.1
```
```js
import { Core, Renderer, Transition } from '@unseenco/taxi';   // named exports only [verified: src taxi.js]
```
- One runtime dependency, `@unseenco/e ^2.3.0`, the event and delegation helper behind `taxi.on` / `off` [verified: package.json, src Core.js]. Licence BSD-3-Clause [verified: package.json].
- Builds in `dist/`: `taxi.js`, `taxi.esm.js`, `taxi.modern.js`, `taxi.umd.js` (the one a script tag loads) [verified: package contents]. The installed `package.json` points `main` at `src/taxi.js` and has no `module` or `exports` field, so bundlers compile the ES source [verified: package.json].

## The API surface we use
Markup [verified: docs/how-to-use, docs/renderers; src Core.js]:
```html
<main data-taxi>                       <!-- persistent wrapper; its only child is the view -->
  <article data-taxi-view="work">…swapped per page…</article>
</main>
```
| Attribute | Where | Effect |
|---|---|---|
| `data-taxi` | wrapper | the container taxi appends to and removes from; found once, at construction [verified: src Core.js] |
| `data-taxi-view="name"` | the view, the wrapper's only child | names the `Renderer`; empty uses `renderers.default` [verified: docs/renderers; src Core.js `createCacheEntry`] |
| `data-taxi-ignore` | a link | excluded by the default `links` selector: hard navigation [verified: docs/how-to-use] |
| `data-transition="name"` | a link | explicit transition for that click (not `data-taxi-transition`) [verified: docs/transitions; src Core.js `onClick`] |
| `data-taxi-nocache` | the view | that URL is refetched on every visit [verified: docs/how-to-use; src Core.js] |
| `data-taxi-reload` | a `<script>` | re-run or appended on navigation by the default `reloadJsFilter` [verified: docs/reloading-js; src Core.js] |

`new Core(options)` [verified: src Core.js defaults; docs/how-to-use]:
| Option | Default | Use |
|---|---|---|
| `links` | `'a[href]:not([target]):not([href^=\\#]):not([data-taxi-ignore])'` | delegated click selector. The docs print it without `[href]`; the source has it. Extend with `:not([download])` (below) |
| `removeOldContent` | `true` | remove the old view as soon as `Transition.onLeave` calls `done()` (timing below) |
| `allowInterruption` | `false` | block a second navigation while one runs; keep it |
| `bypassCache` | `false` | `true` refetches every page; prefer `data-taxi-nocache` per page |
| `enablePrefetch` | `true` | preloads a link on `mouseenter` and `focus` [verified: src Core.js `attachEvents`] |
| `renderers` | `{ default: Renderer }` | map from `data-taxi-view` values to `Renderer` classes |
| `transitions` | `{ default: Transition }` | map from names to `Transition` classes |
| `reloadJsFilter` | `(el) => el.dataset.taxiReload !== undefined` | which scripts of the fetched page run; `false` disables |
| `reloadCssFilter` | `(el) => true` | which stylesheets and `<style>` tags are carried over; `false` disables [verified: docs/reloading-css] |

`Renderer`: one class per view type, the place to build and tear down page code [verified: docs/renderers; src Renderer.js]:
- `onEnter()` runs after the new view is in the wrapper, before the transition's `onEnter`; `onEnterCompleted()` after it calls `done()`.
- `onLeave()` runs before the transition's `onLeave`; `onLeaveCompleted()` after it calls `done()` (and after removal, by default).
- Props: `this.content` (the live `data-taxi-view` element), `this.page` (the parsed document), `this.title`, `this.wrapper`.
- On the first hard load, the constructor of `Core` calls `onEnter()` then `onEnterCompleted()` synchronously for the current page, with no transition [verified: src Core.js, Renderer.js `initialLoad`].

`Transition`: the animation, one fresh instance per navigation [verified: src Core.js `navigateTo`; docs/transitions]:
- `onLeave({ from, trigger, done })` and `onEnter({ to, trigger, done })`; nothing advances until `done()` is called. `this.wrapper` is available.
- `trigger` is the clicked `<a>` element, `'popstate'` for back and forward (no direction is given), or the third argument of `navigateTo` (default `false`) [verified: src Core.js].
- Chosen in this order: the link's `data-transition`, then a route from `addRoute`, then `transitions.default` [verified: docs/transitions; src Core.js `chooseTransition`]. Back and forward never see `data-transition` [verified: docs/transitions].

Instance methods [verified: src Core.js; docs/api-events unless noted]:
- `taxi.navigateTo(url, transition?, trigger?)` → promise; rejects with "A transition is currently in progress" when interruption is off and one runs. The third argument is in the source, not the docs.
- `taxi.addRoute(fromRegex, toRegex, transitionName)`: patterns are wrapped in `^…$` and matched against the pathname with trailing slashes stripped, so the homepage is `''`, not `'/'` [verified: docs/routing; src helpers.js `processUrl`].
- `taxi.preload(url, preloadAssets?)`, `taxi.updateCache(url?)`, `taxi.clearCache(url?)`, `taxi.setDefaultRenderer(name)`, `taxi.setDefaultTransition(name)`.
- `taxi.on(event, cb)` / `taxi.off(event, cb?)` with `NAVIGATE_OUT` `{ from, trigger }`, `NAVIGATE_IN` `{ from, to, trigger }`, `NAVIGATE_END` `{ from, to, trigger }` [verified: docs/api-events; src Core.js]. `from` / `to` are cache entries `{ page, content, finalUrl, skipCache, scripts, styles, title, renderer }`: `to.content` is the node in the *parsed* document; the live view is `to.renderer.content` [verified: src Core.js `createCacheEntry`, Renderer.js `update`].
- There is no `destroy()` [verified: src Core.js]. One `Core` per hard load.

Order inside one navigation [verified: src Core.js `navigateTo`, `beforeFetch`, `afterFetch`; Renderer.js]:
1. Click → the fetch starts (or a cached entry is prepared), so the leave animation runs in parallel with the network.
2. `NAVIGATE_OUT` → old `Renderer.onLeave` → `Transition.onLeave`.
3. On `done()`: old view removed (when `removeOldContent`) → old `Renderer.onLeaveCompleted` → `history.pushState` (skipped on popstate).
4. Await the fetch → `document.title` set → new view appended → `NAVIGATE_IN` → scripts and styles reloaded → `replaceState` if the fetch was redirected.
5. New `Renderer.onEnter` → `Transition.onEnter` → on `done()`: `Renderer.onEnterCompleted` → `NAVIGATE_END` → navigation unlocked.

The docs' lifecycle page lists the same steps with the removal inside step 3 [verified: docs/navigation-lifecycle].

What taxi does not do [verified: src, no `scrollTo`, `scrollRestoration`, `.focus(`, `matchMedia` or `aria` anywhere in `src/*.js`]: reset or restore scroll, move focus, announce the new page, or honour reduced motion.

## allowInterruption
`false` (default): `navigateTo` rejects while a navigation runs, link clicks log the rejection as a warning, and a back or forward press mid-transition is undone by pushing the in-flight URL back onto history [verified: src Core.js `onClick`, `onPopstate`]. Programmatic calls need their own `.catch()`.
`true`: a second navigation starts beside the first; nothing cancels the first chain. Both promise chains keep running, `Renderer.remove()` deletes `wrapper.firstElementChild` whichever view that is, and the first to finish clears `isTransitioning` [inferred: src Core.js, Renderer.js]. Leave it off; if a transition feels too long to wait for, shorten it.

## removeOldContent timing
- `true` (default): the old view is removed the moment `onLeave` calls `done()`, **before** the fetch is awaited and the new view appended [verified: src Renderer.js `leave`, Core.js]. On a slow response the wrapper is empty for the wait: the document collapses to the chrome, the browser clamps scroll, and anything measured then (Lenis limit, ScrollTrigger) is wrong. Cover the page before `done()` (the wipe in [recipe:page-transitions]) and measure only in `onEnter` [inferred: src order].
- `false`: the old view stays and the new one is appended after it, so both are mounted during `Transition.onEnter`: a crossfade or shared-element move is possible. `onEnter` receives only `to`, so keep `from` on the instance in `onLeave` (one instance per navigation) and remove it yourself before `done()`, or views accumulate [inferred: src Core.js, Renderer.js]. While both are mounted the document is double height and has two view roots: position the old one `absolute` / `inert`, and refresh ScrollTrigger only after removal.
```js
class Crossfade extends Transition {
  onLeave({ from, done }) { this.from = from; done(); }                 // with new Core({ removeOldContent: false })
  onEnter({ to, done }) {
    gsap.set(this.from, { position: 'absolute', inset: 0 }); this.from.inert = true;
    gsap.timeline({ onComplete: () => { this.from.remove(); done(); } })
      .to(this.from, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 0)
      .from(to, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 0);
  }
}
```
[unverified: the snippet is a pattern from the source order, not from the docs]

## Lenis hand-off, focus and scroll restoration
One root Lenis for the whole visit; the page's motion lives in a `gsap.context` per view:
```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Core, Renderer, Transition } from '@unseenco/taxi';

gsap.registerPlugin(ScrollTrigger);
history.scrollRestoration = 'manual';        // taxi restores nothing [verified: src]; the browser's own restore fires on popstate, against the old view [recalled]
const lenis = new Lenis({ autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;                         // awards-hook and capture drive it

const saved = new Map();                      // href → y, for back / forward
let ctx = null;

class Page extends Renderer {
  onEnter() { ctx = gsap.context(() => { /* page motion */ }, this.content); }
  onLeave() { ctx?.revert(); ctx = null; }   // while the view is still in the DOM
}
class Curtain extends Transition {
  onLeave({ done }) { /* cover */ done(); }
  onEnter({ trigger, done }) {
    const y = trigger === 'popstate' ? saved.get(location.href) ?? 0 : 0;
    lenis.resize();
    lenis.scrollTo(y, { immediate: true, force: true });
    ScrollTrigger.refresh();
    /* uncover */ done();
  }
}

// Build the Core before any DOM mutation (SplitText, inline styles): it caches the first page at construction.
const taxi = new Core({ renderers: { default: Page }, transitions: { default: Curtain } });
taxi.on('NAVIGATE_OUT', () => { saved.set(location.href, lenis.scroll); lenis.stop(); });   // URL not yet pushed
taxi.on('NAVIGATE_END', ({ to }) => {
  lenis.start();
  to.renderer.content.querySelector('h1')?.focus({ preventScroll: true });   // h1 carries tabindex="-1"
});
```
- Order facts it relies on: `NAVIGATE_OUT` fires before `pushState`, so `location.href` is still the old URL; on popstate the browser has already changed `location` before `Transition.onEnter` [verified: src Core.js]. Key the map by `location.href`: taxi keys its own cache by href without the hash [verified: src helpers.js].
- `stop()`, `start()`, `resize()` and `scrollTo(…, { force: true })` are Lenis 1.3 API (see `lenis-1.3.md`). Stopping during the leave keeps a wheel from moving the page under the curtain; drop it if the design lets the user scroll through the transition.
- `document.title` is updated for you [verified: src Renderer.js `update`]; nothing is announced. Focus the new `<h1>` (or `<main>` with `tabindex="-1"`) and, where the title change must be spoken, mirror it into a polite live region [recalled].
- The clicked link was inside the removed view, so without the focus move keyboard focus falls back to `<body>` [recalled: browser behaviour on removing the focused node].

## How the recipes use it
- [recipe:page-transitions]: two HTML pages on one module (`window.__loads` proves it never runs twice). `PageRenderer.onEnter` opens a `gsap.context` on `this.content` for the line reveals and calls `ScrollTrigger.refresh()`; `onLeave` reverts it. The `Wipe` transition covers the view in `onLeave` (`yPercent 100 → 0`, `.7 s`, `expo.inOut`, `done` on complete) and in `onEnter` resets scroll with `lenis.scrollTo(0, { immediate: true, force: true })` plus `window.scrollTo(0, 0)`, then wipes out. The wipe lives outside `[data-taxi]`. Reduced and static tiers `gsap.set` and call `done()` at once. `NAVIGATE_END` focuses the header's primary link, which the renderer retargets per view because chrome outside the wrapper is not swapped. `allowInterruption: false` is spelled out; the recipe link out of the demo is `data-taxi-ignore`.
- [recipe:transition-promote-chosen]: no Lenis. `onLeave` reads `trigger` (the clicked element) to find the chosen row, lifts it into the slot where the next page's heading sits while siblings fade by distance, and calls `done()` only at the end of the timeline, so taxi pushes the route after the rise. A `'popstate'` or non-element trigger falls back to a plain fade. `onEnter` kills that timeline, `window.scrollTo(0, 0)`, fades `to` in and calls `done()` at once. The renderer fills `case.html?p=N` from `location.search` in `onEnter`, which works because `pushState` has already run; it then overrides `document.title`. `NAVIGATE_END` focuses `[data-focus]`. Modified clicks fall through to a new tab.

## Pitfalls
- `links` matches same-origin `download` links and files: taxi fetches them, finds no `[data-taxi-view]` and falls back to a hard navigation [inferred: src Core.js `createCacheEntry` throws, the fetch `.catch` sets `location.href`]. Add `:not([download])` and put `data-taxi-ignore` on file links.
- Only Ctrl and Cmd clicks are passed through; a Shift-click is still intercepted [verified: src Core.js `onClick`].
- A `data-taxi-view` value with no registered renderer logs a warning and then fails to construct, which ends in the same hard navigation [verified: warning in src Core.js; inferred: the fallback].
- Renderers are instantiated per cache entry, not per visit: a second visit to a cached URL reuses the instance, fields and all [verified: src Core.js `createCacheEntry`]. Keep per-visit state in `onEnter`, not the constructor.
- The first page is cached as `document.cloneNode(true)` when `Core` is constructed [verified: src Core.js]. Mutate the DOM before that (SplitText, a moved canvas) and a later back navigation re-renders the mutated markup. Construct first, or call `taxi.updateCache()`.
- `preload()` catches its own errors and always resolves, so the docs' `.catch()` example never fires [verified: src Core.js `preload`; docs/api-events].
- A non-2xx response or a network error navigates the browser to the URL [verified: src Core.js `fetch`]: a transition that silently becomes a full load usually means a 404 or a missing view.
- `reloadCssFilter` defaults to every stylesheet: new `<link>`s are appended to `<body>`, differing `<style>` tags are appended, nothing is ever removed [verified: src Core.js `loadStyles`]. Page-specific inline styles pile up over a visit; set a filter or `false`.
- Scripts re-run only with `data-taxi-reload` [verified: docs/reloading-js]. Re-inserting a `type="module"` script with the same `src` does not execute it again [recalled: module map], which is why the engine module runs once per hard load. Webflow interactions and embeds need an explicit re-init in a renderer or on `NAVIGATE_END` [site:noth].
- `addRoute('/', …)` never matches the homepage (its pathname is `''`), and `findMatch` stops at the first matching `from` pattern even when none of its `to` patterns match [verified: src RouteStore.js, helpers.js].
- Reverting the page context in `Renderer.onLeave` snaps scrubbed and pinned states back before the leave animation; under a transparent transition that snap is visible. Cover first, or revert in `onLeaveCompleted` [inferred: src order].
- No reduced-motion branch: every `onLeave` / `onEnter` must `gsap.set` and call `done()` at once under the reduced tier (`recipes/_shared/reduced-motion.js`), as both recipes do.
- The view must be the wrapper's only element child: taxi removes `firstElementChild` and reads the new view as `lastElementChild` [verified: docs/how-to-use; src Renderer.js]. Overlays, curtains and canvases live outside `[data-taxi]`.

## Where the corpus used it
- [site:lando-norris]: Taxi on a Webflow shell inside one esbuild bundle, fetching with `X-Requested-With: Taxi`, honouring `data-taxi-nocache` and `data-taxi-ignore`; a Rive `page-transition` state machine (`transition-out`, `transition-in`) draws the cover; GL scenes are destroyed and rebuilt per route; `history.scrollRestoration = "manual"` at boot. Taxi's version is [unknown] on the card.
- [site:noth]: taxi in an injected Vite engine on a Webflow shell; Lenis `scrollTo(0, { immediate: true })` and a full teardown and re-init list on `NAVIGATE_END`.
- [site:siena]: taxi in an injected bundle on a Webflow shell, a default renderer and transition; parameters [unknown].
- [site:trevor-noah]: Taxi inlined with Three.js, GSAP and Lenis in the engine chunk of a Webflow shell; how it is wired is not on the card [unknown].
