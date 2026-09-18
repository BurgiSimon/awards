# Lama Lama — https://lamalama.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

<!-- Provenance: lamalama.com and awwwards.com were unreachable during research. Every award, score, hex and typeface below was read through search-result extraction of the named page, so it is labelled [recalled …] at the report's own confidence, never [verified]. Only the agency's GitHub organisations were fetched directly. This is the thinnest card in batch C; components and motion are the first gap to re-research. -->

| Field | Value |
|---|---|
| Class | studio — self-promotional site of an Amsterdam creative digital agency (web design, web development, art direction) [recalled medium-high — Awwwards / Lapa Ninja via search]; also the top of the funnel for a product sub-brand, `growsuite.lamalama.com` (search and AI-visibility services) [recalled medium] |
| Visitor mode | persuade |
| Awards | Awwwards Site of the Month, July 2026 [recalled medium — date via search extraction] · Developer Award, developer score 7.30 from jury votes 7 · 8 · 7 · 7 · 7 · 8 [recalled medium — the six votes average 7.33, so the published figure is rounded or weighted] · Portfolio Honors, June 2026 [recalled medium] · overall 7.51 — Design 7.64 · Usability 7.36 · Creativity 7.52 · Content 7.39 [recalled medium-high — the 40/30/20/10 weighting reproduces 7.51 exactly] · agency-level: Awwwards Annual Awards 2024 agency nominee; recognised by FWA and the Webby Awards [recalled medium] · an older Awwwards slug `lama-lama-2` implies an earlier iteration of the agency site was also awarded [recalled low] · client work: treebytree was an Awwwards SOTD [recalled medium] · galleries: Lapa Ninja, Land-book (30747), landing.love, purelanding.page, Muzli, Agencies of Anywhere [recalled medium] |
| Studio / credits | In-house — concept/strategy, digital design and creative development all credited to Lama Lama on its own channels [recalled low]; one named person, Jort Boot, via LinkedIn [recalled low]; per-role credits for the site [unknown] |
| Stack (evidence level) | framework: none named — Awwwards tags WebGL, GSAP, JavaScript [recalled medium-high] · CMS: [unknown] for this site; the agency's GitHub orgs `lamalamaNL` / `lamalamanl` publish a Statamic control-panel search driver on Laravel Scout + Meilisearch (PHP, GPL-3.0) and a fork of the Laravel-ecosystem macOS dotfiles, so Statamic/Laravel is their CMS practice [verified — github.com/lamalamaNL] · animation: GSAP [recalled medium-high — Awwwards tag] · 3D: WebGL, library [unknown] · hosting/CDN: [unknown] · fonts: Suisse BP Int'l, licensed and self-hosted (Swiss Typefaces, not a Google font) [recalled medium — Lapa Ninja typeface field] |
| Palette | #F9F4EB warm bone + #1A1C1C warm near-black [recalled medium-high — Awwwards extraction]; strategy: two-value ground + ink, with full-bleed near-black sections or an inverted hero — Lapa Ninja files the site under "black" and tags "dark colors" [recalled medium]; no accent hue evidenced [unknown] |
| Type | one characterful grotesque at display scale — Suisse BP Int'l, tagged "big type" [recalled medium — Lapa Ninja]; no serif pairing evidenced [inferred] |
| WebGL dosage | moments [inferred — WebGL is tagged and a Developer Award was given, but no specific effect is documented; could be canvas-first] |
| Scroll model | [unknown]; native scroll with GSAP-driven entrances is the genre default [inferred] |
| Narrative model | gallery — a video hero, then the work as a run of poster-scale case blocks, then studio/people, then contact [recalled low-medium — gallery editorial copy, not the page itself] |

## 1. Concept and narrative
- **The one idea:** an agency that sells wonder rather than process. Gallery editorial describes a playful approach that puts visitors in a childhood mindset, "pure and full of wonder" [recalled low-medium — Lapa Ninja / Land-book copy]. The emotional thesis, not a feature list, is what the page argues.
- **Beats (as far as the sources show them):** (1) a full-bleed video hero with a dark, bold personality — energy is established before any reading happens; (2) case studies that "roll in with festival-poster confidence" [recalled low-medium — gallery copy]: the work index is a run of announcements, not a thumbnail grid; (3) the studio and its people at `/about-us/`; (4) contact. Case detail lives at `/cases/<slug>/`, e.g. `/cases/home-agency/` [recalled medium — URLs surfaced in search].
- **Tone and copy register:** value-led and warm — the positioning line promises solutions for "companies with a conscience and brands with a heart" [recalled medium-high] — set against a loud, high-contrast visual register. The soft-values / hard-craft contrast is the personality.
- **Studio context:** The Brand Identity covered Lama Lama's modular identity system for the client "Home" ("Sum of parts") [recalled medium]; a studio that thinks in stackable systems, which is consistent with a case-card system that recombines.

## 2. Structure and components
- **Routes:** `/` · `/about-us/` · `/cases/<slug>/` · product sub-brand on its own subdomain rather than in the nav [recalled medium].
- **Inventory corroborated by gallery descriptions [recalled low]:** full-bleed video hero; poster-scale case blocks that animate in on scroll; an about page built on people photography; per-case detail pages.
- **Preloader, nav/menu pattern, cursor, footer, 404, easter eggs:** [unknown]. Treat any reconstruction of these as [inferred].

## 3. Visual language
- **Palette roles:** bone ground, near-black ink; near-black full-bleed sections as tempo changes rather than a permanently dark site [recalled medium]. Both values are warm-shifted — no pure #000 or #FFF — which is a batch-wide trait shared with [site:floema], [site:oryzo] and [site:shopify-editions-w26].
- **Type:** one Swiss neo-grotesque with slightly quirky terminals, set oversized; the same family [site:floema] used five years earlier [recalled medium]. A licensed grotesque with character, not Inter and not a Google font, is the recurring tell across the batch.
- **Imagery and materials:** photography of people and hero video are the styling tags [recalled medium — Lapa Ninja]; no 3D renders or illustration evidenced. Human-led art direction — faces, on-set footage.
- **Layout:** editorial, big-type-first, poster-like case blocks each owning a viewport [recalled low-medium].
- **Browser surfaces:** [unknown].

## 4. Motion and effects (with parameters)
- **Known:** GSAP and WebGL are the tagged technologies [recalled medium-high — Awwwards]; the Developer Award (7.30) means the jury rated the build itself, so the WebGL is non-trivial and custom [recalled medium].
- **Case entrances:** the blocks are described as arriving with mass — scale or clip rather than a fade [inferred from the "festival-poster" description; the mechanism is undocumented].
- **Smooth-scroll approach, page transitions, text splitting, pointer effects, shaders, sound, load sequence:** [unknown]. No easing, duration or lerp value for this site survives in any source; the batch-C shared vocabulary (expo-family easing, 1.2–1.5 s hero moments, staggered masked reveals) is the best prior [inferred].

## 5. Tech and pipeline
- **Stack:** WebGL + GSAP + vanilla JavaScript on the front end [recalled medium-high]; a Statamic/Laravel CMS behind it is the agency's documented practice, commonly run headless in front of Nuxt/Next/Astro [verified for the practice — GitHub; unknown for this site].
- **Assets:** a video hero implies a poster frame plus streamed MP4/WebM [inferred]; self-hosted woff2 for Suisse BP Int'l [recalled medium].
- **Budgets, performance strategy, resize strategy:** [unknown].

## 6. Weaknesses
- **Usability is the lowest axis (7.36 of 7.64 / 7.36 / 7.52 / 7.39)** [recalled medium-high]; on a dark, video-led, motion-heavy agency site this typically reflects a heavy first load and unconventional navigation [inferred]. Creativity outruns usability here as on every scored site in the batch — a conscious trade, not an accident.
- **No reduced-motion or accessibility evidence found** [unknown]; the site could not be loaded, so keyboard reach, DOM content behind any GL and load gating are unverified.
- **Research gap:** components and motion are undocumented; the report names this as the first re-run.
- **What the awards skills do differently:** `/awards:motion` writes the three reduced-motion tiers (full / reduced / static) — the hero video parks on its poster under `prefers-reduced-motion` and poster-block entrances drop to opacity-only; `/awards:structure` keeps every case block a real `<a>` inside a list with `focus-visible`, so the poster run is a keyboard walk; `/awards:webgl` puts any GL over a DOM mirror (`aria-hidden` canvas, real headings and images underneath); `/awards:ship` enforces the load gates — LCP ≤ 2.5 s from a poster image, video `preload="metadata"` streamed after first paint, CLS ≈ 0 with no preloader shift, entry JS ≤ 200 KB gz. Under `/awards:jury` this score card passes the threshold (weighted ≥ 7.2, no axis < 6.8) but usability is the named fix axis.

## 7. Principles (3–6, generalisable)
1. **One register, held everywhere.** Two values, one face, one image genre — winning agency sites subtract; the constraint is the brand.
2. **Work as posters, not a grid.** Give each piece a full-viewport, typographically dominant announcement moment; the index becomes a sequence with tempo.
3. **The build is the argument.** For a studio, motion and engineering quality are the product being sold; a developer award is a sales document.
4. **Warm values, loud craft.** Write the copy in one register and design in the opposite one; the tension reads as personality.
5. **Motion before reading.** Let a moving image set the energy in the first second; type arrives second.

## 8. Take / Don't take
- **Take:**
  - The brand-lock trio decided before the page map: one warm-shifted ground + one warm-shifted ink, one licensed grotesque, one image genre (DESIGN.md colour strategy "committed"; type contract "one characterful family at display scale").
  - A case index as a vertical run of poster-scale blocks, each owning ~100 vh, entering with mass — scale from ~0.94 or a clip-path wipe, `--ease-out-expo`, 1.2–1.5 s as a hero moment, label and title staggered 0.06–0.1. These are the plugin's defaults, not the site's numbers, which are unknown.
  - The video hero as an energy source with a real load contract: poster frame as LCP, muted autoplay, stream after first paint, poster under reduced motion.
  - The agency IA: home → work-as-posters → studio/people → contact, case detail at `/cases/<slug>`, a product sub-brand on a subdomain instead of a nav item.
  - Content model first (any headless CMS — Statamic/Laravel is one production-realistic choice), custom GSAP/WebGL layer second.
  - The register contrast: soft, ethical copy against high-contrast, high-energy visuals — as a deliberate concept decision.
- **Don't take:**
  - #F9F4EB / #1A1C1C or Suisse BP Int'l as "the award look" — the batch already carries that pair and that face; choose your own warm neutrals and a different licensed grotesque.
  - The section order video hero → poster run → about → contact as-is, or `/cases/` naming as a signature.
  - The positioning line ("companies with a conscience…") or the childhood-wonder framing.
  - Their people photography, hero footage, or the festival-poster styling as a skin on a subject that does not justify posters.

## 9. Confidence and sources
- **Per section:** table — awards/scores medium-high (dates medium), palette/type medium, stack medium for the agency and low for this site; §1 low-medium; §2 low; §3 medium; §4 low; §5 medium (agency) / low (site); §6 medium for the score, low for causes; §7–8 are principles derived from the labelled facts.
- **Sources used:** https://www.awwwards.com/lamalama/ · https://www.awwwards.com/sites/lama-lama · https://www.awwwards.com/sites/lama-lama-2 · https://www.awwwards.com/inspiration/lama-lama-amsterdam-based-creative-digital-agency-1 · https://annuals.awwwards.com/agency-nominees/lamalama · https://www.lapa.ninja/post/lama-lama/ · https://www.lapa.ninja/post/lamalama/ · https://land-book.com/websites/30747-lama-lama-amsterdam-based-creative-digital-agency · https://www.landing.love/sites/lamalama-2/ · https://the-brandidentity.com/project/sum-of-parts-lama-lamas-modular-identity-for-home-is-stacked-with-the-creative-agencys-potential · https://github.com/lamalamaNL · https://github.com/lamalamanl · https://lamalama.com/ · https://lamalama.com/about-us/ · https://lamalama.com/cases/home-agency/ · https://growsuite.lamalama.com/ · https://www.linkedin.com/company/lama-lama · https://www.linkedin.com/in/jort-boot-862723a/
- **Access note:** awwwards.com, the galleries and lamalama.com itself were read through search-result extraction only; GitHub was fetched directly.
