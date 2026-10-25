# ER — comércio e pós-venda

RN-007/011/017/022/034/039/041. [Modelo completo](../architecture/data-model.md). Três vistas do mesmo modelo; repetição de entidade não cria outra tabela. FKs opcionais e exclusividade de dono estão no detalhamento.

## Carrinho, checkout, reservas e pedido

```mermaid
erDiagram
  User ||--o| Cart : mantem
  Cart ||--o{ CartItem : contem
  User ||--o{ Checkout : inicia
  Checkout ||--|{ CheckoutItem : congela
  CheckoutItem |o--o{ Reservation : reserva
  OrderItem |o--o{ Reservation : recebe
  Offer ||--o{ Reservation : saldo
  Checkout ||--o| Order : cria
  Order ||--|{ OrderItem : contem
  OrderItem ||--|{ OrderUnit : identifica
  Coupon ||--o{ CouponUsage : limita
  Checkout ||--o| CouponUsage : reserva_uso
  Order |o--o| CouponUsage : consome_uso
```

CartItem não possui reserva. Checkout tem no máximo um ativo por cliente; transferência ao pedido é atômica. Uso de cupom reservado no checkout e consumido na criação do pedido.

## Cobranças, estornos e eventos financeiros

```mermaid
erDiagram
  Order ||--o{ PaymentCharge : cobra
  Checkout |o--o{ PaymentAttempt : cartao
  PaymentCharge |o--o{ PaymentAttempt : recebe
  PaymentAttempt ||--o{ Refund : estorna
  Refund ||--o{ RefundAttempt : tenta
  Refund ||--o{ RefundItem : aloca
  OrderUnit ||--o{ RefundItem : identifica
  Order |o--o{ FinancialEvent : eventos
  Refund |o--o{ FinancialEvent : ajustes
```

PaymentAttempt pode vir de checkout de cartão OU cobrança Pix/boleto. Cartão tardio pode ter Refund sem Order/RefundItem. Tentativa de estorno falha não se torna evento de reembolso concluído.

## Atendimentos, substitutos e remessas

```mermaid
erDiagram
  Order ||--o{ ReturnRequest : devolve
  ReturnRequest ||--|{ ReturnItem : unidades
  OrderUnit ||--o{ ReturnItem : historico
  Order ||--o{ ExchangeRequest : troca
  ExchangeRequest ||--|{ ExchangeItem : unidades
  OrderUnit ||--o{ ExchangeItem : historico
  ExchangeItem ||--o{ SubstituteOffer : oferece
  SubstituteOffer |o--o{ Reservation : reserva
  ReturnRequest |o--o{ Evidence : evidencia
  ExchangeRequest |o--o{ Evidence : evidencia
  Order |o--o{ Shipment : envio_original
  ReturnRequest |o--o{ Shipment : retorno_reenvio
  ExchangeRequest |o--o{ Shipment : retorno_substituto
```

Uma remessa ORIGINAL por pedido; retorno/substituto/rejeitado têm registros separados. Evidência pertence a um atendimento e é privada. Unidade comercial tem vários atendimentos históricos, nunca dois ativos ao mesmo tempo.
