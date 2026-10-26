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
| 6 | TASK-006 Criar interfaces de contas e administração interna | PHASE-01 | HIGH | TASK-004, TASK-005 | IN_REVIEW |
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

IN_REVIEW

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
Status: IN_REVIEW — implementação e verificações automáticas concluídas; inspeções humanas web/Android pendentes.
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

#### Quality Gates
Build: PASS — build/tipos e bundle Android, evidências acima; build web final da correção de rótulos em browser-05.log.
Lint: PASS — verify-final.log.
Unit Tests: PASS — 31 casos, incluindo seis de protocolo mobile/armazenamento injetado, sem fingir SecureStore real.
Integration Tests: PASS — 39 casos backend e relay HTTPS real no E2E.
API Tests: PASS — contratos/permissões/regressão e fluxos de UI com API real.
Security: FAIL/PENDENTE no aceite completo — automação TLS/CSRF/cookies/rotas/patch PASS; auditoria bruta FAIL conhecida e mitigada conforme decisão; SecureStore/saída/restauração no Android real ainda sem evidência humana.
Acceptance Criteria: FAIL/PENDENTE — inspeções web/Android reais do responsável não recebidas.
Regression Tests: PASS — 70 casos backend/protocolo e sete E2E dirigidos acima.

#### Scope Validation
Allowed Changes: PASS.
Incidental Changes: PASS — tabela de seis arquivos, sem efeito independente.
Forbidden Changes: PASS — nenhuma migration, mudança de requisito ou implementação futura; ampliação temporária de transporte documentada e autorizada.
Scope Creep: NONE — exposição de teste é a ampliação explícita rastreada, sem infraestrutura de produção.

#### Definition of Done
FAIL/PENDENTE — aguardar inspeções humanas e registrar resultado real; TASK-006 não DONE. Encerramento do túnel/Metro e remoção da regra temporária deverão ser confirmados após o teste.

#### Next Eligible TASK
NONE. TASK-007 permanece BLOCKED até TASK-006 DONE e DoR/checkpoint próprios. Nenhuma tarefa de catálogo iniciada. Contagem atual permanece 5/37 DONE; faltam 14 conclusões para a meta de 19, sem prometer prazo ou inflar aceites.

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
