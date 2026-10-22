#!/usr/bin/env bash
# Seeds the workspace with a build stopped after the visual system (runs only with `claude plugin eval --scaffold`).
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
cp -R "$here/fixture/." "$PWD/"
