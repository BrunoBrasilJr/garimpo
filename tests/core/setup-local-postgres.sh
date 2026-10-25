#!/usr/bin/env bash
set -euo pipefail
umask 077
if [ "$(uname -s)" != Linux ] || [ "$(id -u)" = 0 ]; then
  echo 'Execute como usuário normal no Ubuntu WSL, não como root.'; exit 1
fi
export PATH="/usr/lib/postgresql/17/bin:$HOME/.local/share/garimpo/node-v24.22.1-linux-x64/bin:$PATH"
postgres --version | grep -q 'PostgreSQL) 17\.' || { echo 'Instale PostgreSQL 17 pelo PGDG oficial antes.'; exit 1; }
task_pg_root="$HOME/.local/share/garimpo/postgres17"
if [ -e "$task_pg_root" ]; then
  if [ ! -f "$task_pg_root/data/PG_VERSION" ] || [ "$(cat "$task_pg_root/data/PG_VERSION")" != 17 ] ||
     [ ! -f "$task_pg_root/environment.sh" ] || [ "$(stat -c %u "$task_pg_root")" != "$(id -u)" ]; then
    echo 'Diretório existente não reconhecido. Nenhuma alteração realizada.'; exit 1
  fi
  if [ "$(stat -c %a "$task_pg_root")" != 700 ] || [ "$(stat -c %a "$task_pg_root/environment.sh")" != 600 ]; then
    echo 'Permissões do ambiente divergentes; revisar antes de reutilizar.'; exit 1
  fi
  if ! pg_ctl -D "$task_pg_root/data" status >/dev/null; then
    pg_ctl -D "$task_pg_root/data" -l "$task_pg_root/server.log" -w start
  fi
  echo 'Cluster existente reconhecido e preservado; nenhuma base, senha ou dado recriado.'
  exit 0
fi
mkdir -p "$task_pg_root"
chmod 700 "$task_pg_root"
initdb -D "$task_pg_root/data" --auth-local=peer --auth-host=scram-sha-256 --no-locale --encoding=UTF8 > "$task_pg_root/init.log"
printf "\nlisten_addresses = '127.0.0.1'\nport = 55432\nunix_socket_directories = '%s'\n" "$task_pg_root" >> "$task_pg_root/data/postgresql.conf"
pg_ctl -D "$task_pg_root/data" -l "$task_pg_root/server.log" -w start
TASK_DEV_PASSWORD="$(node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("hex"))')"
TASK_TEST_PASSWORD="$(node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("hex"))')"
psql -h "$task_pg_root" -p 55432 -d postgres -v ON_ERROR_STOP=1 -v dev_password="$TASK_DEV_PASSWORD" -v test_password="$TASK_TEST_PASSWORD" > "$task_pg_root/provision.log" <<'SQL'
CREATE ROLE garimpo_dev LOGIN PASSWORD :'dev_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;
CREATE ROLE garimpo_test LOGIN PASSWORD :'test_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;
CREATE DATABASE garimpo_dev OWNER garimpo_dev;
CREATE DATABASE garimpo_test OWNER garimpo_test;
REVOKE CONNECT ON DATABASE garimpo_dev FROM PUBLIC;
REVOKE CONNECT ON DATABASE garimpo_test FROM PUBLIC;
SQL
printf 'export DATABASE_URL=%q\nexport TEST_DATABASE_URL=%q\n' "postgresql://garimpo_dev:$TASK_DEV_PASSWORD@127.0.0.1:55432/garimpo_dev" "postgresql://garimpo_test:$TASK_TEST_PASSWORD@127.0.0.1:55432/garimpo_test" > "$task_pg_root/environment.sh"
chmod 600 "$task_pg_root/environment.sh"
echo 'Cluster criado em loopback:55432; bases/credenciais separadas e protegidas fora do Git.'
