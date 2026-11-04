# Checkpoint PHASE-03 — TASK-024

Execução iniciada em 2026-11-04 na branch chore/TASK-024-checkpoint-phase03,
com base 2ba021f. As tarefas 020 a 023 estão concluídas e os ADRs 001 a 005
estão aceitos. O checkpoint altera este registro e TASKS.md.

A validação usa Node 24.22.1, npm 11.19.1, PostgreSQL 17 e schemas isolados
em garimpo_test. As jornadas usam Firefox com certificados locais verificados.
Gere o build web antes das prévias RNW de carrinho, checkout, pedidos e ciclo de
conta, pois o build limpa dist. Execute npm run verify, as suítes Playwright de
carrinho, frete, checkout, pedidos e ciclo de conta e os bundles Android e iOS.
Os comandos e logs locais ficam em test-results/phase-03.

| Cenário | Recorte da fase |
| --- | --- |
| TEST-026 | Corridas reais de estoque, cupom, limite de pendentes, expiração, pagamento e bloqueio. Confirmação tardia de cartão sem pedido e restituição automática. Cobrança substituída e disputa de pós-venda seguem 025 a 027. |
| TEST-027 | Tempos dos runners são evidência de execução. Metas e ensaio de carga dependem de PD-007 e TASK-034. |
| TEST-028 | Web com teclado, foco, rótulos e viewport estreito. Mobile via RNW e bundles. Validação física e leitor de tela seguem TASK-033. |
| TEST-030 | Sessões, papéis, HTTPS, CSRF, propriedade, histórico e política do toolchain. Evidência privada de pós-venda segue TASK-026. |
| TEST-031 | Expiração após retomada, recibos duráveis e repetição idempotente de mensagens e restituição. Retomada de oferta de troca segue TASK-027. |

Em 2026-11-04, verify.log registrou build, tipos, lint, 126 unitários e
223 integrações aprovados. Os totais de integração foram fundação 9, contas
14, mensagens 16, catálogo 19, estoque 12, engajamento 12, avaliações 11,
preços 12, carrinho 22, checkout 24, pagamentos 32, pedidos 18, ciclo de
conta 16 e composição comercial 6. A política de auditoria passou com os
controles e regressões registrados. O npm audit bruto mantém sete alertas baixos.

A primeira rodada Firefox falhou ao confirmar os valores após aplicar cupom.
A branch fix/TASK-017-coupon-confirmation corrigiu a recarga duplicada no
commit 98452ee. recheck.log, com saída 0, registra build, tipos e lint e
23 jornadas Firefox aprovadas: carrinho 7, frete 3, checkout 6, pedidos 3
e ciclo de conta 4. As jornadas incluem os componentes móveis via RNW. Os
bundles Android (630 módulos) e iOS (632 módulos) foram exportados. Validação
física e leitor de tela seguem TASK-033. O ensaio formal de carga segue TASK-034.

Gates 01 a 08 aprovados no recorte da fase. Os dois arquivos documentais são
PRIMARY. Incidental Changes: NONE. A correção de produção foi revisada em
branch própria no escopo da TASK-017. DoD cumprida.
