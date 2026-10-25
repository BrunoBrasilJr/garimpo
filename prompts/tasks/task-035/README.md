# TASK-035 — Executar restauração isolada

MODELO PARA USO FUTURO. A solicitação de 2026-10-25 autoriza apenas gerar estes documentos. Ler, copiar ou receber este arquivo não autoriza executar a TASK. Exigir autorização explícita futura do responsável, específica à TASK ou continuidade expressa, antes de iniciar. Gate aprovado habilita somente a próxima etapa da mesma TASK; não autoriza a próxima TASK. Não executar automaticamente a etapa seguinte.

## Objetivo, contexto e dependências

Estado inicial em 2026-10-25: BLOCKED; fase PHASE-05; prioridade HIGH. Nenhuma TASK foi executada. Não há Git, código, manifests, banco ou testes de aplicação nesta pasta. Caminhos técnicos são futuros, sujeitos à stack ratificada; seis ADRs PROPOSED.

Objetivo específico: Restaurar conjunto em banco/diretório separados e comparar dados, fotos e evidências; validar periodicidade/política aprovada.

Descrição operacional: PD-008 e conjunto conhecido; restaurar banco e arquivos em destinos separados e conferir referências/bytes/fotos/evidências privadas. Incluir TEST-029 que detalha restauração além de TEST-025. Origem intacta; registrar duração e política sem SLA inventado.

Dependências/predecessoras diretas: TASK-030, TASK-032. Conferir seus artefatos e relatórios, não só estados. Bloqueadoras iniciais: TASK-030, TASK-032.

Rastreabilidade: RF-025; RN-031, RN-032; RNF-002, RNF-009, RNF-011, RNF-012; UC-025. ADRs: ADR-006.

Pendências ligadas à tarefa (PD-005 também condiciona os módulos técnicos):

| ID | Decisão necessária | Tarefas afetadas |
| --- | --- | --- |
| PD-005 | Parâmetros técnicos: Ratificar stack herdada, versões, sessão, hash, proteção das mensagens, armazenamento, prazo de links de alteração/reativação e estratégia transacional. Reset 30min, confirmação inicial 24h e limites de imagens já decididos. | TASK-001 e módulos dependentes |
| PD-008 | Retenção e backup: Definir retenção de dados pessoais/anonimização e condições após retenção; definir retenção de backups, frequência dos testes e destino. | TASK-022, TASK-030, TASK-035 |

Matriz de domínio/API do README (referência de análise, não expansão de escopo):

| RF | RNs | RNFs | UC | Entidades | API | Testes | TASKs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RF-025 | RN-031, RN-032 | RNF-002, RNF-009, RNF-011, RNF-012 | UC-025 | BackupRun, ProductImage, Evidence | API-025.* | TEST-025 | TASK-030, TASK-035 |

Critérios de aceite da fonte: Origem intacta; referências e bytes conferidos; duração/resultado registrados; política não pendente no aceite.

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
| 001 | Recontextualização e prontidão | [prompt-task-035-etapa-001-recontextualizacao-prontidao.md](prompt-task-035-etapa-001-recontextualizacao-prontidao.md) | GATE-001 | — |
| 002 | Planejamento e pré-condições | [prompt-task-035-etapa-002-planejamento.md](prompt-task-035-etapa-002-planejamento.md) | GATE-002 | GATE-001 |
| 003 | Preparação da validação | [prompt-task-035-etapa-003-preparacao-validacao.md](prompt-task-035-etapa-003-preparacao-validacao.md) | GATE-003 | GATE-002 |
| 004 | Revisão de escopo e qualidade | [prompt-task-035-etapa-004-revisao.md](prompt-task-035-etapa-004-revisao.md) | GATE-004 | GATE-003 |
| 005 | Testes manuais pelo responsável | [prompt-task-035-etapa-005-testes-manuais.md](prompt-task-035-etapa-005-testes-manuais.md) | GATE-005 | GATE-004 |
| 006 | Conclusão controlada | [prompt-task-035-etapa-006-conclusao.md](prompt-task-035-etapa-006-conclusao.md) | GATE-006 | GATE-005 |

Estado inicial dos 6 gates: PENDENTE / NÃO EXECUTADO. Nenhum habilitado por esta geração. Cada gate depende do anterior aprovado com evidência atual; falha invalida dependentes. Não avançar automaticamente.

## Escopo e conclusão

Allowed Changes:

- scripts/restore-validation/**
- tests/operations/restore/**
- docs/validation/restore.md
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

TEST-025, TEST-029.

[Roteiro manual com 4 casos agrupados, ainda não executados](roteiro-testes-manuais.md). Comandos de aplicação e fixtures concretas ainda ausentes; preencher no planejamento futuro com tecnologia existente. Não criar scripts sem necessidade/comando/escopo real. Testes automáticos aplicáveis complementam os passos manuais.

## Fontes atuais

[TASKS](../../../TASKS.md), [AGENTS](../../../AGENTS.md), [README](../../../README.md), [conciliação](../../../docs/architecture/conciliacao.md), [testes](../../../docs/architecture/testing.md), [parâmetros](../../../docs/architecture/parametros.md). Se fonte mudar, revalidar retrato antes de executar; este índice não substitui o backlog.
