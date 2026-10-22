# awards — the plugin's public page

A contact sheet of its own captures: five static routes (home, install, docs, recipes, 404) built with Vite, whose counts, commands and rule tables are read from `../plugins/awards` at build time and whose strip of frames comes from this site's own captures. The contract is `AWARDS.md`, the visual system `DESIGN.md`.

- `npm ci && npm run dev`: the dev server, every page rebound on each request.
- `npm run build`: `dist/`, deployable from any folder. `SITE_ROOT=/<repo>/` sets the 404's `<base>` (`.github/workflows/site.yml` passes it).
- `npm run proof`: after a capture, jury or verdict round, rewrites `src/data/proof.json` and `public/proof/` from `.awards/` (see the header of `scripts/proof.mjs`). Both are committed; the build only reads them.
- `npm run frames`: re-renders each recipe's frame into `public/recipes/` and `src/data/recipes.json`.

Where things live: `facts/` is the build-time binding (a Vite plugin; its header lists the markup it understands), `src/main.js` the boot (Lenis and ScrollTrigger on GSAP's ticker, `window.__awards`, the motion tier), `src/ui/` the page's few behaviours, `src/styles/` the tokens and the sheet.
