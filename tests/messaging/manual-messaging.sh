#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p test-results/messaging
task_log="test-results/messaging/manual-$(date -u +%Y%m%dT%H%M%SZ).log"
exec > >(tee "$task_log") 2>&1
if [ "$(uname -s)" != Linux ]; then echo 'Execute no Ubuntu WSL.'; exit 1; fi
export PATH="$HOME/.local/share/garimpo/node-v24.22.1-linux-x64/bin:$PATH"
source "$HOME/.local/share/garimpo/postgres17/environment.sh"
node tests/bootstrap/check-runtime.mjs
node --version
npm --version
git rev-parse --short HEAD
echo 'TASK-005: reset 30min, confirmação/mudança 24h, caixa técnica protegida, falha/repetição e consumo concorrente.'
echo 'Somente dados sintéticos e mensagens locais. HTTPS com confiança explícita; relógio controlado; base de teste separada.'
npm run verify
echo "Comandos concluídos. Evidência: $task_log"
echo 'Confira os resultados e envie o log/erros. Execução do agente não aprova a conferência do responsável.'
