# TASK-028 — roteiro de testes manuais

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

### TEST-014-P — Cancelar pedidos e unidades indisponíveis — sucesso

TESTE: TEST-014-P

Objetivo: verificar cancelar pedidos e unidades indisponíveis — sucesso no recorte de TASK-028.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-025, TASK-026, TASK-027 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

Objetivo: verificar cancelar pedidos e unidades indisponíveis — negativas/alternativas no recorte de TASK-028.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-025, TASK-026, TASK-027 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

Objetivo: verificar processar devoluções — sucesso no recorte de TASK-028.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-025, TASK-026, TASK-027 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

Objetivo: verificar processar devoluções — negativas/alternativas no recorte de TASK-028.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-025, TASK-026, TASK-027 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

Objetivo: verificar processar trocas — sucesso no recorte de TASK-028.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-025, TASK-026, TASK-027 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

Objetivo: verificar processar trocas — negativas/alternativas no recorte de TASK-028.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-025, TASK-026, TASK-027 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

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

### ACEITE-028 — Aceite específico do incremento

TESTE: ACEITE-028

Objetivo: verificar aceite específico do incremento no recorte de TASK-028.

Pré-condições: gates anteriores aprovados; autorização da TASK; dependências TASK-025, TASK-026, TASK-027 verificadas; cenário aplicável ao incremento; fixtures/atores de teste e revisão identificados. Pré-condições específicas: preparar estados descritos no resultado esperado abaixo, preservando invariantes.

Comandos: [DEFINIR a partir de manifest/scripts/contrato reais no planejamento; inexistentes nesta geração. Para caso documental: leitura e comparação das fontes, sem comando de aplicação. Não executar enquanto comando necessário estiver indefinido.]

Procedimento:
1. Registrar ambiente, responsável, revisão, dados/IDs e estado inicial; preparar fixture isolada que satisfaça pré-condições específicas do cenário.
2. Desdobrar cada condição da expectativa abaixo em subcaso, indicando operação API/tela/documento, ator, entrada e resultado; executar manualmente essas operações na sequência exigida pelo fluxo. Para negativa, alterar somente a condição sob teste e repetir a mesma ação; conferir ausência do efeito indevido.
3. Conferir resultado esperado contra resposta/tela/documento e estado persistido; registrar cada subcaso, saída/exit code, diferenças e evidência. Aplicar fronteiras, repetição ou concorrência real quando previstas no cenário; não declarar grupo aprovado por verificar só um trecho.

Resultado esperado: OPERATOR não recebe controles ADMIN; cliente vê falha de reembolso; atendimento de bloqueado registrado via e-mail externo; evidências privadas e acessíveis só a envolvidos. Cliente solicita/acompanha, envia evidências e aceita substituto; equipe opera somente web. OPERATOR sem controles de estorno/exceção ADMIN e API também nega. Mostrar falha de reembolso; bloqueado atendido por e-mail externo auditado; evidências apenas envolvidos.

Resultado obtido: [PREENCHER MANUALMENTE]

Evidência: [PREENCHER MANUALMENTE — caminho/referência, comando/saída, ambiente, data, autor e revisão; remover segredos]

STATUS:
- [x] NÃO EXECUTADO
- [ ] APROVADO
- [ ] REPROVADO
- [ ] BLOQUEADO

## Contagem e gate manual

Inventário inicial: 7 casos agrupados; expandir subcasos antes da execução e atualizar denominador sem apagar IDs/histórico.

```text
TESTES PREVISTOS: 7
TESTES EXECUTADOS: 0
TESTES APROVADOS: 0
TESTES REPROVADOS: 0
TESTES BLOQUEADOS: 0
TESTES PENDENTES: 7
GATE — TESTES MANUAIS: PENDENTE
PRÓXIMA ETAPA: BLOQUEADA
```

Após cada caso atualizar: executados = aprovados + reprovados; previstos = executados + bloqueados + pendentes (categorias exclusivas no retrato atual; histórico de tentativas separado). Caso obrigatório fora de recorte só pode sair do denominador com motivo, fonte e TASK de validação futura; nunca para ocultar falha.

Gate só APROVADO quando todos os subcasos obrigatórios tiverem evidência de execução manual e aprovação, sem reprovação/bloqueio/pendência. Execução automática do agente não substitui esta etapa. Sem retorno do responsável, aguardar evidência; não marcar DONE.

## TRATAMENTO DE FALHAS

Interromper avanço; registrar operação/comando, ambiente, código de saída, erro completo sem segredos e evidência. Separar FATO CONFIRMADO, EVIDÊNCIA, INFERÊNCIA, HIPÓTESE e PENDÊNCIA. Diagnosticar causa e avaliar Allowed/Forbidden/Incidental. Fazer somente menor correção autorizada; repetir a validação afetada e atualizar o gate, invalidando gates posteriores dependentes. Em revisão somente de leitura ou teste manual, devolver correção à etapa autorizada e revisar novamente. Produção proibida nesta TASK não pode ser corrigida nela. Erro de execução/validação: FAILED conforme AGENTS; dependência/decisão externa ausente: BLOCKED. Nenhum teste vira APROVADO sem reexecução manual. Preservar trabalho e não remover teste, desativar validação nem trocar concorrência real por mock sequencial.

Teste reprovado → diagnóstico → causa → correção na etapa/escopo autorizado → revisão da correção → reexecução manual pelo responsável. Registrar o que falhou, o que corrigiu, o que precisa repetir e o que falta. Fora de Allowed ou dentro de Forbidden: usar SCOPE ESCALATION de AGENTS com TASK, necessidade, causa, caminhos, limites, risco, alternativas, recomendação e decisão; aguardar sem avançar.
