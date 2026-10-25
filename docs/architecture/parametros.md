# Parâmetros e decisões pendentes

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
| PD-006 | Vocabulários residuais: Escala numérica de avaliação, enumeração Goldmine e tipos de desconto das promoções não especificados. Sobreposição, acumulação, alerta NEW/USED/ANY e estoque baixo estão resolvidos e não devem ser reabertos. | TASK-008, TASK-013, TASK-014 |
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
