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
# A Playwright counts only when its pinned headless Chromium is installed in ~/.cache/ms-playwright.
# The eval runner passes no environment to the fixture, so also look in the npx cache (newest first).
pw="" src=""
for d in "${AWARDS_PLAYWRIGHT:-}" "$plugin/recipes" "$(npm root -g 2>/dev/null)/.." $(ls -dt "$real_home"/.npm/_npx/*/ 2>/dev/null); do
  d="${d%/}"
  [ -n "$d" ] && [ -f "$d/node_modules/playwright-core/browsers.json" ] || continue
  rev="$(node -e "const b=require('$d/node_modules/playwright-core/browsers.json').browsers;console.log((b.find(x=>x.name==='chromium-headless-shell')||b.find(x=>x.name==='chromium')).revision)")"
  for c in "chromium_headless_shell-$rev" "chromium-$rev"; do
    [ -d "$real_home/.cache/ms-playwright/$c" ] && { pw="$d/node_modules"; src="$real_home/.cache/ms-playwright/$c"; break 2; }
  done
done
if [ -z "$pw" ]; then echo "stage-browser: no Playwright with an installed Chromium (npx playwright install chromium)" >&2; exit 0; fi
cp -R "$pw/playwright-core" node_modules/
[ -d "$pw/playwright" ] && cp -R "$pw/playwright" node_modules/
cp -R "$src" .awards/browsers/
exit 0
