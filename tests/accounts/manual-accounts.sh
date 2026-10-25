#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p test-results/accounts
task_log="test-results/accounts/manual-$(date -u +%Y%m%dT%H%M%SZ).log"
exec > >(tee "$task_log") 2>&1
if [ "$(uname -s)" != Linux ]; then echo 'Execute no Ubuntu WSL.'; exit 1; fi
export PATH="$HOME/.local/share/garimpo/node-v24.22.1-linux-x64/bin:$PATH"
source "$HOME/.local/share/garimpo/postgres17/environment.sh"
node tests/bootstrap/check-runtime.mjs
node --version
npm --version
git rev-parse --short HEAD
echo 'TASK-004: cadastro, sessão/rotação/logout, perfil/endereço, contas internas e último ADMIN.'
echo 'Clientes de teste HTTPS confiam explicitamente no certificado gerado; sem desativar TLS.'
echo 'Dados sintéticos em schema novo de garimpo_test; nenhum administrador criado na base dev por este roteiro.'
npm run verify
echo "Comandos concluídos. Evidência: $task_log"
echo 'Confira os resultados e envie o log/erros. Executar pelo agente não aprova o teste manual do responsável.'
