# Prompt — validar o planejamento

Revise documentalmente o planejamento do Garimpo. Não implemente código, instale dependências ou configure infraestrutura.

Leia AGENTS.md, README.md, TASKS.md, docs/architecture/conciliacao.md, docs/sources/elicitacao-final.md, os seis ADRs, contratos de API, modelo de dados, estratégia de testes e diagramas. O responsável confirmou que as 14 rodadas/98 respostas do PDF são a fonte final. Respostas posteriores no PDF refinam anteriores; não restaurar decisões das supostas sete rodadas do pacote antigo.

Verifique requisitos, regras, atores, fluxos, entidades, APIs e critérios contra as respostas. Confira rastreabilidade nos dois sentidos, IDs permanentes, dependências sem ciclos, checkpoints, estados iniciais, Allowed Changes e Forbidden Changes. Distinga decisão de produto confirmada, proposta técnica e pendência real.

Dê atenção à separação USER/ADMIN/OPERATOR, carrinho sem reserva, checkout único de 15 minutos, Pix de 30 minutos, boleto de 2 dias, limite de três pendentes, cartão antes de pedido, estornos tardios, cupom configurável, espera de troca de 30 dias, oferta de 48 horas e relatórios por evento/coorte. Confira também confirmação de e-mail, ciclo de conta, evidências privadas e último ADMIN.

Entregue os problemas concretos por prioridade, com arquivo/trecho, resposta de origem, impacto e correção sugerida. Se não houver problema, diga o que foi verificado e quais limitações permanecem. Não modifique os documentos durante esta revisão. Não afirme testes de software executados nem aprovação do professor. Pendências já explícitas não são automaticamente defeitos; explique apenas quais tarefas dependem delas.
