# AWARDS.md — award-level build contract

<!-- awards:schema 1 · written and read by the awards skills · keep the sections in this order -->

## Status
- [x] Brief captured
- [x] Direction contract locked (concept)
- [x] Visual system written (system → DESIGN.md, tokens.css)
- [x] Page map and skeleton built (structure)
- [x] Stack booted (stack)
- [ ] Motion score authored and built (motion)
- [ ] WebGL layer built or explicitly declined (webgl)
- [ ] Jury disposition: —
- [ ] Shipped (ship)

## Brief
- **Subject:** `awards`, a Claude Code and Codex plugin (v0.4.0, MIT, BurgiSimon) that designs, builds, audits and judges websites against a corpus of analysed award winners. This site is its public page, self-hosted as static files.
- **Unique mechanism (what only this subject can prove):** a site is tested before anyone sees it: 72 audit rules in 8 families, headless captures, and a forked jury that scores Design 40 · Usability 30 · Creativity 20 · Content 10 and ends in `ship`, `fix`, `rebuild` or `recapture`. This page is built and judged by that same loop.
- **Audience and their real scene:** developers and design engineers who already run Claude Code or Codex; they arrive from a repo link or a post, on a laptop with a terminal open beside the browser, with about thirty seconds before deciding to install or close the tab.
- **Stakes and conversion (what a visitor should do, matched to the price of the decision):** free, two commands, reversible: copy the install commands (Claude Code and Codex) and paste them. Secondary: read the docs.
- **Assets on hand:** none. Copy is authored from the plugin's own files; every count (skills, recipes, rules, site cards) is read from the repository at build time. The flow visuals are authored for the build (synthetic). No screenshots of third-party sites.
- **Binding constraints:** static Vite multi-page build, relative `base`, self-hosted on any static server; WCAG 2.2 AA; no analytics, no external requests at runtime; no invented awards, testimonials or logos.
- **Routes:** 4 — home, install, docs, 404.
- **Sound:** none.
- **Visitor mode:** persuade (install is the conversion); docs route is read.
- **Calibration:** can win on Creativity (the signature is the product's claim acted out); most likely to lose on Usability if the flow competes with the install action; the usability walk checks first that the install commands are reachable and copyable by keyboard from screen one.

## Direction contract
- **THESIS:** a design goes into the wind tunnel before it ships. Smoke streamlines flow across the page and split around its real text; what the page measures, the flow shows. Refuses the docs/OSS rut (sidebar, code blocks, hero built from an install command) and the Awwwards rut (near-black ground, neon glow, blob or particle hero, fade-and-rise sections).
- **WORLD:** a test laboratory in daylight. Committed accent: one warning orange (the colour of test tags and tunnel markings) on a light, slightly cool lab ground with graphite ink; three to four tokens. Light because the scene is a lit rig and a working desk, not a stage. Type contract: engineering display (a condensed or technical grotesque) + a readable text face + mono for instrument labels, labels as texture only on gauges. Material policy: flat and shadowless; the only "material" is the flow itself, drawn as hairlines, never dots, glow or gradients.
- **STORY:** Specification told as one test run (`[pattern:narrative-structures#specification]`). Chapters: 1 Tunnel — entrance: flow reaches the name · hold: one-sentence claim + install · exit: airspeed rises. 2 The run — entrance: nine stations appear on the tunnel's centreline · hold: the craft phases, each with the artefact it leaves (AWARDS.md, DESIGN.md, captures, jury report, ship report) · exit: the last station hands to the gauges. 3 Interruption — the readout: one full-viewport weighted bar (40 / 30 / 20 / 10) carrying this page's own jury scores and disposition, verbatim. 4 Instruments — the audit as a gauge panel: 8 rule families with counts, the slop scan in three sentences with numbers. 5 Corpus — 50 site cards, 15 pattern files, 60 recipe entries verified in headless Chromium, as an index row list linking to docs. Close — the install plate in laminar flow, two copyable commands, designed footer. Register: instrument-label telemetry for labels, plain declarative for claims; switched only at chapter boundaries.
- **FIRST VIEWPORT:** light ground; the wordmark `awards` at display scale (12 vw, wide heavy cut, about half the width on desktop and most of it on a phone) left of centre, hairline streamlines entering from the left edge and bending around its glyphs; below-right, one sentence and the primary action "Install the plugin" (a real link to the install plate/route) with "Read the docs" beside it; a mono readout strip at the bottom edge: airspeed (live scroll velocity), 11 skills · 72 rules · 60 recipes. The flow arrives once in ≤ 1.2 s after fonts are ready; nothing else moves.
- **SIGNATURE:** streamlines that treat the DOM's own layout as the obstacle. Jobs: (1) the product's argument — measure the real page, not a picture of it; (2) the scroll speedometer — airspeed follows scroll velocity, fast scrolling separates the flow into a wake behind the letters, stopping settles it laminar; (3) the bookend — the same flow runs calm across the install plate at the close. Technique tier: moments (one lazy WebGL module used for hero and close; an obstacle field rasterised from the DOM text). Touch: scroll drives airspeed, a drag across the hero probes the flow. Keyboard: nothing needs operating; a visible "Airflow: on/off" control pauses it and states its value. Reduced motion: reduced = one settled frame redrawn only on resize; static = same frame, no transitions. Fallback: no GL or low tier → the same integrator draws one frozen frame to a 2D canvas; the DOM carries every word.
- **SCROLL MODEL:** native + Lenis on the GSAP ticker; the story is a document to read and search (find-in-page, deep links to docs anchors), and the flow needs a scroll velocity, not a gate.
- **LOAD & CLOSE:** no preloader; the real signal is `document.fonts.ready` plus the GL chunk resolving, after which the flow arrives once; text is visible from first paint; repeat visits identical (nothing to skip). Close: the install plate with both command pairs and copy buttons, calm flow, then a footer with version, licence, repository and a link to this page's own jury and ship reports. 404: "Flow separated" — the lines detach from a missing page, with a way home and to the docs.
- **DIVERGENCE:**
  - `[site:animejs]` — take: make the product's architecture the object on screen, and a number on screen is a claim you can check. Refuse: the exploded-machine choreography, the instrument-dial hero, its hue ramp and mono-for-every-label look.
  - `[site:grids-obys]` — take: make the subject the interface; the method runs over the page itself. Refuse: the grey paper ground and pure black ink, the construction-overlay toggle as a device, the book-spine bibliography and its part order.
  - `[site:shopify-editions-w26]` — take: keep the scroll native and the reading layer real DOM, and design the degradation (a named still for the scene). Refuse: the painted-room world, the numbered rail composition, its palette and type trio.
- **FINISH:** unreviewed and unshipped is unfinished — this build ends with a jury disposition and a ship report.
- **Seed:** SEED biac7chvngbj (reroll 1) — dealt 5 6 7, locked 7

## Page map
| # | Chapter / route | Beat (entrance · hold · exit) | Components (recipe ids) | Notes |
|---|---|---|---|---|
| 1 | Home · Tunnel | flow reaches the name · claim + install · airspeed rises | custom `flow` (SIGNATURE, GL moment 1), readout strip, `reduced-motion-switch` (airflow button), `split-text-masked-reveal` | Archetype: wordmark as obstacle (generative line field, GL). Left stack: wordmark 12 vw, claim, lede, actions; right half open for the flow. Phone: same stack, flow at phone aspect behind the wordmark. A11y: canvas aria-hidden, airflow `aria-pressed` button, airspeed `<output>` not live. Still: one settled flow frame. Register: declarative. |
| 2 | Home · The run | nine stations appear · phases and their artefacts · hand to the gauges | `split-text-masked-reveal` (h2), custom station list (`<ol>`) | The sequence is real, so the list numbers mean something. Phone: one column per station. Still: final layout. |
| 3 | Home · Readout (interruption) | weighted bar fills · this page's own jury scores · cut to the instruments | `theme-swap-tokens` (section theme `readout`), custom weight bars | INTERRUPTION: register switches to the instrument panel on an ink ground. Scores come from `jury.json`, copied verbatim from the jury report. Table semantics kept. Still: bars at full width. |
| 4 | Home · Instruments | gauge panel lands · 8 rule families, slop scan · hand to the corpus | custom families table | Numbers read from `rules.json` at build time. Phone: description column narrows, no content dropped. Register: numeric. |
| 5 | Home · Corpus | index rows arrive · cards, patterns, recipes · link to docs | custom rows | Rule of three. Counts read from the plugin at build time. Numbers inside rows, not a metric band. |
| 6 | Home · Close | flow turns laminar · install plate + footer · end | custom `flow` (GL moment 2, calm), copy buttons, designed footer | Conversion: copy two commands. Copy buttons are enhancement; commands stay selectable text. `role=status` announces copy. |
| 7 | /install | commands first · Claude Code, Codex, requirements, first prompt · back home or docs | copy buttons, spec `<dl>` | Read mode. No scene. |
| 8 | /docs | index on screen one · skills, jury, audit, recipes, scripts · install | sticky index `<nav>`, `<details>` rule families, recipe rows | Read mode, index on screen one; everything generated from the plugin at build time. Phone: index inline at top. |
| 9 | /404 | lines detach · "Flow separated", ways out · home | static SVG echo of the flow | Three routes out, links first; `<base>` set from `SITE_ROOT` so assets resolve at any depth. |

Notes: responsive strategy is a fluid clamp scale on a 1728 artboard, single column under 768 px, graceful degrade (the phone keeps every heading, number and command). Static checkpoint 2026-09-24: `.awards/captures/20260924-161247-static2/manifest.json` (desktop) and `.awards/captures/20260924-161202-static/manifest.json` (desktop + mobile). Found and fixed: derived tokens resolved at `:root`, so the readout theme inherited the light muted colour; claim competed with the wordmark. Checked against visual-composition: one dominant object per viewport, open field on the right reserved for the flow.

## Motion score
| Moment | Trigger | Vocabulary (ease · duration · stagger) | Reduced-motion tier | Recipe |
|---|---|---|---|---|
| Load | no preloader; `awards.ready()` after `document.fonts.ready`; the GL chunk loads after ready and never gates text | — | same | `boot-lenis-gsap` |
| Hero entrance (the one hero-scale moment) | fonts ready + flow mounted | streamlines grow in from the left edge · expo-out · 1.2 s · once | reduced: settled frame drawn at once; static: same | custom `flow` |
| Hero claim | fonts ready | masked line reveal · expo-out · 0.9 s · stagger .08 | reduced: opacity .3 s; static: none | `split-text-masked-reveal` |
| SIGNATURE: airflow | always while the tunnel is on screen | airspeed = damped Lenis velocity (k ≈ 6), turbulence behind the letters scales with it; pointer is a probe the lines bend around (fine pointer); streak pulses travel along lines at airspeed | reduced: one settled frame, no probe, no pulses; static: same; `Airflow off` button freezes it for everyone | custom `flow` |
| Chapter headings (run, instruments, corpus, install) | `top 80%`, once | masked line reveal · expo-out · 0.9 s · stagger .08 | reduced: opacity .3 s; static: none | `split-text-masked-reveal` |
| Readout (interruption) | section enters | the section is a cut to the ink theme (no tween); weight bars scrub 0 → weight · `ease: 'none'` · scrub .5 | reduced + static: bars at full weight | `theme-swap-tokens` (section theme), custom |
| Close | install plate enters | flow mounts calm (low airspeed, no wake) around the heading and the command plates | reduced: settled frame | custom `flow` |
| Hover | pointer / focus | button accent bar scaleX · expo-out · 400 ms; copy button border 160 ms | same (feedback kept) | — |
| Routes | same-origin navigation | cross-document view transition, root cross-fade 400 ms | none | `page-transitions` (native variant) |
| Budget | — | ≤ 10 tweens, 1 ticker (GSAP) drives Lenis, ScrollTrigger and the flow; flow pauses off-screen, on hidden tabs and when Airflow is off; no CSS infinite loops | — | — |

## Budgets & tiers
- Stack: Vite 8 vanilla MPA (4 HTML entries), GSAP 3.15 + Lenis 1.3.26 on the GSAP ticker, three 0.186 in a lazy chunk; build-time facts plugin; no CMS. Scroll model: native + Lenis. Resize: the flow rebuilds its obstacle field on resize, never a reload. Transitions: native cross-document view transitions (`@view-transition`), none under reduced motion.
- Entry JS (gz): ≤ 60 KB (GSAP + Lenis + boot) · GL chunk (gz): ≤ 160 KB (three core + flow, lazy) · Textures per scene: 0 (obstacle field rasterised at runtime from DOM text, ≤ 256 × 256) · Fonts (files / KB): 2 / 112 KB · LCP target: ≤ 2.5 s from the DOM wordmark · Tiers: high → full flow (≈ 160 lines, DPR ≤ 2) / mid → ≈ 90 lines, DPR ≤ 1.5 / low or no GL → one frozen frame drawn to canvas 2D; reduced motion → settled frame, static → same frame, no transitions.

## Jury log
<!-- appended by awards:jury — date · disposition · D/U/C/Co · dev sub-scores · top fixes -->

## Ship log
<!-- appended by awards:ship — date · audit summary · captures · performance numbers -->

## Exceptions
<!-- audit rule ids deliberately accepted, one per line: `C02 — pure black is diegetic (night-vision console)` -->
