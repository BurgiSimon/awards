# Preloaders and transitions

What this file is for: the first moment and the in-between moments — how the corpus turns loading into the opening beat of the story, and how it moves between routes, sections and themes without a hard cut. It lists the archetypes actually seen, the mechanics behind them, and the rules that keep a loader from becoming a wall. Cite as `[pattern:preloaders-and-transitions#section]`.

## The load contract

Why: a preloader is only honest when it waits for something real. The corpus's best loaders gate on asset promises — Floema counts decoded textures [site:floema-jewelry] [verified]; Lando reveals only after `Promise.all([riveReady, glAssetsLoaded])` [site:lando-norris] [verified]. Its worst wall the whole site behind a click [site:leo-parpeix] or behind every texture on every route [site:floema-jewelry]. The 2026-09-23 wave adds honest gates — a counter capped at 92 until the model is ready, with a 12 s fallback [site:primesec] [verified]; a meter fed by media ready, `load` and `fonts.ready`, with a 1.8 s floor and a 4.8 s ceiling [site:christoph-nagel] [verified]; a counter that reaches 100 only after `load` and a minimum hold, with fallbacks at 3.5, 5.2 and 6.8 s [site:goats] [verified] — and a run of timers: a percentage read from the loader's own timeline [site:pensatori-irrazionali], a fixed 1.4 s [site:runrobrun], 4 s counts labelled "fake loading" [site:spasoje] or followed by a click [site:the-boyd], a 3.5 s wait before ENTER [site:siena], a 5 s image flicker [site:noth] and a ≈ 4 s scripted arrival [site:grids-obys], all [verified]. The 2026-10-05 wave, both ways [verified on each card]: a gate held for fonts and four settled checks of the texture queue, capped at 3 s [site:ascension-pegassi]; named load steps and a shader warm-up before the gate [site:cutobot-byholm]; reveals gated on `document.fonts.ready` [site:eugeniagrab]; a counter weighted 25 % images and 75 % video buffer with a 1.4 s floor and a 6 s ceiling — real, but waiting on a 15 MB reel [site:aqualoqa] — against a 1,700 ms counter [site:agrumeafarm], a 2 s counter beside a 4 s column [site:bleibtgleich] and a 3.8 s timeline after a 1 s delay [site:stanzza].

Rules:
- Gate on `Promise.all([document.fonts.ready, firstSceneAssets])` — the first viewport's assets, not the site's. Stream the rest by `IntersectionObserver` or by scene window (`[pattern:webgl-architecture#scene-windows-and-disposal]`).
- Add what the corpus lacks: a timeout that shows the page anyway with a degraded scene, and a visible skip control.
- Never a timer alone. A counter that finishes at the same second on every connection is a tell.
- Repeat visits: remember in `sessionStorage`; cut the sequence to ≤ 2.5 s or skip it entirely — the session skip of [site:serotoninn] [site:noth] [site:the-boyd], the once-per-visitor boot with click-to-skip of [site:mensch], the per-tab header intro skipped before first paint of [site:okaydev] [verified]. Every-visit intros of 4.4–14.6 s [site:areebali], ≥ 1.2 s [site:zainabkabira] and ≈ 3.25 s with no storage check [site:abatable], and a warm-up plus a click on every visit [site:edolus], are what to beat [verified; the 3.25 s inferred from timeline positions]. So are a click gate on every visit to two routes [site:ascension-pegassi], loaders with no storage check [site:aqualoqa] [site:eugeniagrab] [site:aardvarkbookclub], state kept on `window` so only full loads replay it [site:bleibtgleich], and a skip that reads a `localStorage` key no script writes [site:stanzza] [verified]. A `?film` parameter or a `sessionStorage` flag that jumps the opening is the version to keep [site:cutobot-byholm] [verified].
- Announce progress in an `aria-live="polite"` status; remove the loader from the accessibility tree once it is gone.
- Keep the loader's own cost near zero: Igloo paints a pure-CSS loader from a 16 KB entry before any framework arrives [site:igloo] [verified]. Or ship no loader: pre-JS CSS hides only what will animate in and shows only the active section, so nothing flashes [site:nodeck] [verified].

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
| No loader | content in the first frame; any intro is the hero's own entrance — lines drawn in on `window.load` over 3 s `expo.out` [site:wodniack] | [site:boc] [site:wodniack] [site:okaydev] [site:nodeck] [site:911rennsport] [site:siteassist] | [verified] |
| Aperture handoff | the curtain's lower edge bows then flattens as it lifts; the hero opens from `inset(32% round 10px)` to full bleed over 1.4 s `expo.inOut` while its video scales from .6 to 1; skipped when not at the top or under reduced motion | [site:goats] | [verified] |
| Film landed on the live element | a pre-rendered intro sized to the target element's rect and cut to it on `timeupdate`, with a timer fallback and a plain fade on small screens | [site:areebali] | [verified] |
| Instrument of the trade | a 20-segment level meter with a red zone, fed by real signals | [site:christoph-nagel] | [verified] |
| Progress that stays as chrome | the header rule grows as the progress bar and remains the nav baseline | [site:grids-obys] | [verified] |
| Boot screen, once | a CRT wordmark, a percentage held until the first 20 sequence frames decode, click anywhere to skip, stored per visitor | [site:mensch] | [verified] |
| Countdown | a three-digit counter running from 100 to 000 for a brand named after nothing | [site:noth] | [verified] |
| Cell grid | a 10 × 8 grid of cells that also builds the menu, the section wipes and the image reveals | [site:runrobrun] | [verified]; the 1.4 s timer is the thing to beat |
| Warm-up walk as the bar | before the CTA appears, the scene manager emits progress at 25 % and 75 % of each of seven chapter windows, holding each 3 frames with frustum culling off after a 5-frame delay, then settles 2.5 s; the walk fills 70 % of the bar, the settle 30 % | [site:edolus] | [verified]; that it compiles shaders and uploads textures before they are seen [inferred] |
| Polygon wipe handoff | panels and logo leave by `clip-path` polygons (1.5 / 1.25 `expo.out` / 1.5 / 1.5 s) while the hero image scales from 1.125 over 3 s, contours draw over 5 s `power3.out`, the nav drops from `yPercent −125` over 1.5 s `expo.out` and the h1 fades in per character at .03 s | [site:abatable] | [verified]; runs on every full load |
| The product as the gate | the record sleeve alone on a grained black field, a real `<button>` with a cursor label; on click the label and sheet fade .5 s and the sleeve is thrown aside after .55 s with a .15 s trail; a flat sleeve image without WebGL | [site:ascension-pegassi] | [verified]; every visit to two routes |
| Drawn in a worker | the subject drawn stroke by stroke on an `OffscreenCanvas` in a worker, so shader compilation on the main thread never freezes the pen; pen pace floor .16, ceiling .22, minimum 1,100 ms, exit 1,900 ms, a tear growing from the subject at exponent 4.5 | [site:cutobot-byholm] | [verified] |
| The brand's own things, piled | 22 fruit SVGs as matter-js hull bodies (gravity 3.35, restitution .03, friction .82) dropping onto a dome while a counter runs 1,700 ms cubic-out; a static ring under reduced motion | [site:agrumeafarm] | [verified]; a timer, not a signal |
| Find the name | a 5 × 15 grid of capitals in which the brand's letters darken while the rest fade, gated on fonts; reduced motion shows the name at once | [site:eugeniagrab] | [verified]; every visit |
| Strips fanned into a frame | mirrored image strips fanning in `svw` steps while the frame grows from a 4svw square to full bleed; its own phone timeline; values in `[pattern:gsap-choreography#timeline-architecture]` | [site:stanzza] | [verified]; the skip never fires |
| Zoom out of the screen | a counter on a black sheet, then the scene scaled so a photographed screen fills the viewport × 1.12, settling to 1 over 1.8 s `cubic-bezier(.22,1,.36,1)`; skipped under reduced motion | [site:aqualoqa] | [verified] |
| Column and counter | a black column growing to full height over 4 s while a counter runs 0 → 100 over 2 s, both on one in-out curve; the nav slides in from 5 vw off-corner | [site:bleibtgleich] | [verified]; timers |
| Fan-in of the items | the gallery's discs fan in (`preloadFanDuration 1.15`, rise from 3) behind a CSS gate removed at most 20 s later, skipped under reduced motion | [site:a24-raviklaassens] | [verified] |

What carries over: the loader speaks the site's register (a frame counter for a film studio, readouts for a defence console, a drawn gesture for a manifesto) and it costs nothing before first paint. What does not: any of these devices as drawn `[recipe:preloader-counter-hold]`.

## Sound consent on the gesture

Why: browsers need a gesture before audio can start, so the loader's exit click is the natural place to ask. Léo Parpeix couples "enter" and "enable sound" in one click [site:leo-parpeix] [recalled medium]; Why Zero's consent handling is unknown [site:why-zero]. A setup dialog asks sound on or off, and manual or auto scroll, before BEGIN [site:cutobot-byholm] [verified] — two honest buttons; a reel that tries to start unmuted after the intro and unmutes on the first pointer, key or touch is the trick refused [site:aqualoqa] [verified].

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
| Promote the chosen | on click the other rows fade (`opacity 0, y 18`, `power2.in`, .65 s) staggered .09 s × distance from the clicked row; the clicked row rises 1.15 s on `power2.inOut` to sit under the header; the route is pushed at 1.6 s; skipped under reduced motion | [site:boc] | [verified] |
| Title as a doorway | a section title's mask scales from 1 until it covers the viewport (`power4.in`) on a `scrub: 1` timeline, and the section's content travels in CSS 3D inside it | [site:wodniack] | [verified] |
| Curtain wearing the destination | one element serves as loader and route curtain; its colour and word come from the destination, prefetched from every same-origin link in idle time; drop 1 s `power2.inOut` | [site:wearedirect] | [verified] |
| Double-buffered video wipe with a seam | two `<video>` elements; the incoming clip opens by `clip-path: inset()` over 1 s `expo.inOut` while a 1 px glowing seam rides the edge on the same clock | [site:christoph-nagel] | [verified] |
| Interstitial band | a curved colour band sweeps the viewport over 1 s `power3.inOut` while the next chapter's number and masked title rise on `back.out(1.7)` | [site:nodeck] | [verified] |
| DOM to GL, once | the leaving section rasterised with html2canvas, crumpled on a segmented plane and dropped into a bin; any failure falls through to the plain transition | [site:nodeck] | [verified] |
| Cell wipe | a full-screen grid of cells switching on per-cell delays radiating from one side, 20 ms each | [site:runrobrun] | [verified] |
| Discipline slide | the incoming route slides from ± 10 % in the direction of the switch, .8 s | [site:alectear] | [verified] |
| Page under a veil | `sync: true`; the old page rises 25vh under a dark veil going 0 → .8 while the new one rises from 100vh, 1.2 s on a custom in-out; reduced motion gets an `autoAlpha` swap only | [site:abatable] | [verified] |
| Chromatic cut between chapters | inside one canvas the chapter change runs through a chromatic pass with a dip to white | [site:edolus] | [verified]; values in `[pattern:webgl-architecture#effect-parameters]` |
| Stroke flood | one SVG path set to `drawSVG '0% 0%'` at `strokeWidth 8%`; keyframes hold to 15 %, draw `'0% 100%'` by 90 % and widen to `strokeWidth 70%` at 100 %, 1.25 s, so the line floods the viewport; the logo pops in .65 s on `elastic.out(1, .72)` after .5 s; first load reverses to `'100% 100%'`; reduced motion swaps by `autoAlpha` | [site:aardvarkbookclub] | [verified] |
| Blur cross-fade | Barba `sync: true`; the old page blurs 0 → 24 px and fades over .8 s on an in-out curve while the new one does the reverse; a cut under reduced motion | [site:bleibtgleich] | [verified] |
| The item flies into its route | a disc recedes and flies into the production route (`flightRecede 2.2`, `flightStagger .45`) under Barba `sync` with a 7 s timeout [site:a24-raviklaassens]; a jar hidden and a clone flown into the product page, exit .42 s [site:agrumeafarm] | [site:a24-raviklaassens] [site:agrumeafarm] | [verified] `[recipe:transition-promote-chosen]` |
| Scale from the control into the world | the enter button's click scales the page from the button's centre into the film | [site:cutobot-byholm] | [verified] |

Rules: make the transition the hero and the sections the rests — United Carriers stages its mode changes (road → sea → air) as the designed moments [site:united-carriers] [verified concept]. One transition vocabulary per site: a shared-element flight and a wipe on the same route are two ideas.

## Theme swap as a transition

Why: when ground and ink change together, navigation becomes art direction and the page needs no other transition.

- Floema declares `data-background` and `data-color` per template; a singleton tweens `document.documentElement` over 1.5 s and exactly two values are live at a time [site:floema-jewelry] [verified].
- The flavour-field family repaints every slot in ≈ 1 s on `cubic-bezier(.645,.045,.355,1)`, restarts from the current value under rapid switching, and lerps the WebGL clear colour in the same tween so canvas and DOM never desync [site:slosh-seltzer] [verified at family level].
- Léo Parpeix swaps four named themes per section so scrolling reads like turning pages [site:leo-parpeix] [recalled medium]; Lando flips light and dark by sampling the section under the header [site:lando-norris] [verified].
- A day / night toggle crossfaded by `document.startViewTransition`, with a 500 ms class fade as fallback and the choice applied before first paint [site:zainabkabira] [verified].
- A theme the visitor chooses: five grounds swapped by a liquid WebGL wipe over the page, stored per session, the favicon switching too [site:bleibtgleich] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.
- A theme set by reading position: an `IntersectionObserver` with `rootMargin 0 0 −50% 0` writes `data-theme="dark"` as one chapter crosses the middle, and a GL swirl starts under it [site:cyphercapital] [verified].

Rule: `data-theme` on `<html>` is the single source for the CSS tokens *and* the renderer's clear colour; tween the tokens, never individual elements `[recipe:theme-swap-tokens]`. Reduced tier: instant, or ≤ 300 ms.

## Route transition mechanics

- **Hand-rolled** [site:floema-jewelry] [verified]: `await page.hide()` → `fetch(url)` → parse into a detached element → `pushState` → swap `innerHTML` → build the new page and canvas scene → `page.show()`. Per-template scenes are created and destroyed on every change.
- **taxi** [site:lando-norris] [verified]: link interception, prefetch, DOM teardown and page-init callbacks. Pair it with a Lenis reset and `gsap.context()` cleanup so no ticker or trigger outlives the swap `[recipe:page-transitions]`.
- **View Transitions (MPA)** [site:mont-fort] [verified]: the cinematic site without a SPA; content stays static HTML and only the island re-hydrates. In a Next.js app the same API through `next-view-transitions`, with Lenis read in the router hook [site:pensatori-irrazionali] [verified]; natively for a tile → hero morph in a hand-written site [site:zainabkabira] [verified].
- **taxi on a Webflow shell** [site:noth] [site:siena] [verified]: an injected bundle owns routing; `NAVIGATE_END` runs a full teardown and re-init list [site:noth].
- **Barba** [site:wearedirect] [site:likova] [verified]: Lenis destroyed and recreated around every swap; saved scroll restored on back navigation [site:wearedirect]; Lenis rebuilt on each entry [site:bleibtgleich]; `sync: true`, a 7 s timeout and `preventRunning` [site:a24-raviklaassens]; Barba prefetch with per-route destroy functions that `close()` every decoded frame [site:aardvarkbookclub] [verified on each]. A label pair on the enter timeline (`startEnter`, `pageReady`) resolves the router's promise; `debug: true` shipped to production is the miss [site:abatable] [verified].
- **A curtain before a full reload** [site:serotoninn] [verified]: every internal link intercepted for a 1.6 s curtain, then `location.assign` — the cost of a transition without the benefit of a router.
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

- A spinner, or a counter that runs on `setTimeout` or on its own timeline's progress [site:pensatori-irrazionali] [site:runrobrun] [site:spasoje] [verified].
- A click-to-enter wall with no second path into the content [site:siena] [site:the-boyd] [verified]; a click that only the pointer can give [site:the-boyd] [verified].
- Loading every route's assets before the first frame.
- Cross-fade as the only transition on a site that claims a world.
- Two transition ideas on one route (a flight and a wipe).
- Theme swaps that tween elements one by one, or that leave the canvas clear colour behind.
- The drawn-zero gesture, the `00/24` leader, the boot readouts, the two-arc ring, the grid-to-detail flight, the row-rise exit or the title-mask tunnel as-is; the level meter, the CRT boot, the countdown, the crumple into a bin, the bowed curtain; the thrown sleeve, the robot drawn in a worker, the fruit pile, the word search, the strip fan, the zoom out of a television, the stroke flood.
- A breakpoint reload.
