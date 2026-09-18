# Slosh Seltzer — https://sloshseltzer.com/

| Field | Value |
|---|---|
| Class | brand — a multi-flavour (multi-SKU) DTC hard-seltzer experience, not a storefront-first site [verified: `families.json` family `flavor-swap-colorfield`] |
| Visitor mode | experience |
| Awards | Awwwards **Site of the Month Jun 2024** and **Site of the Day 5 Jun 2024** [verified: `families.json` + `roshanvijay37` data.js]; CSS Design Awards **Website of the Year 2024 nominee**, final judge score **8.99** [verified: two AI-compiled repos — medium]; Muzli weekly #450 feature [verified]; Awwwards score and sub-scores, Developer Award, FWA, Godly [unknown] |
| Studio / credits | **contested.** Buttermax (`buttermax.net`, `hello@buttermax.net`) [recalled medium-high: CSSDA nominee-page metadata, the Muzli card title, a bookmark export; `Any-IDE` calls it an in-house exploration] vs Active Theory [recalled low-medium: `roshanvijay37` data.js + two AI-compiled corpora]. Buttermax is the more likely creator; state neither as fact. Individuals [unknown] |
| Stack (evidence level) | WebGL with custom GLSL and render-target compositing [verified: Codrops, 23 Feb 2026] · Three.js [recalled medium: two second-hand analyses + the article's Three.js framing] · GSAP and / or Lenis [inferred] · framework, CMS, commerce platform, hosting, fonts, versions [unknown] · a scraped "WordPress" row is rejected as junk (the same record files the site under "Child Happiness") |
| Palette | `#FFC1FF` pink · `#00A165` green · `#FF0837` red · `#0069D8` blue · `#FF5F00` orange · `#FFC800` yellow [verified: sampled, `families.json`]. Strategy: flavour-swap colourfield — six saturated, unmodulated hues, one on screen at a time; the swap is the event. Light vs dark ground [contested, see §3] |
| Type | Slosh's faces [unknown]. Family-level contract only: one display word drawn through the focal object at viewport scale, line-height 1, no kicker [inferred, family-level; not confirmed for Slosh] |
| WebGL dosage | canvas-first, with a DOM colour system bound to the canvas [verified at family level; recalled medium for Slosh] |
| Scroll model | section switcher — scrolling moves between 3D sections through GPU compositing, not layout [verified: Codrops names sloshseltzer.com for exactly this] |
| Narrative model | single-object launch — a very short loop around one payoff, built for repeat and sharing [recalled medium] |

> Weakest card in batch E: the site was unreachable and the interaction description rests on a few second-hand accounts that partly conflict. Family-level claims describe the `flavor-swap-colorfield` family (exemplars Delassus and B/D® JAMS), not Slosh specifically, and are labelled as such throughout.

## 1. Concept and narrative
**One idea (family-level) [verified, family-level]:** the palette is the navigation. One flat, unmodulated colour field is bound to the current SKU by data attributes; choosing a flavour repaints ground, panel, button, ink and shadow together in a single gesture, and there is no other transition. One focal object sits on the field; the chrome stays tiny. The family's "for" clause: multi-SKU lines with a small hand-picked palette and budget for one commissioned hero object per SKU — beverages, produce, records [verified].

**The loop [recalled medium]:** land → engage with the can → get the payoff. A first-hand-sounding account calls the journey extremely short and a loop rather than a linear path. The peak is a "pop the top" moment — an interactive can-opening with liquid and bubble physics and floating fruit, described as chaotic but contained, with real weight and momentum [recalled medium: second-hand accounts]. Other accounts add a spinning 3D can, fluid cursor trails, particle bursts on pointer movement and a backdrop of looping colourful text and abstract shapes [recalled low-medium: AI-written doc, directional only].

**Register:** classified as Maximalism — layered patterns, bold colour everywhere, visual abundance [verified: `lidge-jun/design-isms`]; the tone reads as candy packaging [inferred]. Copy lines [unknown].

## 2. Structure and components
Routes, preloader, cursor, footer, easter eggs [unknown].

| Component | What it does | Label |
|---|---|---|
| Edge-pinned chrome | logotype, hamburger, language rail, a low product row whose underline doubles as an autoplay countdown track | [verified, family-level] |
| Hero can | interactive 3D can as the single focal object | [recalled medium] |
| Flavour switcher | the primary navigation; each choice repaints the world | [recalled medium for Slosh; verified family-level] |
| "Pop the top" | the physics payoff — liquid, bubbles, fruit | [recalled medium] |
| Section transitions | 3D sections composited on scroll | [verified: Codrops] |
| Ingredients / nutrition strip, stockist locator, age gate, social marquee, newsletter, Shopify-style buy path | genre furniture for a DTC alcoholic seltzer, 2023–26 | [inferred, genre-typical; not confirmed] |

## 3. Visual language
- **Palette** [verified hexes]: six roughly equal-weight, fully saturated hues, one per flavour. The family thesis implies no gradient, no noise and no photographic ground [verified, family-level].
- **Light vs dark** [contested → unknown]: the sampled palette holds no dark value and the family describes flat bright fields, but a Korean reference list describes the site as dark with colourful micro-interactions. Different sections may use different grounds.
- **Family vocabulary** [inferred, family-level; **not confirmed for Slosh**]: one commissioned focal object at billboard scale, hue-locked so it survives every repaint; one display word drawn *through* the object at viewport scale (line-height 1, no kicker); shadows tinted to each theme's own darkness at a constant `.15` alpha; interiors inverting to near-white with the hue surviving as a band or card.
- **Not Slosh:** the typeface Sailec and the faceted low-poly fruit belong to Delassus, a family exemplar. Do not attribute either to Slosh. Slosh's own faces [unknown].
- **Layout**: the field owns the screen; chrome is pinned to the four edges so nothing competes with the object [verified, family-level].
- Browser surfaces [unknown].

## 4. Motion and effects (with parameters)
- **Composite rendering for section transitions** [verified: Codrops, Jeremy Chang (Active Theory), 23 Feb 2026, "Composite Rendering: The Brilliance Behind Inspiring WebGL Transitions"]: each section's scene renders to an off-screen `WebGLRenderTarget`; the resulting textures are composited onto a fullscreen plane whose custom fragment shader performs the wipe / warp / dissolve. The article lists "Active Theory & Slosh Seltzer" as two separate examples of scroll-transition compositing. Compare the scene cuts in [site:igloo].
- **The swap is the transition** [verified, family-level]: ~1 s `cubic-bezier(.645,.045,.355,1)` repaint across every colour slot; the WebGL clear colour is RGBA-lerped in the same tween so canvas and DOM never desync; restart-from-current so rapid switching does not jump; two-phase quint easing on the nav bar.
- **Physics** [recalled medium]: pointer-reactive fluid / bubble behaviour, a physics "pop" reward, particle bursts.
- **Shaders** [inferred]: custom GLSL. A developer built a raymarched SDF liquid explicitly inspired by the Slosh campaign (`iamgoodbytes/testkitchen.goodbytes.be`) — his implementation choice, not evidence of theirs.
- Sound, preloader sequence, route transitions [unknown].

## 5. Tech and pipeline
- WebGL, custom GLSL, render-target compositing [verified: Codrops; CSSDA tags the site "WebGL"]. Three.js as the manager [recalled medium]. GSAP and / or Lenis for orchestration [inferred].
- **Mobile** [recalled medium]: two separate sources cite Slosh as proof that heavy WebGL / Three.js is viable on the mobile web — an engineered mobile path rather than a static fallback.
- Genre survival rules, worth teaching regardless [inferred]: cap DPR (~1.5) *and* total pixel count (e.g. 2560 × 1440); ship `_ld` low-detail asset variants; SMAA instead of MSAA; half-float render targets; pause the render loop off-screen.
- Framework, CMS, commerce platform, hosting, fonts, versions, budgets, resize strategy [unknown]. The "WordPress" row in one scraped dataset is unreliable and must not be repeated.

## 6. Weaknesses
- `prefers-reduced-motion`, keyboard operability and age-gate accessibility [unknown]; given the genre, assume none shipped and treat it as the gap to close.
- A physics-heavy pop with no non-motion equivalent is a real accessibility problem — vestibular triggers plus an interaction whose payoff only exists in motion [note].
- The contested ground (light vs dark) suggests either inconsistent sections or unreliable sources; the corpus cannot say which.
- No Awwwards sub-scores exist to calibrate against; the CSSDA 8.99 is AI-compiled.
- Corpus weakness: the creator credit is contested; the card carries the pattern, not an attribution.
- **What the awards skills do differently:** the flavour switcher is a real radio group or `<button>`s with `aria-pressed` and arrow-key movement, and `data-theme` on `documentElement` is the single source for DOM tokens *and* the canvas clear colour; under reduced motion the swap is an instant repaint (no 1 s tween), fluid trails are off, and the pop becomes a static "opened" state that still shows the payoff; product name, flavour, ingredients and the buy link live in semantic HTML with the canvas `aria-hidden`; the age gate is an accessible dialog (focus trap, `inert` on the page, remembered); loading is staged with the GL chunk lazy and a per-SKU still as the no-WebGL tier; mobile runs the DPR / pixel-cap / half-float / SMAA / low-detail tiers above.

## 7. Principles
1. **Product nature = interaction nature.** The thing sold is liquid, so the interaction is liquid; derive the signature from the physical truth of the product.
2. **Palette as information architecture.** When switching a variant repaints the whole world, navigation, brand and delight collapse into one gesture.
3. **One earned payoff beats ten effects.** Maximal surface, minimal structure — a short loop around a single shareable moment.
4. **Composite rendering is the transition engine.** Render-to-texture plus a fullscreen shader lets a maximalist site change worlds without seams or loading states.
5. **Hand-pick the theme set.** Four to ten chosen hues; generated palettes turn the same pattern into an arbitrary rainbow — the documented failure mode.
6. **Joy is a legitimate brief.** In a year of cold monochrome WebGL, a saturated, physically playful site took a SOTM and a WOTY nomination.

## 8. Take / Don't take
- **Take:**
  - Theme-swap as navigation: N `[data-theme]` token sets (ground, ink, panel, button, shadow); one ~1 s `cubic-bezier(.645,.045,.355,1)` repaint across every slot; the WebGL clear colour RGBA-lerped in the same tween; restart-from-current. Decision: use it when the product has real variants and the palette can stay small and hand-picked. Compare the colour-as-bookend opposite in [site:the-line].
  - Composite rendering for section transitions: render scene A to a `WebGLRenderTarget`, map it onto a fullscreen plane in scene B, drive the wipe / warp / dissolve in that plane's fragment shader. One pattern covers scroll transitions, 3D thumbnails and multi-scene overlays.
  - Derive the signature interaction from the product's physics — liquid → fluid, crisp → shatter, elastic → spring — name the moment and build the page around it (compare the single-object launch in [site:oryzo]).
  - One commissioned focal object per SKU, hue-locked so it survives every repaint; the pattern collapses with stock 3D.
  - Chrome pinned tiny to the four edges so the field owns the screen; a product-row underline that doubles as an autoplay countdown.
  - The mobile WebGL budget rule: DPR cap plus an absolute pixel cap (e.g. 2560 × 1440), half-float RTs, SMAA, low-detail variants, render loop paused off-screen.
  - Maximalism discipline: a small hand-picked theme set (4–10), one hue on screen at a time.
- **Don't take:**
  - The hard-seltzer can as the object, the "pop the top" moment, floating fruit, bubble physics as the payoff.
  - The six hexes `#FFC1FF` / `#00A165` / `#FF0837` / `#0069D8` / `#FF5F00` / `#FFC800`, or six flavour colours as a set.
  - The edge-pinned chrome layout (logotype / hamburger / language rail / countdown product row) reproduced as-is.
  - The Delassus details (Sailec, faceted low-poly fruit) — they are not even Slosh's.
  - Any credit line: do not name Buttermax or Active Theory as the author without new evidence.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Awards (SOTM Jun 2024, SOTD 5 Jun 2024) | high — two sources |
| CSSDA WOTY 2024 nominee, 8.99 | medium-high — two sources, both AI-compiled |
| Credits | contested — Buttermax (medium-high) vs Active Theory (low-medium) |
| Palette hexes | high — sampled dataset |
| Palette-as-navigation concept | high at family level; medium that Slosh executes it fully |
| Composite rendering | high — named in a Codrops article by an Active Theory developer |
| "Pop the top" / liquid physics | medium — first-hand-sounding but second-hand accounts |
| Typography, sections, sound, framework, reduced motion | unknown |
| WordPress claim | rejected as unreliable |

Sources: `raw.githubusercontent.com/ryanonline1234/mediatastelibrary/main/data/families.json` (family `flavor-swap-colorfield`) · `.../roshanvijay37/Roshan/main/public/awwwards/data.js` · `.../vigchetan/Any-IDE/main/docs/award_winning_analysis.md` and `.memory/url_source_meta.json` · `.../mrbrandonmills/Self-Actualization-Website/main/docs/plans/2025-01-24-award-winning-scroll-animation-research.md` · `.../organvm-iii-ergon/fetch-familiar-friends/main/docs/archive/{SYNTHESIS.md, DISTILLED-dogcal-schedule.md, dogcal-schedule.md}` · `.../TUARAN/frontend-weekly-digest-cn/main/weekly/455/…` (CN translation of Jeremy Chang, Codrops, 2026-02-23) · `.../lidge-jun/design-isms/main/assets/data/isms.json` · `.../muzlix/blog-content-md/main/weekly-designers-update-450.md` · `.../realAllenSong/frontend_mockup/.../ButtermaxReplica.tsx` · `.../iamgoodbytes/testkitchen.goodbytes.be/.../monster-drink-liquid-concept.md` · `github.com/phucbm/2dwa-slosh-seltzer` · `cssdesignawards.com/woty2024/sites/slosh-seltzer` (cited, not fetched). Batch-E research report, 2026-09-17; the site itself was unreachable through the egress proxy.
