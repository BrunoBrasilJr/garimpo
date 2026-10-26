# TASK-006 — contas nas interfaces

Status: implementação em validação. Nenhum aceite humano web/Android presumido.

## Verificação reproduzível no Ubuntu WSL

```bash
export PATH="$HOME/.local/share/garimpo/node-v24.22.1-linux-x64/bin:$PATH"
cd /mnt/c/Users/brasi/garimpo-planejamento
bash tests/e2e/account/manual-account-ui.sh
```

Pré-requisitos: ambiente PostgreSQL de testes já preparado na TASK-003; Firefox do Playwright e `certutil` disponíveis. O script lê o ambiente protegido existente, sem imprimir credenciais. Não executar com base original nem compartilhar arquivos de credenciais/mensagens. A auditoria bruta mantém os quatro achados conhecidos; somente a mitigação ratificada é classificada pelo gate, sem declarar auditoria limpa.

`test:account-ui` cria schema UUID novo em `garimpo_test`, aplica migrations existentes e usa API real. Não há reset/drop da base anterior. Certificado válido para a origem local, CA aceita somente no perfil Firefox isolado e temporário, sem `ignoreHTTPSErrors`. Há controle negativo com navegador sem essa CA. Relógio controlado só na fixture Node; não existe endpoint para modificar tempo. Evidências ficam em `test-results/account-ui/` ignorado pelo Git. Tokens nunca vão para trace/vídeo ou relatórios; screenshots usam contas sintéticas.

Os testes Node de `mobile-client.test.ts` cobrem protocolo, concorrência e armazenamento injetado. Não comprovam que SecureStore funciona no aparelho. O bundle Android comprova empacotamento, sem simular aceite nativo.

## Inspeção web humana

Após build aprovado, no mesmo terminal preparado:

```bash
source "$HOME/.local/share/garimpo/postgres17/environment.sh"
node --experimental-strip-types tests/e2e/account/manual-web.mjs
```

Abre Firefox pelo WSLg com perfil separado e confiança TLS restrita a esse perfil. Cadastre somente um e-mail `@example.invalid` e senha de teste. Confira cadastro/login, erro de senha, confirmação de e-mail, recuperação, alteração de e-mail preservando o antigo até confirmar, nome e criar/editar/excluir endereço. Use `m` no terminal para preparar a mensagem local; abra o arquivo indicado em outro terminal/editor e copie o link/código no formulário. Não cole tokens no chat. `t` avança 16 minutos apenas na fixture: uma ação de perfil deve renovar o acesso. Recarregue a página, confirme sessão e depois saia; o perfil deve exigir novo login.

Contas ADMIN/OPERATOR sintéticas ficam no `credentials.json` do diretório informado. Confira gestão da equipe como ADMIN, proteção do último administrador, ausência de gestão como OPERATOR e restrição da rota direta `#/staff`. Não use credenciais pessoais. Confira teclado/foco, erros legíveis, ampliação de texto e largura estreita sem perda de campos/botões. Registre os resultados humanos e limitações reais; nenhum leitor de tela é declarado aprovado automaticamente.

`q` encerra o navegador/servidor. O schema e evidências são preservados; nenhum certificado é instalado no Windows ou Android.

Para evitar digitar o código no Android, depois de preparar `manual-message.json`, gere um QR de texto local:

```bash
node tests/e2e/account/qr-message.mjs test-results/account-ui/SCHEMA-INFORMADO/manual-message.json
```

Abra o PNG indicado no computador e leia com a câmera/leitor QR do celular. Copie o texto detectado e cole em “Código ou link recebido” no app. Não use o scanner de projetos do Expo Go para esse QR de texto. O auxiliar usa o gerador `toqr` já incluído pelo Expo, zlib nativo e arquivo local ignorado; não instala dependências, não abre URL nem publica a caixa/token em serviço externo. O código mantém propósito, prazo e uso único originais. Não envie o PNG/código no chat ou ao Git. Gere outro PNG ao mudar a mensagem para RESET/CHANGE.

## Inspeção Android pelo Wi-Fi — ampliação temporária autorizada

O responsável informou que não tem cabo USB. O app exige `EXPO_PUBLIC_API_ORIGIN` com origem HTTPS exata; acesso fica em memória, somente renovação vai para Expo SecureStore. Administração não existe no app.

O responsável autorizou a [proposta limitada](wifi-proposal.md). Usar Cloudflare Quick Tunnel somente da fixture sintética, com CA explícita e validação TLS ativa até a origem. O relay permite somente rotas mobile de cliente; nega administração, caixa técnica e arquivos. Não muda confiança nativa, não usa HTTP para a API e não publica banco original. O endereço público temporário é intermediado pela Cloudflare e deve receber apenas dados inventados.

Ferramenta instalada no WSL: cloudflared 2026.10.3, origem oficial GitHub Cloudflare, SHA-256 `053b80b0a23031a038fdbf3c073f59f82b8f1f152aa67971d7383ffafc0dbab0`, novamente conferido pelo launcher. Sem serviço persistente ou atualização automática. Os parâmetros efetivos incluem `--origin-ca-pool`, `--origin-server-name localhost`, `--no-tls-verify=false` e log info (sem cabeçalhos sensíveis de debug).

No Ubuntu preparado, após os gates:

```bash
source "$HOME/.local/share/garimpo/postgres17/environment.sh"
node --experimental-strip-types tests/e2e/account/manual-web.mjs --wifi
```

O processo só imprime “HTTPS Android pronto” depois de receber 401 esperado da API real pela URL pública com TLS validado e 404 da caixa técnica. Guarde a URL impressa. Há encerramento automático após 45 minutos, além de `q`/Ctrl+C; schemas/evidências locais são preservados. `m` prepara mensagens locais como no roteiro web, sem publicar seus tokens. `t` avança somente o relógio dessa fixture. Túnel encerrado exige nova URL e reinício do Metro.

O encaminhamento Metro 8081 da TASK-002 foi conferido e não estava mais presente. Para restaurar a mesma configuração temporária, abra PowerShell como Administrador e execute:

```powershell
& C:\Users\brasi\garimpo-planejamento\tests\e2e\account\metro-wifi.ps1
```

O script confere os IPs antes de mudar algo; fica limitado a Wi-Fi/LocalSubnet e IP 192.168.0.93, sem encaminhar a API ou PostgreSQL. Se a rede mudar, pare e reavalie, sem aplicar valores antigos. Em outro Ubuntu, substitua somente a URL abaixo pela impressa pelo launcher:

```bash
export PATH="$HOME/.local/share/garimpo/node-v24.22.1-linux-x64/bin:$PATH"
cd /mnt/c/Users/brasi/garimpo-planejamento
EXPO_PUBLIC_API_ORIGIN=https://URL-IMPRESSA.trycloudflare.com REACT_NATIVE_PACKAGER_HOSTNAME=192.168.0.93 npm run start --workspace @garimpo/mobile -- --lan --port 8081
```

No Expo Go SDK 57, use o QR ou `exp://192.168.0.93:8081`. O canal Metro serve o código de desenvolvimento na rede local como na TASK-002; as credenciais e operações da API usam o HTTPS separado. Ao concluir: Ctrl+C no Metro, `q` no launcher e, no PowerShell Administrador:

```powershell
& C:\Users\brasi\garimpo-planejamento\tests\e2e\account\metro-wifi.ps1 -Remove
```

Depois de disponibilizada uma origem confiável, o roteiro nativo deve cobrir os mesmos fluxos de cliente, fechar e reabrir o projeto no Expo Go (restauração do refresh no SecureStore), sair e reabrir (não restaurar), recuperação de senha revogando sessão anterior, texto ampliado e ausência de administração. Somente marcar aceite depois do resultado real do responsável. Links HTTPS podem ser colados no campo de código do app; abertura automática por universal links não é prometida nesta entrega.
