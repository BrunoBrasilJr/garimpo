# Frete e pedido inicial — TASK-018

Requer Node 24.22.1/npm 11, dependências do lockfile, PostgreSQL 17 local com
garimpo_test separado e seu ambiente protegido. Para navegador, Firefox do
Playwright, OpenSSL e certutil já usados pela suíte de contas.

Na raiz do checkout Ubuntu:

```sh
source "$HOME/.local/share/garimpo/postgres17/environment.sh"
npm run build
npm run typecheck
npm run lint
npm test
npm run test:checkout
npm run test:cart
npm run test:pricing
npm run audit:toolchain
node node_modules/@playwright/test/cli.js test --config tests/e2e/freight-admin/playwright.config.ts
```

O runner rejeita base de origem e cria schema novo task018 em garimpo_test,
retendo o anterior. Não executar migrate/reset/drop na base original para esta
prova. Configurações de frete, produtos, contas e endereços são sintéticos,
explicitamente criados nos testes; o produto não carrega tabela de frete padrão.
Sem configuração não há cobertura. Contagem de pendentes usa a tabela Order
real, sem porta KNOWN 0. Guardas web/mobile, SQL, dinheiro, reservas e auditoria
usam o código real.

Corridas usam duas conexões independentes com bloqueio testemunhado em
pg_stat_activity antes da liberação, incluindo usado único, recibo de pedido,
edição de versão e faixas sobrepostas. Relógio é injetado por código na fixture,
sem endpoint de ajuste. Falha de auditoria injeta trigger apenas nesse schema;
remover esse trigger ao terminar não apaga tabelas ou dados anteriores.

O navegador confia somente na CA isolada do próprio perfil, sem bypass TLS,
trace, vídeo ou túnel público. Artefatos ignorados ficam em test-results/checkout
e test-results/account-ui; não compartilhar chaves/credenciais. Auditoria bruta
e gate de política continuam resultados separados, sem alegar auditoria limpa.

Em máquina com pouca memória, é possível executar os recortes em processos
separados com `NODE_OPTIONS=--max-old-space-size=512`. Esse limite de heap foi
validado na repetição de carrinho/contas/descontos; não modifica custo de senha,
regras, TLS, banco, timeout dos cenários ou runtime normal da aplicação. Registrar
as tentativas que falharem e o resultado de cada recorte, sem considerar uma
seleção vazia ou uma suíte interrompida como aprovada. Não é aferição de SLA.

Pedido inicial é PENDING com cobrança ACTIVE, sem venda/baixa física ou código
de pagamento fictício. Simulador/expiração de pedido são TASK-019; UI de compra
completa é TASK-020; logística/cancelamento têm tarefas próprias. Os testes
não certificam aparelho, leitor de tela nem integração financeira de produção.
