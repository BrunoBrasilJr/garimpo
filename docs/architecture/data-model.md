# Modelo inicial de dados

Proposta documental relacional, sem schema executável. PKs geradas pelo servidor, FKs explícitas, dinheiro em centavos e datas com fuso. Entidades mutáveis usam createdAt/updatedAt; eventos/tentativas são append-only. Índices e constraints locais complementam transações, não garantem sozinhos somas entre linhas. Tecnologia concreta depende de ADR-001.

| Tabela | Campos e chaves principais | Cardinalidade/restrições/índices |
| --- | --- | --- |
| User | id PK; name; emailNormalized UNIQUE; passwordHash; context CUSTOMER/STAFF; role USER/ADMIN/OPERATOR; emailVerifiedAt?; blockedAt?; closedAt?; inactiveAt? | 1:N Session/Address/Order; USER exige CUSTOMER; ADMIN/OPERATOR exige STAFF; transação protege último ADMIN |
| Session | id PK; userId FK; credentialHash UNIQUE; expiresAt; revokedAt? | N:1 User; índice userId/expiração; bloqueio/encerramento/reset invalidam acesso |
| PasswordReset | id PK; userId FK; tokenHash UNIQUE; expiresAt; usedAt? | N:1 User; validade 30min; consumo único e revogação global |
| EmailToken | id PK; userId FK; purpose VERIFY/CHANGE/REACTIVATE; pendingEmail?; tokenHash UNIQUE; expiresAt; usedAt? | N:1 User; inicial 24h; CHANGE/REACTIVATE tempos PD-005; endereço anterior permanece até confirmar |
| Address | id PK; userId FK; recipient; zip; region; city; street; number; complement? | N:1 User; proprietário; pedido mantém snapshot independente |
| Artist | id PK; name | N:M Edition/Track via junções; índice name |
| Genre | id PK; name | N:M Edition; gênero principal via Edition.primaryGenreId |
| Label | id PK; name | 1:N Edition; sem exclusão se referenciado |
| Edition | id PK; title; labelId FK?; primaryGenreId FK; originalYear?; editionYear?; format; catalogNumber?; weightGrams?; pressingCountry?; collectorEdition; lowStockNewThreshold; active | 1:N Track/Offer/ProductImage; N:M Artist/Genre; publicar exige artista, gênero principal, formato, título e foto; década usa editionYear |
| EditionArtist | editionId FK; artistId FK; PK composta | Par único; pelo menos um artista para publicação |
| EditionGenre | editionId FK; genreId FK; PK composta | Par único; principal deve pertencer aos gêneros da edição |
| Track | id PK; editionId FK; position; title; durationSeconds?; audioUrl? | N:1 Edition; UNIQUE editionId/position; áudio opcional por faixa |
| TrackArtist | trackId FK; artistId FK; PK composta | N:M; busca inclui participantes da faixa |
| ConditionGrade | code PK; label; rank UNIQUE | Vocabulário Goldmine PD-006; usado exige mídia e capa |
| Offer | id PK; editionId FK; kind NEW/USED; priceCents; discGrade FK?; sleeveGrade FK?; particulars?; stockOnHand; active; version | N:1 Edition; USED quantidade 0/1 e descrição/condições/foto; NEW inteiro não negativo; índice editionId/kind/active |
| ProductImage | id PK; editionId FK?; offerId FK?; storageKey UNIQUE; description; position; contentHash | Dono exclusivo Edition ou Offer; público; 10/edição ou 8/usado; JPEG/PNG/WebP até 5 MB |
| WishlistEntry | userId FK; editionId FK; PK composta | N:M User/Edition; nenhuma reserva automática |
| AvailabilityAlert | id PK; userId FK; editionId FK; kind NEW/USED/ANY; active; activationKey; notifiedAt? | N:1 User/Edition; encerra após sucesso; índice edição/kind/active |
| Review | id PK; userId FK; editionId FK; orderId FK; rating; comment; moderationState; eligibilityHiddenAt? | UNIQUE userId/editionId/orderId; entrega/unidades mantidas validadas; escala PD-006 |
| ReviewRevision | id PK; reviewId FK; authorId FK; rating; comment; moderationReason?; createdAt | N:1 Review; preservar edição; ocultada não republica sem liberação e elegibilidade |
| Cart | id PK; userId FK UNIQUE; version | 1:1 User; 1:N CartItem; visitante pode ser local na proposta |
| CartItem | id PK; cartId FK; offerId FK; quantity; lastSeenPriceCents | UNIQUE cartId/offerId; não possui expiresAt nem reserva |
| Checkout | id PK; userId FK; cartId FK; status; expiresAt; addressId FK?; quoteSnapshot; version | No máximo um ACTIVE por User; prazo único 15min; índice status/expiresAt |
| CheckoutItem | id PK; checkoutId FK; offerId FK; quantity; frozenPrice; promotionSnapshot; unitDiscountAllocation | N:1 Checkout/Offer; reserva do conjunto todos-ou-nenhum |
| Reservation | id PK; offerId FK; checkoutItemId FK?; orderItemId FK?; substituteOfferId FK?; quantity; status; expiresAt? | Dono exclusivo; ACTIVE/CONSUMED/RELEASED/EXPIRED; prazo checkout/pedido; oferta 48h até aceite, depois condicionada a atendimento |
| Order | id PK; userId FK; checkoutId FK; status; method; expiresAt?; addressSnapshot; subtotalCents; discountCents; shippingCents; totalCents; paidAt?; version | N:1 User; 1:N itens/cobranças; PENDING/PAID/PREPARING/SEPARATED/SHIPPED/DELIVERED/CANCELLED; limite 3 pendentes por cliente transacional |
| OrderItem | id PK; orderId FK; offerId FK; editionId FK; quantity; unitPaidAllocation; productSnapshot; primaryGenreSnapshot | N:1 Order; título/condição/valores/ano/gênero históricos; alocação exata em centavos |
| OrderUnit | id PK; orderItemId FK; logicalIndex; netPaidCents; commercialState; currentOfferId FK; deliveredAt? | UNIQUE orderItemId/logicalIndex; identidade comercial preservada através de trocas; ativo de pós-venda único por unidade |
| PaymentCharge | id PK; orderId FK; method PIX/BOLETO; amountCents; status; expiresAt; supersedesId FK? | N:1 Order; uma cobrança ativa; substituição mantém vencimento; índice status/expiresAt |
| PaymentAttempt | id PK; checkoutId FK?; orderId FK?; chargeId FK?; method; result; amountCents; eventKey UNIQUE; receivedAt | Cartão pode preceder pedido; referência checkout ou cobrança obrigatória; tardio não cria/quita; sem cartão real |
| FreightRate | id PK; region; served; amountCents?; deliveryDays?; version | 1:N CepRange; faixas não atendidas não têm cotação válida; valores/prázo PD-004 |
| CepRange | id PK; freightRateId FK; startZip; endZip | N:1 FreightRate; não sobrepor cobertura ambiguamente |
| Promotion | id PK; type; amount; startsAt; endsAt; active | N:M Offer; tipo PD-006; menor preço entre aplicáveis sem somar |
| PromotionOffer | promotionId FK; offerId FK; PK composta | N:M; snapshot no checkout/pedido |
| Coupon | id PK; code UNIQUE; type PERCENT/FIXED; amount; allowPromotional; minimumEligibleCents; totalLimit?; perUserLimit?; startsAt; endsAt; active | N:1 usos/alvos; subtotal elegível após promoção, sem frete |
| CouponTarget | id PK; couponId FK; offerId FK?; editionId FK?; genreId FK? | Alvo tipado exclusivo; política de combinação documentada antes de implementar se ambígua |
| CouponUsage | id PK; couponId FK; userId FK; checkoutId FK UNIQUE; orderId FK UNIQUE?; status | RESERVED no checkout; CONSUMED na criação; RELEASED em expiração/cancelamento; devolução preserva uso |
| CancellationRequest | id PK; orderId FK; actorId FK; reason; status; unitIds; createdAt | Registro de cancelamento direto/indisponibilidade, não antiga aprovação em separação; parcial conserva restantes |
| ReturnRequest | id PK; orderId FK; requesterId FK; status; reason; description; requestedAt; approvedAt?; postingDeadline?; exceptionBy FK? | 1:N ReturnItem; pré-envio permitido; postagem 7 dias; exceção ADMIN |
| ReturnItem | id PK; returnId FK; orderUnitId FK; inspectionResult?; receivedAt?; inspectedAt?; resaleAllowed | N:1 ReturnRequest/OrderUnit; retorno apto pode repor; rejeitado segue reenvio |
| ExchangeRequest | id PK; orderId FK; requesterId FK; status; reason; description; requestedAt; postingDeadline?; waitStartedAt?; waitEndsAt?; convertedReturnId FK? | 30 dias somente após conferência favorável; conversão preserva cadeia |
| ExchangeItem | id PK; exchangeId FK; orderUnitId FK; originalOfferId FK; inspectedAt?; inspectionResult? | N:1 ExchangeRequest/OrderUnit; identidade comercial não muda na substituição |
| SubstituteOffer | id PK; exchangeItemId FK; offerId FK; proposedBy FK; equivalenceReason; offeredAt; responseDeadline; acceptedAt?; status | 48h completas; reserva termina na recusa/expiração ou segue após aceite; mesma edição |
| Shipment | id PK; orderId FK?; returnId FK?; exchangeId FK?; kind ORIGINAL/RETURN/SUBSTITUTE/REJECTED_RESEND; trackingCode; postedAt?; deliveredAt? | Uma ORIGINAL por Order; demais ligadas ao atendimento; datas separadas iniciam janelas corretas |
| Evidence | id PK; returnId FK?; exchangeId FK?; uploaderId FK; origin CUSTOMER/STAFF; storageKey UNIQUE; contentHash | Dono exclusivo; privado; até 5 por origem/atendimento; JPEG/PNG/WebP até 5 MB |
| ExternalInteraction | id PK; userId FK; returnId FK?; exchangeId FK?; actorId FK; channelEmail; communicatedAt; decision; createdAt | N:1 atendimento; representa cliente bloqueado; autorização auditada |
| Refund | id PK; paymentAttemptId FK; orderId FK?; cancellationId FK?; returnId FK?; exchangeId FK?; origin; status; productCents; shippingCents; authorizedBy FK?; completedAt? | Pode existir sem pedido para cartão tardio; PENDING/FAILED/SUCCEEDED; pós-venda exige ADMIN; limite por pagamento recebido |
| RefundItem | id PK; refundId FK; orderUnitId FK; amountCents | N:1 Refund/OrderUnit; unidade comercial estornada uma vez com tentativas no mesmo Refund; tardio não exige unidade |
| RefundAttempt | id PK; refundId FK; attemptKey UNIQUE; result; actorId FK?; createdAt | N:1 Refund; repetir não duplica reembolso; falha não altera cancelamento válido |
| FinancialEvent | id PK; orderId FK?; paymentAttemptId FK?; refundId FK?; type; productCents; shippingCents; occurredAt; eventKey UNIQUE | Append-only; venda no pagamento, estorno no seu instante; não contar recebimento tardio como venda |
| StockMovement | id PK; offerId FK; deltaOnHand; reason; originKey UNIQUE; actorId FK?; createdAt | N:1 Offer; reservar não baixa físico; aprovação consome; inspeção apta repõe |
| OrderStatusEvent | id PK; orderId FK; fromStatus; toStatus; actorId FK?; reason; createdAt | N:1 Order; append-only, transição e registro atômicos |
| DomainEvent | id PK; type; aggregateId; payload; processedAt?; attempts; createdAt | Outbox proposta; todos eventos RN-042; índice processado/data; sem segredo desnecessário |
| DemoMessage | id PK; userId FK?; eventId FK?; tokenRef?; alertId FK?; type; restrictedBody; dedupKey UNIQUE; status; deliveredAt?; attempts | Adaptador de teste local ou serviço; falha não equivale a entrega; conteúdo sensível restrito |
| AuditLog | id PK; actorId FK?; action; targetType; targetId; result; reason; redactedChanges; correlationId; createdAt | Append-only; índice ator/data/alvo; sem senha/token em claro |
| BackupRun | id PK; startedAt; completedAt?; status; manifestKey; manifestHash; errorRedacted? | SUCCESS apenas com conjunto íntegro; política de retenção PD-008 |
| IdempotencyRecord | id PK; actorScope; operation; key; requestHash; resultRef; createdAt | UNIQUE ator/operação/chave; mesmo payload retorna efeito anterior |


## Invariantes entre tabelas

- CartItem nunca possui reserva. CheckoutItem reserva conjunto; transferência para OrderItem é atômica e não libera saldo intermediário.
- OrderUnit preserva unidade comercial e entrega corrente após substituições; não recria venda nem avaliação. Ledger de atendimento deve impedir dois ativos para a mesma unidade entre ReturnItem e ExchangeItem.
- Bloqueio/encerramento serializa com checkout/pagamento; último ADMIN e limite de pendentes exigem coordenação transacional, não apenas validação de interface.
- Refund guarda obrigação; RefundAttempt guarda tentativas. Pagamento tardio sem venda possui estorno por pagamento, não por unidade inexistente. Somente sucesso financeiro gera ajuste realizado; falha mantém pendência visível.
- Estoque reposto exige aptidão física, não simples criação de estorno. Rejeitado fica fora do disponível até decisão e reenvio.
- Review tem chave por pedido/edição/cliente e dois motivos independentes de ocultação: moderação e elegibilidade comercial. Edição não remove nenhum deles implicitamente.
- Exclusão com histórico é impedida. Inativação preserva reservas e históricos. Política de eliminação de bytes/dados depende da retenção, sem apagar referências ainda válidas.
- Frete de devoluções parciais sucessivas que totalizem pedido depende de PD-009; schema não decide silenciosamente essa regra.

## Rastreabilidade

| RF/UC | Entidades principais |
| --- | --- |
| RF-001 / UC-001 | User, EmailToken |
| RF-002 / UC-002 | User, Session |
| RF-003 / UC-003 | User, PasswordReset, Session, DemoMessage |
| RF-004 / UC-004 | User, Address, EmailToken |
| RF-005 / UC-005 | Edition, Artist, Track, TrackArtist, Genre, Offer |
| RF-006 / UC-006 | Edition, Track, Offer, ProductImage |
| RF-007 / UC-007 | WishlistEntry, Edition, User |
| RF-008 / UC-008 | AvailabilityAlert, DomainEvent, DemoMessage, Offer |
| RF-009 / UC-009 | Review, ReviewRevision, OrderItem, OrderUnit |
| RF-010 / UC-010 | Cart, CartItem, Checkout, CheckoutItem, Reservation |
| RF-011 / UC-011 | Checkout, Order, OrderItem, CouponUsage, FreightRate, Reservation |
| RF-012 / UC-012 | PaymentAttempt, PaymentCharge, Checkout, Order, Refund, RefundAttempt |
| RF-013 / UC-013 | Order, OrderItem, OrderStatusEvent, Shipment, Refund |
| RF-014 / UC-014 | CancellationRequest, OrderUnit, PaymentCharge, Refund, StockMovement |
| RF-015 / UC-015 | ReturnRequest, ReturnItem, OrderUnit, Refund, Evidence, Shipment |
| RF-016 / UC-016 | ExchangeRequest, ExchangeItem, SubstituteOffer, OrderUnit, Reservation, Shipment, Evidence |
| RF-017 / UC-017 | Edition, Track, TrackArtist, Offer, ProductImage |
| RF-018 / UC-018 | Offer, StockMovement, Reservation, Edition |
| RF-019 / UC-019 | Promotion, Coupon, CouponTarget, CouponUsage |
| RF-020 / UC-020 | Order, OrderStatusEvent, Shipment, ExternalInteraction |
| RF-021 / UC-021 | User, Session, Checkout, Order, AuditLog |
| RF-022 / UC-022 | Review, ReviewRevision, AuditLog |
| RF-023 / UC-023 | Order, OrderUnit, Refund, FinancialEvent, Genre |
| RF-024 / UC-024 | DomainEvent, DemoMessage, EmailToken |
| RF-025 / UC-025 | BackupRun, ProductImage, Evidence |
| RF-026 / UC-026 | User, Session, EmailToken, AuditLog |
| RF-027 / UC-027 | User, Session, EmailToken, Checkout, Order |
| RF-028 / UC-028 | User, EmailToken, DemoMessage |
| RF-029 / UC-029 | FreightRate, CepRange, AuditLog |

Junções herdam rastreabilidade do agregado. IdempotencyRecord/FinancialEvent suportam RNF-004 e RN-030; AuditLog suporta RNF-005. [ER catálogo](../diagrams/er-catalog.md), [ER comércio](../diagrams/er-commerce.md). Diagramas omitem campos para legibilidade; tabela é o detalhamento.
