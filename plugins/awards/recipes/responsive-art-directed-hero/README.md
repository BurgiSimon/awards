# Alder Workshop — responsive art-directed hero

An original, static `<picture>` recipe. A wide view and a separately composed portrait view of the same fictional oak bench serve the same headline, copy and action. The browser chooses the image at a 48rem boundary; no resize script or image library is needed.

## Run

From `plugins/awards/recipes`, run `npm run dev` and open `/responsive-art-directed-hero/`. From the repository root:

```sh
AWARDS_PLAYWRIGHT=/path/to/playwright node plugins/awards/scripts/verify-recipes.mjs --only responsive-art-directed-hero
```

The page remains readable and its specification link works without JavaScript. `main.js` only registers verifier state, waits for the chosen image to decode and fonts to settle, then calls `awards.ready()`.

## Image and reading order

The `<source>` chooses `hero-portrait.webp` below 48rem; the `<img>` fallback supplies `hero-wide.webp` above it. Source dimensions are 1024 × 1536; fallback dimensions are 1586 × 992. Both images are original synthetic demonstration material, documented in [ASSETS.md](../_shared/composition/ASSETS.md). They are different compositions of the same product, not crops cut from one file. The CSS reserves an 8:5 desktop frame and a 4:5 phone frame before decoding. `object-fit: cover` preserves those frames.

The headline, explanation and action come before the image in both DOM and visual order. A reader reaches the proposition and its destination first; on a phone the product view follows immediately. No CSS `order` reversal creates a different keyboard or screen-reader sequence. The desktop wide source nearly matches the 8:5 frame exactly. The portrait source has spare wall above and floor below the complete bench; visual review at 390px confirmed that centered 4:5 cropping keeps the seat and all four feet visible, so its focal position remains centered. Retune `object-position` after inspecting replacement art, especially the feet and the action-to-image transition.

Copy the `.art-hero` section with its `hero-copy` and `hero-media` layout markers. The component uses `.composition-title` and `.composition-copy` from shared tokens. The `[data-demo]` wrapper, masthead, specification section and footer are standalone presentation; a consuming page provides its own destination for the action. Keep the hero's text and media in that document order. Its `main.js` is diagnostic and need not be imported by a larger page; register that page's own state through the shared hook.

The warm ground, brown ink, clay action and system fonts come from `composition.css`, imported after `base.css`. [ASSETS.md](../_shared/composition/ASSETS.md) records palette contrast and asset provenance. [The Line site card](../../references/sites/the-line.md) illustrates how a single hero can establish an art direction; this example does not copy its imagery, copy or layout.

## Verification boundary

The verifier directly exports the shared layout probe. Desktop 1440 × 900, phone 390 × 844 and reduced-motion desktop states assert the selected source, decoded intrinsic dimensions, reading order, reserved frame ratio, one h1, no horizontal overflow, no broken visible image and working local links. The verifier writes captures and machine results to ignored `recipes/_verify/` and stamps metadata after a passing run. Browser captures support visual review of these two viewports; they do not prove every intermediate width or real-device performance.

Alder Workshop, the white-oak bench, all construction claims, dimensions and imagery are synthetic demonstration material. The pictures are not evidence of a manufactured product or instructions for making one.

## Adapters

### Webflow
No module: the hero is static HTML and CSS, and `main.js` only reports which source was chosen. The work is structure.
- A Section with class `art-hero` holding, in this order, a Div `art-hero__copy` (the H1 `composition-title`, the paragraph `composition-copy`, the link `art-hero__action`) and the picture. Keep that order at every breakpoint, with no reordering in the Designer, so keyboard and screen-reader users meet the text and the action first.
- The art direction is two compositions, not one image at two sizes. Webflow's Image element emits a `srcset` (`references/stacks/webflow-export.md`), and a `srcset` resizes one asset, so the `<picture>` with its `<source media="(max-width: 47.999rem)">` goes in a Code Embed with both assets' URLs, `width` and `height`, the alt text and `fetchpriority="high"`. Whether the Designer offers a per-breakpoint image source is [unverified]. Never lazy: it is the hero.
- The frame switch (8:5 to 4:5, `object-fit: cover`) sits at 48rem in the recipe; Webflow's nearest breakpoint is 767 px [recalled]. Set the frame there in the Designer, or keep the recipe's media query in Head code beside the `<source>` boundary.
- Reduced motion: nothing moves, so there is nothing to configure.

## Visual notes

Captured 2026-10-06 from the built page in headless Chromium 153.0.8010.12 on Linux, device scale 1, system fonts, normal motion. Desktop is 1440×900 CSS px; mobile is 390×844 CSS px with touch/mobile emulation. All published PNGs are unedited browser screenshots under 1 MiB. Reviewed for hierarchy, aligned edges, crop, whitespace and responsive order; no material defect was found in these frames.

### Desktop

![responsive-art-directed-hero — desktop](visuals/desktop.png)

Top; scroll 0%.

- Hierarchy: the two-line serif title at left balances the complete bench at right; the clay action remains distinct below the shorter explanation.
- Alignment: the title, prose and action share the left gutter; the picture and lower specification register share the right edge.
- Crop: the 8:5 frame retains the whole seat and all four feet, with floor beneath; the quiet wall gives the product breathing room.
- Measure and whitespace: short copy occupies two lines while the wide gap above the specification marks a new chapter.
- Recomposition: this side-by-side arrangement becomes copy, action, then portrait on mobile; the document order does not change.

### Mobile

![responsive-art-directed-hero — mobile](visuals/mobile.png)

Top; scroll 0%.

- Hierarchy: the 48px serif headline still leads, followed by two lines of explanation and the clearly underlined action.
- Alignment: every content block meets the same 20px inset, including the full-width picture.
- Crop: the portrait source fills a 4:5 frame; seat, pins and feet remain visible with extra wall above.
- Measure and whitespace: two title lines and distinct gaps keep copy from merging into the photograph.
- Recomposition: the action appears before the portrait instead of beside it, preserving a readable first decision at phone width.

An unsuccessful alternative would squeeze the landscape into the phone frame and cut off the feet. For another subject, supply a deliberate portrait and inspect its focal point, action length and heading wrap.
