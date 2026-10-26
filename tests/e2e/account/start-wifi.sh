#!/usr/bin/env bash
set -euo pipefail
export PATH="$HOME/.local/share/garimpo/node-v24.22.1-linux-x64/bin:$PATH"
cd "$(dirname "$0")/../../.."
source "$HOME/.local/share/garimpo/postgres17/environment.sh"
exec node --experimental-strip-types tests/e2e/account/manual-web.mjs --wifi
