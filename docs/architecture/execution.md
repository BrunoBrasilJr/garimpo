# Execução do Garimpo

## Estado do incremento

TASK-002 prepara somente estrutura: contratos operacionais, processo API, tela inicial web/mobile e configuração de qualidade. Não há conta, banco, migration, catálogo ou checkout implementados. Os parâmetros ratificados em TASK-001 governam este incremento; textos anteriores ainda chamados “proposta” devem ser lidos com a ratificação registrada nos ADRs e parâmetros, sem presumir aprovação de teste de runtime.

Ambiente alvo: Windows → Ubuntu WSL2, com Node Linux 24.22.1. Runtime isolado em `~/.local/share/garimpo/node-v24.22.1-linux-x64`, baixado da origem oficial e conferido pelo SHA-256 do fabricante. Isso não altera o Node global do Windows. Git existente no Ubuntu: 2.43.0. Dependências são instaladas para Linux; não alternar instalação Windows/Linux na mesma pasta node_modules.

## Preparação no Ubuntu WSL

Abra o Ubuntu pelo Windows ou execute `wsl -d Ubuntu`. No terminal Linux:

```bash
export PATH="$HOME/.local/share/garimpo/node-v24.22.1-linux-x64/bin:$PATH"
cd /mnt/c/Users/brasi/garimpo-planejamento
node --version
node -p process.platform
npm --version
```

Esperado: Node v24.22.1 e plataforma linux. A instalação nativa do runtime foi autorizada na TASK-002. O caminho acima é o caminho real do projeto observado no Windows; se montagem diferente, localize a pasta e confirme `pwd`, sem operar em outro projeto.

Instalação reproduzível quando houver lockfile verificado:

```bash
npm ci
```

O primeiro bootstrap utiliza `npm install` para produzir o lockfile. Não usar `--force` ou `--legacy-peer-deps` para ocultar incompatibilidade. Se falhar, registrar comando/erro e corrigir somente a configuração necessária da TASK-002. As versões instaladas devem constar no lockfile e passar pelas verificações abaixo.

## Comandos da estrutura

| Comando na raiz | Finalidade | Resultado esperado |
| --- | --- | --- |
| `npm run build` | Contratos, API e web | Saída zero e artefatos dist de cada workspace |
| `npm run typecheck` | Tipos dos quatro workspaces | Saída zero, sem erro TypeScript |
| `npm run lint` | Fontes e configuração | Saída zero, sem erro ESLint |
| `npm test` | Teste de integração do bootstrap | Health real por socket local, rota comercial ausente e nenhum x-powered-by |
| `npm run verify` | Build, tipos, lint e teste acima | Todos aprovados, interrupção em falha |
| `npm run bundle:android` | Compilar bundle Expo Android | Bundle exportado; isso não equivale a execução em aparelho |
| `npm run dev:api` | Processo de bootstrap API | Probe em loopback 3001 ou servidor TLS quando configurado |
| `npm run dev:web` | Vite web | Página local Garimpo, sem chamar API ou antecipar catálogo |
| `npm run dev:mobile` | Expo/Metro | Código QR/URL para aplicativo compatível com SDK 57 |

Somente a probe operacional `/health` existe. O servidor HTTP sem certificado é restrito a `127.0.0.1`, para probe interna sem autenticação. Qualquer acesso de web/mobile à API precisa de HTTPS com certificado confiável, por meio de `TLS_CERT_PATH`/`TLS_KEY_PATH`; `HOST` só é configurável no modo TLS. Definir apenas um dos caminhos deve falhar. Segredo/chave/certificado privado ficam fora do Git. Esta tela inicial não faz requisições comerciais e não permite validar transporte/autenticação de fluxos futuros.

## Roteiro manual da TASK-002

Responsável: Bruno, aparelho Android disponível. Estado inicial: **NÃO EXECUTADO**. O agente pode executar checks auxiliares, mas não pode apresentar esses resultados como teste manual do responsável.

### BOOT-001 — comandos e segurança do bootstrap

Pré-condição: Node Linux correto, dependências/lockfile válidos, revisão da branch TASK-002 identificada, sem banco/serviço de produção.

No Ubuntu, após a preparação acima:

```bash
bash tests/bootstrap/manual-bootstrap.sh
```

O script confere Linux/Node e dependências, registra revisão e saída em `test-results/bootstrap`, interrompe em falha e roda verify/bundle Android. Conferir que todos os comandos terminam com saída zero. Não mostra valores de variáveis secretas nem instala serviços. A probe do teste usa porta efêmera e não grava dados de negócio. A repetição cria um novo log; não remove evidência anterior.

Resultado obtido: [PREENCHER PELO RESPONSÁVEL]. Evidência/log: [PREENCHER]. Status: NÃO EXECUTADO.

### BOOT-002 — página web e recorte TEST-028

Em outro terminal Ubuntu preparado, executar `npm run dev:web`. Abrir o endereço local indicado pelo Vite no Chrome/Edge do Windows. Conferir título Garimpo, texto legível, idioma português, redimensionamento/ampliação e ausência de erro no console. Nesta estrutura não há controle interativo comercial nem login a testar; não declarar paridade funcional futura aprovada. Encerrar com Ctrl+C.

Resultado obtido: [PREENCHER PELO RESPONSÁVEL]. Navegador/versão/evidência: [PREENCHER]. Status: NÃO EXECUTADO.

### BOOT-003 — execução Android

Executar `npm run dev:mobile` no Ubuntu preparado. Abrir no Android com cliente Expo compatível com SDK 57 ou development build correspondente; não aceitar cliente de SDK incompatível nem Expo web como teste nativo. Confirmar rede/URL acessível ao aparelho. Se o WSL não expuser Metro à rede, diagnosticar conectividade e registrar bloqueio; não dispensar validação nem alterar firewall silenciosamente. Um túnel externo exigiria configuração explícita, não é iniciado automaticamente.

Conferir tela Garimpo, ausência de tela de erro, texto ampliado e leitura do título pelo TalkBack. Nenhuma conta/administração/catalogação disponível neste incremento. Registrar modelo/versão Android, cliente Expo e revisão. Encerrar Metro com Ctrl+C. Compatibilidade iOS preservada em app.json, mas nenhuma execução iOS é alegada.

Resultado obtido: [PREENCHER PELO RESPONSÁVEL]. Aparelho/versões/evidência: [PREENCHER]. Status: NÃO EXECUTADO.

### Contagem e tratamento de falhas

Previstos 3; executados 0; aprovados 0; reprovados 0; bloqueados 0; pendentes 3. Gate manual PENDENTE; não marcar TASK-002 DONE sem evidência dos casos obrigatórios.

Falha: registrar comando, saída/código, ambiente e revisão; diagnóstico → menor correção no escopo → revisão → reexecução manual do caso afetado. Corrigir código não aprova teste. Comando ausente/dependência externa: BLOCKED; falha de implementação: FAILED conforme AGENTS. Fora de escopo ou produção futura exige SCOPE ESCALATION, sem avançar. Para desfazer, preservar alterações alheias e retirar somente o próprio incremento mediante diff conhecido; não resetar repositório nem apagar diretórios de dados. Não há migration para reverter nesta tarefa.

## Lacunas que continuam abertas

Banco e fundação transacional são TASK-003; contas são TASK-004 e seguintes. Não criar infraestrutura de banco nesta TASK para antecipar essas responsabilidades. Rubrica acadêmica extra, frete, vocabulários, metas, retenção e caso de devoluções seguem PDs correspondentes. A ausência desses módulos não pode virar aprovação falsa de teste funcional completo.

## Bloqueio de segurança da TASK-002 — 2026-10-25

### Evidência real

Node Linux v24.22.1, npm 11.19.1, Ubuntu WSL2. `npm run verify`: PASS (contratos/API/web compilados; tipos dos quatro workspaces; ESLint 10; um teste de API por socket real aprovado). `npm run bundle:android`: PASS, 580 módulos e bundle Hermes exportado. Página inicial renderizada no navegador; evidência local `test-results/bootstrap/web.png`. Essas verificações são do agente, não testes manuais do responsável.

`npm audit --audit-level=high`: **FAIL, exit code 1, cinco avisos altos**. São dois problemas de origem, propagados aos pacotes dependentes: node-forge 1.4.0 em @expo/cli e @expo/code-signing-certificates, e zod 3.25.76 em @expo/cli. Log completo: `test-results/bootstrap/agent-verification.log`. Os avisos não foram ocultados, removidos nem tratados como PASS.

- [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv): node-forge <=1.4.0, sem versão corrigida publicada na consulta. Registro npm consultado: latest=1.4.0. [Proposta de correção upstream #1152, ainda aberta](https://github.com/digitalbazaar/forge/pull/1152/files), commit curto exibido pela origem `ceba344`. Não é release aprovada pelo mantenedor nem correção aplicada neste projeto.
- [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5): zod <4.6.6; npm consultado oferece 4.6.7. A CLI instalada declara Zod 3, portanto trocar por 4 exige verificar suas schemas/CLI, sem pressupor compatibilidade.
- `npm audit fix --force` sugere Expo 44.0.6: não executado por downgrade incompatível com SDK 57 ratificado.

### Proposta concreta de correção, ainda NÃO autorizada/aplicada

Ampliar exclusivamente o escopo primário da TASK-002 para um patch reprodutível da dependência de ferramenta e testes correspondentes, sem mudar SDK, requisitos, autenticação do produto, arquitetura ou avançar TASK-003. Não é alteração incidental: modifica validação criptográfica de terceiro e reprova o critério 8 do teste incidental de AGENTS.

Arquivos previstos: `patches/node-forge+1.4.0.patch`, `tests/bootstrap/security/**`, configuração de instalação/verificação em `package.json`, lockfile, este documento e registro/Allowed Changes da TASK-002. `node_modules/node-forge/lib/rsa.js` receberia apenas o patch durante instalação, sem editar arquivo de biblioteca manualmente e perder a mudança no próximo npm ci. A inclusão de mecanismo de patch e testes é parte da decisão pendente.

Diferença proposta para o trecho ASN.1, equivalente ao ajuste pequeno discutido no upstream e sujeita a teste independente no projeto:

```diff
 if(!asn1.validate(obj, digestInfoValidator, capture, errors) ||
-  obj.value.length !== 2) {
+  obj.value.length !== 2 ||
+  obj.value[0].value.length !==
+    (('parameters' in capture) ? 2 : 1)) {
```

O objetivo é rejeitar filhos extras na sequência aninhada, preservando a validação e assinatura legítima. Não substituir verificação por sucesso, não alterar metadados para esconder vulnerabilidade e não importar fork remoto sem revisão. Para Zod, experimentar atualização transitiva explícita para 4.6.7 com testes de aceitação/rejeição das schemas reais do Expo; se incompatível, manter bloqueio e reapresentar alternativa.

Validações propostas antes de aceitar qualquer mitigação:

1. Reproduzir o defeito ASN.1 em fixture de teste isolada; comprovar que a rejeição do caso inválido falha antes da correção e passa depois. Assinatura legítima continua válida; sequência extra, digest/assinatura alterados e formatos inválidos são negados.
2. Aplicação exata do patch à versão/hash esperados; instalação limpa `npm ci` reaplica e valida correção. Patch que não casa com o arquivo deve falhar, sem seguir silenciosamente.
3. Testar schemas reais da CLI Expo com payload válido/inválido sob Zod corrigido; repetir inicialização da CLI, export Android, build/tipos/lint/testes afetados.
4. Reexecutar auditoria integral e registrar saída original. Ela pode continuar indicando node-forge pela versão 1.4.0, mesmo com patch local; **não registrar npm audit como PASS** nesse caso. A aceitação do gate de segurança exigiria decisão explícita sobre evidência de mitigação verificada por patch/hash/testes para esse único aviso, sem dispensar auditoria nem aceitar avisos novos. Essa condição faz parte da aprovação solicitada, não está em vigor.
5. Responsável executa roteiro manual atualizado e registra evidência; nenhum resultado manual ou DONE antecipado.

Alternativas: aguardar release upstream e manter TASK-002 bloqueada; ou autorizar revisão da estratégia de ferramenta em decisão própria. Aguardar decisão do responsável sobre ampliar o escopo e o critério verificável de mitigação; a autorização contínua anterior não cobre a exceção ao limite incidental nem autoriza fingir gate aprovado.
