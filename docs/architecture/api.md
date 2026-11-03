# Contratos iniciais da API

Contratos de referência; estado da implementação em TASKS.md. Base `/api/v1`, exceto LOCAL. Os IDs existentes são preservados; operações sem fundamento na fonte final são DEPRECATED e não devem ser implementadas.

## Convenções

### Detalhamento de catálogo e mídia — TASK-008

PD-006 e limites técnicos estão em parâmetros, por decisão delegada posterior ao PDF. Campos priceCents, minPrice e maxPrice são centavos inteiros. artist/genre recebem IDs; discCondition/sleeveCondition recebem códigos Goldmine. Filtros de preço, condições e disponibilidade aplicam-se à mesma oferta; o resumo retornado considera essas ofertas correspondentes. Sem oferta/preço correspondente não há correspondência ao filtro monetário. Sem filtro monetário/conservação, edição publicada sem ofertas pode aparecer como indisponível. Ordenação estável por título/id e paginação limitada a 100 itens. Década usa somente editionYear, sem preencher anos desconhecidos.

Edição/oferta são criadas como rascunho (active=false); PATCH com active=true publica somente após validar metadados e imagem própria. Atualização de oferta requer version, retornando 409 em revisão desatualizada. stockOnHand só é aceito na criação como estoque inicial de API-017.04; não é editável por PATCH de metadados. Criação de oferta exige Idempotency-Key, escopo por usuário/operação, com rejeição de payload diferente. API-018 adiciona ajustes físicos e livro de movimentações; reservas comerciais pertencem aos incrementos posteriores.

Upload de imagem usa corpo binário com Content-Type image/jpeg, image/png ou image/webp; description e position opcional são query parameters codificados na URL. Não se usa nome de arquivo do cliente. Limites e conteúdo são conferidos no servidor; retorno contém chave/URL pública imutável, hash e metadados da imagem normalizada. Até dez imagens por edição e oito por usado; novo usa imagem da edição. Remover última foto de entidade publicada é rejeitado. Raiz pública dedicada não expõe diretórios de código, banco, caixa técnica ou evidências privadas. Arquivos imutáveis sem referência aguardam coleta coordenada ao backup/retenção; remover referência não apaga silenciosamente bytes preservados.

Administração exige sessão web ativa ADMIN/OPERATOR, HTTPS, Origin e CSRF nas mutações; USER e cliente mobile são rejeitados. Rotas de catálogo próprias mantêm guardas dentro do módulo sem alterar a autenticação existente. Exclusão respeita FKs restritivas; vínculos comerciais dos incrementos posteriores continuam condição de integração explicitamente testada nos checkpoints correspondentes, sem inventar pedidos/reservas nesta etapa.

Dinheiro em centavos; datas com fuso; relógio do servidor controla prazos. Mutação crítica exige chave idempotente e revisão quando indicada: repetição do mesmo payload retorna efeito anterior; payload diferente com mesma chave é conflito. Totais são calculados no servidor.

Erros comuns: 401 sessão ausente/revogada; 403 papel, bloqueio ou propriedade; 404 recurso ausente/oculto por propriedade; 409 estado/saldo/versão; 422 entrada inválida; 429 limite técnico; 500 erro sem segredo. Envelope: code, message, fieldErrors e correlationId. Consulta paginada não expõe dados de outro cliente.

Prefixo `/admin` é administrativo, não sinônimo de papel ADMIN: catálogo/estoque/logística/moderação/atendimento permitem OPERATOR; configuração de frete, promoções/cupons, relatórios e contas internas exigem ADMIN. Consulta de clientes permite equipe; edição/bloqueio somente ADMIN. Estorno de pós-venda e exceções somente ADMIN. Cliente em `/me` acessa somente próprios recursos. Contas internas não usam checkout. Bloqueado/encerrado não usa sessão antiga. Rotas de autenticação e confirmação validam propósito de token.

`/demo` é proposta de adaptador de mensagens local protegido, não papel comercial. Canal de teste e acesso técnico serão ratificados no ADR-005. Eventos LOCAL do simulador não são endpoints financeiros públicos. API-012.01/02 são comandos de cenário de teste, nunca integração real. Criação por cartão também exige e-mail confirmado e os mesmos controles de conta/endereço do pedido Pix/boleto. Visitante consulta catálogo/frete e mantém carrinho sem reserva; armazenamento e mescla do carrinho visitante são descritos na arquitetura.

Operações de recibo/inspeção não autorizam estorno implicitamente. Estorno tardio pode existir sem pedido. Evidência privada exige autorização em cada download. Verificações comuns somam-se às respostas por linha.

## RF-001 Cadastrar conta

**Atores:** Visitante. **Pré-condição:** E-mail ainda não cadastrado.

**Validações:** Cadastro válido cria USER; e-mail duplicado falha; payload não promove papel; confirmação de e-mail é emitida.

**Rastreabilidade:** UC-001; RN-001, RN-002, RN-029, RN-032; TEST-001; TASK-004, TASK-005, TASK-006, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-001.01 | POST | /auth/register | name, email, password | id, name, email, role=USER | 201; 409 e-mail existente |

## RF-002 Autenticar e encerrar sessão

**Atores:** Cliente e equipe. **Pré-condição:** Conta ativa não bloqueada/encerrada.

**Validações:** Credenciais válidas autenticam no contexto correto; bloqueio/encerramento impedem login; logout revoga sessão; conta interna não compra.

**Rastreabilidade:** UC-002; RN-001, RN-028, RN-029, RN-032; TEST-002; TASK-004, TASK-006, TASK-022, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-002.01 | POST | /auth/login | email, password | credenciais de sessão, usuário, bloqueio | 200; 401 credenciais inválidas |
| API-002.02 | POST | /auth/refresh | credencial de renovação | nova credencial | 200; 401 revogada/expirada |
| API-002.03 | POST | /auth/logout | credencial de renovação | sem corpo | 204 |

## RF-003 Recuperar senha

**Atores:** Titular. **Pré-condição:** Endereço de conta informado.

**Validações:** Reset válido em até 30 minutos altera senha uma vez e revoga todas as sessões; expirado/reutilizado falha.

**Rastreabilidade:** UC-003; RN-003, RN-032, RN-033; TEST-003; TASK-005, TASK-006, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-003.01 | POST | /auth/password-reset | email | confirmação genérica | 202 |
| API-003.02 | POST | /auth/password-reset/confirm | token, newPassword | confirmação sem token | 200; 422 token inválido/expirado |

## RF-004 Gerenciar perfil e endereços

**Atores:** Cliente; ADMIN nas correções autorizadas. **Pré-condição:** Conta própria ativa ou permissão ADMIN.

**Validações:** Somente titular edita normalmente; OPERATOR consulta sem editar; endereço histórico não muda; novo e-mail depende de confirmação.

**Rastreabilidade:** UC-004; RN-002, RN-032, RN-044; TEST-004; TASK-004, TASK-006, TASK-022, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-004.01 | GET | /me | sessão | perfil sem hash | 200 |
| API-004.02 | PATCH | /me | name e campos de perfil; e-mail via RF-028 | perfil atualizado sem alterar e-mail diretamente | 200; 422 dados |
| API-004.03 | GET | /me/addresses | sessão | endereços próprios | 200 |
| API-004.04 | POST | /me/addresses | destinatário, CEP, UF, cidade, bairro, rua, número, complemento opcional | endereço com id | 201 |
| API-004.05 | PATCH | /me/addresses/{id} | campos de endereço | endereço atualizado | 200 |
| API-004.06 | DELETE | /me/addresses/{id} | id próprio | sem corpo; snapshots mantidos | 204 |

## RF-005 Explorar pesquisar e filtrar

**Atores:** Visitante e cliente. **Pré-condição:** Catálogo publicado.

**Validações:** Busca cobre título, artistas de edição/faixa e faixas; década usa ano da edição; filtros se combinam; desconhecidos não viram anos inventados.

**Rastreabilidade:** UC-005; RN-004, RN-032, RN-036; TEST-005; TASK-008, TASK-010, TASK-011, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-005.01 | GET | /editions | q, artist, genre, decade, minPrice, maxPrice, discCondition, sleeveCondition, available, page, pageSize | edições, disponibilidade, paginação | 200 |
| API-005.02 | GET | /catalog/filters | nenhum | artistas, gêneros e opções de filtro | 200 |

## RF-006 Consultar edição e ofertas

**Atores:** Visitante e cliente. **Pré-condição:** Edição acessível.

**Validações:** Página agrupa novos/usados; usados exibem preço, fotos, Goldmine e descrição; prévia pertence à faixa e é opcional.

**Rastreabilidade:** UC-006; RN-004, RN-005, RN-026, RN-032, RN-036, RN-045; TEST-006; TASK-008, TASK-010, TASK-011, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-006.01 | GET | /editions/{id} | id | metadados, faixas, ofertas, fotos, prévia opcional | 200; 404 indisponível para consulta |

## RF-007 Manter lista de desejos

**Atores:** Cliente. **Pré-condição:** Autenticação.

**Validações:** Adiciona/remove edição uma vez; não reserva nem ativa alerta implicitamente.

**Rastreabilidade:** UC-007; RN-032, RN-037; TEST-007; TASK-012, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-007.01 | GET | /me/wishlist | sessão | edições desejadas | 200 |
| API-007.02 | PUT | /me/wishlist/{editionId} | edição | entrada idempotente | 200 |
| API-007.03 | DELETE | /me/wishlist/{editionId} | edição | sem corpo | 204 |

## RF-008 Receber alertas de reposição

**Atores:** Cliente; processo de mensagens. **Pré-condição:** Inscrição ativa por edição e NEW/USED/ANY.

**Validações:** Retorno de disponibilidade notifica todos compatíveis sem reservar; sucesso encerra; falha mantém inscrição; duplicação não envia duas vezes a mesma ativação.

**Rastreabilidade:** UC-008; RN-024, RN-032, RN-037; TEST-008; TASK-012, TASK-023, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-008.01 | GET | /me/availability-alerts | sessão | alertas e estado | 200 |
| API-008.02 | POST | /me/availability-alerts | editionId, kind NEW/USED/ANY | inscrição ativa | 201; 409 equivalente ativa |
| API-008.03 | DELETE | /me/availability-alerts/{id} | id próprio | sem corpo, inscrição encerrada | 204 |

Contrato de desejos/alertas (TASK-012): GET aceita apenas page/pageSize, padrão 1/20,
máximo 100 itens por página; devolve `{items,page,pageSize,total}`. Desejo contém
`id,edition:{id,title,active},createdAt`. PUT aceita corpo vazio e é idempotente;
DELETE não remove inscrição de alerta. Alerta contém `id,edition,kind,status,
createdAt,closedAt,delivery`, com status ACTIVE/DELIVERED/CANCELLED e delivery
nulo ou `{status:PENDING|FAILED|DELIVERED,attempts}`. POST aceita somente
editionId/kind; 409 ALERT_ALREADY_ACTIVE para ativação equivalente ainda ativa.
Sucesso ou cancelamento preserva o ID histórico; nova inscrição tem novo ID.
DELETE é idempotente para ativação própria já encerrada e retorna 404 para ID
alheio. Conta interna não usa esses recursos. Exige sessão CUSTOMER, HTTPS,
origem/CSRF web ou bearer mobile pelos mesmos guardas de contas; PUT também
consta no preflight. Nunca retorna credenciais, corpo de mensagem ou dados de
outro cliente. Desejar não inscreve em alerta; nenhum dos dois reserva estoque.

O evento congela o público elegível na própria transação de retorno de
disponibilidade NEW/USED; ANY corresponde a ambas. Quem se inscreve depois não
recebe evento antigo, mesmo com timestamps iguais. Uma ativação tem no máximo
uma mensagem; falha mantém ACTIVE e mensagem FAILED para retry, entrega local
confirma mensagem/encerra inscrição atomicamente. Cancelamento impede entrega
pendente. Nesta fase, retorno usa a disponibilidade pública física das ofertas
ativas; a integração real das reservas/liberações comerciais permanece TASK-023.
Workers dedicados não consomem tipos futuros/desconhecidos. Apenas o canal de
teste protegido é implementado; nenhum e-mail externo é enviado.

## RF-009 Avaliar compra verificada

**Atores:** Cliente. **Pré-condição:** Pedido entregue com unidade mantida da edição.

**Validações:** Uma avaliação por cliente/edição/pedido; troca não cria outra; devolução integral da edição oculta e impede nova; edição de ocultada aguarda moderação.

**Rastreabilidade:** UC-009; RN-025, RN-032; TEST-009; TASK-013, TASK-023, TASK-026, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-009.01 | GET | /editions/{id}/reviews | paginação | avaliações visíveis verificadas | 200 |
| API-009.02 | POST | /editions/{id}/reviews | orderId, nota, comentário | avaliação por edição/pedido | 201; 403 inelegível; 409 duplicada |
| API-009.03 | PATCH | /me/reviews/{id} | nota, comentário | avaliação atualizada | 200 |
| API-009.04 | DEPRECATED | /me/reviews/{id} (DELETE antigo) | N/A | Exclusão pelo autor não especificada no PDF; não implementar sem decisão | N/A |

Wire de avaliações (TASK-013): rating inteiro 1–5; comment texto não vazio até
4000 caracteres. POST recebe apenas orderId/rating/comment; PATCH recebe
revision/rating/comment, com revision inteira positiva. Uma compra/edição/cliente
tem um ID estável e versões crescentes. 409 REVIEW_ALREADY_EXISTS ou
REVIEW_REVISION_CONFLICT; 403 REVIEW_NOT_ELIGIBLE; 503 REVIEW_PURCHASE_UNAVAILABLE
quando a porta real não pode comprovar entrega/unidade mantida. Nenhuma chave
HTTP/env seleciona fixture. OrderId é vínculo lógico até TASK-023, sem tabela
de pedidos criada neste incremento. Retorno/pós-venda automático permanece 026.

GET público aceita page/pageSize (1/20, máximo 100) e retorna
`{items,page,pageSize,total,summary:{count,average}}`; average nula sem avaliação.
Somente PUBLIC entra na lista/média. Item público contém id/authorName (primeiro
nome)/rating/comment/createdAt/updatedAt, sem e-mail, compra, IDs de conta ou
histórico. Cliente usa GET /me/reviews, com paginação e editionId/visibility
opcionais, para localizar/editar as próprias avaliações; item privado acrescenta
editionId/editionTitle/orderId/version/visibility/awaitingModeration/hiddenReason.
Leituras públicas dos clientes omitem credenciais. Comentário é texto, sem HTML.

## RF-010 Manter carrinho e iniciar reserva

**Atores:** Visitante no carrinho; cliente no checkout. **Pré-condição:** Catálogo disponível; checkout exige conta apta e menos de 3 pendentes.

**Validações:** Carrinho não reserva; mescla avisada ao login; checkout único de 15 minutos reserva todos ou nenhum; outra aba retoma mesmo prazo.

**Rastreabilidade:** UC-010; RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-028, RN-032, RN-035; TEST-010; TASK-016, TASK-017, TASK-018, TASK-023, TASK-033, TASK-034.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-010.01 | GET | /me/cart | sessão | itens, preços atuais e revisão; sem reserva por item | 200 |
| API-010.02 | POST | /me/cart/items | offerId, quantity, revisão | carrinho atualizado sem reservar | 201; 409 revisão |
| API-010.03 | PATCH | /me/cart/items/{id} | quantity, revisão | carrinho; checkout anterior encerrado se houver alteração | 200; 409 revisão |
| API-010.04 | DELETE | /me/cart/items/{id} | id próprio, revisão | carrinho; encerra checkout afetado | 200 |
| API-010.05 | DELETE | /me/cart/items | sessão | carrinho vazio | 200 |
| API-010.06 | POST | /me/cart/merge | itens do visitante, revisão | carrinho mesclado e avisos de ajuste | 200; 409 estado/versão; 422 dados |
| API-010.07 | POST | /checkouts | revisão confirmada, cupom opcional | checkout único, snapshots, expiresAt, serverTime | 201; 409 saldo/limite de 3/valores |
| API-010.08 | GET | /me/checkout | sessão | checkout ativo e tempo restante | 200; 404 sem ativo |
| API-010.09 | DELETE | /checkouts/{id} | id próprio | checkout encerrado e reservas liberadas | 204 |

Detalhamento wire de RF-010 (TASK-016): revisão de carrinho é `version` inteira
positiva. GET /me/cart aceita `couponCode` opcional para prévia de descontos;
retorna itens atuais, problemas de disponibilidade/preço, `pricing` com status
READY/revision/quote ou UNAVAILABLE/code/message, e serverTime. A revisão de
preço representa os valores canônicos confirmados, sem reserva ou garantia.
POST de item/merge exige Idempotency-Key; merge recebe `{version,items:[{offerId,
quantity}]}`; mutações retornam `{cart,warnings}`. Novos somam até saldo
disponível, usados não duplicam, indisponíveis são avisados. PATCH de item usa
`{version,quantity}`, DELETE individual usa query `version`; limpar não reserva.

POST /checkouts recebe `{version,pricingRevision,couponCode?}` e exige
Idempotency-Key. Retorna recurso imutável com status/version, itens/snapshots,
quote, createdAt/expiresAt/serverTime. Uma retomada mantém ID e deadline; trocar
cupom encerra o anterior e exige revisão atual, sem recuperar hold antigo se a
nova validação falhar. GET /me/checkout não cria/renova; DELETE é próprio e
idempotente. Erros 409 CART_VERSION_CONFLICT/PRICE_CONFIRMATION_REQUIRED/
INSUFFICIENT_STOCK/COUPON_LIMIT_REACHED/PENDING_ORDER_LIMIT; 503
PENDING_ORDERS_UNAVAILABLE. Quantidades/linhas/payload inválidos são 422.
Frete/CEP/pedido/pagamento e endpoint RF-011.03 não são antecipados.

Contexto de comando dos novos clientes (TASK-017): X-Garimpo-Account opcional
deve ser o UUID da própria conta autenticada. Divergência retorna 403
ACCOUNT_CONTEXT_CHANGED antes de interpretar o corpo. Não autentica nem concede
papel/propriedade; apenas vincula a intenção anterior ao refresh/troca de conta.
O carrinho envia esse contexto em leituras/mutações e preserva a mesma chave e
corpo em repetição. Mescla local só é consumida após sucesso real; erro de rede
retém intenção para replay, erro confirmado de revisão exige nova conferência.

## RF-011 Cotar e criar pedido

**Atores:** Visitante para frete; cliente para pedido. **Pré-condição:** Checkout válido, e-mail confirmado e endereço atendido para pedido.

**Validações:** Cotação por CEP inclui cobertura; congela produtos/descontos no checkout; cria pedido Pix/boleto com novo prazo próprio; snapshots e cupom não se perdem.

**Rastreabilidade:** UC-011; RN-002, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-013, RN-014, RN-016, RN-017, RN-018, RN-032, RN-033; TEST-011; TASK-018, TASK-020, TASK-033, TASK-034.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-011.01 | POST | /checkout/quote | itens ou checkoutId, CEP/endereço, cupom | preços, frete/cobertura, prazos e revisão; visitante permitido | 200; 422 CEP/cupom; 409 revisão |
| API-011.02 | POST | /orders | checkoutId, método PIX/BOLETO, endereço e frete aceitos, chave | pedido pendente; Pix 30min/boleto 2 dias; cobrança ativa | 201; 403 e-mail não confirmado; 409 prazo/saldo |
| API-011.03 | PATCH | /checkouts/{id}/address | endereço próprio e revisão de frete aceita | frete recalculado; prazo original preservado | 200; 422 não atendido |

Detalhamento RF-011/RF-029 (TASK-018): POST /checkout/quote aceita exatamente
`{items:[{offerId,quantity}],zip,couponCode?}` público ou `{checkoutId,addressId}`
próprio autenticado. Até 100 ofertas distintas/1000 unidades e JSON 32KiB. Público
não cria carrinho/reserva nem garante utilização de cupom/saldo/preço. Privado
usa produtos/descontos congelados. Retorna quote/freight/freightRevision/totalCents/
serverTime/checkout (id/version/expiresAt, null no público). Frete servido contém
served=true, zip/rateId/rateVersion/region/amountCents/deliveryDays; não servido
contém served=false, zip/reason NO_RATE ou NOT_SERVED/region, totalCents=null,
sem valor/prazo fictício. Revisão SHA-256 canônica vincula configuração e endereço
completo; revisão pública por CEP não aceita endereço privado.

PATCH /checkouts/{id}/address recebe `{version,addressId,freightRevision}` e
retorna CheckoutView com freight aceito e versão incrementada. Mantém os produtos,
preços e deadline original. 409 FREIGHT_CONFIRMATION_REQUIRED ou
CHECKOUT_VERSION_CONFLICT; 422 ZIP_NOT_SERVED conserva checkout vivo. Prazo é
revalidado após lock; vencido encerra sem trocar endereço nem criar pedido.

POST /orders recebe `{checkoutId,version,addressId,freightRevision,method}`
PIX/BOLETO e Idempotency-Key no cabeçalho. Retorna OrderCreationView com snapshots,
unidades/líquidos e cobrança inicial ACTIVE, sem aprovação ou código de pagamento
fictício. Simulador é TASK-019. Mesmo corpo/chave recupera o mesmo pedido após
reinício; outra chave não reconverte checkout usado. Conta apta/e-mail confirmado
antes do primeiro pedido, endereço próprio/aceite atual e limite real de três
pendentes são verificados na transação. Transferência, consumo de cupom, unidades,
cobrança, limpeza de carrinho, auditoria/outbox e recibo são atômicos. Prazo novo:
Pix 30 minutos, boleto 48 horas da criação. Cartão/approved/valores do cliente
são rejeitados. Preservar as guardas cookie/CSRF/origem e bearer sem cookies,
incluindo X-Garimpo-Account opcional restritivo. Cotação pública é leitura;
variante privada requer guardas de cliente autenticado.

GET /admin/freight-rates pagina page/pageSize (máximo 100). POST recebe
`{region,served,amountCents,deliveryDays,ranges:[{startZip,endZip}]}`; PATCH
parcial exige version. Somente ADMIN/web, revalidado em transação e antes do
parser. Até 100 faixas inclusivas por configuração, CEP oito dígitos ou
NNNNN-NNN normalizado. Atendido exige preço positivo e prazo inteiro 0–3650
informado pelo ADMIN; não atendido exige ambos null. São limites de recurso,
não preço/prazo de operação presumido. Interseção retorna 409
FREIGHT_RANGE_CONFLICT; versão obsoleta 409 FREIGHT_VERSION_CONFLICT. Tabela
vazia significa não atendimento; pedido criado conserva snapshots anteriores.

## RF-012 Simular pagamentos

**Atores:** Cliente e simulador. **Pré-condição:** Checkout para cartão; cobrança ativa para Pix/boleto.

**Validações:** Recusa de cartão não cria pedido; Pix 30 min/boleto 2 dias; tardio estorna sem reativar; cobrança substituída nunca quita; falha de estorno permanece visível.

**Rastreabilidade:** UC-012; RN-010, RN-011, RN-012, RN-013, RN-017, RN-028, RN-032, RN-033, RN-039, RN-041; TEST-012; TASK-019, TASK-020, TASK-023, TASK-025, TASK-033, TASK-034.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-012.01 | POST | /orders/{id}/simulated-payments | chargeId ativo, resultado simulado, chave | tentativa, pedido e eventual estorno | 200; 409 estado; 403 sem permissão |
| API-012.02 | POST | /checkouts/{id}/simulated-card-payments | cenário simulado, chave | recusa sem pedido ou pedido pago; tardio gera estorno | 200; 409 estado/versão; 422 dados |
| API-012.03 | LOCAL | simulator payment-event | chargeId ou attemptId, eventId, resultado | efeito idempotente; estorno se tardio/invalidado | sucesso/falha auditados |

## RF-013 Acompanhar pedidos

**Atores:** Cliente. **Pré-condição:** Conta ativa e pedido próprio.

**Validações:** Exibe em separação, separado, envio, entrega, cobranças/estornos e rastreio manual; datas reais registradas, não estimadas.

**Rastreabilidade:** UC-013; RN-015, RN-032, RN-033; TEST-013; TASK-021, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-013.01 | GET | /me/orders | paginação, filtros de estado | pedidos próprios | 200 |
| API-013.02 | GET | /me/orders/{id} | id próprio | snapshots, tentativas, etapas e solicitações | 200 |

## RF-014 Cancelar pedidos e unidades indisponíveis

**Atores:** Cliente; equipe para indisponibilidade. **Pré-condição:** Pedido pendente/pago antes de em separação para cancelamento direto.

**Validações:** Cancelamento permitido libera estoque/cupom uma vez; pago estorna; indisponibilidade parcial preserva restantes e vencimento; parcial não recupera cupom/frete.

**Rastreabilidade:** UC-014; RN-011, RN-017, RN-019, RN-032, RN-039, RN-041; TEST-014; TASK-019, TASK-022, TASK-025, TASK-028, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-014.01 | POST | /orders/{id}/cancellations | motivo, chave | cancelamento direto somente PENDING/PAID antes de PREPARING | 201; 409 utilizar devolução |
| API-014.02 | DEPRECATED | /admin/cancellations/{id}/decision | N/A | Pedido em separação usa RF-015; não implementar antiga aprovação de cancelamento | N/A |
| API-014.03 | POST | /admin/orders/{id}/unavailable-units | unidades, motivo, revisão | cancelamento parcial/integral; cobrança substituída ou estorno | 200; 409 estado/versão; 422 dados |
| API-014.04 | POST | /admin/refunds/{id}/retry | motivo, chave | nova tentativa; ADMIN, inclusive pós-venda | 200; 409 estado/versão; 422 dados |

## RF-015 Processar devoluções

**Atores:** Cliente; ADMIN/OPERATOR. **Pré-condição:** Unidades elegíveis na janela ou devolução antes de envio.

**Validações:** Parcial estorna líquido; integral inclui frete; postagem em 7 dias; exceção só ADMIN; estorno pós-venda só ADMIN; evidências privadas; rejeitado não volta ao estoque.

**Rastreabilidade:** UC-015; RN-018, RN-019, RN-020, RN-021, RN-028, RN-032, RN-034, RN-040, RN-041, RN-045; TEST-015; TASK-026, TASK-028, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-015.01 | POST | /orders/{id}/returns | itens com orderItemId e quantity, motivo, Idempotency-Key | solicitação aberta | 201; 409 quantidade; 422 janela |
| API-015.02 | GET | /me/returns/{id} | id próprio | solicitação e estornos | 200 |
| API-015.03 | POST | /admin/returns/{id}/decision | APPROVE/REJECT, motivo | decisão | 200 |
| API-015.04 | POST | /admin/returns/{id}/receipt | unidades recebidas, resultado da inspeção, evidências | inspeção e aptidão; estorno aguarda autorização ADMIN | 200; 409 estado/quantidade |
| API-015.05 | POST | /returns/{id}/posting | rastreio, data; cliente ou equipe com interação externa | postagem registrada no prazo | 200; 409 estado/versão; 422 dados |
| API-015.06 | POST | /admin/returns/{id}/refund-authorization | unidades, motivo, chave; ADMIN | estorno autorizado e tentativa registrada | 200; 409 estado/versão; 422 dados |
| API-015.07 | POST | /admin/aftersales/{id}/posting-extension | novo prazo e justificativa; ADMIN | exceção auditada | 200; 409 estado/versão; 422 dados |
| API-015.08 | POST | /admin/aftersales/{id}/rejected-shipment | rastreio e data | reenvio de rejeitado sem reposição | 200; 409 estado/versão; 422 dados |
| API-015.09 | POST | /admin/aftersales/{id}/rejected-delivery | data de entrega | reenvio concluído | 200; 409 estado/versão; 422 dados |
| API-015.10 | POST | /aftersales/{id}/evidence | imagem, origem cliente/equipe | evidência privada; limites 5+5 | 201; 413 tamanho; 415 tipo; 403 acesso |
| API-015.11 | GET | /aftersales/{id}/evidence/{imageId} | sessão de proprietário/equipe | bytes ou URL temporária privada | 200; 403 acesso |
| API-015.12 | POST | /admin/aftersales/{id}/inspection-exception | justificativa e decisão; ADMIN | exceção auditada | 200; 409 estado/versão; 422 dados |

## RF-016 Processar trocas

**Atores:** Cliente; ADMIN/OPERATOR. **Pré-condição:** Unidades elegíveis e mesma edição para substituto.

**Validações:** Espera 30 dias após conferência, oferta 48h completas; aceite necessário; envio após inspeção; falha/expiração libera reserva; conversão não autoriza estorno; substituto inicia nova janela.

**Rastreabilidade:** UC-016; RN-020, RN-022, RN-023, RN-028, RN-032, RN-034, RN-035, RN-040, RN-041, RN-045; TEST-016; TASK-027, TASK-028, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-016.01 | POST | /orders/{id}/exchanges | itens/quantidades, motivo, Idempotency-Key | solicitação | 201; 422 janela |
| API-016.02 | GET | /me/exchanges/{id} | id próprio | estado e substitutos | 200 |
| API-016.03 | POST | /admin/exchanges/{id}/decision | APPROVE/REJECT, motivo | decisão; substituto ofertado por operação própria | 200 |
| API-016.04 | POST | /admin/exchanges/{id}/receipt | recebidos, conferência, motivo | estado após inspeção | 200 |
| API-016.05 | POST | /admin/exchanges/{id}/shipment | dados demonstrativos de envio | envio registrado | 200; 409 não conferido |
| API-016.06 | POST | /admin/exchanges/{id}/delivery | confirmação de entrega | troca concluída | 200 |
| API-016.07 | POST | /admin/exchanges/{id}/cancel | motivo, Idempotency-Key | cancelamento e liberação do substituto | 200 |
| API-016.08 | POST | /admin/exchanges/{id}/substitute-offers | offerId da mesma edição, justificativa equivalência | oferta e reserva com 48h completas | 200; 409 estado/versão; 422 dados |
| API-016.09 | POST | /exchanges/{id}/substitute-offers/{offerId}/response | ACCEPT/REJECT; dono ou equipe via interação externa | aceite mantém reserva; recusa libera | 200; 409 estado/versão; 422 dados |
| API-016.10 | POST | /exchanges/{id}/convert-to-return | motivo; dono/equipe | devolução vinculada; estorno ainda depende de ADMIN | 200; 409 estado/versão; 422 dados |
| API-016.11 | POST | /exchanges/{id}/posting | rastreio e data; dono/equipe | postagem registrada | 200; 409 estado/versão; 422 dados |
| API-016.12 | LOCAL | exchange reconcile | relógio servidor e solicitações | expira oferta/postagem e converte espera, respeitando oferta além do dia 30 | sucesso/falha auditados |

## RF-017 Administrar catálogo e imagens

**Atores:** ADMIN/OPERATOR. **Pré-condição:** Conta interna ativa.

**Validações:** Publicação valida campos/fotos mínimos; suporta artistas por faixa e anos distintos; histórico impede exclusão; inativação preserva reservas existentes; limites de imagem aplicados.

**Rastreabilidade:** UC-017; RN-001, RN-004, RN-005, RN-026, RN-027, RN-032, RN-036, RN-045; TEST-017; TASK-008, TASK-009, TASK-023, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-017.01 | GET | /admin/editions | filtros/paginação inclusive inativos | catálogo administrativo | 200 |
| API-017.02 | POST | /admin/editions | título, artistas, gêneros/principal, formato, anos separados, faixas/artistas/áudio | edição; publicação exige imagem e campos mínimos | 201; 422 mínimos |
| API-017.03 | PATCH | /admin/editions/{id} | metadados permitidos | edição atualizada | 200 |
| API-017.04 | POST | /admin/editions/{id}/offers | NEW/USED, priceCents, condição, estoque inicial | oferta/exemplar | 201 |
| API-017.05 | PATCH | /admin/offers/{id} | preço, classificação, metadados próprios | oferta atualizada | 200; 409 revisão |
| API-017.06 | POST | /admin/offers/{id}/images | arquivo imagem, descrição, ordem | imagem registrada | 201; 413 tamanho; 415 tipo |
| API-017.07 | DELETE | /admin/images/{id} | id | sem corpo | 204 |
| API-017.08 | POST | /admin/offers/{id}/inactivate | motivo | oferta impede novas compras e preserva reservas existentes | 200 |
| API-017.09 | DELETE | /admin/offers/{id} | id | sem corpo | 204; 409 histórico/reserva |
| API-017.10 | POST | /admin/editions/{id}/inactivate | motivo | edição inativa preservando reservas/pedidos | 200 |
| API-017.11 | DELETE | /admin/editions/{id} | id | sem corpo | 204; 409 dependências históricas |
| API-017.12 | GET | /admin/catalog-metadata | tipo artist/genre/label | metadados | 200 |
| API-017.13 | POST | /admin/catalog-metadata | tipo, nome e dados | metadado | 201 |
| API-017.14 | PATCH | /admin/catalog-metadata/{type}/{id} | nome e dados permitidos | metadado | 200 |
| API-017.15 | DELETE | /admin/catalog-metadata/{type}/{id} | tipo, id sem vínculos | sem corpo | 204; 409 vinculado |
| API-017.16 | POST | /admin/editions/{id}/images | imagem, descrição, ordem | imagem da edição; até 10 | 201; 413 tamanho; 415 tipo |
| API-017.17 | GET | /admin/editions/{id} | id, sessão web de equipe | detalhe administrativo, incluindo rascunho/inativo para edição | 200; 404 ausente |

## RF-018 Controlar estoque

**Atores:** ADMIN/OPERATOR. **Pré-condição:** Oferta cadastrada.

**Validações:** Saldo nunca negativo; usado individual; ajuste não invade reservas; avaria resolve vínculo; limiar de novos por edição e zero usados alertam apenas no painel.

**Rastreabilidade:** UC-018; RN-001, RN-004, RN-006, RN-013, RN-019, RN-021, RN-022, RN-024, RN-027, RN-032, RN-035, RN-038, RN-039; TEST-018; TASK-009, TASK-016, TASK-019, TASK-023, TASK-025, TASK-026, TASK-027, TASK-033, TASK-034.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-018.01 | GET | /admin/stock | filtros/lowStock | físico, reservado, disponível, movimentos | 200 |
| API-018.02 | POST | /admin/offers/{id}/stock-adjustments | delta inteiro, motivo, Idempotency-Key | saldo e movimento | 201; 409 invade reserva; 422 quantidade |
| API-018.03 | PATCH | /admin/editions/{id}/low-stock | limiar de novos inteiro não negativo | limiar por edição; usado alerta em zero | 200; 409 estado/versão; 422 dados |

## RF-019 Administrar promoções e cupons

**Atores:** ADMIN. **Pré-condição:** Configuração válida.

**Validações:** Menor promoção vence; cupom pode acumular se autorizado; restrições por produto/edição/gênero; reserva no checkout respeita limites concorrentes; devolução não restitui uso.

**Rastreabilidade:** UC-019; RN-008, RN-016, RN-017, RN-018, RN-032; TEST-019; TASK-014, TASK-016, TASK-018, TASK-019, TASK-023, TASK-033, TASK-034.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-019.01 | GET | /admin/coupons | paginação | cupons e usos | 200 |
| API-019.02 | POST | /admin/coupons | code, type, amount, validity, minimumEligible, limits, allowPromotional, targets | cupom e elegibilidade | 201 |
| API-019.03 | PATCH | /admin/coupons/{id} | campos permitidos, active | cupom atualizado | 200 |
| API-019.04 | GET | /admin/promotions | filtros | promoções | 200 |
| API-019.05 | POST | /admin/promotions | ofertas, desconto, validade | promoção | 201 |
| API-019.06 | PATCH | /admin/promotions/{id} | campos permitidos, active | promoção atualizada | 200 |

Wire de preços (TASK-014): type PERCENT/FIXED; amount em basis points inteiros
(100 = 1%, até 10000) ou centavos, respectivamente. startsAt/endsAt são instantes
ISO UTC, intervalo início inclusivo/fim exclusivo; name da promoção identifica-a
no painel. Promotion recebe offerIds; Coupon recebe code, minimumEligibleCents
(padrão 0), totalLimit/perUserLimit anuláveis, allowPromotional (padrão false),
targets e active. Cada alvo é `{kind:OFFER|EDITION|GENRE,id}`; união entre alvos,
vazio cobre todos. Code normalizado A–Z/0–9/_/- (3–40), único e imutável depois
de criado. PATCH exige version e ao menos um campo permitido. Alteração de alvo
é substituição atômica. GET aceita page/pageSize (1/20, máximo 100), active
opcional, e retorna `{items,page,pageSize,total}`; os itens trazem version,
período, alvos/ofertas identificados por rótulo e uso NOT_INTEGRATED até o ledger
real. 409 para código duplicado/versão alterada; 422 para dados/intervalos/alvos
inválidos; ADMIN web/origem/CSRF obrigatórios, OPERATOR/cliente/mobile negados.

Catálogo público conserva seu contrato de priceCents, agora preço promocional
efetivo; minPrice/maxPrice e conservação/disponibilidade correspondem à mesma
oferta. Preço-base administrativo permanece inalterado. Descontos usam inteiros,
fração de centavo truncada e preço não negativo; promoções não somam. A cotação
interna rateia cupom por maiores restos/ID estável, sem incluir frete nem criar
uso/reserva; reservas/consumo/limites concorrentes pertencem a TASK-016/018.

## RF-020 Administrar logística e atendimentos

**Atores:** ADMIN/OPERATOR. **Pré-condição:** Pedido pago ou atendimento autorizado.

**Validações:** Estado em separação bloqueia cancelamento direto; remessa original única; retorno/substituto têm rastreios próprios; interação externa de bloqueado fica auditada.

**Rastreabilidade:** UC-020; RN-001, RN-015, RN-019, RN-023, RN-032, RN-040; TEST-020; TASK-021, TASK-025, TASK-026, TASK-027, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-020.01 | GET | /admin/orders | período/estado/cliente | pedidos com tentativas e estornos | 200 |
| API-020.02 | GET | /admin/orders/{id} | id | detalhes administrativos | 200 |
| API-020.03 | PATCH | /admin/orders/{id}/status | PREPARING/SEPARATED/SHIPPED/DELIVERED, revisão, rastreio quando aplicável | estado/evento e remessa original | 200; 409 transição |
| API-020.04 | POST | /admin/aftersales/external-interactions | cliente, e-mail cadastrado, decisão comunicada, data e vínculo | registro auditado e ação permitida em nome do cliente | 200; 409 estado/versão; 422 dados |

## RF-021 Consultar e administrar clientes

**Atores:** ADMIN; OPERATOR somente consulta. **Pré-condição:** Conta interna ativa.

**Validações:** OPERATOR não altera/bloqueia; ADMIN bloqueia login, checkout e pendentes atomicamente, preservando pagos e atendimento; correção de e-mail exige confirmação.

**Rastreabilidade:** UC-021; RN-001, RN-028, RN-032; TEST-021; TASK-022, TASK-023, TASK-033, TASK-034.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-021.01 | GET | /admin/customers | busca/paginação | cadastros limitados ao necessário | 200 |
| API-021.02 | GET | /admin/customers/{id} | id | cadastro e pedidos | 200 |
| API-021.03 | POST | /admin/customers/{id}/block | motivo, Idempotency-Key | bloqueio e pendências canceladas | 200 |
| API-021.04 | POST | /admin/customers/{id}/unblock | motivo | estado desbloqueado | 200 |
| API-021.05 | PATCH | /admin/customers/{id} | campos permitidos; ADMIN | perfil corrigido; novo e-mail gera confirmação | 200; 409 estado/versão; 422 dados |

## RF-022 Moderar avaliações

**Atores:** ADMIN/OPERATOR. **Pré-condição:** Avaliação existente.

**Validações:** Ocultar preserva histórico; edição pelo autor não desfaz moderação; liberação explícita revalida elegibilidade de compra.

**Rastreabilidade:** UC-022; RN-001, RN-025, RN-032; TEST-022; TASK-013, TASK-026, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-022.01 | GET | /admin/reviews | filtros/paginação | avaliações incluindo ocultas | 200 |
| API-022.02 | POST | /admin/reviews/{id}/hide | motivo | avaliação oculta | 200 |
| API-022.03 | POST | /admin/reviews/{id}/release | motivo, revisão | avaliação liberada se compra ainda elegível | 200; 409 estado/versão; 422 dados |

Moderação usa `{revision,reason}` (motivo não vazio, até 500 caracteres) tanto
em hide quanto em release; o cliente envia a versão que examinou. GET da equipe
aceita page/pageSize/editionId/visibility, mesmo envelope da lista privada.
GET /admin/reviews/{id}/history retorna itens por version ascendente com
rating/comment/visibility/awaitingModeration/action/reason/actorName/createdAt.
Histórico é imutável também no PostgreSQL. Edição pelo autor de conteúdo HIDDEN
mantém esse estado e marca awaitingModeration; só a equipe libera a revisão
atual, revalidando elegibilidade na mesma transação. ADMIN/OPERATOR por sessão
web/origem/CSRF; mobile não administra. Cliente não lê histórico nem lista
alheia. Composer recebe contexto da compra entregue do fluxo de pedido futuro;
não pede UUID técnico ao usuário nem inventa compra para liberar publicação.

## RF-023 Consultar relatórios

**Atores:** ADMIN. **Pré-condição:** Eventos comerciais registrados.

**Validações:** Pagamento setembro/estorno outubro ficam em períodos próprios; ticket setembro usa líquido atualizado; gênero principal evita duplicação; unidades gratuitas mantidas contam; troca não é venda nova.

**Rastreabilidade:** UC-023; RN-018, RN-021, RN-030, RN-032, RN-034; TEST-023; TASK-029, TASK-033, TASK-034.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-023.01 | GET | /admin/reports/sales | from, to, asOf | eventos financeiros no período e ticket da coorte separados | 200; 422 intervalo |
| API-023.02 | GET | /admin/reports/genres | from, to, asOf | ranking de gênero principal sem duplicação | 200 |
| API-023.03 | GET | /admin/reports/products | from, to | ranking de edições por giro líquido | 200 |

## RF-024 Processar notificações de teste

**Atores:** Processo técnico; titular como destinatário. **Pré-condição:** Evento de acesso/comercial ou reposição.

**Validações:** Todos os eventos de RN-042 geram mensagens; falha não bloqueia negócio; repetição é auditada; conteúdo de acesso e evidências não é público.

**Rastreabilidade:** UC-024; RN-003, RN-024, RN-032, RN-033, RN-042; TEST-024; TASK-005, TASK-012, TASK-019, TASK-021, TASK-025, TASK-026, TASK-027, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-024.01 | GET | /demo/messages | credencial separada, destinatário/tipo | mensagens fictícias restritas | 200; 403 ambiente/acesso |
| API-024.02 | GET | /demo/messages/{id} | credencial separada | mensagem restrita | 200 |

## RF-025 Executar backup e restaurar

**Atores:** Operação técnica. **Pré-condição:** Ambiente e parâmetros definidos.

**Validações:** Backup diário automático; recuperação testada periodicamente; política de retenção/destino não inventada; restauração de teste preserva origem.

**Rastreabilidade:** UC-025; RN-031, RN-032; TEST-025; TASK-030, TASK-035.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-025.01 | LOCAL | backup daily | configuração aprovada | conjunto consistente, retenção configurada e resultado | sucesso/falha; sem rota pública |
| API-025.02 | LOCAL | restore verify | conjunto completo, destino separado | relatório de comparação de dados/fotos | sucesso/falha; sem rota pública |

## RF-026 Gerenciar contas internas

**Atores:** ADMIN. **Pré-condição:** Administrador ativo.

**Validações:** Criar/editar/bloquear ADMIN/OPERATOR; impedir remoção do último ADMIN ativo; contas internas não compram; e-mail alterado só após confirmar novo.

**Rastreabilidade:** UC-026; RN-001, RN-029, RN-032, RN-044; TEST-032; TASK-004, TASK-005, TASK-006, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-026.01 | GET | /admin/staff | filtros | contas internas | 200; 409 estado/versão; 422 dados |
| API-026.02 | POST | /admin/staff | nome, e-mail, papel ADMIN/OPERATOR, convite/credencial conforme ADR | conta interna | 200; 409 estado/versão; 422 dados |
| API-026.03 | PATCH | /admin/staff/{id} | campos e papel permitidos | conta atualizada | 200; 409 estado/versão; 422 dados |
| API-026.04 | POST | /admin/staff/{id}/block | motivo | bloqueio exceto último ADMIN | 200; 409 estado/versão; 422 dados |
| API-026.05 | POST | /admin/staff/{id}/deactivate | motivo | inativação exceto último ADMIN | 200; 409 estado/versão; 422 dados |
| API-026.06 | POST | /admin/staff/{id}/unblock | motivo | conta desbloqueada | 200; 409 estado/versão; 422 dados |

## RF-027 Encerrar e reativar conta

**Atores:** Cliente. **Pré-condição:** Conta própria; reativação somente encerrada sem bloqueio.

**Validações:** Encerrar revoga acesso, cancela checkout/pendentes e preserva pagos/histórico; reativação confirma e-mail; bloqueio prevalece; retenção permanece pendente.

**Rastreabilidade:** UC-027; RN-032, RN-043; TEST-033; TASK-022, TASK-023, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-027.01 | POST | /me/closure | confirmação e chave | conta encerrada, pendências liberadas | 200; 409 estado/versão; 422 dados |
| API-027.02 | POST | /auth/reactivation | e-mail | resposta genérica e link se elegível | 202 |
| API-027.03 | POST | /auth/reactivation/confirm | token | conta reativada se sem bloqueio | 200; 409 estado/versão; 422 dados |

## RF-028 Confirmar e alterar e-mail

**Atores:** Titular; ADMIN inicia correção. **Pré-condição:** Token apropriado ou conta autorizada.

**Validações:** Confirmação inicial em 24h com reenvio; primeiro pedido exige confirmação; alteração mantém endereço anterior até confirmar novo; unicidade validada.

**Rastreabilidade:** UC-028; RN-002, RN-032, RN-044; TEST-034; TASK-004, TASK-005, TASK-006, TASK-022, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-028.01 | POST | /auth/email-verification | e-mail | reenvio genérico; link inicial 24h | 202 |
| API-028.02 | POST | /auth/email-verification/confirm | token | e-mail confirmado | 200; 409 estado/versão; 422 dados |
| API-028.03 | POST | /me/email-change | novo e-mail | solicitação; antigo permanece ativo | 202 |
| API-028.04 | POST | /auth/email-change/confirm | token | novo endereço confirmado e substituído | 200; 409 estado/versão; 422 dados |

## RF-029 Configurar frete e cobertura

**Atores:** ADMIN. **Pré-condição:** Tabela de faixas sem sobreposição ambígua.

**Validações:** Somente ADMIN altera valores/prazos/cobertura; faixas podem ser não atendidas; edição da tabela não muda snapshot de pedido criado.

**Rastreabilidade:** UC-029; RN-014, RN-032; TEST-035; TASK-018, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-029.01 | GET | /admin/freight-rates | filtros | faixas, cobertura, valores/prazos | 200; 409 estado/versão; 422 dados |
| API-029.02 | POST | /admin/freight-rates | faixa, atendida, preço/prazo | regra versionada sem sobreposição ambígua | 201; 422 faixa/valor |
| API-029.03 | PATCH | /admin/freight-rates/{id} | campos e revisão | regra atualizada sem alterar pedidos | 200; 409 estado/versão; 422 dados |

### Precisões de API-018 e ciclo de vida do catálogo (TASK-009)

Rotas administrativas de estoque reutilizam HTTPS, cookies seguros, origem exata e CSRF ligado à sessão; somente ADMIN/OPERATOR via web. GET /admin/stock aceita editionId, page, pageSize (1–100), lowStock e includeInactive. Histórico traz os últimos 20 movimentos por oferta e movementCount, com saldos anterior/posterior, motivo, responsável, data e versão. POST de ajuste exige Idempotency-Key: repetição não duplica movimento/auditoria/outbox; payload divergente retorna 409. O saldo retornado pode refletir movimentos posteriores ao comando repetido; o movimento identifica o efeito original.

Físico e disponível são conceitos diferentes. A porta CommercialBindings lê reservas/compromissos/histórico dentro da transação do chamador; protectedQuantity inclui reservedQuantity, sem dupla contagem. Antes do adaptador comercial real, o padrão de runtime é UNAVAILABLE: reservado/protegido/disponível desconhecidos são null, jamais zero inventado. Ofertas/edições inativas têm disponível comercial zero. Reduções e exclusões que dependem da consulta retornam 503 COMMERCIAL_BINDINGS_UNAVAILABLE; inativação e entradas seguras continuam possíveis. Snapshot incompleto/inconsistente também falha fechado. Fixtures KNOWN existem exclusivamente nos testes isolados.

Novos alertam quando a soma disponível da edição é menor ou igual ao limiar; usados somente quando a soma disponível é zero, e não por cada exemplar vendido. Sem saldo conhecido, um alerta só é verdadeiro se o próprio limite físico já demonstrar falta; o caso inconclusivo é null. O filtro lowStock seleciona apenas alertas confirmados. Alterar o limiar não envia e-mail nem cria notificação de cliente. Reduções conhecidas não podem ultrapassar o físico livre dos vínculos protegidos (409); estoque negativo ou usado acima de uma unidade é rejeitado. Histórico comercial ou FK de movimento impede exclusão definitiva, preservando inativação. Integrações de reserva, pedido e atendimento permanecem nas tarefas correspondentes.
