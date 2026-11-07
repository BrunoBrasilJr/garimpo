# Aceitação funcional e acessibilidade — TASK-033

Iniciada em 2026-11-07 na branch chore/TASK-033-functional-acceptance,
base publicada 70ecc38 (TASK-032). Autorização contínua até 100%.
ADRs 001/002 aceitos; alvos iniciais Chrome/Edge/Android definidos pelo
responsável, com compatibilidade iOS preservada. Não há certificação presumida.

## Rastreabilidade dos cenários funcionais

As 254 integrações e 126 unitários do checkpoint 032 exercitam o backend real,
com seis testes adicionais de segurança e quatro jornadas de pós-venda/relatórios.
As suítes abaixo complementam essa evidência; o resultado desta rodada está
separado do planejamento original em docs/architecture/testing.md.

| Cenário | Evidência executável |
| --- | --- |
| TEST-001 Cadastro | tests/accounts; tests/messaging; tests/e2e/account/access.spec.ts |
| TEST-002 Autenticação/sessão | tests/accounts; tests/e2e/account/access.spec.ts; mobile-client.test.ts |
| TEST-003 Recuperação e revogação | tests/messaging/access.integration.ts; tests/e2e/account/access.spec.ts |
| TEST-004 Perfil/endereços | tests/accounts; tests/e2e/account/access.spec.ts |
| TEST-005 Busca/filtros | tests/catalog; tests/e2e/catalog-web; tests/e2e/catalog-mobile |
| TEST-006 Edição/ofertas/áudio | tests/catalog; tests/e2e/catalog-web; tests/e2e/catalog-mobile |
| TEST-007 Desejos | tests/engagement |
| TEST-008 Reposição | tests/engagement; tests/aftersales/exchanges |
| TEST-009 Compra verificada/avaliação | tests/reviews; tests/integration/commerce; tests/aftersales/returns |
| TEST-010 Carrinho/reserva | tests/cart; tests/e2e/cart |
| TEST-011 Cotação/pedido | tests/checkout; tests/e2e/checkout |
| TEST-012 Simuladores/prazos/estorno | tests/payments; tests/e2e/checkout; tests/orders |
| TEST-013 Histórico | tests/orders |
| TEST-014 Cancelamento/indisponibilidade | tests/aftersales/cancellations; tests/e2e/aftersales |
| TEST-015 Devolução/evidência/reembolso | tests/aftersales/returns; tests/e2e/aftersales |
| TEST-016 Troca/48h/30 dias/remessas | tests/aftersales/exchanges; tests/e2e/aftersales |
| TEST-017 Catálogo administrativo/fotos | tests/catalog; tests/inventory/catalog.spec.ts |
| TEST-018 Estoque/proteção comercial | tests/inventory; tests/integration/commerce |
| TEST-019 Promoção/cupom | tests/pricing; tests/cart; tests/payments |
| TEST-020 Logística/atendimento | tests/orders; tests/aftersales; tests/e2e/aftersales |
| TEST-021 Clientes e bloqueio | tests/accounts/lifecycle |
| TEST-022 Moderação | tests/reviews; tests/integration/commerce |
| TEST-023 Relatórios | tests/reports |
| TEST-024 Notificações | tests/messaging; tests/engagement; tests/payments; tests/orders; tests/aftersales; tests/security |
| TEST-025 Backup/restauração | tests/operations/backup; restauração/periodicidade na TASK-035, pendente nesta abertura |
| TEST-032 Equipe/último ADMIN | tests/accounts; tests/e2e/staff; tests/security |
| TEST-033 Encerramento/reativação | tests/accounts/lifecycle |
| TEST-034 Confirmação/alteração de e-mail | tests/messaging; tests/e2e/account |
| TEST-035 Frete/cobertura | tests/checkout; tests/e2e/freight-admin; tests/e2e/checkout |

Pagamentos e e-mails são simulações locais, conforme o PDF. As jornadas usam API,
HTTPS e PostgreSQL reais em schemas UUID novos em garimpo_test. Nada restaura,
reseta ou sobrescreve o banco original. As prévias móveis usam os componentes
React Native via RNW com armazenamento de teste explícito; isso não comprova
SecureStore, leitor de tela, fonte do sistema ou execução em Android/iOS físico.

As jornadas de avaliação usam a porta explícita PurchaseFixture para isolar
estados da interface. A elegibilidade real é exercitada em commerce e returns
com pedidos, entrega e unidades mantidas/devolvidas. Não atribuir compra real
à fixture nem usar um mock liberador como padrão de runtime.

## Acessibilidade e correções observadas

tests/accessibility verifica teclado até os campos, foco visível, envio por
Enter, erro compreensível com foco, nomes de controles, contraste do texto
selecionado e viewport 390px com texto a 200%. As fotos são roladas até a área
visível e precisam efetivamente carregar; alt não vazio é conferido.

O cálculo de contraste aplica a referência
[W3C — contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
de 4,5:1 para texto comum e 3:1 para texto grande. Foco segue a referência
[W3C — foco visível](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html).
É um ensaio dirigido de elementos opacos em fundos sólidos, não uma auditoria
completa ou certificação WCAG. Não são inferidas propriedades de outros estados.

A primeira rodada accessibility.log aprovou dois casos, mas a inspeção visual
revelou rótulos de metadados quebrando palavras. Teste reforçado em 83bafba e
correção na tarefa de origem 010: 225ec18/60cf75f. Build web/tipos/lint PASS em
catalog-build.log e três jornadas de catálogo/dois casos de acessibilidade PASS
em catalog-final.log. metadata-fixed.png foi inspecionada: rótulos legíveis e
fotos carregadas. Alteração CSS restrita ao detalhe em telas estreitas.

A suíte histórica de estoque ainda esperava vínculos UNAVAILABLE após a composição
comercial real de TASK-023. browser.log preserva um FAIL e um PASS. A correção
ficou na tarefa 009 (e6c5bd9/c749480): o teste confirma físico 5/reservado 0/livre 5,
reserva as cinco unidades por um cliente real de teste e exige rejeição da redução
a quatro com foco no erro. Tipos/lint e dois E2E PASS em inventory-fix.log. A
proteção quando a porta está indisponível continua nos testes de integração.

## Plataformas e pendências externas

Firefox tem CA isolada por perfil e não ignora erros TLS. Android/iOS têm bundles
aprovados no checkpoint 032, sem execução física nova presumida. A recusa expressa
de TalkBack permanece registrada como NÃO EXECUTADO; não é um teste aprovado.
Disponibilidade para conferência nativa sem TalkBack foi solicitada ao responsável.

Chrome 156.0.8078.80 e Edge 156.0.4314.58 instalados no Windows rejeitaram a CA
desconhecida, conforme windows-20261107/probe.json. A jornada positiva preparada
em windows-client.mjs não foi executada: o Windows pediu confirmação humana de
confiança temporária da CA. O launcher específico foi encerrado e a ausência da
CA no Root do usuário foi conferida. verify.log conserva o timeout da ponte.
Não houve bypass TLS, clique automático de segurança ou aceite positivo inferido.
O script windows-browsers.ps1 só deve continuar quando o responsável confirmar
a própria janela; sua cláusula finally remove a CA adicionada e verifica remoção.

## Resultado desta rodada

IN_PROGRESS. Treze jornadas de contas/catálogo/componentes RNW PASS em browser.log;
dois E2E de estoque corrigidos PASS em inventory-fix.log; cinco dirigidos de
catálogo/acessibilidade PASS em catalog-final.log. Trinta jornadas adicionais
seguem em remaining.log. TEST-025 aguarda 035 e as conferências de plataforma
acima ainda não foram concluídas. Nenhum DONE integral antecipado.

PRIMARY desta revisão: tests/e2e/acceptance/**, tests/accessibility/**,
este relatório e TASKS.md. Incidental Changes: NONE. Correções de produção/testes
externos possuem branches/commits das tarefas 010/009. Não houve mudança de
requisito, regra comercial, contrato, migration ou dispensa de teste presumida.
