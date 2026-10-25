# TASK-018 — Implementar frete, cotação e pedidos

MODELO PARA USO FUTURO. A solicitação de 2026-10-25 autoriza apenas gerar estes documentos. Ler, copiar ou receber este arquivo não autoriza executar a TASK. Exigir autorização explícita futura do responsável, específica à TASK ou continuidade expressa, antes de iniciar. Gate aprovado habilita somente a próxima etapa da mesma TASK; não autoriza a próxima TASK. Não executar automaticamente a etapa seguinte.

## Objetivo, contexto e dependências

Estado inicial em 2026-10-25: BLOCKED; fase PHASE-03; prioridade CRITICAL. Nenhuma TASK foi executada. Não há Git, código, manifests, banco ou testes de aplicação nesta pasta. Caminhos técnicos são futuros, sujeitos à stack ratificada; seis ADRs PROPOSED.

Objetivo específico: Implementar gestão de frete ADMIN, cobertura por CEP, snapshots e criação Pix/boleto, transferindo reserva e tornando cupom definitivo. Conectar limite de 3 pendentes.

Descrição operacional: Resolver PD-004. ADMIN configura CEP/frete; OPERATOR negado. E-mail confirmado e menos de três pendentes; transferência atômica de reservas e consumo de cupom na criação. Pix 30min/boleto 2 dias integrais da criação. Endereço mantém prazo; CEP não atendido conserva checkout até vencer, impedindo pedido.

Dependências/predecessoras diretas: TASK-016, TASK-014. Conferir seus artefatos e relatórios, não só estados. Bloqueadoras iniciais: TASK-016, TASK-014.

Rastreabilidade: RF-010, RF-011, RF-019, RF-029; RN-002, RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-013, RN-014, RN-016, RN-017, RN-018, RN-028, RN-032, RN-033, RN-035; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011; UC-010, UC-011, UC-019, UC-029. ADRs: ADR-003, ADR-004.

Pendências ligadas à tarefa (PD-005 também condiciona os módulos técnicos):

| ID | Decisão necessária | Tarefas afetadas |
| --- | --- | --- |
| PD-004 | Tabela de frete: Definir faixas de CEP/região, cobertura, preços e prazos; não inventar valores ou cobertura nacional obrigatória. | TASK-018 |
| PD-005 | Parâmetros técnicos: Ratificar stack herdada, versões, sessão, hash, proteção das mensagens, armazenamento, prazo de links de alteração/reativação e estratégia transacional. Reset 30min, confirmação inicial 24h e limites de imagens já decididos. | TASK-001 e módulos dependentes |

Matriz de domínio/API do README (referência de análise, não expansão de escopo):

| RF | RNs | RNFs | UC | Entidades | API | Testes | TASKs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RF-010 | RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-028, RN-032, RN-035 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011 | UC-010 | Cart, CartItem, Checkout, CheckoutItem, Reservation | API-010.* | TEST-010 | TASK-016, TASK-017, TASK-018, TASK-023, TASK-033, TASK-034 |
| RF-011 | RN-002, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-013, RN-014, RN-016, RN-017, RN-018, RN-032, RN-033 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011 | UC-011 | Checkout, Order, OrderItem, CouponUsage, FreightRate, Reservation | API-011.* | TEST-011 | TASK-018, TASK-020, TASK-033, TASK-034 |
| RF-019 | RN-008, RN-016, RN-017, RN-018, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-019 | Promotion, Coupon, CouponTarget, CouponUsage | API-019.* | TEST-019 | TASK-014, TASK-016, TASK-018, TASK-019, TASK-023, TASK-033, TASK-034 |
| RF-029 | RN-014, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-029 | FreightRate, CepRange, AuditLog | API-029.* | TEST-035 | TASK-018, TASK-033 |

Critérios de aceite da fonte: PD-004 resolvida; e-mail confirmado antes de pedido; Pix 30min/boleto 2 dias; faixas não atendidas bloqueiam pedido sem encerrar antecipadamente checkout; mudança de endereço mantém prazo.

## Análise dos impactos previstos

INFERÊNCIA documental a partir de Allowed Changes; confirmar componentes/métodos reais no planejamento futuro. Não amplia o Scope Guard nem afirma implementação.

| Dimensão | Impacto e limite |
| --- | --- |
| Arquitetura | Aplicar fronteiras e ADRs ratificados aos componentes permitidos; alteração relevante exige decisão/ADR. |
| Banco de dados | Mudança restrita às tabelas/modelos expressamente enumerados em Allowed Changes; sem ampliação de migration. |
| API | Implementar apenas operações ativas do incremento nos módulos/contratos permitidos; conferir IDs API e respostas na matriz acima. |
| Interface | Mudança nas telas/bootstrap dos clientes expressamente permitidos; administração exclusivamente web. |
| Segurança | Verificar papéis/propriedade, sessão, arquivos, logs e segredos conforme superfícies desta TASK; não alterar comportamento de segurança como incidental. |
| Testes | Roteiro manual desta pasta mais gates automatizados aplicáveis, no recorte do incremento; checkpoints acumulam evidências da fase. |

## Sequência de execução

| Ordem | Etapa | Arquivo | GATE | Dependência |
| ---: | --- | --- | --- | --- |
| 001 | Recontextualização e prontidão | [prompt-task-018-etapa-001-recontextualizacao-prontidao.md](prompt-task-018-etapa-001-recontextualizacao-prontidao.md) | GATE-001 | — |
| 002 | Planejamento e pré-condições | [prompt-task-018-etapa-002-planejamento.md](prompt-task-018-etapa-002-planejamento.md) | GATE-002 | GATE-001 |
| 003 | Implementação restrita | [prompt-task-018-etapa-003-implementacao.md](prompt-task-018-etapa-003-implementacao.md) | GATE-003 | GATE-002 |
| 004 | Revisão de escopo e qualidade | [prompt-task-018-etapa-004-revisao.md](prompt-task-018-etapa-004-revisao.md) | GATE-004 | GATE-003 |
| 005 | Testes manuais pelo responsável | [prompt-task-018-etapa-005-testes-manuais.md](prompt-task-018-etapa-005-testes-manuais.md) | GATE-005 | GATE-004 |
| 006 | Conclusão controlada | [prompt-task-018-etapa-006-conclusao.md](prompt-task-018-etapa-006-conclusao.md) | GATE-006 | GATE-005 |

Estado inicial dos 6 gates: PENDENTE / NÃO EXECUTADO. Nenhum habilitado por esta geração. Cada gate depende do anterior aprovado com evidência atual; falha invalida dependentes. Não avançar automaticamente.

## Escopo e conclusão

Allowed Changes:

- apps/api/src/modules/checkout/**
- apps/api/src/modules/inventory/** transferência de reservas para pedido
- apps/api/src/modules/orders/** somente criação/snapshots
- apps/api/src/modules/pricing/** usos e rateio
- apps/api/prisma/** somente pedido/frete/uso cupom
- packages/contracts/checkout/**
- tests/checkout/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/src/modules/freight/**
- apps/web/src/features/admin/freight/**
- apps/api/prisma/** somente FreightRate, CepRange, OrderUnit e PaymentCharge inicial
- apps/api/src/modules/accounts/** consulta de confirmação e estado para checkout
- packages/contracts/freight/**
- tests/freight/**
- tests/e2e/freight-admin/**

Forbidden Changes:

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

Incidental Changes Policy: MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

Definition of Done: Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

Concluir somente com gates locais e globais aplicáveis aprovados, aceite verificado, testes manuais do responsável aprovados e relatório integral de AGENTS. Próxima TASK exige autorização própria. Estados canônicos continuam os do backlog; aguardo de testes é subestado IN_REVIEW, não DONE.

## Testes manuais previstos

TEST-010, TEST-011, TEST-019, TEST-035.

[Roteiro manual com 9 casos agrupados, ainda não executados](roteiro-testes-manuais.md). Comandos de aplicação e fixtures concretas ainda ausentes; preencher no planejamento futuro com tecnologia existente. Não criar scripts sem necessidade/comando/escopo real. Testes automáticos aplicáveis complementam os passos manuais.

## Fontes atuais

[TASKS](../../../TASKS.md), [AGENTS](../../../AGENTS.md), [README](../../../README.md), [conciliação](../../../docs/architecture/conciliacao.md), [testes](../../../docs/architecture/testing.md), [parâmetros](../../../docs/architecture/parametros.md). Se fonte mudar, revalidar retrato antes de executar; este índice não substitui o backlog.
