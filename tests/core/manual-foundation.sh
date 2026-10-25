#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p test-results/core
task_log="test-results/core/manual-$(date -u +%Y%m%dT%H%M%SZ).log"
exec > >(tee "$task_log") 2>&1
if [ "$(uname -s)" != Linux ]; then echo 'Execute no Ubuntu WSL.'; exit 1; fi
export PATH="$HOME/.local/share/garimpo/node-v24.22.1-linux-x64/bin:$PATH"
task_environment="$HOME/.local/share/garimpo/postgres17/environment.sh"
if [ ! -f "$task_environment" ]; then echo 'Ambiente PostgreSQL isolado ausente.'; exit 1; fi
source "$task_environment"
node tests/bootstrap/check-runtime.mjs
node --version
npm --version
git rev-parse --short HEAD
echo 'Fundação: rollback conjunto, idempotência concorrente, erros/auditoria e retomada de outbox.'
echo 'Banco separado garimpo_test; schema novo por execução. Sem reset da base original.'
npm run verify
echo "Comandos concluídos. Evidência: $task_log"
echo 'Confira os resultados e informe ao agente se houve erro. TalkBack não se aplica a esta TASK sem interface.'
