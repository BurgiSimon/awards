# Montfort Group — https://mont-fort.com/

<!-- Identity first: Montfort Group is a global commodity-trading and asset-investment company (downstream oil, physical commodities, shipping) with hubs in the UAE, Singapore and Switzerland. It is named after Mont Fort, the 3,330 m peak above Verbier, and it renders that mountain in WebGL — it is not a ski resort or a tourism site. Evidence base: a live capture set and the served bundles read on 2026-09-18, plus the Awwwards entry; the earlier static-mirror pass is retained where it still holds. -->

| Field | Value |
|---|---|
| Class | brand (corporate group, B2B heavy industry) |
| Visitor mode | experience, with read routes (divisions, ESG, news) |
| Awards | Awwwards **Site of the Day, 23 June 2025**; SOTD score **7.62/10** — Design 7.67 · Usability 7.40 · Creativity 7.85 · Content 7.65; **DEV AWARD 7.84/10** over six criteria — Semantics/SEO 7.40 · Animations & Transitions **9.00** · Accessibility **7.20** · WPO 8.00 · Responsive Design 7.60 · Markup & Meta-data 7.80; tags 3D, Business & Corporate, Gestures / Interaction, Responsive, Scrolling, UI design, Web & Interactive [verified, Awwwards entry read 2026-09-18] · reputational proxy: seven-plus GitHub replicas [verified, earlier pass] |
| Studio / credits | **Immersive Garden** (INT), the sole credit on the entry; no individuals named [verified, Awwwards entry read 2026-09-18] |
| Stack (evidence level) | Astro **5.18.2**, static output with islands (`generator` meta) [verified, index.html] · Astro `ClientRouter` / View Transitions, `astro-view-transitions-fallback: swap`, plus a `router` chunk [verified, index.html] · **Lenis 1.1.19-dev.5** (`window.lenisVersion` in the bundle) [verified, App.ST3WWojO.js] · GSAP + ScrollTrigger in their own chunks [verified, ChaptersNavigation…js] · Three.js — `WebGLRenderer`, `ShaderMaterial`, `GLTFLoader`, `DRACOLoader`, `KTX2Loader`, `EXRLoader`, `InstancedMesh`; no `EffectComposer` [verified, App.ST3WWojO.js] · Century Gothic + Josefin Sans, self-hosted woff2 **with woff fallbacks** [verified, _slug_.CRG2uH_C.css] · Cloudflare (`cdn-cgi/…/email-decode.min.js`) [verified] · Cookiebot consent + Google Tag Manager `GTM-5F3SQM6J` with gtag Consent Mode defaulting to denied [verified, index.html] · chunks `App`, `Layout`, `WebGL`, `ChaptersNavigation`, `Solutions`, `Social`, `router`, `visitedNews`, `index` (GSAP), `ScrollTrigger`; one stylesheet `_slug_.CRG2uH_C.css`, 308 KB unzipped [verified] |
| Palette | brand ink `#2d628c` (72 uses) and its `theme-color`; a blue ramp `#a9bfd2` · `#81a0bb` · `#8cb4d5` · `#d1dde8`; one bright `#008ae0`; near-blacks `#00263f` / `#013842` for the dark chapters; whites at 0.8 / 1.0 for hierarchy [verified, _slug_.CRG2uH_C.css]. Strategy: one desaturated slate-blue ink over a rendered snow-and-cloud ground, inverted to near-black navy for the ESG chapters [verified, desktop-s00/s75/s100.png]. **No `color(display-p3 …)` in the served stylesheet** — the wide-gamut duplication recorded in the earlier pass is not in the current build [verified, absence in _slug_.CRG2uH_C.css] |
| Type | Century Gothic (400/700 + italics) and Josefin Sans (100–700 + italics), both families shipped whole [verified, _slug_.CRG2uH_C.css]; display is all-caps, widely tracked, hairline-light; two geometric sans faces with near-circular bowls — an institutional-heritage voice, not a startup one [inferred] |
| WebGL dosage | canvas-first: one hydrated island, `#canvas-wrapper` `aria-hidden="true"` and `data-astro-transition-persist="webgl"`, so the scene survives route changes instead of rebooting [verified, index.html]; 2 canvases (scene + the sound icon) [verified, manifest.json] |
| Scroll model | native + Lenis, sticky chapters driven by ScrollTrigger with a jump rail; `scrollMode: native` [verified, manifest.json] |
| Narrative model | chaptered journey |

## 1. Concept and narrative
- The idea [verified name, inferred reading]: a business with no photogenic product borrows its own name's landscape. The homepage opens inside cloud on a snow peak; the peak is the brand's etymology [inferred, high].
- **The hero is the mark, not a headline** [verified, desktop-s00.png + index.html]: the Montfort logomark and wordmark are drawn as inline SVG (`<path fill="#2D628C">`), centred low over the rendered mountain, with a `Scroll down` / `Swipe down` cue. The earlier claim that the hero set the four division names as one running string is wrong.
- Chapters, in the order the markup declares them [verified, index.html]: Hero → Who we are → What we do → Global connectivity → Sustainability → Solutions → Equality → footer.
- Beats read from the captures [verified]: brand + peak (s00) → division positioning lines over the peak, a numbered diamond chapter marker and a circular-arrow link to each division (s25) → a tanker under a grey squall carrying "Established in the world's major trade hubs and financial markets with over…" (s50) → the ground inverts to near-black navy for "Delivering Sustainable Energy Solutions" with Environmental / Social / Governance tabs (s75) → a forest-canopy band, then a white footer of three offices (s100).
- Division positioning lines, one per brand [verified, earlier pass]: Montfort Trading "Operating Efficiently by Leading with Innovation."; Montfort Capital, Montfort Maritime, Fort Energy each with their own.
- ESG runs as numbered pillars with E/S/G focus-area taxonomies and CSR partners (Mercy Ships, Mercy Corps, Kenya Red Cross, Emirates Red Crescent, The Doyenne Initiative, Alsama, Hope for Cancer Kids) [verified, alt text in index.html].
- Register [inferred]: institutional, declarative, first-person plural, no wit. All charisma is in the camera; the copy stays boardroom. That contrast is the transferable trick — and the jury paid for it: Creativity 7.85 and Animations 9.00 against Content 7.65 [verified, entry].

## 2. Structure and components
- Routes [verified, index.html]: `/` (group), `/trading/`, `/capital/`, `/maritime/`, `/fort-energy/`, `/news/`, plus Contact, ESG, Privacy Policy, Terms of Use in the footer.
- **Consent gate** [verified, every capture frame]: a Cookiebot banner ships in the bottom third of the desktop viewport and over roughly 60 % of the phone, in all fourteen frames. It is the first thing on the page and it never leaves until answered.
- Preloader [verified, index.html]: inline SVG `spinner` with two gradient arcs on `#2d628c`; `document.body.classList.add("loaded")` is the release signal, fired after the app boots [verified, Layout…js].
- Nav [verified, index.html]: a persistent division switcher — parent plus four children always visible, `.active` on the current one, with a sliding `.navbar` underline. Right side: a `/news/` link carrying `data-total-count="27"` on a badge whose class is `counter no-unread`, and a `<button class="menu-cta">` with a 2×2 dot cluster opening a full-screen Menu. The header is `data-astro-transition-persist="header"` and carries `data-theme="light"`.
- **Chapter rail** [verified, index.html + ChaptersNavigation…js]: a real `<nav class="chapters-list">` of `<a href="#WhoWeAre">`-style anchors, one `.chapter-wrapper` per chapter, each with a dot, a hidden label and a two-part progress bar. It is `pointer-events: none` until the first chapter is entered and again after the last.
- **Custom cursor** [verified, index.html]: `data-component="Cursor"`, `data-astro-transition-persist="cursor"`, built from a circle, a middle dot and two dot clusters; contextual states are declared in markup as `data-cursor="draggable"` / `data-cursor-down="dragging"` on the Global-connectivity chapter — so that chapter is a draggable object.
- ESG tabs [verified]: three real `<button class="navigation-item">` controls (Environmental / Social / Governance) over a height-locked content stack; focus-area items are circular tiles ("Carbon Emissions", "Carbon Reduction/Offsets") [verified, mobile-s75.png].
- Sound [verified]: `data-component="Sound"`, a `<button class="sound">` wrapping `<canvas id="sound-canvas" width="24" height="24">` — the control *is* the visualiser, stroked at `1.5 × dpr` in `#fff` [verified, App.ST3WWojO.js].
- Carousel [verified, index.html]: slide buttons labelled `Show slide 1|2|3`, and an "Expand text button".
- Mobile furniture [verified, mobile-s00/s50/s75.png]: a `Swipe down` cue, a floating scroll-to-top circle and a second circular control, and a chevron chapter control at the top of dark chapters.
- Footer [verified, desktop-s100.png]: division links + Contact/ESG/Privacy/Terms, then Geneva, Dubai and Singapore with street address, phone and reception e-mail, the wordmark, and `© 2021 | Montfort - All rights reserved`.
- 404, easter eggs [unknown].

## 3. Visual language
- Grounds and ink [verified, CSS + captures]: `#2d628c` is the single brand ink and carries the browser theme colour; the pale blue ramp handles secondary type and rules; near-black navy (`#00263f` / `#013842`) inverts the ESG chapters. Two grounds, one ink, no accent.
- Theming is declarative and scroll-driven [verified, index.html + ChaptersNavigation…js]: sections carry `data-theme-chapters="dark"`, a ScrollTrigger copies that value onto the rail's `data-theme` on enter and back to `light` on leave.
- **Imagery is mixed, not purely procedural** [verified, captures]: the terrain is procedural (Perlin/Voronoi/rock/snow-mix textures plus a baked lightmap, earlier pass), but a tanker under a squall fills one chapter and a forest canopy another; the ship sits at a different scale and position in the reduced-motion frame, so it is in the canvas rather than an image [inferred, high, desktop-s50 vs desktop-rm-s50.png]. Seventeen `<picture>` elements, all `loading="lazy"` [verified, index.html].
- Type scale is **stepped, not fluid** [verified, _slug_.CRG2uH_C.css]: discrete rem steps 0.5 / 0.75 / 0.875 / 1 / 1.125 / 1.25 / 1.5 / 1.75 / 2.25 / 2.5 / 3.125 / 3.875 / 5rem, zero `clamp()` in 308 KB of CSS.
- Layout tokens [verified]: `--container-padding-x` 18px → 150px across breakpoints, `--header-padding` 1 → 2 → 3rem, a 24-column grid addressed as `tb:/dk:/ml:/lg:col-start-*`, and `--vw` / `--dvh` / `--svh` / `--lvh` viewport-unit shims.
- CSS easing vocabulary is three curves [verified]: `cubic-bezier(.4,0,.1,1)` (23 uses), `(.32,.94,.6,1)` (4), `(.9,0,.4,1)` (3).
- Light/dark is per-chapter, not a user setting [verified]; the palette reads single-theme, high-key, with two inverted chapters.

## 4. Motion and effects (with parameters)
- **The ticker** [verified, App.ST3WWojO.js]: `lenis.raf(t * 1000)` is called from the app's own `AFTER_RENDER` event — Lenis is driven by the WebGL render loop, not by `gsap.ticker` — with `gsap.ticker.lagSmoothing(0)` and `lenis.on("scroll", ScrollTrigger.update)`. One clock, three consumers.
- **Declarative motion registry** [verified, index.html]: every animated element names its behaviour in markup — `data-animation="FadeIn"` ×60, `Title` ×13, `SplitBlock` ×13, `Line` ×4, `ReadMore` ×2, plus `Hero`, `GlobalConnectivity`, `ImagesContainer`, `Navigation`, `TextBlock`; parameters ride along as `data-animation-color="#ffffff"`. Motion is data, resolved by one registry.
- **Chapter rail, exact parameters** [verified, ChaptersNavigation…js]: one ScrollTrigger per chapter, `start: "top 85%"`, `end: "bottom 85%"`; `onUpdate` sets the white progress bar to `scaleY: progress, transformOrigin: "top center"` — a scrubbed fill, not a tween. Rail entry staggers dots `scale 0 → 1, stagger .1, duration .6, ease power2.out`; exit mirrors it with `stagger: -.1`. Hover: dot `scale 1.5, .4, power2.out`, label `y 200% → 0%, .6, power2.out`; direction flips the label's origin to `-200%` when scrolling back.
- **Solutions tab switch** [verified, Solutions…js]: outgoing pane `alpha 0, .3, linear` at t0; incoming at t0.3 `alpha 1, .3, linear`; description lines `y "0.4em" → 0, 1.2s, power2.out, stagger .15` with `opacity 0 → 1, .8, stagger .15`; logos `opacity 0 → 1, .3, stagger .1` at `"<+0.3"`. Height is locked to the tallest pane on resize, so nothing jumps.
- Route transitions [verified, index.html]: Astro `ClientRouter` / View Transitions, fallback `swap`; cursor, header and the WebGL canvas are `transition-persist`, so they never re-mount. Islands re-init on `astro:page-load` and tear down on `astro:before-preparation` [verified, all three chunks].
- WebGL [verified, App.ST3WWojO.js]: Three.js with glTF + Draco + KTX2 + EXR and instancing; no post-processing composer; DPR clamped `Math.min(2, devicePixelRatio)`; `ResizeObserver` ×3; a `breakpoint` field flips to `"mobile"` below the tablet width; `isMobile` / `isTouch` branch in 13 places each.
- Sound [verified, App.ST3WWojO.js]: Web Audio, `/assets/sounds/sound.mp3` fetched as an ArrayBuffer only when asked, `audioState = "stopped"` and `volume = .5` at boot — **opt-in, off by default**, which the earlier pass could only infer.
- Scroll-to-top button fades on `opacity 0 / pointerEvents none, duration .3` [verified].
- Ease vocabulary in JS is one family: `power2.out` everywhere, durations .3 / .4 / .6 / .8 / 1.2, staggers .1 / .15 [verified].
- Compare: the same Lenis + GSAP + Three consensus stack in [site:lando-norris], driving scene state rather than a camera; a scroll-linked alternative without Lenis in [site:animejs] (`onScroll({ sync })`).

## 5. Tech and pipeline
- Architecture [verified]: static Astro HTML with per-component islands, the WebGL chunk hydrated only where a canvas exists, one stylesheet, Cloudflare in front. WPO 8.00 on the entry [verified].
- Assets [verified]: WebP textures and favicons, KTX2 for GPU compression, a baked lightmap, Draco-compressed glTF, one EXR HDRI, lazy `<picture>` throughout.
- **Font payload is the outlier** [verified, _slug_.CRG2uH_C.css]: both families ship in full — Josefin Sans Thin→Bold with every italic, Century Gothic regular/bold with italics — each in woff2 *and* woff, all `font-display: swap`. Dozens of files for a page that visibly uses three or four cuts.
- SEO [verified, index.html]: `robots: index, follow`, a real description, sitemap link, and every division and ESG paragraph present in static HTML. But **the OG set is two tags** — `og:title` and `og:description`, no `og:image`, `og:url` or `og:type`; the earlier "full OG tags" claim is wrong.
- Shipped placeholder still present after a year [verified]: `<meta name="keywords" content="keyword 2, keyword 2">`.
- CLS 0.0003–0.0009 across desktop, mobile and reduced motion; DOM 1,635 desktop / 1,003 mobile; no console errors, no failed requests [verified, manifest.json]. LCP not measurable here (headless SwiftShader, cold cache).
- Budgets and a no-GL fallback [unknown].

## 6. Weaknesses
- **Reduced motion: fail, and the source says why** [verified]. The only `prefers-reduced-motion` rule in 308 KB of CSS is Astro's own — it kills view-transition animations. There is no `matchMedia('(prefers-reduced-motion')` anywhere in the app bundle, so Lenis, the GSAP timelines and the camera all run regardless. The saving grace: the five reduced-motion frames are fully legible, nothing is stranded at opacity 0 — it ignores the preference rather than breaking under it.
- **Keyboard: partial** [verified]. The rail is real anchors, the ESG tabs are real buttons and decorative SVGs are `aria-hidden` + `focusable="false"` — all correct. But the rail's labels are revealed on `mouseenter` only, the draggable Global-connectivity chapter is `pointerdown` / `touchstart` with two `keydown` handlers in the whole bundle, and the rail is `pointer-events: none` outside the chaptered region. Accessibility 7.20 is the entry's lowest sub-score [verified].
- **No `<h1>` on the homepage** [verified, index.html]: headings start at `<h2>`, an `<h4>` styled `fs-h3` sits under an `<h3>`, and the brand name exists only inside an `aria-hidden` SVG. Semantics/SEO 7.40 [verified].
- Placeholder content in production [verified]: `keyword 2, keyword 2` in the keywords meta; `alt="Slide 1|2|3"` on the carousel; `© 2021` in a 2025-award footer.
- DOM behind the canvas: pass [verified] — every division, ESG and office block is in the static HTML; the canvas is decorative and marked so.
- The phone: designed, not shrunk [verified, four mobile frames; `mobile-s25` was lost to a screenshot timeout]. Nav collapses to brand + badge + Menu, the scroll cue becomes `Swipe down`, floating circular controls replace the rail, ESG tiles stack. Responsive 7.60 [verified].
- The consent gate is the real usability tax [verified, all frames]: it covers the bottom third of the desktop viewport and most of the phone, over the hero, in a site whose whole argument is one uninterrupted view. Usability 7.40 is the entry's lowest axis [verified].
- What the awards skills do differently: a reduced-motion tier that freezes the camera on a lit still and keeps chapter jumps working; keyboard parity for the draggable chapter and `:focus-visible` labels on the rail; one `<h1>` with the brand name as text; the consent banner as a small corner sheet that never covers the hero; a subset font payload (two or three cuts, woff2 only); a complete OG set with an image; and placeholder copy caught by a pre-ship audit rather than a jury.

## 7. Principles (3–6, generalisable)
1. When the product cannot be shown, build the world the *name* implies — mine the etymology for a landscape.
2. Sober words against extravagant motion: institutional copy never winks; the camera carries all the personality. The jury rewarded exactly that split.
3. Declare motion in markup and resolve it in one registry: `data-animation="…"` lets a static-first site animate without a component framework, and lets a page's motion be audited by grep.
4. A chaptered scroll must also be skippable, and the rail must be anchors — a jump rail respects the visitor who came for one section and is keyboard-navigable for free.
5. One clock: drive the smooth-scroll library from the render loop that already exists, disable lag smoothing, and feed the scroll library's event to the scroll-trigger library.
6. Persist the expensive things across routes — canvas, cursor, header — so a cross-document transition costs a swap, not a reboot.

## 8. Take / Don't take
- **Take:**
  - Metaphor-from-the-name: derive the 3D world from what the brand is called, not from what it sells.
  - The procedural-terrain recipe: Perlin + Voronoi noise, a rock diffuse/normal pair, a snow-mix mask, a baked lightmap, one EXR HDRI, KTX2 textures — no photogrammetry, no composer.
  - The rail contract: one ScrollTrigger per chapter at `top 85% / bottom 85%`, `onUpdate` scrubbing a progress bar's `scaleY`, dots staggered in and out at `.1 / .6 / power2.out`.
  - `data-animation` / `data-cursor` / `data-theme-chapters` as a declarative layer: behaviour named in markup, implemented once.
  - Driving Lenis from the renderer's after-render event with `gsap.ticker.lagSmoothing(0)`.
  - `transition-persist` on canvas, cursor and header under Astro View Transitions.
  - A division/sub-brand switcher persistent in the nav for any holding structure — parent plus N children always visible.
  - An audio-reactive toggle whose canvas *is* the icon, fetched lazily, `stopped` at boot.
  - A geometric-sans institutional voice (the *class*, not these faces) when a client must read as heritage rather than tech.
- **Don't take:**
  - The mountain — any snow-and-rock peak scrubbed by scroll is this site.
  - The logomark-over-peak hero, the division positioning lines, the office list, the ESG pillar copy.
  - `#2d628c` and its ramp; white-at-0.8 over snow as a package.
  - Century Gothic + Josefin Sans as a pairing, and never the whole-family payload.
  - The two-arc gradient-ring preloader as drawn; the chapter order Hero → Who we are → What we do → Global connectivity → Sustainability → Solutions → Equality.
  - The 24×24 sound icon as an asset.
  - Its accessibility posture: no `h1`, no reduced-motion branch, pointer-only drag. Those are the three sub-scores it lost.

## 9. Confidence and sources
Awards, scores and credits high (entry read verbatim; the axis and developer orders check out against the 40/30/20/10 and six-way means) · palette, type, tokens and easings high (stylesheet read) · components high (served markup + captures) · motion high (bundle read; every parameter quoted from source) · stack high (served HTML + bundles) · a11y high (absence verified in source, corroborated by the sub-scores) · perf medium (CLS, DOM and asset handling observed; LCP not measurable in headless SwiftShader) · concept and tone inferred, medium.
Live pass 2026-09-18: reachable, capture exit 2 (one mobile frame lost to a screenshot timeout), scroll mode native, sources index.html, _slug_.CRG2uH_C.css, Layout.astro…RJ8D73Hs.js, WebGL.astro…wO7n4uvo.js, ChaptersNavigation.astro…CydF1g6_.js, Solutions.astro…O1AcBC4Y.js, App.ST3WWojO.js, manifest.json, the fourteen capture frames, and the Awwwards entry HTML (awwwards.com/sites/montfort).
Earlier sources retained for the texture set, the office list and the ESG copy: `Parthkk90/mont-fort.com` static mirror (`index.html`, `_astro/`, `assets/fonts`, `assets/textures`); `parw8649/…/MONTFORT-CLONE.md`; `suhasreverie/mont-fort-replica` (stack only, content claims discarded); `WebDeveloper-Taslima/Minimalist-3D-Interactive-Story-Website`. Replicas seen, not read: `ahadarain4/mont-fort-clone`, `ubaid926/mont-fort-office`, `himavamsi12/mont-fort-trail`, `KathiravansCode/mont-fort-project`, `aeternitas120/AURION.new`. Research report: `scratchpad/research/batch-D.md`.
