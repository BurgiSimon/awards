I have deep verified evidence across all four. Writing the report.

---

# Batch D — Deep site analysis

**Method note:** GitHub HTML search *did* work through WebFetch, which changed everything. For three of the four sites I found third-party rebuilds, clones or outright static mirrors on GitHub and read their source. That converts a lot of what would have been recollection into named-source evidence. Every claim below is labelled. Where a fact comes from a *clone*, I say so — a cloner's stack choice is not the original's stack unless the clone mirrors original assets (which one of them does, byte-for-byte).

---

## Lando Norris — https://landonorris.com/

- **Type / purpose**
Athlete personal-brand site for the McLaren F1 driver — a multi-route brand world, not a one-pager. [verified] Seven routes plus a 404 template: `/`, `/on-track`, `/off-track`, `/calendar`, `/partnerships`, `/legal/privacy-policy`, `/legal/terms-conditions` (source: `boyang-hu/landonorris-rebuild` README + REBUILD_PLAN.md). The information architecture splits the persona into a racing self (`/on-track`) and a civilian self (`/off-track`) — that split *is* the concept. [inferred] Commercial purpose is partnership/sponsor inventory (`/partnerships`) plus fan capture (Klaviyo is runtime-injected — [verified] engine-notes).

- **Awards & recognition**
[verified] The site's own Three.js asset manifest contains a **GLB model of an Awwwards "SOTD" trophy** (listed in REBUILD_PLAN.md alongside `helmet-21`, `tracks-05` and a disco ball). A studio does not model and ship a Site-of-the-Day statue unless it won one.
[inferred, high] Therefore: Awwwards **Site of the Day**, at minimum, and it is displayed *inside the 3D scene* as a flex/easter-egg.
[recalled, medium] I believe it also picked up Awwwards Honourable-Mention-tier recognition beyond SOTD and was widely circulated in 2025 award roundups.
[unknown] Exact SOTD date, jury/public scores, SOTM/SOTY status, FWA, CSSDA, Godly. **I will not invent these.** Do not let the skill assert a score.

- **Credits**
[verified, indirect but strong] The production bundle, Rive files, GL models and textures are served from **`lando.itsoffbrand.io`** and **`assets.itsoffbrand.io/lando/`** (engine-notes.md + REBUILD_PLAN.md). Hosting the client's entire custom bundle on your own agency subdomain is conclusive: **OFF+BRAND built it.** This confirms the user's earlier research.
[low confidence] OFF+BRAND's home city — the user says Glasgow; my own recollection leans Belfast / Northern Ireland with a London footprint. I cannot verify either, so the skill should not state a city.
[recalled, medium] OFF+BRAND is a Webflow-specialist studio and a Webflow-awards recipient, which matches the stack below exactly.
[unknown] Individual designer/developer/3D-artist names.

- **Concept & narrative**
[inferred from verified structure] The organising idea is **the visor**: you enter through the helmet. The homepage hero is a parallax avatar with a **wireframe helmet overlay running a scanline shader** ([verified], REBUILD_PLAN.md) — i.e. the driver is literally rendered as telemetry. From there the site forks on-track / off-track.
[verified] `/calendar` renders the **season as a 3D racetrack visualisation** with fluorescent wall structures, DOM-anchored sprint markers, and automatic highlighting of the current round — the schedule is a spatial object, not a table.
[verified] `/on-track` runs a **"heroflip"** sequence: a gold helmet driven along a **Bézier motion path**.
[verified] The 404 is an **orbiting helmet with dual quaternion transforms** — even the error page is authored.
[verified] Eight Rive files named: page-transition, hamburger, **phrases**, **signature**, **reef**, **circuits**, **mob-landscape**, **ln4**. Reading those names: `ln4` is his personal monogram mark; `signature` is a handwriting draw-on; `circuits` is animated track maps; `phrases` is rotating copy; `reef` is [inferred] his marine/environmental philanthropy; `mob-landscape` is a rotate-your-device prompt.
[inferred] Tone: confident, low-word-count, athletic. Copy is label-like (nav words, phrase loops) rather than paragraph-driven — the 3D carries the story.

- **Visual design language**
[verified] **Dual light/dark theme, switched by scroll position** — the nav samples the topmost section to decide its theme state. (Amusing verified detail: that logic contains a dead branch that reads `window.ScrollTrigger`, which never exists in the bundle, so a fallback scroll listener does the real work.)
[verified] Typography: **Mona Sans** (variable, woff2, multiple custom weight instances) + **Brier Bold** as display. Mona Sans is GitHub's open variable grotesque — a deliberate anti-luxury, engineering-flavoured choice for a driver brand.
[verified] **MSDF text rendered inside WebGL** via `three-msdf-text-utils@1.5.0` + `word-wrapper` — so headline type exists in 3D space, crisp at any scale, not as textured quads.
[verified] Materials: StandardMaterial PBR (albedo / normal / roughness / metallic / occlusion) plus **matcap** materials and **RGBE HDRI** environment lighting.
[unknown] Exact brand hexes. The manifest is documented but colour tokens were not in the excerpts I read. **Do not state hexes for this site.** (Genre note: [inferred] the papaya-adjacent orange of McLaren is conspicuously *not* guaranteed here — this is his personal brand, not McLaren's.)
[verified] Layout system: a **bespoke fluid clamp scale** driven by a `--fluid-font` custom property, with a **1728px design baseline** — i.e. the comp was drawn at 1728 and everything interpolates from it.

- **Components & sections**
[verified] SPA router with full page transitions (**@unseenco/taxi 1.8.0**) — intercepts link clicks, prefetches the route, tears down the old DOM, fires page-init callbacks.
[verified] Preloader/transition is a **Rive animation gated on GL asset readiness** — the startup chain resolves a `Promise.all()` of Rive-ready + GL-assets-loaded before revealing the banner.
[verified] Rive-driven **hamburger/menu** morph.
[verified] Six distinct WebGL scenes: `head`, `tracks`, `background`, `carousel`, `helmet-scroll`, `not-found`. Note `carousel` — a 3D carousel component — and `helmet-scroll`, a scroll-pinned helmet sequence.
[verified] Calendar page has **DOM elements registered into the 3D scene** as sprint markers (DOM↔WebGL coordinate sync).
[verified] Vimeo video, lazy-loaded via a `window.Vimeo` global — video is deferred, not in the critical path.
[verified] A hidden **`?debug` query flag** unlocks `dat.gui@0.7.9` + `stats-gl@4.2.3`. That is a shipped developer easter egg.
[verified] A **disco-ball GLB** ships in the manifest — an easter egg, almost certainly tied to a celebration/party state.

- **Motion & creative effects**
[verified] Smooth scroll: **Lenis 1.1.20**.
[verified] Animation: **GSAP 3.13.0** — core, CSSPlugin, **Observer**, **ScrollTrigger**, **MotionPathPlugin**, **SplitText**. SplitText recalculates layout *after* font load (correct practice; prevents reflow-shredded lines).
[verified] Post-processing: `EffectComposer` → `RenderPass` → **UnrealBloom** → `ShaderPass`, with three bloom intensity presets (**1.5 / 0.5 / 0.25**) used per scene.
[verified] A **six-pass fluid simulation** shader pipeline with noise sampling.
[verified] **Scanline shader**, time-driven, overlaid on the wireframe helmet.
[verified] **Idle displacement** loop using Perlin/Simplex noise — nothing on screen is ever fully static.
[verified] Roughly **88 `void main` shader entry points** in the bundle (mostly three.js chunks; a meaningful custom subset).
[verified] Camera choreography via `OrbitControls`, driven by GSAP timelines during transitions; scenes are torn down and rebuilt across route changes.
[verified] Transition orchestration = Rive state change + camera move + Three.js teardown/setup, sequenced on one GSAP timeline.
[unknown] Custom cursor and sound design — not evidenced in anything I read. [inferred] genre-typical for this tier, but do not assert.

- **Tech stack (with evidence)**
| Layer | Value | Evidence |
|---|---|---|
| CMS / platform | **Webflow** (assets on `cdn.prod.website-files.com`, `webflow.js` + jQuery 3.5.1 baseline) | [verified] README + engine-notes |
| Custom bundle | **esbuild ESM**, 776 top-level declarations, `__esm`/`__commonJS` helpers, *not* webpack/Turbopack | [verified] engine-notes |
| Bundle host | `lando.itsoffbrand.io` | [verified] |
| Smooth scroll | Lenis 1.1.20 | [verified] |
| Animation | GSAP 3.13.0 (+Observer, ScrollTrigger, MotionPath, SplitText) | [verified] |
| 3D | Three.js **r174** | [verified] |
| 3D text | three-msdf-text-utils 1.5.0 + word-wrapper | [verified] |
| Vector animation | **Rive** `@rive-app/canvas-lite` 2.26.4, 8 files | [verified] |
| Page transitions | @unseenco/taxi 1.8.0 | [verified] |
| Loaders | DRACO, GLTF, RGBE, Font, KTX2/Basis | [verified] |
| Debug | dat.gui 0.7.9, stats-gl 4.2.3 behind `?debug` | [verified] |
| Fonts | Mona Sans (variable woff2), Brier Bold | [verified] |
| Marketing | Klaviyo (runtime-injected), Vimeo | [verified] |

**This is the headline architectural lesson: Webflow is used purely as the content shell + hosting, while a hand-written esbuild ESM bundle served from the agency's own subdomain does 100% of the experience.** That hybrid is how a "Webflow site" wins a developer-tier award.

- **Responsive / accessibility / performance notes**
[verified] **Texture format is chosen by `innerWidth`, not user agent**: desktop gets WebP, viewports ≤991px get **KTX2/Basis** compressed textures (GPU-native, far smaller VRAM). This is a genuinely good pattern — but keying it on width rather than capability is a documented flaw (a narrow desktop window gets mobile textures).
[verified] Crossing the **992px breakpoint forces a full page reload** — a pragmatic escape hatch for rebuilding six WebGL scenes, and an honest admission that the scenes aren't resize-elastic. Costly for accessibility (zoom users can trip it).
[verified] DRACO mesh compression + KTX2 textures + lazy Vimeo + preconnect/dns-prefetch hints to the CDN.
[verified] `mob-landscape` Rive file implies a device-orientation prompt rather than a true landscape layout.
[verified] The rebuild's audit found genuine dead code in production: a `window.ScrollTrigger` branch that never runs, `scene.remove(name)` which is a silent no-op, an undefined `iridescence` material property, and an unused `textures.helmet.mask` manifest entry. **Useful honesty for the skill: award-winning sites ship dead branches too.**
[unknown] Reduced-motion handling, keyboard nav, contrast audits, Lighthouse/CWV numbers. Six WebGL scenes + Rive + Lenis is [inferred] heavy; assume LCP/TBT are not the selling point.

- **Why it is award-worthy**
1. **One metaphor, executed in the rendering pipeline, not in copy.** "Driver as telemetry" becomes a wireframe-helmet scanline shader. The idea lives in the GLSL.
2. **Every route is authored, including 404.** Depth of finish across seven pages beats a spectacular single page.
3. **Data made spatial.** A race calendar is normally a table; here it is a 3D circuit with the current round self-highlighting. Find the one dataset that deserves geometry.
4. **Two animation runtimes used for what each is best at.** Rive for authored 2D vector states (menu, signature, transitions); Three.js/GSAP for spatial and scroll-linked work. Neither is forced to do the other's job.
5. **Boring platform, uncompromised craft.** Webflow for content ops, hand-rolled ESM for the experience — the client can edit copy without touching the engine.
6. **Restraint disguised as excess.** Six scenes, but each with a single clear job; bloom is tuned to three fixed intensities rather than per-scene guesswork.

- **Reusable patterns to extract**
  - **Shell/engine split**: CMS or static host owns content + SEO; a single self-hosted ESM bundle owns all motion. Deploy them independently.
  - **Asset-gated preloader**: `Promise.all([vectorAnimationReady, glAssetsLoaded])` → then reveal. Never reveal on a timer.
  - **Persona-fork IA**: split a single subject into two opposed routes (on/off, work/play, day/night) and let the nav dramatise the choice.
  - **DOM↔3D marker sync**: position HTML labels against projected 3D coordinates so text stays accessible/selectable while geometry stays in WebGL.
  - **Viewport-tiered texture formats**: ship KTX2/Basis to low-VRAM devices and WebP to desktop — but branch on *capability detection*, improving on the original's `innerWidth` check.
  - **Fluid type from a single design baseline**: one `--fluid-font` clamp anchored to the actual comp width (e.g. 1728), everything else derived.
  - **Three fixed bloom presets** instead of per-scene ad-hoc values — a tiny discipline that keeps a multi-scene site visually coherent.
  - **Shipped `?debug` panel** (GUI + GPU stats) as a build-time-stripped-or-gated dev affordance.
  - **Scroll-position-driven theme inversion** for the nav, sampling the section currently under the header.
  - **One easter-egg asset** (a trophy, a disco ball) that rewards exploration without blocking the main path.

- **Confidence & sources**
Type/IA, tech stack, scenes, shaders, Rive, fonts, CDN, breakpoint behaviour: **[verified], high** — all from `boyang-hu/landonorris-rebuild` (`README.md`, `REBUILD_PLAN.md`, `docs/engine-notes.md`), a self-described 1:1 reverse-engineering with SHA256 ledgers and pixel-probe gates; its specificity (line ranges, exact versions, named dead branches) reads as genuine bundle analysis, not invention. Agency attribution: **[verified], high** via the `itsoffbrand.io` asset domains. Awards: **[inferred] high for SOTD** from the trophy GLB; **[unknown]** for all specifics. Palette, cursor, sound, a11y: **[unknown]**.
URLs used: `https://github.com/boyang-hu/landonorris-rebuild`, `https://raw.githubusercontent.com/boyang-hu/landonorris-rebuild/main/README.md`, `.../main/REBUILD_PLAN.md`, `.../main/docs/engine-notes.md`. Related clones seen in search (not read): `OtanoStudio/Lando-Demo` (r3f reconstruction of the hero *without* the mouse trail — implying [inferred] the original has a **mouse trail** effect), `ChenSenhao0104/...homepage-effect...reproduced` (GLSL), `SheryiansResearchClub/Landonorris-Clone`.

---

## Montfort Group — https://mont-fort.com/

**Correction up front: this is not a ski resort or a Verbier tourism site.** [verified]

- **Type / purpose**
[verified] **Montfort Group — a global commodity trading and asset investment company.** Meta description, verbatim: *"We are a global commodity trading company and asset investment company that trade in physical commodity, small commodity, downstream oil in UAE, Singapore, Switzerland."* Title: `Montfort Group`. Source: a **complete static mirror of the production site** at `Parthkk90/mont-fort.com` (`index.html`, `_astro/`, `assets/`, plus `cdn-cgi/scripts/.../cloudflare-static/`).
[verified] Four divisions, each with its own positioning line: **Montfort Trading** ("Operating Efficiently by Leading with Innovation."), **Montfort Capital** ("Identify and seize opportunities that maximise Value"), **Montfort Maritime** ("Powering Progress, Delivering Energy."), **Fort Energy** ("Advancing Innovation in Energy Investments").
[inferred, high] The *name* does come from the Alps — **Mont Fort is the 3,330 m peak above Verbier** — and the site's texture set (`snowRockMix`, `snow_diffuse`, `rock_diffuse`, `rock_normal`) confirms a **mountain is rendered in 3D on the homepage**. So the user's Swiss-Alps instinct was right about the *imagery and the brand metaphor*, wrong about the *business*. This is an oil-and-commodities trader that has branded itself as a Swiss mountain.

- **Awards & recognition**
[recalled, low-medium] I have a weak impression of this site circulating in award galleries around 2025. I am not confident.
[unknown] Awwwards SOTD/SOTM/SOTY, FWA, CSSDA, Godly, dates, scores, tags. **Assert nothing.**
[verified, as a proxy for reputation] It has attracted an unusual number of imitators on GitHub — `suhasreverie/mont-fort-replica`, `ahadarain4/mont-fort-clone`, `ubaid926/mont-fort-office`, `himavamsi12/mont-fort-trail`, `KathiravansCode/mont-fort-project`, `parw8649/experiment_monica_clinic_website` ("pixel-perfect clone"), plus `aeternitas120/AURION.new` and `WebDeveloper-Taslima/Minimalist-3D-Interactive-Story-Website` which both cite it as their explicit design benchmark. Clone-count is a real popularity signal even without a verifiable trophy.

- **Credits**
[unknown] Studio and individuals. Nothing in the mirror's markup named an agency in the excerpt I read. Given the Astro + custom-WebGL sophistication it is [inferred] an external specialist studio, not in-house.

- **Concept & narrative**
[verified] The bundle contains **`ChaptersNavigation.astro`** — the page is structured as **numbered chapters** with their own navigation affordance. This is a scroll-driven chaptered narrative, not a scrolling brochure.
[verified] The hero headline is the four division names set as one continuous string: *"Montfort Trading Capital Maritime Fort Energy"* — the brand architecture *is* the hero type.
[verified] Narrative spine, in order: identity (*"Montfort is a global commodity trading and asset investment company."*) → capability (*"We trade, refine, store, and transport energy and commodities."*) → promise (*"We provide energy solutions with integrity and efficiency through our different business divisions."*) → the four divisions → global footprint → sustainability/ESG → CSR.
[verified] Global-reach copy: *"Established in the world's major trade hubs and financial markets with over 15 global offices, we connect and serve both emerging and mature markets worldwide."* Offices named: **Switzerland, Istanbul, United Arab Emirates, Nairobi, Dar es Salam, Cape Town, Mumbai, Karachi, Maputo, Luxembourg, Xiamen, Singapore.**
[verified] ESG is given four numbered pillars — Ethics & Compliance Framework; Delivering Sustainable Energy Solutions (with E/S/G focus-area taxonomies); Our Commitment to Equality (*"staff from almost 38 nationalities across six continents. Over 35% female workforce; over 20% women in management"*); Corporate Social Responsibility (alleviating poverty, supporting education, empowering women — partners **Mercy Ships, Mercy Corps, Kenya Red Cross, Emirates Red Crescent, The Doyenne Initiative**).
[inferred] Tone: institutional, declarative, first-person plural, no wit. The *motion* supplies all the charisma; the *copy* stays board-room. **That contrast is the whole trick** — and it's the transferable insight for any B2B/heavy-industry client.

- **Visual design language**
[verified] Theme colour **`#2D628C`** — a desaturated slate blue, also declared in **`color(display-p3 0.1765 0.3843 0.5490)`**, i.e. the site ships a **wide-gamut P3 colour path**. This is the one hex I can state with confidence.
[verified] White at `#fff` with 0.8 / 1.0 opacity steps for text hierarchy.
[verified] Typography: **Century Gothic** (`CenturyGothic.woff2`, `CenturyGothic-Bold.woff2`) + **Josefin Sans Light** (`JosefinSans-Light.woff2`). Both are geometric sans faces with near-circular bowls and a single-storey `a` — a deliberately soft, almost 1930s-modernist voice. Century Gothic is an unfashionable choice that reads as *institutional heritage* rather than *startup*.
[verified] Imagery is **procedural, not photographic**: the texture set is `noise.webp`, `noise-solid-normal.webp`, `perlinNoise.webp`, `voronoi.webp`, `rock_diffuse.webp`, `rock_normal.webp`, `snowRockMix.webp`, plus `homepage/homepage-lightmap.webp` and `homepage/snow_diffuse.webp`, and a `trading/` texture folder. A **baked lightmap** means the mountain is a pre-lit static-lighting scene (cheap, beautiful, consistent).
[verified] An **EXR HDR environment map** and `.glb` models are in the production asset set (source: `MONTFORT-CLONE.md`, which documents serving Montfort's *original* fonts/models/CSS).
[inferred] Palette reads cool, pale, high-key — slate blue, snow white, rock grey. Do not assert further hexes.

- **Components & sections**
[verified] **Preloader** — inline SVG with two linear gradients named `spinner-firstHalf` / `spinner-secondHalf` using `currentColor` (the classic two-arc gradient ring).
[verified] **Sound toggle** — a `<canvas id="sound-canvas" width="24" height="24">`. A 24×24 canvas next to a sound control is a **live audio-reactive waveform/EQ icon**. So: **the site has sound, and the toggle visualises it.**
[verified] **Nav**: Montfort Group / Montfort Trading / Montfort Capital / Montfort Maritime / Fort Energy / News / Menu — i.e. a persistent division switcher plus a full-screen "Menu" overlay.
[verified] **News with an unread badge** — the markup shows "News (13 unread)" and there is a dedicated **`visitedNews.BmN7K1ri.js`** bundle. The site **persists which news items you've read (localStorage) and badges the rest.** That is a genuinely unusual, product-grade touch on a corporate site.
[verified] **Chapter navigation** (`ChaptersNavigation.astro`).
[verified] A dedicated **`Solutions.astro`** client script — the solutions/divisions section has bespoke interactive behaviour.
[verified] **`Social.astro`** script for the social block.
[verified] Footer/menu links: Contact, ESG, Privacy Policy, Terms of Use.
[inferred] Custom cursor — asserted by the `mont-fort-replica` README ("custom interactive cursor behaviors"), but that's a cloner's interpretation, so: [inferred, medium].

- **Motion & creative effects**
[verified] **WebGL**, in its own `WebGL.astro` client script, with **`KTX2Loader`** bundled — GPU-compressed textures on a corporate site, which tells you the 3D payload was taken seriously.
[verified] **GSAP ScrollTrigger** is bundled as its own chunk (`ScrollTrigger.6qCihK2t.js`).
[verified] **Lenis** smooth scroll + GSAP ScrollTrigger + Three.js (source: `MONTFORT-CLONE.md`, documenting the *original's* bundles which that project re-serves verbatim).
[verified] **Astro `ClientRouter`** — i.e. **View Transitions API** for route changes. This is the modern, no-framework-router approach to cross-page morphs: elements with matching `view-transition-name` animate between pages natively.
[verified] Scroll-driven chapter progression (from `ChaptersNavigation` + ScrollTrigger).
[verified] Ambient/interactive **sound** (from `sound-canvas`).
[inferred, high] The homepage is a **scroll-driven camera move across a procedurally-textured snow-and-rock mountain**, lit by a baked lightmap and an EXR HDRI — this is exactly what the texture manifest describes and what every imitator reproduced. The third-party benchmark project describes the pattern it copied as *"scroll position → normalised 0.0–1.0 chapter progress → interpolated camera transitions between scenes."*
[unknown] Specific shader work beyond noise/voronoi displacement; text-animation technique; page-transition choreography details.

- **Tech stack (with evidence)**
| Layer | Value | Evidence |
|---|---|---|
| Framework | **Astro v5.2.6** (generator meta tag) — static, island-hydrated | [verified] mirror `index.html` |
| Routing | **Astro ClientRouter** / View Transitions + a `router.B-sij-_X.js` chunk | [verified] |
| 3D | **Three.js**, with `KTX2Loader` chunked separately; `.glb` models; `.exr` HDRI | [verified] |
| Animation | **GSAP + ScrollTrigger** (own chunk) | [verified] |
| Smooth scroll | **Lenis** | [verified] MONTFORT-CLONE.md |
| Fonts | Century Gothic (regular+bold), Josefin Sans Light — **self-hosted woff2** | [verified] |
| Colour | `#2D628C` + display-p3 wide gamut | [verified] |
| Hosting/CDN | **Cloudflare** (`cdn-cgi/scripts/.../cloudflare-static/`) | [verified] |
| App chunks | `GlobalApp`, `Layout`, `WebGL`, `Solutions`, `ChaptersNavigation`, `Social`, `visitedNews`, `index` | [verified] |
| Styles | single `_slug_.B97dlsMJ.css` | [verified] |

**Architectural lesson: Astro + islands + View Transitions is a completely viable award-tier stack.** No React, no Next. The WebGL is one island; everything else is static HTML. That is why a heavy 3D corporate site can still be fast.

- **Responsive / accessibility / performance notes**
[verified] Static Astro output behind Cloudflare = excellent TTFB and cacheability; JS is split per-component so the WebGL chunk and KTX2Loader only load where needed.
[verified] All textures **WebP**; KTX2 available for GPU-side compression; a **baked lightmap** removes runtime lighting cost.
[verified] Self-hosted woff2 (no Google Fonts round-trip).
[verified] `robots: index, follow` and full OG tags — SEO was not sacrificed to the experience, which is the usual failure mode of 3D sites. Astro's static HTML means the ESG and division copy is all in the source.
[verified, minor flaw] `<meta name="keywords" content="keyword 2, keyword 2">` — a placeholder left in production. Even this site shipped with a bug.
[verified] A sound toggle exists, which is the correct pattern (sound must be opt-in and reversible).
[unknown] `prefers-reduced-motion`, keyboard access to chapter nav, contrast of white-at-0.8 over imagery, mobile 3D fallback, Lighthouse scores.

- **Why it is award-worthy**
1. **It gives a boring industry a landscape.** Commodity trading has no photogenic product, so the brand's mountain namesake became the entire visual system — procedural rock and snow instead of stock photos of oil terminals.
2. **Chaptered scroll with real navigation.** A long scroll narrative that also lets you *jump* respects the corporate visitor who came for the ESG page.
3. **Sober copy against maximal motion.** The words never wink. All the personality is in the camera. This is the model for luxury/institutional work.
4. **Product thinking inside marketing.** The persisted unread-news badge is a small, genuinely useful feature nobody demanded.
5. **Stack discipline.** Static Astro + one WebGL island + View Transitions delivers cinema without a SPA's weight or SEO cost.
6. **Wide-gamut colour.** Shipping display-p3 alongside hex is the kind of 2% craft detail juries notice.

- **Reusable patterns to extract**
  - **Metaphor-from-the-name**: mine the brand's etymology for a world (a peak, a river, a constellation) and build the 3D scene from it, rather than illustrating the product.
  - **Procedural-texture landscape**: `perlinNoise` + `voronoi` + a rock diffuse/normal pair + a snow mix mask + a **baked lightmap** = a convincing, tiny, fast terrain. No photogrammetry needed.
  - **Chapter model**: map `scrollProgress → 0..1` per chapter, drive a camera spline from it, and expose a chapter rail so scroll is skippable.
  - **Division/sub-brand switcher in the nav** for a group holding structure — the parent plus N children always visible.
  - **Read-state persistence** on a news/insights index, with an unread count in the nav.
  - **Audio-reactive toggle icon**: a 24×24 canvas that draws the live waveform, so the control *is* the visualiser. Default off.
  - **Astro islands + View Transitions** as the "no-SPA cinematic site" stack: static HTML for SEO, one hydrated canvas island, native cross-document morphs.
  - **Wide-gamut duplication**: `color: #2D628C; color: color(display-p3 ...)` progressive enhancement.
  - **Geometric-sans institutional voice**: Century Gothic / Josefin Sans-class faces to read as heritage-modern rather than tech-startup.
  - **Numbered ESG/values pillars** as a scrollable component with nested taxonomies — a repeatable corporate-content pattern.

- **Confidence & sources**
Identity, copy, divisions, offices, ESG, fonts, colour, Astro version, bundle names, textures, Cloudflare: **[verified], very high** — read directly from a static mirror of the production site. Lenis/GSAP/Three/EXR/GLB: **[verified], high** (`MONTFORT-CLONE.md`, which documents re-serving Montfort's own bundles). Cursor, exact camera choreography, shader internals: **[inferred], medium**. Awards and credits: **[unknown]** — assert nothing.
URLs used: `https://raw.githubusercontent.com/Parthkk90/mont-fort.com/main/index.html`, `https://github.com/Parthkk90/mont-fort.com/tree/main/_astro`, `.../tree/main/assets/fonts`, `.../tree/main/assets/textures`, `.../tree/main/assets/textures/homepage`, `https://raw.githubusercontent.com/parw8649/experiment_monica_clinic_website/main/MONTFORT-CLONE.md`, `https://github.com/suhasreverie/mont-fort-replica` (+ its `package.json`, `README.md`, `components/Hero.tsx`), `https://raw.githubusercontent.com/WebDeveloper-Taslima/Minimalist-3D-Interactive-Story-Website/main/README.md`.
**Caveat flagged loudly:** `suhasreverie/mont-fort-replica` describes Mont-Fort as a *"digital agency portfolio"* with a Hero reading "MONT FORT — Crafting digital experiences…". That is **the cloner's invention**, not the real site. Its *stack* observations (Three/R3F/GSAP/Lenis) corroborate the mirror; its *content* claims are worthless. Good reminder that clone READMEs must be cross-checked against real markup.

---

## Anime.js v4 — https://animejs.com/

- **Type / purpose**
[verified] Documentation + marketing site for **Anime.js**, a JavaScript animation engine by **Julian Garnier**, MIT-licensed. Local repo `package.json`: `"name": "animejs"`, `"version": "4.5.0"`, `"description": "JavaScript animation engine"`, `"homepage": "https://animejs.com"`, `"author": "Julian Garnier <julian@animejs.com>"`. Docs live at `https://animejs.com/documentation`; a v3→v4 migration guide is on the repo wiki.
**Important boundary:** the website's source is **not** in the repo, and I found **zero** GitHub repos for the site itself. Everything about the *library* below is [verified] from disk; everything about the *site's visual design* is [recalled] and I mark its confidence explicitly.

- **Awards & recognition**
[recalled, medium] The Anime.js v4 site was well received on launch (2025) and I believe it took an **Awwwards Site of the Day**; a **Developer Award** would be the natural category for it.
[recalled, low] Site of the Month / FWA / CSSDA — I don't trust my memory here.
[unknown] Dates, scores, jury names. **Do not state any.**
[verified, as reputational proxy] The README carries npm monthly-downloads, jsDelivr hits and GitHub Sponsors badges, and a tiered sponsor programme (Platinum/Silver) with most slots still placeholders — i.e. a genuinely high-traffic OSS project funding itself.

- **Credits**
[verified] **Julian Garnier** — sole author, copyright line `© Julian Garnier | MIT License`. Repo `juliangarnier/anime`.
[inferred, high] He designed and built the site himself — the v4 logo animation ships *as an example in the library repo* (`examples/animejs-v4-logo-animation/`), i.e. the site's identity animation and the library are the same authorship.
[verified] One named commercial sponsor visible: TestMu AI (Silver).

- **Concept & narrative**
[verified, the strongest single artefact] `/tmp/claude-0/-home-user-awards/6738b985-2da1-528d-9bb0-bb81ef267394/scratchpad/refs/anime/examples/animejs-v4-logo-animation/index.js` is the **actual logo animation**, and it is a small masterpiece of narrative motion. It is a timeline with named labels **`FALL` → `WIGGLE` → `POP`**:
  - A vertical line falls from `translateY: -280` to `19` on `inQuart` over 320ms, then **overshoots elastically** (`outElastic(1, 1.4)` on both scaleY and scaleX) — a drop with squash.
  - During impact it runs **five sequential SVG path morphs** via `svg.morphTo('#line-0-1'…'#line-0-6')` at 60/80/90/90/140ms — the line *deforms like liquid on impact*.
  - Then five more morphs (`#line-1`…`#line-5`, 340/260/180/180/340ms) as it settles — the `WIGGLE`.
  - At `POP`, the line is swapped for a dot and the letters **`a n i m e`** launch with a custom `cubicBezier(0.225, 1, 0.915, 0.980)` "splash" curve: a three-keyframe `translateY` ( `[35, -80]` → `4` → `0` ), a three-keyframe `scaleX` and a **four-keyframe `scaleY`** ( `[.4, 1.5]` → `.6` → `1.2` → `1` ) — i.e. hand-authored squash-and-stretch, per-axis, per-frame.
  - Four cloned "onion-skin" dots are generated in JS with `transformOrigin: '100% 50%'` for motion-trail ghosting.
  - It also uses `eases.outElastic(1.1, 0.9)` as a named "sweech" curve.
  **The big idea: the logo is a physics gag — ink drops, splashes, and the letters pop out of the splash.** The library demonstrates itself by *being* the identity.
[recalled, medium] The site's narrative is "the library animates its own documentation": every doc page is a live, running demo rather than a code listing, and the homepage is a sequence of self-playing set-pieces.
[recalled, medium] Tone: playful, technical, dense with interactive toys; copy is terse and API-flavoured.

- **Visual design language**
[verified] The shared demo/example stylesheet at `/tmp/claude-0/-home-user-awards/6738b985-2da1-528d-9bb0-bb81ef267394/scratchpad/refs/anime/examples/assets/css/styles.css` defines the project's design tokens, and this is almost certainly the site's own system:
  - **Surfaces:** `--bg-1 #252423`, `--bg-2 #2a2928`, `--bg-3 #2f2e2d`, `--bg-4 #353433`, `--bg-5 #3a3938` — a **warm near-black**, not neutral grey. Brown-shifted charcoal.
  - **Foregrounds:** `--fg-1 #dddcda`, `--fg-2 #c6c3c1`, `--fg-3 #96918f`, `--fg-4 #65655e`, `--fg-5 #33332e`.
  - **A 17-hue × 6-step accent system**, every hue named and laid out identically (`-1` vivid → `-6` near-background): red `#ff4b4b`, corail `#ff8333`, orange `#ffa828`, yellow `#ffcc2a`, citrus `#f9f640`, lime `#b7ff54`, green `#6aff65`, emerald `#57f695`, turquoise `#66ffbc`, cyan `#26f2d5`, **sega `#05dbe9`**, sky `#33b3f1`, indigo `#717aff`, lavender `#a369ff`, purple `#c06ddf`, magenta `#e962bf`, pink `#ff86a7` — plus black/white ramps (`--white-1 #f6f4f2`, `--black-1 #252423`).
  - The `-4/-5/-6` steps of every hue converge toward the warm background (e.g. `--red-6 #322523`, `--cyan-6 #23302d`) — a **tinted-dark-mode system** where even the darkest accent step carries its hue. That is why the site's dark UI never looks muddy.
  - Geometry tokens: `--br: 1rem`, `--padding: 1rem`, `--border-width: 1px`, `--input-border-radius: .25rem`.
  - **Typeface: `IoskeleyMono`** (`IoskeleyMono-Regular.woff2`, `IoskeleyMono-Bold.woff2`), with `font-family: 'IoskeleyMono', monospace, sans-serif` and a `ui-monospace, monospace` fallback stack. **The whole design system is monospaced.**
  [verified for the examples/demos; [recalled, medium] that the marketing site uses the identical tokens — the demos are embedded in the site, so at minimum they define its inner surfaces.]
[verified] The README ships **dark/light logo variants** via `<picture>` + `prefers-color-scheme` — so light mode exists in the brand at least.
[recalled, medium] Imagery: essentially none. No photography. Everything is SVG, DOM elements, canvas and type. The aesthetic is **spec-sheet / oscilloscope / dev-tool**, not editorial.

- **Components & sections**
[recalled, medium] Homepage set-pieces; a documentation area with persistent sidebar navigation; live code examples with editable parameters; an examples/showcase gallery; sponsor tiers.
[verified — the demo inventory, which is what the site showcases] 24 example programs on disk: `additive-creature`, `additive-fireflies`, `advanced-grid-staggering`, `animatable-follow-cursor`, `animejs-v4-logo-animation`, `auto-layout`, `canvas-2d`, `clock-playback-controls`, `draggable-infinite-auto-carousel`, `draggable-mouse-scroll-snap-carousel`, `draggable-playground`, `irregular-playback-typewriter`, `layered-css-transforms`, `onscroll-responsive-scope`, `onscroll-sticky`, `stagger`, `svg-graph`, `svg-line-drawing`, `text/hover-effects`, `text/scramble`, `text/scramble-tl`, `text/split-effects`, `text/split-playground`, `threejs/transforms`, `timeline-50K-stars`, `timeline-refresh-starlings`, `timeline-seamless-loop`, `timeline-stress-test`.
[verified] Several examples embed a **`tweaks` GUI panel** (`createTweaks`, `GUI.BeginPanel`, `syncTweaks('localStorage')`) — live parameter controls whose state persists across reloads. The "playground" demos (`split-playground`, `draggable-playground`) are built on it.
[verified] `timeline-50K-stars` is a **GitHub-star-button confetti demo**: clicking spawns cloned star SVGs with randomised `translateX` multi-keyframes, a `color: { from: '#FFDD8E' }` flash, `scale: [1, 1.2, 1, .8]`, fading opacity — a "celebrate the repo" interaction, and `timeline-stress-test` is an explicit performance flex.

- **Motion & creative effects** — and the **v4 API surface** [all verified from `src/` and `examples/`]

  Public exports (from `src/index.js`): `timer`, `animation`, `timeline`, `animatable`, `draggable`, `scope`, `events`, `engine`, `easings`, `layout`, `utils`, `svg`, `text`, `waapi`, `types`, `globals`.

  **Core factories** (from module sources): `animate`, `createTimer`, `createTimeline`, `createAnimatable`, `createDraggable`, `createScope`, `onScroll` (class `ScrollObserver`), plus classes `JSAnimation`, `Timer`, `Timeline`, `Animatable`, `Draggable`, `Scope`, `ScrollObserver`. Additive-blending internals: `additive`, `addAdditiveAnimation`, `composeTween`, `overrideTween`.

  - **`animate(targets, params)`** — works on CSS properties, SVG, DOM attributes and plain JS objects (README). Per-property objects: `rotate: { from: -180 }`, `y: { to: '-60%', duration: 400 }`, and **per-property arrays = keyframes with their own easing/delay**, e.g. `translateY: [{ to: [35,-80], duration: 190, ease: splashCurve }, { to: 4, duration: 120, delay: 20, ease: 'inQuad' }, …]`. This per-property, per-keyframe easing is the v4 signature and is more expressive than a single global timeline ease.
  - **`composition: 'blend'`** — additive blending, so a hover animation and a scroll animation on the same property *compose* instead of fighting. Used in `onscroll-sticky` for exactly that (scroll drives `y: '-60%'`, hover blends to `-70%`).
  - **`stagger(value, opts)`** — `from: 'center' | 'first' | 'last'`, range form `stagger([.75, 1])`, a **`modifier`** function (e.g. `v => \`brightness(${v})\`` to stagger a CSS filter), and **`use: 'data-line'` / `use: 'data-char'`** to stagger by a data attribute that `splitText` wrote. Also `start:` offset. Grid staggering exists (`advanced-grid-staggering`).
  - **`createTimeline({ defaults })`** with `.add(target, params, position)`, `.set()`, **`.label('NAME')`**, `.init()`, `.seek(ms)`, `.play()`, and position values that can be a number, a label, or a `stagger()`. `parseTimelinePosition` supports relative syntax.
  - **`onScroll({ target, enter: 'top top', leave: 'bottom bottom', sync: .5, debug: true })`** — passed as the **`autoplay`** value of a timer/timeline, which is an elegant inversion: scroll-linking is an *autoplay strategy*, not a plugin. `sync` is the scrub smoothing factor; `debug: true` draws on-screen markers. Also `scrollContainers` for custom scrollers.
  - **`splitText(target, { chars, words, lines, debug })`** — `TextSplitter` class; options include `chars: { class, clone: 'left', wrap: 'clip' }` (the `clone` + `wrap: 'clip'` combo is what makes the classic **duplicate-character hover roll** possible), `.addEffect(fn)` for re-appliable effects that survive re-splitting on resize, and **`.revert()`**. Exposes `split.chars`, `split.words`, `split.lines` and writes `data-line` / `data-char` attributes for stagger targeting.
  - **`scrambleText`** (`src/text/scramble.js`) — parameters visible in the demo GUI: `text`, `from: auto|left|right|center|random`, `reversed`, `ease`, **`chars` presets: lowercase, uppercase, numbers, symbols, braille, blocks, shades**, a **`cursor` string (default `'░▒▓█'`)**, `override`, `perturbation`, `duration`, `delay`, `revealDelay`, `revealRate`, `settleDuration`, `settleRate`. Far richer than a naive random-letter scramble — it models reveal rate and settle separately.
  - **`createDraggable(target, opts)`** — `trigger`, axis locks (`y: false`), `onGrab` / `onRelease` / `onResize`, **`releaseStiffness`**, **`velocityMultiplier`**, and live `deltaX`/`deltaY`. Demos: infinite auto-carousel, mouse-scroll snap carousel, playground.
  - **`createAnimatable(target, { x: 0, modifier })`** — returns *callable property setters* (`const { x } = animatable; x(newValue)`), for per-frame imperative control. The infinite carousel uses `modifier: v => utils.wrap(v, -width/2, 0)` to loop seamlessly.
  - **`createScope({ root, defaults, mediaQueries })`** — `.add(scope => {…})`, `scope.add('methodName', fn)` registering callable `scope.methods`, automatic cleanup via a returned teardown function, and media-query-responsive re-execution (`onscroll-responsive-scope`). **This is v4's answer to `gsap.context()`** and the key to framework (React/Vue) safety.
  - **Easing system** (`src/easings/`): `cubic-bezier`, `eases`, `irregular`, `linear`, `none`, `spring`, `steps`. Penner functions composed from a **power primitive** — `easeInPower = (p = 1.68) => t => pow(t, +p)` — with named instances `Quad/Cubic/Quart/Quint` = powers 2/3/4/5, plus `Sine`, `Circ`, `Expo`, `Bounce`, parametric `Back(overshoot = 1.7)` and `Elastic(amplitude = 1, period = .3)`. Four **type wrappers** `in / out / inOut / outIn` are applied generically, so the string grammar is compositional: `'inOutQuint'`, `'outElastic(1, 1.4)'`, `'in(2)'`, `'inOut(3)'`, `'steps(10)'`, `'linear'`. **`createSpring`** is a real spring solver adapted from WebKit's spring demo.
  - **SVG toolkit** (`src/svg/`): **`morphTo`** (used 10× in the logo animation), **`createDrawable`** (line-drawing), **`createMotionPath`**, `getPath`.
  - **`utils`**: `$` (query → array), `set`, `get`, `random`, `randomPick`, `shuffle`, `createSeededRandom`, `lerp`, `damp`, `clamp`, `round`, `roundPad`, `snap`, `wrap`, `mapRange`, `degToRad`, `radToDeg`, `padStart`, `padEnd`, `sync`, `keepTime`, `remove`. A complete animation-math kit — **no lodash, no separate easing package needed.**
  - **WAAPI adapter** (`src/waapi/`): `waapi`, `addWAAPIAnimation`, `removeWAAPIAnimation` — a hardware-accelerated, off-main-thread path using the native Web Animations API with the same authoring grammar.
  - **Three.js adapter** (`src/adapters/three/`: `adapter.js`, `object3d.js`, `instance.js`, `uniform.js`, `resolvers.js`, `helpers.js`, plus a generic `registry.js`). It is a **side-effect import** (`sideEffects: ["./dist/modules/adapters/**"]`) that registers resolvers so `animate()` and `utils.set()` accept **raw Three.js Meshes, Materials, InstancedMesh per-instance handles (`getInstances`) and shader uniforms** directly. `three` is an **optional peer dependency** (`>=0.150.0`). Verified in the demo: `utils.set(scene, { background: 'var(--bg-1)' })` and `utils.set(grid, { color: 'var(--fg-4)' })` — **it resolves CSS custom properties into Three.js colours.** That is a delightful, genuinely novel bridge: one palette, DOM and WebGL.
  - **Other modules**: `layout` (auto-layout/FLIP-style — see `examples/auto-layout`), `events`, `engine` (global clock; `globals`), `timer` for non-visual ticking.
  - **Effects demonstrated**: sticky/pinned scroll card-stack with 3D `rotateY`/`rotateZ` spinners and staggered `transformOrigin` tweens; onion-skin motion trails; SVG morph chains; line-drawing; SVG graphs; text scramble; split-by-line/word/char with hover roll and wavy-char effects; additive particle systems (fireflies, creature); cursor-following animatables; infinite draggable carousels with wrap; seamless-loop timelines; 2D canvas; Three.js transforms; a 50k-element stress test.
  - [recalled, medium] The site itself layers these into scroll-driven hero sequences and live editable doc examples; [unknown] whether it uses Lenis or any external smooth-scroll (it would be odd — `onScroll` with `sync` is native-scroll-based by design).
  - [unknown] Sound. No evidence.

- **Tech stack (with evidence)**
[verified — library] ESM-first (`"type": "module"`), **Rollup** + `@rollup/plugin-terser`, TypeScript **only for `.d.ts` generation from JSDoc** (`tsconfig.types.json`; the source is plain JS with JSDoc `@import` types — a notable choice). Ships ESM + UMD + CJS + IIFE. Deep per-module export map (`animejs/timer`, `animejs/text`, `animejs/svg`, `animejs/waapi`, `animejs/easings/spring`, `animejs/adapters/three`, …) for fine-grained tree-shaking. jsDelivr/unpkg point at `dist/bundles/anime.umd.min.js`. Dev/test: `browser-sync`, `mocha`, `chai`, `nodemon`, `tweaks@^0.3.4` (the GUI lib), `three@^0.184.0` as a devDependency.
[verified] Fonts (demo system): self-hosted **IoskeleyMono** woff2.
[verified] Zero runtime dependencies. `three` is the only peer, and optional.
[unknown] **The website's own framework, host and CMS.** No evidence found; the site source is not published and GitHub search returned nothing. [inferred, low] A static generator (Astro/Eleventy/custom) on a CDN would be typical for a docs site of this kind, but I will not claim it.

- **Responsive / accessibility / performance notes**
[verified] `createScope` with media queries is the library's built-in responsive story — animations re-initialise per breakpoint with automatic cleanup, and `splitText().addEffect()` re-applies effects after a re-split on resize. Both are directly relevant to building responsive motion.
[verified] The WAAPI path offers compositor-thread animation for transform/opacity.
[verified] `keepTime` and `sync` utilities exist for tab-visibility/time-drift correctness.
[verified] `timeline-stress-test` and `timeline-50K-stars` show performance is an explicit design value.
[unknown] `prefers-reduced-motion` handling in the library or site. I found no evidence either way — **the skill should implement reduced-motion itself and not assume the library does it.**
[unknown] Site-level a11y, keyboard nav of doc examples, Lighthouse scores.

- **Why it is award-worthy**
1. **The product demonstrates itself.** The logo is built with the library, in the repo, as a runnable example. No screenshot could substitute.
2. **Documentation as playground.** Live, tweakable, persisted-state demos (`tweaks` + localStorage) turn reference material into a toy — visitors stay because they're *playing*, not reading.
3. **A design system built for motion.** 17 hues × 6 steps, all converging on one warm near-black, means any demo can grab any accent and stay on-brand. That's why hundreds of disparate demos still look like one site.
4. **Monospace as identity.** Committing entirely to `IoskeleyMono` gives a dev-tool site a coherent, unmistakable voice at zero cost.
5. **Craft in the micro.** Four-keyframe per-axis squash-and-stretch on five letterforms is animation-principle work (Disney squash/stretch, anticipation, overshoot, settle) applied to a wordmark.
6. **Honest performance flexing.** Shipping a 50,000-element stress test as a public demo is a claim you can't fake.

- **Reusable patterns to extract**
  - **Self-demonstrating identity**: build the logo/wordmark animation with the very tool or aesthetic the site is selling, and publish it as a readable example.
  - **The 6-step tinted accent ramp**: for any dark UI, define every hue as 6 steps whose darkest step is the background tinted with that hue. Guarantees coherence across unlimited accent usage.
  - **Compositional easing grammar**: `type(power)` strings — `inOutQuint`, `outElastic(1, 1.4)`, `in(2)`, `steps(10)` — generated from one power primitive plus four type wrappers. Cheap to implement, enormous expressive range.
  - **Scroll-linking as an autoplay strategy**, not a plugin: `autoplay: onScroll({ enter, leave, sync })`. The same timeline plays on load *or* on scroll by swapping one option.
  - **Additive/blend composition** so hover, scroll and idle animations on one property coexist instead of overriding.
  - **Scope + cleanup + media queries** as the standard container for any framework-embedded animation. Always return a teardown.
  - **Split-then-stagger-by-data-attribute**: split text into lines/words/chars, have the splitter write `data-line`/`data-char`, then stagger *by* that attribute so word-level and line-level rhythms nest.
  - **Duplicate-char hover roll**: `chars: { clone: 'left', wrap: 'clip' }` + stagger the clone's `x: '100%'`. One of the highest-value-per-line text effects in existence.
  - **Onion-skin trails**: clone the moving element N times in JS, offset `transformOrigin`, fade them — motion blur for free.
  - **Impact morph chain**: on a "landing" moment, run 4–6 short sequential SVG path morphs (60–140 ms each) so the shape deforms and recovers. Instantly reads as physical.
  - **Persisted tweak panels** for any interactive showcase: expose real parameters, store in localStorage, let visitors break it.
  - **One palette, DOM and WebGL**: resolve CSS custom properties into 3D scene colours so design tokens govern the canvas too.
  - **Seamless infinite carousel**: duplicate children once, animate `x` continuously, wrap with `utils.wrap(v, -totalWidth/2, 0)`, add a draggable whose `deltaX` is summed into the same value and whose `onGrab`/`onRelease` tween the auto-scroll speed to 0 and back.

- **Confidence & sources**
Library API, versions, examples, palette, fonts, build system, logo-animation choreography: **[verified], very high** — read directly from disk. Site design language: **[recalled, medium]** for "the examples palette is the site palette" and for the live-docs concept; **[unknown]** for the site's framework, host, exact layout and hero sequencing. Awards: **[recalled, medium]** for SOTD, **[unknown]** for everything specific.
Paths used: `/tmp/claude-0/-home-user-awards/6738b985-2da1-528d-9bb0-bb81ef267394/scratchpad/refs/anime/README.md`, `.../package.json`, `.../src/index.js`, `.../src/easings/eases/parser.js`, `.../src/easings/spring/index.js`, `.../src/text/split.js`, `.../src/adapters/three/`, `.../src/utils/`, `.../src/svg/`, `.../examples/assets/css/styles.css`, `.../examples/animejs-v4-logo-animation/index.js`, `.../examples/onscroll-sticky/index.js`, `.../examples/text/split-effects/index.js`, `.../examples/text/hover-effects/index.js`, `.../examples/text/scramble/index.js`, `.../examples/draggable-infinite-auto-carousel/index.js`, `.../examples/timeline-50K-stars/index.js`, `.../examples/threejs/transforms/index.js`.

---

## MindMarket — https://mindmarket.com/

- **Type / purpose**
[verified, via clone `fionagoi64/mindmarket`] A **qualitative market-research agency and international fieldwork network** — not a fintech, not an AI product (several unrelated GitHub repos share the name; ignore them). Navigation, verbatim from the clone's `src/constants/menuItem.ts`: **Services, Methodology, Industry Sectors, Network, About Us, Insights, Contact, Privacy.**
[verified] **Methodology** (10 children, each its own route): Online Bulletin Boards; Focus Groups, Dyads & Triads; Taste Testing; Central Location Testing; Customer Intercept Research; Mystery Shopping; Shop-Along Research; UX Research; In-Depth Interviews; Ethnographic Research.
[verified] **Industry Sectors** (12 children): Automotive; Technology; Sports; Gaming; FMCG; Food & Beverage; Financial Services; Beauty & Cosmetics; **Crypto & Web3**; Hospitality; Research for Consulting Firms; Pharmaceutical & Medical Device.
[verified] **Services**: two headline cards — *Qualitative Research* ("uncovering the behavioural *why*" through interviews and focus groups with cultural experts) and *Behavioural Analysis* (observational methods for habits and decision-making) — plus seven support services: International Respondent Recruitment, Screener Design, Study/Research Design, Discussion Guide Development, Desk Research, Analysis & Reporting, Translation and Transcripts (professional linguist network).
[verified] **Network** is a first-class section backed by `constants/globe.ts` — **48 countries** with x/y coordinates on a flattened projection (Americas, Europe, Africa, Middle East/Asia, Oceania: US, Canada, Mexico, Colombia, Peru, Brazil, Argentina, Chile, Ireland, UK, Portugal, Spain, France, Switzerland, Germany, Italy, Norway, Sweden, Finland, Poland, Greece, Ukraine, Turkey, Russia, Morocco, Algeria, Egypt, Nigeria, Kenya, South Africa, Madagascar, Kazakhstan, Saudi Arabia, UAE, Iran, Pakistan, India, China, South Korea, Japan, Thailand, Vietnam, Malaysia, Singapore, Indonesia, Philippines, Australia, New Zealand). **Global reach is the product, and the site visualises it as a map/globe.**
[verified] Also `constants/`: `team.ts`, `feature.ts`, `footer.ts`, `network.ts`, `route.ts`, `services.ts`, `getCategoryDetails.tsx`, `methodologyDetails.tsx`, `sectorDetails.tsx` — i.e. a large **programmatic-SEO matrix**: ~22 templated landing pages across methodology × sector, each with slugs like `automotive-market-research`, `crypto-market-research`, `ethnographic-research`.

- **Awards & recognition**
[unknown] I have **no reliable recollection** of this site in any award gallery. I will not guess at Awwwards/FWA/CSSDA/Godly, dates, scores or tags.
[verified, weak proxy] It has at least one deliberate animation-practice clone on GitHub (`fionagoi64/mindmarket` — "A clone website built for practicing web animations"), which indicates its motion work is admired enough to be studied. That is all I can honestly say.

- **Credits**
[unknown] Studio and individuals. No evidence found.

- **Concept & narrative**
[verified, from the clone's homepage component names] The homepage sections are, in file order: `HomeContent`, `CenterTitleHero` / `LeftTitleHero`, `BrandMarquees`, `CardSection` + `AnimatedCard`, `StackCards`, **`ScrollPathSection`**, `GallerySection`, `ReadySection`.
[inferred, high] The narrative arc that implies: hero statement → client-logo marquee (credibility) → capability cards → a **stacked-card scroll sequence** → a **scroll-drawn path section** → gallery/people → a closing "Ready to…" CTA. `ScrollPathSection` is the signature — [inferred] an SVG path drawn along scroll, almost certainly used to represent the *research journey* or to connect points on the global network.
[inferred, medium] Tone: warm-professional. Qualitative research is a *human* discipline (people in rooms, talking), so the copy leans on "the behavioural why", "cultural experts", "shop-along", "ethnographic" — humanistic language sold to corporate buyers.
[inferred] The strategic problem the design solves: market research is an invisible, deeply unglamorous service. The site has to make *methodology* — a list of interview formats — feel like craft. Hence heavy motion on otherwise plain content.

- **Visual design language**
[unknown] **Palette and hexes.** I have no verified colour values and will not invent any. The clone's `styles/` folder exists but I did not read its tokens, and a cloner's colours are unreliable anyway.
[unknown] Typography, light/dark, texture.
[inferred, medium] Imagery: photographic — the component set includes `ImageRevealList`, `ParallaxScrollImage`, `GallerySection`, `MediaTextBlock`, `SlidesBlock`. That's a photography-forward site (people, fieldwork, cities), unlike the other three in this batch which are all render/procedural.
[verified] Layout system (from the shared component vocabulary): two hero variants (`CenterTitleHero`, `LeftTitleHero`) reused across ~22 templated pages — a **disciplined template kit**, not bespoke pages.

- **Components & sections**
[verified, from `src/components/shared/`] The site's reusable kit, named: **`AnimatedButton`, `CenterTitleHero`, `FeatureList`, `HoverSection`, `ImageRevealList`, `LeftTitleHero`, `MarqueeBlock`, `MediaTextBlock`, `ParallaxScrollImage`, `RiveAnimation`, `SlidesBlock`, `TextBlock`, `TextReveal`, `WavyText`.**
[verified, from `src/components/features/`] Feature areas: `home`, `about-us`, `categories`, `contact-us`, `insights`, `network`, `services`.
[verified] Homepage-specific: `AnimatedCard`, `BrandMarquees`, `CardSection`, `GallerySection`, `HomeContent`, `ReadySection`, `ScrollPathSection`, `StackCards`.
So, concretely: **sticky stacked cards; a scroll-drawn path; brand/logo marquees; an image-reveal list (hover a list row → image appears); parallax scroll images; a slides block; a hover-reactive section; animated buttons; text reveal and wavy-text effects; a Rive-driven illustration component; a world-network map.**
[inferred, medium] Contact forms (there is a `contact-us` feature area). [unknown] preloader, custom cursor, easter eggs.

- **Motion & creative effects**
[inferred, high — from the clone's dependencies] **Rive** is used for authored vector animation: the clone depends on **`@rive-app/react-canvas ^4.28.6`** *and* has a dedicated **`RiveAnimation.tsx`** shared component. A cloner does not reach for Rive unless the original has Rive files; you cannot reproduce a Rive animation with CSS. **Treat "MindMarket uses Rive" as [inferred, high].**
[inferred, medium] Scroll and layout motion via **`motion` (Framer Motion) v12** — the clone uses it; the original may use GSAP instead. The *vocabulary* (scroll-linked reveals, stacked cards, marquees, parallax) is achievable in either.
[verified, component-level] `TextReveal` and `WavyText` are separate components — so there are (at least) two distinct text-animation systems: a masked line/word reveal and a per-character wave.
[verified] `ImageRevealList` — the hover-row-reveals-image pattern.
[verified] `ScrollPathSection` — scroll-driven path drawing.
[verified] `StackCards` — sticky/pinned card stacking.
[verified] `MarqueeBlock` / `BrandMarquees` — infinite marquee.
[verified] `ParallaxScrollImage` — scroll parallax on imagery.
[verified] `globe.ts` with 48 coordinate pairs — an animated world-network visualisation, plotted on a **flat projection** (x ≈ 27.5–91, y ≈ 36–71 — percentage-style coordinates, so [inferred, high] it's an **SVG/DOM map with positioned pins, not a WebGL globe**). That's a smart, accessible, cheap choice.
[unknown] Smooth-scroll library (Lenis or native), WebGL/shaders (**no 3D dependency appears anywhere — [inferred, high] there is no WebGL on this site**), sound, page transitions, loading sequence.

- **Tech stack (with evidence)**
**Heavy caveat: everything here is the *clone's* stack, not confirmed as the original's.**
[verified, clone] React 19 + TypeScript, **Vite 8**, **Tailwind CSS v4** (`@tailwindcss/vite`), `react-router-dom` v7, `motion` v12, **`@rive-app/react-canvas`**, `lucide-react`, `clsx`, `vite-plugin-svgr`, `vite-tsconfig-paths`.
[inferred, high] The original uses **Rive** (see above) and is a **React-family site** with client-side routing.
[inferred, medium] Given the ~22 templated methodology/sector landing pages and an `Insights` section, the original is [inferred] a **Next.js + headless CMS** build — programmatic SEO on that scale needs a CMS and SSG/SSR. The clone's Vite/react-router setup is a simplification.
[unknown] Actual framework, CMS, host, fonts.

- **Responsive / accessibility / performance notes**
[inferred, high] **No WebGL** means this is the most accessible and cheapest of the four sites — DOM/SVG/Rive only. Rive canvases are small vector runtimes, not 3D scenes.
[verified, structural] The two-hero-variant + shared-block template system implies genuinely responsive, reflowable content rather than fixed-comp scenes.
[verified] Deep, semantic, hierarchical navigation (parent + children per section) is good for both SEO and keyboard/screen-reader users.
[unknown] Reduced-motion, contrast, focus states, Lighthouse.
[inferred] Risk to note: an `ImageRevealList` + `HoverSection` vocabulary is hover-dependent — needs an explicit touch/keyboard fallback.

- **Why it is award-worthy**
*(Caveat: I cannot verify it won anything. These are the design merits I can see in the structure.)*
1. **Motion applied to genuinely dry content.** Focus groups and screener design are made to feel crafted. The hardest and most transferable design problem in the batch.
2. **The network is the pitch, and it's shown, not stated.** 48 countries plotted, rather than "global coverage" as a sentence.
3. **A real component kit, not bespoke pages.** ~14 shared blocks compose ~22 landing pages — award-tier polish that also *scales* to programmatic SEO. Most beautiful sites can't do this.
4. **Vector animation without 3D.** Rive gives authored, art-directed motion at a fraction of WebGL's weight and accessibility cost.
5. **Two text-animation systems, used for different jobs** (reveal for headlines, wave for accents) rather than one effect everywhere.

- **Reusable patterns to extract**
  - **Block-kit architecture**: build ~12–15 named, animated blocks (hero-center, hero-left, text, media+text, feature list, marquee, slides, image-reveal list, parallax image, stack cards, scroll path, CTA) and compose every page from them. This is how you make 20+ pages all feel award-tier.
  - **Two hero variants only** (centred and left-aligned) as the entire page-opening vocabulary.
  - **Image-reveal list**: a plain text list where hovering a row reveals its image near the cursor. Enormous perceived quality for very little code. Always add a touch fallback (tap-to-expand) and focus-visible parity.
  - **Sticky stack cards**: pin a container, stack N cards with increasing offset/scale, drive by scroll progress.
  - **Scroll-drawn path**: an SVG path with `stroke-dasharray`/`dashoffset` (or `createDrawable`) tied to scroll, used to connect narrative beats.
  - **Flat-projection network map**: store `{ name, x, y }` as percentages, render as positioned SVG/DOM pins with staggered entrance and hover labels. Far cheaper, more accessible and more legible than a WebGL globe — and it's what a real site chose.
  - **Rive for authored illustration**: one `<RiveAnimation>` wrapper component, state-machine-driven, for anything that should feel hand-animated rather than tweened.
  - **Split your text-animation systems by role**: a masked line/word reveal for headings; a per-character wave/wobble for small accent type. Never both on the same element.
  - **Programmatic-SEO matrix with craft**: methodology × sector slug pages, each using the same animated kit, so long-tail SEO pages aren't visual second-class citizens.
  - **Marquee as credibility**: client-logo marquee immediately after the hero is the fastest trust signal in B2B.

- **Confidence & sources**
What MindMarket *is*, its IA, nav, methodologies, sectors, services copy, the 48-country network, section and component inventory: **[verified], high** — read from `fionagoi64/mindmarket`, a clone that reproduced the original's `constants/` data files essentially verbatim (the slugs, service descriptions and country list are far too specific and business-accurate to be invented by a practice project).
Rive usage: **[inferred], high**. Framer Motion / Vite / Tailwind / React-router: **[inferred], low-medium** — clone-specific, likely a simplification of the original. Palette, typography, host, CMS, credits, awards: **[unknown]** — assert nothing.
URLs used: `https://github.com/fionagoi64/mindmarket`, `https://raw.githubusercontent.com/fionagoi64/mindmarket/main/package.json`, `.../main/src/constants/menuItem.ts`, `.../main/src/constants/services.ts`, `.../main/src/constants/globe.ts`, `https://github.com/fionagoi64/mindmarket/tree/main/src/components/shared`, `.../tree/main/src/components/features`, `.../tree/main/src/components/features/home`, `.../tree/main/src/constants`.
**This is the weakest-evidenced site of the four. The skill should treat its component vocabulary as solid and everything visual as unknown.**

---

## Cross-site observations (batch D)

**What genuinely surprised me**

1. **Mont-Fort is an oil and commodity trading house, not a ski resort.** The brand borrowed a 3,330 m Swiss peak's name, and the site renders that mountain in WebGL (`snowRockMix`, `snow_diffuse`, `rock_diffuse/normal`, a baked `homepage-lightmap`) to give a fundamentally unphotogenic business — downstream oil, shipping, physical commodities — a landscape to live in. **The lesson is bigger than the site: when the product cannot be shown, build the world the *name* implies.**
2. **Lando Norris's site ships a 3D model of an Awwwards SOTD trophy in its own asset manifest.** The award became set dressing inside the experience. Delightfully shameless.
3. **Astro won a WebGL site.** I expected Next.js everywhere. Mont-Fort is Astro 5.2.6 with View-Transitions routing and a single hydrated WebGL island — arguably the *better* architecture for this genre (full static HTML for SEO, JS only where motion lives), and none of the four uses a heavyweight SPA framework for its motion layer.
4. **Webflow won a developer-tier site.** Lando's content shell is Webflow (jQuery 3.5.1 and `webflow.js` are still in there) while a hand-written **esbuild** ESM bundle on the agency's own subdomain does every interesting thing. The platform is invisible in the output.
5. **Rive appears on two of four sites** (Lando verified, MindMarket inferred-high) — and on the two most different sites in the batch. Rive has quietly become a standard award-site tool for authored 2D vector motion, sitting *alongside* GSAP/Three rather than replacing them.
6. **Nobody built a WebGL globe.** MindMarket has 48 countries and chose flat x/y percentage pins. The unglamorous choice was the right one.
7. **Award-winning sites ship dead code.** Verified in Lando's production bundle: a `window.ScrollTrigger` branch that never executes, a `scene.remove(name)` no-op, an undefined `iridescence` property, an orphaned texture-manifest entry. Mont-Fort shipped `<meta name="keywords" content="keyword 2, keyword 2">`. Perfection is not the bar; *finish* is.

**Tech — commonalities and splits**

| | Lando Norris | Mont-Fort | Anime.js | MindMarket |
|---|---|---|---|---|
| Shell | Webflow + esbuild ESM bundle | Astro 5.2.6 (static) | unknown | unknown (React family) |
| Routing | @unseenco/taxi 1.8.0 | Astro ClientRouter (View Transitions) | unknown | client-side router |
| Smooth scroll | **Lenis 1.1.20** | **Lenis** | native + `onScroll({sync})` | unknown |
| Animation | **GSAP 3.13.0** (+Observer/ScrollTrigger/MotionPath/SplitText) | **GSAP + ScrollTrigger** | **Anime.js v4** (own) | Framer Motion (clone) |
| 3D | **Three.js r174** + bloom + fluid sim | **Three.js** + KTX2 + EXR | optional Three adapter | **none** |
| Vector anim | **Rive 2.26.4** ×8 | — | — | **Rive** (inferred) |
| Fonts | Mona Sans + Brier Bold | Century Gothic + Josefin Sans | IoskeleyMono | unknown |
| Hosting | Webflow CDN + agency subdomain | Cloudflare | unknown | unknown |

- **The genuine consensus stack for 2025–26 award sites is `Lenis + GSAP ScrollTrigger + Three.js`** — it appears on both of the two sites where I could read the real bundles, independently, from different studios. Anime.js is the one exception, and only because it *is* the alternative.
- **Compressed-texture pipelines are now table stakes**: KTX2/Basis on both 3D sites, plus DRACO on Lando. Neither shipped raw PNGs.
- **Both 3D sites split the WebGL into its own chunk** so the rest of the page is cheap.
- **Everyone self-hosts woff2.** No Google Fonts anywhere.
- **Nobody uses Tailwind in production** (only the *clones* do). Real award sites ship hand-written CSS with custom properties.

**Motion vocabulary — the shared alphabet**

Recurring across at least two sites: scroll-pinned/sticky sequences; **stacked cards**; scroll-linked camera or transform scrubbing with a smoothing factor; split-text reveals (GSAP SplitText on Lando, `splitText` on Anime, `TextReveal`/`WavyText` on MindMarket — **all three do character/line splitting**); infinite marquees; parallax imagery; hover-reveal micro-interactions; preloaders gated on real asset readiness; route transitions that are *choreographed*, not crossfaded.
The **differentiator between the three tiers** is what drives the scroll: Mont-Fort drives a **camera** (chapters → 0..1 → spline); Lando drives **scene state and theme inversion**; MindMarket drives **DOM transforms**. All three map scroll to a normalised progress value and interpolate — that single pattern is the backbone of the genre.
**Sound appears on exactly one** (Mont-Fort, with an audio-reactive 24×24 canvas toggle) — and it is opt-in. Sound is a differentiator, not a default.

**Typography & layout**

- **Three of four are sans-only; none uses a serif.** Mona Sans (variable grotesque), Century Gothic + Josefin Sans (geometric), IoskeleyMono (monospace). The 2025–26 award palette of type is grotesque-or-geometric-or-mono; editorial serifs are conspicuously absent from this batch.
- **Two of four self-hosted an unfashionable or unexpected face** (Century Gothic; GitHub's Mona Sans). Neither picked a trend face. **Character beats fashion.**
- **Fluid type from a single design baseline** is explicit on Lando (`--fluid-font`, 1728px). Assume clamp-based fluid scaling everywhere.
- **Layout systems are token-driven**: Lando's `--fluid-font`, Anime's `--br`/`--padding`/`--border-width`. CSS custom properties are the layout engine.
- **Hero type carries meaning**: Mont-Fort's hero *is* the brand architecture ("Montfort Trading Capital Maritime Fort Energy"); Lando's is a helmet.

**Colour**

- **The two dark sites are warm-dark, not neutral-dark.** Anime's `--bg-1 #252423` is brown-shifted charcoal, and every one of its 17 accent hues resolves to a *tinted* near-background at step 6. Mont-Fort's `#2D628C` is a desaturated slate, not a saturated brand blue. **Nobody used pure `#000` or `#fff`, and nobody used a saturated primary.**
- **Lando is the outlier: a dual light/dark theme that flips based on scroll position.** Theme as a scroll-driven property is a strong, under-used idea.
- **Wide-gamut P3 is shipping** (Mont-Fort's `color(display-p3 …)` alongside hex). A small craft signal worth copying.
- **Systematised accent ramps** (Anime's 17×6) are what let a site carry unlimited colour without incoherence.

**Narrative structure**

Two distinct models, and the skill should teach both:
- **Chaptered / spatial** (Mont-Fort, Lando's calendar): a linear scroll narrative with numbered chapters and a jump rail, driven by camera movement through a single continuous world. Best when there is one story and one metaphor.
- **Faceted / multi-route** (Lando overall, MindMarket, Anime docs): a brand *world* of parallel authored routes with choreographed transitions between them. Best when there is a catalogue — divisions, methodologies, personas, API modules.
All four resolve to a **CTA/closing section** (`ReadySection`, contact, sponsor tiers, partnerships). All four keep **copy sparse and declarative**, letting motion carry emotion — most extreme at Mont-Fort, where boardroom ESG prose sits inside a cinematic mountain. **That contrast — sober words, extravagant motion — is the single most transferable narrative device in this batch.**

**Two things worth carrying into the skill as warnings**

- **Resize is where these sites cheat.** Lando forces a full page reload across the 992px breakpoint rather than rebuilding six WebGL scenes. If you build scroll-pinned 3D, decide your resize strategy up front — rebuild, or reload, but don't pretend.
- **I found no `prefers-reduced-motion` evidence on any of the four.** Treat that as a gap to *fix*, not a precedent to follow: the skill should make reduced-motion, hover-fallbacks for touch, and opt-in sound non-negotiable, because these exemplars do not reliably supply them.