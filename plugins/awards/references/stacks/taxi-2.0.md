# Taxi 2.0

<!-- Labels: [verified: upgrading] = taxi.js.org/upgrading, read 2026-10-22 · [verified: verify run] = `verify-recipes.mjs --only page-transitions,transition-promote-chosen` against `@unseenco/taxi@2.0.0` in a scratch install, 2026-10-22 · [inferred] · [unverified]. Version from the npm registry: 2.0.0, published 2026-09-27. -->

## Status in this skill set
The pin stays at **1.9.1** (`versions.md`, `recipes/package.json`) until the catalogue moves as a whole; the API reference is `taxi-1.9.md`. Both taxi recipes already run on either major: their base `Renderer` declares `initialLoad()` itself, and with that they pass on 1.9.1 and on 2.0.0 [verified: verify run]. Without it, both fail on 2.0.0: the first page never enters its renderer [verified: verify run]. A project that installs taxi without a version gets 2.0, so either pin `@unseenco/taxi@1.9.1` or apply the first row below.

## What breaks, and what to do
| 2.0 change | Do this |
|---|---|
| `initialLoad()` no longer calls `onEnter()` / `onEnterCompleted()` on the first hard load [verified: upgrading] | Declare it on the base renderer: `initialLoad() { this.onEnter(); this.onEnterCompleted(); }` `[recipe:page-transitions]` `[recipe:transition-promote-chosen]` |
| Only stylesheets and `<style>` elements marked `data-taxi-reload` are carried over; `reloadCssFilter` now mirrors `reloadJsFilter` [verified: upgrading] | Nothing to do when every page shares one CSS chunk (both recipes) [verified: verify run]. Per-page CSS needs the attribute, or `new Core({ reloadCssFilter: () => true })` for the 1.x behaviour |
| Route matching continues after an unmatched "to" pattern, so a later catch-all can match [verified: upgrading] | Declare `addRoute` calls most specific first |
| `preload()` rejects on a non-2xx response, a network error or a page without `[data-taxi-view]` [verified: upgrading] | `taxi.preload(url).catch(() => {})` wherever it is called by hand |
| Internals are private (`#fetch`, `#onClick`, `#chooseTransition`, `#loadStyles` and the rest); `currentCacheEntry` is a read-only getter [verified: upgrading] | Code that overrode an internal moves to an option or an event; the recipes override none |
| Shift- and alt-clicks, `download` links and clicks already `preventDefault()`-ed are left to the browser [verified: upgrading] | Drop the `:not([download])` extension of `links` from the 1.9 note; it is built in |
| `new Core()` on a page without `[data-taxi]` throws [verified: upgrading] | Construct it only where the wrapper exists, e.g. behind `document.querySelector('[data-taxi]')` on a Webflow shell |
| ESM `dist/taxi.js` and CJS `dist/taxi.cjs` through an `exports` map; no UMD, no deep imports such as `@unseenco/taxi/src/Core`; `@unseenco/e` is `^3.0.0` [verified: upgrading] | Import from `@unseenco/taxi` only; a script-tag Webflow embed uses a module script; upgrade a direct `@unseenco/e` 2.x to 3.x |
| Importing needs no DOM [verified: upgrading] | Safe in SSR code; still create the `Core` only in the browser |

## New in 2.0 worth using
- `enableAccessibility: true` announces the page change to screen readers and moves focus to the new content [verified: upgrading]. 1.9 does neither, so the recipes move focus by hand; with the option on, remove the hand-written focus move so the change is not announced twice [inferred].
- `enableViewTransitions: true` runs the swap through the View Transitions API and skips it for users who prefer reduced motion [verified: upgrading]. Further options are not documented [unverified].
- `enablePrefetch: 'visible'` preloads links as they scroll into view; `true` still means hover [verified: upgrading].
- `maxCacheSize` (least recently used pages are evicted; default not stated) and `fetchOptions` for every request [verified: upgrading].
- `onLeave` / `onEnter` may return a Promise instead of calling `done()`; a transition that throws or rejects is logged and treated as finished [verified: upgrading].
- `destroy()` removes every listener and observer, which 1.9 lacked; `navigateBack()` / `navigateForward()` respect `allowInterruption`, and an interrupted request is aborted with an `AbortError` [verified: upgrading].
- A failed navigation resets taxi, and a fetched page that is not taxi-compatible (a login redirect) loads normally; `NAVIGATE_OUT` carries `to` [verified: upgrading].

## Moving the pin
Bump `versions.md`, `recipes/package.json` (with its lockfile) and the two recipes' `recipe.json` deps together (`scripts/check-sync.mjs` fails on a partial bump), fold the API tables of `taxi-1.9.md` into this note, decide on `enableAccessibility` in both recipes, and re-run `verify-recipes.mjs --only page-transitions,transition-promote-chosen`.
