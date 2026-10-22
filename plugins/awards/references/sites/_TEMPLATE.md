# <Site name> — <url>

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | portfolio / studio / campaign / brand / docs / e-commerce / B2B product / B2B service, first, then a dash and what it sells |
| Industry | one id from `scripts/data/corpus-vocab.json` (creative-practice, agency-studio, film-music, …) |
| Visitor mode | persuade / experience / read |
| Awards | awards, dates, scores D/U/C/Co, developer sub-scores — labelled |
| Corpus rating | D x.x / U x.x / C x.x / Co x.x → weighted x.xx, YYYY-MM-DD [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | — labelled |
| Stack (evidence level) | framework · CMS · animation · 3D · other · hosting · fonts |
| Palette | hexes with labels; strategy (ground + ink + accent / theme-per-section / …) |
| Type | contract and faces, with labels |
| WebGL dosage | none / moments / canvas-first / 100 % canvas |
| Scroll model | native + smooth library / sticky stages + rails / virtual float / section switcher / none |
| Narrative model | chaptered journey / faceted world / manifesto with gates / single-object launch / collage → index / gallery / print artefact / specification |
| Routes read | the routes this card analysed, by kind: `home`, then any of `case /work/x`, `product /p/x`, `article /journal/x`, `pricing /pricing`, `about`, `contact`, `index /work` (omit when only the URL on the first line was read) |
| Palette strategy | one line for the index: the strategy, at most two hexes |
| Type contract | one line for the index: the contract and the faces |
| Awards / score | one line for the index, e.g. `SOTD 14 Sep 2026, 7.69 + Dev 7.47` |
| Confidence | high / medium / low (what backs it), or clone-level |
| Last verified | YYYY-MM-DD of the live pass |

## 1. Concept and narrative
The one idea, how the page unfolds (beats), the tone and the copy register.

## 2. Structure and components
Routes, sections in order, the component inventory (preloader, nav, cursor, galleries, rails, footer, 404, easter eggs) with what each does.

## 3. Visual language
Palette roles and grounds, type scale and tricks, imagery and materials, layout system, browser surfaces.

## 4. Motion and effects (with parameters)
Smooth-scroll approach, scroll choreography, transitions, text animation, pointer effects, WebGL/3D/shaders, sound, load sequence — with the numbers that are known (easings, durations, lerps, resolutions).

## 5. Tech and pipeline
Stack with evidence, asset pipeline, budgets, performance strategy, resize strategy.
Corpus lens waves only: close this section with `### Tech lens: GSAP|WebGL|3D`, at most 50 lines each, every fact labelled.

## 6. Weaknesses
What the jury docked or what the sources show missing (usability, reduced motion, keyboard, empty DOM, load gates) — and what the awards skills do differently.

## 7. Principles (3–6, generalisable)
Stated so they apply to any subject.

## 8. Take / Don't take
- **Take:** the transferable moves (parameters, structures, decisions); at least one compositional, typographic or structural, not only technique.
- **Don't take:** the literal moves that would make new work a copy (section order, copy lines, palette hexes, assets, the signature as-is).

## 9. Confidence and sources
Per-section confidence; the sources actually used.
