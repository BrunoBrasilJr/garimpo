# Checkpoint PHASE-04 — TASK-032

Iniciado em 2026-11-07, branch chore/TASK-032-checkpoint-phase04, base 0a2a168.
TASK-025 a 031 DONE, incluindo as correções de notificações 026/027 e revisão
de segurança integrada. ADR-001 a 006 aceitos. Autorização contínua até 100%.
Este checkpoint modifica somente este documento e TASKS.md.

## Plano acumulado

Ambiente Ubuntu WSL2, Node 24.22.1/npm 11.19.1 e PostgreSQL 17 loopback.
Schemas novos por runner em garimpo_test, retidos, sem reset da base original.
Firefox real com CA isolada confiada, sem ignorar erros HTTPS.

Executar npm run verify, node tests/security/run.mjs, Playwright com configurações
tests/e2e/aftersales e tests/reports, exportações Android e iOS. Gerar o preview
RNW de tests/orders/mobile-entry.tsx depois do build web que limpa dist.
Logs locais em test-results/phase-04; o resultado só será consolidado após saída.

| RN-042 | Evidência executável acumulada |
| --- | --- |
| Acesso: confirmação, reset, alteração e reativação | tests/messaging/access.integration.ts; tests/accounts/lifecycle/lifecycle.integration.ts |
| Criação, pagamento, expiração, estorno aprovado/falho e repetição | tests/payments/payments.integration.ts; tests/aftersales/cancellations/cancellations.integration.ts |
| Postagem e entrega; silêncio em preparação/separação | tests/orders/orders.integration.ts |
| Cancelamento de pendentes por restrição da conta | tests/accounts/lifecycle/lifecycle.integration.ts |
| Devolução: abertura, decisão, postagem necessária, recusa e ausência de aviso intermediário | tests/aftersales/returns/returns.integration.ts |
| Troca: abertura, decisão, oferta 48h, envio/entrega e ausência de aviso intermediário | tests/aftersales/exchanges/exchanges.integration.ts |
| Reposição, assinatura persistida e entrega única | tests/engagement/engagement.integration.ts |
| Conteúdo protegido e destinatário/atendimento legítimos | tests/security/access.integration.ts; tests/messaging/access.integration.ts |

Os testes de consumidor drenam eventos reais produzidos pelos cenários, verificam
preparação/entrega idempotente e falha independente do negócio. A revisão 031
registra a falha encontrada e as correções por tarefa de origem. O teste de troca
força respostas e reconciliação da expiração a esperar na mesma identidade no
PostgreSQL; não é uma simulação sequencial de concorrência.

Relatórios usam períodos financeiros e coortes de compra distintos, fotografias
comerciais históricas, cancelamentos e devoluções conhecidos até asOf e gênero
principal. Backup compara dump real, arquivos, referências históricas, evidências,
retenção e retomada; restauração isolada segue TASK-035.

A aceitação integral e acessibilidade seguem TASK-033; carga com metas fixadas
antes da medição segue TASK-034. Bundles/RNW não demonstram execução física,
leitor de tela ou certificação. A recusa do responsável em usar TalkBack é mantida.

## Resultado

Primeira rodada em verify.log: build/tipos/lint e 126 unitários PASS, mas a
fundação terminou com oito PASS e um FAIL. O teste de morte do processo esperava
que a saída do filho significasse liberação imediata da trava no PostgreSQL.
SKIP LOCKED retornou EMPTY corretamente enquanto o servidor encerrava a sessão.
O checkpoint foi FAILED e a correção ficou na tarefa de origem TASK-003:
054c328/36c8a9b, branch fix/TASK-003-crash-recovery-barrier. O teste agora espera
a própria trava com limite de cinco segundos, preservando todas as verificações
de rollback e processamento único. Não houve mudança de código de produção.

core-fix.log: tipos dos testes, lint dirigido e nove integrações PASS, saída 0.
preview.log: componentes móveis de pedidos/pós-venda compilados para o ensaio
RNW, 254 módulos. A retomada em resume.log executa as demais integrações e gates;
build, tipos, lint e unitários do mesmo código de produção não foram repetidos.

IN_PROGRESS. Consolidação pendente dos gates restantes. Incidental Changes: NONE.
