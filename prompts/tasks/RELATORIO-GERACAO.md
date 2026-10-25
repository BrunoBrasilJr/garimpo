# GERAÇÃO DE PROMPTS — RELATÓRIO FINAL

Data: 2026-10-25. Origem: pedido explícito do responsável no anexo “PROMPT MESTRE — GERADOR DE PROMPTS PARA EXECUÇÃO DE TASKS”. Escopo autorizado: analisar os documentos e gerar workflows, gates e roteiros; sem executar o backlog. A exigência adicional de testes manuais em Windows → WSL → Linux foi incorporada aos modelos, preservando os gates de qualidade existentes e sem ratificar plataforma de implantação.

STATUS DA GERAÇÃO: **CONCLUÍDA**. Pendências futuras de produto, tecnologia e execução estão registradas; não são decisões tomadas por esta geração.

## Entrega

| Item | Resultado |
| --- | ---: |
| TASKs identificadas | 37 — TASK-001 a TASK-037 |
| TASKs processadas documentalmente | 37 |
| Prompts numerados gerados | 217 |
| Pastas por TASK | 37 |
| Diretórios criados incluindo prompts/ e prompts/tasks/ | 39 |
| READMEs por TASK | 37 |
| README global | 1 |
| Etapas de testes manuais configuradas | 37 |
| Roteiros manuais gerados | 37 |
| Casos agrupados planejados | 464 |
| Casos executados nesta geração | 0 |

Consulta: [índice completo das TASKs, etapas e dependências](README.md), [inventário estruturado](manifesto.json), [evidência da validação](validacao-estrutura.json) e [hashes das fontes preservadas](fontes-sha256.json).

Os casos agrupados contêm sucesso, negativas, alternativas ou verificações transversais dos TEST existentes, além de aceite específico por incremento. A etapa de planejamento deve desdobrar condições em subcasos atômicos, preencher comandos/fixtures reais e recalcular o denominador antes de executar. Os 464 casos não representam 464 resultados aprovados nem quantidade definitiva de operações de teste.

## Workflows definidos

- TASK-001: prontidão → planejamento → decisões documentais → revisão → testes manuais documentais → conclusão. A entrada não exige ter resolvido as próprias propostas; aprovação de decisões requer evidência explícita do responsável.
- TASKs de implementação: prontidão → planejamento → implementação restrita → revisão → testes manuais → conclusão.
- TASK-031/033/034/035: prontidão → planejamento → preparação de validação → revisão → testes manuais → conclusão. Não autoriza corrigir produção quando a TASK proíbe essa alteração.
- TASK-036: prontidão → planejamento → documentação operacional → revisão → reprodução manual → conclusão.
- Checkpoints TASK-007/015/024/032/037: prontidão → planejamento da validação acumulada → testes manuais → revisão final das evidências → conclusão. Gates aplicáveis da fase devem ser executados; a entrega final acumula todo o projeto.

Contexto e histórico estão integrados à prontidão; pré-condições e baseline são retomados no planejamento. Não foram criadas etapas independentes só para reproduzir o exemplo do prompt mestre.

Todos os prompts têm 14 seções, Scope Guard transcrito, gate próprio, matriz acumulada, diagnóstico/correção/revalidação, escalonamento e bloco final padronizado. Cada etapa exige evidência atual da anterior. Os gates locais GATE-001… são distintos de GATE-01…08 do AGENTS. Falha ou correção invalida resultados posteriores que dependiam do estado anterior. A próxima TASK exige autorização própria, salvo continuidade explicitamente autorizada.

## Scripts e roteiros de teste

Foram criados 37 roteiros em `task-NNN/roteiro-testes-manuais.md`, com expectativas extraídas das fontes, operações específicas por cenário, preparação Windows/WSL/Linux, resultados e evidências a preencher. Todos começam NÃO EXECUTADOS.

Não foram criados scripts de teste da aplicação: não existe manifest, comando executável de aplicação ou stack ratificada que permita escrevê-los sem presumir tecnologias. Os prompts futuros exigem localizar comandos reais e, quando necessário, produzir scripts somente em caminhos autorizados, com verificação de pré-requisitos, captura de código de saída, logs sem segredos, interrupção em falha e repetição segura. Comando necessário ainda indefinido bloqueia a validação correspondente. A instalação do WSL ou de dependências não foi executada.

O responsável deve executar e acompanhar os passos manualmente, inclusive comandos de suites aplicáveis. Resultados automáticos do agente não substituem essa etapa. Sem retorno de evidência humana, aguardar testes; não marcar DONE. Corrigido um defeito, revisar a correção e repetir manualmente os casos afetados antes de aprovar.

## Problemas encontrados e tratamento

| Item | Tratamento documental |
| --- | --- |
| Ausência de Git, branches e histórico | Registrar N/A real; não inicializar Git. Bootstrap futuro somente na TASK-002 autorizada. |
| Stack e seis ADRs PROPOSED | Preservar condição de proposta; decisão e versões serão verificadas na TASK-001 autorizada. |
| Ausência de código, serviços, banco e comandos de teste | Registrar lacuna e exigir descoberta/configuração no incremento autorizado; não inventar comandos/resultados. |
| TASK-033 exige TEST-001 a TEST-025 no aceite, mas enumeração de testes omite TEST-025 | Incluir TEST-025 no roteiro pelo aceite explícito, preservando o backlog original e registrando a divergência. |
| Desempenho/retomada/restauração têm detalhamento em conjuntos transversais | TASK-034 também referencia TEST-026/027/031; TASK-035 inclui TEST-029, conforme objetivo/estratégia. |
| Casos transversais abrangem incrementos futuros | Exigir recorte rastreável e TASK de validação futura; não antecipar implementação nem declarar obrigação atual N/A para esconder ausência. |

Durante a validação da geração, a extração inicial de dependências incluiu menções explicativas posteriores a `DEPENDS_ON`. Isso foi corrigido: TASK-016 depende de TASK-015/014, sem duplicação; TASK-019 depende apenas de TASK-018, sem dependência circular de TASK-025. A conferência final compara as dependências geradas diretamente à linha `DEPENDS_ON` de todas as 37 tarefas.

## Decisões necessárias antes da execução

Autorização futura explícita é necessária para todas as TASKs; READY não a substitui. Nenhuma autorização de implementação foi concedida pelo pedido de geração.

| Pendência existente | TASKs/trechos afetados |
| --- | --- |
| PD-001 — prazo e critérios acadêmicos | TASK-036/037, somente trechos dependentes |
| PD-002 — ambiente e plataformas | TASK-001/002/033 e consumidores das decisões |
| PD-003 — exigências formais adicionais | TASK-033/037 |
| PD-004 — cobertura, preços e prazos do frete | TASK-018 |
| PD-005 — stack, versões, segurança e mecanismos técnicos | TASK-001 resolve propostas; módulos dependentes usam decisões ratificadas |
| PD-006 — Goldmine, avaliação e tipos de promoções | TASK-008/013/014 |
| PD-007 — volumes, metas e método de desempenho | TASK-034 e verificações dependentes |
| PD-008 — retenção e política de backup | TASK-022/030/035 |
| PD-009 — frete em devoluções parciais sucessivas | Caso específico da TASK-026 |

As pendências não exigem reabrir respostas já confirmadas no PDF. Questão acadêmica secundária não bloqueia módulos independentes. Valores e decisões futuras precisam de origem, responsável e data, sem aprovação presumida.

## Validação da estrutura

- [x] Nomenclatura validada.
- [x] Numeração contínua por TASK validada.
- [x] Sequência validada e adaptada à natureza de cada TASK.
- [x] Dependências conferidas contra DEPENDS_ON; referências existentes, ordem topológica e ausência de ciclos.
- [x] Gates locais definidos, inicialmente pendentes, com predecessores e matriz acumulada.
- [x] Tratamento de falhas, correção mínima e revalidação definidos.
- [x] SCOPE ESCALATION e BLOCKER definidos.
- [x] Etapa e roteiros de testes manuais definidos em todas as TASKs.
- [x] Critérios de avanço e parada definidos, sem execução automática da etapa seguinte.
- [x] Scope Guard e políticas incidentais preservados em todos os prompts.
- [x] Links locais conferidos.
- [x] Fontes originais preservadas por SHA-256.

Procedimentos reais: inventário dos arquivos; leitura e extração de metadados de TASKS/README/arquitetura/API/dados/testes/ADRs; geração documental por Python 3.8.10; validação estrutural com Python; inspeção textual de amostras, incluindo decisão documental, troca e checkpoint final; comparação SHA-256 dos 81 arquivos preexistentes. Ferramentas temporárias de geração/verificação removidas ao fechar a entrega. Resultados e nomes das verificações constam do JSON, sem afirmar prova formal de consistência semântica.

GATE-07 de aceitação **da geração documental**: atendido pela estrutura e conteúdo solicitados, com validação estrutural aprovada. Build/tipos/lint/unitários/integração/API/carga/restauração de software: N/A nesta geração, por inexistência de implementação e ausência de autorização para executá-la. Testes manuais futuros: NÃO EXECUTADOS. Isso não é PASS de software nem fechamento de TASK.

## Preservação e estado final

PRIMARY: novos arquivos Markdown/JSON exclusivamente em `prompts/tasks/`. Incidental Changes: NONE. README raiz, TASKS, AGENTS, fontes, ADRs e documentos de arquitetura originais não foram alterados. Nenhum estado de TASK mudou. Nenhuma branch, commit, dependência da aplicação, banco, migration, interface ou infraestrutura foi criado.

TASK-001 continua READY no backlog e sem autorização atual de execução; demais 36 permanecem BLOCKED. Todos os gates dos workflows e todos os testes manuais continuam pendentes/não executados. A geração concluída não significa que qualquer TASK foi iniciada ou concluída.
