# __PROJECT_NAME__

Scaffolded by the awards plugin (`/awards:stack`). Vite + vanilla JS, Lenis + GSAP on one ticker, an optional lazy Three.js island, a central reduced-motion tier and quality tiers.

- `npm install && npm run dev`
- `AWARDS.md` — the build contract (brief, direction contract, page map, motion score, logs)
- `DESIGN.md` + `src/styles/tokens.css` — the visual system (keep in sync)
- `src/lib/scroll.js` — Lenis + ScrollTrigger boot · `src/lib/motion.js` — the motion vocabulary · `src/lib/quality-tiers.js` — device tiers · `src/webgl/scene.js` — the WebGL island
- Review: `node <plugin>/scripts/capture.mjs dist --reduced-motion` and `node <plugin>/scripts/audit.mjs .`
