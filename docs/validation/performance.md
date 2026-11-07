# Desempenho e concorrência — TASK-034

## Perfil fixado antes de medir — PD-007

Decisão técnica local de 2026-11-07 sob a delegação explícita do responsável
para escolhas técnicas e execução contínua até 100%. Não é um número atribuído
ao PDF nem uma meta aprovada especificamente pelo professor. A explicação
anterior de backup/carga foi esclarecida ao responsável sem presumir que
“não entendi” significasse aprovação de números. A delegação anterior é a
origem desta escolha operacional. Não se importam os antigos 2s/5 usuários.

Perfil versionado em tests/performance/profile.json antes de qualquer medição:
1.000 edições ativas, uma oferta/foto e duas faixas por edição; dez clientes
sintéticos e duas contas internas. Cem pedidos pagos de preparação antes da
amostra; dez clientes concorrentes executam doze ciclos completos cada, com
120 amostras por operação e 720 no total. Cada cliente usa uma oferta distinta
para separar capacidade da API de disputas intencionais pelo mesmo estoque.
As corridas sobre recursos compartilhados têm ensaio específico e invariantes.

| Operação HTTPS real | Limite p95 em milissegundos |
| --- | ---: |
| Busca | 1500 |
| Reserva do conjunto | 3500 |
| Cotação do endereço | 2500 |
| Criação do pedido Pix | 4000 |
| Confirmação do pagamento simulado | 5500 |
| Relatório financeiro/coorte | 3500 |

Zero respostas inesperadas é obrigatório. Percentil por posto superior
ceil(0,95 × n), sem arredondar para aprovar. Registrar p50, p95, máximo e amostras
reais; não excluir erros ou outliers. Usar relógio monotônico performance.now
para duração. O relógio de negócio fica injetado apenas na fixture, sem alterar
o relógio do sistema ou criar parâmetro público de tempo.

Ambiente previsto: Windows com 8 GB de RAM, Ubuntu WSL2 limitado a aproximadamente
3,8 GB, Node 24.22.1/npm 11.19.1/PostgreSQL 17, banco garimpo_test e schema UUID
novo. Registrar ambiente observado e revisão exata no resultado. Nenhum outro
runner do projeto executa em paralelo com a medição. Contas, catálogo, preparação
do carrinho e aceite de endereço ficam fora dos tempos de cada endpoint. Os
pedidos de preparação e os medidos usam o fluxo de negócio real; a massa de
catálogo é uma fixture explícita, nunca dados ou bypass de runtime.

Este perfil mede API em máquina acadêmica local, sem latência de rede externa,
tempo de pintura, carga de produção, cold start ou SLA. As metas ficam congeladas
nesta revisão. Uma falha exige diagnóstico/correção rastreável e nova medição;
não relaxar limites para fabricar PASS.

## Estado

PD-007 resolvida para este ensaio delegado. READY, resultados ainda NÃO EXECUTADOS.
Escopo primário: tests/performance, tests/concurrency/final, este documento e
TASKS.md. NO_INCIDENTAL_CHANGES; código de produção/migrations proibidos.
