# Narrative structures

What this file is for: the eight ways the corpus turns a page into a story — the chapter beats each model runs, where it places its one interruption, how it closes, which register its copy speaks and what the DOM must still say with CSS off. Read it during concept and structure work, before the page map is written; cite it as `[pattern:narrative-structures#model]`. Every model is a principle with cards attached, never a section order to reproduce: each card's §8 names the literal order it refuses.

## Contents
1. [How to read a model](#how-to-read-a-model)
2. [Chaptered journey](#chaptered-journey)
3. [Faceted world](#faceted-world)
4. [Manifesto with gates](#manifesto-with-gates)
5. [Single-object launch](#single-object-launch)
6. [Collage index](#collage-index)
7. [Gallery](#gallery)
8. [Print artefact](#print-artefact)
9. [Specification](#specification)
10. [Pacing](#pacing) · [Emotion before economics](#emotion-before-economics) · [The interruption](#the-interruption) · [The close](#the-close)
11. [Choosing a model](#choosing-a-model) · [Verify](#verify) · [Refuse](#refuse)

## How to read a model

Why: the template order (hero → logos → features → testimonials → pricing → CTA) is the first thing a juror recognises (`anti-patterns.md`). A narrative model replaces the order with beats. Each chapter has an entrance (the moment that arrives), a hold (the part that reads) and an exit (the hand-off to the next chapter); the whole page has exactly one interruption and one authored close. Every model below lists the same things: what it is and who uses it · beats · interruption · rule of three · close · register · DOM · choose when · risk. Beat rows go into `AWARDS.md ## Page map` as entrance · hold · exit.

## Chaptered journey

One continuous world read in order; scroll depth is progress through a process, a place or an argument. Seen in [site:united-carriers] (one shipment across warehouse, road, sea and air [verified concept]), [site:son-daven] (prologue → seasons → programme → typologies → location → economics → progress [verified]), [site:mont-fort] (identity → capability → four divisions → footprint → ESG, with a chapter rail [verified]) and, as a spatial descent that wraps, [site:igloo] [recalled high]. Shopify's chapter walk belongs to the gallery model below.

- **Beats.** Entrance: the mode change or camera move is the designed moment [site:united-carriers]. Hold: an informational block at rest — real heading, real paragraph, one spec or one image. Exit: the next transition, scrubbed, never a hard cut. Four to six chapters is the corpus range [site:united-carriers]; Igloo adds a modulo wrap so the descent never ends [site:igloo] [verified tag].
- **Interruption.** A device that changes the input: a drag-to-compare between two seasons and a horizontal rail inside the vertical page [site:son-daven] [verified, live source 2026-09-18]; a jump rail that lets the visitor leave the sequence [site:mont-fort] [verified].
- **Rule of three.** Inside a hold, three support points at most; three transport modes carry United Carriers' whole story. Plugin guidance, not a card measurement.
- **Close.** A footer strong enough to be selected on its own [site:united-carriers] [verified]; a progress log or a news route that gives the story a future [site:son-daven] [site:mont-fort]; or the loop [site:igloo].
- **Register.** Confident operator, service-promise led [site:united-carriers]; poetic then numeric by chapter [site:son-daven] (`[pattern:copy-and-content#two-registers]`); boardroom copy under an extravagant camera [site:mont-fort] [inferred]; expedition telemetry [site:igloo] [verified].
- **DOM.** Every chapter is a `<section>` with its own heading and text, so the sequence reads as an article with CSS off; Montfort ships every paragraph in static HTML and hydrates only the island [site:mont-fort] [verified]; Igloo's empty DOM scored 6.6 on accessibility and semantics [site:igloo] [recalled medium] — a ceiling survived, not a licence. The rail is a `<nav>` of links with `aria-current`.
- **Choose when.** The subject has an operational sequence, a place to move through, or a big-ticket decision that needs a prologue before the numbers.
- **Risk.** The design jury scores long scrubbed sequences lower than the dev jury does: 7.28 overall [site:united-carriers] [verified], usability 7.16 [site:son-daven] [verified]. Every chapter must be skippable by rail and by keyboard, with a still per chapter for the reduced tier.

## Faceted world

A brand with several selves or many catalogue entries, presented as a hub in front of authored routes rather than as one scroll. Seen in [site:lando-norris] (a persona fork, `/on-track` and `/off-track`, across seven routes plus a 404 [verified structure]) and [site:mindmarket] (a persuade homepage in front of a methodology × sector matrix of about 22 templated pages and a 48-country network map [verified data]). Trevor Noah's hub with per-entity pages sits on the boundary with the collage index [site:trevor-noah].

- **Beats.** Entrance: the hub states the one idea and the choice — the nav dramatises the fork [site:lando-norris] [inferred]. Hold: each facet is its own route with its own hold. Exit: a choreographed route change — vector state, camera move and scene swap on one timeline [site:lando-norris] [verified] — or native cross-document morphs `[recipe:page-transitions]`.
- **Interruption.** The one dataset that deserves geometry (a season calendar as a track [site:lando-norris] [verified]); a map that makes reach a felt claim [site:mindmarket]. Everything else stays text.
- **Rule of three.** The hub surfaces at most three facets; deeper catalogues run on a block kit of 12–15 named blocks and two hero variants [site:mindmarket] [verified structure].
- **Close.** An authored 404 in the same world [site:lando-norris] [verified]; a closing CTA block on every templated route [site:mindmarket] [verified component].
- **Register.** Label-like and low in word count, with rotating phrase loops carrying the voice [site:lando-norris] [inferred]; warm-professional for a services catalogue [site:mindmarket] [inferred medium].
- **DOM.** Routes are real pages with their own `<h1>`; 3D-anchored labels are HTML positioned against projected coordinates so text stays text [site:lando-norris] [verified]; map pins are `<button>` or `<a>` elements with names [site:mindmarket]; the block kit reflows — no breakpoint reloads.
- **Choose when.** The subject is plural — two personas, several ventures, a service × sector matrix — and every facet can be finished to the same standard.
- **Risk.** Finish across N routes: Lando ships dead branches — a `window.ScrollTrigger` fallback that always runs, a helper that returns `"body"` on both sides of its own ternary, and a `localhost:6645` script tag [site:lando-norris] [verified, live source 2026-09-18]. The width-keyed texture tier and the 992 px reload that used to be listed here are not observable in the 2026-09-18 build [see the card's §8]. Programmatic pages go thin without a real block kit.

## Manifesto with gates

One thesis argued as physics: stages joined by gates that ask for a small physical commitment before the next stage. Seen only in [site:why-zero]: six stages and five gates (draw, hold to shatter, hold to launch), promise → shatter → devalue → tunnel → alternative → enlist, on a virtual float with no page grid [verified].

- **Beats.** Entrance: the camera arrives at the stage. Hold: the claim is enacted rather than stated — cash burns, certificates shred [verified]. Exit: the gate; a persistent XP counter makes progress felt [verified].
- **Interruption.** The gates are the interruptions — N stages need N−1 gates, each a different gesture, none a plain click.
- **Rule of three.** The argument has three moves — the incumbent promise, its destruction, the alternative [inferred from the stage list]; the enlist stage is the close, not a fourth move.
- **Close.** The form as an object (an origami fold) and a city map with game controls [verified]; a custom 404 [verified tag].
- **Register.** Defiant and gamified; the villain is named and destroyed with real statistics scattered across the glass [verified] (`[pattern:copy-and-content#the-named-villain]`).
- **DOM.** The layout is a camera path with no sections [verified], so the DOM must carry a hidden mirror: the stages as headings, the manifesto text, the statistics and a real `<form>`; each gate gets a keyboard equivalent (Enter or Space to hold, arrows for the map) and a skip path (`[pattern:accessibility-and-reduced-motion]`).
- **Choose when.** A campaign with one thesis, one enemy and a budget for a 100 % canvas build — a four-month build that shipped 1 GB of sources as under 10 MB [verified].
- **Risk.** Hostile to keyboard and assistive tech by default; the conversion sits behind five gates. Gate the drama, never the content.

## Single-object launch

One product rendered with real weight, and a page that is a short loop around it. Seen in [site:oryzo] (intro interaction → hero object → desk scene → extreme zoom → particle footer [recalled medium]) and [site:slosh-seltzer] (land → engage with the can → payoff; the palette is the navigation [recalled medium for the site; verified at family level]).

- **Beats.** Entrance: the object arrives with inertia and lighting that answers its motion [site:oryzo] [recalled high]. Hold: you handle it; the display line and the specs read beside it. Exit: scroll moves into the object's world — a staged scene, a variant swap — through composited sections [site:slosh-seltzer] [verified].
- **Interruption.** The one payoff: an extreme close-up that rewards dwell [site:oryzo] [recalled high]; the physics moment when the product opens [site:slosh-seltzer] [recalled medium].
- **Rule of three.** Loudness rationed to two or three named moments; everything around them stays quiet [site:oryzo] [recalled high]. This is the model's whole discipline.
- **Close.** An interactive footer indexed on its own [site:oryzo] [recalled high]; or the loop restarts, which is why the product row carries an autoplay countdown [site:slosh-seltzer] [verified, family level].
- **Register.** Keynote sincerity — a category's complete conventions with zero tonal breaks [site:oryzo]; candy-packaging maximalism [site:slosh-seltzer] [inferred].
- **DOM.** Product name, variants, specs and the buy or download link in semantic HTML; the canvas `aria-hidden` over a poster `<img>`; the variant switcher a real radio group whose `data-theme` on `<html>` is the single source for the tokens and the canvas clear colour `[recipe:theme-swap-tokens]`.
- **Choose when.** One product, one SKU or a small hand-picked variant set, and the budget for one commissioned object per variant.
- **Risk.** Creativity outruns usability by design — 8.35 against 7.51 [site:oryzo] [recalled high]; gated intros and dwell-gated content need a skip, and a physics payoff needs a static "opened" state under reduced motion.

## Collage index

A collage (a manifesto, scattered snapshots) that resolves into an index (an archive list, a hub of detail pages): personality first, inventory second. Seen in [site:leo-parpeix] (craft manifesto → three projects → typographic break → three projects → archive → CTA [recalled medium]) and [site:trevor-noah] (snapshots of a mind resolving into a CMS-driven hub of shows, books and video [verified concept]).

- **Beats.** Entrance: a two-state hero line or a scatter of flat planes (`[pattern:hero-archetypes]`). Hold: a cluster of three projects, each with its metadata quartet [site:leo-parpeix] [recalled medium]. Exit: the cluster gives way to the break, then to the second cluster.
- **Interruption.** A full-viewport typographic break rendered in WebGL between the two clusters [site:leo-parpeix] [recalled medium]; a featured rail for whatever is current [site:trevor-noah] [verified].
- **Rule of three.** Literal: three, break, three. The index that follows can be long; the collage cannot.
- **Close.** A three-line footer CTA in the site's last theme [site:leo-parpeix] [recalled medium]; the ticket hand-off as the revenue module, designed mobile-first [site:trevor-noah] [verified intent].
- **Register.** First person, warm and precise; numbers, roles and award tallies do the bragging [site:leo-parpeix]; warm, curious, conversational [site:trevor-noah].
- **DOM.** The archive is a list of links whose preview also appears on focus `[recipe:hover-preview-list]`; every plane in the collage has its `<img>` in the DOM behind an `aria-hidden` canvas, so the page degrades to a real gallery [site:trevor-noah]; the manifesto is body text, not split spans alone.
- **Choose when.** A person or a sprawl of ventures where who they are must land before what they made.
- **Risk.** A click-to-enter wall in front of the collage [site:leo-parpeix] [recalled medium]; a collage that never resolves is a mood board; Design was Trevor Noah's lowest axis at 7.38 — the idea was rewarded over the polish [verified].

## Gallery

The work or the items are the argument, hung one per viewport. Seen in [site:floema] (drifting image field → arced collections rail → one piece → editorial about, the theme swapped per route [verified, clone]), [site:lama-lama] (video hero → poster-scale case blocks → studio and people → contact [recalled low-medium]) and [site:shopify-editions-w26] (150+ updates as wall labels beside their own paintings in about seven chapters, with an edition switcher and local search [recalled high for the concept, medium for the chapters]).

- **Beats.** Entrance: the poster or plane owns the viewport and arrives with mass — the plugin's default is a scale from ≈ .94 or a clip wipe on `--ease-out-expo` over 1.2–1.5 s; Lama Lama's own numbers are unknown. Hold: the label reads — title, client, year. Exit: the next poster, or a shared-element flight into the detail [site:floema] [verified].
- **Interruption.** A tempo change: a near-black full-bleed section [site:lama-lama] [recalled medium]; a painted wipe between chapters [site:shopify-editions-w26] [recalled high]; the flight from field to piece [site:floema].
- **Rule of three.** Cluster the run in threes and change tempo between clusters; twelve identical posters are a grid on its side. Plugin guidance.
- **Close.** Contact [site:lama-lama]; the editorial about page [site:floema]; a designed 404 in the same world [site:shopify-editions-w26] [recalled high].
- **Register.** Numbered label plus title, almost no prose [site:floema] [verified]; warm value-led copy against loud visuals [site:lama-lama] [recalled medium-high]; grand visuals over plain, scannable update copy [site:shopify-editions-w26].
- **DOM.** Every block is a real `<a>` inside a list; every plane sits over an `<img alt>` [site:floema] [verified]; every update card is real content under an `aria-hidden` canvas, in one document with native anchors — never an iframe shell [site:shopify-editions-w26]; a content schema (`Section { id, navLabel, title, summary, items }`) precedes the scenes [recalled medium-low].
- **Choose when.** Studios, product lines and changelogs; past ≈ 100 items add the switcher and a local search.
- **Risk.** Unusual navigation costs usability (7.53 with that tag [site:floema] [recalled medium-high]); drag-only galleries with no focusable stops [site:floema] [verified absence]; a preloader that waits for every texture on the site [site:floema] [verified].

## Print artefact

The page behaves like a printed object about the subject — a call sheet, a poster, a spec sheet — and the interface speaks the industry's own paperwork. Seen in [site:the-line]: hero (the acetate hinges away) → the studio → work by client → clients and partners → news → contact → sticky red footer [verified order].

- **Beats.** Entrance: the sheet hinges off the light table on a named corner [verified] `[recipe:sticky-stages-rails]`. Hold: sticky stages under invisible rails, never `pin: true` [verified]. Exit: the next stage; colour arrives only at the active nav state and on the last screen [verified].
- **Interruption.** The arrival of colour is the event — one hue in exactly two places bookends the visit [verified]. The hinge is the only spatial move.
- **Rule of three.** Not evidenced on the card; this artefact's rhythm is bookends, not triads.
- **Close.** A sticky flare-red footer with a closing logo block, back-to-top and a Site Credits link [verified].
- **Register.** Working-studio voice: status dots, slash-delimited labels, credit tables, a Roman-numeral year, a `00/24` frame counter, live open/closed timings [verified] (`[pattern:copy-and-content#telemetry-register]`).
- **DOM.** The acetate is an `aria-hidden` div [verified] — the one decorative layer stays out of the tree; the slash is a CSS pseudo-element, not markup [verified]; native scroll stays under the custom scrollbar; hover reveals gain a focus equivalent.
- **Choose when.** A DOM-first budget, heterogeneous imagery that one ink can unify, a studio whose craft is the product. Site of the Month without a scene [verified].
- **Risk.** A hidden native scrollbar and hover-only reveals are keyboard hazards [unknown on the site]; live greyscale filters over video are compositing-heavy on low-end devices [inferred].

## Specification

The subject is proven with its own numbers, scenarios and places: persuasion by evidence blocks. Seen in [site:seasats] (scale escalation — one vessel → a team → an ocean-wide network; specs as headlines; spec-sheet PDFs as the conversion [verified]), [site:white-desert] (place-led: Explore · Stay · Learn · About, each camp its own character, dual units throughout [verified]), [site:usavionix] (role-casting: boot sequence → capability claim → scenario triptych → platform pages [verified]) and [site:animejs] (docs as a playground; the identity built with the product [verified artefact]).

- **Beats.** Entrance: a number or a claim lands as the headline. Hold: the evidence — a spec block, a scenario, a live demo. Exit: the scale step (vessel → team → network) or the next place.
- **Interruption.** Exactly three concrete scenarios, image + problem beat + solution beat [site:usavionix] [verified]; a "how this is even possible" operations chapter that de-risks the price [site:white-desert]; a public stress test [site:animejs] [verified].
- **Rule of three.** Native to the model: the triptych [site:usavionix]; three scales [site:seasats]; one concept sentence per property [site:white-desert].
- **Close.** A footer the jury tagged on its own [site:seasats] [verified]; the spec sheet or the enquiry as the last action, matched to the stakes (`[pattern:copy-and-content#conversion-matched-to-stakes]`).
- **Register.** Engineering-declarative, capability as a constraint removed, four-beat stabs [site:seasats]; coordinates, dual units and scarcity as numbers [site:white-desert]; verb chains and agent framing [site:usavionix]; terse and API-flavoured [site:animejs] [recalled medium].
- **DOM.** The most DOM-native model: specs are text in `<dl>` and tables; the scrollspy index is a `<nav>` with a visible equivalent under ≈ 900 px [site:seasats]; the boot sequence is an `aria-live` status that never gates content [site:usavionix]; demos stay keyboard-operable with an accessible copy of any split text [site:animejs].
- **Choose when.** Persuade mode with a technical or high-ticket buyer, and assets that are photography, renders, PDFs or live code. Two of the four won with no WebGL at all [site:seasats] [site:white-desert].
- **Risk.** Unusual navigation cost Seasats its lowest axis (usability 7.17 [verified]); a boot intro is a reduced-motion hazard [site:usavionix]; the category rut (hero → features → pricing) is one careless page map away (`anti-patterns.md`).

## Pacing

Why: a page that is loud everywhere has no loud moments. The corpus says so from four directions — the transitions are the hero and the sections are the rests [site:united-carriers] [verified concept]; the loud parts only work because everything around them stays quiet [site:oryzo] [recalled high]; spend the weirdness budget on one element and keep the body clean [site:seasats]; an accent used in two places frames the visit instead of decorating it [site:the-line] [verified].

Rules:
- One authored moment per chapter; hero scale (1.2–1.5 s) at most once per chapter (`[pattern:motion-vocabulary#durations]`). The rest of the chapter is typesetting.
- Alternate spectacle and rest: after a scrubbed scene, a block that only reads; after a near-black full-bleed section, the bone ground again [site:lama-lama].
- Dense earns quiet: a chapter carrying a spec table or a triptych is followed by a single line at display scale.
- Write the tempo into `AWARDS.md ## Page map` as entrance · hold · exit per row; a page with more than one signature is cut to one (`anti-patterns.md`, effect inflation).

## Emotion before economics

Why: a visitor who has not felt the place will not read the spreadsheet. Son Daven sells an unbuilt building to investors and future guests, so the order is a cinematic loader, a poetic prologue on place and culture, architecture across seasons, the programme, the typologies, the location — and only then the investment metrics and the construction log [site:son-daven] [verified]. Seasats runs the same arc for engineers: the felt scale of one vessel alone at sea, escalating to a network, comes first; the spec-sheet PDF is the last action [site:seasats] [verified]. White Desert earns awe with coordinates before the prices route [site:white-desert] [verified copy].

Rules: on any high-ticket decision put the numbers in the second half; switch the copy register at a chapter boundary, never inside a chapter (`[pattern:copy-and-content#two-registers]`); the economics chapter is still designed — metric blocks, a compare, a map — not a table dropped in.

## The interruption

Why: a page that runs at one input speed becomes wallpaper by the third chapter; one moment that changes the input, the scale or the register resets attention.

| Device | Where it sits | Seen in |
|---|---|---|
| A gate: draw, hold or drag before the next stage | between stages, N−1 of them | [site:why-zero] [verified] |
| A typographic break at full viewport | after the first cluster of three | [site:leo-parpeix] [recalled medium] |
| A scenario triptych | after the capability claim | [site:usavionix] [verified] |
| Drag-to-compare between two conditions, with real buttons behind it | inside the seasons chapter | [site:son-daven] [verified, live source 2026-09-18] |
| A horizontal rail inside the vertical page | one chapter, never two | [site:son-daven] [verified] |
| A hinge that swings the first screen away | the hero's exit | [site:the-line] [verified] |
| A dwell-gated close-up | the zoom section | [site:oryzo] [recalled high] |
| A theme swap that repaints the page | at a section or route boundary | [site:leo-parpeix] [site:floema] [site:slosh-seltzer] |

Rules: one interruption per page; it comes after the first content beat, never before; it has a keyboard equivalent and a skip (`[pattern:accessibility-and-reduced-motion]`); under reduced motion it becomes a cut or a static state that still shows both sides.

## The close

Why: the last screen is the last thing a juror scores, and the corpus tags footers in their own right — Seasats' footer was a jury tag [verified], United Carriers' was selected by a footer gallery [verified], Oryzo's particle footer is indexed as its own inspiration entry [recalled high].

| Close | Seen in | Note |
|---|---|---|
| Designed footer | [site:seasats] [site:united-carriers] [site:son-daven] [site:the-line] | The Line's is sticky, in the bookend hue, with a closing logo block and a credits link [verified] |
| Interactive particle footer | [site:oryzo] [recalled high] | the links beneath the particles stay keyboard-reachable |
| Three-line CTA in the last theme | [site:leo-parpeix] [recalled medium] | the footer is a theme, not a sitemap |
| Designed 404 in the same world | [site:lando-norris] [verified] · [site:shopify-editions-w26] [recalled high] · [site:why-zero] [verified tag] | a route, authored like the others |
| The loop | [site:igloo] [verified tag] · [site:slosh-seltzer] [recalled medium] | only when the story is a loop; a document must end |
| A living page after the story | construction progress [site:son-daven] · a regional news feed and merch [site:united-carriers] · news with read state [site:mont-fort], all [verified] | a reason to return, never bolted on without one |

Rules: the close matches the conversion (enquire, spec sheet, ticket hand-off, waitlist) and speaks the page's register; the 404 ships with the first release (`assets/templates/404.html`); no sitemap dumps and no social-icon row as the ending.

## Choosing a model

Why: the model follows the class, the visitor mode and the assets that actually exist. WebGL dosage is a separate budget decision (`sites/_index.md`, picking neighbours), not a reason to pick a model.

| Class | Visitor mode | Asset reality | Model | Nearest cards |
|---|---|---|---|---|
| Portfolio | experience | stills, a reel, some 3D | Collage index | [site:leo-parpeix]; [site:the-line] if DOM-first |
| Studio, agency | persuade | footage and case imagery, heterogeneous | Print artefact (one ink unifies) or Gallery (poster run) | [site:the-line] [site:lama-lama] |
| B2B hardware, defence, travel | persuade | photography, renders, PDFs | Specification (escalation, place-led or role-casting) | [site:seasats] [site:white-desert] [site:usavionix] |
| B2B service with a process | persuade | budget for scenes | Chaptered journey (scroll = the process) | [site:united-carriers] [site:mont-fort] |
| Property, big-ticket | persuade wrapped in experience | renders across time, maps | Chaptered journey, emotion before economics | [site:son-daven] |
| Campaign, manifesto | persuade, experience-led | one thesis, a 100 % canvas budget | Manifesto with gates | [site:why-zero] |
| Product launch, DTC | experience | one commissioned object per variant | Single-object launch | [site:oryzo] [site:slosh-seltzer] |
| Personal brand, holding group, catalogue | experience | many ventures or routes | Faceted world | [site:lando-norris] [site:mindmarket]; boundary [site:trevor-noah] |
| Brand monument | experience | a full bake pipeline | Chaptered journey as spatial descent | [site:igloo] |
| Changelog, docs, OSS | read | 100+ items, live demos | Gallery with switcher and search; Specification as playground | [site:shopify-editions-w26] [site:animejs] |
| Fashion, jewellery | experience | product photography | Gallery with a theme per route | [site:floema] |

Rules: read mode beats spectacle — the model must stay scannable under every effect [site:shopify-editions-w26] [site:animejs]; photography-only assets point to Specification or Gallery, never to a world you cannot render; when two models fit, take the one whose interruption you can build with a keyboard path.

## Verify

- [ ] The page map names one model, and every row carries entrance · hold · exit.
- [ ] Exactly one interruption, placed after the first content beat, with a keyboard equivalent and a skip.
- [ ] Rests between spectacles: no two hero-scale moments in adjacent chapters.
- [ ] On a high-ticket subject the numbers sit in the second half, and the register switches only at chapter boundaries.
- [ ] Every chapter is a `<section>` with a heading; the story reads as an article with CSS off; canvas text has a DOM mirror.
- [ ] A jump rail or equivalent lets a visitor leave any scrubbed sequence; a still exists per chapter for the reduced tier.
- [ ] The close is authored: a designed footer, a 404 in the same world, and a conversion matched to the stakes.
- [ ] The DIVERGENCE block names the three nearest cards and the literal order refused from each.

## Refuse

- The template order, or a model chosen by WebGL budget rather than by class, visitor mode and assets.
- Two interruptions on one page; an interruption before the first content beat; a gate in front of the content.
- A chapter with nothing to read; a hold that is only an image.
- Economics before emotion on a big-ticket subject; a register switch inside a chapter.
- An empty DOM behind a canvas story; a rail of numbered markers that navigates nowhere.
- A sitemap dump or social-icon row as the ending; a host-default 404.
- Any card's section order reproduced: the freight sequence, the prologue-to-progress order, the six stages, the coaster's beat order, three-break-three with the same break, the call-sheet order, the vessel-to-network escalation.
