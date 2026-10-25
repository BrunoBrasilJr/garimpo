# TASK-017 — ETAPA 002 — Planejamento e pré-condições

MODELO PARA USO FUTURO. A solicitação de 2026-10-25 autoriza apenas gerar estes documentos. Ler, copiar ou receber este arquivo não autoriza executar a TASK. Exigir autorização explícita futura do responsável, específica à TASK ou continuidade expressa, antes de iniciar. Gate aprovado habilita somente a próxima etapa da mesma TASK; não autoriza a próxima TASK. Não executar automaticamente a etapa seguinte.

## 1. OBJETIVO

Planejamento e pré-condições para TASK-017 — Criar carrinho e reserva nas interfaces. Entregar carrinho visitante/conta, mescla avisada, reserva e recuperação da mesma finalização entre dispositivos.

## 2. CONTEXTO

Estado inicial em 2026-10-25: BLOCKED; fase PHASE-03; prioridade HIGH. Nenhuma TASK foi executada. Não há Git, código, manifests, banco ou testes de aplicação nesta pasta. Caminhos técnicos são futuros, sujeitos à stack ratificada; seis ADRs PROPOSED.

Objetivo específico: Entregar carrinho visitante/conta, mescla avisada, reserva e recuperação da mesma finalização entre dispositivos.

Descrição operacional: Mesclar carrinho com aviso, recuperar mesmo checkout em dispositivos distintos, sem timer por item nem renovação por abrir tela. Confirmar ajustes comerciais a partir da API. Pedido/pagamento completo entra em TASK-020.

Dependências/predecessoras diretas: TASK-016. Conferir seus artefatos e relatórios, não só estados. Bloqueadoras iniciais: TASK-016.

Rastreabilidade: RF-010; RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-028, RN-032, RN-035; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011; UC-010. ADRs: ADR-001, ADR-003.

Pendências ligadas à tarefa (PD-005 também condiciona os módulos técnicos):

| ID | Decisão necessária | Tarefas afetadas |
| --- | --- | --- |
| PD-005 | Parâmetros técnicos: Ratificar stack herdada, versões, sessão, hash, proteção das mensagens, armazenamento, prazo de links de alteração/reativação e estratégia transacional. Reset 30min, confirmação inicial 24h e limites de imagens já decididos. | TASK-001 e módulos dependentes |

Matriz de domínio/API do README (referência de análise, não expansão de escopo):

| RF | RNs | RNFs | UC | Entidades | API | Testes | TASKs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RF-010 | RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-028, RN-032, RN-035 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011 | UC-010 | Cart, CartItem, Checkout, CheckoutItem, Reservation | API-010.* | TEST-010 | TASK-016, TASK-017, TASK-018, TASK-023, TASK-033, TASK-034 |

Critérios de aceite da fonte: Carrinho não bloqueia saldo; mudança comercial requer confirmação; timer pertence ao checkout, não ao item. Tratamento de retorno da API sem assumir reserva local.

## 3. PRÉ-CONDIÇÕES

- Autorização explícita futura identificada e Scope Guard vigente lido.
- GATE-001 e todos seus predecessores aprovados com evidência atual; falta de relatório bloqueia esta etapa.
- DEPENDS_ON: TASK-016; checkpoint anterior e artefatos conferidos. A geração não satisfez essas dependências.
- Ambiente, baseline e decisões compatíveis com o recorte da etapa; nenhuma hipótese usada como fato. TASK-001 resolve suas próprias propostas sem implementação.

## 4. ENTRADAS NECESSÁRIAS

Ler os arquivos atuais nesta ordem: `AGENTS.md` e `docs/architecture/conciliacao.md`; `README.md`; `TASKS.md` (índice, seção TASK-017, dependências e Scope Guard); ADRs relacionados em `docs/adr/`, `docs/architecture/architecture.md`, `api.md`, `data-model.md`, `testing.md`, `parametros.md` e diagramas relevantes; depois código/testes dos módulos afetados quando existirem. Conferir respostas de origem em `docs/sources/elicitacao-final.md` nas regras relacionadas. Recuperar autorização, plano, histórico e relatórios anteriores; ausência deve ser registrada. Consultar `roteiro-testes-manuais.md` desta pasta.

## 5. ARQUIVOS E COMPONENTES ENVOLVIDOS

ALLOWED CHANGES da TASK (limites de caminho **e finalidade**, não autorização automática desta etapa):

- apps/web/src/features/cart/**
- apps/mobile/src/features/cart/**
- tests/e2e/cart/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

Foco de componentes/impactos: Mesclar carrinho com aviso, recuperar mesmo checkout em dispositivos distintos, sem timer por item nem renovação por abrir tela. Confirmar ajustes comerciais a partir da API. Pedido/pagamento completo entra em TASK-020.

Na etapa 001 apenas leitura; planejamento não altera produção; revisão apenas leitura; execução manual altera somente dados de teste e evidência autorizada. Planejar explicitamente impactos em arquitetura, persistência, APIs, interfaces, segurança e testes; N/A precisa de causa concreta. Localizar componentes existentes sem inventar métodos, classes ou tabelas extras.

## 6. PROCEDIMENTO DETALHADO

1. Revalidar gate anterior e fontes atuais; comparar este retrato com TASKS.md, preservando IDs e histórico.
2. Desdobrar o aceite em itens verificáveis, relacionados a requisitos, contratos API ativos, entidades e testes. Foco obrigatório: Mesclar carrinho com aviso, recuperar mesmo checkout em dispositivos distintos, sem timer por item nem renovação por abrir tela. Confirmar ajustes comerciais a partir da API. Pedido/pagamento completo entra em TASK-020.
3. Listar arquivos existentes/novos, métodos/classes/componentes e alterações mínimas. Para cada arquivo marcar PRIMARY ou justificar INCIDENTAL com os nove critérios; declarar caminhos proibidos. Diretório permitido não autoriza responsabilidade futura.
4. Apresentar matriz de impacto arquitetura/banco/API/interface/segurança/testes: para cada linha registrar alteração concreta ou N/A justificado, usando domínio/API do contexto. Migrations somente modelos expressos no Scope Guard. Proposta arquitetural não é ratificação.
5. Localizar comandos reais no manifest/scripts/configuração após ratificação; registrar comando, diretório, ambiente, saída esperada e baseline real de build/tipos/lint/testes aplicáveis. Não presumir npm/mvn/gradle/pytest/Docker. Pendência de ferramenta impede o respectivo gate.
6. Completar o roteiro manual desta pasta: dados, atores, passos atômicos, operações/rotas ativas, sucesso, negativa, fronteira, repetição e evidência. Limitar ao incremento; checkpoint acumula a fase e TASK-037 acumula entrega. Testes automáticos obrigatórios continuam exigidos, com acionamento/acompanhamento manual do responsável.
7. Planejar rollback do diff próprio e limpeza apenas de dados descartáveis identificados, sem reset/restore destrutivo, perda de trabalho alheio nem sobrescrever base original. Em migration, plano compatível e testado antes de alterar dados; restaurar só em destino separado.
8. Confirmar ambiente Windows → WSL → Linux como requisito dos testes deste pedido, sem decidir plataforma de implantação PD-002. Versões e comandos ainda ausentes devem continuar lacunas explícitas. Não criar scripts de aplicação para executar testes nesta etapa de geração.
9. Só após autorização e DoR, abrir branch conforme AGENTS se Git existir, e registrar IN_PROGRESS em índice/seção. TASK-001 sem Git: N/A. TASK-002 cria Git apenas na etapa autorizada de estrutura; não criar branch fictícia. No checkpoint, plano não permite alterar produção.

## 7. RESTRIÇÕES

FORBIDDEN CHANGES (limite forte, prevalece sobre Allowed):

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.

Incidental Changes Policy: MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

Aplicar os nove critérios de AGENTS antes de qualquer incidental: necessidade, causalidade, minimalidade, escopo funcional, negócio, arquitetura, contrato, segurança e proibição. Sem orçamento para alterações dispersas. IDs são permanentes; não alterar fonte final nem tratar ADR PROPOSED como ACCEPTED. Sem refatoração ampla, cobrança real, publicação ou apresentação. Carrinho não reserva; USER separado de ADMIN/OPERATOR; estorno pós-venda só ADMIN. Preservar integralmente as regras de prazo, dinheiro, conta e relatórios das fontes.

## 8. VALIDAÇÕES

Vincular cada saída da etapa a arquivo/trecho, comando/procedimento, ambiente, resultado/exit code e evidência. Critério de aceite: Carrinho não bloqueia saldo; mudança comercial requer confirmação; timer pertence ao checkout, não ao item. Tratamento de retorno da API sem assumir reserva local.

Testes da TASK: TEST-010. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

Usar roteiro manual, com recorte explícito do incremento e casos adicionais exigidos pelo aceite. Gates globais GATE-01 a GATE-08 de AGENTS são distintos dos gates locais GATE-001 a GATE-006. Build/tipos/lint/testes aplicáveis continuam obrigatórios; execução automática pelo agente não substitui validação manual. Sem comandos existentes, registrar lacuna; não usar comandos presumidos nem registrar PASS.

## 9. TRATAMENTO DE FALHAS

Interromper avanço; registrar operação/comando, ambiente, código de saída, erro completo sem segredos e evidência. Separar FATO CONFIRMADO, EVIDÊNCIA, INFERÊNCIA, HIPÓTESE e PENDÊNCIA. Diagnosticar causa e avaliar Allowed/Forbidden/Incidental. Fazer somente menor correção autorizada; repetir a validação afetada e atualizar o gate, invalidando gates posteriores dependentes. Em revisão somente de leitura ou teste manual, devolver correção à etapa autorizada e revisar novamente. Produção proibida nesta TASK não pode ser corrigida nela. Erro de execução/validação: FAILED conforme AGENTS; dependência/decisão externa ausente: BLOCKED. Nenhum teste vira APROVADO sem reexecução manual. Preservar trabalho e não remover teste, desativar validação nem trocar concorrência real por mock sequencial.

## 10. SCOPE ESCALATION

Se necessário sair do escopo, parar e preencher o modelo de AGENTS.md sem inventar exceção:

```text
## SCOPE ESCALATION
TASK: TASK-017
Necessidade identificada: [problema e alteração necessária]
Motivo: [causa]
Arquivos/módulos afetados: [caminhos]
Allowed Changes atual: [regra]
Forbidden Changes relacionado: [regra ou nenhum]
Por que não é uma Incidental Change: [critérios reprovados]
Impacto se não realizada: [impacto e riscos]
Alternativas: [ampliar escopo; TASK existente/nova; dependências; ADR; outra]
Recomendação: [menor caminho]
Decisão necessária: [quem decide e o quê]
```

Bloqueio de requisito/dependência exige também `## BLOCKER` com TASK, Problema, Impacto, RF/RN/RNF/UC/ADR afetados, Alternativas, Recomendação e Decisão necessária. Manter próxima etapa bloqueada até decisão explícita; silêncio não aprova.

## 11. CRITÉRIOS DE APROVAÇÃO

- Todas as operações numeradas da seção 6 concluídas com evidência rastreável aplicável à etapa.
- Pré-condições e gates anteriores comprovados; nenhum bloqueio impeditivo aberto.
- Aceite da TASK desdobrado/verificado no grau da etapa, respeitando Allowed/Forbidden e política incidental.
- Nenhum teste ou decisão aprovado por hipótese; testes manuais só aprovados com execução/evidência do responsável.
- Relatório acumulado coerente, próximo arquivo identificado e falhas com diagnóstico/revalidação.

## 12. GATE DA ETAPA

GATE-002 — Planejamento e pré-condições. Estado inicial: PENDENTE; não executado nesta geração.

```text
[ ] Entradas/pré-condições e autorização verificadas
[ ] Cada item do procedimento da seção 6 tem evidência e resultado válido
[ ] Escopo/segurança/contratos preservados no recorte da etapa
[ ] Validações aplicáveis aprovadas; N/A individual justificado
[ ] Nenhuma pendência impeditiva; saída da seção 14 completa
GATES concluídos (critérios locais): 0/5
GATES pendentes (critérios locais): 5/5
STATUS: BLOQUEADO ATÉ VALIDAÇÃO
PRÓXIMA ETAPA: BLOQUEADA
```

Na execução, substituir cada campo pelo resultado real; somente 5/5 itens satisfeitos e predecessores válidos permitem STATUS: APROVADO e PRÓXIMA ETAPA: HABILITADA. N/A não é PASS e só satisfaz documentação da inaplicabilidade quando a regra autoriza. Na última etapa não há etapa seguinte a habilitar.

## 13. STATUS ACUMULADO DOS GATES

| Gate local | Etapa | Estado inicial |
| --- | --- | --- |
| GATE-001 | Recontextualização e prontidão | PENDENTE |
| GATE-002 | Planejamento e pré-condições | PENDENTE |
| GATE-003 | Implementação restrita | PENDENTE |
| GATE-004 | Revisão de escopo e qualidade | PENDENTE |
| GATE-005 | Testes manuais pelo responsável | PENDENTE |
| GATE-006 | Conclusão controlada | PENDENTE |

GATES TOTAIS: 6; GATES CONCLUÍDOS: 0; GATES PENDENTES: 6; GATES BLOQUEADOS: 0 (nenhum gate executado; execução atualmente não autorizada).

Em cada resposta atualizar a matriz inteira com evidências reais. Contagem: total = concluídos + pendentes + bloqueados; reprovado conta como bloqueado para avanço e mantém REPROVADO na linha. Critérios dentro de um gate não contam como etapas. Gate invalidado por correção deve voltar a pendente/bloqueado.

## 14. RESULTADO OBRIGATÓRIO

Entregar artefatos/evidências do procedimento; na conclusão incluir também o relatório integral de AGENTS §15. Finalizar a resposta com este bloco preenchido por resultados reais:

```text
==================================================
TASK: TASK-017
ETAPA: 002
STATUS DA ETAPA: APROVADA | REPROVADA | BLOQUEADA
==================================================
GATE DA ETAPA: APROVADO | REPROVADO | BLOQUEADO
GATES TOTAIS: 6
GATES CONCLUÍDOS: [resultado real]
GATES PENDENTES: [resultado real]
GATES BLOQUEADOS: [resultado real]
PROBLEMAS ENCONTRADOS:
- [descrição ou NONE]
CORREÇÕES REALIZADAS:
- [descrição e evidência ou NONE]
PENDÊNCIAS:
- [descrição ou NONE]
TESTES RELACIONADOS:
- [IDs, resultados reais e evidências; NÃO EXECUTADOS quando ausentes]
PRÓXIMA ETAPA:
prompt-task-017-etapa-003-implementacao.md
PRÓXIMA ETAPA HABILITADA:
SIM | NÃO
MOTIVO:
[evidência para habilitar, bloqueio concreto ou encerramento sem próxima etapa]
==================================================
```
