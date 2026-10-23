# awards-home — the plugin's page, printed as a press proof

A new page for the awards plugin (`plugins/awards`), built with the plugin itself. The page is a press proof of itself: printed in two plates, the key (every word) never moves while the yellow spot plate starts out of register and pulls in as the reader goes down the plugin's run, meeting at the press check, where the stamp prints from the Ekvator showcase's own jury line.

- `npm ci && npm run dev` — the dev server; facts are re-read on every request.
- `npm run build` — `dist/`, deployable from any folder (`base: './'`).
- `python3 scripts/halftone.py <capture.png> public/proof/<name>` — reprints a capture as the two halftone plates.

Every count, name and command is read at build time by `facts/` from `plugins/awards` (manifest, skills, recipes, audit rules, corpus index), the repository README (install lines) and `showcase/ekvator/AWARDS.md` (seed and jury line); a skill without a line on the page stops the build. `src/register.js` is the registration (one paused GSAP timeline sought from the scroll), `src/ui/` the install tabs and the phone plate menu, `src/styles/sheet.css` the sheet.

The build contract is `AWARDS.md`, the visual system `DESIGN.md`; jury and ship reports are in `.awards/jury/` and `.awards/ship/`.
