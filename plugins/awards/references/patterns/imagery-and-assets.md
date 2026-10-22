# Imagery and assets

What this file is for: the imagery decision every direction contract has to make, and the sourcing, generation and licence record behind every asset a build ships. Read it when WORLD is written (concept), when the visual system is set (system), when assets are placed (structure, component, webgl) and before ship. The rubric's Content anchors at 9 and 10 ask for real photography or renders authored at full fidelity (`references/jury/rubric.md`); a build that defaults to type on a flat ground has made no imagery decision at all.

## Contents
1. [Strategies](#strategies)
2. [Choosing one](#choosing-one)
3. [Sourcing openly licensed material](#sourcing-openly-licensed-material)
4. [Generated assets](#generated-assets)
5. [The asset log](#the-asset-log)
6. [Verify](#verify) · [Refuse](#refuse)

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

Plugin strategies for a build with no assets on hand, each a real decision: a drawn line language (one stroke weight, one hand, SVG); CSS-built objects (the product or its parts built from boxes, gradients and masks); deliberate crops of a few owned or licensed photographs, repeated as a system; a type-only poster system with one rule for every screen; procedural images from the world's own data (tide tables, timetables, measurements); generated rasters or meshes when a generation tool is configured, logged as synthetic.

## Choosing one

Why: imagery is the most expensive part of a world to change late, so the contract fixes it before the system and the page map.

- Write the strategy into WORLD, one line: the strategy by name, what supplies it (the client's photographs, a named open collection, a generation tool, a drawn language, code), and what is refused.
- Assets on hand decide first. Real photographs of the subject beat everything else for Content; use them and design the crops. When there are none, choose from the plugin strategies above rather than from stock.
- The strategy follows the visitor mode: read-led sites carry imagery that rewards a second look; experience-led sites can let the rendered world be the image; persuade-led sites need the product or the people, as they are.
- One strategy per site, with at most one secondary (a documentary site may draw its diagrams). Mixing three reads as a mood board.
- Placeholders are labelled synthetic in the brief and in the asset log until they are replaced, and the page map says where each real asset goes.

## Sourcing openly licensed material

Why: an open collection is often the only way a small client's site gets real imagery, and a licence nobody recorded becomes a takedown later.

- Search collections that publish licences per item: Openverse (openverse.org, a search over openly licensed media), Wikimedia Commons, and museum open-access programmes that release public-domain images (for example the Met, the Art Institute of Chicago, the Rijksmuseum, the Smithsonian). Check the licence on the item page itself, never on the search result.
- Prefer public domain and CC0; CC BY needs the credit line exactly as the item asks; CC BY-SA binds the derivative; NC and ND licences do not fit a commercial site and are refused.
- Download only the file you will use, at the size you need, into the project; record the item page URL, author, licence and its URL in the asset log the same minute.
- Never take images from award galleries, competitor sites or the corpus captures in `.awards/research/` and `.awards/neighbours/`: those are other people's work and evidence only.

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

- [ ] WORLD names one imagery strategy, what supplies it and what it refuses.
- [ ] Every shipped image, video and mesh has an entry in `.awards/assets.json`; `assets.mjs check` is clean.
- [ ] Licensed items carry their licence URL and, where required, a visible credit; generated items are marked synthetic, with a visible disclosure where the AI Act asks for one.
- [ ] No placeholder ships to production unlabelled.

## Refuse

- "Assets: none" as a final answer, and a flat ground standing in for a decision.
- Stock photography that would fit any company in the category.
- Images lifted from award galleries, competitor sites or the research captures.
- Generated people, brands or places presented as real.
