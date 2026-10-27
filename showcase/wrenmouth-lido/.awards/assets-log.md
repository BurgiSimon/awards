# Asset log — The Wrenmouth Lido

Every picture on the site is a real photograph of another place, from an open collection, credited in its caption and in the footer's picture credits (generated from `src/data/pictures.json`). None is presented as Wrenmouth: the town, the lido and the Trust are fictional.

## How they were found (2026-10-26)
- `assets.mjs search` over Openverse, the Met, AIC, NASA, Library of Congress and Wikimedia Commons, from the inventory: "lido 1930s", "sea bathing pool", "ocean baths", "tidal pool", "bathers sea wall", "diving board lido"; then targeted Openverse queries (winter swimming, seaside sauna, swimming lessons in the Nationaal Archief's Van de Poll collection, lifeguards, derelict lidos, Tarlair).
- The Wikimedia Commons API returned HTTP 429 (rate-limited, "robot policy") for most of the session, so licences, creators and landing pages were read from **Openverse's record of each item** (which mirrors the source's licence), and files were downloaded as Wikimedia's standard 1280 px thumbnails or Flickr's 1024 px "large" size. A larger original was not reachable for the 1024 px items (hero, Tarlair, Tobruk, Forster); they are drawn at ≤ 840 CSS px.
- Refused: *Blackrock Baths to be demolished* (monosnaps, CC BY-NC-SA: non-commercial); the other Blackrock Baths set (CC BY-SA, but carries a burned-in watermark); `Old sea wall near Wells` (a grassy dyke, not a harbour wall); a lido-themed set of Paris cabaret photographs (wrong "Lido").
- Processing: WebP at 800 px and the largest available width (≤ 1600), black-and-white prints saved as greyscale, never recoloured or graded; each file ≤ 300 KB (hero-800 88 KB).

## Pictures
| Slot | Picture | Where it really is | Creator / institution | Licence | Source | Used on |
|---|---|---|---|---|---|---|
| hero | Bathers and Moora Park, Sandgate, December 1937 | Sandgate, Queensland, Australia, December 1937 | Queensland State Archives | Public domain | https://www.flickr.com/photos/60455048@N02/31475343415 | home hero |
| sea | Saltcoats Sea Water Bathing Pool - geograph.org.uk - 5680504 | Saltcoats sea-water bathing pool, North Ayrshire, Scotland | Raibeart MacAoidh | CC BY-SA 2.0 | https://commons.wikimedia.org/w/index.php?curid=140133740 | home · the sea |
| empty | Tarlair swimming pool | Tarlair, Macduff, Aberdeenshire, Scotland | yellow book | CC BY 2.0 | https://www.flickr.com/photos/57899800@N00/9203406460 | home · 28 years empty |
| diving | Man springt van hoge duikplank in zwembad, Bestanddeelnr 350-6-5 | a swimming pool, place not recorded | Nationaal Archief | CC0 1.0 | https://commons.wikimedia.org/w/index.php?curid=65737217 | Trust |
| sauna | Seaside sauna in Kirkkonummi | Kirkkonummi, Finland | JIP | CC BY-SA 4.0 | https://commons.wikimedia.org/w/index.php?curid=140504700 | home · on the wall |
| cold | Winter swimming at Katajanokka in Helsinki, Finland, 2022 February | Katajanokka, Helsinki, Finland, February 2022 | Annette Helander | CC BY 4.0 | https://commons.wikimedia.org/w/index.php?curid=128470372 | season passes |
| hall | Tobruk Memorial Baths, Townsville, c 1953 | Tobruk Memorial Baths, Townsville, Queensland, Australia, c. 1953 | Queensland State Archives | Public domain | https://www.flickr.com/photos/60455048@N02/36259214636 | home · café |
| lesson | Alafoss De dochter van Sigurjón Pétursson uit Álafoss geeft zwemles aan een kla, Bestanddeelnr 190-0334 | Álafoss, Iceland | Willem van de Poll / Nationaal Archief | CC0 1.0 | https://commons.wikimedia.org/w/index.php?curid=67039893 | home · swim school |
| lifeguard | Lifeguard and swimmers at Green Lake, 1930 | Green Lake, Seattle, USA, 1930 | Seattle Municipal Archives | CC BY 2.0 | https://commons.wikimedia.org/w/index.php?curid=71150880 | dawn swim |
| wall | Saltcoats Sea Water Bathing Pool - geograph.org.uk - 5680528 | Saltcoats sea-water bathing pool, North Ayrshire, Scotland | Raibeart MacAoidh | CC BY-SA 2.0 | https://commons.wikimedia.org/w/index.php?curid=140133898 | visit · getting here |
| baths | Ocean Baths at Forster, N.S.W. - circa 1940 | Forster, New South Wales, Australia, c. 1940 | Aussie~mobs | Public domain | https://www.flickr.com/photos/70994841@N07/40396684215 | visit · water |
