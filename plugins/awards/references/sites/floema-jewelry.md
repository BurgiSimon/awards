# Floema Jewelry — a course capstone, not an award reference

**Read this first.** This card is not a live-verified award entry. Everything below was read from
two course clones of an Awwwards Academy capstone, and no live render or award entry backs it. It
exists because the corpus cited this material ninety-six times under the slug `floema`, which the
2026-09-18 live pass showed belongs to a different company — Floema®, a Portuguese furniture maker
(`[site:floema]`). Rather than delete the citations or leave them pointing at the wrong site, the
two were split apart.

Treat it as a **technique reference with clone-level evidence**, never as a scored corpus exemplar.
Its award claim is `[recalled medium]` and unverified; its "most-cloned effect on the web" caveat is
the most useful thing on it.

Everything here was read from two course clones of an Awwwards Academy capstone, `whizzbbig/floema_` (archived 27 Oct 2024) and `predosoares/floema-jewelry`; the original `bizarro/floema` is 404. **None of it is a fact about floema.com/en**, and the served page contradicts all four of its headline techniques: no OGL (Lenis 1.3.8 + GSAP instead), no hand-rolled `lerp 0.1` virtual scroll (native + Lenis), a different palette entirely, and reduced-motion CSS that does exist. Whether the jewellery site ever served from this domain is [unknown]. It is kept because `patterns/` cites it ~15 times.

- **Award** [recalled medium]: Awwwards SOTD 30 Jul 2021 plus a Developer Award, score 7.53, under a separate entry slug (`sites/floema-jewelry`). The assumption that `sites/floema` was that entry is now **disproved** — that URL is the 2026 Bürocratik entry. Credits: design Empi Persona, development Luis Henrique Bizarro and Angelo Bartolome [recalled high].
- **Stack** [verified — clone]: no framework, one `class App`; Node + Express + Pug; Prismic; GSAP ^3.7.1; **OGL ^0.0.73**; raw `.glsl` via glslify; Webpack 5 + SCSS; `normalize-wheel`, `ua-parser-js` branching markup by device class server-side; self-hosted Suisse BP Intl + George X, six files.
- **Palette** [verified — clone `variables.scss`]: #f9f1e7 warm bone · #c97164 terracotta · #bc978c clay · #b2b8c3 grey-blue · #37384c ink navy, plus #FFC400 on one drawn CTA stroke. Two live at a time, cross-faded over 1.5 s by a `ColorsManager` singleton tweening `document.documentElement`. Terracotta on bone is 3.11:1 — large type only [verified hexes; ratio computed].
- **Scroll and GL** [verified — clone]: `NormalizeWheel` → `GSAP.utils.interpolate(current, target, 0.1)` → `translateY`; every image an OGL plane laid on an `<img data-src>` rect, planes at `uAlpha` 0.4; infinite recycle at 60 % past the edge with a re-randomised z-rotation; collections row bowed by `mapRange(-0.2, 0.2)` plus a cosine offset.
- **Signature shader** [verified — clone `shaders/home-vertex.glsl`, verbatim formula]:
  ```glsl
  newPosition.z -= (sin(newPosition.y / uViewportSizes.y * PI + PI / 2.0)
                  + sin(newPosition.x / uViewportSizes.x * PI + PI / 2.0)) * abs(uSpeed);
  ```
  All the character in the vertex stage; the fragment stage is `texture2D(tMap, vUv)` with `uAlpha`. It is also the most-cloned effect on the web — a juror names the course from the first drag.
- **Transitions and preloader** [verified — clone]: framework-free router (`await page.hide()` → `fetch` → parse detached → `pushState` → swap `innerHTML` → new page + canvas scene → `page.show()`); a shared-element mesh flight between routes, `z += 0.01`, 1.5 s `expo.inOut`, mesh removed 0.2 s later; a counted preloader that decodes **every texture on every route**, holds ≈ 1 s at 100 %, then exits titles at `y: '150%'`, 1.5 s, `expo.out`, stagger 0.1.
- **Absences in that source** [verified absence — clone]: no `prefers-reduced-motion` anywhere, no keyboard path (gallery items are not focusable), no custom cursor, no sound.
- **Sources for this appendix:** github.com/whizzbbig/floema_ · github.com/predosoares/floema-jewelry · github.com/bizarro/floema (404) · awwwards.com/sites/floema-jewelry (not fetched this pass) · awwwards.com/bizarro/ · awwwards.com/empi.junior/ · the Awwwards Academy course page.

## Confidence

Clone-level throughout. No live render, no award entry read, no capture set. Split out of
`floema.md` on 2026-09-18 during the 0.2 corpus verification; see
`docs/handoff/verification-log.md`.
