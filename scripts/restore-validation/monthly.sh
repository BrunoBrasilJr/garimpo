#!/usr/bin/env bash
set -euo pipefail
umask 077
export PATH="/usr/lib/postgresql/17/bin:$HOME/.local/share/garimpo/node-v24.22.1-linux-x64/bin:$PATH"
source "$HOME/.local/share/garimpo/postgres17/environment.sh"
pg_data="$HOME/.local/share/garimpo/postgres17/data"
pg_log="$HOME/.local/share/garimpo/postgres17/server.log"
report_root="$HOME/.local/share/garimpo/restore-validation-logs"
mkdir -p -m 700 "$report_root"
test ! -L "$report_root"
report=$(mktemp "$report_root/monthly-XXXXXXXX.log")
if ! pg_isready -h 127.0.0.1 -p 55432 >/dev/null; then
  # A daily backup or an earlier invocation may already be starting recovery.
  if ! pg_ctl -D "$pg_data" status >/dev/null; then
    pg_ctl -D "$pg_data" -l "$pg_log" -W start >>"$report" 2>&1
  fi
  for ((attempt=0; attempt<120; attempt++)); do
    if pg_isready -h 127.0.0.1 -p 55432 >/dev/null; then break; fi
    sleep 5
  done
  if ! pg_isready -h 127.0.0.1 -p 55432 >/dev/null; then
    printf '%s\n' RESTORE_POSTGRES_NOT_READY | tee -a "$report" >&2
    exit 1
  fi
fi
cd "$(dirname -- "${BASH_SOURCE[0]}")/../.."
node scripts/restore-validation/run.mjs 2>&1 | tee -a "$report"
