# Yevgeniya Grab — https://www.eugeniagrab.com/en

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | brand — the site of a single psychoanalytic psychotherapist practising in the UK and Ukraine, in-person and online [verified, index.html `description`] |
| Visitor mode | persuade, wrapped in a slow experience layer |
| Awards | none looked up this pass [unknown] |
| Corpus rating | D 7.6 / U 6.6 / C 7.6 / Co 7.2 → weighted 7.26, 2026-10-05 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | footer carries a "Created by" credit whose name is clipped in the capture [verified, desktop-s100.png]; studio [unknown] |
| Stack (evidence level) | React 18.2.0 as a Create-React-App-style bundle (`/static/js/main.<hash>.js`, empty `#root`) [verified, index.html; main.js]. **@react-three/fiber** over **three r148** (`REVISION="148"`) with GLTFLoader + DRACOLoader, decoder self-hosted [verified, main.js]. **GSAP 3.15.0** + ScrollTrigger [verified, main.js version strings]. **Lenis 1.3.25** (`Xi="1.3.25"`) on its own rAF loop [verified, main.js]. i18next for EN / UK [verified, main.js]. Contact form posts to herotofu.com [verified, main.js]. Fonts: Cormorant Light/Regular/Medium + Inter Light/Regular/Medium, self-hosted woff2 [verified, main.css; index.html preloads] |
| Palette | warm-paper ground + teal-black ink + one dusty-rose accent; the 3D flowers are the only saturated colour. Tokens listed in §3 |
| Type | humanist display serif + grotesque UI (Cormorant 46 rules, Inter 7) [verified, main.css]. Caps Cormorant for the wordmark and chapter titles, mixed-case Cormorant for the manifesto line, small Inter for nav, quotes and body [verified, captures] |
| WebGL dosage | moments — 5 canvases on desktop: one hand-written WebGL1 photo shader hero, an R3F story canvas with five glTF plants, an R3F single-flower canvas, an R3F image-sheet canvas (≥ 1101 px only) [verified, manifest.json `canvases: 5`; main.js] |
| Scroll model | native + Lenis (desktop only; disabled ≤ 767 px, where an `.app` element becomes the ScrollTrigger scroller) [verified, main.js] |
| Narrative model | chaptered journey — word-search preloader → manifesto over a photo-shader flower → five numbered "life situation" chapters, each a 3D plant → services → about → contact [verified, captures; main.js] |

## 1. Concept and narrative
The practice is told as a garden: each reason to start therapy is one plant, grown, coloured and handed to the next by scroll. The load opens on a grid of random capitals in which the therapist's name is found, like a word search. Then comes a misted photograph of a calla-like flower behind a four-line manifesto ("Sometimes what we need isn't a solution." [verified, desktop-rm-s00.png]). The story follows: a dandelion whose five seeds drift away, then a globe thistle, hydrangea, echinacea and artichoke. Each grows from a monochrome sculpture into natural colour beside a big outline numeral, a chapter title in caps and a quotation [verified, desktop-rm-s50.png; main.js `vn` map]. The register is clinical-calm: few words, attributed quotes (Frankl), no sales voice.

## 2. Structure and components
- **Preloader:** a 5 × 15 capital-letter grid; brand letters darken while the rest fade; under reduced motion the random letters are hidden at once and the name shown [verified, desktop-s00.png; main.js `page-loader__letter`]. Fonts gate the reveal via `document.fonts.ready` [verified, main.js].
- **Hero lock:** `window.__heroIntroLocked` keeps Lenis stopped until the intro releases it [verified, main.js].
- **Header:** caps serif wordmark left, three Inter links, `EN — UK` switch right [verified, desktop-s75.png].
- **Story cards:** five chapters with a fixed progress dial bottom right ("4/5" visible) whose circles are also the origins of the 3D transitions [verified, desktop-rm-s50.png; main.js `.cards-progress__circle`].
- **Word interlude:** a letter-elision line ("W LLN SS") reprises the preloader's word-search idea [verified, desktop-rm-s75.png]; what completes it is [unknown].
- **Services sheet:** four photos on one bending WebGL sheet, desktop only [verified, main.js `psychotherapy-shader-media`].
- **Circle buttons:** magnetic (pointer offset × .16, scale 1.04, .45 s `power2.out`; return .8 s `power3.out`) with an ink fill entering from the exit point [verified, main.js `--circle-button-x`].
- **Footer:** a fixed reveal footer on a darker blush ground with a big wordmark, links, email, privacy link [verified, desktop-s100.png; main.css `.footer` `position:fixed`].
- **Elsewhere:** accordions, a diplomas slider and a "want" section with a tap-to-bend ranunculus over grass PNGs [verified, main.css; main.js].

## 3. Visual language
Tokens read from main.css (rule counts in brackets):
- `#faf5ee` page ground and `html` background (8) [verified, main.css]
- `#f5eee6` theme-color [verified, index.html]
- `#142022` teal-black ink (25) [verified, main.css]
- `#936e6c` dusty-rose accent: links, rules, section-heading SVG (41 colour + 7 background) [verified, main.css]
- `#603d3b` deep rose for secondary ink (4) [verified, main.css]
- `#e5dad4` footer ground [verified, main.css]
- `#7ae582` a stray green dot on the current item [verified, main.css], a seam in the system

Grounds shift between warm paper and a cooler grey behind the 3D chapters [verified, desktop-rm-s50.png]. Type is set in `rem` with `html { font-size: .0592415vw }`, so 1 rem = 1/1688 of the viewport and the whole layout scales as a single artboard [verified, main.css]. Phone rules switch to px and `clamp()` (e.g. `clamp(26px,7vw,34px)`) [verified, main.css]. Easing in CSS is mostly `cubic-bezier(.22,1,.36,1)` (168 uses) and `cubic-bezier(.35,0,.2,1)` (87) [verified, main.css]. Imagery: soft photography and raw 3D plants, no illustration.

## 4. Motion and effects (with parameters)
- **Smooth scroll:** Lenis `duration 1.1`, easing `min(1, 1.001 − 2^(−10t))`, `smoothWheel: true`, its own `requestAnimationFrame` loop, `on('scroll', ScrollTrigger.update)`; off below 768 px [verified, main.js].
- **Scrub:** the story timelines use `scrub: 1.2` on desktop and `.2` on the phone [verified, main.js].
- **Image parallax:** `yPercent` 8, scale 1.2 from `data-parallax-*` attributes, skipped under reduced motion [verified, main.js].
- **Hero photo shader:** a mist-and-feather dissolve of a still photo, plus a pointer trail and a hover radius (see Tech lens) [verified, main.js].
- **Menu:** per-character title and row-number reveals, `xPercent 115` panel slide, with reduced-motion branches [verified, main.js].
- **Text:** `.text-reveal__word` and `.heading-reveal__char` reveals, each forced visible under reduced motion by CSS [verified, main.css].
- **Load:** word-search grid → name → hero, gated on fonts [verified, main.js].

## 5. Tech and pipeline
| Layer | Evidence |
|---|---|
| React 18.2.0 single bundle, 1,660,851 B JS + 143,506 B CSS | [verified, fetched sizes] |
| R3F + three r148, GLTFLoader, DRACOLoader with a URL-modifier map to hashed decoder files | [verified, main.js `kr` map] |
| GSAP 3.15.0 + ScrollTrigger; no SplitText | [verified, main.js] |
| Lenis 1.3.25 | [verified, main.js] |

Asset weights from HEAD requests: six plant `.glb` files total 11,424,460 B — artichoke 2,882,784, globe thistle 3,275,252, ranunculus 1,807,156, hydrangea 1,296,360, dandelion 1,121,032, echinacea 1,041,876 [verified, content-length]. A 4k petal normal map ships as PNG at 1,130,748 B beside a 92,350 B WebP base colour [verified, content-length]. `draco_decoder.wasm` 192,420 B; hero photo WebP 372,662 B [verified, content-length]. No KTX2 or meshopt decoder is registered [verified, main.js], so textures inside the glb are uncompressed or WebP [inferred]. Cold synthetic LCP 1,084 ms desktop, CLS .0033; no console errors or failed requests [verified, manifest.json].

### Tech lens: 3D
- **Models:** five plants in the story canvas, one ranunculus in its own canvas; all through one Draco-enabled loader [verified, main.js]. Each carries a baked growth clip; the code merges every track into one `AnimationClip` per plant (`mordovnik-growth`, `hydrangea-growth`, …) [verified, main.js]. The artichoke's `Mesh.*` tracks are retimed to start at .62 of the clip [verified, main.js `ar`].
- **Scroll → clip:** each mixer is `setTime(progress × duration)` from GSAP-tweened `{value}` refs, never `play()` on a clock [verified, main.js `mixer.setTime`].
- **Scroll windows:** one timeline from `top top` to `bottom bottom` of the story [verified, main.js]. Plants take integer slots 0, 2, 4, 6 [verified, main.js]. Each slot is three tweens [verified, main.js]:
  - hand-off, 1 unit, `power1.inOut`;
  - growth, .88 starting at +.88, `sine.inOut`;
  - colour, .8 starting at +1.04, `sine.inOut`.
  A filler tween pads the timeline to 8 units [verified, main.js `Dn=8`].
- **Hand-off mask:** a circular `discard` patched in at `<clipping_planes_fragment>`, centred on the DOM progress dial's circle [verified, main.js `uFlowerTransitionMask*`]. Its radius runs from the circle's radius to the farthest viewport corner + 2 px. The edge is grained per pixel by a `fract(sin(dot))` hash with softness `clamp(.028 × min(w,h), 15, 36)` (8 on phones). The outgoing plant discards inside and the incoming one outside [verified, main.js].
- **Monochrome → colour:** an `onBeforeCompile` patch on `<map_fragment>` mixes texture luma with saturation-boosted colour by `uSculpturalColorProgress`, gain and saturation per plant [verified, main.js]. Example values: dandelion sat 1.65 gain .44, echinacea 1.2 / 1.06 [verified, main.js `wr`].
- **Stem fade:** a second patch at `<dithering_fragment>` fades alpha and rgb up from a screen-space y, so stems dissolve into the page instead of hitting the canvas edge [verified, main.js `uFlowerBottomFade_*`].
- **Petal translucency:** echinacea petals add back-scatter `pow(max(dot(−N, key),0),1.7) × .13` and edge scatter `pow(1−|N·V|,2.2) × .025` before `<output_fragment>` [verified, main.js].
- **Lighting:**
  - PMREM from a generated scene at sigma .04 [verified, main.js]; RoomEnvironment [inferred].
  - Ambient `#e2e7ee` at .04 [verified, main.js].
  - Key light `#fff7f0`, intensity 1.4 at (−5, 4.8, 6.2). It casts the only shadow: map 512², frustum ±5, bias −3e-4, normalBias .025 [verified, main.js].
  - Rim light `#eef3fd` at .28 from (4.2, 3.4, 1.6) [verified, main.js].
  - Exposure .92 in the story canvas; ACES Filmic at .96 in the ranunculus canvas [verified, main.js].
- **Per-plant tuning:** each plant has a roughness, environment and black-level object (`roughness .82–.94`, `environment .1–.74`) [verified, main.js `wr`].
- **Camera:** fixed perspective, no orbit. Story fov 42 at z 9; ranunculus fov 38 at z 6.6; sheet fov 34 at z 2 [verified, main.js].
- **Motion:** idle sway is two sines (`.72 sin(.58t+φ) + .28 sin(.23t+1.7φ)`, .68°). Wind gusts arrive every 2.4–5.5 s with a gap of .6–2 s, driving a spring (k 12, damping 3.8, 1.15°) [verified, main.js `_r`, `he`].
- **Pointer:** pointer motion is raycast hover on dandelion seeds, mouse only [verified, main.js].
- **Render policy:** each plant sits on its own layer (1–5) [verified, main.js]. `frameloop` is `always` only while the story intersects, otherwise `demand`, with `invalidate` on every ScrollTrigger update [verified, main.js]. DPR `[1, 1.35]`, 1.25 on phones; `antialias: true`, `powerPreference: default` [verified, main.js].
- **Warm-up:** `initTexture` on every map, then `gl.compile` with all plants briefly visible, so no shader compiles mid-scroll [verified, main.js].
- **Disposal:** on unmount, `stopAllAction`, `uncacheRoot`, material and cloned-geometry `dispose`, PMREM `dispose` [verified, main.js].
- **Fallback:** none beyond `Suspense fallback: null` [verified, main.js]; with WebGL off the chapters would show text and no plant [inferred].

## 6. Weaknesses
- Reduced motion: pass. The rm frame reads at rest, text-reveal and heading chars are forced visible, and the parallax and loader have branches [verified, desktop-rm-s00.png; main.css]. Lenis still runs under reduced motion on desktop [verified, main.js: gated on width only].
- Keyboard: partial. Menu and accordions have key handlers [verified, main.js `keydown`]; the plant hover and the ranunculus tap are pointer-only [verified, main.js].
- DOM behind the canvas: pass. Chapter titles, quotes and numerals are DOM; canvases are `aria-hidden` [verified, desktop-rm-s50.png; main.js].
- Load gate: the word-search preloader plays every visit, with no storage flag [verified, main.js: no `sessionStorage`]. 11.4 MB of glb sits behind one page [verified, content-length].
- Phone: designed type and a separate scroller [verified, mobile-s100.png; main.js]. The phone capture never left the hero; the states did not advance [verified, manifest.json `scrollMode: wheel`].
- Wayfinding and conversion: the 1/5 dial marks the chapter [verified, desktop-rm-s50.png]. Contact is one nav item and the footer email [verified, desktop-s100.png].

What the awards skills do differently: budget the plants to a scene window each and stream them, ship meshopt + KTX2 rather than a 4k PNG normal map, remember the preloader, and stop the smooth scroll under reduced motion.

## 7. Principles (3–6, generalisable)
1. **Let colour be the reward of attention.** A subject that arrives as monochrome sculpture and earns its natural colour by scroll turns progress into a felt change rather than a counter.
2. **Hand objects off through the wayfinding element.** When the chapter dial is the origin of the transition mask, the navigation and the scene are visibly one system.
3. **Scrub baked clips, don't trigger them.** Mapping scroll to `setTime` keeps an authored growth animation reversible and exactly as long as the reader wants.
4. **Dissolve the frame, not the object.** Fading stems in screen space and feathering photos with noise removes the canvas rectangle, so 3D sits in the page like print.
5. **Let a quiet register carry a heavy stack.** Five canvases read as calm when the type is one serif, the palette is paper and ink, and only the subject moves.

## 8. Take / Don't take
- **Take:**
  - Scroll-scrubbed `AnimationMixer.setTime` over merged baked clips, one integer slot per object with hand-off, grow and colour sub-tweens.
  - A grained circular `discard` hand-off whose centre is a DOM element's measured rect.
  - The luma ↔ colour `onBeforeCompile` patch, with per-object gain and saturation.
  - Render policy: `frameloop` always only while visible, demand plus `invalidate` otherwise, `gl.compile` warm-up, explicit mixer and material disposal.
  - A single 512² shadow caster plus PMREM fill as the rig for organic matte subjects.
  - A loader that makes finding the name the game, with a reduced-motion branch that just shows it.
- **Don't take:**
  - The plant cast in that order (dandelion → globe thistle → hydrangea → echinacea → artichoke) or the garden-as-therapy metaphor as-is.
  - The token set on its own lines below; together they are this practice's identity.
  - `#faf5ee` [verified, main.css]
  - `#142022` [verified, main.css]
  - `#936e6c` [verified, main.css]
  - `#e5dad4` [verified, main.css]
  - Cormorant caps + Inter as a wholesale contract.
  - The word-search letter grid of the name, or the misted calla manifesto frame.
  - The weights: 11.4 MB of glb and a 1.1 MB PNG normal map on a one-page site.

## 9. Confidence and sources
- Header, §2, §3: high — captures plus main.css and index.html read.
- §1: medium-high — four of five desktop states and three reduced-motion states rendered. Desktop s50, mobile s25/s50 and rm s25/s100 hit screenshot timeouts under SwiftShader [verified, manifest.json `pageErrors`]. Chapter identities come from main.js.
- §4, §5, Tech lens: high — read from the served bundle; RoomEnvironment and texture formats [inferred].
- §6: medium — no keyboard walk was run; claims come from source.
- Sources: capture.mjs run 2026-10-05 (desktop, mobile, reduced motion); `index.html`, `main.51194873.js`, `main.45606d42.css` fetched 2026-10-05; HEAD requests for glb, PNG, WebP and WASM sizes. Site reachable; no award entry looked up.
