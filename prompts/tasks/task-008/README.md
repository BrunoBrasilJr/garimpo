# TASK-008 — Implementar catálogo, metadados e imagens na API

MODELO PARA USO FUTURO. A solicitação de 2026-10-25 autoriza apenas gerar estes documentos. Ler, copiar ou receber este arquivo não autoriza executar a TASK. Exigir autorização explícita futura do responsável, específica à TASK ou continuidade expressa, antes de iniciar. Gate aprovado habilita somente a próxima etapa da mesma TASK; não autoriza a próxima TASK. Não executar automaticamente a etapa seguinte.

## Objetivo, contexto e dependências

Estado inicial em 2026-10-25: BLOCKED; fase PHASE-02; prioridade HIGH. Nenhuma TASK foi executada. Não há Git, código, manifests, banco ou testes de aplicação nesta pasta. Caminhos técnicos são futuros, sujeitos à stack ratificada; seis ADRs PROPOSED.

Objetivo específico: Criar edições/ofertas, anos distintos, gênero principal, artistas de faixa/edição, áudio por faixa, fotos e busca.

Descrição operacional: Edições/ofertas, ano original versus edição, gênero principal e artistas de faixa/edição. Validar Goldmine após PD-006; JPEG/PNG/WebP até 5 MB, 10 fotos/edição e 8/usado. Histórico impede exclusão; áudio por faixa opcional.

Dependências/predecessoras diretas: TASK-007. Conferir seus artefatos e relatórios, não só estados. Bloqueadoras iniciais: TASK-007.

Rastreabilidade: RF-005, RF-006, RF-017; RN-001, RN-004, RN-005, RN-026, RN-027, RN-032, RN-036, RN-045; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010; UC-005, UC-006, UC-017. ADRs: ADR-001, ADR-006.

Pendências ligadas à tarefa (PD-005 também condiciona os módulos técnicos):

| ID | Decisão necessária | Tarefas afetadas |
| --- | --- | --- |
| PD-005 | Parâmetros técnicos: Ratificar stack herdada, versões, sessão, hash, proteção das mensagens, armazenamento, prazo de links de alteração/reativação e estratégia transacional. Reset 30min, confirmação inicial 24h e limites de imagens já decididos. | TASK-001 e módulos dependentes |
| PD-006 | Vocabulários residuais: Escala numérica de avaliação, enumeração Goldmine e tipos de desconto das promoções não especificados. Sobreposição, acumulação, alerta NEW/USED/ANY e estoque baixo estão resolvidos e não devem ser reabertos. | TASK-008, TASK-013, TASK-014 |

Matriz de domínio/API do README (referência de análise, não expansão de escopo):

| RF | RNs | RNFs | UC | Entidades | API | Testes | TASKs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RF-005 | RN-004, RN-032, RN-036 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008 | UC-005 | Edition, Artist, Track, TrackArtist, Genre, Offer | API-005.* | TEST-005 | TASK-008, TASK-010, TASK-011, TASK-033 |
| RF-006 | RN-004, RN-005, RN-026, RN-032, RN-036, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010 | UC-006 | Edition, Track, Offer, ProductImage | API-006.* | TEST-006 | TASK-008, TASK-010, TASK-011, TASK-033 |
| RF-017 | RN-001, RN-004, RN-005, RN-026, RN-027, RN-032, RN-036, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010 | UC-017 | Edition, Track, TrackArtist, Offer, ProductImage | API-017.* | TEST-017 | TASK-008, TASK-009, TASK-023, TASK-033 |

Critérios de aceite da fonte: Validação de publicação, usados com descrição/foto/Goldmine; 10 imagens edição/8 usado, até 5 MB e tipos permitidos; inativação não destrói referência.

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
| 001 | Recontextualização e prontidão | [prompt-task-008-etapa-001-recontextualizacao-prontidao.md](prompt-task-008-etapa-001-recontextualizacao-prontidao.md) | GATE-001 | — |
| 002 | Planejamento e pré-condições | [prompt-task-008-etapa-002-planejamento.md](prompt-task-008-etapa-002-planejamento.md) | GATE-002 | GATE-001 |
| 003 | Implementação restrita | [prompt-task-008-etapa-003-implementacao.md](prompt-task-008-etapa-003-implementacao.md) | GATE-003 | GATE-002 |
| 004 | Revisão de escopo e qualidade | [prompt-task-008-etapa-004-revisao.md](prompt-task-008-etapa-004-revisao.md) | GATE-004 | GATE-003 |
| 005 | Testes manuais pelo responsável | [prompt-task-008-etapa-005-testes-manuais.md](prompt-task-008-etapa-005-testes-manuais.md) | GATE-005 | GATE-004 |
| 006 | Conclusão controlada | [prompt-task-008-etapa-006-conclusao.md](prompt-task-008-etapa-006-conclusao.md) | GATE-006 | GATE-005 |

Estado inicial dos 6 gates: PENDENTE / NÃO EXECUTADO. Nenhum habilitado por esta geração. Cada gate depende do anterior aprovado com evidência atual; falha invalida dependentes. Não avançar automaticamente.

## Escopo e conclusão

Allowed Changes:

- apps/api/src/modules/catalog/**
- apps/api/src/modules/media/**
- apps/api/prisma/** somente catálogo/mídia
- packages/contracts/catalog/**
- tests/catalog/**
- tests/media/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/prisma/** somente TrackArtist e campos anos/gênero principal/imagem por edição

Forbidden Changes:

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

Incidental Changes Policy: MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

Definition of Done: Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

Concluir somente com gates locais e globais aplicáveis aprovados, aceite verificado, testes manuais do responsável aprovados e relatório integral de AGENTS. Próxima TASK exige autorização própria. Estados canônicos continuam os do backlog; aguardo de testes é subestado IN_REVIEW, não DONE.

## Testes manuais previstos

TEST-005, TEST-006, TEST-017.

[Roteiro manual com 7 casos agrupados, ainda não executados](roteiro-testes-manuais.md). Comandos de aplicação e fixtures concretas ainda ausentes; preencher no planejamento futuro com tecnologia existente. Não criar scripts sem necessidade/comando/escopo real. Testes automáticos aplicáveis complementam os passos manuais.

## Fontes atuais

[TASKS](../../../TASKS.md), [AGENTS](../../../AGENTS.md), [README](../../../README.md), [conciliação](../../../docs/architecture/conciliacao.md), [testes](../../../docs/architecture/testing.md), [parâmetros](../../../docs/architecture/parametros.md). Se fonte mudar, revalidar retrato antes de executar; este índice não substitui o backlog.
