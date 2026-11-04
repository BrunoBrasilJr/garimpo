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

Resultados em execução. O pós-venda depende do fechamento deste checkpoint.
