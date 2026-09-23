# Boc.Studio — https://boc.studio/work

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | studio — a brand, motion and AI-production studio; this card reads the `/work` index route [verified, index.html `<title>` and meta description; en / ca / es `hreflang` alternates] |
| Visitor mode | persuade — the work is the argument, the contact sits one tap away under INFO [verified, desktop-s00.png] |
| Awards | Awwwards **Site of the Day, 7.23 / 10** [verified, entry page, `entry/desktop-s00.png`]; axis and developer sub-scores not read (the entry's cookie wall covered them) [unknown]; dated 20 Sep 2026 with a Developer Award [inferred, from a search-result summary 2026-09-23, not seen on the captured entry frame] |
| Corpus rating | D 7.0 / U 7.2 / C 6.8 / Co 7.2 → weighted 7.04, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Boc.Studio, self-built ("Boc.Studio by Boc.Studio") [verified, `entry/desktop-s50.png`] |
| Stack (evidence level) | **Next.js App Router, Turbopack build** [verified, index.html: `/_next/static/chunks/turbopack-*.js`, RSC payload] · **GSAP 3.15.0** core, used for the case-open timeline [verified, 052_rgenbp_yq.js `version="3.15.0"`; 0-eq2~kkzvyve.js `timeline()`, `power2.inOut`, `clearProps`] · no ScrollTrigger call site found [unknown] · **Lenis** via a `LenisProvider` / `useLenis`, version not in the served text [verified, index.html RSC + 0uta1m-ut_is8.js] · **Motion (framer-motion)** for dialogs and sheets [verified, 0ol1mhi~tvftw.js `framerAppearId`, `motion.div`; 0uta1m-ut_is8.js] · **Sanity** image CDN [verified, index.html `cdn.sanity.io`] · **Mux** video, 480p MP4 renditions [verified, 009q953p2hib1.js `stream.mux.com/${id}/480p.mp4`] · Tailwind utility classes [verified, style.css] · Vercel Analytics + Speed Insights [verified, RSC component names] · PP Mori via `next/font` [verified, `<html class="ppmori_…variable">`, style.css] |
| Palette | signal orange `#ff4421` for the brand bar and focus outline [verified, style.css `--color-boc-orange`] |
| | slate near-black `#181d21` canvas, rule and off-black [verified, style.css `--color-boc-canvas`] |
| | off-white `#f3f3f3` ink on canvas, black `#000` ink on orange [verified, style.css] |
| | greys `#adadad` / `#545151` for muted labels, `#2a3137` button grey [verified, style.css] |
| | Strategy: **one cool slate ground + one hot signal bar; every other hue is outsourced to the project imagery** [verified, desktop-s00 to s100.png] |
| Type | **one grotesque, one family** — PP Mori with a metric-matched fallback, system mono only for code [verified, style.css `--font-sans`, `ppMori Fallback`]; display clamps such as `clamp(56px,7.5vw,112px)` and `clamp(64px,8.5vw,128px)` [verified, style.css]; the /work route itself stays at label and ~30 px heading scale [verified, desktop-s00.png] |
| WebGL dosage | none [verified, manifest.json `canvases: 0` on all three viewports] |
| Scroll model | native + Lenis smooth scroll; motion lives in horizontal CSS-keyframe rows, not in the vertical scroll [verified, manifest.json `scrollMode: native`, style.css `boc-marquee`] |
| Narrative model | gallery — a filterable index where every project is one self-moving filmstrip row [verified, desktop-s00 to s100.png] |

## 1. Concept and narrative
**One idea:** the portfolio index is a stack of film reels. Each project is a single horizontal strip of its own stills and clips running sideways at a constant speed, captioned with name, a one-line positioning and "View project"; the page is only as long as the client list [verified, desktop-s00/s50/s100.png].

Beats across the five states: a fixed orange brand bar with wordmark, INFO, a live local clock and an ONLINE/OFFLINE studio status [verified, desktop-s00.png]; a left sidebar holding the "Work / All / Filter +" controls, fixed while rows scroll past [verified, desktop-s25/s75.png]; nine project rows spanning sport, automotive, bakery, fashion and food clients, no chaptering, no interruption, and the index simply stops after the last row [verified, desktop-s100.png]. Tone is dry and plain-spoken; the cookie notice is a scrolling pill that jokes it has "nothing to consent to" [verified, desktop-rm-s00.png].

## 2. Structure and components
- **Brand bar** — orange, fixed, 38 px on desktop [verified, 0-eq2~kkzvyve.js fallback `h?38:60`]; clock + status text as telemetry chrome [verified, desktop-s00.png]. INFO opens a dialog; the About / Selected clients / Services / Get in touch content ships server-rendered in the /work HTML [verified, index.html `<h2>` list].
- **Sidebar + filter** — `aside` with the single `<h1>` "Work" and a discipline filter whose buttons carry "Filter by …" labels and staggered `.05 s` entry delays [verified, index.html; 0-eq2~kkzvyve.js].
- **Filmstrip row** (`ProjectMarqueeStrip`) — one `data-work-tile` per project; the strip is duplicated once, the copy `aria-hidden` with `tabIndex=-1`; each still is a link labelled "Open case study: …" [verified, 009q953p2hib1.js].
- **Case-open transition** (`CaseOpenTransition`) — see §4 [verified, 0-eq2~kkzvyve.js].
- **Consent pill** — bottom-right ticker with an info and a confirm button [verified, desktop-s00.png, mobile-s00.png].
- **Designed 404** with vertical and horizontal marquees, easter-egg words (`egg-word` scatter / wave), `AnimatedFavicon`, `CursorBalloonProvider` [verified, style.css + RSC component names; none observed in these captures].
- No preloader seen: first frame is content [verified, desktop-s00.png]; an `IntroProvider` / `PageReveal` pair exists for the home route [verified, RSC names; behaviour unknown].
- Mobile: bar grows to 120 px with the wordmark at display scale, the sidebar collapses to an inline "Work / All / Filter +" block, rows run full-bleed with two-part captions [verified, mobile-s00/s100.png].

## 3. Visual language
- Two-token world: slate ground and a hot bar, with the orange doubling as focus outline and skip-link ground [verified, index.html skip link `bg-boc-orange`]. Muted text and caption lines are greys, not tinted [verified, style.css].
- Image radius `0px` [verified, style.css `--boc-image-radius`]; 15 px gutters between stills and 15 px page padding on desktop, 20 px on phone [verified, style.css `--boc-page-px`, 009q953p2hib1.js `gap:"15px"`].
- Layout: sidebar width `min(calc((100% - 135px) / 4 + 45px), 390.75px)`, one quarter of a four-column grid [verified, style.css `--boc-sidebar-w`]; rows fill the other three quarters.
- Imagery carries all the colour: saturated campaign stills next to dark product renders, a deliberate clash held together by the neutral chrome [verified, desktop-s50.png].
- Browser surfaces: `.boc-glass` = `blur(20px) saturate(160%)` over `#101316a6`, with an opaque fallback [verified, style.css]; theme-color and selection colour not found [unknown].

## 4. Motion and effects (with parameters)
- **Filmstrip rows.** CSS keyframe `translate3d(0) → translate3d(-50%)`, `linear infinite`; duration computed per row as `max((Σ still widths + 15·(n−1)) / 70, 12)` s, i.e. a constant ~70 px/s whatever the row length, ×1.25 on wide-bump rows [verified, 009q953p2hib1.js + style.css `--marquee-dur`]. Rows drift between states in the default frames and sit at rest in the reduced-motion frames [verified, desktop-s00 vs desktop-rm-s00.png].
- **Row hover grow.** Stills' height and width transition `.4s` on `--ease-boc-grow: cubic-bezier(1, 0, .47, 1.25)` — a late, overshooting grow — to `1.2×` plus the caption height [verified, style.css].
- **Hover video.** Mux 480p MP4 per still, muted, looped, `playsInline`; mounted only when the still intersects (`rootMargin:"0px 150px"`) and the device matches `(hover: hover)` without reduced motion; plays on `pointerenter` of the row [verified, 009q953p2hib1.js].
- **Case-open.** On click (capture phase, plain left click only) the row's marquee and videos pause; other on-screen rows fade `opacity 0, y 18` on `power2.in` over `.65 s`, staggered `.09 s × |index − clicked|`; off-screen rows hide instantly; the sidebar fades at `.45 s`; the clicked row rises on `power2.inOut` over `1.15 s` to sit 15 px under the brand bar, fades `.45 s`, and the route is pushed at `1.6 s` [verified, 0-eq2~kkzvyve.js desktop constants]. Phone constants are shorter: rise `.8`, push `1.15`, stagger `.06` [verified, same]. Skipped under reduced motion; `?caseopen=slow` runs it at `timeScale(.25)` [verified, same].
- **Dialogs.** Entrance `.666 s` on `[.16, 1, .3, 1]`, close ease `[.64, 0, .78, 0]`; the dialog body gets its own nested Lenis (`duration 1.2`, expo easing, `autoRaf`); phone variant is a drag-to-dismiss bottom sheet; Escape closes [verified, 0uta1m-ut_is8.js].
- Easing tokens: `--ease-boc-brisk (.4,0,.2,1)`, `--ease-boc-grow`, `--ease-boc-reveal (.25,.1,.25,1)` [verified, style.css].
- Sound: none found [unknown].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework | Next.js App Router, Turbopack | [verified, index.html] |
| Animation | GSAP 3.15.0 core (transition), Motion (dialogs), CSS keyframes (rows) | [verified, 052_rgenbp_yq.js, 0ol1mhi~tvftw.js, style.css] |
| Scroll | Lenis via provider; nested instance per dialog; `data-lenis-prevent` on scroll panes | [verified, 0uta1m-ut_is8.js] |
| Media | Sanity images through `next/image` srcsets at `q=75`, WebP; Mux 480p MP4 on hover | [verified, index.html, 009q953p2hib1.js] |
| Styles | Tailwind, one 49 KB CSS file | [verified, style.css] |

- The served /work HTML is **2.0 MB**, carrying 609 inline base64 image placeholders and the full RSC payload; 1,895 DOM nodes [verified, index.html size + count; manifest.json]. No console or page errors; the only failed requests are aborted RSC prefetches [verified, manifest.json].
- `lcpColdSynthetic` is a headless artefact and is not a performance claim.

## 6. Weaknesses
- Reduced motion: **pass** — rows `animation:none; transform:none`, a global `.01ms` duration clamp, the case-open timeline skipped and hover video never mounted [verified, style.css, 0-eq2~kkzvyve.js, desktop-rm-s00.png].
- Keyboard: **fail on cost** — the tile anchors are real links with labels and the clones are removed from the tab order, but every still is its own stop: 203 "Open case study" anchors for nine projects before the Tab path reaches anything else [verified, index.html count]. A skip link exists [verified, index.html].
- DOM behind the canvas: **pass**, there is no canvas; the info content is server-rendered [verified, manifest.json, index.html].
- Load gate: **pass** — content in the first frame, no preloader on /work [verified, desktop-s00.png].
- Phone: **designed but crowded** — rows and captions are re-laid out, yet the consent pill sits over the captions until dismissed, and hover video has no touch equivalent [verified, mobile-s00/s100.png, 009q953p2hib1.js].
- Wayfinding and conversion: **mixed** — the filter and "Work / All" crumb say where you are; the rows never stop moving, so a still cannot be read at rest without hovering, and the page has no footer or closing action [verified, desktop-s100.png, index.html 0 × `<footer>`].
- A debug flag (`?caseopen=slow`) ships in production [verified, 0-eq2~kkzvyve.js].

What the awards skills do differently: one link per project with the stills as `aria-hidden` decoration, a marquee that pauses on focus and off-screen, and a designed close on every index.

## 7. Principles
1. **Let the chrome carry no colour when the work carries all of it.** One ground and one hot bar are enough when the content is loud; a third accent would compete with the clients' palettes.
2. **Set a marquee's speed, not its duration.** Deriving duration from measured content width keeps every row at the same px/s, so long and short rows read as one system.
3. **An index can be the portfolio.** A row per project, captioned with a name and one positioning line, replaces the case-grid-plus-hero shape without losing scan speed.
4. **Exit by promoting what was chosen.** A route exit that lifts the clicked item into the header slot and dissolves its neighbours by distance explains the navigation before the next page arrives.
5. **Gate expensive media on capability and visibility.** Video that mounts only for hover-capable, motion-accepting, on-screen tiles costs nothing for the visitors who cannot use it.

## 8. Take / Don't take
- **Take:**
  - Width-derived duration for any CSS marquee: `max((content width + gaps) / speed, floor)`, one speed token for all rows.
  - The distance-staggered exit: `stagger × |i − chosen|`, the chosen item rising on an in-out ease, the push scheduled after the rise, all bypassed under reduced motion.
  - A late-overshoot grow ease for hover expansion, used once and named as a token.
  - Media mounted by `IntersectionObserver` with a horizontal root margin and a `(hover: hover)` + motion-preference gate.
  - Server-rendering the INFO panel's content so a dialog never hides text from crawlers or no-JS readers.
- **Don't take:**
  - The hexes `#ff4421` and `#181d21` or the orange-bar-over-slate pairing [verified, style.css]
  - The brand bar with clock and ONLINE/OFFLINE status, the "Work / All / Filter +" sidebar, the cookie-joke pill copy.
  - The filmstrip rows as-is (constant sideways drift of every project's stills with a name / line / "View project" caption).
  - PP Mori as the face; the 15 px gutter and quarter-width sidebar as literal numbers.
  - Any client name, still or clip; the per-still link pattern and the shipped `?caseopen=slow` flag — both are things to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML, CSS and five JS chunks |
| Award | medium — overall 7.23 read from the entry frame; date and Developer Award from a search summary; axis scores unread |
| Concept, structure, visual language | high — five desktop states, phone and reduced-motion frames |
| Motion parameters | high — read from the served chunks and CSS |
| Weaknesses | high for reduced motion, keyboard count, load; medium for phone (no real device) |
| 404, easter eggs, cursor balloon, favicon, sound | low — component and class names only, not observed |

**Live pass 2026-09-23: reachable, capture exit 0, scroll mode native, no wheel retry needed.** Sources in `.awards/research/boc/`: 15 captures + `manifest.json`; `index.html` (2.0 MB); `style.css`; `0-eq2~kkzvyve.js` (case-open, filter); `009q953p2hib1.js` (filmstrip strip); `052_rgenbp_yq.js` (GSAP); `0ol1mhi~tvftw.js` (Motion); `0uta1m-ut_is8.js` (dialogs, Lenis). Award entry `awwwards.com/sites/boc-studio` captured desktop-only into `entry/` (exit 2, cookie wall over the score panel).
