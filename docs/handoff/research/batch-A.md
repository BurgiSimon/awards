I've exhausted the session's web search budget (200/200) but gathered substantial verified material. Here is the report.

---

# Batch A — Deep Research Report

**Evidence note:** the sites themselves, awwwards.com, archive.org and all galleries were network-blocked. Everything below comes from (a) text extracted by WebSearch from awwwards/CSSDA/FWA/Orpetron/landing.love/uiuxshowcase/Codrops result pages, and (b) direct WebFetch of GitHub. I mark inferred/second-hand items explicitly. Where a date or score was reported inconsistently across extractions, I say so rather than pick one.

---

## Léo Parpeix — Portfolio 2026 — https://www.leoparpeix.com/

### Type / purpose
Personal portfolio for a **French art director & interactive designer** (raised in France, based Montreal/Paris). Business goal: land freelance + studio work and function as a credibility artifact — the site *is* the proof of craft. Structure is three routes plus an external lab: **Work (/) · About (/about) · Playground (/playground) · Lab (lab.leoparpeix.com)**. Reported to be ~3 years in the making.

### Awards & recognition
- **Awwwards Site of the Day — 14 September 2026**, with **Developer Award**. Submitted as a PRO entry.
- Overall score reported as **7.69/10** (one extraction cited a jury member, Marina Golubeva, RU, scoring 8 on Design).
- Awwwards category tags reported: **Web & Interactive, Experimental, Animation, Portfolio, Typography, Transitions, 3D**. Technologies tagged: **3D, WebGL, After Effects, Blender**.
- Also featured on **Lapa Ninja**, **landing.love**, **Orpetron**, **Muzli**. Léo was an **Awwwards Young Jury member (2025)**.
- No Honorable Mention found for this specific site (his earlier agency work has SOTM/SOTD/FWA — Immersive Garden site, Vooban, Longines Spirit Flyback, Longines Spirit Zulu Time, Dioriviera).

*Confidence: high on SOTD + Developer Award + date; medium on the 7.69 score.*

### Credits
Full credit block, recovered verbatim from an extraction of the launch post:
- **DA, UI, Interactive design** — Léo Parpeix
- **Front-end development + WebGL** — **Thoma Lecornu** (thomalecornu.fr)
- **3D Modelisation** — Victor Roussel, Léo Parpeix
- **3D Lighting & Textures** — Victor Roussel, Felix Sikora, Lucas Gousserey, Léo Parpeix
- **3D to WebGL** — Victor Roussel, Lucas Gousserey, Léo Parpeix
- **Sound design** — Léonard Bichet
- **Copy** — Jessica King

⚠️ Two separate search extractions instead claimed *"built by creative developer Mélina Guyon."* I believe this is a **search-summariser error** — the detailed, self-consistent credit block above names Thoma Lecornu and is corroborated by his portfolio surfacing in the same result set. Treat "Mélina Guyon" as **unverified/probably wrong**.

*Confidence: high on the detailed block; the conflict is flagged.*

### Concept & narrative
A **first-person craft manifesto**, not a case-study index. Copy (recovered from the clone's content file, so near-verbatim rather than exact):
- Header line: *"Driven by detail. Obsessed with seamless motion."*
- Hero, split across lines: **"French / Interactive / Designer"**, resolving on reveal to **"Creative / Passionnate / Art Director"** — a two-state hero where the identity statement mutates.
- Locator: *"Raised in France / Designing worldwide"*; *"Currently pushing design boundaries at @Locomotive and in freelance"*, former **@ImmersiveGarden**.
- Intro: *"Bonjour, I cherish simplicity, a touch of craziness, a unique identity & pixel-perfect animations."*
- About: *"Art director & Interactive Designer with 6+ years creating digital experiences."* / *"I bridge the gap between imagination, design systems, and bleeding-edge WebGL technology."*
- Footer CTA, three-line: **"Let's create / a remarkable / journey"**

Structure unfolds as: gated loader → hero identity statement → intro + showreel → **3 projects → WebGL typographic break → 3 projects** → Archives list → footer CTA. Each project carries a **metadata quartet: name · type · year · team size + studio** (e.g. *Creandum — Finance, 2023, Team of 2 @ImmersiveGarden*; *Dioriviera — 2023, Team of 5 @ImmersiveGarden, Awwwards ×1, FWA ×1*; also Veillance, Mechachain, Dulcedo, Trebuchet). About page carries a **tabular CV** (Freelance 2023–present; Locomotive 2022–23; Immersive Garden 2020–22; Trebuchet 2019–20) and an awards tally (*Awwwards SOTD ×8, FWA ×6, CSSDA ×12*).

Tone: warm-but-precise, French-inflected ("Bonjour", "Passionnate" — the misspelling appears intentional/charming), craft-obsessive, zero corporate voice. Numbers and roles do the bragging instead of adjectives.

*Confidence: medium-high — content recovered from a faithful clone, so wording may be approximate; the project/client names are independently corroborated by his real award history.*

### Visual design language
- **Typography (verified):** **Monument Grotesk** (Dinamo) for text/UI + **Avantt** (variable) for display/titles. A neo-grotesque body against a wide, geometric-humanist display — the classic "quiet workhorse + loud display" pairing. Awwwards tagged the site under Typography.
- **Palette** (from the clone's `variables.css`; treat hexes as *reconstructed approximations* of the real thing, but the hue story is clearly right):
  - `--color-green: #083D2A` (deep forest — the primary ink)
  - `--color-dark-green: #022016`
  - `--color-emerald: #008841`
  - `--color-yellow: #F6E016` (accent)
  - `--color-cream: #EED6C8` (accent)
  - `--color-offwhite: #F7F7F7`
  - `--color-border: rgba(8, 61, 42, 0.15)`
- **Theming is a first-class system**, not a dark-mode toggle — four named themes swapped per section/route:
  - default → bg `#FFFFFF`, text `#083D2A`
  - dark → bg `#083D2A`, text `#F7F7F7`
  - yellow → bg `#F6E016`, text `#083D2A`
  - green → bg `#083D2A`, text `#EED6C8`
- **Imagery:** hybrid. Real WebGL 3D (a `scene_v9.glb` architectural/studio environment), cloud plane sprites, WebP project stills in draggable carousels, `.aac` audio, plus a reel video. Pipeline is **Blender → glTF/Draco → Three.js**, with After Effects for motion boards.
- **Atmosphere:** a shader-generated vertical gradient backdrop blending cream `vec3(0.92,0.90,0.87)` into dark teal `vec3(0.03,0.24,0.16)` via `smoothstep(0.1,0.85,vUv.y)`, three-point lighting (ambient 1.5, warm key `0xfffaed`, cool fill `0xe8f0ee`), drifting semi-transparent clouds at 0.35 opacity.
- **Layout:** editorial, generous. Fluid `clamp()` type scaling; desktop gutters 40–120px collapsing to 20px on mobile; two-column CV/awards table collapsing under 900px.

*Confidence: high on fonts; medium on exact hexes (reconstruction).*

### Components & sections
- **Preloader with an explicit entry gate.** Percentage counter that advances in randomised 5–23 point jumps every 100ms (deliberately *non-linear* so it feels organic), title + loading word, then the button: **"Click to enter & enable sound."** Sound is opted into, never forced. Emits a `LOADER_REVEAL_COMPLETE` event that starts the reveal.
- **Navigation:** minimal horizontal list (Work / About / Playground) + an external **"Lab ↗"** with the arrow glyph. A **sound toggle rendered as animated equaliser bars** reflecting state. Mobile = fullscreen overlay teleported to body (`z-index: 99990`), **numbered links (01, 02, 03…)**, closes on Escape or route change, with sound toggle + socials in the overlay footer.
- **Custom cursor — the signature component.** Two layers with deliberately different inertia: an **inner precision dot at lerp 0.75** (snappy) and an **outer spring ring at lerp 0.22** (laggy, silky). On interactive hover the ring scales to `1.35` while the dot *shrinks* to `0.7`, ring opacity 0.35 → 0.8, and a dashed orbit animation speeds from 9s to 4s. It becomes a **contextual pill badge with an SVG icon**: `drag` (arrows), `play` (triangle), `view` (eye), `feed` (radial sunburst), `copy/mail` (envelope). Badge colour alternates **#F6E016 / #EED6C8** by action type. Fully suppressed on `(hover: none), (pointer: coarse)`.
- **Draggable project carousel** (`ProjectSlider`) with lazy-loaded WebP.
- **Archives list** — text rows where hover spawns a **floating image preview that chases the cursor** via `translate3d` with a 0.25 easing factor. ~18 items.
- **WebGL typographic break** between the two project groups — a full-viewport animated type moment used as a palate cleanser.
- **Easter egg:** a *"Feed Bee"* hint in the hero that **spawns 3D fruit into the WebGL scene on click**, each spawn randomly firing `fruit1.aac` or `fruit2.aac`. A play-for-play reward with no navigational purpose.
- Footer: three-line CTA, Instagram / Email / LinkedIn, green theme.

*Confidence: medium-high — all from a clone that reproduces the site closely; component *names* and behaviours are consistent with every written description of the real site.*

### Motion & creative effects
- **Smooth scroll:** **Lenis** (^1.1.x), wrapped in a `SmoothScroll` service.
- **Animation:** **GSAP 3.12+** throughout. Two house easings: `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` and `--ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1)`. The same expo-out curve is reused on the cursor, so page motion and pointer motion share a "feel."
- **Real-time fluid simulation driving the whole frame.** A 128×128 (`simRes: 128`) ping-pong velocity FBO pair (`velFboA`/`velFboB`). Mouse delta × 10.0 is splatted into the velocity field (`uRadius` 0.0015 at rest → 0.002 while moving) with `uDissipation: 0.96`. It's an **advection-only** sim — no curl confinement, no pressure projection — which is the smart cheap choice for a cursor wake.
- **Post-processing pass fed by that velocity texture:** UV distortion at `uDistortionStrength: 0.0035`, `uVelocityScale: 1.5`, plus **chromatic aberration** sampling R and B at `vel * 0.001` offsets from G. Net effect: *the entire page ripples and fringes in the wake of your cursor* — the "developer award" move.
- **Scroll-scrubbed 3D:** gentle model parallax rotation `model.rotation.y = scrollY * 0.00015`; clouds drift on `Math.sin(time * 0.15 + idx) * 0.002`.
- **Page transitions** with a dedicated `pageTransition.aac` cue.
- **Sound design (opt-in):** looping `ambient.aac` at volume 0.375; SFX at 0.35; raw `HTMLAudioElement` with `currentTime = 0` resets and silent `.catch(() => {})` — no Howler needed.

*Confidence: medium-high (clone-derived), high on the general vocabulary (Lenis + GSAP + fluid cursor + chromatic aberration is corroborated by every description).*

### Tech stack (with evidence)
From `package.json` of **CW-Ankit/leoparpeix-clone** (an explicitly *educational* reconstruction, "Original Concept & Design: Léo Parpeix"):

```
dependencies:  gsap ^3.12.7 · lenis ^1.1.20 · pinia ^2.3.1 ·
               three ^0.174.0 · vue ^3.5.13 · vue-router ^4.5.0
devDeps:       vite ^6.2.0 · vite-plugin-glsl ^1.3.1 · typescript ~5.7.3 ·
               @vitejs/plugin-vue ^5.2.1 · @types/three
```
Architecture: `src/webgl/{WebGLManager, HomeScene, AboutScene, TopScene, FluidSimulation, PostProcessing, GLTFLoaderHelper}.ts`, `src/services/{EventBus, SmoothScroll, SoundController}.ts`, Pinia store, `public/` holding `.glb` models + **Draco decoders** + audio. Assets are downloaded by a script rather than committed.

⚠️ **This is the clone author's reconstruction, not the original source.** Independent corroboration for the real site: Awwwards tags it **3D / WebGL / After Effects / Blender**; galleries list **Three.js, GSAP, Lenis, WebGL, custom GLSL**. The **Vue 3 + Vite** choice is the least-corroborated element (it is plausible — Léo's collaborators are in the French Vue/Nuxt orbit — but treat as **inferred**). Hosting/CDN, CMS and font licensing source: **unknown**. Fonts are self-hosted `.woff2`/`.ttf` in the clone; the real site almost certainly self-hosts licensed Monument Grotesk + Avantt too.

*Confidence: high that GSAP + Lenis + Three.js + GLSL are used; low-medium on Vue/Vite specifically.*

### Responsive / accessibility / performance notes
- Custom cursor and fluid interaction **cleanly disabled** on coarse pointers — the correct pattern.
- Mobile menu is a proper fullscreen overlay with Escape-to-close and route-change dismissal.
- Fluid type via `clamp()`; grid collapses at 900px; padding 40–120px → 20px.
- Lazy-loaded WebP imagery; Draco-compressed geometry; `font-display: swap`.
- **No `prefers-reduced-motion` handling found** in the reconstruction — a real gap for a site this motion-dense.
- Audio is gated behind explicit consent (good), but the **entire experience is gated behind a click-to-enter** (a known Awwwards-friendly / usability-hostile trade; the 7.69 overall with lower usability weighting is consistent with that).
- No published criticism found.

*Confidence: medium.*

### Why it is award-worthy
1. **One global, physically-simulated interaction layer.** Rather than a dozen isolated hover tricks, a single fluid velocity field feeds a post-process that distorts and chromatically fringes *everything*. Unifying effect > accumulating effects.
2. **Dual-inertia pointer.** Splitting the cursor into a fast dot and a slow ring makes the pointer feel like an object with mass. Cheap, and it reads as "crafted" instantly.
3. **Semantic cursor.** The cursor is the affordance system — it *tells you* `drag` / `play` / `view` — which lets the layout stay clean of UI chrome.
4. **Theme as narrative rhythm.** Four named themes (white, forest, yellow, cream-on-green) swapped by section, so scrolling feels like turning pages of a printed book rather than descending one canvas.
5. **Metadata as the boast.** Projects are annotated with *team size, studio, year, award count* — credibility conveyed by structured data, not adjectives.
6. **A purposeless easter egg.** "Feed Bee" spawns fruit with sound. Play signals confidence and buys jury goodwill.

### Reusable patterns to extract
- **Velocity-field post-process:** maintain a low-res (128²) ping-pong velocity FBO; splat pointer delta into it; feed the texture into a full-screen pass doing UV offset + RGB-split. Advection + dissipation only — skip pressure solve.
- **Two-speed cursor:** ring at lerp ~0.2, dot at lerp ~0.75; ring scales up while dot scales down on hover; always gate behind `(pointer: fine)`.
- **Contextual cursor badge:** `data-cursor="drag|play|view"` attributes on targets; cursor renders a matching pill + icon, colour-cycled from a 2-colour accent set.
- **Non-linear preloader:** randomised increments and a required "click to enter & enable sound" so audio consent and the reveal trigger are the same gesture.
- **Named theme tokens swapped per section** (`--theme-bg` / `--theme-text`) rather than a binary dark mode.
- **Hover-to-preview archive list:** text rows; on hover, an image follows the cursor with ~0.25 lerp.
- **Typographic break between content groups** — a full-viewport animated type slab used as a rhythm device.
- **Project metadata quartet** — name / discipline / year / "Team of N @Studio" + award tally.
- **Two-state hero headline** that resolves from one identity claim to another.

### Confidence & sources
Awards **high** · Credits **high** (one flagged conflict) · Typography **high** · Palette **medium** · Components/Motion **medium-high** · Stack **medium** · A11y **medium**
- https://www.awwwards.com/sites/leo-parpeix-portfolio-2026
- https://www.awwwards.com/leoparpeix/submissions · https://www.awwwards.com/jury-member/leoparpeix
- https://github.com/CW-Ankit/leoparpeix-clone (+ raw `package.json`, `src/styles/variables.css`, `src/styles/fonts.css`, `src/data/siteContent.ts`, `src/webgl/HomeScene.ts`, `src/webgl/FluidSimulation.ts`, `src/webgl/PostProcessing.ts`, `src/components/{LoaderBlock,NavbarComponent,CursorIndication}.vue`, `src/views/{HomeView,AboutView}.vue`)
- https://www.lapa.ninja/post/leo-parpeix/ · https://www.landing.love/sites/leoparpeix/ · https://orpetron.com/sites/leo-parpeix-portfolio/ · https://me.muz.li/leo-parpeix/leo-parpeix-art-director-interactive-designer-2
- https://thomalecornu.fr/ · https://www.linkedin.com/in/leo-parpeix/ · https://theorg.com/org/locomotive/org-chart/leo-parpeix

---

## White Desert — https://white-desert.com/

### Type / purpose
**Luxury travel / expedition operator** — a high-consideration, enquiry-driven brochure site (not e-commerce). White Desert is the world's leading luxury Antarctic expedition company: the **only operator flying private charter jets to the continent**, running three camps (**Whichaway**, **Echo**, **Wolf's Fang**) on its own blue-ice runway, Nov–Feb. Founded by polar explorer **Patrick Woodhead**. Guests: UHNW, 12 per camp. The site's job is to make a ~$100k+ decision feel inevitable and then convert to *enquire / book a call*.

### Awards & recognition
- **Awwwards Site of the Day** — date reported as **12 September 2026** in two extractions and **11 September 2026** in one. Treat as **11–12 Sept 2026**.
- Scores reported: **Design 7.28 · Usability 7.27 · Creativity 7.21 · Content 7.74** (Awwwards weighting 40/30/20/10 → ~**7.35 overall**). Note **Content is the highest sub-score** — unusual, and the tell for what this site actually is.
- One extraction claimed a **Developer Award**; not corroborated. **Low confidence — treat as unconfirmed.**
- Awwwards colour tag: **2 colours**. Category: Luxury / Travel.
- No CSSDA, FWA, Godly or Lapa entries surfaced.

*Confidence: high on SOTD; medium on scores; low on Developer Award.*

### Credits
- **Studio: Malvah** (malvah.co) — Cape Town, South Africa, founded 2018, **Awwwards Studio of the Year 2025** (first South African studio to win it). Offering: branding, UX/UI, 3D & motion, web development. Tagline philosophy: *"the best brands feel confident, human, and intentional."* Founders: Tyrone and Tim.
- **Geoff Dawes** — front-end developer at Malvah (credited on Awwwards; also credited on Malvah's SOTD-winning *Robot* and *dhk Architects*).
- **"Usudo"** — credited alongside on the Awwwards entry; **role unknown** (possibly a dev shop or individual handle).
- **Teagan Cunniffe** — professional photographer associated with White Desert's imagery (brand-level credit; not confirmed as the site's shooter).
- Note: White Desert's PR/comms is Gabrielle Shaw Communications — not the site.

*Confidence: high on Malvah + Geoff Dawes; low on Usudo and photography.*

### Concept & narrative
The site sells **restraint as luxury**. The narrative is geographic and factual rather than emotive — it earns awe with *coordinates and measurements*, never with superlatives. Verbatim site copy recovered:

> *"The journey to the South Pole is a passage to one of the most consequential coordinates on Earth. At 90°S, the Pole marks the southern axis of the planet and the ultimate milestone of polar exploration. At 3,000 m (10,000 ft) above the ice, the High Polar Plateau unfolds as an unbroken expanse of white and sky, with time at the Pole being deliberately simple: standing at the bottom of the world, where all directions lead north."*

> *"Standing nearly 1.2 m (4 ft) tall and weighing up to 45 kg (99 lb), the Emperor Penguin is Antarctica's largest and most resilient bird."* … *"Unaccustomed to visitors, the chicks often waddle close, unafraid."*

> *"…visited by fewer than 500 people each year."* · *"Limited to just 12 guests each."* · *"a team of over 100 on the ground."*

**Copywriting rules observable here, worth stealing wholesale:**
- Dual units always — `3,000 m (10,000 ft)`, `45 kg (99 lb)`, `1.2 m (4 ft)`.
- Scarcity expressed as a *number*, never as "exclusive."
- Sentences that end on a turn: *"where all directions lead north."*
- Contrast as the core rhetorical device: engineered warmth vs. hostile wilderness — *"a cinematic hideout… a soft counterbalance to the ancient, jagged beauty just beyond the window."*
- Camp positioning as distinct characters: Whichaway = a 2005 former East German science base, contemporary design over a legacy of research; **Echo = "designed as an intergalactic space station"** (inspired by astronauts Terry Virts and Buzz Aldrin comparing Antarctica to an alien planet; six sky pods, floor-to-ceiling glass, a $320,000 Anthony James light sculpture); Wolf's Fang = adrenaline hub (ice climbing, fat-biking, abseiling, an ice bar).

Information architecture (from indexed URLs): `/` · `/camps` (`/whichaway-camp`, `/echo-base`) · `/itineraries` + `/stay/trips` (`the-greatest-day`, `the-long-stay`, `south-pole-emperor-penguins`, `early-emperor-penguins`) · `/prices` · `/explore/regions/*` · `/explore/operation` · `/learn/sustainability` · `/learn/our-story` · `/about/founders` · `/about/foundation` · `/about-us/team-members` · guest library. So: **Explore / Stay / Learn / About** as the top-level spine, with a persistent enquiry CTA (*"send an enquiry or book a call"*).

*Confidence: high on copy and IA (from indexed page text); medium on narrative sequencing of the homepage specifically.*

### Visual design language
- **Palette: 2 colours** per Awwwards. Exact hexes **unknown** — I could not retrieve them. Given the brand ("White Desert", ice, and Malvah's house minimalism) the near-certain read is **an off-white/ice ground with a single deep neutral ink** (charcoal or deep navy), with all chroma supplied by photography. State this as inference, not fact, in any derived skill.
- **Light-dominant**, in deliberate opposition to the dark-mode default of most award sites.
- **Typography: unknown** (no font attribution surfaced). Malvah's house voice across projects is described as bold, minimal, confident, with *"spare geometry and deliberate motion"* and *"every visual decision mirrors the precision of the built work"* — i.e. expect a restrained grotesque/neo-grotesque, possibly with an editorial serif for long-form.
- **Imagery is the design.** Photography does all the emotional work: ice, pods glowing at dusk, Emperor colonies, jets on blue ice. Expect full-bleed and cinematic crops. No 3D, no WebGL tagged.
- **Layout:** editorial, full-bleed alternating with generous whitespace. Content-first (highest sub-score was Content, 7.74).

*Confidence: palette **low** (count only), typography **low/unknown**, imagery-led approach **high**.*

### Components & sections
Inferable from IA and the copy, **not directly observed** — flag accordingly:
- Hero: full-bleed cinematic media with a restrained headline.
- Camp pages as distinct chapters, each with its own character/positioning.
- Itinerary/trip cards leading to detail pages; a **Dates & Rates** table (`/prices`).
- Regions/operations explainer (runway, logistics, the 100-person ground team) — credibility content.
- Sustainability + Foundation sections — ESG as luxury permission.
- Team/founders bios; a guest library (editorial/resource content, plus PDFs).
- Persistent **enquiry + book-a-call** CTA rather than a cart.
- CMS-driven collections (Contentful) for camps, trips, regions, team.

*Confidence: medium on IA-derived sections; low on specific component treatments (preloader, cursor, marquee etc. — **unknown**).*

### Motion & creative effects
- **GSAP** is confirmed in the Awwwards tech list. No ScrollTrigger/Lenis/Locomotive specifically confirmed.
- No WebGL, Three.js or 3D tags — this site wins **without** a 3D layer, which is itself the notable fact.
- Specific reveals, parallax, transitions, cursor treatment: **unknown**. Malvah's described signature is *"deliberate motion"* that lets the work lead — i.e. restrained, slow, editorial reveals rather than spectacle.

*Confidence: GSAP **high**; everything else **low/unknown**.*

### Tech stack (with evidence)
Confirmed via Awwwards technology tags, corroborated across three independent extractions:
- **Framework:** **Next.js**
- **CMS:** **Contentful** (headless — consistent with a big multi-locale content set: camps, trips, regions, team, library)
- **Animation:** **GSAP**
- **Hosting:** **Vercel**
- WordPress legacy exists (`/wp-content/uploads/...` PDFs still served) — suggests a **migration from WordPress to Next.js + Contentful**, with old assets left in place.
- Fonts source, image CDN, form/booking backend: **unknown**.

*Confidence: high.*

### Responsive / accessibility / performance notes
- **Unknown** in specifics. The 7.27 usability score is mid-range: respectable, not exceptional.
- Content score (7.74) being the highest suggests depth and editorial quality carried the entry.
- No reduced-motion, contrast or perf criticism found in any review.
- Next.js + Vercel implies image optimisation and edge delivery by default.

*Confidence: low.*

### Why it is award-worthy
1. **It wins on content and photography, not effects.** A counter-example to the WebGL arms race: an SOTD whose strongest sub-score is *Content*. Craft in an unfashionable place.
2. **Factual awe.** Specificity (90°S, 3,000 m, fewer than 500 people/year, 12 guests) generates more wonder than any adjective. Numbers are the luxury signal.
3. **Restraint as the luxury language.** Two colours; a light ground; images carry all chroma. The design gets out of the way of a landscape that is literally monochrome.
4. **Each property gets a distinct character** rather than a repeated template — Echo as a space station, Wolf's Fang as adrenaline, Whichaway as heritage-science-turned-comfort.
5. **Contrast as the organising idea** — engineered warmth set against a hostile continent — expressed in copy, photography and (per Malvah's house style) in the pacing of motion.
6. **Conversion is a conversation.** Enquire / book a call, not "Add to cart" — the UX matches the price point.

### Reusable patterns to extract
- **Two-colour discipline + photography as the only chroma source.** Lock the UI palette to a ground and an ink; forbid accent colours; let imagery supply all saturation.
- **Specification-grade copy:** every claim carries a number and dual units; scarcity is stated numerically.
- **Sentence-ending turns** — close paragraphs on a reframe (*"where all directions lead north"*).
- **Named-property pattern:** for multi-location/multi-SKU brands, give each its own concept sentence and visual character; resist a shared template.
- **Credibility content as a section type:** operations, logistics, team size, runway specs — the "how this is even possible" chapter that de-risks a high-ticket decision.
- **Sustainability/foundation as permission structure** for conspicuous consumption.
- **Enquiry-led CTA** (send an enquiry / book a call) for high-consideration products.
- **Headless CMS content model** mirroring the narrative spine (Explore / Stay / Learn / About).

### Confidence & sources
Awards **high** (date ±1 day) · Credits **high** · Copy/IA **high** · Palette **low** · Typography **unknown** · Components/Motion **low** · Stack **high**
- https://www.awwwards.com/sites/white-desert · https://www.awwwards.com/Malvah.Studio/
- https://white-desert.com/ + `/camps`, `/camps/whichaway-camp`, `/camps/echo-base`, `/itineraries`, `/itineraries/south-pole-emperor-penguins`, `/prices`, `/explore/regions/wolfs-fang-runway-and-echo`, `/explore/operation`, `/learn/our-story`, `/about/foundation`
- https://www.malvah.co/ · https://www.malvah.co/studio
- https://tympanus.net/codrops/2026/03/30/where-confidence-needs-no-decoration-the-malvah-studio-story/ (blocked; read via search extraction)
- https://lbbonline.com/news/Malvah-Studio-of-the-Year-2025-Awwwards
- https://en.wikipedia.org/wiki/White_Desert_(company) · https://robbreport.com/travel/hotels/white-desert-echo-camp-antartica-1235711185/

---

## Why Zero — https://why.zero.university/

### Type / purpose
**Campaign / manifesto microsite** (a "why" site sitting beside the product at zero.university). Zero is an **AI-native alternative to university** — *"Learn. Build. Get Hired."* — no textbooks, no debt, built by reverse-engineering real jobs, ending in a waitlist. So: a **persuasion artifact aimed at prospective students and investors**, whose entire job is to make the incumbent (a degree) feel absurd. Founder: Navid Nathoo.

### Awards & recognition
- **Awwwards Site of the Day + Developer Award.** ⚠️ Date reported inconsistently across extractions: **21 July 2026**, **7 September 2026**, and **8 September 2026**. I could not resolve this. Most likely the July date is the FWA/another award bleeding in, and the Awwwards SOTD is early September — but **flag as unresolved**.
- **CSS Design Awards — Website of the Day, 11 August 2026, score 8.99** (judged/associated with Sindhur Dutta). That is an exceptionally high CSSDA score.
- **FWA — FWA of the Month, July 2026.** FWA credits: **Sindhur Dutta** and **Zero Design**.
- **CSS Winner**, **Orpetron**, and per the team **"20+ / 22+ international awards and recognitions."**
- Orpetron/CSSDA tags: *AI, Promotional, Startups, Technology, 3D, 404 pages, AI-generated content, Animation on scroll, CGI, Custom cursor, Fullscreen, Graphic design, Header Design, Illustration, Interactive animation, Interactive Design, Interactive header, Storytelling.*

*Confidence: high on award set; **low on the Awwwards date**; high on CSSDA 8.99 and FWA of the Month.*

### Credits
- **Concept & design direction: Atul Khola** — Head of Experience at Zero; joined as the third hire and built a **12-person Design & Experience team** covering product, brand language, investor story, launch films, social and this site.
- **Design: Zero University / Zero Design** (in-house — notable: no external design agency).
- **Development: BUNQ LABS** — *"an award-winning design and engineering studio… brand, interface, motion and real-time web design, drawn and built by the same small team."* Their own site runs as a real-time WebGL environment with audio-led entry and a reactive cursor.
- **Sindhur Dutta** — credited on FWA (2 FWAs) and associated with the CSSDA entry.
- Individual 3D artists / sound designers: **unknown**.

*Confidence: high.*

### Concept & narrative
The single best-documented narrative of the four, thanks to a Codrops engineering case study. Build took **four months**.

**Entry ritual:** you are asked to **draw a zero**. The moment the circle closes, **frost spreads outward from your stroke** and progressively reveals the experience. The loading screen is thereby converted into an act of authorship — you sign the manifesto before you read it.

**Structure: six scrolling stages connected by five interactive gates** that pause or redirect the flow. Documented gates include *draw a zero*, *hold to shatter the glass*, and *hold to launch through a tunnel*.

- **Stage 1 — the promise.** The traditional path stated straight: study hard, get good grades, land a job at a top company.
- **Gate 1 — the betrayal.** The promise **literally shatters**, and **real unemployment statistics scatter across the broken glass**. This is the thesis delivered as a physical event.
- **Stage 3 — devaluation.** The diploma becomes "just another piece of paper": **cash burns**, **certificates shred**, and the scene funnels into **a tunnel whose cross-section is extruded from the ZERO logotype** — the brand mark literally becomes the passage forward.
- **Later stages** run through the alternative, ending at an **interactive city map navigated with game-style controls**.
- **Finale — the waitlist form presented as an origami fold**, not a set of inputs.
- **Running the whole time: an XP counter in the corner**, accumulating as you descend. Progression is **gated, not merely revealed** — sections *unlock*.

Tone: defiant, adversarial toward the incumbent, gamified rather than academic. The rhetorical structure is **promise → shatter → devalue → tunnel → alternative → enlist**.

*Confidence: high (Codrops case-study derived).*

### Visual design language
- **Palette: 2 colours — white `#ffffff` and green `#01C654`.** That's the whole system: a near-monochrome ground with one electric signal green. (Note the near-rhyme with Léo Parpeix's `#008841` — vivid green is a shared 2026 accent.)
- **Light-dominant / high-key**, with frost and glass as the material metaphors.
- **Typography:** served via **Google Fonts API** (so a freely-licensed family, not a boutique foundry) — specific families **unknown**. A documented shader effect is **"hexagonal text blur,"** implying type is rendered into/through the WebGL layer at key moments rather than being pure DOM.
- **Imagery: 3D/CGI throughout**, modelled in **Blender**, plus illustration and some AI-generated content (per the gallery tags). Materials referenced: frost, glass, paper, currency, extruded logo geometry.
- **Layout: fullscreen**, single continuous canvas — there is no conventional page grid; the "layout" is a camera path.

*Confidence: palette **high**; typography **low**; 3D/CGI **high**.*

### Components & sections
- **Interactive preloader / entry gate:** draw-a-zero gesture capture → frost dissolve reveal.
- **Five interactive gates** interrupting scroll: press-and-hold to shatter; press-and-hold to launch; etc. **Hold-to-proceed** is the recurring verb.
- **XP counter HUD** — persistent corner UI that accumulates, borrowed straight from games.
- **Custom cursor** (tagged).
- **Interactive city map** with game-style controls as the navigation payoff.
- **Origami-fold waitlist form** as the conversion moment.
- **Custom 404 page** (tagged).
- **Interactive header** (tagged).
- Full-screen chaptered scroll rather than discrete sections; the entire experience is one continuous camera move from loader to map.

*Confidence: high.*

### Motion & creative effects
- **No smooth-scroll library and no ScrollTrigger.** The most instructive architectural decision on any of these four sites: *"avoid relying on the browser's native scroll altogether. There is no ScrollTrigger and no oversized scrolling DOM. Instead, wheel and touch input update a virtual scroll value that eases towards its target."* Scroll becomes a **single normalised progress float** driving a camera and a timeline — which is precisely what makes gating, holding and redirecting flow possible.
- **Custom GLSL shaders, named in the case study:**
  - **frost unlock** (the entry reveal spreading from your drawn stroke)
  - **burning money**
  - **certificate shredding**
  - **tunnel pulse**
  - **hexagonal text blur**
- **GSAP** for timeline orchestration (but not ScrollTrigger).
- **Howler** for audio.
- **Adaptive quality manager:** dynamically adjusts **pixel ratio, blur sample count, and geometry detail** from **real-time frame timing**, to hold **60fps on a budget Android phone**. This is almost certainly what earned the Developer Award.
- Gated progression, hold-to-advance micro-interactions, XP accumulation — **game feel applied to a marketing page**.

*Confidence: high.*

### Tech stack (with evidence)
From the Codrops case study *"ZERO: The Engineering Behind a Defiant Interactive Narrative"* (17 July 2026), plus gallery tech tags:
- **Three.js** (no React/R3F mentioned — appears to be vanilla Three)
- **GSAP** (timelines; explicitly **not** ScrollTrigger)
- **GLSL** custom shaders
- **Vite** build
- **Howler** audio
- **Blender** for 3D authoring
- **Google Fonts API**
- **Custom virtual-scroll implementation** (wheel/touch → eased target value)
- **Asset pipeline:** **DRACO** geometry compression + **KTX2 / ETC1S** GPU-compressed textures + **texture atlases**, taking **>1 GB of source assets down to under 10 MB shipped**.
- Framework (Next/Nuxt/vanilla), CMS, hosting: **unknown** — likely a static/vanilla build given Vite + no framework mention.

*Confidence: high.*

### Responsive / accessibility / performance notes
- **Built for desktop *and* mobile** from the start; the adaptive quality manager is explicitly targeted at **budget Android** hardware at **60fps**. This is best-in-class for the genre.
- **<10 MB total payload** for a full 3D narrative — extraordinary, and the single most transferable performance lesson here.
- **Accessibility is the open question.** A gesture-drawing entry gate, hold-to-proceed gates, and game-style map controls are inherently hostile to keyboard and assistive-tech users, and **no `prefers-reduced-motion` handling was mentioned**. No skip/bypass path was documented. **Unknown but likely weak.**
- No published criticism found.

*Confidence: performance **high**; accessibility **low/unknown but presumed weak**.*

### Why it is award-worthy
1. **The thesis is enacted, not stated.** "The degree is broken" is delivered by *shattering glass with real unemployment statistics embedded in the shards.* Argument as physics.
2. **Authorship at the threshold.** Making the visitor draw the zero converts a preloader into a commitment device — you've participated before you've read a word.
3. **Progression gating.** Sections *unlock*; some require a hold. This borrows the one thing games have that marketing sites don't: earned advancement.
4. **The logo as architecture.** Extruding the wordmark's cross-section into a traversable tunnel is brand identity fused with level design.
5. **Owning the scroll.** Replacing native scroll with a virtual eased progress value is what makes gates, holds and redirects possible — the interaction design *required* the engineering decision.
6. **>1 GB → <10 MB at 60fps on cheap Android.** Craft measured where it's hardest to fake.

### Reusable patterns to extract
- **Virtual scroll as a single progress float.** Intercept wheel/touch, ease a value toward a target, drive everything from it. Unlocks: gating, hold-to-advance, non-linear redirects, and mobile parity.
- **Gated narrative:** N stages joined by N−1 interactive gates, each gate a small physical commitment (draw / hold / press).
- **Enact the thesis:** find the one claim the site exists to make and give it a physical event (shatter, burn, shred) rather than a headline.
- **Participatory preloader:** replace a percentage counter with a gesture that reveals the site.
- **Brand geometry as environment:** extrude/lathe the logotype into navigable 3D space.
- **Game HUD in marketing:** a persistent progress/XP indicator to convert scroll depth into felt achievement.
- **Reframe the form:** present the conversion step as an object (an origami fold) rather than a field set.
- **Adaptive quality manager:** measure frame time; step down DPR → blur samples → geometry LOD. Ship a device-agnostic 3D experience.
- **Asset budget discipline:** DRACO + KTX2/ETC1S + atlases; target a single-digit-MB total for a full 3D narrative.
- **Two-colour 3D:** white ground + one electric accent (`#01C654`) keeps a CGI-heavy site from looking like a render farm demo.

### Confidence & sources
Awards **high** (date **low**) · Credits **high** · Narrative **high** · Palette **high** · Typography **low** · Motion/Stack/Perf **high** · A11y **unknown**
- https://www.awwwards.com/sites/why-zero
- https://www.cssdesignawards.com/sites/why-zero/49794/ · https://www.csswinner.com/details/why-zero/19308
- https://thefwa.com/cases/why-zero
- https://orpetron.com/sites/why-zero/
- https://tympanus.net/codrops/2026/07/17/zero-the-engineering-behind-a-defiant-interactive-narrative/ (blocked; read via search extraction)
- https://www.bunqlabs.com/ · https://orpetron.com/sites/bunq-labs/ · https://www.cssdesignawards.com/sites/bunq-labs/50021/
- https://www.atulkhola.com/ · https://www.linkedin.com/in/atulkhola/
- https://www.zero.university/ · https://www.zero.university/our-story · https://why.zero.university/

---

## USAvionix — https://www.usavionix.com/

### ⚠️ Identity correction (important)
**usavionix.com is NOT uAvionix Corporation.** These are two different companies with confusingly similar names:
- **uavionix.com** — uAvionix Corporation: ADS-B transponders, tailBeacon, ping200X, George autopilot, SkyLine C2, Casia. General aviation + UAS avionics components. *Not this site.*
- **usavionix.com** — **USAvionix**: *"Advanced Jet Drone Systems for ISR & Defense."* Designs and deploys **AI + jet-powered "sentient" drones**. Two named products: **Delta** (jet-powered VTOL ISR drone, ~**500 km/h**, **300–500 km** range, onboard AI tracking mobile targets) and **Phalanx AI** (mission intelligence and swarm coordination, *"powered by SARA — operators speak intent while the system adapts, routes, and integrates across connected platforms… directs single units or large swarms"*).

Any skill built from this research must not conflate them. Verified via the Awwwards entry's own description text and the site's indexed title/`/phalanx` page.

*Confidence: high.*

### Type / purpose
**Defense-tech product / capability site.** Audience is government, defense and public-safety procurement plus investors. The job: make an early-stage autonomous-weapons-adjacent platform feel operationally real, credible and inevitable. Applications stated: **wildfire detection, public safety, infrastructure protection, emergency response, border, defense**.

### Awards & recognition
- **Awwwards Honorable Mention — 10 or 11 August 2026** (reported both ways).
- **Awwwards Site of the Day — 9 or 10 September 2026** (reported both ways), **with Developer Award**.
- **Score: 7.41/10.**
- Awwwards colour tag: **2 colours — `#000` and `#fff`.** Technology tags: **3D, WebGL, Next.js.**
- Also featured on **landing.love** and **UI UX Showcase**.
- No CSSDA/FWA/Godly entry surfaced.

*Confidence: high on HM→SOTD progression, Developer Award, score and palette; ±1 day on both dates.*

### Credits
- **Studio: basement.studio** (a.k.a. **bsmnt**) — *"We make cool shit that performs."* A digital studio of designers, developers and creatives building brands, websites, 3D experiences and products. Prolific Awwwards/FWA/Webby winner; their own site took SOTD + Developer Award (Apr 2025).
- The studio publicly announced the collaboration: *"our latest web collaboration… visit usavionix.com."*
- Individual designer / developer / 3D artist names: **unknown** (basement typically credits as a studio).

*Confidence: high on the studio; unknown on individuals.*

### Concept & narrative
**Casts the visitor as an operator, not an audience.** The strongest documented description (landing.love / UI UX Showcase):

> *"The site opens with a cinematic system boot sequence — thermal, lidar, and IR readouts flicker on before you even see a hero image — putting you in the seat of a drone operator rather than a passive visitor. That immersive framing carries into three mission scenarios (wildfire, border, infrastructure), each pairing dramatic photography with a tight problem/solution beat. Set against a pure black canvas with crisp white type, the mood stays disciplined and high-stakes throughout."*

So the narrative arc is: **boot/instrument sequence → capability claim → three mission scenarios (problem → solution) → platform pages (Delta, Phalanx)**.

Copywriting voice — clipped, declarative, capability-forward, no marketing softness:
- *"The first agent in the air, built with the speed, range, and onboard intelligence to search vast areas on its own."*
- *"Delta drones rapidly detect ignition points, suppress advancing fires, secure nearby neighborhoods, and keep evacuation routes open until the situation is contained."*
- *"Delta drones safeguard essential facilities by isolating threats, protecting surrounding areas, and supporting recovery efforts to restore critical infrastructure."*
- *"Phalanx AI delivers real-time mission intelligence and coordination… operators speak intent while the system adapts, routes, and integrates."*

Note the pattern: **verb-chain sentences** (*detect → suppress → secure → keep open → contain*) that describe a mission timeline in a single breath. And **"agent"** framing — positioning hardware as an autonomous actor, which is the whole pitch.

*Confidence: high on the boot sequence, three scenarios and tone (multiple independent gallery descriptions + indexed site copy).*

### Visual design language
- **Palette: pure black `#000000` + white `#ffffff`.** Two colours, no accent. Confirmed by Awwwards colour tags.
- **Dark-dominant** — the inverse of White Desert, and appropriate: black reads as night-vision, cockpit, mission console.
- **Typography:** exact families **unknown**. Described as *"crisp white type"*; a boot-sequence/telemetry concept strongly implies a **mono or technical grotesque for labels/readouts** paired with a tight sans display. basement's house typographic habits lean neo-grotesque + mono. **Treat mono labels as inference, not fact.**
- **Imagery: "dramatic photography"** for the mission scenarios, combined with **3D/WebGL** for the aircraft and instrumentation. Hybrid CGI + photo — not a pure render site.
- **Instrument-panel texture:** thermal / lidar / IR readouts as an actual visual layer, not decoration.
- **Layout:** *"disciplined"* — expect a strict grid, technical labelling, dense spec blocks against large black negative space.

*Confidence: palette **high**; typography **low/inferred**; imagery approach **high**.*

### Components & sections
- **Cinematic boot-sequence preloader** — thermal / lidar / IR readouts flickering on *before* the hero. The preloader carries the concept rather than just hiding load time.
- **Mission scenario blocks ×3** (wildfire · border · infrastructure), each a photography + problem/solution pairing.
- **Product pages:** `/phalanx` (and presumably a Delta page) with capability breakdowns.
- **Layered scroll animation** throughout (explicitly called out as *"layered scroll animation"* in the review).
- Spec/stat presentation for speed (500 km/h) and range (300–500 km) — likely counters or spec tables.
- Preloader, cursor, menu, footer specifics beyond the boot sequence: **unknown**.

*Confidence: medium-high on the boot sequence + three scenarios; low on other components.*

### Motion & creative effects
- **"Layered scroll animation"** is the stated signature — compositing multiple depth layers against scroll rather than single-element reveals.
- **WebGL / 3D** confirmed by Awwwards tags — near-certainly the aircraft and the instrument/telemetry overlays.
- The **boot sequence** is a timed reveal choreography (readouts flickering in sequence).
- Specific libraries on this site aren't published, but **basement's house stack is unusually well documented** through their open source and their own blog post *"GSAP & Next.js Setup: The BSMNT Way"*:
  - **GSAP is explicitly their animation engine of choice**; *"Next.js and GSAP are their weapons of choice"*
  - **[@bsmnt/scrollytelling](https://github.com/basementstudio/scrollytelling)** — their own React + GSAP scroll-animation library
  - **next-typescript** — *"We make cool shit that performs, and we start with this template"*
  - **next-real-viewport** — fixes `100vw` horizontal scroll and mobile viewport units
  - **shader-lab** — *"create, stack, and animate shaders"*, TypeScript + WebGPU/Three.js
  - **basement-laboratory** — their experiments playground (lab.basement.studio)
  - **basement-context-vault** — curated code patterns for consistent AI context
  - Historically also **Locomotive Scroll** and **Stitches** in their stack
- Sound design, custom cursor, page transitions on this specific site: **unknown**.

*Confidence: WebGL/3D/layered scroll **high**; specific libraries **inferred from studio house stack — medium**.*

### Tech stack (with evidence)
- **Framework: Next.js** (Awwwards tag, and basement's default).
- **3D / WebGL** (Awwwards tag).
- **Very likely GSAP** + likely **@bsmnt/scrollytelling**, **next-real-viewport**, TypeScript, React — **inferred from the studio's own published stack and open-source, not from the site itself.**
- **Likely React Three Fiber or Three.js** for the 3D layer (basement uses both; `shader-lab` is Three.js/WebGPU).
- CMS: **unknown** (basement often uses their own Basehub, or Sanity/Contentful).
- Hosting: **unknown** (Vercel is the overwhelming default for their Next.js work).
- Fonts: **unknown**.

*Confidence: Next.js + WebGL **high**; the rest **medium/inferred** — label clearly in any derived skill.*

### Responsive / accessibility / performance notes
- **Unknown** in specifics. The **Developer Award** implies the jury rated the engineering highly, and basement's public identity is explicitly performance-first (*"cool shit that performs"*, and `next-real-viewport` exists precisely to fix mobile viewport bugs).
- Score 7.41 with a Developer Award suggests strong technical execution with a merely solid design/usability rating.
- No `prefers-reduced-motion` info; a boot-sequence intro is a classic reduced-motion hazard.
- No criticism found.

*Confidence: low.*

### Why it is award-worthy
1. **The preloader carries the concept.** Thermal/lidar/IR readouts booting before the hero establish the product's worldview in three seconds, doing work no headline could.
2. **Second-person role assignment.** The site makes you an operator. For defense/ISR, that reframe is the entire persuasive strategy.
3. **Zero-accent black-and-white.** Total chromatic restraint reads as instrument-grade seriousness and lets photography and telemetry glow.
4. **Three concrete scenarios beat one abstract capability.** Wildfire / border / infrastructure, each with a tight problem→solution beat, converts vague "autonomy" into three imaginable missions.
5. **Verb-chain copy.** *Detect → suppress → secure → keep open → contain.* Mission timelines compressed into single sentences.
6. **Layered scroll rather than element reveals.** Depth compositing sustains a cinematic feel across a long page without resorting to gimmicks.

### Reusable patterns to extract
- **Diegetic preloader:** make the loading state an artifact *from the product's own world* (a boot sequence, a scan, a calibration) rather than a generic counter.
- **Role-casting hero:** address the visitor as the operator/pilot/analyst; build the first viewport as their console.
- **Zero-accent monochrome** for high-stakes/technical products: `#000` + `#fff` only; all colour comes from photography and emissive UI.
- **Scenario triptych:** exactly three concrete use cases, each `dramatic image + problem beat + solution beat`. Not a feature grid.
- **Telemetry/HUD as a design layer** — readouts, reticles, coordinate labels, mono tickers as persistent chrome that reinforces the product category.
- **Verb-chain sentences** for capability copy — 4–5 sequential verbs describing a mission timeline.
- **"Agent" framing** for autonomous products: describe the hardware as an actor with intent, not a tool with specs.
- **Layered parallax scroll compositing** (foreground/subject/background/HUD moving at differing rates) instead of per-element fade-ups.
- Studio-level: keep a **house starter + a scroll library + a viewport-fix library** so every project starts at the same performance baseline (basement's `next-typescript`, `@bsmnt/scrollytelling`, `next-real-viewport` is a model worth copying structurally).

### Confidence & sources
Identity correction **high** · Awards **high** (dates ±1) · Credits **high** (studio) · Narrative/copy **high** · Palette **high** · Typography **low** · Stack **medium** (Next.js+WebGL high, libs inferred) · A11y **low**
- https://www.awwwards.com/sites/usavionix · https://www.awwwards.com/basementstudio/
- https://www.landing.love/sites/usavionix/ · https://uiuxshowcase.com/resources/usavionix/
- https://www.usavionix.com/ · https://www.usavionix.com/phalanx
- https://basement.studio/ · https://basement.studio/post/gsap-and-nextjs-setup-the-bsmnt-way · https://lab.basement.studio/
- https://github.com/basementstudio (repos: scrollytelling, next-typescript, next-real-viewport, shader-lab, basement-laboratory, commerce-toolkit, website-2k25)
- https://www.siteinspire.com/profile/8345-basement-studio · https://www.radix-ui.com/primitives/case-studies/basement-studio
- Distinct company: https://uavionix.com/ (do not conflate)

---

## Cross-site observations (batch A)

### Shared tech
- **GSAP is universal — 4/4.** It is the only library present on every site, across Vue, vanilla and React/Next codebases. If a skill teaches one animation tool, it is GSAP.
- **Next.js is the framework majority — 2/4 confirmed** (White Desert, USAvionix), both from studios whose house default it is. Zero is Vite + vanilla Three; Léo Parpeix is (probably) Vue 3 + Vite.
- **WebGL/Three.js in 3/4** (Léo Parpeix, Why Zero, USAvionix). White Desert is the deliberate outlier and still won SOTD — proof that 3D is a *strategy*, not a requirement.
- **Blender is the 3D authoring tool in 2/4 explicitly** (Léo Parpeix, Why Zero), with glTF/DRACO as the delivery format.
- **Vite for the non-Next sites; TypeScript everywhere.**
- **Headless CMS only where content volume demands it** — Contentful for White Desert's dozens of camps/trips/regions; the other three are hand-authored, content-light and code-driven.
- **Hosting: Vercel confirmed once**, implied for the Next sites.

### Where the smooth-scroll consensus broke
This was the most surprising finding. The reflex 2026 stack is "Lenis + GSAP ScrollTrigger," and only **one** of these four does that:
- **Léo Parpeix:** Lenis + GSAP — the orthodox choice.
- **Why Zero:** **explicitly rejected both.** No Lenis, no ScrollTrigger, no oversized scrolling DOM. Wheel/touch input eases a **virtual scroll float**, and everything derives from it. This is what made gated, hold-to-advance, non-linear narrative possible at all — and it was the Developer Award site.
- **USAvionix:** "layered scroll animation," library unconfirmed; basement ships their **own** React+GSAP scroll library (`@bsmnt/scrollytelling`).
- **White Desert:** GSAP only; no smooth-scroll library surfaced.

**Takeaway for the skill:** teach smooth scroll as a *decision with three options* — (a) native + Lenis + ScrollTrigger for editorial/marketing, (b) a studio scroll abstraction for repeatable component-level scrollytelling, (c) a fully virtual scroll value when the narrative must gate, hold or redirect. Don't teach (a) as the default.

### Shared colour strategy — the strongest pattern in the batch
**All four sites are effectively two-colour systems.** Awwwards literally tags three of them with a colour count of 2.

| Site | Ground | Ink / accent | Mode |
|---|---|---|---|
| Léo Parpeix | white `#FFFFFF` / off-white `#F7F7F7` | forest `#083D2A`, accents `#F6E016` yellow, `#EED6C8` cream, `#008841` emerald | light, with themed inversions |
| White Desert | light (ice/off-white, hexes unknown) | single deep neutral | light |
| Why Zero | white `#FFFFFF` | electric green `#01C654` | light |
| USAvionix | black `#000000` | white `#FFFFFF` | dark |

Three of four are **light-dominant** — a genuine reversal of the dark-mode default that dominated award sites for years. The one dark site is dark for *diegetic* reasons (night vision, cockpit), not fashion. **Chroma is rationed to a single signal colour**, and in the photo-led site (White Desert) chroma is outsourced entirely to imagery.

Two independent sites landed on **vivid green as the accent** (`#01C654`, `#008841`/`#083D2A`) — worth noting as a 2026 marker.

### Shared typographic moves
- **Two-family systems only:** a workhorse grotesque for UI/body + a display face for headlines. Léo Parpeix is the documented case (Monument Grotesk + Avantt).
- **Awwwards Typography tag on Léo Parpeix**; "crisp white type" as the descriptor for USAvionix; "graphic design" tag on Why Zero.
- **Boutique vs. free split:** Léo Parpeix self-hosts licensed foundry type (Dinamo/Monument Grotesk, Avantt). Why Zero uses **Google Fonts API** — and still scored 8.99 on CSSDA. Budget type is not the constraint; *deployment* is.
- **Type as a 3D material** in Why Zero ("hexagonal text blur" shader) and Léo Parpeix ("WebGL text break") — both push type into the canvas at punctuation moments rather than keeping it purely DOM.
- **Numbered and metadata-labelled UI:** `01/02/03` nav in Léo's mobile overlay; project metadata quartets; telemetry labels on USAvionix. Small technical labels as texture is common to all.
- **Fluid `clamp()` scaling** and large gutter ranges (40–120px desktop → 20px mobile).

### Shared motion vocabulary
- **Expo-out easing as the house curve:** `cubic-bezier(0.16, 1, 0.3, 1)` (Léo Parpeix uses it for both page motion and pointer motion — same feel everywhere).
- **Differentiated lerp rates to create mass:** fast inner element + slow outer element (the two-speed cursor); layered parallax at differing rates (USAvionix).
- **Loading is a designed act, not a wait**, in 3/4:
  - Léo Parpeix: non-linear % counter + "click to enter & enable sound" consent gate
  - Why Zero: draw-a-zero gesture → frost dissolve
  - USAvionix: thermal/lidar/IR boot sequence
  - White Desert: unknown / presumably none — consistent with its content-first positioning.
- **Sound is opt-in and ambient-plus-SFX** where present (Léo Parpeix: `ambient.aac` loop at 0.375 + interaction SFX at 0.35; BUNQ LABS' own site is "audio-led"; Why Zero ships Howler). Nobody autoplays.
- **Custom cursors on 2/4** (Léo Parpeix, Why Zero), both **suppressed on coarse pointers**.
- **Post-processing as a unifier** (Léo Parpeix: one velocity-driven distortion + chromatic aberration pass over the whole frame) vs. **shaders as narrative events** (Why Zero: five named, discrete story shaders). Two legitimate philosophies worth teaching as a fork.

### Shared narrative structures
- **Every site is a chaptered argument, not a page of sections.** Even White Desert — the least "experiential" — organises as Explore / Stay / Learn / About with each camp as a distinct character.
- **Interruption as a design tool:** Léo Parpeix's WebGL text break between project groups; Why Zero's five gates; USAvionix's three mission scenarios. All three punctuate to reset attention.
- **Rule-of-three content blocks:** 3 projects → break → 3 projects (Léo Parpeix); 3 mission scenarios (USAvionix); 3 camps (White Desert).
- **Specificity as the persuasion engine — all four:** `90°S / 3,000 m / fewer than 500 people a year / 12 guests` (White Desert); `Team of 5 @ImmersiveGarden, Awwwards ×1, FWA ×1` (Léo Parpeix); `500 km/h, 300–500 km` (USAvionix); real unemployment statistics embedded in shattered glass (Why Zero). **Numbers, not adjectives** is the single most transferable copy rule in this batch.
- **A named villain in the two campaign sites:** the degree (Why Zero), the unmonitored threat (USAvionix). The two portfolio/brand sites have no villain and instead lead with craft and place.
- **Conversion matched to price and stakes:** enquire/book-a-call (White Desert), waitlist-as-origami (Why Zero), email CTA (Léo Parpeix), capability/contact (USAvionix). Nobody uses a generic "Get started."

### Award-mechanics observations
- **Developer Award on 3/4** (Léo Parpeix, Why Zero, USAvionix) — and in each case it maps to a *system-level* engineering feat, not a trick: a global fluid post-process; a virtual-scroll + adaptive-quality architecture; a layered 3D scroll pipeline.
- **Scores cluster at 7.2–7.7 on Awwwards** (Léo Parpeix 7.69, USAvionix 7.41, White Desert ~7.35) while Why Zero took **8.99 on CSSDA**. Awwwards SOTD is not a high-score competition; CSSDA scores run much hotter. Don't teach "aim for a 9."
- **The HM → SOTD ladder is real:** USAvionix took an Honorable Mention in August and SOTD in September 2026 — likely a resubmission or a rolling upgrade.
- **In-house design can win.** Why Zero was designed entirely in-house by Zero's own 12-person Design & Experience team with an external dev partner (BUNQ LABS) — and outscored every agency site here.
- **Studio brand compounds:** Malvah (Studio of the Year 2025) and basement.studio both entered with pre-existing jury recognition. Léo Parpeix was himself an Awwwards Young Jury member in 2025.

### What surprised me
1. **The scroll consensus is fracturing.** The highest-scoring, most awarded site in the batch **removed native scroll entirely**. "Lenis + ScrollTrigger" is now one option among three, not the answer.
2. **Light mode won 3–1.** After years of black award sites, the batch is dominated by white grounds with a single accent.
3. **A photography-and-copy site beat the odds.** White Desert took SOTD with *no 3D, no WebGL*, and its **highest sub-score was Content (7.74)** — a direct rebuttal to "you need WebGL to win."
4. **A sub-10 MB full 3D narrative.** Why Zero shipping >1 GB of source assets as <10 MB at 60fps on budget Android reframes what "performance craft" means in this genre. DRACO + KTX2/ETC1S + atlases + adaptive quality is the recipe.
5. **Advection-only fluid.** Léo Parpeix's cursor sim skips pressure projection and curl confinement entirely. The "correct" Navier-Stokes implementation is unnecessary for a pointer wake — a huge practical shortcut.
6. **Studios ship their stack as open source.** basement.studio publishes `@bsmnt/scrollytelling`, `next-typescript`, `next-real-viewport`, `shader-lab` — their award-winning baseline is literally readable. That's the most directly mineable resource for a skill.
7. **Two near-miss name traps in one batch:** `usavionix.com` (defense jet drones, basement.studio) vs `uavionix.com` (ADS-B avionics) — entirely different companies; and `why.zero.university` vs `zero.university` vs the unrelated Awwwards entries "Zero" (by Ueno), "Zero Tech" and "Zero Studios." Any automated research pass on these will produce wrong answers without explicit disambiguation.
8. **Nobody documented reduced-motion handling.** Across four award winners with heavy motion, gesture gates and hold-to-advance interactions, `prefers-reduced-motion` appears in none of the available documentation. A skill teaching this aesthetic should treat reduced-motion and keyboard paths as the deliberate *improvement* over the reference set, not a copy of it.

### Open items I could not resolve (search budget exhausted)
- White Desert: exact hex palette, typefaces, homepage section sequence, preloader/cursor/transition treatments, whether it also took a Developer Award, and the role of "Usudo."
- Why Zero: the Awwwards SOTD date (July 21 vs Sept 7 vs Sept 8, 2026) and its typefaces.
- USAvionix: typefaces, confirmed animation/3D libraries (only inferred from basement's house stack), CMS, individual credits.
- Léo Parpeix: confirmation of the real framework (Vue 3 is inferred from a third-party clone), the real hex palette, hosting, and definitive resolution of the "Mélina Guyon" credit conflict.