# TASK-005 — mensagens e links de acesso

Estado manual: NÃO EXECUTADO pelo responsável. No Ubuntu, na raiz: `bash tests/messaging/manual-messaging.sh`. O roteiro carrega o runtime/ambiente protegido já preparado e executa os gates, com log em test-results/messaging/manual-*.log. Conferir resultados e enviar o log real. Nenhuma caixa real/e-mail externo, alteração de relógio do sistema, reset/drop de dados ou desativação de TLS.

## Grupos de conferência

1. Registro produz evento durável; worker prepara uma confirmação de 24h. Reenvio cria link novo e invalida anterior; uso único, expiração no limite e propósito conferidos. E-mail ainda não confirmado não é inventado como confirmado.
2. Reset de 30min tem resposta pública genérica, limites persistentes e uso único. Troca de senha revoga todas as sessões, credenciais de renovação e tokens de acesso/alteração/confirmação ativos, na mesma transação. Não autentica nem confirma e-mail automaticamente. Bloqueado/encerrado/inativo não ganha acesso.
3. Mudança confirma o endereço novo antes de substituir o antigo, com unicidade revalidada no commit e prazo de 24h ratificado. Correção de conta interna por ADMIN web usa o recorte somente `email` do PATCH existente; outros campos continuam no módulo accounts. Correção comercial de clientes por ADMIN será ligada na TASK-022. Consumo concorrente de reset e duas confirmações para o mesmo novo e-mail usam duas conexões e barreira de banco comprovando as duas operações esperando UPDATE ao mesmo tempo.
4. Caixa técnica exige HTTPS, modo local-test e segredo separado dos papéis USER/ADMIN/OPERATOR. Credencial em query/cookie não é aceita, resposta não é cacheada, Origin hostil negada e produção desabilitada. Corpos são cifrados; somente consulta autorizada decifra. Testes negativos de adulteração da cifra, chave/identidade incorretas e ausência de token em auditoria/eventos/corpo persistido.
5. Falha de preparação reverte token/mensagem parciais, preserva evento/tentativas e permite retomada em outra instância. Falha de entrega preserva mensagem FAILED; repetição auditada e dois consumidores não entregam duas vezes. Negócio já confirmado não é desfeito por falha de mensagem. Eventos comerciais futuros não são consumidos por este worker.

## Operação local

API/worker precisam do ambiente PostgreSQL já descrito em tests/core/README.md e de TLS confiável conforme tests/accounts/README.md. Canal desligado por padrão; configurar explicitamente `GARIMPO_MESSAGE_MODE=local-test`, fora de produção, `GARIMPO_MESSAGE_ENCRYPTION_KEY` (32 bytes aleatórios em hexadecimal) e `GARIMPO_MESSAGE_TECHNICAL_SECRET` (outros 32 bytes aleatórios, base64url). Não reaproveitar senha/credencial de usuário ou a mesma chave. Guardar fora do Git, com permissão 0600; não colocar valores em argumentos/histórico, copiar em logs ou compartilhar captura da caixa. Os testes usam valores efêmeros em memória, sem depender de segredo padrão.

Exemplo para preparar arquivo protegido uma única vez no Ubuntu, com Node já no PATH:

```bash
umask 077
mkdir -p "$HOME/.local/share/garimpo/messaging"
node --input-type=module <<'JS'
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
const text = 'export GARIMPO_MESSAGE_MODE=local-test\n'
  + 'export GARIMPO_MESSAGE_ENCRYPTION_KEY=' + randomBytes(32).toString('hex') + '\n'
  + 'export GARIMPO_MESSAGE_TECHNICAL_SECRET=' + randomBytes(32).toString('base64url') + '\n';
writeFileSync(homedir() + '/.local/share/garimpo/messaging/environment.sh', text, { flag: 'wx', mode: 0o600 });
JS
source "$HOME/.local/share/garimpo/messaging/environment.sh"
```

Se o arquivo já existir, preservá-lo e apenas carregar; não trocar chave silenciosamente: mensagens antigas exigem a mesma chave para leitura. Rotação/backup/retenção exigem política operacional na tarefa correspondente; esta entrega não a inventa. Nenhuma chave foi instalada no ambiente do responsável pelo agente nesta TASK.

Com configuração carregada, `npm run dev:api` e `npm run messages:work` (outro terminal com o mesmo ambiente) iniciam API e um lote explícito de até 100 eventos/100 entregas. Reexecutar o worker processa pendências; não há daemon/cron nem endpoint público para forçar falha, avançar relógio ou disparar entrega. O worker registra apenas contagens/erro estático, nunca tokens, destinatários ou corpos. A entrega local significa disponibilização durável na caixa técnica; não significa e-mail enviado pela Internet. Um provedor externo precisará de protocolo próprio fora da transação, sem fingir compatibilidade já executada.

`GET /api/v1/demo/messages` e `/{id}` recebem `Authorization: Bearer` com o segredo técnico, sempre HTTPS. Filtros `recipient`, `type`, `page` e `pageSize` (máximo 100); tipos ACCESS.RESET/VERIFY/CHANGE. Destinatário fica cifrado, portanto o filtro técnico examina no máximo as 1000 mensagens mais recentes, limitação explicitada na resposta `recipientScanLimit`; não é busca histórica completa nem promessa de escala. Acesso técnico à caixa permite inspecionar mensagens de teste de terceiros: não distribuir sua credencial aos clientes/compradores. Não inserir segredo em frontend, localStorage, URL ou cookie comercial. Endpoints de leitura não substituem autorização comercial.

Solicitações públicas: POST /auth/password-reset e /auth/email-verification com email; confirmações POST /auth/password-reset/confirm (token,newPassword), /auth/email-verification/confirm e /auth/email-change/confirm (token). Solicitação própria POST /me/email-change com email e sessão/CSRF. PATCH /admin/staff/{id} com somente email exige ADMIN web e deixa o endereço anterior ativo até a confirmação. Corpo misturando email com mudanças de papel/nome é negado: fazer comandos separados. Não autoriza operador a gerir internos.

Limites configuráveis `ACCESS_REQUEST_ACCOUNT_LIMIT=5` e `ACCESS_REQUEST_IP_LIMIT=20`, janela móvel de 15 minutos, valores inteiros 1..10000; zero não desabilita. Contadores persistem por operação com escopo pseudonimizado na auditoria. Validação uniforme de resposta não certifica latência constante de banco sob carga. Confirmações também limitadas por IP. Senha nova segue os mesmos 15–128 pontos de código e scrypt ratificado da TASK-004. Links usam fragmento de URL da origem HTTPS configurada, sem derivar domínio do Host recebido; UI para abrir e submeter o token vem TASK-006.

Armazenamento: tokens de verificação/reset em SHA-256 por propósito; corpo destinado à caixa é AES-256-GCM com IV aleatório de 12 bytes, tag de 16 bytes e identidade da mensagem como AAD. Cifra versionada v1; chave separada fora do banco/Git. Destinatário/link só aparecem no conteúdo técnico decifrado, nunca no evento/auditoria. Não é alegação de proteção contra comprometimento simultâneo do processo e das chaves. Reset invalida todos os tokens ativos; mudança confirmada invalida links anteriores de confirmação/reset para o endereço antigo.

Referências técnicas: [Node 24 crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html) e [OWASP Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html). Regras de produto vêm do README/PDF e parâmetros ratificados, não dessas referências.
