# TASK-007 — roteiro de testes manuais

MODELO PARA USO FUTURO. A solicitação de 2026-10-25 autoriza apenas gerar estes documentos. Ler, copiar ou receber este arquivo não autoriza executar a TASK. Exigir autorização explícita futura do responsável, específica à TASK ou continuidade expressa, antes de iniciar. Gate aprovado habilita somente a próxima etapa da mesma TASK; não autoriza a próxima TASK. Não executar automaticamente a etapa seguinte.

Estado: PLANEJADO / NÃO EXECUTADO. Responsável pela execução: responsável pelo projeto; nome/data ainda não registrados. IDs locais sufixados P/N/C identificam casos do TEST original, sem renumerar TEST-001 a TEST-035.

## Preparação e execução pelo responsável

1. Confirmar autorização, gates anteriores, revisão de código/arquivos e escopo do incremento. Ler critérios/TEST de `TASKS.md`, `README.md` e `docs/architecture/testing.md`. Cada oração de resultado abaixo deve virar subcaso atômico quando envolver mais de uma ação; não aprovar grupo se um subcaso faltar. Recalcular totais depois do desdobramento.
2. Ambiente pedido: Windows → WSL → Linux. No PowerShell, o responsável consulta `wsl --status` e `wsl --list --verbose`, entra na distribuição Linux disponível e confirma diretório do projeto por `pwd`. Não presumir distribuição nem caminho: Windows C: pode estar em `/mnt/c`, mas conferir montagem antes de usar. Não instalar nada automaticamente. WSL indisponível bloqueia testes que dele dependem; TASK-001 limita-se à leitura documental, sem runtime.
3. No Linux, localizar manifests/scripts/configurações reais e versões ratificadas em TASK-001/002; registrar comandos exatos e saída esperada antes de rodar. Não há comandos de aplicação verificáveis nesta geração. Para revisão documental, abrir fontes e comparar alterações; não é necessário build/banco. Para aplicação, usar banco de teste separado, mensagens/simulador de teste e dados descartáveis, nunca produção.
4. Preencher matriz de execução: comando | diretório | pré-requisito/versão | fixture | saída/exit code esperado | evidência. Comando ainda ausente = BLOQUEADO até ser definido, nunca substituir por `npm test` presumido. Build/tipos/lint e suites unitárias/integração/API/segurança/regressão aplicáveis são acionados e acompanhados manualmente, somados às verificações de tela e estado.
5. Se script for necessário, voltar à etapa autorizada: caminho dentro de Allowed Changes, preflight de versões/serviços/destinos, interrupção em falha, captura de código de saída e evidência sem segredos, repetição idempotente e limpeza só de fixtures próprias. Sem tecnologia/comando real ou caminho permitido, não criar shell fictício; escalar a lacuna. Nesta geração nenhum script de aplicação é necessário ou criado.
6. Para casos de API, escolher operações ativas correspondentes em `docs/architecture/api.md`, preencher URL do ambiente de teste, payload, ator e status esperado; não usar DEPRECATED ou expor token no log. Para UI, executar passos nos clientes/plataformas ratificadas e conferir resposta e persistência. Comparar antes/depois no servidor, sem editar dados de negócio para forçar aprovação.
7. Para prazos, relógio controlado/injetável em ambiente de teste, instantes imediatamente antes/no limite/depois, sem espera real nem controle público. Para corrida, preparar duas conexões/requisições independentes, liberar simultaneamente, registrar respostas e estado final em banco real de teste. Para dinheiro, comparar totais e rateios em centavos e eventos, não só telas. Restauração sempre em destinos separados com origem preservada.
8. Recorte: cenário de fase futura não deve ser exigido como já implementado no módulo atual; registrar subcasos fora do incremento com referência à TASK dona. Não chamar ausência de funcionalidade obrigatória de N/A. Checkpoints reexecutam gates aplicáveis da fase; entrega final verifica todos. Teste obrigatório sem precondição permanece BLOQUEADO.

## Casos previstos

As expectativas abaixo foram extraídas das fontes e do aceite específico; não são resultados obtidos. Desdobrar e preencher operações exatas na etapa de planejamento, após existir aplicação/stack; não implementar funcionalidade futura para executar subcaso fora do incremento.

### TEST-001-P — Cadastrar conta — sucesso

TESTE: TEST-001-P

Objetivo: verificar cadastrar conta — sucesso no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Cadastrar e-mail novo válido como visitante; consultar conta criada USER e mensagem de confirmação.
2. Repetir e-mail e enviar payload com papel ADMIN/OPERATOR; conferir rejeição/ausência de conta privilegiada.

Resultado esperado: Cadastro válido cria USER; e-mail duplicado falha; payload não promove papel; confirmação de e-mail é emitida.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-001-N — Cadastrar conta — negativas/alternativas

TESTE: TEST-001-N

Objetivo: verificar cadastrar conta — negativas/alternativas no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Cadastrar e-mail novo válido como visitante; consultar conta criada USER e mensagem de confirmação.
2. Repetir e-mail e enviar payload com papel ADMIN/OPERATOR; conferir rejeição/ausência de conta privilegiada.

Resultado esperado: Entrada inválida ou e-mail existente não cria segunda conta.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-002-P — Autenticar e encerrar sessão — sucesso

TESTE: TEST-002-P

Objetivo: verificar autenticar e encerrar sessão — sucesso no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Autenticar cliente e interno em contextos próprios; encerrar sessão e repetir requisição com credencial antiga.
2. Repetir login com senha errada, conta blocked/closed e interno tentando checkout; conferir negação sem segredo.

Resultado esperado: Credenciais válidas autenticam no contexto correto; bloqueio/encerramento impedem login; logout revoga sessão; conta interna não compra.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-002-N — Autenticar e encerrar sessão — negativas/alternativas

TESTE: TEST-002-N

Objetivo: verificar autenticar e encerrar sessão — negativas/alternativas no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Autenticar cliente e interno em contextos próprios; encerrar sessão e repetir requisição com credencial antiga.
2. Repetir login com senha errada, conta blocked/closed e interno tentando checkout; conferir negação sem segredo.

Resultado esperado: Credenciais erradas e tokens revogados são negados sem dados sensíveis.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-003-P — Recuperar senha — sucesso

TESTE: TEST-003-P

Objetivo: verificar recuperar senha — sucesso no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Solicitar reset e usar token uma vez antes de 30min; tentar sessão anterior em cada dispositivo.
2. Reusar token e testar antes/no limite/depois de 30min com relógio controlado; simular falha/repetição da mensagem sem revelar existência da conta.

Resultado esperado: Reset válido em até 30 minutos altera senha uma vez e revoga todas as sessões; expirado/reutilizado falha.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-003-N — Recuperar senha — negativas/alternativas

TESTE: TEST-003-N

Objetivo: verificar recuperar senha — negativas/alternativas no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Solicitar reset e usar token uma vez antes de 30min; tentar sessão anterior em cada dispositivo.
2. Reusar token e testar antes/no limite/depois de 30min com relógio controlado; simular falha/repetição da mensagem sem revelar existência da conta.

Resultado esperado: Resposta pública genérica; falha de mensagem permite repetição sem perder conta.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-004-P — Gerenciar perfil e endereços — sucesso

TESTE: TEST-004-P

Objetivo: verificar gerenciar perfil e endereços — sucesso no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Criar dois clientes e endereço; titular altera perfil/endereço; OPERATOR consulta, tenta editar e deve ser negado.
2. Consultar registro histórico do pedido após alterar endereço atual quando pedidos integrarem o incremento; propor novo e-mail e conferir antigo até confirmar.

Resultado esperado: Somente titular edita normalmente; OPERATOR consulta sem editar; endereço histórico não muda; novo e-mail depende de confirmação.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-004-N — Gerenciar perfil e endereços — negativas/alternativas

TESTE: TEST-004-N

Objetivo: verificar gerenciar perfil e endereços — negativas/alternativas no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Criar dois clientes e endereço; titular altera perfil/endereço; OPERATOR consulta, tenta editar e deve ser negado.
2. Consultar registro histórico do pedido após alterar endereço atual quando pedidos integrarem o incremento; propor novo e-mail e conferir antigo até confirmar.

Resultado esperado: Endereço inválido bloqueia compra; e-mail proposto não substitui atual antes da confirmação.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-024-P — Processar notificações de teste — sucesso

TESTE: TEST-024-P

Objetivo: verificar processar notificações de teste — sucesso no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Disparar eventos aplicáveis de acesso e RN-042 no incremento; verificar destinatário, conteúdo protegido e estado da mensagem.
2. Forçar falha do adaptador, repetir evento e reiniciar consumidor; conferir nenhuma duplicação e negócio concluído sem marcar envio falho como sucesso.

Resultado esperado: Todos os eventos de RN-042 geram mensagens; falha não bloqueia negócio; repetição é auditada; conteúdo de acesso e evidências não é público.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-024-N — Processar notificações de teste — negativas/alternativas

TESTE: TEST-024-N

Objetivo: verificar processar notificações de teste — negativas/alternativas no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Disparar eventos aplicáveis de acesso e RN-042 no incremento; verificar destinatário, conteúdo protegido e estado da mensagem.
2. Forçar falha do adaptador, repetir evento e reiniciar consumidor; conferir nenhuma duplicação e negócio concluído sem marcar envio falho como sucesso.

Resultado esperado: Falha de reposição não encerra inscrição; serviço real de produção não é requerido.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-026-C — Concorrência e dinheiro — cenário transversal

TESTE: TEST-026-C

Objetivo: verificar concorrência e dinheiro — cenário transversal no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Preparar duas conexões independentes para cada disputa aplicável: último usado/novo, cupom, terceiro pendente, último ADMIN e unidade em atendimento.
2. Liberar ações simultaneamente, registrar respostas e banco final; repetir eventos/estornos e conferir somas; concorrer pagamento/expiração/bloqueio/cancelamento e oferta/aceite/expiração.

Resultado esperado: Disputar último usado, última unidade nova, uso de cupom e terceiro pedido pendente; somente efeitos permitidos sobrevivem. Concorrer pagamento/expiração/bloqueio/cancelamento, último ADMIN, aceite/expiração de oferta e atendimento por mesma unidade. Somar rateios exatamente; repetir evento e estorno não duplica dinheiro. Cobrir aprovação de cartão sem pedido após expiração e cobrança invalidada após cancelamento parcial.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-028-C — Acessibilidade e paridade — cenário transversal

TESTE: TEST-028-C

Objetivo: verificar acessibilidade e paridade — cenário transversal no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Navegar só por teclado na web, conferir foco/rótulos/erros/contraste; executar fluxos aplicáveis em leitor de tela e texto ampliado no mobile ratificado.
2. Conferir paridade e administração apenas web; recuperar mesmo checkout entre dispositivos sem renovar vencimento.

Resultado esperado: Web: navegar por teclado, foco visível, rótulos, erros claros, contraste e descrições. Mobile: leitor de tela e ampliação de texto sem impedir ações; catálogo/conta/compra/pós-venda nos alvos ratificados. Administração somente web. Sincronizar o mesmo checkout entre dispositivos sem renovar prazo.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-030-C — Segurança e arquitetura — cenário transversal

TESTE: TEST-030-C

Objetivo: verificar segurança e arquitetura — cenário transversal no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Executar matriz de papéis/propriedade com USER A/B, ADMIN e OPERATOR; testar tokens inválidos/expirados/reutilizados e sessão revogada.
2. Concorrer último ADMIN, testar bloqueio/encerramento/reativação, uploads/quantidades e evidências privadas; inspecionar logs e transporte ratificado sem segredos.

Resultado esperado: Negar promoção de papel pública, compra por interno, gestão interna por OPERATOR, evidência alheia e links inválidos/expirados/reutilizados. Proteger último ADMIN em concorrência. Reset revoga todos tokens; bloqueio/encerramento impedem uso anterior; reativação não remove bloqueio. Validar JPEG/PNG/WebP/5 MB/quantidades e logs sem segredos. Configuração de transporte segundo ADR ratificado.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-031-C — Retomada de processamento — cenário transversal

TESTE: TEST-031-C

Objetivo: verificar retomada de processamento — cenário transversal no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Criar recursos/eventos ativos aplicáveis ao incremento; interromper processo, avançar relógio de teste e reiniciar consumidor/jobs.
2. Conferir reconciliação de vencimentos, reenvio/estorno idempotentes e falha sem encerrar alerta; oferta dia 29 mantém 48h e corrida de conversão consistente.

Resultado esperado: Interromper processo com checkout/pedido/oferta/evento ativos; avançar relógio de teste e retomar. Reconciliar vencimentos corretamente e repetir notificações/estornos pendentes sem efeito duplicado. Falha de mensagem não bloqueia negócio nem encerra alerta. Oferta dia 29 mantém 48h completas; confirmar/refutar conversão sob corrida.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-032-P — Gerenciar contas internas — sucesso

TESTE: TEST-032-P

Objetivo: verificar gerenciar contas internas — sucesso no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. ADMIN cria/consulta/atualiza interno e confirma contexto STAFF; OPERATOR e USER tentam mesma ação e devem ser negados.
2. Criar dois ADMIN ativos e desativá-los simultaneamente por conexões distintas; conferir um preservado e trilha sem compra por interno.

Resultado esperado: Criar/editar/bloquear ADMIN/OPERATOR; impedir remoção do último ADMIN ativo; contas internas não compram; e-mail alterado só após confirmar novo.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-032-N — Gerenciar contas internas — negativas/alternativas

TESTE: TEST-032-N

Objetivo: verificar gerenciar contas internas — negativas/alternativas no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. ADMIN cria/consulta/atualiza interno e confirma contexto STAFF; OPERATOR e USER tentam mesma ação e devem ser negados.
2. Criar dois ADMIN ativos e desativá-los simultaneamente por conexões distintas; conferir um preservado e trilha sem compra por interno.

Resultado esperado: Concorrência entre dois bloqueios não pode eliminar todos os administradores.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-034-P — Confirmar e alterar e-mail — sucesso

TESTE: TEST-034-P

Objetivo: verificar confirmar e alterar e-mail — sucesso no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Confirmar conta antes de 24h e conferir reenvio; tentar primeiro pedido sem confirmação; propor novo endereço e-mail e conferir antigo vigente.
2. Usar token de reset no fluxo de confirmação e token expirado/repetido; confirmar novo e-mail concorrendo unicidade e conferir ausência de troca inválida.

Resultado esperado: Confirmação inicial em 24h com reenvio; primeiro pedido exige confirmação; alteração mantém endereço anterior até confirmar novo; unicidade validada.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-034-N — Confirmar e alterar e-mail — negativas/alternativas

TESTE: TEST-034-N

Objetivo: verificar confirmar e alterar e-mail — negativas/alternativas no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Confirmar conta antes de 24h e conferir reenvio; tentar primeiro pedido sem confirmação; propor novo endereço e-mail e conferir antigo vigente.
2. Usar token de reset no fluxo de confirmação e token expirado/repetido; confirmar novo e-mail concorrendo unicidade e conferir ausência de troca inválida.

Resultado esperado: Token de reset não confirma e-mail; repetição/expiração não altera conta. Prazo específico de alteração/reativação em PD-005.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### ACEITE-007 — Aceite específico do incremento

TESTE: ACEITE-007

Objetivo: verificar aceite específico do incremento no recorte de TASK-007.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-003, TASK-004, TASK-005, TASK-006 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Resultado esperado: Gates da fase executados, último ADMIN e tokens testados; nenhuma lacuna impeditiva da fase mascarada. Checkpoint de fundação e contas: reunir evidências reais de TASK-003 a TASK-006, incluindo tokens e último ADMIN concorrente. Reexecutar gates acumulados aplicáveis da fase; não alterar produção para corrigir falhas.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

## Contagem e gate manual

Inventário inicial: 19 casos agrupados; expandir subcasos antes da execução e atualizar denominador sem apagar IDs/histórico.

```text
TESTES PREVISTOS: 19
TESTES EXECUTADOS: 0
TESTES APROVADOS: 0
TESTES REPROVADOS: 0
TESTES BLOQUEADOS: 0
TESTES PENDENTES: 19
GATE — TESTES MANUAIS: PENDENTE
PRÓXIMA ETAPA: BLOQUEADA
```

Após cada caso atualizar: executados = aprovados + reprovados; previstos = executados + bloqueados + pendentes (categorias exclusivas no retrato atual; histórico de tentativas separado). Caso obrigatório fora de recorte só pode sair do denominador com motivo, fonte e TASK de validação futura; nunca para ocultar falha.

Gate só APROVADO quando todos os subcasos obrigatórios tiverem evidência de execução manual e aprovação, sem reprovação/bloqueio/pendência. Execução automática do agente não substitui esta etapa. Sem retorno do responsável, aguardar evidência; não marcar DONE.

## TRATAMENTO DE FALHAS

Interromper avanço; registrar operação/comando, ambiente, código de saída, erro completo sem segredos e evidência. Separar FATO CONFIRMADO, EVIDÊNCIA, INFERÊNCIA, HIPÓTESE e PENDÊNCIA. Diagnosticar causa e avaliar Allowed/Forbidden/Incidental. Fazer somente menor correção autorizada; repetir a validação afetada e atualizar o gate, invalidando gates posteriores dependentes. Em revisão somente de leitura ou teste manual, devolver correção à etapa autorizada e revisar novamente. Produção proibida nesta TASK não pode ser corrigida nela. Erro de execução/validação: FAILED conforme AGENTS; dependência/decisão externa ausente: BLOCKED. Nenhum teste vira APROVADO sem reexecução manual. Preservar trabalho e não remover teste, desativar validação nem trocar concorrência real por mock sequencial.

Teste reprovado → diagnóstico → causa → correção na etapa/escopo autorizado → revisão da correção → reexecução manual pelo responsável. Registrar o que falhou, o que corrigiu, o que precisa repetir e o que falta. Fora de Allowed ou dentro de Forbidden: usar SCOPE ESCALATION de AGENTS com TASK, necessidade, causa, caminhos, limites, risco, alternativas, recomendação e decisão; aguardar sem avançar.
