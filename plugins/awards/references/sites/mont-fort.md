# Montfort Group — https://mont-fort.com/

<!-- Identity correction first: Montfort Group is a global commodity-trading and asset-investment company (downstream oil, physical commodities, shipping) with hubs in the UAE, Singapore and Switzerland. It is named after Mont Fort, the 3,330 m peak above Verbier, and it renders that mountain in WebGL — but it is not a ski resort or a tourism site. Evidence base: a complete static mirror of the production build (`Parthkk90/mont-fort.com`) read directly, plus one clone that re-serves the original bundles. -->

| Field | Value |
|---|---|
| Class | brand (corporate group, B2B heavy industry) |
| Visitor mode | experience, with read routes (divisions, ESG, news) |
| Awards | [unknown] — Awwwards SOTD/SOTM/SOTY, FWA, CSSDA, Godly, dates, scores, tags: assert nothing; a weak impression of 2025 gallery circulation [recalled, low-medium]; reputational proxy: at least seven GitHub replicas and two projects citing it as their design benchmark [verified] |
| Studio / credits | studio and individuals [unknown] — no agency named in the mirror's markup; an external specialist studio rather than in-house [inferred] |
| Stack (evidence level) | Astro 5.2.6, static output with island hydration (generator meta) [verified] · Astro `ClientRouter` / View Transitions + a `router` chunk [verified] · Three.js with `KTX2Loader` in its own chunk, `.glb` models, `.exr` HDRI [verified] · GSAP + ScrollTrigger (own chunk `ScrollTrigger.6qCihK2t.js`) [verified] · Lenis [verified via `MONTFORT-CLONE.md`, which documents re-serving the original bundles] · Century Gothic regular + bold and Josefin Sans Light, self-hosted woff2 [verified] · Cloudflare (`cdn-cgi/scripts/.../cloudflare-static/`) [verified] · app chunks `GlobalApp`, `Layout`, `WebGL`, `Solutions`, `ChaptersNavigation`, `Social`, `visitedNews`, `index`; one stylesheet `_slug_.B97dlsMJ.css` [verified] |
| Palette | theme colour `#2D628C`, also declared as `color(display-p3 0.1765 0.3843 0.5490)` — a wide-gamut path ships [verified]; white `#fff` at 0.8 / 1.0 opacity steps for text hierarchy [verified]; strategy: procedural snow/rock ground + one desaturated slate-blue ink; reads cool, pale, high-key [inferred]; no further hexes |
| Type | Century Gothic (regular, bold) + Josefin Sans Light [verified]; two geometric sans faces with near-circular bowls and single-storey `a` — an institutional-heritage voice, not a startup one [inferred]; scale and contract [unknown] |
| WebGL dosage | canvas-first on the homepage — one hydrated WebGL island in a static page [verified] |
| Scroll model | native + Lenis, sticky chapters driven by ScrollTrigger with a chapter rail (`ChaptersNavigation.astro`) [verified]; camera scrubbed by normalised chapter progress [inferred, high] |
| Narrative model | chaptered journey |

## 1. Concept and narrative
- The idea [verified name, inferred reading]: a business with no photogenic product borrows its own name's landscape. The texture set (`snowRockMix`, `snow_diffuse`, `rock_diffuse`, `rock_normal`, a baked `homepage-lightmap`) confirms a mountain is rendered on the homepage [verified]; the peak is the brand's etymology [inferred, high].
- The hero headline is the brand architecture set as one string — the four division names run together [verified]. The holding structure *is* the opening type.
- Spine, in order [verified]: identity ("a global commodity trading and asset investment company") → capability ("We trade, refine, store, and transport energy and commodities.") → promise (energy solutions "with integrity and efficiency") → the four divisions, each with a positioning line: Montfort Trading ("Operating Efficiently by Leading with Innovation."), Montfort Capital ("Identify and seize opportunities that maximise Value"), Montfort Maritime ("Powering Progress, Delivering Energy."), Fort Energy ("Advancing Innovation in Energy Investments") → global footprint, "over 15 global offices" across Switzerland, Istanbul, UAE, Nairobi, Dar es Salam, Cape Town, Mumbai, Karachi, Maputo, Luxembourg, Xiamen, Singapore → sustainability/ESG → CSR.
- ESG as four numbered pillars [verified]: Ethics & Compliance; Sustainable Energy Solutions (with E/S/G focus-area taxonomies); Equality ("almost 38 nationalities", "over 35% female workforce; over 20% women in management"); CSR with partners Mercy Ships, Mercy Corps, Kenya Red Cross, Emirates Red Crescent, The Doyenne Initiative.
- Register [inferred]: institutional, declarative, first-person plural, no wit. All charisma is in the camera; the copy stays boardroom. That contrast is the transferable trick.

## 2. Structure and components
- Routes [verified from nav and footer]: Montfort Group (home), Montfort Trading, Montfort Capital, Montfort Maritime, Fort Energy, News, Menu overlay; Contact, ESG, Privacy Policy, Terms of Use.
- Preloader [verified]: inline SVG with two linear gradients `spinner-firstHalf` / `spinner-secondHalf` on `currentColor` — the two-arc gradient ring.
- Nav [verified]: a persistent division switcher (parent + four children always visible) plus a full-screen Menu.
- Sound toggle [verified]: `<canvas id="sound-canvas" width="24" height="24">` — a live audio-reactive icon, so the control is the visualiser [inferred, high from the element]. Sound exists and is opt-in [verified].
- News with read state [verified]: markup shows "News (13 unread)" and a dedicated `visitedNews` bundle — visited items are persisted (localStorage [inferred]) and the rest badged.
- Chapter navigation [verified]: `ChaptersNavigation.astro`, numbered chapters with their own affordance.
- `Solutions.astro` [verified]: bespoke interactive behaviour on the divisions/solutions section. `Social.astro` [verified]: the social block.
- WebGL island [verified]: `WebGL.astro` client script, Three.js with `KTX2Loader`.
- Custom cursor [inferred, medium — asserted only by a replica's README]. 404, easter eggs [unknown].

## 3. Visual language
- Grounds and ink [verified hex, inferred roles]: slate `#2D628C` (P3-duplicated) as the single brand ink; white at 0.8 / 1.0 opacity for hierarchy; the ground is the rendered mountain — snow white and rock grey [inferred].
- Imagery is procedural, not photographic [verified]: `noise.webp`, `noise-solid-normal.webp`, `perlinNoise.webp`, `voronoi.webp`, `rock_diffuse.webp`, `rock_normal.webp`, `snowRockMix.webp`, `homepage/homepage-lightmap.webp`, `homepage/snow_diffuse.webp`, plus a `trading/` texture folder. A baked lightmap means static pre-lit lighting — cheap, consistent [verified file; inferred consequence].
- Environment [verified]: an EXR HDR map and `.glb` models in the production asset set.
- Type [verified]: Century Gothic + Josefin Sans Light, self-hosted; an unfashionable geometric choice that reads as heritage-modern [inferred].
- Layout system, grid, spacing tokens [unknown]. Light/dark [unknown]; the palette reads single-theme, high-key [inferred].

## 4. Motion and effects (with parameters)
- Smooth scroll: Lenis [verified]; lerp/duration [unknown].
- Scroll choreography [verified components, inferred mechanics]: GSAP ScrollTrigger drives chapter progression; the homepage camera moves across the procedural mountain, scrubbed by scroll — the benchmark project that copied it describes "scroll position → normalised 0.0–1.0 chapter progress → interpolated camera transitions" [verified quote of the imitator; inferred, high for the original].
- Route transitions [verified]: Astro `ClientRouter` — the View Transitions API; elements with matching `view-transition-name` morph natively between pages. Choreography details [unknown].
- WebGL [verified]: Three.js, KTX2 GPU-compressed textures, EXR HDRI, baked lightmap; noise/voronoi textures imply displacement or masking [inferred]; specific shaders beyond that [unknown].
- Sound [verified]: ambient/interactive audio with a 24×24 canvas toggle; default state [inferred: off]. Composer, format [unknown].
- Text animation technique, preloader-to-hero handoff timing, easings, durations [unknown].
- Compare: the same Lenis + GSAP ScrollTrigger + Three.js consensus stack in [site:lando-norris], driving scene state rather than a camera; a scroll-linked alternative without Lenis in [site:animejs] (`onScroll({ sync })`).

## 5. Tech and pipeline
- Architecture [verified]: static Astro HTML with per-component islands; the WebGL chunk and `KTX2Loader` load only where needed; one CSS file; Cloudflare in front — excellent TTFB and cacheability [inferred from the setup].
- Assets [verified]: all textures WebP, KTX2 available for GPU compression, baked lightmap removes runtime lighting cost, self-hosted woff2 (no Google Fonts round-trip), `.exr` and `.glb` payloads.
- SEO [verified]: `robots: index, follow`, full OG tags, and every division and ESG paragraph present in static HTML — the experience did not cost the content.
- Shipped placeholder [verified]: `<meta name="keywords" content="keyword 2, keyword 2">`.
- Budgets, Lighthouse, mobile 3D fallback, resize strategy [unknown].

## 6. Weaknesses
- `prefers-reduced-motion`, keyboard access to the chapter rail and Menu overlay, contrast of white-at-0.8 over snow, mobile 3D fallback [unknown] — no evidence either way, and none of the sources show a reduced-motion path.
- A production placeholder in the keywords meta [verified] and a replica describing the site as a "digital agency portfolio" [verified as a cloner's invention] — read clones for stack, never for content.
- Sound defaults [unknown]; the toggle exists, which is the right pattern, but autoplay policy is unverified.
- Custom cursor [inferred, medium] — if present, it needs a touch/keyboard fallback.
- What the awards skills do differently: a reduced-motion variant that freezes the camera on a lit still and keeps chapter jumps working; a chapter rail that is a real `<nav>` of links with visible focus and `aria-current`; the mountain's captions and division copy already in the DOM (Astro gets this for free — keep it); a load gate on real asset readiness with a skip; a resize strategy decided up front (rebuild the island on `ResizeObserver`, no breakpoint reloads — the trap [site:lando-norris] fell into); sound strictly opt-in and reversible.

## 7. Principles (3–6, generalisable)
1. When the product cannot be shown, build the world the *name* implies — mine the etymology for a landscape.
2. Sober words against extravagant motion: institutional copy never winks; the camera carries all the personality.
3. A chaptered scroll must also be skippable — a jump rail respects the visitor who came for one section.
4. Static HTML for everything that reads, one hydrated island for everything that moves, native cross-document morphs between routes.
5. Product thinking inside marketing: one small persistent-state feature (read/unread) outlasts any effect.
6. Procedural materials plus a baked lightmap beat photogrammetry for a terrain that must be tiny, fast and consistent.

## 8. Take / Don't take
- **Take:**
  - Metaphor-from-the-name: derive the 3D world from what the brand is called, not from what it sells.
  - The procedural-terrain recipe: Perlin + Voronoi noise, a rock diffuse/normal pair, a snow-mix mask, a baked lightmap, one EXR HDRI, KTX2 textures — no photogrammetry.
  - The chapter model: map scroll to a 0–1 progress per chapter, drive a camera spline from it, and expose a rail so the scroll is skippable.
  - A division/sub-brand switcher persistent in the nav for any holding structure — parent plus N children always visible.
  - Read-state persistence on a news/insights index with an unread count in the nav.
  - An audio-reactive toggle: a 24×24 canvas drawing the live waveform, so the control *is* the visualiser; default off.
  - Astro islands + View Transitions as the "cinematic site without a SPA" stack.
  - Wide-gamut duplication as progressive enhancement: `color: #hex; color: color(display-p3 …)`.
  - A geometric-sans institutional voice (Century Gothic / Josefin Sans *class*, not those faces) when the client must read as heritage rather than tech.
  - Numbered pillar sections with nested taxonomies for ESG/values content.
- **Don't take:**
  - The mountain — any snow-and-rock peak scrubbed by scroll is this site.
  - The hero-as-division-string, the four positioning lines, the office list, the ESG pillar copy.
  - `#2D628C` or its P3 twin; white-at-0.8 over snow as a package.
  - Century Gothic + Josefin Sans Light as a pairing.
  - The two-arc gradient-ring preloader as drawn; the section order identity → capability → promise → divisions → footprint → ESG → CSR.
  - The 24×24 sound icon as an asset.

## 9. Confidence and sources
- Identity, copy, divisions, offices, ESG, fonts, colour, Astro version, chunk names, textures, Cloudflare, preloader, sound canvas, unread badge: [verified], very high — read from the static mirror of the production site.
- Lenis / GSAP / Three / EXR / GLB: [verified], high — `MONTFORT-CLONE.md` documents re-serving the original bundles.
- Camera choreography, cursor, shader internals, tone: [inferred], medium. Awards and credits: [unknown].
- Sources: `https://raw.githubusercontent.com/Parthkk90/mont-fort.com/main/index.html`; `https://github.com/Parthkk90/mont-fort.com/tree/main/_astro`; `.../tree/main/assets/fonts`; `.../tree/main/assets/textures`; `.../tree/main/assets/textures/homepage`; `https://raw.githubusercontent.com/parw8649/experiment_monica_clinic_website/main/MONTFORT-CLONE.md`; `https://github.com/suhasreverie/mont-fort-replica` (+ `package.json`, `README.md`, `components/Hero.tsx` — stack corroboration only, content claims discarded); `https://raw.githubusercontent.com/WebDeveloper-Taslima/Minimalist-3D-Interactive-Story-Website/main/README.md`. Other replicas seen, not read: `ahadarain4/mont-fort-clone`, `ubaid926/mont-fort-office`, `himavamsi12/mont-fort-trail`, `KathiravansCode/mont-fort-project`, `aeternitas120/AURION.new`. Research report: `scratchpad/research/batch-D.md`.
