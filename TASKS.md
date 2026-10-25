# Backlog de implementação do Garimpo

Reconciliado com o PDF final por autorização do responsável. IDs TASK-001 a TASK-037 preservados; escopos e critérios corrigidos. A revisão dos documentos não inicia implementação. TASK-001 permanece READY; demais tarefas BLOCKED por dependências não concluídas.

**Uso futuro:** o responsável informou que a etapa atual é somente documental. READY não autoriza execução agora; nenhuma TASK, inclusive TASK-001, deve ser iniciada por um pedido genérico de continuar a documentação.

## Índice de execução

| Ordem | TASK | Fase | Prioridade | Dependências | Estado |
| --- | --- | --- | --- | --- | --- |
| 1 | TASK-001 Validar decisões técnicas e parâmetros pendentes | PHASE-01 | CRITICAL | NONE | DONE |
| 2 | TASK-002 Preparar estrutura de desenvolvimento | PHASE-01 | CRITICAL | TASK-001 | IN_PROGRESS |
| 3 | TASK-003 Criar persistência e fundação transacional | PHASE-01 | CRITICAL | TASK-002 | BLOCKED |
| 4 | TASK-004 Implementar contas, autenticação e gestão interna na API | PHASE-01 | CRITICAL | TASK-003 | BLOCKED |
| 5 | TASK-005 Implementar recuperação, confirmação e mensagens de acesso | PHASE-01 | HIGH | TASK-004 | BLOCKED |
| 6 | TASK-006 Criar interfaces de contas e administração interna | PHASE-01 | HIGH | TASK-004, TASK-005 | BLOCKED |
| 7 | TASK-007 Checkpoint PHASE-01 | PHASE-01 | CRITICAL | TASK-003, TASK-004, TASK-005, TASK-006 | BLOCKED |
| 8 | TASK-008 Implementar catálogo, metadados e imagens na API | PHASE-02 | HIGH | TASK-007 | BLOCKED |
| 9 | TASK-009 Administrar catálogo e estoque inicial | PHASE-02 | HIGH | TASK-008 | BLOCKED |
| 10 | TASK-010 Criar catálogo público no site | PHASE-02 | HIGH | TASK-008 | BLOCKED |
| 11 | TASK-011 Criar catálogo público no aplicativo | PHASE-02 | HIGH | TASK-008 | BLOCKED |
| 12 | TASK-012 Implementar desejos e alertas de disponibilidade | PHASE-02 | HIGH | TASK-008, TASK-009, TASK-010, TASK-011 | BLOCKED |
| 13 | TASK-013 Implementar avaliações e moderação | PHASE-02 | MEDIUM | TASK-008, TASK-010, TASK-011 | BLOCKED |
| 14 | TASK-014 Implementar administração de cupons e promoções | PHASE-02 | HIGH | TASK-009 | BLOCKED |
| 15 | TASK-015 Checkpoint PHASE-02 | PHASE-02 | CRITICAL | TASK-009, TASK-010, TASK-011, TASK-012, TASK-013, TASK-014 | BLOCKED |
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

IN_PROGRESS

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

### TASK-003 Criar persistência e fundação transacional

#### Status

BLOCKED

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

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-004 Implementar contas, autenticação e gestão interna na API

#### Status

BLOCKED

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

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-005 Implementar recuperação, confirmação e mensagens de acesso

#### Status

BLOCKED

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

### TASK-006 Criar interfaces de contas e administração interna

#### Status

BLOCKED

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

### TASK-007 Checkpoint PHASE-01

#### Status

BLOCKED

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

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-008 Implementar catálogo, metadados e imagens na API

#### Status

BLOCKED

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

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-009 Administrar catálogo e estoque inicial

#### Status

BLOCKED

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

Não executada. Estado inicial preservado; a conciliação documental não é execução da TASK. Branch: N/A; commits: N/A; testes de software: NÃO EXECUTADOS.

### TASK-010 Criar catálogo público no site

#### Status

BLOCKED

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

### TASK-011 Criar catálogo público no aplicativo

#### Status

BLOCKED

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

### TASK-012 Implementar desejos e alertas de disponibilidade

#### Status

BLOCKED

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

### TASK-013 Implementar avaliações e moderação

#### Status

BLOCKED

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

### TASK-014 Implementar administração de cupons e promoções

#### Status

BLOCKED

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

### TASK-015 Checkpoint PHASE-02

#### Status

BLOCKED

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
