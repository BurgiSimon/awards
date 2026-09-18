# Motion vocabulary

What this file is for: the shared grammar of movement across the corpus — which curves, durations and staggers the award-winning sites actually use, how they feed scroll and pointer velocity into motion, which scroll model each one chose and why, and the three motion tiers every page ships. Read it before writing any tween; cite it as `[pattern:motion-vocabulary#section]`. Parameters come from the site cards and carry their confidence labels; where the corpus is silent, the plugin's own defaults are named as such.

## Contents
1. [Easing](#easing)
2. [Durations](#durations)
3. [Staggers](#staggers)
4. [Masked line reveals](#masked-line-reveals)
5. [Velocity as an input](#velocity-as-an-input)
6. [Scroll philosophies](#scroll-philosophies)
7. [Damping math](#damping-math)
8. [Scrub and refresh rules](#scrub-and-refresh-rules)
9. [Sticky stages and hinges](#sticky-stages-and-hinges)
10. [Text effects](#text-effects)
11. [Hover shifts](#hover-shifts)
12. [Reduced-motion tiers](#reduced-motion-tiers)
13. [Verify](#verify) · [Refuse](#refuse)

## Easing

Why: a site reads as one hand when every movement decelerates the same way. The corpus agrees on one family — hard deceleration for anything that arrives, a symmetric expo for anything that travels between two known states — and names those curves once, as tokens, so the cursor, the page and the canvas share a single feel [site:leo-parpeix].

| Role | Curve | Seen in | Confidence |
|---|---|---|---|
| House curve: entrances, hover, cursor | expo-out `cubic-bezier(.16,1,.3,1)` | [site:leo-parpeix], page motion and cursor on the same curve | [recalled medium], from a clone |
| Same family, older constants | `cubic-bezier(.19,1,.22,1)` | [site:floema] SCSS token; [site:the-line] hover shift | [verified], clone and reconstruction |
| Travel between two known states: shared-element flights, camera moves | expo-in-out `cubic-bezier(.87,0,.13,1)`; GSAP `expo.inOut` | [site:leo-parpeix]; [site:floema] mesh flight, 1.5 s | [recalled medium]; [verified] |
| Floema's own in-out | `cubic-bezier(.77,0,.175,1)` | [site:floema] | [verified] |
| Theme swap, whole-page repaint | `cubic-bezier(.645,.045,.355,1)`, ≈ 1 s | [site:slosh-seltzer] | [verified] at family level only; not confirmed on Slosh itself |
| Section snap after a virtual scroll settles | ease-in-out cubic, 1.4 s | [site:igloo] | [recalled medium-high], one detailed source |
| Landing with squash | Anime `outElastic(1, 1.4)` | [site:animejs] wordmark drop | [verified] |
| Liquid splash | `cubicBezier(.225, 1, .915, .98)` | [site:animejs] | [verified] |
| Drop before impact | `inQuart`, 320 ms | [site:animejs] | [verified] |
| Anything scrubbed by scroll | `'none'` | `[recipe:scroll-pin-scrub]` | plugin rule |

Rules:
- Name two or three curves as tokens (`--ease-out-expo`, `--ease-in-out-expo`, `--ease-theme` in `_shared/tokens.css`) and use nothing else. Default `ease` and `linear` are tells; `linear` is only right under a scrub.
- Elastic and back curves belong to one landing the story earns (a wordmark, a dropped object), never to UI feedback.
- Anime.js composes curves from strings — `'outExpo'`, `'inOutQuint'`, `'outElastic(1, 1.4)'`, `'in(2)'`, `'steps(10)'` — built on one power primitive [site:animejs] [verified]. Map the tokens above onto those strings rather than adding a fourth family.
- The theme-swap curve is symmetric on purpose: a repaint has no "arrival", so it must not decelerate like an entrance [site:slosh-seltzer] (family-level).

## Durations

Why: duration tells the visitor what kind of event just happened. The corpus keeps three bands apart, and one site sets a single unit for its hero moments: Floema uses 1.5 s for the colour tween, the mesh flight and the preloader exit, so every big beat carries the same weight [site:floema] [verified].

| Band | Range | Evidence |
|---|---|---|
| Feedback (hover, press, toggle) | ≤ .3 s; token `--dur-feedback` 160 ms | impact morphs of 60–140 ms followed by a 180–340 ms settle [site:animejs] [verified] |
| Routine (reveals, menu items, cards) | ≈ .4 s; token `--dur-routine` | plugin default; no card publishes a routine duration |
| Hero-scale (preloader exit, shared-element flight, chapter cut) | 1.2–1.5 s; token `--dur-hero` 1400 ms | 1.5 s [site:floema] [verified]; 1.4 s hero lines in `[recipe:boot-lenis-gsap]`; 1 s wordmark settle on `outExpo` [site:animejs] |
| Theme swap | ≈ 1 s [site:slosh-seltzer] (family-level) to 1.5 s [site:floema] | both tween `documentElement` colours |
| Section snap (virtual scroll) | 1.4 s | [site:igloo] [recalled medium-high] |
| Counter tick | one jump per 100 ms | [site:leo-parpeix] [recalled medium] |
| Hold at 100 % | ≈ 1 s before the exit | [site:floema] [verified] |

Rules:
- Exits are faster than entrances. Floema sends the counter out on a shorter travel (`y: '100%'`) than the titles (`y: '150%'`) inside one timeline [site:floema]; the Anime.js outro drops its letters with a tighter stagger (30 ms) than the pop that brought them in (80 ms) [site:animejs].
- Spend 1.2–1.5 s on one moment per chapter. On a hover it reads as lag.
- Lama Lama publishes no numbers; the 1.2–1.5 s hero and .06–.1 s stagger on that card are the plugin's defaults, not the site's [site:lama-lama].

## Staggers

Why: a stagger turns a block into a sequence the eye can follow; too wide and the last line lands after reading has started.

| Unit | Step | Seen in |
|---|---|---|
| Lines or words of a heading | .06–.1 s | 0.1 s on preloader titles [site:floema] [verified]; .09 s in `[recipe:boot-lenis-gsap]` |
| Letters of a wordmark | 80 ms from the centre | [site:animejs] [verified] |
| Flicker glyphs | ≈ .04 s baked into the keyframe `times` | [site:the-line] [verified] |
| Scramble characters | 30 ms from the centre, eased | [site:animejs] [verified] |
| Duplicate-char hover roll | 5 ms per char | [site:animejs] [verified] |
| Onion-skin trail clones | 18 ms per clone, opacity 1 → .4 | [site:animejs] [verified] |

Rule: keep `count × step` under ≈ .6 s for text blocks; use `from: 'center'` or `'last'` when the block has a focal glyph. Stagger by a data attribute (`data-line`, `data-char`) so word and line rhythms nest [site:animejs].

## Masked line reveals

Why: a line rising out of a clipped box reads as typesetting rather than a fade; it is the corpus's default entrance for headings.

- Travel: `y: '150%'` → 0 on `expo.out` over 1.5 s, stagger 0.1 [site:floema] [verified]; `yPercent: 120` over 1.4 s, stagger .09 in `[recipe:boot-lenis-gsap]`. Anything beyond 100 % exists to clear descenders when the line-height sits below 1.
- Lines are found by measuring: Floema wraps units in spans and buckets them by `offsetTop` [site:floema]; GSAP `SplitText` with `mask: 'lines'` does the same in `[recipe:split-text-masked-reveal]`; Anime's `splitText` builds a clipped wrapper with an inert clone at ±100 % [site:animejs] [verified].
- Split only after `document.fonts.ready` and re-split on resize: Lando re-runs SplitText after font load so a fallback face cannot shred the lines [site:lando-norris] [verified]; Anime's `.addEffect()` survives a re-split [site:animejs].
- Two text systems, split by role — a masked reveal for headings, a per-character wave or scramble for accents — never both on one element [site:mindmarket].
- Split spans are not readable text; keep an accessible copy (`aria-label` or a visually hidden original) [site:animejs]. Reduced tier: opacity only, ≤ .4 s.

## Velocity as an input

Why: motion that answers how fast the visitor moves feels physical; motion that plays identically at any speed feels canned. Three sites make speed a first-class uniform.

| Effect | Formula / parameters | Site | Confidence |
|---|---|---|---|
| Bulge on drag | `z -= (sin(y/H·π + π/2) + sin(x/W·π + π/2)) · abs(uSpeed)` in the vertex stage; `uSpeed = scroll.current − scroll.last`, eased back to 0 at rest; fragment stage stays a plain texture lookup | [site:floema] | [verified], clone shader |
| Fluid wake | pointer delta × 10 splatted into a 128² ping-pong velocity FBO, radius .0015 at rest → .002 moving, dissipation .96, advection only; read by one post pass: UV distortion .0035, velocity scale 1.5, chromatic aberration ± velocity × .001 | [site:leo-parpeix] | [recalled medium-high], clone |
| Marquee speed | rAF translate with wraparound, so speed can follow scroll velocity instead of a fixed keyframe rate | [site:seasats] (clone-described); `[recipe:marquee-raf-mask]` | [recalled medium] |
| Carousel drift | auto-speed tweened to 0 on grab and back to 2 on release (500 ms each); wheel input lerped at .2 into the same value | [site:animejs] | [verified] |
| Hero inertia | drag momentum with lighting that answers the object's motion; no numbers published | [site:oryzo] | [recalled high], parameters unknown |

Rules: compute speed per frame from the smoothed value, never from raw wheel deltas; clamp it; lerp it back to zero so the effect settles; put the character in the vertex stage and keep the fragment stage trivial [site:floema]. The Floema bulge and its grid-to-detail flight are the most-cloned moves on the web — take the architecture and design your own displacement `[recipe:gl-dom-tethered-planes]` `[recipe:gl-fluid-wake-post]`.

## Scroll philosophies

Why: smooth scroll is a decision with costs — scroll restoration, find-in-page, keyboard, assistive tech — not a plugin you add. The corpus shows five models; choose one per project and write it into the direction contract.

| Model | Mechanism | Seen in | Use when |
|---|---|---|---|
| (a) Native + Lenis + ScrollTrigger | Lenis driven from `gsap.ticker` with `lagSmoothing(0)`; Lenis feeds `ScrollTrigger.update` | [site:leo-parpeix] Lenis ^1.1 [recalled medium]; [site:lando-norris] Lenis 1.1.20 + GSAP 3.13 [verified]; [site:mont-fort] [verified] | the default for any page that reads; the document stays scrollable `[recipe:boot-lenis-gsap]` |
| (b) Studio abstraction | `@bsmnt/scrollytelling` (`Root`, `Animation`, `Waypoint`, `Parallax`, `ImageSequenceCanvas`) on top of ScrollTrigger | [site:usavionix] [inferred medium, the studio's house stack] | React teams authoring many scroll scenes |
| (c) Hand-rolled lerp | wheel → `target`; `current = lerp(current, target, .1)`; `translateY` on a wrapper; target clamped to `[0, limit]` | [site:floema] [verified] | small sites whose GL layer must read the smoothed value; costs the native scrollbar and restoration |
| (d) Virtual float | wheel and touch update a target that eases; one 0–1 progress drives everything, which is what makes gates, holds and redirects possible | [site:why-zero] [verified]; [site:igloo] wheel × .1 → friction .97 → double lerp .075 then .15 → 1.4 s snap → modulo wrap [recalled medium-high] | only when the page is a world with gates or holds `[recipe:gl-virtual-scroll-camera]` |
| (e) Native + DOM-tethered canvas | native scroll; the canvas is `position: absolute` and re-offset every rAF to the scroll position, with ≈ 25 % over-render against clipping | [site:oryzo] [verified technique; use on the site inferred] | GL planes anchored to DOM elements, zero scroll-jacking |
| Variants | section switcher: scroll moves between composited GL sections [site:slosh-seltzer] [verified]; scroll-linked timelines via `onScroll({ sync })` [site:animejs] [verified] | | short loops; docs-style set-pieces |

Rules: never two smooth-scroll libraries; never CSS `scroll-behavior: smooth` beside Lenis; (c) and (d) must still answer keys and expose progress (`[pattern:accessibility-and-reduced-motion#scroll-jacking-rules]`). The double lerp in (d) is what makes weight feel responsive — one slow lerp on the input, a faster one on the camera reading it [site:igloo].

## Damping math

Why: a per-frame `lerp(current, target, .1)` runs 2.4× faster at 144 Hz than at 60 Hz. Every constant in the corpus (Floema's .1, Igloo's .075 / .15 and friction .97, Léo Parpeix's cursor .75 / .22) was tuned at 60 fps and drifts on other displays.

```js
// _shared/raf.js — identical feel at any refresh rate
const damp = (current, target, k, dt) => lerp(current, target, 1 - Math.exp(-k * dt));
// k ≈ 6–10 feels like a .1 lerp at 60 fps; dt is clamped to .1 s so a hidden tab cannot jump
```

Convert a 60 fps lerp `l` with `k = −60 · ln(1 − l)`: .1 → ≈ 6.3, .15 → ≈ 9.7, .22 → ≈ 14.9, .75 → ≈ 83. Igloo describes its own smoothing as exponential, framerate-independent damping [site:igloo]; Lenis applies the same exponential form to its `lerp` option (check the pinned version's source). Run one ticker for the whole page (`_shared/raf.js` or `gsap.ticker`), pause it when the tab is hidden, and read `dt` from it everywhere.

## Scrub and refresh rules

- Scrubbed tweens use `ease: 'none'`; the smoothing already lives in Lenis or in `scrub: 0.4` (`[recipe:scroll-pin-scrub]`). Anime's equivalent is `sync: .5` on `onScroll` [site:animejs].
- Scroll writes into a ref or a uniform read inside the render loop, never into framework state; the Shopify sibling release keeps camera, transitions and post parameters this way so the DOM and the scene stay locked [site:shopify-editions-w26] [recalled high for the sibling].
- A scroll multiplier is the cheapest scrub: `rotation.y = scrollY × 0.00015` [site:leo-parpeix] [recalled medium].
- Call `ScrollTrigger.refresh()` after `load`, after `document.fonts.ready` and after any media that changes layout; set `invalidateOnRefresh` on tweens that read sizes. A vw-locked layout needs no JS resize work at all [site:the-line].

## Sticky stages and hinges

Why: `pin: true` inserts spacer elements and fights the native scroll; a `position: sticky` visual under a tall transparent rail gives the same hold with the document intact. The Line does exactly this and never pins [site:the-line] [verified] `[recipe:sticky-stages-rails]`. Pin + scrub remains acceptable inside one chapter whose media must be scrubbed frame by frame — the corpus example is a canvas frame sequence, not a pin [site:seasats] [verified, live source 2026-09-18] `[recipe:scroll-pin-scrub]`. Son Daven, previously cited here, ships 23 scrubbed triggers and zero `pin:`; its holds are CSS sticky [site:son-daven] [verified, live source 2026-09-18]; Shopify keeps a sticky scene layer per section with static media beneath it [site:shopify-editions-w26] [recalled medium-low].

The hinge [site:the-line] [verified]: a full-viewport panel and its logo layer, both `transform-origin: bottom left`, translate `x: 0 → −10 %` and rotate `0 → −15°` across the hero's scroll range. Generalised rule (medium confidence as a generalisation): hinge 4–15° on a *named* corner, and let the child rotate harder and lag the parent so the sheet shears instead of moving as one rigid block.

## Text effects

- **Flicker** [site:the-line] [verified]: per-letter opacity ladder `[0, 1, 0, 0, 1, 1]` with a `times` array staggered ≈ .04 s per glyph; runs once on mount and again on pointer enter. The non-monotonic ladder is what reads as a tube striking `[recipe:flicker-text]`.
- **Scramble decode**: Igloo offsets glyphs inside an MSDF atlas so nothing reflows [site:igloo] [recalled high]; Anime's `scrambleText` separates `revealRate` (60/s), `settleDuration` (300 ms) and `settleRate` (30/s) and ships block cursors such as `'░▒▓█'` [site:animejs] [verified] `[recipe:scramble-decode-text]`. The logo tagline runs the same idea as a `textContent` tween over a character table, 800 ms `inOutExpo` [site:animejs].
- **Squash and stretch on a wordmark** [site:animejs] [verified]: per-axis keyframes — `translateY` up 190 ms, hold 120 ms, settle 120 ms; `scaleY` overshoots to 1.5, drops to .6, rebounds to 1.2, settles at 1 — a starting rhythm, not a preset.

## Hover shifts

- Whole-line `x` shift by a vw-locked amount on expo-out [site:the-line] [verified].
- Duplicate-char roll: clone each char to the left inside a clipped wrapper, then stagger `x: '100%'` at 5 ms per char [site:animejs] [verified].
- Cursor answer: ring scales 1.35×, dot shrinks to .7×, ring opacity .35 → .8 [site:leo-parpeix] [recalled medium] — see `[pattern:cursor-and-pointer#two-speed-cursor]`.
- `composition: 'blend'` lets a hover offset and a scroll offset on the same property coexist [site:animejs] [verified]; in GSAP, drive the pointer part with `quickTo` `[recipe:magnetic-button]`.

Rules: ≤ 300 ms, transform and opacity only, and `:focus-visible` triggers the same state as hover.

## Reduced-motion tiers

Why: no card in the corpus documents a reduced-motion path — Floema and the Anime.js source verifiably have none [site:floema] [site:animejs], Léo Parpeix appears to have none [site:leo-parpeix], and the rest are unknown. Shipping tiers is where new work beats the reference set (`[pattern:accessibility-and-reduced-motion#motion-tiers]`).

| Tier | Trigger | Keeps | Drops |
|---|---|---|---|
| full | `(prefers-reduced-motion: no-preference)` | the authored score | — |
| reduced | `(prefers-reduced-motion: reduce)` | state changes, hierarchy, opacity and colour steps (`--dur-feedback` 0, `--dur-routine` 120 ms, `--dur-hero` 200 ms), instant scroll positions | spatial travel, parallax, velocity uniforms, marquees, autoplaying loops; the theme swap becomes an instant or ≤ 300 ms repaint |
| static | `data-motion="static"` on `<html>` (lowest quality tier, or set explicitly) | everything settled on load: the final frame, one still per chapter | all animation |

Decide the tier once through `gsap.matchMedia()` with both conditions, as `[recipe:boot-lenis-gsap]` does, or `createScope({ mediaQueries })` in Anime [site:animejs]; expose it as `data-motion-tier` on `<html>` from `_shared/reduced-motion.js` so CSS can branch `[recipe:reduced-motion-switch]`. Scope any CSS kill to `[data-motion="spatial"]`; a global `* { animation: none !important }` also removes the state changes the reduced tier depends on.

## Verify

- [ ] Two or three named easing tokens; no default `ease`, no `linear` outside scrubs.
- [ ] Feedback ≤ .3 s; hero moments 1.2–1.5 s and at most one per chapter; staggers .06–.1 s for text, ≈ .04 s for flicker.
- [ ] Masked reveals split after `document.fonts.ready`, re-split on resize, with an accessible text copy.
- [ ] Every per-frame lerp is `1 − exp(−k·dt)` on one shared ticker that pauses when hidden.
- [ ] Scrubbed tweens are `ease: 'none'`; `ScrollTrigger.refresh()` runs after fonts and media.
- [ ] One scroll model, named in the direction contract; keys and progress work under (c) and (d).
- [ ] Sticky + rail preferred to `pin: true`; hinges use a named origin with a lagging child.
- [ ] Three motion tiers through `matchMedia`, visible in `state().motion`; the reduced tier still shows every state.

## Refuse

- Fade-up-everything at 400 ms on default easing; bounce or elastic on buttons.
- Two smooth-scroll libraries, or Lenis beside CSS smooth scrolling.
- Virtual scroll on a page that is a document; virtual scroll that ignores PageDown, arrows and Space.
- A raw wheel delta as an effect input; per-frame constants tuned at 60 fps and shipped as-is.
- Eased scrubs (`ease: 'power2'` under `scrub`) that fight the scroll.
- Split text without an accessible copy; marquees and flickers that keep running under `prefers-reduced-motion`.
- A global animation kill presented as the reduced-motion path.
- The Floema bulge or its grid-to-detail flight reproduced as a signature.
