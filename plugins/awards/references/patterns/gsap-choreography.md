# GSAP choreography

What this file is for: the deep GSAP path of `awards:motion` (`--gsap`). How the analysed sites structure GSAP across a whole page — timeline architecture, ScrollTrigger configurations as shipped, easing as actually used, SplitText, Flip and Observer choreography, and GL uniforms driven from timelines. It does not teach the API: that is GreenSock's official skills and `stacks/gsap-3.15.md`. Tokens, duration bands and scrub rules stay in `[pattern:motion-vocabulary]`. Cite as `[pattern:gsap-choreography#section]`. Every row carries the card's confidence label; structure read from minified bundles is `[inferred]`.

## Contents
1. [Timeline architecture](#timeline-architecture)
2. [ScrollTrigger configurations](#scrolltrigger-configurations)
3. [Easing as shipped](#easing-as-shipped)
4. [SplitText choreography](#splittext-choreography)
5. [Flip and layout state](#flip-and-layout-state)
6. [Observer and gesture sections](#observer-and-gesture-sections)
7. [Driving GL from timelines](#driving-gl-from-timelines)
8. [Teardowns](#teardowns)
9. [Recipe map](#recipe-map)
10. [Verify](#verify) · [Refuse](#refuse)

## Timeline architecture

Why: a page whose moments are separate tweens cannot be scored, paused or reduced as one; the deep path names one master timeline per scroll model and a label per chapter.

- **Flat timelines, no master.** Eighteen `gsap.timeline` calls whose children are tweens, `Flip.fit` results and empty callback tweens that move the hero's current-chapter dot; one label pair, `startEnter` / `pageReady`, gates the router's enter promise [site:abatable] [verified count and labels; no nesting inferred]. Eight timelines local to one moment each (loader hand-off, sheet, nav, a morph, a scene reveal), 63 `to`, 0 `addLabel` [site:why-zero] [verified counts; no master inferred]. Neither has a master to score, pause or reduce — the Refuse line below, shipped twice. Fourteen timelines and no `addLabel` on both 2026-10-05 GSAP cards: load and route timelines position on implicit string labels (`"start"`, `"start+=1.1"`, `"startLeave"`) [site:aardvarkbookclub] [verified]; 77 `gsap.set`, 25 `killTweensOf`, 3 `quickTo` and no `gsap.context` beside them [site:bleibtgleich] [verified counts; no master inferred on both].
- **GSAP beside a clock it does not own.** The narrative float is hand-rolled (`SCROLL_LERP .075`, gate auto-scroll on a written smoothstep `n²(3 − 2n)`), `gsap.ticker` is used once, and GSAP only animates what happens at the float's thresholds and in the HUD; no ScrollTrigger is registered [site:why-zero] [verified]. Where Lenis runs, it rides the GSAP ticker: `lenis.on('scroll', ScrollTrigger.update)`, `lenis.raf(time * 1000)`, `lagSmoothing(0)` [site:abatable] [verified] `[recipe:boot-lenis-gsap]`. Lenis 1.3.21 on the ticker with `lagSmoothing(0)`, rebuilt on each Barba entry [site:bleibtgleich] [verified]. The misses: Lenis on `autoRaf` with `ScrollTrigger.update` on its scroll event and the ticker hookup commented out [site:aardvarkbookclub] [verified]; Lenis 1.0.33 on a bare rAF that never feeds ScrollTrigger, which gets one `refresh()` on `load` [site:stanzza] [verified].
- **Two-phase interruptible timeline.** One paused timeline holds the open half, then `addPause()` at its duration `I`, then the close half; close calls `tl.time() < I ? tl.reverse() : tl.play()`, so a close mid-open rewinds instead of jumping. Open: shell on a custom ease .65 s at 0, burger bars `back.out(2)` .4 s at .05, items `yPercent 100 → 0` .6 s stagger .03 at .1; close: items .25 s, stagger `{ each: .01, from: 'end' }`, shell `power3.inOut` .45 s at `'<'` [site:why-zero] [verified]. One object holds both directions, so a fast double click cannot leave the menu half-built.
- **An absolute-seconds load timeline.** Thirteen position parameters in seconds from 0 to 3.76: strips ± 2.2svw over .608 s `power2.out`; 14 mirrored items fanning from ± 30.8svw to ± 4.4svw at 1.05, stagger .02, .52 s; the hero frame 4svw → 42 × 28svw at 1.9 (.77 s) → 100svw × 100svh at 2.68 (.76 s); preloader copy leaving by chars with `stagger: { each: .03, from: 'end' }` at 1.53; the header restored by `.call()` at 3.76; Lenis stopped throughout and restarted `onComplete`; a separate phone timeline chosen once at init below 768 px [site:stanzza] [verified]. Labels would let the phone variant share the beats.
- **Paused timelines on scrub thresholds.** Copy that rides a scrubbed sequence without being scrubbed: at progress ≥ .3 a paused timeline plays at `timeScale(1.5)`; at ≥ .6, or back below .3, it reverses at `timeScale(3.5)`; a final line plays at ≥ .81 at 1.25 [site:aardvarkbookclub] [verified]. The same read of `self.progress` gates a component: past 1.5 / 3.12 of a `top -50%` → `bottom bottom` scrub (1 / 2.5 on the phone) an event builds a Swiper with 5 s autoplay, and below it the slider is reset with `slideToLoop(0, 0)` and destroyed [site:stanzza] [verified]. Inside that scrub, opacity switches are `duration: .001` tweens at positions 1 and 1.5 — step changes on a continuous timeline [site:stanzza] [verified].
- **Percent keyframes as the shape tool.** Fourteen `keyframes` objects keyed by percentage with per-key eases — a word from `scaleY .1` reaches opacity 1 at 10 % and lands at 100 % on `elastic.out(1, .72)` [site:aardvarkbookclub] [verified]. Reach for them where one ease cannot describe the shape.
- **Proxy progress per item.** Each orbit tile owns a `{ progress }` proxy; one paused timeline tweens every proxy + 1 over 2.5 s on `osmo`, staggered .075 s, and `onUpdate` maps the angle to `x = sin × w`, `y = cos × .04w`, scale .2 → 1 and `blur(1px → 0) brightness(.3 → 1)` by `((cos + 1) / 2)^1.3`; the list turns 360° per 24 s with the items counter-rotated, played and paused by `onToggle` [site:bleibtgleich] [verified]. One ease then drives position, scale and depth together.
- **Clip, then morph.** The logo starts as a rectangle path; its wrapper opens `inset(0 0 100% 0) → 0` over .8 s `Out`, then MorphSVG turns the rectangle into the mark over 1.2 s `Out` [site:bleibtgleich] [verified]. A route curtain made of one stroked path is in `[pattern:preloaders-and-transitions#transition-archetypes]` [site:aardvarkbookclub].
- **Defaults as the house style.** `gsap.defaults({ ease: 'osmo', duration: .6 })` with `staggerDefault .05`, so an unannotated tween already speaks the house curve [site:abatable] [verified] (`#easing-as-shipped`). The same `osmo` defaults ship on [site:aardvarkbookclub] and [site:a24-raviklaassens] [verified on both]. Durations can be named the same way — `durXS .2`, `durS .4`, `durM .8`, `durL 1.2`, `stagger .1`, `delayReveal .2` [site:bleibtgleich] [verified] (`[pattern:motion-vocabulary#durations]`).
- **Teardown.** By hand: 48 `killTweensOf`, `tl.kill()` on reruns, SplitText `revert()` on close, no `gsap.context()` or `gsap.matchMedia()`, and no tween with a reduced branch [site:why-zero] [verified]. `gsap.matchMedia` gating nav, parallax, the fan (≥ 768) and a rail (≥ 992), with reduced motion read only by route transitions and testimonials [site:abatable] [verified]. The Verify list below is the version neither ships.
- **Reduced motion as shipped.** Fourteen `gsap.matchMedia` blocks keyed on `(min-width: 992px)` or `(prefers-reduced-motion: no-preference)`, and a flag that swaps the route curtain for `autoAlpha` and shows sequence stills, while the first-load timeline has no branch [site:aardvarkbookclub] [verified]; the query read once and branching only the page transition [site:bleibtgleich] [verified]; Webflow IX3's `conditionalPlayback` set to `dont-animate` on 10 of 18 interactions and nothing in the custom GSAP [site:stanzza] [verified]. All three miss the Verify line somewhere.

## ScrollTrigger configurations

Why: start, end, scrub and pin values are where shipped sites differ from tutorials; this table records them as shipped.

| Use | start / end | scrub | pin or sticky | snap | Site | Confidence |
|---|---|---|---|---|---|---|
| Hero timeline: bg scale to 1.125, contours drawn, words revealed, chapter dots moved by empty tweens | `clamp(top top)` → `bottom top` | `true`, linear | none | — | [site:abatable] | [verified] |
| Card fan, the pin | trigger `.tilt-cards_pin-height`, `top top` → `bottom bottom` | `true` | `pin` on the inner contain, `anticipatePin: 1`; ≥ 768 px only, a plain stack below | — | [site:abatable] | [verified] |
| Card fan, one window per card inside the pin | `"top top-=" + d·i` → `"+=" + d`, `d = (pinHeight − innerHeight) / n`; spread 4° | `true`, on `power1.out` — an eased scrub [M03] | inside the pin | — | [site:abatable] | [verified] |
| Circle-mask statement | `top 70%` → `center center`; phone `top 95%` → `bottom 90%`; `clip-path: circle(p × 150% at 50% 120%)` | `1` | none | — | [site:abatable] | [verified] |
| Once-only reveals | `top 80%`, `once: true`, `refreshPriority: -1`; blocks already in view get duration 0 | — | none | — | [site:abatable] | [verified] |
| Card grid drop | `top 75%`, `toggleActions: 'play none none none'`; ±2–4° random start, stagger .2 on `pop` | — | none | — | [site:abatable] | [verified] |
| Split horizontal rail | `top top` → `bottom bottom`; `x: −(scrollWidth − 50vw)`, `invalidateOnRefresh`; ≥ 992 px; not on the home route | not stated | not stated | — | [site:abatable] | [verified] |
| Unboxing sequence: `onUpdate` draws frame `round(p × 119)`; on the same window the canvas rises `yPercent −25 → 0` in the first quarter (−50 below 992 px) | `top 85%` → `bottom 80%`, from data attributes | `true` | none | — | [site:aardvarkbookclub] | [verified] |
| A looping tween played only in view | `top bottom` → `bottom top`; `onEnter` / `onLeave` or `onToggle` play and pause one `repeat: −1` tween | — | none | — | [site:aardvarkbookclub] [site:bleibtgleich] | [verified] |
| Curved band: `textPath startOffset` to a measured negative % | `-40% bottom` → `60% top` | `.5` | none | — | [site:aardvarkbookclub] | [verified] |
| Section door: an even-odd polygon `clip-path` hole opens while two labels part ± 50 vw | `center center` → `top top` | `true` | none | — | [site:bleibtgleich] | [verified] |
| Webflow IX3, 18 serialised scroll interactions | per interaction; `clamp: true` on all 18; `enter: "play"`, every other action `"none"` | `.8` on 15, `1` on 2, `null` on 1 | CSS sticky | — | [site:stanzza] | [verified]; IX3 ease codes `5` ×56 and `0` ×14 map to [unknown] curves |
| Delayed-start sideways stage: `x → −145.5vw / −56vw / −95.5vw` | `top -20%` … `top -35%` → `bottom bottom`, eight windows | `.8` | CSS sticky | — | [site:stanzza] | [verified]; the rest frame before the scrub [inferred] |
| Projects timeline gated by its own progress (`#timeline-architecture`) | `top -50%` → `bottom bottom` | `.8` on `power2.inOut` — an eased scrub [M03] | none | — | [site:stanzza] | [verified] |

Neither the book club nor the portfolio sets `pin` or `snap` anywhere [site:aardvarkbookclub] [site:bleibtgleich] [verified absent]. A hand-written scrub and an IX3 interaction aimed at the same section is a double drive [site:stanzza] [verified ids; both running inferred].

## Easing as shipped

Why: named curves and CustomEase strings the corpus actually ships, beside the token set in `[pattern:motion-vocabulary#easing]`.

| Curve | String | Job | Site | Confidence |
|---|---|---|---|---|
| `osmo`, the house default | `0.625, 0.05, 0, 1` | every tween without an ease, at .6 s | [site:abatable] [site:aardvarkbookclub] [site:a24-raviklaassens]; created and used once [site:bleibtgleich] | [verified] |
| `osmoNav` | `M0,0 C0.625,0.05 0,1 1,1` — the same control points as `osmo` | one nav morph, .65 s, 4 uses | [site:why-zero] | [verified]; borrowed from a shared snippet library [inferred on both cards] |
| `parallax` | `0.7, 0.05, 0.13, 1` | route moves, 1.2 s | [site:abatable] | [verified] |
| `pop` | `M0,0 C0.17,0.67 0.3,1.33 1,1` | the one overshoot: cards dropping into a grid | [site:abatable] | [verified] |
| Named eases by count | `power2.out` 28, `power2.inOut` 11, `power2.in` 10, `power3.inOut` 5, `power3.in` 4, `osmoNav` 4, then `power3.out`, `sine.inOut`, `power1.out`, `back.out(2)`, `none` at 3 each | durations cluster at .3–.65 s; 3.5 s only for two world reveals | [site:why-zero] | [verified] |
| Named eases on a scroll site | `expo.out` on the preloader, `power2/3/4` on reveals and sliders, `none` on every scrub | — | [site:abatable] | [verified] |
| `energy` / `discGlide` | `M0,0 C0.32,0.72 0,1 1,1` — the same control points as `0.32, 0.72, 0, 1` | the curve nearly every tween names, 37 uses, though `osmo` is the default [site:aardvarkbookclub]; the disc gallery's glide [site:a24-raviklaassens] | [site:aardvarkbookclub] [site:a24-raviklaassens] | [verified] |
| `path-ease` | `0.78, 0.18, 0.18, 1` | path moves | [site:aardvarkbookclub] | [verified] |
| Elastic as the house voice | `elastic.out(1, .75)` ×21, `(1, .72)` ×17, `elastic.in(1, .72)` ×2, `elastic.out(1, .4)` ×2; `circ.out` ×10 | landed objects, headline words and button hovers alike — the hovers are the miss (`[pattern:motion-vocabulary#easing]`) | [site:aardvarkbookclub] | [verified] |
| Four named curves | `InOut 0.76,0,0.24,1`, `Out 0.25,1,0.5,1`, `In 0.5,0,0.75,0`, `Write 0.333,0,0.667,1` | `Out` 25 uses, `InOut` 20, `none` 11, `In` 6 | [site:bleibtgleich] | [verified] |
| Named reveal and route curves | `textveil .165,1,.32,1`, `pagein .645,.045,.355,1`, `linedraw .65,.05,.36,1`, `headermark .22,1,.36,1` | text reveals, route moves, line draws, the header mark | [site:agrumeafarm] | [verified] |

Rule: one slow-start, hard-arrival curve set as the default is a house style; the same string on unrelated sites is a library's (`osmo` now ships on four cards), so tune the control points before shipping it as a signature. Every ease key a tween names must exist: seven tweens pass keys the element map never defines and run on the default ease [site:stanzza] [verified keys; fallback inferred].

## SplitText choreography

Why: split type, masking and stagger decide whether a text reveal reads as authored or as a plugin default.

- **Re-split inside a scrub.** Hero paragraphs split to `words` with `autoSplit: true`, and `onSplit` returns `tl.from(words, { opacity: 0, stagger: { amount: .5 } })`, so a resize re-split rebuilds the tween inside the scrubbed timeline instead of animating detached nodes [site:abatable] [verified].
- **Heading chars.** `type: 'chars, words, lines'` with mask classes; chars opacity 0 → 1 at .03 s steps; paragraphs scale .9 → 1 over .8 s at +.4 and buttons fade at +.8, once at `top 80%` [site:abatable] [verified].
- **Line-masked slider.** `type: 'lines'`, `mask: 'lines'`, `autoSplit: true`; outgoing lines to `yPercent −110` over .6 s `power4.inOut`, stagger amount .25; incoming over .7 s, amount .4; the image opens from `inset(50%)` to `inset(0)` over .75 s [site:abatable] [verified]. Its ← / → keys are bound on `window` with `preventDefault`, which steals the arrows page-wide [site:abatable] [verified] — scope keys to the focused slider.
- **Split inside a sheet timeline.** A proxy `{ p: 0 → 1 }` over .65 s `power3.out` writes the sheet's `translateY`; `lines,words` with `mask: 'lines'`, words from `yPercent 110` over .7 s, stagger .045, `power3.out` at .35; the first field focused at `.65 × .7` s; close is a .45 s `power3.in` proxy and `revert()` [site:why-zero] [verified]. No `autoSplit` and no `document.fonts` wait [site:why-zero] [verified absent] — the miss `[recipe:split-text-masked-reveal]` closes.
- SplitText used through `SplitText.create` without `registerPlugin` [site:abatable] [verified]; it works, but register it with the rest so a tree-shaken build cannot drop it.
- **Condense, not fade: a per-line goo filter.** `SplitText` to `lines`; each line gets its own `<filter>` (box −25 % / 150 %, sRGB) of `feGaussianBlur stdDeviation 50` → `feColorMatrix` with the alpha row `20 −8`. The reveal tweens `stdDeviation → 0` over 1.2 s `Out`, lines at `i × .1`; a proxy `{ amp 20 → 1, off −8 → 0 }` on `none` writes the matrix over `.35 × 1.2` s, placed at `">-.42"` so the threshold relaxes in the blur's tail; `onComplete` clears the filter. The hide runs faster: matrix back over `.3 × .4` s, blur to 50 over .4 s `In`, lines at `i × .05` [site:bleibtgleich] [verified]. No `mask`, no `autoSplit`, no fonts wait and no reduced branch, so the reduced-motion capture shows black blobs [site:bleibtgleich] [verified]: resolve the filter before first paint under reduced motion.
- **Squash-in words.** Seventeen `new SplitText`, `words` or `words, chars`, no `mask`, no `autoSplit`, no fonts wait [site:aardvarkbookclub] [verified]; headline words from `scaleY .1`, `xPercent 40`, `rotate 8`, .875 s, stagger .088, landing on `elastic.out(1, .72)`; handwritten asides by character from `rotate 22`, `x −.25em`, `y .5em`, .75 s, stagger .016 [verified].
- **Revealed by an observer.** Chars or words from `opacity 0`, `yPercent 20`, 1.5 s, stagger .03, `power2.out`, fired by an `IntersectionObserver` at `rootMargin 0 0 -20% 0`; two classes bind the same `data-text` values and the second marks the first's targets off [site:stanzza] [verified] — one animator per attribute.

## Flip and layout state

Why: shared-element moves are the cheapest way to make two layouts read as one object.

- **Flip legs paid in scroll distance.** A helper chains `Flip.fit(target, nextWrapper, { duration: pixelOffset, ease: 'none', simple: true })` per wrapper into one timeline at `scrub: .8`, so each leg's share of the timeline equals its scroll distance and the object travels at constant speed; a parallel tween takes `borderRadius` from 100vw to 0 [site:abatable] [verified; not on the home route]. The scrubbed `Flip.from` variant is in `[pattern:motion-vocabulary#scrub-and-refresh-rules]`.
- Registered and never called: the only `Flip.` in the custom code is the registration [site:stanzza] [verified] — weight in a CDN build with no move behind it.

## Observer and gesture sections

Why: section switchers commit on a gesture, not on scroll distance; the thresholds decide whether they feel deliberate or twitchy.

- **A rotation dial that springs home.** `Draggable` with `type: 'rotation'`, bounded `0 → n`, a second element following at a mapped ratio; on release it springs to 0 over .8 s `Out`; `inertia: false` although InertiaPlugin is registered; desktop only through `gsap.matchMedia('(min-width: 992px)')` [site:bleibtgleich] [verified]. It has no keyboard twin [verified] — give it arrow keys.
- **Momentum hover.** The pointer's per-frame velocity × 25 (clamped ± 1080) and a torque term — offset crossed with velocity over the lever — × 15 (clamped ± 60°) feed `inertia: { x, y, rotation, resistance: 160 }` with `end: 0`, so an element flicks away from a fast hand and settles; fine pointers only [site:aardvarkbookclub] [verified].

## Driving GL from timelines

Why: when GSAP owns the clock, uniforms are tweened values on the same ticker, never a second loop.

- **Uniforms as tween targets.** On the zero closing, `uMelt 0 → 1.2` over 3.5 s and `uCenterWhite 0 → 1.8` over 1.4 s, both `power2.inOut`, each after a `killTweensOf` on that uniform; hover `uHoverIntensity → 1` .6 s `power2.out` and `→ 0` .4 s `power2.in` (exit faster than entrance); a fullscreen `uProgress → 1` over 1 s; a trail `uSpreadStep → .04` on `none` [site:why-zero] [verified].
- **A reveal as a charged timeline.** A brightness proxy charges over 1.2 s at `+=1.1`, a halo opacity rides `'<'`, `.call()` hands to the next beat; a 1.4 s burst tweens `uTime` on `none`, and a `delayedCall(.35)` fires the peak [site:why-zero] [verified].
- **Post presets tweened per scene.** Bloom and vignette presets move .9 s `power2.inOut` on every scene change, with GSAP core as the only tween library loaded [site:edolus] [verified values; that GSAP runs these tweens inferred]; the chain itself is in `[pattern:webgl-shaders#post-chains]`.

## Teardowns

| Site | Lens summary | Signature move | Card |
|---|---|---|---|
| Abatable | Webflow shell; GSAP 3.15 with ScrollTrigger, SplitText, CustomEase, Flip and DrawSVG, core loaded twice; Lenis on the ticker; Barba; 18 flat timelines under a CustomEase default | one scrub window per card inside one pin; Flip legs whose durations are their pixel offsets | [site:abatable] |
| Why Zero | GSAP 3.15 core + CustomEase + SplitText as a state-transition engine over a hand-rolled float; no ScrollTrigger; 8 local timelines, hand teardown | a two-phase menu timeline split by `addPause()`; shader uniforms as tween targets | [site:why-zero] |
| Aardvark Book Club | Webflow shell + one Slater file; GSAP 3.15 with ScrollTrigger, SplitText, CustomEase, InertiaPlugin and DrawSVG; Lenis on its own `autoRaf`; Barba; `osmo` defaults with `energy` and 42 elastics in practice; no pin, no snap | paused copy timelines on scrub thresholds; one stroked path that draws, then floods, as the curtain | [site:aardvarkbookclub] |
| bleibtgleich | Webflow + one Slater module; GSAP 3.15 with MorphSVG, ScrollTrigger, SplitText, CustomEase, Draggable and Inertia; Lenis on the ticker; Barba; four named curves and duration tokens; 14 flat timelines; no pin, no snap | a per-line blur-and-threshold reveal; proxy progress per carousel item | [site:bleibtgleich] |
| Stanzza | Webflow IX3 authoring 18 serialised scroll interactions beside 20 inline scripts; GSAP 3.15 with SplitText, Flip (unused) and ScrollTrigger; Lenis 1.0.33 on a separate clock; Swiper | delayed-start sticky scrubs; a carousel built and destroyed by scrub progress | [site:stanzza] |

## Recipe map

| Intent | Recipe |
|---|---|
| One ticker for Lenis and ScrollTrigger | [recipe:boot-lenis-gsap] |
| Pinned scrubbed chapter | [recipe:scroll-pin-scrub] |
| Masked line reveal | [recipe:split-text-masked-reveal] |
| Scroll-filled words | [recipe:scroll-word-fill] |
| Gesture-committed sections | [recipe:section-switcher-wheel-commit] |
| Chosen item promoted across a route | [recipe:transition-promote-chosen] |
| Route transitions | [recipe:page-transitions] |
| Frame sequence on a scrub | [recipe:image-sequence-scrub] |

## Verify

- [ ] Every motion score row names its timeline and label (`master@ch2`).
- [ ] Every timeline is created inside one `gsap.context()` or `gsap.matchMedia()` scope and reverted on teardown.
- [ ] Every scrubbed tween runs on `ease: 'none'` [M03].
- [ ] The reduced tier is a `matchMedia` branch, not a global kill [M01] [M02].

## Refuse

- A timeline per element with no master: nothing can be scored, paused or reduced as one.
- A corpus site's exact timeline, curve or label set shipped as the signature: pattern pointers, never parts.
- Two drivers on one section — a hand-written scrub and a builder interaction [site:stanzza]; an ease key that is not registered; a split-text filter with no reduced state [site:bleibtgleich].
