#!/usr/bin/env bash
# Stages the recipe dependencies (vite, gsap, lenis, three…), Playwright and a headless Chromium
# into the eval workspace ($PWD). Sourced by fixture.sh of cases that need a browser: the eval
# sandbox hides the user's home, npm and the network, so captures need everything local.
# Best effort: a missing piece is reported and the case still runs (it then ends in `recapture`).
plugin="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
# The real home (the eval sandbox may point HOME elsewhere): getent on Linux, dscl on macOS, else $HOME.
real_home="$(getent passwd "$(id -un)" 2>/dev/null | cut -d: -f6)"
[ -z "$real_home" ] && command -v dscl >/dev/null && real_home="$(dscl . -read "/Users/$(id -un)" NFSHomeDirectory 2>/dev/null | awk '{print $2}')"
[ -z "$real_home" ] && real_home="$HOME"
# Playwright's browser cache: PLAYWRIGHT_BROWSERS_PATH when set, else the platform default.
case "$(uname -s)" in
  Darwin) cache="$real_home/Library/Caches/ms-playwright" ;;
  *) cache="$real_home/.cache/ms-playwright" ;;
esac
[ -n "${PLAYWRIGHT_BROWSERS_PATH:-}" ] && [ "$PLAYWRIGHT_BROWSERS_PATH" != "0" ] && cache="$PLAYWRIGHT_BROWSERS_PATH"
mkdir -p node_modules .awards/browsers
[ -d "$plugin/recipes/node_modules" ] && cp -R "$plugin/recipes/node_modules/." node_modules/ \
  || echo "stage-browser: recipes/node_modules missing (run npm install in recipes/)" >&2
# A Playwright counts only when its pinned headless Chromium is installed in the browser cache.
# The eval runner passes no environment to the fixture, so also look in the npx cache (newest first).
pw="" src=""
for d in "${AWARDS_PLAYWRIGHT:-}" "$plugin/recipes" "$(npm root -g 2>/dev/null)/.." $(ls -dt "$real_home"/.npm/_npx/*/ 2>/dev/null); do
  d="${d%/}"
  [ -n "$d" ] && [ -f "$d/node_modules/playwright-core/browsers.json" ] || continue
  rev="$(node -e "const b=require('$d/node_modules/playwright-core/browsers.json').browsers;console.log((b.find(x=>x.name==='chromium-headless-shell')||b.find(x=>x.name==='chromium')).revision)")"
  for c in "chromium_headless_shell-$rev" "chromium-$rev"; do
    [ -d "$cache/$c" ] && { pw="$d/node_modules"; src="$cache/$c"; break 2; }
  done
done
if [ -z "$pw" ]; then echo "stage-browser: no Playwright with an installed Chromium (npx playwright install chromium)" >&2; exit 0; fi
cp -R "$pw/playwright-core" node_modules/
[ -d "$pw/playwright" ] && cp -R "$pw/playwright" node_modules/
cp -R "$src" .awards/browsers/
exit 0
