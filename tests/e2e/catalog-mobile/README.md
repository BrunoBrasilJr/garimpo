# Validação do catálogo mobile

Execute no Ubuntu WSL com Node/npm ratificados, dependências instaladas pelo lockfile,
PostgreSQL local ativo e `TEST_DATABASE_URL` apontando exclusivamente para
`garimpo_test` em loopback. O harness cria um schema novo, preserva os anteriores e
usa Firefox com uma CA isolada confiada; requer Firefox do Playwright, `certutil`
e OpenSSL já provisionados para a suíte de contas.

Na raiz do projeto:

```sh
npm run build
npm run typecheck
npm run lint
npm test
npm run audit:toolchain
node tests/e2e/catalog-mobile/check-native-config.mjs
cd apps/mobile
node ../../node_modules/@expo/cli/build/bin/cli export --platform android --output-dir dist/android --max-workers 2
node ../../node_modules/@expo/cli/build/bin/cli export --platform ios --output-dir dist/ios --max-workers 2
node ../../node_modules/@expo/cli/build/bin/cli export:embed --platform web --entry-file ../../tests/e2e/catalog-mobile/entry.tsx --bundle-output ../web/dist/catalog-mobile-preview.js --dev false --minify true --max-workers 2
cd ../..
node node_modules/@playwright/test/cli.js test --config tests/e2e/catalog-mobile/playwright.config.ts
```

O build web deve preceder a geração do preview, pois limpa seu diretório de saída.
O preview renderiza os mesmos componentes React Native pelo adaptador web, com
API, banco e áudio HTTPS de teste reais. Não habilita uma plataforma adicional no
aplicativo entregue. A CSP com nonce pertence somente à rota isolada do preview.

A suíte cobre busca, filtros combinados, ofertas individuais, seleção sem reserva,
paginação/retorno, metadados ausentes, semântica acessível e layout estreito com
texto ampliado por simulação. O provedor sintético demonstra carregamento e falha
do áudio; encerra ao terminar. Os exports Android/iOS comprovam geração de bundles
JavaScript, sem produzir APK/IPA nem comprovar execução nativa. A introspecção
confere que o plugin não solicita microfone ou reprodução em segundo plano.

Execução em dispositivo, escala de fonte do sistema, TalkBack/VoiceOver e som
audível exigem validação própria; não são resultados inferidos destes testes.
Resultados efetivamente obtidos, limitações e auditoria ficam em `TASKS.md`.
