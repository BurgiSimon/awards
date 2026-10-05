# A24 (concept by Ravi Klaassens) — https://a24.raviklaassens.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | brand: an unofficial, non-commercial reimagining of a film distributor's catalogue; Films (home), Television and `/production/<slug>` routes, 12 films listed on the home route [verified, index.html JSON-LD `numberOfItems: 12`; search result snippet "experimental, non-commercial"] |
| Visitor mode | experience: the home route is one disc gallery to browse; each film opens a production route with credits, reviews and a trailer lightbox [verified, desktop-s00.png; index.html `data-trailer-*`, `data-barba-prevent` links] |
| Awards | Awwwards **Nominee, 21 Sep 2026**, credited "A24 by Ravi Klaassens"; no jury scores visible in the captured entry frames (a cookie wall covers part of them) [verified, entry page, `entry/desktop-s00.png`, `entry/desktop-s50.png`]. An FWA case with 83 points is reported by a search snippet only [unknown, not read] |
| Corpus rating | D 7.6 / U 7.2 / C 7.8 / Co 7.0 → weighted 7.46, 2026-10-05 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Ravi Klaassens, design and development [verified, host name; search result listing "A24 by Ravi Klaassens"]. A24 is the subject, not the client [verified, search snippet "non-commercial project"] |
| Stack (evidence level) | **Astro** build serving a **Webflow export** (`/_astro/ExportPage.*`, `w-mod-js`, `wf-design-mode` guards) [verified, index.html] · **GSAP 3.15.0** with ScrollTrigger, SplitText, CustomEase, Observer, Flip [verified, bootstrap.js `version="3.15.0"`, `registerPlugin`] · **Lenis 1.3.26** on the GSAP ticker [verified, bootstrap.js; main.qdXy8l6N.js] · **Barba 2.10.3** [verified, bootstrap.js `version="2.10.3"`] · **Three.js r178**, lazily imported with RectAreaLightUniformsLib [verified, three.core.js `"178"`; bootstrap.js dynamic imports] · disc art from a Bunny CDN pull zone (`raviklaassens.b-cdn.net`) [verified, index.html] · Umami analytics [verified, index.html] · Cloudflare Pages [verified, `getent hosts` alias `a24-3ld.pages.dev`] · fonts PP Eiko, PP Neue Montreal, PP Museum, self-hosted woff2 [verified, ExportPage.css `@font-face`] |
| Palette | grained paper-white ground, black ink, a mid grey for rules; a declared oxblood brand swatch not seen on the home route (hexes in §3); strategy: **achromatic paper + black ink; all chroma comes from the poster art printed on the 3D objects** [verified, ExportPage.css `--_colors---swatch--*`; desktop captures] |
| Type | **high-contrast display serif caps + grotesque values + wide-tracked small-caps labels**: PP Eiko for titles and review quotes, PP Neue Montreal Medium for names and years, PP Museum for spaced labels and outlet names [verified, ExportPage.css `--_fonts---fonts--heading / paragraph / eyebrow`; desktop-s00.png] |
| WebGL dosage | canvas-first: one Three.js canvas draws the disc gallery; title, credit table, reviews and nav are DOM, and the 12 films exist as a DOM list [verified, manifest `canvases: 1`, index.html `data-disc-canvas`, 12 `data-film-item`] |
| Scroll model | section switcher: the home route does not scroll; wheel, drag, touch and arrow keys step a spring-snapped float index one disc at a time [verified, manifest `scrollMode: wheel`; main.qdXy8l6N.js wheel step detector, `snapFreq`, `ArrowRight`] |
| Narrative model | gallery: twelve films as twelve physical discs on one tilted row, the active disc's credits top left and two reviews below [verified, desktop-s00…s100.png] |

## 1. Concept and narrative
The catalogue is a stack of optical discs. Each film is pressed onto a disc whose label is its poster, with credits set around the rim, and the discs float in a tilted row on grained paper. One wheel notch slides the row one disc along; the active disc sits centre-right, slightly raised, and a hand-drawn loop scribbles around it while its credit table and two starred reviews swap in [verified, desktop-s00/s25/s50/s100.png].

The beats across the captures are not chapters but items: Backrooms at rest, Lady Bird at 25 %, Ex Machina by 50 % and held to 100 %, the end of the row [verified, desktop-s25.png, desktop-s50.png, desktop-s100.png]. Register: cinephile and collector, review pull-quotes in caps, no marketing voice.

## 2. Structure and components
- **Nav:** a centred inline row (logotype, Films, Television, Index with a dropdown); on phones it becomes a white floating bar at the bottom [verified, desktop-s00.png, mobile-s00.png]. The Index dropdown has Escape, ArrowUp/Down, Enter and Space handlers [verified, main.qdXy8l6N.js].
- **Credit table:** title in display caps, then hairline-ruled rows (DIRECTED BY, YEAR, STARRING) with right-aligned values, top left [verified, desktop-s00.png].
- **Disc gallery:** the canvas carousel, `aria-roledescription="carousel"`, `aria-label` "Film disc gallery", a polite `aria-live` announcer, ArrowLeft/Right, Home, End, Enter and Space [verified, main.qdXy8l6N.js].
- **Reviews:** two columns under the disc: star rating, outlet in spaced caps, quote in display caps [verified, desktop-s00.png].
- **Scribble:** a black hand-drawn ring around the active disc, redrawn at 10 fps [verified, desktop-s100.png, desktop-rm-s00.png; `scribbleFps: 10`].
- **Production route:** hero with reveal lines, a trailer lightbox with keyboard (Space/K, M, Escape) and a scroll-next prompt [verified, main.qdXy8l6N.js `data-production-hero`, trailer keydown]; not captured [unknown render].
- **Preloader:** a fan-in of the discs (`preloadFanDuration 1.15`, `preloadRiseFrom 3`), with a CSS `data-preload` gate removed at most 20 s later [verified, main.qdXy8l6N.js; index.html inline script].
- 404, footer: [unknown].

## 3. Visual language
- **Grounds and ink:**
  `#f2f2f2` [verified, ExportPage.css `--_colors---swatch--white`]
  `black` [verified, ExportPage.css `--_colors---swatch--black`]
  `#d6d3d1` [verified, ExportPage.css `--_colors---swatch--grey`, 18 uses]
  `#891a20` [verified, ExportPage.css `--_colors---swatch--brand`, a `.theme-blue` background; not seen in captures]
  The ground carries a fine paper grain over the whole viewport [verified, desktop-s00.png].
- **Type:** one display serif in caps for the title and quotes, one grotesque for every value, one small-caps sans tracked wide for labels; the credit table reads like a back-of-box spec [verified, ExportPage.css; desktop-s00.png]. Line balance is computed in JS (`data-balance-lines`), and line space reserved with `min-height: Nlh` before text arrives (`data-reserve-lines`) [verified, main.qdXy8l6N.js].
- **Imagery and material:** the poster art is the only colour on the page, printed on discs that carry grain, print and scratch layers, a clearcoat and an iridescent back [verified, desktop-s25.png; main.qdXy8l6N.js `texGrain .59`, `texPrint .35`, `texScratches .36`].
- **Layout:** four zones held on every frame: credits top left, nav top centre, gallery across the middle, reviews bottom centre; the phone stacks credits on top, disc centred, nav at the bottom [verified, desktop and mobile captures].

## 4. Motion and effects (with parameters)
- **Smooth scroll:** Lenis `lerp .165`, `wheelMultiplier 1.25` on fine pointers, lerp 1 on coarse pointers, `allowNestedScroll`; `lenis.raf` from `gsap.ticker`, `lagSmoothing(0)`, `ScrollTrigger.update` on scroll [verified, main.qdXy8l6N.js].
- **Eases:** a global `CustomEase` `main` = `0.625, 0.05, 0, 1` as `gsap.defaults`, duration .6, stagger .05; `discGlide` = `0.32, 0.72, 0, 1` for the gallery [verified, main.qdXy8l6N.js]. CSS mirrors them: `cubic-bezier(.625,.05,0,1)` ×5, `cubic-bezier(.509,.188,.041,.989)` ×7 [verified, ExportPage.css].
- **Gallery spring:** index snapped by a spring with `snapFreq 9.5`, `snapDamping 12`; drag `sensitivity .95`, `friction .89`, velocity smoothing .32 capped at .5; hover tilt .21 [verified, main.qdXy8l6N.js config].
- **Wheel to steps:** wheel deltas pass a noise floor (.3), an event cap (24), a 550 ms envelope and tick gaps (34 / 130 ms) before a 6-unit threshold turns them into one step; a sustained gesture repeats after 480 ms [verified, main.qdXy8l6N.js `wheel*` keys].
- **Flow lean:** discs lean (.055, max .3), bank (.32) and dip (.014, max .09) with travel velocity, and a fast pass pushes and spins neighbours (`wipePush .012`, `wipeSpin .009`) [verified, main.qdXy8l6N.js].
- **Text:** SplitText `type: 'lines'` with a mask div per line on disc transitions [verified, main.qdXy8l6N.js]; ScrollTrigger scrub parallax (default 20 → −20) and a scrubbed dissolve on production routes [verified, main.qdXy8l6N.js `data-parallax`, `data-dissolve`].
- **Route change:** Barba `sync: true`, timeout 7000, `preventRunning`; disc "flight" into the production route (`flightRecede 2.2`, `flightStagger .45`) [verified, main.qdXy8l6N.js].

## 5. Tech and pipeline
- Entry: one 312-byte script imports `bootstrap` (178 KB: GSAP, plugins, Lenis, Barba), which lazy-imports the 264 KB site module and Three.js (684 KB core + 247 KB area-light tables) [verified, file sizes of the fetched text]. Gzip sizes [unknown].
- Disc art: one WebP per film, 184,422 B and 132,892 B for the two headers read [verified, `curl -sI` content-length]. No model files at all: every disc is generated [verified, main.qdXy8l6N.js; no `.glb`/`.gltf` strings].
- Manifest: 664 DOM nodes, no console errors, no failed requests, CLS .017 desktop [verified, capture-out.json].
- Quality: DPR `min(devicePixelRatio, 1.5)` on narrow screens else 2 for the gallery; production disc uses `maxPixelRatio 1.5` and a 2.6 MP pixel budget; transmission rendered at half resolution [verified, main.qdXy8l6N.js].

### Tech lens: 3D
- **Models:** none loaded. The disc is built from `LatheGeometry` profiles: a bevelled edge ring (256 segments), a hub and a "matrix" band whose profiles ripple by `.6 + .4·cos(3πt)`, plus `RingGeometry` front and back faces (220 segments); `discThickness .01`, `holeSize .14`, `hubSize .24` [verified, main.qdXy8l6N.js].
- **Procedural maps off the main thread:** front/back normal and roughness maps are computed in an inline Blob `Worker` (with a same-thread fallback) and cached per size [verified, main.qdXy8l6N.js `builders = { frontNormal, backNormal, frontRough, backRough }`].
- **Materials (all `MeshPhysicalMaterial`):** front clearcoat .8, roughness .42, metalness .48; back metalness 1, roughness .23, clearcoat .34, **iridescence 1, IOR 1.86, thickness range 140–900**, normal scale .5, env 1.5; edge roughness .04, metalness .55, clearcoat .7; hub **transmission .68**, IOR 2, thickness .6, clearcoat 1; a frosted inner ring at transmission `(1−.54)·.5` [verified, main.qdXy8l6N.js].
- **Lighting:** ambient .25; key directional `#FFF9E8` .75 at (3.5, −8, 6); fill .3 at (−5, −2, 4); rim `#499FF5` .75 from behind; one `RectAreaLight` strip 6 × .4 at intensity 1.9 above the camera [verified, main.qdXy8l6N.js]. The environment is **painted on a 1024 × 512 canvas** (a dark vertical gradient plus four soft white bands) and PMREM-filtered; no HDR file [verified, main.qdXy8l6N.js `Wt()`]. ACES filmic, exposure .86, sRGB output; fog white 7–14 [verified].
- **Camera:** perspective fov 40 at z 4.4; the gallery group, not the camera, is rotated −30° / −30° and scaled 1.08; spacing `hGap 2.3`, `depthGap 1`, inactive scale .8 [verified, main.qdXy8l6N.js].
- **Interaction:** a `Raycaster` for hover and click on per-disc pick meshes; drag with friction; touch has its own layout set (`touchGap 2.2`, `touchActiveScale 1.5`) [verified].
- **Render discipline:** a render-radius window of 5 discs; a pool of at most two `WebGLRenderer`s reused across Barba routes, the rest disposed with `forceContextLoss`; an idle-time prewarm builds a renderer, its PMREM target and compiles async before it is needed; `webglcontextlost` / `restored` handled; render stops when the tab is hidden [verified, main.qdXy8l6N.js].
- **Scribble:** an indexed ribbon `BufferGeometry` traced around the active disc: 24 jittered points (.028), 2 loops .045 apart, width .012, sweep .68, at 10 fps; in/out eases as arrays [verified, main.qdXy8l6N.js].

## 6. Weaknesses
- Reduced motion: **pass, partly.** `desktop-rm-s00` reads at rest; Lenis, parallax, dissolve and the preload gate are skipped; the gallery snaps instead of springing, yet the scribble still draws [verified, desktop-rm-s00.png; main.qdXy8l6N.js].
- Keyboard: **pass.** Carousel keys, an announcer, menu and trailer keys [verified]. Focus styling [unknown].
- DOM behind the canvas: **pass.** All 12 films are in the markup with an `sr-only` h1 [verified, index.html].
- Load gate: the CSS preload gate is capped at 20 s, skipped under reduced motion [verified]; repeat-visit skip [unknown].
- Phone: **designed.** Bottom nav bar, credits on top, a touch layout set; the reviews drop off the first phone frame, leaving a large empty band below the disc [verified, mobile-s00.png].
- Wayfinding: no visible position count (n / 12) on the home route; the Index dropdown is the only list [verified, desktop captures]. The wheel is captured, so a trackpad user cannot scroll past the gallery to anything else [verified, manifest].
- Weight: about 1.4 MB of uncompressed JS text for one gallery [verified, fetched sizes].
- The awards skills: show the position and count beside the active item, let reduced motion stop decorative strokes too, and ship the 3D chunk smaller than the gallery's art.

## 7. Principles
1. **Give the catalogue a physical format.** When every item is the same object type, the object itself becomes the template, and the art provides all the variety.
2. **Generate the object instead of loading it.** Simple turned forms built in code with procedural maps cost bytes of JavaScript, not megabytes of mesh, and can be retuned with a parameter.
3. **Keep the page achromatic so the work is the only colour.** A paper ground and one ink let each item's own art set the mood frame by frame.
4. **Turn the wheel into deliberate steps.** Filter noise, cap bursts and require a threshold, so one gesture moves exactly one item on every input device.
5. **Pool and prewarm GPU resources across routes.** Recycling a renderer and compiling during idle time removes the first-frame hitch without a loading screen.
6. **Expose the parameters.** One config object with data-attribute overrides makes the look tunable without touching the code.

## 8. Take / Don't take
- **Take:**
  - A spring snap on a float index (frequency 9.5, damping 12) for any stepped gallery, snapping instantly under reduced motion.
  - The wheel step detector's shape: noise floor, burst cap, envelope, threshold, sustain delay.
  - Lathe profiles with a ripple term for small turned objects; procedural normal maps in a Blob worker.
  - A canvas-painted strip environment through PMREM for studio reflections without an HDR file.
  - A carousel with `aria-roledescription`, a live announcer and Home/End beside the canvas.
  - A two-renderer pool and idle prewarm for a canvas that survives page transitions.
- **Don't take:**
  - The palette as literal values:
    `#f2f2f2` [verified, ExportPage.css]
    `#d6d3d1` [verified, ExportPage.css]
    `#891a20` [verified, ExportPage.css]
    `#FFF9E8` [verified, main.qdXy8l6N.js key light]
    `#499FF5` [verified, main.qdXy8l6N.js rim light]
    `#1A1E2A` [verified, main.qdXy8l6N.js disc back]
  - The optical disc as the item object, the tilted row and the hand-drawn ring: the signature as-is.
  - The credit table plus two caps review quotes as the layout, and the serif-caps / grotesque / spaced-label trio.
  - Any poster, title, review, credit or the distributor's mark.
  - The missing position count and the 1.4 MB of script: things to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack | high: index.html, ExportPage.css, bootstrap.js, main.qdXy8l6N.js, three.core.js read 2026-10-05 |
| Composition, phone, reduced motion | high: 15 captures |
| Motion and 3D parameters | high for config values read from source; runtime behaviour of each is [inferred] from minified code |
| Production and Television routes, 404 | unknown: not captured |

**Live pass 2026-10-05: reachable; capture exit 0.** The page hijacks the wheel (`scrollMode: wheel`), and the capture's wheel input stepped the gallery: frames differ (Backrooms → Lady Bird → Ex Machina), so no rerun was needed; the end of the row is reached by 50 %. Sources in `.awards/research/a24-raviklaassens/`: `desktop-s00…s100`, `mobile-s00…s100`, `desktop-rm-s00…s100`, `capture-out.json`, `index.html`, `ExportPage.css`, `main.js`, `bootstrap.js`, `main.qdXy8l6N.js`, `three.module.CFOTFKy5.js`, `three.core.js`, `RectAreaLightUniformsLib.DJtkkHJU.js`; `curl -sI` on two disc WebPs. `entry/desktop-s00/s50/s100.png` from awwwards.com/sites/a24 (capture exit 2, cookie wall).
