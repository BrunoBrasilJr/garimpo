# TASK-032 — roteiro de testes manuais

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

### TEST-009-P — Avaliar compra verificada — sucesso

TESTE: TEST-009-P

Objetivo: verificar avaliar compra verificada — sucesso no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Usar pedido entregue com duas unidades da mesma edição; publicar e tentar segunda avaliação na mesma chave; devolver uma e conferir manutenção.
2. Devolver todas e conferir ocultação/inelegibilidade; tentar outro autor, compra não entregue e edição de review ocultada; testar nova compra em outro pedido.

Resultado esperado: Uma avaliação por cliente/edição/pedido; troca não cria outra; devolução integral da edição oculta e impede nova; edição de ocultada aguarda moderação.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-009-N — Avaliar compra verificada — negativas/alternativas

TESTE: TEST-009-N

Objetivo: verificar avaliar compra verificada — negativas/alternativas no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Usar pedido entregue com duas unidades da mesma edição; publicar e tentar segunda avaliação na mesma chave; devolver uma e conferir manutenção.
2. Devolver todas e conferir ocultação/inelegibilidade; tentar outro autor, compra não entregue e edição de review ocultada; testar nova compra em outro pedido.

Resultado esperado: Compra não entregue ou totalmente desfeita é inelegível; outro autor não edita.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-012-P — Simular pagamentos — sucesso

TESTE: TEST-012-P

Objetivo: verificar simular pagamentos — sucesso no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

Objetivo: verificar simular pagamentos — negativas/alternativas no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

### TEST-014-P — Cancelar pedidos e unidades indisponíveis — sucesso

TESTE: TEST-014-P

Objetivo: verificar cancelar pedidos e unidades indisponíveis — sucesso no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Cancelar PENDING e PAID antes de PREPARING; conferir liberação única e estorno quando pago.
2. Cancelar parte por indisponibilidade mantendo restantes/frete/cupom/vencimento, pagar cobrança antiga e verificar estorno separado; tentar cancelamento direto após PREPARING e simular falha financeira.

Resultado esperado: Cancelamento permitido libera estoque/cupom uma vez; pago estorna; indisponibilidade parcial preserva restantes e vencimento; parcial não recupera cupom/frete.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-014-N — Cancelar pedidos e unidades indisponíveis — negativas/alternativas

TESTE: TEST-014-N

Objetivo: verificar cancelar pedidos e unidades indisponíveis — negativas/alternativas no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Cancelar PENDING e PAID antes de PREPARING; conferir liberação única e estorno quando pago.
2. Cancelar parte por indisponibilidade mantendo restantes/frete/cupom/vencimento, pagar cobrança antiga e verificar estorno separado; tentar cancelamento direto após PREPARING e simular falha financeira.

Resultado esperado: Em separação usa devolução; cobrança antiga paga após substituição gera estorno separado; falha financeira não reabre pedido.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-015-P — Processar devoluções — sucesso

TESTE: TEST-015-P

Objetivo: verificar processar devoluções — sucesso no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Abrir devolução por unidade no prazo após entrega; aprovar, registrar postagem, receber e inspecionar; ADMIN autoriza líquido e frete quando integral.
2. Tentar OPERATOR autorizando estorno/exceção, evidência alheia e postagem vencida; rejeitar inspeção e conferir ausência de reposição e reenvio por conta da loja; parciais sucessivas dependem PD-009.

Resultado esperado: Parcial estorna líquido; integral inclui frete; postagem em 7 dias; exceção só ADMIN; estorno pós-venda só ADMIN; evidências privadas; rejeitado não volta ao estoque.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-015-N — Processar devoluções — negativas/alternativas

TESTE: TEST-015-N

Objetivo: verificar processar devoluções — negativas/alternativas no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Abrir devolução por unidade no prazo após entrega; aprovar, registrar postagem, receber e inspecionar; ADMIN autoriza líquido e frete quando integral.
2. Tentar OPERATOR autorizando estorno/exceção, evidência alheia e postagem vencida; rejeitar inspeção e conferir ausência de reposição e reenvio por conta da loja; parciais sucessivas dependem PD-009.

Resultado esperado: Postagem ocorrida antes de análise muda para retorno após entrega; divergência pode rejeitar e exigir reenvio ao cliente.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-016-P — Processar trocas — sucesso

TESTE: TEST-016-P

Objetivo: verificar processar trocas — sucesso no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Registrar conferência favorável e controlar espera 30 dias; ofertar no dia 29, avançar 48h completas e verificar conversão suspensa enquanto oferta ativa.
2. Aceitar oferta e conferir reserva até inspeção/envio; testar recusa, expiração, falta de postagem e rejeição; converter sem estorno automático autorizado e entregar substituto com nova janela.

Resultado esperado: Espera 30 dias após conferência, oferta 48h completas; aceite necessário; envio após inspeção; falha/expiração libera reserva; conversão não autoriza estorno; substituto inicia nova janela.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-016-N — Processar trocas — negativas/alternativas

TESTE: TEST-016-N

Objetivo: verificar processar trocas — negativas/alternativas no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Registrar conferência favorável e controlar espera 30 dias; ofertar no dia 29, avançar 48h completas e verificar conversão suspensa enquanto oferta ativa.
2. Aceitar oferta e conferir reserva até inspeção/envio; testar recusa, expiração, falta de postagem e rejeição; converter sem estorno automático autorizado e entregar substituto com nova janela.

Resultado esperado: Cliente pode converter em devolução; oferta no dia 29 mantém 48h; original rejeitado é reenviado por conta da loja.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-018-P — Controlar estoque — sucesso

TESTE: TEST-018-P

Objetivo: verificar controlar estoque — sucesso no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

Objetivo: verificar controlar estoque — negativas/alternativas no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

### TEST-020-P — Administrar logística e atendimentos — sucesso

TESTE: TEST-020-P

Objetivo: verificar administrar logística e atendimentos — sucesso no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Equipe avança logística até PREPARING/SEPARATED/SHIPPED/DELIVERED e registra remessa original única.
2. Concorrer atualização, tentar OPERATOR autorizando estorno e separar rastreios de retorno/substituto/reenvio; registrar atendimento externo de bloqueado.

Resultado esperado: Estado em separação bloqueia cancelamento direto; remessa original única; retorno/substituto têm rastreios próprios; interação externa de bloqueado fica auditada.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-020-N — Administrar logística e atendimentos — negativas/alternativas

TESTE: TEST-020-N

Objetivo: verificar administrar logística e atendimentos — negativas/alternativas no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Equipe avança logística até PREPARING/SEPARATED/SHIPPED/DELIVERED e registra remessa original única.
2. Concorrer atualização, tentar OPERATOR autorizando estorno e separar rastreios de retorno/substituto/reenvio; registrar atendimento externo de bloqueado.

Resultado esperado: Atualização concorrente revalida; OPERATOR não autoriza estorno/exceção financeira.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-022-P — Moderar avaliações — sucesso

TESTE: TEST-022-P

Objetivo: verificar moderar avaliações — sucesso no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Publicar review como titular, ocultar como equipe com motivo e consultar como visitante.
2. Editar review ocultada e conferir permanência oculta até liberação; tentar autor alheio e conferir histórico de versões; devolução integral impede nova publicação.

Resultado esperado: Ocultar preserva histórico; edição pelo autor não desfaz moderação; liberação explícita revalida elegibilidade de compra.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-022-N — Moderar avaliações — negativas/alternativas

TESTE: TEST-022-N

Objetivo: verificar moderar avaliações — negativas/alternativas no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Publicar review como titular, ocultar como equipe com motivo e consultar como visitante.
2. Editar review ocultada e conferir permanência oculta até liberação; tentar autor alheio e conferir histórico de versões; devolução integral impede nova publicação.

Resultado esperado: Devolução de todas as unidades não pode ser contornada por liberação manual.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-023-P — Consultar relatórios — sucesso

TESTE: TEST-023-P

Objetivo: verificar consultar relatórios — sucesso no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

Objetivo: verificar consultar relatórios — negativas/alternativas no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

### TEST-024-P — Processar notificações de teste — sucesso

TESTE: TEST-024-P

Objetivo: verificar processar notificações de teste — sucesso no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

Objetivo: verificar processar notificações de teste — negativas/alternativas no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

### TEST-025-P — Executar backup e restaurar — sucesso

TESTE: TEST-025-P

Objetivo: verificar executar backup e restaurar — sucesso no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Conferir política PD-008, gerar backup diário de banco/fotos/evidências privadas com manifesto e verificar referências/bytes.
2. Interromper backup sem perder último válido; restaurar somente em destino isolado e comparar conjunto, retenção e duração; conferir origem intacta.

Resultado esperado: Backup diário automático; recuperação testada periodicamente; política de retenção/destino não inventada; restauração de teste preserva origem.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-025-N — Executar backup e restaurar — negativas/alternativas

TESTE: TEST-025-N

Objetivo: verificar executar backup e restaurar — negativas/alternativas no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Conferir política PD-008, gerar backup diário de banco/fotos/evidências privadas com manifesto e verificar referências/bytes.
2. Interromper backup sem perder último válido; restaurar somente em destino isolado e comparar conjunto, retenção e duração; conferir origem intacta.

Resultado esperado: Falha não elimina último backup íntegro; ausência de parâmetros impede declarar aceite concluído.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-026-C — Concorrência e dinheiro — cenário transversal

TESTE: TEST-026-C

Objetivo: verificar concorrência e dinheiro — cenário transversal no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

Objetivo: verificar acessibilidade e paridade — cenário transversal no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

### TEST-029-C — Backup e restauração — cenário transversal

TESTE: TEST-029-C

Objetivo: verificar backup e restauração — cenário transversal no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Operações específicas do cenário (executar apenas subcasos do incremento; demais têm TASK futura identificada):
1. Gerar conjunto conforme PD-008, interromper execução e validar retenção sem perder último íntegro.
2. Restaurar em banco/diretório separados, comparar linhas/referências/bytes públicos e privados e registrar duração/frequência de teste/destino; confirmar origem preservada.

Resultado esperado: Após PD-008, gerar conjunto íntegro, interromper uma execução sem perder último válido, aplicar retenção definida, restaurar em destino separado e comparar dados, fotos e evidências privadas. Verificar periodicidade de teste e destino, registrar duração sem SLA inventado.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

### TEST-030-C — Segurança e arquitetura — cenário transversal

TESTE: TEST-030-C

Objetivo: verificar segurança e arquitetura — cenário transversal no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

### ACEITE-032 — Aceite específico do incremento

TESTE: ACEITE-032

Objetivo: verificar aceite específico do incremento no recorte de TASK-032.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-028, TASK-029, TASK-030, TASK-031 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Resultado esperado: Gates acumulados e corridas de oferta/aceite/expiração aprovados; todas as notificações RN-042 verificadas. Checkpoint de pós-venda, relatórios, backup e segurança: corrida oferta/aceite/expiração, inspeção/estorno e todas mensagens RN-042. Gates acumulados da fase com banco/serviços de teste reais; corrigir produção fora deste checkpoint exige autorização própria.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

## Contagem e gate manual

Inventário inicial: 27 casos agrupados; expandir subcasos antes da execução e atualizar denominador sem apagar IDs/histórico.

```text
TESTES PREVISTOS: 27
TESTES EXECUTADOS: 0
TESTES APROVADOS: 0
TESTES REPROVADOS: 0
TESTES BLOQUEADOS: 0
TESTES PENDENTES: 27
GATE — TESTES MANUAIS: PENDENTE
PRÓXIMA ETAPA: BLOQUEADA
```

Após cada caso atualizar: executados = aprovados + reprovados; previstos = executados + bloqueados + pendentes (categorias exclusivas no retrato atual; histórico de tentativas separado). Caso obrigatório fora de recorte só pode sair do denominador com motivo, fonte e TASK de validação futura; nunca para ocultar falha.

Gate só APROVADO quando todos os subcasos obrigatórios tiverem evidência de execução manual e aprovação, sem reprovação/bloqueio/pendência. Execução automática do agente não substitui esta etapa. Sem retorno do responsável, aguardar evidência; não marcar DONE.

## TRATAMENTO DE FALHAS

Interromper avanço; registrar operação/comando, ambiente, código de saída, erro completo sem segredos e evidência. Separar FATO CONFIRMADO, EVIDÊNCIA, INFERÊNCIA, HIPÓTESE e PENDÊNCIA. Diagnosticar causa e avaliar Allowed/Forbidden/Incidental. Fazer somente menor correção autorizada; repetir a validação afetada e atualizar o gate, invalidando gates posteriores dependentes. Em revisão somente de leitura ou teste manual, devolver correção à etapa autorizada e revisar novamente. Produção proibida nesta TASK não pode ser corrigida nela. Erro de execução/validação: FAILED conforme AGENTS; dependência/decisão externa ausente: BLOCKED. Nenhum teste vira APROVADO sem reexecução manual. Preservar trabalho e não remover teste, desativar validação nem trocar concorrência real por mock sequencial.

Teste reprovado → diagnóstico → causa → correção na etapa/escopo autorizado → revisão da correção → reexecução manual pelo responsável. Registrar o que falhou, o que corrigiu, o que precisa repetir e o que falta. Fora de Allowed ou dentro de Forbidden: usar SCOPE ESCALATION de AGENTS com TASK, necessidade, causa, caminhos, limites, risco, alternativas, recomendação e decisão; aguardar sem avançar.
