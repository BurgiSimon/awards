# Aardvark Book Club — https://www.aardvarkbookclub.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | e-commerce — a monthly hardcover subscription (pick up to three new releases, shipped to the USA and Canada), with gifting, merch and an app [verified, index.html meta description; desktop-s00.png] |
| Visitor mode | persuade — a log-in / sign-up action in the nav and the hero, "Add to box!" on every book card, a promo-code band [verified, desktop-s00.png, desktop-s75.png, desktop-s100.png] |
| Awards | Awwwards **Site of the Day, 30 Aug 2026, 7.2**: D 7.13 / U 7.16 / C 7.38 / Co 7.26. **DEV 6.82**: Semantics/SEO 6.80, Animations 7.20, Accessibility 6.80, WPO 6.60, Responsive 6.80, Markup 6.80 [verified, entry page, `entry/entry.html`] |
| Corpus rating | D 7.0 / U 6.2 / C 6.8 / Co 7.0 → weighted 6.72, 2026-10-05 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | FUTURE THREE®, Eduard Bodak, Dylan Brouwer [verified, entry page]; footer credits "Design by Dylan", "Development by Future Three" [verified, desktop-s100.png] |
| Stack (evidence level) | **Webflow** (`data-wf-site`, `webflow.*.js`, jQuery 3.5.1) [verified, index.html] · custom code served from **Slater** (`slater.app/18601/54937.js`, one 139 KB file) [verified, index.html; slater.js] · **GSAP 3.15** + ScrollTrigger, SplitText, CustomEase, InertiaPlugin, DrawSVGPlugin from jsdelivr `@3.15` [verified, index.html URLs; slater.js `registerPlugin`] · **Lenis 1.3.17** [verified, index.html] · **Barba core 2.10.3** + prefetch 2.2.0 [verified, index.html] · **smooothy 0.0.35** sliders [verified, index.html; slater.js `extends Smooothy`] · MiniSearch 7.1.2 [verified, index.html] · frame sequences on a Bunny CDN host [verified, index.html `b-cdn.net`] · fonts: Champ, Degular, Hello Organichand [verified, webflow.css `@font-face`] |
| Palette | theme-per-section: flat candy grounds swapped section by section, black ink, one hot magenta for actions [verified, section classes `is--bg-yellow`, `is--bright-pink`, `is--bg-soft-pink`; captures] |
| | hero ground, `--yellow` |
| | `#ffd24a` [verified, webflow.css] |
| | blob and nav-CTA orange, `--orange` |
| | `#f9a220` [verified, webflow.css] |
| | genre wall ground, `--bright-pink` |
| | `#fd48f2` [verified, webflow.css] |
| | CTA fill, `--magenta` |
| | `#ff008c` [verified, webflow.css]; role [inferred, desktop-s00.png] |
| | unboxing stage ground, `--pale-blue` |
| | `#a4f6f8` [verified, webflow.css]; role [inferred, desktop-s25.png] |
| | footer ground, `--violet` |
| | `#3b308f` [verified, webflow.css]; role [inferred, desktop-s100.png] |
| | 24 named colour tokens in all, each hue in pale / soft / full steps [verified, webflow.css] |
| Type | chunky rounded display + geometric grotesque body + handwritten marginalia: **Champ** for headlines, **Degular** for body and UI, **Hello Organichand** for scribbled side notes [verified, webflow.css; desktop-s00.png]. A vw-locked root: `--size-font` from a 1920 / 834 / 550 ideal container [verified, slater.css] |
| WebGL dosage | none — two canvases, both 2D frame-sequence players (`getContext('2d')`) [verified, slater.js; manifest.json `canvases: 2`]. The "custom 3D" the entry names is pre-rendered [inferred] |
| Scroll model | native + Lenis 1.3.17 (`lerp .2`, `autoRaf: true`, `anchors: true`) on its own clock, `lenis.on('scroll', ScrollTrigger.update)`; the GSAP-ticker hookup is commented out [verified, slater.js] |
| Narrative model | single-object launch — the subscription box recurs as the object: hero → monthly picks rail → how it works → scrubbed unboxing → genre wall → FAQ → gift box → exclusive → footer box [verified, index.html headings and section classes] |

## 1. Concept and narrative
A book club that sells the unboxing. The page treats the shipping box as the product: it tumbles in the hero on phones, opens under scroll in a pale stage mid-page, drops in as the gift, and slides into the footer [verified, mobile-s00.png, desktop-s25.png, desktop-s75.png, desktop-s100.png]. Around it the tone is loud and chatty: candy grounds, a huge rounded headline, and handwritten asides in the margins ("Shipping to the USA & Canada") [verified, desktop-s00.png].

Beats seen: the yellow hero with flying hardcovers over layered blobs [verified, desktop-s00.png]; the box opening on a pale-blue rounded stage [verified, desktop-s25.png]; a magenta wall of genre names at poster size [verified, desktop-s50.png]; gifting with press logos and a slanted promo band [verified, desktop-s75.png]; an exclusive-anthology card, then a violet footer with app badges and a mailing-list form [verified, desktop-s100.png].

## 2. Structure and components
- **First-load curtain**: an SVG stroke unwinds off the screen while the round logo pops in and out on elastic eases; the header drops at ≈ 1.6 s, then the hero ground opens by an ellipse `clip-path` from the bottom right (≥ 992 px) [verified, slater.js `runPageOnceAnimation`]. No `sessionStorage` or `localStorage` skip [verified absent, slater.js].
- **Route transition**: Barba with `sync: true`; the same stroke is drawn across the viewport and then widened until it floods it [verified, slater.js] (§5 lens).
- **Nav**: centred pill links plus an orange split CTA, a UK-store pill and social icons; on phones a single Menu button [verified, desktop-s00.png, mobile-s00.png]. The pills stay fixed over content and collide with headings and cards [verified, desktop-s50.png, desktop-s100.png].
- **Books rail**: monthly picks in a smooothy slider with per-item parallax, desktop only (`lerpFactor .225`, `dragSensitivity .008`, `bounceLimit .5`, no snap) [verified, slater.js `initBooksSlider`].
- **Unboxing stage**: a 120-frame WebP sequence scrubbed by scroll, with handwritten copy and a final line that play and reverse at progress thresholds [verified, index.html `data-frames="120"`; slater.js].
- **Genre wall**: genre names stacked at display size; hovering one swaps it to the handwritten face, nudges its neighbours through CSS `:has()` and sibling rules, and pops book covers whose position follows the pointer through CSS custom properties [verified, slater.css `.genre__list-item:hover+…`; slater.js `initGenreInteraction`; desktop-rm-s50.png].
- **Momentum hover**: elements flick away from a fast pointer and settle back (§5 lens) [verified, slater.js `initMomentumBasedHover`].
- **Curved promo band**: an SVG `textPath` slides along a slanted ribbon as you scroll [verified, slater.js `initTaglineCurve`; desktop-s75.png].
- **Emoji rain**: emoji burst from a card when it enters scrolling down, removed after 2.75 s, off under reduced motion [verified, slater.js `createRain`, `prefers-reduced-motion: no-preference`].
- **FAQ** accordion, **gift**, **Members' Choice** badges and an **exclusive** slider, then the **footer** with a parallaxed box (`scrub .2`), app-store badges and a validated form [verified, index.html; slater.js].
- 404, cart and book routes: [unknown], not visited.

## 3. Visual language
- Every section owns a flat ground, and every ground is a step from one 24-token ramp (pale / soft / full of each hue) [verified, webflow.css]. Ink stays black. The magenta action colour repeats on every button, so conversion is never lost among the grounds [verified, captures].
- Layered organic blobs in two or three tints of the section's hue form the ground under the hero; their strokes slowly thicken and thin [verified, desktop-rm-s00.png; slater.js `initBackgroundAnimation`].
- Type has three voices with fixed jobs: rounded display for claims and names, grotesque for reading, a handwriting face for asides placed off the grid at a tilt [verified, desktop-s00.png, desktop-s50.png].
- Imagery is product shots: hardcovers, the printed box and real book jackets. Rounded section cards (≈ 60 px radius) nest inside a white page [verified, desktop-s25.png, desktop-s100.png].
- Browser surfaces: no `theme-color`, no `color-scheme` [verified absent, index.html].

## 4. Motion and effects (with parameters)
- **House voice is elastic.** 42 elastic eases in the bundle: `elastic.out(1, 0.75)` × 21, `elastic.out(1, 0.72)` × 17, `elastic.in(1, 0.72)` × 2, `elastic.out(1, 0.4)` × 2 [verified, slater.js]. Everything else runs on `energy` (37 uses) or `circ.out` (10) [verified, slater.js].
- **Hero headline**: words squash in from a sliver (`scaleY .1`, `xPercent 40`, `rotate 8`) to rest on `elastic.out(1, .72)`, .875 s, stagger .088 [verified, slater.js].
- **Handwritten asides**: characters from `rotate 22`, `x −.25em`, `y .5em`, .75 s `elastic.out(1, .75)`, stagger .016 [verified, slater.js].
- **Hero sequence**: a 120-frame, 24 fps loop that plays only while the hero is in view (`onEnter` / `onLeave` toggle one repeating tween) [verified, index.html `data-fps="24"`; slater.js].
- **Unboxing scrub**: `top 85%` → `bottom 80%`, `scrub: true`; the canvas rises `yPercent −25 → 0` in the first quarter (−50 below 992 px) [verified, index.html; slater.js].
- **Pop-ins**: gift `rotate 30 → −21`, `scale 0 → 1`, .95 s; benefit cards from a random ±33°, stagger .072; badges `rotate −20 → 11`, .7 s — all `elastic.out`, once [verified, slater.js].
- **Button hover**: characters dip on keyframes (`yPercent 55`, `scaleY .3` at 20 %, then `elastic.out(1, .4)`), .725 s, stagger amount .225; the same plays on `:focus-visible` [verified, slater.js].
- **Blob ground**: SVG path `stroke-width 0 → 60` (35 on small) and `rotate 2`, 3 s `sine.inOut` yoyo, paused off-screen [verified, slater.js].
- Lenis `lerp .2` [verified, slater.js].

## 5. Tech and pipeline
| Layer | Evidence |
|---|---|
| Webflow + jQuery 3.5.1; custom JS and CSS from Slater | [verified, index.html] |
| GSAP 3.15 + 5 plugins, all from jsdelivr | [verified, index.html; slater.js] |
| Lenis 1.3.17, Barba 2.10.3 + prefetch 2.2.0, smooothy 0.0.35, MiniSearch 7.1.2 | [verified, index.html] |
| 2D-canvas frame players, WebP frames on Bunny CDN | [verified, slater.js; index.html] |

- **Frame weights**: the hero's frame 000 is 223 KB; the box's frame 000 is 33 KB and frame 060 is 125 KB; the phone set's frame 000 is 20 KB [verified, `curl -sI` content-length]. 120 frames per sequence puts the hero near 25 MB and the box near 10 MB on desktop [inferred from those headers].
- **Coarse-to-fine loading**: frame 0 is drawn first, then the last frame, then midpoints by bisection, one request at a time. Until a frame arrives, the nearest loaded one within ±10 is drawn. Frames become `ImageBitmap`s, and all of them stay held until teardown [verified, slater.js `processQueue`, `findNearestLoaded`, `createImageBitmap`].
- Separate phone frames at `max-width: 767px`; DPR uncapped on the canvases (`devicePixelRatio || 1`) [verified, slater.js].
- Teardown on every Barba route: destroy functions per sequence, `close()` on bitmaps, triggers killed [verified, slater.js].
- No console errors; one failed request: the hero's reduced-motion still points at the bare prefix `frame_` and is blocked (ORB) [verified, manifest.json, index.html `data-static-src`]. The cold `lcpColdSynthetic` of 57 s is a headless artefact, not a performance claim.

### Tech lens: GSAP
- **Registration**: `ScrollTrigger, SplitText, CustomEase, InertiaPlugin, DrawSVGPlugin`; version from the CDN path `gsap@3.15` (banner not read) [verified, slater.js; index.html].
- **Defaults**: `gsap.defaults({ ease: "osmo", duration: .6 })`, `staggerDefault .05` [verified, slater.js]. The same `osmo` string `0.625, 0.05, 0, 1` and defaults ship on [site:abatable] [verified on both], so a shared snippet library is likely [inferred].
- **CustomEase**: `osmo` `0.625, 0.05, 0, 1`; `path-ease` `0.78, 0.18, 0.18, 1`; `energy` `M0,0 C0.32,0.72 0,1 1,1` [verified, slater.js]. Though `osmo` is the default, nearly every tween names `energy` or an elastic [verified, ease counts].
- **Timelines**: 14 `gsap.timeline`, 0 `addLabel`; the load and route timelines position on the implicit string labels `"start"`, `"start+=1.1"` and `"startLeave"` [verified, slater.js]. No master or nested timeline found [inferred].
- **Keyframes as the shape tool**: 14 `keyframes` objects keyed by percentage with per-key eases. For example, a word from `scaleY .1` jumps to opacity 1 at 10 % and lands at 100 % on `elastic.out(1,.72)` [verified, slater.js].
- **Stroke-flood curtain**: one SVG path set to `drawSVG '0% 0%'`, `strokeWidth 8%`; keyframes hold 8 % to 15 %, draw `'0% 100%'` by 90 % and widen to `strokeWidth 70%` at 100 %, 1.25 s. The logo enters .65 s `elastic.out(1,.72)` with .5 s delay; first load reverses it to `drawSVG '100% 100%'` [verified, slater.js]. Reduced motion: `autoAlpha 0` swap [verified, slater.js].
- **ScrollTrigger configs** [verified, slater.js]:
  - unboxing sequence: `top 85%` → `bottom 80%` (from data attributes), `scrub: true`, `onUpdate` draws `round(progress × 119)`;
  - the same window, canvas `yPercent` keyframes, `ease: 'none'`, `scrub: true`;
  - hero loop: `top bottom` → `bottom top`, `onEnter` / `onLeave` play and pause one `repeat: -1` tween;
  - curved band: `textPath startOffset` to a measured negative %, `-40% bottom` → `60% top`, `scrub: .5`;
  - footer: `clamp(top bottom)` → `clamp(top top)`, `scrub: .2`;
  - scrolling CTA: `top 80%` → `bottom bottom`, `toggleActions: "play none none reverse"`, `y 12em`, `energy`, `easeReverse: true`;
  - reveals: `top 80%` / `top 72%` / `top 25%`, `once: true` or `onEnter → tl.play()`.
  No `pin` and no `snap` anywhere [verified absent].
- **Thresholded copy inside a scrub**: two paused timelines ride the sequence's progress. At ≥ .3 the copy plays at `timeScale(1.5)`; at ≥ .6, or back below .3, it reverses at `timeScale(3.5)`. At ≥ .81 the final line plays at 1.25 and reverses at 3.5 [verified, slater.js].
- **SplitText**: 17 `new SplitText`, `type: "words"` or `"words, chars"`, `tag: "span"`, no `mask`, no `autoSplit`, no font wait [verified, slater.js].
- **Inertia hover**: the pointer's per-frame velocity × 25 (clamped ±1080) and a torque term (offset × velocity cross product ÷ lever) × 15 (clamped ±60°) feed `inertia: { x, y, rotation, resistance: 160 }` with `end: 0`. It is fine-pointer only [verified, slater.js].
- **Smooth scroll**: Lenis on `autoRaf`, not the GSAP ticker; `ScrollTrigger.update` on its scroll event [verified, slater.js].
- **matchMedia / reduced motion**: 14 `gsap.matchMedia`, mostly `(min-width: 992px)` or `(prefers-reduced-motion: no-preference)`. A `reducedMotion` flag also short-circuits the route curtain and shows sequence stills [verified, slater.js]. The first-load animation has no reduced branch [verified, slater.js `runPageOnceAnimation`].

## 6. Weaknesses
- Reduced motion: **partial**. The headline and copy rest readable [verified, desktop-rm-s00.png]. But the hero loses its book object, because its still points at a URL that does not exist [verified, manifest.json failedRequests], and the load curtain still plays [verified, slater.js].
- Keyboard: **partial**. Button hovers replay on `:focus-visible` [verified, slater.js]. The genre wall's covers are `pointerenter` only [verified, slater.js], and there is no skip link [verified absent, index.html].
- DOM behind the canvas: **pass**. Both canvases are decorative frame players, and every word and book is in the HTML [verified, index.html]. 15 of 89 images have empty alt [verified, index.html].
- Load gate: **fail**. The curtain and the staggered headline run on every first load, ≈ 2.7 s before the hero settles [inferred from slater.js delays]. Nothing remembers a visit. The hero sequence pulls ≈ 25 MB of frames [inferred, §5].
- Phone: **designed**. It has its own hero order with the box at the bottom, a Menu button and a phone frame set [verified, mobile-s00.png; slater.js]. The pale unboxing stage is mostly empty in the scroll frame [verified, mobile-s25.png].
- Wayfinding and conversion: **partial**. The CTA is in every frame, but the fixed nav pills cover headings and cards [verified, desktop-s50.png, desktop-s100.png].

What the awards skills do differently: decode a rolling window of frames rather than the full set, and cap the canvas DPR [pattern:asset-pipeline#sequences]. Make a real poster `<img>` the reduced and failure path `[recipe:image-sequence-scrub]`. Skip the curtain on a repeat visit `[recipe:preloader-counter-hold]`. Give the header a collision-free lane, and keep the elastic voice for landed objects, not for every UI response.

## 7. Principles
1. **Make the delivery the object.** When the product is a service, the thing that arrives can carry the story. One object recurring at each beat ties a long persuade page together.
2. **Bisect the load.** Fetch the first and last frames, then midpoints, so a sequence is scrubbable end to end early and only gains resolution over time.
3. **Copy on thresholds, not on the scrub.** Text that plays in at one progress and out at another, faster on the way out, stays legible while the picture scrubs freely.
4. **Give each type voice one job.** A display face for claims, a grotesque for reading and a handwriting face only for asides let a loud palette stay readable.
5. **Many grounds, one action colour.** A section-per-hue page keeps conversion findable when the button colour never changes.

## 8. Take / Don't take
- **Take:**
  - Coarse-to-fine bisection loading with a nearest-loaded fallback for any frame sequence `[recipe:image-sequence-scrub]`, plus a rolling decode window.
  - Paused copy timelines driven by scrub thresholds, with exit timeScale ≈ 2–3× the entrance.
  - A route curtain made from one stroked path: draw, then widen the stroke to flood, with a reduced-motion swap `[recipe:page-transitions]`.
  - Velocity-plus-torque inertia on hover, fine pointer only, clamped and returning to rest.
  - Percent keyframes with per-key eases where a single ease cannot describe the shape.
- **Don't take:**
  - The palette as literal values:
    - `#ffd24a` [verified, webflow.css]
    - `#f9a220` [verified, webflow.css]
    - `#fd48f2` [verified, webflow.css]
    - `#ff008c` [verified, webflow.css]
    - `#a4f6f8` [verified, webflow.css]
    - `#3b308f` [verified, webflow.css]
  - Champ + Degular + a handwriting face as a set, the tilted marginal scribbles, the genre wall with popping covers, emoji rain and the opening-box sequence as-is.
  - The `osmo` / `energy` curve strings and `elastic.out(1, .72–.75)` as a house signature.
  - Headline wording, the promo line and the section order.
  - Fixed nav pills over content, an unsessioned load curtain and an uncapped full-sequence decode: these are what to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML, slater.js, slater.css, webflow.css |
| Award and credits | high — entry page text (`entry/entry.html`) and capture |
| Concept, structure, visual language | high — five desktop, five phone and five reduced-motion frames |
| Motion parameters and GSAP lens | high — read verbatim from slater.js; timeline structure inferred |
| Weaknesses | medium-high — load timing and frame totals inferred; menu, cart, book routes and 404 not observed |

**Live pass 2026-10-05: reachable, capture exit 0, `scrollMode: native`.** robots.txt is empty and no AI-usage policy was found. Sources in `.awards/research/aardvarkbookclub/`: 15 captures + `manifest.json`, `index.html`, `slater.js`, `slater.css`, `webflow.css`; frame sizes from `curl -sI` headers only. The award entry `awwwards.com/sites/aardvark-book-club` was found with one search, captured desktop-only into `entry/` (exit 2), and its HTML read.
