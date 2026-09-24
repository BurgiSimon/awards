# Nothin' — https://www.noth.in/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | studio — a Paris creative studio for fashion and luxury: branding, editorial, art direction, AI [verified, index.html meta description; desktop-s00.png "Creative studio in Paris"] |
| Visitor mode | persuade — a Calendly "book a call" pill in the first viewport and again at the close, plus a mailto [verified, index.html `calendly.com/sara-noth/30min`, `mailto:`; retry/desktop-s00.png, desktop-s100.png] |
| Awards | Awwwards **Site of the Day, 10 Aug 2026, 7.45**: Design 7.58 / Usability 7.24 / Creativity 7.60 / Content 7.23. **Developer 7.24**: Semantics 6.80, Animations 8.00, Accessibility 6.80, WPO 7.20, Responsive 7.40, Markup 7.20 [verified, entry page, `entry/entry.html`] |
| Corpus rating | D 7.4 / U 6.4 / C 7.2 / Co 6.8 → weighted 7.00, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | dev Thomas Carré, design Pierre Patrault, visuals Guillaume Perrette, founder Sara Guedj [verified, index.html console banner + footer; entry page credits] |
| Stack (evidence level) | **Webflow** shell (CMS, hosting, jQuery 3.5.1) [verified, index.html `data-wf-site`, `webflow.schunk.*.js`, `getent hosts` → `cdn.webflow.com`] · an injected **Vite ESM engine** from Netlify, with a `?dev` switch to `localhost:3000/@vite/client` [verified, index.html inline loader → `nothinv1.netlify.app/main.js`] · **GSAP 3.13.0** with ScrollTrigger, Flip, SplitText [verified, main.js `version:"3.13.0"`, `data-flip-id`, `getState`, SplitText's `wordDelimiter`/`reduceWhiteSpace` options] · **Lenis 1.2.3** [verified, main.js `"1.2.3"` beside the Lenis options] · **Three.js r184** for one fluid canvas [verified, main.js `"184"`, `WebGLRenderer`] · **@unseenco/taxi** page transitions, version [unknown] [verified, main.js `data-taxi-view`, `A transition is currently in progress`] · Bunny CDN video [verified, index.html `noth-in.b-cdn.net`] · GTM, GA4, Metricool [verified, index.html] · **PP Neue Montreal** (7 weights) + **IBM Plex Mono** 400 via Google WebFont loader [verified, CSS `@font-face`; index.html `WebFont.load`] |
| Palette | two tokens only, `--black: black` and `--white: white` [verified, nothin-preprod.webflow.shared CSS] |
| | black ground and white ink for every section after the hero: `#000` [verified, CSS `--black`; desktop-s25 to s100.png] |
| | white hero ground under a black wordmark: `#ffffff` [verified, main.js `baseBg:"#ffffff"`; retry/desktop-s00.png] |
| | Strategy: **pure black/white, one inversion (white hero → black body); all chroma outsourced to renders and client work** (chrome-blue foil, pink putty, a pink beach ball) [verified, desktop-s75.png, retry/desktop-s50.png] |
| Type | **grotesque + mono labels + path-per-letter SVG wordmark**: PP Neue Montreal for statements, nav and the close; IBM Plex Mono for project tags; the NOTHIN' wordmark as one SVG with a `path` per glyph, which the loader animates [verified, CSS, index.html `nothin-hero-svg`, main.js `path:not(.nothin-apos)`] |
| WebGL dosage | moments — one Three.js canvas, the hero's fluid-dye reveal mask; the "3D" objects are pre-rendered images [verified, manifest.json `canvases: 1`; main.js `mask-reveal-canvas`; index.html `.formes-w` `<img>`] |
| Scroll model | native + Lenis 1.2.3 (duration 1.2, expo-out, `smoothTouch: false`) on its own rAF, not the GSAP ticker; ScrollTrigger pins one chapter and scrubs the rest [verified, main.js; manifest.json `scrollMode: native`] |
| Narrative model | gallery — wordmark hero → one-line thesis → five featured works with "view all (08)" → framed manifesto film → studio statement → services over an object toy → people → marquee → contact close [verified, index.html text order; desktop and retry captures] |

## 1. Concept and narrative
**One idea:** the name as a paradox, "nothing" as an empty space that can become anything [verified, index.html studio paragraph]. The page acts it out: a blank white page holding only a giant black wordmark, which the pointer wipes away to show moving film behind it (§4).

Beats: the white wordmark hero with a two-line thesis top-left and one black CTA pill [verified, retry/desktop-s00.png]. Then a hard cut to black, with work tiles in an uneven two-up grid, each titled by a mono tag and a one-line sentence [verified, retry/desktop-s25.png]. Next a full-bleed film of an inflatable in a lift, with a sound toggle [verified, retry/desktop-s50.png], and a surrealist tinsel-suit clip in a waiting room [verified, desktop-rm-s50.png]. Then services under a display-size "perspective." with chrome-foil renders and scattered wordmark letters [verified, retry/desktop-s75.png]. The close is a two-line invitation, two pills, socials and credits [verified, desktop-s100.png]. The register is short aphorism, bilingual in spirit, ending on "Let's start from nothin'" [verified, desktop-s100.png].

## 2. Structure and components
- **Preloader**: a small "N" mark rises, a strip of loader images flickers inside a widening window (1 rem → 20 rem, 10 rem under 992 px), and a three-digit counter counts **down** from 100 to 000 [verified, main.js `loader-nbr-w`, `padStart(3,"0")`; desktop-s00.png caught it mid-run]. Skipped for the rest of the session through `sessionStorage` [verified, index.html inline guard + main.js `nothin:loader-played`].
- **Header**: small N' logo left, `MENU ::` right; the menu opens a fullscreen overlay with works / studio / contact [verified, index.html `menu-w`; captures]. The menu trigger is a `div`, not a button [verified, index.html `menu-btn`].
- **WORKS title bar**: the five letters sit spread across a thin row under the logo, then fly into a second layout as the section scrolls (§4) [verified, desktop-s25.png, main.js `works-word-block-state1/2`].
- **Work tiles**: clip-path reveals, per-tile parallax, a cursor badge that follows the pointer inside each link [verified, main.js `cursor-work`].
- **Showreel** that shrinks from full frame into a small window, desktop only [verified, index.html `section showreel`; main.js].
- **Manifesto in a museum frame**: a pinned film on a photographed gallery wall, plus a second "reflection" video kept in sync with it (§4) [verified, index.html `musee-w`, `NOTHIN_MANIFESTE_REFLECT_H265.mp4`].
- **Sound toggle**: a pill that fades the film's volume in and out; a `div` with a click listener [verified, index.html `btn-sound`; main.js].
- **Object toy**: pre-rendered foil flower, bubble-wrap heart, candy, putty scoop and N-O-T-H-I-N letters that flee the pointer (§4) [verified, desktop-s75.png; main.js `.formes-w`].
- **Close**: invitation line, call and email pills, LinkedIn / Instagram / Behance, a three-part credit strip, EN switch; the phone adds a full-width wordmark [verified, desktop-s100.png, retry/mobile-s100.png].

## 3. Visual language
- **Two grounds, one flip.** The hero is the only white field; everything after is black with white type [verified, retry/desktop-s00 to s100.png]. No accent colour in the chrome at all; the renders carry saturated blue and pink as material, not as tokens [verified, desktop-s75.png].
- **Materials**: inflatable, foil, tinsel, bubble wrap and candy wrapper, all shiny and tactile, set against pure black [verified, desktop-s75.png, desktop-rm-s50.png].
- **Type scale**: rem steps from .75 to 5 rem in CSS; statements are sentence case at modest size and uppercase labels in the pills; the scale jumps only for the wordmark (full width) and the "perspective." heading [verified, CSS `font-size` counts; captures].
- **Layout**: 18 px outer gutter, content blocks offset to a centred ~65 % column for project copy, tiles hung asymmetrically to the edges [inferred, from desktop-s25.png].
- **Browser surfaces**: separate light and dark favicons by `prefers-color-scheme`; no `theme-color` [verified, index.html].

## 4. Motion and effects (with parameters)
- **Fluid-dye reveal mask (the signature)**: the wordmark SVG is rasterised onto a white texture as the base layer; the reveal layer is transparent, so wherever pointer splats leave dye the white page opens onto a looping video behind the canvas [verified, main.js `mx()` → `setLayers({base: svg, baseBg:"#ffffff", reveal:"rgba(0,0,0,0)"})`, `video-hero-bg`]. Settings: sim 256², dye 512², velocity dissipation .962, dye dissipation .988, 20 pressure iterations, curl 0, splat radius 6e-5, splat force 5900, reveal size 3.9, edge softness .5, edge width .01; mask `smoothstep(edgeSoftness, edgeSoftness + edgeWidth, dye × revealSize)`; DPR capped at 2; no antialias [verified, main.js `fA`, mask fragment shader, `_buildRenderer`].
- **Load sequence**: image flicker for a fixed 5000 ms at a gap that eases 500 → 100 → 500 ms along a sine (fastest mid-run); counter tween `power2.inOut`; the window then collapses and the loader's height tweens to 0 over 1.8 s `power4.inOut` [verified, main.js `hM`, `O_`, `gM`]. Hero letters rise from `yPercent: 120` in **random order**, 1.8 s `power4.inOut`, stagger .07; the apostrophe pops last with `back.out(0.9)` at 1.5 s [verified, main.js `tf`].
- **Pointer repulsion field**: each object inside 460 px of the pointer (260 px under 768) is pushed along the pointer-to-object angle by up to 380 px (110 px) with falloff `((R − d)/R)^1.6`, rotated by up to 30° (12°) and scaled up to +.2 (+.1), `.45s power4.out`; outside the radius it springs home with `elastic.out(1, .35)` over 1.2 s [verified, main.js `Kv`].
- **Scroll-scrubbed Flip**: `Flip.getState` on the five WORKS letters, reparent them into the second layout, `Flip.from` with `power4.inOut`, 1.4 s, stagger .2 from the end, `repeat: 1, yoyo`, and each letter dips to scale .2 and back; the timeline is scrubbed by a ScrollTrigger over the section, `scrub: 3` [verified, main.js `qv`].
- **Framed manifesto**: pinned for one viewport; the video scales 1.4 → .35 while the wall photo scales 1.8 → 1, `ease: none`, `scrub: 1`, ≥ 992 px only; the reflection video is re-synced whenever drift passes .08 s; sound fades in over .35 s on toggle, and out over 1.6 s after a 1.4 s delay when the section leaves [verified, main.js `ux`].
- **Work tiles**: clip-path open `power4.inOut` 1 s at `top 88%`; tile `y` scrub 1.5, inner image `yPercent −5 → −20` scrub 3; cursor badge lerp .09 per frame, in with `back.out(1.8)`, out `.38s power3.in` [verified, main.js].
- **Showreel shrink**: width and height 100 % → 33.3 % × 35 %, `power4.inOut`, scrub 3 [verified, main.js `Ev`]. It animates layout properties, not a transform.
- **Route transitions**: taxi with Lenis `scrollTo(0, {immediate: true})` and a full teardown and re-init list on `NAVIGATE_END` [verified, main.js `FC`].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Shell | Webflow page, CMS collections, jQuery 3.5.1 | [verified, index.html] |
| Engine | one 752 KB IIFE bundle from Netlify, injected by an inline loader; Vite dev server behind `?dev` | [verified, index.html, main.js size] |
| Motion | GSAP 3.13.0 + ScrollTrigger + Flip + SplitText; Lenis 1.2.3 on its own rAF | [verified, main.js] |
| GL | Three.js r184, one canvas, fluid FBO ping-pong + mask plane | [verified, main.js] |
| Transitions | @unseenco/taxi | [verified, main.js] |
| Media | four MP4s from Bunny CDN, one of them H.265 | [verified, index.html] |

- 1,034 DOM nodes on desktop; no console errors; failed requests are aborted MP4 ranges and analytics beacons from the headless run [verified, manifest.json]. CLS read 1.23 on desktop in both passes [verified, manifest.json]; likely the pin spacer and late media, not measured further [inferred].
- Mobile screenshots timed out at several states in both passes while video decoded [verified, manifest.json `pageErrors`].
- `lcpColdSynthetic` is a headless cold-cache artefact, not a performance claim.

## 6. Weaknesses
- Reduced motion: **fail**. No `prefers-reduced-motion` query in main.js or either CSS file [verified, grep]; the fluid mask, the flicker loader, the scrubs and the pin all run unchanged. The hero does read at rest [verified, retry/desktop-rm-s00.png, identical to retry/desktop-s00.png].
- Keyboard: **fail on chrome**. The menu trigger and the sound toggle are `div`s with pointer listeners, and there is no skip link, no `h1` and no `main` element [verified, index.html]. CTAs are real links [verified, index.html].
- DOM behind the canvas: **pass**. The canvas only masks the wordmark; the SVG and every text block are in the markup [verified, index.html].
- Load gate: **partial**. The loader runs a fixed 5 s timer, not a load signal, before its own exit; it is skipped for the rest of the session [verified, main.js].
- Phone: **designed**. The hero wordmark centres, menu becomes a dot glyph, pills stack and the close gains a full-width wordmark; the fluid mask and repulsion answer only to a pointer, with no touch variant [verified, mobile-s00.png, retry/mobile-s75/s100.png; main.js].
- Content hygiene: Webflow's default "This is some text inside of a div block." ships inside the loader, the Instagram link is `href="#"`, and 8 of 29 images carry an empty `alt` [verified, index.html].

What the awards skills do differently: a reduced tier that shows the wordmark and the film side by side instead of the fluid wipe, real `<button>`s with `aria-pressed` for the menu and sound, a loader that holds on a real load signal, and a tap-driven reveal on touch.

## 7. Principles
1. **Make the name the interaction.** When the brand word is a paradox, let the first gesture act it out; the visitor learns the thesis with the pointer before reading it.
2. **Wipe, don't distort.** Fluid used as a mask between two layers reads as uncovering; the same sim used as a distortion reads as decoration.
3. **Push away, spring back.** A repulsion field with a slow elastic return makes a still arrangement feel alive while always settling to its designed layout.
4. **Frame the film to change its scale.** Shrinking a video into a photographed frame while the room zooms out turns a full-bleed clip into an exhibit, and the chapter gets a clear end.
5. **Buy the colour, don't specify it.** A black-and-white system with saturated renders as the only chroma keeps the tokens to two and lets every image decide the mood.

## 8. Take / Don't take
- **Take:**
  - The two-layer mask shader: `smoothstep(soft, soft + width, dye × size)` over a dissipating dye field, with the base rasterised from SVG and the reveal left transparent to show whatever sits behind.
  - The repulsion field shape: radius, max push, `^1.6` falloff, rotation and scale from one weight, halved for small screens, with an elastic return.
  - Flip scrubbed by scroll: record state, reparent, `Flip.from` paused, hand the timeline to a ScrollTrigger with a heavy `scrub`.
  - Letters of a wordmark revealed in shuffled order rather than left to right.
  - A counter that counts down to zero when the brand is about "nothing".
- **Don't take:**
  - The literal palette:
    - `#000` [verified, CSS `--black`]
    - `#ffffff` [verified, main.js `baseBg`]
  - The NOTHIN' wordmark, its apostrophe pop, the foil/bubble-wrap/candy renders, the tinsel suit, the lift beach ball or the museum-wall photo.
  - The "Let's start from nothin'" close, the paradox line or the section order hero → works → framed manifesto → services toy → close.
  - A fixed-duration loader, `div` controls and a missing reduced-motion branch, which are what to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML, two Webflow CSS files, both Webflow JS files, the injected `main.js` |
| Award | high — entry page read, every axis and developer score |
| Concept, structure, visual language | high — desktop 5 states, reduced-motion 5 states, phone 4 states across two passes |
| Motion parameters | high — read from `main.js`; the fluid mask not seen under a real pointer |
| Weaknesses | high for reduced motion, controls and markup; medium for the phone (two states timed out) |

**Live pass 2026-09-23: reachable, capture exit 2 on both passes.** The first pass caught the preloader at s00 and timed out on desktop s50 and mobile s50–s100; one retry with `--wait 6000 --timeout 90000` into `retry/` gave clean desktop and reduced-motion frames, phone s25 and s50 timed out again. Sources in `.awards/research/noth/`: both capture sets + manifests, `index.html`, `main.js`, `webflow.schunk.7321a5097fb66f41.js`, `webflow.751e0867.148dc658e77a3916.js`, the two Webflow CSS files. Award entry `awwwards.com/sites/nothin`, found with one web search, captured desktop-only into `entry/` (exit 2) and its HTML read. Not observed: `/works`, the studio and case routes, the menu open, the 404 page, sound on, and the fluid mask under a moving pointer.
