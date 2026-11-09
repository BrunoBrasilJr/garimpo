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

## Rodadas anteriores

A primeira medição estabeleceu os 100 pedidos pagos e retornou
`TRANSACTION_CONFLICT` em carrinho. Foram 81 amostras parciais, preservadas em
`tests/performance/results/32e3494-failed.json`. As tentativas seguintes de
espaçar repetições e favorecer índices ainda retornaram conflitos. Com duas
conexões por pool, `994d39f` registrou oito HTTP 409 em 277 amostras.
O limite global de uma conexão, em `ebcfe48`, passou a carga, mas falhou no
teste de dois ADMINs que precisam concorrer em sessões independentes. Essas
variantes ficaram fora da versão estável.

## Medição final em 2026-11-09

A correção de origem da TASK-003 em `47b7483` permite optar por um pool
compartilhado de uma conexão por processo da API. A configuração padrão
continua disponível para os demais ambientes. Para iniciar a API local no
Ubuntu já configurado com banco e TLS, use `GARIMPO_DB_POOL_SIZE=1 npm run dev:api`.
Para reproduzir o ensaio após preparar o banco isolado de testes e gerar os
artefatos do build, use `GARIMPO_DB_POOL_SIZE=1 node tests/performance/run.mjs`.

Ubuntu WSL2 6.6.87.2, Intel i5-1235U, 3.779 MiB disponíveis ao WSL, Node
24.22.1 e PostgreSQL 17.11. HTTPS e banco reais em um novo schema de
`garimpo_test`. O perfil e seu hash ficaram iguais aos da primeira medição.
Os 100 pedidos pagos de preparação ficaram fora da amostra. Houve 720
respostas esperadas, 120 por operação, sem erros inesperados.

| Operação | p50 (ms) | p95 (ms) | Máximo (ms) | Limite p95 (ms) |
| --- | ---: | ---: | ---: | ---: |
| Busca | 182,66 | 449,52 | 627,26 | 1500 |
| Reserva | 992,75 | 2019,47 | 2156,01 | 3500 |
| Cotação | 567,77 | 1661,06 | 2004,24 | 2500 |
| Pedido Pix | 640,37 | 1337,98 | 1743,91 | 4000 |
| Pagamento | 2019,06 | 3263,16 | 3595,39 | 5500 |
| Relatório | 197,03 | 705,64 | 1075,46 | 3500 |

O ensaio conferiu 220 pedidos pagos e 220 eventos de venda, saldo final de
478 em cada uma das dez ofertas usadas e zero reservas ativas. As amostras
sem arredondamento estão em `tests/performance/results/47b7483-pass.json`.
O servidor HTTPS compilado também retornou o catálogo com 1.000 edições e
HTTP 401 para credenciais inválidas, usando uma conexão compartilhada
observada no PostgreSQL. Encerrou com código 0.

## Concorrência e gates

`npm run verify` com configuração padrão passou em build, tipos, lint,
126 unitários e 254 integrações. `node tests/concurrency/final/run.mjs`
passou em nove casos selecionados de conta, estoque, cupom, idempotência,
pagamento, prazos, estorno e troca. Com o perfil local, cinco corridas de
checkout/pagamentos com pools independentes e seis integrações de segurança
passaram novamente. Os logs `test-results/performance/local-profile-gates.log`
e `local-profile-load.log` terminaram com saída 0. O npm audit bruto retornou
exit 1 com dois LOW. A política restrita do projeto passou.

Aceitação do perfil, gates aplicáveis e DoD PASS. PRIMARY em testes e evidências
de desempenho/concorrência, neste relatório e TASKS.md. Incidental Changes: NONE.
A correção do runtime pertence à TASK-003.
