# Revisão de segurança integrada — TASK-031

Revisão de 2026-11-07. Base publicada 00a25f4, branch
chore/TASK-031-security-review. Autorização contínua do responsável até os 100%.
Dependências 028/029/030 concluídas; ADR-002/005/006 aceitos.

## Evidências e achados

Ambiente: Ubuntu WSL2, Node 24.22.1, npm 11.19.1, PostgreSQL 17 local.
Cada runner cria schema UUID em garimpo_test, preservado; não usa a base original.
Os testes HTTP usam certificados verificados e dados sintéticos.

| Verificação | Resultado e evidência local |
| --- | --- |
| Matriz ADMIN/OPERATOR/cliente, objeto de outro titular, evidência privada, HTTPS/Origin/CSRF, credenciais ambíguas, segredos e bloqueio | Seis testes integrados PASS em security/posting-final.log |
| Último ADMIN, duas transações efetivamente concorrentes e sessões internas | 14 contas PASS em security/verify.log |
| Tokens, propósitos, validade, revogação global, caixa protegida, falha e repetição | 16 mensagens PASS em security/verify.log e exchanges-final.log |
| Bloqueio/encerramento/reativação, pedidos pagos e trilha transacional | 16 ciclo de conta PASS em security/verify.log |
| Silêncio nas etapas internas, decisão/prazo imutável e postagem necessária | Sete devoluções PASS em security/posting-final.log |
| Oferta com prazo original, remessas e disputa real de respostas/expiração | Seis trocas PASS em security/exchanges-final.log |

O teste negativo 72c3c82 revelou que o consumidor aceitava evento de devolução
com aggregateId inexistente: cinco PASS e um FAIL em security/event-check.log.
O processamento agora confere o atendimento, seu pedido e o destinatário antes
de criar mensagem. Não há mensagem nem processedAt em evento inválido; a falha
fica registrada para diagnóstico. A mesma validação cobre trocas.

A revisão de RN-042 revelou avisos em etapas internas de pós-venda e texto
genérico que perdia o significado da decisão. Correções ficaram nas tarefas de
origem, não nesta revisão sem permissão de alterar produção: 09e6a99/6e80139
(026), 4781590/5626ae3/d4f740e/4a87828 (027) e 2ae42b3/34e545b (026).
Eventos novos congelam ação, estado e prazo. Eventos antigos com atendimento
válido continuam compatíveis. Autorização que exige retorno físico posterior
gera aviso de postagem; autorização financeira comum não acrescenta aviso.

Falhas de preparação de testes foram preservadas: interferência do relógio nos
casos novos de troca em exchanges-fix.log e inferência de status no teste de
postagem em posting-fix.log. As expectativas e validações foram mantidas.

## Gates e limites

Build/tipos/lint PASS nas revisões corretivas; testes unitários acumulados
mantidos e nova execução integral no checkpoint 032. Integração, API, segurança,
aceitação deste recorte e regressão PASS pelas evidências acima. A auditoria npm
bruta mantém dois achados LOW e exit 1; não é auditoria limpa. Política restrita
de patch/hash/regressões PASS em verify.log, com node-forge na versão corrigida
e mitigação revisada de deepmerge. Dependências não mudaram nas correções.

Arquivos PRIMARY desta TASK: tests/security/**, este documento e TASKS.md.
Incidental Changes: NONE. Allowed Changes PASS, Forbidden Changes PASS,
Scope Creep NONE, DoD PASS. FAILED → IN_PROGRESS → IN_REVIEW → DONE.
Esta revisão não é certificação, avaliação acadêmica ou validação física mobile.
