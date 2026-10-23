# Ekvator — another city's sun, in your window

A fictional product page built end to end with the awards plugin (`plugins/awards`): Ekvator, a lamp maker in Tromsø, and its one product, a window panel that replays the real sun of another city. The page is a plaster wall lit by that sun; scrolling runs through one real day in the borrowed city, from first light to blue hour, and every time, angle and colour temperature it prints is computed in the browser for the day it is read.

- `npm ci && npm run dev` — the dev server.
- `npm run build` — `dist/`, deployable from any folder (`base: './'`); the static HTML carries real sun figures for the build date.
- `?city=kyoto` (or `lisbon`, `marrakesh`, `nairobi`, `lima`) — open the page with another city's sun; the city button in the hour line does the same.

Where things live: `src/lib/sun.js` is the solar model (NOAA/Meeus), `src/lib/facts.js` every figure the page prints, `src/light/` the borrowed day (scroll read as a clock, the window patch, the type's shadows), `src/webgl/wall.js` the one WebGL2 shader (plaster relief raked by the sun, the patch, the panel's glow), `src/ui/` the city switch, the panel drawing and the reservation form. The CSS light in `src/styles/page.css` is the static tier and the fallback when WebGL2 is missing.

The build contract is `AWARDS.md`, the visual system `DESIGN.md`; jury and ship reports are in `.awards/jury/` and `.awards/ship/`. Ekvator, the E1, its specifications, price and batch are invented; no deposit can be taken.
