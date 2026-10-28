# The Line — https://thelinestudio.com/

| Field | Value |
|---|---|
| Class | studio — an animation studio in London; work-first portfolio + studio identity + news + shop + podcast [verified, index.html: `<title>Animation Studio London \| THE LINE Studio`, nav `/work /entertainment /about /blog /podcast /contact /shop`] |
| Industry | film-music |
| Visitor mode | persuade |
| Awards | Awwwards **Site of the Day, 5 Nov 2024** — **7.76 / 10** (Design 8.02 · Usability 7.40 · Creativity 7.78 · Content 7.77) [verified, Awwwards entry read 2026-09-18]. Six developer criteria: Semantics/SEO 7.40 · Animations/Transitions 9.00 · Accessibility 7.00 · WPO 8.00 · Responsive Design 7.60 · Markup/Meta-data 7.40 [verified, same]. **No Site of the Month**; the "DEV AWARD" heading prints the same `→ 7.76` overall figure, a score and not a second badge [verified, same]. CSSDA, FWA, Godly [unknown] |
| Studio / credits | The Line Studio (PRO), Isaac Powell (`/IJPowell/`, PRO), Thomas Aufresne (`/thomasaufresne/`) [verified, Awwwards entry read 2026-09-18]; the in-footer credits panel names the same two for site design and development [verified, desktop-aria.yml 2026-10-28] |
| Stack (evidence level) | **Nuxt 3 / Vue** [verified: `/_nuxt/*.js`, `data-capo`, `_payload.json`, `page-enter-active` classes] · **GSAP + ScrollTrigger + SplitText 3.11.3**, two CustomEases and four registered effects; MotionPathPlugin registered, never used [verified, BHubVMsw.js] · **Lenis 1.1.13, `lerp: 0.2`, driven from `gsap.ticker`** [verified] · **DatoCMS** [verified: `graphql.datocms.com`, `datocms-assets.com`] · **Vimeo** for video [verified] · Denim variable font, `DenimVF.woff/woff2`, weight axis 300–800, `ss03` on [verified] · **no canvas, no WebGL** [verified, manifest.json `canvases: 0` on three routes] · GA4 `G-XRL3X5GCDJ` [verified, manifest.json] |
| Palette | `#DDDEE2` body ground · `#F8F8F8` section ground · `#0B0B0B` ink and scrollbar handle · `#FF391E` flare red · `#E8E9EE` reversed text and the work index's list ground · `red` (`#FF0000`) for the `.acetate` multiply layer [verified, index.html and index.DFQ5Ncrj.css]. Strategy: **a cool grey/near-white ground carrying one hot red that is a working colour, not a bookend**: preloader ground, mobile nav ground, selection, image-loading placeholder, status dots, active nav item, the list marker and the whole sticky footer [verified, same] |
| Type | single variable grotesk, Denim (`DenimWeb` / `DenimVF`), `ss03` set on `body` [verified]. **A full scale, not a two-tier contract**: h1 210 px (`12.15278vw`), h2 128, h2--s 96, h3 64, h4 48, h5 40, then p1 32 → p8 10 px, all ≥1024 px [verified] |
| WebGL dosage | **none** — DOM, CSS and SVG only [verified] |
| Scroll model | native scroll + Lenis 1.1.13 under a custom-drawn scrollbar; **sticky stages on invisible rails, never `pin`** [verified — `pin:` 0 times across 35 fetched JS chunks] |
| Narrative model | print artefact — a call sheet about film; conventional studio IA elevated by treatment [verified structure; framing recalled high] |
| Routes read | home · index /work · case /work/gorillaz-the-mountain-the-mooncave-and-the-sad-god |
| Palette strategy | one hot red working everywhere over cool-grey/near-white grounds (#FF391E, #FF0000 multiply) |
| Type contract | single variable grotesk, full 8-step ladder 210→10 px on 1728 (Denim) |
| Awards / score | SOTD 5 Nov 2024, 7.76 (dev sub-scores 7.00–9.00) |
| Confidence | very high (live-verified) |
| Last verified | 2026-10-28 |

## 1. Concept and narrative
**One idea:** the studio shows its craft in the interface. Every surface is a sheet that hinges, blinks or strikes into place, and the one saturated red is the studio's ink rather than a highlight colour.

The **acetate** is a local device, not the site's art direction: `.acetate{background-color:red;inset:0;mix-blend-mode:multiply;position:absolute}`, `aria-hidden` [verified, index.html + B6MUFv6g.js]. It marks the hero, the featured work's active row, the reel target, the mobile nav figure, the 404, each case hero and the work index's hovered row [verified, index.html, index.DFQ5Ncrj.css, Ds9jNxuD.js]. Site-wide greyscale does not exist: `filter:grayscale()` sits on two selectors only [verified]; the work runs in full colour [verified, desktop-s25/s50.png].

The preloader hands the red over: `.home-hero__layer.acetate` starts at `#ff391e` and turns `red` on `.home-hero--preloader-done` over `.3s cubic-bezier(.19,1,.22,1)` after `.2s` [verified]; the preloader's logotype SVG is then **appended into the hero wrapper** (`b.appendChild(o.value)`) [verified, BHubVMsw.js]. The case routes repeat the move at their end: the next case's hero, already in the footer, is moved node by node into the incoming page (§4). **Moving the live element instead of cross-fading copies is the site's transition idea.**

Beats [verified, index.html + captures]: hero (red-flooded reel, logotype on the bottom edge, ®) → `home-intro` → `home-featured-work` (one sticky stage; three cases dealt in as sheets) → `home-about` → `home-clients` → `home-featured-news` → sticky flare-red footer under a tipping logotype sheet.

**Tone:** working-studio voice. Status dots, slash-delimited nav, `/ MICRO / LABELS /`, `CLOSED (10—6PM)`, `LONDON, ENGLAND`, `THE WORK [ 85 ]`, a frame counter at display scale, and on case heroes a call-sheet row: frame rate, type, a dotted figure (`8.00`), month, `© MMXXVI` [verified, index.html; case/desktop-s00.png]. The about copy: "We're a globally renowned animation studio based in East LDN" [verified, desktop-s50.png]. Named work on the home page: *The Mountain*, *Here, Tomorrow*, *Marvel Snap / Hero* [verified, index.html 2026-10-28].

## 2. Structure and components
Routes [verified, index.html]: `/`, `/work` + `/work/<slug>`, `/entertainment`, `/about`, `/blog` + `/blog/<slug>`, `/podcast`, `/contact`, `/shop`, `/privacy`, and a designed 404 (`.error__wrapper.acetate`) [verified].

| Component | What it does | Label |
|---|---|---|
| Preloader | frame counter at `h1` scale, `tabular-nums`; logo strokes build, then the SVG is appended into the hero; on other routes it leaves `yPercent −125, xPercent 10, rotate 15`, top right, `.8s` `pageOut` | [verified] |
| Header + slash nav | 8 items, `/` as real `<i>`; arrives on mount, `.2s` in and over the running preloader, as a cascade of `blinkOnce` / `blinkIn` at `.04s` steps (logo, slashes, toggle, status, location, links); `PRELOADER:DONE` only drops `header--preloader` and applies the route theme; hover `blinkOnce`, click `blink`; a `HeaderThemeTrigger` per section flips light/dark at `top 2%` | [verified, BHubVMsw.js, E6z5nIBq.js] |
| Nav toggle | burger ↔ cross by **stepped `.set` per path**, `.05s` stagger: outgoing off/on/off at 0/.08/.16, incoming on/off/on at .35/.43/.51; no tween | [verified, BHubVMsw.js] |
| Mobile nav overlay | full-screen `#ff391e` panel hinging in from `translate(30%,-80%) rotate(14deg)` | [verified] |
| `.cursor` + labels | `hover:hover` only; position lerp `.1` on `gsap.ticker`, optional rotation mapped from x; text labels teleported into it per region | [verified, BHubVMsw.js, Cl0apEhJ.js] |
| Featured work | one sticky stage, **one invisible rail per case**; each case is a title sheet and a media sheet dealt in and out on scrubs (§4) | [verified, B6MUFv6g.js] |
| Field guide | on each title sheet: nested Overscan (dashed), Crop (solid) and Action Safe (dashed) frames with **live pixel readouts** measured on resize, `[ 16:9 ]`, `100%`, a crosshair | [verified, Drc9zaOP.js, FieldGuide.-YBbzYnC.css] |
| `ScrollbarCustom` | `aria-hidden`; handle from Lenis progress; drag via `mapRange` → `lenis.scrollTo(…, {immediate})`; **slides out `xPercent 110` during route transitions**, `1s` expo out | [verified, BHubVMsw.js] |
| Text splitter | GSAP SplitText 3.11.3 wrapped in a `TextSplitter` component: `anim-line` / `anim-word` / `anim-char` classes, an optional `oh` line mask, split once fonts load (by default lazily, on a `once` ScrollTrigger), re-split on resize and orientation change except below 1024 px on touch | [verified, BHubVMsw.js] |
| Footer | logotype sheet over a sticky `100dvh` red stage on a `top:-50vh` rail; columns, newsletter, `© … 2026 / SITE CREDITS / PRIVACY / UP` | [verified, CYc7OJsQ.js, Footer.1fXw1gXD.css] |
| Credits panel | `50lvh`, `#dddee2`, at the footer's foot **under** the stage (z 1 vs 2); opening hinges the stage away; its close is a full-panel invisible button | [verified, BRQUlf4y.js, FooterCredits CSS] |
| Work index `/work` | `All [85] ▾` filter; Grid / List pills; list view with year, title, director, type and a red multiply marker; cursor-image previews | [verified, D9wrofva.js, work/desktop-s00.png] |
| Case route | acetate hero panel with call-sheet row and "The Crew" panel; director's note; grading and process modules; credits as one run of role / name pairs; a **Next** close that is the next case's hero, hinged | [verified, Ds9jNxuD.js, case/desktop-s00/s100.png] |
| Easter eggs, sound | — | [unknown] |

## 3. Visual language
**Palette roles** [verified, index.html]: `#DDDEE2` body ground; `#F8F8F8` section ground and reversed text; `#0B0B0B` ink and scrollbar handle; `#E8E9EE` the reversed logotype and the list view's ground; `#FF391E` across ten roles; `red` only under `multiply`.

**Type scale** [verified, inline CSS]: below 1024 px fixed px (h1 72, h2 40, p1 24 …); at ≥1024 px a six-decimal vw from a 1728 artboard: h1 `12.15278vw` = 210 px / 500 / `line-height:.8` / `-.04em`; p8 `.5787vw` = 10 px. Weights are variable values (300, 440, 470, 500).

**Optical kerning** [verified]: a `.letter-A` … `.letter-9` table of `margin-left` from `-.07em` to `+.052em` at ≥1024 px, on display lines whose class is built from the title's first letter (featured titles, footer CTA, credits title, the work list title).

**vw-lock** [verified]: `px / 1728 × 100` at full precision; no `clamp()`, so the display scales without ceiling above 1728 px.

**Material**: zero radius outside the cursor and dots, zero shadows; depth is luminance and rotation only [verified].

**Layout**: breakpoints 767 / 768 / 1023 / 1024 / 1240 / 1600, 112 of 149 media queries on `min-width:1024px`; `@media (hover:hover)` 17 times as a real coarse-pointer switch [verified]. **The work grid repeats a twelve-item rhythm** — columns `gsap.utils.wrap([5,4,3,3,3,9,4,5,3,3,3,9])` with a matching thumbnail-size cycle — so 85 entries never read as a uniform grid [verified, D9wrofva.js; work/desktop-s50.png].

**Browser surfaces** [verified]: `::selection` `#ff391e` on `#f8f8f8`, inverted inside the footer; native scrollbar hidden only under `hover:hover`.

## 4. Motion and effects (with parameters)
- **Global contract** [verified, BHubVMsw.js]: `gsap.defaults({ease:"power2.out"})`; CustomEase `expoOut` `0.19, 1, 0.22, 1` and `pageOut` `0.44, 0.14, 0.28, 1`, **the same control points as the CSS transitions**, so scripted and declared motion share two curves; panels `(.14,1,.34,1)`, nav out `(.9,0,.1,1)`.
- **Sticky stages on invisible rails** [verified]: `.home-hero{height:200svh}` + absolute `__scroller{inset:0 0 -100svh 0}` + `__sticky{height:100lvh;position:sticky;top:0}`; the same shape for featured work (one `opacity:0` rail per case) and the footer (`top:-50vh`, so the stage sticks while the footer's top is mid-screen).
- **The hinge** [verified, B6MUFv6g.js]: hero panel and logo `xPercent −10, rotate −15`, origin bottom left, `top top+=1` → `bottom top`, `scrub:true`, `power1.in`; its entrance is CSS (`translate(-10%,124%) rotate(15deg)` → 0, `1s` expo out). Entrances start rotated **4–16°**, pushed 10–45 % sideways and up to 130 % down (title sheet 110, media 130, case hero 120, CSS hero 124); the title sheets and section headers name a corner or edge (top left, left), while the media sheets, about figures and case hero turn about their centres [verified, B6MUFv6g.js, Ds9jNxuD.js].
- **Dealt sheets** [verified, B6MUFv6g.js]: per case, title sheet from `yPercent 110, xPercent 15, rotate 15` (top left) and media from `130 / 20 / 15` at `+.06`, rail `top bottom` → `top top`; out on `top top+=1` → `bottom top` to `−80 / −25 / −7` and `−50 / −5 / −5`; the last case drifts down (`50 / −10 / −3`) instead of leaving. `ease:"none"`, `force3D`; video plays only while the section is in view.
- **Fans and steps**: about figures fan apart (`−45 % / 4.89°` → 0 and `25 % / 8°` → `45 % / 4.89°`, `top 102%` → `top 15%`); clients appear by `.set(autoAlpha:1)` at `.05` / `.03 s` steps, no tween [verified, B6MUFv6g.js].
- **The blink family** [verified, BHubVMsw.js]: **four** effects, `extendTimeline:true` — `blink` and `blinkIn` (identical: 0 / 1 / 0 / 1 at `0 / .09 / .15 / .21 s`), `blinkOnce` (0 at 0, 1 at `.09`), `blinkOut` (stops at `.15`). The site's interaction primitive: header arrival, nav hover and click, footer links, filter brackets, carousel nav.
- **Preloader** [verified, BHubVMsw.js]: `lenis.stop()`, counter to 24 over `3s expoInOut` after `.8s`; the logo line `scaleX 0→1` `1.2s`, `scaleY 3.6` at 1.18 s, letters off `scale 3/3/5` over `1s power4.out`; `PRELOADER:DONE` half a second after. Held-clock frames: flat red to 1.8 s, line at 2.1 s, `04/24 fps` at 2.4 s, logotype whole by 4.2 s of page time [verified, timeline/desktop-timeline.png]. **Fixed, tied to no load signal; no repeat-visit skip** (`sessionStorage` only in Nuxt's reload guard).
- **Markers cut, they never slide** [verified, D9wrofva.js, ICJAAGel.js]: the list view's red multiply bar (`height:1.1em`) and the process carousel's nav marker move by `gsap.set(…, {yPercent: 100 × index})`; the hovered row's text turns `#f8f8f8` above the bar.
- **Footer** [verified, CYc7OJsQ.js]: logotype sheet `xPercent −7, rotate −6` (phone `−14 / yPercent −40 / −6`), top left, `top top` → `max`, `power1.inOut`; content `yPercent 15 → 0` from `bottom bottom`. **Credits**: scroll to `lenis.limit` over `.8s`, open at once — stage `translate(5%,-16.2037vw) rotate(-6deg)` (phone `-24rem / -3deg`), `1s cubic-bezier(.19,1,.22,1)` — and after `.82s` any scroll closes it.
- **Page transitions** [verified, index.html, B_ZYxxOZ.js]: default `page-enter-from{translate(-10%,105lvh) rotate(-4deg)}`, `.8s` `pageOut`; leave `translateY(-25lvh) rotate(4deg)`, `.78s`. Their `transform-origin:"top right"` is a **quoted string, invalid CSS**, so pages turn about their centre. Case to case, a JS transition `case-next` (`css:false`, `mode:"out-in"`): leave lifts the footer block `y: −rect.top` over `1s` expo out while the hinged content and acetate unwind to 0, then `lenis.scrollTo(0,{immediate})`, `lenis.stop()`, the block fixed at the top; enter **appends the same figure, content and acetate nodes** into the new hero, whose entrance is skipped (`isSeamlessTransition`). The next-case close hinges `rotate −16 → −8, yPercent 28 → −10, xPercent −15 → −8`, top right, `scrub:.5` [verified, Ds9jNxuD.js].
- **Work index** [verified, D9wrofva.js, index.html]: filter panel `translate(-10%,115%) rotate(8deg)`, `.8s (.14,1,.34,1)`; grid ↔ list swap `translate(20%,120lvh) rotate(8deg)` after `.6s`; filter counts `0 → n` over `.6s` expo out; grid hover excerpt lines from `y 20` at `.08s`, `.8s` expo out.
- **Reduced motion** [verified]: most CSS transitions sit in 33 `@media (prefers-reduced-motion:no-preference)` blocks (hero entrance, hovers, case panels, layout swap), but the route sheets (`105lvh` / −4°, `−25lvh` / 4°), the nav panels below 1024 px (8° / 14°), the work filter panel (8°), the nav-item and link shifts and the carousel cursor's transitions are ungated and still move [verified, index.html, CarouselCursor.YRZIR0qH.css]; `prefers-reduced-motion` appears 0 times in 35 JS chunks, so scrubbed hinges, dealt sheets and blinks still run [verified, desktop-rm-s25.png vs desktop-s25.png].

## 5. Tech and pipeline
- Nuxt 3, one `type="module"` entry (`BHubVMsw.js`, 449 KB), lazy route and component chunks with their own CSS; ~47 KB critical CSS inlined [verified]. **Unchanged by hash between the 2026-09-18 and 2026-10-28 passes** (entry, home chunk and both stylesheets keep their names) [verified].
- DatoCMS over GraphQL; video on Vimeo; media take a `srcSmall` below 1024 px and lazy-load at `lazyThreshold: "-200% 100%"` [verified].
- The vw-lock removes JS layout work on resize; reveals are ScrollTriggers, not `IntersectionObserver` [verified].
- Performance: LCP figures are a headless SwiftShader artefact. CLS 0.0005 desktop, **0.2092 tablet, 0.3136 mobile** on the home route, as in September (0.3142); `/work` and the case route stay under 0.012 [verified, three manifests 2026-10-28] — the home's touch-width shift reproduces. WPO 8.00 at submission [verified].

### Tech lens: GSAP
- **Registration and defaults**: `gsap.registerPlugin(CustomEase, MotionPathPlugin, ScrollTrigger, SplitText)` (SplitText 3.11.3; MotionPath registered, never used); no Flip, Observer or `quickTo`; `gsap.defaults({ease:"power2.out"})`; CustomEase `expoOut`, `pageOut` [verified, BHubVMsw.js].
- **Effects as vocabulary**: four `registerEffect` calls with `extendTimeline:true`, called as `tl.blinkIn(el, {}, t)` inside arrival timelines and as `gsap.effects.blink(el)` from handlers, usually after `killTweensOf` (20 site call sites; the nav-item hover and the process carousel's press call the effect without one) [verified].
- **Scrubs**: 10 `scrub:true` and 2 `scrub:.5`; `ease:"none"` on the dealt sheets, but `power1.in`, `power1.out` and four `power1.inOut` on the hinge, intro, about and footer scrubs — eased scrubs [verified].
- **Triggers as switches**: many `ScrollTrigger.create` with only `onEnter` / `onLeave` callbacks that flip Vue refs (video play, active case, header theme, layout toggles) [verified].
- **Timelines**: flat and local; `addLabel` only inside a slider and an accordion; no master [verified counts; no master inferred].
- **matchMedia**: five `gsap.matchMedia()` scopes, all for width or `(hover: hover)`; none for reduced motion [verified].
- **Routes**: Nuxt `<Transition>` classes for the default route move; a JS-hook transition with `css:false` for the seamless case hand-off. Lenis is stopped after the lift and restarted on enter in `case-next` only; the default CSS transition (`mode:"in-out"`) leaves Lenis running and only toggles `isTransitioning`, which slides the drawn scrollbar out [verified, B_ZYxxOZ.js].

## 6. Weaknesses
- **Reduced motion, half-done**: the CSS layer is mostly gated (the route, nav and filter transitions are not); the scripted hinges, dealt sheets and blinks have no tier [verified].
- **Keyboard** [verified, walk/walk.json, 58 desktop tab stops]: 17 footer links take focus **under the closing logotype sheet**; the closed credits' two designer links and its close button are in the tab order (3 stops, 56–58) and in the accessibility tree; 6 controls show no focus change (newsletter field and submit, Site Credits, Up, Play video, Close credits); the newsletter field has no label and a video no name; 0 `keydown` handlers in 35 chunks.
- **Small phone targets** [verified, walk.json]: Site Credits 84 × 12, Up 18 × 12, nav toggle 52 × 14 px.
- **Heading semantics inverted**: the only `h1` on the home route is "Highlights"; slash labels are `h2` over `h3` display words [verified, desktop-aria.yml]. Semantics/SEO scored 7.40.
- **Header theme without a scrim**: a per-section light/dark flip exists, but black or white nav text still sits on full-bleed artwork; over the comic frame and the case hero's foliage parts of it are unreadable [verified, desktop-s50.png, case/desktop-s00.png].
- **A fixed ≈3.3 s preloader on every visit**, no load signal, no skip [verified].
- **Hover-only reveals**: the list marker and the cursor previews exist only under `(hover:hover)` [verified, index.DFQ5Ncrj.css].
- **Strengths worth naming:** the acetate, the scrollbar and the cursor are `aria-hidden`; the native bar is hidden only under `hover:hover`; Lenis runs off the GSAP ticker; CSS and GSAP share two curves [verified].
- **What the awards skills do differently:** `gsap.matchMedia()` tiers so hinges become cuts and the blink a single step; one `h1` on the display word; a scrim or a sampled theme under the header; a preloader held on `Promise.all(fonts, first media)` with a ceiling and a session skip; a credits panel that is `inert` while closed, with focus moved in and back; keyboard focus that never lands under a sheet; the list marker on `:focus-visible` and a reading line on touch; 44 px targets (`[recipe:footer-credits-hinge]`, `[recipe:overprint-marker-index]`, `[recipe:next-case-handoff]`).

## 7. Principles
1. **One ink used everywhere beats one ink used twice.** A single hot colour earns its place by doing work — loading, selection, active state, the marker, the final screen — not by appearing only at the bookends.
2. **A sticky stage plus a transparent rail beats a pin.** Give the section its own height, an over-extended scroller inside it, and a `position:sticky` visual. No pin-spacer, native scroll intact.
3. **Name the origin corner.** Rotation on a named `transformOrigin` at 4–16°, parent and child at different rates, reads as physical paper; translate-and-fade never does.
4. **Move the element, not a copy.** When something continues across a moment — loader to hero, footer to the next page — append the live node into its new home; nothing restarts, nothing doubles.
5. **Discrete things cut.** A marker over rows, a state indicator, an icon swap: hard steps registered once as effects read as deliberate; easing between two rows spends frames on positions that mean nothing.
6. **Chrome in the client's dialect.** Frame counters, safe-area guides with live measurements, call-sheet labels, a work count in brackets: the UI speaks the industry's own paperwork.
7. **Gate the whole CSS layer on the motion preference, then bring the scripted layer to the same line.**

## 8. Take / Don't take
- **Take:**
  - The sticky-stage rail as a shape, driven by a ScrollTrigger with `trigger/start/end/scrub` and no `pin`, and a footer rail that starts half a viewport early.
  - Lenis on the GSAP ticker, and a drawn scrollbar that is `aria-hidden` and leaves during route changes.
  - The hinge: a named origin, 4–16°, parent and child at different rates; sheets dealt in on per-item rails.
  - The signature registered as GSAP effects with `extendTimeline:true`, and CustomEases built from the CSS curves' own control points.
  - Live-node hand-offs: preloader mark into the hero, the next-case close into the next hero (`[recipe:next-case-handoff]`).
  - One multiply marker that cuts between rows (`[recipe:overprint-marker-index]`); credits kept under a lifting footer (`[recipe:footer-credits-hinge]`).
  - A repeating column cycle for a long work grid, so density varies on purpose.
  - The vw-lock and the optical-kerning table, with `clamp()` so the display stops past the artboard.
  - Chrome as genre signal — the audience's own paperwork (compare `[site:igloo]`).
- **Don't take:**
  - The red acetate over film, the frame-counter preloader, the blinking logotype build, the safe-area guide set as drawn.
  - The hexes `#DDDEE2` / `#F8F8F8` / `#0B0B0B` / `#E8E9EE` / `#FF391E` and the cool-silver + flare-red pairing.
  - Denim (`ss03`); 210 px / 10 px as literal sizes; the six breakpoints; the `[5,4,3,3,3,9…]` cycle as-is.
  - The call-sheet furniture as a set: status dots, slash nav, `/ MICRO / LABELS /`, opening hours, `© MMXXVI`.
  - The section order hero → intro → featured work → studio → clients → news → sticky red footer, and the red footer with its hinging credits as drawn.
  - Project imagery, client names, copy lines.
  - The inverted headings, the unconditional preloader, the reachable closed credits and the eased scrubs — things to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Awards, scores, credits | very high — the Awwwards entry read directly |
| Stack, palette, type, breakpoints | very high — served bundles, CSS and three manifests |
| Motion parameters (hinge, sheets, blink, preloader, footer, routes) | very high — read from the served JS and CSS |
| Sections, components, routes | high — markup, captures of three routes |
| Reduced motion, keyboard | high — CSS gating counted, JS absence counted, rm frames, a keyboard and tap walk |
| Performance | low — LCP is a headless artefact; the mobile CLS needs a real device |
| CMS workflow, hosting, sound, easter eggs | unknown |

**Motion-lens pass 2026-10-28: reachable, owner policy allows (`policy.mjs`, home and both routes), captures exit 0** — home: five scroll states at desktop, tablet and phone, reduced motion, a held-clock `--timeline` (0–4.2 s) and a `--walk`; `/work` and one case route at 0, 50, 100. Sources: the three HTML documents and the 35 JS and 39 CSS chunks they and the entry name, fetched as text into `.awards/research/the-line/`. The bundle is unchanged since September, so this pass reads components the first pass did not (field guide, footer and credits, header theme, nav toggle, scrollbar, work index, case route, the `case-next` transition). One phone capture of the case route logged a stylesheet refused for a `text/plain` type; the same file served `text/css` on a re-request [verified, case/manifest.json] — transient.

**Live pass 2026-09-18**: reachable, capture exit 0, scroll mode native; `index.html`, `BHubVMsw.js`, `B6MUFv6g.js`, `JHLyEYbv.js`, `dyxvcvr1.js`, `entry.CdIUu_Mz.css`, `index.CVwLeBkz.css`, 15 captures; Awwwards entry `awwwards.com/sites/thelinestudio-com` read 2026-09-18.

Corrected by the 2026-10-28 pass: three blink effects (there are four), one custom ease (two, mirroring the CSS curves), "no scrim" read as no theme handling (a per-section theme flip exists), a credits panel as a hinge only (it is reachable while closed), every CSS transition gated so route transitions do not run (the route, nav and filter sheets are ungated), a custom splitter, not SplitText (it is SplitText 3.11.3). Superseded by the 2026-09-18 pass: the 2024 work list, "greyscale everything", the two-place bookend, the "nothing between" type contract, the separate Site Credits page, and third-party-reconstruction flicker parameters (sources then: `design-bites`, `families.json`, `YashwantOstwal/the-line-awwwards-SOTM`, `roshanvijay37/Roshan`, batch-E 2026-09-17). The footer reads `2026`; the Roman numeral survives only in the case heroes' call-sheet row [verified, case/desktop-s00.png].
