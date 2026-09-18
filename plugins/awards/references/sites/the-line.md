# The Line — https://thelinestudio.com/

| Field | Value |
|---|---|
| Class | studio — an animation studio in London; work-first portfolio + studio identity + news + contact [verified: `info@thelinestudio.com`; nav label `LONDON,ENGLAND`] |
| Visitor mode | persuade |
| Awards | Awwwards **Site of the Month Nov 2024** and **Site of the Day 5 Nov 2024** [verified: `families.json`, `roshanvijay37` data.js, and a clone repo whose premise is this SOTM]; numeric score, Developer Award, CSSDA, FWA, Godly [unknown] |
| Studio / credits | submitted as The Line Studio itself — in-house or close-partner build [recalled medium]; a `Site Credits` page exists, so a definitive list is published [verified link; contents unknown]. Do not attribute to a named agency |
| Stack (evidence level) | Nuxt (Vue) [verified: one automated live-CSS detection in `design-bites` — medium-high] · Denim variable font, `DenimVF.woff`, `ss03` on [verified] · some smooth / virtual scroll [verified: custom scrollbar]; Lenis in the original [unknown — the reconstruction uses `lenis/react`, recalled medium] · CMS, hosting, any WebGL [unknown] · adaptive MP4 / WebM with posters, greyscaled in CSS [inferred] |
| Palette | `#DDDEE2` canvas · `#F8F8F8` near-white · `#0B0B0B` ink · `#FF391E` flare red (active nav + sticky footer only) · `#FF0000` hero acetate (multiply) · `rgba(222,223,227,0.95)` feature panels [verified: three independent extractions agree to the hex]. Strategy: one cool grey ground + one hot ink as a bookend, plus one overprint layer |
| Type | single variable grotesk — Denim (`DenimVF` / family `DenimWeb`), `ss03` applied universally [verified]; foundry [unknown]. Macro / micro contract: 210 px display on a 1728 artboard (`12.15278vw`) against ~9 px uppercase micro-labels, nothing between [verified] |
| WebGL dosage | moments — DOM / CSS-first; a canvas or GL plane only for cursor and reveal [verified component names `Cursor`, `CursorPlane`; GL use itself unknown] |
| Scroll model | native scroll preserved under a custom-drawn scrollbar; sticky stages + invisible rails, never `pin: true` [verified] |
| Narrative model | print artefact — a call sheet about film; conventional studio IA elevated by treatment [verified structure; framing recalled high] |

## 1. Concept and narrative
**One idea:** the site behaves like a printed artefact about film. Heterogeneous footage — 2D cels, CG, documentary stills, live video — is unified by flooding it with one saturated ink, exactly as a printer's overprint would [recalled high: `families.json` family `single-ink-cinema-poster`]. The mechanism is an `aria-hidden` div, flat red, `mix-blend-mode: multiply`, laid over greyscaled footage; the dataset names the class `.acetate`, after the gel sheet [verified]. One hue *is* the art direction.

Beats [verified order, from the reconstruction's sections]: hero (the acetate hinges away) → the studio → work listing by client → clients & partners → news → contact → sticky red footer. The red bookends the visit — active nav state and footer only — so the arrival of colour is an event [verified].

**Tone:** working-studio voice, not luxury-brand voice. Status dots, slash-delimited nav, `/ MICRO / LABELS /`, underlined credit tables, a Roman-numeral year and a `00/24` fps preloader at headline scale [verified]. It reads like a call sheet. Work named on the site [verified slugs]: the Warframe 1999 animated prologue, Azuki Elementals, Battle Aces (Uncapped Games), Cowboy Bebop, Chobani "Dear Alice" (dir. Bjørn-Erik Aschim, score Joe Hisaishi, 2021); news: a Riot Games Spirit Blossom partnership, The Line Editions drop 001.

## 2. Structure and components
Routes [verified]: `/`, `/work/<slug>`, `/blog/<slug>`, `/about`, `/privacy`, plus a `Site Credits` link in the footer. 404 [unknown].

Sections [verified: reconstruction file tree]: `Hero`, `TheStudio`, `Group` / `GroupClient` (work listing), `ClientsPlusPartners`, `News`, `Contact`, `Footer`.

| Component | What it does | Label |
|---|---|---|
| Preloader | `00/24` frame counter at headline scale — a film leader, not a spinner | [verified] |
| `NavBar` (+ `Desktop`, `Mobile`, `NavItem`), `SideBar` | slash-delimited nav; active item in flare red | [verified] |
| `Cursor` + `CursorPlane` | custom cursor with a plane companion for reveals | [verified names; GL vs CSS unknown] |
| `HoverReveal` | footage / image reveal following the cursor (the `/about` version was rebuilt independently with GSAP) | [verified: `1jayeshpoduval/image-overlay-animation`] |
| `FlickerText` | per-letter neon-strike text (parameters in §4) | [verified] |
| `ProjectCard`, `HighlightCard`, `AccordianItem`, `List` / `Label` | work listing, featured work, expandable rows, credit tables | [verified] |
| `ScrollBar` + `ScrollBarWrapper` | custom scrollbar, native one suppressed; `#0b0b0b` handle | [verified] |
| `OpenTimings` | live studio open / closed state | [verified] |
| `ClosingLogoBlock`, `ReachOut`, `ContactDesktop` / `Mobile`, `Input`, `Up` | closing logo, contact form, back-to-top | [verified] |
| `IntersectionObserverPlane` | viewport-entry trigger for reveals | [verified name; behaviour inferred] |
| `FooterDesktop` / `Mobile` | sticky flare-red footer with a 343 px bottom zone | [verified] |
| `SVGs/LogoWithTrademark` | logotype | [verified] |
| Easter eggs, sound | — | [unknown] |

## 3. Visual language
**Palette roles** [verified]: `#DDDEE2` is the page ground — a cool, blue-tinged silver, deliberately not white; `#F8F8F8` for the intro section and nav links on the overlay; `#0B0B0B` for body text and the scrollbar handle; `#FF391E` only for the active nav state and the sticky footer; `#FF0000` only as the hero acetate under multiply; `rgba(222,223,227,0.95)` behind featured-work assets.

**Type scale** [verified: two CSS extractions reconcile exactly]: display 210 px on the 1728 px artboard = `12.15278vw`, line-height ~.8–.95, tracking `-0.04em`, weight 500; micro-labels ~9 px uppercase, weight 440; body 16 px / 400; buttons 13 px. Cross-check: 155 px at a 1275 px viewport *is* 12.15278vw, and −6.22 px tracking at 155 px *is* −0.04em. The first glyph of a display line is optically hung past the 8 px margin via per-glyph negative margins [verified].

**vw-lock** [verified]: every desktop value is a six-decimal vw from a 1728 artboard — `1.27315vw` = 22 px, `1.85185vw` = 32 px, `7.29167vw` = 126 px, `12.15278vw` = 210 px. Rule: `px / 1728 × 100`, kept to full precision. Below the tablet breakpoint values are fixed px (`text-[72px]`, `h-[22px] w-[126px]`) — fixed on small screens, fluid on large [verified].

**Material**: zero border-radius, zero shadows; depth comes only from surface luminance — near-white 0.973 → cool grey 0.871 → footer red 0.444 → near-black 0.043 [verified]. Imagery is greyscaled footage under the acetate, so every project reads as one body of work.

**Layout**: 8 px page margin; breakpoints 767 / 768 / 1023 / 1024 / 1240 / 1600 [verified]; `text-rendering: optimizeLegibility`, antialiased [verified].

**Browser surfaces** [verified]: custom scrollbar; selection is flare red with off-white text; the slash before labels is a CSS pseudo-element (`content: '/\00A0'`, light weight), not markup.

## 4. Motion and effects (with parameters)
- **The hero hinge** [verified]: a full-viewport `#ff0000` panel with `mix-blend-mode: multiply`, plus the logo layer, both `transform-origin: bottom left`, translate `x: 0% → -10%` and rotate `0deg → -15deg` across the hero's scroll range. The first screen swings away like a sheet of acetate on a light table.
- **Generalised hinge rule** [verified in `families.json`; medium as a generalisation]: panels hinge 4–15° on a *named* `transformOrigin` corner; the child rotates harder and lags the parent, so paper shears rather than moves rigidly.
- **Scroll choreography** [verified]: sticky stages with invisible rails — a tall transparent spacer sets the distance, the visual stays `position: sticky`; explicitly never `pin: true` (`[recipe:sticky-stages-rails]`).
- **FlickerText** [verified]: per-letter `opacity` keyframe ladder `[0, 1, 0, 0, 1, 1]` with a computed `times` array staggered ~0.04 s per glyph — a neon tube striking; runs once on mount and again on mouse-enter. On hover the whole line shifts `x` by a vw-locked amount with `cubic-bezier(0.19, 1, 0.22, 1)` (expo-out).
- **Hover reveal** [verified]: cursor-following image / footage reveal on the about and work lists; implementation (GL plane vs CSS / canvas) [unknown].
- **Smooth scroll**: present [verified: custom scrollbar]; library and lerp [unknown].
- **Preloader**: `00/24` counter [verified]; its timing, hold and exit [unknown] — compare the counter hold-at-100 in [site:leo-parpeix] and the boot readouts in [site:usavionix].
- Route transitions, sound, WebGL shaders [unknown].

## 5. Tech and pipeline
- Nuxt with six breakpoints [verified: `design-bites` DESIGN.md, automated — medium-high]. The Next + Framer Motion + Lenis + Tailwind stack of the public clone is the rebuilder's choice, not the original's [verified: clone `package.json`].
- Fonts: `DenimVF.woff`, `ss03` universal; no second family [verified].
- Assets: reel and project footage as video; greyscale is a CSS filter so the red layer can key over it [inferred] — the main weight and compositing cost [inferred].
- CMS: a studio with `/work` and `/blog` almost certainly has one; the genre norm is Sanity / Storyblok / Prismic, but there is no evidence [unknown]. Hosting [unknown].
- Resize strategy: the vw-lock removes JS layout work on resize; only the 767 / 768 hand-off changes the unit system [inferred].
- Performance: no score published; the sources show nothing about budgets [unknown].

## 6. Weaknesses
- `prefers-reduced-motion` handling [unknown]; the hinge and flicker vocabulary is the obvious audit point.
- Hiding the native scrollbar and drawing a custom one is a keyboard / assistive-tech risk unless native scrolling is preserved underneath [verified pattern; behaviour unknown].
- Hover-only reveals on the work and about lists have no evidenced keyboard equivalent [unknown].
- Video-heavy pages with a live greyscale filter are compositing-sensitive on low-end devices [inferred].
- The decorative red layer is correctly `aria-hidden` [verified] — a strength worth naming.
- **What the awards skills do differently:** keep native scroll under any custom scrollbar (Lenis on the document, never wheel-jacking) and let keys, PageDown and the scrollbar all work; run `gsap.matchMedia()` tiers so the hinge becomes a cut and the flicker a single opacity step under reduced motion; give every hover reveal a focus-visible equivalent (Tab shows the preview) and a coarse-pointer state; tie the fps preloader to a real `Promise.all(fonts, assets)`, announce with `aria-live`, and skip it on repeat visits (≤ 2.5 s); pre-greyscale video sources, ship posters, `muted playsinline`, and pause offscreen; keep the `aria-hidden` acetate.

## 7. Principles
1. **One ink can be the whole art direction.** Greyscale everything, overprint one hue — the cheapest, highest-leverage unifier for heterogeneous imagery.
2. **Macro and micro with nothing between.** A display size and a label size, no intermediate tier, reads as a system rather than a hierarchy.
3. **The medium proves itself.** A craft studio demonstrates its craft in the interface — hinging, striking, revealing — instead of embedding a reel and stopping.
4. **Sharp and shadowless.** No radius, no shadows; depth by luminance only, so the single colour moment lands.
5. **Chrome in the client's dialect.** Frame counters, call-sheet labels, credit tables — the UI speaks the industry's own paperwork.
6. **Colour as a bookend.** An accent used in exactly two places frames the visit rather than decorating it.

## 8. Take / Don't take
- **Take:**
  - The single-ink overprint as a *mechanism*: greyscale all imagery / video, then an `aria-hidden` flat-colour layer with `mix-blend-mode: multiply`; one token changes the site's identity. Decision: use it when the imagery is heterogeneous and the brand owns one hue.
  - The vw-lock: pick a desktop artboard (1728 or 1440), convert every desktop measurement with `px / artboard × 100` at full precision, switch to fixed px below ~768, optionally wrap in `clamp()` for products. Adopt the rule, not these values.
  - The hinge transition: `transform-origin` at a named corner, 4–15° rotation, parent and child at different rates so the child lags. Reads as physical paper; far more specific than translate-and-fade.
  - Sticky stages with invisible rails instead of `pin: true` — no pin-spacer layout bugs, native scroll intact.
  - Per-letter flicker: a non-monotonic opacity ladder with a per-index stagger baked into `times` (~0.04 s); the irregularity is what reads as a tube striking.
  - Macro / micro type: ~12 vw display (leading .8–.95, tracking −0.04em) against ~9 px uppercase labels, first glyph hung past the margin.
  - Chrome as genre signal: pick the audience's own paperwork (fps counters, spec tables, coordinate readouts — compare [site:igloo]) and render the UI in it.
  - Colour as a bookend: the accent in an active state and the last screen, nowhere else.
- **Don't take:**
  - The red-acetate-over-greyscale-film look itself, the `.acetate` hinge on the hero, the `00/24` frame-counter preloader.
  - The hexes `#DDDEE2` / `#F8F8F8` / `#0B0B0B` / `#FF391E` / `#FF0000` and the cool-silver + flare-red pairing.
  - Denim (`ss03`) as the face; the 210 px / 9 px pair as literal sizes; the six breakpoints as-is.
  - The call-sheet furniture as a set: status dots, slash nav, Roman-numeral year, `/ MICRO / LABELS /`, `LONDON,ENGLAND`.
  - The section order hero → studio → work → clients → news → contact → sticky red footer, and the sticky red footer with its 343 px zone.
  - Any project imagery, client names or copy lines.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Awards (SOTM Nov 2024, SOTD 5 Nov 2024) | high — three sources |
| Credits | low — studio-attributed; individuals unknown |
| Palette and type | very high — three independent extractions agree to the hex and the em |
| Layout system (1728 vw-lock) | high — reconstruction arithmetic matches the dataset's "210 px at 1728" |
| Sections and components | high — pixel-perfect reconstruction mirrors the original's structure |
| Motion | high for the hero hinge and flicker; medium for the generalised hinge rule |
| Nuxt | medium-high — single automated detection |
| CMS, hosting, WebGL, reduced motion, score | unknown |

Sources: `raw.githubusercontent.com/educlopez/design-bites/main/design-mds/thelinestudio.com/DESIGN.md` · `.../ryanonline1234/mediatastelibrary/main/data/families.json` (family `single-ink-cinema-poster`) · `.../YashwantOstwal/the-line-awwwards-SOTM/main/{package.json, app/globals.css, app/layout.tsx, sections/Hero.tsx, components/FlickerText.tsx, components/NavBarDesktop.tsx, sections/GroupClient.tsx, sections/News.tsx}` · `github.com/YashwantOstwal/the-line-awwwards-SOTM/tree/main/{sections,components}` · `.../roshanvijay37/Roshan/main/public/awwwards/data.js` · `.../1jayeshpoduval/image-overlay-animation` · `.../dcellison/phi/book/bibliography.md` · `.../migueljnew-droid/ui-ux-gold-standard` (Nuxt prevalence). Batch-E research report, 2026-09-17; the site itself was unreachable through the egress proxy.
