# TASK-022 — Implementar bloqueio, encerramento e reativação de contas

MODELO PARA USO FUTURO. A solicitação de 2026-10-25 autoriza apenas gerar estes documentos. Ler, copiar ou receber este arquivo não autoriza executar a TASK. Exigir autorização explícita futura do responsável, específica à TASK ou continuidade expressa, antes de iniciar. Gate aprovado habilita somente a próxima etapa da mesma TASK; não autoriza a próxima TASK. Não executar automaticamente a etapa seguinte.

## Objetivo, contexto e dependências

Estado inicial em 2026-10-25: BLOCKED; fase PHASE-03; prioridade HIGH. Nenhuma TASK foi executada. Não há Git, código, manifests, banco ou testes de aplicação nesta pasta. Caminhos técnicos são futuros, sujeitos à stack ratificada; seis ADRs PROPOSED.

Objetivo específico: Implementar gestão de clientes, bloqueio ADMIN e encerramento voluntário com cancelamento de pendentes/reservas; reativação confirmada por e-mail; interfaces correspondentes.

Descrição operacional: ADMIN bloqueia e titular encerra; invalidar sessões, checkout e pedidos pendentes atomicamente, mantendo pagos e atendimento externo. Reativar não remove bloqueio; prazos de link PD-005 e retenção PD-008 definidos antes dos trechos dependentes.

Dependências/predecessoras diretas: TASK-019, TASK-021. Conferir seus artefatos e relatórios, não só estados. Bloqueadoras iniciais: TASK-019, TASK-021.

Rastreabilidade: RF-002, RF-004, RF-014, RF-021, RF-027, RF-028; RN-001, RN-002, RN-011, RN-017, RN-019, RN-028, RN-029, RN-032, RN-039, RN-041, RN-043, RN-044; RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; UC-002, UC-004, UC-014, UC-021, UC-027, UC-028. ADRs: ADR-003, ADR-005.

Pendências ligadas à tarefa (PD-005 também condiciona os módulos técnicos):

| ID | Decisão necessária | Tarefas afetadas |
| --- | --- | --- |
| PD-005 | Parâmetros técnicos: Ratificar stack herdada, versões, sessão, hash, proteção das mensagens, armazenamento, prazo de links de alteração/reativação e estratégia transacional. Reset 30min, confirmação inicial 24h e limites de imagens já decididos. | TASK-001 e módulos dependentes |
| PD-008 | Retenção e backup: Definir retenção de dados pessoais/anonimização e condições após retenção; definir retenção de backups, frequência dos testes e destino. | TASK-022, TASK-030, TASK-035 |

Matriz de domínio/API do README (referência de análise, não expansão de escopo):

| RF | RNs | RNFs | UC | Entidades | API | Testes | TASKs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RF-002 | RN-001, RN-028, RN-029, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-002 | User, Session | API-002.* | TEST-002 | TASK-004, TASK-006, TASK-022, TASK-033 |
| RF-004 | RN-002, RN-032, RN-044 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-004 | User, Address, EmailToken | API-004.* | TEST-004 | TASK-004, TASK-006, TASK-022, TASK-033 |
| RF-014 | RN-011, RN-017, RN-019, RN-032, RN-039, RN-041 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-014 | CancellationRequest, OrderUnit, PaymentCharge, Refund, StockMovement | API-014.* | TEST-014 | TASK-019, TASK-022, TASK-025, TASK-028, TASK-033 |
| RF-021 | RN-001, RN-028, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-021 | User, Session, Checkout, Order, AuditLog | API-021.* | TEST-021 | TASK-022, TASK-023, TASK-033, TASK-034 |
| RF-027 | RN-032, RN-043 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-027 | User, Session, EmailToken, Checkout, Order | API-027.* | TEST-033 | TASK-022, TASK-023, TASK-033 |
| RF-028 | RN-002, RN-032, RN-044 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-028 | User, EmailToken, DemoMessage | API-028.* | TEST-034 | TASK-004, TASK-005, TASK-006, TASK-022, TASK-033 |

Critérios de aceite da fonte: Bloqueio/encerramento negam login e tokens antigos; pagos preservados; bloqueio prevalece na reativação; OPERATOR só consulta. Retenção/anonimização PD-008 resolvida antes de comportamento dependente; não apagar dados por suposição.

## Análise dos impactos previstos

INFERÊNCIA documental a partir de Allowed Changes; confirmar componentes/métodos reais no planejamento futuro. Não amplia o Scope Guard nem afirma implementação.

| Dimensão | Impacto e limite |
| --- | --- |
| Arquitetura | Aplicar fronteiras e ADRs ratificados aos componentes permitidos; alteração relevante exige decisão/ADR. |
| Banco de dados | Nenhuma migration no escopo primário; consultas/fixtures de teste somente quando necessárias ao cenário, sem dados de produção. |
| API | Implementar apenas operações ativas do incremento nos módulos/contratos permitidos; conferir IDs API e respostas na matriz acima. |
| Interface | Mudança nas telas/bootstrap dos clientes expressamente permitidos; administração exclusivamente web. |
| Segurança | Verificar papéis/propriedade, sessão, arquivos, logs e segredos conforme superfícies desta TASK; não alterar comportamento de segurança como incidental. |
| Testes | Roteiro manual desta pasta mais gates automatizados aplicáveis, no recorte do incremento; checkpoints acumulam evidências da fase. |

## Sequência de execução

| Ordem | Etapa | Arquivo | GATE | Dependência |
| ---: | --- | --- | --- | --- |
| 001 | Recontextualização e prontidão | [prompt-task-022-etapa-001-recontextualizacao-prontidao.md](prompt-task-022-etapa-001-recontextualizacao-prontidao.md) | GATE-001 | — |
| 002 | Planejamento e pré-condições | [prompt-task-022-etapa-002-planejamento.md](prompt-task-022-etapa-002-planejamento.md) | GATE-002 | GATE-001 |
| 003 | Implementação restrita | [prompt-task-022-etapa-003-implementacao.md](prompt-task-022-etapa-003-implementacao.md) | GATE-003 | GATE-002 |
| 004 | Revisão de escopo e qualidade | [prompt-task-022-etapa-004-revisao.md](prompt-task-022-etapa-004-revisao.md) | GATE-004 | GATE-003 |
| 005 | Testes manuais pelo responsável | [prompt-task-022-etapa-005-testes-manuais.md](prompt-task-022-etapa-005-testes-manuais.md) | GATE-005 | GATE-004 |
| 006 | Conclusão controlada | [prompt-task-022-etapa-006-conclusao.md](prompt-task-022-etapa-006-conclusao.md) | GATE-006 | GATE-005 |

Estado inicial dos 6 gates: PENDENTE / NÃO EXECUTADO. Nenhum habilitado por esta geração. Cada gate depende do anterior aprovado com evidência atual; falha invalida dependentes. Não avançar automaticamente.

## Escopo e conclusão

Allowed Changes:

- apps/api/src/modules/accounts/blocking*
- apps/api/src/modules/orders/** cancelamento de pendências por bloqueio
- apps/api/src/modules/cart/** liberação por bloqueio
- apps/api/src/modules/inventory/** liberação por bloqueio
- apps/api/src/modules/pricing/** liberação de usos por bloqueio
- apps/web/src/features/admin/customers/**
- packages/contracts/accounts/blocking*
- tests/accounts/blocking/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/src/modules/accounts/closure*
- apps/api/src/modules/accounts/reactivation*
- apps/api/src/modules/accounts/email-change*
- apps/api/src/modules/messaging/** reativação/correção de e-mail
- apps/web/src/features/account/** encerramento/reativação
- apps/mobile/src/features/account/** encerramento/reativação
- tests/accounts/lifecycle/**
- apps/api/src/modules/checkout/** encerramento por bloqueio/fechamento de conta
- packages/contracts/accounts/** encerramento/reativação e estado de conta

Forbidden Changes:

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

Incidental Changes Policy: MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

Definition of Done: Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

Concluir somente com gates locais e globais aplicáveis aprovados, aceite verificado, testes manuais do responsável aprovados e relatório integral de AGENTS. Próxima TASK exige autorização própria. Estados canônicos continuam os do backlog; aguardo de testes é subestado IN_REVIEW, não DONE.

## Testes manuais previstos

TEST-002, TEST-004, TEST-014, TEST-021, TEST-033, TEST-034.

[Roteiro manual com 13 casos agrupados, ainda não executados](roteiro-testes-manuais.md). Comandos de aplicação e fixtures concretas ainda ausentes; preencher no planejamento futuro com tecnologia existente. Não criar scripts sem necessidade/comando/escopo real. Testes automáticos aplicáveis complementam os passos manuais.

## Fontes atuais

[TASKS](../../../TASKS.md), [AGENTS](../../../AGENTS.md), [README](../../../README.md), [conciliação](../../../docs/architecture/conciliacao.md), [testes](../../../docs/architecture/testing.md), [parâmetros](../../../docs/architecture/parametros.md). Se fonte mudar, revalidar retrato antes de executar; este índice não substitui o backlog.
