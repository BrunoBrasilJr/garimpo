# Restauração isolada · TASK-035

## Procedimento e política local

No perfil Windows/Ubuntu WSL2, o backup privado roda diariamente às 03h, com
retenção de 30 dias. O ensaio de restauração roda no primeiro dia de cada mês
às 04h. O horário mensal foi escolhido sob a delegação técnica do responsável
para separar os dois procedimentos. O agendador tenta recuperar uma execução
perdida quando a sessão Windows está ativa e as condições de energia permitem.
O ensaio mensal usa uma cópia Git separada da área dos testes de carga.

O comando manual é `bash scripts/restore-validation/monthly.sh` no Ubuntu
configurado. O script escolhe o backup local compatível mais recente, verifica
o manifesto e copia os arquivos para um diretório privado novo. O PostgreSQL
restaura o dump em um banco novo `garimpo_restore_<uuid>`. O ensaio confere
contagens e hashes das tabelas, referências de imagens atuais e históricas,
bytes das fotos e evidências privadas. O banco de origem e o conjunto de backup
permanecem disponíveis. Os resultados ficam em `result.json` dentro do
diretório privado do ensaio e em `~/.local/share/garimpo/restore-validation-logs`.
Os destinos isolados foram preservados para conferência.

## Resultados em 2026-11-09

Node 24.22.1, PostgreSQL 17.11 e banco de teste `garimpo_test` em schema novo.
O compilador de tipos dos testes e o lint dirigido passaram em `e5ba849`.
`node tests/operations/restore/run.mjs` passou em dois casos.

| Caso | Resultado |
| --- | --- |
| Pedido pago sintético, foto atual, foto histórica e evidência privada | PASS. 57 tabelas, 106 linhas, 2 arquivos de imagem e 1 evidência em 890 ms. O teste comparou os hashes antes e depois na origem e verificou os bytes e permissões no destino. |
| Destino sobreposto e cópia adulterada do arquivo | PASS. Ambos rejeitados antes da criação do banco de restauração. |
| Backup local de desenvolvimento | PASS. 57 tabelas e 25 linhas em 587 ms. Esse conjunto tinha zero fotos ou evidências. |

A sintaxe do script final passou em `d9bcdd6`. A tarefa Windows
`Garimpo-MonthlyRestoreValidation` foi registrada com sessão interativa,
privilégio mínimo, recuperação de execução perdida e execução única.
O primeiro disparo de verificação pelo agendador terminou com código 0 e
restaurou o backup local em 645 ms. O primeiro disparo de calendário está
previsto para 2026-12-01 às 04h. A ocorrência futura ainda não foi observada.
O disparo pela cópia separada `restore-20261109`, com dependências do lockfile
instaladas do cache, também terminou com código 0. O log privado registrou
57 tabelas, 25 linhas e 621 ms.

Os logs locais estão em `test-results/restore`. O arquivo de teste sintético
é a evidência de restauração de fotos e documentos. O disparo do agendador
verifica o caminho operacional com os dados disponíveis no backup local.

## Gates e escopo

Build e tipos PASS para as ferramentas da tarefa, incluindo instalação pelo
lockfile e carregamento do módulo de restauração na cópia separada. Lint,
integração, segurança, aceitação TEST-025 e regressão de integridade da origem
PASS. Unitários e API N/A porque o ensaio usa PostgreSQL real e não cria
endpoints. O adaptador pg emitiu aviso de descontinuação durante o teste,
com código de saída zero. PRIMARY em scripts de restauração, testes próprios,
este registro e TASKS.md. Incidental Changes: NONE.
