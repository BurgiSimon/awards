# Copy and content

What this file is for: how the corpus writes — numbers where a generated page puts adjectives, verbs where it puts nouns, a register that switches only at chapter boundaries, a conversion sized to the decision, chrome that speaks the audience's own paperwork, and credibility carried as data. Read it while the brief is captured and again before the jury; cite it as `[pattern:copy-and-content#section]`. Site copy appears only in fragments, and every fragment is labelled; none is a line to reuse. `reflex-lists.md` holds the words to avoid and is not repeated here.

## Numbers not adjectives

Why: an adjective is a claim the visitor must trust; a number is a claim the visitor can check, and Content is the axis where generated pages cap at 6 (`anti-patterns.md`).

| Move | Fragment | Card | Confidence |
|---|---|---|---|
| Dual units for a mixed audience | 3,000 m (10,000 ft) | [site:white-desert] | [verified] |
| Scarcity as a number | fewer than 500 people each year; 12 guests each | [site:white-desert] | [verified] |
| Endurance and range as headlines | six months at sea; 8,000 nautical miles; Sea State 6 | [site:seasats] | [verified] |
| Logistics as a measure of ease | fits in a pickup; 3–5 days of operator training | [site:seasats] | [verified] |
| Performance as a range | ≈ 500 km/h; 300–500 km | [site:usavionix] | [verified] |
| Footprint and people counted | over 15 global offices; almost 38 nationalities; over 35 % female workforce | [site:mont-fort] | [verified] |
| Real statistics as the argument's evidence | unemployment figures scattered across the shattered glass | [site:why-zero] | [verified] |
| A mission in one counted sentence | a 19-word manifesto line | [site:igloo] | [verified] |

Rules: every superlative becomes a figure with a unit; dual units whenever the audience spans systems; ranges stay ranges; a number that cannot be sourced is either cut or labelled synthetic (`#content-at-full-fidelity`); numbers are set as copy, never as a count-up (`[pattern:components-catalog#spec-and-metric-blocks]`).

## Verb chains

Why: a mission is a sequence of actions, and a sentence built from verbs compresses a timeline into one breath. USAvionix chains detect → suppress → secure → keep open → contain and frames the hardware as an agent that acts [site:usavionix] [verified fragments]; Montfort's capability line is four verbs in a row — trade, refine, store, transport [site:mont-fort] [verified]; Seasats closes a chapter with four one-word stabs [site:seasats] [verified fragment].

Rules: one verb per beat, no adjective between verbs; arrows or full stops, not commas and "and"; the subject is the product or the visitor, never "we believe"; a stab rhythm once per page, in a hold, not in a hero.

## Constraint removal

Why: a capability stated on its own is a feature; the same capability stated as a constraint removed is a reason to switch. Seasats' recurring formula is the capability as a cost the incumbent carries and this product does not — no crew, no crane, no specialist training [site:seasats] [verified]; USAvionix uses the same framing for autonomy [site:usavionix] [verified].

The formula: **[capability] without the [cost] of [incumbent]**. Plugin examples, invented and labelled synthetic: overnight delivery without the depot a national carrier needs; studio-grade colour without a post house's render farm. Rules: name the incumbent as a category (a crewed vessel, a post house), never a competitor by brand; the cost is concrete — a crane, a crew, a week of training — and, where possible, a number (`#numbers-not-adjectives`).

## Two registers

Why: a big-ticket subject needs both the poem and the spreadsheet, and mixing them in one paragraph makes both sound insincere. Son Daven writes the atmosphere chapters — place, myth, culture, seasons — in a literary register and the commercial chapters — typologies, metrics, progress — in plain numeric prose, and the switch happens at a chapter boundary so it reads as intent [site:son-daven] [verified]. The corpus runs the contrast in other pairs: soft, ethical copy against loud craft [site:lama-lama] [recalled medium-high]; boardroom prose under an extravagant camera [site:mont-fort] [inferred]; grand visuals over plain, scannable update copy [site:shopify-editions-w26]; a deadpan technical register on a ridiculous object [site:oryzo] [recalled high].

Rules: two registers at most; the switch only at a chapter boundary, marked by a block change (paragraph → spec block, poem → table), never by a font change; the numeric register never borrows the poetic one's adjectives (`[pattern:narrative-structures#emotion-before-economics]`).

## Conversion matched to stakes

Why: the action must cost as much as the decision — a cart on a five-figure trip and a "Get started" on a defence platform both read as unserious.

| Decision | Action the corpus offers | Card | Confidence |
|---|---|---|---|
| A five-figure expedition | Enquire; book a call — never a cart | [site:white-desert] | [verified] |
| A technical procurement | A spec-sheet PDF per configuration as the primary action | [site:seasats] | [verified URLs] |
| A pre-sale property investment | Metrics, then a dated progress log, then contact | [site:son-daven] | [verified] |
| A tour ticket | City → date → hand-off to the ticket seller, mobile-first | [site:trevor-noah] | [verified intent] |
| Joining a movement | The waitlist as an object — a form that folds like origami | [site:why-zero] | [verified] |
| A freight contract | A service promise about answering the phone, then contact | [site:united-carriers] | [verified fragment] |
| A sponsorship or fandom | A partnership inventory; fan capture injected at runtime | [site:lando-norris] | [verified] |
| Adopting a library | Install, then sponsor tiers | [site:animejs] | [verified] |
| A satire | The world's own conversions — a repository, a launch listing | [site:oryzo] | [verified repository] |

Rules: never "Get started" or "Learn more" (audit X01); the label is the outcome (download the spec sheet, book a call, join the waitlist); the primary action appears in the first viewport and again at the close (`[pattern:narrative-structures#the-close]`); one primary action per page.

## Telemetry register

Why: chrome written in the audience's own dialect turns navigation into evidence of expertise, and the register must hold from hero to footer or it reads as a costume.

| Device | Seen in | Confidence |
|---|---|---|
| Slash-prefixed labels — `/ MICRO / LABELS /` as a CSS pseudo-element; `///////` before a heading | [site:the-line]; [site:igloo] | [verified]; [verified] |
| A state label that states the current value: `Sound: Off` | [site:igloo] | [verified] |
| Status dots and live open/closed timings | [site:the-line] | [verified] |
| Underlined credit tables per project | [site:the-line] | [verified] |
| A Roman-numeral year; a `00/24` frame counter at headline scale | [site:the-line] | [verified] |
| Coordinate readouts, leader-line callouts, a HUD copyright line | [site:igloo] | [verified] |
| Thermal, lidar and IR readouts as the loader | [site:usavionix] | [verified description] |

Rules: pick the audience's real paperwork — a call sheet for film, a console for defence, a research station for a monument, a catalogue for jewellery — and render the chrome in it; every state control names its current state; the dialect is decoration only where it is not also information (a slash in `::before`, a status in the DOM); a monospace or HUD register on a product that is not technical is a costume (`craft-floor.md`).

## Metadata as boast

Why: adjectives about craft are unverifiable; a team size, a year and an award count are not. Every project on Léo Parpeix's page carries a quartet — name · discipline · year · team of N at a studio — plus an award tally, and the About page is a tabular CV with an awards count [site:leo-parpeix] [recalled medium]. The Line credits directors, composers and years in tables [site:the-line] [verified]; Floema labels each piece with a number and a collection [site:floema] [verified].

Rules: credibility travels as structured data in a `<dl>` or a table; count what can be counted (people, years, awards, offices) and name what can be named (roles, studios); leave out the adjective the number replaces.

## The named villain

Why: a campaign needs something to push against, and a page that only affirms has no tension. Why Zero names the traditional promise, shatters it, devalues the diploma and buries the argument in real statistics before offering its alternative [site:why-zero] [verified]. Seasats' anti-hype claim positions the whole category's vapourware as the implicit villain [site:seasats] [verified fragment].

Rules: the villain is a condition or an incumbent category, never a competitor by name; it is destroyed with a fact, not an insult; it appears once, early, and the alternative gets the longer half of the page.

## Total sincerity

Why: a joke that winks once is a joke; a joke that never winks is a world. Oryzo presents a cork coaster with keynote sincerity — the studio's own line is that the object was so mundane that treating it seriously was already funny [site:oryzo] [recalled high] — and extends the world off-site: a repository with six geometry checkpoints named like model releases, a fabricated benchmark, a limitations list, a paper and an open licence [verified], plus a launch listing, a founder video, a launch film awarded on its own and a multi-part making-of series [recalled high]. Lando ships an award-trophy model inside its own scene [site:lando-norris] [verified]; Anime.js builds its identity with the library it sells and publishes the animation as an example [site:animejs] [verified].

Rules: adopt a genre's complete conventions — the launch keynote, the model card, the changelog — and apply them with zero tonal breaks; extend the world into at least one artefact off the page (a repository, a film, a listing); the making-of is distribution, not an afterthought.

## Credits pages

Why: credits prove the work was made by people, and they are where provenance becomes legible — Son Daven's type from a Ukrainian foundry for a Ukrainian project is a credit line that does design work [site:son-daven] [verified].

Seen: a Site Credits link in the footer [site:the-line] [verified link; contents unknown]; launch credits by role — direction, front-end, 3D, sound, copy [site:leo-parpeix] [verified]; designer-developer and producer named [site:son-daven] [verified]; author, licence and sponsors in the README [site:animejs] [verified]; a making-of split by discipline [site:oryzo] [recalled high].

Rules: a credits route or footer block naming roles; faces with their foundries, libraries with their versions, open assets with their licences; the plugin and the reference corpus are not credited as authors.

## Content at full fidelity

Why: placeholder content hides layout faults and reads as generated; invented content presented as real is a lie the jury may catch. Shopify's artwork carried an AI substrate under human finish and the brief labels such assets synthetic [site:shopify-editions-w26] [recalled high]; Why Zero's own tags admit some generated content [site:why-zero] [verified tags]; Oryzo let generation into parts of the pipeline and kept it out of the final look [site:oryzo] [recalled high].

Rules: no lorem (audit X02), no emoji icons (audit X03); every image has alt text written as content; when a figure, a quote, a client or an image is invented for the build, it is written at full fidelity — plausible precision, a real unit, a real-sounding source — and listed as synthetic under `AWARDS.md ## Brief → Assets on hand`; never fabricate awards, press, testimonials or partner logos, even as placeholders.

## Copy audit

Run it on every page before the jury, against the rendered text, not the source:

1. Every superlative replaced by a figure with a unit; dual units where the audience spans systems.
2. No word from the avoid list (`reflex-lists.md`): "Get started", "Learn more", "seamless", "immersive", "elevate" and their relatives.
3. One or two registers, switched only at chapter boundaries; the numeric register free of the poetic one's adjectives.
4. The primary action's label is the outcome, sized to the decision, present in the first viewport and at the close.
5. The chrome speaks one dialect from hero to footer, and every state control names its current state.
6. Credibility as data: a team, a year, a count, a role — in a list or a table, not a sentence of adjectives.
7. On a campaign: one villain, named as a condition, destroyed with a fact.
8. A satire or a premise never winks; the world exists in at least one place off the page.
9. Credits present, with roles, faces, foundries and licences.
10. Nothing placeholder; everything invented labelled synthetic in `AWARDS.md`; no fabricated awards, press or logos.
11. Quoted or borrowed copy: none — a fragment from a card is evidence, never a line.

## Verify

- [ ] Audit X01, X02 and X03 pass: no generic CTA, no lorem, no emoji icons.
- [ ] Every figure has a unit and a source or a synthetic label; no count-up numbers.
- [ ] The register switch, if any, sits on a chapter boundary in the page map.
- [ ] The conversion in `AWARDS.md ## Brief` matches the price of the decision and the label states the outcome.
- [ ] State controls (sound, theme, compare) carry their current value in the accessible name.
- [ ] Credits and synthetic labels are written before the jury runs.

## Refuse

- Adjectives where a number belongs; "immersive experience" copy with no figures.
- "Get started", "Learn more", "Discover" and the rest of the avoid list as actions.
- Registers mixed inside a chapter; a poem in the spec table; a spec in the prologue.
- A cart on a five-figure decision; a form as the only path on a technical procurement.
- A HUD or monospace dialect on a product that is not technical; a state control without its state.
- A villain named by brand; a satire that winks; a world that exists only on the page.
- Placeholder content, unlabelled synthetic content, fabricated awards, press, testimonials or logos.
- Any card's lines: the expedition's camp sentences, the vessel's claims, the shattered-diploma script, the coaster's model card, the call-sheet labels, the manifesto sentence, the identity-line device.
