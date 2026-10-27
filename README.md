# Garimpo — planejamento de software

Para avaliação da entrega e navegação pelo código, consulte [LEIA-ME-ENTREGA.md](LEIA-ME-ENTREGA.md), [TASKS.md](TASKS.md) e o [índice de evidências](EVIDENCIAS/INDICE.md). Este README consolida a especificação; o estado da execução fica em TASKS.md.

## 1 Identificação e fonte de verdade

Registro histórico da etapa de planejamento: versão planejada 1.0, PLANEJAMENTO RECONCILIADO COM A ELICITAÇÃO FINAL; decisões técnicas então propostas e pendências identificadas. Nenhuma implementação havia sido iniciada naquela etapa. Decisões posteriores e estado da execução estão registrados nos ADRs e em TASKS.md.

Dupla: Ana Carolina Corrêa e Bruno dos Santos Brasil Silva.

Loja online de discos de vinil novos, usados e edições de colecionador, com estoque próprio. Resolve a descoberta e compra de edições/exemplares, incluindo a disputa por usados únicos, e acompanha a operação e o pós-venda. Web e aplicativo compartilham a API REST.

O responsável confirmou nesta conversa que **Garimpo-Perguntas-e-Respostas-Elicitacao.pdf** é a versão final. As 14 rodadas/98 respostas prevalecem sobre divergências do pacote anterior. Respostas posteriores dentro do PDF refinam as anteriores. A menção antiga a sete rodadas não constitui autorização para contrariar essa fonte. A revisão documental atual foi autorizada; isso não marca tarefas de implementação como concluídas nem aprova decisões que o PDF deixou em aberto.

Fontes: [PDF original das rodadas](docs/sources/Garimpo-Perguntas-e-Respostas-Elicitacao.pdf), [transcrição das 98 respostas](docs/sources/elicitacao-final.md), [matriz de conciliação](docs/architecture/conciliacao.md). O Word mencionado no pacote anterior não foi fornecido nesta revisão; tecnologias atribuídas apenas a ele são propostas herdadas para ratificação.

Documentos: [AGENTS](AGENTS.md), [TASKS](TASKS.md), [arquitetura](docs/architecture/architecture.md), [dados](docs/architecture/data-model.md), [API](docs/architecture/api.md), [testes](docs/architecture/testing.md), [parâmetros](docs/architecture/parametros.md), [validação documental](VALIDACAO.md).

Fluxos de trabalho prontos para uso: [prompts de validação, execução, revisão e continuidade](docs/prompts/README.md). Criar esses textos não executa tarefas nem registra aprovação acadêmica.

**Etapa autorizada: desenvolvimento incremental**, por instrução explícita do responsável em 2026-10-25, substituindo a restrição anterior de somente documentação. Execução contínua respeita dependências, Scope Guard, checkpoints e testes manuais. Origem e decisões técnicas ratificadas: [parâmetros](docs/architecture/parametros.md). [Diagramas renderizados para consulta local](docs/diagrams/index.html). A aprovação humana/acadêmica prevista no quadro ainda não foi registrada; o quadro não especifica quem aprova ou o formato de entrega.

## 2 Escopo

Todos os recursos finais permanecem no escopo com implementação incremental: contas e confirmação de e-mail, catálogo/estoque, carrinho sem reserva, checkout com reserva, pedidos, simulador de pagamentos, frete, desejos, avaliações, notificações, trocas/devoluções, relatórios e backup. Clientes usam web e mobile; equipe administra pela web. Contas internas ADMIN/OPERATOR são separadas das contas de compra. Inclui encerramento/reativação de conta, evidências privadas e gestão de contas internas.

## 3 Fora de escopo e itens ainda indefinidos

- Marketplace/estoque de terceiros, cobrança financeira real e obrigação de gateway externo na primeira versão.
- Upload/armazenamento de áudio; usar links por faixa.
- Compra sem conta, retirada em loja, regra permanente de frete grátis e várias remessas para envio original do mesmo pedido.
- Funções administrativas no aplicativo mobile.
- Trocar por outra edição, cobrar diferença do substituto ou contabilizar troca como nova venda.

Plataforma mobile, publicação, volumes e retenção estão **pendentes**, não excluídos. Esta revisão não cria software nem material de apresentação.

## 4 Atores e permissões

| Ator | Objetivo e responsabilidades | Limites |
| --- | --- | --- |
| Visitante | Consultar catálogo, carrinho e frete; cadastrar-se | Não reserva nem compra sem autenticar |
| USER | Conta, compra e pós-venda próprios | Confirma e-mail antes do primeiro pedido; bloqueio impede login |
| OPERATOR | Catálogo, estoque, logística, atendimento, moderação; consulta clientes | Não corrige cliente, bloqueia conta, gere contas internas, configura frete/cupons ou autoriza estorno/exceção |
| ADMIN | Gestão completa, contas internas, configurações, relatórios e autorizações | Conta interna não compra; último ADMIN ativo protegido |
| Processos técnicos | Expiração, notificações, pagamentos simulados e backups | Aplicam mesmas invariantes e registram tentativas |

## 5 Requisitos funcionais

Prioridade MUST para os recursos da versão. Parâmetros pendentes bloqueiam somente o trecho dependente. IDs existentes foram preservados; RF-026 a RF-029 complementam capacidades antes ausentes.

### RF-001 Cadastrar conta

**Ator:** Visitante. **Prioridade:** MUST. **Pré-condição:** E-mail ainda não cadastrado.

**Descrição/resultado e critérios de aceitação:** Cadastro válido cria USER; e-mail duplicado falha; payload não promove papel; confirmação de e-mail é emitida.

**Regras:** RN-001, RN-002, RN-029, RN-032. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008. **Caso de uso:** UC-001. **Verificação:** TEST-001.

### RF-002 Autenticar e encerrar sessão

**Ator:** Cliente e equipe. **Prioridade:** MUST. **Pré-condição:** Conta ativa não bloqueada/encerrada.

**Descrição/resultado e critérios de aceitação:** Credenciais válidas autenticam no contexto correto; bloqueio/encerramento impedem login; logout revoga sessão; conta interna não compra.

**Regras:** RN-001, RN-028, RN-029, RN-032. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008. **Caso de uso:** UC-002. **Verificação:** TEST-002.

### RF-003 Recuperar senha

**Ator:** Titular. **Prioridade:** MUST. **Pré-condição:** Endereço de conta informado.

**Descrição/resultado e critérios de aceitação:** Reset válido em até 30 minutos altera senha uma vez e revoga todas as sessões; expirado/reutilizado falha.

**Regras:** RN-003, RN-032, RN-033. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011. **Caso de uso:** UC-003. **Verificação:** TEST-003.

### RF-004 Gerenciar perfil e endereços

**Ator:** Cliente; ADMIN nas correções autorizadas. **Prioridade:** MUST. **Pré-condição:** Conta própria ativa ou permissão ADMIN.

**Descrição/resultado e critérios de aceitação:** Somente titular edita normalmente; OPERATOR consulta sem editar; endereço histórico não muda; novo e-mail depende de confirmação.

**Regras:** RN-002, RN-032, RN-044. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008. **Caso de uso:** UC-004. **Verificação:** TEST-004.

### RF-005 Explorar pesquisar e filtrar

**Ator:** Visitante e cliente. **Prioridade:** MUST. **Pré-condição:** Catálogo publicado.

**Descrição/resultado e critérios de aceitação:** Busca cobre título, artistas de edição/faixa e faixas; década usa ano da edição; filtros se combinam; desconhecidos não viram anos inventados.

**Regras:** RN-004, RN-032, RN-036. **Qualidade:** RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008. **Caso de uso:** UC-005. **Verificação:** TEST-005.

### RF-006 Consultar edição e ofertas

**Ator:** Visitante e cliente. **Prioridade:** MUST. **Pré-condição:** Edição acessível.

**Descrição/resultado e critérios de aceitação:** Página agrupa novos/usados; usados exibem preço, fotos, Goldmine e descrição; prévia pertence à faixa e é opcional.

**Regras:** RN-004, RN-005, RN-026, RN-032, RN-036, RN-045. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010. **Caso de uso:** UC-006. **Verificação:** TEST-006.

### RF-007 Manter lista de desejos

**Ator:** Cliente. **Prioridade:** MUST. **Pré-condição:** Autenticação.

**Descrição/resultado e critérios de aceitação:** Adiciona/remove edição uma vez; não reserva nem ativa alerta implicitamente.

**Regras:** RN-032, RN-037. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008. **Caso de uso:** UC-007. **Verificação:** TEST-007.

### RF-008 Receber alertas de reposição

**Ator:** Cliente; processo de mensagens. **Prioridade:** MUST. **Pré-condição:** Inscrição ativa por edição e NEW/USED/ANY.

**Descrição/resultado e critérios de aceitação:** Retorno de disponibilidade notifica todos compatíveis sem reservar; sucesso encerra; falha mantém inscrição; duplicação não envia duas vezes a mesma ativação.

**Regras:** RN-024, RN-032, RN-037. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011. **Caso de uso:** UC-008. **Verificação:** TEST-008.

### RF-009 Avaliar compra verificada

**Ator:** Cliente. **Prioridade:** MUST. **Pré-condição:** Pedido entregue com unidade mantida da edição.

**Descrição/resultado e critérios de aceitação:** Uma avaliação por cliente/edição/pedido; troca não cria outra; devolução integral da edição oculta e impede nova; edição de ocultada aguarda moderação.

**Regras:** RN-025, RN-032. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008. **Caso de uso:** UC-009. **Verificação:** TEST-009.

### RF-010 Manter carrinho e iniciar reserva

**Ator:** Visitante no carrinho; cliente no checkout. **Prioridade:** MUST. **Pré-condição:** Catálogo disponível; checkout exige conta apta e menos de 3 pendentes.

**Descrição/resultado e critérios de aceitação:** Carrinho não reserva; mescla avisada ao login; checkout único de 15 minutos reserva todos ou nenhum; outra aba retoma mesmo prazo.

**Regras:** RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-028, RN-032, RN-035. **Qualidade:** RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011. **Caso de uso:** UC-010. **Verificação:** TEST-010.

### RF-011 Cotar e criar pedido

**Ator:** Visitante para frete; cliente para pedido. **Prioridade:** MUST. **Pré-condição:** Checkout válido, e-mail confirmado e endereço atendido para pedido.

**Descrição/resultado e critérios de aceitação:** Cotação por CEP inclui cobertura; congela produtos/descontos no checkout; cria pedido Pix/boleto com novo prazo próprio; snapshots e cupom não se perdem.

**Regras:** RN-002, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-013, RN-014, RN-016, RN-017, RN-018, RN-032, RN-033. **Qualidade:** RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011. **Caso de uso:** UC-011. **Verificação:** TEST-011.

### RF-012 Simular pagamentos

**Ator:** Cliente e simulador. **Prioridade:** MUST. **Pré-condição:** Checkout para cartão; cobrança ativa para Pix/boleto.

**Descrição/resultado e critérios de aceitação:** Recusa de cartão não cria pedido; Pix 30 min/boleto 2 dias; tardio estorna sem reativar; cobrança substituída nunca quita; falha de estorno permanece visível.

**Regras:** RN-010, RN-011, RN-012, RN-013, RN-017, RN-028, RN-032, RN-033, RN-039, RN-041. **Qualidade:** RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011. **Caso de uso:** UC-012. **Verificação:** TEST-012.

### RF-013 Acompanhar pedidos

**Ator:** Cliente. **Prioridade:** MUST. **Pré-condição:** Conta ativa e pedido próprio.

**Descrição/resultado e critérios de aceitação:** Exibe em separação, separado, envio, entrega, cobranças/estornos e rastreio manual; datas reais registradas, não estimadas.

**Regras:** RN-015, RN-032, RN-033. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008. **Caso de uso:** UC-013. **Verificação:** TEST-013.

### RF-014 Cancelar pedidos e unidades indisponíveis

**Ator:** Cliente; equipe para indisponibilidade. **Prioridade:** MUST. **Pré-condição:** Pedido pendente/pago antes de em separação para cancelamento direto.

**Descrição/resultado e critérios de aceitação:** Cancelamento permitido libera estoque/cupom uma vez; pago estorna; indisponibilidade parcial preserva restantes e vencimento; parcial não recupera cupom/frete.

**Regras:** RN-011, RN-017, RN-019, RN-032, RN-039, RN-041. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008. **Caso de uso:** UC-014. **Verificação:** TEST-014.

### RF-015 Processar devoluções

**Ator:** Cliente; ADMIN/OPERATOR. **Prioridade:** MUST. **Pré-condição:** Unidades elegíveis na janela ou devolução antes de envio.

**Descrição/resultado e critérios de aceitação:** Parcial estorna líquido; integral inclui frete; postagem em 7 dias; exceção só ADMIN; estorno pós-venda só ADMIN; evidências privadas; rejeitado não volta ao estoque.

**Regras:** RN-018, RN-019, RN-020, RN-021, RN-028, RN-032, RN-034, RN-040, RN-041, RN-045. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010, RNF-011. **Caso de uso:** UC-015. **Verificação:** TEST-015.

### RF-016 Processar trocas

**Ator:** Cliente; ADMIN/OPERATOR. **Prioridade:** MUST. **Pré-condição:** Unidades elegíveis e mesma edição para substituto.

**Descrição/resultado e critérios de aceitação:** Espera 30 dias após conferência, oferta 48h completas; aceite necessário; envio após inspeção; falha/expiração libera reserva; conversão não autoriza estorno; substituto inicia nova janela.

**Regras:** RN-020, RN-022, RN-023, RN-028, RN-032, RN-034, RN-035, RN-040, RN-041, RN-045. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010, RNF-011. **Caso de uso:** UC-016. **Verificação:** TEST-016.

### RF-017 Administrar catálogo e imagens

**Ator:** ADMIN/OPERATOR. **Prioridade:** MUST. **Pré-condição:** Conta interna ativa.

**Descrição/resultado e critérios de aceitação:** Publicação valida campos/fotos mínimos; suporta artistas por faixa e anos distintos; histórico impede exclusão; inativação preserva reservas existentes; limites de imagem aplicados.

**Regras:** RN-001, RN-004, RN-005, RN-026, RN-027, RN-032, RN-036, RN-045. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010. **Caso de uso:** UC-017. **Verificação:** TEST-017.

### RF-018 Controlar estoque

**Ator:** ADMIN/OPERATOR. **Prioridade:** MUST. **Pré-condição:** Oferta cadastrada.

**Descrição/resultado e critérios de aceitação:** Saldo nunca negativo; usado individual; ajuste não invade reservas; avaria resolve vínculo; limiar de novos por edição e zero usados alertam apenas no painel.

**Regras:** RN-001, RN-004, RN-006, RN-013, RN-019, RN-021, RN-022, RN-024, RN-027, RN-032, RN-035, RN-038, RN-039. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008. **Caso de uso:** UC-018. **Verificação:** TEST-018.

### RF-019 Administrar promoções e cupons

**Ator:** ADMIN. **Prioridade:** MUST. **Pré-condição:** Configuração válida.

**Descrição/resultado e critérios de aceitação:** Menor promoção vence; cupom pode acumular se autorizado; restrições por produto/edição/gênero; reserva no checkout respeita limites concorrentes; devolução não restitui uso.

**Regras:** RN-008, RN-016, RN-017, RN-018, RN-032. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008. **Caso de uso:** UC-019. **Verificação:** TEST-019.

### RF-020 Administrar logística e atendimentos

**Ator:** ADMIN/OPERATOR. **Prioridade:** MUST. **Pré-condição:** Pedido pago ou atendimento autorizado.

**Descrição/resultado e critérios de aceitação:** Estado em separação bloqueia cancelamento direto; remessa original única; retorno/substituto têm rastreios próprios; interação externa de bloqueado fica auditada.

**Regras:** RN-001, RN-015, RN-019, RN-023, RN-032, RN-040. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008. **Caso de uso:** UC-020. **Verificação:** TEST-020.

### RF-021 Consultar e administrar clientes

**Ator:** ADMIN; OPERATOR somente consulta. **Prioridade:** MUST. **Pré-condição:** Conta interna ativa.

**Descrição/resultado e critérios de aceitação:** OPERATOR não altera/bloqueia; ADMIN bloqueia login, checkout e pendentes atomicamente, preservando pagos e atendimento; correção de e-mail exige confirmação.

**Regras:** RN-001, RN-028, RN-032. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008. **Caso de uso:** UC-021. **Verificação:** TEST-021.

### RF-022 Moderar avaliações

**Ator:** ADMIN/OPERATOR. **Prioridade:** MUST. **Pré-condição:** Avaliação existente.

**Descrição/resultado e critérios de aceitação:** Ocultar preserva histórico; edição pelo autor não desfaz moderação; liberação explícita revalida elegibilidade de compra.

**Regras:** RN-001, RN-025, RN-032. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008. **Caso de uso:** UC-022. **Verificação:** TEST-022.

### RF-023 Consultar relatórios

**Ator:** ADMIN. **Prioridade:** MUST. **Pré-condição:** Eventos comerciais registrados.

**Descrição/resultado e critérios de aceitação:** Pagamento setembro/estorno outubro ficam em períodos próprios; ticket setembro usa líquido atualizado; gênero principal evita duplicação; unidades gratuitas mantidas contam; troca não é venda nova.

**Regras:** RN-018, RN-021, RN-030, RN-032, RN-034. **Qualidade:** RNF-001, RNF-003, RNF-004, RNF-005. **Caso de uso:** UC-023. **Verificação:** TEST-023.

### RF-024 Processar notificações de teste

**Ator:** Processo técnico; titular como destinatário. **Prioridade:** MUST. **Pré-condição:** Evento de acesso/comercial ou reposição.

**Descrição/resultado e critérios de aceitação:** Todos os eventos de RN-042 geram mensagens; falha não bloqueia negócio; repetição é auditada; conteúdo de acesso e evidências não é público.

**Regras:** RN-003, RN-024, RN-032, RN-033, RN-042. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011. **Caso de uso:** UC-024. **Verificação:** TEST-024.

### RF-025 Executar backup e restaurar

**Ator:** Operação técnica. **Prioridade:** MUST. **Pré-condição:** Ambiente e parâmetros definidos.

**Descrição/resultado e critérios de aceitação:** Backup diário automático; recuperação testada periodicamente; política de retenção/destino não inventada; restauração de teste preserva origem.

**Regras:** RN-031, RN-032. **Qualidade:** RNF-002, RNF-009, RNF-011, RNF-012. **Caso de uso:** UC-025. **Verificação:** TEST-025.

### RF-026 Gerenciar contas internas

**Ator:** ADMIN. **Prioridade:** MUST. **Pré-condição:** Administrador ativo.

**Descrição/resultado e critérios de aceitação:** Criar/editar/bloquear ADMIN/OPERATOR; impedir remoção do último ADMIN ativo; contas internas não compram; e-mail alterado só após confirmar novo.

**Regras:** RN-001, RN-029, RN-032, RN-044. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008. **Caso de uso:** UC-026. **Verificação:** TEST-032.

### RF-027 Encerrar e reativar conta

**Ator:** Cliente. **Prioridade:** MUST. **Pré-condição:** Conta própria; reativação somente encerrada sem bloqueio.

**Descrição/resultado e critérios de aceitação:** Encerrar revoga acesso, cancela checkout/pendentes e preserva pagos/histórico; reativação confirma e-mail; bloqueio prevalece; retenção permanece pendente.

**Regras:** RN-032, RN-043. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011. **Caso de uso:** UC-027. **Verificação:** TEST-033.

### RF-028 Confirmar e alterar e-mail

**Ator:** Titular; ADMIN inicia correção. **Prioridade:** MUST. **Pré-condição:** Token apropriado ou conta autorizada.

**Descrição/resultado e critérios de aceitação:** Confirmação inicial em 24h com reenvio; primeiro pedido exige confirmação; alteração mantém endereço anterior até confirmar novo; unicidade validada.

**Regras:** RN-002, RN-032, RN-044. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011. **Caso de uso:** UC-028. **Verificação:** TEST-034.

### RF-029 Configurar frete e cobertura

**Ator:** ADMIN. **Prioridade:** MUST. **Pré-condição:** Tabela de faixas sem sobreposição ambígua.

**Descrição/resultado e critérios de aceitação:** Somente ADMIN altera valores/prazos/cobertura; faixas podem ser não atendidas; edição da tabela não muda snapshot de pedido criado.

**Regras:** RN-014, RN-032. **Qualidade:** RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008. **Caso de uso:** UC-029. **Verificação:** TEST-035.

## 6 Requisitos não funcionais

Metas não informadas permanecem pendentes; cenários são planejados, sem resultado de execução.

### RNF-001 Autenticação e autorização

Hash de senha com salt, autenticação por token e autorização/propriedade no servidor. Bloqueados/encerrados não autenticam; conta interna não compra; OPERATOR não acessa privilégios ADMIN; último ADMIN protegido. Algoritmos/sessões ainda serão ratificados.

Verificação: TEST-030.

### RNF-002 Privacidade e retenção

Proteger senhas/tokens e evidências; segredos fora de logs/repositório. Preservar histórico no encerramento. Política de retenção/anonimização permanece pendente; nenhum apagamento definitivo por suposição.

Verificação: TEST-030.

### RNF-003 Desempenho

Volume de catálogo, contas, concorrência e metas de tempo permanecem PENDENTES DE DECISÃO. Definir ambiente, amostra, percentil/métrica e limites antes do ensaio; não alegar aprovação sem metas.

Verificação: TEST-027.

### RNF-004 Integridade e concorrência

Atomicidade nas reservas/pedidos/pagamentos, idempotência e integridade referencial. Corridas por último usado/cupom, limite de 3 pendentes e último ADMIN devem preservar invariantes; nenhuma venda/estorno duplicado.

Verificação: TEST-026.

### RNF-005 Auditoria

Registrar ator, instante, motivo, alvo e resultado de alterações administrativas, moderação, exceções, tentativas financeiras e interações externas. Preservar histórico sem segredos.

Verificação: TEST-030.

### RNF-006 Transporte e isolamento

Definir transporte seguro e configuração de ambientes em TASK-001. O PDF não aprovou exceção HTTP nem publicação apenas local. Canal de testes e simulador identificáveis; links e mensagens sensíveis protegidos.

Verificação: TEST-030.

### RNF-007 Acessibilidade

Web: teclado, foco visível, rótulos, erros compreensíveis, contraste adequado e descrição de imagens. Mobile: rótulos para leitores de tela e ampliação de texto sem impedir operações. Não declarar certificação WCAG não exigida.

Verificação: TEST-028.

### RNF-008 Compatibilidade

Web responsiva e React Native/Expo com API REST comum e funções de cliente equivalentes. Administração só web. Plataformas, navegadores e publicação permanecem pendentes de informação acadêmica.

Verificação: TEST-028.

### RNF-009 Backup e recuperação

Backup diário automático e testes periódicos de restauração. Retenção, frequência de teste e destino dependem do ambiente; definir antes do aceite operacional. Verificar dados e arquivos, preservando origem do teste.

Verificação: TEST-029.

### RNF-010 Arquivos

JPEG/PNG/WebP até 5 MB; 10 por edição, 8 por usado, 5 evidências do cliente e 5 da equipe por atendimento. Verificar conteúdo/tamanho e autorização no servidor; nomes internos seguros; evidências privadas.

Verificação: TEST-030.

### RNF-011 Processamento recuperável

Prazos pelo servidor, revalidados em operações mesmo se job atrasar. Persistir eventos/tentativas; falha de notificação não interrompe compra e pode ser repetida. Reconciliar vencimentos e evitar duplicação na retomada.

Verificação: TEST-031.

### RNF-012 Manutenibilidade

API REST única; regras desacopladas dos clientes e adaptador de pagamento substituível. Estrutura de camadas/stack ratificada em TASK-001 (ADR-001), com parâmetros e limites registrados; compatibilidade executável exige gates de bootstrap. Erros centralizados e comandos de build/lint/testes documentados na implementação.

Verificação: TEST-030.

## 7 Regras de negócio

### RN-001 Loja e atores

Estoque próprio de uma única loja. USER é cliente; ADMIN e OPERATOR são contas internas separadas das contas de compra. A mesma pessoa usa outra conta/contexto para comprar. Administração exclusivamente web. ADMIN gere contas internas, configurações, clientes, relatórios e autoriza estornos de pós-venda. OPERATOR gere catálogo/estoque, logística, atendimento e moderação, consulta clientes, mas não altera seus dados nem bloqueia contas.

**Fonte:** R01-P2; R04-P7; R07-P6; R12-P1; R13-P1; R14-P4. **Requisitos:** RF-001, RF-002, RF-017, RF-018, RF-020, RF-021, RF-022, RF-026. **Casos:** UC-001, UC-002, UC-017, UC-018, UC-020, UC-021, UC-022, UC-026. **Impacto:** AuditLog, Checkout, Edition, EmailToken, ExternalInteraction, Offer, Order, OrderStatusEvent, ProductImage, Reservation, Review, ReviewRevision, Session, Shipment, StockMovement, Track, TrackArtist, User.

### RN-002 Cadastro e confirmação

Cadastro exige nome, e-mail único e senha. Endereço e CEP são exigidos na compra. Confirmar e-mail antes do primeiro pedido; link de confirmação vale 24 horas e pode ser reenviado. Telefone obrigatório não foi estabelecido pelo PDF.

**Fonte:** R07-P5; R11-P6. **Requisitos:** RF-001, RF-004, RF-011, RF-028. **Casos:** UC-001, UC-004, UC-011, UC-028. **Impacto:** Address, Checkout, CouponUsage, DemoMessage, EmailToken, FreightRate, Order, OrderItem, Reservation, User.

### RN-003 Recuperação de senha

Link temporário de uso único vale 30 minutos. Recuperação invalida todas as sessões/tokens ativos. Mensagem usa canal de teste ou registro local protegido; não divulgar existência da conta na resposta pública.

**Fonte:** R07-P5; R11-P6. **Requisitos:** RF-003, RF-024. **Casos:** UC-003, UC-024. **Impacto:** DemoMessage, DomainEvent, EmailToken, PasswordReset, Session, User.

### RN-004 Edição e exemplares

Novos idênticos têm estoque por quantidade; usados são exemplares individuais com preço, fotos e conservação próprios dentro da página da edição. Colecionador é característica da edição e não muda a regra de estoque.

**Fonte:** R01-P3; R02-P2. **Requisitos:** RF-005, RF-006, RF-010, RF-017, RF-018. **Casos:** UC-005, UC-006, UC-010, UC-017, UC-018. **Impacto:** Artist, Cart, CartItem, Checkout, CheckoutItem, Edition, Genre, Offer, ProductImage, Reservation, StockMovement, Track, TrackArtist.

### RN-005 Conservação e particularidades

Cada usado exige Goldmine separada para mídia e capa, descrição das particularidades/defeitos e ao menos uma foto própria. Escala completa Goldmine não foi enumerada no PDF; registrar vocabulário em PD-006 antes do cadastro.

**Fonte:** R02-P3; R14-P6. **Requisitos:** RF-006, RF-017. **Casos:** UC-006, UC-017. **Impacto:** Edition, Offer, ProductImage, Track, TrackArtist.

### RN-006 Reserva identificada e indivisível

Somente cliente autenticado e apto inicia checkout. Validar todo o carrinho antes de reservar: se qualquer item falhar, não criar reserva parcial. Mostrar indisponíveis; cliente confirma a alteração e tenta novamente. Reserva abrange novos e usados e nunca permite posse concorrente do mesmo saldo.

**Fonte:** R01-P4; R02-P4. **Requisitos:** RF-010, RF-011, RF-018. **Casos:** UC-010, UC-011, UC-018. **Impacto:** Cart, CartItem, Checkout, CheckoutItem, CouponUsage, Edition, FreightRate, Offer, Order, OrderItem, Reservation, StockMovement.

### RN-007 Prazo do checkout

Adicionar ao carrinho não reserva estoque. Uma finalização bem-sucedida reserva o conjunto por 15 minutos. Existe no máximo uma finalização ativa por cliente, recuperada em outras abas/dispositivos com o mesmo prazo.

**Fonte:** R01-P4; R06-P1. **Requisitos:** RF-010, RF-011. **Casos:** UC-010, UC-011. **Impacto:** Cart, CartItem, Checkout, CheckoutItem, CouponUsage, FreightRate, Order, OrderItem, Reservation.

### RN-008 Alteração e expiração da finalização

Alterar itens, quantidades ou cupom encerra a reserva atual e exige nova validação com preços atuais e nova reserva de 15 minutos. Alterar endereço mantém produtos/preços e prazo original, recalculando frete. CEP não atendido impede pedido, mas permite corrigir endereço até o vencimento. Expiração libera estoque e uso temporário de cupom; não depende da tela aberta.

**Fonte:** R07-P4; R13-P6; R04-P2. **Requisitos:** RF-010, RF-011, RF-019. **Casos:** UC-010, UC-011, UC-019. **Impacto:** Cart, CartItem, Checkout, CheckoutItem, Coupon, CouponTarget, CouponUsage, FreightRate, Order, OrderItem, Promotion, Reservation.

### RN-009 Carrinho de visitante e conta

Visitante navega, adiciona ao carrinho e consulta frete; não compra sem conta. Ao entrar, mesclar com carrinho salvo: somar novos até disponibilidade e avisar ajustes; usados não se duplicam e indisponíveis são sinalizados/removidos antes da finalização. Conta compartilha carrinho e finalização entre dispositivos.

**Fonte:** R02-P1; R06-P1; R06-P3. **Requisitos:** RF-010, RF-011. **Casos:** UC-010, UC-011. **Impacto:** Cart, CartItem, Checkout, CheckoutItem, CouponUsage, FreightRate, Order, OrderItem, Reservation.

### RN-010 Preço garantido e histórico

Carrinho não garante preço. Antes da reserva, recalcular e exigir confirmação de mudanças. Reserva de checkout congela preços e descontos por 15 minutos. Pedido preserva snapshots de endereço, edição, conservação, promoção, cupom, rateio unitário e frete aceito; mudanças posteriores não reescrevem a compra.

**Fonte:** R03-P6; R11-P3; R13-P6. **Requisitos:** RF-010, RF-011, RF-012. **Casos:** UC-010, UC-011, UC-012. **Impacto:** Cart, CartItem, Checkout, CheckoutItem, CouponUsage, FreightRate, Order, OrderItem, PaymentAttempt, PaymentCharge, Refund, RefundAttempt, Reservation.

### RN-011 Prazos e limite de pedidos

Pedido Pix inicia prazo integral de 30 minutos na criação; boleto, 2 dias. Vencido cancela e libera estoque. Até 3 pedidos aguardando pagamento por cliente; verificar limite antes de nova reserva de checkout. Cliente pode cancelar pendente para liberar vaga. Pagamento tardio não reativa pedido: gerar estorno automático.

**Fonte:** R01-P5; R02-P5; R07-P2; R08-P2. **Requisitos:** RF-011, RF-012, RF-014. **Casos:** UC-011, UC-012, UC-014. **Impacto:** CancellationRequest, Checkout, CouponUsage, FreightRate, Order, OrderItem, OrderUnit, PaymentAttempt, PaymentCharge, Refund, RefundAttempt, Reservation, StockMovement.

### RN-012 Simulador de pagamento

Primeira versão usa simulador local substituível, com aprovação, recusa, pendência, vencimento, confirmação tardia e falha de estorno, sem cobrança real. Cartão recusado não cria pedido; cliente pode tentar novamente ou escolher Pix/boleto dentro dos 15 minutos originais. Aprovação de cartão após expiração não cria pedido e gera estorno automático.

**Fonte:** R06-P2; R07-P1; R14-P7. **Requisitos:** RF-012. **Casos:** UC-012. **Impacto:** Checkout, Order, PaymentAttempt, PaymentCharge, Refund, RefundAttempt.

### RN-013 Atomicidade e confirmação

Criar pedido Pix/boleto e transferir reserva ocorre em transação; confirmar pagamento posterior usa nova transação. Cartão válido cria pedido pago e baixa saldo atomicamente. Concorrência com expiração/cancelamento/bloqueio não duplica venda. Evento repetido não duplica efeitos. Não manter chamada externa dentro de transação de banco.

**Fonte:** R01-P5; R06-P2; R07-P1. **Requisitos:** RF-011, RF-012, RF-018. **Casos:** UC-011, UC-012, UC-018. **Impacto:** Checkout, CouponUsage, Edition, FreightRate, Offer, Order, OrderItem, PaymentAttempt, PaymentCharge, Refund, RefundAttempt, Reservation, StockMovement.

### RN-014 Frete por cobertura

Tabela fixa por faixa de CEP/região retorna preço e prazo, incluindo faixas não atendidas. Somente entrega cobrada, sem retirada nem regra permanente de frete grátis. Valores, faixas e prazos concretos pendentes; não há obrigação de 27 UFs, preparação de 2 dias ou entrega de 15–30 dias.

**Fonte:** R06-P5; R13-P6; R14-P4. **Requisitos:** RF-011, RF-029. **Casos:** UC-011, UC-029. **Impacto:** AuditLog, CepRange, Checkout, CouponUsage, FreightRate, Order, OrderItem, Reservation.

### RN-015 Logística

Fluxo: aguardando pagamento → pago → em separação → separado → enviado → entregue. ADMIN/OPERATOR registram eventos simulados. Uma remessa para envio original; trocas têm remessas próprias. Data de entrega registrada inicia janela de pós-venda; estimativa não muda estado automaticamente.

**Fonte:** R03-P1; R11-P4; R13-P3. **Requisitos:** RF-013, RF-020. **Casos:** UC-013, UC-020. **Impacto:** ExternalInteraction, Order, OrderItem, OrderStatusEvent, Refund, Shipment.

### RN-016 Cupom e promoções

Um cupom por pedido. Pode acumular com itens promocionais se configurado. Restrições por produtos, edições ou gêneros; mínimo e desconto consideram somente itens elegíveis após promoções, sem frete. Promoções sobrepostas não se somam: prevalece o menor preço.

**Fonte:** R03-P7; R04-P3; R04-P5. **Requisitos:** RF-011, RF-019. **Casos:** UC-011, UC-019. **Impacto:** Checkout, Coupon, CouponTarget, CouponUsage, FreightRate, Order, OrderItem, Promotion, Reservation.

### RN-017 Uso do cupom

Cupom percentual/fixo, validade, mínimo e limites total/por cliente. Checkout reserva uma utilização; criação do pedido torna uso definitivo mesmo pendente. Expiração do checkout ou cancelamento libera uso. Devolução não devolve utilização. Fixo não excede subtotal elegível nem gera crédito; frete continua devido.

**Fonte:** R04-P2; R13-P5. **Requisitos:** RF-011, RF-012, RF-014, RF-019. **Casos:** UC-011, UC-012, UC-014, UC-019. **Impacto:** CancellationRequest, Checkout, Coupon, CouponTarget, CouponUsage, FreightRate, Order, OrderItem, OrderUnit, PaymentAttempt, PaymentCharge, Promotion, Refund, RefundAttempt, Reservation, StockMovement.

### RN-018 Rateio monetário

Distribuir cupom proporcionalmente entre elegíveis e ajustar centavos para soma exata. Preservar líquido por unidade; devolução parcial usa esse valor sem recalcular itens mantidos. Algoritmo técnico ratificado no ADR-004: maiores restos, desempate por ID estável da unidade congelado no pedido, com soma exata.

**Fonte:** R04-P4. **Requisitos:** RF-011, RF-015, RF-019, RF-023. **Casos:** UC-011, UC-015, UC-019, UC-023. **Impacto:** Checkout, Coupon, CouponTarget, CouponUsage, Evidence, FinancialEvent, FreightRate, Genre, Order, OrderItem, OrderUnit, Promotion, Refund, Reservation, ReturnItem, ReturnRequest, Shipment.

### RN-019 Cancelamento e indisponibilidade

Cliente cancela pendente/pago antes de em separação; pago gera estorno integral automático. Em separação/separado utiliza devolução, analisável antes de postagem sem retorno físico. Se já postado, fluxo após entrega. Indisponibilidade pode cancelar unidades parcialmente: mantém frete e cupom enquanto sobra item; se todos cancelados, estorna frete e libera uso. Não lançar avaria consumindo reserva sem resolver vínculo.

**Fonte:** R02-P6; R03-P1; R03-P2; R06-P4; R07-P3. **Requisitos:** RF-014, RF-015, RF-018, RF-020. **Casos:** UC-014, UC-015, UC-018, UC-020. **Impacto:** CancellationRequest, Edition, Evidence, ExternalInteraction, Offer, Order, OrderStatusEvent, OrderUnit, PaymentCharge, Refund, Reservation, ReturnItem, ReturnRequest, Shipment, StockMovement.

### RN-020 Janela e motivos de pós-venda

Troca/devolução até 7 dias corridos após entrega, parcial por unidades, motivo e descrição registrados. Devolução aceita desistência, divergência, avaria e problema não informado; troca principalmente produto incorreto, avaria ou condição divergente. Uma solicitação ativa por unidade. Substituto entregue inicia novos 7 dias, mantendo cadeia com compra original. Exceção pré-envio segue RN-019.

**Fonte:** R03-P3; R04-P6; R13-P3. **Requisitos:** RF-015, RF-016. **Casos:** UC-015, UC-016. **Impacto:** Evidence, ExchangeItem, ExchangeRequest, OrderUnit, Refund, Reservation, ReturnItem, ReturnRequest, Shipment, SubstituteOffer.

### RN-021 Devolução e fretes

Estornar valor líquido registrado das unidades. Devolução integral inclui frete original; parcial somente produtos. Retorno sem cobrança adicional ao cliente; troca inclui envio do substituto por conta da loja. Reposição somente após conferência apta. Estorno de pós-venda exige autorização ADMIN, além de recebimento/conferência quando aplicável.

**Fonte:** R01-P7; R03-P4; R05-P1; R05-P2. **Requisitos:** RF-015, RF-018, RF-023. **Casos:** UC-015, UC-018, UC-023. **Impacto:** Edition, Evidence, FinancialEvent, Genre, Offer, Order, OrderUnit, Refund, Reservation, ReturnItem, ReturnRequest, Shipment, StockMovement.

### RN-022 Equivalência e espera de troca

Troca somente por exemplar da mesma edição, declarado equivalente pela equipe, sem cobrança/crédito por diferença. Cliente pode aguardar até 30 dias a partir da conferência favorável do original ou converter em devolução. Busca/oferta antecipada permitida. Oferta reserva substituto por 48 horas completas, inclusive além do dia 30; enquanto ativa suspende conversão. Aceite mantém reserva até conferência/envio; recusa/expiração libera. Ao acabar espera sem oferta ativa/aceite, converter em devolução; estorno não é automaticamente autorizado.

**Fonte:** R02-P7; R03-P5; R04-P1; R05-P2; R05-P3; R08-P5; R09-P1; R09-P2. **Requisitos:** RF-016, RF-018. **Casos:** UC-016, UC-018. **Impacto:** Edition, Evidence, ExchangeItem, ExchangeRequest, Offer, OrderUnit, Reservation, Shipment, StockMovement, SubstituteOffer.

### RN-023 Ciclo físico da troca

Enviar substituto somente após original recebido e conferido favoravelmente. Registrar separadamente retorno, envio e entrega, com códigos/datas. Sem nova venda. Falta de postagem em 7 dias sem exceção ou rejeição na conferência libera substituto. Aceite/recusa do cliente ficam registrados, inclusive por atendimento externo autorizado.

**Fonte:** R05-P4; R09-P2; R13-P3; R08-P4. **Requisitos:** RF-016, RF-020. **Casos:** UC-016, UC-020. **Impacto:** Evidence, ExchangeItem, ExchangeRequest, ExternalInteraction, Order, OrderStatusEvent, OrderUnit, Reservation, Shipment, SubstituteOffer.

### RN-024 Alerta de reposição

Inscrição por edição e condição NEW, USED ou ANY; não por conservação mínima. Notificar todos os inscritos compatíveis quando disponibilidade retornar por reposição, devolução apta, cancelamento ou expiração. Sem reserva/prioridade. Encerrar inscrição apenas após envio bem-sucedido no canal de teste; falha mantém ativa para nova tentativa. Novo alerta exige nova inscrição.

**Fonte:** R05-P6; R06-P6; R12-P4. **Requisitos:** RF-008, RF-018, RF-024. **Casos:** UC-008, UC-018, UC-024. **Impacto:** AvailabilityAlert, DemoMessage, DomainEvent, Edition, EmailToken, Offer, Reservation, StockMovement.

### RN-025 Avaliação e moderação

Avaliação por cliente, edição e pedido entregue; várias unidades da mesma edição no pedido dão uma avaliação. Publicação e edição imediatas, exceto ocultada: edição mantém oculta aguardando liberação ADMIN/OPERATOR. Preservar histórico. Devolver todas as unidades da edição oculta avaliação e impede nova avaliação daquela compra; parcial mantém enquanto sobra unidade. Troca não cria direito adicional.

**Fonte:** R05-P5; R06-P7; R07-P7; R13-P7; R14-P2. **Requisitos:** RF-009, RF-022. **Casos:** UC-009, UC-022. **Impacto:** AuditLog, OrderItem, OrderUnit, Review, ReviewRevision.

### RN-026 Áudio por faixa

Zero ou um link de prévia por faixa. Sem upload/armazenamento de áudio na aplicação; mostrar reprodução somente quando houver link. Falha de recurso não impede consulta do catálogo.

**Fonte:** R10-P4. **Requisitos:** RF-006, RF-017. **Casos:** UC-006, UC-017. **Impacto:** Edition, Offer, ProductImage, Track, TrackArtist.

### RN-027 Exclusão e inativação

Histórico de pedido, avaliação ou atendimento impede exclusão definitiva de edição/exemplar; sem vínculos históricos pode excluir. Inativação comercial impede novas compras e preserva reservas/pedidos existentes. Perda/avaria resolve antes a vinculação comercial, conforme RN-019.

**Fonte:** R05-P7; R06-P4. **Requisitos:** RF-017, RF-018. **Casos:** UC-017, UC-018. **Impacto:** Edition, Offer, ProductImage, Reservation, StockMovement, Track, TrackArtist.

### RN-028 Bloqueio administrativo

Somente ADMIN bloqueia/desbloqueia cliente. Bloqueio impede login, encerra checkout e cancela pedidos pendentes, liberando saldo. Pagos e atendimentos continuam pela equipe. Equipe registra solicitações e aceite/recusa recebidos pelo e-mail cadastrado, com data e responsável. Desbloqueio não recria reservas.

**Fonte:** R07-P6; R08-P3; R08-P4. **Requisitos:** RF-002, RF-010, RF-012, RF-015, RF-016, RF-021. **Casos:** UC-002, UC-010, UC-012, UC-015, UC-016, UC-021. **Impacto:** AuditLog, Cart, CartItem, Checkout, CheckoutItem, Evidence, ExchangeItem, ExchangeRequest, Order, OrderUnit, PaymentAttempt, PaymentCharge, Refund, RefundAttempt, Reservation, ReturnItem, ReturnRequest, Session, Shipment, SubstituteOffer, User.

### RN-029 Contas internas protegidas

Somente ADMIN cria, edita, bloqueia/inativa ADMIN/OPERATOR. Não permitir remoção/bloqueio/inativação do último administrador ativo. Cadastro público nunca concede papel interno. Bootstrap do primeiro administrador será comando local explícito sem senha padrão, conforme ADR-005 e parâmetros ratificados em TASK-001.

**Fonte:** R12-P1. **Requisitos:** RF-001, RF-002, RF-026. **Casos:** UC-001, UC-002, UC-026. **Impacto:** AuditLog, EmailToken, Session, User.

### RN-030 Relatórios e períodos

Vendas financeiras registram pagamento no período do pagamento e estorno como ajuste negativo no período do estorno, sem reescrever período anterior. Ticket médio dos pedidos pagos no período usa ajustes conhecidos na consulta, exclui frete e pedidos sem unidades mantidas. Produto líquido zero mantido conta em quantidade e denominador. Ranking de gêneros usa só gênero principal; giro é unidades líquidas vendidas por edição, não estoque médio. Troca mantém venda original e não soma substituto.

**Fonte:** R08-P7; R09-P5; R09-P6; R09-P7; R10-P1; R11-P1; R14-P1. **Requisitos:** RF-023. **Casos:** UC-023. **Impacto:** FinancialEvent, Genre, Order, OrderUnit, Refund.

### RN-031 Backup e restauração

Backup automático diário e testes periódicos de restauração. Retenção, frequência de teste e destino permanecem pendentes conforme ambiente; não fixar sete cópias. Proposta técnica: preservar banco e arquivos em conjunto consistente e restaurar em destino isolado.

**Fonte:** R11-P7. **Requisitos:** RF-025. **Casos:** UC-025. **Impacto:** BackupRun, Evidence, ProductImage.

### RN-032 Canais e plataformas

Web responsiva e aplicativo React Native/Expo usam mesma API REST. Todas as funções de cliente no aplicativo; administração só web. Plataforma mobile, navegadores e exigência de publicação dependem de confirmação acadêmica; não declarar Android exclusivo nem excluir iOS como decisão aprovada.

**Fonte:** R01-P1; R10-P6; R13-P1. **Requisitos:** RF-001, RF-002, RF-003, RF-004, RF-005, RF-006, RF-007, RF-008, RF-009, RF-010, RF-011, RF-012, RF-013, RF-014, RF-015, RF-016, RF-017, RF-018, RF-019, RF-020, RF-021, RF-022, RF-023, RF-024, RF-025, RF-026, RF-027, RF-028, RF-029. **Casos:** UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007, UC-008, UC-009, UC-010, UC-011, UC-012, UC-013, UC-014, UC-015, UC-016, UC-017, UC-018, UC-019, UC-020, UC-021, UC-022, UC-023, UC-024, UC-025, UC-026, UC-027, UC-028, UC-029. **Impacto:** Address, Artist, AuditLog, AvailabilityAlert, BackupRun, CancellationRequest, Cart, CartItem, CepRange, Checkout, CheckoutItem, Coupon, CouponTarget, CouponUsage, DemoMessage, DomainEvent, Edition, EmailToken, Evidence, ExchangeItem, ExchangeRequest, ExternalInteraction, FinancialEvent, FreightRate, Genre, Offer, Order, OrderItem, OrderStatusEvent, OrderUnit, PasswordReset, PaymentAttempt, PaymentCharge, ProductImage, Promotion, Refund, RefundAttempt, Reservation, ReturnItem, ReturnRequest, Review, ReviewRevision, Session, Shipment, StockMovement, SubstituteOffer, Track, TrackArtist, User, WishlistEntry.

### RN-033 Integrações de teste

Pagamento local definido na rodada final. Frete simulado por tabela, logística simulada/manual. E-mail pode usar serviço de teste ou registro local para demonstração; adaptadores substituíveis. Ambiente final e política de transporte ainda precisam ser definidos; não há dispensa de HTTPS aprovada pelo PDF.

**Fonte:** R01-P6; R14-P7; R10-P6. **Requisitos:** RF-003, RF-011, RF-012, RF-013, RF-024. **Casos:** UC-003, UC-011, UC-012, UC-013, UC-024. **Impacto:** Checkout, CouponUsage, DemoMessage, DomainEvent, EmailToken, FreightRate, Order, OrderItem, OrderStatusEvent, PasswordReset, PaymentAttempt, PaymentCharge, Refund, RefundAttempt, Reservation, Session, Shipment, User.

### RN-034 Histórico por unidade

Unidade comercial da compra permanece identificável após trocas; no máximo um atendimento ativo por unidade e nenhuma duplicação de estorno. Troca não é nova venda; cadeia permite nova janela sobre entrega substituta.

**Fonte:** R04-P6; R09-P5; R13-P3. **Requisitos:** RF-015, RF-016, RF-023. **Casos:** UC-015, UC-016, UC-023. **Impacto:** Evidence, ExchangeItem, ExchangeRequest, FinancialEvent, Genre, Order, OrderUnit, Refund, Reservation, ReturnItem, ReturnRequest, Shipment, SubstituteOffer.

### RN-035 Saldo e reservas

Novos têm quantidade não negativa; usados individuais. Disponível desconta reservas válidas de checkout/pedido/troca. Ajuste de estoque não invade unidade reservada ou comprometida. Oferta de substituto tem 48 horas; após aceite aguarda conferência, com liberação por expiração de postagem/rejeição.

**Fonte:** R02-P2; R06-P4; R09-P2. **Requisitos:** RF-010, RF-016, RF-018. **Casos:** UC-010, UC-016, UC-018. **Impacto:** Cart, CartItem, Checkout, CheckoutItem, Edition, Evidence, ExchangeItem, ExchangeRequest, Offer, OrderUnit, Reservation, Shipment, StockMovement, SubstituteOffer.

### RN-036 Catálogo e publicação

Edição distingue selo/gravadora, catálogo, país, ano de prensagem, formato e gramatura. Ano original separado do ano da edição; década usa ano da edição. Múltiplos artistas por edição e faixa, busca por ambos. Múltiplos gêneros e um principal. País, ano da edição, gramatura e catálogo podem ser desconhecidos. Publicação exige título, artista, formato, gênero principal e imagem; usado também preço, Goldmine mídia/capa, descrição e foto própria.

**Fonte:** R10-P2; R10-P3; R09-P7; R14-P6. **Requisitos:** RF-005, RF-006, RF-017. **Casos:** UC-005, UC-006, UC-017. **Impacto:** Artist, Edition, Genre, Offer, ProductImage, Track, TrackArtist.

### RN-037 Desejos

Lista de edições exclusiva de autenticados, independente de alertas; não reserva unidade nem inscreve automaticamente em reposição.

**Fonte:** R11-P2. **Requisitos:** RF-007, RF-008. **Casos:** UC-007, UC-008. **Impacto:** AvailabilityAlert, DemoMessage, DomainEvent, Edition, Offer, User, WishlistEntry.

### RN-038 Estoque baixo

Novos: limite configurável por edição; alertar quando disponível for menor ou igual. Usados: alertar quando não houver exemplar disponível da edição. Somente painel, sem e-mail. ADMIN e OPERATOR podem configurar limite de estoque.

**Fonte:** R10-P5; R14-P4. **Requisitos:** RF-018. **Casos:** UC-018. **Impacto:** Edition, Offer, Reservation, StockMovement.

### RN-039 Cobrança substituída

Indisponibilidade parcial antes de Pix/boleto invalida cobrança original e cria outra com valor reduzido, mesmo pedido e vencimento original. Sem tempo hábil cancela pedido. Confirmação de cobrança antiga é estornada integralmente e não quita pedido atualizado.

**Fonte:** R08-P1; R09-P3. **Requisitos:** RF-012, RF-014, RF-018. **Casos:** UC-012, UC-014, UC-018. **Impacto:** CancellationRequest, Checkout, Edition, Offer, Order, OrderUnit, PaymentAttempt, PaymentCharge, Refund, RefundAttempt, Reservation, StockMovement.

### RN-040 Postagem e rejeição

Retorno físico deve ser postado e informado em 7 dias após aprovação. Sem postagem, expira; somente ADMIN autoriza exceção com justificativa e novo prazo auditado. Divergência na conferência pode rejeitar atendimento; exceção só ADMIN. Produto rejeitado aguarda reenvio ao cliente, com rastreio/entrega, frete da loja, e não retorna ao estoque.

**Fonte:** R08-P5; R08-P6; R09-P4; R13-P4. **Requisitos:** RF-015, RF-016, RF-020. **Casos:** UC-015, UC-016, UC-020. **Impacto:** Evidence, ExchangeItem, ExchangeRequest, ExternalInteraction, Order, OrderStatusEvent, OrderUnit, Refund, Reservation, ReturnItem, ReturnRequest, Shipment, SubstituteOffer.

### RN-041 Estorno e tentativas

Cancelamento permitido, impossibilidade de atendimento e pagamento tardio geram estorno automático. Pós-venda exige ADMIN. Falha não desfaz cancelamento/devolução: reembolso fica PENDING/FAILED visível ao cliente. Sistema/ADMIN podem repetir automático; pós-venda só ADMIN autoriza tentativa. Registrar tentativas e nunca marcar sucesso fictício.

**Fonte:** R05-P1; R06-P4; R12-P3. **Requisitos:** RF-012, RF-014, RF-015, RF-016. **Casos:** UC-012, UC-014, UC-015, UC-016. **Impacto:** CancellationRequest, Checkout, Evidence, ExchangeItem, ExchangeRequest, Order, OrderUnit, PaymentAttempt, PaymentCharge, Refund, RefundAttempt, Reservation, ReturnItem, ReturnRequest, Shipment, StockMovement, SubstituteOffer.

### RN-042 Eventos de notificação

Notificar criação do pedido, pagamento, envio, entrega, cancelamento, abertura/decisão de pós-venda, necessidade de postagem, oferta/envio de substituto e sucesso/falha de estorno, além de acesso e reposição. Mudanças internas intermediárias não notificam. Falha não bloqueia negócio e fica para repetição.

**Fonte:** R12-P4; R14-P5. **Requisitos:** RF-024. **Casos:** UC-024. **Impacto:** DemoMessage, DomainEvent, EmailToken.

### RN-043 Encerramento e reativação

Cliente encerra conta: impede acesso, cancela checkout e pedidos pendentes; pagos e atendimentos continuam. Preservar históricos; retenção/anonimização pendentes. Reativação pelo cliente confirma e-mail enquanto dados retidos. Bloqueio ADMIN prevalece, inclusive se simultaneamente encerrada; só ADMIN desbloqueia.

**Fonte:** R12-P5; R13-P2; R14-P3. **Requisitos:** RF-027. **Casos:** UC-027. **Impacto:** Checkout, EmailToken, Order, Session, User.

### RN-044 Alteração de e-mail

Cliente solicita alteração própria; ADMIN pode corrigir e-mail de cliente ou conta interna. Novo endereço deve ser confirmado antes de substituir o atual, que continua válido para login e comunicações até confirmação.

**Fonte:** R12-P2. **Requisitos:** RF-004, RF-026, RF-028. **Casos:** UC-004, UC-026, UC-028. **Impacto:** Address, AuditLog, DemoMessage, EmailToken, Session, User.

### RN-045 Imagens e evidências

JPEG, PNG, WebP; máximo 5 MB por arquivo. Até 10 imagens por edição e 8 por usado; ao menos uma para publicar. Atendimento aceita até 5 do cliente e 5 da equipe. Catálogo público; evidências privadas somente cliente relacionado e equipe autorizada. Validar tamanho e conteúdo no servidor.

**Fonte:** R11-P5; R12-P6; R14-P6. **Requisitos:** RF-006, RF-015, RF-016, RF-017. **Casos:** UC-006, UC-015, UC-016, UC-017. **Impacto:** Edition, Evidence, ExchangeItem, ExchangeRequest, Offer, OrderUnit, ProductImage, Refund, Reservation, ReturnItem, ReturnRequest, Shipment, SubstituteOffer, Track, TrackArtist.

## 8 Casos de uso

As regras relacionadas detalham decisões e exceções obrigatórias. Ator secundário comum: API/processos técnicos; nas mensagens, adaptador de teste.

### UC-001 Cadastrar conta

**Objetivo:** Cadastrar conta. **Ator principal:** Visitante. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** E-mail ainda não cadastrado. **Pós-condição:** Cadastro válido cria USER; e-mail duplicado falha; payload não promove papel; confirmação de e-mail é emitida.

**Fluxo principal:**

1. Informar nome/e-mail/senha.
2. validar.
3. persistir conta.
4. emitir confirmação.

**Alternativas/exceções:** Entrada inválida ou e-mail existente não cria segunda conta.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-001; RN-001, RN-002, RN-029, RN-032; TEST-001.

### UC-002 Autenticar e encerrar sessão

**Objetivo:** Autenticar e encerrar sessão. **Ator principal:** Cliente e equipe. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Conta ativa não bloqueada/encerrada. **Pós-condição:** Credenciais válidas autenticam no contexto correto; bloqueio/encerramento impedem login; logout revoga sessão; conta interna não compra.

**Fluxo principal:**

1. Validar credenciais/contexto e estado atual.
2. emitir sessão.
3. encerrar e revogar no logout.

**Alternativas/exceções:** Credenciais erradas e tokens revogados são negados sem dados sensíveis.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-002; RN-001, RN-028, RN-029, RN-032; TEST-002.

### UC-003 Recuperar senha

**Objetivo:** Recuperar senha. **Ator principal:** Titular. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Endereço de conta informado. **Pós-condição:** Reset válido em até 30 minutos altera senha uma vez e revoga todas as sessões; expirado/reutilizado falha.

**Fluxo principal:**

1. Solicitar link.
2. emitir mensagem de teste.
3. validar token.
4. trocar hash.
5. invalidar sessões.

**Alternativas/exceções:** Resposta pública genérica; falha de mensagem permite repetição sem perder conta.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-003; RN-003, RN-032, RN-033; TEST-003.

### UC-004 Gerenciar perfil e endereços

**Objetivo:** Gerenciar perfil e endereços. **Ator principal:** Cliente; ADMIN nas correções autorizadas. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Conta própria ativa ou permissão ADMIN. **Pós-condição:** Somente titular edita normalmente; OPERATOR consulta sem editar; endereço histórico não muda; novo e-mail depende de confirmação.

**Fluxo principal:**

1. Consultar perfil.
2. validar campos/posse.
3. salvar endereço ou iniciar mudança de e-mail.

**Alternativas/exceções:** Endereço inválido bloqueia compra; e-mail proposto não substitui atual antes da confirmação.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-004; RN-002, RN-032, RN-044; TEST-004.

### UC-005 Explorar pesquisar e filtrar

**Objetivo:** Explorar pesquisar e filtrar. **Ator principal:** Visitante e cliente. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Catálogo publicado. **Pós-condição:** Busca cobre título, artistas de edição/faixa e faixas; década usa ano da edição; filtros se combinam; desconhecidos não viram anos inventados.

**Fluxo principal:**

1. Informar busca/filtros.
2. listar resultados paginados.
3. abrir edição.

**Alternativas/exceções:** Sem resultados mostra lista vazia; edição inativa não permite nova compra.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-005; RN-004, RN-032, RN-036; TEST-005.

### UC-006 Consultar edição e ofertas

**Objetivo:** Consultar edição e ofertas. **Ator principal:** Visitante e cliente. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Edição acessível. **Pós-condição:** Página agrupa novos/usados; usados exibem preço, fotos, Goldmine e descrição; prévia pertence à faixa e é opcional.

**Fluxo principal:**

1. Abrir edição.
2. consultar metadados/faixas/ofertas.
3. selecionar exemplar específico.

**Alternativas/exceções:** Sem áudio ou link indisponível não impede catálogo; esgotado não é comprável.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-006; RN-004, RN-005, RN-026, RN-032, RN-036, RN-045; TEST-006.

### UC-007 Manter lista de desejos

**Objetivo:** Manter lista de desejos. **Ator principal:** Cliente. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Autenticação. **Pós-condição:** Adiciona/remove edição uma vez; não reserva nem ativa alerta implicitamente.

**Fluxo principal:**

1. Consultar lista.
2. adicionar ou remover edição.

**Alternativas/exceções:** Item repetido é idempotente; conta não acessa lista alheia.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-007; RN-032, RN-037; TEST-007.

### UC-008 Receber alertas de reposição

**Objetivo:** Receber alertas de reposição. **Ator principal:** Cliente; processo de mensagens. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Inscrição ativa por edição e NEW/USED/ANY. **Pós-condição:** Retorno de disponibilidade notifica todos compatíveis sem reservar; sucesso encerra; falha mantém inscrição; duplicação não envia duas vezes a mesma ativação.

**Fluxo principal:**

1. Inscrever.
2. detectar disponibilidade.
3. emitir mensagem.
4. confirmar entrega e encerrar.

**Alternativas/exceções:** Falha permite repetição; nova reposição após sucesso requer reinscrição.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-008; RN-024, RN-032, RN-037; TEST-008.

### UC-009 Avaliar compra verificada

**Objetivo:** Avaliar compra verificada. **Ator principal:** Cliente. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Pedido entregue com unidade mantida da edição. **Pós-condição:** Uma avaliação por cliente/edição/pedido; troca não cria outra; devolução integral da edição oculta e impede nova; edição de ocultada aguarda moderação.

**Fluxo principal:**

1. Verificar compra/unidades.
2. publicar avaliação.
3. permitir edição preservando histórico.

**Alternativas/exceções:** Compra não entregue ou totalmente desfeita é inelegível; outro autor não edita.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-009; RN-025, RN-032; TEST-009.

### UC-010 Manter carrinho e iniciar reserva

**Objetivo:** Manter carrinho e iniciar reserva. **Ator principal:** Visitante no carrinho; cliente no checkout. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Catálogo disponível; checkout exige conta apta e menos de 3 pendentes. **Pós-condição:** Carrinho não reserva; mescla avisada ao login; checkout único de 15 minutos reserva todos ou nenhum; outra aba retoma mesmo prazo.

**Fluxo principal:**

1. Editar carrinho.
2. mesclar login.
3. confirmar valores.
4. validar limite/saldo.
5. iniciar finalização atômica.

**Alternativas/exceções:** Falta de item aborta reserva completa; mudança comercial reinicia validação; endereço não reinicia prazo.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-010; RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-028, RN-032, RN-035; TEST-010.

### UC-011 Cotar e criar pedido

**Objetivo:** Cotar e criar pedido. **Ator principal:** Visitante para frete; cliente para pedido. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Checkout válido, e-mail confirmado e endereço atendido para pedido. **Pós-condição:** Cotação por CEP inclui cobertura; congela produtos/descontos no checkout; cria pedido Pix/boleto com novo prazo próprio; snapshots e cupom não se perdem.

**Fluxo principal:**

1. Cotar.
2. confirmar mudanças.
3. reservar.
4. validar endereço/e-mail.
5. criar pedido ou processar cartão conforme RF-012.

**Alternativas/exceções:** CEP não atendido impede pedido e conserva checkout até prazo; mudança de frete exige aceite.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-011; RN-002, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-013, RN-014, RN-016, RN-017, RN-018, RN-032, RN-033; TEST-011.

### UC-012 Simular pagamentos

**Objetivo:** Simular pagamentos. **Ator principal:** Cliente e simulador. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Checkout para cartão; cobrança ativa para Pix/boleto. **Pós-condição:** Recusa de cartão não cria pedido; Pix 30 min/boleto 2 dias; tardio estorna sem reativar; cobrança substituída nunca quita; falha de estorno permanece visível.

**Fluxo principal:**

1. Selecionar método.
2. executar simulador.
3. registrar tentativa.
4. confirmar atomicamente ou registrar pendência/recusa/estorno.

**Alternativas/exceções:** Repetição não duplica efeito; vencimento não depende do job; recusa não renova prazo.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-012; RN-010, RN-011, RN-012, RN-013, RN-017, RN-028, RN-032, RN-033, RN-039, RN-041; TEST-012.

### UC-013 Acompanhar pedidos

**Objetivo:** Acompanhar pedidos. **Ator principal:** Cliente. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Conta ativa e pedido próprio. **Pós-condição:** Exibe em separação, separado, envio, entrega, cobranças/estornos e rastreio manual; datas reais registradas, não estimadas.

**Fluxo principal:**

1. Listar pedidos.
2. consultar itens históricos, eventos e pós-venda.

**Alternativas/exceções:** Cliente bloqueado não entra; equipe mantém atendimento externo registrado.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-013; RN-015, RN-032, RN-033; TEST-013.

### UC-014 Cancelar pedidos e unidades indisponíveis

**Objetivo:** Cancelar pedidos e unidades indisponíveis. **Ator principal:** Cliente; equipe para indisponibilidade. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Pedido pendente/pago antes de em separação para cancelamento direto. **Pós-condição:** Cancelamento permitido libera estoque/cupom uma vez; pago estorna; indisponibilidade parcial preserva restantes e vencimento; parcial não recupera cupom/frete.

**Fluxo principal:**

1. Validar etapa/unidades.
2. cancelar integral ou parcial por motivo permitido.
3. ajustar cobrança/estoque.
4. registrar estorno se pago.

**Alternativas/exceções:** Em separação usa devolução; cobrança antiga paga após substituição gera estorno separado; falha financeira não reabre pedido.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-014; RN-011, RN-017, RN-019, RN-032, RN-039, RN-041; TEST-014.

### UC-015 Processar devoluções

**Objetivo:** Processar devoluções. **Ator principal:** Cliente; ADMIN/OPERATOR. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Unidades elegíveis na janela ou devolução antes de envio. **Pós-condição:** Parcial estorna líquido; integral inclui frete; postagem em 7 dias; exceção só ADMIN; estorno pós-venda só ADMIN; evidências privadas; rejeitado não volta ao estoque.

**Fluxo principal:**

1. Solicitar motivo/unidades.
2. analisar.
3. registrar retorno se necessário.
4. conferir.
5. autorizar estorno.
6. repor somente aptos.

**Alternativas/exceções:** Postagem ocorrida antes de análise muda para retorno após entrega; divergência pode rejeitar e exigir reenvio ao cliente.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-015; RN-018, RN-019, RN-020, RN-021, RN-028, RN-032, RN-034, RN-040, RN-041, RN-045; TEST-015.

### UC-016 Processar trocas

**Objetivo:** Processar trocas. **Ator principal:** Cliente; ADMIN/OPERATOR. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Unidades elegíveis e mesma edição para substituto. **Pós-condição:** Espera 30 dias após conferência, oferta 48h completas; aceite necessário; envio após inspeção; falha/expiração libera reserva; conversão não autoriza estorno; substituto inicia nova janela.

**Fluxo principal:**

1. Solicitar.
2. aprovar.
3. buscar/oferecer.
4. registrar aceite.
5. receber/conferir original.
6. enviar e entregar substituto.

**Alternativas/exceções:** Cliente pode converter em devolução; oferta no dia 29 mantém 48h; original rejeitado é reenviado por conta da loja.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-016; RN-020, RN-022, RN-023, RN-028, RN-032, RN-034, RN-035, RN-040, RN-041, RN-045; TEST-016.

### UC-017 Administrar catálogo e imagens

**Objetivo:** Administrar catálogo e imagens. **Ator principal:** ADMIN/OPERATOR. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Conta interna ativa. **Pós-condição:** Publicação valida campos/fotos mínimos; suporta artistas por faixa e anos distintos; histórico impede exclusão; inativação preserva reservas existentes; limites de imagem aplicados.

**Fluxo principal:**

1. Cadastrar metadados.
2. criar edição/ofertas.
3. anexar imagens.
4. validar publicação.
5. editar/inativar/excluir quando permitido.

**Alternativas/exceções:** Sem foto própria usado não publica; formato inválido rejeita; histórico impede exclusão física.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-017; RN-001, RN-004, RN-005, RN-026, RN-027, RN-032, RN-036, RN-045; TEST-017.

### UC-018 Controlar estoque

**Objetivo:** Controlar estoque. **Ator principal:** ADMIN/OPERATOR. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Oferta cadastrada. **Pós-condição:** Saldo nunca negativo; usado individual; ajuste não invade reservas; avaria resolve vínculo; limiar de novos por edição e zero usados alertam apenas no painel.

**Fluxo principal:**

1. Consultar físico/disponível.
2. validar ajuste.
3. registrar movimento.
4. recalcular alertas e eventos.

**Alternativas/exceções:** Reserva existente exige resolver compra antes de perda/avaria; repetição não duplica movimento.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-018; RN-001, RN-004, RN-006, RN-013, RN-019, RN-021, RN-022, RN-024, RN-027, RN-032, RN-035, RN-038, RN-039; TEST-018.

### UC-019 Administrar promoções e cupons

**Objetivo:** Administrar promoções e cupons. **Ator principal:** ADMIN. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Configuração válida. **Pós-condição:** Menor promoção vence; cupom pode acumular se autorizado; restrições por produto/edição/gênero; reserva no checkout respeita limites concorrentes; devolução não restitui uso.

**Fluxo principal:**

1. Cadastrar regras.
2. validar período/limites.
3. calcular elegíveis.
4. aplicar promoção e cupom.
5. registrar uso.

**Alternativas/exceções:** Cupom inaplicável informa motivo; fixo não gera negativo/crédito; frete permanece.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-019; RN-008, RN-016, RN-017, RN-018, RN-032; TEST-019.

### UC-020 Administrar logística e atendimentos

**Objetivo:** Administrar logística e atendimentos. **Ator principal:** ADMIN/OPERATOR. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Pedido pago ou atendimento autorizado. **Pós-condição:** Estado em separação bloqueia cancelamento direto; remessa original única; retorno/substituto têm rastreios próprios; interação externa de bloqueado fica auditada.

**Fluxo principal:**

1. Consultar pedido.
2. transicionar etapa válida.
3. registrar envio/entrega e decisões comunicadas.

**Alternativas/exceções:** Atualização concorrente revalida; OPERATOR não autoriza estorno/exceção financeira.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-020; RN-001, RN-015, RN-019, RN-023, RN-032, RN-040; TEST-020.

### UC-021 Consultar e administrar clientes

**Objetivo:** Consultar e administrar clientes. **Ator principal:** ADMIN; OPERATOR somente consulta. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Conta interna ativa. **Pós-condição:** OPERATOR não altera/bloqueia; ADMIN bloqueia login, checkout e pendentes atomicamente, preservando pagos e atendimento; correção de e-mail exige confirmação.

**Fluxo principal:**

1. Consultar cadastro/histórico.
2. ADMIN corrige ou bloqueia/desbloqueia.
3. registrar auditoria.

**Alternativas/exceções:** Reativação voluntária não remove bloqueio; tokens antigos não contornam estado da conta.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-021; RN-001, RN-028, RN-032; TEST-021.

### UC-022 Moderar avaliações

**Objetivo:** Moderar avaliações. **Ator principal:** ADMIN/OPERATOR. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Avaliação existente. **Pós-condição:** Ocultar preserva histórico; edição pelo autor não desfaz moderação; liberação explícita revalida elegibilidade de compra.

**Fluxo principal:**

1. Consultar.
2. ocultar com motivo.
3. analisar nova versão.
4. liberar quando válida.

**Alternativas/exceções:** Devolução de todas as unidades não pode ser contornada por liberação manual.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-022; RN-001, RN-025, RN-032; TEST-022.

### UC-023 Consultar relatórios

**Objetivo:** Consultar relatórios. **Ator principal:** ADMIN. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Eventos comerciais registrados. **Pós-condição:** Pagamento setembro/estorno outubro ficam em períodos próprios; ticket setembro usa líquido atualizado; gênero principal evita duplicação; unidades gratuitas mantidas contam; troca não é venda nova.

**Fluxo principal:**

1. Selecionar período.
2. apurar eventos financeiros, coorte de ticket, unidades e rankings.
3. apresentar instante da consulta.

**Alternativas/exceções:** Período sem pedidos não divide por zero; volume/meta de desempenho permanecem pendentes.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-023; RN-018, RN-021, RN-030, RN-032, RN-034; TEST-023.

### UC-024 Processar notificações de teste

**Objetivo:** Processar notificações de teste. **Ator principal:** Processo técnico; titular como destinatário. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Evento de acesso/comercial ou reposição. **Pós-condição:** Todos os eventos de RN-042 geram mensagens; falha não bloqueia negócio; repetição é auditada; conteúdo de acesso e evidências não é público.

**Fluxo principal:**

1. Persistir evento.
2. entregar pelo adaptador de teste.
3. registrar sucesso/falha.
4. repetir quando necessário.

**Alternativas/exceções:** Falha de reposição não encerra inscrição; serviço real de produção não é requerido.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-024; RN-003, RN-024, RN-032, RN-033, RN-042; TEST-024.

### UC-025 Executar backup e restaurar

**Objetivo:** Executar backup e restaurar. **Ator principal:** Operação técnica. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Ambiente e parâmetros definidos. **Pós-condição:** Backup diário automático; recuperação testada periodicamente; política de retenção/destino não inventada; restauração de teste preserva origem.

**Fluxo principal:**

1. Capturar conjunto consistente.
2. validar.
3. aplicar retenção aprovada.
4. restaurar isoladamente e comparar dados/arquivos.

**Alternativas/exceções:** Falha não elimina último backup íntegro; ausência de parâmetros impede declarar aceite concluído.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-025; RN-031, RN-032; TEST-025.

### UC-026 Gerenciar contas internas

**Objetivo:** Gerenciar contas internas. **Ator principal:** ADMIN. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Administrador ativo. **Pós-condição:** Criar/editar/bloquear ADMIN/OPERATOR; impedir remoção do último ADMIN ativo; contas internas não compram; e-mail alterado só após confirmar novo.

**Fluxo principal:**

1. Validar administrador e último ativo.
2. persistir conta/contexto/permissões.
3. auditar.

**Alternativas/exceções:** Concorrência entre dois bloqueios não pode eliminar todos os administradores.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-026; RN-001, RN-029, RN-032, RN-044; TEST-032.

### UC-027 Encerrar e reativar conta

**Objetivo:** Encerrar e reativar conta. **Ator principal:** Cliente. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Conta própria; reativação somente encerrada sem bloqueio. **Pós-condição:** Encerrar revoga acesso, cancela checkout/pendentes e preserva pagos/histórico; reativação confirma e-mail; bloqueio prevalece; retenção permanece pendente.

**Fluxo principal:**

1. Solicitar encerramento.
2. resolver pendências atomicamente.
3. posteriormente solicitar link e reativar se elegível.

**Alternativas/exceções:** Não apagar histórico nem contornar bloqueio; dados fora da retenção exigem política definida.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-027; RN-032, RN-043; TEST-033.

### UC-028 Confirmar e alterar e-mail

**Objetivo:** Confirmar e alterar e-mail. **Ator principal:** Titular; ADMIN inicia correção. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Token apropriado ou conta autorizada. **Pós-condição:** Confirmação inicial em 24h com reenvio; primeiro pedido exige confirmação; alteração mantém endereço anterior até confirmar novo; unicidade validada.

**Fluxo principal:**

1. Emitir link pelo canal de teste.
2. validar propósito/prazo.
3. confirmar e-mail e registrar consumo.

**Alternativas/exceções:** Token de reset não confirma e-mail; repetição/expiração não altera conta. Prazo específico de alteração/reativação em PD-005.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-028; RN-002, RN-032, RN-044; TEST-034.

### UC-029 Configurar frete e cobertura

**Objetivo:** Configurar frete e cobertura. **Ator principal:** ADMIN. **Gatilho:** solicitação da operação ou evento previsto.

**Pré-condição:** Tabela de faixas sem sobreposição ambígua. **Pós-condição:** Somente ADMIN altera valores/prazos/cobertura; faixas podem ser não atendidas; edição da tabela não muda snapshot de pedido criado.

**Fluxo principal:**

1. Cadastrar faixas e valores.
2. validar.
3. publicar versão.
4. usar na cotação.

**Alternativas/exceções:** OPERATOR negado; configuração ausente não vira frete gratuito nem prazo fictício.

**Falha:** preservar invariantes e histórico; efeitos comerciais atômicos não ficam pela metade. Notificação/estorno falhos mantêm estado explícito para repetição, sem fingir reversão do evento principal.

**Rastreabilidade:** RF-029; RN-014, RN-032; TEST-035.

## 9 Modelo conceitual

Edição agrupa ofertas novas por quantidade e usados individuais; faixa possui artistas e prévia. Cliente mantém carrinho sem reserva. Checkout único reúne preços congelados e reservas; pedido preserva snapshots, cobranças e unidades comerciais. Essas unidades permanecem rastreáveis após trocas e devoluções. Contas internas têm contexto distinto de compra. Atendimento coordena postagem, evidência, inspeção, oferta de substituto, remessa e estorno autorizado.

Dinheiro, endereço histórico, classificação e alocação unitária são objetos de valor. Invariantes: saldo não negativo; usado único; no máximo 3 pendentes e um checkout ativo por cliente; um atendimento ativo por unidade; nenhum estorno duplicado; último ADMIN preservado. [Domínio](docs/diagrams/domain.md).

## 10 Modelo inicial de dados

[Tabelas, chaves, restrições e índices](docs/architecture/data-model.md), [ER de catálogo/contas](docs/diagrams/er-catalog.md) e [ER comercial](docs/diagrams/er-commerce.md). Modelo é proposta documental, não migration. Constraints locais não substituem transações para somas entre linhas.

## 11 Arquitetura proposta

API REST única com regras no servidor e adaptadores substituíveis. Monólito modular em apresentação, aplicação, persistência e dados ratificado pelo responsável na TASK-001, sem atribuir essa escolha técnica ao PDF. Operações transacionais síncronas; notificações e reconciliação assíncronas persistentes. Detalhes: [arquitetura](docs/architecture/architecture.md), [componentes](docs/diagrams/components.md), [sequências](docs/diagrams/sequences.md), [estados](docs/diagrams/states.md).

## 12 API

[Contratos por operação](docs/architecture/api.md) definem métodos, entradas, saídas, atores e erros. Checkout é recurso distinto do carrinho; cartão pode possuir tentativa antes de pedido. Eventos de pagamento repetidos/tardios e autorização de estorno têm contratos explícitos.

## 13 Tecnologias e decisões

| Tecnologia/decisão | Finalidade e justificativa | Limitações e alternativa | Situação |
| --- | --- | --- | --- |
| React Native/Expo | Aplicativo cliente previsto no PDF | Plataforma/versão ainda pendentes; app nativo exigiria revisão | Definido no PDF R10-P6 |
| API REST compartilhada | Mesmas regras web/mobile | Exige contratos e autorização no servidor | Definido R01-P1 |
| React/Vite, Express/TypeScript, Prisma/PostgreSQL | Proposta herdada para UI, aplicação e transações | Requisitos oficiais consultados e escolha ratificada na TASK-001; instalação/build ainda dependem da estrutura | ACCEPTED, ADR-001; versões/limites em parâmetros |
| Monólito modular | Coordenação transacional e menor número de serviços | Fronteiras exigem disciplina; serviços separados aumentam operação | ACCEPTED, ADR-001; versões/limites em parâmetros |
| Simulador local de pagamento | Reproduzir falhas sem gateway pago | Não valida fornecedor real; sandbox externo futuro | Definido R14-P7, ADR-002 |
| Outbox e snapshots | Repetição de eventos e histórico exato | Exigem deduplicação e reconciliação; fila externa é alternativa | ACCEPTED, ADR-004; parâmetros ratificados |

TASK-001 ratificou os seis ADRs, preservando histórico e IDs. Requisitos de versões foram consultados em fontes oficiais; instalação/build ainda dependem da estrutura, sem aprovação antecipada. Propostas detalhadas em documentos anteriores devem ser lidas com os parâmetros ratificados e sua origem posterior.

- [ADR-001-camadas-e-clientes](docs/adr/ADR-001-camadas-e-clientes.md).
- [ADR-002-simulacoes-e-ambiente-local](docs/adr/ADR-002-simulacoes-e-ambiente-local.md).
- [ADR-003-reservas-e-transacoes](docs/adr/ADR-003-reservas-e-transacoes.md).
- [ADR-004-eventos-e-valores-historicos](docs/adr/ADR-004-eventos-e-valores-historicos.md).
- [ADR-005-sessoes-e-ferramenta-restrita](docs/adr/ADR-005-sessoes-e-ferramenta-restrita.md).
- [ADR-006-arquivos-e-backup](docs/adr/ADR-006-arquivos-e-backup.md).

## 14 Segurança

Autorização por papel e propriedade em toda operação. OPERATOR não herda poderes ADMIN; contas internas não compram. Bloqueio/encerramento revogam acesso. Confirmação/reset têm propósitos distintos e consumo seguro. Evidências privadas não usam URLs públicas do catálogo. Segredos fora de logs; upload validado; condições comerciais revalidadas no servidor. Transporte/armazenamento de credenciais serão definidos em ADR-005 sem presumir exceção HTTP.

## 15 Estratégia de testes

[Cenários TEST-001 a TEST-035](docs/architecture/testing.md): unitários, integração em banco de teste, API, concorrência real, ponta a ponta, acessibilidade e recuperação. Relógio controlado cobre limites sem esperar dias reais. Nenhum teste de software foi executado: só há planejamento.

## 16 Riscos

| Risco | Categoria | Probabilidade / impacto | Mitigação |
| --- | --- | --- | --- |
| Escopo extenso para dupla/prazo desconhecido | Cronograma | Alta / alto | Incrementos e checkpoints; redução somente autorizada |
| Reintroduzir regras do pacote anterior | Requisitos | Alta / alto | Matriz de 98 respostas e verificação de termos obsoletos |
| Corridas estoque/cupom/pagamento | Integridade | Alta / alto | Transações, idempotência, teste concorrente |
| Acesso a evidência/token ou privilégio indevido | Segurança | Média / alto | Matriz de papéis, contexto de conta e testes negativos |
| Ambiente/metas/retenção não definidos | Operação | Alta / médio | PDs específicas antes da tarefa dependente |
| Simulação tomada como integração real | Integração | Média / médio | Identificar simulador e registrar limites de validação |

## 17 Roadmap

| Fase | Objetivo e entregáveis | Dependência | Conclusão |
| --- | --- | --- | --- |
| PHASE-01 | Decisões técnicas, estrutura, contas, e-mail e acesso | TASK-001 | TASK-007 valida fundação |
| PHASE-02 | Catálogo, estoque, desejos, avaliações e promoções | TASK-007 | TASK-015 valida módulos, integrações futuras explícitas |
| PHASE-03 | Checkout, pedidos, pagamento, frete, logística e ciclo de conta | TASK-015 | TASK-024 valida compra integrada |
| PHASE-04 | Pós-venda, relatórios, backup e segurança | TASK-024 | TASK-032 valida operação completa |
| PHASE-05 | Aceitação, desempenho, restauração e documentação operacional | TASK-032 | TASK-037 valida evidências e pendências finais |

## 18 Matriz de rastreabilidade

| RF | RN | RNF | UC | Entidades | API | Teste | TASK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RF-001 | RN-001, RN-002, RN-029, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-001 | User, EmailToken | API-001.* | TEST-001 | TASK-004, TASK-005, TASK-006, TASK-033 |
| RF-002 | RN-001, RN-028, RN-029, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-002 | User, Session | API-002.* | TEST-002 | TASK-004, TASK-006, TASK-022, TASK-033 |
| RF-003 | RN-003, RN-032, RN-033 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-003 | User, PasswordReset, Session, DemoMessage | API-003.* | TEST-003 | TASK-005, TASK-006, TASK-033 |
| RF-004 | RN-002, RN-032, RN-044 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-004 | User, Address, EmailToken | API-004.* | TEST-004 | TASK-004, TASK-006, TASK-022, TASK-033 |
| RF-005 | RN-004, RN-032, RN-036 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008 | UC-005 | Edition, Artist, Track, TrackArtist, Genre, Offer | API-005.* | TEST-005 | TASK-008, TASK-010, TASK-011, TASK-033 |
| RF-006 | RN-004, RN-005, RN-026, RN-032, RN-036, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010 | UC-006 | Edition, Track, Offer, ProductImage | API-006.* | TEST-006 | TASK-008, TASK-010, TASK-011, TASK-033 |
| RF-007 | RN-032, RN-037 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-007 | WishlistEntry, Edition, User | API-007.* | TEST-007 | TASK-012, TASK-033 |
| RF-008 | RN-024, RN-032, RN-037 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011 | UC-008 | AvailabilityAlert, DomainEvent, DemoMessage, Offer | API-008.* | TEST-008 | TASK-012, TASK-023, TASK-033 |
| RF-009 | RN-025, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-009 | Review, ReviewRevision, OrderItem, OrderUnit | API-009.* | TEST-009 | TASK-013, TASK-023, TASK-026, TASK-033 |
| RF-010 | RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-028, RN-032, RN-035 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011 | UC-010 | Cart, CartItem, Checkout, CheckoutItem, Reservation | API-010.* | TEST-010 | TASK-016, TASK-017, TASK-018, TASK-023, TASK-033, TASK-034 |
| RF-011 | RN-002, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-013, RN-014, RN-016, RN-017, RN-018, RN-032, RN-033 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011 | UC-011 | Checkout, Order, OrderItem, CouponUsage, FreightRate, Reservation | API-011.* | TEST-011 | TASK-018, TASK-020, TASK-033, TASK-034 |
| RF-012 | RN-010, RN-011, RN-012, RN-013, RN-017, RN-028, RN-032, RN-033, RN-039, RN-041 | RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-012 | PaymentAttempt, PaymentCharge, Checkout, Order, Refund, RefundAttempt | API-012.* | TEST-012 | TASK-019, TASK-020, TASK-023, TASK-025, TASK-033, TASK-034 |
| RF-013 | RN-015, RN-032, RN-033 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-013 | Order, OrderItem, OrderStatusEvent, Shipment, Refund | API-013.* | TEST-013 | TASK-021, TASK-033 |
| RF-014 | RN-011, RN-017, RN-019, RN-032, RN-039, RN-041 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-014 | CancellationRequest, OrderUnit, PaymentCharge, Refund, StockMovement | API-014.* | TEST-014 | TASK-019, TASK-022, TASK-025, TASK-028, TASK-033 |
| RF-015 | RN-018, RN-019, RN-020, RN-021, RN-028, RN-032, RN-034, RN-040, RN-041, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010, RNF-011 | UC-015 | ReturnRequest, ReturnItem, OrderUnit, Refund, Evidence, Shipment | API-015.* | TEST-015 | TASK-026, TASK-028, TASK-033 |
| RF-016 | RN-020, RN-022, RN-023, RN-028, RN-032, RN-034, RN-035, RN-040, RN-041, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010, RNF-011 | UC-016 | ExchangeRequest, ExchangeItem, SubstituteOffer, OrderUnit, Reservation, Shipment, Evidence | API-016.* | TEST-016 | TASK-027, TASK-028, TASK-033 |
| RF-017 | RN-001, RN-004, RN-005, RN-026, RN-027, RN-032, RN-036, RN-045 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010 | UC-017 | Edition, Track, TrackArtist, Offer, ProductImage | API-017.* | TEST-017 | TASK-008, TASK-009, TASK-023, TASK-033 |
| RF-018 | RN-001, RN-004, RN-006, RN-013, RN-019, RN-021, RN-022, RN-024, RN-027, RN-032, RN-035, RN-038, RN-039 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-018 | Offer, StockMovement, Reservation, Edition | API-018.* | TEST-018 | TASK-009, TASK-016, TASK-019, TASK-023, TASK-025, TASK-026, TASK-027, TASK-033, TASK-034 |
| RF-019 | RN-008, RN-016, RN-017, RN-018, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-019 | Promotion, Coupon, CouponTarget, CouponUsage | API-019.* | TEST-019 | TASK-014, TASK-016, TASK-018, TASK-019, TASK-023, TASK-033, TASK-034 |
| RF-020 | RN-001, RN-015, RN-019, RN-023, RN-032, RN-040 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-020 | Order, OrderStatusEvent, Shipment, ExternalInteraction | API-020.* | TEST-020 | TASK-021, TASK-025, TASK-026, TASK-027, TASK-033 |
| RF-021 | RN-001, RN-028, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-021 | User, Session, Checkout, Order, AuditLog | API-021.* | TEST-021 | TASK-022, TASK-023, TASK-033, TASK-034 |
| RF-022 | RN-001, RN-025, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-022 | Review, ReviewRevision, AuditLog | API-022.* | TEST-022 | TASK-013, TASK-026, TASK-033 |
| RF-023 | RN-018, RN-021, RN-030, RN-032, RN-034 | RNF-001, RNF-003, RNF-004, RNF-005 | UC-023 | Order, OrderUnit, Refund, FinancialEvent, Genre | API-023.* | TEST-023 | TASK-029, TASK-033, TASK-034 |
| RF-024 | RN-003, RN-024, RN-032, RN-033, RN-042 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-024 | DomainEvent, DemoMessage, EmailToken | API-024.* | TEST-024 | TASK-005, TASK-012, TASK-019, TASK-021, TASK-025, TASK-026, TASK-027, TASK-033 |
| RF-025 | RN-031, RN-032 | RNF-002, RNF-009, RNF-011, RNF-012 | UC-025 | BackupRun, ProductImage, Evidence | API-025.* | TEST-025 | TASK-030, TASK-035 |
| RF-026 | RN-001, RN-029, RN-032, RN-044 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-026 | User, Session, EmailToken, AuditLog | API-026.* | TEST-032 | TASK-004, TASK-005, TASK-006, TASK-033 |
| RF-027 | RN-032, RN-043 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-027 | User, Session, EmailToken, Checkout, Order | API-027.* | TEST-033 | TASK-022, TASK-023, TASK-033 |
| RF-028 | RN-002, RN-032, RN-044 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011 | UC-028 | User, EmailToken, DemoMessage | API-028.* | TEST-034 | TASK-004, TASK-005, TASK-006, TASK-022, TASK-033 |
| RF-029 | RN-014, RN-032 | RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008 | UC-029 | FreightRate, CepRange, AuditLog | API-029.* | TEST-035 | TASK-018, TASK-033 |

## 19 Pendências

| ID | Tema e condição de resolução | Itens afetados |
| --- | --- | --- |
| PD-001 | **PARCIALMENTE RESOLVIDA — Prazo e critérios acadêmicos:** Instrução posterior do responsável em 2026-10-25 fixa entrega parcial em 2026-10-26 às 13:20 (America/Sao_Paulo), com 50% das 37 TASKs: pelo menos 19 DONE. Trabalho disponível somente no domingo. O PDF não informava esse prazo; rubrica adicional e prazo dos 100% continuam pendentes. Origem e divergência histórica preservadas em docs/architecture/parametros.md. | TASK-036, TASK-037 |
| PD-002 | **PENDENTE DE DECISÃO — Ambiente e plataformas:** Confirmar plataforma mobile, navegadores, publicação/local, infraestrutura e transporte. Android exclusivo, LAN e HTTP não são fatos aprovados. | TASK-001, TASK-002, TASK-033 |
| PD-003 | **PENDENTE DE DECISÃO — Exigências adicionais:** Confirmar rubrica e eventuais exigências formais de acessibilidade/implantação; preservar critérios de projeto já definidos. | TASK-033, TASK-037 |
| PD-004 | **PENDENTE DE DECISÃO — Tabela de frete:** Definir faixas de CEP/região, cobertura, preços e prazos; não inventar valores ou cobertura nacional obrigatória. | TASK-018 |
| PD-005 | **PENDENTE DE DECISÃO — Parâmetros técnicos:** Ratificar stack herdada, versões, sessão, hash, proteção das mensagens, armazenamento, prazo de links de alteração/reativação e estratégia transacional. Reset 30min, confirmação inicial 24h e limites de imagens já decididos. | TASK-001 e módulos dependentes |
| PD-006 | **PENDENTE DE DECISÃO — Vocabulários residuais:** Escala numérica de avaliação, enumeração Goldmine e tipos de desconto das promoções não especificados. Sobreposição, acumulação, alerta NEW/USED/ANY e estoque baixo estão resolvidos e não devem ser reabertos. | TASK-008, TASK-013, TASK-014 |
| PD-007 | **PENDENTE DE DECISÃO — Volume e metas de desempenho:** Definir tamanhos de dados, usuários simultâneos, metas e método de aferição. Números da versão anterior não são requisitos. | TASK-034 |
| PD-008 | **PENDENTE DE DECISÃO — Retenção e backup:** Definir retenção de dados pessoais/anonimização e condições após retenção; definir retenção de backups, frequência dos testes e destino. | TASK-022, TASK-030, TASK-035 |
| PD-009 | **PENDENTE DE DECISÃO — Devoluções integrais em solicitações parciais sucessivas:** PDF distingue devolução integral/parcial, mas não explicita quando devolver frete se várias solicitações parciais somarem o pedido inteiro. Definir antes desse caso; não presumir reembolso cumulativo de frete. | TASK-026 |

As pendências não autorizam inventar requisitos. [Parâmetros](docs/architecture/parametros.md) separam os valores já decididos daqueles ainda em aberto.
