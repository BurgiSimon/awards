# awards — the plugin's public page

The home page of the `awards` plugin for Claude Code and Codex, redesigned for release 1.0.0 by the plugin's own loop (brief, concept, system, structure, stack, motion, jury, ship). The page argues one thing: a build is done when a jury says ship. It opens on the line "Done when a jury says ship." and both clients' install commands. Below them, five sites the plugin built are gathered, and they sort themselves into a record of what the plugin's jury said about each (`rebuild`, `fix`, `ship`, with every round's scores). The visitor can re-sort that record by Design, Usability, Creativity or Content. Each chapter's ground is the colour of the verdict it is about.

Five static routes: home, `/install`, `/docs`, `/recipes` (all 96 recipes with their frames) and a 404.

## Run and build

```bash
npm ci
npm run dev       # Vite dev server; every page is rebound from the plugin on each request
npm run build     # dist/, deployable from any folder (relative base)
npm run preview   # serve dist/
```

Node 22.12+ or 24 LTS. The deploy is `../.github/workflows/site.yml`, unchanged: it runs `npm ci` and `npm run build` into `dist/`. `SITE_ROOT` sets the 404's `<base>` (for example `/awards/` on a project page), and `SITE_URL` makes canonicals, `og:url`, `og:image`, `robots.txt` and `sitemap.xml` absolute.

Asset scripts, run by hand when their sources change; their outputs are committed:

- `npm run builds` re-encodes the five builds' first screens into `public/builds/`. It reads them from `.awards/builds/<id>/desktop-s00.png` (each showcase build is built in a scratch copy outside the repository, then captured with the plugin's `capture.mjs`) and from the redesign's baseline capture.
- `npm run og` draws `public/og.png` from the display line and the five frames.
- `npm run icons` renders the PNG icons from `public/favicon.svg`.

All three render in headless Chromium through the Playwright that ships with the plugin's recipes, so the site installs no image tooling of its own.

## What is read at build time

`facts/` is the build-time binding: a Vite plugin whose header lists the markup it understands. Anything it cannot find stops the build.

- `collect.js` reads the plugin: version, licence, repository, skill and rule counts, the rule tables, the four dispositions from `agents/awards-jury.md`, both clients' install commands from the repository `README.md`, the site cards, the patterns, the recipes and the recipe explorer's frames.
- `builds.js` reads the record from each build's own files: every verdict, score and date from its `AWARDS.md ## Jury log`, and each memory sentence from its report's `## Memory test`. The builds are `../showcase/awards-home`, `ekvator`, `extinct` and `petrel`, plus this site's previous build, whose record is kept in `.awards/redesign-2/baseline-AWARDS.md`.
- `phases.js` reads one line per phase of a build from the Museum of Extinct Colours' `AWARDS.md` and `DESIGN.md`.
- `render.js` turns all of this into regions:
  - the band and colophon shared by every route;
  - on home: the record, the memory sentences, the rebuild chapter, the phases and the recipe wall;
  - on `/docs`: the rule tables;
  - on `/recipes`: the catalogue.
- `index.js` is the plugin itself. It also serves the 96 recipe frames from `../plugins/awards/recipes/_gallery/frames/` in dev and copies them into `dist/recipes/`.

The build id (`version+commit.sources`) is printed in the colophon. To get the commit it reads git read-only.

## Where things live

- `index.html`, `install.html`, `docs.html`, `recipes.html`, `404.html` are the pages.
- `src/main.js` is the boot. Lenis and the master timeline run on GSAP's one ticker, and the page exposes `window.__awards` with `ready`, `scrollTo` and `state()` for captures.
- `src/motion/` holds the motion score:
  - `claim.js`: the one-time correction of the display line;
  - `master.js`: the paused master timeline, one label per chapter;
  - `gather.js`: the five frames travelling from the pile, through the spread, to their rows;
  - `sort.js`: the re-sort by axis, with FLIP, the floor line and the status line.
- `src/ui/` holds the page's behaviours: the chapter grounds and the band's chapter row (`theme.js`), Copy, the phone menu, the phone client switch, the recipes filter and the 404's requested path.
- `src/styles/` holds the tokens (`tokens.css`), the faces (`fonts.css`), the base and the site sheet.

## The contract, the system and the reports

- **`AWARDS.md`** is the contract and the build's memory: brief, direction contract, page map, motion score, budgets, the jury and ship logs, and the exceptions. A build can be resumed from it.
- **`DESIGN.md`** is the visual system: four verdict grounds, one ink, one paper, Gloock over Familjen Grotesk, and the components. Its values are identical to `src/styles/tokens.css`.
- **The baseline** (the "Contact sheet" build this page replaces) lives in `.awards/redesign-2/`: `baseline-AWARDS.md`, `baseline-DESIGN.md`, `inventory.md`, and `baseline-audit.json`.
- **Jury reports** are in `.awards/jury/`. Today's set is `2026-10-26-baseline.md` (the old site), `2026-10-26-component.md` (the first screen), `2026-10-26.md` (page round 1), `2026-10-26-verdict.md` and `2026-10-26-verdict-2.md`. The older files are the previous build's.
- **Ship reports** are in `.awards/ship/`: `2026-10-26.md` (batch 1), `2026-10-26-2.md` (batch 2) and `2026-10-26-3.md` (the proof pass that shipped).
- **Captures** go to `.awards/captures/` and **the audit** to `.awards/audit.json`. Both are gitignored: they are evidence, regenerated by the plugin's `capture.mjs` and `audit.mjs`.
