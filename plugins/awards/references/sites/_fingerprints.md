# Composition fingerprints

Measured, not described: `node scripts/corpus-skeletons.mjs` loads each card's live URL at 1440 × 900 and 390 × 844 with reduced motion, drops consent layers, and records what the first viewport is made of. The block maps are in `skeletons/<slug>.png` (top, middle and close on desktop, top on a phone; headings dark, text grey, media light grey). They carry no pixels, words or colours of the sites, only where things sit, so concept and system can read a neighbour's composition without copying its imagery. Every figure is `[verified]` against the live page on the date in its row; the live site may have changed since the card was written.

Columns: type ramp is the computed h1 / h2 / body size in px; margin is the leftmost text edge in px (desktop / phone); edges counts distinct left edges used at least twice in the first desktop viewport (a rough column count: 2–4 is a simple grid, 10+ a dense one); media is the share of the first desktop viewport covered by images, video or canvas; height is the page length in viewports (1 means a virtual scroller or a single screen).

| Card | Status | Type ramp, desktop | Type ramp, phone | Margin | Edges | Media | Height |
|---|---|---|---|---|---|---|---|
| [site:911rennsport] | refused by the owner's policy 2026-10-22 | — | — | — / — | — | — | — |
| [site:a24-raviklaassens] | measured 2026-10-22 | 120 / 14 / 8 | 52 / 13 / 8 | 8 / 8 | 4 | 100 % | 1 |
| [site:aardvarkbookclub] | measured 2026-10-22 | 120 / 78 / 18 | 50 / 39 / 17 | 16 / 16 | 1 | 100 % | 14.1 |
| [site:abatable] | measured 2026-10-22 | 79 / 60 / 31 | 42 / 34 / 21 | 48 / 32 | 1 | 100 % | 18 |
| [site:agrumeafarm] | measured 2026-10-22 | 32 / — / — | 32 / — / — | — / — | 0 | 100 % | 1 |
| [site:alectear] | measured 2026-10-22 | — / — / 25 | — / — / 16 | — / — | 0 | 100 % | 5 |
| [site:animejs] | measured 2026-10-22 | 12 / 20 / 16 | 13 / 40 / 16 | 0 / 16 | 4 | 1 % | 4 |
| [site:aqualoqa] | measured 2026-10-22 | — / — / — | — / — / — | — / — | 0 | 100 % | 1 |
| [site:areebali] | measured 2026-10-22 | 16 / 16 / — | 16 / 16 / 18 | 40 / 48 | 7 | 1 % | 1 |
| [site:ascension-pegassi] | unreachable 2026-10-22 | — | — | — / — | — | — | — |
| [site:bethebuzz] | measured 2026-10-22 | 100 / 40 / 20 | 44 / 28 / 16 | 496 / — | 1 | 100 % | 6.1 |
| [site:bleibtgleich] | measured 2026-10-22 | 90 / — / — | 45 / — / — | 16 / 16 | 3 | 100 % | 7.5 |
| [site:boc] | measured 2026-10-22 | 28 / 13 / 29 | 24 / 13 / 22 | 16 / 24 | 5 | 56 % | 2.5 |
| [site:christoph-nagel] | measured 2026-10-22 | 15 / 187 / 15 | 12 / 82 / 15 | 504 / 24 | 1 | 100 % | 1 |
| [site:cutobot-byholm] | measured 2026-10-22 | 32 / — / 16 | 32 / — / 16 | — / — | 0 | 100 % | 250.5 |
| [site:cyphercapital] | measured 2026-10-22 | 64 / 64 / 16 | 40 / 40 / 16 | 32 / 16 | 1 | 99 % | 6.2 |
| [site:edolus] | measured 2026-10-22 | — / — / — | — / — / — | — / 24 | 0 | 100 % | 1 |
| [site:eugeniagrab] | refused by the owner's policy 2026-10-22 | — | — | — / — | — | — | — |
| [site:floema] | measured 2026-10-22 | 57 / 51 / 16 | 32 / 30 / 14 | 352 / 56 | 1 | 100 % | 16 |
| [site:gehry-getty] | measured 2026-10-22 | 14 / 55 / 21 | 12 / 29 / 19 | 472 / 64 | 1 | 100 % | 55.1 |
| [site:goats] | measured 2026-10-22 | 80 / 98 / 18 | 40 / 37 / 15 | — / — | 0 | 100 % | 6.8 |
| [site:grids-obys] | measured 2026-10-22 | — / — / 14 | — / — / — | 48 / — | 3 | 26 % | 49.1 |
| [site:haoqi] | measured 2026-10-22 | — / — / 60 | — / — / 20 | 64 / 24 | 1 | 100 % | 1 |
| [site:igloo] | measured 2026-10-22 | — / — / — | — / — / — | — / — | 0 | 0 % | 1 |
| [site:jesperlandberg] | measured 2026-10-22 | 27 / 20 / 13 | 28 / 21 / 14 | 0 / 0 | 2 | 100 % | 1 |
| [site:lama-lama] | measured 2026-10-22 | 72 / 48 / 20 | 40 / 32 / 16 | 40 / 16 | 20 | 100 % | 1 |
| [site:lando-norris] | measured 2026-10-22 | 38 / 32 / 17 | 38 / 32 / 14 | 40 / — | 1 | 100 % | 15.1 |
| [site:leo-parpeix] | measured 2026-10-22 | 14 / 14 / 34 | 14 / 14 / 22 | 40 / 32 | 2 | 100 % | 14.7 |
| [site:likova] | refused by the owner's policy 2026-10-22 | — | — | — / — | — | — | — |
| [site:mensch] | measured 2026-10-22 | 32 / — / 12 | 32 / — / 12 | 48 / 24 | 8 | 100 % | 3.7 |
| [site:mindmarket] | measured 2026-10-22 | 140 / 30 / 30 | — / 47 / 27 | 240 / 24 | 1 | 43 % | 15.3 |
| [site:mont-fort] | measured 2026-10-22 | — / 50 / 24 | — / 36 / 20 | 200 / 32 | 2 | 100 % | 19.6 |
| [site:nodeck] | measured 2026-10-22 | 106 / — / 16 | 59 / — / 14 | 712 / 160 | 1 | 51 % | 1 |
| [site:noth] | measured 2026-10-22 | 13 / 72 / 14 | 14 / 40 / 16 | 16 / 16 | 3 | 50 % | 13.3 |
| [site:okaydev] | refused by the owner's policy 2026-10-22 | — | — | — / — | — | — | — |
| [site:oryzo] | measured 2026-10-22 | 123 / 51 / — | 100 / 40 / — | 48 / 24 | 7 | 100 % | 55.5 |
| [site:pensatori-irrazionali] | measured 2026-10-22 | 16 / — / 14 | 16 / — / 24 | 920 / 344 | 3 | 96 % | 14.9 |
| [site:primesec] | measured 2026-10-22 | 90 / 48 / 24 | 54 / 32 / 16 | 32 / 16 | 11 | 100 % | 21.4 |
| [site:robbietilton] | measured 2026-10-22 | — / — / 18 | — / — / 18 | 56 / — | 1 | 27 % | 3.3 |
| [site:runrobrun] | measured 2026-10-22 | 120 / 66 / 13 | 42 / 40 / 13 | 48 / 16 | 4 | 100 % | 8.6 |
| [site:seasats] | measured 2026-10-22 | 124 / 80 / 16 | 64 / 36 / 16 | 352 / 24 | 4 | 100 % | 38 |
| [site:serotoninn] | measured 2026-10-22 | 80 / 20 / 12 | — / 21 / 12 | — / — | 0 | 100 % | 8.7 |
| [site:shopify-editions-w26] | measured 2026-10-22 | 14 / 32 / 44 | 14 / 32 / 28 | 16 / 24 | 2 | 100 % | 60.1 |
| [site:siena] | measured 2026-10-22 | — / 90 / — | — / 48 / — | — / — | 0 | 100 % | 1 |
| [site:siteassist] | measured 2026-10-22 | 62 / 72 / 16 | 32 / 40 / 16 | 1128 / 216 | 2 | 100 % | 6.8 |
| [site:slosh-seltzer] | measured 2026-10-22 | 100 / — / — | 100 / — / — | — / — | 0 | 0 % | 1 |
| [site:son-daven] | measured 2026-10-22 | 12 / 56 / 10 | 12 / 41 / 10 | 16 / 16 | 7 | 100 % | 36.9 |
| [site:spasoje] | measured 2026-10-22 | 12 / 12 / 12 | 12 / 12 / 12 | 456 / 24 | 4 | 0 % | 7.3 |
| [site:stanzza] | measured 2026-10-22 | 72 / 56 / 18 | 48 / 40 / 16 | — / 32 | 0 | 100 % | 28.2 |
| [site:the-boyd] | measured 2026-10-22 | 240 / — / 16 | 75 / — / 17 | 48 / 24 | 7 | 100 % | 9.4 |
| [site:the-line] | measured 2026-10-22 | 175 / 10 / 23 | 72 / 12 / 24 | — / — | 0 | 29 % | 10.7 |
| [site:to-top] | measured 2026-10-22 | 68 / 86 / 22 | 35 / 47 / 16 | 256 / 8 | 5 | 100 % | 21.3 |
| [site:trevor-noah] | measured 2026-10-22 | 361 / 99 / 19 | 170 / 40 / 18 | — / — | 0 | 100 % | 11.9 |
| [site:united-carriers] | measured 2026-10-22 | 80 / 60 / 23 | 48 / 36 / 18 | 64 / 16 | 8 | 100 % | 31.4 |
| [site:usavionix] | timed out after 6 minutes 2026-10-22 | — | — | — / — | — | — | — |
| [site:warmnfuzzy] | measured 2026-10-22 | 47 / 16 / 47 | — / 12 / 24 | — / — | 0 | 100 % | 1 |
| [site:wearedirect] | measured 2026-10-22 | 90 / 64 / — | 60 / 48 / — | 728 / 16 | 1 | 33 % | 11.2 |
| [site:white-desert] | measured 2026-10-22 | 256 / 90 / 14 | 80 / 32 / 14 | — / — | 0 | 100 % | 23.1 |
| [site:why-zero] | measured 2026-10-22 | — / — / — | — / — / — | — / 40 | 0 | 100 % | 1 |
| [site:wodniack] | measured 2026-10-22 | 216 / 12 / 20 | 109 / 12 / 20 | 1032 / — | 1 | 100 % | 1 |
| [site:zainabkabira] | measured 2026-10-22 | 32 / 40 / 32 | 32 / 28 / 19 | 448 / 64 | 1 | 100 % | 7 |
