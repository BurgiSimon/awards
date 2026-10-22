# page-transitions

Two pages, one module. A link click fetches the next page, a wipe covers the old view, the new view is swapped in underneath, the scroll resets, the wipe leaves. Everything a view needs lives in a `gsap.context` created on enter and reverted on leave, so nothing leaks between pages and the module never runs twice.

## Why
- **Transitions are the money moment** on multi-route winners, and the failure mode is a leak: a second Lenis, a stale ScrollTrigger, a listener on a removed node (`[pattern:preloaders-and-transitions#route-transition-mechanics]`).
- **Renderer = lifecycle.** `onEnter` builds the page's motion inside a context; `onLeave` reverts it. `ScrollTrigger.refresh()` runs after each enter.
- **Scroll reset through Lenis**, immediate and forced, so the new view starts at the top without a visible glide.
- **Every page ships the full markup contract** (`data-taxi` wrapper, `data-taxi-view`, the wipe, the module), so hard loads of any URL work and the back button works through popstate.

## Parameters
Wipe in `yPercent 100 → 0`, `.7 s`, `expo.inOut` · wipe out `0 → −100`, `.7 s`, delay `.1` · lines `yPercent 120 → 0`, `1.2 s`, stagger `.08`.

## Accessibility
Document title updates per page; focus is moved to the primary nav link after navigation; links are real links (taxi intercepts by delegation, `data-taxi-ignore` for external ones); reduced motion swaps instantly.

## Adapters
- **View Transitions (MPA, Astro):** drop taxi, add `@view-transition { navigation: auto; }` and name shared elements with `view-transition-name`; run per-page setup on `astro:page-load` (see `references/stacks/astro.md`).
- **Shared element:** inside `onEnter`, use `Flip.fit` from the leaving element's recorded state to the entering one.

### Webflow
The route layer of the injected-engine pattern (`references/stacks/webflow-export.md`, Page transitions), on `@unseenco/taxi` as [site:lando-norris] ships it.
- Designer, on every page: a wrapper Div with the custom attribute `data-taxi` around the content, and inside it the page's main Div with `data-taxi-view` and `data-view="<name>"`, which the renderer reads. The wipe is a Div `wipe` with `data-wipe` and `aria-hidden="true"` outside the wrapper, so it survives swaps; the header link the renderer retargets carries `data-nav`. Every page carries the same contract, so a hard load of any URL works.
- Links that must hard-load carry `data-taxi-ignore`: external links, and links to any page that relies on Webflow-JS components.
- Turn off: no Webflow Interactions and no components that depend on `webflow.js` (dropdowns, sliders) on transitioned pages. They do not re-initialise after a swap, and the re-init snippets that circulate are [unverified].
- Inject once, in Site settings → Footer code (the [recipe:boot-lenis-gsap] Footer-code loader). Page-level custom code runs once per hard load, never after a swap, so per-page logic belongs in the renderer's `onEnter` and `onLeave`.
- Reduced motion: the wipe is skipped and views swap instantly; focus still moves to `data-nav` after each navigation.

Seen in: `[clone:floema-jewelry]`, `[site:lando-norris]`, `[site:mont-fort]`.
