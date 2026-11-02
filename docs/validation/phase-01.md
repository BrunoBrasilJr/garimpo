# Checkpoint PHASE-01 — TASK-007

## Encerramento em 2026-11-01

Estado: DONE. Branch: chore/TASK-007-checkpoint-phase01. Base de retomada 6733e22; correção de segurança feita na TASK-002, commits 2ebf90a e bd7ee7c incorporados por fast-forward. Código validado: 2ebf90a; bd7ee7c altera apenas documentação. Este checkpoint altera somente este documento e TASKS.md.

DoR revalidada: TASK-001 a TASK-006 DONE, artefatos reais e ADR-001 a ADR-005 ACCEPTED, gates acumulados atuais aprovados no recorte abaixo. Transições: BLOCKED → READY → IN_PROGRESS → IN_REVIEW → DONE. Execução contínua e decisões rotineiras já autorizadas pelo responsável, visando 28/37 DONE até 05/11; não há nova permissão genérica pendente. O ZIP anterior permanece preservado e fora do índice.

Ambiente: Windows/Ubuntu WSL2, Node Linux 24.22.1, npm 11.19.1 e PostgreSQL 17. A instalação no volume Windows apresentou lentidão e suas árvores parciais foram preservadas. A validação integral ocorreu num checkout Git isolado do mesmo código em /home/brasi/.local/share/garimpo/validation/task002-20261101, com environment.sh protegido e schemas separados em garimpo_test. Nenhum reset/drop/truncate da base original ou túnel público. A restauração operacional das dependências para o caminho Windows terminou com exit 0: quatro hashes conferidos e npm ls confirmou Forge 1.4.2, deepmerge 4.3.1, glob 14.0.3 e minimatch 11.0.3 deduplicados. A cópia não foi apresentada como um segundo npm ci; a prova de instalação limpa é a execução Linux descrita acima.

Comandos reais no checkout Linux: npm ci --no-audit --no-fund; npm run verify; npm run bundle:android; npm run test:account-ui. Instalação com scripts executados e 804 pacotes em dois minutos. Não se usaram force, legacy-peer-deps, ignore-scripts, relaxamento de scrypt/TLS ou mudança dos limites dos testes na rodada aprovada.

| Verificação | Resultado válido |
| --- | --- |
| Instalação limpa, preinstall/postinstall e hashes dos quatro arquivos revisados | PASS |
| Build API/contracts/web, tipos e lint | PASS |
| Unitários/protocolo/relógio/segurança/compatibilidade | PASS, 45 casos em 11 arquivos |
| Integração core | PASS, nove casos; task003_8a6f7f96dd624b169bc35b950f5767e7 |
| Integração contas/permissões/último ADMIN | PASS, 14 casos; task004_571b504d042b402e880d07893c9bd16a |
| Integração mensagens/tokens/CLI | PASS, 16 casos; task005_31b0ae6208e34a0e81841f534fe1ae62 |
| Política restrita de segurança | PASS, versões exatas, patch reproduzível, hashes e regressões |
| npm audit bruto | FAIL/exit 1, sete low da cadeia deepmerge, zero moderate/high/critical; relatório preservado |
| E2E Firefox com API/DB reais e HTTPS confiável, inclusive negativa sem CA | PASS integral, sete casos; task006_ae00cf8edd2d47c19247508cb02dfd46 |
| Exportação Android | PASS, 586 módulos em 86,7 segundos; não comprova execução nativa |

Total aprovado: 45 + 9 + 14 + 16 + 7 = 91 casos distintos. Logs locais: test-results/toolchain-20261101/native-clean-and-gates.log, native-ui-recheck.log, native-ui-memory-recheck.log e audit-after.json. Não publicar indiscriminadamente perfis, certificados, credenciais e caixas de mensagens gerados nos testes.

A política aceita somente o advisory exato de deepmerge com patch conferido nas entradas fonte/CommonJS/UMD; exige Forge upstream corrigido 1.4.2 e rejeita a antiga exceção Forge 1.4.0, novos advisories, hashes diferentes e relatórios inconsistentes. Não se declara auditoria sem achados. Detalhes, reprodução antes/depois e fontes primárias no [registro da correção](../architecture/execution.md).

Falhas preservadas: baseline 6733e22 passou build/tipos/lint e 72 casos, mas parou na auditoria com 23 pacotes afetados (um high, 20 moderate, dois low), sem executar E2E/bundle. Após a correção, primeira E2E teve quatro PASS/três timeouts; segunda seis PASS/uma falha no cadastro ainda aguardando resposta após dez segundos. Windows tinha cerca de 600 MB de RAM livres. Depois de pausar a cópia própria de dependências e liberar caches transitórios do Ubuntu, terceira rodada integral PASS com os mesmos limites de 60 segundos por caso/dez segundos por expectativa e sem alteração de código, senha ou TLS. Não se atribui causalidade exclusiva ao ambiente nem se apresentam as tentativas falhas como aprovadas.

Cobertura TEST-030 da fase: cadastro sem elevação, propriedade de endereços, CUSTOMER/STAFF separados, gestão só ADMIN, último ADMIN sob concorrência real, sessões/rotação/revogação, propósito/validade/uso único de links, reset global, CSRF/transporte e caixa técnica protegida. Compras e módulos futuros não foram certificados.

Cobertura TEST-028 da fase: rótulos/roles e escala no código web/mobile; teclado/foco/erros/200%/largura estreita na suíte web; aceites humanos anteriores da TASK-006 preservados. Responsável recusou TalkBack em 01/11: leitor de tela NÃO EXECUTADO, sem PASS; aceitação integral na TASK-033, RNF-007 preservado. Chrome/Edge e iOS continuam alvos, sem execução nova comprovada por Firefox. Não há nova inspeção humana/nativa; limites individuais da alteração de e-mail Android continuam históricos. Esses limites não bloqueiam a fundação/API deste incremento, mas impedem alegar certificação integral ou paridade testada.

O pacote PD-006 adotado por delegação (Goldmine M/NM/VG+/VG/G+/G/F/P, notas inteiras 1–5, promoção percentual/fixa em reais) será consolidado documentalmente na preparação das tarefas pertinentes. Não é conteúdo atribuído ao PDF ou implementação antecipada de catálogo.

### TASK Execution Report

TASK: TASK-007. Status: DONE. Branch: chore/TASK-007-checkpoint-phase01. Commits existentes: 9297f20 preserva o bloqueio; 2ebf90a e bd7ee7c incorporam a correção TASK-002. Hash de fechamento documental a conferir no log real, sem antecipação.

Primary Changes: docs/validation/phase-01.md e trechos operacionais/índice pertinentes de TASKS.md. Incidental Changes: NONE. Nenhum código, dependência ou migration alterado nesta TASK.

Tests Executed: comandos, ambiente e resultados acima da mesma revisão de aplicação validada integralmente. Documentação operacional não justifica repetir esses mesmos gates; conferir índice/grafo/escopo antes do commit. Quality Gates: Build PASS; Lint PASS; Unit Tests PASS; Integration Tests PASS; API Tests PASS; Security PASS no critério restrito, com npm audit bruto FAIL preservado; Acceptance Criteria PASS no recorte da fase e com limites explícitos; Regression Tests PASS. Acessibilidade integral/plataformas não executadas não recebem PASS.

Scope Validation: Allowed Changes PASS; Incidental Changes NONE; Forbidden Changes PASS; Scope Creep NONE. Definition of Done: PASS. TASK-008 é candidata com dependência satisfeita, sujeita à conferência própria de DoR e consolidação de PD-006 antes do código. Continuidade autorizada.

<details>
<summary>Registro histórico da rodada inicial bloqueada, superado pelo encerramento acima</summary>


Data da retomada: 2026-11-01, America/Sao_Paulo. Estado: BLOCKED por auditoria de dependências, nenhum aceite futuro presumido. Base: 6733e22. Branch: chore/TASK-007-checkpoint-phase01.

## Autorização e recorte

O responsável autorizou retomar a execução contínua visando 28/37 tarefas DONE até 2026-11-05, sem horário de corte informado. Não é autorização para ignorar dependências ou transformar teste planejado em aprovado. Somente este documento e TASKS.md pertencem ao escopo de alteração da TASK-007; não há código, configuração, dependência ou migration alterada.

DoR baseada nas TASK-003/004/005/006 DONE, artefatos existentes, decisões ratificadas e evidências válidas das dependências, sem código de aplicação posterior à última entrega. Na retomada, build, tipos, lint e 33 unitários/protocolo/relógio já passaram. Checkpoint repete os gates acumulados; integração, auditoria atual, E2E e bundle continuam pendentes até resultados reais.

## Execução reproduzível

Ambiente existente: Windows/Ubuntu WSL2, Node Linux 24.22.1, npm 11.19.1 e PostgreSQL 17. Cluster existente reiniciado por pg_ctl, sem reset/drop/truncate. Credenciais do banco continuam fora do Git, carregadas do environment.sh protegido, sem impressão de valores. Cada suíte cria schema UUID próprio em garimpo_test; garimpo_dev e schemas anteriores são preservados.

Na raiz do projeto no Ubuntu com runtime e banco preparados, foi iniciado `bash tests/e2e/account/manual-account-ui.sh`, que executa, em ordem:

1. `npm run verify`: build, tipos, lint, unitários, integração core/accounts/messaging e política de auditoria.
2. `npm run test:account-ui`: API/DB reais e HTTPS validado em perfil Firefox com CA isolada; inclui negativa sem CA e relay local.
3. `npm run bundle:android`: exportação Android, que não comprova execução em aparelho.

Log desta rodada: `test-results/account-ui/manual-20261102T010201Z.log` (carimbo UTC; início local em 01/11). Execução pelo agente não é nova inspeção humana nem teste nativo. Não houve abertura de túnel público nesta revalidação automática.

## Resultados parciais

| Verificação | Resultado atual |
| --- | --- |
| Build API/contracts/web e tipos | PASS |
| Lint | PASS |
| Unitários/protocolo/relógio | PASS, 33 casos |
| Integração core | PASS, 9 casos; schema task003_b46250c4e7164c17845d68e9e35afb2b |
| Integração de contas/permissões/último ADMIN | PASS, 14 casos; schema task004_0bdc6ff6a5064cb2b0a8c3e90ec837b1 |
| Integração de mensagens/tokens/CLI | PASS, 16 casos; schema task005_9c6b0af704d94d8194d1fc401becbab0 |
| Auditoria atual | FAIL; 23 pacotes afetados, 1 high/20 moderate/2 low, com novas origens fora da mitigação antiga |
| E2E HTTPS e interfaces | NÃO EXECUTADO nesta rodada; roteiro interrompido no gate de segurança |
| Bundle Android | NÃO EXECUTADO nesta rodada; roteiro interrompido no gate de segurança |

Conferência documental da revisão 6733e22: 331 Markdown, 727 links locais existentes, zero referências de arquivo ausentes (não é validação de todas as âncoras). Backlog: 37 tarefas, 79 dependências, ordem topológica válida e índice coerente com detalhes; seis DONE antes do início deste checkpoint. Essas verificações documentais não substituem testes de aplicação.

## Cobertura e limites de aceitação

TEST-030, no recorte desta fase: cadastro não eleva papel, propriedade de endereços, separação CUSTOMER/STAFF, gestão apenas ADMIN, último ADMIN sob corrida real, sessões revogáveis/rotação, reset com revogação global, propósito/validade/uso único de links, transporte/CSRF e caixa técnica protegida. Não se declara execução de compras, bloqueio comercial, evidências ou arquivos ainda não implementados.

TEST-028, no recorte desta fase: inspeção de rótulos/roles no código web/mobile, teclado/foco/erros/200% e largura estreita na suíte web, além dos aceites humanos já obtidos na TASK-006. No app, TextInput recebe accessibilityLabel e hint, títulos têm papel header, ações têm papel button, aviso é alert/live region e a escala de fonte não foi desativada. Inspeção de código não demonstra fala, ordem de navegação ou comportamento real de leitor de tela.

Em 01/11, responsável recusou TalkBack explicitamente. Teste de leitor de tela: NÃO EXECUTADO, não PASS. Validação completa permanece pendente na TASK-033; não excluir RNF-007 nem certificar acessibilidade. Alvos Chrome/Edge e iOS mantidos, sem atribuir a eles os E2E Firefox ou os aceites Android. A execução nativa anterior e a limitação de evidência individual de alteração de e-mail Android estão preservadas em TASK-006. Decisão de liberação deste checkpoint depende dos resultados e do tratamento explícito dessas limitações.

## Classificação e estado

PRIMARY: docs/validation/phase-01.md e trecho operacional/índice da TASK-007 em TASKS.md. Incidental Changes: NONE. Alteração de código/configuração/migrations: NONE. Scope Creep: NONE. DoD: FAIL/BLOCKED. TASK-008 não iniciada.

O gate rejeitou @eslint-community/eslint-utils como primeira cadeia não aprovada. Relatório integral preservado em test-results/bootstrap/audit-patched.json; a consulta npm confirmou versões oficiais node-forge 1.4.2, minimatch 11.0.3, glob 14.0.3 e deepmerge 4.3.1. A última continua afetada e sem release corrigida segundo o advisory primário. Correção pertence à TASK-002, em branch própria, e ainda não foi aplicada. Fontes: https://github.com/digitalbazaar/forge/blob/main/CHANGELOG.md, https://github.com/advisories/GHSA-g3hv-75wg-m249, https://github.com/advisories/GHSA-3g3m-2fjr-6pw4, https://github.com/advisories/GHSA-gcqx-w48m-w2h4.

Inspeção de contraste por luminância sRGB, sem alegar certificação ou teste visual completo: texto/formulário 11,64:1; campos 12,03:1; botão 11,73:1; ajuda 6,26:1; erro web 8,06:1; erro mobile 9,47:1; aviso 9,77:1; texto da tela 10,68:1; foco web contra cartão 3,93:1. Pares obtidos das cores reais do código. Não substitui TalkBack nem inspeção de todos os estados/telas.

</details>
