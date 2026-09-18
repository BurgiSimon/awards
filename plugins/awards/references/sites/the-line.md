# The Line — https://thelinestudio.com/

| Field | Value |
|---|---|
| Class | studio — an animation studio in London; work-first portfolio + studio identity + news + shop + podcast [verified, index.html: `<title>Animation Studio London \| THE LINE Studio`, nav `/work /entertainment /about /blog /podcast /contact /shop`] |
| Visitor mode | persuade |
| Awards | Awwwards **Site of the Day, 5 Nov 2024** — **7.76 / 10** (Design 8.02 · Usability 7.40 · Creativity 7.78 · Content 7.77) [verified, Awwwards entry read 2026-09-18]. Six developer criteria: Semantics/SEO 7.40 · Animations/Transitions 9.00 · Accessibility 7.00 · WPO 8.00 · Responsive Design 7.60 · Markup/Meta-data 7.40 [verified, same]. **No Site of the Month**, and the "DEV AWARD" heading prints the same `→ 7.76` overall figure — a score, not a second badge [verified, same]. CSSDA, FWA, Godly [unknown] |
| Studio / credits | The Line Studio (PRO), Isaac Powell (`/IJPowell/`, PRO), Thomas Aufresne (`/thomasaufresne/`) [verified, Awwwards entry read 2026-09-18]. Site Credits is an in-footer expandable panel, not a page [verified, index.html `.footer--credits-open`; desktop-s100.png] |
| Stack (evidence level) | **Nuxt 3 / Vue** [verified: 35 × `/_nuxt/*.js`, `data-capo`, `_payload.json`, `page-enter-active` transition classes] · **GSAP + ScrollTrigger** [verified, BHubVMsw.js] · **Lenis 1.1.13, `lerp: 0.2`, driven from `gsap.ticker`** [verified: `window.lenisVersion="1.1.13"`, `new Lenis({lerp:.2})`, `gsap.ticker.add(t => lenis.raf(t*1e3))`] · **DatoCMS** [verified: `graphql.datocms.com`, 4,676 × `datocms-assets.com`] · **Vimeo** for video [verified: 78 × `player.vimeo.com`] · Denim variable font, `DenimVF.woff/woff2`, weight axis 300–800, `ss03` on [verified] · **no canvas, no WebGL** [verified, manifest.json `canvases: 0`; 0 × `canvas` in index.html] · GA4 `G-XRL3X5GCDJ` [verified, manifest.json] |
| Palette | `#DDDEE2` body ground · `#F8F8F8` section ground · `#0B0B0B` ink and scrollbar handle · `#FF391E` flare red · `#E8E9EE` reversed text on dark · `red` (`#FF0000`) for the `.acetate` multiply layer [verified, index.html inline CSS; census: f8f8f8 ×37, ff391e ×17, 0b0b0b ×7, e8e9ee ×4, dddee2 ×4, `red` ×3]. Strategy: **a cool grey/near-white ground carrying one hot red that is a working colour, not a bookend** — it is the preloader ground, the mobile nav ground, the selection colour, the image-loading placeholder, the status dots, the active nav item and the whole sticky footer [verified, same] |
| Type | single variable grotesk — Denim (`DenimWeb` / `DenimVF`), `ss03` set on `body` [verified]. **A full scale, not a two-tier contract**: h1 210 px (`12.15278vw`), h2 128 px, h2--s 96 px, h3 64 px, h4 48 px, h5 40 px, then p1 32 → p8 10 px, all ≥1024 px [verified] |
| WebGL dosage | **none** — DOM, CSS and SVG only [verified, manifest.json `canvases: 0`] |
| Scroll model | native scroll + Lenis 1.1.13 under a custom-drawn scrollbar; **sticky stages on invisible rails, never `pin`** [verified — `pin:` appears 0 times as a call-site option across the entry and page chunks] |
| Narrative model | print artefact — a call sheet about film; conventional studio IA elevated by treatment [verified structure; framing recalled high] |

## 1. Concept and narrative
**One idea:** the studio shows its craft in the interface. Every surface is a sheet that hinges, blinks or strikes into place, and the one saturated red is the studio's ink rather than a highlight colour.

The **acetate** is real and precisely built: `.acetate{background-color:red;inset:0;mix-blend-mode:multiply;position:absolute}`, `aria-hidden="true"` in the template [verified, index.html + B6MUFv6g.js]. But it is a **local device, not the site's art direction** — it appears on the hero layer, on the featured-work active row (`.home-featured-work__active--acetate`), behind the reel play target, on the mobile nav figure and on the 404. Site-wide greyscale does not exist: `filter:grayscale()` is used on exactly two selectors, `.news-item__fig--has-meta img/video` at `1` and `.footer__fig` at `.3` [verified, index.html]. Everything else runs in full colour — blue Gorillaz night skies, red/yellow/green comic frames, brick-wall photography [verified, desktop-s25/s50.png, mobile-s50.png]. **The corpus's "greyscale everything, overprint one hue" reading was drawn from the hero alone.**

The preloader hands the red over: `.home-hero__layer.acetate` starts at `#ff391e` and transitions to `red` on `.home-hero--preloader-done` over `.3s cubic-bezier(.19,1,.22,1)` after a `.2s` delay [verified]. Then the preloader's logotype SVG is **physically appended into the hero wrapper** (`b.appendChild(o.value)`) — a shared-element hand-off rather than a fade-out [verified, BHubVMsw.js].

Beats [verified, index.html section order + desktop-s00…s100.png]: hero (red-flooded reel, logotype hung on the bottom edge, ®) → `home-intro` (`/ About The Line` · h1 "Highlights") → `home-featured-work` (sticky stage, the list scrubs through The Mountain / Here, Tomorrow / Marvel Snap) → `home-about` (`/ Make your mark` · "The Studio" · `/ Awards & Mentions`) → `home-clients` → `home-featured-news` (`/ From the studio` · "News") → sticky flare-red footer.

**Tone:** working-studio voice. Status dots, slash-delimited nav, `/ MICRO / LABELS /` as section headings, `CLOSED (10—6PM)`, `LONDON, ENGLAND`, `THE WORK [ 85 ]`, a `00 / 24 fps` preloader at display scale [verified, index.html; desktop-s00/s100.png]. The about copy reads "We're a globally renowned animation studio based in East LDN" [verified, desktop-s50.png]. The Awwwards blurb is in the same register: "The Line Animation's glow-up! We've been grafting hard to give our brand a fresh coat of paint." [verified, Awwwards entry read 2026-09-18]. Named work on the home page as of this pass: Gorillaz *The Mountain*, *Spirit Blossom Beyond*, *Marvel Snap / Hero* [verified, index.html] — the Warframe / Azuki / Cowboy Bebop set recorded earlier is a 2024 snapshot and has rotated out.

## 2. Structure and components
Routes [verified, index.html]: `/`, `/work` + `/work/<slug>`, `/entertainment`, `/about`, `/blog` + `/blog/<slug>`, `/podcast`, `/contact`, `/shop`, `/privacy`. A designed 404 exists (`.error__wrapper.acetate`, `.error__fig{mix-blend-mode:darken;aspect-ratio:893/683;width:166.66667vw}`) [verified].

| Component | What it does | Label |
|---|---|---|
| Preloader | `00 / 24 fps` counter at `h1` scale, `tabular-nums`; logo strokes scale in, then the whole SVG is appended into the hero | [verified] |
| Header + slash nav | 8 items, `/` as real `<i>` elements, active item in flare red with a filled dot; hamburger below 1024 | [verified] |
| Mobile nav overlay | full-screen `#ff391e` panel, hinges in from `translate(30%,-80%) rotate(14deg)`; `.nav__fig` at `mix-blend-mode:multiply; opacity:.5` | [verified] |
| `.cursor` | fixed round cursor, `display:none` by default and `block` only inside `@media (hover:hover)` | [verified] |
| `cursor-image-*` transitions | cursor-following image reveal, a Vue `<Transition>` with `transform .4s cubic-bezier(.19,1,.22,1)`, entering from `translateY(10%) rotate(2deg)` — CSS, no GL | [verified] |
| `home-featured-work` | sticky stage; an `opacity:0`, 30 px-wide `__scroller` rail sets the distance; the active row is highlighted by an acetate rectangle | [verified] |
| Reel block | red acetate rectangle framing a ▶ Reel target over full-colour footage | [verified, desktop-s75.png] |
| `ScrollbarCustom` | `aria-hidden="true"`; `#0b0b0b` handle, `.46296vw` wide, `4.62963vw` min-height, `cursor:grab`; native bar hidden only under `@media (hover:hover)` | [verified] |
| Text splitter | custom, classes `anim-line` / `anim-word` / `anim-char`, re-splits on `FONTS:LOADED`, `WINDOW:RESIZE`, `WINDOW:ORIENTATION_CHANGE`; skips re-split below 1024 px on touch. Not GSAP SplitText | [verified] |
| Footer | sticky `100dvh` flare-red stage on a `inset:-50vh 0 0 0` rail; `/ REACH OUT`, `/ FIND US`, `/ SOCIAL`, `/ NAV` columns, newsletter input, `© THE LINE ANIMATION STUDIO 2026 / SITE CREDITS / PRIVACY / UP` | [verified] |
| Credits panel | opening it hinges the whole footer: `translate(5%,-16.2037vw) rotate(-6deg)` over `1s` | [verified] |
| Easter eggs, sound | — | [unknown] |

## 3. Visual language
**Palette roles** [verified, index.html]: `#DDDEE2` is the `body` ground; `#F8F8F8` the section ground (`.page-bg`) and reversed text; `#0B0B0B` body ink and scrollbar handle; `#E8E9EE` the reversed logotype over dark footage; `#FF391E` across ten distinct roles (above); `red` only under `mix-blend-mode:multiply`.

**Type scale** [verified, index.html inline CSS]: below 1024 px everything is fixed px (h1 72, h2 40, p1 24 …). At ≥1024 px every size becomes a six-decimal vw from a 1728 artboard: h1 `12.15278vw` = 210 px / weight 500 / `line-height:.8` / `letter-spacing:-.04em`; h2 `7.40741vw` = 128 px; h3 `3.7037vw` = 64 px; p1 `1.85185vw` = 32 px; p8 `.5787vw` = 10 px (from 1240 px up). Weights are variable-font values — 300, 440, 470, 500. So the macro/micro pair is **210 px against 10 px with a full eight-step ladder between them**; the earlier "nothing between" reading, and the "~9 px" label size, were artefacts of measuring at a non-artboard viewport.

**Optical kerning** [verified]: a complete `.letter-A` … `.letter-z` / `.letter-0` … `.letter-9` table of `margin-left` values from `-.07em` to `+.052em`, applied only at ≥1024 px, and used on five elements on the home page — the featured-work asset titles, the footer CTA label and the footer credits title. It hangs the first glyph of a display line onto the page edge.

**vw-lock** [verified]: `px / 1728 × 100` at full precision — `.46296vw` = 8 px, `1.27315vw` = 22 px, `12.15278vw` = 210 px. No `clamp()`, so the display scales without ceiling above 1728 px.

**Material**: zero radius outside the round cursor and status dots, zero shadows; depth is luminance and rotation only. Page margin 8 px below 1024, 22 px (`1.27315vw`) above [verified].

**Layout**: breakpoints 767 / 768 / 1023 / 1024 / 1240 / 1600, with 112 of 149 media queries on `min-width:1024px` [verified]. `@media (hover:hover)` used 17 times as a genuine coarse-pointer switch [verified].

**Browser surfaces** [verified]: `::selection` is `#ff391e` on `#f8f8f8`, inverted inside the footer; `scrollbar-width:none` and `::-webkit-scrollbar{display:none}` only under `hover:hover`; dark-variant favicons and a `site.webmanifest`.

## 4. Motion and effects (with parameters)
- **Global contract** [verified, BHubVMsw.js]: `gsap.defaults({ease:"power2.out"})`; a registered custom ease `0.44, 0.14, 0.28, 1`; the CSS vocabulary is `cubic-bezier(.19,1,.22,1)` (expo-out) for reveals and hovers, `(.14,1,.34,1)` for panels, `(.44,.14,.28,1)` for routes, `(.9,0,.1,1)` for the nav out-state. Global ScrollTrigger start: `triggerThreshold: "top 70%"` in the app store.
- **Sticky stages on invisible rails** [verified, index.html]: `.home-hero{height:200svh}` + `.home-hero__scroller{inset:0 0 -100svh 0;position:absolute}` + `.home-hero__sticky{height:100lvh;position:sticky;top:0}`. Same shape for `.home-featured-work` (rail is a literal `opacity:0`, `width:3rem` element) and `.footer` (`inset:-50vh 0 0 0`, so the stage starts half a viewport early). **`pin:` never appears as a ScrollTrigger option** [verified].
- **The hero hinge** [verified, B6MUFv6g.js]: `gsap.timeline({scrollTrigger:{trigger, start:"top top+=1", end:"bottom top", scrub:true}})` then `.to([panel, logo], {xPercent:-10, rotate:-15, transformOrigin:"bottom left", ease:"power1.in"}, 0)`. The panel swings off the light table as you leave the first screen. Its entrance is separate and CSS-driven: `.home-hero__fig` rests at `translate(-10%,124%) rotate(15deg)` and settles to zero over `1s cubic-bezier(.19,1,.22,1)`.
- **Generalised hinge rule** [verified, B6MUFv6g.js — four scrubbed timelines]: every entrance is `fromTo` a named `transformOrigin` (`left`, `top left`, `bottom left`) with a rotation of **8–16°** plus 10–20 % of translate, scrubbed to zero; parent and child run at different rates so paper shears. One uses `ease:"none"` with `force3D:true`.
- **The blink family** [verified, BHubVMsw.js]: three GSAP effects registered with `extendTimeline:true` — `blink`, `blinkOnce`, `blinkOut` — each a ladder of hard `.set()` steps on `opacity` at `0 / .09 / .15 / .21` s (`blinkOut` stops at `.15`), with `clearProps` optional. The preloader stacks them at a 0.12 s stagger. A CSS `@keyframes blink182{50%{visibility:hidden}}` covers the non-GSAP cases. This is the real mechanism behind the "neon tube striking"; the `[0,1,0,0,1,1]` keyframe ladder recorded earlier came from a third-party reconstruction, not from this site.
- **Preloader** [verified, BHubVMsw.js]: `lenis.stop()`, then `gsap.to(counter,{value:24, duration:3, ease:"expoInOut", delay:.8})` with `padStart(2,"0")`; the logotype's `logo__line` runs `scaleX 0→1` over `1.2s power1.out`, snaps to `scaleY 3.6` over `.35s expoInOut` at 1.18 s, resets at 1.53 s, then per-letter shapes come off `scale 3/3/5` over `1s power4.out` at a 0.01 s stagger; `blinkIn` on the fps readout at 0 / .12 / .24 / .36; `PRELOADER:DONE` fires half a second after. **Fixed ≈3.3 s, tied to no load signal** — `isFontLoaded` is separate state used only by the text splitter.
- **Page transitions** [verified, index.html]: `.page-enter-from{transform:translate(-10%,105lvh) rotate(-4deg)}` → in over `.8s cubic-bezier(.44,.14,.28,1)`; `.page-leave-to{transform:translateY(-25lvh) rotate(4deg)}` over `.78s`. Route-scoped variants for case pages, the work layout, the filter panel and the director's note.
- **Reduced motion** [verified, index.html]: **every CSS transition on the site is wrapped in `@media (prefers-reduced-motion:no-preference)`** — 33 such blocks — so hovers, panels, route transitions and the hero entrance simply do not run. The GSAP layer has no matching branch: `prefers-reduced-motion` appears 0 times in any fetched JS, so the scrubbed hinges still rotate under reduced motion [verified, desktop-rm-s25.png vs desktop-s25.png].

## 5. Tech and pipeline
- Nuxt 3 with a single `type="module"` entry (`BHubVMsw.js`, 449 KB raw) plus 25 preloaded chunks and 8 CSS chunks; critical CSS (~47 KB) is inlined in `<head>` [verified].
- DatoCMS over GraphQL, assets on `datocms-assets.com`; video on `player.vimeo.com`. Media components take a `srcSmall` below 1024 px and lazy-load at `lazyThreshold: "-200% 100%"` [verified].
- Fonts self-hosted at `/fonts/DenimVF.woff` + `.woff2`, one family, `font-weight:300 800` [verified].
- The vw-lock removes JS layout work on resize; only the 1024 px hand-off changes the unit system. `ResizeObserver` is used 8 times; there is no `IntersectionObserver`-based reveal system — reveals are ScrollTriggers [verified].
- Performance: manifest LCP figures are a headless SwiftShader cold-cache artefact and are not usable as a claim. CLS was 0.0062 desktop and **0.3142 mobile** in the same run [verified, manifest.json] — headless timing inflates this, but the mobile figure is large enough to be worth a real-device check. WPO scored 8.00 at submission [verified, Awwwards entry read 2026-09-18].

## 6. Weaknesses
- **Reduced motion, half-done** — CSS transitions pass cleanly (rm frames at s00 and s100 are byte-identical to the default frames, nothing stuck at opacity 0), but the scrubbed GSAP hinges have no tier [verified, desktop-rm-s00/s25/s100.png + 0 × `prefers-reduced-motion` in JS].
- **Heading semantics are inverted** — the only `<h1>` on the home page is "Highlights"; the slash micro-labels (`/ Make your mark`) are `<h2>` while the display words they label ("The Studio", "News") are `<h3>` [verified, index.html]. The entry's joint-lowest developer score is Semantics/SEO at 7.40.
- **The fixed header has no scrim** — black nav text sits directly on full-bleed artwork, and at the studio section "ENTERTAINMENT / FEED / PODCAST" is effectively unreadable over the yellow-and-red comic frame; the ® mark also collides with "CONTACT" at the footer [verified, desktop-s50.png, desktop-s100.png].
- **A fixed ≈3.3 s preloader on every visit**, tied to no load signal and with no repeat-visit skip [verified, BHubVMsw.js].
- Hover-only cursor reveals have no evidenced keyboard equivalent; no `keydown` handlers appear in the fetched JS [verified as an absence, BHubVMsw.js / B6MUFv6g.js].
- **Strengths worth naming:** the acetate is `aria-hidden`, the custom scrollbar is `aria-hidden` and the native bar is only hidden under `hover:hover`, the cursor exists only under `hover:hover`, and Lenis runs off the GSAP ticker rather than its own rAF [verified].
- **What the awards skills do differently:** run `gsap.matchMedia()` tiers so the scrubbed hinges become cuts and the blink a single opacity step, matching the CSS layer that already respects the preference; keep one `<h1>` on the display word and let the slash label be a `<p>` or a `<span>`; scrim or theme-swap the header per section; hold the preloader on `Promise.all(fonts, first media)` with a 2.5 s ceiling, announce it with `aria-live`, and skip it on repeat visits; give every hover reveal a `:focus-visible` equivalent; reserve media boxes with `aspect-ratio` so the phone's CLS stays under 0.1.

## 7. Principles
1. **One ink used everywhere beats one ink used twice.** A single hot colour earns its place by doing work — loading state, selection, active state, overlay ground, the final screen — not by appearing only at the bookends.
2. **A sticky stage plus a transparent rail beats a pin.** Give the section its own height, absolutely position an over-extended scroller inside it, and let the visual be `position:sticky`. No pin-spacer, no layout reflow, native scroll intact.
3. **Name the origin corner.** Rotation on a named `transformOrigin` at 8–16°, with parent and child at different rates, reads as physical paper; translate-and-fade never does.
4. **Register the signature as an effect, not a snippet.** A three-variant blink registered on the timeline is reusable, auditable and cheap; the same ladder pasted at each call site is none of those.
5. **Gate the whole CSS layer on the motion preference in one move.** Wrapping every transition in `@media (prefers-reduced-motion:no-preference)` makes the reduced path the default rather than an afterthought — then the scripted layer has to be brought to the same line.
6. **The medium proves itself.** A craft studio demonstrates its craft in the chrome — hinging, blinking, counting frames — instead of embedding a reel and stopping.
7. **Chrome in the client's dialect.** Frame counters, call-sheet labels, opening hours, a work count in brackets: the UI speaks the industry's own paperwork.

## 8. Take / Don't take
- **Take:**
  - The sticky-stage rail as a shape: `section{height:200svh}` + `.scroller{position:absolute;inset:0 0 -100svh 0}` + `.sticky{position:sticky;top:0;height:100lvh}`, driven by a ScrollTrigger with `trigger/start/end/scrub` and no `pin`.
  - Lenis on the GSAP ticker — `gsap.ticker.add(t => lenis.raf(t * 1000))` with a single `lerp` — and a custom scrollbar that is `aria-hidden` while the native one is hidden only under `@media (hover:hover)`.
  - The hinge: a named `transformOrigin`, 8–16°, parent and child at different rates, scrubbed.
  - Registering the signature as a GSAP effect with `extendTimeline:true`, so it composes into any timeline by name.
  - Wrapping the entire CSS transition layer in `@media (prefers-reduced-motion:no-preference)`, then adding the matching `gsap.matchMedia()` tier the original left out.
  - The preloader-to-hero hand-off: move the preloader's own element into the hero rather than cross-fading two copies.
  - The vw-lock: pick a desktop artboard, convert with `px / artboard × 100` at full precision, switch to fixed px below the breakpoint, and consider `clamp()` so the display stops growing past the artboard.
  - The optical-kerning table: per-glyph `margin-left` in em, applied to the first character of display lines so the left edge aligns optically.
  - Chrome as genre signal — pick the audience's own paperwork and render the UI in it (compare `[site:igloo]`).
- **Don't take:**
  - The red acetate over film, the `00 / 24 fps` preloader, the blinking logotype build.
  - The hexes `#DDDEE2` / `#F8F8F8` / `#0B0B0B` / `#E8E9EE` / `#FF391E` and the cool-silver + flare-red pairing.
  - Denim (`ss03`) as the face; 210 px / 10 px as literal sizes; the six breakpoints as-is.
  - The call-sheet furniture as a set: status dots, slash nav, `/ MICRO / LABELS /`, `LONDON, ENGLAND`, `CLOSED (10—6PM)`.
  - The section order hero → intro → featured work → studio → clients → news → sticky red footer, and the sticky red footer with its hinging credits panel.
  - Any project imagery, client names or copy lines.
  - The inverted heading hierarchy and the unconditional 3.3 s preloader — both are things to beat, not adopt.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Awards, scores, credits | very high — the Awwwards entry read directly |
| Stack (Nuxt, GSAP, Lenis 1.1.13, DatoCMS, Vimeo, no WebGL) | very high — served bundles and the capture manifest |
| Palette, type scale, breakpoints, surfaces | very high — the served inline CSS, counted |
| Motion parameters (hinge, blink, preloader, transitions) | very high — read from the served JS |
| Sections, components, routes, 404 | high — served markup and five scroll states |
| Reduced motion | high — CSS gating counted, JS absence counted, rm frames compared |
| Performance | low — LCP is a headless artefact; mobile CLS needs a real device |
| CMS editorial workflow, hosting, sound, easter eggs | unknown |

**Live pass 2026-09-18: reachable, capture exit 0, scroll mode native, sources** `index.html` (1.6 MB, ~47 KB inline critical CSS extracted to `head.css`) · `/_nuxt/BHubVMsw.js` (449 KB entry) · `/_nuxt/B6MUFv6g.js` (page/section chunk) · `/_nuxt/JHLyEYbv.js` · `/_nuxt/dyxvcvr1.js` · `/_nuxt/entry.CdIUu_Mz.css` · `/_nuxt/index.CVwLeBkz.css` · 15 captures + `manifest.json` in `.awards/research/the-line/` · Awwwards entry `awwwards.com/sites/thelinestudio-com` read 2026-09-18.

Superseded by this pass: the 2024-era work list, the "greyscale everything" reading, the two-place bookend, the "nothing between" type contract, the CSS-pseudo-element slash (it is a real `<i>`), the Roman-numeral year (the footer reads `© THE LINE ANIMATION STUDIO 2026`), the separate Site Credits page, and the third-party-reconstruction flicker parameters. The earlier sources were `design-bites`, `families.json`, `YashwantOstwal/the-line-awwwards-SOTM` and `roshanvijay37/Roshan` (batch-E, 2026-09-17, site unreachable); they are retained here only where the served site confirms them.
