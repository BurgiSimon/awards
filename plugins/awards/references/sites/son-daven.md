# Son Daven — https://sondaven.com/en

| Field | Value |
|---|---|
| Class | brand / e-commerce (pre-sale aparthotel investment + hospitality, Ukrainian Carpathians; 304 apartments, 37–105 m², phases 2027/2028) |
| Visitor mode | persuade (investors) wrapped in experience (future guests) |
| Awards | Awwwards SOTD 6 Jun 2026, Site of the Month June 2026, Developer Award [verified via search extraction]; 7.62 = D 7.70 / U 7.16 / C 8.15 [verified, Co unknown]; a 9.01 reading (9.3/8.6/9.4/8.5) is most likely a different panel, probably CSSDA [unresolved]; CSSDA entry exists [verified]; tags Animation, Scrolling, Storytelling, UI design, Microinteractions [verified] |
| Studio / credits | The First The Last (Dubai/Miami; 24 Awwwards, Site of the Year 2022) [verified]; design + development Ivan Chopei; producer Maksym Stepenko [verified]; moving image likely Zerkalo Studio [medium] |
| Stack (evidence level) | Webflow + GSAP + WebGL [verified: Awwwards technologies]; WebGL library [unknown]; Webflow CMS for news and construction progress, Webflow Localization for EN/UK [inferred]; fonts self-hosted [inferred: not on Google Fonts] |
| Palette | sand/brass #A89474 (accent + surface) + warm near-black #2C2824 (text + brand) on a light theme; contrast ≈ 5.0:1 passes AA [verified: three token extractors] |
| Type | KTF Metro Roman (display) + KTF Metro Blueline (body), Kyiv Type Foundry [verified]; 2 px spacing base [verified] |
| WebGL dosage | moments within a DOM-led long-form page |
| Scroll model | native + pinned/scrubbed chapters + horizontal rails (library unknown) |
| Narrative model | chaptered journey: prologue → seasons → programme → typologies → location → economics → progress |

## 1. Concept and narrative
"A new place of power in the Carpathians, where Hutsul culture meets contemporary architecture" [verified fragment]: the site reinterprets a specific mountain culture rather than generic alpine luxury, and that specificity is the differentiator. The brief is hard: sell an unbuilt building in a war-affected country to investors while seducing future guests. The order is emotion before economics: cinematic loader → poetic prologue (place, myth, culture) → architecture and seasons → programming (wellness, restaurant, culture, kids) → apartment typologies → location and infrastructure → investment metrics → news and construction progress [verified from curated descriptions]. Two copy registers, literary in the atmosphere chapters and plainly numeric in the commercial ones, separated by chapter so the shift reads as intent.

## 2. Structure and components
- Cinematic loader; poetic prologue; scroll-driven chapter rhythm; seasonal renders with a hold- or drag-to-compare summer/winter reveal [verified feature, medium on the input verb]; apartment typology browser; investment metric blocks; infrastructure map with interactive location cards; horizontal-scroll rails; media showcase; feature cards; fullscreen navigation overlay; designed hero, buttons and footer [verified inventory from details.so and landing.love].
- Sub-pages: `/en/news` (incl. a Forbes feature) and `/en/construction-progress` with dated articles, turning a pre-launch weakness into a recurring trust signal [verified].

## 3. Visual language
Warm, earthen, low-chroma: wood, wool, brass, smoke. A two-token duotone on a light ground that still clears AA is the creditable detail. Type from a Ukrainian foundry for a Ukrainian heritage project: provenance extended into the toolchain, legible to anyone who checks. Fine 2 px spacing scale supports editorial typography rather than product-UI rhythm. Imagery: renders of a building that does not exist yet, shown across seasons, plus moving image and maps.

## 4. Motion and effects (with parameters)
- Cinematic loader as the film's title card [verified feature].
- Pinned/scrubbed chapter transitions [verified description; mechanism inferred ScrollTrigger pin + scrub].
- Horizontal rails inside the vertical page [verified].
- Hold-to-compare reveal: a mask between two aligned renders driven by pointer hold or position [verified feature, medium on mechanics].
- Fullscreen navigation transition; microinteractions [verified tags].
- Smooth-scroll library, split text, cursor, sound, easing values [unknown].

## 5. Tech and pipeline
Webflow shell with GSAP and a WebGL layer [verified]; CMS collections for news and progress [inferred]; localisation EN/UK [verified routes]. No performance data.

## 6. Weaknesses
Usability 7.16 is the lowest sub-score in its batch: cinematic loader + scrubbed chapters + horizontal rails is a comprehension tax the jury noticed. Reduced motion, image weight of render-heavy pages and mobile treatment of the compare and rail components [unknown]. The awards skills keep the chapter rhythm but make the loader skippable on repeat visits, give the compare reveal keyboard control, and let rails fall back to native overflow on touch.

## 7. Principles
1. Emotion before economics: earn the spreadsheet by making the place feel inevitable.
2. Anchor art direction in a specific culture; specificity is the luxury.
3. Extend provenance to the toolchain (a local foundry for a local story).
4. Solve "not built yet" with time: seasons and a progress log turn renders into evidence.
5. Warm near-black over #000 keeps warmth and still passes AA.
6. Loading is a narrative act, not a delay to minimise.

## 8. Take / Don't take
- **Take:** the chapter-rhythm long-form with rests between spectacles `[pattern:narrative-structures#chaptered-journey]`; the A/B compare reveal for any two-condition subject `[recipe:compare-hold-drag]`; the two-register copy system `[pattern:copy-and-content#two-registers]`; a warm-neutral duotone with a documented contrast check; a 2 px scale for editorial type; progress-as-content; interactive location cards over a map; the local-foundry rule.
- **Don't take:** #A89474/#2C2824, KTF Metro, the Hutsul framing, the seasonal renders, the chapter order as a template.

## 9. Confidence and sources
Awards high (scores medium, one unresolved conflict) · credits high · concept high · visual high (colour, type, spacing verified) · components high · motion medium-high · stack high · a11y/perf low-medium.
Sources: awwwards.com/sites/son-daven; awwwards.com/websites/sites_of_the_month; awwwards.com/thefirstthelast; cssdesignawards.com/sites/son-daven/49788; designmd.co/d/sondaven-com; uicoach.io/inspirations/award-winning/son-daven; details.so/inspo/site/sondaven-com; landing.love/sites/sondaven; zerkalostudio.com/works/son-daven; thefirstthelast.agency; sondaven.com/en routes; research transcript batch-B.
