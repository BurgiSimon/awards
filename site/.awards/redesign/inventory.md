# Redesign inventory: site/ (the wind-tunnel build) → site-next/

Baseline: `.awards/redesign/baseline/routes.json` (home, install, docs, 404; scroll 0/25/50/75/100 at desktop, tablet and phone, reduced motion, ARIA trees; the home states in `home-states/`, the no-WebGL capture in `nogl/`). Rendered audit of the baseline `dist/`: P0 0 · P1 0 · P2 0 · P3 0, with four recorded exceptions (`.awards/redesign/baseline-audit.json`; its stale-build warning came from file times after a rebase, not from changed sources). The baseline critique is the jury report on the same captures, copied to `.awards/jury/` and marked `baseline`.

Kept content is real content and replaces synthetic copy; every number on either site is read from the plugin at build time, so "keep" for a count means keep the fact, not the sentence.

| Item | Where | Decision | Reason |
|---|---|---|---|
| Route: home | `/` | keep (rewrite) | The conversion page; its argument is rewritten for the new contract |
| Route: install | `/install.html` | keep | Read mode, commands first; the facts are correct and needed |
| Route: docs | `/docs.html` | keep (rewrite) | Read mode; regrouped around the modes this release added (quick, redesign, programs) |
| Route: recipes | — | add | 89 entries deserve a route of their own: a filterable catalogue with each recipe's own frame (inner-pages pattern) |
| Route: 404 | `/404.html` | keep (rewrite) | An authored error page with three ways out; the "flow separated" line belongs to the old world |
| Title and description, home | `<head>` | rewrite | "websites tested before anyone sees them" is still the claim; the wording follows the new world |
| Wordmark `awards` as the hero object | home, first viewport | drop | The baseline's own signature; a redesign that keeps it is a reskin |
| Claim "Put the website in the wind tunnel before anyone sees it." | home hero | drop | Belongs to the wind-tunnel metaphor |
| Lede: plugin for Claude Code and Codex, contract, audit rules, captures, fresh-context juror | home hero | keep (rewrite) | The plainest true description of the product; keep its four facts |
| Actions "Install the plugin" / "Read the docs" | home hero | keep | Clear, verb-first, honest about the price |
| Readout strip: airspeed, skills, audit rules, recipes verified | home hero | rewrite | Airspeed belongs to the old signature; "recipes verified 76 / 89" is true and stays as a fact somewhere |
| Airflow on/off switch | home | drop | Controls the old signature |
| Chapter: "Nine stations, one file that remembers them" (Brief → Ship, each with its artefact) | home | keep (rewrite) | The phase list and the artefact each leaves is the product's spine |
| Chapter: "This page, measured" (four weighted bars, disposition, memory answer from `jury.json`) | home | keep | The page printing its own unedited jury scores is the strongest proof the product has |
| Chapter: "88 rules, run after every edit" (eight families with counts, the slop scan) | home | keep (rewrite) | Real numbers from `rules.json` |
| Chapter: "Taste you can cite" (cards, patterns, recipes) | home | keep (rewrite) | The corpus as evidence; now with 55 composition skeletons and the gap-driven waves |
| Install plate: two commands with copy buttons, `role=status` | home close, install | keep | The conversion; works by keyboard; commands stay selectable text |
| Footer: version, licence, repository, the jury line | every route | keep | Truthful and short |
| Docs sections: skills, craft flow, jury, audit (rule tables in `<details>`), recipes, corpus, scripts | docs | keep (rewrite) | Generated from the plugin; add modes and programs; recipes move to their own route |
| Install sections: Claude Code, Codex, requirements, project files, local copy | install | keep | Correct as written; Node floor and Playwright notes still current |
| Fonts: Archivo, Martian Mono | assets | drop | The old world's type contract; the system phase chooses again, character first |
| Flow solver, worker, WebGL chunk | code | drop | The old signature |
| Lenis + GSAP boot, one ticker, `window.__awards` hook, facts plugin reading the repository at build | code | keep (adapt) | Infrastructure, not look; the facts plugin is how counts stay true |
| Cross-document view transitions | code | decide in motion | A behaviour, not a look |
| `jury.json` → home readout | data | keep | The scores are copied from the new page's own jury report |
| Favicon (orange mark) | asset | drop | Redrawn from the new tokens |
