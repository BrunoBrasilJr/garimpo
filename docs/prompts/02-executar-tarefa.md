# Prompt — executar uma tarefa elegível

**MODELO PARA ETAPA FUTURA — não executar agora.** O responsável informou que a turma ainda está na documentação. Ler ou revisar este arquivo não autoriza implementação. O texto abaixo só deve ser usado depois de uma mudança explícita de etapa pelo responsável.

## Texto do prompt

```text
Autorizo executar somente a primeira tarefa elegível do Garimpo, na ordem de TASKS.md, respeitando AGENTS.md. Antes de agir, inspecione o estado real dos arquivos, eventual repositório Git e alterações existentes; preserve trabalho alheio.

Leia AGENTS.md, README.md, TASKS.md, a conciliação com o PDF final e os ADRs/documentos relacionados. Localize a primeira READY, confirme dependências DONE, artefatos e testes aplicáveis das dependências, critérios, pendências e Scope Guard. Se uma tarefa bloqueada puder ser promovida com evidência, atualize índice e seção juntos. Não ignore bloqueios para escolher outra arbitrariamente.

Na situação inicial, a primeira é TASK-001: execute apenas sua revisão documental de decisões técnicas e parâmetros. Não crie código, banco, migrations ou infraestrutura nessa tarefa. Requisitos decididos nas 98 respostas não precisam de nova entrevista. Para escolhas técnicas autorizadas, investigue e documente alternativas; consulte documentação oficial ao validar versões. Para decisões de produto ausentes que impeçam a tarefa, apresente a questão concreta e sua consequência, sem assumir aprovação por silêncio.

Quando a tarefa selecionada autorizar implementação, siga seu escopo específico: branch se houver repositório, atualização de estado, alterações mínimas, testes e gates pertinentes. Não desenvolva diretamente em main. Não inicialize Git fora da tarefa de estrutura autorizada; se não houver repositório, registre branch/commit como N/A.

Ao concluir, classifique mudanças PRIMARY/INCIDENTAL, registre comandos/resultados reais e atualize TASKS.md com estado verdadeiro. DONE exige DoD; testes não executados não são PASS. Apresente o relatório do AGENTS.md, indique a próxima tarefa elegível e pare. Esta autorização não cobre tarefas seguintes nem publicação, cobrança real ou material de apresentação.
```
