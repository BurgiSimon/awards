# Pensatori Irrazionali — https://pensatori-irrazionali.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | studio — a creative house covering branding, websites, content production, gaming and 3D; the home route is the one read here [verified, index.html meta `category` "Creative studio" + desktop captures] |
| Visitor mode | persuade — clients, disciplines and the contact footer are the argument; the world is dressing on top of them [verified, wait/desktop-s00 to desktop-s100.png] |
| Awards | Awwwards **Site of the Day, 7.23 / 10** [verified, entry page, `entry/desktop-s00.png`]; axis and developer sub-scores not read, a cookie wall covered the score panel [unknown]; dated 20 Sep 2026 with a Developer Award [inferred, from a search-result summary 2026-09-23, not seen on the captured entry frame] |
| Corpus rating | D 7.2 / U 6.6 / C 7.2 / Co 6.9 → weighted 6.99, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | self-built, "Pensatori Irrazionali by Pensatori Irrazionali" [verified, `entry/desktop-s15.png`]; the footer credits "Aeva" for the site [verified, desktop-s100.png]; the relation between the two [unknown] |
| Stack (evidence level) | **Next.js App Router, Turbopack build**, Vercel deployment id on every asset [verified, index.html `turbopack-*.js`, `?dpl=` params, `data-dpl-id`] · **GSAP 3.14.2** with CustomEase, ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin registered together [verified, 0rprn20dpqx26.js] · **Lenis 1.3.17** through `useLenis` [verified, 133n6s~7.wlqw.js `lenisVersion`] · **Three.js r182**, `WebGPURenderer` from the WebGPU build with `forceWebGL`, a TSL node material, `KTX2Loader` with a self-hosted Basis transcoder [verified, 15g8q_4~dnkbu.js revision "182"; 08~kpwfcf6e70.js; index.html `/basis/` preloads] · **next-view-transitions** (`ViewTransitions`, `Link`, `useTransitionRouter` exported together) [verified, 04et1ujm.1ogt.js; package version unknown] · Swiper for the phone rails [verified, 0o7s~nivrs1sq.css + 068fq8h1ymnjo.js] · Tailwind v4 layer [verified, 0461f_cegkjv0.css `--tw-*`, `lab()`] · media from a self-hosted CMS at `cms.` (`/api/media/file/`) [verified, index.html]; which CMS [inferred Payload from the path shape] · Cloudflare Web Analytics [verified, index.html] · fonts via `next/font`: Ballet, Helvetica Now Var, Novela, PP Editorial Old, Sometype Mono [verified, index.html preloads + CSS `font-family`] |
| Palette | ground `#f5f5f5` [verified, 0461f_cegkjv0.css + 08-om41l.yg-h.js] |
| | ink `#434343`, the most-used colour in CSS and JS [verified, 0461f_cegkjv0.css, 0xhnisy4i1o1s.js] |
| | flag green `#009246` [verified, 08-om41l.yg-h.js] |
| | flag red `#CE2B37` [verified, 0461f_cegkjv0.css + 08-om41l.yg-h.js] |
| | preloader rules `#282828` on a near-black ground [verified, 08-om41l.yg-h.js `border-[#282828]`] |
| | marquee pink `#f669e4` [verified, 0461f_cegkjv0.css] |
| | Strategy: **an achromatic ground and ink with the national tricolore as a brand mark; each discipline gets one colour-coded accent (a status dot and a marquee band)**; the lime band and the dot greens were not read from CSS [inferred hues, mobile-s50/s75.png, desktop-rm-s25.png] |
| Type | four voices: a formal copperplate **script at display scale** for numerals, the preloader word and the footer (Ballet) [inferred face from the preload + desktop-rm-s25/s50.png]; **Helvetica Now Var** as the working grotesque for body, lists and the manifesto caps [verified, CSS + captures]; an editorial serif for the wordmark and small inserts (Novela or PP Editorial Old) [inferred which, desktop-s100.png]; **Sometype Mono** for labels [verified, CSS] · fluid size helper `clamp(1em, 1em * var(--ratio), var(--max-font-size))` [verified, 0461f_cegkjv0.css] |
| WebGL dosage | moments — engraved illustration plates rendered through one pointer-trail shader; the rest is DOM, video and images [verified, 08~kpwfcf6e70.js; manifest.json `canvases: 4` desktop, 1 mobile] |
| Scroll model | native + Lenis 1.3.17; section reveals on ScrollTrigger [verified, manifest.json `scrollMode: native`, 068fq8h1ymnjo.js] |
| Narrative model | specification — the home page is a numbered capability sheet: each discipline gets a script numeral, a service table, a sample rail and its own marquee, framed by a client hero and a manifesto [verified, desktop-rm-s25/s50.png, mobile-s50/s75.png] |

## 1. Concept and narrative
**One idea:** an Italian heraldic house selling digital craft. Renaissance engravings (trumpeting angels, a lion crest), copperplate script and tricolore rules dress a very contemporary client roster, and the contrast is the joke the name makes: "irrational thinkers" [verified, captures + index.html `<h1>`].

Beats: a dark "system boot" preloader with a line-drawn globe, discipline and year columns and a script "Loading" counter [verified, desktop-s00.png]; a light hero where a bundle of fabric pennants, each printed with a client logo, streams out of the right edge over a one-line positioning statement [verified, wait/desktop-s00.png]; a "Disciplines" chapter, with each service numbered by a huge script numeral beside a spec table and a "Learn more" [verified, desktop-rm-s25/s50.png]; an interruption, a manifesto of mixed-scale caps, serif and script around an angel engraving, followed by a rendered classical garden [verified, desktop-s75.png]; client rows and a "Trusted by" logo wall [verified, wait/desktop-s10.png]; a wordmark footer [verified, desktop-s100.png]. The copy stays plain and agency-generic under the ornament: "visually striking, intuitive" [verified, mobile-s50.png].

## 2. Structure and components
- **Preloader.** Dark panel grid of scrambled "OPTION / SYSTEM" labels with green status-dot columns around a globe drawn in SVG strokes; the percentage is the progress of a GSAP timeline, not a load signal [verified, desktop-s00.png, 08-om41l.yg-h.js `y(Math.round(100*C.progress()))`]. On the phone it collapses to a light sheet sliding over the status column [verified, mobile-s00.png].
- **Chrome.** Crest logo top left; two dark octagon-cornered tiles top right, a sound toggle (aria "Disable website sounds") and the menu (aria "Open navigation menu"); the sound tile is dropped on the phone [verified, desktop-s50.png, mobile-s25.png, index.html].
- **Discipline blocks.** Script numeral left, a `(Branding)` style eyebrow, a coloured dot + service name, rule-separated rows (item / one-line spec), grey "Learn more" button [verified, desktop-rm-s25/s50.png].
- **Discipline marquees.** Full-bleed coloured bands repeating "LEARN MORE ABOUT … — LET'S WORK" after each discipline's sample rail [verified, mobile-s50/s75.png].
- **Sample rails.** Horizontal cards peeking off the right edge, Swiper on touch [verified, mobile-s50.png, 0o7s~nivrs1sq.css].
- **Location cards.** Map silhouettes with coordinates in brackets [verified, mobile-s25.png; index.html coordinate aria-labels].
- **Client rows.** Two columns of name at display size, a "Corporate" tag, the client mark and an arrow [verified, wait/desktop-s10.png]; then a five-up logo wall that cycles its logos [verified, wait/desktop-s10 vs wait/desktop-rm-s10.png].
- **News panel** behind a "Show news panel" button, items for press and award listings [verified, index.html aria-labels].
- **Footer.** Serif "PENSATORI" at full width over a green / white / red underline, script "Irrazionali" through it, then Menu, Contact (Dubai address, two emails), Back to top, legal [verified, desktop-s100.png, mobile-s100.png].
- **Designed 404.** A script "Error 404" with a keyboard runner game, pizza and wine as collectibles [verified, `entry/desktop-s15.png` + 04rtv_jfzwvzy.js].
- **Easter egg.** The Konami code plays `konami.mp3` at volume .15 when sound is on [verified, 08-om41l.yg-h.js].

## 3. Visual language
- Grey world: `#f5f5f5` ground and `#434343` ink [verified, 0461f_cegkjv0.css], a ladder of neutral greys in between, no warm or cool tint [verified, 0461f_cegkjv0.css]. Colour arrives only as the tricolore rule, the discipline dots and bands, and the client logos [verified, captures].
- Imagery: black-line engravings (angels, lion, a hand) as plates; photoreal renders for work (a classical garden, a screen in a jungle grotto); a fabric-pennant render for the client hero [verified, captures].
- Type tricks: the manifesto sets caps on a baseline mask so letters are cut mid-height while they rise; script numerals ghosted at low opacity before they ink in [verified, desktop-s75.png, desktop-s50.png vs desktop-rm-s50.png].
- Layout: 48 px side margins on a 1440 artboard, a half-and-half split in the discipline blocks [inferred from desktop-rm-s25.png]; the phone is re-laid out rather than scaled [verified, mobile-s25 to s100.png].
- Browser surfaces: `theme-color` white while the ground is grey [verified, index.html]; separate light and dark favicons [verified, index.html]; a thin drawn scroll indicator at the right edge [verified, desktop-rm-s25.png].

## 4. Motion and effects (with parameters)
- **Global GSAP defaults.** `duration: 1/φ` (≈ .618 s) and a CustomEase named `ease` = `0.175, 0.885, 0.32, 1`, a back-out overshoot; `autoSleep: 60` [verified, 0rprn20dpqx26.js]. Named eases in use: `power2.out`, `power3.out`, `power1.inOut`, one `elastic.out(1.8,1)` [verified, 068fq8h1ymnjo.js, 08-om41l.yg-h.js].
- **Preloader.** SVG circles drawn by `strokeDashoffset: 1229.5` over 1.5 s `power1.inOut`, a line drawn over 1 s from .3 s; the wrapper is hidden with a `.6 s` delay after the exit timeline; under reduced motion every tween is `duration: .01` [verified, 08-om41l.yg-h.js].
- **Text.** SplitText `type: "words, lines"`, `autoSplit`, words entering from `x: 1rem` with `filter: blur(8px)` at opacity 0 [verified, 068fq8h1ymnjo.js]; justified-line and footer splits in the same form [verified, 08-om41l.yg-h.js, 0xhnisy4i1o1s.js].
- **Engraving trail (the signature).** A Three.js r182 `WebGPURenderer` forced to WebGL draws a plate whose pixels are chosen from six baked frames, packed as one KTX2 array texture (`sequence.ktx2`) with per-frame fallbacks, by a pointer-trail texture; tiers: high `dpr [1, 1.2]`, trail 216 px, 200 points, blur 3 samples, target 44 fps; medium `dpr [.7, 1.05]`, 128 px, 160 points, 36 fps; low `dpr [.5, .75]`, 72 px, 96 points, 30 fps, 650 k render pixels; half-float output [verified, 08~kpwfcf6e70.js]. The loop sleeps on `visibilitychange` and mounts when within `300px` of the viewport [verified, same].
- **Tier probe.** Starts from a score and subtracts 2 on 2G, 1 on 3G, 1 under reduced motion, 1 above 4 M screen pixels and 1 more above 8 M, adds 1 when WebGPU exists [verified, 08~kpwfcf6e70.js].
- **Route transitions.** The View Transitions API through `next-view-transitions`, with Lenis read in the same router hook [verified, 04et1ujm.1ogt.js].
- **Sound.** On by default: the stored preference reads true unless `"false"` was saved; buttons and links play a click sound on desktop; the reel has an unmute control [verified, 04et1ujm.1ogt.js `pensatori:sound-enabled`, 08-om41l.yg-h.js, index.html].
- **Hero.** The pennants are a looping video (`flagsOptimized.mp4`, `flagsCycles.mp4`) [verified, manifest.json failedRequests].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework | Next.js App Router, Turbopack, Vercel | [verified, index.html] |
| Motion | GSAP 3.14.2 + five plugins; Lenis 1.3.17 | [verified, 0rprn20dpqx26.js, 133n6s~7.wlqw.js] |
| GL | Three.js r182 WebGPU build forced to WebGL, TSL, lazy chunk (366 KB raw) | [verified, 15g8q_4~dnkbu.js, 08~kpwfcf6e70.js] |
| Textures | KTX2 array sequences, Basis transcoder preloaded at high priority | [verified, index.html preloads] |
| Transitions | next-view-transitions | [verified, 04et1ujm.1ogt.js] |
| Media | `next/image` srcsets at `q=75` up to 3840 w; webm and mp4 from `assets.` and `cms.` | [verified, index.html] |

- The served HTML is **1.07 MB** and preloads six full srcsets, two KTX2 sequences and the wasm transcoder at high priority [verified, index.html size and `<link rel=preload>`]. DOM 1,514 nodes desktop [verified, manifest.json].
- A React hydration error (#418) fired on the phone profile [verified, manifest.json pageErrors]; the other failures were aborted video requests [verified, same]. `lcpColdSynthetic` is a headless artefact, not a performance claim.

## 6. Weaknesses
- Reduced motion: **partial** — the preloader collapses to `.01 s` tweens, the tier drops one step, the hero and discipline blocks read at rest [verified, wait/desktop-rm-s00.png, desktop-rm-s50.png]; the manifesto caps still sit half-masked in the reduced frame, and the first reduced capture timed out at the top [verified, desktop-rm-s75.png, manifest.json].
- Keyboard: **mixed** — labelled menu and sound buttons, a keyboard-playable 404 game; no skip link found [verified, index.html].
- DOM behind the canvas: **pass** — the canvas only draws plates; one `<h1>`, `main`, `nav`, `footer` [verified, index.html]; 21 of 70 images carry `alt=""` [verified, index.html count; whether all are decorative unknown].
- Load gate: **fail** — a scripted counter plays on every visit; no repeat-visit skip in the served chunks [verified, 08-om41l.yg-h.js; absence of a storage flag].
- Phone: **designed** — own preloader, stacked blocks, swipe rails, footer re-flowed [verified, mobile-s00 to s100.png]; the hydration error is the seam [verified, manifest.json].
- Wayfinding and conversion: **weak** — no chapter indicator beyond the thin scroll thumb; "Learn more" is the only mid-page action; the contact lives in the footer and menu [verified, captures].
- Sound: **fail** — enabled by default with click sounds, the opposite of opt-in [verified, 04et1ujm.1ogt.js].

What the awards skills do differently: a real-signal loader skipped on repeat [recipe:preloader-counter-hold], sound off until asked [recipe:sound-toggle-opt-in], and reduced motion that lands every masked line at rest.

## 7. Principles
1. **Borrow a register from outside the web.** A heraldic, engraved, copperplate vocabulary gives a studio site an identity that its services list cannot; the ornament does the positioning.
2. **Number the offer and give each number a colour.** A capability page reads as a specification when every discipline has a numeral, a table and one accent that returns in its own marquee.
3. **Let a still illustration answer the pointer.** Pre-rendering a few states of a plate and letting a trail choose between them costs one texture array and one shader, not a scene.
4. **Budget GL by tier, not by device name.** Resolution, trail size, point count and target fps as one tier object, chosen by a small scored probe, keeps a decorative shader honest on weak hardware.
5. **Put the whole roster in one image.** When the clients are the proof, a single composed object carrying every mark beats a logo strip in the first viewport.

## 8. Take / Don't take
- **Take:**
  - The trail-selects-baked-frame shader: N pre-rendered states in one KTX2 array, a low-res trail texture as the selector, a sleep on hidden pages and a near-viewport mount.
  - The tier object shape (DPR range, render-pixel cap, trail resolution, point cap, target fps, buffer type) and a scored probe that counts network, screen size, WebGPU and the motion preference.
  - A golden-ratio default duration as one global token, set once in `gsap.defaults`.
  - Per-discipline accent pairing: the dot and the band share one hue, so colour becomes wayfinding.
  - A playable 404 with a full keyboard path.
- **Don't take:**
  - The hexes `#f5f5f5` / `#434343` with a tricolore rule as a studio look [verified, 0461f_cegkjv0.css]
  - The flag pair `#009246` / `#CE2B37` or any national-flag underline [verified, 08-om41l.yg-h.js]
  - The pink band `#f669e4` or the per-discipline hue set [verified, 0461f_cegkjv0.css]
  - Angel and lion engravings, the copperplate script numerals, the pennant-bundle hero, the "boot screen" globe loader.
  - The manifesto line and its caps / serif / script mix; the Konami sound and the pizza-and-wine runner.
  - Sound on by default, a scripted percentage, and a loader that plays every visit — the things to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML, two CSS files, 24 JS chunks; script and serif face assignments inferred from captures |
| Award | medium — overall 7.23 read on the entry; date and Developer Award from a search summary; sub-scores unread |
| Concept, structure, visual language | high — desktop, phone, reduced-motion frames plus a post-preloader recapture |
| Motion parameters | high — read from the served chunks |
| Weaknesses | high for load gate, sound and markup; medium for phone (headless only) |

**Live pass 2026-09-23: reachable, capture exit 2 (mobile hydration error, reduced-motion s00 timeout), scroll mode native, no wheel retry.** desktop-s00 caught the preloader at 91 %, so desktop was recaptured once with `--wait 6000` at scroll 0 and 10 into `wait/`. Sources in `.awards/research/pensatori-irrazionali/`: 14 captures + `manifest.json`, `wait/` (4 captures), `index.html`, `src/` (2 CSS, 24 JS chunks including the lazy GL chunks `08~kpwfcf6e70.js` and `15g8q_4~dnkbu.js`). Award entry `awwwards.com/sites/pensatori-irrazionali` captured desktop-only into `entry/` (exit 2, cookie wall over the score panel). Not observed: other routes, the menu overlay, the news panel open, a real GPU.
