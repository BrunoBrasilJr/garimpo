# Backlog de implementação do Garimpo

Reconciliado com o PDF final por autorização do responsável. IDs TASK-001 a TASK-037 preservados; escopos e critérios corrigidos. A revisão dos documentos não inicia implementação. TASK-001 permanece READY; demais tarefas BLOCKED por dependências não concluídas.

**Uso futuro:** o responsável informou que a etapa atual é somente documental. READY não autoriza execução agora; nenhuma TASK, inclusive TASK-001, deve ser iniciada por um pedido genérico de continuar a documentação.

## Índice de execução

| Ordem | TASK | Fase | Prioridade | Dependências | Estado |
| --- | --- | --- | --- | --- | --- |
| 1 | TASK-001 Validar decisões técnicas e parâmetros pendentes | PHASE-01 | CRITICAL | NONE | DONE |
| 2 | TASK-002 Preparar estrutura de desenvolvimento | PHASE-01 | CRITICAL | TASK-001 | DONE |
| 3 | TASK-003 Criar persistência e fundação transacional | PHASE-01 | CRITICAL | TASK-002 | DONE |
| 4 | TASK-004 Implementar contas, autenticação e gestão interna na API | PHASE-01 | CRITICAL | TASK-003 | DONE |
| 5 | TASK-005 Implementar recuperação, confirmação e mensagens de acesso | PHASE-01 | HIGH | TASK-004 | DONE |
| 6 | TASK-006 Criar interfaces de contas e administração interna | PHASE-01 | HIGH | TASK-004, TASK-005 | DONE |
| 7 | TASK-007 Checkpoint PHASE-01 | PHASE-01 | CRITICAL | TASK-003, TASK-004, TASK-005, TASK-006 | DONE |
| 8 | TASK-008 Implementar catálogo, metadados e imagens na API | PHASE-02 | HIGH | TASK-007 | DONE |
| 9 | TASK-009 Administrar catálogo e estoque inicial | PHASE-02 | HIGH | TASK-008 | DONE |
| 10 | TASK-010 Criar catálogo público no site | PHASE-02 | HIGH | TASK-008 | DONE |
| 11 | TASK-011 Criar catálogo público no aplicativo | PHASE-02 | HIGH | TASK-008 | DONE |
| 12 | TASK-012 Implementar desejos e alertas de disponibilidade | PHASE-02 | HIGH | TASK-008, TASK-009, TASK-010, TASK-011 | DONE |
| 13 | TASK-013 Implementar avaliações e moderação | PHASE-02 | MEDIUM | TASK-008, TASK-010, TASK-011 | DONE |
| 14 | TASK-014 Implementar administração de cupons e promoções | PHASE-02 | HIGH | TASK-009 | DONE |
| 15 | TASK-015 Checkpoint PHASE-02 | PHASE-02 | CRITICAL | TASK-009, TASK-010, TASK-011, TASK-012, TASK-013, TASK-014 | DONE |
| 16 | TASK-016 Implementar carrinho e reserva única de checkout | PHASE-03 | CRITICAL | TASK-015, TASK-014 | BLOCKED |
| 17 | TASK-017 Criar carrinho e reserva nas interfaces | PHASE-03 | HIGH | TASK-016 | BLOCKED |
| 18 | TASK-018 Implementar frete, cotação e pedidos | PHASE-03 | CRITICAL | TASK-016, TASK-014 | BLOCKED |
| 19 | TASK-019 Implementar simulador, cobranças e estornos automáticos | PHASE-03 | CRITICAL | TASK-018 | BLOCKED |
| 20 | TASK-020 Criar checkout e simulação nos clientes | PHASE-03 | HIGH | TASK-017, TASK-018, TASK-019 | BLOCKED |
| 21 | TASK-021 Implementar histórico e logística manual | PHASE-03 | HIGH | TASK-019 | BLOCKED |
| 22 | TASK-022 Implementar bloqueio, encerramento e reativação de contas | PHASE-03 | HIGH | TASK-019, TASK-021 | BLOCKED |
| 23 | TASK-023 Integrar regras comerciais e validar fronteiras | PHASE-03 | CRITICAL | TASK-012, TASK-013, TASK-016, TASK-018, TASK-019, TASK-020, TASK-021, TASK-022 | BLOCKED |
| 24 | TASK-024 Checkpoint PHASE-03 | PHASE-03 | CRITICAL | TASK-020, TASK-021, TASK-022, TASK-023 | BLOCKED |
| 25 | TASK-025 Implementar cancelamentos e indisponibilidade parcial | PHASE-04 | HIGH | TASK-024 | BLOCKED |
| 26 | TASK-026 Implementar devoluções, inspeção e evidências | PHASE-04 | HIGH | TASK-025 | BLOCKED |
| 27 | TASK-027 Implementar trocas, ofertas e prazos | PHASE-04 | HIGH | TASK-026 | BLOCKED |
| 28 | TASK-028 Criar interfaces de pós-venda | PHASE-04 | HIGH | TASK-025, TASK-026, TASK-027 | BLOCKED |
| 29 | TASK-029 Implementar relatórios financeiros e comerciais | PHASE-04 | MEDIUM | TASK-026, TASK-027 | BLOCKED |
| 30 | TASK-030 Implementar backup diário completo | PHASE-04 | HIGH | TASK-024 | BLOCKED |
| 31 | TASK-031 Revisar auditoria e segurança integrada | PHASE-04 | CRITICAL | TASK-028, TASK-029, TASK-030 | BLOCKED |
| 32 | TASK-032 Checkpoint PHASE-04 | PHASE-04 | CRITICAL | TASK-028, TASK-029, TASK-030, TASK-031 | BLOCKED |
| 33 | TASK-033 Executar aceitação funcional e acessibilidade | PHASE-05 | HIGH | TASK-032 | BLOCKED |
| 34 | TASK-034 Validar desempenho e concorrência | PHASE-05 | CRITICAL | TASK-032 | BLOCKED |
| 35 | TASK-035 Executar restauração isolada | PHASE-05 | HIGH | TASK-030, TASK-032 | BLOCKED |
| 36 | TASK-036 Consolidar documentação operacional | PHASE-05 | HIGH | TASK-033, TASK-034, TASK-035 | BLOCKED |
| 37 | TASK-037 Checkpoint PHASE-05 e entrega da implementação | PHASE-05 | CRITICAL | TASK-033, TASK-034, TASK-035, TASK-036 | BLOCKED |

## Regras operacionais

Respeitar AGENTS.md, requisitos do README e ADRs. READY indica prontidão, não aprovação automática de código. Não usar a revisão documental como evidência de testes ou como conclusão de TASK-001.

Estados e índice devem concordar. Fase seguinte exige checkpoint anterior DONE; validar dependências e artefatos, não só etiqueta. PDs bloqueiam o trecho dependente, sem inventar números/decisões. TASK-001 é documental: define propostas técnicas necessárias ao início, podendo manter pendências de fases futuras explícitas.

Integrações incrementais têm divisão explícita: avaliações recebem porta de elegibilidade em TASK-013 e adaptador real em TASK-023; atualização por devolução vem em TASK-026. Reserva de checkout/cupom em TASK-016; pedidos e limite de pendentes em TASK-018/023. Núcleo de estorno automático em TASK-019; cancelamento em TASK-025; autorização de pós-venda em TASK-026/027. Stub somente em testes; runtime não aprova operação com dependência ausente. Mensagens de acesso em TASK-005; eventos comerciais em TASK-019/021/025/026/027.

Allowed Changes é delimitado por caminho e finalidade. Campo compartilhado pode ser alterado apenas para o incremento indicado; não autoriza tarefa futura. Todas as tarefas podem atualizar seu registro em TASKS.md e prontidão comprovada de dependentes. Checkpoints sem alteração de código devem executar os gates da fase, não declarar N/A para a implementação.

## Tarefas detalhadas

### TASK-001 Validar decisões técnicas e parâmetros pendentes

#### Status

DONE

#### Phase

PHASE-01

#### Priority

CRITICAL

#### Objetivo

Ratificar propostas dos seis ADRs, stack herdada, ambiente/plataformas, segurança e parâmetros necessários ao início do desenvolvimento. Separar decisões do PDF de propostas técnicas.

#### Dependências

DEPENDS_ON: NONE

Tarefa documental de decisão; pode estar READY embora deva resolver suas próprias propostas.

#### Requisitos relacionados

N/A; N/A; RNF-001, RNF-006, RNF-007, RNF-008, RNF-010, RNF-012; N/A; ADR-001, ADR-002, ADR-003, ADR-004, ADR-005, ADR-006.

Justificativa técnica: fundação, qualidade ou operação exigida pelos RNFs/ADRs acima; não cria funcionalidade comercial autônoma.

#### Artefatos esperados

Ratificar propostas dos seis ADRs, stack herdada, ambiente/plataformas, segurança e parâmetros necessários ao início do desenvolvimento. Separar decisões do PDF de propostas técnicas. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

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

#### Incidental Changes Policy

NO_INCIDENTAL_CHANGES

Nenhuma mudança fora do escopo primário é permitida nesta tarefa.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar código, instalar dependências, configurar infraestrutura ou criar migrations.

#### Critérios de aceitação

Parâmetros necessários à fundação documentados com origem; decisões de produto restantes identificadas sem invenção. Sem código, dependência ou migration. Pendências de fases futuras podem continuar abertas com bloqueio explícito.

#### Testes necessários

Revisão documental de compatibilidade, ratificação de ADRs, conflitos e parâmetros; sem testes de aplicação nesta tarefa.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Iniciada documentalmente em 2026-10-25 após autorização explícita “autorizo” para sair da etapa documental e executar continuamente o backlog em ordem, respeitando bloqueios/checkpoints. A proibição temporal anterior permanece como histórico e é superada por essa instrução posterior. Meta informada: pelo menos 19/37 TASKs DONE, entrega parcial em 2026-10-26 às 13:20 (America/Sao_Paulo); responsável só pode trabalhar no domingo. Isso não dispensa DoR/DoD nem testes manuais.

DoR de entrada: PASS — sem DEPENDS_ON; tarefa existe para resolver suas próprias propostas. Inventário confirmou ausência de código e Git, preservando arquivos existentes. Branch: N/A; commits: N/A; não inicializar Git antes da TASK-002. PRIMARY: docs/architecture/parametros.md, seis ADRs relacionados e esta seção/índice; README somente pendências correspondentes quando atualizado. Incidental Changes: NONE.

Pacote de decisões preparado em docs/architecture/parametros.md: stack/ambiente, adaptadores, isolamento/repetição, dinheiro/outbox, sessão/hash/transporte e arquivos/backup. Consulta de fontes oficiais e inventário de ferramentas executados; sem instalar dependências, criar código, banco, migration ou infraestrutura. Seis ADRs ratificados pelo responsável em 2026-10-25: “Aprovo o pacote e conferi DOC-001/002”. Android disponível. DOC-001/002 e gate manual documental: APROVADOS por confirmação explícita, sem alegar teste de software. Pendências futuras continuam delimitadas.


##### TASK Execution Report — fechamento TASK-001

Status: DONE. Branch: N/A; Commits: N/A — não existe Git; sua criação pertence à TASK-002.

Primary Changes: seis ADRs ACCEPTED com histórico preservado; parâmetros técnicos, ambiente, segurança, concorrência, eventos e arquivos ratificados; README somente decisões/pendências correspondentes; registro da autorização e entrega parcial. Os nove arquivos alterados pertencem ao Allowed Changes.

Incidental Changes: NONE.

Tests Executed: consulta documental de fontes oficiais; inventário real Windows/Ubuntu WSL2; verificação Python de 37 TASKs, seis ADRs e comparação SHA-256 com snapshot anterior: somente os nove arquivos permitidos alterados. Antes da ratificação, conferidos ausência de Git/package/apps e estado PROPOSED; depois, conferir ACCEPTED e registro da decisão. DOC-001/002: responsável confirmou leitura/conferência/aprovação em resposta explícita de 2026-10-25. Nenhum teste de aplicação executado.

Quality Gates: Build N/A (documentação); Lint N/A (documentação, sem configuração de lint); Unit Tests N/A (sem código); Integration Tests N/A (sem persistência implementada); API Tests N/A (sem endpoint); Security PASS documental (parâmetros, isolamento de canal/dados e ausência de segredos; não auditoria de runtime); Acceptance Criteria PASS (decisões da fundação ratificadas e pendências futuras delimitadas); Regression Tests N/A de software (nenhuma implementação), preservação documental conferida por hash/IDs.

Scope Validation: Allowed Changes PASS; Incidental Changes NONE; Forbidden Changes PASS; Scope Creep NONE. Definition of Done: PASS documental, incluindo confirmação manual real do responsável.

Gates locais: prontidão, planejamento, decisões documentais, revisão, testes manuais documentais e conclusão APROVADOS; total 6, concluídos 6, pendentes 0, bloqueados 0. Next Eligible TASK: TASK-002, mediante revalidação da DoR. Continuidade já autorizada; não estende escopo nem dispensa seus próprios gates.

### TASK-002 Preparar estrutura de desenvolvimento

#### Status

DONE

#### Phase

PHASE-01

#### Priority

CRITICAL

#### Objetivo

Preparar workspaces API/web/mobile e contratos conforme stack/plataforma ratificadas; bootstrap mínimo sem negócio.

#### Dependências

DEPENDS_ON: TASK-001

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

N/A; N/A; RNF-008, RNF-012; N/A; ADR-001.

Justificativa técnica: fundação, qualidade ou operação exigida pelos RNFs/ADRs acima; não cria funcionalidade comercial autônoma.

#### Artefatos esperados

Preparar workspaces API/web/mobile e contratos conforme stack/plataforma ratificadas; bootstrap mínimo sem negócio. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- package.json
- arquivo de lock do gerenciador escolhido
- tsconfig*
- apps/api configuração e bootstrap
- apps/web configuração e bootstrap
- apps/mobile configuração e bootstrap
- packages/contracts configuração
- tests configuração
- docs/architecture/execution.md
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

Ampliação explícita autorizada pelo responsável em 2026-10-25, após proposta concreta e SCOPE ESCALATION: “Autorizar correção e validação propostas”. Acrescentar como PRIMARY exclusivamente:

- patches/node-forge+1.4.0.patch e manifesto de versão/hashes da correção
- tests/bootstrap/security/** — regressão ASN.1 e compatibilidade das schemas reais da CLI Expo
- tests/bootstrap/apply-toolchain-patch.mjs — instalação determinística, conferência de versão/hash e falha em divergência
- node_modules/node-forge/lib/rsa.js — aplicação derivada do patch na instalação, não versionar node_modules
- package.json/lock — postinstall, override transitivo Zod corrigido e comandos de validação associados

Critério complementar autorizado para GATE-06: manter auditoria integral e sua saída real. O aviso remanescente de versão de node-forge só pode ser avaliado como mitigado com patch/hash exatos, regressão antes/depois, instalação limpa e gates afetados aprovados; não registrar npm audit falho como PASS, não aceitar avisos novos/não mitigados e não dispensar revisão/testes manuais. Não amplia funcionalidades, não desativa validação e não muda SDK/arquitetura. Escalonamento anterior preservado como histórico; retornar à execução autorizada da correção.

Correção de segurança da retomada em 2026-11-01, sob instrução posterior explícita do responsável de seguir autonomamente sem novas permissões genéricas: PRIMARY adicionais limitados a patches/deepmerge+4.3.1.patch, patches/deepmerge+4.3.1.json e patches/node-forge+1.4.2.json, regressões em tests/bootstrap/security/** e evolução dos mesmos instalador/verificador de patch existentes. node_modules/deepmerge/index.js, dist/cjs.js e dist/umd.js são resultados derivados da aplicação do patch, nunca versionados. Decisão técnica do agente sob a delegação recebida, não atribuir ao responsável aprovação nominal dos novos hashes ou ao PDF requisitos de biblioteca. Substituir node-forge transitivo por release upstream 1.4.2, fixar minimatch 11.0.3/glob 14.0.3 e mitigar deepmerge 4.3.1 por duas guardas de chave __proto__ reproduzíveis; manter SDK 57, módulos comerciais e arquitetura. A nova mitigação exige reprodução antes/depois, hash, compatibilidade e instalação limpa; não autoriza aceitar aviso não mitigado nem ocultar auditoria. Arquivos legados node-forge 1.4.0 permanecem como histórico, não como exceção válida para novos achados.

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Build/tipos/lint executáveis, configuração sem segredo e instruções reproduzíveis. Não fixar Android exclusivo antes de PD-002.

#### Testes necessários

TEST-028, TEST-030. Executar apenas cenários aplicáveis ao módulo e regressões diretamente afetadas; nos checkpoints, executar os gates acumulados da fase.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Iniciada em 2026-10-25 sob autorização contínua. DoR PASS: TASK-001 DONE, seis ADRs ACCEPTED e DOC-001/002 confirmados pelo responsável; parâmetros/plataformas necessários definidos. Baseline de software: inexistente, primeiro bootstrap. Plano PRIMARY: package.json/lock, tsconfig, API/web/mobile bootstrap, contracts, configuração de testes e docs/architecture/execution.md. Incidental previsto: .gitignore para excluir dependências/segredos/builds da estrutura Git (necessário, causal, mínimo, sem funcionalidade/negócio/arquitetura/contrato/segurança alterados; nenhum Forbidden). Git será inicializado nesta tarefa; branch real registrada após criação. Sem banco/migrations/contas/catálogo nesta tarefa. Gates e testes manuais ainda pendentes.

Reabertura em 2026-11-01: auditoria nova do checkpoint detectou regressão externa de segurança na toolchain, baseline FAIL. Correção em fix/TASK-002-toolchain-security, base 9297f20 que preserva o checkpoint BLOCKED. TASK-001 continua DONE; código de negócio não foi alterado. Gate conhecido não aprovado: 23 pacotes afetados, relatório original copiado para test-results/toolchain-20261101/audit-before.json. Estado atual IN_PROGRESS da correção; conclusão histórica de 25/10 permanece registrada, mas não aprova o novo baseline. Nenhuma nova TASK foi criada para inflar contagem.

Revisão posterior em 2026-11-01: correção de código em 2ebf90a, sem alterações comerciais ou de SDK. Instalação limpa Linux do mesmo commit PASS (804 pacotes, preinstall/postinstall e quatro arquivos revisados conferidos), build/tipos/lint PASS, 45 unitários e 39 integrações PASS. npm audit bruto FAIL/exit 1 com sete low e zero moderate/high/critical; política restrita PASS somente para a cadeia deepmerge com hashes verificados, release Forge corrigida obrigatória e rejeição de avisos desconhecidos. Exportação Android PASS, 586 módulos. E2E inicial FAILED por três timeouts; segunda rodada FAILED em um cadastro ainda aguardando resposta após dez segundos. Sem alterar fonte, scrypt, TLS ou limites dos testes, após pausar a cópia própria de dependências e liberar caches do Ubuntu, terceira rodada integral PASS, sete casos. As falhas anteriores estão preservadas. Transição de validação FAILED → IN_PROGRESS → IN_REVIEW → DONE; não declarar que as rodadas iniciais passaram. Total da rodada válida: 91 casos distintos. Evidências: test-results/toolchain-20261101/native-clean-and-gates.log, native-ui-recheck.log, native-ui-memory-recheck.log e audit-after.json. Testes novos pelo agente, sem inventar nova inspeção humana ou TalkBack. Restauração de node_modules no caminho Windows segue como cópia operacional independente, sem alterar a instalação Linux limpa validada; não usar a árvore parcial antes da conclusão/conferência.

##### TASK Execution Report — correção de 2026-11-01

TASK: TASK-002. Status: DONE. Branch: fix/TASK-002-toolchain-security. Commit de código: 2ebf90a; este fechamento documental será conferido no log Git, sem hash antecipado.

Primary Changes: package.json e package-lock.json; patches/deepmerge+4.3.1.json e .patch; patches/node-forge+1.4.2.json; tests/bootstrap/apply-toolchain-patch.mjs; tests/bootstrap/security/audit-policy.mjs, audit-policy.test.ts, check-audit.mjs, deepmerge.test.ts, forge.test.ts, toolchain-compatibility.test.ts e toolchain-integrity.mjs; TASKS.md e docs/architecture/execution.md. Todos PRIMARY na ampliação rastreada desta TASK. Incidental Changes: NONE.

Tests Executed: npm ci --no-audit --no-fund, npm run verify, npm run bundle:android e npm run test:account-ui, no checkout Linux isolado da revisão 2ebf90a, Node 24.22.1/npm 11.19.1, PostgreSQL 17 e schemas separados em garimpo_test. Instalação com scripts, build/tipos/lint, 45 unitários, 39 integrações e sete E2E PASS; exportação Android PASS. Nenhum reset/drop/truncate da base original. E2E final mantém limites originais e valida TLS real, inclusive negativa sem CA. Rodadas anteriores falhas preservadas, sem serem contadas como PASS.

Quality Gates: Build PASS; Lint PASS; Unit Tests PASS; Integration Tests PASS; API Tests PASS nos fluxos existentes exercitados; Security PASS no critério restrito de mitigação reproduzível, com npm audit bruto FAIL/exit 1 e sete low preservados; Acceptance Criteria PASS; Regression Tests PASS. Aceites humanos de bootstrap anteriores permanecem históricos, pois não houve alteração de interface ou SDK; não se declara nova inspeção física ou leitor de tela.

Scope Validation: Allowed Changes PASS; Incidental Changes NONE; Forbidden Changes PASS; Scope Creep NONE. Definition of Done: PASS. Next Eligible TASK: TASK-007, retomada do checkpoint preservado e reavaliação documental dos gates acumulados; TASK-008 ainda não iniciada neste fechamento. Continuidade já autorizada.


Falha de validação em 2026-10-25: npm run verify PASS (build/tipos/lint e 1 teste real de socket), bundle Android PASS (580 módulos), página inicial renderizada no navegador. npm audit --audit-level=high FAIL, saída 1: cinco avisos altos transitivos do Expo, origens node-forge (GHSA-86w9-cpqp-85rv) e zod (GHSA-mrhx-c7xc-m3w5). Diagnóstico em andamento; não usar npm audit fix --force (sugere downgrade incompatível para Expo 44), não desabilitar auditoria. Gate de segurança falhou; revisão/manual/conclusão não aprovados. Preservar correção no escopo da configuração de dependências e repetir gates afetados. Evidência: test-results/bootstrap/agent-verification.log.

##### SCOPE ESCALATION

TASK: TASK-002
Necessidade identificada: mitigar avisos altos de node-forge/Zod transitivos do Expo e comprovar correção reprodutível.
Motivo: npm audit falhou; node-forge 1.4.0 não tem release corrigida publicada.
Arquivos/módulos afetados: patches/node-forge+1.4.0.patch, tests/bootstrap/security/**, package.json/lock, docs/architecture/execution.md, esta TASK.
Allowed Changes atual: bootstrap/configuração nos workspaces, contratos, testes e documento de execução; não inclui patch de verificação criptográfica de terceiro.
Forbidden Changes relacionado: não refatorar módulos alheios, não desabilitar validação nem alterar arquitetura/requisitos; nenhuma dessas proibições será dispensada pela proposta.
Por que não é uma Incidental Change: critério 8 de segurança reprovado; requer escopo primário explícito para patch/testes.
Impacto se não realizada: gate de segurança continua falhando, TASK-002 não DONE e TASK-003 bloqueada.
Alternativas: ampliar escopo com patch reprodutível/testes e evidência de mitigação; aguardar release upstream; decisão específica de ferramenta. Downgrade forçado Expo 44 descartado.
Recomendação: aprovar correção mínima revisada, com testes antes/depois, instalação limpa, schemas Expo e auditoria mantida; detalhes e diff proposto em docs/architecture/execution.md.
Decisão necessária: responsável autorizar esses caminhos como PRIMARY e avaliar o aviso de versão remanescente somente com evidência de patch/hash/testes, sem chamar auditoria falha de PASS nem dispensar teste manual. Nenhuma correção de dependência fora do escopo aplicada.

##### BLOCKER

TASK: TASK-002
Problema: falha de segurança de dependência transitiva; release de node-forge corrigida ausente e mitigação requer ampliação explícita do escopo.
Impacto: não concluir estrutura nem iniciar TASK-003; código de bootstrap e testes preservados.
RF/RN/RNF/UC/ADR afetados: RNF-001, RNF-002, RNF-008, RNF-012; ADR-001/005; tarefa técnica sem RF autônomo.
Alternativas: as descritas em SCOPE ESCALATION.
Recomendação: correção mínima com teste/revisão e evidência verificável; não ignorar gate.
Decisão necessária: aprovação do responsável sobre proposta concreta de ampliação/mitigação; enquanto ausente, manter BLOCKED.

##### TASK Execution Report — interrupção por bloqueio

TASK: TASK-002. Status: BLOCKED (histórico: IN_PROGRESS, FAILED por audit, depois BLOCKED por release/decisão externa). Branch: chore/TASK-002-estrutura-desenvolvimento. Commit documental de base: 218052f; implementação ainda não marcada como concluída.

Primary Changes: API operacional /health, contratos operacionais, telas iniciais web/mobile, manifests/tsconfig, lockfile, configuração ESLint/Vitest, teste real de socket, preflight/roteiro manual e docs/architecture/execution.md. Sem banco, migration, negócio ou tarefa futura.

Incidental Changes:

| Arquivo/Componente | Alteração | Justificativa |
| --- | --- | --- |
| .gitignore | Excluir dependências, artefatos e configuração local | Indispensável à estrutura Git, consequência direta, mínima; sem regra, contrato, arquitetura ou comportamento de autenticação alterados; nenhum Forbidden |
| .gitattributes | Binários preservados e LF para fontes/scripts | Compatibilidade Windows/WSL e preservação dos bytes; mínima e direta; sem funcionalidade/negócio/contrato/segurança de runtime alterados; nenhum Forbidden |
| .nvmrc | Fixar runtime ratificado | Preparação reproduzível do bootstrap; mínima e direta; sem funcionalidade ou mudança de decisão; nenhum Forbidden |

Tests Executed: npm install no Ubuntu WSL2/Node 24.22.1; npm run verify PASS (build/tipos/lint, 1 teste de API real); npm run bundle:android PASS (580 módulos); página inicial observada por browser/árvore acessível e screenshot; JSON/configuração válidos; PDF original e blob Git com SHA-256 idênticos. npm audit --audit-level=high FAIL, saída 1, cinco avisos altos. Evidência: test-results/bootstrap/agent-verification.log e web.png. Testes manuais do responsável: NÃO EXECUTADOS.

Quality Gates: Build PASS; Lint PASS; Unit Tests N/A (nenhuma regra de negócio/função unitária no incremento; teste existente é integração HTTP); Integration Tests PASS (socket real, sem banco no escopo); API Tests PASS operacional (/health, cabeçalho e ausência de rota comercial); Security FAIL (auditoria); Acceptance Criteria FAIL/PENDENTE (segurança e gate manual impedem DoD); Regression Tests N/A de software anterior (não havia implementação), preservação documental/binária conferida.

Scope Validation: Allowed Changes PASS no que foi aplicado; Incidental Changes PASS nos três arquivos listados, sem efeito funcional independente; Forbidden Changes PASS; Scope Creep NONE. Patch de segurança é só proposta, não aplicado.

Definition of Done: FAIL. Gates locais: prontidão/planejamento aprovados; implementação/revisão sem aprovação final por segurança; testes manuais/conclusão pendentes. Next Eligible TASK: NONE enquanto TASK-002 não DONE. Nenhuma implementação posterior iniciada.

##### TASK Execution Report — revisão após correção autorizada

TASK: TASK-002
Status: IN_REVIEW — AGUARDANDO TESTES MANUAIS DO RESPONSÁVEL.
Branch: chore/TASK-002-estrutura-desenvolvimento.
Commits: 218052f (base documental/Git), 3c16119 (bootstrap com bloqueio registrado), 12ccab6 (correção autorizada, testes e compatibilidade). Não há merge ou execução de TASK-003.

Autorização de escopo adicional: responsável respondeu “Autorizar correção e validação propostas” em 2026-10-25. SCOPE ESCALATION anterior resolvido por essa decisão; proibições e testes manuais preservados. Histórico FAILED/BLOCKED acima não foi apagado; implementação retomada e revisão refeita após as correções.

### Primary Changes

- package.json/lock e tsconfig: quatro workspaces, Node Linux ratificado, versões/overrides e comandos reais de build/tipos/lint/testes; configuração de testes agora também checada pelo TypeScript.
- apps/api/**: bootstrap sem negócio, endpoint operacional /health e entrada compilada, sem x-powered-by, sem banco/contas/catálogo; HTTP apenas probe interna em loopback e configuração TLS para acesso futuro dos clientes.
- apps/web/** e apps/mobile/**: telas iniciais sem funcionalidade comercial; título acessível, ampliação/rolagem mobile; SDK 57 preservado, React 19.2.3, RN 0.86.3 e StatusBar 57.0.1 alinhados à matriz instalada; Android/iOS preservados, execução iOS não alegada.
- packages/contracts/** e tests/**: contrato operacional, configuração de qualidade, teste HTTP real, regressão de assinatura, schemas reais Expo/Zod e política que rejeita novos avisos ou relatórios incompletos; roteiro manual reproduzível com log/versões/revisão.
- patches/** e aplicação derivada em node_modules/node-forge/lib/rsa.js: patch exato e manifesto SHA-256, postinstall falha em versão/hash divergente; npm ci reaplicou correção, sem fork remoto, metadados falsos ou downgrade forçado.
- docs/architecture/execution.md e esta TASK/índice: instruções, evidência real, limitações e decisão de mitigação. Ambiente preparado sob autorização específica: Node isolado no WSL e bibliotecas libnspr4/libnss3/libasound2t64 (com libasound2-data), sem upgrade geral, banco ou tarefa futura.

### Incidental Changes

Três arquivos conforme tabela anterior: .gitignore, .gitattributes e .nvmrc. Critérios de necessidade/causalidade/minimalidade e ausência de funcionalidade/regra/arquitetura/contrato/autorização alterados satisfeitos; nenhum Forbidden. .gitattributes inclui LF para o patch, necessário à reprodução Windows/WSL. O patch de segurança é PRIMARY explicitamente autorizado, nunca classificado como incidental.

### Tests Executed

Ambiente: Ubuntu 24.04.4 WSL2, Node Linux 24.22.1, npm 11.19.1; código na pasta do projeto montada em /mnt/c. Comandos e resultados reais:

- npm run verify: PASS — build contratos/API/web, tipos dos quatro workspaces e testes, ESLint 10, 15 testes aprovados (HTTP 1, Forge 6, Expo/Zod 3, política da auditoria 5).
- Regressão antes do patch: dois casos inválidos foram aceitos e os testes falharam como esperado; depois da correção foram negados. Assinaturas legítimas preservadas e hash conferido.
- npm ci --no-fund --no-audit: PASS — instalação limpa, postinstall reaplicou o patch por versão/hashes exatos. Auditoria é executada separadamente e sua saída integral é preservada, não omitida do gate.
- npm update zod: corrigiu lockfile que havia retido Zod 3; repetição aprovou versão 4.6.7 e schemas reais.
- expo install --check: PASS, “Dependencies are up to date”, após alinhar patches exigidos pelo SDK; typecheck repetido PASS.
- npm run bundle:android: PASS após instalação limpa e novamente após patches nativos; 580 módulos e artefato Hermes exportado. Não é teste de aparelho.
- npm run audit:toolchain: PASS na classificação restrita autorizada; **npm audit bruto continua FAIL/exit 1**, quatro avisos altos de versão derivados exclusivamente de node-forge. Hash corrigido e testes comprovam mitigação local do aviso autorizado; Zod saiu do relatório. Aviso novo ou evidência incompleta bloqueia o comando.
- API compilada iniciada: /health retornou status ok/service garimpo-api por requisição real. Web renderizada em 127.0.0.1:5173, árvore acessível e screenshot conferidos.
- Metro inicializado em localhost:8081, sem erro após preparar bibliotecas Linux; encerrado intencionalmente para liberar a porta ao responsável. A invocação inicial com flags incompatíveis foi corrigida, sem alterar validações.
- bash -n da versão final do roteiro: PASS após reorganização da captura de log. Diff/JSON, 37 IDs, dependências sem ciclos, estados índice/seção, hash corrigido, Zod 4.6.7 e preservação do PDF conferidos; nenhum arquivo comercial/migration criado.

Evidências locais: test-results/bootstrap/security-before-patch.log, security-after-patch.log, security-clean-install.log, sdk-compatibility.log, audit-patched.json, metro-startup.log e web.png. Verificações acima são do agente. Atualização manual em 2026-10-25: responsável executou BOOT-001 na revisão 18a7ca8 e enviou saída completa; log test-results/bootstrap/manual-20261025T172543Z.log conferido, com build/tipos/lint, 15 testes e exportação Android concluídos. BOOT-001 PASS no critério autorizado, preservando npm audit bruto FAIL/exit 1 e quatro avisos conhecidos com patch/hash validado. Atualização BOOT-002: após roteiro web (tela em português, ampliação e console com recarga), responsável confirmou “tudo certo, mano!”; PASS manual em 2026-10-25, navegador/versão exatos não informados. BOOT-003 NÃO EXECUTADO; resposta anterior “.” não confirma teste. Contagem manual: previstos 3, executados/aprovados 2, pendentes 1. TASK-002 permanece IN_REVIEW e TASK-003 BLOCKED.

### Quality Gates

Build/tipos: PASS; Lint: PASS; Unit Tests: PASS (14); Integration Tests: PASS (HTTP real, sem banco no incremento); API Tests: PASS operacional, sem alegar contratos comerciais implementados; Security: PASS **no critério de mitigação expressamente autorizado**, auditoria bruta permanece FAIL conhecida/documentada; Acceptance Criteria: PENDENTE/FAIL para concluir enquanto gate manual faltar; Regression Tests: PASS nas fronteiras diretamente afetadas e reprodução antes/depois, sem alegar fluxos de negócio futuros.

### Scope Validation

Allowed Changes: PASS, incluindo ampliação explícita. Incidental Changes: PASS nos três arquivos listados. Forbidden Changes: PASS. Scope Creep: NONE. Implementação posterior: NONE.

### Definition of Done

FAIL/PENDENTE exclusivamente da aceitação manual e fechamento. Não marcar DONE por resultados automáticos. Gates locais: 001 prontidão APROVADO; 002 planejamento APROVADO; 003 implementação APROVADO no incremento; 004 revisão APROVADO no recorte técnico; 005 testes manuais PENDENTE; 006 conclusão PENDENTE. Totais: 6, concluídos 4, pendentes 2, bloqueados 0. Próxima etapa habilitada: testes manuais desta TASK; conclusão e TASK posterior NÃO habilitadas.

### Next Eligible TASK

NONE enquanto TASK-002 não DONE. TASK-003 somente poderá ser promovida após evidência manual, DoD/fechamento de TASK-002 e nova conferência integral de DoR. Autorização contínua permanece vigente, sem nova autorização genérica de execução necessária.

##### TASK Execution Report — fechamento com aceite manual (2026-10-25)

TASK: TASK-002
Status: DONE
Branch: chore/TASK-002-estrutura-desenvolvimento
Commits de implementação: 218052f, 3c16119, 12ccab6; preparação manual: 18a7ca8. Registro deste fechamento no commit documental subsequente, sem inventar hash antecipado.

Primary Changes: bootstrap e correção explicitamente autorizada conforme relatório anterior; neste fechamento somente TASKS.md e docs/architecture/execution.md, classificados PRIMARY. Sem mudança de código desde a verificação da revisão 18a7ca8.

Incidental Changes: permanecem somente .gitignore, .gitattributes e .nvmrc com justificativas da tabela anterior; nenhuma nova alteração incidental. Configuração temporária de rede foi executada pelo responsável após comandos explícitos: encaminhamento TCP 8081 vinculado ao IP Wi-Fi e regra Garimpo-Metro-8081 restrita a Wi-Fi/LocalSubnet. Remoção documentada em execution.md; ainda não confirmada, não alegar limpeza executada.

Tests Executed: BOOT-001 PASS pelo responsável, log manual-20261025T172543Z.log conferido (build, tipos, lint, 15 testes e exportação Android); BOOT-002 PASS confirmado após roteiro de tela/ampliação/console; BOOT-003 PASS após conexão local e cliente Expo Go compatível com SDK 57, bundle nativo 68.463 ms/708 módulos e confirmação “tudo funcionando, mano!” em resposta à tela sem erro/fonte ampliada. TalkBack NÃO EXECUTADO/DISPENSADO por instrução explícita “nunca, o talback é horrível pra desativar depois kk”; aceite manual revisado somente para este bootstrap, sem aprovar leitor de tela ou dispensar acessibilidade futura. Modelo/versão Android e versões exatas do navegador/cliente não fornecidos; não inferidos. iOS não executado.

Quality Gates: Build/tipos PASS; Lint PASS; Unit Tests PASS (14); Integration Tests PASS (HTTP real sem banco); API Tests PASS operacional; Security PASS no critério de mitigação explicitamente autorizado, npm audit bruto permanece FAIL/exit 1 com quatro avisos conhecidos; Acceptance Criteria PASS no recorte manual revisto pelo responsável; Regression Tests PASS conforme evidências anteriores. Documentação de fechamento: diff --check PASS. Sem repetição de builds por mudança exclusivamente documental.

Scope Validation: Allowed Changes PASS; Incidental Changes PASS conforme tabela anterior, NONE novas; Forbidden Changes PASS; Scope Creep NONE. Histórico de falhas e revisão anterior preservado, superado por este fechamento.

Definition of Done: PASS. Gates locais 001–006 APROVADOS; total 6, concluídos 6, pendentes obrigatórios 0. Três casos manuais executados/aprovados no recorte revisado; TalkBack dispensado não contado como teste aprovado. TASK-002 DONE no índice e seção.

Next Eligible TASK: NONE promovida neste fechamento. TASK-003 é a próxima candidata por ordem, com dependência TASK-002 satisfeita; permanece BLOCKED até revalidação integral de sua DoR, contratos e escopo. Continuidade previamente autorizada permanece vigente.

### TASK-003 Criar persistência e fundação transacional

#### Status

DONE

#### Phase

PHASE-01

#### Priority

CRITICAL

#### Objetivo

Preparar fundação de dados, transação, relógio, erros, auditoria, idempotência e outbox; não antecipar schemas comerciais.

#### Dependências

DEPENDS_ON: TASK-002

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

N/A; N/A; RNF-004, RNF-005, RNF-011, RNF-012; N/A; ADR-001, ADR-003, ADR-004, ADR-005.

Justificativa técnica: fundação, qualidade ou operação exigida pelos RNFs/ADRs acima; não cria funcionalidade comercial autônoma.

#### Artefatos esperados

Preparar fundação de dados, transação, relógio, erros, auditoria, idempotência e outbox; não antecipar schemas comerciais. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/api/src/core/**
- apps/api/src/persistence/**
- apps/api/prisma/** somente User, Session, PasswordReset, AuditLog, DomainEvent, DemoMessage, IdempotencyRecord
- tests/core/**
- packages/contracts/errors*
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/prisma/** somente EmailToken além das tabelas de fundação já listadas

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Rollback/idempotência e erros verificados; apenas tabelas de fundação e identidade. Sem aprovação automática de arquitetura ainda proposta.

#### Testes necessários

TEST-026, TEST-030, TEST-031. Executar apenas cenários aplicáveis ao módulo e regressões diretamente afetadas; nos checkpoints, executar os gates acumulados da fase.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

DoR validada em 2026-10-25: TASK-002 DONE, artefatos reais presentes, npm run verify novamente PASS em test-results/bootstrap/task003-preflight.log (auditoria bruta FAIL conhecida, critério restrito ratificado PASS). ADR-001/003/004/005 ACCEPTED e PD-005 resolvida pela TASK-001. Sem PD impeditiva de fundação. Transição BLOCKED → READY → IN_PROGRESS sob autorização contínua já registrada. Branch real: feature/TASK-003-fundacao-transacional, base c4f8d51; alterações alheias NONE.

Plano/gates locais: 001 prontidão APROVADO; 002 planejamento APROVADO; 003 implementação EM EXECUÇÃO; 004 revisão PENDENTE; 005 manual PENDENTE; 006 fechamento PENDENTE. Escopo PRIMARY: core/persistence, oito modelos autorizados (incluindo EmailToken), migrations correspondentes, tests/core e contrato de erros. Sem endpoints de contas, catálogo ou schemas comerciais. PostgreSQL 17 isolado no WSL, sem usar banco Windows existente. Relógio injetável via dependência interna, SERIALIZABLE até três tentativas totais, idempotência por ator/operação/chave e hash canônico com efeito atômico, auditoria append-only sanitizada e outbox persistente retomável.

Incidental Changes previstas, antes de edição: manifests API/root e lock (Prisma 7/adapter-pg/pg e tipos; geração/build/migration/testes diretamente necessários); configuração Prisma em apps/api/prisma (PRIMARY); .gitignore/config ESLint para saída gerada somente (sem código de usuário excluído); export do contrato de erro, se necessário. São configuração/import/tipos diretamente causados, mínimos, sem função de negócio independente, arquitetura nova, quebra pública ou alteração de autenticação/proteção de dados. Infra de banco local explicitamente aprovada pela ferramenta de instalação, não classificada como patch incidental de segurança. Cada arquivo será reclassificado no relatório final. Gerador e adaptador Prisma conforme documentação oficial v7; SQL e isolamento conforme PostgreSQL 17. Testes reais: rollback conjunto, disputa idempotente, payload divergente, isolamento/repetição limitada, constraints, auditoria sem segredos e retomada de outbox. Manual só após gates técnicos, em base separada e sem aprovação automática.
##### TASK Execution Report — fundação implementada, aceite manual pendente

TASK: TASK-003
Status: IN_REVIEW
Branch: feature/TASK-003-fundacao-transacional
Commits: 99875b1 (implementação, testes e roteiro). Base: c4f8d51. Não há execução de TASK-004.

### Primary Changes

- apps/api/src/core/{clock,errors,idempotency,audit,outbox}.ts: relógio injetável interno; envelope público sem stack/segredo; payload canônico SHA-256 com rejeição de valores não JSON/arrays esparsos; chave escopada por ator/operação, referência e efeito atômicos; auditoria sanitizada; outbox persistente com consumidor somente transacional no próprio banco, savepoint/tentativas e locks SKIP LOCKED.
- apps/api/src/persistence/{client,transaction}.ts: cliente Prisma 7/adapter-pg, schema validado e pool; SERIALIZABLE com até três tentativas totais para serialização/deadlock, sem repetir erros desconhecidos/negócio. Callback não admite efeitos externos conforme contrato interno documentado.
- apps/api/prisma/**: config/gerador/migration inicial apenas User, Session, PasswordReset, EmailToken, AuditLog, DomainEvent, DemoMessage, IdempotencyRecord. Índices/FKs, constraints de contexto/papel e hashes, auditoria append-only por trigger. Sem Address ou modelos comerciais de tarefas futuras.
- packages/contracts/src/errors.ts: materialização do módulo errors* autorizado dentro do diretório src estabelecido no bootstrap; somente contrato de erro, sem ampliar responsabilidade funcional. TASKS.md: estado/evidências desta tarefa.
- tests/core/**: seis testes unitários, nove de banco real, subprocesso de queda controlada, runner com schema isolado retido, configuração, setup local preservando ambiente reconhecido, roteiro manual e instruções. Saída Prisma gerada em persistence/generated é artefato PRIMARY derivado/ignorado e regenerado por build, não código manual ocultado.
- Ambiente especificamente autorizado: PostgreSQL 17.11 PGDG no Ubuntu, sem cluster padrão; cluster privado em HOME/.local/share/garimpo/postgres17 e loopback:55432. Bases/credenciais dev/test separadas, papéis sem superusuário/CREATEDB/CREATEROLE e CONNECT cruzado negado. Arquivo de credenciais 0600, diretório 0700 fora do Git. Não alterado PostgreSQL Windows existente. Migration aplicada à base garimpo_dev própria; zero usuários semeados.

### Incidental Changes

| Arquivo/Componente | Alteração | Justificativa |
| --- | --- | --- |
| apps/api/package.json | Prisma/client/adapter-pg 7.10.1, pg/@types-pg 8.23.1 | Dependências e tipos indispensáveis ao módulo de persistência ratificado; nenhuma funcionalidade independente. |
| package-lock.json | Resolução/integridade das dependências acrescentadas | Reprodução causal da instalação; comparação confirmou nenhuma versão anterior alterada no mesmo caminho. |
| package.json | Geração/build, comandos de migration/teste real e verify; allowScripts exato Prisma/engines 7.10.1 | Configuração mínima para gerar e validar a fundação, com scripts das versões exatas explicitamente autorizados; sem atualização global ou validação desativada. Formatação automática do npm sem outra mudança semântica. |
| .gitignore | Somente saída persistence/generated | Artefato derivado refeito por build; fontes próprias permanecem versionadas. |
| packages/contracts/src/index.ts | Export type ErrorEnvelope | Registro mínimo do contrato diretamente utilizado; sem alteração de contrato anterior. |
| tests/eslint.config.mjs | Exclusão somente da saída Prisma gerada | Evita aplicar regras de autoria ao gerador; todo código próprio continua sob lint. |
| .gitattributes | LF somente para migrations SQL | O Git avisou sobre conversão SQL para CRLF; fixar LF mantém os bytes das migrations reproduzíveis entre Windows/WSL. Mudança causal registrada antes da edição. |

Todos os sete arquivos passam necessidade, causalidade, minimalidade, ausência de função/regra/arquitetura independente, contrato preservado, ausência de mudança incidental de autenticação/autorização/proteção de dados e ausência de Forbidden. Mudanças próprias de integridade/auditoria são PRIMARY, não incidentais. Orçamento restrito a dependências, geração, export e configuração diretamente causados, sem limpeza geral.

### Tests Executed

Ambiente: Ubuntu 24.04.4 WSL2, Node Linux 24.22.1, npm 11.19.1, PostgreSQL 17.11. Evidências em test-results/core (ignoradas, sem credenciais):

- verification-01.log: FAILED na verificação de tipos do teste de correlationId, cujo parâmetro default inferia tipo UUID mais estreito que o contrato string. Corrigida anotação explícita string; retomada da execução/revisão. Falha registrada retrospectivamente, sem apagar resultado anterior.
- migration-diagnostic.log: tentativa inicial de migrate diff sem config/ambiente falhou no motor; binário --version validado e repetição com configuração/ambiente explícitos gerou SQL. Nenhum banco foi alterado pela tentativa falha.
- verification-02.log: npm run verify PASS com 21 testes bootstrap/unidade e nove integrações reais. Revisão posterior rejeitou também array esparso e ancorou resolução do driver no workspace API; gates relevantes repetidos abaixo.
- clean-install.log: npm ci --no-fund --no-audit PASS, 799 pacotes, postinstall reaplicou patch Forge e conferiu hashes exatos. Auditoria executada integralmente no verify, nunca omitida do gate.
- verification-final.log: npm run verify PASS após instalação limpa e revisão: geração Prisma, build contratos/API/web, tipos dos quatro workspaces e testes, lint; 21 testes bootstrap/unidade + nove integrações, 30 distintos. Schema real isolado task003_c708222c80364a72aef04f3238b29567, preservado para evidência, sem reset/drop. Duas conexões/backend PIDs distintos forçam conflito por barreira; repetição limitada conserva dois incrementos. Mesma chave concorrente cria exatamente um efeito, payload divergente conflita e escopo de ator diferente é independente.
- Integrações demonstram rollback conjunto de usuário/auditoria/evento/chave, constraints/FK/hash, auditoria negando UPDATE/DELETE/TRUNCATE, falha do consumidor sem efeito parcial, retomada por nova conexão, dois consumidores sem duplicação. Processo separado interrompido por SIGKILL antes de commit: efeito incompleto revertido, outro consumidor retoma uma vez. Relógio fixo apenas por injeção de teste.
- development-migration.log: npm run db:migrate PASS na base dev própria isolada. compiled-smoke.log: cliente ESM compilado conecta/consulta garimpo_dev, zero usuários, dois papéis não privilegiados; papel de teste recebe 42501 ao tentar conectar em garimpo_dev. Nenhuma consulta comercial/API futura implementada.
- setup-reuse.log: setup reconheceu cluster e preservou bases/senhas/dados. bash -n PASS dos dois roteiros shell. Diff/JSON/37 IDs/oito modelos/escopo conferidos. PDF/fontes/README/ADRs/prompts/clientes/rotas não alterados nesta TASK.
- Auditoria completa: npm audit bruto permanece FAIL/exit 1, quatro avisos altos derivados do Forge conhecido; classificação restrita ratificada PASS, hash corrigido e regressões de assinatura/schema preservados. Nenhum aviso novo tolerado ou escondido.

### Quality Gates

Build/tipos: PASS, incluindo cliente compilado real.
Lint: PASS, código próprio integral.
Unit Tests: PASS (20 unitários, além de um teste HTTP de bootstrap).
Integration Tests: PASS (nove de PostgreSQL real e teste HTTP do bootstrap).
API Tests: PASS operacional /health; contratos de contas/comércio ainda não aplicáveis ao incremento.
Security: PASS no recorte de fundação e no critério restrito ratificado de mitigação; auditoria bruta NÃO aprovada, segue FAIL conhecida/documentada.
Acceptance Criteria: PENDENTE/FAIL para fechar enquanto teste manual do responsável não for confirmado; critérios técnicos demonstrados.
Regression Tests: PASS, 15 testes anteriores preservados e sem mudança de versões anteriores/rotas/clientes.

### Scope Validation

Allowed Changes: PASS, somente fundação enumerada e materialização do módulo de erro.
Incidental Changes: PASS nos sete arquivos justificados.
Forbidden Changes: PASS.
Scope Creep: NONE. Nenhuma implementação de TASK-004 ou modelos comerciais antecipados.

### Definition of Done

FAIL/PENDENTE exclusivamente do gate manual e fechamento. IN_REVIEW, nunca DONE por teste do agente. Gates locais 001 prontidão APROVADO; 002 planejamento APROVADO; 003 implementação APROVADO; 004 revisão APROVADO; 005 manual PENDENTE; 006 conclusão PENDENTE. Total 6, concluídos 4, pendentes 2, bloqueados 0.

Manual: quatro grupos previstos (TEST-026, TEST-030, TEST-031 no recorte de fundação e ACEITE-003), executados pelo responsável 0, aprovados 0, reprovados 0, pendentes 4. Roteiro real: tests/core/README.md e bash tests/core/manual-foundation.sh. Aguardar saída/log e confirmação; o agente não executou esse roteiro como substituto do responsável. Sem interface nesta tarefa; acessibilidade mobile não se aplica a este incremento, sem dispensar requisitos futuros.

### Next Eligible TASK

NONE enquanto TASK-003 não DONE. TASK-004 permanece BLOCKED; somente após aceite manual, fechamento e DoR própria. Autorização contínua vigente, sem nova autorização genérica necessária.
##### TASK Execution Report — fechamento após execução do responsável

TASK: TASK-003
Status: DONE
Branch: feature/TASK-003-fundacao-transacional
Commits: 99875b1 (implementação) e a50936b (revisão/roteiro). Fechamento no commit documental subsequente.

Primary Changes: fundação, migrations autorizadas, contratos e tests/core conforme relatório anterior; neste fechamento somente TASKS.md e tests/core/README.md, ambos PRIMARY. Incidental Changes: os sete arquivos da tabela anterior; NONE novas.

Tests Executed: responsável executou bash tests/core/manual-foundation.sh em 2026-10-25 na revisão a50936b, Ubuntu WSL2, Node 24.22.1/npm 11.19.1, e enviou saída completa. Log local test-results/core/manual-20261025T193844Z.log conferido: geração/build/tipos/lint PASS, 21 testes bootstrap/unidade e nove de banco PASS (30 distintos). Migration aplicada no schema isolado task003_64e850d6ba214bcc96056bf6ecbd9c81, preservado; rollback/idempotência/concorrência/auditoria/retomada e queda real de processo comprovados no recorte da fundação. Roteiro chegou a “Comandos concluídos”; sem erro adicional relatado. Auditoria bruta continua FAIL/exit 1, quatro avisos conhecidos com patch/hash/regressões e critério de mitigação expressamente autorizado, não auditoria limpa. Validações automáticas anteriores preservadas no relatório técnico.

Quality Gates: Build/tipos PASS; Lint PASS; Unit Tests PASS (20); Integration Tests PASS (nove de banco + HTTP real do bootstrap); API Tests PASS operacional /health; Security PASS no critério restrito ratificado e isolamento/sanitização verificados, npm audit bruto FAIL conhecida; Acceptance Criteria PASS pela execução acompanhada e saída enviada pelo responsável dos quatro grupos do roteiro; Regression Tests PASS. Nenhum fluxo comercial futuro ou interface alegado. Documentação de fechamento: diff --check PASS, sem repetir builds por alteração documental.

Scope Validation: Allowed Changes PASS; Incidental Changes PASS conforme tabela anterior, NONE novas; Forbidden Changes PASS; Scope Creep NONE.

Definition of Done: PASS. Gates locais 001–006 APROVADOS; total 6, concluídos 6, pendentes obrigatórios 0, bloqueados 0. Quatro grupos manuais executados/aprovados no recorte de fundação; cenários comerciais futuros permanecem fora do aceite desta TASK. Estado DONE no índice e seção.

Next Eligible TASK: NONE promovida neste fechamento. TASK-004 é a próxima candidata por ordem; dependência TASK-003 satisfeita, exige DoR própria antes de READY. Continuidade expressamente autorizada permanece vigente.

### TASK-004 Implementar contas, autenticação e gestão interna na API

#### Status

DONE

#### Phase

PHASE-01

#### Priority

CRITICAL

#### Objetivo

Implementar USER separado de ADMIN/OPERATOR, cadastro, sessão, perfil/endereço, gestão de internos e proteção do último ADMIN. Preparar estado de e-mail para confirmação em TASK-005.

#### Dependências

DEPENDS_ON: TASK-003

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-001, RF-002, RF-004, RF-026, RF-028; RN-001, RN-002, RN-028, RN-029, RN-032, RN-044; RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; UC-001, UC-002, UC-004, UC-026, UC-028. ADRs: ADR-001, ADR-005.

#### Artefatos esperados

Implementar USER separado de ADMIN/OPERATOR, cadastro, sessão, perfil/endereço, gestão de internos e proteção do último ADMIN. Preparar estado de e-mail para confirmação em TASK-005. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/api/src/modules/accounts/**
- apps/api/prisma/** somente contas/endereço/sessão
- packages/contracts/accounts/**
- scripts/bootstrap-admin*
- tests/accounts/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/src/modules/accounts/staff/**
- apps/api/prisma/** somente contexto/papel/estado/e-mail das contas

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Conta interna não compra; cadastro público não eleva papel; último ADMIN protegido inclusive em concorrência; estados blocked/closed impedem acesso. Encerramento comercial integrado é TASK-022.

#### Testes necessários

TEST-001, TEST-002, TEST-004, TEST-032, TEST-034. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

DoR em 2026-10-25: TASK-003 DONE/49ec5af, artefatos presentes e 30 testes aprovados pelo responsável na revisão a50936b, sem alteração de código posterior. ADR-001/005 ACCEPTED, parâmetros de scrypt/sessão/HTTPS ratificados; PD-005 resolvida. Sem PD impeditiva deste recorte. BLOCKED → READY → IN_PROGRESS sob autorização contínua, branch real feature/TASK-004-contas-autenticacao. Estado Git limpo antes do início.

Plano primário: accounts/staff, contratos accounts materializados no src estabelecido, bootstrap ADMIN explícito, testes/accounts, schema/migration somente User/Session/Address. Cadastro público só CUSTOMER/USER; estado email pendente e evento persistido, entrega/confirmação/reset ficam TASK-005. Sessões opacas com acesso 15min/renovação absoluta sete dias, hashes por propósito, rotação e detecção de reutilização; bloqueado/encerrado/inativo negados em cada comando. Último ADMIN protegido com transação SERIALIZABLE e concorrência real. HTTPS obrigatório, cookies Secure/HttpOnly/SameSite com Origin/CSRF para web e cabeçalho para mobile; nenhuma dispensa de transporte. Configuração técnica desta implementação: senha 15–128 caracteres sem regras artificiais de composição, scrypt ratificado; limites configuráveis persistidos de login por conta/IP e registro/refresh por IP, com janelas e valores documentados nos testes, sem tratar como regra do PDF. Parâmetros de segurança consultados nas fontes oficiais Node 24/Express e OWASP; sem mudar arquitetura para provedor externo.

Incidental Changes previstas antes da edição: registro mínimo do router accounts em apps/api/src/app.ts, sem lógica de segurança independente fora do módulo primário; manifests/lock somente Zod 4.6.7 e comandos de testes; export dos novos contratos; fixture/assert de tests/core para conferir as oito tabelas da migration inicial e permitir a evolução declarada Address, sem remover cobertura; configuração do runner de integração para suite accounts. Só ligações/tipos/config/fixtures causalmente necessários, não correção alheia, lógica comercial, autenticação independente ou alteração de proteção de dados em outro módulo. Nenhum endpoint de compra, fechamento comercial, reset/mensagens ou interface antecipado. Testes HTTPS reais com certificado de teste confiado explicitamente (sem TLS desativado), base/schemas separados e relógio de teste injetado, sem rota pública de relógio.

Gates locais: 001 prontidão APROVADO, 002 planejamento APROVADO, 003 implementação APROVADO, 004 revisão APROVADO, 005 manual PENDENTE, 006 fechamento PENDENTE. Sem resultado futuro aprovado.

##### TASK Execution Report — implementação e revisão, aceite manual pendente

TASK: TASK-004
Status: IN_REVIEW
Branch: feature/TASK-004-contas-autenticacao
Commits: 6718527 (implementação, testes e roteiro); base 49ec5af.

###### Primary Changes

- apps/api/src/modules/accounts/** e staff/**: cadastro CUSTOMER/USER, scrypt ratificado, sessões opacas com rotação/revogação e detecção de reutilização, controle persistente de tentativas, perfil e endereços do titular, administração web por ADMIN e proteção do último administrador em concorrência real. HTTPS, Origin, cookies e CSRF definidos no próprio módulo primário.
- apps/api/prisma/schema.prisma e migrations/202610250002_accounts/migration.sql: evolução de User/Session e novo Address, sem modelos comerciais. Migration aplicada em schemas novos de garimpo_test e na base isolada garimpo_dev após conferir ausência de sessões anteriores; sem reset/drop/backfill presumido. Migration inicial preservada.
- packages/contracts/src/accounts/index.ts: materialização no src já estabelecido do escopo semântico packages/contracts/accounts/**, com tipos de conta/endereço.
- scripts/bootstrap-admin.mjs: primeiro ADMIN somente por comando local explícito, senha fornecida pelo operador e recusa se já existir STAFF; nenhum administrador real criado automaticamente.
- tests/accounts/**: testes unitários, integração HTTPS/PostgreSQL, concorrência com duas conexões bloqueadas simultaneamente, certificado confiado explicitamente pelo cliente, roteiro e documentação operacional. Chaves/logs somente em test-results ignorado.
- TASKS.md: estado, evidências e relatório deste incremento.

E-mail permanece pendente: somente evento durável criado; confirmação, recuperação e mensagens pertencem à TASK-005. Interface, armazenamento SecureStore e testes de autenticação nos clientes pertencem à TASK-006. Encerramento comercial integrado pertence à TASK-022. Nenhum desses fluxos futuros foi declarado aprovado.

###### Incidental Changes

| Arquivo/Componente | Alteração | Justificativa |
| --- | --- | --- |
| apps/api/src/app.ts | Import/registro do router e opção de injeção | Ligação mínima necessária; decisões de autenticação e proteção permanecem em accounts, sem segurança independente neste arquivo. |
| apps/api/package.json | Dependência direta Zod 4.6.7 | Validação do novo módulo usa a mesma versão já presente no lock; nenhuma atualização oportunista. |
| package-lock.json | Declaração da dependência direta | Somente referência Zod no workspace API; versões dos pacotes instalados preservadas. |
| package.json | Comandos de integração/bootstrap e inclusão de scripts no lint | Execução e validação reproduzíveis dos artefatos primários, sem novos fluxos de produto. |
| packages/contracts/src/index.ts | Export de tipos accounts | Exposição mínima dos novos contratos sem quebra dos existentes. |
| tests/core/run-integration.mjs | Seleção validada da suíte accounts | Reuso da preparação isolada existente, sem nova infraestrutura nem fallback para dev. |
| tests/core/database.integration.ts | Conferir as oito tabelas no SQL inicial e sua presença na base evoluída | Compatibilidade com Address autorizado, mantendo prova exata do escopo original e os demais testes. |

Todos os sete ajustes são indispensáveis e diretamente causados pela TASK, mínimos, sem funcionalidade/regra/arquitetura independente ou quebra pública, sem alterar proteção em módulo alheio e sem Forbidden Change. Teste incidental de nove critérios: PASS. Orçamento excepcional limitado às ligações/configurações/fixture acima.

###### Tests Executed

Ubuntu WSL2, Node 24.22.1/npm 11.19.1, PostgreSQL 17.11. Evidências locais em test-results/accounts (ignoradas no Git): compile-02.log, quality-02.log, build-final.log e dev-migration.log.

- npm run build: geração Prisma, contratos, API e web; ver build-final.log.
- npm run typecheck e npm run lint: PASS, incluindo workspaces, tipos dos testes e bootstrap.
- npm test: 24 PASS (23 unitários/segurança e uma API de health), incluindo três novos testes de credenciais. Derivações scrypt do caso agregado: 2325 ms, sem inferir SLA.
- npm run test:integration: 9 PASS, schema task003_e27c48487f3c40ae98bb38a67a4b7e03, migrações completas e recuperação de consumidor interrompido preservadas.
- npm run test:accounts: 14 PASS, schema task004_884c98c595554297b3cc4ecd4dab635a, banco e HTTPS reais, relógio controlado. Inclui reutilização concorrente de refresh e duas transações realmente sobrepostas tentando inativar os dois ADMINs: exatamente um ativo preservado. Total distinto: 47 testes PASS.
- npm run audit:toolchain: classificação restrita PASS; npm audit bruto continua FAIL/exit 1, quatro ocorrências high do aviso de versão de node-forge já mitigado pelo patch autorizado. Hash/assinaturas/Zod/regressão conferidos; nenhum aviso novo aceito. Não é auditoria limpa.
- bash -n tests/accounts/manual-accounts.sh e git diff --check: PASS. npm run db:migrate: PASS em garimpo_dev/loopback:55432, após preflight sem sessões existentes. Nenhuma base original substituída.
- Falha inicial de compilação TS2352 na conversão de AddressInput preservada em compile-01.log/verification-01.log; corrigida com validação explícita e atribuição de campos, seguida pelos resultados aprovados acima.
- Responsável: roteiro tests/accounts/manual-accounts.sh NÃO EXECUTADO nesta revisão; cinco grupos de conferência descritos em tests/accounts/README.md. Execução do agente não substitui o aceite.

###### Quality Gates

Build: PASS conforme build-final.log.
Lint: PASS.
Unit Tests: PASS, 23 casos.
Integration Tests: PASS, nove de fundação e 14 de contas com banco real.
API Tests: PASS, health e suíte HTTPS de contas.
Security: PASS qualificado pelo critério de mitigação ratificado; auditoria bruta FAIL explicitamente preservada, conferência manual ainda pendente.
Acceptance Criteria: FAIL para fechamento, pois falta conferência do responsável; critérios automatizados PASS no recorte desta TASK.
Regression Tests: PASS, fundação/bootstrap preservados; interfaces não alteradas.

###### Scope Validation

Allowed Changes: PASS.
Incidental Changes: PASS, sete ajustes classificados acima.
Forbidden Changes: PASS, nenhuma violação.
Scope Creep: NONE.

###### Definition of Done

FAIL enquanto o responsável não executar/conferir o roteiro e enviar evidência real. Manter IN_REVIEW, sem contabilizar esta TASK como DONE.

###### Next Eligible TASK

NONE até o fechamento da TASK-004. TASK-005 permanece BLOCKED; após aceite, validar DoR própria sob autorização contínua vigente.

##### TASK Execution Report — fechamento após conferência do responsável

TASK: TASK-004. Status: DONE. Branch: feature/TASK-004-contas-autenticacao. Commits de implementação/revisão: 6718527 e 91c30ce.

Responsável executou bash tests/accounts/manual-accounts.sh em 91c30ce e enviou a saída integral nesta conversa: test-results/accounts/manual-20261025T203156Z.log. Build, tipos, lint, 24 testes de unidade/health, nove de fundação e 14 de contas PASS (47 distintos), incluindo HTTPS, proteção de estado/papel, reset de janela de tentativas, reutilização concorrente de refresh e último ADMIN sob concorrência real. Schemas retidos: task003_0962cc43d38e4368a357e7a9297de8ac e task004_f8b27ad7b7554320abe530685d7782a2. Conferência operacional de API no terminal; não equivale a inspeção de interface futura ou envio de e-mail.

Primary Changes e sete Incidental Changes: os mesmos do relatório de revisão, sem nova alteração de implementação. Atualização documental de fechamento em TASKS e tests/accounts/README.md é PRIMARY. Allowed Changes PASS; Incidental Changes PASS; Forbidden Changes PASS; Scope Creep NONE.

Quality Gates finais: Build PASS; Lint PASS; Unit Tests PASS; Integration Tests PASS; API Tests PASS; Security PASS qualificado pela mitigação ratificada, mantendo npm audit bruto FAIL/exit 1 com quatro ocorrências high conhecidas e sem novos avisos; Acceptance Criteria PASS no recorte desta tarefa com execução do responsável; Regression Tests PASS. Gates locais 001–006 APROVADOS. Definition of Done: PASS. Não foram executados fluxos futuros de confirmação/reset, clientes ou encerramento comercial.

Next Eligible TASK: NONE promovida neste fechamento. TASK-005 é a próxima candidata; exige DoR própria, com dependência TASK-004 agora satisfeita. Autorização contínua vigente.

### TASK-005 Implementar recuperação, confirmação e mensagens de acesso

#### Status

DONE

#### Phase

PHASE-01

#### Priority

HIGH

#### Objetivo

Implementar reset 30min, confirmação inicial 24h, mudança de e-mail confirmada e adaptador de mensagens de teste protegido. Fundação de envio/repetição para eventos posteriores.

#### Dependências

DEPENDS_ON: TASK-004

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-001, RF-003, RF-024, RF-026, RF-028; RN-001, RN-002, RN-003, RN-024, RN-029, RN-032, RN-033, RN-042, RN-044; RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; UC-001, UC-003, UC-024, UC-026, UC-028. ADRs: ADR-002, ADR-005.

#### Artefatos esperados

Implementar reset 30min, confirmação inicial 24h, mudança de e-mail confirmada e adaptador de mensagens de teste protegido. Fundação de envio/repetição para eventos posteriores. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/api/src/modules/messaging/**
- apps/api/src/modules/accounts/password-reset*
- apps/web/src/demo/**
- apps/api/prisma/** somente mensagens/reset
- packages/contracts/messaging/**
- tests/messaging/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/src/modules/accounts/email-verification*
- apps/api/src/modules/accounts/email-change*
- apps/api/prisma/** somente EmailToken e estados de confirmação

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Reset único revoga todas as sessões; confirmação reenviável; e-mail antigo permanece até confirmar novo; token não aparece em logs. Canal local/serviço de teste conforme ADR, sem exigir provedor real.

#### Testes necessários

TEST-001, TEST-003, TEST-024, TEST-032, TEST-034. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

DoR TASK-005 em 2026-10-25: TASK-004 DONE/fb10724, 47 testes novamente aprovados na execução do responsável em 91c30ce, sem mudança posterior de implementação. ADR-002/005 ACCEPTED e PD-005 ratificada; prazos e canal técnico definidos. Branch feature/TASK-005-mensagens-acesso, estado Git limpo antes do início. BLOCKED → READY → IN_PROGRESS sob autorização contínua.

Plano primário: messaging/**, password-reset*, email-verification*, email-change*, contratos messaging materializados em src e tests/messaging/**. Reutilizar PasswordReset/EmailToken/DemoMessage existentes, sem nova tabela. Tokens de uso único com hash por propósito; corpo sensível cifrado no canal local com chave fora do Git, separado do segredo técnico de consulta. Worker explícito local, falhas/repetição/deduplicação auditadas e sem envio real. Reset revoga sessões e tokens ativos atomicamente. ADMIN pode iniciar correção de e-mail interno pelo recorte de e-mail do PATCH existente; demais campos continuam no módulo accounts. Interface de caixa de mensagens é opcional no escopo permitido; API protegida e roteiro de terminal materializam o canal nesta entrega, clientes gerais ficam TASK-006.

Incidental Changes previstas: registro mínimo do novo router em apps/api/src/app.ts (sem lógica de segurança fora do módulo primário), export dos contratos, comandos de worker/teste em package.json e seleção de suite messaging no runner isolado. Sem alterar segurança em accounts/router, validação existente ou módulo de fundação. Nove critérios aplicados: causalidade, necessidade, minimalidade e ausência de funcionalidade/regra/arquitetura/quebra/segurança independente ou proibição. Gates locais 001/002 APROVADOS; implementação/revisão/manual/fechamento PENDENTES.

##### TASK Execution Report — acesso e mensagens implementados, conferência pendente

TASK: TASK-005
Status: IN_REVIEW
Branch: feature/TASK-005-mensagens-acesso
Commits: 3905cb2 (implementação, testes e operação); base fb10724. Nenhuma implementação da TASK-006.

###### Primary Changes

- apps/api/src/modules/accounts/password-reset.ts: solicitação genérica e reset de 30min, uso único, scrypt existente, revogação atômica de todas as sessões/renovações e tokens ativos. Não autentica nem confirma e-mail automaticamente.
- apps/api/src/modules/accounts/email-verification.ts e email-change.ts: confirmação inicial/reenvio de 24h, hashes por propósito, novo e-mail confirmado antes de substituir antigo, unicidade novamente validada no commit. ADMIN inicia correção de interno pelo recorte de e-mail do PATCH existente; OPERATOR negado. Ligação da correção comercial de clientes pertence à TASK-022.
- apps/api/src/modules/messaging/**: proteção e configuração do canal técnico, rotas HTTPS/Origin/CSRF, caixa restrita com segredo distinto dos papéis comerciais, limites persistentes, consumidor de eventos de acesso e entrega local recuperável. Corpo cifrado AES-256-GCM versionado e autenticado por identidade, chave separada fora do Git; tokens só em hash nos registros de validação. Nenhuma credencial/corpo em auditoria ou logs gerais.
- packages/contracts/src/messaging/**: contratos tipados materializados na estrutura src existente, sem quebra dos contratos anteriores.
- tests/messaging/**: unidade criptográfica, 15 casos de integração HTTPS/PostgreSQL, relógio injetado, falha/repetição e duas corridas forçadas com conexões independentes. Documentação operacional, configuração protegida e roteiro do responsável. Certificado explicitamente confiado pelo cliente; nenhum TLS desativado.
- TASKS.md: DoR, estado e evidências desta tarefa.

Nenhuma nova migration/modelo, dependência instalada ou alteração de versão. PasswordReset/EmailToken/DemoMessage existentes usados no escopo autorizado. Nenhuma chave real instalada no ambiente do responsável pelo agente; caixa desligada por padrão e negada em produção. Exemplo opcional de configuração preserva arquivo existente e não grava valores no histórico/Git. Interface para abrir os links é TASK-006; envio pela Internet e mensagens comerciais futuras não implementados nem declarados aprovados.

###### Incidental Changes

| Arquivo/Componente | Alteração | Justificativa |
| --- | --- | --- |
| apps/api/src/app.ts | Import/registro do router de messaging e injeção de opções | Ligação mínima do módulo primário, sem lógica independente de segurança no arquivo compartilhado. |
| package.json | Comandos test:messaging/messages:work e gate na verify | Execução/validação reproduzíveis dos artefatos primários; sem infraestrutura/daemon/provedor novo. |
| packages/contracts/src/index.ts | Export dos novos tipos | Exposição mínima dos contratos sem alterar os existentes. |
| tests/core/run-integration.mjs | Seleção validada de suíte/prefixo TASK-005 | Reutiliza preparação isolada existente, sem reset, fallback dev ou mudança de comportamento das suítes anteriores. |

Teste incidental de nove critérios: PASS nos quatro arquivos, necessários e diretamente causados, mínimos e sem funcionalidade/regra/arquitetura/quebra/segurança independente ou proibição. Nenhuma edição de accounts/router, staff/service, credentials, core/outbox ou requisitos originais.

###### Tests Executed

Ubuntu WSL2, Node 24.22.1/npm 11.19.1/PostgreSQL 17.11. Logs locais ignorados em test-results/messaging:

- compile-01.log: npm run build (geração Prisma/contratos/API/web), npm run typecheck (todos os workspaces e testes) e npm run lint: PASS.
- quality-01.log: npm test 25 PASS (24 unidade/segurança + health), incluindo cifra aleatória/autenticada, chave/identidade/adulteração rejeitadas. npm run test:messaging 15 PASS no schema task005_269bad12ff5741d4823d4a5805f64e26; preparação/entrega falhas recuperadas, evento desconhecido preservado, reset e mudança concorrentes com barreira comprovada de duas operações esperando UPDATE.
- regression-01.log: npm run test:integration nove PASS no schema task003_a7184944e67647b8ae8830219d4392cc; npm run test:accounts 14 PASS no schema task004_10fffd407e034777a5b514cd1be8e655. Inclui último ADMIN e retomada após interrupção real, sem regressão conhecida. Total distinto acumulado: 63 PASS.
- npm run audit:toolchain: classificação restrita PASS; npm audit bruto FAIL/exit 1, quatro ocorrências high conhecidas de versão de node-forge sob o patch/hash ratificados, sem avisos novos. Não é auditoria limpa, nem dispensa o responsável.
- review-01.log: tipos finais dos testes e lint direcionado tests/messaging PASS após as últimas asserções. bash -n tests/messaging/manual-messaging.sh PASS. Git diff --check final PASS após retirar uma linha vazia adicional no EOF do helper HTTP; correção apenas de formatação, sem novo comportamento que exija repetir testes.
- Responsável: tests/messaging/manual-messaging.sh NÃO EXECUTADO. Cinco grupos e limites de conferência descritos em tests/messaging/README.md. Execução automática do agente não substitui essa conferência.

Limitações explícitas: entrega significa disponibilização na caixa local, não envio externo. Chaves de operação devem ser configuradas separadamente e preservadas para ler mensagens antigas; política definitiva de rotação/backup/retenção permanece nas tarefas responsáveis. Filtro técnico por destinatário cifrado examina até 1000 mensagens recentes e informa recipientScanLimit, sem prometer busca histórica completa/escala ainda não decidida. Resposta pública genérica não certifica latência constante de banco sob carga. UI/Android desta funcionalidade não testados nesta tarefa de API.

###### Quality Gates

Build: PASS.
Lint: PASS.
Unit Tests: PASS, 24 casos.
Integration Tests: PASS, nove fundação + 14 contas + 15 mensagens, banco real separado.
API Tests: PASS, health e suítes HTTPS de contas/mensagens.
Security: PASS qualificado pelo critério ratificado de mitigação, auditoria bruta FAIL preservada; conferência humana pendente.
Acceptance Criteria: FAIL para fechamento enquanto faltar conferência do responsável; critérios automatizados PASS no recorte atual.
Regression Tests: PASS.

###### Scope Validation

Allowed Changes: PASS.
Incidental Changes: PASS, quatro ligações/configurações acima.
Forbidden Changes: PASS, nenhuma violação.
Scope Creep: NONE.

###### Definition of Done

FAIL enquanto o responsável não executar/conferir o roteiro e enviar evidência. Gates locais 001/002/003/004 APROVADOS, 005 manual e 006 fechamento PENDENTES. Manter IN_REVIEW e não contar esta TASK como DONE.

###### Next Eligible TASK

NONE até o fechamento da TASK-005. TASK-006 continua BLOCKED; após aceite, conferir DoR própria sob a autorização contínua vigente.

##### TASK Execution Report — fechamento após execução do responsável

TASK: TASK-005. Status: DONE. Branch: feature/TASK-005-mensagens-acesso. Commits: 3905cb2 e 286d34d; base fb10724.

Responsável executou bash tests/messaging/manual-messaging.sh em 286d34d e enviou a saída integral: test-results/messaging/manual-20261025T210433Z.log. npm run verify: build/tipos/lint PASS, 25 testes unidade/health + nove fundação + 14 contas + 15 mensagens PASS (63 distintos). Schemas retidos: task003_4d428947d9094f5b91d8ce5dca5fd15e, task004_a26aa288164045d38ad9f9782ce06e86 e task005_a16edb5bd20e47fc951cf5d7001073f0. Conferência operacional HTTPS/API no terminal; não certifica interface futura, Android desta funcionalidade ou envio externo.

Primary Changes e quatro Incidental Changes: os mesmos do relatório de revisão, sem nova alteração funcional. Atualização documental de fechamento em TASKS e tests/messaging/README.md é PRIMARY. Allowed Changes PASS; Incidental Changes PASS; Forbidden Changes PASS; Scope Creep NONE.

Quality Gates: Build PASS; Lint PASS; Unit Tests PASS; Integration Tests PASS; API Tests PASS; Security PASS qualificado pela mitigação ratificada, mantendo npm audit bruto FAIL/exit 1 com quatro ocorrências high conhecidas e sem novos avisos; Acceptance Criteria PASS no recorte desta TASK, com execução do responsável; Regression Tests PASS. Gates locais 001–006 APROVADOS. Definition of Done: PASS. Limitações de canal local, configuração protegida e busca técnica descritas na revisão permanecem explícitas.

Next Eligible TASK: NONE promovida neste fechamento. TASK-006 é a próxima candidata por ordem e tem dependências TASK-004/005 satisfeitas; exige DoR própria. Continuidade autorizada permanece vigente.

Correção de dependência em 2026-10-25, após o fechamento: o teste de entrada CLI durante preparação da TASK-006 encontrou ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX em npm run messages:work. Node 24.22.1 em strip-only não transforma propriedades de parâmetro. Reabertura DONE → FAILED → IN_PROGRESS → IN_REVIEW na branch própria TASK-005, sem ampliar escopo. Propriedades agora declaradas e atribuídas explicitamente, preservando algoritmo, contrato, parâmetros e efeitos de negócio. Novo teste integra o comando npm real como subprocesso contra schema isolado e confere entrega/consumo persistidos. Testes/gates desta correção PENDENTES neste registro; nenhuma nova aprovação humana de CLI presumida. Aceite operacional anterior de 63 casos preservado como histórico, sem afirmar que incluía esse comando. TASK-006 aguarda esta correção na branch própria com trabalho WIP preservado em 85d7f46.

Fechamento da correção: npm run build/typecheck/lint e npm run test:messaging PASS em test-results/messaging/cli-correction.log, incluindo o novo caso que executa npm run messages:work como subprocesso, entrega a mensagem e confere evento consumido no banco isolado. Suite de mensagens agora tem 16 casos. test-results/messaging/cli-equivalence.log comprova por scanner TypeScript que todos os tokens do JavaScript compilado são idênticos ao da revisão aceita e884bc1: nenhuma mudança de negócio, segurança, contrato ou algoritmo, somente sintaxe fonte compatível com Node. Aceite humano anterior dos fluxos permanece aplicável por essa equivalência; não se atribui execução manual adicional do CLI ao responsável. Critério novo de entrada do processo comprovado por integração real, não por mock.

TASK Execution Report da correção: Status DONE; branch feature/TASK-005-mensagens-acesso; PRIMARY service.ts/declarações, teste CLI, TASKS e README de testes. Incidental Changes NONE. Build PASS; Lint PASS; Unit/API/regressão dos fluxos preservados pela equivalência do JavaScript e evidência anterior do responsável; Integration Tests PASS, 16 mensagens atuais incluindo entrada real; Security PASS qualificado pela mitigação já ratificada sem alterar dependências/bytes compilados; Acceptance Criteria PASS no recorte corrigido. Allowed Changes PASS; Forbidden Changes PASS; Scope Creep NONE; DoD PASS. Nenhum gate da TASK-006 dispensado. Correção não autoriza qualquer alteração futura fora do Scope Guard.

### TASK-006 Criar interfaces de contas e administração interna

#### Status

DONE

#### Phase

PHASE-01

#### Priority

HIGH

#### Objetivo

Entregar cadastro/login/reset/confirmação/perfil/endereço nos clientes e gestão ADMIN/OPERATOR exclusivamente na web.

#### Dependências

DEPENDS_ON: TASK-004, TASK-005

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-001, RF-002, RF-003, RF-004, RF-026, RF-028; RN-001, RN-002, RN-003, RN-028, RN-029, RN-032, RN-033, RN-044; RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; UC-001, UC-002, UC-003, UC-004, UC-026, UC-028. ADRs: ADR-001, ADR-005.

#### Artefatos esperados

Entregar cadastro/login/reset/confirmação/perfil/endereço nos clientes e gestão ADMIN/OPERATOR exclusivamente na web. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/web/src/features/account/**
- apps/mobile/src/features/account/**
- apps/web/src/navigation/**
- apps/mobile/src/navigation/**
- tests/e2e/account/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/web/src/features/admin/staff/**
- tests/e2e/staff/**

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.

#### Critérios de aceitação

Fluxos de acesso funcionam via API; OPERATOR não gere contas; cliente não promove papel; app não tem administração. Fluxo de encerramento integrado fica em TASK-022.

#### Testes necessários

TEST-001, TEST-002, TEST-003, TEST-004, TEST-032, TEST-034. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

DoR TASK-006 em 2026-10-25: dependências TASK-004/005 DONE, revisão e884bc1, execução do responsável em 286d34d com build/tipos/lint e 63 testes PASS. ADR-001/005 ACCEPTED, contratos de contas/mensagens presentes e parâmetros de sessão/HTTPS definidos. Sem PD impeditiva do recorte. BLOCKED → READY → IN_PROGRESS sob autorização contínua; branch feature/TASK-006-interfaces-contas, Git limpo antes do início.

Plano primário: features/account e navigation em web/mobile, admin/staff somente web, testes/e2e/account e staff. HTTPS e cookies web com CSRF; renovação mobile em Expo SecureStore, acesso somente em memória. Nenhuma credencial técnica de caixa no cliente. Testes de navegador com API/banco reais separados, sem substituir backend por mock nos fluxos de aceitação. Harness HTTPS de teste no escopo tests/e2e/account serve o build web e API na mesma origem, sem mudar configuração TLS de produção ou confiar certificados globalmente no Windows. Android requer conferência real do responsável com certificado confiável; não alegar aprovação antes dela. Encerramento comercial e catálogo ficam fora.

Incidental Changes previstas: registro mínimo de navigation em apps/web/src/main.tsx e apps/mobile/App.tsx; manifests/lock somente expo-secure-store 57.0.4 compatível com bundledNativeModules do Expo instalado, contratos existentes e @playwright/test 1.64.1; comandos de teste/roteiro. São ligações e ferramentas necessárias, com decisões de sessão/proteção nos módulos primários; sem implementar segurança independente nos pontos de entrada ou mudar módulos de API. Gates locais 001/002 APROVADOS; demais PENDENTES. Sem criar/alterar migrations.

BLOCKER de dependência encontrado durante a execução: npm run messages:work da TASK-005 falha com ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX porque AccessMessages usa propriedades de parâmetro, não suportadas pelo modo strip-only do Node 24.22.1. Evidência test-results/account-ui/worker-smoke.log. Trabalho parcial de telas preservado em commit WIP da TASK-006, sem alegar teste aprovado; retorno à branch própria da TASK-005 para correção autorizada no seu escopo. TASK-006 não avança até validar a dependência corrigida. Falha própria inicial de tipos TS2322 em Promise de Web Locks corrigida com normalização explícita de Promise<void>, pendente rechecagem. Nenhum gate futuro aprovado.

Retomada TASK-006: correção de dependência cb2b2fa incorporada pela branch TASK-005 com gates relevantes e entrada CLI real aprovados; JavaScript de negócio idêntico ao aceite anterior. DoR revalidada, BLOCKED → READY → IN_PROGRESS na mesma branch feature/TASK-006-interfaces-contas; WIP 85d7f46 preservado. A falha inicial própria de tipos é histórica e ainda exige resultado novo de types/lint antes de aprovação. Nenhuma alteração de API atribuída como incidental da TASK-006.

Validação parcial: build web/API/contracts PASS em compile-02.log; TS2322 corrigido e referência DOM local dos testes ajustada. Typecheck e lint PASS em compile-04.log após corrigir no-unsafe-finally do logout mobile; npm test PASS com 30 casos em unit-01.log, incluindo cinco casos de protocolo/armazenamento injetado (não equivalem a SecureStore no aparelho). Primeiro caso de navegador excedeu 60s na preparação; browser-01.log preservado e timeout específico da fixture ampliado para 180s, sem flexibilizar regra de negócio ou SLA. Suíte visual ainda em validação; nenhum aceite presumido.

Conectividade: responsável confirmou que não possui cabo USB e precisa testar pelo Wi-Fi. Proposta concreta de ampliação limitada em tests/e2e/account/wifi-proposal.md, pendente de decisão: túnel HTTPS temporário somente da fixture com dados sintéticos, validação TLS na origem e sem publicar caixa técnica/banco. Nenhum túnel iniciado ou confiança global alterada. Trabalho web independente continua autorizado; teste Android/DoD permanecem pendentes.

Decisão posterior rastreada: responsável respondeu “Autorizar túnel temporário de teste” à proposta. Autorização limitada ao Cloudflare Quick Tunnel da fixture sintética durante inspeção Android, mantendo validação TLS em ambos os trechos e caixa técnica/banco locais. Preparação/execução/encerramento devem ter evidência real. Isso não aprova testes futuros nem autoriza serviço de produção.

### TASK Execution Report
TASK: TASK-006
Status: DONE — aceite final do responsável em 25/10/2026 às 22:46; fechamento consolidado abaixo substitui as pendências históricas, preservadas para rastreabilidade.
Branch: feature/TASK-006-interfaces-contas
Commits: 85d7f46 (WIP preservado); ef31a09 (incorpora dependência cb2b2fa); 71b726a (implementação/validação e entrega IN_REVIEW). Base efetiva de escopo: cb2b2fa, para não atribuir a correção CLI da TASK-005 à TASK-006.

#### Primary Changes

Todos os arquivos em apps/web/src/features/account/** e navigation/**: cadastro, login, recuperação, confirmação, perfil e endereços, feedback de erros, teclado, texto ampliado, cookies HTTPS/CSRF e renovação coordenada. apps/web/src/features/admin/staff/**: equipe exclusivamente ADMIN, rótulos explícitos e proteção do último administrador derivada da API. OPERATOR não recebe gestão nem por rota direta.

Todos os arquivos em apps/mobile/src/features/account/** e navigation/**: cliente USER/CUSTOMER, mesmos fluxos de conta, link/código colável, acesso em memória e somente refresh no SecureStore. Renovação concorrente única; saída espera renovação, limpa armazenamento, apresenta falha e oferece repetição. Falha de revogação conserva somente a tentativa pendente em memória para repetir, sem alegar saída completa. Administração ausente no app.

Todos os arquivos em tests/e2e/account/** e tests/e2e/staff/**, incluindo READMEs, scripts e proposta: E2E com API/DB reais, fixture isolada, CA restrita ao perfil Firefox, screenshots sintéticas, controles negativos TLS, testes de protocolo mobile e roteiros humanos. Relay temporário autorizado somente para rotas de cliente, sem cookies web, administração, caixa ou arquivos. Ferramenta cloudflared 2026.10.3 verificada por hash oficial, TLS validado até a origem, sem instalação de CA global. TASKS.md: estado, decisões e evidência desta tarefa. Cada arquivo desses grupos é PRIMARY.

#### Incidental Changes

| Arquivo/Componente | Alteração | Justificativa |
| --- | --- | --- |
| apps/web/src/main.tsx | Registrar navigation/App | Ligação mínima da interface primária ao bootstrap existente. |
| apps/mobile/App.tsx | Reexportar navigation/App | Ligação mínima do app, sem lógica independente de autenticação. |
| apps/web/package.json | Dependência direta do contrato existente | Tipos usados pela interface, sem nova versão de negócio. |
| apps/mobile/package.json | Contrato existente e expo-secure-store 57.0.4 | Ligação nativa necessária ao armazenamento ratificado, compatível com o mapa SDK 57 instalado. |
| package.json | Playwright 1.64.1 e comando test:account-ui | Ferramenta e entrada mínima dos testes reais de interface. |
| package-lock.json | Resolução dessas dependências | Reprodutibilidade; nenhuma atualização oportunista de pacote existente. |

Teste dos nove critérios: PASS para as seis ligações/configurações acima, necessárias e diretamente causadas, sem função/negócio/arquitetura/contrato ou segurança independente nesses pontos. Autenticação, armazenamento e relay estão nos módulos PRIMARY; exposição temporária foi ampliada explicitamente pelo responsável, não classificada como incidental. Nenhum arquivo fora desses grupos alterado por esta entrega.

#### Tests Executed

Ubuntu WSL2, Node 24.22.1/npm 11.19.1, PostgreSQL 17 separado/garimpo_test, Firefox Playwright 157.0/revisão 1555. `verify-final.log`: npm run verify exit 0, build/API/contracts/web, tipos, lint, 31 testes unitários/protocolo, 9 de fundação, 14 de contas e 16 de mensagens: **70 casos PASS**. Auditoria bruta exit 1, quatro high conhecidos derivados exclusivamente do node-forge; política restrita de mitigação ratificada PASS, sem ocultar FAIL nem aceitar achados novos. Schemas retidos: task003_2ba2dba752c545dabfd027959beb2b68, task004_a6f0fb80d9304c799c1d5c83122d5836, task005_c9ccfd8516964cf18f81873032b905a3.

E2E: **7 casos distintos PASS**, em rodadas dirigidas após correções: browser-02.log (certificado sem CA rejeitado; cadastro/confirmação/perfil/endereços/cookies/renovação/logout); browser-03.log (reset e alteração de e-mail); browser-04.log (erro/foco/teclado/texto 200% a 390px, relay HTTPS com autenticação real/negação de rotas, OPERATOR); browser-05.log (ADMIN/criação/papéis/bloquear/desbloquear/último ADMIN). Não declarar que as rodadas históricas inteiras passaram: logs preservam falhas anteriores. Total automático atual: **77 casos distintos PASS**, sem contar repetições.

Falhas próprias e correções preservadas: TS2322/Web Locks; referência DOM ausente no teste; no-unsafe-finally na saída mobile; 60s insuficientes na preparação da fixture (agora 180s próprios, sem mudar SLA); duas verificações que liam resultado antes da resposta (agora aguardam HTTP real); foco antes de commit React (agora efeito após renderização); rótulos implícitos dos seletores (agora label/for/id). Rodadas com falha correspondem a FAILED, com retorno IN_PROGRESS para correção; registro de estados retificado aqui, sem classificar logs antigos como PASS. Última transição IN_PROGRESS → IN_REVIEW após os resultados dirigidos.

`android-final.log`: npm run bundle:android exit 0, 586 módulos/1.5MB, index-41f3cf59c440c05d17a4d6463ebb94d8.hbc. Isso comprova empacotamento, não execução nativa. `bash -n` do roteiro manual PASS; parser PowerShell do roteiro Wi-Fi sem erro. Screenshots web de cliente e ADMIN inspecionadas visualmente pelo agente; inspeção do responsável e leitor de tela ainda não executados.

Revisão React aplicada: componentes com hooks estáveis e definidos no nível superior, cancelamento dos effects de leitura, estados de envio/erro, bloqueio de duplicação, nomes acessíveis e foco pós-render, sem memoização/dependência desnecessária. Nenhuma credencial em localStorage/sessionStorage, URL persistida ou logs gerais; fragmento sensível removido da barra de endereço após leitura.

Túnel de teste iniciado com autorização e probe real PASS em test-results/account-ui/task006_7d4cce3831f0479db0afd8af5e451bd3/wifi.json: HTTPS público → relay HTTPS → API HTTPS local, GET/me sem credencial 401 esperado, caixa técnica 404. Contas/mensagens/segredos só no diretório local ignorado. Sessão de teste tem limite automático de 45 minutos e encerramento explícito q/Ctrl+C. Não declarar encerramento antes dele. Regra/portproxy Metro anterior ausente na conferência; restauração restrita a Wi-Fi/LocalSubnet preparada em metro-wifi.ps1 para execução elevada pelo responsável, não executada pelo agente.

Handoff de aparelho preparado: Metro iniciado em CI/offline, 8081, com origem HTTPS temporária injetada e hostname Wi-Fi conferido. Probe real do manifesto e bundle de desenvolvimento PASS em metro-probe.json: assetHost 192.168.0.93:8081, apiOriginIncluded true; 716 módulos empacotados pelo Metro em 44.6s. nativeAcceptance continua PENDING. Isso não executou o app no Android nem aplicou regra administrativa de Windows. Túnel e Metro ficaram ligados para a inspeção do responsável; encerramento/limpeza continuam pendentes.

Retorno humano posterior: responsável executou metro-wifi.ps1 com ExecutionPolicy Bypass somente no processo filho (política permanente preservada) e enviou saída de configuração Wi-Fi/LocalSubnet; confirmou que o app abriu no Android. Ao tentar os fluxos, recebeu “Não foi possível conectar”. Diagnóstico real em 25/10 às 21:35 locais: o túnel anterior já havia encerrado automaticamente às 20:50, conforme saída do processo e tunnel.log. Abertura do app não equivale a aceite de cadastro/login/SecureStore; critérios permanecem pendentes.

Recuperação operacional no mesmo escopo autorizado: túnel reaberto em fixture nova task006_0c7cbc03cc7a455ab154c61c75addbd3, probe HTTPS/negação da caixa PASS às 21:37 locais em wifi.json. Schema anterior preservado, sem reset/drop. Metro antigo encerrado e reiniciado na mesma porta 8081 com nova origem HTTPS e cache de compilação limpo. Nenhuma alteração de código da aplicação, dependência, regra de negócio ou política permanente de Windows; não há motivo para repetir gates de software já aprovados. Novo probe do bundle e repetição humana ainda devem confirmar a recuperação. Não declarar TASK-006 DONE.

Probe de recuperação concluído: metro-probe.json da fixture nova PASS para manifesto, host Wi-Fi, bundle e presença da origem HTTPS atual; origem expirada ausente. Metro recompilou 716 módulos em 56.5s. Repetição humana ainda PENDING; tarefa continua IN_REVIEW, sem novo aceite presumido.

Aceite humano parcial posterior no Android: responsável confirmou chegada a “Seu perfil” após cadastro/login e respondeu “funcionou tudo! só n testei confirmação de email e recuperação de senha” ao roteiro de alterar/salvar nome, adicionar/editar/excluir endereço fictício, fechar/reabrir mantendo sessão e Sair/fechar/reabrir exigindo login. Esses passos ficam PASS por relato explícito do responsável na fixture nova. Confirmação, recuperação, alteração de e-mail, texto ampliado e inspeção web de contas/admin continuam sem aceite humano; não inferir aprovação desses itens nem DONE a partir do relato parcial.

Auxílio operacional pedido pelo responsável ao relatar dificuldade de digitar o token: PRIMARY tests/e2e/account/qr-message.mjs e README de testes geram QR de texto somente em arquivo local ignorado, usando toqr existente no Expo e PNG/zlib nativo. Sem dependência nova, publicação de caixa, endpoint, mudança de contrato, prazo ou segurança do token. node --check PASS; geração real de PNG 444x444 PASS sem imprimir conteúdo sensível; lint dirigido registrado ao concluir. Nenhuma aceitação do fluxo de confirmação presumida pela mera geração da imagem. Incidental Changes adicionais: NONE; tarefa permanece IN_REVIEW.

Aceite humano adicional em 25/10 às 22:01 locais: após ler o QR local e colar o código no aplicativo Android, responsável confirmou “foi! email confirmado”. Fluxo de confirmação inicial no app PASS por resultado explícito; não é apenas geração de QR. Auxiliar QR: lint dirigido também PASS, exit 0. Recuperação, alteração de e-mail, texto ampliado e inspeção web de contas/admin permanecem pendentes; nenhuma conclusão global da TASK-006 ou dispensa de outro critério inferida.

Preparação da recuperação: responsável informou “pedi” após instrução de usar o formulário Android. Mensagem ACCESS.RESET existente identificada e entregue somente no canal local; solicitação corresponde à outra conta criada pelo responsável na mesma fixture, não à conta usada na confirmação anterior. Essa distinção foi comunicada, sem reproduzir endereço pessoal ou código no repositório. QR RESET gerado localmente com o auxiliar já validado; nenhuma solicitação forjada pelo agente, envio externo ou alteração de senha executada por ele. Pedido no app observado, mas definição de senha, rejeição da anterior e login com a nova continuam PENDING até relato humano. TASK-006 permanece IN_REVIEW.

Aceite humano da recuperação em 25/10 às 22:06 locais: responsável respondeu “deu 100% certo em tudo” ao roteiro explícito de colar o QR RESET, definir senha diferente, conferir rejeição da anterior e sucesso da nova no Android. Esses passos ficam PASS por relato humano. Confirmação inicial havia sido aprovada separadamente na outra conta; preservar essa distinção. TASK-006 ainda IN_REVIEW: alteração de e-mail e texto ampliado no Android, inspeção humana web/equipe e encerramento/limpeza do ambiente temporário continuam pendentes conforme roteiro já registrado. Não transformar o aceite dos passos solicitados em aprovação de itens não solicitados ao responsável.

Inspeção web iniciada no Firefox isolado com CA válida, na mesma fixture, sem ignorar TLS. Responsável reportou erro 401 ao solicitar alteração de e-mail e esclareceu que foi no Firefox. Causa de fixture: relógio congelado na abertura da sessão, com horário real do navegador já além dos 15min; cookies emitidos pela fixture tinham Expires no passado. Problema de ambiente de teste, não motivo para alterar prazo/autorização da aplicação. Ciclo IN_REVIEW → FAILED → IN_PROGRESS para corrigir o harness PRIMARY.

Correção PRIMARY restrita a tests/e2e/account/clock.mjs, clock.test.ts, harness.mjs, manual-web.mjs e README: modo manual acompanha Date.now com offset explícito de teste, padrão automático permanece determinístico. Nenhuma mudança em API, cliente, tokens, expiração de negócio ou relógio do Windows. Na sessão já aberta com código anterior, três comandos t avançaram somente a fixture em 48min; após F5 o responsável respondeu “Confirmação enviada”, validando recuperação operacional dessa chamada web. Mensagem CHANGE preparada para o novo endereço realmente digitado, sem reproduzi-lo no Git. Confirmação final da alteração ainda PENDING.

Validação da correção: manual-clock-fix.log, dois casos de regressão temporal PASS, tipos dos testes PASS e lint dirigido PASS; manual-clock-e2e.log, E2E de recuperação/alteração de e-mail com HTTPS/API/DB reais PASS, exit 0. Não houve necessidade de repetir build da aplicação ou toda a suíte backend sem código afetado. Total automático distinto passa de 77 a 79; repetição de E2E não contada novamente. PRIMARY conforme escopo de testes; Incidental Changes adicionais NONE; Forbidden Changes PASS. Retorno a IN_REVIEW com critérios humanos restantes pendentes. Sem dispensar gates nem declarar DONE.

Falha de preparação posterior: responsável recebeu INVALID_ACCESS_LINK ao confirmar CHANGE no Firefox. Leitura restrita de metadados confirmou que o token do arquivo estava usado/inválido e o endereço ainda não aplicado; havia dois registros CHANGE e um ativo. O auxiliar ordenava por createdAt/UUID e podia selecionar o anterior invalidado em empate de relógio. Não foi expiração do prazo de 24h nem motivo para relaxar uso único. IN_REVIEW → FAILED → IN_PROGRESS para corrigir o harness PRIMARY: antes de abrir o corpo, conferir PasswordReset/EmailToken referenciado, usedAt e expiresAt. Mensagens históricas permanecem intactas.

Regressão adicionada ao E2E real de alteração de e-mail: reenviar a solicitação depois de retroceder só o relógio controlado em 1ms força a mensagem antiga a ordenar antes da nova; o auxiliar deve retornar o token ativo diferente e a confirmação real deve passar. active-message-fix.log: tipos dos testes PASS, lint dirigido PASS, E2E aumentado PASS/exit 0. Nenhuma alteração de API/cliente, prazo, token ou banco/migration; PRIMARY harness.mjs, access.spec.ts, README e TASKS. Incidental Changes adicionais NONE; Allowed/Forbidden PASS. Retorno IN_REVIEW; total de casos distintos permanece 79, pois o cenário existente ganhou a regressão. Aceite humano da alteração ainda PENDING.

A segunda sessão temporária atingiu seu limite de 45min e encerrou, saída real registrada no processo. Nova sessão autorizada aberta com relógio manual corrigido e seleção ativa, schema task006_ff893813fda84a4c95f6bedf3dff12c5, origem local HTTPS localhost:46763 e probe público/negação da caixa PASS em wifi.json. Schemas e resultados anteriores preservados, sem reset/drop. Conta fictícia adicional criada pelo agente via API somente para preparar a revisão, credenciais guardadas em review-customer.json ignorado; login preenchido no novo Firefox isolado, aguardando clique humano. Isso não conta como novo aceite de cadastro/login. Metro anterior e janela Firefox antiga encerrados; Metro novo aponta à nova origem temporária. Confirmação da alteração, revisões restantes e limpeza final continuam pendentes.

Aceite humano web posterior: responsável solicitou nova alteração na sessão fictícia, link foi selecionado pelo auxiliar corrigido e sua condição ativa/não usada/não expirada conferida por metadados antes de copiar diretamente para a área de transferência local do Windows, sem registrar seu conteúdo. Responsável respondeu “deu tudo certo” ao roteiro explícito de confirmar o endereço, verificar perfil com o novo e-mail, sair e entrar usando o novo endereço e a mesma senha. Esses passos web ficam PASS por relato humano, sem inferir que foram repetidos no Android. Gestão ADMIN/OPERATOR, conferência visual de acessibilidade/texto ampliado, alteração de e-mail no Android e limpeza final permanecem pendentes; TASK-006 continua IN_REVIEW.

Aceite humano da gestão interna posterior: responsável respondeu “tudo certo” ao roteiro de entrar com ADMIN sintético, criar conta OPERATOR e conferir sua presença na equipe, tentar inativar o último ADMIN e verificar a proteção, entrar como OPERATOR e conferir ausência de Equipe e “Acesso restrito” pela rota direta. Esses cenários web ficam PASS por relato humano. Alteração de e-mail no Android, inspeção visual com texto ampliado e limpeza final continuam pendentes; TASK-006 permanece IN_REVIEW. Registro documental PRIMARY em TASKS.md; Incidental Changes: NONE.

#### Quality Gates
Build: PASS — build/tipos e bundle Android, evidências acima; build web final da correção de rótulos em browser-05.log.
Lint: PASS — verify-final.log.
Unit Tests: PASS — 33 casos distintos, incluindo dois de relógio e seis de protocolo mobile/armazenamento injetado; armazenamento nativo foi conferido separadamente pelo responsável.
Integration Tests: PASS — 39 casos backend e relay HTTPS real no E2E.
API Tests: PASS — contratos/permissões/regressão e fluxos de UI com API real.
Security: PASS com mitigação explicitamente aprovada — TLS/CSRF/cookies/rotas/patch e regressões PASS; restauração/saída no Android aceitas pelo responsável. Auditoria npm bruta continua FAIL (quatro high propagados do aviso node-forge), não é auditoria limpa.
Acceptance Criteria: PASS — evidências automáticas e aceites humanos registrados, com aceite global final do responsável. Limitações específicas de observação preservadas no fechamento.
Regression Tests: PASS — 72 casos backend/protocolo/relógio e sete E2E distintos dirigidos, 79 no total; logs incluem falhas históricas seguidas por correção e revalidação, não uma única rodada integral de 79 casos.

#### Scope Validation
Allowed Changes: PASS.
Incidental Changes: PASS — tabela de seis arquivos, sem efeito independente.
Forbidden Changes: PASS — nenhuma migration, mudança de requisito ou implementação futura; ampliação temporária de transporte documentada e autorizada.
Scope Creep: NONE — exposição de teste é a ampliação explícita rastreada, sem infraestrutura de produção.

#### Definition of Done
PASS — implementação, gates aplicáveis, commits anteriores e aceite final do responsável. Túnel e Metro encerrados. Remoção da regra/encaminhamento Metro no Windows exige sessão Administrador e segue como limpeza operacional informada; não declarar removida.

Fechamento em 25/10/2026, após horário informado pelo responsável (22:46): “tudo certo, mano. pode marcar a 006 como concluída”. Esse é aceite global ao roteiro anterior de zoom/teclado web, texto ampliado Android e alteração de e-mail no Android. Não existe relato separado de solicitação/consumo de CHANGE no Android nesta última rodada, nem QR CHANGE preparado nela; portanto registrar aceite global sem inventar observação individual desse passo. Alteração de e-mail foi comprovada pelo responsável na web e automaticamente na API, além dos testes do cliente mobile. Leitor de tela e iOS não foram validados; não se declara aprovação de acessibilidade completa. Fluxos de contas desta rodada web foram inspecionados no Firefox isolado; não atribuir esses resultados a Chrome/Edge. O checkpoint seguinte deve conferir cobertura acumulada e limitações antes de liberar catálogo.

Encerramento real: q no launcher produziu “Túnel temporário encerrado”, processo terminou com exit 0; Metro PID 24231 recebeu SIGINT e sua sessão terminou com exit 0. A tentativa de executar metro-wifi.ps1 -Remove falhou por ausência de token Administrador no Windows; instrução exata consta em LEIA-ME-ENTREGA.md. Nenhum banco/schema original foi apagado. Solicitação explícita de ZIP autoriza o documento de entrega e empacotamento como atividade de entrega separada, sem ampliar implementação da TASK-006 e sem iniciar TASK-007.

#### Next Eligible TASK
TASK-007 é o próximo trabalho, não iniciado. Dependências TASK-003/004/005/006 DONE; estado BLOCKED mantido até conferência própria de DoR e gates acumulados, sem executar checkpoint por meio deste empacotamento. Contagem: 6/37 DONE; faltam 13 conclusões para 19. Trabalho interrompido por solicitação do responsável para entrega do estado atual ao professor.

### TASK-007 Checkpoint PHASE-01

Nota de entrega anterior ao início: em 26/10/2026, o responsável solicitou publicar o projeto completo em https://github.com/BrunoBrasilJr/garimpo para avaliação do professor. Preparação em chore/TASK-006-entrega-github: código e histórico existentes preservados, cópia selecionada dos logs em EVIDENCIAS/, navegação estrutural no README e atualização do guia de entrega. Atividade de publicação explicitamente autorizada, não execução deste checkpoint. Nenhum código de aplicação, requisito ou teste foi alterado; verificações desta atividade limitam-se à integridade dos arquivos, busca de credenciais conhecidas no histórico e conferência do envio remoto. Status da TASK-007 continua BLOCKED até DoR própria.

#### Status

DONE

#### Phase

PHASE-01

#### Priority

CRITICAL

#### Objetivo

Validar fundação, contas, confirmação, permissões e documentação antes do catálogo.

#### Dependências

DEPENDS_ON: TASK-003, TASK-004, TASK-005, TASK-006

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

N/A; N/A; RNF-001, RNF-002, RNF-005, RNF-006, RNF-008, RNF-012; N/A; ADR-001, ADR-002, ADR-003, ADR-004, ADR-005.

Justificativa técnica: fundação, qualidade ou operação exigida pelos RNFs/ADRs acima; não cria funcionalidade comercial autônoma.

#### Artefatos esperados

Validar fundação, contas, confirmação, permissões e documentação antes do catálogo. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- docs/validation/phase-01.md
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

NO_INCIDENTAL_CHANGES

Nenhuma mudança fora do escopo primário é permitida nesta tarefa.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.
- Alterar código de produção; falhas exigem tarefa de correção e revalidação.

#### Critérios de aceitação

Gates da fase executados, último ADMIN e tokens testados; nenhuma lacuna impeditiva da fase mascarada.

#### Testes necessários

TEST-028, TEST-030. Executar apenas cenários aplicáveis ao módulo e regressões diretamente afetadas; nos checkpoints, executar os gates acumulados da fase.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Retomada autorizada em 2026-11-01, a partir de 6733e22, branch real chore/TASK-007-checkpoint-phase01. Responsável solicitou execução contínua para tentar pelo menos 75% das 37 tarefas até quinta-feira, 2026-11-05: meta de 28 DONE, horário final ainda não informado. Essa instrução substitui a pausa para entrega e não modifica o histórico da meta anterior. Nenhuma conclusão prometida antecipadamente. ZIP não versionado do responsável preservado.

DoR: TASK-003/004/005/006 DONE, artefatos e migrations presentes; ADR-001 a ADR-005 ACCEPTED e pacote de parâmetros ratificado. Últimas evidências válidas das dependências e 79 casos acumulados em TASK-006, sem alteração de aplicação posterior, complementadas na retomada por build/tipos/lint PASS e 33 unitários/protocolo/relógio PASS. Não há regressão conhecida neste momento; reexecução acumulada de integração/E2E/auditoria/bundle é o objetivo deste checkpoint e ainda está em andamento. BLOCKED → READY → IN_PROGRESS. PRIMARY previstos: apenas TASKS.md e docs/validation/phase-01.md. Incidental Changes: NONE; código de produção, migrations e novas funcionalidades proibidos.

Autonomia posterior explícita: ao receber proposta concreta de PD-006 (Goldmine M/NM/VG+/VG/G+/G/F/P para mídia e capa separadas; avaliação inteira 1–5; promoção percentual ou fixa em reais), responsável pediu seguir sem novas permissões genéricas e delegou decisões rotineiras. Adotar o pacote proposto ao preparar TASK-008/013/014, registrando sua origem, sem atribuí-lo ao PDF. Essa decisão não implementa catálogo neste checkpoint. Referência primária consultada para vocabulário: https://www.goldminemag.com/columns/vinyl-value/vinyl-finds-grading-vinyl-part-one.

Responsável respondeu “Não quero usar TalkBack” para esta rodada. Leitor de tela permanece NÃO EXECUTADO; inspeção de rótulos/roles e escala de texto não é teste real de TalkBack. A limitação é rastreada em docs/validation/phase-01.md e na aceitação integral TASK-033; não afirmar certificação, paridade iOS ou execução Chrome/Edge a partir de resultados Firefox. Gates e decisão de fechamento do checkpoint continuam pendentes.

BLOCKER real na revalidação: build/tipos/lint e 72 casos automáticos (33 unidade/protocolo/relógio + 9 core + 14 contas + 16 mensagens) PASS. npm run audit:toolchain FAIL/exit 1 por avisos novos, com relatório integral em test-results/bootstrap/audit-patched.json: 23 pacotes afetados (1 high, 20 moderate, 2 low), incluindo novas origens node-forge, minimatch, glob e deepmerge. A exceção antiga para um único aviso não cobre esses casos. O roteiro interrompeu corretamente antes de E2E/bundle. IN_PROGRESS → BLOCKED por dependência de segurança; preservar trabalho do checkpoint e corrigir a ferramenta no escopo próprio da TASK-002 antes de retomar. Nenhuma auditoria falha convertida em PASS, nenhuma TASK nova concluída.

Retomada após correção em 2026-11-01: TASK-002 DONE em fix/TASK-002-toolchain-security, código 2ebf90a e fechamento bd7ee7c incorporados por fast-forward na branch deste checkpoint. DoR revalidada, dependências/ADRs/artefatos válidos. BLOCKED → READY → IN_PROGRESS → IN_REVIEW → DONE. Gates acumulados da mesma revisão de código: instalação limpa com scripts, build/tipos/lint, 45 unitários, 39 integrações, sete E2E Firefox/HTTPS e exportação Android PASS. Total 91 casos distintos; nenhuma suíte repetida apenas por alterações documentais. Npm audit bruto FAIL/exit 1, sete low somente de deepmerge; política restrita de hashes/patch/regressões PASS. Falhas anteriores mantidas em docs/validation/phase-01.md. Testes realizados pelo agente; sem novo teste humano/nativo ou TalkBack/iOS/Chrome/Edge inventados. Validação integral dessas limitações na TASK-033.

##### TASK Execution Report — fechamento PHASE-01

TASK: TASK-007. Status: DONE. Branch: chore/TASK-007-checkpoint-phase01. Commits existentes: 9297f20 (bloqueio), 2ebf90a e bd7ee7c (correção TASK-002 incorporada). Hash do fechamento documental será obtido do log real.

Primary Changes: docs/validation/phase-01.md e trechos operacionais/índice pertinentes de TASKS.md. Incidental Changes: NONE. Tests Executed: npm ci --no-audit --no-fund; npm run verify; npm run bundle:android; npm run test:account-ui, runtime Linux Node 24.22.1/npm 11.19.1, PostgreSQL 17 e schemas separados; resultados reais no documento de validação. Conferência documental de índice/grafo/escopo antes do commit. Build PASS; Lint PASS; Unit Tests PASS; Integration Tests PASS; API Tests PASS; Security PASS no critério restrito, auditoria bruta FAIL preservada; Acceptance Criteria PASS no recorte da fase; Regression Tests PASS. Allowed Changes PASS; Incidental Changes NONE; Forbidden Changes PASS; Scope Creep NONE; Definition of Done PASS.

Contagem: 7/37 DONE. Next Eligible TASK: TASK-008 como candidata com dependência satisfeita; segue BLOCKED até sua conferência própria de DoR e consolidação documental de PD-006. Continuidade autorizada; não iniciar código de catálogo por meio deste checkpoint.

Conferência final própria PASS: 37 tarefas, 79 dependências, grafo sem ciclos, índice/estados detalhados coerentes e referências locais dos dois documentos alterados existentes. Restauração de node_modules no caminho original terminou exit 0, hashes dos quatro arquivos revisados PASS e npm ls confirmou uma versão deduplicada de Forge 1.4.2/deepmerge 4.3.1/glob 14.0.3/minimatch 11.0.3. Árvores parciais e ZIP do responsável preservados; somente os dois arquivos PRIMARY entram no fechamento deste checkpoint.

### TASK-008 Implementar catálogo, metadados e imagens na API

#### Status

DONE

#### Phase

PHASE-02

#### Priority

HIGH

#### Objetivo

Criar edições/ofertas, anos distintos, gênero principal, artistas de faixa/edição, áudio por faixa, fotos e busca.

#### Dependências

DEPENDS_ON: TASK-007

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-005, RF-006, RF-017; RN-001, RN-004, RN-005, RN-026, RN-027, RN-032, RN-036, RN-045; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010; UC-005, UC-006, UC-017. ADRs: ADR-001, ADR-006.

#### Artefatos esperados

Criar edições/ofertas, anos distintos, gênero principal, artistas de faixa/edição, áudio por faixa, fotos e busca. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/api/src/modules/catalog/**
- apps/api/src/modules/media/**
- apps/api/prisma/** somente catálogo/mídia
- packages/contracts/catalog/**
- tests/catalog/**
- tests/media/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/prisma/** somente TrackArtist e campos anos/gênero principal/imagem por edição

Precisão do caminho existente: o módulo de contratos fica em packages/contracts/src/catalog/**, sob o src já compilado do workspace; mesma responsabilidade do caminho esquemático acima. Preparação documental sob a delegação explícita de 01/11 acrescenta como PRIMARY apenas README.md (RN-005/PD-006), docs/architecture/parametros.md (vocabulários e parâmetros técnicos de catálogo/mídia) e docs/architecture/api.md (detalhamento de wire do catálogo já especificado). A necessidade foi identificada antes da edição: consolidar a decisão residual adotada e tornar os contratos reproduzíveis, sem atribuir novas respostas ao PDF ou executar avaliações/promoções futuras. apps/api/package.json e lockfile são PRIMARY somente para sharp 0.35.5, necessário para decodificar/regravar bytes de imagem, com versões oficiais e compatibilidade consultadas. Não alterar SDK ou dependências alheias.

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Validação de publicação, usados com descrição/foto/Goldmine; 10 imagens edição/8 usado, até 5 MB e tipos permitidos; inativação não destrói referência.

#### Testes necessários

TEST-005, TEST-006, TEST-017. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Início em 2026-11-01, branch real feature/TASK-008-catalogo-api, base ae95b0a (TASK-007 DONE). DoR PASS: dependência concluída e 91 casos/gates acumulados atuais válidos; ADR-001/006 ACCEPTED; requisitos/contratos/testes relidos; vocabulário PD-006 definido por decisão técnica sob a delegação recebida, consolidado documentalmente antes do código. Transições BLOCKED → READY → IN_PROGRESS. ZIP alheio preservado. Nenhuma implantação ou serviço pago necessário.

Plano PRIMARY: módulo catalog/media, contratos src/catalog, onze modelos de catálogo/mídia e respectivas constraints/migration, testes catalog/media, documentos residuais delimitados acima, dependência de decoder e TASKS. Incidental previsto: registro mínimo em app.ts, export de contratos, comando test:catalog/verify, inclusão da suíte catalog no runner de integração já protegido e maxWorkers=2 na configuração unitária para limitar memória dos novos testes de imagens no computador de 8 GB, preservando limites/asserções e concorrência real dos testes transacionais. Necessários, causados diretamente pelo incremento, mínimos, sem funcionalidade independente/regra nova/arquitetura/quebra de contrato/mudança da autenticação existente ou violação de Forbidden Changes; aplicar os nove critérios novamente na revisão. Não refatorar segurança de contas nem criar modelos de pedidos, reservas, avaliações, promoções ou evidências privadas. Registro físico inicial segue API-017.04; ajustes e livro de estoque pertencem à TASK-009, integrações comerciais aos incrementos posteriores.

Construção em andamento: tipos e lint de API/contratos passaram antes da adição dos novos testes. Sharp 0.35.5 fixado, quatro pacotes Linux acrescentados com scripts de instalação/verificação executados; lockfile adiciona somente suas dependências opcionais de plataforma, sem atualização das demais. O comando de diff da CLI Prisma retornou exit 0 sem materializar arquivo; nenhuma migration vazia foi aceita. SQL foi escrito/revisado explicitamente para os onze modelos, incluindo vocabulário, limites locais e FK diferível que exige gênero principal pertencente à edição. Implantação, testes de banco e prova de integridade ainda pendentes. Não registrar essa preparação como DONE ou PASS dos testes novos.

Validação dirigida posterior em 2026-11-02: tipos completos PASS; primeira conferência de lint FAILED por import não usado em teste, corrigido, lint dirigido posterior PASS. Unitários novos PASS, 17 casos (12 mídia, cinco contratos). Integração/API PASS, 19 casos em task008_98e396745ba54b6688637569c0b7227c; três migrations aplicadas com sucesso, concorrência real comprovada por duas aplicações bloqueadas simultaneamente em pg_stat_activity antes da liberação. Sem resets da base original. Logs: test-results/catalog/code-first-check.log, unit-first-check.log e database-first-check.log. Aviso de depreciação do driver pg preservado na saída, sem upgrade oportunista ou supressão. Acrescentada validação de NUL/tamanho após normalização de nomes; essa última mudança e a regressão acumulada ainda exigem rodada integral. Status continua IN_PROGRESS, não DONE; nenhum aceite de interface antecipado.

##### TASK Execution Report — fechamento em 2026-11-02

TASK: TASK-008. Status: DONE. Branch: feature/TASK-008-catalogo-api. Commit de implementação: f64f5d1db7c9c18053e182feb0540655cccd7f50. Fechamento documental a conferir no log real. IN_PROGRESS → IN_REVIEW → DONE após a rodada integral abaixo; registros parciais anteriores permanecem históricos.

Primary Changes: README.md somente RN-005/PD-006; docs/architecture/parametros.md somente vocabulários/limites técnicos; docs/architecture/api.md somente detalhamento de catálogo/mídia e leitura administrativa complementar API-017.17; apps/api/package.json e package-lock.json somente Sharp e dependências; apps/api/prisma/schema.prisma e migrations/202611010001_catalog/migration.sql somente os onze modelos de catálogo/mídia; apps/api/src/modules/catalog/{errors,router,service,validation,views}.ts; apps/api/src/modules/media/store.ts; packages/contracts/src/catalog/index.ts; tests/catalog/{README.md,catalog.integration.ts,http.ts,validation.test.ts,vitest.integration.config.ts}; tests/media/store.test.ts; TASKS.md. Classificação PRIMARY de todos esses arquivos validada no escopo delimitado.

Incidental Changes:

| Arquivo/Componente | Alteração | Justificativa |
| --- | --- | --- |
| apps/api/src/app.ts | Import/registro mínimo do router e opções opcionais do catálogo | Liga o módulo; guardas/parsers próprios ignoram rotas alheias; autenticação existente preservada e exercitada na regressão |
| packages/contracts/src/index.ts | Exports de tipos e vocabulário do catálogo | Necessário ao mesmo workspace de contratos, sem regra independente |
| package.json | Comando test:catalog e inclusão em verify | Executa o gate obrigatório do módulo novo |
| tests/core/run-integration.mjs | Inclui catalog e prefixo task008 | Reaproveita isolamento já existente sem modificar a restrição loopback/garimpo_test ou apagar schemas |
| tests/vitest.config.ts | maxWorkers=2 | Contém memória da decodificação de imagens no computador de 8 GB; mantém asserções, limites e concorrência real dentro dos testes |

Os cinco incidentais passaram nos nove critérios: indispensáveis, diretamente causados, mínimos, sem funcionalidade autônoma/regra de negócio/arquitetura/quebra de contrato/alteração da proteção de contas existente ou Forbidden Change. Orçamento limitado aos pontos de ligação/teste acima; não houve refatoração de contas/mensagens.

Tests Executed: no checkout Linux isolado do commit f64f5d1, Node 24.22.1/npm 11.19.1/PostgreSQL 17, npm ci --no-audit --no-fund instalou 808 pacotes com preinstall/postinstall/hashes PASS; npm run verify PASS em build/tipos/lint, 62 unitários e 58 integrações reais (9 core, 14 contas, 16 mensagens, 19 catálogo). npm run test:account-ui PASS integral, sete casos Firefox/HTTPS; npm run bundle:android PASS, 586 módulos em 9,4 segundos. Total 127 casos distintos PASS, sem contar repetição de rodadas. Log test-results/catalog/native-full-verification.log e audit-after.json. Schemas: task003_6acb390cd39d4fb0b75ba97d0bbd15b6, task004_9516c8a4ca88494da2bd83fd1ab77f0c, task005_9b7fb0b90456446db8a0af9b2a05d712 e task008_af59a9d9afbd4af182b5ee16f9050ba9. Só foram migrados schemas separados de teste; nenhum dado original alterado.

Quality Gates: Build PASS; Lint PASS; Unit Tests PASS; Integration Tests PASS; API Tests PASS; Security PASS no critério restrito vigente, npm audit bruto FAIL/exit 1 com sete low somente da cadeia deepmerge e zero moderate/high/critical, hashes/regressões conferidos, nenhum advisory novo aceito; Acceptance Criteria PASS no recorte de API deste incremento; Regression Tests PASS. Warning pg preservado, trace aponta a execução interna de PgTransaction em @prisma/adapter-pg; versão 8.23.1 mantida, sem ocultação, falha observada ou alteração oportunista. Não há nova execução física Android, TalkBack, iOS ou inspeção humana atribuída a esta tarefa de API. Publicação/GUI pertencem aos incrementos seguintes; histórico comercial real será integrado nos checkpoints previstos, sem tomar a tabela de prova de FK como pedido implementado.

Scope Validation: Allowed Changes PASS; Incidental Changes PASS, cinco arquivos acima; Forbidden Changes PASS; Scope Creep NONE. Definition of Done: PASS. Contagem 8/37 DONE. Next Eligible TASK: TASK-009, candidata com dependência satisfeita, ainda BLOCKED até sua própria DoR. Continuidade já autorizada.

### TASK-009 Administrar catálogo e estoque inicial

#### Status

DONE

#### Phase

PHASE-02

#### Priority

HIGH

#### Objetivo

Entregar catálogo/estoque para ADMIN/OPERATOR, movimentos e limiar de estoque baixo por edição. Preparar portas de consulta de vínculos comerciais para TASK-023.

#### Dependências

DEPENDS_ON: TASK-008

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-017, RF-018; RN-001, RN-004, RN-005, RN-006, RN-013, RN-019, RN-021, RN-022, RN-024, RN-026, RN-027, RN-032, RN-035, RN-036, RN-038, RN-039, RN-045; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010; UC-017, UC-018. ADRs: ADR-001, ADR-003, ADR-006.

#### Artefatos esperados

Entregar catálogo/estoque para ADMIN/OPERATOR, movimentos e limiar de estoque baixo por edição. Preparar portas de consulta de vínculos comerciais para TASK-023. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/web/src/features/admin/catalog/**
- apps/api/src/modules/inventory/**
- apps/api/src/modules/catalog/lifecycle*
- apps/api/prisma/** somente movimento/controle estoque
- packages/contracts/inventory/**
- tests/inventory/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

Precisão de caminho: contratos em packages/contracts/src/inventory/** no src existente do workspace. Sob a delegação explícita de continuidade/decisões técnicas sem novas permissões genéricas, PRIMARY adicionais estritamente necessários: catalog/service.ts e catalog/router.ts somente para acoplar o livro do estoque inicial, a guarda lifecycle e o registro das rotas de estoque no transporte administrativo já protegido; docs/architecture/api.md e data-model.md somente contratos/estado conservador/StockMovement; tests/catalog/catalog.integration.ts somente fixture explícita da porta comercial no ambiente isolado, mantendo provas de FK e demais critérios anteriores. Não tratar esses acoplamentos de regra como limpeza incidental nem alterar autenticação de contas. Guardas comerciais sem adaptador real falham fechadas; mocks de teste nunca são padrão de runtime. Não criar modelos de pedido/reserva/atendimento antecipadamente.

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Novos alertam em <= limiar; usados em zero; só painel. Ajustes não negativos; autorização ADMIN/OPERATOR e usuário negado. Guardas comerciais inicialmente conservadoras, não mocks liberadores em runtime.

#### Testes necessários

TEST-017, TEST-018. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Início em 2026-11-02, branch real feature/TASK-009-catalogo-estoque, base 4bcf2e8. TASK-008 DONE, código/API/contratos reais e 127 casos acumulados PASS, instalação limpa atual válida; ADR-001/003/006 ACCEPTED. Requisitos, contratos, testes, Scope Guard e código existente relidos. PD-006 resolvida na tarefa anterior; nenhuma PD bloqueia este incremento. DoR PASS; BLOCKED → READY → IN_PROGRESS. Continuidade já autorizada, ZIP alheio preservado, sem aprovação genérica pendente.

Plano: painel web da equipe para metadados/edições/faixas/ofertas/fotos; movimento físico inicial e ajustes atômicos/idempotentes; limiar de novos por edição e ausência de usados disponíveis só no painel. Porta comercial retornará indisponibilidade conservadora enquanto não integrada: não inventar reservado=0/disponível conhecido, impedir reduções ou exclusões sem informação confiável, permitir adições que não invadem vínculos. Integração comercial completa permanece nas tarefas previstas. Saldo desconhecido não será exibido como zero; alerta só quando demonstrável, sem e-mail. Incidental previsto: navegação/registro web, exports de contratos, comandos/configuração da suíte inventory e relações inversas necessárias ao modelo StockMovement, todos mínimos e sujeitos aos nove critérios na revisão. Nenhum gate novo aprovado antecipadamente.

Validação intermediária: build inicial PASS; typecheck detectou prop opcional com undefined explícito, corrigida sem relaxar configuração. Primeira validação nativa e1f6443: build/typecheck/lint e 66 unitários PASS; integração 10/11 PASS, um erro de fixture ao ativar usado sem conservação obrigatória (constraint existente corretamente rejeitou). IN_PROGRESS → FAILED → IN_PROGRESS para correção no escopo: preparação agora publica edição/usados via rotas reais, fotos próprias e metadados obrigatórios, mantendo a asserção de agregação. Log test-results/inventory/first-native-check.log preservado. Um comando anterior falhou ao selecionar referência nativa e executou testes na revisão antiga; não é evidência de TASK-009. Runner posterior confirma hash e usa set -e. Incidental adicional mínimo: harness HTTPS compartilhado recebe mediaRoot no diretório isolado do teste, para fotos desta interface não usarem a raiz de mídia local; nenhuma mudança de autenticação/validação. Revisão das regras React aplicada, módulo administrativo carregado sob demanda e dados independentes em paralelo. Nenhum DONE antecipado.

#### TASK Execution Report

TASK: TASK-009. Status: DONE (IN_PROGRESS → IN_REVIEW → DONE após revisão final). Branch: feature/TASK-009-catalogo-estoque. Commits reais de código/testes: f26d6bd, e1f6443, b225755, 471b537, c0fd69d, f44b2d1. Base estável 4bcf2e8; fechamento documental em commit posterior próprio.

##### Primary Changes

Classificação PRIMARY: TASKS.md; apps/api/prisma/schema.prisma e migrations/202611020001_inventory/migration.sql (somente StockMovement e suas relações inversas); apps/api/src/modules/inventory/{ledger,router,rules,service}.ts; catalog/lifecycle.ts, catalog/service.ts e catalog/router.ts nos acoplamentos explicitados; packages/contracts/src/inventory/index.ts; os seis arquivos de apps/web/src/features/admin/catalog/**; docs/architecture/{api,data-model}.md; tests/catalog/catalog.integration.ts no ajuste isolado de porta/FK; tests/inventory/{fixtures.ts,rules.test.ts,inventory.integration.ts,catalog.spec.ts,vitest.integration.config.ts,playwright.config.ts}.

Painel da equipe com metadados, edições/faixas, preços/condições, fotos próprias, publicação/inativação e exclusão protegida; estoque e alertas confirmados paginados. Livro físico registra abertura e ajustes com saldo anterior/posterior, versão, motivo e responsável. Ajustes/abertura, auditoria, idempotência e outbox são atômicos; usado permanece individual. Migração consolida saldos positivos existentes sem alterar quantidade original nem inventar vendas; FK preserva o livro mesmo após saldo zero. Porta comercial padrão indisponível, selada e sem chave de liberação via ambiente/requisição. Reservado/desconhecido não vira zero; redução/exclusão dependente da consulta falha fechada. Consulta KNOWN é validada integralmente; vínculos reservados/comprometidos e histórico são preservados. Integração comercial definitiva permanece nos incrementos previstos.

##### Incidental Changes

| Arquivo/Componente | Alteração | Justificativa |
| --- | --- | --- |
| apps/web/src/navigation/App.tsx | rota lazy e link administrativo por contexto já existente | entrada mínima para alcançar o painel; mesmas regras de autenticação |
| apps/web/src/navigation/route.ts | reconhecer catalog-admin | registro mínimo do destino |
| packages/contracts/src/index.ts | exportar tipos inventory | disponibilizar contrato do workspace |
| package.json | test:inventory e inclusão em verify | executar a suíte nova no gate existente, sem alterar dependências |
| tests/core/run-integration.mjs | seleção inventory/schema task009 isolado | reutilizar runner e proteção da base de teste |
| tests/e2e/account/harness.mjs | mediaRoot dentro do diretório isolado | fotos do novo fluxo não usam a raiz de mídia local; TLS e autenticação preservados |

As seis alterações satisfazem necessidade/causalidade/minimalidade, não adicionam função independente, regra de negócio, arquitetura significativa, quebra de contrato, mudança de autenticação/proteção de dados ou proibição. Relações inversas da nova entidade ficam classificadas PRIMARY junto ao schema permitido; nenhuma coluna de conta foi criada/alterada.

##### Tests Executed

Ubuntu WSL2, Node 24.22.1/npm 11.19.1/PostgreSQL 17, clone nativo de validação; fonte confirmada por hash. e1f6443: build/typecheck/lint e 66 unitários PASS (14 arquivos). b225755: typecheck/lint, integração estoque 12 PASS e regressão catálogo 19 PASS. c0fd69d: build/typecheck/lint, integração estoque 12 PASS com guarda de exclusão do próprio livro, E2E administrativo 2 PASS e contas/equipe 7 PASS em Firefox real com CA isolada confiada; core 9, contas 14 e mensagens 16 integrações PASS; audit:toolchain PASS segundo política vigente. f44b2d1 alterou somente CSS/teste: novo build web, tsc de testes, lint dirigido e os 2 E2E administrativos PASS, agora também a 390 px com texto 200%, foco de erro e ausência de rolagem horizontal. Total acumulado: 145 casos distintos PASS = 66 unitários + 70 integrações + 9 E2E, sem contar repetições. Inspeção visual do screenshot estreito realizada; nenhum teste físico Android/TalkBack/iOS/Chrome/Edge alegado nesta interface web.

Foram demonstrados conflitos reais de dois clientes/transações bloqueados simultaneamente por terceiro cliente PostgreSQL; apenas uma perda consome o usado, replay concorrente de entrada tem um efeito. Falha real ao enfileirar reverte saldo/movimento/auditoria. Teste executa o SQL real da migração em outro schema isolado com saldos pré-existentes e comprova consolidação sem alterar quantidades. Sem reset/drop/truncate/restauração sobre base original. Schemas finais: task009_32b8948dd8d44234a990e17f643ecf2e, task008_1ee5a1954d9049acb13e1403d985bbba, task003_6a85dfccd3ad4dc4a1967d4c6e24c211, task004_8ab387450cff4e6880c8005cff3569d4, task005_23e687f38dcb48d1b918890a3107b56f; schemas de backfill/UI adicionais preservados.

Logs locais preservados em test-results/inventory/{first-native-check,second-native-check,final-native,final-native-02,enlarged-ui-check}.log. Falhas intermediárias do E2E eram seletores ambíguos do input file e uso de APIRequestContext sem a CA NSS do Firefox: corrigidos selecionando o botão de envio por nome e verificando a resposta pública pelo fetch real do navegador; certificados nunca ignorados. Não contar essas execuções como PASS. Screenshot local catalog-mobile-width.png; material sintético. Warning de depreciação pg/Prisma já conhecido preservado, sem mascaramento/atualização oportunista. Auditoria bruta mantém exit 1/FAIL, 7 low de deepmerge, zero moderate/high/critical; política específica de versão/bytes/mitigação e regressões PASS, sem alegação de npm audit limpo. Dependências/lockfile não mudaram nesta TASK.

##### Quality Gates

Build PASS; Lint PASS; Unit Tests PASS; Integration Tests PASS; API Tests PASS; Security PASS no escopo e política de mitigação vigente (auditoria bruta FAIL explicitada); Acceptance Criteria PASS; Regression Tests PASS. GATE-01 a GATE-08 aplicáveis satisfeitos. Sem teste físico/leitor de tela inferido de teste automatizado web. Portas indisponíveis são condição conservadora prevista da tarefa, não aprovação antecipada da integração comercial.

##### Scope Validation e Definition of Done

Allowed Changes PASS, incluindo precisão PRIMARY registrada antes da edição; Incidental Changes PASS (tabela acima); Forbidden Changes PASS; Scope Creep NONE. IDs preservados, nenhuma tarefa futura executada, nenhum serviço externo/cobrança/túnel novo; ZIP alheio preservado. Definition of Done: PASS. Contagem 9/37 DONE. Next Eligible TASK: TASK-010, candidata com dependência TASK-008 satisfeita; sua própria DoR será revalidada antes da promoção. Continuidade explicitamente autorizada.

### TASK-010 Criar catálogo público no site

#### Status

DONE

#### Phase

PHASE-02

#### Priority

HIGH

#### Objetivo

Entregar busca/filtros, página de edição, ofertas e áudio por faixa na web.

#### Dependências

DEPENDS_ON: TASK-008

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-005, RF-006; RN-004, RN-005, RN-026, RN-032, RN-036, RN-045; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010; UC-005, UC-006. ADRs: ADR-001.

#### Artefatos esperados

Entregar busca/filtros, página de edição, ofertas e áudio por faixa na web. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/web/src/features/catalog/**
- tests/e2e/catalog-web/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.

#### Critérios de aceitação

Busca de artista inclui faixa; década usa edição; ausentes não inventados; catálogo público acessível.

#### Testes necessários

TEST-005, TEST-006. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

#### Início e DoR

2026-11-02, branch real feature/TASK-010-catalogo-web, base estável 764b94b. TASK-008 DONE, API/contratos/metadados/fotos reais disponíveis; sua regressão de 19 integrações e gates acumulados da TASK-009 válidos, sem falha conhecida de dependência. ADR-001 ACCEPTED; PD-006 já resolvida, demais PDs não bloqueiam este recorte. AGENTS/conciliação, README/pendências, TASKS/Scope Guard, ADR/API/testes e código/testes existentes relidos. DoR PASS; BLOCKED → READY → IN_PROGRESS. Continuidade explicitamente autorizada.

PRIMARY: busca/filtros combinados, paginação/URL, detalhe agrupando novos/usados, metadados desconhecidos explícitos, fotos e áudio opcional por faixa em apps/web/src/features/catalog/**; E2E com navegador/API/banco reais em tests/e2e/catalog-web/**; registro em TASKS. Incidental previsto: somente registro mínimo das rotas públicas e navegação em App.tsx/route.ts, sem modificar autenticação; comandos/configuração se estritamente necessários para rodar a suíte. Os nove critérios se aplicam; sem migrations/dependências/regras comerciais/backend novo, carrinho/reserva/desejos/avaliações permanecem nas tarefas correspondentes. Nenhum resultado de teste novo inferido antecipadamente.

Precisão PRIMARY sob a delegação técnica explícita do responsável: tests/e2e/account/harness.mjs, exclusivamente a diretiva media-src do servidor isolado, deve permitir self e HTTPS para reproduzir o link externo já exigido por RN-026. O default-src self herdado impediria esse caso; habilitar a capacidade aprovada não altera scripts, autenticação, TLS, cookies ou API. Trata-se de configuração de segurança ligada à funcionalidade, portanto registrada como PRIMARY, não disfarçada de incidental. Não haverá proxy/upload de áudio pela aplicação. Teste com segundo servidor HTTPS de áudio sintético somente loopback, outro host/origem e certificado da CA isolada já confiada, seguido de falha real do recurso. Três E2E públicos e build/typecheck/lint já PASS em 3a9d68c; prova positiva de áudio externo ainda pendente, sem alegação de aceitação antecipada dessa precisão.

#### TASK Execution Report

TASK: TASK-010. Status: DONE (IN_PROGRESS → IN_REVIEW → DONE após revisão). Branch real: feature/TASK-010-catalogo-web. Commits reais: 3a9d68c, 87e3ae4, 00a33a4; fechamento documental posterior próprio. Base 764b94b.

##### Primary Changes

Classificação PRIMARY: TASKS.md; apps/web/src/features/catalog/{Catalog.tsx,Edition.tsx,Filters.tsx,api.ts,catalog.css}; tests/e2e/catalog-web/{catalog.spec.ts,seed.ts,audio.ts,playwright.config.ts,public-client.test.ts}; tests/e2e/account/harness.mjs somente a diretiva de mídia explicitada previamente. Catálogo acessível sem autenticação e sem encaminhar cookies nas leituras públicas; filtros combinados/paginados preservados na URL e no retorno do detalhe, década do ano da edição, valores em centavos exatos. Grupos de novos e usados individuais com preço/conservações/particularidades/fotos próprias, seleção local explícita sem reserva e esgotado não selecionável. Anos/país/gramatura/catálogo desconhecidos exibidos sem inventar valores. Áudio opcional por faixa com controle do navegador e falha isolada; aplicação não recebe/armazena áudio. Erros, carregamento, lista vazia, teclado/foco, fotos ampliáveis e texto a 200% em largura estreita. Revisão React: carregamento sob demanda, requisições independentes sem cascata, cancelamento de respostas antigas, dados derivados sem duplicação de estado e formulários rotulados.

##### Incidental Changes

| Arquivo/Componente | Alteração | Justificativa |
| --- | --- | --- |
| apps/web/src/navigation/App.tsx | registro lazy público, link de exploração/entrada pela marca e texto mínimo de acesso | alcançar o recurso novo sem esperar autenticação; regras de login/equipe preservadas |
| apps/web/src/navigation/route.ts | reconhecer catalog/edition e query pública opcional | navegação/retorno de filtros sem alterar tokens/rotas privadas existentes |

Os dois arquivos satisfazem os nove critérios: necessários, diretamente causados, mínimos, sem função independente/regra nova/arquitetura/quebra de contrato ou comportamento de autenticação/proteção de dados, nem proibição. A configuração de mídia é PRIMARY declarado e não incidental. Sem dependências, backend, migrations ou APIs adicionais.

##### Tests Executed

Ambiente: clone nativo Ubuntu WSL2, Node 24.22.1/npm 11.19.1/PostgreSQL 17, Firefox real com CA isolada confiada e ignoreHTTPSErrors=false. 3a9d68c: npm run build, npm run typecheck e npm run lint PASS; playwright --config tests/e2e/catalog-web/playwright.config.ts, 3 E2E públicos PASS; npm run test:account-ui, 7 PASS; suíte tests/inventory/playwright.config.ts, 2 PASS. 87e3ae4: typecheck/lint PASS; caso de detalhe repetido com áudio HTTPS em outro host/origem e certificado confiado PASS: navegador reconheceu duração real de 1 segundo do WAV sintético servido somente pelo provedor de teste; depois 503 real do mesmo recurso exibiu erro sem impedir catálogo. Nenhum som audível/dispositivo físico inferido. Sete E2E de contas/equipe repetidos pelo ajuste da política de mídia, todos PASS. 00a33a4 acrescentou somente testes: tsc de testes/lint dirigido e npm test PASS, 68 unitários em 15 arquivos, incluindo centavos precisos e exclusão de tokens/parâmetros privados da URL enviada ao catálogo.

Foram comprovados visitante e cliente, busca por artista exclusivo da faixa, filtros que não combinam preço de um usado com conservação de outro, década 1970 excluindo reedição 2025 e ano desconhecido mesmo com original 1975; publicação oculta, detalhe sem ID seguro, áudio ausente/falho, foto própria e usado esgotado desabilitado; cookies omitidos em consulta pública mesmo autenticado; paginação real de dados do banco, voltar/histórico, foco/teclado e ausência de rolagem horizontal a 390 px/200%. Todos os dados são sintéticos, preparados pelas APIs reais autorizadas; aplicação/base original não restauradas/resetadas. Provedor de áudio encerrado no finally. Inspeção visual do screenshot estreito realizada. Logs locais test-results/catalog-web/{first-verification,external-audio-check,unit-check}.log e public-narrow.png. Sem execução física de Android/iOS/TalkBack ou validação Chrome/Edge alegada.

##### Quality Gates

Build PASS; Lint PASS; Unit Tests PASS (68); Integration Tests PASS (composição navegador/API/PostgreSQL real; 70 integrações backend acumuladas válidas da TASK-009, sem alteração desses módulos nesta tarefa); API Tests PASS via E2E reais; Security PASS (HTTPS/CA, política de mídia explicitada, leitura pública sem cookie, fronteira de query/tokens, regressão de autenticação). Dependências/lockfile/patches inalterados: evidência de auditoria da TASK-009 permanece aplicável, bruta FAIL com 7 low de deepmerge e nenhuma moderate/high/critical, mitigação específica testada, sem alegação de auditoria limpa. Acceptance Criteria PASS; Regression Tests PASS (contas/equipe/estoque e unitários existentes). Gates 01–08 aplicáveis satisfeitos.

##### Scope Validation e Definition of Done

Allowed Changes PASS com precisão PRIMARY anterior à edição; Incidental Changes PASS (dois arquivos); Forbidden Changes PASS; Scope Creep NONE. IDs preservados, nenhuma compra/reserva/lista de desejos/avaliação antecipada. Definition of Done PASS. Total acumulado 150 casos distintos PASS = 68 unitários + 70 integrações + 12 E2E, sem duplicar repetições. Contagem 10/37 DONE. Next Eligible TASK: TASK-011, candidata com TASK-008 satisfeita; exige a própria DoR, sem saltar checkpoint. Continuidade explicitamente autorizada.

### TASK-011 Criar catálogo público no aplicativo

#### Status

DONE

#### Phase

PHASE-02

#### Priority

HIGH

#### Objetivo

Entregar recursos de cliente do catálogo em React Native/Expo nas plataformas ratificadas.

#### Dependências

DEPENDS_ON: TASK-008

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-005, RF-006; RN-004, RN-005, RN-026, RN-032, RN-036, RN-045; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010; UC-005, UC-006. ADRs: ADR-001.

#### Artefatos esperados

Entregar recursos de cliente do catálogo em React Native/Expo nas plataformas ratificadas. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/mobile/src/features/catalog/**
- tests/e2e/catalog-mobile/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.

#### Critérios de aceitação

Paridade funcional com web, sem administração; leitor de tela e ampliação de texto nos componentes.

#### Testes necessários

TEST-005, TEST-006. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

#### Início e DoR

2026-11-02, branch real feature/TASK-011-catalogo-mobile, base 49adf7c. TASK-008 DONE com API/contratos reais; regressões acumuladas válidas, inclusive catálogo web funcional e 150 casos PASS. ADR-001 ACCEPTED; Android/iOS preservados como alvos, sem exclusividade; PDs remanescentes não impedem este recorte. AGENTS/conciliação, README/pendências, TASKS/Scope Guard, ADR/API/testes e componentes/cliente mobile existentes relidos. DoR PASS; BLOCKED → READY → IN_PROGRESS. Continuidade autorizada sem novas permissões genéricas. Responsável recusou TalkBack; isso não dispensa rótulos/semântica/ampliação, nem autoriza alegar que um leitor/dispositivo foi testado.

PRIMARY: apps/mobile/src/features/catalog/** e tests/e2e/catalog-mobile/**. Precisão técnica delegada PRIMARY antes da edição: apps/mobile/package.json e package-lock.json somente dependências estritamente necessárias de áudio compatível com Expo 57 e adaptador de teste dos componentes; apps/mobile/app.json somente plugin de reprodução com gravação/microfone/background desabilitados (não tratar permissões como incidental). expo/bundledNativeModules.json e documentação oficial SDK 57 indicam expo-audio ~57.0.5: fixar 57.0.5, sem atualizar SDK. Documentação https://docs.expo.dev/versions/v57.0.0/sdk/audio/ consultada; hooks cuidam do ciclo de vida do player, sem upload/arquivo de áudio na aplicação. Adaptador react-native-web 0.21.0 somente para validar componentes compartilhados no navegador, sem substituir evidência física nativa. Reavaliar necessidade/configuração mínima antes de instalar. Incidental previsto: registro de tela/link em navigation/App.tsx, comando/configuração estritamente necessários de testes/tipos. Sem migrations, administração mobile, regras de compra ou tarefa futura. Nenhum gate novo aprovado antecipadamente.

Instalação inicial: expo-audio 57.0.5 instalado no clone nativo; tentativa isolada de react-native-web encontrou ERESOLVE porque o resolvedor escolheu react-dom 19.3.1 incompatível com React 19.2.3 ratificado. IN_PROGRESS → FAILED → IN_PROGRESS após correção estrita no escopo: fixar o adaptador de teste com react-dom 19.2.3, já usado pela web, sem force/legacy-peer-deps/atualização do SDK. Instalados 20 pacotes adicionais ao total físico anterior (áudio e adaptador/transitivos), somente package.json mobile e lockfile modificados pelo npm. Arquivos copiados de volta à raiz canônica e diff conferido. Auditoria npm mantém 7 low conhecidos, sem novos achados relatados; bytes oficiais/mitigados conferidos pelo apply-toolchain-patch. Auditoria estrita e compatibilidade ainda serão executadas como gates. Log local test-results/catalog-mobile/dependency-install.log preserva a tentativa recusada.

Validação intermediária: typecheck/lint/audit:toolchain PASS em 5052e97; bundle do mesmo módulo por Expo/Metro para adaptador web gerado (239 módulos), sem habilitar web como plataforma entregue. 84a3313: typecheck/lint e 72 unitários PASS. E2E identificou CSS bloqueado pela CSP do harness (cor preta em vez da cor nativa esperada), sem remover a asserção. IN_PROGRESS → FAILED → IN_PROGRESS para ajuste do ambiente. Precisão PRIMARY delegada antes da edição: tests/e2e/account/harness.mjs somente um configurador opcional de rotas de teste; tests/e2e/catalog-mobile configura exclusivamente a página de preview com nonce aleatório em estilos autorizados, sem unsafe-inline/relaxamento global. Servidor/CA/origem/API/autenticação permanecem reais e inalterados. O CSSStyleSheet do adaptador reutiliza o elemento react-native-stylesheet previamente autorizado; fonte instalada conferida. Sem inferir leitor/dispositivo real. Configuração npm da pasta principal também atualizada com preinstall/postinstall normais e bytes de patch conferidos; lockfile permanece igual ao commit canônico.

#### TASK Execution Report

TASK: TASK-011. Status: DONE (IN_PROGRESS → IN_REVIEW → DONE após correções e revisão final). Branch real: feature/TASK-011-catalogo-mobile. Base estável 49adf7c. Commits reais: d40d0c2, 5052e97, 84a3313, 9eff9ed, 1641827, 9f2461a, 1a1bd81, 220e2a0; fechamento documental posterior próprio. Retomada explicitamente solicitada pelo responsável em 2026-11-02, preservando a continuidade anteriormente autorizada.

##### Primary Changes

Classificação PRIMARY: TASKS.md; apps/mobile/src/features/catalog/{Catalog.tsx,Edition.tsx,Filters.tsx,Controls.tsx,Audio.tsx,client.ts,styles.ts}; apps/mobile/{package.json,app.json} e package-lock.json somente áudio/adaptador compatíveis e configuração declarada; tests/e2e/catalog-mobile/{catalog.spec.ts,client.test.ts,entry.tsx,fixtures.ts,playwright.config.ts,preview.html,check-native-config.mjs,README.md}; tests/e2e/account/harness.mjs somente o configurador opcional já explicitado antes da edição.

Busca pública, filtros combinados por artista de edição/faixa, gênero, década da edição, preço, conservação e disponibilidade; paginação e retorno ao resultado preservados. Detalhe agrupa novos/usados individuais com preço, foto própria, particularidades e conservações separadas. Metadados ausentes continuam explícitos; seleção não reserva e esgotado não pode ser selecionado. Cliente HTTPS exato, sem cookies/tokens nas leituras públicas, parâmetros permitidos explícitos e caminhos de mídia pública restritos. Estados de carregamento/erro/lista vazia e cancelamento de respostas antigas. Componentes têm rótulos, papéis, estados acessíveis e allowFontScaling; opções pesquisáveis em modal, sem administração mobile. Prévia opcional por faixa usando expo-audio 57.0.5, controles explícitos, liberação ao desmontar, pausa ao sair do primeiro plano e falha isolada. SDK 57 mantido, microfone/gravação/background desabilitados.

Revisão React aplicada: efeitos com limpeza, requisições independentes em paralelo, dados derivados sem estado duplicado, seleção por identificadores e player montado somente por ação explícita. Adaptador web é de teste, sem adicionar web às plataformas entregues. CSP com nonce aleatório somente no preview; sem unsafe-inline global, bypass de TLS ou mudança de autenticação.

##### Incidental Changes

| Arquivo/Componente | Alteração | Justificativa |
| --- | --- | --- |
| apps/mobile/src/navigation/App.tsx | registro da tela pública catalog e link Explorar discos, com origem configurada | entrada mínima para alcançar o catálogo sem depender da restauração de sessão; fluxo de contas preservado |

A alteração satisfaz os nove critérios: necessária, causal, mínima, sem função independente, regra de negócio, mudança arquitetural, quebra de contrato, alteração de autenticação/proteção de dados ou Forbidden Change. Dependências/permissões/CSP são PRIMARY previamente registrados, não incidentais.

##### Tests Executed

Ubuntu WSL2, Node 24.22.1/npm 11.19.1/PostgreSQL 17, clone nativo de validação com HEAD 1a1bd81 conferido. O commit posterior 220e2a0 acrescenta somente instruções reproduzíveis. npm ci com scripts normais PASS (828 pacotes instalados); guards de versão e hashes oficiais/mitigados executados. npm run build, npm run typecheck, npm run lint e npm test PASS: 73 unitários, 16 arquivos. npm run audit:toolchain PASS na política estrita vigente; auditoria bruta permanece FAIL/exit 1, sete low conhecidos de deepmerge, zero moderate/high/critical, sem novos achados ou alegação de auditoria limpa. Regressões de prototype pollution/assinaturas/schema/compatibilidade PASS.

check-native-config.mjs PASS na configuração efetiva Android e iOS: SDK 57, sem microfone/serviço de áudio background/UIBackgroundModes audio. Expo export Android PASS (603 módulos), iOS PASS (605); bundles JavaScript/Hermes, não APK/IPA. Expo export:embed do preview compartilhado PASS (239 módulos). Playwright catalog-mobile 3/3 PASS, catalog-web 3/3 PASS, account 7/7 PASS e inventory 2/2 PASS. Firefox real com CA isolada confiada, ignoreHTTPSErrors=false; APIs, PostgreSQL e provedor HTTPS de áudio sintético reais. Semântica, filtros que devem corresponder à mesma oferta, décadas, vazio, usados esgotados, áudio carregado/falho, retorno/paginação e largura 390 px com ampliação simulada conferidos. Screenshot narrow-large-text.png inspecionado visualmente. Provedor e harness encerrados pelos testes; schemas de garimpo_test preservados, sem reset/drop/truncate da base original.

Falhas intermediárias preservadas: transporte fetch sem receiver global no adaptador (corrigido com bind e regressão própria); tipo de fixture rejeitado pelo lint (corrigido sem relaxar regra); seletor ambíguo durante fechamento de modal (agora limitado ao diálogo correto e aguardando fechamento). Retomada inicial resume-check.log teve tipos/lint/73 unitários PASS, mas E2E falhou por PostgreSQL desligado após a pausa; cluster existente reconhecido e iniciado em loopback, sem recriar bases/senhas/dados. IN_PROGRESS → FAILED → IN_PROGRESS para cada correção/retomada; nenhuma execução falha contada como PASS. Reexecução completa posterior clean-validation.log terminou exit 0, todas as suítes acima PASS.

Evidências locais: test-results/catalog-mobile/{dependency-install,first-check-02,component-check,component-check-02,component-check-03,resume-check,clean-validation}.log e narrow-large-text.png. Nenhum Android/iOS físico, fonte ampliada pelo sistema, TalkBack/VoiceOver ou som audível alegado; a recusa de TalkBack do responsável continua respeitada. Estas verificações nativas/humanas permanecem explícitas para aceitação integral TASK-033, sem substituir resultados pelos do adaptador. O suporte de semântica/ampliação está implementado e validado no recorte de componentes desta TASK.

##### Quality Gates

Build PASS (web/API/contratos, tipos e exports Android/iOS); Lint PASS; Unit Tests PASS (73); Integration Tests PASS (composição real componente/API/PostgreSQL, 70 integrações backend acumuladas da TASK-009 ainda aplicáveis, sem edição de backend/schema nesta TASK); API Tests PASS via composição E2E; Security PASS no escopo e política restrita vigente, auditoria bruta FAIL explicitada; Acceptance Criteria PASS no incremento de componentes, com limitações nativas acima; Regression Tests PASS (15 E2E e unitários). Sem regressão conhecida. Gates 01–08 aplicáveis satisfeitos.

##### Scope Validation e Definition of Done

Allowed Changes PASS com precisões PRIMARY registradas antes da edição; Incidental Changes PASS (único arquivo da tabela); Forbidden Changes PASS; Scope Creep NONE. Sem migrations/backend/administrador mobile/carrinho/reserva ou nova integração de produção; ZIP alheio preservado. Definition of Done PASS. Total acumulado 158 casos distintos PASS = 73 unitários + 70 integrações + 15 E2E, sem contar repetições. Contagem 11/37 DONE. Next Eligible TASK: TASK-012, candidata com dependências TASK-008/009/010/011 concluídas; permanece BLOCKED até sua própria DoR, contratos/Scope Guard/ADRs revalidados. Continuidade autorizada, sem saltar o checkpoint de fase.

### TASK-012 Implementar desejos e alertas de disponibilidade

#### Status

DONE

#### Phase

PHASE-02

#### Priority

HIGH

#### Objetivo

Entregar desejos por edição e alertas NEW/USED/ANY, com evento de disponibilidade e entrega pelo adaptador de teste.

#### Dependências

DEPENDS_ON: TASK-008, TASK-009, TASK-010, TASK-011

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-007, RF-008, RF-024; RN-003, RN-024, RN-032, RN-033, RN-037, RN-042; RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; UC-007, UC-008, UC-024. ADRs: ADR-001, ADR-004, ADR-005.

#### Artefatos esperados

Entregar desejos por edição e alertas NEW/USED/ANY, com evento de disponibilidade e entrega pelo adaptador de teste. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/api/src/modules/engagement/**
- apps/api/src/modules/messaging/availability*
- apps/api/prisma/** somente desejos/alertas
- packages/contracts/engagement/**
- apps/web/src/features/engagement/**
- apps/mobile/src/features/engagement/**
- tests/engagement/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Não reservar ao notificar; todos compatíveis; falha mantém inscrição; sucesso encerra; repetição não duplica mensagem.

#### Testes necessários

TEST-007, TEST-008, TEST-024. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

#### Início e DoR

2026-11-02, branch real feature/TASK-012-desejos-alertas, base 5968540. Responsável renovou execução contínua até pelo menos 75% (28/37), sem permissões rotineiras. Dependências 008–011 DONE, 158 casos acumulados válidos; tipos/build/lint/segurança e regressões pertinentes passaram na 011. ADR-001/004/005 ACCEPTED; AGENTS/conciliação, README/regras/pendências, TASK/Scope Guard, contratos/API/testes, persistência/mensagens/autorização e suas suítes relidos. DoR PASS; BLOCKED → READY → IN_PROGRESS. Nenhuma aprovação acadêmica/nativa presumida.

PRIMARY nos caminhos previstos; contracts usa packages/contracts/src/engagement/** conforme estrutura existente. Precisões PRIMARY sob delegação explícita, registradas antes da edição: catalog/service.ts e inventory/service.ts somente captura transacional antes/depois de disponibilidade e evento de retorno; accounts/router.ts somente registro das novas rotas com helpers de sessão/CSRF existentes e PUT no OPTIONS; messaging/worker.ts somente impedir que o worker de acesso consuma mensagens do novo tipo; messaging/run-worker.ts somente compor o consumer de disponibilidade e seu emissor local. Não tratar autorização/roteamento de mensagens como incidental. Schema permite WishlistEntry, AvailabilityAlert e FK opcional única de DemoMessage para ativação do alerta, relações inversas e índices correspondentes; nenhum outro modelo comercial. docs/architecture/api.md somente wire/paginação/erros destes endpoints. Incidental previsto: exports, comandos/runner de testes e navegação mínima web/mobile; sujeito aos nove critérios.

Plano: desejo único user/edition, independente do alerta, ambos autenticados CUSTOMER. Ativações de alerta com IDs históricos permanentes, condição NEW/USED/ANY, unicidade parcial só ACTIVE. Evento durável de transição indisponível → disponível por condição, capturado no mesmo commit do saldo/publicação, sob lock da edição; não executar serviço externo na transação. Consumidor dedicado prepara uma mensagem por ativação, conteúdo protegido pelo mecanismo existente. Entrega local confirma mensagem e fecha alerta atomicamente; falha preserva inscrição, retry sem duplicação; cancelamento próprio impede entrega pendente. Inscrições posteriores ao evento não recebem reposição antiga. Disponibilidade nesta fase segue ofertas públicas ativas/saldo físico do catálogo; integração com reservas/liberações comerciais continua explicitamente TASK-023, sem fabricar reservas anteriores. API paginada page/pageSize (20/100), IDs próprios e dados de edição sem campos administrativos. Interfaces mantêm desejos e alertas separados e explicam ausência de reserva. Sem cobrança, reserva, e-mail externo, permissões nativas ou dependências novas.

Validação intermediária: 20514cd build/tipos/lint PASS; bc48f51 tipos/lint e sete integrações de desejos/alertas PASS. d3c1dc5: build/tipos/lint, 73 unitários e 70 integrações anteriores PASS; novos casos 10/11 PASS. Corrida real revelou violação da unicidade parcial corretamente impedindo segunda ativação, mas erro Prisma P2002 não mapeado ao 409 do contrato. IN_PROGRESS → FAILED → IN_PROGRESS para mapear somente esse conflito na inscrição, preservando constraint, teste e custo/transação. Log test-results/engagement/full-check.log preservado. Incidental mínimo adicional: messaging/service.ts apenas o tipo do conteúdo decodificado passa a contemplar a variante de disponibilidade, sem inventar expiração de token numa mensagem comercial e sem mudar descriptografia/autorização. Novo tipo pertence ao contrato engagement. Revalidação dirigida pendente; nenhum DONE antecipado.

Precisão PRIMARY adicional sob a delegação contínua: a prova real de entrada em Node strip-only falhou com ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX no novo Engagement; a cadeia importada também contém parameter properties anteriores em catalog/service.ts, catalog/errors.ts e inventory/service.ts. Evidência antes: test-results/engagement/source-entry-before.log. A causa não é resolvida por tsc/Vitest, que transformam essa sintaxe. Decisão técnica: converter somente os quatro construtores para declarações de campo/atribuições explícitas equivalentes, sem mudar flags, dependências, guardas, custos, contratos ou negócio. Não classificar correção transitiva pré-existente como incidental. Nova regressão em tests/engagement deve iniciar os processos reais source e dist, conferir health e rejeição HTTPS de rota protegida e encerrar só seus processos. IN_PROGRESS → FAILED → IN_PROGRESS, sem DONE até esse gate passar; 12 integrações e 17 E2E anteriores preservados como evidência dos recortes já validados. Correções de seletor/rótulo web preservadas nos logs final-check/retest/ui-retest.

#### TASK Execution Report

TASK: TASK-012. Status: DONE (IN_PROGRESS → IN_REVIEW → DONE após correções/gates). Branch real feature/TASK-012-desejos-alertas, base 5968540. Commits reais f63f2b8, 20514cd, bc48f51, d3c1dc5, 45a0ad3, e203e33, f45772b, 9cc7038, fce2eff; fechamento documental posterior próprio. Continuidade até 28/37 explicitamente renovada pelo responsável.

##### Primary Changes

PRIMARY: TASKS.md; prisma/schema.prisma e migrations/202611020002_engagement/migration.sql somente WishlistEntry/AvailabilityAlert, enums, relações inversas, vínculo opcional de DemoMessage e índices; modules/engagement/**; messaging/availability.ts; accounts/router.ts no registro/PUT; catalog/service.ts e inventory/service.ts nos pontos de captura previamente declarados; messaging/{worker,run-worker}.ts no roteamento/composição dedicados; catalog/errors.ts e os quatro construtores no ajuste estrito de entrada Node declarado; contracts/src/engagement/**; web/features/engagement/**; mobile/features/engagement/**; tests/engagement/**; docs/architecture/api.md somente os endpoints afetados.

Desejo único por cliente/edição e independente de alerta. Ativações NEW/USED/ANY com unicidade parcial ACTIVE e histórico permanente; nova inscrição após envio tem outro ID. Captura transacional de retorno indisponível → disponível por condição, sob lock da edição; público elegível congelado por vínculo ao evento, sem depender de ordenação de timestamps ou incluir inscrições posteriores. Mensagem protegida e deduplicada por ativação. Consumidor próprio não rouba eventos futuros; worker de acesso só entrega ACCESS. Falha de preparação/envio mantém recuperação durável; sucesso confirma mensagem e encerra alerta na mesma transação. Cancelamento impede entrega pendente; conta bloqueada/encerrada/inativa não recebe; destinatário usa e-mail atual da conta no envio local. Nenhuma reserva/prioridade ou e-mail externo. Integração de reservas/liberações comerciais permanece TASK-023, conforme recorte já previsto.

API CUSTOMER em HTTPS com guardas existentes de origem/CSRF/cookie ou bearer; paginação limitada, campos estritos e propriedade no servidor. Interfaces web/mobile para salvar/inscrever separadamente, consultar/remover/cancelar, estados vazios/erro/falha/histórico. Sem administração mobile. Rótulos, semântica e ampliação preservados. Revisão React aplicada: consultas independentes em paralelo, cleanup de leitura antiga, módulos web lazy e estado derivado sem duplicação. Roteiro reproduzível em tests/engagement/README.md. Construtores agora usam campos explícitos equivalentes, compatíveis com o comando Node strip-only ratificado; nenhuma flag/biblioteca/guarda foi relaxada.

##### Incidental Changes

| Arquivo/Componente | Alteração | Justificativa |
| --- | --- | --- |
| packages/contracts/src/index.ts | exportar tipos engagement | expor o contrato do workspace |
| messaging/service.ts | união de tipos do corpo decodificado | aviso comercial não inventa expiração de token; descriptografia/acesso inalterados |
| package.json | test:engagement e verify | incluir o gate novo, sem dependência/lockfile novo |
| tests/core/run-integration.mjs | seleção engagement/schema task012 | reutilizar isolamento e proteção da base original |
| web/navigation/{App.tsx,route.ts} | rota saved/link e lazy | alcançar a nova tela com contexto de cliente existente |
| web/features/catalog/Edition.tsx | encaixe de EngagementActions | ações da edição, sem alterar busca/regra comercial |
| mobile/navigation/App.tsx | tela/link saved e callback para edição | registro mínimo usando o mesmo cliente seguro existente |
| mobile/features/catalog/Catalog.tsx | callback de ações e edição inicial opcional | conectar os recursos e voltar da lista ao detalhe, sem alterar consulta pública |

Os nove arquivos (a linha de navegação web contém dois) satisfazem necessidade/causalidade/minimalidade; são diretamente ligados ao mesmo recurso, sem função independente, regra nova, arquitetura significativa, quebra de contrato, comportamento de autenticação/proteção de dados ou proibição. Configuração de rotas protegidas/worker e correção transitiva de Node são PRIMARY declarados, não incidentais.

##### Tests Executed

Ubuntu WSL2, Node 24.22.1/npm 11.19.1/PostgreSQL 17, clone nativo com fonte conferida por hash. d3c1dc5: build/tipos/lint, 73 unitários e core 9/contas 14/mensagens 16/catálogo 19/estoque 12 integrações PASS; teste novo de corrida revelou P2002, corrigido sem remover constraint/teste. e203e33: build/tipos/lint, 11 integrações novas, auditoria restrita e exports Android (604 módulos)/iOS (606) PASS. f45772b: tipos/lint, 12 integrações PASS, incluindo CLI real npm messages:work em processo Node strip-only e entrega verificada no banco. 9cc7038: build web/tipos/lint, 17 E2E PASS = engagement web+componentes nativos compartilhados 2, catálogo web 3, catálogo mobile compartilhado 3, contas/equipe 7 e administração estoque 2. Firefox real/CA isolada confiada, sem ignoreHTTPSErrors; API/banco/provedor de áudio reais. Capturas web 390 px/200% e nativa compartilhada 390 px inspecionadas visualmente. Não alegar execução física Android/iOS, TalkBack/VoiceOver ou fonte ampliada pelo sistema; estes permanecem para TASK-033.

fce2eff, após falha reproduzida de entrada source: npm run build, npm run typecheck, npm run lint e npm test PASS (75 unitários/17 arquivos); source e dist iniciaram processos reais, responderam health por socket e negaram rota protegida sem HTTPS. Regressões catálogo 19, estoque 12 e engagement 12 PASS; import direto da app em Node strip-only PASS, script exit 0. Apenas construtores equivalentes foram alterados após os 17 E2E; seus fluxos foram reconferidos por integração e regressão real de entrada, sem repetir suítes sem risco novo. Demais 39 integrações anteriores continuam aplicáveis, sem alteração desses módulos. Total acumulado 174 casos distintos PASS = 75 unitários + 82 integrações + 17 E2E, sem contar repetições.

Demonstrações incluem dois clientes e terceiro controlador de locks, unicidade concorrente de desejos/alertas, entrega concorrente única, rollback conjunto saldo/público/outbox, falha real SQL ao preparar mensagem com retry, condição USED após publicação, inscrição tardia com timestamp idêntico, falha de envio/cancelamento/privacidade. Sem reset/drop/truncate/restauração da base original; schemas novos em garimpo_test preservados. Função/trigger de falha existem só no schema isolado do caso e são removidos no finally. Processos/provedores/harness próprios encerrados; PostgreSQL local preservado. ZIP alheio preservado.

Logs locais test-results/engagement/{first-check,second-check,full-check,final-check,retest,ui-retest,source-entry-before,entry-check}.log; capturas web-narrow-large-text.png e native-shared-narrow.png. Falhas de seletor ambíguo e associação do rótulo web corrigidas mantendo asserções estritas/timeout, sem mascarar falhas. Auditoria bruta permanece FAIL/exit 1 com 7 low conhecidos, zero moderate/high/critical; audit:toolchain PASS na política restrita de hashes/mitigação, sem alegação de audit limpo. Sem dependências/patches novos. Warning pg/Prisma preexistente preservado.

##### Quality Gates

Build PASS; Lint PASS; Unit Tests PASS (75); Integration Tests PASS (82 acumulados, incluindo 12 novos); API Tests PASS (TLS/origem/CSRF/bearer/propriedade/contratos e composição real); Security PASS no escopo/política vigente, auditoria bruta FAIL explicitada; Acceptance Criteria PASS; Regression Tests PASS (17 E2E, suites anteriores e processos source/dist). Gates 01–08 aplicáveis satisfeitos.

##### Scope Validation e Definition of Done

Allowed Changes PASS com precisões PRIMARY rastreáveis anteriores à edição; Incidental Changes PASS (tabela); Forbidden Changes PASS; Scope Creep NONE. Sem pedido/pagamento/reserva/pós-venda antecipados, infraestrutura pública ou mensagens externas. Definition of Done PASS. Contagem 12/37 DONE. Next Eligible TASK: TASK-013 candidata, dependências 008/010/011 DONE; sua própria DoR/porta de compra/Scope Guard será revalidada antes da promoção. Continuidade explicitamente autorizada até 28/37, respeitando checkpoints.

### TASK-013 Implementar avaliações e moderação

#### Status

DONE

#### Phase

PHASE-02

#### Priority

MEDIUM

#### Objetivo

Criar review por cliente/edição/pedido e histórico de versões, publicação imediata e moderação ADMIN/OPERATOR. Porta de compra entregue conectada em TASK-023; pós-venda em TASK-026.

#### Dependências

DEPENDS_ON: TASK-008, TASK-010, TASK-011

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-009, RF-022; RN-001, RN-025, RN-032; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; UC-009, UC-022. ADRs: ADR-001.

#### Artefatos esperados

Criar review por cliente/edição/pedido e histórico de versões, publicação imediata e moderação ADMIN/OPERATOR. Porta de compra entregue conectada em TASK-023; pós-venda em TASK-026. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/api/src/modules/reviews/**
- apps/api/prisma/** somente avaliações
- packages/contracts/reviews/**
- apps/web/src/features/reviews/**
- apps/mobile/src/features/reviews/**
- apps/web/src/features/admin/reviews/**
- tests/reviews/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/prisma/** somente ReviewRevision e chave user/edition/order lógica até integrar pedidos

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Sem adaptador de compra o runtime nega publicação, stub só em teste. Editar ocultada mantém oculta aguardando análise; chave inclui pedido. Não antecipar pedido/pós-venda.

#### Testes necessários

TEST-009, TEST-022. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

#### Início e DoR

2026-11-02, branch real feature/TASK-013-avaliacoes-moderacao, base d96e312. Continuidade até 28/37 explicitamente autorizada. Dependências 008/010/011 DONE e 174 casos acumulados válidos; ADR-001 ACCEPTED, PD-006 resolvida (estrelas inteiras 1–5). AGENTS/conciliação, README/regras/pendências, TASKS/Scope Guard, ADR/API/testes e código/suítes relacionados relidos. DoR PASS; BLOCKED → READY → IN_PROGRESS. A porta de compra é parte explícita deste incremento; a ausência do adaptador real até TASK-023 exige negar publicação, não antecipar pedidos nem usar mock no runtime.

PRIMARY nos caminhos previstos; contracts usa src/reviews/** conforme estrutura compilada. Precisão PRIMARY antes da edição sob delegação: apps/api/src/app.ts somente registro do router protegido/público e opção explícita de porta; docs/architecture/api.md somente wire/versão/erros/listagem própria necessários à edição. Schema somente Review, ReviewRevision, enums e relações inversas User/Edition; orderId UUID lógico sem criar tabela Order. Sem dependência/SDK/infraestrutura nova. Incidental previsto: exports, runner/comando dos testes, navegação da equipe e encaixe das seções públicas web/mobile, todos mínimos e sujeitos aos nove critérios.

Plano: unicidade user/edition/order; rating 1–5 e comentário texto até 4000 caracteres (limite técnico adotado sob delegação, sem atribuir ao PDF). Criação/edição/verificação de liberação na mesma transação da porta de elegibilidade; porta padrão selada UNAVAILABLE, sem configuração HTTP/env para liberar fake. Porta deve ler no tx recebido e confirmar entrega/unidades mantidas; quantidade inválida/estado desconhecido nega operação. Fixtures somente em testes. Publicação inicial imediata quando elegível; edição oculta continua HIDDEN/awaitingModeration até liberação explícita ADMIN/OPERATOR da revisão atual. Versão otimista e lock de review, histórico imutável de cada criação/edição/moderação com autor/motivo, auditoria na mesma transação. Devolução automática/conexão de pedido permanecem 026/023. Lista pública só visíveis, média sem ocultas e sem e-mail/dados de compra; cliente lista/edita próprias; equipe modera pela web. Composer recebe contexto de compra do chamador, pronto para o fluxo de pedidos posterior; não pedir UUID técnico ao cliente nem inventar compra elegível. Regressões reais de concorrência/SQL/autorização/interfaces e entrada Node source/dist antes de DONE.

Precisão PRIMARY de validação antes da edição: tests/e2e/account/harness.mjs aceita somente uma porta de compras fornecida por código da fixture ao criar a app isolada, preservando o default UNAVAILABLE e sem chave HTTP/env. É necessário verificar os componentes reais com API/banco e fixture de compra permitida explicitamente pela TASK; não conta como integração real com pedidos. Preview web Vite e nativo Expo ficam exclusivamente em tests/reviews e dist ignorado; composição mantém CA confiada/TLS/CSP, sem bypass. Incidental adicional mínimo tests/catalog/http.ts: quarto argumento opcional de app para a mesma porta em testes de API, defaults antigos intactos.

Validações intermediárias: 14a6cec build/tipos/lint e 75 unitários PASS; 53cce57 build/tipos/lint e 11 integrações de avaliações PASS, incluindo concorrência forçada e falha SQL real. Nova suíte de navegador inicialmente falhou por orçamento global de 60s: um caso durante login e outro ainda no setup de page/Firefox, antes de atingir avaliações; terceiro sem alcançar formulário. Logs browser-check-02 preservados, screenshot inspecionado. Diagnóstico da base de teste sem transação bloqueadora; comandos anteriores de compilação também ficaram lentos. Uma execução longa de tsc foi interrompida para diagnóstico e não conta como PASS; rodada posterior completa de tipos/lint passou sem relaxar flags. Decisão de teste rastreável: orçamento global dos três cenários novos passa a 180s, incluindo preparo por API, CA/Firefox e múltiplos logins scrypt/trocas de ator; asserções continuam em 10s, custos criptográficos e regras intactos. Não é SLA de produto nem aprovação de desempenho; demais suítes mantêm seus limites. IN_PROGRESS → FAILED → IN_PROGRESS para essa revalidação. Incidental Controls.tsx: parâmetro clearable opcional com default anterior, apenas para não oferecer Todos numa nota obrigatória 1–5; comportamento de filtros preservado. Nenhum DONE antecipado.

Revalidação b02e32d: os dois E2E web passaram; o nativo encontrou corrida de montagem do composer enquanto a consulta privada inicial ainda estava pendente. Screenshot native-note-failure.png mostrou formulário recomposto/modal fechado, não falha de backend. Correção PRIMARY d1e1b2a: só montar composer após mine conhecido e usar chave estável da compra; erro da consulta não libera formulário novo. Native-retest com seleção real de nota, publicação bearer e edição após ocultação PASS. Regressão adicional segura pausa somente a primeira requisição privada e depois a continua ao servidor real, comprovando ausência de composer durante a consulta e manutenção das demais asserções; nenhuma resposta/compra/API é simulada além da porta de teste já permitida. Revalidação completa pendente antes de DONE.

#### TASK Execution Report

TASK: TASK-013. Status: DONE (IN_PROGRESS → IN_REVIEW → DONE após correções e revisão final). Branch real feature/TASK-013-avaliacoes-moderacao, base d96e312. Commits reais: 0832de4, 14a6cec, 53cce57, 69c31dc, fdf5be7, bc69abb, b02e32d, d1e1b2a, f120c55, 97676e6; fechamento documental posterior próprio. Continuidade autorizada até pelo menos 28/37.

##### Primary Changes

PRIMARY: TASKS.md; prisma/schema.prisma e migrations/202611020003_reviews/migration.sql somente Review/ReviewRevision/ReviewVisibility, relações inversas e índices; modules/reviews/{errors,purchases,router,service}.ts; app.ts somente composição/porta explícita; contracts/src/reviews/**; web/features/reviews/**; web/features/admin/reviews/**; mobile/features/reviews/**; tests/reviews/**; tests/e2e/account/harness.mjs somente opção de porta em código da fixture; docs/architecture/api.md somente contratos afetados.

Publicação por cliente/edição/pedido entregue com unidade mantida, chave única, nota inteira 1–5 e comentário texto. Porta padrão selada UNAVAILABLE nega criação/edição/liberação quando não comprova a compra; sem chave HTTP/env para selecionar fixture. Não existe tabela/pedido fictício em runtime. Adaptador real permanece TASK-023, ocultação automática por pós-venda TASK-026, conforme divisão expressa do backlog. Histórico de cada criação/edição/moderação é imutável também por trigger PostgreSQL e atômico com conteúdo/auditoria. Revisão otimista e lock impedem edição/liberação de revisão antiga. ADMIN/OPERATOR moderam pela web; edição pelo autor de conteúdo HIDDEN mantém ocultação e marca análise pendente. Retenção zero/compra não entregue impede novo conteúdo/liberação.

Consulta pública exclui ocultas da lista/média e omite compra, e-mail, IDs de conta e histórico; usa somente primeiro nome. Privados só do titular; equipe tem histórico autorizado. Interfaces de consulta/edição e composer com contexto da compra preparado para o fluxo de pedidos posterior, sem pedir UUID ao cliente. Composer só monta após consulta privada conhecida, com chave estável da compra; erro não libera criação. Rótulos/estados/ampliação, texto sem HTML, paginação/erros/estado vazio e resumo localizado. Revisão React aplicada: limpeza de respostas antigas, leitura pública independente da privada, estado derivado e carregamento lazy da moderação.

##### Incidental Changes

| Arquivo/Componente | Alteração | Justificativa |
| --- | --- | --- |
| packages/contracts/src/index.ts | exportar tipos reviews | contrato do workspace |
| package.json | test:reviews e verify | incluir gate novo, sem dependências |
| tests/core/run-integration.mjs | suite/schema task013 | preservar isolamento da base original |
| tests/catalog/http.ts | opção adicional de composição de review em fixture | reutilizar API HTTPS/certificado real; defaults anteriores intactos |
| web/navigation/{App.tsx,route.ts} | rota/link e lazy da moderação | alcance mínimo em contexto de equipe existente |
| web/features/catalog/Edition.tsx | encaixe ReviewSection | integrar seção pública nova sem alterar busca/ofertas |
| mobile/navigation/App.tsx | seção de avaliações no callback do catálogo | integração mínima usando o cliente seguro existente |
| mobile/features/catalog/Controls.tsx | clearable opcional, default anterior | nota obrigatória não oferece Todos; filtros mantêm comportamento |

Nove arquivos: a linha de navegação web contém dois. Necessários, causais e mínimos, todos ligados ao mesmo recurso, sem função independente/regra nova/arquitetura/quebra de contrato ou alteração de autenticação/proteção de dados, nem proibição. Novo router protegido e porta de fixture são PRIMARY declarados antes da edição. Sem refatoração geral.

##### Tests Executed

Ubuntu WSL2, Node 24.22.1/npm 11.19.1/PostgreSQL 17, clone nativo com hashes conferidos. f120c55: npm run verify aprovou build/tipos/lint, 75 unitários (incluindo processos reais source/dist com HTTPS obrigatório), core 9, contas 14 e mensagens 16 integrações; catálogo teve falha de certificado recém-emitido ainda não válido, não contabilizada como PASS. Datas do certificado e relógios Windows/WSL/Node foram conferidos, alinhados; nenhuma dispensa de TLS/backdating/custo alterada. Retomada sem alteração desse código: test:catalog 19/19 PASS, CA confiada normalmente. Causa transitória exata não comprovada, falha preservada em final-check.log.

resume-final em f120c55: inventory 12, engagement 12 e reviews 11 integrações PASS; audit:toolchain PASS na política estrita vigente; exports Android 605 módulos/iOS 607 PASS, somente bundles JavaScript/Hermes, sem APK/IPA ou dispositivo alegado. Vite/Metro prepararam os mesmos componentes para o ambiente isolado; 20 E2E PASS = reviews 3, engagement 2, catálogo web 3/mobile compartilhado 3, contas/equipe 7, estoque administrativo 2, script exit 0. Certificados confiados na CA isolada, ignoreHTTPSErrors=false, bancos/APIs reais; somente a porta de compra é fixture permitida pela própria TASK.

Foram demonstrados: negativa padrão do runtime e snapshots inválidos, compra não entregue/devolvida integral, parcial mantida, uma avaliação por pedido independentemente de unidades/troca, cliente alheio bloqueado, ADMIN/OPERATOR autorizados e mobile sem administração, dados privados omitidos e média sem ocultas, corrente de quatro revisões, SQL recusando mutação/exclusão do histórico, falha SQL revertendo o conteúdo, criação concorrente única e duas edições realmente sobrepostas por terceiro lock com um vencedor. Browser verifica comentário como texto sem criar tag/evento, revisão imediata, ocultação/edição/liberação explícita e bearer de cliente separado de cookie staff. Primeira consulta privada foi pausada e continuada ao servidor real, sem substituir resposta, para comprovar que o composer não aparece prematuramente nem perde o modal de nota.

97676e6 alterou somente texto de resumo e fidelidade do preview: build web, tipos web/mobile, lint dirigido, exports Android/iOS e os três E2E de avaliações PASS novamente. Screenshot web com CSS global real/390 px/200% e nativo compartilhado/390 px inspecionados visualmente; nenhuma rolagem horizontal/clipping constatada. Sem execução física Android/iOS, TalkBack/VoiceOver, fonte do sistema ou integração real de compra/pós-venda inferida. Aceitação integral permanece TASK-033.

Evidências locais test-results/reviews/{first-check,integration-check,browser-check-02,browser-retest,native-retest,final-check,catalog-recheck,resume-final,visual-check}.log e capturas web-narrow-final.png/native-shared-narrow.png; falhas e interrupção do diagnóstico de tipos preservadas, não aprovadas. Cenários novos usam preparação separada/bounded e orçamento de 180s para fluxo multiator; asserções 10s/custos/guardas intactos, sem SLA de desempenho inventado. Somente schemas novos garimpo_test, sem reset/drop/truncate/restauração sobre base original. Função/trigger de falha existem só no schema isolado e são retirados no finally; trigger real de imutabilidade permanece. Processos/harness próprios encerrados, PostgreSQL e ZIP alheio preservados. Dependências/lock/patches inalterados; auditoria bruta FAIL/exit 1 com 7 low conhecidos de deepmerge, zero moderate/high/critical; mitigação exata e regressões PASS, sem alegação de audit limpo. Warning pg/Prisma preexistente preservado.

##### Quality Gates

Build PASS; Lint PASS; Unit Tests PASS (75); Integration Tests PASS (93 acumulados = 82 anteriores + 11 novos); API Tests PASS (contratos, fronteiras e autorização reais); Security PASS no escopo/política de mitigação vigente, auditoria bruta FAIL explícita; Acceptance Criteria PASS no incremento com porta real futura expressa; Regression Tests PASS (20 E2E e suítes acumuladas). Gates 01–08 aplicáveis satisfeitos. Total 188 casos distintos PASS, sem contar repetições.

##### Scope Validation e Definition of Done

Allowed Changes PASS com precisões PRIMARY rastreáveis; Incidental Changes PASS (tabela); Forbidden Changes PASS; Scope Creep NONE. Sem pedido, pós-venda, cobrança, servidor público ou teste humano fictícios. Definition of Done PASS. Contagem 13/37 DONE. Next Eligible TASK: TASK-014 candidata com TASK-009 DONE e PD-006 resolvida; DoR/contratos monetários/Scope Guard próprios antes da promoção. Continuidade autorizada até 28/37, sem saltar checkpoints.

### TASK-014 Implementar administração de cupons e promoções

#### Status

DONE

#### Phase

PHASE-02

#### Priority

HIGH

#### Objetivo

Criar gestão ADMIN, promoções de menor preço e cupom com alvos e acumulação configurável.

#### Dependências

DEPENDS_ON: TASK-009

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-019; RN-008, RN-016, RN-017, RN-018, RN-032; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; UC-019. ADRs: ADR-001, ADR-004.

#### Artefatos esperados

Criar gestão ADMIN, promoções de menor preço e cupom com alvos e acumulação configurável. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/api/src/modules/pricing/**
- apps/api/prisma/** somente cupons/promoções
- packages/contracts/pricing/**
- apps/web/src/features/admin/pricing/**
- tests/pricing/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/prisma/** somente CouponTarget e allowPromotional

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Mínimo só elegíveis após promoção; sem frete; fixo limitado. Tipos de promoção/escala pendentes resolvidos antes do trecho dependente. Ledger de uso integrado no checkout em TASK-016/018.

#### Testes necessários

TEST-019. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

#### Início e DoR

2026-11-02, branch real feature/TASK-014-cupons-promocoes, base 63d0dc9. Continuidade até 28/37 renovada. TASK-009 DONE com artefatos válidos; 188 casos/gates acumulados atuais PASS, sem regressão conhecida. ADR-001/004 ACCEPTED; PD-006 resolvida para percentual/fixo. AGENTS/conciliação, README/regras/pendências, TASK/Scope Guard, ADR/API/modelo/testes, catálogo/estoque/contas/interfaces e suas suítes relidos; orientações de PostgreSQL/React aplicadas. DoR PASS; BLOCKED → READY → IN_PROGRESS.

PRIMARY nos caminhos previstos; contracts usa src/pricing/**. Precisões PRIMARY antes da edição sob delegação: app.ts somente registro do router ADMIN; docs/architecture/{api,parametros}.md somente wire e parâmetros monetários deste módulo; catalog/service.ts e novo catalog/public-pricing.ts somente integrar preço promocional efetivo na consulta pública e em seus filtros, sem mudar listagem/preço-base administrativo, busca por artistas/faixas, publicação/estoque ou regras comerciais futuras. Filtrar preço-base e depois trocar apenas o texto seria incorreto; consulta paginada deve aplicar o mesmo cálculo no servidor, na mesma oferta, preservando regressões. Não tratar alteração de preço/autoridade como incidental. Schema somente Coupon/CouponTarget/Promotion/PromotionOffer, enum e relações inversas; sem CouponUsage/checkout/pedido nesta tarefa.

Decisões técnicas sob delegação, documentadas antes do código, não atribuídas ao PDF: percentual em basis points inteiros (100 = 1%, 1–10000); FIXED em centavos; desconto percentual trunca a fração de centavo com BigInt, preço nunca negativo, menor promoção vence e empate usa ID estável. Cupom calculado no subtotal elegível pós-promoção, sem argumento de frete; rateio por maiores restos/ID estável conforme ADR-004. Alvos tipados exclusivos OFFER/EDITION/GENRE combinam por união (qualquer alvo corresponde); vazio cobre todas as ofertas. Política de combinação explicitada conforme pendência técnica do modelo, sem reinterpretar respostas do PDF. Código normalizado para maiúsculas, único; validação de períodos [startsAt,endsAt), versões e payloads estritos. Limites de uso são cadastrados, mas uso/reserva real somente 016/018; não exibir contadores fictícios como zero.

Incidental previsto: exports, comandos/runner de teste, relação de router/fixtures mínima e navegação ADMIN, sujeitos aos nove critérios. Painel não expõe UUID para digitação: seletores por nomes/condição/referência de estoque. Sem SDK/dependência nova, conta OPERATOR configurando desconto, uso de cupom/reserva antecipado ou cobrança real. Critérios de moeda e fronteiras de permissão, períodos/sobreposição/estorno de centavos, catálogo público com promoção e filtros coerentes, rollback e versão concorrente serão demonstrados em testes reais antes de DONE.

Precisão PRIMARY do registro antes da edição: reutilizar catalog/router.ts, já responsável pela fronteira web da equipe e pelo módulo inventory, para incluir somente /admin/coupons e /admin/promotions, uma guarda ADMIN antes do parser e registro de pricing/router.ts. Assim preservam-se os mesmos HTTPS/origem/cookie/CSRF e a revalidação transacional própria; app.ts não precisa de alteração nem novo pool/router de autenticação duplicado. A expansão de caminhos/autoridade é PRIMARY explícita sob delegação, não incidental. OPERATOR é negado antes de interpretar o corpo desses endpoints, inclusive se inválido.

Validação em andamento, sem DoD antecipada: IN_PROGRESS → FAILED no primeiro typecheck (TS2379, propriedade opcional active incompatível com exactOptionalPropertyTypes). Corrigido apenas o tipo de entrada de period(), sem desativar flags; FAILED → IN_PROGRESS, build/typecheck/lint PASS em 2543b33. Em 2c7179a: 88 unitários PASS, integração de descontos 11/12 PASS; FAILED por ausência de evidência de sobreposição no observador pg_stat_activity. O observador mantinha BEGIN para segurar a linha e precisava renovar o snapshot de estatísticas a cada consulta. Correção de teste 754165c adiciona pg_stat_clear_snapshot e exige dois application_name distintos ativos aguardando lock; não substitui concorrência por mock nem relaxa o resultado esperado. FAILED → IN_PROGRESS para repetir os gates relevantes. Logs locais ignorados first-check.log, second-check.log, integration-check.log e targeted.log em test-results/pricing; schemas garimpo_test retidos, base original intacta.

#### TASK Execution Report — encerramento 2026-11-02

TASK: TASK-014. Status: DONE. Branch real: feature/TASK-014-cupons-promocoes. Base 63d0dc9; commits edc056e, 956e7fe, c0cf1c9, 2543b33, 2c7179a, 1cbff33, 754165c, 3741884, 6f4dd97 e b0f8c69. Fechamento documental no log real, sem antecipar hash. Após correções e revisão: IN_PROGRESS → IN_REVIEW → DONE.

Primary Changes:

- Prisma schema e migration 202611020004_pricing: Coupon/CouponTarget/Promotion/PromotionOffer, alvos exclusivos, unicidade, FKs/indexes, checagens monetárias/período/limites/versão; relações inversas apenas pertinentes.
- modules/pricing/**, contracts/src/pricing/**: configuração ADMIN, validação estrita, código normalizado/imutável, seleção por nomes, atualização versionada com lock, auditoria atômica e cálculo exato BigInt/rateio determinístico. Ledger explicitamente ausente até 016/018; nenhuma reserva, pedido ou consumo simulado no runtime.
- catalog/{router,service,public-pricing}.ts: guarda ADMIN anterior ao parser nos caminhos novos e promoção efetiva em detalhe/filtros públicos, paginação SQL com valores vinculados e combinação na mesma oferta; preço-base administrativo preservado.
- admin/pricing/{Pricing.tsx,Picker.tsx,pricing.css}: cadastros, filtros/paginação, edição, alvos humanos, permissões, erros e ampliação. Sem digitação de UUID, contador de uso fictício ou administração mobile.
- docs/architecture/{parametros,api}.md, tests/pricing/** e este registro: contratos, decisões delegadas e testes de cálculo/API/SQL/concorrência/rollback/UI.

Incidental Changes:

| Arquivo/Componente | Alteração | Justificativa |
| --- | --- | --- |
| apps/web/src/navigation/App.tsx | Import lazy, link e composição ADMIN do painel | Registro mínimo da tela nova; autorização permanece revalidada no backend PRIMARY, sem nova política incidental |
| apps/web/src/navigation/route.ts | Reconhecer pricing-admin | Necessário para alcançar a tela nova, sem alterar rotas existentes |
| packages/contracts/src/index.ts | Exportar somente os novos tipos | Disponibilizar o contrato do próprio módulo, sem quebrar existentes |
| package.json | Comando test:pricing e sua inclusão em verify | Tornar executável o gate específico; nenhuma dependência/lockfile alterados |
| tests/core/run-integration.mjs | Seletor pricing e prefixo isolado task014 | Reutilizar runner/migrations/proteção garimpo_test sem modificar suites anteriores |

Todos passam nos nove critérios: necessidade/causalidade direta, mínima extensão, sem funcionalidade independente, regra comercial, arquitetura, contrato incompatível ou mudança de proteção; nada em Forbidden Changes. Mudanças de autoridade/preço foram PRIMARY expressamente registradas antes da edição, não classificadas como incidentais.

Tests Executed: checkout Linux nativo do mesmo Git, Node 24.22.1/npm 11.19.1/PostgreSQL 17, ambiente protegido, somente schemas novos em garimpo_test. Em 2c7179a: build/typecheck/lint e npm test PASS (88 casos, incluindo fonte Node strip-only e API compilada reais, hashes/assinaturas/protótipo/schema). Em 754165c: build/typecheck/lint PASS; test:pricing 12/12 e test:catalog 19/19 PASS. Nenhuma produção mudou depois disso; b0f8c69 só corrige sincronização do teste, tipos dos testes e lint também PASS.

Em b0f8c69: UI pricing 2/2 PASS com Firefox/HTTPS confiável/API/DB reais; inventário 12/12, engagement 12/12, reviews 11/11 PASS; catálogo web 3/3, catálogo mobile compartilhado RNW 3/3, engagement 2/2 e reviews 3/3 PASS. UI prova edição/recarregamento, alvos por nomes, limites configurados, código preservado, cliente sem painel e promoção percentual/fixa sobreposta com preço público R$ 49,90 e filtros coerentes. RNW não é execução Android/iOS nem leitor de tela. Novos workflows limitados a 180s para preparo/caso e 10s por expectativa; limites anteriores preservados, sem alegar SLA. Captura pricing-narrow-enlarged.png inspecionada: 390px, texto 200%, foco visível, controles acessíveis e sem transbordamento externo; nomes longos quebram linha. TalkBack recusado, NÃO EXECUTADO; aceitação integral permanece TASK-033.

Schemas retidos: task014_51715fc8d4ec418399a80f2cc291936d, task008_d2806a2573cc463795a481c449ffdc5e, task009_99777099d9b84f7bb19caf517ad4ceaa, task012_4dd36eb450c14b1290a07ee474e334f0 e task013_d062c47ad15547c4a9967b88367051d8. Logs locais ignorados: test-results/pricing/{integration-check,targeted,browser-retest,regression,mobile-preview-retest}.log. Credenciais, perfis, certificados e caixa de mensagens não publicados.

Falhas preservadas além das anteriores: primeiro E2E pricing 1/2 PASS; navegação pública antecipava o término do logout e era sobrescrita pelo redirecionamento correto para login. Captura confirmou a tela; b0f8c69 aguarda o formulário de login antes de navegar, sem mudar runtime/timeout; repetição integral 2/2 PASS. Na regressão RNW, build web havia removido os três bundles de preview ignorados; uma falha, um timeout e terceiro caso interrompido pelo agente via SIGINT no próprio runner, evitando repetir a mesma preparação inválida. Diretório conferido sem bundles; regenerados com expo export:embed e repetidos os três casos mais engagement/reviews, todos PASS. Sem alteração do aplicativo, mock de API, bypass TLS ou teste removido. Estes erros de preparação não recebem PASS nem são apagados.

Quality Gates: Build PASS; Lint PASS; Unit Tests PASS; Integration Tests PASS; API Tests PASS; Security PASS pela política restrita/hash/regressões e negativas ADMIN/OPERATOR/CUSTOMER/CSRF/origem/HTTPS/mobile; npm audit bruto continua FAIL/exit 1, sete low deepmerge, zero moderate/high/critical, aviso preservado. Acceptance Criteria PASS no incremento, ledger futuro explicitamente separado; Regression Tests PASS nos módulos afetados. Sem nova dependência ou implantação/túnel público.

Scope Validation: Allowed Changes PASS com precisões PRIMARY anteriores ao código; Incidental Changes PASS conforme tabela; Forbidden Changes PASS; Scope Creep NONE. Definition of Done PASS. Contagem 14/37 DONE. Acumulado 215 casos distintos aprovados = 88 unitários + 105 integrações + 22 E2E (inclui gates anteriores não afetados, sem contar repetições); checkpoint seguinte executará os gates acumulados da fase. Next Eligible TASK: TASK-015 candidata, dependências 009–014 DONE; própria DoR e escopo documental antes de iniciar. Continuidade autorizada até 28/37; ZIP alheio e base original preservados.

### TASK-015 Checkpoint PHASE-02

#### Status

DONE

#### Phase

PHASE-02

#### Priority

CRITICAL

#### Objetivo

Validar catálogo, estoque, desejos, regras de preço e módulos de avaliação antes da compra.

#### Dependências

DEPENDS_ON: TASK-009, TASK-010, TASK-011, TASK-012, TASK-013, TASK-014

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

N/A; N/A; RNF-001, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010; N/A; ADR-001, ADR-004, ADR-006.

Justificativa técnica: fundação, qualidade ou operação exigida pelos RNFs/ADRs acima; não cria funcionalidade comercial autônoma.

#### Artefatos esperados

Validar catálogo, estoque, desejos, regras de preço e módulos de avaliação antes da compra. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- docs/validation/phase-02.md
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

NO_INCIDENTAL_CHANGES

Nenhuma mudança fora do escopo primário é permitida nesta tarefa.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.
- Alterar código de produção; falhas exigem tarefa de correção e revalidação.

#### Critérios de aceitação

Gates acumulados executados; integração de compra ainda não implementada é explicitamente bloqueada em runtime e agendada em TASK-023.

#### Testes necessários

TEST-026, TEST-028, TEST-030. Executar apenas cenários aplicáveis ao módulo e regressões diretamente afetadas; nos checkpoints, executar os gates acumulados da fase.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

#### Início e DoR

2026-11-02, branch real chore/TASK-015-checkpoint-phase02, base 2243748 já enviada ao GitHub. Dependências 009–014 DONE, artefatos e gates válidos; ADR-001/004/006 ACCEPTED, PD-006 resolvida, sem PD impeditiva deste checkpoint. AGENTS/conciliação → README/requisitos/pendências → índice/TASK/dependências/Scope Guard → ADRs/API/testes → módulos/portas → testes existentes relidos. DoR PASS; BLOCKED → READY → IN_PROGRESS. Continuidade até 28/37 explicitamente autorizada; etapa documental antiga não reverte a autorização de desenvolvimento de 25/10 e sua renovação.

PRIMARY estritamente docs/validation/phase-02.md e este trecho/índice de TASKS.md; NO_INCIDENTAL_CHANGES. Nenhum código, teste, configuração de produção, dependência ou migration será alterado no checkpoint. Gates acumulados serão executados novamente, inclusive build/tipos/lint/unitários/integrações/segurança/E2E e exports das duas plataformas; não declarar N/A para o software já implementado. Compra/reservas/retenção/backup não certificadas antecipadamente; porta de elegibilidade default nega compra não verificável e só fixtures de teste injetam compras. RNW é prévia compartilhada, não teste humano/nativo/leitor de tela; recusa de TalkBack preservada e aceite integral em 033. PD-004/007/008/009 permanecem abertas para trechos futuros.

#### TASK Execution Report — encerramento 2026-11-02

TASK: TASK-015. Status: DONE. Branch real chore/TASK-015-checkpoint-phase02; base 2243748, commit f966775; fechamento documental no Git real. IN_PROGRESS → IN_REVIEW → DONE após revisão dos gates e escopo. PRIMARY: docs/validation/phase-02.md e somente estado/evidência/índice desta TASK em TASKS.md. Incidental Changes: NONE. NO_INCIDENTAL_CHANGES respeitada; nenhum código, teste, configuração, dependência ou migration alterado.

Tests Executed: npm run verify completo, Vite preview de reviews, Expo export Android/iOS e três entradas RNW, sete suítes Playwright acumuladas (account/equipe, inventory, catalog-web, catalog-mobile, engagement, reviews, pricing). Ambiente Linux nativo do mesmo Git, Node 24.22.1/npm 11.19.1/PostgreSQL 17, revisão f966775 com código idêntico a 2243748; script/log locais test-results/phase-02/checkpoint.{sh,log}, exit 0, checkout de validação limpo ao fim. Todos os 215 casos distintos PASS: 88 unitários + 105 integrações + 22 E2E. Exportações PASS Android 605 módulos/iOS 607. Schemas isolados, comandos, cobertura e limites completos em docs/validation/phase-02.md; nenhuma tentativa falha nesta rodada. ZIP/dados originais preservados, sem túnel público.

Quality Gates: Build PASS; Lint PASS; Unit Tests PASS; Integration Tests PASS; API Tests PASS; Security PASS na política restrita/hash/regressões e negativas, npm audit bruto permanece FAIL/exit 1 com sete low deepmerge e zero moderate/high/critical; Acceptance Criteria PASS no recorte com integrações futuras negadas explicitamente; Regression Tests PASS. RNW/export não comprovam dispositivo/escala nativa/leitor; TalkBack NÃO EXECUTADO por recusa, aceitação integral em 033. Sem aprovação acadêmica, metas de desempenho, retenção ou restauração presumidas.

Scope Validation: Allowed Changes PASS; Incidental Changes NONE; Forbidden Changes PASS; Scope Creep NONE. Definition of Done PASS. 15/37 DONE, checkpoint PHASE-02 concluído. Next Eligible TASK: TASK-016 candidata com dependências 015/014 satisfeitas, sujeita a sua própria DoR/contratos/guardas antes da promoção. Continuidade autorizada até pelo menos 28/37; não antecipar PHASE-04 antes de 024.

### TASK-016 Implementar carrinho e reserva única de checkout

#### Status

BLOCKED

#### Phase

PHASE-03

#### Priority

CRITICAL

#### Objetivo

Criar carrinho sem reserva, mescla de visitante e checkout único de 15min com reserva todos-ou-nenhum e cupom temporário.

#### Dependências

DEPENDS_ON: TASK-015, TASK-014

Reserva de cupom usa regras de preço implementadas em TASK-014.

#### Requisitos relacionados

RF-010, RF-018, RF-019; RN-001, RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-013, RN-016, RN-017, RN-018, RN-019, RN-021, RN-022, RN-024, RN-027, RN-028, RN-032, RN-035, RN-038, RN-039; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011; UC-010, UC-018, UC-019. ADRs: ADR-003, ADR-004.

#### Artefatos esperados

Criar carrinho sem reserva, mescla de visitante e checkout único de 15min com reserva todos-ou-nenhum e cupom temporário. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/api/src/modules/cart/**
- apps/api/src/modules/inventory/** integração de reservas
- apps/api/src/jobs/reservations*
- apps/api/prisma/** somente carrinho/reservas
- packages/contracts/cart/**
- tests/cart/**
- tests/concurrency/reservations/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/src/modules/checkout/** somente reserva/snapshots/expiração
- apps/api/src/modules/pricing/** ledger temporário de uso
- apps/api/prisma/** somente Checkout, CheckoutItem, Reservation e CouponUsage
- tests/checkout/reservations/**
- packages/contracts/checkout/** reserva e tempo

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Concorrência por usado/cupom segura; alterar itens/cupom reinicia validação, endereço conserva prazo. Porta de contagem de pendentes será conectada a pedidos em TASK-018/023; runtime não ignora limite.

#### Testes necessários

TEST-010, TEST-018, TEST-019. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-017 Criar carrinho e reserva nas interfaces

#### Status

BLOCKED

#### Phase

PHASE-03

#### Priority

HIGH

#### Objetivo

Entregar carrinho visitante/conta, mescla avisada, reserva e recuperação da mesma finalização entre dispositivos.

#### Dependências

DEPENDS_ON: TASK-016

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-010; RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-028, RN-032, RN-035; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011; UC-010. ADRs: ADR-001, ADR-003.

#### Artefatos esperados

Entregar carrinho visitante/conta, mescla avisada, reserva e recuperação da mesma finalização entre dispositivos. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/web/src/features/cart/**
- apps/mobile/src/features/cart/**
- tests/e2e/cart/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.

#### Critérios de aceitação

Carrinho não bloqueia saldo; mudança comercial requer confirmação; timer pertence ao checkout, não ao item. Tratamento de retorno da API sem assumir reserva local.

#### Testes necessários

TEST-010. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-018 Implementar frete, cotação e pedidos

#### Status

BLOCKED

#### Phase

PHASE-03

#### Priority

CRITICAL

#### Objetivo

Implementar gestão de frete ADMIN, cobertura por CEP, snapshots e criação Pix/boleto, transferindo reserva e tornando cupom definitivo. Conectar limite de 3 pendentes.

#### Dependências

DEPENDS_ON: TASK-016, TASK-014

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-010, RF-011, RF-019, RF-029; RN-002, RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-013, RN-014, RN-016, RN-017, RN-018, RN-028, RN-032, RN-033, RN-035; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011; UC-010, UC-011, UC-019, UC-029. ADRs: ADR-003, ADR-004.

#### Artefatos esperados

Implementar gestão de frete ADMIN, cobertura por CEP, snapshots e criação Pix/boleto, transferindo reserva e tornando cupom definitivo. Conectar limite de 3 pendentes. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

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

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

PD-004 resolvida; e-mail confirmado antes de pedido; Pix 30min/boleto 2 dias; faixas não atendidas bloqueiam pedido sem encerrar antecipadamente checkout; mudança de endereço mantém prazo.

#### Testes necessários

TEST-010, TEST-011, TEST-019, TEST-035. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-019 Implementar simulador, cobranças e estornos automáticos

#### Status

BLOCKED

#### Phase

PHASE-03

#### Priority

CRITICAL

#### Objetivo

Criar cartão antes de pedido, confirmação Pix/boleto, vencimento, cobrança invalidada/substituída e núcleo de estorno com tentativas/falhas para pagamentos tardios.

#### Dependências

DEPENDS_ON: TASK-018

Entrega núcleo de estornos automáticos; TASK-025 estende para cancelamento, evitando dependência circular.

#### Requisitos relacionados

RF-012, RF-014, RF-018, RF-019, RF-024; RN-001, RN-003, RN-004, RN-006, RN-008, RN-010, RN-011, RN-012, RN-013, RN-016, RN-017, RN-018, RN-019, RN-021, RN-022, RN-024, RN-027, RN-028, RN-032, RN-033, RN-035, RN-038, RN-039, RN-041, RN-042; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; UC-012, UC-014, UC-018, UC-019, UC-024. ADRs: ADR-002, ADR-003, ADR-004.

#### Artefatos esperados

Criar cartão antes de pedido, confirmação Pix/boleto, vencimento, cobrança invalidada/substituída e núcleo de estorno com tentativas/falhas para pagamentos tardios. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/api/src/modules/payments/**
- apps/api/src/modules/orders/** somente transições de pagamento/expiração
- apps/api/src/modules/inventory/** conversão/liberação
- apps/api/src/modules/pricing/** liberação de uso por vencimento; consumo já ocorre ao criar pedido
- apps/api/src/jobs/order-expiry*
- apps/api/prisma/** somente tentativas/eventos pedido
- packages/contracts/payments/**
- tests/payments/**
- tests/concurrency/payments/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/src/modules/refunds/** núcleo/tentativas/estorno automático de pagamento
- apps/api/prisma/** somente PaymentCharge, PaymentAttempt, Refund, RefundAttempt, FinancialEvent e referências de checkout/pedido
- apps/api/src/modules/messaging/** eventos de pagamento/estorno
- tests/refunds/automatic/**
- apps/api/src/modules/checkout/** fechamento pelo resultado do cartão
- apps/api/src/modules/orders/** criação atômica do pedido pago por cartão
- apps/api/src/modules/accounts/** consulta de e-mail confirmado antes da criação

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Cartão exige e-mail confirmado antes de criar pedido; recusa cartão não cria pedido; tardio sem pedido estorna; cobrança invalidada não quita; idempotência e corrida expiração/aprovação verificadas. Serviço de substituição disponível para indisponibilidade em TASK-025. Não antecipar autorização de pós-venda.

#### Testes necessários

TEST-012, TEST-014, TEST-018, TEST-019, TEST-024. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-020 Criar checkout e simulação nos clientes

#### Status

BLOCKED

#### Phase

PHASE-03

#### Priority

HIGH

#### Objetivo

Entregar endereço/frete, cupom, métodos, resultados simulados e acompanhamento do pagamento.

#### Dependências

DEPENDS_ON: TASK-017, TASK-018, TASK-019

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-011, RF-012; RN-002, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-014, RN-016, RN-017, RN-018, RN-028, RN-032, RN-033, RN-039, RN-041; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; UC-011, UC-012. ADRs: ADR-001, ADR-002.

#### Artefatos esperados

Entregar endereço/frete, cupom, métodos, resultados simulados e acompanhamento do pagamento. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/web/src/features/checkout/**
- apps/mobile/src/features/checkout/**
- tests/e2e/checkout/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.

#### Critérios de aceitação

Sem coleta financeira real; recusa permite outra tentativa no checkout; prazos por método exibidos; não reinicia contador por tentativa.

#### Testes necessários

TEST-011, TEST-012. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-021 Implementar histórico e logística manual

#### Status

BLOCKED

#### Phase

PHASE-03

#### Priority

HIGH

#### Objetivo

Criar consulta própria e administração de etapas incluindo PREPARING, uma remessa original e mensagens de criação/pagamento/envio/entrega.

#### Dependências

DEPENDS_ON: TASK-019

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-013, RF-020, RF-024; RN-001, RN-003, RN-015, RN-019, RN-023, RN-024, RN-032, RN-033, RN-040, RN-042; RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; UC-013, UC-020, UC-024. ADRs: ADR-001, ADR-002, ADR-003.

#### Artefatos esperados

Criar consulta própria e administração de etapas incluindo PREPARING, uma remessa original e mensagens de criação/pagamento/envio/entrega. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/api/src/modules/orders/** consultas/logística
- packages/contracts/orders/**
- apps/web/src/features/orders/**
- apps/mobile/src/features/orders/**
- apps/web/src/features/admin/orders/**
- tests/orders/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/src/modules/messaging/** eventos de pedido/logística
- apps/api/prisma/** somente Shipment ORIGINAL

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Cliente vê snapshots e eventos; OPERATOR/ADMIN transicionam etapas válidas; notificações falhas não bloqueiam logística. Não implementar remessas de pós-venda antecipadamente.

#### Testes necessários

TEST-013, TEST-020, TEST-024. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-022 Implementar bloqueio, encerramento e reativação de contas

#### Status

BLOCKED

#### Phase

PHASE-03

#### Priority

HIGH

#### Objetivo

Implementar gestão de clientes, bloqueio ADMIN e encerramento voluntário com cancelamento de pendentes/reservas; reativação confirmada por e-mail; interfaces correspondentes.

#### Dependências

DEPENDS_ON: TASK-019, TASK-021

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-002, RF-004, RF-014, RF-021, RF-027, RF-028; RN-001, RN-002, RN-011, RN-017, RN-019, RN-028, RN-029, RN-032, RN-039, RN-041, RN-043, RN-044; RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; UC-002, UC-004, UC-014, UC-021, UC-027, UC-028. ADRs: ADR-003, ADR-005.

#### Artefatos esperados

Implementar gestão de clientes, bloqueio ADMIN e encerramento voluntário com cancelamento de pendentes/reservas; reativação confirmada por e-mail; interfaces correspondentes. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

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

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Bloqueio/encerramento negam login e tokens antigos; pagos preservados; bloqueio prevalece na reativação; OPERATOR só consulta. Retenção/anonimização PD-008 resolvida antes de comportamento dependente; não apagar dados por suposição.

#### Testes necessários

TEST-002, TEST-004, TEST-014, TEST-021, TEST-033, TEST-034. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-023 Integrar regras comerciais e validar fronteiras

#### Status

BLOCKED

#### Phase

PHASE-03

#### Priority

CRITICAL

#### Objetivo

Conectar pedidos reais às avaliações, limite de pendentes e guardas do catálogo/estoque, e validar eventos e bloqueio.

#### Dependências

DEPENDS_ON: TASK-012, TASK-013, TASK-016, TASK-018, TASK-019, TASK-020, TASK-021, TASK-022

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-008, RF-009, RF-010, RF-012, RF-017, RF-018, RF-019, RF-021, RF-027; RN-001, RN-004, RN-005, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-016, RN-017, RN-018, RN-019, RN-021, RN-022, RN-024, RN-025, RN-026, RN-027, RN-028, RN-032, RN-033, RN-035, RN-036, RN-037, RN-038, RN-039, RN-041, RN-043, RN-045; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-010, RNF-011; UC-008, UC-009, UC-010, UC-012, UC-017, UC-018, UC-019, UC-021, UC-027. ADRs: ADR-003, ADR-004, ADR-005.

#### Artefatos esperados

Conectar pedidos reais às avaliações, limite de pendentes e guardas do catálogo/estoque, e validar eventos e bloqueio. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/api/src/composition/**
- apps/api/src/modules/reviews/** adaptador compra entregue
- apps/api/src/modules/catalog/** guardas de reservas e histórico
- tests/integration/commerce/**
- tests/concurrency/commerce/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.

#### Critérios de aceitação

Inativação preserva reservas; histórico impede exclusão; uma avaliação por pedido/edição; limite 3 pendentes anterior à reserva; portas sem mock em runtime comercial.

#### Testes necessários

TEST-008, TEST-009, TEST-010, TEST-012, TEST-017, TEST-018, TEST-019, TEST-021, TEST-033. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-024 Checkpoint PHASE-03

#### Status

BLOCKED

#### Phase

PHASE-03

#### Priority

CRITICAL

#### Objetivo

Validar compra completa nos clientes, permissões e simulações antes do pós-venda.

#### Dependências

DEPENDS_ON: TASK-020, TASK-021, TASK-022, TASK-023

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

N/A; N/A; RNF-001, RNF-003, RNF-004, RNF-005, RNF-008, RNF-011; N/A; ADR-001, ADR-002, ADR-003, ADR-004, ADR-005.

Justificativa técnica: fundação, qualidade ou operação exigida pelos RNFs/ADRs acima; não cria funcionalidade comercial autônoma.

#### Artefatos esperados

Validar compra completa nos clientes, permissões e simulações antes do pós-venda. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- docs/validation/phase-03.md
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

NO_INCIDENTAL_CHANGES

Nenhuma mudança fora do escopo primário é permitida nesta tarefa.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.
- Alterar código de produção; falhas exigem tarefa de correção e revalidação.

#### Critérios de aceitação

Gates de compra e corridas executados, inclusive cartão sem pedido, mensagens e ciclo de conta; estorno automático de pagamento já funcional.

#### Testes necessários

TEST-026, TEST-027, TEST-028, TEST-030, TEST-031. Executar apenas cenários aplicáveis ao módulo e regressões diretamente afetadas; nos checkpoints, executar os gates acumulados da fase.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-025 Implementar cancelamentos e indisponibilidade parcial

#### Status

BLOCKED

#### Phase

PHASE-04

#### Priority

HIGH

#### Objetivo

Entregar cancelamento direto PENDING/PAID antes de PREPARING, indisponibilidade parcial/integral e integração com núcleo de estornos/cobranças da TASK-019.

#### Dependências

DEPENDS_ON: TASK-024

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-012, RF-014, RF-018, RF-020, RF-024; RN-001, RN-003, RN-004, RN-006, RN-010, RN-011, RN-012, RN-013, RN-015, RN-017, RN-019, RN-021, RN-022, RN-023, RN-024, RN-027, RN-028, RN-032, RN-033, RN-035, RN-038, RN-039, RN-040, RN-041, RN-042; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; UC-012, UC-014, UC-018, UC-020, UC-024. ADRs: ADR-003, ADR-004.

#### Artefatos esperados

Entregar cancelamento direto PENDING/PAID antes de PREPARING, indisponibilidade parcial/integral e integração com núcleo de estornos/cobranças da TASK-019. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/api/src/modules/aftersales/cancellations/**
- apps/api/src/modules/refunds/** núcleo e cancelamento
- apps/api/src/modules/orders/** cancelamento
- apps/api/src/modules/inventory/** liberação e reposição por cancelamento
- apps/api/src/modules/pricing/** liberação de uso por cancelamento
- apps/api/prisma/** somente cancelamento/estorno
- packages/contracts/aftersales/** cancelamento
- tests/aftersales/cancellations/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/src/modules/payments/** substituição de cobrança
- apps/api/src/modules/messaging/** cancelamento e falha/sucesso de estorno

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Parcial conserva frete/cupom e vencimento; total libera cupom/frete quando pago. Nova cobrança invalida antiga. Falha de estorno mantém cancelamento e permite tentativa. Em separação encaminha a devolução TASK-026.

#### Testes necessários

TEST-012, TEST-014, TEST-018, TEST-020, TEST-024. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-026 Implementar devoluções, inspeção e evidências

#### Status

BLOCKED

#### Phase

PHASE-04

#### Priority

HIGH

#### Objetivo

Criar devolução parcial e pré-envio, postagem/inspeção, evidências privadas, reenvio de rejeitado, autorização ADMIN de estorno e impacto de devolução nas avaliações.

#### Dependências

DEPENDS_ON: TASK-025

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-009, RF-015, RF-018, RF-020, RF-022, RF-024; RN-001, RN-003, RN-004, RN-006, RN-013, RN-015, RN-018, RN-019, RN-020, RN-021, RN-022, RN-023, RN-024, RN-025, RN-027, RN-028, RN-032, RN-033, RN-034, RN-035, RN-038, RN-039, RN-040, RN-041, RN-042, RN-045; RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-010, RNF-011; UC-009, UC-015, UC-018, UC-020, UC-022, UC-024. ADRs: ADR-003, ADR-004.

#### Artefatos esperados

Criar devolução parcial e pré-envio, postagem/inspeção, evidências privadas, reenvio de rejeitado, autorização ADMIN de estorno e impacto de devolução nas avaliações. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/api/src/modules/aftersales/returns/**
- apps/api/src/modules/refunds/** devolução/rateio
- apps/api/src/modules/inventory/** reposição por inspeção
- apps/api/prisma/** somente devoluções/itens estorno
- packages/contracts/aftersales/** devoluções
- tests/aftersales/returns/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes
- apps/api/src/modules/media/** evidências privadas
- apps/api/src/modules/reviews/** elegibilidade após devolução
- apps/api/src/modules/messaging/** eventos de devolução/estorno
- apps/api/src/modules/aftersales/shared/** postagem, exceções, evidências e interações externas
- apps/api/prisma/** somente Evidence, Shipment de retorno/reenvio, ExternalInteraction e referência de OrderUnit

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

7 dias para abertura/ postagem conforme gatilhos; exceção ADMIN; evidências 5+5; OPERATOR inspeciona mas não autoriza estorno; aptidão controla reposição; integral de edição oculta review. PD-009 resolvida antes do caso de parciais sucessivas.

#### Testes necessários

TEST-009, TEST-015, TEST-018, TEST-020, TEST-022, TEST-024. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-027 Implementar trocas, ofertas e prazos

#### Status

BLOCKED

#### Phase

PHASE-04

#### Priority

HIGH

#### Objetivo

Criar espera de 30 dias pós-conferência, busca antecipada, oferta/reserva 48h, aceite/recusa, conversão, remessas e nova janela por substituto.

#### Dependências

DEPENDS_ON: TASK-026

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-016, RF-018, RF-020, RF-024; RN-001, RN-003, RN-004, RN-006, RN-013, RN-015, RN-019, RN-020, RN-021, RN-022, RN-023, RN-024, RN-027, RN-028, RN-032, RN-033, RN-034, RN-035, RN-038, RN-039, RN-040, RN-041, RN-042, RN-045; RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-010, RNF-011; UC-016, UC-018, UC-020, UC-024. ADRs: ADR-003, ADR-004.

#### Artefatos esperados

Criar espera de 30 dias pós-conferência, busca antecipada, oferta/reserva 48h, aceite/recusa, conversão, remessas e nova janela por substituto. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

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

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Oferta dia 29 tem 48h completas; recusa/expiração libera; aceite não envia antes da inspeção; conversão não autoriza dinheiro; postagem expirada/rejeição libera reserva; não gera venda/avaliação extra.

#### Testes necessários

TEST-016, TEST-018, TEST-020, TEST-024. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-028 Criar interfaces de pós-venda

#### Status

BLOCKED

#### Phase

PHASE-04

#### Priority

HIGH

#### Objetivo

Entregar solicitações, evidências, aceite de substituto, conversão e acompanhamento nos clientes; operação/autorizações na web.

#### Dependências

DEPENDS_ON: TASK-025, TASK-026, TASK-027

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-014, RF-015, RF-016; RN-011, RN-017, RN-018, RN-019, RN-020, RN-021, RN-022, RN-023, RN-028, RN-032, RN-034, RN-035, RN-039, RN-040, RN-041, RN-045; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010, RNF-011; UC-014, UC-015, UC-016. ADRs: ADR-001, ADR-002.

#### Artefatos esperados

Entregar solicitações, evidências, aceite de substituto, conversão e acompanhamento nos clientes; operação/autorizações na web. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/web/src/features/aftersales/**
- apps/mobile/src/features/aftersales/**
- apps/web/src/features/admin/aftersales/**
- tests/e2e/aftersales/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.

#### Critérios de aceitação

OPERATOR não recebe controles ADMIN; cliente vê falha de reembolso; atendimento de bloqueado registrado via e-mail externo; evidências privadas e acessíveis só a envolvidos.

#### Testes necessários

TEST-014, TEST-015, TEST-016. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-029 Implementar relatórios financeiros e comerciais

#### Status

BLOCKED

#### Phase

PHASE-04

#### Priority

MEDIUM

#### Objetivo

Criar painel ADMIN com eventos financeiros no período, ticket por coorte ajustada, gênero principal e giro líquido por edição.

#### Dependências

DEPENDS_ON: TASK-026, TASK-027

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-023; RN-018, RN-021, RN-030, RN-032, RN-034; RNF-001, RNF-003, RNF-004, RNF-005; UC-023. ADRs: ADR-004.

#### Artefatos esperados

Criar painel ADMIN com eventos financeiros no período, ticket por coorte ajustada, gênero principal e giro líquido por edição. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- apps/api/src/modules/reports/**
- packages/contracts/reports/**
- apps/web/src/features/admin/reports/**
- tests/reports/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.

#### Critérios de aceitação

Venda setembro/estorno outubro separados; ticket setembro reflete ajuste conhecido; gratuitos mantidos contam; pedidos sem unidades mantidas saem; troca não duplica venda; recebimento tardio não conta como venda.

#### Testes necessários

TEST-023. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-030 Implementar backup diário completo

#### Status

BLOCKED

#### Phase

PHASE-04

#### Priority

HIGH

#### Objetivo

Implementar backup diário automático consistente e retenção/destino conforme PD-008, incluindo arquivos públicos e evidências privadas.

#### Dependências

DEPENDS_ON: TASK-024

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-025; RN-031, RN-032; RNF-002, RNF-009, RNF-011, RNF-012; UC-025. ADRs: ADR-006.

#### Artefatos esperados

Implementar backup diário automático consistente e retenção/destino conforme PD-008, incluindo arquivos públicos e evidências privadas. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- scripts/backup/**
- apps/api/src/operations/backup/**
- apps/api/prisma/** somente BackupRun
- docs/architecture/execution.md somente backup
- tests/operations/backup/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

#### Critérios de aceitação

Parâmetros operacionais aprovados; falha não elimina conjunto bom; manifesto permite verificar referências/bytes; sem número fixo de sete cópias por herança.

#### Testes necessários

TEST-025. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-031 Revisar auditoria e segurança integrada

#### Status

BLOCKED

#### Phase

PHASE-04

#### Priority

CRITICAL

#### Objetivo

Verificar papéis, contas internas, bloqueio/encerramento, tokens, evidências, mensagens e histórico de exceções/tentativas.

#### Dependências

DEPENDS_ON: TASK-028, TASK-029, TASK-030

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

N/A; N/A; RNF-001, RNF-002, RNF-005, RNF-006, RNF-010, RNF-012; N/A; ADR-002, ADR-005, ADR-006.

Justificativa técnica: fundação, qualidade ou operação exigida pelos RNFs/ADRs acima; não cria funcionalidade comercial autônoma.

#### Artefatos esperados

Verificar papéis, contas internas, bloqueio/encerramento, tokens, evidências, mensagens e histórico de exceções/tentativas. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- tests/security/**
- docs/validation/security.md
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

NO_INCIDENTAL_CHANGES

Nenhuma mudança fora do escopo primário é permitida nesta tarefa.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.
- Alterar código de produção; falhas exigem tarefa de correção e revalidação.

#### Critérios de aceitação

Testes negativos de acesso e concorrência do último ADMIN; segredos ausentes dos logs; correções fora do escopo ganham tarefa própria.

#### Testes necessários

TEST-030. Executar apenas cenários aplicáveis ao módulo e regressões diretamente afetadas; nos checkpoints, executar os gates acumulados da fase.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-032 Checkpoint PHASE-04

#### Status

BLOCKED

#### Phase

PHASE-04

#### Priority

CRITICAL

#### Objetivo

Validar pós-venda, relatórios, notificações, segurança e backup integrado.

#### Dependências

DEPENDS_ON: TASK-028, TASK-029, TASK-030, TASK-031

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

N/A; N/A; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-009, RNF-012; N/A; ADR-001, ADR-002, ADR-003, ADR-004, ADR-005, ADR-006.

Justificativa técnica: fundação, qualidade ou operação exigida pelos RNFs/ADRs acima; não cria funcionalidade comercial autônoma.

#### Artefatos esperados

Validar pós-venda, relatórios, notificações, segurança e backup integrado. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- docs/validation/phase-04.md
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

NO_INCIDENTAL_CHANGES

Nenhuma mudança fora do escopo primário é permitida nesta tarefa.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.
- Alterar código de produção; falhas exigem tarefa de correção e revalidação.

#### Critérios de aceitação

Gates acumulados e corridas de oferta/aceite/expiração aprovados; todas as notificações RN-042 verificadas.

#### Testes necessários

TEST-026, TEST-028, TEST-029, TEST-030. Executar apenas cenários aplicáveis ao módulo e regressões diretamente afetadas; nos checkpoints, executar os gates acumulados da fase.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-033 Executar aceitação funcional e acessibilidade

#### Status

BLOCKED

#### Phase

PHASE-05

#### Priority

HIGH

#### Objetivo

Validar requisitos e fluxos nos clientes/plataformas definidos, teclado/foco/contraste web e leitor/ampliação mobile.

#### Dependências

DEPENDS_ON: TASK-032

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-001, RF-002, RF-003, RF-004, RF-005, RF-006, RF-007, RF-008, RF-009, RF-010, RF-011, RF-012, RF-013, RF-014, RF-015, RF-016, RF-017, RF-018, RF-019, RF-020, RF-021, RF-022, RF-023, RF-024, RF-026, RF-027, RF-028, RF-029; RN-001, RN-002, RN-003, RN-004, RN-005, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-014, RN-015, RN-016, RN-017, RN-018, RN-019, RN-020, RN-021, RN-022, RN-023, RN-024, RN-025, RN-026, RN-027, RN-028, RN-029, RN-030, RN-032, RN-033, RN-034, RN-035, RN-036, RN-037, RN-038, RN-039, RN-040, RN-041, RN-042, RN-043, RN-044, RN-045; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-010, RNF-011; UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007, UC-008, UC-009, UC-010, UC-011, UC-012, UC-013, UC-014, UC-015, UC-016, UC-017, UC-018, UC-019, UC-020, UC-021, UC-022, UC-023, UC-024, UC-026, UC-027, UC-028, UC-029. ADRs: ADR-001, ADR-002.

#### Artefatos esperados

Validar requisitos e fluxos nos clientes/plataformas definidos, teclado/foco/contraste web e leitor/ampliação mobile. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- tests/e2e/acceptance/**
- tests/accessibility/**
- docs/validation/acceptance.md
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

NO_INCIDENTAL_CHANGES

Nenhuma mudança fora do escopo primário é permitida nesta tarefa.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.
- Alterar código de produção; falhas exigem tarefa de correção e revalidação.

#### Critérios de aceitação

TEST-001 a TEST-025 e TEST-032 a TEST-035 funcionais cobertos; todos os cenários aplicáveis do PDF têm evidência; nenhuma certificação não aferida.

#### Testes necessários

TEST-001, TEST-002, TEST-003, TEST-004, TEST-005, TEST-006, TEST-007, TEST-008, TEST-009, TEST-010, TEST-011, TEST-012, TEST-013, TEST-014, TEST-015, TEST-016, TEST-017, TEST-018, TEST-019, TEST-020, TEST-021, TEST-022, TEST-023, TEST-024, TEST-032, TEST-033, TEST-034, TEST-035. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-034 Validar desempenho e concorrência

#### Status

BLOCKED

#### Phase

PHASE-05

#### Priority

CRITICAL

#### Objetivo

Executar carga com volume/metas definidos em PD-007 e testes concorrentes de saldo, cupom, contas e prazos.

#### Dependências

DEPENDS_ON: TASK-032

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-010, RF-011, RF-012, RF-018, RF-019, RF-021, RF-023; RN-001, RN-002, RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-014, RN-016, RN-017, RN-018, RN-019, RN-021, RN-022, RN-024, RN-027, RN-028, RN-030, RN-032, RN-033, RN-034, RN-035, RN-038, RN-039, RN-041; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; UC-010, UC-011, UC-012, UC-018, UC-019, UC-021, UC-023. ADRs: ADR-003, ADR-004.

#### Artefatos esperados

Executar carga com volume/metas definidos em PD-007 e testes concorrentes de saldo, cupom, contas e prazos. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- tests/performance/**
- tests/concurrency/final/**
- docs/validation/performance.md
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

NO_INCIDENTAL_CHANGES

Nenhuma mudança fora do escopo primário é permitida nesta tarefa.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.
- Alterar código de produção; falhas exigem tarefa de correção e revalidação.

#### Critérios de aceitação

Metas/ambiente fixados antes da medição; resultados reais e amostras registrados; não usar antigos 2s/5 usuários como requisito aprovado.

#### Testes necessários

TEST-010, TEST-011, TEST-012, TEST-018, TEST-019, TEST-021, TEST-023. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-035 Executar restauração isolada

#### Status

BLOCKED

#### Phase

PHASE-05

#### Priority

HIGH

#### Objetivo

Restaurar conjunto em banco/diretório separados e comparar dados, fotos e evidências; validar periodicidade/política aprovada.

#### Dependências

DEPENDS_ON: TASK-030, TASK-032

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

RF-025; RN-031, RN-032; RNF-002, RNF-009, RNF-011, RNF-012; UC-025. ADRs: ADR-006.

#### Artefatos esperados

Restaurar conjunto em banco/diretório separados e comparar dados, fotos e evidências; validar periodicidade/política aprovada. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- scripts/restore-validation/**
- tests/operations/restore/**
- docs/validation/restore.md
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

NO_INCIDENTAL_CHANGES

Nenhuma mudança fora do escopo primário é permitida nesta tarefa.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.
- Alterar código de produção; falhas exigem tarefa de correção e revalidação.

#### Critérios de aceitação

Origem intacta; referências e bytes conferidos; duração/resultado registrados; política não pendente no aceite.

#### Testes necessários

TEST-025. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-036 Consolidar documentação operacional

#### Status

BLOCKED

#### Phase

PHASE-05

#### Priority

HIGH

#### Objetivo

Documentar execução, configuração, testes, recuperação e limitações verificadas da implementação futura.

#### Dependências

DEPENDS_ON: TASK-033, TASK-034, TASK-035

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

N/A; N/A; RNF-008, RNF-012; N/A; ADR-001, ADR-002, ADR-006.

Justificativa técnica: fundação, qualidade ou operação exigida pelos RNFs/ADRs acima; não cria funcionalidade comercial autônoma.

#### Artefatos esperados

Documentar execução, configuração, testes, recuperação e limitações verificadas da implementação futura. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- docs/operations/**
- docs/architecture/execution.md
- README.md somente instruções estruturais e pendências resolvidas
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

NO_INCIDENTAL_CHANGES

Nenhuma mudança fora do escopo primário é permitida nesta tarefa.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.
- Alterar código de produção; falhas exigem tarefa de correção e revalidação.

#### Critérios de aceitação

Instruções correspondem a comandos reais; nenhuma apresentação/slides/roteiro de aula nesta tarefa; pendências acadêmicas não viram afirmações de aprovação.

#### Testes necessários

TEST-028, TEST-030. Executar apenas cenários aplicáveis ao módulo e regressões diretamente afetadas; nos checkpoints, executar os gates acumulados da fase.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-037 Checkpoint PHASE-05 e entrega da implementação

#### Status

BLOCKED

#### Phase

PHASE-05

#### Priority

CRITICAL

#### Objetivo

Revisar evidências finais, rastreabilidade e aceite do software quando implementado.

#### Dependências

DEPENDS_ON: TASK-033, TASK-034, TASK-035, TASK-036

Dependências precisam estar DONE, com artefatos e verificações aplicáveis válidos. Pendências específicas também devem estar resolvidas antes do trecho dependente.

#### Requisitos relacionados

N/A; N/A; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-009, RNF-010, RNF-011, RNF-012; N/A; ADR-001, ADR-002, ADR-003, ADR-004, ADR-005, ADR-006.

Justificativa técnica: fundação, qualidade ou operação exigida pelos RNFs/ADRs acima; não cria funcionalidade comercial autônoma.

#### Artefatos esperados

Revisar evidências finais, rastreabilidade e aceite do software quando implementado. Evidências e registro operacional da tarefa; somente componentes listados no escopo primário.

#### Allowed Changes

- docs/validation/final.md
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

#### Incidental Changes Policy

NO_INCIDENTAL_CHANGES

Nenhuma mudança fora do escopo primário é permitida nesta tarefa.

#### Forbidden Changes

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.
- Alterar código de produção; falhas exigem tarefa de correção e revalidação.

#### Critérios de aceitação

Todos gates aplicáveis e pendências impeditivas resolvidos; documentos não substituem evidência de software. Nenhuma tarefa iniciada nesta revisão documental.

#### Testes necessários

TEST-026, TEST-027, TEST-028, TEST-029, TEST-030, TEST-031. Executar apenas cenários aplicáveis ao módulo e regressões diretamente afetadas; nos checkpoints, executar os gates acumulados da fase.

#### Definition of Done

Objetivo e critérios acima cumpridos; DoD global e gates aplicáveis de AGENTS.md satisfeitos; evidências reais registradas; alterações classificadas PRIMARY/INCIDENTAL; nenhum Forbidden Change; nenhuma pendência impeditiva da entrega específica; commits rastreáveis quando houver repositório. Relatório final e parada obrigatória, salvo autorização explícita de continuidade.

#### Evidência operacional

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.
