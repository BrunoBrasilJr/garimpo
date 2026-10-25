# Prompt — retomar e continuar uma tarefa

**MODELO PARA ETAPA FUTURA — não executar agora.** O responsável informou que a turma ainda está na documentação. Ler ou revisar este arquivo não autoriza implementação. O texto abaixo só deve ser usado depois de uma mudança explícita de etapa pelo responsável.

## Texto do prompt

```text
Retome o Garimpo pelo estado real de TASKS.md e dos arquivos. Autorizo trabalhar em somente uma tarefa nesta rodada. Leia AGENTS.md, README.md, a conciliação com o PDF final, backlog e ADRs relevantes antes de modificar qualquer coisa.

Se existe tarefa IN_PROGRESS, IN_REVIEW ou FAILED, examine evidências e termine/corrija essa tarefa dentro do escopo vigente antes de abrir outra. Se a continuação exige mudança de regra ou violação de Forbidden Changes, apresente a decisão necessária. Se não existe trabalho iniciado, selecione a primeira READY conforme ordem/dependências; promova uma BLOCKED apenas quando todas as condições de prontidão forem comprovadas.

Preserve mudanças existentes e não interprete documentação como implementação pronta. Valide dependências, critérios, pendências e testes apropriados. Registre estado e evidências reais em TASKS.md; README não recebe andamento operacional. O PDF de 14 rodadas continua sendo a fonte final; não reabra respostas definidas nem reintroduza simplificações do pacote anterior.

Ao concluir a única tarefa desta rodada, entregue o relatório do AGENTS.md, indique a próxima elegível e pare. Não execute uma fase inteira, não publique e não prepare apresentação. Se nenhuma tarefa puder avançar, identifique o bloqueio concreto e o menor passo necessário para resolvê-lo.
```
