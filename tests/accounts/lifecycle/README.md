# Ciclo de contas e gestão de clientes

Use o Node Linux ratificado e ambiente PostgreSQL protegido no Ubuntu WSL.
As suítes criam schemas novos retidos somente em `garimpo_test`, sem reset,
restauração ou descarte da base original.

```sh
npm run build
npm run typecheck
npm run lint
npm test
npm run test:lifecycle
```

API/serviços/DB reais cobrem consulta OPERATOR versus mutação ADMIN, proprietário,
HTTPS/origem/CSRF/bearer, revisão/chave, revogação de sessões e links, preservação
de pagos, liberação de checkout/PENDING/cupom/saldo reservado, correção por novo
e-mail sem mudar restrições e reativação por propósito/prazo/uso único. Corridas
usam conexões reais: pagamento/bloqueio, checkout/bloqueio e revalidação de flag
comprometido enquanto a confirmação aguarda trava. Trigger temporário no schema
de teste prova rollback completo de auditoria; não é instalado no produto.
Avisos comerciais de cancelamento são cifrados e repetíveis sem desfazer estado.

```sh
cd apps/mobile
node ../../node_modules/@expo/cli/build/bin/cli export:embed --platform web --entry-file ../../tests/accounts/lifecycle/mobile-entry.tsx --bundle-output ../web/dist/lifecycle-mobile-preview.js --dev false --minify true --max-workers 2
cd ../..
node node_modules/@playwright/test/cli.js test --config tests/accounts/lifecycle/playwright.config.ts
```

Gere o preview depois do build web (que limpa dist). Firefox confia na CA somente
do perfil isolado; não ignora TLS. Quatro jornadas verificam ADMIN/e-mail/
bloqueio/desbloqueio, OPERATOR somente consulta, encerramento/reativação web e
navegação mobile real com bearer. A fábrica de client injetada por código no
preview só substitui armazenamento de renovação por memória; runtime normal
continua deviceClient/SecureStore. Não há seletor de bypass público ou por env.

RNW/CSS ampliado e exportações Android/iOS não comprovam aparelho, fonte nativa,
SecureStore nativo, TalkBack ou VoiceOver. Leitores não foram executados por
recusa do responsável. Registre resultado real dos comandos; este roteiro não
aprova nenhum gate antecipadamente. Logs/capturas/credenciais de fixture ficam
nos diretórios ignorados de test-results; nunca publicar tokens, cookies ou
segredos locais. Política/hash de dependências e relatório bruto npm permanecem
separados. Encerrar não é excluir: PD-008 continua pendente e não há descarte de
dados, retenção eterna presumida ou alegação de conformidade legal.
