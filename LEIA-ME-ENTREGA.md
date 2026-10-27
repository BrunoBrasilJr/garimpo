# Garimpo — entrega parcial de 25/10/2026

## Cópia para avaliação no GitHub — 26/10/2026

Repositório: https://github.com/BrunoBrasilJr/garimpo. Esta publicação reúne todo o código versionado e o histórico local das tarefas, documentação e evidências selecionadas em EVIDENCIAS/INDICE.md. A branch principal remota recebe a entrega completa; branches das tarefas preservam seus pontos históricos. O ZIP de 25/10 continua sendo um retrato anterior à preparação desta publicação. Publicar não executa TASK-007 nem acrescenta funcionalidades.

Os logs publicados têm extensão .log.txt para não flexibilizar a política geral de ignorar logs locais; seu conteúdo é idêntico aos originais selecionados no ZIP. Não são publicados arquivos privados de fixture, credenciais, tokens, certificados privados, banco ou dependências instaladas. Nenhuma nova execução de testes de aplicação é alegada nesta publicação documental.

Responsável: Bruno dos Santos Brasil Silva. Encerramento solicitado às 22:46 de domingo, para apresentação do estado real ao professor em 26/10/2026.

## Onde paramos

TASK-001 a TASK-006 concluídas: **6 de 37 tarefas (16,2% por contagem)**. A meta de 50% exigiria 19 tarefas; esta entrega não atingiu essa meta. As tarefas têm tamanhos diferentes, portanto a contagem não mede percentual de esforço ou de funcionalidades.

**Próxima: TASK-007, checkpoint da PHASE-01, ainda não executado.** Seu estado permanece BLOCKED até validar a própria Definition of Ready e repetir os gates acumulados. TASK-008 a TASK-037 não foram implementadas. Não há catálogo, vendas, checkout, pagamentos, pós-venda ou relatórios comerciais nesta versão.

## O que foi realizado

| Tarefa | Entrega |
| --- | --- |
| TASK-001 | Decisões técnicas e parâmetros ratificados, ADRs e conferência documental. |
| TASK-002 | Monorepo TypeScript, API Express, web React/Vite e aplicativo Expo; build, tipos, lint e testes. |
| TASK-003 | Persistência PostgreSQL/Prisma, transações, idempotência, auditoria e recuperação de outbox. |
| TASK-004 | Contas e autenticação, sessões, perfis, endereços e gestão de contas internas na API. |
| TASK-005 | Confirmação de e-mail, recuperação de senha, alteração confirmada de e-mail e mensagens locais protegidas. |
| TASK-006 | Interfaces web/Android de contas e gestão interna exclusivamente web, com restrições ADMIN/OPERATOR. |

Não há envio real de e-mails: o canal de demonstração é uma caixa local protegida para testes. O aplicativo foi testado no Android pelo responsável. O site foi inspecionado em Firefox com confiança TLS limitada ao perfil de teste. As sessões temporárias e o túnel foram encerrados; os endereços antigos não são uma publicação do sistema.

## Evidências e limitações

O histórico detalhado está em TASKS.md. O pacote inclui uma seleção de logs reais em EVIDENCIAS/ e seu índice. São 79 casos automáticos distintos aprovados em execuções acumuladas e dirigidas: 33 unitários/protocolo/relógio, 39 integrações backend e sete E2E/HTTPS. Não se trata de uma única execução integral de 79 casos. Há falhas históricas nos logs de navegador, seguidas de correções e revalidações, preservadas no índice.

Build, verificação de tipos, lint, bundle Android e testes relevantes foram executados. O responsável confirmou fluxos no Android e web, incluindo perfil/endereço, restauração de sessão, saída, confirmação, recuperação, alteração de e-mail web e permissões internas, e deu aceite global final. A última alteração de e-mail no Android não tem registro individual de consumo do código nesta rodada; não se inventa esse resultado. Texto ampliado e teclado foram incluídos no roteiro do aceite final. Leitor de tela, iOS e fluxos de contas em Chrome/Edge nesta rodada não têm validação completa declarada. O checkpoint seguinte deve revisar cobertura e limitações.

**Auditoria npm bruta permanece FAIL, com quatro achados high propagados do aviso node-forge.** A mitigação específica aprovada está em patches/, com verificação de hash e testes de regressão. O verificador preserva o relatório original e não admite novos achados sem avaliação. Não apresentar como auditoria limpa.

## Como ler e retomar

1. Comece por este arquivo e TASKS.md; README.md contém a especificação, não um relatório de progresso.
2. Código: apps/api, apps/web, apps/mobile e packages/contracts. Testes: tests/. Decisões e requisitos: docs/. As duas migrations existentes ficam em apps/api/prisma/migrations/.
3. Para retomar desenvolvimento, leia AGENTS.md e docs/architecture/conciliacao.md, depois README.md, TASKS.md, ADRs, código e testes. Confira a TASK-007, suas dependências e limitações antes de promovê-la. Não iniciar catálogo antes do checkpoint aprovado.
4. O ambiente usado foi Windows com Ubuntu WSL2, Node 24.22.1, npm 11.19.1, PostgreSQL 17 e Expo Go compatível com SDK 57. Dependências são restauradas por npm ci, com patch pós-instalação. Configuração de banco/segredos deve ser provisionada separadamente, seguindo os documentos e roteiros de tests/core, tests/accounts e tests/messaging. apps/api/.env.example é apenas modelo.
5. Com ambiente configurado: npm run verify; npm run test:account-ui; npm run bundle:android. Os E2E exigem o navegador Playwright e os requisitos TLS descritos em tests/e2e/account/README.md. Scripts manuais não equivalem a aprovação humana automática.

O ZIP contém os arquivos versionados do projeto, documentação e logs selecionados. Não contém .git, node_modules, builds gerados, banco, senhas, tokens, QR de acesso, certificados privados ou perfis de navegador. Não é executável autossuficiente e não restaura dados locais. O repositório original com histórico permanece no computador; branch de trabalho: feature/TASK-006-interfaces-contas. REVISAO.txt no pacote identifica o commit exato exportado, e MANIFESTO-SHA256.txt permite verificar seu conteúdo.

## Limpeza operacional restante no computador de origem

Túnel temporário e Metro encerrados. A regra e o encaminhamento Wi-Fi exigem PowerShell **como Administrador** para remoção; a tentativa sem esse privilégio foi recusada. Execute no computador original:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\brasi\garimpo-planejamento\tests\e2e\account\metro-wifi.ps1" -Remove
```

Esse comando remove somente o encaminhamento de teste e a regra Garimpo-Metro-8081. Não exclui banco nem arquivos do projeto. Essa limpeza ainda não está confirmada neste registro.
