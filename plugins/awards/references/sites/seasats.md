# Seasats — https://www.seasats.com/

| Field | Value |
|---|---|
| Class | B2B product (uncrewed surface vessels; defence, science, energy buyers) |
| Visitor mode | persuade |
| Awards | Awwwards SOTD 8 Sep 2026 + Developer Award [verified via search extraction]; 7.44 = D 7.61 / U 7.17 / C 7.38 / Co 7.65 [verified]; tags Clean, Infinite Scroll, Unusual Navigation, Menu – Vertical, 3D, Footer Design, Javascript, Cinema 4D [verified] |
| Studio / credits | Raw Materials (Austin; D&AD Design Studio of the Year 2024; clients Meta, Anduril, Saronic) [verified]; individual designers, 3D artist [unknown] |
| Stack (evidence level) | Next.js + Payload CMS [verified: `/api/media/file/**` upload route matched against Payload's official templates]; legacy WordPress estate behind Bunny CDN still partly live [verified URLs]; Cinema 4D for 3D [verified tag]; animation library [unknown — do not assume GSAP]; fonts [unknown] |
| Palette | oxidised sea-green #619785 + burnt rust #BF5114 [verified]; ground value [inferred light or mid-tone from the "Clean" tag, low] |
| Type | [unknown] — no family surfaced |
| WebGL dosage | none likely: tagged 3D + Cinema 4D but not WebGL, unlike its batch-mates → pre-rendered sequences scrubbed on scroll [inferred medium] |
| Scroll model | native; infinite-scroll tag; scrollspy side index [verified tags + clone] |
| Narrative model | specification: scale escalation (one vessel → team → ocean-wide network) |

## 1. Concept and narrative
"Ocean Autonomy That Works" is an anti-hype claim in a category full of vapourware; the product is framed as "a satellite at sea" [verified fragments]. The spine is scale escalation: a single vessel working alone, then vessels teaming for coordinated manoeuvres, then networks for ocean-wide intelligence, so scroll depth equals scope. Copy is engineering-declarative with specs used as headline rhetoric, not as a table: six months at sea, 8,000 nautical miles, Sea State 6, fits in a pickup, deployable by hand, payloads swapped in minutes, 3–5 days of operator training [verified fragments]. The recurring formula is capability stated as a constraint removed (no crew, no crane, no specialist training). Four-beat stab rhythm: "Light. Simple. Modular. Extremely effective." [verified fragment].

## 2. Structure and components
- Routes: home, vessel/product pages (Lightfish with Base / Hydrographic / Environmental / Security configurations; Quickfish; Heavyfish), /industries/, /leadership/, /the-team/<person>/, careers [verified URLs].
- Fixed rotated-text scrollspy index pinned to the right edge: highlights the section nearest viewport centre, jumps on click, hidden below ~900 px [verified from a third-party "Seasats-inspired" rebuild, so a description of the pattern rather than of Seasats' code].
- Infinite auto-scrolling ticker driven by rAF translate with wraparound, CSS mask edge fade, pause on hover, links stay clickable [same source].
- Hero background video slot plus per-product photo/render slots, each probed before display and faded in only when loadable [same source].
- Spec-sheet PDFs per configuration served from the CMS as the primary conversion action [verified URLs].
- Designed footer, tagged by the jury as a notable element [verified tag]. Preloader, cursor, menu transition, sound [unknown].

## 3. Visual language
Two-token industrial palette derived from the operating environment: sea-green reads as ocean and oxidised metal, rust as marine safety gear and hazard marking; both desaturated, nothing neon. The page body stays orderly ("Clean") while the navigation carries the eccentricity. Imagery mixes real operational footage of vessels at sea with C4D renders of hull and payload modules [verified tags]. Grain, gradients, layout grid [unknown].

## 4. Motion and effects (with parameters)
- Scroll-scrubbed 3D most likely as pre-rendered frame sequences [inferred medium from the tag asymmetry]; no easing or duration values are known.
- Ticker: rAF, wraparound, variable speed possible because it is not a CSS keyframe loop; pause/resume clean [clone-described].
- Scrollspy activation by section midpoint nearest viewport centre [clone-described].
- Everything in the rebuild is gated behind `prefers-reduced-motion`; unverified on Seasats itself.

## 5. Tech and pipeline
Next.js + Payload with self-hosted media [verified]; a partial cutover from WordPress (trailing-slash legacy URLs still resolve) [verified]; SSR/SSG and Next image optimisation [inferred]. 3D authored offline in Cinema 4D. Animation library, smooth-scroll library, bundler [unknown]. Hosting beyond Bunny for legacy [unknown].

## 6. Weaknesses
Usability is the lowest sub-score (7.17): an unusual vertical navigation costs comprehension, and the side index disappears on narrow viewports, leaving a different nav model per device. Reduced motion, WebGL fallback and performance are unmeasured. The awards skills keep the scrollspy but give it a visible, keyboard-reachable mobile equivalent, and keep the ticker pausable by focus as well as hover.

## 7. Principles
1. Spend the weirdness budget on one element (here the navigation) and keep the body clean.
2. Specs are rhetoric: numbers as headlines convert engineering credibility into desire.
3. Escalate scale as the narrative spine; scroll depth = scope.
4. Derive the palette from the product's real environment, not a trend deck.
5. Pre-rendered 3D scrubbed on scroll buys the "3D site" read with near-zero runtime risk.
6. Craft the unfashionable parts: the footer got tagged.

## 8. Take / Don't take
- **Take:** the rotated scrollspy index with a conventional fallback under ~900 px; the rAF wraparound ticker with mask fade and pause `[recipe:marquee-raf-mask]`; probe-then-reveal media slots; spec-sheet-as-CTA for technical B2B; the constraint-removal copy formula; image-sequence scrub for offline-rendered objects `[recipe:image-sequence-scrub]`; the one-to-many-to-system escalation `[pattern:narrative-structures#specification]`.
- **Don't take:** the sea-green/rust pair, "Ocean Autonomy That Works" and "a satellite at sea", the vessel renders, the exact section order.

## 9. Confidence and sources
Awards high · agency high, individuals low · concept medium · palette high, type unknown · components medium (one indirect but specific source) · motion low-medium · stack high for CMS, low for animation · a11y/perf low.
Sources: awwwards.com/sites/seasats; seasats.com and its `/api/media/file/*.pdf` assets; seasats.b-cdn.net legacy uploads; github.com/vairemoffice-prog/vairem/pull/44; github.com/payloadcms/payload (`templates/website/next.config.ts`, `getMediaUrl.ts`); therawmaterials.com; dandad.org, creativereview.co.uk, creativeboom.com, printmag.com on Raw Materials; crunchbase.com and workboat.com on Seasats; research transcript batch-B.
