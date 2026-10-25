# TASK-027 — ETAPA 001 — Recontextualização e prontidão

MODELO PARA USO FUTURO. A solicitação de 2026-10-25 autoriza apenas gerar estes documentos. Ler, copiar ou receber este arquivo não autoriza executar a TASK. Exigir autorização explícita futura do responsável, específica à TASK ou continuidade expressa, antes de iniciar. Gate aprovado habilita somente a próxima etapa da mesma TASK; não autoriza a próxima TASK. Não executar automaticamente a etapa seguinte.

## 1. OBJETIVO

Recontextualização e prontidão para TASK-027 — Implementar trocas, ofertas e prazos. Criar espera de 30 dias pós-conferência, busca antecipada, oferta/reserva 48h, aceite/recusa, conversão, remessas e nova janela por substituto.

## 2. CONTEXTO

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

## 3. PRÉ-CONDIÇÕES

- Autorização explícita futura identificada e Scope Guard vigente lido.
- Não há gate local anterior; levantar prontidão sem alterar arquivos.
- DEPENDS_ON: TASK-026; checkpoint anterior e artefatos conferidos. A geração não satisfez essas dependências.
- Ambiente, baseline e decisões compatíveis com o recorte da etapa; nenhuma hipótese usada como fato. TASK-001 resolve suas próprias propostas sem implementação.

## 4. ENTRADAS NECESSÁRIAS

Ler os arquivos atuais nesta ordem: `AGENTS.md` e `docs/architecture/conciliacao.md`; `README.md`; `TASKS.md` (índice, seção TASK-027, dependências e Scope Guard); ADRs relacionados em `docs/adr/`, `docs/architecture/architecture.md`, `api.md`, `data-model.md`, `testing.md`, `parametros.md` e diagramas relevantes; depois código/testes dos módulos afetados quando existirem. Conferir respostas de origem em `docs/sources/elicitacao-final.md` nas regras relacionadas. Recuperar autorização, plano, histórico e relatórios anteriores; ausência deve ser registrada. Consultar `roteiro-testes-manuais.md` desta pasta.

## 5. ARQUIVOS E COMPONENTES ENVOLVIDOS

ALLOWED CHANGES da TASK (limites de caminho **e finalidade**, não autorização automática desta etapa):

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

Foco de componentes/impactos: Espera 30 dias após conferência favorável; busca antecipada permitida. Oferta no dia 29 conserva 48h completas e suspende conversão; aceite mantém reserva até inspeção/envio. Recusa/expiração/postagem vencida/rejeição liberam. Conversão não autoriza estorno; troca não cria venda nem review extra; nova janela na entrega do substituto.

Na etapa 001 apenas leitura; planejamento não altera produção; revisão apenas leitura; execução manual altera somente dados de teste e evidência autorizada. Planejar explicitamente impactos em arquitetura, persistência, APIs, interfaces, segurança e testes; N/A precisa de causa concreta. Localizar componentes existentes sem inventar métodos, classes ou tabelas extras.

## 6. PROCEDIMENTO DETALHADO

1. Recuperar autorização e relatórios anteriores desta TASK; sem autorização, somente informar bloqueio, sem iniciar a tarefa.
2. Ler na ordem de AGENTS: AGENTS/conciliação, README, índice/TASK/dependências/Scope Guard, ADRs e arquitetura/API/dados/testes, código e testes afetados quando existirem.
3. Inventariar arquivos com `rg --files` (ou inventário equivalente). Testar presença de Git antes de `git status --short --branch`, `git log --oneline -n 20`, `git branch --all` e `git log --all --grep=TASK-NNN`; substituir TASK-NNN pelo ID desta TASK. Histórico ausente = N/A com motivo; não inventar branch/commit. Se houver remote, consultar estado disponível, sem pull/reset automático nem descartar alterações.
4. Separar alterações pré-existentes, commits/branches relacionados, relatórios predecessores e regressões conhecidas com caminho/evidência. Código ausente não pode ser apresentado como implementado.
5. Validar ordem/fase/checkpoint anterior e DoR: dependências DONE com artefatos e verificações válidas, contratos/aceite, ADRs ratificados e PDs impeditivas resolvidas. TASK-001 pode entrar para resolver suas próprias propostas; não exigir sua própria solução como pré-requisito.
6. Registrar baseline real de comandos existentes; falha externa impede avanço. Bootstrap TASK-002 sem scripts ainda: registrar ausência e planejar criá-los no escopo, sem declarar PASS. Sem Git só TASK-002 autoriza sua criação; tarefas documentais registram N/A.
7. Produzir tabela FATO CONFIRMADO / EVIDÊNCIA / INFERÊNCIA / HIPÓTESE / PENDÊNCIA e lista de bloqueios com efeito na tarefa.

## 7. RESTRIÇÕES

FORBIDDEN CHANGES (limite forte, prevalece sobre Allowed):

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

Incidental Changes Policy: MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

Aplicar os nove critérios de AGENTS antes de qualquer incidental: necessidade, causalidade, minimalidade, escopo funcional, negócio, arquitetura, contrato, segurança e proibição. Sem orçamento para alterações dispersas. IDs são permanentes; não alterar fonte final nem tratar ADR PROPOSED como ACCEPTED. Sem refatoração ampla, cobrança real, publicação ou apresentação. Carrinho não reserva; USER separado de ADMIN/OPERATOR; estorno pós-venda só ADMIN. Preservar integralmente as regras de prazo, dinheiro, conta e relatórios das fontes.

## 8. VALIDAÇÕES

Vincular cada saída da etapa a arquivo/trecho, comando/procedimento, ambiente, resultado/exit code e evidência. Critério de aceite: Oferta dia 29 tem 48h completas; recusa/expiração libera; aceite não envia antes da inspeção; conversão não autoriza dinheiro; postagem expirada/rejeição libera reserva; não gera venda/avaliação extra.

Testes da TASK: TEST-016, TEST-018, TEST-020, TEST-024. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

Usar roteiro manual, com recorte explícito do incremento e casos adicionais exigidos pelo aceite. Gates globais GATE-01 a GATE-08 de AGENTS são distintos dos gates locais GATE-001 a GATE-006. Build/tipos/lint/testes aplicáveis continuam obrigatórios; execução automática pelo agente não substitui validação manual. Sem comandos existentes, registrar lacuna; não usar comandos presumidos nem registrar PASS.

## 9. TRATAMENTO DE FALHAS

Interromper avanço; registrar operação/comando, ambiente, código de saída, erro completo sem segredos e evidência. Separar FATO CONFIRMADO, EVIDÊNCIA, INFERÊNCIA, HIPÓTESE e PENDÊNCIA. Diagnosticar causa e avaliar Allowed/Forbidden/Incidental. Fazer somente menor correção autorizada; repetir a validação afetada e atualizar o gate, invalidando gates posteriores dependentes. Em revisão somente de leitura ou teste manual, devolver correção à etapa autorizada e revisar novamente. Produção proibida nesta TASK não pode ser corrigida nela. Erro de execução/validação: FAILED conforme AGENTS; dependência/decisão externa ausente: BLOCKED. Nenhum teste vira APROVADO sem reexecução manual. Preservar trabalho e não remover teste, desativar validação nem trocar concorrência real por mock sequencial.

## 10. SCOPE ESCALATION

Se necessário sair do escopo, parar e preencher o modelo de AGENTS.md sem inventar exceção:

```text
## SCOPE ESCALATION
TASK: TASK-027
Necessidade identificada: [problema e alteração necessária]
Motivo: [causa]
Arquivos/módulos afetados: [caminhos]
Allowed Changes atual: [regra]
Forbidden Changes relacionado: [regra ou nenhum]
Por que não é uma Incidental Change: [critérios reprovados]
Impacto se não realizada: [impacto e riscos]
Alternativas: [ampliar escopo; TASK existente/nova; dependências; ADR; outra]
Recomendação: [menor caminho]
Decisão necessária: [quem decide e o quê]
```

Bloqueio de requisito/dependência exige também `## BLOCKER` com TASK, Problema, Impacto, RF/RN/RNF/UC/ADR afetados, Alternativas, Recomendação e Decisão necessária. Manter próxima etapa bloqueada até decisão explícita; silêncio não aprova.

## 11. CRITÉRIOS DE APROVAÇÃO

- Todas as operações numeradas da seção 6 concluídas com evidência rastreável aplicável à etapa.
- Pré-condições e gates anteriores comprovados; nenhum bloqueio impeditivo aberto.
- Aceite da TASK desdobrado/verificado no grau da etapa, respeitando Allowed/Forbidden e política incidental.
- Nenhum teste ou decisão aprovado por hipótese; testes manuais só aprovados com execução/evidência do responsável.
- Relatório acumulado coerente, próximo arquivo identificado e falhas com diagnóstico/revalidação.

## 12. GATE DA ETAPA

GATE-001 — Recontextualização e prontidão. Estado inicial: PENDENTE; não executado nesta geração.

```text
[ ] Entradas/pré-condições e autorização verificadas
[ ] Cada item do procedimento da seção 6 tem evidência e resultado válido
[ ] Escopo/segurança/contratos preservados no recorte da etapa
[ ] Validações aplicáveis aprovadas; N/A individual justificado
[ ] Nenhuma pendência impeditiva; saída da seção 14 completa
GATES concluídos (critérios locais): 0/5
GATES pendentes (critérios locais): 5/5
STATUS: BLOQUEADO ATÉ VALIDAÇÃO
PRÓXIMA ETAPA: BLOQUEADA
```

Na execução, substituir cada campo pelo resultado real; somente 5/5 itens satisfeitos e predecessores válidos permitem STATUS: APROVADO e PRÓXIMA ETAPA: HABILITADA. N/A não é PASS e só satisfaz documentação da inaplicabilidade quando a regra autoriza. Na última etapa não há etapa seguinte a habilitar.

## 13. STATUS ACUMULADO DOS GATES

| Gate local | Etapa | Estado inicial |
| --- | --- | --- |
| GATE-001 | Recontextualização e prontidão | PENDENTE |
| GATE-002 | Planejamento e pré-condições | PENDENTE |
| GATE-003 | Implementação restrita | PENDENTE |
| GATE-004 | Revisão de escopo e qualidade | PENDENTE |
| GATE-005 | Testes manuais pelo responsável | PENDENTE |
| GATE-006 | Conclusão controlada | PENDENTE |

GATES TOTAIS: 6; GATES CONCLUÍDOS: 0; GATES PENDENTES: 6; GATES BLOQUEADOS: 0 (nenhum gate executado; execução atualmente não autorizada).

Em cada resposta atualizar a matriz inteira com evidências reais. Contagem: total = concluídos + pendentes + bloqueados; reprovado conta como bloqueado para avanço e mantém REPROVADO na linha. Critérios dentro de um gate não contam como etapas. Gate invalidado por correção deve voltar a pendente/bloqueado.

## 14. RESULTADO OBRIGATÓRIO

Entregar artefatos/evidências do procedimento; na conclusão incluir também o relatório integral de AGENTS §15. Finalizar a resposta com este bloco preenchido por resultados reais:

```text
==================================================
TASK: TASK-027
ETAPA: 001
STATUS DA ETAPA: APROVADA | REPROVADA | BLOQUEADA
==================================================
GATE DA ETAPA: APROVADO | REPROVADO | BLOQUEADO
GATES TOTAIS: 6
GATES CONCLUÍDOS: [resultado real]
GATES PENDENTES: [resultado real]
GATES BLOQUEADOS: [resultado real]
PROBLEMAS ENCONTRADOS:
- [descrição ou NONE]
CORREÇÕES REALIZADAS:
- [descrição e evidência ou NONE]
PENDÊNCIAS:
- [descrição ou NONE]
TESTES RELACIONADOS:
- [IDs, resultados reais e evidências; NÃO EXECUTADOS quando ausentes]
PRÓXIMA ETAPA:
prompt-task-027-etapa-002-planejamento.md
PRÓXIMA ETAPA HABILITADA:
SIM | NÃO
MOTIVO:
[evidência para habilitar, bloqueio concreto ou encerramento sem próxima etapa]
==================================================
```
