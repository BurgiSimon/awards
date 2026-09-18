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

Seen in: `[site:floema-jewelry]`, `[site:lando-norris]`, `[site:mont-fort]`.
