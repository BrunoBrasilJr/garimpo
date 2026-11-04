# Histórico de pedidos e logística original

Os testes usam PostgreSQL real em `garimpo_test`, com schema novo por execução,
retido como evidência. Não restauram nem limpam a base original. Ative o Node
Linux ratificado e carregue o ambiente protegido de PostgreSQL no Ubuntu WSL.

```sh
npm run build
npm run typecheck
npm run lint
npm test
npm run test:orders
```

`orders.integration.ts` cobre escopo próprio, filtros/páginas, datas reais,
snapshots congelados, todos os meios de pagamento, passos logísticos, uma única
remessa original, entrega por unidade, recibo idempotente, corrida real entre
conexões, revogação concorrente do operador, rollback de auditoria e mensagens
criptografadas com repetição. `migration.integration.ts` aplica as migrations
anteriores em schema adicional e só então a migration atual sobre fatos legados;
compara todas as colunas antigas e não fabrica postagem/entrega. `rules.test.ts`
valida calendário e formatos estritos sem relógio público ou dinheiro real.

Para E2E, primeiro gere o build web e o preview dos componentes mobile reais:

```sh
cd apps/mobile
node ../../node_modules/@expo/cli/build/bin/cli export:embed --platform web --entry-file ../../tests/orders/mobile-entry.tsx --bundle-output ../web/dist/orders-mobile-preview.js --dev false --minify true --max-workers 2
cd ../..
node node_modules/@playwright/test/cli.js test --config tests/orders/playwright.config.ts
```

Firefox usa CA confiada somente no perfil isolado; TLS não é ignorado. Jornadas
compõem navegador → API HTTPS → serviços → banco e resposta, sem stubs de regra
comercial. Cobrem operação ADMIN/OPERATOR, estados e datas no histórico do
cliente, dois editores com versão antiga, propriedade/guarda das telas e boleto
criado na web encontrado/pago em um cliente mobile sem referências locais.
O preview usa bearer, componentes e armazenamento do produto; somente o store
de renovação em memória e o host RNW pertencem ao teste. Isso não comprova
execução física Android/iOS, SecureStore nativo, fonte nativa, TalkBack ou
VoiceOver. Leitores de tela não foram executados por recusa do responsável.

Capturas e logs ficam nos diretórios ignorados `test-results/orders` e
`test-results/account-ui`. Não publicar credenciais, cookies, tokens ou conteúdo
da caixa local. As exportações Android/iOS precisam ser verificadas à parte;
bundle não equivale a APK/IPA instalado. A política de segurança/patch/hash e o
relatório bruto npm têm resultados separados; não declarar auditoria limpa.

Na inspeção manual opcional, entre como equipe, filtre um comprador sintético,
abra o pago e registre PREPARING, SEPARATED, postagem real e entrega real, nessa
ordem. Confira na conta de compra os snapshots, rastreio, datas e pagamentos.
Não usar pedido real, estimativa de frete como entrega ou alterar relógio para
demonstrar. Sem evidência dessa inspeção, não registrá-la como aprovada.
