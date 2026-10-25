#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../.."
mkdir -p test-results/bootstrap
log_file="test-results/bootstrap/manual-$(date -u +%Y%m%dT%H%M%SZ).log"
exec > >(tee "$log_file") 2>&1
if [[ "$(uname -s)" != Linux ]]; then
  echo 'Execute este roteiro no Ubuntu WSL.' >&2
  exit 1
fi
command -v node >/dev/null
command -v npm >/dev/null
node tests/bootstrap/check-runtime.mjs
printf 'Ambiente: '; uname -sr
node --version
npm --version
git rev-parse --short HEAD
git status --short
if [[ ! -d node_modules ]]; then
  echo 'Dependências ausentes. Execute npm ci neste diretório e repita.' >&2
  exit 1
fi
for validation in verify bundle:android; do
  printf '\nExecutando npm run %s\n' "$validation"
  npm run "$validation"
done
printf '\nComandos concluídos. Evidência: %s\n' "$log_file"
printf 'Ainda é necessário conferir a página web e o aplicativo no Android. Este script não aprova essa inspeção manual.\n'
