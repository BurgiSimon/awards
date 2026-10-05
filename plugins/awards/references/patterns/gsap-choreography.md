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

- **Flat timelines, no master.** Eighteen `gsap.timeline` calls whose children are tweens, `Flip.fit` results and empty callback tweens that move the hero's current-chapter dot; one label pair, `startEnter` / `pageReady`, gates the router's enter promise [site:abatable] [verified count and labels; no nesting inferred]. Eight timelines local to one moment each (loader hand-off, sheet, nav, a morph, a scene reveal), 63 `to`, 0 `addLabel` [site:why-zero] [verified counts; no master inferred]. Neither has a master to score, pause or reduce — the Refuse line below, shipped twice.
- **GSAP beside a clock it does not own.** The narrative float is hand-rolled (`SCROLL_LERP .075`, gate auto-scroll on a written smoothstep `n²(3 − 2n)`), `gsap.ticker` is used once, and GSAP only animates what happens at the float's thresholds and in the HUD; no ScrollTrigger is registered [site:why-zero] [verified]. Where Lenis runs, it rides the GSAP ticker: `lenis.on('scroll', ScrollTrigger.update)`, `lenis.raf(time * 1000)`, `lagSmoothing(0)` [site:abatable] [verified] `[recipe:boot-lenis-gsap]`.
- **Two-phase interruptible timeline.** One paused timeline holds the open half, then `addPause()` at its duration `I`, then the close half; close calls `tl.time() < I ? tl.reverse() : tl.play()`, so a close mid-open rewinds instead of jumping. Open: shell on a custom ease .65 s at 0, burger bars `back.out(2)` .4 s at .05, items `yPercent 100 → 0` .6 s stagger .03 at .1; close: items .25 s, stagger `{ each: .01, from: 'end' }`, shell `power3.inOut` .45 s at `'<'` [site:why-zero] [verified]. One object holds both directions, so a fast double click cannot leave the menu half-built.
- **Defaults as the house style.** `gsap.defaults({ ease: 'osmo', duration: .6 })` with `staggerDefault .05`, so an unannotated tween already speaks the house curve [site:abatable] [verified] (`#easing-as-shipped`).
- **Teardown.** By hand: 48 `killTweensOf`, `tl.kill()` on reruns, SplitText `revert()` on close, no `gsap.context()` or `gsap.matchMedia()`, and no tween with a reduced branch [site:why-zero] [verified]. `gsap.matchMedia` gating nav, parallax, the fan (≥ 768) and a rail (≥ 992), with reduced motion read only by route transitions and testimonials [site:abatable] [verified]. The Verify list below is the version neither ships.

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

## Easing as shipped

Why: named curves and CustomEase strings the corpus actually ships, beside the token set in `[pattern:motion-vocabulary#easing]`.

| Curve | String | Job | Site | Confidence |
|---|---|---|---|---|
| `osmo`, the house default | `0.625, 0.05, 0, 1` | every tween without an ease, at .6 s | [site:abatable] | [verified] |
| `osmoNav` | `M0,0 C0.625,0.05 0,1 1,1` — the same control points as `osmo` | one nav morph, .65 s, 4 uses | [site:why-zero] | [verified]; borrowed from a shared snippet library [inferred on both cards] |
| `parallax` | `0.7, 0.05, 0.13, 1` | route moves, 1.2 s | [site:abatable] | [verified] |
| `pop` | `M0,0 C0.17,0.67 0.3,1.33 1,1` | the one overshoot: cards dropping into a grid | [site:abatable] | [verified] |
| Named eases by count | `power2.out` 28, `power2.inOut` 11, `power2.in` 10, `power3.inOut` 5, `power3.in` 4, `osmoNav` 4, then `power3.out`, `sine.inOut`, `power1.out`, `back.out(2)`, `none` at 3 each | durations cluster at .3–.65 s; 3.5 s only for two world reveals | [site:why-zero] | [verified] |
| Named eases on a scroll site | `expo.out` on the preloader, `power2/3/4` on reveals and sliders, `none` on every scrub | — | [site:abatable] | [verified] |

Rule: one slow-start, hard-arrival curve set as the default is a house style; the same string on two unrelated sites is a library's, so tune the control points before shipping it as a signature.

## SplitText choreography

Why: split type, masking and stagger decide whether a text reveal reads as authored or as a plugin default.

- **Re-split inside a scrub.** Hero paragraphs split to `words` with `autoSplit: true`, and `onSplit` returns `tl.from(words, { opacity: 0, stagger: { amount: .5 } })`, so a resize re-split rebuilds the tween inside the scrubbed timeline instead of animating detached nodes [site:abatable] [verified].
- **Heading chars.** `type: 'chars, words, lines'` with mask classes; chars opacity 0 → 1 at .03 s steps; paragraphs scale .9 → 1 over .8 s at +.4 and buttons fade at +.8, once at `top 80%` [site:abatable] [verified].
- **Line-masked slider.** `type: 'lines'`, `mask: 'lines'`, `autoSplit: true`; outgoing lines to `yPercent −110` over .6 s `power4.inOut`, stagger amount .25; incoming over .7 s, amount .4; the image opens from `inset(50%)` to `inset(0)` over .75 s [site:abatable] [verified]. Its ← / → keys are bound on `window` with `preventDefault`, which steals the arrows page-wide [site:abatable] [verified] — scope keys to the focused slider.
- **Split inside a sheet timeline.** A proxy `{ p: 0 → 1 }` over .65 s `power3.out` writes the sheet's `translateY`; `lines,words` with `mask: 'lines'`, words from `yPercent 110` over .7 s, stagger .045, `power3.out` at .35; the first field focused at `.65 × .7` s; close is a .45 s `power3.in` proxy and `revert()` [site:why-zero] [verified]. No `autoSplit` and no `document.fonts` wait [site:why-zero] [verified absent] — the miss `[recipe:split-text-masked-reveal]` closes.
- SplitText used through `SplitText.create` without `registerPlugin` [site:abatable] [verified]; it works, but register it with the rest so a tree-shaken build cannot drop it.

## Flip and layout state

Why: shared-element moves are the cheapest way to make two layouts read as one object.

- **Flip legs paid in scroll distance.** A helper chains `Flip.fit(target, nextWrapper, { duration: pixelOffset, ease: 'none', simple: true })` per wrapper into one timeline at `scrub: .8`, so each leg's share of the timeline equals its scroll distance and the object travels at constant speed; a parallel tween takes `borderRadius` from 100vw to 0 [site:abatable] [verified; not on the home route]. The scrubbed `Flip.from` variant is in `[pattern:motion-vocabulary#scrub-and-refresh-rules]`.

## Observer and gesture sections

Why: section switchers commit on a gesture, not on scroll distance; the thresholds decide whether they feel deliberate or twitchy.

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

## Verify

- [ ] Every motion score row names its timeline and label (`master@ch2`).
- [ ] Every timeline is created inside one `gsap.context()` or `gsap.matchMedia()` scope and reverted on teardown.
- [ ] Every scrubbed tween runs on `ease: 'none'` [M03].
- [ ] The reduced tier is a `matchMedia` branch, not a global kill [M01] [M02].

## Refuse

- A timeline per element with no master: nothing can be scored, paused or reduced as one.
- A corpus site's exact timeline, curve or label set shipped as the signature: pattern pointers, never parts.
