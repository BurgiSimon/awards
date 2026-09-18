I have strong evidence including a real network capture of igloo.inc's assets. Here is the report.

---

# Batch E — Deep site analysis

**Access note:** all three sites were blocked by the egress proxy (confirmed by direct attempt). GitHub HTML search, the GitHub MCP code-search API, and `raw.githubusercontent.com` were all reachable, so evidence below comes from (a) a **real captured network manifest of igloo.inc's asset URLs**, (b) a **live-CSS extraction of thelinestudio.com**, (c) a **hand-sampled Awwwards teardown dataset**, (d) pixel-perfect reconstructions, and (e) my own knowledge. Every claim is labelled.

---

## Igloo Inc — https://www.igloo.inc/

### Type / purpose
[verified] Corporate/brand-monument site for **Igloo Inc**, the parent company behind **Pudgy Penguins** and **Overpass IP**. Not e-commerce, not a portfolio in the conventional sense — a single-canvas "we are a world" statement with portfolio items (their brands/ventures) presented as specimens. (Sources: `swan4er/igloo/docs/how-igloo-inc-works.md`; the captured asset list contains `assets/geometries/pudgy.drc` and `assets/geometries/overpass_logo.drc`.)

[verified] Verbatim on-page copy captured 2026-07-06 (`YZversion/ai-interaction/igloo-clone/RECON/original-observations.json`):
- `IGLOO`
- `/////// Manifesto`
- `Our mission is to build the next generation of consumer brands at the intersection of Community, AI, and crypto.`
- `Scroll down to discover.`
- `Sound: Off`
- `// Copyright (c) 2026` · `Igloo, Inc. All Rights Reserved.`

### Awards & recognition
- [verified] **Awwwards Site of the Year 2024 — winner** and **Developer Site of the Year 2024**. Four independent sources agree: `ryanonline1234/mediatastelibrary/data/families.json` (`"award": ["SOTY-2024-winner","SOTM-2024-07","SOTD-2024-07-23"]`), `swan4er/igloo` ("взял… сразу две главные награды: Site of the Year и Developer Site of the Year"), `roshanvijay37/Roshan/public/awwwards/data.js` (appears in both the SOTY collection for 2024 and the SOTM list flagged `alsoSiteOfTheYear=1`), and `mrbrandonmills/Self-Actualization-Website`.
- [verified] **Site of the Month, July 2024**; **Site of the Day, 23 July 2024**.
- [recalled, medium — AI-compiled source] Awwwards score breakdown reported by `vigchetan/Any-IDE/docs/award_winning_analysis.md`: overall **7.92/10**, Dev Award **7.66/10**, animations/transitions **9.60**, WPO **8.00**, responsive **8.40**, semantics **6.60**, accessibility **6.60**, markup/meta **6.40**. Tags listed: *Web & Interactive, Animation, Infinite Scroll, Transitions, 3D*. I flag this as medium rather than low because an entirely independent source (`families.json`) writes "empty-DOM scored **6.4–6.6** on its own card" — the same numbers, arrived at separately.
- [unknown] FWA / CSSDA / Godly status for this site.

### Credits
- [verified] Built by **Abeto** (studio; `abeto.studio` / `abeto.co`) **with agency Bureaux** (`bureaux.studio`). Two independent sources: `LAYTAT/igloo-reverse-engineering/README.md` ("created by Abeto for Bureaux (2024)") and `SamGomes1984/igloo-inc-website-recreation/README.md` ("Original site design by abeto and Bureaux").
- [verified] Abeto published an **Awwwards case study** at `awwwards.com/igloo-inc-case-study.html` — cited and quoted by `starman011/portfolio-tech/SOURCES.md`, which summarises it as: "Abeto describes Three.js/Svelte/GSAP, Houdini/Blender assets, custom shaders, procedural crystal growth, compressed volume-driven particles and staged texture/shader loading."
- [verified] Abeto also made `messenger.abeto.co`, itself an Awwwards SOTY-collection entry for 2025 — same studio signature, useful as a second data point on their house style.
- [unknown] Named individuals (creative director, lead dev, 3D artists, sound designer).

### Concept & narrative
[verified/recalled-high] **You descend into an arctic world rather than scroll a page.** Land on a snow plain with an ice igloo; scroll drives a *camera*, not a document — you orbit, approach, and fly *inside* the structure. Interior scenes then succeed one another through flash/glitch/interference cuts. Portfolio items are staged as museum specimens: a Pudgy Penguin frozen inside a carved crystal cube with technical callout lines. (Sources: `swan4er/igloo`; `families.json` "carved-ice-mono" family.)

Tone: **expedition telemetry / research station**. Copy is terse, punctuated with slash rules (`/////// Manifesto`), coordinate readouts and leader-line annotations. The register is deliberately cold and technical, which is what keeps a crypto-adjacent mission statement from reading as hype.

[verified] The scroll **wraps modulo** — it's an infinite loop, not a document with an end (matches the Awwwards "Infinite Scroll" tag).

### Visual design language
- [verified — sampled] Palette: `#b6bac5`, `#383e4e`, `#A0A5B1`, `#6A6F7D`, `#E1E6F1`, `#83A1C5`. The thing that actually reads as "background" is a **fog gradient `#6A6F7D → #E1E6F1`**; `#83A1C5` is the single cool rim accent. (`families.json`.) Near-monochrome blue-grey; **no saturated colour anywhere**.
- [verified] Typography: **IBM Plex Mono, Medium weight, exclusively** — and it is *not DOM text*. The capture contains `assets/fonts/IBMPlexMono-Medium-datatexture.ktx2` plus `IBMPlexMono-Medium.json` (MSDF atlas + metrics) and a dedicated `msdfworker-*.js`. Text is rendered as signed-distance-field glyphs inside the WebGL scene, which is what enables the glitch/scramble decode reveals with zero DOM reflow.
- [verified] UI icons are also textures, not SVG/DOM: `ui/arrow-`, `ui/close-`, `ui/logo-`, `ui/sound-`, `ui/visit-datatexture.ktx2`, `scroll-datatexture.ktx2`.
- [verified/recalled-high] Texture/material vocabulary from the asset names: `frost-datatexture`, `caustics`, `bokeh`, `clouds_noise`, `wind_noise`, `perlin-datatexture`, `noises/blue-8-128-rgb` (blue noise for dithering), `mosaic`, `dot_pattern`, `triangles_tiling`, `shapes_blurred`.
- [recalled-high, from a detailed third-party teardown] The "expensive" look is **optics, not material complexity**: bevelled edges on every ice block so light catches as a bright line; **light sourced from inside/below** the igloo so seams glow; **Fresnel rim** lighting; **bloom with a high luminance threshold** (critical — snow is nearly white, so a low threshold smears the whole frame); **depth of field**; **fog**; **film grain**. Notably: *the igloo blocks are not transparent at all* — no transmission, just rough matte surfaces + interior light + rim. Real refraction appears only on the crystal cubes in later scenes. (`swan4er/igloo`.)
- [verified] Film-look grade via a **no-tone-mapping 3D LUT**, not curves (`families.json`).

### Components & sections
| Element | Evidence |
|---|---|
| Preloader | [verified] **Pure-CSS ASCII loader** (`content:` keyframes) — the only meaningful DOM before the canvas takes over (`families.json`) |
| Hero | [verified] Snow plain + igloo, `Scroll down to discover.` |
| Manifesto | [verified] `/////// Manifesto` section with mission statement |
| Interior scenes | [verified] Camera dives inside; scenes cut by flash/interference transitions |
| Specimen/portfolio | [verified] Brands (Pudgy, Overpass) as objects frozen in carved crystal with callouts |
| Sound toggle | [verified] Visible `Sound: Off` control, rendered in-canvas |
| Nav/menu | [inferred] No conventional DOM nav; HUD chrome only |
| Cursor | [unknown] |
| Footer | [verified] `// Copyright (c) 2026 Igloo, Inc. All Rights Reserved.` as HUD text |

### Motion & creative effects
- [verified] **No native document scroll.** Observed `document.scrollHeight === viewport height`; wheel/touch is consumed by the canvas. This is a *virtual scroll*, not Lenis-on-document.
- [verified — specific constants, from `families.json`] `wheel × 0.1`, `friction 0.97`, **double lerp `.075 → .15`**, **1.4s `inOut3` auto-snap** to section, **modulo wrap**, and **exponential/log framerate-independent damping**. The double-lerp is the tell: one slow lerp for the raw scroll target and a second faster lerp for the camera reading it, which is what gives the weighted-but-responsive feel.
- [verified/recalled-high] **Text scramble-decode** reveals via SDF texture offsets.
- [verified/recalled-high] Post FX: **chromatic aberration**, frost displacement, "tech" displacement, bloom, DOF, grain. (`LAYTAT` README; `migueljnew-droid/ui-ux-gold-standard/TECHNIQUES.md` names igloo.inc under "Three.js Post-Processing / Chromatic Aberration Shader".)
- [verified] **Smoke and particle simulations are pre-baked geometry, not realtime**: `ceilingsmoke.drc`, `smoke_trail.drc`, `intro_particles.drc`, `shattered_ring_smoke.drc` are Draco *geometry* files. Houdini simulates offline; the browser plays back.
- [verified] **Volume data shipped as KTX2**: `images/volumes/medium_32.ktx2`, `peachesbody_64.ktx2`, `x_64.ktx2` — 32³/64³ volumes flattened into texture atlases. Abeto wrote a **custom VDB→web exporter** for this.
- [verified] Sound is first-class and **state-bound, not ambient**: crossfaded wind + music (~1.5 MB music track), plus rate-limited event SFX named `beeps`, `click-project`, `enter-project`, `leave-project`, `wind`, `shard`.
- [contested] `LAYTAT/igloo-reverse-engineering` claims **GSAP ScrollTrigger** drives camera/shader values. This is hard to reconcile with the verified observation that the page has no scrollable document height. Most likely: a custom virtual-scroll scalar feeding GSAP timelines (`.progress()`), not ScrollTrigger in its default document mode. Treat "ScrollTrigger" as unverified.

### Tech stack (with evidence)
**[verified] from the real captured asset manifest (`Vishagautam/igloo/captured_urls.txt`, 66 URLs):**
- **Vite** build — `assets/index-2eb69c09.js`, `assets/App3D-f554a111.js`, `assets/favicon32-af94112f.png` (Vite's `assets/[name]-[hash]` output convention; the favicon path is independently corroborated by several blog link-lists).
- **Three.js with DRACOLoader + KTX2Loader** — `assets/libs/draco/draco_decoder.wasm`, `draco_wasm_wrapper.js`, `assets/libs/basis/basis_transcoder.js`, `basis_transcoder.wasm`.
- **19 Draco `.drc` geometries**: `igloo`, `igloo/igloo_cage`, `igloo/igloo_outline`, `igloo/patch`, `mountain`, `ground`, `floor`, `cubes/background_shapes`, `intro_particles`, `ceilingsmoke`, `smoke_trail`, `shattered_ring`, `shattered_ring2`, `shattered_ring_smoke`, `pudgy`, `abstractlogo`, `overpass_logo`, `blurrytext`, `blurrytext_cylinder`.
- **36 KTX2/Basis textures** — every single image asset. Zero PNG/JPG except the favicon.
- **Four dedicated web workers**: `audioworker`, `bitmapworker-046527f8.js`, `exrworker-41cbee65.js`, `msdfworker-ac346fa7.js` — all decode work off the main thread.

**[recalled, medium — single-source]** UI framework **Svelte**, likely via **Threlte** (Svelte+Three.js); **three-mesh-BVH**; authoring in **Houdini** + **Blender** + **Substance 3D Painter**; Figma/Photoshop/Affinity for UI; DaVinci Resolve for sound. (`LAYTAT` README, whose "Resources" list links Threlte — consistent with the Abeto case-study summary quoted in `starman011/portfolio-tech/SOURCES.md` naming "Three.js/Svelte/GSAP".)

**[unknown]** Hosting/CDN, CMS (almost certainly none — content is baked into assets), library versions.

### Responsive / accessibility / performance notes
- [verified] **Budget figures** (`swan4er/igloo`, from inspecting the real files): entry point **16 KB (~6 KB gzipped)**; main scene bundle **1.45 MB (~420 KB gzipped)**; the entire landscape texture set **625 KB**; music **1.5 MB**. Staged loading (entry responds instantly, heavy payload streams behind it).
- [verified] Reported Awwwards **WPO 8.00** and **responsive 8.40** — high for a site of this weight.
- [verified] **Accessibility is the honest weak point.** An independent automated audit (`Venkata-Manoj/mere-human/ui_ux_audit_results.md`) found igloo.inc "WebGL-gated… returned minimal design data — defaulting to `Times New Roman` with zero-confidence color/button classification", i.e. **essentially no semantic DOM**. `families.json` explicitly warns: "not for SEO/a11y/conversion pages (empty-DOM scored 6.4–6.6 on its own card); **WebGL2-only with no reduced-motion path** must be re-authored."
- [recalled, low] A Chinese benchmark doc claims desktop/mobile **LCP ≈ 1s**; plausible given the 16 KB entry but unverified.

### Why it is award-worthy
1. **Asset engineering is the art direction.** Draco + KTX2 + baked volumes + offline-simulated smoke let a cinematic scene ship in ~420 KB gzipped. The "wow" is inseparable from the pipeline work — juries reward the combination, not the spectacle alone.
2. **Discipline as luxury.** One typeface, one temperature, zero saturated colour. The expensive look comes from bevels, interior light, Fresnel rim, thresholded bloom, DOF, fog and grain — *optics*, not material complexity.
3. **The interface lives in the render.** Putting type and icons in the scene as SDF/data textures unlocks a whole class of effects (scramble, glitch, depth-correct UI) that DOM can't reach — and makes the UI obey the same grade and post FX as the world.
4. **Scroll re-cast as camera.** Discarding document scroll entirely and replacing it with a damped, snapping, infinitely-wrapping scalar makes the site feel like a piece of software, not a page.
5. **Sound is bound to state.** Event-level SFX (`enter-project`, `leave-project`, `shard`) plus a crossfaded ambient bed, with a visible, honest off switch.
6. **Custom tooling.** Writing your own VDB exporter is a different category of effort from configuring a library — and it shows in the result.

### Reusable patterns to extract
- **Virtual-scroll camera rig**: wheel/touch → accumulator × ~0.1 → friction ~0.97 → *two chained lerps* (~0.075 then ~0.15) → camera/timeline progress; add a ~1.4s ease-in-out-cubic snap to the nearest section and optional modulo wrap for infinity. Use exponential damping (`1 - Math.exp(-k*dt)`) so feel is framerate-independent.
- **The "cheap ice" recipe** (no transmission required): bevel every edge → put the key light *inside/below* the object → Fresnel rim → bloom with a **high** luminance threshold → DOF → fog → fine grain → desaturate to near-zero. Teach this as an ordered checklist by effort-to-impact ratio.
- **Offline-bake the simulation**: any smoke/shatter/particle burst that isn't interactive should be simulated in a DCC tool and exported as Draco geometry or a KTX2 volume atlas. Play back, don't compute.
- **In-canvas MSDF typography** for scramble/glitch/decode reveals, with a plain-DOM semantic mirror (visually hidden) so the page is still readable and indexable — the fix for exactly the 6.6 a11y score.
- **Asset budget as a design constraint**: entry bundle < 20 KB; defer the 3D app; decode in workers; KTX2 everything; Draco everything; measure gzipped.
- **Event-bound audio layer**: named SFX per interaction, rate-limited, with a crossfaded bed and a visible toggle that states its current state (`Sound: Off`).
- **Copy register as UI**: slash rules, monospace micro-labels, coordinate readouts and leader lines make ordinary corporate copy feel like instrumentation.

### Confidence & sources
| Section | Confidence |
|---|---|
| Awards | High (4 sources agree on SOTY/DevSOTY/SOTM-07/SOTD-23-Jul) |
| Score sub-metrics | Medium (AI-compiled, but numerically cross-corroborated) |
| Credits | High for Abeto + Bureaux; unknown for individuals |
| Copy / narrative | High (verbatim DOM capture) |
| Palette | High (sampled dataset) |
| Assets / build / formats | **Very high** (real network capture) |
| Svelte / Threlte / BVH / DCC tools | Medium (single source + case-study summary) |
| GSAP ScrollTrigger | Contested |
| Scroll constants | Medium-high (single detailed source, consistent with observed behaviour) |

URLs used: `raw.githubusercontent.com/Vishagautam/igloo/master/captured_urls.txt` · `.../YZversion/ai-interaction/main/igloo-clone/RECON/original-observations.json` and `TEARDOWN.md` · `.../LAYTAT/igloo-reverse-engineering/main/README.md` · `.../swan4er/igloo/main/docs/how-igloo-inc-works.md` · `.../ryanonline1234/mediatastelibrary/main/data/families.json` · `.../roshanvijay37/Roshan/main/public/awwwards/data.js` · `.../vigchetan/Any-IDE/main/docs/award_winning_analysis.md` · `.../migueljnew-droid/ui-ux-gold-standard/main/TECHNIQUES.md` · `github.com/SamGomes1984/igloo-inc-website-recreation` · `.../Venkata-Manoj/mere-human` · `.../starman011/portfolio-tech/.../SOURCES.md`

---

## The Line — https://thelinestudio.com/

### Type / purpose
[verified] Studio site for **THE LINE**, an **animation studio in London, England** (`info@thelinestudio.com`; nav label literally reads `LONDON,ENGLAND`). It is a work-first portfolio + studio identity + news/blog + contact site, with real URL structure: `/work/<slug>`, `/blog/<slug>`, `/about`, `/privacy`, and a `Site Credits` link in the footer.

[verified] Client/project slugs visible in the reconstruction and in third-party citations: `/work/the-hex-warframe-1999-animated-prologue`, `/work/azuki` (Azuki Elementals), `/work/battle-aces` (Uncapped Games hype cinematic), `/work/cowboy-bebop`, `/work/chobani` ("Dear Alice", dir. Bjørn-Erik Aschim, score by Joe Hisaishi, 2021), `/blog/the-line-partners-with-riot-games-to-bring-spirit-blossom-festival-to-life`, `/blog/editions-drop-001` (The Line Editions).

### Awards & recognition
- [verified] **Awwwards Site of the Month, November 2024** and **Site of the Day, 5 November 2024** (`families.json`: `["SOTM-2024-11","SOTD-2024-11-05"]`), independently corroborated by `roshanvijay37/.../data.js` (`[2024,11,"The Line Studio","https://thelinestudio.com","The Line Studio"]`) and by the existence of `YashwantOstwal/the-line-awwwards-SOTM`, a repo whose entire premise is "pixel perfect clone of an awwwards Site of the Month website".
- [unknown] Awwwards numeric score, Developer Award, CSSDA, FWA, Godly.

### Credits
- [recalled, medium] The Awwwards submission is attributed simply to **The Line Studio** itself, implying an in-house or closely-partnered build. The site exposes a `Site Credits` page, so a definitive credit list exists — [unknown] to me. Do not attribute this to a named agency.

### Concept & narrative
[verified/recalled-high] **The site behaves like a print artefact about film.** The unifying idea, as captured in the teardown dataset's family name *single-ink-cinema-poster*: heterogeneous animation footage — 2D cels, CG, documentary photography, live video — is unified by **flooding it with one saturated ink**, exactly as a printer's overprint would. The mechanism is an `aria-hidden` div filled flat red with `mix-blend-mode: multiply` over greyscaled footage — the dataset even names the class `.acetate`, after the gel sheet. One hue *is* the art direction.

Tone: **working-studio voice**, not luxury-brand voice. Status dots, slash-delimited nav, `/ MICRO / LABELS /`, underlined credit tables, Roman-numeral year, a `00/24` fps preloader at headline scale. It reads like a call sheet.

Narrative shape: hero → studio → work/clients → clients & partners → news → contact → sticky red footer. The red bookends the experience (active nav state and footer only), so colour arrival is an event.

### Visual design language
[verified — two independent extractions agree exactly]
| Role | Hex | Usage |
|---|---|---|
| Canvas | `#DDDEE2` (`rgb(221,222,226)`) | Cool blue-tinged silver page ground — deliberately not white |
| Near-white | `#F8F8F8` | Intro section, nav links on overlay |
| Ink | `#0B0B0B` | Body text, custom scrollbar handle |
| Flare red | `#FF391E` (`rgb(255,57,30)`) | Active nav state **and sticky footer only** |
| Pure red | `#FF0000` | The hero acetate layer (multiply blend) |
| Feature panel | `rgba(222,223,227,0.95)` | Featured-work asset backgrounds |

(Source A: `educlopez/design-bites/design-mds/thelinestudio.com/DESIGN.md`, generated by live CSS analysis. Source B: `families.json` palette `["#FF391E","#F8F8F8","#0b0b0b"]` + temperature line `#ff391e on #f8f8f8 / #0b0b0b / #dddee2`. Source C: the reconstruction's Tailwind theme — `--color-void-black:#0b0b0b; --color-off-white:#f8f8f8; --color-flare-red:#ff391e; --color-cool-gray:#dddee2`.)

- [verified] Typeface: **Denim**, a **variable grotesk**, served as `DenimVF` / family name `DenimWeb`, with the **`ss03` stylistic set applied universally**. [unknown] foundry — I will not guess.
- [verified] **Extreme scale contrast with no middle ground**: display at **210px on a 1728px artboard** = `12.15278vw`, `line-height` ~`.8–.95`, tracking `-0.04em`, weight 500; micro-labels at **~9px uppercase, weight 440**; body 16px/400; buttons 13px. The two CSS extractions reconcile perfectly (155px at a 1275px viewport *is* 12.15278vw, and −6.22px tracking at 155px *is* −0.04em).
- [verified] **The whole layout is vw-locked to a 1728 artboard.** Every desktop value in the reconstruction is a six-decimal vw: `1.27315vw` = 22px, `7.29167vw` = 126px, `12.15278vw` = 210px, `1.85185vw` = 32px. This is the single most transferable craft detail on the site.
- [verified] **Zero border-radius. Zero shadows.** Depth comes only from surface luminance (near-white 0.973 → cool grey 0.871 → footer red 0.444 → near-black 0.043).
- [verified] First glyph of display headlines is **optically hung past the 8px margin** via per-glyph negative margins.
- [verified] Native scrollbar suppressed; a **custom scrollbar** is drawn (`#0b0b0b` handle).
- [verified] Breakpoints: **767 / 768 / 1023 / 1024 / 1240 / 1600**.

### Components & sections
[verified from the pixel-perfect reconstruction's file tree]

**Sections:** `Hero`, `TheStudio`, `Group` / `GroupClient` (work listing), `ClientsPlusPartners`, `News`, `Contact`, `Footer`.

**Components:** `NavBar` + `NavBarDesktop` + `NavBarMobile` + `NavItem` · `SideBar` · `Cursor` + `CursorPlane` (custom cursor with a WebGL/plane companion) · `HoverReveal` · `FlickerText` · `ProjectCard` · `HighlightCard` · `AccordianItem` · `List` / `Label` · `ScrollBar` + `ScrollBarWrapper` (custom scrollbar) · `OpenTimings` (live studio open/closed state) · `ClosingLogoBlock` · `ReachOut` · `ContactDesktop` / `ContactMobile` · `Input` · `Up` (back-to-top) · `IntersectionObserverPlane` · `FooterDesktop` / `FooterMobile` · `SVGs/LogoWithTrademark`.

[verified] **Preloader:** a `00/24` frame counter rendered at headline scale — a film leader, not a spinner.

[verified] **Sticky footer** in flare red with a very large bottom zone (343px bottom padding measured).

### Motion & creative effects
- [verified] **The hero hinge.** A full-viewport `#ff0000` panel with `mix-blend-mode: multiply`, plus the logo layer, both anchored to `transform-origin: bottom left`, translate `x: 0% → -10%` and rotate `0deg → -15deg` across the hero's scroll range. The whole first screen swings away like a hinged sheet of acetate on a light table.
- [verified] Generalised rule from the teardown dataset: **"panels hinge 4–15° on named `transformOrigin` corners, child rotates harder and lags"** — parent and child rotate at different rates so paper shears rather than moves rigidly. And explicitly: **"sticky stages + invisible rails, never `pin: true`"**.
- [verified] **FlickerText**: per-letter `opacity` keyframe ladder `[0,1,0,0,1,1]` with a computed `times` array staggered by ~0.04s per glyph — a neon tube striking. On hover the whole line shifts `x` by a vw-locked amount with `cubic-bezier(0.19, 1, 0.22, 1)` (expo-out). Runs once on mount, re-runs on mouse-enter.
- [verified] `HoverReveal` / `CursorPlane` — image/footage reveal following the cursor. An independent developer rebuilt the `/about` hover animation with GSAP specifically because of how good it is (`1jayeshpoduval/image-overlay-animation`).
- [verified] `slash-before` utility: `content: '/\00A0'` at light weight before labels — the slash nav is a CSS pseudo-element system, not markup.
- [verified] `selection:bg-flare-red selection:text-off-white` — even text selection is branded.
- [recalled, medium] Smooth scroll: the reconstruction uses **Lenis** (`lenis/react`, `<ReactLenis root>`); whether the original uses Lenis specifically is [unknown], but some virtual/smooth scroll is present given the custom scrollbar.

### Tech stack (with evidence)
- [verified, medium-high] **Nuxt (Vue)** — detected by live-CSS/runtime analysis in `design-bites/.../DESIGN.md` ("Built in Nuxt", "Nuxt with 6 breakpoints"). Consistent with genre: `migueljnew-droid/ui-ux-gold-standard` reports 5 of 9 elite sites it studied use Nuxt.
- [verified] Fonts: **Denim variable** (`DenimVF.woff` in the reconstruction), `ss03` on.
- [unknown] CMS (a studio with `/work` and `/blog` almost certainly has one — Sanity/Storyblok/Prismic are the genre norm, but I have no evidence), hosting, whether WebGL is used at all (the `CursorPlane` naming in the reconstruction hints at a plane-based reveal, which may be pure CSS/canvas).
- [inferred] Video delivery for reel/footage — likely adaptive MP4/WebM with poster frames, greyscaled in CSS so the red multiply layer can key over it.

### Responsive / accessibility / performance notes
- [verified] Six breakpoints; mobile values are fixed px (`text-[72px]`, `h-[22px] w-[126px]`) while desktop values are vw — i.e. **fixed on small screens, fluid on large**, which is the right way round and avoids sub-legible display type on phones.
- [verified] The red overlay is `aria-hidden` — the decorative layer is correctly hidden from AT.
- [verified] `[text-rendering:optimizeLegibility]` and `antialiased` in the reconstruction.
- [inferred, likely] Heavy video payload is the main performance risk; a greyscale CSS filter over video is cheap but compositing-sensitive.
- [unknown] `prefers-reduced-motion` handling. Given the hinge/flicker vocabulary, this is the obvious audit point.
- [note] Hiding the native scrollbar and drawing a custom one is a keyboard/AT risk unless native scrolling is preserved underneath.

### Why it is award-worthy
1. **One ink is the entire art direction.** A single hex, applied as a print overprint over greyscaled footage, turns a heterogeneous reel into one coherent body of work. This is the cheapest, highest-leverage move on the whole list.
2. **Macro/micro type with nothing in between.** 210px display against 9px labels, no intermediate sizes. The absence of a middle tier is what makes it read as a system rather than a hierarchy.
3. **The medium is the message.** An animation studio proves its craft by animating its own interface — hinging panels, flickering type, revealing frames — rather than by embedding a showreel and stopping.
4. **Sharp, shadowless, disciplined.** No radius, no shadows, depth by luminance only. Restraint that makes the one colour moment land.
5. **Genre-appropriate furniture.** fps preloader, status dots, slash rules, credit tables, Roman numerals — the chrome speaks the client's own professional dialect.

### Reusable patterns to extract
- **The single-ink overprint**: greyscale all imagery/video, then lay an `aria-hidden` flat-colour div over it with `mix-blend-mode: multiply`. One variable changes the entire site's identity. Works for film, festival, agency, editorial.
- **vw-locked design systems**: pick a desktop artboard (1728 or 1440), convert *every* desktop measurement to `vw` at full precision, and switch to fixed px below a breakpoint. Optionally wrap in `clamp()` for products. Give the skill the conversion rule, not the specific numbers.
- **The hinge transition**: `transform-origin` at a *named corner*, 4–15° rotation, parent and child at different rates so the child lags. Reads as physical paper. Far more distinctive than translate-and-fade.
- **Sticky stages with invisible rails instead of `pin: true`** — a tall transparent spacer sets the scroll distance, the visual stays `position: sticky`. Avoids ScrollTrigger pin-spacer layout bugs entirely.
- **Per-letter flicker**: a non-monotonic opacity keyframe array with a per-index stagger baked into `times`. The irregularity (on/off/off/on) is what makes it read as a tube striking rather than a fade.
- **Macro/micro type scale with a deliberate gap**, plus optical hang of the first glyph past the margin.
- **Chrome as genre signal**: pick the target industry's own paperwork (fps counters, call sheets, spec tables, coordinate readouts) and render the UI in that dialect.
- **Colour as a bookend**: accent used in exactly two places (active state + footer) so it frames rather than decorates.

### Confidence & sources
| Section | Confidence |
|---|---|
| Awards | High (3 sources; SOTM Nov 2024, SOTD 5 Nov 2024) |
| Credits | Low — studio-attributed; individuals unknown |
| Palette & type | **Very high** (three independent extractions agree to the hex and to the em) |
| Layout system (1728 vw lock) | High (arithmetic from reconstruction matches dataset's "210px at 1728") |
| Sections/components | High (from a pixel-perfect reconstruction, so structure mirrors the original) |
| Motion specifics | High for hero hinge + flicker; medium for the generalised hinge rule |
| Nuxt | Medium-high (single automated detection) |
| CMS / hosting / WebGL | Unknown |

URLs used: `raw.githubusercontent.com/educlopez/design-bites/main/design-mds/thelinestudio.com/DESIGN.md` · `.../ryanonline1234/mediatastelibrary/main/data/families.json` (family `single-ink-cinema-poster`) · `.../YashwantOstwal/the-line-awwwards-SOTM/main/{package.json, app/globals.css, app/layout.tsx, sections/Hero.tsx, components/FlickerText.tsx, components/NavBarDesktop.tsx, sections/GroupClient.tsx, sections/News.tsx}` · `github.com/YashwantOstwal/the-line-awwwards-SOTM/tree/main/{sections,components}` · `.../roshanvijay37/Roshan/main/public/awwwards/data.js` · `.../1jayeshpoduval/image-overlay-animation` · `.../dcellison/phi/book/bibliography.md`

---

## Slosh Seltzer — https://sloshseltzer.com/

> **This is my weakest section.** The site is beyond direct reach and my recall of it is genuinely thinner than for the other two. I have solid award metadata and a sampled palette; the interaction description rests on a small number of second-hand accounts that partly conflict. I flag every disagreement.

### Type / purpose
[verified] Brand/product site for **Slosh**, a hard-seltzer drinks brand — a **multi-flavour (multi-SKU) DTC beverage experience**, not a storefront-first site. Classified in the teardown dataset under the family **`flavor-swap-colorfield`**, whose "for" clause reads: *"Multi-SKU/flavor product lines with a small hand-picked palette set and budget for one commissioned hero object per SKU — beverages, produce, records."*

[recalled, medium] Its centre of gravity is a **single focused interaction rather than a long narrative**: land, engage with the can, get the payoff. One first-hand account describes the journey as "extremely short: land on the page, interact with the can, experience the result. It's a **loop, not a linear path**."

### Awards & recognition
- [verified] **Awwwards Site of the Month, June 2024**; **Site of the Day, 5 June 2024** (`families.json`: `["SOTM-2024-06","SOTD-2024-06-05"]`), corroborated by `roshanvijay37/.../data.js` (`[2024,6,"Slosh Seltzer",…]`).
- [verified, medium] **CSS Design Awards — Website of the Year 2024 nominee**, final judge score **8.99**, at `cssdesignawards.com/woty2024/sites/slosh-seltzer`. Two independent repos record the 8.99 (`vigchetan/Any-IDE/.memory/url_source_meta.json` and `mrbrandonmills/Self-Actualization-Website`), and both place it in the CSSDA top 10 for 2024 alongside Buttermax (9.06, overall winner), Active Theory V6 (9.03), Cartier W&W (9.01), Contra (9.00), Immersive Garden (8.99), Noomo Labs (8.99), Longines (8.96), ATMOS Lamp (8.95), Organimo (8.93).
- [unknown] Awwwards numeric score/sub-scores, Developer Award, FWA, Godly.
- [verified] Featured in Muzli's weekly designer roundup #450 as "**Buttermax: Slosh Seltzer**".

### Credits — CONTESTED, read carefully
Two attributions circulate and I cannot settle it from reachable sources:
- **Buttermax** — [recalled, medium-high]. Supported by the most *direct* evidence: CSSDA's own nominee-page metadata ("Slosh Seltzer **by Buttermax**"), Muzli's card title "Buttermax: Slosh Seltzer", and a bookmark export preserving that same page title. `Any-IDE` calls it "an **in-house maximalist exploration by Buttermax**" — i.e. possibly self-initiated rather than client work. Buttermax is a digital studio at `buttermax.net` — self-description recovered from a reconstruction: *"Buttermax is a digital studio founded on a culture of collaboration. We melt for lovingly crafted design, motion and technology,"* tagline *"The Gold Standard in Buttery Smooth Digital Production"*, contact `hello@buttermax.net`. Buttermax **won CSSDA Website of the Year 2024** with its own site (9.06).
- **Active Theory** — [recalled, low-medium]. Named by `roshanvijay37/.../data.js` and by two AI-compiled corpora. Note that a Codrops article by **Jeremy Chang, a creative developer at Active Theory** (23 Feb 2026, "Composite Rendering: The Brilliance Behind Inspiring WebGL Transitions") lists *"Active Theory & Slosh Seltzer"* as **two separate examples** of scroll-transition compositing — which reads more like citing a peer's site than his own employer's project.

**My read:** Buttermax is the more likely creator; the Active Theory attribution may be contamination from adjacent CSSDA/Awwwards listings. Do not state either as fact in the skill.

### Concept & narrative
- [verified — family-level] **The palette is the navigation.** `flavor-swap-colorfield` thesis: *"one flat unmodulated color field bound to the current SKU by data attributes, so switching repaints ground and ink together; one focal object on the field, chrome tiny."* Selecting a flavour repaints ground, panel, button, ink and shadow **in one gesture** — there is no other transition. Chrome is pinned tiny to the four edges (logotype, hamburger, language rail, product row whose underline doubles as an autoplay countdown track).
- [recalled, medium] A **"pop the top"** moment: an interactive can-opening with liquid and bubble physics and floating fruit — described first-hand as the emotional peak ("after you pop the top" / "physics-based reward moment"). Motion characterised as *"dynamic and physics-driven… chaotic but contained, like a real-world event"* with *"realistic weight and momentum."*
- [recalled, low-medium] Other accounts describe a spinning 3D can, fluid cursor trails, particle bursts on pointer movement, and a layered backdrop of looping colourful text and abstract shapes. (These come from an AI-written research doc; treat as directional only.)
- [verified] Classified as **Maximalism** in `lidge-jun/design-isms` — *"more is more; layered patterns, rich textures, bold colors everywhere, mixed media, visual abundance."*

### Visual design language
- [verified — sampled] Palette: **`#FFC1FF`** (pink), **`#00A165`** (green), **`#FF0837`** (red), **`#0069D8`** (blue), **`#FF5F00`** (orange), **`#FFC800`** (yellow). Six saturated, unmodulated, roughly equal-weight hues — one per flavour. No gradient, no noise, no photographic ground implied by the family thesis.
- [contested] Light vs dark: the sampled palette contains no dark value and the family explicitly describes flat bright colour fields; but a Korean reference list describes the site as *"다크, 컬러풀한 마이크로 인터랙션"* (dark, colourful micro-interactions). Possibly different sections use different grounds. [unknown].
- [inferred — family-typical, **not** confirmed for Slosh] The family's shared vocabulary (drawn from its exemplars Delassus and B/D® JAMS, not from Slosh) specifies: one commissioned focal object at billboard scale, hue-locked so it survives every repaint; one display word drawn *through* the object at viewport scale (line-height 1, no kicker); shadows tinted to each theme's own darkness at constant `.15` alpha; interiors inverting to near-white with the hue surviving as a band or card. **Do not attribute the specific typeface (Sailec) or the "faceted low-poly fruit" to Slosh** — those belong to Delassus.
- [unknown] Slosh's actual typeface(s).

### Components & sections
- [verified — family-level] Tiny edge-pinned chrome: logotype, hamburger, language rail, low product row with an **autoplay countdown underline**.
- [recalled, medium] Hero with interactive can; "pop the top" payoff; flavour switcher as primary nav.
- [inferred — genre-typical for DTC beverage sites 2023–26] Ingredients/nutrition strip, "find us"/stockist locator, age-gate (required for alcoholic seltzer in most markets), social/marquee band, newsletter capture, Shopify or Shopify-headless buy path.
- [unknown] Preloader, cursor, footer specifics, easter eggs.

### Motion & creative effects
- [verified] **Composite rendering / render-to-texture for section transitions.** The Codrops article by an Active Theory creative developer names `sloshseltzer.com` explicitly as an example of *"scrolling and transitioning between multiple sections"* via composite rendering — i.e. each section's 3D scene is rendered to an off-screen `WebGLRenderTarget`, then those textures are composited onto a fullscreen plane with a custom shader that performs the transition. This is the single most technically specific, best-attributed claim I have about this site.
- [verified — family-level] The **swap is the transition**: ~1s `cubic-bezier(.645,.045,.355,1)` repaint across all colour slots, with an **RGBA-lerped canvas clear** so the WebGL background colour interpolates in step with the DOM, and restart-from-current so rapid switching doesn't jump. Two-phase quint easing on the nav bar.
- [recalled, medium] Pointer-reactive fluid/bubble physics; a physics "pop" reward; particle bursts.
- [inferred] Custom GLSL. One developer built a raymarching/SDF liquid shader explicitly "inspired by the epic Slosh Seltzer campaign" (`iamgoodbytes/testkitchen.goodbytes.be`), which suggests the liquid reads as raymarched/SDF rather than as a mesh — but that is his implementation choice, not evidence of theirs.
- [unknown] Sound, preloader sequence, page transitions between routes.

### Tech stack (with evidence)
- [verified] **WebGL** with **custom GLSL**; render-target compositing (per the Codrops citation). CSSDA's own tag for it is "WebGL".
- [recalled, medium] **Three.js** as the WebGL manager — asserted by two second-hand analyses, and implied by the Codrops article's Three.js code sample framing.
- [inferred, genre-typical] GSAP and/or Lenis for scroll and timeline orchestration.
- [low confidence / probably junk] One scraped dataset lists `"platform": "WordPress"` for sloshseltzer.com — but the same record's `"category"` is `"Child Happiness"`, so I treat the whole row as unreliable and would **not** repeat the WordPress claim.
- [unknown] Framework, CMS, commerce platform, hosting, fonts, library versions.

### Responsive / accessibility / performance notes
- [recalled, medium] Two separate sources cite Slosh Seltzer as proof that **heavy WebGL/Three.js is viable on mobile web**, which suggests a genuinely engineered mobile path rather than a static fallback.
- [inferred — genre-typical and worth teaching regardless] Sites in this class survive mobile by: capping DPR (~1.5) *and* total pixel count; shipping `_ld` low-detail asset variants; SMAA instead of MSAA; half-float render targets; and pausing the render loop off-screen.
- [unknown] `prefers-reduced-motion`, keyboard operability, age-gate accessibility. Given the genre, assume none shipped and treat it as the gap to close.
- [note] A physics-heavy "pop" with no reduced-motion path is a real accessibility problem — vestibular triggers plus an interaction with no non-motion equivalent.

### Why it is award-worthy
1. **Product nature = interaction nature.** The product is liquid, so the interaction is liquid. The most repeatable idea on the site: derive the interaction metaphor from the physical truth of the thing being sold.
2. **Palette as information architecture.** Flavour switching repaints the entire world in one beat. Navigation, brand expression and delight collapse into a single gesture — no menu required.
3. **One earned payoff instead of ten effects.** A short loop built around a single memorable, shareable moment ("pop the top") beats a long scroll of competent set-pieces. Maximalism in *surface*, minimalism in *structure*.
4. **Composite rendering as the transition engine.** Rendering sections to off-screen targets and shading the blend is what lets a maximalist site change worlds without seams or loading states.
5. **Joy is a legitimate brief.** In a year dominated by cold monochrome WebGL, a fully saturated, physically playful drinks site scored 8.99 at CSSDA and took an Awwwards SOTM. Range matters.

### Reusable patterns to extract
- **Theme-swap as navigation**: define N themes as `[data-theme]` token sets (ground, ink, panel, button, shadow); switching repaints all slots in one ~1s `cubic-bezier(.645,.045,.355,1)` beat, and the WebGL clear colour is **RGBA-lerped in the same tween** so canvas and DOM never desync. Always restart-from-current so fast switching stays fluid.
- **Composite rendering for section transitions**: render Scene A to a `WebGLRenderTarget`, map its texture onto a fullscreen plane in Scene B, drive the wipe/warp/dissolve in that plane's fragment shader. One pattern covers scroll transitions, 3D thumbnails, and multi-scene overlays.
- **Derive the signature interaction from the product's physics**: liquid → fluid sim; crisp → shatter; elastic → spring. Name the moment and build the whole page around it.
- **One commissioned focal object per SKU**, hue-locked so it survives every repaint — the pattern collapses if you substitute stock 3D.
- **Chrome pinned tiny to the four edges** so the colour field owns the screen; an autoplay countdown as the product-row underline doubles as progress affordance.
- **Mobile WebGL budget rule**: DPR cap *and* an absolute pixel-count cap (e.g. 2560×1440), half-float RTs, SMAA, low-detail asset variants, render-loop pause when off-screen.
- **Maximalism discipline**: a *small hand-picked* theme set (4–10). Generated palettes turn the same pattern into an arbitrary rainbow — this is the documented failure mode.

### Confidence & sources
| Section | Confidence |
|---|---|
| Awards (SOTM Jun 2024, SOTD 5 Jun 2024) | High (2 sources) |
| CSSDA WOTY 2024 nominee, 8.99 | Medium-high (2 sources, both AI-compiled) |
| Credits | **Contested** — Buttermax (medium-high) vs Active Theory (low-medium) |
| Palette hexes | High (sampled dataset) |
| Palette-as-navigation concept | High at family level; medium that Slosh executes it fully |
| Composite rendering | High (named in a Codrops article by an Active Theory dev) |
| "Pop the top" / liquid physics | Medium (first-hand-sounding but second-hand accounts) |
| Typography, sections, sound, framework | Unknown |
| WordPress claim | Rejected as unreliable |

URLs used: `raw.githubusercontent.com/ryanonline1234/mediatastelibrary/main/data/families.json` (family `flavor-swap-colorfield`) · `.../roshanvijay37/Roshan/main/public/awwwards/data.js` · `.../vigchetan/Any-IDE/main/docs/award_winning_analysis.md` and `.memory/url_source_meta.json` · `.../mrbrandonmills/Self-Actualization-Website/main/docs/plans/2025-01-24-award-winning-scroll-animation-research.md` · `.../organvm-iii-ergon/fetch-familiar-friends/main/docs/archive/{SYNTHESIS.md,DISTILLED-dogcal-schedule.md,dogcal-schedule.md}` · `.../TUARAN/frontend-weekly-digest-cn/main/weekly/455/…` (CN translation of Jeremy Chang, Codrops, 2026-02-23) · `.../lidge-jun/design-isms/main/assets/data/isms.json` · `.../muzlix/blog-content-md/main/weekly-designers-update-450.md` · `.../realAllenSong/frontend_mockup/.../ButtermaxReplica.tsx` · `.../iamgoodbytes/testkitchen.goodbytes.be/.../monster-drink-liquid-concept.md` · `github.com/phucbm/2dwa-slosh-seltzer`

---

## Cross-site observations (batch E)

### Tech
- **All three are WebGL-assisted, but at three completely different dosages.** Igloo is 100% canvas (the DOM is a shell). Slosh is canvas-first with a DOM colour system bound to it. The Line appears to be **DOM/CSS-first with WebGL or canvas only for cursor/reveal moments** — and it won SOTM in the same year. *The skill should not equate award-worthiness with Three.js.*
- **Two framework families, both SSR-first**: Igloo on **Svelte + Vite** (Threlte-shaped), The Line on **Nuxt/Vue**, Slosh unknown. React/Next.js appears in every *reconstruction* and in almost none of the *originals*. This is worth saying plainly: the reconstructions default to Next + Framer Motion + Lenis + Tailwind because that's what the rebuilders know, not because the originals used it.
- **The asset pipeline is the real moat.** Igloo's manifest is 36 KTX2 + 19 Draco + 2 WASM decoders + 4 workers and almost nothing else. No PNG, no JPG, no glTF, no GLB. The differentiator between "nice Three.js site" and "Site of the Year" is an offline bake step: Houdini/Blender → Draco + KTX2 + baked volumes → workers → staged load.
- **Compositing is the shared advanced technique.** Igloo's scene-to-scene flashes and Slosh's section transitions both run through render-to-texture with a shader on a fullscreen plane. Codrops named this pattern in Feb 2026 — it is the current state of the art for seamless WebGL transitions, and it is teachable in ~40 lines.
- **Workers are not optional at this tier.** Four dedicated workers on Igloo (audio, bitmap, EXR, MSDF) exist so the loading sequence never janks.

### Motion vocabulary
- **Three distinct scroll philosophies, and none of them is "add Lenis and scrub":**
  - Igloo — **document scroll abolished**. Virtual scroll scalar (wheel×0.1, friction 0.97, double-lerp .075→.15, 1.4s inOut3 snap, modulo wrap). The page is an application.
  - The Line — **native scroll preserved**, sticky stages + invisible rails, *explicitly never `pin: true`*, custom-drawn scrollbar.
  - Slosh — **scroll as section switcher**, transitions handled by GPU compositing rather than by layout.
- **Everyone avoids fade-and-translate.** Igloo uses glitch/flash cuts and scramble-decode; The Line uses hinging panels with lagging children and per-letter flicker; Slosh uses a whole-palette repaint. The transition *is* the identity in all three.
- **Easing convergence**: expo-out `cubic-bezier(0.19, 1, 0.22, 1)` (The Line hover), in-out-quad/cubic families for snapping (Igloo's `inOut3`, Slosh's `.645,.045,.355,1`). Plus a hard rule surfaced repeatedly in the corpora: **scrub-linked tweens must be `ease: "none"`** — a scrubbed tween left at default easing is *not* linear and is a documented trap.
- **Framerate-independent damping** (exp/log form) rather than fixed-per-frame lerp — the difference between a site that feels identical on 60Hz and 144Hz and one that doesn't.
- **Sound is a differentiator, and only Igloo clearly shipped it** — event-bound, rate-limited, crossfaded, with a visible state-labelled toggle.

### Typography & layout
- **Two of three are single-typeface sites.** Igloo: IBM Plex Mono only. The Line: Denim variable only. Type restraint correlates strongly with this award tier.
- **Monospace is the "technical credibility" signal**, and The Line reaches the same register with a grotesk plus 9px uppercase micro-labels and slash rules. The genre convention is: **one huge size + one tiny size, nothing between**.
- **The vw-lock is the single most portable craft detail found in this batch.** The Line's six-decimal vw values (`12.15278vw`, `1.27315vw`, `7.29167vw`) are mechanical conversions from a 1728px artboard. Any designer can adopt it in an afternoon and it instantly removes the "breakpoint-soup" look.
- **Igloo inverts the whole premise**: because type is MSDF geometry in 3D space, there is no CSS layout at all — type has depth, parallax, and obeys the post-processing stack.
- **Sharp edges win.** Zero border-radius on The Line; faceted ice on Igloo; flat fields on Slosh. Not one rounded card in the batch.

### Colour
- **Each site is essentially monochromatic in strategy, even the maximalist one.**
  - Igloo: one temperature (blue-grey), saturation ≈ 0, a *fog gradient* doing the work people assume a background image does.
  - The Line: one cool grey ground + **one** hot ink, used in exactly two places.
  - Slosh: six hues, but **only ever one on screen at a time** — the field is unmodulated and the swap is the event. That is monochrome-per-state.
- **The generalisable law: the number of colours visible simultaneously is near one.** Variety comes from *change over time*, not from simultaneity.
- No gradients-as-decoration, no glassmorphism, no drop shadows anywhere in this batch. Depth is luminance (The Line), optics (Igloo), or flat-field figure/ground (Slosh).

### Narrative structure
- **Igloo — descent.** Linear-ish, infinite-wrapping, camera-driven, mission statement up front, portfolio as specimens.
- **The Line — call sheet.** Conventional studio-site IA (hero/studio/work/clients/news/contact) elevated entirely by treatment.
- **Slosh — loop.** A very short journey whose destination is one interaction, designed for repeat and for sharing.
- **The common thread is register commitment.** Each picks a professional dialect (expedition telemetry / film production paperwork / candy packaging) and renders *every* piece of chrome in it. The award isn't for the hero — it's for the 9px labels agreeing with the hero.

### What surprised me
1. **igloo.inc's igloo is not transparent.** Everyone assumes refraction; a teardown of the actual render shows matte rough surfaces, interior light and Fresnel rim. Real refraction appears only on the later crystal cubes. The most imitated visual in 2024–25 is achieved *without* the expensive technique everyone copies.
2. **Site of the Year scored 6.6/10 on accessibility and 6.4 on markup.** Awwwards' own Developer Award sub-scores show that an empty DOM was not disqualifying. Two entirely independent sources land on the same 6.4–6.6 band. The skill should teach the ceiling *and* the fix (semantic DOM mirror + reduced-motion path), not pretend the winner was flawless.
3. **The entry bundle is 16 KB.** Gzipped, ~6 KB. The heaviest-looking site in the batch has one of the lightest first bytes. Perceived weight and actual weight are decoupled by staging.
4. **Smoke is geometry.** `ceilingsmoke.drc` / `smoke_trail.drc` being *Draco meshes* rather than particle systems is the most instructive single fact in the manifest: the "impossible" simulation is a recording.
5. **Volume data ships as 2D textures.** `volumes/medium_32.ktx2`, `x_64.ktx2` — 32³/64³ VDB volumes flattened into KTX2 atlases via a custom exporter, reportedly smaller than a typical web image.
6. **The reconstruction ecosystem is a legitimate research corpus.** There are at least ten public Igloo clones, a pixel-perfect The Line rebuild that reproduces the real vw values and hexes, and a full network capture — and where three independent methods (network capture, live-CSS extraction, hand sampling) overlap, they agree exactly. That cross-agreement is what let me label so much as verified.
7. **Studio-level clustering is real.** Abeto has two entries in the Awwwards SOTY collection in consecutive years (Igloo 2024, Messenger 2025); Immersive Garden has five SOTMs across 2024–26; Active Theory has nine-plus going back to 2016. These sites are not lightning strikes — they're house styles executed repeatedly.
8. **Honest conflict remains.** Slosh Seltzer's creator is genuinely contested between Buttermax and Active Theory across the reachable record, and I could not settle it. The skill should carry the pattern, not the misattribution.