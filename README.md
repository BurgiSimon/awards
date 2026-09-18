# awards — award-worthy websites with Claude Code

A Claude Code plugin that teaches Claude to design and build websites and components in the league of Awwwards Site of the Day / Month / Year winners — in that style, never as copies. It is built from an analysis of 19 award-winning sites, the pattern language they share, verified motion and WebGL recipes, deterministic quality checks, and a fresh-context jury.

## Install

```
/plugin marketplace add burgisimon/awards
/plugin install awards@awards
```

Local development: `claude --plugin-dir plugins/awards`.

## Skills

| Skill | Use it for |
|---|---|
| `/awards:craft` | Build an award-worthy site end to end (brief → concept → system → structure → stack → motion → WebGL → jury → ship) |
| `/awards:concept` | The idea, narrative and signature interaction before any code |
| `/awards:system` | Type contract, colour strategy, tokens, `DESIGN.md` |
| `/awards:structure` | Page map, hero archetype, components, semantic skeleton |
| `/awards:stack` | Scaffold Vite / Next / Nuxt / Astro / SvelteKit with Lenis + GSAP (+ Three) |
| `/awards:motion` | The motion score: preloader, reveals, scrub, cursor, transitions, reduced motion |
| `/awards:webgl` | Three.js / OGL / R3F layer, shaders, asset pipeline, fallbacks |
| `/awards:component` | One award-worthy component inside an existing site |
| `/awards:jury` | Score like an Awwwards jury; ordered fixes; disposition |
| `/awards:ship` | Fix batch, audit, captures, performance, a11y, meta — ship report |
| `/awards:research` | Turn a reference site into a corpus case study |

See `plugins/awards/README.md` for the workflow, the reference corpus and the recipes.
