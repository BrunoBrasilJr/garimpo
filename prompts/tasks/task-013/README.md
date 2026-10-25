# TASK-013 — Implementar avaliações e moderação

MODELO PARA USO FUTURO. A solicitação de 2026-10-25 autoriza apenas gerar estes documentos. Ler, copiar ou receber este arquivo não autoriza executar a TASK. Exigir autorização explícita futura do responsável, específica à TASK ou continuidade expressa, antes de iniciar. Gate aprovado habilita somente a próxima etapa da mesma TASK; não autoriza a próxima TASK. Não executar automaticamente a etapa seguinte.

## Objetivo, contexto e dependências

Estado inicial em 2026-10-25: BLOCKED; fase PHASE-02; prioridade MEDIUM. Nenhuma TASK foi executada. Não há Git, código, manifests, banco ou testes de aplicação nesta pasta. Caminhos técnicos são futuros, sujeitos à stack ratificada; seis ADRs PROPOSED.

Objetivo específico: Criar review por cliente/edição/pedido e histórico de versões, publicação imediata e moderação ADMIN/OPERATOR. Porta de compra entregue conectada em TASK-023; pós-venda em TASK-026.

Descrição operacional: Chave de review cliente/edição/pedido e histórico de versões. Publicação depende de compra entregue: porta sem adaptador nega no runtime; stub somente em testes. Edição de ocultada aguarda moderação. Pedido real em TASK-023, devolução em TASK-026.

Dependências/predecessoras diretas: TASK-008, TASK-010, TASK-011. Conferir seus artefatos e relatórios, não só estados. Bloqueadoras iniciais: TASK-008, TASK-010, TASK-011.

Rastreabilidade: RF-009, RF-022; RN-001, RN-025, RN-032; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; UC-009, UC-022. ADRs: ADR-001.

Pendências ligadas à tarefa (PD-005 também condiciona os módulos técnicos):

| ID | Decisão necessária | Tarefas afetadas |
| --- | --- | --- |
| PD-005 | Parâmetros técnicos: Ratificar stack herdada, versões, sessão, hash, proteção das mensagens, armazenamento, prazo de links de alteração/reativação e estratégia transacional. Reset 30min, confirmação inicial 24h e limites de imagens já decididos. | TASK-001 e módulos dependentes |
| PD-006 | Vocabulários residuais: Escala numérica de avaliação, enumeração Goldmine e tipos de desconto das promoções não especificados. Sobreposição, acumulação, alerta NEW/USED/ANY e estoque baixo estão resolvidos e não devem ser reabertos. | TASK-008, TASK-013, TASK-014 |

Matriz de domínio/API do README (referência de análise, não expansão de escopo):

| RF | RNs | RNFs | UC | Entidades | API | Testes | TASKs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RF-009 | RN-025, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-009 | Review, ReviewRevision, OrderItem, OrderUnit | API-009.* | TEST-009 | TASK-013, TASK-023, TASK-026, TASK-033 |
| RF-022 | RN-001, RN-025, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-022 | Review, ReviewRevision, AuditLog | API-022.* | TEST-022 | TASK-013, TASK-026, TASK-033 |

Critérios de aceite da fonte: Sem adaptador de compra o runtime nega publicação, stub só em teste. Editar ocultada mantém oculta aguardando análise; chave inclui pedido. Não antecipar pedido/pós-venda.

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
| 001 | Recontextualização e prontidão | [prompt-task-013-etapa-001-recontextualizacao-prontidao.md](prompt-task-013-etapa-001-recontextualizacao-prontidao.md) | GATE-001 | — |
| 002 | Planejamento e pré-condições | [prompt-task-013-etapa-002-planejamento.md](prompt-task-013-etapa-002-planejamento.md) | GATE-002 | GATE-001 |
| 003 | Implementação restrita | [prompt-task-013-etapa-003-implementacao.md](prompt-task-013-etapa-003-implementacao.md) | GATE-003 | GATE-002 |
| 004 | Revisão de escopo e qualidade | [prompt-task-013-etapa-004-revisao.md](prompt-task-013-etapa-004-revisao.md) | GATE-004 | GATE-003 |
| 005 | Testes manuais pelo responsável | [prompt-task-013-etapa-005-testes-manuais.md](prompt-task-013-etapa-005-testes-manuais.md) | GATE-005 | GATE-004 |
| 006 | Conclusão controlada | [prompt-task-013-etapa-006-conclusao.md](prompt-task-013-etapa-006-conclusao.md) | GATE-006 | GATE-005 |

Estado inicial dos 6 gates: PENDENTE / NÃO EXECUTADO. Nenhum habilitado por esta geração. Cada gate depende do anterior aprovado com evidência atual; falha invalida dependentes. Não avançar automaticamente.

## Escopo e conclusão

Allowed Changes:

- apps/api/src/modules/reviews/**
- apps/api/prisma/** somente avaliações
- packages/contracts/reviews/**
- apps/web/src/features/reviews/**
- apps/mobile/src/features/reviews/**
- apps/web/src/features/admin/reviews/**
- tests/reviews/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/prisma/** somente ReviewRevision e chave user/edition/order lógica até integrar pedidos

Forbidden Changes:

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

Incidental Changes Policy: MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

Definition of Done: Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

Concluir somente com gates locais e globais aplicáveis aprovados, aceite verificado, testes manuais do responsável aprovados e relatório integral de AGENTS. Próxima TASK exige autorização própria. Estados canônicos continuam os do backlog; aguardo de testes é subestado IN_REVIEW, não DONE.

## Testes manuais previstos

TEST-009, TEST-022.

[Roteiro manual com 5 casos agrupados, ainda não executados](roteiro-testes-manuais.md). Comandos de aplicação e fixtures concretas ainda ausentes; preencher no planejamento futuro com tecnologia existente. Não criar scripts sem necessidade/comando/escopo real. Testes automáticos aplicáveis complementam os passos manuais.

## Fontes atuais

[TASKS](../../../TASKS.md), [AGENTS](../../../AGENTS.md), [README](../../../README.md), [conciliação](../../../docs/architecture/conciliacao.md), [testes](../../../docs/architecture/testing.md), [parâmetros](../../../docs/architecture/parametros.md). Se fonte mudar, revalidar retrato antes de executar; este índice não substitui o backlog.
