# Stanzza — https://stanzza.design/awards

| Field | Value |
|---|---|
| Class | studio (architecture + interior design practice, Spain; residential and hospitality interiors, enquiry-led) [verified, index.html + captures] |
| Visitor mode | persuade [verified, captures: a persistent call CTA in every desktop frame] |
| Awards | none read; the route is named `/awards`, which suggests a page built for a submission [inferred]; any entry, date or score [unknown] |
| Corpus rating | D 7.2 / U 6.4 / C 6.7 / Co 7.0 → weighted 6.84, 2026-10-05 [inferred, from captures against references/jury/rubric.md]; official scores: none read |
| Studio / credits | [unknown]; videos are served from a `futuria-webm-video.b-cdn.net` bucket [verified, index.html], which may name the build studio [inferred]; Russian-language warnings in the custom scripts [verified, index.html inline scripts] |
| Stack (evidence level) | **Webflow** with IX3 interactions, last published 30 Sep 2026 [verified, index.html comment + `webflow.f9c49967…js`] · **GSAP 3.15.0** + SplitText + Flip + ScrollTrigger from Webflow's CDN [verified, index.html script src] · **Lenis 1.0.33** (`@studio-freight`, unpkg) on its own rAF loop [verified, index.html] · **Swiper 11** (jsdelivr) [verified, index.html] · jQuery 3.5.1 (Webflow) · HubSpot Meetings embed [verified, index.html] · fonts: Instrument Serif, Helioscond, Katherine Plus [verified, site.css `@font-face`] |
| Palette | warm bone ground `--_color---white #f4f3eb` [verified, site.css] · ink `--_color---main #1e1e1e` and `--_color---black #0f0f0f` [verified, site.css] · milk greys `#e5e4dc`, `#d8d6cb`, `#c4c2b7` [verified, site.css] · one navy gradient chapter `#030b24` → `#2c3c66` [verified, site.css `--_color---gradient-blue*`] · an olive gradient `#525c2f` → `#7a8452` [verified, site.css `--_color---gradient-green*`] · footer gradient to `#b0aea3` [verified, site.css] · strategy: bone ground + charcoal ink, one deep-colour chapter as the only saturated field, chroma otherwise from photography [verified, captures] |
| Type | **Instrument Serif** display `--font-family--heading`, h1 4rem at line-height .88 [verified, site.css] · **Helioscond** condensed grotesque for body and UI, body 1rem / 1.32, −1 % tracking [verified, site.css] · **Katherine Plus** handwritten script for one tagline [verified, site.css `--font-family--design` + desktop-rm-s00.png] · caption .667rem tracked +16 % uppercase [verified, site.css] |
| WebGL dosage | none — 0 canvases in all three contexts [verified, manifest.json]; motion is DOM + 11 MP4/WebM loops [verified, index.html] |
| Scroll model | native + Lenis (lerp .1, own rAF, not wired to ScrollTrigger) [verified, index.html inline]; CSS sticky stages (11 `position:sticky` rules) with scrubbed horizontal counter-translation [verified, site.css + IX3 JSON] |
| Narrative model | specification (preloader → poem-line hero → numbered service promises → three disciplines as stages → projects slider → figures → contact close) [verified, captures + index.html headings] |

## 1. Concept and narrative
The studio's name is read as a stanza, and the hero line defines it as a group of lines forming one unit [verified, index.html h1, fragment]. The idea is that a home is composed, so the page sells **control and calm**, not spectacle. The four promises are about accountability, process, visible costs and site quality, which is a delivery pitch in a luxury register [verified, index.html h3s].
- s00: the preloader still holds. A dimmed living-room photograph sits in a centred frame under the wordmark and a script tagline [verified, desktop-s00.png].
- s25: a ruled two-column list. Each row pairs a portrait or a process photograph with a bracketed number and a serif promise [verified, desktop-s25.png].
- s50: a rounded navy panel rises over the bone ground for the second discipline. Five small photographs sit in a stepped chequer, and a line drawing of a plan drifts off the left edge [verified, desktop-s50.png].
- s75: four figure cards with large italic numerals. One card is lit with a photograph, and the others wait in pale grey [verified, desktop-s75.png].
- s100: a gradient footer over a pencil sketch of a pavilion, with a single dark "start a project" button [verified, desktop-s100.png].
The copy is short, declarative and calm, in two- or three-word headings [verified, index.html h2s].

## 2. Structure and components
- **Preloader:** two rows of mirrored image strips fan out in `svw` steps, the hero frame grows from a 4svw square to full bleed, and the hero line splits in by character [verified, index.html inline 4]. It replays on every visit: the skip flag reads a localStorage key that no script writes [verified, index.html inline 3 + no matching `setItem`].
- **Header:** menu pill on the left, centred wordmark, dark call button on the right. It hides on scroll down and turns dark over the six `data-scroll="dark"` sections [verified, index.html inline 10].
- **Numbered promise rows** with hairline rules and a bracketed index [verified, desktop-s25.png].
- **Discipline stages:** sticky panels whose contents are translated sideways by scrubbed IX3 timelines (`x → −145.5vw`, `−56vw`, `−95.5vw`) [verified, IX3 JSON in webflow.f9c49967…js].
- **Composition cards** with a pointer-follow element lerped at .12, on `(hover: hover) and (pointer: fine)` only [verified, index.html inline 11].
- **Projects section:** scaled stacked backs, then a Swiper slider that is unlocked by scroll progress (§4) [verified, index.html inline 18–19].
- **Figure cards:** counters count up over 1 s on an ease-out quad when 20 % visible [verified, index.html inline 17]. The phone captured one mid-count at 31 of 32 [verified, mobile-s75.png].
- **Footer:** route list, socials, phone number, back-to-top, legal links and a sketched building [verified, desktop-s100.png]. There is also a cookie banner after 6 s and a HubSpot meetings modal [verified, index.html inline 2 + script src].

## 3. Visual language
- **Grounds:** a warm bone ground carries almost every section, with charcoal ink and milk-grey card fills. Saturated colour appears once, as a navy gradient panel with rounded shoulders that interrupts the bone [verified, desktop-s50.png + site.css].
- **Type:** a narrow serif display at a tight .88 line height, a condensed grotesque for reading, and a handwritten script used once, as a signature rather than a voice [verified, site.css + captures]. Large italic numerals do the figure work [verified, desktop-s75.png].
- **Imagery:** warm interior photography, greyscale process shots and pencil architectural sketches [verified, captures]. Images start blurred (`.is-blur`) and sharpen on entry [verified, index.html inline 8].
- **Spacing:** separators run on a 1.777rem base ladder from .444rem to 6.666rem [verified, site.css]. The bracketed indices and uppercase captions are the micro layer [verified, captures].

## 4. Motion and effects (with parameters)
- **Smooth scroll:** `new Lenis({ lerp: .1, wheelMultiplier: 1 })` on a bare rAF loop, with `data-lenis-start/stop/toggle` hooks [verified, index.html inline 1]. It is not connected to `ScrollTrigger.update` [verified, absent].
- **Text:** SplitText chars or words from `opacity 0, yPercent 20` over 1.5 s, stagger .03, `power2.out`, triggered by an IntersectionObserver at `rootMargin 0 0 -20% 0` [verified, index.html inline 13 + 16]. Two classes bind the same `data-text` values, and the second one marks the first one's targets as off [verified, index.html inline 16].
- **Load:** a 3.8 s desktop timeline with `delay 1` and a separate mobile timeline (§5 lens) [verified, index.html inline 4].
- **Scroll:** 18 IX3 scroll interactions, 15 at `scrub .8`, plus a hand-ported projects timeline at `scrub .8` on `power2.inOut` [verified, webflow.f9c49967…js + index.html inline 18].
- **Pointer:** one lerped follower (.12) on the composition cards [verified, index.html inline 11]. A custom cursor SVG is requested [verified, manifest.json failed requests].
- **Video:** `data-autoplay` loops start on the first user gesture (pointer, touch, key, scroll or wheel) and pause off-screen. A codec probe skips HEVC and alpha files the browser cannot play [verified, index.html inline 9].

## 5. Tech and pipeline
- **Webflow shell:** the page is published from Webflow and its interactions are authored in IX3. The engine (`webflow.schunk.dc27f234…js`, 272 KB) bundles the GSAP glue and CustomEase [verified, fetched sizes + grep]. Custom behaviour sits in 20 inline scripts, about 43 KB [verified, index.html].
- **Weight:** 2,794 DOM nodes, 181 `<img>` and 13 `<video>` [verified, manifest.json + index.html]. Video header sizes are 22 KB for the preloader webm, 805 KB for the H.264 loop and 454 KB for a slide loop [verified, `curl -sI` content-length]. CLS is .21 on desktop and .22 on the phone [verified, manifest.json].
- **Responsive:** the breakpoint is `window.innerWidth < 768`, read once at init by the preloader and by the projects timeline. A resize across it does not rebuild anything [verified, index.html inline 4 + 18]. The viewport meta sets `user-scalable=no, maximum-scale=1.0` [verified, index.html].

### Tech lens: GSAP
- **Registration:** `gsap.registerPlugin(SplitText, Flip, ScrollTrigger)` from GSAP 3.15.0 on Webflow's CDN [verified, index.html inline 12 + script src]. Flip is registered but never called in the custom code [verified, one `Flip.` hit in index.html, the registration].
- **IX3 as the authoring layer:** 18 interactions of `controlType:"scroll"`, each with a serialised `scrollTriggerConfig` [verified, webflow.f9c49967…js].
  - `clamp: true` on all 18 [verified].
  - `scrub .8` on 15, `scrub 1` on 2, `null` on 1 [verified].
  - `enter:"play"` with every other action `"none"` [verified].
  - 18 timeline ids whose actions are mostly `wf:transform` x and y, opacity, width and height [verified].
  - Eases are serialised as numeric codes, `ease:5` ×56 and `ease:0` ×14 [verified]; the code-to-curve map is [unknown].
- **Reduced motion in IX3:** `conditionalPlayback: [{ type: "prefers-reduced-motion", behavior: "dont-animate" }]` is set on 10 of the 18 interactions [verified, webflow.f9c49967…js]. The custom GSAP code has no reduced-motion or `matchMedia` branch [verified, absent in index.html].
- **Delayed-start scrubs:** eight windows start at `top -20%` to `top -35%` and end at `bottom bottom` [verified, IX3 JSON]. A tall sticky section therefore holds still for a fifth to a third of a viewport before its sideways scrub begins [inferred, from the configs + desktop-s50.png].
- **Preloader timeline:** 13 position parameters in absolute seconds, from 0 to 3.76 [verified, index.html inline 4].
  - Strips move ±2.2svw over .608 s, `power2.out`, with the second row at .07 [verified].
  - 14 mirrored items fan from ±30.8svw down to ±4.4svw in 4.4svw steps, starting at 1.05 with stagger .02 over .52 s; the outer four also fade [verified].
  - The hero frame goes 4svw → 42×28svw at 1.9 (.77 s), then → 100svw × 100svh at 2.68 (.76 s); the image scales to 1.25 over 1.55 s at 1.99 [verified].
  - The preloader copy exits by chars and words with `stagger: { each: .03, from: "end" }` at 1.53 [verified].
  - The hero chars enter at 2.76 [verified]. The header is restored by `.call()` at 3.76 [verified].
  - Lenis is stopped for the whole sequence and restarted `onComplete` [verified].
  - The phone gets its own timeline: ±6.25svw strips on `power2.inOut`, a 60×45svw intermediate frame and a 4-step fan from ±37.5svw [verified].
- **Undefined eases:** seven tweens pass `ease: i.wf4 / i.wf5 / i.wf6`, keys that the element map never defines [verified, index.html inline 4]. So they run on GSAP's default ease [inferred].
- **Scrub progress as a gate:** the projects timeline (`top -50%` → `bottom bottom`, `scrub .8`) reads `self.progress` in `onUpdate` [verified, index.html inline 18].
  - At ≥ 1.5 / 3.12 on desktop (≥ 1 / 2.5 on the phone) it dispatches `apart:ready`, which builds the Swiper with 5 s autoplay [verified].
  - Below that threshold it dispatches `apart:lock`, which calls `slideToLoop(0, 0)` and destroys the instance [verified].
  - Touch swiping is forced off (`allowTouchMove: false`) [verified, index.html inline 19].
- **Projects timeline structure:** backs scale .65 → 1.5 and .65 → 1.25 and the slider .65 → 1 over 3 units at 0, .1 and .2. Heads and advantages slide in over 1 unit at .5 [verified, index.html inline 18].
  - Opacity switches use `duration: .001` tweens at 1 and 1.5 as step changes inside the scrub [verified].
  - The phone variant tweens `width/height/x/y` from 95 % × 35 % [verified].
- **Double drive:** the custom intro bars (`65svh/25svh → 0svh`, `top bottom` → `top 35%`, `scrub .8`) carry the comment "t-e350b67b", and an IX3 interaction with that timeline id targets the same section [verified, index.html inline 18 + IX3 JSON]. Both may run [inferred].
- **Smooth scroll:** Lenis does not share `gsap.ticker` and ScrollTrigger is not fed from Lenis [verified, index.html inline 1]. A single `ScrollTrigger.refresh()` runs on `load` [verified, index.html inline 18].

## 6. Weaknesses
- **Reduced motion — fail.** `desktop-rm-s00` still shows the preloader hand-off mid-run, with a headline half-revealed char by char and the header faded [verified, desktop-rm-s00.png]. In `desktop-rm-s25` the body copy is still fading [verified]. Only 10 of the 18 IX3 interactions opt out, and no custom tween does [verified, §5 lens].
- **Images — fail.** All 181 `<img>` carry `alt=""` [verified, index.html], including the project photographs that carry the portfolio.
- **Landmarks and keyboard — partial.** There is a header, a footer and Webflow navs, but no `<main>`, no skip link, 6 `aria-label`s and 0 `tabindex` [verified, index.html]. The projects slider is driven by scroll and autoplay, with touch disabled [verified, inline 19].
- **Zoom — fail.** The viewport meta blocks pinch zoom [verified, index.html].
- **Load gate — fail.** The preloader runs about 4.8 s, counting the 1 s delay, and its skip never fires because of the key mismatch [verified, inline 3 + 4].
- **Phone — pass.** It is a designed layout: a full-bleed hero with the line set large, a menu pill and an icon mark, and separate preloader and projects timelines [verified, mobile-s00.png, mobile-s50.png].
- **Wayfinding — partial.** Promises and stages are numbered. The call CTA is persistent but hides on scroll down [verified, captures + inline 10].
- **Craft:** CLS .21, a second Lenis-less clock for ScrollTrigger, undefined ease keys, and two text animators on one attribute set [verified, §4–§5].
What the awards skills do differently: a `matchMedia` reduced branch that settles every split line, alt text on the work, zoom left alone, a preloader that is skipped on a real flag, and Lenis on the GSAP ticker so scrubs and smooth scroll share one clock.

## 7. Principles
1. **A calm brand can still be choreographed.** Long, eased scrubs at one shared smoothing value (.8 here) read as composure, not as spectacle.
2. **Hold before you scrub.** Starting a sticky section's scrub a third of a viewport late gives the reader a rest frame before anything moves.
3. **Gate an autonomous component on scroll progress, and reset it on the way back.** A carousel that only exists once its stage has fully opened never fights the scrub that opens it.
4. **Spend saturation once.** A single deep-colour chapter on a bone ground does the chapter-break work that a colour-per-section scheme spreads thin.
5. **Script as a signature, not a voice.** A handwritten face used for one line adds authorship without costing legibility.

## 8. Take / Don't take
- **Take:** the delayed-start sticky scrub window `[pattern:gsap-choreography#scrolltrigger-configurations]`; the progress-gated component with a reset on reverse `[pattern:motion-vocabulary#scrub-and-refresh-rules]`; step changes as near-zero-duration tweens inside a scrub; one deep-colour panel as the only saturated field `[pattern:color-and-material]`; a narrow serif display over a condensed reading face.
- **Don't take:** the stanza and poem conceit or any copy line; the hex set `#f4f3eb` / `#1e1e1e` / `#030b24` → `#2c3c66` [verified, site.css]; the olive pair `#525c2f` / `#7a8452` [verified, site.css]; Instrument Serif + Helioscond + Katherine Plus as a set; the mirrored-strip preloader fan as-is; the order of the promise, discipline, projects and figures beats; empty alts, blocked zoom and the always-on preloader.

## 9. Confidence and sources
Header and §1–§3: high [verified, captures + site.css + index.html]. §4–§5 and the GSAP lens: high for literal values; structure read from IX3 JSON and inline code is [verified] where quoted and [inferred] where noted. Awards and credits: [unknown]; no entry was read.
**Live pass 2026-10-05:** reachable, `robots.txt` empty and no AI-usage file (404 on `/ai-usage.txt`, `/llms.txt`, `/ai.txt`). Capture exit 0, scroll mode native, states reached by native scroll. Sources: `.awards/research/stanzza/` — `desktop-s00…s100.png`, `mobile-s00…s100.png`, `desktop-rm-s00…s100.png`, `manifest.json`, `index.html`, `inline.js` (extracted), `site.css`, `webflow.f9c49967.2e81431a13fac887.js`, `webflow.schunk.dc27f234d8b60570.js`, `webflow.schunk.b243a97fed2d3524.js`, plus `curl -sI` on three videos.
