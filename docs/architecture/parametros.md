# Parâmetros e decisões pendentes

## Frete configurável e criação de pedido — TASK-018, 2026-11-02

PD-004 originalmente pendente exigia definir faixas/preços/prazos sem inventar
uma tabela do professor. Sob a delegação explícita posterior de decisões e
continuidade pelo responsável, a estratégia de implementação é tabela mantida
exclusivamente por ADMIN, inicialmente vazia. Nenhuma faixa, preço ou prazo de
uso real é aprovado por esta decisão. Antes de operação, o responsável cadastra
esses dados; sem configuração, o resultado é não atendido e o pedido é negado.
Fixtures usam valores sintéticos isolados, nunca seed automático de operação.
Isso resolve o contrato do módulo sem afirmar aprovação de tabela inexistente.

Faixas inclusivas de CEP são normalizadas para oito dígitos, agrupadas por região
informada, sem exigência de UF ou cobertura nacional. Não admitir interseção
ambígua entre faixas. Valores em centavos inteiros; faixa atendida exige preço
positivo e prazo inteiro informado em dias. Não acrescentar preparação,
calendário de feriados ou retirada. Alteração tem versão e auditoria atômica.

Pedido usa os produtos/descontos congelados no checkout; frete e endereço completo
possuem revisão canônica que precisa ser aceita. Trocar endereço recalcula só o
frete e mantém o prazo original; não atendimento conserva a reserva até vencer.
Transferência da reserva, consumo de cupom, criação das unidades/snapshots,
cobrança inicial e limpeza do carrinho são uma transação. Não há baixa física
nem confirmação financeira nesta etapa. Pix começa com 30 minutos completos e
boleto com dois dias completos na criação do pedido. Simulador e reconciliação
de pagamento/expiração são TASK-019; logística e cancelamento são tarefas futuras.
O adaptador de limite consulta pedidos reais dentro da transação; fixtures não
substituem esse adaptador no produto. Nenhuma chamada externa na transação.

## Carrinho nos clientes — TASK-017, 2026-11-02

Protocolo local schema 1 em garimpo.guestcart.v1 contém somente IDs de edição/
oferta/entrada, unidades locais, revisão e intenções de mescla por cartId.
Unidades locais recebem índices monotônicos para reconhecer quais já foram
mescladas, preservando adições posteriores mesmo com respostas fora de ordem.
Intenção mantém corpo/version/key originais; resposta perdida repete a mesma
operação e somente confirmação do servidor consome as unidades correspondentes.
Tags locais são marcadores não secretos de unicidade, nunca credenciais ou hold.
Dados corrompidos/armazenamento indisponível geram erro e opção de limpeza
explícita; não fingir persistência. Limites locais: 100 linhas/1000 unidades,
até 20 intenções e 256KiB de JSON, parâmetros de recurso, sem atribuir ao PDF.

Web usa localStorage e coordenação navigator.locks quando disponível; app usa
AsyncStorage 2.2.0, versão indicada pelo Expo 57.0.31 bundledNativeModules e
metadados do pacote conferidos no npm em 2026-11-02. Token/senha/e-mail não entram
nesse armazenamento; SecureStore existente não é alterado. Administração continua
somente web e conta interna não usa carrinho de compra.

Comandos do novo carrinho enviam X-Garimpo-Account com o ID da conta que iniciou
a ação e mantêm esse contexto/Idempotency-Key no refresh/retry. Guarda opcional
do servidor nega divergência, sem conceder autoridade nem substituir token/CSRF.
Isso protege troca de conta durante uma requisição pendente. Chamadas anteriores
permanecem compatíveis; nenhuma chave HTTP/env habilita fixture de pedidos.

Timer é um só por checkout, derivado de expiresAt e serverTime; é informativo,
o servidor decide validade. Sem POST repetitivo para renovar prazo, reserva local,
pagamento/frete/pedido antecipado ou alegação de execução nativa/leitor.

## Carrinho e reserva — TASK-016, 2026-11-02

Sob delegação operacional já registrada: até 100 linhas e 1000 unidades por
carrinho/comando, JSON 32KiB, para limitar materialização de snapshots; não são
regras do PDF nem metas de desempenho. Preços unitários são centavos Int32;
somas e rateio exatos preservam números seguros de JavaScript. Identidades de
unidade derivadas de linha/índice são estáveis e congeladas com o checkout.

Revisão de preço é SHA-256 de dados canônicos do carrinho/preços/promoções/cupom,
recalculada pelo servidor. Confirmar revisão não dispensa nova conferência de
saldo, prazo, conta, limites e cupom dentro da transação. Idempotência usa chave
do cliente e hash do payload por ator; repetir checkout recupera o mesmo recurso,
sem prolongar a validade. Cart/Checkout têm versões independentes.

Coordenação SERIALIZABLE existente: identidade do cliente, agregado e edições/
ofertas ordenadas, depois cupom. Reserva não reduz físico; disponibilidade para
reservar desconta reservas ACTIVE ainda válidas. Jobs e comandos liberam os
mesmos registros uma vez. Cupom conta RESERVED ainda válido e CONSUMED; liberação
não cria nova utilização. Pedido/consumo definitivo continuam 018/019.

A coordenação da identidade faz uma escrita MVCC sem mudança de valor em
User.updatedAt, antes de ler o agregado. Apenas SELECT FOR UPDATE não atualiza o
snapshot SERIALIZABLE de quem já esperava: a escrita força reinício de uma
transação com visão anterior, antes de disputar a chave única de checkout.
Não modifica timestamp, credencial, papel ou dado do cliente; comandos e job
usam a mesma ordem. Concorrência real deve comprovar a retomada correta.

Porta de pedidos pendentes retorna KNOWN/count ou UNAVAILABLE; ausente nega
nova reserva com 503, não assume zero. Apenas testes podem injetar cenário
conhecido até o adaptador real de 018/023. Endereço próprio pode atualizar
metadado/version sem alterar preços/prazo; frete não é cotado nesta tarefa.
Contratos e semântica de snapshots permanecem ADR-003/004.

## Parâmetros de descontos — TASK-014, 2026-11-02

Decisão técnica do agente sob a delegação explícita de execução contínua, sem
atribuir novas respostas ao PDF: PERCENT usa basis points inteiros (100 = 1%,
intervalo 1–10000) e FIXED usa centavos inteiros. Desconto percentual usa divisão
inteira exata com BigInt, descartando a fração menor que um centavo. Promoção
reduz o preço-base unitário até zero; sobreposição escolhe o menor preço e, em
empate, o ID estável. A presença da promoção aplicável escolhida identifica item
promocional, inclusive se uma fração truncada não reduzir aquele centavo.

CouponTarget identifica exatamente um OFFER (produto/oferta), EDITION ou GENRE.
Múltiplos alvos combinam por união: basta corresponder a qualquer alvo; vazio
significa todas as ofertas. Esta política documenta a combinação em aberto do
modelo, mantendo os tipos de restrição já confirmados. allowPromotional controla
se uma unidade com promoção pode participar do cupom. Mínimo/desconto usam só
esse conjunto após promoção, sem frete. Fixo é limitado ao subtotal elegível;
rateio por maiores restos/ID estável já ratificado preserva soma exata.

Períodos são UTC, início inclusivo/fim exclusivo, com fim posterior ao início.
Código de cupom é normalizado para maiúsculas e único; código permanece estável
na edição. Controle otimista usa version. Limites de uso cadastrados não são
contadores: ledger/reserva real continua TASK-016/018. Até integrar o ledger, a
consulta administrativa informa estado NOT_INTEGRATED em vez de inventar usos
zero. Preço público e filtros usam a mesma promoção efetiva; administração do
catálogo continua editando preço-base. Nenhuma cobrança, uso ou reserva é feita
por cadastrar/consultar desconto.

## Deliberação residual PD-006 — 2026-11-01

Origem posterior: o responsável recebeu proposta concreta com os três vocabulários e pediu seguir sem novas permissões, delegando decisões rotineiras; reiterou autonomia para executar o trabalho enquanto ausente. O agente adotou o pacote abaixo sob essa delegação, sem atribuir aprovação nominal dos valores ao professor nem novas respostas ao PDF. Registro inicial na TASK-007, consolidação prévia ao código da TASK-008.

Goldmine, da melhor para a pior conservação: M (Mint), NM (Near Mint), VG+ (Very Good Plus), VG (Very Good), G+ (Good Plus), G (Good), F (Fair), P (Poor). Disco e capa recebem valores independentes em cada usado. Não converter ausência de informação em uma nota. Referência do vocabulário: https://www.goldminemag.com/columns/vinyl-value/vinyl-finds-grading-vinyl-part-one.

Avaliações: estrelas inteiras de 1 a 5. Promoções: percentual ou valor fixo em centavos de real, sem somar promoções concorrentes e mantendo as regras já definidas de menor preço/acumulação com cupom. Adotar vocabulário não implementa antecipadamente TASK-013/014; suas regras de elegibilidade, períodos e cálculo seguem os requisitos existentes.

Parâmetros técnicos de mídia deste incremento, sob a mesma delegação: 5 MB significa 5.000.000 de bytes; JPEG/PNG/WebP devem ser realmente decodificados e regravados, sem confiar no nome ou MIME declarado. Limitar decodificação a 40 milhões de pixels e dimensão individual de 10.000 pixels para conter consumo de memória, sem apresentar esses limites operacionais como regra do PDF. Arquivo normalizado também respeita 5 MB. Chave imutável gerada pelo servidor, hash dos bytes persistidos, raiz pública dedicada e nenhuma montagem de evidência privada. Não coletar órfãos antes da política de retenção/backup da TASK-030.

Rascunho usa active=false; publicação exige mínimos no servidor e imagem da própria entidade. Ofertas nascem com estoque físico inicial permitido por API-017.04 (NEW inteiro não negativo, USED 0/1); alterações posteriores de saldo e livro de estoque pertencem à TASK-009. Valores monetários e filtros minPrice/maxPrice usam centavos inteiros. Preço/condições/disponibilidade devem selecionar a mesma oferta, evitando combinar preço de um exemplar com conservação de outro. Resumo de busca reflete ofertas correspondentes aos filtros; detalhe sem filtros mantém a visão da edição inteira.

Fonte final: PDF, 14 rodadas. Valores decididos não voltam para entrevista; apenas escolhas ausentes são pendências.

## Valores confirmados

| Tema | Valor/regra | Fonte |
| --- | --- | --- |
| Checkout | 15 minutos, único por cliente; carrinho não reserva | R01-P4; R06-P1 |
| Pedidos | Pix 30 minutos; boleto 2 dias; até 3 pendentes | R01-P5; R07-P2; R08-P2 |
| Tokens | Confirmação inicial 24h; reset 30min/uso único e revogação global | R11-P6 |
| Pós-venda | 7 dias após entrega; postagem 7 dias; espera 30 dias após conferência; oferta 48h completas | R03-P3; R08-P5; R05-P3 |
| Imagens | JPEG/PNG/WebP; 5 MB; 10/edição, 8/usado, 5+5/atendimento | R11-P5; R12-P6 |
| Estoque baixo | Novos: limiar por edição; usados: zero disponíveis; só painel | R10-P5 |
| Promoções | Menor preço entre sobrepostas; cupom acumula quando configurado | R04-P5; R03-P7 |
| Alertas | NEW/USED/ANY; encerra depois de entrega bem-sucedida | R05-P6; R12-P4 |
| Backup | Diário; demais parâmetros pendentes | R11-P7 |

## Pendências

| ID | Decisão necessária | Tarefas afetadas |
| --- | --- | --- |
| PD-001 | PARCIALMENTE RESOLVIDA: responsável fixou em 2026-10-25 entrega parcial de pelo menos 19/37 TASKs DONE em 2026-10-26 às 13:20, America/Sao_Paulo. Rubrica e prazo dos 100% seguem pendentes; instrução posterior e divergência histórica registradas no pacote TASK-001 abaixo. | TASK-036, TASK-037 |
| PD-002 | Ambiente e plataformas: Confirmar plataforma mobile, navegadores, publicação/local, infraestrutura e transporte. Android exclusivo, LAN e HTTP não são fatos aprovados. | TASK-001, TASK-002, TASK-033 |
| PD-003 | Exigências adicionais: Confirmar rubrica e eventuais exigências formais de acessibilidade/implantação; preservar critérios de projeto já definidos. | TASK-033, TASK-037 |
| PD-004 | Tabela de frete: Definir faixas de CEP/região, cobertura, preços e prazos; não inventar valores ou cobertura nacional obrigatória. | TASK-018 |
| PD-005 | Parâmetros técnicos: Ratificar stack herdada, versões, sessão, hash, proteção das mensagens, armazenamento, prazo de links de alteração/reativação e estratégia transacional. Reset 30min, confirmação inicial 24h e limites de imagens já decididos. | TASK-001 e módulos dependentes |
| PD-006 | RESOLVIDA por decisão técnica delegada em 2026-11-01, no registro acima: Goldmine M/NM/VG+/VG/G+/G/F/P separada; estrelas inteiras 1–5; promoções percentuais/fixas em centavos. Preservar as demais regras já definidas, sem atribuir enumerações ao PDF. | TASK-008, TASK-013, TASK-014 |
| PD-007 | Volume e metas de desempenho: Definir tamanhos de dados, usuários simultâneos, metas e método de aferição. Números da versão anterior não são requisitos. | TASK-034 |
| PD-008 | Retenção e backup: Definir retenção de dados pessoais/anonimização e condições após retenção; definir retenção de backups, frequência dos testes e destino. | TASK-022, TASK-030, TASK-035 |
| PD-009 | Devoluções integrais em solicitações parciais sucessivas: PDF distingue devolução integral/parcial, mas não explicita quando devolver frete se várias solicitações parciais somarem o pedido inteiro. Definir antes desse caso; não presumir reembolso cumulativo de frete. | TASK-026 |

Cada decisão futura registra valor, origem, responsável e data. Proposta técnica pode ser apresentada na tarefa autorizada, sem transformar escolha de produto em decisão implícita. Alterações arquiteturais exigem ADR atualizado; não alegar aprovação do professor.

## TASK-001 — pacote de decisões para iniciar a implementação

### Origem, autorização e prazo

Em 2026-10-25, o responsável informou entrega em **2026-10-26 às 13:20, America/Sao_Paulo**, exigindo **50% das 37 TASKs**, e disponibilidade para trabalhar somente no domingo. São necessárias pelo menos **19 TASKs DONE** para cumprir essa fração. Não há horário de encerramento do trabalho de domingo confirmado. A foto e o esclarecimento fixam essa entrega parcial; não definem rubrica adicional nem prazo de conclusão dos 100%.

Após a pergunta explícita sobre sair da etapa documental e executar continuamente o backlog em ordem, respeitando bloqueios e checkpoints, o responsável respondeu **“autorizo”**. Essa instrução posterior substitui a restrição temporal de somente documentação para o trabalho agora autorizado; não altera requisitos do PDF, não elimina DoR/DoD, testes manuais ou Scope Guard e não aprova automaticamente propostas técnicas. O registro anterior permanece como histórico. Nenhuma aprovação acadêmica é presumida.

PD-001: **PARCIALMENTE RESOLVIDA** para a data/meta da entrega parcial acima; rubrica e prazo de entrega integral continuam pendentes, sem impedir fundação independente. Este registro é a fonte posterior à elicitação, não uma alteração do PDF.

### Estado da deliberação

**PACOTE RATIFICADO em 2026-10-25 pelo responsável: “Aprovo o pacote e conferi DOC-001/002”.** Este pacote reúne as seis decisões necessárias à fundação. A autorização de execução já existe; a decisão pendente aqui é sobre as escolhas técnicas e os alvos de validação, não uma nova autorização genérica de trabalho. A resposta explícita também confirma a conferência documental manual DOC-001/002. Essa evidência se limita a documentos e não aprova testes futuros de software.

### ADR-001 / PD-002 e PD-005 — stack e ambiente propostos

| Item | Proposta | Limite/validação |
| --- | --- | --- |
| Organização | Monólito modular TypeScript, npm workspaces, API/web/mobile e contratos compartilhados | Regras no servidor; administração só web; nenhuma divisão em serviços distribuídos |
| Runtime | Node 24 LTS; alvo de patch 24.22.1, conferido na fonte oficial; npm 11 | Não atualizar a instalação global nesta TASK; disponibilidade e instalação isolada verificadas na TASK-002 |
| API | Express 5, TypeScript 5.x, validação de entrada com Zod | Express exige Node >=18; versões exatas e lockfile serão conferidos no bootstrap, sem usar latest em builds reproduzíveis |
| Web | React 19.2.3, Vite 8, TypeScript | Vite documenta Node >=20.19 ou >=22.12; navegador de validação inicial Chrome e Edge atuais, teclado/foco/rótulos e contraste |
| Mobile | React Native/Expo SDK 57, React 19.2.3 e RN 0.86 conforme matriz oficial | Compatibilidade Android e iOS preservada; validação nativa depende de aparelho/emulador disponível, não considerar Expo web substituto de teste nativo |
| Persistência | PostgreSQL 17 e Prisma ORM 7, driver PostgreSQL correspondente | Escolha de versão explícita, não alegação de que seja a última; documentação de Prisma 7 admite Node 24 e PostgreSQL 17; patch/adapter/geração reais serão validados antes de migration |
| Qualidade | TypeScript, ESLint, Vitest, testes de API e banco real de teste; fluxos web com Playwright quando houver interface | Comandos reais serão criados/verificados na TASK-002. Responsável aciona e acompanha roteiro manual; suites automáticas não o substituem |
| Desenvolvimento/testes | Windows com Ubuntu WSL2; serviços locais e banco isolado de teste | Não fixa publicação final ou transporte inseguro; não criar banco nesta TASK |
| Transporte | HTTPS para qualquer acesso de web/mobile à API, incluindo acesso por outro dispositivo; certificados confiáveis no cliente | Sem exceção geral de HTTP; comandos de teste internos podem usar canal direto/loopback sem expor credenciais na rede. Integração TLS e dispositivo devem ser verificadas antes de aceitar fluxo do cliente |

Alternativa avaliada: trocar framework ou adotar microsserviços agora acrescenta decisões e integração sem requisito que o justifique. Manter o desenho herdado, sujeito à compatibilidade real, reduz essa incerteza. Nenhuma versão acima foi instalada nem compatibilidade de build executada nesta tarefa documental.

PD-002 ficará resolvida para alvos de desenvolvimento/validação somente após ratificação e identificação do dispositivo móvel disponível. Publicação em loja/hosting e ambiente final podem permanecer pendentes até a tarefa correspondente; não afirmar Android exclusivo nem dispensa de iOS por indisponibilidade de aparelho.

### ADR-002 — adaptadores e canais propostos

Simulador local de pagamento substituível com aprovação, recusa, pendência, vencimento, aprovação tardia e falha de estorno, sem cobrança real. Frete usa tabela definida em PD-004; logística é manual; mensagens vão para caixa local protegida de teste. Cenários financeiros são controles técnicos locais restritos ao ambiente de teste, separados da API comercial; não criar endpoint financeiro público para trocar resultado. Falha de mensagem mantém tentativa pendente sem impedir negócio. Não exige provedor externo de e-mail ou gateway real.

### ADR-003 — transações e concorrência propostas

PostgreSQL com transações **SERIALIZABLE** nos comandos críticos. A aplicação repete a transação inteira até três tentativas no total para erro de serialização/deadlock; esgotamento retorna conflito recuperável, sem sucesso fictício. Ordem de coordenação: identidade/conta, agregado comercial, ofertas por ID estável e cupom. Usar constraints/atualizações condicionais e bloqueio quando necessário; isolamento sozinho não substitui validação dos saldos/estados. Nenhuma chamada de rede externa dentro da transação.

Idempotência registra chave, ator/escopo, hash do payload e referência de resposta na mesma transação do efeito. Mesma chave/payload retorna efeito anterior; payload divergente é conflito. Prazos são UTC no servidor, revalidados a cada comando. Relógio injetável somente no processo de teste. Proteger um checkout ativo, três pedidos pendentes, saldo não negativo, último ADMIN e uma solicitação ativa por unidade. Testes usam conexões independentes e banco real separado; não marcar aprovação com mocks sequenciais.

### ADR-004 — dinheiro, eventos e processamento propostos

Centavos inteiros; percentuais em unidade inteira explicitada no contrato. Rateio proporcional por maiores restos: calcular quotas sem ponto flutuante, distribuir centavos restantes por resto decrescente e desempatar por identificador estável da unidade comercial congelado no pedido. Soma do rateio deve ser exatamente o desconto autorizado e nenhum item receber desconto superior ao valor elegível. UTC para persistência; filtros de data do relatório interpretados em America/Sao_Paulo com intervalo início inclusivo/fim exclusivo e conversão explícita para UTC; registrar asOf.

Outbox gravada junto do negócio, consumidor com tentativas persistidas, deduplicação e processamento recuperável após reinício. Cada evento financeiro é imutável e datado pelo próprio acontecimento; estorno tardio sem venda permanece separado. Snapshot do pedido/unidade preserva preço, desconto, endereço, conservação e gênero principal. O protocolo de repetição será validado contra falhas reais nas tarefas responsáveis.

### ADR-005 — segurança e parâmetros de acesso propostos

| Tema | Proposta técnica |
| --- | --- |
| Senha | scrypt assíncrono do Node: N=131072, r=8, p=1, salt aleatório de 16 bytes e derivação de 64 bytes; maxmem=256 MiB; formato versionado e comparação em tempo constante. Aferir custo no ambiente antes do aceite da autenticação; nunca reduzir silenciosamente para passar teste |
| Sessão | Credenciais opacas aleatórias de 32 bytes; acesso 15min e renovação rotativa até 7 dias desde login. Guardar somente hash no banco; conferir revogação/estado da conta em cada acesso. Rotação invalida credencial anterior e reutilização invalida a sessão correspondente |
| Web | Cookies HttpOnly/Secure/SameSite=Lax com escopo definido; validar Origin nas mutações e proteção CSRF; não guardar credenciais em localStorage |
| Mobile | Credencial de renovação em Expo SecureStore e acesso em memória; autenticação por cabeçalho próprio, sem registrar tokens em logs |
| Links | Tokens por propósito com SHA-256 no banco; confirmação inicial 24h e reset 30min preservados do PDF. Proposta para mudança de e-mail: 24h; reativação: 24h, uso único. Alteração confirma novo e-mail antes de substituir antigo; reativação não remove bloqueio |
| Caixa local de mensagens | Canal técnico restrito ao ambiente de teste, segregado de USER/ADMIN/OPERATOR e protegido por segredo técnico fora do Git. Corpo de mensagem sensível não entra em logs gerais; nenhuma caixa pública para reset/confirmar terceiros |
| Bootstrap ADMIN | Comando local explícito, senha recebida por entrada protegida/ambiente, sem senha padrão, com trilha de auditoria e sem provisionar usuário privilegiado em todo startup |
| Proteções | Limites configuráveis de tentativas em autenticação/reset; resposta pública genérica, sem expor existência da conta; revogação global após reset. Valores e testes de limitação precisam constar do incremento de autenticação |

São parâmetros técnicos propostos, não regras atribuídas ao professor/PDF. PD-005 permanece pendente de ratificação deste pacote e da conferência de versões reais na estrutura. Não instalar dependência nem implementar segurança nesta TASK.

### ADR-006 — arquivos e fundação do backup propostas

Armazenamento por chaves internas geradas no servidor, raiz pública separada de raiz privada fora de arquivos estáticos. Evidência privada sempre passa por autorização de dono/equipe, inclusive download. Inspecionar bytes, tipo e tamanho, limitar decodificação e não confiar no nome recebido. Preservar limites já confirmados: JPEG/PNG/WebP, 5 MB, 10/edição, 8/usado, 5 cliente + 5 equipe por atendimento.

Proposta para consistência de backup diário: arquivos persistidos imutavelmente por chave; manifesto com hash/tamanho/referência e snapshot consistente de banco. Coordenar coleta de órfãos com conjuntos retidos; cópia concorrente simples não comprova consistência. Restauração sempre em banco/diretórios separados. Retenção, destino, frequência de testes e anonimização **continuam PD-008**, a resolver antes das TASK-022/030/035 e sem bloquear bootstrap independente. Nenhum backup nem infraestrutura é criado agora.

### Evidências consultadas em 2026-10-25

- Windows: `node --version` → v24.13.1; `npm --version` → 11.8.0; `git --version` → 2.50.0.windows.1; `psql --version` → PostgreSQL 17.9; Docker CLI 29.4.0. Versão de cliente não comprova serviço PostgreSQL acessível.
- `wsl --status` e `wsl --list --verbose`: Ubuntu padrão, WSL2, distribuição inicialmente parada. A sandbox negou consulta; repetição autorizada fora dela confirmou a instalação. Não registrar essa negação como ausência de WSL.
- Consulta no Ubuntu WSL: Ubuntu 24.04.4 LTS, kernel WSL2 6.6.87.2, usuário brasi, Git 2.43.0. `node --version` e `psql --version` falharam por comandos Linux ausentes; npm 11.8.0 e Docker resolvem para executáveis do Windows via `/mnt/c`. Essa mistura não comprova ambiente Linux pronto: instalar/configurar runtime nativo somente na TASK-002 autorizada e prover banco somente na tarefa que permita fazê-lo. A distribuição foi iniciada para inspeção, sem instalação ou alteração de configuração.
- `docker info --format '{{.ServerVersion}}'`: falhou por ausência do pipe dockerDesktopLinuxEngine; Docker daemon não disponível na consulta. Não instalado/reconfigurado nesta tarefa.
- Pasta sem `.git`; branch/commit N/A. Nenhuma inicialização até TASK-002 autorizada.
- [Node 24 LTS e patch consultado](https://nodejs.org/en/blog/release/v24.22.1), [Vite: requisitos](https://vite.dev/guide/), [Express: requisitos](https://expressjs.com/en/starter/installing/), [Expo: matriz SDK/RN/React/Node](https://docs.expo.dev/versions/latest/).
- [Prisma 7: runtime](https://www.prisma.io/docs/orm/v7/reference/system-requirements), [Prisma 7: bancos](https://www.prisma.io/docs/orm/v7/reference/supported-databases), [PostgreSQL 17: isolamento e necessidade de repetição](https://www.postgresql.org/docs/17/transaction-iso.html).
- [Node 24: scrypt e API crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html), [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/).

### Conferência documental manual — aprovada pelo responsável

DOC-001: responsável lê as seis propostas acima, confere distinção entre PDF/proposta/pendência e informa aprovação ou ajustes, com nome/data no registro da TASK. Resultado obtido/evidência: **APROVADO — responsável confirmou “Aprovo o pacote e conferi DOC-001/002” em 2026-10-25**.

DOC-002: responsável confere que alterações se limitam aos ADRs, parâmetros, trechos permitidos do README e TASKS; IDs/requisitos originais preservados, sem instalação/código/banco/migration. Resultado obtido/evidência: **APROVADO — responsável confirmou “Aprovo o pacote e conferi DOC-001/002” em 2026-10-25**.

Gate documental manual aprovado pela resposta explícita; conferência estrutural do agente não substitui essa evidência humana. TASK-002 poderá ser promovida após fechamento da DoD de TASK-001. Testes de aplicação continuam NÃO EXECUTADOS.

### Resolução e limites após ratificação

Responsável: Bruno dos Santos Brasil Silva, identificado no README e nesta conversa. Data: 2026-10-25. Evidência: resposta explícita ao pacote “Aprovo o pacote e conferi DOC-001/002”; aparelho disponível: Android. PD-002 resolvida para desenvolvimento Windows/Ubuntu WSL2 e validação inicial Chrome/Edge/Android; preservar compatibilidade iOS e registrar sua validação como ainda não executada. Publicação final continua pendência sem impedir estrutura local segura. PD-005 resolvida quanto às escolhas e parâmetros técnicos acima; disponibilidade dos patches/compatibilidade executável são gates de TASK-002, não resultados presumidos. PD-004/006/007/008/009 continuam nos trechos dependentes.

### Fronteira do simulador financeiro local

Detalhamento técnico sob a autorização contínua posterior de 2026-11-01/02, compatível com ADR-002/003/004: o simulador substituível persiste intenção, recibo e aplicação separados. A porta não recebe transação de negócio; o adaptador local escreve seu resultado por referência idempotente, e somente depois a aplicação confirma estoque/pedido ou cria obrigação de estorno. Não inserir rede em callbacks transacionais repetidos. Recibo aprovado aplicado após o prazo original não readquire saldo nem cria/reativa pedido. PENDING requer evento técnico real de resolução; não há controle de relógio em endpoint ou cenário que finja passagem de tempo.

Não armazenar dados de cartão real. A aprovação de um cenário não dispensa conta, e-mail inicial, endereço próprio, frete aceito, saldo reservado e versão. Falha de aplicação conserva recibo retomável; falha de estorno conserva obrigação e tentativas, com repetição por sistema/ADMIN somente para automático. Mensagens comerciais usam a caixa local criptografada já ratificada e falha de entrega não desfaz venda. Eventos de restituição sem venda permanecem separados da receita. Este detalhamento não modifica o PDF nem aprova gateway/SMTP/infraestrutura de produção.

### Datas efetivas e consulta de pedidos

Precisão técnica sob a delegação de execução contínua, compatível com RN-015 e
ADRs ratificados: filtros diários e apresentação usam America/Sao_Paulo; instantes
persistidos/transmitidos usam UTC com milissegundos. A entrada datetime-local
de logística é interpretada no fuso do aparelho, explicitado ao operador, e
convertida para UTC. Não assumir offset fixo para dias históricos com horário
de verão. Data efetiva é distinta da data de registro; estimativa de frete nunca
preenche entrega. Um envio original por pedido, com rastreio imutável e entrega
efetiva registrada uma vez; demais espécies pertencem ao pós-venda futuro.

Listas usam paginação limitada, filtros validados e escopo próprio/equipe.
Pagamentos e estornos no detalhe têm páginas independentes de 20 itens; prazo
original e obrigações não são escondidos por troca de aparelho. Diário local
continua indispensável à retomada de comando cuja resposta é desconhecida;
pedidos já reconhecidos são consultados por GET, sem replay de criação.
