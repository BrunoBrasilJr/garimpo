#!/usr/bin/env bash
set -euo pipefail
umask 077
export PATH="/usr/lib/postgresql/17/bin:$HOME/.local/share/garimpo/node-v24.22.1-linux-x64/bin:$PATH"
source "$HOME/.local/share/garimpo/postgres17/environment.sh"
if ! pg_isready -h 127.0.0.1 -p 55432 >/dev/null; then
  pg_ctl -D "$HOME/.local/share/garimpo/postgres17/data" -l "$HOME/.local/share/garimpo/postgres17/server.log" -w -t 120 start
fi
cd "$(dirname -- "${BASH_SOURCE[0]}")/../.."
node scripts/restore-validation/run.mjs
