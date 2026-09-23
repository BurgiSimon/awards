# Pinned versions (checked on npm, 2026-09-17)

Use these exact versions in scaffolds, recipes and generated `package.json` files. Bump deliberately, one library at a time, and re-run the recipe verification afterwards.

| Package | Version | Role |
|---|---|---|
| gsap | 3.15.0 | motion engine; all plugins free |
| @gsap/react | 2.1.2 | `useGSAP` for React / Next |
| lenis | 1.3.26 | smooth scroll on native scroll |
| three | 0.186.0 | WebGL |
| @react-three/fiber | 9.7.0 | React renderer for three |
| @react-three/drei | 10.7.8 | R3F helpers |
| postprocessing | 6.39.5 | pmndrs composer: bloom, SMAA |
| ogl | 1.0.11 | minimal WebGL (Floema lineage) |
| animejs | 4.5.0 | second motion grammar |
| motion | 13.4.1 | React UI micro-interactions only; never scrub (re-checked 2026-09-23) |
| split-type | 0.3.4 | legacy splitter; prefer SplitText |
| smooothy | 0.0.35 | draggable / wheel slider with snap and lerp; pre-1.0, pin exactly (checked 2026-09-23) |
| @unseenco/taxi | 1.9.1 | SPA page transitions (Lando) |
| swup | 4.10.0 | alternative transition router |
| @barba/core | 2.10.3 | alternative transition router |
| @rive-app/canvas | 2.42.2 | authored 2D vector states |
| @lottiefiles/dotlottie-web | 0.80.0 | Lottie playback |
| howler | 2.2.4 | sound |
| matter-js | 0.20.0 | 2D physics |
| pixi.js | 8.21.0 | 2D GPU canvas |
| next | 16.3.5 | framework |
| nuxt | 4.5.2 | framework |
| astro | 7.3.3 | framework |
| @sveltejs/kit | 2.70.3 | framework |
| vite | 8.3.0 | build (Rolldown) |
| tailwindcss | 4.3.3 | only when the project already uses it; no winner shipped it in production |
| @threlte/core / @threlte/extras | 8.6.0 / 9.21.1 | Svelte renderer for three |
| @bsmnt/scrollytelling | 0.3.3 | basement.studio's ScrollTrigger abstraction (React) |
| @gltf-transform/cli | 4.5.0 | glTF optimisation (Draco, KTX2, resize) |

## The rule
Check Context7 before using an API you have not verified in this session, even for libraries you know well: `mcp__Context7__resolve-library-id`, then `mcp__Context7__query-docs` with one concept per query. If a claim cannot be verified, write `[unverified]` next to it instead of asserting it.

## Context7 ids (resolved 2026-09)
| Library | Id | Notes |
|---|---|---|
| GSAP | `/websites/gsap_v3` | 2,747 snippets; `/greensock/gsap` is the README (licence, plugin list) |
| @gsap/react | `/greensock/react` | `useGSAP` |
| gsap-skills | `/greensock/gsap-skills` | GreenSock's official agent skills |
| Lenis | `/darkroomengineering/lenis` | core, react and vue READMEs plus source |
| Three.js | `/websites/threejs`, `/mrdoob/three.js` | docs site; repository (manual and source) |
| postprocessing | `/pmndrs/postprocessing`, `/websites/pmndrs_github_io_postprocessing_public` | README; API docs |
| React Three Fiber | `/pmndrs/react-three-fiber` | |
| Threlte | `/threlte/threlte` | |
| Anime.js | `/websites/animejs`, `/juliangarnier/anime` | docs; repository (the source is the truth for 4.5) |
| Motion | `/websites/motion_dev` | |
| smooothy | `/vallafederico/smooothy` | README disagrees with the 0.0.35 source; trust the source |
| @unseenco/taxi | `/craftedbygc/taxi` | |
| Next.js | `/vercel/next.js` | App Router docs |
| Nuxt | `/websites/nuxt_4_x` | 4.x docs |
| Astro | `/withastro/docs` | |
| SvelteKit | `/websites/svelte_dev_kit` | |
| Vite | `/vitejs/vite` | Vite 8 / Rolldown options |
| Webflow | `/websites/developers_webflow` | Data and Browser APIs only; no runtime (`webflow.js`) documentation |
