---
name: research
description: Turns a reference website into a structured case-study card in the awards corpus format — concept, palette, type, components, motion with parameters, stack evidence, weaknesses, generalisable principles, take / don't take, and a confidence label on every claim. Uses Playwright captures and light source inspection when the site is reachable, and marks recalled or inferred material honestly when it is not. Use whenever the user shares a site to learn from, asks "what makes this site award-winning", "analyse / deconstruct / break down this site", "why did this win", "add this to the references", pastes a CSSDA, FWA or other award-gallery entry, or wants the awards skills to learn a new style. Produces principles for awards:concept to diverge from, never a reproduction. Not for competitor SEO or content audits, and not for downloading a site's assets.
argument-hint: "<url | notes file> [--slug <name>] [--to project|plugin]"
---

# awards:research — turn a site into a case study

Arguments: `$ARGUMENTS`

- `<url | notes file>` — the site, or a file of notes, screenshots and pasted award listings about it
- `--slug <name>` — the card's file name; default is the host name without `www` and the top-level domain, in kebab-case
- `--to project | plugin` — `project` (default) writes to `.awards/sites/`; `plugin` writes into the corpus itself and is only valid inside the awards repository

## Setup

Read `AWARDS.md` and `DESIGN.md` in the project root when they exist; `## Status` in `AWARDS.md` says which phases are done, so resume from there instead of restarting. Read impeccable's `PRODUCT.md` for product truth when it exists and never overwrite it. Detect the scope (a whole site, one component named by file or selector, or a critique of something that already exists) and the stack (framework, animation and 3D libraries, build tool) from `package.json`, lockfiles and the entry files. When the request is clearly a whole site and no direction contract exists yet, offer `/awards:craft` once, then proceed with this skill.

## The corpus is the skill's taste

Why: `awards:concept` picks the three nearest cards for a brief and diverges from them, so a card that records what a site did, why it worked and what it cost lets the next build stand beside it, while a card that reproduces the site makes the next build a copy. Read `${CLAUDE_PLUGIN_ROOT}/references/README.md` before writing anything: it fixes the citation convention, the confidence labels and the 25-word quote limit that every card obeys.

Every factual claim carries one of four labels. A hex, a date, a score, a library or a credit without a label is a defect, not a detail.

| Label | Use it when |
|---|---|
| `[verified]` | you read it from a fetched source or a capture you can name |
| `[recalled high | medium | low]` | it comes from memory, with an honest level |
| `[inferred]` | it is typical for the genre rather than observed on this site |
| `[unknown]` | nothing supports a claim, and the field still has to say so |

## 1. Inputs

- A URL, reachable or not.
- A notes file: read it whole. Screenshots in it or beside it are opened with the Read tool and described in your own words.
- A pasted award listing: scores and credits become `[verified]` with the listing named, and are never upgraded beyond what it says.
- Decide the slug, then check for an existing card at the destination and in `${CLAUDE_PLUGIN_ROOT}/references/sites/`.
- Decide the destination. `--to plugin` is valid only when the current git root contains `plugins/awards/.claude-plugin/plugin.json`; anywhere else, say so and write to the project.
- Make sure `.awards/research/` is listed in the project's `.gitignore`; the captures are evidence for this pass, not repository content.

When only notes and screenshots exist and no URL, skip sections 2 to 4: the card is written from the material given, every observation from a screenshot is `[verified]` against that screenshot by file name, and everything else is `[recalled]` or `[inferred]`.

When a card already exists, update it in place: keep every label that still holds, replace `[recalled]` claims with `[verified]` ones where the new evidence allows, add what changed on the site, and record the date of the pass in §9. Never lower the rigour of an existing card to fit new material.

## 2. Capture when reachable

Why: five scroll states show the narrative beats; the mobile frame shows whether the phone was designed; the reduced-motion frame shows whether anyone thought about it; the manifest shows what the page loads and whether it errors. Together they turn recall into observation.

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/capture.mjs" <url> --out .awards/research/<slug> --scroll 0,25,50,75,100 --mobile --reduced-motion --json
```

On exit 0 or 2, open every capture with the Read tool and read each one for what it can show:

| Capture | Read it for |
|---|---|
| `desktop-s00` | the first viewport: hero archetype, primary action, type contract, colour strategy |
| `desktop-s25`, `desktop-s50`, `desktop-s75` | the beats: chapter rhythm, interruptions, the scroll model, the component inventory |
| `desktop-s100` | the close: footer, last action, whether the world holds to the end |
| `mobile-s00` | a designed phone layout or a shrunken desktop; how eccentric navigation collapses |
| `desktop-rm-s00` | the reduced-motion path: readable at rest, or lines stuck at opacity 0 |
| `manifest.json` | title, `lang`, canvas count, WebGL state, DOM nodes, console errors, failed requests, LCP and CLS |

- Describe each composition in your own words: what is where, at what scale, what the type and colour system appear to be, what changed between states. Everything read this way is `[verified]` against the capture name.
- A preloader or a consent wall in every frame is itself an observation about the load gate; add `--wait 3000` or `--wait-for <selector>` once, then record what you got.
- Frames that are identical, or a `scrollMode` of `wheel` in the manifest with nothing changing between states, mean the page hijacks the wheel and never moved: rerun once with `--wheel 12000 --wait 6000 --timeout 90000`, and say in §9 how the states were reached.

## 3. When the site is unreachable

Why: a card written from memory and presented as observation poisons every brief that later leans on it. Exit 3 (Playwright missing) or exit 4 (unreachable) is stated in the card with the date, and the confidence drops accordingly.

- Nothing about a page you did not see can be `[verified]`; it is `[recalled]` with a level, or `[inferred]`.
- Write the header table and the sections you can support; leave `[unknown]` where you cannot.
- Do not retry with a scraper, a proxy or an archive that would fetch assets; say what was not observed and move on.

## 4. Source inspection

Why: a library name is a claim about how a site was built, and jurors, clients and the next build all act on it. A claim needs a signature you can point at. Fetch one document and the text assets it links, and nothing else:

```
curl -sL --max-time 20 -o .awards/research/<slug>/index.html <url>
```

- Read the head: `<title>`, description, `generator`, Open Graph tags, `theme-color`, `color-scheme`, `lang`, `rel="preload"` fonts (face names), `rel="modulepreload"` (a bundler).
- Fetch linked CSS and JS as text, at most a few files and at most 2 MB each, into the same folder. Never fetch images, fonts, videos, audio or 3D models, and never follow routes the user did not name.
- Record each signature hit as `[verified]` with the file named:

| Signature in the served text | Claim it supports |
|---|---|
| `gsap`, `ScrollTrigger`, `SplitText` | GSAP, and which plugins |
| `lenis`, `data-lenis-prevent` | Lenis smooth scroll |
| `three`, `WebGLRenderer`, `ShaderMaterial` | Three.js; `ogl` for OGL; `@react-three` for R3F |
| `rive`, `.riv` | Rive |
| `anime`, `animejs` | anime.js |
| `barba`, `taxi`, `swup` | a page-transition library |
| `framer-motion` | Framer Motion |
| `webflow.js`, `w-` classes | Webflow |
| `/_next/`, `/_nuxt/`, `astro-island`, `/_app/immutable/`, `/assets/index-*.js` | Next, Nuxt, Astro, SvelteKit, Vite |
| CMS CDN hosts (Sanity, Contentful, Prismic, Storyblok, DatoCMS) | the CMS |

- Read CSS custom properties for the palette and type tokens, `@font-face` family names, `clamp()` display sizes, easing curves and durations. Each value read is `[verified]`; a value guessed from a screenshot is `[inferred]`.
- An absent signature is `[unknown]`, never "probably". Quote site copy only in fragments of at most 25 words, only when the register matters.

## 5. Write the card

Why: one schema across the corpus lets the planning skills compare cards by the same fields, and the template's last sections are where a card becomes useful instead of admiring. Copy `${CLAUDE_PLUGIN_ROOT}/references/sites/_TEMPLATE.md`, keep its header table and its nine sections, and use its fixed vocabularies for class, visitor mode, WebGL dosage, scroll model and narrative model so the index stays comparable. Fill the sections in this spirit:

- Header table: class, visitor mode, awards and scores, credits, stack with its evidence level, palette with hexes only where read from CSS, type contract, WebGL dosage, scroll model, narrative model. Every cell labelled.
- §1 Concept and narrative: the one idea and the beats you saw across the five scroll states, in your own words.
- §2 Structure and components: the inventory from the captures (preloader, nav, cursor, galleries, rails, footer, 404, easter eggs) and what each does.
- §3 Visual language: palette roles and grounds, the type scale and its tricks, imagery and materials, the layout system, the browser surfaces you could observe.
- §4 Motion and effects: the approach per category with the numbers that are actually known (easings, durations, lerps, resolutions) and nothing invented.
- §5 Tech and pipeline: the stack table with evidence, asset weights from the manifest and the fetched sizes, the resize and quality strategy where visible.
- §6 Weaknesses: what a jury would dock (section 6 below), then what the awards skills do differently.
- §7 Principles: three to six, stated so they apply to any subject, none of them naming the site's own content.
- §8 Take / Don't take: the transferable decisions and parameters, then the literal moves that would make new work a copy (section order, copy lines, palette hexes, assets, the signature as-is).
- §9 Confidence and sources: one line per section and the sources actually used, with the capture date and the reachability.

Before writing §7 and §8, read the two nearest existing cards from `${CLAUDE_PLUGIN_ROOT}/references/sites/_index.md` for the register and the depth the corpus expects. Keep the card under 200 lines.

## 6. The weaknesses walk

Why: the corpus exists to be beaten on usability, not admired, and §6 is the section `awards:concept` reads to find where a build can outdo its neighbours. Run the short form of the usability walk on the captures and the fetched source; read `${CLAUDE_PLUGIN_ROOT}/references/jury/usability-walk.md` for the full step list when a site's model is unusual.

- Reduced motion: does `desktop-rm-s00` read at rest, or is text left hidden by an animation that never ran?
- Keyboard: does the source show key handlers for gates, drags, rails and menus, or pointer-only listeners?
- DOM behind the canvas: are the text and images mirrored in the markup, or is the page empty without WebGL?
- The load gate: how long does the preloader hold, and is it skipped on a repeat visit?
- The phone: is the mobile frame designed, and does eccentric desktop navigation have a touch equivalent?
- Wayfinding and conversion: is the current chapter indicated, and is the primary action reachable without hunting?

Write one line per item with a pass, a fail or `[unknown]`, then the sentence that matters: what the awards skills do differently on this point.

## 7. The index row

Why: the planning skills find neighbours through the index table, not by opening every card. Add one row with the index's columns:

```
| `<slug>` | <site> | <class> | <visitor mode> | <narrative model> | <WebGL dosage> | <scroll model> | <palette strategy> | <type contract> | <awards / score> | <confidence> |
```

- Project destination: `.awards/sites/_index.md`. Create it when missing with a one-line heading, a note that these are project-local additions read alongside the plugin corpus, and the same table header as `${CLAUDE_PLUGIN_ROOT}/references/sites/_index.md`.
- Plugin destination: append the row to `${CLAUDE_PLUGIN_ROOT}/references/sites/_index.md` and update the count in its title.
- The confidence cell is the card's overall label: high when sources were read verbatim, medium when captures and award pages carried it, low when recall did.

## Verify

- Every hex, date, score, library and credit in the card carries a label; grep the card for `#[0-9a-f]{3,6}` and for library names and check each line.
- `wc -l` reports under 200 lines; the header table and all nine sections are present.
- No quotation exceeds 25 words; §1–§4 describe, they do not reproduce section order or copy.
- Reachability and the capture date are stated; an unreachable site has no `[verified]` claim about its render.
- Nothing was written outside the card, the index row and `.awards/research/<slug>/` (captures, the fetched HTML and text assets).
- The slug is identical in the file name, the index row and the citation form `[site:<slug>]`.

## Hand-off

When the research feeds a build (the request continues into ideas, a direction or a site), invoke the `awards:concept` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. Otherwise return the card path, its overall confidence and the three strongest principles, and stop.

## Refuse

- Scraping: crawling routes, bulk downloads, saving images, fonts, videos, audio or 3D models, or working around a block.
- Reproduction: rebuilding the site, or carrying its copy, palette hexes, section order or signature into a new build.
- Unevidenced stack claims: naming a library, a CMS or a studio without a signature or a label.
- Inventing awards, scores, dates or credits; upgrading a `[recalled]` claim because it sounds right.
- Quoting more than 25 words of the site's copy, or pasting its copy into the card as description.
