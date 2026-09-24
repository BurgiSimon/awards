# Highway 2.2

<!-- Labels: [verified: src <file>] = the published `@dogstudio/highway@2.2.1` tarball (`npm pack`: package.json, README.md, `src/highway.js`, `core.js`, `renderer.js`, `transition.js`, `helpers.js`), 2026-09 · [verified: npm] = `npm view @dogstudio/highway` metadata, 2026-09 · [verified: taxi README] = `@unseenco/taxi@1.9.1` in `recipes/node_modules` · [inferred: src] = a consequence of that source's order, not documented · [recalled] · [unverified]. Context7 has no entry for this package (the `highway` matches are Google's SIMD library and others), so nothing here comes from the docs site. Version from `npm view @dogstudio/highway version` → 2.2.1 (dist-tag `latest`, published 2020-04-21; `beta` points at 2.1.0-beta; registry last modified 2022-04-05). -->

## What it is for in this skill set
Reading, not choosing. Highway is Dogstudio's PJAX router: it intercepts same-origin links, fetches the next page, appends its `[data-router-view]` into the persistent `[data-router-wrapper]`, pushes history, sets `document.title`, and runs a `Renderer` (per-view lifecycle) and a `Transition` (the animation) around the swap [verified: src core.js, renderer.js]. It is the ancestor of the corpus's transition vocabulary: taxi was written as "a drop-in replacement for Highway.js which is sadly no longer maintained" and keeps its class shape and event names [verified: taxi README]. Use this note to read an existing Highway site, a Highway-shaped in-house router ([site:okaydev]) or to port one to taxi. For new multi-page builds use taxi (`taxi-1.9.md`, [recipe:page-transitions]) or Barba (`barba-2.10.md`); framework routers (Next, Nuxt, SvelteKit, Astro View Transitions) own this job and take neither. Route-change rules sit in [pattern:preloaders-and-transitions#route-transition-mechanics].

## Install (pinned)
Not in `recipes/package.json` or `versions.md`: no recipe uses it. When maintaining a site that does:
```sh
npm i @dogstudio/highway@2.2.1
```
```js
import Highway from '@dogstudio/highway';   // default export is a plain object { Core, Helpers, Renderer, Transition } [verified: src highway.js]
const { Core, Renderer, Transition } = Highway;
```
- One runtime dependency, `tiny-emitter ^2.1.0`, behind `on` / `off` / `emit` [verified: src package.json, core.js]. Licence MIT [verified: src package.json].
- Builds: `main` `build/highway.js`, `module` `build/highway.module.js`, `umd:main` / `unpkg` `build/highway.min.js`; no `exports` field [verified: src package.json].
- Importing it logs `Highway v2.2.0` to the console, even from 2.2.1 [verified: src highway.js]. A shipped site with that line in its console is running Highway itself.

## The API surface we use
Markup [verified: src core.js, renderer.js, helpers.js]:
```html
<main data-router-wrapper>                 <!-- persistent; queried per Renderer instance -->
  <div data-router-view="work">…swapped per page…</div>
</main>
```
| Attribute | Where | Effect |
|---|---|---|
| `data-router-wrapper` | wrapper | the container new views are appended to (`insertAdjacentHTML('beforeend', …)`) [verified: src renderer.js] |
| `data-router-view="slug"` | the view | the slug picks the renderer and the transition; unknown slugs fall back to the base `Renderer` and `transitions.default` [verified: src helpers.js] |
| `data-router-disabled` | a link | excluded from interception; so is any link with a `target` attribute (selector `a:not([target]):not([data-router-disabled])`) [verified: src core.js] |
| `data-transition="name"` | a link | a contextual transition for that click, looked up in `transitions.contextual[name]` [verified: src core.js `navigate`] |
| `data-transition-in` / `data-transition-out` | set by Highway on the views | the transition name, for CSS hooks [verified: src transition.js] |

`Core` [verified: src core.js]:
```js
const H = new Highway.Core({
  renderers: { home: Home, work: () => import('./work-renderer.js') },   // class, a thunk returning import(), or a promise; lazy ones use `default` [verified: src helpers.js getRenderer]
  transitions: { default: Wipe, work: Slide, contextual: { zoom: Zoom } },
});
H.on('NAVIGATE_OUT', ({ from, trigger, location }) => {});
H.on('NAVIGATE_IN',  ({ to, trigger, location }) => {});
H.on('NAVIGATE_END', ({ to, from, trigger, location }) => {});
H.redirect('/about', 'zoom');   // (href, contextualName = false, trigger = 'script')
H.attach(nodeList); H.detach(nodeList);   // bind or unbind click interception on links added later
```
- Events are tiny-emitter events on the `Core` instance, not DOM events [verified: src core.js].
  - `NAVIGATE_OUT` fires after `pushState`, before the old view's `hide`.
  - `NAVIGATE_IN` fires after the new view is appended and before its `show`.
  - `NAVIGATE_END` fires after `show` resolves and the links are rebound.
- `to` and `from` are `{ page, view }`; `page` is a parsed `Document`, `trigger` is the clicked element, `'script'` or `'popstate'`, and `location` is `{ href, anchor, origin, params, pathname }` [verified: src core.js, helpers.js getLocation].
- Order per navigation: `pushState` → `NAVIGATE_OUT` → `From.hide()`, run alongside the fetch unless the URL is cached → `To.add()` → `NAVIGATE_IN` → `To.show()` → rebind links → `NAVIGATE_END` [verified: src core.js beforeFetch, afterFetch].
- The fetch sends `X-Requested-With: Highway`; a non-2xx status becomes a hard navigation [verified: src core.js fetch].

`Renderer`: subclass it and define any of four hooks [verified: src renderer.js]:
| Hook | When |
|---|---|
| `onEnter()` | first load (via `setup()`), and each time this view is appended, before its transition's `in` |
| `onEnterCompleted()` | after the `in` transition resolves; on first load, right after `onEnter` |
| `onLeave()` | before the `out` transition |
| `onLeaveCompleted()` | after the `out` transition resolves |
Instance fields: `this.wrap` (the live wrapper) and `this.properties` (`{ page, view, slug, renderer, transition }`) [verified: src renderer.js, helpers.js getProperties]. `update()` only sets `document.title`; override it for meta tags, `lang` or body classes.

`Transition`: subclass it and define `in` and `out`; each must call `done` [verified: src transition.js]:
```js
class Wipe extends Highway.Transition {
  out({ from, trigger, done }) { gsap.to(from, { opacity: 0, duration: 0.4, onComplete: done }); }
  in({ from, to, trigger, done }) {
    from.remove();                                    // Highway never removes the old view [verified: src; taxi README "no need to manually call from.remove()"]
    gsap.from(to, { opacity: 0, duration: 0.4, onComplete: done });
  }
}
```
While `in` runs, both views are mounted (`from` is `wrap.firstElementChild`, `to` is `wrap.lastElementChild`). This is the "overlapping transitions" feature of 2.1 [verified: src transition.js; README 2.1.x]. A crossfade needs no option: position `from` absolutely, animate both, then remove it.

The leaving view's own transition plays `out`, and the entering view's plays `in`, because each `Renderer` builds its transition from its own slug [inferred: src renderer.js constructor]. A contextual transition overrides both for that click only; back and forward buttons never use one [verified: src core.js popState].

## Lenis, scroll and focus hand-off
Highway does none of it [verified: src: no scroll, focus or `scrollRestoration` code]. Do the reset inside `in`, after `from.remove()` and before the reveal: `lenis.scrollTo(0, { immediate: true })`, then `ScrollTrigger.refresh()` in `onEnterCompleted`. Set `history.scrollRestoration = 'manual'` at boot and restore saved positions yourself when `trigger === 'popstate'`. Move focus to the new view's heading and announce the title on `NAVIGATE_END`. Under `prefers-reduced-motion`, call `done()` at once from both `out` and `in`. The same wiring is in [recipe:page-transitions] and `lenis-1.3.md`.

## Pitfalls
- **The old view stays in the DOM** until your `in` removes it. Forget it and views pile up in the wrapper, and `firstElementChild` is wrong on the next navigation [verified: src renderer.js add, transition.js].
- **`this.properties.view` is never the live node.** On first load it comes from `document.cloneNode(true)`, and later it is the `DOMParser` node whose `outerHTML` was inserted. The same goes for `from.view` in `NAVIGATE_OUT` and `NAVIGATE_END`. Query `this.wrap.lastElementChild` or use the `to.view` of `NAVIGATE_IN` / `NAVIGATE_END`, which is live [inferred: src core.js, renderer.js].
- **The cache has no expiry.** Every fetched page and the first page are stored in `H.cache` (a `Map` keyed by `href`), and nothing clears them, so forms, carts and CMS previews go stale. There is no `nocache` attribute; call `H.cache.delete(href)` yourself [verified: src core.js; the workaround is inferred].
- **Scripts in the fetched view do not run**, because `insertAdjacentHTML` does not execute `<script>` [inferred: src renderer.js add + HTML parsing rules]. Page code belongs in renderers. Taxi's `reloadJsFilter` is the upgrade path.
- **Only `document.title` updates.** Meta, canonical, `lang`, `<body>` classes and `<head>` styles stay from the first page [verified: src renderer.js update].
- **A back press during a transition is not guarded.** Link clicks are dropped silently while `running`, but `popState` has no such check and starts a second navigation over the first [inferred: src core.js redirect vs popState].
- **A network error kills the router.** `fetch` rejects with no `catch`, `running` stays `true`, and every later link click is ignored until reload [inferred: src core.js beforeFetch].
- **Link handling is coarse.**
  - Only Cmd and Ctrl clicks pass through. Shift-click, and links with `download`, `mailto:` or `tel:`, are intercepted or sent through `window.location.href` [verified: src core.js navigate, redirect].
  - A same-page `#hash` link is sent through `window.location.href`, which scrolls natively. A link to another page with a hash is fetched over PJAX and never scrolls to the anchor [verified: src core.js redirect; the scroll behaviour is inferred].
  - Links added after `NAVIGATE_END` (htmx swaps, infinite lists) are not intercepted until you call `H.attach()` on them [verified: src core.js].
- **Contextual transitions run on the prototype.** Highway calls `Transitions.contextual[name].prototype.in(...)`, so `this.wrap` and `this.name` are not set inside them, and an unknown name throws [inferred: src core.js redirect, transition.js].
- **Maintenance.** The last release is 2.2.1 of 2020-04-21. The registry keeps a 2.2.2 timestamp (2021-03-30) that is missing from `versions`, so that release was unpublished [verified: npm]. Taxi's README calls Highway "no longer maintained" [verified: taxi README]. Whether the GitHub repo is archived was not checked in this pass [unverified]. Do not start new work on it.

## Highway vs taxi vs Barba
| | Highway 2.2.1 | taxi 1.9.1 (`taxi-1.9.md`) | Barba 2.10.3 (`barba-2.10.md`) |
|---|---|---|---|
| Status | unmaintained since 2020 [verified: npm; taxi README] | maintained; the default here [recipe:page-transitions] | maintained; the alternative |
| Markup | `data-router-wrapper`, `data-router-view`, `data-router-disabled` | `data-taxi`, `data-taxi-view`, `data-taxi-ignore` (a one-to-one rename) [verified: taxi README] | `data-barba="wrapper"` / `"container"`, `data-barba-namespace`, `data-barba-prevent` |
| Shape | `Renderer` class per slug, and a `Transition` class with `in` / `out` | the same classes, with `onLeave` / `onEnter` on transitions and an `initialLoad` hook on renderers [verified: taxi README] | object-literal transitions matched by `from` / `to` rules, plus global hooks |
| Link binding | per-link listeners; `attach` / `detach` after DOM changes | delegation; no attach needed [verified: taxi README] | delegation |
| Old view | stays until you remove it in `in` | removed automatically (`removeOldContent`) | kept until `after`; `sync: true` crossfades |
| Routing | slug only | URL-based routes [verified: taxi README] | namespace, route or custom rules |
| Cache and prefetch | cache forever, no prefetch | cache control and `preload()` [verified: taxi README] | `@barba/prefetch` plugin |
| Page scripts | not run | can run the new page's scripts [verified: taxi README] | not run |
| Events | `NAVIGATE_OUT`, `NAVIGATE_IN`, `NAVIGATE_END` | the same three names | `before` … `after` hooks |
| API name | `redirect(href, contextual)` | `navigateTo(href, transition)` [verified: taxi README] | `barba.go(href)` |

Porting a Highway site to taxi means renaming the attributes, `redirect` to `navigateTo`, and `in` / `out` to `onEnter` / `onLeave`; then delete the `from.remove()` calls, the `attach` / `detach` calls and the per-page title code. The event handlers mostly carry over, apart from their payloads [verified: taxi README "The params passed to renderers, transitions, and events are now a little different"].

## Where the corpus used it
- [site:okaydev]: a **Highway-style** PJAX router with `data-router-wrapper`, `data-router-view`, `data-router-disabled`, a `NAVIGATE_IN` event, `onEnterCompleted` and per-route renderer chunks, on Craft CMS with a Vite build and htmx 2.0.7 + Sprig partials [verified on the card]. The card does not attribute it to `@dogstudio/highway`. It dispatches `CustomEvent`s, and Highway emits tiny-emitter events on the `Core` instance, which points to an in-house port on `EventTarget` [inferred on the card; the Highway side is verified: src core.js]. Treat it as Highway's vocabulary, not as Highway.
- [site:lama-lama]: the 2021 Site of the Day entry, judged at the old `lamalama.nl`, carries an Awwwards `Highway.js` tag [verified on the card, Awwwards entry]. The current `lamalama.com` build runs **Swup** with `data-swup-morph` instead [verified on the card]. That is historical evidence only; nothing of the Highway build is on the card.
- No other corpus card names Highway. Taxi appears on [site:lando-norris], [site:noth], [site:siena] and [site:trevor-noah] (see `taxi-1.9.md`).
