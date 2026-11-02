# Desejos e alertas — TASK-012

No Ubuntu WSL com as dependências ratificadas instaladas, PostgreSQL em loopback
e `TEST_DATABASE_URL` protegido para `garimpo_test`:

```sh
npm run build
npm run typecheck
npm run lint
npm run test:engagement
```

O runner cria schema `task012_<uuid>` novo e preserva o histórico; não usa a base
original nem executa reset/drop/truncate. Os testes usam dois Prisma clients,
controle de locks por terceiro cliente, API HTTPS real com certificado confiado,
relógio controlado e o canal local de mensagens. Não enviam e-mail externo.

A suíte cobre desejos idempotentes, isolamento entre clientes, HTTPS/origem/CSRF,
bearer mobile, inscrições simultâneas, transição por condição, público congelado
na transação, falhas reais no banco, cancelamento, retry, proteção do conteúdo e
entrega atômica sem duplicação/reserva. O índice parcial ACTIVE é intencional:
mantém ativações anteriores DELIVERED/CANCELLED com seus IDs originais.

Para as interfaces, primeiro execute o build acima e gere o adaptador isolado:

```sh
cd apps/mobile
node ../../node_modules/@expo/cli/build/bin/cli export:embed --platform web --entry-file ../../tests/engagement/mobile-entry.tsx --bundle-output ../web/dist/engagement-mobile-preview.js --dev false --minify true --max-workers 2
cd ../..
node node_modules/@playwright/test/cli.js test --config tests/engagement/playwright.config.ts
```

Requer Firefox do Playwright, OpenSSL e certutil já usados nas suítes existentes.
O teste mobile renderiza os mesmos componentes com transporte bearer real, usando
um armazenamento de token somente da fixture. Não comprova SecureStore nativo,
TalkBack/VoiceOver, fonte do sistema ou execução em Android/iOS físico.
Resultados e limitações pertencem ao relatório em TASKS.md.

Em ambiente local configurado, `npm run messages:work` prepara e entrega os dois
tipos de mensagem por consumidores dedicados. O caixa técnico protegido existente
inclui o aviso de disponibilidade; ele não contém token de acesso/expiração e
explica que o estoque pode se esgotar. Integração das reservas comerciais continua
TASK-023; não se presume reserva zero quando essa integração for materializada.
