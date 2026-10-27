# The Wrenmouth Lido

A website for **The Wrenmouth Lido**, a fictional 1937 seawater lido on the sea wall of a fictional harbour town, reopening at 06:00 on Saturday 14 June 2027 after 28 years shut. The client, the town and the Trust are invented, and the site's footer says so. The photographs are real, openly licensed pictures of *other* pools, coasts and swimmers. Every one is captioned with where it really is and credited.

The idea: the first photograph of the restored lido hasn't been taken yet. The site is built around that **empty frame**. You can turn it over to read the caption pencilled on the back, and entering the dawn-swim ballot adds your name to that caption.

What the site asks visitors to do, in this order:

1. enter the free ballot for the opening dawn swim (400 places);
2. buy a season pass (£145 / £60 / £95);
3. join the Trust (£12 a year).

The forms run in the browser only. Nothing is sent anywhere and no payment is taken.

## Pages

| Route | File |
|---|---|
| Home | `index.html` |
| Dawn swim ballot | `dawn-swim/index.html` |
| Season passes | `season-passes/index.html` |
| The Trust | `trust/index.html` |
| Visit (times, water by month, what to bring, getting here) | `visit/index.html` |
| 404 | `404.html` |

## Run and build

Requires Node 20.19+ or 22.12+.

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
npm run preview   # serve dist/
```

`dist/` is plain static HTML, CSS, JS, fonts and images, so any static host will serve it. Point the host's not-found page at `dist/404.html`.

## How it's put together

- **Vanilla Vite, multi-page.** `vite.config.js` lists the six HTML entries.
- **Build-time includes.** `build/html-includes.js` turns comments like `<!--#include header -->`, `<!--#picture slot="hero" … -->`, `<!--#credits -->`, `<!--#monthpicker -->` and `<!--#monthtable -->` into static HTML, in dev and in the build. The page therefore reads in full with JavaScript off.
- **Content data.**
  - `src/data/pictures.json` holds every photograph's files, size, alt text, place, date, creator, licence and source. Captions and the credits list are generated from it.
  - `src/data/months.json` holds the water temperature by month, used by the home-page month picker and the visit-page table.
- **Styles.** `src/styles/tokens.css` holds the design tokens, `fonts.css` the self-hosted fonts, and `main.css` everything else.
- **Behaviour** lives in `src/main.js` and `src/ui/*`:
  - menu dialog;
  - the frame that turns over;
  - month picker;
  - forms;
  - theme-colour following.

  `src/lib/*` holds the scroll setup (GSAP ticker + Lenis), the reduced-motion tiers and the `window.__awards` review hook. `src/motion/*` holds the motion score.
- **Motion tiers.** Add `?motion=reduced` or `?motion=static` to any URL to see the reduced or static version; the operating system's reduced-motion setting is honoured automatically.

## Where the decisions are

- **`AWARDS.md`** is the build contract. It holds:
  - the brief, with every invented fact listed as synthetic;
  - the locked direction: thesis, world, story, first viewport, signature, scroll model, load and close, divergence;
  - the page map with its layouts and the hero-probe notes;
  - the motion score;
  - budgets and tiers;
  - the jury log and the ship log;
  - the one accepted audit exception.

  `## Status` shows every phase done, so the build can be resumed or extended from it.
- **`DESIGN.md`** is the visual system:
  - colour strategy (theme-per-section: concrete, sea and pool grounds, one lifeguard-flag red), with tokens and computed contrast ratios;
  - the type contract (Young Serif, Commissioner and Reenie Beanie, each with the reasons it was chosen and the faces it beat);
  - layout and the "prints on concrete" material policy;
  - every component and its states;
  - motion tokens and the three reduced-motion tiers;
  - browser surfaces.

  Its values match `src/styles/tokens.css`.
- **Jury reports** are in `.awards/jury/`, in order:
  1. `2026-10-26.md`: the first-viewport component pass.
  2. `2026-10-26-2.md`: page round 1.
  3. `2026-10-26-verdict.md` to `2026-10-26-verdict-5.md`: the verdict rounds after each fix batch.

  The last verdict is **ship**, weighted 8.10 (Design 8.2, Usability 8.3, Creativity 7.6, Content 8.1, developer mean 8.20).
- **Ship report:** `.awards/ship/2026-10-26.md` covers all five fix passes and the final proof. It includes:
  - the audit at zero;
  - the performance table (entry JS 55 KB gz, LCP about 1.9 s on a throttled phone);
  - the two small craft rows left open after ship;
  - the device checks still owed.
- **Evidence:** `.awards/captures/` holds the screenshots each round was judged on; every pass has a `routes.json`. `.awards/assets-log.md` records how each picture was found and licensed, and `.awards/assets.json` is the machine-readable asset log.

## Credits

- **Fonts:** Young Serif, Commissioner and Reenie Beanie, all under the SIL Open Font License 1.1 (`public/fonts/LICENSE.txt`).
- **Photographs:** see the "Picture credits" list in every page's footer and `src/data/pictures.json`.
