# TASK-001 — Validar decisões técnicas e parâmetros pendentes

MODELO PARA USO FUTURO. A solicitação de 2026-10-25 autoriza apenas gerar estes documentos. Ler, copiar ou receber este arquivo não autoriza executar a TASK. Exigir autorização explícita futura do responsável, específica à TASK ou continuidade expressa, antes de iniciar. Gate aprovado habilita somente a próxima etapa da mesma TASK; não autoriza a próxima TASK. Não executar automaticamente a etapa seguinte.

## Objetivo, contexto e dependências

Estado inicial em 2026-10-25: READY; fase PHASE-01; prioridade CRITICAL. Nenhuma TASK foi executada. Não há Git, código, manifests, banco ou testes de aplicação nesta pasta. Caminhos técnicos são futuros, sujeitos à stack ratificada; seis ADRs PROPOSED.

Objetivo específico: Ratificar propostas dos seis ADRs, stack herdada, ambiente/plataformas, segurança e parâmetros necessários ao início do desenvolvimento. Separar decisões do PDF de propostas técnicas.

Descrição operacional: Preparar alternativas e evidências para os seis ADRs e PD-002/005. Solicitar decisão explícita ao responsável sobre escolhas ainda abertas; registrar origem, responsável e data. Não ratificar por conta própria nem bloquear a entrada exigindo as próprias decisões que esta tarefa deve resolver.

Dependências/predecessoras diretas: NONE. Conferir seus artefatos e relatórios, não só estados. Bloqueadoras iniciais: autorização futura de execução; decisões são o objeto desta TASK.

Rastreabilidade: N/A; N/A; RNF-001, RNF-006, RNF-007, RNF-008, RNF-010, RNF-012; N/A; ADR-001, ADR-002, ADR-003, ADR-004, ADR-005, ADR-006.

Justificativa técnica: fundação, qualidade ou operação exigida pelos RNFs/ADRs acima; não cria funcionalidade comercial autônoma.

Pendências ligadas à tarefa (PD-005 também condiciona os módulos técnicos):

| ID | Decisão necessária | Tarefas afetadas |
| --- | --- | --- |
| PD-002 | Ambiente e plataformas: Confirmar plataforma mobile, navegadores, publicação/local, infraestrutura e transporte. Android exclusivo, LAN e HTTP não são fatos aprovados. | TASK-001, TASK-002, TASK-033 |
| PD-005 | Parâmetros técnicos: Ratificar stack herdada, versões, sessão, hash, proteção das mensagens, armazenamento, prazo de links de alteração/reativação e estratégia transacional. Reset 30min, confirmação inicial 24h e limites de imagens já decididos. | TASK-001 e módulos dependentes |

Matriz de domínio/API do README (referência de análise, não expansão de escopo):

Tarefa técnica/documental: conferir RNFs e ADRs acima; não introduzir API comercial autônoma.

Critérios de aceite da fonte: Parâmetros necessários à fundação documentados com origem; decisões de produto restantes identificadas sem invenção. Sem código, dependência ou migration. Pendências de fases futuras podem continuar abertas com bloqueio explícito.

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
| 001 | Recontextualização e prontidão | [prompt-task-001-etapa-001-recontextualizacao-prontidao.md](prompt-task-001-etapa-001-recontextualizacao-prontidao.md) | GATE-001 | — |
| 002 | Planejamento e pré-condições | [prompt-task-001-etapa-002-planejamento.md](prompt-task-001-etapa-002-planejamento.md) | GATE-002 | GATE-001 |
| 003 | Decisões documentais | [prompt-task-001-etapa-003-decisoes-documentais.md](prompt-task-001-etapa-003-decisoes-documentais.md) | GATE-003 | GATE-002 |
| 004 | Revisão de escopo e qualidade | [prompt-task-001-etapa-004-revisao.md](prompt-task-001-etapa-004-revisao.md) | GATE-004 | GATE-003 |
| 005 | Testes manuais pelo responsável | [prompt-task-001-etapa-005-testes-manuais.md](prompt-task-001-etapa-005-testes-manuais.md) | GATE-005 | GATE-004 |
| 006 | Conclusão controlada | [prompt-task-001-etapa-006-conclusao.md](prompt-task-001-etapa-006-conclusao.md) | GATE-006 | GATE-005 |

Estado inicial dos 6 gates: PENDENTE / NÃO EXECUTADO. Nenhum habilitado por esta geração. Cada gate depende do anterior aprovado com evidência atual; falha invalida dependentes. Não avançar automaticamente.

## Escopo e conclusão

Allowed Changes:

- docs/adr/ADR-003-*
- docs/adr/ADR-004-*
- docs/adr/ADR-005-*
- docs/architecture/parametros.md
- README.md somente pendências e referências técnicas correspondentes
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- docs/adr/ADR-001-*
- docs/adr/ADR-002-*
- docs/adr/ADR-006-*
- README.md somente pendências e decisões técnicas ratificadas, preservando regras do PDF

Forbidden Changes:

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar código, instalar dependências, configurar infraestrutura ou criar migrations.

Incidental Changes Policy: NO_INCIDENTAL_CHANGES

Nenhuma mudança fora do escopo primário é permitida nesta tarefa.

Definition of Done: Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

Concluir somente com gates locais e globais aplicáveis aprovados, aceite verificado, testes manuais do responsável aprovados e relatório integral de AGENTS. Próxima TASK exige autorização própria. Estados canônicos continuam os do backlog; aguardo de testes é subestado IN_REVIEW, não DONE.

## Testes manuais previstos

Revisão documental de decisões, compatibilidade, fontes e escopo (DOC-001/002).

[Roteiro manual com 2 casos agrupados, ainda não executados](roteiro-testes-manuais.md). Comandos de aplicação e fixtures concretas ainda ausentes; preencher no planejamento futuro com tecnologia existente. Não criar scripts sem necessidade/comando/escopo real. Testes automáticos aplicáveis complementam os passos manuais.

## Fontes atuais

[TASKS](../../../TASKS.md), [AGENTS](../../../AGENTS.md), [README](../../../README.md), [conciliação](../../../docs/architecture/conciliacao.md), [testes](../../../docs/architecture/testing.md), [parâmetros](../../../docs/architecture/parametros.md). Se fonte mudar, revalidar retrato antes de executar; este índice não substitui o backlog.
