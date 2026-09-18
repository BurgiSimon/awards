#!/usr/bin/env bash
# Seeds the empty eval workspace with this case's fixture site (runs only with `claude plugin eval --scaffold`).
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
cp -R "$here/fixture/." "$PWD/"
