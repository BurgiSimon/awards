# HAOQI.DESIGN (Haoqi Wen) — https://haoqi.design/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | portfolio (design engineer; one home page with `/reunimos`, `/inspire_mono`, `/adrive` and other case routes, plus external tool and event links) [verified, index.html] |
| Visitor mode | persuade: the work grid and a mail link carry the page, the WebGL scenes frame them [verified, index.html + captures] |
| Awards | Awwwards **Site of the Day, 14 Aug 2026, 7.36**: Design 7.44 / Usability 7.10 / Creativity 7.69 / Content 7.17; **Developer Award 7.43**: Semantics/SEO 7.00, Animations 8.80, Accessibility 6.60, WPO 7.80, Responsive 7.20, Markup 7.00; entry tags Portfolio, Scrolling, Gallery, 3D, UI design, Next.js, WebGL [verified, entry page `/sites/haoqi-design` read and captured 2026-09-23] |
| Corpus rating | D 7.3 / U 6.6 / C 7.2 / Co 6.8 → weighted 7.02, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Haoqi Wen, self-built; the entry lists the account `curiosity-wen` [verified, entry page]; other credits [unknown] |
| Stack (evidence level) | **Next.js 16.1.6** App Router built with Turbopack, React 19.3 canary [verified, 56b0d8f9f2c1e441.js `window.next`, turbopack chunk, react `version`] · **React Three Fiber 9.6.1** on **Three.js r184** [verified, 1098c2541054fc77.js `rendererVersion`, `__THREE__="184"`] · pmndrs `postprocessing` (EffectComposer, Bloom, SMAA edge and luminance materials), version [unknown] [verified, 1098c…js] · GLTFLoader + DRACOLoader + KTX2 support [verified, 4d3f3b68dbbde33a.js] · **Lenis 1.3.23** via `ReactLenis` [verified, 1098c…js + 3c6cc5b2fcccdee5.js] · Motion for React (`layoutId`, `LayoutGroup`, `whileHover`), version [unknown] [verified, d59f7a97fb1c563f.js] · no GSAP [verified as absence] · Tailwind-style utility CSS with theme variables, version [unknown] [verified, 635eb04122aa774f.css] · hosting Vercel (`?dpl=dpl_…` deployment ids) [verified, index.html] · fonts self-hosted under `/fonts/`, loaded with the FontFace API [verified, 2689132c4e070b68.js] |
| Palette | two user-chosen token sets, light (bone ground, black ink) and dark (near-black ground, white ink), plus one acid-lime accent; GL chapters paint their own worlds: pale sky in hero and close, black space with neon streaks mid-page (hexes in §3) [verified, 635eb04122aa774f.css + captures] |
| Type | wide variable grotesque display in caps (TikTok Sans, weight 100–900, `wdth` 120), variable mono for body and nav (Geist Mono as `mono`), pixel mono for the HUD (Departure Mono aliased `tronica-mono`) [verified, 2689132c4e070b68.js FontFace calls + index.html `font-variation-settings`] |
| WebGL dosage | canvas-first: one fixed full-viewport canvas (`z-30`) draws the glass lettering and 3D cursor, every work thumbnail over empty DOM boxes, the hyperspace chapter and a sticker rain [verified, index.html + manifest.json `canvases: 1`] |
| Scroll model | native + Lenis 1.3.23 (`lerp .1`, `smoothWheel`, `syncTouch`, `anchors`, `autoRaf:false`) on an inner `overflow-y-auto` wrapper, ticked from the site's shared frame loop; one scroll-staged shader chapter, no pin [verified, 3c6cc5b2fcccdee5.js + 4d3f3b68dbbde33a.js; manifest `scrollMode: wheel`] |
| Narrative model | gallery with one manifesto interlude: sky hero → statement and portrait → staggered work grid → hyperspace chapter of principles → sky contact close [verified, retry/desktop-s00…s100] |

## 1. Concept and narrative
A design engineer's portfolio staged as a round trip: it opens under a pale sky where a greeting written in glassy, inflated tube lettering floats beside a chunky 3D pointer, drops to a flat bone-coloured drafting sheet for the work, launches into a hyperspace tunnel for a short creed, and lands back under the sky to ask for contact. The chrome never changes: corner labels, a local clock with temperature, and a live pointer coordinate readout sit on a visible 3 × 2 construction grid with crosshair marks [verified, retry/desktop-s00.png]. The copy register is short and first-person, taglines like "Thinking in systems. Designing with care." [verified, index.html]. One detail carries the tone: the current employer's name is printed as six black squares that ask for a passcode [verified, index.html `aria-label`].

Beats [verified, retry/desktop-s00…s100 + desktop-rm-s00…s100]: caps headline bottom-left under the glass greeting and the pointer → the work grid in off-set tiles with lime tags → the pointer model alone, huge, on the bone sheet → hyperspace streaks behind three staged caps lines → lime rings of a wormhole with four scattered two-line principles → sky again, the craft word inflated behind the contact headline, stickers drifting down.

## 2. Structure and components
- **Preloader**: a 140 px pill track, fill width transitioned 520 ms `cubic-bezier(.22,1,.36,1)`, faded out over 250 ms `cubic-bezier(.25,1,.5,1)`; the header is `invisible` and `aria-hidden` in the served HTML until boot [verified, index.html]. Captured still loading at 0 % [verified, desktop-s00.png]. Fonts load through `FontFace` with `display:"block"` before the reveal [verified, 2689132c…js]. Repeat-visit skip [unknown].
- **Header**: wordmark, then Work, Contact, `THEME[A]` and `SOUND[…]` in pixel mono; the bracket shows state (A / L / D for the theme, a spinning slash glyph for sound) [verified, captures + index.html]. Hover draws a 2 px dotted box around each link [verified, index.html classes]. Phone: a two-bar menu button [verified, mobile-s00.png].
- **Footer HUD**: `GMT+8 CN` clock and temperature bottom-left, `0720 X 0450 Y` pointer readout centre, a wireframe globe bottom-right [verified, retry/desktop-s00.png].
- **Scroll rail**: an SVG track at the right edge whose thumb can be dragged; it calls `lenisScrollTo` [verified, 1098c…js + desktop-rm-s25.png].
- **Intro**: portrait photograph, a stroke-drawn SVG signature, statement, and inline project links with offset underlines [verified, mobile-s25.png + index.html].
- **Redacted employer**: `role="button" tabindex="0"` labelled "Protected — enter passcode to reveal", six `■` glyphs as its visible text [verified, index.html].
- **Work grid**: ten `<article>` cards on a 12-column grid with varied spans and starts, each a real `<a>` with an `aria-label` of name and years; the image box is empty in the DOM and drawn by GL, two images per project for a hover swap (`imageUrl`, `hoverImageUrl`) [verified, index.html + 4d3f3b68…js]. A lime `CODING PROJECT` tag marks the code work [verified, desktop-rm-s25.png].
- **Hyperspace chapter**: stages `seg0-primary` → `seg0-secondary` → `seg1` → `end` over eight segment heights, each swapping a three-line caps statement with a per-character stagger [verified, 4d3f3b68…js; retry/desktop-s50/s75.png].
- **Contact close**: `h-dvh` footer, caps call to action, e-mail, three social links, copyright line; a second inflated word sits behind [verified, index.html + retry/desktop-s100.png].
- **Sticker rain**: twelve sticker PNGs as instanced planes falling with wind, re-spawned on click [verified, 4d3f3b68…js `particleCount`, `clickSpawnWidth`].
- 404 and case routes not visited [unknown].

## 3. Visual language
- **Light theme ground and raised surface**:
  `#fbfaf4` [verified, 635eb04122aa774f.css `--background-deep:251,250,244`]
  `#efede7` [verified, 635eb04122aa774f.css `--background-elevated`]
- **Dark theme ground and raised surface**:
  `#0f1111` [verified, 635eb04122aa774f.css `--background-deep:15,17,17`]
  `#191b1b` [verified, 635eb04122aa774f.css]
- **Ink**: primary label at full strength, secondary labels from a tinted base at .6 / .32 / .16 alpha:
  `#000` [verified, 635eb04122aa774f.css `--label:0,0,0`, light]
  `#363630` [verified, 635eb04122aa774f.css `--label-d:54,54,48`, light]
  `#fff` [verified, 635eb04122aa774f.css `--label:255,255,255`, dark]
  `#e6e8e8` [verified, 635eb04122aa774f.css `--label-d:230,232,232`, dark]
- **Accent**: acid lime for text selection, project tags and the square cursor dot:
  `#c0fe04` [verified, 635eb04122aa774f.css `--selection-bg`; `bg-selection` on tags in index.html]
- **GL worlds**: the sky gradient, the blue glass lettering and the cyan-to-violet streaks are rendered, not tokens; hexes [unknown].
- **Type**: display caps in the wide grotesque, three lines stacked flush-left in the hero and centred in the hyperspace chapter; body copy in the mono on desktop, the grotesque for the intro statement; HUD and nav in the pixel mono [verified, captures + CSS]. Line heights `leading-tight` 1.25 to `leading-relaxed` 1.625 [verified, CSS].
- **Layout**: `px-4` / `lg:px-14` gutters, 12 columns, a faint 3 × 2 construction grid with crosshairs drawn over every section [verified, index.html + captures].
- **Surfaces**: `color-scheme` switches with the theme; SVG favicon and a 512 px apple icon; no `theme-color` meta [verified, index.html + CSS].

## 4. Motion and effects (with parameters)
- **Smooth scroll**: Lenis `lerp .1`, `syncTouch`, `anchors`, own raf off; in-page jumps use `lenisScrollTo(…, {lerp: .1})` and the thumb drags with `{immediate: true}` [verified, 3c6cc5b2…js + 2689132c…js].
- **Eases**: `--ease-66: cubic-bezier(.66,0,.01,1)` as the house curve, also used in JS; `cubic-bezier(.65,0,.35,1)` for the signature stroke; Tailwind's `.15s cubic-bezier(.4,0,.2,1)` default for colour changes [verified, CSS + 2689132c…js + index.html].
- **Signature draw**: SVG paths drawn by `stroke-dashoffset` with per-path `--path-delay` / `--path-dur`; reduced motion shows the finished stroke [verified, index.html inline style].
- **Hyperspace**: a full-screen fragment shader in a Shadertoy-style frame (`iResolution`, `iTime`) where time is clamped to a `uScrollDuration`, so the tunnel runs off the scroll; 100 angular cells per turn, HSV-coloured streaks with `uStarRays`, `uStreakScale`, `starThinness` [verified, 4d3f3b68…js]. Captions stagger per character through `hsstFadeIn` / `hsstFadeOut` keyframes [verified, 4d3f3b68…js].
- **Sticker rain**: instanced quads from an atlas, `fallSpeed 1.8`, `windStrength 1.8`, `windFrequency .3`, `rotationSpeed .8`, `scale 1.4`, alpha discard below .01 [verified, 4d3f3b68…js].
- **Glass lettering and pointer**: `hello.gltf`, `cnt.gltf` and `cursor.glb` models with iridescent highlights and sparkles; the pointer model moves between chapters [verified, 4d3f3b68…js paths; retry/desktop-s00/s50 + desktop-rm-s50.png]. Material parameters [unknown].
- **Canvas**: R3F `dpr: [1, 2]` [verified, 1098c…js].
- **Sound**: `/bgm.mp3` looped at volume .35; the preference defaults to on, tries `play()` at once and again on the first `pointerdown`; `S` toggles and the choice is stored under `sound` [verified, 2689132c…js].
- **Theme**: `L`, `D`, `A` keys set light, dark or system, ignored in inputs and with modifiers, stored under `theme` [verified, 2689132c…js].
- Reduced motion: CSS removes transitions and the rotating glyph; JS reads the query in several hooks; the GL scenes still render in the reduced-motion capture [verified, CSS + JS + desktop-rm-s00…s100].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework | Next.js 16.1.6 App Router, Turbopack, React 19.3 canary | [verified, 56b0d8f9…js] |
| 3D | R3F 9.6.1 on Three.js r184, pmndrs postprocessing, glTF + Draco + KTX2 | [verified, 1098c…js, 4d3f3b68…js] |
| Scroll | Lenis 1.3.23 through `ReactLenis` on an inner wrapper | [verified, 1098c…js, 3c6cc5b2…js] |
| Motion | Motion for React layout animations; CSS keyframes for text | [verified, d59f7a97…js, index.html] |
| Hosting | Vercel | [verified, index.html `dpl_`] |

Weights: the thirteen scripts named in the head come to 2.5 MB raw, about 790 KB gzipped; the chunk carrying Three.js and R3F is 903 KB raw, about 307 KB gzipped, loaded up front, not lazily [verified, fetched files]. Manifest: 297–422 DOM nodes, one canvas, no console errors, aborted RSC prefetches for eight case routes, CLS .0185 desktop [verified, manifest.json]. `lcpColdSynthetic` is a headless artefact and is not quoted.

## 6. Weaknesses
- Reduced motion: **partial**. Text reads at rest and CSS motion stops, but the GL chapters render as in the full run [verified, desktop-rm-s00…s100].
- Keyboard: **partial pass**. Cards are real links with focus rings (`focus-visible:ring-2`), the redaction is focusable, theme and sound have key paths; no skip link [verified, index.html + CSS].
- Semantics: **fail**. The served HTML has no `h1`–`h6` and no `main`; the header is `aria-hidden` until boot [verified, index.html]. The entry's Accessibility 6.60 agrees.
- DOM behind the canvas: **partial**. Titles, years and links are in the DOM; the thumbnails exist only in GL, with no `img` or alt [verified, index.html].
- Load gate: a progress bar that holds until models and fonts load; `display: block` fonts [verified]; repeat skip [unknown].
- Sound: **fail**. On by default and started on the first tap, against opt-in [verified, 2689132c…js].
- Phone: **pass**. Designed stack, reordered hero, menu button, readable HUD [verified, mobile-s00/s25/s100.png].
- Weight: everything, Three.js included, loads up front [verified, fetched files].

**What the awards skills do differently**: sound starts off and asks once [pattern:sound#opt-in-only] [recipe:sound-toggle-opt-in]; one `h1`, a `main` and a skip link [pattern:accessibility-and-reduced-motion#skip-link-landmarks-and-focus-styles]; GL thumbnails keep a real `img` with alt under the plane [recipe:gl-dom-tethered-planes]; the shader chapter freezes to a still under the reduced tier [recipe:reduced-motion-switch]; the GL chunk loads lazily [recipe:quality-tiers].

## 7. Principles
1. **Book-end the page with one world and put a contrasting one in the middle.** Leaving and returning makes the close feel like an arrival rather than the bottom of a list.
2. **Let a hidden fact be part of the voice.** A visibly withheld detail, with a real control and label, says more about discretion than a sentence would.
3. **Print the state in the control.** A bracketed letter or glyph beside a label tells the visitor the current setting and, once learned, the key that changes it.
4. **Keep the chrome constant while worlds change.** A fixed HUD and construction grid over every chapter make wildly different scenes read as one site.
5. **Drive a procedural scene from the scroll clock, not wall time.** A shader whose time is scroll progress can be scrubbed backwards, staged and paused for free.

## 8. Take / Don't take
- **Take:**
  - A scroll-clocked full-screen shader chapter, cut into named stages with one caption set per stage.
  - Single-key toggles for theme and sound, guarded against inputs and modifier keys, persisted, with the state glyph in the label.
  - An inline redaction as a focusable control with a descriptive accessible name.
  - One accent used only for selection, tags and the pointer, so it reads as the system's own colour.
  - Lenis on an inner wrapper at `lerp .1` with `syncTouch`, driven from the site's single ticker [recipe:boot-lenis-gsap].
  - The draggable SVG scroll thumb beside real scroll [recipe:scrollbar-thumb-drag].
- **Don't take:**
  - The token values as literal colours:
    `#fbfaf4` [verified, CSS]
    `#efede7` [verified, CSS]
    `#0f1111` [verified, CSS]
    `#191b1b` [verified, CSS]
    `#000` [verified, CSS]
    `#363630` [verified, CSS]
    `#fff` [verified, CSS]
    `#e6e8e8` [verified, CSS]
    `#c0fe04` [verified, CSS]
  - Inflated glass lettering under a sky, the 3D pointer mascot, the hyperspace tunnel with lime rings, the sticker rain, the clock-and-coordinates HUD as drawn.
  - The section order, the taglines, the black-square redaction of an employer, the portrait and signature.
  - Sound on by default, a page with no headings, thumbnails with no DOM image, and Three.js in the first load: things to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Awards | high: entry page read and captured 2026-09-23 (a cookie wall covers the capture; scores read from the HTML) |
| Stack, palette, type, scroll, shaders, sound, theme keys | high: index.html, CSS and seven named chunks |
| Composition, phone, reduced motion | high: captures |
| Glass material parameters, preloader repeat behaviour, case routes, 404 | unknown |

**Live pass 2026-09-23: reachable, capture exit 0 with five screenshot timeouts, scroll mode wheel.** The first run lost desktop s25/s50/s75 and mobile s50/s75 to screenshot timeouts, and its desktop-s00 caught the preloader. One retry, `--only desktop --wheel 12000 --wait 6000 --timeout 90000`, captured all five desktop states into `retry/`. Sources in `.awards/research/haoqi/`: `desktop-s00/s100`, `mobile-s00/s25/s100`, `desktop-rm-s00…s100`, `manifest.json`, `retry/desktop-s00…s100` with its manifest, `index.html`, `635eb04122aa774f.css` and the chunks named above. From awwwards.com/sites/haoqi-design: `entry/haoqi-design.html`, `entry/desktop-s00.png`, `entry/desktop-s50.png`.
