# Avaliações e moderação — TASK-013

No Ubuntu WSL com Node/npm ratificados, PostgreSQL local e ambiente de teste
protegido apontando para `garimpo_test`:

```sh
npm run build
npm run typecheck
npm run lint
npm run test:reviews
```

O runner cria schema `task013_<uuid>` novo e preserva os anteriores. Os casos
usam PostgreSQL, API HTTPS, dois clientes independentes e um controlador de
locks. Verificam publicação elegível, negativa padrão, unicidade por compra,
privacidade, edição oculta, liberação da revisão atual, concorrência real,
histórico imutável e rollback na falha de persistência de uma revisão.

`PurchaseFixture` existe somente nesta pasta de testes. O runtime usa uma porta
selada UNAVAILABLE até receber o adaptador real de TASK-023. Nenhuma chave de
requisição ou ambiente seleciona a fixture. Os testes não criam uma tabela de
pedidos nem comprovam a integração comercial futura; pós-venda automático é 026.

Depois do build, prepare os previews dos mesmos componentes para o E2E:

```sh
node node_modules/vite/bin/vite.js build --config tests/reviews/preview.vite.config.ts
cd apps/mobile
node ../../node_modules/@expo/cli/build/bin/cli export:embed --platform web --entry-file ../../tests/reviews/mobile-entry.tsx --bundle-output ../web/dist/reviews-mobile-preview.js --dev false --minify true --max-workers 2
cd ../..
node node_modules/@playwright/test/cli.js test --config tests/reviews/playwright.config.ts
```

Requer Firefox do Playwright, OpenSSL e certutil provisionados para os testes de
conta. O servidor usa CA isolada confiada, sem ignorar certificados. O preview
web fornece contexto de compra da fixture ao composer; o nativo usa componentes
reais e transporte bearer, com armazenamento de token somente da fixture.
Não habilita uma compra fictícia no produto nem comprova dispositivo nativo,
SecureStore, TalkBack/VoiceOver ou ampliação pela fonte do sistema.

As revisões guardam o conteúdo e responsável de cada criação/edição/moderação;
o PostgreSQL rejeita atualização/exclusão desse histórico. Não existe DELETE de
avaliação pelo autor. Resultados reais, falhas intermediárias e limites de
validação pertencem ao relatório de TASKS.md.
