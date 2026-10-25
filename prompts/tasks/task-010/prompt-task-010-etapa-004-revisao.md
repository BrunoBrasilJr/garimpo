# TASK-010 — ETAPA 004 — Revisão de escopo e qualidade

MODELO PARA USO FUTURO. A solicitação de 2026-10-25 autoriza apenas gerar estes documentos. Ler, copiar ou receber este arquivo não autoriza executar a TASK. Exigir autorização explícita futura do responsável, específica à TASK ou continuidade expressa, antes de iniciar. Gate aprovado habilita somente a próxima etapa da mesma TASK; não autoriza a próxima TASK. Não executar automaticamente a etapa seguinte.

## 1. OBJETIVO

Revisão de escopo e qualidade para TASK-010 — Criar catálogo público no site. Entregar busca/filtros, página de edição, ofertas e áudio por faixa na web.

## 2. CONTEXTO

Estado inicial em 2026-10-25: BLOCKED; fase PHASE-02; prioridade HIGH. Nenhuma TASK foi executada. Não há Git, código, manifests, banco ou testes de aplicação nesta pasta. Caminhos técnicos são futuros, sujeitos à stack ratificada; seis ADRs PROPOSED.

Objetivo específico: Entregar busca/filtros, página de edição, ofertas e áudio por faixa na web.

Descrição operacional: Buscar título/artistas de edição e faixa/faixas; filtros combinados e década pelo ano da edição. Cobrir vazio, esgotado, áudio ausente e valores desconhecidos. Navegação pública com teclado/foco/rótulos.

Dependências/predecessoras diretas: TASK-008. Conferir seus artefatos e relatórios, não só estados. Bloqueadoras iniciais: TASK-008.

Rastreabilidade: RF-005, RF-006; RN-004, RN-005, RN-026, RN-032, RN-036, RN-045; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010; UC-005, UC-006. ADRs: ADR-001.

Pendências ligadas à tarefa (PD-005 também condiciona os módulos técnicos):

| ID | Decisão necessária | Tarefas afetadas |
| --- | --- | --- |
| PD-005 | Parâmetros técnicos: Ratificar stack herdada, versões, sessão, hash, proteção das mensagens, armazenamento, prazo de links de alteração/reativação e estratégia transacional. Reset 30min, confirmação inicial 24h e limites de imagens já decididos. | TASK-001 e módulos dependentes |

Matriz de domínio/API do README (referência de análise, não expansão de escopo):

| RF | RNs | RNFs | UC | Entidades | API | Testes | TASKs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RF-005 | RN-004, RN-032, RN-036 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008 | UC-005 | Edition, Artist, Track, TrackArtist, Genre, Offer | API-005.* | TEST-005 | TASK-008, TASK-010, TASK-011, TASK-033 |
| RF-006 | RN-004, RN-005, RN-026, RN-032, RN-036, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010 | UC-006 | Edition, Track, Offer, ProductImage | API-006.* | TEST-006 | TASK-008, TASK-010, TASK-011, TASK-033 |

Critérios de aceite da fonte: Busca de artista inclui faixa; década usa edição; ausentes não inventados; catálogo público acessível.

## 3. PRÉ-CONDIÇÕES

- Autorização explícita futura identificada e Scope Guard vigente lido.
- GATE-003 e todos seus predecessores aprovados com evidência atual; falta de relatório bloqueia esta etapa.
- DEPENDS_ON: TASK-008; checkpoint anterior e artefatos conferidos. A geração não satisfez essas dependências.
- Ambiente, baseline e decisões compatíveis com o recorte da etapa; nenhuma hipótese usada como fato. TASK-001 resolve suas próprias propostas sem implementação.

## 4. ENTRADAS NECESSÁRIAS

Ler os arquivos atuais nesta ordem: `AGENTS.md` e `docs/architecture/conciliacao.md`; `README.md`; `TASKS.md` (índice, seção TASK-010, dependências e Scope Guard); ADRs relacionados em `docs/adr/`, `docs/architecture/architecture.md`, `api.md`, `data-model.md`, `testing.md`, `parametros.md` e diagramas relevantes; depois código/testes dos módulos afetados quando existirem. Conferir respostas de origem em `docs/sources/elicitacao-final.md` nas regras relacionadas. Recuperar autorização, plano, histórico e relatórios anteriores; ausência deve ser registrada. Consultar `roteiro-testes-manuais.md` desta pasta.

## 5. ARQUIVOS E COMPONENTES ENVOLVIDOS

ALLOWED CHANGES da TASK (limites de caminho **e finalidade**, não autorização automática desta etapa):

- apps/web/src/features/catalog/**
- tests/e2e/catalog-web/**
- TASKS.md — somente estado/evidência desta TASK e prontidão comprovada de dependentes

Foco de componentes/impactos: Buscar título/artistas de edição e faixa/faixas; filtros combinados e década pelo ano da edição. Cobrir vazio, esgotado, áudio ausente e valores desconhecidos. Navegação pública com teclado/foco/rótulos.

Na etapa 001 apenas leitura; planejamento não altera produção; revisão apenas leitura; execução manual altera somente dados de teste e evidência autorizada. Planejar explicitamente impactos em arquitetura, persistência, APIs, interfaces, segurança e testes; N/A precisa de causa concreta. Localizar componentes existentes sem inventar métodos, classes ou tabelas extras.

## 6. PROCEDIMENTO DETALHADO

1. Inspecionar `git status --short --branch`, `git diff --stat`, `git diff` e `git diff --cached` se Git existir; listar não rastreados e comparar com inventário inicial. Sem Git, comparar arquivos/hash e registrar N/A de histórico. Não afirmar revisão de diff inexistente.
2. Conferir cada critério do aceite contra arquivo/trecho e comportamento verificável, com foco: Buscar título/artistas de edição e faixa/faixas; filtros combinados e década pelo ano da edição. Cobrir vazio, esgotado, áudio ausente e valores desconhecidos. Navegação pública com teclado/foco/rótulos.
3. Revisar arquitetura ratificada, modelos/migrations permitidos, API/erros, interfaces, autorização/propriedade, dados históricos, concorrência e idempotência conforme impacto do plano. Não aceitar stub em runtime liberando compra/regra comercial.
4. Classificar todos arquivos PRIMARY/INCIDENTAL; aplicar Forbidden > Allowed > Incidental. Remover da entrega somente artefatos próprios indevidos mediante retorno à etapa de alteração, preservando usuário. Identificar logs de debug, segredos, temporários e mudanças alheias.
5. Emitir achados acionáveis com prioridade, arquivo/linha, gatilho, consequência e correção sugerida. Esta revisão não corrige código: retornar à etapa de alteração autorizada, repetir gates afetados e revisão.
6. Conferir testes e evidências disponíveis sem transformar plano em execução. Preparar passagem para testes manuais; resultados ainda ausentes ficam NÃO EXECUTADOS, sem aprovação antecipada.

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

Vincular cada saída da etapa a arquivo/trecho, comando/procedimento, ambiente, resultado/exit code e evidência. Critério de aceite: Busca de artista inclui faixa; década usa edição; ausentes não inventados; catálogo público acessível.

Testes da TASK: TEST-005, TEST-006. Executar os casos pertinentes ao incremento descrito nesta tarefa; os fluxos cuja integração é explicitamente posterior só são aceitos no respectivo checkpoint. Concorrência real nas regras transacionais.

Usar roteiro manual, com recorte explícito do incremento e casos adicionais exigidos pelo aceite. Gates globais GATE-01 a GATE-08 de AGENTS são distintos dos gates locais GATE-001 a GATE-006. Build/tipos/lint/testes aplicáveis continuam obrigatórios; execução automática pelo agente não substitui validação manual. Sem comandos existentes, registrar lacuna; não usar comandos presumidos nem registrar PASS.

## 9. TRATAMENTO DE FALHAS

Interromper avanço; registrar operação/comando, ambiente, código de saída, erro completo sem segredos e evidência. Separar FATO CONFIRMADO, EVIDÊNCIA, INFERÊNCIA, HIPÓTESE e PENDÊNCIA. Diagnosticar causa e avaliar Allowed/Forbidden/Incidental. Fazer somente menor correção autorizada; repetir a validação afetada e atualizar o gate, invalidando gates posteriores dependentes. Em revisão somente de leitura ou teste manual, devolver correção à etapa autorizada e revisar novamente. Produção proibida nesta TASK não pode ser corrigida nela. Erro de execução/validação: FAILED conforme AGENTS; dependência/decisão externa ausente: BLOCKED. Nenhum teste vira APROVADO sem reexecução manual. Preservar trabalho e não remover teste, desativar validação nem trocar concorrência real por mock sequencial.

## 10. SCOPE ESCALATION

Se necessário sair do escopo, parar e preencher o modelo de AGENTS.md sem inventar exceção:

```text
## SCOPE ESCALATION
TASK: TASK-010
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

GATE-004 — Revisão de escopo e qualidade. Estado inicial: PENDENTE; não executado nesta geração.

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
TASK: TASK-010
ETAPA: 004
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
prompt-task-010-etapa-005-testes-manuais.md
PRÓXIMA ETAPA HABILITADA:
SIM | NÃO
MOTIVO:
[evidência para habilitar, bloqueio concreto ou encerramento sem próxima etapa]
==================================================
```
