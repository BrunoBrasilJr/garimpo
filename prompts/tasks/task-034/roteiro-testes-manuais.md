# TASK-034 — roteiro de testes manuais

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

### TEST-010-P — Manter carrinho e iniciar reserva — sucesso

TESTE: TEST-010-P

Objetivo: verificar manter carrinho e iniciar reserva — sucesso no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Montar carrinho visitante e autenticado sem reservar; mesclar novos/usados; iniciar checkout e conferir mesmo recurso em dois dispositivos.
2. Disputar último usado e cupom com dois clientes; conferir reserva todos-ou-nenhum, expiração 15min, liberação e reinício por itens/cupom; endereço não renova prazo.

Resultado esperado: Carrinho não reserva; mescla avisada ao login; checkout único de 15 minutos reserva todos ou nenhum; outra aba retoma mesmo prazo.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-010-N — Manter carrinho e iniciar reserva — negativas/alternativas

TESTE: TEST-010-N

Objetivo: verificar manter carrinho e iniciar reserva — negativas/alternativas no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Montar carrinho visitante e autenticado sem reservar; mesclar novos/usados; iniciar checkout e conferir mesmo recurso em dois dispositivos.
2. Disputar último usado e cupom com dois clientes; conferir reserva todos-ou-nenhum, expiração 15min, liberação e reinício por itens/cupom; endereço não renova prazo.

Resultado esperado: Falta de item aborta reserva completa; mudança comercial reinicia validação; endereço não reinicia prazo.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-011-P — Cotar e criar pedido — sucesso

TESTE: TEST-011-P

Objetivo: verificar cotar e criar pedido — sucesso no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Com e-mail confirmado e CEP coberto, cotar e criar Pix/boleto; conferir snapshots e vencimentos integrais 30min/2 dias da criação.
2. Tentar sem confirmação, CEP não atendido e quarto pendente; conferir negação e checkout mantido até prazo; alterar tabela/endereço e verificar histórico/prazo.

Resultado esperado: Cotação por CEP inclui cobertura; congela produtos/descontos no checkout; cria pedido Pix/boleto com novo prazo próprio; snapshots e cupom não se perdem.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-011-N — Cotar e criar pedido — negativas/alternativas

TESTE: TEST-011-N

Objetivo: verificar cotar e criar pedido — negativas/alternativas no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Com e-mail confirmado e CEP coberto, cotar e criar Pix/boleto; conferir snapshots e vencimentos integrais 30min/2 dias da criação.
2. Tentar sem confirmação, CEP não atendido e quarto pendente; conferir negação e checkout mantido até prazo; alterar tabela/endereço e verificar histórico/prazo.

Resultado esperado: CEP não atendido impede pedido e conserva checkout até prazo; mudança de frete exige aceite.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-012-P — Simular pagamentos — sucesso

TESTE: TEST-012-P

Objetivo: verificar simular pagamentos — sucesso no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Acionar cenários locais aprovação, recusa e pendência; conferir cartão recusado sem pedido e aprovação válida criando pedido pago.
2. Concorrer aprovação com expiração; repetir evento e pagar cobrança invalidada; conferir estorno separado inclusive cartão tardio sem pedido; forçar falha/repetição do estorno.

Resultado esperado: Recusa de cartão não cria pedido; Pix 30 min/boleto 2 dias; tardio estorna sem reativar; cobrança substituída nunca quita; falha de estorno permanece visível.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-012-N — Simular pagamentos — negativas/alternativas

TESTE: TEST-012-N

Objetivo: verificar simular pagamentos — negativas/alternativas no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Acionar cenários locais aprovação, recusa e pendência; conferir cartão recusado sem pedido e aprovação válida criando pedido pago.
2. Concorrer aprovação com expiração; repetir evento e pagar cobrança invalidada; conferir estorno separado inclusive cartão tardio sem pedido; forçar falha/repetição do estorno.

Resultado esperado: Repetição não duplica efeito; vencimento não depende do job; recusa não renova prazo.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-018-P — Controlar estoque — sucesso

TESTE: TEST-018-P

Objetivo: verificar controlar estoque — sucesso no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Ajustar saldo de novos e usado individual; conferir movimentos, saldo disponível e alerta de limiar/zero somente no painel.
2. Tentar saldo negativo ou ajuste invadindo reserva; repetir movimento e concorrer última unidade; avaria resolve vínculo sem liberar venda indevida.

Resultado esperado: Saldo nunca negativo; usado individual; ajuste não invade reservas; avaria resolve vínculo; limiar de novos por edição e zero usados alertam apenas no painel.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-018-N — Controlar estoque — negativas/alternativas

TESTE: TEST-018-N

Objetivo: verificar controlar estoque — negativas/alternativas no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Ajustar saldo de novos e usado individual; conferir movimentos, saldo disponível e alerta de limiar/zero somente no painel.
2. Tentar saldo negativo ou ajuste invadindo reserva; repetir movimento e concorrer última unidade; avaria resolve vínculo sem liberar venda indevida.

Resultado esperado: Reserva existente exige resolver compra antes de perda/avaria; repetição não duplica movimento.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-019-P — Administrar promoções e cupons — sucesso

TESTE: TEST-019-P

Objetivo: verificar administrar promoções e cupons — sucesso no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Criar promoções sobrepostas e cupom com alvo/mínimo; conferir menor preço, acumulação configurada e desconto apenas elegíveis pós-promoção.
2. Disputar último uso, testar cupom inaplicável/fixo maior que subtotal e conferir frete; cancelar versus devolver para conferir restituição distinta de uso.

Resultado esperado: Menor promoção vence; cupom pode acumular se autorizado; restrições por produto/edição/gênero; reserva no checkout respeita limites concorrentes; devolução não restitui uso.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-019-N — Administrar promoções e cupons — negativas/alternativas

TESTE: TEST-019-N

Objetivo: verificar administrar promoções e cupons — negativas/alternativas no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Criar promoções sobrepostas e cupom com alvo/mínimo; conferir menor preço, acumulação configurada e desconto apenas elegíveis pós-promoção.
2. Disputar último uso, testar cupom inaplicável/fixo maior que subtotal e conferir frete; cancelar versus devolver para conferir restituição distinta de uso.

Resultado esperado: Cupom inaplicável informa motivo; fixo não gera negativo/crédito; frete permanece.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-021-P — Consultar e administrar clientes — sucesso

TESTE: TEST-021-P

Objetivo: verificar consultar e administrar clientes — sucesso no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. OPERATOR consulta cliente, tenta editar/bloquear e deve ser negado; ADMIN bloqueia cliente com checkout/pendentes.
2. Conferir cancelamento/liberação atômicos e sessão inválida; manter pagos/atendimento; concorrer pagamento com bloqueio sem efeitos duplicados.

Resultado esperado: OPERATOR não altera/bloqueia; ADMIN bloqueia login, checkout e pendentes atomicamente, preservando pagos e atendimento; correção de e-mail exige confirmação.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-021-N — Consultar e administrar clientes — negativas/alternativas

TESTE: TEST-021-N

Objetivo: verificar consultar e administrar clientes — negativas/alternativas no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. OPERATOR consulta cliente, tenta editar/bloquear e deve ser negado; ADMIN bloqueia cliente com checkout/pendentes.
2. Conferir cancelamento/liberação atômicos e sessão inválida; manter pagos/atendimento; concorrer pagamento com bloqueio sem efeitos duplicados.

Resultado esperado: Reativação voluntária não remove bloqueio; tokens antigos não contornam estado da conta.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-023-P — Consultar relatórios — sucesso

TESTE: TEST-023-P

Objetivo: verificar consultar relatórios — sucesso no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Preparar pagamento em setembro e estorno em outubro com relógio de teste; consultar períodos e asOf.
2. Conferir evento negativo outubro, coorte setembro ajustada, produto gratuito mantido, exclusão sem unidades mantidas, gênero principal único; troca e tardio não geram venda.

Resultado esperado: Pagamento setembro/estorno outubro ficam em períodos próprios; ticket setembro usa líquido atualizado; gênero principal evita duplicação; unidades gratuitas mantidas contam; troca não é venda nova.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-023-N — Consultar relatórios — negativas/alternativas

TESTE: TEST-023-N

Objetivo: verificar consultar relatórios — negativas/alternativas no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Preparar pagamento em setembro e estorno em outubro com relógio de teste; consultar períodos e asOf.
2. Conferir evento negativo outubro, coorte setembro ajustada, produto gratuito mantido, exclusão sem unidades mantidas, gênero principal único; troca e tardio não geram venda.

Resultado esperado: Período sem pedidos não divide por zero; volume/meta de desempenho permanecem pendentes.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-026-C — Concorrência e dinheiro — cenário transversal

TESTE: TEST-026-C

Objetivo: verificar concorrência e dinheiro — cenário transversal no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

### TEST-027-C — Desempenho — cenário transversal

TESTE: TEST-027-C

Objetivo: verificar desempenho — cenário transversal no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Fixar volume, concorrência, ambiente, métricas, amostra e limites conforme PD-007 antes da execução.
2. Responsável inicia carga das operações aplicáveis busca/reserva/cotação/pedido/pagamento/relatório; registrar distribuição e comparar metas ratificadas, sem importar números antigos.

Resultado esperado: Definir PD-007 antes de medir: volume, concorrência, ambiente, amostra, métrica e limites. Medir busca, reserva, cotação, pedido, pagamento e relatórios; registrar amostras e distribuição. Não importar metas numéricas da versão superada nem declarar sucesso sem critério definido.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-031-C — Retomada de processamento — cenário transversal

TESTE: TEST-031-C

Objetivo: verificar retomada de processamento — cenário transversal no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

### ACEITE-034 — Aceite específico do incremento

TESTE: ACEITE-034

Objetivo: verificar aceite específico do incremento no recorte de TASK-034.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-032 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Resultado esperado: Metas/ambiente fixados antes da medição; resultados reais e amostras registrados; não usar antigos 2s/5 usuários como requisito aprovado. PD-007 antes de medir: volume, metas, método, ambiente e amostras. Incluir TEST-027 de desempenho e TEST-026/031 de concorrência/retomada previstos na estratégia, além da enumeração da TASK. Disputas reais e resultados persistidos, sem mocks sequenciais ou metas 2s/5 usuários herdadas.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

## Contagem e gate manual

Inventário inicial: 18 casos agrupados; expandir subcasos antes da execução e atualizar denominador sem apagar IDs/histórico.

```text
TESTES PREVISTOS: 18
TESTES EXECUTADOS: 0
TESTES APROVADOS: 0
TESTES REPROVADOS: 0
TESTES BLOQUEADOS: 0
TESTES PENDENTES: 18
GATE — TESTES MANUAIS: PENDENTE
PRÓXIMA ETAPA: BLOQUEADA
```

Após cada caso atualizar: executados = aprovados + reprovados; previstos = executados + bloqueados + pendentes (categorias exclusivas no retrato atual; histórico de tentativas separado). Caso obrigatório fora de recorte só pode sair do denominador com motivo, fonte e TASK de validação futura; nunca para ocultar falha.

Gate só APROVADO quando todos os subcasos obrigatórios tiverem evidência de execução manual e aprovação, sem reprovação/bloqueio/pendência. Execução automática do agente não substitui esta etapa. Sem retorno do responsável, aguardar evidência; não marcar DONE.

## TRATAMENTO DE FALHAS

Interromper avanço; registrar operação/comando, ambiente, código de saída, erro completo sem segredos e evidência. Separar FATO CONFIRMADO, EVIDÊNCIA, INFERÊNCIA, HIPÓTESE e PENDÊNCIA. Diagnosticar causa e avaliar Allowed/Forbidden/Incidental. Fazer somente menor correção autorizada; repetir a validação afetada e atualizar o gate, invalidando gates posteriores dependentes. Em revisão somente de leitura ou teste manual, devolver correção à etapa autorizada e revisar novamente. Produção proibida nesta TASK não pode ser corrigida nela. Erro de execução/validação: FAILED conforme AGENTS; dependência/decisão externa ausente: BLOCKED. Nenhum teste vira APROVADO sem reexecução manual. Preservar trabalho e não remover teste, desativar validação nem trocar concorrência real por mock sequencial.

Teste reprovado → diagnóstico → causa → correção na etapa/escopo autorizado → revisão da correção → reexecução manual pelo responsável. Registrar o que falhou, o que corrigiu, o que precisa repetir e o que falta. Fora de Allowed ou dentro de Forbidden: usar SCOPE ESCALATION de AGENTS com TASK, necessidade, causa, caminhos, limites, risco, alternativas, recomendação e decisão; aguardar sem avançar.
