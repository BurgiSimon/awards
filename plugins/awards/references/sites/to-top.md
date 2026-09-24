# TO TOP — https://www.to-top.ch/en

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | B2B service — a Swiss organisational-development consultancy (strategy, culture, leadership, sustainability; coaching, workshops, moderation) [verified, index.html headings; `<title>`] |
| Visitor mode | persuade — a gold CONTACT US pill in the nav, a contact form with a SEND disc in the close [verified, clean/desktop-state-reject.png; desktop-s100.png] |
| Awards | none found — one search on 2026-09-23 returned no award entry [verified, search]; no ribbon or award link in the served page [verified, index.html] |
| Corpus rating | D 6.8 / U 5.8 / C 6.6 / Co 6.3 → weighted 6.41, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Logotio — footer line "Created by Logotio" [verified, index.html footer] |
| Stack (evidence level) | **Webflow** (`data-wf-site`, `w-` classes, rspack `schunk` bundles, last published 8 Sep 2026) [verified, index.html] · **GSAP 3.15.0** + ScrollTrigger, SplitText, TextPlugin, ScrollToPlugin, EasePack from Webflow's GSAP CDN [verified, index.html] · **Lenis 0.2.28** (`studio-freight/lenis@0.2.28/bundled`) [verified, index.html] · **Spline** `@splinetool/viewer` 1.10.40 and 1.10.32, both imported [verified, index.html] · jQuery 3.5.1 [verified, index.html] · Weglot DE → EN subdirectory translation [verified, index.html] · iubenda consent, GA4, reCAPTCHA [verified, index.html; manifest.json] · fonts: Bon Vivant Serif (regular, bold), Nothing You Could Do, Montserrat in 18 files, all on the Webflow CDN, plus the Google WebFont loader requesting Montserrat 100–900 again [verified, site.css `@font-face`; index.html] |
| Palette | ground `--swatch--brand-green` |
| | `#0d352e` [verified, site.css `:root`] |
| | ink `--swatch--brand-white` |
| | `#fff` [verified, site.css `:root`] |
| | accent `--swatch--brandyellow` (CTA pill, sticker discs, script lines, trail) |
| | `#efb300` [verified, site.css `:root`] |
| | `--swatch--brand-darkgreen` |
| | `#1f2b13` [verified, site.css `:root`] |
| | `--swatch--brand-mintgreen` |
| | `#a3bfab` [verified, site.css `:root`] |
| | card and panel green (untokenised, 24 uses) |
| | `#28524d` [verified, site.css] |
| | cream paper ground for the cultural card and the close (untokenised, 21 uses) |
| | `#e5d5a3` [verified, site.css; which rule paints which section is inferred from desktop-s25.png] |
| | Strategy: **one deep forest-green ground + white ink + one gold accent, with a cream paper ground for the warm beats; all other chroma comes from photographic landscape cut-outs** [verified, captures + CSS] |
| Type | **High-contrast display serif + geometric grotesque + handwritten script accent**: Bon Vivant Serif for the claims and card titles (`h1` at `7cqw`, line-height 90 %), Montserrat for nav, labels and body, Nothing You Could Do for short gold asides [verified, site.css]. The hero line is two `div`s, not a heading [verified, index.html `.large-header-heading`] |
| WebGL dosage | moments — one Spline scene (a signpost) mounted lazily on desktop, a second `<spline-viewer>` eager in the mobile block, an AVIF signpost still beside it [verified, index.html]. `canvases: 0` in the manifest because the viewer draws inside its shadow root [inferred, manifest.json]; whether it rendered in a frame is [unknown] |
| Scroll model | native + Lenis 0.2.28 (`duration 2.3`, expo-out) on its own rAF loop calling `ScrollTrigger.update()`, desktop ≥ 990 px only; ScrollTrigger scrubs at `scrub: 1.2` [verified, index.html; manifest.json `scrollMode: native`] |
| Narrative model | chaptered journey — scroll is the climb: a trailhead hero, numbered concerns on a summit trail, offers laid on a map, a forest chapter about the firm, a contact close [verified, desktop-s00 to s100.png; index.html] |

## 1. Concept and narrative
**One idea:** organisational change as an ascent. The first viewport is a two-line serif claim over a dark green sky, a gold script line beneath it, and a layered mountain range rising from the bottom edge with a lone hiker raising an arm; a gold disc sits on the horizon like a sun and doubles as the first button, *where do you want to go?* [verified, clean/desktop-state-reject.png]. On scroll the claim rises and the mountain planes sink at different rates, so the range opens like a valley [verified, index.html inline script; clean/desktop-state-w2500.png].

Beats: a large card per concern, each with a faded numeral, a script kicker, a serif title and a peak cut-out with a gold dashed trail climbing to a dot at the summit [verified, desktop-s25.png]; the accompaniment offers as white-bordered green cards on a crumpled gold map texture with a compass object, in a slider with side arrows [verified, desktop-s50.png; desktop-rm-s50.png]; a dense forest chapter with a gold disc *more about to top* and the dashed trail looping through it [verified, desktop-s75.png]; a testimonial quote [verified, mobile-s50.png]; a contact form with a gold SEND disc, a script *here we go!*, a full-width serif caps wordmark line and a footer nav [verified, desktop-s100.png]. Register: warm, second-person, travel vocabulary throughout (peaks, journey, first step) [verified, index.html headings].

## 2. Structure and components
- **Nav**: a floating rounded bar with logo, five items (three with dropdowns, 25 `w-dropdown` nodes), a flag + EN language switch and a gold CONTACT US pill [verified, clean/desktop-state-reject.png; index.html]. Hidden on any downward scroll, shown on any upward scroll, by class swap [verified, index.html inline script]. Phone: logo, burger, flag [verified, mobile-s00.png].
- **Hero**: headline block, then `.parallax-components` holding the CTA disc, an overlay and six photographic mountain planes (`.mountain0`–`.mountain5`) [verified, index.html].
- **Sticker discs**: gold circles with rotated uppercase labels used as the section CTAs (hero, start programme, about, SEND) [verified, captures].
- **Concern cards**: numbered 01… cards, alternating green and cream grounds, stacked vertically with gaps [verified, desktop-s25.png].
- **Offer slider**: Webflow slider (`w-slider`, 8 nodes) of cards whose *Learn more* label follows the cursor inside each card [verified, index.html; desktop-s50.png].
- **Signpost**: a Spline scene over an AVIF still of a signpost [verified, index.html `.main-spline`, `signpost_english.avif`].
- **Close**: contact form (`w-form`, reCAPTCHA), serif caps wordmark line, hairline-ruled footer nav, logo block, LinkedIn and a book icon, legal links [verified, desktop-s100.png; index.html].
- **Back-to-top**: a gold-outlined circular arrow fixed bottom right [verified, desktop-s25.png].
- **Consent**: an iubenda panel over the lower 40 % of the desktop frame and 80 % of the phone frame until answered [verified, desktop-s00.png; mobile-s00.png].
- No preloader, no custom cursor, no sound, no page transition [verified, index.html; captures]. 404 not observed.

## 3. Visual language
- **Grounds**: forest green almost everywhere, cream for alternating cards and the close; photography fills whole chapters (map, forest) as the only other grounds [verified, captures].
- **Type**: the hero claim runs the serif at roughly 190 px on the 1440 frame, the second line tinted pale grey-mint, the script set in gold under it [inferred, clean/desktop-state-reject.png]. Card titles in the same serif at a smaller step, labels in tracked Montserrat caps [verified, desktop-s25.png]. The close sets the serif in caps across the full width [verified, desktop-s100.png].
- **Imagery**: dramatic, colour-graded landscape photography cut out into planes (range, peaks, forest, clouds) plus isolated objects (compass, backpack) and a hand-drawn arrow [verified, desktop-s25/s75.png; mobile-s100.png]. The render quality is uneven between stock-feeling plates and graded composites [inferred, captures].
- **Material**: large radii on cards (≈ 30 px), a paper-grain texture under the map chapter [inferred, desktop-s50.png].
- **Browser surfaces**: no `theme-color`, no meta description in the served HTML [verified, index.html].

## 4. Motion and effects (with parameters)
- **Lenis**: `new Lenis({ duration: 2.3, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true, mouseMultiplier: 1, smoothTouch: false, touchMultiplier: 2 })`, created only when `innerWidth >= 990`, driven by a private rAF that also calls `ScrollTrigger.update()` [verified, index.html]. A 2.3 s glide is roughly twice the corpus norm [inferred, against `[pattern:motion-vocabulary#scroll-philosophies]`].
- **Layered landscape parallax**: one timeline on `.parallax-components`, `start: '50% bottom'`, `end: 'bottom top'`, `scrub: 1.2`, every tween `ease: 'none'` at position 0: `yPercent` 0 / 30 / 52 / 55 / 70 / 80 on `.mountain0`–`.mountain5`, 125 on the CTA disc, −70 on `.logo-section` [verified, index.html]. A second timeline, `start: 'top bottom'`, `end: '35% top'`, `scrub: 1.2`, fades `.mountain4` to .5, `.mountain5` to .3 and brings `.header-overlay` and `.logo-section` to 1 [verified, index.html]. `will-change` is set in JS on each target and never removed [verified, same]. Wrapped in `ScrollTrigger.matchMedia('(min-width: 990px)')` [verified, same].
- **Reveals**: Webflow IX initial states in the head — `opacity 0`, `translate3d(0, 20%, 0)` and `filter: blur(8px)` on hero blocks; a `translate3d(0, −101%, 0)` drop; `rotateZ(6deg)` at 80 % width; `scale3d(.6, .6, 1)` on the cursor labels [verified, index.html `<style>`].
- **Sticker disc hover**: set to `rotate: 15`, `mouseenter` → `rotate: 8`, `mouseleave` → 15, `duration .8`, `power1.out` [verified, index.html].
- **Cursor-follow label**: per `.cursor-area`, target = pointer position in the card, `current += (target − current) * 0.1` each rAF, opacity toggled on enter/leave; one perpetual rAF per area, never cancelled [verified, index.html].
- **Spline mount**: an `IntersectionObserver` with `rootMargin: '1000px 0px'`, `threshold: 0` creates the `<spline-viewer>` once and unobserves [verified, index.html].
- **CSS easing**: one `cubic-bezier(.215,.61,.355,1)` in the whole stylesheet [verified, site.css].
- GSAP SplitText, TextPlugin, ScrollToPlugin and EasePack are registered; no inline use of SplitText was found, so their use lives in Webflow IX or nowhere [unknown].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Build / CMS | Webflow, four rspack `schunk` bundles + `webflow.js` | [verified, index.html] |
| Motion | Webflow IX + GSAP 3.15.0 ScrollTrigger + Lenis 0.2.28 | [verified, index.html] |
| 3D | Spline viewer, two versions imported, two scenes | [verified, index.html] |
| CSS | one 240 KB shared stylesheet | [verified, site.css size] |
| Images | AVIF and WebP with `srcset`; 72 of the `<img>` tags have `alt=""` | [verified, index.html] |

- 1923 DOM nodes; CLS .35 desktop, .10 phone [verified, manifest.json]. `lcpColdSynthetic` is a headless cold-cache artefact, not a performance claim.
- Page error on every profile: `spline-viewer` already defined, because the viewer is imported at 1.10.40 and again at 1.10.32 [verified, manifest.json; index.html].
- Console: an SVG `height="auto"` and four `viewBox="0 0 50 100%"` errors [verified, manifest.json].
- Montserrat is loaded twice: 18 self-hosted TTF/OTF files and the Google loader's 18 weights [verified, site.css; index.html].

## 6. Weaknesses
- Reduced motion: **fail**. No `prefers-reduced-motion` in the HTML or CSS [verified, absent]; `desktop-rm-s00` matches `desktop-s00` in composition; Lenis and the scrubs run regardless. Nothing observed stays hidden: `desktop-rm-s50` shows the offer card fully drawn [verified, captures].
- Keyboard: **[unknown], leaning fail**. The served HTML has no skip link, no `<main>`, zero `aria-label` and zero `aria-expanded`; Webflow's dropdown runtime may add them at load [verified, index.html; runtime inferred]. The offer cards are links, so the cursor label is decoration, not a gate [verified, index.html].
- Semantics: **fail**. The hero claim is `div`s; five `h1`s are card titles and closing lines [verified, index.html].
- DOM behind the canvas: **pass** — the Spline signpost sits beside an AVIF still; all copy is in the markup [verified, index.html].
- Load gate: **fail** in practice — no preloader, but the consent panel covers most of every frame until answered, and on the phone it covers the whole hero claim [verified, mobile-s00.png].
- Phone: **partly designed** — burger, stacked cards, serif claim scaled; Lenis and the landscape parallax are withheld under 990 px, which is right, but the mobile Spline mounts eagerly without the observer [verified, mobile-s00/s50.png; index.html].
- Wayfinding and conversion: **partial** — CONTACT US is always in the nav, but the nav hides on every downward pixel; no chapter indicator [verified, index.html; captures].
- Runtime: a duplicated 3D library, duplicated fonts, one perpetual rAF per cursor area, Lenis on a separate clock from the GSAP ticker, CLS .35 [verified, index.html; manifest.json].

What the awards skills do differently: one ticker for Lenis and ScrollTrigger `[recipe:boot-lenis-gsap]` at a ≈ 1 s glide; a static tier that freezes the landscape planes and the scrubs `[recipe:reduced-motion-switch]`; the hero claim as the page's single `h1`; one Spline import behind one observer, on every breakpoint; cursor followers paused off-screen on the shared ticker `[recipe:cursor-two-speed]`; a consent bar that never covers the first claim on a phone.

## 7. Principles
1. **Let the metaphor draw the wayfinding line.** One dashed route that threads from section to section turns a list of services into a path, and tells the visitor they are progressing without a progress bar.
2. **Cut the hero picture into depth planes and scrub them apart.** Six photographic layers at rising `yPercent`, the claim lifting while the ground sinks, give real depth without a single shader.
3. **Put the primary action inside the world.** A button that is also the sun on the horizon moves with the parallax and is read before it is recognised as UI.
4. **Three voices, strict roles.** A display serif for claims, a script only for short human asides, a plain grotesque for everything operational; the script stays special because it is rationed.
5. **Keep 3D optional.** A still stands in the layout; the scene is mounted only when a generous observer margin says it is about to be seen.

## 8. Take / Don't take
- **Take:**
  - Multi-plane cut-out parallax: planes at spaced `yPercent` targets (0 → 80) on one scrubbed timeline with `ease: 'none'`, a second shorter timeline for the fade, desktop-only by media query, frozen by the static tier `[pattern:motion-vocabulary#scrub-and-refresh-rules]`.
  - A route line as a structural thread across chapters, drawn or static `[recipe:scroll-drawn-svg-path]`.
  - The CTA as an in-world object with a small resting rotation that relaxes on hover (≈ 15° → 8°, .8 s ease-out) `[recipe:magnetic-button]`.
  - Lazy 3D behind `IntersectionObserver` with a viewport-sized `rootMargin` and a still underneath `[pattern:webgl-architecture#content-fallback-tiers]`.
  - A script accent limited to one short line per chapter `[pattern:typography#contracts]`.
- **Don't take:**
  - The palette as literal values:
    - `#0d352e` [verified, site.css]
    - `#efb300` [verified, site.css]
    - `#1f2b13` [verified, site.css]
    - `#a3bfab` [verified, site.css]
    - `#28524d` [verified, site.css]
    - `#e5d5a3` [verified, site.css]
  - The mountain-ascent metaphor for a consultancy, the hiker, the signpost, compass and backpack objects, or any copy line.
  - Bon Vivant Serif + Montserrat + Nothing You Could Do as a set; Montserrat is a reflex face.
  - The section order trailhead → numbered concerns → offers on a map → forest about → contact.
  - A 2.3 s Lenis on its own clock, a duplicated 3D import, a heading-less hero, a nav that hides on every pixel and a consent panel over the claim: these are what to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML and shared CSS read |
| Award and credits | none found in one search; credit read from the footer |
| Concept, structure, visual language | medium-high — the consent panel dims the lower 40 % of every scroll frame; one clean hero frame after rejecting consent |
| Motion parameters | high — inline scripts and Webflow IX initial states read; Webflow IX timelines not read |
| Weaknesses | high for reduced motion, semantics, runtime; keyboard behaviour after Webflow runtime load [unknown] |

**Live pass 2026-09-23: reachable, capture exit 2** (desktop-rm s75 screenshot timeout; analytics beacons aborted), `scrollMode: native`. The iubenda panel sat over every frame; one retry with `--states` clicked *Reject all* and captured a clean hero, but its wheel states did not move past the hero (Lenis at `duration 2.3` in headless) and s8000 timed out. Sources in `.awards/research/to-top/`: 14 captures + `manifest.json`; `clean/` (desktop s00 and four state frames + `manifest.json`); `index.html`; `site.css` (`totop.webflow.shared.bbf6efdd5.min.css`). Not observed: menu and dropdowns open, the Spline scene rendered, inner routes, the 404.
