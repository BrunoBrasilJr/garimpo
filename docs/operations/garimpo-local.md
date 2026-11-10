# Operação local do Garimpo

## Preparar o ambiente

Use Ubuntu no WSL2, Node 24.22.1, npm 11 e PostgreSQL 17. A
[preparação do runtime](../architecture/execution.md#preparação-no-ubuntu-wsl)
registra a instalação e a conferência dos binários no ambiente da equipe.
Entre na raiz do repositório. No perfil já preparado, execute:

```bash
export PATH="/usr/lib/postgresql/17/bin:$HOME/.local/share/garimpo/node-v24.22.1-linux-x64/bin:$PATH"
source "$HOME/.local/share/garimpo/postgres17/environment.sh"
pg_isready -h 127.0.0.1 -p 55432
npm ci
npm run build
```

Mantenha `DATABASE_URL` para desenvolvimento e `TEST_DATABASE_URL` para o
banco separado `garimpo_test`. Os testes criam schemas de trabalho isolados.
Use `npm run db:migrate` apenas depois de conferir o destino de
`DATABASE_URL`. As migrations versionadas registram a evolução do banco.

## Abrir o sistema

Para experimentar a interface completa em um ambiente de teste, use Firefox
do Playwright com `certutil` disponível. No Ubuntu já preparado, após o build:

```bash
node --experimental-strip-types tests/e2e/account/manual-web.mjs
```

O Firefox abre com confiança TLS restrita a um perfil temporário e acesso a
uma fixture PostgreSQL com contas internas fictícias. O catálogo começa sem
itens. Use a conta ADMIN no arquivo privado indicado pelo terminal para
cadastrar uma edição, oferta e cobertura de frete. Use o roteiro de
[inspeção web](../../tests/e2e/account/README.md#inspeção-web-humana) para
contas e mensagens locais. `q` encerra a sessão.

Para desenvolver, `npm run dev:api` inicia a API, `npm run dev:web` inicia
o Vite e `npm run dev:mobile` inicia o Metro. A interface web chama
`/api/v1` na própria origem. Para testar fluxos completos, use a fixture
HTTPS acima ou uma composição local equivalente em que o navegador receba
web e API pela mesma origem. O Vite sozinho serve o frontend.

Na API com TLS, configure `TLS_CERT_PATH`, `TLS_KEY_PATH` e
`WEB_ORIGIN`. A origem web é exata, incluindo protocolo e porta. Sem
certificado, o listener local atende à prova de saúde e as rotas protegidas
continuam exigindo HTTPS. No app, `EXPO_PUBLIC_API_ORIGIN` indica uma
origem HTTPS confiável para o dispositivo. O roteiro de
[Android](../../tests/e2e/acceptance/android-checklist.md) explica a
conferência com Expo Go SDK 57. A API aceita o perfil local medido com
`GARIMPO_DB_POOL_SIZE=1 npm run dev:api`.

## Contas, simulações e recuperação

- Para criar o primeiro ADMIN de um ambiente novo, configure
  `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_EMAIL` e
  `BOOTSTRAP_ADMIN_PASSWORD` por meio privado e execute
  `npm run bootstrap:admin`. O comando valida a inicialização e o sistema
  controla as demais contas internas pelo painel.
- Configure `GARIMPO_MESSAGE_MODE=local-test`,
  `GARIMPO_MESSAGE_ENCRYPTION_KEY` e `GARIMPO_MESSAGE_TECHNICAL_SECRET`
  para a caixa de teste. `npm run messages:work` prepara e entrega
  mensagens localmente. Os logs mostram quantidades e o worker pode ser
  executado novamente para retomar o estado persistido.
- `npm run reservations:expire`, `npm run orders:expire` e
  `npm run reconcile:exchanges` reavaliam prazos no banco local.
  Para retomar uma tentativa registrada no simulador, use
  `npm run simulator -- resume ID_DA_TENTATIVA`. Pagamentos e estornos
  deste perfil são simulações.
- Mantenha chaves, senhas, certificados privados e evidências fora do
  repositório. `MEDIA_PUBLIC_ROOT` da API e `GARIMPO_MEDIA_ROOT` do backup
  devem apontar para o mesmo diretório de fotos. Evidências de pós-venda
  seguem a autorização do atendimento e são armazenadas no banco.

## Backup e teste de restauração

No perfil local, o backup diário roda às 03h, com 30 dias de retenção e
armazenamento privado. O teste mensal roda no primeiro dia do mês às 04h
na sessão interativa do Windows. Consulte o [relatório de restauração](../validation/restore.md)
para os caminhos, verificações e resultados.

```bash
npm run backup -- daily
npm run backup -- verify /caminho/privado/do/conjunto
bash scripts/restore-validation/monthly.sh
```

Confira o manifesto antes de restaurar. O script mensal usa o último conjunto
compatível e cria banco e diretório novos. Compare `result.json`, contagens,
hashes e referências. Preserve o conjunto original e use os logs privados para
diagnosticar falhas de execução.

## Verificação e limites

- `npm run verify` executa os gates de código, testes e a política do
  toolchain. `npm run bundle:android` exporta o bundle.
- `node tests/security/run.mjs` e
  `node tests/operations/restore/run.mjs` usam o ambiente separado de testes.
  O [relatório de desempenho](../validation/performance.md) traz o perfil
  congelado, comando e amostras. As conferências web, Android e os limites de
  plataforma estão no [relatório de aceitação](../validation/acceptance.md).
- O perfil é acadêmico e local. A auditoria bruta reportou dois alertas baixos
  na verificação registrada. O gate restrito conferiu a mitigação versionada.
  TalkBack e execução física iOS ficaram sem evidência. Compatibilidade por
  bundle e resultados de acessibilidade são registrados pelo recorte aferido.
