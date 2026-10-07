#!/usr/bin/env bash
# Stages the recipe dependencies (vite, gsap, lenis, three…), Playwright and a headless Chromium
# into the eval workspace ($PWD). Sourced by fixture.sh of cases that need a browser: the eval
# sandbox hides the user's home, npm and the network, so captures need everything local.
# Best effort: a missing piece is reported and the case still runs (it then ends in `recapture`).
plugin="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
real_home="$(getent passwd "$(id -un)" | cut -d: -f6)"
mkdir -p node_modules .awards/browsers
[ -d "$plugin/recipes/node_modules" ] && cp -R "$plugin/recipes/node_modules/." node_modules/ \
  || echo "stage-browser: recipes/node_modules missing (run npm install in recipes/)" >&2
pw=""
for d in "${AWARDS_PLAYWRIGHT:-}" "$plugin/recipes" "$(npm root -g 2>/dev/null)/.." ; do
  [ -n "$d" ] && [ -d "$d/node_modules/playwright-core" ] && { pw="$d/node_modules"; break; }
done
if [ -z "$pw" ]; then echo "stage-browser: Playwright not found (set AWARDS_PLAYWRIGHT)" >&2; exit 0; fi
cp -R "$pw/playwright-core" node_modules/
[ -d "$pw/playwright" ] && cp -R "$pw/playwright" node_modules/
rev="$(node -e "const b=require('$pw/playwright-core/browsers.json').browsers;const h=b.find(x=>x.name==='chromium-headless-shell')||b.find(x=>x.name==='chromium');console.log(h.revision)")"
src="$real_home/.cache/ms-playwright/chromium_headless_shell-$rev"
[ -d "$src" ] || src="$real_home/.cache/ms-playwright/chromium-$rev"
[ -d "$src" ] && cp -R "$src" .awards/browsers/ \
  || echo "stage-browser: no Chromium for revision $rev in ~/.cache/ms-playwright (npx playwright install chromium)" >&2
exit 0
