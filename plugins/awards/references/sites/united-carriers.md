# United Carriers — https://unitedcarriers.com/

| Field | Value |
|---|---|
| Class | B2B product (global freight forwarder: air, sea, customs brokerage, warehousing) |
| Visitor mode | persuade |
| Awards | Awwwards SOTD 6 Sep 2026 + Developer Award, 7.28 overall, sub-scores [unknown] [verified via search extraction]; tags Icons, Transitions, Responsive, Storytelling, 3D, Microinteractions [verified]; curated on Lapa Ninja, A1 Gallery, Site of Sites, footer.design, Muzli [verified]; 12M+ combined views of creator reaction videos within two weeks of launch [verified: company LinkedIn] |
| Studio / credits | Bearplus (Sydney; Webflow Premium Partner) + Kenny Ho (designer/art director, Awwwards juror) [verified]; 3D/motion individuals [unknown] |
| Stack (evidence level) | Webflow + GSAP + Three.js [verified: Awwwards technologies]; Webflow CMS for insights and news [inferred]; smooth-scroll library [unknown]; injection pattern (external Vite bundle in a script tag) [inferred from the ecosystem's documented house pattern] |
| Palette | single electric ultramarine #0016CB on a near-black ground with glow [verified hex; dark + glow from A1 style tags] |
| Type | BT Steinhart (condensed, characterful display) + Helvetica Now (body/UI) [verified] |
| WebGL dosage | canvas-first for the journey scenes, informational blocks in DOM |
| Scroll model | native + scrubbed scene sequence (ScrollTrigger near-certain given GSAP; unconfirmed) |
| Narrative model | chaptered journey: one shipment across land, sea and air |

## 1. Concept and narrative
"Every leg of the journey" [verified title of the designer's write-up]: the page follows a single shipment, forklift loading cargo → trucks through cities → ships on open ocean → planes between continents, "each scene made to fit into one flowing story" [verified fragment]. Scroll progress maps one-to-one onto physical freight progress; the mode changes are the designed moments and the content blocks are rests between them. The stated intent: less technical, more human, using movement, scale and connectivity as the story [verified paraphrase]. Voice: confident operator, service-promise led ("we pick up the phone and own the outcome") [verified fragment].

## 2. Structure and components
- Routes [verified]: `/` journey, `/services`, `/industries`, `/insights`, `/ai-news/asia-pacific` (an AI-curated regional trade-news feed that makes the marketing site a return destination), `/merchandises` (a merch store on a freight site), `/careers`, `/qhse`, `/about`, `/contact`.
- Scroll-driven scene sequence with scene-to-scene transitions [verified tags]; custom icon set as a named deliverable [verified tag]; video [verified]; microinteractions [verified tag].
- Footer selected by footer.design in its own right [verified].
- Preloader, cursor, page transitions, sound, easter eggs [unknown].

## 3. Visual language
Mono-hue dark system: near-black ground, one saturated blue doing all emphasis, glow/bloom around it, neutral greys for the rest; the discipline is what makes a corporate site look expensive. Big, condensed, typographic layouts (A1 tags: dark, big type, glow, typographic, condensed fonts, video, scroll animation) [verified]. Full-bleed scene sequences alternate with informational blocks. Type contract: all personality in BT Steinhart headlines, none in Helvetica Now body and UI.

## 4. Motion and effects (with parameters)
- Core mechanic: distinct scenes (warehouse, road, sea, air) stitched into one scroll, transitions between transport modes as the hero beats [verified concept; mechanism inferred: ScrollTrigger scrub driving a Three.js camera/scene state machine].
- Glow on the accent: bloom in GL or CSS glow [inferred].
- No easing, duration or stagger values are known.

## 5. Tech and pipeline
Webflow structure and CMS with a custom-coded GSAP + Three.js layer [verified]. Fonts from Bitstream/Monotype, delivery [unknown]. The documented Webflow + Three.js house pattern in this ecosystem: a single persistent scene surviving navigations, bundled once and injected via a script tag [inferred, not verified on this site].

## 6. Weaknesses
Lowest overall score of its batch (7.28) despite the Developer Award: the design jury rated a heavily scroll-driven narrative lower than the dev jury did, plausibly a usability cost of long scrubbed sequences. Reduced motion, GL fallback and measured performance [unknown]. The awards skills keep the process narrative but make each scene a real section with a heading and text, let the sequence be skipped by keyboard, and ship a static frame per scene under reduced motion.

## 7. Principles
1. Map scroll to the literal thing the business does; the operational sequence is a free storyboard.
2. Make the transitions the hero; the sections are the rests.
3. Radical colour discipline: one hue, one ground, glow; no second accent.
4. One expressive face, one silent face.
5. Give a boring category a reason to be shared; the site became the campaign.
6. Add a genuine utility (news feed, merch) so the site is a destination, not a leaflet.

## 8. Take / Don't take
- **Take:** the scroll-as-process structure (4–6 scenes, each morphing into the next) `[pattern:narrative-structures#chaptered-journey]`; scene-to-scene transitions over hard cuts `[recipe:gl-rtt-composite-transition]` `[recipe:scroll-pin-scrub]`; the mono-hue + glow token rule; the display/neutral contract; a bespoke icon set as a deliverable; a designed footer; a living-utility page.
- **Don't take:** #0016CB on black, BT Steinhart, the forklift-truck-ship-plane sequence, the merch/news pages as features to bolt on without a reason.

## 9. Confidence and sources
Awards high · credits high · concept high (designer's own words) · colour and type high · components medium-high · motion medium-high · stack high · a11y/perf low.
Sources: awwwards.com/sites/united-carriers; me.muz.li/kennyho/united-carriers-every-leg-of-the-journey-2; lapa.ninja, a1.gallery, siteofsites.co, footer.design entries; webflow.com/made-in-webflow/website/bear-plus; clutch.co and designrush.com profiles of Bearplus; thefwa.com/profiles/bear-plus; Kenny Ho's LinkedIn launch post; unitedcarriers.com routes; research transcript batch-B.
