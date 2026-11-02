# Checkpoint PHASE-02 — TASK-015

Estado: IN_PROGRESS em 2026-11-02. Branch real chore/TASK-015-checkpoint-phase02,
base 2243748. Dependências TASK-009 a TASK-014 DONE, ADR-001/004/006 ACCEPTED e
PD-006 resolvida por decisão delegada, sem atribuir novas respostas ao PDF.
Continuidade explicitamente autorizada até pelo menos 28/37 tarefas.

Este checkpoint altera somente este documento e TASKS.md. Incidental Changes:
NONE. Não implementa carrinho, checkout, compra, backup ou novas migrations.

Os gates acumulados da implementação serão executados no checkout Git Linux
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
Resultados, limites e relatório final serão registrados após execução.
