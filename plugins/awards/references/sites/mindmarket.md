# MindMarket — https://mindmarket.com/

<!-- Weakest-evidenced card in batch D. The only source is a practice clone (`fionagoi64/mindmarket`, "built for practicing web animations") that reproduced the original's `constants/` data and component names. Treat the component vocabulary, IA and copy as solid; treat everything visual — palette, type, imagery, exact motion — as unknown. Several unrelated GitHub projects share the name (fintech, AI); ignore them. -->

| Field | Value |
|---|---|
| Class | studio (B2B qualitative market-research agency and international fieldwork network) |
| Visitor mode | persuade |
| Awards | [unknown] — no reliable recollection in any gallery; Awwwards/FWA/CSSDA/Godly, dates, scores, tags: assert nothing; weak proxy: at least one deliberate animation-practice clone on GitHub [verified] |
| Studio / credits | [unknown] |
| Stack (evidence level) | ORIGINAL: Rive [inferred, high — the clone depends on `@rive-app/react-canvas ^4.28.6` and ships a `RiveAnimation.tsx` wrapper; you cannot reproduce Rive with CSS] · a React-family site with client-side routing [inferred, high] · Next.js + headless CMS for the ~22 templated landing pages [inferred, medium] · framework, CMS, host, fonts, smooth-scroll library [unknown] · CLONE only [verified, clone]: React 19 + TypeScript, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), `react-router-dom` v7, `motion` v12, `lucide-react`, `clsx`, `vite-plugin-svgr`, `vite-tsconfig-paths` — a cloner's simplification, not the original's stack |
| Palette | [unknown] — no verified hex; the clone's `styles/` was not read and a cloner's colours are unreliable anyway; state none |
| Type | [unknown]; light/dark, texture [unknown] |
| WebGL dosage | none [inferred, high — no 3D dependency anywhere in the clone; the network is plotted on a flat projection] |
| Scroll model | native scroll driving DOM transforms — sticky stacked cards, a scroll-drawn path, parallax imagery [verified components]; smooth-scroll library [unknown] |
| Narrative model | faceted world — a persuade homepage in front of a methodology × sector catalogue and a network map |

## 1. Concept and narrative
- What it is [verified, clone data]: a qualitative research agency selling *methodology* — interview formats — to corporate buyers, with global fieldwork reach as the product. Nav, verbatim from `menuItem.ts`: Services, Methodology, Industry Sectors, Network, About Us, Insights, Contact, Privacy.
- The strategic problem [inferred]: market research is invisible and unglamorous; the site must make a list of interview formats feel like craft. Hence heavy motion on plain content.
- Homepage arc [verified component order; arc inferred, high]: `HomeContent` → `CenterTitleHero` / `LeftTitleHero` → `BrandMarquees` (client-logo credibility) → `CardSection` + `AnimatedCard` (capabilities) → `StackCards` (sticky stacked sequence) → `ScrollPathSection` (a path drawn along scroll — the signature; probably the research journey or connections across the network [inferred]) → `GallerySection` (people, fieldwork) → `ReadySection` (closing "Ready to…" CTA).
- Services [verified]: two headline cards — Qualitative Research ("uncovering the behavioural why" via interviews and focus groups with cultural experts) and Behavioural Analysis (observational methods for habits and decisions) — plus seven support services: International Respondent Recruitment, Screener Design, Study/Research Design, Discussion Guide Development, Desk Research, Analysis & Reporting, Translation and Transcripts.
- Register [inferred, medium]: warm-professional; humanistic vocabulary ("cultural experts", "shop-along", "ethnographic") sold to corporate buyers.

## 2. Structure and components
- Routes [verified]: the eight nav items; Methodology with 10 child routes — Online Bulletin Boards; Focus Groups, Dyads & Triads; Taste Testing; Central Location Testing; Customer Intercept Research; Mystery Shopping; Shop-Along Research; UX Research; In-Depth Interviews; Ethnographic Research — and Industry Sectors with 12: Automotive; Technology; Sports; Gaming; FMCG; Food & Beverage; Financial Services; Beauty & Cosmetics; Crypto & Web3; Hospitality; Research for Consulting Firms; Pharmaceutical & Medical Device. Slugs like `automotive-market-research`, `crypto-market-research`, `ethnographic-research` — a programmatic-SEO matrix of ~22 templated pages [verified].
- Data files [verified]: `constants/` holds `team.ts`, `feature.ts`, `footer.ts`, `network.ts`, `route.ts`, `services.ts`, `globe.ts`, `getCategoryDetails.tsx`, `methodologyDetails.tsx`, `sectorDetails.tsx`.
- Shared kit [verified, `src/components/shared/`]: `AnimatedButton`, `CenterTitleHero`, `FeatureList`, `HoverSection`, `ImageRevealList`, `LeftTitleHero`, `MarqueeBlock`, `MediaTextBlock`, `ParallaxScrollImage`, `RiveAnimation`, `SlidesBlock`, `TextBlock`, `TextReveal`, `WavyText` — about 14 blocks composing every page.
- Feature areas [verified]: `home`, `about-us`, `categories`, `contact-us`, `insights`, `network`, `services`. Homepage-only: `AnimatedCard`, `BrandMarquees`, `CardSection`, `GallerySection`, `HomeContent`, `ReadySection`, `ScrollPathSection`, `StackCards`.
- Network [verified]: `globe.ts` stores 48 countries as `{ name, x, y }` on a flattened projection — US, Canada, Mexico, Colombia, Peru, Brazil, Argentina, Chile, Ireland, UK, Portugal, Spain, France, Switzerland, Germany, Italy, Norway, Sweden, Finland, Poland, Greece, Ukraine, Turkey, Russia, Morocco, Algeria, Egypt, Nigeria, Kenya, South Africa, Madagascar, Kazakhstan, Saudi Arabia, UAE, Iran, Pakistan, India, China, South Korea, Japan, Thailand, Vietnam, Malaysia, Singapore, Indonesia, Philippines, Australia, New Zealand.
- Contact forms [inferred, medium — a `contact-us` area exists]. Preloader, custom cursor, 404, easter eggs [unknown].

## 3. Visual language
- Palette, hexes, grounds [unknown]. Typography [unknown]. Light/dark, texture [unknown].
- Imagery [inferred, medium]: photographic — `ImageRevealList`, `ParallaxScrollImage`, `GallerySection`, `MediaTextBlock`, `SlidesBlock` are image vehicles; people, fieldwork, cities. This is the one photography-forward site in its batch; the other three are render or procedural ([site:lando-norris], [site:mont-fort], [site:animejs]).
- Layout system [verified structure]: exactly two hero variants (`CenterTitleHero`, `LeftTitleHero`) reused across ~22 templated pages — a disciplined template kit, not bespoke pages. Grid, spacing, breakpoints [unknown].
- Browser surfaces [unknown].

## 4. Motion and effects (with parameters)
- No parameters are verified for the original — no easing, duration, lerp or resolution. What follows is the vocabulary, from component names.
- Rive [inferred, high]: authored vector illustration through one `RiveAnimation` wrapper (state-machine driven [inferred]) — Rive as a second runtime alongside DOM motion, as in [site:lando-norris].
- Scroll: `StackCards` — sticky/pinned card stacking [verified component]; `ScrollPathSection` — scroll-driven SVG path drawing [verified component]; `ParallaxScrollImage` — parallax on imagery [verified component].
- Text: two separate systems [verified components] — `TextReveal` (a masked line/word reveal for headings [inferred]) and `WavyText` (a per-character wave for accents [inferred]).
- Hover: `ImageRevealList` — hovering a list row reveals its image near the pointer [verified component, inferred behaviour]; `HoverSection` — a hover-reactive section [verified component].
- Loops: `MarqueeBlock` / `BrandMarquees` — infinite logo marquee [verified component]. `AnimatedButton` [verified component].
- Network map [verified data; inferred rendering, high]: x ≈ 27.5–91, y ≈ 36–71 — percentage-style coordinates, so an SVG/DOM map with positioned pins, not a WebGL globe; staggered entrance and hover labels [inferred].
- Engine [inferred, medium]: the clone uses `motion` v12 (Framer Motion); the original may use GSAP — the vocabulary is achievable in either. Smooth scroll, page transitions, load sequence, sound, cursor [unknown]. WebGL/shaders: none [inferred, high].

## 5. Tech and pipeline
- Everything stack-level is the clone's, not confirmed as the original's [verified, clone]: React 19 + TS, Vite 8, Tailwind v4, react-router v7, motion v12, `@rive-app/react-canvas ^4.28.6`.
- Original [inferred]: Rive files (high); a React-family framework with client-side routing (high); Next.js + headless CMS because ~22 methodology × sector pages plus an Insights section need SSG/SSR and an editor (medium).
- Cost profile [inferred, high]: DOM, SVG and small Rive canvases only — the cheapest and most accessible site in its batch.
- Responsiveness [verified structure]: two hero variants + shared blocks imply reflowable content rather than fixed-comp scenes. Resize strategy, budgets, Lighthouse, asset pipeline, host, CMS [unknown].

## 6. Weaknesses
- Hover dependence [inferred]: `ImageRevealList` and `HoverSection` are hover-native patterns; without a tap-to-expand fallback and `:focus-visible` parity they vanish on touch and keyboard.
- Reduced motion, contrast, focus states, Lighthouse [unknown]. Rive canvases need `aria-label`s or hidden text; whether present [unknown].
- Marquees and wavy text are the two effects most likely to violate `prefers-reduced-motion` if left running [inferred].
- Nothing visual is verified — any card reader tempted to describe MindMarket's colours or type is guessing.
- What the awards skills do differently: reduced-motion variants for the marquee (paused, scrollable), the wave (static), the path (drawn) and the stack (flat list); keyboard-reachable list rows with the reveal on focus; the map's 48 pins as real `<button>`/`<a>` elements with labels (a DOM mirror is free when there is no canvas — keep it that way); no load gate at all on a DOM-only site; Rive loaded lazily per block, never blocking first paint; no breakpoint reloads — blocks reflow.

## 7. Principles (3–6, generalisable)
1. Apply motion to genuinely dry content: making methodology feel like craft is the hardest, most transferable design problem.
2. Show the reach, don't state it: 48 plotted countries beat the sentence "global coverage".
3. Build a block kit, not pages: ~14 named animated blocks composing 20+ pages is how programmatic-SEO pages stay award-tier.
4. Vector animation without 3D: authored Rive motion delivers art direction at a fraction of WebGL's weight and accessibility cost.
5. Split text-animation systems by role — reveal for headings, wave for accents — never both on one element.
6. The unglamorous projection wins: flat x/y pins over a WebGL globe is cheaper, more legible and more accessible.

## 8. Take / Don't take
- **Take:**
  - The block-kit architecture: 12–15 named animated blocks (hero-centre, hero-left, text, media + text, feature list, marquee, slides, image-reveal list, parallax image, stack cards, scroll path, CTA) composing every page.
  - Two hero variants only (centred, left-aligned) as the entire page-opening vocabulary.
  - The image-reveal list — with a tap-to-expand touch fallback and focus parity built in from the start.
  - Sticky stack cards: pin a container, stack N cards with increasing offset and scale, drive by scroll progress.
  - The scroll-drawn path connecting narrative beats — `stroke-dasharray`/`dashoffset` tied to scroll, or `createDrawable` from [site:animejs].
  - The flat-projection network map: `{ name, x, y }` as percentages, SVG/DOM pins, staggered entrance, hover and focus labels.
  - One `RiveAnimation` wrapper for anything that should feel hand-animated rather than tweened.
  - Two text-animation systems split by role.
  - A methodology × sector slug matrix where every long-tail page uses the same animated kit.
  - The client-logo marquee directly after the hero as the fastest B2B trust signal — paused under reduced motion.
- **Don't take:**
  - The homepage section order hero → marquee → cards → stack → path → gallery → CTA as a sequence.
  - The nav labels, the 10 methodology and 12 sector names, the services copy, the "behavioural why" line.
  - The 48-country list as a dataset, or a scroll path that draws across a world map as the signature.
  - The component names as product names (`WavyText`, `ScrollPathSection`) — rename and re-derive.
  - Any palette, typeface or imagery claim — there is nothing verified to copy, and nothing to invent.

## 9. Confidence and sources
- Identity, IA, nav, methodologies, sectors, services copy, the 48-country network, section and component inventory: [verified], high — from a clone that reproduced the original's `constants/` data essentially verbatim (slugs and copy far too business-specific to be invented by a practice project).
- Rive: [inferred], high. Framer Motion / Vite / Tailwind / React-router as the original's stack: [inferred], low-medium — clone-specific. Rendering of the map, hover behaviours, tone: [inferred], medium.
- Palette, typography, host, CMS, credits, awards, every motion parameter: [unknown] — assert nothing.
- Sources: `https://github.com/fionagoi64/mindmarket`; `https://raw.githubusercontent.com/fionagoi64/mindmarket/main/package.json`; `.../main/src/constants/menuItem.ts`; `.../main/src/constants/services.ts`; `.../main/src/constants/globe.ts`; `https://github.com/fionagoi64/mindmarket/tree/main/src/components/shared`; `.../tree/main/src/components/features`; `.../tree/main/src/components/features/home`; `.../tree/main/src/constants`. Research report: `scratchpad/research/batch-D.md`.
