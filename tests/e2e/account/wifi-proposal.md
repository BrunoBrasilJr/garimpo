# Proposta pendente — teste Android pelo Wi-Fi

Decisão do responsável em 2026-10-25: **“Autorizar túnel temporário de teste”**, em resposta à proposta abaixo. Ampliação limitada autorizada. Nenhuma dispensa de validação TLS ou de aceite humano.

## SCOPE ESCALATION
TASK: TASK-006

Necessidade identificada: disponibilizar uma origem HTTPS confiável pelo Android/Expo Go para o teste humano, sem cabo USB. O responsável confirmou uso de Wi-Fi.

Motivo: a fixture atual aceita sua CA apenas no perfil Firefox isolado. Isso não estabelece confiança no Expo Go. Não basta supor que instalar uma CA no Android será suficiente; a configuração de confiança depende do aplicativo nativo. Não foi declarado defeito específico do APK SDK 57 sem teste real.

Arquivos/módulos afetados: somente harness/roteiro em tests/e2e/account/**, registro desta decisão em TASKS.md e, se necessário para rastrear o ambiente temporário, docs/architecture/execution.md. Ferramenta cloudflared fora do repositório e limitada à execução de teste. Não mudar o código de produção/API, migrations, trust store do sistema ou configuração nativa do app.

Allowed Changes atual: testes de conta e configuração mínima diretamente necessária; não inclui exposição externa de rede como decisão já ratificada.

Forbidden Changes relacionado: arquitetura ratificada, serviço de produção fora do escopo e desabilitação de validação TLS.

Por que não é uma Incidental Change: muda a exposição e o intermediário de transporte durante o teste. Requer decisão explícita conforme AGENTS §8–9.

Impacto se não realizada: inspeção web pode prosseguir; aceite nativo permanece pendente e TASK-006 não pode ser DONE.

Alternativas: (a) túnel HTTPS temporário de teste, recomendado para usar o Expo Go existente; (b) build de desenvolvimento próprio com confiança restrita à CA de teste, exigindo escopo nativo/toolchain adicional; (c) permanecer com validação Android bloqueada até existir endpoint confiável.

Recomendação concreta: autorizar um Cloudflare Quick Tunnel somente durante a inspeção, apontando para a fixture HTTPS em loopback e seu schema UUID novo em garimpo_test. Origem validada com CA explícita (`origin-ca-pool`), nunca `no-tls-verify`. O celular usa a URL HTTPS temporária em EXPO_PUBLIC_API_ORIGIN. Encerrar o processo ao terminar. PostgreSQL, arquivos de evidência, mensagens locais e credenciais técnicas não serão publicados. A caixa técnica continuará local e protegida; dados de teste devem ser exclusivamente inventados.

O endereço será público para quem o descobrir; a Cloudflare termina TLS e intermedeia as requisições de teste. O serviço não tem garantia de disponibilidade e o endereço muda a cada execução. Não é publicação de produção, nem exige conta/domínio segundo a documentação. Instalação/download da ferramenta e execução só depois da decisão. Conferir versão, origem oficial e parâmetros efetivos antes de iniciar; preservar verificação de certificados nos dois trechos.

Decisão necessária: autorizar essa ampliação limitada para o teste Android, ou escolher uma alternativa. Nenhuma dispensa de HTTPS, segurança ou aceite humano está sendo solicitada.

Fontes: [Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/), [parâmetros da origem](https://developers.cloudflare.com/tunnel/reference/origin-parameters/), [confiança de rede Android](https://developer.android.com/privacy-and-security/security-config).
