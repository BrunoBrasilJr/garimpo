# TASK-016 — ETAPA 006 — Conclusão controlada

MODELO PARA USO FUTURO. A solicitação de 2026-10-25 autoriza apenas gerar estes documentos. Ler, copiar ou receber este arquivo não autoriza executar a TASK. Exigir autorização explícita futura do responsável, específica à TASK ou continuidade expressa, antes de iniciar. Gate aprovado habilita somente a próxima etapa da mesma TASK; não autoriza a próxima TASK. Não executar automaticamente a etapa seguinte.

## 1. OBJETIVO

Conclusão controlada para TASK-016 — Implementar carrinho e reserva única de checkout. Criar carrinho sem reserva, mescla de visitante e checkout único de 15min com reserva todos-ou-nenhum e cupom temporário.

## 2. CONTEXTO

Estado inicial em 2026-10-25: BLOCKED; fase PHASE-03; prioridade CRITICAL. Nenhuma TASK foi executada. Não há Git, código, manifests, banco ou testes de aplicação nesta pasta. Caminhos técnicos são futuros, sujeitos à stack ratificada; seis ADRs PROPOSED.

Objetivo específico: Criar carrinho sem reserva, mescla de visitante e checkout único de 15min com reserva todos-ou-nenhum e cupom temporário.

Descrição operacional: Carrinho não reserva; mescla visitante ajusta novos ao saldo e não duplica usados. Checkout único 15min, snapshots e reserva todos-ou-nenhum, cupom temporário. Mudança de itens/cupom reinicia validação; endereço preserva prazo. Porta de limite pendente não pode liberar operação sem adaptador.

Dependências/predecessoras diretas: TASK-015, TASK-014. Conferir seus artefatos e relatórios, não só estados. Bloqueadoras iniciais: TASK-015, TASK-014.

Rastreabilidade: RF-010, RF-018, RF-019; RN-001, RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-013, RN-016, RN-017, RN-018, RN-019, RN-021, RN-022, RN-024, RN-027, RN-028, RN-032, RN-035, RN-038, RN-039; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011; UC-010, UC-018, UC-019. ADRs: ADR-003, ADR-004.

Pendências ligadas à tarefa (PD-005 também condiciona os módulos técnicos):

| ID | Decisão necessária | Tarefas afetadas |
| --- | --- | --- |
| PD-005 | Parâmetros técnicos: Ratificar stack herdada, versões, sessão, hash, proteção das mensagens, armazenamento, prazo de links de alteração/reativação e estratégia transacional. Reset 30min, confirmação inicial 24h e limites de imagens já decididos. | TASK-001 e módulos dependentes |

Matriz de domínio/API do README (referência de análise, não expansão de escopo):

| RF | RNs | RNFs | UC | Entidades | API | Testes | TASKs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RF-010 | RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-028, RN-032, RN-035 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011 | UC-010 | Cart, CartItem, Checkout, CheckoutItem, Reservation | API-010.* | TEST-010 | TASK-016, TASK-017, TASK-018, TASK-023, TASK-033, TASK-034 |
| RF-018 | RN-001, RN-004, RN-006, RN-013, RN-019, RN-021, RN-022, RN-024, RN-027, RN-032, RN-035, RN-038, RN-039 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-018 | Offer, StockMovement, Reservation, Edition | API-018.* | TEST-018 | TASK-009, TASK-016, TASK-019, TASK-023, TASK-025, TASK-026, TASK-027, TASK-033, TASK-034 |
| RF-019 | RN-008, RN-016, RN-017, RN-018, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-019 | Promotion, Coupon, CouponTarget, CouponUsage | API-019.* | TEST-019 | TASK-014, TASK-016, TASK-018, TASK-019, TASK-023, TASK-033, TASK-034 |

Critérios de aceite da fonte: Concorrência por usado/cupom segura; alterar itens/cupom reinicia validação, endereço conserva prazo. Porta de contagem de pendentes será conectada a pedidos em TASK-018/023; runtime não ignora limite.

## 3. PRÉ-CONDIÇÕES

- Autorização explícita futura identificada e Scope Guard vigente lido.
- GATE-005 e todos seus predecessores aprovados com evidência atual; falta de relatório bloqueia esta etapa.
- DEPENDS_ON: TASK-015, TASK-014; checkpoint anterior e artefatos conferidos. A geração não satisfez essas dependências.
- Ambiente, baseline e decisões compatíveis com o recorte da etapa; nenhuma hipótese usada como fato. TASK-001 resolve suas próprias propostas sem implementação.

## 4. ENTRADAS NECESSÁRIAS

Ler os arquivos atuais nesta ordem: `AGENTS.md` e `docs/architecture/conciliacao.md`; `README.md`; `TASKS.md` (índice, seção TASK-016, dependências e Scope Guard); ADRs relacionados em `docs/adr/`, `docs/architecture/architecture.md`, `api.md`, `data-model.md`, `testing.md`, `parametros.md` e diagramas relevantes; depois código/testes dos módulos afetados quando existirem. Conferir respostas de origem em `docs/sources/elicitacao-final.md` nas regras relacionadas. Recuperar autorização, plano, histórico e relatórios anteriores; ausência deve ser registrada. Consultar `roteiro-testes-manuais.md` desta pasta.

## 5. ARQUIVOS E COMPONENTES ENVOLVIDOS

ALLOWED CHANGES da TASK (limites de caminho **e finalidade**, não autorização automática desta etapa):

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

Foco de componentes/impactos: Carrinho não reserva; mescla visitante ajusta novos ao saldo e não duplica usados. Checkout único 15min, snapshots e reserva todos-ou-nenhum, cupom temporário. Mudança de itens/cupom reinicia validação; endereço preserva prazo. Porta de limite pendente não pode liberar operação sem adaptador.

Na etapa 001 apenas leitura; planejamento não altera produção; revisão apenas leitura; execução manual altera somente dados de teste e evidência autorizada. Planejar explicitamente impactos em arquitetura, persistência, APIs, interfaces, segurança e testes; N/A precisa de causa concreta. Localizar componentes existentes sem inventar métodos, classes ou tabelas extras.

## 6. PROCEDIMENTO DETALHADO

1. Revalidar evidências de todos os gates nesta mesma revisão de arquivos. Inspecionar estado/diff/inventário final, documentação necessária, ausência de temporários/debug e mudanças alheias. Não contar gate de outro snapshot sem validação.
2. Conferir GATE-01 a GATE-08 de AGENTS: build/tipos, lint, unitários, integração, API, segurança, aceite e regressão. Registrar comandos/resultados reais. N/A tem motivo e não equivale a PASS; checkpoint executa gates acumulados de implementação.
3. Confirmar aceite, testes manuais do responsável, nenhum obrigatório reprovado/bloqueado/pendente e DoD. Classificar arquivos PRIMARY/INCIDENTAL; tabela Arquivo/Componente, Alteração, Justificativa ou Incidental Changes: NONE. Qualquer falha impede DONE.
4. Se Git existir, manter branch real e commits pequenos e rastreáveis conforme `<tipo>(<escopo>): <descrição> [TASK-NNN]`, incluindo apenas mudanças da TASK; nunca inventar hash. Sem Git para tarefa documental registrar N/A justificado; ausência onde estrutura já deveria existir é bloqueio, não licença para inicializar fora de TASK-002.
5. Atualizar índice e seção da TASK em TASKS.md com estado/evidência verdadeiros. Estados canônicos: IN_PROGRESS = EM EXECUÇÃO; FAILED = falha real; BLOCKED = bloqueio externo/decisão; IN_REVIEW com subestado AGUARDANDO TESTES MANUAIS; DONE = CONCLUÍDA só com DoD. Não criar estado canônico informal nem alterar README para andamento.
6. Entregar TASK Execution Report completo de AGENTS §15: TASK, Status, Branch, Commits, Primary Changes, Incidental Changes, Tests Executed, Quality Gates, Scope Validation, Definition of Done e Next Eligible TASK. Acrescentar matriz de todos gates locais, contagens, estado manual e critérios de aceite.
7. Recalcular primeira TASK elegível por ordem, fase/checkpoint, dependências DONE/artefatos/DoR; se não houver, NONE e bloqueio. Indicar elegibilidade separada de autorização: a próxima TASK exige nova autorização. Parar sem executar outra etapa/TASK. Não habilitar desenvolvimento por concluir este modelo documental.

## 7. RESTRIÇÕES

FORBIDDEN CHANGES (limite forte, prevalece sobre Allowed):

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.

Incidental Changes Policy: MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED

Somente ajustes mínimos de imports, exports, registro de módulo, tipos/mocks ou configuração de teste diretamente causados por esta entrega e aprovados pelo teste de nove critérios do AGENTS.md. Não alterar segurança, negócio ou contrato incompatível como incidental.

Aplicar os nove critérios de AGENTS antes de qualquer incidental: necessidade, causalidade, minimalidade, escopo funcional, negócio, arquitetura, contrato, segurança e proibição. Sem orçamento para alterações dispersas. IDs são permanentes; não alterar fonte final nem tratar ADR PROPOSED como ACCEPTED. Sem refatoração ampla, cobrança real, publicação ou apresentação. Carrinho não reserva; USER separado de ADMIN/OPERATOR; estorno pós-venda só ADMIN. Preservar integralmente as regras de prazo, dinheiro, conta e relatórios das fontes.

## 8. VALIDAÇÕES

Vincular cada saída da etapa a arquivo/trecho, comando/procedimento, ambiente, resultado/exit code e evidência. Critério de aceite: Concorrência por usado/cupom segura; alterar itens/cupom reinicia validação, endereço conserva prazo. Porta de contagem de pendentes será conectada a pedidos em TASK-018/023; runtime não ignora limite.

Testes da TASK: TEST-010, TEST-018, TEST-019. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

Usar roteiro manual, com recorte explícito do incremento e casos adicionais exigidos pelo aceite. Gates globais GATE-01 a GATE-08 de AGENTS são distintos dos gates locais GATE-001 a GATE-006. Build/tipos/lint/testes aplicáveis continuam obrigatórios; execução automática pelo agente não substitui validação manual. Sem comandos existentes, registrar lacuna; não usar comandos presumidos nem registrar PASS.

## 9. TRATAMENTO DE FALHAS

Interromper avanço; registrar operação/comando, ambiente, código de saída, erro completo sem segredos e evidência. Separar FATO CONFIRMADO, EVIDÊNCIA, INFERÊNCIA, HIPÓTESE e PENDÊNCIA. Diagnosticar causa e avaliar Allowed/Forbidden/Incidental. Fazer somente menor correção autorizada; repetir a validação afetada e atualizar o gate, invalidando gates posteriores dependentes. Em revisão somente de leitura ou teste manual, devolver correção à etapa autorizada e revisar novamente. Produção proibida nesta TASK não pode ser corrigida nela. Erro de execução/validação: FAILED conforme AGENTS; dependência/decisão externa ausente: BLOCKED. Nenhum teste vira APROVADO sem reexecução manual. Preservar trabalho e não remover teste, desativar validação nem trocar concorrência real por mock sequencial.

## 10. SCOPE ESCALATION

Se necessário sair do escopo, parar e preencher o modelo de AGENTS.md sem inventar exceção:

```text
## SCOPE ESCALATION
TASK: TASK-016
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

GATE-006 — Conclusão controlada. Estado inicial: PENDENTE; não executado nesta geração.

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
TASK: TASK-016
ETAPA: 006
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
NENHUMA — emitir relatório e parar
PRÓXIMA ETAPA HABILITADA:
SIM | NÃO
MOTIVO:
[evidência para habilitar, bloqueio concreto ou encerramento sem próxima etapa]
==================================================
```
