# Prompts operacionais por TASK — Garimpo

Gerados por solicitação explícita do responsável em 2026-10-25 a partir do prompt mestre anexado. Escopo: apenas documentação operacional futura. A geração não executa TASK-001 nem desenvolvimento, não muda estados/ADRs/requisitos e não registra aprovação acadêmica.

## Inventário confirmado e limites

37 TASKs em cinco fases; TASK-001 READY e outras 36 BLOCKED. Não existe repositório Git: histórico/branches/commits N/A, sem inicialização nesta geração. Existem requisitos, transcrição final de 98 respostas, conciliação, arquitetura, API, dados, seis ADRs PROPOSED, testes planejados, diagramas e quatro modelos anteriores em `docs/prompts/`. Não existem aplicação, manifest, runtime de teste, migrations ou serviços configurados. Caminhos de código no backlog são propostas futuras.

Esta instrução posterior acrescenta validação manual pelo responsável em Windows → WSL → Linux; não ratifica plataforma mobile/implantação PD-002 e não dispensa gates automáticos de AGENTS. A documentação original permanece como fonte normativa; estes retratos precisam ser revalidados a cada etapa.

## Como usar futuramente

1. Obter autorização futura explícita da TASK (a geração não a concede); ler fontes pela ordem de AGENTS e começar pelo primeiro prompt, verificando ordem, dependências, checkpoint e DoR.
2. Passar relatórios/evidências à etapa seguinte; sem gate anterior válido, manter bloqueio. Todos os gates locais começam PENDENTES. Templates de resultado não são afirmações de execução.
3. Aplicar workflow próprio: TASK-001 decide documentos; TASK-036 documenta operação; TASK-031/033/034/035 preparam validação sem editar produção; checkpoints validam a fase em cinco etapas; implementações têm seis etapas com revisão e teste manual separados.
4. Usar roteiro manual de cada pasta, desdobrar casos em operações concretas após existir tecnologia e responsável executar. Sem evidências humanas, IN_REVIEW/AGUARDANDO TESTES MANUAIS; sem DONE. Corrigir, revisar e repetir manualmente quando falhar.
5. Gates locais GATE-001… são sequência operacional; GATE-01…08 de AGENTS são qualidade. N/A justificado não significa PASS. Concluir com relatório de AGENTS e parar antes da próxima TASK, salvo autorização expressa de continuidade.

## Índice global

| TASK | Descrição | Etapas | Dependências diretas | Pasta | Primeiro prompt |
| --- | --- | ---: | --- | --- | --- |
| TASK-001 | Validar decisões técnicas e parâmetros pendentes | 6 | NONE | [task-001](task-001/README.md) | [001](task-001/prompt-task-001-etapa-001-recontextualizacao-prontidao.md) |
| TASK-002 | Preparar estrutura de desenvolvimento | 6 | TASK-001 | [task-002](task-002/README.md) | [001](task-002/prompt-task-002-etapa-001-recontextualizacao-prontidao.md) |
| TASK-003 | Criar persistência e fundação transacional | 6 | TASK-002 | [task-003](task-003/README.md) | [001](task-003/prompt-task-003-etapa-001-recontextualizacao-prontidao.md) |
| TASK-004 | Implementar contas, autenticação e gestão interna na API | 6 | TASK-003 | [task-004](task-004/README.md) | [001](task-004/prompt-task-004-etapa-001-recontextualizacao-prontidao.md) |
| TASK-005 | Implementar recuperação, confirmação e mensagens de acesso | 6 | TASK-004 | [task-005](task-005/README.md) | [001](task-005/prompt-task-005-etapa-001-recontextualizacao-prontidao.md) |
| TASK-006 | Criar interfaces de contas e administração interna | 6 | TASK-004, TASK-005 | [task-006](task-006/README.md) | [001](task-006/prompt-task-006-etapa-001-recontextualizacao-prontidao.md) |
| TASK-007 | Checkpoint PHASE-01 | 5 | TASK-003, TASK-004, TASK-005, TASK-006 | [task-007](task-007/README.md) | [001](task-007/prompt-task-007-etapa-001-recontextualizacao-prontidao.md) |
| TASK-008 | Implementar catálogo, metadados e imagens na API | 6 | TASK-007 | [task-008](task-008/README.md) | [001](task-008/prompt-task-008-etapa-001-recontextualizacao-prontidao.md) |
| TASK-009 | Administrar catálogo e estoque inicial | 6 | TASK-008 | [task-009](task-009/README.md) | [001](task-009/prompt-task-009-etapa-001-recontextualizacao-prontidao.md) |
| TASK-010 | Criar catálogo público no site | 6 | TASK-008 | [task-010](task-010/README.md) | [001](task-010/prompt-task-010-etapa-001-recontextualizacao-prontidao.md) |
| TASK-011 | Criar catálogo público no aplicativo | 6 | TASK-008 | [task-011](task-011/README.md) | [001](task-011/prompt-task-011-etapa-001-recontextualizacao-prontidao.md) |
| TASK-012 | Implementar desejos e alertas de disponibilidade | 6 | TASK-008, TASK-009, TASK-010, TASK-011 | [task-012](task-012/README.md) | [001](task-012/prompt-task-012-etapa-001-recontextualizacao-prontidao.md) |
| TASK-013 | Implementar avaliações e moderação | 6 | TASK-008, TASK-010, TASK-011 | [task-013](task-013/README.md) | [001](task-013/prompt-task-013-etapa-001-recontextualizacao-prontidao.md) |
| TASK-014 | Implementar administração de cupons e promoções | 6 | TASK-009 | [task-014](task-014/README.md) | [001](task-014/prompt-task-014-etapa-001-recontextualizacao-prontidao.md) |
| TASK-015 | Checkpoint PHASE-02 | 5 | TASK-009, TASK-010, TASK-011, TASK-012, TASK-013, TASK-014 | [task-015](task-015/README.md) | [001](task-015/prompt-task-015-etapa-001-recontextualizacao-prontidao.md) |
| TASK-016 | Implementar carrinho e reserva única de checkout | 6 | TASK-015, TASK-014 | [task-016](task-016/README.md) | [001](task-016/prompt-task-016-etapa-001-recontextualizacao-prontidao.md) |
| TASK-017 | Criar carrinho e reserva nas interfaces | 6 | TASK-016 | [task-017](task-017/README.md) | [001](task-017/prompt-task-017-etapa-001-recontextualizacao-prontidao.md) |
| TASK-018 | Implementar frete, cotação e pedidos | 6 | TASK-016, TASK-014 | [task-018](task-018/README.md) | [001](task-018/prompt-task-018-etapa-001-recontextualizacao-prontidao.md) |
| TASK-019 | Implementar simulador, cobranças e estornos automáticos | 6 | TASK-018 | [task-019](task-019/README.md) | [001](task-019/prompt-task-019-etapa-001-recontextualizacao-prontidao.md) |
| TASK-020 | Criar checkout e simulação nos clientes | 6 | TASK-017, TASK-018, TASK-019 | [task-020](task-020/README.md) | [001](task-020/prompt-task-020-etapa-001-recontextualizacao-prontidao.md) |
| TASK-021 | Implementar histórico e logística manual | 6 | TASK-019 | [task-021](task-021/README.md) | [001](task-021/prompt-task-021-etapa-001-recontextualizacao-prontidao.md) |
| TASK-022 | Implementar bloqueio, encerramento e reativação de contas | 6 | TASK-019, TASK-021 | [task-022](task-022/README.md) | [001](task-022/prompt-task-022-etapa-001-recontextualizacao-prontidao.md) |
| TASK-023 | Integrar regras comerciais e validar fronteiras | 6 | TASK-012, TASK-013, TASK-016, TASK-018, TASK-019, TASK-020, TASK-021, TASK-022 | [task-023](task-023/README.md) | [001](task-023/prompt-task-023-etapa-001-recontextualizacao-prontidao.md) |
| TASK-024 | Checkpoint PHASE-03 | 5 | TASK-020, TASK-021, TASK-022, TASK-023 | [task-024](task-024/README.md) | [001](task-024/prompt-task-024-etapa-001-recontextualizacao-prontidao.md) |
| TASK-025 | Implementar cancelamentos e indisponibilidade parcial | 6 | TASK-024 | [task-025](task-025/README.md) | [001](task-025/prompt-task-025-etapa-001-recontextualizacao-prontidao.md) |
| TASK-026 | Implementar devoluções, inspeção e evidências | 6 | TASK-025 | [task-026](task-026/README.md) | [001](task-026/prompt-task-026-etapa-001-recontextualizacao-prontidao.md) |
| TASK-027 | Implementar trocas, ofertas e prazos | 6 | TASK-026 | [task-027](task-027/README.md) | [001](task-027/prompt-task-027-etapa-001-recontextualizacao-prontidao.md) |
| TASK-028 | Criar interfaces de pós-venda | 6 | TASK-025, TASK-026, TASK-027 | [task-028](task-028/README.md) | [001](task-028/prompt-task-028-etapa-001-recontextualizacao-prontidao.md) |
| TASK-029 | Implementar relatórios financeiros e comerciais | 6 | TASK-026, TASK-027 | [task-029](task-029/README.md) | [001](task-029/prompt-task-029-etapa-001-recontextualizacao-prontidao.md) |
| TASK-030 | Implementar backup diário completo | 6 | TASK-024 | [task-030](task-030/README.md) | [001](task-030/prompt-task-030-etapa-001-recontextualizacao-prontidao.md) |
| TASK-031 | Revisar auditoria e segurança integrada | 6 | TASK-028, TASK-029, TASK-030 | [task-031](task-031/README.md) | [001](task-031/prompt-task-031-etapa-001-recontextualizacao-prontidao.md) |
| TASK-032 | Checkpoint PHASE-04 | 5 | TASK-028, TASK-029, TASK-030, TASK-031 | [task-032](task-032/README.md) | [001](task-032/prompt-task-032-etapa-001-recontextualizacao-prontidao.md) |
| TASK-033 | Executar aceitação funcional e acessibilidade | 6 | TASK-032 | [task-033](task-033/README.md) | [001](task-033/prompt-task-033-etapa-001-recontextualizacao-prontidao.md) |
| TASK-034 | Validar desempenho e concorrência | 6 | TASK-032 | [task-034](task-034/README.md) | [001](task-034/prompt-task-034-etapa-001-recontextualizacao-prontidao.md) |
| TASK-035 | Executar restauração isolada | 6 | TASK-030, TASK-032 | [task-035](task-035/README.md) | [001](task-035/prompt-task-035-etapa-001-recontextualizacao-prontidao.md) |
| TASK-036 | Consolidar documentação operacional | 6 | TASK-033, TASK-034, TASK-035 | [task-036](task-036/README.md) | [001](task-036/prompt-task-036-etapa-001-recontextualizacao-prontidao.md) |
| TASK-037 | Checkpoint PHASE-05 e entrega da implementação | 5 | TASK-033, TASK-034, TASK-035, TASK-036 | [task-037](task-037/README.md) | [001](task-037/prompt-task-037-etapa-001-recontextualizacao-prontidao.md) |

## Lacunas e decisões antes da execução

- PD-001 a PD-009 seguem em [parâmetros](../../docs/architecture/parametros.md); bloquear somente trechos dependentes. TASK-001 é o foro de decisões propostas, sem exigência circular de tê-las todas resolvidas para começar a decisão autorizada.
- Stack/versões e comandos de aplicação não existem como configuração executável. Roteiros pedem descoberta e preenchimento futuro; nenhum script fictício de teste foi criado. Scripts, quando necessários, dependem de comandos reais e caminho Allowed na TASK, com preflight/evidência/exit code e repetição segura.
- TASK-033: aceite enumera TEST-001 a TEST-025, mas Testes necessários omite TEST-025. O roteiro inclui TEST-025 pelo critério explícito, preservando backlog original e registrando a divergência.
- TASK-034: acrescentados no roteiro TEST-027 (desempenho) e TEST-026/031 (concorrência/retomada), respaldados por objetivo e estratégia. TASK-035 inclui TEST-029 além de TEST-025 pelo cenário de restauração.
- Conjuntos transversais mencionam fluxos de fases futuras: planejar recorte verificável por incremento; no checkpoint executar a fase acumulada, sem cobrar implementação futura nem mascarar obrigatório ausente como N/A. TASK-037 acumula toda entrega.
- Nenhuma autorização de implementação, decisão de produto, teste manual, gate de execução ou TASK foi concluída por gerar estes documentos.

[Relatório da geração e validação documental](RELATORIO-GERACAO.md). [Modelos anteriores](../../docs/prompts/README.md), [AGENTS](../../AGENTS.md), [backlog](../../TASKS.md).
