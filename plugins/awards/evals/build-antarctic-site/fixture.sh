#!/usr/bin/env bash
# Stages dependencies and a headless Chromium so the hero probe, captures and jury can run in the
# sandbox (runs only with `claude plugin eval --scaffold`).
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
bash "$here/../stage-browser.sh"
