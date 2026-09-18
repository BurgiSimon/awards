# Trevor Noah — https://www.trevornoah.com/

| Field | Value |
|---|---|
| Class | brand (personal-brand / talent hub: tour, podcast, books, specials, foundation) |
| Visitor mode | experience → persuade (tour ticketing is the conversion) |
| Awards | Awwwards SOTD 3 Sep 2026 + Developer Award [verified via search extraction]; 7.45 = D 7.38 / U 7.32 / C 7.78 / Co 7.40 [verified]; technologies listed WebGL, Webflow; palette listed as two colours [verified] |
| Studio / credits | OFF+BRAND (Glasgow-born, ~30 people; Microsoft, Slack, Webflow, Lando Norris, steven.com) [verified]; individual designers/developers [unknown — an OFF+BRAND developer surfaced on LinkedIn without a confirmed role] |
| Stack (evidence level) | Webflow + Webflow CMS (80+ tour cities, books, videos, features) [verified]; custom WebGL layer, library [unknown — "WebGL" not "Three.js" is a mild hint toward a lighter renderer]; animation library [unknown]; hosting Webflow [inferred]; fonts [unknown] |
| Palette | bubblegum pink #FF9BB4 + ink navy #1D2440 [verified]; navy as ground, pink as accent/hover [inferred] |
| Type | [unknown] |
| WebGL dosage | moments: flat 2D photo planes with a subtle peeling-Polaroid corner curl |
| Scroll model | native (library unknown) |
| Narrative model | collage → index: scattered "snapshots of a mind" resolving into a CMS-driven explorable hub |

## 1. Concept and narrative
The agency's stated idea puts the subject's mind at the centre: snapshots into his mind, "a living collage where fragmented thoughts evolve into fully formed ideas" [verified quote, agency case study]. The governing principle is restraint: assets stay flat 2D elements with a subtle peeling Polaroid effect, and "the technology never became the point; we wanted people to remember Trevor, not the designers" [verified quotes]. The challenge was range: a dozen simultaneous ventures presented so each feels like a moment in a journey. Tour is privileged commercially, so every device experience for live shows was designed with full attention rather than degraded from desktop [verified]. Tone: warm, curious, conversational.

## 2. Structure and components
- Routes [verified from indexed URLs]: `/` hub, `/about`, `/shows` with per-city show pages (slug and dated legacy forms coexist, evidence of a long-lived archive), `/watch-listen` (specials + podcast), `/video-gallery`, `/books/<title>` per-book detail pages, outbound foundation link.
- Homepage editorial slots surfacing whatever is current (a World Cup watch party, awards-show hosting) without restructuring the page [verified].
- Tour module: CMS-driven list → city detail → external ticket hand-off, mobile-first [verified intent, medium on mechanics].
- Preloader, cursor, menu, footer [unknown].

## 3. Visual language
Pink on navy refuses the black-and-neon "comedy special" register: warm, pop, slightly nostalgic, photo-friendly and high-contrast. The defining move is treating photography as physical objects: flat cards in WebGL whose corner lifts. The Polaroid metaphor does three jobs at once: memory (an autobiographer), collage (the concept) and physical justification for 3D without a modelled scene. Grid and type scale [unknown].

## 4. Motion and effects (with parameters)
- Signature: peeling-Polaroid corner curl on flat image planes, driven by pointer proximity and/or scroll [verified name; mechanism inferred: a subdivided plane with corner vertices displaced along a curl axis, amplitude eased back on leave]. No parameter values are known.
- "Mostly flat 2D elements with a curated approach to WebGL" is the agency's scoping rule [verified quote fragment].
- Smooth scroll, transitions, split text, sound [unknown]. A Webby for animation cited in an OFF+BRAND profile almost certainly belongs to a different, earlier project; not attributed here.

## 5. Tech and pipeline
Webflow shell with CMS collections and custom code injected on top, the studio's documented house pattern [verified for the studio, inferred for this site]. Performance framed as a constraint ("engineered to stay fast and scale") [verified fragment]. Fonts, bundler, texture formats [unknown].

## 6. Weaknesses
Design (7.38) was the lowest sub-score and Usability (7.32) close behind: the jury rewarded the idea more than the polish. Reduced-motion handling and WebGL fallback are undocumented. The awards skills keep flat-plane WebGL but ship the `<img>` elements in the DOM behind an `aria-hidden` canvas so the collage degrades to a real gallery.

## 7. Principles
1. Subordinate the technology to the subject; the effect is seasoning.
2. One physical metaphor should do at least two jobs (memory + collage + 3D justification).
3. 2D-in-3D is a cost-controlled way to feel dimensional: planes, not scenes.
4. Let the commercial priority (tour) shape where the craft attention goes.
5. A palette that refuses the category default is a positioning decision.
6. Structure sprawl as an explorable index, not a linear pitch.

## 8. Take / Don't take
- **Take:** flat image planes with one material behaviour `[recipe:gl-dom-tethered-planes]`; the curated-WebGL scoping rule (decide the single material behaviour up front, refuse every other 3D temptation); collage → index structure `[pattern:narrative-structures#collage-index]`; per-entity detail pages under a hub; a featured rail for what is current; mobile-first treatment of the revenue module.
- **Don't take:** pink + navy, the Polaroid curl as-is, the "snapshots of a mind" framing, the route set.

## 9. Confidence and sources
Awards high · agency high, individuals low · concept high (agency's own words) · colour high, type unknown · components medium · motion medium for the signature, low elsewhere · stack high for platform, low for libraries · a11y/perf low.
Sources: awwwards.com/sites/trevor-noah; itsoffbrand.com/our-work/trevor-noah (mirrored on omgrowth.ai); itsoffbrand.com/about-us; tympanus.net/codrops/2026/08/17 OFF+BRAND profile; webflow.com/customers/off-brand; awwwards.com/offbrand; trevornoah.com routes; research transcript batch-B.
