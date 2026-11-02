# Checkpoint PHASE-02 — TASK-015

Estado: DONE em 2026-11-02. Branch real chore/TASK-015-checkpoint-phase02,
base 2243748. Dependências TASK-009 a TASK-014 DONE, ADR-001/004/006 ACCEPTED e
PD-006 resolvida por decisão delegada, sem atribuir novas respostas ao PDF.
Continuidade explicitamente autorizada até pelo menos 28/37 tarefas.

Este checkpoint altera somente este documento e TASKS.md. Incidental Changes:
NONE. Não implementa carrinho, checkout, compra, backup ou novas migrations.

Os gates acumulados da implementação foram executados no checkout Git Linux
isolado, Node 24.22.1/npm 11.19.1/PostgreSQL 17. Somente novos schemas de
garimpo_test, ambiente protegido; nenhuma restauração/reset/drop/truncate da base
original. Logs locais ignorados em test-results/phase-02; segredos, certificados,
perfis e mensagens não devem ser publicados.

Reprodução prevista com comandos existentes: npm run verify, exports Expo para
Android/iOS, build da prévia web de avaliações, geração dos três bundles RNW de
teste e suítes Playwright de contas/equipe, estoque, catálogo web/mobile,
desejos/alertas, avaliações e descontos. Build web limpa dist: gerar as prévias
depois dele. Nenhum resultado está aprovado antecipadamente.

Fronteiras preservadas: avaliação exige compra entregue com unidade mantida; o
adaptador padrão retorna UNAVAILABLE e impede publicação. Fixture só é injetada
por código de teste, nunca selecionável por payload/ambiente do produto.
Integração real segue TASK-023; ocultação por devolução segue TASK-026. Saldo da
fase é físico; reservas comerciais e limite de pendentes seguem 016/018/023.
Cupons têm configuração e cálculo, uso/reserva real ainda não integrado; painel
não inventa contadores. Não certificar futuras disputas de estoque/cupom/pedido.

TalkBack recusado pelo responsável: NÃO EXECUTADO. Prévia RNW e exports não são
execução Android/iOS, leitor de tela ou ampliação nativa. Chrome/Edge/iOS e aceite
integral da acessibilidade permanecem sem nova evidência humana nesta fase;
RNF-007/008 e TASK-033 preservados. Não alegar metas de desempenho sem PD-007.
Retenção/backup/anonimização continuam PD-008 e tarefas próprias.

O npm audit bruto continua com achados conhecidos; a política restrita exige
versões, patch/hash e regressões reais e não equivale a auditoria sem achados.
Resultados reais e limites estão registrados abaixo.

## Cobertura e limites do incremento

| Cenário / RNF | Evidência exigida neste checkpoint | Fora do aceite desta fase |
| --- | --- | --- |
| TEST-026 / RNF-004 | Corridas reais de estoque físico, revisão de oferta, fotos, avaliação e configuração de desconto; transações e rollback conjunto; cálculo/rateio exato | Reserva de último usado/cupom, terceiro pendente, pagamento/expiração e pós-venda exigem 016–028/034 |
| TEST-028 / RNF-007/008 | Teclado/foco/rótulos, erros, texto ampliado e layout estreito; componentes RNW e exportações Expo | Leitor de tela, ampliação nativa, execução Android/iOS e demais navegadores não certificados; aceitação integral em 033 |
| TEST-030 / RNF-001/005/010 | Propriedade/papéis, fronteira equipe somente web, HTTPS/origem/CSRF, mensagens protegidas, uploads decodificados/limites/isolamento e auditoria atômica | Evidências privadas de pós-venda e bloqueio/encerramento comercial integrados exigem tarefas próprias |
| RNF-011 | Outbox recuperável/deduplicada e alerta que só encerra após entrega local bem-sucedida; audiência congelada | Eventos de pedidos/pagamentos e jobs comerciais ainda não existem |

O catálogo público usa o preço promocional efetivo inclusive nos filtros, mantendo
preço-base no painel. Disponibilidade pública desta fase usa saldo físico; o
painel distingue vínculos comerciais UNAVAILABLE de saldo disponível zero. Não
trocar ausência de integração por contador/saldo livre fictício. Redução ou
exclusão dependente de vínculo desconhecido permanece negada; histórico/fotos e
respostas de moderação são preservados.

## Resultados executados

Revisão f966775, cujo código de aplicação é idêntico a 2243748; alterações deste
checkpoint são exclusivamente documentais. Comandos acima executados em ordem
por test-results/phase-02/checkpoint.sh, log checkpoint.log, exit 0; nenhuma
tentativa falha nesta rodada. O script não altera fonte rastreada e termina
exigindo checkout de validação limpo. Não houve instalação/dependência nova;
instalação limpa anterior preservada, hashes e regressões de segurança repetidos.

| Gate / suíte | Resultado |
| --- | --- |
| Build contracts/API/web, tipos, lint | PASS |
| Unitários, fonte API Node strip-only e API compilada, segurança/compatibilidade | PASS, 88 casos |
| Integração core / contas / mensagens | PASS, 9 / 14 / 16 |
| Integração catálogo / estoque / desejos / avaliações / descontos | PASS, 19 / 12 / 12 / 11 / 12 |
| E2E contas/equipe / estoque | PASS, 7 / 2 |
| E2E catálogo web / mobile compartilhado RNW | PASS, 3 / 3 |
| E2E desejos / avaliações / descontos | PASS, 2 / 3 / 2 |
| Exportação Android / iOS | PASS, 605 / 607 módulos, sem alegar execução nativa |
| Política restrita de toolchain, patch/hashes e regressões | PASS |
| npm audit bruto | FAIL/exit 1, sete low deepmerge; zero moderate/high/critical; relatório preservado |
| Escopo, índice e grafo de dependências | PASS, 37 tarefas / 79 arestas, sem ciclos |

Total: 215 casos distintos = 88 unitários + 105 integrações + 22 E2E. Repetir
casos no checkpoint não aumenta essa contagem. HTTPS usa CA isolada confiável;
negativa sem CA também PASS. Sem redução de scrypt, bypass TLS, relógio público,
fixture selecionável no produto, remoção de teste ou ampliação de escopo.

Schemas de integração preservados em garimpo_test:

- task003_00a4eb2f9ba247f3afcee47d6c984e9b
- task004_cb03d1f9548b42a3a86adae54d83b52d
- task005_d64235a7a6014a9fa23624370cd06d61
- task008_3ad7526181fe4afa87e7cc7fa1c0f593
- task009_3462eb6e96f14e8a97fe3d9d07c5207f
- task012_6d6d3a64fe654f73b46ce41498527280
- task013_a3ce15a4d9eb41b899dcd5c1973cd804
- task014_503a5f4118cb4ee08f490a588c2aa307

Cada harness de UI gerou outro schema task006_ UUID independente, seus perfis,
CA e dados inventados, preservados localmente com acesso restrito. Nenhum túnel
público/serviço externo de mensagens foi iniciado. O teste de relay usa somente
loopback e HTTPS real; não é nova publicação de dados. Cluster original e ZIP
anterior do responsável preservados.

## TASK Execution Report

TASK: TASK-015. Status: DONE. Branch: chore/TASK-015-checkpoint-phase02.
Commits: f966775 inicia o checkpoint; fechamento documental verificável no Git.
Transições: BLOCKED → READY → IN_PROGRESS → IN_REVIEW → DONE.

Primary Changes: este documento e somente trechos operacionais/índice da TASK-015
em TASKS.md. Incidental Changes: NONE. Nenhum código, teste, configuração,
dependência, migration ou requisito alterado.

Tests Executed: npm run verify; Vite build da prévia de reviews; Expo export
Android/iOS e export:embed de três entradas RNW; sete configs Playwright
(account, inventory, catalog-web, catalog-mobile, engagement, reviews, pricing).
Ambiente, resultados e limitações acima. Não há evidência nova de leitor,
dispositivo real, Chrome/Edge, desempenho, backup ou restauração.

Quality Gates: Build PASS; Lint PASS; Unit Tests PASS; Integration Tests PASS;
API Tests PASS; Security PASS na política restrita e negativas executadas, com
npm audit bruto FAIL explicitamente preservado; Acceptance Criteria PASS no
incremento da fase e nas fronteiras futuras negadas; Regression Tests PASS.

Scope Validation: Allowed Changes PASS; Incidental Changes NONE; Forbidden
Changes PASS; Scope Creep NONE. Definition of Done PASS. 15/37 TASKs DONE.
Next Eligible TASK: TASK-016 candidata, dependências 015/014 satisfeitas; exige
DoR/contratos/Scope Guard/branch próprios antes de iniciar. Continuidade
explicitamente autorizada até pelo menos 28/37, sem saltar o checkpoint 024.
