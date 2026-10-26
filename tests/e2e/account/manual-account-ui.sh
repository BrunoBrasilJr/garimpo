#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."
if [[ -z "${TEST_DATABASE_URL:-}" ]]; then
  source "$HOME/.local/share/garimpo/postgres17/environment.sh"
fi
mkdir -p test-results/account-ui
evidence="test-results/account-ui/manual-$(date -u +%Y%m%dT%H%M%SZ).log"
{
  node --version
  npm --version
  git rev-parse --short HEAD
  npm run verify
  npm run test:account-ui
  npm run bundle:android
} 2>&1 | tee "$evidence"
echo "Comandos concluídos. Evidência: $evidence"
echo 'Ainda são necessárias as inspeções humanas web/Android descritas no README desta pasta.'
echo 'Este script não aprova interface, acessibilidade ou armazenamento nativo.'
