#!/usr/bin/env bash
# Seeds the empty eval workspace with this case's fixture site, at the path the prompt names
# (runs only with `claude plugin eval --scaffold`). add_dirs cannot do this: it grants a read on a
# directory inside the case, it does not put anything in the working directory.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
mkdir -p "$PWD/fixture"
cp -R "$here/fixture/." "$PWD/fixture/"
