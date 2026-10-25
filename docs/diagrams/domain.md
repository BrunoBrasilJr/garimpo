# Modelo conceitual

RN-004/007/009/025/034. Unidade comercial continua a mesma após trocar o exemplar físico. Carrinho não tem reserva; checkout e ofertas de substituto têm.

```mermaid
classDiagram
  User "1" --> "0..1" Cart : mantem
  Cart "1" --> "0..*" CartItem : contem
  CartItem "*" --> "1" Offer : seleciona
  Edition "1" --> "0..*" Offer : agrupa
  Edition "1" --> "0..*" Track : contem
  User "1" --> "0..*" Checkout : inicia
  Checkout "1" --> "1..*" Reservation : reserva_conjunto
  Reservation "*" --> "1" Offer : protege_saldo
  Checkout "1" --> "0..1" Order : origina
  Order "1" --> "1..*" OrderUnit : preserva_unidades
  Order "1" --> "0..*" PaymentCharge : cobra
  OrderUnit "1" --> "0..*" ExchangeItem : historico
  ExchangeItem "1" --> "0..*" SubstituteOffer : propostas
  SubstituteOffer "1" --> "1" Offer : substituto
  OrderUnit "1" --> "0..*" ReturnItem : historico
  Order "1" --> "0..*" Review : por_edicao
  PaymentAttempt "1" --> "0..*" Refund : pode_estornar
  Refund "1" --> "0..*" RefundAttempt : tenta
```

Checkout tem no máximo um ativo por USER. OrderUnit tem no máximo um atendimento ativo; cardinalidade histórica não implica simultaneidade. Tentativa de cartão pode existir sem Order, permitindo estorno tardio sem criar venda fictícia. Equipe usa contexto STAFF separado.
