# Imagery and assets

What this file is for: the imagery decision every direction contract has to make, and the sourcing, generation and licence record behind every asset a build ships. Read it when WORLD is written (concept), when the visual system is set (system), when assets are placed (structure, component, webgl) and before ship. The rubric's Content anchors at 9 and 10 ask for real photography or renders authored at full fidelity (`references/jury/rubric.md`); a build that defaults to type on a flat ground has made no imagery decision at all.

## Contents
1. [Strategies](#strategies)
2. [Choosing one](#choosing-one)
3. [Sourcing openly licensed material](#sourcing-openly-licensed-material)
4. [How much picture](#how-much-picture)
5. [Finish for made imagery](#finish-for-made-imagery)
6. [Generated assets](#generated-assets)
7. [The asset log](#the-asset-log)
8. [Verify](#verify) · [Refuse](#refuse)

## Strategies

Why: a world is recognisable with every word removed only when its images belong to it. The corpus runs on very different imagery and each choice is deliberate; "none, flat grounds" is not on the list because it is the absence of a choice.

| Strategy | What it means in practice | Card | Confidence |
|---|---|---|---|
| Type as the image | no photography; display type, colour and motion carry every screen | [site:animejs] (no photography, video or texture maps) | [verified] |
| One hue per subject | saturated flat colour fields stand in for photographs, one per product | [site:slosh-seltzer] | [verified] |
| The work is the imagery | no photography of its own; project videos supply every image | [site:wodniack] | [verified] |
| Commissioned illustration world | one illustrated cast and setting carries the whole site, no stock | [site:mindmarket] | [verified] |
| Documentary photography | macro footage, portraits and on-set stills, no renders and no illustration | [site:lama-lama] | [verified] |
| Rendered world | the scene is built and lit in the browser, type drawn into it | [site:igloo] (MSDF glyphs in the canvas, no DOM text) | [verified] |
| Procedural environment | sky, ground and light computed rather than photographed | [site:cyphercapital] | as the card records |
| Generated plate | a video plate that appears to come from a generative model | [site:edolus] | [inferred] |
| Found pictures of the subject's world | public-domain engravings set against a contemporary roster, so the contrast is the joke | [site:pensatori-irrazionali] | [verified] |

Plugin strategies for a build with no assets on hand, each a real decision, in the order to consider them:
1. Real pictures of the subject's world from the open collections: its street in old postcards and maps, its material up close, its trade in engravings, a museum object of its kind, the place from the air. Searched from the inventory with `assets.mjs search`, credited, and never presented as the client's own product, room, dish or person.
2. Generated rasters or meshes when a generation tool is configured, logged as synthetic.
3. For a software product, its own interface built in HTML with data that adds up, cropped and scaled like a photograph; a fake dashboard of grey bars is the opposite of this.
4. Made imagery for what no honest picture shows, at the finish in [Finish for made imagery](#finish-for-made-imagery): a drawn line language (one stroke weight, one hand, SVG); CSS-built objects (the product or its parts built from boxes, gradients and masks); procedural images from the world's own data (tide tables, timetables, measurements).
5. Deliberate crops of a few owned or licensed photographs, repeated as a system.
6. A type-only poster system with one rule for every screen.

Why found pictures come first: in the 2026-10-23 builds every no-asset brief went straight to code (`references/patterns/house-tells.md`), while their subjects (historic pigments, cable ships, cities) are documented in public-domain collections; and in taste-skill's blind rounds a page of drawings only, or of type only, looked unfinished beside one with real photographs and footage [external, taste-skill `references/research.md` §11, read 2026-10-26].

## Choosing one

Why: imagery is the most expensive part of a world to change late, so the contract fixes it before the system and the page map.

- Write the strategy into WORLD, one line: the strategy by name, what supplies it (the client's photographs, a named open collection, a generation tool, a drawn language, code), and what is refused.
- Assets on hand decide first. Real photographs of the subject beat everything else for Content; use them and design the crops. When there are none, search the open collections from the inventory before choosing anything else (`node "${CLAUDE_PLUGIN_ROOT}/scripts/assets.mjs" search "<inventory item>"`), then choose from the plugin strategies above in their order, never from stock.
- WORLD that settles on made imagery says what the search found and why none of it fits; "photography refused" without a search is the plugin rut, not a decision.
- The strategy follows the visitor mode: read-led sites carry imagery that rewards a second look; experience-led sites can let the rendered world be the image; persuade-led sites need the product or the people, as they are.
- One strategy per site, with at most one secondary (a documentary site may draw its diagrams). Mixing three reads as a mood board.
- Placeholders are labelled synthetic in the brief and in the asset log until they are replaced, and the page map says where each real asset goes.

## Sourcing openly licensed material

Why: an open collection is often the only way a small client's site gets real imagery, and a licence nobody recorded becomes a takedown later.

- Search collections that publish licences per item: Openverse (openverse.org, a search over openly licensed media), Wikimedia Commons, and museum open-access programmes that release public-domain images (for example the Met, the Art Institute of Chicago, the Rijksmuseum, the Smithsonian). Check the licence on the item page itself, never on the search result.
- `node "${CLAUDE_PLUGIN_ROOT}/scripts/assets.mjs" search "<query>" [--video] [--limit 6] [--min-width 1600]` asks Openverse, the Met, the Art Institute of Chicago, NASA, the Library of Congress and Wikimedia Commons at once (footage: Commons, the Internet Archive and NASA), keeps only public domain, CC0, CC BY and CC BY-SA, and prints each result's ref, licence, size and item page; a collection that is down is named, never fatal. `assets.mjs get <ref> [--out public/images]` downloads the file into the project and writes its log entry with the credit line, so `assets.mjs credits` is the credits page. Write the queries from the inventory, not the category: "Anglesey lifeboat station 1900", not "sea".
- Prefer public domain and CC0; CC BY needs the credit line exactly as the item asks; CC BY-SA binds the derivative; NC and ND licences do not fit a commercial site and are refused.
- Download only the file you will use, at the size you need, into the project; record the item page URL, author, licence and its URL in the asset log the same minute.
- Never take images from award galleries, competitor sites or the corpus captures in `.awards/research/` and `.awards/neighbours/`: those are other people's work and evidence only.

## How much picture

Why: a page reads as finished when its pictures lead their screens, and as a mock-up when every screen holds a small one. `capture.mjs` records, in `manifest.json` under `metrics.<viewport>.pictures`, what the jury needs to judge this: `shareByScroll` (per frame, the share of the viewport that is `picture`, meaning photographs, clips and raster images, and the share that is `made`, meaning canvases and large drawings), and for the page the counts of `raster` images, `videos`, `drawings` and `canvases`, and how many `sections` carry a picture a third of the viewport wide (`sectionsWithPictures`).

Measured on 99 recent Awwwards Sites of the Day by taste-skill's probe [external, taste-skill `references/imagery.md` §12, read 2026-10-26]: pictures fill about a third of a scrolled page, but in whole screens (42 % of screens hold none, 19 % are nine-tenths picture or more); the median page carries 7 pictures and pages with three or more distinct placements score higher than pages with two or fewer; 94 % of pictures have square corners; footage appears on half of the strongest pages and on one of the 16 weakest. Use these as the bar a picture-led WORLD is read against, not as quotas:
- A picture leads its screen (at least about 60 % of it) or stays small (under about 10 %); screen after screen at 20–40 % reads as a catalogue page.
- Three to five placements per page, no two neighbouring chapters with the same one.
- Two crop ratios carry most of the pictures; a third is a deliberate exception.
- One moving picture per screen at most: muted, looped, with a poster frame, paused out of view.
- Only display text sits on a picture, its contrast measured where it sits across the whole loop; body text goes beside or below.

## Finish for made imagery

Why: jurors call simple drawings basic. Made imagery (drawn, procedural, CSS-built, rendered) carries a world only when it is drawn with the care a photograph would have had.

- Draw the subject's own things, never decoration: the cable's armour wires, the stool's three legs and the grain of its seat, the enamel sign over the door. If you cannot name what a drawing depicts in the subject's world, it is decoration.
- Three levels of detail: big shapes that read at a glance, middle shapes that describe the thing (the handle, the window frame, the step), and small details that reward a second look (the maker's mark, the house number, the chipped tile). Light comes from tone steps between a lit and a shaded face, not from gradients. A drawing that would pass as a placeholder icon at full size is not finished.
- One graphic language for the page: one stroke weight or none, one corner and curve vocabulary, the palette's real colours at full strength.
- Draw large and let it work: the hero's dominant element, a full-width band, the footer mark; small doodles scattered around read as filler.
- Honesty: when a drawing stands in for a product that does not exist yet, say so once in small text near it or in the credits, and mark it `drawn` in the asset log.
- Never a sentence on the page about where the pictures come from or what they are not ("none of these shows our bar"): a caption says what the picture shows, and the credit sits in the footer or on the credits page.

## Generated assets

Why: a configured image or 3D generator can supply a world that has no photographs, and generated material carries obligations a photograph does not.

- Generate only when a tool is configured in the session; do not ask the user to set one up mid-build.
- Write the prompt from WORLD's material and light, never from a site name or an artist's name, and never ask for a recognisable real person, brand or place presented as real.
- Log every generated file with its tool, prompt, date and `synthetic: true`, and keep the same visual rules as photographs (crops, colour treatment, compression budget).
- The EU AI Act's Article 50 transparency rules apply from 2 August 2026 [verified, artificialintelligenceact.eu/article/50, read 2026-10-22]: providers of generators mark outputs in a machine-readable way, and deployers disclose deep fakes (content that looks like real people, objects, places or events) and AI-generated text published to inform the public on matters of public interest unless it had human editorial review. For a site that shows generated imagery of real-looking subjects, add a visible line where the images appear or on the credits page; for evidently artistic work the disclosure may be light so it does not spoil the work [verified, same]. This is not legal advice: say so to the user when it matters.

## The asset log

Why: credits, licences and synthetic labels are content the jury can see and a client is liable for.

`.awards/assets.json` holds one entry per file the site ships, written by `node "${CLAUDE_PLUGIN_ROOT}/scripts/assets.mjs" add …`:

| Field | For |
|---|---|
| `file` | the path in the project |
| `kind` | `owned`, `licensed`, `generated`, `drawn` or `placeholder` |
| `source`, `author`, `licence`, `licenceUrl` | where it came from and on what terms (licensed) |
| `tool`, `prompt` | how it was made (generated) |
| `credit` | the line the credits page shows, when the licence asks for one |
| `date` | when it entered the project |

`assets.mjs check <dir>` lists every image, video, font-free vector and 3D file in the project or build that has no entry, every licensed entry without a licence URL, and every placeholder still shipping; `assets.mjs credits` prints the credit lines for a credits page or the footer.

## Verify

- [ ] WORLD names one imagery strategy, what supplies it and what it refuses; with no assets on hand, it says what `assets.mjs search` found for the inventory before any made imagery was chosen.
- [ ] Made imagery has three levels of detail and one graphic language.
- [ ] The jury had `metrics.<viewport>.pictures` from the capture manifest beside the frames.
- [ ] Every shipped image, video and mesh has an entry in `.awards/assets.json`; `assets.mjs check` is clean.
- [ ] Licensed items carry their licence URL and, where required, a visible credit; generated items are marked synthetic, with a visible disclosure where the AI Act asks for one.
- [ ] No placeholder ships to production unlabelled.

## Refuse

- "Assets: none" as a final answer, and a flat ground standing in for a decision.
- Code-only imagery chosen before the open collections were searched, and a found picture presented as the client's own.
- A sentence on the page about where the pictures come from; captions say what a picture shows.
- Stock photography that would fit any company in the category.
- Images lifted from award galleries, competitor sites or the research captures.
- Generated people, brands or places presented as real.
