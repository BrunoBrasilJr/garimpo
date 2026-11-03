# Checkout web e React Native

Testes com API/serviços reais, PostgreSQL separado `garimpo_test`, schema novo/retido por worker e HTTPS com CA confiada somente no perfil Firefox isolado. Não há bypass TLS, contador fictício de pendentes, gateway de produção, cobrança real nem campo de cartão.

No Ubuntu WSL já configurado, raiz do projeto:

```bash
export PATH="$HOME/.local/share/garimpo/node-v24.22.1-linux-x64/bin:$PATH"
source "$HOME/.local/share/garimpo/postgres17/environment.sh"
npm run build
npm run typecheck
npm run lint
npm test
npm run test:accounts
npm run audit:toolchain
cd apps/mobile
node ../../node_modules/@expo/cli/build/bin/cli export:embed --platform web --entry-file ../../tests/e2e/checkout/mobile-entry.tsx --bundle-output ../web/dist/purchase-mobile-preview.js --dev false --minify true --max-workers 2
cd ../..
node node_modules/@playwright/test/cli.js test --config tests/e2e/checkout/playwright.config.ts
npm run bundle:android
cd apps/mobile
node ../../node_modules/@expo/cli/build/bin/cli export --platform ios --output-dir dist/ios
```

Gerar o preview depois do build web, que limpa dist. Compilador de todos os testes pode usar heap 1536 MiB apenas no processo Node; Playwright pode usar 512 MiB por processo no ambiente com pouca memória. Não alterar custo de senha, segurança ou timeout para mascarar falhas.

As seis jornadas cobrem cupom congelado, CEP não atendido, frete alterado com novo aceite, recusa/repetição de cartão, Pix com resposta perdida e reabertura, boleto pendente/tardio, falha e repetição de estorno, armazenamento indisponível antes da captura e contexto de conta em endereços. O simulador local verdadeiro é chamado fora da transação, com uma barreira técnica da fixture para atravessar o prazo; relógio/evento não são expostos via endpoint de produto. Consultas técnicas conferem pedidos, recibos e eventos financeiros reais. Chaves/corpos do comando perdido são comparados, sem copiá-los para logs públicos.

Diário web usa sessionStorage por conta/aba; mobile usa AsyncStorage por conta. Guarda referências/chave/corpo original e não guarda credencial, endereço textual nem dados reais de cartão. O dono esperado é enviado às APIs. Erro de rede/5xx mantém a tentativa para retomada explícita; rejeição definitiva antes do efeito pede nova conferência. Referências a pedidos já reconhecidos são relidas por replay idempotente, sem novo prazo. Pedidos sem tentativa financeira ainda dependem dessas referências locais até o histórico geral da TASK-021; não apresentar esta lista como histórico logístico completo.

O preview renderiza os componentes nativos reais e seu bearer/AsyncStorage web, com store de renovação em memória exclusivo do teste. Não comprova SecureStore/AsyncStorage em aparelho, TalkBack, VoiceOver ou fonte nativa. Ampliação RNW usa CSS sobre texto renderizado, descrita como teste de navegador. Exportações Android/iOS são bundles, não execução física/APK/IPA. Evidências privadas ficam em test-results/checkout-ui e test-results/account-ui; não publicar chaves, cookies, credenciais ou mensagens locais. Auditoria bruta de dependências e gate restrito têm resultados distintos e devem permanecer explícitos no relatório.

Se o npm no WSL retornar relatório incompleto por conectividade, repetir a consulta nativa com `NODE_OPTIONS=--dns-result-order=ipv4first npm run audit:toolchain`. Essa preferência é local ao processo, mantém TLS e a política/hash e não transforma indisponibilidade em auditoria aprovada. Preservar o relatório/exit anterior; só registrar PASS após obter metadados completos e validar os bytes atuais.
