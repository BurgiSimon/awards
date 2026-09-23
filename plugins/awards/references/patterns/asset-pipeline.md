# Asset pipeline

What this file is for: how the corpus turns gigabytes of DCC output into single-digit megabytes on the wire — the formats, the encoders, the budgets and the loading order — so that a cinematic scene ships at the weight of a hero image. Numbers come from the cards that published or exposed them; where a card is silent on formats (Oryzo, Slosh Seltzer, Trevor Noah, Seasats, Son Daven) this file says so instead of guessing. Cite as `[pattern:asset-pipeline#section]`.

## Image direction before export

For each hero or editorial image, specify the subject, light, perspective, material, focal point, text-safe area and intended mobile crop before production. Check the crop with actual copy and action at both widths; use a distinct phone source when one crop cannot preserve the subject. `recipes/_shared/composition/ASSETS.md` documents these decisions for the synthetic Alder Workshop example. Adapt the questions, not its imagery or art direction. The delivery formats and budgets below still apply.

## The pipeline

Why: a scene is cheap or expensive at export time, not at runtime. Every heavy winner with readable assets runs the same chain, and none of them feeds a PNG to a shader.

```
Blender / Cinema 4D / Houdini
  → glTF (.glb)   — Draco (or meshopt) geometry; quantised attributes; unused data pruned
  → KTX2 textures — ETC1S for colour, UASTC for normal / roughness / data maps; mipmapped
  → atlases       — one texture per material set; UI glyphs and icons as data textures
  → workers       — Draco, Basis, EXR, audio and MSDF decoded off the main thread
```

Evidence: Draco geometry, KTX2/ETC1S textures and atlases out of Blender is the Why Zero recipe [site:why-zero] [verified, Codrops]; Igloo's manifest holds 19 Draco `.drc` files and 36 KTX2 textures and nothing else but a favicon [site:igloo] [verified]; Léo Parpeix exports Blender to Draco-compressed glTF [site:leo-parpeix] [verified tags + clone]; Lando registers DRACO, GLTF, RGBE and KTX2/Basis loaders, though its shipped textures are all WebP [site:lando-norris] [verified, live source 2026-09-18]; Mont-fort ships a KTX2 loader in its own chunk beside `.glb` models and an EXR HDRI [site:mont-fort] [verified]. UASTC for data maps is the plugin's rule, not a card's — the cards name ETC1S only [inferred: ETC1S's block quantisation is visible on normal maps]. Meshopt appears on no card as used (one bundle carries the decoder [site:primesec] [verified]); the audit accepts either compressor [P03]. Later cards run the same chain [verified on each]: six baked states packed as one KTX2 array texture with a self-hosted Basis transcoder [site:pensatori-irrazionali]; KTX2 and Basis in its own chunk [site:jesperlandberg]; a Draco site model with KTX2 support in a lazy chunk [site:likova]; glTF, Draco and KTX2 under R3F [site:haoqi]; a Draco scene in two weights by viewport [site:primesec].

## Budget stories

Why: two cards give the whole argument in numbers.

- Why Zero: more than 1 GB of source assets shipped as under 10 MB, in a four-month build whose case study counts the budget as craft [site:why-zero] [verified].
- Igloo: entry bundle 16 KB (≈ 6 KB gzipped); the 3D app 1.45 MB (≈ 420 KB gzipped); the full landscape texture set 625 KB; the music bed ≈ 1.5 MB; a pure-CSS loader that paints before any framework; four workers (`audio`, `bitmap`, `exr`, `msdf`) decoding off-thread [site:igloo] [verified sizes and files]. Site of the Year at a scene cost under half a megabyte gzipped is the calibration point for every budget below.
- The 2026-09-23 wave, both ways [verified, fetched sizes on each card]: about 92 KB of CSS and JS for a whole SvelteKit route [site:alectear]; ≈ 165 KB of text for a five-panel site with a WAAPI fallback [site:christoph-nagel]; the renderer and a rasteriser (≈ 935 KB raw) loaded only when the one transition that needs them first runs [site:nodeck]. Against them: Three.js inside a 1.1 MB entry module [site:jesperlandberg] and a 903 KB chunk loaded up front [site:haoqi]; a 2.39 MB desktop model [site:primesec]; one 1.44 MB stylesheet for every route [site:okaydev]; a 928 KB HTML document with the whole catalogue inlined as JSON [site:serotoninn]; a 1.07 MB document preloading six srcsets, two KTX2 sequences and a wasm transcoder at high priority [site:pensatori-irrazionali].

## Geometry

- Draco or meshopt on every mesh; quantise positions and normals; prune unused attributes; weld and dedupe with `gltf-transform`. Hero objects stay small: the inertia recipe asserts no glb over 300 KB `[recipe:gl-hero-object-inertia]`; a third-party checklist for Shopify puts hero models under ≈ 5 MB compressed and supporting assets under ≈ 2 MB [site:shopify-editions-w26] [recalled medium-low] — a ceiling for a flagship scene, not a target.
- Bake simulations, never run them: Igloo's smoke, shatter and particle bursts are Draco geometry replayed in the browser, and its 32³ / 64³ volumes are KTX2 atlases from a custom VDB exporter [site:igloo] [verified manifest; exporter recalled high]. Anything the visitor cannot influence is precomputed.
- Bake lighting where the camera path is known: Mont-fort's terrain carries a baked lightmap and one EXR HDRI, with Perlin and Voronoi noise textures doing the detail [site:mont-fort] [verified files].
- Ship the decoders yourself (`public/decoders/{draco,basis}/`) and call `KTX2Loader.detectSupport(renderer)` before the first load (`stacks/three-0.186.md`).

## Textures

| Rule | Evidence |
|---|---|
| KTX2 for anything a shader samples: it stays compressed on the GPU and transcodes to the device's own format | [site:igloo] 36 KTX2, zero PNG/JPG [verified]; [site:why-zero] ETC1S [verified]; [site:shopify-editions-w26] texture compression for 60 fps on mobile [recalled high] |
| Tier textures by capability, not width. A width key gives a narrow desktop phone textures and a wide low-VRAM device the heavy ones | `[site:lando-norris]` was the source for this, keyed on `innerWidth`; the 2026-09-18 live pass found only `/webp/` paths in its GL manifest, so the attribution no longer holds and the rule stands on its own [unknown]. Branch on `WEBGL_compressed_texture_*` support and `deviceMemory` |
| 1024–2048 px per map; environment maps PMREM'd at 1K | [site:shopify-editions-w26] [recalled medium-low, third-party] |
| Icons and UI glyphs as data textures when the UI lives in the scene | [site:igloo] `ui/*-datatexture.ktx2` [verified] |
| Colour maps sRGB, data maps linear, mipmaps on | `stacks/three-0.186.md` |

## Video and volumes

- Cross-browser transparent video: stack RGB and alpha as two halves of one video and split them in a WebGL2 shader; volumetric light from video via KTX2 array textures rendered as ray-marched boxes; a custom point-cloud format with quantised positions and chroma subsampling — all from the Shopify sibling release [site:shopify-editions-w26] [recalled high for Spring '26; indicative only for Winter '26].
- Hero video: the poster frame is the LCP, `muted playsinline`, streamed after first paint, paused off-screen [site:lama-lama] [take, inferred] [A10]. The Line places a local red multiply acetate over selected full-colour imagery [site:the-line] [verified]; if a project chooses desaturation, pre-grade sources when practical to avoid a live video filter.
- Defer third-party players: Vimeo behind a lazy global, off the critical path [site:lando-norris] [verified].
- Gate video on capability and visibility: a 480p MP4 per still, mounted by `IntersectionObserver` with `rootMargin: "0px 150px"` only for `(hover: hover)` without reduced motion [site:boc] [verified]; 34 muted looping 1082 × 636 MP4s held in `data-src` until the reel approaches [site:wodniack] [verified].
- Newer video handling [verified on each card]: separate scrub encodes for desktop and mobile rather than one file scaled down [site:gehry-getty]; two `<video>` buffers with only the active clip loaded and the next on `preload="none"` [site:christoph-nagel]; HLS through hls.js with an eager poster `<img>` [site:warmnfuzzy]; loops with posters and `preload="none"` that play on hover or in view [site:mensch]; a `currentTime` scrub whose last frame is `duration − .05` [site:goats]; a reflection clip re-synced to its master when drift passes .08 s [site:noth]; video played only on the active carousel card and GIFs swapped to stills elsewhere [site:robbietilton]. Misses: a dozen category MP4s requested at boot [site:serotoninn]; every catalogue image on a third-party host that stopped resolving [site:the-boyd].

## Sequences

Why: a pre-rendered frame sequence buys the "3D site" read with no runtime GL. Seasats' Cinema 4D renders scrubbed on scroll are the corpus example [site:seasats] [inferred medium]; the basement stack ships an `ImageSequenceCanvas` for exactly this [site:usavionix] [verified repo].

Rules (`[recipe:image-sequence-scrub]`): encode with `ffmpeg` to WebP or AVIF frames at display size (one set for desktop, a smaller set for phones); 60–120 frames per beat; preload the first beat and stream the rest; draw from decoded `ImageBitmap`s to a 2D canvas; a poster `<img>` under the canvas is the static tier. Seasats' frame counts and sizes are unknown.

Past ≈ 30 frames, keep a rolling window of decoded `ImageBitmap`s that follows the playhead and `close()`s what falls behind — 20 of 120 frames held, 45 MB instead of 273 MB — and gate the loader on that same window [site:mensch] [verified]. A sequence can also be N baked states in one KTX2 array, chosen per pixel by a shader instead of by time [site:pensatori-irrazionali] [verified].

## Images

- AVIF or WebP; rasters under 1 MB [P02]; `width` and `height`, `sizes`, `loading="lazy"` below the fold and `fetchpriority="high"` on the LCP image [P01]. Léo Parpeix lazy-loads WebP in its carousel [site:leo-parpeix] [recalled medium]; Mont-fort's textures are WebP with KTX2 beside them [site:mont-fort] [verified].
- Placeholders under GL planes are real images with `alt` (`[pattern:webgl-architecture#html-lays-out-webgl-renders]`); a probe-then-reveal slot fades media in only when it loads [site:seasats] [clone-described].
- Hold each slot with its own low-resolution colour field: a 32 × 32 blurhash decoded to a canvas, the image lazy-loaded at a .05 threshold and faded in over .5 s [site:alectear] [verified]. Ask for `img.decode()` before a reveal, and reserve section heights in the critical CSS so scripts cannot shift the layout [site:okaydev] [verified]. A separate `-mobile` source per card through `<picture>` [site:robbietilton] [verified].
- Misses on record [verified on each card]: zero `loading="lazy"` across 186 images [site:likova]; 83 `fetchpriority="high"` hints [site:spasoje]; the same greyscale image repeated in every cell of a pixel reveal, 285 duplicates [site:runrobrun].

## Fonts

Self-hosted woff2 subsets, at most four files and 400 KB, `font-display` set, a metric-matched fallback with `size-adjust` so lines do not reflow when text re-splits [T02] [T05] [T06] [P05]. Every readable winner self-hosts: Floema six files across two families [site:floema-jewelry] [verified]; Lando a variable Mona Sans plus Brier [site:lando-norris] [verified]; Mont-fort three files [site:mont-fort] [verified]; The Line one variable `DenimVF.woff` — a variable file is the cheapest route to several weights, but ship it as woff2 [site:the-line] [verified]. Why Zero serves through the Google Fonts API [site:why-zero] [verified], the one exception and exactly what T02 flags. Preload the two files above the fold; split text only after `document.fonts.ready`.

## Budgets

| Item | Budget | Source |
|---|---|---|
| Entry JS, the shell | ≈ 20 KB gz | [site:igloo] 6 KB gz entry [verified]; the plugin rounds up |
| JS before the GL chunk | ≤ 200 KB gz (the audit fails at 300) | [P04] |
| GL chunk + first scene | ≤ 500 KB gz, lazy | [site:igloo] ≈ 420 KB gz [verified] |
| Textures per scene | ≤ 700 KB | [site:igloo] 625 KB landscape set [verified] |
| Hero mesh | ≤ 300 KB glb | `[recipe:gl-hero-object-inertia]`; Shopify's ≈ 5 MB ceiling [recalled medium-low] |
| Whole 3D narrative | single-digit MB | [site:why-zero] < 10 MB [verified] |
| Any raster | < 1 MB | [P02] |
| Fonts | ≤ 4 files, ≤ 400 KB | [P05] |
| Audio bed | ≈ 1.5 MB, fetched after consent | [site:igloo] [verified]; `[pattern:sound#opt-in-only]` |
| LCP | ≤ 2.5 s on a throttled 4G profile, from a poster or DOM text | plugin rule; Igloo ≈ 1 s [recalled low] |

Measure gzipped or brotli sizes from the build output, never source sizes; `scripts/audit.mjs` checks the budgets that have a static rule and the rest are checked by hand before the jury.

## Tooling

| Tool | Job | Version |
|---|---|---|
| `@gltf-transform/cli` | `optimize`, `draco` / `meshopt`, `resize`, `prune`, `dedup`, `weld`; `etc1s` / `uastc` call `toktx` | 4.5.0 [pinned, `stacks/versions.md`] |
| `toktx` (KTX-Software) or `basisu` | encode KTX2: `--encode etc1s` for colour, `--encode uastc` for data maps, `--genmipmap` | not pinned; check the release you install |
| `ffmpeg` | frame sequences to WebP/AVIF; stacked RGB + alpha video; audio normalisation | not pinned |
| Blender / Cinema 4D / Houdini | authoring; Houdini for offline simulation | [site:igloo] [recalled medium]; [site:seasats] [verified tag]; [site:leo-parpeix] [verified tag] |
| Draco decoder and Basis transcoder WASM | shipped locally, never from a third-party CDN | [site:igloo] [verified manifest]; [site:leo-parpeix] [clone] |

## Staged loading

Why: the preloader needs a real signal, and the signal is only honest when the stages are real (`[pattern:preloaders-and-transitions#the-load-contract]`).

1. HTML, tokens and a CSS-only loader: paints before any framework [site:igloo] [verified].
2. The shell entry (≈ 20 KB): fonts, Lenis, the score, the preloader logic.
3. First-scene assets: the hero glb, its textures and the two fonts above the fold — this `Promise.all` plus `document.fonts.ready` resolves the counter, holds it at 100, and lets it exit.
4. Neighbour scenes: streamed by scene window or `IntersectionObserver`, decoded in workers.
5. Everything else on idle — or nothing: Floema decoded every route's textures before the first frame, its worst decision [site:floema-jewelry] [verified]; the audio bed only after consent.

Repeat visits skip the sequence (`sessionStorage`); a timeout shows the page with the static tier; failures isolate to one scene.

Stage 4 in practice [verified on each card]: a 3D viewer mounted once inside a `rootMargin: '1000px 0px'` observer, a still in the layout until then [site:to-top]; a GL plate mounted within 300 px of the viewport and asleep on `visibilitychange` [site:pensatori-irrazionali]; the smooth-scroll library itself lazy-injected, and only for fine pointers [site:mensch]; scene modules loaded on demand outside the bundle [site:runrobrun].

## Verify

- [ ] Every mesh Draco or meshopt; every sampled texture KTX2 with the right encoder per map type; decoders self-hosted.
- [ ] Nothing simulated at runtime that the visitor cannot influence.
- [ ] Texture tier chosen by GPU capability and memory, not viewport width.
- [ ] Entry ≈ 20 KB gz, GL chunk lazy and ≤ 500 KB gz, textures ≤ 700 KB per scene, rasters < 1 MB, fonts ≤ 4 files.
- [ ] Images carry dimensions, `sizes`, `loading` and modern formats; video has a poster and is muted, inline and paused off-screen.
- [ ] Fonts self-hosted woff2 with `font-display` and `size-adjust`; no CDN link.
- [ ] Load stages 1–5 real; the preloader gates on stage 3 only; repeat visits skip.

## Refuse

- PNG or JPG into a shader; a 50 MB glb; a texture above 2048 px because it looked soft.
- Runtime particle or fluid simulation for a moment that never answers the visitor.
- Width-keyed texture formats; a decoder pulled from a CDN at runtime.
- Loading every route's assets before the first frame; a preloader gated on a timer.
- Google Fonts or a foundry `@import`; more than four font files.
- A music bed fetched before consent [site:the-boyd] [verified].
- Media on a host the site does not control [site:the-boyd]; libraries loaded unpinned as `@latest` [site:wearedirect]; one library at two versions on one page [site:to-top] [site:primesec] [verified].
- Igloo's asset names, Why Zero's atlases or Mont-fort's texture set as a starting kit.
