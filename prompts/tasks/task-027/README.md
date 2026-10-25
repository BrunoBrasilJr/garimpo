# TASK-027 — Implementar trocas, ofertas e prazos

MODELO PARA USO FUTURO. A solicitação de 2026-10-25 autoriza apenas gerar estes documentos. Ler, copiar ou receber este arquivo não autoriza executar a TASK. Exigir autorização explícita futura do responsável, específica à TASK ou continuidade expressa, antes de iniciar. Gate aprovado habilita somente a próxima etapa da mesma TASK; não autoriza a próxima TASK. Não executar automaticamente a etapa seguinte.

## Objetivo, contexto e dependências

Estado inicial em 2026-10-25: BLOCKED; fase PHASE-04; prioridade HIGH. Nenhuma TASK foi executada. Não há Git, código, manifests, banco ou testes de aplicação nesta pasta. Caminhos técnicos são futuros, sujeitos à stack ratificada; seis ADRs PROPOSED.

Objetivo específico: Criar espera de 30 dias pós-conferência, busca antecipada, oferta/reserva 48h, aceite/recusa, conversão, remessas e nova janela por substituto.

Descrição operacional: Espera 30 dias após conferência favorável; busca antecipada permitida. Oferta no dia 29 conserva 48h completas e suspende conversão; aceite mantém reserva até inspeção/envio. Recusa/expiração/postagem vencida/rejeição liberam. Conversão não autoriza estorno; troca não cria venda nem review extra; nova janela na entrega do substituto.

Dependências/predecessoras diretas: TASK-026. Conferir seus artefatos e relatórios, não só estados. Bloqueadoras iniciais: TASK-026.

Rastreabilidade: RF-016, RF-018, RF-020, RF-024; RN-001, RN-003, RN-004, RN-006, RN-013, RN-015, RN-019, RN-020, RN-021, RN-022, RN-023, RN-024, RN-027, RN-028, RN-032, RN-033, RN-034, RN-035, RN-038, RN-039, RN-040, RN-041, RN-042, RN-045; RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-010, RNF-011; UC-016, UC-018, UC-020, UC-024. ADRs: ADR-003, ADR-004.

Pendências ligadas à tarefa (PD-005 também condiciona os módulos técnicos):

| ID | Decisão necessária | Tarefas afetadas |
| --- | --- | --- |
| PD-005 | Parâmetros técnicos: Ratificar stack herdada, versões, sessão, hash, proteção das mensagens, armazenamento, prazo de links de alteração/reativação e estratégia transacional. Reset 30min, confirmação inicial 24h e limites de imagens já decididos. | TASK-001 e módulos dependentes |

Matriz de domínio/API do README (referência de análise, não expansão de escopo):

| RF | RNs | RNFs | UC | Entidades | API | Testes | TASKs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RF-016 | RN-020, RN-022, RN-023, RN-028, RN-032, RN-034, RN-035, RN-040, RN-041, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010, RNF-011 | UC-016 | ExchangeRequest, ExchangeItem, SubstituteOffer, OrderUnit, Reservation, Shipment, Evidence | API-016.* | TEST-016 | TASK-027, TASK-028, TASK-033 |
| RF-018 | RN-001, RN-004, RN-006, RN-013, RN-019, RN-021, RN-022, RN-024, RN-027, RN-032, RN-035, RN-038, RN-039 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-018 | Offer, StockMovement, Reservation, Edition | API-018.* | TEST-018 | TASK-009, TASK-016, TASK-019, TASK-023, TASK-025, TASK-026, TASK-027, TASK-033, TASK-034 |
| RF-020 | RN-001, RN-015, RN-019, RN-023, RN-032, RN-040 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-020 | Order, OrderStatusEvent, Shipment, ExternalInteraction | API-020.* | TEST-020 | TASK-021, TASK-025, TASK-026, TASK-027, TASK-033 |
| RF-024 | RN-003, RN-024, RN-032, RN-033, RN-042 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-024 | DomainEvent, DemoMessage, EmailToken | API-024.* | TEST-024 | TASK-005, TASK-012, TASK-019, TASK-021, TASK-025, TASK-026, TASK-027, TASK-033 |

Critérios de aceite da fonte: Oferta dia 29 tem 48h completas; recusa/expiração libera; aceite não envia antes da inspeção; conversão não autoriza dinheiro; postagem expirada/rejeição libera reserva; não gera venda/avaliação extra.

## Análise dos impactos previstos

INFERÊNCIA documental a partir de Allowed Changes; confirmar componentes/métodos reais no planejamento futuro. Não amplia o Scope Guard nem afirma implementação.

| Dimensão | Impacto e limite |
| --- | --- |
| Arquitetura | Aplicar fronteiras e ADRs ratificados aos componentes permitidos; alteração relevante exige decisão/ADR. |
| Banco de dados | Mudança restrita às tabelas/modelos expressamente enumerados em Allowed Changes; sem ampliação de migration. |
| API | Implementar apenas operações ativas do incremento nos módulos/contratos permitidos; conferir IDs API e respostas na matriz acima. |
| Interface | Nenhuma tela no escopo primário; interação manual serve como evidência quando aplicável. |
| Segurança | Verificar papéis/propriedade, sessão, arquivos, logs e segredos conforme superfícies desta TASK; não alterar comportamento de segurança como incidental. |
| Testes | Roteiro manual desta pasta mais gates automatizados aplicáveis, no recorte do incremento; checkpoints acumulam evidências da fase. |

## Sequência de execução

| Ordem | Etapa | Arquivo | GATE | Dependência |
| ---: | --- | --- | --- | --- |
| 001 | Recontextualização e prontidão | [prompt-task-027-etapa-001-recontextualizacao-prontidao.md](prompt-task-027-etapa-001-recontextualizacao-prontidao.md) | GATE-001 | — |
| 002 | Planejamento e pré-condições | [prompt-task-027-etapa-002-planejamento.md](prompt-task-027-etapa-002-planejamento.md) | GATE-002 | GATE-001 |
| 003 | Implementação restrita | [prompt-task-027-etapa-003-implementacao.md](prompt-task-027-etapa-003-implementacao.md) | GATE-003 | GATE-002 |
| 004 | Revisão de escopo e qualidade | [prompt-task-027-etapa-004-revisao.md](prompt-task-027-etapa-004-revisao.md) | GATE-004 | GATE-003 |
| 005 | Testes manuais pelo responsável | [prompt-task-027-etapa-005-testes-manuais.md](prompt-task-027-etapa-005-testes-manuais.md) | GATE-005 | GATE-004 |
| 006 | Conclusão controlada | [prompt-task-027-etapa-006-conclusao.md](prompt-task-027-etapa-006-conclusao.md) | GATE-006 | GATE-005 |

Estado inicial dos 6 gates: PENDENTE / NÃO EXECUTADO. Nenhum habilitado por esta geração. Cada gate depende do anterior aprovado com evidência atual; falha invalida dependentes. Não avançar automaticamente.

## Escopo e conclusão

Allowed Changes:

- apps/api/src/modules/aftersales/exchanges/**
- apps/api/src/modules/refunds/** origem troca
- apps/api/src/modules/inventory/** reserva de troca
- apps/api/prisma/** somente trocas
- packages/contracts/aftersales/** trocas
- tests/aftersales/exchanges/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/src/modules/aftersales/shared/** reutilização de postagem/evidência/interação
- apps/api/src/modules/messaging/** eventos de troca
- apps/api/prisma/** somente SubstituteOffer e remessas/linha histórica de troca

Forbidden Changes:

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

Incidental Changes Policy: MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

Definition of Done: Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

Concluir somente com gates locais e globais aplicáveis aprovados, aceite verificado, testes manuais do responsável aprovados e relatório integral de AGENTS. Próxima TASK exige autorização própria. Estados canônicos continuam os do backlog; aguardo de testes é subestado IN_REVIEW, não DONE.

## Testes manuais previstos

TEST-016, TEST-018, TEST-020, TEST-024.

[Roteiro manual com 9 casos agrupados, ainda não executados](roteiro-testes-manuais.md). Comandos de aplicação e fixtures concretas ainda ausentes; preencher no planejamento futuro com tecnologia existente. Não criar scripts sem necessidade/comando/escopo real. Testes automáticos aplicáveis complementam os passos manuais.

## Fontes atuais

[TASKS](../../../TASKS.md), [AGENTS](../../../AGENTS.md), [README](../../../README.md), [conciliação](../../../docs/architecture/conciliacao.md), [testes](../../../docs/architecture/testing.md), [parâmetros](../../../docs/architecture/parametros.md). Se fonte mudar, revalidar retrato antes de executar; este índice não substitui o backlog.
