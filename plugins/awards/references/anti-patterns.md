# Anti-patterns — the Awwwards default and other slop families

A page fails the naming test in two directions: a juror can name the site it copies, or a juror can name the tool that generated it. This file catalogues the second failure. Each family lists its tells (what the audit or a glance catches) and the rewrite (what the corpus does instead). Read it during concept work and again during the jury's specificity test.

## The Awwwards default
The register every model reaches for when asked for "an award-winning site": near-black ground, one neon accent with glow, an oversized grotesque headline, a WebGL blob or particle field behind it, sections that fade and rise, a marquee of logos, a cursor trail.

| Tell | Why it fails | Rewrite |
|---|---|---|
| Dark + neon + glow with no diegetic reason | Reads as a genre, not a brand; 10 of the 19 corpus sites with a known ground are light-dominant, and 14 of the 28 cards added on 2026-09-23 `[pattern:color-and-material#light-grounds]` | Derive ground and accent from the subject's environment `[pattern:color-and-material#colour-strategies]`; if dark, warm the black and earn it (`[site:usavionix]` earns pure black with night-vision imagery) |
| Blob / mesh-gradient / particle hero | Effect without concept; Creativity caps at 6 | Pick a hero archetype that enacts the thesis `[pattern:hero-archetypes]` |
| Fade-and-rise on every section | Nobody in the corpus ships it; motion becomes wallpaper | One authored moment per chapter, masked line reveals for text, scrubbed choreography for the signature `[pattern:motion-vocabulary]` |
| Glow buttons, gradient text, glass cards | Costume, not material | Sharp and shadowless with depth by luminance, or one material policy chosen on purpose `[site:the-line]` |
| Cursor trail glitter, tilt cards, count-up stats | Interaction as decoration | A two-speed cursor that carries affordances, magnetic only on real targets, numbers as copy not as animation `[pattern:cursor-and-pointer]` |
| "Immersive experience" copy with no numbers | Content caps at 6 | Numbers, dual units, verb chains `[pattern:copy-and-content]` |
| A timed gate: a scripted percentage, a click-to-enter wall, an intro on every visit | Loading as theatre; the most repeated fault of the 2026-09-23 wave — timers on `[site:pensatori-irrazionali]` `[site:runrobrun]` `[site:spasoje]` `[site:the-boyd]` `[site:siena]` `[site:noth]` `[site:grids-obys]`, every-visit intros on `[site:zainabkabira]` `[site:areebali]` `[site:likova]` | A counter on a real signal that holds at 100 and is skipped on repeat `[pattern:preloaders-and-transitions#the-load-contract]`, or no loader at all `[site:nodeck]` |
| Sound on by default, or UI sound with no switch | The visitor is ambushed; jurors browse muted | Opt-in behind a stated toggle `[pattern:sound#opt-in-only]`; `[site:pensatori-irrazionali]` `[site:haoqi]` `[site:spasoje]` `[site:siena]` are what to beat |

## The category defaults
Each class has its own rut. Concept work names both ruts (category and Awwwards) before dealing directions.

| Class | What every model ships | What the corpus did instead |
|---|---|---|
| Portfolio | Name, one-line role, grid of cards with hover zoom, about, contact | A craft manifesto with a typographic break and a hover-preview archive `[site:leo-parpeix]`; a call sheet about film `[site:the-line]`; a developer's one-pager whose section titles become the rooms the work moves through, with no WebGL `[site:wodniack]`; a handheld device you switch on `[site:areebali]`; career rows where down is time and sideways is the work `[site:robbietilton]`; a round trip between two worlds `[site:haoqi]`; the credential carried by the footage itself `[site:christoph-nagel]`; two disciplines behind one switch `[site:alectear]` |
| Studio / agency | Reel, logo wall, services triad, case grid, "Let's talk" | Work as poster-scale blocks with a single grotesque `[site:lama-lama]`; a print artefact with one flooded ink `[site:the-line]`; an index where each project is one self-moving filmstrip row `[site:boc]`; a cinema's ritual — ticket, reel, admit-one contact `[site:siena]`; the name as the first interaction `[site:noth]`; mood carried by flat colour grounds alone `[site:warmnfuzzy]`. The rut itself, well made: `[site:goats]` `[site:wearedirect]` |
| B2B product | Hero metric row, three-feature grid, testimonials, pricing, "Get started" | Scroll as the operational process `[site:united-carriers]`; specs as headlines and a scrollspy index `[site:seasats]`; a boot sequence that casts the visitor as operator `[site:usavionix]`; the members' own work as the hero `[site:okaydev]`; the building's massing as the interface's one shape `[site:likova]`; the pointer printed in the audience's units `[site:siteassist]`. The rut in costume: benefit tabs, numbered solutions, sectors, a case, "Let's talk" `[site:siteassist]` |
| Campaign / launch | Countdown, video background, sign-up form | A manifesto you sign by drawing `[site:why-zero]`; total-sincerity satire with the world extended off-site `[site:oryzo]`; a changelog hung as a gallery `[site:shopify-editions-w26]`; a deck that argues against decks `[site:nodeck]`; an exhibition whose medium retraces how the subject was made `[site:gehry-getty]` |
| Luxury / travel / property | Full-bleed photo, serif headline, "Discover", gold accent | Specification-grade copy and a two-colour UI with chroma from photography `[site:white-desert]`; emotion before economics with seasonal compare `[site:son-daven]` |
| Personal brand | Big portrait, social icons, "Book me" | A persona fork across authored routes `[site:lando-norris]`; a collage that resolves into an index `[site:trevor-noah]` |
| Docs / OSS | Sidebar, code blocks, hero with install command | The library animating its own identity and docs as a playground `[site:animejs]`; a method explainer that lets the reader switch the method on over the page `[site:grids-obys]` |
| E-commerce | Hero banner, product grid, "Shop now", newsletter | One image in two states split along a torn edge `[site:serotoninn]`; an enquiry written as a sentence the buyer completes `[site:the-boyd]` — both still hang their looks in a row with no argument between them |

## The slop scan
These are the habits a generator falls into when nobody made a decision, grouped in the order a reviewer walks a page. **Caught by** names the audit rule that flags the habit. Rules marked *render* need `audit.mjs --render`. `judge` means only someone looking at the captures can tell. **Earned when** describes the version the corpus ships on purpose, and a dash means there is none.

**Deciding each hit:**
- An earned use is recorded under `AWARDS.md ## Exceptions` with its reason.
- A habit is removed.

**Running the scan:**
1. Read the audit output first.
2. Walk the `judge` rows against the captures.
3. Give every family present one line of evidence: a capture name or a `file:line`.

**Verdict:** two or more families present means a juror can name the generator. That is the second direction of the specificity test below.

### Surface and detail
| Tell | Caught by | Earned when |
|---|---|---|
| Glass panels as the default surface | X04 (more than three selectors); judge below that | One pane with a job, such as a bar over moving imagery `[pattern:color-and-material#material-policies]` |
| Hard offset shadows and the sticker kit | X05 | The world really is neo-brutalist `[site:nodeck]` |
| A thick coloured stripe down one side of a card, or across the top of a rounded box | X06 | — |
| Graph-paper lines or pinstripes painted in as texture | X09 | The lines are information: a tilted floor that shows its plane `[recipe:throw-objects-css3d]`, a grid the content actually sits on |
| A hairline border and a wide soft shadow on the same box | X19 | — |
| Coloured glow on buttons, cards or type | X11 | The light belongs to the scene `[site:usavionix]` |
| Corners so round they crop the content inside | judge | — |
| Wobbly SVG mascots, blobs and "abstract shapes" standing in for illustration | judge | The drawing is commissioned, or drawn in the world's own hand |
| Boxes inside boxes | X20 *render* | — |

### Type
| Tell | Caught by | Earned when |
|---|---|---|
| A reflex face as the first family | T01 | A deliberate pick, with the reason recorded |
| A small uppercase label or pill over every heading | L05 | Labels are the texture of a metadata world `[pattern:typography#labels-as-texture]` |
| A rounded icon tile stacked over each heading | L04 | — |
| A sentence-long headline at display size filling the first screen | judge | The headline is the hero archetype and says one thing in few words `[pattern:hero-archetypes]` |
| Italic serif display as the "premium" costume | judge (T01 catches the usual faces) | The serif is the brand's voice across the whole system `[pattern:typography#contracts]` |
| One family for everything | judge | One characterful grotesque at display scale, held as a contract `[pattern:typography#contracts]` |
| Display tracking crushed below -0.06em | T04 | — |
| Headings barely larger than the body | T08 *render* | — |
| Paragraphs that are justified, in capitals, tightly led, widely tracked or under 14px | T07 | — (capitals and tracking belong to short labels) |

### Colour
| Tell | Caught by | Earned when |
|---|---|---|
| Framework purple, violet or cyan; purple-to-pink gradients | X12 | — |
| Gradient text | C04 | — |
| A coloured halo or spotlight behind the hero | X10 | The light source is in the image or the scene |
| Dark ground and a neon accent as the default register | judge (X11 and X12 help) | Ground and accent are derived from the subject `[pattern:color-and-material#colour-strategies]` |
| More than six hues | C03 | — |
| Cream or beige standing in for a palette | judge | Paper is the material of the world `[site:the-line]`. Light grounds are the corpus majority `[pattern:color-and-material#light-grounds]`, so ask whether the ground was derived or defaulted |
| Pure black or white grounds | C02 | The black is diegetic |
| Grey text washed out on a coloured field | C01 | — |

### Layout
| Tell | Caught by | Earned when |
|---|---|---|
| Template order: hero, logos, features, testimonials, pricing, FAQ, CTA | judge | Chapters with beats and one interruption `[pattern:narrative-structures]` |
| Identical icon-heading-text card grid | L04 | — |
| A hero-metric row | X08 | Numbers carried inside sentences `[pattern:copy-and-content#numbers-not-adjectives]` |
| 01 / 02 / 03 section markers by habit | X07 | The sequence means something to the reader |
| The same gap everywhere, so nothing groups | judge | — |
| Opening columns of very different heights; a heading nearer the previous block than its own | judge | — |
| Text under an opaque layer, or menus and popovers clipped by overflow | judge (L02 catches sideways overflow) | — |
| Lines beyond about 90 characters | L07 *render* | — |
| Paragraphs touching the edge of a phone screen | L08 *render* | — |
| Text pressed against the edge of its button or card | judge | — |

### Motion
| Tell | Caught by | Earned when |
|---|---|---|
| Fade-and-rise on every section | judge | One authored moment per chapter `[pattern:motion-vocabulary#masked-line-reveals]` |
| Bounce, elastic or overshoot easing | X13 | The moving thing is a character `[site:animejs]`, or one overshoot is the signature `[recipe:word-cycle-hero]` |
| Pulsing dots, blinking carets, floating blobs on a loop | X14 | The state is live: a recording light, a field being typed |
| Every image zooms or turns on hover | X15 | The hover carries information `[pattern:motion-vocabulary#hover-shifts]` |
| A marquee scrolling on its own | judge | rAF-driven, masked and pausable `[recipe:marquee-raf-mask]` `[site:seasats]` |
| Animating width, height, top or left | M07 | — |
| Content that stays invisible when an entrance fails | L06 *render* | — |

### Copy
| Tell | Caught by | Earned when |
|---|---|---|
| "Get started", "Learn more" and their cousins | X01 | — |
| Lorem ipsum | X02 | — |
| Emoji as icons | X03 | — |
| Slogan antithesis, "Not X. A Y.", more than once | X16 | — |
| Promise words ("seamless", "supercharge", "elevate"), or calling a rival practice "theater" | X17 | — |
| A dash in every other sentence | X18 | — |
| The same label repeated in one card | judge | — |

### Imagery
| Tell | Caught by | Earned when |
|---|---|---|
| Placeholder hosts or an empty `src` | X02 | — |
| Flat circles and blocks where a picture should be | judge | — |
| Torn or jagged image masks | judge | The edge is the concept `[site:serotoninn]` |
| Images buried under a near-opaque overlay | judge | — |

### Quality
| Tell | Caught by | Earned when |
|---|---|---|
| Page errors on load | ERR *render*, capture manifest | — |
| Skipped heading levels | A03 | — |
| Body text below 4.5:1 | C01 | — |

Reflex faces, generated palettes and copy are listed in `reflex-lists.md`; `scripts/data/reflex-fonts.json` and `scripts/data/reflex-copy.json` are what the audit reads.

## The specificity test (both directions)
1. Look at the first viewport alone. Could a juror name the source site? If yes, the DIVERGENCE block failed: change the hero archetype, the palette strategy or the signature, not the copy.
2. Could a juror name the generator? Run the slop scan above; two or more families present means yes. Remove them before adding anything.
3. Strip the copy. Does the skeleton still say what the page is and why it matters? If it only works once the words return, the design is in the font size.

## Concept-as-pun
A name taken literally is a starting point, not a concept. Goats walking at the camera `[site:goats]`, a marble philosopher "in his prime" wearing a modern prop `[site:primesec]`, a pixel runner for a Rob `[site:runrobrun]` and a chemical tag for a mood `[site:serotoninn]` lean on the pun as a picture. The names that go further become a system or an act: road signage that supplies every render, loader and route curtain `[site:wearedirect]`, a mark that grows because the brand promises growth `[site:mensch]`, a paradox the pointer performs `[site:noth]`. Ask what the name makes the visitor do, not only what it makes them see.

## Effect inflation
Creativity does not scale with effect count. The corpus pattern is one signature plus two or three supporting moves: `[site:oryzo]` reduced its palette and typography to afford three loud moments; `[site:trevor-noah]` allowed WebGL one material behaviour; `[site:the-line]` took Site of the Month with a hinge, a flicker and an acetate. When a build has more than one signature, cut to one and let the rest be craft.

## Concept-as-mood
"Cinematic", "premium", "immersive", "bold" are moods, not concepts. The memory test asks what a visitor describes an hour later; a mood cannot be described. A concept is an object or a behaviour: the helmet that becomes telemetry, the shipment that crosses the page, the zero you draw.
