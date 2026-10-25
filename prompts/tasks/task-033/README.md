# TASK-033 — Executar aceitação funcional e acessibilidade

MODELO PARA USO FUTURO. A solicitação de 2026-10-25 autoriza apenas gerar estes documentos. Ler, copiar ou receber este arquivo não autoriza executar a TASK. Exigir autorização explícita futura do responsável, específica à TASK ou continuidade expressa, antes de iniciar. Gate aprovado habilita somente a próxima etapa da mesma TASK; não autoriza a próxima TASK. Não executar automaticamente a etapa seguinte.

## Objetivo, contexto e dependências

Estado inicial em 2026-10-25: BLOCKED; fase PHASE-05; prioridade HIGH. Nenhuma TASK foi executada. Não há Git, código, manifests, banco ou testes de aplicação nesta pasta. Caminhos técnicos são futuros, sujeitos à stack ratificada; seis ADRs PROPOSED.

Objetivo específico: Validar requisitos e fluxos nos clientes/plataformas definidos, teclado/foco/contraste web e leitor/ampliação mobile.

Descrição operacional: Aceitação funcional e acessibilidade em plataformas PD-002, rubrica PD-003 quando necessária. Cobrir TEST-001 a TEST-025 e TEST-032 a TEST-035 do aceite, inclusive TEST-025 omitido da enumeração Testes necessários. Registrar teclado/foco/contraste e leitor/ampliação sem alegar certificação não aferida.

Dependências/predecessoras diretas: TASK-032. Conferir seus artefatos e relatórios, não só estados. Bloqueadoras iniciais: TASK-032.

Rastreabilidade: RF-001, RF-002, RF-003, RF-004, RF-005, RF-006, RF-007, RF-008, RF-009, RF-010, RF-011, RF-012, RF-013, RF-014, RF-015, RF-016, RF-017, RF-018, RF-019, RF-020, RF-021, RF-022, RF-023, RF-024, RF-026, RF-027, RF-028, RF-029; RN-001, RN-002, RN-003, RN-004, RN-005, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-014, RN-015, RN-016, RN-017, RN-018, RN-019, RN-020, RN-021, RN-022, RN-023, RN-024, RN-025, RN-026, RN-027, RN-028, RN-029, RN-030, RN-032, RN-033, RN-034, RN-035, RN-036, RN-037, RN-038, RN-039, RN-040, RN-041, RN-042, RN-043, RN-044, RN-045; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-010, RNF-011; UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007, UC-008, UC-009, UC-010, UC-011, UC-012, UC-013, UC-014, UC-015, UC-016, UC-017, UC-018, UC-019, UC-020, UC-021, UC-022, UC-023, UC-024, UC-026, UC-027, UC-028, UC-029. ADRs: ADR-001, ADR-002.

Pendências ligadas à tarefa (PD-005 também condiciona os módulos técnicos):

| ID | Decisão necessária | Tarefas afetadas |
| --- | --- | --- |
| PD-002 | Ambiente e plataformas: Confirmar plataforma mobile, navegadores, publicação/local, infraestrutura e transporte. Android exclusivo, LAN e HTTP não são fatos aprovados. | TASK-001, TASK-002, TASK-033 |
| PD-003 | Exigências adicionais: Confirmar rubrica e eventuais exigências formais de acessibilidade/implantação; preservar critérios de projeto já definidos. | TASK-033, TASK-037 |
| PD-005 | Parâmetros técnicos: Ratificar stack herdada, versões, sessão, hash, proteção das mensagens, armazenamento, prazo de links de alteração/reativação e estratégia transacional. Reset 30min, confirmação inicial 24h e limites de imagens já decididos. | TASK-001 e módulos dependentes |

Matriz de domínio/API do README (referência de análise, não expansão de escopo):

| RF | RNs | RNFs | UC | Entidades | API | Testes | TASKs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RF-001 | RN-001, RN-002, RN-029, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-001 | User, EmailToken | API-001.* | TEST-001 | TASK-004, TASK-005, TASK-006, TASK-033 |
| RF-002 | RN-001, RN-028, RN-029, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-002 | User, Session | API-002.* | TEST-002 | TASK-004, TASK-006, TASK-022, TASK-033 |
| RF-003 | RN-003, RN-032, RN-033 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-003 | User, PasswordReset, Session, DemoMessage | API-003.* | TEST-003 | TASK-005, TASK-006, TASK-033 |
| RF-004 | RN-002, RN-032, RN-044 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-004 | User, Address, EmailToken | API-004.* | TEST-004 | TASK-004, TASK-006, TASK-022, TASK-033 |
| RF-005 | RN-004, RN-032, RN-036 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008 | UC-005 | Edition, Artist, Track, TrackArtist, Genre, Offer | API-005.* | TEST-005 | TASK-008, TASK-010, TASK-011, TASK-033 |
| RF-006 | RN-004, RN-005, RN-026, RN-032, RN-036, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010 | UC-006 | Edition, Track, Offer, ProductImage | API-006.* | TEST-006 | TASK-008, TASK-010, TASK-011, TASK-033 |
| RF-007 | RN-032, RN-037 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-007 | WishlistEntry, Edition, User | API-007.* | TEST-007 | TASK-012, TASK-033 |
| RF-008 | RN-024, RN-032, RN-037 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011 | UC-008 | AvailabilityAlert, DomainEvent, DemoMessage, Offer | API-008.* | TEST-008 | TASK-012, TASK-023, TASK-033 |
| RF-009 | RN-025, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-009 | Review, ReviewRevision, OrderItem, OrderUnit | API-009.* | TEST-009 | TASK-013, TASK-023, TASK-026, TASK-033 |
| RF-010 | RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-028, RN-032, RN-035 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011 | UC-010 | Cart, CartItem, Checkout, CheckoutItem, Reservation | API-010.* | TEST-010 | TASK-016, TASK-017, TASK-018, TASK-023, TASK-033, TASK-034 |
| RF-011 | RN-002, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-013, RN-014, RN-016, RN-017, RN-018, RN-032, RN-033 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011 | UC-011 | Checkout, Order, OrderItem, CouponUsage, FreightRate, Reservation | API-011.* | TEST-011 | TASK-018, TASK-020, TASK-033, TASK-034 |
| RF-012 | RN-010, RN-011, RN-012, RN-013, RN-017, RN-028, RN-032, RN-033, RN-039, RN-041 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-012 | PaymentAttempt, PaymentCharge, Checkout, Order, Refund, RefundAttempt | API-012.* | TEST-012 | TASK-019, TASK-020, TASK-023, TASK-025, TASK-033, TASK-034 |
| RF-013 | RN-015, RN-032, RN-033 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-013 | Order, OrderItem, OrderStatusEvent, Shipment, Refund | API-013.* | TEST-013 | TASK-021, TASK-033 |
| RF-014 | RN-011, RN-017, RN-019, RN-032, RN-039, RN-041 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-014 | CancellationRequest, OrderUnit, PaymentCharge, Refund, StockMovement | API-014.* | TEST-014 | TASK-019, TASK-022, TASK-025, TASK-028, TASK-033 |
| RF-015 | RN-018, RN-019, RN-020, RN-021, RN-028, RN-032, RN-034, RN-040, RN-041, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010, RNF-011 | UC-015 | ReturnRequest, ReturnItem, OrderUnit, Refund, Evidence, Shipment | API-015.* | TEST-015 | TASK-026, TASK-028, TASK-033 |
| RF-016 | RN-020, RN-022, RN-023, RN-028, RN-032, RN-034, RN-035, RN-040, RN-041, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010, RNF-011 | UC-016 | ExchangeRequest, ExchangeItem, SubstituteOffer, OrderUnit, Reservation, Shipment, Evidence | API-016.* | TEST-016 | TASK-027, TASK-028, TASK-033 |
| RF-017 | RN-001, RN-004, RN-005, RN-026, RN-027, RN-032, RN-036, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010 | UC-017 | Edition, Track, TrackArtist, Offer, ProductImage | API-017.* | TEST-017 | TASK-008, TASK-009, TASK-023, TASK-033 |
| RF-018 | RN-001, RN-004, RN-006, RN-013, RN-019, RN-021, RN-022, RN-024, RN-027, RN-032, RN-035, RN-038, RN-039 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-018 | Offer, StockMovement, Reservation, Edition | API-018.* | TEST-018 | TASK-009, TASK-016, TASK-019, TASK-023, TASK-025, TASK-026, TASK-027, TASK-033, TASK-034 |
| RF-019 | RN-008, RN-016, RN-017, RN-018, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-019 | Promotion, Coupon, CouponTarget, CouponUsage | API-019.* | TEST-019 | TASK-014, TASK-016, TASK-018, TASK-019, TASK-023, TASK-033, TASK-034 |
| RF-020 | RN-001, RN-015, RN-019, RN-023, RN-032, RN-040 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-020 | Order, OrderStatusEvent, Shipment, ExternalInteraction | API-020.* | TEST-020 | TASK-021, TASK-025, TASK-026, TASK-027, TASK-033 |
| RF-021 | RN-001, RN-028, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-021 | User, Session, Checkout, Order, AuditLog | API-021.* | TEST-021 | TASK-022, TASK-023, TASK-033, TASK-034 |
| RF-022 | RN-001, RN-025, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-022 | Review, ReviewRevision, AuditLog | API-022.* | TEST-022 | TASK-013, TASK-026, TASK-033 |
| RF-023 | RN-018, RN-021, RN-030, RN-032, RN-034 | RNF-001, RNF-003, RNF-004, RNF-005 | UC-023 | Order, OrderUnit, Refund, FinancialEvent, Genre | API-023.* | TEST-023 | TASK-029, TASK-033, TASK-034 |
| RF-024 | RN-003, RN-024, RN-032, RN-033, RN-042 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-024 | DomainEvent, DemoMessage, EmailToken | API-024.* | TEST-024 | TASK-005, TASK-012, TASK-019, TASK-021, TASK-025, TASK-026, TASK-027, TASK-033 |
| RF-026 | RN-001, RN-029, RN-032, RN-044 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-026 | User, Session, EmailToken, AuditLog | API-026.* | TEST-032 | TASK-004, TASK-005, TASK-006, TASK-033 |
| RF-027 | RN-032, RN-043 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-027 | User, Session, EmailToken, Checkout, Order | API-027.* | TEST-033 | TASK-022, TASK-023, TASK-033 |
| RF-028 | RN-002, RN-032, RN-044 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-028 | User, EmailToken, DemoMessage | API-028.* | TEST-034 | TASK-004, TASK-005, TASK-006, TASK-022, TASK-033 |
| RF-029 | RN-014, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-029 | FreightRate, CepRange, AuditLog | API-029.* | TEST-035 | TASK-018, TASK-033 |

Critérios de aceite da fonte: TEST-001 a TEST-025 e TEST-032 a TEST-035 funcionais cobertos; todos os cenários aplicáveis do PDF têm evidência; nenhuma certificação não aferida.

## Análise dos impactos previstos

INFERÊNCIA documental a partir de Allowed Changes; confirmar componentes/métodos reais no planejamento futuro. Não amplia o Scope Guard nem afirma implementação.

| Dimensão | Impacto e limite |
| --- | --- |
| Arquitetura | Decisão documental ou verificação das fronteiras vigentes; nenhuma alteração de produção autorizada. |
| Banco de dados | Nenhuma migration no escopo primário; consultas/fixtures de teste somente quando necessárias ao cenário, sem dados de produção. |
| API | Consumir ou verificar contratos existentes quando aplicável; não criar endpoint fora do escopo. |
| Interface | Nenhuma tela no escopo primário; interação manual serve como evidência quando aplicável. |
| Segurança | Verificar papéis/propriedade, sessão, arquivos, logs e segredos conforme superfícies desta TASK; não alterar comportamento de segurança como incidental. |
| Testes | Roteiro manual desta pasta mais gates automatizados aplicáveis, no recorte do incremento; checkpoints acumulam evidências da fase. |

## Sequência de execução

| Ordem | Etapa | Arquivo | GATE | Dependência |
| ---: | --- | --- | --- | --- |
| 001 | Recontextualização e prontidão | [prompt-task-033-etapa-001-recontextualizacao-prontidao.md](prompt-task-033-etapa-001-recontextualizacao-prontidao.md) | GATE-001 | — |
| 002 | Planejamento e pré-condições | [prompt-task-033-etapa-002-planejamento.md](prompt-task-033-etapa-002-planejamento.md) | GATE-002 | GATE-001 |
| 003 | Preparação da validação | [prompt-task-033-etapa-003-preparacao-validacao.md](prompt-task-033-etapa-003-preparacao-validacao.md) | GATE-003 | GATE-002 |
| 004 | Revisão de escopo e qualidade | [prompt-task-033-etapa-004-revisao.md](prompt-task-033-etapa-004-revisao.md) | GATE-004 | GATE-003 |
| 005 | Testes manuais pelo responsável | [prompt-task-033-etapa-005-testes-manuais.md](prompt-task-033-etapa-005-testes-manuais.md) | GATE-005 | GATE-004 |
| 006 | Conclusão controlada | [prompt-task-033-etapa-006-conclusao.md](prompt-task-033-etapa-006-conclusao.md) | GATE-006 | GATE-005 |

Estado inicial dos 6 gates: PENDENTE / NÃO EXECUTADO. Nenhum habilitado por esta geração. Cada gate depende do anterior aprovado com evidência atual; falha invalida dependentes. Não avançar automaticamente.

## Escopo e conclusão

Allowed Changes:

- tests/e2e/acceptance/**
- tests/accessibility/**
- docs/validation/acceptance.md
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

Forbidden Changes:

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.
- Alterar código de produção; falhas exigem tarefa de correção e revalidação.

Incidental Changes Policy: NO_INCIDENTAL_CHANGES

Nenhuma mudança fora do escopo primário é permitida nesta tarefa.

Definition of Done: Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

Concluir somente com gates locais e globais aplicáveis aprovados, aceite verificado, testes manuais do responsável aprovados e relatório integral de AGENTS. Próxima TASK exige autorização própria. Estados canônicos continuam os do backlog; aguardo de testes é subestado IN_REVIEW, não DONE.

## Testes manuais previstos

TEST-001, TEST-002, TEST-003, TEST-004, TEST-005, TEST-006, TEST-007, TEST-008, TEST-009, TEST-010, TEST-011, TEST-012, TEST-013, TEST-014, TEST-015, TEST-016, TEST-017, TEST-018, TEST-019, TEST-020, TEST-021, TEST-022, TEST-023, TEST-024, TEST-025, TEST-032, TEST-033, TEST-034, TEST-035.

[Roteiro manual com 59 casos agrupados, ainda não executados](roteiro-testes-manuais.md). Comandos de aplicação e fixtures concretas ainda ausentes; preencher no planejamento futuro com tecnologia existente. Não criar scripts sem necessidade/comando/escopo real. Testes automáticos aplicáveis complementam os passos manuais.

## Fontes atuais

[TASKS](../../../TASKS.md), [AGENTS](../../../AGENTS.md), [README](../../../README.md), [conciliação](../../../docs/architecture/conciliacao.md), [testes](../../../docs/architecture/testing.md), [parâmetros](../../../docs/architecture/parametros.md). Se fonte mudar, revalidar retrato antes de executar; este índice não substitui o backlog.
