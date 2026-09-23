# Anti-patterns — the Awwwards default and other slop families

A page fails the naming test in two directions: a juror can name the site it copies, or a juror can name the tool that generated it. This file catalogues the second failure. Each family lists its tells (what the audit or a glance catches) and the rewrite (what the corpus does instead). Read it during concept work and again during the jury's specificity test.

## The Awwwards default
The register every model reaches for when asked for "an award-winning site": near-black ground, one neon accent with glow, an oversized grotesque headline, a WebGL blob or particle field behind it, sections that fade and rise, a marquee of logos, a cursor trail.

| Tell | Why it fails | Rewrite |
|---|---|---|
| Dark + neon + glow with no diegetic reason | Reads as a genre, not a brand; 10 of the 19 corpus sites with a known ground are light-dominant | Derive ground and accent from the subject's environment `[pattern:color-and-material#colour-strategies]`; if dark, warm the black and earn it (`[site:usavionix]` earns pure black with night-vision imagery) |
| Blob / mesh-gradient / particle hero | Effect without concept; Creativity caps at 6 | Pick a hero archetype that enacts the thesis `[pattern:hero-archetypes]` |
| Fade-and-rise on every section | Nobody in the corpus ships it; motion becomes wallpaper | One authored moment per chapter, masked line reveals for text, scrubbed choreography for the signature `[pattern:motion-vocabulary]` |
| Glow buttons, gradient text, glass cards | Costume, not material | Sharp and shadowless with depth by luminance, or one material policy chosen on purpose `[site:the-line]` |
| Cursor trail glitter, tilt cards, count-up stats | Interaction as decoration | A two-speed cursor that carries affordances, magnetic only on real targets, numbers as copy not as animation `[pattern:cursor-and-pointer]` |
| "Immersive experience" copy with no numbers | Content caps at 6 | Numbers, dual units, verb chains `[pattern:copy-and-content]` |

## The category defaults
Each class has its own rut. Concept work names both ruts (category and Awwwards) before dealing directions.

| Class | What every model ships | What the corpus did instead |
|---|---|---|
| Portfolio | Name, one-line role, grid of cards with hover zoom, about, contact | A craft manifesto with a typographic break and a hover-preview archive `[site:leo-parpeix]`; a call sheet about film `[site:the-line]`; a developer's one-pager whose section titles become the rooms the work moves through, with no WebGL `[site:wodniack]` |
| Studio / agency | Reel, logo wall, services triad, case grid, "Let's talk" | Work as poster-scale blocks with a single grotesque `[site:lama-lama]`; a print artefact with one flooded ink `[site:the-line]`; an index where each project is one self-moving filmstrip row `[site:boc]` |
| B2B product | Hero metric row, three-feature grid, testimonials, pricing, "Get started" | Scroll as the operational process `[site:united-carriers]`; specs as headlines and a scrollspy index `[site:seasats]`; a boot sequence that casts the visitor as operator `[site:usavionix]` |
| Campaign / launch | Countdown, video background, sign-up form | A manifesto you sign by drawing `[site:why-zero]`; total-sincerity satire with the world extended off-site `[site:oryzo]`; a changelog hung as a gallery `[site:shopify-editions-w26]` |
| Luxury / travel / property | Full-bleed photo, serif headline, "Discover", gold accent | Specification-grade copy and a two-colour UI with chroma from photography `[site:white-desert]`; emotion before economics with seasonal compare `[site:son-daven]` |
| Personal brand | Big portrait, social icons, "Book me" | A persona fork across authored routes `[site:lando-norris]`; a collage that resolves into an index `[site:trevor-noah]` |
| Docs / OSS | Sidebar, code blocks, hero with install command | The library animating its own identity and docs as a playground `[site:animejs]` |

## Slop families the audit catches
- **Template order**: hero → logos → features → testimonials → pricing → FAQ → CTA. Rewrite as chapters with beats and one interruption `[pattern:narrative-structures]`.
- **Identical card grids** [L04], **eyebrow labels** [L05], **numbered markers by habit** [X07], **hero-metric rows** [X08].
- **Reflex faces** [T01]: Inter, Space Grotesk, DM Sans, Manrope, Outfit, Plus Jakarta as display; Fraunces, Playfair, Cormorant, Syne, Instrument Serif as the "premium" costume; IBM Plex or Space Mono as the "technical" costume. See `reflex-lists.md`.
- **Generated palettes** [C03]: six evenly spaced hues, purple-to-pink gradients, the indigo-violet "AI" pair, teal + orange startup, pastel rainbow.
- **Generic CTA copy** [X01], lorem [X02], emoji icons [X03].
- **Glass by default** [X04], hard offset shadows [X05], side-stripe borders [X06].

## The specificity test (both directions)
1. Look at the first viewport alone. Could a juror name the source site? If yes, the DIVERGENCE block failed: change the hero archetype, the palette strategy or the signature, not the copy.
2. Could a juror name the generator? If yes, at least two families above are present. Remove them before adding anything.
3. Strip the copy. Does the skeleton still say what the page is and why it matters? If it only works once the words return, the design is in the font size.

## Effect inflation
Creativity does not scale with effect count. The corpus pattern is one signature plus two or three supporting moves: `[site:oryzo]` reduced its palette and typography to afford three loud moments; `[site:trevor-noah]` allowed WebGL one material behaviour; `[site:the-line]` took Site of the Month with a hinge, a flicker and an acetate. When a build has more than one signature, cut to one and let the rest be craft.

## Concept-as-mood
"Cinematic", "premium", "immersive", "bold" are moods, not concepts. The memory test asks what a visitor describes an hour later; a mood cannot be described. A concept is an object or a behaviour: the helmet that becomes telemetry, the shipment that crosses the page, the zero you draw.
