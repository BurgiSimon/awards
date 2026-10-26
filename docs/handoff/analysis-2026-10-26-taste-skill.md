# awards and taste-skill, compared from the ground up, and what to change next

2026-10-26. awards 0.8.0 (`main` at `b770418`) against taste-skill v2.1.5 (`Leonxlnx/taste-skill` at `12af471`). On the taste-skill side, `SKILL.md`, all eleven reference files, the library, the scripts, the evals and the changelog were read; on the awards side, the skills, the slop scan, the jury, the handoff files and the five builds of 2026-10-22/23 (`showcase/*`, `site/`).

Paths without a prefix are in `plugins/awards/`. Paths that start with `taste:` are relative to `skills/taste-skill/` in the taste-skill repository. Paths that start with `showcase/`, `site/` or `docs/` are relative to this repository's root.

The 2026-10-06 analysis (§4) compared an older taste-skill: the dial-driven "v2 experimental", with its 60-item pre-flight list and its image-generation skills. taste-skill was rebuilt from scratch in v2.0 (2026-10-13) and extended in v2.1 (2026-10-19). The image-generation skills moved to another repository, and the classic skills became opt-in. The taste-skill column of that table is therefore out of date; this file replaces it.

## Contents

1. [The short version](#1-the-short-version)
2. [What each one is for](#2-what-each-one-is-for)
3. [Anatomy side by side](#3-anatomy-side-by-side)
4. [Where they agree](#4-where-they-agree)
5. [Where they differ, from the core outward](#5-where-they-differ-from-the-core-outward)
6. [Scorecard](#6-scorecard)
7. [What awards' own builds show](#7-what-awards-own-builds-show)
8. [Recommendations](#8-recommendations)
9. [What not to borrow](#9-what-not-to-borrow)
10. [Order of work](#10-order-of-work)
11. [Limits of this analysis](#11-limits-of-this-analysis)
12. [Sources](#12-sources)

## 1. The short version

- **Same enemy, different weapons.** Both projects exist because a model asked for a website returns the average website.
  - awards answers with a process: eleven skills, a written contract, gates and a forked jury, aimed at the Site of the Day and Developer Award ceiling.
  - taste-skill answers with an art director in a box: a library of researched directions dealt by a script, a declared house style, a real-browser inspector and a look-and-fix loop. Its aim is that any public page stops looking generated.
- **Where awards is stronger:**
  - concept discipline;
  - independent judgement (the forked jury);
  - the technical floor: accessibility, performance, reduced-motion tiers, the DOM mirror;
  - 89 browser-verified recipes;
  - WebGL and GSAP depth;
  - calibration from real award scores rather than model panels.
- **Where taste-skill is stronger:**
  - outside entropy: what is dealt comes from a library, not from the model;
  - subject specificity: a client inventory and a competitor test;
  - real imagery: a search tool over open collections and a floor of real pictures;
  - substance: fullness and full content;
  - the frame: margins, titles, blank stretches and covered text, all measured in the browser.
  - Above all, it measured itself blind against a no-skill baseline and changed course on what the jurors said. The skill lost to the baseline for four rounds before it caught up.
- **The most important finding is in awards' own output (§7).** The five builds of 2026-10-22/23 converge on one concept shape:
  - the page *is* a physical object or process (five of five), and the scroll drives that process (four of five);
  - a numeric readout prints the process's state in the margin (four of the four showcase builds);
  - the imagery is code (the four showcase builds all refused photography);
  - the ground is light and near-achromatic (four of five).

  Each concept is strong on its own. Together they are a house style one level above where the slop scan looks. A juror who had seen two of them could name the generator.
- **The six changes that matter most** (§8):
  1. Name and refuse the plugin's own rut, with a dated registry of the plugin's own tells.
  2. Add a subject inventory and a competitor test to concept and to the jury.
  3. Deal concept engines and outside stimuli, not only shuffled indices. The stimulus deck was deferred until convergence was measured; §7 measures it.
  4. Give builds a real-picture path: search open collections, rank found pictures above code when no assets exist, and measure picture share for the jury.
  5. Measure the frame and collisions under `--render`, and walk keyboard and thumb automatically. Usability is the weakest axis in the showcase: U 6.0 on two of the four first page juries.
  6. Run a blind tournament of awards, no plugin and taste-skill, because nothing else says whether any of this helps.

## 2. What each one is for

### awards

- **What it is.** A Claude Code and Codex plugin that teaches the agent to design and build sites and single components "in the league of award winners" (`README.md`). It rests on four things:
  - a corpus of 62 analysed sites (61 award references and one clone-level card);
  - 26 pattern files;
  - 89 browser-verifiable recipe entries;
  - an 89-rule audit and a forked jury that scores the way Awwwards does.
- **Its theory of quality** (`skills/craft/SKILL.md`, "What award-worthy means here"): winners make one idea do the work a feature list usually does. They have one world, one signature, an authored load and close, and a Developer Award-grade technical bar. Usability is where winners lose points, so it is the cheapest axis to beat them on. The memory test asks for an object or a behaviour, never a mood.
- **How it works.**
  - Every decision lives in `AWARDS.md`. Phases hand off by a written line: brief → concept → system → structure → stack → motion → webgl → jury → ship.
  - A build is finished only when a forked jury has given a disposition and ship has written its report.
  - The jury scores about 0.7 below the real award on purpose (`references/jury/rubric.md`), so `ship` means the build cleared a floor stricter than the award's.
- **Who it is for.** People who ask for an award-level, immersive or cinematic site. Dashboards, admin screens and plain fixes are refused.

### taste-skill

- **What it is.** One Agent Skill (`design-taste-frontend`), also packaged as a Claude Code and a Codex plugin. It "makes coding agents design websites and app screens instead of assembling the average landing page" (taste-skill `README.md`). It triggers on any public page to build, redesign or review, and also when the user says a page looks generic or AI-made.
- **Its theory of quality** (`taste:SKILL.md`, opening):
  - a model asked to invent a look picks the category default, so a script deals the look;
  - the idea comes from the subject, not from styling;
  - a house style without ornaments is checked in a real browser;
  - you look at what you made.
- **The warning the project learned in testing:** removing ornaments is half the job. A page that loses its labels, rules and cards and gains nothing in their place reads as thin, and blind jurors prefer a richer page with tells.
- **How it evolved** (254 commits since 2026-02-19):
  - an "anti-slop" skill with three dials (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`);
  - several style skills (soft, minimalist, brutalist);
  - the v2 experimental with hard bans and a pre-flight list;
  - v2.0, a new skill built from a study of 247 gallery sites;
  - v2.1: app screens, frame checks, a scroll-scene engine and a second study of 100 Awwwards Sites of the Day;
  - 2.1.1 to 2.1.3: one skill, with everything else moved out.
- **Scope.** Pages (landing, marketing, portfolio, event, restaurant) and, since v2.1, app screens: dashboards, settings and inboxes, with their own run, library and rules.

**The difference in one sentence:** awards tries to raise the ceiling by process and judgement; taste-skill tries to raise the floor with an outside art director and measured house rules.

## 3. Anatomy side by side

| | awards 0.8.0 | taste-skill 2.1.5 |
|---|---|---|
| Packaging | Plugin with 11 skills, a jury agent, 4 hooks and `userConfig` | One skill, optionally inside a plugin; no hooks, no agent |
| Instruction text | 2,413 lines of `SKILL.md`; about 4,800 lines of pattern and jury references; 7,505 lines of site cards | 543 lines of `SKILL.md`; 5,119 lines including the 11 references |
| Knowledge base | 62 cards in nine sections, with confidence labels and verified award scores; 55 composition skeletons with fingerprints; 13 hero archetypes; 13 layout families | Two studies (247 gallery sites, then 100 Sites of the Day). Library JSON: 20 directions, 58 hero blueprints, 185 section blueprints, 44 type systems of free faces, 56 palettes with proportions, 18 motions, notes on 202 sites, 19 atmosphere photo sets |
| Code to start from | 89 recipe entries (vanilla Vite, GSAP, Lenis, Three.js), each with a `verify.mjs`; a scaffold; React adapters for ten | Neutral `base.css`/`base.js`; a scroll stage (`stage.js`, sticky plus ScrollTrigger); `app.css` and `charts.js` for app screens. The scene library is announced for 2.2: `SKILL.md` already names `library/scenes.json` and `assets/scenes/demo/`, and neither exists |
| How a direction is chosen | The model writes seven worlds; `scripts/roll.mjs` deals three of seven indices with a seeded PRNG; the user locks one | `taste:scripts/draw.mjs` deals three of 20 directions fitted to sector, tone and the assets that exist, avoiding the last 24 draws (`~/.taste-skill/history.json`). Then it deals the hero, the per-section blueprints, the type, the palette, the photographs and the motion |
| Automatic checks | `scripts/audit.mjs`: 89 rules, static and rendered at 1440, 834 and 390; edit hook | `taste:scripts/lint.mjs`: 22 source patterns. `taste:scripts/inspect.mjs`: 76 finding types at 1440, 768 and 390, plus `--app` and `--film`. `taste:scripts/scenes.mjs` for scroll scenes |
| Judgement | Forked juror: captures before the contract; 4 axes plus 6 developer criteria; caps; a disposition; two page rounds plus two component passes | The builder critiques its own screenshots in 14 passes, with caps and a written format; three rounds at most |
| Browser | Playwright 1.64.1 and its Chromium, installed | An installed Chrome, Edge or Chromium, driven by its own CDP client; nothing to install |
| Durable state | `AWARDS.md`, `DESIGN.md`, `.awards/`; a state card after compaction | `.taste-skill/direction.json`, inspector folders, `assets/credits.json`; a user-level draw history |
| How it tested itself | 38 eval cases (routing, contract, jury, build), a behaviour suite, CI, one paid paired visual pilot (2026-09-22) | Five blind rounds against a no-skill baseline and another skill; blind app-screen rounds; 10 briefs in `taste:evals/evals.json`; CI for frontmatter, encoding and script syntax |
| Cost of one build | Full build measured at 129–153 turns; build cases cost about $24–32 each | Their figure: 30–45 minutes and a few hundred thousand tokens |

## 4. Where they agree

The two projects reached many of the same conclusions independently. These are probably right.

- **The enemy is the average page.** Both name the same template: hero → logos → features → testimonial → pricing → call to action. They name the same tells too:
  - eyebrows and pill badges, icon-topped card rows;
  - gradient text, violet, glass and glow;
  - bounce easing, and the same fade-up on every block;
  - "Get started", invented proof, an em dash in every sentence.
- **A script deals; the model chooses.** `roll.mjs` and `draw.mjs` are both seeded, both present three options, and both log the seed.
- **A mood is not a concept.** awards refuses "premium, immersive, bold, cinematic, clean". taste-skill says "clean and modern" is not an idea. Both put one concept ahead of any effect count.
- **The same scoring frame.** Both use the Awwwards weighting (Design 40, Usability 30, Creativity 20, Content 10), anchored scales and caps that override the arithmetic.
- **A real browser at three widths, read as pictures.** Both check contrast, sideways overflow and content stuck invisible after an entrance. Both treat reduced motion as the finished page, not a page with nothing on it.
- **Usability is where winners lose.**
  - awards: lowest axis on 27 of the 31 corpus entries since 2021.
  - taste-skill: the one line that does not rise with the others among the best sites, and "do not copy their gates, preloaders, tiny text or hidden navigation".
- **Honesty about content.** Neither invents customers, quotes or logos. awards labels synthetic material in the brief; taste-skill lists sample details in its report. Both record credits and licences, and both forbid lifting another site's assets.
- **One signature move.** The rest stays quiet. Both animate transform and opacity and refuse animated layout properties.
- **A redesign records the before** and keeps the content and what works.
- **"Use this instead" lists become the next reflex.**
  - awards learned that its alternatives table had become a second reflex list (`references/reflex-lists.md`).
  - taste-skill's registry never names a replacement font, colour or component for the same reason (`taste:references/tells.md`).

## 5. Where they differ, from the core outward

### 5.1 Where a direction comes from

This is the root difference, and most of the others follow from it.

**awards.**
- In concept Step 3 the model derives seven worlds "from the audience's culture, not from web design". In Step 4, `roll.mjs` shuffles the numbers 1–7 and deals three.
- The script never reads the worlds. It removes the presenter's bias towards the first idea written, but every option on the table is still the model's own. The deal cannot leave the model's distribution: §3 of the 2026-10-06 analysis said so, and the stimulus deck meant to fix it (A12) was deferred until convergence was measured.
- The model also writes the first viewport, the nav form and the layout of each chapter, from the world and from 13 archetypes and 13 layout families.

**taste-skill.**
- What is dealt is external. Each of the 20 directions is a researched "engine", for example:
  - the name as a monument; the page is the object; the product performs;
  - dressed as another category; colour chapters; the place carries it;
  - the specimen catalogue; type and nothing else.
- Each direction carries sectors, tones, needs, an idea, a composition with numbers, typography, colour, imagery, a "richness" line (what fills the space), pitfalls and the studied sites it came from.
- Once a direction is chosen, the script deals:
  - a hero blueprint written as geometry, for example: a photograph fills the top 58 % of the 1440 × 900 viewport, the name runs across the lower band at `clamp(120px, 19vw, 300px)` with tracking −0.05em, and a separate paragraph gives the phone version;
  - one section blueprint per role, never the same shape twice in a row;
  - a type system with its loading CSS, and a palette with proportions and field colours;
  - one signature move and a photo set.
- It prints the points where a dealt blueprint disagrees with the house rules (`adjustments()` in `draw.mjs`). It remembers recent draws across projects. A redraw needs a reason the agent can state, and the reason goes in the report.

**What this does.**
- taste-skill's pages differ in geometry, because the geometry is dealt.
- awards' pages differ in story and world, but converge wherever the model fills in. §7 shows that this now includes the concept itself.
- taste-skill's risk is the reverse: a finite library becomes recognisable after enough builds. It counters that with the history file and with the idea sentence that ties the dealt device to the client.

### 5.2 What "taste" means: derived or declared

**awards derives taste from a contract and has no house style by intent.**
- On 2026-10-06 it removed the one it had grown: the scaffold's `/ 01`, fixed easings, unconditional tracked labels.
- It decided that the award staples (a marquee, one family, cream grounds, huge display type, italic serif) are judged, never audited (`docs/handoff/decisions.md`, slop scan).
- Every tell in the slop scan has an "Earned when" column. The telemetry register in `references/patterns/copy-and-content.md` goes further: HUD readouts, coordinates, status dots, frame counters and registration crosshairs are presented as devices winners use when they are "the audience's real paperwork".

**taste-skill declares a house style "deliberately stricter than the gallery"** (`taste:references/research.md` §9):
- no eyebrows, no monospace outside code, no index numbers, no hairlines;
- no gradients, no shadows on resting elements;
- no cream with terracotta, no violet;
- headlines of two lines at most, at every width; two typefaces at most.

It is honest that three of these bans go against the data. Monospace labels, index numbering and thin rules are *more* common on its top sites than on its weak ones: 44 % against 24 %, 38 % against 21 % and 61 % against 52 %. It bans them anyway because generators copy them first. Its own registry even lists "agency micro-meta" (local time, coordinates, version stamps) as a tell, the same family awards treats as an earned register.

**The trade-off.**
- awards can reach any register, but every use is a judgement, and the judge is a model.
- taste-skill removes the judgement. It gains consistency and a floor, and accepts a narrower range. It also accepts a recognisable look of its own: big sentence-case type, flat colour fields, archival photographs, no rules. Its own registry predicts that look will become the next wave of tells.

### 5.3 The evidence each one stands on

**awards has depth and real scores.**
- 62 cards, each in nine sections, every fact labelled `[verified]`, `[recalled]`, `[inferred]` or `[unknown]`.
- Award entry pages read for axis scores; tech lenses for the deep modes; skeletons and fingerprints.
- Calibration comes from real Awwwards scores (31 entries since 2021, 7.19–8.18).
- The weakness is survivorship: every card is a winner or a nominee. The corpus can say what winners do. It cannot say which of those habits separate winners from everyone else. That is why so many slop rows end in "judge".

**taste-skill has breadth and a contrast group.**
- 247 gallery sites, then 100 Sites of the Day, measured inside the page by a probe (computed styles, text geometry, loaded fonts, what moved).
- Each site was scored by a panel of model readers. "Top" is 7.5 or more, "weak" is under 6.5.
- Because there is a weak group, it can make claims like these:
  - icon-topped feature cards appear on 1 % of top sites and 28 % of weak ones;
  - images per page have a median of 37 on top sites and 5 on weak ones;
  - a centred statement with media below is 7 % of top heroes and 24 % of weak ones;
  - thin rules separate nothing.
- The weakness: the scores are model judgements from still frames on one day, not jurors.

### 5.4 Pictures

**awards.**
- WORLD must name an imagery strategy, and "none, flat grounds" is refused (`references/patterns/imagery-and-assets.md`).
- Open collections are recommended in prose (Openverse, Wikimedia Commons, museum open-access programmes).
- `scripts/assets.mjs` logs and checks licences, but it does not search.
- The strategies offered for a build with no assets are made rather than found: a drawn line language, CSS-built objects, a type-only poster system, procedural images, generated rasters. The one exception, deliberate crops of a few photographs, assumes the build already owns or has licensed some.
- Nothing measures how much picture a page carries.

**taste-skill.**
- The imagery order is:
  1. the project's own;
  2. generated, when a tool exists;
  3. real pictures of the subject's world from open collections;
  4. drawn from the subject;
  5. the dealt atmosphere photographs, used only where an honestly generic picture fits;
  6. type alone.
- Rung 3 has a tool. `taste:scripts/assets.mjs` searches Openverse, Wikimedia Commons, the Art Institute of Chicago and the Met with commercial licences only. `--video` finds footage on Commons, the Internet Archive and NASA. `--get` downloads into the project and records the credit; `--credits` prints the footer line.
- The inspector fails a page with fewer than four real pictures; SVG drawings do not count. It warns when the page has no footage.
- `taste:references/imagery.md` §12 gives measured placement rules from the 100 Sites of the Day:
  - about a third of the page is picture;
  - a picture leads its screen at 60 % or more of it, or stays under 10 %;
  - three to five placements per page, no two neighbours alike;
  - two ratios for three quarters of the pictures;
  - square corners.
- Drawn pictures need three levels of detail: big shapes for a glance, middle shapes that describe, small details that reward a second look. The jurors called simple drawings "basic".
- **Why the floor exists:** the first v2 builds carried no real pictures at all, and in the blind rounds a page of drawings only, or of type only, looked unfinished next to one with real photographs and footage.

### 5.5 Spectacle and usability

**awards uses the award vocabulary when it is earned:**
- WebGL on a four-rung dosage ladder, and deep modes for GSAP, shaders and 3D;
- preloaders tied to a real load signal and skipped on repeat visits;
- custom cursors behind a coarse-pointer guard;
- virtual scroll with keys, gates with skips, sound opt-in.

It protects usability with reduced-motion tiers, the DOM mirror, the usability walk and the `--no-webgl` capture.

**taste-skill bans much of that outright:**
- no preloader, gate, custom cursor, wheel capture or scramble text;
- smoothing only through its own stage, and at most two held stages;
- no 3D guidance.

Its data from the 100 Sites of the Day:
- 60 of 99 open on a loading screen, and a third were still unreadable 4.5 s after load, with no gain in design marks;
- wheel-driven scenes scored 6.01 on usability against 6.50 for pages that scroll;
- custom cursors appear on 28 of 99, and 10 of those 28 have a reduced-motion rule.

It is not against motion. It fails a page where fewer than eight elements move, and asks for a choreographed entrance in every section.

**Neither stance is wrong for its target.** awards' league scores Creativity and the Animations criterion on exactly these devices. taste-skill's target is the median client. But taste-skill's numbers on what loaders and wheel capture cost are evidence awards does not have yet.

### 5.6 Who judges

**awards: the jury is the strongest piece of either project.**
- The juror is a forked agent (`context: fork`, `agent: awards-jury`).
- It reads the captures before the contract and writes its inventory and memory sentence first.
- The contract can lower a score but never raise one.
- It never edits the build, and its disposition drives the routing.
- It was calibrated against six real entries.

**taste-skill: the builder judges its own screenshots** (`taste:references/critique.md`).
- The method is good: 14 passes (one second then five, squint, cover the logo, count the left edges, the frame, sameness, the phone, fullness, substance, collisions, the competitor), caps, a fixed written format and a fix order.
- It asks the builder to "score it again as the juror who did not build it". Its blind tests used a separate judge; a user's run does not have one.

### 5.7 What the machines measure

| Measured | awards | taste-skill |
|---|---|---|
| Accessibility: landmarks, alt, heading order, canvas `aria-hidden`, focus style and ring contrast, keyboard for gestures, skip link, target size, axe-core, zoom lock | yes | keyboard and names in prose since 2.1.5; few checks |
| Motion engineering: a reduced-motion branch, no global kill, scrubbed tweens on `ease: 'none'`, no layout-property animation, loops paused | yes | partial (`reduced-hidden`, curves in lint) |
| Performance: entry JS, raster weight, glTF compression, DPR cap, dispose, CLS during load, under-resolution images | yes | no |
| Meta: title, description, Open Graph, canonical, theme colour, favicon | yes | no |
| Reflex faces; ground against the `DESIGN.md` token; nested cards; eyebrows by computed style | yes | partly (`font-not-dealt`, `micro-label`) |
| Headlines over two lines at each width; statement size | judged by decision | FAIL |
| First screen: a title that says what this is, a name-only title, a small title, several `h1`, a title readable by 1.2 s | `<title>` and one `h1` only | yes (`no-title`, `name-only-title`, `small-title`, `many-h1`, `late-title`) |
| Every text section opens with a heading | no | yes (`untitled-section`) |
| The frame: equal outer margins, lopsided desktop sections, an empty middle, blank stretches over half a screen, near-empty screens, text on the screen edge | L09 (a whole blank viewport), L10 (tablet and phone, P3), L08 | yes (`off-centre`, `lopsided`, `empty-middle`, `blank-gap`, `empty-screens`, `edge-text`, `ragged-edges`) |
| Anything on top of a headline, statement or button at any scroll position | judge | yes (`covered-text`) |
| Real pictures, footage, video posters | no | yes (`few-pictures`, `no-real-pictures`, `no-footage`, `no-poster`) |
| How much moves | no | yes (`still-page`) |
| Size count, font count, radius mix, all-centred, colour sprawl | partly (C03 hues) | yes |

**Reading the table.** awards' rules mostly serve the Developer Award: access, performance, markup. taste-skill's mostly serve a stranger's first impression: the frame, the title, the pictures, collisions.

**The showcase shows what that gap costs.** awards' juries found taste-skill's kind of failure by eye, after a round had already been spent:
- a cast shadow smearing the city name (`showcase/ekvator`);
- a cable drawn over the copy (`showcase/petrel`);
- booking wrappers covering the hero so its action ignored clicks (`showcase/extinct`);
- 460 px of empty tablet plate, and a copy button below the fold at 1366 × 768 (`showcase/awards-home`).

### 5.8 Process weight and memory

**awards** runs nine phases with entry conditions and exit artefacts. It keeps its memory in `AWARDS.md`, and its hooks cover the edit audit, the route hint, the state card after compaction and the jury reply check. It adds quick, redesign and multi-route modes. This survives long sessions and compaction, and it costs turns.

**taste-skill** is one ten-step run in one file. The sheet is reprinted and re-read before each section. The report conditions are listed because "each one was skipped in a test run that came out badly".

**Routing.** awards' biggest measured loss was that the workflow did not run: zero Skill calls in six of six builds in the 2026-09-22 pilot. The route hint has since fixed this for award-framed briefs (`--tag route` 3/3). taste-skill triggers on any public page and has no hand-offs between skills that can fail.

### 5.9 How each was tested, and what that taught

**taste-skill.**
- Protocol: six client briefs. A fresh agent built each page with no skill, with taste-skill and, on three briefs, with another design skill. The inspector photographed every build the same way, and a separate agent judged anonymous screenshots on the Awwwards weights.

  | Round | Briefs | taste-skill | No skill | Other skill | Wins |
  |---|---|---|---|---|---|
  | 1 | 4 | 6.6 | 7.7 | 6.8 | 1 of 4 |
  | 2 | 3 | 7.1 | 8.0 | | 0 of 3 |
  | 3 | 3 | 7.5 | 7.5 | | 1 of 3 |
  | 4 (unseen briefs) | 3 | 6.9 | 7.9 | 7.5 | 0 of 3 |
  | 5 | 3 | 7.7 | 7.8 | 7.2 | 2 of 3 |

- The skill passed its own inspector with zero failures while losing to no skill for four rounds. What the jurors rewarded and punished, in their own words, became the rules:
  - rewarded: an idea that belongs to this client, one live thing, full content, a dominant first screen with a real button;
  - punished: a quiet page that read as empty, three-line statements, text sliding over pictures, navigation that ate the hero.
- The project is open about the limits: one juror per brief, model jurors, and the round-5 briefs had been seen in round 4.

**awards.**
- The instruments are better: 38 cases with regex, tool and file graders, a cheap contract tier, regrade on kept workspaces, jury-leniency cases, a behaviour suite and CI.
- The outcome evidence is thinner:
  - One paired visual pilot (2026-09-22, $82.84): zero Skill calls in all six builds; a human preference of two wins and one tie; every reason field blank; a failed technical gate.
  - Routing, format and grader runs since then.
  - No blind comparison of awards against no plugin since then, and "no paid eval has run" against 0.8.0 (`docs/handoff/state.md`).

**In short:** awards has better instruments; taste-skill has more measured outcomes, and learned more from them.

### 5.10 Scope

**taste-skill** covers app screens: shells, KPIs, charts, tables, forms and their states, with 7 styles, 5 shells and 25 screen patterns in `taste:library/app.json`. A software product page builds its interface fragments as real pieces of the app, with data that adds up. It has no WebGL or 3D guidance, no multi-route work and no component route beyond "match the surrounding design".

**awards** covers components, WebGL, 3D and shaders, multi-route sites, inner pages, i18n and commerce, consent, sound and the 404. Dashboards are out of scope by design.

## 6. Scorecard

| Dimension | awards | taste-skill | Better |
|---|---|---|---|
| Concept method (thesis, ruts, memory and naming tests) | contract with "concrete when" tests | idea sentence, competitor test, one live thing | awards for structure, taste-skill for subject specificity |
| Entropy that escapes the model's defaults | seeded shuffle of the model's own worlds | dealt from an external, researched library | taste-skill |
| Composition variety | layout families, a Layout column, no adjacent repeats | dealt numeric blueprints for desktop and phone | taste-skill |
| Visual bar the model sees | skeletons and fingerprints; neighbour captures in the jury; six synthetic Alder frames | text blueprints only (the screenshots stay private) | awards, narrowly |
| Imagery | strategy line, licence log | search tool, credit pipeline, picture floor, placement rules | taste-skill |
| Substance and fullness | full-fidelity rule; the clean-and-forgettable exemplar | fullness rules, near-empty screen checks, full-content rule | taste-skill |
| Frame and first-screen readability | partly rendered | measured in detail | taste-skill |
| Accessibility, performance, markup | about 45 rules (A, P, S, M), axe-core, walk, mirror, tiers | thin | awards |
| Motion craft | recipes, deep modes, one ticker, M rules | measured curves and durations, a motion floor, a scene stage | awards for engineering, taste-skill for measured norms |
| WebGL and 3D | dosage ladder, three deep playbooks, verified GL recipes | none | awards |
| Independence of judgement | forked, evidence-first | self-critique | awards |
| Award calibration | real entry scores | model panel | awards |
| Evidence that it improves outcomes | thin | five blind rounds, mixed but real | taste-skill |
| Setup cost | Playwright and Chromium, Node 22 | an installed Chrome, Node 22, no install | taste-skill |
| Trigger reach | award-framed briefs only | any public page, and "looks AI-made" | taste-skill for reach, awards for precision |

## 7. What awards' own builds show

The five builds finished on 2026-10-22/23 are the first ones made after the house-style strip, the ceiling batch and the finish gates. They are the best evidence of where the plugin now lands. The number in brackets in the readout column counts occurrences of the word "readout" in each `AWARDS.md`.

| Build | THESIS opens | Readout in the margin | Imagery (from WORLD) | Colour strategy | Signature tier | First page jury → last |
|---|---|---|---|---|---|---|
| `showcase/awards-home` | "The page is a press proof of itself" | live register error in mm and the phase name (13) | halftones of captures generated in code; photography refused | restrained duotone, one spot yellow | DOM-only | ship 7.9 (U 7.8) → ship 8.0 |
| `showcase/ekvator` | "The page is a wall lit by another city's sun" | solar readouts in tabular figures (16) | procedural light from solar data and a line drawing; photography refused | restrained duotone, light computed | canvas-first | fix 7.3 (U 6.0) → fix 7.7 (U 7.2) |
| `showcase/extinct` | "The page is a paint cross-section under the museum's microscope" | stage readout: depth in µm, colour, year it ended (7) | procedural microscope fields; no photography | achromatic laboratory, pigments as data | canvas-first | ship 7.8 (U 7.6) |
| `showcase/petrel` | "The page is the repair cable itself" | depth, metres paid out, line tension (18) | procedural cable and SVG sections; no photography | theme by depth, one red accent | canvas-first | fix 7.26 (U 6.0) |
| `site/` | "This page is its own proof sheet" | none; the site it replaced had one, and the rebuild refused a neighbour's coordinate readout (3, all about that) | the page's own captures | restrained duotone, four tokens | DOM-only | baseline 7.44 → ship 7.88 |

**What repeats:**
- Five of five theses take the form "the page is [an object]". Two of five are self-referential (a proof of itself).
- Four of the four showcase builds carry a numeric readout as wayfinding. The plugin's previous site had one too; only its rebuild refused it.
- Four of four showcase builds refuse photography and make every picture in code. Three of them had no assets, yet each subject is one that open collections document: historic pigments, cable ships, cities.
- Four of five sit on a light, near-achromatic ground, with chroma from one accent or from the subject's own data. Three of five name the same strategy, "restrained duotone".
- In four of five the scroll drives a physical process.

**Why it happens.** Every rule behind it is sound alone; together they make a formula.
- SIGNATURE asks for one physical metaphor that does at least two jobs, and the concept skill's own example lists wayfinding as one of them (`[site:united-carriers]`). A readout is the cheapest way to make a metaphor do wayfinding.
- The memory test accepts "an object or a behaviour". "The page is the object" passes it by construction.
- The telemetry register and "numbers not adjectives" (`references/patterns/copy-and-content.md`) reward readouts.
- The no-asset strategies in `references/patterns/imagery-and-assets.md` are made rather than found, apart from crops of a few owned or licensed photographs, and one of them, "procedural images from the world's own data (tide tables, timetables, measurements)", produces readouts directly.
- Restrained duotone is the corpus's modal strategy: 21 cards in `references/patterns/color-and-material.md`. "Light grounds are the corpus majority" is stated as a counter to the dark default, so the model picks the mode.
- The THESIS refusals are mostly stock text. The template-skeleton refusal ("wordmark left with links right, a label over a two-line headline bottom left…") is the same sentence in all four showcase contracts. The Awwwards-rut refusal is the stock list in two of them; extinct and petrel adapted it to their subject ("a paint-splash or fluid blob hero", "a particle or marine snow field"), which shows it can be done. Refusals that never change do no work.

**Why it matters.**
- The slop scan looks for habits on the surface, and these builds pass it.
- The jury compares each build with its three corpus neighbours, never with the plugin's other builds, so nothing in the loop can see a pattern that repeats across builds.
- This is the same move taste-skill describes as its "third wave": the published fix for one generated look became the next generated look.
- The cost shows up in Usability. The process signatures are complex, and Usability is the axis where these builds lose: U 6.0 on two of the four first page juries, and U 5.5 on one component pass. The causes were all things a stranger notices: inert controls, focus traps, text covered at some scroll position.

## 8. Recommendations

Ordered by expected effect on the three things asked for: more creative, more stunning, less recognisably generated. For each: the change, why (from this comparison), where, how to measure it, and how it fits `docs/handoff/decisions.md`.

### Tier 1: creativity and generator-level slop

#### R1. Name and refuse the plugin's own rut

- **Change.**
  - Add a fourth rut to concept Step 1: the **plugin rut**, read from a new dated registry of the shapes this plugin's own recent builds converge on.
  - Start the registry with the devices in §7:
    - the "page is the object" thesis;
    - the scroll as the engine of a physical process;
    - a live numeric readout as wayfinding;
    - code-only imagery;
    - a light, restrained duotone with one accent;
    - and, as a sixth, the self-referential proof.
  - Each row gets an "Earned when", as the slop scan does. Petrel's tension readout is the bridge's real instrument; a readout added to make a metaphor navigable is not.
  - A contract may use at most one of these, and THESIS says which and why.
  - Refresh the registry after every dogfood or eval wave, dated as taste-skill dates its waves.
- **Also: refusals written for this subject.** THESIS names what each rut looks like for *this* client (the bakery's version of the category rut), not the stock sentence.
- **Also: the first idea.** Before the seven worlds, write down the first concept that came to mind. It is refused unless it passes the competitor test (R2).
- **In the jury:** add a "plugin house style" family to the slop scan, with judge rows for the same devices. The existing rule then applies: two families present cap Creativity at 6.
- **Why.** §7. Nothing in the current loop compares a build with the plugin's other builds. The plugin's own site shows the registry works by hand: its rebuild refused the readout its predecessor carried. taste-skill's registry shows the mechanism: every fix becomes the next look unless someone dates it and moves on.
- **Where.**
  - `skills/concept/SKILL.md` (Step 1, Step 3, Verify);
  - `references/anti-patterns.md` (a new section, or a `## This plugin's own defaults` family in the slop scan);
  - `skills/jury/SKILL.md` §2 (specificity, second direction);
  - `assets/templates/AWARDS.md` (THESIS refusal guidance).
- **Measure.** Over the next five builds on different briefs, count the builds that carry each registry device. Target: two of five or fewer per device. R11 makes the count automatic.
- **Decisions.** Judge rows, not audit rules, so "staples judged, never audited" holds. No new skill.

#### R2. A subject inventory and the competitor test

- **Change.**
  - In concept Step 1, replace the one-line *Mechanism* with an **inventory** of eight to twelve things that belong to this client and no competitor:
    - the name and what it means;
    - the address, the street and what it looks like;
    - the numbers in the brief;
    - the one constraint it lives with;
    - its materials, rituals and hours;
    - the printed things of its world;
    - its people.
  - Each of the seven worlds cites the inventory item it is built from. The audience's culture stays as a second source; at least four of the seven come from the inventory.
  - THESIS gains a "concrete when" test: put the nearest real competitor's name into the thesis sentence. If the sentence still works, the idea belongs to the category and goes back.
  - The jury gains a third direction for the specificity test: *could this page belong to the nearest competitor?* A pass for the competitor caps Creativity at 7, as in `taste:references/critique.md` §3.
  - The inventory doubles as the picture search list for R4.
- **Why.**
  - In taste-skill's blind rounds, the winning page for each brief was built from an inventory item, and the losers had good compositions with category ideas.
  - awards derives worlds from "the audience's culture", which tends towards category-level artefacts. A call sheet suits any film studio. A press proof suits any design tool.
  - awards' naming test covers the source site and the generator, but not the competitor.
- **Where.**
  - `skills/concept/SKILL.md` (Steps 1, 3 and 7, Verify);
  - `assets/templates/AWARDS.md` (an `Inventory` line under `## Brief`);
  - `skills/jury/SKILL.md` §2;
  - `references/jury/rubric.md` (caps);
  - `references/anti-patterns.md#the-specificity-test-both-directions`, which becomes three directions.
- **Measure.** In the contract tier:
  - a regex grader that the inventory has eight or more items and the THESIS cites one;
  - an llm grader that runs the competitor swap.

  A few dollars a case.
- **Decisions.** No conflict.

#### R3. Deal engines and outside stimuli, not only indices

- **Change.**
  1. **Concept engines.** Add a controlled vocabulary of about twelve engines, drawn from the corpus and cross-checked against taste-skill's nine. For example:
     - the product demonstrates itself;
     - the page is an artefact of the subject's world;
     - the name is the hero;
     - one motif from the subject drives everything;
     - dressed as another category;
     - the place carries it;
     - a fixed stage with content passing under it;
     - one section, one colour;
     - radical understatement;
     - the visitor's own input as the material;
     - the collage that resolves into an index;
     - the process performed.

     Put it in `scripts/data/engines.json`, with cards per engine. The model tags each of its seven worlds with an engine, the seven span at least four engines, and `roll.mjs --engines a,b,c,…` deals three worlds from three different engines.
  2. **The stimulus deck (A12).** About forty one-line stimuli that belong to no category, for example a seed packet, a tide table, a ferry ticket, a herbarium sheet, a weather fax, a darts scoreboard, a shipping manifest. `roll.mjs --stimulus` deals two, and worlds 6 and 7 must fuse one with an inventory item. Record it on the Seed line.
  3. **System-level deals.** At the system and structure phases, deal the colour strategy and the hero archetype from the options WORLD allows, weighted against the corpus mode and the registry in R1. Or, at the least, make system state why it took the modal strategy.
- **Why.**
  - The stimulus deck was deferred "until convergence is measured" (`docs/handoff/todo.md`). §7 now measures it: five of five "page is the object", and three of five restrained duotone plus one achromatic.
  - taste-skill's whole v2 rests on outside dealing, and its `SKILL.md` names a random direction that does not suit the subject as the most common cause of a weak page in its tests. That is why the deal here stays filtered by WORLD and tied to the subject by the idea sentence.
- **Where.**
  - `scripts/roll.mjs`;
  - `scripts/data/engines.json` and `stimuli.json` (new);
  - `skills/concept/SKILL.md` Steps 3 and 4;
  - `skills/system/SKILL.md` (colour strategy);
  - `skills/structure/SKILL.md` (archetype).
- **Measure.** `concept-deal-distinct` gains a grader: three engines among the dealt cards. Over ten seeded runs on one brief, record which engines get locked.
- **Decisions.**
  - The 2026-10-06 analysis dropped "compositions.json, a per-chapter random deal, a COMPOSITION block" because they "cut layout off from WORLD". This proposal deals only the engine, the stimulus and the WORLD-filtered strategy and archetype, never per-chapter layout, so WORLD still decides.
  - The four-option limit of the concept question is unchanged.

#### R4. A real-picture path

- **Change.**
  1. **Search.** Add `assets.mjs search "<query>" [--video] [--source …] [--min-width …]` over collections that publish per-item licences and need no key: Openverse, Wikimedia Commons, the Met, the Art Institute of Chicago, NASA images, the Library of Congress, and the Internet Archive for footage. Commercial licences only. `assets.mjs get <ref>` downloads into the project and writes the same log entry `add` writes today; `credits` already exists. Owner policy, the gallery ban and the synthetic labels stay as they are.
  2. **Ranking.** In `imagery-and-assets.md`, when no assets exist, real pictures of the subject's world from open collections come first, before the drawn and procedural strategies. WORLD must say why it chose code-only when an honest found picture exists. A found picture is never presented as the client's own product, room or person.
  3. **Measurement, not a rule.** `capture.mjs` writes into the manifest, per scroll position, the share of the viewport that is raster image, video or canvas, plus the count of distinct images and clips and the number of placements. The jury reads it beside the frames.
  4. **Finish for made imagery.** A procedural or drawn picture needs three levels of detail: a glance, a description, a reward. Petrel's jury had to ask for "a GL cable shaded as a cylinder with resolvable wires"; the rule would have asked first.
- **Why.**
  - Four of the four showcase builds were code-only.
  - taste-skill's data: images per page have a median of 37 on top sites and 5 on weak ones; pages with three or more placements average about 7.5, against 7.31 for two or fewer; footage appears on half of the top sites and on one of the 16 lowest.
  - Ten pages built with its first v2 carried no real pictures at all; the floor was added because of them.
  - The Content anchor in `references/jury/rubric.md` already asks for real photography or renders at 9–10.
- **Where.** `scripts/assets.mjs`, `references/patterns/imagery-and-assets.md`, `scripts/capture.mjs` (manifest metrics), `skills/jury/SKILL.md` §2, `skills/concept/SKILL.md` (WORLD imagery line).
- **Measure.** On a no-asset brief, count real pictures and footage per build, and compare preference in R10.
- **Decisions.** The measurement is evidence for the jury, not a P-rule, so no prohibition is added.

#### R5. Substance as a slop family

- **Change.**
  - Add the **avoidance aesthetic** as a slop family: a page with every tell removed and nothing put in their place.
  - In the jury, check full content: every section the brief names delivers all of its information at a readable size, and sample details are written at full density and listed as synthetic.
  - Add rendered measures for the jury: words per screen, near-empty screens (more than 60 % plain ground), and blank runs longer than half a viewport. L09 catches only a whole blank viewport.
- **Why.**
  - "A richer page full of template devices beat a cleaner page that was thin, every time" (`taste:references/critique.md` §1).
  - The 2026-10-06 analysis found awards' restraint rules stacking: the lowest rung, the lowest dosage, one signature, quiet chapters.
  - The concept-heavy showcase is not thin, but quick mode and persuade briefs are where thinness appears.
- **Where.** `references/anti-patterns.md`, `skills/jury/SKILL.md`, `scripts/audit.mjs` (rendered sweep).
- **Measure.** `jury-bland-clean` already holds Creativity at 6 or less. Add a thin-but-clean variant that must not reach `ship`.
- **Decisions.** No conflict.

### Tier 2: a stunning finish and the usability axis

#### R6. Frame and collision checks under `--render`

- **Change.** Add rendered rules for defects, not staples:
  - **covered text:** any painted element over an `h1`–`h3`, a statement or the primary action at any position of the existing scroll sweep;
  - **unequal outer margins** at desktop width;
  - **lopsided sections at desktop**, extending L10, which covers tablet and phone only;
  - **a text section without a heading;**
  - **the first screen states what this is:** an `h1` in the first viewport, readable within 1.2 s of load.

  Two more go into the manifest as measurements for the jury, because they are judged by decision: headline line counts per viewport, and whether the primary action falls inside the first viewport at 1366 × 768.
- **Why.**
  - These are the failures the showcase juries found by eye at the cost of a round (§5.7).
  - taste-skill measures each of them (`covered-text`, `off-centre`, `lopsided`, `untitled-section`, `late-title`).
  - Its 100-site study found that strong pages hold their margins within a few pixels, that 82 % of text sections open with a heading, and that 15 of 97 first screens never say what the thing is, and those lose usability points.
- **Where.** `scripts/audit.mjs`, `scripts/data/rules.json`, `scripts/capture.mjs`, `references/anti-patterns.md` (move the matching judge rows to rules), `evals/behavior.mjs` (fixtures).
- **Measure, for free.** Check out the showcase builds' commits from before their jury fixes and run the new rules. They should flag what the juries later found, and nothing on the fixed heads.
- **Decisions.**
  - The decision that rejected H1 line-count and CTA-in-fold rules stands: both are measurements here.
  - The rest are layout defects and readability failures, the same kind as L06–L10.

#### R7. An automated keyboard and thumb walk

- **Change.** Add `capture.mjs --walk`, also run by the component jury. It does the following:
  - tabs through every focusable element from the top, with a frame per stop;
  - checks that each stop is visible and not under a fixed bar;
  - checks that Shift+Tab and Escape leave an open menu correctly;
  - checks that each control answers Enter and Space;
  - on the phone, taps every control of the signature.

  It writes `walk.json`, which the jury reads before `references/jury/usability-walk.md`.
- **Why.** Usability is the weakest axis in the showcase, and its defects were exactly of this kind:
  - a city switch inert to clicks and Enter;
  - Shift+Tab leaving the menu open, in two builds;
  - focus landing under the fixed hour line.

  Today the walk is a model reading captures. An automatic walk gives it evidence before a round is spent. taste-skill does not have this; the comparison only points at the gap.
- **Where.** `scripts/capture.mjs`, `scripts/lib/actions.mjs`, `skills/jury/SKILL.md` §4, `references/capture-states.md`.
- **Measure.** Replay the showcase's pre-fix commits and count how many jury-found keyboard defects the walk catches.
- **Decisions.** No conflict.

#### R8. Headline arithmetic and the statement rule

- **Change.**
  - Add the budget arithmetic to `references/patterns/copy-and-content.md`: characters per line ≈ line width ÷ (font size × a width factor for the face), giving a two-line budget for each viewport.
  - Add the distinction between a headline (a title held in one glance) and a statement (a paragraph set large: about 25 words, at statement size).
  - The jury reads the measured line counts from R6.
- **Why.** In taste-skill's blind tests, a large sentence over three or more lines was read as a long headline every time. The ekvator contract itself specifies a four-line `h1` on the phone, and its jury held the build to it.
- **Where.** `references/patterns/copy-and-content.md`, `skills/structure/SKILL.md` (hero probe), `skills/jury/SKILL.md`.
- **Decisions.** Judged, not audited.

#### R9. Numeric blueprints for archetypes and families (optional, larger)

- **Change.** Give each of the 13 hero archetypes and each of the 13 layout families a desktop and phone blueprint in numbers: shares of the viewport, where the type sits, which column lines, the gap. This is what taste-skill's 58 heroes and 185 sections are. When a contract's FIRST VIEWPORT departs from its archetype's blueprint, a printed note says where, as `draw.mjs` does.
- **Why.** The model fills in what is left unspecified, and the fill is the template skeleton.
- **Where.** `references/patterns/hero-archetypes.md`, `references/patterns/layout-and-composition.md`.
- **Decisions.** This is the substance of D13 ("variants as data"), excluded as large effort. List it for the next review rather than now.

### Tier 3: measurement, which makes the rest trustworthy

#### R10. A blind tournament

- **Protocol.**
  - Three briefs: persuade with no assets, experience, and read or product.
  - Three arms:
    - no plugin;
    - awards (`craft --quick` for every brief, plus one full build);
    - taste-skill v2.1.5, pinned at `12af471`.
  - Same model, same effort and the same caps for every arm.
  - Capture every build with the same `capture.mjs` at 1440, 834 and 390, plus reduced motion, and anonymise the folders as A, B and C.
  - Judge in two ways:
    - a forked judge that sees frames only (a blind mode of the jury agent that never opens `AWARDS.md`);
    - one human pass with a reason required on every choice.
  - Also ask the judges which builds were made by the same tool.
- **Then.** Record every reason verbatim, and turn each reason that repeats into a rule, a recipe change or a registry row, as taste-skill did between its rounds.
- **Cost.** About nine builds. The measured full build cost $24–32; quick mode is unmeasured and cheaper. Estimate $100–200 for one round. It is C13, which the maintainer excluded for cost; this is the case for spending it.
- **Why.**
  - taste-skill's rounds show that a skill can pass all of its own checks while losing to no skill four times running.
  - awards' only paired pilot ran with zero Skill calls, so it never measured the workflow at all.
- **Where.** `evals/visual/`, `skills/jury/SKILL.md` (a `--blind` mode), `docs/handoff/` (the record).

#### R11. A cross-build convergence ledger

- **Change.**
  - After every finished build (showcase, dogfood, eval builds), run `scripts/skeleton.mjs` on its first viewport and close.
  - Record the fingerprint, together with the contract features, in a generated table: engine, colour strategy, imagery strategy, readout or not, signature tier, archetype.
  - Warn when a new build's first-viewport fingerprint sits within a set distance of an earlier build's.
- **Why.** It finds §7 automatically, offline, with tools the plugin already has. It also feeds R1's registry.
- **Where.** `scripts/` (a small `house-ledger.mjs`), `docs/handoff/` (the generated table).
- **Decisions.** The ledger lives in the plugin's repository, not in the user's home, so the declined `~/.awards` ledger stays declined.

#### R12. A contrast set for the corpus

- **Change.** Fingerprint thirty to fifty pages that did not win (average gallery entries, template-built launches, nominees without a prize) with the pre-pass and skeleton tooling, under owner policy, with no cards. Compute per-device prevalence in the winners against the contrast set, and annotate the slop scan's "Earned when" rows with the numbers.
- **Why.** A winners-only corpus cannot separate winning devices from common ones (§5.3). taste-skill's figures are a usable prior meanwhile: thin rules do not discriminate, tiny tracked caps do (16 % against 57 %), and icon cards strongly do.
- **Where.** `scripts/corpus-prepass.mjs`, `scripts/corpus-skeletons.mjs`, `references/sites/_fingerprints.md`, `references/anti-patterns.md`.

### Smaller borrowings

- **Motion norms.** Cite taste-skill's measured motion figures (`taste:references/motion.md` §2) in `references/patterns/motion-vocabulary.md`, as evidence beside the corpus:
  - the curves that actually ran (expo and quint out);
  - durations by job;
  - staggers of 75–120 ms between lines;
  - reveals firing at 80–95 % of the viewport;
  - scrubs locked to the scrollbar on 14 of 18 sites.

  These are facts from an MIT-licensed study; quote numbers, not prose.
- **The cost of loaders.** In `references/patterns/preloaders-and-transitions.md`, cite 60 of 99 sites behind a loader, a third unreadable at 4.5 s, and no gain in design marks. Make "no loader" the default unless LOAD & CLOSE names a real load above about a second.
- **Product pages that show their product.** For the B2B product and docs classes, add an imagery strategy: the product's own interface built in HTML with data that adds up, scaled and cropped like a photograph (`taste:references/imagery.md` §7). Add "a fake dashboard of grey bars" to the slop scan's imagery rows.
- **Controls that explain themselves.** In `skills/component/SKILL.md`: when a control seems to need a sentence on how to use it, redesign the control. A field's real limits sit beside it, tied with `aria-describedby` (taste-skill 2.1.5).
- **Never caption the sourcing.** A caption says what the picture is. The credit sits in the footer or on the credits page, never in a sentence such as "none of these shows our bar".
- **Trigger reach.** taste-skill fires when a user says a page looks generic, templated or AI-made. Adding that phrase to the `awards:jury` description (a critique) is a small change. Measure it with the smoke and `no-trigger-*` cases and the 1,536-character cap before keeping it.

## 9. What not to borrow

- **Outright bans of monospace labels, index numbering and hairlines.**
  - taste-skill's own data shows these devices are more common on top sites.
  - awards decided they are judged, never audited (`docs/handoff/decisions.md`).
  - Banning them would make awards' builds look like taste-skill's.
- **The stance against spectacle:** no preloader at all, no custom cursor, no wheel capture, no 3D. awards' league scores Creativity and the Animations criterion on those devices. Keep them earned, walked and mirrored.
- **Self-critique by the builder.** The forked jury is awards' strongest asset. A blind mode (R10) extends it; nothing should replace it.
- **A fixed library as the only source of geometry.** After enough builds it becomes a look of its own, as taste-skill's registry predicts for every "use this instead" list. Deal engines, stimuli and strategies, and keep composition derived from WORLD.
- **Atmosphere photographs from a stock pool** (taste-skill's Lorem Picsum sets). They are generic by design. awards rightly refuses "stock photography that would fit any company in the category".
- **Model-panel scores as calibration.** awards' real entry scores are better evidence. Use taste-skill's figures for prevalence, not for score targets.
- **One file for everything.** awards' skill split exists for the trigger surface and the 1,536-character cap (`docs/handoff/decisions.md`).

## 10. Order of work

| Step | Items | Effort | Proof |
|---|---|---|---|
| 1 | R11 ledger over the five builds; R1 registry, judge rows, fourth rut, refusals written for the subject | S, no model calls | the ledger reproduces §7; `lint-refs` and `check-sync` stay clean |
| 2 | R2 inventory and competitor test | S | contract-tier graders, a few dollars |
| 3 | R3 engines, stimulus deck, WORLD-filtered system deals | M | `concept-deal-distinct` with an engine grader; ten seeded runs |
| 4 | R6 frame and collision rules; R7 walk | M | replay on the showcase's pre-fix commits; `behavior.mjs` fixtures |
| 5 | R4 search, ranking, picture share; R5 substance family | M | a no-asset build with real pictures; `jury-bland-clean` variant |
| 6 | R10 blind tournament | paid, the maintainer's call | verbatim reasons, preference, the "same tool?" answer |
| 7 | R8, R12, smaller borrowings; R9 at the next review | S–M | — |

## 11. Limits of this analysis

- **§7 rests on five builds**, made by the same maintainer within two days, on briefs the maintainer wrote. It shows a direction, not a rate. R11 and R10 turn it into one.
- **All the jury scores quoted here are model judgements**, awards' and taste-skill's alike. Only the 2026-09-22 pilot had a human choose, and it recorded no reasons.
- **taste-skill's blind results are self-reported** by its author, with one juror per brief per round and model jurors. They are the best outcome evidence either project has, and they are still weak.
- **taste-skill was read, not run.** Its inspector was not executed against awards' builds, and awards' audit was not run against taste-skill's examples. Doing both would test the claims in §5.7 directly; it is cheap and needs only a browser.

## 12. Sources

**taste-skill** (`https://github.com/Leonxlnx/taste-skill` at `12af471`, MIT):
- `README.md`, `CHANGELOG.md`;
- `skills/taste-skill/SKILL.md`;
- `skills/taste-skill/references/{critique,research,tells,copy,layout,motion,imagery,type,colour,scenes,app-screens}.md`;
- `skills/taste-skill/library/*.json`;
- `skills/taste-skill/scripts/{draw,lint,inspect,assets,scenes}.mjs` and `scripts/lib/{rules,cdp}.mjs`;
- `skills/taste-skill/evals/evals.json`.

**awards:**
- `skills/{craft,concept,jury}/SKILL.md`;
- `references/anti-patterns.md`, `references/reflex-lists.md`;
- `references/patterns/{imagery-and-assets,copy-and-content,layout-and-composition,color-and-material,negative-exemplars}.md`;
- `references/jury/rubric.md`;
- `scripts/{roll,assets,fonts,capture}.mjs`, `scripts/data/rules.json`;
- `docs/handoff/{state,todo,decisions,analysis-2026-10-06}.md`, `docs/handoff/archive/visual-comparison-2026-09-22.md`;
- `showcase/{awards-home,ekvator,extinct,petrel}/AWARDS.md`, `site/AWARDS.md`.
