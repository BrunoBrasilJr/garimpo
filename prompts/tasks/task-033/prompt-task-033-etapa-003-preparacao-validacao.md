# TASK-033 — ETAPA 003 — Preparação da validação

MODELO PARA USO FUTURO. A solicitação de 2026-10-25 autoriza apenas gerar estes documentos. Ler, copiar ou receber este arquivo não autoriza executar a TASK. Exigir autorização explícita futura do responsável, específica à TASK ou continuidade expressa, antes de iniciar. Gate aprovado habilita somente a próxima etapa da mesma TASK; não autoriza a próxima TASK. Não executar automaticamente a etapa seguinte.

## 1. OBJETIVO

Preparação da validação para TASK-033 — Executar aceitação funcional e acessibilidade. Validar requisitos e fluxos nos clientes/plataformas definidos, teclado/foco/contraste web e leitor/ampliação mobile.

## 2. CONTEXTO

Estado inicial em 2026-10-25: BLOCKED; fase PHASE-05; prioridade HIGH. Nenhuma TASK foi executada. Não há Git, código, manifests, banco ou testes de aplicação nesta pasta. Caminhos técnicos são futuros, sujeitos à stack ratificada; seis ADRs PROPOSED.

Objetivo específico: Validar requisitos e fluxos nos clientes/plataformas definidos, teclado/foco/contraste web e leitor/ampliação mobile.

Descrição operacional: Aceitação funcional e acessibilidade em plataformas PD-002, rubrica PD-003 quando necessária. Cobrir TEST-001 a TEST-025 e TEST-032 a TEST-035 do aceite, inclusive TEST-025 omitido da enumeração Testes necessários. Registrar teclado/foco/contraste e leitor/ampliação sem alegar certificação não aferida.

Dependências/predecessoras diretas: TASK-032. Conferir seus artefatos e relatórios, não só estados. Bloqueadoras iniciais: TASK-032.

Rastreabilidade: RF-001, RF-002, RF-003, RF-004, RF-005, RF-006, RF-007, RF-008, RF-009, RF-010, RF-011, RF-012, RF-013, RF-014, RF-015, RF-016, RF-017, RF-018, RF-019, RF-020, RF-021, RF-022, RF-023, RF-024, RF-026, RF-027, RF-028, RF-029; RN-001, RN-002, RN-003, RN-004, RN-005, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-014, RN-015, RN-016, RN-017, RN-018, RN-019, RN-020, RN-021, RN-022, RN-023, RN-024, RN-025, RN-026, RN-027, RN-028, RN-029, RN-030, RN-032, RN-033, RN-034, RN-035, RN-036, RN-037, RN-038, RN-039, RN-040, RN-041, RN-042, RN-043, RN-044, RN-045; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-010, RNF-011; UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007, UC-008, UC-009, UC-010, UC-011, UC-012, UC-013, UC-014, UC-015, UC-016, UC-017, UC-018, UC-019, UC-020, UC-021, UC-022, UC-023, UC-024, UC-026, UC-027, UC-028, UC-029. ADRs: ADR-001, ADR-002.

Pendências ligadas à tarefa (PD-005 também condiciona os módulos técnicos):

| ID | Decisão necessária | Tarefas afetadas |
| --- | --- | --- |
| PD-002 | Ambiente e plataformas: Confirmar plataforma mobile, navegadores, publicação/local, infraestrutura e transporte. Android exclusivo, LAN e HTTP não são fatos aprovados. | TASK-001, TASK-002, TASK-033 |
| PD-003 | Exigências adicionais: Confirmar rubrica e eventuais exigências formais de acessibilidade/implantação; preservar critérios de projeto já definidos. | TASK-033, TASK-037 |
| PD-005 | Parâmetros técnicos: Ratificar stack herdada, versões, sessão, hash, proteção das mensagens, armazenamento, prazo de links de alteração/reativação e estratégia transacional. Reset 30min, confirmação inicial 24h e limites de imagens já decididos. | TASK-001 e módulos dependentes |

Matriz de domínio/API do README (referência de análise, não expansão de escopo):

| RF | RNs | RNFs | UC | Entidades | API | Testes | TASKs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RF-001 | RN-001, RN-002, RN-029, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-001 | User, EmailToken | API-001.* | TEST-001 | TASK-004, TASK-005, TASK-006, TASK-033 |
| RF-002 | RN-001, RN-028, RN-029, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-002 | User, Session | API-002.* | TEST-002 | TASK-004, TASK-006, TASK-022, TASK-033 |
| RF-003 | RN-003, RN-032, RN-033 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-003 | User, PasswordReset, Session, DemoMessage | API-003.* | TEST-003 | TASK-005, TASK-006, TASK-033 |
| RF-004 | RN-002, RN-032, RN-044 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-004 | User, Address, EmailToken | API-004.* | TEST-004 | TASK-004, TASK-006, TASK-022, TASK-033 |
| RF-005 | RN-004, RN-032, RN-036 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008 | UC-005 | Edition, Artist, Track, TrackArtist, Genre, Offer | API-005.* | TEST-005 | TASK-008, TASK-010, TASK-011, TASK-033 |
| RF-006 | RN-004, RN-005, RN-026, RN-032, RN-036, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010 | UC-006 | Edition, Track, Offer, ProductImage | API-006.* | TEST-006 | TASK-008, TASK-010, TASK-011, TASK-033 |
| RF-007 | RN-032, RN-037 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-007 | WishlistEntry, Edition, User | API-007.* | TEST-007 | TASK-012, TASK-033 |
| RF-008 | RN-024, RN-032, RN-037 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011 | UC-008 | AvailabilityAlert, DomainEvent, DemoMessage, Offer | API-008.* | TEST-008 | TASK-012, TASK-023, TASK-033 |
| RF-009 | RN-025, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-009 | Review, ReviewRevision, OrderItem, OrderUnit | API-009.* | TEST-009 | TASK-013, TASK-023, TASK-026, TASK-033 |
| RF-010 | RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-028, RN-032, RN-035 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011 | UC-010 | Cart, CartItem, Checkout, CheckoutItem, Reservation | API-010.* | TEST-010 | TASK-016, TASK-017, TASK-018, TASK-023, TASK-033, TASK-034 |
| RF-011 | RN-002, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-013, RN-014, RN-016, RN-017, RN-018, RN-032, RN-033 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011 | UC-011 | Checkout, Order, OrderItem, CouponUsage, FreightRate, Reservation | API-011.* | TEST-011 | TASK-018, TASK-020, TASK-033, TASK-034 |
| RF-012 | RN-010, RN-011, RN-012, RN-013, RN-017, RN-028, RN-032, RN-033, RN-039, RN-041 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-012 | PaymentAttempt, PaymentCharge, Checkout, Order, Refund, RefundAttempt | API-012.* | TEST-012 | TASK-019, TASK-020, TASK-023, TASK-025, TASK-033, TASK-034 |
| RF-013 | RN-015, RN-032, RN-033 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-013 | Order, OrderItem, OrderStatusEvent, Shipment, Refund | API-013.* | TEST-013 | TASK-021, TASK-033 |
| RF-014 | RN-011, RN-017, RN-019, RN-032, RN-039, RN-041 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-014 | CancellationRequest, OrderUnit, PaymentCharge, Refund, StockMovement | API-014.* | TEST-014 | TASK-019, TASK-022, TASK-025, TASK-028, TASK-033 |
| RF-015 | RN-018, RN-019, RN-020, RN-021, RN-028, RN-032, RN-034, RN-040, RN-041, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010, RNF-011 | UC-015 | ReturnRequest, ReturnItem, OrderUnit, Refund, Evidence, Shipment | API-015.* | TEST-015 | TASK-026, TASK-028, TASK-033 |
| RF-016 | RN-020, RN-022, RN-023, RN-028, RN-032, RN-034, RN-035, RN-040, RN-041, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010, RNF-011 | UC-016 | ExchangeRequest, ExchangeItem, SubstituteOffer, OrderUnit, Reservation, Shipment, Evidence | API-016.* | TEST-016 | TASK-027, TASK-028, TASK-033 |
| RF-017 | RN-001, RN-004, RN-005, RN-026, RN-027, RN-032, RN-036, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010 | UC-017 | Edition, Track, TrackArtist, Offer, ProductImage | API-017.* | TEST-017 | TASK-008, TASK-009, TASK-023, TASK-033 |
| RF-018 | RN-001, RN-004, RN-006, RN-013, RN-019, RN-021, RN-022, RN-024, RN-027, RN-032, RN-035, RN-038, RN-039 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-018 | Offer, StockMovement, Reservation, Edition | API-018.* | TEST-018 | TASK-009, TASK-016, TASK-019, TASK-023, TASK-025, TASK-026, TASK-027, TASK-033, TASK-034 |
| RF-019 | RN-008, RN-016, RN-017, RN-018, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-019 | Promotion, Coupon, CouponTarget, CouponUsage | API-019.* | TEST-019 | TASK-014, TASK-016, TASK-018, TASK-019, TASK-023, TASK-033, TASK-034 |
| RF-020 | RN-001, RN-015, RN-019, RN-023, RN-032, RN-040 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-020 | Order, OrderStatusEvent, Shipment, ExternalInteraction | API-020.* | TEST-020 | TASK-021, TASK-025, TASK-026, TASK-027, TASK-033 |
| RF-021 | RN-001, RN-028, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-021 | User, Session, Checkout, Order, AuditLog | API-021.* | TEST-021 | TASK-022, TASK-023, TASK-033, TASK-034 |
| RF-022 | RN-001, RN-025, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-022 | Review, ReviewRevision, AuditLog | API-022.* | TEST-022 | TASK-013, TASK-026, TASK-033 |
| RF-023 | RN-018, RN-021, RN-030, RN-032, RN-034 | RNF-001, RNF-003, RNF-004, RNF-005 | UC-023 | Order, OrderUnit, Refund, FinancialEvent, Genre | API-023.* | TEST-023 | TASK-029, TASK-033, TASK-034 |
| RF-024 | RN-003, RN-024, RN-032, RN-033, RN-042 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-024 | DomainEvent, DemoMessage, EmailToken | API-024.* | TEST-024 | TASK-005, TASK-012, TASK-019, TASK-021, TASK-025, TASK-026, TASK-027, TASK-033 |
| RF-026 | RN-001, RN-029, RN-032, RN-044 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-026 | User, Session, EmailToken, AuditLog | API-026.* | TEST-032 | TASK-004, TASK-005, TASK-006, TASK-033 |
| RF-027 | RN-032, RN-043 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-027 | User, Session, EmailToken, Checkout, Order | API-027.* | TEST-033 | TASK-022, TASK-023, TASK-033 |
| RF-028 | RN-002, RN-032, RN-044 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-028 | User, EmailToken, DemoMessage | API-028.* | TEST-034 | TASK-004, TASK-005, TASK-006, TASK-022, TASK-033 |
| RF-029 | RN-014, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-029 | FreightRate, CepRange, AuditLog | API-029.* | TEST-035 | TASK-018, TASK-033 |

Critérios de aceite da fonte: TEST-001 a TEST-025 e TEST-032 a TEST-035 funcionais cobertos; todos os cenários aplicáveis do PDF têm evidência; nenhuma certificação não aferida.

## 3. PRÉ-CONDIÇÕES

- Autorização explícita futura identificada e Scope Guard vigente lido.
- GATE-002 e todos seus predecessores aprovados com evidência atual; falta de relatório bloqueia esta etapa.
- DEPENDS_ON: TASK-032; checkpoint anterior e artefatos conferidos. A geração não satisfez essas dependências.
- Ambiente, baseline e decisões compatíveis com o recorte da etapa; nenhuma hipótese usada como fato. TASK-001 resolve suas próprias propostas sem implementação.

## 4. ENTRADAS NECESSÁRIAS

Ler os arquivos atuais nesta ordem: `AGENTS.md` e `docs/architecture/conciliacao.md`; `README.md`; `TASKS.md` (índice, seção TASK-033, dependências e Scope Guard); ADRs relacionados em `docs/adr/`, `docs/architecture/architecture.md`, `api.md`, `data-model.md`, `testing.md`, `parametros.md` e diagramas relevantes; depois código/testes dos módulos afetados quando existirem. Conferir respostas de origem em `docs/sources/elicitacao-final.md` nas regras relacionadas. Recuperar autorização, plano, histórico e relatórios anteriores; ausência deve ser registrada. Consultar `roteiro-testes-manuais.md` desta pasta.

## 5. ARQUIVOS E COMPONENTES ENVOLVIDOS

ALLOWED CHANGES da TASK (limites de caminho **e finalidade**, não autorização automática desta etapa):

- tests/e2e/acceptance/**
- tests/accessibility/**
- docs/validation/acceptance.md
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

Foco de componentes/impactos: Aceitação funcional e acessibilidade em plataformas PD-002, rubrica PD-003 quando necessária. Cobrir TEST-001 a TEST-025 e TEST-032 a TEST-035 do aceite, inclusive TEST-025 omitido da enumeração Testes necessários. Registrar teclado/foco/contraste e leitor/ampliação sem alegar certificação não aferida.

Na etapa 001 apenas leitura; planejamento não altera produção; revisão apenas leitura; execução manual altera somente dados de teste e evidência autorizada. Planejar explicitamente impactos em arquitetura, persistência, APIs, interfaces, segurança e testes; N/A precisa de causa concreta. Localizar componentes existentes sem inventar métodos, classes ou tabelas extras.

## 6. PROCEDIMENTO DETALHADO

1. Confirmar autorização da TASK e gates anteriores por evidências atuais. Alterar apenas arquivos aprovados no plano e dentro do Scope Guard transcrito abaixo.
2. Executar o incremento: Aceitação funcional e acessibilidade em plataformas PD-002, rubrica PD-003 quando necessária. Cobrir TEST-001 a TEST-025 e TEST-032 a TEST-035 do aceite, inclusive TEST-025 omitido da enumeração Testes necessários. Registrar teclado/foco/contraste e leitor/ampliação sem alegar certificação não aferida.
3. Trabalhar por critério de aceite: registrar arquivo/componente, comportamento antes/depois, contrato/entidade e evidência. Respeitar camadas e stack ratificadas; preservar erros, autorização, propriedade, histórico e idempotência aplicáveis. Não adicionar dependência oportunista.
4. Preparar testes/cenários e documentação nos caminhos autorizados; nenhuma correção em produção. Confirmar destinos isolados antes de preparar restauração.
5. Verificar diff parcial e classificar mudanças. Não executar automaticamente os testes manuais do responsável. Checagens auxiliares do agente têm autoria/resultado próprios e não substituem aceitação manual.
6. Atualizar somente o registro desta TASK em TASKS.md; README só se seu trecho de especificação/estrutura estiver autorizado. Não registrar DONE aqui; preparar revisão com riscos e limitações.

## 7. RESTRIÇÕES

FORBIDDEN CHANGES (limite forte, prevalece sobre Allowed):

- Alterar requisitos do PDF final ou arquitetura ratificada sem registrar decisão.
- Implementar tarefa futura, efetuar cobrança real ou integrar serviço de produção fora do escopo.
- Refatorar módulos não relacionados, remover testes ou desabilitar validações para passar gates.
- Criar/alterar migrations nesta tarefa.
- Alterar código de produção; falhas exigem tarefa de correção e revalidação.

Incidental Changes Policy: NO_INCIDENTAL_CHANGES

Nenhuma mudança fora do escopo primário é permitida nesta tarefa.

Aplicar os nove critérios de AGENTS antes de qualquer incidental: necessidade, causalidade, minimalidade, escopo funcional, negócio, arquitetura, contrato, segurança e proibição. Sem orçamento para alterações dispersas. IDs são permanentes; não alterar fonte final nem tratar ADR PROPOSED como ACCEPTED. Sem refatoração ampla, cobrança real, publicação ou apresentação. Carrinho não reserva; USER separado de ADMIN/OPERATOR; estorno pós-venda só ADMIN. Preservar integralmente as regras de prazo, dinheiro, conta e relatórios das fontes.

## 8. VALIDAÇÕES

Vincular cada saída da etapa a arquivo/trecho, comando/procedimento, ambiente, resultado/exit code e evidência. Critério de aceite: TEST-001 a TEST-025 e TEST-032 a TEST-035 funcionais cobertos; todos os cenários aplicáveis do PDF têm evidência; nenhuma certificação não aferida.

Testes da TASK: TEST-001, TEST-002, TEST-003, TEST-004, TEST-005, TEST-006, TEST-007, TEST-008, TEST-009, TEST-010, TEST-011, TEST-012, TEST-013, TEST-014, TEST-015, TEST-016, TEST-017, TEST-018, TEST-019, TEST-020, TEST-021, TEST-022, TEST-023, TEST-024, TEST-032, TEST-033, TEST-034, TEST-035. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

Usar roteiro manual, com recorte explícito do incremento e casos adicionais exigidos pelo aceite. Gates globais GATE-01 a GATE-08 de AGENTS são distintos dos gates locais GATE-001 a GATE-006. Build/tipos/lint/testes aplicáveis continuam obrigatórios; execução automática pelo agente não substitui validação manual. Sem comandos existentes, registrar lacuna; não usar comandos presumidos nem registrar PASS.

## 9. TRATAMENTO DE FALHAS

Interromper avanço; registrar operação/comando, ambiente, código de saída, erro completo sem segredos e evidência. Separar FATO CONFIRMADO, EVIDÊNCIA, INFERÊNCIA, HIPÓTESE e PENDÊNCIA. Diagnosticar causa e avaliar Allowed/Forbidden/Incidental. Fazer somente menor correção autorizada; repetir a validação afetada e atualizar o gate, invalidando gates posteriores dependentes. Em revisão somente de leitura ou teste manual, devolver correção à etapa autorizada e revisar novamente. Produção proibida nesta TASK não pode ser corrigida nela. Erro de execução/validação: FAILED conforme AGENTS; dependência/decisão externa ausente: BLOCKED. Nenhum teste vira APROVADO sem reexecução manual. Preservar trabalho e não remover teste, desativar validação nem trocar concorrência real por mock sequencial.

## 10. SCOPE ESCALATION

Se necessário sair do escopo, parar e preencher o modelo de AGENTS.md sem inventar exceção:

```text
## SCOPE ESCALATION
TASK: TASK-033
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

GATE-003 — Preparação da validação. Estado inicial: PENDENTE; não executado nesta geração.

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
| GATE-003 | Preparação da validação | PENDENTE |
| GATE-004 | Revisão de escopo e qualidade | PENDENTE |
| GATE-005 | Testes manuais pelo responsável | PENDENTE |
| GATE-006 | Conclusão controlada | PENDENTE |

GATES TOTAIS: 6; GATES CONCLUÍDOS: 0; GATES PENDENTES: 6; GATES BLOQUEADOS: 0 (nenhum gate executado; execução atualmente não autorizada).

Em cada resposta atualizar a matriz inteira com evidências reais. Contagem: total = concluídos + pendentes + bloqueados; reprovado conta como bloqueado para avanço e mantém REPROVADO na linha. Critérios dentro de um gate não contam como etapas. Gate invalidado por correção deve voltar a pendente/bloqueado.

## 14. RESULTADO OBRIGATÓRIO

Entregar artefatos/evidências do procedimento; na conclusão incluir também o relatório integral de AGENTS §15. Finalizar a resposta com este bloco preenchido por resultados reais:

```text
==================================================
TASK: TASK-033
ETAPA: 003
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
prompt-task-033-etapa-004-revisao.md
PRÓXIMA ETAPA HABILITADA:
SIM | NÃO
MOTIVO:
[evidência para habilitar, bloqueio concreto ou encerramento sem próxima etapa]
==================================================
```
