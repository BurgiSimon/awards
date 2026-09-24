# Barba 2.10

<!-- Labels: [verified: docs/<page>] = barba.js.org documentation read through Context7 (`/websites/barba_js`), 2026-09 · [verified: src <file>] = the published `@barba/core@2.10.3` tarball (`npm pack`: package.json, the typings, and the `src/*.ts` carried in `dist/barba.mjs.map`), 2026-09 · [verified: taxi src] = `@unseenco/taxi@1.9.1` in `recipes/node_modules` · [recalled] · [unverified] · [inferred]. Version from `npm view @barba/core version` → 2.10.3 (dist-tag `latest`; `next` points at 2.9.7; registry last modified 2024-08-12). -->

## What it is for in this skill set
The alternative transition router for multi-page sites that keep one server-rendered HTML file per URL: Webflow exports and shells, hand-written or CMS-templated sites. It intercepts links, fetches the next page, appends its `data-barba="container"` into the persistent `data-barba="wrapper"`, updates history and `document.title`, and gives you promise-aware hooks around the swap [verified: docs/markup; src core.ts, Transitions.ts]. The default in this skill set is taxi [recipe:page-transitions]; reach for Barba when the studio already runs it, when transitions must be matched per from → to pair (namespace, route or a custom predicate) or when you want a true crossfade with both containers mounted (`sync: true`). Framework routers (Next, Nuxt, SvelteKit, Astro View Transitions) own this job; do not add Barba there. Wiring and route-change rules sit in [pattern:preloaders-and-transitions#route-transition-mechanics].

## Install (pinned)
```sh
npm i @barba/core@2.10.3
```
```js
import barba from '@barba/core';   // default export is the singleton Core instance [verified: src core.ts `const core = new Core(); export default core`]
```
- Builds: `main` `dist/barba.js`, `module` `dist/barba.mjs`, `unpkg`/`browser` `dist/barba.umd.js` (the one CDN script tags load) [verified: src package.json]. Runtime deps `is-promise ^4.0.0`, `path-to-regexp ^6.2.2` [verified: src package.json].
- A CDN script tag pins too: `https://cdn.jsdelivr.net/npm/@barba/core@2.10.3/dist/barba.umd.js`. Two corpus sites float the version (below).
- Plugins go through `barba.use(plugin, options)` before `init`: `@barba/prefetch` (`root`, `timeout`, `limit`) and `@barba/css` [verified: docs/plugins]. Their current versions were not checked in this pass [unverified].

## The API surface we use
Markup [verified: docs/markup; src schemas/attribute.ts]:
```html
<body data-barba="wrapper">
  <header>…persistent chrome…</header>
  <main data-barba="container" data-barba-namespace="work">…swapped per page…</main>
</body>
```
- `data-barba-namespace` names the page for transition rules and views.
- `data-barba-prevent` on a link skips it; `data-barba-prevent="all"` on an ancestor skips every link inside [verified: src Prevent.ts].
- Built-in prevents: no `pushState`, modifier or middle click, `target="_blank"`, other protocol, host or port, `download` [verified: src Prevent.ts]. Same-URL clicks are a separate check outside that suite [verified: src Prevent.ts].
- The attribute names can be overridden with the `schema` option [verified: docs/options].

`barba.init(options)` [verified: docs/options, defaults as documented]:
| Option | Default | Use |
|---|---|---|
| `transitions` | `[]` | transition objects (below) |
| `views` | `[]` | per-namespace setup and teardown |
| `prevent` | `null` | `({ el, event, href }) => boolean`, true skips the link [verified: src defs/prevent.d.ts] |
| `preventRunning` | `false` | `true` swallows clicks while a transition runs; set it |
| `timeout` | `2e3` | ms before Barba gives up on the fetch; heavy pages need more [verified: docs/recipes] |
| `requestError` | — | `(trigger, action, url, response) => boolean` for fetch failures [verified: src defs/request.d.ts] |
| `cacheIgnore`, `prefetchIgnore` | `false` | `true` or route list to disable cache or prefetch |
| `cacheFirstPage` | `false` | cache the first rendered page too |
| `debug`, `logLevel` | `false`, `'off'` | console tracing in development only |

Transition object [verified: src defs/transition.d.ts]: `name`, `from` / `to` rules `{ namespace, route, custom(data) }`, `sync`, `priority`, and the hooks `beforeOnce`, `once`, `afterOnce`, `before`, `beforeLeave`, `leave`, `afterLeave`, `beforeEnter`, `enter`, `afterEnter`, `after`. A hook holds the sequence when it returns a promise (a GSAP tween works: `return gsap.to(…)`), is `async`, or calls `const done = this.async()` [verified: docs/hooks, docs/basic-transition].

Order inside one navigation [verified: src Transitions.ts `doPage`]:
- `sync: false` (default): `before` → `beforeLeave` → `leave` in parallel with the fetch → `afterLeave` → **next container appended** → `beforeEnter` → `enter` → `afterEnter` → **old container removed** → `after`.
- `sync: true`: wait for the fetch → `before` → next appended → `beforeLeave` → `beforeEnter` → `leave` ∥ `enter` → `afterLeave` → `afterEnter` → old removed → `after`.
- In both modes the old and the new container are mounted together from the append until `after`. Global hooks (`barba.hooks.leave(fn)` and friends) run before the transition's own hook of the same name [verified: src Transitions.ts `_doAsyncHook`].

Hook data [verified: src defs/transition.d.ts, core.ts `_resetData`]: `{ current, next, trigger, event }`; `current` and `next` carry `container`, `namespace`, `html` and `url` (`href`, `path`, `hash`, `query`, `port`) [verified: src defs/url.d.ts]. `trigger` is the clicked link, `'barba'` (from `barba.go`), `'popstate'`, `'back'` or `'forward'`; back and forward are derived from Barba's own history index on popstate [verified: src defs/dom.d.ts, utils/history.ts].

Views `{ namespace, beforeOnce, afterOnce, beforeLeave, afterLeave, beforeEnter, afterEnter }`: per-page init and teardown, no `leave` / `enter` [verified: src defs/view.d.ts; docs/custom-code].

Utilities:
- `barba.go(href, trigger?, e?)` navigates with transitions [verified: docs/utils]; `barba.force(href)` is a plain `location.assign` [verified: src core.ts]; `barba.prefetch(href)` [verified: src core.d.ts].
- `barba.history.current` / `.previous`: `{ ns, scroll: { x, y }, url, data }`, `previous` is `null` at start [verified: docs/strategies]. Scroll is read from `window.scrollX/Y` when a state is added [verified: src utils/history.ts], which is correct under a root Lenis because the document itself scrolls.
- `barba.destroy()` resets data, unbinds the listeners, clears history and **all global hooks**, drops plugins [verified: src core.ts].

What Barba does not do [verified: src, `dist/barba.modern.mjs` has no `scrollTo`, `scrollRestoration`, `.focus(`, `matchMedia` or `script` handling]: reset or restore scroll, move focus, honour reduced motion, or run scripts from the fetched page. Per-page code belongs in views or hooks. It does set `document.title` [verified: src].

## Lenis hand-off on route change
Default: one root Lenis for the whole visit, stopped during the swap, resized and reset once the new container stands alone.
```js
import barba from '@barba/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
history.scrollRestoration = 'manual';          // Barba restores nothing [verified: src]; manual per its recipe [verified: docs/recipes]
const lenis = new Lenis({ autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;                          // awards-hook and capture drive it

let ctx = null;                                // page-scoped tweens, ScrollTriggers, listeners
const mount = (el) => { ctx = gsap.context(() => { /* page motion */ }, el); };
const saved = new Map();                       // url.path → y, for back / forward

barba.hooks.beforeLeave(({ current }) => {
  saved.set(current.url.path, lenis.scroll);
  lenis.stop();
  ctx?.revert(); ctx = null;                   // kill triggers while their DOM still exists
});
barba.hooks.beforeEnter(({ current, next, trigger }) => {
  current.container.style.display = 'none';   // the old container stays mounted until `after` [inferred: src order]
  const back = trigger === 'back' || trigger === 'forward';
  lenis.resize();
  lenis.scrollTo(back ? saved.get(next.url.path) ?? 0 : 0, { immediate: true, force: true });
});
barba.hooks.after(({ next }) => {
  lenis.start();
  mount(next.container);
  ScrollTrigger.refresh();                     // once the old container is gone; again after fonts and images land
  next.container.querySelector('h1')?.focus({ preventScroll: true });   // h1 carries tabindex="-1"
});

barba.init({ preventRunning: true, transitions: [curtain] });
mount(document.querySelector('[data-barba="container"]'));
```
- `stop()`, `start()`, `resize()` and `destroy()` are methods of the Lenis 1.3.26 class [verified: `recipes/node_modules/lenis/dist/lenis.mjs`]; `scrollTo(…, { force: true })` moves a stopped instance (see `lenis-1.3.md`).
- Destroy and recreate instead when Lenis's `wrapper` / `content` live **inside** the Barba container (an inner scroller): the node is replaced, so the instance must go. [site:wearedirect] does this around every swap on a root scroller too; it works but buys nothing there.
```js
let lenis, tick;
const boot = () => {
  lenis = new Lenis({ autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  tick = (t) => lenis.raf(t * 1000);
  gsap.ticker.add(tick);
  window.lenis = lenis;
};
barba.hooks.afterLeave(() => { gsap.ticker.remove(tick); lenis.destroy(); });
barba.hooks.after(() => { boot(); ScrollTrigger.refresh(); });
boot();
```
- Either way: revert the page's `gsap.context` before its container leaves the DOM, and call `ScrollTrigger.refresh()` only after `after`; a refresh while both containers are mounted measures a document of double height [inferred: src order].

## Pitfalls
- Both containers mounted from the append to `after` (both modes): doubled height for Lenis and ScrollTrigger, two `<main>` landmarks, duplicate ids. Hide or `inert` the old one in `beforeEnter` unless the design is a crossfade [inferred: src order].
- `preventRunning` defaults to `false`: a second click mid-transition starts a second navigation. taxi's equivalent `allowInterruption` defaults the safe way [verified: docs/options; taxi src Core.js].
- No scroll or focus handling: set `history.scrollRestoration = 'manual'`, reset through Lenis, move focus to the new `<h1>` or `<main>` in `after`, or keyboard and screen-reader users are left on a removed node.
- No reduced-motion branch: every `leave` / `enter` must shortcut to `gsap.set` + return under the reduced tier (`recipes/_shared/reduced-motion.js`).
- Fetched pages' scripts never run; Webflow interactions, embeds and CMS renders need an explicit re-init in a hook. How Webflow's own runtime re-initialises after a swap is [recalled], test it per site.
- `timeout` 2 s: a slow or heavy page aborts the transition and Barba falls back to navigating the browser [verified: docs/recipes]; raise it or keep pages light.
- `barba.destroy()` also clears every `barba.hooks.*` registration [verified: src core.ts]; re-register after a re-init.
- An unpinned CDN `@barba/core` (two corpus sites) takes whatever `latest` is on the next deploy.
- A route curtain that locks scroll for about two seconds per navigation reads as a load gate to a jury [site:wearedirect].

## Barba vs taxi
| | taxi 1.9.1 [recipe:page-transitions] | Barba 2.10.3 |
|---|---|---|
| Shape | classes: a `Renderer` per view (`onEnter`, `onEnterCompleted`, `onLeave`, `onLeaveCompleted`) and a `Transition` (`onLeave` / `onEnter` with `done`) [verified: taxi src Renderer.js; recipe main.js] | object literals: transitions picked by `from` / `to` rules and `priority`, views by namespace, global hooks |
| Markup | `data-taxi`, `data-taxi-view`, `data-taxi-ignore` | `data-barba="wrapper"` / `"container"`, `data-barba-namespace`, `data-barba-prevent` |
| DOM during enter | old view removed after leave, before enter (`removeOldContent: true` default) [verified: taxi src Core.js, Renderer.js] | old container kept until `after`; `sync: true` crossfades both |
| Interruption | `allowInterruption: false` default | `preventRunning: false` default |
| Events | `NAVIGATE_OUT`, `NAVIGATE_IN`, `NAVIGATE_END` [verified: taxi src Core.js] | `before` … `after` hooks, plus `ready`, `page`, `reset`, `nextAdded`, `currentRemoved` [verified: src defs/hooks.d.ts] |
| Page scripts | `reloadJsFilter` / `reloadCssFilter` can run the new page's scripts and styles [verified: taxi src Core.js] | none [verified: src] |
| Lenis hand-off | reset in `Transition.onEnter`, context per `Renderer` [recipe:page-transitions] | reset in `beforeEnter` after hiding the old container, refresh in `after` |

Pick taxi for new builds; Barba when the site already runs it, when a crossfade needs both pages live, or when many route pairs need their own transitions.

## Where the corpus used it
- [site:wearedirect]: `@barba/core` unpinned from jsDelivr on a Webflow export; a clone of the loader drops as a route curtain (`-300vh → 0`, 1 s `power2.inOut`, exits to `200vh`), coloured and worded per page from `data-barba-color` / `data-barba-word` prefetched in idle time; Lenis destroyed and recreated around every route change; back navigation restores saved scroll; the Sanity render re-runs after each swap.
- [site:likova]: `@barba/core` 2.10.3 exactly, `data-barba="wrapper"` / `container`, in a webpack + jQuery bundle; its smooth scroll is Locomotive Scroll v4, not Lenis; the transition's look is [unknown] on the card.
- [site:son-daven]: `@barba/core` unpinned from unpkg on a Webflow shell; a `dither` transition with `sync: false`, scroll stored per pathname in `sessionStorage` and restored with `lenis.scrollTo(…, { immediate: true })` (Lenis 1.3.15).
- [site:united-carriers]: a Barba vendor chunk inside the injected Rolldown bundle, container lifecycle through `next.container`; Lenis handles `scrollTo`, hash landing and `scrollRestoration: "manual"`.
