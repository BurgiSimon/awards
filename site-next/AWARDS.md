# AWARDS.md — award-level build contract

<!-- awards:schema 1 · written and read by the awards skills · keep the sections in this order -->

## Status
- [x] Brief captured
- [x] Direction contract locked (concept)
- [ ] Visual system written (system → DESIGN.md, tokens.css)
- [ ] Page map and skeleton built (structure)
- [ ] Stack booted (stack)
- [ ] Motion score authored and built (motion)
- [ ] WebGL layer built or explicitly declined (webgl)
- [ ] Jury disposition: —
- [ ] Shipped (ship)

## Brief
- **Subject:** `awards`, a Claude Code and Codex plugin (MIT, BurgiSimon; the version is read from its manifest at build time) that designs, builds, audits and judges websites against a corpus of analysed award winners. This site is its public page, self-hosted as static files. It replaces the earlier public page in `site/` (the wind-tunnel build), which is this redesign's baseline.
- **Unique mechanism (what only this subject can prove):** a website held to a written contract and tested before anyone sees it, by the same loop that built this page: 89 audit rules in 8 families run after every edit, headless captures at three widths, and a juror in a fresh context who scores Design 40 · Usability 30 · Creativity 20 · Content 10 and ends on one word (`ship`, `fix`, `rebuild`, `recapture`). The taste is cited, not claimed: 62 analysed award sites (55 with measured composition skeletons) and 89 recipe entries verified in headless Chromium. The scores this page received are printed on it, unedited.
- **Audience and their real scene:** developers and design engineers who already run Claude Code or Codex; they arrive from a repository link or a post, on a laptop with a terminal open beside the browser, with about thirty seconds before deciding to install or close the tab. A second visit is a lookup: a rule id, a recipe, a command.
- **Stakes and conversion (what a visitor should do, matched to the price of the decision):** free, two commands, reversible: copy the install commands (Claude Code and Codex) and paste them. Secondary: browse the recipes, read the docs.
- **Assets on hand:** no photographs, video or 3D. Owned: frames of the plugin's own 89 recipes rendered in headless Chromium (MIT, produced by `verify-recipes` and `capture.mjs`), this build's own captures, audit JSON and jury report, and the recipe, rule and card metadata. Copy is authored from the plugin's own files; every count is read from the repository at build time. Anything drawn for the build (diagrams, marks) is labelled synthetic. No screenshots of third-party sites: the corpus captures are other people's work, evidence and never published.
- **Binding constraints:** static Vite multi-page build, relative `base`, self-hosted on any static server (`.github/workflows/site.yml` deploys `site/` to GitHub Pages on dispatch); WCAG 2.2 AA; no analytics, no external requests at runtime; no invented awards, testimonials or logos. `programs: awwwards`, target Site of the Day. A redesign, not a reskin: the baseline's world (smoke streamlines, a light lab ground, one warning orange, an extended heavy grotesque wordmark) is not reused.
- **Routes:** 5 — home, install, docs, recipes (the catalogue of 89 entries, filterable by group and tag, each with its frame), 404.
- **Sound:** none.
- **Visitor mode:** persuade (install is the conversion); the docs and recipes routes are read.
- **References the user likes:** none.

## Direction contract
- **THESIS:** This page is its own proof sheet: the frames `capture.mjs` shot of this very page hang in a strip beside it at the depth being read, and the juror's black marker rings, crosses and arrows sit on the frames they cite, each with its line from the jury report, so the visitor sees what the jury saw before anyone else did. Memory test: "the page showed me its own screenshots in a strip down the side, with the jury's marker rings and crosses on them."
  - Refuses the dev-tool category rut: the install command in a fake terminal window as the hero, a hero-metric row, a three-feature icon grid, a docs sidebar on home, "Get started".
  - Refuses the Awwwards rut: near-black with a neon glow, an oversized grotesque over a blob or particle field, fade-and-rise sections, a logo marquee, a cursor trail.
  - Refuses the template skeleton: wordmark left and links right, a label over a two-line headline at bottom left, a subline, a filled-plus-outline button pair. Here the claim is the sheet's job line, the nav is printed in the strip's rebate, and the one action is the select.
  - Refuses the baseline's world outright: smoke streamlines, the light lab ground, warning orange, the extended heavy grotesque wordmark as the hero object.
  - Four baseline faults become what this page does instead: (1) where the old readout printed "unmeasured" and "pending", this page sets only frames, marks and figures with a file behind them, names that file, and leaves out whatever has not run: no slot, no placeholder; (2) where the old flow showed scroll speed, this signature moves only on recorded evidence (captured frames, the report's lines), and scroll position only chooses which; (3) where the old hero foot was a metric row, every count rides in a sentence or a caption; (4) where Install vanished from the phone's middle chapters, Install sits in the sticky rebate in every chapter at every width.
  - Keep line carried: by the maintainer's instruction the baseline's Keep (the flow around the wordmark) is not kept as a device; its principle is. The signature acts on the page's own real content and measurements (its captures, its jury report, its DOM), and it is enacted, not decorative.
- **WORLD:** Restrained duotone, four tokens.
  - **Tokens:** a bright near-white proof paper (deliberately not cream, bone or grey); a dense silver-black ink that is also the rebate; a second ink for edge print and captions (AA on paper); one grease-pencil hue that exists only on the select (the install ticket and the rebate's Install). All other chroma comes from the frames, which are this page's own colours.
  - **Light, warm-neutral:** the scene is a laptop in daylight with long reads on docs and recipes, and a contact sheet is printed on white paper. The whiter, warmer paper and the black rebates keep it apart from the old cool lab grey.
  - **Type contract, a voice and a silence:** the voice is one sturdy, upright text serif with a large x-height and low contrast (never an italic display), from the job line at display size down to the docs body. The silence is a narrow edge-print sans, only for frame stops, capture stamps, build ids, nav and captions. The system mono appears only inside commands and code. The marker is drawn, never typeset.
  - **Material policy:** sharp and shadowless, depth by luminance only. Frames sit flush in black rebates; the one lens is the full-size view in chapter 3; no grain, glass, glow or gradient.
  - **Imagery, "the work is the imagery":** this page's own frames from `capture.mjs` (three widths × five stops per route, plus any stop the report cites) and each recipe's own frame from `verify-recipes` on /recipes, all owned (MIT). Secondary: the drawn marker language (ring, cross, arrow) in SVG at one stroke weight, logged as drawn. Refused: stock, device and terminal mock-ups, and any third-party capture (corpus and neighbour captures stay evidence).
  - **Out of the editorial-print register (paper + tracked mono labels + hairlines):**
    - (a) No tracked mono anywhere. Edge print is a narrow sans set light on the black rebate, untracked, and every label is a fact of the sheet (stop, stamp, route, build); no eyebrow sits over any heading.
    - (b) No hairline as texture. The page's only rule is the rebate band; data tables on docs and install separate rows by space, with one rule under the head.
    - (c) The paper is the contact sheet's print paper, derived rather than defaulted, and never empty of evidence: from the first viewport down, black-framed photographs of this page fill about a quarter of every desktop screen.
    - The juror's test: strip the copy and the first viewport is a column of black-framed screenshots with marker rings beside a ticket ringed in one colour, not type, labels and hairlines on cream. If X21 or L05 fires on the edge print, the exception is recorded with this reason and scoped to the rebate.
- **STORY:** Print artefact [pattern:narrative-structures#print-artefact]. The page behaves like the paperwork of its own subject: a contact sheet marked by the editor, its one black rebate unifying unlike frames.
  - **Chapters (six on home; beats in `## Page map`):** 1 The sheet, 2 The shoot, 3 The proof, 4 The marks, 5 The archive, 6 The select. Each hold carries three points at most.
  - **The interruption (chapter 3, after the first content beat):** the frame the jury wrote its memory sentence from grows out of the strip to fill the content column, scrubbed on the chapter's window. It holds while the report's scores read beside it, then returns at exit. A button opens it at full size, 1:1 (Esc closes and focus returns); a skip link ("Skip the frame") goes straight to the scores. Reduced motion: the large frame is placed, no growth. Phone: set full width inline.
  - **Two registers:** the page's own voice (plain, technical, verbs, counts inside sentences) and the report's verbatim words (chapter 3 and every mark caption, quoted and attributed with file and date). The switch sits at chapter 3's boundary.
  - **Close:** a designed footer and a conversion matched to the stakes. The select is both clients' install commands, read at build from the plugin's README, with Copy buttons and `role=status`, beside the strip's s100 frame (this close as the jury shot it). Then the footer: version, MIT, repository, the jury report named with date and disposition and linked in the repository, and credits (faces with foundries and licences, libraries with versions). The 404 ships with the first release, in the same world.
  - **Read routes:** /install opens on the commands; /docs and /recipes keep their index on screen one.
- **FIRST VIEWPORT:** Print-artefact archetype: the first screen is the sheet itself [pattern:hero-archetypes#print-artefact-with-an-acetate]. The Line's acetate, hinge and frame counter are refused.
  - **Desktop 1440 × 900, the strip:** a sticky strip fills x 0–360 for the full height.
    - Its black rebate's top 88 px prints the wordmark with the version and, on a second line, Install · Docs · Recipes · Source as edge print. Each target is ≥ 44 px tall, and Install is underlined in the grease hue.
    - Below sit this page's own desktop frames at about 300 × 188 px, 12 px of rebate between them, each edge-printed with its stop (s00, s25 …) and capture stamp.
    - The s00 frame (this screen as the jury shot it) carries a black marker ring, with the jury's memory sentence under it, credited with its report date.
  - **Desktop, the paper (x 424–1380, top-aligned with the first frame):**
    - the job line in the text serif at display size (about 96–112 px, three lines at most, few words);
    - one sentence at about 21 px naming what the plugin is (Claude Code and Codex, a written contract, the rule count read at build, captures at three widths, a juror in a fresh context);
    - the job ticket: a Claude Code row and a Codex row, each with its command(s) in mono and a Copy button, ringed once by a printed grease-pencil ellipse. That is the select and the primary action; nothing else is on the paper.
  - **What moves:** once, the black ring around s00 draws in 1.2 s on the house expo-out after fonts load and the s00 frame decodes. Nothing else animates on load.
  - **Phone 390 × 844:** a sticky 56 px rebate (wordmark and version, a "Frames" disclosure listing this route's frames, Install), then the job line at about 44 px, the sentence and the ringed ticket. Beneath them, this route's phone frames sit in a sideways row with s00 ringed: the action comes before the pictures.
  - **Tablet 834:** the desktop arrangement, with tablet frames in a strip about 22 % wide.
  - The six first-viewport tests pass; they are recorded in `.awards/concept/notes.md`.
- **SIGNATURE:** The strip follows the reader and the marker draws the jury's marks. The physical metaphor is an editor's contact sheet: proof frames in a black rebate, and a wax pencil that rings, crosses and points.
  - **Motion (desktop and tablet):**
    - The strip is `position: sticky`. Its frame column translates so the frame shot at stop k centres beside the viewport when page progress p (0–1, on the shared ticker) equals k/100.
    - Between stops the offset interpolates linearly in p and eases to its target at lerp .12. It is positional only, with no velocity term.
    - A frame is current while |p − k/100| < .125 and carries a 2 px ink outline.
    - When a cited frame first becomes current, its marks draw once: SVG stroke-dashoffset over 600 ms on the house expo-out, 120 ms stagger between marks on one frame, and the ring overshooting the frame edge by about 6 px. The caption (the report's line verbatim, with `report <date> · <section>`) follows in a 160 ms opacity step.
    - Marks never redraw in a session.
  - **What the marks come from (the newest page-round report only):**
    - Ring: the frame the Memory test names as its source, and frames cited by Keep.
    - Cross: each frame named as Before evidence in Material fixes, by a `fail` line in the Usability walk, or by a family line in the Slop scan.
    - Arrow: added when a newer `-verdict.md` marks that row resolved or partial, pointing from the cross to "resolved, verdict <date>" or "partial".
    - Rows that cite no frame are not drawn; the footer links the full report.
    - A cited stop outside 0/25/50/75/100 joins the strip at its own depth. A cited state frame (hover, focus, copy) sits half-width beside its nearest stop, labelled with its state name.
  - **Per route and per width:** each route's strip holds that route's frames at the reader's own viewport class (desktop, tablet or phone frames). On /install, /docs and /recipes the marks are already drawn when the strip arrives.
  - **Jobs:** (1) proof: this depth was captured and judged; (2) wayfinding: the strip is the progress bar and a jump rail, each frame a link to its depth through `window.__awards.scrollTo`; (3) honesty: the faults are drawn on the page's own picture, unedited.
  - **Tier:** DOM-only (img, inline SVG, one ticker). No WebGL anywhere; the concept is whole without it.
  - **Touch (phone):** the strip does not follow. Each chapter carries its own frame(s) inline at its head, and their marks draw when the chapter enters; the rebate's Frames disclosure lists every frame as a link.
  - **Keyboard:** the strip is `<nav aria-label="Frames of this page as the jury captured them">` with an `<ol>` of links (roving tabindex: arrows step, Enter jumps, Home/End go to the first or last), and the skip link passes it. Every frame's alt text says what it shows and names its stop, width and capture stamp.
  - **Reduced motion:** the reduced tier jumps to the current frame with no travel and shows marks already drawn; the static tier settles everything at load.
  - **No script:** the build writes every frame and its marks into static HTML (each chapter's figure inline), so the page reads complete.
  - **Cost and risk:**
    - About two days for the strip and marks and one for the proof build step.
    - About 15 frames per route plus 89 recipe frames as responsive AVIF/WebP at two widths, lazy except s00 and s25: roughly 0.6–1 MB across the routes.
    - The frames always show the build before the one being read, and the caption says so.
    - A frame of the page inside the page is small and recursive, so alt text and the chapter 3 full-size view carry legibility.
    - Screenshots of itself can read as navel-gazing, so the copy keeps the visitor's own site in front.
- **SCROLL MODEL:** Native + Lenis (desktop and tablet, near-native lerp; native on phones).
  - Why: the story is read in order as a document. Find-in-page, anchors and selection must work on docs and recipes, and nothing has to gate or hold.
  - The strip is a sticky element, never a pin. One progress value cut into windows (the strip, the chapter 3 growth, the close ring) makes every state reproducible from a number, so `window.__awards.scrollTo(f)` and `capture.mjs` reach any frame the jury cites.
- **LOAD & CLOSE:** No preloader.
  - **Load:** text paints first and is the LCP. The s00 and s25 frames are eager `<img>` with width and height; the rest are lazy. The one hero moment (the s00 ring) waits on `Promise.all([document.fonts.ready, s00.decode()])` with a 1.5 s ceiling, after which the ring shows drawn. A `sessionStorage` flag shows it drawn on repeat visits.
  - **Bootstrapping (what the strip shows depends only on what exists on disk):**
    - The build step is `npm run proof` (`scripts/proof.mjs` in site-next), run after every capture or jury round and before any build that ships. It writes committed files, `src/data/proof.json` and re-encoded frames under `public/proof/<stamp>/<route>/`, because `.awards/captures/` is gitignored and the deploy builds without it. `npm run build` only reads them, through the facts plugin.
    - (a) When a page-round report exists in `.awards/jury/` (`<date>.md`, `-2` …; never `-baseline.md`, never a component pass), proof.mjs takes the newest one, copies exactly the frames of the capture runs its Evidence section lists, and extracts the marks; a newer `-verdict.md` adds its arrows.
    - (b) When no page-round report exists, it takes the newest capture run of this site (`.awards/captures/*/routes.json`, every route present, 0 page errors). The strip shows those frames dated and unmarked, with no sentence about the jury. Chapter 3 still runs, on that capture's s00 frame, and its hold sets what the capture itself measured instead of scores: layout shift, blocking time and page errors from its manifest, and the build's audit summary (P0–P3, rendered checks), each naming its file and date and copied into `proof.json`, because `.awards/audit.json` is gitignored too. The first jury round therefore judges the chapter with its interruption intact, and the hold switches to the report's lines once a report exists.
    - (c) When no capture exists, the strip is not rendered and the paper takes the full width; the page is complete without it.
    - In all three states the page says only what exists.
    - A proof refresh (`npm run proof` after a capture, jury or verdict round) is this contract's own data step, never a ship fix: it changes only which existing frames, report lines and figures are shown, never layout, type, colour or motion. Ship records it in the report and captures the refreshed build for its proof pass; it does not by itself send the build back to the jury.
  - **Build id:** the page exposes its build id (version and git short hash) in `window.__awards.state().build`, so every capture manifest records which build it shot. The strip's caption reads "Frames: capture <stamp>, build <id> · Marks: report <date>" (the marks part only when a report exists), and the footer names the build being read. A reader therefore sees when the frames are of an earlier build, which after the fix batch they always are. The baseline report and the old site's frames are never shown.
  - **Close:** the last screen is chapter 6, the select. The ticket at display scale, its grease ring drawn once on entry (the accent's only motion); both clients' commands with Copy buttons and `role=status` "Copied"; the requirement line (Node 22.12+ or 24 LTS); the strip's s100 frame. Then the footer: version, MIT, repository, credits, and the jury line naming report file, date and disposition when a report exists.
  - **404:** the same sheet. Its own frames sit in the strip (it is captured like every route), its job line says no capture exists at the requested address (the path printed as edge print), and it offers three ways out: home, recipes, docs.
- **DIVERGENCE:**
  - `[site:okaydev]`. Take: show the interface as an object, never inside a device. Here the page's own frames are handled as prints in a rebate, never inside a laptop, phone or terminal frame. Refuse: the three-noun stacked headline with its last word on a black slab, the scatter of members' work around the headline, the five-accent theme-per-section set, the chunky extruded display wordmark, and the order hero → brand band → profile → feed → studios → pricing → footer.
  - `[site:siteassist]`. Take: reserve the only saturated colour for the ask; the grease hue exists only on the install select. Refuse: the hero as drawn (drone video, uppercase mono claim, ruled line, coordinate readout, logo row), the latitude/longitude pointer readout, Geist + Geist Mono as a pair, its violet, and the order benefit tabs → numbered solutions → platform → sectors → case → "Let's talk".
  - `[site:primesec]`. Take: one clock, many windows. One progress value cut into windows drives the strip, the chapter 3 growth and the close, so every state is reproducible from a number. Refuse: the mascot statue with a modern prop, the pun on the name, the headline split around a figure, the before / in / after triptych and the stat trio, near-black + bone + acid yellow, a trial-cut grotesque with its mono, and the 1480vh sticky stage.
  - **Genre craft (shared by all three):** a conversion present on every frame (here the rebate's Install) and numbers as evidence.
  - **The card a juror might still name:** `[site:siena]`, a film strip with evidence on each frame. Its film stock, sprockets, grain, amber grade, ticket ritual and speed blur are refused: here the strip is white-paper proof, the frames are this page's own, and it moves by depth only.
  - **Visual-composition principle (complete page):** density changes with the content, and the close resolves the opening. The close's s100 frame answers the opening's s00 ring, and on the phone the action comes before the pictures.
- **FINISH:** unreviewed and unshipped is unfinished — this build ends with a jury disposition and a ship report.
- **Seed:** `SEED 3zaj142iys4g` · reroll 0 · `DEALT 4 5 7 of 7` · `LEAD 4` · locked 4 (Contact sheet), the user's choice and the presenter's pick.

## Page map
| # | Chapter / route | Beat (entrance · hold · exit) | Layout | Components (recipe id: keep · change · pair) | Notes |
|---|---|---|---|---|---|
| 1 | Home · The sheet | The black ring draws once (1.2 s) around this page's own s00 frame · job line, one sentence on the plugin, the install ticket ringed as the select · the strip starts to follow the reader | | | |
| 2 | Home · The shoot | The strip brings the s25 frames alongside · the nine phases in three runs: decide (brief, concept, system), build (structure, stack, motion, webgl), judge (jury, ship), each with the file it leaves · the judge run hands on to the proof | | | |
| 3 | Home · The proof (interruption) | The frame the jury wrote its memory sentence from grows out of the strip to fill the content column (skip link; Enter opens 1:1, Esc closes; reduced motion: placed) · the report's scores (D / U / C / Co, weighted), disposition and date, the memory sentence, and the calibration line (about 0.7 below the published award, by design), unedited; before any page-round report, this capture's measured metrics and the build's audit summary instead, each naming its file and date · the frame returns to the strip | | | |
| 4 | Home · The marks | This page's newest audit result in one sentence, naming its file and date · the eight families, each a sentence with its count read from `rules.json` and one thing it catches; the slop scan and what two families cost (Creativity capped at 6); the hook that runs the audit after every edit · the slop scan's line hands on to the corpus | | | |
| 5 | Home · The archive | A proof row of recipe frames arrives as the chapter enters · site cards (count, measured skeletons, every fact labelled verified, recalled, inferred or unknown), pattern files, and recipes with their verifiers and recorded passes, all counts read at build · the row's last frame links to /recipes | | | |
| 6 | Home · The select (close) | The grease ring draws once around the ticket · both clients' commands with Copy (`role=status`), the requirement line, and the strip's s100 frame beside them · footer: version, MIT, repository, the report named with date and disposition, credits | | | |
| 7 | /install | Opens on the ticket, commands first · requirements (Node 22.12+ or 24 LTS, Playwright with Chromium), the files a project gains (`AWARDS.md`, `DESIGN.md`, `.awards/`), a local copy; the strip carries install's own frames · on to /docs | | | |
| 8 | /docs | The index on screen one · skills, the craft flow, the modes (quick, redesign, programs), jury, audit (rule tables in `<details>`), corpus, scripts · section to section, and back to the index | | | |
| 9 | /recipes | The filter (group, tag) and the entry count on screen one, with the first rows of frames · every entry, read at build, as a contact sheet of each recipe's own frame with title, group, tags and its recorded pass date where one exists · a frame opens 1:1 with its summary and source link | | | |
| 10 | /404 | The sheet with this route's own frames and the requested path in edge print · one line saying no capture exists at this address, and three ways out · home, recipes, docs | | | |

## Motion score
| Moment | Trigger | Vocabulary (ease · duration · stagger) | Reduced-motion tier | Recipe |
|---|---|---|---|---|

## Budgets & tiers
- Entry JS (gz): · GL chunk (gz): · Textures per scene: · Fonts (files / KB): · LCP target: · Tiers: high / mid / low →
- Deep modes: motion gsap|none · webgl shader|3d|shader + 3d|none — because …
- Mode: redesign from site/ (the wind-tunnel build; baseline `.awards/redesign/baseline/routes.json`, audit `.awards/redesign/baseline-audit.json`, inventory `.awards/redesign/inventory.md`)

## Jury log
<!-- appended by awards:jury — date · disposition · D/U/C/Co · dev sub-scores · top fixes; component passes are marked `component` and a redesign's first score `baseline`; neither counts as a page round -->
- 2026-10-22 · baseline · fix · D 7.5 / U 7.0 / C 8.0 / Co 7.4 → 7.44 · .awards/jury/2026-10-22-baseline.md (the old site, page mode on its pre-jury captures)

## Ship log
<!-- appended by awards:ship — date · audit summary · captures · performance numbers -->

## Exceptions
<!-- audit rule ids deliberately accepted, one per line, scoped to a path or viewport where you can: `C02 — pure black is diegetic (night-vision console)`, `C01@src/credits.html — read once over the film still` -->
