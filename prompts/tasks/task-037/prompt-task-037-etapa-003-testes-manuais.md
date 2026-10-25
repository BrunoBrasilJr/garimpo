# TASK-037 — ETAPA 003 — Testes manuais do checkpoint

MODELO PARA USO FUTURO. A solicitação de 2026-10-25 autoriza apenas gerar estes documentos. Ler, copiar ou receber este arquivo não autoriza executar a TASK. Exigir autorização explícita futura do responsável, específica à TASK ou continuidade expressa, antes de iniciar. Gate aprovado habilita somente a próxima etapa da mesma TASK; não autoriza a próxima TASK. Não executar automaticamente a etapa seguinte.

## 1. OBJETIVO

Testes manuais do checkpoint para TASK-037 — Checkpoint PHASE-05 e entrega da implementação. Revisar evidências finais, rastreabilidade e aceite do software quando implementado.

## 2. CONTEXTO

Estado inicial em 2026-10-25: BLOCKED; fase PHASE-05; prioridade CRITICAL. Nenhuma TASK foi executada. Não há Git, código, manifests, banco ou testes de aplicação nesta pasta. Caminhos técnicos são futuros, sujeitos à stack ratificada; seis ADRs PROPOSED.

Objetivo específico: Revisar evidências finais, rastreabilidade e aceite do software quando implementado.

Descrição operacional: Revisão final de todas fases: requisitos, evidências reais, decisões pendentes, DoD e gates acumulados. Não usar relatórios documentais como prova de aplicação. Não alterar produção; não entregar como concluído enquanto houver teste manual obrigatório pendente.

Dependências/predecessoras diretas: TASK-033, TASK-034, TASK-035, TASK-036. Conferir seus artefatos e relatórios, não só estados. Bloqueadoras iniciais: TASK-033, TASK-034, TASK-035, TASK-036.

Rastreabilidade: N/A; N/A; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-009, RNF-010, RNF-011, RNF-012; N/A; ADR-001, ADR-002, ADR-003, ADR-004, ADR-005, ADR-006.

Justificativa técnica: fundação, qualidade ou operação exigida pelos RNFs/ADRs acima; não cria funcionalidade comercial autônoma.

Pendências ligadas à tarefa (PD-005 também condiciona os módulos técnicos):

| ID | Decisão necessária | Tarefas afetadas |
| --- | --- | --- |
| PD-001 | Prazo e critérios acadêmicos: Data/rubrica da entrega do software não informadas no PDF. A necessidade atual de trabalhar nos documentos para amanhã não fixa entrega de software. | TASK-036, TASK-037 |
| PD-003 | Exigências adicionais: Confirmar rubrica e eventuais exigências formais de acessibilidade/implantação; preservar critérios de projeto já definidos. | TASK-033, TASK-037 |

Matriz de domínio/API do README (referência de análise, não expansão de escopo):

Tarefa técnica/documental: conferir RNFs e ADRs acima; não introduzir API comercial autônoma.

Critérios de aceite da fonte: Todos gates aplicáveis e pendências impeditivas resolvidos; documentos não substituem evidência de software. Nenhuma tarefa iniciada nesta revisão documental.

## 3. PRÉ-CONDIÇÕES

- Autorização explícita futura identificada e Scope Guard vigente lido.
- GATE-002 e todos seus predecessores aprovados com evidência atual; falta de relatório bloqueia esta etapa.
- DEPENDS_ON: TASK-033, TASK-034, TASK-035, TASK-036; checkpoint anterior e artefatos conferidos. A geração não satisfez essas dependências.
- Ambiente, baseline e decisões compatíveis com o recorte da etapa; nenhuma hipótese usada como fato. TASK-001 resolve suas próprias propostas sem implementação.

## 4. ENTRADAS NECESSÁRIAS

Ler os arquivos atuais nesta ordem: `AGENTS.md` e `docs/architecture/conciliacao.md`; `README.md`; `TASKS.md` (índice, seção TASK-037, dependências e Scope Guard); ADRs relacionados em `docs/adr/`, `docs/architecture/architecture.md`, `api.md`, `data-model.md`, `testing.md`, `parametros.md` e diagramas relevantes; depois código/testes dos módulos afetados quando existirem. Conferir respostas de origem em `docs/sources/elicitacao-final.md` nas regras relacionadas. Recuperar autorização, plano, histórico e relatórios anteriores; ausência deve ser registrada. Consultar `roteiro-testes-manuais.md` desta pasta.

## 5. ARQUIVOS E COMPONENTES ENVOLVIDOS

ALLOWED CHANGES da TASK (limites de caminho **e finalidade**, não autorização automática desta etapa):

- docs/validation/final.md
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

Foco de componentes/impactos: Revisão final de todas fases: requisitos, evidências reais, decisões pendentes, DoD e gates acumulados. Não usar relatórios documentais como prova de aplicação. Não alterar produção; não entregar como concluído enquanto houver teste manual obrigatório pendente.

Na etapa 001 apenas leitura; planejamento não altera produção; revisão apenas leitura; execução manual altera somente dados de teste e evidência autorizada. Planejar explicitamente impactos em arquitetura, persistência, APIs, interfaces, segurança e testes; N/A precisa de causa concreta. Localizar componentes existentes sem inventar métodos, classes ou tabelas extras.

## 6. PROCEDIMENTO DETALHADO

1. Entregar `roteiro-testes-manuais.md` desta pasta ao responsável; detalhar todos os subcasos aplicáveis antes da execução, com comandos reais descobertos no projeto, fixtures descartáveis e evidências por caso. Testes planejados: TEST-001, TEST-002, TEST-003, TEST-004, TEST-005, TEST-006, TEST-007, TEST-008, TEST-009, TEST-010, TEST-011, TEST-012, TEST-013, TEST-014, TEST-015, TEST-016, TEST-017, TEST-018, TEST-019, TEST-020, TEST-021, TEST-022, TEST-023, TEST-024, TEST-025, TEST-026, TEST-027, TEST-028, TEST-029, TEST-030, TEST-031, TEST-032, TEST-033, TEST-034, TEST-035.
2. Responsável prepara Windows/WSL/Linux, verifica versões ratificadas, serviços e banco de teste separado. Para TASK-001 a revisão é documental, sem instalar runtime nem banco. Para clientes, usar navegador/dispositivo/emulador aprovado conectado aos serviços de teste; WSL não define plataforma mobile.
3. Caso seja necessário script, criá-lo apenas em caminho Allowed e na etapa de alteração autorizada. Exigir preflight, comandos reais, saída/exit code, log sem segredos, interrupção em falha e repetição segura. Não adicionar dependências/infra de produção. Se fora de escopo, SCOPE ESCALATION antes de criar.
4. Responsável aciona/acompanha cada comando e passo manualmente. Registrar ambiente, revisão de código, dados, hora, autor, comando, saída, resultado obtido e evidência. Teste automatizado disparado pelo responsável complementa o roteiro; não substitui interação/inspeção manual exigida. Agente aguarda devolução dessas evidências.
5. Cobrir casos positivos e negativos e fronteiras temporais antes/no limite/depois com relógio injetável restrito a testes; concorrência por requisições independentes e verificação persistida, nunca mocks sequenciais. Restaurar somente em banco/diretório isolados.
6. Para checkpoint, executar gates aplicáveis acumulados da fase, não só reler relatórios; TASK-037 revisa entrega acumulada. Diferenciar cenário ainda pertencente a fase futura de teste obrigatório faltante; justificar recorte, sem N/A que esconda falha ou requisito do incremento.
7. Após cada caso mostrar previstos, executados, aprovados, reprovados, bloqueados, pendentes, o que falhou e precisa repetir. Resultado em branco = NÃO EXECUTADO. Falha retorna a diagnóstico/correção/revisão/reexecução manual, com gates posteriores invalidados.
8. Aprovar somente com todos os casos obrigatórios executados e aprovados pelo responsável, sem pendências/bloqueios. Sem evidências humanas: estado IN_REVIEW com subestado AGUARDANDO TESTES MANUAIS (ou BLOCKED por impedimento externo), próxima etapa bloqueada. Não inventar execução nem encerrar a TASK.

## 7. RESTRIÇÕES

FORBIDDEN CHANGES (limite forte, prevalece sobre Allowed):

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.
- Alterar código de produção; falhas exigem tarefa de correção e revalidação.

Incidental Changes Policy: NO_INCIDENTAL_CHANGES

Nenhuma mudança fora do escopo primário é permitida nesta tarefa.

Aplicar os nove critérios de AGENTS antes de qualquer incidental: necessidade, causalidade, minimalidade, escopo funcional, negócio, arquitetura, contrato, segurança e proibição. Sem orçamento para alterações dispersas. IDs são permanentes; não alterar fonte final nem tratar ADR PROPOSED como ACCEPTED. Sem refatoração ampla, cobrança real, publicação ou apresentação. Carrinho não reserva; USER separado de ADMIN/OPERATOR; estorno pós-venda só ADMIN. Preservar integralmente as regras de prazo, dinheiro, conta e relatórios das fontes.

## 8. VALIDAÇÕES

Vincular cada saída da etapa a arquivo/trecho, comando/procedimento, ambiente, resultado/exit code e evidência. Critério de aceite: Todos gates aplicáveis e pendências impeditivas resolvidos; documentos não substituem evidência de software. Nenhuma tarefa iniciada nesta revisão documental.

Testes da TASK: TEST-026, TEST-027, TEST-028, TEST-029, TEST-030, TEST-031. Executar apenas cenários aplicáveis ao módulo e regressões diretamente afetadas; nos checkpoints, executar os gates acumulados da fase.

Usar roteiro manual, com recorte explícito do incremento e casos adicionais exigidos pelo aceite. Gates globais GATE-01 a GATE-08 de AGENTS são distintos dos gates locais GATE-001 a GATE-005. Build/tipos/lint/testes aplicáveis continuam obrigatórios; execução automática pelo agente não substitui validação manual. Sem comandos existentes, registrar lacuna; não usar comandos presumidos nem registrar PASS.

## 9. TRATAMENTO DE FALHAS

Interromper avanço; registrar operação/comando, ambiente, código de saída, erro completo sem segredos e evidência. Separar FATO CONFIRMADO, EVIDÊNCIA, INFERÊNCIA, HIPÓTESE e PENDÊNCIA. Diagnosticar causa e avaliar Allowed/Forbidden/Incidental. Fazer somente menor correção autorizada; repetir a validação afetada e atualizar o gate, invalidando gates posteriores dependentes. Em revisão somente de leitura ou teste manual, devolver correção à etapa autorizada e revisar novamente. Produção proibida nesta TASK não pode ser corrigida nela. Erro de execução/validação: FAILED conforme AGENTS; dependência/decisão externa ausente: BLOCKED. Nenhum teste vira APROVADO sem reexecução manual. Preservar trabalho e não remover teste, desativar validação nem trocar concorrência real por mock sequencial.

## 10. SCOPE ESCALATION

Se necessário sair do escopo, parar e preencher o modelo de AGENTS.md sem inventar exceção:

```text
## SCOPE ESCALATION
TASK: TASK-037
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

GATE-003 — Testes manuais do checkpoint. Estado inicial: PENDENTE; não executado nesta geração.

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
| GATE-002 | Planejamento da validação acumulada | PENDENTE |
| GATE-003 | Testes manuais do checkpoint | PENDENTE |
| GATE-004 | Revisão final das evidências | PENDENTE |
| GATE-005 | Conclusão controlada | PENDENTE |

GATES TOTAIS: 5; GATES CONCLUÍDOS: 0; GATES PENDENTES: 5; GATES BLOQUEADOS: 0 (nenhum gate executado; execução atualmente não autorizada).

Em cada resposta atualizar a matriz inteira com evidências reais. Contagem: total = concluídos + pendentes + bloqueados; reprovado conta como bloqueado para avanço e mantém REPROVADO na linha. Critérios dentro de um gate não contam como etapas. Gate invalidado por correção deve voltar a pendente/bloqueado.

## 14. RESULTADO OBRIGATÓRIO

Entregar artefatos/evidências do procedimento; na conclusão incluir também o relatório integral de AGENTS §15. Finalizar a resposta com este bloco preenchido por resultados reais:

```text
==================================================
TASK: TASK-037
ETAPA: 003
STATUS DA ETAPA: APROVADA | REPROVADA | BLOQUEADA
==================================================
GATE DA ETAPA: APROVADO | REPROVADO | BLOQUEADO
GATES TOTAIS: 5
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
prompt-task-037-etapa-004-revisao-final.md
PRÓXIMA ETAPA HABILITADA:
SIM | NÃO
MOTIVO:
[evidência para habilitar, bloqueio concreto ou encerramento sem próxima etapa]
==================================================
```
