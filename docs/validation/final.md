# Entrega final · Garimpo

Checkpoint da PHASE-05 em 2026-11-10. A entrega reúne os cinco incrementos
do projeto local. O [guia de operação](../operations/garimpo-local.md) explica
como executar, testar, manter os backups e ensaiar a recuperação. O
[backlog](../../TASKS.md) registra dependências, commits, limites e evidências
por tarefa.

## Rastreabilidade das verificações

| Cenário | Evidência e recorte |
| --- | --- |
| TEST-026 · concorrência e dinheiro | Integrações acumuladas e nove corridas dirigidas em PostgreSQL real. Pedidos, saldo, cupom, pagamentos, prazos, estornos e respostas de troca. [Desempenho e concorrência](performance.md) |
| TEST-027 · desempenho | Perfil local congelado antes da medição. Dez clientes concorrentes, 1.000 edições, 120 amostras por operação e zero erros inesperados. Os seis p95 passaram. [Perfil e resultados](performance.md) |
| TEST-028 · acessibilidade e paridade | Navegadores Firefox, Chrome e Edge, jornadas de teclado, foco e ampliação, componentes móveis e inspeção em Android. O relatório distingue evidência física, relato humano e teste complementar no relay. [Aceitação](acceptance.md) |
| TEST-029 · backup e restauração | Backup privado, retenção, restauração em destino separado e comparação de dados, fotos e evidências. Disparo pelo agendador conferido. [Restauração](restore.md) |
| TEST-030 · segurança e arquitetura | HTTPS, papéis, sessões, origem, CSRF, propriedade e proteção de evidências. [Segurança e integração](phase-04.md) |
| TEST-031 · retomada de processamento | Integrações de fundação, carrinho, pagamentos, mensagens e trocas, incluindo processos separados, relógio de teste e idempotência. [Evidências de fase](phase-04.md) |

Os relatórios de [fundação](phase-01.md), [catálogo](phase-02.md),
[comércio](phase-03.md) e [pós-venda](phase-04.md) preservam os resultados
anteriores e suas correções. A matriz de requisitos do [README](../../README.md)
liga os cenários às regras, contratos e tarefas. Os seis ADRs ratificados
continuam em `docs/adr`.

## Recorte e limites da entrega

- A entrega foi verificada no perfil acadêmico local Windows/Ubuntu WSL2.
  Pagamento, estorno e caixa de mensagens são simulações locais.
- O teste físico Android confirmou login, reserva, compra paga e abertura
  dos atendimentos pelo banco. O responsável confirmou as verificações
  manuais. A foto e o aceite que não apareceram naquele schema foram
  validados em outro schema, usando o cliente móvel e o relay HTTPS. O
  relatório de aceitação preserva a diferença entre as duas sessões.
- TalkBack ficou fora da conferência por escolha expressa do responsável.
  iOS foi avaliado por bundle. A execução em aparelho iOS e uma certificação
  de acessibilidade permanecem sem evidência.
- Os números de carga e a política local de backup são decisões técnicas
  delegadas. A rubrica acadêmica adicional e a publicação em produção
  continuam fora do recorte validado.

## Revisão do checkpoint

Ambiente Ubuntu WSL2, Node 24.22.1, npm 11.19.1 e PostgreSQL 17.11. O runner
em `test-results/phase-05/final-verify.log` iniciou a verificação em
`c002c14`. Quatro casos de preços falharam por validade inicial do
certificado da fixture. A repetição passou 12/12 em `pricing-retry.log`,
com a mesma implementação e TLS ativo. A sequência continua em
`final-resume.log`. Os resultados acumulados acima são de verificações
identificadas em seus relatórios.
