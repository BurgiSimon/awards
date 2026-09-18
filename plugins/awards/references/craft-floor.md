# Craft floor

Load this before any UI edit in an awards project. It is the floor, not the ceiling: everything here is what a Developer-Award jury checks in the first minute and what the deterministic audit (`scripts/audit.mjs`) can measure. Rule ids in brackets are the audit's; a finding either gets fixed or gets a reason under `AWARDS.md ## Exceptions`.

Why a floor exists: every Site of the Day in the corpus also carries a published developer score, and usability is the lowest of the four axes on nineteen of the twenty verified entries [verified, twenty Awwwards entries read 2026-09-18]. The floor is where new work beats the reference set without borrowing anything from it.

## Verify before you call anything done

**Type**
- One type contract, held everywhere: expressive display + neutral grotesque, or one characterful face at display scale. No reflex face as the first family [T01]; no Google Fonts CDN link, fonts self-hosted as woff2 with `font-display` and a `size-adjust` fallback [T02, T05, T06]; at most four files.
- Display type locked to the artboard with `clamp()`, ceiling ≈ 12–13 vw [T03]; tracking no tighter than −0.06em [T04]; display leading between .8 and 1.
- Text split into lines only after `document.fonts.ready`; the first glyph of a display line optically hung when the face needs it.

**Colour and material**
- Two to four tokens under a named strategy; body contrast ≥ 4.5:1 [C01]; a warm or cool near-black rather than pure #000 unless the black is diegetic and recorded as an exception [C02]; no more than six hues in the tokens [C03]; no gradient text [C04].
- Browser surfaces themed from the tokens: `::selection`, scrollbar, `theme-color`, `color-scheme`, favicon, focus ring, Open Graph image [S01–S06].

**Motion**
- A real `prefers-reduced-motion` branch that keeps state changes and hierarchy; never a global 0.01 ms kill [M01, M02].
- Scrubbed tweens use `ease: 'none'` [M03]; `will-change` only on the elements being animated and only while they animate [M04]; no `scroll-behavior: smooth` beside a smooth-scroll library [M05]; sticky stages instead of `pin: true` where sticky works [M06]; transforms and opacity, never layout properties [M07]; every infinite loop pauses when off-screen or hidden [M08].
- One authored moment per chapter, on one shared ticker, with framerate-independent damping; hero-scale moments ≈ 1.2–1.5 s, feedback ≤ .3 s.
- Loading and the last screen are authored: a preloader tied to a real signal that holds at 100 and is skipped on repeat, a designed footer, a designed 404.

**Structure and accessibility**
- Landmarks with one `<main>`, one `<h1>`, an unbroken heading order, `lang` on `<html>`, a viewport meta [A01, A03, A09, L03].
- Every image has alt text, dimensions and a loading hint; autoplay video is muted with `playsinline` and a poster [A02, P01, A10].
- Every canvas is `aria-hidden` with its text and images mirrored in the DOM, or carries an accessible name [A04].
- Real controls: buttons and links, never click handlers on `div`/`span` [A05]; visible `:focus-visible` styles, never `outline: none` without a replacement [A06, A07].
- Every pointer-only gesture (drag, hold, draw) has a keyboard handler; the custom cursor is off on coarse pointers [A08, A11].
- Overlays: `inert` on the page behind, focus trapped, Escape closes, focus returns.

**Layout and responsive**
- The responsive strategy is decided before build (vw-lock or breakpoints), no fixed widths above 600 px, no `100vw` overflow, no full reload at a breakpoint [L01, L02].
- No identical icon-heading-text card grid, no eyebrow labels, no hero-metric row, no numbered section markers by habit [L04, L05, X07, X08].

**Performance**
- Entry JS ≤ 200 KB gz (audit fails at 300) with WebGL in its own lazy chunk [P04]; rasters under 1 MB, ideally AVIF/WebP [P02]; meshes Draco or Meshopt compressed, textures KTX2 where the scene is large [P03]; renderer DPR capped and disposed on route change [P06, P07].
- Fonts ≤ 4 files and ≤ 400 KB [P05]; no console errors; debug flags off.

**Copy**
- No "Get started" / "Learn more" [X01]; no lorem [X02]; no emoji icons [X03]; synthetic content labelled in `AWARDS.md`.

## Refuse

These are the moves that make a page look generated. They are refused even when asked casually; if the user insists, record the exception and its reason.

- Fade-and-rise on every section, parallax on everything, bounce or elastic easing by reflex.
- A blob, mesh-gradient or particle-network hero; floating 3D shapes with no concept; "make it 3D" without a thesis.
- Dark + neon + glow as a default register; gradient text; glass panels by default [X04]; hard offset shadows outside a deliberate neobrutalist world [X05]; thick coloured side stripes on cards [X06].
- A second display font, a generated six-hue palette, theme-by-habit dark mode.
- A blocking preloader with no concept, or one that plays in full on every visit.
- Scroll-jacking with no keyboard exit; hover-only affordances; drag-only galleries.
- WebGL text or images with no DOM mirror; an uncapped `devicePixelRatio`; a 50 MB glb.
- A monospace costume for a product that is not technical; a system display face; emoji as icons.
- Silently skipping the jury, or shipping with the audit red and no exception recorded.

## How the floor is enforced
- `node ${CLAUDE_PLUGIN_ROOT}/scripts/audit.mjs <dir>` runs every rule; `--quick --changed-file` runs the fast subset from the PostToolUse hook when `AWARDS.md` exists.
- `node ${CLAUDE_PLUGIN_ROOT}/scripts/capture.mjs <dir> --scroll 0,50,100 --reduced-motion` produces the evidence the jury needs.
- Exceptions live in `AWARDS.md ## Exceptions` as `RULE — reason`, or inline as `<!-- audit-ignore: RULE reason -->`.
