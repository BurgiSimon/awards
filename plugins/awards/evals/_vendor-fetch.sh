#!/usr/bin/env bash
# Fetches GreenSock's gsap-skills plugin, pinned, into evals/_vendor/ for the two coexist-* cases.
# Run once outside the eval sandbox (it needs the network); _vendor/ is gitignored.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
dest="$here/_vendor/gsap-skills"
rev="aed9cfd3277740755f6bfc1155c7aa645403b760"   # main on 2026-04-21, MIT
if [ ! -d "$dest/.git" ]; then
  mkdir -p "$here/_vendor"
  git clone --quiet https://github.com/greensock/gsap-skills "$dest"
fi
git -C "$dest" fetch --quiet origin "$rev" 2>/dev/null || true
git -C "$dest" checkout --quiet "$rev"
echo "gsap-skills at $(git -C "$dest" rev-parse --short HEAD) in $dest"
