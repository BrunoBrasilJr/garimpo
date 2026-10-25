# Dependências de execução

Grafo dividido por fase para leitura. Cada aresta vai da dependência para a tarefa; a união das cinco vistas mantém todas as dependências do backlog. Nós de outra fase mostram o ID e a origem. Nenhuma tarefa está autorizada a iniciar na etapa documental atual.

## PHASE-01

```mermaid
flowchart TD
  T001["TASK-001: Validar decisões técnicas e parâmetros pendentes"]
  T002["TASK-002: Preparar estrutura de desenvolvimento"]
  T003["TASK-003: Criar persistência e fundação transacional"]
  T004["TASK-004: Implementar contas, autenticação e gestão interna na API"]
  T005["TASK-005: Implementar recuperação, confirmação e mensagens de acesso"]
  T006["TASK-006: Criar interfaces de contas e administração interna"]
  T007["TASK-007: Checkpoint PHASE-01"]
  T001 --> T002
  T002 --> T003
  T003 --> T004
  T004 --> T005
  T004 --> T006
  T005 --> T006
  T003 --> T007
  T004 --> T007
  T005 --> T007
  T006 --> T007
```

## PHASE-02

```mermaid
flowchart TD
  T007["TASK-007 / PHASE-01"]
  T008["TASK-008: Implementar catálogo, metadados e imagens na API"]
  T009["TASK-009: Administrar catálogo e estoque inicial"]
  T010["TASK-010: Criar catálogo público no site"]
  T011["TASK-011: Criar catálogo público no aplicativo"]
  T012["TASK-012: Implementar desejos e alertas de disponibilidade"]
  T013["TASK-013: Implementar avaliações e moderação"]
  T014["TASK-014: Implementar administração de cupons e promoções"]
  T015["TASK-015: Checkpoint PHASE-02"]
  T007 --> T008
  T008 --> T009
  T008 --> T010
  T008 --> T011
  T008 --> T012
  T009 --> T012
  T010 --> T012
  T011 --> T012
  T008 --> T013
  T010 --> T013
  T011 --> T013
  T009 --> T014
  T009 --> T015
  T010 --> T015
  T011 --> T015
  T012 --> T015
  T013 --> T015
  T014 --> T015
```

## PHASE-03

```mermaid
flowchart TD
  T012["TASK-012 / PHASE-02"]
  T013["TASK-013 / PHASE-02"]
  T014["TASK-014 / PHASE-02"]
  T015["TASK-015 / PHASE-02"]
  T016["TASK-016: Implementar carrinho e reserva única de checkout"]
  T017["TASK-017: Criar carrinho e reserva nas interfaces"]
  T018["TASK-018: Implementar frete, cotação e pedidos"]
  T019["TASK-019: Implementar simulador, cobranças e estornos automáticos"]
  T020["TASK-020: Criar checkout e simulação nos clientes"]
  T021["TASK-021: Implementar histórico e logística manual"]
  T022["TASK-022: Implementar bloqueio, encerramento e reativação de contas"]
  T023["TASK-023: Integrar regras comerciais e validar fronteiras"]
  T024["TASK-024: Checkpoint PHASE-03"]
  T015 --> T016
  T014 --> T016
  T016 --> T017
  T016 --> T018
  T014 --> T018
  T018 --> T019
  T017 --> T020
  T018 --> T020
  T019 --> T020
  T019 --> T021
  T019 --> T022
  T021 --> T022
  T012 --> T023
  T013 --> T023
  T016 --> T023
  T018 --> T023
  T019 --> T023
  T020 --> T023
  T021 --> T023
  T022 --> T023
  T020 --> T024
  T021 --> T024
  T022 --> T024
  T023 --> T024
```

## PHASE-04

```mermaid
flowchart TD
  T024["TASK-024 / PHASE-03"]
  T025["TASK-025: Implementar cancelamentos e indisponibilidade parcial"]
  T026["TASK-026: Implementar devoluções, inspeção e evidências"]
  T027["TASK-027: Implementar trocas, ofertas e prazos"]
  T028["TASK-028: Criar interfaces de pós-venda"]
  T029["TASK-029: Implementar relatórios financeiros e comerciais"]
  T030["TASK-030: Implementar backup diário completo"]
  T031["TASK-031: Revisar auditoria e segurança integrada"]
  T032["TASK-032: Checkpoint PHASE-04"]
  T024 --> T025
  T025 --> T026
  T026 --> T027
  T025 --> T028
  T026 --> T028
  T027 --> T028
  T026 --> T029
  T027 --> T029
  T024 --> T030
  T028 --> T031
  T029 --> T031
  T030 --> T031
  T028 --> T032
  T029 --> T032
  T030 --> T032
  T031 --> T032
```

## PHASE-05

```mermaid
flowchart TD
  T030["TASK-030 / PHASE-04"]
  T032["TASK-032 / PHASE-04"]
  T033["TASK-033: Executar aceitação funcional e acessibilidade"]
  T034["TASK-034: Validar desempenho e concorrência"]
  T035["TASK-035: Executar restauração isolada"]
  T036["TASK-036: Consolidar documentação operacional"]
  T037["TASK-037: Checkpoint PHASE-05 e entrega da implementação"]
  T032 --> T033
  T032 --> T034
  T030 --> T035
  T032 --> T035
  T033 --> T036
  T034 --> T036
  T035 --> T036
  T033 --> T037
  T034 --> T037
  T035 --> T037
  T036 --> T037
```

Checkpoints: TASK-007, TASK-015, TASK-024, TASK-032 e TASK-037. TASK-019 entrega estornos automáticos antes de TASK-025, evitando ciclo. Pendências e ADRs são condições adicionais ao grafo.
