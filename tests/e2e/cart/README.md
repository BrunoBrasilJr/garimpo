# Carrinho e finalização nas interfaces — TASK-017

Na raiz do checkout Ubuntu com Node 24.22.1, dependências do lockfile instaladas,
Firefox do Playwright, certutil/OpenSSL e o ambiente protegido de `garimpo_test`:

```sh
source "$HOME/.local/share/garimpo/postgres17/environment.sh"
npm run build
npm run typecheck
npm run lint
npm test
npm run test:cart
npm run audit:toolchain
cd apps/mobile
node ../../node_modules/@expo/cli/build/bin/cli export:embed --platform web --entry-file ../../tests/e2e/cart/mobile-entry.tsx --bundle-output ../web/dist/cart-mobile-preview.js --dev false --minify true --max-workers 2
cd ../..
node node_modules/@playwright/test/cli.js test --config tests/e2e/cart/playwright.config.ts
```

Gerar o preview depois do build web, que limpa dist. A suíte usa API e PostgreSQL
reais, schemas novos retidos, relógio controlado somente por código da fixture e
HTTPS com CA confiada exclusivamente no perfil Firefox isolado. Nenhum bypass TLS,
reset de dados originais ou túnel público. A perda de resposta e a troca de conta
são falhas de transporte deliberadas sobre requisições reais.

Os seis cenários configurados injetam exclusivamente a porta de contagem conhecida
de pedidos pendentes como zero. Isso permite validar a interface antes do adaptador
comercial de pedidos; o cenário separado `unavailable.spec.ts` injeta explicitamente
UNAVAILABLE e exige 503. Na TASK-018 o padrão de runtime passou a consultar pedidos
reais, com prova positiva própria em tests/checkout. O teste negativo não representa
aceite dessa integração nem muda o padrão para uma contagem fictícia.
Preços, saldo, autenticação, autorização, mescla, reservas e prazos usam o servidor.

O preview renderiza os componentes React Native com AsyncStorage web e cliente
bearer real; seu armazenamento de renovação em memória é exclusivo do teste.
Não comprova SecureStore/AsyncStorage em dispositivo, TalkBack, VoiceOver ou escala
nativa. Exportações Android/iOS geram bundles, sem alegar APK/IPA ou execução física.

As evidências ignoradas ficam em test-results/cart-ui e test-results/account-ui.
Não compartilhar credenciais, chaves ou mensagens de teste. Auditoria bruta e gate
de política são resultados distintos: achados remanescentes não são ocultados nem
convertidos em auditoria limpa. Resultados e limitações vigentes constam de TASKS.md.
