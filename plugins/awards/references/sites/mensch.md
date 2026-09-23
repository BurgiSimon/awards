# MENSCH — https://www.mensch.club/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | studio — a brand studio for startups, selling brands and "Brand OS" systems [verified, index.html `<title>` and meta description] |
| Visitor mode | persuade — *Learn More* / *See Work* pills under the statement, a Contact dialog in the nav [verified, desktop-s25.png; web-chrome.js `#mc-contact`] |
| Awards | Awwwards **Honorable Mention, 18 Aug 2026**; no aggregate axis scores published, fifteen individual juror rows with overalls from 6.40 to 9.90 [verified, entry page, `entry/entry.html`, `entry/desktop-s00.png`]. The site's footer links the entry [verified, web-chrome.js] |
| Corpus rating | D 7.2 / U 6.8 / C 7.0 / Co 6.5 → weighted 6.97, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | submitted by JonahKLewis [verified, entry page]; studio founded by Jonah Lewis in 2018 [verified, index.html meta description] |
| Stack (evidence level) | **hand-written vanilla JS**, plain `<script>` tags, no bundler or framework signature [verified, index.html] · **Lenis 1.1.14**, vendored, lazy-injected on fine pointers only [verified, src-lenis.min.js `var k="1.1.14"`; web-chrome.js] · hand-written **WebGL / WebGL2** soil shader [verified, mensch-soil.js `getContext('webgl2')`] · canvas-2D web components for WebP frame sequences [verified, lab-canvases.js] · no GSAP, Three.js or page-transition library [verified, grep of all fetched files] · Speculation Rules prerender on hover [verified, web-chrome.js] · Cookiebot consent [verified, index.html] · Vercel hosting [verified, DNS `vercel-dns-017.com`] · fonts self-hosted woff2 [verified, web-chrome.css `@font-face`] |
| Palette | page ground `--canvas`, warm rust near-black |
| | `#2A0800` [verified, tokens.css] |
| | recessed wells `--canvas-deep` |
| | `#1B0800` [verified, tokens.css] |
| | body ink `--ink`, cream |
| | `#EBE9D9` [verified, tokens.css] |
| | display ink `--ink-strong`, rationed to wordmarks, hero type and nav |
| | `#FFFFFF` [verified, tokens.css comment] |
| | the one accent `--accent`, orange (mark, caret, selection, focus ring) |
| | `#FB3F0C` [verified, tokens.css; desktop-rm-s00.png] |
| | word-fill start colour `--paper-dim` |
| | `#A09D85` [verified, tokens.css; index.html `GREY = [160,157,133]`] |
| | Strategy: **warm rust ground + cream ink + one orange accent, with a blurred sky video as the single cool field** and moss green living only inside the shader and the renders [verified, tokens.css; desktop-s00 to s100.png] |
| Type | **narrow grotesque display + grotesque body + blackletter accent** — Greed Narrow (Regular, SemiBold), Be Vietnam Pro (five cuts), UnifrakturCook Bold [verified, web-chrome.css `@font-face`; tokens.css `--font-display/-body/-black`]; fixed px text ramp 9 → 30 px with `clamp()` above it [verified, tokens.css] |
| WebGL dosage | moments — one procedural soil field drawn by two canvases (section bed and footer); the hero mark is a canvas-2D image sequence [verified, manifest.json `canvases: 3`; mensch-soil.js; lab-canvases.js] |
| Scroll model | native + Lenis 1.1.14 (`duration 1.05`, ease-out cubic) on its own rAF, desktop fine pointer only, never under reduced motion; fixed hero covered by the page; one sticky statement; an idle settle-snap across the first viewport [verified, web-chrome.js; index.html] |
| Narrative model | specification — sky hero with the mark → typed statement over soil → client ticker → four service cards → testimonial marquee → wordmark close [verified, desktop-s00 to s100.png] |

## 1. Concept and narrative
**One idea:** the brand grows. The name means a decent person, and the mark is a figure with arms out; in the hero it hangs in a blurred sky and cycles from bare glossy orange to overgrown with moss and flowers and back [verified, desktop-rm-s00.png vs desktop-s00.png; index.html comment on the 120-frame loop]. Below it the page turns into warm soil: a slow procedural field of rust and green that the pointer smears [verified, desktop-s25/s50.png; mensch-soil.js]. The entry states the idea as soil that greens and assets that flower [verified, entry page].

Beats: the sky and the mark with a *Scroll* pill and nothing else [verified, desktop-s00.png]; the soil rises over the fixed sky and a one-line title types itself after a fixed first word (*Brand Strategy.*, *Brand Partners.*), over a three-line statement that lights word by word [verified, desktop-s25.png, mobile-s25.png]; a bordered client-logo ticker [verified, desktop-s50.png]; *Services* as four cards, each a moss-covered mark on an orange gradient, a two-line description and a cloud of pill tags [verified, desktop-s75.png]; a row of testimonial cards with portraits [verified, desktop-s100.png]; a dictionary-entry footer line and a full-bleed white wordmark cropped at the bottom edge [verified, desktop-s100.png]. Register: short, plain, slightly irreverent (*startups that fix stuff*) [verified, meta description].

## 2. Structure and components
- **Boot loader**: a CRT screen on the rust ground — an orange wordmark with a glow, a `booting ▓▓░░ 87%` line and a block cursor, scanlines, a rolling bright band; click anywhere to skip; shown once per visitor (`localStorage`), removed outright under reduced motion [verified, index.html `#boot`]. Not seen in any capture.
- **Nav**: a bordered pill top left (3D wordmark image, current page, burger) and an *Info* pill top right; the stroke is dark over the sky and turns white once the soil covers the top 60 px [verified, desktop-s00/s25.png; index.html nav-stroke script]. The collapsed nav is `inert`; Escape closes nav, info and the contact dialog [verified, web-chrome.js].
- **Hero**: `position: fixed`, 100 svh; a muted looping sky video blurred 7 px and scaled 1.06, an SVG-noise grain layer, and the mark as `<mensch-m-spinner>` (120 WebP frames, 15 fps, `role="img"`) [verified, index.html].
- **Statement**: a sticky block centred in the viewport whose pin ends exactly where it settles, plus a spacer that keeps the next section peeking 25 px — so there is no dead hold [verified, index.html about layout script]. The typed title is `aria-hidden`; the page has one screen-reader-only `h1` [verified, index.html].
- **Client ticker**: logos built from a shared list, duplicated once, sized with intrinsic dimensions to avoid shift [verified, index.html].
- **Service cards**: four cards; each has a still poster and a loop that plays on hover (fine pointer) or while 55 % in view (touch) [verified, index.html]. The title glitches into blackletter [verified, desktop-s50.png].
- **Testimonials**: a marquee of six named quotes with portraits, pause on hover or hold [verified, testimonials.js; desktop-s100.png].
- **Footer**: its own soil canvas, a pronunciation line with three words in blackletter, six links, and the wordmark as inline SVG whose letters part around the hovered one [verified, web-chrome.js; desktop-s100.png].
- **Cursor**: a trail of fifteen copies of a small 3D-mark image; the system cursor is hidden on every element [verified, web-chrome.js].
- Not seen: the consent banner (it never rendered in a capture), the inner routes, the 404, the entry's "press M" music egg (no such handler on the home route) [verified, captures; grep of fetched files].

## 3. Visual language
- **Two worlds, one cut**: cool sky above, warm soil below; the soil section slides over the fixed hero with a hard horizontal edge [verified, desktop-rm-s25.png].
- **Accent discipline**: orange is the mark, the typed caret, the nav wordmark, the selection ground and the 2 px focus ring; everything else is cream or white on rust [verified, tokens.css; web-chrome.css `::selection`, `:focus-visible`].
- **Materials**: glossy extruded 3D mark versus grass-and-flower growth — the same object in two materials carries the whole brand [verified, desktop-s00.png, desktop-rm-s00.png, desktop-s75.png]. Film grain on the hero; hairline card borders with alpha light, not grey [verified, index.html; tokens.css comment].
- **Type**: Greed Narrow SemiBold for titles, Be Vietnam Pro for the statement and body, spaced caps on pills; UnifrakturCook only as punctuation — the timed title swap and three footer words [verified, captures; index.html `.uf`; web-chrome.js].
- **Layout**: centred single column for statement and titles; four equal service cards on desktop, stacked on the phone [verified, desktop-s75.png, mobile-s50.png].
- **Browser surfaces**: themed `::selection`; a PNG favicon; no `theme-color` or `color-scheme` meta [verified, index.html; web-chrome.css].

## 4. Motion and effects (with parameters)
- **Tokens**: `--ease: cubic-bezier(.16, 1, .3, 1)`; durations `.2s` / `.4s` / `.7s` for feedback / UI / entrances [verified, tokens.css].
- **Lenis**: `duration 1.05`, `easing 1 − (1 − t)^3`, `smoothWheel`, `wheelMultiplier 1`, `prevent` for any inner scroller that can scroll; its own rAF; skipped on coarse pointers and reduced motion. Its scroll event is re-dispatched as a native `scroll` behind a re-entrancy guard so plain listeners keep working [verified, web-chrome.js].
- **Hero recede**: smoothstep of `scrollY / vh`; the fixed hero rises up to 44 px and dims to .72 opacity; no scale, which would open edge gaps [verified, web-chrome.js].
- **Settle-snap**: after 160 ms without scroll input, a resting position inside the first viewport eases to whichever end is nearer (`lenis.scrollTo`, .7 s, `lock`); within 6 % of an end it does nothing; a 900 ms guard stops it re-arming; nothing runs while a pointer is down; off under reduced motion [verified, index.html].
- **Word fill**: each word goes from `#A09D85` to white in sequence (progress × (N + 6) − i), starting .45 vh before the pin and completing as the section top meets the viewport top; reduced motion sets the final colour [verified, index.html].
- **Typed title**: "Brand" fixed, six second words typed at 115 ms per character, erased at 58 ms, held 2.2 s, 400 ms gap; the first paint is already a full phrase; reduced motion shows the first word only [verified, index.html; desktop-s25.png caught mid-erase].
- **Blackletter glitch**: the *Services* title swaps to UnifrakturCook for 320 ms every 3.4–5.6 s [verified, index.html; desktop-s50.png].
- **Boot timing**: .62 s warm-up, the bar races to 87 % in 45 ms ticks, then holds until 20 spinner frames are decoded, capped at 2.5 s wall clock, then 100 % and a 420 ms exit; `crt-flicker` 4 s `steps(1)`, `crt-roll` 5.5 s linear on `transform` [verified, index.html].
- **Frame sequence**: a rolling window of 20 `ImageBitmap`s that follows the playhead and `close()`s what falls behind — 45 MB instead of the 273 MB a full 120-frame decode held; DPR capped at 3 [verified, lab-canvases.js comments].
- **Soil shader**: fbm (4 octaves) layers — clods, sub-soil, embers, specks, a jade mask — drifting at .013–.05 per second; `uScroll = scrollY / vh × .5`; DPR capped at 2; paused off-screen by IntersectionObserver; one static frame under reduced motion [verified, mensch-soil.js; index.html]. All canvases share one clock origin and one pointer simulation (32-point trail, decay .55, pull .012, damping .93) stepped once per frame, so section and footer canvases meet without a seam [verified, mensch-soil.js comments].
- **Pointer parallax**: lerp .08; sky video −12 / −8 px, scroll pill 6 / 4 px; off on touch and reduced motion [verified, mensch-parallax.js; index.html].
- **Footer wordmark**: the hovered letter holds, the others part by 52 viewBox units, `.4s` on the ease token [verified, web-chrome.js].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Build | static HTML, three stylesheets, six plain scripts, no bundler | [verified, index.html] |
| Scroll | Lenis 1.1.14 vendored (12.5 KB) | [verified, src-lenis.min.js] |
| GL | hand-written fragment shader, shared by home and footer | [verified, mensch-soil.js, 14.4 KB] |
| Sequences | custom elements drawing transparent WebP frames to an alpha canvas | [verified, lab-canvases.js] |
| Media | sky video with poster; four service loops `preload="none"` with posters | [verified, index.html] |

- 799 DOM nodes; CLS .0066 desktop, .0051 phone; no console errors or failed requests [verified, manifest.json, desktop-retry/manifest.json]. `lcpColdSynthetic` is a headless artefact, not a performance claim.
- The source comments record the boot roll moved from `top` to `transform` after it had caused the page's whole CLS [verified, index.html comment].
- Asset weights of frames and videos [unknown] — not fetched.

## 6. Weaknesses
- Reduced motion: **pass**. Boot removed, Lenis, parallax, cursor and settle off, word fill and typed title at their final state, the soil one still frame; the page reads at rest [verified, index.html; web-chrome.js; desktop-rm-s00/s25.png].
- Keyboard: **partial**. Real buttons with `aria-expanded`, an `inert` collapsed nav, Escape everywhere, a 2 px orange focus ring [verified, web-chrome.js/css]. No skip link and no `<main>` landmark [verified, index.html; web-chrome.js].
- DOM behind the canvas: **pass** — canvases are `aria-hidden` decoration; all copy is in the HTML [verified, index.html].
- Load gate: **pass with a cost** — once per visitor, click-to-skip, capped; roughly 1.5–4 s on a first visit [inferred, from the timings in §4].
- Phone: **designed** — stacked service cards whose loops play in view, the nav pills kept, the soil smear following touch [verified, mobile-s00 to s100.png; index.html; mensch-soil.js].
- Wayfinding and conversion: **weak**. The first viewport has no headline and no action, only the mark and *Scroll*; the actions wait on the second screen, and the home shows no work [verified, desktop-s00/s25.png].
- The hidden system cursor plus a fifteen-image trail on every element trades precision for flavour [verified, web-chrome.js].

What the awards skills do differently: a skip link and a `<main>`; a first viewport that names the offer and carries one action; a custom cursor that augments the system cursor instead of hiding it `[pattern:cursor-and-pointer#two-speed-cursor]`; work on the home route.

## 7. Principles
1. **Change the material, not the position.** A mark that cycles between two materials (bare and grown) states the promise in the first viewport without a sentence.
2. **One field under every canvas.** When several canvases draw the same surface, give them one clock and one pointer simulation so their edges never show.
3. **Settle, never seize.** Finish a transitional band only after the gesture has ended, at the page's pace, and never while a pointer is down.
4. **A second voice as punctuation.** An accent face that appears for a beat, on a timer or on three words, gives character without a second system.
5. **Bound memory by the playhead.** A rolling window of decoded frames, with the loader gated on that same window, keeps a sequence smooth without holding it whole.

## 8. Take / Don't take
- **Take:**
  - The settle rule: 160 ms of quiet, a 6 % dead zone at each end, the nearer end, ≈ .7 s, a guard longer than the tween `[pattern:motion-vocabulary#scroll-philosophies]`.
  - A pin that ends exactly where its content settles, with a separate spacer that sets how much of the next section peeks.
  - A shared-origin clock and a once-per-frame pointer step for every canvas that samples one field `[pattern:webgl-architecture#unifier-versus-narrative-shaders]`.
  - Rolling-window `ImageBitmap` decoding for any sequence over ≈ 30 frames `[recipe:image-sequence-scrub]`.
  - Reduced-motion paths that jump each scroll-driven effect to its final state `[recipe:reduced-motion-switch]`.
- **Don't take:**
  - The palette as literal values:
    - `#2A0800` [verified, tokens.css]
    - `#EBE9D9` [verified, tokens.css]
    - `#FB3F0C` [verified, tokens.css]
    - `#A09D85` [verified, tokens.css]
  - The figurative M that flowers, soil and moss as the brand world, the sky-over-soil split.
  - A blackletter swap as a signature; the dictionary-definition footer line; the "Brand ___." typed title.
  - The CRT boot screen as drawn.
  - An empty first viewport and a hidden system cursor: these are what to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML, tokens.css, web-chrome.css/js, the vendored Lenis |
| Award and credits | high for the Honorable Mention, its date and the submitter (entry page); no aggregate scores published |
| Concept, structure, visual language | high — five desktop, five phone and five reduced-motion states |
| Motion parameters | high — read from inline scripts and the vendored modules |
| Weaknesses | high for reduced motion, keyboard and DOM; the load gate is from source arithmetic, never observed |

**Live pass 2026-09-23: reachable, capture exit 2.** The first pass rendered phone and reduced-motion frames, but all five desktop frames timed out at 30 s under SwiftShader, most likely from the animated full-viewport shader. One retry (`--only desktop --timeout 90000 --wait 6000`) into `desktop-retry/` rendered all five, `scrollMode: native`. No wheel retry was needed. Sources in `.awards/research/mensch/`: 15 captures + two manifests; `index.html`; `src-tokens.css`, `src-chrome.css`, `src-web-chrome.css`, `src-web-chrome.js`, `src-lab-canvases.js`, `src-assets_vendor_mensch-soil.js`, `src-assets_vendor_mensch-parallax.js`, `src-assets_testimonials.js`, `src-cookies.js`, `src-lenis.min.js`. Award entry `awwwards.com/sites/mensch` (linked from the footer) captured desktop-only into `entry/` (exit 2, cookie wall) plus `entry/entry.html`. Not observed: the boot loader, the consent banner, hover states, the open nav, inner routes, the 404.
