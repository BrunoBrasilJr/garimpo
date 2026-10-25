Este documento define as regras obrigatórias para qualquer agente de programação que opere neste repositório.

# Contrato operacional do Garimpo

## 1 Autorização e responsabilidade

**Etapa atual: somente documentação.** O responsável esclareceu que o professor ainda não chegou à implementação. Pedidos genéricos como “continuar” ou “terminar” se referem ao planejamento, validação, prompts e regras do agente; não autorizam executar o backlog, inclusive TASK-001. A passagem ao desenvolvimento exige instrução futura explícita do responsável. Os prompts de execução/revisão de código são modelos guardados para essa etapa futura, não ordens ativas ao serem lidos.

O responsável autorizou reconciliar o planejamento com o PDF final de 14 rodadas/98 respostas. Essa revisão documental não é execução de uma tarefa de implementação. Isso não autoriza iniciar implementação, instalar dependências, criar banco, migrations, endpoints, interfaces ou infraestrutura. Antes da primeira execução, obter autorização de desenvolvimento. Uma autorização específica de TASK não autoriza tarefas seguintes.

IDs RF, RN, RNF, UC, TASK, ADR e PD são permanentes. Não reutilizar nem renumerar após exclusão; marcar DEPRECATED/CANCELLED ou equivalente e preservar histórico. Não alterar fonte original nem requisitos confirmados para contornar pendências. Nesta conciliação, a instrução explícita do responsável resolve os conflitos antigos em favor do PDF final; não reabrir perguntas já respondidas.

## 2 Ordem de leitura

Antes de cada TASK, ler nesta ordem:

1. AGENTS.md e registro de conciliação em docs/architecture/conciliacao.md.
2. README.md, incluindo pendências e referências estruturais.
3. TASKS.md, índice, tarefa, dependências e Scope Guard.
4. ADRs relacionados e documentos de arquitetura/API/testes relevantes.
5. Código existente dos módulos afetados.
6. Testes existentes dos módulos e dependências relevantes.

## 3 Fontes de verdade e conflitos

A fonte de requisitos é o PDF final, transcrito em docs/sources/elicitacao-final.md; docs/architecture/conciliacao.md mapeia as 98 respostas. README.md consolida o que construir e por quê: escopo, requisitos, regras, domínio, modelo, arquitetura e API. TASKS.md define ordem, dependências, prioridades, estados, limites e critérios operacionais. AGENTS.md define comportamento e processo. docs/adr define decisões arquiteturais. Documentos de arquitetura/diagramas detalham o README sem contradizê-lo. Código e testes materializam essas decisões.

Orientação de precedência: instruções explícitas do responsável, respostas finais do PDF, consolidação do README, ADRs ratificados, AGENTS, TASK e código existente. Respostas posteriores no próprio PDF refinam anteriores. Não atribuir aprovação às supostas sete rodadas do pacote anterior. Não resolver sozinho conflito relevante entre essas fontes: parar, apresentar conflito e solicitar decisão. Um ADR PROPOSED não pode ser tratado como ACCEPTED. Instruções explícitas posteriores do responsável devem ser incorporadas de forma rastreável, sem apagar a divergência.

README não deve ser alterado para registrar início/fim de tarefa, commits ou resultados de teste. Isso pertence a TASKS. Alterar README somente por mudança real de especificação, modelo, API, escopo ou documentação estrutural, autorizada quando necessário.

## 4 Seleção da tarefa

Com autorização de execução, localizar primeira TASK elegível READY na ordem estabelecida, respeitando fase e prioridade. Validar requisitos, regras, RNFs, UCs, ADRs, contratos e critérios de aceitação. Não saltar dependências por conveniência. Se nenhuma estiver READY, verificar se dependências concluídas permitem promover alguma tarefa após validar DoR; se não, explicar bloqueio e parar.

Cada fase termina em checkpoint. A fase seguinte não inicia antes de o checkpoint anterior estar DONE. O grafo deve continuar sem ciclos após qualquer alteração autorizada. Autorização para implementar uma tarefa bloqueada não é motivo para fingir que dependências estão prontas: esclarecer como resolvê-las.

## 5 Definition of Ready

Promover a READY somente quando:

- Requisitos, critérios de aceitação e contratos necessários estiverem definidos.
- Todas as DEPENDS_ON estiverem DONE; seus artefatos e implementação existirem.
- Testes relevantes das dependências continuarem passando, sem regressão conhecida.
- Decisões arquiteturais necessárias estiverem resolvidas e ADRs ratificados.
- PDs impeditivas daquela tarefa estiverem resolvidas.
- Testes esperados e Scope Guard estiverem completos e compatíveis com o objetivo.

Caso contrário, manter/retornar BLOCKED e registrar causa. TASK-001 é uma tarefa documental para resolver propostas e parâmetros; não requer que suas próprias decisões já estejam tomadas, mas não pode implementar antecipadamente. Pendência acadêmica não bloqueia módulos independentes, mas ambiente local/Android exclusivo não são premissas aprovadas. Registrar proposta e condição de validação sem afirmar decisão inexistente.

## 6 Branch e início

Branch estável: main. Não desenvolver diretamente nela. Usar feature/TASK-xxx-descricao-curta, fix/TASK-xxx-descricao-curta ou chore/TASK-xxx-descricao-curta; preferir uma TASK por branch. Antes de editar, inspecionar estado do repositório e preservar alterações não relacionadas do usuário.

Após autorização e validação da DoR, criar branch e mudar READY → IN_PROGRESS em TASKS.md, mantendo índice e seção coerentes. Não criar branches fictícias nos relatórios. Se ainda não existir repositório, configurar somente na tarefa de estrutura autorizada e registrar essa condição.

## 7 Scope Guard

Precedência obrigatória: Forbidden Changes > Allowed Changes > Incidental Changes.

Allowed Changes define escopo primário técnico e semântico. Caminhos que ainda não existem podem ser materializados de acordo com o módulo descrito; isso não autoriza ampliar responsabilidade. Alteração de um arquivo compartilhado deve limitar-se ao trecho diretamente necessário. Permissão de migration vale apenas para modelos listados na TASK.

Forbidden Changes é limite forte, mesmo se houver sobreposição com Allowed Changes. Necessidade de violação exige parada e decisão. Não adicionar requisito, implementar tarefa futura, alterar regra de negócio, refatorar amplamente, modificar arquitetura significativa sem ADR, remover testes para passar build ou desabilitar validação.

Incidental Changes Policy pode ser MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED ou NO_INCIDENTAL_CHANGES. Na segunda, nenhuma alteração fora do escopo primário é permitida. Na primeira, aplicar todos os nove critérios abaixo antes da edição.

## 8 Teste de alteração incidental

Pergunta de causalidade: “Esta alteração somente se tornou necessária como consequência direta da TASK atual?” Se não, não pertence à tarefa.

1. Necessidade: indispensável para implementar, compilar, testar ou integrar a tarefa.
2. Causalidade: consequência direta do trabalho atual.
3. Minimalidade: menor mudança razoável para resolver a necessidade.
4. Escopo funcional: não introduz funcionalidade independente.
5. Negócio: não cria nem modifica regra de negócio.
6. Arquitetura: não muda decisão arquitetural relevante.
7. Contrato: não quebra contrato público.
8. Segurança: não altera comportamento relevante de autenticação, autorização ou proteção de dados.
9. Proibição: não está em Forbidden Changes.

Somente se todos os critérios aplicáveis forem satisfeitos a mudança é incidental válida. Exemplos: import/export, registro mínimo de componente, tipo compartilhado diretamente afetado, fixture/mock correspondente ou configuração mínima de teste. Aplicar Minimum Necessary Change. Não fazer limpeza geral, atualização oportunista de dependências, reorganização ampla ou correção de bug alheio.

O orçamento incidental é qualitativo e excepcional. Várias mudanças dispersas, múltiplos módulos sem relação, alteração estrutural, nova regra ou mudança arquitetural deixam de ser incidentais. Parar e emitir SCOPE ESCALATION.

## 9 Scope Escalation

Quando faltar escopo autorizado, não implementar silenciosamente. Verificar se já existe TASK correspondente; senão, propor nova tarefa rastreável. Usar:

```text
## SCOPE ESCALATION
TASK: TASK-xxx
Necessidade identificada: ...
Motivo: ...
Arquivos/módulos afetados: ...
Allowed Changes atual: ...
Forbidden Changes relacionado: ...
Por que não é uma Incidental Change: ...
Impacto se não realizada: ...
Alternativas: ampliar escopo; criar TASK; ajustar dependências; criar/atualizar ADR; revisar arquitetura; outra opção justificada.
Recomendação: ...
Decisão necessária: ...
```

Aguardar decisão quando a continuação depender dela. Não inventar exceções às regras do projeto.

## 10 Qualidade e testes

Antes de concluir, executar gates aplicáveis:

| Gate | Verificação | Aplicação |
| --- | --- | --- |
| GATE-01 | Build e verificação de tipos | Código/configuração e checkpoints de implementação |
| GATE-02 | Lint | Código/configuração e checkpoints |
| GATE-03 | Unit Tests | Regras e funções alteradas |
| GATE-04 | Integration Tests | Persistência, transações e composição |
| GATE-05 | API Tests | Contratos e autorização de endpoints |
| GATE-06 | Security Checks | Acesso, dados, arquivos e configuração afetados |
| GATE-07 | Acceptance Criteria | Obrigatório para toda TASK, inclusive documental |
| GATE-08 | Regression Tests | Fluxos existentes afetados e checkpoints |

Comandos reais serão definidos na estrutura do projeto; lê-los no repositório, não inventar resultados. N/A exige motivo e não equivale a PASS. Uma TASK não pode ser DONE com gate obrigatório falhando. Executar testes relevantes, sem repetir/broadenar testes sem risco concreto; checkpoints exigem os gates acumulados da fase. Testes de corrida precisam de concorrência real, não somente mocks sequenciais.

TEST-001 a TEST-035 no plano são cenários planejados. Nenhum resultado está aprovado antecipadamente. Testar com relógio controlado e banco de teste separado; não aguardar prazos reais desnecessariamente nem criar alteração de relógio exposta ao usuário. Restauração nunca sobrescreve a base original para fins de demonstração.

## 11 Definition of Done

DONE exige objetivo implementado/documentado conforme a tarefa, critérios atendidos, build/lint e testes aplicáveis aprovados, segurança/erros adequados, contratos preservados, documentação necessária atualizada, ausência de regressão conhecida, commits rastreáveis e TASKS atualizado.

Classificar cada arquivo alterado como PRIMARY ou INCIDENTAL antes de concluir. PRIMARY deve pertencer ao escopo primário; INCIDENTAL deve passar no teste de nove critérios e no orçamento. Nenhuma mudança pode violar Forbidden Changes, introduzir scope creep ou criar efeito colateral injustificado.

Registrar alterações incidentais em tabela Arquivo/Componente, Alteração e Justificativa. Se não houver, registrar “Incidental Changes: NONE”. Sem todos os critérios, não marcar DONE.

## 12 Estados

Fluxo normal: BLOCKED → READY → IN_PROGRESS → IN_REVIEW → DONE.

Falha de implementação ou validação: IN_PROGRESS/IN_REVIEW → FAILED. Registrar causa, corrigir no escopo e com autorização vigente, voltar à execução/revisão e repetir gates relevantes antes de DONE. Dependência externa ausente torna a tarefa BLOCKED. Cancelamento explícito usa CANCELLED, preservando ID e histórico. Não marcar dependência como DONE apenas para liberar outra.

## 13 Critérios de parada

Parar diante de requisito ambíguo, contradição, regra indefinida, dependência ausente/inválida, ADR necessário não resolvido, escopo incompatível, Forbidden Change necessário, risco de perda de dados, segurança imprevista, quebra de contrato ou testes prévios falhando por causa externa. Não mascarar erro com mock, remoção de teste ou validação desativada.

```text
## BLOCKER
TASK: TASK-xxx
Problema: ...
Impacto: ...
RF/RN/RNF/UC/ADR afetados: ...
Alternativas: ...
Recomendação: ...
Decisão necessária: ...
```

Preservar trabalho já feito, informar estado real e aguardar decisão quando necessária. Questão secundária independente pode permanecer PD sem bloquear outra tarefa, desde que explicitamente documentada.

## 14 Commits

Conventional Commits: `<tipo>(<escopo>): <descrição> [TASK-xxx]`.

Tipos: feat, fix, test, refactor, docs, chore, build, ci. Commits pequenos, coesos e relacionados à tarefa; não misturar mudanças do usuário. Exemplo de formato: `feat(cart): implement reservation expiry [TASK-016]`. Não inventar hash nem registrar commit que não ocorreu.

## 15 Relatório final

```text
## TASK Execution Report
TASK: TASK-xxx
Status: DONE | FAILED | BLOCKED | IN_REVIEW
Branch: ...
Commits: ...

### Primary Changes
...

### Incidental Changes
Arquivo/Componente | Alteração | Justificativa
ou Incidental Changes: NONE

### Tests Executed
Comandos/procedimentos, ambiente e resultados reais.

### Quality Gates
Build: PASS/FAIL/N/A e motivo
Lint: PASS/FAIL/N/A e motivo
Unit Tests: PASS/FAIL/N/A e motivo
Integration Tests: PASS/FAIL/N/A e motivo
API Tests: PASS/FAIL/N/A e motivo
Security: PASS/FAIL/N/A e motivo
Acceptance Criteria: PASS/FAIL
Regression Tests: PASS/FAIL/N/A e motivo

### Scope Validation
Allowed Changes: PASS/FAIL
Incidental Changes: PASS/FAIL/NONE
Forbidden Changes: PASS/FAIL
Scope Creep: NONE ou descrição

### Definition of Done
PASS | FAIL

### Next Eligible TASK
TASK-xxx | NONE
```

## 16 Continuidade

Após concluir: apresentar relatório, identificar próxima tarefa elegível e parar. A próxima TASK exige nova autorização, salvo execução contínua explicitamente autorizada pelo usuário. Nesse caso, repetir integralmente DoR, dependências, Scope Guard, branch, testes e DoD para cada tarefa. Execução contínua não permite ignorar bloqueios nem checkpoints.

Não misturar responsabilidades: README = o que construir e por quê; AGENTS = como o agente trabalha; TASKS = o que fazer agora, em qual estado e limites; ADRs = por que decisões foram tomadas; código/testes = implementação.


## 17 Guardas específicos do Garimpo

- Carrinho não reserva. Checkout único por cliente reserva conjunto por 15 minutos; Pix 30 minutos e boleto 2 dias a partir do pedido, até 3 pendentes.
- USER é conta de compra; ADMIN/OPERATOR são internos separados. OPERATOR não autoriza estorno de pós-venda nem exceção, não bloqueia cliente nem gere internos/configurações. Último ADMIN deve ser protegido.
- Confirmação inicial de e-mail 24h; reset 30min e revogação global. Bloqueado/encerrado não acessa sessão; reativação não desfaz bloqueio.
- Troca pode aguardar 30 dias após conferência; oferta tem 48h completas e exige aceite. Não simplificar ausência de substituto para estorno imediato.
- Relatórios financeiros usam data de cada evento; ticket usa coorte com ajustes conhecidos; gênero principal evita duplicação.
- Não reintroduzir sete backups, 2 segundos, cinco usuários, 27 UFs, prazos de frete, Android exclusivo ou dispensa de HTTPS como decisões aprovadas.
- Nesta revisão, não criar material de apresentação. Documentação operacional futura não equivale a slides/roteiro de aula.

Mudanças de planejamento podem revisar tarefas, regras e ADRs quando explicitamente autorizadas pelo responsável; registrar origem, escopo e validação documental, sem fingir executar uma TASK de software. Sem repositório Git existente, não inventar branch/commit nem inicializar Git fora da tarefa autorizada de estrutura.
