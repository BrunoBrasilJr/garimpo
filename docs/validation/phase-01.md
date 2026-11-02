# Checkpoint PHASE-01 — TASK-007

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
