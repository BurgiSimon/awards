# Preloaders and transitions

What this file is for: the first moment and the in-between moments — how the corpus turns loading into the opening beat of the story, and how it moves between routes, sections and themes without a hard cut. It lists the archetypes actually seen, the mechanics behind them, and the rules that keep a loader from becoming a wall. Cite as `[pattern:preloaders-and-transitions#section]`.

## The load contract

Why: a preloader is only honest when it waits for something real. The corpus's best loaders gate on asset promises — Floema counts decoded textures [site:floema-jewelry] [verified]; Lando reveals only after `Promise.all([riveReady, glAssetsLoaded])` [site:lando-norris] [verified]. Its worst wall the whole site behind a click [site:leo-parpeix] or behind every texture on every route [site:floema-jewelry].

Rules:
- Gate on `Promise.all([document.fonts.ready, firstSceneAssets])` — the first viewport's assets, not the site's. Stream the rest by `IntersectionObserver` or by scene window (`[pattern:webgl-architecture#scene-windows-and-disposal]`).
- Add what the corpus lacks: a timeout that shows the page anyway with a degraded scene, and a visible skip control.
- Never a timer alone. A counter that finishes at the same second on every connection is a tell.
- Repeat visits: remember in `sessionStorage`; cut the sequence to ≤ 2.5 s or skip it entirely.
- Announce progress in an `aria-live="polite"` status; remove the loader from the accessibility tree once it is gone.
- Keep the loader's own cost near zero: Igloo paints a pure-CSS loader from a 16 KB entry before any framework arrives [site:igloo] [verified].

## Preloader archetypes

| Archetype | Mechanism | Site | Confidence |
|---|---|---|---|
| Counter with a hold | percent written from real decode progress; holds ≈ 1 s at 100 so the number is read; exits with the titles at `y: '150%'`, 1.5 s, `expo.out`, stagger .1, then the number (`y: '100%'`) and the container | [site:floema-jewelry] | [verified], clone |
| Progress ring + sound gate | an SVG circular progress ring labelled "World building", then a click that enables sound — a consent, not a content wall; the real hold afterwards is a hard-coded 3.75 s navbar delay | [site:leo-parpeix] | [verified, live bundle 2026-09-18] |
| Participatory gesture | draw a zero; when the stroke closes, frost spreads from it and dissolves into the scene | [site:why-zero] | [verified] |
| Diegetic boot sequence | thermal, lidar and IR readouts flicker on before the hero — loading as the product's own console | [site:usavionix] | [verified description]; timing unknown |
| Cinematic title card | the loader as a film's opening title | [site:son-daven] | [verified feature] |
| Frame counter | `00/24` at headline scale — a film leader, not a spinner | [site:the-line] | [verified]; hold and exit unknown |
| Vector animation on an asset gate | a Rive file plays while GL assets load; reveal on `Promise.all` | [site:lando-norris] | [verified] |
| Two-arc gradient ring | inline SVG with two linear gradients on `currentColor` | [site:mont-fort] | [verified] |
| Zero-cost ASCII | pure CSS `content:` keyframes before the 3D app streams in | [site:igloo] | [verified] |
| Intro interaction | a gated, interactive entry moment rather than a passive loader | [site:oryzo] | [recalled high] |

What carries over: the loader speaks the site's register (a frame counter for a film studio, readouts for a defence console, a drawn gesture for a manifesto) and it costs nothing before first paint. What does not: any of these devices as drawn `[recipe:preloader-counter-hold]`.

## Sound consent on the gesture

Why: browsers need a gesture before audio can start, so the loader's exit click is the natural place to ask. Léo Parpeix couples "enter" and "enable sound" in one click [site:leo-parpeix] [recalled medium]; Why Zero's consent handling is unknown [site:why-zero].

Rule: the gesture may enable sound, but content never waits for it. Either offer two buttons — enter with sound, enter — or reveal on the load signal and keep the sound switch in the chrome (`[pattern:sound#opt-in-only]`).

## Transition archetypes

| Archetype | Mechanism | Site | Confidence |
|---|---|---|---|
| Shared element in GL space | the source plane is lifted (`z += .01`) and its scale, position and rotation tween to the destination rect over 1.5 s on `expo.inOut`; the temporary mesh is removed .2 s later | [site:floema-jewelry] | [verified], clone |
| Render-to-texture composite | each section renders to an off-screen target; a fullscreen plane's fragment shader blends them — wipe, warp or dissolve | [site:slosh-seltzer] | [verified], Codrops `[recipe:gl-rtt-composite-transition]` |
| Torn-edge mask | chapter wipes on a deckled paper edge with fibrous tendrils — a treated material edge, not a painted one | [site:shopify-editions-w26] | [verified, live source 2026-09-18]; the "brushstroke" and the wave-mask flecks were a third-party read and are not in the served source |
| Hinge | the hero sheet swings away on a bottom-left origin (`[pattern:motion-vocabulary#sticky-stages-and-hinges]`) | [site:the-line] | [verified] `[recipe:sticky-stages-rails]` |
| Flash and interference cuts | interior scenes cut through glitch frames, never a fade; RTT compositing is the likely mechanism | [site:igloo] | [recalled high]; mechanism [inferred] |
| Theme swap on `documentElement` | see the next section | [site:floema-jewelry] [site:slosh-seltzer] [site:leo-parpeix] | mixed |
| Choreographed route change | Rive state change + camera move + Three teardown and setup sequenced on one GSAP timeline; scenes rebuilt per route | [site:lando-norris] | [verified] |
| Cross-document morph | Astro `ClientRouter` (View Transitions API); elements sharing a `view-transition-name` morph natively | [site:mont-fort] | [verified] |

Rules: make the transition the hero and the sections the rests — United Carriers stages its mode changes (road → sea → air) as the designed moments [site:united-carriers] [verified concept]. One transition vocabulary per site: a shared-element flight and a wipe on the same route are two ideas.

## Theme swap as a transition

Why: when ground and ink change together, navigation becomes art direction and the page needs no other transition.

- Floema declares `data-background` and `data-color` per template; a singleton tweens `document.documentElement` over 1.5 s and exactly two values are live at a time [site:floema-jewelry] [verified].
- The flavour-field family repaints every slot in ≈ 1 s on `cubic-bezier(.645,.045,.355,1)`, restarts from the current value under rapid switching, and lerps the WebGL clear colour in the same tween so canvas and DOM never desync [site:slosh-seltzer] [verified at family level].
- Léo Parpeix swaps four named themes per section so scrolling reads like turning pages [site:leo-parpeix] [recalled medium]; Lando flips light and dark by sampling the section under the header [site:lando-norris] [verified].

Rule: `data-theme` on `<html>` is the single source for the CSS tokens *and* the renderer's clear colour; tween the tokens, never individual elements `[recipe:theme-swap-tokens]`. Reduced tier: instant, or ≤ 300 ms.

## Route transition mechanics

- **Hand-rolled** [site:floema-jewelry] [verified]: `await page.hide()` → `fetch(url)` → parse into a detached element → `pushState` → swap `innerHTML` → build the new page and canvas scene → `page.show()`. Per-template scenes are created and destroyed on every change.
- **taxi** [site:lando-norris] [verified]: link interception, prefetch, DOM teardown and page-init callbacks. Pair it with a Lenis reset and `gsap.context()` cleanup so no ticker or trigger outlives the swap `[recipe:page-transitions]`.
- **View Transitions (MPA)** [site:mont-fort] [verified]: the cinematic site without a SPA; content stays static HTML and only the island re-hydrates.
- Whatever the router: reset scroll (`lenis.scrollTo(0, { immediate: true })`), move focus to the new `<main>` or `<h1>`, and refresh ScrollTrigger once the new fonts and images have landed.

## Anti-pattern: reload at a breakpoint

A reload on crossing a breakpoint costs every transition above it: zoom users and anyone dragging a window edge trip it mid-visit. Rebuild the scene on `ResizeObserver` instead, and pick texture tiers by capability rather than width (`[pattern:responsive-strategy#never-reload-at-a-breakpoint]`). This was recorded against `[site:lando-norris]`, whose six scenes were said not to resize; the 2026-09-18 live pass did not find the reload in the served bundle, so treat the rule on its own merits [the attribution is [unknown] as of that pass].

## Verify

- [ ] The loader resolves on `Promise.all([fonts, firstSceneAssets])` with a timeout and a skip; no timer-only counter.
- [ ] Holds at 100 for ≈ 1 s, exits in ≤ 1.5 s, and skips or shortens to ≤ 2.5 s on a repeat visit.
- [ ] `aria-live` status during load; the loader leaves the accessibility tree afterwards.
- [ ] Sound consent rides the gesture but content is reachable without it.
- [ ] One transition vocabulary; the same duration unit for every hero-scale move.
- [ ] Theme swaps tween `<html>` tokens and the canvas clear colour together; instant under reduced motion.
- [ ] Route changes reset scroll, move focus, tear down tickers and triggers, and refresh measurements.
- [ ] No reload on resize; scenes rebuild on `ResizeObserver`.

## Refuse

- A spinner, or a counter that runs on `setTimeout`.
- A click-to-enter wall with no second path into the content.
- Loading every route's assets before the first frame.
- Cross-fade as the only transition on a site that claims a world.
- Two transition ideas on one route (a flight and a wipe).
- Theme swaps that tween elements one by one, or that leave the canvas clear colour behind.
- The drawn-zero gesture, the `00/24` leader, the boot readouts, the two-arc ring, or the grid-to-detail flight as-is.
- A breakpoint reload.
