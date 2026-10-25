# Prompt — revisar a entrega de uma tarefa

**MODELO PARA ETAPA FUTURA — não executar agora.** O responsável informou que a turma ainda está na documentação. Ler ou revisar este arquivo não autoriza implementação. O texto abaixo só deve ser usado depois de uma mudança explícita de etapa pelo responsável.

## Texto do prompt

```text
Revise a tarefa do Garimpo que estiver IN_REVIEW. Se não houver, use a última tarefa com evidência real de execução em TASKS.md; se nenhuma foi executada, informe isso sem inventar um alvo.

Leia AGENTS.md, a tarefa e requisitos/ADRs relacionados. Inspecione alterações reais, critérios de aceitação, testes e evidências. Não confie apenas no relatório anterior ou em etiquetas DONE. Compare com o PDF final quando uma regra de negócio estiver envolvida.

Verifique efeitos funcionais, autorização e propriedade, concorrência/idempotência, estados de falha, contratos, dados históricos e Scope Guard. Verifique se os testes exercitam comportamento e casos negativos relevantes. Execute verificações aplicáveis disponíveis em ambiente de teste, sem publicar, usar serviços reais ou alterar dados de operação. Não corrija código nesta revisão.

Apresente somente achados acionáveis com prioridade, localização, condição que dispara o problema, consequência e correção sugerida. Separe achados de pendências/limitações de verificação. Se não houver achados, diga isso explicitamente, com os testes realmente executados. Não aprove gates que não pôde verificar nem marque DONE automaticamente; informe se há evidência suficiente para DoD e deixe o registro operacional para a execução autorizada correspondente.
```
