# Execução do Garimpo

O [guia de operação local](../operations/garimpo-local.md) reúne os comandos
atuais do sistema. Os registros a seguir preservam a evolução por incremento.

## Validação vigente da correção — 2026-11-01

Branch fix/TASK-002-toolchain-security, código da correção em 2ebf90a. Continuidade e decisões rotineiras já foram autorizadas; não solicitar novas permissões genéricas. TASK-002 DONE após os gates abaixo; TASK-007 deve retomar a revisão documental na branch própria. Nenhum catálogo foi iniciado neste fechamento.

A instalação limpa no volume montado do Windows permaneceu sem progresso útil por mais de oito minutos; SIGINT não encerrou seu processo npm ci, que foi terminado por PID conferido, sem atingir PostgreSQL ou processos alheios. Duas árvores parciais foram preservadas por renomeação de caminhos absolutos verificados em test-results/toolchain-20261101/node_modules-interrompido e node_modules-montagem. Não houve exclusão do ZIP do responsável ou de dados originais.

Uma cópia Git isolada do mesmo commit foi criada em /home/brasi/.local/share/garimpo/validation/task002-20261101. Com os mesmos Node 24.22.1/npm 11.19.1, npm ci instalou 804 pacotes em dois minutos e executou preinstall/postinstall, conferindo Forge 1.4.2 e aplicando o patch exato nas três distribuições de deepmerge. npm run verify passou em build, tipos, lint, 45 unitários e 39 integrações reais (9 core, 14 contas, 16 mensagens). A política de segurança passou no critério restrito: npm audit bruto exit 1, sete low, zero moderate/high/critical, somente a cadeia exata de deepmerge com hashes conferidos. Não é auditoria sem achados. Log: test-results/toolchain-20261101/native-clean-and-gates.log.

Exportação Android PASS, 586 módulos em 86,7 segundos, em test-results/toolchain-20261101/native-ui-recheck.log. Não comprova execução nativa ou leitor de tela. E2E inicial: quatro PASS e três timeouts; segunda rodada, com a cópia de dependências pausada: seis PASS e uma falha no cadastro, ainda mostrando Aguarde após dez segundos. Resultados e contextos de erro foram preservados; não há PASS integral de E2E nem liberação do checkpoint. Windows tinha cerca de 600 MB de RAM disponíveis na conferência. Foi iniciada liberação reversível dos caches do Ubuntu e nova rodada com os mesmos limites de teste, sem alterar senha/scrypt, validação TLS ou código de aplicação.

Atualização da validação: terceira rodada integral E2E PASS, sete casos, com os mesmos limites de 60 segundos por caso e dez segundos por expectativa. Log test-results/toolchain-20261101/native-ui-memory-recheck.log; schema isolado task006_ae00cf8edd2d47c19247508cb02dfd46. Nenhuma mudança de código, scrypt, TLS ou teste para obter o resultado. As rodadas iniciais continuam FAILED no histórico. Total válido: 45 unitários + 39 integrações + sete E2E = 91 casos distintos. TASK-002 DONE no ambiente Linux reproduzível validado. A cópia de dependências no caminho Windows é uma restauração operacional paralela; não foi usada para atribuir PASS a esses gates.

A restauração de node_modules da pasta original a partir da instalação Linux foi retomada nos dois processos tar próprios após a suíte aprovada. A árvore de destino ainda é parcial e não deve ser usada antes da conclusão e da conferência de hashes. Não iniciar outro npm ci ou npm install nela. O histórico abaixo preserva a sequência anterior e não substitui este estado vigente.

## Histórico do ponto de retomada salvo a pedido do responsável — 2026-11-01

Estado posterior confirmado: correção salva em commit 2ebf90a na branch fix/TASK-002-toolchain-security. As permissões do ambiente foram alteradas pelo responsável para execução sem aprovação; não repetir perguntas de autorização. A segunda tentativa de npm ci falhou com ENOTEMPTY no diretório @types/lodash após a interrupção. Nenhum processo de validação seguia ativo na conferência. A instalação parcial foi preservada por renomeação nativa do Windows, de caminhos absolutos conferidos dentro do projeto, para test-results/toolchain-20261101/node_modules-interrompido. Nova instalação limpa foi iniciada a partir de node_modules ausente, sessão 22098, log clean-install-and-gates.log; não executar instalação concorrente. Esse processo ainda está em validação e não aprova nenhum gate futuro.

Atualização posterior: o responsável autorizou continuar autonomamente (“vc pode executar QUALQUER coisa ... sem pedir minha permissão”), mantendo o objetivo do Garimpo enquanto resolve outro assunto. A pausa breve foi encerrada por essa instrução. A sessão 82505 terminou com exit 1 após Ctrl+C, sem aprovação de npm ci; node_modules ficou incompleto (vitest ausente na conferência). O script de instalação limpa foi reiniciado antes de qualquer novo teste. Permissões impostas pelo ambiente continuam sendo respeitadas; a autorização não é evidência de resultado de teste nem autorização para atribuir aprovação inexistente ao professor.

Trabalho pausado por solicitação explícita: “big, salva onde vc parou ai”. Branch atual: fix/TASK-002-toolchain-security. Último commit confirmado: 9297f20 (checkpoint TASK-007 bloqueado e preservado). A tentativa posterior de commit foi interrompida antes de concluir: a correção está salva nos arquivos e preparada no índice Git, mas não deve ser relatada como commit existente. ZIP solto do responsável permanece fora do índice, preservado.

Estado: TASK-002 reaberta IN_PROGRESS para correção de dependências; TASK-007 BLOCKED até a correção passar pelos gates; TASK-008 não iniciada. Não interpretar a pausa como FAILED, DONE ou dispensa de validação. Meta autorizada: tentar 28/37 DONE até quinta 05/11, horário ainda indefinido. Decisões rotineiras delegadas; pacote concreto PD-006 adotado para preparação futura (Goldmine M/NM/VG+/VG/G+/G/F/P, notas inteiras 1–5, promoções fixa/percentual), com origem registrada na TASK-007. TalkBack recusado pelo responsável, não executado, sem PASS inventado.

Já comprovado: baseline de retomada com build/tipos/lint e 72 casos PASS antes de a auditoria bloquear; correção dirigida com 25 casos de segurança/compatibilidade PASS, tipos/lint PASS, releases oficiais resolvidas (Forge 1.4.2, glob 14.0.3, minimatch 11.0.3), patch deepmerge 4.3.1 aplicado com hashes nas três distribuições. Auditoria dirigida anterior tinha zero high/moderate e sete low somente de deepmerge, mas retornava 0 por usar limiar high. O limiar foi fortalecido para low e foi adicionado um teste de relatório vazio; esses últimos ajustes ainda exigem o resultado da rodada completa. Nenhuma alteração em módulos comerciais, Expo SDK, schema ou migrations.

Validação completa iniciada pelo script local ignorado test-results/toolchain-20261101/verify-clean.sh, sessão de execução 82505. Última saída observada no momento da pausa: Node 24.22.1, npm 11.19.1 e revisão 9297f20; ainda sem confirmação de término do npm ci. A consulta de processos WSL para encerramento foi recusada pela permissão; não afirmar que o processo terminou ou que a instalação está íntegra. Conferir primeiro se essa execução continua ativa e ler clean-install-and-gates.log antes de rodar qualquer instalação concorrente.

Próximos passos ao retomar:

1. Conferir git status e log, preservando o ZIP não versionado; verificar o término/resultado do processo da instalação limpa. Se foi interrompida, refazer npm ci com o lockfile atual no Ubuntu antes de usar node_modules. Não executar npm install no Windows na mesma pasta.
2. Completar a validação: npm run verify, npm run test:account-ui e npm run bundle:android, com runtime Linux e environment.sh protegido do PostgreSQL. O script verify-clean.sh executa essa ordem. Não usar dados originais, resets, force ou desativar validação. Auditoria bruta deve continuar íntegra; aceitar apenas a cadeia exata de deepmerge com hashes conferidos.
3. Corrigir qualquer falha no escopo da TASK-002, registrar resultados reais/limitações, concluir a correção somente quando os gates afetados passarem e realizar commits rastreáveis. O commit pendente não deve incluir o ZIP. Instalação limpa, E2E e bundle ainda não foram aprovados nesta rodada.
4. Voltar à branch chore/TASK-007-checkpoint-phase01 e incorporar a correção validada, atualizar docs/validation/phase-01.md e TASKS.md. Fechar o checkpoint somente com gates acumulados válidos; registrar limitações de TalkBack/iOS/Chrome/Edge sem fingir execução. Só depois preparar TASK-008 na branch própria.

Evidências locais preservadas: test-results/account-ui/manual-20261102T010201Z.log (baseline até o bloqueio), test-results/toolchain-20261101/audit-before.json, deepmerge-before.log (inclui expectativa de teste inicialmente incorreta), deepmerge-before-corrected.log (três reproduções reais, um caso normal PASS), install-updates.log, security-directed.log, audit-directed-high-threshold.json e clean-install-and-gates.log. Falhas intermediárias e correções estão descritas abaixo; não apagá-las nem confundi-las com uma rodada integral aprovada.

## Retomada de segurança em 2026-11-01

O histórico de bootstrap abaixo descreve a entrega de 25/10; o estado atual da implementação está em TASKS.md. A revalidação da TASK-007 encontrou avisos publicados/revisados depois da entrega: relatório bruto com 23 pacotes afetados (1 high, 20 moderate, 2 low), preservado em test-results/toolchain-20261101/audit-before.json. A política antiga bloqueou o avanço corretamente. TASK-007 permanece BLOCKED e TASK-002 foi reaberta em fix/TASK-002-toolchain-security, base 9297f20.

Sob a delegação posterior do responsável para decisões rotineiras e correções sem novas permissões genéricas, o agente adotou a menor correção compatível com o SDK já instalado. Essa origem não é uma aprovação nominal de hashes nem requisito do PDF. Não houve mudança do Expo SDK 57, código de contas, regras comerciais, schema ou migrations.

Overrides exatos: node-forge 1.4.2 (release upstream corrigida), glob 14.0.3, minimatch 11.0.3 e deepmerge 4.3.1. O npm install inicialmente reteve versões de duas dependências no lockfile; atualização dirigida de glob/minimatch/node-forge e npm ls confirmaram uma cópia resolvida de cada versão, sem force ou legacy-peer-deps. O lockfile registra integridade dos tarballs oficiais. Node 24.22.1 satisfaz os requisitos das releases; a compatibilidade de glob/minimatch 11 exige testes reais da CLI e lint, não apenas comparação de versão.

Deepmerge ainda não dispõe de release corrigida para GHSA-gcqx-w48m-w2h4. Patch local bloqueia somente a chave __proto__ antes de copiar o alvo e antes de mesclar a origem. Duas guardas são aplicadas de forma idêntica em index.js, dist/cjs.js (entrada real CommonJS) e dist/umd.js. Não altera Object.prototype global, não faz requisições externas e preserva dados normais, arrays, símbolos e customMerge. Fonte/patch/hashes estão em patches/deepmerge+4.3.1.patch e .json. O instalador só aceita versão e bytes exatos e falha em qualquer divergência. O fonte index.js referencia uma dependência apenas de build não distribuída; por isso o teste de runtime usa CommonJS e UMD, e o fonte é conferido por hash.

O manifesto node-forge+1.4.2.json confere a release oficial sem reaplicar o patch antigo. SHA-256 revisado de lib/rsa.js: 6632e195295ce76f6bb9131ee770dcd6cc1ee4ffac7906302208b00faf95a87f. Artefatos node-forge+1.4.0 permanecem somente como histórico. A política agora rejeita inclusive a antiga exceção Forge caso reapareça; a única mitigação possível é deepmerge e sua cadeia Expo, com origem de advisory exata e todos os hashes verificados. O npm audit bruto sempre é preservado, nunca declarado PASS quando retornar achados.

Regressão antes da correção: deepmerge-before-corrected.log contém três falhas que reproduzem envenenamento de protótipo (alvo sem protótipo, cópia de alvo e placeholder null) e um caso normal PASS. A primeira tentativa do teste normal tinha expectativa incorreta de customMerge para strings; foi corrigida para objetos antes dessa reprodução, sem mudar a biblioteca para atender uma expectativa falsa. A primeira aplicação só ao fonte não corrigiu a entrada CommonJS: os três casos continuaram falhando, levando à aplicação nas distribuições também. A primeira sonda de minimatch usou makeRe, removido na API 11; foi ajustada para a API atual match, preservando o padrão adversarial e o limite de processo, sem flexibilizar segurança.

Validação dirigida parcial: 25 casos de segurança/compatibilidade PASS em cinco arquivos, incluindo o padrão adversarial em processo separado, cancelamento de glob, loader real da configuração Expo e preservação do decoder PEM com Buffer. O teste de integridade e os ataques ASN.1 anteriores continuam presentes. Tipos, lint, auditoria atual, instalação limpa e gates completos ainda devem terminar antes de aceitar a correção. Log da rodada corrente: test-results/toolchain-20261101/security-directed.log; nenhum resultado futuro aprovado.

Resultado posterior dirigido: tipos e lint PASS; relatório com zero high/moderate e sete low ligados somente a deepmerge. A execução ainda usava --audit-level=high e retornou 0 apesar dos sete low; esse resultado foi preservado em audit-directed-high-threshold.json e não é auditoria sem achados. O comando foi fortalecido para --audit-level=low, com rejeição de inconsistência entre achados e status. Acrescentado caso de relatório realmente vazio à política. Instalação limpa e gates completos iniciados em test-results/toolchain-20261101/clean-install-and-gates.log; PENDING até saída final real.

Fontes primárias consultadas: [Forge changelog](https://github.com/digitalbazaar/forge/blob/main/CHANGELOG.md), [minimatch advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249), [glob advisory](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), [deepmerge advisory](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) e [reprodução e remediação em deepmerge](https://github.com/TehShrike/deepmerge/issues/273). Consulta documental não equivale a resultado executável.

## Estado do incremento

TASK-002 prepara somente estrutura: contratos operacionais, processo API, tela inicial web/mobile e configuração de qualidade. Não há conta, banco, migration, catálogo ou checkout implementados. Os parâmetros ratificados em TASK-001 governam este incremento; textos anteriores ainda chamados “proposta” devem ser lidos com a ratificação registrada nos ADRs e parâmetros, sem presumir aprovação de teste de runtime.

Ambiente alvo: Windows → Ubuntu WSL2, com Node Linux 24.22.1. Runtime isolado em `~/.local/share/garimpo/node-v24.22.1-linux-x64`, baixado da origem oficial e conferido pelo SHA-256 do fabricante. Isso não altera o Node global do Windows. Git existente no Ubuntu: 2.43.0. Dependências são instaladas para Linux; não alternar instalação Windows/Linux na mesma pasta node_modules.

## Preparação no Ubuntu WSL

Em um Ubuntu novo, instalar primeiro o runtime isolado (não repetir se a pasta já estiver preparada):

```bash
runtime_parent="$HOME/.local/share/garimpo"
mkdir -p "$runtime_parent"
cd "$runtime_parent"
curl --fail --location --output node-v24.22.1-linux-x64.tar.xz https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-x64.tar.xz
curl --fail --location --output SHASUMS256.txt https://nodejs.org/dist/v24.22.1/SHASUMS256.txt
grep -F ' node-v24.22.1-linux-x64.tar.xz' SHASUMS256.txt | sha256sum --check &&
  tar -xJf node-v24.22.1-linux-x64.tar.xz
```

Pré-requisitos de biblioteca do DevTools no Ubuntu 24.04 (já instalados no ambiente desta execução):

```bash
sudo apt-get update
sudo apt-get install --no-install-recommends libnspr4 libnss3 libasound2t64
```

Esses comandos reproduzem a preparação realizada; não criam banco nem implementam módulos. Não executar upgrade geral como parte deste roteiro.

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
| `npm run typecheck` | Tipos dos quatro workspaces e arquivos de testes | Saída zero, sem erro TypeScript |
| `npm run lint` | Fontes e configuração | Saída zero, sem erro ESLint |
| `npm test` | Teste de integração do bootstrap | Health real por socket local, rota comercial ausente e nenhum x-powered-by |
| `npm run verify` | Build, tipos, lint, testes e classificação restrita da auditoria | Saída zero somente com validações aprovadas e nenhum aviso desconhecido |
| `npm run audit:toolchain` | Auditoria integral e conferência do único aviso explicitamente mitigado | Saída real salva em audit-patched.json; versão/hash e origem dos avisos conferidos, sem chamar auditoria falha de PASS |
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

Exceção de interpretação explicitamente autorizada pelo responsável: a saída original do subprocesso npm audit pode continuar mostrando FAIL e quatro avisos derivados de node-forge 1.4.0. O verificador não altera essa saída; só aceita a origem GHSA-86w9-cpqp-85rv com bytes corrigidos de hash conhecido, após testes de regressão. Aviso novo, relatório incompleto ou hash divergente faz o comando falhar. Isso não autoriza ignorar erro do roteiro nem declarar a auditoria bruta aprovada.

Resultado obtido: responsável executou o roteiro e enviou a saída completa em 2026-10-25; log local conferido. Build, tipos, lint, 15 testes e exportação Android concluídos. Auditoria bruta permanece FAIL/exit 1, quatro avisos altos da origem autorizada; classificação restrita com patch/hash validada. Evidência: `test-results/bootstrap/manual-20261025T172543Z.log`, revisão `18a7ca8`, Linux WSL2, Node 24.22.1/npm 11.19.1. Status: PASS no critério autorizado. Não comprova inspeção web ou execução no aparelho.

### BOOT-002 — página web e recorte TEST-028

Em outro terminal Ubuntu preparado, executar `npm run dev:web`. Abrir o endereço local indicado pelo Vite no Chrome/Edge do Windows. Conferir título Garimpo, texto legível, idioma português, redimensionamento/ampliação e ausência de erro no console. Nesta estrutura não há controle interativo comercial nem login a testar; não declarar paridade funcional futura aprovada. Encerrar com Ctrl+C.

Resultado obtido: em 2026-10-25, após roteiro de abertura em Chrome/Edge, conferência da tela em português, ampliação e console com recarga, responsável confirmou “tudo certo, mano!”. Status: PASS por confirmação manual do responsável. Navegador/versão exatos não informados; não inferidos. Evidência: resposta no chat ao roteiro BOOT-002.

### BOOT-003 — execução Android

Executar `npm run dev:mobile` no Ubuntu preparado. Abrir no Android com cliente Expo compatível com SDK 57 ou development build correspondente; não aceitar cliente de SDK incompatível nem Expo web como teste nativo. O [site oficial do Expo Go](https://expo.dev/go) oferece seleção de SDK e plataforma; escolher SDK 57/Android para este projeto, sem presumir que o cliente mais recente da loja aceite esse SDK. Confirmar rede/URL acessível ao aparelho. Se o WSL não expuser Metro à rede, diagnosticar conectividade e registrar bloqueio; não dispensar validação nem alterar firewall silenciosamente. Um túnel externo exigiria configuração explícita, não é iniciado automaticamente.

Conferir tela Garimpo, ausência de tela de erro, texto ampliado e leitura do título pelo TalkBack. Nenhuma conta/administração/catalogação disponível neste incremento. Registrar modelo/versão Android, cliente Expo e revisão. Encerrar Metro com Ctrl+C. Compatibilidade iOS preservada em app.json, mas nenhuma execução iOS é alegada.

Resultado obtido em 2026-10-25: após bundle nativo de 68.463 ms/708 módulos, responsável confirmou “tudo funcionando, mano!” em resposta à conferência da tela sem erro e fonte ampliada. Status: PASS no recorte revisado pelo responsável. Expo Go SDK 58 rejeitou o projeto; responsável instalou o cliente compatível com SDK 57 e repetiu. Modelo/versão Android e versão exata do cliente não informados; não inferidos. TalkBack: NÃO EXECUTADO/DISPENSADO por instrução explícita do responsável (“nunca, o talback é horrível pra desativar depois kk”); essa decisão reduz o recorte manual deste bootstrap e não aprova leitura por leitor de tela nem dispensa acessibilidade futura.

Conectividade local diagnosticada: Metro ativo no WSL 172.30.246.124:8081, Windows inicialmente escutando somente ::1:8081. Responsável executou o encaminhamento específico 192.168.0.93:8081 → WSL e regra Garimpo-Metro-8081 (TCP 8081, interface Wi-Fi, origem LocalSubnet); confirmou /status acessível no Android. Metro reiniciado com REACT_NATIVE_PACKAGER_HOSTNAME=192.168.0.93. Sem túnel externo. Limpeza temporária ainda depende de execução pelo responsável no PowerShell administrador após encerrar Metro:

```powershell
netsh interface portproxy delete v4tov4 listenaddress=192.168.0.93 listenport=8081
Remove-NetFirewallRule -Name "Garimpo-Metro-8081"
```

Não afirmar que essa limpeza já ocorreu; não remover regras de terceiros.

### Contagem e tratamento de falhas

Previstos 3; executados 3; aprovados 3 no recorte revisado; reprovados finais 0; bloqueados 0; pendentes obrigatórios 0. TalkBack é uma verificação dispensada/não executada, nunca PASS. Problemas iniciais de conectividade/SDK foram resolvidos e o responsável confirmou a repetição. Gate manual PASS conforme decisão explícita de escopo e confirmações do responsável.

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

### Correção autorizada, em validação

Em 2026-10-25, o responsável respondeu **“Autorizar correção e validação propostas”** à ampliação de escopo e ao critério explícito de avaliação do aviso residual por patch/hash/testes, mantendo a saída real da auditoria. Allowed Changes da TASK-002 atualizado antes da implementação. Este registro supera o estado pendente da proposta abaixo, preservando sua origem; aprovação da proposta não é aprovação antecipada dos testes.

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

Alternativas consideradas: aguardar release upstream e manter TASK-002 bloqueada; ou revisão da estratégia de ferramenta em decisão própria. Responsável escolheu a correção revisada descrita acima. Nenhuma autorização permite fingir gate aprovado; nova falha, hash divergente ou aviso não coberto volta a bloquear avanço.

### Evidências da correção autorizada

- Antes do patch: `security-before-patch.log`, dois testes de rejeição falharam porque as estruturas aninhadas inválidas foram aceitas (com e sem NULL). É reprodução intencional do defeito, não resultado aprovado.
- Depois: seis testes Forge passaram, preservando assinaturas válidas, rejeitando formatos inválidos e conferindo hash. Primeira rodada detectou Zod 3 retido pelo lockfile apesar do override; `npm update zod` recalculou somente essa dependência, e os três testes de versão/schema passaram em seguida. Falha e repetição preservadas no histórico.
- Instalação limpa: `npm ci --no-fund --no-audit` reinstalou 651 pacotes e o postinstall reaplicou o patch verificando os hashes de origem/destino. Não usou force, legacy-peer-deps, fork remoto ou edição de metadados para ocultar aviso.
- `security-clean-install.log`: build/tipos/lint aprovados; **15 testes aprovados** em quatro arquivos (API 1, Forge 6, schemas Zod 3, política de auditoria 5). A política rejeita avisos novos, evidência incompleta/inconsistente e ciclos sem origem conhecida.
- Auditoria integral após correção: saída original 1; quatro avisos altos derivados exclusivamente de node-forge. Zod não aparece mais. `audit-patched.json` mantém o relatório bruto; classificação restrita autorizada conferiu origem e hash, sem registrar npm audit como PASS.
- Bundle Android após instalação limpa: 580 módulos, exportação concluída. A conferência final da matriz instalada do SDK identificou patches nativos recomendados: React Native **0.86.3** e expo-status-bar **57.0.1**. Foram alinhados no mesmo SDK 57/React 19.2.3, sem mudança arquitetural. `expo install --check` confirmou **Dependencies are up to date**; resultados posteriores do incremento estão em `sdk-compatibility.log`.

Aceitação manual concluída: BOOT-001/002/003 PASS no recorte revisado, com evidência do responsável acima. TalkBack dispensado/não executado por decisão explícita; nenhuma execução iOS alegada. Auditoria bruta permanece FAIL conhecida com mitigação autorizada, sem novos resultados inventados. Limpeza da liberação temporária documentada para execução pelo responsável.

### Verificação de inicialização e pré-requisitos Linux

API compilada iniciada por `npm run start --workspace @garimpo/api`; probe real retornou `{"status":"ok","service":"garimpo-api"}` em loopback 3001. Roteiro validado com `bash -n` e conferência de sintaxe sem erro.

A primeira tentativa de CLI combinou --offline/--localhost, opções mutuamente exclusivas, e falhou antes de iniciar; corrigida para variável `EXPO_OFFLINE=1` com --localhost. A tentativa seguinte iniciou Metro, mas o instalador auxiliar do React Native DevTools registrou bibliotecas Linux ausentes. Diagnóstico do ELF real identificou libnspr4, NSS e ALSA. Instalação específica autorizada: `libnspr4`, `libnss3`, `libasound2t64` e dependência `libasound2-data`, dos repositórios archive.ubuntu.com para Ubuntu 24.04; zero pacotes existentes atualizados e nenhum upgrade geral.

Nova inicialização `EXPO_OFFLINE=1 CI=1 npm run start --workspace @garimpo/mobile -- --localhost --port 8081` chegou a **Waiting on http://localhost:8081**, sem o erro anterior. Evidência: `test-results/bootstrap/metro-startup.log`. Processo de teste encerrado intencionalmente após essa confirmação, liberando a porta para o responsável iniciar seu teste normal. Isso aprova inicialização da CLI, não execução nativa em aparelho. A web permanece disponível localmente para conferência.

## Backup diário — TASK-030

Política acadêmica local escolhida em 2026-11-07 sob a delegação do responsável para decisões técnicas e continuidade até 100%. Execução diária às 03h no fuso do Windows, America/Sao_Paulo, com StartWhenAvailable. O agendamento usa a sessão interativa do usuário e requer computador ligado e sessão aberta. O WSL/cluster local é iniciado quando necessário. Destino privado padrão em ~/.local/share/garimpo/backups, modo 0700, arquivos 0600. Retenção por idade de 30 dias para conjuntos completos, reconhecidos e verificados, aplicada somente após concluir uma nova cópia. Conjuntos incompletos ou alterados são preservados para inspeção. A frequência do ensaio isolado é mensal e será instalada e comprovada na TASK-035.

PD-008 está resolvida para essa operação local por decisão delegada. Os valores não foram extraídos do PDF nem aprovados nominalmente pelo professor. A política de dados pessoais permanece conservadora: contas encerradas e histórico são preservados e não há processo automático de exclusão/anonimização. Qualquer mudança dessa política requer decisão própria.

O comando npm run backup -- daily precisa de DATABASE_URL do ambiente privado já preparado, migrations aplicadas e ferramentas PostgreSQL 17. GARIMPO_MEDIA_ROOT e GARIMPO_BACKUP_ROOT permitem selecionar raízes explicitamente. Não passar credenciais na linha de comando. O perfil aceita apenas os bancos garimpo_dev/garimpo_test em loopback e schema public ou schema isolado de tarefa. O instalador Windows está em scripts/backup/install-schedule.ps1 e o executor WSL em scripts/backup/daily.sh.

Cada conjunto contém database.dump, media/, manifest.json e manifest.sha256. O dump customizado e as consultas de referências/digests compartilham um snapshot PostgreSQL exportado, com transação repeatable-read. O pg_dump usa --snapshot e --schema explícitos. Referência técnica: [PostgreSQL 17, pg_dump](https://www.postgresql.org/docs/17/app-pgdump.html). São preservadas imagens atuais e bytes históricos imutáveis, inclusive referências dos snapshots de pedidos/finalizações. Evidências privadas estão no banco e recebem hashes e tamanhos no manifesto, junto aos fingerprints das tabelas. A configuração protegida do ambiente deve continuar sob custódia do operador.

A publicação ocorre por rename de uma pasta privada de preparação somente depois da verificação de hashes/referências e sincronização dos arquivos. BackupRun distingue RUNNING/SUCCEEDED/FAILED, sem registrar senha ou exceção bruta. Falha não substitui conjunto bom. Interrupção depois da publicação é conciliada pela verificação do conjunto em nova execução. Lock PostgreSQL impede backups concorrentes. npm run backup -- verify CAMINHO verifica integridade sem modificar a origem. Restauração e comparação em destino separado pertencem à TASK-035.
